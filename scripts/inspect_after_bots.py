with open("scripts/build_velarion_ui.py", "r", encoding="utf-8") as f:
    text = f.read()

pos = text.find('Active Subsidized Bots')
if pos != -1:
    print(text[pos+500:pos+3500])
