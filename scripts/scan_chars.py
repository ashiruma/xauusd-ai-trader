import unicodedata
import re

with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

fffd_count = text.count('\ufffd')
print(f"Count of \\ufffd: {fffd_count}")

non_ascii = set(re.findall(r'[^\x00-\x7F]', text))
print(f"Non-ASCII characters found ({len(non_ascii)}):")
for ch in sorted(non_ascii):
    try:
        name = unicodedata.name(ch)
    except Exception:
        name = "UNKNOWN"
    print(f"  U+{ord(ch):04X} ({name}): count = {text.count(ch)}")
