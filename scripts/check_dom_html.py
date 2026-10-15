with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

pos = text.find('dom-ladder-wrap')
if pos != -1:
    print(text[pos-200:pos+1500])
else:
    print("dom-ladder-wrap NOT found in html")
