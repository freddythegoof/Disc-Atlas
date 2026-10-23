// Evidence for docs/clear-plastic-discs.md, Part B (the clean stamp mode), through the real product on the local
// signed-in harness: Freddy's blue Raptor (Z, clear), its existing stored photo as the test input (pinned Oct 23, 2026),
// on the Clear finish, three ways:
//   A  today's full texture: the Photo look, the photo as stored, table and shadows included;
//   B  stamp only: Game asset made in one click from that photo by this branch (the clean stamp mode);
//   C  for reference, Game asset made from the same photo by main's extraction (no clean mode), on the clear plastic;
// plus an opaque control: the same Raptor on Opaque, Photo look. Each in the viewer (Top and 3/4, light and Midnight);
// B also out of its Storage rack and out of the bag.
// The photo is the player's and is never committed: read only from the ignored work/clear-plastic-discs/input/, and
// everything this writes goes to the ignored work/clear-plastic-discs/evidence/partb/. Main's extraction modules come
// from the ignored detached checkout work/clear-plastic-discs/baseline/ (origin/main).
//   node tests/clear-plastic-partb-evidence.mjs
import fs from 'node:fs';
import {startHarness} from './display-harness.mjs';

const PHOTO='work/clear-plastic-discs/input/raptor-0cef6b2f.webp',OLD='work/clear-plastic-discs/baseline/public',OUT='work/clear-plastic-discs/evidence/partb';
if(!fs.existsSync(PHOTO)||!fs.existsSync(OLD+'/disc-stamp-worker.mjs')){console.error('No Raptor photo or no main checkout in work/clear-plastic-discs: nothing to show.');process.exit(1);}
fs.mkdirSync(OUT,{recursive:true});
const photo=fs.readFileSync(PHOTO),results={};
const h=await startHarness({port:Number(process.env.CLEAR_PORT||8874),state:'work/clear-plastic-discs/d1-partb',deviceScaleFactor:2});
const {page,base,context,errors}=h;
const wait=ms=>page.waitForTimeout(ms),log=(...a)=>console.log(new Date().toISOString().slice(11,19),...a);
// Main's extraction: its worker and the modules it reads, in place of this branch's.
const MAIN=/\/disc-(stamp-worker|stamp-extract|stamp-color|stamp-delight|albedo)\.mjs(\?.*)?$/;
const serveMain=async on=>{if(on)await context.route(MAIN,route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(OLD+'/disc-'+MAIN.exec(new URL(route.request().url()).pathname)[1]+'.mjs')}));else await context.unroute(MAIN);};
try{
 await h.signIn();
 const raptor=note=>({mold_id:'35a861477cf9',plastic:'Z',wear:10,weight_g:174,color:'#0984a8',in_bag:false,notes:note});
 await h.seedBag([{...raptor('clean'),finish:'clear'},{...raptor('today'),finish:'clear'},{...raptor('opaque'),finish:'opaque'},{mold_id:'7446eb39abe5',plastic:'ESP',wear:8,weight_g:177,color:'#b99bdd',notes:'bag'}]);
 const discs=async()=>page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs);
 const all=await discs(),id=note=>all.find(d=>d.notes===note).id;
 for(const note of ['clean','today','opaque'])await page.evaluate(async([id,bytes])=>{
  const r=await fetch('/api/bag/discs/'+id+'/photo',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'image/webp','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken},body:new Uint8Array(bytes)});
  if(!r.ok)throw Error(await r.text());
 },[id(note),[...photo]]);
 const openBag=async()=>{await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=4);};
 const theme=async scheme=>{await page.emulateMedia({colorScheme:scheme});await page.waitForFunction(t=>document.documentElement.dataset.theme===t,scheme==='dark'?'midnight':'light');await wait(600);};
 // The viewer: Top and 3/4 of the stage, and the centre of the Top view at twice the size.
 const viewer=async(note,tag)=>{
  for(const scheme of ['light','dark']){
   await theme(scheme);await openBag();
   await page.locator(`[data-bag-inspect="${id(note)}"]`).first().evaluate(n=>n.click());
   await page.waitForFunction(()=>document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready');await wait(2500);
   const stage=page.locator('#detail .disc3d-stage');
   await page.locator('#detail [data-disc3d] button',{hasText:/^Top$/}).click();await wait(900);
   fs.writeFileSync(`${OUT}/${tag}-${scheme}-top.png`,await stage.screenshot());
   const box=await stage.boundingBox();
   fs.writeFileSync(`${OUT}/${tag}-${scheme}-zoom.png`,await page.screenshot({clip:{x:box.x+box.width*.25,y:box.y+box.height*.2,width:box.width*.5,height:box.height*.5}}));
   await page.locator('#detail [data-disc3d] button',{hasText:/^3\/4$/}).click();await wait(900);
   fs.writeFileSync(`${OUT}/${tag}-${scheme}-angle.png`,await stage.screenshot());
  }
  await theme('light');
 };
 // One click on Game asset in the disc's sheet; resolves with the status line when it is done.
 const makeAsset=async note=>{
  await openBag();await page.locator(`[data-bag-edit="${id(note)}"]`).first().evaluate(n=>n.click());await page.waitForSelector('#addDiscDialog[open]');
  const t=Date.now();await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Game asset'}).click();
  await page.waitForFunction(()=>/^(?!Making the game asset)\S/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:240000});
  const status=await page.locator('#addDiscDialog .bag-photo-status').textContent();
  await page.keyboard.press('Escape');await page.waitForSelector('#addDiscDialog:not([open])');
  return {status,ms:Date.now()-t};
 };
 const assetBytes=note=>page.evaluate(async id=>{const s=(await (await fetch('/api/bag/stamps',{credentials:'same-origin'})).json()).stamps.find(x=>x.disc_id===id);if(!s)return null;
  const r=await fetch('/api/bag/discs/'+id+'/stamp/color?v='+s.rev,{credentials:'same-origin'});return {look:s.look,type:r.headers.get('Content-Type'),bytes:[...new Uint8Array(await r.arrayBuffer())]};},id(note));
 const saveAsset=async(note,tag)=>{const a=await assetBytes(note);if(a)fs.writeFileSync(`${OUT}/${tag}-asset.${a.type==='image/webp'?'webp':'png'}`,Buffer.from(a.bytes));return a&&{look:a.look,type:a.type,bytes:a.bytes.length};};

 log('A: Photo look on Clear');await viewer('clean','A-photo-clear');
 log('control: Photo look on Opaque');await viewer('opaque','control-photo-opaque');
 log('B: Game asset, clean stamp mode');results.B=await makeAsset('clean');log(results.B);results.B.asset=await saveAsset('clean','B');
 await viewer('clean','B-asset-clear');
 log('C: Game asset by main');await serveMain(true);results.C=await makeAsset('today');await serveMain(false);log(results.C);results.C.asset=await saveAsset('today','C');
 await viewer('today','C-mainasset-clear');

 // B out of its Storage rack, then out of the bag.
 for(const scheme of ['light','dark']){
  await theme(scheme);await openBag();
  await page.locator('#myBagViews [data-bag-view="storage"]').click();await page.locator('#storageScene[data-engine="ready"]').waitFor({timeout:30000});await wait(1500);
  await page.evaluate(id=>window.BagApp.scenes.storage.pull(id),id('clean'));await page.mouse.move(2,2);await wait(3000);
  const host=await page.locator('#storageScene').boundingBox();
  fs.writeFileSync(`${OUT}/B-storage-pulled-${scheme}.png`,await page.screenshot({clip:{x:0,y:Math.max(0,host.y),width:1440,height:Math.min(1000-Math.max(0,host.y),host.height)}}));
 }
 await page.evaluate(async id=>{const r=await fetch('/api/bag/discs/'+id,{method:'PATCH',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken},body:JSON.stringify({in_bag:true})});if(!r.ok)throw Error(await r.text());},id('clean'));
 for(const scheme of ['light','dark']){
  await theme(scheme);await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelector('#bagScene')?.dataset.phase==='open');await wait(1500);
  await page.locator('#bagScene').evaluate(n=>n.scrollIntoView({block:'start'}));await wait(300);
  await page.locator(`[data-physical-disc="${id('clean')}"]`).evaluate(n=>n.click());
  await page.mouse.move(2,2);await wait(3500);
  (results.bagWalls??={})[scheme]=await page.evaluate(id=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().find(d=>d.id===id),id('clean')).then(d=>({clear:d?.clear,shown:d?.shown,glow:d?.glow}));
  const bag=await page.locator('#bagScene').boundingBox();
  fs.writeFileSync(`${OUT}/B-bag-pulled-${scheme}.png`,await page.screenshot({clip:{x:0,y:Math.max(0,bag.y),width:1440,height:Math.min(1000-Math.max(0,bag.y),bag.height)}}));
 }
 results.errors=errors;
 fs.writeFileSync(`${OUT}/results.json`,JSON.stringify(results,null,1));
 log('done',JSON.stringify({B:results.B?.status,C:results.C?.status,errors}));
}finally{await h.stop();}
