// Interactive 3D disc (Plan 09, phase 1): the procedural profile from shape.mjs spun by LatheGeometry,
// with drag to turn, scroll or pinch to zoom, preset views (3/4, top, profile, bottom), flip, and a
// hyzer/anhyzer tilt. One renderer is reused for every disc; it draws only when something moves.
//
// createDiscViewer() returns {element, attach(host), update(props), setView(name), flip(), setTilt(deg),
// setHand(hand), dispose()}. Props: {model, specs, flight, mold, color, plastic, hand, manufacturer, record,
// overmold, colors}. `model` is explicit shape parameters (d.model3d); otherwise the mold's PDGA `specs` set
// its shape (phase 2), and without them the Phase 1 generic shape comes from `flight` {speed, turn, fade}.
// `mold` is the name set as a generic text stamp: never manufacturer artwork.
// Overmold discs (Plan 12) draw the rim and the flight plate in two materials, split at the measured rim
// width. `overmold` (boolean) is the record's own flag; without it the PDGA `manufacturer` and `record` name
// are looked up in overmold.mjs. `colors` {rim, plate} are optional overrides of the two colours; the
// defaults come from `color`. Every other disc is one material, as before.
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {discProfile,overmoldProfile,shapeForDisc,shapeFrame,topHeight} from './shape.mjs';
import {isOvermold,overmoldColors} from './overmold.mjs';

const DEG=Math.PI/180;
// Finishes only (a picker is phase 3): premium is glossy, base is matte.
const PLASTICS={
 premium:{roughness:.3,clearcoat:.6,clearcoatRoughness:.22},
 base:{roughness:.62,clearcoat:.06,clearcoatRoughness:.6},
};
// Camera elevations measured from straight above. The 3/4 view is the default: from behind and above,
// as the thrower sees the disc, so the hyzer/anhyzer tilt reads left/right. Bottom looks up from 35° off
// the axis: straight up, the cavity reads as a flat plate; at an angle the inner rim wall shows.
export const VIEWS={angle:{polar:60*DEG,label:'3/4'},top:{polar:.0001,label:'Top'},profile:{polar:90*DEG,label:'Profile'},bottom:{polar:145*DEG,label:'Bottom'}};
export const MAX_TILT=40;
// The camera frames a fixed 22 cm disc, so molds show at true scale: a 21.7 cm Buzzz stands wider than a
// 21.1 cm Destroyer. Anything larger is framed by its own diameter.
export const FRAME_DIAMETER=22;
// LatheGeometry writes two triangles per (segment, profile edge), edges varying fastest. Reorder them into
// two groups, the plate (material 0) then the rim (material 1, edges rim[0] to rim[1] − 1). The vertices and
// their normals are untouched, so the seam shades smoothly.
function groupRim(geometry,count,[from,to]){
 const index=geometry.index.array,edges=count-1,plate=[],rim=[];
 for(let k=0;k<index.length;k+=6){const e=(k/6)%edges,out=e>=from&&e<to?rim:plate;for(let i=k;i<k+6;i++)out.push(index[i]);}
 geometry.setIndex([...plate,...rim]);
 geometry.addGroup(0,plate.length,0);geometry.addGroup(plate.length,rim.length,1);
}
const SOURCE_TEXT={model:'its mold profile',pdga:'its PDGA dimensions, to scale',flight:'a generic shape from its flight numbers'};
// The edge that drops on hyzer is the fade side: left for RHBH and LHFH, right for RHFH and LHBH.
export const hyzerSign=hand=>hand==='RHFH'||hand==='LHBH'?-1:1;

const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const angleDelta=(a,b)=>{let d=(b-a)%(2*Math.PI);if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;return d;};

function stampTexture(name,color){
 const size=512,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const g=canvas.getContext('2d'),c=new THREE.Color(color),hsl={};c.getHSL(hsl,THREE.SRGBColorSpace);
 const ink=hsl.l>.55?'rgba(18,22,28,.72)':'rgba(255,255,255,.78)';
 g.strokeStyle=ink;g.fillStyle=ink;g.lineWidth=5;
 g.beginPath();g.arc(size/2,size/2,size*.44,0,Math.PI*2);g.stroke();
 g.lineWidth=3;g.beginPath();g.arc(size/2,size/2,size*.405,0,Math.PI*2);g.stroke();
 const text=String(name||'').toUpperCase().slice(0,22);
 const family=getComputedStyle(document.body).fontFamily||'sans-serif';
 let px=104;g.font=`800 ${px}px ${family}`;
 while(px>34&&g.measureText(text).width>size*.7){px-=4;g.font=`800 ${px}px ${family}`;}
 g.textAlign='center';g.textBaseline='middle';g.fillText(text,size/2,size/2);
 g.fillRect(size*.34,size/2+px*.62,size*.32,4);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 return texture;
}

export function createDiscViewer({segments}={}){
 const coarse=matchMedia('(pointer: coarse)').matches;
 const radial=segments||(coarse?56:80);
 const element=document.createElement('div');element.className='disc3d-viewer';
 element.innerHTML=`<div class="disc3d-viewport"><canvas class="disc3d-canvas" tabindex="0" role="img"></canvas><span class="disc3d-hint" aria-hidden="true">Drag to turn · scroll to zoom</span></div>
<div class="disc3d-toolbar"><div class="disc3d-views" role="group" aria-label="Preset views">${Object.entries(VIEWS).map(([k,v])=>`<button type="button" data-disc3d-view="${k}" aria-pressed="${k==='angle'}">${v.label}</button>`).join('')}</div><button type="button" data-disc3d-flip aria-pressed="false">Flip</button></div>
<label class="disc3d-tilt"><span class="disc3d-tilt-end">Anhyzer</span><input type="range" min="${-MAX_TILT}" max="${MAX_TILT}" step="1" value="0" data-disc3d-tilt aria-label="Release angle, anhyzer to hyzer"><span class="disc3d-tilt-end">Hyzer</span><output data-disc3d-tilt-value>Flat</output></label>`;
 const canvas=element.querySelector('canvas'),viewport=element.querySelector('.disc3d-viewport');
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
 const stampMaterial=new THREE.MeshStandardMaterial({transparent:true,roughness:.5,metalness:.15,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 // Overmold discs only: bodyMaterial becomes the flight plate and rimMaterial the rim.
 const rimMaterial=new THREE.MeshPhysicalMaterial({color:0x444444,side:THREE.FrontSide});
 const body=new THREE.Mesh(new THREE.BufferGeometry(),bodyMaterial),stamp=new THREE.Mesh(new THREE.BufferGeometry(),stampMaterial);
 discGroup.add(body,stamp);

 const state={key:'',hand:'RHBH',tilt:0,flipped:false,view:'angle',radius:10.6,frameRadius:FRAME_DIAMETER/2,source:'',overmold:false,colors:null,seamRadius:null,thickness:2,fit:40,props:null,frames:0};
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

 function build(shape,mold,color,overmold){
  let geometry;
  if(overmold){
   const split=overmoldProfile(shape);
   geometry=new THREE.LatheGeometry(split.points.map(p=>new THREE.Vector2(p.x,p.y)),radial);
   groupRim(geometry,split.points.length,split.rim);
   body.material=[bodyMaterial,rimMaterial];state.seamRadius=split.seamRadius;
  }else{
   const profile=discProfile(shape).map(p=>new THREE.Vector2(p.x,p.y));
   geometry=new THREE.LatheGeometry(profile,radial);
   body.material=bodyMaterial;state.seamRadius=null;
  }
  geometry.computeBoundingBox();const box=geometry.boundingBox;
  body.geometry.dispose();body.geometry=geometry;
  // The stamp rides the top surface, inside the shoulder, on a ring mesh fine enough to follow the dome.
  const {Rs}=shapeFrame(shape),stampR=Math.min(Rs*.78,6.2);
  const ring=new THREE.RingGeometry(.001,stampR,48,8);ring.rotateX(-Math.PI/2);
  const pos=ring.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,topHeight(shape,Math.hypot(x,z))+.012);}
  ring.computeVertexNormals();
  stamp.geometry.dispose();stamp.geometry=ring;
  stampMaterial.map?.dispose();stampMaterial.map=stampTexture(mold,color);stampMaterial.needsUpdate=true;
  // Centre the disc on the orbit target.
  discGroup.position.y=-(box.min.y+box.max.y)/2;
  state.radius=shape.diameter/2;state.frameRadius=Math.max(state.radius,FRAME_DIAMETER/2);state.thickness=box.max.y-box.min.y;
 }

 function update(props={}){
  const resolved=shapeForDisc(props);
  if(!resolved)return false;
  const {shape,source}=resolved;
  const overmold=isOvermold(props),colors=overmold?overmoldColors(props.color,props.colors):null;
  // The stamp sits on the plate, so its ink follows the plate colour.
  const color=colors?colors.plate:props.color||'#8a8f98',plastic=PLASTICS[props.plastic]||PLASTICS.premium;
  const key=JSON.stringify([shape,props.mold,color,props.plastic,colors]);
  if(props.hand&&props.hand!==state.hand)setHand(props.hand);
  if(key===state.key)return true;
  const sourceOf=p=>JSON.stringify([p?.model,p?.specs,p?.flight]);
  const discChanged=state.props?.mold!==props.mold||sourceOf(state.props)!==sourceOf(props);
  state.key=key;state.props=props;state.source=source;state.overmold=overmold;state.colors=colors;
  build(shape,props.mold,color,overmold);
  bodyMaterial.color.set(color);Object.assign(bodyMaterial,plastic);bodyMaterial.needsUpdate=true;
  if(overmold){rimMaterial.color.set(colors.rim);Object.assign(rimMaterial,plastic);rimMaterial.needsUpdate=true;}
  canvas.setAttribute('aria-label',`3D model of the ${props.mold||'disc'}, built from ${SOURCE_TEXT[source]}${overmold?', with its overmold rim in a second colour':''}. Drag or use the arrow keys to turn it, scroll or use + and − to zoom.`);
  // A new disc starts face up in the 3/4 view; a recolour of the same disc keeps the reader's view.
  if(discChanged){
   state.flipped=false;flipTween=null;flipGroup.rotation.x=0;element.querySelector('[data-disc3d-flip]').setAttribute('aria-pressed','false');
   if(size.w)setZoomRange();
   setView('angle',{instant:true});
  }
  request();return true;
 }

 element.addEventListener('click',e=>{
  const v=e.target.closest('[data-disc3d-view]');if(v){noteInteraction();setView(v.dataset.disc3dView);}
  if(e.target.closest('[data-disc3d-flip]')){noteInteraction();flip();}
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
 function dispose(){
  disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();
  body.geometry.dispose();stamp.geometry.dispose();bodyMaterial.dispose();rimMaterial.dispose();stampMaterial.map?.dispose();stampMaterial.dispose();
  envTexture.dispose();renderer.dispose();element.remove();
 }
 setTilt(0);
 return {element,attach,update,setView,flip,setTilt,setHand,dispose,state,
  // For tests and tuning: the live objects and a synchronous draw.
  debug:{renderer,scene,camera,controls,body,stamp,bodyMaterial,rimMaterial,tiltGroup,flipGroup,renderNow:()=>{tween&&(tween.start=-1e9);flipTween&&(flipTween.start=-1e9);render();}}};
}
