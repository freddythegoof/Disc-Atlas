import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const runtime={};runtime.window=runtime;
vm.createContext(runtime);
for(const file of ['atlas-layout.js','atlas-groups.js'])vm.runInContext(fs.readFileSync('public/'+file,'utf8'),runtime);
const area=runtime.AtlasLayout.bounds(1000,800,false);
const items=[{id:'aaa',name:'Less popular',speed:9},{id:'zzz',name:'Destroyer',speed:9}];
const label={x:-100,y:37,w:200,h:32,radius:27};
const footprints=new Map(items.map(d=>[d.id,label]));
const featured=[{id:'zzz'}];
test('top grouping level has separate enter and exit thresholds',()=>{
 assert.equal(runtime.AtlasGroups.level(8.97,9),9);
 assert.equal(runtime.AtlasGroups.level(9,9),10);
 for(const z of [8.99,8.97,8.9,9])assert.equal(runtime.AtlasGroups.level(z,10),10,'Small top-end reversals retain the level');
 assert.equal(runtime.AtlasGroups.level(8.6,10),9,'A deliberate zoom out releases it');
 assert.equal(runtime.AtlasGroups.level(5,10),7,'Large changes do not walk stale levels');
});
function build(gap,level=0){
 const positions=new Map([['aaa',{x:(100+gap)/area.width,y:100/area.height}],['zzz',{x:100/area.width,y:100/area.height}]]);
 return {positions,result:runtime.AtlasGroups.build(items,positions,1000,800,level,false,footprints,featured)};
}
test('actual wide labels yield to popularity even beyond the old 155px cutoff',()=>{
 const {result}=build(180);
 assert.deepEqual(Array.from(result.groups,g=>[g.key,g.large]),[['zzz',true],['aaa',false]]);
});
test('zoom frees both labels without displacing either marker',()=>{
 const {positions,result}=build(130,3);
 assert.deepEqual(Array.from(result.groups,g=>g.large),[true,true]);
 for(const g of result.groups)assert.deepEqual(g.pos,positions.get(g.key));
 // Moving back between worker levels must immediately demote the contender.
 runtime.AtlasGroups.promote(result.groups,footprints,1,2);
 assert.deepEqual(Array.from(result.groups,g=>g.large),[true,false]);
});
test('vertical neighbors use their label height rather than a circular distance',()=>{
 const positions=new Map([['aaa',{x:100/area.width,y:230/area.height}],['zzz',{x:100/area.width,y:100/area.height}]]);
 const result=runtime.AtlasGroups.build(items,positions,1000,800,0,false,footprints,featured);
 assert.deepEqual(Array.from(result.groups,g=>g.large),[true,true]);
});

test('deep satellites get measured smaller markers, with honest bounded offsets',()=>{
 const groups=[{key:'p',px:0,py:0,members:['p']},{key:'s',px:80,py:0,members:['s']},
  {key:'blocked',px:0,py:0,members:['blocked']},{key:'stack',px:80,py:100,members:['stack','member']}];
 const full=new Map(groups.map(g=>[g.key,{x:-60,y:37,w:120,h:32,radius:27}]));
 const small=new Map(groups.map(g=>[g.key,{x:-25,y:18,w:50,h:19,radius:14}]));
 runtime.AtlasGroups.promote(groups,full,7,7,small);
 assert.equal(groups[1].large,false,'Satellite hierarchy remains smaller than primary');
 assert.equal(groups[1].satellite,true,'A fitting single becomes a proper marker');
 assert.equal(groups[1].labelVisible,true);
 assert.ok(Math.hypot(groups[1].markerOffset.x,groups[1].markerOffset.y)<=56,'Offsets stay local');
 if(groups[1].leader){
  const g=groups[1],mx=g.px+g.markerOffset.x,my=-g.py+g.markerOffset.y;
  assert.equal(runtime.AtlasGroups.segmentHitsBox(g.leader,{x:mx-14,y:my-14,w:28,h:28}),false,'Leader starts outside its own artwork');
  assert.deepEqual([g.leader.x2,g.leader.y2],[g.px,-g.py],'Vector ends at the true atlas coordinate');
 }
 assert.equal(groups[2].satellite,false,'A true position obstructed in every direction falls back to a dot');
 assert.deepEqual(Array.from(groups,g=>[g.px,g.py]),[[0,0],[80,0],[0,0],[80,100]],'Atlas coordinates never mutate');
 assert.equal(groups[3].satellite,false,'A satellite stack retains its badge');
 runtime.AtlasGroups.promote(groups,full,6.99,6.99);
 assert.equal(groups[1].satellite,false,'Below 7x returns to the shipped clickable dots');
 assert.equal(groups[1].markerOffset,null);
});

test('leader geometry rejects crossings, including collinear webs and label intersections',()=>{
 const segment={x1:0,y1:0,x2:40,y2:40};
 assert.equal(runtime.AtlasGroups.segmentHitsBox(segment,{x:15,y:15,w:10,h:10}),true);
 assert.equal(runtime.AtlasGroups.segmentHitsBox(segment,{x:15,y:30,w:3,h:3}),false);
 assert.equal(runtime.AtlasGroups.segmentsCross(segment,{x1:0,y1:40,x2:40,y2:0}),true);
 assert.equal(runtime.AtlasGroups.segmentsCross(segment,{x1:10,y1:10,x2:20,y2:20}),true);
 assert.equal(runtime.AtlasGroups.segmentsCross(segment,{x1:0,y1:10,x2:20,y2:30}),false);
});

test('worker structured-clone payload preserves measured footprints and priority',()=>{
 const {positions,result}=build(180);
 const worker={};worker.self=worker;
 vm.createContext(worker);
 worker.importScripts=(...files)=>files.forEach(file=>vm.runInContext(fs.readFileSync('public/'+file,'utf8'),worker));
 let reply;worker.postMessage=value=>{reply=structuredClone(value);};
 vm.runInContext(fs.readFileSync('public/atlas-groups-worker.js','utf8'),worker);
 worker.onmessage({data:structuredClone({revision:7,level:0,items,positions:[...positions],width:1000,height:800,immersive:false,footprints,featured})});
 assert.equal(reply.revision,7);
 assert.deepEqual(reply.groups,structuredClone(result.groups));
 // Reordering the shared ranking must also reach an already-created worker.
 worker.onmessage({data:structuredClone({revision:8,level:7,items,positions:[...positions],width:1000,height:800,immersive:false,footprints,featured:[{id:'aaa'}]})});
 assert.equal(reply.groups[0].key,'aaa');
});

test('deep zoom releases separated discs and absorbs inaccessible satellites',()=>{
 for(const level of [6,7]){
  const {positions,result}=build(20,level);
  assert.equal(result.groups.length,2,'80–100px neighbors remain distinct');
  for(const g of result.groups)assert.deepEqual(g.pos,positions.get(g.key));
  assert.equal(build(2,level).result.groups.length,1,'8–10px neighbors still stack');
 }
 assert.equal(build(60,0).result.groups.length,1,'Overview keeps its 65px radius');
});

test('deep zoom merges close pairs while preserving breathing room and honest leads',()=>{
 for(const level of [6,7]){
  const {positions,result}=build(4,level);
  assert.equal(result.groups.length,1,'16–20px neighbors share a stack');
  assert.deepEqual(result.groups[0].pos,positions.get('zzz'));
  assert.equal(build(10,level).result.groups.length,1,'A satellite beside a primary joins its accessible stack');
 }
});

test('capacity grows toward overview, retains all discs and caps deep stacks at three',()=>{
 const crowded=Array.from({length:100},(_,i)=>({id:String(i).padStart(3,'0'),name:`Disc ${i}`,speed:9}));
 const positions=new Map(crowded.map(d=>[d.id,{x:.5,y:.5}]));
 let previous=Infinity;
 for(let level=0;level<=10;level++){
  const {groups}=runtime.AtlasGroups.build(crowded,positions,1000,800,level,false);
  const largest=Math.max(...groups.map(g=>g.members.length));
  assert.ok(largest<=previous,'Capacity must not grow while zooming in');
  if(level===0)assert.equal(largest,100,'Overview remains uncapped');
  if(level===3)assert.ok(largest>3&&largest<100,'Intermediate zoom has intermediate capacity');
  if(level===5)assert.equal(largest,5,'At 3x the 06F curve permits four- and five-disc stacks');
  if(level>=6)assert.equal(largest,3);
  assert.equal(new Set(groups.flatMap(g=>g.members)).size,100,'No disc is dropped');
  previous=largest;
 }
});

test('deeper zoom releases a satellite once its screen distance exceeds 64px',()=>{
 const {result}=build(9,9); // 72px at 8x; a 200px label still makes this a satellite.
 assert.equal(result.groups.length,2,'Absorption must not grow with the camera');
 assert.equal(build(9,7).result.groups.length,1,'The same pair remains local at 5x');
});

test('satellite absorption preserves primary positions, caps stacks, and keeps overflow accessible',()=>{
 const discs=['a','b','c','d'].map(id=>({id,name:id,speed:9}));
 const points=[[100,100],[109,100],[91,100],[100,109]];
 const positions=new Map(discs.map((d,i)=>[d.id,{x:points[i][0]/area.width,y:points[i][1]/area.height}]));
 const labels=new Map(discs.map(d=>[d.id,label]));
 const {groups}=runtime.AtlasGroups.build(discs,positions,1000,800,7,false,labels,[{id:'a'}]);
 assert.equal(groups[0].key,'a');assert.equal(groups[0].members.length,3);
 assert.equal(groups.length,2,'A fourth disc remains separately reachable');
 assert.equal(new Set(groups.flatMap(g=>g.members)).size,4);
 assert.deepEqual(groups[0].pos,positions.get('a'));
 // Primaries with room for their labels must never be absorbed by this pass.
 const narrow=new Map(discs.map(d=>[d.id,{x:-5,y:12,w:10,h:10,radius:8}]));
 const separate=runtime.AtlasGroups.build(discs,positions,1000,800,7,false,narrow);
 assert.equal(separate.groups.length,4);
 assert.ok(separate.groups.every(g=>g.large));
});

test('shared featured IDs determine leads; unranked discs follow Directory alphabetical order',()=>{
 const discs=[{id:'a',name:'Destroyer',brand:'Other',speed:9},{id:'b',name:'Zulu',brand:'B',speed:9},
  {id:'c',name:'Alpha',brand:'Z',speed:9},{id:'d',name:'Alpha',brand:'A',speed:9}];
 const positions=new Map(discs.map((d,i)=>[d.id,{x:i*.2,y:.5}]));
 const ranking=[{id:'b'}];
 const result=runtime.AtlasGroups.build(discs,positions,1000,800,0,false,new Map(),ranking);
 assert.deepEqual(Array.from(result.groups,g=>g.key),['b','d','c','a']);
 const coincident=new Map(discs.map(d=>[d.id,{x:.5,y:.5}]));
 assert.equal(runtime.AtlasGroups.build(discs,coincident,1000,800,0,false,new Map(),ranking).groups[0].key,'b');
});

test('low zoom promotes only clean measured labels at true positions, without vectors',()=>{
 const groups=[{key:'p',px:0,py:0,members:['p']},{key:'clean',px:80,py:0,members:['clean']},
  {key:'blocked',px:45,py:-50,members:['blocked']}];
 const full=new Map(groups.map(g=>[g.key,{x:-60,y:37,w:120,h:32,radius:27}]));
 const minor=new Map(groups.map(g=>[g.key,{x:-20,y:18,w:40,h:16,radius:8}]));
 runtime.AtlasGroups.promote(groups,full,1,1,undefined,minor);
 assert.equal(groups[1].large,false);assert.equal(groups[1].minorLabel,true,'Clean label appears at fixed relative position');
 assert.equal(groups[2].minorLabel,false,'Contending label is suppressed');
 assert.ok(groups.every(g=>g.markerOffset===null&&g.leader===null),'No low-zoom nudging or vectors');
});
