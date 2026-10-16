// Only the disc survives (docs/photo-edge-cleanup.md). Nobody takes a perfect photo: the aligner's circle sits
// a little off the disc, so a crescent of table bakes into the texture, and fingers holding the disc cover its
// rim. Before PR #9 the shoulder cut-off hid both (they live in the photo's outer annulus); with the photo now
// running to the nose they show. This finds the disc's real edge in a stored texture and cleans it for display.
// It never changes what is stored: the same stored texture always gives the same plan and the same pixels.
//
// 1. The disc's edge: along 180 rays from the centre, the strongest colour steps; a robust circle fit (seeded
//    RANSAC, then least squares) over them. A disc is a rigid circle, so its edge is the one circle that many
//    rays agree on. Stamps and stripes give steps at every radius, which no circle gathers.
// 2. Re-registration: a disc edge that crosses the crop (off centre: the crop runs past it on one side and cuts
//    it on the other) is the photo's real edge. The texture is re-centred and re-scaled so that edge is the
//    model's nose: the user's own pixels, moved. Where the crop had cut the disc, its edge pixels are extended
//    outward along the disc's own radius. A circle wholly inside the crop and off centre is a stamp ring or a
//    band (concentric with the disc), never moved. A concentric circle is re-scaled only when what lies outside
//    it is busy and foreign to the disc (a table showing all round); a plain ring of one colour is plastic.
// 3. Foreign matter on the outer annulus (0.80 R to the nose): colours the face never shows, in patches that touch
//    the edge and span less than 150° (fingers, slivers of table). They are replaced by the disc's own pixels at
//    the same radius on either side, blended across the gap. Anything the face shows (stamp art continuous
//    with the face) and anything that runs all round (a band, a rim) stays. Nothing inside 0.80 R is touched:
//    a hand across the face is real occlusion and is left as it is.
export const ANALYSIS=256;
const RARE=.0025,BUSY=4,TAU=Math.PI*2,INNER=.8,FACE=.72,EDGE=.955,MAX_SPAN=150*Math.PI/180;

// A seeded stream (mulberry32): the plan is a pure function of the pixels.
function random(seed){return ()=>{seed=seed+0x6d2b79f5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}

// The disc's edge as a circle {x, y, r} in the sampler's frame (the crop is the unit circle), or null.
// sample(u, v) returns [r, g, b, a] or null off the image. mode 'texture' reads a stored crop (nothing past
// radius 1); 'photo' reads the raw photo around the aligner's circle.
export function findDiscCircle(sample,{isDisc=null,mode='texture',rays=180,from=.45,to=.995,step=1/128,rMin=.85,rMax=1.12,maxOffset=.16,tol=.018,minStep=14,seed=1}={}){
 const width=3,candidates=[],reach=[];
 for(let a=0;a<rays;a++){
  const t0=a/rays*TAU,c=Math.cos(t0),s=Math.sin(t0),colors=[];
  for(let t=from;t<=to+1e-9;t+=step){const p=sample(t*c,t*s);if(!p||p[3]<200)break;colors.push(p);}
  reach.push(from+(colors.length-1)*step);
  const strength=new Float32Array(colors.length);
  for(let k=width;k<colors.length;k++){
   const w=Math.min(width,colors.length-k);let dr=0,dg=0,db=0;
   for(let i=0;i<w;i++){dr+=colors[k+i][0]-colors[k-1-i][0];dg+=colors[k+i][1]-colors[k-1-i][1];db+=colors[k+i][2]-colors[k-1-i][2];}
   strength[k]=Math.hypot(dr,dg,db)/w;
  }
  const peaks=[];
  // The disc's edge has the disc inside it and something else outside: the step's two sides must differ, and
  // with isDisc (colours the face shows) the outside must not be the disc's (and in a stored crop, the inside
  // must). A glare arc on the shoulder or a stamp line has the disc's own plastic (or white) on both sides.
  const mean=(a,b)=>{const m=[0,0,0];for(let i=a;i<b;i++)for(let c=0;c<3;c++)m[c]+=colors[i][c]/(b-a);return m;};
  for(let k=width;k<colors.length;k++){
   const v=strength[k];if(v<minStep)continue;let top=true;for(let i=-2;i<=2&&top;i++)if(i&&strength[k+i]>v)top=false;if(!top)continue;
   const inside=mean(Math.max(0,k-5),k-1),outside=k+1<colors.length?mean(k+1,Math.min(colors.length,k+4)):colors[k];
   if(Math.hypot(inside[0]-outside[0],inside[1]-outside[1],inside[2]-outside[2])<minStep)continue;
   if(isDisc&&(isDisc(outside)||mode==='texture'&&!isDisc(inside)))continue;
   peaks.push({t:from+(k-.5)*step,s:v});
  }
  peaks.sort((p,q)=>q.s-p.s);candidates.push(peaks.slice(0,4));
 }
 const dir=a=>[Math.cos(a/rays*TAU),Math.sin(a/rays*TAU)];
 // Where the circle meets ray a (the origin is inside it), whether that point is in view, and whether a step lies there.
 const evaluate=(x,y,r)=>{
  let visible=0,inliers=0;const hits=[];
  for(let a=0;a<rays;a++){
   const [c,s]=dir(a),b=c*x+s*y,t=b+Math.sqrt(Math.max(0,b*b-x*x-y*y+r*r));
   if(t<from+4*step||t>reach[a]-2*step)continue;visible++;
   let best=null;for(const p of candidates[a])if(Math.abs(p.t-t)<=tol&&(!best||Math.abs(p.t-t)<Math.abs(best.t-t)))best=p;
   if(best){inliers++;hits.push([best.t*c,best.t*s]);}
  }
  // A real edge is seen wherever it is in view: each ray that should see it and does not costs two that do.
  return {visible,inliers,hits,score:inliers-2*(visible-inliers)};
 };
 const accept=(x,y,r,e)=>{
  if(r<rMin||r>rMax||Math.hypot(x,y)>maxOffset||e.visible<30||e.inliers<.7*e.visible)return false;
  if(mode!=='texture')return e.visible>=.6*rays;
  return true;
 };
 const rand=random(seed),usable=candidates.map((p,a)=>p.length?a:-1).filter(a=>a>=0);if(usable.length<20)return null;
 let best=null;
 for(let it=0;it<1500;it++){
  const pts=[];for(let k=0;k<3;k++){const a=usable[Math.floor(rand()*usable.length)],p=candidates[a][Math.floor(rand()*candidates[a].length)],[c,s]=dir(a);pts.push([p.t*c,p.t*s]);}
  const circle=circumcircle(pts);if(!circle)continue;
  const {x,y,r}=circle;if(r<rMin||r>rMax||Math.hypot(x,y)>maxOffset)continue;
  const e=evaluate(x,y,r);if(!accept(x,y,r,e))continue;
  // The disc's edge is the outermost circle: a band or a stamp ring inside it can gather as many rays, so a
  // larger circle with nearly the best support wins.
  if(!best||(r>best.r+.03?e.score>=.85*best.e.score:best.r>r+.03?e.score>best.e.score/.85:e.score>best.e.score))best={x,y,r,e};
 }
 if(!best)return null;
 // Least squares over the inliers, twice (each pass can gather a few more).
 for(let pass=0;pass<3;pass++){const fit=fitCircle(best.e.hits);if(!fit)break;const e=evaluate(fit.x,fit.y,fit.r);if(!accept(fit.x,fit.y,fit.r,e))break;best={...fit,e};}
 return {x:best.x,y:best.y,r:best.r,visible:best.e.visible,inliers:best.e.inliers,rays};
}
function circumcircle([[ax,ay],[bx,by],[cx,cy]]){
 const d=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by));if(Math.abs(d)<1e-9)return null;
 const a2=ax*ax+ay*ay,b2=bx*bx+by*by,c2=cx*cx+cy*cy,x=(a2*(by-cy)+b2*(cy-ay)+c2*(ay-by))/d,y=(a2*(cx-bx)+b2*(ax-cx)+c2*(bx-ax))/d;
 return {x,y,r:Math.hypot(ax-x,ay-y)};
}
// Algebraic (Kåsa) circle fit: x² + y² + Dx + Ey + F = 0 by least squares.
function fitCircle(points){
 if(points.length<6)return null;
 const M=[[0,0,0,0],[0,0,0,0],[0,0,0,0]];
 for(const [x,y] of points){const row=[x,y,1],z=-(x*x+y*y);for(let i=0;i<3;i++){for(let j=0;j<3;j++)M[i][j]+=row[i]*row[j];M[i][3]+=row[i]*z;}}
 for(let i=0;i<3;i++){let p=i;for(let k=i+1;k<3;k++)if(Math.abs(M[k][i])>Math.abs(M[p][i]))p=k;[M[i],M[p]]=[M[p],M[i]];if(Math.abs(M[i][i])<1e-12)return null;for(let k=0;k<3;k++)if(k!==i){const f=M[k][i]/M[i][i];for(let j=i;j<4;j++)M[k][j]-=f*M[i][j];}}
 const D=M[0][3]/M[0][0],E=M[1][3]/M[1][1],F=M[2][3]/M[2][2];
 let x=-D/2,y=-E/2,r=Math.sqrt(Math.max(0,x*x+y*y-F));
 // The algebraic fit leans toward smaller circles on a partial arc; a few Gauss-Newton steps on the geometric
 // distance (|p − c| − r) remove that bias.
 for(let it=0;it<8;it++){
  const A=[[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  for(const [px,py] of points){const d=Math.hypot(px-x,py-y)||1e-9,J=[-(px-x)/d,-(py-y)/d,-1],res=d-r;for(let i=0;i<3;i++){for(let j=0;j<3;j++)A[i][j]+=J[i]*J[j];A[i][3]-=J[i]*res;}}
  const step=solve3(A);if(!step)break;x+=step[0];y+=step[1];r+=step[2];if(Math.hypot(...step)<1e-7)break;
 }
 return {x,y,r};
}
function solve3(M){
 for(let i=0;i<3;i++){let p=i;for(let k=i+1;k<3;k++)if(Math.abs(M[k][i])>Math.abs(M[p][i]))p=k;[M[i],M[p]]=[M[p],M[i]];if(Math.abs(M[i][i])<1e-12)return null;for(let k=0;k<3;k++)if(k!==i){const f=M[k][i]/M[i][i];for(let j=i;j<4;j++)M[k][j]-=f*M[i][j];}}
 return [M[0][3]/M[0][0],M[1][3]/M[1][1],M[2][3]/M[2][2]];
}

// Bilinear RGBA at unit coordinates (the crop's circle is radius 1) of an n × n image.
function sampler(data,n){
 return (u,v)=>{
  const x=(u+1)/2*n-.5,y=(v+1)/2*n-.5;if(x<0||y<0||x>n-1||y>n-1)return null;
  const i=Math.min(n-2,Math.floor(x)),j=Math.min(n-2,Math.floor(y)),fx=x-i,fy=y-j,k=4*(j*n+i),out=[0,0,0,0];
  for(let c=0;c<4;c++)out[c]=(data[k+c]*(1-fx)+data[k+4+c]*fx)*(1-fy)+(data[k+4*n+c]*(1-fx)+data[k+4*n+4+c]*fx)*fy;
  return out;
 };
}
// The registered source position of output point (u, v): the detected edge maps to radius 1. Where that falls
// outside what the crop kept, the disc's own edge pixel along its radius stands in (extension).
function source(reg,u,v,limit){
 if(!reg)return [u,v,false];
 let x=reg.x+reg.r*u,y=reg.y+reg.r*v;
 if(x*x+y*y<=limit*limit)return [x,y,false];
 const dx=x-reg.x,dy=y-reg.y,b=reg.x*dx+reg.y*dy,a=dx*dx+dy*dy,c=reg.x*reg.x+reg.y*reg.y-limit*limit,t=(-b+Math.sqrt(Math.max(0,b*b-a*c)))/a;
 return [reg.x+dx*t,reg.y+dy*t,true];
}
// Colour support: how much of the face shares a pixel's colour. Coloured pixels compare by chromaticity (r and g
// shares of r + g + b, 32 bins each, read with their neighbours), which ignores brightness: the plate darkening
// over the shoulder, or a stamp brightened by the light removal, still matches the face. Grey, white, black and
// very dark pixels have no reliable hue and compare by brightness instead (16 bins): a grey table is foreign
// to a disc whose only neutral is white ink.
const CHROMA=32,NEUTRAL=CHROMA*CHROMA;
function histogram(){return new Float32Array(NEUTRAL+16);}
const bin=(r,g,b)=>{const s=r+g+b,max=Math.max(r,g,b),min=Math.min(r,g,b);if(max<40||max-min<.14*max)return NEUTRAL+(Math.round(.2126*r+.7152*g+.0722*b)>>4);return Math.min(CHROMA-1,Math.floor(r/s*CHROMA))*CHROMA+Math.min(CHROMA-1,Math.floor(g/s*CHROMA));};
function support(h,total,r,g,b){
 const c=bin(r,g,b);let sum=0;
 if(c>=NEUTRAL){for(let i=Math.max(NEUTRAL,c-1);i<=Math.min(NEUTRAL+15,c+1);i++)sum+=h[i];return sum/total;}
 const R=Math.floor(c/CHROMA),G=c%CHROMA;
 for(let i=Math.max(0,R-1);i<=Math.min(CHROMA-1,R+1);i++)for(let j=Math.max(0,G-1);j<=Math.min(CHROMA-1,G+1);j++)sum+=h[i*CHROMA+j];
 return sum/total;
}
// Only smooth pixels teach the face's colours: the antialiased edge of white ink on red plastic runs through
// every pinkish shade between them, and would vouch for wood or skin.
const smooth=(a,b)=>!!b&&Math.abs(a[0]-b[0])<=10&&Math.abs(a[1]-b[1])<=10&&Math.abs(a[2]-b[2])<=10;
// isDisc for findDiscCircle: the colours `sample` shows within `radius` of the centre (the disc's middle).
export function discColours(sample,radius=.6,steps=64,d=1/128){
 const h=histogram();let total=0;
 for(let j=0;j<steps;j++)for(let i=0;i<steps;i++){
  const u=((i+.5)/steps*2-1)*radius,v=((j+.5)/steps*2-1)*radius;if(u*u+v*v>radius*radius)continue;const p=sample(u,v);if(!p||p[3]<250)continue;total++;
  if(smooth(p,sample(u+d,v))&&smooth(p,sample(u-d,v))&&smooth(p,sample(u,v+d))&&smooth(p,sample(u,v-d)))h[bin(p[0],p[1],p[2])]++;
 }
 return ([r,g,b])=>support(h,Math.max(1,total),r,g,b)>=RARE;
}
function smoothAt(data,n,k){const p=[data[k],data[k+1],data[k+2]],q=o=>[data[k+o],data[k+o+1],data[k+o+2]];return smooth(p,q(4))&&smooth(p,q(-4))&&smooth(p,q(4*n))&&smooth(p,q(-4*n));}

// The plan for one stored texture, from its n × n RGBA pixels (n = ANALYSIS): {changed, reg, mask, report}.
// reg {x, y, r}: the registration, or null. mask: n × n, non-zero where foreign matter is replaced (output frame).
export function planCleanup(data,n=ANALYSIS){
 const at=sampler(data,n),report={edge:null,register:null,foreign:null};
 // The face before anything is known: the middle of the crop, which any framing keeps on the disc.
 const edge=findDiscCircle(at,{mode:'texture',step:1/(n/2),isDisc:discColours(at)});
 if(edge)report.edge={x:+edge.x.toFixed(4),y:+edge.y.toFixed(4),r:+edge.r.toFixed(4),inliers:edge.inliers,visible:edge.visible};
 // The face's colours, inside the edge (or the crop) and well clear of the annulus.
 const faceOf=(cx,cy,r)=>{
  const h=histogram();let total=0;
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const u=(i+.5)/n*2-1,v=(j+.5)/n*2-1,k=4*(j*n+i);if(Math.hypot(u-cx,v-cy)<FACE*r&&data[k+3]>=250){{if(smoothAt(data,n,k))h[bin(data[k],data[k+1],data[k+2])]++;total++;}}}
  return {h,total:Math.max(1,total)};
 };
 let reg=null;
 if(edge){
  const offset=Math.hypot(edge.x,edge.y),face=faceOf(edge.x,edge.y,edge.r);
  // What lies between the edge and the crop's own edge, and how much of it the face never shows.
  // Its texture: the mean colour difference between neighbouring pixels. Wood grain, carpet or grass is busy;
  // plastic, even a band in a second colour, is smooth.
  let outside=0,rare=0,energy=0;
  const L=k=>.2126*data[k]+.7152*data[k+1]+.0722*data[k+2];
  for(let j=1;j<n-1;j++)for(let i=1;i<n-1;i++){
   const u=(i+.5)/n*2-1,v=(j+.5)/n*2-1,k=4*(j*n+i);
   if(Math.hypot(u,v)>.97||Math.hypot(u-edge.x,v-edge.y)<edge.r+.015||data[k+3]<250)continue;
   outside++;if(support(face.h,face.total,data[k],data[k+1],data[k+2])<RARE)rare++;
   energy+=Math.abs(L(k+4)-L(k-4))+Math.abs(L(k+4*n)-L(k-4*n));
  }
  const rareShare=outside?rare/outside:0,busy=outside?energy/outside/2:0;
  report.outside={pixels:outside,rare:+rareShare.toFixed(3),busy:+busy.toFixed(2)};
  // An edge that crosses the crop (off centre: the crop runs past it on one side and cuts the disc on the other)
  // with something foreign outside it is the photo's real edge.
  const crosses=offset>=.012&&edge.visible<=.92*edge.rays&&rareShare>=.35;
  // A circle wholly inside the crop is either a generous framing (table all round) or the disc's own band or
  // stamp ring. Only a busy, foreign ring all round is table; a smooth one could be plastic and stays.
  const ring=edge.visible>.92*edge.rays&&edge.r<=.975&&rareShare>=.6&&busy>=BUSY;
  // Inset a hair so the edge's own blend with the table stays outside.
  if(crosses||ring)reg={x:edge.x,y:edge.y,r:edge.r-.008};
 }
 report.register=reg&&{x:+reg.x.toFixed(4),y:+reg.y.toFixed(4),r:+reg.r.toFixed(4)};
 // The registered image at analysis size, for the annulus pass.
 const view=reg?render(data,n,n,{reg,mask:null}):data;
 const face=histogram();let faceTotal=0;
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const u=(i+.5)/n*2-1,v=(j+.5)/n*2-1,k=4*(j*n+i);if(Math.hypot(u,v)<FACE&&view[k+3]>=250){{if(smoothAt(view,n,k))face[bin(view[k],view[k+1],view[k+2])]++;faceTotal++;}}}
 const rare=new Uint8Array(n*n);
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){
  const u=(i+.5)/n*2-1,v=(j+.5)/n*2-1,r=Math.hypot(u,v),k=4*(j*n+i);
  if(r<INNER||r>=1||view[k+3]<128)continue;
  if(support(face,Math.max(1,faceTotal),view[k],view[k+1],view[k+2])<RARE)rare[j*n+i]=1;
 }
 // Connected patches of rare colour; keep those that reach the edge, span under 150° and have a smooth core
 // (skin, wood): an antialiased stripe edge or a glare line is rare in colour but only ever a thin line.
 const mask=new Uint8Array(n*n),seen=new Uint8Array(n*n),patches=[];
 for(let start=0;start<n*n;start++){
  if(!rare[start]||seen[start])continue;
  const stack=[start],cells=[];seen[start]=1;let edgeTouch=false,core=0;
  while(stack.length){
   const c=stack.pop(),i=c%n,j=(c-i)/n;cells.push(c);if(smoothAt(view,n,4*c))core++;
   if(Math.hypot((i+.5)/n*2-1,(j+.5)/n*2-1)>=EDGE)edgeTouch=true;
   for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=n||jj>=n)continue;const d=jj*n+ii;if(rare[d]&&!seen[d]){seen[d]=1;stack.push(d);}}
  }
  if(cells.length<24||core<16||core<.15*cells.length||!edgeTouch)continue;
  const angles=cells.map(c=>{const i=c%n,j=(c-i)/n;return Math.atan2((j+.5)/n*2-1,(i+.5)/n*2-1);}).sort((a,b)=>a-b);
  let gap=angles[0]+TAU-angles[angles.length-1];for(let k=1;k<angles.length;k++)gap=Math.max(gap,angles[k]-angles[k-1]);
  const span=TAU-gap;if(span>MAX_SPAN)continue;
  patches.push({pixels:cells.length,core,span:+(span*180/Math.PI).toFixed(1)});
  for(const c of cells)mask[c]=1;
 }
 // Two pixels of margin catch each patch's soft edge (finger shadows, antialiasing), still only on the annulus.
 let masked=0;
 if(patches.length){
  const grown=new Uint8Array(mask);
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){
   if(!mask[j*n+i])continue;
   for(let dj=-2;dj<=2;dj++)for(let di=-2;di<=2;di++){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=n||jj>=n)continue;if(Math.hypot((ii+.5)/n*2-1,(jj+.5)/n*2-1)>=INNER-.01)grown[jj*n+ii]=1;}
  }
  mask.set(grown);for(const v of mask)masked+=v;
 }
 report.foreign=patches.length?{patches,pixels:masked}:null;
 // For each masked cell, how far the patch runs either way round at its radius (radians): the fill takes the
 // disc's own pixels just past both ends. cells[c] is 1 + the cell's slot in gaps (0: not masked), so a plan
 // stays small (128 KiB of index and 8 bytes per masked cell) on its way to the worker.
 let cells=null,gaps=null;
 if(masked){
  cells=new Uint16Array(n*n);gaps=new Float32Array(2*masked);let slot=0;
  const inMask=(u,v)=>{const i=Math.floor((u+1)/2*n),j=Math.floor((v+1)/2*n);return i>=0&&j>=0&&i<n&&j<n&&mask[j*n+i]===1;};
  for(let c=0;c<n*n;c++){
   if(!mask[c])continue;const i=c%n,j=(c-i)/n,u=(i+.5)/n*2-1,v=(j+.5)/n*2-1,r=Math.hypot(u,v),a=Math.atan2(v,u),d=1/(Math.max(r,.5)*n);let lo=0,hi=0;
   while(lo<Math.PI&&inMask(r*Math.cos(a-lo),r*Math.sin(a-lo)))lo+=d;
   while(hi<Math.PI&&inMask(r*Math.cos(a+hi),r*Math.sin(a+hi)))hi+=d;
   cells[c]=++slot;gaps[2*slot-2]=lo+2*d;gaps[2*slot-1]=hi+2*d;
  }
 }
 return {changed:!!reg||masked>0,reg,mask:cells,gaps,n,report};
}

// The cleaned n × n RGBA (unflipped) for `size` × `size` source pixels and a plan. Pixels the plan does not
// touch are copied as they are.
export function applyCleanup(data,size,plan){return render(data,size,plan.n,plan);}
function render(data,size,n,{reg,mask,gaps}){
 const out=new Uint8ClampedArray(data.length),at=sampler(data,size),limit=1-3/size;
 if(!reg)out.set(data);
 const cell=(u,v)=>{if(!mask)return -1;const i=Math.floor((u+1)/2*n),j=Math.floor((v+1)/2*n);return i>=0&&j>=0&&i<n&&j<n&&mask[j*n+i]?j*n+i:-1;};
 const colour=(u,v)=>{const [x,y]=source(reg,u,v,limit);return at(x,y)||[0,0,0,0];};
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const u=(i+.5)/size*2-1,v=(j+.5)/size*2-1,r=Math.hypot(u,v),k=4*(j*size+i);
  if(r>=1){if(reg)out[k]=out[k+1]=out[k+2]=out[k+3]=0;continue;}
  const m=cell(u,v),foreign=m>=0;
  if(!reg&&!foreign)continue;
  let c;
  if(foreign){
   // The disc's own pixels at this radius on either side of the patch, blended by angular distance.
   const a=Math.atan2(v,u),ci=m%n,cj=(m-ci)/n;let da=a-Math.atan2((cj+.5)/n*2-1,(ci+.5)/n*2-1);da-=TAU*Math.round(da/TAU);
   const g=2*(mask[m]-1),lo=Math.max(1e-4,gaps[g]+da),hi=Math.max(1e-4,gaps[g+1]-da);
   const p=colour(r*Math.cos(a-lo),r*Math.sin(a-lo)),q=colour(r*Math.cos(a+hi),r*Math.sin(a+hi)),w=lo/(lo+hi);
   c=[0,1,2,3].map(ch=>p[ch]*(1-w)+q[ch]*w);
  }else c=colour(u,v);
  out[k]=c[0];out[k+1]=c[1];out[k+2]=c[2];
  // The crop's antialiased feather, now on the detected edge.
  out[k+3]=reg?Math.round(255*Math.min(1,(1-r)*size/2)):data[k+3];
 }
 return out;
}

// A stored photo (its WebP blob) in and out. The worker (photo-clean-worker.mjs) runs these off the main thread;
// photo.mjs falls back to running them here when a worker cannot.
const canvasOf=n=>typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(n,n):Object.assign(document.createElement('canvas'),{width:n,height:n});
function pixelsOf(image,n){const g=canvasOf(n).getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0,n,n);return g.getImageData(0,0,n,n).data;}
export async function planPhoto(blob){
 const start=performance.now(),small=await createImageBitmap(blob,{resizeWidth:ANALYSIS,resizeHeight:ANALYSIS,resizeQuality:'high'});
 try{const plan=planCleanup(pixelsOf(small,ANALYSIS));plan.ms=performance.now()-start;return plan;}finally{small.close();}
}
// The cleaned photo at `size`, flipped for WebGL as the uncleaned path's imageOrientation:'flipY' would be.
export async function cleanPhoto(blob,size,plan){
 const raw=await createImageBitmap(blob,{resizeWidth:size,resizeHeight:size,resizeQuality:'high'});
 let data;try{data=pixelsOf(raw,size);}finally{raw.close();}
 const clean=applyCleanup(data,size,plan),flipped=new Uint8ClampedArray(clean.length),row=size*4;
 for(let j=0;j<size;j++)flipped.set(clean.subarray(j*row,(j+1)*row),(size-1-j)*row);
 return createImageBitmap(new ImageData(flipped,size,size));
}
