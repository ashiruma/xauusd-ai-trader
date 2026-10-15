with open("scripts/build_velarion_ui.py", "r", encoding="utf-8") as f:
    text = f.read()

pos = text.find('openConnectModal')
while pos != -1:
    print("Found openConnectModal at", pos)
    print(text[pos:pos+400])
    pos = text.find('openConnectModal', pos+1)
