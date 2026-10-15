with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos_bar = text.find('class="landing-announcement-bar"')
pos_nav = text.find('class="landing-navbar"')
pos_div_layout = text.find('<div class="app-layout')
pos_home = text.find('id="view-home"')

print(f"landing-announcement-bar: {pos_bar}")
print(f"landing-navbar          : {pos_nav}")
print(f"<div class=\"app-layout\"  : {pos_div_layout}")
print(f"view-home               : {pos_home}")
print(f"Is countdown bar before app-layout div? {pos_bar < pos_div_layout}")
print(f"Is navbar before app-layout div?        {pos_nav < pos_div_layout}")
