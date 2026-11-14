// The production build (public/disc-stamp-worker.mjs with the blotch veto) on every photo disc, against today's
// extraction on main (runs/<disc>/prod-*, made by baseline.mjs from main's worker) and the spike's post-pass (post-*):
// ink removed (alpha over half, design for a layered asset), colour moved on shared ink, and the support read's time and
// memory. node --expose-gc identity.mjs
import {writeFileSync} from 'node:fs';
import {PINNED,EXTRA,RUNS,readRaw} from './common.mjs';
import {extract} from '../../public/disc-stamp-worker.mjs';
import {printSupport} from '../../public/disc-stamp-separate.mjs';
import {rgbToLab} from '../../public/disc-stamp-extract.mjs';

const S=2048,out={},design=r=>r.layers?Uint8ClampedArray.from(r.alpha,(_,p)=>Object.values(r.layers).some(l=>l[p]>=.5)?255:0):r.alpha;
const diff=(a,b)=>{let n=0;for(let p=0;p<a.length;p++)if(a[p]!==b[p])n++;return n;};
for(const [name,disc] of Object.entries({...PINNED,...EXTRA})){
 const dir=RUNS+name+'/',inputs=disc.capture?{webkit:'prodcap-input.raw.gz',node:'prod-input.raw.gz'}:{node:'prod-input.raw.gz'};
 const opts={color:true,stored:disc.path==='stored',clear:!!disc.clear,seeThrough:!!disc.seeThrough};
 for(const [tag,file] of Object.entries(inputs)){
  const suffix=tag==='node'?'':'-'+tag,input=readRaw(dir+file),today=tag==='node'?'prod':'prodcap';
  globalThis.gc?.();const base=process.memoryUsage().arrayBuffers;let peak=base;
  const watch=setInterval(()=>{peak=Math.max(peak,process.memoryUsage().arrayBuffers);},1);
  const t0=performance.now();printSupport(input,S,{plate:disc.plate,seeThrough:!!disc.seeThrough});const supportMs=Math.round(performance.now()-t0);
  peak=Math.max(peak,process.memoryUsage().arrayBuffers);clearInterval(watch);
  const t1=performance.now(),r=extract(input.slice(),S,disc.plate,opts),ms=Math.round(performance.now()-t1);
  const before=readRaw(dir+(today==='prod'?'prod-design.raw.gz':'prodcap-alpha.raw.gz')),after=design(r),spike=readRaw(dir+`post${suffix}-design.raw.gz`);
  let removed=0,added=0;for(let p=0;p<S*S;p++){const x=before[p]>127,y=after[p]>127;removed+=x&&!y;added+=y&&!x;}
  const prodAlpha=readRaw(dir+`${today}-alpha.raw.gz`),prodColor=readRaw(dir+`${today}-color.raw.gz`);
  let n=0,s=0;for(let p=0;p<prodColor.length;p+=4){if(prodColor[p+3]<128||r.color.rgba[p+3]<128)continue;const x=rgbToLab(prodColor[p],prodColor[p+1],prodColor[p+2]),y=rgbToLab(r.color.rgba[p],r.color.rgba[p+1],r.color.rgba[p+2]);n++;s+=Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2]);}
  out[name+suffix]={removed,added,alphaBytes:diff(prodAlpha,r.alpha),colourBytes:diff(prodColor,r.color.rgba),meanDE:+(s/n).toFixed(3),designVsSpikePx:diff(Uint8Array.from(after,v=>v>127),Uint8Array.from(spike,v=>v>127)),supportMs,supportPeakMB:Math.round((peak-base)/1048576),ms};
  console.log(name+suffix,JSON.stringify(out[name+suffix]));
 }
}
writeFileSync(RUNS+'../identity.json',JSON.stringify(out,null,1));
