// Photo stamps (docs/photo-stamp-assets.md): the de-lighting and extraction off the main thread, so the aligner stays
// responsive for the second or two a 2048 px original takes. Pure pixel work; the page builds the PNG.
import {delightPixels} from './disc-albedo.mjs';
import {extractPhotoStamp} from './disc-stamp-extract.mjs';

export function extract(data,size,plate){
 // Never the glare-softening pass: it trades fine ink under a hotspot for a nicer photo (docs/photo-stamp-spike.md).
 const {color}=delightPixels(data,size,{softenGlare:false});
 if(!color)throw Error('This photo shows too little of the disc to read its stamp.');
 return {plateColor:color,...extractPhotoStamp(data,size,{plate,plateColor:color})};
}
if(typeof WorkerGlobalScope!=='undefined'&&self instanceof WorkerGlobalScope)self.onmessage=({data:{pixels,size,plate}})=>{
 try{const result=extract(new Uint8ClampedArray(pixels),size,plate);self.postMessage({result},[result.alpha.buffer,...result.layers?Object.values(result.layers).map(v=>v.buffer):[]]);}
 catch(error){self.postMessage({error:error.message});}
};
