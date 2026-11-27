// The capture gate (docs/stamp-pipeline-v2.md §11): a photo's retake prompts, read from the same 2048 crop a game asset
// is made from. Pure JS, on the device: no photo leaves it. Ported from the spike's gate (spikes/stamp-pipeline-v2/qa.mjs),
// its thresholds re-fitted for this crop (spikes/stamp-pipeline-v2/qa-calibrate.mjs). The prompts are the feel check's
// words (Nov 26): nothing about a circle guide or tapping to focus, neither of which is on screen when they show.
// A prompt never stops a make: the asset is made as before, and the prompts say how a retake would read better.
//   sharpness: how wide the print's edges are: across each of the strongest edges, the width of the gradient at half its
//              peak, in px at 1024 across the disc; the median over them. Blur widens every edge whatever the print's
//              coverage, noise or sharpening (the spike's Laplacian measures read those: its variance failed the sharp
//              Destroyer, and |Laplacian| over gradient read clean drawn photos as soft). Every real photo measured
//              reads 2.13 px or less, a clean drawn one 2.01 or less; blurred by 1 px at 1024, 2.59 or more.
//   exposure:  share of disc pixels clipped white (any channel ≥ 250 with luma ≥ 245) or crushed black (luma ≤ 6)
//   glare:     the largest connected patch of near-white, nearly colourless pixels inside the plate, as a share of it
//   resolution, fill (a camera original only): the disc's diameter in the photo's own pixels, and over its short side;
//              resolution only counts when the disc does not fill the photo (its prompt is to move closer)
import {photoPoint} from './disc-photo.mjs';

export const GATE={EDGE:2.45,CLIPPED:.02,CRUSHED:.05,GLARE:.004,DIAMETER:1600,FILL:.6};
export const RETAKE={
 sharpness:'The photo looks blurry. Hold steady and retake it.',
 clipped:'Part of the disc is washed out. Move out of direct light or turn off the flash, then retake.',
 crushed:'Part of the disc is too dark to read. Retake it in more even light.',
 glare:'A reflection is covering the stamp. Tilt the disc slightly until it moves off, then retake.',
 resolution:'The disc is small in this photo. Move closer so it fills the frame, then retake.',
 fill:'Fill the frame with the disc: move closer or crop tighter.',
};
const luma=(r,g,b)=>.2126*r+.7152*g+.0722*b;
// Luma at 1024 across the disc, box-averaged from the crop (`size` a multiple of 1024, or point-sampled otherwise).
function luma1024(disc,size){
 const n=1024,Y=new Float32Array(n*n),f=size/n;
 if(Number.isInteger(f)){for(let j=0;j<n;j++)for(let i=0;i<n;i++){let s=0;for(let y=j*f;y<(j+1)*f;y++)for(let x=i*f;x<(i+1)*f;x++){const p=(y*size+x)*4;s+=luma(disc[p],disc[p+1],disc[p+2]);}Y[j*n+i]=s/(f*f);}}
 else for(let j=0;j<n;j++)for(let i=0;i<n;i++){const p=(Math.min(size-1,Math.floor((j+.5)*f))*size+Math.min(size-1,Math.floor((i+.5)*f)))*4;Y[j*n+i]=luma(disc[p],disc[p+1],disc[p+2]);}
 return Y;
}
export function sharpness(disc,size){
 const n=1024,Y=luma1024(disc,size),c=n/2,G=new Float32Array(n*n),GX=new Float32Array(n*n),GY=new Float32Array(n*n);
 for(let j=1;j<n-1;j++)for(let i=1;i<n-1;i++){const p=j*n+i,gx=(Y[p+1]-Y[p-1])/2,gy=(Y[p+n]-Y[p-n])/2;GX[p]=gx;GY[p]=gy;G[p]=Math.hypot(gx,gy);}
 const at=(x,y)=>{if(x<1||y<1||x>=n-2||y>=n-2)return 0;const a=Math.floor(x),b=Math.floor(y),fx=x-a,fy=y-b,p=b*n+a;return (G[p]*(1-fx)+G[p+1]*fx)*(1-fy)+(G[p+n]*(1-fx)+G[p+n+1]*fx)*fy;};
 // Edge pixels: the gradient's peak across the edge (non-maximum suppression), inside the plate.
 const edges=[];
 for(let j=10;j<n-10;j++)for(let i=10;i<n-10;i++){const p=j*n+i,m=G[p];if(m<8||Math.hypot(i+.5-c,j+.5-c)>.85*c)continue;
  const ux=GX[p]/m,uy=GY[p]/m;if(at(i+ux,j+uy)>m||at(i-ux,j-uy)>m)continue;edges.push(p);}
 if(!edges.length)return 0;
 edges.sort((a,b)=>G[b]-G[a]);
 const top=edges.slice(0,Math.max(200,Math.floor(edges.length*.02))),widths=[];
 // Each side: half-pixel steps out along the gradient until it falls under half its peak (interpolated), at most 12 px.
 for(const p of top){
  const i=p%n,j=(p-i)/n,m=G[p],ux=GX[p]/m,uy=GY[p]/m;let width=0;
  for(const dir of [1,-1]){let prev=m,side=12;for(let k=1;k<=24;k++){const t=k*.5,v=at(i+dir*ux*t,j+dir*uy*t);if(v<=m/2){side=t-.5+.5*(prev-m/2)/Math.max(1e-6,prev-v);break;}prev=v;}width+=side;}
  widths.push(width);
 }
 widths.sort((a,b)=>a-b);return widths[widths.length>>1];
}
export function exposure(disc,size){
 let n=0,hi=0,lo=0;const c=size/2;
 for(let p=0;p<size*size;p+=3){const i=p%size,j=(p-i)/size;if(Math.hypot(i+.5-c,j+.5-c)>c)continue;n++;const r=disc[p*4],g=disc[p*4+1],b=disc[p*4+2],y=luma(r,g,b);
  if(y>=245&&Math.max(r,g,b)>=250)hi++;else if(y<=6)lo++;}
 return {clipped:hi/n,crushed:lo/n};
}
export function glare(disc,size,plate=.8){
 const c=size/2,N=size*size,hot=new Uint8Array(N);let n=0;
 for(let p=0;p<N;p++){const i=p%size,j=(p-i)/size;if(Math.hypot(i+.5-c,j+.5-c)>plate*c)continue;n++;const r=disc[p*4],g=disc[p*4+1],b=disc[p*4+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b);
  if(mx>=240&&mx-mn<=18)hot[p]=1;}
 let best=0;const stack=new Int32Array(N);
 for(let p0=0;p0<N;p0++){if(hot[p0]!==1)continue;let top=0,area=0;stack[top++]=p0;hot[p0]=2;
  while(top){const p=stack[--top];area++;const i=p%size;for(const q of [p-1,p+1,p-size,p+size]){if(q<0||q>=N||Math.abs((q%size)-i)>1||hot[q]!==1)continue;hot[q]=2;stack[top++]=q;}}
  best=Math.max(best,area);}
 return n?best/n:0;
}
// The disc's diameter in the photo's own pixels, through the framing `options` (photoPoint) of a `width` × `height` photo.
export function photoDiameter(options,width,height){
 const pts=[];let best=0;
 for(let k=0;k<64;k++){const t=k/64*2*Math.PI;pts.push(photoPoint(Math.cos(t)*.999,Math.sin(t)*.999,{...options,width,height}));}
 for(let k=0;k<32;k++)best=Math.max(best,Math.hypot(pts[k].x-pts[k+32].x,pts[k].y-pts[k+32].y));
 return best;
}
// The gate: every check, and the retake prompts for those that fail, worst first. `disc`: the crop's RGBA, `size` px
// across; `original`: {diameter, shortSide} for a camera original, null for a stored texture (whose size says nothing of
// the camera's).
export function photoGate(disc,size,{plate=.8,original=null}={}){
 const s=sharpness(disc,size),e=exposure(disc,size),g=glare(disc,size,plate);
 const checks=[
  {check:'sharpness',value:s,miss:Math.max(0,s/GATE.EDGE-1)},
  {check:'clipped',value:e.clipped,miss:Math.max(0,e.clipped/GATE.CLIPPED-1)},
  {check:'crushed',value:e.crushed,miss:Math.max(0,e.crushed/GATE.CRUSHED-1)},
  {check:'glare',value:g,miss:Math.max(0,g/GATE.GLARE-1)},
 ];
 if(original){
  // Its prompt says move closer, so a disc that already fills the photo is never asked to: few pixels across a full
  // frame is the camera's resolution, which no step closer changes (the spike's prompts have no words for it).
  const fill=original.diameter/original.shortSide,full=fill>=GATE.FILL;
  checks.push({check:'resolution',value:original.diameter,miss:full?0:Math.max(0,1-original.diameter/GATE.DIAMETER)});
  checks.push({check:'fill',value:fill,miss:Math.max(0,1-fill/GATE.FILL)});
 }
 for(const c of checks)c.pass=c.miss===0;
 const failed=checks.filter(c=>!c.pass).sort((a,b)=>b.miss-a.miss);
 // A disc too few pixels across is small whatever its framing: that prompt alone. A disc with pixels enough that still
 // leaves much of the frame empty (or off-centre) is told to fill it.
 const small=failed.some(c=>c.check==='resolution');
 const prompts=failed.filter(c=>!(small&&c.check==='fill')).map(c=>RETAKE[c.check]);
 return {pass:!failed.length,checks,prompts};
}
