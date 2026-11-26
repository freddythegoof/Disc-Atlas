// Procedural disc cross-section (Plan 09, phase 1). One parametric generator: a 2D profile from the
// center out to the rim, spun by three.js LatheGeometry. Pure math, no three.js, so Node tests read it.
//
// Units are centimetres. y = 0 is the foot of the rim (the lowest point with the disc flight-plate up).
// The profile is traced counter-clockwise: underside of the flight plate from the axis outward, down
// the inner rim wall, along the foot, up the lower wing to the nose, over the shoulder and back across
// the top to the axis. LatheGeometry's normals are each segment's (dy, -dx), so this order faces every
// surface outward, and the cavity under the plate stays open: the disc is a plate, never a puck.
//
// The shape is a plausible representation of a speed class and a stability tendency, not a measured
// mold and not an aerodynamic model. Phase 2 swaps per-mold measurements in through the same params.

export const DEFAULTS=Object.freeze({
 diameter:21.2,   // PDGA-typical outer diameter
 rimWidth:1.6,    // nose to inner rim wall, horizontally
 rimDepth:1.4,    // foot to the underside of the flight plate at the rim
 domeHeight:.2,   // how far the centre of the top rises above the shoulder
 plate:.22,       // flight-plate thickness
 sharpness:.5,    // 0 round blunt nose (putter) .. 1 thin sharp nose (distance driver)
 bevel:0,         // lower wing: -1 round convex .. 1 strongly concave
 partingLine:.5,  // nose height as a fraction of the shoulder height
});

const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const finite=v=>typeof v==='number'&&Number.isFinite(v);

// Shape parameters for a rated disc, or null when its flight numbers are missing (the panel then keeps
// the static illustration). Speed drives the rim: wider, shallower, sharper and more concave underneath
// as speed climbs. Stability is the panel's own index, turn + fade (app.js score), and only nudges the
// shape: a flatter top, a slightly higher parting line and a more concave lower wing as it rises. Those
// cues are deliberately small; overstability is never drawn by flattening alone.
export function shapeFromFlight(disc){
 if(!disc||!finite(disc.speed)||!finite(disc.turn)||!finite(disc.fade))return null;
 const speed=clamp(disc.speed,1,14),t=(speed-1)/13;
 const sharpness=clamp((speed-3)/9,0,1);
 const stability=clamp(disc.turn+disc.fade,-4,5);
 return {
  ...DEFAULTS,
  rimWidth:+lerp(.95,2.4,t).toFixed(3),
  rimDepth:+lerp(1.65,1.15,t).toFixed(3),
  domeHeight:+clamp(lerp(.3,.22,t)-.035*stability,.06,.5).toFixed(3),
  sharpness:+sharpness.toFixed(3),
  bevel:+clamp(lerp(-.9,.7,sharpness)+.05*stability,-1,1).toFixed(3),
  partingLine:+clamp(lerp(.5,.42,sharpness)+.012*stability,.3,.65).toFixed(3),
 };
}

// Phase 2: a mold's own shape from its PDGA certification dimensions (data.json `specs`, centimetres,
// rounded to 0.1, the generator's own units). Four positive numbers, or null.
export const PDGA_SPEC_KEYS=Object.freeze({diameter:'Diameter',height:'Height',rimWidth:'Rim width',rimDepth:'Rim depth'});
export function measurementsFromSpecs(specs){
 if(!specs||typeof specs!=='object')return null;
 const m={};
 for(const [key,label] of Object.entries(PDGA_SPEC_KEYS)){
  const raw=specs[label],v=typeof raw==='number'?raw:typeof raw==='string'&&raw.trim()?Number(raw):NaN;
  if(!finite(v)||v<=0)return null;
  m[key]=v;
 }
 return m;
}

// Diameter, rim width and rim depth are taken as measured. The rest of the height, height − rim depth,
// is the flight plate plus the dome: half of it is plate (0.12 to 0.22 cm), the remainder dome, so the
// model stands as tall as the mold. Below a 0.12 cm gap a plate can't fit, and the model runs that much
// taller. Sharpness averages measured rim width with speed (rim width tracks speed closely across the
// catalog: about 1 cm at speed 2, 2.3 cm at speed 12), and drives the bevel and parting line as in
// shapeFromFlight. Without flight numbers it is rim width alone. Stability keeps its Phase 1 cues, but
// the dome takes only 0.01 cm per point (at most 0.05), within PDGA's own rounding, so the measured
// height still stands.
export function shapeFromMeasurements(specs,flight){
 const m=measurementsFromSpecs(specs);if(!m)return null;
 const rated=!!flight&&[flight.speed,flight.turn,flight.fade].every(finite);
 const stability=rated?clamp(flight.turn+flight.fade,-4,5):0;
 const rimTerm=clamp((m.rimWidth-1.1)/1.1,0,1);
 const speedTerm=rated?clamp((flight.speed-3)/9,0,1):rimTerm;
 const sharpness=(rimTerm+speedTerm)/2;
 const gap=Math.max(0,m.height-m.rimDepth),plate=clamp(gap/2,.12,.22);
 return normalizeShape({
  diameter:m.diameter,
  rimWidth:m.rimWidth,
  rimDepth:m.rimDepth,
  plate,
  domeHeight:+Math.max(0,gap-plate-.01*stability).toFixed(3),
  sharpness:+sharpness.toFixed(3),
  bevel:+clamp(lerp(-.9,.7,sharpness)+.05*stability,-1,1).toFixed(3),
  partingLine:+clamp(lerp(.5,.42,sharpness)+.012*stability,.3,.65).toFixed(3),
 });
}

// The shape the viewer draws, and where it came from: explicit params (`model`, d.model3d) first, then the
// mold's PDGA dimensions, then the Phase 1 generic shape from flight numbers. Null when none applies.
// `thumbtrack` ({kind, position}, thumbtrackOf) adds the mold's grip feature to whichever shape applies.
export function shapeForDisc({model,specs,flight,thumbtrack}={}){
 const add=shape=>thumbtrack?normalizeShape({...shape,thumbtrack}):shape;
 if(model)return {shape:normalizeShape({...model,thumbtrack}),source:'model'};
 const measured=shapeFromMeasurements(specs,flight);
 if(measured)return {shape:add(measured),source:'pdga'};
 const generic=shapeFromFlight(flight);
 return generic?{shape:add(generic),source:'flight'}:null;
}

// Thumbtracks (source-data/thumbtracks.json): a grip feature molded into the top, drawn by kind from HuckTwin's
// photo study of Nov 25, 2026. Real ones are a millimetre or a few; these sit at that scale, raised only as far as
// it takes to read at the viewer's zoom (the puddle's dish and the thumbtack's bulge sit at the generous end).
// Freddy's feel check on the renders sets the amounts. Centimetres, like the rest of the profile.
//  raised: the Berg's thumbtrack, a ring standing proud of a shallow dish. The ring stands at the measured height,
//   level with the rim's crest; inside it the flight plate sits `step` lower on a flat floor. Between them the top
//   rolls down in one smooth S, `roll` cm wide and centred `at` cm in from the shoulder: a rounded crest, a gentle
//   fall and a concave blend into the floor, with no corner anywhere, so nothing stands taller than measured. Measured
//   from Freddy's photos of his Berg (Nov 26, 2026): the step is about 1.3 cm in from the edge, and edge-on the far
//   wall stands about 3 mm over the plate, which PDGA's 1.4 cm rim depth under a 2.0 cm height also leaves room for.
//   Freddy's feel check on that build: the right height, but "too steep and rigid ... its supposed to be round", so
//   the 5 mm wall became the wider roll about the same centre. A mold with a shallower dome gets a shallower dish (the
//   step is capped at its dome), so the floor never sits below the plain shoulder. Underneath, the cavity keeps the
//   mold's dome wherever that leaves `plate` of plastic and flattens its ceiling under the dish where it would not,
//   never below the rim depth: the track stays off the underside (Kastaplast: prominent on top, not noticeable at the
//   bottom). Earlier feel checks: a ring on a deeply dished, domed plate read as a dished putter; one flat plane
//   erased the step that is the feature; the real top is "like a puddle top".
//   Position 'rim' (the Blast's subtle track over a slightly recessed plate, the Hammer's inner-rim track) keeps
//   its ring on the dome: a low plateau `height` tall from `inner`·Rs out to the shoulder, the dome giving up as
//   much as keeps the measured height.
//  puddle: the whole plate dished below the rim's top edge, `depth` at the centre; the rim, at the measured
//   height, is the highest point, and the plate's underside sinks with it.
//  groove: a narrow channel `depth` deep and 2·`halfWidth` across, centred at `at`·Rs, or for position
//   'shoulder' (the Sled) rolled into the shoulder, its outer wall running into it.
//  thumbtack: a bulge `height` tall on one arc of the shoulder, about a thumb wide (`arc` cm either side of its
//   centre at `angle`), not a ring. Not round the axis, so the lathe can't spin it: mesh.mjs lifts the vertices.
export const THUMBTRACK=Object.freeze({
 raised:Object.freeze({height:.16,inner:.62,blend:.5,step:.3,at:.85,roll:1.2}),
 puddle:Object.freeze({depth:.4}),
 groove:Object.freeze({depth:.15,halfWidth:.3,edge:.12,at:.68}),
 thumbtack:Object.freeze({height:.22,halfWidth:.6,arc:1.6,angle:-Math.PI/4}),
});
// Where a kind's track can sit other than its default: a groove at the shoulder, a raised track as a ring at the rim.
export const THUMBTRACK_POSITIONS=Object.freeze({groove:Object.freeze(['shoulder']),raised:Object.freeze(['rim'])});
// The shape's thumbtrack from a catalog record (data.json `thumbtrack`, `thumbtrackPosition`), or null.
export const thumbtrackOf=d=>THUMBTRACK[d?.thumbtrack]?{kind:d.thumbtrack,position:d.thumbtrackPosition||null}:null;

// Fill in defaults and keep every parameter inside a range that still makes a valid, hollow disc.
// A thumbtrack of a known kind is kept; every other shape keeps exactly the keys it always had.
export function normalizeShape(params={}){
 const p={...DEFAULTS,...params};
 const R=clamp(+p.diameter||DEFAULTS.diameter,15,30)/2;
 const kind=p.thumbtrack?.kind,tt=THUMBTRACK[kind]?{kind,position:THUMBTRACK_POSITIONS[kind]?.includes(p.thumbtrack.position)?p.thumbtrack.position:null}:null;
 return {
  ...(tt?{thumbtrack:tt}:{}),
  diameter:R*2,
  rimWidth:clamp(+p.rimWidth,.6,R*.35),
  rimDepth:clamp(+p.rimDepth,.6,2.4),
  domeHeight:clamp(+p.domeHeight,0,1.5),  // tall putters (Nova, 2.7 cm) need about 1
  plate:clamp(+p.plate,.12,.4),
  sharpness:clamp(+p.sharpness,0,1),
  bevel:clamp(+p.bevel,-1,1),
  partingLine:clamp(+p.partingLine,.25,.75),
 };
}

const cubic=(a,b,c,d,n,skipFirst=true)=>{
 const out=[];
 for(let i=skipFirst?1:0;i<=n;i++){
  const s=i/n,u=1-s;
  out.push({x:u*u*u*a.x+3*u*u*s*b.x+3*u*s*s*c.x+s*s*s*d.x,y:u*u*u*a.y+3*u*u*s*b.y+3*u*s*s*c.y+s*s*s*d.y});
 }
 return out;
};
const mix=(a,b,t)=>({x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t)});

// Key radii and heights, shared by the profile and the stamp (which rides the top surface).
export function shapeFrame(params){
 const p=normalizeShape(params),R=p.diameter/2,w=p.rimWidth;
 const Ri=R-w,Hs=p.rimDepth+p.plate;
 // Drivers carry a flat top out over a long wing; putters round over from closer to the rim.
 const Rs=Ri+w*lerp(.25,.12,p.sharpness);
 const footW=w*lerp(.45,.18,p.sharpness);
 return {p,R,w,Ri,Rs,Hs,Rf:Ri+footW,plh:p.partingLine*Hs,tt:p.thumbtrack?trackFrame(p,Rs):null};
}

// Where a shape's thumbtrack sits: the radii its relief spans, [from, to], and what each kind needs.
function trackFrame(p,Rs){
 const kind=p.thumbtrack.kind,k=THUMBTRACK[kind];
 // The top peaks at the centre or at the plateau's inner edge: the dome is lowered until the edge is no taller.
 // A dome shallower than the track caps it (a little relief stays on the flattest), so nothing stands taller than measured.
 // The Berg's ring stands at the measured height; the dish inside it is sampled across its roll.
 if(kind==='raised'&&p.thumbtrack.position!=='rim'){const ringIn=Math.min(Rs,Rs-k.at+k.roll/2),floor=Rs-k.at-k.roll/2;
  return {kind,dish:true,dome:p.domeHeight,step:Math.min(k.step,p.domeHeight),ringIn,floor,span:[floor,ringIn]};}
 if(kind==='raised'){const inner=k.inner*Rs,height=Math.min(k.height,Math.max(p.domeHeight,.06));
  const dome=Math.min(p.domeHeight,Math.max(0,(p.domeHeight-height)/domeCurve(k.inner,p.sharpness)));
  return {kind,...k,height,innerR:inner,dome,span:[inner-k.blend,inner]};}
 if(kind==='puddle')return {kind,...k,span:[Rs*.55,Rs]};
 if(kind==='groove'){const centre=p.thumbtrack.position==='shoulder'?Rs-k.halfWidth-.04:k.at*Rs;return {kind,...k,centre,span:[centre-k.halfWidth,centre+k.halfWidth]};}
 const centre=Rs-.1;return {kind,...k,centre,span:[centre-k.halfWidth,Math.min(Rs,centre+k.halfWidth)]};
}

// The dome: g(0) = 1 at the centre, g(1) = 0 at the shoulder. Putters fall away steadily (1 - u²);
// drivers stay flat near the rim and dome through the middle (a raised cosine).
const domeCurve=(u,sharpness)=>{u=clamp(u,0,1);return lerp(1-u*u,(1+Math.cos(Math.PI*u))/2,sharpness);};
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};

// The top surface at radius r, centre to shoulder (past the shoulder it holds the shoulder's height).
export function topHeight(params,r){
 const f=shapeFrame(params);
 return f.tt?f.Hs+trackTop(f,Math.abs(r)):f.Hs+f.p.domeHeight*domeCurve(Math.abs(r)/f.Rs,f.p.sharpness);
}
// The top above the shoulder height Hs, with the shape's thumbtrack.
function trackTop(f,r){
 const {p,Rs,tt}=f,u=Math.min(r/Rs,1),dome=p.domeHeight*domeCurve(u,p.sharpness);
 if(tt.dish)return p.domeHeight-tt.step*(1-smooth(tt.floor,tt.ringIn,r));
 if(tt.kind==='raised')return tt.dome*domeCurve(u,p.sharpness)+tt.height*smooth(tt.innerR-tt.blend,tt.innerR,r);
 // A bowl: flat at the centre, steepening out to the rim's lip, concave throughout.
 if(tt.kind==='puddle')return p.domeHeight-tt.depth*(1-u**4);
 if(tt.kind==='groove')return dome-tt.depth*smooth(tt.halfWidth,tt.halfWidth-tt.edge,Math.abs(r-tt.centre));
 return dome;
}
// The top surface as a function of (x, z), the thumbtack included, with the shape's frame worked out once:
// what a stamp or photo laid on the disc samples per vertex. Without a thumbtrack it is topHeight exactly.
export function surfaceSampler(params){
 const f=shapeFrame(params),{p,Hs,Rs}=f;
 const height=f.tt?r=>Hs+trackTop(f,r):r=>Hs+p.domeHeight*domeCurve(r/Rs,p.sharpness);
 if(f.tt?.kind!=='thumbtack')return (x,z)=>height(Math.hypot(x,z));
 const lift=liftOf(f);return (x,z)=>height(Math.hypot(x,z))+lift(x,z);
}
// The thumbtack's bulge as a function of (x, z), or null on every other disc.
export const thumbtackLifter=params=>params.thumbtrack?.kind==='thumbtack'?liftOf(shapeFrame(params)):null;
// 0 off the bulge; on it, a smooth bell across the shoulder and along the arc, so the lifted surface has no edge.
const bell=t=>(1+Math.cos(Math.PI*t))/2;
function liftOf({tt}){
 return (x,z)=>{
  const r=Math.hypot(x,z),across=Math.abs(r-tt.centre)/tt.halfWidth;if(across>=1)return 0;
  let d=Math.atan2(z,x)-tt.angle;d=Math.abs(Math.atan2(Math.sin(d),Math.cos(d)))*r;
  const along=d/tt.arc;return along>=1?0:tt.height*bell(across)*bell(along);
 };
}

// The closed cross-section as [{x: radius, y: height}], axis to axis. `detail` scales the sampling
// (1 is about 70 points; the lathe's radial segments are set separately by the viewer).
export function discProfile(params,opts){return traceProfile(params,opts).pts;}

// Overmold (GYRO) discs: the same profile, marked where the rim piece meets the flight plate. On top the
// seam is at the measured rim width, r = R − rimWidth, where a point is added. Underneath, it is the top of
// the inner rim wall, where the plate's fillet ends. Profile edges rim[0] to rim[1] − 1 are the rim; the
// rest of the profile is the plate.
export function overmoldProfile(params,opts){
 const {pts,wallTop,top}=traceProfile(params,opts),f=shapeFrame(params);
 let j=top;while(j<pts.length-1&&pts[j].x>f.Ri)j++;
 const seam={x:f.Ri,y:topHeight(params,f.Ri)};
 const points=pts[j].x===f.Ri?pts:[...pts.slice(0,j),seam,...pts.slice(j)];
 return {points,rim:[wallTop,j],seamRadius:f.Ri};
}

function traceProfile(params,{detail=1}={}){
 const f=shapeFrame(params),{p,R,Ri,Rs,Hs,Rf,plh}=f,s=p.sharpness;
 const n=k=>Math.max(2,Math.round(k*detail));
 const base=r=>p.rimDepth+(f.tt?.kind==='raised'?f.tt.dome:p.domeHeight)*.85*domeCurve(r/Rs,s);
 // A puddle's plate sinks as a whole: its underside drops wherever the top falls below the domed top it replaces.
 // The Berg's dish leaves at least `plate` of plastic: the cavity's ceiling flattens under it (to rimDepth at most).
 const under=f.tt?.kind==='puddle'?r=>base(r)-Math.max(0,Hs+p.domeHeight*domeCurve(r/Rs,s)-topHeight(p,r))
  :f.tt?.dish?r=>Math.min(base(r),topHeight(p,r)-p.plate):base;
 const fillet=Math.min(.22,p.rimDepth*.18),footR=Math.min(.22,(Rf-Ri)*.6,p.rimDepth*.2);
 const wallTop=Ri-.06;  // the inner wall leans in slightly toward the plate
 const pts=[];
 // 1. Underside of the flight plate, axis outward. It follows the dome, so the cavity is a shallow bowl.
 const plateEnd=wallTop-fillet,steps=n(12);
 for(let i=0;i<=steps;i++){const r=plateEnd*i/steps;pts.push({x:r,y:under(r)});}
 // 2. Fillet into the inner rim wall, then down it.
 const filletStart=pts[pts.length-1],filletEnd={x:wallTop,y:p.rimDepth-fillet};
 pts.push(...cubic(filletStart,{x:filletStart.x+fillet*.55,y:filletStart.y},{x:wallTop,y:filletEnd.y+fillet*.55},filletEnd,n(4)));
 const wallTopIndex=pts.length-1;
 const wallFoot={x:Ri,y:footR};
 pts.push(wallFoot);
 // 3. Round off the wall into the foot, then along the foot to where the lower wing begins.
 const F={x:Rf,y:0};
 pts.push(...cubic(wallFoot,{x:Ri,y:footR*.45},{x:Ri+footR*.45,y:0},{x:Ri+footR,y:0},n(4)));
 if(Rf-Ri>footR+.02)pts.push(F);
 // 4. The lower wing, foot to nose. Convex (round, putter) controls hug the outer-bottom corner;
 //    concave (driver) controls pull toward the inner-top corner, scooping the bevel.
 const N={x:R,y:plh},k=(p.bevel+1)/2,span=R-Rf;
 const c1=mix({x:Rf+span*.55,y:0},{x:Rf+span*.14,y:plh*.4},k);
 const c2=mix({x:R,y:plh*.45},{x:R-span*.4,y:plh*.8},k);
 pts.push(...cubic(F,c1,c2,N,n(14)));
 // 5. A sharp nose is a crease: repeat the point so the lathe gives each side its own normal.
 if(s>=.35)pts.push({...N});
 // 6. Shoulder, nose up to where the dome begins. A blunt nose leaves vertically; a sharp one leans in.
 //    A thumbtrack can move where it ends: a raised track lifts it, a puddle's rim lip stands at the full height.
 const Ht=f.tt?topHeight(p,Rs):Hs;
 const S={x:Rs,y:Ht},sh=R-Rs;
 const c3=mix({x:R,y:plh+(Ht-plh)*.55},{x:R-sh*.22,y:plh+(Ht-plh)*.62},s);
 const c4=mix({x:Rs+sh*.6,y:Ht},{x:Rs+sh*.5,y:Ht},s);
 pts.push(...cubic(N,c3,c4,S,n(14)));
 // 7. The top, shoulder back to the axis. A thumbtrack's relief takes extra samples across its span.
 const topSteps=n(16),topIndex=pts.length-1;
 if(!f.tt)for(let i=1;i<=topSteps;i++){const r=Rs*(1-i/topSteps);pts.push({x:r,y:topHeight(p,r)});}
 else{
  const radii=[];for(let i=1;i<=topSteps;i++)radii.push(Rs*(1-i/topSteps));
  const [a,b]=f.tt.span,extra=Math.max(2,Math.ceil((b-a)/((f.tt.kind==='puddle'?.4:.05)/detail)));
  for(let i=0;i<=extra;i++){const r=a+(b-a)*i/extra;if(r>0&&r<Rs)radii.push(r);}
  radii.sort((x,y)=>y-x);
  for(const r of radii.filter((r,i)=>!i||radii[i-1]-r>1e-6))pts.push({x:r,y:topHeight(p,r)});
 }
 return {pts,wallTop:wallTopIndex,top:topIndex};
}

// Summary numbers the viewer and tests use: overall height, how deep the cavity is, nose angle.
export function profileStats(params){
 const f=shapeFrame(params),pts=discProfile(params);
 const top=Math.max(...pts.map(q=>q.y)),bottom=Math.min(...pts.map(q=>q.y));
 const centreUnder=pts[0].y,centreTop=pts[pts.length-1].y;
 // Interior angle at the nose between the lower wing and the shoulder, from neighbouring samples.
 const i=pts.findIndex(q=>q.x===f.R&&q.y===f.plh);
 const before=pts[i-1],after=pts[pts.length-1]&&pts.find((q,j)=>j>i&&(q.x!==f.R||q.y!==f.plh));
 const a1=Math.atan2(before.y-f.plh,before.x-f.R),a2=Math.atan2(after.y-f.plh,after.x-f.R);
 let nose=Math.abs(a2-a1)*180/Math.PI;if(nose>180)nose=360-nose;
 return {height:top-bottom,cavity:centreUnder-bottom,centrePlate:centreTop-centreUnder,dome:f.p.domeHeight,noseAngle:nose,points:pts.length};
}
