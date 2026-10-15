// Characterize the actual pre-fix decoder with real bytes, without a live service.
// Optional historical source: node tests/photo-heic-characterize-browser.mjs <git-ref>
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const historical=process.argv[2]&&execFileSync('git',['show',process.argv[2]+':public/disc-photo.mjs']);
const server=createServer((req,res)=>{
 try{
  const path=new URL(req.url,'http://localhost').pathname;
  res.setHeader('Content-Type','text/javascript');
  res.end(path==='/disc-photo.mjs'&&historical?historical:readFileSync(new URL('../public'+path,import.meta.url)));
 }catch{res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
 const page=await browser.newPage();await page.goto('http://127.0.0.1:'+server.address().port+'/disc-photo.mjs');
 const rows=[];
 for(const [name,fixture,type] of [
  ['HEIC, empty type','disc-photo.heic',''],['HEIC, image/heic','disc-photo.heic','image/heic'],
  ['HEIC, octet-stream','disc-photo.heic','application/octet-stream'],
  ['JPEG','disc-photo.jpg','image/jpeg'],['PNG','disc-photo.png','image/png'],
 ]){
  const result=await page.evaluate(async({bytes,name,type})=>{
   const {decodePhoto}=await import('/disc-photo.mjs');
   try{const image=await decodePhoto(new File([new Uint8Array(bytes)],name,{type}));const size=[image.width,image.height];image.close();return {door:'decoded',size};}
   catch(e){return {door:e.message.startsWith('Choose')?'type gate':'createImageBitmap',message:e.message};}
  },{bytes:[...readFileSync(new URL('./fixtures/'+fixture,import.meta.url))],name:fixture,type});
  rows.push({name,type,...result});
 }
 console.log(JSON.stringify({browser:browser.version(),rows},null,2));
 assert.deepEqual(rows.map(r=>r.door),['type gate','createImageBitmap','type gate','decoded','decoded']);
}finally{await browser?.close();await new Promise(r=>server.close(r));}
