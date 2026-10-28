// Photo stamps (docs/photo-stamp-assets.md): the de-lighting and extraction off the main thread, so the aligner stays
// responsive for the second or two a 2048 px original takes. Pure pixel work; the page builds the PNG.
import {delightPixels,plateColor as measurePlate} from './disc-albedo.mjs';
import {extractPhotoStamp} from './disc-stamp-extract.mjs';
import {extractStampColor} from './disc-stamp-color.mjs';
import {delightStamp} from './disc-stamp-delight.mjs';
import {unshadow,shoulder} from './disc-stamp-clear.mjs';
import {autoRegister,inkBounds} from './disc-register.mjs';

// `stored`: the crop is the site's stored texture (the one-click path, docs/photo-stamp-one-click.md), not an original.
// `clear`: the disc is clear plastic (docs/clear-plastic-discs.md): its stamp's shadow on the surface under it shows
// through, and is taken out first (disc-stamp-clear.mjs), so only the stamp is read.
// `seeThrough`: see-through plastic (docs/stamp-look-extraction.md), whose plate shows marks on its far side, like the pen
// on the back of a Champion: those are found and left out of the stamp.
export function extract(data,size,plate,{color=false,stored=false,clear=false,seeThrough=false}={}){
 // Clipping is read off the crop as the camera gave it (disc-stamp-delight.mjs, and the full-colour asset's glare),
 // so it is copied before the shadow pass changes anything.
 const raw=data.slice();
 const shadow=clear?unshadow(data,size,{plate}):null;
 // Never the glare-softening pass: it trades fine ink under a hotspot for a nicer photo (docs/photo-stamp-spike.md).
 // A stored texture was de-lit once, at upload: a second pass would balance its white against its own glare core.
 const measured=stored?measurePlate(data,size):delightPixels(data,size,{softenGlare:false}).color;
 if(!measured)throw Error('This photo shows too little of the disc to read its stamp.');
 // v3.1: no camera light in the asset. The glare and shading the quadratic left are taken out, upstream of both looks.
 const light=delightStamp(data,raw,size,{plate,plateColor:measured,stored}),plateColor=light.plateColor;
 const {mask,...stamp}=extractPhotoStamp(data,size,{plate,plateColor,keepMask:color||clear,unknown:light.unreliable,lit:light.lit,strong:light.strong,seeThrough});
 const drop=p=>{stamp.alpha[p]=0;if(mask)mask[p]=0;if(stamp.layers)for(const layer of Object.values(stamp.layers))layer[p]=0;};
 // A clear disc's shoulder is its rim's own colour, never print in the plate's hue (disc-stamp-clear.mjs).
 if(clear){const off=shoulder(raw,size,plate,shadow.plate);for(let p=0;p<off.length;p++)if(off[p])drop(p);}
 const colour=color||clear?extractStampColor(data,raw,size,mask,plateColor,{plate,glare:light.unreliable,filled:light.filled,clear}):null;
 // The clean finish (docs/clear-stamp-clean.md): on a clear disc the colour pass decides what is print, and the one-ink
 // asset holds exactly that, at full alpha: nothing of the plastic, nothing half there. A layered asset is drawn from
 // its layers, not its alpha (disc-photo.mjs), so each layer is cut at half too: full or none. A kept pixel with every
 // layer under half takes its strongest, so the layers together hold exactly the kept pixels.
 if(clear){
  const {kept}=colour;for(let p=0;p<kept.length;p++)if(!kept[p])drop(p);else stamp.alpha[p]=255;delete colour.kept;
  if(stamp.layers){
   const layers=Object.values(stamp.layers);
   for(let p=0;p<kept.length;p++){
    if(!kept[p])continue;let strongest=layers[0],any=false;
    for(const layer of layers){if(layer[p]>strongest[p])strongest=layer;if(layer[p]>=.5)any=true;}
    for(const layer of layers)layer[p]=layer[p]>=.5||!any&&layer===strongest?1:0;
   }
  }
 }
 return {plateColor,light:light.stats,...shadow&&{shadow},...stamp,...color&&{color:colour}};
}
// One-dot registration (docs/photo-adder-rework.md): the aligner's automatic fit, here so the page stays responsive while
// each candidate centre's stamp is read. `register`: the photo's working copy (w × h RGBA) and the mold's plate.
export function register(pixels,w,h,plate){
 // A candidate whose crop shows too little to read gives no answer, not a failure.
 return autoRegister(pixels,w,h,{plate,readInk:(crop,size)=>{try{const b=inkBounds(extract(crop,size,plate).alpha,size);return b&&{x:b.dx/(size/2),y:b.dy/(size/2)};}catch{return null;}}});
}
if(typeof WorkerGlobalScope!=='undefined'&&self instanceof WorkerGlobalScope)self.onmessage=async({data:{pixels,size,plate,color,stored,clear,seeThrough,register:fit}})=>{
 if(fit){try{self.postMessage({result:await register(new Uint8ClampedArray(pixels),fit.w,fit.h,plate)});}catch(error){self.postMessage({error:error.message});}return;}
 try{const result=extract(new Uint8ClampedArray(pixels),size,plate,{color,stored,clear,seeThrough});self.postMessage({result},[result.alpha.buffer,...result.layers?Object.values(result.layers).map(v=>v.buffer):[],...result.color?[result.color.rgba.buffer]:[]]);}
 catch(error){self.postMessage({error:error.message});}
};
