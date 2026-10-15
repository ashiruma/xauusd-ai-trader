with open("scripts/build_velarion_ui.py", "r", encoding="utf-8") as f:
    text = f.read()

pos = text.find('The Strict Mathematics of Drawdown')
if pos != -1:
    print(text[pos:pos+1500])
