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
//
// Round 2 (docs/photo-edge-cleanup.md): bright and pale discs on pale backgrounds, with glare on the rim.
// 4. Confidence. Only a sure fit (a third of the circumference sees the step, four in five of the rays that
//    should) moves pixels. Without one, a second search judges each step by its own ray's colours, which finds
//    a pale disc's edge on a pale table and a white-stamped disc's edge on a white one.
// 5. Safety. When an edge is likely but can't be placed, the photo stops inside every step that supports it
//    (never inside the old shoulder) and the plate's own plastic shows past it, as before PR #9: a slightly
//    short photo, never a crescent of table. Where the crop had cut the disc, foreign matter that crossed the
//    crop's edge is not repeated outward: it is filled from the clean edge either side.
// 6. Glare along the rim is the disc's own light and stays; filling it smeared art under it into a band.
export const ANALYSIS=256;
const RARE=.0025,BUSY=4,TAU=Math.PI*2,INNER=.8,FACE=.72,EDGE=.955,MAX_SPAN=150*Math.PI/180;
// Round 2: a ray's own disc runs from RAY_FROM to RAY_DISC; a colour is foreign to it beyond RAY_FOREIGN (alike);
// a step needs RUN samples of foreign beyond it and moves in at most REFINE samples to where that run begins.
// Fits: SURE and LIKELY inliers (and shares of the rays in view). FLOOR: the stop never falls inside the old
// shoulder. FEATHER: the stop's fade. GLARE: a glare pixel's brightness against the photo's white; a glare
// patch spans GLARE_SPAN at least. A colour seen in AROUND of SECTORS round the annulus runs all round.
const RAY_FROM=.62,RAY_DISC=.8,RUN=3,REFINE=6,RAY_FOREIGN=12,SURE=54,SURE_SHARE=.8,LIKELY=20,LIKELY_SHARE=.55,FLOOR=.8,FEATHER=.015,GLARE=.82,GLARE_SPAN=20*Math.PI/180,CUT_MARGIN=4,SECTORS=32,AROUND=22;

// A seeded stream (mulberry32): the plan is a pure function of the pixels.
function random(seed){return ()=>{seed=seed+0x6d2b79f5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}

// The disc's edge as a circle {x, y, r} in the sampler's frame (the crop is the unit circle), or null.
// sample(u, v) returns [r, g, b, a] or null off the image. mode 'texture' reads a stored crop (nothing past
// radius 1); 'photo' reads the raw photo around the aligner's circle.
//
// gate 'face' (round 1): a step's outside must be a colour the face never shows (isDisc). gate 'ray' (round 2,
// stored textures only): its outside must be a colour this ray's own stretch of disc never shows (from `from` to
// RAY_DISC, compared by alike()), and stay that way out to the crop's edge. On a pale disc on a pale table, or a
// disc with white ink on a white floor, the background is "a colour the face shows" somewhere, but rarely on the
// same ray as the edge it meets. A glare arc on the shoulder is foreign too, but the plastic comes back past it.
// With gate 'ray', a circle that leaves the crop on a ray where such a step lies inside the crop counts as
// missing there (the disc ended sooner on that ray), and a larger circle displaces a smaller one only when they
// are concentric (a band inside the edge): two circles through the same partial arc are the same evidence.
export function findDiscCircle(sample,{isDisc=null,gate='face',mode='texture',rays=180,from=.45,to=.995,step=1/128,rMin=.85,rMax=1.12,maxOffset=.16,tol=.018,minStep=14,seed=1,debug=false}={}){
 const width=3,candidates=[],reach=[];
 for(let a=0;a<rays;a++){
  const t0=a/rays*TAU,c=Math.cos(t0),s=Math.sin(t0),colors=[];
  for(let t=from;t<=to+1e-9;t+=step){const p=sample(t*c,t*s);if(!p||p[3]<200)break;colors.push(p);}
  reach.push(from+(colors.length-1)*step);
  // The ray's own disc, as distinct tints (a plain ray has a handful).
  let own=null;
  if(gate==='ray'){const seen=new Set();own=[];for(const p of colors.slice(Math.max(0,Math.round((RAY_FROM-from)/step)),Math.max(1,Math.round((RAY_DISC-from)/step)))){const q=tint(p),key=Math.round(q[0]/3)+','+Math.round(q[1]/3)+','+Math.round(q[2]/12);if(!seen.has(key)){seen.add(key);own.push(q);}}}
  const foreignTo=o=>{const q=tint(o);return !own.some(p=>alike(p,q));};
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
   let at=k;
   if(own){
    if(from+k*step<RAY_DISC||!foreignTo(outside))continue;
    if(colors.length-k-1<RUN)continue;let away=0;for(let i=k+1;i<colors.length;i++)away+=foreignTo(colors[i]);if(away<.7*(colors.length-k-1))continue;
    // The strongest change can lie out in a soft shadow, the table's own colour a shade darker: the edge is
    // where that run begins (not glare on the plastic, which is foreign to the ray but not like the table).
    const out=tint(outside);while(at>k-REFINE&&from+(at-1)*step>=RAY_DISC&&foreignTo(colors[at-1])&&alike(out,tint(colors[at-1])))at--;
   }
   peaks.push({t:from+(at-.5)*step,s:v});
  }
  peaks.sort((p,q)=>q.s-p.s);candidates.push(peaks.slice(0,4));
 }
 const dir=a=>[Math.cos(a/rays*TAU),Math.sin(a/rays*TAU)];
 // Where the circle meets ray a (the origin is inside it), whether that point is in view, and whether a step lies there.
 const evaluate=(x,y,r)=>{
  let visible=0,inliers=0;const hits=[];
  for(let a=0;a<rays;a++){
   const [c,s]=dir(a),b=c*x+s*y,t=b+Math.sqrt(Math.max(0,b*b-x*x-y*y+r*r));
   if(t<from+4*step)continue;
   if(t>reach[a]-2*step)continue;visible++;
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
  const nested=!best||gate!=='ray'||Math.hypot(x-best.x,y-best.y)<.03;
  if(!best||(nested&&r>best.r+.03?e.score>=.85*best.e.score:nested&&best.r>r+.03?e.score>best.e.score/.85:e.score>best.e.score))best={x,y,r,e};
 }
 if(!best)return null;
 // Least squares over the inliers, twice (each pass can gather a few more).
 for(let pass=0;pass<3;pass++){const fit=fitCircle(best.e.hits);if(!fit)break;const e=evaluate(fit.x,fit.y,fit.r);if(!accept(fit.x,fit.y,fit.r,e))break;best={...fit,e};}
 const out={x:best.x,y:best.y,r:best.r,visible:best.e.visible,inliers:best.e.inliers,rays,hits:best.e.hits};
 if(debug)out.candidates=candidates;
 return out;
}
// How sure a texture-mode fit is (docs/photo-edge-cleanup.md, round 2). 'sure': a third of the circumference
// sees the step, and four in five of the rays that should see it do. 'likely': a real arc, not a few strays.
// Anything less is no evidence at all.
export function confidence(edge){
 if(!edge)return 'none';
 if(edge.inliers>=SURE&&edge.inliers>=SURE_SHARE*edge.visible)return 'sure';
 if(edge.inliers>=LIKELY&&edge.inliers>=LIKELY_SHARE*edge.visible)return 'likely';
 return 'none';
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
//
// Fine bins (round 2, stored textures): pale pixels keep their tint too. The upload's light removal pulls a pale
// disc toward grey and skin on it toward beige, so both fall in one brightness bin; their tint (r − g and
// (r + g)/2 − b, in steps of 7 levels) still tells them apart. Very dark pixels stay brightness only.
const CHROMA=32,NEUTRAL=CHROMA*CHROMA,TINT=11,TSTEP=7,FINE=NEUTRAL+16*TINT*TINT;
function histogram(fine=false){return new Float32Array(fine?FINE:NEUTRAL+16);}
const bin=(r,g,b)=>{const s=r+g+b,max=Math.max(r,g,b),min=Math.min(r,g,b);if(max<40||max-min<.14*max)return NEUTRAL+(Math.round(.2126*r+.7152*g+.0722*b)>>4);return Math.min(CHROMA-1,Math.floor(r/s*CHROMA))*CHROMA+Math.min(CHROMA-1,Math.floor(g/s*CHROMA));};
const tintBin=v=>Math.max(0,Math.min(TINT-1,Math.round(v/TSTEP)+(TINT>>1)));
const fineBin=(r,g,b)=>{const c=bin(r,g,b);if(c<NEUTRAL)return c;const l=c-NEUTRAL,dark=Math.max(r,g,b)<40;return NEUTRAL+(l*TINT+(dark?TINT>>1:tintBin(r-g)))*TINT+(dark?TINT>>1:tintBin((r+g)/2-b));};
// The bins next to bin c (c included), in either scheme.
function neighbours(c,fine,visit){
 if(c>=NEUTRAL&&fine){
  const q=c-NEUTRAL,L=Math.floor(q/(TINT*TINT)),A=Math.floor(q/TINT)%TINT,B=q%TINT;
  for(let l=Math.max(0,L-1);l<=Math.min(15,L+1);l++)for(let a=Math.max(0,A-1);a<=Math.min(TINT-1,A+1);a++)for(let b=Math.max(0,B-1);b<=Math.min(TINT-1,B+1);b++)visit(NEUTRAL+(l*TINT+a)*TINT+b);
 }else if(c>=NEUTRAL){for(let i=Math.max(NEUTRAL,c-1);i<=Math.min(NEUTRAL+15,c+1);i++)visit(i);}
 else{const R=Math.floor(c/CHROMA),G=c%CHROMA;for(let i=Math.max(0,R-1);i<=Math.min(CHROMA-1,R+1);i++)for(let j=Math.max(0,G-1);j<=Math.min(CHROMA-1,G+1);j++)visit(i*CHROMA+j);}
}
function support(h,total,r,g,b,fine=false){let sum=0;neighbours(fine?fineBin(r,g,b):bin(r,g,b),fine,i=>sum+=h[i]);return sum/total;}
// A colour's tint: chroma (r − g, (r + g)/2 − b) scaled to its brightness, and the brightness. alike(): the same
// tint (within RAY_FOREIGN levels at brightness 200) at a brightness the light could have given the same plastic
// or ink (the shoulder darkens it, glare brightens it). White ink and a grey floor are alike; pale pink plastic
// and a cream table, or orange plastic and its shoulder's shade, are told apart by tint.
function tint(c){const L=.2126*c[0]+.7152*c[1]+.0722*c[2],s=200/Math.max(L,60);return [(c[0]-c[1])*s,((c[0]+c[1])/2-c[2])*s,L];}
const alike=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1])<RAY_FOREIGN&&q[2]>=.55*p[2]-8&&q[2]<=1.45*p[2]+8;
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
// smooth() against the four neighbours of pixel k (byte offset) in an n × n image, without allocating.
function smoothAt(data,n,k){
 for(const o of [4,-4,4*n,-4*n]){if(!(Math.abs(data[k]-data[k+o])<=10&&Math.abs(data[k+1]-data[k+o+1])<=10&&Math.abs(data[k+2]-data[k+o+2])<=10))return false;}
 return true;
}
const round4=e=>e&&{x:+e.x.toFixed(4),y:+e.y.toFixed(4),r:+e.r.toFixed(4),inliers:e.inliers,visible:e.visible,confidence:confidence(e)};

// The plan for one stored texture, from its n × n RGBA pixels (n = ANALYSIS): {changed, reg, stop, mask, report}.
// reg {x, y, r}: the registration, or null. stop: the radius the photo stops at (the old shoulder look), or null.
// mask: n × n, non-zero where foreign matter is replaced (output frame).
export function planCleanup(data,n=ANALYSIS){
 const at=sampler(data,n),report={edge:null,register:null,foreign:null};
 // The face before anything is known: the middle of the crop, which any framing keeps on the disc.
 let edge=findDiscCircle(at,{mode:'texture',step:1/(n/2),isDisc:discColours(at)});
 if(edge)report.edge=round4(edge);
 // Round 2: only a sure fit moves pixels. Without one, the same search by each ray's own colours; a likely fit
 // from that search is evidence of an edge that cannot be placed, and the photo stops short of it.
 let likely=null;
 if(confidence(edge)!=='sure'){
  const byRay=findDiscCircle(at,{mode:'texture',gate:'ray',step:1/(n/2)});
  if(byRay)report.ray=round4(byRay);
  if(confidence(byRay)==='sure'){edge=byRay;likely=null;}
  else{edge=null;if(confidence(byRay)==='likely')likely=byRay;}
 }
 // The face's colours, inside a circle and well clear of the annulus.
 const faceOf=(cx,cy,r)=>{
  const h=histogram(),f=histogram(true);let total=0;
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){const u=(i+.5)/n*2-1,v=(j+.5)/n*2-1,k=4*(j*n+i);if(Math.hypot(u-cx,v-cy)<FACE*r&&data[k+3]>=250){if(smoothAt(data,n,k)){h[bin(data[k],data[k+1],data[k+2])]++;f[fineBin(data[k],data[k+1],data[k+2])]++;}total++;}}
  return {h,f,total:Math.max(1,total)};
 };
 // What lies between a circle and the crop's own edge: how much of it is foreign, and its texture. Foreign: a
 // colour the face never shows, or (round 2) a colour other than the plastic just inside the circle on its own
 // radius, by tint. Texture: the mean colour difference between neighbouring pixels. Wood grain, carpet or
 // grass is busy; plastic, even a band in a second colour, is smooth.
 const beyond=c=>{
  const face=faceOf(c.x,c.y,c.r);let outside=0,rare=0,foreign=0,energy=0;
  const L=k=>.2126*data[k]+.7152*data[k+1]+.0722*data[k+2];
  for(let j=1;j<n-1;j++)for(let i=1;i<n-1;i++){
   const u=(i+.5)/n*2-1,v=(j+.5)/n*2-1,k=4*(j*n+i),d=Math.hypot(u-c.x,v-c.y);
   if(Math.hypot(u,v)>.97||d<c.r+.015||data[k+3]<250)continue;
   outside++;const p=[data[k],data[k+1],data[k+2]];
   if(support(face.h,face.total,...p)<RARE)rare++;
   const s=(c.r-.04)/d,inner=at(c.x+(u-c.x)*s,c.y+(v-c.y)*s);
   if(support(face.f,face.total,...p,true)<RARE||inner&&!alike(tint(inner),tint(p)))foreign++;
   energy+=Math.abs(L(k+4)-L(k-4))+Math.abs(L(k+4*n)-L(k-4*n));
  }
  return {pixels:outside,rare:outside?+(rare/outside).toFixed(3):0,foreign:outside?+(foreign/outside).toFixed(3):0,busy:outside?+(energy/outside/2).toFixed(2):0};
 };
 let reg=null,stop=null;
 if(edge){
  const offset=Math.hypot(edge.x,edge.y),out=report.outside=beyond(edge);
  // An edge that crosses the crop (off centre: the crop runs past it on one side and cuts the disc on the other)
  // with something foreign outside it is the photo's real edge.
  const crosses=offset>=.012&&edge.visible<=.92*edge.rays&&Math.max(out.rare,out.foreign)>=.35;
  // A circle wholly inside the crop is either a generous framing (table all round) or the disc's own band or
  // stamp ring. Only a busy, foreign ring all round is table; a smooth one could be plastic and stays.
  const ring=edge.visible>.92*edge.rays&&edge.r<=.975&&Math.max(out.rare,out.foreign)>=.6&&out.busy>=BUSY;
  // Inset a hair so the edge's own blend with the table stays outside.
  if(crosses||ring)reg={x:edge.x,y:edge.y,r:edge.r-.008};
 }else if(likely&&likely.r-Math.hypot(likely.x,likely.y)<.99){
  // An edge that can't be placed. The photo stops where the disc is certain, inside every step that supports the
  // likeliest circle, never inside the old shoulder: a slightly short photo, never a crescent of table. Only
  // when what lies past it is foreign; a smooth ring all round is a band.
  const out=report.outside=beyond(likely),ringLike=likely.visible>.92*likely.rays&&out.busy<BUSY;
  if(out.foreign>=.35&&!ringLike)stop=Math.max(FLOOR,Math.min(.985,...likely.hits.map(([x,y])=>Math.hypot(x,y)))-.012);
 }
 report.register=reg&&{x:+reg.x.toFixed(4),y:+reg.y.toFixed(4),r:+reg.r.toFixed(4)};
 report.stop=stop&&+stop.toFixed(4);
 // The registered image at analysis size, for the annulus pass.
 const view=reg?render(data,n,n,{reg,mask:null,stop:null,n}):data;
 // The face's colours (fine bins), and the colours that run all round the annulus (a band, a rim, the disc's own
 // plastic on the shoulder): a patch of rare colour joined to a ring of plastic is still a patch.
 const face=histogram(true);let faceTotal=0;
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const u=(i+.5)/n*2-1,v=(j+.5)/n*2-1,k=4*(j*n+i);if(Math.hypot(u,v)<FACE&&view[k+3]>=250){{if(smoothAt(view,n,k))face[fineBin(view[k],view[k+1],view[k+2])]++;faceTotal++;}}}
 const sectors=new Uint8Array(FINE*SECTORS),bins=new Int16Array(n*n).fill(-1);
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){
  const u=(i+.5)/n*2-1,v=(j+.5)/n*2-1,r=Math.hypot(u,v),k=4*(j*n+i);
  // Past the stop nothing shows; there a crescent would only join the patches it touches into one ring.
  if(r<INNER||r>=(stop||1)||view[k+3]<128)continue;
  const c=bins[j*n+i]=fineBin(view[k],view[k+1],view[k+2]),s=Math.min(SECTORS-1,Math.floor((Math.atan2(v,u)+Math.PI)/TAU*SECTORS));if(sectors[c*SECTORS+s]<255)sectors[c*SECTORS+s]++;
 }
 const around=new Map(),aroundOf=c=>{
  let hit=around.get(c);if(hit!==undefined)return hit;
  const seen=new Uint16Array(SECTORS);neighbours(c,true,b=>{for(let s=0;s<SECTORS;s++)seen[s]+=sectors[b*SECTORS+s];});
  let count=0;for(const v of seen)count+=v>=3;hit=count>=AROUND;around.set(c,hit);return hit;
 };
 // Glare is the disc's own light, kept (round 1 kept thin arcs; a broad one on a glossy rim has a smooth core,
 // and filling it smears any art under it into a band). Glare is the photo's own white (its brightest half
 // percent, which the light removal tints the same way), laid along the rim: a patch of rare colour that is
 // mostly that white and runs round the disc far more than across it. Its white pixels are kept; anything else
 // in it (a thumb on the glare) is still judged as a patch. A finger's white nail is part of a finger.
 const hist=new Uint32Array(256);let lit=0,white=[0,0,0],cut=255,weight=0;
 for(let c=0;c<n*n;c++){const k=4*c;if(view[k+3]>=250){hist[Math.round(.2126*view[k]+.7152*view[k+1]+.0722*view[k+2])]++;lit++;}}
 for(let seen=0;cut>0&&(seen+=hist[cut])<.005*lit;cut--);
 for(let c=0;c<n*n;c++){const k=4*c;if(view[k+3]>=250&&Math.round(.2126*view[k]+.7152*view[k+1]+.0722*view[k+2])>=cut){for(let ch=0;ch<3;ch++)white[ch]+=view[k+ch];weight++;}}
 white=tint(white.map(v=>v/Math.max(1,weight)));
 const rare=new Uint8Array(n*n),lightish=new Uint8Array(n*n),rareBin=new Map();
 for(let c=0;c<n*n;c++){
  const b=bins[c];if(b<0)continue;
  let hit=rareBin.get(b);if(hit===undefined){let sum=0;neighbours(b,true,x=>sum+=face[x]);hit=sum/Math.max(1,faceTotal)<RARE&&!aroundOf(b);rareBin.set(b,hit);}
  if(!hit)continue;rare[c]=1;
  const p=tint([view[4*c],view[4*c+1],view[4*c+2]]);if(Math.hypot(p[0]-white[0],p[1]-white[1])<RAY_FOREIGN&&p[2]>=GLARE*white[2])lightish[c]=1;
 }
 // Connected groups of set cells: visit(cells) for each.
 const groups=(set,visit)=>{
  const seen=new Uint8Array(n*n);
  for(let start=0;start<n*n;start++){
   if(!set[start]||seen[start])continue;
   const stack=[start],cells=[];seen[start]=1;
   while(stack.length){const c=stack.pop(),i=c%n,j=(c-i)/n;cells.push(c);for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=n||jj>=n)continue;const d=jj*n+ii;if(set[d]&&!seen[d]){seen[d]=1;stack.push(d);}}}
   visit(cells);
  }
 };
 const polar=c=>{const i=c%n,j=(c-i)/n,u=(i+.5)/n*2-1,v=(j+.5)/n*2-1;return [Math.hypot(u,v),Math.atan2(v,u)];};
 const spanOf=cells=>{const angles=cells.map(c=>polar(c)[1]).sort((a,b)=>a-b);let gap=angles[0]+TAU-angles[angles.length-1];for(let k=1;k<angles.length;k++)gap=Math.max(gap,angles[k]-angles[k-1]);return TAU-gap;};
 let glare=0;
 // Past the crop's cut the registered image only repeats the crop's edge outward: glare there is not the disc's
 // own light on that spot, and whatever crossed the edge is stretched into an arc. Nothing there is exempt.
 const extended=c=>{if(!reg)return false;const i=c%n,j=(c-i)/n;return source(reg,(i+.5)/n*2-1,(j+.5)/n*2-1,1-3/n)[2];};
 const arc=cells=>{let lo=1,hi=0,sum=0;for(const c of cells){const [r]=polar(c);lo=Math.min(lo,r);hi=Math.max(hi,r);sum+=r;}const span=spanOf(cells);return {span,arc:hi-lo<=.35*span*sum/cells.length};};
 groups(rare,cells=>{
  let white=0;for(const c of cells)white+=lightish[c];
  const shape=arc(cells);if(white<.5*cells.length||shape.span<GLARE_SPAN||!shape.arc)return;
  // Something compact in the glare (a fingertip, its white nail included) keeps the white around it.
  const inside=new Uint8Array(n*n),keep=new Uint8Array(n*n);for(const c of cells)if(!lightish[c])inside[c]=1;
  groups(inside,part=>{
   if(part.length<24||arc(part).arc)return;
   for(const c of part){const i=c%n,j=(c-i)/n;for(let dj=-4;dj<=4;dj++)for(let di=-4;di<=4;di++){const ii=i+di,jj=j+dj;if(ii>=0&&jj>=0&&ii<n&&jj<n)keep[jj*n+ii]=1;}}
  });
  for(const c of cells)if(lightish[c]&&!keep[c]&&!extended(c)){rare[c]=0;glare++;}
 });
 if(glare)report.glare=glare;
 // Connected patches of rare colour; keep those that reach the edge (or the stop), span under 150° and have a
 // smooth core (skin, wood): an antialiased stripe edge or a glare line is rare in colour but only ever a thin line.
 const mask=new Uint8Array(n*n),patches=[];
 groups(rare,cells=>{
  let edgeTouch=false,core=0;
  for(const c of cells){if(smoothAt(view,n,4*c))core++;if(polar(c)[0]>=Math.min(EDGE,(stop||1)-.045))edgeTouch=true;}
  if(cells.length<24||core<16||core<.15*cells.length||!edgeTouch)return;
  const span=spanOf(cells);if(span>MAX_SPAN)return;
  patches.push({pixels:cells.length,core,span:+(span*180/Math.PI).toFixed(1)});
  for(const c of cells)mask[c]=1;
 });
 // Past the crop's cut there is no disc in the photo, only its edge repeated outward: any rare colour there is
 // foreign matter that crossed the edge (a thumb, a sliver of table), however thin. It is filled like a patch,
 // with a wide margin round the cut so the fill reads the repeated edge where it is clean (the plate there would
 // read as an added rim: a Halo's purple face under its pale band).
 let clipped=0;const cutMask=new Uint8Array(n*n);
 // Foreign there: rare, or (the face can share a blown-out fingertip's cream) unlike every colour its own ray of
 // disc shows, as the edge search judges it.
 const rayOwn=new Map(),viewAt=sampler(view,n),ownOf=a=>{const key=Math.round(a/TAU*180);let own=rayOwn.get(key);if(!own){own=[];const t0=key/180*TAU;for(let t=RAY_FROM;t<RAY_DISC;t+=1/(n/2)){const p=viewAt(t*Math.cos(t0),t*Math.sin(t0));if(p)own.push(tint(p));}rayOwn.set(key,own);}return own;};
 const strange=c=>{if(rare[c])return true;const k=4*c,[,a]=polar(c),q=tint([view[k],view[k+1],view[k+2]]);return !ownOf(a).some(p=>alike(p,q));};
 for(let c=0;c<n*n;c++)if(bins[c]>=0&&!mask[c]&&extended(c)&&strange(c)){const i=c%n,j=(c-i)/n;for(let dj=-CUT_MARGIN;dj<=CUT_MARGIN;dj++)for(let di=-CUT_MARGIN;di<=CUT_MARGIN;di++){const ii=i+di,jj=j+dj,d=jj*n+ii;if(ii>=0&&jj>=0&&ii<n&&jj<n&&!mask[d]&&extended(d))cutMask[d]=1;}}
 for(let c=0;c<n*n;c++)if(cutMask[c]){mask[c]=1;clipped++;}
 if(clipped)report.cut=clipped;
 // Two pixels of margin catch each patch's soft edge (finger shadows, antialiasing), still only on the annulus.
 let masked=0;
 if(patches.length||clipped){
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
  // Each circle of half a cell's width, sampled a cell apart all round: how many samples in a row are masked,
  // counting back (and forward) from each sample. A cell reads its own circle's runs at its angle.
  const circles=new Map(),circle=key=>{
   let ring=circles.get(key);if(ring)return ring;
   const R=key/n,m=Math.ceil(TAU*Math.max(R,.5)*n),hit=new Uint8Array(m),back=new Uint16Array(m),ahead=new Uint16Array(m);
   for(let s=0;s<m;s++){const a=s/m*TAU-Math.PI;hit[s]=inMask(R*Math.cos(a),R*Math.sin(a));}
   const all=hit.every(Boolean);
   for(let pass=0;pass<2;pass++)for(let s=0;s<m;s++)back[s]=hit[s]?Math.min(m,(s?back[s-1]:back[m-1])+1):0;
   for(let pass=0;pass<2;pass++)for(let s=m-1;s>=0;s--)ahead[s]=hit[s]?Math.min(m,(s<m-1?ahead[s+1]:ahead[0])+1):0;
   ring={m,back,ahead,all};circles.set(key,ring);return ring;
  };
  for(let c=0;c<n*n;c++){
   if(!mask[c])continue;const i=c%n,j=(c-i)/n,u=(i+.5)/n*2-1,v=(j+.5)/n*2-1,r=Math.hypot(u,v),a=Math.atan2(v,u);
   const ring=circle(Math.round(r*n)),d=TAU/ring.m,s=Math.round((a+Math.PI)/d)%ring.m;
   const lo=ring.all?Math.PI:Math.min(Math.PI,ring.back[s]*d),hi=ring.all?Math.PI:Math.min(Math.PI,ring.ahead[s]*d);
   cells[c]=++slot;gaps[2*slot-2]=lo+2*d;gaps[2*slot-1]=hi+2*d;
  }
 }
 return {changed:!!reg||!!stop||masked>0,reg,stop,mask:cells,gaps,n,report};
}

// Where output pixel (u, v) of a cleaned image takes its colour: emit(x, y, weight) for each source point in the
// stored texture's frame (the crop is the unit circle), weights summing to its opacity. Nothing past the nose, or
// past the plan's stop, where the plate's own plastic shows instead. `limit` keeps sources inside what the crop
// kept (3 pixels in at the image's size).
export function provenance(plan,u,v,limit,emit){
 const {reg,mask,gaps,n,stop}=plan,r=Math.hypot(u,v);if(r>=1)return;
 const w=stop?Math.max(0,Math.min(1,(stop-r)/FEATHER)):1;if(w<=0)return;
 const i=Math.floor((u+1)/2*n),j=Math.floor((v+1)/2*n),m=mask&&i>=0&&j>=0&&i<n&&j<n&&mask[j*n+i]?j*n+i:-1;
 if(m<0){const [x,y]=source(reg,u,v,limit);emit(x,y,w);return;}
 // A foreign patch: the disc's own pixels at this radius on either side of it, blended by angular distance.
 const a=Math.atan2(v,u),ci=m%n,cj=(m-ci)/n;let da=a-Math.atan2((cj+.5)/n*2-1,(ci+.5)/n*2-1);da-=TAU*Math.round(da/TAU);
 const g=2*(mask[m]-1),lo=Math.max(1e-4,gaps[g]+da),hi=Math.max(1e-4,gaps[g+1]-da),t=lo/(lo+hi);
 const [px,py]=source(reg,r*Math.cos(a-lo),r*Math.sin(a-lo),limit),[qx,qy]=source(reg,r*Math.cos(a+hi),r*Math.sin(a+hi),limit);
 emit(px,py,w*(1-t));emit(qx,qy,w*t);
}
// The cleaned n × n RGBA (unflipped) for `size` × `size` source pixels and a plan. Pixels the plan does not
// touch are copied as they are.
export function applyCleanup(data,size,plan){return render(data,size,plan.n,plan);}
function render(data,size,n,plan){
 const {reg,mask,stop}=plan,out=new Uint8ClampedArray(data.length),at=sampler(data,size),limit=1-3/size;
 if(!reg)out.set(data);
 const c=[0,0,0,0];let weight=0;
 const emit=(x,y,w)=>{const p=at(x,y);weight+=w;if(!p)return;for(let ch=0;ch<4;ch++)c[ch]+=p[ch]*w;};
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const u=(i+.5)/size*2-1,v=(j+.5)/size*2-1,r=Math.hypot(u,v),k=4*(j*size+i);
  if(r>=1){if(reg)out[k]=out[k+1]=out[k+2]=out[k+3]=0;continue;}
  const cell=mask?mask[Math.floor((v+1)/2*n)*n+Math.floor((u+1)/2*n)]:0;
  if(!reg&&!cell&&!(stop&&r>stop-FEATHER))continue;
  // Plain registered pixels (most of them) take one source directly; provenance() composes the rest.
  if(!cell&&!(stop&&r>stop-FEATHER)){const [x,y]=source(reg,u,v,limit),p=at(x,y);if(p){out[k]=p[0];out[k+1]=p[1];out[k+2]=p[2];}else out[k]=out[k+1]=out[k+2]=0;out[k+3]=Math.round(255*Math.min(1,(1-r)*size/2));continue;}
  c[0]=c[1]=c[2]=c[3]=0;weight=0;provenance(plan,u,v,limit,emit);
  if(weight>0){out[k]=c[0]/weight;out[k+1]=c[1]/weight;out[k+2]=c[2]/weight;}
  else{
   // Where the plate shows through (past the stop, or foreign matter past the crop's cut), the opacity goes and
   // the colour is the photo's own there (at the stop on this radius): the relief map reads colour, so no ridge.
   const s=stop?Math.min(1,stop/r):1,[x,y]=source(reg,u*s,v*s,limit),p=at(x,y)||[0,0,0];out[k]=p[0];out[k+1]=p[1];out[k+2]=p[2];
  }
  // The crop's antialiased feather, now on the detected edge.
  const crop=reg?Math.round(255*Math.min(1,(1-r)*size/2)):data[k+3];
  out[k+3]=Math.min(crop,Math.round(255*weight));
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
