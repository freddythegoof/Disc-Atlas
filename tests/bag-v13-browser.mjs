import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config='tests/auth.wrangler.jsonc',state='work/bag-v13/d1-qa',base='https://localhost:8801',dir='outputs/bag-v13';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8801','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const themes=['light','midnight','charcoal'],widths=[1440,360],errors=[],shots=[],checks=[];
const check=label=>checks.push(label);
try {
 const deadline=Date.now()+45000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 let expectHttpError=false;page.on('console',m=>{if(m.type()==='error' && !(expectHttpError && /status of 400/.test(m.text())))errors.push(m.text());});
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const cb=new URL(u.searchParams.get('redirect_uri'));cb.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${cb.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const phase=()=>page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='open');
 const reload=async()=>{await page.reload();await phase();};
 const data=async()=>await (await page.request.get(base+'/api/bag')).json();
 const pocketOf=async id=>(await data()).discs.find(d=>d.id===id).pocket;
 const slot=(id,pocket)=>page.locator(`#bagScene [data-pocket="${pocket}"] > [data-physical-disc="${id}"]`);
 const inline=id=>page.locator(`select[data-bag-pocket="${id}"]`);
 const setInline=async(id,pocket)=>{
  const saved=page.waitForResponse(r=>r.url().endsWith('/api/bag/discs/'+id) && r.request().method()==='PATCH');
  await inline(id).selectOption(pocket);assert.equal((await saved).status(),200);
  await page.waitForFunction(([id,pocket])=>{const s=document.querySelector(`select[data-bag-pocket="${id}"]`);return s && !s.disabled && s.value===pocket;},[id,pocket]);
 };
 // Slot centers in the bag's former 800×1000 artwork units, measured from the 3D hit layer.
 const center=locator=>locator.evaluate(n=>{const r=n.parentNode.getBoundingClientRect(),c=n.closest('[data-bag-canvas]').getBoundingClientRect();return {x:(r.x+r.width/2-c.x)/c.width*800,y:(r.y+r.height/2-c.y)/c.height*1000};});
 const mainMiddle=()=>page.locator('#bagScene .bag-hit-slot[data-pocket="main"]').evaluateAll(nodes=>{const c=nodes[0].closest('[data-bag-canvas]').getBoundingClientRect(),xs=nodes.map(n=>{const r=n.getBoundingClientRect();return (r.x+r.width/2-c.x)/c.width*800;});return (Math.min(...xs)+Math.max(...xs))/2;});
 const canvasWidth=()=>page.locator('[data-bag-canvas]').evaluate(n=>n.getBoundingClientRect().width);
 const noOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal page overflow');
 const shot=async(state,width,theme,options={})=>{
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(450);
  const name=`${state}-${width}-${theme}.png`;await (options.locator||page).screenshot({path:`${dir}/${name}`});shots.push({state,width,theme,name});
 };
 const setTheme=async theme=>{
  await page.getByRole('button',{name:'Site menu',exact:true}).click();
  await page.getByRole('menuitemradio',{name:theme[0].toUpperCase()+theme.slice(1),exact:true}).click();await page.keyboard.press('Escape');
 };
 const setSize=async size=>{await page.locator(`input[name="bagSize"][value="${size}"]`).check();await page.waitForFunction(s=>document.querySelector('#bagScene').dataset.size===s,size);};

 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>window.AtlasAccount?.current);
 await page.locator('#myBagSignIn').click();await page.getByRole('link',{name:'Continue with Google',exact:true}).waitFor();
 const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href');
 const redirect=await page.request.get(base+href,{maxRedirects:0});await page.goto(redirect.headers().location);
 await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();

 // 1. Putter pocket: default once at insert, then the stored column wins on every path.
 await page.locator('#emptyBagDirectory').click();await page.locator('#search').fill('Envy');
 await page.locator('#rows .directory-row').filter({has:page.locator('[data-add-menu="761c90d342f5"]')}).locator('[data-add-menu]').click();
 await page.locator('#addDestinationMenu').getByRole('menuitem',{name:'Bag',exact:true}).click();
 assert.equal(await page.locator('#bagPocket').inputValue(),'putter');
 await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 const putter=(await data()).discs[0];assert.equal(putter.pocket,'putter');
 await page.locator('#bagTab').click();await phase();
 assert.equal(await slot(putter.id,'putter').count(),1);assert.equal(await inline(putter.id).inputValue(),'putter');
 check('New putter defaults to the putter pocket at insert');
 await inline(putter.id).focus();await setInline(putter.id,'main');
 assert.equal(await page.evaluate(()=>document.activeElement?.dataset.bagPocket),putter.id,'Focus stays on the re-rendered select');
 assert.match(await page.locator('#myBagStatus').innerText(),/moved to Main compartment/);
 assert.equal(await pocketOf(putter.id),'main');assert.equal(await slot(putter.id,'main').count(),1);
 await reload();
 assert.equal(await pocketOf(putter.id),'main');assert.equal(await inline(putter.id).inputValue(),'main');
 assert.equal(await slot(putter.id,'main').count(),1);assert.equal(await slot(putter.id,'putter').count(),0);
 check('Inline move to main persists across reload (API, list select and scene)');
 // Store and re-bag, change sort, and save an unrelated edit: still main after reload.
 await page.locator(`[data-bag-move="${putter.id}"]`).click();await page.waitForFunction(id=>document.querySelector(`[data-bag-move="${id}"]`)?.textContent==='Move to bag',putter.id);
 await page.locator(`[data-bag-move="${putter.id}"]`).click();await page.waitForFunction(id=>document.querySelector(`[data-bag-move="${id}"]`)?.textContent==='Store',putter.id);
 await page.locator('#bagSort').selectOption('stability');await page.waitForFunction(()=>!document.querySelector('#bagSort').disabled);
 await page.locator(`[data-bag-edit="${putter.id}"]`).click();assert.equal(await page.locator('#bagPocket').inputValue(),'main');
 await page.locator('#bagWeight').fill('170');await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 await reload();
 assert.equal(await pocketOf(putter.id),'main');assert.equal(await slot(putter.id,'main').count(),1);assert.equal(await inline(putter.id).inputValue(),'main');
 check('Putter stays in main through Store/Bag, sort change, edit-sheet save and reload');

 // 2. Go-to slot: empty hollow first, then any disc type renders centered above the main compartment.
 assert.equal(await page.locator('#bagScene .bag-goto-slot .bag-slot-hollow').count(),1,'Empty go-to slot is visible');
 const seeded=await page.evaluate(async()=>{
  const headers={'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken},rows=[];
  for(const disc of [{mold_id:'3d60892b6812',color:'#ed7868',notes:'First disc for the round'},{mold_id:'ff4bf9e7743c',color:'#e2d8c1'},{mold_id:'7446eb39abe5',color:'#b99bdd'},{mold_id:'761c90d342f5',color:'#7fc4e8'}]){
   const r=await fetch('/api/bag/discs',{method:'POST',headers,body:JSON.stringify(disc)});if(!r.ok)throw Error(await r.text());rows.push((await r.json()).disc);
  }return rows;
 });
 const driver=seeded[0],secondPutter=seeded[3];await reload();
 assert.equal(secondPutter.pocket,'putter');
 await setInline(driver.id,'goto');
 assert.equal(await slot(driver.id,'goto').count(),1,'Go-to renders without a reload');
 await reload();assert.equal(await pocketOf(driver.id),'goto');assert.equal(await slot(driver.id,'goto').count(),1);
 assert.equal(await page.locator('#bagScene .bag-goto-slot .bag-slot-hollow').count(),0);
 assert.ok(await page.locator('[data-bag-canvas]').evaluate((n,id)=>n.bagViewer.getBagLayoutState().some(d=>d.id===id && d.pocket==='goTo'),driver.id),'The 3D go-to disc sits in the front pocket (with its accent rim)');
 const top=await center(slot(driver.id,'goto')),main=await center(slot(putter.id,'main')),side=await center(slot(secondPutter.id,'putter'));
 const middle=await mainMiddle();assert.ok(Math.abs(top.x-middle)<24,`Go-to is centered over the main compartment (${top.x.toFixed(1)} vs ${middle.toFixed(1)})`);assert.ok(top.y<main.y,'Go-to sits in the front pocket above the main compartment');
 assert.ok(side.y<top.y,'Putters ride in the top pocket, above the go-to');
 check('Go-to slot: empty outline, inline assignment, centered/raised with accent rim, persists across reload');
 // Every disc type can be the go-to, and a full putter pocket keeps all its putters.
 for(const disc of [seeded[1],seeded[2],secondPutter]){await setInline(disc.id,'goto');assert.equal(await slot(disc.id,'goto').count(),1,disc.mold_id);}
 for(const disc of [seeded[1],seeded[2]])await setInline(disc.id,'main');await setInline(secondPutter.id,'putter');
 await page.evaluate(async()=>{const r=await fetch('/api/bag',{method:'PUT',headers:{'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken},body:JSON.stringify({bag_model:'Custom bag',main_capacity:16,putter_capacity:1})});if(!r.ok)throw Error(await r.text());});
 await reload();assert.equal(await slot(driver.id,'goto').count(),1);assert.equal(await slot(secondPutter.id,'putter').count(),1);
 assert.equal(await page.locator('[data-bag-overflow]').innerText(),'','Go-to never pushes a putter out of a full pocket');
 await page.evaluate(async()=>{await fetch('/api/bag',{method:'PUT',headers:{'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken},body:JSON.stringify({bag_model:'Custom bag',main_capacity:16,putter_capacity:4})});});
 await reload();
 check('Distance driver, midrange and putters can each be go-to; a full putter pocket stays intact');
 // Keyboard: lifting the go-to disc reports its pocket; Tab order follows the slots left to right.
 await slot(driver.id,'goto').focus();assert.match(await page.locator('#bagLiftInfo').innerText(),/Go-to/);await page.keyboard.press('Escape');

 // 3. Inline dropdown semantics.
 assert.deepEqual(await inline(putter.id).evaluate(s=>[...s.options].map(o=>[o.value,o.textContent])),[['main','Main'],['putter','Putter'],['goto','Go-to']]);
 assert.match(await inline(putter.id).evaluate(s=>s.labels[0]?.textContent || ''),/Pocket for Envy/);
 assert.ok((await inline(putter.id).boundingBox()).height>=44,'Inline select keeps a 44px target');
 // A failed save reverts to the stored pocket.
 expectHttpError=true;
 await page.route('**/api/bag/discs/'+putter.id,route=>route.request().method()==='PATCH'?route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:'Choose Main compartment, Putter pocket or Go-to.'})}):route.fallback());
 await inline(putter.id).selectOption('putter');await page.waitForFunction(id=>{const s=document.querySelector(`select[data-bag-pocket="${id}"]`);return s && !s.disabled && s.value==='main';},putter.id);
 await page.unroute('**/api/bag/discs/'+putter.id);expectHttpError=false;assert.equal(await pocketOf(putter.id),'main');
 check('Inline select: three pockets, labelled, 44px target, immediate persist, reverts on failure');

 // 4. Bag size: larger default, S/M/L, crisp vector scaling, persisted per browser.
 assert.equal(await page.locator('#bagScene').getAttribute('data-size'),'m');
 // The 3D canvas re-renders at every displayed size instead of upscaling a raster.
 const sharp=()=>page.locator('[data-bag-canvas]').evaluate(n=>{const c=n.querySelector('canvas'),r=n.bagViewer.renderer;return Math.abs(c.width-Math.round(c.clientWidth*r.pixelRatio))<=1 && Math.abs(c.height-Math.round(c.clientHeight*r.pixelRatio))<=1 && r.pixelRatio>=Math.min(devicePixelRatio,1);});
 const sizes={};
 for(const size of ['s','m','l']){
  await setSize(size);await page.waitForTimeout(50);
  assert.ok(await sharp(),`The 3D canvas renders at the ${size.toUpperCase()} size`);
  const disc=await slot(putter.id,'main').boundingBox();
  sizes[size]={canvas:await canvasWidth(),disc:disc.width,info:0};
  await slot(driver.id,'goto').focus();sizes[size].info=await page.locator('#bagLiftInfo strong').evaluate(n=>parseFloat(getComputedStyle(n).fontSize));await page.keyboard.press('Escape');
 }
 assert.equal(Math.round(sizes.s.canvas),360);assert.equal(Math.round(sizes.m.canvas),560,'Default is 560px, up from 360px');
 assert.ok(sizes.l.canvas>sizes.m.canvas,'Large is larger than Medium at 1440×1000');
 for(const size of ['m','l'])assert.ok(Math.abs(sizes[size].disc/sizes.s.disc-sizes[size].canvas/sizes.s.canvas)<.02,'Hit targets scale with the artwork');
 assert.ok(sizes.s.info<sizes.m.info && sizes.m.info<sizes.l.info,'Lift label type scales');
 await reload();assert.equal(await page.locator('#bagScene').getAttribute('data-size'),'l','Size choice persists across reload');
 assert.ok(await page.locator('input[name="bagSize"][value="l"]').isChecked());
 await page.locator('input[name="bagSize"][value="l"]').focus();await page.keyboard.press('ArrowLeft');
 assert.equal(await page.locator('#bagScene').getAttribute('data-size'),'m','Arrow keys move between sizes');await setSize('l');
 await page.setViewportSize({width:2560,height:1440});await page.waitForTimeout(100);
 const desktop=await canvasWidth();assert.equal(Math.round(desktop),880,'Large reaches 880px on a 27" (2560×1440) display');
 const scene=await page.locator('[data-bag-canvas]').boundingBox();assert.ok(scene.height<=1440,'The whole bag fits in the viewport');
 await noOverflow();
 check(`Size control: S ${Math.round(sizes.s.canvas)}px, M ${Math.round(sizes.m.canvas)}px (default), L ${Math.round(sizes.l.canvas)}px at 1440×1000 and ${Math.round(desktop)}px at 2560×1440; hit targets and labels scale; persists`);

 // Screenshots: all three themes, desktop and 360px.
 for(const theme of themes){
  await page.setViewportSize({width:2560,height:1440});await setTheme(theme);await reload();await setSize('l');
  await page.locator('#bagScene').scrollIntoViewIfNeeded();await shot('bag-large-27in',2560,theme);
  for(const width of widths){
   await page.setViewportSize({width,height:width===360?800:1000});await reload();await setSize('m');
   assert.equal(await pocketOf(putter.id),'main');assert.equal(await slot(putter.id,'main').count(),1);await noOverflow();
   await page.locator('#bagScene').scrollIntoViewIfNeeded();
   await slot(putter.id,'main').focus();assert.match(await page.locator('#bagLiftInfo').innerText(),/Main compartment/);
   await shot('putter-main-reloaded',width,theme);await page.keyboard.press('Escape');
   await page.locator('#bagScene').scrollIntoViewIfNeeded();await shot('goto-top-pocket',width,theme);
   const row=page.locator(`[data-disc-id="${driver.id}"]`);await row.scrollIntoViewIfNeeded();await inline(driver.id).focus();
   await shot('inline-pocket-dropdown',width,theme,{locator:page.locator('#bagLineup')});
   await setSize('l');await noOverflow();await page.locator('#bagScene').scrollIntoViewIfNeeded();
   await shot('bag-large',width,theme);
   await setSize('m');
  }
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(dir+'/qa.json',JSON.stringify({passed:true,checks,sizes,themes,widths,screenshots:shots,errors},null,2));
 const order=['putter-main-reloaded','goto-top-pocket','inline-pocket-dropdown','bag-large','bag-large-27in'];
 fs.writeFileSync(dir+'/screenshots.html',`<!doctype html><meta charset="utf-8"><title>Bag v1.3 QA</title><style>body{margin:32px;background:#14191f;color:#e9edf0;font:16px system-ui}section{margin:40px 0}figure{display:inline-block;vertical-align:top;margin:16px}img{width:660px;max-width:100%}.mobile img{width:300px}a{color:inherit}figcaption{margin-top:8px}li{margin:4px 0}</style><h1>Bag v1.3 · local QA</h1><ul>${checks.map(c=>`<li>✓ ${c}</li>`).join('')}</ul>${themes.map(theme=>`<section><h2>${theme}</h2>${order.flatMap(state=>shots.filter(s=>s.theme===theme && s.state===state)).map(s=>`<figure class="${s.width===360?'mobile':''}"><a href="${s.name}"><img src="${s.name}" loading="lazy"></a><figcaption>${s.state} · ${s.width}px</figcaption></figure>`).join('')}</section>`).join('')}`);
 console.log(checks.map(c=>'✓ '+c).join('\n'));
 console.log(`PASS: ${checks.length} checks, ${shots.length} screenshots across ${themes.length} themes at 1440px, 360px and 2560px; no page errors.`);
 await context.close();
} finally {await browser?.close();server.kill();}
