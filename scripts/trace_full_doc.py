with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

body_start = text.find('<body')
main_script = text.rfind('<script') # the last script where JS app code is
html_body = text[body_start:main_script]
lines = html_body.splitlines()

depth = 0
for idx, l in enumerate(lines, 1):
    o = l.count('<div')
    c = l.count('</div')
    depth += (o - c)
    for tag in ['main-stage', 'view-home', 'view-user-dashboard', 'view-academy', 'view-trader', 'view-strategies', 'view-onboarding', 'view-performance', 'view-admin', '</main']:
        if tag in l:
            print(f"Line {idx:4} (depth={depth:2}): found '{tag}' in '{l.strip()[:60]}'")

print(f"End of HTML body depth before main script: {depth}")
