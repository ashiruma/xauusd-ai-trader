with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

s = 0
while True:
    idx = text.find('loadAdminPortalUsers', s)
    if idx == -1:
        break
    print(text[max(0, idx-30):min(len(text), idx+50)].replace('\n', ' '))
    s = idx + 1
