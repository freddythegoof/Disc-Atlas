// What a click reaches on the atlas and when its discs may change under the pointer (public/atlas-targets.js).
// Readable means clickable: a disc's art and its name's box both land a click, a curated disc's above a small
// disc the canvas draws, and the regroup waits for a pointer that is reaching for one.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({});
vm.runInContext(fs.readFileSync('public/atlas-targets.js','utf8'),context);
const T=vm.runInContext('AtlasTargets',context);

const marker=(x,y,r=40,label=null,ref='m')=>({kind:'marker',x,y,r,label,ref});
const gap=(x,y,r=24,label=null,ref='g')=>({kind:'gap',x,y,r,label,ref});
const box=(x,y,w,h)=>({x,y,w,h});

test('a click on a disc lands on it, and on its name',()=>{
 const m=marker(200,200,40,box(150,250,100,30));
 assert.equal(T.pick([m],210,190),m,'the art');
 assert.equal(T.pick([m],200,265),m,'the name, which hangs below the art');
 assert.equal(T.pick([m],200,300),null,'beyond both');
 const g=gap(500,300,25,box(450,340,100,30));
 assert.equal(T.pick([g],500,300),g,'a small disc the canvas draws');
 assert.equal(T.pick([g],480,355),g,'its name');
 assert.equal(T.pick([gap(500,300,25)],480,355),null,'no name box, no name target');
});

test('a curated disc is above a small disc, art above names, and the nearer centre wins',()=>{
 const m=marker(100,100,40,box(60,150,80,30),'m'),g=gap(110,105,24,null,'g');
 assert.equal(T.pick([g,m],108,104).ref,'m','where a marker and a small disc overlap the marker is on top');
 const near=marker(100,100,40,null,'near'),far=marker(130,100,40,null,'far');
 assert.equal(T.pick([far,near],110,100).ref,'near','overlapping dot boxes resolve to the nearer centre');
 // A marker's name box over a small disc's art: the name is the DOM's, above the canvas.
 const name=marker(100,100,30,box(60,140,80,30),'m'),under=gap(100,155,20,null,'g');
 assert.equal(T.pick([under,name],100,150).ref,'m');
 // But a marker's art beats another marker's name.
 const a=marker(100,100,40,null,'a'),b=marker(100,160,30,box(60,110,80,30),'b');
 assert.equal(T.pick([b,a],100,115).ref,'a');
});

test('reach grows a target by the slack, circle and name alike',()=>{
 const m=marker(200,200,40,box(150,250,100,30));
 assert.equal(T.reach(m,200,245),false);
 assert.equal(T.reach(m,200,245,6),true,'6px past the art');
 assert.equal(T.reach(m,200,243+T.PIN.slack),true);
 assert.equal(T.reach(m,200,150-T.PIN.slack-5),false);
 assert.equal(T.reach(m,145,265,6),true,'6px left of the name');
 assert.equal(T.reach(m,140,265,6),false);
});

test('the pointer reads a disc only where it has a name',()=>{
 const named=marker(200,200,40,box(150,250,100,30)),bare=gap(500,300,25);
 assert.equal(T.reads([named,bare],200,200),true);
 assert.equal(T.reads([named,bare],200,265),true,'on the name');
 assert.equal(T.reads([named,bare],500,300),false,'a mini with no name yet is not readable');
 assert.equal(T.reads([named,bare],900,900),false);
});

const at=(over={})=>({inside:true,pressed:false,at:1000,...over});
test('a regroup due while the pointer moves waits until it has stopped',()=>{
 const H=T.HOLD,now=1100;
 assert.deepEqual({...T.hold({now,due:1000,pointer:at({at:1090}),onTarget:false})},{hold:true,until:1090+H.settle});
 assert.equal(T.hold({now:1090+H.settle,due:1000,pointer:at({at:1090}),onTarget:false}).hold,false,'once it has been still for the settle time');
});

test('a regroup waits longer for a pointer resting on a readable disc, but not for ever',()=>{
 const H=T.HOLD,pointer=at({at:1000});
 assert.equal(T.hold({now:1000+H.settle+50,due:1000,pointer,onTarget:false}).hold,false,'off a disc it goes at the settle time');
 assert.equal(T.hold({now:1000+H.settle+50,due:1000,pointer,onTarget:true}).hold,true,'on one it waits');
 assert.equal(T.hold({now:1000+H.hover-1,due:1000,pointer,onTarget:true}).hold,true);
 assert.equal(T.hold({now:1000+H.hover,due:1000,pointer,onTarget:true}).hold,false,'the hover time is up');
 // A pointer that never stops still cannot hold a regroup past the cap.
 assert.equal(T.hold({now:1000+H.max-1,due:1000,pointer:at({at:1000+H.max-5}),onTarget:true}).hold,true);
 assert.equal(T.hold({now:1000+H.max,due:1000,pointer:at({at:1000+H.max-5}),onTarget:true}).hold,false);
});

test('a press holds the regroup for as long as it lasts, and a pointer outside the map holds nothing',()=>{
 const H=T.HOLD;
 assert.deepEqual({...T.hold({now:1000+H.max*10,due:1000,pointer:at({pressed:true,at:0}),onTarget:false})},{hold:true,until:Infinity});
 assert.equal(T.hold({now:1010,due:1000,pointer:at({inside:false,at:1005}),onTarget:true}).hold,false);
});
