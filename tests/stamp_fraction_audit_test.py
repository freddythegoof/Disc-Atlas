"""Pre-merge placement backfill contract and immutable Batch 1 measurement receipts."""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]
BASE = 'ba081fd'

def blob(file):
    return subprocess.check_output(['git', 'show', BASE + ':' + file], cwd=ROOT)

class FractionAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        spec = importlib.util.spec_from_file_location('stamps', ROOT / 'stamp_manifest.py')
        cls.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.module)
        cls.entries = json.loads((ROOT / 'source-data/stamp-manifest.json').read_text())
        cls.catalog = json.loads((ROOT / 'public/data.json').read_text())

    def test_invalid_or_unreviewed_placement_is_rejected(self):
        for placement in [None, {}, dict(diameterFraction=0,assetInkFraction=.9),
                          dict(diameterFraction=float('nan'),assetInkFraction=.9),
                          dict(diameterFraction=True,assetInkFraction=.9),
                          dict(diameterFraction=.95,assetInkFraction=.8)]:
            with self.subTest(placement=placement), self.assertRaisesRegex(ValueError,'placement|texture'):
                self.module.validate_stamp_manifest([{**self.entries[0],'placement':placement}],self.catalog['discs'],ROOT/'public')
        records = [dict(d) for d in self.catalog['discs']]
        records[0]['stampPlacement'] = dict(diameterFraction=.5,assetInkFraction=.9)
        with self.assertRaisesRegex(ValueError,'placement'):
            self.module.validate_stamp_fields(self.entries,records,ROOT/'public')

    def test_exactly_fourteen_backfills_and_other_entries_unchanged(self):
        before = json.loads(blob('source-data/stamp-manifest.json'))
        batch = [e for e in self.entries if e.get('sourceRetailer') == 'Infinite Discs']
        self.assertEqual(len(batch),14)
        for old,new in zip(before,self.entries):
            if new in batch:
                self.assertEqual(set(new['placement']),{'diameterFraction','assetInkFraction'})
                self.assertEqual(old,{k:v for k,v in new.items() if k!='placement'})
            else:
                self.assertEqual(old,new)
        sweep = json.loads((ROOT/'docs/discraft-stamp-sweep/manifest.json').read_text())
        sweep_before = json.loads(blob('docs/discraft-stamp-sweep/manifest.json'))
        for old,new in zip(sweep_before,sweep):
            if old.get('batch') == 1 and old.get('verdict') == 'extracted':
                self.assertEqual({k:v for k,v in old.items() if k!='placement'}, {k:v for k,v in new.items() if k!='placement'})
                self.assertEqual(old['placement'],{k:v for k,v in new['placement'].items() if k not in ('diameterFraction','assetInkFraction')})
            else:
                self.assertEqual(old,new)

    def test_all_artwork_and_renderers_are_byte_identical(self):
        for e in self.entries:
            file='public/'+e['asset']
            self.assertEqual(hashlib.sha256(blob(file)).hexdigest(),hashlib.sha256((ROOT/file).read_bytes()).hexdigest(),file)
        for file in ['public/disc3d.js','public/disc3d/stamp.mjs','public/disc3d/viewer.mjs','public/disc3d/thumbnails.mjs','public/bag3d/viewer.mjs','public/collection3d/stage.mjs']:
            self.assertEqual(blob(file).replace(b'\r\n',b'\n'),(ROOT/file).read_bytes().replace(b'\r\n',b'\n'),file)

    def test_catalog_identity_and_only_fourteen_placement_additions(self):
        before=json.loads(blob('public/data.json'))
        self.assertEqual(len(before['discs']),2434)
        self.assertEqual(before['meta'],self.catalog['meta'])
        strip=lambda rows:[{k:v for k,v in d.items() if k!='stampPlacement'} for d in rows]
        self.assertEqual(strip(before['discs']),strip(self.catalog['discs']))
        self.assertEqual(sum('stampPlacement' in d for d in self.catalog['discs']),14)
        self.module.validate_stamp_fields(self.entries,self.catalog['discs'],ROOT/'public')

    def test_measurements_use_complete_approved_alpha_and_own_source(self):
        from PIL import Image
        rows=json.loads((ROOT/'docs/assets/discraft-stamp-sweep/batch-1-fraction-audit/measurements.json').read_text())
        self.assertEqual(len(rows),14)
        for row in rows:
            entry=next(e for e in self.entries if e['id']==row['id'])
            mask=Image.open(ROOT/'public'/entry['asset'])
            box=mask.getchannel('A').getbbox()
            ink=max(box[2]-box[0],box[3]-box[1])
            self.assertEqual(row['assetInkBounds'],list(box))
            self.assertEqual(row['assetSHA256'],hashlib.sha256((ROOT/'public'/entry['asset']).read_bytes()).hexdigest())
            self.assertEqual(row['sourceSHA256'],entry['sourceSHA256'])
            self.assertEqual(row['sourceURL'],entry['sourceImageURL'])
            self.assertEqual(ink,row['sourceInkDiameterPx'])
            self.assertEqual(entry['placement'],dict(diameterFraction=ink/row['sourceDiscDiameterPx'],assetInkFraction=ink/mask.width))
            self.assertLessEqual(entry['placement']['diameterFraction'],entry['placement']['assetInkFraction'])

if __name__ == '__main__':
    unittest.main()
