with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

for line_num, line in enumerate(text.splitlines(), 1):
    if any(k in line.lower() for k in ['brand-monogram', 'brand-name', 'landing-brand', 'velarion']):
        print(f"L{line_num:4}: {line.strip()[:100]}")
