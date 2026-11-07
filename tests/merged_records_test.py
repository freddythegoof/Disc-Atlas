"""validate_data.py accounts for every reviewed merge: run it on broken copies of the catalog."""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FOLDED, SURVIVING = '3bd98a3bc639', '3d70ef38ff0e'


def merges(root):
    return json.loads((root / 'source-data/merged-records.json').read_text())


class MergedRecords(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        for name in ('validate_data.py', 'stamp_manifest.py'):
            shutil.copy(ROOT / name, self.root / name)
        for name in ('web', 'docs'):
            os.symlink(ROOT / name, self.root / name)
        # Only what these cases break, and the stamps a resolved path must find inside public, are real copies.
        for folder, copied in (('public', 'data.json'), ('source-data', 'merged-records.json')):
            (self.root / folder).mkdir()
            for entry in (ROOT / folder).iterdir():
                if entry.name == copied:
                    shutil.copy(entry, self.root / folder / entry.name)
                elif entry.name == 'stamps':
                    shutil.copytree(entry, self.root / folder / entry.name)
                else:
                    os.symlink(entry, self.root / folder / entry.name)
        self.list_path = self.root / 'source-data/merged-records.json'
        self.data_path = self.root / 'public/data.json'

    def validate(self):
        return subprocess.run([sys.executable, 'validate_data.py'], cwd=self.root, capture_output=True, text=True)

    def assertRejected(self, message):
        result = self.validate()
        self.assertNotEqual(result.returncode, 0, 'validate_data.py accepted a broken catalog')
        self.assertIn(message, result.stderr)

    def edit_list(self, change):
        value = merges(self.root)
        change(value['merges'])
        self.list_path.write_text(json.dumps(value))

    def edit_data(self, change):
        value = json.loads(self.data_path.read_text())
        change(value)
        self.data_path.write_text(json.dumps(value))

    def survivor(self, catalog):
        return next(d for d in catalog['discs'] if d['id'] == SURVIVING)

    def test_the_real_catalog_passes(self):
        result = self.validate()
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_a_folded_record_without_its_merge_entry_fails(self):
        self.edit_list(lambda rows: rows.clear())
        self.assertRejected('omitted without a merge entry')

    def test_an_unrelated_record_disappearing_fails(self):
        self.edit_data(lambda c: c['discs'].remove(next(d for d in c['discs'] if d['id'] == '6d63e6972109')))
        self.assertRejected('omitted without a merge entry')

    def test_a_merge_entry_naming_a_nonexistent_folded_id_fails(self):
        self.edit_list(lambda rows: rows[0].update(folded='000000000000'))
        self.assertRejected('nonexistent folded record')

    def test_a_merge_entry_naming_a_nonexistent_surviving_id_fails(self):
        self.edit_list(lambda rows: rows[0].update(surviving='000000000000'))
        self.assertRejected('nonexistent surviving record')

    def test_a_merge_entry_without_a_reason_fails(self):
        self.edit_list(lambda rows: rows[0].update(reason=' '))
        self.assertRejected('gives no reason')

    def test_a_folded_id_that_is_also_emitted_fails(self):
        self.edit_data(lambda c: c['discs'].append({**self.survivor(c), 'id': FOLDED, 'name': 'FD1', 'date': 'Nov 28, 2022'}))
        self.assertRejected('Folded record also emitted')

    def test_a_changed_surviving_id_fails(self):
        self.edit_data(lambda c: self.survivor(c).update(id='000000000000'))
        self.assertRejected('omitted without a merge entry')

    def test_a_missing_alias_map_fails(self):
        self.edit_data(lambda c: c['meta'].update(idAliases={}))
        self.assertRejected('meta.idAliases')

    def test_a_survivor_that_lost_the_folded_approval_fails(self):
        for lost in ('22-211', 'Nov 28, 2022', '25-150', 'Sep 29, 2025'):
            with self.subTest(lost=lost):
                self.setUp()
                self.edit_data(lambda c: self.survivor(c).update(catalogNote=self.survivor(c)['catalogNote'].replace(lost, '')))
                self.assertRejected('lost an approval')

    def test_a_survivor_that_lost_the_folded_name_fails(self):
        self.edit_data(lambda c: self.survivor(c).update(aliases=['FD1 (pre-mid-2025)']))
        self.assertRejected('Folded name')


if __name__ == '__main__':
    unittest.main()
