with open("scripts/build_velarion_ui.py", "r", encoding="utf-8") as f:
    text = f.read()

pos = text.find('class="executive-kpi-grid"')
if pos != -1:
    print(text[pos+2000:pos+5500])
