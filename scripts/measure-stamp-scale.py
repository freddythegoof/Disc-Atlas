"""Read source/approved alpha pixels; never rewrite stamp artwork."""
import json, hashlib
from pathlib import Path
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/assets/stamp-scale-fix'
# Read the original pilot classifier without its asset-save side effect.
code=(ROOT/'scripts/extract-discraft-stamps.py').read_text().split("if __name__")[0]
code=code.replace('ink.save(destination, optimize=True)', 'pass').replace('return im, ink','return im, ink, box')
ns={'__file__':str(ROOT/'scripts/extract-discraft-stamps.py')};exec(code,ns)
rows=[]
for mold in ['buzzz','zone','luna','hades']:
    if mold=='hades':
        source=OUT/'hades-source.webp';asset=OUT/'hades-asset.png'
        assert hashlib.sha256(source.read_bytes()).hexdigest()=='1537911373eafd77b4b946e4b3adaa1dc08244b48591269ff53afa4563462da7'
        im=Image.open(source).convert('RGB');rgb=np.asarray(im,dtype=float)/255
        r,g,b=rgb.transpose(2,0,1);h,w=r.shape;y,x=np.mgrid[:h,:w]
        a=np.clip((b-g-.12)/.18,0,1)*((x/w>.19)&(x/w<.81)&(y/h>.20)&(y/h<.80))
        box=Image.fromarray(np.uint8(a*255)).getbbox()
        # Full outer disc, not the plate: chromatic silhouette at its centre axes.
        spans=[]
        for c in [rgb[h//2,:,:],rgb[:,w//2,:]]:
            v=np.flatnonzero((c.max(1)-c.min(1)>.12)&(c.min(1)<.85));spans.append([int(v[0]),int(v[-1]+1)])
        diameter=max(v[1]-v[0] for v in spans);discBounds=[spans[0][0],spans[1][0],spans[0][1],spans[1][1]]
    else:
        source=ROOT/'source-data/stamp-sources'/(mold+'.png');asset=ROOT/'public/stamps/discraft'/(mold+'.png')
        im,_,box=ns['extract'](mold);a=np.asarray(Image.open(source).convert('RGBA'))[:,:,3];h,w=a.shape
        spans=[]
        for c in [a[h//2,:],a[:,w//2]]:
            v=np.flatnonzero(c>127);spans.append([int(v[0]),int(v[-1]+1)])
        diameter=max(v[1]-v[0] for v in spans);discBounds=[spans[0][0],spans[1][0],spans[0][1],spans[1][1]]
    mask=Image.open(asset);inkBox=mask.getchannel('A').getbbox();ink=max(box[2]-box[0],box[3]-box[1]);assetInk=max(inkBox[2]-inkBox[0],inkBox[3]-inkBox[1]);assert ink==assetInk
    rows.append(dict(mold=mold,sourceSize=list(im.size),sourceDiscBounds=discBounds,sourceDiscDiameterPx=diameter,sourceInkBounds=list(box),stampDiameterPx=ink,assetSize=list(mask.size),assetInkBounds=list(inkBox),diameterFraction=ink/diameter,assetInkFraction=ink/mask.width,textureDiameterFraction=mask.width/diameter,sourceSHA256=hashlib.sha256(source.read_bytes()).hexdigest(),assetSHA256=hashlib.sha256(asset.read_bytes()).hexdigest()))
OUT.mkdir(parents=True,exist_ok=True);(OUT/'measurements.json').write_text(json.dumps(rows,indent=2)+'\n')
for r in rows: print(r['mold'], 'source',round(r['diameterFraction']*100,3),'asset ink',round(r['assetInkFraction']*100,3),'texture/disc',round(r['textureDiameterFraction']*100,3))
