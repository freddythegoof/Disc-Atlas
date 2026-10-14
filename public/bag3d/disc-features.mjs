import { createDiscState } from './disc-state.mjs';
import {shapeForDisc,normalizeShape} from '../disc3d/shape.mjs';
import {isOvermold} from '../disc3d/overmold.mjs';
import {discGeometry} from '../disc3d/mesh.mjs';
import {DISC} from './bag-layout.mjs';

// The canonical per-mold profile and overmold split, fitted to the bag's existing slot envelope.
// The lathe's +Y plate becomes +X, matching the GLB discs and all pocket/slide poses.
export function bagDiscGeometry(d,low=false){
 const shape=shapeForDisc({model:d?.model3d||null,specs:d?.specs||null,flight:{speed:d?.speed,turn:d?.turn,fade:d?.fade}})?.shape||normalizeShape({});
 const overmold=!!d&&isOvermold({...d,record:d.name});
 const {geometry}=discGeometry(shape,{segments:low?20:40,detail:low ? .3 : .5,overmold});
 geometry.computeBoundingBox();
 const box=geometry.boundingBox,thickness=box.max.y-box.min.y,center=(box.min.y+box.max.y)/2;
 geometry.translate(0,-(box.min.y+box.max.y)/2,0);
 geometry.scale(DISC.radius*2/shape.diameter,DISC.thickness/thickness,DISC.radius*2/shape.diameter);
 geometry.rotateZ(-Math.PI/2);geometry.computeBoundingSphere();geometry.computeBoundingBox();
 return {geometry,overmold,shape,center,thickness};
}

/** Operates on the named GLB disc nodes; the shell and animation are untouched. */
export function attachDiscFeatures(THREE, root, { onChange=()=>{} }={}) {
  const records=[], placeholders=[], accents=[], originalMaterials=new Set();
  root.traverse(object => {
    if (object.isMesh && Number.isInteger(object.userData.discSlot)) {
      originalMaterials.add(object.material);
      const material=object.material.clone();
      object.material=material;
      records.push({ slot:object.userData.discSlot, object, material,
        position:object.position.clone(), quaternion:object.quaternion.clone(), scale:object.scale.clone(),
        defaultColor:'#'+material.color.getHexString(), emissive:material.emissive.clone(), emissiveIntensity:material.emissiveIntensity });
    }
    if (object.userData.role === 'go-to-placeholder') placeholders.push(object);
    if (object.userData.role === 'go-to-accent') accents.push(object);
  });
  records.sort((a,b)=>a.slot-b.slot);
  if (!records.length || records.some((record,index)=>record.slot!==index)) throw new Error('The GLB must contain contiguous, individually named disc slots');
  const state=createDiscState(records.map(record=>record.defaultColor));
  const accentColor=new THREE.Color('#80bcb0');
  const update=() => {
    const snapshot=state.snapshot(), putters=snapshot.filter(d=>d.location==='putter');
    for(const disc of snapshot) {
      const record=records[disc.slot], object=record.object;
      record.material.color.set(disc.color);
      record.material.emissive.copy(record.emissive);
      record.material.emissiveIntensity=record.emissiveIntensity;
      if (disc.location==='main') {
        object.position.copy(record.position); object.quaternion.copy(record.quaternion); object.scale.copy(record.scale);
      } else if (disc.location==='putter') {
        const order=putters.findIndex(d=>d.slot===disc.slot), count=putters.length;
        const gap=count>1 ? .022/(count-1) : 0;
        const depthScale=count>1 ? Math.min(1,gap/.012) : 1;
        const fan=count>1 ? order/(count-1)-.5 : 0;
        object.position.set(fan*.012,.147+order*.0006,.168-order*gap);
        object.rotation.set(0,-Math.PI/2,0);
        object.scale.set(depthScale,.88,.88);
      } else {
        object.position.set(0,.249,.017);
        object.rotation.set(-.12,-Math.PI/2,0);
        object.scale.set(1,.92,.92);
        record.material.emissive.copy(accentColor); record.material.emissiveIntensity=.08;
      }
      object.userData.discLocation=disc.location;
    }
    const assigned=snapshot.some(d=>d.isGoTo);
    for (const object of placeholders) { object.visible=!assigned; object.scale.setScalar(assigned ? 0 : 1); }
    for (const object of accents) { object.visible=assigned; object.scale.setScalar(assigned ? 1 : 0); }
    onChange(snapshot);
  };
  const api={
    get discCount() { return state.count; },
    setDiscColors(entries) { state.setDiscColors(entries); update(); },
    setPutterSlots(slots) { state.setPutterSlots(slots); update(); },
    setGoToDisc(slotIndex) { state.setGoToDisc(slotIndex); update(); },
    getDiscState() { return state.snapshot(); },
  };
  update();
  return { api, originalMaterials };
}
