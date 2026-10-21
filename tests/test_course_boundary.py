"""Containment regressions, NOT an authentication or security certification.

Run against an isolated loopback production frontend with no Python backend or
broker/service configuration. Private fingerprints are derived only in memory;
assertions never print protected strings or response bodies. A signed fixture
proves containment despite claims, not genuine user authentication.
"""
import base64
import hashlib
import hmac
import html
import json
import os
import re
import time
import unittest
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('COURSE_BOUNDARY_BASE_URL', 'http://127.0.0.1:3217').rstrip('/')
ALLOWED_FIELDS = ('id', 'level', 'levelTitle', 'lessonNum', 'globalNum', 'title', 'summary')
TEXT_EXTENSIONS = {'.js', '.map', '.html', '.json', '.txt', '.rsc', '.bak', '.pre_velarion_bak'}


def private_data():
    return json.loads((ROOT / 'lib/server/curriculum-data.json').read_text())


def variants(value):
    value = value.strip()
    if len(value) < 35:
        return set()
    plain = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]*>', ' ', value))).strip()
    seeds = {value, value[:120], plain[:120]}
    result = set()
    for seed in seeds:
        if len(seed) < 35:
            continue
        result.update((seed, html.escape(seed), json.dumps(seed)[1:-1],
                       json.dumps(seed, ensure_ascii=False)[1:-1],
                       seed.replace('<', '\\u003c').replace('>', '\\u003e')))
    return result


def fingerprints():
    """Opaque labels only; never include these private values in test output."""
    found = {}
    lessons = private_data()['lessons']
    for index, lesson in enumerate(lessons):
        for field in ('content', 'objectives', 'example', 'diagram'):
            values = lesson.get(field, '')
            for n, value in enumerate(values if isinstance(values, list) else [values]):
                if isinstance(value, str):
                    for variant in variants(value):
                        found[variant] = f'lesson-{index + 1}/{field}-{n}'
        quiz = lesson.get('quiz', [])
        for n, question in enumerate(quiz if isinstance(quiz, list) else [quiz]):
            if not isinstance(question, dict):
                continue
            # Exact serialized quiz plus text anchors: numeric keys in isolation
            # are not uniquely identifiable and are checked structurally below.
            for value in (json.dumps(question), question.get('question', ''), question.get('explanation', '')):
                for variant in variants(value):
                    found[variant] = f'lesson-{index + 1}/quiz-{n}'
    # Extra legacy answer bank is TypeScript, not JSON. Extract each double-quoted
    # string literal (its data uses JSON-compatible string escaping), not the file.
    source = (ROOT / 'lib/server/quizData.ts').read_text()
    for index, literal in enumerate(re.findall(r'"(?:[^"\\]|\\.)*"', source)):
        try:
            value = json.loads(literal)
        except ValueError:
            continue
        for variant in variants(value):
            found[variant] = f'extra-quiz-string-{index}'
    return found


KEY_PATTERN = re.compile(r'''(?:["']?(?:correct|correctAnswer)["']?\s*:\s*[0-9]+)''')


def find_leak(blob, needles):
    text = blob.decode(errors='replace') if isinstance(blob, bytes) else blob
    # Normalize common JS/RSC escaped HTML and whitespace before matching too.
    normalized = html.unescape(text.replace('\\u003c', '<').replace('\\u003e', '>'))
    for needle, label in needles.items():
        if needle in text or needle in normalized:
            return label
    if KEY_PATTERN.search(text):
        return 'numeric-answer-key-structure'
    return None


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def request(path, headers=None, payload=None):
    target = urllib.parse.urlsplit(BASE)
    if target.scheme != 'http' or target.hostname not in ('127.0.0.1', 'localhost') or target.username or target.password:
        raise RuntimeError('Only a loopback HTTP production test target is permitted')
    req = urllib.request.Request(BASE + path, headers=headers or {}, data=payload)
    opener = urllib.request.build_opener(NoRedirect)
    try:
        response = opener.open(req, timeout=20)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        result = response.code, response.headers, response.read()
    # Next 16.4 canonicalizes RSC requests to a same-path _rsc cache key.
    # Never follow member/login redirects or any off-origin destination.
    if headers and headers.get('RSC') == '1' and result[0] == 307:
        location = result[1].get('Location', '')
        destination = urllib.parse.urlsplit(location)
        original = urllib.parse.urlsplit(path)
        if destination.scheme or destination.netloc or destination.path != original.path or '_rsc' not in urllib.parse.parse_qs(destination.query, keep_blank_values=True):
            raise RuntimeError('Unexpected RSC redirect; response suppressed')
        req = urllib.request.Request(BASE + location, headers=headers)
        try:
            response = opener.open(req, timeout=20)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            return response.code, response.headers, response.read()
    return result


def signed_fixture(secret, role='trader', verified=True, complete=True):
    def encode(value):
        return base64.urlsafe_b64encode(json.dumps(value, separators=(',', ':')).encode()).rstrip(b'=').decode()
    header = encode({'alg': 'HS256', 'typ': 'JWT'})
    body = encode({'accountId': '99999999', 'mt5Account': '99999999',
                   'email': 'local-fixture@example.invalid', 'role': role,
                   'partnerCode': 'local-fixture', 'verified': verified,
                   'schoolCompleted': complete, 'accountLinked': False,
                   'tradingActivated': False, 'exp': int(time.time()) + 300})
    unsigned = f'{header}.{body}'
    sig = base64.urlsafe_b64encode(hmac.new(secret.encode(), unsigned.encode(), hashlib.sha256).digest()).rstrip(b'=').decode()
    return f'{unsigned}.{sig}'


class CourseBoundary(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.needles = fingerprints()

    def assert_clean(self, blob, location):
        leak = find_leak(blob, self.needles)
        if leak:
            # assertNotIn would print protected operands on failure. Do not use it.
            self.fail(f'Private fingerprint detected ({leak}) at {location}; response/content suppressed')

    def test_scanner_negative_controls_are_detected_without_disclosure(self):
        for needle, label in self.needles.items():
            if find_leak('prefix ' + needle + ' suffix', {needle: label}) != label:
                self.fail('Scanner failed an in-memory private-data negative control')
        self.assertEqual(find_leak('correct: 2', {}), 'numeric-answer-key-structure')
        self.assertIsNone(find_leak('Public title and summary only', self.needles))

    def test_metadata_allowlist_and_guarded_private_imports(self):
        public = json.loads((ROOT / 'lib/curriculum-public.json').read_text())
        lessons = private_data()['lessons']
        expected = [{key: lesson[key] for key in ALLOWED_FIELDS} for lesson in lessons]
        self.assertTrue(public == expected, 'Public metadata does not exactly match the approved allowlist')
        self.assertEqual(len(public), 30)
        for name in ('curriculum.ts', 'quizData.ts'):
            guarded = re.search(r"import\s+['\"]server-only['\"]", (ROOT / 'lib/server' / name).read_text())
            self.assertTrue(bool(guarded), f'Server-only guard missing: {name}; private source suppressed')
        for directory in ('app', 'components', 'lib'):
            for path in (ROOT / directory).rglob('*'):
                if path.suffix not in ('.ts', '.tsx'):
                    continue
                source = path.read_text()
                if re.search(r'''(?:from\s*|import\s*\()['"][^'"]*curriculum-data\.json''', source):
                    self.assertEqual(path.relative_to(ROOT).as_posix(), 'lib/server/curriculum.ts')
        route = (ROOT / 'app/academy/[lessonSlug]/page.tsx').read_text()
        for forbidden in ('lib/server', 'LessonQuiz', 'CourseProgressGate', 'lesson.content', 'lesson.quiz'):
            self.assertFalse(forbidden in route, 'Private retrieval/rendering code reintroduced before authority exists')

    def test_retired_exporters_cannot_recreate_public_banks(self):
        for name in ('build_curriculum_data.py', 'export_curriculum_json.py', 'build_strict_academy_ui.py', 'build_velarion_academy_ui.py', 'add_quiz_hints.py'):
            source = (ROOT / 'scripts' / name).read_text().strip()
            self.assertTrue(source.startswith('raise SystemExit('), f'Exporter no longer inert: {name}')

    def test_all_build_and_static_text_artifacts(self):
        self.assertTrue((ROOT / '.next/BUILD_ID').is_file(), 'Production build required')
        paths = []
        for directory in (ROOT / '.next/static', ROOT / '.next/server', ROOT / 'public', ROOT / 'dashboard/static'):
            paths.extend(p for p in directory.rglob('*') if p.is_file() and p.suffix in TEXT_EXTENSIONS)
        self.assertTrue(paths, 'No production/static artifacts found')
        js = sum(p.suffix == '.js' for p in (ROOT / '.next/static').rglob('*') if p.is_file())
        self.assertGreater(js, 0)
        for path in paths:
            self.assert_clean(path.read_bytes(), path.relative_to(ROOT).as_posix())
        # No private data is currently even imported into a runtime server chunk.
        print(f'Boundary scan: {len(paths)} text artifacts, {js} client JS files, {len(self.needles)} in-memory fingerprints; all clean')

    def test_all_unauthenticated_page_and_get_api_responses(self):
        self.assertTrue((ROOT / '.next/BUILD_ID').is_file(), 'Production build required')
        routes = {'/robots.txt', '/sitemap.xml', '/forex_curriculum.js', '/does-not-exist'}
        for path in (ROOT / 'app').rglob('page.tsx'):
            relative = path.parent.relative_to(ROOT / 'app').as_posix()
            if '[' not in relative:
                routes.add('/' if relative == '.' else '/' + relative)
        for path in (ROOT / 'app/api').rglob('route.ts'):
            if re.search(r'export\s+async\s+function\s+GET\s*\(', path.read_text()):
                route = '/' + path.parent.relative_to(ROOT / 'app').as_posix()
                routes.add(re.sub(r'\[[^]]+\]', '1', route))
        for route in sorted(routes):
            status, headers, blob = request(route)
            self.assert_clean(blob, f'GET {route} ({status})')
        for number in range(1, 31):
            for headers in ({}, {'RSC': '1'}, {'RSC': '1', 'Next-Router-Prefetch': '1'}):
                status, response_headers, blob = request(f'/academy/lesson-{number}', headers)
                self.assertEqual(status, 200)
                self.assert_clean(blob, f'lesson-{number}, RSC={bool(headers)}')
                if not headers.get('Next-Router-Prefetch'):
                    self.assertTrue(b'Lesson content temporarily unavailable' in blob, 'Containment notice absent')
                if headers:
                    self.assertTrue('text/x-component' in response_headers.get('Content-Type', ''), 'RSC probe did not receive an RSC payload')
        for lesson in private_data()['lessons']:
            status, _, blob = request('/academy/' + lesson['id'])
            self.assertEqual(status, 200)
            self.assert_clean(blob, 'lesson-id alias')
        # Source-data paths must not be downloadable even by guessing their names.
        for route in ('/lib/server/curriculum-data.json', '/curriculum-data.json', '/lib/server/quizData.ts', '/academy/lesson-0', '/academy/lesson-1garbage'):
            status, _, blob = request(route)
            self.assertEqual(status, 404)
            self.assert_clean(blob, route)
        print(f'HTTP boundary: {len(routes)} public/member/GET-API paths, 90 canonical lesson HTML/full-RSC/prefetch responses, 30 aliases, 5 negative paths; clean')

    def test_every_served_client_js_and_map_matches_clean_artifact(self):
        count = 0
        for path in sorted((ROOT / '.next/static').rglob('*')):
            if not path.is_file() or path.suffix not in ('.js', '.map'):
                continue
            route = '/_next/' + path.relative_to(ROOT / '.next').as_posix()
            status, _, blob = request(route)
            self.assertEqual(status, 200)
            if blob != path.read_bytes():
                self.fail(f'Served asset differs from scanned build: {route}')
            self.assert_clean(blob, route)
            count += 1
        self.assertGreater(count, 0)
        print(f'HTTP client assets: {count} JS/maps fetched, byte-matched and clean')

    def test_forged_unlock_and_signed_session_claims_do_not_release_content(self):
        secret = os.environ.get('COURSE_BOUNDARY_TEST_SECRET')
        self.assertTrue(bool(secret), 'Set COURSE_BOUNDARY_TEST_SECRET to the isolated local production AUTH_SECRET')
        cookies = ['jm_auth_session=not-a-token; velarion_completed_lessons=[1,2,3,4,5,6]; velarion_admin_token=forged']
        for role, verified, complete in [('trader', False, False), ('trader', True, True), ('admin', True, True)]:
            cookies.append('jm_auth_session=' + signed_fixture(secret, role, verified, complete))
        for cookie in cookies:
            for number in (1, 2, 6, 30):
                route = f'/academy/lesson-{number}?userId=1&account_id=99999999&schoolCompleted=true&unlocked=true&completedLessons=1,2,3,4,5'
                for mode in ({}, {'RSC': '1'}, {'RSC': '1', 'Next-Router-Prefetch': '1'}):
                    status, _, blob = request(route, {'Cookie': cookie, **mode})
                    self.assertEqual(status, 200)
                    self.assert_clean(blob, 'adversarial/signed-fixture lesson response')
                    if not mode.get('Next-Router-Prefetch'):
                        self.assertTrue(b'Lesson content temporarily unavailable' in blob, 'Claims bypassed containment')
            payload = json.dumps({'lessonId': 30, 'account_id': 'someone-else', 'answers': {'0': 0}, 'schoolCompleted': True, 'completedLessons': list(range(1, 31))}).encode()
            status, headers, blob = request('/api/school/quiz/submit', {'Content-Type': 'application/json', 'Cookie': cookie}, payload)
            self.assertEqual(status, 503)
            self.assertTrue(b'LEARNING_AUTHORITY_UNAVAILABLE' in blob)
            self.assertFalse(bool(headers.get('Set-Cookie')), 'Containment must not mint completion cookies')
            self.assertIn('no-store', headers.get('Cache-Control', ''))
            self.assert_clean(blob, 'adversarial assessment response')
        status, headers, blob = request('/api/school/progress', {'Content-Type': 'application/json'}, b'{"completedLessons":[1,2,3,4,5],"isComplete":true}')
        self.assertEqual(status, 400)
        self.assert_clean(blob, 'direct progress write rejection')


if __name__ == '__main__':
    unittest.main()
