with open("scripts/build_velarion_ui.py", "r", encoding="utf-8") as f:
    text = f.read()

pos = text.find('function renderDomLadder')
if pos != -1:
    print(text[pos:pos+1500])
else:
    pos2 = text.find('dom-ladder-rows')
    if pos2 != -1:
        print(text[pos2:pos2+1000])
