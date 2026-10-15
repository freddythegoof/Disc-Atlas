// Optional ref selects the actual historical preparePhoto, not a copy of its ladder.
import {mkdirSync,writeFileSync} from 'node:fs';
import {photoHarness,playwright} from './photo-harness.mjs';
const ref=process.argv[2],harness=await photoHarness(ref),results=[];
try{
 for(const engine of ['chromium','webkit']){
  const browser=await playwright[engine].launch({headless:true});
  try{
   for(const mode of ['native','png','null']){
    const page=await browser.newPage();await page.goto(harness.base);
    const result=await page.evaluate(async mode=>{
     const {decodePhoto,albedoCanvas,preparePhoto}=await import('/disc-photo.mjs');
     const image=await decodePhoto(await (await fetch('/fixtures/stamped-disc.webp')).blob());
     const native=HTMLCanvasElement.prototype.toBlob,rows=[],steps=[];
     HTMLCanvasElement.prototype.toBlob=function(callback,type,quality){
      if(mode==='null'){callback(null);return;}
      return native.call(this,callback,mode==='png'?'image/png':type,quality);
     };
     try{
      for(const size of [1024,768,512]){
       const {canvas}=albedoCanvas(image,{},size);
       for(const quality of [.86,.72,.56,.4]){
        const blob=await new Promise(r=>canvas.toBlob(r,'image/webp',quality));
        rows.push({size,quality,type:blob?.type??null,bytes:blob?.size??null});
       }
      }
      const encode=HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob=function(callback,type,quality){return encode.call(this,blob=>{steps.push({size:this.width,quality,type:blob?.type??null,bytes:blob?.size??null});callback(blob);},type,quality);};
      let outcome;try{const {blob}=await preparePhoto(image);outcome={type:blob.type,bytes:blob.size};}catch(e){outcome={error:e.message};}
      return {mode,dimensions:[image.width,image.height],webp:rows.some(r=>r.type==='image/webp'),rows,steps,outcome};
     }finally{HTMLCanvasElement.prototype.toBlob=native;image.close();}
    },mode);
    results.push({engine,version:browser.version(),...result});await page.close();
   }
  }finally{await browser.close();}
 }
 mkdirSync('outputs/photo-phone',{recursive:true});
 writeFileSync('outputs/photo-phone/compression-'+(ref?'before':'current')+'.json',JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify(results,null,2));
}finally{await harness.close();}
