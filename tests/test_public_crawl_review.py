"""Read-only checks against a local production build; no broker or trading calls.

Run: REVIEW_BASE_URL=http://127.0.0.1:3100 python3 -m unittest discover -s tests
     -p test_public_crawl_review.py -v
"""
import os
from html.parser import HTMLParser
from pathlib import Path
import unittest
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

ORIGIN = 'https://velarion-one.vercel.app'
BASE = os.environ.get(
    'REVIEW_BASE_URL',
    os.environ.get('COURSE_BOUNDARY_BASE_URL', 'http://127.0.0.1:3217'),
)
ROUTES = ['/', '/how-it-works', '/school-preview', '/risk-and-performance',
          '/why-gold', '/strategies', '/academy', '/tools/growth-calculator',
          '/onboarding', '/legal/terms', '/legal/risk-disclosure',
          '/legal/ib-disclosure', '/legal/privacy', '/legal/complaints']


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.canonicals = []
        self.meta = {}
        self.text = []
        self.hidden = 0
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'style'):
            self.hidden += 1
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonicals.append(attrs.get('href'))
        if tag == 'meta':
            self.meta[attrs.get('name', attrs.get('property'))] = attrs.get('content', '')

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.hidden = max(0, self.hidden - 1)

    def handle_data(self, data):
        if not self.hidden:
            self.text.append(data)


def get(route, headers=None):
    request = urllib.request.Request(BASE + route, headers=headers or {})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read().decode(errors='replace'), response.headers


class PublicCrawlReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not (BASE.startswith('http://127.0.0.1:') or BASE.startswith('http://localhost:')):
            raise RuntimeError('REVIEW_BASE_URL/COURSE_BOUNDARY_BASE_URL must be loopback HTTP')
        if not (Path(__file__).resolve().parents[1] / '.next/BUILD_ID').is_file():
            raise RuntimeError('Production .next/BUILD_ID is required')

    def test_public_canonicals(self):
        for route in ROUTES:
            with self.subTest(route=route):
                page = Page(get(route)[0])
                self.assertEqual(page.canonicals, [ORIGIN + ('' if route == '/' else route)])

    def test_sitemap_has_public_pages_not_sequential_lessons(self):
        root = ET.fromstring(get('/sitemap.xml')[0])
        urls = [node.text for node in root.findall('{*}url/{*}loc')]
        expected = {ORIGIN + ('' if route == '/' else route) for route in ROUTES}
        self.assertEqual(set(urls), expected)
        self.assertFalse(root.findall('{*}url/{*}lastmod'), 'Do not fabricate modification dates')
        self.assertFalse(any('/academy/lesson-' in url for url in urls))

    def test_robots_points_to_current_origin(self):
        robots = get('/robots.txt')[0]
        self.assertIn('Sitemap: ' + ORIGIN + '/sitemap.xml', robots)
        self.assertNotIn('velarionmarkets.com', robots)

    def test_lesson_summary_only_views(self):
        for number in (1, 6):
            route = '/academy/lesson-' + str(number)
            with self.subTest(lesson=number):
                page = Page(get(route)[0])
                text = ' '.join(page.text)
                self.assertIn('Lesson content temporarily unavailable', text)
                self.assertIn('noindex', page.meta.get('robots', ''))
                self.assertIn('noindex', page.meta.get('googlebot', ''))
                self.assertEqual(page.canonicals, [ORIGIN + route])

    def test_risk_example_is_hypothetical_and_arithmetic_is_consistent(self):
        page = Page(get('/risk-and-performance')[0])
        text = ' '.join(page.text)
        self.assertNotIn('Enforces Positive Expectancy', text)
        self.assertIn('$5.60', text)
        self.assertIn('$1.23', text)
        self.assertIn('TODO', text)
        self.assertAlmostEqual(.48 * 5.60 - .52 * 2.80, 1.232)
        self.assertAlmostEqual(118 * .38 - 42 * 5.09, -168.94)

    def test_public_preview_and_common_disclosures(self):
        page = Page(get('/school-preview')[0])
        text = ' '.join(page.text)
        self.assertIn('Leverage and Margin Mechanics', text)
        self.assertNotIn('enable safe $10-$100', text)
        self.assertIn('TODO', text)
        self.assertIn('Kenyan legal review remains a pre-launch requirement', text)
        self.assertIn('IB conflict disclosure', text)
        self.assertIn('separate steps', text)

    def test_invalid_lesson_is_not_a_public_page(self):
        with self.assertRaises(urllib.error.HTTPError) as error:
            get('/academy/not-a-lesson')
        self.assertEqual(error.exception.code, 404)


if __name__ == '__main__':
    unittest.main()
