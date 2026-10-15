with open("dashboard/static/index.html", "r", encoding="utf-8") as f:
    text = f.read()

pos_academy = text.find('id="view-academy"')
pos_next = text.find('id="view-onboarding"')
print("Academy start:", pos_academy, "End:", pos_next)
if pos_academy != -1 and pos_next != -1:
    print("Academy section length:", pos_next - pos_academy)
    print("First 300 chars:")
    print(text[pos_academy:pos_academy+300])
