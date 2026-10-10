// Shared plumbing for My Bag's Storage racks and Lost graveyard. One WebGL renderer serves both scenes
// (only one tab shows at a time), so phones never hold an extra context; each scene keeps its own camera
// and draws only when something moves. Gestures match the 3D bag: drag sideways to turn, a plain scroll
// or vertical swipe keeps scrolling the page, pinch or Ctrl/⌘ + scroll zooms, and a zoomed view drags to pan.
//
// Discs are the detail viewer's own per-mold lathe (disc3d/shape.mjs: PDGA dimensions, overmold rims),
// at a smaller budget: a rack disc spans a few dozen pixels, not the whole panel.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {shapeForDisc,normalizeShape,discProfile,overmoldProfile} from '../disc3d/shape.mjs';
import {isOvermold,overmoldColors} from '../disc3d/overmold.mjs';
import {stampTexture,stampGeometry,stampMaterial} from '../disc3d/stamp.mjs';

export const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const coarse=()=>matchMedia('(pointer: coarse)').matches;

// The detail viewer turns a disc on 56 (touch) or 80 radial segments at about 70 profile points. A rack
// disc is a fraction of that on screen, so it gets a fraction of the budget: ~1.1k triangles on touch.
export const DISC_BUDGET={radial:{fine:40,coarse:28,low:20},detail:{fine:.5,coarse:.4,low:.3}};
// The bag caps its canvas at 2.4 MP; these scenes share that ceiling.
const MAX_PIXELS=2.4e6;

// Software WebGL (SwiftShader, llvmpipe) is CPU-bound: drop multisampling, shadows and resolution there.
function softwareRenderer(){
 try{
  const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl2')||canvas.getContext('webgl');
  if(!gl)return false;
  const info=gl.getExtension('WEBGL_debug_renderer_info');
  const name=String(gl.getParameter(info?info.UNMASKED_RENDERER_WEBGL:gl.RENDERER));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
 }catch{return false;}
}

let shared=null;
function stage(){
 if(shared)return shared;
 const low=softwareRenderer();
 // Throws where WebGL is unavailable; the scene glue then shows its fallback.
 const renderer=new THREE.WebGLRenderer({antialias:!low,alpha:true,powerPreference:'low-power'});
 renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 // Neutral keeps disc colours true to their hex, like the bag and the detail viewer.
 renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=.82;
 renderer.shadowMap.enabled=!low;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 // Shadows are redrawn only when something in a scene moves, not on every camera turn.
 renderer.shadowMap.autoUpdate=false;
 const pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();
 const canvas=renderer.domElement;canvas.className='collection-3d-canvas';
 canvas.style.cssText='display:block;width:100%;height:100%';
 shared={renderer,env,low,quality:low?'low':coarse()?'coarse':'fine',view:null,frame:0};
 return shared;
}

// A circular contact shadow, drawn once and shared.
let shadowTexture=null;
export function contactShadow(width,depth,opacity=1){
 if(!shadowTexture){
  const c=document.createElement('canvas');c.width=c.height=128;
  const g=c.getContext('2d'),grad=g.createRadialGradient(64,64,8,64,64,64);
  grad.addColorStop(0,'rgba(30,28,24,.32)');grad.addColorStop(.5,'rgba(30,28,24,.16)');grad.addColorStop(1,'rgba(30,28,24,0)');
  g.fillStyle=grad;g.fillRect(0,0,128,128);shadowTexture=new THREE.CanvasTexture(c);
 }
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity}));
 mesh.rotation.x=-Math.PI/2;mesh.position.y=-.001;mesh.renderOrder=-1;mesh.userData.keepTexture=true;
 return mesh;
}

// --- Discs -------------------------------------------------------------------------------------------
// Canonical disc parts: centred on the origin, metres, flight plate up (+Y). Cached per shape, so a
// rack of 72 Destroyers builds one geometry. Overmold discs come as two geometries (plate, rim) that
// share the lathe's vertices, so each can carry its own colour per instance.
const parts=new Map();
export function discParts(d,quality=stage().quality){
 const flight={speed:d?.speed,turn:d?.turn,fade:d?.fade};
 const resolved=shapeForDisc({model:d?.model3d||null,specs:d?.specs||null,flight});
 const shape=resolved?.shape||normalizeShape({});
 const overmold=!!d&&isOvermold({manufacturer:d.manufacturer,record:d.name,overmold:typeof d.overmold==='boolean'?d.overmold:undefined});
 const key=JSON.stringify([shape,overmold,quality]);
 if(parts.has(key))return parts.get(key);
 const radial=DISC_BUDGET.radial[quality],detail=DISC_BUDGET.detail[quality];
 const split=overmold?overmoldProfile(shape,{detail}):null;
 const points=(split?split.points:discProfile(shape,{detail})).map(p=>new THREE.Vector2(p.x,p.y));
 const lathe=new THREE.LatheGeometry(points,radial);
 lathe.computeBoundingBox();
 const centre=(lathe.boundingBox.min.y+lathe.boundingBox.max.y)/2,thickness=(lathe.boundingBox.max.y-lathe.boundingBox.min.y)/100;
 lathe.translate(0,-centre,0);lathe.scale(.01,.01,.01);
 let plate=lathe,rim=null;
 if(split){
  // LatheGeometry writes six indices per (segment, profile edge), edges varying fastest (as viewer.mjs).
  const index=lathe.index.array,edges=points.length-1,[from,to]=split.rim,plateIdx=[],rimIdx=[];
  for(let k=0;k<index.length;k+=6){const e=(k/6)%edges,out=e>=from&&e<to?rimIdx:plateIdx;for(let i=k;i<k+6;i++)out.push(index[i]);}
  const share=g=>{for(const name of ['position','normal','uv'])g.setAttribute(name,lathe.attributes[name]);return g;};
  plate=share(new THREE.BufferGeometry());plate.setIndex(plateIdx);
  rim=share(new THREE.BufferGeometry());rim.setIndex(rimIdx);
 }
 for(const g of [plate,rim])if(g){g.computeBoundingSphere();g.computeBoundingBox();}
 const entry={key,shape,overmold,plate,rim,radius:shape.diameter/200,thickness,centre};
 parts.set(key,entry);return entry;
}
// Plate and rim colours for one copy: the bag's own colour, and its rim colour on overmold molds.
export function discColors(entry,color,rimColor){
 const base=color||'#e6c668';
 return entry.overmold?overmoldColors(base,{rim:rimColor||undefined}):{plate:base,rim:base};
}
// The bag's premium finish (disc3d PLASTICS.premium); software rendering skips the clear coat.
export function discMaterial(color='#ffffff'){
 return stage().low?new THREE.MeshStandardMaterial({color,roughness:.38}):new THREE.MeshPhysicalMaterial({color,roughness:.3,clearcoat:.6,clearcoatRoughness:.22});
}
// One disc as ordinary meshes, with its generic name stamp: the pulled-out rack disc and graveyard discs.
export function discModel(d,{color,rimColor,name,stamp=true}={}){
 const entry=discParts(d),colors=discColors(entry,color,rimColor),group=new THREE.Group();
 const plate=new THREE.Mesh(entry.plate,discMaterial(colors.plate));group.add(plate);
 if(entry.rim)group.add(new THREE.Mesh(entry.rim,discMaterial(colors.rim)));
 if(stamp){
  const ring=stampGeometry(entry.shape,{segments:32,rings:5});ring.translate(0,-entry.centre,0);ring.scale(.01,.01,.01);
  const material=stampMaterial();material.map=stampTexture(name||d?.catalogName||d?.name||'',colors.plate);
  group.add(new THREE.Mesh(ring,material));
 }
 group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 group.userData.parts=entry;
 return group;
}

// Free GPU memory a scene owns. Shared disc geometries (the parts cache) and the shadow texture stay.
export function disposeObject(root){
 const shareable=new Set();for(const e of parts.values()){shareable.add(e.plate);if(e.rim)shareable.add(e.rim);}
 root.traverse(o=>{
  if(o.geometry&&!shareable.has(o.geometry)&&!o.userData.sharedGeometry)o.geometry.dispose();
  for(const m of [o.material].flat().filter(Boolean)){if(m.map&&!o.userData.keepTexture&&!m.userData?.sharedMaps)m.map.dispose();if(!m.userData?.shared)m.dispose();}
 });
}

// --- One scene, drawn through the shared renderer ------------------------------------------------------
export class SceneView{
 constructor(host,{label,yaw=0,pitch=.2,yawLimit=.9,maxZoom=3,onTap,onHover,onCamera}={}){
  const s=stage();this.stage=s;this.host=host;this.low=s.low;
  this.scene=new THREE.Scene();this.scene.environment=s.env;this.scene.environmentIntensity=.75;
  this.camera=new THREE.PerspectiveCamera(30,1,.05,60);
  this.label=label;this.onTap=onTap;this.onHover=onHover;this.onCamera=onCamera;
  // Camera rig: yaw/pitch about the target; distance is the fitted distance divided by the zoom.
  this.rig={yaw,pitch,yawLimit,zoom:1,maxZoom,target:new THREE.Vector3(),pan:new THREE.Vector3(),fit:4,box:new THREE.Box3(new THREE.Vector3(-.5,0,-.5),new THREE.Vector3(.5,1,.5)),tween:null};
  this.size={w:0,h:0};this.ticks=new Set();this.disposed=false;this.shadowsDirty=true;
  this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);
  this.bindInput();
 }
 // The canvas moves into this scene's host; the other scene simply stops drawing.
 show(){
  const s=this.stage;s.view=this;
  const canvas=s.renderer.domElement;if(canvas.parentNode!==this.host)this.host.prepend(canvas);
  canvas.setAttribute('role','img');canvas.setAttribute('aria-label',this.label);
  this.size={w:0,h:0};this.resize();this.shadowsDirty=true;this.request();
 }
 hide(){if(this.stage.view===this)this.stage.view=null;}
 get shown(){return this.stage.view===this;}
 resize(){
  if(!this.shown)return;
  const r=this.host.getBoundingClientRect(),w=Math.round(r.width),h=Math.round(r.height);
  if(!w||!h||(w===this.size.w&&h===this.size.h))return;
  this.size={w,h};
  const renderer=this.stage.renderer;
  const ratio=Math.min(devicePixelRatio||1,this.low?1:coarse()?1.75:2,Math.sqrt(MAX_PIXELS/(w*h)));
  renderer.setPixelRatio(ratio);renderer.setSize(w,h,false);
  this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
  this.refit();this.resized?.();this.request();
 }
 // Frame a box (world space): the camera backs off until all eight corners fit the canvas.
 frame(box,{instant=reduced()}={}){
  const r=this.rig,from={target:r.target.clone().add(r.pan),fit:r.fit,zoom:r.zoom};
  r.box.copy(box);r.pan.set(0,0,0);r.zoom=1;r.target.copy(box.getCenter(new THREE.Vector3()));
  r.fit=this.fitDistance();
  if(instant||!this.size.w){r.tween=null;}else r.tween={from,start:performance.now(),ms:650};
  this.syncZoom();this.request();
 }
 refit(){this.rig.fit=this.fitDistance();this.clampPan();}
 fitDistance(margin=.9){
  const r=this.rig,probe=new THREE.PerspectiveCamera(this.camera.fov,this.camera.aspect||1,.01,100),ndc=new THREE.Vector3();
  const corners=[];for(const x of [r.box.min.x,r.box.max.x])for(const y of [r.box.min.y,r.box.max.y])for(const z of [r.box.min.z,r.box.max.z])corners.push(new THREE.Vector3(x,y,z));
  const centre=r.box.getCenter(new THREE.Vector3());
  const fits=d=>{this.place(probe,centre,d);probe.updateMatrixWorld();probe.updateProjectionMatrix();return corners.every(p=>{ndc.copy(p).project(probe);return Math.abs(ndc.x)<=margin&&Math.abs(ndc.y)<=margin&&ndc.z<1;});};
  let lo=.2,hi=60;for(let i=0;i<28;i++){const mid=(lo+hi)/2;if(fits(mid))hi=mid;else lo=mid;}
  return hi;
 }
 place(camera,target,distance){
  const {yaw,pitch}=this.rig;
  camera.position.set(target.x+Math.sin(yaw)*Math.cos(pitch)*distance,target.y+Math.sin(pitch)*distance,target.z+Math.cos(yaw)*Math.cos(pitch)*distance);
  camera.lookAt(target);
 }
 applyCamera(now){
  const r=this.rig;let target=r.target.clone().add(r.pan),distance=r.fit/r.zoom,more=false;
  if(r.tween){
   const t=Math.min(1,(now-r.tween.start)/r.tween.ms),e=ease(t);
   target=r.tween.from.target.clone().lerp(target,e);distance=THREE.MathUtils.lerp(r.tween.from.fit/r.tween.from.zoom,distance,e);
   if(t<1)more=true;else r.tween=null;
  }
  this.place(this.camera,target,distance);
  return more;
 }
 // Keep a zoomed view's pan within the framed box, and back to centre at 1×.
 clampPan(){
  const r=this.rig,size=r.box.getSize(new THREE.Vector3()),k=1-1/r.zoom;
  r.pan.x=clamp(r.pan.x,-size.x/2*k,size.x/2*k);r.pan.y=clamp(r.pan.y,-size.y/2*k,size.y/2*k);r.pan.z=clamp(r.pan.z,-size.z/2*k,size.z/2*k);
 }
 // Zoom about a canvas point (CSS px), or the centre: the world point under it stays put.
 setZoom(value,{anchor=null}={}){
  const r=this.rig,next=clamp(value,1,r.maxZoom);if(next===r.zoom)return;
  const before=anchor&&this.planePoint(anchor);
  r.zoom=next;r.tween=null;this.applyCamera(performance.now());this.camera.updateMatrixWorld();
  if(before){const after=this.planePoint(anchor);if(after)r.pan.add(before.sub(after));}
  if(next===1)r.pan.set(0,0,0);
  this.clampPan();this.syncZoom();this.request();
 }
 get zoom(){return this.rig.zoom;}
 syncZoom(){
  this.host.dataset.zoomed=String(this.rig.zoom>1.001);
  // At 1× a vertical swipe scrolls the page; zoomed in, every drag pans the view.
  this.stage.renderer.domElement.style.touchAction=this.rig.zoom>1.001?'none':'pan-y';
  this.onZoom?.(this.rig.zoom);
 }
 // The point under a canvas position on the plane through the target, facing the camera.
 planePoint({x,y}){
  const ndc=new THREE.Vector2(x/this.size.w*2-1,-(y/this.size.h)*2+1),ray=new THREE.Raycaster();ray.setFromCamera(ndc,this.camera);
  const normal=this.camera.getWorldDirection(new THREE.Vector3()),plane=new THREE.Plane().setFromNormalAndCoplanarPoint(normal,this.rig.target.clone().add(this.rig.pan));
  return ray.ray.intersectPlane(plane,new THREE.Vector3());
 }
 // Objects under a canvas position (CSS px), nearest first.
 pick({x,y},objects){
  const ndc=new THREE.Vector2(x/this.size.w*2-1,-(y/this.size.h)*2+1),ray=new THREE.Raycaster();ray.setFromCamera(ndc,this.camera);
  return ray.intersectObjects(objects,true).filter(h=>{for(let o=h.object;o;o=o.parent)if(!o.visible)return false;return true;});
 }
 // A world point in canvas CSS px.
 project(point){
  const v=point.clone().project(this.camera);
  return {x:(v.x+1)/2*this.size.w,y:(1-v.y)/2*this.size.h,visible:v.z<1&&Math.abs(v.x)<=1.05&&Math.abs(v.y)<=1.05};
 }
 bindInput(){
  const s=this.stage,canvasOf=()=>s.renderer.domElement;
  let press=null;const touches=new Map();let pinch=null;
  const local=e=>{const b=this.host.getBoundingClientRect();return {x:e.clientX-b.left,y:e.clientY-b.top};};
  this.host.addEventListener('pointerdown',e=>{
   if(e.target!==canvasOf()||e.button>0)return;
   touches.set(e.pointerId,local(e));
   if(touches.size===2){const [a,b]=[...touches.values()];pinch={d:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),zoom:this.rig.zoom};press=null;return;}
   press={id:e.pointerId,start:local(e),last:local(e),moved:false,type:e.pointerType,yaw:this.rig.yaw};
   this.rig.tween=null;
  });
  this.host.addEventListener('pointermove',e=>{
   const p=local(e);
   if(touches.has(e.pointerId))touches.set(e.pointerId,p);
   if(pinch&&touches.size>=2){const [a,b]=[...touches.values()];this.setZoom(pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d,{anchor:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}});return;}
   if(!press||press.id!==e.pointerId){if(e.pointerType==='mouse'&&e.target===canvasOf())this.onHover?.(p);return;}
   const dx=p.x-press.start.x,dy=p.y-press.start.y;
   if(!press.moved&&Math.hypot(dx,dy)<8)return;
   if(!press.moved){press.moved=true;canvasOf().setPointerCapture?.(e.pointerId);this.host.dataset.dragging='';this.onHover?.(null);}
   if(this.rig.zoom>1.001){
    // Zoomed in: the view follows the finger.
    const before=this.planePoint(press.last),after=this.planePoint(p);if(before&&after)this.rig.pan.add(before.sub(after));this.clampPan();
   }else{
    const r=this.rig;r.yaw=clamp(press.yaw-dx/Math.max(240,this.size.w)*2.2,-r.yawLimit,r.yawLimit);this.refit();
   }
   press.last=p;this.request();this.onCamera?.();
  });
  const end=e=>{
   touches.delete(e.pointerId);if(touches.size<2)pinch=null;
   if(!press||press.id!==e.pointerId)return;
   const tap=!press.moved&&e.type==='pointerup';const p=local(e),type=press.type;press=null;delete this.host.dataset.dragging;
   if(tap)this.onTap?.(p,type);
  };
  for(const type of ['pointerup','pointercancel'])this.host.addEventListener(type,end);
  this.host.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')this.onHover?.(null);});
  this.host.addEventListener('wheel',e=>{
   if(!(e.ctrlKey||e.metaKey)||e.target!==canvasOf())return;e.preventDefault();
   const delta=Math.max(-100,Math.min(100,e.deltaY*(e.deltaMode===1?16:1)));this.setZoom(this.rig.zoom*Math.exp(-delta*.01),{anchor:local(e)});
  },{passive:false});
 }
 // Draw on the next frame; scenes keep drawing while a tick reports motion.
 request(){
  const s=this.stage;if(this.disposed||!this.shown||s.frame)return;
  s.frame=requestAnimationFrame(now=>{
   s.frame=0;if(!this.shown||this.disposed||!this.size.w)return;
   let more=this.applyCamera(now);
   for(const tick of this.ticks)if(tick(now))more=true;
   if(more)this.shadowsDirty=true;
   if(this.shadowsDirty&&s.renderer.shadowMap.enabled){s.renderer.shadowMap.needsUpdate=true;this.shadowsDirty=false;}
   s.renderer.render(this.scene,this.camera);this.frames=(this.frames||0)+1;
   this.onCamera?.();
   if(more)this.request();
  });
 }
 // Instant camera turn (keyboard), within the yaw limit.
 turnBy(rad){const r=this.rig;r.yaw=clamp(r.yaw+rad,-r.yawLimit,r.yawLimit);this.refit();this.request();}
 // A lit stage: hemisphere, a shadow-casting key and a cool fill, aimed at the framed box.
 light({keyShadow=1024}={}){
  this.scene.add(new THREE.HemisphereLight(0xfff9eb,0x68737a,1.1));
  const key=new THREE.DirectionalLight(0xfff6e4,2.4);key.position.set(-2.3,3.8,3.5);
  if(!this.low){key.castShadow=true;key.shadow.mapSize.set(keyShadow,keyShadow);key.shadow.normalBias=.002;key.shadow.bias=-.0002;key.shadow.radius=3;}
  this.scene.add(key,key.target);
  const fill=new THREE.DirectionalLight(0xe6efff,.9);fill.position.set(2,1.8,-2);this.scene.add(fill);
  this.key=key;return key;
 }
 // Fit the key light's shadow camera around a box.
 aimShadow(box){
  if(!this.key?.castShadow)return;
  const c=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),r=Math.max(size.x,size.y,size.z)*.75+.2;
  this.key.target.position.copy(c);this.key.position.copy(c).add(new THREE.Vector3(-2.3,3.8,3.5));
  Object.assign(this.key.shadow.camera,{left:-r,right:r,top:r,bottom:-r,near:.1,far:12});this.key.shadow.camera.updateProjectionMatrix();
  this.shadowsDirty=true;
 }
 dispose(){
  this.disposed=true;this.hide();this.observer.disconnect();
  disposeObject(this.scene);
 }
}
export {THREE};
