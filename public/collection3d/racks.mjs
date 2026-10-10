// Storage racks: Freddy's wooden rack (wooden-disc-rack.glb, built in Astra, real-world metres) holding
// the player's stored discs upright. One rack per 72 discs, side by side, as many as the collection needs.
//
// The GLB's own 72 placeholder discs are dropped; its DiscSlot nodes give each slot's rest position. Each
// stored disc is its mold's lathe from disc3d (PDGA dimensions; overmold molds in two colours), drawn as
// instances: one draw call per mold shape, so a few hundred discs stay cheap on a phone. The rack's
// boards merge into one mesh per material (wood, screws, feet): three draw calls a rack.
//
// A tapped disc lifts, clears the front rail and turns face out in front of its bay (rack-motion.mjs, the
// bag's timing), wearing its generic name stamp; tapping it again, or empty space, puts it back.
import {THREE,SceneView,discParts,discColors,discMaterial,discModel,contactShadow,disposeObject,reduced,ease} from './stage.mjs';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {discPose,TOTAL_MS,DEFAULT_RACK_COLOR} from './rack-motion.mjs';
import {RACK_CAPACITY,RACK_WIDTH,RACK_HEIGHT,RACK_DEPTH,rackCount,rackSlot,rackX,rowWidth,restHeight,pulledSpot} from './rack-layout.mjs';

const MOVE_MS=480,HOVER_LIFT=.014;
// Upright, flight plate facing +X (the lathe's +Y turned onto +X). The pull's quarter turn about Y then
// shows the plate, and its stamp, to the viewer.
const UPRIGHT=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-Math.PI/2);
// The pulled disc also spins a quarter turn about its own axis, so its stamp reads upright once it faces out.
const SPIN=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2);
const Y_AXIS=new THREE.Vector3(0,1,0),ONE=new THREE.Vector3(1,1,1),HIDDEN=new THREE.Matrix4().makeScale(0,0,0);
const lerp3=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);

let template=null;
function loadTemplate(url){
 return template||=new GLTFLoader().loadAsync(url).then(gltf=>{
  const root=gltf.scene;root.updateMatrixWorld(true);
  const byMaterial=new Map(),slots=[];
  root.traverse(o=>{
   if(!o.isMesh)return;
   if(o.userData.role==='disc'){slots[o.userData.discSlot]={slot:o.userData.discSlot,tier:o.userData.tier,bay:o.userData.bay,rest:o.getWorldPosition(new THREE.Vector3()).toArray()};return;}
   const g=o.geometry.clone().applyMatrix4(o.matrixWorld);
   for(const name of Object.keys(g.attributes))if(!['position','normal','uv'].includes(name))g.deleteAttribute(name);
   if(!byMaterial.has(o.material))byMaterial.set(o.material,[]);byMaterial.get(o.material).push(g);
  });
  if(slots.filter(Boolean).length!==RACK_CAPACITY)throw new Error('The rack model is missing disc slots.');
  const pieces=[...byMaterial].map(([material,list])=>{
   const indexed=list.every(g=>g.index),geometry=mergeGeometries(indexed?list:list.map(g=>g.index?g.toNonIndexed():g),false);
   geometry.computeBoundingSphere();material.userData.shared=true;material.userData.sharedMaps=true;
   if(material.userData.role==='rack-color')material.color.set(DEFAULT_RACK_COLOR);
   return {geometry,material};
  });
  // Placeholder disc geometry and materials are not used; free them.
  root.traverse(o=>{if(o.isMesh&&o.userData.role==='disc'){o.geometry.dispose();o.material.dispose();}});
  return {pieces,slots};
 }).catch(error=>{template=null;throw error;});
}

/** Mount into a sized host. update(entries) places discs; entries are {id, d, color, rimColor, name} in rack order. */
export async function mountRacks(host,{onPick=()=>{},onHover=()=>{},onCamera=()=>{},onZoom=()=>{}}={}){
 const {pieces,slots}=await loadTemplate(new URL('./wooden-disc-rack.glb',import.meta.url).href);
 let view;
 const records=new Map(),batches=new Map(),rackGroups=[];
 // Out discs: the pulled one (goal 1) and any still gliding home (goal 0). One is out at a time.
 let hovered=null,focus=null,first=true,count=0;
 const outs=new Map();
 const pulledId=()=>{for(const [id,o] of outs)if(o.goal===1)return id;return null;};
 const material=discMaterial('#ffffff');
 view=new SceneView(host,{label:'Storage racks',yaw:.32,pitch:.2,yawLimit:.95,maxZoom:4,
  onTap:(p)=>tap(p),onHover:p=>hover(p),onCamera});
 view.onZoom=onZoom;
 view.light({keyShadow:view.stage.quality==='fine'?2048:1024});
 const shadow=contactShadow(1,1,1);view.scene.add(shadow);
 const racksRoot=new THREE.Group(),discRoot=new THREE.Group();view.scene.add(racksRoot,discRoot);

 function ensureRacks(n){
  while(rackGroups.length<n){
   const group=new THREE.Group();
   for(const piece of pieces){const mesh=new THREE.Mesh(piece.geometry,piece.material);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.sharedGeometry=true;group.add(mesh);}
   group.userData.rack=rackGroups.length;racksRoot.add(group);rackGroups.push(group);
  }
  while(rackGroups.length>n){const group=rackGroups.pop();racksRoot.remove(group);}
  rackGroups.forEach((group,i)=>group.position.x=rackX(i,n));
  shadow.scale.set(rowWidth(n)+.45,.75,1);
 }
 function batchFor(entry,needed){
  let batch=batches.get(entry.key);
  if(batch&&batch.capacity>=needed)return batch;
  const capacity=Math.max(4,2**Math.ceil(Math.log2(needed)));
  if(batch){discRoot.remove(batch.plate);batch.plate.dispose();if(batch.rim){discRoot.remove(batch.rim);batch.rim.dispose();}}
  const make=geometry=>{const mesh=new THREE.InstancedMesh(geometry,material,capacity);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.count=0;mesh.userData.sharedGeometry=true;discRoot.add(mesh);return mesh;};
  batch={entry,capacity,plate:make(entry.plate),rim:entry.rim?make(entry.rim):null,ids:[]};
  batches.set(entry.key,batch);return batch;
 }
 const matrix=new THREE.Matrix4(),position=new THREE.Vector3(),color=new THREE.Color();
 function writeMatrix(r){
  const batch=batches.get(r.entry.key);
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
  const needs=new Map();
  for(const e of entries){const entry=discParts(e.d);needs.set(entry.key,(needs.get(entry.key)||0)+1);e.parts=entry;}
  for(const [key,n] of needs)batchFor(entries.find(e=>e.parts.key===key).parts,n);
  entries.forEach((e,i)=>{
   const entry=e.parts,batch=batches.get(entry.key),place=restOf(i,entry);
   let r=records.get(e.id);
   const target=place.rest;
   // A new disc slides in from the front of its slot.
   if(!r){r={id:e.id,lift:0,liftGoal:0,current:animate?[target[0],target[1]+.03,target[2]+.36]:[...target]};records.set(e.id,r);r.fresh=animate;}
   const moved=r.to&&(r.to.some((v,k)=>Math.abs(v-target[k])>1e-6)||r.entry?.key!==entry.key);
   Object.assign(r,{entry,name:e.name,d:e.d,index:batch.ids.length,rack:place.rack,slot:place.slot,bayX:place.bayX,to:target,colors:discColors(entry,e.color,e.rimColor)});
   if(r.fresh||(moved&&animate)){r.from=[...r.current];r.t0=now;r.fresh=false;}else if(!r.t0)r.current=[...target];
   batch.ids.push(e.id);seen.add(e.id);
   batch.plate.setColorAt(r.index,color.set(r.colors.plate));if(batch.rim)batch.rim.setColorAt(r.index,color.set(r.colors.rim));
  });
  for(const id of [...records.keys()])if(!seen.has(id))records.delete(id);
  for(const [key,batch] of batches){
   batch.plate.count=batch.ids.length;if(batch.rim)batch.rim.count=batch.ids.length;
   if(batch.plate.instanceColor)batch.plate.instanceColor.needsUpdate=true;if(batch.rim?.instanceColor)batch.rim.instanceColor.needsUpdate=true;
   if(!batch.ids.length){discRoot.remove(batch.plate);batch.plate.dispose();if(batch.rim){discRoot.remove(batch.rim);batch.rim.dispose();}batches.delete(key);}
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
  const key=JSON.stringify([r.entry.key,r.colors,r.name]);if(p.key===key)return;
  const next=discModel(r.d,{color:r.colors.plate,rimColor:r.colors.rim,name:r.name});
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
  return more;
 });

 return {
  update,pull,putBack,
  show(){view.show();},hide(){view.hide();},
  // Frame one rack (0-based) or, with null, the whole row.
  focusRack(rack){focus=rack==null||rack>=count?null:rack;view.frame(box());onCamera();},
  zoomBy(f){view.setZoom(view.zoom*f);},zoomTo(z){view.setZoom(z);},get zoom(){return view.zoom;},
  turnBy(rad){view.turnBy(rad);},
  // A disc's centre in canvas CSS px (tests and the name pill).
  project(id){const r=records.get(id);if(!r)return null;const o=outs.get(id);return view.project(o?o.proxy.position.clone():new THREE.Vector3(...r.current));},
  get state(){return {racks:count,discs:records.size,pulled:pulledId(),moving:[...outs.values()].some(o=>o.progress!==o.goal)||[...records.values()].some(r=>r.t0),batches:batches.size,focus,zoom:view.zoom,quality:view.stage.quality,frames:view.frames||0};},
  get info(){const i=view.stage.renderer.info.render;return {calls:i.calls,triangles:i.triangles};},
  get size(){return {...view.size};},
  dispose(){for(const b of batches.values()){b.plate.dispose();b.rim?.dispose();}for(const id of [...outs.keys()])drop(id);view.dispose();material.dispose();},
 };
}
