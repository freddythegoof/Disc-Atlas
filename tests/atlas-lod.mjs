// The atlas art's level of detail choice (public/disc3d/lod.mjs): the thresholds, the hysteresis that
// keeps a size hovering at one from flipping a disc's level, and the hold while the camera is zooming.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LODS,LOD_MARGIN,HOLD_LIMIT,lodFor} from '../public/disc3d/lod.mjs';

const {low,mid}=LODS;
// Walks a list of sizes the way a draw loop does, each frame passing the level the last chose.
const walk=(sizes,{start,hold=false}={})=>{let lod=start;return sizes.map(size=>lod=lodFor(size,lod,hold));};
const flips=levels=>levels.filter((lod,i)=>i&&lod!==levels[i-1]).length;

test('without a previous level the thresholds are the plain ones',()=>{
 assert.equal(lodFor(12),'low');assert.equal(lodFor(low.css),'low');assert.equal(lodFor(low.css+.1),'mid');
 assert.equal(lodFor(mid.css),'mid');assert.equal(lodFor(mid.css+.1),'full');assert.equal(lodFor(94),'full');
});

test('a level holds past a threshold by the margin, in both directions',()=>{
 assert.equal(lodFor(low.css*(1+LOD_MARGIN)-.01,'low'),'low');
 assert.equal(lodFor(low.css*(1+LOD_MARGIN)+.01,'low'),'mid');
 assert.equal(lodFor(low.css*(1-LOD_MARGIN)+.01,'mid'),'mid');
 assert.equal(lodFor(low.css*(1-LOD_MARGIN)-.01,'mid'),'low');
 assert.equal(lodFor(mid.css*(1+LOD_MARGIN)-.01,'mid'),'mid');
 assert.equal(lodFor(mid.css*(1+LOD_MARGIN)+.01,'mid'),'full');
 assert.equal(lodFor(mid.css*(1-LOD_MARGIN)+.01,'full'),'full');
 assert.equal(lodFor(mid.css*(1-LOD_MARGIN)-.01,'full'),'mid');
});

test('crossing a threshold going up does not flip back a pixel lower',()=>{
 // Up past 24, then back to 23, 22 ...: low->mid on the way up stays mid until clearly below.
 const up=walk([20,23,24,25,26,28.3,28.4],{start:'low'});
 assert.deepEqual(up,['low','low','low','low','low','low','mid']);
 const back=walk([29,28,25,24,23,21,20,19.7,19.5],{start:'mid'});
 assert.deepEqual(back,['mid','mid','mid','mid','mid','mid','mid','mid','low']);
});

test('a size jittering around each threshold never flips more than once',()=>{
 for(const threshold of [low.css,mid.css]){
  const jitter=Array.from({length:80},(_,i)=>threshold+Math.sin(i)*threshold*LOD_MARGIN*.8);
  for(const start of ['low','mid','full'])assert.equal(flips(walk(jitter,{start})),0,`${threshold} from ${start}`);
 }
 // A slow nudge-zoom through the whole range and back changes level once per threshold each way.
 const ramp=Array.from({length:400},(_,i)=>12+i*.2);
 const out=walk([...ramp,...ramp.slice().reverse()]);
 assert.equal(flips(out),4);
 // The levels also change at distances apart: up beyond margin, down below it.
 const up=out.findIndex(l=>l==='mid'),down=out.length-1-out.slice().reverse().findIndex(l=>l==='mid');
 assert.ok(ramp[up]>low.css*(1+LOD_MARGIN)-.3&&ramp[up]<low.css*(1+LOD_MARGIN)+.3);
 assert.ok(down>ramp.length);
});

test('a jump of several levels is not held',()=>{
 assert.equal(lodFor(90,'low'),'full');assert.equal(lodFor(10,'full'),'low');
});

test('while zooming a level is held until a growing disc outgrows its image',()=>{
 assert.equal(lodFor(low.css*(1+LOD_MARGIN)+3,'low',true),'low');
 assert.equal(lodFor(low.css*HOLD_LIMIT,'low',true),'low');
 assert.equal(lodFor(low.css*HOLD_LIMIT+.1,'low',true),'mid');
 assert.equal(lodFor(mid.css*HOLD_LIMIT+.1,'mid',true),'full');
 // A shrinking disc keeps the bigger image (it only scales down), and the top level never grows past.
 assert.equal(lodFor(5,'full',true),'full');assert.equal(lodFor(30,'mid',true),'mid');assert.equal(lodFor(300,'full',true),'full');
 // Held, then settled: the same size is looked at again with the margin.
 assert.equal(lodFor(33,'low',true),'low');assert.equal(lodFor(33,'low',false),'mid');
 // A disc with no level yet (a first render) is chosen plainly even mid-zoom.
 assert.equal(lodFor(33,undefined,true),'mid');
});

test('a zoom held through a wheel gesture changes nothing until it settles',()=>{
 const sizes=Array.from({length:60},(_,i)=>20+i*.25);
 assert.equal(flips(walk(sizes,{start:'low',hold:true})),0);
});
