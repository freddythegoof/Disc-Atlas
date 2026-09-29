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
 for(const [w,h,left,bottom,width,height] of [[1440,780,128.64,612.3,1182.72,479.6],[390,620,65.64,414.9,258.72,294.8]]){
  const target={x:.72,y:.79},camera=layout.camera(target,w,h,2.8);
  assert.ok(Math.abs(left+target.x*width*camera.zoom+camera.x-w*.5)<1);
  assert.ok(Math.abs(bottom-target.y*height*camera.zoom+camera.y-h*.48)<1);
 }
});
