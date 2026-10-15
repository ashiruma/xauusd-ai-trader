with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('calc-margin')
print("calc-margin:")
print(text[pos:pos+1500])

pos2 = text.find('function runMarginCalc')
print("\nrunMarginCalc:")
print(text[pos2:pos2+600])
