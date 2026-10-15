import json

with open('lighthouse-baseline.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

cats = data.get('categories', {})
print('=== BASELINE LIGHTHOUSE CATEGORY SCORES ===')
for cat_id, cat_info in cats.items():
    score = cat_info.get('score')
    val = int(score * 100) if score is not None else 'N/A'
    print(f"{cat_info['title']}: {val}/100")

audits = data.get('audits', {})
print('\n=== KEY PERFORMANCE METRICS ===')
metrics = [
    'first-contentful-paint',
    'largest-contentful-paint',
    'total-blocking-time',
    'cumulative-layout-shift',
    'speed-index',
    'interactive'
]
for m in metrics:
    if m in audits:
        a = audits[m]
        title = a.get('title', m)
        disp = a.get('displayValue', f"score: {a.get('score')}")
        print(f"{title}: {disp}")

print('\n=== OPPORTUNITIES & DIAGNOSTICS ===')
opps = [
    'render-blocking-resources',
    'uses-optimized-images',
    'modern-image-formats',
    'uses-text-compression',
    'unused-javascript',
    'unused-css-rules',
    'uses-long-cache-ttl',
    'font-display',
    'layout-shift-elements'
]
for opt in opps:
    if opt in audits:
        a = audits[opt]
        score = a.get('score')
        if score is None or score < 0.95:
            disp = a.get('displayValue', '')
            print(f"- {a.get('title')}: {disp} (score: {score})")
            if 'details' in a and 'items' in a['details']:
                for it in a['details']['items'][:3]:
                    url = it.get('url', '')
                    wasted = it.get('wastedBytes', it.get('wastedMs', ''))
                    print(f"    item: {url[:70]} {wasted}")
