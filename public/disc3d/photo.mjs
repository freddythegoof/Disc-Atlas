import * as THREE from 'three';
import {shapeFrame,topHeight} from './shape.mjs';
// The whole photo maps to the disc's diameter, while only the top flight plate receives it.
// UVs are Cartesian x/z, independent of the lathe's angular UV seam.
export function photoGeometry(shape,{overmold=false,segments=64,rings=16}={}){
 const {R,Rs,Ri}=shapeFrame(shape),radius=overmold?Ri:Rs;
 const g=new THREE.RingGeometry(.001,radius,segments,rings);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,topHeight(shape,Math.hypot(x,z))+.003);uv.setXY(i,.5+x/(2*R),.5-z/(2*R));}
 g.computeVertexNormals();return g;
}
const cache=new Map();let epoch=0;
export function clearPhotoCache(){epoch++;for(const entry of cache.values()){entry.controller.abort();entry.texture?.dispose();entry.image?.close?.();}cache.clear();window.dispatchEvent(new Event('atlas-photo-clear'));}
// Only same-origin owner-checked routes are accepted. No public bucket URLs or persistent browser cache.
window.addEventListener('atlas-photo-reset',clearPhotoCache);
export function acquirePhoto(url,size=1024){
 const cacheKey=url+'|'+size;
 if(!/^\/api\/bag\/discs\/[^/]+\/photo\?v=[a-f0-9-]+\.webp$/.test(url))return {ready:Promise.reject(Error('Invalid photo route.')),release(){}};
 let entry=cache.get(cacheKey);
 if(!entry){
  const controller=new AbortController(),start=epoch;entry={refs:0,controller};cache.set(cacheKey,entry);
  entry.ready=fetch(url,{credentials:'same-origin',cache:'no-store',signal:controller.signal}).then(async r=>{if(!r.ok)throw Error('Photo unavailable');const image=await createImageBitmap(await r.blob(),{imageOrientation:'flipY',resizeWidth:size,resizeHeight:size,resizeQuality:'high'});if(start!==epoch||controller.signal.aborted){image.close();throw Error('Photo cleared');}const texture=new THREE.Texture(image);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;texture.anisotropy=4;entry.texture=texture;entry.image=image;return texture;}).catch(e=>{if(cache.get(cacheKey)===entry)cache.delete(cacheKey);throw e;});
 }
 entry.refs++;let released=false;
 return {ready:entry.ready,release(){if(released)return;released=true;if(--entry.refs===0){if(cache.get(cacheKey)===entry)cache.delete(cacheKey);entry.controller.abort();entry.texture?.dispose();entry.image?.close?.();}}};
}
export function photoSurface(shape,url,{overmold=false,onChange=()=>{},plastic={},size=1024}={}){
 const material=new THREE.MeshPhysicalMaterial({color:0xffffff,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,...plastic});
 const mesh=new THREE.Mesh(photoGeometry(shape,{overmold}),material);mesh.visible=false;let disposed=false;
 const handle=acquirePhoto(url,size);
 handle.ready.then(texture=>{if(disposed)return;material.map=texture;material.needsUpdate=true;mesh.userData.photoReady=true;mesh.visible=true;onChange(mesh);},()=>{if(!disposed){mesh.userData.photoFailed=true;onChange(mesh);}});
 const clear=()=>{mesh.visible=false;mesh.userData.photoReady=false;onChange(mesh);};window.addEventListener('atlas-photo-clear',clear);
 mesh.userData.disposePhoto=()=>{disposed=true;window.removeEventListener('atlas-photo-clear',clear);handle.release();mesh.geometry.dispose();material.dispose();};
 return mesh;
}
