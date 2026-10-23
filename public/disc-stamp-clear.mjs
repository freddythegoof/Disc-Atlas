// Clear plastics, Part B (docs/clear-plastic-discs.md): the clean stamp mode. A clear disc photographed on a surface
// shows that surface through the plastic, and with it the stamp's own shadow: the light that lands on the surface
// under the disc is blocked by the opaque ink, so a soft copy of the stamp lies on the surface, shifted by the light's
// angle. The game-asset extraction (disc-stamp-extract.mjs) reads distance from the plastic, so to it that shadow is
// more print. This pass runs first, on the same pixels, and gives the extraction a photo with the shadow taken out.
// Pure JS, no DOM, so the editor's worker and Node tests both run it. Every constant is disc-independent.
//
//  1. Plate: the median Lab of the plate (the clear plastic over the surface), and a smooth local plate field.
//  2. Print: what is certainly stamp. A shadow keeps the plastic's hue and only darkens it, softly; print is either
//     another colour (a foil, a coloured ink: turned off the plate's hue axis by more than TURN) or a crisp dark mark
//     (darker than the plate by DARK with an edge sharper than EDGE close by). A dark ink in the plate's own hue (the
//     Raptor's navy) casts a shadow dark and crisp enough to pass for a mark too. Once the offset is known, a dark
//     plate-hued mark is that shadow when both hold: its caster (one offset back) is darker by CASTER, and it casts
//     nothing itself (one offset on, the plate is not darkened by CAST). Ink casts; a shadow does not. Thin ink one
//     offset from a heavier mark (the Raptor's WORLD CHAMPION under PAIGE PIERCE) passes the first test, not the
//     second, and stays. Out past SHOULDER of the plate's radius the plastic darkens and deepens in hue by itself as
//     it turns into the rim, scratched and crisp, and reads as print by both tests. It is kept from the relight like
//     print, but casts nothing: only print inside SHOULDER is moved to find and draw the shadow (the Raptor's rings
//     sit at 0.83–0.86 of the plate's radius, its shoulder from about 0.9).
//  3. Offset: the shadow is the print moved by one vector (the light's angle times the plate's height over the surface).
//     The print mask is correlated with the plate-hued darkening around it at 512 px over ±REACH, then refined at the
//     working size. A peak under PEAK times the median of all shifts tried means no shadow stands out (none,
//     or the surface is too busy to tell), and the photo goes on unchanged.
//  4. Shadow: where the print, moved by that vector and spread by its penumbra and by SPREAD (the dome sits higher at
//     the centre, so the vector is not quite one across the disc: on the Raptor it runs from (−28, 28) to (−32, 42) px
//     at 1024), lands on plate-hued pixels darker than the plate field and off the print, those pixels are lit back
//     to the plate field: lifted by the darkness the shadow took, never replaced, tapering off over TAPER of the radius
//     before the shoulder. Only pixels darker than the plate change, and never the print, so a wide footprint costs
//     nothing; a shadow falling across the print leaves the print alone.
// Steps 1–4 find the print, the offset and the footprint at a working size of at most DETECT (1024) px; the lift is
// made at full size from those maps, computing each pixel's colour as it goes, so no full-size working field is kept
// (docs/clear-plastic-discs.md has the memory measured).
// Returns {offset:[dx,dy] in px at `size`, strength, shadowed (pixels changed)} and edits `data` in place.
import {rgbToLab} from './disc-stamp-extract.mjs';

export const SHOULDER=.9,RIM=.87;
const TURN=14,DARK=14,EDGE=6,REACH=.06,PEAK=1.6,PENUMBRA=.006,SPREAD=.012,CASTER=8,CAST=4,TAPER=.08,GRID=32;

const toLinear=new Float32Array(256);
for(let i=0;i<256;i++){const c=i/255;toLinear[i]=c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}
const encode=v=>{v=Math.min(1,Math.max(0,v));return Math.round(255*(v<=.0031308?12.92*v:1.055*v**(1/2.4)-.055));};
function labToRgb(L,a,b){
 const fy=(L+16)/116,fx=fy+a/500,fz=fy-b/200,inv=t=>t**3>216/24389?t**3:(116*t-16)/(24389/27);
 const x=.95047*inv(fx),y=inv(fy),z=1.08883*inv(fz);
 return [3.2406*x-1.5372*y-.4986*z,-.9689*x+1.8758*y+.0415*z,.0557*x-.204*y+1.057*z].map(encode);
}
// Box blur of a float field, radius r, separable, into `out` with `tmp` as scratch (reused working buffers).
function box(src,size,r,out=new Float32Array(size*size),tmp=new Float32Array(size*size)){
 for(let j=0;j<size;j++){let s=0;const row=j*size;for(let i=-r;i<=r;i++)s+=src[row+Math.min(size-1,Math.max(0,i))];for(let i=0;i<size;i++){tmp[row+i]=s/(2*r+1);s+=src[row+Math.min(size-1,i+r+1)]-src[row+Math.max(0,i-r)];}}
 for(let i=0;i<size;i++){let s=0;for(let j=-r;j<=r;j++)s+=tmp[Math.min(size-1,Math.max(0,j))*size+i];for(let j=0;j<size;j++){out[j*size+i]=s/(2*r+1);s+=tmp[Math.min(size-1,j+r+1)*size+i]-tmp[Math.max(0,j-r)*size+i];}}
 return out;
}
// Mean of `value` over `weight`ed pixels per GRID cell, holes filled from their neighbours: the GRID × GRID cells, read
// back bilinearly at any pixel of any size by `at` (a full-size field is never stored).
function field(value,weight,size){
 const n=GRID,cell=size/n,sum=new Float64Array(n*n),w=new Float64Array(n*n);
 for(let p=0;p<size*size;p++)if(weight[p]){const q=Math.min(n-1,(p/size|0)/cell|0)*n+Math.min(n-1,(p%size)/cell|0);sum[q]+=value[p];w[q]++;}
 const g=new Float64Array(n*n),known=new Uint8Array(n*n);let any=false;
 for(let q=0;q<n*n;q++)if(w[q]>=cell*cell*.05){g[q]=sum[q]/w[q];known[q]=1;any=true;}
 if(!any)return null;
 for(let pass=0;pass<2*n;pass++){let hole=false;for(let q=0;q<n*n;q++){if(known[q])continue;let s=0,k=0;const i=q%n,j=q/n|0;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=n||jj>=n)continue;const r=jj*n+ii;if(known[r]===1){s+=g[r];k++;}}if(k){g[q]=s/k;known[q]=2;}else hole=true;}for(let q=0;q<n*n;q++)if(known[q]===2)known[q]=1;if(!hole)break;}
 // The cell grid read at (x, y) of an image `px` wide (the grid spans it whatever its size).
 const at=(x,y,px)=>{
  const c=px/n,gx=Math.min(n-1,Math.max(0,(x+.5)/c-.5)),gy=Math.min(n-1,Math.max(0,(y+.5)/c-.5)),a=gx|0,b=gy|0,fx=gx-a,fy=gy-b,a1=Math.min(n-1,a+1),b1=Math.min(n-1,b+1);
  return (g[b*n+a]*(1-fx)+g[b*n+a1]*fx)*(1-fy)+(g[b1*n+a]*(1-fx)+g[b1*n+a1]*fx)*fy;
 };
 return at;
}
// The best shift of `a` onto `b` within ±reach (both size × size), scored as Σ a(p)·b(p+v) / Σ a, with `a` excluded from
// `b` (a print never shadows itself). `around`: search only ±2 around it.
function bestShift(a,b,size,reach,around=null){
 let best={v:[0,0],score:-1};const scores=[],list=[];let total=0;
 for(let p=0;p<size*size;p++)if(a[p]){list.push(p);total+=a[p];}
 total=total||1;
 const range=around?[[around[0]-2,around[0]+2],[around[1]-2,around[1]+2]]:[[-reach,reach],[-reach,reach]];
 for(let dy=range[1][0];dy<=range[1][1];dy++)for(let dx=range[0][0];dx<=range[0][1];dx++){
  if(!dx&&!dy)continue;let s=0;
  for(const p of list){const x=p%size+dx,y=(p/size|0)+dy;if(x<0||y<0||x>=size||y>=size)continue;s+=a[p]*b[y*size+x];}
  scores.push(s/total);if(s/total>best.score)best={v:[dx,dy],score:s/total};
 }
 scores.sort((x,y)=>x-y);best.median=scores[scores.length>>1];
 return best;
}
function shrink(f,size,k){const n=size/k,out=new Float32Array(n*n);for(let y=0;y<size;y++)for(let x=0;x<size;x++)out[(y/k|0)*n+(x/k|0)]+=f[y*size+x]/(k*k);return out;}
// The photo at the working size: `data` averaged over f × f blocks (f = 1 hands `data` back).
function working(data,size,f){
 if(f===1)return data;
 const n=size/f,out=new Uint8ClampedArray(n*n*4),k=f*f;
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  let r=0,g=0,b=0,a=255;
  for(let j=0;j<f;j++)for(let i=0;i<f;i++){const q=4*((y*f+j)*size+x*f+i);r+=data[q];g+=data[q+1];b+=data[q+2];a=Math.min(a,data[q+3]);}
  const o=4*(y*n+x);out[o]=r/k;out[o+1]=g/k;out[o+2]=b/k;out[o+3]=a;
 }
 return out;
}
// The working size: detection reads the photo at no more than DETECT px (a 2048 stamp read is averaged 2 × 2), and the
// lift is then made at full size from the maps it found. Memory is the working size's, not the full photo's.
const DETECT=1024;

export function unshadow(data,size,{plate=.8,debug=null}={}){
 const f=Math.max(1,Math.round(size/DETECT)),D=size/f,N=D*D,img=working(data,size,f);
 const L=new Float32Array(N),A=new Float32Array(N),B=new Float32Array(N),inside=new Uint8Array(N),c=D/2,r=plate*D/2;
 const radius=p=>Math.hypot(p%D+.5-c,(p/D|0)+.5-c);
 for(let p=0;p<N;p++){
  const x=p%D+.5-c,y=(p/D|0)+.5-c;inside[p]=img[4*p+3]>250&&x*x+y*y<r*r?1:0;
  if(inside[p]){const lab=rgbToLab(img[4*p],img[4*p+1],img[4*p+2]);L[p]=lab[0];A[p]=lab[1];B[p]=lab[2];}
 }
 // 1. The plate: median colour, its hue axis, and a smooth field of plate-like pixels.
 const sample=[[],[],[]];for(let p=0;p<N;p+=7)if(inside[p]){sample[0].push(L[p]);sample[1].push(A[p]);sample[2].push(B[p]);}
 if(sample[0].length<500)return {offset:null,strength:0,shadowed:0};
 const med=v=>v.sort((a,b)=>a-b)[v.length>>1],pl=sample.map(med),chroma=Math.hypot(pl[1],pl[2])||1,axis=[pl[1]/chroma,pl[2]/chroma];
 // How far a colour turns off the plate's hue (and, on a colourless plate, how colourful it is).
 const turnOf=(a,b)=>chroma<6?Math.hypot(a,b):Math.hypot(-a*axis[1]+b*axis[0],Math.min(0,a*axis[0]+b*axis[1]));
 const turn=p=>turnOf(A[p],B[p]);
 // Two working buffers, reused through every blur below.
 const scratch=new Float32Array(N),work=new Float32Array(N);
 // 2. Print: another colour, or crisp and dark.
 for(let y=1;y<D-1;y++)for(let x=1;x<D-1;x++){const p=y*D+x;if(inside[p])work[p]=Math.hypot(L[p+1]-L[p-1],L[p+D]-L[p-D])/2*(D/1024);}
 const sharp=box(work,D,Math.max(1,Math.round(D/512)),new Float32Array(N),scratch);
 const print=new Uint8Array(N),plateLike=new Uint8Array(N),hued=new Uint8Array(N);
 for(let p=0;p<N;p++){
  if(!inside[p])continue;
  const t=turn(p),d=pl[0]-L[p];
  if(t>TURN)print[p]=1;
  else if(d>DARK&&sharp[p]>EDGE){print[p]=1;hued[p]=1;}
  else if(t<TURN*.6&&Math.abs(d)<DARK*.6)plateLike[p]=1;
 }
 const plateL=field(L,plateLike,D),plateA=field(A,plateLike,D),plateB=field(B,plateLike,D);
 if(!plateL)return {offset:null,strength:0,shadowed:0};
 // 3. The shadow's offset. Plate-hued darkening off the print, against the print moved. (`sharp` is done with: its
 // buffer holds the print's neighbourhood.)
 const near=box(print,D,Math.max(1,Math.round(D/512)),sharp,scratch);
 const shade=work.fill(0);
 for(let p=0;p<N;p++)if(inside[p]&&near[p]===0&&turn(p)<TURN)shade[p]=Math.max(0,plateL(p%D,p/D|0,D)-L[p]);
 const k=Math.max(1,Math.round(D/512)),small=D/k,reach=Math.round(REACH*small);
 const caster=new Uint8Array(N);for(let p=0;p<N;p++)caster[p]=print[p]&&radius(p)<SHOULDER*r?1:0;
 const coarse=bestShift(shrink(caster,D,k).map(v=>v>.5?1:0),shrink(shade,D,k),small,reach);
 const v0=[coarse.v[0]*k,coarse.v[1]*k],strength=coarse.median>0?coarse.score/coarse.median:0;
 if(strength<PEAK)return {offset:v0.map(v=>v*f),strength,shadowed:0};
 // Refined at the working size, on a subsample of the print (every third pixel) for speed.
 for(let p=0;p<N;p++)caster[p]=caster[p]&&p%3===0?1:0;
 const fine=bestShift(caster,shade,D,0,v0);
 // A plate-hued mark lighter than what casts it is that caster's shadow (the darkest pixel near one offset back).
 const [dx,dy]=fine.v,spread=Math.max(1,Math.round(SPREAD*D/2)),darkest=near;
 {const rowMin=scratch;
  for(let y=0;y<D;y++)for(let x=0;x<D;x++){let m=1e9;for(let t=Math.max(0,x-spread);t<=Math.min(D-1,x+spread);t++){const q=y*D+t;if(print[q]&&L[q]<m)m=L[q];}rowMin[y*D+x]=m;}
  for(let y=0;y<D;y++)for(let x=0;x<D;x++){let m=1e9;for(let t=Math.max(0,y-spread);t<=Math.min(D-1,y+spread);t++){const v=rowMin[t*D+x];if(v<m)m=v;}darkest[y*D+x]=m;}}
 // The most darkening near each pixel: where something cast a shadow.
 const castMax=new Float32Array(N);
 {const rowMax=scratch;
  for(let y=0;y<D;y++)for(let x=0;x<D;x++){let m=0;for(let t=Math.max(0,x-spread);t<=Math.min(D-1,x+spread);t++){const v=shade[y*D+t];if(v>m)m=v;}rowMax[y*D+x]=m;}
  for(let y=0;y<D;y++)for(let x=0;x<D;x++){let m=0;for(let t=Math.max(0,y-spread);t<=Math.min(D-1,y+spread);t++){const v=rowMax[t*D+x];if(v>m)m=v;}castMax[y*D+x]=m;}}
 let recast=0;
 for(let p=0;p<N;p++){
  if(!hued[p])continue;
  const x=p%D,y=p/D|0,bx=x-dx,by=y-dy,ox=x+dx,oy=y+dy;
  if(bx<0||by<0||bx>=D||by>=D||ox<0||oy<0||ox>=D||oy>=D)continue;
  if(L[p]>darkest[by*D+bx]+CASTER&&castMax[oy*D+ox]<CAST&&!print[oy*D+ox]){print[p]=0;recast++;}
 }
 // 4. The shadow's footprint: the print moved and softened by its penumbra (`soft`), and a pixel round the print it
 // never touches (`guard`), both at the working size.
 const moved=work.fill(0);
 for(let p=0;p<N;p++)if(print[p]&&radius(p)<SHOULDER*r){const x=p%D+dx,y=(p/D|0)+dy;if(x>=0&&y>=0&&x<D&&y<D)moved[y*D+x]=1;}
 const once=box(moved,D,Math.max(1,Math.round(PENUMBRA*D)),castMax,scratch);
 const soft=box(once,D,Math.max(1,Math.round(SPREAD*D)),near,scratch),guard=box(print,D,Math.max(1,Math.round(D/1024)),castMax,scratch);
 // The lift, at full size: each pixel of the photo, read where it falls in the working maps (the footprint
 // bilinearly, the guard by the working pixel it lies in, the plate field by its own grid), lifted towards the plate
 // field by how much darker it is, weighted by the footprint and by the taper towards the plate's edge. Nothing is
 // replaced, so the plastic's own texture stays and no step is drawn where the shadow ends. Only pixels darker than the
 // plate, in its hue, off the print, change.
 const cf=size/2,rf=plate*size/2,softAt=(x,y)=>{
  const gx=Math.min(D-1,Math.max(0,(x+.5)/f-.5)),gy=Math.min(D-1,Math.max(0,(y+.5)/f-.5)),a=gx|0,b=gy|0,fx=gx-a,fy=gy-b,a1=Math.min(D-1,a+1),b1=Math.min(D-1,b+1);
  return (soft[b*D+a]*(1-fx)+soft[b*D+a1]*fx)*(1-fy)+(soft[b1*D+a]*(1-fx)+soft[b1*D+a1]*fx)*fy;
 };
 let shadowed=0;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const p=y*size+x,q=(y/f|0)*D+(x/f|0),ex=x+.5-cf,ey=y+.5-cf,e=Math.hypot(ex,ey);
  if(data[4*p+3]<=250||e>=rf||guard[q]>0)continue;
  const s=softAt(x,y);if(s<.03)continue;
  const w=Math.min(1,s/.15)*Math.min(1,Math.max(0,(rf-e)/(TAPER*size/2)));if(!w)continue;
  const [l,a,b]=rgbToLab(data[4*p],data[4*p+1],data[4*p+2]);
  if(turnOf(a,b)>=TURN)continue;
  const tl=plateL(x,y,size);if(l>=tl)continue;
  const [R,G,Bl]=labToRgb(l+w*(tl-l),a+w*(plateA(x,y,size)-a),b+w*(plateB(x,y,size)-b));
  data[4*p]=R;data[4*p+1]=G;data[4*p+2]=Bl;
  shadowed++;
 }
 if(debug)Object.assign(debug,{size:D,print,hued,soft,guard,plateL,L,turnOf:turn,sharp:null});
 return {offset:fine.v.map(v=>v*f),strength,shadowed,recast,plate:pl};
}
// After the extraction: on a clear disc the shoulder, past RIM of the plate's radius (a little inside SHOULDER: it starts
// to deepen before it reads as crisp), is the thick rim showing
// its colour deepest, scratched, and catching the light: never print in the plate's own hue. Returns the pixels to drop
// from the design there (plate-hued, judged on the photo as it came, `raw`); another colour (a foil ring) stays.
// `plateLab`: unshadow()'s plate.
export function shoulder(raw,size,plate,plateLab){
 const N=size*size,out=new Uint8Array(N),c=size/2,r=RIM*plate*size/2;
 if(!plateLab)return out;
 const chroma=Math.hypot(plateLab[1],plateLab[2])||1,axis=[plateLab[1]/chroma,plateLab[2]/chroma];
 for(let p=0;p<N;p++){
  if(Math.hypot(p%size+.5-c,(p/size|0)+.5-c)<r)continue;
  const [,a,b]=rgbToLab(raw[4*p],raw[4*p+1],raw[4*p+2]);
  const t=chroma<6?Math.hypot(a,b):Math.hypot(-a*axis[1]+b*axis[0],Math.min(0,a*axis[0]+b*axis[1]));
  if(t<TURN*2)out[p]=1;
 }
 return out;
}
