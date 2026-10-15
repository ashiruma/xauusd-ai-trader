import urllib.request

resp = urllib.request.urlopen('http://127.0.0.1:8000/')
html = resp.read().decode('utf-8')

checks = [
    ("Countdown bar", "landing-announcement-bar"),
    ("Timer days box", "id=\"timer-days\""),
    ("Partner code in banner", "p4cui0wkfz"),
    ("Landing navbar", "landing-navbar"),
    ("LOG IN button in nav", "openJustMarketsLoginModal()"),
    ("Hero title $423 MILLION", "$423 MILLION"),
    ("2-column benefits checklist", "benefits-checklist-grid"),
    ("1ms latency checkmark", "Latency as low as 1ms"),
    ("Hero CTA Launch Now", "Launch Now &gt;"),
    ("Chevron sculpture visual", "chevron-sculpture"),
    ("Live HUD card", "hud-glass-card"),
    ("Social proof Daniel K quote", "Daniel K., Verified Forex Trader"),
    ("Trustpilot score 4.9", "TrustScore <strong style=\"color:#F1F5F9;\">4.9</strong>"),
    ("Google Rating 4.9", "Google &amp; Broker Rating"),
    ("Floating cookie banner", "landing-cookie-banner"),
    ("Floating support widget", "openSupportModal()"),
    ("JustMarkets Auth Modal", "id=\"jm-auth-modal\""),
    ("Access Denied error banner", "id=\"jm-access-denied-box\""),
    ("Access Granted success banner", "id=\"jm-access-granted-box\""),
    ("Login endpoint JS", "submitJustMarketsLogin"),
    ("Registration endpoint JS", "submitJustMarketsRegistration"),
    ("Home-mode CSS class toggle", "home-mode"),
]

print("=== VERIFYING NEW STANDALONE LANDING PAGE & JUSTMARKETS LOGIN ===")
all_pass = True
for name, needle in checks:
    found = needle in html
    status = "PASS" if found else "FAIL"
    if not found:
        all_pass = False
    print(f"[{status}] {name}")

print("===============================================================")
print("All checks passed!" if all_pass else "SOME CHECKS FAILED!")
