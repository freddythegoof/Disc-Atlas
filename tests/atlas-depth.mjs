// The main Atlas's three tiers of depth (AtlasGroups.curate; tiers 2 and 3, small discs and minis,
// are AtlasGroups.GAP), on the real catalog with fixed footprints. Curated discs keep their size and
// rest exactly where they rested without the other tiers; small discs, then minis, fill the room they
// leave and keep their distance from everything. At 1x a small disc is two thirds of a curated disc and a
// mini 12px; each grows with the zoom to a curated disc's full size at 9x. A small disc is named at
// every zoom; a mini is not at 1x, and its name (a curated disc's) fades in with its size, only where
// names are reserved. The browser
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
// center. Width follows the name's length. Small discs and minis wear the same name.
const prints=new Map(discs.map(d=>{const n=(d.catalogName||d.name).length;
 return [d.id,{x:-(n*7+12)/2,y:46,w:n*7+12,h:40,radius:38}];}));
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
// Each tier's radius at the level's top, the largest it draws at on the level.
const rooms=L=>Object.fromEntries(AtlasGroups.TIERS.map(t=>[t,AtlasGroups.gapSize(L.options.artZoom,t)/2]));
// Boxes at camera zoom z (group space scaled from the curate zoom): curated art and names, small
// discs, minis and their names. The art is what each draws at the level's top, its largest; a small
// disc's or mini's name hangs where it does at z, below its disc as it is at z.
function boxes(L,z){
 const s=z/L.groupZoom,room=38*AtlasGroups.artRoom(L.options.artZoom),r=rooms(L),out=[];
 const name=(f,tier,key,x,y)=>({kind:'smallLabel',key,x:x+f.x,y:y+f.y+AtlasGroups.gapDrop(AtlasGroups.gapSize(z,tier)),w:f.w,h:f.h});
 for(const g of L.groups){
  if(g.hidden)continue;const f=prints.get(g.key),x=g.px*s+g.markerOffset.x,y=-g.py*s+g.markerOffset.y;
  if(g.large){out.push({kind:'art',key:g.key,x:x-room,y:y-room,w:2*room,h:2*room});out.push({kind:'label',key:g.key,x:x+f.x,y:y+f.y,w:f.w,h:f.h});}
  else{out.push({kind:'dot',key:g.key,x:x-r.small,y:y-r.small,w:2*r.small,h:2*r.small});if(g.gapLabel)out.push(name(f,'small',g.key,x,y));}
 }
 for(const p of L.gaps){
  const pt=L.at.get(p.id),x=pt.px*s+p.x,y=-pt.py*s+p.y,f=prints.get(p.id),q=r[p.tier];
  out.push({kind:'small',tier:p.tier,key:p.id,x:x-q,y:y-q,w:2*q,h:2*q});
  if(p.label)out.push(name(f,p.tier,p.id,x,y));
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
  // Deep in, every disc is near full size with a full name, so the room for them thins out.
  assert.ok(smalls.length+minis.length>=(view==='desktop'?40:5),`${view} level ${level}: ${smalls.length} small discs, ${minis.length} minis`);
  // Every small disc wears its name, which takes room: a phone's 1x holds none.
  if(level===0)assert.ok(smalls.length>=(view==='desktop'?8:0)&&minis.length>=(view==='desktop'?20:5),`${view} at 1x: ${smalls.length} small discs, ${minis.length} minis`);
  // Small discs take the room first: every mini comes after them.
  assert.ok(!minis.length||L.gaps.findIndex(p=>p.tier==='mini')===smalls.length,`${view} level ${level}: a mini rests before a small disc`);
  // One disc rests once, in one tier.
  assert.equal(new Set(ids).size,ids.length);
  for(const id of ids){assert.ok(!shown.has(id),`${id} is a curated disc`);assert.ok(positions.has(id));}
  // Real discs at their real points: each rests within its reach (of its radius) of its own atlas point.
  const r=rooms(L);
  for(const p of L.gaps)assert.ok(Math.hypot(p.x,p.y)<=r[p.tier]*G.reach+1e-9);
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
  // Rooms of a tier keep its space where the level is laid out, and a mini's keeps `clear` from a small disc's.
  const s=L.options.zoom/L.groupZoom,phone=view!=='desktop',r=rooms(L);
  const centers=L.gaps.map(p=>{const q=L.at.get(p.id);return [q.px*s+p.x,-q.py*s+p.y,p.tier];});
  for(let i=0;i<centers.length;i++)for(let j=i+1;j<centers.length;j++){
   const [a,b]=[centers[i],centers[j]],T=G[a[2]];
   const least=r[a[2]]+r[b[2]]+(a[2]===b[2]?(phone?T.phoneSpace:T.space):G.mini.clear);
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

test('small discs always wear their names; minis only where theirs will show',()=>{
 for(const view of Object.keys(VIEWS))for(const level of LEVELS){
  const L=layout(view,level),{top}=AtlasGroups.organicRange(level);
  for(const tier of AtlasGroups.TIERS){
   const shows=AtlasGroups.gapLabelAlpha(top,tier)>0;
   assert.equal(L.options.gapLabels[tier],shows);
   const named=L.gaps.filter(p=>p.tier===tier&&p.label).length+(tier==='small'?L.groups.filter(g=>g.gapLabel).length:0);
   if(!shows)assert.equal(named,0,`${view} level ${level} names ${tier} discs it never shows`);
   // Where its names show at least half strength, every disc of the tier wears its name.
   if(AtlasGroups.gapLabelAlpha(L.options.zoom,tier)>=G.named){
    assert.ok(L.gaps.filter(p=>p.tier===tier).every(p=>p.label),`${view} level ${level}: a nameless ${tier} disc`);
    if(tier==='small')assert.ok(L.groups.filter(g=>!g.hidden&&!g.large).every(g=>g.gapLabel),`${view} level ${level}: a nameless dot`);
   }
  }
 }
 // Small discs are named at every zoom, 1x included, in full; minis not at 1x, and for them none on the
 // level where their names are first reserved when it is entered or left, so the set reserving them
 // first never pops a name in.
 for(let z=1;z<=9.5;z+=.01)assert.equal(AtlasGroups.gapLabelAlpha(z,'small'),1);
 assert.equal(AtlasGroups.gapLabelAlpha(1,'mini'),0);assert.equal(AtlasGroups.gapLabelAlpha(AtlasGroups.organicRange(0).top,'mini'),0);
 const first=[...Array(11).keys()].find(l=>AtlasGroups.gapLabelAlpha(AtlasGroups.organicRange(l).top,'mini')>0);
 assert.equal(AtlasGroups.gapLabelAlpha(AtlasGroups.organicRange(first).floor,'mini'),0);
 assert.equal(AtlasGroups.gapLabelAlpha(2**((first-.5)/3),'mini'),0);
 // A small disc at 1x is named: the 1x layout holds some, each with its name.
 const far=layout('desktop',0);assert.ok(far.gaps.filter(p=>p.tier==='small'&&p.label).length>=8);
});

test("a mini's name fades in smoothly as its disc grows, deep in",()=>{
 // The rule is the size's: no name below labelFrom px, all of it from labelFull px, smooth between.
 assert.equal(AtlasGroups.nameAlpha(G.labelFrom),0);assert.equal(AtlasGroups.nameAlpha(G.labelFull),1);
 // No mini is named at 1x, even at the top of the 1x level.
 assert.ok(AtlasGroups.gapSize(AtlasGroups.organicRange(0).top,'mini')<G.labelFrom);
 let previous=0;
 for(let size=0;size<=G.labelFull+5;size+=.001){const a=AtlasGroups.nameAlpha(size);assert.ok(a>=previous-1e-12);assert.ok(a-previous<.0006,`${size}px`);previous=a;}
 let largest=0,from=null,full=null;previous=0;
 for(let z=1;z<=9.5;z+=.001){
  const size=AtlasGroups.gapSize(z,'mini'),a=AtlasGroups.gapLabelAlpha(z,'mini');
  assert.equal(a,AtlasGroups.nameAlpha(size),`mini at ${z}x`);
  assert.ok(a>=previous-1e-12);largest=Math.max(largest,a-previous);previous=a;
  if(a>0&&from==null)from=z;if(a===1&&full==null)full=z;
 }
 // Smooth: no step per 0.001x comes near a pop. Minis earn their names from about 3.2x, in full by
 // about 6.8x, before the desktop map shows every disc (level 9, from about 6.9x).
 assert.ok(largest<.003,`largest step per 0.001x: ${largest}`);
 assert.ok(from>3&&full<=AtlasGroups.organicRange(9).floor,`mini names ${from}-${full}x`);
});

test("small discs and minis grow from their own size at 1x to a curated disc's full size at 9x",()=>{
 const curated=z=>76*AtlasGroups.artRoom(z);
 // At 1x: a small disc is two thirds of a curated disc, a mini 12px, a quarter of a small disc at most.
 assert.ok(Math.abs(AtlasGroups.gapSize(1,'small')-curated(1)*2/3)<1e-9);assert.ok(Math.abs(AtlasGroups.gapSize(1,'mini')-12)<1e-9);
 assert.ok(AtlasGroups.gapSize(1,'mini')*4<=AtlasGroups.gapSize(1,'small'));
 const prior={small:0,mini:0};
 for(let z=1;z<=9.5;z+=.01){
  const small=AtlasGroups.gapSize(z,'small'),mini=AtlasGroups.gapSize(z,'mini');
  assert.ok(mini<=small&&small<=curated(z)+1e-9,`${z}x: ${small}px, ${mini}px`);
  // Below the deepest zoom both stay smaller than a curated disc, so they never compete with one.
  if(z<8.999)assert.ok(small<curated(z),`${z}x: a small disc is full size already`);
  // They only grow as you zoom in.
  assert.ok(small>=prior.small&&mini>=prior.mini);prior.small=small;prior.mini=mini;
  assert.ok(AtlasGroups.gapAlpha(z)>=G.far&&AtlasGroups.gapAlpha(z)<=1);
 }
 // At 9x, the deepest zoom, every tier is a curated disc's full size, at full strength, named in full.
 for(const tier of AtlasGroups.TIERS){assert.ok(Math.abs(AtlasGroups.gapSize(9,tier)-curated(9))<1e-9,tier);assert.equal(AtlasGroups.gapLabelAlpha(9,tier),1);}
 assert.equal(AtlasGroups.gapAlpha(1),G.far);assert.equal(AtlasGroups.gapAlpha(9),1);
 // A name hangs below its disc as a curated name hangs below its art, and where a curated one does once full size.
 assert.equal(AtlasGroups.gapDrop(76),0);assert.equal(AtlasGroups.gapDrop(curated(9)),0);assert.equal(AtlasGroups.gapDrop(50),-13);
});

test('a complete view rests its dots as small discs, each with its name deep in',()=>{
 // Deep desktop levels hold no more matches than the cap: everything shows, as full discs, dots or stacks.
 const L=layout('desktop',10),r=rooms(L);
 assert.ok(L.groups[0].complete);assert.equal(L.gaps.length,0);
 const dots=L.groups.filter(g=>!g.hidden&&!g.large);assert.ok(dots.length>0);
 assert.ok(dots.every(g=>g.gapLabel),'a dot rests without its name');
 assert.ok(Math.abs(2*r.small-76*AtlasGroups.artRoom(L.options.artZoom))<1,'dots are full size');
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
