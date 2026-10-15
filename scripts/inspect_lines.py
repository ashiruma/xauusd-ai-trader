with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

body_start = text.find('<body')
main_script = text.rfind('<script')
html_body = text[body_start:main_script]
lines = html_body.splitlines()

for i in range(1015, 1026):
    print(f"{i}: {lines[i]}")
