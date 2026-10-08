// The main Atlas's background depth dots (AtlasDepth.field) on controlled cameras. The browser suite
// (tests/atlas-depth-browser.mjs) checks the real map: names, discs, themes and screenshots.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const runtime={};runtime.window=runtime;
vm.createContext(runtime);
for(const file of ['atlas-layout.js','atlas-depth.js'])vm.runInContext(fs.readFileSync('public/'+file,'utf8'),runtime);
const {AtlasDepth,AtlasLayout}=runtime,D=AtlasDepth.DEPTH;
// A 1440 x 900 desktop's map and a 390 x 844 phone's.
const SIZES={desktop:[1438,700],phone:[388,470]};
const ZOOMS=[1,1.3,1.7,2.2,2.8,3.6,4.7,6,7.5,9];
const camera=(size,zoom,pan={x:0,y:0})=>{const [w,h]=SIZES[size];return {width:w,height:h,zoom,pan,area:AtlasLayout.bounds(w,h,true)};};
// Zoom about the view's center, the way the map does (zoomDestination).
const zoomed=(size,from,to)=>{
 const c=camera(size,from.zoom,from.pan),ratio=to/from.zoom,at={x:c.width/2,y:c.height/2};
 return camera(size,to,{x:at.x-c.area.left-(at.x-c.area.left-from.pan.x)*ratio,y:at.y-c.area.bottom-(at.y-c.area.bottom-from.pan.y)*ratio});
};
const byKey=dots=>new Map(dots.map(d=>[d.key,d]));

test('the same camera always draws the same field, to the pixel',()=>{
 for(const zoom of ZOOMS){
  const a=AtlasDepth.field(camera('desktop',zoom,{x:-140*zoom,y:90*zoom})),b=AtlasDepth.field(camera('desktop',zoom,{x:-140*zoom,y:90*zoom}));
  assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
 }
});

test('the field is sparse at every zoom and never empties as you fly in',()=>{
 for(const size of Object.keys(SIZES))for(const zoom of ZOOMS){
  const [w,h]=SIZES[size],dots=AtlasDepth.field(camera(size,zoom)),per=dots.length/(w*h)*1e5;
  // 1e5 px is about a 316 px square: at most 13 specks in it, at least 1.5.
  assert.ok(per<=13,`${size} ${zoom}x: ${dots.length} dots (${per.toFixed(1)} per 1e5 px) is noise, not depth`);
  assert.ok(per>=1.5,`${size} ${zoom}x: ${dots.length} dots (${per.toFixed(1)} per 1e5 px) is an empty field`);
 }
});

test('dots are small specks, never the size of a disc or a data dot',()=>{
 for(const zoom of ZOOMS)for(const d of AtlasDepth.field(camera('desktop',zoom))){
  assert.ok(d.r>0&&d.r<=D.maxRadius&&D.maxRadius<=2.5,`a ${d.r.toFixed(2)}px dot`);
  assert.ok(d.alpha>0&&d.alpha<=1);
 }
});

test('every shell is behind the discs: it spreads and pans slower than they do',()=>{
 for(const zoom of ZOOMS)for(let shell=0;shell<D.shells;shell++)assert.ok(AtlasDepth.scale(shell,zoom)<zoom);
 // Panning: a pan moves the discs by its full length; every dot moves less, nearer shells more.
 for(const zoom of [1.7,4,9]){
  const pan={x:-200*zoom,y:120*zoom},a=byKey(AtlasDepth.field(camera('desktop',zoom,pan)));
  const b=byKey(AtlasDepth.field(camera('desktop',zoom,{x:pan.x+60,y:pan.y})));
  const moved=new Map();
  for(const [key,d] of a){const e=b.get(key);if(!e)continue;
   const dx=e.x-d.x;assert.ok(dx>0&&dx<60,`${zoom}x: dot ${key} moved ${dx.toFixed(2)}px for a 60px pan`);
   assert.ok(Math.abs(e.y-d.y)<1e-9);moved.set(d.shell,dx);
  }
  const shells=[...moved.keys()].sort((x,y)=>x-y);
  assert.ok(shells.length>=4,`${zoom}x: only ${shells.length} shells on screen`);
  for(let i=1;i<shells.length;i++)assert.ok(moved.get(shells[i])<moved.get(shells[i-1]),`${zoom}x: shell ${shells[i]} drifts as fast as nearer shell ${shells[i-1]}`);
 }
});

test('zooming in flies through the field: nearer shells drift outward faster, all slower than the discs',()=>{
 for(const [from,to] of [[1,1.3],[2.2,2.8],[4.7,6],[7.5,9]]){
  const start={zoom:from,pan:{x:0,y:0}},a=AtlasDepth.field(camera('desktop',from)),b=byKey(AtlasDepth.field(zoomed('desktop',start,to)));
  const c=camera('desktop',from),cx=c.width/2,cy=c.height/2,rates=new Map();
  for(const d of a){const e=b.get(d.key),r0=Math.hypot(d.x-cx,d.y-cy);if(!e||r0<20)continue;
   const rate=Math.hypot(e.x-cx,e.y-cy)/r0;
   assert.ok(rate>1&&rate<to/from,`${from}→${to}x: dot ${d.key} spreads ${rate.toFixed(3)}x; discs spread ${(to/from).toFixed(3)}x`);
   rates.set(d.shell,rate);
  }
  const shells=[...rates.keys()].sort((x,y)=>x-y);
  assert.ok(shells.length>=3,`${from}→${to}x: only ${shells.length} shells move`);
  for(let i=1;i<shells.length;i++)assert.ok(rates.get(shells[i])<rates.get(shells[i-1]),`${from}→${to}x: shell ${shells[i]} spreads as fast as a nearer shell`);
 }
});

test('far shells fade in from nothing, so no dot pops into view',()=>{
 // A shell reaching the drawn range has no alpha yet; at the near end, the nearest shell is fully drawn.
 for(const zoom of ZOOMS)for(const d of AtlasDepth.field(camera('desktop',zoom))){
  const s=AtlasDepth.scale(d.shell,zoom);
  if(s<D.fadeTo+.02*(D.fadeFrom-D.fadeTo))assert.ok(d.alpha<.01,`${zoom}x: a dot at scale ${s.toFixed(3)} has alpha ${d.alpha.toFixed(2)}`);
 }
 let last=0;
 for(let zoom=1;zoom<=9;zoom*=1.02){
  const total=AtlasDepth.field(camera('desktop',zoom)).reduce((sum,d)=>sum+d.alpha,0);
  if(last)assert.ok(Math.abs(total-last)/last<.12,`${zoom.toFixed(2)}x: the field's weight jumps from ${last.toFixed(1)} to ${total.toFixed(1)}`);
  last=total;
 }
});

test('no dot sits on a disc or a name it is told to avoid',()=>{
 const avoid=[{x:400,y:300,r:38},{x:355,y:338,w:90,h:34},{x:900,y:200,r:13},{x:850,y:225,w:100,h:40}];
 for(const zoom of ZOOMS){
  const all=AtlasDepth.field(camera('desktop',zoom)),kept=AtlasDepth.field({...camera('desktop',zoom),avoid});
  for(const d of kept)for(const a of avoid){
   if(a.w!=null)assert.ok(d.x+d.r+D.gap<=a.x||d.x-d.r-D.gap>=a.x+a.w||d.y+d.r+D.gap<=a.y||d.y-d.r-D.gap>=a.y+a.h,`${zoom}x: dot ${d.key} under a name`);
   else assert.ok(Math.hypot(d.x-a.x,d.y-a.y)>=a.r+d.r+D.gap,`${zoom}x: dot ${d.key} on a disc`);
  }
  // Avoiding skips dots; it never moves the others.
  const kept_=byKey(kept);
  for(const d of all){const k=kept_.get(d.key);if(k)assert.deepEqual([k.x,k.y,k.r],[d.x,d.y,d.r]);}
 }
});
