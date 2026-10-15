with open("scripts/build_velarion_ui.py", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("•", "&bull;")
text = text.replace("—", "&mdash;")

with open("scripts/build_velarion_ui.py", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated build_velarion_ui.py with safe HTML entities.")
