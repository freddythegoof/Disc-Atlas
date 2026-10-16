import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function camera({width=1440,height=900,reduced=false,saved=false}={}){
 const storage=new Map(saved?[['atlas-intro-seen','1']]:[]);
 const context={window:{AtlasMotion:{enabled:()=>!reduced,reduced:()=>reduced,token:(_,fallback)=>fallback}},
  sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
  document:{body:{classList:{contains:()=>false}},fonts:{ready:{then(){}},addEventListener(){}}},performance:{now:()=>0},innerWidth:width};
 vm.createContext(context);
 vm.runInContext(`let zoom=1,pan={x:0,y:0},selected=null,myMap=null,view='map';
  const canvas={clientWidth:${width},clientHeight:${height},getBoundingClientRect:()=>({width:${width},height:${height}})};
  const filtered=[{id:'destroyer',name:'Destroyer',brand:'Innova',speed:12}];`,context);
 for(const file of ['public/atlas-layout.js','public/atlas-map.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
 vm.runInContext(`const AtlasLayout=window.AtlasLayout;
  mapViewport={width:${width},height:${height}};groupCache={extent:AtlasLayout.FRAME};
  closeCluster=()=>{};draw=()=>{};scheduleMapDraw=()=>{};shownPosition=()=>({x:.72,y:.79});
  shownPositions=()=>new Map([['a',{x:.045,y:-.06}],['b',{x:1.055,y:1.025}]]);
  globalThis.api={present:()=>presentAtlas(),step:stepCamera,stop:stopCamera,
   fit:(extent)=>AtlasLayout.fit(extent,${width},${height}),
   catch:()=>catchAtlasIntro(),
   reduce:()=>{window.AtlasMotion.enabled=()=>false;window.AtlasMotion.reduced=()=>true;},
   state:()=>({zoom,x:pan.x,y:pan.y,selected:selected?.id,active:!!cameraTween,intro:!!atlasIntro,v:{...cameraSpring.velocity}}),
   old:()=>AtlasLayout.camera({x:.72,y:.79},${width},${height},${width}<700?4:2.8),
   layout:AtlasLayout};`,context);
 return context.api;
}
const state=c=>{const {zoom,x,y}=c.state();return {zoom,x,y};};

test('whole-atlas fit uses the actual extent at desktop and phone sizes, within existing zoom limits',()=>{
 for(const [width,height] of [[1440,900],[390,760],[320,568]]){
  const c=camera({width,height}),e={minX:.35,maxX:.65,minY:.3,maxY:.7},fit=c.fit(e),a=c.layout.bounds(width,height);
  assert.ok(fit.zoom>=1&&fit.zoom<=9);
  assert.ok(a.left+e.minX*a.width*fit.zoom+fit.x>=a.view.left+36-1e-8);
  assert.ok(a.left+e.maxX*a.width*fit.zoom+fit.x<=a.view.right-36+1e-8);
  assert.ok(a.bottom-e.maxY*a.height*fit.zoom+fit.y>=a.view.top+36-1e-8);
  assert.ok(a.bottom-e.minY*a.height*fit.zoom+fit.y<=a.view.bottom-36+1e-8);
  assert.ok(c.fit({...e,minX:.2,maxX:.8}).zoom<fit.zoom,'Wider map requires a wider camera');
 }
});
test('first frame reuses the Destroyer camera; completed reveal equals reduced-motion opening exactly',()=>{
 for(const width of [390,1440]){
  const c=camera({width}),calm=camera({width,reduced:true});c.present();calm.present();
  assert.deepEqual(state(c),{...c.old()});assert.equal(c.state().intro,true);
  let previous=c.state().zoom;
  for(let t=0;t<=1800;t+=10){c.step(t);assert.ok(c.state().zoom<=previous,'Pull-back never reverses');previous=c.state().zoom;}
  assert.deepEqual(state(c),state(calm));assert.equal(c.state().active,false);assert.equal(calm.state().active,false);
 }
});
test('input catches a mid-reveal camera in place, with no retained destination or velocity',()=>{
 const c=camera();c.present();c.step(0);c.step(500);const before=state(c);
 assert.ok(before.zoom>1&&before.zoom<2.8);c.catch();
 assert.deepEqual(state(c),before);assert.equal(c.state().active,false);assert.equal(c.state().intro,false);
 assert.deepEqual({...c.state().v},{zoom:0,x:0,y:0});c.step(2000);assert.deepEqual(state(c),before);
});
test('second presentation and a session-restored page open at the whole-atlas framing without replay',()=>{
 const c=camera(),calm=camera({reduced:true}),restored=camera({saved:true});
 c.present();c.step(0);c.step(500);c.stop();c.present();calm.present();restored.present();
 assert.deepEqual(state(c),state(calm));assert.deepEqual(state(restored),state(calm));assert.equal(c.state().active,false);
 assert.equal(restored.state().selected,calm.state().selected,'A session reload keeps the same resting composition');
});
test('turning reduced motion on during the intro finishes at the whole-atlas view immediately',()=>{
 const c=camera(),calm=camera({reduced:true});c.present();c.step(0);c.step(500);c.reduce();c.step(501);calm.present();
 assert.deepEqual(state(c),state(calm));assert.equal(c.state().active,false);
});
test('a late first animation frame still paints the original camera and its full opening breath',()=>{
 const c=camera();c.present();const start=state(c);c.step(500);
 assert.deepEqual(state(c),start,'Startup work cannot consume the establishing first frame');
 c.step(650);assert.deepEqual(state(c),start,'The breath begins at the first painted frame');
 c.step(800);assert.ok(c.state().zoom<start.zoom,'Then the pull-back begins');
});
test('the reveal follows the same trajectory at 30, 60 and 120 Hz',()=>{
 const samples=[];
 for(const hz of [30,60,120]){
  const c=camera();c.present();c.step(0);
  for(let i=1;i<=hz*2;i++){c.step(i*1000/hz);if(i===hz/2)samples.push(c.state().zoom);}
  assert.equal(c.state().active,false);assert.equal(c.state().zoom,1);
 }
 assert.ok(Math.max(...samples)-Math.min(...samples)<1e-8);
});
