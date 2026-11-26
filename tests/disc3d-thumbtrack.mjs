// Thumbtracks in the procedural 3D disc (public/disc3d/shape.mjs THUMBTRACK): each of the 19 tagged molds
// gets its kind's top-surface relief from the same generator, and every other shape is untouched. The relief
// is checked against HuckTwin's photo study (Nov 25, 2026) and Freddy's feel checks against his Berg (Nov 26): a raised
// track is a ring proud of a shallow dish (a ring on the dome on the Blast and Hammer), a puddle's rim is the highest point, a
// groove sits mid-plate or at the shoulder, and a thumbtack is on one arc only.
// Run: node --test tests/disc3d-thumbtrack.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {shapeForDisc,thumbtrackOf,THUMBTRACK,discProfile,profileStats,shapeFrame,topHeight,surfaceSampler,thumbtackLifter,normalizeShape} from '../public/disc3d/shape.mjs';

const discs=JSON.parse(fs.readFileSync(new URL('../public/data.json',import.meta.url))).discs;
const tagged=discs.filter(d=>d.thumbtrack);
const byName=name=>discs.find(d=>d.name===name);
const shapes=d=>({plain:shapeForDisc({specs:d.specs,flight:d}).shape,shape:shapeForDisc({specs:d.specs,flight:d,thumbtrack:thumbtrackOf(d)}).shape});
// Height above the shoulder along the top, centre to shoulder.
const relief=(shape,n=400)=>{const {Rs,Hs}=shapeFrame(shape);return Array.from({length:n+1},(_,i)=>{const r=Rs*i/n;return {r,h:topHeight(shape,r)-Hs};});};

test('19 tagged records, each of a known kind; the Sled, Blast and Hammer carry a position',()=>{
 assert.equal(tagged.length,19);
 for(const d of tagged)assert.ok(THUMBTRACK[d.thumbtrack],d.name);
 assert.deepEqual(discs.filter(d=>d.thumbtrackPosition).map(d=>[d.name,d.thumbtrack,d.thumbtrackPosition]).sort(),[['Blast','raised','rim'],['Hammer (Chui, 战锤)','raised','rim'],['Sled (DIS-0126-P)','groove','shoulder']]);
});

test('without a thumbtrack the shape, profile and surface are exactly what they were',()=>{
 for(const d of discs.filter(d=>!d.thumbtrack&&d.specs).slice(0,200)){
  const a=shapeForDisc({specs:d.specs,flight:d}),b=shapeForDisc({specs:d.specs,flight:d,thumbtrack:thumbtrackOf(d)});
  assert.deepEqual(b,a);assert.ok(!('thumbtrack' in a.shape));
  const top=surfaceSampler(a.shape);
  for(const [x,z] of [[0,0],[3,-4],[7.1,2],[-9,1.5]])assert.equal(top(x,z),topHeight(a.shape,Math.hypot(x,z)));
 }
 assert.equal(thumbtackLifter(normalizeShape({})),null);
 assert.deepEqual(normalizeShape({thumbtrack:{kind:'bump'}}),normalizeShape({}),'an unknown kind is dropped');
});

test('every tagged mold still stands at its measured height, with a solid plate',()=>{
 for(const d of tagged){
  const {plain,shape}=shapes(d),before=profileStats(plain).height,after=profileStats(shape).height;
  assert.ok(Math.abs(after-before)<.03,`${d.name}: ${before.toFixed(3)} -> ${after.toFixed(3)} cm`);
  const pts=discProfile(shape);assert.ok(pts.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0),d.name);
 }
});

test('raised: a ring level with the rim round a shallow, flat-floored dish; the cavity untouched (Berg and its class)',()=>{
 const dish=tagged.filter(d=>d.thumbtrack==='raised'&&!d.thumbtrackPosition),k=THUMBTRACK.raised;
 assert.deepEqual(dish.map(d=>d.name).sort(),['Armadillo','Berg','Berg X','Copperhead','Devilhawk','Ghoul','Warspear']);
 for(const d of dish){
  const {plain,shape}=shapes(d),{Rs,tt}=shapeFrame(shape),peak=profileStats(plain).height,pts=relief(shape);
  assert.ok(tt.dish&&Math.abs(tt.ringIn-(Rs-k.ring))<1e-9,d.name);
  // The ring, from its inner edge out to the shoulder, stands at the measured height.
  for(let r=tt.ringIn;r<=Rs;r+=.05)assert.ok(Math.abs(topHeight(shape,r)-peak)<1e-9,d.name+': the ring is level at '+peak.toFixed(3)+' cm');
  // The floor sits `step` lower, flat from the axis to the foot of the wall; no dome anywhere.
  for(let r=0;r<=tt.floor;r+=.05)assert.ok(Math.abs(topHeight(shape,r)-(peak-k.step))<1e-9,d.name+': the floor is flat');
  for(let i=1;i<pts.length;i++)assert.ok(pts[i].h>=pts[i-1].h-1e-12,d.name+': the top only climbs toward the ring');
  // Underneath, nothing changes: the cavity is the plain mold's, so the plate is thinner under the dish, still solid.
  const a=discProfile(shape),b=discProfile(plain);
  for(let i=0;i<=12;i++)assert.deepEqual(a[i],b[i],d.name+': the underside is the plain one');
  assert.ok(a.slice(0,13).every(q=>topHeight(shape,q.x)-q.y>.08),d.name+': the plate under the dish is over 0.8 mm thick');
 }
});

test('raised at the rim: a plateau ring proud of the plate, into the shoulder (Blast, Hammer)',()=>{
 for(const name of ['Blast','Hammer (Chui, 战锤)']){
  const {plain,shape}=shapes(byName(name)),{Rs,Hs,tt}=shapeFrame(shape),pts=relief(shape);
  assert.ok(!tt.dish&&topHeight(shape,Rs)-Hs>=tt.height-1e-9,name+': the shoulder is lifted by the track');
  // The ring's inner edge is the top, at the measured height; the plate inside it sits lower (recessed).
  const peak=Math.max(...pts.map(p=>p.h));
  assert.ok(Math.abs(peak+Hs-profileStats(plain).height)<1e-9,name+': no taller than measured');
  assert.ok(Math.abs(pts.find(p=>p.h===peak).r-tt.innerR)<Rs/100,name+': the peak is the ring');
  assert.ok(topHeight(shape,0)<peak+Hs-.05,name+': the plate sits below the ring');
 }
});

test('puddle: the rim is the highest point and the plate is dished below it (Range, Stasis)',()=>{
 for(const name of ['Range','Stasis']){
  const {shape}=shapes(byName(name)),{Rs}=shapeFrame(shape),pts=relief(shape);
  const rim=topHeight(shape,Rs);
  assert.ok(pts.every(p=>p.h+shapeFrame(shape).Hs<=rim+1e-9),name+': nothing on the top stands above the rim');
  assert.ok(rim-topHeight(shape,0)>=THUMBTRACK.puddle.depth-1e-9,name+': the centre sits below the rim');
  // Concave: the slope steepens toward the rim.
  for(let i=2;i<pts.length;i++)assert.ok(pts[i].h-pts[i-1].h>=pts[i-1].h-pts[i-2].h-1e-9,name+' is concave');
 }
});

test('groove: a narrow channel, mid-plate on the Banger-GT, at the shoulder on the Sled',()=>{
 const centre=name=>{const {shape,plain}=shapes(byName(name)),a=relief(shape,2000),b=relief(plain,2000);
  const dip=a.map((p,i)=>b[i].h-p.h),i=dip.indexOf(Math.max(...dip)),wide=a.filter((p,j)=>dip[j]>.01);
  return {at:a[i].r/shapeFrame(shape).Rs,depth:dip[i],width:wide.at(-1).r-wide[0].r};};
 const banger=centre('Banger-GT'),sled=centre('Sled (DIS-0126-P)'),zone=centre('Zone GT (Banger Top)');
 for(const g of [banger,sled,zone]){assert.ok(Math.abs(g.depth-THUMBTRACK.groove.depth)<.005);assert.ok(g.width<.7,'narrow: '+g.width.toFixed(2)+' cm');}
 assert.ok(banger.at>.5&&banger.at<.75,'Banger-GT mid-plate at '+banger.at.toFixed(2)+'·Rs');
 assert.ok(sled.at>.93,'Sled at the shoulder, '+sled.at.toFixed(2)+'·Rs');
 assert.ok(Math.abs(zone.at-banger.at)<.05,'Zone GT (Banger Top) takes the Banger’s groove');
});

test('thumbtack: one thumb-wide bulge on the shoulder, not a ring (Pig)',()=>{
 const {shape}=shapes(byName('Pig')),{Rs,tt}=shapeFrame(shape),lift=thumbtackLifter(shape),k=THUMBTRACK.thumbtack;
 const around=Array.from({length:720},(_,i)=>{const a=i/720*2*Math.PI;return lift(tt.centre*Math.cos(a),tt.centre*Math.sin(a));});
 assert.ok(Math.abs(Math.max(...around)-k.height)<1e-3,'peaks at its height');
 const arc=around.filter(v=>v>.01).length/720*2*Math.PI*tt.centre;
 assert.ok(arc>1&&arc<4,`about a thumb wide along the shoulder: ${arc.toFixed(1)} cm`);
 assert.ok(around.filter(v=>v===0).length>600,'most of the shoulder is untouched');
 assert.equal(lift(0,0),0);assert.equal(lift(Rs*.5,0),0);
 const top=surfaceSampler(shape),[x,z]=[tt.centre*Math.cos(k.angle),tt.centre*Math.sin(k.angle)];
 assert.ok(Math.abs(top(x,z)-topHeight(shape,tt.centre)-k.height)<1e-9,'stamps and photos follow the bulge');
});
