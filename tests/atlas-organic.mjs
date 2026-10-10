// The organic overview's rules (AtlasGroups.curate), on controlled fixtures. The browser suite
// (tests/atlas-organic-browser.mjs) checks the same rules on the real catalog and pages.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const runtime={};runtime.window=runtime;
vm.createContext(runtime);
for(const file of ['atlas-layout.js','atlas-groups.js'])vm.runInContext(fs.readFileSync('public/'+file,'utf8'),runtime);
const {AtlasGroups}=runtime,O=AtlasGroups.ORGANIC;
// The desktop footprint: a 76px disc with its name below.
const footprint={x:-45,y:48,w:90,h:34,radius:38},reach=footprint.radius*O.reach;
// Groups in selection order. Points are group-space pixels at zoom 1 (y grows upward, as in build).
const groups=points=>points.map(([key,x,y],i)=>({key:key||'d'+i,px:x,py:y,members:[key||'d'+i],pos:{x,y}}));
const prints=list=>new Map(list.map(g=>[g.key,footprint]));
const curate=(list,options)=>{AtlasGroups.curate(list,prints(list),1,1,options);return list;};
const shown=list=>list.filter(g=>!g.hidden).map(g=>g.key);
// A shown disc's boxes: its art and name, or a dot's own small box.
// A complete view's dot is a small disc (AtlasGroups.GAP), sized for the curate zoom (1x).
const boxes=g=>{const x=g.px+g.markerOffset.x,y=-g.py+g.markerOffset.y,r=g.large?footprint.radius:AtlasGroups.gapSize(1,'small')/2;
 return g.large?[{x:x-r,y:y-r,w:2*r,h:2*r},{x:x+footprint.x,y:y+footprint.y,w:footprint.w,h:footprint.h}]:[{x:x-r,y:y-r,w:2*r,h:2*r}];};
const apart=(a,b,pad)=>a.x+a.w+pad<=b.x||b.x+b.w+pad<=a.x||a.y+a.h+pad<=b.y||b.y+b.h+pad<=a.y;
// A seeded field: 400 discs scattered over 3000 x 2000 px (a cap under 400 keeps it an overview).
const field=()=>groups(Array.from({length:400},(_,i)=>['f'+i,runtime.AtlasLayout.seed('x'+i)*3000,runtime.AtlasLayout.seed('y'+i)*2000]));

test('the same groups always rest the same way',()=>{
 const a=curate(field(),{cap:60}),b=curate(field(),{cap:60});
 assert.deepEqual(a.map(g=>[g.key,g.hidden,g.large,g.markerOffset]),b.map(g=>[g.key,g.hidden,g.large,g.markerOffset]));
});

test('every disc rests within its reach of its true point',()=>{
 const list=curate(field(),{cap:120});
 assert.ok(shown(list).length>30);
 for(const g of list.filter(g=>!g.hidden))assert.ok(Math.hypot(g.markerOffset.x,g.markerOffset.y)<=reach+1e-9,g.key);
 // Rest spots are seeded tosses, not the plotted point itself.
 assert.ok(list.filter(g=>!g.hidden).some(g=>Math.hypot(g.markerOffset.x,g.markerOffset.y)>reach/3));
});

test('discs and names never touch, and the overview keeps its spacing',()=>{
 const placed=curate(field(),{cap:200}).filter(g=>!g.hidden);
 for(let i=0;i<placed.length;i++)for(let j=i+1;j<placed.length;j++){
  const a=placed[i],b=placed[j];
  for(const p of boxes(a))for(const q of boxes(b))assert.ok(apart(p,q,O.gap-1e-6),a.key+' / '+b.key);
  const d=Math.hypot(a.px+a.markerOffset.x-b.px-b.markerOffset.x,-a.py+a.markerOffset.y+b.py-b.markerOffset.y);
  assert.ok(d>=O.spacing-1e-6,a.key+' / '+b.key+' are '+d.toFixed(1)+'px apart');
 }
});

test('the cap counts every shown disc',()=>{
 for(const cap of [1,10,25])assert.equal(shown(curate(field(),{cap})).length,cap);
 // Each disc in its own region with room to spare: the walk is the selection order, cut at the cap.
 const line=groups(Array.from({length:12},(_,i)=>['l'+i,i*400,0]));
 assert.deepEqual(shown(curate(line,{cap:5})),['l0','l1','l2','l3','l4']);
});

test('coverage first: each region shows its first disc before any region shows a second',()=>{
 // Region A holds four discs with room for all; region B, far right, holds one later disc.
 const list=groups([['a1',20,-20],['a2',170,-20],['a3',20,-170],['a4',170,-170],['b1',1500,-20]]);
 assert.deepEqual(shown(curate(list,{cap:2})),['a1','b1']);
 assert.deepEqual(shown(curate(list,{cap:3})),['a1','a2','b1'],'Then depth, back in selection order');
});

test('within a crowd the earlier disc wins, and no disc shows twice',()=>{
 // Three discs on one point: only the first fits the overview's spacing.
 const list=curate(groups([['first',100,-100],['second',100,-100],['third',104,-100]]),{cap:10});
 assert.deepEqual(shown(list),['first']);
 const big=curate(field(),{cap:200}),keys=shown(big);
 assert.equal(new Set(keys).size,keys.length);
});

test('a selected disc shows even where the walk would hide it, and selecting a shown disc moves nothing',()=>{
 const make=()=>groups([['lead',100,-100],['hidden',110,-100],['other',600,-100]]);
 const plain=curate(make(),{cap:10});
 assert.deepEqual(shown(plain),['lead','other']);
 const list=make();curate(list,{cap:10,first:list[1]});
 assert.ok(!list[1].hidden,'The selected disc is placed');
 assert.ok(list[0].hidden,'Its spot goes to the selected disc first');
 const again=make();curate(again,{cap:10,first:again[0]});
 assert.deepEqual(again.map(g=>[g.hidden,g.markerOffset]),plain.map(g=>[g.hidden,g.markerOffset]));
});

test('obstacles and the frame are kept clear',()=>{
 const list=field(),frame={x:0,y:-1500,w:2400,h:1500},toolbar={x:0,y:-1500,w:1200,h:60};
 curate(list,{cap:399,frame,obstacles:[toolbar]});
 assert.ok(shown(list).length>15);
 for(const g of list.filter(g=>!g.hidden))for(const box of boxes(g)){
  assert.ok(box.x>=frame.x&&box.y>=frame.y&&box.x+box.w<=frame.x+frame.w&&box.y+box.h<=frame.y+frame.h,g.key);
  assert.ok(apart(box,toolbar,O.gap-1e-6),g.key);
 }
});

test('a complete view hides nothing: crowded leads become dots, then join a stack',()=>{
 // Five discs, cap 8: every one must show. b sits too close to a for full size but has room for a
 // dot; c coincides with a, so it joins a's stack.
 const list=curate(groups([['a',100,-100],['b',165,-100],['c',100,-100],['d',600,-100],['e',900,-400]]),{cap:8});
 const members=list.filter(g=>!g.hidden).flatMap(g=>[...g.members,...g.joined||[]]);
 assert.deepEqual(members.sort(),['a','b','c','d','e']);
 assert.ok(list.every(g=>g.complete));
 assert.ok(list.find(g=>g.key==='b').large===false&&!list.find(g=>g.key==='b').hidden,'A crowded lead rests as a dot');
 assert.deepEqual([...list.find(g=>g.key==='a').joined],['c'],'A lead with no room even for a dot joins the nearest stack');
 const placed=list.filter(g=>!g.hidden);
 for(let i=0;i<placed.length;i++)for(let j=i+1;j<placed.length;j++)for(const p of boxes(placed[i]))for(const q of boxes(placed[j]))assert.ok(apart(p,q,O.gap-1e-6));
 for(const g of list.filter(g=>!g.hidden))assert.ok(Math.hypot(g.markerOffset.x,g.markerOffset.y)<=reach+1e-9);
 // An incomplete view (more discs than the cap) shows no dots.
 const overview=curate(field(),{cap:30});
 assert.ok(overview.every(g=>g.hidden||g.large)&&overview.every(g=>!g.complete&&!g.joined));
});

test('a level curated once stays clear as the camera zooms in across it',()=>{
 // Zooming in multiplies every true point's distance; rest offsets and names stay in screen pixels.
 const {floor,top}=AtlasGroups.organicRange(7),stretch=top/floor;
 assert.ok(stretch>1.25&&stretch<1.32);
 for(const cap of [150,400]){
  const list=curate(field(),{cap,stretch}),placed=list.filter(g=>!g.hidden);
  if(cap===400)assert.ok(placed.some(g=>!g.large),'The complete case includes dots');
  for(const k of [1.02,1.1,1.2,stretch]){
   const moved=placed.map(g=>({...g,px:g.px*k,py:g.py*k}));
   for(let i=0;i<moved.length;i++)for(let j=i+1;j<moved.length;j++)for(const p of boxes(moved[i]))for(const q of boxes(moved[j]))
    assert.ok(apart(p,q,O.gap-1e-6),`x${k}: ${moved[i].key} / ${moved[j].key}`);
  }
 }
 assert.equal(AtlasGroups.organicZoom(0,1.1),1,'Level 0 is always the 1x layout');
 assert.equal(AtlasGroups.organicZoom(7,5),2**(6.35/3),'A level rests at its floor zoom');
 assert.equal(AtlasGroups.organicZoom(7,4),4,'Below the floor (a zoom-out tween) it rests at the camera zoom');
 assert.equal(AtlasGroups.organicZoom(7,7),7,'Past the top (a zoom-in tween) it rests at the camera zoom');
});

test('the cap keeps the room per disc on screen at every zoom',()=>{
 const view={left:0,right:1320,top:0,bottom:640};
 assert.equal(AtlasGroups.organicCap(view,1),O.perView);
 assert.equal(AtlasGroups.organicCap(view,2),O.perView*4);
 assert.equal(AtlasGroups.organicCap({left:0,right:300,top:0,bottom:400},1),O.min,'Phones keep a floor');
});

test('discs face front: there is no per-disc tilt',()=>{
 assert.equal(AtlasGroups.organicTilt,undefined);
 assert.doesNotMatch(fs.readFileSync('public/cosmic.css','utf8'),/--tilt|--tip/);
 assert.doesNotMatch(fs.readFileSync('public/atlas-map.js','utf8'),/--tilt|--tip|organicTilt/);
});
