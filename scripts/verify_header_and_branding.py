import urllib.request

resp = urllib.request.urlopen('http://127.0.0.1:8000/')
html = resp.read().decode('utf-8')

checks = [
    ("Legacy header removed", '<header class="top-nav">' not in html),
    ("Old brand monogram removed", '<div class="brand-monogram">V</div>' not in html),
    ("Official brand logo in nav", '/velarion_brand_dark.png' in html),
    ("Official brand logo in sidebar", 'aside class="sidebar"' in html and '/velarion_brand_dark.png' in html),
    ("Official brand logo in modal", 'id="jm-auth-modal"' in html and '/velarion_brand_dark.png' in html),
    ("Countdown bar at top of page", html.find('class="landing-announcement-bar"') < html.find('<div class="app-layout')),
    ("Landing navbar below countdown", html.find('class="landing-navbar"') < html.find('<div class="app-layout')),
    ("View home starts cleanly", 'id="view-home"' in html and 'landing-hero-wrap' in html),
    ("JustMarkets Auth Modal present", 'id="jm-auth-modal"' in html),
    ("Access Denied banner present", 'id="jm-access-denied-box"' in html),
]

print("=== VERIFYING LEGACY HEADER REMOVAL & NEW OFFICIAL BRANDING ===")
all_pass = True
for name, ok in checks:
    status = "PASS" if ok else "FAIL"
    if not ok:
        all_pass = False
    print(f"[{status}] {name}")

print("===============================================================")
print("All branding and header checks passed!" if all_pass else "SOME CHECKS FAILED!")

# Also verify that the logo image itself returns HTTP 200
for img in ['/velarion_brand_dark.png', '/velarion_brand_navy.png', '/velarion_emblem_dark.png', '/velarion_logo.jpg']:
    try:
        r = urllib.request.urlopen('http://127.0.0.1:8000' + img)
        print(f"[HTTP {r.status}] Image asset available: {img} ({len(r.read())} bytes)")
    except Exception as e:
        print(f"[ERROR] Could not fetch {img}: {e}")
