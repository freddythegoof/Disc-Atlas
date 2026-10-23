// Photo stamps (docs/photo-stamp-assets.md): the de-lighting and extraction off the main thread, so the aligner stays
// responsive for the second or two a 2048 px original takes. Pure pixel work; the page builds the PNG.
import {delightPixels,plateColor as measurePlate} from './disc-albedo.mjs';
import {extractPhotoStamp} from './disc-stamp-extract.mjs';
import {extractStampColor} from './disc-stamp-color.mjs';
import {delightStamp} from './disc-stamp-delight.mjs';
import {unshadow,shoulder} from './disc-stamp-clear.mjs';

// `stored`: the crop is the site's stored texture (the one-click path, docs/photo-stamp-one-click.md), not an original.
// `clear`: the disc is clear plastic (docs/clear-plastic-discs.md): its stamp's shadow on the surface under it shows
// through, and is taken out first (disc-stamp-clear.mjs), so only the stamp is read.
export function extract(data,size,plate,{color=false,stored=false,clear=false}={}){
 const shadow=clear?unshadow(data,size,{plate}):null;
 // Clipping is read off the crop as the camera gave it (disc-stamp-delight.mjs, and the full-colour asset's glare).
 const raw=data.slice();
 // Never the glare-softening pass: it trades fine ink under a hotspot for a nicer photo (docs/photo-stamp-spike.md).
 // A stored texture was de-lit once, at upload: a second pass would balance its white against its own glare core.
 const measured=stored?measurePlate(data,size):delightPixels(data,size,{softenGlare:false}).color;
 if(!measured)throw Error('This photo shows too little of the disc to read its stamp.');
 // v3.1: no camera light in the asset. The glare and shading the quadratic left are taken out, upstream of both looks.
 const light=delightStamp(data,raw,size,{plate,plateColor:measured,stored}),plateColor=light.plateColor;
 const {mask,...stamp}=extractPhotoStamp(data,size,{plate,plateColor,keepMask:color,unknown:light.unreliable,lit:light.lit,strong:light.strong});
 // A clear disc's shoulder is its rim's own colour, never print in the plate's hue (disc-stamp-clear.mjs).
 if(clear){const drop=shoulder(raw,size,plate,shadow.plate);for(let p=0;p<drop.length;p++)if(drop[p]){stamp.alpha[p]=0;if(mask)mask[p]=0;if(stamp.layers)for(const layer of Object.values(stamp.layers))layer[p]=0;}}
 return {plateColor,light:light.stats,...shadow&&{shadow},...stamp,...color&&{color:extractStampColor(data,raw,size,mask,plateColor,{plate,glare:light.unreliable,filled:light.filled})}};
}
if(typeof WorkerGlobalScope!=='undefined'&&self instanceof WorkerGlobalScope)self.onmessage=({data:{pixels,size,plate,color,stored,clear}})=>{
 try{const result=extract(new Uint8ClampedArray(pixels),size,plate,{color,stored,clear});self.postMessage({result},[result.alpha.buffer,...result.layers?Object.values(result.layers).map(v=>v.buffer):[],...result.color?[result.color.rgba.buffer]:[]]);}
 catch(error){self.postMessage({error:error.message});}
};
