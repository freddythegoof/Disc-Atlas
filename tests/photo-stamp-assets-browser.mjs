// Photo stamps (docs/photo-stamp-assets.md) in the real app on the local signed-in harness, with a drawn synthetic disc
// photo made at run time (never a player's photo): the sheet's Look row, making a game asset from the original (v3.1:
// the optional path), every
// personal surface drawing it in the player's ink and finish, and the photo look kept exactly as it was.
//   node tests/photo-stamp-assets-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {startHarness} from './display-harness.mjs';
import {keepPhotoLook} from './photo-flow.mjs';
const sharp=createRequire(import.meta.url)('sharp');

// A teal disc filling the aligner's default framing (scale .94) of a 1600 x 2000 photo, with a single-ink stamp.
const DIR='work/photo-stamp-assets/synthetic';fs.mkdirSync(DIR,{recursive:true});
const photo=async(file,stamp)=>{
 const r=752,cx=800,cy=1000,ink='#1d2026';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2000"><rect width="1600" height="2000" fill="#3a3530"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#5c9daa"/>${stamp(cx,cy,ink)}</svg>`;
 await sharp(Buffer.from(svg)).jpeg({quality:92}).toFile(file);return file;
};
const first=await photo(DIR+'/disc-a.jpg',(x,y,ink)=>`<circle cx="${x}" cy="${y}" r="360" fill="none" stroke="${ink}" stroke-width="22"/><rect x="${x-280}" y="${y-30}" width="560" height="56" fill="${ink}"/><rect x="${x-120}" y="${y+70}" width="60" height="110" fill="${ink}"/><rect x="${x-20}" y="${y+70}" width="60" height="110" fill="${ink}"/>`);
const second=await photo(DIR+'/disc-b.jpg',(x,y,ink)=>`<rect x="${x-200}" y="${y-200}" width="400" height="60" fill="${ink}"/>`);

// PHOTO_STAMP_ENGINE=webkit runs it in the phone's engine (docs/photo-stamp-sync.md).
const h=await startHarness({port:Number(process.env.PHOTO_STAMP_PORT||8875),state:'work/photo-stamp-assets/d1-test',engine:process.env.PHOTO_STAMP_ENGINE||'chromium'});
const {page,base,errors}=h;
const wait=ms=>page.waitForTimeout(ms);
const items=()=>page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs);
const stamps=fn=>page.evaluate(fn);
try{
 await h.signIn();
 await h.seedBag([{mold_id:'3d60892b6812',plastic:'Star',wear:8,weight_g:172,color:'#70b7cd'},{mold_id:'7446eb39abe5',plastic:'Z',wear:8,weight_g:177,color:'#b99bdd'}]);
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=2);
 const disc=(await items()).find(i=>i.mold_id==='3d60892b6812');
 const edit=async()=>{await page.locator(`[data-bag-edit="${disc.id}"]`).evaluate(n=>n.click());await page.waitForSelector('#addDiscDialog[open]');};
 const closeSheet=async()=>{await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'));};
 const lookRow=()=>page.locator('#addDiscDialog .bag-photo-look');

 // No photo yet: no Look row. A photo chosen but not saved (docs/photo-adder-rework.md): its game asset is made in the
 // sheet and its Look row stands on Game asset; this suite's photo is saved wearing Photo, as photos were before.
 await edit();assert.equal(await lookRow().isHidden(),true,'no photo, no look');
 await page.setInputFiles('#addDiscDialog .bag-photo-file',first);
 await page.waitForSelector('dialog.photo-aligner[open]');await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
 await page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]'),null,{timeout:60000});
 assert.equal(await page.locator('#addDiscDialog .bag-photo-look input[value="game"]').isChecked(),true,'a new photo lands on Game asset');
 await keepPhotoLook(page);
 await page.locator('#saveDisc').click();await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'),null,{timeout:60000});
 const saved=(await items()).find(i=>i.id===disc.id),url='/api/bag/discs/'+encodeURIComponent(disc.id)+'/photo?v='+encodeURIComponent(saved.texture_key);
 const routeHash=()=>page.evaluate(async url=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await (await fetch(url,{credentials:'same-origin'})).arrayBuffer()))).join(','),url);
 const storedBefore=await routeHash();

 // The viewer as My Bag opens it, and its photo's decoded pixels (the photo look's exact output).
 const inspect=async()=>{
  await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-inspect]').length>=2);
  await page.locator(`[data-bag-inspect="${disc.id}"]`).first().evaluate(n=>n.click());
  await page.waitForFunction(()=>document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready');
 };
 const photoPixels=()=>page.evaluate(()=>{const p=Disc3D.viewer.debug.photo;if(!p?.userData.photoReady)return null;const img=p.material.map.image,c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);return Array.from(g.getImageData(0,0,c.width,c.height).data.filter((_,i)=>i%97===0)).join(',');});
 await inspect();await page.waitForFunction(()=>Disc3D.viewer.debug.photo?.userData.photoReady,null,{timeout:30000});
 const pixelsBefore=createHash('sha256').update(await photoPixels()).digest('hex');

 // The Look row: Photo by default. v3.1 (docs/photo-stamp-one-click.md): Game asset itself makes the asset from the
 // stored photo in one click (tests/photo-stamp-one-click-browser.mjs); the camera original is the quiet option beside
 // it, which frames the original and makes the asset, as here. Since docs/spin-color-default.md a new asset lands on
 // Full color; One ink, this suite's look, is the alternate style beside it.
 await edit();assert.equal(await lookRow().isVisible(),true);
 assert.equal(await page.locator('#addDiscDialog .bag-photo-look input[value="photo"]').isChecked(),true);
 assert.equal(await page.locator('#addDiscDialog .bag-photo-asset-make').isHidden(),true,'nothing to make again yet');
 const chooser=page.waitForEvent('filechooser');
 await page.locator('#addDiscDialog .bag-photo-asset-original').click();
 await (await chooser).setFiles(first);
 await page.waitForSelector('dialog.photo-aligner[open]');
 await page.waitForFunction(()=>document.querySelector('dialog.photo-aligner')?.dataset.fit==='fitted',null,{timeout:90000});
 assert.equal(await page.locator('dialog.photo-aligner[open] h2').textContent(),'Check it against the cross','the original is fitted like a new photo');
 assert.equal(await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').textContent(),'Make game asset');
 await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
 await page.waitForFunction(()=>/Full-color asset made/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:120000});
 await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'One ink'}).click();
 assert.equal(await page.locator('#addDiscDialog .bag-photo-look input[value="asset"]').isChecked(),true);
 await closeSheet();
 assert.equal(await routeHash(),storedBefore,'the saved photo on the account is untouched');

 // Viewer: no photo, the extracted stamp at 2048 px on the stamp mesh.
 await inspect();
 await page.waitForFunction(()=>/^photo-stamp\//.test(Disc3D.viewer.debug.stamp.material.map?.userData.stampAsset||''),null,{timeout:30000});
 assert.deepEqual(await stamps(()=>({photo:!!Disc3D.viewer.debug.photo,visible:Disc3D.viewer.debug.stamp.visible,size:Disc3D.viewer.debug.stamp.material.map.image.width})),{photo:false,visible:true,size:2048});
 // The player's ink and finish reach it.
 await page.evaluate(()=>DisplayPalette.setStamp({ink:'gold',finish:'foil'}));
 await page.waitForFunction(()=>Disc3D.viewer.debug.stamp.material.userData.stampFinish==='foil'&&/^photo-stamp\//.test(Disc3D.viewer.debug.stamp.material.map?.userData.stampAsset||''),null,{timeout:15000});

 // Bag: a pulled disc wears it, in that finish.
 await page.waitForFunction(()=>document.querySelector('#bagScene')?.dataset.phase==='open',null,{timeout:30000});await wait(800);
 await page.locator(`[data-physical-disc="${disc.id}"]`).evaluate(n=>n.click());
 await page.waitForFunction(id=>document.querySelector('[data-bag-canvas]').bagViewer.stampLayers.some(l=>l.key===id&&/^photo-stamp\//.test(l.asset||'')&&l.finish==='foil'),disc.id,{timeout:20000});

 // Gallery: the same, through the shared viewer, and it reveals. (From a fresh bag page: switching views with a disc
 // pulled and its details open threw in the bag's staging until PR #36, docs/photo-stamp-assets.md.)
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=2);
 await page.evaluate(()=>document.querySelector('#myBagViews [data-bag-view="gallery"]').click());
 for(let i=0;i<4;i++){const id=await page.evaluate(()=>document.querySelector('[data-album-stage]')?.dataset.discId);if(id===disc.id)break;await page.locator('[data-album-step="1"]').first().click();await wait(400);}
 await page.waitForFunction(id=>{const stage=document.querySelector('[data-album-stage]');return stage?.dataset.discId===id&&stage.closest('[data-appearance]')?.dataset.appearance==='ready';},disc.id,{timeout:30000});
 assert.match(await page.evaluate(()=>BagApp.scenes.album.debug.stamp.material.map.userData.stampAsset),/^photo-stamp\//);
 assert.equal(await page.evaluate(()=>!!BagApp.scenes.album.debug.photo),false);
 await page.evaluate(()=>document.querySelector('#myBagViews [data-bag-view="bag"]').click());
 await page.evaluate(()=>DisplayPalette.setStamp({ink:'auto',finish:'flat'}));

 // Map still (the personalized map's marker art): stamped, not photographed.
 const still=await page.evaluate(async([url,mold])=>{
  const art=await (await import('/disc3d/atlas-art.mjs')).getAtlasArt(),d=discs.find(d=>d.id===mold);
  for(let i=0;i<60;i++){const e=art.render({...d,photoURL:url},'#5c9daa',320,undefined,'full',true);if(e&&!e.pending)break;await new Promise(r=>setTimeout(r,100));}
  return [...art.debug.images.keys()].filter(k=>k.startsWith(mold+'|'));
 },[url,disc.mold_id]);
 assert.ok(still.some(k=>/\|stamp:photo-stamp\//.test(k)&&!k.includes('/photo?')),'the still is drawn from the stamp: '+still.join(' '));

 // Neutral: the catalog Destroyer on the Standard map knows nothing of it.
 await page.goto(base+'/');await page.waitForFunction(()=>typeof discs!=='undefined'&&discs.length>0);
 await page.evaluate(()=>document.querySelector('#lensMenu [data-lens="default"]').click());await wait(500);
 await page.evaluate(id=>select(discs.find(d=>d.id===id)),disc.mold_id);
 await page.waitForFunction(()=>document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready');await wait(500);
 assert.equal(await page.evaluate(()=>Disc3D.viewer.debug.stamp.material.map?.userData.stampAsset||null),null);

 // Back to Photo: exactly the photo it showed before.
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=2);
 await edit();await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Photo'}).click();await closeSheet();
 await inspect();await page.waitForFunction(()=>Disc3D.viewer.debug.photo?.userData.photoReady,null,{timeout:30000});
 assert.equal(createHash('sha256').update(await photoPixels()).digest('hex'),pixelsBefore,'the photo look is byte-for-byte the same');
 assert.equal(await page.evaluate(()=>Disc3D.viewer.debug.stamp.visible),false);

 // v3 (docs/photo-stamp-sync.md): an asset this browser lost (cleared site data) comes back from the account; when the
 // account cannot give it either, the disc shows its photo again.
 await page.evaluate(([id,key])=>import('/disc3d/photo-stamps.mjs').then(m=>m.setPhotoLook(id,key,'asset')),[disc.id,saved.texture_key]);
 const clearCache=()=>page.evaluate(()=>new Promise((res,rej)=>{const r=indexedDB.open('disc-atlas-photo-stamps');r.onsuccess=()=>{const t=r.result.transaction('assets','readwrite');t.objectStore('assets').clear();t.oncomplete=()=>{r.result.close();res();};t.onerror=rej;};}));
 await clearCache();
 await inspect();await page.waitForFunction(()=>/^photo-stamp\//.test(Disc3D.viewer.debug.stamp.material.map?.userData.stampAsset||''),null,{timeout:30000});
 assert.equal(await page.evaluate(()=>!!Disc3D.viewer.debug.photo),false,'drawn from the account, not the photo');
 await clearCache();await page.route('**/stamp/ink?*',route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"offline"}'}));
 await inspect();await page.waitForFunction(()=>Disc3D.viewer.debug.photo?.userData.photoReady,null,{timeout:30000});
 await page.unroute('**/stamp/ink?*');

 // A replaced photo is a new version (docs/photo-adder-rework.md): its own game asset is made in the sheet and saved
 // under its key with it, in Full color; the old version's asset goes.
 await edit();await page.setInputFiles('#addDiscDialog .bag-photo-file',second);
 await page.waitForSelector('dialog.photo-aligner[open]');await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
 await page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]'),null,{timeout:90000});
 await page.waitForFunction(()=>/^Game asset made/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:120000});
 await page.locator('#saveDisc').click();await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'),null,{timeout:60000});
 const replaced=(await items()).find(i=>i.id===disc.id);assert.notEqual(replaced.texture_key,saved.texture_key);
 const now=await page.evaluate(([id,key])=>import('/disc3d/photo-stamps.mjs').then(m=>m.photoLook(id,key)),[disc.id,replaced.texture_key]);
 assert.equal(now.available,true);assert.equal(now.look,'color');
 assert.deepEqual(await page.evaluate(([id,key])=>import('/disc3d/photo-stamps.mjs').then(m=>m.photoLook(id,key)),[disc.id,saved.texture_key]),{available:false,look:'photo'},'the old version’s asset is gone');
 await edit();assert.equal(await page.locator('#addDiscDialog .bag-photo-asset-make').isVisible(),true);
 assert.equal(await page.locator('#addDiscDialog .bag-photo-asset-original').textContent(),'Use a higher-resolution original instead');await closeSheet();

 assert.deepEqual(errors,[]);
 console.log('photo stamp assets: pass');
}finally{await h.stop();}
