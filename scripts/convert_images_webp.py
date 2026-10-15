from PIL import Image
import os

images = [
    'velarion_brand_dark.png',
    'velarion_brand_navy.png',
    'velarion_emblem_dark.png',
    'velarion_logo.jpg'
]

static_dir = 'dashboard/static'

for img_name in images:
    src_path = os.path.join(static_dir, img_name)
    if os.path.exists(src_path):
        base_name, _ = os.path.splitext(img_name)
        out_webp = os.path.join(static_dir, f"{base_name}.webp")
        im = Image.open(src_path)
        im.save(out_webp, 'WEBP', quality=90, method=6)
        orig_sz = os.path.getsize(src_path)
        webp_sz = os.path.getsize(out_webp)
        savings = ((orig_sz - webp_sz) / orig_sz) * 100
        print(f"Converted {img_name} ({orig_sz} bytes) -> {base_name}.webp ({webp_sz} bytes) [{savings:.1f}% reduction]")
