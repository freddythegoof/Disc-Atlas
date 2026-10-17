"""Compose review boards from unchanged source pixels and actual browser captures."""
import argparse,json
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/assets/discraft-stamp-sweep/batch-1-fraction-audit'
FONT=Path('C:/Windows/Fonts/segoeui.ttf')
def font(size):return ImageFont.truetype(str(FONT),size)
def percent(value):return f'{value*100:.2f}%'
def disc_crop(im,bounds):
    l,t,r,b=bounds;pad=max(r-l,b-t)*.055
    return im.crop((max(0,l-pad),max(0,t-pad),min(im.width,r+pad),min(im.height,b+pad)))
def compose(sources):
    rows=json.loads((OUT/'measurements.json').read_text());v=json.loads((OUT/'verification.json').read_text())['results']
    for row in sorted(rows,key=lambda r:r['deltaPercentagePoints'],reverse=True)[:3]+[r for r in rows if r['slug']=='force']:
        slug=row['slug'];mold=row['catalogMold']
        for view in ['top','bag']:
            board=Image.new('RGB',(1500,770),'#f1f3f4');d=ImageDraw.Draw(board)
            d.text((24,16),row['mold']+' | Batch 1 placement audit',font=font(34),fill='#17222c')
            d.text((24,64),'Same approved PNG and tint. Main renderer preview only; branch renderer unchanged.',font=font(21),fill='#34434f')
            original=Image.open(sources/(slug+'.webp')).convert('RGBA');source=Image.new('RGBA',original.size,'white');source.alpha_composite(original)
            tiles=[('Own ESP source',percent(row['diameterFraction'])+' ink / full disc',disc_crop(source.convert('RGB'),row['sourceDiscBounds']))]
            for phase in ['before','preview']:
                record=v[phase][mold] if view=='top' else v[phase]['bag'][mold]
                im=Image.open(OUT/(phase+'-'+slug+('-viewer.png' if view=='top' else '-bag.png'))).convert('RGB')
                if view=='top':im=disc_crop(im,record['discBounds'])
                tiles.append(('Before: legacy cap' if phase=='before' else 'After: main preview',percent(record['renderedFraction'])+' rendered ink / full disc',im))
            for i,(title,label,im) in enumerate(tiles):
                x=20+i*495;d.rectangle((x,108,x+475,660),fill='white')
                d.text((x+14,122),title,font=font(25),fill='#17222c');d.text((x+14,162),label,font=font(20),fill='#34434f')
                im=ImageOps.contain(im,(450,445));board.paste(im,(x+(475-im.width)//2,206+(445-im.height)//2))
            d.text((24,680),f"Measured source: {row['sourceInkDiameterPx']} px ink / {row['sourceDiscDiameterPx']} px disc = {percent(row['diameterFraction'])}",font=font(22),fill='#17222c')
            d.text((24,716),'Top: enlarged production viewer at 1.6x fitted distance.' if view=='top' else 'Bag: ordinary production desktop staged-disc pose; full screenshots retained.',font=font(20),fill='#34434f')
            board.save(OUT/('proof-'+slug+'-'+view+'.png'),optimize=True)
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--sources',type=Path,required=True);args=parser.parse_args();compose(args.sources)
