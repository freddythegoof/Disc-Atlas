// Interactive 3D disc (Plan 09, phase 1): the procedural profile from shape.mjs spun by LatheGeometry,
// with drag to turn, scroll or pinch to zoom, preset views (3/4, top, profile, bottom), flip, and a
// hyzer/anhyzer tilt. One renderer is reused for every disc; it draws only when something moves.
//
// createDiscViewer() returns {element, attach(host), update(props), setView(name), flip(), setTilt(deg),
// setHand(hand), getPose(), applyPose(pose), glidePose(pose, ms), setClay(on), setSpin(on), dispose()}. Options: {segments, onExpand, hint, onClay}. With `onExpand`
// the viewer offers a pop-out: an Enlarge button and a tap or click on the canvas call onExpand(trigger),
// where `trigger` is the element that was used (for returning focus). getPose/applyPose carry the camera,
// tilt and flip between two viewers (the pop-out starts where the panel's viewer is, and hands it back).
// Props: {model, specs, flight, mold, color, plastic, hand, manufacturer, record,
// overmold, colors, photoURL, texture_key, photo_rim_color, haloBand, finish}. `model` is explicit shape parameters (d.model3d); otherwise the mold's PDGA `specs` set
// its shape (phase 2), and without them the Phase 1 generic shape comes from `flight` {speed, turn, fade}.
// `mold` is the name set as a generic text stamp: never manufacturer artwork.
// Overmold discs (Plan 12) draw the rim and the flight plate in two materials, split at the measured rim
// width. `overmold` (boolean) is the record's own flag; without it the PDGA `manufacturer` and `record` name
// are looked up in overmold.mjs. `colors` {rim, plate} are optional overrides of the two colours; the
// plate defaults to `color`; the rim defaults to black in light theme, white in dark themes.
// A Halo copy (`haloBand`, a '#rrggbb' from disc3d/halo.mjs haloBand) is not an overmold: it is one piece of
// plastic dyed in two colours. On a one-piece mold its band uses the same seam split and the same plastic
// material as an overmold's rim, only coloured with the band; its photo still stops at the shoulder, and clay
// shows it as the one piece it is. An overmold mold ignores the band (its rim piece is already the second colour).
// Every other disc is one material, as before.
// A clear copy (`finish` 'clear', docs/clear-plastic-discs.md) is see-through plastic that filters the page behind it by
// its colour (clear.mjs): its plate and any Halo band, both walls, while an overmold's rim piece stays opaque plastic.
// Clay (Prompt 4) is a shape-only inspect view: the same mesh in matte studio clay on a dark ground, the stamp
// hidden, and the mold's cross-section drawn from the lathe's own points (profile.mjs) under the stage. It only
// swaps materials and a backdrop class; the plastic materials are left untouched underneath, so turning it off
// restores them exactly. The Clay button calls onClay(on) so the host can carry the mode to its other viewer.
// Spin (docs/spin-color-default.md) is a turntable: the disc turns about its own axis, so a tilted disc spins like a
// coin on edge, the way the thrower's hand spins it. It runs on the viewer's own frame loop and only while on (and on
// screen); off, the viewer is on-demand exactly as before. Grabbing the disc stops it at once; letting go eases it
// back. The choice is remembered per browser; under reduced motion it never starts on its own. setSpin(on) turns it
// on or off; getPose/applyPose carry the disc's angle (`turn`) and the toggle (`spin`) to the other viewer.
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {shapeForDisc} from './shape.mjs';
import {PLASTICS,discGeometry} from './mesh.mjs';
import {profileSVG,CLAY_TONES} from './profile.mjs';
import {stampTexture,stampGeometry,stampMaterial as makeStampMaterial,catalogStampAsset,catalogStampPlacement,colorStyle} from './stamp.mjs';
import {photoSurface} from './photo.mjs';
import {PHOTO_STAMP,photoStampFor} from './photo-stamps.mjs';
import {isOvermold,overmoldColors,bagRimColor,lightTheme} from './overmold.mjs';
import {parseHalo} from './halo.mjs';
import {haloUniforms,setHalo,patchHalo} from './halo-shader.mjs';
import {DETAIL,detailPixelRatio} from './quality.mjs';
import {isClear,clearPart,clearPage,clearBackdrop,clearMeshes,pageColor,CLEAR_ORDER} from './clear.mjs';

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
// A disc on its turntable, the arrow going round the hand's way.
const SPIN_ICON='<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 5.6C4.7 5.6 2 6.9 2 8.5s2.7 2.9 6 2.9 6-1.3 6-2.9c0-.9-.8-1.7-2.1-2.2"/><path d="M10.4 3.9l1.6 1.9-2.1 1.2"/></svg>';
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
// The turntable's knobs: SPIN_PERIOD_S seconds a revolution at full speed, reached (and left) over SPIN_EASE_MS on a
// smoothstep, so a stop coasts a little under a tenth of a turn.
export const SPIN_PERIOD_S=5,SPIN_EASE_MS=900;
const SPIN_KEY='disc-atlas-viewer-spin';
const spinRemembered=()=>{try{return localStorage.getItem(SPIN_KEY)==='1';}catch{return false;}};
const rememberSpin=on=>{try{on?localStorage.setItem(SPIN_KEY,'1'):localStorage.removeItem(SPIN_KEY);}catch{/* Session only. */}};
const angleDelta=(a,b)=>{let d=(b-a)%(2*Math.PI);if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;return d;};

export function createDiscViewer({segments,onExpand,hint,onClay}={}){
 const coarse=matchMedia('(pointer: coarse)').matches;
 const radial=segments||(coarse?DETAIL.coarseSegments:DETAIL.segments);
 const element=document.createElement('div');element.className='disc3d-viewer';
 element.innerHTML=`<div class="disc3d-viewport"><canvas class="disc3d-canvas" tabindex="0" role="img"></canvas><span class="disc3d-hint" aria-hidden="true">${hint||'Drag to turn · Drag the rim to tilt · scroll to zoom'}</span><button type="button" class="disc3d-spin" data-disc3d-spin aria-pressed="false" aria-label="Spin the disc" title="Spin">${SPIN_ICON}</button>${onExpand?`<button type="button" class="disc3d-expand" data-disc3d-expand aria-label="Enlarge 3D view" aria-haspopup="dialog" title="Enlarge">${EXPAND_ICON}</button>`:''}</div>
<figure class="disc3d-profile" hidden><div class="disc3d-profile-art"></div><figcaption class="disc3d-profile-caption"></figcaption></figure>
<div class="disc3d-toolbar"><div class="disc3d-views" role="group" aria-label="Preset views">${Object.entries(VIEWS).map(([k,v])=>`<button type="button" data-disc3d-view="${k}" aria-pressed="${k==='angle'}">${v.label}</button>`).join('')}</div><button type="button" data-disc3d-flip aria-pressed="false">Flip</button><button type="button" data-disc3d-clay aria-pressed="false" title="Clay: plain shape and cross-section">Clay</button></div>
<label class="disc3d-tilt"><span class="disc3d-tilt-end">Anhyzer</span><input type="range" min="${-MAX_TILT}" max="${MAX_TILT}" step="1" value="0" data-disc3d-tilt aria-label="Release angle, anhyzer to hyzer"><span class="disc3d-tilt-end">Hyzer</span><output data-disc3d-tilt-value>Flat</output></label>`;
 const canvas=element.querySelector('canvas'),viewport=element.querySelector('.disc3d-viewport'),profileFigure=element.querySelector('.disc3d-profile');
 // Throws where WebGL is unavailable; the caller keeps the static illustration.
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
 renderer.setPixelRatio(detailPixelRatio());
 renderer.toneMapping=THREE.NeutralToneMapping;
 const scene=new THREE.Scene();
 const pmrem=new THREE.PMREMGenerator(renderer);
 const envTexture=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();
 scene.environment=envTexture;scene.environmentIntensity=DETAIL.environment;
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
 // Swapped for a foil when the player's own disc wears one (props.stampStyle, display customization).
 let stampMaterial=makeStampMaterial(),stampFinish='flat';
 // Overmold discs only: bodyMaterial becomes the flight plate and rimMaterial the rim.
 const rimMaterial=new THREE.MeshPhysicalMaterial({color:0x444444,side:THREE.FrontSide});
 // A Halo v2 band (`haloModel`): the same plastic, wash on top out to the dye front (halo-shader.mjs).
 const haloRim=haloUniforms(),haloRimMaterial=patchHalo(new THREE.MeshPhysicalMaterial({color:0x444444,side:THREE.FrontSide}),haloRim);
 // Clay: matte matcap materials (no lights, no environment, not tone mapped), one per part.
 const matcap=new THREE.CanvasTexture(clayMatcap());matcap.colorSpace=THREE.SRGBColorSpace;
 const clayMaterial=new THREE.MeshMatcapMaterial({matcap,color:CLAY_TONES.plate,toneMapped:false});
 const clayRimMaterial=new THREE.MeshMatcapMaterial({matcap,color:CLAY_TONES.rim,toneMapped:false});
 const body=new THREE.Mesh(new THREE.BufferGeometry(),bodyMaterial),stamp=new THREE.Mesh(new THREE.BufferGeometry(),stampMaterial);
 discGroup.add(body,stamp);
 // Clear plastics (clear.mjs): the plate's, a band's and a Halo band's passes, both walls, and the page's colour behind
 // them; drawn by `clearList` on the body's geometry. `none` draws nothing: the body when it is clear (an overmold's rim
 // piece stays on the body, opaque), and the rim's group in the clear passes.
 const page=clearPage(),clearPlate=clearPart(undefined,{page}),clearBand=clearPart(undefined,{page}),clearHalo=clearPart(()=>patchHalo(new THREE.MeshPhysicalMaterial(),haloRim),{page});
 const backdrop=clearBackdrop(),none=new THREE.MeshBasicMaterial({visible:false});
 const clearList=clearMeshes(body.geometry,backdrop,clearPlate);
 for(const mesh of clearList){mesh.visible=false;discGroup.add(mesh);}

 const state={key:'',clear:false,centre:0,hand:'RHBH',tilt:0,flipped:false,spin:false,view:'angle',radius:10.6,frameRadius:FRAME_DIAMETER/2,source:'',overmold:false,colors:null,seamRadius:null,band:null,halo:null,thickness:2,fit:40,props:null,frames:0,clay:false,shape:null,profile:null,profileWidth:0};
 let photo=null;
 let frame=0,tween=null,flipTween=null,size={w:0,h:0},disposed=false,interacted=false;
 // The turntable: `level` 0–1 along its ease (speed is smoothstep(level) of full), `held` while a finger or the mouse
 // has the disc, `at` the last spun frame's time, `seen` while the canvas is on screen.
 const spin={level:0,held:false,at:0,seen:true};

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
  if(turn(now))more=true;
  if(state.clear)orderClear();
  renderer.render(scene,camera);state.frames++;
  if(more)request();
 }
 function request(){if(!frame&&!disposed)frame=requestAnimationFrame(render);}
 // A clear disc's print (stamp or photo) on the top surface: over both walls from above, under them from below,
 // where it shows through the plastic (mirrored, as it is).
 const cameraLocal=new THREE.Vector3();
 function orderClear(){
  const print=discGroup.worldToLocal(cameraLocal.copy(camera.position)).y>state.centre?CLEAR_ORDER.printAbove:CLEAR_ORDER.printBelow;
  stamp.renderOrder=print;if(photo)photo.renderOrder=print;
  printSide(THREE.DoubleSide);
 }
 function printSide(side){for(const m of [stampMaterial,photo?.material])if(m&&m.side!==side){m.side=side;m.needsUpdate=true;}}
 controls.addEventListener('change',request);
 const noteInteraction=()=>{if(!interacted){interacted=true;element.classList.add('has-interacted');}};
 controls.addEventListener('start',()=>{tween=null;setPressedView(null);noteInteraction();if(pointers.size)holdSpin(true);});

 // One frame of the turntable; true while it still moves. It eases toward full speed while on, not held and on
 // screen, and toward a stop otherwise. The disc group turns about its own axis, the hand's way: clockwise from above
 // for a right-hand backhand.
 function turn(now){
  const want=state.spin&&!spin.held&&spin.seen?1:0;
  if(!want&&!spin.level){spin.at=0;return false;}
  const dt=spin.at?Math.min(.05,(now-spin.at)/1000):0;spin.at=now;
  spin.level=want?Math.min(1,spin.level+dt*1000/SPIN_EASE_MS):Math.max(0,spin.level-dt*1000/SPIN_EASE_MS);
  const speed=spin.level*spin.level*(3-2*spin.level)*2*Math.PI/SPIN_PERIOD_S;
  discGroup.rotation.y=(discGroup.rotation.y-speed*dt*hyzerSign(state.hand))%(2*Math.PI);
  if(!want&&!spin.level){spin.at=0;return false;}
  return true;
 }
 // `remember`: the reader's own tap, kept for next time. `instant`: no coast (a viewer set aside, not a reader's stop).
 function setSpin(on,{remember=false,instant=false}={}){
  state.spin=!!on;element.querySelector('[data-disc3d-spin]').setAttribute('aria-pressed',String(state.spin));
  if(remember)rememberSpin(state.spin);
  if(instant&&!state.spin){spin.level=0;spin.at=0;}
  request();
 }
 // Grabbing the disc takes it from the turntable at once; letting go eases it back up.
 function holdSpin(on){
  if(on===spin.held)return;
  spin.held=on;if(on){spin.level=0;spin.at=0;}
  request();
 }
 const seen=new IntersectionObserver(([entry])=>{spin.seen=entry.isIntersecting;request();});seen.observe(viewport);

 function resize(){
  // Layout size, not the bounding rect: the pop-out's dialog is mid-morph (scaled by a WAAPI transform) when a
  // ResizeObserver can fire, and a transformed rect would lock the buffer at the shrunken size.
  const w=viewport.offsetWidth,h=viewport.offsetHeight;
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
 function getPose(){const s=spherical();return {view:state.view,theta:s.theta,phi:s.phi,zoom:s.radius/state.fit,tilt:state.tilt,flipped:state.flipped,turn:discGroup.rotation.y,spin:state.spin};}
 // The disc's own angle and the turntable, from a pose that carries them.
 function applyTurn(pose){
  if(Number.isFinite(pose.turn))discGroup.rotation.y=pose.turn;
  if(typeof pose.spin==='boolean'&&pose.spin!==state.spin)setSpin(pose.spin,{instant:true});
 }
 // applyPose, but over `ms` on the viewer's own tween (the pop-out's close hands its pose back this way, so the
 // panel's disc turns to where the reader left it instead of snapping). Tilt follows at once; a flip animates.
 function glidePose(pose,ms=300){
  if(!pose)return;
  if(reducedMotion()||!size.w){applyPose(pose);return;}
  setTilt(pose.tilt);applyTurn(pose);
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
  tween=null;flipTween=null;setTilt(pose.tilt);applyTurn(pose);
  state.flipped=!!pose.flipped;flipGroup.rotation.x=state.flipped?Math.PI:0;
  element.querySelector('[data-disc3d-flip]').setAttribute('aria-pressed',String(state.flipped));
  if(pose.view&&VIEWS[pose.view])setView(pose.view,{instant:true});
  else{const radius=Math.min(controls.maxDistance,Math.max(controls.minDistance,pose.zoom*state.fit));placeCamera(new THREE.Spherical(radius,pose.phi,pose.theta));setPressedView(null);request();}
 }

 function build(shape,mold,color,overmold,asset,placement,band=null,halo=null,style=null){
  // The lathe and the overmold split are shared with the atlas's discs (mesh.mjs). A Halo band splits at the
  // same seam; its cross-section is still drawn as one piece.
  const {geometry,seamRadius,profile}=discGeometry(shape,{segments:radial,overmold:overmold||!!band,halo:!!halo});
  state.seamRadius=seamRadius;state.shape=shape;state.profile=overmold?profile:{...profile,rim:null,seamRadius:null};state.profileWidth=0;
  applyMaterials(overmold,band,halo);
  geometry.computeBoundingBox();const box=geometry.boundingBox;
  body.geometry.dispose();body.geometry=geometry;for(const mesh of clearList)mesh.geometry=geometry;
  // The stamp rides the top surface, inside the shoulder (stamp.mjs).
  stamp.geometry.dispose();stamp.geometry=stampGeometry(shape);
  const finish=style?.finish?.id||'flat';
  if(finish!==stampFinish){stampMaterial.map?.dispose();stampMaterial.map=null;stampMaterial.dispose();stampMaterial=makeStampMaterial(style);stamp.material=stampMaterial;stampFinish=finish;}
  // A photo stamp spans most of the disc in fine line work: the viewer draws it at its full 2048 (stamp.mjs).
  stampMaterial.map?.dispose();stampMaterial.map=stampTexture(mold,color,{asset,style,size:PHOTO_STAMP.test(asset||'')?2048:512,onChange:texture=>{
   if(texture?.userData.stampAsset&&placement){stamp.geometry.dispose();stamp.geometry=stampGeometry(shape,{placement});}
   request();
  }});stampMaterial.needsUpdate=true;
  // Centre the disc on the orbit target.
  discGroup.position.y=-(box.min.y+box.max.y)/2;state.centre=(box.min.y+box.max.y)/2;
  state.radius=shape.diameter/2;state.frameRadius=Math.max(state.radius,FRAME_DIAMETER/2);state.thickness=box.max.y-box.min.y;
 }

 function update(props={}){
  const resolved=shapeForDisc(props);
  if(!resolved)return false;
  const {shape,source}=resolved;
  const rim=bagRimColor({rim_color:props.colors?.rim,texture_key:props.texture_key,photo_rim_color:props.photo_rim_color},lightTheme()?undefined:'#ffffff');
  const overmold=isOvermold(props),colors=overmold?overmoldColors(props.color,{...props.colors,rim}):null;
  const band=!overmold&&/^#[0-9a-f]{6}$/i.test(props.haloBand||'')?props.haloBand.toLowerCase():null;
  // Halo v2: the band's wash and dye front, when the copy was saved with them; otherwise the v1 one-colour band.
  const halo=band&&parseHalo(props.haloModel)?props.haloModel.toLowerCase():null;
  // The stamp sits on the plate, so its ink follows the plate colour.
  const color=colors?colors.plate:props.color||'#8a8f98',plastic=PLASTICS[props.plastic]||PLASTICS.premium;
  // A photo disc its owner switched to the game-asset look (photo-stamps.mjs) wears its extracted stamp instead of
  // the photo, through the same stamp path as stock art, in the owner's ink and finish.
  const look=photoStampFor(props.photoURL),photoURL=look?null:props.photoURL;
  const asset=look?look.asset:photoURL?null:catalogStampAsset(props),placement=look?look.placement:asset?catalogStampPlacement(props):null;
  // A personal stamp style only reaches here for the player's own disc; neutral views pass none. A colour asset keeps
  // its own colours: its finish is a sheen (stamp.mjs colorStyle).
  const style=photoURL?null:look?.color?colorStyle(props.stampStyle):props.stampStyle||null;
  const clear=isClear(props.finish);
  const key=JSON.stringify([shape,props.mold,color,props.plastic,colors,band,halo,photoURL,asset,placement,style&&[style.inkId,style.finish.id],clear]);
  if(props.hand&&props.hand!==state.hand)setHand(props.hand);
  // Keep override intent even when a newly chosen color equals the current theme default.
  if(key===state.key){state.props=props;return true;}
  const sourceOf=p=>JSON.stringify([p?.model,p?.specs,p?.flight]);
  const discChanged=state.props?.mold!==props.mold||sourceOf(state.props)!==sourceOf(props);
  state.key=key;state.props=props;state.source=source;state.clear=clear;state.overmold=overmold;state.colors=colors;state.band=band;state.halo=halo;
  photo?.userData.disposePhoto();if(photo)discGroup.remove(photo);photo=null;
  build(shape,props.mold,color,overmold,asset,placement,band,halo,style);
  bodyMaterial.color.set(color);Object.assign(bodyMaterial,plastic);bodyMaterial.needsUpdate=true;
  if(clear){clearPlate.paint(color,plastic);if(band){clearBand.paint(band,plastic);clearHalo.paint(band,plastic);}repaintBackdrop();}
  // The photo wears the plate's own plastic, so the scene shades it like the disc around it.
  if(photoURL){photo=photoSurface(shape,photoURL,{overmold,like:bodyMaterial,relief:true,onChange:()=>{applyMaterials();request();}});discGroup.add(photo);}
  if(overmold||band){rimMaterial.color.set(overmold?colors.rim:band);Object.assign(rimMaterial,plastic);rimMaterial.needsUpdate=true;}
  if(halo){setHalo(haloRim,halo);haloRimMaterial.color.set(band);Object.assign(haloRimMaterial,plastic);haloRimMaterial.needsUpdate=true;}
  // A new disc starts face up in the 3/4 view; a recolour of the same disc keeps the reader's view.
  if(discChanged){
   state.flipped=false;flipTween=null;flipGroup.rotation.x=0;discGroup.rotation.y=0;element.querySelector('[data-disc3d-flip]').setAttribute('aria-pressed','false');
   if(size.w)setZoomRange();
   setView('angle',{instant:true});
  }
  label();drawProfile();
  request();return true;
 }

 // Which materials the mesh wears: the plastic ones, or clay. Neither set is modified by the other.
 function applyMaterials(overmold=state.overmold,band=state.band,halo=state.halo){
  const clear=state.clear&&!state.clay;
  body.material=state.clay?(overmold?[clayMaterial,clayRimMaterial]:clayMaterial):clear?(overmold?[none,rimMaterial]:none):(overmold||band?[bodyMaterial,halo?haloRimMaterial:rimMaterial]:bodyMaterial);
  // The clear passes after the backdrop: the plate's, with the band's in its group (an overmold's opaque rim: none).
  clearList.forEach((mesh,i)=>{
   mesh.visible=clear;if(!clear||!i)return;
   const wall=(i-1)>>1,kind=(i-1)&1?'shine':'filter',plate=clearPlate.walls[wall][kind];
   mesh.material=overmold?[plate,none]:band?[plate,(halo?clearHalo:clearBand).walls[wall][kind]]:plate;
  });
  if(!state.clear){stamp.renderOrder=0;if(photo)photo.renderOrder=0;printSide(THREE.FrontSide);}
  stamp.visible=!state.clay&&!photo?.userData.photoReady;
  if(photo)photo.visible=!state.clay&&!!photo.userData.photoReady;
 }
 function label(){
  const props=state.props||{};
  canvas.setAttribute('aria-label',`3D model of the ${props.mold||'disc'}, built from ${SOURCE_TEXT[state.source]}${state.overmold?', with its overmold rim in a second colour':state.halo?', with its Halo band in two dye colours, a pale wash and the dye at the edge':state.band?', with its Halo band in a second dye colour':''}${state.clay?', shown in plain clay with its cross-section below':''}. Drag the rim to tilt. Drag or use the arrow keys to turn it, scroll or use + and − to zoom.`);
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

 // Raycast the actual body (also in clay), then measure whether rotating that hit
 // about the existing world Z tilt axis visibly raises it. Top / points near the
 // axis retain orbit: a vertical pull cannot read as lifting an edge there.
 const rimRay=new THREE.Raycaster(),rimPointer=new THREE.Vector2(),rimLocal=new THREE.Vector3(),rimLift=new THREE.Vector3();
 const cameraInverse=new THREE.Quaternion();
 function rimAt(e){
  if(!state.key)return null;
  const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return null;
  camera.updateMatrixWorld();body.updateWorldMatrix(true,false);
  rimPointer.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);
  rimRay.setFromCamera(rimPointer,camera);
  const hit=rimRay.intersectObject(body,false)[0];if(!hit)return null;
  body.worldToLocal(rimLocal.copy(hit.point));
  if(Math.hypot(rimLocal.x,rimLocal.z)<state.radius*.7)return null;
  cameraInverse.copy(camera.quaternion).invert();
  rimLift.set(-hit.point.y,hit.point.x,0).applyQuaternion(cameraInverse);
  if(Math.abs(rimLift.y)/state.radius<.15)return null;
  return {sign:Math.sign(rimLift.y)*hyzerSign(state.hand),pxPerDegree:Math.max(2,rect.height/(2*MAX_TILT))};
 }
 // Capture-phase handlers own only rim gestures, before OrbitControls sees down.
 // A tap is still acted on at click, after the finger has been released.
 let press=null,tapped=0,rimGrab=null,replaying=false,lastHover=-Infinity;
 const pointers=new Map();
 function endRim(){
  if(!rimGrab)return;
  const grab=rimGrab;rimGrab=null;controls.enabled=grab.enabled;canvas.style.cursor='';
  if(canvas.hasPointerCapture(grab.id))canvas.releasePointerCapture(grab.id);
 }
 function pointerDown(e){
  if(replaying)return;
  const first=pointers.values().next().value;pointers.set(e.pointerId,e);tapped=0;
  if(pointers.size>1){
   if(press)press.moved=true;
   if(rimGrab){
    endRim();
    // OrbitControls never saw the captured first down. Seed its public event
    // path at the first finger's current position before this second down.
    replaying=true;
    try{canvas.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:first.pointerId,pointerType:first.pointerType,
     clientX:first.clientX,clientY:first.clientY,button:0,buttons:1}));}finally{replaying=false;}
   }
   return;
  }
  if(onExpand)press={id:e.pointerId,x:e.clientX,y:e.clientY,at:performance.now(),moved:e.button!==0};
  if(e.button!==0||!controls.enabled)return;
  const rim=rimAt(e);if(!rim)return;
  rimGrab={...rim,id:e.pointerId,x:e.clientX,y:e.clientY,tilt:state.tilt,enabled:controls.enabled};
  controls.enabled=false;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='ns-resize';
  tween=null;holdSpin(true);e.stopImmediatePropagation();
 }
 function pointerMove(e){
  if(pointers.has(e.pointerId))pointers.set(e.pointerId,e);
  if(press&&e.pointerId===press.id&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>TAP_SLOP)press.moved=true;
  if(rimGrab&&e.pointerId===rimGrab.id){
   e.stopImmediatePropagation();
   if(Math.hypot(e.clientX-rimGrab.x,e.clientY-rimGrab.y)<=TAP_SLOP&&!rimGrab.moved)return;
   rimGrab.moved=true;noteInteraction();
   setTilt(rimGrab.tilt+(rimGrab.y-e.clientY)/rimGrab.pxPerDegree*rimGrab.sign);
  }else if(!pointers.size&&e.pointerType!=='touch'&&performance.now()-lastHover>40){
   lastHover=performance.now();canvas.style.cursor=rimAt(e)?'ns-resize':'';
  }
 }
 function pointerEnd(e){
  pointers.delete(e.pointerId);if(!pointers.size)holdSpin(false);
  if(press&&e.pointerId===press.id){
   const p=press;press=null;
   if(e.type==='pointerup'&&!p.moved&&performance.now()-p.at<TAP_MS)tapped=performance.now();
  }
  if(rimGrab&&e.pointerId===rimGrab.id){e.stopImmediatePropagation();endRim();}
 }
 function lostCapture(e){if(rimGrab?.id===e.pointerId){press=null;pointers.delete(e.pointerId);endRim();if(!pointers.size)holdSpin(false);}}
 function leaveRim(){if(!rimGrab)canvas.style.cursor='';}
 function cancelRim(){press=null;tapped=0;pointers.clear();endRim();holdSpin(false);}
 canvas.addEventListener('pointerdown',pointerDown,true);
 canvas.addEventListener('pointermove',pointerMove,true);
 canvas.addEventListener('pointerup',pointerEnd,true);
 canvas.addEventListener('pointercancel',pointerEnd,true);
 canvas.addEventListener('lostpointercapture',lostCapture);
 canvas.addEventListener('pointerleave',leaveRim);
 window.addEventListener('blur',cancelRim);
 if(onExpand)canvas.addEventListener('click',()=>{if(tapped&&performance.now()-tapped<400){tapped=0;onExpand(canvas);}});
 element.addEventListener('click',e=>{
  const x=e.target.closest('[data-disc3d-expand]');if(x){onExpand?.(x);return;}
  const v=e.target.closest('[data-disc3d-view]');if(v){noteInteraction();setView(v.dataset.disc3dView);}
  if(e.target.closest('[data-disc3d-flip]')){noteInteraction();flip();}
  if(e.target.closest('[data-disc3d-clay]'))setClay(!state.clay,{notify:true});
  if(e.target.closest('[data-disc3d-spin]')){noteInteraction();setSpin(!state.spin,{remember:true});}
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

 // A clear disc filters the page behind it: its colour, read again whenever the host or the theme changes.
 const repaintBackdrop=()=>{if(state.clear){backdrop.color.set(pageColor(viewport));page.value.copy(backdrop.color);}};
 function attach(host){if(element.parentNode!==host)host.appendChild(element);repaintBackdrop();resize();request();}
 const themeChanged=()=>{
  if(state.props)update({...state.props,hand:state.hand});
  repaintBackdrop();
  // Paint before a theme View Transition captures its new snapshot (rAF is paused there).
  if(!disposed&&size.w)renderer.render(scene,camera);
  request();
 };
 window.addEventListener('atlas-theme-change',themeChanged);
 function dispose(){
  cancelRim();window.removeEventListener('blur',cancelRim);
  canvas.removeEventListener('pointerdown',pointerDown,true);canvas.removeEventListener('pointermove',pointerMove,true);
  canvas.removeEventListener('pointerup',pointerEnd,true);canvas.removeEventListener('pointercancel',pointerEnd,true);
  canvas.removeEventListener('lostpointercapture',lostCapture);canvas.removeEventListener('pointerleave',leaveRim);
  window.removeEventListener('atlas-theme-change',themeChanged);
  disposed=true;cancelAnimationFrame(frame);observer.disconnect();seen.disconnect();controls.dispose();
  photo?.userData.disposePhoto();
  body.geometry.dispose();stamp.geometry.dispose();bodyMaterial.dispose();rimMaterial.dispose();clayMaterial.dispose();clayRimMaterial.dispose();for(const part of [clearPlate,clearBand,clearHalo])part.dispose();backdrop.dispose();none.dispose();matcap.dispose();stampMaterial.map?.dispose();stampMaterial.dispose();
  envTexture.dispose();renderer.dispose();renderer.forceContextLoss();element.remove();
 }
 setTilt(0);
 // A remembered spin starts with the viewer, unless the reader asked for reduced motion: then only their tap starts it.
 if(spinRemembered()&&!reducedMotion())setSpin(true);
 return {element,attach,update,setView,flip,setTilt,setHand,getPose,applyPose,glidePose,setClay,setSpin,dispose,state,
  // For tests and tuning: the live objects and a synchronous draw.
  debug:{get photo(){return photo;},renderer,scene,camera,controls,body,stamp,bodyMaterial,rimMaterial,haloRimMaterial,clayMaterial,clayRimMaterial,profileFigure,tiltGroup,flipGroup,discGroup,spin,renderNow:()=>{tween&&(tween.start=-1e9);flipTween&&(flipTween.start=-1e9);render();}}};
}
