import json

with open("dashboard/static/forex_curriculum.js", "r", encoding="utf-8") as f:
    text = f.read()

start = text.find("window.FOREX_CURRICULUM = ") + len("window.FOREX_CURRICULUM = ")
end = text.find(";\nwindow.FOREX_GLOSSARY")
curriculum = json.loads(text[start:end])

# Check quizzes
print(f"Loaded {len(curriculum)} lessons")
for i, l in enumerate(curriculum):
    q = l["quiz"]
    print(f"Lesson {i+1}: {l['title']}")
    print(f"  Q: {q['question'][:50]}... (Correct: {q['correct']})")
