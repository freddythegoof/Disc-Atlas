// Photo stamps v2 (docs/photo-stamp-color-assets.md): the full-colour game asset. The v1 extractor
// (disc-stamp-extract.mjs) decides WHERE the stamp is; this module decides what colour each part of it is, with the
// photo's light taken out, so the result reads as printed foil laid on the disc rather than a patch of photograph.
// Pure JS, no DOM: the editor's worker and Node tests both run it. Every constant is disc-independent.
//
// Input: the same de-lit crop v1 reads (disc-albedo.mjs delightPixels with softenGlare:false, which has already divided
// out a smooth quadratic of the disc's shading), the crop before de-lighting (to find clipped glare), and v1's final
// binary design mask.
//
//  1. Light: the plastic is one known colour, so it is a light probe. In each GRID cell of bare plate, its colour is
//     fitted as gain × plate + added white (linear RGB): the gain is shading the quadratic missed, the added white a
//     sheen or a mirrored window. Only open plate is a probe: plastic seen through gaps in the print reads darker than
//     the plate and is not light. The field is smooth, so it is carried under the stamp from the plate around it, and
//     every ink there is divided out of the same light. That is the prior that tells light from print: light falls on
//     everything in a place at once, while a print's own gradient belongs to one ink.
//  2. Inks: k-means over the design's interior colours (Lab, lightness at half weight), close clusters merged. Every
//     design pixel joins its nearest ink.
//  3. Unreliable pixels: clipped glare (the crop at the sensor's top, nearly colourless) and the design's own edge,
//     where the photo blends the ink with the plastic. An edge pixel's ink is found by un-blending it from the plastic
//     (blend = t·ink + (1 − t)·plastic), not by nearest colour, which would make a dark line's edge on red plastic a
//     red-brown ink of its own.
//  4. Colour: an interior pixel keeps its own colour, lightly denoised among its own ink (a box of about 2 px at
//     2048), so a halftone, a gradient across a word and a foil's shards all survive. An edge pixel takes its ink's
//     colour from its reliable pixels nearby; a glare pixel, whose own colour says nothing of its ink, is filled from
//     the design around it.
//  5. Alpha: v1's final mask, anti-aliased by the same sub-pixel blur v1 draws with. Where the plastic shows through a
//     print (halftone, knocked-out line work) it shows through here too. Colour is carried past the edge so a filtered
//     texture never pulls in a fringe.
// The spike's other variants (each ink averaged, posterized, or flattened to one lightness on its own) turned a halftone
// face into blotches or flattened a print's own gradients; they are recorded in the write-up, not kept here.
import {rgbToLab,fillFromRing} from './disc-stamp-extract.mjs';
import {plastic} from './disc-stamp-clear.mjs';

// WL: lightness weight when telling inks apart (light moves lightness more than hue). GRID: light-probe cells across the
// crop. GUARD: plastic this close to the design (px at 1024) is not a probe; ink bleeds into it. HULL: plastic the design
// closes round (gaps up to twice this, px at 1024) is not a probe either: seen through a print it is not open plate.
const RING_PX=6,K=8,MERGE_DE=12,WL=.5,GRID=32,GUARD=8,HULL=32,CLIP=250,CLIP_CHROMA=.12;
// On a clear disc (`clear`): DEEP, the share of its ink a pixel must hold to lend its colour to the print around it;
// SPECK, the fewest pixels (at 1024) a mark of print has.
const DEEP=.9,SPECK=4;

const toLinear=new Float32Array(256);
for(let i=0;i<256;i++){const c=i/255;toLinear[i]=c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}
const encode=v=>{v=Math.min(1,Math.max(0,v));return Math.round(255*(v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055));};
// Lab (D65) to sRGB bytes, the inverse of rgbToLab.
const finv=t=>t>6/29?t*t*t:3*(6/29)**2*(t-4/29);
export function labToRgb(L,a,b){
 const fy=(L+16)/116,fx=fy+a/500,fz=fy-b/200,x=.95047*finv(fx),y=finv(fy),z=1.08883*finv(fz);
 return [encode(3.2406*x-1.5372*y-.4986*z),encode(-.9689*x+1.8758*y+.0415*z),encode(.0557*x-.204*y+1.057*z)];
}

// Box sum of `src` over a (2r+1)² window (separable running sums).
function box(src,size,r){
 const tmp=new Float32Array(size*size),out=new Float32Array(size*size);
 for(let j=0;j<size;j++){const row=j*size;let s=0;for(let t=0;t<=Math.min(r,size-1);t++)s+=src[row+t];
  for(let i=0;i<size;i++){tmp[row+i]=s;const add=i+r+1,sub=i-r;if(add<size)s+=src[row+add];if(sub>=0)s-=src[row+sub];}}
 for(let i=0;i<size;i++){let s=0;for(let t=0;t<=Math.min(r,size-1);t++)s+=tmp[t*size+i];
  for(let j=0;j<size;j++){out[j*size+i]=s;const add=j+r+1,sub=j-r;if(add<size)s+=tmp[add*size+i];if(sub>=0)s-=tmp[sub*size+i];}}
 return out;
}
// Chamfer distance (pixels) to the nearest set pixel of `mask`.
function distanceTo(mask,size){
 const D=new Float32Array(size*size).fill(1e9),s2=Math.SQRT2;
 for(let p=0;p<size*size;p++)if(mask[p])D[p]=0;
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){const p=j*size+i;let v=D[p];if(i)v=Math.min(v,D[p-1]+1);if(j){v=Math.min(v,D[p-size]+1);if(i)v=Math.min(v,D[p-size-1]+s2);if(i<size-1)v=Math.min(v,D[p-size+1]+s2);}D[p]=v;}
 for(let j=size-1;j>=0;j--)for(let i=size-1;i>=0;i--){const p=j*size+i;let v=D[p];if(i<size-1)v=Math.min(v,D[p+1]+1);if(j<size-1){v=Math.min(v,D[p+size]+1);if(i<size-1)v=Math.min(v,D[p+size+1]+s2);if(i)v=Math.min(v,D[p+size-1]+s2);}D[p]=v;}
 return D;
}
function gaussian(mask,size,sigma){
 const rad=Math.max(1,Math.ceil(sigma*2.5)),kern=[];let total=0;for(let t=-rad;t<=rad;t++){const v=Math.exp(-t*t/(2*sigma*sigma));kern.push(v);total+=v;}
 const tmp=new Float32Array(size*size),out=new Float32Array(size*size);
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){let v=0;for(let t=-rad;t<=rad;t++){const ii=Math.min(size-1,Math.max(0,i+t));v+=mask[j*size+ii]*kern[t+rad];}tmp[j*size+i]=v/total;}
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){let v=0;for(let t=-rad;t<=rad;t++){const jj=Math.min(size-1,Math.max(0,j+t));v+=tmp[jj*size+i]*kern[t+rad];}out[j*size+i]=v/total;}
 return out;
}
const median=a=>{const s=Float32Array.from(a).sort();return s.length?s[s.length>>1]:0;};
// The most of `src` within ±r (a square window, separable).
function maxFilter(src,size,r){
 const tmp=new Float32Array(size*size),out=new Float32Array(size*size);
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){let m=0;for(let t=Math.max(0,i-r);t<=Math.min(size-1,i+r);t++)m=Math.max(m,src[j*size+t]);tmp[j*size+i]=m;}
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){let m=0;for(let t=Math.max(0,j-r);t<=Math.min(size-1,j+r);t++)m=Math.max(m,tmp[t*size+i]);out[j*size+i]=m;}
 return out;
}

// Pull-push hole filling of a field with `channels` values per cell, weights W in 0..1 (1 = measured).
function pullPush(C,W,n,channels){
 const levels=[{C,W,n}];
 while(levels.at(-1).n>1){
  const {C:c,W:w,n:m}=levels.at(-1),h=Math.ceil(m/2),C2=new Float32Array(h*h*channels),W2=new Float32Array(h*h);
  for(let j=0;j<h;j++)for(let i=0;i<h;i++){let sw=0;const s=new Float64Array(channels);for(let dj=0;dj<2;dj++)for(let di=0;di<2;di++){const ii=2*i+di,jj=2*j+dj;if(ii>=m||jj>=m)continue;const q=jj*m+ii;if(!w[q])continue;sw+=w[q];for(let k=0;k<channels;k++)s[k]+=c[channels*q+k]*w[q];}const q=j*h+i;if(sw)for(let k=0;k<channels;k++)C2[channels*q+k]=s[k]/sw;W2[q]=Math.min(1,sw);}
  levels.push({C:C2,W:W2,n:h});
 }
 for(let l=levels.length-2;l>=0;l--){
  const {C:c,W:w,n:m}=levels[l],{C:U,n:h}=levels[l+1];
  for(let j=0;j<m;j++)for(let i=0;i<m;i++){const q=j*m+i;if(w[q]>=1)continue;const u=channels*(Math.min(h-1,j>>1)*h+Math.min(h-1,i>>1));for(let k=0;k<channels;k++)c[channels*q+k]=w[q]*c[channels*q+k]+(1-w[q])*U[u+k];}
 }
}

function kmeans(points,k){
 const n=points.length/3,centres=[];let first=0;for(let i=1;i<n;i++)if(points[3*i]<points[3*first])first=i;
 centres.push([points[3*first],points[3*first+1],points[3*first+2]]);
 const stride=Math.max(1,n/6000|0);
 while(centres.length<k){let best=0,bd=-1;for(let i=0;i<n;i+=stride){let d=Infinity;for(const c of centres)d=Math.min(d,(points[3*i]-c[0])**2+(points[3*i+1]-c[1])**2+(points[3*i+2]-c[2])**2);if(d>bd){bd=d;best=i;}}if(bd<=0)break;centres.push([points[3*best],points[3*best+1],points[3*best+2]]);}
 const counts=new Float64Array(centres.length);
 for(let it=0;it<20;it++){
  const s=centres.map(()=>[0,0,0,0]);
  for(let i=0;i<n;i++){let b=0,bd=Infinity;for(let ci=0;ci<centres.length;ci++){const c=centres[ci],d=(points[3*i]-c[0])**2+(points[3*i+1]-c[1])**2+(points[3*i+2]-c[2])**2;if(d<bd){bd=d;b=ci;}}const t=s[b];t[0]+=points[3*i];t[1]+=points[3*i+1];t[2]+=points[3*i+2];t[3]++;}
  centres.forEach((c,ci)=>{counts[ci]=s[ci][3];if(s[ci][3])for(let d=0;d<3;d++)c[d]=s[ci][d]/s[ci][3];});
 }
 const inks=centres.map((lab,ci)=>({lab,count:counts[ci]})).filter(c=>c.count);
 for(let merged=true;merged;){merged=false;outer:for(let a=0;a<inks.length;a++)for(let b=a+1;b<inks.length;b++){const A=inks[a],B=inks[b];if(Math.hypot(...A.lab.map((v,q)=>v-B.lab[q]))<MERGE_DE){const n2=A.count+B.count;A.lab=A.lab.map((v,q)=>(v*A.count+B.lab[q]*B.count)/n2);A.count=n2;inks.splice(b,1);merged=true;break outer;}}}
 return inks;
}

// 1. The light on the plate, per GRID cell: gain and added white (linear), fitted to the bare plastic's median colour
// against the whole plate's median, pull-push filled under the design and smoothed. Returns a per-pixel lookup.
export function lightField(data,size,mask,inside){
 const N=size*size,k=size/1024,away=distanceTo(mask,size),cell=size/GRID,R=HULL*k;
 // The design's footprint: the mask closed with radius R (grown by R, then shrunk by R).
 const grown=new Uint8Array(N);for(let p=0;p<N;p++)grown[p]=away[p]<=R?0:1;
 const footprint=distanceTo(grown,size);
 const cells=Array.from({length:GRID*GRID},()=>[[],[],[]]),all=[[],[],[]];
 for(let p=0;p<N;p+=2){
  if(!inside[p]||mask[p]||away[p]<GUARD*k||footprint[p]>R)continue;
  const q=Math.min(GRID-1,((p/size)|0)/cell|0)*GRID+Math.min(GRID-1,(p%size)/cell|0);
  for(let c=0;c<3;c++){const v=toLinear[data[4*p+c]];cells[q][c].push(v);if((p&15)===0)all[c].push(v);}
 }
 const P=all.map(median),PP=P[0]*P[0]+P[1]*P[1]+P[2]*P[2],P1=P[0]+P[1]+P[2],det=3*PP-P1*P1;
 const C=new Float32Array(GRID*GRID*2),W=new Float32Array(GRID*GRID),full=cell*cell/2*.25;
 for(let q=0;q<GRID*GRID;q++){
  const n=cells[q][0].length;if(!n||Math.abs(det)<1e-9)continue;
  const o=cells[q].map(median),Po=P[0]*o[0]+P[1]*o[1]+P[2]*o[2],o1=o[0]+o[1]+o[2];
  // o ≈ s·P + w·(1,1,1): least squares in the two unknowns.
  let s=(3*Po-P1*o1)/det,w=(PP*o1-P1*Po)/det;
  s=Math.min(1.6,Math.max(.6,s));w=Math.min(.5,Math.max(0,w));
  C[2*q]=s;C[2*q+1]=w;W[q]=Math.min(1,n/full);
 }
 if(!W.some(v=>v))return {gain:()=>1,white:()=>0,stats:{cells:0}};
 pullPush(C,W,GRID,2);
 // A 3 × 3 mean: light is smooth, one cell's scuff or speck is not light.
 const S=new Float32Array(GRID*GRID*2);
 for(let j=0;j<GRID;j++)for(let i=0;i<GRID;i++){let n=0,a=0,b=0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=GRID||jj>=GRID)continue;const q=jj*GRID+ii;a+=C[2*q];b+=C[2*q+1];n++;}S[2*(j*GRID+i)]=a/n;S[2*(j*GRID+i)+1]=b/n;}
 const at=(p,c)=>{const x=p%size,y=(p-x)/size,gx=Math.min(GRID-1,Math.max(0,(x+.5)/cell-.5)),gy=Math.min(GRID-1,Math.max(0,(y+.5)/cell-.5)),a=gx|0,b=gy|0,fx=gx-a,fy=gy-b,a1=Math.min(GRID-1,a+1),b1=Math.min(GRID-1,b+1);
  return (S[2*(b*GRID+a)+c]*(1-fx)+S[2*(b*GRID+a1)+c]*fx)*(1-fy)+(S[2*(b1*GRID+a)+c]*(1-fx)+S[2*(b1*GRID+a1)+c]*fx)*fy;};
 let lo=Infinity,hi=-Infinity,most=0;for(let q=0;q<GRID*GRID;q++){lo=Math.min(lo,S[2*q]);hi=Math.max(hi,S[2*q]);most=Math.max(most,S[2*q+1]);}
 return {gain:p=>at(p,0),white:p=>at(p,1),stats:{cells:W.filter(v=>v>0).length,gain:[+lo.toFixed(3),+hi.toFixed(3)],white:+most.toFixed(3)}};
}

/**
 * data: RGBA of the de-lit size × size crop. raw: the same crop before de-lighting (glare is read off it). mask: v1's
 * final binary design mask (size²). plateColor: '#rrggbb', the colour delightPixels measured. plate: the plate's reach
 * as a share of the radius (as v1). `glare`: pixels already known to hold no print (disc-stamp-delight.mjs's unreliable
 * mask), in-painted like clipped glare. `filled`: pixels the light stage filled with print cloned from nearby, which `raw`
 * still shows clipped; they are kept as they are. Returns {rgba (Uint8ClampedArray, straight alpha), inks, stats}.
 */
export function extractStampColor(data,raw,size,mask,plateColor,{plate=.8,glare:unreliable=null,filled=null,clear=false}={}){
 const N=size*size,k=size/1024,c0=size/2,reach=plate*size/2-6*k,inside=new Uint8Array(N);
 for(let p=0;p<N;p++){const i=p%size,j=(p-i)/size;inside[p]=data[4*p+3]>=250&&Math.hypot(i+.5-c0,j+.5-c0)<=reach?1:0;}
 // 1. The light, divided out of every design pixel.
 const light=lightField(data,size,mask,inside),lab=new Float32Array(N*3);
 for(let p=0;p<N;p++){
  if(!mask[p])continue;const s=light.gain(p),w=light.white(p),rgb=[0,1,2].map(c=>encode((toLinear[data[4*p+c]]-w)/s));
  const L=rgbToLab(rgb[0],rgb[1],rgb[2]);lab[3*p]=L[0];lab[3*p+1]=L[1];lab[3*p+2]=L[2];
 }
 const P=rgbToLab(...[1,3,5].map(i=>parseInt(plateColor.slice(i,i+2),16)));
 // 3. Unreliable: clipped glare, and the design's edge.
 const outside=new Uint8Array(N);for(let p=0;p<N;p++)outside[p]=mask[p]?0:1;
 const depth=distanceTo(outside,size),edge=Math.max(1,1.2*k),glare=new Uint8Array(N),reliable=new Uint8Array(N);let glared=0,designArea=0;
 for(let p=0;p<N;p++){if(!mask[p])continue;designArea++;if(unreliable?.[p]){glare[p]=1;glared++;continue;}if(filled?.[p])continue;const r=raw[4*p],g=raw[4*p+1],b=raw[4*p+2],hi=Math.max(r,g,b);if(hi>=CLIP&&(hi-Math.min(r,g,b))/hi<CLIP_CHROMA){glare[p]=1;glared++;}}
 // A glare spot's soft rim (light blended with the ink, not clipped) is glare too.
 if(glared){const near=distanceTo(glare,size),rim=Math.max(2,2*k);for(let p=0;p<N;p++)if(mask[p]&&!glare[p]&&!filled?.[p]&&near[p]<=rim){glare[p]=1;glared++;}}
 for(let p=0;p<N;p++)reliable[p]=mask[p]&&!glare[p]&&depth[p]>edge?1:0;
 // A stroke too thin to have an interior keeps its own pixels (glare aside): it would otherwise borrow nothing.
 const core=box(Float32Array.from(reliable),size,Math.ceil(2*k));for(let p=0;p<N;p++)if(mask[p]&&!glare[p]&&!reliable[p]&&core[p]===0)reliable[p]=1;
 // 2. Inks, from a sample of the reliable pixels.
 const sample=[],step=Math.max(1,Math.round(k*k));let seen=0;
 for(let p=0;p<N;p++)if(reliable[p]&&(seen++%step===0))sample.push(WL*lab[3*p],lab[3*p+1],lab[3*p+2]);
 if(sample.length<30)throw Error('This stamp has too little colour to read.');
 const inks=kmeans(Float32Array.from(sample),K),label=new Uint8Array(N).fill(255);
 for(let p=0;p<N;p++){if(!mask[p])continue;let b=0,bd=Infinity;for(let c=0;c<inks.length;c++){const I=inks[c].lab,d=(WL*lab[3*p]-I[0])**2+(lab[3*p+1]-I[1])**2+(lab[3*p+2]-I[2])**2;if(d<bd){bd=d;b=c;}}label[p]=b;}
 for(const ink of inks)ink.lab[0]/=WL;
 for(let p=0;p<N;p++){
  if(!mask[p]||reliable[p])continue;
  const x=[lab[3*p]-P[0],lab[3*p+1]-P[1],lab[3*p+2]-P[2]];let best=label[p],bd=Infinity;
  for(let c=0;c<inks.length;c++){const I=inks[c].lab,v=[I[0]-P[0],I[1]-P[1],I[2]-P[2]],vv=v[0]**2+v[1]**2+v[2]**2||1,t=Math.min(1,Math.max(0,(x[0]*v[0]+x[1]*v[1]+x[2]*v[2])/vv));if(t<1/3)continue;const d=(x[0]-t*v[0])**2+(x[1]-t*v[1])**2+(x[2]-t*v[2])**2;if(d<bd){bd=d;best=c;}}
  label[p]=best;
 }
 // Clear (docs/clear-stamp-clean.md): print only, at full alpha, in its ink's own colour. An ink that is the plastic's
 // own colour (disc-stamp-clear.mjs plastic: glare, scratches, a shadow, an emboss) is no ink, and its pixels go. Every
 // other pixel holds some share t of its ink (from the plate to the ink, as the edge un-blend reads it). A mark stays
 // where it holds at least half the most its stroke holds nearby (a hairline the photo blurred keeps its width, cut at
 // half its depth), and only as part of a mark that somewhere is nearer its ink than the plate: a soft plate-dark patch
 // never is. Only pixels that are mostly ink (deep) lend their colour; the rest take it from them. Glare is decided on
 // the colour it is filled with, below.
 let kept=null,source=reliable;
 if(clear){
  const isPlastic=plastic(P),inkPlastic=inks.map(ink=>isPlastic(...ink.lab)),cover=new Float32Array(N),near=new Uint8Array(N);
  for(let p=0;p<N;p++){
   if(!mask[p]||glare[p]||inkPlastic[label[p]])continue;
   const I=inks[label[p]].lab,v=[I[0]-P[0],I[1]-P[1],I[2]-P[2]],x=[lab[3*p]-P[0],lab[3*p+1]-P[1],lab[3*p+2]-P[2]];
   cover[p]=Math.max(1e-3,Math.min(1,(x[0]*v[0]+x[1]*v[1]+x[2]*v[2])/(v[0]**2+v[1]**2+v[2]**2||1)));
   near[p]=Math.hypot(x[0]-v[0],x[1]-v[1],x[2]-v[2])<Math.hypot(x[0],x[1],x[2])?1:0;
  }
  const peak=maxFilter(cover,size,Math.max(1,Math.round(2*k)));
  kept=new Uint8Array(N);source=new Uint8Array(N);
  const stack=[];
  for(let p=0;p<N;p++)if(near[p]&&cover[p]>=.5*peak[p]){kept[p]=1;stack.push(p);}
  while(stack.length){const p=stack.pop(),i=p%size,j=(p-i)/size;
   for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=size||jj>=size)continue;const q=jj*size+ii;if(!kept[q]&&cover[q]&&cover[q]>=.5*peak[q]){kept[q]=1;stack.push(q);}}}
  for(let p=0;p<N;p++){if(glare[p])kept[p]=1;source[p]=kept[p]&&reliable[p]&&(depth[p]>edge||cover[p]>=DEEP)?1:0;}
 }
 // 4. Colour per ink: reliable pixels lightly denoised among their own ink (r), the rest from their ink nearby (far).
 const out=new Float32Array(N*3),have=new Uint8Array(N),r=Math.max(1,Math.round(k)),far=Math.max(2,Math.round(3*k));
 const w=new Float32Array(N),ch=[new Float32Array(N),new Float32Array(N),new Float32Array(N)];
 for(let c=0;c<inks.length;c++){
  w.fill(0);for(const a of ch)a.fill(0);
  for(let p=0;p<N;p++)if(label[p]===c&&source[p]){w[p]=1;for(let q=0;q<3;q++)ch[q][p]=lab[3*p+q];}
  const W=box(w,size,r),S=ch.map(a=>box(a,size,r)),W2=box(w,size,far),S2=ch.map(a=>box(a,size,far));
  for(let p=0;p<N;p++){
   if(label[p]!==c||glare[p]||kept&&!kept[p])continue;have[p]=1;
   if(W[p]>0)for(let q=0;q<3;q++)out[3*p+q]=S[q][p]/W[p];
   else if(W2[p]>0)for(let q=0;q<3;q++)out[3*p+q]=S2[q][p]/W2[p];
   else for(let q=0;q<3;q++)out[3*p+q]=inks[c].lab[q];
  }
 }
 // Glare is in-painted from the design around it, as plain print. v3.1 (docs/photo-stamp-one-click.md): each glare patch
 // takes the ink(s) of the ring of coloured pixels around it (fillFromRing: the dominant ink, or the nearer of two that
 // share the ring) in that ink's own mean colour there. The mean of everything around (v2) blended a face's lines and
 // fills into a colour neither has, a smudge. A patch with no ink around it falls back to that mean.
 if(glared){
  const {label:fill,rings}=fillFromRing(glare,have,p=>label[p]===255?-1:label[p],size,Math.round(RING_PX*k)),ids=new Int32Array(N).fill(-1);
  const means=rings.map(groups=>new Map([...groups].map(([ink,list])=>{const m=[0,0,0];for(const p of list)for(let q=0;q<3;q++)m[q]+=out[3*p+q];return [ink,m.map(v=>v/list.length)];})));
  // Which patch each glare pixel is in, to read its own ring's means.
  let patch=0;const stack=[];
  for(let p0=0;p0<N;p0++){if(!glare[p0]||ids[p0]>=0)continue;ids[p0]=patch;stack.push(p0);
   while(stack.length){const p=stack.pop(),i=p%size,j=(p-i)/size;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=size||jj>=size)continue;const q=jj*size+ii;if(glare[q]&&ids[q]<0){ids[q]=patch;stack.push(q);}}}
   patch++;}
  const todo=new Uint8Array(N);
  for(let p=0;p<N;p++){if(!glare[p])continue;const m=fill[p]>=0&&means[ids[p]]?.get(fill[p]);if(m){for(let q=0;q<3;q++)out[3*p+q]=m[q];have[p]=1;}else todo[p]=1;}
  // Clear: a patch with no print in its own ring is not print (the wider fill below would reach the nearest ink).
  if(clear)for(let p=0;p<N;p++)if(todo[p])kept[p]=0;
  const hv=Float32Array.from(have),sums=[0,1,2].map(q=>{const a=new Float32Array(N);for(let p=0;p<N;p++)if(have[p])a[p]=out[3*p+q];return a;});
  for(let radius=Math.max(2,Math.round(2*k));radius<=64*k;radius*=2){
   const W=box(hv,size,radius),S=sums.map(a=>box(a,size,radius));let left=0;
   for(let p=0;p<N;p++){if(!todo[p])continue;if(W[p]>0){for(let q=0;q<3;q++)out[3*p+q]=S[q][p]/W[p];todo[p]=0;}else left++;}
   if(!left)break;
  }
  for(let p=0;p<N;p++)if(glare[p]&&!todo[p])have[p]=1;
 }
 // Clear: a glare patch filled with the plastic's colour is no print either.
 if(clear){const isPlastic=plastic(P);for(let p=0;p<N;p++)if(glare[p]&&(!kept[p]||!have[p]||isPlastic(out[3*p],out[3*p+1],out[3*p+2]))){kept[p]=0;have[p]=0;}}
 // Clear: a speck of a few pixels (under SPECK at 1024) is no print: the photo's grain, or glare's edge.
 if(clear){
  const seen=new Uint8Array(N),stack=[],list=[];
  for(let p0=0;p0<N;p0++){if(!kept[p0]||seen[p0])continue;seen[p0]=1;stack.push(p0);list.length=0;
   while(stack.length){const p=stack.pop(),i=p%size,j=(p-i)/size;list.push(p);for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=size||jj>=size)continue;const q=jj*size+ii;if(kept[q]&&!seen[q]){seen[q]=1;stack.push(q);}}}
   if(list.length<SPECK*k*k)for(const p of list){kept[p]=0;have[p]=0;}}
 }
 // Colour for every pixel past the edge: pull-push from the design, so a filtered texture never reaches an undefined
 // colour.
 pullPush(out,Float32Array.from(have),size,3);
 // Clear: a pixel is print at full alpha or not in the asset; the texture's own filtering smooths the edge.
 const alpha=clear?null:gaussian(mask,size,.6*k),rgba=new Uint8ClampedArray(N*4);
 for(let p=0;p<N;p++){const [R,G,B]=labToRgb(out[3*p],out[3*p+1],out[3*p+2]);rgba[4*p]=R;rgba[4*p+1]=G;rgba[4*p+2]=B;rgba[4*p+3]=clear?(kept[p]?255:0):Math.round(255*Math.min(1,alpha[p]));}
 return {rgba,...clear&&{kept},inks:inks.map(ink=>({L:+ink.lab[0].toFixed(1),a:+ink.lab[1].toFixed(1),b:+ink.lab[2].toFixed(1),share:+(ink.count/(sample.length/3)).toFixed(3)})),
  stats:{glare:+(glared/Math.max(1,designArea)).toFixed(4),inks:inks.length,light:light.stats}};
}
