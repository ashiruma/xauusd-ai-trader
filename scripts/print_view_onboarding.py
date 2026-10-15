with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

s_onb = text.find('<div id="view-onboarding"')
e_onb = text.find('<div id="view-performance"')
print(text[s_onb:e_onb])
