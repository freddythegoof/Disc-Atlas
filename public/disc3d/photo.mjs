import * as THREE from 'three';
import {shapeFrame,topHeight} from './shape.mjs';
import {CLEAR} from './clear.mjs';
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
// A whisper of relief for detail views: height is how far a pixel's brightness sits from the plate's, so
// a stamp (dark on light or light on dark) stands a hair proud of the plastic and catches the light at its
// edges. Smooth gradients have no slope worth shading, so leftover lighting adds nothing.
// Both pixel passes run in row bands with a yield between bands, so one photo's relief is never one long task. Each band is a
// small function V8 optimizes once and keeps: the single loop entered once per photo churned through on-stack-replacement
// deopts and ran about three times slower on alternate photos (docs/gallery-photo-continuation-fix.md).
const BAND=128;
// Without scheduler.yield, a message turn rather than setTimeout, which nested timers clamp to 4 ms.
const nextTask=()=>globalThis.scheduler?.yield?.()??new Promise(r=>{const c=new MessageChannel();c.port1.onmessage=()=>r();c.port2.postMessage(0);});
function luminanceRows(d,n,L,histogram,j0,j1){
 let counted=0;
 for(let i=j0*n;i<j1*n;i++){
  const l=.2126*d[4*i]+.7152*d[4*i+1]+.0722*d[4*i+2],x=(i%n+.5)/n*2-1,y=((i/n|0)+.5)/n*2-1;L[i]=l;
  if(d[4*i+3]>250&&x*x+y*y<.6){histogram[l|0]++;counted++;}
 }
 return counted;
}
function heightRows(L,n,plate,height,j0,j1){
 for(let j=j0;j<j1;j++)for(let i=0;i<n;i++){
  let sum=0,count=0;
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii>=0&&jj>=0&&ii<n&&jj<n){sum+=Math.abs(L[jj*n+ii]-plate);count++;}}
  height[j*n+i]=Math.min(255,sum/count*2.5);
 }
}
// `live()` turns false when the photo is released or the cache cleared while a band waits; the caller's catch drops the entry.
async function reliefTexture(image,live){
 const n=Math.min(512,image.width),canvas=document.createElement('canvas');canvas.width=canvas.height=n;
 const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0,n,n);
 const d=g.getImageData(0,0,n,n).data,L=new Float32Array(n*n),histogram=new Uint32Array(256);let counted=0;
 const bands=async run=>{for(let j=0;j<n;j+=BAND){run(j,Math.min(n,j+BAND));await nextTask();if(!live())throw Error('Photo cleared');}};
 await bands((j0,j1)=>{counted+=luminanceRows(d,n,L,histogram,j0,j1);});
 let plate=128;for(let v=0,seen=0;v<256;v++){seen+=histogram[v];if(seen>=counted/2){plate=v;break;}}
 const height=new Uint8Array(n*n);
 await bands((j0,j1)=>heightRows(L,n,plate,height,j0,j1));
 const texture=new THREE.DataTexture(height,n,n,THREE.RedFormat,THREE.UnsignedByteType);
 texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;
 return texture;
}
const RELIEF=.35;
// A clear disc's photo (disc-photo-clear.mjs, docs/clear-plastic-true-color.md): cut at its own plate edge, and with the
// plastic's true colour `tint` its plate retinted toward it. In row bands between tasks, like the relief. The decoded
// bitmap is replaced by one made from the changed pixels; opaque discs never come here.
async function clearPhoto(image,tint,live){
 const {planClearPhoto,applyClearPhotoRows}=await import('../disc-photo-clear.mjs');
 const n=image.width,canvas=document.createElement('canvas');canvas.width=canvas.height=n;
 const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);
 const pixels=g.getImageData(0,0,n,n),plan=planClearPhoto(pixels.data,n,{tint,a:CLEAR.truePhoto});
 if(!plan||!plan.circle&&!plan.gain){canvas.width=canvas.height=0;return image;}
 for(let j=0;j<n;j+=BAND){applyClearPhotoRows(plan,pixels.data,n,j,Math.min(n,j+BAND));await nextTask();if(!live())throw Error('Photo cleared');}
 g.putImageData(pixels,0,0);
 const out=await createImageBitmap(canvas);canvas.width=canvas.height=0;image.close?.();out.clearPlan={plate:plan.plate,circle:plan.circle,tint};
 return out;
}
// `clear`: the disc is clear plastic (the photo is cut at its plate edge); `tint`: its true colour, or null.
export function acquirePhoto(url,size=1024,{relief=false,clear=false,tint=null}={}){
 const cacheKey=url+'|'+size+(relief?'|relief':'')+(clear?'|clear:'+(tint||''):'');
 if(!/^\/api\/bag\/discs\/[^/]+\/photo\?v=[a-f0-9-]+\.webp$/.test(url))return {ready:Promise.reject(Error('Invalid photo route.')),release(){}};
 let entry=cache.get(cacheKey);
 if(!entry){
  const controller=new AbortController(),start=epoch;entry={refs:0,controller};cache.set(cacheKey,entry);
  entry.ready=fetch(url,{credentials:'same-origin',cache:'no-store',signal:controller.signal}).then(async r=>{if(!r.ok)throw Error('Photo unavailable');let image=await createImageBitmap(await r.blob(),{imageOrientation:'flipY',resizeWidth:size,resizeHeight:size,resizeQuality:'high'});if(start!==epoch||controller.signal.aborted){image.close();throw Error('Photo cleared');}if(clear)image=await clearPhoto(image,tint,()=>start===epoch&&!controller.signal.aborted);const texture=new THREE.Texture(image);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;texture.anisotropy=4;entry.texture=texture;entry.image=image;entry.relief=relief?await reliefTexture(image,()=>start===epoch&&!controller.signal.aborted):null;return {map:texture,relief:entry.relief};}).catch(e=>{if(cache.get(cacheKey)===entry)cache.delete(cacheKey);throw e;});
 }
 entry.refs++;let released=false;
 return {ready:entry.ready,release(){if(released)return;released=true;if(--entry.refs===0){if(cache.get(cacheKey)===entry)cache.delete(cacheKey);entry.controller.abort();entry.texture?.dispose();entry.relief?.dispose();entry.image?.close?.();}}};
}
// `like`: the plate material the photo covers. The photo wears a copy of it (same lighting model,
// roughness, clearcoat and any shader hook) with the photo as its colour, so the scene lights the design
// exactly as it lights the plastic around it: highlights and falloff come from the model, not the photo.
// The copy is always drawn, even where the plate itself is hidden (a clear disc's, disc3d/clear.mjs).
// `clear` and `tint` (acquirePhoto): a clear disc's photo, cut at its plate edge and, with its true colour, retinted.
export function photoSurface(shape,url,{overmold=false,onChange=()=>{},plastic={},like=null,relief=false,size=1024,clear=false,tint=null}={}){
 const material=like?like.clone():new THREE.MeshPhysicalMaterial(plastic);
 if(like){material.onBeforeCompile=like.onBeforeCompile;material.customProgramCacheKey=like.customProgramCacheKey;}
 for(const slot of ['map','normalMap','bumpMap','roughnessMap','metalnessMap','aoMap','alphaMap','emissiveMap','lightMap'])if(slot in material)material[slot]=null;
 material.color.set(0xffffff);material.emissive?.set(0x000000);Object.assign(material,{transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,visible:true});
 const mesh=new THREE.Mesh(photoGeometry(shape,{overmold}),material);mesh.visible=false;let disposed=false;
 const handle=acquirePhoto(url,size,{relief,clear,tint});
 handle.ready.then(({map,relief:height})=>{if(disposed)return;material.map=map;if(height){material.bumpMap=height;material.bumpScale=RELIEF;}material.needsUpdate=true;mesh.userData.photoReady=true;mesh.visible=true;onChange(mesh);},()=>{if(!disposed){mesh.userData.photoFailed=true;onChange(mesh);}});
 const hide=()=>{mesh.visible=false;mesh.userData.photoReady=false;onChange(mesh);};window.addEventListener('atlas-photo-clear',hide);
 mesh.userData.disposePhoto=()=>{disposed=true;window.removeEventListener('atlas-photo-clear',hide);handle.release();mesh.geometry.dispose();material.dispose();};
 return mesh;
}
