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

// Fill in defaults and keep every parameter inside a range that still makes a valid, hollow disc.
export function normalizeShape(params={}){
 const p={...DEFAULTS,...params};
 const R=clamp(+p.diameter||DEFAULTS.diameter,15,30)/2;
 return {
  diameter:R*2,
  rimWidth:clamp(+p.rimWidth,.6,R*.35),
  rimDepth:clamp(+p.rimDepth,.6,2.4),
  domeHeight:clamp(+p.domeHeight,0,.8),
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
 return {p,R,w,Ri,Rs,Hs,Rf:Ri+footW,plh:p.partingLine*Hs};
}

// The dome: g(0) = 1 at the centre, g(1) = 0 at the shoulder. Putters fall away steadily (1 - u²);
// drivers stay flat near the rim and dome through the middle (a raised cosine).
const domeCurve=(u,sharpness)=>{u=clamp(u,0,1);return lerp(1-u*u,(1+Math.cos(Math.PI*u))/2,sharpness);};

export function topHeight(params,r){
 const f=shapeFrame(params);
 return f.Hs+f.p.domeHeight*domeCurve(Math.abs(r)/f.Rs,f.p.sharpness);
}

// The closed cross-section as [{x: radius, y: height}], axis to axis. `detail` scales the sampling
// (1 is about 70 points; the lathe's radial segments are set separately by the viewer).
export function discProfile(params,{detail=1}={}){
 const f=shapeFrame(params),{p,R,Ri,Rs,Hs,Rf,plh}=f,s=p.sharpness;
 const n=k=>Math.max(2,Math.round(k*detail));
 const under=r=>p.rimDepth+p.domeHeight*.85*domeCurve(r/Rs,s);
 const fillet=Math.min(.22,p.rimDepth*.18),footR=Math.min(.22,(Rf-Ri)*.6,p.rimDepth*.2);
 const wallTop=Ri-.06;  // the inner wall leans in slightly toward the plate
 const pts=[];
 // 1. Underside of the flight plate, axis outward. It follows the dome, so the cavity is a shallow bowl.
 const plateEnd=wallTop-fillet,steps=n(12);
 for(let i=0;i<=steps;i++){const r=plateEnd*i/steps;pts.push({x:r,y:under(r)});}
 // 2. Fillet into the inner rim wall, then down it.
 const filletStart=pts[pts.length-1],filletEnd={x:wallTop,y:p.rimDepth-fillet};
 pts.push(...cubic(filletStart,{x:filletStart.x+fillet*.55,y:filletStart.y},{x:wallTop,y:filletEnd.y+fillet*.55},filletEnd,n(4)));
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
 const S={x:Rs,y:Hs},sh=R-Rs;
 const c3=mix({x:R,y:plh+(Hs-plh)*.55},{x:R-sh*.22,y:plh+(Hs-plh)*.62},s);
 const c4=mix({x:Rs+sh*.6,y:Hs},{x:Rs+sh*.5,y:Hs},s);
 pts.push(...cubic(N,c3,c4,S,n(14)));
 // 7. The top, shoulder back to the axis.
 const topSteps=n(16);
 for(let i=1;i<=topSteps;i++){const r=Rs*(1-i/topSteps);pts.push({x:r,y:topHeight(p,r)});}
 return pts;
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
