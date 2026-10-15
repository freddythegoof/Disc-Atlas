"""Regenerate the synthetic HEVC/HEIF photo (Pillow + pillow-heif 1.8.1).

No real person's photo or location is included. GPS is deliberately fake and
exists to exercise the metadata-stripping upload boundary.
"""
from pathlib import Path
from PIL import Image, ImageDraw, TiffImagePlugin
import pillow_heif

pillow_heif.register_heif_opener()
out = Path(__file__).parent
image = Image.new("RGB", (128, 96), (24, 32, 42))
draw = ImageDraw.Draw(image)
draw.ellipse((20, 4, 108, 92), fill=(235, 113, 83))
draw.ellipse((42, 26, 86, 70), outline=(20, 30, 50), width=5)
draw.rectangle((38, 45, 90, 51), fill=(235, 113, 83))
draw.rectangle((72, 20, 82, 28), fill=(245, 245, 240))
exif = Image.Exif()
exif[270] = "Disc Atlas synthetic HEIC privacy fixture"
exif[34853] = {1: "N", 2: tuple(TiffImagePlugin.IFDRational(x) for x in (0, 0, 0)),
               3: "E", 4: tuple(TiffImagePlugin.IFDRational(x) for x in (0, 0, 0))}
image.save(out / "disc-photo.heic", quality=85, exif=exif)
image.save(out / "disc-photo.png")
decoded = Image.open(out / "disc-photo.heic")
decoded.load()
assert decoded.size == (128, 96)
assert decoded.getexif().get_ifd(34853)[1] == "N"
print(f"Pillow-HEIF verified HEVC photo: {decoded.size}, {decoded.mode}")
