import re

with open('dashboard/static/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Emoji unicode ranges
emoji_pattern = re.compile(
    r'[\U0001F600-\U0001F64F]'  # emoticons
    r'|[\U0001F300-\U0001F5FF]'  # symbols & pictographs
    r'|[\U0001F680-\U0001F6FF]'  # transport & map symbols
    r'|[\U0001F1E0-\U0001F1FF]'  # flags (iOS)
    r'|[\U00002702-\U000027B0]'
    r'|[\U000024C2-\U0001F251]'
    r'|[\U0001F900-\U0001F9FF]'  # Supplemental Symbols and Pictographs
    r'|[\U0001FA70-\U0001FAFF]'  # Symbols and Pictographs Extended-A
)

matches = emoji_pattern.findall(text)
print(f"Total emojis found: {len(matches)}")
if matches:
    print("Emojis found:", set(matches))
