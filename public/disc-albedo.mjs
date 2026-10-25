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
// 5. Glare softening (an experiment behind SOFTEN_GLARE, docs/photo-glare-experiment.md): a hotspot with a
//    soft halo, and only such a hotspot, is pulled further toward the plastic around it. See softenGlare.
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
const smoothstep=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t);};
// The glare experiment's kill switch. false: delightPixels writes exactly the bytes it wrote before the
// experiment existed (the pass below never runs).
export const SOFTEN_GLARE=true;

// Equal angular votes across the photographed overmold, outside the projection seam.
// Discard the transparent edge and seam bleed, then reject high-luminance specular
// outliers relative to this rim (so a genuinely white rim stays white).
export function rimColor(data,size,inner){
 if(!Number.isFinite(inner)||inner<=0||inner>=1)return null;
 const lo=inner+Math.max(2/size,(1-inner)*.08),hi=1-Math.max(2/size,.02);
 if(lo>=hi)return null;
 const samples=[];
 for(let ring=0;ring<4;ring++)for(let a=0;a<128;a++){
  const radius=lo+(hi-lo)*(ring+.5)/4,angle=(a+.5)*Math.PI*2/128;
  const x=Math.floor((1+radius*Math.cos(angle))*size/2),y=Math.floor((1+radius*Math.sin(angle))*size/2),k=(y*size+x)*4;
  if(data[k+3]<250)continue;
  const rgb=[toLinear[data[k]],toLinear[data[k+1]],toLinear[data[k+2]]];
  samples.push({rgb,y:luma(...rgb)});
 }
 if(samples.length<256)return null;
 const levels=samples.map(s=>s.y).sort((a,b)=>a-b),m=median(levels);
 const mad=median(levels.map(v=>Math.abs(v-m)));
 const ceiling=Math.min(levels[Math.floor((levels.length-1)*.9)],m+3*Math.max(.005,1.4826*mad));
 const kept=samples.filter(s=>s.y<=ceiling);
 return '#'+[0,1,2].map(c=>encode(median(kept.map(s=>s.rgb[c]))).toString(16).padStart(2,'0')).join('');
}

// A Halo copy's dyed band (docs/halo-band-sampling.md): the colour a person names when they look at the band,
// not an area average. Halo dye swirls: a pale wash from the plate side bleeds into the band and the dye
// concentrates toward the outer edge, so a per-channel median over the annulus lands on a pastel between them.
// Same annulus and glare ceiling as rimColor (8 rings here, for a finer radial read), then the samples are
// grouped by colour (k-means, k = 3, in Lab with lightness down-weighted so shading on one dye stays one group;
// groups closer than ΔE 12 merge) and the band is the group, holding at least 15% of the samples, that sits
// furthest out: the dye, which runs to the edge, rather than the wash, which bleeds in from the plate. Its
// colour is the group's per-channel median. A uniform band is one group, so it reads exactly as rimColor does.
// Overmold rims keep rimColor, unchanged.
const labOf=([r,g,b])=>{
 const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;
 const fx=f((.4124*r+.3576*g+.1805*b)/.95047),fy=f(luma(r,g,b)),fz=f((.0193*r+.1192*g+.9505*b)/1.08883);
 return [116*fy-16,500*(fx-fy),200*(fy-fz)];
};
// The band annulus as rimColor reads it (`rings` × 128 angles, transparent pixels skipped, the glare ceiling
// applied). Null when it is too thin or too sparse to read.
function bandRead(data,size,inner,rings){
 if(!Number.isFinite(inner)||inner<=0||inner>=1)return null;
 const lo=inner+Math.max(2/size,(1-inner)*.08),hi=1-Math.max(2/size,.02);
 if(lo>=hi)return null;
 const samples=[];
 for(let ring=0;ring<rings;ring++)for(let a=0;a<128;a++){
  const radius=lo+(hi-lo)*(ring+.5)/rings,angle=(a+.5)*Math.PI*2/128;
  const x=Math.floor((1+radius*Math.cos(angle))*size/2),y=Math.floor((1+radius*Math.sin(angle))*size/2),k=(y*size+x)*4;
  if(data[k+3]<250)continue;
  const rgb=[toLinear[data[k]],toLinear[data[k+1]],toLinear[data[k+2]]];
  samples.push({rgb,y:luma(...rgb),out:(ring+.5)/rings,ring,angle:a,lab:labOf(rgb)});
 }
 if(samples.length<rings*64)return null;
 const levels=samples.map(s=>s.y).sort((a,b)=>a-b),m=median(levels);
 const mad=median(levels.map(v=>Math.abs(v-m)));
 const ceiling=Math.min(levels[Math.floor((levels.length-1)*.9)],m+3*Math.max(.005,1.4826*mad));
 return {lo,hi,kept:samples.filter(s=>s.y<=ceiling)};
}
const bandDistance=(p,q)=>Math.hypot(.5*(p[0]-q[0]),p[1]-q[1],p[2]-q[2]);
// The colour groups of a band read: [{list, centre, share, out}], `out` the group's mean place across the band
// (0 at the inner ring, 1 at the outer).
function bandGroups(kept){
 const dist=bandDistance;
 const mean=list=>[0,1,2].map(i=>list.reduce((sum,s)=>sum+s.lab[i],0)/list.length);
 // Deterministic farthest-point seeds from the median colour, then Lloyd iterations.
 let centres=[[0,1,2].map(i=>median(kept.map(s=>s.lab[i])))];
 while(centres.length<3){
  let far=null,best=-1;
  for(const s of kept){const d=Math.min(...centres.map(c=>dist(s.lab,c)));if(d>best){best=d;far=s.lab;}}
  if(best<=0)break;centres.push([...far]);
 }
 let groups=[];
 for(let pass=0;pass<20;pass++){
  groups=centres.map(()=>[]);
  for(const s of kept){let g=0;for(let c=1;c<centres.length;c++)if(dist(s.lab,centres[c])<dist(s.lab,centres[g]))g=c;groups[g].push(s);}
  groups=groups.filter(g=>g.length);centres=groups.map(mean);
 }
 for(let merged=true;merged;){
  merged=false;
  for(let i=0;i<groups.length&&!merged;i++)for(let j=i+1;j<groups.length&&!merged;j++)
   if(dist(centres[i],centres[j])<12){groups[i]=[...groups[i],...groups[j]];groups.splice(j,1);centres=groups.map(mean);merged=true;}
 }
 return groups.map((list,i)=>({list,centre:centres[i],share:list.length/kept.length,out:list.reduce((sum,s)=>sum+s.out,0)/list.length}));
}
const groupHex=list=>'#'+[0,1,2].map(c=>encode(median(list.map(s=>s.rgb[c]))).toString(16).padStart(2,'0')).join('');
// The dye group: the furthest out of the groups holding at least 15% of the samples.
const dyeGroup=groups=>{let band=null;for(const g of groups)if(g.share>=.15&&(!band||g.out>band.out))band=g;return band;};
export function bandColor(data,size,inner){
 const read=bandRead(data,size,inner,8);if(!read)return null;
 return groupHex(dyeGroup(bandGroups(read.kept)).list);
}

// Halo v2 (docs/halo-band-v2.md): the band's two colours. On top, a Halo band is mostly a pale wash ring and the
// dye owns the outer lip; where the dye takes over wobbles around the circle. bandModel finds:
// - the wash: the innermost colour group (again at least 15% of the samples) that sits inward of the dye;
//   its colour is the per-channel median of the samples nearer the wash than the dye;
// - the dye front: at each of 128 angles, the radius where the dye takes over. Every sample on 16 finer rings
//   gets its dye share by projection onto the wash→dye line in linear light (a 50/50 mix in light, not in
//   Lab, which would push the front outward); the front is the seam side of the band plus the wash's share of
//   it. Smoothed around the circle (a Gaussian, σ = 3 of the 128 angles, 8.4°) and kept at FRONT_RING angles.
// No wash (one colour, or a wash under 15% of the band) is null: the disc stays the v1 one-colour band.
export const FRONT_RING=16;
export function bandModel(data,size,inner){
 const read=bandRead(data,size,inner,8);if(!read)return null;
 const groups=bandGroups(read.kept),dye=dyeGroup(groups);
 let wash=null;for(const g of groups)if(g!==dye&&g.share>=.15&&g.out<dye.out&&(!wash||g.out<wash.out))wash=g;
 if(!wash)return null;
 const fine=bandRead(data,size,inner,16);if(!fine)return null;
 const D=[0,1,2].map(c=>median(dye.list.map(s=>s.rgb[c]))),Wc=[0,1,2].map(c=>median(wash.list.map(s=>s.rgb[c])));
 const axis=D.map((v,i)=>v-Wc[i]),len2=axis.reduce((sum,v)=>sum+v*v,0);if(!(len2>0))return null;
 const share=new Float64Array(128),count=new Float64Array(128),washed=[];
 for(const s of fine.kept){
  const p=Math.min(1,Math.max(0,s.rgb.reduce((sum,v,i)=>sum+(v-Wc[i])*axis[i],0)/len2));
  share[s.angle]+=1-p;count[s.angle]++;
  if(bandDistance(s.lab,wash.centre)<bandDistance(s.lab,dye.centre))washed.push(s);
 }
 const raw=new Float64Array(128),known=[...count.keys()].filter(i=>count[i]);if(!known.length||!washed.length)return null;
 for(let i=0;i<128;i++){
  // An angle with no readable sample (all glare) takes its nearest readable neighbour.
  let j=i;if(!count[j])j=known.reduce((best,k)=>Math.min(Math.abs(k-i),128-Math.abs(k-i))<Math.min(Math.abs(best-i),128-Math.abs(best-i))?k:best,known[0]);
  raw[i]=fine.lo+(fine.hi-fine.lo)*share[j]/count[j];
 }
 const SIGMA=3,smooth=i=>{let sum=0,w=0;for(let k=-3*SIGMA;k<=3*SIGMA;k++){const g=Math.exp(-k*k/(2*SIGMA*SIGMA));sum+=g*raw[(i+k+128)%128];w+=g;}return sum/w;};
 const step=128/FRONT_RING;
 const front=Array.from({length:FRONT_RING},(_,j)=>{const at=j*step-.5,i=Math.floor(at),f=at-i;return smooth((i+128)%128)*(1-f)+smooth((i+1)%128)*f;});
 return {dye:groupHex(dye.list),wash:groupHex(washed),front};
}

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
export function delightPixels(data,size,{plate=.78,rimInner=null,bandInner=null,softenGlare:soften=SOFTEN_GLARE}={}){
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
 const input=soften?data.slice():null;
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
 // The plate colour (and the rim or Halo band) is measured before the experiment, so the disc's matched colour never depends on it.
 const color=plateColor(data,size,plate),rim=rimInner?rimColor(data,size,rimInner):null;
 // A Halo band: its dye (bandColor) and, when it has a wash, the two-colour model (the same dye group).
 const halo=bandInner?bandModel(data,size,bandInner):null,band=bandInner?(halo?halo.dye:bandColor(data,size,bandInner)):null;
 const glare=soften?softenGlare(data,input,size,(x,y)=>Math.exp(evaluate(c,x,y))):null;
 return {color,gradient:Math.exp(hi-lo),corrected:true,...rimInner&&{rim},...bandInner&&{band,halo},...glare&&{glare}};
}

// Glare softening, the experiment (docs/photo-glare-experiment.md). It runs after the baseline has written
// every pixel and rewrites only pixels inside an accepted hotspot: every other byte stays exactly as the
// baseline wrote it.
// A hotspot is a connected patch of pixels well above the light field (q, luminance over the fitted light,
// above Q0) that holds clipped, colourless glare (the baseline's own glare test) and has a soft halo.
// Room-light glare fades out over several pixels; crisp white ink steps down to the plate within a pixel or
// two. A patch whose near-neutral halo is narrower, on average around its clipped core, than `halo` pixels
// reads as ink and is left alone, as is a glint too small to see.
// Inside a hotspot glare is treated as light added on top of the plastic: each pixel gives up the excess it
// carries, in the light's colour, over the plastic around it (`fill`, a pull-push interpolation of the
// untouched pixels nearby), so a coloured stamp beside a hotspot keeps its colour, and only the excess above
// the knee is taken. A clipped pixel has no colour of its own left and takes the fill's, under the knee's
// ceiling of sheen. Nothing is ever brightened.
// Glare up to KNEE times the plastic's own luminance passes untouched (the patch's edge, so it cannot show a
// seam); above that it is compressed smoothly and monotonically toward KNEE+ROOM: a bright sheen, not a hole.
const Q0=1.3,KNEE=.3,ROOM=.25;
// The most glare the pass leaves, as a share of the plastic's luminance: a photo stamp read from a stored texture treats
// glare near it as print the pass replaced (disc-stamp-delight.mjs).
export const GLARE_CEILING=KNEE+ROOM;
const compress=x=>x<=KNEE?x:KNEE+ROOM*(1-Math.exp(-(x-KNEE)/ROOM));
function softenGlare(data,input,size,fieldAt){
 const n=size*size,ratio=new Float32Array(n),kind=new Uint8Array(n); // kind 1: above the light, 2: clipped glare
 const chroma=k=>{const r=toLinear[input[k]],g=toLinear[input[k+1]],b=toLinear[input[k+2]],peak=Math.max(r,g,b);return peak>0?(peak-Math.min(r,g,b))/peak:0;};
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const p=j*size+i,k=4*p;if(input[k+3]<250)continue;
  const r0=toLinear[input[k]],g0=toLinear[input[k+1]],b0=toLinear[input[k+2]];
  const q=luma(r0,g0,b0)/fieldAt((i+.5)/size*2-1,(j+.5)/size*2-1);ratio[p]=q;
  if(q>Q0)kind[p]=Math.max(r0,g0,b0)>.95&&chroma(k)<.15&&q>1.6?2:1;
 }
 // Connected patches (8-neighbour), breadth first; `order` holds each patch's pixels contiguously.
 const minCore=Math.max(3,Math.round(6*(size/1024)**2)),halo=Math.max(2,3*size/1024);
 const patch=new Int32Array(n).fill(-1),order=new Int32Array(n),soft=[];let end=0,rejected=0;
 for(let p0=0;p0<n;p0++){
  if(!kind[p0]||patch[p0]>=0)continue;
  const id=soft.length,start=end;patch[p0]=id;order[end++]=p0;let core=0,edge=0,neutral=0;
  for(let at=start;at<end;at++){
   const p=order[at],i=p%size,j=(p-i)/size;
   if(kind[p]===2){core++;if(!i||!j||i===size-1||j===size-1||kind[p-1]!==2||kind[p+1]!==2||kind[p-size]!==2||kind[p+size]!==2)edge++;}
   else if(chroma(4*p)<.4)neutral++;
   for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){
    const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=size||jj>=size)continue;
    const q=jj*size+ii;if(kind[q]&&patch[q]<0){patch[q]=id;order[end++]=q;}
   }
  }
  const accepted=core>=minCore&&neutral>=halo*edge;if(core>=minCore&&!accepted)rejected++;
  soft.push(accepted?[start,end]:null);
 }
 const spans=soft.filter(Boolean),stats={hotspots:spans.length,rejected,pixels:0};
 if(!spans.length)return stats;
 // The plastic around each hotspot: every opaque pixel at or below the light field's band, as the baseline
 // wrote it, interpolated into the patches by pull-push.
 const R=new Float32Array(n),G=new Float32Array(n),B=new Float32Array(n),W=new Float32Array(n);let sources=0;
 for(let p=0;p<n;p++){const k=4*p;if(kind[p]||input[k+3]<250)continue;R[p]=toLinear[data[k]];G[p]=toLinear[data[k+1]];B[p]=toLinear[data[k+2]];W[p]=1;sources++;}
 if(!sources)return stats;
 pullPush(R,G,B,W,size);
 // Clipped in the photo, or pushed to full scale by the baseline's own gain: either way that pixel's colour
 // is no longer a measurement.
 const peak=k=>Math.max(toLinear[input[k]],toLinear[input[k+1]],toLinear[input[k+2]],toLinear[data[k]],toLinear[data[k+1]],toLinear[data[k+2]]);
 for(const [start,stop] of spans){
  // The glare's own colour (the light's, after white balance), from the patch's strong unclipped pixels: the
  // mean of what each carries over the fill. Neutral when there are none, or when the mean is too coloured
  // to be light (a patch that is mostly ink).
  const light=[0,0,0];
  for(let at=start;at<stop;at++){const p=order[at],k=4*p;if(ratio[p]<1.6||peak(k)>=.8)continue;light[0]+=toLinear[data[k]]-R[p];light[1]+=toLinear[data[k+1]]-G[p];light[2]+=toLinear[data[k+2]]-B[p];}
  const top=Math.max(...light),dir=top>0&&Math.min(...light)/top>.6?light.map(v=>v/top):[1,1,1];
  for(let at=start;at<stop;at++){
   const p=order[at],k=4*p,base=[toLinear[data[k]],toLinear[data[k+1]],toLinear[data[k+2]]],fill=[R[p],G[p],B[p]];
   const plastic=Math.max(1e-4,luma(...fill)),unit=plastic/luma(...dir);
   const glare=Math.max(0,Math.min(...base.map((v,c)=>(v-fill[c])/dir[c]))),kept=compress(glare/unit)*unit;
   // A clipped pixel's measured glare is a floor (the sensor stopped counting): it keeps the knee's ceiling.
   // Only when the light explains its brightness: bright yellow ink is near full scale too, but not glare.
   const brighter=luma(...base)-plastic,explained=brighter>0?glare*luma(...dir)/brighter:0;
   const clip=smoothstep(.8,.95,peak(k))*smoothstep(.3,.7,explained),ceiling=(KNEE+ROOM)*unit;
   const target=base.map((v,c)=>{const unlit=v-(glare-kept)*dir[c];return unlit+(fill[c]+ceiling*dir[c]-unlit)*clip;});
   if(luma(...target)>=luma(...base))continue;
   const [r,g,b]=target.map(encode);
   if(r!==data[k]||g!==data[k+1]||b!==data[k+2]){data[k]=r;data[k+1]=g;data[k+2]=b;stats.pixels++;}
  }
 }
 return stats;
}
// Pull-push hole filling: average the known pixels (W 1) down a pyramid, then fill each unknown pixel from
// the bilinear coarser level on the way back up, so a hole takes the colours of its own surroundings.
function pullPush(R,G,B,W,size){
 const levels=[{C:[R,G,B],W,n:size}];
 while(levels.at(-1).n>1){
  const {C,W:w,n}=levels.at(-1),m=Math.ceil(n/2),C2=[0,1,2].map(()=>new Float32Array(m*m)),W2=new Float32Array(m*m);
  for(let j=0;j<m;j++)for(let i=0;i<m;i++){
   const sum=[0,0,0];let sw=0;
   for(let dj=0;dj<2;dj++)for(let di=0;di<2;di++){const ii=2*i+di,jj=2*j+dj;if(ii>=n||jj>=n)continue;const p=jj*n+ii;if(!w[p])continue;for(let c=0;c<3;c++)sum[c]+=C[c][p]*w[p];sw+=w[p];}
   const q=j*m+i;if(sw)for(let c=0;c<3;c++)C2[c][q]=sum[c]/sw;W2[q]=Math.min(1,sw);
  }
  levels.push({C:C2,W:W2,n:m});
 }
 for(let l=levels.length-2;l>=0;l--){
  const {C,W:w,n}=levels[l],{C:up,n:m}=levels[l+1];
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){
   const p=j*n+i;if(w[p]>=1)continue;
   const x=Math.min(m-1,Math.max(0,(i+.5)/2-.5)),y=Math.min(m-1,Math.max(0,(j+.5)/2-.5)),a=Math.floor(x),b=Math.floor(y),fx=x-a,fy=y-b,a1=Math.min(m-1,a+1),b1=Math.min(m-1,b+1);
   for(let c=0;c<3;c++){const u=up[c],v=(u[b*m+a]*(1-fx)+u[b*m+a1]*fx)*(1-fy)+(u[b1*m+a]*(1-fx)+u[b1*m+a1]*fx)*fy;C[c][p]=w[p]*C[c][p]+(1-w[p])*v;}
  }
 }
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

// The plastic's true colour (docs/clear-plastic-true-color.md). A clear disc's thin plate, photographed over a light
// table, washes its tint out; the thick rim shows the dye. On a one-piece mold the outer band of the crop is the rim seen
// from above, sampled as an overmold's rim piece is (rimColor: the glare ceiling takes out the rim's highlights). It is
// the true colour only when it is the same plastic seen thicker: deeper than the plate by at least 8 L, at least 80% of
// the plate's chroma, and within 60° of its hue (the blue Raptor: 22 L deeper, 1.4× the chroma, 44° of hue). A rim that
// reads lighter (a photo on a dark table, the rim catching the light) or of another colour gives nothing, and the disc
// keeps its matched plate colour. Overmolds (the rim piece is opaque) and Halo copies (the band is the dye) never call
// this: their photo does not show the core's colour.
export const TRUE_COLOR_INNER=.88;
export function trueColor(data,size,plate,{inner=TRUE_COLOR_INNER}={}){
 if(!/^#[0-9a-f]{6}$/i.test(plate||''))return null;
 const rim=rimColor(data,size,inner);if(!rim)return null;
 const P=labOf(hexLinear(plate)),T=labOf(hexLinear(rim));
 const chroma=l=>Math.hypot(l[1],l[2]),hue=l=>Math.atan2(l[2],l[1])*180/Math.PI;
 const turn=Math.abs(((hue(T)-hue(P))%360+540)%360-180);
 return P[0]-T[0]>=8&&chroma(T)>=.8*chroma(P)&&turn<=60?rim:null;
}
const hexLinear=h=>[1,3,5].map(i=>toLinear[parseInt(h.slice(i,i+2),16)]);
