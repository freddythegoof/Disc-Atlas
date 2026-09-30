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
function build(gap,level=0){
 const positions=new Map([['aaa',{x:(100+gap)/area.width,y:100/area.height}],['zzz',{x:100/area.width,y:100/area.height}]]);
 return {positions,result:runtime.AtlasGroups.build(items,positions,1000,800,level,false,footprints)};
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
 const result=runtime.AtlasGroups.build(items,positions,1000,800,0,false,footprints);
 assert.deepEqual(Array.from(result.groups,g=>g.large),[true,true]);
});
test('worker structured-clone payload preserves measured footprints and priority',()=>{
 const {positions,result}=build(180);
 const worker={};worker.self=worker;
 vm.createContext(worker);
 worker.importScripts=(...files)=>files.forEach(file=>vm.runInContext(fs.readFileSync('public/'+file,'utf8'),worker));
 let reply;worker.postMessage=value=>{reply=structuredClone(value);};
 vm.runInContext(fs.readFileSync('public/atlas-groups-worker.js','utf8'),worker);
 worker.onmessage({data:structuredClone({revision:7,level:0,items,positions:[...positions],width:1000,height:800,immersive:false,footprints})});
 assert.equal(reply.revision,7);
 assert.deepEqual(reply.groups,structuredClone(result.groups));
});
