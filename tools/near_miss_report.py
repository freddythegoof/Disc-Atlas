"""Near-miss report: unrated PDGA records that almost match a flight-catalog entry.

Report only. Never writes ratings, never touches public/data.json or the matcher.
Run from the repo root:  python3 tools/near_miss_report.py [--all] [--json]
Candidates already given a verdict in source-data/near-miss-verdicts.json are hidden
unless --all is passed. Tiers: A paren-strip, B prefix, C token-set.
"""
import json,os,re,sys,unicodedata
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0,ROOT)
def norm(s):return re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',s.replace('+',' plus ')).encode('ascii','ignore').decode().lower())
def toks(s):return frozenset(re.findall('[a-z0-9]+',unicodedata.normalize('NFKD',s.replace('+',' plus ')).encode('ascii','ignore').decode().lower()))
def load_alias():
 src=open(ROOT+'/prepare_data.py').read()
 # prepare_data.py's fourth line used to be def norm. argparse now occupies that line, so take the norm definition and alias assignments by content.
 lines=[l for l in src.split('\n') if l.startswith('def norm') or l.startswith('alias')]
 ns={}
 exec('import re,unicodedata\n'+'\n'.join(lines),ns)
 return ns['alias']
def candidates():
 alias=load_alias();bn=lambda b:norm(alias.get(b,b))
 flights=json.load(open(ROOT+'/source-data/flights.json'))
 data=json.load(open(ROOT+'/public/data.json'))['discs']
 by_brand={}
 for d in flights:by_brand.setdefault(bn(d['brand']),[]).append(d)
 out=[]
 for r in data:
  if 'speed' in r:continue
  cat=by_brand.get(bn(r['brand']),[])
  if not cat:continue
  n=norm(r['name']);stripped=norm(re.sub(r'\([^)]*\)','',r['name']))
  hits={}
  for c in cat:
   cn=norm(c['name']);tier=None
   if stripped and stripped!=n and stripped==cn:tier='A'
   elif n!=cn and min(len(n),len(cn))>=3 and (n.startswith(cn) or cn.startswith(n)):tier='B'
   elif n!=cn and toks(r['name'])-toks(c['name'])!=toks(r['name']) and (toks(c['name'])<=toks(r['name']) or toks(r['name'])<=toks(c['name'])):tier='C'
   if tier and (c['name'] not in hits or tier<hits[c['name']][0]):hits[c['name']]=(tier,c)
  for cname,(tier,c) in hits.items():
   out.append({'tier':tier,'id':r['id'],'brand':r['brand'],'registryName':r['name'],'date':r['date'],'catalogName':c['name'],'catalogNumbers':[c.get(k) for k in ('speed','glide','turn','fade')],'catalogLink':c.get('link')})
 return sorted(out,key=lambda x:(x['tier'],x['brand'],x['registryName'],x['catalogName']))
def reviewed():
 p=ROOT+'/source-data/near-miss-verdicts.json'
 return {(v['id'],v['catalogName']) for v in json.load(open(p))['verdicts']} if os.path.exists(p) else set()
if __name__=='__main__':
 allc=candidates();done=reviewed()
 show=allc if '--all' in sys.argv else [c for c in allc if (c['id'],c['catalogName']) not in done]
 if '--json' in sys.argv:print(json.dumps(show,indent=1))
 else:
  print(f'{len(show)} candidate(s) shown ({len(allc)} total, {len(allc)-len(show)} already verdicted)')
  for c in show:print(f"[{c['tier']}] {c['brand']} | {c['registryName']} ({c['date']}) -> {c['catalogName']} {c['catalogNumbers']} id={c['id']}")
