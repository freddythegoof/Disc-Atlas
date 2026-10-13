import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function camera(){
 const context={window:{AtlasMotion:{enabled:()=>true}},document:{body:{classList:{contains:()=>false}},fonts:{ready:{then(){}},addEventListener(){}}},performance:{now:()=>0}};
 vm.createContext(context);
 vm.runInContext('let zoom=3,pan={x:-1000,y:500};',context);
 for(const file of ['public/atlas-layout.js','public/atlas-map.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
 vm.runInContext(`
  const AtlasLayout=window.AtlasLayout;
  mapViewport={width:1440,height:900};groupCache={extent:AtlasLayout.FRAME};
  closeCluster=()=>{};draw=()=>{};scheduleMapDraw=()=>{};
  globalThis.api={
   start(target,v){tweenCamera(target);if(v)Object.assign(cameraSpring.velocity,v);},
   release(v){releaseCamera(v);},step:stepCamera,
   state(){return {zoom,x:pan.x,y:pan.y,v:{...cameraSpring.velocity},target:cameraDestination&&{...cameraDestination},active:!!cameraTween};},
   reduce(){window.AtlasMotion.enabled=()=>false;},
   layout:AtlasLayout,
   pan(dx,dy){paintEdge=()=>{};panMap(dx,dy);return {x:pan.x,y:pan.y,edgeX:edgeFeedback.x,edgeY:edgeFeedback.y};}
  };
 `,context);
 return context.api;
}
test('critical spring is time-based: 30, 60 and 120 Hz have the same trajectory',()=>{
 const results=[];
 for(const hz of [30,60,120]){
  const c=camera();c.start({zoom:3,x:-900,y:500},{zoom:0,x:1000,y:0});
  let previous=-1000;
  for(let i=1;i<=hz;i++){
   c.step(i*1000/hz);const s=c.state();assert.ok(s.x>=previous&&s.x<=-900,'No overshoot in a projected throw');previous=s.x;
   if(i===hz/2)results.push(s.x);
  }
  assert.equal(c.state().active,false,'Sleeps after settling');
 }
 assert.ok(Math.max(...results)-Math.min(...results)<1e-8);
});
test('retarget and reversal preserve velocity and start at the live camera',()=>{
 const c=camera();c.start({zoom:4,x:-1200,y:600});c.step(30);
 const before=c.state();c.start({zoom:2,x:-600,y:300});const after=c.state();
 assert.equal(after.zoom,before.zoom);assert.equal(after.x,before.x);assert.deepEqual(after.v,before.v);
 c.step(35);assert.ok(c.state().zoom>before.zoom,'Reversal blends out the old velocity');
 for(let i=1;i<=120;i++)c.step(35+i*10);
 assert.equal(c.state().zoom,2);assert.equal(c.state().active,false);
});
test('release uses 0.99 projection, caps zoom travel and cannot leave data bounds',()=>{
 const c=camera();c.release({zoom:0,x:1,y:0});
 assert.ok(Math.abs(c.state().target.x-(-901))<1e-8);assert.equal(c.state().v.x,1000);
 const capped=camera();capped.release({zoom:0,x:100,y:0});
 assert.equal(capped.state().target.x-(-1000),720,'Pan projection is capped at half the 1440px viewport');
 const hard=camera();hard.release({zoom:10,x:100,y:100});
 assert.ok(hard.state().target.zoom<=4.2);
 for(let i=1;i<=150;i++){
  hard.step(i*10);const s=hard.state();
  assert.ok(s.zoom>=1&&s.zoom<=9);
  const bounded=hard.layout.constrain(s,hard.layout.bounds(1440,900),hard.layout.FRAME);
  assert.equal(s.x,bounded.x);assert.equal(s.y,bounded.y);
  assert.ok(s.zoom<=4.2,'No overshoot beyond the capped zoom projection');
 }
});
test('reduced motion also finishes an already running spring immediately',()=>{
 const c=camera();c.start({zoom:4,x:-1200,y:600});c.step(20);c.reduce();c.step(30);
 assert.equal(c.state().zoom,4);assert.equal(c.state().x,-1200);assert.equal(c.state().active,false);
});
test('reusing the camera constraint output preserves its exact bounds and avoids allocations',()=>{
 const {layout}=camera();
 for(const width of [390,1440])for(const z of [1,3,9])for(const extent of [null,layout.FRAME,{minX:.4,maxX:.6,minY:.4,maxY:.6}]){
  const area=layout.bounds(width,900),input={zoom:z,x:1e5,y:-1e5},expected=layout.constrain(input,area,extent),output={};
  assert.equal(layout.constrain(input,area,extent,36,output),output);
  assert.equal(output.zoom,expected.zoom);assert.equal(output.x,expected.x);assert.equal(output.y,expected.y);
  layout.constrain(input,area,extent,36,input);assert.equal(input.x,expected.x);assert.equal(input.y,expected.y);
 }
});
test('progressive edge resistance stays continuous when a drag reverses',()=>{
 const c=camera(),edge=c.pan(10000,10000),reverse=c.pan(-1,-1);
 assert.equal(reverse.x,edge.x);assert.equal(reverse.y,edge.y);
 assert.ok(reverse.edgeX<edge.edgeX&&edge.edgeX-reverse.edgeX<1);
 assert.ok(reverse.edgeY<edge.edgeY&&edge.edgeY-reverse.edgeY<1);
});
