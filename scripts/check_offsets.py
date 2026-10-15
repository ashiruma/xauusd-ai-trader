with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

terms = [
    'id="view-academy"',
    'id="view-trader"',
    'id="view-strategies"',
    'id="view-onboarding"',
    'id="view-performance"',
    'LESSON VIEW MODAL',
    '// Velarion Markets Dashboard JavaScript'
]

for t in terms:
    print(f"{t}: {text.find(t)}")
