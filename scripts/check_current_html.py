with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

pip_pos = text.find('pip-type')
print("pip-type found at:", pip_pos)
if pip_pos != -1:
    print(text[pip_pos-100:pip_pos+200])

onb_pos = text.find('id="view-onboarding"')
print("\nview-onboarding found at:", onb_pos)
if onb_pos != -1:
    perf_pos = text.find('id="view-performance"')
    print(text[onb_pos:onb_pos+400])
