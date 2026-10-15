with open("scripts/build_velarion_ui.py", "r", encoding="utf-8") as f:
    text = f.read()

import re

# 1. Chart container
m_chart = re.search(r'id="([^"]*chart[^"]*)"', text)
print("Chart container ID:", m_chart.groups() if m_chart else "None")

# 2. Formula string
pos_formula = text.find('Drawdown')
if pos_formula != -1:
    print("Formula snippet:", text[pos_formula-50:pos_formula+300])

# 3. Calculator IDs
m_calc = re.findall(r'id="(calc-[^"]+)"', text)
print("Calculator IDs:", m_calc)

# 4. Modal IDs
m_modals = re.findall(r'class="[^"]*modal[^"]*"[^>]*id="([^"]+)"', text)
if not m_modals:
    m_modals = re.findall(r'id="([^"]*modal[^"]*)"', text)
print("Modal IDs:", m_modals)
