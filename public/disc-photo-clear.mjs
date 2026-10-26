// A clear disc's photo, at load (docs/clear-plastic-true-color.md). Pure pixel work on the decoded crop's RGBA bytes, so
// it runs the same in the page (disc3d/photo.mjs, in row bands between tasks) and in Node (the unit suite).
//
// 1. The photo ends at its own plate edge. The model draws the photo out to the shoulder (photoGeometry, `Rs`), but
//    the plate in the photo ends short of that and off centre (the shot is a little off axis, or centred on the rim's
//    outer edge, as the aligner asks): the photo's rim band would land on the model's shoulder as a crescent, and on a
//    clear disc that band is the rim's deep colour lit as a surface: a streak. So at 256 angles the crop is walked
//    inward from its edge, across the rim band, until six samples in a row are the plate's colour, a circle is fitted to those points (the
//    plate edge of a disc is a circle, moved by the shot; a per-angle edge notches where a glare band crosses it), and
//    the alpha fades to nothing over 2% of R outside it. The clear walls show through there in the tint's own deepening.
// 2. With the plastic's true colour `tint`, the plate is retinted toward it: every texel within ΔE 10 of the photo's
//    plate colour is multiplied per channel by tint^a / plate (texels at ΔE 25 and beyond are left alone, smooth
//    between). The red foil, the navy ink and a white ink keep their colour; the plate, the shadow copies and the scuffs
//    move with it, as the plastic they are.
// Nothing here runs for an opaque disc.
import {plateColor} from './disc-albedo.mjs';

const toLinear=new Float32Array(256);
for(let i=0;i<256;i++){const c=i/255;toLinear[i]=c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}
const labOf=(r,g,b)=>{
 const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116,R=toLinear[r],G=toLinear[g],B=toLinear[b];
 const fx=f((.4124*R+.3576*G+.1805*B)/.95047),fy=f(.2126*R+.7152*G+.0722*B),fz=f((.0193*R+.1192*G+.9505*B)/1.08883);
 return [116*fy-16,500*(fx-fy),200*(fy-fz)];
};
const hexBytes=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
export const EDGE={angles:256,run:6,within:16,outlier:.012,feather:.02,from:.995,to:.66};
export const RETINT={full:10,none:25};

// Least-squares circle through points [[x,y],…]: x²+y²+Dx+Ey+F=0.
function fitCircle(points){
 let sxx=0,sxy=0,syy=0,sx=0,sy=0,sxz=0,syz=0,sz=0,m=0;
 for(const [x,y] of points){const z=x*x+y*y;sxx+=x*x;sxy+=x*y;syy+=y*y;sx+=x;sy+=y;sxz+=x*z;syz+=y*z;sz+=z;m++;}
 const M=[[sxx,sxy,sx],[sxy,syy,sy],[sx,sy,m]],b=[-sxz,-syz,-sz];
 for(let c=0;c<3;c++){
  let p=c;for(let r=c+1;r<3;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;
  [M[c],M[p]]=[M[p],M[c]];[b[c],b[p]]=[b[p],b[c]];
  if(!M[c][c])return null;
  for(let r=0;r<3;r++){if(r===c)continue;const f=M[r][c]/M[c][c];for(let q=c;q<3;q++)M[r][q]-=f*M[c][q];b[r]-=f*b[c];}
 }
 const D=b[0]/M[0][0],E=b[1]/M[1][1],F=b[2]/M[2][2],rho2=D*D/4+E*E/4-F;
 return rho2>0?{cx:-D/2,cy:-E/2,rho:Math.sqrt(rho2)}:null;
}
// The plate's edge in the crop: a circle (centre and radius as shares of R, the crop's half side), or null when fewer
// than half the angles find the plate (a photo that is not a disc on a surface).
export function plateEdge(data,size,plate){
 const [pr,pg,pb]=hexBytes(plate),P=labOf(pr,pg,pb),A=EDGE.angles,points=[];
 const dE=k=>{const l=labOf(data[k],data[k+1],data[k+2]);return Math.hypot(l[0]-P[0],l[1]-P[1],l[2]-P[2]);};
 for(let a=0;a<A;a++){
  // The plate counts only once the walk has crossed the rim band (six samples in a row unlike the plate): over a dark
  // surface the background outside the disc reads as the plate does (the clear plate shows that surface), and a walk
  // that stopped there put the circle at the crop's edge and cut nothing (docs/clear-plastic-true-color.md §9).
  const th=a/A*2*Math.PI,cs=Math.cos(th),sn=Math.sin(th);let run=0,band=0;
  for(let r=EDGE.from;r>EDGE.to;r-=2/size){
   const x=Math.floor((1+r*cs)*size/2),y=Math.floor((1+r*sn)*size/2);if(x<0||y<0||x>=size||y>=size)continue;
   const k=(y*size+x)*4;
   if(data[k+3]<250){run=0;continue;}
   if(dE(k)<EDGE.within){if(band>=EDGE.run&&++run>=EDGE.run){const edge=r+EDGE.run*2/size;points.push([edge*cs,edge*sn]);break;}if(band<EDGE.run)band=0;}
   else{run=0;band++;}
  }
 }
 if(points.length<A/2)return null;
 let kept=points,circle=fitCircle(kept);if(!circle)return null;
 for(let pass=0;pass<2;pass++){
  const inliers=kept.filter(([x,y])=>Math.abs(Math.hypot(x-circle.cx,y-circle.cy)-circle.rho)<EDGE.outlier);
  if(inliers.length<A/2)break;
  const next=fitCircle(inliers);if(!next)break;kept=inliers;circle=next;
 }
 // A circle at the crop's own edge is no plate edge (the plate reaches the edge: nothing to cut).
 if(circle.rho+Math.hypot(circle.cx,circle.cy)>EDGE.from-EDGE.feather)return null;
 return {...circle,points:points.length,kept:kept.length};
}
// The edge's radius along the direction (ux,uy) from the crop's centre.
export const edgeRadius=(circle,ux,uy)=>{const uc=ux*circle.cx+uy*circle.cy;return uc+Math.sqrt(Math.max(0,uc*uc-(circle.cx*circle.cx+circle.cy*circle.cy)+circle.rho*circle.rho));};

// The plan for one photo: its plate colour, the retint gains and the edge circle. `tint`: the plastic's true colour
// (hex) or null for the cut alone; `a`: the exponent the plate takes toward it.
export function planClearPhoto(data,size,{tint=null,a=1}={}){
 const plate=plateColor(data,size);
 if(!plate)return null;
 const [pr,pg,pb]=hexBytes(plate),P=labOf(pr,pg,pb);
 const gain=/^#[0-9a-f]{6}$/i.test(tint||'')?hexBytes(tint).map((t,i)=>Math.min(4,255*(t/255)**a/Math.max(1,[pr,pg,pb][i]))):null;
 return {plate,P,gain,circle:plateEdge(data,size,plate)};
}
// Rows j0…j1 of the crop, retinted and cut in place. Returns the pixels it changed.
export function applyClearPhotoRows(plan,data,size,j0,j1){
 const {P,gain,circle}=plan;let changed=0;
 const inner=circle?(circle.rho-Math.hypot(circle.cx,circle.cy)-EDGE.feather)**2:Infinity;
 for(let y=j0;y<j1;y++)for(let x=0;x<size;x++){
  const k=(y*size+x)*4;if(!data[k+3])continue;
  if(gain){
   const l=labOf(data[k],data[k+1],data[k+2]),e=Math.hypot(l[0]-P[0],l[1]-P[1],l[2]-P[2]);
   if(e<RETINT.none){
    const w=e<=RETINT.full?1:1-(e-RETINT.full)/(RETINT.none-RETINT.full),ws=w*w*(3-2*w);
    for(let c=0;c<3;c++){const v=Math.min(255,Math.round(data[k+c]*(1+(gain[c]-1)*ws)));if(v!==data[k+c]){data[k+c]=v;changed++;}}
   }
  }
  if(circle){
   const u=(x+.5)/size*2-1,v=(y+.5)/size*2-1,r2=u*u+v*v;if(r2<inner)continue;
   const r=Math.sqrt(r2),t=(edgeRadius(circle,u/r,v/r)-r)/EDGE.feather;
   if(t>=1)continue;
   const alpha=t<=0?0:Math.round(data[k+3]*t*t*(3-2*t));if(alpha!==data[k+3]){data[k+3]=alpha;changed++;}
  }
 }
 return changed;
}
// The whole crop at once (Node, tests).
export function clearPhotoPixels(data,size,options={}){
 const plan=planClearPhoto(data,size,options);if(!plan)return null;
 return {...plan,changed:applyClearPhotoRows(plan,data,size,0,size)};
}
