// Real Gallery UI and shared WebGL viewer on local Wrangler/D1/R2. Nothing reaches production.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const config='tests/auth.wrangler.jsonc',state='work/all-discs/d1-qa',base='https://localhost:8842',dir='outputs/all-discs';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8842','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const errors=[];
try{
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.env.BAG3D_CHROMIUM_ARGS?.split(' ').filter(Boolean)||['--use-angle=d3d11','--enable-gpu']});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000},timezoneId:'America/New_York'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const cb=new URL(u.searchParams.get('redirect_uri'));cb.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${cb.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const tab=name=>page.locator(`[data-bag-view="${name}"]`);
 const filter=name=>page.locator(`[data-album-filter="${name}"]`),counter=page.locator('[data-album-counter]'),stage=page.locator('[data-album-stage]');
 const api=async(path='',method='GET',body)=>{const r=await page.request.fetch(base+'/api/bag'+path,{method,headers:await page.evaluate(()=>({'Content-Type':'application/json',Origin:location.origin,'X-Atlas-CSRF':AtlasAccount.current.csrfToken})),...(body?{data:body}:{})});assert.ok(r.ok(),await r.text());return r.json();};
 const reload=async()=>{await page.reload();await page.waitForFunction(()=>window.AtlasAccount?.current?.user&&discs.length>0);await page.locator('#myBagLoadState').waitFor({state:'hidden'});await tab('storage').click();};
 const current=()=>stage.getAttribute('data-disc-id');
 const expectCounter=async text=>{await page.waitForFunction(t=>document.querySelector('[data-album-counter]')?.textContent===t,text);};
 await page.goto(base+'/?bag=1');await page.locator('#myBagSignIn').click();
 const link=page.getByRole('link',{name:'Continue with Google',exact:true});await link.waitFor();
 const redirect=await page.request.get(base+await link.getAttribute('href'),{maxRedirects:0});await page.goto(redirect.headers().location);await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();await tab('storage').click();
 // Gallery is a collection section beside Storage and Lost.
 await tab('gallery').click({timeout:5000});
 await page.getByText('No discs in the collection yet',{exact:true}).waitFor();
 assert.equal(await counter.innerText(),'0 / 0');assert.ok(await stage.isHidden());
 assert.ok(await page.getByRole('button',{name:'Next disc',exact:true}).isDisabled());
 const fixtures=[['3d60892b6812','Star',true],['3d60892b6812','DX',false],['e70f48273d7f','Champion',false],['e9a88cc4f3b1','Champion',true],['7446eb39abe5','ESP',false],['ff4bf9e7743c','Putter Line Hard',true],['3ea9734a60f7','DX',false]];
 const owned=[];for(const [mold_id,plastic,in_bag] of fixtures)owned.push((await api('/discs','POST',{mold_id,plastic,in_bag,wear:8,weight_g:173,color:'#e6c668'})).disc);
 const lost=(await api('/discs','POST',{mold_id:'7446eb39abe5',plastic:'ESP',wear:8,weight_g:173,color:'#70b7cd'})).disc;
 await api('/discs/'+lost.id,'PATCH',{status:'lost',lostDate:'2026-10-16'});
 // A real private R2 photo, consumed by the actual viewer rather than an image placeholder.
 const photoBytes=await page.evaluate(async bytes=>{const {preparePhoto}=await import('/disc-photo.mjs');const bitmap=await createImageBitmap(new Blob([new Uint8Array(bytes)],{type:'image/webp'}));const {blob}=await preparePhoto(bitmap,{});bitmap.close();return [...new Uint8Array(await blob.arrayBuffer())];},[...fs.readFileSync('tests/fixtures/stamped-disc.webp')]);
 const photoResponse=await page.request.put(base+'/api/bag/discs/'+owned[0].id+'/photo',{headers:await page.evaluate(()=>({'Content-Type':'image/webp',Origin:location.origin,'X-Atlas-CSRF':AtlasAccount.current.csrfToken})),data:Buffer.from(photoBytes)});
 assert.ok(photoResponse.ok(),await photoResponse.text());
 await reload();assert.ok(await page.locator('#storageScene').isVisible());await tab('gallery').click();await expectCounter('1 / 7');
 await page.waitForFunction(()=>BagApp.scenes.album?.state.props?.mold==='Destroyer'&&BagApp.scenes.album.debug.photo?.userData.photoReady);
 assert.equal(await stage.locator('canvas').count(),1);assert.equal(await current(),owned[0].id);
 assert.ok(await page.locator('[data-album-bag]').isVisible());
 assert.equal(await page.evaluate(()=>BagApp.scenes.album.debug.photo.visible),true);assert.equal(await page.evaluate(()=>BagApp.scenes.album.debug.stamp.visible),false);
 await page.locator('#allDiscsGallery [data-disc3d-clay]').click();assert.equal(await page.evaluate(()=>BagApp.scenes.album.debug.photo.visible),false);
 await page.locator('#allDiscsGallery [data-disc3d-clay]').click();assert.equal(await page.evaluate(()=>BagApp.scenes.album.debug.photo.visible),true);
 const next=page.getByRole('button',{name:'Next disc',exact:true}),prev=page.getByRole('button',{name:'Previous disc',exact:true});
 await next.click();await expectCounter('2 / 7');assert.equal(await current(),owned[1].id);assert.ok(await page.locator('[data-album-bag]').isHidden());
 await prev.click();await expectCounter('1 / 7');await prev.click();await expectCounter('7 / 7');await next.click();await expectCounter('1 / 7');
 // Spin (docs/spin-color-default.md): the gallery's viewer turns on its turntable, keeps turning from disc to disc and
 // eases to a stop when turned off, leaving the disc where it got to.
 const album=()=>page.evaluate(()=>({spin:BagApp.scenes.album.state.spin,turn:BagApp.scenes.album.debug.discGroup.rotation.y}));
 assert.equal((await album()).spin,false,'off for a fresh player');
 await page.locator('#allDiscsGallery [data-disc3d-spin]').click();
 let spun=await album();await page.waitForTimeout(1200);assert.equal(spun.spin,true);assert.notEqual((await album()).turn,spun.turn,'the gallery disc turns');
 await next.click();await expectCounter('2 / 7');spun=await album();assert.equal(spun.spin,true,'still on for the next disc');
 await page.waitForTimeout(600);assert.notEqual((await album()).turn,spun.turn);
 await page.locator('#allDiscsGallery [data-disc3d-spin]').click();await page.waitForTimeout(1300);
 spun=await album();await page.waitForTimeout(400);assert.deepEqual(await album(),spun,'eased to a stop');assert.notEqual(spun.turn,0);
 await prev.click();await expectCounter('1 / 7');
 // Window keys, including from the viewer canvas, wrap without rotating the old disc.
 await stage.locator('canvas').focus();await page.keyboard.press('ArrowLeft');await expectCounter('7 / 7');await page.keyboard.press('ArrowRight');await expectCounter('1 / 7');
 const expected={distance:[owned[0].id,owned[1].id,owned[2].id],fairway:[owned[3].id],mid:[owned[4].id],putter:[owned[5].id,owned[6].id]};
 for(const [key,ids] of Object.entries(expected)){
  await filter(key).click();await expectCounter(`1 / ${ids.length}`);
  const seen=[];for(let i=0;i<ids.length;i++){seen.push(await current());await next.click();}
  assert.deepEqual(seen,ids,`${key}: exact class membership and stable order`);await expectCounter(`1 / ${ids.length}`);
 }
 await filter('all').click();const seen=[];for(let i=0;i<7;i++){seen.push(await current());await next.click();}
 assert.equal(new Set(seen).size,7);assert.ok(!seen.includes(lost.id));assert.equal(await stage.locator('canvas').count(),1);
 await page.evaluate(()=>{for(let i=0;i<50;i++)document.querySelector('[data-album-step="1"]').click();});
 await expectCounter('2 / 7');await page.waitForFunction(()=>BagApp.scenes.album?.debug.photo===null);
 assert.equal(await stage.locator('canvas').count(),1,'Rapid flips reuse one viewer and discard the old photo');
 await filter('all').click();await expectCounter('1 / 7');
 // Do not steal arrows from sliders or other page controls.
 await page.waitForFunction(()=>document.querySelector('#allDiscsGallery').dataset.appearance==='ready');
 const tilt=page.locator('#allDiscsGallery [data-disc3d-tilt]');await tilt.focus();await page.keyboard.press('ArrowRight');await expectCounter('1 / 7');assert.equal(await tilt.inputValue(),'1');
 await tab('bag').click();await page.keyboard.press('ArrowRight');assert.ok(await page.locator('#allDiscsGallery').isHidden());await tab('storage').click();assert.ok(await page.locator('#storageScene').isVisible());
 await tab('gallery').click();await page.evaluate(()=>document.querySelector('[data-theme-choice="light"]').click());
 const shots=async(p,size)=>{
  for(const theme of ['light','black'])for(const cls of ['all','putter']){
   await p.evaluate(t=>document.querySelector(`[data-theme-choice="${t}"]`).click(),theme);await p.locator(`[data-album-filter="${cls}"]`).click();
   if(cls==='all')await p.waitForFunction(()=>BagApp.scenes.album?.debug.photo?.userData.photoReady);
   await p.evaluate(()=>{BagApp.scenes.album.setTilt(0);BagApp.scenes.album.setView('angle',{instant:true});return document.fonts.ready;});await p.waitForTimeout(400);
   await p.locator('#allDiscsGallery').screenshot({path:`${dir}/${size}-${cls}-${theme}.png`});
   assert.ok(await p.locator('[data-bag-view="gallery"]').isVisible());
  }
 };
 await shots(page,'desktop');
 const phone=await browser.newContext({ignoreHTTPSErrors:true,storageState:await context.storageState(),viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const p=await phone.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/?bag=1');await p.waitForFunction(()=>window.AtlasAccount?.current?.user&&discs.length>0);await p.locator('#myBagLoadState').waitFor({state:'hidden'});
 await p.locator('[data-bag-view="gallery"]').click();await p.locator('[data-album-stage] canvas').waitFor();
 const cdp=await phone.newCDPSession(p),box=await p.locator('[data-album-stage] canvas').boundingBox();
 const swipe=async(from,to,y=box.y+box.height/2)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:from,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:to,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
 await swipe(box.x+box.width*.8,box.x+box.width*.2);await p.waitForFunction(()=>document.querySelector('[data-album-counter]').textContent==='2 / 7');
 await swipe(box.x+box.width*.2,box.x+box.width*.8);await p.waitForFunction(()=>document.querySelector('[data-album-counter]').textContent==='1 / 7');
 await swipe(box.x+box.width*.2,box.x+box.width*.8);await p.waitForFunction(()=>document.querySelector('[data-album-counter]').textContent==='7 / 7');
 for(const b of await p.locator('[data-album-step]').all()){const r=await b.boundingBox();assert.ok(r.width>=44&&r.height>=44);}
  await p.waitForFunction(()=>document.querySelector('#allDiscsGallery').dataset.appearance==='ready');
 const phoneTilt=p.locator('#allDiscsGallery [data-disc3d-tilt]');await phoneTilt.scrollIntoViewIfNeeded();const slider=await phoneTilt.boundingBox();
 await swipe(slider.x+slider.width*.2,slider.x+slider.width*.8,slider.y+slider.height/2);
 assert.equal(await p.locator('[data-album-counter]').innerText(),'7 / 7','A touch slider drag must not turn the album page');
 assert.notEqual(await phoneTilt.inputValue(),'0','The touch gesture still adjusts release angle');
 await shots(p,'phone');assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await phone.close();
 // Owned-but-unrated entries do not get fabricated flight data or a previous disc's model.
 const unrated=await page.evaluate(()=>discs.find(d=>d.speed==null)?.id);assert.ok(unrated);
 for(const i of owned)await api('/discs/'+i.id,'DELETE');
 await api('/discs','POST',{mold_id:unrated,plastic:'Unknown',wear:8,weight_g:173,color:'#e6c668'});
 await reload();await tab('gallery').click();await expectCounter('1 / 1');
 await page.waitForFunction(()=>BagApp.scenes.album?.state.source==='pdga');
 assert.ok(await stage.isVisible(),'An unrated disc with real PDGA measurements still has a 3D album view');
 assert.equal(await page.locator('[data-album-flight]').innerText(),'');
 await filter('putter').click();await page.getByText('No putters in the collection yet',{exact:true}).waitFor();await expectCounter('0 / 0');
 await reload();assert.ok(await page.locator('#storageScene').isVisible());
 // Demo access remains list-only with signed-in collection navigation hidden.
 const demo=await browser.newContext({ignoreHTTPSErrors:true}),d=await demo.newPage();await d.goto(base+'/?bag=1');await d.locator('#myBagDemo').waitFor();await d.locator('[data-bag-list="storage"]').click();
 assert.equal(await d.locator('[data-storage-mode]').count(),0);assert.ok(await d.locator('#myBagViews').isHidden());assert.ok(await d.locator('#bagStorage').isVisible());await demo.close();
 assert.deepEqual(errors,[]);console.log('All Discs browser: ownership, order, controls, wrap, filters, photo, clay, touch, reset, empty/unrated, demo and eight screenshots passed.');
}finally{await browser?.close();server.kill();}
