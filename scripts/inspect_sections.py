with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

s_trader = text.find('id="view-trader"')
e_trader = text.find('id="view-strategies"')
print('=== TRADER END (last 400 chars) ===')
print(text[e_trader-400:e_trader])

s_admin = text.find('id="view-admin"')
e_admin = text.find('</main>')
print('=== ADMIN (full) ===')
print(text[s_admin:e_admin])
