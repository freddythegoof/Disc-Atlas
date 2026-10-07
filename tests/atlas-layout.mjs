import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};
vm.createContext(context);
if(fs.existsSync('public/atlas-layout.js')) vm.runInContext(fs.readFileSync('public/atlas-layout.js','utf8'),context);
const layout=context.window.AtlasLayout;
const fixtures=Array.from({length:30},(_,i)=>({id:`disc-${i}`,name:`Disc ${i}`,speed:12,turn:-1,fade:3}));
test('identical ratings are scattered without altering the rating data',()=>{
 assert.ok(layout,'Atlas layout is available');
 const before=JSON.stringify(fixtures),positions=layout.positions(fixtures);
 assert.equal(new Set([...positions.values()].map(p=>`${p.x}:${p.y}`)).size,30);
 assert.equal(JSON.stringify(fixtures),before);
 for(const p of positions.values()){assert.ok(Math.abs(p.x-.7)<=.065);assert.ok(Math.abs(p.y-11/14)<=.065);}
});
test('scatter is stable across catalog order and ignores unrated records',()=>{
 assert.ok(layout,'Atlas layout is available');
 const forward=layout.positions(fixtures),backward=layout.positions([...fixtures].reverse());
 for(const d of fixtures)assert.deepEqual(forward.get(d.id),backward.get(d.id));
 assert.equal(layout.positions([{id:'unknown',speed:null}]).size,0);
});
test('opening camera centers the featured disc at desktop and phone sizes',()=>{
 assert.ok(layout,'Atlas layout is available');
 for(const [w,h] of [[1440,780],[390,620]]){
  const {left,bottom,width,height}=layout.bounds(w,h);
  const target={x:.72,y:.79},camera=layout.camera(target,w,h,2.8);
  assert.ok(Math.abs(left+target.x*width*camera.zoom+camera.x-w*.5)<1);
  assert.ok(Math.abs(bottom-target.y*height*camera.zoom+camera.y-h*.48)<1);
 }
});
test('the 1x frame fits every catalog disc to the visible map, close to its edges',()=>{
 const discs=JSON.parse(fs.readFileSync('public/data.json')).discs,points=[...layout.positions(discs).values()],{FRAME}=layout;
 assert.ok(points.every(p=>p.x>=FRAME.minX && p.x<=FRAME.maxX && p.y>=FRAME.minY && p.y<=FRAME.maxY),'Every rated disc is inside the frame');
 for(const [w,h,mobile] of [[1440,832,false],[1280,652,false],[360,688,true]]){
  const area=layout.bounds(w,h),x=v=>area.left+v*area.width,y=v=>area.bottom-v*area.height;
  // The frame's corners land on the visible box: just under the search bar, above the legend, near the sides.
  assert.ok(Math.abs(x(FRAME.minX)-area.view.left)<1e-6 && Math.abs(x(FRAME.maxX)-area.view.right)<1e-6);
  assert.ok(Math.abs(y(FRAME.maxY)-area.view.top)<1e-6 && Math.abs(y(FRAME.minY)-area.view.bottom)<1e-6);
  assert.ok(area.view.left<=(mobile?40:64) && w-area.view.right<=(mobile?40:64) && area.view.top<=(mobile?136:96),'Close to the edges at '+w);
  // At 1x the camera keeps the whole frame in place.
  const at1=layout.constrain({zoom:1,x:0,y:0},area,layout.extent(new Map(points.map((p,i)=>[i,p]))));
  assert.equal(at1.x,0);assert.equal(at1.y,0);
 }
});
test('camera stops at every data edge and centers data smaller than the viewport',()=>{
 assert.equal(typeof layout.constrain,'function');
 const area={left:0,bottom:100,width:100,height:100},extent={minX:0,maxX:1,minY:0,maxY:1};
 for(const [x,y,wantX,wantY] of [[500,500,0,100],[-500,-500,-100,0],[-30,40,-30,40]]){
  const camera=layout.constrain({zoom:2,x,y},area,extent,0);
  assert.equal(camera.x,wantX);assert.equal(camera.y,wantY);
 }
 const small=layout.constrain({zoom:1,x:900,y:-900},area,{minX:.4,maxX:.6,minY:.4,maxY:.6},0);
 assert.equal(small.x,0);assert.equal(small.y,0);
});
test('sparse overlapping discs spread into stable separated positions; dense catalogs keep their layout',()=>{
 assert.equal(typeof layout.spread,'function');
 const items=fixtures.slice(0,12),base=layout.positions(items);
 const spread=layout.spread(items,base,1000,600);
 assert.equal(spread.size,12);
 for(const [id,p] of spread)for(const [other,q] of spread)if(id!==other)
  assert.ok(Math.hypot((p.x-q.x)*1000,(p.y-q.y)*600)>=75,'individual discs have room');
 const reversed=layout.spread([...items].reverse(),base,1000,600);
 for(const [id,p] of spread)assert.deepEqual(p,reversed.get(id));
 const dense=Array.from({length:500},(_,i)=>({...fixtures[0],id:`dense-${i}`})),denseBase=layout.positions(dense);
 assert.equal(layout.spread(dense,denseBase,1000,600),null);
 assert.equal(layout.spread([],new Map(),1000,600),null);
});
// Adaptive spread, measured on the real catalog at desktop, phone and the docked My Map frame.
const catalog=JSON.parse(fs.readFileSync('public/data.json')).discs,catalogBase=layout.positions(catalog);
const rated=catalog.filter(d=>d.speed!=null).sort((a,b)=>a.id<b.id?-1:1);
const score=d=>Math.max(0,Math.min(100,50+10*(d.turn+d.fade)));
const typeOf=d=>d.category==='Putter'?'putter':d.category==='Midrange'?'mid':d.category==='Control Driver'?'fairway':d.category==='Distance Driver'?'distance':d.speed<=3?'putter':d.speed<=5?'mid':d.speed<=9?'fairway':'distance';
const sizes=[[1440,832,true],[390,700,true],[1000,600,false]];
const pixels=(w,h,immersive)=>{const a=layout.bounds(w,h,immersive);return (p,q)=>Math.hypot((p.x-q.x)*a.width,(p.y-q.y)*a.height);};
const closest=(set,pos,distance)=>{
 let min=Infinity;for(let i=0;i<set.length;i++)for(let j=i+1;j<set.length;j++)min=Math.min(min,distance(pos.get(set[i].id),pos.get(set[j].id)));
 return min;
};
// Cohorts share a stability score, sorted by it.
const cohorts=(set,pos,key=score)=>{
 const groups=new Map();for(const d of set){const s=key(d);if(!groups.has(s))groups.set(s,[]);groups.get(s).push(pos.get(d.id).x);}
 return [...groups].sort((a,b)=>a[0]-b[0]).map(([s,xs])=>({s,mean:xs.reduce((a,b)=>a+b)/xs.length,min:Math.min(...xs),max:Math.max(...xs)}));
};
const random=(set,count,salt)=>[...set].sort((a,b)=>Math.sin(a.id.length*salt+parseInt(a.id.slice(-6),16))-Math.sin(b.id.length*salt+parseInt(b.id.slice(-6),16))).slice(0,count);
const filters=()=>{
 const sets={catalog:rated,current:rated.filter(d=>['active','catalog_listed'].includes(d.production?.status))};
 for(const type of ['putter','mid','fairway','distance'])sets[type]=rated.filter(d=>typeOf(d)===type);
 const brands=[...new Set(rated.map(d=>d.brand))];
 for(const brand of brands)sets['brand '+brand]=rated.filter(d=>d.brand===brand);
 sets['Innova + Discraft']=rated.filter(d=>/^(Innova|Discraft)$/.test(d.brand));
 sets['Innova distance']=rated.filter(d=>d.brand==='Innova'&&typeOf(d)==='distance');
 for(const q of ['destroyer','zone','buzzz','star','wraith','envy','hex','ion','ra'])sets['search '+q]=rated.filter(d=>d.name.toLowerCase().includes(q));
 for(let speed=1;speed<=14;speed++)sets['speed '+speed]=rated.filter(d=>d.speed===speed);
 sets.understable=rated.filter(d=>score(d)<40);sets.overstable=rated.filter(d=>score(d)>60);sets.neutral=rated.filter(d=>score(d)>=40&&score(d)<=60);
 for(const count of [2,3,5,8,13,21,40,90,200,400,700,950])sets['random '+count]=random(rated,count,count);
 return Object.entries(sets).filter(([,set])=>set.length);
};
test('the unfiltered catalog keeps its exact layout; the spread starts only below it',()=>{
 const {ADAPT}=layout,current=rated.filter(d=>['active','catalog_listed'].includes(d.production?.status));
 assert.ok(current.length>=ADAPT.reference,'The default Current + recent map is at or above the reference count');
 for(const [w,h,immersive] of sizes){
  assert.equal(layout.adapt(catalog,catalogBase,w,h,immersive),catalogBase,'Show everything returns the shipped positions');
  assert.equal(layout.adapt(current,catalogBase,w,h,immersive),catalogBase,'Current + recent returns the shipped positions');
  assert.notEqual(layout.adapt(current.slice(0,ADAPT.reference-1),catalogBase,w,h,immersive),catalogBase);
 }
 assert.equal(layout.adaptStrength(rated.length),0);assert.equal(layout.adaptStrength(ADAPT.reference),0);
 assert.equal(layout.adaptStrength(ADAPT.floor),1);assert.equal(layout.adaptStrength(3),1);
});
test('spread grows as the visible count drops: full catalog, half, quarter, a few dozen, a handful',()=>{
 // Nested tiers, each a subset of the one before, so only the count changes.
 const tiers=[1,2,4,16,128].map(stride=>rated.filter((d,i)=>i%stride===0));
 for(const [w,h,immersive] of sizes){
  const distance=pixels(w,h,immersive);let previous=null;
  for(const set of tiers){
   const shown=layout.adapt(set,catalogBase,w,h,immersive),strength=layout.adaptStrength(set.length);
   const spacing=closest(set,shown,distance),before=closest(set,catalogBase,distance);
   if(previous){
    assert.ok(strength>previous.strength,`Spread factor rises at ${set.length} discs`);
    assert.ok(spacing>previous.spacing,`Closest pair is farther apart at ${set.length} than at ${previous.count} discs (${w}px)`);
    assert.ok(spacing>before,`${set.length} discs separate further than their unadapted positions (${w}px)`);
   }else assert.equal(spacing,before);
   previous={strength,spacing,count:set.length};
  }
  assert.ok(previous.spacing>=(w<700?40:75),`A handful of discs gets real room (${previous.spacing.toFixed(1)}px at ${w}px)`);
 }
});
test('score ordering is never violated at any visible count, filter or screen',()=>{
 for(const [w,h,immersive] of sizes)for(const [name,set] of filters()){
  const shown=layout.adapt(set,catalogBase,w,h,immersive),strict=layout.adaptStrength(set.length)===1,order=cohorts(set,shown);
  for(let i=1;i<order.length;i++){
   assert.ok(order[i-1].mean<order[i].mean,`${name} (${set.length}) at ${w}px: score ${order[i].s} sits left of ${order[i-1].s}`);
   if(strict)assert.ok(order[i-1].max<order[i].min,`${name} at ${w}px: a handful keeps whole cohorts apart (${order[i-1].s}/${order[i].s})`);
  }
 }
});
test('adaptive layout accepts shifted positions and orders cohorts by the shifted index',()=>{
 const bag=random(rated,14,7),shift=d=>[-10,0,10][parseInt(d.id.slice(-2),16)%3],base=layout.positions(bag,shift);
 for(const [w,h,immersive] of sizes){
  const shown=layout.adapt(bag,base,w,h,immersive),order=cohorts(bag,shown,d=>Math.max(0,Math.min(100,score(d)+shift(d))));
  for(let i=1;i<order.length;i++)assert.ok(order[i-1].max<order[i].min,'Personal cohorts stay in order');
  assert.ok(closest(bag,shown,pixels(w,h,immersive))>closest(bag,base,pixels(w,h,immersive)));
 }
});
test('spread discs stay in the 1x frame, keep their speed honest, and are stable across order',()=>{
 const {FRAME,ADAPT}=layout;
 for(const [w,h,immersive] of sizes)for(const [name,set] of filters()){
  const shown=layout.adapt(set,catalogBase,w,h,immersive);
  for(const d of set){
   const p=shown.get(d.id);
   assert.ok(p.x>=FRAME.minX&&p.x<=FRAME.maxX&&p.y>=FRAME.minY&&p.y<=FRAME.maxY,`${name}: ${d.name} stays inside the frame`);
   assert.ok(Math.abs(p.y-(d.speed-1)/14)<=.062*ADAPT.scale+1e-9,`${name}: ${d.name} stays within ${(.062*ADAPT.scale*14).toFixed(1)} speed units`);
  }
  if(set.length<ADAPT.reference){
   const reversed=layout.adapt([...set].reverse(),catalogBase,w,h,immersive);
   for(const d of set)assert.deepEqual(reversed.get(d.id),shown.get(d.id),`${name}: filter order does not move discs`);
  }
 }
 // Unrated records never get a position.
 assert.equal(layout.adapt([{id:'unrated',speed:null}],catalogBase,1440,832).has('unrated'),false);
});
