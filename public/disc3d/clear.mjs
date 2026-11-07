// Clear plastics (docs/clear-plastic-discs.md): a bag disc whose owner set its finish to Clear (Champion, Z, Opto and the
// like) is see-through plastic tinted by its colour, not the opaque premium plastic every other disc wears.
//
// Tinted plastic is a filter: what lies behind it comes through multiplied by the plastic's colour, darker and more
// saturated the longer the path through it (Beer–Lambert), and the plastic's surface adds its reflections on top.
// Blending towards a tint (ordinary transparency) cannot do that: on a light page a saturated tint would have to be
// nearly opaque to show its colour. So a clear disc is drawn in passes that filter what is already drawn:
//  1. Backdrop: under the disc, wherever the canvas is still transparent (it is drawn over the page: the viewer's stage,
//     the bag and the racks), the page's own colour is filled in, so the filter has the page to work on. Elsewhere
//     (the bag's fabric, a rack, another disc) the scene already drawn is what the plastic filters.
//  2. Back wall, then front wall, each as a filter (what is behind × this wall's transmission, less what its surface
//     reflects) and then its shine (reflections, the clear coat, a little light scattered inside the plastic, and the
//     light the plastic pipes to its rim, which glows in its colour where it is seen edge on). The underside and the far
//     rim show through the top, each wall tinting what lies behind it.
// three.js transmission was measured against this (the write-up): it refracts only the scene's own opaque objects, so
// it needs the same backdrop, and it costs a second scene pass and a mip chain on every frame.
//
// The colour the owner picked is the plate as it looks over a light surface (what a photo of it sampled), so it is
// read as the transmission of both walls square on: one wall lets through sqrt(colour), and a wall seen at an angle is
// a longer path (transmission^(1/cos)). Everything else, the clear coat, roughness, environment and any shader hook
// (a Halo band's wash), is the plate's own MeshPhysicalMaterial: a clear disc is lit as an opaque one is.
//
// Opacity (docs/clear-opacity.md): one clear copy's place between glass and opaque plastic, `finish_opacity` on the account,
// 0 to 100 (FINISH_OPACITY.today, or NULL, is the look above). Below today's the plastic holds less dye: the walls' density,
// its haze and its rim glow fall toward CLEAR_RANGE. Above it the plastic scatters what it used to pass: each wall lets less
// of the background through while the diffuse light it had taken away comes back, no extra pass, until only the plastic
// lit as an opaque disc remains. A copy at 100 is not drawn here at all (bag-values.js renderFinish).
import * as THREE from 'three';
import {FINISH_OPACITY} from '../bag-values.js';

export const isClear=finish=>finish==='clear';
// density: the exponent on the picked colour for one wall square on (.5: two walls make the picked colour).
// trueDensity: the exponent per wall when the colour is the plastic's true colour (docs/clear-plastic-true-color.md),
// sampled from the photo's rim band: the flat of the plate shows a step lighter than it (.35: two walls make T^0.7), the
// shoulder and rim deepen to it and past it. truePhoto: the exponent the Photo look's plastic takes toward it (1: the
// photo's plate, lit as a surface, lands where the walls do). scatter: the share of ordinary diffuse light the plastic
// still shows (a little haze; the shape reads in the dark). glow: light piped to the rim, as a share of the tint. minCos:
// the most grazing path counted (keeps the edge finite).
export const CLEAR={density:.5,trueDensity:.35,truePhoto:1,scatter:.12,glow:.35,minCos:.06};
// The most transparent end, as shares of today's: density (what is left of the dye), haze (of `scatter`). Freddy's to move.
// hides: the `solid` past which the plastic hides what lies under its top surface: the front wall writes depth, so its shine
// draws only the nearest surface, not the inside of the far rim as well.
export const CLEAR_RANGE={density:.14,haze:.4,hides:.2};
// What an opacity asks of the plastic: `density` and `haze` as shares of today's, `solid` from 0 (today's and below) to 1.
export function clearLook(opacity){
 const today=FINISH_OPACITY.today,v=Number.isInteger(opacity)&&opacity>=0&&opacity<=100?opacity:today;
 if(v===today)return {density:1,haze:1,solid:0};
 if(v>today)return {density:1,haze:1,solid:(v-today)/(100-today)};
 const t=v/today;return {density:CLEAR_RANGE.density+(1-CLEAR_RANGE.density)*t,haze:CLEAR_RANGE.haze+(1-CLEAR_RANGE.haze)*t,solid:0};
}
// The tint a clear part wears: the plastic's true colour when the copy has one (never on an overmold, whose photo shows
// only its opaque rim piece), else the disc's colour. `exponent`: the per-wall exponent that goes with it. `wall`: the colour
// the walls wear at this opacity: the tint, moving to the disc's own colour on the way to opaque (the opaque disc in that
// colour); a copy's photo keeps the tint, whatever the opacity.
export function clearTint(finish,color,trueColor,{overmold=false,opacity=null}={}){
 const sampled=isClear(finish)&&!overmold&&/^#[0-9a-f]{6}$/i.test(trueColor||'')?trueColor.toLowerCase():null;
 if(!sampled)return {tint:color,wall:color,exponent:CLEAR.density,sampled:false};
 const solid=clearLook(opacity).solid;
 return {tint:sampled,wall:solid?'#'+new THREE.Color().set(sampled).lerp(new THREE.Color().set(color),solid).getHexString():sampled,exponent:CLEAR.trueDensity,sampled:true};
}

const num=v=>Number(v).toFixed(4);
const offUniforms=off=>off?'uniform vec4 clearLook;\nuniform float clearSolid;\n':'';
const defines=off=>`${off?'#define CLEAR_OFF\n':''}#define CLEAR_SCATTER ${num(CLEAR.scatter)}\n#define CLEAR_GLOW ${num(CLEAR.glow)}\n#define CLEAR_MIN_COS ${num(CLEAR.minCos)}\n`;
// The filter: written straight to the framebuffer (no tone mapping or encoding), which holds sRGB values, so the
// transmission goes in as an sRGB-space factor (a power of 1/2.2 is close enough for a multiplier). clearLook (clearPart):
// x, what one wall passes of what it would; y, of both walls together; z, the share of diffuse light kept; w, the glow's share.
// clearSolid: how far toward opaque, 0 at today's look and below. A part at today's look compiles without them (CLEAR_OFF
// unset): its shader is the one every clear disc had before the slider, to the pixel.
const FILTER=`
{
 float clearCos=clamp(abs(dot(normal,normalize(vViewPosition))),CLEAR_MIN_COS,1.);
 vec3 clearT=pow(max(diffuseColor.rgb,vec3(1e-4)),vec3(clearDensity/clearCos));
 float clearF=.04+.96*pow(1.-clearCos,5.);
 #ifdef CLEAR_OFF
  gl_FragColor=vec4(pow(clearT*(1.-clearF)*clearLook.x,vec3(1./2.2)),1.);
 #else
  gl_FragColor=vec4(pow(clearT*(1.-clearF),vec3(1./2.2)),1.);
 #endif
 return;
}
`;
// The shine is added to the framebuffer's sRGB values, but light adds in linear: so it adds what it would add to the
// filtered page behind it (the page colour through both walls), the difference of the two encoded values. The estimate
// is grey (its luminance), so where the real background differs from it (the walls seen edge on, a stamp seen from
// below, the bag's fabric) a highlight is a little too bright or dim, never shifted in hue. On the way to opaque the shine is no longer a
// highlight but most of the disc, where a grey estimate would clip its strong channel, so the estimate turns to each channel.
// Only the front wall takes the diffuse light back: scattering plastic hides its far wall, and hides it first.
const SHINE=`
 float clearCos=clamp(abs(dot(geometryNormal,geometryViewDir)),CLEAR_MIN_COS,1.);
 #ifdef CLEAR_OFF
  vec3 clearThrough=clearPage*pow(max(diffuseColor.rgb,vec3(1e-4)),vec3(clearDensity*(1.+1./clearCos)));
  vec3 clearBehind=mix(vec3(dot(clearThrough,vec3(.2126,.7152,.0722))),clearThrough,min(clearSolid*4.,1.))*clearLook.y;
  #ifdef FLIP_SIDED
   outgoingLight=(outgoingLight+totalDiffuse*(min(clearLook.z,CLEAR_SCATTER)-1.)+diffuseColor.rgb*CLEAR_GLOW*clearLook.w*pow(1.-clearCos,3.))*clearLook.x;
  #else
   outgoingLight+=totalDiffuse*(clearLook.z-1.)+diffuseColor.rgb*CLEAR_GLOW*clearLook.w*pow(1.-clearCos,3.);
  #endif
 #else
  vec3 clearBehind=vec3(dot(clearPage*pow(max(diffuseColor.rgb,vec3(1e-4)),vec3(clearDensity*(1.+1./clearCos))),vec3(.2126,.7152,.0722)));
  outgoingLight+=totalDiffuse*(CLEAR_SCATTER-1.)+diffuseColor.rgb*CLEAR_GLOW*pow(1.-clearCos,3.);
 #endif
 gl_FragColor=vec4(max(outgoingLight,vec3(0.)),1.);
`;
const ADD=`
 gl_FragColor.rgb=max(sRGBTransferOETF(vec4(clearBehind+gl_FragColor.rgb,1.)).rgb-sRGBTransferOETF(vec4(clearBehind,1.)).rgb,vec3(0.));
`;
// One pass of one wall: `material` (patched in place) filters or shines on `side`.
function pass(material,kind,side,page,density,look,solid){
 const previous=material.onBeforeCompile,previousKey=material.customProgramCacheKey;
 Object.assign(material,{side,transparent:true,depthWrite:false,blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,
  blendSrc:kind==='filter'?THREE.ZeroFactor:THREE.OneFactor,blendDst:kind==='filter'?THREE.SrcColorFactor:THREE.OneFactor,
  blendSrcAlpha:THREE.ZeroFactor,blendDstAlpha:THREE.OneFactor,toneMapped:kind!=='filter'});
 material.onBeforeCompile=function(shader,renderer){
  previous.call(this,shader,renderer);
  shader.uniforms.clearDensity=density;shader.uniforms.clearLook=look;shader.uniforms.clearSolid=solid;
  if(kind==='filter'){shader.fragmentShader='uniform float clearDensity;\n'+offUniforms(look.off)+shader.fragmentShader.replace('#include <emissivemap_fragment>',defines(look.off)+FILTER+'#include <emissivemap_fragment>');return;}
  shader.uniforms.clearPage=page;
  shader.fragmentShader='uniform vec3 clearPage;\nuniform float clearDensity;\n'+offUniforms(look.off)+shader.fragmentShader.replace('#include <opaque_fragment>',defines(look.off)+SHINE).replace('#include <colorspace_fragment>',ADD);
 };
 material.customProgramCacheKey=function(){return previousKey.call(this)+'|clear-'+kind+(look.off?'|off':'');};
 material.userData.clear=kind;material.needsUpdate=true;
 return material;
}
// The passes of one clear part (the plate, or a Halo band), from `base`, which makes a fresh material for each (with
// any patch it needs). `walls`: 2 for both walls (the detail tier: the viewer, a pulled disc), 1 for the front wall only
// (small and many-disc renders), which carries both walls' worth of tint so a small disc shows the same colour. Each is
// a {filter, shine} pair, back wall first.
// `page`: the page colour behind the disc, a uniform shared with the other parts of the same disc (clearPage()).
export const clearPage=()=>({value:new THREE.Color(1,1,1)});
export function clearPart(base=()=>new THREE.MeshPhysicalMaterial(),{walls=2,page=clearPage()}={}){
 const sides=walls===2?[THREE.BackSide,THREE.FrontSide]:[THREE.FrontSide];
 // The exponent per wall drawn, shared by the part's passes; a rig drawing one wall of two raises it (clearRig walls).
 const density={value:CLEAR.density*(2/sides.length)},look={value:new THREE.Vector4(1,1,CLEAR.scatter,1),off:false},solid={value:0};
 const list=sides.map(side=>({filter:pass(base(),'filter',side,null,density,look,solid),shine:pass(base(),'shine',side,page,density,look,solid)}));
 return {walls:list,page,density,look,solid,exponent:CLEAR.density,drawn:sides.length,opacity:null,materials:list.flatMap(w=>[w.filter,w.shine]),
  // The exponent and clearLook for the walls drawn and this opacity (the top of this file).
  apply(){const {density:share,haze,solid}=clearLook(this.opacity);this.look.off=!!solid||share!==1;this.solid.value=solid;Object.assign(this.walls[this.walls.length-1].filter,{depthWrite:solid>CLEAR_RANGE.hides,polygonOffset:solid>CLEAR_RANGE.hides,polygonOffsetFactor:1,polygonOffsetUnits:1});this.density.value=this.exponent*(2/this.drawn)*share;this.look.value.set(Math.pow(1-solid,2/this.drawn),(1-solid)*(1-solid),CLEAR.scatter*haze+(1-CLEAR.scatter)*solid,share*(1-solid));},
  // The plastic: colour (the tint), the finish's roughness and clear coat, and the exponent per wall the colour is read
  // with (`exponent`: CLEAR.density for a picked colour, CLEAR.trueDensity for the plastic's true colour), and its opacity.
  paint(color,plastic={},{exponent=CLEAR.density,opacity=null}={}){this.exponent=exponent;this.opacity=opacity;this.apply();for(const m of this.materials){m.color.set(color);Object.assign(m,plastic);m.needsUpdate=true;}},
  dispose(){for(const m of this.materials)m.dispose();}};
}
// The backdrop pass: the page's colour, only where nothing is drawn yet.
export function clearBackdrop(color='#ffffff'){
 return new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true,depthWrite:false,toneMapped:false,
  blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.OneMinusDstAlphaFactor,blendDst:THREE.OneFactor,
  blendSrcAlpha:THREE.OneMinusDstAlphaFactor,blendDstAlpha:THREE.OneFactor});
}
// The page colour behind `element`: the first colour of its own background (the viewer's stage gradient starts with
// it), else the nearest ancestor's opaque background colour.
export function pageColor(element){
 for(let node=element;node&&node.nodeType===1;node=node.parentElement){
  const style=getComputedStyle(node),image=/rgba?\(([^)]+)\)/.exec(style.backgroundImage||'');
  if(node===element&&image){const c=image[1].split(/[ ,/]+/).map(Number);if(c.length<4||c[3]>.5)return rgb(c);}
  const m=/rgba?\(([^)]+)\)/.exec(style.backgroundColor||'');
  if(m){const c=m[1].split(/[ ,/]+/).map(Number);if(c.length<4||c[3]>.5)return rgb(c);}
 }
 return '#ffffff';
}
const rgb=c=>'#'+c.slice(0,3).map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
// The draw order of one clear disc's passes, and of its print (stamp or photo) on the top surface: seen from above the
// print lies over both walls; from below it is drawn first, under both, so the plastic tints it as it does through a
// real clear disc.
export const CLEAR_ORDER={backdrop:1,printBelow:1.5,back:2,front:5,printAbove:7};
// The meshes that draw `part` (and the backdrop) on `geometry`, with their draw order. `groups`: a mesh with material
// groups (an overmold or a band) takes an array per pass: `partsFor(wallIndex, kind)` returns it.
export function clearMeshes(geometry,backdrop,part,{partsFor=null}={}){
 const meshes=[new THREE.Mesh(geometry,backdrop)];meshes[0].renderOrder=CLEAR_ORDER.backdrop;meshes[0].name='clear-backdrop';
 part.walls.forEach((wall,i)=>{
  const order=part.walls.length===2&&i===0?CLEAR_ORDER.back:CLEAR_ORDER.front;
  for(const kind of ['filter','shine']){
   const mesh=new THREE.Mesh(geometry,partsFor?partsFor(i,kind):wall[kind]);
   mesh.renderOrder=order+(kind==='shine'?.5:0);mesh.name='clear-'+(order===CLEAR_ORDER.back?'back':'front')+'-'+kind;meshes.push(mesh);
  }
 });
 return meshes;
}

// A clear disc on a scene's own disc mesh (the bag, the racks): `mesh` keeps its opaque materials for everything else
// that reads them (a hover glow, a photo's plastic) but its plate is hidden, and the passes draw as its children on the
// geometry it wears. `plate` (and `band`, a Halo copy's) are clearParts with two walls; `overmold`: the rim piece stays
// the mesh's own opaque material. walls(n) shows the back wall (2) or not (1, small renders); sync() follows a geometry
// the mesh changed to. `page` is the plate's shared page uniform.
export function clearRig(mesh,{plate,band=null,overmold=false}){
 const backdrop=clearBackdrop(),none=new THREE.MeshBasicMaterial({visible:false});
 const meshes=clearMeshes(mesh.geometry,backdrop,plate,{partsFor:(i,kind)=>overmold||band?[plate.walls[i][kind],overmold?none:band.walls[i][kind]]:plate.walls[i][kind]});
 for(const m of meshes){m.matrixAutoUpdate=false;m.raycast=()=>{};mesh.add(m);}
 const hide=()=>{const list=[mesh.material].flat();list[0].visible=false;if(band)list[1].visible=false;};
 hide();
 const rig={meshes,backdrop,materials:[...plate.materials,...band?.materials??[]],
  sync(){hide();for(const m of meshes)m.geometry=mesh.geometry;},
  walls(n){meshes.forEach(m=>{if(/^clear-back-/.test(m.name))m.visible=n===2;});for(const part of [plate,band])if(part){part.drawn=n;part.apply();}},
  page(color){backdrop.color.set(color);plate.page.value.copy(backdrop.color);if(band)band.page.value.copy(backdrop.color);},
  dispose(){for(const m of meshes)mesh.remove(m);plate.dispose();band?.dispose();backdrop.dispose();none.dispose();}};
 rig.walls(1);
 return rig;
}
