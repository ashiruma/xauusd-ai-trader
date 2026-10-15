with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

s_admin = text.find('id="view-admin"')
# wait! what is right before id="view-admin"?
print("Chars before id='view-admin':", repr(text[s_admin-10:s_admin]))

sub = text[s_admin:text.find('</main>')]
lines = sub.splitlines()
d = 0
for idx, l in enumerate(lines, 1):
    o = l.count('<div')
    c = l.count('</div')
    d += (o - c)
    if o != 0 or c != 0:
        print(f"{idx:3}: +{o} -{c} => d={d:2} | {l.strip()[:60]}")
