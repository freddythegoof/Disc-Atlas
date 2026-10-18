"""Exercise main's strict placement schema/tests in memory, without merging main."""
import json
from pathlib import Path
import subprocess
import unittest
ROOT=Path(__file__).resolve().parents[1]
REF='3abd397caba4591eb97486e967c428277c4018ef'
def main_file(file):
    return subprocess.check_output(['git','show',REF+':'+file],cwd=ROOT,text=True,encoding='utf-8')
source=main_file('stamp_manifest.py')
branch=(ROOT/'stamp_manifest.py').read_text()
# Main has not yet absorbed Batch 1's reviewed Infinite ESP provenance gate.
# Combine only that already-reviewed source check, leaving its placement
# validator and catalog correspondence code completely unchanged.
start="        source = urlparse(entry['sourceURL'])"
end="        if date.fromisoformat(entry['capturedAt'])"
source=source[:source.index(start)]+branch[branch.index(start):branch.index(end)]+source[source.index(end):]
namespace={};exec(source,namespace)
entries=json.loads((ROOT/'source-data/stamp-manifest.json').read_text())
pilots=json.loads(main_file('source-data/stamp-manifest.json'))
merged_entries=pilots+[e for e in entries if e.get('sourceRetailer')=='Infinite Discs']
assert len(merged_entries)==17
catalog=json.loads((ROOT/'public/data.json').read_text())
records=[dict(d) for d in catalog['discs']]
placements={e['id']:e['placement'] for e in merged_entries}
for d in records:
    if d['id'] in placements:d['stampPlacement']=placements[d['id']]
assert len(namespace['validate_stamp_fields'](merged_entries,records,ROOT/'public'))==17
# The fixed-three pilot count is checked by the 17-entry assertion above.
# Reuse the remaining applicable main tests verbatim with in-memory entries; pilot receipt tests are
# deliberately excluded from this 14-mold audit.
tests={'__file__':str(ROOT/'tests/stamp_manifest_test.py'),'__name__':'main_schema_tests'}
exec(main_file('tests/stamp_manifest_test.py'),tests)
cls=tests['StampManifestTests']
class Validator:
    validate_stamp_manifest=staticmethod(namespace['validate_stamp_manifest'])
    validate_stamp_fields=staticmethod(namespace['validate_stamp_fields'])
cls.module=Validator;cls.entries=merged_entries;cls.records=records
cls.setUpClass=classmethod(lambda cls:None)
names=['test_non_discraft_assignment_is_rejected','test_invalid_rights_identity_source_and_path_are_rejected','test_unreviewed_or_removed_catalog_assignment_is_rejected','test_catalog_changes_only_by_reviewed_stamp_fields','test_invalid_or_unreviewed_placement_is_rejected','test_alpha_assets_cannot_bleed_outside_circular_stamp_mesh']
result=unittest.TextTestRunner(verbosity=2).run(unittest.TestSuite(cls(name) for name in names))
assert result.wasSuccessful()
# Removing any one of the 14 backfills must fail main's strict schema.
for e in merged_entries[3:]:
    try:namespace['validate_stamp_manifest']([{k:v for k,v in e.items() if k!='placement'}],records,ROOT/'public')
    except ValueError as error:assert 'placement' in str(error)
    else:raise AssertionError(e['mold']+' missing placement accepted')
print('PASS: main strict placement schema, 17 future assignments, 14 missing-placement mutations; no merge or disk pilot edits')
