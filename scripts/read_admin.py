with open("scripts/build_velarion_ui.py", "r", encoding="utf-8") as f:
    text = f.read()

pos1 = text.find('id="view-admin"')
pos2 = text.find('id="view-performance"')
if pos1 != -1 and pos2 != -1:
    print(text[pos1:pos2])
