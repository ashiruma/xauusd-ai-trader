with open("scripts/build_velarion_ui.py", "r", encoding="utf-8") as f:
    text = f.read()

pos = text.find('blotter-tbody')
if pos != -1:
    print(text[pos-200:pos+1500])
else:
    print("blotter-tbody not found")
