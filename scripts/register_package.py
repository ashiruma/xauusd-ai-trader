import os, json, shutil

target_dir = os.path.join('node_modules', '@designcodeio', 'threeui')
os.makedirs(target_dir, exist_ok=True)

pkg = {
  "name": "@designcodeio/threeui",
  "version": "1.0.0",
  "main": "./index.js",
  "module": "./index.js",
  "types": "./index.d.ts",
  "exports": {
    ".": {
      "import": "./index.js",
      "types": "./index.d.ts"
    },
    "./style.css": "./style.css"
  }
}

with open(os.path.join(target_dir, 'package.json'), 'w', encoding='utf-8') as f:
    json.dump(pkg, f, indent=2)

with open(os.path.join(target_dir, 'index.js'), 'w', encoding='utf-8') as f:
    f.write('export * from "../../../src/shaders/shader-buttons/ShaderButtons";\n')

with open(os.path.join(target_dir, 'index.d.ts'), 'w', encoding='utf-8') as f:
    f.write('export * from "../../../src/shaders/shader-buttons/ShaderButtons";\n')

shutil.copyfile('src/shaders/threeui.css', os.path.join(target_dir, 'style.css'))
print('Successfully registered @designcodeio/threeui package in node_modules')
