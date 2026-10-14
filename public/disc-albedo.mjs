// A phone photo bakes in the room's light: a disc lit from above is brighter at the top than the bottom,
// warm under a bulb, and carries the camera's exposure. On the 3D model that reads as a photograph laid on
// top. This turns the cropped photo into a flat albedo (the plastic's own colour and its printed design)
// so the 3D view can do the lighting, and measures the plate's colour for the rest of the disc.
//
// Works on circular crop pixels (RGBA, the disc filling the circle), in linear light:
// 1. Illumination: a smooth quadratic surface fitted to log luminance over the flight plate. The fit is
//    robust (Tukey reweighting), so the stamp, scuffs and highlights are outliers and drop out of it, and
//    being quadratic it cannot follow fine detail: dividing by it removes gradients and falloff while
//    every stamp edge and scuff survives. No blur, so no halo around a large stamp.
// 2. White balance: only from evidence. The brightest plate pixels are white ink or glare, both the
//    colour of the light; if they are near-neutral their cast is removed, bounded to ±15% per channel.
//    A saturated disc with no white in it keeps its colour rather than being greyed toward neutral.
// 3. Exposure: the plate's median is brought into a sane band; otherwise the photo's exposure stands.
// 4. Glare: clipped, colourless pixels well above the light field are pulled halfway back toward the
//    plate. A hard reflection can be reduced, not un-invented: there is no colour under a clipped pixel.
// Limits: a hard cast shadow (a phone or hand) is not smooth and stays; mixed light sources of different
// colours are corrected only for their average.

const toLinear=new Float32Array(256);
for(let i=0;i<256;i++){const c=i/255;toLinear[i]=c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}
const SRGB_STEPS=4096,toSRGB=new Uint8ClampedArray(SRGB_STEPS+1);
for(let i=0;i<=SRGB_STEPS;i++){const c=i/SRGB_STEPS;toSRGB[i]=Math.round(255*(c<=.0031308?c*12.92:1.055*c**(1/2.4)-.055));}
const encode=v=>toSRGB[v<=0?0:v>=1?SRGB_STEPS:Math.round(v*SRGB_STEPS)];
const luma=(r,g,b)=>.2126*r+.7152*g+.0722*b;
const basis=(x,y)=>[1,x,y,x*x,x*y,y*y];
const median=values=>{const s=Float64Array.from(values).sort();return s.length?s[s.length>>1]:0;};

// Weighted least squares for the six quadratic terms (normal equations, Gaussian elimination).
function fitQuadratic(xs,ys,zs,ws){
 const n=6,A=Array.from({length:n},()=>new Float64Array(n+1));
 for(let k=0;k<zs.length;k++){
  const w=ws[k];if(!w)continue;const b=basis(xs[k],ys[k]);
  for(let i=0;i<n;i++){const wb=w*b[i];for(let j=0;j<n;j++)A[i][j]+=wb*b[j];A[i][n]+=wb*zs[k];}
 }
 for(let i=0;i<n;i++)A[i][i]+=1e-9;
 for(let i=0;i<n;i++){
  let p=i;for(let r=i+1;r<n;r++)if(Math.abs(A[r][i])>Math.abs(A[p][i]))p=r;
  [A[i],A[p]]=[A[p],A[i]];
  for(let r=0;r<n;r++){if(r===i)continue;const f=A[r][i]/A[i][i];for(let c=i;c<=n;c++)A[r][c]-=f*A[i][c];}
 }
 return A.map((row,i)=>row[n]/row[i]);
}
const evaluate=(c,x,y)=>{const b=basis(x,y);let v=0;for(let i=0;i<6;i++)v+=c[i]*b[i];return v;};

/**
 * Replaces the photo's lighting in place with a flat albedo and returns the plate's colour.
 * data: RGBA bytes of a size × size circular crop. plate: the share of the radius used to measure light
 * (inside the shoulder, where the photo shows the flight plate face-on).
 * Returns {color:'#rrggbb'|null, gradient, corrected} — gradient is the light field's brightest/darkest
 * ratio over the plate before correction (for tests and diagnostics).
 */
export function delightPixels(data,size,{plate=.78}={}){
 const step=Math.max(1,Math.floor(size/160)),xs=[],ys=[],zs=[],rgb=[];
 for(let j=step>>1;j<size;j+=step)for(let i=step>>1;i<size;i+=step){
  const x=(i+.5)/size*2-1,y=(j+.5)/size*2-1;if(x*x+y*y>plate*plate)continue;
  const k=(j*size+i)*4;if(data[k+3]<250)continue;
  const r=toLinear[data[k]],g=toLinear[data[k+1]],b=toLinear[data[k+2]];
  xs.push(x);ys.push(y);zs.push(Math.log(Math.max(1e-4,luma(r,g,b))));rgb.push(r,g,b);
 }
 if(zs.length<200)return {color:null,gradient:1,corrected:false};
 // Robust fit: the plate dominates; design, scuffs and glare are reweighted away.
 let ws=new Float64Array(zs.length).fill(1),c=fitQuadratic(xs,ys,zs,ws);
 for(let pass=0;pass<6;pass++){
  const e=zs.map((z,k)=>z-evaluate(c,xs[k],ys[k])),m=median(e),scale=Math.max(.03,1.4826*median(e.map(v=>Math.abs(v-m)))),cut=3*scale;
  ws=Float64Array.from(e,v=>{const u=(v-m)/cut;return Math.abs(u)<1?(1-u*u)**2:0;});
  c=fitQuadratic(xs,ys,zs,ws);
 }
 const field=xs.map((x,k)=>evaluate(c,x,ys[k])),reference=median(field);
 let lo=Infinity,hi=-Infinity;for(const f of field){lo=Math.min(lo,f);hi=Math.max(hi,f);}
 const gainAt=(x,y)=>Math.min(2.5,Math.max(.4,Math.exp(reference-evaluate(c,x,y))));

 // White balance from the brightest plate pixels, only when they are plausibly neutral under a cast.
 const level=[];for(let k=0;k<zs.length;k++){const g=gainAt(xs[k],ys[k]);level.push(rgb[3*k]*g,rgb[3*k+1]*g,rgb[3*k+2]*g);}
 const order=[...zs.keys()].sort((a,b)=>luma(level[3*b],level[3*b+1],level[3*b+2])-luma(level[3*a],level[3*a+1],level[3*a+2]));
 const top=order.slice(0,Math.max(20,Math.round(order.length*.03)));let sr=0,sg=0,sb=0;
 for(const k of top){sr+=level[3*k];sg+=level[3*k+1];sb+=level[3*k+2];}
 const chroma=(Math.max(sr,sg,sb)-Math.min(sr,sg,sb))/Math.max(1e-6,Math.max(sr,sg,sb));
 let wb=[1,1,1];
 if(chroma<.3&&Math.min(sr,sg,sb)>0){
  const y=luma(sr,sg,sb);wb=[y/sr,y/sg,y/sb].map(v=>Math.min(1.15,Math.max(.85,v)));
  const keep=1/luma(...wb);wb=wb.map(v=>v*keep);
 }
 // Exposure: keep the photo's own unless the plate is very dark or washed out.
 const plateY=[];for(let k=0;k<zs.length;k++)if(ws[k]>.5)plateY.push(luma(level[3*k]*wb[0],level[3*k+1]*wb[1],level[3*k+2]*wb[2]));
 const my=median(plateY.length?plateY:[.2]),exposure=my>0?Math.min(1.8,Math.max(.6,Math.min(.6,Math.max(.08,my))/my)):1;

 // Apply to every visible pixel; alpha (the circular mask and any source transparency) is untouched.
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const k=(j*size+i)*4;if(!data[k+3])continue;
  const x=(i+.5)/size*2-1,y=(j+.5)/size*2-1,g=gainAt(x,y)*exposure;
  const r0=toLinear[data[k]],g0=toLinear[data[k+1]],b0=toLinear[data[k+2]];
  let r=r0*g*wb[0],gg=g0*g*wb[1],b=b0*g*wb[2];
  // Glare: clipped, near-colourless and far above the light field.
  const peak=Math.max(r0,g0,b0);
  if(peak>.95&&(peak-Math.min(r0,g0,b0))/peak<.15&&luma(r0,g0,b0)>1.6*Math.exp(evaluate(c,x,y))){
   const t=.5;const pr=Math.exp(reference)*exposure;r+=(pr-r)*t;gg+=(pr-gg)*t;b+=(pr-b)*t;
  }
  data[k]=encode(r);data[k+1]=encode(gg);data[k+2]=encode(b);
 }
 return {color:plateColor(data,size,plate),gradient:Math.exp(hi-lo),corrected:true};
}

// The plate's dominant colour: the most common colour (a coarse 3D histogram) over the flight plate,
// so the stamp's inks, scuffs and any leftover glare don't vote. Averaged over the winning bin and its
// neighbours, so a colour that straddles a bin edge is not split.
export function plateColor(data,size,plate=.78){
 const bins=new Map(),step=Math.max(1,Math.floor(size/200));
 for(let j=0;j<size;j+=step)for(let i=0;i<size;i+=step){
  const x=(i+.5)/size*2-1,y=(j+.5)/size*2-1;if(x*x+y*y>plate*plate)continue;
  const k=(j*size+i)*4;if(data[k+3]<250)continue;
  const key=(data[k]>>4)<<8|(data[k+1]>>4)<<4|data[k+2]>>4;
  let b=bins.get(key);if(!b)bins.set(key,b=[0,0,0,0]);b[0]++;b[1]+=data[k];b[2]+=data[k+1];b[3]+=data[k+2];
 }
 let best=-1,count=0;for(const [key,b] of bins)if(b[0]>count){best=key;count=b[0];}
 if(best<0)return null;
 const sum=[0,0,0,0],[R,G,B]=[best>>8,best>>4&15,best&15];
 for(let r=R-1;r<=R+1;r++)for(let g=G-1;g<=G+1;g++)for(let b=B-1;b<=B+1;b++){
  const bin=r>=0&&g>=0&&b>=0&&r<16&&g<16&&b<16&&bins.get(r<<8|g<<4|b);if(bin)for(let i=0;i<4;i++)sum[i]+=bin[i];
 }
 return '#'+[sum[1],sum[2],sum[3]].map(v=>Math.round(v/sum[0]).toString(16).padStart(2,'0')).join('');
}
