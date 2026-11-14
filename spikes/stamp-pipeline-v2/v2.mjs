// The v2 candidate on each pinned photo: warp at the photo's own resolution, separate in Lab, then the colour asset from
// production's colour pass on v2's mask. Writes runs/<disc>/v2-{input,alpha,color}.raw.gz (native) + v2-alpha2048 + v2.json.
import {mkdirSync,writeFileSync} from 'node:fs';
import sharp from 'sharp';
import {PINNED,RUNS,load,options,crop,nativeDiameter,saveRaw} from './common.mjs';
import {separate} from './separate.mjs';
import {delightPixels,plateColor as measurePlate} from '../../public/disc-albedo.mjs';
import {delightStamp} from '../../public/disc-stamp-delight.mjs';
import {extractStampColor} from '../../public/disc-stamp-color.mjs';
import {unshadow,shoulder} from '../../public/disc-stamp-clear.mjs';

const args=process.argv.slice(2),noColor=args.includes('--no-color'),only=args.filter(a=>!a.startsWith('--'));
const tuning=JSON.parse(process.env.TUNING||'{}'),tag=process.env.TAG||'v2';
export async function runV2(disc,{color=true}={}){
 const ms={},t=()=>performance.now();let t0=t();
 const img=await load(disc.file),opts=options(disc,img);ms.decode=Math.round(t()-t0);t0=t();
 // Step 3: the canonical circle at the photo's own resolution: one crop pixel per photo pixel across the disc.
 const size=disc.path==='stored'?img.w:Math.round(nativeDiameter(img,opts)/2)*2;
 const input=crop(img,opts,size);ms.warp=Math.round(t()-t0);t0=t();
 // A clear disc (docs/clear-plastic-discs.md): production's own clear passes, unchanged, around v2's separation. Its
 // stamp's shadow on the surface under it is taken out first, and its shoulder (the rim's own colour) is never print.
 let read=input,shadow=null;if(disc.clear){read=input.slice();shadow=unshadow(read,size,{plate:disc.plate});}
 const sep=separate(read,size,{plate:disc.plate,seeThrough:!!disc.seeThrough,tuning});
 if(disc.clear){const off=shoulder(input,size,disc.plate,shadow.plate);for(let p=0;p<off.length;p++)if(off[p]){sep.alpha[p]=0;sep.mask[p]=0;}}
 ms.separate=Math.round(t()-t0);t0=t();
 let rgba=null;
 if(color){
  // Production's colour pass, unchanged, on v2's mask: the pre-softening de-lit crop (softenGlare:false), as production reads it.
  const data=read.slice(),raw=input.slice(),stored=disc.path==='stored';
  const measured=stored?measurePlate(data,size):delightPixels(data,size,{softenGlare:false}).color;
  const light=delightStamp(data,raw,size,{plate:disc.plate,plateColor:measured,stored});
  const colour=extractStampColor(data,raw,size,sep.mask,light.plateColor,{plate:disc.plate,glare:light.unreliable,filled:light.filled,clear:!!disc.clear});rgba=colour.rgba;
  // The colour asset's alpha is v2's soft alpha; on a clear disc, production's clean finish (the colour pass decides what
  // is print, at full alpha: docs/clear-stamp-clean.md).
  for(let p=0;p<size*size;p++){if(disc.clear)sep.alpha[p]=colour.kept[p]?255:0;rgba[p*4+3]=sep.alpha[p];}
  ms.color=Math.round(t()-t0);
 }
 return {size,input,sep,rgba,ms};
}
const at2048=async(arr,size,channels)=>{
 if(size===2048)return arr;
 let img=sharp(Buffer.from(arr.buffer,arr.byteOffset,arr.byteLength),{raw:{width:size,height:size,channels}}).resize(2048,2048,{kernel:size>2048?'lanczos3':'mitchell'});
 if(channels===1)img=img.extractChannel(0);
 const {data}=await img.raw().toBuffer({resolveWithObject:true});return new Uint8ClampedArray(data.buffer,data.byteOffset,data.length);
};
if(import.meta.url===`file://${process.argv[1]}`)for(const [name,disc] of Object.entries(PINNED)){
 if(only.length&&!only.includes(name))continue;
 const dir=RUNS+name+'/';mkdirSync(dir,{recursive:true});
 const {size,input,sep,rgba,ms}=await runV2(disc,{color:!noColor});
 saveRaw(dir+tag+'-input.raw.gz',input);saveRaw(dir+tag+'-alpha.raw.gz',sep.alpha);saveRaw(dir+tag+'-alpha2048.raw.gz',await at2048(sep.alpha,size,1));
 if(rgba){saveRaw(dir+tag+'-color.raw.gz',rgba);saveRaw(dir+tag+'-color2048.raw.gz',await at2048(rgba,size,4));}
 const marks=sep.all.map(({id,area,seeds,width,contrast,hueOff,whiteOff,level,ghost,blotch,sheen,rim,weak,chained,keep,x0,y0,x1,y1})=>({id,area,seeds,width:+width.toFixed(2),contrast:+contrast.toFixed(1),hueOff:+hueOff.toFixed(1),whiteOff:+whiteOff.toFixed(1),level:+level.toFixed(2),ghost,blotch,sheen,rim,weak,chained,keep,box:[x0,y0,x1,y1].map(v=>+(v/size).toFixed(3))}));
 writeFileSync(dir+tag+'.json',JSON.stringify({size,ms,plastic:sep.plastic,thresholds:sep.thresholds,marks:sep.marks,tuning,all:marks},null,1));
 console.log(name,size,JSON.stringify(ms),JSON.stringify(sep.thresholds),JSON.stringify(sep.marks));
}
