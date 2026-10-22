// Photo stamps v3.1 (docs/photo-stamp-one-click.md): the game asset is flat print, with no camera light in it. The 3D
// model lights the asset; a photo's glare is part of the photo, not of the disc, so it must not be baked in. This runs
// upstream of both looks (the one-ink mask, disc-stamp-extract.mjs, and the full-colour layer, disc-stamp-color.mjs),
// on the crop delightPixels (disc-albedo.mjs, softenGlare:false) has already de-lit with its smooth quadratic, and
// takes out the light that quadratic cannot follow: a flash or bulb hotspot, a mirrored window, residual shading.
// Pure JS, no DOM: the editor's worker and Node tests both run it. Every constant is disc-independent.
//
// Shading and vignette are already out: delightPixels divides by its quadratic, and the colour layer's light probe
// (disc-stamp-color.mjs lightField) takes what the quadratic missed on open plastic. What neither can follow is light
// ADDED on top: a hotspot, a mirrored window. Model, in linear light, per pixel: crop = g · print + white, the print one of
// a few materials (the plastic and the stamp's inks), `white` the glare (light reflected off the gloss, the light's
// colour, neutral after white balance), a smooth field on a CELL grid. v2's prior, generalised: light falls on
// everything in a place at once, while a print's own gradient belongs to one ink. So:
//  1. Each pixel is read as the material that explains it best with the least white (the dichromatic fit: g, its
//     shading, and its white, by least squares), so a glare-lifted blue reads as blue plus white, not as silver ink.
//  2. White is measured on every material at once: in each cell, each material's median excess over its own colour, and
//     the cell takes the SMALLEST of them. A print that fades toward cream is one material and cannot pass as light; a
//     hotspot lifts the plastic and every ink alike. A cell with one ink and no plastic says nothing about light and is
//     filled from its neighbours. Materials come from k-means over the crop with the current light taken out, refined
//     over a few passes, starting from the plastic alone.
//  3. Unreliable pixels: where the camera clipped (`raw` at the sensor's top), or the glare is far brighter than the
//     plastic's own light (GLARE_RATIO; a camera's tone curve rolls off there), no print survives to recover. They are in-painted from the nearest reliable print, so a stroke
//     running into the core runs on and nothing reads as a highlight or a hole. The mask decides them from the design around them
//     (disc-stamp-extract.mjs `unknown`); the colour layer in-paints them from the design around them, as it does clipped
//     glare (disc-stamp-color.mjs `glare`).
//  4. `stored`: the source is the site's stored texture (the one-click path), which was de-lit with glare softening at
//     upload. That pass compressed every hotspot toward (KNEE + ROOM) × the plastic around it and replaced its clipped
//     core with that plastic, a smooth fill. Its halo still holds the print, only with its white squeezed; the core
//     holds none. So the core is where the white sits at that ceiling over a patch with no texture of its own: there the
//     stored copy no longer holds the print, and it is unreliable too. (Flat plastic caught by the same test is in-painted
//     with flat plastic, which changes nothing.)
// Output: the crop rewritten in place as the recovered print, the unreliable mask, where light was taken out (`lit`), and
// the plastic measured again on it.
import {plateColor,GLARE_CEILING} from './disc-albedo.mjs';

// CELL: grid cell (px at 2048). WHITE_MIN: white below this (linear) is noise, not glare. GLARE_RATIO, GLARE_FLOOR: white
// more than this × the plastic's luminance, and above the floor (linear), is unreliable. STORED_RING, FLAT, PLATEAU, CORE_REACH: the
// stored texture's softened core, flooded from a white peak of at least STORED_RING × the ceiling over the plastic through
// pixels whose luminance varies locally less than FLAT × its own and sits within PLATEAU of the peak's, that carry at
// least PEAK_SHARE of the peak's white, at most CORE_REACH px (at 2048) from it.
// CAP: a pixel's white is at most this × the most its neighbouring cells found. CLIPPED_SHARE: a clipped pixel is glare
// when the white found there is at least this share of its luminance. SHARE: a material counts in
// a cell with at least this share of its pixels. K, MERGE_DE: materials, and how close two are to merge (ΔE). LIT_MATCH: a material within this
// (relative) of another plus white is that one, lit.
const CELL=16,WHITE_MIN=.012,GLARE_RATIO=3,GLARE_FLOOR=.5,STORED_RING=.8,FLAT=.06,PLATEAU=.08,PEAK_SHARE=.4,CORE_REACH=240,CAP=1.25,CLIPPED_SHARE=.3,LIT_MATCH=.04,SHARE=.12,K=8,MERGE_DE=10,WL=.5,PASSES=3,CLIP=250;

const toLinear=new Float32Array(256);
for(let i=0;i<256;i++){const c=i/255;toLinear[i]=c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}
const STEPS=4096,toSRGB=new Uint8ClampedArray(STEPS+1);
for(let i=0;i<=STEPS;i++){const c=i/STEPS;toSRGB[i]=Math.round(255*(c<=.0031308?c*12.92:1.055*c**(1/2.4)-.055));}
const encode=v=>toSRGB[v<=0?0:v>=1?STEPS:Math.round(v*STEPS)];
const luma=(r,g,b)=>.2126*r+.7152*g+.0722*b;
const f=t=>t>216/24389?Math.cbrt(t):(24389/27*t+16)/116;
// Lab from linear RGB (D65), as disc-stamp-extract.mjs rgbToLab does from bytes.
function lab(R,G,B,out,at){
 const fx=f((.4124*R+.3576*G+.1805*B)/.95047),fy=f(.2126*R+.7152*G+.0722*B),fz=f((.0193*R+.1192*G+.9505*B)/1.08883);
 out[at]=116*fy-16;out[at+1]=500*(fx-fy);out[at+2]=200*(fy-fz);
}
const median=a=>{if(!a.length)return 0;const s=Float32Array.from(a).sort();return s[s.length>>1];};

// Pull-push hole filling of a grid field, `channels` values per cell, weights W in 0..1 (1 = measured).
function pullPush(C,W,n,channels){
 const levels=[{C,W,n}];
 while(levels.at(-1).n>1){
  const {C:c,W:w,n:m}=levels.at(-1),h=Math.ceil(m/2),C2=new Float32Array(h*h*channels),W2=new Float32Array(h*h);
  for(let j=0;j<h;j++)for(let i=0;i<h;i++){let sw=0;const s=new Float64Array(channels);for(let dj=0;dj<2;dj++)for(let di=0;di<2;di++){const ii=2*i+di,jj=2*j+dj;if(ii>=m||jj>=m)continue;const q=jj*m+ii;if(!w[q])continue;sw+=w[q];for(let k=0;k<channels;k++)s[k]+=c[channels*q+k]*w[q];}const q=j*h+i;if(sw)for(let k=0;k<channels;k++)C2[channels*q+k]=s[k]/sw;W2[q]=Math.min(1,sw);}
  levels.push({C:C2,W:W2,n:h});
 }
 for(let l=levels.length-2;l>=0;l--){
  const {C:c,W:w,n:m}=levels[l],{C:U,n:h}=levels[l+1];
  for(let j=0;j<m;j++)for(let i=0;i<m;i++){const q=j*m+i;if(w[q]>=1)continue;
   const x=Math.min(h-1,Math.max(0,(i+.5)/2-.5)),y=Math.min(h-1,Math.max(0,(j+.5)/2-.5)),a=x|0,b=y|0,fx=x-a,fy=y-b,a1=Math.min(h-1,a+1),b1=Math.min(h-1,b+1);
   for(let k=0;k<channels;k++){const v=(U[channels*(b*h+a)+k]*(1-fx)+U[channels*(b*h+a1)+k]*fx)*(1-fy)+(U[channels*(b1*h+a)+k]*(1-fx)+U[channels*(b1*h+a1)+k]*fx)*fy;c[channels*q+k]=w[q]*c[channels*q+k]+(1-w[q])*v;}}
 }
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
// A 3 × 3 median of a grid field: a lone cell's sparkle is not light, while a hotspot's plateau keeps its height.
function median3(F,n){
 const out=new Float32Array(n*n),v=[];
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){v.length=0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii>=0&&jj>=0&&ii<n&&jj<n)v.push(F[jj*n+ii]);}v.sort((a,b)=>a-b);out[j*n+i]=v[v.length>>1];}
 return out;
}
// Bilinear lookup of a cell field at every pixel.
function upsample(F,n,size){
 const out=new Float32Array(size*size),cell=size/n;
 for(let y=0;y<size;y++){const gy=Math.min(n-1,Math.max(0,(y+.5)/cell-.5)),b=gy|0,fy=gy-b,b1=Math.min(n-1,b+1);
  for(let x=0;x<size;x++){const gx=Math.min(n-1,Math.max(0,(x+.5)/cell-.5)),a=gx|0,fx=gx-a,a1=Math.min(n-1,a+1);
   out[y*size+x]=(F[b*n+a]*(1-fx)+F[b*n+a1]*fx)*(1-fy)+(F[b1*n+a]*(1-fx)+F[b1*n+a1]*fx)*fy;}}
 return out;
}
function kmeans(points,k){
 const n=points.length/3,centres=[];let first=0;for(let i=1;i<n;i++)if(points[3*i]<points[3*first])first=i;
 centres.push([points[3*first],points[3*first+1],points[3*first+2]]);
 while(centres.length<k){let best=0,bd=-1;for(let i=0;i<n;i++){let d=Infinity;for(const c of centres)d=Math.min(d,(points[3*i]-c[0])**2+(points[3*i+1]-c[1])**2+(points[3*i+2]-c[2])**2);if(d>bd){bd=d;best=i;}}if(bd<=0)break;centres.push([points[3*best],points[3*best+1],points[3*best+2]]);}
 const label=new Uint8Array(n);
 for(let it=0;it<15;it++){
  const s=centres.map(()=>[0,0,0,0]);
  for(let i=0;i<n;i++){let b=0,bd=Infinity;for(let ci=0;ci<centres.length;ci++){const c=centres[ci],d=(points[3*i]-c[0])**2+(points[3*i+1]-c[1])**2+(points[3*i+2]-c[2])**2;if(d<bd){bd=d;b=ci;}}label[i]=b;const t=s[b];t[0]+=points[3*i];t[1]+=points[3*i+1];t[2]+=points[3*i+2];t[3]++;}
  centres.forEach((c,ci)=>{if(s[ci][3])for(let d=0;d<3;d++)c[d]=s[ci][d]/s[ci][3];});
 }
 const list=centres.map((c,ci)=>({lab:c,members:[]}));for(let i=0;i<n;i++)list[label[i]].members.push(i);
 return list.filter(c=>c.members.length);
}
// The dichromatic fit of one pixel D against each material A: D ≈ g·A + s·(1,1,1), g in [.6, 1.6] (shading), s ≥ 0
// (white), by least squares. A neutral material cannot tell shading from white; there g is 1. Returns the material that
// explains the pixel best with the least white (cost: residual plus a little of the white, over the pixel's brightness),
// its white and residual in `fitted`.
const fitted={s:0,r:0};
function fit(fits,D0,D1,D2,scale){
 const Dsum=D0+D1+D2;let best=-1,cost=Infinity;
 for(let m=0;m<fits.length;m++){
  const {A,AA,A1,d,flat}=fits[m],AD=A[0]*D0+A[1]*D1+A[2]*D2;
  let g=1,s;
  if(flat)s=(Dsum-A1)/3;
  else{g=Math.min(1.6,Math.max(.6,(3*AD-A1*Dsum)/d));s=(Dsum-g*A1)/3;}
  if(s<0){s=0;if(!flat)g=Math.min(1.6,Math.max(.6,AD/(AA||1)));}
  const r=Math.hypot(D0-g*A[0]-s,D1-g*A[1]-s,D2-g*A[2]-s),c=(r+.15*s)/scale;
  if(c<cost){cost=c;best=m;fitted.s=s;fitted.r=r;}
 }
 return best;
}
// Pull-push filling of a full-size scalar field over its unweighted pixels (W 0), in place.
function fillHoles(F,W,size){
 const levels=[{F,W,n:size}];
 while(levels.at(-1).n>1){
  const {F:f,W:w,n}=levels.at(-1),m=Math.ceil(n/2),F2=new Float32Array(m*m),W2=new Float32Array(m*m);
  for(let j=0;j<m;j++)for(let i=0;i<m;i++){let s=0,sw=0;for(let dj=0;dj<2;dj++)for(let di=0;di<2;di++){const ii=2*i+di,jj=2*j+dj;if(ii>=n||jj>=n)continue;const q=jj*n+ii;if(!w[q])continue;s+=f[q]*w[q];sw+=w[q];}const q=j*m+i;if(sw)F2[q]=s/sw;W2[q]=Math.min(1,sw);}
  levels.push({F:F2,W:W2,n:m});
 }
 for(let l=levels.length-2;l>=0;l--){
  const {F:f,W:w,n}=levels[l],{F:U,n:m}=levels[l+1];
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const q=j*n+i;if(w[q]>=1)continue;
   const x=Math.min(m-1,Math.max(0,(i+.5)/2-.5)),y=Math.min(m-1,Math.max(0,(j+.5)/2-.5)),a=x|0,b=y|0,fx=x-a,fy=y-b,a1=Math.min(m-1,a+1),b1=Math.min(m-1,b+1);
   f[q]=w[q]*f[q]+(1-w[q])*((U[b*m+a]*(1-fx)+U[b*m+a1]*fx)*(1-fy)+(U[b1*m+a]*(1-fx)+U[b1*m+a1]*fx)*fy);}
 }
}

/**
 * data: RGBA bytes of the size × size crop, de-lit by delightPixels (softenGlare:false); rewritten in place.
 * raw: the same crop before de-lighting (clipping is read off it), or null. plateColor: '#rrggbb' as delightPixels
 * measured it. plate: the plate's reach as a share of the radius. stored: the crop is the site's stored texture.
 * Returns {unreliable (Uint8Array, size²), plateColor, stats}.
 */
export function delightStamp(data,raw,size,{plate=.8,plateColor:plateHex,stored=false,debug=false}={}){
 const N=size*size,k=size/2048,n=Math.max(8,Math.round(size/(CELL*k))),cell=size/n,c0=size/2,reach=Math.min(size/2,(plate*size/2)+4*k);
 const inside=new Uint8Array(N),R=new Float32Array(N),G=new Float32Array(N),B=new Float32Array(N),cellOf=new Int32Array(N);
 for(let p=0;p<N;p++){const i=p%size,j=(p-i)/size;cellOf[p]=Math.min(n-1,j/cell|0)*n+Math.min(n-1,i/cell|0);
  if(data[4*p+3]<250||Math.hypot(i+.5-c0,j+.5-c0)>reach)continue;inside[p]=1;R[p]=toLinear[data[4*p]];G[p]=toLinear[data[4*p+1]];B[p]=toLinear[data[4*p+2]];}
 const P=[1,3,5].map(i=>toLinear[parseInt(plateHex.slice(i,i+2),16)]),PP=P[0]**2+P[1]**2+P[2]**2,P1=P[0]+P[1]+P[2],det=3*PP-P1*P1,neutral=det<.02*3*PP,Plum=Math.max(.02,luma(...P));
 // Clipped by the camera: neutral at the sensor's top, or any channel there under light (a red plastic clips in red first).
 const clipped=new Uint8Array(N);
 if(raw)for(let p=0;p<N;p++){if(!inside[p])continue;const r=raw[4*p],g=raw[4*p+1],b=raw[4*p+2],hi=Math.max(r,g,b);if(hi>=CLIP&&((hi-Math.min(r,g,b))/hi<.15||Math.min(r,g,b)>=.6*CLIP))clipped[p]=1;}

 // 0. Start from the plastic alone: a pixel that reads as gain × plastic + white, for some gain near 1, is plastic.
 let white=new Float32Array(n*n);
 {
  const vals=Array.from({length:n*n},()=>[]);
  for(let p=0;p<N;p+=2){if(!inside[p]||clipped[p])continue;const D=[R[p],G[p],B[p]],PD=P[0]*D[0]+P[1]*D[1]+P[2]*D[2],D1=D[0]+D[1]+D[2];
   let g=1,s;if(neutral)s=(D1-P1)/3;else{g=(3*PD-P1*D1)/det;s=(PP*D1-P1*PD)/det;}
   if(g<.7||g>1.4)continue;s=Math.max(0,s);
   const e=Math.hypot(D[0]-g*P[0]-s,D[1]-g*P[1]-s,D[2]-g*P[2]-s)/(Math.hypot(g*P[0],g*P[1],g*P[2])+.01);
   if(e<.12)vals[cellOf[p]].push(s);}
  const W=new Float32Array(n*n),full=cell*cell/2*.2;
  for(let q=0;q<n*n;q++)if(vals[q].length){white[q]=median(vals[q]);W[q]=Math.min(1,vals[q].length/full);}
  pullPush(white,W,n,1);
 }
 // No pixel holds less light than its own darkest channel: the white field never exceeds it (a dark ink pins it).
 const bound=new Float32Array(n*n).fill(Infinity);
 {const lows=Array.from({length:n*n},()=>[]);for(let p=0;p<N;p+=2)if(inside[p]&&!clipped[p])lows[cellOf[p]].push(Math.min(R[p],G[p],B[p]));
  for(let q=0;q<n*n;q++)if(lows[q].length>=8){const s=Float32Array.from(lows[q]).sort();bound[q]=s[Math.floor(s.length*.02)];}}
 const settle=()=>{for(let q=0;q<n*n;q++){white[q]=Math.max(0,Math.min(white[q],bound[q]));}white=median3(white,n);for(let q=0;q<n*n;q++)if(white[q]<WHITE_MIN)white[q]=0;};
 settle();

 // 1–2. Materials, then each pixel read as g × material + white, and white from every material at once; a few passes.
 let materials=[],fits=[],S=upsample(white,n,size);const one=new Float32Array(3);
 for(let pass=0;pass<PASSES;pass++){
  // Materials from the pixels the current light leaves least lit, so glare does not become an "ink".
  const sample=[],rgbs=[],stride=Math.max(1,Math.round(N/60000));
  for(let p=0;p<N;p+=stride){if(!inside[p]||clipped[p]||S[p]>=.25*Plum)continue;const u=[R[p]-S[p],G[p]-S[p],B[p]-S[p]];lab(u[0],u[1],u[2],one,0);sample.push(WL*one[0],one[1],one[2]);rgbs.push(u);}
  if(sample.length<300)break;
  materials=kmeans(Float32Array.from(sample),K).map(g=>({lab:[g.lab[0]/WL,g.lab[1],g.lab[2]],rgb:[0,1,2].map(c=>median(g.members.map(i=>rgbs[i][c]))),count:g.members.length}));
  for(let merged=true;merged;){merged=false;out:for(let a=0;a<materials.length;a++)for(let b=a+1;b<materials.length;b++){const A=materials[a],Bm=materials[b];if(Math.hypot(...A.lab.map((v,q)=>v-Bm.lab[q]))<MERGE_DE){const keep=A.count>=Bm.count?A:Bm;keep.count=A.count+Bm.count;materials.splice(keep===A?b:a,1);merged=true;break out;}}}
  // The plastic is a material of its own, its colour the one measured.
  lab(P[0],P[1],P[2],one,0);
  let plastic=materials.findIndex(m=>Math.hypot(m.lab[0]-one[0],m.lab[1]-one[1],m.lab[2]-one[2])<12);
  if(plastic<0){materials.push({lab:[...one],rgb:[...P],count:0});plastic=materials.length-1;}else materials[plastic].rgb=[...P];
  // A "material" that is another one plus white is that one, lit (a halo the field has not yet taken out): kept, it
  // would explain the light away.
  const fitOf=list=>list.map(({rgb:A})=>{const AA=A[0]**2+A[1]**2+A[2]**2,A1=A[0]+A[1]+A[2],d=3*AA-A1*A1;return {A,AA,A1,d,flat:d<.02*3*AA+1e-6};});
  for(let i=materials.length-1;i>=0;i--){
   if(i===plastic)continue;const [r,g,b]=materials[i].rgb,others=materials.filter((m,j)=>j!==i),scale=luma(r,g,b)+.02,m=fit(fitOf(others),r,g,b,scale);
   if(!fitOf(others)[m].flat&&fitted.s>2*WHITE_MIN&&fitted.r<LIT_MATCH*scale){materials.splice(i,1);if(i<plastic)plastic--;}
  }
  fits=fitOf(materials);
  const wv=Array.from({length:n*n},()=>materials.map(()=>[])),counts=new Int32Array(n*n);
  for(let p=0;p<N;p+=2){
   if(!inside[p]||clipped[p])continue;const q=cellOf[p],D0=R[p],D1=G[p],D2=B[p],scale=luma(D0,D1,D2)+.02;counts[q]++;
   const best=fit(fits,D0,D1,D2,scale);wv[q][best].push(fitted.s);
  }
  const WW=new Float32Array(n*n),full=cell*cell/2*.2;
  for(let q=0;q<n*n;q++){
   let low=Infinity,kinds=0,withPlastic=false;
   for(let m=0;m<materials.length;m++){const v=wv[q][m];if(v.length<Math.max(12,SHARE*counts[q]))continue;kinds++;if(m===plastic)withPlastic=true;low=Math.min(low,median(v));}
   if(kinds>=2||withPlastic&&kinds===1){white[q]=Math.max(0,low);WW[q]=Math.min(1,counts[q]/full);}else WW[q]=0;
  }
  pullPush(white,WW,n,1);settle();
  S=upsample(white,n,size);
 }

 // 2b. The white's shape, per pixel. The cells say where light is and roughly how much; inside a lit area each pixel's
 // own white (its fit), blurred among confident fits, follows a hotspot far more sharply than a cell can. It never
 // exceeds CAP × the most any neighbouring cell found, so print where there is no light cannot pass for light, and never
 // the pixel's own darkest channel.
 if(fits.length){
  const cap=new Float32Array(n*n);
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){let m=0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii>=0&&jj>=0&&ii<n&&jj<n)m=Math.max(m,white[jj*n+ii]);}cap[j*n+i]=m;}
  // A neutral material (silver foil, white or black ink, a grey plastic) cannot tell its own brightness from white, so
  // it does not vote: its white comes from the coloured pixels around it (a wider window where its own is empty).
  const top=upsample(cap,n,size),sw=new Float32Array(N),w=new Float32Array(N),r=Math.max(1,Math.round(3*k)),wide=Math.max(4,Math.round(12*k));
  for(let p=0;p<N;p++){if(!inside[p]||clipped[p]||top[p]<=WHITE_MIN)continue;const scale=luma(R[p],G[p],B[p])+.02,m=fit(fits,R[p],G[p],B[p],scale);if(fits[m].flat)continue;const c=1/(1+(fitted.r/scale/.05)**2);sw[p]=c*fitted.s;w[p]=c;}
  const SW=box(box(sw,size,r),size,r),Wt=box(box(w,size,r),size,r),SW2=box(sw,size,wide),Wt2=box(w,size,wide),full=(2*r+1)**4;
  for(let p=0;p<N;p++){if(!inside[p])continue;if(top[p]<=WHITE_MIN){S[p]=0;continue;}
   let v=Wt[p]>.2*full?SW[p]/Wt[p]:Wt2[p]>1e-3?SW2[p]/Wt2[p]:S[p];v=Math.min(v,CAP*top[p]);if(!clipped[p])v=Math.min(v,R[p],G[p],B[p]);S[p]=v<WHITE_MIN?0:v;}
 }

 // 3–4. Unreliable pixels, and the recovered print.
 const unreliable=new Uint8Array(N),Y0=stored?new Float32Array(N):null;let peak=0,flagged=0;
 if(Y0)for(let p=0;p<N;p++)if(inside[p])Y0[p]=luma(R[p],G[p],B[p]);
 for(let p=0;p<N;p++){
  if(!inside[p])continue;const s=S[p];peak=Math.max(peak,s);R[p]=Math.max(0,R[p]-s);G[p]=Math.max(0,G[p]-s);B[p]=Math.max(0,B[p]-s);
  // Clipped is unreliable only where the light explains a real share of it: foil or white ink can clip on its own.
  if(clipped[p]&&s>CLIPPED_SHARE*luma(R[p]+s,G[p]+s,B[p]+s)||s>Math.max(GLARE_FLOOR,GLARE_RATIO*Plum))unreliable[p]=1;
 }
 if(stored&&peak>WHITE_MIN){
  // The softened core: a flat plateau of light at the centre of a hotspot. From each cell where the white peaks (the
  // most within two cells, and at least STORED_RING of the ceiling over the plastic), flood through pixels with no
  // texture of their own (local deviation of luminance) at that plateau's luminance, still well lit. The halo's falloff,
  // a print's edges and the light's own edge all stop it, so flat print beside the core, and bare plastic, stay as they
  // are.
  const r=Math.max(2,Math.round(3*k)),one=new Float32Array(N),Y2=new Float32Array(N);
  for(let p=0;p<N;p++)if(inside[p]){one[p]=1;Y2[p]=Y0[p]*Y0[p];}
  const n1=box(one,size,r),m1=box(Y0,size,r),m2=box(Y2,size,r),flat=new Uint8Array(N);
  for(let p=0;p<N;p++){if(!inside[p]||!n1[p])continue;const mean=m1[p]/n1[p];flat[p]=Math.sqrt(Math.max(0,m2[p]/n1[p]-mean*mean))<FLAT*Math.max(.05,mean)?1:0;}
  const ring=STORED_RING*GLARE_CEILING*Plum,stack=[];
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){
   const q=j*n+i,v=white[q];if(v<ring)continue;let top=true;
   for(let dj=-2;dj<=2&&top;dj++)for(let di=-2;di<=2;di++){const ii=i+di,jj=j+dj;if((di||dj)&&ii>=0&&jj>=0&&ii<n&&jj<n&&white[jj*n+ii]>v){top=false;break;}}
   if(!top)continue;
   // The plateau's luminance: the median of the flat pixels in the peak cell.
   const ys=[],at=[];for(let y=Math.floor(j*cell);y<Math.min(size,Math.floor((j+1)*cell));y++)for(let x=Math.floor(i*cell);x<Math.min(size,Math.floor((i+1)*cell));x++){const p=y*size+x;if(flat[p]){ys.push(Y0[p]);at.push(p);}}
   if(ys.length<cell)continue;const level=median(ys),cx=(i+.5)*cell,cy=(j+.5)*cell;
   const glow=PEAK_SHARE*v,on=p=>Math.abs(Y0[p]-level)<PLATEAU*level&&S[p]>=glow;
   for(const p of at)if(on(p)&&!unreliable[p]){unreliable[p]=1;stack.push(p);}
   while(stack.length){const p=stack.pop(),x=p%size,y=(p-x)/size;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=size||yy>=size)continue;const q=yy*size+xx;
     if(unreliable[q]||!flat[q]||!inside[q]||!on(q)||Math.hypot(xx-cx,yy-cy)>CORE_REACH*k)continue;unreliable[q]=1;stack.push(q);}}
  }
 }
 // A soft rim round each unreliable patch: light blended with the print, not clipped.
 {const rim=Math.max(1,Math.round(6*k)),grow=unreliable.slice();for(let j=0;j<size;j++)for(let i=0;i<size;i++){const p=j*size+i;if(!unreliable[p])continue;for(let dj=-rim;dj<=rim;dj++)for(let di=-rim;di<=rim;di++){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=size||jj>=size)continue;const q=jj*size+ii;if(inside[q])grow[q]=1;}}unreliable.set(grow);}
 for(let p=0;p<N;p++)if(unreliable[p])flagged++;
 // In-painted smoothly from the reliable pixels around (pull-push), so a core takes the colours that surround it.
 if(flagged){const W=new Float32Array(N);for(let p=0;p<N;p++)W[p]=inside[p]&&!unreliable[p]?1:0;for(const C of [R,G,B])fillHoles(C,W.slice(),size);}
 // Untouched pixels keep their bytes exactly: a photo with no glare reads as it did.
 for(let p=0;p<N;p++){if(!inside[p]||!unreliable[p]&&!S[p])continue;data[4*p]=encode(R[p]);data[4*p+1]=encode(G[p]);data[4*p+2]=encode(B[p]);}
 const lit=new Uint8Array(N);for(let p=0;p<N;p++)if(S[p]>0)lit[p]=1;
 return {unreliable,lit,plateColor:plateColor(data,size)||plateHex,...debug&&{fields:{white:S}},
  stats:{white:+peak.toFixed(3),unreliable:+(flagged/Math.max(1,inside.reduce((a,v)=>a+v,0))).toFixed(4),materials:materials.length}};
}
