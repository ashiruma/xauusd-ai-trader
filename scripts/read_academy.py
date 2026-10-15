with open("scripts/build_velarion_ui.py", "r", encoding="utf-8") as f:
    text = f.read()

pos1 = text.find('id="view-academy"')
pos2 = text.find('id="view-admin"')
if pos1 != -1 and pos2 != -1:
    print(text[pos1:pos2])
