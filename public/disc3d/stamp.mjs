// The name stamp is the immediate fallback. Reviewed stock alpha art replaces only its design;
// the same ink and dome-following mesh still apply. No catalog-wide loading occurs here.
import * as THREE from 'three';
import {shapeFrame,topHeight} from './shape.mjs';
import {DETAIL} from './quality.mjs';
import {PHOTO_STAMP,photoStampBlob} from './photo-stamps.mjs';

const masks=new Map(),MAX_MASKS=12,STOCK=/^stamps\/discraft\/[a-z0-9-]+\.png$/;
export function catalogStampAsset(d){
 return (d?.brand||d?.manufacturer)==='Discraft'&&STOCK.test(d?.stampAsset||'')?d.stampAsset:null;
}
// The ink extent is measured against the FULL disc, independently of texture padding.
export function catalogStampPlacement(d){
 const p=d?.stampPlacement;
 return catalogStampAsset(d)&&p&&[p.diameterFraction,p.assetInkFraction].every(v=>Number.isFinite(v)&&v>0&&v<=1)&&p.diameterFraction<=p.assetInkFraction?p:null;
}
function maskFor(asset){
 let entry=masks.get(asset);
 if(entry){masks.delete(asset);masks.set(asset,entry);return entry;}
 const image=new Image();entry={image,ready:false,failed:false,listeners:new Set()};masks.set(asset,entry);
 image.onload=()=>{entry.ready=true;for(const ready of entry.listeners)ready();entry.listeners.clear();trim();};
 image.onerror=()=>{entry.failed=true;for(const ready of entry.listeners)ready();entry.listeners.clear();trim();};
 // A photo stamp (photo-stamps.mjs) lives in this browser, not on the server: its bytes come from IndexedDB.
 if(PHOTO_STAMP.test(asset))photoStampBlob(asset).then(blob=>{const url=URL.createObjectURL(blob),done=()=>URL.revokeObjectURL(url);image.addEventListener('load',done,{once:true});image.addEventListener('error',done,{once:true});image.src=url;},()=>image.onerror());
 else image.src='/'+asset;
 trim();return entry;
}
function trim(){
 for(const [key,entry] of masks){if(masks.size<=MAX_MASKS)break;if(entry.ready||entry.failed)masks.delete(key);}
}
// Display customization (docs/display-customization.md): `style` is DisplayPalette.stampStyle(), only on the
// player's own discs in personal contexts; null everywhere else keeps today's stamp exactly. Its ink recolours
// the stamp (official art still contributes only its alpha, so the design never changes); a foil is opaque.
function inkFor(color,style){
 const foil=!!style?.finish&&style.finish.id!=='flat';
 if(style?.ink){const [r,g,b]=style.ink.match(/[0-9a-f]{2}/gi).map(v=>parseInt(v,16));return `rgba(${r},${g},${b},${foil?1:.9})`;}
 const c=new THREE.Color(color),hsl={};c.getHSL(hsl,THREE.SRGBColorSpace);
 return hsl.l>.55?`rgba(18,22,28,${foil?1:.72})`:`rgba(255,255,255,${foil?1:.78})`;
}
// A layered photo stamp (photo-stamps.mjs) carries an illustrated stamp's fills, lines and solid elements in its red,
// green and blue. One ink keeps the real disc's light and dark: an ink lighter than the plastic fills the design and
// leaves its line work in the plastic's colour (light fills, dark lines, as printed); a darker ink draws the lines and
// tints the fills (TINT). Solid elements (a name, a logo) are full ink either way. The result is the stamp's alpha.
const TINT=.42;
const luminance=css=>{const c=new THREE.Color(),m=css.match(/[\d.]+/g);if(m&&css.startsWith('rgba'))c.setRGB(m[0]/255,m[1]/255,m[2]/255,THREE.SRGBColorSpace);else c.set(css);return .2126*c.r+.7152*c.g+.0722*c.b;};
function layer(g,size,ink,plate){
 const image=g.getImageData(0,0,size,size),d=image.data,light=luminance(ink)>luminance(plate);
 for(let i=0;i<d.length;i+=4){
  const fill=d[i]/255,line=d[i+1]/255,solid=d[i+2]/255,a=Math.max(solid,light?fill*(1-line):line+(1-line)*TINT*fill);
  d[i]=d[i+1]=d[i+2]=255;d[i+3]=Math.round(255*a);
 }
 g.putImageData(image,0,0);
}
// `size`: the canvas, 512 for stock art. A photo stamp spans most of the disc in fine detail, so a large surface (the
// viewer) asks for more; the generated fallback is drawn the same at any size.
export function stampTexture(name,color,{asset=null,onChange=()=>{},style=null,size=512}={}){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const g=canvas.getContext('2d');
 const ink=inkFor(color,style);
 g.save();g.scale(size/512,size/512);
 g.strokeStyle=ink;g.fillStyle=ink;g.lineWidth=5;
 g.beginPath();g.arc(256,256,512*.44,0,Math.PI*2);g.stroke();
 g.lineWidth=3;g.beginPath();g.arc(256,256,512*.405,0,Math.PI*2);g.stroke();
 const text=String(name||'').toUpperCase().slice(0,22);
 const family=getComputedStyle(document.body).fontFamily||'sans-serif';
 let px=104;g.font=`800 ${px}px ${family}`;
 while(px>34&&g.measureText(text).width>512*.7){px-=4;g.font=`800 ${px}px ${family}`;}
 g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,256);
 g.fillRect(512*.34,256+px*.62,512*.32,4);g.restore();
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 if(asset&&(STOCK.test(asset)||PHOTO_STAMP.test(asset))){
  const entry=maskFor(asset);let live=true;
  const paint=()=>{
   if(!live)return;
   if(entry.failed){texture.userData.stampFailed=true;onChange();return;}
   g.clearRect(0,0,size,size);g.drawImage(entry.image,0,0,size,size);
   if(asset.endsWith('/l'))layer(g,size,ink,color);
   // Only the source alpha survives. Source foil/plastic RGB can never tint the plate.
   g.globalCompositeOperation='source-in';g.fillStyle=ink;g.fillRect(0,0,size,size);g.globalCompositeOperation='source-over';
   texture.userData.stampAsset=asset;texture.needsUpdate=true;onChange(texture);
  };
  texture.addEventListener('dispose',()=>{live=false;entry.listeners.delete(paint);});
  if(entry.ready||entry.failed)paint();else entry.listeners.add(paint);
 }
 return texture;
}

// The stamp rides the top surface, inside the shoulder, on a ring mesh fine enough to follow the dome.
// Centimetres, in the profile's own frame (y = 0 at the foot), like the lathe.
export function stampGeometry(shape,{segments=48,rings=8,placement=null}={}){
 const {Rs,R}=shapeFrame(shape);
 // Only decoded official art opts in. Generated/loading/failed stamps keep the legacy radius.
 const stampR=placement?R*placement.diameterFraction/placement.assetInkFraction:Math.min(Rs*.78,6.2);
 const ring=new THREE.RingGeometry(.001,stampR,segments,rings);ring.rotateX(-Math.PI/2);
 const pos=ring.attributes.position;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,topHeight(shape,Math.hypot(x,z))+.012);}
 ring.computeVertexNormals();
 return ring;
}

const LAYER={transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2};
// Flat ink (and every neutral surface) keeps today's material. A foil is a physical layer: full metal tinted by the
// ink, reflecting the scene's environment, with thin-film iridescence for the rainbow family and a procedural map
// that varies roughness and film thickness inside the ink for the patterned ones. Only the light response changes.
// `envMap`: a scene whose room is dimmer than the viewer's (the bag, storage, the atlas's top-down stills) hands its
// environment texture over, and the foil reflects it at `envIntensity`, the viewer's strength by default, so one
// foil looks the same everywhere. (three.js only lets a material set its own reflection strength when it carries
// its own envMap; with the scene's environment alone, the scene's strength applies.)
export function stampMaterial(style=null,{envMap=null,envIntensity=DETAIL.environment}={}){
 const f=style?.finish;
 if(!f||f.id==='flat')return new THREE.MeshStandardMaterial({...LAYER,roughness:.5,metalness:.15});
 const m=new THREE.MeshPhysicalMaterial({...LAYER,metalness:f.metalness,roughness:f.roughness,
  iridescence:f.iridescence||0,iridescenceIOR:f.ior||1.3,iridescenceThicknessRange:[...(f.thickness||[100,400])]});
 if(f.pattern){const maps=patternMaps(f.pattern);m.roughnessMap=maps.roughness;m.iridescenceThicknessMap=maps.thickness;}
 if(envMap){m.envMap=envMap;m.envMapIntensity=envIntensity;}
 m.userData.stampFinish=f.id;
 return m;
}

// Seeded, so a pattern is the same on every disc and every visit.
const patterns=new Map();
function patternMaps(kind){
 let maps=patterns.get(kind);if(maps)return maps;
 const size=256,rough=new Uint8Array(size*size*4),thick=new Uint8Array(size*size*4);
 let seed=kind==='shatter'?7:kind==='spin'?11:13;const rand=()=>((seed=Math.imul(seed^seed>>>15,2246822519)+0x9e3779b9>>>0)/4294967296);
 const cells=kind==='shatter'?Array.from({length:46},()=>({x:rand()*size,y:rand()*size,t:rand(),r:.3+rand()*.7})):null;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  let t,r;
  if(cells){
   // Cracked ice: shards of film at their own thickness and sheen, with rougher cracks between them.
   let a=Infinity,b=Infinity,near=null;
   for(const c of cells){const d=(c.x-x)**2+(c.y-y)**2;if(d<a){b=a;a=d;near=c;}else if(d<b)b=d;}
   const edge=Math.sqrt(b)-Math.sqrt(a)<2.2;t=near.t;r=edge?1:near.r;
  }else if(kind==='sweep'){
   // Rainbow: the film thickens smoothly across the stamp, so its colours run in bands that slide as it turns.
   t=(x+y*.6)/(size*1.6);r=.7;
  }else{
   // Spin: a pinwheel of film bands turning about the centre, the classic spinner holo.
   const dx=x-size/2,dy=y-size/2,angle=Math.atan2(dy,dx),radius=Math.hypot(dx,dy)/size;
   t=.5+.5*Math.sin(angle*14+radius*9);r=.35+.4*(.5+.5*Math.cos(angle*14));
  }
  const i=(y*size+x)*4;
  rough[i+1]=Math.round(r*255);rough[i+3]=255;thick[i+1]=Math.round(t*255);thick[i+3]=255;
 }
 const texture=data=>{const t=new THREE.DataTexture(data,size,size);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;};
 maps={roughness:texture(rough),thickness:texture(thick)};patterns.set(kind,maps);
 return maps;
}
