// Cause 1, the blotch: is it resolution, or an extractor tipping over on near-identical inputs? Production and v2's
// separation run on the same 2048 crops of the Berg camera original: WebKit's captured worker input, this lab's Node
// crop (0.5/255 apart), and each at 1.3× contrast (the stress that reproduced Freddy's live blotch pattern,
// berg-blobs/REPORT.md). Then v2 at the photo's own resolution. Alpha over half, IoU against each run's WebKit read.
import {writeFileSync} from 'node:fs';
import {PINNED,RUNS,readRaw,saveRaw} from './common.mjs';
import {extract} from '../../public/disc-stamp-worker.mjs';
import {separate} from './separate.mjs';

const disc=PINNED['berg-original'],dir=RUNS+'berg-original/',S=2048,plate=disc.plate;
const webkit=readRaw(dir+'prodcap-input.raw.gz'),node=readRaw(dir+'prod-input.raw.gz');
// Contrast about the plate's mean, as the report's stress did: v' = mean + 1.3 (v − mean), per channel.
function contrast(rgba,f){const out=rgba.slice(),m=[0,0,0];let n=0;
 for(let p=0;p<rgba.length;p+=4)if(rgba[p+3]>250){m[0]+=rgba[p];m[1]+=rgba[p+1];m[2]+=rgba[p+2];n++;}
 for(let c=0;c<3;c++)m[c]/=n;for(let p=0;p<rgba.length;p+=4)for(let c=0;c<3;c++)out[p+c]=m[c]+f*(rgba[p+c]-m[c]);return out;}
const prod=rgba=>extract(rgba.slice(),S,plate,{color:false}).alpha,v2=rgba=>separate(rgba,S,{plate}).alpha;
const iou=(a,b)=>{let x=0,y=0,both=0;for(let p=0;p<a.length;p++){const u=a[p]>127,v=b[p]>127;x+=u;y+=v;both+=u&&v;}return {iou:+(both/(x+y-both)).toFixed(3),onlyA:x-both,onlyB:y-both};};
// Ink outside the print: alpha over half beyond 0.62 of the radius, where the Berg has no print (its sun ends at ~0.6).
const stray=a=>{let n=0;const c=S/2;for(let p=0;p<a.length;p++){if(a[p]<=127)continue;const i=p%S,j=(p-i)/S;if(Math.hypot(i+.5-c,j+.5-c)>.62*c)n++;}return n;};
const out={};
for(const [name,fn] of [['production',prod],['v2',v2]]){
 const runs={webkit:fn(webkit),node:fn(node),webkit13:fn(contrast(webkit,1.3)),node13:fn(contrast(node,1.3))};
 for(const [k,a] of Object.entries(runs))saveRaw(dir+`stab-${name}-${k}.raw.gz`,a);
 out[name]={nodeVsWebkit:iou(runs.node,runs.webkit),webkit13VsWebkit:iou(runs.webkit13,runs.webkit),node13VsWebkit:iou(runs.node13,runs.webkit),
  strayPx:Object.fromEntries(Object.entries(runs).map(([k,a])=>[k,stray(a)]))};
 console.log(name,JSON.stringify(out[name]));
}
writeFileSync(dir+'stability.json',JSON.stringify(out,null,1));
