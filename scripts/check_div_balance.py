with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

sections = [
    ('start_to_main', 0, text.find('<main')),
    ('main_to_home', text.find('<main'), text.find('<div id="view-home"')),
    ('home', text.find('<div id="view-home"'), text.find('<div id="view-user-dashboard"')),
    ('user_dash', text.find('<div id="view-user-dashboard"'), text.find('<div id="view-academy"')),
    ('academy', text.find('<div id="view-academy"'), text.find('<div id="view-trader"')),
    ('trader', text.find('<div id="view-trader"'), text.find('<div id="view-strategies"')),
    ('strategies', text.find('<div id="view-strategies"'), text.find('<div id="view-onboarding"')),
    ('onboarding', text.find('<div id="view-onboarding"'), text.find('<div id="view-performance"')),
    ('performance', text.find('<div id="view-performance"'), text.find('<div id="view-admin"')),
    ('admin', text.find('<div id="view-admin"'), text.find('</main>')),
    ('end', text.find('</main>'), len(text))
]

for name, s, e in sections:
    sub = text[s:e]
    o = sub.count('<div')
    c = sub.count('</div')
    print(f"{name:15}: opens={o:3}, closes={c:3}, diff={o-c:3}")
