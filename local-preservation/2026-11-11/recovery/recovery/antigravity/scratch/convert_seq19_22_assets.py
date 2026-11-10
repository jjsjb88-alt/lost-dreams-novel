import sys
from pathlib import Path
from collections import deque
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8")

brain_dir = Path(r"C:\Users\jbseo\.gemini\antigravity-cli\brain\e2d8e107-51da-4d48-ac0c-d7e6ea1487ac")
out_dir = Path(r"C:\Users\jbseo\Desktop\lost-dreams-novel\vn\assets")

ref_img = Image.open(out_dir / "yoonha.webp")
print("Reference yoonha.webp:", ref_img.size, ref_img.mode)
target_w, target_h = ref_img.size

jobs = [
    ("yoonsera_1792373150916.jpg", "yoonsera.webp"),
    ("eunkyung_1792373178657.jpg", "eunkyung.webp"),
    ("haerin_1792373224978.jpg", "haerin.webp"),
]


def cutout_and_save(src_path: Path, dest_path: Path, width: int, height: int):
    img = Image.open(src_path).convert("RGBA")
    if img.size != (width, height):
        img = img.resize((width, height), Image.Resampling.LANCZOS)
    px = img.load()
    w, h = img.size

    visited = bytearray(w * h)
    q = deque()

    def is_bg(x: int, y: int) -> bool:
        r, g, b, _ = px[x, y]
        return r >= 236 and g >= 236 and b >= 236 and (max(r, g, b) - min(r, g, b)) <= 18

    def push(x: int, y: int):
        if 0 <= x < w and 0 <= y < h:
            idx = y * w + x
            if not visited[idx] and is_bg(x, y):
                visited[idx] = 1
                q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while q:
        x, y = q.popleft()
        r, g, b, _ = px[x, y]
        px[x, y] = (r, g, b, 0)
        push(x - 1, y)
        push(x + 1, y)
        push(x, y - 1)
        push(x, y + 1)

    # Soft feather 1px edge next to transparent background
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            idx = y * w + x
            if visited[idx]:
                continue
            neighbors = (
                visited[idx - 1]
                + visited[idx + 1]
                + visited[idx - w]
                + visited[idx + w]
            )
            if neighbors > 0:
                r, g, b, a = px[x, y]
                lum = (r + g + b) / 3.0
                if lum > 218:
                    new_a = int(255 * max(0.15, min(1.0, (255.0 - lum) / 40.0)))
                    px[x, y] = (r, g, b, new_a)

    img.save(dest_path, "WEBP", quality=86, method=6)
    print(f"Saved {dest_path.name}: {img.size}, {dest_path.stat().st_size} bytes")


for src_name, dest_name in jobs:
    cutout_and_save(brain_dir / src_name, out_dir / dest_name, target_w, target_h)
