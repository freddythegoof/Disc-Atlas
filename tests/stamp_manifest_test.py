"""Rights failures must stop both generation and validation."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
OVERRIDES = 'source-data/verified-model-overrides.json'
STAMP_FIELDS = {'stampAsset', 'stampPlacement'}
RATING_FIELDS = {
    'speed', 'glide', 'turn', 'fade', 'category', 'flightSource', 'flightSourceLabel',
    'catalogName', 'catalogNote', 'aliases', 'flightMatchNote', 'confidenceLabel',
    'ratingBasis', 'flightNote', 'manufacturerNumbers', 'retailerSource',
}

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
        remote = subprocess.run(['git', 'merge-base', 'origin/main', 'HEAD'], cwd=ROOT, capture_output=True, text=True)
        base = remote.stdout.strip() if remote.returncode == 0 else subprocess.check_output(
            ['git', 'merge-base', 'main', 'HEAD'], cwd=ROOT, text=True).strip()
        before=json.loads(subprocess.check_output(['git','show',base+':public/data.json'],cwd=ROOT))
        after=json.loads((ROOT/'public/data.json').read_text())
        old_overrides = json.loads(subprocess.check_output(['git', 'show', f'{base}:{OVERRIDES}'], cwd=ROOT))['overrides']
        overrides = json.loads((ROOT / OVERRIDES).read_text())['overrides']
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / 'data.json'
            subprocess.run([sys.executable, str(ROOT / 'prepare_data.py'), '--output', str(output)],
                           cwd=ROOT, check=True, capture_output=True)
            rebuilt = json.loads(output.read_text())['discs']
        # Reviewed merges can drop one record and enrich another.
        merges=json.loads((ROOT/'source-data/merged-records.json').read_text())['merges']
        folded,surviving={m['folded'] for m in merges},{m['surviving'] for m in merges}
        meta=lambda value:{k:v for k,v in value.items() if k not in ('registryCount','idAliases')}
        self.assertEqual(meta(before['meta']),meta(after['meta']))
        self.assert_reviewed_catalog_changes(
            before['discs'], after['discs'], rebuilt, old_overrides, overrides, folded | surviving)

    def assert_reviewed_catalog_changes(self, before, after, rebuilt, old_overrides=(), overrides=(), merged=()):
        # Keep the approval record intact. Only fields owned by an override may follow
        # the regenerated catalog. Include the old overrides so removals can restore defaults.
        active_overrides = {override['id'] for override in overrides}
        reviewed = {}
        for override in (*old_overrides, *overrides):
            reviewed.setdefault(override['id'], {'checkedAt'}).update(override['production'])
        generated = {record['id']: record for record in rebuilt}
        previous = [record for record in before if record['id'] not in merged]
        current = [record for record in after if record['id'] not in merged]
        self.assertEqual([record['id'] for record in previous], [record['id'] for record in current])
        for old, new in zip(previous, current):
            expected = {key: value for key, value in old.items() if key not in STAMP_FIELDS}
            actual = {key: value for key, value in new.items() if key not in STAMP_FIELDS}
            record_id = old['id']
            if record_id in reviewed:
                regenerated = generated[record_id]
                for key in RATING_FIELDS:
                    if key in regenerated:
                        expected[key] = regenerated[key]
                    else:
                        expected.pop(key, None)
                production_keys = reviewed[record_id]
                if record_id not in active_overrides:
                    # A removed override can expose the reviewed retailer-catalog fallback.
                    production_keys = production_keys | {'status', 'source', 'note'}
                expected['production'] = {
                    **{key: value for key, value in old['production'].items() if key not in production_keys},
                    **{key: value for key, value in regenerated['production'].items() if key in production_keys},
                }
            self.assertEqual(expected, actual, f'Unexpected catalog change for {record_id}')

    def test_reviewed_rating_can_add_flight_numbers_and_confidence(self):
        old = {'id': 'rated', 'name': 'Mold', 'production': {'status': 'unknown', 'checkedAt': '2026-09-23'}}
        new = {**old, 'speed': 6, 'glide': 5, 'turn': -2, 'fade': 1, 'confidenceLabel': 'Low',
               'production': {**old['production'], 'checkedAt': '2026-11-26'}}
        self.assert_reviewed_catalog_changes([old], [new], [new], overrides=[{'id': 'rated', 'production': {}}])

    def test_removed_override_can_restore_the_generated_rating(self):
        fallback = {'id': 'rated', 'name': 'Mold', 'speed': 5,
                    'retailerSource': 'https://example.com/mold',
                    'production': {'status': 'catalog_listed'}}
        reviewed = {'id': 'rated', 'name': 'Mold', 'speed': 6, 'confidenceLabel': 'Low',
                    'production': {'status': 'unknown'}}
        self.assert_reviewed_catalog_changes(
            [reviewed], [fallback], [fallback], old_overrides=[{'id': 'rated', 'production': {}}])

    def test_rating_override_does_not_exempt_unreviewed_catalog_edits(self):
        old = {'id': 'rated', 'name': 'Mold', 'speed': 5, 'production': {'status': 'unknown'}}
        generated = {**old, 'speed': 6}
        override = {'id': 'rated', 'production': {}}
        cases = [
            (generated, []),
            ({**generated, 'speed': 7}, [override]),
            ({**generated, 'name': 'Other mold'}, [override]),
            ({**generated, 'production': {'status': 'active'}}, [override]),
        ]
        for changed, overrides in cases:
            with self.subTest(changed=changed, overrides=overrides):
                with self.assertRaisesRegex(AssertionError, 'Unexpected catalog change for rated'):
                    self.assert_reviewed_catalog_changes([old], [changed], [generated], overrides=overrides)

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
