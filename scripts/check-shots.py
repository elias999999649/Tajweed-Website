from PIL import Image
import os

shots = sorted(os.listdir('.screenshots'))
for name in shots:
    img = Image.open(os.path.join('.screenshots', name)).convert('RGB')
    w, h = img.size
    px_corner = img.getpixel((10, 10))
    px_center = img.getpixel((w // 2, h // 2))
    colors = img.getcolors(maxcolors=200000)
    n_colors = len(colors) if colors else -1
    print(f"{name:28s} {w}x{h:<6d} corner={px_corner} center={px_center} colors={n_colors}")
