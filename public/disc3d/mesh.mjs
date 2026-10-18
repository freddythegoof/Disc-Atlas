// The disc mesh both 3D surfaces share: the detail panel's viewer (viewer.mjs) and the atlas's top-down
// discs (atlas-art.mjs). The shape.mjs profile spun by LatheGeometry; an overmold disc's index is split into
// two groups, the flight plate (material 0) and the rim (material 1).
import * as THREE from 'three';
import {discProfile,overmoldProfile} from './shape.mjs';
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

// `segments` around the axis; `detail` scales the profile's sampling (shape.mjs, 1 is about 70 points).
// Returns the geometry, the profile it was spun from and, for an overmold, the seam radius.
// `halo` (a Halo v2 band, with the split): each vertex also carries `haloCoord` (halo-shader.mjs).
export function discGeometry(shape,{segments=80,detail=1,overmold=false,halo=false}={}){
 const profile=lathePoints(shape,{detail,overmold});
 const geometry=new THREE.LatheGeometry(profile.points.map(p=>new THREE.Vector2(p.x,p.y)),segments);
 if(overmold)groupRim(geometry,profile.points.length,profile.rim);
 if(overmold&&halo)geometry.setAttribute('haloCoord',new THREE.BufferAttribute(haloCoord(geometry.attributes.position,geometry.attributes.normal,shape.diameter/2),4));
 return {geometry,seamRadius:profile.seamRadius,profile};
}
