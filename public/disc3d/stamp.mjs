// The name stamp is the immediate fallback. Reviewed stock alpha art replaces only its design;
// the same ink and dome-following mesh still apply. No catalog-wide loading occurs here.
import * as THREE from 'three';
import {shapeFrame,topHeight} from './shape.mjs';

const masks=new Map(),MAX_MASKS=12;
export function catalogStampAsset(d){
 return (d?.brand||d?.manufacturer)==='Discraft'&&/^stamps\/discraft\/[a-z0-9-]+\.png$/.test(d?.stampAsset||'')?d.stampAsset:null;
}
function maskFor(asset){
 let entry=masks.get(asset);
 if(entry){masks.delete(asset);masks.set(asset,entry);return entry;}
 const image=new Image();entry={image,ready:false,failed:false,listeners:new Set()};masks.set(asset,entry);
 image.onload=()=>{entry.ready=true;for(const ready of entry.listeners)ready();entry.listeners.clear();trim();};
 image.onerror=()=>{entry.failed=true;for(const ready of entry.listeners)ready();entry.listeners.clear();trim();};
 image.src='/'+asset;trim();return entry;
}
function trim(){
 for(const [key,entry] of masks){if(masks.size<=MAX_MASKS)break;if(entry.ready||entry.failed)masks.delete(key);}
}
export function stampTexture(name,color,{asset=null,onChange=()=>{}}={}){
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
 if(asset&&/^stamps\/discraft\/[a-z0-9-]+\.png$/.test(asset)){
  const entry=maskFor(asset);let live=true;
  const paint=()=>{
   if(!live)return;
   if(entry.failed){texture.userData.stampFailed=true;onChange();return;}
   g.clearRect(0,0,size,size);g.drawImage(entry.image,0,0,size,size);
   // Only the source alpha survives. Source foil/plastic RGB can never tint the plate.
   g.globalCompositeOperation='source-in';g.fillStyle=ink;g.fillRect(0,0,size,size);g.globalCompositeOperation='source-over';
   texture.userData.stampAsset=asset;texture.needsUpdate=true;onChange();
  };
  texture.addEventListener('dispose',()=>{live=false;entry.listeners.delete(paint);});
  if(entry.ready||entry.failed)paint();else entry.listeners.add(paint);
 }
 return texture;
}

// The stamp rides the top surface, inside the shoulder, on a ring mesh fine enough to follow the dome.
// Centimetres, in the profile's own frame (y = 0 at the foot), like the lathe.
export function stampGeometry(shape,{segments=48,rings=8}={}){
 const {Rs}=shapeFrame(shape),stampR=Math.min(Rs*.78,6.2);
 const ring=new THREE.RingGeometry(.001,stampR,segments,rings);ring.rotateX(-Math.PI/2);
 const pos=ring.attributes.position;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,topHeight(shape,Math.hypot(x,z))+.012);}
 ring.computeVertexNormals();
 return ring;
}

export function stampMaterial(){
 return new THREE.MeshStandardMaterial({transparent:true,roughness:.5,metalness:.15,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
}
