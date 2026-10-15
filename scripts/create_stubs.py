import os, re

with open('src/shaders/neuform-isolated/NeuformIsolatedEffects.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

imports = re.findall(r'import\s+\w+\s+from\s+"(\./sources/[^"]+)";', text)
sources_dir = 'src/shaders/neuform-isolated/sources'
for imp in imports:
    fname = os.path.basename(imp.split('?')[0])
    target = os.path.join(sources_dir, fname)
    if not os.path.exists(target):
        with open(target, 'w', encoding='utf-8') as out:
            out.write('<!DOCTYPE html><html><head></head><body></body></html>')
        print(f'Created stub: {fname}')

sbs = 'src/shaders/shader-buttons/ShaderButtonStudies.tsx'
if not os.path.exists(sbs):
    with open(sbs, 'w', encoding='utf-8') as out:
        out.write('''export type ShaderButtonStudyVariant = "liquid-glass" | "intelligence" | "holo-foil" | "particles" | "voice-orb" | "water" | "dither-hold" | "lava-lamp" | "gold" | "ink";
export function ShaderButtonStudy(props: any) { return null; }
''')
    print('Created stub: ShaderButtonStudies.tsx')
