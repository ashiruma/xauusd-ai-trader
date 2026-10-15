import re

with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    if '<main' in line:
        print(f'Line {i+1}: <main> opened')
    if '</main>' in line:
        print(f'Line {i+1}: </main> closed, stack len: {len(stack)}')
    if 'view-pane' in line:
        m = re.search(r'id=[\"\'](view-[^\'\"]+)[\"\']', line)
        if m:
            print(f'Line {i+1}: {m.group(1)} (stack: {len(stack)})')
    for m in re.finditer(r'<div\b|</div\b', line):
        tag = m.group(0)
        if tag == '<div':
            stack.append(i+1)
        else:
            if stack:
                stack.pop()
            else:
                print(f'Line {i+1}: extra closing div!')
