// One-dot registration (docs/photo-adder-rework.md): the disc's rim found in the photo, the crop that turns it into the
// canonical circle, and the turn that levels its stamp. Pure JS, no DOM, so the aligner and Node tests both run it.
//
//  1. Rim. Rays from a seed inside the disc (the dot) collect edge candidates: peaks of the colour gradient across the
//     ray. RANSAC fits an ellipse to them, one vote per ray, so a hand over the rim or a stamp's letters are outvoted.
//     A concentric ellipse further out with strong support wins over an inner one: a clear or overmold disc's plate
//     edge is an ellipse too, but the crop's edge is the disc's own edge.
//  2. Fit. The rim and the disc's centre (the dot) give the crop: a homography that puts the rim on the crop's edge and
//     the centre in the middle (registration). The outline's own centre is not the disc's: a phone held close makes the
//     near half look bigger. So the dot starts where the disc's centre most likely is (autoRegister): the outline's
//     centre or one of the two centres a phone camera allows (poseCentres), whichever centres the stamp's design. The
//     user moves it from there; the rim stays on the crop's edge whatever the dot does.
//  3. Level. In the registered crop the stamp's edges vote for their direction modulo 90°, so a line of type, a
//     baseline or a frame all agree; the peak is the stamp's level. A design with no straight edges gives no clear peak
//     and is left as it is (`confidence` says so).
const RAYS=256,CANDIDATES=6,WORK=512;
// The distortion caps (docs/photo-adder-rework.md §3). Past either, the fit would warp more than a phone photo's honest
// perspective and the aligner hands the photo to the manual one, saying why. SQUASH_CAP: the outline's minor over major
// axis (a disc shot more than about 37° off square; the manual aligner's own tilt range, 0.8 to 1.2, reaches as far).
// CENTRE_CAP: how far the dot may sit from the outline's centre, in outline radii (a phone's main camera at arm's length
// puts a disc's centre about 5% off for each 6° of tilt; a fifth of the radius is a disc tilted about 25° and held
// close). STRETCH_CAP: the most the crop may magnify one part of the disc over another (a disc tilted 18° at arm's
// length is 1.67: near half bigger, far half smaller, the tilt foreshortened).
export const SQUASH_CAP=.8,CENTRE_CAP=.2,STRETCH_CAP=2;
// A rim found on fewer rays than this share is not trusted: the photo shows too little of the disc's edge.
const SUPPORT=.35;

// The working image: a downscaled, lightly blurred copy as three channels (luminance and two opponent chroma axes, so
// a blue rim on a grey floor is an edge even where their brightness matches).
function workImage(data,w,h){
 const k=Math.min(1,WORK/Math.max(w,h)),W=Math.max(8,Math.round(w*k)),H=Math.max(8,Math.round(h*k)),out=new Float32Array(W*H*3);
 for(let j=0;j<H;j++)for(let i=0;i<W;i++){
  // Box-average the source pixels this one covers.
  const x0=Math.floor(i/k),x1=Math.max(x0+1,Math.floor((i+1)/k)),y0=Math.floor(j/k),y1=Math.max(y0+1,Math.floor((j+1)/k));
  let r=0,g=0,b=0,n=0;
  for(let y=y0;y<Math.min(h,y1);y++)for(let x=x0;x<Math.min(w,x1);x++){const p=(y*w+x)*4;r+=data[p];g+=data[p+1];b+=data[p+2];n++;}
  r/=n||1;g/=n||1;b/=n||1;const q=(j*W+i)*3;
  out[q]=.299*r+.587*g+.114*b;out[q+1]=(r-g)*.7;out[q+2]=((r+g)/2-b)*.7;
 }
 // Two 3×3 box passes: foil sparkle and sensor noise stop reading as edges.
 const tmp=new Float32Array(out.length);
 for(let pass=0;pass<2;pass++){
  for(let j=0;j<H;j++)for(let i=0;i<W;i++)for(let c=0;c<3;c++){let s=0,n=0;for(let d=-1;d<=1;d++){const x=i+d;if(x>=0&&x<W){s+=out[(j*W+x)*3+c];n++;}}tmp[(j*W+i)*3+c]=s/n;}
  for(let j=0;j<H;j++)for(let i=0;i<W;i++)for(let c=0;c<3;c++){let s=0,n=0;for(let d=-1;d<=1;d++){const y=j+d;if(y>=0&&y<H){s+=tmp[(y*W+i)*3+c];n++;}}out[(j*W+i)*3+c]=s/n;}
 }
 return {img:out,W,H,k};
}
const sample=(img,W,H,x,y,c)=>{
 const a=Math.max(0,Math.min(W-2,Math.floor(x))),b=Math.max(0,Math.min(H-2,Math.floor(y))),fx=Math.max(0,Math.min(1,x-a)),fy=Math.max(0,Math.min(1,y-b));
 return (img[(b*W+a)*3+c]*(1-fx)+img[(b*W+a+1)*3+c]*fx)*(1-fy)+(img[((b+1)*W+a)*3+c]*(1-fx)+img[((b+1)*W+a+1)*3+c]*fx)*fy;
};

// Edge candidates along each ray: radii where the colour changes fastest across the ray, strongest first.
function rayCandidates(work,seed){
 const {img,W,H}=work,short=Math.min(W,H),start=short*.1,rays=[];
 for(let r=0;r<RAYS;r++){
  const t=r/RAYS*2*Math.PI,dx=Math.cos(t),dy=Math.sin(t);
  // How far the ray stays in the picture.
  const reach=Math.min(dx>0?(W-2-seed.x)/dx:dx<0?(1-seed.x)/dx:Infinity,dy>0?(H-2-seed.y)/dy:dy<0?(1-seed.y)/dy:Infinity);
  const n=Math.max(0,Math.floor((reach-start)/.5)),prof=new Float32Array(n);
  let prev=null;
  for(let s=0;s<n;s++){
   const d=start+s*.5,x=seed.x+dx*d,y=seed.y+dy*d,v=[0,1,2].map(c=>sample(img,W,H,x,y,c));
   if(prev){let m=0;for(let c=0;c<3;c++)m+=(v[c]-prev[c])**2;prof[s]=Math.sqrt(m)*2;}
   prev=v;
  }
  // A one-pixel smoothing of the derivative, then its local peaks.
  const sm=new Float32Array(n);for(let s=1;s<n-1;s++)sm[s]=(prof[s-1]+2*prof[s]+prof[s+1])/4;
  const peaks=[];
  for(let s=2;s<n-2;s++)if(sm[s]>=sm[s-1]&&sm[s]>sm[s+1]&&sm[s]>2){
   // Sub-sample peak position.
   const a=sm[s-1],b=sm[s],c=sm[s+1],off=(a-c)/(2*(a-2*b+c)||1);
   peaks.push({r:start+(s+Math.max(-.5,Math.min(.5,off)))*.5-.25,m:b});
  }
  peaks.sort((a,b)=>b.m-a.m);
  rays.push({dx,dy,reach,list:peaks.slice(0,CANDIDATES)});
 }
 // Strength relative to the photo's strongest edges, so a weight is comparable across rays.
 const all=rays.flatMap(r=>r.list.map(p=>p.m)).sort((a,b)=>a-b),top=all[Math.floor(all.length*.9)]||1;
 for(const ray of rays)for(const p of ray.list)p.w=Math.min(1,p.m/top);
 return rays;
}

// A conic A x² + B xy + C y² + D x + E y = 1, in coordinates centred on the seed (which is inside it, so never on it).
function solve(M,v){
 const n=v.length,a=M.map((row,i)=>[...row,v[i]]);
 for(let c=0;c<n;c++){
  let p=c;for(let r=c+1;r<n;r++)if(Math.abs(a[r][c])>Math.abs(a[p][c]))p=r;
  if(Math.abs(a[p][c])<1e-12)return null;[a[c],a[p]]=[a[p],a[c]];
  for(let r=0;r<n;r++)if(r!==c){const f=a[r][c]/a[c][c];for(let k=c;k<=n;k++)a[r][k]-=f*a[c][k];}
 }
 return a.map((row,i)=>row[n]/row[i]);
}
function fitConic(points){
 if(points.length<5)return null;
 if(points.length===5)return solve(points.map(([x,y])=>[x*x,x*y,y*y,x,y]),[1,1,1,1,1]);
 const M=Array.from({length:5},()=>new Array(5).fill(0)),v=new Array(5).fill(0);
 for(const [x,y,w=1] of points){const row=[x*x,x*y,y*y,x,y];for(let i=0;i<5;i++){v[i]+=w*row[i];for(let j=0;j<5;j++)M[i][j]+=w*row[i]*row[j];}}
 return solve(M,v);
}
// Where a ray from the seed meets the conic, or null when the conic is not an ellipse around the seed.
function along(q,dx,dy){
 const [A,B,C,D,E]=q,a=A*dx*dx+B*dx*dy+C*dy*dy,b=D*dx+E*dy;
 if(a<=0)return null;const disc=b*b+4*a;return (-b+Math.sqrt(disc))/(2*a);
}
function geometry(q,seed,scale){
 const [A,B,C,D,E]=q;if(4*A*C-B*B<=0||A<=0)return null;
 const det=4*A*C-B*B,x0=(-2*C*D+B*E)/det,y0=(-2*A*E+B*D)/det,F0=A*x0*x0+B*x0*y0+C*y0*y0+D*x0+E*y0-1;
 if(F0>=0)return null;
 const theta=.5*Math.atan2(B,A-C),c=Math.cos(theta),s=Math.sin(theta),l1=A*c*c+B*s*c+C*s*s,l2=A+C-l1;
 if(l1<=0||l2<=0)return null;
 return {cx:seed.x+x0*scale,cy:seed.y+y0*scale,a:Math.sqrt(-F0/l1)*scale,b:Math.sqrt(-F0/l2)*scale,theta};
}

// Votes for a conic: each ray's best candidate within tolerance of where the conic crosses it. A ray that leaves the
// picture before the conic does can neither vote for nor against it.
function score(q,rays,scale){
 let total=0,hits=0,seen=0;
 for(const ray of rays){
  const t=along(q,ray.dx,ray.dy);if(t===null)return null;const r=t*scale;
  if(r>ray.reach)continue;seen++;
  const tol=Math.max(1.2,r*.012);let best=0;
  for(const p of ray.list)if(Math.abs(p.r-r)<=tol&&p.w>best)best=p.w;
  if(best){total+=best;hits++;}
 }
 return {total,hits,seen};
}
// The strongest circle around the seed: every candidate votes, by strength, for its distance from each possible centre
// (a grid around the seed); the centre whose distances pile up at one radius wins. A rim is the one closed edge all the
// rays share, so it piles up where a stamp's lines and the room behind spread out. Coarse, then fine around the best.
function houghCircle(rays,seed,limits,short){
 const pts=[];for(const ray of rays)for(const p of ray.list)pts.push(seed.x+ray.dx*p.r,seed.y+ray.dy*p.r,p.w);
 const bin=.004*short,N=Math.ceil(short*1.6/bin),hist=new Float64Array(N);
 const vote=(cx,cy)=>{
  hist.fill(0);
  for(let n=0;n<pts.length;n+=3){const i=Math.round(Math.hypot(pts[n]-cx,pts[n+1]-cy)/bin);if(i<N)hist[i]+=pts[n+2];}
  let best=0,at=0;for(let i=Math.ceil(short*.18/bin);i<N-1;i++){const v=hist[i-1]*.5+hist[i]+hist[i+1]*.5;if(v>best){best=v;at=i;}}
  return {v:best,r:at*bin};
 };
 let top=null;const reach=limits.reach*short;
 for(const step of [.02,.005]){
  const from=top?{x:top.cx,y:top.cy}:seed,span=top?.03*short:reach,d=step*short;
  for(let y=-span;y<=span;y+=d)for(let x=-span;x<=span;x+=d){
   const cx=from.x+x,cy=from.y+y;if(Math.hypot(cx-seed.x,cy-seed.y)>reach)continue;
   const c=vote(cx,cy);if(!top||c.v>top.v)top={cx,cy,r:c.r,v:c.v};
  }
 }
 return top;
}
// From the circle's centre to the rim's ellipse: the same vote with the points first unsquashed along each direction
// by each aspect (a tilted disc's outline is an ellipse up to about half as wide as tall), then each ray's candidate
// nearest the fit, refitted, the tolerance shrinking.
function ellipseFrom(circle,rays,scale,seed,short){
 const pts=[];for(const ray of rays)for(const p of ray.list)pts.push(seed.x+ray.dx*p.r-circle.cx,seed.y+ray.dy*p.r-circle.cy,p.w);
 const bin=.004*short,N=Math.ceil(short*1.6/bin),hist=new Float64Array(N);
 let top={v:-1};
 for(let aspect=1;aspect>=.5;aspect-=.025)for(let deg=0;deg<180;deg+=aspect===1?180:5){
  const t=deg*Math.PI/180,c=Math.cos(t),s=Math.sin(t);hist.fill(0);
  // Unsquash: the component across `deg` grows by 1/aspect; the vote is for the major semi-axis along `deg`.
  for(let n=0;n<pts.length;n+=3){const u=pts[n]*c+pts[n+1]*s,v=(-pts[n]*s+pts[n+1]*c)/aspect,i=Math.round(Math.hypot(u,v)/bin);if(i<N)hist[i]+=pts[n+2];}
  // A squashed hypothesis is scored per unit of its rim's length, so it does not win by being longer.
  const len=Math.PI*(3*(1+aspect)-Math.sqrt((3+aspect)*(1+3*aspect)))/(2*Math.PI);
  for(let i=Math.ceil(short*.18/bin);i<N-1;i++){const v=(hist[i-1]*.5+hist[i]+hist[i+1]*.5)/len;if(v>top.v)top={v,a:i*bin,b:i*bin*aspect,theta:t};}
 }
 // The ellipse as a conic in seed-centred units.
 const A=top.a/scale,B=top.b/scale,cx=(circle.cx-seed.x)/scale,cy=(circle.cy-seed.y)/scale,c=Math.cos(top.theta),s=Math.sin(top.theta);
 const P=c*c/(A*A)+s*s/(B*B),Q=2*c*s*(1/(A*A)-1/(B*B)),R=s*s/(A*A)+c*c/(B*B),F=P*cx*cx+Q*cx*cy+R*cy*cy-1;
 if(!(F<0))return null;
 let q=[P/-F,Q/-F,R/-F,(-2*P*cx-Q*cy)/-F,(-2*R*cy-Q*cx)/-F];
 // Tight from the start: an overmold's seam and its outer edge sit a few percent apart, and a looser window mixes them.
 for(const tol of [.02,.015,.012,.01]){
  const fit=[];
  for(const ray of rays){
   const t=along(q,ray.dx,ray.dy);if(t===null)return null;const want=t*scale;if(want>ray.reach)continue;
   let best=null;for(const p of ray.list)if(Math.abs(p.r-want)<=tol*want&&(!best||Math.abs(p.r-want)<Math.abs(best.r-want)))best=p;
   if(best)fit.push([ray.dx*best.r/scale,ray.dy*best.r/scale,best.w]);
  }
  const next=fitConic(fit);if(!next||!geometry(next,{x:0,y:0},1))break;q=next;
 }
 return q;
}

// The conic grown by f about its own centre (seed-centred units): (x−c)ᵀM(x−c) = K becomes = K·f², written again in the
// form A x² + B xy + C y² + D x + E y = 1 (the seed stays inside, so the right side stays positive).
function scaled(q,f){
 const [A,B,C,D,E]=q,det=4*A*C-B*B,x0=(-2*C*D+B*E)/det,y0=(-2*A*E+B*D)/det,m=A*x0*x0+B*x0*y0+C*y0*y0,K=1+m;
 const G=K*f*f-m;return [A/G,B/G,C/G,-(2*A*x0+B*y0)/G,-(2*C*y0+B*x0)/G];
}
// The second way to a rim: RANSAC over the rays, five candidates from five sectors (the stronger ones more often), each
// conic scored by its votes, the best refitted to its inliers. It finds a strongly tilted outline the circle vote misses;
// the circle vote finds a rim among a stamp's long straight lines, where five random picks seldom all land on the rim.
// Seeded, so a photo always gives the same fit.
const TRIALS=1200;
function ransac(rays,scale,limits){
 let s=0x9e3779b9;const rand=()=>{s=(s+0x6d2b79f5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
 const pick=list=>{let t=rand()*list.reduce((a,p)=>a+p.w,0);for(const p of list)if((t-=p.w)<=0)return p;return list[list.length-1];};
 let best=null;
 for(let trial=0;trial<TRIALS;trial++){
  const pts=[],off=rand();
  for(let k=0;k<5;k++){const ray=rays[Math.floor(((k+off+rand()*.8)/5%1)*RAYS)];if(!ray.list.length)break;const p=pick(ray.list);pts.push([ray.dx*p.r/scale,ray.dy*p.r/scale]);}
  if(pts.length<5)continue;
  const q=fitConic(pts);if(!q)continue;const g=geometry(q,limits.seed,scale);if(!g||!limits.ok(g))continue;
  const sc=score(q,rays,scale);if(!sc||sc.seen<RAYS*.5)continue;
  if(!best||sc.total>best.s.total)best={q,s:sc};
 }
 if(!best)return null;
 let q=best.q;
 for(const tol of [.02,.015,.012]){
  const fit=[];
  for(const ray of rays){const t=along(q,ray.dx,ray.dy);if(t===null)break;const want=t*scale;if(want>ray.reach)continue;let b=null;for(const p of ray.list)if(Math.abs(p.r-want)<=tol*want&&(!b||Math.abs(p.r-want)<Math.abs(b.r-want)))b=p;if(b)fit.push([ray.dx*b.r/scale,ray.dy*b.r/scale,b.w]);}
  const next=fitConic(fit),g=next&&geometry(next,limits.seed,scale);if(!g||!limits.ok(g))break;q=next;
 }
 return q;
}
// A rim further out, concentric with a found one: the disc's own edge when the found one is a printed ring, a plate edge,
// an overmold's seam or a clear disc's rim band. Rims on one plane project as near-scaled copies of each other, so each
// ray votes for the scale (its candidates 3% to 150% beyond the found rim, by strength) and the peak wins when it stands
// clear of the rest and enough rays agree. A copy is not exactly to scale, so the edge is then fitted by RANSAC over the
// candidates beyond: one edge, not a plate edge on one side and the rim on the other. A hand over the rim, or a rim's side
// wall showing below a tilted disc, votes for scales of its own and is outvoted.
const OUT_BIN=.0025,OUT_MAX=2.5;
function outward(q,rays,scale,limits){
 const N=Math.ceil((OUT_MAX-1.03)/OUT_BIN)+1,bins=new Float64Array(N),voters=[];
 for(const ray of rays){
  const t=along(q,ray.dx,ray.dy)*scale;if(!(t>0)||t*1.06>ray.reach)continue;
  const seen=new Set();
  for(const p of ray.list){const f=p.r/t;if(f<1.03||f>OUT_MAX)continue;const i=Math.round((f-1.03)/OUT_BIN);if(seen.has(i))continue;seen.add(i);bins[i]+=p.w;}
  voters.push({ray,t});
 }
 if(voters.length<RAYS*.5)return null;
 // A larger copy is less exactly to scale (perspective moves a ring's centre with the square of its size), so its votes
 // spread: the window widens with the step.
 const spread=f=>.004*f+.02*(f-1);
 let peak=-1,best=0;
 for(let i=0;i<N;i++){const f=1.03+i*OUT_BIN,span=Math.max(1,Math.round(spread(f)/OUT_BIN));let v=0;for(let d=-span;d<=span;d++)v+=bins[i+d]||0;if(v>best){best=v;peak=i;}}
 if(peak<0)return null;
 // A clear mode: well above the typical window, or the votes are clutter.
 const typical=[...bins].sort((a,b)=>a-b)[N>>1];if(best<3*Math.max(typical*3,.5))return null;
 const f=1.03+peak*OUT_BIN;let hits=0;
 for(const {ray,t} of voters)if(ray.list.some(p=>Math.abs(p.r/t-f)<=Math.max(.008*f,spread(f))))hits++;
 // The edge itself: RANSAC over every candidate beyond the found rim, so the strongest consistent edge out there wins
 // whole (the next climb finds any further one).
 const beyond=rays.map(ray=>{const t=along(q,ray.dx,ray.dy)*scale;return {...ray,list:t>0?ray.list.filter(p=>p.r>=1.03*t):[]};});
 // Only an edge most of the way round (60% of the rays; a rim found whole has over 90%) is a rim; past the found one a
 // hand or the room can make a partial ellipse (the Pixel's photo: 50%), and the scaled copy stands instead.
 const fitted=ransac(beyond,scale,limits),fs=fitted&&score(fitted,rays,scale);
 return {q:fs&&fs.hits>=fs.seen*.6?fitted:scaled(q,f),hits,seen:voters.length,f};
}

// The disc's rim in the photo: {cx, cy, a, b, theta, support} in the photo's pixels (`a` along `theta`, radians, image
// axes, y down), or null when no rim could be trusted. `seed`: a point inside the disc in the photo's pixels (the dot);
// the photo's centre when none is given. `near`: how far the rim's centre may sit from the seed, as a share of the
// photo's short side (the dot is the middle of the disc; with no dot the disc only has to contain the centre). `radius`:
// [low, high] bounds on the rim's mean radius in the photo's pixels, when the caller knows them.
export function findDisc(data,w,h,{seed=null,near=null,radius=null}={}){
 const work=workImage(data,w,h),{W,H,k}=work,short=Math.min(W,H);
 // Working pixel i covers photo pixels i/k to (i+1)/k; photo coordinates put a pixel's centre on its index.
 const toWork=v=>(v+.5)*k-.5,toPhoto=v=>(v+.5)/k-.5;
 const s=seed?{x:toWork(seed.x),y:toWork(seed.y)}:{x:W/2,y:H/2},reachOf=near??(seed?.2:.3);
 const rays=rayCandidates(work,s),scale=short;
 const limits={seed:s,ok:g=>{
  const r=Math.sqrt(g.a*g.b);
  return Math.min(g.a,g.b)/Math.max(g.a,g.b)>=.5&&r>=short*.18&&r<=Math.max(W,H)*.8&&Math.hypot(g.cx-s.x,g.cy-s.y)<=short*reachOf&&(!radius||r>=radius[0]*k&&r<=radius[1]*k);
 }};
 const circle=houghCircle(rays,s,{reach:reachOf},short);if(!circle)return null;
 // The vote is taken about a centre; an outline that is no circle votes its circle's centre a little off, so the vote
 // runs again about the ellipse it found.
 let q=null,g0=circle;
 for(let pass=0;pass<3;pass++){const next=ellipseFrom({cx:g0.cx,cy:g0.cy},rays,scale,s,short),g=next&&geometry(next,s,scale);if(!g)break;q=next;g0=g;}
 // The circle vote's ellipse or RANSAC's, whichever more of the rays agree with.
 let found=q&&limits.ok(g0)?{q,s:score(q,rays,scale)}:null;
 const other=ransac(rays,scale,limits),os=other&&score(other,rays,scale);
 if(os&&(!found?.s||os.total>found.s.total))found={q:other,s:os};
 if(!found?.s)return null;
 if(!found.s||found.s.hits<RAYS*SUPPORT*.6)return null;
 // The rim's support is the found rim's: a concentric edge further out (outward) only rescales it.
 const support=found.s.hits/Math.max(1,found.s.seen);
 if(support<SUPPORT)return null;
 for(let step=0;step<4;step++){
  const outer=outward(found.q,rays,scale,limits),g=outer&&geometry(outer.q,s,scale);
  if(!outer||outer.hits<outer.seen*.25||!g||!limits.ok(g))break;
  found={q:outer.q,s:found.s};
 }
 const g=geometry(found.q,s,scale);if(!g)return null;
 return {cx:toPhoto(g.cx),cy:toPhoto(g.cy),a:g.a/k,b:g.b/k,theta:g.theta,support};
}

// 3×3 helpers (row-major arrays of rows).
const mul=(A,B)=>A.map(r=>[0,1,2].map(j=>r[0]*B[0][j]+r[1]*B[1][j]+r[2]*B[2][j]));
const apply=(A,v)=>A.map(r=>r[0]*v[0]+r[1]*v[1]+r[2]*v[2]);
const T=A=>[0,1,2].map(i=>[0,1,2].map(j=>A[j][i]));
function inv(A){
 const [[a,b,c],[d,e,f],[g,h,i]]=A,C=[[e*i-f*h,c*h-b*i,b*f-c*e],[f*g-d*i,a*i-c*g,c*d-a*f],[d*h-e*g,b*g-a*h,a*e-b*d]],det=a*C[0][0]+b*C[1][0]+c*C[2][0];
 return C.map(r=>r.map(v=>v/det));
}
// Eigenpairs of a symmetric 3×3 (Jacobi): values descending, vectors as columns.
function eigen(S){
 const A=S.map(r=>[...r]),V=[[1,0,0],[0,1,0],[0,0,1]];
 for(let sweep=0;sweep<50;sweep++){
  let off=0;for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)off+=A[i][j]**2;if(off<1e-24)break;
  for(let p=0;p<3;p++)for(let q=p+1;q<3;q++){
   if(Math.abs(A[p][q])<1e-30)continue;
   const t0=(A[q][q]-A[p][p])/(2*A[p][q]),t=Math.sign(t0||1)/(Math.abs(t0)+Math.sqrt(t0*t0+1)),c=1/Math.sqrt(t*t+1),s=t*c;
   for(let k=0;k<3;k++){const x=A[k][p],y=A[k][q];A[k][p]=c*x-s*y;A[k][q]=s*x+c*y;}
   for(let k=0;k<3;k++){const x=A[p][k],y=A[q][k];A[p][k]=c*x-s*y;A[q][k]=s*x+c*y;}
   for(let k=0;k<3;k++){const x=V[k][p],y=V[k][q];V[k][p]=c*x-s*y;V[k][q]=s*x+c*y;}
  }
 }
 return [0,1,2].map(i=>({value:A[i][i],vector:[V[0][i],V[1][i],V[2][i]]})).sort((x,y)=>y.value-x.value);
}
// The rim as a conic matrix in its own frame: origin at the outline's centre, unit = the outline's mean radius. Every
// fit below works there, so the numbers stay near 1 whatever the photo's size.
function frameOf(disc){
 const r=Math.sqrt(disc.a*disc.b),a=disc.a/r,b=disc.b/r,c=Math.cos(disc.theta),s=Math.sin(disc.theta);
 const A=c*c/(a*a)+s*s/(b*b),B=c*s*(1/(a*a)-1/(b*b)),C=s*s/(a*a)+c*c/(b*b);
 return {r,conic:[[A,B,0],[B,C,0],[0,0,-1]],toPixels:[[r,0,disc.cx],[0,r,disc.cy],[0,0,1]]};
}

// Where the disc's own centre could be, given the camera (docs/photo-adder-rework.md §2). A phone held close makes the
// near half of the disc look bigger, so the outline's centre sits off the disc's: by about the disc's radius over its
// distance, times the sine of the tilt. With a focal length the rim's cone has two circular sections, so two centres;
// the photo cannot tell which side is nearer by its outline alone. `focal` in the photo's pixels; by default a phone's
// main camera (25 mm full-frame equivalent) over the photo's diagonal, centred.
export const PHONE_FOCAL=25/43.27;
export function poseCentres(disc,w,h,{focal=PHONE_FOCAL*Math.hypot(w,h)}={}){
 const {conic,toPixels}=frameOf(disc),K=[[focal,0,w/2],[0,focal,h/2],[0,0,1]];
 // The cone, in camera coordinates, through the rim: Kᵀ C K with C the rim's conic in pixels.
 const Cpx=mul(mul(T(inv(toPixels)),conic),inv(toPixels));
 let Q=mul(mul(T(K),Cpx),K);
 let e=eigen(Q);if(e.filter(x=>x.value<0).length>1){Q=Q.map(r=>r.map(v=>-v));e=eigen(Q);}
 const [l1,l2,l3]=e.map(x=>x.value);if(!(l1>=l2&&l2>0&&l3<0))return [];
 const out=[];
 for(const sign of [1,-1]){
  const g1=sign*Math.sqrt((l1-l2)/(l1-l3)),g3=Math.sqrt((l2-l3)/(l1-l3));
  const n=[0,1,2].map(i=>g1*e[0].vector[i]+g3*e[2].vector[i]);
  // The plane's vanishing line, then its pole: the disc's centre in the photo.
  const line=apply(T(inv(K)),n),c=apply(inv(Cpx),line);
  if(Math.abs(c[2])<1e-12)continue;
  out.push({x:c[0]/c[2],y:c[1]/c[2]});
 }
 return out;
}

// The crop that registers the rim with the disc's centre at `centre` (photo pixels): photoPoint's `H`, a homography from
// the unit disc to the photo in shares of its width and height. The rim always lands on the crop's edge; the centre
// says how the disc is tilted (its polar is the disc's vanishing line). With the centre on the outline's centre it is
// the affine fit, the tilt undone without perspective. Also reported: `squash` (the outline's minor over major axis),
// `offset` (the centre's distance from the outline's centre, in outline radii) and `stretch` (the largest over the
// smallest scale the crop takes from the photo anywhere on the disc: 1 for a disc shot square on, a phone's own
// perspective for a close photo; disc-photo.mjs caps it).
export function registration(disc,centre,w,h){
 const {r,conic,toPixels}=frameOf(disc),p=[(centre.x-disc.cx)/r,(centre.y-disc.cy)/r,1];
 // The vanishing line, scaled so it reads (l1, l2, 1): the outline's centre is inside the disc, so it is never on it.
 const l=apply(conic,p);if(Math.abs(l[2])<1e-9)return null;
 const H1=[[1,0,0],[0,1,0],[l[0]/l[2],l[1]/l[2],1]],H1i=inv(H1);
 // The rim after the vanishing line goes to infinity: an ellipse, centred on the centre's image.
 const C1=mul(mul(T(H1i),conic),H1i),q=apply(H1,p),c1=[q[0]/q[2],q[1]/q[2]];
 const k=-(C1[0][0]*c1[0]*c1[0]+2*C1[0][1]*c1[0]*c1[1]+C1[1][1]*c1[1]*c1[1]+2*C1[0][2]*c1[0]+2*C1[1][2]*c1[1]+C1[2][2]);
 if(!(k>0))return null;
 const m=[[C1[0][0]/k,C1[0][1]/k],[C1[0][1]/k,C1[1][1]/k]];
 // The unit circle onto that ellipse without turning it: M^(-1/2).
 const tr=m[0][0]+m[1][1],det=m[0][0]*m[1][1]-m[0][1]**2;if(!(det>0))return null;
 const disc2=Math.sqrt(Math.max(0,tr*tr/4-det)),e1=tr/2+disc2,e2=tr/2-disc2;if(!(e2>0))return null;
 const t=Math.abs(m[0][1])>1e-12?Math.atan2(e1-m[0][0],m[0][1]):m[0][0]>=m[1][1]?0:Math.PI/2,c=Math.cos(t),s=Math.sin(t);
 const s1=1/Math.sqrt(e1),s2=1/Math.sqrt(e2);
 const A=[[c*c*s1+s*s*s2,c*s*(s1-s2)],[c*s*(s1-s2),s*s*s1+c*c*s2]];
 let Hn=mul(H1i,[[A[0][0],A[0][1],c1[0]],[A[1][0],A[1][1],c1[1]],[0,0,1]]);
 // Up in the crop is up in the photo where the disc's centre is, so a zero turn is the photo as it was held.
 const J=jacobian(Hn,0,0),inverse=[[J[1][1],-J[0][1]],[-J[1][0],J[0][0]]].map(row=>row.map(v=>v/(J[0][0]*J[1][1]-J[0][1]*J[1][0])));
 const up=[-inverse[0][1],-inverse[1][1]],phi=Math.atan2(up[0],-up[1]),cp=Math.cos(phi),sp=Math.sin(phi);
 Hn=mul(Hn,[[cp,-sp,0],[sp,cp,0],[0,0,1]]);
 const H=mul([[1/w,0,0],[0,1/h,0],[0,0,1]],mul(toPixels,Hn));
 // Stretch: singular values of the crop's Jacobian, in photo pixels per crop unit, over the rim and the centre.
 let hi=0,lo=Infinity;
 for(let i=0;i<=64;i++){
  const a=i/64*2*Math.PI,[x,y]=i===64?[0,0]:[Math.cos(a),Math.sin(a)],j=jacobian(Hn,x,y);
  const P=j[0][0]**2+j[1][0]**2,Q=j[0][1]**2+j[1][1]**2,R=j[0][0]*j[0][1]+j[1][0]*j[1][1],root=Math.sqrt(((P-Q)/2)**2+R*R);
  hi=Math.max(hi,Math.sqrt((P+Q)/2+root));lo=Math.min(lo,Math.sqrt(Math.max(0,(P+Q)/2-root)));
 }
 return {H:H.flat(),squash:Math.min(disc.a,disc.b)/Math.max(disc.a,disc.b),offset:Math.hypot(p[0],p[1]),stretch:hi/lo};
}
function jacobian(H,x,y){
 const w=H[2][0]*x+H[2][1]*y+H[2][2],u=(H[0][0]*x+H[0][1]*y+H[0][2])/w,v=(H[1][0]*x+H[1][1]*y+H[1][2])/w;
 return [[(H[0][0]-u*H[2][0])/w,(H[0][1]-u*H[2][1])/w],[(H[1][0]-v*H[2][0])/w,(H[1][1]-v*H[2][1])/w]];
}
// A point of the crop (unit disc) in the photo's pixels, under a registration's H.
export function throughH(H,x,y,w,h){const d=H[6]*x+H[7]*y+H[8];return {x:(H[0]*x+H[1]*y+H[2])/d*w,y:(H[3]*x+H[4]*y+H[5])/d*h};}

// The turn (degrees, photoPoint's `rotate`: clockwise as seen) that levels the stamp in a registered square crop, and
// how sure it is: {rotate, confidence}. The deskew a scanner does, on the stamp's level edges only: its strongest
// edges, weighted by how level each is once turned, pile into rows, and a baseline, a frame or an underline piles
// sharpest when level. Upright strokes are left out (italic type leans them on purpose), and so are turns past
// LEVEL_RANGE (a disc photographed by hand is held near upright; a design's star or slanted word is what a wider search
// finds). Confidence is the peak over its value 3° either side: a design with no level edge has no sharp peak and is
// left as it is.
export const LEVEL_RANGE=8,LEVEL_CONFIDENCE=1.15;
export function levelAngle(data,size,{plate=.8}={}){
 const lum=new Float32Array(size*size);
 for(let p=0;p<size*size;p++){const k=p*4;lum[p]=.299*data[k]+.587*data[k+1]+.114*data[k+2];}
 const c=size/2,lim=(plate*.95*c)**2,pts=[],mags=[];
 for(let j=1;j<size-1;j++)for(let i=1;i<size-1;i++){
  const x=i+.5-c,y=j+.5-c;if(x*x+y*y>lim)continue;
  const p=j*size+i;if(data[p*4+3]<250)continue;
  const gx=lum[p+1]-lum[p-1],gy=lum[p+size]-lum[p-size],m=Math.hypot(gx,gy);if(m<4)continue;pts.push(x,y,m,gx,gy);mags.push(m);
 }
 if(mags.length<50)return {rotate:0,confidence:0};
 mags.sort((a,b)=>a-b);const floor=mags[Math.floor(mags.length*.8)],P=[];
 for(let n=0;n<pts.length;n+=5)if(pts[n+2]>=floor)P.push(pts[n],pts[n+1],pts[n+2],pts[n+3]/pts[n+2],pts[n+4]/pts[n+2]);
 const rows=new Float64Array(2*size);
 const sharp=deg=>{
  const t=deg*Math.PI/180,ct=Math.cos(t),st=Math.sin(t);rows.fill(0);
  // A level edge's gradient points straight across the rows once turned: its weight is that share, squared.
  for(let n=0;n<P.length;n+=5){const across=P[n+4]*ct-P[n+3]*st;rows[Math.round(P[n+1]*ct-P[n]*st)+size]+=P[n+2]*across*across;}
  let e=0;for(let i=0;i<rows.length;i++)e+=rows[i]*rows[i];return e;
 };
 let best=0,top=-1;for(let d=-LEVEL_RANGE;d<=LEVEL_RANGE;d+=.25){const v=sharp(d);if(v>top){top=v;best=d;}}
 for(let d=best-.25;d<=best+.25;d+=.05){const v=sharp(d);if(v>top){top=v;best=d;}}
 const sides=(sharp(best-3)+sharp(best+3))/2;
 // Turning the edges by `best` levels them; the crop turns the other way to show them so.
 return {rotate:Math.round(-best*10)/10||0,confidence:sides?top/sides:0};
}

// Where a stamp's design sits in its square read: the centre of its ink's bounds, as an offset from the crop's centre
// in pixels, and the bounds. `alpha` is the extractor's (non-zero where design is).
export function inkBounds(alpha,size){
 let x0=size,y0=size,x1=-1,y1=-1;
 for(let j=0;j<size;j++)for(let i=0;i<size;i++)if(alpha[j*size+i]){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j;}
 if(x1<0)return null;
 return {x0,y0,x1,y1,dx:(x0+x1+1)/2-size/2,dy:(y0+y1+1)/2-size/2};
}

// The crop through a registration, as RGBA (the aligner's preview, autoRegister's reads). `rotate` as photoPoint's.
export function cropThrough(data,w,h,H,size,rotate=0){
 const out=new Uint8ClampedArray(size*size*4),t=rotate*Math.PI/180,c=Math.cos(t),s=Math.sin(t);
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  let x=(i+.5)/size*2-1,y=(j+.5)/size*2-1;if(x*x+y*y>1)continue;
  if(rotate)[x,y]=[x*c+y*s,y*c-x*s];
  const p=throughH(H,x,y,w,h);if(p.x<0||p.y<0||p.x>=w-1||p.y>=h-1)continue;
  const a=Math.floor(p.x),b=Math.floor(p.y),fx=p.x-a,fy=p.y-b,k=(j*size+i)*4;
  for(let ch=0;ch<3;ch++)out[k+ch]=(data[(b*w+a)*4+ch]*(1-fx)+data[(b*w+a+1)*4+ch]*fx)*(1-fy)+(data[((b+1)*w+a)*4+ch]*(1-fx)+data[((b+1)*w+a+1)*4+ch]*fx)*fy;
  out[k+3]=255;
 }
 return out;
}
// Where the stamp's design sits in a registered crop: the middle of its strongest edges' extent (trimmed by 1% each
// side, so a scuff does not count), as an offset from the crop's centre in crop radii.
export function designCentre(data,size,{plate=.8}={}){
 const lum=new Float32Array(size*size),c=size/2,lim=(plate*.95*c)**2,pts=[];
 for(let p=0;p<size*size;p++)lum[p]=.299*data[4*p]+.587*data[4*p+1]+.114*data[4*p+2];
 for(let j=1;j<size-1;j++)for(let i=1;i<size-1;i++){
  const x=i+.5-c,y=j+.5-c;if(x*x+y*y>lim)continue;const p=j*size+i;
  const m=Math.hypot(lum[p+1]-lum[p-1],lum[p+size]-lum[p-size]);if(m>0)pts.push(m,x,y);
 }
 const ms=[];for(let n=0;n<pts.length;n+=3)ms.push(pts[n]);if(!ms.length)return null;
 ms.sort((a,b)=>a-b);const floor=Math.max(12,ms[Math.floor(ms.length*.85)]),xs=[],ys=[];
 for(let n=0;n<pts.length;n+=3)if(pts[n]>=floor){xs.push(pts[n+1]);ys.push(pts[n+2]);}
 if(xs.length<20)return null;
 xs.sort((a,b)=>a-b);ys.sort((a,b)=>a-b);const q=(a,f)=>a[Math.floor((a.length-1)*f)];
 return {x:(q(xs,.01)+q(xs,.99))/2/c,y:(q(ys,.01)+q(ys,.99))/2/c};
}
// The automatic start (the dot where the disc's centre most likely is, the turn that levels its stamp), or why there is
// none: {refused:'rim'} when no rim was found, {refused:'squash'} past SQUASH_CAP. Each candidate centre (the outline's,
// and the camera's two) is read for where its stamp lands (`readInk(rgba, size)`: the stamp's offset from the crop's
// centre in crop radii, or null; the aligner reads with the stamp extractor, off the page's thread; by default
// designCentre); the one that centres the stamp wins. A camera centre replaces the outline's only when it centres the
// stamp by more than 1.5% of the radius: on a disc shot square on they all agree.
export const INK_READ=384;
export async function autoRegister(data,w,h,{seed=null,plate=.8,readInk=null}={}){
 const disc=findDisc(data,w,h,{seed});if(!disc)return {refused:'rim'};
 const outline={x:disc.cx,y:disc.cy},r=Math.sqrt(disc.a*disc.b),squash=Math.min(disc.a,disc.b)/Math.max(disc.a,disc.b);
 if(squash<SQUASH_CAP)return {refused:'squash',disc,squash};
 const read=readInk||((crop,size)=>designCentre(crop,size,{plate}));
 let best=null;
 for(const [i,centre] of [outline,...poseCentres(disc,w,h)].entries()){
  if(Math.hypot(centre.x-disc.cx,centre.y-disc.cy)/r>CENTRE_CAP)continue;
  const reg=registration(disc,centre,w,h);if(!reg||reg.stretch>STRETCH_CAP)continue;
  const d=await read(cropThrough(data,w,h,reg.H,INK_READ),INK_READ);
  const miss=d?Math.hypot(d.x,d.y):0;
  if(!best||miss<best.miss-(i&&!best.i?.015:0))best={centre,reg,miss,i};
 }
 if(!best)return {refused:'squash',disc,squash};
 const level=levelAngle(cropThrough(data,w,h,best.reg.H,512),512,{plate});
 return {disc,centre:best.centre,registration:best.reg,rotate:level.confidence>=LEVEL_CONFIDENCE?level.rotate:0,level,camera:best.i>0};
}
