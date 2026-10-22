// Photo stamps v3 (docs/photo-stamp-sync.md): Freddy's phone, in a normal Safari tab, sat on "Making the game asset…"
// for good. Whatever the phone hit, no step of making an asset may wait forever. In the real app on the local signed-in
// harness, at phone size in WebKit (PHOTO_STAMP_ENGINE=chromium for Chromium), each way a step could stall is forced and
// the sheet must either finish or say which step failed, and stay usable:
//   no fault          · finishes, naming each step on the way;
//   IndexedDB silent  · open never answers: finishes, the account serves the bytes;
//   IndexedDB aborts  · every write fails after it is made (as a full store fails it): finishes. v2 hung here, in
//                       both engines: the failure reaches its handler before the transaction records an error, so it
//                       rejected with null and the sheet never cleared (docs/photo-stamp-sync.md);
//   worker silent     · the extraction never answers: "Finding the stamp took too long…";
//   encoder silent    · no canvas WebP and the bundled encoder never loads: the colour asset is a PNG;
//   upload silent     · the account never answers: "Saving to your account took too long…", nothing kept.
//   node tests/photo-stamp-stall-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {startHarness} from './display-harness.mjs';
const sharp=createRequire(import.meta.url)('sharp');

const DIR='work/photo-stamp-server-sync/synthetic';fs.mkdirSync(DIR,{recursive:true});
const file=DIR+'/stall.jpg';
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2000"><rect width="1600" height="2000" fill="#3a3530"/><circle cx="800" cy="1000" r="752" fill="#5c9daa"/>`+
 `<polygon points="520,720 800,690 840,980 560,1020" fill="#7f93e0" stroke="#1b1719" stroke-width="16"/><rect x="540" y="1080" width="520" height="90" fill="#e8c43c"/></svg>`)).jpeg({quality:92}).toFile(file);

const engine=process.env.PHOTO_STAMP_ENGINE||'webkit';
const h=await startHarness({port:Number(process.env.PHOTO_STAMP_PORT||8887),state:'work/photo-stamp-server-sync/d1-stall',engine,
 viewport:{width:390,height:844},deviceScaleFactor:2,context:engine==='webkit'?{hasTouch:true,isMobile:true}:{hasTouch:true}});
const {base}=h;
const ready=async page=>{await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=1,null,{timeout:30000});};
let disc;
// One make, through the sheet's "Make … from original photo", on a fresh page with the fault in place before any script.
async function make({init,route,limits}={}){
 const page=await h.context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  if(init)await page.addInitScript(init);
  if(route)await page.route(...route);
  await ready(page);
  if(limits)await page.evaluate(l=>import('/disc-photo.mjs').then(m=>Object.assign(m.MAKE_LIMITS,l)),limits);
  const before=await page.evaluate(id=>JSON.parse(localStorage.getItem('disc-atlas-photo-stamps')||'{}').discs?.[id]?.rev||null,disc);
  await page.locator(`[data-bag-edit="${disc}"]`).first().evaluate(n=>n.click());await page.waitForSelector('#addDiscDialog[open] .bag-photo-look:not([hidden])');
  const chooser=page.waitForEvent('filechooser');await page.locator('#addDiscDialog .bag-photo-asset-make').click();await (await chooser).setFiles(file);
  await page.waitForSelector('dialog.photo-aligner[open]');
  await page.evaluate(()=>{const seen=window.__steps=[],el=document.querySelector('dialog.photo-aligner[open] .photo-aligner-status');new MutationObserver(()=>{if(seen.at(-1)!==el.textContent)seen.push(el.textContent);}).observe(el,{childList:true,characterData:true,subtree:true});});
  const t=Date.now();await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
  // Done: the sheet says the asset was made, or the aligner names what went wrong. Never: still "Making…" at 150 s.
  await page.waitForFunction(()=>/asset made/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||'')||/^(?!Making the game asset)\S/.test(document.querySelector('dialog.photo-aligner[open] .photo-aligner-status')?.textContent||''),null,{timeout:150000});
  return await page.evaluate(([id,before,ms])=>({ms,status:document.querySelector('#addDiscDialog .bag-photo-status').textContent,aligner:document.querySelector('dialog.photo-aligner[open]')?{text:document.querySelector('.photo-aligner-status').textContent,retry:!document.querySelector('dialog.photo-aligner[open] [data-aligner-confirm]').disabled}:null,
   steps:window.__steps,before,entry:JSON.parse(localStorage.getItem('disc-atlas-photo-stamps')||'{}').discs?.[id]||null}),[disc,before,Date.now()-t]).then(r=>({...r,errors,page}));
 }catch(error){await page.close();throw error;}
}
// Made and saved: both assets, from the one read (the message follows the look the disc wore when it began).
// A write that fails after it is made: the store aborts its transaction once the put is under way.
const IDB_ABORTS=()=>{const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...a){const request=put.apply(this,a),t=this.transaction;setTimeout(()=>{try{t.abort();}catch{/* Already done. */}});return request;};};
const made=r=>/^(Game|Full-color) asset made\. Saved to your account\.$/.test(r.status)&&!r.aligner&&!!r.entry?.color&&r.entry.server===true;
const results={};
try{
 await h.signIn();await h.seedBag([{mold_id:'3d60892b6812',plastic:'Star',wear:8,weight_g:172,color:'#70b7cd'}]);
 await ready(h.page);
 disc=await h.page.evaluate(()=>document.querySelector('[data-bag-edit]').dataset.bagEdit);
 await h.page.locator(`[data-bag-edit="${disc}"]`).first().evaluate(n=>n.click());await h.page.waitForSelector('#addDiscDialog[open]');
 await h.page.setInputFiles('#addDiscDialog .bag-photo-file',file);await h.page.waitForSelector('dialog.photo-aligner[open]');
 await h.page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();await h.page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]'),null,{timeout:60000});
 await h.page.locator('#saveDisc').click();await h.page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'),null,{timeout:60000});
 const server=page=>page.evaluate(async id=>{const r=await fetch('/api/bag/stamps');return (await r.json()).stamps.find(s=>s.disc_id===id)||null;},disc);

 // No fault: it finishes, and the status named each step on the way.
 let r=results.plain=await make();
 assert.ok(made(r),JSON.stringify(r));
 for(const step of ['finding the stamp…','drawing it in one ink…','drawing it in full color…','saving to your account…'])assert.ok(r.steps.includes('Making the game asset: '+step),'named step '+step+': '+JSON.stringify(r.steps));
 await r.page.close();

 // IndexedDB never answers: the account takes it; the cache is given up on; the viewer draws it from the account.
 r=results.idbSilent=await make({init:()=>{indexedDB.open=()=>({});}});
 assert.ok(made(r),JSON.stringify(r));assert.notEqual(r.entry.rev,r.before,'a new asset');
 // Reloaded with IndexedDB still silent: the viewer draws the colour asset, fetched from the account.
 await ready(r.page);await r.page.locator(`[data-bag-inspect="${disc}"]`).first().evaluate(n=>n.click());
 await r.page.waitForFunction(()=>document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready',null,{timeout:60000});
 await r.page.evaluate(id=>import('/disc3d/photo-stamps.mjs').then(m=>m.setPhotoLook(id,JSON.parse(localStorage.getItem('disc-atlas-photo-stamps')).discs[id].key,'color')),disc);
 await r.page.waitForFunction(()=>/\/c$/.test(window.Disc3D?.viewer?.debug?.stamp?.material?.map?.userData?.stampAsset||''),null,{timeout:60000});
 await r.page.close();

 // Every IndexedDB write fails after it is made, as a full store fails it.
 r=results.idbAborts=await make({init:IDB_ABORTS});
 assert.ok(made(r),JSON.stringify(r));assert.equal((await server(r.page)).rev,r.entry.rev,'the account has it');
 await r.page.close();

 // The extraction never answers.
 r=results.workerSilent=await make({init:()=>{window.Worker=class{postMessage(){}terminate(){}};},limits:{extract:3000}});
 assert.equal(r.aligner?.text,'Finding the stamp took too long on this device. Try again, or make it on a computer: it shows here too.');
 assert.equal(r.aligner.retry,true,'the aligner can try again');assert.equal(r.entry?.rev,r.before,'nothing kept');
 await r.page.close();

 // No canvas WebP, and the bundled encoder never loads: the colour asset goes up as PNG.
 r=results.encoderSilent=await make({
  init:()=>{const toBlob=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(cb,type,q){return toBlob.call(this,cb,type==='image/webp'?'image/png':type,q);};},
  route:['**/disc-webp.mjs',()=>new Promise(()=>{})],limits:{encode:3000}});
 assert.ok(made(r),JSON.stringify(r));
 assert.equal(await r.page.evaluate(id=>fetch('/api/bag/discs/'+id+'/stamp/color').then(x=>x.headers.get('Content-Type')),disc),'image/png');
 await r.page.close();

 // The account never answers the upload: the aligner says so, and nothing is kept.
 r=results.uploadSilent=await make({route:['**/api/bag/discs/*/stamp',route=>route.request().method()==='PUT'?new Promise(()=>{}):route.continue()],limits:{save:4000}});
 assert.equal(r.aligner?.text,'Saving to your account took too long. Check your connection and try again.');
 assert.equal(r.aligner.retry,true);assert.equal(r.entry?.rev,r.before,'nothing kept');
 await r.page.close();

 for(const [name,x] of Object.entries(results))assert.deepEqual(x.errors,[],name+' page errors');
 console.log(engine+' '+Object.entries(results).map(([n,x])=>n+' '+x.ms+' ms').join(', '));
 console.log('photo stamp stall: pass');
}finally{await h.stop();}
