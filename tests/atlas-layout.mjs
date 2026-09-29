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
