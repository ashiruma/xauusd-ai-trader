import urllib.request, json, hashlib, os

url = 'https://threeui.com/source-code/uplink-loader.json'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=15) as res:
    data = res.read()

bundle = json.loads(data.decode('utf-8'))
print('Bundle ID:', bundle.get('id'), 'Files:', len(bundle.get('files', [])))

with open('uplink-loader.json', 'wb') as f:
    f.write(data)

for item in bundle['files']:
    path = item['path']
    code = item['code']
    sha = hashlib.sha256(code.encode('utf-8')).hexdigest()
    expected = item['sha256']
    print(f"{path} -> match: {sha == expected} ({sha[:8]}...)")
