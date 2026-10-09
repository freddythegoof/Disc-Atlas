// The main Atlas's discs at depth (AtlasGroups.discScale): small at 1x, full size at the 9x maximum,
// smooth in between, and never larger than the room layout keeps for them (artRoom). The browser
// suite (tests/atlas-depth-browser.mjs) checks the real map: sizes, names, themes and screenshots.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const runtime={};runtime.globalThis=runtime;
vm.createContext(runtime);
vm.runInContext(fs.readFileSync('public/atlas-groups.js','utf8'),runtime);
const {AtlasGroups}=runtime,D=AtlasGroups.DISC_DEPTH;
// Every zoom the camera can reach, finely.
const ZOOMS=Array.from({length:8001},(_,i)=>1+i/1000);
const scale=z=>AtlasGroups.discScale(z);

test('discs are small and distant at 1x and full size at the 9x maximum',()=>{
 assert.ok(Math.abs(scale(1)-D.far)<1e-12,`1x draws ${scale(1)}`);
 assert.ok(Math.abs(scale(9)-D.near)<1e-12,`9x draws ${scale(9)}`);
 assert.equal(D.max,9);
 // 76px art: about 55px at 1x, about 94px at 9x.
 assert.ok(Math.abs(76*scale(1)-54.7)<.1&&Math.abs(76*scale(9)-94.2)<.1);
});

test('size grows smoothly and continuously with zoom, never stepped',()=>{
 let previous=scale(ZOOMS[0]),step=Infinity,maxStep=0;
 for(const z of ZOOMS.slice(1)){
  const s=scale(z),delta=s-previous;
  assert.ok(delta>0,`size does not grow at ${z}x`);
  // Decelerating, like an approach: each step is no larger than the one before (no kink, no jump).
  assert.ok(delta<=step+1e-12,`size accelerates at ${z}x`);
  step=delta;maxStep=Math.max(maxStep,delta);previous=s;
 }
 // At most 0.035% of the art per 0.001x of zoom: under 0.03px of 76px art.
 assert.ok(maxStep<3.5e-4,`largest step ${maxStep}`);
});

test('a disc never draws larger than the room layout keeps for it',()=>{
 // Past the 9x maximum too (camera probes go beyond it): full size holds.
 for(const z of [...ZOOMS,9.5,10,12])assert.ok(scale(z)<=AtlasGroups.artRoom(z),`${z}x draws ${scale(z)}, room ${AtlasGroups.artRoom(z)}`);
 for(const z of [9.5,10,12])assert.equal(scale(z),scale(9));
});

test('layout keeps exactly the room it always has',()=>{
 for(const z of ZOOMS)assert.equal(AtlasGroups.artRoom(z),1+.08*(Math.min(4,z)-1));
});

test('the same zoom always draws the same size',()=>{
 for(const z of [1,1.37,2.8,4,6.35,9])assert.equal(scale(z),scale(z));
 assert.equal(JSON.stringify(ZOOMS.map(scale)),JSON.stringify(ZOOMS.map(scale)));
});
