import csv,json,math,os,hashlib
root=os.path.dirname(__file__)
data=json.load(open(root+'/public/data.json'))['discs']
records=list(csv.DictReader(open(root+'/source-data/pdga-approved-discs.csv')))
assert len(data)==len(records),'Registry records omitted'
assert len({d['id'] for d in data})==len(data),'Duplicate IDs'
expected={hashlib.sha1((r['Manufacturer / Distributor']+'|'+r['Disc Model']+'|'+r['Approved Date']).encode()).hexdigest()[:12]:(r['Manufacturer / Distributor'],r['Disc Model'],r['Approved Date'])for r in records}
assert {d['id']:(d['manufacturer'],d['name'],d['date'])for d in data}==expected,'Registry identity or approval name changed'
manifest=json.load(open(root+'/source-data/photo-manifest.json'))
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
print(f'Validated {len(data)} approval records, {sum("speed" in d for d in data)} flight matches, {sum("photo" in d for d in data)} local photos.')

assert os.path.isfile(root+'/web/index.html')
