with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

import re

views = ["view-trader", "view-academy", "view-admin", "view-performance"]
for v in views:
    m = re.search(r'id="' + v + r'"[^>]*>(.*?)(?=<div id="view-|\n\s*</main>)', text, re.DOTALL)
    if m:
        print(f"=== {v} (length: {len(m.group(1))}) ===")
        # Find all h2, h3, card titles
        headers = re.findall(r'<(?:h[2-4]|div class="card-title")[^>]*>(.*?)</', m.group(1))
        for h in headers[:8]:
            clean = re.sub(r'<[^>]+>', '', h).strip()
            print("  -", clean)
