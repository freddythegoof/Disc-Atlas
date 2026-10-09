// The main Atlas's two tiers of depth (AtlasGroups.curate, tier 2 = AtlasGroups.GAP), on the real
// catalog with fixed footprints. Curated discs keep their size and rest exactly where they rested
// without tier 2; small discs fill the room they leave, keep their distance from everything, show no
// names at 1x and have their names fade in only where names are reserved. The browser suite
// (tests/atlas-depth-browser.mjs) checks the real map, its frames, themes and screenshots.
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
// discs and their names. The art is the room layout keeps (artRoom at the level's top).
function boxes(L,z){
 const s=z/L.groupZoom,room=38*AtlasGroups.artRoom(L.options.artZoom),out=[];
 for(const g of L.groups){
  if(g.hidden)continue;const f=prints.get(g.key),x=g.px*s+g.markerOffset.x,y=-g.py*s+g.markerOffset.y;
  if(g.large){out.push({kind:'art',key:g.key,x:x-room,y:y-room,w:2*room,h:2*room});out.push({kind:'label',key:g.key,x:x+f.x,y:y+f.y,w:f.w,h:f.h});}
  else{out.push({kind:'dot',key:g.key,x:x-8,y:y-8,w:16,h:16});if(g.gapLabel)out.push({kind:'smallLabel',key:g.key,x:x+f.gap.x,y:y+f.gap.y,w:f.gap.w,h:f.gap.h});}
 }
 for(const p of L.gaps){
  const pt=L.at.get(p.id),x=pt.px*s+p.x,y=-pt.py*s+p.y,f=prints.get(p.id).gap;
  out.push({kind:'small',key:p.id,x:x-8,y:y-8,w:16,h:16});
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

test('curated discs rest exactly where they rest without tier 2, at every level, desktop and phone',()=>{
 for(const view of Object.keys(VIEWS))for(const level of LEVELS){
  assert.equal(snapshot(layout(view,level).groups),snapshot(layout(view,level,{points:false}).groups),`${view} level ${level}`);
 }
});

test('the art keeps the room and growth it always had',()=>{
 assert.equal(AtlasGroups.discScale,undefined);
 for(let z=1;z<=9.5;z+=.01)assert.equal(AtlasGroups.artRoom(z),1+.08*(Math.min(4,z)-1));
});

test('small discs fill the room the curated set leaves, from the rest of the rated catalog',()=>{
 for(const view of Object.keys(VIEWS))for(const level of LEVELS){
  const L=layout(view,level),shown=new Set(L.groups.filter(g=>!g.hidden).map(g=>g.key)),ids=L.gaps.map(p=>p.id);
  if(L.groups[0].complete){assert.equal(L.gaps.length,0,`${view} level ${level}: a complete view has no tier 2`);continue;}
  assert.ok(L.gaps.length>(view==='desktop'?40:8),`${view} level ${level}: ${L.gaps.length} small discs`);
  assert.equal(new Set(ids).size,ids.length);
  for(const id of ids){assert.ok(!shown.has(id),`${id} is a curated disc`);assert.ok(positions.has(id));}
  // Real discs at their real points: each rests within its small reach of its own atlas point.
  for(const p of L.gaps)assert.ok(Math.hypot(p.x,p.y)<=G.room*G.reach+1e-9);
  // Selection order: the walk skips, it never reorders.
  const order=L.ids,at=ids.map(id=>order.indexOf(id));
  assert.ok(at.every((v,i)=>!i||v>at[i-1]),`${view} level ${level}: small discs out of selection order`);
 }
});

test('small discs keep clear of every curated disc and name, and of each other, across their level',()=>{
 for(const view of Object.keys(VIEWS))for(const level of LEVELS){
  const L=layout(view,level),{floor,top}=AtlasGroups.organicRange(level);
  for(const z of [L.options.zoom,(L.options.zoom+top)/2,top]){
   const all=boxes(L,z);
   for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
    const a=all[i],b=all[j];if(a.key===b.key)continue;const room=need(a,b);if(room==null)continue;
    assert.ok(distance(a,b)>=room-1e-6,`${view} level ${level} at ${z.toFixed(2)}x: ${a.kind} ${a.key} and ${b.kind} ${b.key} are ${distance(a,b).toFixed(1)}px apart, need ${room}`);
   }
  }
  // Centers keep tier 2's spacing where the level is laid out.
  const spacing=view==='desktop'?G.spacing:G.phoneSpacing,s=L.options.zoom/L.groupZoom;
  const centers=L.gaps.map(p=>{const q=L.at.get(p.id);return [q.px*s+p.x,-q.py*s+p.y];});
  for(let i=0;i<centers.length;i++)for(let j=i+1;j<centers.length;j++)
   assert.ok(Math.hypot(centers[i][0]-centers[j][0],centers[i][1]-centers[j][1])>=spacing-1e-6);
 }
});

test('at 1x small discs stay off the chrome and inside the map',()=>{
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

test('names are reserved only on levels where they will show, and fade in smoothly with zoom',()=>{
 for(const view of Object.keys(VIEWS))for(const level of LEVELS){
  const L=layout(view,level),{floor,top}=AtlasGroups.organicRange(level),shows=AtlasGroups.gapLabelAlpha(top)>0;
  assert.equal(L.options.gapLabels,shows);
  const named=L.gaps.filter(p=>p.label).length+L.groups.filter(g=>g.gapLabel).length;
  if(!shows)assert.equal(named,0,`${view} level ${level} names small discs it never shows`);
  else assert.ok(named>0,`${view} level ${level} names no small disc`);
 }
 // None at 1x; none on the level where names are first reserved when it is entered or left, so the
 // set reserving them first never pops a name in.
 assert.equal(AtlasGroups.gapLabelAlpha(1),0);
 const first=LEVELS.find(l=>AtlasGroups.gapLabelAlpha(AtlasGroups.organicRange(l).top)>0);
 assert.equal(AtlasGroups.gapLabelAlpha(AtlasGroups.organicRange(first).floor),0);
 assert.equal(AtlasGroups.gapLabelAlpha(2**((first-.5)/3)),0);
 // Smooth, monotonic and complete by the 6x it is fully shown.
 let previous=0,largest=0;
 for(let z=1;z<=9;z+=.001){const a=AtlasGroups.gapLabelAlpha(z);assert.ok(a>=previous-1e-12);largest=Math.max(largest,a-previous);previous=a;}
 assert.ok(largest<.0016,`largest step per 0.001x: ${largest}`);
 assert.equal(AtlasGroups.gapLabelAlpha(G.labelTo),1);assert.equal(AtlasGroups.gapLabelAlpha(9),1);
});

test('small discs are small: never more than their room, far below a curated disc',()=>{
 for(let z=1;z<=9.5;z+=.01){
  const size=AtlasGroups.gapSize(z);
  assert.ok(size<=2*G.room&&size<=76*AtlasGroups.artRoom(z)/5,`${z}x: ${size}px`);
  assert.ok(AtlasGroups.gapAlpha(z)>=G.far&&AtlasGroups.gapAlpha(z)<=1);
 }
 assert.equal(AtlasGroups.gapSize(1),12);assert.equal(AtlasGroups.gapAlpha(1),G.far);assert.equal(AtlasGroups.gapAlpha(4),1);
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

test('the same data, view and level always lay the same tiers',()=>{
 for(const view of Object.keys(VIEWS))for(const level of [0,5,8]){
  const a=layout(view,level),b=layout(view,level);
  assert.equal(JSON.stringify(a.gaps),JSON.stringify(b.gaps));assert.equal(snapshot(a.groups),snapshot(b.groups));
 }
});

test('a selected hidden disc comes forward and tier 2 makes room around it',()=>{
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
