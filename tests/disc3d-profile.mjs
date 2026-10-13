// Clay mode's cross-section (public/disc3d/profile.mjs): drawn from the lathe's own profile points, both halves,
// at true scale on a fixed 22 cm frame, annotated with the record's PDGA spec strings only when the shape comes
// from them. The browser half (same points as the live geometry, the toggle, the pop-out) is in
// tests/disc3d-browser.mjs and tests/disc3d-popout-browser.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {discProfile,overmoldProfile,shapeForDisc} from '../public/disc3d/shape.mjs';
import {isOvermold} from '../public/disc3d/overmold.mjs';
import {profileSVG,profileDimensions,CLAY_TONES} from '../public/disc3d/profile.mjs';

const {discs}=JSON.parse(fs.readFileSync(new URL('../public/data.json',import.meta.url)));
const rated=name=>discs.find(d=>(d.catalogName||d.name)===name&&d.speed!=null);
// What the viewer feeds it: shapeForDisc, then mesh.mjs lathePoints (the same two shape.mjs calls).
function feed(d,{specs=d.specs,width=320}={}){
 const {shape,source}=shapeForDisc({model:d.model3d,specs,flight:{speed:d.speed,turn:d.turn,fade:d.fade}});
 const overmold=isOvermold({manufacturer:d.manufacturer,record:d.name});
 const profile=overmold?overmoldProfile(shape):{points:discProfile(shape),rim:null};
 return {shape,source,profile,overmold,out:profileSVG(profile,{shape,source,specs,width,mold:d.catalogName||d.name})};
}
const attr=(svg,name)=>Number(svg.match(new RegExp(`data-${name}="([^"]+)"`))[1]);
const pathPoints=d=>d.replace(/Z$/,'').slice(1).split('L').map(p=>p.split(' ').map(Number));
const outline=svg=>pathPoints(svg.match(/class="disc3d-profile-outline" d="([^"]+)"/)[1]);

test('the outline is the lathe profile, right half then the mirrored left half, at the drawing scale',()=>{
 for(const name of ['Destroyer','Buzzz','Aviar','Envy']){
  const {profile,out}=feed(rated(name)),pts=profile.points,svg=out.svg;
  const s=attr(svg,'scale'),cx=attr(svg,'cx'),base=attr(svg,'base'),bottom=attr(svg,'bottom');
  const drawn=outline(svg);
  assert.equal(drawn.length,pts.length*2,name+': both halves, every profile point');
  pts.forEach((p,i)=>{
   const [rx,ry]=drawn[i],[lx,ly]=drawn[drawn.length-1-i];
   // Inverse of the drawing transform, back to centimetres; 0.1 px rounding is under 0.01 cm.
   assert.ok(Math.abs((rx-cx)/s-p.x)<.01&&Math.abs((base-ry)/s+bottom-p.y)<.01,`${name} right half point ${i}`);
   assert.ok(Math.abs((cx-lx)/s-p.x)<.01&&Math.abs(ly-ry)<1e-9,`${name} left half mirrors point ${i}`);
  });
 }
});

test('true scale: a fixed frame, so drawn widths follow the PDGA diameters',()=>{
 const width=d=>{const xs=outline(feed(d).out.svg).map(p=>p[0]);return Math.max(...xs)-Math.min(...xs);};
 const destroyer=rated('Destroyer'),buzzz=rated('Buzzz');
 const want=Number(buzzz.specs.Diameter)/Number(destroyer.specs.Diameter);
 assert.ok(Math.abs(width(buzzz)/width(destroyer)-want)<.005,`Buzzz ${width(buzzz)} vs Destroyer ${width(destroyer)}`);
 // And height to the same scale as width: no vertical exaggeration.
 const {profile,out}=feed(destroyer),pts=profile.points,drawn=outline(out.svg);
 const cm=v=>Math.max(...v)-Math.min(...v);
 const sx=cm(drawn.map(p=>p[0]))/(2*cm(pts.map(p=>p.x).concat(0))),sy=cm(drawn.map(p=>p[1]))/cm(pts.map(p=>p.y));
 assert.ok(Math.abs(sx/sy-1)<.01,`uniform scale (${sx.toFixed(3)} vs ${sy.toFixed(3)})`);
});

test('PDGA-shaped discs carry the panel\'s own spec strings; nothing is invented',()=>{
 for(const name of ['Destroyer','Buzzz','Aviar']){
  const d=rated(name),{source,out}=feed(d);
  assert.equal(source,'pdga');
  for(const [key,label] of [['diameter','Diameter'],['height','Height'],['rimWidth','Rim width'],['rimDepth','Rim depth']]){
   // The detail panel prints `${v} cm` from d.specs.
   assert.equal(out.dims[key],`${d.specs[label]} cm`);
   assert.ok(out.svg.includes(`>${label} ${d.specs[label]} cm<`),`${name} shows ${label} ${d.specs[label]} cm`);
  }
  assert.match(out.caption,/PDGA dimensions, to scale/);
  assert.match(out.label,new RegExp(`diameter ${d.specs.Diameter} cm`));
  const numbers=[...out.svg.matchAll(/<text[^>]*>([^<]*)</g)].map(m=>m[1]);
  assert.equal(numbers.length,4,'four annotations, no more: '+numbers.join(' | '));
 }
});

test('a generic flight-number shape is drawn unannotated and labelled as generic',()=>{
 const d=rated('Leopard'),{source,out}=feed(d,{specs:null});
 assert.equal(source,'flight');
 assert.equal(out.dims,null);
 assert.ok(!/<text/.test(out.svg),'no dimension labels');
 assert.match(out.caption,/generic shape from its flight numbers/);
 assert.match(out.label,/generic shape from its flight numbers\.$/);
 assert.equal(profileDimensions({Diameter:'21.1'}),null,'partial specs print nothing');
});

test('overmold discs draw the rim piece in its own clay tone, both sides',()=>{
 const {overmold,profile,out}=feed(rated('Envy'));
 assert.ok(overmold);
 const rims=[...out.svg.matchAll(/class="disc3d-profile-rim" d="([^"]+)" fill="([^"]+)"/g)];
 assert.equal(rims.length,2);
 assert.notEqual(CLAY_TONES.rim,CLAY_TONES.plate);
 for(const [,,fill] of rims)assert.equal(fill,CLAY_TONES.rim);
 assert.equal(pathPoints(rims[0][1]).length,profile.rim[1]-profile.rim[0]+1,'the rim edges of the lathe profile');
 const one=feed(rated('Destroyer')).out.svg;
 assert.ok(!/disc3d-profile-rim/.test(one),'one-piece discs are one tone');
});
