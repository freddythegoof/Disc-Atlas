// Photo stamps (docs/photo-stamp-assets.md): pull a disc's printed design out of its own photo as a tintable stamp
// asset, the shape the Discraft stock stamps use (white RGB, the design in alpha), so the stamp path draws it in
// the player's ink and finish. Only the design transfers: no plastic or foil colour leaves this module.
// Pure JS, no DOM, so the photo editor and Node tests both run it. Every constant is disc-independent.
//
// Input: the aligned crop de-lit WITHOUT the glare-softening pass (disc-albedo.mjs delightPixels, softenGlare:false):
// the softened texture has already traded fine ink under a hotspot for a nicer photo (docs/photo-stamp-spike.md).
//
//  1. Distance from the plastic: CIE76 ΔE from a smooth local plate field (32 × 32 cells, pull-push filled), fitted
//     only to plate-like pixels and refitted as the plate set tightens, so residual light and mottle drop out.
//  2. Strong design: hysteresis (seeds above HI, grown through LO), then three cleanup rules: specks, scuffs (never
//     above HI) and bands (a component hugging the plate's outer edge round more than BAND_ARC is plastic).
//     A small mark is judged by the word it sits in (docs/stamp-look-extraction.md): small print's letters (a thin l, an
//     i's dot, a U one hundredth of the disc tall) are each under the speck size, but they sit in a word, and a speck
//     does not. On see-through plastic, a mark seen THROUGH the plate (pen on the back of a Champion) is not design: it
//     wears the plate's own hue, darkened, with edges softened by the plastic and a fraction of the print's contrast.
//  3. Weak design: foil mirrors the room, so where it happens to reflect a colour close to the plastic it sits only a
//     few ΔE away. A weaker mark (seeds above HI2, grown through LO2) is kept only beside strong design (within
//     NEAR of it): letters of one stamp sit together, a stray scratch or smudge does not.
//  4. Layers: k-means over the design's core colours. A design is LAYERED when a dark ink draws lines around lighter
//     fills (most of the fills' edge meets the dark ink rather than bare plastic), the way an illustrated stamp is
//     printed. A single-ink stamp (one ink or one foil, however its sheen varies) is not, and stays one solid ink.
//  5. Alpha: the asset is drawn, not photographed. Clean binary layers with their edges at half the local contrast,
//     anti-aliased by a sub-pixel blur: ink is solid inside. A layered design goes out as three layers (lines that meet
//     fills, fills closed over their halftone gaps, and solid elements: fills no line touches, dark elements no fill
//     touches), so the stamp path can ink it either way round for the ink and plastic (stamp.mjs). `alpha` is then
//     the dark-ink composite (lines full, fills at TINT), for coverage and reporting.
const WORD=.008,WORD_AREA=3,CHAIN=3,GHOST_HUE=6,GHOST_SOFT=1.6,GHOST_FAINT=.5,GHOST_DARK=4,RING=12,STRANDED=300,LIT_AREA=2000,BRIDGES=8,BRIDGE_MIN=5,BRIDGE_REACH=160,LO=9,HI=18,LO2=4,HI2=8,MIN_AREA=24,BAND_ARC=.4,MERGE_DE=18,GUARD=6,GRID=32,NEAR=.035,TINT=.42,LAYERED=.55,SOFT=.5;

const toLinear=new Float32Array(256);
for(let i=0;i<256;i++){const c=i/255;toLinear[i]=c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}
const f=t=>t>216/24389?Math.cbrt(t):(24389/27*t+16)/116;
export function rgbToLab(r,g,b){
 const R=toLinear[r],G=toLinear[g],B=toLinear[b];
 const x=(.4124*R+.3576*G+.1805*B)/.95047,y=.2126*R+.7152*G+.0722*B,z=(.0193*R+.1192*G+.9505*B)/1.08883;
 const fx=f(x),fy=f(y),fz=f(z);return [116*fy-16,500*(fx-fy),200*(fy-fz)];
}
const hexToLab=hex=>{const n=parseInt(hex.slice(1),16);return rgbToLab(n>>16,n>>8&255,n&255);};
const median=a=>{const s=Float64Array.from(a).sort();return s.length?s[s.length>>1]:0;};

// The smooth local plate field: mean Lab of the weighted pixels per cell, holes pull-push filled, bilinear.
function plateField(lab,weight,size){
 const n=GRID,sum=new Float64Array(n*n*3),w=new Float64Array(n*n),cell=size/n;
 for(let p=0;p<size*size;p++){if(!weight[p])continue;const i=Math.min(n-1,(p%size)/cell|0),j=Math.min(n-1,((p/size)|0)/cell|0),q=j*n+i;w[q]++;for(let c=0;c<3;c++)sum[3*q+c]+=lab[3*p+c];}
 const full=8*(size/1024)**2,levels=[{C:sum.map((v,k)=>w[k/3|0]?v/w[k/3|0]:0),W:Float64Array.from(w,v=>Math.min(1,v/full)),n}];
 while(levels.at(-1).n>1){
  const {C,W,n:m}=levels.at(-1),h=Math.ceil(m/2),C2=new Float64Array(h*h*3),W2=new Float64Array(h*h);
  for(let j=0;j<h;j++)for(let i=0;i<h;i++){let sw=0;const s=[0,0,0];for(let dj=0;dj<2;dj++)for(let di=0;di<2;di++){const ii=2*i+di,jj=2*j+dj;if(ii>=m||jj>=m)continue;const q=jj*m+ii;if(!W[q])continue;sw+=W[q];for(let c=0;c<3;c++)s[c]+=C[3*q+c]*W[q];}const q=j*h+i;if(sw)for(let c=0;c<3;c++)C2[3*q+c]=s[c]/sw;W2[q]=Math.min(1,sw);}
  levels.push({C:C2,W:W2,n:h});
 }
 for(let l=levels.length-2;l>=0;l--){
  const {C,W,n:m}=levels[l],{C:U,n:h}=levels[l+1];
  for(let j=0;j<m;j++)for(let i=0;i<m;i++){const q=j*m+i;if(W[q]>=1)continue;const a=Math.min(h-1,i>>1),b=Math.min(h-1,j>>1);for(let c=0;c<3;c++)C[3*q+c]=W[q]*C[3*q+c]+(1-W[q])*U[3*(b*h+a)+c];}
 }
 const G=levels[0].C,out=new Float32Array(size*size*3);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const gx=Math.min(n-1,Math.max(0,(x+.5)/cell-.5)),gy=Math.min(n-1,Math.max(0,(y+.5)/cell-.5)),a=gx|0,b=gy|0,fx=gx-a,fy=gy-b,a1=Math.min(n-1,a+1),b1=Math.min(n-1,b+1),p=y*size+x;
  for(let c=0;c<3;c++)out[3*p+c]=(G[3*(b*n+a)+c]*(1-fx)+G[3*(b*n+a1)+c]*fx)*(1-fy)+(G[3*(b1*n+a)+c]*(1-fx)+G[3*(b1*n+a1)+c]*fx)*fy;
 }
 return out;
}

// 8-connected components of a mask, as pixel lists.
function components(mask,size){
 const id=new Int32Array(size*size).fill(-1),list=[],stack=new Int32Array(size*size);
 for(let p0=0;p0<size*size;p0++){
  if(!mask[p0]||id[p0]>=0)continue;
  const k=list.length,pixels=[];let top=0;stack[top++]=p0;id[p0]=k;
  while(top){const p=stack[--top];pixels.push(p);const i=p%size,j=(p-i)/size;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=size||jj>=size)continue;const q=jj*size+ii;if(mask[q]&&id[q]<0){id[q]=k;stack[top++]=q;}}}
  list.push(pixels);
 }
 return list;
}
// Hysteresis: grow from pixels above `hi` through pixels above `lo`, inside `allowed`.
function hysteresis(d,allowed,size,lo,hi){
 const mask=new Uint8Array(size*size),stack=[];
 for(let p=0;p<size*size;p++)if(allowed[p]&&d[p]>hi){mask[p]=1;stack.push(p);}
 while(stack.length){const p=stack.pop(),i=p%size,j=(p-i)/size;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=size||jj>=size)continue;const q=jj*size+ii;if(!mask[q]&&allowed[q]&&d[q]>lo){mask[q]=1;stack.push(q);}}}
 return mask;
}
// Chamfer distance (in pixels) to the nearest set pixel of `mask`, over a w × h grid (h defaults to w).
function distanceTo(mask,w,h=w){
 const D=new Float32Array(w*h).fill(1e9),s2=Math.SQRT2;
 for(let p=0;p<w*h;p++)if(mask[p])D[p]=0;
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const p=j*w+i;let v=D[p];if(i)v=Math.min(v,D[p-1]+1);if(j){v=Math.min(v,D[p-w]+1);if(i)v=Math.min(v,D[p-w-1]+s2);if(i<w-1)v=Math.min(v,D[p-w+1]+s2);}D[p]=v;}
 for(let j=h-1;j>=0;j--)for(let i=w-1;i>=0;i--){const p=j*w+i;let v=D[p];if(i<w-1)v=Math.min(v,D[p+1]+1);if(j<h-1){v=Math.min(v,D[p+w]+1);if(i<w-1)v=Math.min(v,D[p+w+1]+s2);if(i)v=Math.min(v,D[p+w-1]+s2);}D[p]=v;}
 return D;
}
// The area of the word each component of `list` sits in (docs/stamp-look-extraction.md): the print in `print` (a mask
// holding every component), grouped where it lies within `gap` px of itself, faint letters and all.
// With `from` (a distance map), also how close the word comes to what it measures: a word reaches the design when any
// of its letters does.
function wordAreas(list,print,size,gap,from=null){
 const N=size*size,near=distanceTo(print,size),grown=new Uint8Array(N),group=new Int32Array(N).fill(-1);
 for(let p=0;p<N;p++)grown[p]=near[p]<=gap/2?1:0;
 const groups=components(grown,size),area=new Float64Array(groups.length),reach=new Float64Array(groups.length).fill(Infinity);
 groups.forEach((pixels,g)=>{for(const p of pixels){group[p]=g;if(print[p]){area[g]++;if(from)reach[g]=Math.min(reach[g],from[p]);}}});
 const areas=list.map(pixels=>{const g=group[pixels[0]];return g<0?0:area[g];});
 if(from)areas.reach=list.map(pixels=>{const g=group[pixels[0]];return g<0?Infinity:reach[g];});
 return areas;
}
// See-through plastic (docs/stamp-look-extraction.md): the components that are the far side of the plate seen through it,
// pen on the back of an Innova Champion the known case. Measured on Freddy's Proto Glow Wraith: the penned weight peaks
// at ΔE 21-27 where the print reaches 82-90, its edges are twice as soft (4.8 px against 2.3 at 1024), and its colour is
// the plastic's own green darkened (hue 139, chroma 11, on a plate of hue 124, chroma 21), where the print is navy. A
// component is a ghost only when all four hold, each against this disc's own print (the area-weighted median of the
// design): darker than the plate; its colour on the line from grey to the plate's colour (within GHOST_HUE ΔE, at a
// quarter to 1.25 of the plate's chroma); edges GHOST_SOFT times as soft or more; at most GHOST_FAINT of the contrast.
function ghosts(list,d,lab,mask,P,size,k){
 const N=size*size,rows=[];
 for(const pixels of list){
  const ds=pixels.map(p=>d[p]).sort((a,b)=>a-b),peak=ds[Math.floor(ds.length*.95)];
  const widths=[];let L=0,a=0,b=0,n=0;
  for(const p of pixels){
   const i=p%size,j=(p-i)/size;if(!i||!j||i===size-1||j===size-1)continue;
   // The edge's width where it crosses half the mark's own contrast, so faint and strong marks are measured alike.
   if(Math.abs(d[p]-.5*peak)<=.15*peak){const g=Math.hypot(d[p+1]-d[p-1],d[p+size]-d[p-size])/2;if(g>0)widths.push(peak/g/k);}
   if(d[p]>=.75*peak){L+=lab[3*p];a+=lab[3*p+1];b+=lab[3*p+2];n++;}
  }
  rows.push({pixels:pixels.length,peak,edge:median(widths),L:n?L/n:NaN,a:n?a/n:0,b:n?b/n:0});
 }
 // The disc's print: the area-weighted median contrast and edge width.
 const weighted=key=>{const s=[...rows].sort((x,y)=>x[key]-y[key]),total=s.reduce((t,r)=>t+r.pixels,0);let acc=0;for(const r of s){acc+=r.pixels;if(acc>=total/2)return r[key];}return 0;};
 const peak=weighted('peak'),edge=weighted('edge'),chroma2=P[1]*P[1]+P[2]*P[2];
 return rows.map(r=>{
  if(!(r.L<P[0]-GHOST_DARK)||!(r.peak<=GHOST_FAINT*peak)||!(r.edge>=GHOST_SOFT*edge)||chroma2<1)return false;
  const t=Math.max(.25,Math.min(1.25,(r.a*P[1]+r.b*P[2])/chroma2));
  return Math.hypot(r.a-t*P[1],r.b-t*P[2])<=GHOST_HUE;
 });
}
// v3.1 (docs/photo-stamp-one-click.md): what print a hole (a glare core) holds, from the ring of read print around it.
// For each connected hole: the labels of the known pixels within `ring` px of it (labelOf(p) ≥ 0; -1 is not print) are
// counted, every label holding at least RING_SHARE of them is a candidate (the most common always is), and each hole
// pixel takes the candidate whose ring pixels are nearest. A core inside one ink is that ink; one across a line and a
// fill splits between them. Returns {label (Int16Array, -1 outside holes), rings: per hole, label → its ring pixels}.
const RING_SHARE=.25;
export function fillFromRing(holes,known,labelOf,size,ring){
 const N=size*size,label=new Int16Array(N).fill(-1),rings=[];
 for(const pixels of components(holes,size)){
  let x0=size,y0=size,x1=0,y1=0;for(const p of pixels){const i=p%size,j=(p-i)/size;x0=Math.min(x0,i);x1=Math.max(x1,i);y0=Math.min(y0,j);y1=Math.max(y1,j);}
  x0=Math.max(0,x0-ring);y0=Math.max(0,y0-ring);x1=Math.min(size-1,x1+ring);y1=Math.min(size-1,y1+ring);
  const w=x1-x0+1,h=y1-y0+1,local=p=>((p/size|0)-y0)*w+p%size-x0,inHole=new Uint8Array(w*h);for(const p of pixels)inHole[local(p)]=1;
  const near=distanceTo(inHole,w,h),groups=new Map();
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const q=j*w+i,p=(j+y0)*size+i+x0;if(near[q]>ring||!known[p])continue;const l=labelOf(p);if(l<0)continue;if(!groups.has(l))groups.set(l,[]);groups.get(l).push(p);}
  rings.push(groups);if(!groups.size)continue;
  const total=[...groups.values()].reduce((a,g)=>a+g.length,0),top=Math.max(...[...groups.values()].map(g=>g.length));
  const candidates=[...groups.entries()].filter(([,g])=>g.length>=RING_SHARE*total||g.length===top);
  if(candidates.length===1){for(const p of pixels)label[p]=candidates[0][0];continue;}
  const dist=candidates.map(([,g])=>{const m=new Uint8Array(w*h);for(const p of g)m[local(p)]=1;return distanceTo(m,w,h);});
  for(const p of pixels){const q=local(p);let b=0;for(let c=1;c<candidates.length;c++)if(dist[c][q]<dist[b][q])b=c;label[p]=candidates[b][0];}
 }
 return {label,rings};
}

// The largest `d` among `mask` pixels within r (a separable square window).
function maxFilter(d,mask,size,r){
 const tmp=new Float32Array(size*size),out=new Float32Array(size*size);
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){let m=0;for(let t=Math.max(0,i-r);t<=Math.min(size-1,i+r);t++){const q=j*size+t;if(mask[q]&&d[q]>m)m=d[q];}tmp[j*size+i]=m;}
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){let m=0;for(let t=Math.max(0,j-r);t<=Math.min(size-1,j+r);t++){const v=tmp[t*size+i];if(v>m)m=v;}out[j*size+i]=m;}
 return out;
}
// Morphological closing with a disc of radius r: dilate, then erode.
function close(mask,size,r){
 const grown=new Uint8Array(size*size),out=new Uint8Array(size*size),D=distanceTo(mask,size);
 for(let p=0;p<size*size;p++)grown[p]=D[p]<=r?1:0;
 const inv=new Uint8Array(size*size);for(let p=0;p<size*size;p++)inv[p]=grown[p]?0:1;
 const E=distanceTo(inv,size);for(let p=0;p<size*size;p++)out[p]=E[p]>r?1:0;
 return out;
}
// Separable Gaussian blur of a 0/1 mask to 0..1.
function gaussian(mask,size,sigma){
 const rad=Math.max(1,Math.ceil(sigma*2.5)),kern=[];let total=0;for(let t=-rad;t<=rad;t++){const v=Math.exp(-t*t/(2*sigma*sigma));kern.push(v);total+=v;}
 const tmp=new Float32Array(size*size),out=new Float32Array(size*size);
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){let v=0;for(let t=-rad;t<=rad;t++){const ii=Math.min(size-1,Math.max(0,i+t));v+=mask[j*size+ii]*kern[t+rad];}tmp[j*size+i]=v/total;}
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){let v=0;for(let t=-rad;t<=rad;t++){const jj=Math.min(size-1,Math.max(0,j+t));v+=tmp[jj*size+i]*kern[t+rad];}out[j*size+i]=v/total;}
 return out;
}

function kmeans(points,k){
 // Deterministic seeding: the darkest point, then farthest points.
 const n=points.length/3,centres=[];let first=0;for(let i=1;i<n;i++)if(points[3*i]<points[3*first])first=i;
 centres.push([points[3*first],points[3*first+1],points[3*first+2]]);
 const stride=Math.max(1,n/4000|0);
 while(centres.length<k){let best=0,bd=-1;for(let i=0;i<n;i+=stride){let d=Infinity;for(const c of centres)d=Math.min(d,(points[3*i]-c[0])**2+(points[3*i+1]-c[1])**2+(points[3*i+2]-c[2])**2);if(d>bd){bd=d;best=i;}}centres.push([points[3*best],points[3*best+1],points[3*best+2]]);}
 const label=new Uint8Array(n);
 for(let it=0;it<20;it++){
  const s=centres.map(()=>[0,0,0,0]);
  for(let i=0;i<n;i++){let b=0,bd=Infinity;for(let ci=0;ci<centres.length;ci++){const c=centres[ci],d=(points[3*i]-c[0])**2+(points[3*i+1]-c[1])**2+(points[3*i+2]-c[2])**2;if(d<bd){bd=d;b=ci;}}label[i]=b;const t=s[b];t[0]+=points[3*i];t[1]+=points[3*i+1];t[2]+=points[3*i+2];t[3]++;}
  centres.forEach((c,ci)=>{if(s[ci][3])for(let d=0;d<3;d++)c[d]=s[ci][d]/s[ci][3];});
 }
 const counts=centres.map(()=>0);for(const l of label)counts[l]++;
 return centres.map((c,ci)=>({lab:c,count:counts[ci]}));
}

/**
 * data: RGBA bytes of the size × size crop, de-lit with softenGlare:false. plate: the plate's reach as a share of the
 * radius (Rs/R, or Ri/R on an overmold). plateColor: '#rrggbb', the colour delightPixels measured.
 * `unknown` (Uint8Array, size²): pixels that hold no print (a glare core), decided by the design around them. `lit`
 * (Uint8Array, size²): where light was taken out; a small stray mark wholly inside it is a reflection's residue. `strong`:
 * where it was strong; a small mark touching it, or a core, is a stranded stub.
 * Returns {alpha (Uint8Array, size²), layered, coverage, inkReach, stats}, and with `keepMask` the final binary design
 * mask (`mask`), which the colour asset is drawn inside (disc-stamp-color.mjs).
 */
// `seeThrough`: the plastic is see-through (docs/stamp-look-extraction.md), so marks seen through it are found and dropped.
export function extractPhotoStamp(data,size,{plate,plateColor,debug=false,keepMask=false,unknown=null,lit=null,strong=null,seeThrough=false}){
 const N=size*size,k=size/1024,lab=new Float32Array(N*3),inside=new Uint8Array(N),radius=new Float32Array(N);
 const reach=plate*size/2-GUARD*k,c=size/2;let unknowns=0;
 for(let p=0;p<N;p++){
  const i=p%size,j=(p-i)/size,r=Math.hypot(i+.5-c,j+.5-c);radius[p]=r;
  if(r>reach||data[4*p+3]<250)continue;
  // v3.1: a pixel that holds no print (disc-stamp-delight.mjs) is no evidence either way; it is decided last.
  const L=rgbToLab(data[4*p],data[4*p+1],data[4*p+2]);lab[3*p]=L[0];lab[3*p+1]=L[1];lab[3*p+2]=L[2];
  if(unknown?.[p]){unknowns++;continue;}
  inside[p]=1;
 }
 // 1. The local plate field, starting from the measured plate colour.
 const P=hexToLab(plateColor),d=new Float32Array(N),weight=new Uint8Array(N),near=Math.max(1,Math.round(3*k));let field=null,sigma=0,centre=0;
 for(let p=0;p<N;p++)if(inside[p])d[p]=Math.hypot(lab[3*p]-P[0],lab[3*p+1]-P[1],lab[3*p+2]-P[2]);
 for(let pass=0;pass<3;pass++){
  const cut=pass?Math.max(LO,centre+4*sigma):20;
  // Known design is not plate: anything beside a strong pixel stays out of the field, so faint ink next to it
  // cannot drag the local plate colour toward itself.
  const strong=new Uint8Array(N);for(let p=0;p<N;p++)if(inside[p]&&d[p]>HI)strong[p]=1;
  const blocked=distanceTo(strong,size);
  for(let p=0;p<N;p++)weight[p]=inside[p]&&d[p]<cut&&blocked[p]>near?1:0;
  field=plateField(lab,weight,size);
  for(let p=0;p<N;p++)if(inside[p])d[p]=Math.hypot(lab[3*p]-field[3*p],lab[3*p+1]-field[3*p+1],lab[3*p+2]-field[3*p+2]);
  const plateD=[];for(let p=0;p<N;p+=3)if(weight[p])plateD.push(d[p]);
  centre=median(plateD);sigma=1.4826*median(plateD.map(v=>Math.abs(v-centre)));
 }
 const lo=Math.max(LO,centre+4*sigma),hi=Math.max(HI,centre+8*sigma),lo2=Math.max(LO2,centre+5*sigma),hi2=Math.max(HI2,centre+10*sigma);
 // 2. Strong design, and the three cleanup rules.
 const minArea=Math.max(4,Math.round(MIN_AREA*k*k)),stats={specks:0,scuffs:0,bands:[],reflections:[],weak:0,weakRejected:0,slivers:0};
 const edgeArc=pixels=>{const arcs=new Uint8Array(90);for(const p of pixels)if(radius[p]>reach-3*k){const i=p%size,j=(p-i)/size;arcs[Math.min(89,Math.floor((Math.atan2(j+.5-c,i+.5-c)+Math.PI)/(2*Math.PI)*90))]=1;}return arcs.reduce((a,v)=>a+v,0)/90;};
 const mask=hysteresis(d,inside,size,lo,hi),stages=debug?{d}:null,gap=Math.max(2,Math.round(WORD*size));
 const marks=components(mask,size),strongestOf=marks.map(pixels=>{let s=0;for(const p of pixels)s=Math.max(s,d[p]);return s;});
 // The print as it lies on the disc, faint letters too (the weak pass's levels): the words a small mark is judged by.
 const print=hysteresis(d,inside,size,lo2,hi2),strongWords=wordAreas(marks,print,size,gap);
 for(const [index,pixels] of marks.entries()){
  const strongest=strongestOf[index];
  // A mark under the speck size is a letter when the word it sits in is not itself a speck.
  let drop=pixels.length<minArea&&strongWords[index]<WORD_AREA*minArea?'specks':strongest<hi?'scuffs':null;
  if(!drop&&edgeArc(pixels)>BAND_ARC){drop='band';let inner=Infinity;for(const p of pixels)inner=Math.min(inner,radius[p]);stats.bands.push({pixels:pixels.length,innerRadius:+(inner/(size/2)).toFixed(4)});}
  if(drop){if(drop!=='band')stats[drop]++;for(const p of pixels)mask[p]=0;}
 }
 // A reflection: lighter than the plastic, soft (most of it in the fade between plate and design, where a printed edge
 // steps down within a pixel or two) and away from the rest of the design. Room light on the plastic, not ink. A
 // bright reflection with a hard core does not read as soft and stays (docs/photo-stamp-assets.md).
 for(const pixels of components(mask,size)){
  let soft=0,L=0,glow=0;for(const p of pixels){if(d[p]<hi)soft++;L+=lab[3*p];if(lit?.[p])glow++;}
  // v3.1: or a small mark lying wholly where light was found and taken out (disc-stamp-delight.mjs `lit`): what is left
  // of a reflection once its light is gone no longer reads as lighter than the plastic.
  const residue=lit&&pixels.length<LIT_AREA*k*k&&glow>=.9*pixels.length;
  if(!residue&&(soft/pixels.length<SOFT||L/pixels.length<P[0]+4))continue;
  for(const p of pixels)mask[p]=0;
  const others=distanceTo(mask,size);let closest=Infinity;for(const p of pixels)closest=Math.min(closest,others[p]);
  if(closest>NEAR*size)stats.reflections.push({pixels:pixels.length,soft:+(soft/pixels.length).toFixed(3)});else for(const p of pixels)mask[p]=1;
 }
 // See-through plastic: what lies behind the plate goes before the weak pass, so nothing faint is accepted beside it.
 // Nothing behind the plate comes back later: its pixels, and its soft fringe, leave the weak pass and the words.
 const behind=new Uint8Array(N);
 if(seeThrough){
  const list=components(mask,size),ghost=ghosts(list,d,lab,mask,P,size,k);stats.ghosts=[];
  list.forEach((pixels,i)=>{if(!ghost[i])return;stats.ghosts.push(pixels.length);for(const p of pixels){mask[p]=0;behind[p]=1;}});
  if(stats.ghosts.length){const fringe=distanceTo(behind,size);for(let p=0;p<N;p++)if(fringe[p]<=near){behind[p]=1;print[p]=0;}}
 }
 if(debug)stages.strong=mask.slice();
 // 3. Weak design, accepted only beside strong design.
 const fromStrong=distanceTo(mask,size),weakAllowed=new Uint8Array(N);
 for(let p=0;p<N;p++)weakAllowed[p]=inside[p]&&!mask[p]&&!behind[p]?1:0;
 const weak=hysteresis(d,weakAllowed,size,lo2,hi2),weakMarks=components(weak,size),taken=new Uint8Array(weakMarks.length);
 // Beside the design, itself or through its word; and a mark beside one just taken is beside the design too, up to CHAIN
 // steps from strong design (docs/stamp-look-extraction.md): a faint line of small print under a faint word still belongs.
 let from=fromStrong;
 for(let round=0;round<CHAIN;round++){
  const words=wordAreas(weakMarks,print,size,gap,from);let took=false;
  for(const [index,pixels] of weakMarks.entries()){
   if(taken[index])continue;
   let closest=words.reach[index];for(const p of pixels)closest=Math.min(closest,from[p]);
   if((pixels.length>=minArea||words[index]>=WORD_AREA*minArea)&&closest<=NEAR*size&&edgeArc(pixels)<=BAND_ARC){taken[index]=1;took=true;stats.weak++;for(const p of pixels)mask[p]=1;}
  }
  if(!took)break;from=distanceTo(mask,size);
 }
 for(const [index,pixels] of weakMarks.entries())if(!taken[index]){let closest=Infinity;for(const p of pixels)closest=Math.min(closest,from[p]);stats.weakRejected++;}
 // Edges sit at half the local contrast (half its strongest nearby ink), where a printed edge is, not at the low
 // threshold that let the region grow: counters and gaps between strokes stay open, and the soft halo the weak pass
 // grew around strong ink is trimmed back to the ink.
 if(debug)stages.grown=mask.slice();
 // The accepted marks, before the trim, and their sizes: the trim cuts a halo back to the ink, it does not un-accept ink.
 const grownSize=new Float32Array(N);for(const pixels of components(mask,size))for(const p of pixels)grownSize[p]=pixels.length;
 const peak=maxFilter(d,mask,size,Math.max(2,Math.round(3*k)));
 for(let p=0;p<N;p++)if(mask[p]&&d[p]<.5*peak[p])mask[p]=0;
 // What the trim leaves of a halo away from the ink (mid-gap between two letters) is a sliver too small or too faint
 // to have seeded anything: the speck and scuff rules again, at the weak seed level.
 // A letter the trim left under the speck size stays when it was a full-size mark before the trim, or its word is not a
 // speck (docs/stamp-look-extraction.md); a crumb under a quarter of the speck size never does.
 {const parts=components(mask,size),top=parts.map(pixels=>{let s=0;for(const p of pixels)s=Math.max(s,d[p]);return s;}),kept=new Uint8Array(N);parts.forEach((pixels,i)=>{if(top[i]>=hi2)for(const p of pixels)kept[p]=1;});const words=wordAreas(parts,kept,size,gap);
  parts.forEach((pixels,i)=>{if(top[i]<hi2||pixels.length<minArea&&words[i]<WORD_AREA*minArea&&!(grownSize[pixels[0]]>=minArea&&pixels.length>=minArea/4)){stats.slivers++;for(const p of pixels)mask[p]=0;}});}
 // v3.1: the unknown pixels (a glare core) are decided by the design around them. One is design when it is enclosed by
 // design: along most of BRIDGES lines through it (at least BRIDGE_MIN), the nearest pixels that were read on BOTH
 // sides are design. A core inside a printed area stays printed (no hole); one on bare plastic, or across a mark's edge,
 // stays plastic (no glare-shaped blob). A stroke that crossed the core shows a gap there, as wear would: what a clipped
 // core held is not in the photo, and a blob would be the glare's own shape.
 if(unknowns){
  const todo=p=>unknown[p]&&radius[p]<=reach&&data[4*p+3]>=250,known=inside.slice(),far=Math.round(BRIDGE_REACH*k),hit=new Int8Array(2),decided=[];
  const dirs=Array.from({length:BRIDGES},(_,i)=>{const t=i*Math.PI/BRIDGES;return [Math.cos(t),Math.sin(t)];});
  for(let p=0;p<N;p++){
   if(!todo(p))continue;const x=p%size,y=(p-x)/size;let bridged=0;
   for(const [dx,dy] of dirs){
    for(let side=0;side<2;side++){hit[side]=-1;const sx=side?-dx:dx,sy=side?-dy:dy;
     for(let t=1;t<=far;t++){const i=Math.round(x+sx*t),j=Math.round(y+sy*t);if(i<0||j<0||i>=size||j>=size)break;const q=j*size+i;if(known[q]){hit[side]=mask[q];break;}if(radius[q]>reach)break;}}
    if(hit[0]===1&&hit[1]===1)bridged++;
   }
   decided.push(p,bridged>=BRIDGE_MIN?1:0);
  }
  for(let i=0;i<decided.length;i+=2){inside[decided[i]]=1;mask[decided[i]]=decided[i+1];}
 }
 // A small mark touching a core or strong light is a stranded stub (the end of a stroke a core cut, or a core's own edge;
 // from a stored photo, where the upload's softening already laid plastic over the core): on the model it reads as a
 // dot, not as print, so it goes.
 if(unknowns||strong?.some(v=>v)){
  const core=new Uint8Array(N);for(let p=0;p<N;p++)if(unknown?.[p]&&radius[p]<=reach||strong?.[p]&&!mask[p])core[p]=1;
  const fromCore=distanceTo(core,size),touch=Math.max(2,3*k);
  for(const pixels of components(mask,size)){if(pixels.length>=STRANDED*k*k)continue;let near=false;for(const p of pixels)if(fromCore[p]<=touch){near=true;break;}if(near)for(const p of pixels)mask[p]=0;}
 }
 // 4. Layers, from the core (interior) design pixels.
 const core=[];for(let p=0;p<N;p++){if(!mask[p])continue;const i=p%size,j=(p-i)/size;if(i>0&&j>0&&i<size-1&&j<size-1&&mask[p-1]&&mask[p+1]&&mask[p-size]&&mask[p+size])core.push(lab[3*p],lab[3*p+1],lab[3*p+2]);}
 let inks=[];
 if(core.length>=90){
  inks=kmeans(Float32Array.from(core),3);
  for(let merged=true;merged;){merged=false;outer:for(let a=0;a<inks.length;a++)for(let b=a+1;b<inks.length;b++){const A=inks[a],B=inks[b];if(Math.hypot(...A.lab.map((v,q)=>v-B.lab[q]))<MERGE_DE){const n=A.count+B.count;A.lab=A.lab.map((v,q)=>(v*A.count+B.lab[q]*B.count)/n);A.count=n;inks.splice(b,1);merged=true;break outer;}}}
 }
 const nearestInk=p=>{let best=null,bd=Infinity;for(const ink of inks){const dd=Math.hypot(lab[3*p]-ink.lab[0],lab[3*p+1]-ink.lab[1],lab[3*p+2]-ink.lab[2]);if(dd<bd){bd=dd;best=ink;}}return best;};
 // The line ink: the darkest cluster, if it is clearly darker than the plastic and every other cluster.
 const byL=[...inks].sort((a,b)=>a.lab[0]-b.lab[0]),line=byL.length>1&&byL[0].lab[0]<35&&byL[0].lab[0]<P[0]-15&&byL[1].lab[0]-byL[0].lab[0]>15?byL[0]:null;
 const isLine=new Uint8Array(N),isFill=new Uint8Array(N);
 // v3.1: an unknown design pixel's own colour is an in-painted blend; its ink comes from the print around it.
 let inkOf=nearestInk;
 if(line&&unknowns){
  const index=new Map(inks.map((ink,i)=>[ink,i])),holes=new Uint8Array(N),known=new Uint8Array(N);
  for(let p=0;p<N;p++){if(!mask[p])continue;if(unknown[p])holes[p]=1;else known[p]=1;}
  const {label}=fillFromRing(holes,known,p=>index.get(nearestInk(p)),size,Math.round(RING*k));
  inkOf=p=>holes[p]&&label[p]>=0?inks[label[p]]:nearestInk(p);
 }
 if(line)for(let p=0;p<N;p++)if(mask[p])(inkOf(p)===line?isLine:isFill)[p]=1;
 // Layered: the fills are drawn round by the line ink, so most of their edge meets it rather than bare plastic. (A
 // measure of edges, not area, so it holds for a big outlined letter as for a thin crystal.)
 let layered=false,enclosed=0,fillArea=0,edge=0;
 const fromLine=line?distanceTo(isLine,size):null,fromFill=line?distanceTo(isFill,size):null,touch=Math.max(2,1.5*k);
 if(line){
  // Measured over full-size marks only: the small letters and fragments a word keeps (docs/stamp-look-extraction.md) are
  // drawn, but they do not decide what kind of stamp this is.
  const full=new Uint8Array(N);for(const pixels of components(mask,size))if(pixels.length>=minArea)for(const p of pixels)full[p]=1;
  for(let p=0;p<N;p++){if(!isFill[p]||!full[p])continue;fillArea++;const i=p%size,j=(p-i)/size;
   if(i&&j&&i<size-1&&j<size-1&&isFill[p-1]&&isFill[p+1]&&isFill[p-size]&&isFill[p+size])continue;edge++;if(fromLine[p]<=touch)enclosed++;}
  layered=fillArea>.05*core.length/3&&enclosed/edge>LAYERED;
 }
 // 5. Alpha. The asset is drawn, not photographed: clean binary layers anti-aliased by a sub-pixel blur, so ink is solid
 // inside and only its edges are soft. Sheen, wear mottle and halftone grain stay behind.
 const blur=.6*k;
 let alphaF,layers=null;
 if(!layered)alphaF=gaussian(mask,size,blur);
 else{
  // Solid elements and free fills keep full ink: a line component no fill touches (a name, a logo), a fill component
  // no line touches. Fills are closed over their halftone gaps.
  const full=new Uint8Array(N);
  for(const pixels of components(isLine,size)){let touch=0;for(const p of pixels)if(fromFill[p]<=2)touch++;if(touch/pixels.length<.02)for(const p of pixels)full[p]=1;}
  for(const pixels of components(isFill,size)){let touch=0;for(const p of pixels)if(fromLine[p]<=2)touch++;if(touch/pixels.length<.02)for(const p of pixels)full[p]=1;}
  const lines=new Uint8Array(N),fills=close(isFill,size,Math.max(1,Math.round(1.5*k)));
  for(let p=0;p<N;p++){lines[p]=isLine[p]&&!full[p]?1:0;if(!inside[p])fills[p]=0;}
  // Three layers go out, so the stamp can be inked either way round (stamp.mjs): lines (that meet fills), fills, and
  // the full-ink elements. `alpha` is the dark-ink composite, for reporting.
  const A=gaussian(lines,size,blur),B=gaussian(fills,size,blur),S=gaussian(full,size,blur);
  layers={line:A,fill:B,solid:S};
  alphaF=new Float32Array(N);for(let p=0;p<N;p++)alphaF[p]=Math.max(S[p],A[p]+(1-A[p])*TINT*B[p]);
 }
 const alpha=new Uint8Array(N);let coverage=0,maxR=0,plateArea=0;
 for(let p=0;p<N;p++){if(!inside[p])continue;plateArea++;alpha[p]=Math.round(255*Math.min(1,alphaF[p]));if(alpha[p]>127){coverage++;maxR=Math.max(maxR,radius[p]);}}
 return {alpha,layered,layers,...debug&&{stages:{...stages,final:mask}},...keepMask&&{mask},coverage:+(coverage/plateArea).toFixed(4),inkReach:+(maxR/(size/2)).toFixed(4),
  stats:{...stats,thresholds:{lo:+lo.toFixed(2),hi:+hi.toFixed(2),lo2:+lo2.toFixed(2),hi2:+hi2.toFixed(2),noise:+centre.toFixed(2),sigma:+sigma.toFixed(2)},
   inks:inks.map(ink=>({L:+ink.lab[0].toFixed(1),share:+(ink.count/(core.length/3)).toFixed(3),line:ink===line})),enclosed:edge?+(enclosed/edge).toFixed(3):0}};
}
