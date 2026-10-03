import json,csv,re,hashlib,os,unicodedata
ROOT=os.path.dirname(__file__)
def norm(s):return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',s.replace('+',' plus ')).encode('ascii','ignore').decode().lower())
alias={'Innova Champion Discs':'Innova','MVP Disc Sports':'MVP','Axiom Discs':'Axiom','Disc Golf Association':'DGA','Gateway Disc Sports':'Gateway','Latitude 64':'Latitude 64','Westside Golf Discs':'Westside','Prodigy Disc':'Prodigy','Lightning Discs':'Lightning','Millennium Golf Discs':'Millennium','Lone Star Disc':'Lone Star','Kastaplast':'Kastaplast','RPM Discs/Disc Golf Aotearoa':'RPM','Streamline Discs':'Streamline','Mint Discs':'Mint','Thought Space Athletics':'Thought Space Athletics'}
alias.update({'Axiom Discs':'Axiom','Westside Golf Discs':'Westside Discs','Lone Star Disc':'Lone Star Discs','Mint Discs':'Mint Discs','Yikun Discs':'Yikun','Legacy Discs':'Legacy','Viking Discs':'Viking','Storm Disc Golf':'Storm','Crosslap Disc Golf Parks':'Crosslap','AquaFlight Discs':'AquaFlight','Bernoulli':'Bernoulli Disc Golf','Birdie Disc Golf Supply':'Birdie','Finish Line Discs':'Finish Line'})
def brandnorm(s):return norm(alias.get(s,s))
f=json.load(open(ROOT+'/source-data/flights.json')); lookup={}
for d in f:
 k=(brandnorm(d['brand']),norm(d['name']))
 lookup[k]=d
photo_manifest=json.load(open(ROOT+'/source-data/photo-manifest.json'))
registry=list(csv.DictReader(open(ROOT+'/source-data/pdga-approved-discs.csv')))
recent=json.load(open(ROOT+'/source-data/recent-approvals.json'));urls={(norm(d['brand']),norm(d['name'])):d['url'] for d in recent}
status_data=json.load(open(ROOT+'/source-data/production-status.json'))
status_lookup={(norm(r['brand']),norm(r['name'])):r for r in status_data['overrides']}
verified_data=json.load(open(ROOT+'/source-data/verified-model-overrides.json'))
verified_lookup={r['id']:r for r in verified_data['overrides']}
reconciliation=json.load(open(ROOT+'/source-data/catalog-reconciliation.json'))
reviewed_matches={d['id']:d for d in reconciliation['matches']}
out=[]
os.makedirs(ROOT+'/public/photos',exist_ok=True)
for r in registry:
 brand=alias.get(r['Manufacturer / Distributor'],r['Manufacturer / Distributor']);name=r['Disc Model'];k=(brandnorm(brand),norm(name));match=lookup.get(k)
 # Only literal normalized model+brand matches. Do not guess variant ratings.
 d={'id':hashlib.sha1((r['Manufacturer / Distributor']+'|'+name+'|'+r['Approved Date']).encode()).hexdigest()[:12],'name':name,'brand':brand,'manufacturer':r['Manufacturer / Distributor'],'date':r['Approved Date'],'approved':True,'url':urls.get((norm(r['Manufacturer / Distributor']),norm(name)),'https://www.pdga.com/technical-standards/equipment-certification/discs?title='+__import__('urllib.parse',fromlist=['quote']).quote(name)),'specs':{'Diameter':r['Diameter (cm)'],'Height':r['Height (cm)'],'Rim width':r['Rim Thickness (cm)'],'Rim depth':r['Rim Depth (cm)'],'Max weight':r['Max Weight (gr)']},'certification':r['Certification Number']}
 if match:
  try:
   nums={a:float(match[a]) for a in ['speed','glide','turn','fade']}
   if all(__import__('math').isfinite(x) for x in nums.values()):d.update(nums);d['flightSource']=match['link'];d['category']=match.get('category','')
  except:pass
 # Third-party photos are excluded until a reviewed rights workflow is implemented.
 d['production']={'status':'catalog_listed' if match else 'unknown','checkedAt':status_data['checkedAt'],'source':d.get('flightSource'),'note':'Listed in the retrieved DiscIt / Marshall Street flight catalog. This does not independently verify ongoing production.' if match else 'Production status is not verified; approval date is not a production date.'}
 override=status_lookup.get((norm(brand),norm(name)))
 if override:d['production'].update({key:value for key,value in override.items() if key not in ['brand','name']})
 verified=verified_lookup.get(d['id'])
 if verified:
  assert verified['brand']==brand and verified['approvalName']==name, 'Reviewed approval mapping has changed'
  d.update(verified['flightNumbers']);d['category']=verified['category'];d['flightSource']=verified['source'];d['flightSourceLabel']=verified['brand'];d['catalogName']=verified['catalogName']
  d['flightMatchNote']='Manufacturer model matched to this specific PDGA approval; historical approvals kept separate.'
  # Current names and rename explanations come from reviewed source records, never registry edits.
  for key in ['catalogNote','aliases']:
   if key in verified:d[key]=verified[key]
  if verified.get('adjustmentNote'):
   # Atlas shifted a published rating: say so instead of passing it off as the manufacturer's numbers.
   d['flightSourceLabel']=verified['sourceLabel'];d['ratingBasis']='atlas_adjusted';d['flightNote']=verified['adjustmentNote'];d['manufacturerNumbers']=verified['manufacturerNumbers']
  d['production'].update(verified['production']);d['production']['checkedAt']=verified['checkedAt']
 reviewed=reviewed_matches.get(d['id'])
 if reviewed and 'speed' not in d:
  assert reviewed['approvalName']==name and reviewed['brand']==brand, 'Catalog mapping approval changed'
  d.update(reviewed['flightNumbers']);d['flightSource']=reviewed['source'];d['flightSourceLabel']=reviewed['sourceLabel'];d['catalogName']=reviewed['catalogName'].strip();d['flightMatchNote']=reviewed['method'];d['ratingBasis']='retailer_catalog' if reviewed['sourceLabel']=='Infinite Discs catalog ratings' else 'published_catalog'
  # A retailer can retain pages for retired molds. Listing alone is not proof of production.
  if d['production']['status']=='unknown' and (reviewed.get('currentCatalogEvidence',False) or __import__('datetime').datetime.strptime(d['date'],'%b %d, %Y')>=__import__('datetime').datetime(2024,9,24)):
   d['production'].update(status='catalog_listed',source=reviewed['source'],checkedAt=reviewed['checkedAt'],note='Matched to a published disc catalog. Ongoing production is not independently verified.')
  if reviewed.get('retailerSource'):d['retailerSource']=reviewed['retailerSource']
 out.append(d)
meta={'date':'September 24, 2026','catalogAuditDate':'September 24, 2026','registryCount':len(registry),'statusAsOf':status_data['checkedAt'],'retirementWindowMonths':24,'note':'All records from the PDGA approved-disc CSV export are included, including historical molds. Flight numbers are incomplete. Catalog imagery uses original generic illustrations. This is a dated snapshot, not a live feed.'}
json.dump({'meta':meta,'discs':out},open(ROOT+'/public/data.json','w'),separators=(',',':'))
print({'records':len(out),'rated':sum('speed'in x for x in out),'photos':sum('photo'in x for x in out),'brands':len(set(x['brand']for x in out))})
missing=sorted(set(r['Manufacturer / Distributor']for r in registry if not any(norm(alias.get(r['Manufacturer / Distributor'],r['Manufacturer / Distributor']))==norm(x['brand'])for x in f)))
print('Unmatched manufacturers',missing[:30])
