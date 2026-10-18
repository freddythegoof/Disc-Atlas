"""Rights failures must stop both generation and validation."""
import importlib.util
import json
from pathlib import Path
import unittest
import subprocess

ROOT = Path(__file__).resolve().parents[1]

class StampManifestTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location('stamps', ROOT / 'stamp_manifest.py')
        cls.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.module)
        cls.entries = json.loads((ROOT / 'source-data/stamp-manifest.json').read_text())
        cls.records = json.loads((ROOT / 'public/data.json').read_text())['discs']

    def test_non_discraft_assignment_is_rejected(self):
        spec = importlib.util.spec_from_file_location('stamps', ROOT / 'stamp_manifest.py')
        self.assertTrue(spec.loader and (ROOT / 'stamp_manifest.py').exists(), 'Stamp rights validator is missing')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        entry = dict(id='innova', brand='Discraft', mold='Destroyer', asset='stamps/discraft/buzzz.png',
                     sourceURL='https://www.discraft.com/buzzz', capturedAt='2026-10-16',
                     rightsBasis='Discraft permission, 2026-10-15, free resource')
        with self.assertRaisesRegex(ValueError, 'Discraft'):
            module.validate_stamp_manifest([entry], [{'id':'innova','brand':'Innova','name':'Destroyer'}], ROOT / 'public')

    def test_reviewed_assets_exist_and_match_generated_fields(self):
        self.assertEqual(len(self.module.validate_stamp_fields(self.entries,self.records,ROOT/'public')),len(self.entries))

    def test_invalid_rights_identity_source_and_path_are_rejected(self):
        for change in [dict(brand='Innova'),dict(mold='Comet'),dict(asset='stamps/discraft/missing.png'),
                       dict(asset='stamps/discraft/../../data.json'),dict(sourceURL='https://example.com/buzzz'),
                       dict(rightsBasis='Discraft permission'),dict(capturedAt='2025-01-01')]:
            with self.subTest(change=change),self.assertRaises(ValueError):
                self.module.validate_stamp_manifest([{**self.entries[0],**change}],self.records,ROOT/'public')

    def test_infinite_provenance_and_narrow_source_gate(self):
        entry={**self.entries[0], 'sourceURL':'https://infinitediscs.com/discraft-avenger/esp'}
        self.module.validate_stamp_manifest([entry],self.records,ROOT/'public')
        for url in ['http://infinitediscs.com/discraft-avenger/esp',
                    'https://infinitediscs.com/', 'https://infinitediscs.com/Inf_Uploads/foo.webp',
                    'https://infinitediscs.com.evil.test/discraft-avenger/esp',
                    'https://infinitediscs.com@evil.test/discraft-avenger/esp',
                    'https://infinitediscs.com/discraft-avenger',
                    'https://infinitediscs.com/innova-destroyer/esp']:
            with self.subTest(url=url),self.assertRaises(ValueError):
                self.module.validate_stamp_manifest([{**entry,'sourceURL':url}],self.records,ROOT/'public')

    def test_recorded_alternate_retailer_provenance(self):
        alternates=[e for e in self.entries if e.get('sourceRetailer') in ('Marshall Street','Reaper Discs')]
        self.assertTrue(alternates)
        for entry in alternates:
            self.module.validate_stamp_manifest([entry],self.records,ROOT/'public')
        entry=alternates[0]
        for change in [dict(sourceURL='https://www.marshallstreetdiscgolf.com/product/esp-destroyer'),dict(sourceImageURL=None),dict(sourceSHA256=None),dict(sourceRetailer='Discraft'),dict(sourceSHA256='0'*64),dict(sourceURL='https://www.marshallstreetdiscgolf.com/'),dict(sourceURL='https://user@www.marshallstreetdiscgolf.com/product/esp-anax-paul-mcbeth'),dict(sourceURL='http://www.marshallstreetdiscgolf.com/product/esp-anax-paul-mcbeth')]:
            with self.subTest(change=change),self.assertRaises(ValueError):
                self.module.validate_stamp_manifest([{**entry,**change}],self.records,ROOT/'public')

    def test_unreviewed_or_removed_catalog_assignment_is_rejected(self):
        records=[dict(d) for d in self.records]
        records[0]['stampAsset']='stamps/discraft/buzzz.png'
        with self.assertRaises(ValueError):
            self.module.validate_stamp_fields(self.entries,records,ROOT/'public')
        records=[dict(d) for d in self.records]
        next(d for d in records if d['id']=='7446eb39abe5').pop('stampAsset',None)
        with self.assertRaises(ValueError):
            self.module.validate_stamp_fields(self.entries,records,ROOT/'public')

    def test_catalog_changes_only_by_reviewed_stamp_fields(self):
        base=subprocess.check_output(['git','merge-base','main','HEAD'],cwd=ROOT,text=True).strip()
        before=json.loads(subprocess.check_output(['git','show',base+':public/data.json'],cwd=ROOT))
        after=json.loads((ROOT/'public/data.json').read_text())
        self.assertEqual(before['meta'],after['meta'])
        strip=lambda records:[{k:v for k,v in d.items() if k not in ('stampAsset','stampPlacement')} for d in records]
        self.assertEqual(strip(before['discs']),strip(after['discs']))

    def test_invalid_or_unreviewed_placement_is_rejected(self):
        for placement in [None,{},dict(diameterFraction=0,assetInkFraction=.9),dict(diameterFraction=float('nan'),assetInkFraction=.9),dict(diameterFraction=True,assetInkFraction=.9),dict(diameterFraction=.95,assetInkFraction=.8)]:
            with self.subTest(placement=placement),self.assertRaisesRegex(ValueError,'placement|texture'):
                self.module.validate_stamp_manifest([{**self.entries[0],'placement':placement}],self.records,ROOT/'public')
        records=[dict(d) for d in self.records]
        next(d for d in records if d['id']==self.entries[0]['id'])['stampPlacement']={'diameterFraction':.5,'assetInkFraction':.9}
        with self.assertRaisesRegex(ValueError,'placement'):
            self.module.validate_stamp_fields(self.entries,records,ROOT/'public')

    def test_pilot_measurements_match_approved_assets_and_full_disc(self):
        from PIL import Image
        measurements=json.loads((ROOT/'docs/assets/stamp-scale-fix/measurements.json').read_text())
        for e in self.entries:
            if e['mold'].lower() not in {r['mold'] for r in measurements}:continue
            row=next(r for r in measurements if r['mold']==e['mold'].lower())
            mask=Image.open(ROOT/'public'/e['asset']);box=mask.getchannel('A').getbbox()
            ink=max(box[2]-box[0],box[3]-box[1])
            self.assertAlmostEqual(e['placement']['diameterFraction'],ink/row['sourceDiscDiameterPx'])
            self.assertAlmostEqual(e['placement']['assetInkFraction'],ink/mask.width)

    def test_alpha_assets_cannot_bleed_outside_circular_stamp_mesh(self):
        from PIL import Image
        import numpy as np
        for e in self.entries:
            a=np.asarray(Image.open(ROOT/'public'/e['asset']))
            self.assertTrue(np.all(a[:,:,:3]==255),'Masks carry white RGB only')
            y,x=np.nonzero(a[:,:,3]);n=a.shape[0]
            self.assertTrue(np.all((x-(n-1)/2)**2+(y-(n-1)/2)**2<(n/2-3)**2))

if __name__ == '__main__':
    unittest.main()
