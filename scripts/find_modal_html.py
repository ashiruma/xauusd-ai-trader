with open("scripts/build_velarion_ui.py", "r", encoding="utf-8") as f:
    text = f.read()

pos = text.find('connect-account-modal')
if pos != -1:
    print("Found connect-account-modal at", pos)
    print(text[pos-50:pos+1000])
else:
    print("connect-account-modal NOT found in html!")
