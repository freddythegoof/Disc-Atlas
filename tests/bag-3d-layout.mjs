import assert from 'node:assert/strict';
import {test} from 'node:test';
import {bagLayout,depthOrder,DISC,MAIN,PUTTER,GOTO,TOP,FRONT} from '../public/bag3d/bag-layout.mjs';
import {bagSlots} from '../public/bag-values.js';
import models from '../source-data/bag-models.json' with {type:'json'};

const disc=(id,color='#ed7868')=>({id,color});
const filled=placements=>placements.filter(p=>!p.empty);

test('every bag model fits its main and putter capacity in the 3D pockets', () => {
 for(const model of models.models){
  const main=(model.main_capacity ?? model.capacity)+(model.extra_capacity ?? 0),putter=model.putter_capacity ?? 0;
  const {placements,clipped}=bagLayout({main:Array(main).fill(null),putter:Array(putter).fill(null),goTo:[null]});
  assert.equal(placements.filter(p=>p.pocket==='main').length,main,model.name);
  assert.equal(placements.filter(p=>p.pocket==='putter').length,putter,model.name);
  assert.deepEqual(clipped,{main:0,putter:0,goTo:0},model.name);
 }
});

test('main slots stay inside the compartment, left to right, without touching rims', () => {
 for(const count of [1,12,18,26,48]){
  const mains=bagLayout({main:Array.from({length:count},(_,i)=>disc('m'+i))}).placements;
  assert.deepEqual(mains.map(p=>p.order),[...Array(count).keys()]);
  for(const [i,p] of mains.entries()){
   const half=DISC.thickness*p.scale[0]/2;
   assert.ok(p.position[0]-half>=MAIN.xMin-1e-9 && p.position[0]+half<=MAIN.xMax+1e-9,`slot ${i}/${count} inside the opening`);
   if(i)assert.ok(p.position[0]-mains[i-1].position[0]>DISC.thickness*p.scale[0],`slot ${i}/${count} clears its neighbor`);
  }
 }
});

test('putters ride in the top pocket; go-to sits in the front pocket above main', () => {
 const {placements}=bagLayout({main:[disc('m')],putter:[disc('p'),disc('p2'),null],goTo:[disc('g')]});
 const by=id=>placements.find(p=>p.id===id);
 assert.equal(by('g').pocket,'goTo');assert.equal(by('p').pocket,'putter');
 assert.equal(PUTTER.y,TOP.y);assert.equal(GOTO.y,FRONT.y);
 assert.ok(by('p').position[1]>by('g').position[1] && by('g').position[1]>by('m').position[1],'putters (top) > go-to (front) > main');
 assert.ok(by('g').position[2]>by('p').position[2] && by('g').position[2]>by('m').position[2],'go-to pocket is the front pocket');
 // Pocketed discs face forward; main discs stand edge-on.
 assert.equal(by('p').rotation[1],-Math.PI/2);assert.equal(by('g').rotation[1],-Math.PI/2);assert.equal(by('m').rotation[1],0);
 // Back putters rise and fan out so each rim shows above the disc in front.
 assert.ok(by('p2').position[1]>by('p').position[1] && by('p2').position[0]!==by('p').position[0]);
 const zs=placements.filter(p=>p.pocket==='putter').map(p=>p.position[2]);
 assert.ok(Math.abs((Math.max(...zs)+Math.min(...zs))/2-TOP.center)<1e-9,'putter stack centered in the top pocket');
 assert.equal(placements.find(p=>p.pocket==='putter' && p.empty).key,'putter-empty-2');
});

test('empty go-to is a single placeholder; several go-to copies share the front pocket', () => {
 assert.deepEqual(bagLayout({goTo:[null]}).placements.map(p=>[p.pocket,p.empty]),[['goTo',true]]);
 const tops=bagLayout({goTo:[disc('a'),disc('b'),disc('c')]}).placements;
 assert.equal(new Set(tops.map(p=>p.position[2])).size,3,'copies stack front to back');
 const zs=tops.map(p=>p.position[2]);
 assert.ok(Math.max(...zs)===FRONT.front && Math.min(...zs)>=FRONT.front-FRONT.span-1e-9,'stack runs back from the front pocket face');
 assert.deepEqual(bagLayout({goTo:[null]}).placements[0].position,[0,FRONT.y,FRONT.front],'empty slot outline sits in the front pocket');
 assert.ok(tops.every(p=>Math.abs(p.position[0])<=GOTO.maxX));
});

test('each disc appears once and keeps its own color; keys are stable ids', () => {
 const rows=[{id:'a',mold_id:'x',pocket:'main',in_bag:true,color:'#111111'},{id:'b',mold_id:'x',pocket:'putter',in_bag:true,color:'#222222'},{id:'c',mold_id:'x',pocket:'goto',in_bag:true,color:'#333333'},{id:'d',mold_id:'x',pocket:'main',in_bag:false,color:'#444444'}];
 const slots=bagSlots(rows,{main_capacity:4,putter_capacity:2},()=>({speed:5}));
 const {placements}=bagLayout({main:slots.main,putter:slots.putter,goTo:slots.goto});
 const discs=filled(placements);
 assert.deepEqual(discs.map(p=>[p.id,p.pocket,p.color]).sort(),[['a','main','#111111'],['b','putter','#222222'],['c','goTo','#333333']]);
 assert.equal(new Set(placements.map(p=>p.key)).size,placements.length,'keys are unique');
 assert.equal(placements.filter(p=>p.empty).length,3+1,'three empty main slots and one empty putter slot');
});

test('slots beyond the illustrated maximum are reported, not drawn', () => {
 const {placements,clipped}=bagLayout({main:[...Array.from({length:50},(_,i)=>disc('m'+i)),null],putter:Array.from({length:9},(_,i)=>disc('p'+i))});
 assert.equal(placements.filter(p=>p.pocket==='main').length,MAIN.maxSlots);assert.equal(clipped.main,2);
 assert.equal(placements.filter(p=>p.pocket==='putter').length,PUTTER.maxSlots);assert.equal(clipped.putter,1);
});

test('hit order puts front discs last so they win where pockets overlap', () => {
 const order=depthOrder(bagLayout({main:[disc('m')],putter:[disc('p0'),disc('p1')],goTo:[disc('g')]}).placements).map(p=>p.key);
 assert.deepEqual(order,['m','p1','p0','g']);
});

test('lift poses come forward, toward the viewer', () => {
 for(const p of bagLayout({main:[disc('m'),null],putter:[disc('p')],goTo:[disc('g')]}).placements)assert.ok(p.lift[2]>p.position[2],p.key);
});
