with open("scripts/build_velarion_ui.py", "r", encoding="utf-8") as f:
    text = f.read()

pos1 = text.find('id="view-performance"')
pos2 = text.find('<!-- ============================================================== -->\n    <!-- MODALS')
if pos1 != -1:
    print(text[pos1:pos1+3000 if pos2 == -1 else pos2])
