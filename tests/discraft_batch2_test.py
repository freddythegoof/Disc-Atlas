"""Batch 2 source provenance, scale and catalog invariants against merged baseline."""
import hashlib,json,subprocess,unittest
from pathlib import Path
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
BASE='4005a8c'
def blob(file):return subprocess.check_output(['git','show',BASE+':'+file],cwd=ROOT)
class Batch2Tests(unittest.TestCase):
 def test_all_thirty_one_have_explicit_reviewed_outcome(self):
  old=json.loads(blob('docs/discraft-stamp-sweep/manifest.json'));targets=[e['mold'] for e in old if e['verdict']=='ready'];self.assertEqual(len(targets),31)
  new=json.loads((ROOT/'docs/discraft-stamp-sweep/manifest.json').read_text());review=[e for e in new if e['mold'] in targets]
  self.assertTrue(all(e.get('batch')==2 for e in review))
  self.assertEqual(sum(e['verdict']=='extracted' for e in review),16)
  self.assertEqual(sum(e['verdict']=='fallback' for e in review),12)
  self.assertEqual(sum(e['verdict']=='retained-pilot' for e in review),3)
  for e in review:
   if e['verdict']=='fallback':self.assertTrue(e.get('extractionFailure'));self.assertIsNone(e['asset'])
  for a,b in zip(old,new):
   if a['mold'] not in targets:self.assertEqual(a,b)
 def test_existing_assignments_and_assets_are_immutable(self):
  old=json.loads(blob('source-data/stamp-manifest.json'));new=json.loads((ROOT/'source-data/stamp-manifest.json').read_text())
  self.assertEqual(new[:len(old)],old);self.assertEqual(len(new)-len(old),16)
  for e in old:self.assertEqual((ROOT/'public'/e['asset']).read_bytes(),blob('public/'+e['asset']))
 def test_exact_own_source_and_measured_scale(self):
  rows=json.loads((ROOT/'docs/assets/discraft-stamp-sweep/batch-2/extraction.json').read_text());self.assertEqual(len(rows),31)
  assignments=json.loads((ROOT/'source-data/stamp-manifest.json').read_text());baseline=json.loads(blob('docs/discraft-stamp-sweep/manifest.json'))
  for row in rows:
   if row['outcome']!='extracted':continue
   e=next(e for e in assignments if e['asset']==row['asset']);src=next(e for e in baseline if e['mold']==row['mold'])
   self.assertEqual(row['inkCountVerified'],1);self.assertEqual(e['sourceImageURL'],src['imageUrl']);self.assertEqual(e['sourceURL'],src['pageUrl']);self.assertEqual(e['sourceRetailer'],row['sourceRetailer']);self.assertEqual(e['sourceSHA256'],row['sourceSHA256'])
   asset=ROOT/'public'/row['asset'];self.assertEqual(hashlib.sha256(asset.read_bytes()).hexdigest(),row['assetSHA256'])
   im=Image.open(asset);a=np.asarray(im);self.assertTrue(np.all(a[:,:,:3]==255));self.assertEqual(im.width,im.height)
   y,x=np.nonzero(a[:,:,3]);self.assertTrue(np.all((x-(im.width-1)/2)**2+(y-(im.width-1)/2)**2<(im.width/2-3)**2))
   box=im.getchannel('A').getbbox();span=max(box[2]-box[0],box[3]-box[1]);self.assertEqual(span,row['sourceInkDiameterPx'])
   self.assertEqual(e['placement'],dict(diameterFraction=span/row['sourceDiscDiameterPx'],assetInkFraction=span/im.width));self.assertEqual(round(asset.stat().st_size/1000,3),row['assetKB'])
 def test_reviewed_edge_elements_are_complete(self):
  rows=json.loads((ROOT/'docs/assets/discraft-stamp-sweep/batch-2/extraction.json').read_text())
  # Independent source-coordinate samples from the arc, final R, and initial S.
  for mold,box,minimum in [('Ares',(1024,397,1536,447),4000),('Raptor',(1664,1749,1792,1924),4000),('Stalker',(297,621,315,661),150)]:
   row=next(r for r in rows if r['mold']==mold);a=Image.open(ROOT/'public'/row['asset']).getchannel('A')
   sx,sy,_,_=row['sourceInkBounds'];ox,oy=row['assetPasteOffset'];l,t,r,b=box
   crop=np.asarray(a.crop((l-sx+ox,t-sy+oy,r-sx+ox,b-sy+oy)))
   self.assertGreater(int(np.count_nonzero(crop>250)),minimum,mold+' source element clipped')
 def test_ares_upper_right_plastic_is_excluded(self):
  row=next(r for r in json.loads((ROOT/'docs/assets/discraft-stamp-sweep/batch-2/extraction.json').read_text()) if r['mold']=='Ares')
  a=Image.open(ROOT/'public'/row['asset']).getchannel('A');sx,sy,_,_=row['sourceInkBounds'];ox,oy=row['assetPasteOffset'];w,h=row['sourceSize']
  crop=a.crop((int(w*.78)-sx+ox,int(h*.14)-sy+oy,int(w*.83)-sx+ox,int(h*.17)-sy+oy))
  self.assertIsNone(crop.getbbox(),'Ares source plastic entered alpha')
 def test_prepare_identity_invariant(self):
  old=json.loads(blob('public/data.json'));new=json.loads((ROOT/'public/data.json').read_text());self.assertEqual(old['meta'],new['meta'])
  strip=lambda ds:[{k:v for k,v in d.items() if k not in ('stampAsset','stampPlacement')} for d in ds]
  self.assertEqual(strip(old['discs']),strip(new['discs']));self.assertEqual(len(new['discs']),2434)
if __name__=='__main__':unittest.main()
