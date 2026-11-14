// The post-pass on every disc, on the same 2048 crop today reads. First a fidelity check: the copied extract() with
// the veto off must give production's alpha byte for byte. Then the veto: what it removes (alpha over half, at 2048)
// and where. Writes runs/<disc>/post-{alpha,design,color}.raw.gz and post.json, and runs/<disc>/post-removed.png
// (black: kept ink; red: removed).
import {writeFileSync} from 'node:fs';
import sharp from 'sharp';
import {PINNED,EXTRA,RUNS,readRaw,saveRaw} from './common.mjs';
import {extract as today} from '../../public/disc-stamp-worker.mjs';
import {extract} from './extract-post.mjs';

const S=2048,only=process.argv.slice(2),all={...PINNED,...EXTRA},summary={};
const design=r=>r.layers?Uint8ClampedArray.from(r.alpha,(_,p)=>Object.values(r.layers).some(l=>l[p]>=.5)?255:0):r.alpha;
for(const [name,disc] of Object.entries(all)){
 if(only.length&&!only.includes(name))continue;
 const dir=RUNS+name+'/',inputs=disc.capture?{webkit:'prodcap-input.raw.gz',node:'prod-input.raw.gz'}:{node:'prod-input.raw.gz'};
 const opts={color:true,stored:disc.path==='stored',clear:!!disc.clear,seeThrough:!!disc.seeThrough};
 for(const [tag,file] of Object.entries(inputs)){
  const input=readRaw(dir+file),suffix=tag==='node'?'':'-'+tag;
  // Fidelity: the copy with the veto off is production, byte for byte.
  const a=today(input.slice(),S,disc.plate,opts),b=extract(input.slice(),S,disc.plate,{...opts,veto:false});
  let same=a.alpha.length===b.alpha.length;for(let p=0;same&&p<a.alpha.length;p++)if(a.alpha[p]!==b.alpha[p])same=false;
  if(a.color&&same)for(let p=0;same&&p<a.color.rgba.length;p++)if(a.color.rgba[p]!==b.color.rgba[p])same=false;
  const t0=performance.now(),r=extract(input.slice(),S,disc.plate,opts),ms=Math.round(performance.now()-t0);
  const before=design(a),after=design(r);
  saveRaw(dir+`post${suffix}-alpha.raw.gz`,r.alpha);saveRaw(dir+`post${suffix}-design.raw.gz`,after);if(r.color)saveRaw(dir+`post${suffix}-color.raw.gz`,r.color.rgba);
  // Removed ink, and how far from the centre it lies (print on these discs sits inside about 0.62 of the radius).
  let kept=0,removed=0,removedInner=0,added=0;const img=Buffer.alloc(S*S*3,255),c=S/2;
  for(let p=0;p<S*S;p++){const x=before[p]>127,y=after[p]>127;if(y&&!x)added++;if(x&&y){kept++;img[p*3]=img[p*3+1]=img[p*3+2]=0;}
   if(x&&!y){removed++;const i=p%S,j=(p-i)/S;if(Math.hypot(i+.5-c,j+.5-c)<.62*c)removedInner++;img[p*3]=220;img[p*3+1]=img[p*3+2]=0;}}
  await sharp(img,{raw:{width:S,height:S,channels:3}}).resize(640,640,{kernel:'lanczos3'}).png().toFile(dir+`post${suffix}-removed.png`);
  summary[name+suffix]={identicalWithVetoOff:same,todayInk:kept+removed,removed,removedInner,added,ms,todayMs:null};
  console.log(name+suffix,JSON.stringify(summary[name+suffix]));
 }
}
writeFileSync(RUNS+'../post.json',JSON.stringify(summary,null,1));
