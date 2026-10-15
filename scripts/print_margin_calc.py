with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

s_margin = text.find('id="calc-margin"')
e_margin = text.find('<!-- Forex Glossary -->')
if e_margin == -1:
    e_margin = s_margin + 2000
print(text[s_margin:e_margin])
