// Photo stamps (docs/photo-stamp-assets.md): the de-lighting and extraction off the main thread, so the aligner stays
// responsive for the second or two a 2048 px original takes. Pure pixel work; the page builds the PNG.
import {delightPixels,plateColor as measurePlate} from './disc-albedo.mjs';
import {extractPhotoStamp} from './disc-stamp-extract.mjs';
import {extractStampColor} from './disc-stamp-color.mjs';
import {delightStamp} from './disc-stamp-delight.mjs';

// `stored`: the crop is the site's stored texture (the one-click path, docs/photo-stamp-one-click.md), not an original.
export function extract(data,size,plate,{color=false,stored=false}={}){
 // Clipping is read off the crop as the camera gave it (disc-stamp-delight.mjs, and the full-colour asset's glare).
 const raw=data.slice();
 // Never the glare-softening pass: it trades fine ink under a hotspot for a nicer photo (docs/photo-stamp-spike.md).
 // A stored texture was de-lit once, at upload: a second pass would balance its white against its own glare core.
 const measured=stored?measurePlate(data,size):delightPixels(data,size,{softenGlare:false}).color;
 if(!measured)throw Error('This photo shows too little of the disc to read its stamp.');
 // v3.1: no camera light in the asset. The glare and shading the quadratic left are taken out, upstream of both looks.
 const light=delightStamp(data,raw,size,{plate,plateColor:measured,stored}),plateColor=light.plateColor;
 const {mask,...stamp}=extractPhotoStamp(data,size,{plate,plateColor,keepMask:color,unknown:light.unreliable,lit:light.lit,strong:light.strong});
 return {plateColor,light:light.stats,...stamp,...color&&{color:extractStampColor(data,raw,size,mask,plateColor,{plate,glare:light.unreliable,filled:light.filled})}};
}
if(typeof WorkerGlobalScope!=='undefined'&&self instanceof WorkerGlobalScope)self.onmessage=({data:{pixels,size,plate,color,stored}})=>{
 try{const result=extract(new Uint8ClampedArray(pixels),size,plate,{color,stored});self.postMessage({result},[result.alpha.buffer,...result.layers?Object.values(result.layers).map(v=>v.buffer):[],...result.color?[result.color.rgba.buffer]:[]]);}
 catch(error){self.postMessage({error:error.message});}
};
