import os, re

with open('src/shaders/neuform-isolated/NeuformIsolatedEffects.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

imports = re.findall(r'import\s+(\w+)\s+from\s+"(\./sources/[^"]+)";', text)
print(f"Total HTML imports: {len(imports)}")
sources_dir = 'src/shaders/neuform-isolated/sources'
existing = set(os.listdir(sources_dir)) if os.path.exists(sources_dir) else set()

for var, p in imports:
    fname = os.path.basename(p.split('?')[0])
    exists = fname in existing
    print(f"  {var} ({fname}) -> exists: {exists}")
