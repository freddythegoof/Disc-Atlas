import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config='tests/auth.wrangler.jsonc',state='work/bag-v11/d1-qa',base='https://localhost:8798',dir='outputs/bag-v11';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';fs.mkdirSync(dir,{recursive:true});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8798','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser,page;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const themes=['light','midnight','charcoal'],widths=[1440,360],errors=[],metrics=[];
try{
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000},recordVideo:{dir:dir+'/video',size:{width:1440,height:1000}}});
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const cb=new URL(u.searchParams.get('redirect_uri'));cb.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${cb.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const phase=async want=>page.waitForFunction(w=>document.querySelector('#bagScene').dataset.phase===w,want);
 const theme=async name=>{await page.getByRole('button',{name:'Site menu',exact:true}).click();await page.getByRole('menuitemradio',{name:name[0].toUpperCase()+name.slice(1),exact:true}).click();await page.keyboard.press('Escape');};
 const shot=async name=>page.screenshot({path:`${dir}/${name}.png`});
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>window.AtlasAccount?.current);
 assert.ok(!await page.locator('#bagScene').isVisible());assert.equal((await page.request.get(base+'/api/bag')).status(),401);
 await page.locator('#myBagSignIn').click();await page.getByRole('link',{name:'Continue with Google',exact:true}).waitFor();
 const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href'),redirect=await page.request.get(base+href,{maxRedirects:0});
 await page.goto(redirect.headers().location);await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();await phase('open');
 assert.equal(await page.locator('#accountButton').innerText(),'Hi Atlas');assert.ok(await page.locator('#bagStorageEmpty').isVisible());
 await page.locator('#emptyBagDirectory').click();await page.locator('#rows .directory-add').first().click();await page.locator('#addDestinationMenu').getByRole('menuitem',{name:'Bag',exact:true}).click();await page.locator('#addDiscDialog').waitFor();
 assert.equal(await page.locator('#bagDiscColor').inputValue(),'#e6c668');await page.locator('#bagPlastic').selectOption('Champion');assert.equal(await page.locator('#bagDiscColor').inputValue(),'#70b7cd');
 await page.locator('#bagDiscColor').fill('#ed7868');await page.locator('#bagPlastic').selectOption('DX');assert.equal(await page.locator('#bagDiscColor').inputValue(),'#ed7868','custom color survives plastic change');
 await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 await page.evaluate(async()=>{const headers={'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken};
  const bag=await fetch('/api/bag',{method:'PUT',headers,body:JSON.stringify({bag_model:'Grip BX3',bag_color:'#343c49'})});if(!bag.ok)throw Error(await bag.text());
  for(const disc of [
   {mold_id:'3d60892b6812',plastic:'Champion',wear:5,weight_g:170,color:'#70b7cd',notes:'Forehand only'},
   {mold_id:'35dae588c670',plastic:'Neutron',wear:7,weight_g:175,color:'#a7c68c'},
   {mold_id:'7446eb39abe5',plastic:'Z',wear:8,weight_g:180,color:'#b99bdd'},
   {mold_id:'761c90d342f5',plastic:'Electron',wear:6,weight_g:175,color:'#e6c668'},
   {mold_id:'ff4bf9e7743c',plastic:'Putter Line Hard',wear:10,weight_g:174,color:'#e2d8c1'},
   {mold_id:'9152771e1f7b',plastic:'DX',wear:3,weight_g:180,color:'#79b3a8',in_bag:false,notes:'Backup · windy rounds'}
  ]){const r=await fetch('/api/bag/discs',{method:'POST',headers,body:JSON.stringify(disc)});if(!r.ok)throw Error(await r.text());}
 });
 await page.goto(base+'/?bag=1');await phase('open');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length===7);
 assert.equal(await page.locator('#bagSlotMeter').innerText(),'6 / 23');assert.equal(await page.locator('#bagSlotMeter').getAttribute('title'),'18 main + 4 putter + 1 extra');
 assert.deepEqual(await page.locator('#bagScene svg > g').evaluateAll(nodes=>nodes.map(n=>n.id)),['bag-back','bag-disc-layer','bag-front','bag-lid']);
 assert.equal(await page.locator(':not(.bag-goto-slot) > .bag-slot-hollow').count(),17);assert.equal(await page.locator('.bag-goto-slot > .bag-slot-hollow').count(),1,'Empty go-to slot');assert.equal(await page.locator('[data-pocket="putter"] [data-physical-disc]').count(),2);
 const speeds=await page.locator('[data-pocket="main"] [data-physical-disc]').evaluateAll(nodes=>nodes.map(n=>{const row=n.getAttribute('aria-label');return row.split(',')[0];}));assert.equal(speeds.at(-1),'Buzzz');
 const stored=page.locator('#bagStorage [data-bag-move]').first(),storedId=await stored.getAttribute('data-bag-move');await stored.click();await page.waitForFunction(()=>document.querySelector('#bagSlotMeter').textContent==='7 / 23');
 assert.ok(await page.locator('#bagStorageEmpty').isVisible());assert.ok(await page.locator('[data-bag-move]').filter({hasText:'Store'}).count());
 await page.locator(`[data-bag-move="${storedId}"]`).click();await page.waitForFunction(()=>document.querySelector('#bagSlotMeter').textContent==='6 / 23');
 await page.locator('#editBagModel').click();await page.locator('#bagFabricColor').fill('#436752');await page.locator('#saveBagModel').click();await page.locator('#bagModelDialog').waitFor({state:'hidden'});
 assert.equal(await page.locator('#bagScene svg').evaluate(n=>n.style.getPropertyValue('--bag-secondary')),'#324d3e');
 await page.reload();await phase('open');assert.equal(await page.locator('#bagScene svg').evaluate(n=>n.style.getPropertyValue('--bag-primary')),'#436752');
 await page.locator('#editBagModel').click();await page.locator('#bagFabricColor').fill('#343c49');await page.locator('#saveBagModel').click();await page.locator('#bagModelDialog').waitFor({state:'hidden'});
 assert.equal(await page.locator('#bagScene svg').evaluate(n=>n.style.getPropertyValue('--bag-primary')),'');
 await page.waitForFunction(()=>document.activeElement===document.querySelector('#editBagModel'));
 const discId=await page.locator('[data-pocket="main"] [data-physical-disc]').first().getAttribute('data-physical-disc');
 const disc=page.locator(`[data-physical-disc="${discId}"]`);
 await disc.focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.dataset.slotOrder),'1');await page.keyboard.press('Shift+Tab');assert.ok(await disc.evaluate(n=>n===document.activeElement));await page.keyboard.press('Escape');
 const layoutBefore=await page.locator('#bagScene').boundingBox();await disc.hover();await page.waitForTimeout(400);assert.ok(await disc.evaluate(n=>n.classList.contains('is-lifted')));assert.deepEqual(await page.locator('#bagScene').boundingBox(),layoutBefore,'Lift causes no layout shift');await page.mouse.move(0,0);await page.waitForTimeout(400);assert.ok(await disc.evaluate(n=>!n.classList.contains('is-lifted')));
 await disc.focus();await page.waitForTimeout(400);assert.ok(await disc.evaluate(n=>n.classList.contains('is-lifted') && document.activeElement===n));
 const faceRect=await disc.locator('.bag-disc-face').boundingBox(),svgRect=await page.locator('.interactive-bag-svg').boundingBox();assert.ok(faceRect.x>=svgRect.x+233/800*svgRect.width && faceRect.x+faceRect.width<=svgRect.x+567/800*svgRect.width,'Lifted top stays inside the SVG opening instead of clipping into the fixed front '+JSON.stringify({faceRect,svgRect}));
 await page.keyboard.press('Enter');await page.locator('#detail').waitFor();await page.locator('#closeDetail').click();await page.locator('#bagTab').click();
 await page.locator('[data-bag-toggle]').focus();await page.keyboard.press('Enter');await phase('closed');assert.equal(await disc.getAttribute('tabindex'),'-1');
 await page.keyboard.press('Enter');await phase('open');
 await page.locator('.interactive-bag-svg').click({position:{x:180,y:400}});await phase('closed');await page.locator('.interactive-bag-svg').click({position:{x:180,y:300}});await phase('open');
 // Genuine animation frames, not synthetic open poses: pause the flap during
 // its live rAF fold and the disc animations during their staggered rise.
 for(const name of themes)for(const width of widths){
  await page.setViewportSize({width,height:width===360?800:1000});await theme(name);await page.evaluate(()=>scrollTo(0,0));
  await page.locator('[data-bag-toggle]').click();await phase('closed');await page.evaluate(()=>scrollTo(0,0));await shot(`closed-${width}-${name}`);
  const openMs=await page.evaluate(()=>new Promise(resolve=>{const root=document.querySelector('#bagScene'),start=performance.now(),observer=new MutationObserver(()=>{if(root.dataset.phase==='open'){observer.disconnect();resolve(performance.now()-start);}});observer.observe(root,{attributes:true,attributeFilter:['data-phase']});document.querySelector('[data-bag-toggle]').click();}));metrics.push({theme:name,width,openMs});assert.ok(openMs<1000,'Opening sequence stays under one second');
  await page.evaluate(()=>scrollTo(0,0));await shot(`open-${width}-${name}`);
  await page.locator('[data-bag-toggle]').click();await phase('closed');
  await page.clock.install();await page.clock.pauseAt(new Date());await page.locator('[data-bag-toggle]').click();await page.clock.runFor(110);
  assert.equal(await page.locator('#bagScene').getAttribute('data-phase'),'opening');assert.match(await page.locator('#bag-lid').getAttribute('transform'),/translate\(0 488\)/);
  await page.evaluate(()=>scrollTo(0,0));await shot(`opening-flap-${width}-${name}`);
  await page.clock.runFor(1000);await page.clock.resume();await phase('open');
  await page.locator('[data-bag-toggle]').click();await phase('closed');
  await page.evaluate(()=>scrollTo(0,0));
  await page.evaluate(()=>new Promise(resolve=>{document.querySelector('[data-bag-toggle]').click();setTimeout(()=>{document.querySelectorAll('[data-physical-disc]').forEach(n=>n.getAnimations({subtree:true}).forEach(a=>a.pause()));resolve();},420);}));
  assert.equal(await page.locator('#bagScene').getAttribute('data-phase'),'opening');await shot(`opening-${width}-${name}`);
  await page.locator('[data-physical-disc]').evaluateAll(nodes=>nodes.forEach(n=>n.getAnimations({subtree:true}).forEach(a=>a.play())));await phase('open');
  await disc.focus();await page.waitForTimeout(420);await page.evaluate(()=>scrollTo(0,0));assert.equal(await page.locator('#bagLiftInfo').getAttribute('data-visible'),'true');await shot(`lifted-${width}-${name}`);
  await page.locator('[data-bag-toggle]').focus();await page.waitForTimeout(400);assert.equal(await page.locator('#bagLiftInfo').getAttribute('data-visible'),'false');
  await page.locator('#bagStorage').scrollIntoViewIfNeeded();await shot(`storage-${width}-${name}`);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 // Measure actual frame cadence during repeated lifts (ordinary browser load).
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));
 const cadence=await page.evaluate(async()=>{const node=document.querySelector('[data-physical-disc]'),times=[];let last;node.focus();await new Promise(resolve=>{const frame=now=>{if(last)times.push(now-last);last=now;if(times.length<60)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});return {averageMs:times.reduce((a,b)=>a+b,0)/times.length,maxMs:Math.max(...times),over33ms:times.filter(n=>n>33.5).length};});
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-bag-toggle]').click();await phase('closed');await page.locator('[data-bag-toggle]').click();await phase('open');await page.emulateMedia({reducedMotion:'no-preference'});
 // A real touch context must use one tap to lift, a second to inspect.
 const touch=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:360,height:800},isMobile:true,hasTouch:true,storageState:await context.storageState()});
 const mobile=await touch.newPage();await mobile.goto(base+'/?bag=1');await mobile.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='open');
 const touchId=await mobile.locator('[data-pocket="main"] [data-physical-disc]').first().getAttribute('data-physical-disc'),touchDisc=mobile.locator(`[data-physical-disc="${touchId}"]`);await touchDisc.tap();assert.equal(await mobile.locator('#bagLiftInfo').getAttribute('data-visible'),'true');assert.ok(!await mobile.locator('#detail').isVisible());await touchDisc.tap();await mobile.locator('#detail').waitFor();await touch.close();
 await page.evaluate(()=>window.AtlasAccount.signOut());await page.waitForFunction(()=>!window.AtlasAccount.current.user);assert.equal(await page.locator('[data-physical-disc]').count(),0);assert.ok(!await page.locator('#bagScene').isVisible());assert.equal(await page.locator('#accountButton').innerText(),'Sign in');
 assert.deepEqual(errors,[]);fs.writeFileSync(dir+'/qa.json',JSON.stringify({passed:true,themes,widths,metrics,cadence,errors},null,2));
 await context.close();console.log('PASS: SVG handoff, stored colors, true totals, Storage, keyboard/touch/reduced motion, 36 theme screenshots and motion recording. '+JSON.stringify(cadence));
}catch(error){if(page){console.error(JSON.stringify({errors,scene:await page.locator('#bagScene').evaluate(n=>({phase:n.dataset.phase,open:n.querySelector('svg')?.dataset.state,focused:document.activeElement.outerHTML.slice(0,250),discs:[...n.querySelectorAll('[data-physical-disc]')].map(d=>({id:d.dataset.physicalDisc,tab:d.getAttribute('tabindex'),lift:d.classList.contains('is-lifted')}))})),logs:logs.slice(-500)},null,2));await page.screenshot({path:dir+'/failure.png'});}throw error;}
finally{if(browser)await browser.close();server.kill();}
