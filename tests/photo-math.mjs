import {test} from 'node:test';
import assert from 'node:assert/strict';
test('photo crop keeps a centered circular mask and corrects modest foreshortening',async()=>{
 const m=await import('../public/disc-photo.mjs');
 assert.equal(typeof m.photoPoint,'function');
 assert.deepEqual(m.photoPoint(0,0,{width:1200,height:1000}),{x:600,y:500,inside:true});
 assert.equal(m.photoPoint(1,1,{width:1200,height:1000}).inside,false);
 assert.deepEqual(m.photoPoint(0,1,{width:1200,height:1000,aspect:.8,scale:1}),{x:600,y:900,inside:true});
 assert.deepEqual(m.photoPoint(-1,0,{width:1200,height:1000,scale:1}),{x:100,y:500,inside:true});
 const horizontal=m.photoPoint(1,0,{width:1000,height:1000,scale:1,aspect:.8,angle:90});
 assert.ok(Math.abs(horizontal.x-900)<1e-8);assert.ok(Math.abs(horizontal.y-500)<1e-8);
});
