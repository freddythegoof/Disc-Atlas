// Run inside the real photo browser suite, with the real self-hosted WASM asset.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

export async function verifyPhotoDecode(page){
 const fixture=name=>[...readFileSync(new URL('./fixtures/'+name,import.meta.url))];
 const requests=[];const record=r=>{if(r.url().includes('/vendor/libheif'))requests.push(r.url());};
 page.on('request',record);
 try{
  const native=await page.evaluate(async bytes=>{
   const {decodePhoto}=await import('/disc-photo.mjs');
   const image=await decodePhoto(new File([new Uint8Array(bytes)],'misleading.heic',{type:''}));
   const result=[image.width,image.height,image instanceof ImageBitmap];image.close();return result;
  },fixture('disc-photo.png'));
  assert.deepEqual(native,[128,96,true]);assert.equal(requests.length,0,'ordinary photos never load HEIC code');
  // Only the unsupported native API boundary is simulated; <img>, object URLs,
  // canvas pixels and the production ladder stay real. Run before any WASM load.
  const element=await page.evaluate(async bytes=>{
   const {decodePhoto}=await import('/disc-photo.mjs');
   const bitmap=window.createImageBitmap,create=URL.createObjectURL,revoke=URL.revokeObjectURL;
   const created=[],revoked=[];let fromCanvas=0;
   URL.createObjectURL=blob=>{const url=create.call(URL,blob);created.push(url);return url;};
   URL.revokeObjectURL=url=>{revoked.push(url);revoke.call(URL,url);};
   window.createImageBitmap=(source,...args)=>{
    if(source instanceof Blob)return Promise.reject(Error('Simulated native blob decode failure'));
    fromCanvas++;return bitmap.call(window,source,...args);
   };
   try{
    const image=await decodePhoto(new File([new Uint8Array(bytes)],'library.png',{type:'image/png'}));
    const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
    const g=canvas.getContext('2d');g.drawImage(image,0,0);
    const result={size:[image.width,image.height],bitmap:image instanceof ImageBitmap,rgba:[...g.getImageData(64,48,1,1).data]};image.close();
    // A broken known format must also revoke the URL on <img> failure.
    let error='';try{await decodePhoto(new File([new Uint8Array(bytes).slice(0,8)],'broken.png',{type:'image/png'}));}catch(e){error=e.message;}
    return {...result,fromCanvas,created,revoked,error};
   }finally{window.createImageBitmap=bitmap;URL.createObjectURL=create;URL.revokeObjectURL=revoke;}
  },fixture('disc-photo.png'));
  assert.deepEqual(element.size,[128,96]);assert.equal(element.bitmap,true);assert.deepEqual(element.rgba,[235,113,83,255]);
  assert.equal(element.fromCanvas,1);assert.deepEqual(element.revoked,element.created);assert.equal(element.created.length,2);
  assert.match(element.error,/PNG.*damaged/);assert.equal(requests.length,0,'native element fallback does not load HEIC code');
  const canvasSource=await page.evaluate(async bytes=>{
   const {decodePhoto,preparePhoto}=await import('/disc-photo.mjs'),original=window.createImageBitmap;
   window.createImageBitmap=()=>Promise.reject(Error('Bitmap API unavailable'));
   try{
    const image=await decodePhoto(new File([new Uint8Array(bytes)],'camera.png',{type:''}));
    const {blob}=await preparePhoto(image);const before=[image.width,image.height];image.close();image.close();
    return {before,after:[image.width,image.height],type:blob.type,bytes:blob.size};
   }finally{window.createImageBitmap=original;}
  },fixture('disc-photo.png'));
  assert.deepEqual(canvasSource.before,[128,96]);assert.deepEqual(canvasSource.after,[0,0]);assert.equal(canvasSource.type,'image/webp');assert.ok(canvasSource.bytes<=512*1024);
  assert.equal(requests.length,0,'canvas release fallback does not load HEIC code');
  const tooLargeElement=await page.evaluate(async bytes=>{
   const {decodePhoto}=await import('/disc-photo.mjs'),original=window.createImageBitmap;
   const w=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'naturalWidth'),h=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'naturalHeight');
   window.createImageBitmap=()=>Promise.reject(Error('Blob decode unavailable'));
   Object.defineProperty(HTMLImageElement.prototype,'naturalWidth',{configurable:true,get:()=>10001});
   Object.defineProperty(HTMLImageElement.prototype,'naturalHeight',{configurable:true,get:()=>6000});
   try{await decodePhoto(new File([new Uint8Array(bytes)],'large.png',{type:'image/png'}));return 'unexpected success';}
   catch(e){return e.message;}
   finally{window.createImageBitmap=original;Object.defineProperty(HTMLImageElement.prototype,'naturalWidth',w);Object.defineProperty(HTMLImageElement.prototype,'naturalHeight',h);}
  },fixture('disc-photo.png'));
  assert.match(tooLargeElement,/60 megapixels/);assert.equal(requests.length,0);
  const heic=await page.evaluate(async bytes=>{
   const {decodePhoto}=await import('/disc-photo.mjs');const results=[];
   for(const type of ['','image/heic','application/octet-stream','image/jpeg']){
    const image=await decodePhoto(new File([new Uint8Array(bytes)],'IMG_0001.HEIC',{type}));
    const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
    const g=canvas.getContext('2d');g.drawImage(image,0,0);
    results.push({size:[image.width,image.height],rgba:[...g.getImageData(64,48,1,1).data],bitmap:image instanceof ImageBitmap});image.close();
   }
   return results;
  },fixture('disc-photo.heic'));
  for(const result of heic){assert.deepEqual(result.size,[128,96]);assert.equal(result.bitmap,true);assert.ok(result.rgba[0]>220&&result.rgba[1]>100&&result.rgba[1]<125&&result.rgba[2]<100&&result.rgba[3]===255,'real decoded disc pixels');}
  assert.equal(requests.length,1,'WASM module loaded once for repeated HEIC decodes');
  const oversized=Buffer.from(fixture('disc-photo.heic'));
  for(let at=oversized.indexOf('ispe');at!==-1;at=oversized.indexOf('ispe',at+4)){oversized.writeUInt32BE(10001,at+8);oversized.writeUInt32BE(6000,at+12);}
  const heicErrors=await page.evaluate(async({oversized,corrupt})=>{
   const {decodePhoto}=await import('/disc-photo.mjs'),messages=[];
   for(const bytes of [oversized,corrupt]){
    try{const image=await decodePhoto(new File([new Uint8Array(bytes)],'broken.heic',{type:''}));image.close();messages.push('unexpected success');}
    catch(e){messages.push(e.message);}
   }
   return messages;
  },{oversized:[...oversized],corrupt:fixture('disc-photo.heic').slice(0,64)});
  assert.match(heicErrors[0],/60 megapixels/);assert.match(heicErrors[1],/HEIC.*Safari.*Most Compatible/);
  console.log('PASS: all decode rungs, URL cleanup, canvas release, native/HEIC 60 MP caps, honest corrupt-file errors; real WASM HEIC pixels for four MIME labels');
 }finally{page.off('request',record);}
}
