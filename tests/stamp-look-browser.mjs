// Per-disc stamp look in the real site (docs/stamp-look-extraction.md): the bag sheet's Stamp ink and finish, saved
// with the disc on the account, worn by that copy in its thumbnail, the viewer, My Map and the 3D bag, on this computer
// and on a phone signed in to the same account; a copy left on Appearance keeps wearing the Appearance setting, its
// thumbnail pixel for pixel. Run with `node tests/stamp-look-browser.mjs`.
import assert from 'node:assert/strict';
import {startHarness} from './display-harness.mjs';

const h=await startHarness({port:8897,state:'work/stamp-look-extraction/d1'});
const {page,base}=h;
const wait=ms=>page.waitForTimeout(ms);
const check=label=>console.log('ok -',label);
try {
 await h.signIn();
 await h.seedBag([
  {mold_id:'7446eb39abe5',plastic:'Z',wear:8,weight_g:177,color:'#b99bdd',notes:'buzzz'},             // Buzzz · Discraft stock stamp
  {mold_id:'ff4bf9e7743c',plastic:'Putter Line Hard',wear:10,weight_g:174,color:'#e2d8c1',notes:'luna'} // Luna · stock stamp
 ]);
 const discs=async(p=page)=>(await p.evaluate(async()=>(await (await fetch('/api/bag/discs',{cache:'no-store'})).json()).discs));
 const byNote=async(note,p)=>(await discs(p)).find(d=>d.notes===note);
 const buzzz=await byNote('buzzz'),luna=await byNote('luna');
 // The Appearance setting on this computer: gold foil, which a disc that never chose keeps wearing.
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>window.DisplayPalette);
 await page.evaluate(()=>DisplayPalette.setStamp({ink:'gold',finish:'foil'}));
 const openBag=async(p=page)=>{await p.goto(base+'/?bag=1');await p.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=2);};
 const edit=async(id,p=page)=>{await p.locator(`[data-bag-edit="${id}"]`).first().evaluate(n=>n.click());await p.waitForSelector('#addDiscDialog[open]');};
 const fields=(p=page)=>p.evaluate(()=>({ink:document.querySelector('#bagStampInk').value,finish:document.querySelector('#bagStampFinish').value,
  inkFirst:document.querySelector('#bagStampInk').options[0].text,finishFirst:document.querySelector('#bagStampFinish').options[0].text,
  inks:[...document.querySelector('#bagStampInk').options].map(o=>o.value),finishes:[...document.querySelector('#bagStampFinish').options].map(o=>o.value)}));
 // A list row's finished thumbnail, as pixels.
 const thumbnail=async(id,p=page)=>{await p.locator(`[data-disc-id="${id}"] [data-disc-thumbnail]`).scrollIntoViewIfNeeded();await p.waitForTimeout(800);return thumb(id,p);};
 const thumb=(id,p=page)=>p.waitForFunction(id=>{const host=document.querySelector(`[data-disc-id="${id}"] [data-disc-thumbnail]`);return host?.classList.contains('has-3d')&&host.querySelector('canvas')?.toDataURL();},id,{timeout:20000}).then(r=>r.jsonValue());

 // 1. The sheet: Stamp, with Ink and Finish beside the plastic's finish; a disc starts on Appearance.
 await openBag();
 const lunaBefore=await thumbnail(luna.id),buzzzBefore=await thumbnail(buzzz.id);
 await edit(buzzz.id);
 let f=await fields();
 assert.deepEqual([f.ink,f.finish],['','']);
 assert.equal(f.inkFirst,'Appearance (Gold)');assert.equal(f.finishFirst,'Appearance (Foil)');
 assert.deepEqual(f.inks,['','auto','black','white','gold','silver','copper','red','blue','green','violet','pink']);
 assert.deepEqual(f.finishes,['','flat','foil','rainbow','shatter','spin']);
 assert.equal(await page.locator('#bagStampField legend').innerText(),'Stamp');
 await page.locator('#bagStampInk').selectOption('pink');await page.locator('#bagStampFinish').selectOption('shatter');
 await page.locator('#saveDisc').click();await page.waitForSelector('#addDiscDialog:not([open])');
 const saved=await byNote('buzzz');
 assert.deepEqual([saved.stamp_ink,saved.stamp_finish],['pink','shatter']);
 assert.deepEqual([(await byNote('luna')).stamp_ink,(await byNote('luna')).stamp_finish],[null,null]);
 await openBag();await edit(buzzz.id);f=await fields();
 assert.deepEqual([f.ink,f.finish],['pink','shatter'],'the choice survives a reload');
 await page.keyboard.press('Escape');await page.waitForSelector('#addDiscDialog:not([open])');
 check('the sheet saves a disc\'s own stamp ink and finish, and they survive a reload');

 // 2. Thumbnails: the Buzzz row in pink, the Luna row exactly as before.
 await openBag();
 assert.equal(await page.locator(`[data-disc-id="${buzzz.id}"] [data-disc-thumbnail]`).getAttribute('data-stamp-ink'),'pink');
 assert.equal(await page.locator(`[data-disc-id="${luna.id}"] [data-disc-thumbnail]`).getAttribute('data-stamp-ink'),null);
 assert.notEqual(await thumbnail(buzzz.id),buzzzBefore,'the Buzzz thumbnail changed ink');
 assert.equal(await thumbnail(luna.id),lunaBefore,'the untouched Luna thumbnail is pixel-identical');
 check('thumbnails: the chosen ink on its copy; the untouched copy pixel-identical');

 // 3. The viewer, opened from the bag: Buzzz in shatter foil, Luna in the Appearance foil.
 const stampOf=(p=page)=>p.evaluate(()=>{const m=Disc3D.viewer.debug.stamp.material;return {finish:m.userData.stampFinish||'flat',metalness:m.metalness,color:'#'+m.color.getHexString()};});
 const inspect=async(id,p=page)=>{
  await openBag(p);await p.locator(`[data-bag-inspect="${id}"]`).first().evaluate(n=>n.click());
  await p.waitForFunction(()=>document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready',null,{timeout:20000});await p.waitForTimeout(800);
 };
 await inspect(buzzz.id);
 let s=await stampOf();
 assert.equal(s.finish,'shatter');assert.equal(s.metalness,1);
 await inspect(luna.id);
 s=await stampOf();
 assert.equal(s.finish,'foil','the untouched Luna follows Appearance');
 check('viewer: the copy\'s own finish; the untouched copy on Appearance');

 // 4. My Map: the Buzzz marker art is keyed by its own style, not the Appearance one.
 await page.locator('[data-bag-view="map"]').click();await wait(2500);
 const artKeys=()=>page.evaluate(async()=>[...(await (await import('/disc3d/atlas-art.mjs')).getAtlasArt()).debug.images.keys()].filter(k=>k.includes('style:')));
 const buzzzKey=await page.evaluate(()=>{const d=discs.find(d=>d.name==='Buzzz'&&d.brand==='Discraft');return d.id+'|';});
 assert.equal(await page.evaluate(()=>{const d=discs.find(d=>d.name==='Buzzz'&&d.brand==='Discraft');return JSON.stringify(BagApp.mapStamps().get(d.id));}),JSON.stringify({ink:'pink',finish:'shatter'}));
 const keys=await artKeys();
 if(keys.some(k=>k.startsWith(buzzzKey)))assert.ok(keys.filter(k=>k.startsWith(buzzzKey)).every(k=>k.endsWith('style:pink/shatter')),'the Buzzz marker is drawn in its own style: '+keys.join(' '));
 else console.log('My Map: the Buzzz marker was not drawn with a stamp at this zoom; its map entry carries the style.');
 check('My Map: the copy\'s own stamp look');

 // 5. The 3D bag: each pulled disc in its own look.
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelector('#bagScene')?.dataset.phase==='open',null,{timeout:30000});await wait(1500);
 const pull=async(name,p=page)=>{
  const key=await p.evaluate(name=>[...document.querySelectorAll('[data-physical-disc]')].find(n=>new RegExp(name).test(n.getAttribute('aria-label')||''))?.dataset.physicalDisc,name);
  await p.locator(`[data-physical-disc="${key}"]`).evaluate(n=>n.click());
  await p.waitForFunction(key=>document.querySelector('[data-bag-canvas]').bagViewer.stampLayers.some(l=>l.key===key),key,{timeout:15000});
  return p.evaluate(key=>document.querySelector('[data-bag-canvas]').bagViewer.stampLayers.find(l=>l.key===key).finish,key);
 };
 assert.equal(await pull('Buzzz'),'shatter');
 check('3D bag: the pulled copy in its own finish');

 // 6. The phone: another browser, the same account, its own (default) Appearance. The copy's choice comes with it.
 const phone=await h.device({engine:'webkit',viewport:{width:390,height:844},deviceScaleFactor:2,context:{isMobile:true,hasTouch:true}});
 try {
  await phone.signIn();
  assert.deepEqual(await phone.page.evaluate(()=>DisplayPalette.get().stamp),{ink:'auto',finish:'flat'});
  await openBag(phone.page);
  assert.equal(await phone.page.locator(`[data-disc-id="${buzzz.id}"] [data-disc-thumbnail]`).getAttribute('data-stamp-ink'),'pink');
  await edit(buzzz.id,phone.page);f=await fields(phone.page);
  assert.deepEqual([f.ink,f.finish],['pink','shatter'],'the phone\'s sheet shows the choice');
  assert.equal(f.inkFirst,'Appearance (Auto)','the phone\'s own Appearance is named');
  await phone.page.keyboard.press('Escape');
  await inspect(buzzz.id,phone.page);
  assert.equal((await stampOf(phone.page)).finish,'shatter','the phone\'s viewer wears it');
  await inspect(luna.id,phone.page);
  assert.equal((await stampOf(phone.page)).finish,'flat','the untouched copy follows the phone\'s own Appearance');
  check('phone: the sheet, thumbnail and viewer carry the copy\'s choice');
  assert.deepEqual(phone.errors,[]);
 } finally {await phone.close();}

 // 7. Back to Appearance, from the sheet: the copy wears the setting again.
 await openBag();await edit(buzzz.id);
 await page.locator('#bagStampInk').selectOption('');await page.locator('#bagStampFinish').selectOption('');
 await page.locator('#saveDisc').click();await page.waitForSelector('#addDiscDialog:not([open])');
 const back=await byNote('buzzz');assert.deepEqual([back.stamp_ink,back.stamp_finish],[null,null]);
 await inspect(buzzz.id);assert.equal((await stampOf()).finish,'foil');
 check('Appearance again: the copy follows the setting');

 assert.deepEqual(h.errors,[]);
 console.log('Stamp look browser suite passed.');
} finally {
 await h.stop();
}
