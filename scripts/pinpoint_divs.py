with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

def find_mismatch(section_name, start_str, end_str):
    s = text.find(start_str)
    e = text.find(end_str, s)
    sub = text[s:e]
    lines = sub.splitlines()
    depth = 0
    print(f"=== {section_name} ===")
    for idx, line in enumerate(lines):
        o = line.count('<div')
        c = line.count('</div')
        depth += (o - c)
        if depth < 0:
            print(f"Negative depth at line {idx+1}: {line.strip()[:100]} (depth={depth})")
            depth = 0 # reset to see further
    print(f"Final depth for {section_name}: {depth}")

find_mismatch("academy", 'id="view-academy"', 'id="view-trader"')
find_mismatch("trader", 'id="view-trader"', 'id="view-strategies"')
find_mismatch("admin", 'id="view-admin"', '</main>')
