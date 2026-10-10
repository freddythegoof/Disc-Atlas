import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';

const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config='tests/auth.wrangler.jsonc',state='work/bag-memorial/d1-qa',base='https://localhost:8817',dir='outputs/bag-memorial';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8817','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser,page;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const errors=[],shots=[],themes=['light','midnight','charcoal','black'];
try {
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000},timezoneId:'America/New_York'});
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const cb=new URL(u.searchParams.get('redirect_uri'));cb.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${cb.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const setTheme=theme=>page.evaluate(t=>document.querySelector(`[data-theme-choice="${t}"]`).click(),theme);
 // My Bag shows one list at a time; memorials are in the Lost list.
 const showList=name=>page.locator(`#bagListPicker [data-bag-list="${name}"]`).click();
 const shot=async name=>{await page.evaluate(()=>document.fonts.ready);await page.locator('#bagMemorial').screenshot({path:`${dir}/${name}.png`});shots.push(name);};
 const api=async(path='',method='GET',body)=>{
  const response=await page.request.fetch(base+'/api/bag'+path,{method,headers:await page.evaluate(()=>({'Content-Type':'application/json',Origin:location.origin,'X-Atlas-CSRF':window.AtlasAccount.current.csrfToken})),...(body?{data:body}:{})});
  assert.ok(response.ok(),await response.text());return response.json();
 };
 const captureWall=async state=>{
  for(const theme of themes)for(const width of [1440,360]){
   await page.setViewportSize({width,height:width===360?800:1000});await setTheme(theme);
   await shot(`${state}-${width}-${theme}`);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
  }
 };
 await page.goto(base+'/?bag=1');await page.locator('#myBagSignIn').waitFor();await page.locator('#myBagSignIn').click();
 await page.getByRole('link',{name:'Continue with Google',exact:true}).waitFor();
 const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href');
 const redirect=await page.request.get(base+href,{maxRedirects:0});await page.goto(redirect.headers().location);await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();
 await showList('lost');
 assert.equal(await page.getByRole('heading',{name:'Gone But Not Forgotten',exact:true}).count(),1);
 assert.ok(await page.locator('#bagMemorialEmpty').isVisible());await captureWall('empty');
 const original=(await api('/discs','POST',{mold_id:'7446eb39abe5',plastic:'ESP',weight_g:177,wear:6,notes:'First ace. Keep this copy.',color:'#e99678',pocket:'goto',stability_bias:'less_stable'})).disc;
 const minimal=(await api('/discs','POST',{mold_id:'761c90d342f5',plastic:'Electron',weight_g:174,wear:9,color:'#a6bd92'})).disc;
 const stored=(await api('/discs','POST',{mold_id:'e70f48273d7f',plastic:'Champion',weight_g:175,wear:8,in_bag:false})).disc;
 await page.reload();await page.locator(`[data-bag-lost="${original.id}"]`).waitFor();
 await page.locator(`[data-bag-lost="${original.id}"]`).click();await page.locator('#lostDiscDialog').waitFor();
 const today=await page.evaluate(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
 assert.equal(await page.locator('#lostDate').inputValue(),today);
 for(let i=0;i<10;i++){await page.keyboard.press('Tab');assert.ok(await page.locator('#lostDiscDialog').evaluate(n=>n.contains(document.activeElement)));}
 await page.keyboard.press('Escape');assert.ok(await page.locator(`[data-bag-lost="${original.id}"]`).evaluate(n=>n===document.activeElement));
 await page.locator(`[data-bag-lost="${original.id}"]`).click();
 await page.locator('#lostDate').fill('2026-10-08');await page.locator('#lostCourse').fill('Maple Hill');await page.locator('#lostHole').fill('8');
 const story='One last skip.\nThe pond said "thanks". <Gone, for now.>';
 await page.locator('#lostStory').fill(story);
 await page.locator('#lostDiscDialog').screenshot({path:`${dir}/lost-sheet-360.png`});
 // Failed writes keep the form and active copy intact; a retry uses the same record.
 await context.route(base+'/api/bag/discs/'+original.id,route=>route.request().method()==='PATCH'?route.fulfill({status:503,json:{error:'Please try again.'}}):route.continue());
 await page.locator('#confirmLostDisc').click();await page.locator('#lostDiscStatus').filter({hasText:'Please try again.'}).waitFor();
 assert.equal((await api('/discs/'+original.id)).disc.status,'active');assert.equal(await page.locator('#lostStory').inputValue(),story);
 await context.unroute(base+'/api/bag/discs/'+original.id);await page.locator('#confirmLostDisc').click();await page.locator('#lostDiscDialog').waitFor({state:'hidden'});
 assert.ok(await page.locator(`[data-bag-lost="${minimal.id}"]`).evaluate(n=>n===document.activeElement),'Successful loss keeps focus in the Bag list, on the next disc');
 await showList('lost');
 const card=page.locator(`[data-memorial-id="${original.id}"]`);
 await card.waitFor();assert.match(await card.innerText(),/Buzzz/);assert.match(await card.innerText(),/ESP/);assert.match(await card.innerText(),/Oct 8, 2026/);assert.match(await card.innerText(),/Maple Hill/);assert.match(await card.innerText(),/Hole 8/);
 assert.equal(await card.locator('.bag-memorial-story').textContent(),story);
 assert.equal(await card.locator('gone').count(),0,'Stories render as text');
 assert.equal(await page.locator('#bagLineup .my-bag-disc').count(),1);assert.equal(await page.locator('#bagStorage .my-bag-disc').count(),1);
 assert.match(await page.locator('#bagSlotMeter').textContent(),/^1 \/ 20$/);
 await page.getByRole('radio',{name:'My Map',exact:true}).click();
 await page.waitForFunction(id=>myMap && filtered.length===1 && filtered[0].id===id,minimal.mold_id);
 assert.deepEqual(await page.evaluate(()=>filtered.map(d=>d.id)),[minimal.mold_id]);
 await page.getByRole('radio',{name:'Bag',exact:true}).click();
 await page.locator(`[data-bag-lost="${minimal.id}"]`).click();assert.equal(await page.locator('#lostDate').inputValue(),today);
 for(const field of ['lostCourse','lostHole','lostStory'])assert.equal(await page.locator('#'+field).inputValue(),'','A new loss starts clean');
 await page.locator('#confirmLostDisc').click();await page.locator('#lostDiscDialog').waitFor({state:'hidden'});
 await showList('lost');
 const minimalCard=page.locator(`[data-memorial-id="${minimal.id}"]`);await minimalCard.waitFor();
 assert.equal(await minimalCard.locator('.bag-memorial-story').count(),0);assert.equal(await minimalCard.locator('[data-lost-course],[data-lost-hole]').count(),0);
 assert.match(await page.locator('#bagSlotMeter').textContent(),/^0 \/ 20$/);assert.equal(await page.locator('#bagLineup .my-bag-disc').count(),0);
 await page.getByRole('radio',{name:'My Map',exact:true}).click();await page.locator('#myMapEmpty').waitFor();assert.equal(await page.evaluate(()=>myMap),null);
 await page.getByRole('radio',{name:'Bag',exact:true}).click();
 await page.reload();await page.locator('#bagListPicker').waitFor();await showList('lost');await page.locator('[data-memorial-id]').first().waitFor();assert.equal(await page.locator('[data-memorial-id]').count(),2);
 await captureWall('populated');
 // While Found is pending, Remove must not race it and leave a stale memorial onscreen.
 let releaseFound,foundStarted;
 const heldFound=new Promise(resolve=>{releaseFound=resolve;}),beganFound=new Promise(resolve=>{foundStarted=resolve;});
 await context.route(base+'/api/bag/discs/'+original.id,async route=>{
  if(route.request().method()!=='PATCH')return route.continue();
  const response=await route.fetch();foundStarted();await heldFound;await route.fulfill({response});
 });
 await card.locator('[data-bag-found]').click();await beganFound;
 try{assert.ok(await card.locator('[data-bag-remove]').isDisabled(),'Remove waits for Found to finish');}finally{releaseFound();}
 await card.waitFor({state:'hidden'});await context.unroute(base+'/api/bag/discs/'+original.id);
 assert.deepEqual((await api('/discs/'+original.id)).disc,original,'Found restores every original field');
 assert.match(await page.locator('#bagLineup').textContent(),/First ace\. Keep this copy\./);assert.match(await page.locator('#bagSlotMeter').textContent(),/^1 \/ 20$/);
 assert.ok(await page.locator(`[data-bag-found="${minimal.id}"]`).evaluate(n=>n===document.activeElement),'Found keeps focus in the Lost list, on the next memorial');
 await page.getByRole('radio',{name:'My Map',exact:true}).click();await page.waitForFunction(id=>myMap && filtered.length===1 && filtered[0].id===id,original.mold_id);
 await page.getByRole('radio',{name:'Bag',exact:true}).click();await showList('lost');
 await minimalCard.locator('[data-bag-remove]').click();await page.locator('#removeDiscDialog').waitFor();await page.keyboard.press('Escape');assert.ok(await minimalCard.isVisible());
 await minimalCard.locator('[data-bag-remove]').click();await page.locator('#confirmRemoveDisc').click();await page.locator('#removeDiscDialog').waitFor({state:'hidden'});
 assert.equal(await page.locator('[data-memorial-id]').count(),0);assert.ok(await page.locator('#bagMemorialEmpty').isVisible());
 assert.equal((await page.request.get(base+'/api/bag/discs/'+minimal.id)).status(),404);
 assert.deepEqual((await api()).discs.map(d=>d.id).sort(),[original.id,stored.id].sort(),'No extra or orphaned copies');
 assert.deepEqual(errors,[]);
 fs.writeFileSync(`${dir}/qa.json`,JSON.stringify({passed:true,themes,widths:[1440,360],shots,errors},null,2));
 fs.writeFileSync(`${dir}/screenshots.html`,`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gone But Not Forgotten — QA</title><style>body{font:16px/1.6 system-ui,sans-serif;margin:32px;background:#f4f5f6;color:#17202b}main{max-width:1120px;margin:auto}h1{line-height:1.2}figure{margin:24px 0 40px}img{display:block;max-width:100%;height:auto;margin-top:12px;border:1px solid #cbd1d8;border-radius:8px}figcaption{font-weight:600}a{color:#245f8d}</style><main><h1>Gone But Not Forgotten</h1><p>Populated and empty memorial walls at desktop and phone sizes, in every theme.</p><p><a href="#populated">Populated wall</a> · <a href="#empty">Empty state</a> · <a href="#form">Lost disc form</a></p>${['populated','empty'].map(state=>`<h2 id="${state}">${state==='populated'?'Populated wall':'Empty state'}</h2>${shots.filter(name=>name.startsWith(state)).map(name=>`<figure><figcaption>${name}</figcaption><img src="${name}.png" alt="${name.replaceAll('-',' ')}" loading="lazy"></figure>`).join('')}`).join('')}<h2 id="form">Lost disc form</h2><img src="lost-sheet-360.png" alt="Lost disc form on a phone"></main></html>`);
 console.log('PASS: loss with full/minimal fields, retry, keyboard focus, preserved physical data, found, confirmed removal, map/count exclusions, reload persistence, 4 themes × desktop/phone. Screenshots: '+dir);
}catch(error){if(page)await page.screenshot({path:`${dir}/failure.png`,fullPage:true});throw error;}
finally{if(browser)await browser.close();server.kill();}
