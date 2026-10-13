// Interactive 3D disc (Plan 09, phase 1): the procedural profile from shape.mjs spun by LatheGeometry,
// with drag to turn, scroll or pinch to zoom, preset views (3/4, top, profile, bottom), flip, and a
// hyzer/anhyzer tilt. One renderer is reused for every disc; it draws only when something moves.
//
// createDiscViewer() returns {element, attach(host), update(props), setView(name), flip(), setTilt(deg),
// setHand(hand), getPose(), applyPose(pose), glidePose(pose, ms), setClay(on), dispose()}. Options: {segments, onExpand, hint, onClay}. With `onExpand`
// the viewer offers a pop-out: an Enlarge button and a tap or click on the canvas call onExpand(trigger),
// where `trigger` is the element that was used (for returning focus). getPose/applyPose carry the camera,
// tilt and flip between two viewers (the pop-out starts where the panel's viewer is, and hands it back).
// Props: {model, specs, flight, mold, color, plastic, hand, manufacturer, record,
// overmold, colors}. `model` is explicit shape parameters (d.model3d); otherwise the mold's PDGA `specs` set
// its shape (phase 2), and without them the Phase 1 generic shape comes from `flight` {speed, turn, fade}.
// `mold` is the name set as a generic text stamp: never manufacturer artwork.
// Overmold discs (Plan 12) draw the rim and the flight plate in two materials, split at the measured rim
// width. `overmold` (boolean) is the record's own flag; without it the PDGA `manufacturer` and `record` name
// are looked up in overmold.mjs. `colors` {rim, plate} are optional overrides of the two colours; the
// plate defaults to `color`; the rim defaults to black in light theme, white in dark themes.
// Every other disc is one material, as before.
// Clay (Prompt 4) is a shape-only inspect view: the same mesh in matte studio clay on a dark ground, the stamp
// hidden, and the mold's cross-section drawn from the lathe's own points (profile.mjs) under the stage. It only
// swaps materials and a backdrop class; the plastic materials are left untouched underneath, so turning it off
// restores them exactly. The Clay button calls onClay(on) so the host can carry the mode to its other viewer.
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {shapeForDisc} from './shape.mjs';
import {PLASTICS,discGeometry} from './mesh.mjs';
import {profileSVG,CLAY_TONES} from './profile.mjs';
import {stampTexture,stampGeometry,stampMaterial as makeStampMaterial} from './stamp.mjs';
import {isOvermold,overmoldColors} from './overmold.mjs';

const DEG=Math.PI/180;
// Camera elevations measured from straight above. The 3/4 view is the default: from behind and above,
// as the thrower sees the disc, so the hyzer/anhyzer tilt reads left/right. Bottom looks up from 35° off
// the axis: straight up, the cavity reads as a flat plate; at an angle the inner rim wall shows.
export const VIEWS={angle:{polar:60*DEG,label:'3/4'},top:{polar:.0001,label:'Top'},profile:{polar:90*DEG,label:'Profile'},bottom:{polar:145*DEG,label:'Bottom'}};
export const MAX_TILT=40;
// The camera frames a fixed 22 cm disc, so molds show at true scale: a 21.7 cm Buzzz stands wider than a
// 21.1 cm Destroyer. Anything larger is framed by its own diameter.
export const FRAME_DIAMETER=22;
// A press that stays within TAP_SLOP px and under TAP_MS is a tap, not the start of a drag.
const TAP_SLOP=6,TAP_MS=600;
const EXPAND_ICON='<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9"/></svg>';
const SOURCE_TEXT={model:'its mold profile',pdga:'its PDGA dimensions, to scale',flight:'a generic shape from its flight numbers'};
// The edge that drops on hyzer is the fade side: left for RHBH and LHFH, right for RHFH and LHBH.
export const hyzerSign=hand=>hand==='RHFH'||hand==='LHBH'?-1:1;

// The clay matcap: one grey sphere baked once per page into a canvas (each viewer wraps it in its own texture).
// A key from the upper left falls off steeply (diffuse squared) so the dome, the shoulder and the flat of the
// flight plate separate into distinct values; a tight highlight marks the shoulder's curvature; a cool fill from
// below keeps the cavity readable; and a bright fresnel edge keeps the silhouette off the dark ground at any angle.
let matcapCanvas=null;
function clayMatcap(){
 if(matcapCanvas)return matcapCanvas;
 const size=256,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const g=canvas.getContext('2d'),img=g.createImageData(size,size),d=img.data;
 const norm=v=>{const l=Math.hypot(...v);return v.map(c=>c/l);};
 const key=norm([-.45,.55,.7]),fill=norm([.55,-.6,.5]),half=norm([key[0],key[1],key[2]+1]);
 for(let j=0;j<size;j++)for(let i=0;i<size;i++){
  const x=(i+.5)/size*2-1,y=1-(j+.5)/size*2,k=(j*size+i)*4;
  const z=Math.sqrt(Math.max(0,1-Math.min(1,x*x+y*y))),dot=a=>Math.max(0,x*a[0]+y*a[1]+z*a[2]);
  const diffuse=dot(key),v=.05+.5*diffuse*diffuse+.7*Math.pow(dot(half),18)+.2*dot(fill)+.65*Math.pow(1-z,2.4);
  const c=Math.round(Math.min(1,v)*255);d[k]=d[k+1]=d[k+2]=c;d[k+3]=255;
 }
 g.putImageData(img,0,0);
 return matcapCanvas=canvas;
}

const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const angleDelta=(a,b)=>{let d=(b-a)%(2*Math.PI);if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;return d;};

export function createDiscViewer({segments,onExpand,hint,onClay}={}){
 const coarse=matchMedia('(pointer: coarse)').matches;
 const radial=segments||(coarse?56:80);
 const element=document.createElement('div');element.className='disc3d-viewer';
 element.innerHTML=`<div class="disc3d-viewport"><canvas class="disc3d-canvas" tabindex="0" role="img"></canvas><span class="disc3d-hint" aria-hidden="true">${hint||'Drag to turn · scroll to zoom'}</span>${onExpand?`<button type="button" class="disc3d-expand" data-disc3d-expand aria-label="Enlarge 3D view" aria-haspopup="dialog" title="Enlarge">${EXPAND_ICON}</button>`:''}</div>
<figure class="disc3d-profile" hidden><div class="disc3d-profile-art"></div><figcaption class="disc3d-profile-caption"></figcaption></figure>
<div class="disc3d-toolbar"><div class="disc3d-views" role="group" aria-label="Preset views">${Object.entries(VIEWS).map(([k,v])=>`<button type="button" data-disc3d-view="${k}" aria-pressed="${k==='angle'}">${v.label}</button>`).join('')}</div><button type="button" data-disc3d-flip aria-pressed="false">Flip</button><button type="button" data-disc3d-clay aria-pressed="false" title="Clay: plain shape and cross-section">Clay</button></div>
<label class="disc3d-tilt"><span class="disc3d-tilt-end">Anhyzer</span><input type="range" min="${-MAX_TILT}" max="${MAX_TILT}" step="1" value="0" data-disc3d-tilt aria-label="Release angle, anhyzer to hyzer"><span class="disc3d-tilt-end">Hyzer</span><output data-disc3d-tilt-value>Flat</output></label>`;
 const canvas=element.querySelector('canvas'),viewport=element.querySelector('.disc3d-viewport'),profileFigure=element.querySelector('.disc3d-profile');
 // Throws where WebGL is unavailable; the caller keeps the static illustration.
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
 renderer.toneMapping=THREE.NeutralToneMapping;
 const scene=new THREE.Scene();
 const pmrem=new THREE.PMREMGenerator(renderer);
 const envTexture=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();
 scene.environment=envTexture;scene.environmentIntensity=.85;
 const key=new THREE.DirectionalLight(0xffffff,1.5);key.position.set(-6,14,10);scene.add(key);
 const fill=new THREE.DirectionalLight(0xffffff,.7);fill.position.set(5,-12,7);scene.add(fill);
 scene.add(new THREE.HemisphereLight(0xffffff,0x8090a0,.5));

 const camera=new THREE.PerspectiveCamera(30,1,.5,400);
 const controls=new OrbitControls(camera,canvas);
 Object.assign(controls,{enableDamping:true,dampingFactor:.12,enablePan:false,rotateSpeed:.9,zoomSpeed:.8,minPolarAngle:0,maxPolarAngle:Math.PI});

 // tilt (hyzer/anhyzer, about the line of sight from behind the thrower) > flip (about left-right) > disc
 const tiltGroup=new THREE.Group(),flipGroup=new THREE.Group(),discGroup=new THREE.Group();
 tiltGroup.add(flipGroup);flipGroup.add(discGroup);scene.add(tiltGroup);
 const bodyMaterial=new THREE.MeshPhysicalMaterial({color:0x888888,side:THREE.FrontSide});
 const stampMaterial=makeStampMaterial();
 // Overmold discs only: bodyMaterial becomes the flight plate and rimMaterial the rim.
 const rimMaterial=new THREE.MeshPhysicalMaterial({color:0x444444,side:THREE.FrontSide});
 // Clay: matte matcap materials (no lights, no environment, not tone mapped), one per part.
 const matcap=new THREE.CanvasTexture(clayMatcap());matcap.colorSpace=THREE.SRGBColorSpace;
 const clayMaterial=new THREE.MeshMatcapMaterial({matcap,color:CLAY_TONES.plate,toneMapped:false});
 const clayRimMaterial=new THREE.MeshMatcapMaterial({matcap,color:CLAY_TONES.rim,toneMapped:false});
 const body=new THREE.Mesh(new THREE.BufferGeometry(),bodyMaterial),stamp=new THREE.Mesh(new THREE.BufferGeometry(),stampMaterial);
 discGroup.add(body,stamp);

 const state={key:'',hand:'RHBH',tilt:0,flipped:false,view:'angle',radius:10.6,frameRadius:FRAME_DIAMETER/2,source:'',overmold:false,colors:null,seamRadius:null,thickness:2,fit:40,props:null,frames:0,clay:false,shape:null,profile:null,profileWidth:0};
 let frame=0,tween=null,flipTween=null,size={w:0,h:0},disposed=false,interacted=false;

 const spherical=()=>new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
 const placeCamera=s=>{s.makeSafe();camera.position.setFromSpherical(s).add(controls.target);camera.lookAt(controls.target);};
 // The nearest distance at which the whole rim, top and bottom edge, projects inside `margin` of the
 // frame from this elevation: each preset fills the canvas its own way (a profile is wide and thin).
 const probe=new THREE.PerspectiveCamera(),rimPoints=[],ndc=new THREE.Vector3();
 function fitDistance(polar=VIEWS.angle.polar,margin=.86){
  probe.fov=camera.fov;probe.aspect=camera.aspect;probe.near=camera.near;probe.far=camera.far;probe.updateProjectionMatrix();
  rimPoints.length=0;const h=state.thickness/2;
  for(let i=0;i<48;i++){const a=i/48*Math.PI*2;for(const y of [-h,h])rimPoints.push(new THREE.Vector3(Math.cos(a)*state.frameRadius,y,Math.sin(a)*state.frameRadius));}
  const fits=d=>{probe.position.setFromSpherical(new THREE.Spherical(d,polar,0).makeSafe());probe.lookAt(0,0,0);probe.updateMatrixWorld();
   return rimPoints.every(p=>{ndc.copy(p).project(probe);return Math.abs(ndc.x)<=margin&&Math.abs(ndc.y)<=margin&&ndc.z<1;});};
  let lo=state.frameRadius*.5,hi=state.frameRadius*30;
  for(let i=0;i<32;i++){const mid=(lo+hi)/2;if(fits(mid))hi=mid;else lo=mid;}
  return hi;
 }
 function setZoomRange(){state.fit=fitDistance(VIEWS.top.polar);controls.minDistance=state.fit*.35;controls.maxDistance=state.fit*1.6;}
 function render(){
  frame=0;if(disposed||!size.w)return;
  const now=performance.now();let more=false;
  if(tween){const t=Math.min(1,(now-tween.start)/tween.ms),e=ease(t);
   placeCamera(new THREE.Spherical(tween.from.radius+(tween.to.radius-tween.from.radius)*e,tween.from.phi+(tween.to.phi-tween.from.phi)*e,tween.from.theta+tween.dTheta*e));
   if(t<1)more=true;else tween=null;}
  if(flipTween){const t=Math.min(1,(now-flipTween.start)/flipTween.ms);
   flipGroup.rotation.x=flipTween.from+(flipTween.to-flipTween.from)*ease(t);if(t<1)more=true;else flipTween=null;}
  if(!tween&&controls.update())more=true;
  renderer.render(scene,camera);state.frames++;
  if(more)request();
 }
 function request(){if(!frame&&!disposed)frame=requestAnimationFrame(render);}
 controls.addEventListener('change',request);
 const noteInteraction=()=>{if(!interacted){interacted=true;element.classList.add('has-interacted');}};
 controls.addEventListener('start',()=>{tween=null;setPressedView(null);noteInteraction();});

 function resize(){
  const r=viewport.getBoundingClientRect(),w=Math.round(r.width),h=Math.round(r.height);
  drawProfile();
  if(!w||!h||(w===size.w&&h===size.h))return;
  const first=!size.w;size={w,h};
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  const before=state.fit;setZoomRange();
  // Keep the zoom the reader chose, relative to the frame.
  const s=spherical();s.radius=first?fitDistance(s.phi):s.radius*state.fit/before;placeCamera(s);
  request();
 }
 const observer=new ResizeObserver(resize);observer.observe(viewport);

 function setPressedView(name){state.view=name;element.querySelectorAll('[data-disc3d-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.disc3dView===name)));}
 function setView(name,{instant=false}={}){
  const view=VIEWS[name];if(!view)return;
  const from=spherical(),to=new THREE.Spherical(fitDistance(view.polar),view.polar,0);
  setPressedView(name);
  if(instant||reducedMotion()||!size.w){tween=null;placeCamera(to);request();return;}
  tween={from,to,dTheta:angleDelta(from.theta,0),start:performance.now(),ms:650};request();
 }
 function flip(){
  state.flipped=!state.flipped;element.querySelector('[data-disc3d-flip]').setAttribute('aria-pressed',String(state.flipped));
  const to=state.flipped?Math.PI:0;
  if(reducedMotion()){flipGroup.rotation.x=to;flipTween=null;}else flipTween={from:flipGroup.rotation.x,to,start:performance.now(),ms:700};
  request();
 }
 function setTilt(deg){
  state.tilt=Math.max(-MAX_TILT,Math.min(MAX_TILT,Math.round(+deg||0)));
  tiltGroup.rotation.z=state.tilt*DEG*hyzerSign(state.hand);
  const input=element.querySelector('[data-disc3d-tilt]'),out=element.querySelector('[data-disc3d-tilt-value]');
  if(+input.value!==state.tilt)input.value=String(state.tilt);
  const text=state.tilt===0?'Flat':`${Math.abs(state.tilt)}° ${state.tilt>0?'hyzer':'anhyzer'}`;
  out.textContent=text;input.setAttribute('aria-valuetext',text);
  request();
 }
 function setHand(hand){state.hand=hand||'RHBH';setTilt(state.tilt);}
 // The reader's framing, independent of the canvas size (zoom is relative to the fitted distance).
 function getPose(){const s=spherical();return {view:state.view,theta:s.theta,phi:s.phi,zoom:s.radius/state.fit,tilt:state.tilt,flipped:state.flipped};}
 // applyPose, but over `ms` on the viewer's own tween (the pop-out's close hands its pose back this way, so the
 // panel's disc turns to where the reader left it instead of snapping). Tilt follows at once; a flip animates.
 function glidePose(pose,ms=300){
  if(!pose)return;
  if(reducedMotion()||!size.w){applyPose(pose);return;}
  setTilt(pose.tilt);
  const flipped=!!pose.flipped,now=performance.now();
  if(flipped!==state.flipped){
   state.flipped=flipped;element.querySelector('[data-disc3d-flip]').setAttribute('aria-pressed',String(flipped));
   flipTween={from:flipGroup.rotation.x,to:flipped?Math.PI:0,start:now,ms};
  }
  const from=spherical(),view=pose.view&&VIEWS[pose.view];
  setPressedView(view?pose.view:null);
  const to=view?new THREE.Spherical(fitDistance(view.polar),view.polar,0):new THREE.Spherical(Math.min(controls.maxDistance,Math.max(controls.minDistance,pose.zoom*state.fit)),pose.phi,pose.theta);
  tween={from,to,dTheta:angleDelta(from.theta,to.theta),start:now,ms};request();
 }
 function applyPose(pose){
  if(!pose)return;
  tween=null;flipTween=null;setTilt(pose.tilt);
  state.flipped=!!pose.flipped;flipGroup.rotation.x=state.flipped?Math.PI:0;
  element.querySelector('[data-disc3d-flip]').setAttribute('aria-pressed',String(state.flipped));
  if(pose.view&&VIEWS[pose.view])setView(pose.view,{instant:true});
  else{const radius=Math.min(controls.maxDistance,Math.max(controls.minDistance,pose.zoom*state.fit));placeCamera(new THREE.Spherical(radius,pose.phi,pose.theta));setPressedView(null);request();}
 }

 function build(shape,mold,color,overmold){
  // The lathe and the overmold split are shared with the atlas's discs (mesh.mjs).
  const {geometry,seamRadius,profile}=discGeometry(shape,{segments:radial,overmold});
  state.seamRadius=seamRadius;state.shape=shape;state.profile=profile;state.profileWidth=0;
  applyMaterials(overmold);
  geometry.computeBoundingBox();const box=geometry.boundingBox;
  body.geometry.dispose();body.geometry=geometry;
  // The stamp rides the top surface, inside the shoulder (stamp.mjs).
  stamp.geometry.dispose();stamp.geometry=stampGeometry(shape);
  stampMaterial.map?.dispose();stampMaterial.map=stampTexture(mold,color);stampMaterial.needsUpdate=true;
  // Centre the disc on the orbit target.
  discGroup.position.y=-(box.min.y+box.max.y)/2;
  state.radius=shape.diameter/2;state.frameRadius=Math.max(state.radius,FRAME_DIAMETER/2);state.thickness=box.max.y-box.min.y;
 }

 function update(props={}){
  const resolved=shapeForDisc(props);
  if(!resolved)return false;
  const {shape,source}=resolved;
  const overmold=isOvermold(props),colors=overmold?overmoldColors(props.color,{...props.colors,rim:props.colors?.rim||(document.documentElement.dataset.theme==='light'?undefined:'#ffffff')}):null;
  // The stamp sits on the plate, so its ink follows the plate colour.
  const color=colors?colors.plate:props.color||'#8a8f98',plastic=PLASTICS[props.plastic]||PLASTICS.premium;
  const key=JSON.stringify([shape,props.mold,color,props.plastic,colors]);
  if(props.hand&&props.hand!==state.hand)setHand(props.hand);
  // Keep override intent even when a newly chosen color equals the current theme default.
  if(key===state.key){state.props=props;return true;}
  const sourceOf=p=>JSON.stringify([p?.model,p?.specs,p?.flight]);
  const discChanged=state.props?.mold!==props.mold||sourceOf(state.props)!==sourceOf(props);
  state.key=key;state.props=props;state.source=source;state.overmold=overmold;state.colors=colors;
  build(shape,props.mold,color,overmold);
  bodyMaterial.color.set(color);Object.assign(bodyMaterial,plastic);bodyMaterial.needsUpdate=true;
  if(overmold){rimMaterial.color.set(colors.rim);Object.assign(rimMaterial,plastic);rimMaterial.needsUpdate=true;}
  // A new disc starts face up in the 3/4 view; a recolour of the same disc keeps the reader's view.
  if(discChanged){
   state.flipped=false;flipTween=null;flipGroup.rotation.x=0;element.querySelector('[data-disc3d-flip]').setAttribute('aria-pressed','false');
   if(size.w)setZoomRange();
   setView('angle',{instant:true});
  }
  label();drawProfile();
  request();return true;
 }

 // Which materials the mesh wears: the plastic ones, or clay. Neither set is modified by the other.
 function applyMaterials(overmold=state.overmold){
  body.material=state.clay?(overmold?[clayMaterial,clayRimMaterial]:clayMaterial):(overmold?[bodyMaterial,rimMaterial]:bodyMaterial);
  stamp.visible=!state.clay;
 }
 function label(){
  const props=state.props||{};
  canvas.setAttribute('aria-label',`3D model of the ${props.mold||'disc'}, built from ${SOURCE_TEXT[state.source]}${state.overmold?', with its overmold rim in a second colour':''}${state.clay?', shown in plain clay with its cross-section below':''}. Drag or use the arrow keys to turn it, scroll or use + and − to zoom.`);
 }
 // The cross-section under the stage, while clay is on: static SVG, redrawn only for a new disc or width.
 function drawProfile(){
  profileFigure.hidden=!state.clay;
  if(!state.clay||!state.profile)return;
  const width=Math.round(profileFigure.clientWidth);
  if(!width||width===state.profileWidth)return;
  state.profileWidth=width;
  const {svg,caption}=profileSVG(state.profile,{shape:state.shape,source:state.source,specs:state.props?.specs,width,mold:state.props?.mold||'disc'});
  profileFigure.querySelector('.disc3d-profile-art').innerHTML=svg;
  profileFigure.querySelector('.disc3d-profile-caption').textContent=caption;
 }
 // `notify` (the Clay button) tells the host, which carries the mode to its other viewer.
 function setClay(on,{notify=false}={}){
  on=!!on;
  if(on!==state.clay){
   state.clay=on;element.classList.toggle('is-clay',on);
   element.querySelector('[data-disc3d-clay]').setAttribute('aria-pressed',String(on));
   applyMaterials();state.profileWidth=0;drawProfile();label();request();
  }
  if(notify)onClay?.(on);
 }

 // A tap is decided on pointerup but acted on at the click that follows it, so the pop-out never opens
 // under a finger that is still down (its controls would receive the tap's synthesized click).
 let press=null,tapped=0;
 if(onExpand){
  canvas.addEventListener('pointerdown',e=>{
   if(press&&press.id!==e.pointerId&&performance.now()-press.at<5000){press.moved=true;return;}   // a second finger is a pinch
   press={id:e.pointerId,x:e.clientX,y:e.clientY,at:performance.now(),moved:e.button!==0};
  });
  canvas.addEventListener('pointermove',e=>{if(press&&e.pointerId===press.id&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>TAP_SLOP)press.moved=true;});
  canvas.addEventListener('pointerup',e=>{if(!press||e.pointerId!==press.id)return;const p=press;press=null;if(!p.moved&&performance.now()-p.at<TAP_MS)tapped=performance.now();});
  canvas.addEventListener('pointercancel',()=>{press=null;});
  canvas.addEventListener('click',()=>{if(tapped&&performance.now()-tapped<400){tapped=0;onExpand(canvas);}});
 }
 element.addEventListener('click',e=>{
  const x=e.target.closest('[data-disc3d-expand]');if(x){onExpand?.(x);return;}
  const v=e.target.closest('[data-disc3d-view]');if(v){noteInteraction();setView(v.dataset.disc3dView);}
  if(e.target.closest('[data-disc3d-flip]')){noteInteraction();flip();}
  if(e.target.closest('[data-disc3d-clay]'))setClay(!state.clay,{notify:true});
 });
 element.querySelector('[data-disc3d-tilt]').addEventListener('input',e=>{noteInteraction();setTilt(e.target.value);});
 canvas.addEventListener('keydown',e=>{
  const s=spherical(),step=15*DEG;
  if(e.key==='ArrowLeft')s.theta-=step;else if(e.key==='ArrowRight')s.theta+=step;
  else if(e.key==='ArrowUp')s.phi=Math.max(.0001,s.phi-step);else if(e.key==='ArrowDown')s.phi=Math.min(Math.PI-.0001,s.phi+step);
  else if(e.key==='+'||e.key==='=')s.radius=Math.max(controls.minDistance,s.radius*.85);
  else if(e.key==='-'||e.key==='_')s.radius=Math.min(controls.maxDistance,s.radius/.85);
  else return;
  e.preventDefault();tween=null;setPressedView(null);noteInteraction();placeCamera(s);request();
 });

 function attach(host){if(element.parentNode!==host)host.appendChild(element);resize();request();}
 const themeChanged=()=>{
  if(state.props)update({...state.props,hand:state.hand});
  // Paint before a theme View Transition captures its new snapshot (rAF is paused there).
  if(!disposed&&size.w)renderer.render(scene,camera);
  request();
 };
 window.addEventListener('atlas-theme-change',themeChanged);
 function dispose(){
  window.removeEventListener('atlas-theme-change',themeChanged);
  disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();
  body.geometry.dispose();stamp.geometry.dispose();bodyMaterial.dispose();rimMaterial.dispose();clayMaterial.dispose();clayRimMaterial.dispose();matcap.dispose();stampMaterial.map?.dispose();stampMaterial.dispose();
  envTexture.dispose();renderer.dispose();renderer.forceContextLoss();element.remove();
 }
 setTilt(0);
 return {element,attach,update,setView,flip,setTilt,setHand,getPose,applyPose,glidePose,setClay,dispose,state,
  // For tests and tuning: the live objects and a synchronous draw.
  debug:{renderer,scene,camera,controls,body,stamp,bodyMaterial,rimMaterial,clayMaterial,clayRimMaterial,profileFigure,tiltGroup,flipGroup,renderNow:()=>{tween&&(tween.start=-1e9);flipTween&&(flipTween.start=-1e9);render();}}};
}
