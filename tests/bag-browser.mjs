import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';

const {chromium} = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config = 'tests/auth.wrangler.jsonc', state = 'work/plan-11/d1-qa', base = 'https://localhost:8797', dir = 'outputs/plan-11';
const wrangler = 'node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
const command = args => execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server = spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8797','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let output = ''; for (const stream of [server.stdout,server.stderr]) stream.on('data',d=>{output += d;});
let browser,page;
const ready = () => new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
try {
 const deadline=Date.now()+45000; while (!await ready()) {if (Date.now()>deadline || server.exitCode!==null) throw Error('Local bag Worker did not start: '+output); await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}}), errors=[];
 page=await context.newPage(); page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR:',e.message);});
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()), code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const callback=new URL(u.searchParams.get('redirect_uri'));callback.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${callback.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const theme=async value=>{await page.getByRole('button',{name:'Site menu',exact:true}).click();await page.getByRole('menuitemradio',{name:value[0].toUpperCase()+value.slice(1),exact:true}).click();await page.keyboard.press('Escape');};
 const capture=async name=>{await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(150);await page.screenshot({path:`${dir}/${name}.png`,fullPage:!/^sheet-|^add-/.test(name)});};
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>window.AtlasAccount?.current);
 await page.getByRole('heading',{name:'My bag',exact:true}).waitFor();
 assert.ok(!await page.locator('#myBagContents').isVisible());
 assert.equal((await page.request.get(base+'/api/bag')).status(),401);
 for (const name of ['light','midnight','charcoal']) for (const width of [1440,360]) {await page.setViewportSize({width,height:width===360?800:1000});await theme(name);assert.ok(await page.locator('#myBagTitle').isVisible(),'Bag title remains visible on mobile');await capture(`teaser-${width}-${name}`);}
 await page.locator('#myBagSignIn').click();
 await page.getByRole('link',{name:'Continue with Google',exact:true}).waitFor();
 const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href');
 const redirect=await page.request.get(base+href,{maxRedirects:0});assert.equal(redirect.status(),302);
 await page.goto(redirect.headers().location);await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);
 await page.locator('#myBagEmpty').waitFor();assert.equal(new URL(page.url()).searchParams.get('bag'),'1');
 await page.locator('#emptyBagDirectory').click();await page.locator('#rows .directory-add').first().click();await page.locator('#addDestinationMenu').getByRole('menuitem',{name:'Bag',exact:true}).click();
 await page.locator('#addDiscDialog').waitFor();
 assert.equal(await page.locator('#bagPlastic').inputValue(),'Star');assert.equal(await page.locator('#bagWear').inputValue(),'10');assert.equal(await page.locator('#bagWeight').inputValue(),'175');
 await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 await page.locator('#rows .disc-row').first().click();await page.locator('#addToBag').click();await page.locator('#addDestinationMenu').getByRole('menuitem',{name:'Bag',exact:true}).click();await page.locator('#bagPlastic').selectOption('Champion');await page.locator('#bagWear').fill('5');await page.locator('#bagWeight').fill('170');await page.locator('#bagNotes').fill('Forehand only');await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 await page.locator('#compare').click();await page.locator('#closeDetail').click();await page.locator('#detail').waitFor({state:'hidden'});await page.locator('#compareBar [data-add-menu]').click();await page.locator('#addDestinationMenu').getByRole('menuitem',{name:'Bag',exact:true}).click();await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 await page.locator('#bagTab').click();await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length===3);
 assert.match(await page.locator('#bagSlotMeter').innerText(),/3 \/ 20/);
 await page.locator('#editBagModel').click();await page.locator('#bagModel').selectOption('__custom');await page.locator('#customBagName').fill('Weekend sling');await page.locator('#bagMainCapacity').fill('2');await page.locator('#bagPutterCapacity').fill('0');await page.locator('#saveBagModel').click();await page.locator('#bagModelDialog').waitFor({state:'hidden'});
 assert.match(await page.locator('#bagSlotMeter').innerText(),/3 \/ 2/);assert.ok(await page.locator('#bagCapacityNotice').isVisible());
 await page.locator('[data-bag-edit]').first().click();await page.locator('#bagPlastic').selectOption('__other');await page.locator('#bagPlasticOther').fill('My blend');await page.locator('#bagWear').fill('1');await page.locator('#bagWeight').fill('150');await page.locator('#bagNotes').fill('Water disc');await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 assert.match(await page.locator('#myBagContents').innerText(),/My blend.*Beat/s);
 await page.locator('[data-bag-remove]').first().click();await page.locator('#removeDiscDialog').waitFor();await page.keyboard.press('Escape');assert.equal(await page.locator('[data-bag-edit]').count(),3);
 await page.locator('[data-bag-remove]').first().click();await page.locator('#confirmRemoveDisc').click();await page.locator('#removeDiscDialog').waitFor({state:'hidden'});assert.equal(await page.locator('[data-bag-edit]').count(),2);
 // Add real physical copies from all classes through the API, keeping the UI's CRUD coverage above.
 await page.evaluate(async()=>{for(const [mold_id,plastic,wear,weight_g] of [['35dae588c670','Neutron',7,175],['7446eb39abe5','Z',8,180],['761c90d342f5','Electron',6,175]]) {const r=await fetch('/api/bag/discs',{method:'POST',headers:{'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken},body:JSON.stringify({mold_id,plastic,wear,weight_g})});if(!r.ok)throw Error(await r.text());}});
 await page.reload();await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length===5);
 assert.equal(await page.locator('#bagLineup .my-bag-disc').count(),5);
 assert.deepEqual(await page.locator('#bagLineup .my-bag-disc-name').allTextContents(),['Destroyer','Destroyer','Crave','Buzzz','Envy']);
 await page.locator('#editBagModel').click();await page.locator('#bagModel').selectOption('Dynamic Discs Commander');assert.equal(await page.locator('#bagCapacity').inputValue(),'24');await page.locator('#saveBagModel').click();await page.locator('#bagModelDialog').waitFor({state:'hidden'});
 for (const name of ['light','midnight','charcoal']) for (const width of [1440,360]) {
  await page.setViewportSize({width,height:width===360?800:1000});await theme(name);await capture(`bag-${width}-${name}`);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('[data-bag-edit]').first().focus();await page.keyboard.press('Enter');await page.locator('#addDiscDialog').waitFor();
  for(let i=0;i<10;i++){await page.keyboard.press('Tab');assert.ok(await page.locator('#addDiscDialog').evaluate(n=>n.contains(document.activeElement)));}
  await capture(`sheet-${width}-${name}`);
  const bounds=await page.locator('#addDiscDialog').boundingBox();assert.ok(bounds.x>=0 && bounds.x+bounds.width<=width);
  await page.keyboard.press('Escape');assert.ok(await page.locator('[data-bag-edit]').first().evaluate(n=>n===document.activeElement));
 }
 await page.locator('#mapTab').click();await page.waitForFunction(()=>document.querySelectorAll('#mapMarkers button').length>0);
 await page.locator('#mapMarkers button').first().click();
 if(await page.locator('[data-choose-disc]').count())await page.locator('[data-choose-disc]').first().click();
 await page.locator('#addToBag').click();await page.locator('#addDestinationMenu').getByRole('menuitem',{name:'Bag',exact:true}).click();await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 await page.locator('#bagTab').click();await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length===6);
 await page.locator('#addBagDisc').click();await page.locator('#rows .directory-add').first().click();await page.locator('#addDestinationMenu').getByRole('menuitem',{name:'Bag',exact:true}).click();
 for (const name of ['light','midnight','charcoal']) for(const width of [1440,360]) {await page.keyboard.press('Escape');await page.setViewportSize({width,height:width===360?800:1000});await theme(name);await page.locator('#rows .directory-add').first().click();await page.locator('#addDestinationMenu').getByRole('menuitem',{name:'Bag',exact:true}).click();await capture(`add-${width}-${name}`);}
 await page.keyboard.press('Escape');await page.locator('#bagTab').click();
 // A slow read must not erase a disc saved while the original read is pending.
 const stale=await (await page.request.get(base+'/api/bag')).json();let releaseRead,startedRead;
 const held=new Promise(resolve=>{releaseRead=resolve;}),began=new Promise(resolve=>{startedRead=resolve;});let heldOnce=false;
 await context.route(base+'/api/bag',async route=>{if(route.request().method()==='GET'&&!heldOnce){heldOnce=true;startedRead();await held;await route.fulfill({json:stale});}else await route.continue();});
 await page.reload();await began;await page.locator('#addBagDisc').click();await page.locator('#rows .directory-add').first().click();await page.locator('#addDestinationMenu').getByRole('menuitem',{name:'Bag',exact:true}).click();await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});releaseRead();await page.locator('#bagTab').click();
 await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length===7);await context.unroute(base+'/api/bag');
 // A late response from a previous account must never repaint personal data after sign-out.
 let releaseSignedOut,startedSignedOut;const heldSignedOut=new Promise(resolve=>{releaseSignedOut=resolve;}),beganSignedOut=new Promise(resolve=>{startedSignedOut=resolve;});
 await context.route(base+'/api/bag',async route=>{startedSignedOut();await heldSignedOut;await route.fulfill({json:stale});});
 await page.reload();await beganSignedOut;await page.evaluate(()=>window.AtlasAccount.signOut());assert.ok(!await page.locator('#myBagContents').isVisible());
 const late=page.waitForResponse(base+'/api/bag');releaseSignedOut();await late;await page.waitForTimeout(50);assert.equal(await page.locator('[data-bag-edit]').count(),0);
 assert.deepEqual(errors,[]);fs.writeFileSync(`${dir}/qa.json`,JSON.stringify({passed:true,themes:['light','midnight','charcoal'],widths:[1440,360],errors},null,2));
 console.log('PASS: local Wrangler/D1, signed Google fixture, all add surfaces, copies, custom + curated capacity, edit/remove confirmation, auth gating, focus containment/restoration, 3 themes at desktop/360px. Screenshots: '+dir);
} catch(error) {if(page){await page.screenshot({path:`${dir}/failure.png`,fullPage:true});console.log(await page.evaluate(()=>({url:location.href,detail:document.querySelector('#detail')?.outerHTML.slice(0,1800),bag:document.querySelector('#myBagView')?.hidden})));}throw error;}
finally {if(browser)await browser.close();server.kill();}
