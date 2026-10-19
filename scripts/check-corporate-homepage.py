"""Local-only homepage regression checks; never submits broker or trading actions."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT.parent / 'velarion-corporate-deliverables'
OUT.mkdir(exist_ok=True)
BASE = 'http://127.0.0.1:3000'
results = []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(BASE, wait_until='networkidle')
    page.evaluate('document.fonts.ready')
    page.screenshot(path=str(OUT / 'velarion-home-desktop.png'))
    page.screenshot(path=str(OUT / 'velarion-home-full.png'), full_page=True)
    assert page.locator('h1').count() == 1
    assert 'Clarity before' in page.locator('h1').inner_text()
    assert page.locator('main ol li').count() == 5
    assert page.locator('main input').count() == 0
    body = page.locator('body').inner_text()
    assert 'Capital Markets Authority (CMA) of Kenya' in body
    assert 'conflict of interest' in body
    assert 'Larger deposits do not guarantee returns or safety' in body
    assert 'velarionmarkets.com' not in page.content()
    links = page.locator('main a').evaluate_all('(links) => [...new Set(links.map(a => a.getAttribute("href")))]')
    for href in links:
        if href.startswith('/'):
            response = page.request.get(BASE + href)
            assert response.status < 400, (href, response.status)
            results.append({'route': href, 'status': response.status})
    for width in [320, 375, 390, 768, 1024, 1280, 1440]:
        page.set_viewport_size({'width': width, 'height': 900})
        overflow = page.evaluate('document.documentElement.scrollWidth > innerWidth')
        assert not overflow, f'Horizontal overflow at {width}'
        results.append({'viewport': width, 'horizontalOverflow': overflow})
    page.set_viewport_size({'width': 390, 'height': 844})
    page.screenshot(path=str(OUT / 'velarion-home-mobile.png'))
    page.screenshot(path=str(OUT / 'velarion-home-mobile-full.png'), full_page=True)
    page.get_by_role('button', name='Open navigation menu', exact=True).click()
    page.get_by_role('navigation', name='Mobile Navigation', exact=True).wait_for(state='visible')
    page.screenshot(path=str(OUT / 'velarion-home-mobile-menu.png'))
    page.keyboard.press('Escape')
    page.get_by_role('navigation', name='Mobile Navigation', exact=True).wait_for(state='detached')
    page.set_viewport_size({'width': 1440, 'height': 1000})
    page.get_by_role('button', name='Toggle Color Theme', exact=True).click()
    page.wait_for_function('document.documentElement.dataset.theme === "dark"')
    page.screenshot(path=str(OUT / 'velarion-home-dark.png'), animations='disabled')
    assert not errors, errors
    results.append({'javascriptErrors': errors, 'mobileMenu': 'pass', 'darkTheme': 'pass'})
    browser.close()
(OUT / 'visual-checks.json').write_text(json.dumps(results, indent=2) + '\n')
print(f'PASS: {len(results)} checks. Previews: {OUT}')
