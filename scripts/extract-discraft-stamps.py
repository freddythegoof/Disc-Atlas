"""Deterministic alpha extraction only. Never synthesizes or redraws artwork.

Run from the repository root. Source pixels remain in source-data/stamp-sources.
Bounds exclude plastic/rim; thresholds classify the foil actually in each image.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / 'source-data/stamp-sources'
OUT = ROOT / 'public/stamps/discraft'
OUT.mkdir(parents=True, exist_ok=True)

def extract(mold):
    path = SOURCES / (mold + ('.jpg' if mold == 'nuke' else '.png'))
    im = Image.open(path).convert('RGB')
    rgb = np.asarray(im, dtype=float) / 255
    r, g, b = rgb.transpose(2, 0, 1)
    h, w = r.shape
    y, x = np.mgrid[:h, :w] / np.array([h, w])[:, None, None]
    if mold == 'buzzz':
        # Black foil plus the silver signature/champion line. No plastic pixels.
        dark = np.clip((.32 - np.maximum.reduce([r,g,b])) / .12, 0, 1)
        silver = np.clip((np.minimum.reduce([r,g,b]) - .73) / .09, 0, 1)
        silver *= np.clip((.18 - (np.maximum.reduce([r,g,b])-np.minimum.reduce([r,g,b]))) / .06,0,1)
        bounds = (x > .13) & (x < .86) & (y > .19) & (y < .77)
        silver_bounds = ((y < .34) & (x > .45) & (x < .83)) | ((y > .578) & (y < .612) & (x > .20) & (x < .80))
        a = np.maximum(dark, silver * silver_bounds) * bounds
    elif mold == 'luna':
        # Gold foil against charcoal plastic, confined inside the flight plate.
        a = np.clip((r - .23) / .07, 0, 1)
        a *= np.maximum(np.clip((r-b-.025)/.025,0,1),np.clip((r-.45)/.08,0,1))
        a *= ((x-.5)**2 + (y-.5)**2 < .335**2)
    elif mold == 'zone':
        # Gold/black foil has green >= blue; pink plastic has blue > green.
        a = np.maximum(np.clip((g-b+.015) / .035, 0, 1),np.clip((.38-np.maximum.reduce([r,g,b]))/.10,0,1))
        a *= ((x-.5)**2 + (y-.5)**2 < .35**2)
    elif mold == 'nuke':
        # Black line art on yellow. Native 400px source, no upscaling of detail.
        a = np.clip((.86 - r) / .10, 0, 1)
        a *= ((x-.5)**2 + (y-.5)**2 < .355**2)
    # Full design with a small transparent safety margin. Keep its aspect ratio.
    mask = Image.fromarray(np.uint8(np.clip(a,0,1)*255))
    box = mask.getbbox()
    mask = mask.crop(box)
    # The existing stamp mesh is circular. Fit every extracted pixel inside it,
    # including off-centre signatures; a bounding square would clip the corners.
    yy,xx = np.nonzero(np.asarray(mask))
    side = max(max(mask.size),int(np.ceil(2*np.max(np.hypot(xx-(mask.width-1)/2,yy-(mask.height-1)/2)))))
    square = Image.new('L', (side+16, side+16))
    square.paste(mask, ((side+16-mask.width)//2, (side+16-mask.height)//2))
    ink = Image.new('RGBA', square.size, (255,255,255,0)); ink.putalpha(square)
    destination = SOURCES / 'nuke-mask-candidate.png' if mold == 'nuke' else OUT / (mold+'.png')
    ink.save(destination, optimize=True)
    return im, ink

if __name__ == '__main__':
    molds = ['buzzz','zone','luna','nuke']
    board = Image.new('RGB',(1000,520*len(molds)), '#ddd')
    draw = ImageDraw.Draw(board)
    for i,mold in enumerate(molds):
        source,mask = extract(mold)
        source.thumbnail((490,490)); board.paste(source,(0,i*520+25))
        mask.thumbnail((490,490))
        proof = Image.new('RGBA',(490,490),'#41636d')
        proof.alpha_composite(mask,((490-mask.width)//2,(490-mask.height)//2))
        board.paste(proof.convert('RGB'),(500,i*520+25)); draw.text((8,i*520+5),mold,fill='black')
    board.save(SOURCES / 'extraction-review.jpg')
