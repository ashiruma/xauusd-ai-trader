with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

import re

print("Length of index.html:", len(text))
sidebar_match = re.search(r'<aside[^>]*>(.*?)</aside>', text, re.DOTALL)
if sidebar_match:
    print("Found <aside>:")
    print(sidebar_match.group(0)[:800])
else:
    print("No <aside> tag found. Looking for sidebar:")
    sidebar_match2 = re.search(r'class="[^"]*sidebar[^"]*"[^>]*>(.*?)</div>', text, re.DOTALL)
    if sidebar_match2:
        print(sidebar_match2.group(0)[:800])

print("\nLooking for main content or view containers:")
for m in re.finditer(r'id="([^"]*view[^"]*)"', text):
    print("Found view id:", m.group(1))

for m in re.finditer(r'class="([^"]*tab[^"]*)"', text):
    print("Found tab class:", m.group(1))
