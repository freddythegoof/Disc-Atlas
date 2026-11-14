// Today's production extraction on each pinned photo: production's crop (STAMP_SIZE through a ≤4096 working copy) and
// main's worker extract(), unchanged. Writes runs/<disc>/prod-{input,alpha,color}.raw.gz + prod.json.
import {mkdirSync,writeFileSync} from 'node:fs';
import {PINNED,EXTRA,RUNS,workingCopy,options,crop,saveRaw,readRaw,exists} from './common.mjs';
import {extract} from '../../public/disc-stamp-worker.mjs';

const SIZE=2048,only=process.argv.slice(2);
for(const [name,disc] of Object.entries({...PINNED,...EXTRA})){
 if(only.length&&!only.includes(name))continue;
 const dir=RUNS+name+'/';mkdirSync(dir,{recursive:true});
 const t0=performance.now(),img=await workingCopy(disc.file,2*SIZE),opts=options(disc,img);
 const input=crop(img,opts,SIZE),t1=performance.now();
 const r=extract(input.slice(),SIZE,disc.plate,{color:true,stored:disc.path==='stored',clear:!!disc.clear,seeThrough:!!disc.seeThrough}),t2=performance.now();
 saveRaw(dir+'prod-input.raw.gz',input);saveRaw(dir+'prod-alpha.raw.gz',r.alpha);
 // A layered asset (the DD3) is drawn from its layers, not its alpha: its design is any layer at half or more.
 const design=r.layers?Uint8ClampedArray.from(r.alpha,(_,p)=>Object.values(r.layers).some(l=>l[p]>=.5)?255:0):r.alpha;saveRaw(dir+'prod-design.raw.gz',design);if(r.color)saveRaw(dir+'prod-color.raw.gz',r.color.rgba);
 const info={size:SIZE,working:[img.w,img.h],plateColor:r.plateColor,ms:{crop:Math.round(t1-t0),extract:Math.round(t2-t1)},color:r.color?{size:r.color.size??null,keys:Object.keys(r.color)}:null,layers:!!r.layers,stats:r.stats};
 // Berg's camera original also runs on the exact worker input WebKit captured on Oct 27 (orig-berg2), as a check on this crop.
 if(disc.capture){
  const cap='/Users/freddy/Disc-Atlas/.claude/worktrees/stamp-look-extraction/work/stamp-look-extraction/runs/orig-berg2/input.raw.gz';
  if(exists(cap)){
   const captured=readRaw(cap);let diff=0,n=0;for(let p=0;p<captured.length;p+=4)if(captured[p+3]>200&&input[p+3]>200){n++;diff+=Math.abs(captured[p]-input[p])+Math.abs(captured[p+1]-input[p+1])+Math.abs(captured[p+2]-input[p+2]);}
   const rc=extract(captured.slice(),SIZE,disc.plate,{color:true});
   saveRaw(dir+'prodcap-input.raw.gz',captured);saveRaw(dir+'prodcap-alpha.raw.gz',rc.alpha);saveRaw(dir+'prodcap-color.raw.gz',rc.color.rgba);
   let a=0,b=0,both=0;for(let p=0;p<rc.alpha.length;p++){const x=rc.alpha[p]>127,y=r.alpha[p]>127;a+=x;b+=y;both+=x&&y;}
   info.capturedCheck={meanAbsRGB:+(diff/n/3).toFixed(2),alphaIoU:+(both/(a+b-both)).toFixed(3)};
  }
 }
 writeFileSync(dir+'prod.json',JSON.stringify(info,null,1));
 console.log(name,JSON.stringify({ms:info.ms,plateColor:info.plateColor,capturedCheck:info.capturedCheck}));
}
