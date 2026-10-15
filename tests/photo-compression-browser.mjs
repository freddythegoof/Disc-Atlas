import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {photoRoute} from '../workers/textures.mjs';
import {photoHarness,playwright} from './photo-harness.mjs';

// Production Worker validates every chunk; doubles only replace local persistence.
async function validateUpload(bytes){
 let stored;
 const statement={bind(){return this;},async first(){return {texture_key:null};},async run(){return {meta:{changes:1}};},async all(){return {results:[]};}};
 const env={DB:{prepare:()=>statement,batch:async()=>[{meta:{changes:1}}]},TEXTURES:{put:async(_key,value)=>{stored=value;}}};
 const response=await photoRoute(new Request('https://atlas.example/api/bag/discs/disc/photo',{method:'PUT',headers:{'Content-Type':'image/webp',Origin:'https://atlas.example','X-Atlas-CSRF':'token'},body:new Uint8Array(bytes)}),env,{id:'owner',csrf_token:'token'},'disc');
 assert.equal(response.status,200,await response.text());assert.deepEqual([...stored],bytes);
}
const harness=await photoHarness(),results=[];
try{
 for(const engine of ['chromium','webkit']){
  const browser=await playwright[engine].launch({headless:true});
  try{
   for(const mode of ['png','png-jpeg','png-heic','native','null','transient-null','oversize','late-png']){
    const page=await browser.newPage(),requests=[];page.on('request',r=>{if(/disc-webp|vendor\/webp/.test(r.url()))requests.push(r.url());});
    await page.goto(harness.base);
    const result=await page.evaluate(async mode=>{
     const {decodePhoto,preparePhoto,albedoCanvas}=await import('/disc-photo.mjs');
     let image=await decodePhoto(await (await fetch('/fixtures/'+(mode==='png-heic'?'disc-photo.heic':'stamped-disc.webp'))).blob());
     // Exercise real JPEG bytes from the same photographic source, plus the metadata-bearing HEIC.
     if(mode==='png-jpeg'){
      const jpeg=document.createElement('canvas');jpeg.width=image.width;jpeg.height=image.height;jpeg.getContext('2d').drawImage(image,0,0);
      const source=await new Promise(r=>jpeg.toBlob(r,'image/jpeg',.95));image.close();image=await decodePhoto(source);
     }
     const native=HTMLCanvasElement.prototype.toBlob,steps=[];
     const {canvas}=albedoCanvas(image);const expected=await new Promise(r=>native.call(canvas,r,'image/webp',.86));
     HTMLCanvasElement.prototype.toBlob=function(callback,type,quality){
      steps.push([this.width,quality]);
      if(mode==='null'||mode==='transient-null'&&this.width===1024){callback(null);return;}
      if(mode==='oversize'&&this.width>1){callback(new Blob([new Uint8Array(600000)],{type:'image/webp'}));return;}
      return native.call(this,callback,mode.startsWith('png')||mode==='late-png'&&this.width>1?'image/png':type,quality);
     };
     try{
      const {blob,color}=await preparePhoto(image),bitmap=await createImageBitmap(blob);
      const dimensions=[bitmap.width,bitmap.height];bitmap.close();
      const bytes=[...new Uint8Array(await blob.arrayBuffer())];
      // Repeated saves must reuse the support result and initialized fallback.
      if(mode.startsWith('png'))await preparePhoto(image);
      return {type:blob.type,bytes,color,dimensions,steps,nativeEqual:expected&&bytes.join(',')===[...new Uint8Array(await expected.arrayBuffer())].join(',')};
     }catch(e){return {error:e.message,steps};}
     finally{HTMLCanvasElement.prototype.toBlob=native;image.close();}
    },mode);
    results.push({engine,mode,...result,bytes:result.bytes?.length,requests:requests.map(u=>new URL(u).pathname)});
    if(mode==='null'){assert.match(result.error,/returned no image data/i);assert.equal(requests.length,0);}
    else if(mode==='oversize'){
     assert.match(result.error,/512 KiB/);
     assert.deepEqual(result.steps.filter(([size])=>size>1),[1024,768,512].flatMap(size=>[.86,.72,.56,.4].map(q=>[size,q])));
    }else{
     assert.equal(result.error,undefined,`${engine}/${mode}: ${result.error}`);
     assert.equal(result.type,'image/webp');assert.ok(result.bytes.length<=512*1024);
     assert.deepEqual(result.dimensions,[mode==='transient-null'?768:1024,mode==='transient-null'?768:1024]);
     await validateUpload(result.bytes);
     if(mode==='native'){assert.equal(result.nativeEqual,true,'native bytes unchanged');assert.equal(requests.length,0);}
     if(mode.startsWith('png')){assert.equal(requests.filter(u=>u.endsWith('.wasm')).length,1,'WASM fetched once');assert.equal(result.steps.filter(([s])=>s===1).length,1,'feature detected once');}
    }
    await page.close();
   }
   const page=await browser.newPage();await page.goto(harness.base);let fail=true;
   await page.route('**/vendor/webp/**/*.wasm',route=>fail?route.fulfill({status:503,body:'Offline'}):route.continue());
   await page.evaluate(async()=>{
    const native=HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob=function(cb,_type,q){return native.call(this,cb,'image/png',q);};
    window.photoModule=await import('/disc-photo.mjs');window.photoImage=await photoModule.decodePhoto(await (await fetch('/fixtures/stamped-disc.webp')).blob());
   });
   const first=await page.evaluate(async()=>{try{await photoModule.preparePhoto(photoImage);}catch(e){return e.message;}});
   assert.match(first,/WebP encoder could not load/i);fail=false;
   const retry=await page.evaluate(async()=>{const {blob}=await photoModule.preparePhoto(photoImage);photoImage.close();return [...new Uint8Array(await blob.arrayBuffer())];});await validateUpload(retry);
   results.push({engine,mode:'WASM download retry',first,bytes:retry.length});await page.close();
  }finally{await browser.close();}
 }
 mkdirSync('outputs/photo-phone',{recursive:true});writeFileSync('outputs/photo-phone/compression-tests.json',JSON.stringify(results,null,2)+'\n');
 console.log('PASS: Chromium + WebKit native equality, PNG/late-PNG fallback, Worker validation, 1024 detail, once-only lazy load, null recovery, cap/order and download retry');
}finally{await harness.close();}
