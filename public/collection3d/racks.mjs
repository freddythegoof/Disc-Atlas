// Storage racks: Freddy's rack (wooden-disc-rack.glb, built in Astra, real-world metres) holding the
// player's stored discs upright. One rack per 72 discs, side by side, as many as the collection needs.
//
// The GLB is wooden; the site is not. At load its wood, grain and normal map are swapped for powder-coated
// steel with terracotta front rails, and the finish follows the site theme (setTheme). One model, four looks.
//
// The GLB's own 72 placeholder discs are dropped; its DiscSlot nodes give each slot's rest position. Each
// stored disc is its mold's lathe from disc3d (PDGA dimensions; overmold molds in two colours), drawn as
// instances: one draw call per mold shape, so a few hundred discs stay cheap on a phone. The rack's
// parts merge into one mesh per finish (frame, trim, screws, feet): four draw calls a rack.
//
// A tapped disc lifts, clears the front rail and turns face out in front of its bay (rack-motion.mjs, the
// bag's timing), wearing its generic name stamp; tapping it again, or empty space, puts it back. The pulled
// disc and the hovered one carry a billboard name tag that stays readable while the racks turn.
import {THREE,SceneView,discParts,discColors,discMaterial,discModel,paintClear,stampStyleKey,contactShadow,disposeObject,reduced,ease} from './stage.mjs';
import {isClear,clearPart,clearBackdrop,pageColor,CLEAR_ORDER} from '../disc3d/clear.mjs';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {discPose,TOTAL_MS} from './rack-motion.mjs';
import {rackStyle} from '../bag-values.js';
import {RACK_CAPACITY,RACK_WIDTH,RACK_HEIGHT,RACK_DEPTH,rackCount,rackSlot,rackX,rowWidth,restHeight,pulledSpot} from './rack-layout.mjs';

const MOVE_MS=480,HOVER_LIFT=.014;
// Upright, flight plate facing +X (the lathe's +Y turned onto +X). The pull's quarter turn about Y then
// shows the plate, and its stamp, to the viewer.
const UPRIGHT=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-Math.PI/2);
// The pulled disc also spins a quarter turn about its own axis, so its stamp reads upright once it faces out.
const SPIN=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2);
const Y_AXIS=new THREE.Vector3(0,1,0),ONE=new THREE.Vector3(1,1,1),HIDDEN=new THREE.Matrix4().makeScale(0,0,0);
const lerp3=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);

// The rack's finish per site theme: matte powder-coated steel a step off the page, so the frame reads on
// every background, and terracotta front rails (the site's warm accent, distinct from the discs by
// lightness as well as hue). Discs keep their own colours.
export const RACK_FINISHES={
 light:{frame:'#3d4148',trim:'#a2523a',screws:'#9aa0a8',feet:'#16171a'},
 midnight:{frame:'#2e3746',trim:'#b25e3f',screws:'#7d8798',feet:'#07090d'},
 charcoal:{frame:'#383b41',trim:'#b25e3f',screws:'#868a92',feet:'#0b0c0e'},
 black:{frame:'#2c2c2e',trim:'#ad5a3c',screws:'#7c7c80',feet:'#040404'},
 // Paper and Dusk: the same steel, warmed a step toward their umber pages.
 paper:{frame:'#423d38',trim:'#a2523a',screws:'#a39b92',feet:'#1a1714'},
 dusk:{frame:'#3b342e',trim:'#b25e3f',screws:'#8c8278',feet:'#0c0a09'},
};
// A finish from the palette (bag-values.js RACK_STYLES) keeps its frame and trim on every theme; Match
// theme (auto) uses the theme's own. Screws and feet stay steel and black.
const finishOf=(theme,style)=>{const preset=rackStyle(style),base=RACK_FINISHES[theme]||RACK_FINISHES.light;return preset.frame?{...base,frame:preset.frame,trim:preset.trim}:base;};
// Each part of the GLB by name: the front retaining rails are the trim; sides, ledge, slats, dividers and
// rear rails are the frame. (GLTFLoader writes node names with underscores for spaces.)
function roleOf(o){
 const name=String(o.material?.name||''),node=`${o.name} ${o.parent?.name||''}`.replace(/_/g,' ');
 if(/screw/i.test(name))return 'screws';
 if(/feet|foot/i.test(name)||/foot/i.test(node))return 'feet';
 return /front retaining rail/i.test(node)?'trim':'frame';
}
const finishes={
 frame:new THREE.MeshStandardMaterial({metalness:.55,roughness:.52}),
 trim:new THREE.MeshStandardMaterial({metalness:.2,roughness:.48}),
 screws:new THREE.MeshStandardMaterial({metalness:.9,roughness:.32}),
 feet:new THREE.MeshStandardMaterial({metalness:0,roughness:.9}),
};
for(const m of Object.values(finishes))m.userData.shared=true;
function paint(theme,style){const f=finishOf(theme,style);for(const [role,m] of Object.entries(finishes))m.color.set(f[role]);}

let template=null;
function loadTemplate(url){
 return template||=new GLTFLoader().loadAsync(url).then(gltf=>{
  const root=gltf.scene;root.updateMatrixWorld(true);
  const byRole=new Map(),slots=[];
  root.traverse(o=>{
   if(!o.isMesh)return;
   if(o.userData.role==='disc'){slots[o.userData.discSlot]={slot:o.userData.discSlot,tier:o.userData.tier,bay:o.userData.bay,rest:o.getWorldPosition(new THREE.Vector3()).toArray()};return;}
   // Steel has no grain: keep only positions and normals (the wood's UVs fed its texture).
   const g=o.geometry.clone().applyMatrix4(o.matrixWorld);
   for(const name of Object.keys(g.attributes))if(!['position','normal'].includes(name))g.deleteAttribute(name);
   const role=roleOf(o);if(!byRole.has(role))byRole.set(role,[]);byRole.get(role).push(g);
  });
  if(slots.filter(Boolean).length!==RACK_CAPACITY)throw new Error('The rack model is missing disc slots.');
  const pieces=[...byRole].map(([role,list])=>{
   const indexed=list.every(g=>g.index),geometry=mergeGeometries(indexed?list:list.map(g=>g.index?g.toNonIndexed():g),false);
   geometry.computeBoundingSphere();list.forEach(g=>g.dispose());
   return {role,geometry,material:finishes[role]};
  });
  // The GLB's own materials (wood and its textures) and placeholder discs are not used; free them.
  root.traverse(o=>{if(!o.isMesh)return;if(o.userData.role==='disc')o.geometry.dispose();for(const m of [o.material].flat()){for(const k of ['map','normalMap','roughnessMap','metalnessMap'])m[k]?.dispose();m.dispose();}});
  return {pieces,slots};
 }).catch(error=>{template=null;throw error;});
}

/** Mount into a sized host. update(entries) places discs; entries are {id, d, color, rimColor, haloBand, haloModel, name, finish} in rack order. */
export async function mountRacks(host,{onPick=()=>{},onHover=()=>{},onCamera=()=>{},onZoom=()=>{},theme=document.documentElement.dataset.theme,style=null}={}){
 const {pieces,slots}=await loadTemplate(new URL('./wooden-disc-rack.glb',import.meta.url).href);
 paint(theme,style);let finish=theme,chosen=rackStyle(style).key;
 let view;
 const records=new Map(),batches=new Map(),rackGroups=[];
 // Out discs: the pulled one (goal 1) and any still gliding home (goal 0). One is out at a time.
 let hovered=null,focus=null,first=true,count=0;
 const outs=new Map();
 const pulledId=()=>{for(const [id,o] of outs)if(o.goal===1)return id;return null;};
 const material=discMaterial('#ffffff');
 // Clear copies (disc3d/clear.mjs) rack in batches of their own: the plate (and a band) hidden but still picked, and
 // the front wall's passes drawn on the same instances, tinted by each copy's own colour. One set for every batch.
 const hidden=Object.assign(material.clone(),{visible:false}),rackClear=clearPart(()=>discMaterial('#ffffff'),{walls:1}),rackBackdrop=clearBackdrop();
 const paintPage=()=>{const color=pageColor(host);rackBackdrop.color.set(color);rackClear.page.value.copy(rackBackdrop.color);for(const o of outs.values())if(o.proxy)paintClear(o.proxy,color);};
 view=new SceneView(host,{label:'Storage racks',yaw:.32,pitch:.2,yawLimit:.95,maxZoom:4,
  onTap:(p)=>tap(p),onHover:p=>hover(p),onCamera});
 view.onZoom=onZoom;
 view.light({keyShadow:view.stage.quality==='fine'?2048:1024});
 const shadow=contactShadow(1,1,1);view.scene.add(shadow);
 const racksRoot=new THREE.Group(),discRoot=new THREE.Group();view.scene.add(racksRoot,discRoot);
 // Billboard names: the pulled disc's, and the hovered disc's (which stays put through a drag).
 const pulledTag=view.tag(),hoverTag=view.tag(),anchor=new THREE.Vector3();
 function placeTags(){
  let shown=null,out=null;
  for(const o of outs.values())if(o.goal===1||(!out&&o.progress>0))out=o;
  if(out){const r=records.get(out.id);if(r){pulledTag.set(r.name);anchor.copy(out.proxy.position);anchor.y+=r.entry.radius+.006;pulledTag.at(anchor,Math.min(1,out.progress*1.6));shown=out.id;}}
  if(!shown)pulledTag.hide();
  const r=hovered&&hovered!==shown&&!outs.has(hovered)&&records.get(hovered);
  if(r){hoverTag.set(r.name);anchor.set(r.current[0],r.current[1]+r.lift+r.entry.radius+.004,r.current[2]);hoverTag.at(anchor);}else hoverTag.hide();
 }

 function ensureRacks(n){
  while(rackGroups.length<n){
   const group=new THREE.Group();
   for(const piece of pieces){const mesh=new THREE.Mesh(piece.geometry,piece.material);mesh.castShadow=piece.role!=='screws';mesh.receiveShadow=true;mesh.userData.sharedGeometry=true;mesh.userData.part=piece.role;group.add(mesh);}
   group.userData.rack=rackGroups.length;racksRoot.add(group);rackGroups.push(group);
  }
  while(rackGroups.length>n){const group=rackGroups.pop();racksRoot.remove(group);}
  rackGroups.forEach((group,i)=>group.position.x=rackX(i,n));
  shadow.scale.set(rowWidth(n)+.45,.75,1);
 }
 // `key`: the parts' key, with '|clear' for a batch of clear copies.
 const batchKey=(entry,finish)=>entry.key+(isClear(finish)?'|clear':'');
 function dropBatch(batch){for(const mesh of [batch.plate,batch.rim,...batch.passes])if(mesh){discRoot.remove(mesh);mesh.dispose();}}
 function batchFor(entry,needed,key=entry.key){
  let batch=batches.get(key);
  if(batch&&batch.capacity>=needed)return batch;
  const capacity=Math.max(4,2**Math.ceil(Math.log2(needed))),clear=key!==entry.key;
  if(batch)dropBatch(batch);
  const make=(geometry,m=material)=>{const mesh=new THREE.InstancedMesh(geometry,m,capacity);mesh.castShadow=m.visible;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.count=0;mesh.userData.sharedGeometry=true;discRoot.add(mesh);return mesh;};
  batch={entry,capacity,clear,plate:make(entry.plate,clear?hidden:material),rim:entry.rim?make(entry.rim,clear&&!entry.overmold?hidden:material):null,ids:[],passes:[]};
  // The passes share their piece's instance matrices and colours (synced in update; the backdrop takes no colour).
  if(clear)for(const piece of [batch.plate,!entry.overmold&&batch.rim].filter(Boolean))for(const [m,order] of [[rackBackdrop,CLEAR_ORDER.backdrop],[rackClear.walls[0].filter,CLEAR_ORDER.front],[rackClear.walls[0].shine,CLEAR_ORDER.front+.5]]){
   const pass=make(piece.geometry,m);pass.castShadow=pass.receiveShadow=false;pass.renderOrder=order;pass.raycast=()=>{};pass.userData.piece=piece;batch.passes.push(pass);
  }
  batches.set(key,batch);return batch;
 }
 const matrix=new THREE.Matrix4(),position=new THREE.Vector3(),color=new THREE.Color();
 function writeMatrix(r){
  const batch=batches.get(r.batch);
  if(outs.has(r.id))matrix.copy(HIDDEN);
  else{position.set(r.current[0],r.current[1]+r.lift,r.current[2]);matrix.compose(position,UPRIGHT,ONE);}
  batch.plate.setMatrixAt(r.index,matrix);if(batch.rim)batch.rim.setMatrixAt(r.index,matrix);
  batch.plate.instanceMatrix.needsUpdate=true;if(batch.rim)batch.rim.instanceMatrix.needsUpdate=true;
  batch.dirty=true;
 }
 function restOf(i,entry){
  const {rack,slot,bay}=rackSlot(i),rest=slots[slot].rest,x=rackX(rack,count);
  return {rack,slot,bayX:x+(bay-1)*.30,rest:[x+rest[0],restHeight(rest[1],entry.radius),rest[2]]};
 }
 // The box the camera frames: every rack, or one, with room in front for a pulled disc.
 function box(rack=focus){
  const half=rack==null?rowWidth(count)/2:RACK_WIDTH/2,cx=rack==null?0:rackX(rack,count);
  return new THREE.Box3(new THREE.Vector3(cx-half-.04,0,-RACK_DEPTH/2),new THREE.Vector3(cx+half+.04,RACK_HEIGHT,.52));
 }

 function update(entries){
  const before=count;count=rackCount(entries.length);ensureRacks(count);
  const now=performance.now(),animate=!first&&!reduced(),seen=new Set();
  for(const batch of batches.values())batch.ids=[];
  if(entries.some(e=>isClear(e.finish)))paintPage();
  const needs=new Map();
  for(const e of entries){const entry=discParts(e.d,undefined,!!e.haloBand);e.parts=entry;e.batch=batchKey(entry,e.finish);needs.set(e.batch,(needs.get(e.batch)||0)+1);}
  for(const [key,n] of needs)batchFor(entries.find(e=>e.batch===key).parts,n,key);
  entries.forEach((e,i)=>{
   const entry=e.parts,batch=batches.get(e.batch),place=restOf(i,entry);
   let r=records.get(e.id);
   const target=place.rest;
   // A new disc slides in from the front of its slot.
   if(!r){r={id:e.id,lift:0,liftGoal:0,current:animate?[target[0],target[1]+.03,target[2]+.36]:[...target]};records.set(e.id,r);r.fresh=animate;}
   const moved=r.to&&(r.to.some((v,k)=>Math.abs(v-target[k])>1e-6)||r.entry?.key!==entry.key);
   Object.assign(r,{entry,batch:e.batch,finish:e.finish,name:e.name,d:e.d,photoURL:e.photoURL,haloModel:e.haloModel||null,index:batch.ids.length,rack:place.rack,slot:place.slot,bayX:place.bayX,to:target,colors:discColors(entry,e.color,e.rimColor,e.haloBand)});
   if(r.fresh||(moved&&animate)){r.from=[...r.current];r.t0=now;r.fresh=false;}else if(!r.t0)r.current=[...target];
   batch.ids.push(e.id);seen.add(e.id);
   batch.plate.setColorAt(r.index,color.set(r.colors.plate));if(batch.rim)batch.rim.setColorAt(r.index,color.set(r.colors.rim));
  });
  for(const id of [...records.keys()])if(!seen.has(id))records.delete(id);
  for(const [key,batch] of batches){
   batch.plate.count=batch.ids.length;if(batch.rim)batch.rim.count=batch.ids.length;
   if(batch.plate.instanceColor)batch.plate.instanceColor.needsUpdate=true;if(batch.rim?.instanceColor)batch.rim.instanceColor.needsUpdate=true;
   for(const pass of batch.passes){const piece=pass.userData.piece;pass.count=piece.count;pass.instanceMatrix=piece.instanceMatrix;if(pass.material!==rackBackdrop)pass.instanceColor=piece.instanceColor;}
   if(!batch.ids.length){dropBatch(batch);batches.delete(key);}
  }
  for(const r of records.values())writeMatrix(r);
  for(const [id,o] of outs){const r=records.get(id);if(!r){drop(id);continue;}o.rest=r.to;o.target=pulledTarget(r);restyle(o,r);}
  if(pulledId())host.dataset.pulled=pulledId();else delete host.dataset.pulled;
  if(hovered&&!records.has(hovered))hovered=null;
  if(focus!=null&&focus>=count)focus=null;
  if(first||before!==count)view.frame(box(),{instant:first||reduced()});
  view.aimShadow(box(null));
  host.dataset.racks=String(count);host.dataset.discs=String(entries.length);
  first=false;view.shadowsDirty=true;view.request();
 }
 const pulledTarget=r=>{const s=pulledSpot(r.to,{bayX:r.bayX});return s;};
 function restyle(p,r){
  // A recolour or a new mold while out: rebuild the proxy in place.
  const key=JSON.stringify([r.entry.key,r.colors,r.haloModel,r.name,r.photoURL,stampStyleKey(),isClear(r.finish)]);if(p.key===key)return;
  const next=discModel(r.d,{color:r.colors.plate,rimColor:r.colors.rim,haloBand:r.entry.band?r.colors.rim:null,haloModel:r.entry.band?r.haloModel:null,name:r.name,photoURL:r.photoURL,finish:r.finish,onChange:()=>view.request()});
  paintClear(next,pageColor(host));
  if(p.proxy){next.position.copy(p.proxy.position);next.quaternion.copy(p.proxy.quaternion);discRoot.remove(p.proxy);disposeObject(p.proxy);}
  p.proxy=next;p.key=key;discRoot.add(next);
 }
 function pull(id){
  const r=records.get(id);if(!r)return false;
  for(const [other,o] of outs)if(other!==id)o.goal=0;
  let o=outs.get(id);
  if(!o){o={id,progress:0,rest:r.to,target:pulledTarget(r)};outs.set(id,o);restyle(o,r);}
  o.goal=1;o.last=undefined;if(reduced())settleOuts();
  if(hovered===id)hovered=null;r.liftGoal=0;r.lift=0;writeMatrix(r);
  host.dataset.pulled=id;view.request();return true;
 }
 function putBack(){for(const o of outs.values()){o.goal=0;o.last=undefined;}if(reduced())settleOuts();delete host.dataset.pulled;view.request();}
 // Reduced motion: out discs jump straight to their ends.
 function settleOuts(){for(const [id,o] of outs){o.progress=o.goal;if(!o.goal)drop(id);}}
 function drop(id){
  const o=outs.get(id);if(!o)return;outs.delete(id);
  if(o.proxy){discRoot.remove(o.proxy);disposeObject(o.proxy);}
  const r=records.get(id);if(r)writeMatrix(r);
 }
 function idAt(p){
  const objects=[racksRoot,...[...batches.values()].flatMap(b=>[b.plate,b.rim].filter(Boolean)),...[...outs.values()].map(o=>o.proxy)];
  const hit=view.pick(p,objects)[0];if(!hit)return null;
  for(const o of outs.values())if(isInside(hit.object,o.proxy))return o.id;
  if(hit.object.isInstancedMesh){for(const b of batches.values())if(b.plate===hit.object||b.rim===hit.object)return b.ids[hit.instanceId]??null;}
  return null;
 }
 const isInside=(o,root)=>{for(let n=o;n;n=n.parent)if(n===root)return true;return false;};
 function tap(p){
  const id=idAt(p);
  if(id&&pulledId()===id){putBack();onPick(null);return;}
  if(id){pull(id);onPick(id);return;}
  if(pulledId()){putBack();onPick(null);}
 }
 function hover(p){
  const id=p?idAt(p):null;
  if(id!==hovered){
   if(hovered&&records.has(hovered))records.get(hovered).liftGoal=0;
   hovered=id;if(id&&!outs.has(id))records.get(id).liftGoal=HOVER_LIFT;
   host.style.cursor=id?'pointer':'';view.request();
  }
  onHover(id,p);
 }
 // Motion: slot moves, hover lifts and the pull path. Returns true while anything is still moving.
 view.ticks.add(now=>{
  let more=false;
  for(const r of records.values()){
   let changed=false;
   if(r.t0){const t=Math.min(1,(now-r.t0)/MOVE_MS);r.current=lerp3(r.from,r.to,ease(t));changed=true;if(t>=1){r.t0=0;r.current=[...r.to];}else more=true;}
   if(r.lift!==r.liftGoal){const step=.0015;r.lift=Math.abs(r.liftGoal-r.lift)<=step||reduced()?r.liftGoal:r.lift+Math.sign(r.liftGoal-r.lift)*step;changed=true;more=true;}
   if(changed)writeMatrix(r);
  }
  for(const b of batches.values())if(b.dirty){b.dirty=false;b.plate.computeBoundingSphere();b.rim?.computeBoundingSphere();}
  for(const [id,o] of outs){
   const step=(now-(o.last??now))/TOTAL_MS;o.last=now;
   if(o.progress!==o.goal){o.progress=o.goal>o.progress?Math.min(o.goal,o.progress+step):Math.max(o.goal,o.progress-step);more=true;}
   const pose=discPose(o.rest,o.target,o.progress,1);
   o.proxy.position.fromArray(pose.position);
   o.proxy.quaternion.setFromAxisAngle(Y_AXIS,pose.turn).multiply(UPRIGHT).multiply(SPIN);
   if(o.goal===0&&o.progress===0)drop(id);else if(o.progress===o.goal)o.last=undefined;
  }
  placeTags();
  return more;
 });

 return {
  update,pull,putBack,
  show(){view.show();},hide(){view.hide();},
  // Frame one rack (0-based) or, with null, the whole row.
  focusRack(rack){focus=rack==null||rack>=count?null:rack;view.frame(box());onCamera();},
  zoomBy(f){view.setZoom(view.zoom*f);},zoomTo(z){view.setZoom(z);},get zoom(){return view.zoom;},
  turnBy(rad){view.turnBy(rad);},
  // Repaint the rack for a site theme (any of theme.js's six); the discs keep their colours.
  setTheme(theme){if(theme===finish)return;finish=theme;paint(finish,chosen);paintPage();view.request();},
  // The player's finish from the palette (a RACK_STYLES key; null or auto follows the theme).
  setStyle(style){const key=rackStyle(style).key;if(key===chosen)return;chosen=key;paint(finish,chosen);view.request();},
  // A disc's centre in canvas CSS px (tests and the name pill).
  project(id){const r=records.get(id);if(!r)return null;const o=outs.get(id);return view.project(o?o.proxy.position.clone():new THREE.Vector3(...r.current));},
  // The billboard names on show, with their canvas positions (tests).
  get tags(){return [pulledTag,hoverTag].filter(t=>t.shown).map(t=>({text:t.text,...view.project(t.sprite.position)}));},
  get finish(){return {theme:finish,style:chosen,...Object.fromEntries(Object.entries(finishes).map(([k,m])=>[k,'#'+m.color.getHexString()]))};},
  get state(){return {racks:count,discs:records.size,pulled:pulledId(),moving:[...outs.values()].some(o=>o.progress!==o.goal)||[...records.values()].some(r=>r.t0),batches:batches.size,focus,zoom:view.zoom,quality:view.stage.quality,frames:view.frames||0};},
  get info(){const i=view.stage.renderer.info.render;return {calls:i.calls,triangles:i.triangles};},
  get size(){return {...view.size};},
  dispose(){for(const b of batches.values())dropBatch(b);for(const id of [...outs.keys()])drop(id);view.dispose();material.dispose();hidden.dispose();rackClear.dispose();rackBackdrop.dispose();},
 };
}
