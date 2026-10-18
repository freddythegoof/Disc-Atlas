// Halo plastics (docs/halo-plastic.md): who is one (per copy, by plastic, never per mold), where the band
// colour comes from (the copy's photo only), and that Halo never touches overmold classification. The browser
// half is tests/halo-plastic-browser.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {HALO_PLASTICS,isHalo,haloBand} from '../public/disc3d/halo.mjs';
import {isOvermold,bagRimColor} from '../public/disc3d/overmold.mjs';
import {shapeForDisc,shapeFrame,overmoldProfile,discProfile} from '../public/disc3d/shape.mjs';

const plastics=JSON.parse(fs.readFileSync(new URL('../source-data/bag-plastics.json',import.meta.url)));
const {discs}=JSON.parse(fs.readFileSync(new URL('../public/data.json',import.meta.url)));

test('the Halo list is exactly the Halo options the bag editor offers',()=>{
 const offered=new Set(Object.values(plastics.brands).flatMap(b=>b.options).filter(o=>/\bhalo\b/i.test(o)));
 assert.deepEqual([...offered].sort(),[...HALO_PLASTICS].sort());
 for(const name of offered)assert.ok(isHalo(name),name);
});

test('Halo is the plastic name, not a word in it, and not a mold',()=>{
 for(const name of ['Halo Star','halo star',' Halo  Star ','Halo S-Blend'])assert.ok(isHalo(name),name);
 for(const name of ['Star','Champion','Halo','Star Halo','Halo Champion','',null,undefined,42])assert.equal(isHalo(name),false,String(name));
 // Latitude 64's Halo is a mold (a distance driver), and no catalog record is a Halo edition.
 const mold=discs.find(d=>d.manufacturer==='Latitude 64'&&d.name==='Halo');
 assert.ok(mold);assert.equal(isOvermold({manufacturer:mold.manufacturer,record:mold.name}),false);
 assert.equal(discs.filter(d=>isHalo(d.plastic)).length,0);
});

test('the band comes only from a Halo copy\'s own photo: no photo, no band, no default',()=>{
 const copy={plastic:'Halo Star',texture_key:'k.webp',photo_rim_color:'#E9C8F7'};
 assert.equal(haloBand(copy),'#e9c8f7');
 assert.equal(haloBand({...copy,texture_key:null}),null,'a removed photo shows no band');
 assert.equal(haloBand({...copy,photo_rim_color:null}),null,'an unsampled photo shows no band');
 assert.equal(haloBand({...copy,plastic:'Star'}),null,'a stale sample after a plastic change is ignored');
 assert.equal(haloBand({...copy,photo_rim_color:'purple'}),null);
 assert.equal(haloBand({plastic:'Halo Star'}),null);
 assert.equal(haloBand(null),null);
});

test('Halo never changes overmold classification or the overmold rim resolution',()=>{
 const destroyer=discs.find(d=>d.manufacturer==='Innova Champion Discs'&&d.name==='Destroyer');
 const pixel=discs.find(d=>d.manufacturer==='Axiom Discs'&&d.name==='Pixel');
 assert.equal(isOvermold({manufacturer:destroyer.manufacturer,record:destroyer.name}),false);
 assert.equal(isOvermold({manufacturer:pixel.manufacturer,record:pixel.name}),true);
 // bagRimColor is the overmold's resolution and stays exactly as it was for any copy.
 const item={plastic:'Halo Star',texture_key:'k.webp',photo_rim_color:'#123456',rim_color:null};
 assert.equal(bagRimColor(item),'#123456');assert.equal(bagRimColor({...item,texture_key:null},'#ffffff'),'#ffffff');
});

test('the band splits at the rim seam, R − PDGA rim width: the same profile, only marked',()=>{
 for(const name of ['Destroyer','Wraith','Aero']){
  const d=discs.find(d=>d.manufacturer==='Innova Champion Discs'&&d.name===name);
  const {shape}=shapeForDisc({model:d.model3d||null,specs:d.specs||null,flight:{speed:d.speed,turn:d.turn,fade:d.fade}});
  // mesh.mjs lathes overmoldProfile for any split (an overmold or a Halo band).
  const {R,Ri,Rs,w}=shapeFrame(shape),split=overmoldProfile(shape),plain=discProfile(shape);
  assert.ok(Math.abs(split.seamRadius-(R-w))<1e-9,`${name}: band from ${split.seamRadius}`);
  assert.ok(Ri<Rs,`${name}: the band begins inside the shoulder, so the photo meets it`);
  // The split profile is the plain one with at most the seam point added.
  assert.ok(split.points.length-plain.length<=1);
  for(const p of plain)assert.ok(split.points.some(q=>q.x===p.x&&q.y===p.y));
 }
});
