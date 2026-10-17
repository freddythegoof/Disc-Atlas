"""Batch 2: source-pixel classification only; no reconstruction or shared artwork.
Inputs: 31 exact source originals recorded by the expansion manifest.
Outputs: candidate white-RGB/alpha PNGs and source/three-background evidence.
Review candidates before --apply; rejected candidates never enter public assignments.
"""
import argparse,hashlib,json,subprocess,shutil
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/assets/discraft-stamp-sweep/batch-2'
RECIPES={
 'Anax':('r-g',-.10,.10,(.18,.20,.83,.82)),
 'Ares':('g-b',-.04,.12,(.18,.14,.83,.81)),
 'Athena':('g-b',-.19,.04,(.18,.18,.82,.82)),
 'Cicada':('g-b',-.04,.16,(.15,.28,.88,.80)),
 'Crank':('r-b',.12,.16,(.12,.30,.85,.84)),
 'Flick':('dark',.65,.15,(.12,.29,.86,.84)),
 'Joy':('b-r',-.20,.15,(.12,.10,.88,.90)),
 'Malita':('dark-g',.72,.10,(.18,.18,.83,.82)),
 'Malta':('pink',.02,.05,(.17,.17,.84,.85)),
 'Nuke SS':('r-g',.10,.15,(.12,.28,.88,.79)),
 'Raptor':('r-g',-.20,.10,(.12,.18,.86,.84)),
 'Scorch':('dark',.70,.15,(.12,.28,.86,.85)),
 'Sled':('dark',.45,.18,(.12,.28,.85,.82)),
 'Stalker':('dark-g',.60,.20,(.12,.16,.85,.83)),
 'Swarm':('r-b',.02,.15,(.12,.26,.86,.86)),
 'Undertaker':('blue-ratio',.50,.20,(.12,.28,.88,.81)),
 'Venom':('r-g',-.15,.08,(.12,.28,.86,.85)),
 'Vulture':('r-g',-.05,.12,(.12,.16,.86,.85)),
 'Zone OS':('r-g',-.12,.10,(.12,.28,.86,.85)),
 'Zone SS':('b-r',-.35,.15,(.12,.28,.88,.81)),
}
DROPS={
 'Malta':(1,'Trial mask loses patterned foil detail in the lower ring and fine number strip. Lower thresholds admit plastic swirls. Rejected on fidelity; fallback retained.'),
 'Venom':(1,'Trial mask loses patterned foil within the wordmark and fine flight strip. Rejected on fidelity; neither Venom catalog approval is assigned.'),
 'Vulture':(1,'Trial mask breaks the signature, wordmark outline and tiny champion/flight detail where patterned foil overlaps plastic hues. Rejected on fidelity; fallback retained.'),
 'Zone OS':(1,'Trial mask cannot retain the complete ESP, ZONE OS and flight strip through rainbow foil reflections. Rejected on fidelity; fallback retained.'),
 'Nuke':(2,'Two distinct solid inks: blue PP mark and champion line; black Discraft, NUKE, flight strip and ESP. Single-ink flattening prohibited; fallback retained.'),
 'Buzzz SS':(2,'Pink McBeth signature/champion line and black main stamp are distinct inks. Single-ink flattening prohibited; fallback retained.'),
 'Buzzz OS':(None,'White PP signature and gold/black main foil have independently different appearance; cannot verify a genuinely single-ink design from this source. Fallback retained.'),
 'Cigarra':(2,'Blue AB signature/champion line and black main stamp are distinct inks. Single-ink flattening prohibited; fallback retained.'),
 'Hallux':(None,'Blue main art and dark first-run/flight strip cannot be verified as one ink from this source. Fallback retained rather than silently merging ink regions.'),
 'Drone':(1,'Single reflective silver foil overlaps pale blue plastic and white glare through fine Discraft detail. Complete separation is not reliable without guessing; fallback retained.'),
 'Nuke OS':(1,'Rainbow foil traverses blue/cyan hues also present in the plastic, especially ESP and Nuke OS/flight detail. Complete separation cannot be verified; fallback retained.'),
 'Sol':(None,'Silver upper signature/wordmark and dark lower SOL/flight strip cannot be verified as one ink. Reflective fine flight detail is also low contrast; fallback retained.'),
}
RETAILERS={'marshall-street':'Marshall Street','reaper-discs':'Reaper Discs','otb-discs':'OTB Discs','gotta-go-gotta-throw':'Gotta Go Gotta Throw'}
def slug(m):return m.lower().replace(' ','-')
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def run(sources,apply):
 OUT.mkdir(parents=True,exist_ok=True)
 sweep=json.loads((ROOT/'docs/discraft-stamp-sweep/manifest.json').read_text())
 baseline=json.loads(subprocess.check_output(['git','show','4005a8c:docs/discraft-stamp-sweep/manifest.json'],cwd=ROOT))
 targets=[e for e in baseline if e['verdict']=='ready'];assert len(targets)==31
 assignments=json.loads(subprocess.check_output(['git','show','4005a8c:source-data/stamp-manifest.json'],cwd=ROOT));results=[]
 for e in targets:
  mold=e['mold'];name=slug(mold);p=sources/(name+'.source');im=Image.open(p).convert('RGB');w,h=im.size
  assert [w,h]==[e['imageWidth'],e['imageHeight']]
  row=dict(mold=mold,sourceRetailer=RETAILERS[e['source']],sourceURL=e['pageUrl'],sourceImageURL=e['imageUrl'],sourceSHA256=digest(p),sourceSize=[w,h],flags=e['flags'],assetKB=0)
  source=im.copy();source.thumbnail((1300,1300));source.save(OUT/(name+'-source.jpg'),quality=95)
  if mold in ('Buzzz','Zone','Luna'):
   row.update(outcome='control-unchanged',reason='Existing approved pilot asset and placement retained unchanged; this alternate revision is not extracted.',inkCountVerified=None)
  elif mold in DROPS:
   count,reason=DROPS[mold];row.update(outcome='fallback',reason=reason,inkCountVerified=count)
  else:
   mode,t,ramp,roi=RECIPES[mold];rgb=np.asarray(im,dtype=np.float32)/255;r,g,b=rgb.transpose(2,0,1)
   scores={'pink':r-(g+b)/2,'r-g':r-g,'g-r':g-r,'g-b':g-b,'r-b':r-b,'b-r':b-r,'r':r,'dark':1-np.maximum.reduce([r,g,b]),'dark-g':1-g,'blue-ratio':(b-r)/(b+r+.01)}
   score=scores[mode];alpha=np.clip((score-t)/ramp,0,1)
   yy,xx=np.mgrid[:h,:w];l,top,rr,bb=roi;alpha*=((xx/w>l)&(xx/w<rr)&(yy/h>top)&(yy/h<bb))
   if mold=='Raptor':
    alpha*=(((xx/w>.30)&(xx/w<.76)&(yy/h>.18)&(yy/h<.35))|((xx/w>.15)&(xx/w<.84)&(yy/h>.33)&(yy/h<.61))|((xx/w>.34)&(xx/w<.72)&(yy/h>.68)&(yy/h<.78))|((xx/w>.40)&(xx/w<.66)&(yy/h>.77)&(yy/h<.84)))
   if mold=='Zone SS':alpha*=(((xx/w>.37)&(xx/w<.64)&(yy/h>.33)&(yy/h<.43))|((xx/w>.17)&(xx/w<.84)&(yy/h>.43)&(yy/h<.61))|((xx/w>.32)&(xx/w<.70)&(yy/h>.58)&(yy/h<.66))|((xx/w>.41)&(xx/w<.62)&(yy/h>.65)&(yy/h<.74)))
   if mold=='Vulture':alpha*=(((xx/w>.30)&(xx/w<.76)&(yy/h>.22)&(yy/h<.32))|((xx/w>.15)&(xx/w<.84)&(yy/h>.33)&(yy/h<.63))|((xx/w>.34)&(xx/w<.70)&(yy/h>.68)&(yy/h<.86)))
   if mold=='Ares':alpha*=((xx/w-.50)**2+(yy/h-.48)**2<.34**2)
   if mold=='Malta':alpha*=((xx/w-.51)**2+(yy/h-.51)**2<.32**2)
   if mold=='Athena':alpha*=((xx/w-.50)**2+(yy/h-.50)**2<.32**2)
   if mold in ('Venom','Swarm'):
    alpha*=(((xx/w>.12)&(xx/w<.86)&(yy/h>.28)&(yy/h<.63))|((xx/w>.34)&(xx/w<.68)&(yy/h>.68)&(yy/h<.85)))
   if mold=='Stalker':alpha*=((yy/h<.65)|(xx/w>.30))
   if mold=='Scorch':alpha*=((yy/h<.65)|(xx/w>.35))
   if mold=='Raptor':alpha*=((yy/h>.38)|(xx/w>.24))
   if mold=='Joy':alpha*=((xx/w-.50)**2+(yy/h-.49)**2<.36**2)
   if mold=='Flick':alpha*=((yy/h<.63)|(xx/w>.37))
   mask=Image.fromarray(np.uint8(alpha*255));box=mask.getbbox();assert box
   mask=mask.crop(box);ay,ax=np.nonzero(np.asarray(mask));side=max(max(mask.size),int(np.ceil(2*np.max(np.hypot(ax-(mask.width-1)/2,ay-(mask.height-1)/2)))))+16
   square=Image.new('L',(side,side));offset=((side-mask.width)//2,(side-mask.height)//2);square.paste(mask,offset)
   ink=Image.new('RGBA',(side,side),(255,255,255,0));ink.putalpha(square)
   # Same full outer silhouette / larger centre-axis span rule as main.
   axes=[]
   if e['source']=='marshall-street':
    # Edges measured on median five-pixel bands. This rejects tinted
    # tabletop backgrounds. Joy's bottom table seam is explicitly excluded.
    for line in (np.median(rgb[h//2-2:h//2+3,:,:],axis=0),np.median(rgb[:,w//2-2:w//2+3,:],axis=1)):
     n=len(line);score=np.linalg.norm(line[6:]-line[:-6],axis=1)
     lo=int(np.argmax(score[:int(n*.08)]))+3
     end=int(n*.985) if mold=='Joy' else len(score)
     hi=int(np.argmax(score[int(n*.92)-3:end]))+int(n*.92)
     axes.append([lo,hi])
    method='maximum source-edge RGB gradient across median 5px centre bands; outer 8% searched; Joy table seam excluded'
   else:
    for line in (rgb[h//2,:,:],rgb[:,w//2,:]):
     ids=np.flatnonzero(line.min(1)<.92);axes.append([int(ids[0]),int(ids[-1]+1)])
    method='centre-axis outer silhouette; minimum RGB < .92 against white retailer background'
   diameter=max(z-a for a,z in axes);span=max(mask.size);placement=dict(diameterFraction=span/diameter,assetInkFraction=span/side)
   print(mold,'geometry',box,side,diameter,axes,flush=True)
   assert 0<placement['diameterFraction']<=placement['assetInkFraction']<=1,mold+' candidate exceeds source silhouette: inspect classifier leakage before assigning'
   ink.save(OUT/(name+'-candidate.png'),optimize=True)
   board=Image.new('RGB',(1500,540),'#d9dfe5');draw=ImageDraw.Draw(board)
   for i,(label,bg,fg) in enumerate([('White','#ffffff','#12161c'),('Black','#000000','#ffffff'),('Saturated','#0057d9','#ffffff')]):
    tile=Image.new('RGBA',(500,500),bg);a=square.copy();a.thumbnail((470,470));paint=Image.new('RGBA',a.size,fg);paint.putalpha(a);tile.alpha_composite(paint,((500-a.width)//2,(500-a.height)//2));board.paste(tile.convert('RGB'),(i*500,40));draw.text((i*500+12,12),label,fill='#12161c')
   board.save(OUT/(name+'-backgrounds.png'),optimize=True)
   measured=im.copy();d=ImageDraw.Draw(measured);d.rectangle((axes[0][0],axes[1][0],axes[0][1],axes[1][1]),outline='#00ffff',width=4);d.rectangle(box,outline='#ff0022',width=4);measured.thumbnail((1000,1000));measured.save(OUT/(name+'-measurement.jpg'),quality=93)
   row.update(outcome='candidate',inkCountVerified=1,inkReview='One continuous ink/foil design. Metallic brightness/pattern variations are within the same foil; no independent second-color imprint observed.',asset='stamps/discraft/'+name+'.png',assetKB=round((OUT/(name+'-candidate.png')).stat().st_size/1000,3),placement=placement,sourceDiscDiameterPx=diameter,silhouetteMethod=method,sourceCentreAxes=axes,sourceInkBounds=list(box),sourceInkDiameterPx=span,assetSize=[side,side],assetPasteOffset=list(offset),recipe=dict(channelTest=mode,threshold=t,ramp=ramp,roi=list(roi)))
  if apply:
   target=next(x for x in sweep if x['mold']==mold)
   target.update(batch=2,batch2Outcome=row['outcome'],inkCountVerified=row['inkCountVerified'],extractionReview=row.get('reason',row.get('inkReview')),reviewedSourceSHA256=row['sourceSHA256'])
   if row['outcome']=='candidate':
    assert len(e['catalogMatches'])==1, mold+' ambiguous catalog identity'
    match=e['catalogMatches'][0]
    shutil.copyfile(OUT/(name+'-candidate.png'),ROOT/'public'/row['asset'])
    row.update(outcome='extracted',assetSHA256=digest(ROOT/'public'/row['asset']))
    assignment=dict(id=match['id'],brand='Discraft',mold=match.get('catalogName') or match['name'],asset=row['asset'],sourceURL=e['pageUrl'],sourceImageURL=e['imageUrl'],sourceRetailer=row['sourceRetailer'],sourceSHA256=row['sourceSHA256'],capturedAt='2026-10-16',rightsBasis='Discraft permission, 2026-10-15, free resource',placement=row['placement'])
    assert assignment['id'] not in {a['id'] for a in assignments},mold+' would replace existing asset'
    assignments.append(assignment)
    target.update(verdict='extracted',batch2Outcome='extracted',asset=row['asset'],assetKB=row['assetKB'],placement=row['placement'],extractionRetailer=row['sourceRetailer'],extractionSourceURL=e['imageUrl'],sourceSHA256=row['sourceSHA256'])
   elif row['outcome']=='control-unchanged':
    old=next(a for a in assignments if a['mold']==mold)
    target.update(verdict='retained-pilot',asset=old['asset'],extractionRetailer='Discraft',extractionSourceURL=old['sourceURL'],placement=old['placement'],assetKB=round((ROOT/'public'/old['asset']).stat().st_size/1000,3))
   else:target.update(verdict='fallback',asset=None,assetKB=0,extractionFailure=row['reason'])
  results.append(row);print(mold,row['outcome'],row['assetKB'],flush=True)
 (OUT/'extraction.json').write_text(json.dumps(results,indent=2)+'\n')
 if apply:
  (ROOT/'source-data/stamp-manifest.json').write_text(json.dumps(assignments,indent=2)+'\n')
  (ROOT/'docs/discraft-stamp-sweep/manifest.json').write_text(json.dumps(sweep,indent=2)+'\n')
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--sources',type=Path,required=True);parser.add_argument('--apply',action='store_true');args=parser.parse_args();run(args.sources,args.apply)
