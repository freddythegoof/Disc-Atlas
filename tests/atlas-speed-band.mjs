// The speed axis is pure speed: every rated disc's shown Y stays within AtlasLayout.BAND (just under half
// the 1/14 between whole speeds) of (speed - 1) / 14, so a slower disc never sits above a faster one.
// Brute force over the real catalog: the shared positions, adapt for every manufacturer and type (and
// both together for Discmania), spread, and curate's rest toss for every tier the organic map rests,
// at every level, on desktop, phone and the docked frame. tests/atlas-speed-band-browser.mjs checks
// what the browser actually draws.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const runtime={};runtime.window=runtime;
vm.createContext(runtime);
for(const file of ['atlas-layout.js','atlas-groups.js'])vm.runInContext(fs.readFileSync('public/'+file,'utf8'),runtime);
const {AtlasGroups,AtlasLayout}=runtime,{BAND}=AtlasLayout;
const catalog=JSON.parse(fs.readFileSync('public/data.json','utf8')).discs;
const rated=catalog.filter(d=>d.speed!=null),base=AtlasLayout.positions(catalog);
const truth=d=>(d.speed-1)/14;
const typeOf=d=>d.category==='Putter'?'putter':d.category==='Midrange'?'mid':d.category==='Control Driver'?'fairway':d.category==='Distance Driver'?'distance':d.speed<=3?'putter':d.speed<=5?'mid':d.speed<=9?'fairway':'distance';
const STATES=[['unfiltered',rated]];
for(const brand of [...new Set(rated.map(d=>d.brand))].sort())STATES.push(['brand '+brand,rated.filter(d=>d.brand===brand)]);
for(const type of ['putter','mid','fairway','distance'])STATES.push(['type '+type,rated.filter(d=>typeOf(d)===type)]);
STATES.push(['Discmania distance',rated.filter(d=>d.brand==='Discmania'&&typeOf(d)==='distance')]);
const SIZES=[[1440,900,true],[1440,832,true],[390,844,true],[1000,600,false]];
const off=(y,d)=>Math.abs(y-truth(d));
const report=(misses,what)=>assert.deepEqual(misses.slice(0,20),[],`${misses.length} ${what} leave their speed band`);

test('the band is just under half the distance between whole speeds',()=>{
 assert.equal(BAND,.035);
 assert.ok(BAND<1/28,'Neighboring whole speeds never share a height');
});
test('every rated disc in the shared positions sits in its speed band',()=>{
 const misses=[];
 for(const d of rated)if(!(off(base.get(d.id).y,d)<BAND))misses.push(`${d.name} (${d.brand}): ${off(base.get(d.id).y,d).toFixed(4)}`);
 report(misses,'unfiltered discs');
});
test('adapt keeps every disc in its band, unfiltered, by manufacturer and by type',()=>{
 const misses=[];let count=0;
 for(const [w,h,immersive] of SIZES)for(const [name,set] of STATES){
  const shown=AtlasLayout.adapt(set,base,w,h,immersive);
  for(const d of set){count++;const y=shown.get(d.id).y;if(!(off(y,d)<BAND))misses.push(`${name} ${w}px: ${d.name} ${off(y,d).toFixed(4)}`);}
 }
 report(misses,'adapted discs');
 assert.ok(count>rated.length*SIZES.length,'Every state was measured');
});
test('Discmania: the 11-speed DD1s sit strictly below the 12-speed DD2, DD3 and Enigma',()=>{
 const set=rated.filter(d=>d.brand==='Discmania');
 const slow=set.filter(d=>/^(Premier )?DD1$/.test(d.name)),fast=set.filter(d=>/^(DD2 \(2025\)|Premier DD3|DD3 \(new\)|Enigma)$/.test(d.name));
 assert.equal(slow.length,2);assert.equal(fast.length,4);
 for(const [w,h,immersive] of SIZES){
  const shown=AtlasLayout.adapt(set,base,w,h,immersive);
  for(const s of slow)for(const f of fast)assert.ok(shown.get(s.id).y<shown.get(f.id).y,`${s.name} sits below ${f.name} at ${w}px`);
 }
});
test('whole speeds never interleave in any filtered layout',()=>{
 for(const [w,h,immersive] of SIZES)for(const [name,set] of STATES){
  const shown=AtlasLayout.adapt(set,base,w,h,immersive),top=new Map(),bottom=new Map();
  for(const d of set)if(Number.isInteger(d.speed)){const y=shown.get(d.id).y;
   top.set(d.speed,Math.max(top.get(d.speed)??-Infinity,y));bottom.set(d.speed,Math.min(bottom.get(d.speed)??Infinity,y));}
  const speeds=[...top.keys()].sort((a,b)=>a-b);
  for(let i=1;i<speeds.length;i++)assert.ok(top.get(speeds[i-1])<bottom.get(speeds[i]),`${name} ${w}px: speed ${speeds[i-1]} reaches above speed ${speeds[i]}`);
 }
});
test('spread searches only its speed band',()=>{
 const misses=[];
 for(const [name,set] of STATES){
  const shown=AtlasLayout.spread(set,base,1000,600);if(!shown)continue;
  for(const d of set){const y=shown.get(d.id).y;if(!(off(y,d)<BAND))misses.push(`${name}: ${d.name} ${off(y,d).toFixed(4)}`);}
 }
 // A few discs, all one speed, crowded together: the search runs wide across but never up or down out of the band.
 const crowd=Array.from({length:20},(_,i)=>({id:'crowd-'+i,speed:12,turn:-1,fade:3})),crowdBase=AtlasLayout.positions(crowd);
 const shown=AtlasLayout.spread(crowd,crowdBase,1000,600);
 for(const d of crowd)if(!(off(shown.get(d.id).y,d)<BAND))misses.push(`crowd: ${d.id} ${off(shown.get(d.id).y,d).toFixed(4)}`);
 report(misses,'spread discs');
});
// Curate, as the worker runs it, with fixed footprints in measureFullLabels' shape (see atlas-depth.mjs).
const prints=new Map(rated.map(d=>{const n=(d.catalogName||d.name).length;return [d.id,{x:-(n*7+12)/2,y:46,w:n*7+12,h:40,radius:38}];}));
const CHROME={1440:[{x:28,y:12,w:780,h:46},{x:600,y:720,w:240,h:70},{x:1200,y:770,w:215,h:50}],390:[{x:16,y:12,w:358,h:110},{x:16,y:610,w:358,h:90}]};
test('curate rests every tier in its speed band: curated discs, dots, small discs and minis',()=>{
 const misses=[],seen={curated:0,dot:0,small:0,mini:0};
 for(const [w,h] of [[1440,900],[390,844]])for(const [name,set] of STATES)for(const level of [0,2,4,6,8]){
  if(level>2&&!/^(unfiltered|brand Discmania|brand Innova|type distance)$/.test(name))continue;
  const area=AtlasLayout.bounds(w,h,true),shown=AtlasLayout.adapt(set,base,w,h,true);
  const result=AtlasGroups.build(set,shown,w,h,level,true,prints,[]);
  const chrome=Object.assign(CHROME[w].map(b=>({...b})),{key:String(w)});
  const options=AtlasGroups.organicOptions({area,width:w,height:h,level,zoom:AtlasGroups.organicRange(level).floor,extent:result.extent,chrome});
  const points=AtlasGroups.pointIds(result.points,set);
  const {gaps}=AtlasGroups.curate(result.groups,prints,options.zoom,2**(level/3),{...options,points});
  const byId=new Map(set.map(d=>[d.id,d])),unit=area.height*options.zoom;
  // A rest offset is screen px, y down; the atlas's Y runs up.
  for(const g of result.groups){
   if(g.hidden)continue;const d=byId.get(g.key),y=g.pos.y-(g.markerOffset?.y||0)/unit;seen[g.large?'curated':'dot']++;
   if(!(off(y,d)<BAND))misses.push(`${name} ${w}px L${level}: ${d.name} (${g.large?'curated':'dot'}) ${off(y,d).toFixed(4)}`);
  }
  for(const p of gaps){const d=byId.get(p.id),y=p.pos.y-p.y/unit;seen[p.tier]++;
   if(!(off(y,d)<BAND))misses.push(`${name} ${w}px L${level}: ${d.name} (${p.tier}) ${off(y,d).toFixed(4)}`);}
 }
 report(misses,'resting discs');
 for(const [tier,n] of Object.entries(seen))assert.ok(n>0,`Some ${tier} discs rested`);
});
