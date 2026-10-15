with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

s_pip = text.find('id="calc-pip"')
e_pip = text.find('id="calc-margin"')
print(text[s_pip:e_pip])
