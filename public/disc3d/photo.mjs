import * as THREE from 'three';
import {shapeFrame,topHeight,topProfile} from './shape.mjs';
import {planPhoto,cleanPhoto} from './photo-clean.mjs';
// The whole photo maps to the disc's diameter. UVs are Cartesian x/z, independent of the lathe's angular UV seam.
// An overmold's photo stops at the seam: the rim is its own piece, in its own colour. A one-piece disc's photo
// (`edge`) runs over the shoulder to the nose, so a stamp or a band in the plastic that reaches the edge in the
// photo reaches it on the model; stopping at the shoulder left a ring of plain plastic that read as an added
// rim. Every surface passes `edge`, the atlas's top-down discs included; without it the photo stops at the shoulder.
export function photoGeometry(shape,{overmold=false,edge=false,segments=64,rings=16}={}){
 if(edge&&!overmold)return edgeGeometry(shape,{segments,rings});
 const {R,Rs,Ri}=shapeFrame(shape),radius=overmold?Ri:Rs;
 const g=new THREE.RingGeometry(.001,radius,segments,rings);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,topHeight(shape,Math.hypot(x,z))+.003);uv.setXY(i,.5+x/(2*R),.5-z/(2*R));}
 g.computeVertexNormals();return g;
}
// The top as before (`rings` steps out to the shoulder), then the profile's own shoulder points out to the nose,
// spun `segments` times. Each vertex stands off the surface along the profile's normal, and where the surface
// faces outward also by its own chord sag, so between its vertices it never dips under the disc mesh's on the
// slope. Its UV is the surface point's own top-down position: the shoulder takes the photo's outer annulus,
// where the photo saw it.
function edgeGeometry(shape,{segments,rings}){
 const {R,Rs}=shapeFrame(shape),sag=R*(1-Math.cos(Math.PI/segments));
 const profile=[];
 for(let i=0;i<=rings;i++){const r=Math.max(.001,Rs*i/rings);profile.push({x:r,y:topHeight(shape,r)});}
 for(const p of topProfile(shape).filter(p=>p.x>Rs+1e-6).reverse())profile.push(p);
 const n=profile.length,columns=segments+1,position=new Float32Array(n*columns*3),normal=new Float32Array(n*columns*3),uv=new Float32Array(n*columns*2);
 for(let i=0;i<n;i++){
  const a=profile[Math.max(0,i-1)],b=profile[Math.min(n-1,i+1)],len=Math.hypot(b.x-a.x,b.y-a.y)||1;
  const nx=i?-(b.y-a.y)/len:0,ny=i?(b.x-a.x)/len:1,off=.003+sag*Math.max(0,nx)*1.25,{x:r,y}=profile[i];
  for(let j=0;j<columns;j++){
   const t=j/segments*Math.PI*2,c=Math.cos(t),s=Math.sin(t),k=i*columns+j;
   position.set([(r+nx*off)*c,y+ny*off,(r+nx*off)*s],3*k);normal.set([nx*c,ny,nx*s],3*k);uv.set([.5+r*c/(2*R),.5-r*s/(2*R)],2*k);
  }
 }
 const index=[];
 for(let i=0;i<n-1;i++)for(let j=0;j<segments;j++){const a=i*columns+j,b=a+1,c=a+columns,d=c+1;index.push(a,d,c,a,b,d);}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(position,3));g.setAttribute('normal',new THREE.BufferAttribute(normal,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setIndex(index);g.computeBoundingSphere();return g;
}
// Only the disc survives (photo-clean.mjs): each stored photo gets one cleanup plan, cached by its URL (which
// names its version) and shared by every size and surface, so the same stored texture always draws the same.
// A photo the plan leaves alone decodes exactly as before. Plans and cleaned images are made in a worker.
const plans=new Map();
export const photoCleanup={plans,stats:{plans:0,planMs:0,cleaned:0,cleanMs:0,worker:null}};
let worker=null,workerBroken=typeof Worker==='undefined',calls=0;const waiting=new Map();
function inWorker(message,local){
 if(!workerBroken&&!worker){
  try{
   worker=new Worker(new URL('./photo-clean-worker.mjs',import.meta.url),{type:'module'});
   worker.onmessage=({data})=>{const call=waiting.get(data.id);if(!call)return;waiting.delete(data.id);if(data.error)call.local();else call.resolve(data);};
   worker.onerror=()=>{workerBroken=true;worker?.terminate();worker=null;for(const call of waiting.values())call.local();waiting.clear();};
  }catch{workerBroken=true;worker=null;}
 }
 photoCleanup.stats.worker=!workerBroken;
 if(!worker)return local();
 return new Promise((resolve,reject)=>{const id=++calls;waiting.set(id,{resolve,local:()=>local().then(resolve,reject)});worker.postMessage({id,...message});});
}
function planFor(url,blob){
 let plan=plans.get(url);
 if(plan){plans.delete(url);plans.set(url,plan);return plan;}
 plan=inWorker({op:'plan',blob},async()=>({plan:await planPhoto(blob)})).then(({plan})=>{photoCleanup.stats.plans++;photoCleanup.stats.planMs+=plan.ms;return plan;});
 plan.catch(()=>{if(plans.get(url)===plan)plans.delete(url);});
 plans.set(url,plan);while(plans.size>64)plans.delete(plans.keys().next().value);
 return plan;
}
async function photoImage(url,blob,size){
 const plan=await planFor(url,blob).catch(()=>null);
 if(!plan?.changed)return createImageBitmap(blob,{imageOrientation:'flipY',resizeWidth:size,resizeHeight:size,resizeQuality:'high'});
 const start=performance.now(),{image}=await inWorker({op:'clean',blob,size,plan},async()=>({image:await cleanPhoto(blob,size,plan)}));
 photoCleanup.stats.cleaned++;photoCleanup.stats.cleanMs+=performance.now()-start;return image;
}
const cache=new Map();let epoch=0;
export function clearPhotoCache(){epoch++;plans.clear();for(const entry of cache.values()){entry.controller.abort();entry.texture?.dispose();entry.image?.close?.();}cache.clear();window.dispatchEvent(new Event('atlas-photo-clear'));}
// Only same-origin owner-checked routes are accepted. No public bucket URLs or persistent browser cache.
window.addEventListener('atlas-photo-reset',clearPhotoCache);
// A whisper of relief for detail views: height is how far a pixel's brightness sits from the plate's, so
// a stamp (dark on light or light on dark) stands a hair proud of the plastic and catches the light at its
// edges. Smooth gradients have no slope worth shading, so leftover lighting adds nothing.
function reliefTexture(image){
 const n=Math.min(512,image.width),canvas=document.createElement('canvas');canvas.width=canvas.height=n;
 const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0,n,n);
 const d=g.getImageData(0,0,n,n).data,L=new Float32Array(n*n),histogram=new Uint32Array(256);let counted=0;
 for(let i=0;i<n*n;i++){
  const l=.2126*d[4*i]+.7152*d[4*i+1]+.0722*d[4*i+2],x=(i%n+.5)/n*2-1,y=((i/n|0)+.5)/n*2-1;L[i]=l;
  if(d[4*i+3]>250&&x*x+y*y<.6){histogram[l|0]++;counted++;}
 }
 let plate=128;for(let v=0,seen=0;v<256;v++){seen+=histogram[v];if(seen>=counted/2){plate=v;break;}}
 const height=new Uint8Array(n*n);
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){
  let sum=0,count=0;
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii>=0&&jj>=0&&ii<n&&jj<n){sum+=Math.abs(L[jj*n+ii]-plate);count++;}}
  height[j*n+i]=Math.min(255,sum/count*2.5);
 }
 const texture=new THREE.DataTexture(height,n,n,THREE.RedFormat,THREE.UnsignedByteType);
 texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;
 return texture;
}
const RELIEF=.35;
export function acquirePhoto(url,size=1024,{relief=false}={}){
 const cacheKey=url+'|'+size+(relief?'|relief':'');
 if(!/^\/api\/bag\/discs\/[^/]+\/photo\?v=[a-f0-9-]+\.webp$/.test(url))return {ready:Promise.reject(Error('Invalid photo route.')),release(){}};
 let entry=cache.get(cacheKey);
 if(!entry){
  const controller=new AbortController(),start=epoch;entry={refs:0,controller};cache.set(cacheKey,entry);
  entry.ready=fetch(url,{credentials:'same-origin',cache:'no-store',signal:controller.signal}).then(async r=>{if(!r.ok)throw Error('Photo unavailable');const image=await photoImage(url,await r.blob(),size);if(start!==epoch||controller.signal.aborted){image.close();throw Error('Photo cleared');}const texture=new THREE.Texture(image);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;texture.anisotropy=4;entry.texture=texture;entry.image=image;entry.relief=relief?reliefTexture(image):null;return {map:texture,relief:entry.relief};}).catch(e=>{if(cache.get(cacheKey)===entry)cache.delete(cacheKey);throw e;});
 }
 entry.refs++;let released=false;
 return {ready:entry.ready,release(){if(released)return;released=true;if(--entry.refs===0){if(cache.get(cacheKey)===entry)cache.delete(cacheKey);entry.controller.abort();entry.texture?.dispose();entry.relief?.dispose();entry.image?.close?.();}}};
}
// `like`: the plate material the photo covers. The photo wears a copy of it (same lighting model,
// roughness, clearcoat and any shader hook) with the photo as its colour, so the scene lights the design
// exactly as it lights the plastic around it: highlights and falloff come from the model, not the photo.
export function photoSurface(shape,url,{overmold=false,edge=false,onChange=()=>{},plastic={},like=null,relief=false,size=1024}={}){
 const material=like?like.clone():new THREE.MeshPhysicalMaterial(plastic);
 if(like){material.onBeforeCompile=like.onBeforeCompile;material.customProgramCacheKey=like.customProgramCacheKey;}
 for(const slot of ['map','normalMap','bumpMap','roughnessMap','metalnessMap','aoMap','alphaMap','emissiveMap','lightMap'])if(slot in material)material[slot]=null;
 material.color.set(0xffffff);material.emissive?.set(0x000000);Object.assign(material,{transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
 const mesh=new THREE.Mesh(photoGeometry(shape,{overmold,edge}),material);mesh.visible=false;let disposed=false;
 const handle=acquirePhoto(url,size,{relief});
 handle.ready.then(({map,relief:height})=>{if(disposed)return;material.map=map;if(height){material.bumpMap=height;material.bumpScale=RELIEF;}material.needsUpdate=true;mesh.userData.photoReady=true;mesh.visible=true;onChange(mesh);},()=>{if(!disposed){mesh.userData.photoFailed=true;onChange(mesh);}});
 const clear=()=>{mesh.visible=false;mesh.userData.photoReady=false;onChange(mesh);};window.addEventListener('atlas-photo-clear',clear);
 mesh.userData.disposePhoto=()=>{disposed=true;window.removeEventListener('atlas-photo-clear',clear);handle.release();mesh.geometry.dispose();material.dispose();};
 return mesh;
}
