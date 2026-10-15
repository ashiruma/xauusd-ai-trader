with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

s_legacy_header = text.find('<header class="top-nav">')
e_legacy_header = text.find('</header>') + len('</header>')
print("Legacy header slice:", s_legacy_header, "to", e_legacy_header)
print("Content of legacy header:")
print(text[s_legacy_header:e_legacy_header])

print("="*60)
s_bar = text.find('<div class="landing-announcement-bar">')
s_nav = text.find('<nav class="landing-navbar">')
print("landing-announcement-bar at:", s_bar)
print("landing-navbar at:", s_nav)
