import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config='tests/auth.wrangler.jsonc',state='work/bag-v12/d1-qa',base='https://localhost:8799',dir='outputs/bag-v12';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';fs.mkdirSync(dir,{recursive:true});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8799','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser,page;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const themes=['light','midnight','charcoal'],widths=[1440,360],errors=[],shots=[];
try{
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const cb=new URL(u.searchParams.get('redirect_uri'));cb.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${cb.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const phase=()=>page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='open');
 const theme=async name=>{await page.getByRole('button',{name:'Site menu',exact:true}).click();await page.getByRole('menuitemradio',{name:name[0].toUpperCase()+name.slice(1),exact:true}).click();await page.keyboard.press('Escape');};
 const shot=async (state,width,theme)=>{const name=`${state}-${width}-${theme}.png`;await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`${dir}/${name}`});shots.push({state,width,theme,name});};
 const data=async()=>await (await page.request.get(base+'/api/bag')).json();
 const lineup=()=>page.locator('#bagLineup .my-bag-disc').evaluateAll(rows=>rows.map(r=>r.dataset.discId));
 const add=async(root,destination)=>{await root.locator('[data-add-menu]').click();await page.locator('#addDestinationMenu').getByRole('menuitem',{name:destination,exact:true}).click();await page.locator('#addDiscDialog').waitFor();};
 // Real wheel events must zoom and must not scroll even above map controls.
 await page.goto(base);await page.waitForFunction(()=>filtered.length>0);await page.locator('#mapTab').click();
 if(process.argv.includes('--map-red')){
  const before=await page.evaluate(()=>zoom),rect=await page.locator('#map').boundingBox();await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.mouse.wheel(0,-10);await page.waitForTimeout(300);
  assert.ok(await page.evaluate(z=>zoom>z,before),'Fine pixel wheel defaults to zoom');
  console.log('PASS: wheel regression probe');
 }else{
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>window.AtlasAccount?.current);
 await page.locator('#myBagSignIn').click();await page.getByRole('link',{name:'Continue with Google',exact:true}).waitFor();
 const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href'),redirect=await page.request.get(base+href,{maxRedirects:0});
 await page.goto(redirect.headers().location);await page.getByRole('link',{name:'Continue as Atlas Player'}).click();await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();
 assert.equal(await page.locator('#bagSort').count(),1,'Bag sort control exists');
 const seeded=await page.evaluate(async()=>{
  const headers={'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken};
  await fetch('/api/bag',{method:'PUT',headers,body:JSON.stringify({bag_model:'Grip BX3'})});
  const discs=[];for(const details of [
   {mold_id:'3d60892b6812',plastic:'Champion',color:'#70b7cd',notes:'Fresh run · headwinds',stability_bias:'more_stable'},
   {mold_id:'3d60892b6812',plastic:'Star',wear:4,color:'#ed7868',notes:'Seasoned copy · long turnovers',stability_bias:'less_stable'},
   {mold_id:'35dae588c670',plastic:'Neutron',color:'#a7c68c',pocket:'putter',notes:'Approach pocket'},
   {mold_id:'7446eb39abe5',plastic:'Z',color:'#b99bdd'},
   {mold_id:'761c90d342f5',plastic:'Electron',color:'#e6c668'},
   {mold_id:'ff4bf9e7743c',plastic:'Putter Line Hard',color:'#e2d8c1',pocket:'main'},
   {mold_id:'9152771e1f7b',plastic:'DX',color:'#79b3a8',in_bag:false,notes:'Backup for windy rounds'}
  ]){const r=await fetch('/api/bag/discs',{method:'POST',headers,body:JSON.stringify(details)});if(!r.ok)throw Error(await r.text());discs.push((await r.json()).disc);}
  return discs;
 });
 await page.reload();await phase();await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length===7);
 assert.equal(await page.locator('#bagSort').inputValue(),'speed');
 await page.locator('[data-slot-order="0"]').focus();await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'bagSort','Slot keyboard navigation reaches sort control');
 const initial=await lineup();assert.equal(initial.length,6);
 await page.locator('#bagSort').selectOption('stability');await page.waitForFunction(()=>document.querySelector('#bagSort').disabled===false);
 assert.equal((await data()).bag.sort_mode,'stability');await page.reload();await phase();assert.equal(await page.locator('#bagSort').inputValue(),'stability');
 await page.locator('#bagSort').selectOption('custom');await page.waitForFunction(()=>!document.querySelector('#bagSort').disabled);
 const first=await lineup();
 await page.locator(`[data-bag-later="${first[0]}"]`).focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelector('#bagSort').disabled);
 assert.deepEqual((await lineup()).slice(0,2),[first[1],first[0]],'Keyboard reorder persists physical copies');
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.bagLater),first[0],'Reordering retains focus');
 const beforeDrag=await lineup();await page.locator(`[data-disc-id="${beforeDrag[0]}"] [data-bag-drag]`).dragTo(page.locator(`[data-disc-id="${beforeDrag[2]}"]`));
 await page.waitForFunction(()=>!document.querySelector('#bagSort').disabled);assert.deepEqual((await lineup()).slice(0,3),[beforeDrag[1],beforeDrag[2],beforeDrag[0]]);
 const reordered=await lineup();await page.reload();await phase();assert.deepEqual(await lineup(),reordered,'Custom order survives reload');
 await page.locator('#editBagModel').click();await page.locator('#saveBagModel').click();await page.locator('#bagModelDialog').waitFor({state:'hidden'});
 assert.equal(await page.locator('#bagSort').inputValue(),'custom','Editing bag settings preserves the chosen sort');
 const putter=seeded[4],fairway=seeded[2];
 assert.ok(await page.locator(`[data-pocket="putter"] [data-physical-disc="${fairway.id}"]`).count(),'Any mold can occupy putter pocket');
 await page.locator(`[data-bag-edit="${putter.id}"]`).click();await page.locator('#bagPocket').selectOption('main');await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 assert.ok(await page.locator(`[data-pocket="main"] [data-physical-disc="${putter.id}"]`).count(),'Putter assignment overrides type');
 const duplicate=seeded[1];await page.locator(`[data-bag-edit="${duplicate.id}"]`).click();
 assert.equal(await page.getByRole('button',{name:'Less stable',exact:true}).getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'More stable',exact:true}).click();await page.getByRole('button',{name:'More stable',exact:true}).click();
 assert.equal(await page.locator('#bagStabilityBias').inputValue(),'');await page.getByRole('button',{name:'Less stable',exact:true}).click();await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 assert.equal((await data()).discs.find(d=>d.id===duplicate.id).stability_bias,'less_stable');assert.equal((await data()).discs.find(d=>d.id===seeded[0].id).notes,'Fresh run · headwinds');
 for(const name of process.argv.includes('--touch-only')?[]:themes)for(const width of widths){
  await page.setViewportSize({width,height:width===360?800:1000});await theme(name);await page.locator('#bagTab').click();await phase();await page.evaluate(()=>scrollTo(0,0));
  assert.equal(await page.evaluate(()=>document.body.dataset.view),'bag');assert.ok(await page.locator('#bagTab').evaluate(n=>n.classList.contains('active')));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
  await shot('sort',width,name);
  await page.locator(`[data-physical-disc="${duplicate.id}"]`).focus();await page.waitForTimeout(400);
  assert.match(await page.locator('#bagLiftInfo').innerText(),/Seasoned copy · long turnovers/);assert.match(await page.locator('#bagLiftInfo').innerText(),/Less stable/);
  await page.locator('#bagLiftInfo').scrollIntoViewIfNeeded();await shot('duplicate-note',width,name);await page.keyboard.press('Escape');
  await page.locator(`[data-bag-edit="${duplicate.id}"]`).click();await page.locator('.bag-stability-field').scrollIntoViewIfNeeded();await shot('duplicate-edit',width,name);await page.keyboard.press('Escape');
  await page.locator('#bagSort').selectOption('speed');await page.waitForFunction(()=>!document.querySelector('#bagSort').disabled);await page.locator('#bagLineup .my-bag-disc').first().evaluate(n=>scrollTo(0,scrollY+n.getBoundingClientRect().top-20));await shot('duplicate-copies',width,name);
  await page.locator('#bagSort').selectOption('custom');await page.waitForFunction(()=>!document.querySelector('#bagSort').disabled);
  await page.locator(`[data-bag-edit="${fairway.id}"]`).click();assert.equal(await page.locator('#bagPocket').inputValue(),'putter');await page.locator('#addDiscDialog').evaluate(n=>n.scrollTop=0);await shot('pocket',width,name);await page.keyboard.press('Escape');
  await page.locator('#listTab').click();await page.locator('#search').fill('Destroyer');await page.locator('#rows .directory-row').first().waitFor();
  await page.locator('#rows [data-add-menu]').first().click();await shot('add-directory',width,name);await page.keyboard.press('Escape');
  await add(page.locator('#rows .directory-row').first(),'Storage');assert.equal(await page.locator('#bagDestination').inputValue(),'storage');await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
  assert.equal((await data()).discs.at(-1).in_bag,false);
  await page.locator('#mapTab').click();await page.evaluate(()=>select(discs.find(d=>d.id==='3d60892b6812')));await page.locator('#detail').waitFor({state:'visible'});
  await page.locator('#addToBag').click();await shot('add-map',width,name);await page.keyboard.press('Escape');
  await add(page.locator('#detail'),'Storage');await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});assert.equal((await data()).discs.at(-1).in_bag,false);
  await page.evaluate(()=>{comparison=[selected];renderCompare();});await page.locator('#closeDetail').click();
  const compare=page.locator('#compareBar');await compare.locator('[data-add-menu]').click();await shot('add-comparison',width,name);await page.keyboard.press('Escape');
  await add(compare,'Storage');await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});assert.equal((await data()).discs.at(-1).in_bag,false);
  // Keyboard menu navigation, Escape and focus restoration.
  const trigger=compare.locator('[data-add-menu]');await trigger.focus();await page.keyboard.press('Enter');await page.keyboard.press('ArrowDown');assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Storage');await page.keyboard.press('Escape');assert.ok(await trigger.evaluate(n=>document.activeElement===n));
  await page.evaluate(()=>{comparison=[];renderCompare();});await page.locator('#search').fill('');
  await page.locator('#zoomReset').click();await page.waitForFunction(()=>!cameraTween);
  const map=page.locator('#map'),rect=await map.boundingBox();await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);
  const before=await page.evaluate(()=>({zoom,scroll:scrollY}));await page.mouse.wheel(0,-10);await page.waitForFunction(z=>zoom>z,before.zoom);await page.waitForFunction(()=>!cameraTween);assert.equal(await page.evaluate(()=>scrollY),before.scroll);
  const control=await page.locator('#zoomIn').boundingBox();await page.mouse.move(control.x+control.width/2,control.y+control.height/2);const controlZoom=await page.evaluate(()=>zoom);await page.mouse.wheel(0,-80);await page.waitForFunction(z=>zoom>z,controlZoom);await page.waitForFunction(()=>!cameraTween);assert.equal(await page.evaluate(()=>scrollY),before.scroll);
  for(const deltaMode of [1,2]){const captured=await map.evaluate((n,mode)=>{const e=new WheelEvent('wheel',{deltaY:-1,deltaMode:mode,bubbles:true,cancelable:true,clientX:n.getBoundingClientRect().x+100,clientY:n.getBoundingClientRect().y+100});n.dispatchEvent(e);return e.defaultPrevented;},deltaMode);assert.ok(captured);await page.waitForFunction(()=>!cameraTween);}
  await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.mouse.down();const panBefore=await page.evaluate(()=>({...pan}));await page.mouse.move(rect.x+rect.width/2+30,rect.y+rect.height/2+30,{steps:8});await page.mouse.up();await page.waitForFunction(()=>!cameraTween);assert.notDeepEqual(await page.evaluate(()=>({...pan})),panBefore,'Drag pans');
 }
 // Actual touch pointers: reorder and map pan/pinch in a mobile context.
 const touch=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:360,height:800},hasTouch:true,isMobile:true});await touch.addCookies(await context.cookies());const mobile=await touch.newPage();mobile.on('pageerror',e=>errors.push(e.stack));await mobile.goto(base+'/?bag=1');await mobile.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='open');
 const touchOrder=await mobile.locator('#bagLineup .my-bag-disc').evaluateAll(rows=>rows.map(r=>r.dataset.discId));
 await mobile.locator(`[data-bag-drag="${touchOrder[0]}"]`).scrollIntoViewIfNeeded();
 const source=await mobile.locator(`[data-bag-drag="${touchOrder[0]}"]`).boundingBox();const target=await mobile.locator(`[data-disc-id="${touchOrder[1]}"]`).boundingBox();
 const cdp=await touch.newCDPSession(mobile);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:source.x+10,y:source.y+10}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:target.x+50,y:target.y+30}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForFunction(()=>!document.querySelector('#bagSort').disabled);assert.deepEqual((await mobile.locator('#bagLineup .my-bag-disc').evaluateAll(rows=>rows.map(r=>r.dataset.discId))).slice(0,2),[touchOrder[1],touchOrder[0]]);
 // Reset the CDP gesture stream between independent bag and atlas scenarios.
 // Slow app loading also exercises frames scheduled by fonts before globals exist.
 await touch.route(base+'/app.js',async route=>{await new Promise(r=>setTimeout(r,250));await route.continue();});
 await mobile.goto(base);await mobile.waitForFunction(()=>filtered.length>0);
 await mobile.locator('#mapTab').tap();await mobile.waitForFunction(()=>document.body.dataset.view==='map');await mobile.locator('#zoomIn').tap();await mobile.waitForFunction(()=>!cameraTween);const rect=await mobile.locator('#map').boundingBox(),x=rect.x+rect.width/2,y=rect.y+rect.height/2;
 const start=await mobile.evaluate(()=>({...pan}));await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+35,y:y+30}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForFunction(()=>!cameraTween);assert.notDeepEqual(await mobile.evaluate(()=>({...pan})),start);
 const zoomBefore=await mobile.evaluate(()=>zoom);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-30,y},{x:x+30,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-60,y},{x:x+60,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForTimeout(100);assert.ok(await mobile.evaluate(z=>zoom>z,zoomBefore));await touch.close();
 assert.deepEqual(errors,[]);
 fs.writeFileSync(dir+'/qa.json',JSON.stringify({passed:true,themes,widths,screenshots:shots,errors},null,2));
 fs.writeFileSync(dir+'/screenshots.html',`<!doctype html><meta charset="utf-8"><title>Bag v1.2 screenshots</title><style>body{margin:32px;background:#14191f;color:#e9edf0;font:16px system-ui}h1{font-size:28px}section{margin:48px 0}a{color:inherit}figure{margin:20px 0;display:inline-block;vertical-align:top}img{max-width:100%;width:700px}figure.mobile img{width:360px}figcaption{margin:8px 0;color:#a7b3c0}</style><h1>Bag v1.2 · local QA</h1>${themes.map(theme=>`<section><h2>${theme}</h2>${shots.filter(s=>s.theme===theme).map(s=>`<figure class="${s.width===360?'mobile':''}"><a href="${s.name}"><img src="${s.name}" loading="lazy"></a><figcaption>${s.state} · ${s.width}px</figcaption></figure>`).join('')}</section>`).join('')}`);
 console.log(`PASS: local D1 fields, saved sort, keyboard/mouse/touch reorder, pocket override, per-copy stability notes, all add destinations, menu keyboard, wheel capture, drag/pinch. ${shots.length} screenshots; no page errors.`);
 await context.close();
 }
}finally{await browser?.close();server.kill();}
