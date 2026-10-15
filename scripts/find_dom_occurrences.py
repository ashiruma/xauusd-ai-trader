with open("scripts/build_velarion_ui.py", "r", encoding="utf-8") as f:
    text = f.read()

pos = 0
while True:
    pos = text.find('dom-ladder-rows', pos)
    if pos == -1: break
    print("Found at", pos)
    print(text[pos-100:pos+300])
    pos += len('dom-ladder-rows')
