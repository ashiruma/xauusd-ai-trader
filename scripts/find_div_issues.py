with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

def find_extra_close(name, start_str, end_str):
    s = text.find(start_str)
    e = text.find(end_str)
    sub = text[s:e]
    lines = sub.splitlines()
    depth = 0
    for idx, line in enumerate(lines, 1):
        o = line.count('<div')
        c = line.count('</div')
        depth += (o - c)
        if depth < 0:
            print(f"{name}: Negative depth at relative line {idx}: {line.strip()[:100]}")
            # print surrounding lines
            start_context = max(0, idx - 5)
            end_context = min(len(lines), idx + 5)
            for c_idx in range(start_context, end_context):
                marker = "==>" if c_idx == idx - 1 else "   "
                print(f"{marker} {c_idx+1}: {lines[c_idx]}")
            return
    print(f"{name}: final depth={depth}")

find_extra_close("trader", 'id="view-trader"', 'id="view-strategies"')
find_extra_close("admin", 'id="view-admin"', '</main>')
