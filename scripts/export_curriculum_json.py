import json
from scripts.build_curriculum_data import lessons, glossary

# Write to lib/curriculum-data.json
with open("lib/curriculum-data.json", "w", encoding="utf-8") as f:
    json.dump({
        "lessons": lessons,
        "glossary": glossary
    }, f, indent=2)

print(f"Exported {len(lessons)} lessons and {len(glossary)} glossary terms to lib/curriculum-data.json")
