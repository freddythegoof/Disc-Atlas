import test from 'node:test';
import assert from 'node:assert/strict';
import {RACK_CAPACITY,RACK_WIDTH,RACK_GAP,rackCount,rackSlot,rackX,rowWidth,restHeight,rackOrder,CLASS_ORDER} from '../public/collection3d/rack-layout.mjs';
import {plots,graveColumns,epitaph,lifespan,restingPlace,hash,PLOT_WIDTH,PLOT_DEPTH,MAX_LEAN,MAX_TURN} from '../public/collection3d/graveyard-layout.mjs';

test('a rack holds 72 discs and a full rack starts another, with no limit',()=>{
 assert.equal(RACK_CAPACITY,72);
 assert.equal(rackCount(0),1,'Storage always shows one rack, even empty');
 assert.equal(rackCount(1),1);assert.equal(rackCount(72),1);
 assert.equal(rackCount(73),2);assert.equal(rackCount(80),2);assert.equal(rackCount(144),2);
 assert.equal(rackCount(145),3);assert.equal(rackCount(500),7);assert.equal(rackCount(5000),70);
});

test('slots fill left to right, top tier first, eight to a bay',()=>{
 assert.deepEqual(rackSlot(0),{rack:0,slot:0,tier:0,bay:0});
 assert.deepEqual(rackSlot(7),{rack:0,slot:7,tier:0,bay:0});
 assert.deepEqual(rackSlot(8),{rack:0,slot:8,tier:0,bay:1});
 assert.deepEqual(rackSlot(23),{rack:0,slot:23,tier:0,bay:2});
 assert.deepEqual(rackSlot(24),{rack:0,slot:24,tier:1,bay:0});
 assert.deepEqual(rackSlot(71),{rack:0,slot:71,tier:2,bay:2});
 assert.deepEqual(rackSlot(72),{rack:1,slot:0,tier:0,bay:0});
 assert.deepEqual(rackSlot(79),{rack:1,slot:7,tier:0,bay:0});
 assert.throws(()=>rackSlot(-1),RangeError);assert.throws(()=>rackSlot(1.5),RangeError);
});

test('racks stand side by side, centred on the origin, without overlapping',()=>{
 assert.equal(rackX(0,1),0);
 assert.ok(Math.abs(rackX(0,2)+rackX(1,2))<1e-12);
 for(const n of [2,3,7])for(let i=1;i<n;i++)assert.ok(Math.abs(rackX(i,n)-rackX(i-1,n)-(RACK_WIDTH+RACK_GAP))<1e-12);
 assert.ok(Math.abs(rowWidth(3)-(3*RACK_WIDTH+2*RACK_GAP))<1e-12);
 assert.ok(Math.abs(rackX(2,3)+RACK_WIDTH/2-rowWidth(3)/2)<1e-12,'The last rack ends at the row edge');
});

test('each disc stands on its shelf by its own radius, real-world metres',()=>{
 // Slot 0's rest node in the GLB is at y = .821 (top shelf at .710 + .111).
 const putter=restHeight(.821,.2175/2),driver=restHeight(.821,.211/2);
 assert.ok(Math.abs(putter-.10875-.710-.002)<1e-9);
 assert.ok(putter>driver,'A wider putter stands taller than a driver');
 assert.ok(driver-.211/2>=.710,'No rim sinks into the shelf');
});

test('storage order puts drivers on top and putters at the bottom, keeping the bag order within a class',()=>{
 const classOf=i=>i.cls,compare=(a,b)=>a.order-b.order;
 const items=[{id:'p',cls:'putter',order:1},{id:'d2',cls:'distance',order:2},{id:'u',cls:'unknown',order:0},{id:'m',cls:'mid',order:0},{id:'d1',cls:'distance',order:1},{id:'f',cls:'fairway',order:3}];
 assert.deepEqual(rackOrder(items,{classOf,compare}).map(i=>i.id),['d1','d2','f','m','p','u']);
 assert.deepEqual(CLASS_ORDER,['distance','fairway','mid','putter','unknown']);
 assert.equal(items[0].id,'p','rackOrder leaves its input alone');
});

test('graveyard plots: centred rows, newest first, the same lean every visit',()=>{
 const ids=['a','b','c','d','e','f','g'];
 const spots=plots(ids,3);
 assert.deepEqual(spots.map(s=>s.id),ids);
 assert.deepEqual(spots.map(s=>s.row),[0,0,0,1,1,1,2]);
 assert.ok(spots.every(s=>s.rows===3));
 assert.ok(spots.every(s=>s.z===-s.row*PLOT_DEPTH),'Rows step back from the viewer');
 const front=spots.filter(s=>s.row===0).map(s=>s.x),mid=(front[0]+front[2])/2;
 assert.ok(Math.abs(mid)<.04,'The front row is centred');
 assert.ok(front[1]-front[0]>PLOT_WIDTH*.85,'Stones never crowd one another');
 assert.ok(Math.abs(spots[6].x)<.04,'A lone back stone is centred');
 assert.deepEqual(plots(ids,3),spots,'Deterministic');
 assert.ok(spots.every(s=>Math.abs(s.lean)<=MAX_LEAN&&Math.abs(s.turn)<=MAX_TURN&&[0,1,2].includes(s.variant)));
 assert.equal(graveColumns(360,10),3);assert.equal(graveColumns(700,10),4);assert.equal(graveColumns(1100,10),5);assert.equal(graveColumns(1100,2),2);assert.equal(graveColumns(1100,0),1);
});

test('epitaphs are stable per disc, kind, and read the room',()=>{
 const disc={id:'disc-1',lostStory:'',lostCourse:'Maple Hill'};
 assert.equal(epitaph(disc,'putter'),epitaph({...disc},'putter'));
 assert.equal(typeof epitaph(disc,'unknown'),'string');
 const wet=epitaph({id:'x',lostStory:'One last skip into the pond.'},'distance');
 assert.match(wet,/swim|pond|Skipped/);
 const woods=epitaph({id:'y',lostStory:'Straight into the trees on 7.'},'mid');
 assert.match(woods,/trees|Branched/);
 const seen=new Set();for(let i=0;i<60;i++)seen.add(epitaph({id:'d'+i},'distance'));
 assert.ok(seen.size>=5,'Discs get different epitaphs');
 for(const line of seen)assert.ok(line.length<=60,`Short enough to engrave: ${line}`);
 assert.notEqual(hash('a'),hash('b'));
});

test('dates and resting place read like a headstone',()=>{
 assert.equal(lifespan({lostDate:'2026-10-08',added_at:'2025-03-02T10:00:00.000Z'}),'Mar 2025 – Oct 8, 2026');
 assert.equal(lifespan({lostDate:'2026-10-08'}),'Oct 8, 2026','Without an added date, just the day it went');
 assert.equal(lifespan({lostDate:'2026-10-08',added_at:'2027-01-01T00:00:00Z'}),'Oct 8, 2026','A clock skew never shows a backwards lifespan');
 assert.equal(restingPlace({lostHole:8,lostCourse:'Maple Hill'}),'Hole 8 · Maple Hill');
 assert.equal(restingPlace({lostHole:null,lostCourse:'Maple Hill'}),'Maple Hill');
 assert.equal(restingPlace({lostHole:3,lostCourse:null}),'Hole 3');
 assert.equal(restingPlace({}),'');
});
