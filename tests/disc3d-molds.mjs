// Plan 09 phase 2: each mold's 3D shape from its PDGA dimensions (public/disc3d/shape.mjs). Destroyer,
// Buzzz and Aviar read as three different molds that match their numbers; every catalog record builds a
// valid hollow disc as tall and wide as PDGA measured it; records without usable dimensions fall back to
// the Phase 1 generic shape; and stability keeps its small Phase 1 cues.
// Run: node --test tests/disc3d-molds.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {shapeForDisc,shapeFromMeasurements,measurementsFromSpecs,shapeFromFlight,normalizeShape,discProfile,profileStats,shapeFrame} from '../public/disc3d/shape.mjs';

const {discs}=JSON.parse(fs.readFileSync(new URL('../public/data.json',import.meta.url),'utf8'));
const rated=d=>[d.speed,d.turn,d.fade].every(Number.isFinite);
const mold=name=>{const d=discs.find(x=>(x.catalogName||x.name)===name&&rated(x));assert.ok(d,name+' is in the catalog');return d;};
const flight=d=>({speed:d.speed,turn:d.turn,fade:d.fade});
const spec=(d,k)=>Number(d.specs[k]);

// Strict crossing of two segments (shared endpoints and collinear touches don't count).
function crosses(a,b,c,d){
 const o=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x),e=1e-9;
 const d1=o(c,d,a),d2=o(c,d,b),d3=o(a,b,c),d4=o(a,b,d);
 return ((d1>e&&d2<-e)||(d1<-e&&d2>e))&&((d3>e&&d4<-e)||(d3<-e&&d4>e));
}
function selfIntersects(pts){
 const n=pts.length;
 for(let i=0;i<n;i++)for(let j=i+2;j<n;j++){
  if(i===0&&j===n-1)continue;  // the closing segment along the axis meets the first one
  if(crosses(pts[i],pts[(i+1)%n],pts[j],pts[(j+1)%n]))return true;
 }
 return false;
}
// Everything that makes a shape safe to lathe: finite, inside its radius, above the foot, wound so the
// normals face out, no folds, and hollow underneath.
function assertValid(shape,label){
 for(const [k,v] of Object.entries(shape))assert.ok(Number.isFinite(v),`${label}: ${k} is finite`);
 assert.deepEqual(normalizeShape(shape),shape,`${label}: parameters already within their clamps`);
 const pts=discProfile(shape),R=shape.diameter/2,s=profileStats(shape);
 assert.equal(pts[0].x,0);assert.equal(pts[pts.length-1].x,0);
 for(const p of pts){assert.ok(p.x>=0&&p.x<=R+1e-9,`${label}: profile inside the radius`);assert.ok(p.y>=-1e-9&&p.y<=s.height+1e-9);}
 let area=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];area+=a.x*b.y-b.x*a.y;}
 assert.ok(area>0,`${label}: outline winds counter-clockwise`);
 assert.ok(!selfIntersects(pts),`${label}: outline never folds over itself`);
 assert.ok(s.cavity>1&&s.cavity>s.height*.75,`${label}: hollow underneath (${s.cavity.toFixed(2)} of ${s.height.toFixed(2)} cm)`);
 assert.ok(s.centrePlate<.5,`${label}: thin flight plate`);
 return s;
}

test('Destroyer, Buzzz and Aviar are three distinct molds that match their PDGA numbers',()=>{
 const set=['Destroyer','Buzzz','Aviar'].map(name=>{
  const d=mold(name),shape=shapeFromMeasurements(d.specs,flight(d)),stats=assertValid(shape,name);
  assert.equal(shape.diameter,spec(d,'Diameter'));
  assert.equal(shape.rimWidth,spec(d,'Rim width'));
  assert.equal(shape.rimDepth,spec(d,'Rim depth'));
  assert.ok(Math.abs(stats.height-spec(d,'Height'))<=.05+1e-9,`${name} stands ${stats.height.toFixed(3)} cm vs PDGA ${d.specs.Height}`);
  return {name,shape,stats};
 });
 const [destroyer,buzzz,aviar]=set;
 // Rim: Destroyer wide and sharp, Aviar small and blunt, Buzzz in between.
 assert.ok(destroyer.shape.rimWidth>buzzz.shape.rimWidth&&buzzz.shape.rimWidth>aviar.shape.rimWidth);
 assert.ok(destroyer.shape.sharpness>buzzz.shape.sharpness&&buzzz.shape.sharpness>aviar.shape.sharpness);
 assert.ok(destroyer.stats.noseAngle<buzzz.stats.noseAngle&&buzzz.stats.noseAngle<aviar.stats.noseAngle);
 assert.ok(destroyer.stats.noseAngle<75&&aviar.stats.noseAngle>150);
 assert.ok(destroyer.shape.bevel>.5&&aviar.shape.bevel<-.5);
 // Scale and height come from the measurements: the Buzzz is the widest (21.7 cm), the Destroyer the
 // smallest and flattest (21.1 cm, 1.4 cm tall).
 assert.ok(buzzz.shape.diameter>aviar.shape.diameter&&aviar.shape.diameter>destroyer.shape.diameter);
 assert.ok(destroyer.stats.height<buzzz.stats.height&&destroyer.stats.height<aviar.stats.height);
 // And the measurements move them off the Phase 1 one-size shape.
 for(const {name,shape} of set){
  const generic=shapeFromFlight(flight(mold(name)));
  assert.notDeepEqual(shape,generic,name+' differs from its Phase 1 shape');
 }
});

test('every catalog record builds a valid hollow disc as tall and wide as PDGA measured it',()=>{
 let built=0;
 for(const d of discs){
  const label=`${d.name} (${d.id})`,shape=shapeFromMeasurements(d.specs,rated(d)?flight(d):null);
  assert.ok(shape,label+' has usable PDGA dimensions');
  const s=assertValid(shape,label),H=spec(d,'Height'),gap=H-spec(d,'Rim depth');
  assert.ok(shape.sharpness>=0&&shape.sharpness<=1&&shape.domeHeight>=0&&shape.domeHeight<=1.5);
  assert.equal(shape.diameter,spec(d,'Diameter'));
  // Height holds to PDGA's own 0.1 cm rounding; a gap too small for a 0.12 cm plate runs that much over.
  if(gap>=.12)assert.ok(Math.abs(s.height-H)<=.05+1e-9,`${label}: ${s.height.toFixed(3)} vs ${H}`);
  else assert.ok(s.height-H<=.12+1e-9&&s.height>=H-1e-9,`${label}: ${s.height.toFixed(3)} vs ${H}`);
  built++;
 }
 assert.equal(built,discs.length);
});

test('ten random molds stay within sane bounds',()=>{
 let seed=20261009;const rand=()=>(seed=(seed*1664525+1013904223)>>>0)/2**32;
 const pool=discs.filter(rated),picks=new Set();
 while(picks.size<10)picks.add(pool[Math.floor(rand()*pool.length)]);
 for(const d of picks){
  const {shape,source}=shapeForDisc({specs:d.specs,flight:flight(d)});
  assert.equal(source,'pdga');
  const s=assertValid(shape,d.name),{Ri}=shapeFrame(shape);
  assert.ok(shape.diameter>=20&&shape.diameter<=25,d.name+' diameter');
  assert.ok(shape.rimWidth>=.6&&shape.rimWidth<=2.6,d.name+' rim width');
  assert.ok(shape.rimDepth>=1&&shape.rimDepth<=2.2,d.name+' rim depth');
  assert.ok(s.height>=1.2&&s.height<=3,d.name+' height');
  assert.ok(Ri>shape.diameter/2*.7,d.name+' rim leaves most of the disc as flight plate');
 }
});

test('records without usable PDGA dimensions fall back to the Phase 1 generic shape',()=>{
 const f={speed:9,turn:-1,fade:2},generic=shapeFromFlight(f);
 for(const specs of [undefined,null,{},{Diameter:'21.2',Height:'1.8','Rim width':'2.0'},
  {Diameter:'21.2',Height:'1.8','Rim width':'2.0','Rim depth':''},{Diameter:'n/a',Height:'1.8','Rim width':'2.0','Rim depth':'1.2'},
  {Diameter:'21.2',Height:'0','Rim width':'2.0','Rim depth':'1.2'},{Diameter:'21.2',Height:'1.8','Rim width':'-2','Rim depth':'1.2'}]){
  assert.equal(measurementsFromSpecs(specs),null,JSON.stringify(specs));
  assert.deepEqual(shapeForDisc({specs,flight:f}),{shape:generic,source:'flight'});
 }
 // Numbers work as well as the catalog's strings; explicit model params outrank both.
 const specs={Diameter:21.2,Height:1.8,'Rim width':2,'Rim depth':1.2};
 assert.equal(shapeForDisc({specs,flight:f}).source,'pdga');
 assert.deepEqual(shapeForDisc({model:{rimWidth:1.1},specs,flight:f}),{shape:normalizeShape({rimWidth:1.1}),source:'model'});
 assert.equal(shapeForDisc({}),null);
 assert.equal(shapeForDisc({flight:{speed:null,turn:null,fade:null}}),null);
});

test('stability keeps its small Phase 1 cues on a measured mold',()=>{
 const specs=mold('Destroyer').specs;
 const flippy=shapeFromMeasurements({...specs,Height:'1.8'},{speed:12,turn:-3,fade:1});
 const beefy=shapeFromMeasurements({...specs,Height:'1.8'},{speed:12,turn:0,fade:4});
 assert.ok(beefy.domeHeight<flippy.domeHeight,'more stable reads flatter');
 assert.ok(beefy.partingLine>flippy.partingLine);
 assert.equal(beefy.rimWidth,flippy.rimWidth);assert.equal(beefy.diameter,flippy.diameter);
 assert.ok(flippy.domeHeight-beefy.domeHeight<=.06+1e-9,'the flatness cue stays inside PDGA rounding');
 // Unrated, the shape still comes from the rim alone.
 const unrated=shapeFromMeasurements(specs,null);
 assert.equal(unrated.sharpness,1);assert.ok(unrated.bevel>.5);
});
