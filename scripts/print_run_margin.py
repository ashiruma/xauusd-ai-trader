with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

s_m = text.find('function runMarginCalc()')
print(text[s_m:s_m+800])
