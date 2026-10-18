// Halo v2's two-colour band (docs/halo-band-v2.md), as a patch on a renderer's own band material: the same
// plastic, lit the same way, with only its diffuse colour changed. On the band's top face the colour is the
// wash from the seam out to the dye front and the dye (the material's own colour) beyond it, blended across
// the front over HALO_FEATHER; the rim wall and underside stay full dye. The front is read per fragment from
// the stored ring (the same Catmull-Rom sum as halo.mjs frontAt), so the edge is as soft at any size.
//
// The geometry carries, per vertex, `haloCoord` (addHaloCoord, below): its radius as a share of R, the
// cosine and sine of its angle in the photo's frame, and how much it faces up (the top face, 1; walls and
// underside, 0). Computed before a renderer moves or scales its geometry, so it survives every transform.
// Pure JS: three.js reaches it only through the material and geometry objects the renderers pass in.
import {HALO_RING,HALO_FEATHER,parseHalo} from './halo.mjs';

const toLinear=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};
const linear=hex=>[1,3,5].map(i=>toLinear(parseInt(hex.slice(i,i+2),16)));
const smooth=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t);};

// The per-vertex band coordinate. `geometry` is a lathe (y up, the profile spun about it) before any transform;
// R the disc's radius in its units. The photo's frame: its x is the lathe's x, its y (down the image) the
// lathe's z (photo.mjs maps the texture so), so the photo angle is atan2(z, x).
export function haloCoord(position,normal,R){
 const out=new Float32Array(position.count*4);
 for(let i=0;i<position.count;i++){
  const x=position.getX(i),z=position.getZ(i),r=Math.hypot(x,z);
  out[4*i]=r/R;out[4*i+1]=r?x/r:1;out[4*i+2]=r?z/r:0;out[4*i+3]=smooth(.2,.45,normal.getY(i));
 }
 return out;
}

// Uniforms for one band: set them per disc (setHalo), share them with the material they patch.
export function haloUniforms(){
 return {haloWash:{value:[1,1,1]},haloFront:{value:new Float32Array(HALO_RING).fill(.9)},haloFeather:{value:HALO_FEATHER}};
}
// The stored model ('#rrggbb…', halo.mjs) into the uniforms. False when it does not parse.
export function setHalo(uniforms,value){
 const model=parseHalo(value);if(!model)return false;
 uniforms.haloWash.value=linear(model.wash);uniforms.haloFront.value.set(model.front);return true;
}

const VERTEX='attribute vec4 haloCoord;\nvarying vec4 vHalo;\n';
const FRAGMENT=`varying vec4 vHalo;
uniform vec3 haloWash;
uniform float haloFront[${HALO_RING}];
uniform float haloFeather;
`;
const MIX=`
{
 float haloT=fract(atan(vHalo.z,vHalo.y)/6.283185307)*${HALO_RING}.0;
 int haloI=int(floor(haloT));float haloF=haloT-float(haloI);
 float hp0=haloFront[(haloI+${HALO_RING-1})%${HALO_RING}],hp1=haloFront[haloI],hp2=haloFront[(haloI+1)%${HALO_RING}],hp3=haloFront[(haloI+2)%${HALO_RING}];
 float haloAt=0.5*(2.0*hp1+(-hp0+hp2)*haloF+(2.0*hp0-5.0*hp1+4.0*hp2-hp3)*haloF*haloF+(-hp0+3.0*hp1-3.0*hp2+hp3)*haloF*haloF*haloF);
 // smoothstep climbs from 10% to 90% over 0.608 of its span: this span draws the front's blend at haloFeather.
 float haloHalf=haloFeather/1.216;
 float haloDye=smoothstep(haloAt-haloHalf,haloAt+haloHalf,vHalo.x);
 diffuseColor.rgb=mix(diffuseColor.rgb,haloWash,(1.0-haloDye)*clamp(vHalo.w,0.0,1.0));
}
`;
// Patch a band material (MeshStandard/MeshPhysical) in place, after whatever patch it already has (the atlas's
// slope shading). Its colour stays the dye.
export function patchHalo(material,uniforms){
 const before=material.onBeforeCompile,key=material.customProgramCacheKey;
 material.onBeforeCompile=function(shader,renderer){
  before.call(this,shader,renderer);
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader=VERTEX+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHalo=haloCoord;');
  shader.fragmentShader=FRAGMENT+shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>'+MIX);
 };
 material.customProgramCacheKey=function(){return key.call(this)+'|halo-v2';};
 material.userData.halo=uniforms;material.needsUpdate=true;
 return material;
}
