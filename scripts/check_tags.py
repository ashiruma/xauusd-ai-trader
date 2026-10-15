with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

terms = [
    '<aside class="sidebar">',
    '</aside>',
    '<main class="main-stage">',
    '</main>',
    '<script src="forex_curriculum.js"></script>',
    '<script>'
]

for t in terms:
    print(f"{t}: {text.find(t)}")
