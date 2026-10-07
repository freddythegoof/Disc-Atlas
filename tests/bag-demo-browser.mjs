import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// Signed out, My Bag shows a static, read-only demo bag (3D viewer + contents list) with a
// sign-in call to action. My Map stays signed-in only; signing in replaces the demo entirely.
const config='tests/auth.wrangler.jsonc',state='work/bag-demo/d1-qa',base='https://localhost:8806',dir='outputs/bag-demo';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8806','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const errors=[],shots=[],checks=[],bagCalls=[];
const check=label=>{checks.push(label);console.log('ok -',label);};
try {
 const deadline=Date.now()+45000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/bag'))bagCalls.push(r.method()+' '+new URL(r.url()).pathname);});
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const cb=new URL(u.searchParams.get('redirect_uri'));cb.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${cb.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const quietTheme=theme=>page.evaluate(t=>document.querySelector(`[data-theme-choice="${t}"]`).click(),theme);
 const shot=async(name,options={})=>{await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(450);await page.screenshot({path:`${dir}/${name}.png`,...options});shots.push(name);};
 const bagOpen=()=>page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s.dataset.engine==='ready' && s.dataset.phase==='open';},null,{timeout:20000});
 const demo=page.locator('#myBagDemo'),cta=page.locator('#myBagSignIn'),rows=page.locator('#myBagContents [data-disc-id]');

 // 1. Signed out: the demo bag, its 3D viewer and its list, with the sign-in call to action.
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>window.AtlasAccount?.current && discs.length>0);
 await demo.waitFor();await bagOpen();
 assert.equal(await page.evaluate(()=>window.AtlasAccount.current.user),null);
 assert.match(await cta.innerText(),/^Sign in to build and save your own bag/);
 assert.equal(await cta.getAttribute('href'),'/signin?return_to=%2F%3Fbag%3D1');
 assert.ok(await page.locator('#myBagTeaser').isHidden(),'The sign-in wall is gone');
 assert.equal(await page.locator('#myBagEyebrow').innerText(),'SAMPLE LINEUP');
 assert.equal(await rows.count(),20,'Eighteen bagged discs and two in Storage');
 assert.equal(await page.locator('#bagScene [data-physical-disc]').count(),18,'Every bagged disc is in the 3D bag');
 assert.equal(await page.locator('#bagSlotMeter').innerText(),'18 / 24');
 assert.equal(await page.locator('#bagModelName').innerText(),'Dynamic Discs Commander');
 const groups=await page.locator('#bagLineup .bag-pocket-text').allInnerTexts();
 assert.ok(groups.includes('Go-to') && groups.includes('Putter pocket') && groups.includes('Main compartment'));
 for(const name of ['Destroyer','Zeus','TeeBird','Buzzz','Aviar','Luna'])assert.ok(await page.locator('#bagLineup .my-bag-disc-name',{hasText:name}).count(),`${name} is in the demo lineup`);
 check('Signed out: demo bag (20 sample discs, 18 in the 3D bag, all four types) with the sign-in call to action');

 // 2. Read-only: no mutating controls anywhere, no bag API traffic, My Map stays signed-in only.
 for(const selector of ['#addBagDisc','#editBagModel','#bagSort','#bagSortHint','#myBagViews','#myMapPanel'])assert.ok(await page.locator(selector).isHidden(),`${selector} is hidden`);
 // Sorting saves to the account; the type buttons only stage discs, so the demo keeps them.
 assert.equal(await page.locator('.bag-type-out button:visible').count(),4,'The demo keeps the four type buttons');
 for(const selector of ['[data-bag-edit]','[data-bag-remove]','[data-bag-move]','select[data-bag-pocket]','[data-bag-drag]','[data-bag-earlier]','[data-bag-later]','#myBagEmpty'])assert.equal(await page.locator(selector).count(),0,`No ${selector} in the demo`);
 assert.deepEqual(bagCalls,[],'The demo never calls the bag API');
 assert.equal((await page.request.get(base+'/api/bag')).status(),401,'The API still requires an account');
 assert.equal(await page.evaluate(()=>window.BagApp.mapColors().size),0,'The demo never colors the atlas');
 assert.equal(await page.evaluate(()=>myMap),null,'The atlas map is not in personal mode');
 check('Read-only: no add/edit/remove/move/pocket/sort/settings controls, no My Map switch, no bag API calls');
 await shot('signed-out-1440-light',{fullPage:true});
 await quietTheme('midnight');await shot('signed-out-1440-midnight');

 // 3. Viewing still works: a disc slides out, and its name's popup opens its sample details, without an Edit button.
 const putter=page.locator('#bagScene [data-physical-disc][data-pocket="putter"][tabindex="0"]').last(),putterId=await putter.getAttribute('data-physical-disc');
 await putter.click();await page.locator(`[data-out-name="${putterId}"][data-shown]`).click();await page.locator('.bag-disc-popup:not([hidden])').click();await page.locator('#myBagView #detail #bagDetailTitle').waitFor();
 assert.equal(await page.locator('#bagDetailTitle').innerText(),'Sample disc');
 assert.equal(await page.locator('[data-bag-detail-edit]').count(),0,'No Edit disc in the demo');
 assert.ok(await page.locator('#detail [data-show-on-atlas]').isEnabled(),'Show on Atlas works');
 await shot('signed-out-1440-midnight-detail');
 await page.keyboard.press('Escape');await page.waitForFunction(()=>document.querySelector('#detail').hidden || document.querySelector('#detail').parentNode.id!=='myBagView');
 // The putter stays out until clicked again.
 await putter.click();await page.waitForFunction(()=>!document.querySelector('[data-bag-canvas]').bagViewer.outDiscs.length);
 await page.locator('#myBagContents [data-bag-inspect]').first().click();await page.locator('#bagDetailTitle').waitFor();
 assert.equal(await page.locator('[data-bag-detail-edit]').count(),0);
 await page.keyboard.press('Escape');
 check('Viewing: 3D slide-out and list both open sample details (Sample disc, Show on Atlas, no Edit)');

 // 4. Adding from the atlas signed out leads to the demo, never an editor.
 await page.evaluate(()=>window.BagApp.add(discs.find(d=>d.id==='9ea748f5bf64')));
 assert.ok(!await page.locator('#addDiscDialog').evaluate(d=>d.open),'No add dialog signed out');
 assert.deepEqual(bagCalls,[]);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'myBagSignIn','Focus lands on the sign-in call to action');
 assert.equal(await page.locator('#myBagStatus').innerText(),'Sign in to build and save your own bag.');
 check('Add from the atlas signed out opens the demo and points at sign-in, never an editor');

 // 5. Mobile.
 await quietTheme('light');await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));
 const box=await cta.boundingBox();assert.ok(box && box.x>=0 && box.x+box.width<=390,'CTA fits a phone');
 {const wide=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,over:[...document.querySelectorAll('body *')].filter(n=>n.getBoundingClientRect().right>innerWidth+1 && n.checkVisibility()).slice(0,6).map(n=>`${n.tagName.toLowerCase()}.${n.className} ${Math.round(n.getBoundingClientRect().right)}`)}));
 assert.ok(wide.scroll<=390,'No horizontal scroll on a phone: '+JSON.stringify(wide));}
 await shot('signed-out-390-light');await shot('signed-out-390-light-full',{fullPage:true});
 await quietTheme('midnight');await shot('signed-out-390-midnight');
 check('Phone: banner, CTA and demo bag fit 390px without horizontal scroll');
 await page.setViewportSize({width:1440,height:1000});await quietTheme('light');

 // 6. Signing in replaces the demo with the player's own (empty) bag; signing out brings it back.
 await cta.click();await page.getByRole('link',{name:'Continue with Google',exact:true}).waitFor();
 const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href');
 const redirect=await page.request.get(base+href,{maxRedirects:0});await page.goto(redirect.headers().location);
 await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();
 assert.ok(await demo.isHidden(),'No demo banner signed in');
 assert.equal(await page.locator('[data-disc-id^="demo-"],[data-physical-disc^="demo-"]').count(),0,'No demo discs signed in');
 assert.equal(await page.locator('#myBagEyebrow').innerText(),'YOUR EVERYDAY LINEUP');
 for(const selector of ['#addBagDisc','#editBagModel','.bag-sort-bar','#myBagViews'])assert.ok(await page.locator(selector).isVisible(),`${selector} is back signed in`);
 check('Signed in: own empty bag, full controls and the My Map switch; no demo discs');
 await page.getByRole('button',{name:'Site menu',exact:true}).click();await page.getByRole('menuitem',{name:'Sign out',exact:true}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current && !window.AtlasAccount.current.user);
 await demo.waitFor();await rows.first().waitFor();
 assert.equal(await rows.count(),20);assert.ok(await page.locator('#myBagViews').isHidden());
 check('Signing out in place brings the demo bag back');

 assert.deepEqual(errors,[],'No page errors');
 fs.writeFileSync(`${dir}/qa.json`,JSON.stringify({checks,shots},null,1));
 console.log(`PASS bag demo: ${checks.length} checks, ${shots.length} screenshots in ${dir}`);
} catch(error) {
 if(errors.length)console.error('Page errors:',errors);
 throw error;
} finally {
 await browser?.close();server.kill();
}
