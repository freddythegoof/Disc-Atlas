// My Bag's Storage racks and Lost graveyard, end to end on a local Wrangler + D1: racks grow at 72 and
// shrink back, bag <-> storage moves keep every count right, a loss gets a headstone with its story and
// Found it! brings it home, the one-at-a-time list picker, and phone checks (rendering, overflow, frame
// times, draw calls). Screenshots: outputs/bag-collections/.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';

const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config='tests/auth.wrangler.jsonc',state='work/bag-collections/d1-qa',base='https://localhost:8824',dir='outputs/bag-collections';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
// Real GPU by default (like bag-3d-browser): SwiftShader would make the frame-time check meaningless.
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8824','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser,page;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const errors=[],shots=[],report={};
// A spread of molds: drivers to putters, overmold (Atlas, Envy, Hex) and one-piece, so racks show real shapes.
const MOLDS=['3d60892b6812','e70f48273d7f','ba675aed468a','9668fc736651','f6267498c9d2','7446eb39abe5','850e9dc7104d','582b538be71e','5f22688f2ee3','761c90d342f5','ff4bf9e7743c','3ea9734a60f7','3200f16f97df','683fcbcd529c'];
const COLORS=['#e99678','#f2c14e','#7cc6a4','#6aa7e8','#b48ce0','#ef7d8f','#e8e3d8','#9fd356','#f08a4b','#4fb3bf','#d9b8f2','#ffd166'];
const PLASTICS={'3d60892b6812':'Star','e70f48273d7f':'Star','ba675aed468a':'Champion','9668fc736651':'Neutron','f6267498c9d2':'Lucid','7446eb39abe5':'ESP','850e9dc7104d':'ESP','582b538be71e':'Star','5f22688f2ee3':'Neutron','761c90d342f5':'Electron','ff4bf9e7743c':'Jawbreaker','3ea9734a60f7':'DX','3200f16f97df':'Zero Medium','683fcbcd529c':'K1'};
try {
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000},timezoneId:'America/New_York'});
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const cb=new URL(u.searchParams.get('redirect_uri'));cb.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${cb.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const setTheme=theme=>page.evaluate(t=>document.querySelector(`[data-theme-choice="${t}"]`).click(),theme);
 const shot=async(name,locator=page.locator('.collection-scene:not([hidden])'))=>{await page.evaluate(()=>document.fonts.ready);await locator.screenshot({path:`${dir}/${name}.png`});shots.push(name);};
 const api=async(path='',method='GET',body)=>{
  const response=await page.request.fetch(base+'/api/bag'+path,{method,headers:await page.evaluate(()=>({'Content-Type':'application/json',Origin:location.origin,'X-Atlas-CSRF':window.AtlasAccount.current.csrfToken})),...(body?{data:body}:{})});
  assert.ok(response.ok(),await response.text());return response.json();
 };
 const add=(i,extra={})=>{const mold_id=MOLDS[i%MOLDS.length];return api('/discs','POST',{mold_id,plastic:PLASTICS[mold_id],weight_g:172+i%4,wear:6+i%5,color:COLORS[i%COLORS.length],...extra});};
 const tab=name=>page.getByRole('radio',{name,exact:true}).and(page.locator('[data-bag-view]'));
 const list=name=>page.locator(`#bagListPicker [data-bag-list="${name}"]`);
 const counts=()=>page.evaluate(()=>({
  meter:document.querySelector('#bagSlotMeter').textContent,
  bag:+document.querySelector('[data-list-count="bag"]').textContent,storage:+document.querySelector('[data-list-count="storage"]').textContent,lost:+document.querySelector('[data-list-count="lost"]').textContent,
  rows:{bag:document.querySelectorAll('#bagLineup .my-bag-disc').length,storage:document.querySelectorAll('#bagStorage .my-bag-disc').length,lost:document.querySelectorAll('#bagMemorial [data-memorial-id]').length},
  shown:[...document.querySelectorAll('#myBagContents>section')].filter(s=>s.checkVisibility()).map(s=>s.id),
  racks:document.querySelector('#storageScene [data-collection-canvas]').dataset.racks,discs:document.querySelector('#storageScene [data-collection-canvas]').dataset.discs,
  graves:document.querySelector('#lostScene [data-collection-canvas]').dataset.graves,
 }));
 const settled=which=>page.waitForFunction(w=>{const v=window.BagApp.scenes[w];return v&&!v.state.moving;},which,{timeout:15000});

 // --- Sign in -------------------------------------------------------------------------------------
 await page.goto(base+'/?bag=1');await page.locator('#myBagSignIn').waitFor();await page.locator('#myBagSignIn').click();
 await page.getByRole('link',{name:'Continue with Google',exact:true}).waitFor();
 const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href');
 const redirect=await page.request.get(base+href,{maxRedirects:0});await page.goto(redirect.headers().location);await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();

 // --- Tabs and the one-at-a-time list -----------------------------------------------------------------
 assert.deepEqual(await page.locator('#myBagViews [data-bag-view]').allInnerTexts(),['Bag','My Map','Storage','Lost']);
 assert.deepEqual((await counts()).shown,['bagLineup'],'Only the Bag list shows at first');
 await list('storage').click();assert.deepEqual((await counts()).shown,['bagStorage']);assert.ok(await page.locator('#bagScene').isVisible(),'The picker swaps the list, not the scene');
 await list('storage').press('ArrowRight');assert.deepEqual((await counts()).shown,['bagMemorial']);assert.ok(await list('lost').evaluate(n=>n===document.activeElement));
 await list('lost').press('ArrowRight');assert.deepEqual((await counts()).shown,['bagLineup'],'Arrow keys wrap');

 // An empty Storage tab still shows one rack, ready for discs.
 await tab('Storage').click();await page.locator('#storageScene[data-engine="ready"]').waitFor({timeout:30000});
 assert.ok(await page.locator('#bagScene').isHidden(),'The bag steps aside for the racks');
 assert.deepEqual((await counts()).shown,['bagStorage'],'The list follows the Storage tab');
 await page.waitForFunction(()=>window.BagApp.scenes.storage?.state.racks===1);
 assert.ok(await page.locator('#storageScene [data-collection-empty]').isVisible());
 assert.match(await page.locator('#storageScene [data-collection-summary]').innerText(),/^0 discs in Storage · 1 rack · 72 open slots$/);
 await settled('storage');await shot('storage-empty-1440');

 // --- 80 discs in Storage: two racks; back to 72: one rack ---------------------------------------------
 const bag=[];for(let i=0;i<6;i++)bag.push((await add(i)).disc);
 const stored=[];for(let i=0;i<80;i++)stored.push((await add(i+6,{in_bag:false})).disc);
 await page.reload();await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#bagLineup .my-bag-disc').first().waitFor();
 await tab('Storage').click();
 await page.waitForFunction(()=>window.BagApp.scenes.storage?.state.racks===2&&window.BagApp.scenes.storage.state.discs===80,null,{timeout:30000});
 let c=await counts();
 assert.equal(c.racks,'2');assert.equal(c.discs,'80');assert.equal(c.storage,80);assert.equal(c.rows.storage,80);assert.equal(c.bag,6);assert.match(c.meter,/^6 \//);
 assert.match(await page.locator('#storageScene [data-collection-summary]').innerText(),/^80 discs in Storage · 2 racks · 64 open slots$/);
 assert.deepEqual(await page.locator('#storageScene [data-rack-picker] button').allInnerTexts(),['All racks','Rack 1\n72','Rack 2\n8']);
 await settled('storage');
 const desktop=await page.evaluate(()=>{const v=window.BagApp.scenes.storage;return {info:v.info,state:v.state};});
 report.storage80=desktop;
 // Instancing: one draw call per mold shape (plus overmold rims), three per rack, a few for the scene.
 assert.ok(desktop.info.calls<=40,`80 discs draw in few calls (${desktop.info.calls})`);
 await shot('storage-80-1440');
 await page.locator('#storageScene [data-rack="1"]').click();await settled('storage');await shot('storage-rack-2-1440');
 await page.locator('#storageScene [data-rack="all"]').click();await settled('storage');

 // Storage list and rack share one order: drivers first, putters last.
 const rowIds=()=>page.locator('#bagStorage .my-bag-disc').evaluateAll(rows=>rows.map(r=>r.dataset.discId));
 const storageIds=await rowIds();
 // Tap a disc in the rack: it lifts out, turns face on, and its card offers Move to bag. (Upright discs
 // overlap at an angle, so the tap takes whichever disc is under the point.)
 const canvas=page.locator('#storageScene [data-collection-canvas]');
 // A tap can land on a divider or rail; then the next candidate disc gets a try.
 const tapDisc=async(p,ids,how='mouse')=>{
  const host=p.locator('#storageScene [data-collection-canvas]');
  for(const id of ids){
   const at=await p.evaluate(i=>window.BagApp.scenes.storage.project(i),id),box=await host.boundingBox();
   if(how==='touch')await p.touchscreen.tap(box.x+at.x,box.y+at.y);else await p.mouse.click(box.x+at.x,box.y+at.y);
   const pulled=await p.waitForFunction(()=>window.BagApp.scenes.storage.state.pulled,null,{timeout:2000}).then(()=>true,()=>false);
   if(!pulled)continue;
   await p.waitForFunction(()=>!window.BagApp.scenes.storage.state.moving);
   return p.evaluate(()=>window.BagApp.scenes.storage.state.pulled);
  }
  throw Error('No tap pulled a disc');
 };
 const picked=await tapDisc(page,[0,1,2,8,9,16].map(i=>storageIds[i]));
 assert.ok(storageIds.includes(picked),'A tap pulls a stored disc');
 const card=page.locator(`#storageScene [data-storage-card="${picked}"]`);await card.waitFor();
 assert.equal(await card.locator('h3').innerText(),await page.locator(`#bagStorage [data-disc-id="${picked}"] .my-bag-disc-name`).innerText());
 assert.match(await card.innerText(),/(Top|Middle|Bottom) shelf, (left|middle|right) bay/);
 await shot('storage-pulled-1440');
 // Escape slides it home too; then pull it again and use Put back.
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!window.BagApp.scenes.storage.state.pulled);await settled('storage');
 await page.locator(`#bagStorage [data-bag-inspect="${picked}"]`).click();await page.locator('#bagDetailTitle').waitFor();await page.keyboard.press('Escape');await page.locator('#detail').waitFor({state:'hidden'});
 await page.waitForFunction(id=>window.BagApp.scenes.storage.state.pulled===id,picked);
 await card.getByRole('button',{name:'Put back'}).click();
 await page.waitForFunction(()=>!window.BagApp.scenes.storage.state.pulled);await settled('storage');
 assert.ok(await canvas.evaluate(n=>n===document.activeElement),'Put back hands focus to the racks');

 // A Storage list name pulls its disc out of the rack too (and opens its details).
 const revealed=storageIds[40];
 await page.locator(`#bagStorage [data-bag-inspect="${revealed}"]`).click();
 await page.waitForFunction(id=>window.BagApp.scenes.storage.state.pulled===id,revealed);await page.locator('#bagDetailTitle').waitFor();
 await page.keyboard.press('Escape');await page.locator('#detail').waitFor({state:'hidden'});
 assert.equal(await page.evaluate(()=>window.BagApp.scenes.storage.state.pulled),revealed,'Escape closes the details first; the disc stays out');

 // Move to bag from the rack card: every count follows.
 await page.locator(`#storageScene [data-storage-card="${revealed}"]`).getByRole('button',{name:'Move to bag'}).click();
 await page.waitForFunction(()=>window.BagApp.scenes.storage.state.discs===79);
 c=await counts();
 assert.deepEqual([c.storage,c.rows.storage,c.discs,c.racks,c.bag,c.rows.bag],[79,79,'79','2',7,7]);assert.match(c.meter,/^7 \//);
 assert.equal(await page.locator(`#bagLineup [data-disc-id="${revealed}"]`).count(),1,'It is in the Bag list now');
 assert.match(await page.locator('#myBagStatus').innerText(),/moved to your bag\.$/);
 assert.ok(await canvas.evaluate(n=>n===document.activeElement));

 // Remove from the rack card, then from the Storage list, down to 72: back to one rack, live.
 const removeFromCard=storageIds[10];
 await page.locator(`#bagStorage [data-bag-inspect="${removeFromCard}"]`).click();await page.locator('#bagDetailTitle').waitFor();await page.keyboard.press('Escape');
 await page.locator(`#storageScene [data-storage-card="${removeFromCard}"]`).getByRole('button',{name:'Remove'}).click();
 await page.locator('#removeDiscDialog').waitFor();await page.locator('#confirmRemoveDisc').click();await page.locator('#removeDiscDialog').waitFor({state:'hidden'});
 await page.waitForFunction(()=>window.BagApp.scenes.storage.state.discs===78);
 for(let left=78;left>72;left--){
  const id=(await rowIds())[0];
  await page.locator(`#bagStorage [data-bag-remove="${id}"]`).click();await page.locator('#confirmRemoveDisc').click();await page.locator('#removeDiscDialog').waitFor({state:'hidden'});
  await page.waitForFunction(n=>window.BagApp.scenes.storage.state.discs===n,left-1);
  if(left-1>72)assert.ok(await page.locator(`#bagStorage [data-bag-remove]`).first().evaluate(n=>n===document.activeElement),'Focus stays in the Storage list');
 }
 await page.waitForFunction(()=>window.BagApp.scenes.storage.state.racks===1);await settled('storage');
 c=await counts();
 assert.deepEqual([c.storage,c.rows.storage,c.discs,c.racks],[72,72,'72','1']);
 assert.ok(await page.locator('#storageScene [data-rack-picker]').isHidden(),'One rack needs no rack picker');
 assert.match(await page.locator('#storageScene [data-collection-summary]').innerText(),/^72 discs in Storage · 1 rack · 0 open slots$/);
 assert.equal((await api()).discs.filter(d=>!d.in_bag).length,72,'The server agrees');
 await shot('storage-72-1440');

 // Bag -> Storage from the Bag list: the 73rd disc starts rack two; Move to bag from Storage ends it.
 await list('bag').click();
 const storing=bag[0].id;
 await page.locator(`[data-bag-move="${storing}"]`).click();
 await page.waitForFunction(()=>window.BagApp.scenes.storage.state.racks===2);
 c=await counts();assert.deepEqual([c.storage,c.discs,c.bag,c.rows.bag],[73,'73',6,6]);assert.match(c.meter,/^6 \//);
 assert.ok(await page.locator(`[data-bag-move="${bag[1].id}"]`).evaluate(n=>n===document.activeElement),'Focus moves to the next bag disc');
 await list('storage').click();
 await page.locator(`#bagStorage [data-bag-move="${storing}"]`).click();
 await page.waitForFunction(()=>window.BagApp.scenes.storage.state.racks===1);
 c=await counts();assert.deepEqual([c.storage,c.discs,c.bag],[72,'72',7]);assert.match(c.meter,/^7 \//);

 // --- Lost: a headstone with its story, then Found it! -----------------------------------------------
 await tab('Bag').click();assert.deepEqual((await counts()).shown,['bagLineup']);
 const loseOne=async(id,{date,course='',hole='',story=''})=>{
  await page.locator(`[data-bag-lost="${id}"]`).click();await page.locator('#lostDiscDialog').waitFor();
  await page.locator('#lostDate').fill(date);await page.locator('#lostCourse').fill(course);await page.locator('#lostHole').fill(hole);await page.locator('#lostStory').fill(story);
  await page.locator('#confirmLostDisc').click();await page.locator('#lostDiscDialog').waitFor({state:'hidden'});
 };
 const story='Big hyzer over the creek. One skip, then the current took it.';
 await loseOne(bag[1].id,{date:'2026-10-08',course:'Maple Hill',hole:'8',story});
 assert.match(await page.locator('#myBagStatus').innerText(),/Gone But Not Forgotten/);
 await loseOne(bag[2].id,{date:'2026-09-01'});
 c=await counts();assert.deepEqual([c.lost,c.bag,c.rows.lost],[2,5,2]);assert.match(c.meter,/^5 \//);
 await tab('Lost').click();
 await page.locator('#lostScene[data-engine="ready"]').waitFor({timeout:30000});
 await page.waitForFunction(()=>window.BagApp.scenes.lost?.state.graves===2);await settled('lost');
 assert.deepEqual((await counts()).shown,['bagMemorial'],'The list follows the Lost tab');
 const epitaphCard=page.locator('#lostScene .epitaph-card');
 assert.equal(await epitaphCard.getAttribute('data-epitaph'),bag[1].id,'The newest loss is selected first');
 assert.equal(await epitaphCard.locator('.bag-memorial-story').innerText(),story);
 assert.match(await epitaphCard.innerText(),/Here lies/i);assert.match(await epitaphCard.innerText(),/Maple Hill/);assert.match(await epitaphCard.innerText(),/Hole 8/);
 assert.match(await epitaphCard.locator('.epitaph-line').innerText(),/swim|pond|Skipped/,'A creek gets a water epitaph');
 assert.match(await page.locator('#lostScene [data-collection-summary]').innerText(),/^2 discs remembered/);
 await shot('lost-2-1440');
 for(const theme of ['midnight','black']){await setTheme(theme);await settled('lost');await shot(`lost-2-1440-${theme}`);}
 await setTheme('light');
 // Keyboard: the headstones are one tab stop; arrows move between them.
 await page.locator('#lostScene .grave-target[tabindex="0"]').focus();await page.keyboard.press('ArrowRight');
 await page.waitForFunction(id=>document.querySelector('#lostScene .epitaph-card')?.dataset.epitaph===id,bag[2].id);
 assert.ok(await page.locator(`#lostScene .grave-target[data-grave="${bag[2].id}"]`).evaluate(n=>n===document.activeElement));
 assert.match(await epitaphCard.innerText(),/No story yet/);
 // Found it! from the headstone's card: back in the bag, and the stone sinks away.
 await epitaphCard.getByRole('button',{name:'Found it!'}).click();
 await page.waitForFunction(()=>window.BagApp.scenes.lost.state.graves===1);
 await page.locator('#myBagStatus').filter({hasText:'is back in your bag. Welcome home.'}).waitFor();
 c=await counts();assert.deepEqual([c.lost,c.bag,c.rows.lost],[1,6,1]);assert.match(c.meter,/^6 \//);
 assert.equal((await api('/discs/'+bag[2].id)).disc.status,'active');assert.equal((await api('/discs/'+bag[2].id)).disc.in_bag,true);
 await settled('lost');assert.equal(await page.evaluate(()=>window.BagApp.scenes.lost.state.leaving),0,'The found stone is gone');
 assert.ok(await epitaphCard.getByRole('button',{name:'Found it!'}).evaluate(n=>n===document.activeElement),'Focus lands on the next headstone card');
 // The last one, from the Lost list: no ghosts left.
 await page.locator(`#bagMemorial [data-bag-found="${bag[1].id}"]`).click();
 await page.locator('#lostScene [data-collection-empty]').waitFor();
 assert.match(await page.locator('#lostScene .lost-empty').innerText(),/No ghosts here yet\./);
 assert.ok(await page.locator('#lostScene [data-collection-canvas]').isHidden());
 c=await counts();assert.deepEqual([c.lost,c.bag],[0,7]);
 await shot('lost-empty-1440');
 // Back to the Bag tab: the bag is whole again, and My Map still opens.
 await tab('Bag').click();await page.locator('#bagScene').waitFor();assert.ok(await page.locator('#storageScene').isHidden()&&await page.locator('#lostScene').isHidden());
 await tab('My Map').click();await page.locator('#myMapPanel').waitFor();assert.ok(await page.locator('#bagListPicker').isHidden(),'My Map has no list');
 await tab('Bag').click();

 // --- Phone: lazy loading, rendering, overflow, frame times -------------------------------------------
 // Three losses for the phone's graveyard.
 for(const [i,date] of [[3,'2026-10-01'],[4,'2026-08-15'],[5,'2026-06-30']])await api('/discs/'+bag[i].id,'PATCH',{status:'lost',lostDate:date,lostCourse:i===3?'Riverside Park':null,lostHole:i===3?14:null,lostStory:i===3?'Hit the tallest pine on the course. It is still up there.':null});
 const phoneContext=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,timezoneId:'America/New_York',storageState:await context.storageState()});
 const phone=await phoneContext.newPage();phone.on('pageerror',e=>errors.push('phone: '+e.message));phone.on('console',m=>{if(m.type()==='error')errors.push('phone console: '+m.text());});
 await phone.goto(base+'/?bag=1');await phone.waitForFunction(()=>window.AtlasAccount?.current?.user);await phone.locator('#bagLineup .my-bag-disc').first().waitFor();
 const loaded=()=>phone.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).filter(n=>/collection3d\/(racks|graveyard)\.mjs|wooden-disc-rack\.glb/.test(n)).map(n=>n.split('/').pop()));
 assert.deepEqual(await loaded(),[],'The Bag tab never loads the racks or the graveyard');
 const phoneShot=async name=>{await phone.evaluate(()=>document.fonts.ready);await phone.screenshot({path:`${dir}/${name}.png`});shots.push(name);};
 const noOverflow=async()=>assert.ok(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
 const frameTimes=which=>phone.evaluate(async w=>{
  const v=window.BagApp.scenes[w],times=[];let last=performance.now();
  for(let i=0;i<48;i++){v.turnBy(i%24<12?.04:-.04);await new Promise(r=>requestAnimationFrame(r));const now=performance.now();times.push(now-last);last=now;}
  times.sort((a,b)=>a-b);return {median:+times[24].toFixed(1),p90:+times[43].toFixed(1)};
 },which);
 await phone.getByRole('radio',{name:'Storage',exact:true}).tap();
 await phone.locator('#storageScene[data-engine="ready"]').waitFor({timeout:30000});
 await phone.waitForFunction(()=>window.BagApp.scenes.storage?.state.discs===72);
 await phone.waitForFunction(()=>!window.BagApp.scenes.storage.state.moving);
 assert.deepEqual((await loaded()).sort(),['racks.mjs','wooden-disc-rack.glb']);
 await noOverflow();
 report.phoneStorage={state:await phone.evaluate(()=>window.BagApp.scenes.storage.state),info:await phone.evaluate(()=>window.BagApp.scenes.storage.info),frames:await frameTimes('storage')};
 assert.equal(report.phoneStorage.state.quality,'coarse','Touch screens get the lighter disc budget');
 assert.ok(report.phoneStorage.info.calls<=40,`Few draw calls on a phone (${report.phoneStorage.info.calls})`);
 assert.ok(report.phoneStorage.info.triangles<160000,`72 discs stay inside the phone triangle budget (${report.phoneStorage.info.triangles})`);
 assert.ok(report.phoneStorage.frames.p90<50,`Turning the racks stays smooth (${JSON.stringify(report.phoneStorage.frames)})`);
 const pixels=await phone.evaluate(()=>{const c=document.querySelector('#storageScene canvas');return c.width*c.height;});
 assert.ok(pixels<=2.4e6+1,'The canvas respects the bag\'s pixel cap');
 await phone.locator('#storageScene [data-collection-canvas]').scrollIntoViewIfNeeded();await phoneShot('storage-72-390');
 // A tap pulls a disc on touch too.
 {
  const ids=await phone.locator('#bagStorage .my-bag-disc').evaluateAll(r=>r.map(n=>n.dataset.discId));
  await tapDisc(phone,[30,31,24,25,0,1].map(i=>ids[i]),'touch');
  await phone.locator('#storageScene .collection-card').waitFor();await noOverflow();await phoneShot('storage-pulled-390');
  await phone.locator('#storageScene [data-collection-card]').scrollIntoViewIfNeeded();await phoneShot('storage-card-390');
 }
 await phone.getByRole('radio',{name:'Lost',exact:true}).tap();
 await phone.locator('#lostScene[data-engine="ready"]').waitFor({timeout:30000});
 await phone.waitForFunction(()=>window.BagApp.scenes.lost?.state.graves===3&&!window.BagApp.scenes.lost.state.moving);
 await noOverflow();
 report.phoneLost={state:await phone.evaluate(()=>window.BagApp.scenes.lost.state),info:await phone.evaluate(()=>window.BagApp.scenes.lost.info),frames:await frameTimes('lost')};
 assert.equal(report.phoneLost.state.columns,3);
 assert.ok(report.phoneLost.frames.p90<50,`Turning the graveyard stays smooth (${JSON.stringify(report.phoneLost.frames)})`);
 assert.match(await phone.locator('#lostScene .epitaph-card').innerText(),/tallest pine/);
 assert.match(await phone.locator('#lostScene .epitaph-line').innerText(),/trees|Branched/);
 await phone.locator('#lostScene [data-collection-canvas]').scrollIntoViewIfNeeded();await phoneShot('lost-3-390');
 await phone.locator('#lostScene [data-collection-card]').scrollIntoViewIfNeeded();await phoneShot('lost-card-390');
 await phone.evaluate(()=>document.querySelector('[data-theme-choice="midnight"]').click());await phone.waitForTimeout(200);
 await phone.locator('#lostScene [data-collection-canvas]').scrollIntoViewIfNeeded();await phoneShot('lost-3-390-midnight');
 await phone.getByRole('radio',{name:'Storage',exact:true}).tap();await phone.waitForFunction(()=>!window.BagApp.scenes.storage.state.moving);
 await phone.locator('#storageScene [data-collection-canvas]').scrollIntoViewIfNeeded();await phoneShot('storage-72-390-midnight');
 await phone.evaluate(()=>document.querySelector('[data-theme-choice="light"]').click());
 // The list picker fits a 360px phone on one row.
 await phone.setViewportSize({width:360,height:780});await noOverflow();
 assert.ok(await phone.locator('#bagListPicker').evaluate(n=>n.getBoundingClientRect().height<50),'The picker stays on one row');
 assert.ok(await phone.locator('#myBagViews').evaluate(n=>n.getBoundingClientRect().height<50),'Four tabs stay on one row');
 await phoneContext.close();

 assert.deepEqual(errors,[]);
 fs.writeFileSync(`${dir}/qa.json`,JSON.stringify({passed:true,report,shots,errors},null,2));
 fs.writeFileSync(`${dir}/screenshots.html`,`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Storage and Lost — QA</title><style>body{font:16px/1.6 system-ui,sans-serif;margin:32px;background:#f4f5f6;color:#17202b}main{max-width:1120px;margin:auto}figure{margin:24px 0 40px}img{display:block;max-width:100%;height:auto;margin-top:12px;border:1px solid #cbd1d8;border-radius:8px}figcaption{font-weight:600}pre{white-space:pre-wrap;font-size:12px}</style><main><h1>Storage racks and the Lost graveyard</h1><pre>${JSON.stringify(report,null,1).replace(/</g,'&lt;')}</pre>${shots.map(name=>`<figure><figcaption>${name}</figcaption><img src="${name}.png" alt="${name.replaceAll('-',' ')}" loading="lazy"></figure>`).join('')}</main></html>`);
 console.log('PASS: list picker, empty rack, 80 discs -> 2 racks, 72 -> 1 rack (live), rack card pull/put back/move/remove, bag <-> storage counts, loss -> headstone with story, Found it! from card and list, empty graveyard, phone lazy-load/quality/draw calls/frame times/overflow. '+JSON.stringify(report));
}catch(error){if(page){await page.screenshot({path:`${dir}/failure.png`,fullPage:true});console.error(await page.evaluate(()=>{try{return JSON.stringify({storage:window.BagApp.scenes.storage?.state,lost:window.BagApp.scenes.lost?.state,dataset:{...document.querySelector("#storageScene [data-collection-canvas]").dataset}});}catch(e){return String(e);}}));}console.error(errors);throw error;}
finally{if(browser)await browser.close();server.kill();}
