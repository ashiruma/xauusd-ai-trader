import re

with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

print("--- Navigation Items ---")
for m in re.finditer(r'nav-item[^>]*onclick="([^"]+)"[^>]*>(.*?)</div>', text, re.DOTALL):
    clean_text = re.sub(r'<[^>]+>', '', m.group(2)).strip()
    print(f"Action: {m.group(1)} | Label: {clean_text}")

print("\n--- Card Titles / Subtitles ---")
for m in re.finditer(r'<h[1-5][^>]*>(.*?)</h[1-5]>', text, re.DOTALL):
    clean_h = re.sub(r'<[^>]+>', '', m.group(1)).strip()
    if clean_h:
        print(f"Header: {clean_h}")

print("\n--- Tabs Container IDs ---")
for m in re.finditer(r'id="(tab-[^"]+)"', text):
    print(f"Tab ID: {m.group(1)}")
