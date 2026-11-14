// Step 1, the capture gate, before any upload: pure JS on the photo's RGBA and the aligner's disc fit, so it can run in
// the page. $0, no API. Each check gives a number, a pass, and the plain-words retake prompt the sheet would show.
//   sharpness: variance of the Laplacian of luma over the disc, read at a fixed 1024 px across the disc (comparable
//              between photos of any size). It measures how much print a disc carries as much as focus (it fails the
//              Destroyer control), so edgeSharpness is logged beside it, advisory only.
//   exposure:  share of disc pixels clipped white (any channel ≥ 250 with luma ≥ 245) or crushed black (luma ≤ 6)
//   resolution: the disc's diameter in the photo's own pixels
//   fill:      the disc's diameter over the photo's short side
//   glare:     the largest connected patch of near-white, nearly colourless pixels inside the plate, as a share of it
export const GATE={SHARP:60,CLIPPED:.02,CRUSHED:.05,DIAMETER:1600,FILL:.6,GLARE:.004};
const luma=(r,g,b)=>.2126*r+.7152*g+.0722*b;
export function sharpness(disc,size){
 // `disc`: RGBA of the disc filling the unit circle, `size` px across; resampled to 1024 by box averaging.
 const n=1024,f=size/n,Y=new Float32Array(n*n);
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){let s=0,c=0;for(let y=Math.floor(j*f);y<Math.floor((j+1)*f)||y===Math.floor(j*f);y++)for(let x=Math.floor(i*f);x<Math.floor((i+1)*f)||x===Math.floor(i*f);x++){const p=(y*size+x)*4;s+=luma(disc[p],disc[p+1],disc[p+2]);c++;}Y[j*n+i]=s/c;}
 let sum=0,sq=0,k=0;const c=n/2;
 for(let j=1;j<n-1;j++)for(let i=1;i<n-1;i++){if(Math.hypot(i+.5-c,j+.5-c)>.9*c)continue;const p=j*n+i,l=Y[p-1]+Y[p+1]+Y[p-n]+Y[p+n]-4*Y[p];sum+=l;sq+=l*l;k++;}
 return sq/k-(sum/k)**2;
}
// Edge sharpness, normalised for content: on the strongest 1% of edges, |Laplacian| over gradient magnitude. A blurred
// edge's second derivative falls faster than its first, so the ratio drops with blur whatever the print's coverage.
export function edgeSharpness(disc,size){
 const n=1024,f=size/n,Y=new Float32Array(n*n);
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const p=(Math.min(size-1,Math.floor((j+.5)*f))*size+Math.min(size-1,Math.floor((i+.5)*f)))*4;Y[j*n+i]=luma(disc[p],disc[p+1],disc[p+2]);}
 const c=n/2,pts=[];
 for(let j=2;j<n-2;j++)for(let i=2;i<n-2;i++){if(Math.hypot(i+.5-c,j+.5-c)>.85*c)continue;const p=j*n+i,gx=(Y[p+1]-Y[p-1])/2,gy=(Y[p+n]-Y[p-n])/2,g=Math.hypot(gx,gy);
  if(g>4)pts.push([g,Math.abs(Y[p-1]+Y[p+1]+Y[p-n]+Y[p+n]-4*Y[p])]);}
 pts.sort((a,b)=>b[0]-a[0]);const top=pts.slice(0,Math.max(50,Math.floor(pts.length*.01)));
 return top.reduce((s,[g,l])=>s+l/g,0)/top.length;
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
 let best=0;const seen=new Uint8Array(N),stack=new Int32Array(N);
 for(let p0=0;p0<N;p0++){if(!hot[p0]||seen[p0])continue;let top=0,area=0;stack[top++]=p0;seen[p0]=1;
  while(top){const p=stack[--top];area++;const i=p%size;for(const q of [p-1,p+1,p-size,p+size]){if(q<0||q>=N||Math.abs((q%size)-i)>1||!hot[q]||seen[q])continue;seen[q]=1;stack[top++]=q;}}
  best=Math.max(best,area);}
 return best/n;
}
// The gate: every check, and the retake prompts for those that fail (worst first, as the sheet would list them).
export function gate({disc,size,diameter,shortSide,plate,original}){
 const s=sharpness(disc,size),es=edgeSharpness(disc,size),e=exposure(disc,size),g=glare(disc,size,plate),fill=original?diameter/shortSide:null;
 const checks=[
  {check:'sharpness',value:+s.toFixed(1),pass:s>=GATE.SHARP,retake:'The photo is soft. Hold still, tap the disc to focus, and take it again.'},
  {check:'edgeSharpness',value:+es.toFixed(3),pass:true,advisory:true,retake:null},
  {check:'clipped',value:+e.clipped.toFixed(4),pass:e.clipped<=GATE.CLIPPED,retake:'Part of the disc is washed out. Move out of direct light or turn the flash off.'},
  {check:'crushed',value:+e.crushed.toFixed(4),pass:e.crushed<=GATE.CRUSHED,retake:'Part of the disc is too dark to read. Find more even light.'},
  {check:'glare',value:+g.toFixed(4),pass:g<=GATE.GLARE,retake:'A bright reflection sits on the disc. Tilt the disc or yourself a little until it moves off the stamp.'},
 ];
 if(original){
  checks.push({check:'resolution',value:Math.round(diameter),pass:diameter>=GATE.DIAMETER,retake:'The disc is small in this photo. Move closer so it fills the circle guide.'});
  checks.push({check:'fill',value:+fill.toFixed(3),pass:fill>=GATE.FILL,retake:'Fill the circle guide with the disc: move closer.'});
 }
 return {pass:checks.every(c=>c.pass),checks,prompts:checks.filter(c=>!c.pass).map(c=>c.retake)};
}
