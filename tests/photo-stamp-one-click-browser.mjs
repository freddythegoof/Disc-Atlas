// Photo stamps v3.1 (docs/photo-stamp-one-click.md): one click makes the game asset from the photo the disc already has.
// In the real app on the local signed-in harness, with a drawn synthetic disc photo made at run time (never a player's
// photo). Desktop Chromium by default; PHOTO_STAMP_ENGINE=webkit runs it at phone size in WebKit with touch (taps):
//   a disc with no photo · no Look row (nothing to make an asset from);
//   Game asset           · one click: the asset made from the stored photo, saved to the account, landing on Full
//                          color (docs/spin-color-default.md), no file asked for and no aligner; the status named
//                          each step;
//   One ink              · the alternate style applies at once and is saved;
//   Make again           · one click again, a new revision, still no file, and the One ink choice kept;
//   a reload             · the saved One ink choice is still the disc's look; Photo and back returns to it;
//   Game asset (2nd disc)· the same, from a disc with no asset, landing on Full color;
//   the sheet closed     · mid-make, the asset is still made and saved;
//   the original         · the quiet "Use a higher-resolution original instead" still frames an original and makes
//                          the asset from it;
//   the photo            · its bytes on the account untouched throughout.
//   node tests/photo-stamp-one-click-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {startHarness} from './display-harness.mjs';
// docs/photo-adder-rework.md: this suite's photos go through today's aligner and are saved wearing Photo (tests/photo-flow.mjs).
import {frameByHand,keepPhotoLook} from './photo-flow.mjs';
const sharp=createRequire(import.meta.url)('sharp');

// A teal disc filling the aligner's default framing of a 1600 x 2000 photo, with an outlined print (a ring, a bar, a
// coloured panel), so both looks have something to draw.
const DIR='work/photo-stamp-one-click/synthetic';fs.mkdirSync(DIR,{recursive:true});
const photo=async(file,plate)=>{
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2000"><rect width="1600" height="2000" fill="#3a3530"/><circle cx="800" cy="1000" r="752" fill="${plate}"/>`+
  `<circle cx="800" cy="1000" r="360" fill="none" stroke="#1d2026" stroke-width="22"/><rect x="520" y="970" width="560" height="56" fill="#1d2026"/>`+
  `<polygon points="560,720 820,690 860,900 580,930" fill="#e8c43c" stroke="#1d2026" stroke-width="14"/></svg>`;
 await sharp(Buffer.from(svg)).jpeg({quality:92}).toFile(file);return file;
};
const first=await photo(DIR+'/one-click-a.jpg','#5c9daa'),second=await photo(DIR+'/one-click-b.jpg','#c64533');

const engine=process.env.PHOTO_STAMP_ENGINE||'chromium',phone=engine==='webkit';
const h=await startHarness({port:Number(process.env.PHOTO_STAMP_PORT||8891),state:'work/photo-stamp-one-click/d1-test',engine,
 ...phone&&{viewport:{width:390,height:844},deviceScaleFactor:2,context:{hasTouch:true,isMobile:true}}});
const {page,base,errors}=h;
const items=()=>page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs);
// A tap on the phone, a click on the desktop.
const press=async locator=>phone?locator.tap():locator.click();
const results={engine};
// Progress, so a stall says where it is.
const log=(...a)=>console.log(new Date().toISOString().slice(11,19),...a);
try{
 await h.signIn();
 await h.seedBag([{mold_id:'3d60892b6812',plastic:'Star',wear:8,weight_g:172,color:'#70b7cd'},{mold_id:'7446eb39abe5',plastic:'Z',wear:8,weight_g:177,color:'#b99bdd'},{mold_id:'6be51219c6db',plastic:'ESP',wear:9,weight_g:174,color:'#f2c14e'}]);
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=3);
 const all=await items(),A=all.find(i=>i.mold_id==='3d60892b6812').id,B=all.find(i=>i.mold_id==='7446eb39abe5').id,C=all.find(i=>i.mold_id==='6be51219c6db').id;
 const edit=async id=>{await page.locator(`[data-bag-edit="${id}"]`).first().evaluate(n=>n.click());await page.waitForSelector('#addDiscDialog[open]');};
 const closeSheet=async()=>{await page.evaluate(()=>{window.__sheetClosed=new Promise(r=>document.querySelector('#addDiscDialog').addEventListener('close',()=>setTimeout(r),{once:true}));});await page.keyboard.press('Escape');await page.evaluate(()=>window.__sheetClosed);};
 const savePhoto=async(id,file)=>{
  await edit(id);await page.setInputFiles('#addDiscDialog .bag-photo-file',file);
  await page.waitForSelector('dialog.photo-aligner[open]');await frameByHand(page);await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
  await page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]'),null,{timeout:60000});
  await keepPhotoLook(page);await page.locator('#saveDisc').click();await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'),null,{timeout:60000});
  return (await items()).find(i=>i.id===id);
 };
 const photoHash=(id,key)=>page.evaluate(async url=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await (await fetch(url,{credentials:'same-origin'})).arrayBuffer()))).join(','),'/api/bag/discs/'+encodeURIComponent(id)+'/photo?v='+encodeURIComponent(key));
 const stamp=id=>page.evaluate(id=>fetch('/api/bag/stamps',{credentials:'same-origin'}).then(r=>r.json()).then(d=>d.stamps.find(s=>s.disc_id===id)||null),id);
 const entry=id=>page.evaluate(id=>JSON.parse(localStorage.getItem('disc-atlas-photo-stamps')||'null')?.discs?.[id]||null,id);
 const lookChecked=v=>page.locator(`#addDiscDialog .bag-photo-look input[value="${v}"]`).isChecked();
 // Every file picker the page opens is counted: one click must open none.
 let pickers=0;page.on('filechooser',()=>{pickers++;});
 // One click (or tap) on `target` in the open sheet; resolves when the status says it is done, with the steps it named.
 const oneClick=async target=>{
  await page.evaluate(()=>{const seen=window.__steps=[],el=document.querySelector('#addDiscDialog .bag-photo-status');new MutationObserver(()=>{if(seen.at(-1)!==el.textContent)seen.push(el.textContent);}).observe(el,{childList:true,characterData:true,subtree:true});});
  const t=Date.now(),before=pickers;await press(target);
  await page.waitForFunction(()=>/^(?!Making the game asset)\S/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:180000});
  return {ms:Date.now()-t,status:await page.locator('#addDiscDialog .bag-photo-status').textContent(),steps:await page.evaluate(()=>window.__steps),pickers:pickers-before,aligner:await page.locator('dialog.photo-aligner[open]').count()};
 };
 const STEPS=['opening your photo…','finding the stamp…','drawing it in one ink…','drawing it in full color…','saving to your account…'].map(s=>'Making the game asset: '+s);

 log('no-photo disc');
 // A disc with no photo has nothing to make an asset from: no Look row, as before.
 await edit(C);assert.equal(await page.locator('#addDiscDialog .bag-photo-look').isHidden(),true,'no photo, no look');await closeSheet();

 log('game asset');
 // Game asset, one click.
 const savedA=await savePhoto(A,first),photoA=await photoHash(A,savedA.texture_key);
 await edit(A);assert.equal(await lookChecked('photo'),true);
 assert.equal(await page.locator('#addDiscDialog .bag-photo-asset-make').isHidden(),true,'nothing to make again yet');
 // The style row is not offered while the disc wears its photo.
 assert.equal(await page.locator('#addDiscDialog .bag-photo-look-style').isHidden(),true,'no style under Photo');
 let r=results.asset=await oneClick(page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Game asset'}));
 assert.equal(r.status,'Full-color asset made. Saved to your account.',JSON.stringify(r));
 assert.equal(r.pickers,0,'no file picker');assert.equal(r.aligner,0,'no aligner');
 for(const step of STEPS)assert.ok(r.steps.includes(step),'named '+step+': '+JSON.stringify(r.steps));
 assert.deepEqual([await lookChecked('game'),await lookChecked('color')],[true,true],'a new asset lands on Full color');
 assert.equal(await page.locator('#addDiscDialog .bag-photo-look-style').isVisible(),true,'One ink offered beside it');
 assert.equal(await page.locator('#addDiscDialog .bag-photo-asset-make').isVisible(),true,'it can be made again');
 await closeSheet();
 let server=await stamp(A),local=await entry(A);
 assert.deepEqual([server?.look,server?.texture_key,!!server?.color],['color',savedA.texture_key,true],'on the account, both layers: '+JSON.stringify(server));
 assert.deepEqual([local?.look,local?.rev,local?.server],['color',server.rev,true]);
 const firstRev=server.rev;
 // The player prefers one ink: it applies at once, from the same read, and is saved.
 await edit(A);await press(page.locator('#addDiscDialog .bag-photo-look label',{hasText:'One ink'}));
 assert.equal(await page.locator('#addDiscDialog .bag-photo-status').textContent(),'Showing the game asset in one ink.');
 await page.waitForFunction(async id=>(await (await fetch('/api/bag/stamps',{credentials:'same-origin'})).json()).stamps.find(s=>s.disc_id===id)?.look==='asset',A,{timeout:15000});
 await closeSheet();
 log('viewer');
 // The viewer wears it, with no photo.
 await page.locator(`[data-bag-inspect="${A}"]`).first().evaluate(n=>n.click());
 await page.waitForFunction(()=>/^photo-stamp\//.test(window.Disc3D?.viewer?.debug?.stamp?.material?.map?.userData?.stampAsset||''),null,{timeout:60000});
 assert.equal(await page.evaluate(()=>!!Disc3D.viewer.debug.photo),false);

 log('make again');
 // Make again: one click, a new revision, still no file.
 // Make again: one click, a new revision, still no file. The saved One ink choice is kept: the default is for new
 // assets only.
 await edit(A);r=results.again=await oneClick(page.locator('#addDiscDialog .bag-photo-asset-make'));
 assert.equal(r.status,'Game asset made. Saved to your account.');assert.equal(r.pickers,0);assert.equal(r.aligner,0);
 assert.equal(await lookChecked('asset'),true,'still One ink');
 await closeSheet();server=await stamp(A);assert.notEqual(server.rev,firstRev,'a new revision');
 assert.deepEqual([server.look,!!server.color],['asset',true],'One ink on the account, colour made beside it: '+JSON.stringify(server));

 log('reload');
 // After a reload the choice is still One ink, from the account and the cache alike; nothing was re-rendered.
 await page.reload();await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=3);
 assert.deepEqual([(await entry(A))?.look,(await entry(A))?.rev],['asset',server.rev]);
 await edit(A);assert.deepEqual([await lookChecked('game'),await lookChecked('asset')],[true,true],'One ink after a reload');
 assert.match(await page.locator('#addDiscDialog .bag-photo-look-note').textContent(),/^One ink draws/);
 // Photo and back to Game asset returns to the style the disc wore, not the default.
 await press(page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Photo'}));assert.equal(await lookChecked('photo'),true);
 assert.match(await page.locator('#addDiscDialog .bag-photo-look-note').textContent(),/in full color/);
 await press(page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Game asset'}));assert.equal(await lookChecked('asset'),true,'back to One ink');
 await page.waitForFunction(async id=>(await (await fetch('/api/bag/stamps',{credentials:'same-origin'})).json()).stamps.find(s=>s.disc_id===id)?.look==='asset',A,{timeout:15000});
 assert.equal((await stamp(A)).rev,server.rev,'switching re-renders nothing');
 await closeSheet();

 log('full color');
 // Game asset, one click, on a second disc with no asset, lands on Full color; the sheet closed mid-make does not stop it.
 const savedB=await savePhoto(B,second),photoB=await photoHash(B,savedB.texture_key);
 await edit(B);const before=pickers;
 await press(page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Game asset'}));
 await page.waitForFunction(()=>/^Making the game asset: /.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''));
 assert.equal(await page.locator('#addDiscDialog .bag-photo-look').getAttribute('aria-busy'),'','the row waits while it is made');
 assert.equal(await lookChecked('color'),true,'the row shows the look asked for');
 // A choice made while it waits is put back.
 await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Photo'}).click();assert.equal(await lookChecked('color'),true,'the row keeps waiting');
 await closeSheet();
 await page.waitForFunction(id=>JSON.parse(localStorage.getItem('disc-atlas-photo-stamps')||'null')?.discs?.[id]?.server===true,B,{timeout:180000});
 assert.equal(pickers-before,0,'no file picker');
 server=await stamp(B);assert.deepEqual([server?.look,!!server?.color],['color',true],'Full color on the account: '+JSON.stringify(server));
 await edit(B);assert.equal(await lookChecked('color'),true);
 assert.match(await page.locator('#addDiscDialog .bag-photo-look-note').textContent(),/glare left out/);await closeSheet();
 results.color={look:server.look,rev:server.rev};

 log('original');
 // The camera original, the quiet option, still frames an original and makes the asset from it.
 await edit(A);const original=page.locator('#addDiscDialog .bag-photo-asset-original');
 assert.equal(await original.textContent(),'Use a higher-resolution original instead');
 const chooser=page.waitForEvent('filechooser');await press(original);await (await chooser).setFiles(first);
 await page.waitForSelector('dialog.photo-aligner[open]');await frameByHand(page);
 assert.equal(await page.locator('dialog.photo-aligner[open] h2').textContent(),'Frame the original');
 const revBefore=(await stamp(A)).rev;await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
 await page.waitForFunction(()=>/Game asset made/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:180000});
 await closeSheet();assert.notEqual((await stamp(A)).rev,revBefore,'made from the original');

 log('photos unchanged');
 // The photos on the account never changed.
 assert.equal(await photoHash(A,savedA.texture_key),photoA);assert.equal(await photoHash(B,savedB.texture_key),photoB);
 assert.deepEqual(errors,[]);
 console.log(engine+' one click: Game asset '+results.asset.ms+' ms, again '+results.again.ms+' ms');
 console.log('photo stamp one click: pass');
}finally{await h.stop();}
