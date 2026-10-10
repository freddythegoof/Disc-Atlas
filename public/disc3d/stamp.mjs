// The generic name-only stamp (never manufacturer artwork), shared by the detail viewer and the storage
// racks: a canvas texture with the mold name between two rings, on a ring mesh that follows the dome.
import * as THREE from 'three';
import {shapeFrame,topHeight} from './shape.mjs';

export function stampTexture(name,color){
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
