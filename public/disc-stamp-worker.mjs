// Photo stamps (docs/photo-stamp-assets.md): the de-lighting and extraction off the main thread, so the aligner stays
// responsive for the second or two a 2048 px original takes. Pure pixel work; the page builds the PNG.
import {delightPixels} from './disc-albedo.mjs';
import {extractPhotoStamp} from './disc-stamp-extract.mjs';
import {extractStampColor} from './disc-stamp-color.mjs';

export function extract(data,size,plate,{color=false}={}){
 // The full-colour asset (docs/photo-stamp-color-assets.md) finds clipped glare on the crop as the camera gave it.
 const raw=color?data.slice():null;
 // Never the glare-softening pass: it trades fine ink under a hotspot for a nicer photo (docs/photo-stamp-spike.md).
 const {color:plateColor}=delightPixels(data,size,{softenGlare:false});
 if(!plateColor)throw Error('This photo shows too little of the disc to read its stamp.');
 const {mask,...stamp}=extractPhotoStamp(data,size,{plate,plateColor,keepMask:color});
 return {plateColor,...stamp,...color&&{color:extractStampColor(data,raw,size,mask,plateColor,{plate})}};
}
if(typeof WorkerGlobalScope!=='undefined'&&self instanceof WorkerGlobalScope)self.onmessage=({data:{pixels,size,plate,color}})=>{
 try{const result=extract(new Uint8ClampedArray(pixels),size,plate,{color});self.postMessage({result},[result.alpha.buffer,...result.layers?Object.values(result.layers).map(v=>v.buffer):[],...result.color?[result.color.rgba.buffer]:[]]);}
 catch(error){self.postMessage({error:error.message});}
};
