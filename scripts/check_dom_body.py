with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

# Search for dom-ladder-wrap in body
body_pos = text.find('<body>')
if body_pos != -1:
    pos2 = text.find('dom-ladder-wrap', body_pos)
    if pos2 != -1:
        print("Found dom-ladder-wrap in body at", pos2)
        print(text[pos2-100:pos2+1000])
    else:
        print("NOT found in body!")
