// The main Atlas's three tiers of depth (AtlasGroups.curate; tiers 2 and 3, small discs and minis,
// are AtlasGroups.GAP), on the real catalog with fixed footprints. Curated discs keep their size and
// rest exactly where they rested without the other tiers; small discs, then minis, fill the room they
// leave and keep their distance from everything. Each grows with the zoom, shows no name at 1x, and
// has its name fade in with its size, small discs first, only where names are reserved. The browser
// suite (tests/atlas-depth-browser.mjs) checks the real map, its frames, themes and screenshots.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const runtime={};runtime.window=runtime;
vm.createContext(runtime);
for(const file of ['atlas-layout.js','atlas-groups.js'])vm.runInContext(fs.readFileSync('public/'+file,'utf8'),runtime);
const {AtlasGroups,AtlasLayout}=runtime,G=AtlasGroups.GAP;
const discs=JSON.parse(fs.readFileSync('public/data.json','utf8')).discs.filter(d=>d.speed!=null);
const positions=AtlasLayout.positions(discs);
// Fixed footprints in the shape measureFullLabels gives: a 76px disc with its name 52px below the
// center, and a small disc's one-line name 11px below its center. Width follows the name's length.
const prints=new Map(discs.map(d=>{const n=(d.catalogName||d.name).length;
 return [d.id,{x:-(n*7+12)/2,y:46,w:n*7+12,h:40,radius:38,gap:{x:-(n*5.6+4)/2,y:9,w:n*5.6+4,h:17.75}}];}));
const VIEWS={desktop:[1440,900],phone:[390,844]};
// The chrome over a 1x map (filters, search and chips; the caption; the zoom controls), in map pixels.
const CHROME={desktop:[{x:28,y:12,w:780,h:46},{x:600,y:720,w:240,h:70},{x:1200,y:770,w:215,h:50}],
 phone:[{x:16,y:12,w:358,h:110},{x:16,y:610,w:358,h:90}]};
// A level's layout, as the worker makes it: build, then curate at the level's floor.
function layout(view,level,{points=true,first=null}={}){
 const [w,h]=VIEWS[view],area=AtlasLayout.bounds(w,h,true);
 const result=AtlasGroups.build(discs,positions,w,h,level,true,prints,[]);
 const chrome=Object.assign(CHROME[view].map(b=>({...b})),{key:view});
 const options=AtlasGroups.organicOptions({area,width:w,height:h,level,zoom:AtlasGroups.organicRange(level).floor,extent:result.extent,chrome});
 const packed=AtlasGroups.pointIds(result.points,discs);
 const {gaps}=AtlasGroups.curate(result.groups,prints,options.zoom,2**(level/3),{...options,first,points:points?packed:null});
 // Each disc's group-space point, by id.
 const at=new Map(packed.ids.map((id,n)=>[id,{px:packed.xy[4*n],py:packed.xy[4*n+1]}]));
 return {...result,options,gaps,at,ids:packed.ids,groupZoom:2**(level/3)};
}
const LEVELS=[0,2,4,5,6,7,8,9];
const snapshot=groups=>JSON.stringify(groups.map(g=>[g.key,g.hidden,g.large,g.markerOffset,g.joined,g.labelVisible]));
// Boxes at camera zoom z (group space scaled from the curate zoom): curated art and names, small
// discs, minis and their names. The art is what each draws at the level's top, its largest.
function boxes(L,z){
 const s=z/L.groupZoom,room=38*AtlasGroups.artRoom(L.options.artZoom),out=[];
 for(const g of L.groups){
  if(g.hidden)continue;const f=prints.get(g.key),x=g.px*s+g.markerOffset.x,y=-g.py*s+g.markerOffset.y;
  if(g.large){out.push({kind:'art',key:g.key,x:x-room,y:y-room,w:2*room,h:2*room});out.push({kind:'label',key:g.key,x:x+f.x,y:y+f.y,w:f.w,h:f.h});}
  else{out.push({kind:'dot',key:g.key,x:x-8,y:y-8,w:16,h:16});if(g.gapLabel)out.push({kind:'smallLabel',key:g.key,x:x+f.gap.x,y:y+f.gap.y,w:f.gap.w,h:f.gap.h});}
 }
 for(const p of L.gaps){
  const pt=L.at.get(p.id),x=pt.px*s+p.x,y=-pt.py*s+p.y,f=prints.get(p.id).gap,r=AtlasGroups.gapSize(L.options.artZoom,p.tier)/2;
  out.push({kind:'small',tier:p.tier,key:p.id,x:x-r,y:y-r,w:2*r,h:2*r});
  if(p.label)out.push({kind:'smallLabel',key:p.id,x:x+f.x,y:y+f.y,w:f.w,h:f.h});
 }
 return out;
}
const distance=(a,b)=>Math.max(a.x-b.x-b.w,b.x-a.x-a.w,a.y-b.y-b.h,b.y-a.y-a.h);
// The least room tier 2 keeps between two boxes. Curated pairs keep their own rules, and so do a
// complete view's dots (their places are curate's, unchanged); a dot's name is tier 2's.
function need(a,b){
 if((a.kind==='dot'||b.kind==='dot')&&a.kind!=='smallLabel'&&b.kind!=='smallLabel')return null;
 const ka=a.kind==='dot'?'small':a.kind,kb=b.kind==='dot'?'small':b.kind,kinds=[ka,kb].sort().join('+');
 if(kinds==='art+small')return G.art;
 if(kinds==='art+smallLabel'||kinds==='label+small'||kinds==='label+smallLabel')return G.label;
 if(ka.startsWith('small')&&kb.startsWith('small'))return G.apart;
 return null;
}

test('curated discs rest exactly where they rest without tiers 2 and 3, at every level, desktop and phone',()=>{
 for(const view of Object.keys(VIEWS))for(const level of LEVELS){
  assert.equal(snapshot(layout(view,level).groups),snapshot(layout(view,level,{points:false}).groups),`${view} level ${level}`);
 }
});

test('the art keeps the room and growth it always had',()=>{
 assert.equal(AtlasGroups.discScale,undefined);
 for(let z=1;z<=9.5;z+=.01)assert.equal(AtlasGroups.artRoom(z),1+.08*(Math.min(4,z)-1));
});

test('small discs, then minis, fill the room the curated set leaves, from the rest of the rated catalog',()=>{
 for(const view of Object.keys(VIEWS))for(const level of LEVELS){
  const L=layout(view,level),shown=new Set(L.groups.filter(g=>!g.hidden).map(g=>g.key)),ids=L.gaps.map(p=>p.id);
  if(L.groups[0].complete){assert.equal(L.gaps.length,0,`${view} level ${level}: a complete view has no tiers 2 and 3`);continue;}
  const smalls=L.gaps.filter(p=>p.tier==='small'),minis=L.gaps.filter(p=>p.tier==='mini');
  assert.equal(smalls.length+minis.length,L.gaps.length);
  assert.ok(smalls.length>(view==='desktop'?40:8),`${view} level ${level}: ${smalls.length} small discs`);
  assert.ok(minis.length>(view==='desktop'?20:8),`${view} level ${level}: ${minis.length} minis`);
  // Small discs take the room first: every mini comes after them.
  assert.ok(L.gaps.findIndex(p=>p.tier==='mini')===smalls.length,`${view} level ${level}: a mini rests before a small disc`);
  // One disc rests once, in one tier.
  assert.equal(new Set(ids).size,ids.length);
  for(const id of ids){assert.ok(!shown.has(id),`${id} is a curated disc`);assert.ok(positions.has(id));}
  // Real discs at their real points: each rests within its small reach of its own atlas point.
  for(const p of L.gaps)assert.ok(Math.hypot(p.x,p.y)<=G.room*G.reach+1e-9);
  // Selection order within each tier: the walk skips, it never reorders.
  const order=new Map(L.ids.map((id,i)=>[id,i]));
  for(const tier of [smalls,minis]){const at=tier.map(p=>order.get(p.id));
   assert.ok(at.every((v,i)=>!i||v>at[i-1]),`${view} level ${level}: ${tier[0]?.tier} discs out of selection order`);}
 }
});

test('small discs and minis keep clear of every curated disc and name, and of each other, across their level',()=>{
 for(const view of Object.keys(VIEWS))for(const level of LEVELS){
  const L=layout(view,level),{floor,top}=AtlasGroups.organicRange(level);
  for(const z of [L.options.zoom,(L.options.zoom+top)/2,top]){
   const all=boxes(L,z);
   for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
    const a=all[i],b=all[j];if(a.key===b.key)continue;const room=need(a,b);if(room==null)continue;
    assert.ok(distance(a,b)>=room-1e-6,`${view} level ${level} at ${z.toFixed(2)}x: ${a.kind} ${a.key} and ${b.kind} ${b.key} are ${distance(a,b).toFixed(1)}px apart, need ${room}`);
   }
  }
  // Centers keep their tier's spacing where the level is laid out, and a mini keeps `clear` from a small disc.
  const s=L.options.zoom/L.groupZoom,phone=view!=='desktop';
  const centers=L.gaps.map(p=>{const q=L.at.get(p.id);return [q.px*s+p.x,-q.py*s+p.y,p.tier];});
  for(let i=0;i<centers.length;i++)for(let j=i+1;j<centers.length;j++){
   const [a,b]=[centers[i],centers[j]],T=G[a[2]];
   const least=a[2]===b[2]?(phone?T.phoneSpacing:T.spacing):G.mini.clear;
   assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])>=least-1e-6,`${view} level ${level}: a ${a[2]} and a ${b[2]} closer than ${least}px`);
  }
 }
});

test('at 1x small discs and minis stay off the chrome and inside the map',()=>{
 for(const view of Object.keys(VIEWS)){
  const L=layout(view,0),[w,h]=VIEWS[view],area=AtlasLayout.bounds(w,h,true);
  const pan=AtlasLayout.constrain({zoom:1,x:0,y:0},area,L.extent),origin={x:area.left+pan.x,y:area.bottom+pan.y};
  for(const b of boxes(L,1).filter(b=>b.kind==='small')){
   const x=b.x+origin.x,y=b.y+origin.y;
   assert.ok(x>=4&&y>=4&&x+b.w<=w-4&&y+b.h<=h-4,`${b.key} leaves the map`);
   for(const c of CHROME[view])assert.ok(distance({x,y,w:b.w,h:b.h},c)>=AtlasGroups.ORGANIC.gap,`${b.key} is under the chrome`);
  }
 }
});

test('names are reserved only on levels where they will show',()=>{
 for(const view of Object.keys(VIEWS))for(const level of LEVELS){
  const L=layout(view,level),{top}=AtlasGroups.organicRange(level);
  for(const tier of AtlasGroups.TIERS){
   const shows=AtlasGroups.gapLabelAlpha(top,tier)>0;
   assert.equal(L.options.gapLabels[tier],shows);
   const named=L.gaps.filter(p=>p.tier===tier&&p.label).length+(tier==='small'?L.groups.filter(g=>g.gapLabel).length:0);
   if(!shows)assert.equal(named,0,`${view} level ${level} names ${tier} discs it never shows`);
   else if(!L.groups[0].complete||tier==='small')assert.ok(named>0,`${view} level ${level} names no ${tier} disc`);
  }
 }
 // None at 1x. For each tier, none on the level where its names are first reserved when it is
 // entered or left, so the set reserving them first never pops a name in.
 for(const tier of AtlasGroups.TIERS){
  assert.equal(AtlasGroups.gapLabelAlpha(1,tier),0);assert.equal(AtlasGroups.gapLabelAlpha(AtlasGroups.organicRange(0).top,tier),0);
  const first=[...Array(11).keys()].find(l=>AtlasGroups.gapLabelAlpha(AtlasGroups.organicRange(l).top,tier)>0);
  assert.equal(AtlasGroups.gapLabelAlpha(AtlasGroups.organicRange(first).floor,tier),0,tier);
  assert.equal(AtlasGroups.gapLabelAlpha(2**((first-.5)/3),tier),0,tier);
 }
});

test('one rule for both tiers: a name fades in smoothly as its disc grows, small discs first',()=>{
 // The rule is the size's: no name below labelFrom px, all of it at the full size, smooth between.
 assert.equal(AtlasGroups.nameAlpha(G.labelFrom),0);assert.equal(AtlasGroups.nameAlpha(G.full),1);
 let previous=0;
 for(let size=0;size<=G.full;size+=.001){const a=AtlasGroups.nameAlpha(size);assert.ok(a>=previous-1e-12);assert.ok(a-previous<.0006,`${size}px`);previous=a;}
 const from={},full={};
 for(const tier of AtlasGroups.TIERS){
  let previous=0,largest=0;
  for(let z=1;z<=9.5;z+=.001){
   const size=AtlasGroups.gapSize(z,tier),a=AtlasGroups.gapLabelAlpha(z,tier);
   assert.equal(a,AtlasGroups.nameAlpha(size),`${tier} at ${z}x`);
   assert.ok(a>=previous-1e-12);largest=Math.max(largest,a-previous);previous=a;
   if(a>0&&from[tier]==null)from[tier]=z;if(a===1&&full[tier]==null)full[tier]=z;
  }
  // Smooth: no step per 0.001x comes near a pop.
  assert.ok(largest<.003,`${tier}: largest step per 0.001x: ${largest}`);
 }
 // Small discs earn their names first; minis, starting smaller, deeper in, but in full before the
 // desktop map shows every disc (level 9, from about 6.9x).
 assert.ok(from.small<from.mini&&full.small<from.mini,`small names ${from.small}-${full.small}x, mini names ${from.mini}-${full.mini}x`);
 assert.ok(full.mini<=AtlasGroups.organicRange(9).floor,`mini names complete at ${full.mini}x`);
});

test('small discs and minis grow toward the full size, far below a curated disc',()=>{
 assert.equal(AtlasGroups.gapSize(1,'small'),G.small.size);assert.equal(AtlasGroups.gapSize(1,'mini'),G.mini.size);
 // Minis start far smaller: at most half a small disc at 1x.
 assert.ok(G.mini.size*2<=G.small.size);
 const prior={small:0,mini:0};
 for(let z=1;z<=9.5;z+=.01){
  const small=AtlasGroups.gapSize(z,'small'),mini=AtlasGroups.gapSize(z,'mini');
  assert.ok(mini<=small&&small<=G.full,`${z}x: ${small}px, ${mini}px`);
  // A quarter of a curated disc at most, at every zoom.
  assert.ok(small*4<=76*AtlasGroups.artRoom(z),`${z}x: ${small}px`);
  // They only grow as you zoom in.
  assert.ok(small>=prior.small&&mini>=prior.mini);prior.small=small;prior.mini=mini;
  for(const tier of AtlasGroups.TIERS)assert.ok(AtlasGroups.gapAlpha(z,tier)>=G.far&&AtlasGroups.gapAlpha(z,tier)<=1);
 }
 // Both reach the full size, the mini later.
 assert.equal(AtlasGroups.gapSize(9,'small'),G.full);assert.equal(AtlasGroups.gapSize(9,'mini'),G.full);
 assert.ok(AtlasGroups.gapSize(4,'small')===G.full&&AtlasGroups.gapSize(4,'mini')<G.full);
 assert.equal(AtlasGroups.gapAlpha(1),G.far);assert.equal(AtlasGroups.gapAlpha(4),1);
});

test('a complete view keeps its dots where they were and names only those with room',()=>{
 // Deep desktop levels hold no more matches than the cap: everything shows, dots included.
 const L=layout('desktop',10);
 assert.ok(L.groups[0].complete);assert.equal(L.gaps.length,0);
 const dots=L.groups.filter(g=>!g.hidden&&!g.large);assert.ok(dots.length>0);
 assert.ok(dots.some(g=>g.gapLabel));
 const all=boxes(L,L.options.zoom);
 for(const a of all.filter(b=>b.kind==='smallLabel'))for(const b of all){
  if(a.key===b.key)continue;const room=need(a,b);if(room!=null)assert.ok(distance(a,b)>=room-1e-6,`${a.key}'s name and ${b.kind} ${b.key}`);
 }
});

test('the same data, view and level always lay the same three tiers',()=>{
 for(const view of Object.keys(VIEWS))for(const level of [0,5,8]){
  const a=layout(view,level),b=layout(view,level);
  assert.equal(JSON.stringify(a.gaps),JSON.stringify(b.gaps));assert.equal(snapshot(a.groups),snapshot(b.groups));
 }
});

test('a selected hidden disc comes forward and tiers 2 and 3 make room around it',()=>{
 const base=layout('desktop',0),hidden=base.groups.find(g=>g.hidden);
 const result=AtlasGroups.build(discs,positions,1440,900,0,true,prints,[]);
 const area=AtlasLayout.bounds(1440,900,true),chrome=Object.assign(CHROME.desktop.map(b=>({...b})),{key:'desktop'});
 const options=AtlasGroups.organicOptions({area,width:1440,height:900,level:0,zoom:1,extent:result.extent,chrome});
 const first=result.groups.find(g=>g.key===hidden.key);
 const {gaps}=AtlasGroups.curate(result.groups,prints,1,1,{...options,first,points:AtlasGroups.pointIds(result.points,discs)});
 assert.ok(!first.hidden&&first.large);
 assert.ok(!gaps.some(p=>p.id===first.key));
 assert.ok(gaps.length>0);
});
