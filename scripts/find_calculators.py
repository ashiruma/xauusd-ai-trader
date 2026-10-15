with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

import re

for match in re.finditer(r'Pip\s+Value\s+Calculator', text, re.IGNORECASE):
    s = match.start()
    print("Found 'Pip Value Calculator' at:", s)
    print(text[s-100:s+600])
    print("="*60)

# Check onboarding boundaries
s_onb = text.find('id="view-onboarding"')
s_perf = text.find('id="view-performance"')
print(f"Onboarding slice length: {s_perf - s_onb}")
print(text[s_onb:s_onb+500])
print("... END OF ONBOARDING ...")
print(text[s_perf-200:s_perf])
