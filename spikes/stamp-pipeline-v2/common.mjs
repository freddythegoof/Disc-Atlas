// Shared lab plumbing for the v2 spike: the pinned set, decoding, production's crop and production's extractor.
import sharp from 'sharp';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {gunzipSync,gzipSync} from 'node:zlib';
import {photoPoint} from '../../public/disc-photo.mjs';

export const ROOT=new URL('../../work/stamp-pipeline-v2/',import.meta.url).pathname;
export const IN=ROOT+'input/',RUNS=ROOT+'runs/',SHEETS=ROOT+'sheets/';
for(const d of [RUNS,SHEETS])mkdirSync(d,{recursive:true});

const level=(w,h)=>({scale:1,aspect:1,perspective:0,angle:0,cx:.5-.5/w,cy:.5-.5/h,rotate:0});
const berg=JSON.parse(readFileSync(IN+'berg-original-options.json'));
const framing=JSON.parse(readFileSync(IN+'framing.json'));
// Each pinned disc: its photo, how production frames it, the mold's plate, and the plastic flags production passes.
// `path`: 'original' (a camera original, read at STAMP_SIZE through a ≤4096 working copy) or 'stored' (one-click).
export const PINNED={
 'berg-original':{file:'berg-original.png',path:'original',options:berg,plate:.9360189573459715,plastic:'K1 Glow',capture:'stamp-look-extraction runs/orig-berg2/input.raw.gz'},
 'berg-stored':{file:'berg-stored.webp',path:'stored',plate:.9360189573459715,plastic:'K1 Glow'},
 proxy:{file:'proxy-stored.webp',path:'stored',plate:.8952380952380953,plastic:'Eclipse'},
 wraith:{file:'wraith-stored.webp',path:'stored',plate:.8274476777251184,plastic:'Proto Glow Champion',seeThrough:true},
 raptor:{file:'raptor-71c60188.webp',path:'stored',plate:.8500320187793428,plastic:'Z',clear:true,seeThrough:true},
 dd3:{file:'dd3.jpg',path:'original',options:{scale:.94,aspect:1,perspective:0,angle:0,rotate:0,...framing.dd3.framing},plate:.8081516587677724,plastic:'S-Line',control:true},
 destroyer:{file:'destroyer.jpg',path:'original',options:{scale:.94,aspect:1,perspective:0,angle:0,rotate:0,...framing.destroyer.framing},plate:.8164928909952607,plastic:'Star',control:true},
};

// The photo as the browser decodes it: EXIF orientation applied, sRGB 8-bit RGBA.
export async function load(file){
 const {data,info}=await sharp(IN+file).rotate().ensureAlpha().toColourspace('srgb').raw().toBuffer({resolveWithObject:true});
 return {data:new Uint8ClampedArray(data.buffer,data.byteOffset,data.length),w:info.width,h:info.height};
}
// Production's working copy: the photo scaled so its long side is at most `limit` (disc-photo.mjs workingCopy).
export async function workingCopy(file,limit){
 const img=await load(file);const ratio=Math.min(1,limit/Math.max(img.w,img.h));if(ratio===1)return img;
 const w=Math.round(img.w*ratio),h=Math.round(img.h*ratio);
 const {data}=await sharp(Buffer.from(img.data.buffer),{raw:{width:img.w,height:img.h,channels:4}}).resize(w,h,{kernel:'linear'}).raw().toBuffer({resolveWithObject:true});
 return {data:new Uint8ClampedArray(data.buffer,data.byteOffset,data.length),w,h};
}
export const options=(disc,img)=>disc.path==='stored'?level(img.w,img.h):disc.options;
// disc-photo.mjs photoCanvas, byte for byte in its sampling: bilinear point samples through photoPoint, the edge feathered.
export function crop({data:source,w,h},opts,size){
 const out=new Uint8ClampedArray(size*size*4);
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const x=(i+.5)/size*2-1,y=(j+.5)/size*2-1,p=photoPoint(x,y,{...opts,width:w,height:h});
  if(!p.inside||p.x<0||p.y<0||p.x>=w-1||p.y>=h-1)continue;
  const a=Math.floor(p.x),b=Math.floor(p.y),fx=p.x-a,fy=p.y-b,k=(j*size+i)*4;
  for(let c=0;c<4;c++)out[k+c]=(source[(b*w+a)*4+c]*(1-fx)+source[(b*w+a+1)*4+c]*fx)*(1-fy)+(source[((b+1)*w+a)*4+c]*(1-fx)+source[((b+1)*w+a+1)*4+c]*fx)*fy;
  out[k+3]=Math.round(out[k+3]*Math.min(1,(1-Math.hypot(x,y))*size/2));
 }
 return out;
}
// The disc's diameter in the source photo's own pixels: how large a crop holds every original pixel (no downsample).
export function nativeDiameter(img,opts){
 let best=0;const pts=[];
 for(let k=0;k<64;k++){const t=k/64*2*Math.PI,p=photoPoint(Math.cos(t)*.999,Math.sin(t)*.999,{...opts,width:img.w,height:img.h});pts.push(p);}
 for(let k=0;k<32;k++)best=Math.max(best,Math.hypot(pts[k].x-pts[k+32].x,pts[k].y-pts[k+32].y));
 return best;
}
export const saveRaw=(path,arr)=>writeFileSync(path,gzipSync(Buffer.from(arr.buffer,arr.byteOffset,arr.byteLength)));
export const readRaw=(path,Type=Uint8ClampedArray)=>{const b=gunzipSync(readFileSync(path));return new Type(b.buffer,b.byteOffset,b.byteLength/Type.BYTES_PER_ELEMENT);};
export const exists=existsSync;
export async function png(path,rgba,w,h=w){await sharp(Buffer.from(rgba.buffer,rgba.byteOffset,rgba.byteLength),{raw:{width:w,height:h,channels:4}}).png().toFile(path);}
export async function jpg(path,rgba,w,h=w){await sharp(Buffer.from(rgba.buffer,rgba.byteOffset,rgba.byteLength),{raw:{width:w,height:h,channels:4}}).flatten({background:'#ffffff'}).jpeg({quality:90}).toFile(path);}
