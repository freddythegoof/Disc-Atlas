// The narrower option (docs/stamp-pipeline-v2.md §9): today's extractor, unchanged, plus one post-pass from v2. v2's
// separation (separate.mjs: the local plastic field, and its blotch, sheen and ghost rules) reads the same crop, and
// today's ink is kept only where v2 finds print within SUPPORT px (at 1024) of it. Removal only: it never adds a pixel,
// so today's edges, layers and letters stand as they are, and the colour pass reads the vetoed mask.
// A copy of disc-stamp-worker.mjs extract(), with the veto inserted after the stamp is found; nothing else differs.
import {delightPixels,plateColor as measurePlate} from '../../public/disc-albedo.mjs';
import {extractPhotoStamp} from '../../public/disc-stamp-extract.mjs';
import {extractStampColor} from '../../public/disc-stamp-color.mjs';
import {delightStamp} from '../../public/disc-stamp-delight.mjs';
import {unshadow,shoulder} from '../../public/disc-stamp-clear.mjs';
import {separate} from './separate.mjs';

export const SUPPORT=1.5;
// v2's print, grown by SUPPORT px at 1024 (a separable max filter): where today's ink may stand.
// READ: the size v2's separation reads at (env SUPPORT_READ; the crop is box-averaged down to it, the support taken back
// up by nearest neighbour). 1024 needs a quarter of 2048's memory and time.
const READ=+(globalThis.process?.env?.SUPPORT_READ||0);
function half(rgba,size){const n=size/2,out=new Uint8ClampedArray(n*n*4);
 for(let j=0;j<n;j++)for(let i=0;i<n;i++)for(let c=0;c<4;c++){const p=((2*j)*size+2*i)*4+c;out[(j*n+i)*4+c]=(rgba[p]+rgba[p+4]+rgba[p+size*4]+rgba[p+size*4+4]+2)>>2;}
 return out;}
export function support(raw,size,opts){
 if(READ&&READ<size){const lo=support(half(raw,size),size/2,opts),n=size/2,out=new Uint8Array(size*size);
  for(let p=0;p<out.length;p++){const i=p%size,j=(p-i)/size;out[p]=lo[(j>>1)*n+(i>>1)];}return out;}
 const {plate,seeThrough=false,clear=false}=opts;
 let read=raw;if(clear){read=raw.slice();unshadow(read,size,{plate});}
 const {alpha}=separate(read,size,{plate,seeThrough}),r=Math.max(1,Math.round(SUPPORT*size/1024)),N=size*size,row=new Uint8Array(N),out=new Uint8Array(N);
 for(let j=0;j<size;j++){let last=-1e9;for(let i=0;i<size;i++){if(alpha[j*size+i])last=i;row[j*size+i]=i-last<=r;}last=1e9;for(let i=size-1;i>=0;i--){if(alpha[j*size+i])last=i;if(last-i<=r)row[j*size+i]=1;}}
 for(let i=0;i<size;i++){let last=-1e9;for(let j=0;j<size;j++){if(row[j*size+i])last=j;out[j*size+i]=j-last<=r;}last=1e9;for(let j=size-1;j>=0;j--){if(row[j*size+i])last=j;if(last-j<=r)out[j*size+i]=1;}}
 return out;
}
export function extract(data,size,plate,{color=false,stored=false,clear=false,seeThrough=false,veto=true}={}){
 const raw=data.slice();
 const shadow=clear?unshadow(data,size,{plate}):null;
 const measured=stored?measurePlate(data,size):delightPixels(data,size,{softenGlare:false}).color;
 if(!measured)throw Error('This photo shows too little of the disc to read its stamp.');
 const light=delightStamp(data,raw,size,{plate,plateColor:measured,stored}),plateColor=light.plateColor;
 const {mask,...stamp}=extractPhotoStamp(data,size,{plate,plateColor,keepMask:color||clear,unknown:light.unreliable,lit:light.lit,strong:light.strong,seeThrough});
 const drop=p=>{stamp.alpha[p]=0;if(mask)mask[p]=0;if(stamp.layers)for(const layer of Object.values(stamp.layers))layer[p]=0;};
 // The post-pass: today's ink with no v2 print near it is plastic (a blotch, a sheen, a ghost) and goes.
 let vetoed=0;
 if(veto){const ok=support(raw,size,{plate,seeThrough,clear});for(let p=0;p<ok.length;p++)if(!ok[p]&&(stamp.alpha[p]||mask?.[p])){if(stamp.alpha[p]>127)vetoed++;drop(p);}}
 if(clear){const off=shoulder(raw,size,plate,shadow.plate);for(let p=0;p<off.length;p++)if(off[p])drop(p);}
 const colour=color||clear?extractStampColor(data,raw,size,mask,plateColor,{plate,glare:light.unreliable,filled:light.filled,clear}):null;
 if(clear){
  const {kept}=colour;for(let p=0;p<kept.length;p++)if(!kept[p])drop(p);else stamp.alpha[p]=255;delete colour.kept;
  if(stamp.layers){
   const layers=Object.values(stamp.layers);
   for(let p=0;p<kept.length;p++){
    if(!kept[p])continue;let strongest=layers[0],any=false;
    for(const layer of layers){if(layer[p]>strongest[p])strongest=layer;if(layer[p]>=.5)any=true;}
    for(const layer of layers)layer[p]=layer[p]>=.5||!any&&layer===strongest?1:0;
   }
  }
 }
 return {plateColor,vetoed,light:light.stats,...shadow&&{shadow},...stamp,...color&&{color:colour}};
}
