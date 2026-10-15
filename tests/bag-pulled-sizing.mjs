import assert from 'node:assert/strict';
import {test} from 'node:test';
const sizing=await import('../public/bag3d/pulled-sizing.mjs').catch(error=>{
 if(error.code==='ERR_MODULE_NOT_FOUND')return {};
 throw error;
});

test('side count continuously reduces diameter from the zone maximum to the full-bag floor',()=>{
 assert.equal(typeof sizing.pulledDiameter,'function','count-dependent pulled-disc sizing exists');
 const options={total:9,floor:84,max:420};
 assert.equal(sizing.pulledDiameter(1,options),420);
 assert.equal(sizing.pulledDiameter(4,options),168,'inverse-square-root interpolation, hand-calculated midpoint');
 assert.equal(sizing.pulledDiameter(9,options),84);
 let previous=Infinity;
 for(let n=1;n<=9;n+=.125){
  const size=sizing.pulledDiameter(n,options);
  assert.ok(size<previous,'strictly decreasing, including between integer counts');
  assert.ok(size>=84&&size<=420);
  previous=size;
 }
 assert.equal(sizing.pulledDiameter(90,options),84,'never below the floor');
 assert.equal(sizing.pulledDiameter(0,options),420,'never above the maximum');
 assert.equal(sizing.pulledDiameter(1,{total:1,floor:84,max:420}),84,'one-disc bag is already all out');
});

test('a narrower zone bounds the entire curve without reducing the floor',()=>{
 assert.equal(typeof sizing.pulledDiameter,'function');
 const options={total:9,floor:84,max:420,zoneBound:200};
 assert.equal(sizing.pulledDiameter(1,options),200);
 assert.equal(sizing.pulledDiameter(4,options),113);
 assert.equal(sizing.pulledDiameter(9,options),84);
 assert.throws(()=>sizing.pulledDiameter(1,{...options,zoneBound:80}),RangeError);
});

const entries=Array.from({length:18},(_,i)=>({key:`disc-${i}`,atlas:{x:i/18,y:(i*7%18)/18},label:{width:140,height:32}}));
const viewport={width:1392,height:850},bag={left:447,top:180,width:491,height:620};
const overlap=(a,b)=>a.left<b.left+b.width-1e-6&&b.left<a.left+a.width-1e-6&&a.top<b.top+b.height-1e-6&&b.top<a.top+a.height-1e-6;

test('desktop footprints fit beside the bag at every count, with labels and a measured floor',()=>{
 assert.equal(typeof sizing.desktopPulledLayout,'function','desktop geometry planner exists');
 const sizes=[];
 for(let n=1;n<=18;n++){
  const layout=sizing.desktopPulledLayout({entries:entries.slice(0,n),allEntries:entries,viewport,bag,floor:84});
  assert.ok(layout,'a full-sized desktop supports this bag');
  assert.equal(layout.spots.size,n);
  const boxes=[];
  for(const [key,spot]of layout.spots){
   const r=spot.diameter/2,disc={left:spot.x-r,top:spot.y-r,width:2*r,height:2*r};
   const label={left:spot.x-70,top:spot.y+r,width:140,height:32};
   assert.ok(spot.diameter>=84);
   assert.ok(spot.side==='left'?disc.left+disc.width<=423:disc.left>=962,'24 px inner margin');
   for(const box of [disc,label]){
    assert.ok(box.left>=12-1e-6&&box.top>=12-1e-6&&box.left+box.width<=1380+1e-6&&box.top+box.height<=838+1e-6,`${key}: inside viewport`);
    assert.ok(!overlap(box,bag));
    for(const other of boxes)assert.ok(!overlap(box,other),`${key}: discs and labels never overlap`);
    boxes.push(box);
   }
  }
  sizes.push(Math.min(...[...layout.spots.values()].map(s=>s.diameter)));
 }
 assert.equal(sizes[0],411,'largest diameter uses the smaller side zone');
 assert.equal(sizes[1],411,'one disc per side remains the max tier');
 for(let i=2;i<sizes.length;i++)assert.ok(sizes[i]<=sizes[i-1]);
 assert.equal(sizes.at(-1),84,'all out is exactly the floor');
 const again=sizing.desktopPulledLayout({entries:[...entries].reverse(),allEntries:entries,viewport,bag,floor:84});
 const forward=sizing.desktopPulledLayout({entries,allEntries:entries,viewport,bag,floor:84});
 assert.deepEqual(again,forward,'positions are independent of pull order');
});

test('an infeasible desktop zone returns control to the existing planner, never a smaller floor',()=>{
 assert.equal(typeof sizing.desktopPulledLayout,'function');
 assert.equal(sizing.desktopPulledLayout({entries,allEntries:entries,viewport:{width:600,height:300},bag:{left:150,top:30,width:300,height:240},floor:84}),null);
});

test('an odd-sized bag reaches the floor when its smaller side is full',()=>{
 const allEntries=Array.from({length:19},(_,i)=>({key:`odd-${String(i).padStart(2,'0')}`,atlas:{x:i/19,y:i/19},label:{width:140,height:32}}));
 const layout=sizing.desktopPulledLayout({entries:allEntries.slice(0,18),allEntries,viewport,bag,floor:84});
 assert.equal(layout.diameters.left,84,'nine discs fill the nine-disc left zone');
 assert.ok(layout.diameters.right>84,'nine discs in the ten-disc right zone remain above the floor');
});

test('a dense bag keeps the largest max tier and a stable curve as the camera pulls back',()=>{
 const allEntries=Array.from({length:32},(_,i)=>({key:`dense-${String(i).padStart(2,'0')}`,atlas:{x:i/32,y:i/32},label:{width:140,height:32}}));
 const first=sizing.desktopPulledLayout({entries:allEntries.slice(0,16),allEntries,viewport,bag:{left:447,top:180,width:498,height:620},floor:59.07376});
 assert.equal(first.max,411,'crowded late counts must not unnecessarily shrink the one-disc maximum');
 assert.ok(first.decay>.5,'a dense side needs faster area decay to fit its floor');
 const next=sizing.desktopPulledLayout({entries:allEntries.slice(0,18),allEntries,viewport,bag:{left:483,top:180,width:426,height:620},floor:59.07376,curve:first});
 assert.equal(next.max,first.max);
 assert.equal(next.decay,first.decay);
 assert.ok(next.diameters.left<first.diameters.left,'more discs never grow when pullback opens space');
 assert.ok(next.diameters.right<first.diameters.right);
 const all=sizing.desktopPulledLayout({entries:allEntries,allEntries,viewport,bag:{left:483,top:180,width:426,height:620},floor:59.07376,curve:first});
 assert.equal(all.diameters.left,59.07376);
 assert.equal(all.diameters.right,59.07376);
});

test('a frozen curve fits the current partial bag without forcing the future full-bag camera',()=>{
 const allEntries=Array.from({length:24},(_,i)=>({key:`panel-${i}`,atlas:{x:i/24,y:i/24},label:{width:140,height:32}}));
 const layout=sizing.desktopPulledLayout({entries:allEntries.slice(0,8),allEntries,viewport:{width:916,height:850},bag:{left:213,top:180,width:490,height:620},floor:60,curve:{max:177,decay:.5}});
 assert.ok(layout,'eight discs fit beside a full-sized bag even if all 24 would require pullback');
 assert.equal(layout.max,177);
 assert.ok(layout.diameters.left>60);
});

test('a pulled disc\'s photo tier covers its device pixels, up to the 3D viewer\'s own (detail) photo',async()=>{
 const {photoTier,PHOTO_TIERS,DETAIL}=await import('../public/disc3d/quality.mjs');
 assert.deepEqual(PHOTO_TIERS,[256,512],'thumbnail and Storage tiers, below the detail viewer');
 assert.equal(photoTier(124.45*2),256,'the pre-change size on a 2× display stays on the thumbnail tier');
 assert.equal(photoTier(228*2),512,'a middling disc on a 2× display: the smallest tier that covers it');
 assert.equal(photoTier(409.5*2),null,'the max tier on a 2× display: the viewer\'s own photo (photoSurface\'s 1024 default)');
 assert.equal(photoTier(513),null,'anything past 512 device px takes the detail photo');
 assert.equal(DETAIL.maxPixelRatio,2,'the viewer caps its drawing buffer at 2×');
});
