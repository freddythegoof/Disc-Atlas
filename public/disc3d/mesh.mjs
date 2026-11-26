// The disc mesh both 3D surfaces share: the detail panel's viewer (viewer.mjs) and the atlas's top-down
// discs (atlas-art.mjs). The shape.mjs profile spun by LatheGeometry; an overmold disc's index is split into
// two groups, the flight plate (material 0) and the rim (material 1).
import * as THREE from 'three';
import {discProfile,overmoldProfile,shapeFrame,thumbtackLifter} from './shape.mjs';
import {haloCoord} from './halo-shader.mjs';

// Finishes only (a picker is phase 3): premium is glossy, base is matte.
export const PLASTICS={
 premium:{roughness:.3,clearcoat:.6,clearcoatRoughness:.22},
 base:{roughness:.62,clearcoat:.06,clearcoatRoughness:.6},
};

// LatheGeometry writes two triangles per (segment, profile edge), edges varying fastest. Reorder them into
// two groups, the plate (material 0) then the rim (material 1, edges rim[0] to rim[1] − 1). The vertices and
// their normals are untouched, so the seam shades smoothly.
export function groupRim(geometry,count,[from,to]){
 const index=geometry.index.array,edges=count-1,plate=[],rim=[];
 for(let k=0;k<index.length;k+=6){const e=(k/6)%edges,out=e>=from&&e<to?rim:plate;for(let i=k;i<k+6;i++)out.push(index[i]);}
 geometry.setIndex([...plate,...rim]);
 geometry.addGroup(0,plate.length,0);geometry.addGroup(plate.length,rim.length,1);
}

// The profile the lathe spins: {points, rim, seamRadius}, where `rim` (overmold only) is the [from, to) range of
// profile edges that are the rim piece. The viewer's 2D cross-section (clay mode) draws these same points.
export function lathePoints(shape,{detail=1,overmold=false}={}){
 if(overmold)return overmoldProfile(shape,{detail});
 return {points:discProfile(shape,{detail}),rim:null,seamRadius:null};
}

// A thumbtack (shape.mjs THUMBTRACK) bulges on one arc of the shoulder, so it is lifted onto the spun lathe:
// every vertex of the outer top (facing up, above the parting line, so never the cavity or the inner wall
// beneath the bulge) rises by the lift (shape.mjs thumbtackLifter), and its normal tilts by the bulge's slope (the lathe's own normal,
// scaled to a unit rise, plus the lift's gradient), so the seam and every other vertex keep theirs.
const LIFT_EPS=.005;
function liftThumbtack(geometry,shape){
 const pos=geometry.attributes.position,nrm=geometry.attributes.normal,n=new THREE.Vector3(),{plh}=shapeFrame(shape),lift=thumbtackLifter(shape);
 for(let i=0;i<pos.count;i++){
  const ny=nrm.getY(i);if(ny<=0||pos.getY(i)<=plh)continue;
  const x=pos.getX(i),z=pos.getZ(i),up=lift(x,z);if(!up)continue;
  pos.setY(i,pos.getY(i)+up);
  if(ny<.05)continue;
  const dx=(lift(x+LIFT_EPS,z)-lift(x-LIFT_EPS,z))/(2*LIFT_EPS),dz=(lift(x,z+LIFT_EPS)-lift(x,z-LIFT_EPS))/(2*LIFT_EPS);
  n.set(nrm.getX(i)/ny-dx,1,nrm.getZ(i)/ny-dz).normalize();nrm.setXYZ(i,n.x,n.y,n.z);
 }
}

// A stamp or photo on a thumbtrack mold is the body's own top, raised by `offset`: the lathe's top profile, from
// `radius` in to the axis, spun with the body's `segments`, `detail` and `overmold` (and lifted by its thumbtack), so
// every vertex and triangle lies on one of the body's. An evenly spaced ring bridged the relief's breakpoints and sank
// under the plate at its walls. UVs are Cartesian x/z across a diameter of 2·`span`, the ring's own mapping.
export function topLayerGeometry(shape,radius,{segments=80,detail=1,overmold=false,offset=0,span=radius}={}){
 const {points}=lathePoints(shape,{detail,overmold}),{Rs}=shapeFrame(shape);
 // The top runs from the shoulder (Rs) to the axis, the profile's last points, radii falling.
 let i=points.length-1;while(i>0&&points[i-1].x>=points[i].x&&points[i-1].x<=Rs+1e-9)i--;
 const top=points.slice(i),k=top.findIndex(p=>p.x<=radius+1e-9);
 const edge=k>0&&top[k].x<radius-1e-9?[{x:radius,y:top[k-1].y+(top[k].y-top[k-1].y)*(radius-top[k-1].x)/(top[k].x-top[k-1].x)}]:[];
 const geometry=new THREE.LatheGeometry([...edge,...top.slice(k)].map(p=>new THREE.Vector2(p.x,p.y)),segments);
 if(shape.thumbtrack?.kind==='thumbtack')liftThumbtack(geometry,shape);
 const pos=geometry.attributes.position,uv=geometry.attributes.uv;
 for(let j=0;j<pos.count;j++){pos.setY(j,pos.getY(j)+offset);uv.setXY(j,.5+pos.getX(j)/(2*span),.5-pos.getZ(j)/(2*span));}
 return geometry;
}

// `segments` around the axis; `detail` scales the profile's sampling (shape.mjs, 1 is about 70 points).
// Returns the geometry, the profile it was spun from and, for an overmold, the seam radius.
// `halo` (a Halo v2 band, with the split): each vertex also carries `haloCoord` (halo-shader.mjs).
export function discGeometry(shape,{segments=80,detail=1,overmold=false,halo=false}={}){
 const profile=lathePoints(shape,{detail,overmold}),thumbtack=shape.thumbtrack?.kind==='thumbtack';
 const geometry=new THREE.LatheGeometry(profile.points.map(p=>new THREE.Vector2(p.x,p.y)),segments);
 if(thumbtack)liftThumbtack(geometry,shape);
 if(overmold)groupRim(geometry,profile.points.length,profile.rim);
 if(overmold&&halo)geometry.setAttribute('haloCoord',new THREE.BufferAttribute(haloCoord(geometry.attributes.position,geometry.attributes.normal,shape.diameter/2),4));
 return {geometry,seamRadius:profile.seamRadius,profile};
}
