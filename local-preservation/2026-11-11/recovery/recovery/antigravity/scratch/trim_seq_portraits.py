import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

text = Path(r"C:\Users\jbseo\Desktop\lost-dreams-novel\vn\story-data.js").read_text(encoding="utf-8")
idx = text.find('"assets"')
print("idx:", idx)
if idx != -1:
    print(text[idx:idx+800])
else:
    idx2 = text.find("assets")
    print("idx2:", idx2)
    print(text[idx2:idx2+800])
