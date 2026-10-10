// Plan 09 shape rules for the procedural 3D disc (public/disc3d/shape.mjs): the underside is always a
// hollow plate, rims sharpen and widen with speed, flatter tops go with more stability, and discs
// without flight numbers get no model (the panel keeps its static illustration).
// Run: node --test tests/disc3d-shape.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {shapeFromFlight,discProfile,profileStats,shapeFrame,normalizeShape,DEFAULTS} from '../public/disc3d/shape.mjs';

const putter=shapeFromFlight({speed:2,turn:0,fade:1});
const midrange=shapeFromFlight({speed:5,turn:-1,fade:1});
const fairway=shapeFromFlight({speed:7,turn:0,fade:2});
const driver=shapeFromFlight({speed:12,turn:-1,fade:3});

test('discs without flight numbers have no model',()=>{
 assert.equal(shapeFromFlight({speed:null,turn:null,fade:null}),null);
 assert.equal(shapeFromFlight({speed:7,turn:0}),null);
 assert.equal(shapeFromFlight(null),null);
});

test('the profile is a closed outline from the axis back to the axis',()=>{
 for(const shape of [putter,midrange,fairway,driver]){
  const pts=discProfile(shape);
  assert.equal(pts[0].x,0);assert.equal(pts[pts.length-1].x,0);
  assert.ok(pts.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=shape.diameter/2+1e-9));
  assert.ok(pts.length<120,'modest profile sampling');
 }
});

test('the outline winds counter-clockwise, so lathe normals face outward',()=>{
 for(const shape of [putter,driver]){
  const pts=discProfile(shape);let area=0;
  for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];area+=a.x*b.y-b.x*a.y;}
  assert.ok(area>0);
 }
});

test('the underside is hollow: a thin plate over a deep cavity, never a puck',()=>{
 for(const shape of [putter,midrange,fairway,driver]){
  const s=profileStats(shape);
  assert.ok(s.cavity>1,'cavity under the plate is over a centimetre deep');
  assert.ok(s.centrePlate<.4,'flight plate at the centre is thin');
  assert.ok(s.cavity>s.height*.7,'most of the height is open underneath');
 }
 // Every sample inside the inner rim wall is the plate: nothing fills the bowl below rimDepth.
 const {Ri,p}=shapeFrame(driver);
 for(const q of discProfile(driver))if(q.x<Ri-.4)assert.ok(q.y>=p.rimDepth-1e-9);
});

test('speed drives the rim: wider, shallower, sharper, more concave underneath',()=>{
 const order=[putter,midrange,fairway,driver];
 for(let i=1;i<order.length;i++){
  const a=order[i-1],b=order[i];
  assert.ok(b.rimWidth>a.rimWidth);assert.ok(b.rimDepth<a.rimDepth);
  assert.ok(b.sharpness>=a.sharpness);
  assert.ok(profileStats(b).noseAngle<profileStats(a).noseAngle,'nose angle narrows with speed');
 }
 assert.equal(putter.sharpness,0);assert.equal(driver.sharpness,1);
 assert.ok(putter.bevel<-.5,'putter lower wing is round');
 assert.ok(driver.bevel>.5,'driver lower wing is concave');
 assert.ok(profileStats(putter).noseAngle>150,'putter nose is blunt');
 assert.ok(profileStats(driver).noseAngle<75,'driver nose is sharp');
});

test('more stable discs get flatter tops; the cue stays small and speed still rules the rim',()=>{
 const flippy=shapeFromFlight({speed:9,turn:-3,fade:1}),beefy=shapeFromFlight({speed:9,turn:0,fade:4});
 assert.ok(beefy.domeHeight<flippy.domeHeight);
 assert.ok(beefy.partingLine>flippy.partingLine);
 assert.equal(beefy.rimWidth,flippy.rimWidth);assert.equal(beefy.sharpness,flippy.sharpness);
 // An understable driver still looks like a driver; an overstable putter still looks like a putter.
 const flippyDriver=shapeFromFlight({speed:12,turn:-4,fade:1}),utilityPutter=shapeFromFlight({speed:3,turn:0,fade:4});
 assert.ok(profileStats(flippyDriver).noseAngle<profileStats(utilityPutter).noseAngle);
 assert.ok(flippyDriver.rimWidth>utilityPutter.rimWidth*1.6);
});

test('tunable parameters are clamped to shapes that stay valid',()=>{
 const wild=normalizeShape({rimWidth:99,rimDepth:-4,domeHeight:5,sharpness:3,bevel:-8,partingLine:2});
 assert.ok(wild.rimWidth<=wild.diameter/2*.35);assert.ok(wild.rimDepth>=.6);
 assert.equal(wild.sharpness,1);assert.equal(wild.bevel,-1);
 const s=profileStats(wild);assert.ok(s.cavity>.5);
 assert.deepEqual(normalizeShape({}),{...DEFAULTS});
});
