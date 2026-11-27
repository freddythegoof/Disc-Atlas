// The capture gate (public/disc-photo-qa.mjs, docs/stamp-pipeline-v2.md §11), on drawn discs only: a sharp, evenly lit
// disc gives no prompt; blurred, washed out, crushed, glared or small, each gives its own retake prompt, the spike's words
// (spikes/stamp-pipeline-v2/qa.mjs) unchanged. Run with `node --test tests/photo-qa.mjs`.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {photoGate,photoDiameter,RETAKE,GATE} from '../public/disc-photo-qa.mjs';
const sharp=createRequire(import.meta.url)('sharp');

const SIZE=2048,C=SIZE/2,PLATE=.85;
// A blue disc with a dark print: a name, a ring, and a row of small marks.
const PRINT='<text x="1024" y="1000" font-family="Helvetica" font-size="220" font-weight="bold" text-anchor="middle" fill="#1d2433">DRIVER</text>'
 +'<circle cx="1024" cy="1024" r="560" fill="none" stroke="#1d2433" stroke-width="18"/>'
 +Array.from({length:14},(_,i)=>`<rect x="${760+i*38}" y="1150" width="10" height="44" fill="#1d2433"/>`).join('');
async function disc({blur=0,extra='',plastic='#5b9ca9'}={}){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><defs><clipPath id="c"><circle cx="${C}" cy="${C}" r="${C}"/></clipPath></defs><g clip-path="url(#c)"><rect width="${SIZE}" height="${SIZE}" fill="${plastic}"/>${PRINT}${extra}</g></svg>`;
 let img=sharp(Buffer.from(svg));if(blur)img=sharp(await img.png().toBuffer()).blur(blur);
 return new Uint8ClampedArray(await img.ensureAlpha().raw().toBuffer());
}
const ORIGINAL={diameter:3000,shortSide:3024};

test('a sharp, evenly lit disc that fills the photo gives no prompt',async()=>{
 const r=photoGate(await disc(),SIZE,{plate:PLATE,original:ORIGINAL});
 assert.deepEqual(r.prompts,[],JSON.stringify(r.checks));
 assert.ok(r.pass);
});

test('a blurred photo asks for a sharper one',async()=>{
 const r=photoGate(await disc({blur:3}),SIZE,{plate:PLATE,original:ORIGINAL});
 assert.deepEqual(r.prompts,[RETAKE.sharpness]);
});

test('washed out, too dark and a bright reflection each have their prompt',async()=>{
 const washed=photoGate(await disc({plastic:'#ffffff'}),SIZE,{plate:PLATE});
 assert.ok(washed.prompts.includes(RETAKE.clipped),washed.prompts.join(' | '));
 const dark=photoGate(await disc({plastic:'#020202'}),SIZE,{plate:PLATE});
 assert.ok(dark.prompts.includes(RETAKE.crushed),dark.prompts.join(' | '));
 const glare=photoGate(await disc({extra:'<ellipse cx="1300" cy="700" rx="140" ry="90" fill="#fbfbfb"/>'}),SIZE,{plate:PLATE});
 assert.deepEqual(glare.prompts,[RETAKE.glare]);
});

test('a small disc in a camera original asks to move closer, once',async()=>{
 const r=photoGate(await disc(),SIZE,{plate:PLATE,original:{diameter:900,shortSide:3024}});
 assert.deepEqual(r.prompts,[RETAKE.resolution]);
 // A disc that already fills a low-resolution photo is not asked to move closer: no step closer helps.
 assert.deepEqual(photoGate(await disc(),SIZE,{plate:PLATE,original:{diameter:1500,shortSide:1600}}).prompts,[]);
 // A stored texture is never read for resolution: its size is the site's, not the camera's.
 assert.deepEqual(photoGate(await disc(),SIZE,{plate:PLATE}).prompts,[]);
});

test('a large disc that leaves the frame empty is told to fill it, not that it is small',async()=>{
 // 2000 px across is resolution enough; over a 4032 px short side it fills under half the frame.
 const r=photoGate(await disc(),SIZE,{plate:PLATE,original:{diameter:2000,shortSide:4032}});
 assert.deepEqual(r.prompts,[RETAKE.fill]);
 assert.ok(!r.prompts.includes(RETAKE.resolution));
});

test('the prompts are the feel check’s words (Nov 26)',()=>{
 assert.deepEqual(RETAKE,{
  sharpness:'The photo looks blurry. Hold steady and retake it.',
  clipped:'Part of the disc is washed out. Move out of direct light or turn off the flash, then retake.',
  crushed:'Part of the disc is too dark to read. Retake it in more even light.',
  glare:'A reflection is covering the stamp. Tilt the disc slightly until it moves off, then retake.',
  resolution:'The disc is small in this photo. Move closer so it fills the frame, then retake.',
  fill:'Fill the frame with the disc: move closer or crop tighter.',
 });
 for(const words of Object.values(RETAKE))assert.ok(!/circle guide|tap .*focus/i.test(words),words);
 assert.equal(GATE.DIAMETER,1600);
});

test('the diameter is read in the photo’s own pixels',()=>{
 const d=photoDiameter({scale:.94,aspect:1,perspective:0,angle:0,cx:.5,cy:.5,rotate:0},3024,4032);
 assert.ok(Math.abs(d-.94*3024)<4,String(d));
});
