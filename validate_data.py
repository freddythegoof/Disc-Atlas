import csv,json,math,os,hashlib
from stamp_manifest import validate_stamp_fields
root=os.path.dirname(__file__)
catalog=json.load(open(root+'/public/data.json'));data=catalog['discs']
records=list(csv.DictReader(open(root+'/source-data/pdga-approved-discs.csv')))
registry={hashlib.sha1((r['Manufacturer / Distributor']+'|'+r['Disc Model']+'|'+r['Approved Date']).encode()).hexdigest()[:12]:r for r in records}
expected={k:(r['Manufacturer / Distributor'],r['Disc Model'],r['Approved Date'])for k,r in registry.items()}
# Every registry row appears, or a reviewed merge entry folds it into a surviving record.
merges=json.load(open(root+'/source-data/merged-records.json'))['merges']
folded={m['folded']:m['surviving'] for m in merges}
assert len(folded)==len(merges),'Duplicate merge entry'
for m in merges:
 assert m['folded'] in registry,'Merge entry names a nonexistent folded record'
 assert m['surviving'] in registry,'Merge entry names a nonexistent surviving record'
 assert m['surviving'] not in folded,'Merge entry survives into a folded record'
 assert expected[m['folded']][0]==expected[m['surviving']][0],'Merge entry crosses manufacturers'
 assert m.get('reason','').strip(),'Merge entry gives no reason'
ids={d['id'] for d in data}
assert len(ids)==len(data),'Duplicate IDs'
assert not ids&set(folded),'Folded record also emitted'
surviving={k:v for k,v in expected.items() if k not in folded}
assert set(surviving)<=ids,'Registry records omitted without a merge entry'
assert len(data)==len(surviving),'Registry records omitted'
assert {d['id']:(d['manufacturer'],d['name'],d['date'])for d in data}==surviving,'Registry identity or approval name changed'
assert catalog['meta']['idAliases']==folded,'Folded IDs must resolve through meta.idAliases'
assert catalog['meta']['registryCount']==len(data),'Registry count disagrees with the records'
by_id={d['id']:d for d in data}
verified_ids={d['id'] for d in json.load(open(root+'/source-data/verified-model-overrides.json'))['overrides']}
assert not verified_ids&set(folded),'Verified override names a folded record'
for m in merges:
 survivor=by_id[m['surviving']]
 for r in (registry[m['folded']],registry[m['surviving']]):
  assert r['Certification Number'] in survivor.get('catalogNote','') and r['Approved Date'] in survivor['catalogNote'],'Surviving record lost an approval from its history'
 assert registry[m['folded']]['Disc Model'] in survivor.get('aliases',[]),'Folded name no longer searches to the surviving record'
manifest=json.load(open(root+'/source-data/photo-manifest.json'))
stamps=validate_stamp_fields(json.load(open(root+'/source-data/stamp-manifest.json')),data,root+'/public')
print(f'Validated {len(stamps)} Discraft stock stamp assets and their rights records.')
assert set(manifest).issubset(expected),'Photo assigned to nonexistent approval'
reviewed=json.load(open(root+'/source-data/catalog-reconciliation.json'))['matches']
assert len({d['id']for d in reviewed})==len(reviewed),'Duplicate reviewed match'
assert all(d['sourceLabel']!='Pending verification' for d in reviewed),'Unverified catalog ratings'
for d in reviewed:
 assert expected[d['id']][1]==d['approvalName'],'Reviewed model identity changed'
for d in data:
 if 'speed' in d:
  assert all(math.isfinite(d[k]) for k in ['speed','glide','turn','fade'])
  assert 0<d['speed']<=15
 if 'photo' in d:
  assert os.path.isfile(root+'/public/'+d['photo'])
  assert os.path.getsize(root+'/public/'+d['photo'])>1000
assert all(os.path.isfile(root+'/public/'+x) for x in ['style.css','app.js','icon.svg'])
print(f'Validated {len(data)} approval records, {sum("speed" in d for d in data)} flight matches, {sum("photo" in d for d in data)} local photos, {len(folded)} reviewed merges.')

assert os.path.isfile(root+'/web/index.html')
