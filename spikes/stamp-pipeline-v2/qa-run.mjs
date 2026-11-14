// The capture gate on each pinned photo, at the warp v2 reads (the photo's own resolution), timed.
import {writeFileSync} from 'node:fs';
import {PINNED,RUNS,readRaw,load,options,nativeDiameter} from './common.mjs';
import {gate} from './qa.mjs';
const out={};
for(const [name,disc] of Object.entries(PINNED)){
 const input=readRaw(RUNS+name+'/v2-input.raw.gz'),size=Math.round(Math.sqrt(input.length/4)),img=await load(disc.file),original=disc.path==='original';
 const t0=performance.now(),r=gate({disc:input,size,diameter:original?nativeDiameter(img,options(disc,img)):size,shortSide:Math.min(img.w,img.h),plate:disc.plate,original});
 out[name]={ms:Math.round(performance.now()-t0),...r};
 console.log(name,r.pass?'PASS':'RETAKE',out[name].ms+'ms',r.checks.map(c=>`${c.check}=${c.value}${c.pass?'':'✗'}`).join(' '));
}
writeFileSync(RUNS+'../qa.json',JSON.stringify(out,null,1));
