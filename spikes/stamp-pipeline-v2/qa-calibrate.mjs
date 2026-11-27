// Fits the production gate (public/disc-photo-qa.mjs) on the 2048 crops a game asset is made from (runs/<disc>/prod-input,
// baseline.mjs). No photo in the set is blurred, washed out or dark, so each is also degraded on purpose: a Gaussian blur
// (sigma in px at 2048), brightened ×1.8 and darkened ×0.15. A threshold passes every real photo and fails the degraded
// ones it should. Prints a table, writes work/stamp-pipeline-v2/qa-calibrate.json.
import sharp from 'sharp';
import {writeFileSync} from 'node:fs';
import {PINNED,EXTRA,RUNS,ROOT,readRaw,load,options} from './common.mjs';
import {photoGate,photoDiameter} from '../../public/disc-photo-qa.mjs';

const S=2048,out={};
const raw=async(rgba,f)=>{const {data}=await f(sharp(Buffer.from(rgba.buffer,rgba.byteOffset,rgba.byteLength),{raw:{width:S,height:S,channels:4}})).raw().toBuffer({resolveWithObject:true});return new Uint8ClampedArray(data.buffer,data.byteOffset,data.length);};
const scale=(rgba,k)=>Uint8ClampedArray.from(rgba,(v,p)=>p%4===3?v:v*k);
const row=(name,r)=>console.log(name.padEnd(26),r.checks.map(c=>`${c.check}=${+c.value.toFixed(4)}${c.pass?'':'✗'}`).join(' '),r.prompts.length?'→ '+r.prompts.length+' prompt(s)':'');
for(const [name,disc] of Object.entries({...PINNED,...EXTRA})){
 const input=readRaw(RUNS+name+'/prod-input.raw.gz');let original=null;
 if(disc.path==='original'){const img=await load(disc.file);original={diameter:photoDiameter(options(disc,img),img.w,img.h),shortSide:Math.min(img.w,img.h)};}
 const runs={photo:photoGate(input,S,{plate:disc.plate,original})};
 for(const sigma of [1,2,3,5])runs['blur'+sigma]=photoGate(await raw(input,i=>i.blur(sigma)),S,{plate:disc.plate,original});
 runs.bright=photoGate(scale(input,1.8),S,{plate:disc.plate,original});
 runs.dark=photoGate(scale(input,.15),S,{plate:disc.plate,original});
 out[name]=Object.fromEntries(Object.entries(runs).map(([k,r])=>[k,{pass:r.pass,prompts:r.prompts.length,checks:Object.fromEntries(r.checks.map(c=>[c.check,+c.value.toFixed(4)]))}]));
 for(const [k,r] of Object.entries(runs))row(name+' '+k,r);
}
writeFileSync(ROOT+'qa-calibrate.json',JSON.stringify(out,null,1));
