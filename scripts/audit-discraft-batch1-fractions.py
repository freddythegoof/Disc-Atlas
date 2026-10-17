"""Measure immutable Batch 1 source/alpha pairs; never extract or rewrite artwork.
python -X utf8 scripts/audit-discraft-batch1-fractions.py --sources <originals-folder>
Use --apply to backfill both source manifests after reviewing silhouette proofs.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import numpy as np
from PIL import Image, ImageDraw
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT/'docs/assets/discraft-stamp-sweep/batch-1-fraction-audit'
BASE = 'ba081fd'
STANDARD = '3abd397caba4591eb97486e967c428277c4018ef'

def digest(data):
    return hashlib.sha256(data).hexdigest()

def measure(sources):
    sweep=json.loads((ROOT/'docs/discraft-stamp-sweep/manifest.json').read_text())
    assignments=json.loads((ROOT/'source-data/stamp-manifest.json').read_text())
    entries=[e for e in sweep if e.get('batch')==1 and e.get('verdict')=='extracted']
    assert len(entries)==14, f'Expected 14, found {len(entries)}; no files changed'
    catalog=json.loads(subprocess.check_output(['git','show',BASE+':public/data.json'],cwd=ROOT))['discs']
    rows=[]
    for entry in entries:
        slug=entry['asset'].split('/')[-1].replace('.png','')
        file=sources/(slug+'.webp');data=file.read_bytes()
        assert digest(data)==entry['sourceSHA256'], entry['mold']+' source hash changed'
        im=Image.open(file);rgb=np.asarray(im.convert('RGB'),dtype=float)/255;h,w=rgb.shape[:2]
        assert [w,h]==entry['placement']['sourceSize']
        # Same centre-axis outer-silhouette rule as origin/main. Hades retains
        # the exact classifier from main's independently verified receipt.
        chroma,brightness=(.12,.85) if entry['mold']=='Hades' else (.08,.95)
        if im.mode=='RGBA':
            alpha=np.asarray(im.getchannel('A'))
            axes=[alpha[h//2,:]>127,alpha[:,w//2]>127]
            method={'channel':'source alpha','threshold':127}
        else:
            axes=[(line.max(1)-line.min(1)>chroma)&(line.min(1)<brightness) for line in [rgb[h//2,:,:],rgb[:,w//2,:]]]
            method={'channel':'chroma and minimum RGB','chromaAbove':chroma,'minimumRGBBelow':brightness}
        spans=[]
        for axis in axes:
            ids=np.flatnonzero(axis);assert len(ids)>0
            spans.append([int(ids[0]),int(ids[-1]+1)])
        diameter=max(b-a for a,b in spans)
        asset=ROOT/'public'/entry['asset'];asset_bytes=asset.read_bytes()
        baseline=subprocess.check_output(['git','show',BASE+':public/'+entry['asset']],cwd=ROOT)
        assert asset_bytes==baseline, entry['mold']+' artwork changed'
        ink=Image.open(asset);box=list(ink.getchannel('A').getbbox());side=ink.width;assert ink.width==ink.height
        p=entry['placement'];ox,oy=p['assetPasteOffset'];sx,sy,_,_=p['sourceInkBounds']
        source_box=[box[0]-ox+sx,box[1]-oy+sy,box[2]-ox+sx,box[3]-oy+sy]
        assert source_box==p['sourceInkBounds'], entry['mold']+' extraction mapping disagrees'
        span=max(box[2]-box[0],box[3]-box[1]);fraction=span/diameter;asset_fraction=span/side
        assert 0<fraction<=asset_fraction<=1, entry['mold']+' padding exceeds full disc; stop'
        assignment=next(e for e in assignments if e['asset']==entry['asset'])
        disc=next(d for d in catalog if d['id']==assignment['id'])
        # Legacy effective scale is recorded for comparison, never used to
        # infer the new fraction. Browser checks independently verify the cap.
        legacy=asset_fraction*6.2/(float(disc['specs']['Diameter'])/2)
        rows.append(dict(mold=entry['mold'],catalogMold=assignment['mold'],id=assignment['id'],slug=slug,asset=entry['asset'],
            sourceURL=entry['extractionSourceURL'],sourceRetailer=entry['extractionRetailer'],sourceSHA256=digest(data),sourceSize=[w,h],
            silhouetteMethod=method,sourceCentreAxes={'horizontal':spans[0],'vertical':spans[1]},sourceDiscBounds=[spans[0][0],spans[1][0],spans[0][1],spans[1][1]],
            sourceDiscDiameterPx=diameter,sourceInkBounds=source_box,sourceInkDiameterPx=span,assetSize=list(ink.size),assetInkBounds=box,assetSHA256=digest(asset_bytes),
            placementBefore=None,legacyEffectiveFraction=legacy,diameterFraction=fraction,assetInkFraction=asset_fraction,deltaPercentagePoints=(fraction-legacy)*100,
            textureDiameterFraction=side/diameter,standardCommit=STANDARD,baselineCommit=BASE))
    # All stop checks above finish before any output or manifest write.
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'measurements.json').write_text(json.dumps(rows,indent=2)+'\n')
    for row in rows:
        original=Image.open(sources/(row['slug']+'.webp')).convert('RGBA')
        white=Image.new('RGBA',original.size,'white');white.alpha_composite(original);proof=white.convert('RGB')
        scale=680/max(proof.size);proof=proof.resize((round(proof.width*scale),round(proof.height*scale)))
        board=Image.new('RGB',(720,760),'#f3f5f6');board.paste(proof,((720-proof.width)//2,55));draw=ImageDraw.Draw(board)
        dx=(720-proof.width)//2
        def point(x,y):return (round(dx+x*scale),round(55+y*scale))
        l,t,r,b=row['sourceDiscBounds'];w,h=row['sourceSize']
        draw.line([point(l,h//2),point(r,h//2)],fill='#008078',width=2)
        draw.line([point(w//2,t),point(w//2,b)],fill='#008078',width=2)
        l,t,r,b=row['sourceInkBounds'];draw.rectangle([point(l,t),point(r,b)],outline='#2929ff',width=2)
        draw.text((20,12),row['mold']+' | full outer disc centre axes (teal), approved ink bounds (blue)',fill='#17222c')
        draw.text((20,720),f"Ink {row['sourceInkDiameterPx']} / disc {row['sourceDiscDiameterPx']} = {row['diameterFraction']:.6%}",fill='#17222c')
        board.save(OUT/(row['slug']+'-measurement.jpg'),quality=94)
        print(row['mold'],f"source {row['diameterFraction']:.4%}; legacy {row['legacyEffectiveFraction']:.4%}; delta {row['deltaPercentagePoints']:+.4f} pp")
    return rows,sweep,assignments

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--sources',type=Path,required=True);parser.add_argument('--apply',action='store_true');args=parser.parse_args()
    rows,sweep,assignments=measure(args.sources)
    if args.apply:
        for row in rows:
            placement={k:row[k] for k in ['diameterFraction','assetInkFraction']}
            next(e for e in assignments if e['id']==row['id'])['placement']=placement
            next(e for e in sweep if e.get('asset')==row['asset'])['placement'].update(placement)
        for file,entries in [('source-data/stamp-manifest.json',assignments),('docs/discraft-stamp-sweep/manifest.json',sweep)]:
            (ROOT/file).write_text(json.dumps(entries,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
