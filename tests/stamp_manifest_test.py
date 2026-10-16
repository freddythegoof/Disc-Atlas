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
        self.assertEqual(len(self.module.validate_stamp_fields(self.entries,self.records,ROOT/'public')),3)

    def test_invalid_rights_identity_source_and_path_are_rejected(self):
        for change in [dict(brand='Innova'),dict(mold='Comet'),dict(asset='stamps/discraft/missing.png'),
                       dict(asset='stamps/discraft/../../data.json'),dict(sourceURL='https://example.com/buzzz'),
                       dict(rightsBasis='Discraft permission'),dict(capturedAt='2025-01-01')]:
            with self.subTest(change=change),self.assertRaises(ValueError):
                self.module.validate_stamp_manifest([{**self.entries[0],**change}],self.records,ROOT/'public')

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
        self.assertEqual(before['discs'],[{k:v for k,v in d.items() if k!='stampAsset'} for d in after['discs']])

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
