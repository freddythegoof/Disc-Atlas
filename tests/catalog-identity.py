"""Regression checks for the 2025 Discmania rename across separate PDGA approvals."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class DiscmaniaIdentity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.discs = {d['id']: d for d in json.loads((ROOT / 'public/data.json').read_text())['discs']}

    def test_current_names_keep_each_approval_and_its_flight_numbers(self):
        cases = [
            ('3bd98a3bc639', 'FD1', '22-211', 'FD2', (7, 4, 0, 2)),
            ('3d70ef38ff0e', 'FD2 (new)', '25-150', 'FD2', (7, 4, 0, 2)),
            ('6d63e6972109', 'Instinct (150-175g)', '19-19', 'FD1', (7, 5, 0, 2)),
        ]
        for disc_id, approval, certification, current_name, numbers in cases:
            with self.subTest(certification=certification):
                d = self.discs[disc_id]
                self.assertEqual((d['name'], d['certification']), (approval, certification))
                self.assertEqual(d.get('catalogName'), current_name)
                self.assertEqual(tuple(d[k] for k in ('speed', 'glide', 'turn', 'fade')), numbers)
                self.assertIn('mid-2025', d.get('catalogNote', ''))
                for name in ('FD1', 'FD2', 'Instinct'):
                    self.assertIn(name, d['catalogNote'])
                self.assertEqual(d['flightSource'], f'https://www.discmania.net/collections/{current_name.lower()}')

    def test_overlapping_fd2_approvals_are_explained_and_not_merged(self):
        old, new = self.discs['3bd98a3bc639'], self.discs['3d70ef38ff0e']
        self.assertIn('25-150', old.get('catalogNote', ''))
        self.assertIn('22-211', new.get('catalogNote', ''))
        self.assertIn('separate', old['catalogNote'])
        self.assertIn('separate', new['catalogNote'])
        self.assertEqual((old['specs']['Height'], new['specs']['Height']), ('1.7', '1.8'))

    def test_earlier_fd2_approvals_do_not_inherit_modern_ratings(self):
        for disc_id, certification in [('6b52d0c4809f', '14-22'), ('918e7f9228cd', '18-34')]:
            d = self.discs[disc_id]
            self.assertEqual(d['certification'], certification)
            self.assertNotIn('speed', d)
            self.assertNotIn('catalogNote', d)
            self.assertNotIn('catalogName', d)


if __name__ == '__main__':
    unittest.main()
