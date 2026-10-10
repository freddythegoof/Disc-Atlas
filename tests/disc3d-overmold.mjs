// Plan 12 overmold discs: who is one (per disc, never per brand), where the rim meets the flight plate, and
// the two-colour API. The browser half is in tests/disc3d-browser.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {discProfile,overmoldProfile,shapeForDisc,shapeFrame,topHeight} from '../public/disc3d/shape.mjs';
import {OVERMOLD_DISCS,isOvermold,overmoldColors,parseColor} from '../public/disc3d/overmold.mjs';

const {discs}=JSON.parse(fs.readFileSync(new URL('../public/data.json',import.meta.url)));
const find=(manufacturer,name)=>discs.find(d=>d.manufacturer===manufacturer&&d.name===name);
const flagged=d=>isOvermold({manufacturer:d.manufacturer,record:d.name});

test('every listed overmold is a real catalog record',()=>{
 for(const [m,names] of Object.entries(OVERMOLD_DISCS))for(const n of names)assert.ok(find(m,n),`${m} | ${n} is in data.json`);
});

test('MVP and Axiom GYRO discs and the Innova Atlas are overmolds',()=>{
 for(const [m,n] of [['MVP Disc Sports','Volt'],['MVP Disc Sports','Ion'],['Axiom Discs','Envy'],['Axiom Discs','Crave'],['Innova Champion Discs','Atlas']])
  assert.ok(flagged(find(m,n)),`${m} ${n}`);
});

test('detection is per disc, not per brand',()=>{
 // Streamline is MVP/Axiom's sister brand but single-mold.
 const streamline=discs.filter(d=>d.manufacturer==='Streamline Discs');
 assert.ok(streamline.length>10);
 for(const d of streamline)assert.equal(flagged(d),false,'Streamline '+d.name);
 // The Atlas is an Innova overmold; the Destroyer and Discraft's Buzzz are not.
 assert.equal(flagged(find('Innova Champion Discs','Destroyer')),false);
 assert.equal(flagged(find('Discraft','Buzzz')),false);
 // A name alone, or the right name under another manufacturer, is not enough.
 assert.equal(isOvermold({record:'Atlas'}),false);
 assert.equal(isOvermold({manufacturer:'Discraft',record:'Envy'}),false);
 const innova=discs.filter(d=>d.manufacturer==='Innova Champion Discs');
 assert.deepEqual(innova.filter(flagged).map(d=>d.name).sort(),['Atlas','Avatar','Nova']);
});

test("a record's own overmold flag wins over the list",()=>{
 assert.equal(isOvermold({overmold:true,manufacturer:'Discraft',record:'Buzzz'}),true);
 assert.equal(isOvermold({overmold:false,manufacturer:'Axiom Discs',record:'Envy'}),false);
});

test('the rim/plate seam sits at the measured rim width',()=>{
 for(const [m,n] of [['Axiom Discs','Envy'],['MVP Disc Sports','Volt'],['Innova Champion Discs','Atlas'],['Axiom Discs','Tantrum']]){
  const d=find(m,n),{shape}=shapeForDisc({specs:d.specs,flight:d});
  const f=shapeFrame(shape),split=overmoldProfile(shape),pts=split.points,[from,to]=split.rim;
  const R=Number(d.specs.Diameter)/2,w=Number(d.specs['Rim width']);
  assert.ok(Math.abs(split.seamRadius-(R-w))<1e-9,`${n}: seam at ${split.seamRadius} = ${R} − ${w}`);
  // Top seam: the rim's last profile point is on the top surface at R − rim width.
  assert.equal(pts[to].x,R-w);assert.ok(Math.abs(pts[to].y-topHeight(shape,R-w))<1e-12);
  // Underside seam: where the plate meets the inner rim wall, just inside R − rim width.
  assert.ok(pts[from].x<R-w&&pts[from].x>R-w-.1,`${n}: underside seam at ${pts[from].x}`);
  // The rim holds the wall, foot, wing, nose and shoulder; the plate is everything inside the seam.
  const rimPts=pts.slice(from,to+1),platePts=[...pts.slice(0,from+1),...pts.slice(to)];
  assert.ok(rimPts.some(p=>p.x===f.R),'the nose is on the rim');
  assert.ok(rimPts.every(p=>p.x>=pts[from].x-1e-9),'no rim point inside the seam');
  assert.ok(platePts.every(p=>p.x<=R-w+1e-9),'no plate point outside the seam');
  // Otherwise the same profile: one added point on top.
  const plain=discProfile(shape);
  assert.equal(pts.length,plain.length+1);
  assert.deepEqual([...pts.slice(0,to),...pts.slice(to+1)],plain);
 }
});

test('color API: defaults from the disc colour, optional rim/plate overrides',()=>{
 const base='#d94f2b',d=overmoldColors(base);
 assert.equal(d.plate,'#d94f2b','the plate keeps the disc colour');
 assert.notEqual(d.rim,d.plate);
 const lum=hex=>{const [r,g,b]=parseColor(hex);return .2126*r+.7152*g+.0722*b;};
 assert.ok(lum(d.rim)<lum(d.plate)*.7,'the default rim is darker');
 // A very dark disc gets a lighter rim, so the seam still shows.
 const dark=overmoldColors('#141414');assert.ok(lum(dark.rim)>lum(dark.plate)+30);
 // rgb() input, as the panel's resolved theme colours arrive.
 assert.deepEqual(overmoldColors('rgb(217, 79, 43)'),d);
 // Overrides: both, either one, or unreadable values that fall back.
 assert.deepEqual(overmoldColors(base,{rim:'#000000',plate:'#ffffff'}),{rim:'#000000',plate:'#ffffff'});
 assert.deepEqual(overmoldColors(base,{rim:'#123456'}),{rim:'#123456',plate:'#d94f2b'});
 assert.equal(overmoldColors(base,{plate:'#3366cc'}).plate,'#3366cc');
 assert.notEqual(overmoldColors(base,{plate:'#3366cc'}).rim,d.rim,'a new plate colour moves the default rim with it');
 assert.deepEqual(overmoldColors(base,{rim:'not a colour',plate:null}),d);
 assert.deepEqual(overmoldColors(undefined),overmoldColors('#8a8f98'));
});
