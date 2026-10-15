with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

import re

print("--- Nav Links in Sidebar ---")
for m in re.finditer(r'<a class="nav-link[^"]*"[^>]*onclick="([^"]+)"[^>]*>(.*?)</a>', text, re.DOTALL):
    clean = re.sub(r'<[^>]+>', '', m.group(2)).strip()
    print(f"Action: {m.group(1)} | Label: {clean}")

print("\n--- View Containers ---")
for v in ["view-trader", "view-academy", "view-admin", "view-performance"]:
    pos = text.find(f'id="{v}"')
    if pos != -1:
        snippet = text[pos:pos+300]
        first_line = snippet.split('\n')[0]
        print(f"[{v}] exists at {pos}: {first_line}")
    else:
        print(f"[{v}] NOT found")
