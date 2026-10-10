import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {DEMO_BAG,DEMO_DISCS} from '../public/bag-demo.js';
import {validateDiscDetails,validateBagSettings,bagSlots,bagClass} from '../public/bag-values.js';
import catalog from '../public/data.json' with {type:'json'};

const plastics=JSON.parse(fs.readFileSync('source-data/bag-plastics.json','utf8'));
const models=JSON.parse(fs.readFileSync('source-data/bag-models.json','utf8'));
const byId=new Map(catalog.discs.map(d=>[d.id,d]));

test('demo bag is a valid, curated bag the server itself would accept',()=>{
 assert.deepEqual(validateBagSettings(DEMO_BAG,models),DEMO_BAG);
 for(const disc of DEMO_DISCS){
  const d=byId.get(disc.mold_id);
  assert.ok(d,`${disc.id}: mold ${disc.mold_id} is in the catalog`);
  assert.ok(d.speed!=null,`${disc.id}: ${d.name} has flight ratings`);
  const {mold_id,plastic,wear,weight_g,notes,color,in_bag,pocket,stability_bias}=disc;
  assert.deepEqual(validateDiscDetails(disc,d,plastics),{mold_id,plastic,wear,weight_g,notes,color,rim_color:null,in_bag,pocket,stability_bias,status:'active',lostDate:null,lostCourse:null,lostHole:null,lostStory:null});
 }
});

test('demo bag holds 15-20 discs across all four types and fits its pockets',()=>{
 const bagged=DEMO_DISCS.filter(i=>i.in_bag);
 assert.ok(DEMO_DISCS.length>=15 && DEMO_DISCS.length<=20);
 assert.deepEqual([...new Set(bagged.map(i=>bagClass(byId.get(i.mold_id))))].sort(),['distance','fairway','mid','putter']);
 const slots=bagSlots(DEMO_DISCS,DEMO_BAG,id=>byId.get(id));
 assert.equal(slots.overflow.length,0,'Every bagged disc has an illustrated slot');
 assert.ok(slots.goto[0].item,'The go-to slot is filled');
 assert.equal(slots.putter.filter(s=>s.item).length,DEMO_BAG.putter_capacity,'The putter pocket is full');
 assert.ok(DEMO_DISCS.some(i=>!i.in_bag),'Storage has a sample too');
});

test('demo bag is static, read-only sample data with no account fields',()=>{
 assert.ok(Object.isFrozen(DEMO_BAG) && Object.isFrozen(DEMO_DISCS) && DEMO_DISCS.every(Object.isFrozen));
 assert.equal(new Set(DEMO_DISCS.map(i=>i.id)).size,DEMO_DISCS.length);
 for(const disc of DEMO_DISCS){
  assert.match(disc.id,/^demo-\d\d$/);
  assert.deepEqual(Object.keys(disc).sort(),['added_at','color','id','in_bag','mold_id','notes','plastic','pocket','sort_order','stability_bias','wear','weight_g']);
 }
});
