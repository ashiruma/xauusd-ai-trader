with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

import re

m = re.search(r'id="view-trader"[^>]*>(.*?)(?=<div id="view-academy")', text, re.DOTALL)
if m:
    content = m.group(1)
    # Find all card headers / titles
    titles = re.findall(r'<div class="card-header"[^>]*>(.*?)</div>', content, re.DOTALL)
    print("Found card headers in view-trader:")
    for t in titles:
        clean = re.sub(r'<[^>]+>', ' ', t).strip()
        print(" *", " ".join(clean.split()))
