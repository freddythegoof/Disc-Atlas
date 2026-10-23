// Clear plastics (docs/clear-plastic-discs.md), Part A, end to end on the local signed-in harness (local Wrangler + D1):
// the Add/Edit sheet's Opaque · Clear choice saves and survives a reload; a clear copy renders see-through in the 3D
// viewer (panel and pop-out), in My Bag (front wall in its pocket, both walls pulled out large), in Storage's racks and
// pulled from them, and in the bag list's thumbnails; and it is see-through in fact: the same pixels of a clear copy
// change with the page behind them (light against Midnight), an opaque copy's do not.
// Photos are the player's and are never committed: the Raptor's own photo is used when it sits in the ignored
// work/clear-plastic-discs/input/, else the committed stamped-disc fixture. Shots go to the ignored
// work/clear-plastic-discs/evidence/suite/.
//   node tests/clear-plastic-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {startHarness} from './display-harness.mjs';

const OUT='work/clear-plastic-discs/evidence/suite',RAPTOR='work/clear-plastic-discs/input/raptor-0cef6b2f.webp';
fs.mkdirSync(OUT,{recursive:true});
const photo=fs.readFileSync(fs.existsSync(RAPTOR)?RAPTOR:'tests/fixtures/stamped-disc.webp');
const check=label=>console.log('ok -',label);
const h=await startHarness({port:Number(process.env.CLEAR_PORT||8873),state:'work/clear-plastic-discs/d1'});
const {page,base,errors}=h;
const wait=ms=>page.waitForTimeout(ms);
try{
 await h.signIn();
 // The Raptor (clear, in Storage, with its photo), a clear Buzzz in the bag, and two opaque controls.
 await h.seedBag([
  {mold_id:'35a861477cf9',plastic:'Z',wear:10,weight_g:174,color:'#0984a8',finish:'clear',in_bag:false,notes:'raptor'},
  {mold_id:'7446eb39abe5',plastic:'Z',wear:8,weight_g:177,color:'#b99bdd',finish:'clear',notes:'buzzz'},
  {mold_id:'6be51219c6db',plastic:'ESP',wear:9,weight_g:174,color:'#f2c14e',notes:'undertaker'},
  {mold_id:'761c90d342f5',plastic:'Electron',wear:6,weight_g:175,color:'#e6c668',notes:'envy'},
  {mold_id:'7446eb39abe5',plastic:'Z',wear:7,weight_g:175,color:'#e05a4f',finish:'clear',in_bag:false,status:'lost',lostDate:'2026-10-01',notes:'lost'}
 ]);
 const discs=async()=>page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs);
 const byNote=async note=>(await discs()).find(d=>d.notes===note);
 const raptor=await byNote('raptor'),buzzz=await byNote('buzzz'),undertaker=await byNote('undertaker');
 assert.equal(raptor.finish,'clear');assert.equal(undertaker.finish,'opaque');
 await page.evaluate(async([id,bytes])=>{
  const r=await fetch('/api/bag/discs/'+id+'/photo',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'image/webp','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken},body:new Uint8Array(bytes)});
  if(!r.ok)throw Error(await r.text());
 },[raptor.id,[...photo]]);
 const openBag=async()=>{await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=4);};

 // 1. The sheet: Opaque · Clear beside the colour, saved, and still chosen after a reload.
 await openBag();
 const edit=async id=>{await page.locator(`[data-bag-edit="${id}"]`).first().evaluate(n=>n.click());await page.waitForSelector('#addDiscDialog[open]');};
 const chosen=()=>page.evaluate(()=>document.querySelector('#addDiscForm input[name="bagFinish"]:checked')?.value);
 await edit(undertaker.id);
 assert.equal(await chosen(),'opaque','an existing disc opens Opaque');
 await page.locator('#bagFinishField label',{hasText:'Clear'}).click();
 assert.match(await page.locator('#bagFinishHint').innerText(),/see-through plastic tinted by the disc color/);
 await page.locator('#saveDisc').click();await page.waitForSelector('#addDiscDialog:not([open])');
 assert.equal((await byNote('undertaker')).finish,'clear');
 await openBag();await edit(undertaker.id);
 assert.equal(await chosen(),'clear','Clear survives a reload');
 await page.locator('#bagFinishField label',{hasText:'Opaque'}).click();
 await page.locator('#saveDisc').click();await page.waitForSelector('#addDiscDialog:not([open])');
 assert.equal((await byNote('undertaker')).finish,'opaque');
 // A disc with a photo says what Clear does to it, plainly.
 await edit(raptor.id);
 assert.equal(await chosen(),'clear');
 assert.match(await page.locator('#bagFinishHint').innerText(),/The photo stays as it was taken\. Game asset keeps just the stamp/);
 await page.keyboard.press('Escape');await page.waitForSelector('#addDiscDialog:not([open])');
 check('the sheet saves Opaque · Clear, and it survives a reload');

 // 2. The viewer. A rim pixel and a plate pixel of the disc, read straight off the drawing buffer from the top view:
 // a clear copy's change with the page behind (light against Midnight), an opaque copy's stay put.
 const theme=async scheme=>{await page.emulateMedia({colorScheme:scheme});await page.waitForFunction(t=>document.documentElement.dataset.theme===t,scheme==='dark'?'midnight':'light');await wait(700);};
 const inspect=async id=>{
  await openBag();await page.locator(`[data-bag-inspect="${id}"]`).first().evaluate(n=>n.click());
  await page.waitForFunction(()=>document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready');await wait(1500);
  await page.locator('#detail [data-disc3d] button',{hasText:/^Top$/}).click();await wait(900);
 };
 const samples=()=>page.evaluate(()=>{
  const v=window.Disc3D.viewer.debug,gl=v.renderer.getContext(),w=gl.drawingBufferWidth,hgt=gl.drawingBufferHeight;
  v.renderer.render(v.scene,v.camera);
  const row=new Uint8Array(w*4);gl.readPixels(0,hgt>>1,w,1,gl.RGBA,gl.UNSIGNED_BYTE,row);
  let left=-1,right=-1;for(let x=0;x<w;x++)if(row[4*x+3]>250){if(left<0)left=x;right=x;}
  const centre=(left+right)/2,radius=(right-left)/2,at=f=>{const x=Math.round(centre+radius*f);return [...row.slice(4*x,4*x+3)];};
  return {rim:at(.94),plate:at(.72),clear:v.scene.getObjectByName('clear-front-filter')?.visible??false};
 });
 const shift=(a,b)=>Math.max(...a.map((v,i)=>Math.abs(v-b[i])));
 const viewerCase=async(id,name)=>{
  await theme('light');await inspect(id);const light=await samples();
  await page.locator('#detail .disc3d-stage').screenshot({path:`${OUT}/viewer-${name}-light.png`});
  await theme('dark');await wait(500);const dark=await samples();
  await page.locator('#detail .disc3d-stage').screenshot({path:`${OUT}/viewer-${name}-dark.png`});
  await theme('light');
  return {light,dark,rim:shift(light.rim,dark.rim),plate:shift(light.plate,dark.plate)};
 };
 const clearView=await viewerCase(buzzz.id,'buzzz-clear'),opaqueView=await viewerCase(undertaker.id,'undertaker-opaque');
 assert.ok(clearView.light.clear&&clearView.dark.clear,'the clear passes draw');
 assert.equal(opaqueView.light.clear,false,'an opaque disc draws no clear pass');
 assert.ok(clearView.rim>=24&&clearView.plate>=24,`a clear copy shows the page through it (rim ${clearView.rim}, plate ${clearView.plate})`);
 assert.ok(opaqueView.rim<=3&&opaqueView.plate<=3,`an opaque copy does not (rim ${opaqueView.rim}, plate ${opaqueView.plate})`);
 // The Raptor with its photo, both themes: the clear plastic round today's texture (Part A's interim).
 await viewerCase(raptor.id,'raptor-photo');
 check(`the viewer draws a clear copy see-through, in both themes (page shows through by ${clearView.rim}/${clearView.plate}; opaque ${opaqueView.rim}/${opaqueView.plate})`);
 // The pop-out is the same viewer at its size.
 await inspect(buzzz.id);
 await page.locator('#detail [data-disc3d-expand]').click();await page.waitForSelector('dialog.disc3d-dialog[open]');await wait(1500);
 assert.ok(await page.evaluate(()=>window.Disc3D.popout.debug.scene.getObjectByName('clear-front-filter').visible),'the pop-out draws it clear too');
 await page.locator('dialog.disc3d-dialog[open] .disc3d-viewport').screenshot({path:`${OUT}/popout-buzzz-clear.png`});
 await page.keyboard.press('Escape');await wait(600);
 check('the pop-out draws the clear copy');

 // 3. My Bag: the clear Buzzz wears its front wall in the pocket and both walls pulled out large; opaque copies none.
 const state=()=>page.evaluate(()=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().filter(d=>!d.empty).map(({id,clear})=>({id,clear})));
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelector('#bagScene')?.dataset.phase==='open');await wait(1500);
 const before=await state();
 assert.equal(before.find(d=>d.id===buzzz.id).clear,1,'in its pocket: the front wall');
 assert.ok(before.filter(d=>d.id!==buzzz.id).every(d=>d.clear===0),'opaque copies draw no clear pass');
 await page.locator('#bagScene').evaluate(n=>n.scrollIntoView({block:'start'}));await wait(300);
 await page.locator(`[data-physical-disc="${buzzz.id}"]`).evaluate(n=>n.click());
 await page.waitForFunction(id=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().find(d=>d.id===id)?.clear===2,buzzz.id,{timeout:15000});await wait(1200);
 const bag=await page.locator('#bagScene').boundingBox();
 await page.screenshot({path:`${OUT}/bag-buzzz-pulled.png`,clip:{x:0,y:Math.max(0,bag.y),width:1440,height:Math.min(1000-Math.max(0,bag.y),bag.height)}});
 check('My Bag: a clear copy is clear in its pocket and pulled out large');

 // 4. Storage: the Raptor racks clear, and comes out of its rack clear with both walls.
 await page.locator('#myBagViews [data-bag-view="storage"]').click();
 await page.locator('#storageScene[data-engine="ready"]').waitFor({timeout:30000});await wait(1200);
 const racks=()=>page.evaluate(()=>window.BagApp.scenes.storage.state);
 assert.equal((await racks()).batches,1,'one stored disc: one batch (a clear one)');
 await page.evaluate(id=>window.BagApp.scenes.storage.pull(id),raptor.id);await wait(2500);
 const host=await page.locator('#storageScene').boundingBox();
 await page.screenshot({path:`${OUT}/storage-raptor-pulled.png`,clip:{x:0,y:Math.max(0,host.y),width:1440,height:Math.min(1000-Math.max(0,host.y),host.height)}});
 check('Storage racks the Raptor clear and pulls it out clear');

 // 5. The bag list's thumbnails mark their clear copies, and draw them.
 await page.locator('#myBagViews [data-bag-view="bag"]').click();await wait(500);
 const marked=await page.evaluate(()=>[...document.querySelectorAll('.my-bag-disc')].map(row=>[row.dataset.discId,row.querySelector('.disc-thumbnail')?.dataset.finish||null]));
 assert.ok(marked.some(([id,f])=>id===buzzz.id&&f==='clear'),'the clear Buzzz is marked in the bag list');
 const lostId=(await byNote('lost')).id;assert.ok(marked.filter(([id])=>id!==buzzz.id&&id!==raptor.id&&id!==lostId).every(([,f])=>f===null),'opaque rows are not');
 for(const scheme of ['light','dark']){
  await theme(scheme);await page.goto(base+'/?bag=1');
  const host=page.locator(`[data-disc-id="${buzzz.id}"] [data-disc-thumbnail]`);await host.scrollIntoViewIfNeeded();
  await page.locator(`[data-disc-id="${buzzz.id}"] [data-disc-thumbnail].has-3d`).waitFor({timeout:20000});await wait(800);
  await page.locator(`[data-disc-id="${buzzz.id}"]`).screenshot({path:`${OUT}/thumbnail-buzzz-${scheme}.png`});
 }
 await theme('light');
 // A theme change with the list open repaints the clear thumbnail over the new row colour (Codex P2 on PR #44): the
 // same pixel as a fresh load in that theme, and not the light one.
 const thumbPixel=()=>page.locator(`[data-disc-id="${buzzz.id}"] [data-disc-thumbnail].has-3d canvas`).evaluate(c=>{const g=c.getContext('2d'),x=Math.round(c.width*.5),y=Math.round(c.height*.82);return [...g.getImageData(x,y,1,1).data].slice(0,3);});
 const thumbHost=()=>page.locator(`[data-disc-id="${buzzz.id}"] [data-disc-thumbnail]`).scrollIntoViewIfNeeded().then(()=>page.locator(`[data-disc-id="${buzzz.id}"] [data-disc-thumbnail].has-3d`).waitFor({timeout:20000}));
 await page.goto(base+'/?bag=1');await thumbHost();await wait(800);const lightPx=await thumbPixel();
 await theme('dark');await wait(1500);const livePx=await thumbPixel();
 await page.goto(base+'/?bag=1');await thumbHost();await wait(800);const freshPx=await thumbPixel();
 await theme('light');
 assert.ok(shift(livePx,freshPx)<=3,`live switch ${livePx} matches a fresh Midnight load ${freshPx}`);
 assert.ok(shift(lightPx,livePx)>=10,`and is not the light one ${lightPx}`);
 check('thumbnails carry the finish, and repaint on a theme change');

 // 6. Lost: a clear disc in the graveyard takes the new page colour on a theme change (Codex P2 on PR #44).
 const lostPages=()=>page.evaluate(()=>window.BagApp.scenes.lost.state.clearPages);
 const openLost=async()=>{await page.goto(base+'/?bag=1');await page.locator('#myBagViews [data-bag-view="lost"]').click();await page.locator('#lostScene[data-engine="ready"]').waitFor({timeout:30000});await page.waitForFunction(()=>window.BagApp.scenes.lost?.state.clearPages.length===1);await wait(800);};
 await openLost();const lostLight=await lostPages();
 await theme('dark');await wait(1200);const lostLive=await lostPages();
 await openLost();const lostFresh=await lostPages();
 await theme('light');
 assert.deepEqual(lostLive,lostFresh,`live ${lostLive} matches a fresh Midnight load ${lostFresh}`);
 assert.notDeepEqual(lostLight,lostLive,'and differs from light');
 check('Lost repaints a clear disc on a theme change');

 assert.deepEqual(errors,[],'no page errors');
 console.log('clear-plastic-browser: all checks passed');
}finally{await h.stop();}
