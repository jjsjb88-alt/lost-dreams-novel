import hashlib
import json
import pathlib
import numpy as np
from PIL import Image
from scipy import ndimage

BRAIN = pathlib.Path(r"C:\Users\jbseo\.gemini\antigravity-cli\brain\e2d8e107-51da-4d48-ac0c-d7e6ea1487ac")
OUT_DIR = pathlib.Path(r"C:\Users\jbseo\Desktop\lost-dreams-novel\vn\assets\ep2")
OUT_DIR.mkdir(parents=True, exist_ok=True)

CUTOUT_SPECS = [
    (
        "father_calm_png_1792368420910.jpg",
        "father-calm.webp",
        "character",
        "지우 아버지 기본(차분·체념) 컷아웃 — 마른 체형과 팔목 안쪽 정기 투약 포트",
        ["assets/ep1/jiwoo-firm.webp", "assets/ep1/mother-searching.webp"],
    ),
    (
        "father_urgent_1792368443185.jpg",
        "father-urgent.webp",
        "character",
        "지우 아버지 호소(목소리가 높아진 순간) 컷아웃 — '너 지금까지 잘 살았잖아 / 뭐가 부족해?'",
        ["assets/ep2/father-calm.webp"],
    ),
    (
        "father_bowed_1792368462271.jpg",
        "father-bowed.webp",
        "character",
        "지우 아버지 침묵·고개 숙임 컷아웃 — 화면을 끄고 끝내 고개를 들지 않는 순간",
        ["assets/ep2/father-calm.webp"],
    ),
]

SCENE_SPECS = [
    (
        "office_empty_desk_1792368486515.jpg",
        "office-empty-desk.webp",
        "background",
        "지우의 빈자리 배경 — 작은 화분과 텀블러, 점토 상자가 모두 사라진 빈 책상",
        ["assets/office.webp"],
    ),
    (
        "jiwoo_home_1792368509667.jpg",
        "jiwoo-home.webp",
        "background",
        "지우의 집 거실·식탁 배경 — 희미한 병원 약 냄새가 감도는 거실과 약통, 식탁 위 태블릿",
        ["assets/ep1/home-morning.webp"],
    ),
    (
        "cg_father_tablet_1792368548014.jpg",
        "cg-father-tablet.webp",
        "cg",
        "지우 아버지와의 대면 CG — 투약 포트가 붙은 마른 팔목으로 붉은 가계 시뮬레이션 태블릿을 미는 순간",
        ["assets/ep2/father-calm.webp", "assets/ep1/jiwoo-wounded.webp", "assets/ep1/seoin-question.webp"],
    ),
    (
        "cg_clay_street_1792368572338.jpg",
        "cg-clay-street.webp",
        "cg",
        "밖에서의 점토 대화 CG — 서인의 책상에서 다시 가져온 찌그러진 점토 컵을 손바닥 위에 올린 지우와 서인",
        ["assets/ep1/cg-clay.webp", "assets/ep1/jiwoo-firm.webp", "assets/ep1/seoin-question.webp"],
    ),
    (
        "cg_dream_resort_1792368602804.jpg",
        "cg-dream-resort.webp",
        "cg",
        "지나치게 아름다운 광고꿈 CG — 걱정이 제거된 얼굴로 바닷물에 서서 '여기선 아무도 다치지 않아'라고 말하는 꿈속 지우",
        ["assets/ep1/cg-sea.webp", "assets/ep1/jiwoo-firm.webp"],
    ),
]


def extract_character_cutout(img: Image.Image) -> Image.Image:
    rgb = np.asarray(img.convert("RGB"), dtype=np.float32)
    h, w, _ = rgb.shape
    # Exterior white background candidate: high luminance and low saturation
    max_c = rgb.max(axis=2)
    min_c = rgb.min(axis=2)
    lum = rgb.mean(axis=2)
    sat = max_c - min_c
    white_cand = (lum >= 242.0) & (sat <= 16.0)

    # Flood-fill from image border so interior whites (shirt collar, medical port) are untouched
    labeled, _ = ndimage.label(white_cand)
    border_labels = set(np.unique(labeled[0, :])) | set(np.unique(labeled[-1, :])) | set(np.unique(labeled[:, 0])) | set(np.unique(labeled[:, -1]))
    border_labels.discard(0)
    bg_mask = np.isin(labeled, list(border_labels))

    # Distance from foreground for soft 2px anti-aliased edge
    fg_mask = ~bg_mask
    fg_eroded = ndimage.binary_erosion(fg_mask, iterations=1)
    edge_band = fg_mask & (~fg_eroded)
    alpha = np.where(fg_mask, 255.0, 0.0)
    # Smooth edge transition based on whiteness on the 1-2px boundary
    edge_whiteness = np.clip((lum - 200.0) / 55.0, 0.0, 1.0)
    alpha = np.where(edge_band, 255.0 * (1.0 - 0.65 * edge_whiteness), alpha)
    alpha_u8 = np.clip(alpha, 0, 255).astype(np.uint8)

    rgba = np.dstack([rgb.astype(np.uint8), alpha_u8])
    return Image.fromarray(rgba, mode="RGBA")


provenance = {
    "episode": 2,
    "title": "AI가 모르는 것",
    "generatedAt": "2026-10-19",
    "generator": "Antigravity image-generator subagent + Pillow WebP pipeline",
    "styleReference": "vn/assets/ep1/* (Episode 1 character cutouts, home revision backgrounds, and event CGs)",
    "assets": [],
}

seen_hashes = set()

for src_name, dst_name, kind, desc, refs in CUTOUT_SPECS:
    src_path = BRAIN / src_name
    dst_path = OUT_DIR / dst_name
    with Image.open(src_path) as im:
        cutout = extract_character_cutout(im)
        cutout.save(dst_path, format="WEBP", quality=92, method=6)
        w, h = cutout.size
        arr = np.asarray(cutout)
        transparent_ratio = float((arr[:, :, 3] == 0).mean())
    raw = dst_path.read_bytes()
    assert raw[:4] == b"RIFF" and raw[8:12] == b"WEBP", f"Invalid WEBP header: {dst_name}"
    sha = hashlib.sha256(raw).hexdigest()
    assert sha not in seen_hashes, f"Duplicate hash: {dst_name}"
    seen_hashes.add(sha)
    provenance["assets"].append({
        "file": f"assets/ep2/{dst_name}",
        "kind": kind,
        "description": desc,
        "references": refs,
        "width": w,
        "height": h,
        "hasAlpha": True,
        "transparentAreaRatio": round(transparent_ratio, 4),
        "bytes": len(raw),
        "sha256": sha,
    })
    print(f"{dst_name}: {w}x{h} RGBA, transparent={transparent_ratio:.1%}, {len(raw)} bytes, sha256={sha[:12]}")

for src_name, dst_name, kind, desc, refs in SCENE_SPECS:
    src_path = BRAIN / src_name
    dst_path = OUT_DIR / dst_name
    with Image.open(src_path) as im:
        rgb = im.convert("RGB")
        rgb.save(dst_path, format="WEBP", quality=90, method=6)
        w, h = rgb.size
    raw = dst_path.read_bytes()
    assert raw[:4] == b"RIFF" and raw[8:12] == b"WEBP", f"Invalid WEBP header: {dst_name}"
    sha = hashlib.sha256(raw).hexdigest()
    assert sha not in seen_hashes, f"Duplicate hash: {dst_name}"
    seen_hashes.add(sha)
    provenance["assets"].append({
        "file": f"assets/ep2/{dst_name}",
        "kind": kind,
        "description": desc,
        "references": refs,
        "width": w,
        "height": h,
        "hasAlpha": False,
        "bytes": len(raw),
        "sha256": sha,
    })
    print(f"{dst_name}: {w}x{h} RGB, {len(raw)} bytes, sha256={sha[:12]}")

prov_path = OUT_DIR / "image-provenance.json"
prov_path.write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Wrote", prov_path)
