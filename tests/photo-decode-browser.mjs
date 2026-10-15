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
  console.log('PASS: native PNG and actual WASM HEIC decode (empty, HEIC, octet-stream, wrong JPEG MIME)');
 }finally{page.off('request',record);}
}
