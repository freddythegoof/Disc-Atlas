// Loaded only when canvas encoding returns a format other than WebP.
import factory from './vendor/webp/1.5.0/webp_enc.js';
import {defaultOptions} from './vendor/webp/1.5.0/meta.js';
let encoder;
async function loadEncoder(){
 try{
  // Explicit fetch gives failed downloads a clean, retryable boundary before WASM initialization.
  const response=await fetch(new URL('./vendor/webp/1.5.0/webp_enc.wasm',import.meta.url));
  if(!response.ok)throw Error('Encoder download failed');
  return await factory({wasmBinary:await response.arrayBuffer(),noInitialRun:true});
 }catch(error){encoder=null;throw Error('Local WebP encoder could not load. Check your connection and retry.',{cause:error});}
}
export async function encodeWebP(pixels,quality){
 const codec=await (encoder||=loadEncoder());
 try{
  const bytes=codec.encode(pixels.data,pixels.width,pixels.height,{...defaultOptions,quality:quality*100});
  if(!bytes)throw Error('Encoder returned no data');
  // Blob copies the result before another encode can reuse the WASM heap.
  return new Blob([bytes],{type:'image/webp'});
 }catch(error){throw Error('Local WebP encoding failed while processing the canvas pixels.',{cause:error});}
}
