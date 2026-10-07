import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Run the actual worker entry point and its real layout/grouping dependencies.
function worker(){
 const runtime={};runtime.self=runtime;
 vm.createContext(runtime);
 runtime.importScripts=(...files)=>files.forEach(file=>vm.runInContext(fs.readFileSync('public/'+file,'utf8'),runtime));
 runtime.postMessage=result=>runtime.result=result;
 vm.runInContext(fs.readFileSync('public/atlas-groups-worker.js','utf8'),runtime);
 return runtime;
}
const catalog=JSON.parse(fs.readFileSync('public/data.json','utf8')).discs;
const ids=['9554f962a394','b52c5cb1753a','a5ca585ab070'];
const items=catalog.filter(d=>ids.includes(d.id));

test('My Map worker preserves DD1/DD3 personal coordinates at every regroup level',()=>{
 const r=worker(),positions=r.AtlasLayout.positions(items,d=>d.id==='9554f962a394'?-10:0);
 for(const [width,height] of [[1056,640],[324,460]])for(const level of [0,4,10]){
  r.onmessage({data:{revision:1,level,items,positions:[...positions],width,height,immersive:false,personal:true,footprints:[],featured:[]}});
  assert.equal(r.result.revision,1);assert.equal(r.result.level,level);
  assert.ok(r.result.groups.length>0);
  for(const g of r.result.groups)assert.deepEqual(g.pos,positions.get(g.key),'Regrouping must not re-spread the personal lens');
 }
});

test('Atlas worker keeps adaptive spread when personal mode is absent or false',()=>{
 const r=worker(),positions=r.AtlasLayout.positions(items);
 for(const personal of [undefined,false]){
  const data={revision:2,level:10,items,positions:[...positions],width:1056,height:640,immersive:true,footprints:[],featured:[],personal};
  r.onmessage({data});
  const expected=r.AtlasLayout.adapt(items,positions,data.width,data.height,true);
  for(const g of r.result.groups)assert.deepEqual(g.pos,expected.get(g.key),'Atlas spread stays unchanged');
 }
});
