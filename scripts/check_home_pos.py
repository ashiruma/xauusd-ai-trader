with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

s_home = text.find('<div id="view-home"')
e_home = text.find('<div id="view-user-dashboard"')
print(f"view-home starts at {s_home}, view-user-dashboard starts at {e_home}")
print("Length of current view-home:", e_home - s_home)
