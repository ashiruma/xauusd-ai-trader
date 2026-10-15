import os

with open('src/index.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write('export * from "./shaders/uplink-loader/UplinkLoader";\nexport * from "./shaders/shader-buttons/ShaderButtons";\n')

target_dir = os.path.join('node_modules', '@designcodeio', 'threeui')
os.makedirs(target_dir, exist_ok=True)
with open(os.path.join(target_dir, 'index.js'), 'w', encoding='utf-8', newline='\n') as f:
    f.write('export * from "../../../src/shaders/uplink-loader/UplinkLoader";\nexport * from "../../../src/shaders/shader-buttons/ShaderButtons";\n')

with open(os.path.join(target_dir, 'index.d.ts'), 'w', encoding='utf-8', newline='\n') as f:
    f.write('export * from "../../../src/shaders/uplink-loader/UplinkLoader";\nexport * from "../../../src/shaders/shader-buttons/ShaderButtons";\n')

print('Exported UplinkLoader from @designcodeio/threeui')
