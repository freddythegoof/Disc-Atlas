import { createDiscState } from './disc-state.mjs';

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
