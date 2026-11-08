// Clear finish opacity (docs/clear-opacity.md), end to end on the local signed-in harness: the slider shows on Clear only,
// saves on the account and survives a reload; each position reaches the list thumbnail, the panel and pop-out viewers, the bag
// (pocket and pulled), Storage's racks and a pulled rack disc, and Lost; near-glass shows the page through it and full opacity
// is the opaque disc in that colour, pixel for pixel, on Paper and Midnight; and moving it never makes a game asset again.
// The Raptor's photo is the player's and is never committed: it is used when it sits in the ignored
// work/clear-plastic-discs/input/, else the committed stamped-disc fixture. Shots go to the ignored work/clear-opacity/evidence/suite/.
//   node tests/clear-opacity-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {startHarness} from './display-harness.mjs';

const OUT='work/clear-opacity/evidence/suite',RAPTOR='work/clear-plastic-discs/input/raptor-0cef6b2f.webp';
fs.mkdirSync(OUT,{recursive:true});
const photo=fs.readFileSync(fs.existsSync(RAPTOR)?RAPTOR:'tests/fixtures/stamped-disc.webp');
const check=label=>console.log('ok -',label);
const h=await startHarness({port:Number(process.env.CLEAR_PORT||8874),state:'work/clear-opacity/d1'});
const {page,base,errors,context}=h;
page.on('console',m=>{if(/shader error|program not valid|WebGLProgram/i.test(m.text()))errors.push(m.text().slice(0,400));});
// Every stamp extraction (a game asset made): extract() announces itself on a channel the page hears.
const SIGNATURE='export function extract(data,size,plate,{color=false,stored=false,clear=false,seeThrough=false}={}){';
await context.route(/\/disc-stamp-worker\.mjs(\?.*)?$/,async route=>{
 const body=await (await route.fetch()).text();if(!body.includes(SIGNATURE))throw Error('extract() signature moved');
 await route.fulfill({contentType:'text/javascript',body:body.replace(SIGNATURE,SIGNATURE+"new BroadcastChannel('opacity-test').postMessage({clear});")});
});
await context.addInitScript(()=>{window.__makes=[];new BroadcastChannel('opacity-test').onmessage=e=>window.__makes.push(e.data);});
const wait=ms=>page.waitForTimeout(ms);
const BUZZZ='7446eb39abe5',RAPTOR_MOLD='35a861477cf9',BLUE='#0984a8';
const copy=(notes,extra={})=>({mold_id:BUZZZ,plastic:'Z',wear:9,weight_g:175,color:BLUE,notes,...extra});
try{
 await h.signIn();
 await h.seedBag([
  copy('glass',{finish:'clear',finish_opacity:0}),copy('today',{finish:'clear'}),copy('frosted',{finish:'clear',finish_opacity:60}),
  copy('solid',{finish:'clear',finish_opacity:100}),copy('opaque'),
  {mold_id:RAPTOR_MOLD,plastic:'Z',wear:10,weight_g:174,color:BLUE,finish:'clear',in_bag:false,notes:'raptor'},
  {...copy('rack-glass',{finish:'clear',finish_opacity:0}),in_bag:false},{...copy('rack-frosted',{finish:'clear',finish_opacity:60}),in_bag:false},
  {...copy('rack-solid',{finish:'clear',finish_opacity:100}),in_bag:false},
  {...copy('lost-glass',{finish:'clear',finish_opacity:0}),in_bag:false,status:'lost',lostDate:'2026-10-01'}
 ]);
 const discs=async()=>page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs);
 const byNote=async note=>(await discs()).find(d=>d.notes===note);
 const id={};for(const d of await discs())id[d.notes]=d.id;
 assert.equal((await byNote('today')).finish_opacity,null);assert.equal((await byNote('glass')).finish_opacity,0);
 const openBag=async()=>{await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=5);};

 // 1. What each position asks of the plastic (three.js modules run only here, through the importmap).
 await openBag();
 await page.evaluate(async()=>{
  const {clearLook,clearTint,CLEAR,CLEAR_RANGE}=await import('/disc3d/clear.mjs'),{FINISH_OPACITY}=await import('/bag-values.js');
  const same=(a,b,m)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw Error(m+': '+JSON.stringify(a)+' vs '+JSON.stringify(b));};
  for(const today of [FINISH_OPACITY.today,null,undefined,-1,101,1.5])same(clearLook(today),{density:1,haze:1,solid:0},'today '+today);
  same(clearLook(0),{density:CLEAR_RANGE.density,haze:CLEAR_RANGE.haze,solid:0},'the glass end');same(clearLook(100).solid,1,'the opaque end');
  for(let v=1;v<=FINISH_OPACITY.today;v++)if(clearLook(v).density<=clearLook(v-1).density)throw Error('dye falls '+v);
  for(let v=FINISH_OPACITY.today+1;v<=100;v++)if(clearLook(v).solid<=clearLook(v-1).solid)throw Error('solidifies '+v);
  const tint=opacity=>clearTint('clear','#537b80','#004386',{opacity});
  same(tint(null),{tint:'#004386',wall:'#004386',exponent:CLEAR.trueDensity,sampled:true},'a true colour at today');
  same(tint(0).wall,'#004386','the true colour toward glass');same(tint(100).wall,'#537b80','the disc colour at opaque');
  same(tint(60).tint,'#004386','a photo keeps the true colour');
  if(tint(60).wall==='#004386')throw Error('the walls move on the way to opaque');
 });
 check('each position asks what it says of the plastic; today\'s asks nothing');

 // 2. The sheet.
 const edit=async d=>{await page.locator(`[data-bag-edit="${d}"]`).first().evaluate(n=>n.click());await page.waitForSelector('#addDiscDialog[open]');};
 const close=async()=>{await page.keyboard.press('Escape');await page.waitForSelector('#addDiscDialog:not([open])');};
 const save=async()=>{await page.locator('#saveDisc').click();await page.waitForSelector('#addDiscDialog:not([open])');};
 const slide=value=>page.locator('#bagOpacity').evaluate((n,v)=>{n.value=v;n.dispatchEvent(new Event('input',{bubbles:true}));},String(value));
 const field=page.locator('#bagOpacityField'),slider=()=>page.locator('#bagOpacity').inputValue();
 await edit(id.opaque);assert.equal(await field.isVisible(),false,'an opaque copy shows no slider');
 await page.locator('#bagFinishField label',{hasText:'Clear'}).click();
 assert.equal(await field.isVisible(),true,'Clear shows it');assert.equal(await slider(),'30','a new Clear starts at today\'s look');
 await page.locator('#bagFinishField label',{hasText:'Opaque'}).click();assert.equal(await field.isVisible(),false,'Opaque hides it again');
 await close();
 // No plastic brand on the control: Freddy's call (docs/clear-opacity.md).
 await edit(id.today);assert.equal(await slider(),'30','a clear copy never moved sits at today\'s look');
 const copyText=(await field.innerText()).toLowerCase();
 for(const brand of ['champion','opto','star','esp','neutron','proton'])assert.ok(!copyText.includes(brand),brand+' on the control');
 assert.match(await page.locator('#bagOpacityScale').innerText(),/Clear\s+Opaque/);
 for(const [value,word] of [[0,'Crystal'],[30,'Clear'],[60,'Frosted'],[85,'Milky'],[100,'Opaque']]){await slide(value);assert.equal(await page.locator('#bagOpacityValue').innerText(),word);}
 // The little disc beside it draws what the slider says.
 await slide(0);await page.locator('#bagOpacityPreview [data-disc-thumbnail].has-3d').waitFor({timeout:20000});
 assert.equal(await page.locator('#bagOpacityPreview [data-disc-thumbnail]').getAttribute('data-opacity'),'0');
 await page.locator('#addDiscDialog').screenshot({path:`${OUT}/sheet-slider.png`});
 // The little disc keeps to its box, beside the slider, at a desk and on a phone in Midnight.
 const clearOfSlider=async where=>{const [disc,bar,sheet]=await Promise.all(['#bagOpacityPreview [data-disc-thumbnail]','#bagOpacity','#addDiscDialog'].map(q=>page.locator(q).boundingBox()));assert.ok(disc.x+disc.width<=bar.x,`${where}: the preview ends before the slider (${disc.x+disc.width} against ${bar.x})`);assert.ok(bar.x+bar.width<=sheet.x+sheet.width,where+': the slider stays in the sheet');};
 await clearOfSlider('desktop');
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({colorScheme:'dark'});await wait(900);await slide(60);await wait(600);
 await page.locator('#bagOpacityField').scrollIntoViewIfNeeded();await clearOfSlider('phone');
 await page.locator('#addDiscDialog').screenshot({path:`${OUT}/sheet-slider-phone-midnight.png`});
 await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({colorScheme:'light'});await wait(600);
 await slide(100);await wait(300);assert.equal(await page.locator('#bagOpacityPreview [data-disc-thumbnail]').getAttribute('data-finish'),null,'at 100 it draws as the opaque disc');
 // Left at today's it saves null; moved it saves the number; both survive a reload.
 await slide(30);await save();assert.equal((await byNote('today')).finish_opacity,null,'today\'s position saves as null');
 await edit(id.today);await slide(42);await save();assert.equal((await byNote('today')).finish_opacity,42);
 await openBag();await edit(id.today);assert.equal(await slider(),'42','it survives a reload');
 // To Opaque clears it; back to Clear in one sitting finds the saved value, and after a save today's.
 await page.locator('#bagFinishField label',{hasText:'Opaque'}).click();await page.locator('#bagFinishField label',{hasText:'Clear'}).click();assert.equal(await slider(),'42');
 await page.locator('#bagFinishField label',{hasText:'Opaque'}).click();await save();
 const went=await byNote('today');assert.deepEqual([went.finish,went.finish_opacity],['opaque',null]);
 await edit(id.today);await page.locator('#bagFinishField label',{hasText:'Clear'}).click();assert.equal(await slider(),'30');await save();
 assert.deepEqual([(await byNote('today')).finish,(await byNote('today')).finish_opacity],['clear',null]);
 // A new disc: the same control, from nothing saved, and its preview has no copy to read.
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=5);
 const counted=(await discs()).length;
 await page.evaluate(async d=>{const data=await (await fetch('/data.json')).json();window.BagApp.add(data.discs.find(x=>x.id===d));},BUZZZ);
 await page.waitForSelector('#addDiscDialog[open]');
 assert.equal(await field.isVisible(),false,'a new disc starts Opaque');
 await page.locator('#bagFinishField label',{hasText:'Clear'}).click();assert.equal(await slider(),'30');
 await slide(70);await page.locator('#bagOpacityPreview [data-disc-thumbnail].has-3d').waitFor({timeout:20000});
 await page.locator('#bagNotes').fill('added');await save();
 const added=await byNote('added');assert.equal((await discs()).length,counted+1);assert.deepEqual([added.finish,added.finish_opacity],['clear',70]);
 // A save reaches the bag without a reload: the list row and the scene both.
 await page.waitForFunction(()=>document.querySelector('#bagScene')?.dataset.phase==='open');
 assert.equal(await page.locator(`[data-disc-id="${added.id}"] [data-disc-thumbnail]`).getAttribute('data-opacity'),'70');
 await edit(added.id);await slide(100);await save();await wait(1500);
 assert.equal(await page.locator(`[data-disc-id="${added.id}"] [data-disc-thumbnail]`).getAttribute('data-finish'),null,'at 100 the row draws opaque at once');
 assert.equal(await page.evaluate(d=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().find(s=>s.id===d)?.clear,added.id),0,'and so does the bag');
 await page.evaluate(async d=>{const r=await fetch('/api/bag/discs/'+d,{method:'DELETE',credentials:'same-origin',headers:{'X-Atlas-CSRF':window.AtlasAccount.current.csrfToken}});if(!r.ok)throw Error(await r.text());},added.id);
 check('the slider shows on Clear only, starts at today\'s look, and saves on the account');

 // 3. The viewer, panel and pop-out: read off the drawing buffer from the top view, Paper against Midnight.
 const theme=async scheme=>{await page.emulateMedia({colorScheme:scheme});await page.waitForFunction(t=>document.documentElement.dataset.theme===t,scheme==='dark'?'midnight':'light');await wait(700);};
 const inspect=async d=>{
  await openBag();await page.locator(`[data-bag-inspect="${d}"]`).first().evaluate(n=>n.click());
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
 const shots={};
 const viewerCase=async name=>{
  await theme('light');await inspect(id[name]);const light=await samples();
  const canvas=page.locator('#detail .disc3d-viewport canvas').first();
  shots[name+'-light']=await canvas.screenshot({path:`${OUT}/viewer-${name}-light.png`});
  await theme('dark');await wait(500);const dark=await samples();
  shots[name+'-dark']=await canvas.screenshot({path:`${OUT}/viewer-${name}-dark.png`});
  await theme('light');
  return {light,dark,through:Math.max(shift(light.rim,dark.rim),shift(light.plate,dark.plate))};
 };
 const glass=await viewerCase('glass'),today=await viewerCase('today'),frosted=await viewerCase('frosted'),solid=await viewerCase('solid'),opaque=await viewerCase('opaque');
 assert.ok(glass.light.clear&&today.light.clear&&frosted.light.clear,'below 100 the clear passes draw');
 assert.equal(solid.light.clear,false,'at 100 no clear pass draws');assert.equal(opaque.light.clear,false);
 assert.ok(glass.through>=today.through,`near-glass passes at least today's page (${glass.through} against ${today.through})`);
 assert.ok(glass.through>=60,`near-glass reads clear: the page shows through by ${glass.through}`);
 assert.ok(frosted.through<today.through,`frosted hides more than today (${frosted.through} against ${today.through})`);
 assert.ok(solid.through<=3&&opaque.through<=3,`full opacity hides the page (${solid.through}, opaque ${opaque.through})`);
 // Near-glass is paler than today over a light page, the dye all but gone.
 assert.ok(Math.min(...glass.light.plate)>Math.min(...today.light.plate)+60,`near-glass is pale on Paper (${glass.light.plate} against ${today.light.plate})`);
 assert.ok(shots['solid-light'].equals(shots['opaque-light']),'100 is the opaque disc on Paper, pixel for pixel');
 assert.ok(shots['solid-dark'].equals(shots['opaque-dark']),'100 is the opaque disc on Midnight, pixel for pixel');
 check(`viewer: page shows through by glass ${glass.through}, today ${today.through}, frosted ${frosted.through}, 100 ${solid.through}; 100 equals the opaque disc`);
 for(const name of ['glass','solid']){
  await inspect(id[name]);
  await page.locator('#detail [data-disc3d-expand]').click();await page.waitForSelector('dialog.disc3d-dialog[open]');await wait(1500);
  const drawn=await page.evaluate(()=>window.Disc3D.popout.debug.scene.getObjectByName('clear-front-filter')?.visible??false);
  assert.equal(drawn,name==='glass',name+' in the pop-out');
  await page.locator('dialog.disc3d-dialog[open] .disc3d-viewport').screenshot({path:`${OUT}/popout-${name}.png`});
  await page.keyboard.press('Escape');await wait(600);
 }
 check('the pop-out follows the slider');

 // 4. My Bag: in the pocket and pulled out, both themes.
 const layout=()=>page.evaluate(()=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().filter(d=>!d.empty).map(({id,clear})=>({id,clear})));
 for(const scheme of ['light','dark']){
  await theme(scheme);
  await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelector('#bagScene')?.dataset.phase==='open');await wait(1500);
  const state=await layout(),clearOf=d=>state.find(s=>s.id===d).clear;
  assert.equal(clearOf(id.glass),1,'glass in its pocket');assert.equal(clearOf(id.frosted),1,'frosted in its pocket');
  assert.equal(clearOf(id.solid),0,'100 draws as an opaque disc');assert.equal(clearOf(id.opaque),0);
  await page.locator('#bagScene').evaluate(n=>n.scrollIntoView({block:'start'}));await wait(300);
  for(const name of ['glass','frosted','solid']){
   await page.locator(`[data-physical-disc="${id[name]}"]`).evaluate(n=>n.click());
   const walls=name==='solid'?0:2;
   await page.waitForFunction(([d,w])=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().find(s=>s.id===d)?.clear===w,[id[name],walls],{timeout:15000});await wait(1500);
   const bag=await page.locator('#bagScene').boundingBox();
   await page.screenshot({path:`${OUT}/bag-${name}-pulled-${scheme}.png`,clip:{x:0,y:Math.max(0,bag.y),width:1440,height:Math.min(1000-Math.max(0,bag.y),bag.height)}});
   await page.keyboard.press('Escape');await wait(900);
  }
 }
 await theme('light');
 check('My Bag: each position in its pocket and pulled out, both themes');

 // 5. Storage: copies of one mold rack by their value, one batch each, and pull out as themselves.
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=5);
 await page.locator('#myBagViews [data-bag-view="storage"]').click();
 await page.locator('#storageScene[data-engine="ready"]').waitFor({timeout:30000});await wait(1200);
 const racks=()=>page.evaluate(()=>window.BagApp.scenes.storage.state);
 assert.equal((await racks()).batches,4,'the Raptor; a Buzzz at 0, at 60, and at 100 with the opaque batch');
 const host=await page.locator('#storageScene').boundingBox();
 await page.screenshot({path:`${OUT}/storage-racks.png`,clip:{x:0,y:Math.max(0,host.y),width:1440,height:Math.min(1000-Math.max(0,host.y),host.height)}});
 await page.evaluate(d=>window.BagApp.scenes.storage.pull(d),id['rack-glass']);await wait(2500);
 await page.screenshot({path:`${OUT}/storage-glass-pulled.png`,clip:{x:0,y:Math.max(0,host.y),width:1440,height:Math.min(1000-Math.max(0,host.y),host.height)}});
 check('Storage racks copies by their value and pulls them out as themselves');

 // 6. Lost, and the list's thumbnails, which carry the value and redraw at it.
 await page.locator('#myBagViews [data-bag-view="lost"]').click();await page.locator('#lostScene[data-engine="ready"]').waitFor({timeout:30000});
 await page.waitForFunction(()=>window.BagApp.scenes.lost?.state.clearPages.length===1);
 await page.goto(base+'/?bag=1');await page.locator(`[data-disc-id="${id.glass}"]`).waitFor();
 const mark=async d=>page.locator(`[data-disc-id="${d}"] [data-disc-thumbnail]`).evaluate(n=>[n.dataset.finish||null,n.dataset.opacity??null]);
 assert.deepEqual(await mark(id.glass),['clear','0']);assert.deepEqual(await mark(id.frosted),['clear','60']);
 assert.deepEqual(await mark(id.today),['clear',null]);assert.deepEqual(await mark(id.solid),[null,null]);assert.deepEqual(await mark(id.opaque),[null,null]);
 const thumb=async d=>{const n=page.locator(`[data-disc-id="${d}"] [data-disc-thumbnail]`);await n.scrollIntoViewIfNeeded();await page.locator(`[data-disc-id="${d}"] [data-disc-thumbnail].has-3d`).waitFor({timeout:20000});await wait(400);return page.locator(`[data-disc-id="${d}"] [data-disc-thumbnail].has-3d canvas`).evaluate(c=>[...c.getContext('2d').getImageData(c.width>>1,Math.round(c.height*.82),1,1).data].slice(0,3));};
 const glassPx=await thumb(id.glass),todayPx=await thumb(id.today),solidPx=await thumb(id.solid),opaquePx=await thumb(id.opaque);
 assert.ok(Math.min(...glassPx)>Math.min(...todayPx)+40,`the glass thumbnail is pale (${glassPx} against ${todayPx})`);
 assert.deepEqual(solidPx,opaquePx,'the 100 thumbnail is the opaque one');
 await page.locator('#myBagView .my-bag-disc').first().scrollIntoViewIfNeeded();
 check('Lost and the bag list follow the value');

 // 7. Opacity is plastic, not print: a game asset made once stays through every move, and no make runs for it.
 const put=await page.evaluate(async([d,bytes])=>{const r=await fetch('/api/bag/discs/'+d+'/photo',{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'image/webp','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken},body:new Uint8Array(bytes)});return r.status;},[id.raptor,[...photo]]);
 assert.equal(put,200);
 const stampOf=d=>page.evaluate(d=>fetch('/api/bag/stamps',{credentials:'same-origin'}).then(r=>r.json()).then(j=>j.stamps.find(s=>s.disc_id===d)||null),d);
 await openBag();await edit(id.raptor);
 assert.match(await page.locator('#bagOpacityHint').innerText(),/nothing to make again/);
 await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Game asset'}).click();
 let before=null;for(const end=Date.now()+240000;!before&&Date.now()<end;await wait(1000))before=await stampOf(id.raptor);
 await close();
 assert.ok(before,'the asset is saved');
 await page.evaluate(()=>{window.__makes.length=0;});
 for(const value of [0,60,100,30]){
  await openBag();await page.evaluate(()=>{window.__makes.length=0;});
  await edit(id.raptor);await slide(value);await save();await wait(1200);
  assert.deepEqual(await page.evaluate(()=>window.__makes),[],'no make at '+value);
  assert.deepEqual(await stampOf(id.raptor),before,'the asset stands at '+value);
  assert.equal((await byNote('raptor')).finish_opacity,value===30?null:value);
  // And it is drawn: the stamp alone over the plastic, at this opacity.
  await inspect(id.raptor);
  const drawn=await page.evaluate(()=>{const v=window.Disc3D.viewer.debug;return {asset:!!v.stamp.material.map?.userData?.stampAsset,stamp:v.stamp.visible,photo:!!v.photo?.visible,clear:v.scene.getObjectByName('clear-front-filter')?.visible??false};});
  assert.deepEqual(drawn,{asset:true,stamp:true,photo:false,clear:value!==100},'the asset on the plastic at '+value);
  await page.locator('#detail .disc3d-viewport canvas').first().screenshot({path:`${OUT}/asset-${value}.png`});
 }
 check('moving the slider never makes the game asset again, and leaves the saved asset untouched');

 assert.deepEqual(errors,[],'no page or shader errors');
 console.log('clear-opacity-browser: all checks passed');
}finally{await h.stop();}
