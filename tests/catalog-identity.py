"""Regression checks for the 2025 Discmania rename and the merged FD1 / FD2 approvals."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class DiscmaniaIdentity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        catalog = json.loads((ROOT / 'public/data.json').read_text())
        cls.discs = {d['id']: d for d in catalog['discs']}
        cls.meta = catalog['meta']

    def test_current_names_keep_each_approval_and_its_flight_numbers(self):
        cases = [
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

    def test_the_fd1_and_fd2_approvals_of_one_mold_are_one_record(self):
        self.assertNotIn('3bd98a3bc639', self.discs)
        self.assertEqual(self.meta['idAliases'], {'3bd98a3bc639': '3d70ef38ff0e'})
        d = self.discs['3d70ef38ff0e']
        self.assertEqual(d['production']['status'], 'catalog_listed')
        self.assertEqual(d['specs']['Height'], '1.8')
        self.assertEqual(d['aliases'], ['FD1', 'FD1 (pre-mid-2025)'])
        for text in ('approved as FD1 in 2022', 'renamed FD2 in 2025', '22-211', 'Nov 28, 2022', '25-150', 'Sep 29, 2025'):
            self.assertIn(text, d['catalogNote'])
        self.assertNotIn('separate', d['catalogNote'] + d['flightMatchNote'])
        self.assertEqual([x['id'] for x in self.discs.values() if x.get('catalogName') == 'FD2'], ['3d70ef38ff0e'])

    def test_the_instinct_record_stays_its_own_disc(self):
        d = self.discs['6d63e6972109']
        self.assertEqual(d['aliases'], ['Instinct'])
        self.assertIn('renamed the Instinct mold FD1', d['catalogNote'])

    def test_earlier_fd2_approvals_do_not_inherit_modern_ratings(self):
        for disc_id, certification in [('6b52d0c4809f', '14-22'), ('918e7f9228cd', '18-34')]:
            d = self.discs[disc_id]
            self.assertEqual(d['certification'], certification)
            self.assertNotIn('speed', d)
            self.assertNotIn('catalogNote', d)
            self.assertNotIn('catalogName', d)


if __name__ == '__main__':
    unittest.main()
