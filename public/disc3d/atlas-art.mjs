// The atlas's discs as their 3D models, seen from straight above like discs lying on the ground (Plan 16).
// Each disc is its own mold's model (shape.mjs from its PDGA dimensions, overmolds in two colours), drawn
// by one offscreen three.js renderer with an orthographic camera looking down, and kept as a small image.
// The atlas then draws those images where the 2D orbs were: the curated discs' DOM art and the canvas's
// small discs and minis. Seen from above, with the light fixed and the disc never turning, a live mesh would
// redraw the same pixels every frame; a cached render costs a pan or a zoom nothing, on any phone.
//
// Performance:
// - One geometry per shape and level of detail, shared by every disc and colour that uses it (molds are
//   radially symmetric, so a shape is all a geometry needs).
// - Levels of detail by size on screen, which at 1x is by tier: curated discs (76 px and up) get the full
//   model, small discs (about 51 px) half the segments and profile points, minis (12 px) a coarse one. Each
//   level also renders at its own resolution. A disc that grows past its level is drawn again at the next.
// - Only discs the atlas is about to draw are rendered (it asks for what is on screen), within a per-frame
//   time budget, and idle time draws the next zoom level's discs ahead.
// - Images live in a byte-capped LRU, geometries in a count-capped one.
//
// createAtlasArt({dpr, maxBytes}) returns {get(d, color, size, rim, lod), render(...), has(...), lodFor(size, prev, hold),
// stats, dispose()}. `size` is the disc's diameter on screen in CSS px; `lod` (default lodFor(size)) is the level
// to draw it at, for a caller that keeps a disc's level steady across a zoom (lod.mjs); an entry is
// {canvas, fill, lod}, where `fill` is the share of the image the disc's diameter spans (a pixel of room
// is kept at each edge for antialiasing).
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {shapeForDisc,normalizeShape} from './shape.mjs';
import {isOvermold,overmoldColors} from './overmold.mjs';
import {PLASTICS,discGeometry} from './mesh.mjs';
import {photoSurface} from './photo.mjs';
import {LODS,ORDER,lodFor} from './lod.mjs';
// Levels of detail by size on screen (lod.mjs): the thresholds, and the hysteresis a moving camera needs.
export {LODS,lodFor};

export function discShapeProps(d){
 return {model:d.model3d||null,specs:d.specs||null,flight:{speed:d.speed,turn:d.turn,fade:d.fade}};
}

// Setting up takes a few long tasks (the WebGL context, the environment map, the shaders), so it yields
// between them and compiles the shaders in parallel (compileAsync). Rejects where WebGL is unavailable or
// only in software (failIfMajorPerformanceCaveat, and the renderer's name: SwiftShader takes about 50 ms a disc, which would stall
// a zoom); the atlas then keeps its 2D orbs. Every phone GPU qualifies.
const yieldTask=()=>new Promise(resolve=>setTimeout(resolve,0));
export async function createAtlasArt({dpr=Math.min(devicePixelRatio||1,2),maxBytes=48e6,maxGeometries=400}={}){
 const side=Math.ceil(LODS.full.css*dpr);
 const canvas=document.createElement('canvas');
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power',failIfMajorPerformanceCaveat:true});
 // Not every browser reports software rendering as a caveat (headless Chromium's SwiftShader doesn't).
 const gl=renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info');
 const name=String(gl.getParameter(info?info.UNMASKED_RENDERER_WEBGL:gl.RENDERER));
 if(/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name)){renderer.dispose();throw new Error('Software WebGL ('+name+')');}
 renderer.setPixelRatio(1);renderer.setSize(side,side,false);
 renderer.toneMapping=THREE.NeutralToneMapping;renderer.setClearColor(0x000000,0);
 const scene=new THREE.Scene();
 await yieldTask();
 const pmrem=new THREE.PMREMGenerator(renderer);
 const envTexture=pmrem.fromScene(new RoomEnvironment(),.04,.1,100,{size:64}).texture;pmrem.dispose();
 // Little environment: the glossy top reflects it as white, which washes the palette colour out.
 scene.environment=envTexture;scene.environmentIntensity=.12;
 // Screen up is −z (the camera's up), screen left −x: the key light comes from the upper left, as the 2D
 // orbs' highlight did, low (35°) so the shoulder facing it catches a highlight arc. Tuned so the flight
 // plate draws at about its palette colour (tests/atlas-3d-browser.mjs measures it).
 const key=new THREE.DirectionalLight(0xffffff,2.6);key.position.set(-6,5,-7);scene.add(key);
 const fill=new THREE.DirectionalLight(0xffffff,.25);fill.position.set(6,8,7);scene.add(fill);
 scene.add(new THREE.HemisphereLight(0xffffff,0x8090a0,.4));
 const camera=new THREE.OrthographicCamera(-11,11,11,-11,.1,100);
 camera.position.set(0,50,0);camera.up.set(0,0,-1);camera.lookAt(0,0,0);
 // From straight above, the shoulder is only a narrow band of slope. Slopes are darkened by how far they
 // turn from the viewer (its view-space normal's z), so the rim reads as a ring all the way round while the
 // flight plate, facing the camera, keeps the disc's own colour. It adds no specular, unlike a light would.
 const slope={value:.85},slopePower={value:2.5};
 const shadeSlopes=shader=>{
  shader.uniforms.slopeShade=slope;shader.uniforms.slopePower=slopePower;
  shader.fragmentShader='uniform float slopeShade;\nuniform float slopePower;\n'+shader.fragmentShader.replace('#include <opaque_fragment>',
   'outgoingLight*=mix(1.0,pow(clamp(normal.z,0.0,1.0),slopePower),slopeShade);\n#include <opaque_fragment>');
 };
 const material=color=>{const m=new THREE.MeshPhysicalMaterial({color,...PLASTICS.premium});m.onBeforeCompile=shadeSlopes;m.customProgramCacheKey=()=>'atlas-slope';return m;};
 const plateMaterial=material(0x888888),rimMaterial=material(0x444444);
 const mesh=new THREE.Mesh(new THREE.BufferGeometry(),plateMaterial);scene.add(mesh);

 const shapes=new Map(),geometries=new Map(),images=new Map(),photos=new Map();
 // Decoded photos stay live for a few discs (least recently drawn first out), so a disc changing level
 // draws its photo at once instead of fetching and decoding it again for every level.
 const PHOTOS_LIVE=8;
 const photoOf=(d,s)=>{
  if(!d.photoURL)return null;
  let photo=photos.get(d.photoURL);
  if(photo){photos.delete(d.photoURL);photos.set(d.photoURL,photo);return photo;}
  photo=photoSurface(s.shape,d.photoURL,{overmold:s.overmold,edge:true,size:256,like:plateMaterial,onChange:()=>window.dispatchEvent(new CustomEvent('atlas-photo-ready',{detail:{url:d.photoURL}}))});photos.set(d.photoURL,photo);
  // A photo still loading is never evicted: with more photos on screen than live slots, evicting them
  // would restart every load forever.
  for(const [url,old] of photos){if(photos.size<=PHOTOS_LIVE)break;if(old.userData.photoReady||old.userData.photoFailed){photos.delete(url);old.userData.disposePhoto();}}
  return photo;
 };
 const clearPhotos=()=>{for(const [key,entry] of images)if(key.includes('/photo?')){entry.canvas.getContext('2d').clearRect(0,0,entry.px,entry.px);stats.bytes-=entry.bytes;images.delete(key);}for(const p of photos.values())p.userData.disposePhoto();photos.clear();};
 window.addEventListener('atlas-photo-clear',clearPhotos);
 const stats={renders:0,ms:0,bytes:0,geometries:0,shapes:0,evicted:0};
 // A disc's shape, its key and whether it is an overmold: computed once per disc.
 function shapeOf(d){
  let s=shapes.get(d.id);if(s!==undefined)return s;
  const resolved=shapeForDisc(discShapeProps(d));
  s=resolved?{shape:resolved.shape,key:JSON.stringify(resolved.shape),
   overmold:isOvermold({overmold:typeof d.overmold==='boolean'?d.overmold:undefined,manufacturer:d.manufacturer,record:d.name})}:null;
  shapes.set(d.id,s);stats.shapes=shapes.size;return s;
 }
 function geometryOf(s,lod){
  const key=s.key+'|'+lod+'|'+s.overmold;
  let g=geometries.get(key);
  if(g){geometries.delete(key);geometries.set(key,g);return g;}
  const L=LODS[lod];g=discGeometry(s.shape,{segments:L.segments,detail:L.detail,overmold:s.overmold}).geometry;
  geometries.set(key,g);
  while(geometries.size>maxGeometries){const [k,old]=geometries.entries().next().value;geometries.delete(k);if(old!==mesh.geometry)old.dispose();}
  stats.geometries=geometries.size;return g;
 }
 // Resolve the theme default before every cache lookup so a theme switch cannot reuse the old rim.
 const colorsOf=(s,color,rim)=>s.overmold?overmoldColors(color,{rim:rim||(document.documentElement.dataset.theme==='light'?undefined:'#ffffff')}):{plate:color,rim:''};
 const keyOf=(d,lod,c)=>d.id+'|'+lod+'|'+c.plate+'|'+c.rim+'|'+(d.photoURL||'');
 function touch(key){const e=images.get(key);if(e){images.delete(key);images.set(key,e);}return e||null;}

 // The cached image at the level `size` needs, else the best other level already drawn (a disc growing
 // past its level shows the smaller image, scaled, until the next is drawn). Null when nothing is cached.
 // A photo disc's finished image at any level beats its placeholder (drawn while the photo loads).
 function get(d,color,size,rim,lod=lodFor(size)){
  const s=shapeOf(d);if(!s)return null;
  const c=colorsOf(s,color,rim),want=lod,order=[want,...ORDER.slice(ORDER.indexOf(want)+1),...ORDER.slice(0,ORDER.indexOf(want)).reverse()];
  for(const level of order){const e=touch(keyOf(d,level,c));if(e)return e;}
  if(d.photoURL)for(const level of order){const e=touch(keyOf(d,level,c)+'|pending');if(e)return e;}
  return null;
 }
 function has(d,color,size,rim,lod=lodFor(size)){
  const s=shapeOf(d);if(!s)return true;
  return images.has(keyOf(d,lod,colorsOf(s,color,rim)));
 }
 // Draws the disc at the level `size` needs (or returns it from the cache). Null for a disc without a model.
 function render(d,color,size,rim,lod=lodFor(size)){
  const s=shapeOf(d);if(!s)return null;
  const c=colorsOf(s,color,rim),finalKey=keyOf(d,lod,c),done=touch(finalKey);if(done)return done;
  const photo=photoOf(d,s),ready=!photo||photo.userData.photoReady,key=finalKey+(ready?'':'|pending');
  const cached=touch(key);if(cached)return cached;
  const start=performance.now(),px=Math.max(8,Math.ceil(LODS[lod].css*dpr));
  mesh.geometry=geometryOf(s,lod);mesh.material=s.overmold?[plateMaterial,rimMaterial]:plateMaterial;
  plateMaterial.color.set(c.plate);if(s.overmold)rimMaterial.color.set(c.rim);
  // The disc's own diameter spans the image, less a pixel at each edge.
  const half=s.shape.diameter/2*px/(px-2);
  camera.left=-half;camera.right=half;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();
  if(photo?.userData.photoReady)scene.add(photo);
  renderer.setViewport(0,0,px,px);renderer.render(scene,camera);
  if(photo)scene.remove(photo);
  const image=document.createElement('canvas');image.width=image.height=px;
  // The viewport is the drawing buffer's bottom-left corner.
  image.getContext('2d').drawImage(canvas,0,side-px,px,px,0,0,px,px);
  const entry={canvas:image,fill:(px-2)/px,lod,px,bytes:px*px*4,pending:!ready};
  images.set(key,entry);stats.bytes+=entry.bytes;
  // The finished image replaces its placeholder.
  const placeholder=photo&&ready&&images.get(finalKey+'|pending');
  if(placeholder){images.delete(finalKey+'|pending');stats.bytes-=placeholder.bytes;}
  while(stats.bytes>maxBytes&&images.size>1){const [k,old]=images.entries().next().value;images.delete(k);stats.bytes-=old.bytes;stats.evicted++;}
  stats.renders++;stats.ms+=performance.now()-start;
  return entry;
 }
 // Compile both material set-ups and draw once with each (a browser links a program on its first draw),
 // so the first disc on the map doesn't pay for it. The first full-size image is also the first canvas big
 // enough for the browser to put on the GPU, which takes a moment to set up.
 await yieldTask();
 const {geometry:warmGeometry}=discGeometry(normalizeShape({}),{segments:8,detail:.3,overmold:true});mesh.geometry=warmGeometry;
 for(const m of [plateMaterial,[plateMaterial,rimMaterial]]){mesh.material=m;await renderer.compileAsync(scene,camera);renderer.setViewport(0,0,8,8);renderer.render(scene,camera);}
 warmGeometry.dispose();mesh.geometry=new THREE.BufferGeometry();mesh.material=plateMaterial;
 const probe=document.createElement('canvas');probe.width=probe.height=side;probe.getContext('2d').drawImage(canvas,0,0);
 function dispose(){
  window.removeEventListener('atlas-photo-clear',clearPhotos);clearPhotos();
  for(const g of geometries.values())g.dispose();geometries.clear();images.clear();
  plateMaterial.dispose();rimMaterial.dispose();envTexture.dispose();renderer.dispose();
 }
 return {get,has,render,lodFor,stats,dispose,dpr,
  // For tests and tuning.
  debug:{renderer,scene,camera,key,fill,slope,slopePower,plateMaterial,rimMaterial,shapeOf,images,geometries}};
}

// Atlas and lists share one offscreen context, geometry pool and color-aware image cache.
let sharedArt;
export function getAtlasArt(){
 return sharedArt??=createAtlasArt({maxBytes:matchMedia('(pointer: coarse)').matches?24e6:64e6});
}
