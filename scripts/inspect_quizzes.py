import json

with open("dashboard/static/forex_curriculum.js", "r", encoding="utf-8") as f:
    text = f.read()

start = text.find("window.FOREX_CURRICULUM = ") + len("window.FOREX_CURRICULUM = ")
end = text.find(";\nwindow.FOREX_GLOSSARY")
curriculum = json.loads(text[start:end])

print(f"Total lessons: {len(curriculum)}")
for l in curriculum:
    q = l["quiz"]
    print(f"L{l['globalNum']} [{l['id']}] {l['title']}")
    print(f"   Q: {q['question']}")
    print(f"   Correct [{q['correct']}]: {q['options'][q['correct']]}")
    print(f"   Exp: {q['explanation'][:80]}...\n")
