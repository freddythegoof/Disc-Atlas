// Control for cause 1: production's own extractor on the Berg's full-resolution crop (v2's warp, no 2048 downsample).
// If resolution were the blotch's cause, this alone would clear it.
import {writeFileSync} from 'node:fs';
import sharp from 'sharp';
import {PINNED,RUNS,readRaw,saveRaw} from './common.mjs';
import {extract} from '../../public/disc-stamp-worker.mjs';
const disc=PINNED['berg-original'],dir=RUNS+'berg-original/',input=readRaw(dir+'v2-input.raw.gz'),S=Math.round(Math.sqrt(input.length/4));
const t0=performance.now(),r=extract(input.slice(),S,disc.plate,{color:false}),ms=Math.round(performance.now()-t0);
const {data}=await sharp(Buffer.from(r.alpha.buffer,r.alpha.byteOffset,r.alpha.byteLength),{raw:{width:S,height:S,channels:1}}).resize(2048,2048,{kernel:'lanczos3'}).extractChannel(0).raw().toBuffer({resolveWithObject:true});
const a=new Uint8ClampedArray(data.buffer,data.byteOffset,data.length);saveRaw(dir+'prodnative-alpha2048.raw.gz',a);
let stray=0;const c=1024;for(let p=0;p<a.length;p++){if(a[p]<=127)continue;const i=p%2048,j=(p-i)/2048;if(Math.hypot(i+.5-c,j+.5-c)>.62*c)stray++;}
writeFileSync(dir+'prodnative.json',JSON.stringify({size:S,ms,stray2048:stray},null,1));console.log({size:S,ms,stray});
