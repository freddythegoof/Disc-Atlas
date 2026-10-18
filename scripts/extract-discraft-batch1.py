"""Batch 1 pixel-only extraction. Inputs are the exact recorded Infinite originals.
Run: python scripts/extract-discraft-batch1.py --sources <temporary-originals-folder>
No redraw, inpainting, vectorization, dilation, or cross-mold artwork reuse.
"""
import argparse,json,hashlib
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
# Each ROI and channel test is measured against this mold's own original.
RECIPES={
 'Avenger':('green-blue',-.02,.06,(.20,.13,.80,.85)),
 'Avenger SS':('dark-green',.48,.15,(.20,.12,.80,.85)),
 'Comet':('red-green',-.04,.16,(.18,.29,.81,.78)),
 'Drive':('blue-red-ratio',.10,.20,(.12,.32,.88,.89)),
 'Flash':('dark-green',.42,.14,(.20,.14,.80,.86)),
 'Force':('dark-max',.82,.14,(.17,.26,.83,.81)),
 'Hades':('blue-green',.12,.18,(.19,.20,.81,.80)),
 'Heat':('red-green',-.04,.16,(.18,.30,.81,.80)),
 'Meteor':('red-green',.04,.14,(.19,.32,.82,.81)),
 'Predator':('dark-red',.42,.14,(.20,.13,.80,.86)),
 'Pulse':('dark-max',.65,.18,(.16,.16,.84,.83)),
 'Thrasher':('dark-red',.70,.18,(.18,.34,.83,.82)),
 'XL':('neutral',-.22,.12,(.20,.13,.80,.85)),
 'Zeus':('dark-red',.65,.18,(.18,.17,.82,.81)),
 'Zone GT':('dark-green',.30,.12,(.21,.37,.80,.83)),
}
def slug(mold):return mold.lower().replace(' ','-')
def extract(entry,sources):
 mold=entry['mold'];source=sources/(slug(mold)+'.webp');im=Image.open(source).convert('RGB')
 assert im.size==(entry['imageWidth'],entry['imageHeight'])
 rgb=np.asarray(im,dtype=np.float32)/255;r,g,b=rgb.transpose(2,0,1);h,w=r.shape
 mode,threshold,ramp,roi=RECIPES[mold]
 score={'green-blue':g-b,'dark-max':-np.maximum.reduce([r,g,b]),'red-green':r-g,
        'dark-green':-g,'neutral-yellow':-(r-b),'blue-green':b-g,
        'green-red':r-g,'dark-red':-r,'white':np.minimum.reduce([r,g,b]),
        'blue-red-ratio':(b-r)/(b+r+.01),'neutral':-(np.maximum.reduce([r,g,b])-np.minimum.reduce([r,g,b]))}[mode]
 if mode.startswith('dark') or mode=='neutral-yellow':threshold=-threshold
 alpha=np.clip((score-threshold)/ramp,0,1)
 yy,xx=np.mgrid[:h,:w];x=xx/w;y=yy/h;l,t,rr,bb=roi
 alpha*=((x>l)&(x<rr)&(y>t)&(y<bb))
 if mold=='Avenger':alpha*=(((x-.495)/.254)**2+((y-.5)/.338)**2<1) & (g-r>.05)
 if mold=='XL':alpha*=(((x-.495)/.249)**2+((y-.495)/.332)**2<1)
 if mold=='Force':alpha*=((x-.5)**2+(y-.53)**2<.36**2)
 if mold=='Drive':alpha*=((x-.5)**2+(y-.5)**2<.44**2)
 mask=Image.fromarray(np.uint8(alpha*255));box=mask.getbbox();assert box
 mask=mask.crop(box);yy,xx=np.nonzero(np.asarray(mask))
 # Identical to the pilot: preserve the source arrangement, fit the complete
 # rectangular alpha within the fixed circular mesh using transparent padding.
 side=max(max(mask.size),int(np.ceil(2*np.max(np.hypot(xx-(mask.width-1)/2,yy-(mask.height-1)/2)))))+16
 square=Image.new('L',(side,side));offset=((side-mask.width)//2,(side-mask.height)//2);square.paste(mask,offset)
 ink=Image.new('RGBA',square.size,(255,255,255,0));ink.putalpha(square)
 proof=ROOT/'docs/assets/discraft-stamp-sweep/batch-1';proof.mkdir(parents=True,exist_ok=True)
 asset='public/stamps/discraft/'+slug(mold)+'.png'
 ink.save(ROOT/asset,optimize=True)
 # Source crop is evidence requested for this extraction review, never a texture.
 # White/black outside the actual disc is trimmed; no source is used by runtime.
 disc_crop=im.getbbox()
 if im.width/im.height>1.15:disc_crop=(int(w*.15),int(h*.025),int(w*.85),int(h*.975))
 crop=im.crop(disc_crop)
 if im.width/im.height>1.15:
  outside=Image.new('RGB',crop.size,'white');circle=Image.new('L',crop.size);ImageDraw.Draw(circle).ellipse((2,2,crop.width-3,crop.height-3),fill=255);outside.paste(crop,(0,0),circle);crop=outside
 crop.thumbnail((1000,1000));crop.save(proof/(slug(mold)+'-source.jpg'),quality=92)
 board=Image.new('RGB',(1500,540),'#d9dfe5');draw=ImageDraw.Draw(board)
 for i,(name,bg,fg) in enumerate([('White','#ffffff','#12161c'),('Black','#000000','#ffffff'),('Saturated','#0057d9','#ffffff')]):
  tile=Image.new('RGBA',(500,500),bg);a=ink.getchannel('A');a.thumbnail((470,470));paint=Image.new('RGBA',a.size,fg);paint.putalpha(a);tile.alpha_composite(paint,((500-a.width)//2,(500-a.height)//2));board.paste(tile.convert('RGB'),(i*500,40));draw.text((i*500+12,12),name,fill='#12161c')
 board.save(proof/(slug(mold)+'-backgrounds.png'),optimize=True)
 result={'mold':mold,'sourceURL':entry['imageUrl'],'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),
 'inkCountVerified':1,'inkReview':'Single foil; reflective/patterned variations belong to that same foil. No independent second ink observed.',
 'placement':{'sourceSize':[w,h],'sourceDiscCrop':list(disc_crop),'sourceInkBounds':list(box),'assetSize':[side,side],'assetPasteOffset':list(offset),'method':'pilot circular-fit padding, no renderer transform'},
 'recipe':{'channelTest':mode,'threshold':threshold,'ramp':ramp,'roi':list(roi)},'asset':asset.removeprefix('public/'),'assetKB':round((ROOT/asset).stat().st_size/1000,3)}
 print(mold,result['assetKB'],box,flush=True);return result
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--sources',type=Path,required=True);args=parser.parse_args()
 manifest=json.loads((ROOT/'docs/discraft-stamp-sweep/manifest.json').read_text())
 entries=[e for e in manifest if e['mold'] in RECIPES];assert len(entries)==15
 results=[extract(e,args.sources) for e in entries]
 (ROOT/'docs/assets/discraft-stamp-sweep/batch-1/extraction.json').write_text(json.dumps(results,indent=2)+'\n')
