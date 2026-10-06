import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {COPY_BIAS_SHIFT,moldShifts,personalPositions} from '../public/personal-lens.js';
const context={window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('public/atlas-layout.js','utf8'),context);
const layout=context.window.AtlasLayout;
const molds=[{id:'a',speed:12,turn:-1,fade:3},{id:'b',speed:5,turn:0,fade:1},{id:'c',speed:2,turn:0,fade:5},{id:'d',speed:null}];

test('no stability notes: every bagged disc sits exactly at its consensus position',()=>{
 const copies=molds.map(d=>({mold_id:d.id,stability_bias:null})),shifts=moldShifts(copies);
 assert.deepEqual([...shifts.values()],[0,0,0,0]);
 assert.deepEqual(personalPositions(layout,molds,shifts),layout.positions(molds));
});

test('a More stable copy moves right, a Less stable copy moves left, speed never changes',()=>{
 const shifts=moldShifts([{mold_id:'a',stability_bias:'more_stable'},{mold_id:'b',stability_bias:'less_stable'}]);
 assert.equal(shifts.get('a'),COPY_BIAS_SHIFT.more_stable);assert.equal(shifts.get('b'),COPY_BIAS_SHIFT.less_stable);
 const shared=layout.positions(molds),mine=personalPositions(layout,molds,shifts);
 assert.ok(Math.abs(mine.get('a').x-shared.get('a').x-COPY_BIAS_SHIFT.more_stable/100)<1e-9);
 assert.ok(Math.abs(mine.get('b').x-shared.get('b').x-COPY_BIAS_SHIFT.less_stable/100)<1e-9);
 for(const id of ['a','b'])assert.equal(mine.get(id).y,shared.get(id).y);
 assert.deepEqual(mine.get('c'),shared.get('c'));assert.equal(mine.has('d'),false,'Unrated molds stay off the map');
});

test('copies of one mold average, and the index stays inside 0–100',()=>{
 const shifts=moldShifts([{mold_id:'a',stability_bias:'more_stable'},{mold_id:'a',stability_bias:'less_stable'},{mold_id:'c',stability_bias:'more_stable'},{mold_id:'c',stability_bias:null}]);
 assert.equal(shifts.get('a'),0);assert.equal(shifts.get('c'),COPY_BIAS_SHIFT.more_stable/2);
 // c is already at index 100 (0 + 5 fade): its personal shift is clamped like the shared index.
 assert.deepEqual(personalPositions(layout,molds,shifts).get('c'),layout.positions(molds).get('c'));
});

test('a player-wide bias is the extension point and adds to every disc',()=>{
 const shifts=moldShifts([{mold_id:'a',stability_bias:'less_stable'},{mold_id:'b',stability_bias:null}],{playerBias:4});
 assert.equal(shifts.get('a'),COPY_BIAS_SHIFT.less_stable+4);assert.equal(shifts.get('b'),4);
 assert.equal(moldShifts([{mold_id:'a',stability_bias:'mystery'}]).get('a'),0,'Unknown notes are ignored');
});
