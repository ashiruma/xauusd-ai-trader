with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's inspect runPipCalc and runPositionCalc in JavaScript
pos = text.find('function runPipCalc')
print("runPipCalc:")
print(text[pos:pos+600])

pos2 = text.find('function runPositionCalc')
print("\nrunPositionCalc:")
print(text[pos2:pos2+600])
