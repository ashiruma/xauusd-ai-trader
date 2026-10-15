with open("scripts/build_velarion_ui.py", "r", encoding="utf-8") as f:
    text = f.read()

pos = text.find('class="workspace-right-column"')
if pos != -1:
    print(text[pos:pos+4000])
else:
    print("Not found workspace-right-column")
