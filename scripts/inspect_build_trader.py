with open("scripts/build_velarion_ui.py", "r", encoding="utf-8") as f:
    text = f.read()

import re
pos = text.find('id="view-trader"')
if pos != -1:
    print(text[pos:pos+3000])
