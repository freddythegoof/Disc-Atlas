import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config='tests/auth.wrangler.jsonc',state='work/bag-tips/d1',base='https://localhost:8831',dir='outputs/bag-tips';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js',baseline=process.env.BAG_TIPS_BASELINE==='1';
const instructions='Hover a disc to see its name; hover or tap a name for its numbers, and click that card for the full details. With the details open, click any other disc or its name to switch to it. Click a disc to slide it out; it stays out until you click it again. Out discs rest in columns beside the bag, each with its name: the less overstable half on the left, the more overstable half on the right, faster discs higher. The type buttons beside the sort pull out every distance driver, fairway, midrange or putter at once and put them back on a second click; Dump bag takes every disc out at once, and Return all puts every one back. Drag sideways to spin the bag (from anywhere on it, discs included); flick it and it coasts, and it stays where it stops. Putter pocket tucks the putters down into their pocket and brings them back up, with the bag left open. Zoom with the + and − buttons under the bag, pinch, or Ctrl + scroll.';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
execFileSync(process.execPath,[wrangler,'d1','migrations','apply','disc-atlas-accounts','--local','--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8831','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const errors=[],metrics=[];
try {
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu']});
 for(const [width,height] of [[1440,1000],[390,844],[360,640]]) {
  const touch=width<700,context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height},hasTouch:touch,isMobile:touch});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
  await page.goto(base+'/?bag=1');
  await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s.dataset.engine==='ready'&&s.dataset.phase==='open'&&!s.querySelector('[data-bag-canvas]').bagViewer.stage.moving;},null,{timeout:30000});
  await page.evaluate(()=>document.fonts.ready);await page.mouse.move(2,2);
  const scene=page.locator('#bagScene'),button=page.getByRole('button',{name:'Bag tips',exact:true}),panel=page.locator('#bagTips');
  const shot=async suffix=>{await page.mouse.move(2,2);await scene.screenshot({path:`${dir}/${width}-${suffix}.png`});};
  if(baseline){assert.equal(await scene.locator('.bag-scene-hint').innerText(),instructions);await shot('before');metrics.push({width,height,sceneHeight:(await scene.boundingBox()).height});await context.close();continue;}
  assert.equal(await panel.isVisible(),false,'Tips hidden on load');
  assert.equal(await button.count(),1,'Bag tips icon is available');
  assert.equal(await button.getAttribute('aria-expanded'),'false');
  assert.equal(await scene.locator('.bag-scene-hint').count(),0,'No visible hint row remains');
  const box=await button.boundingBox();assert.ok(box.width>=44&&box.height>=44,'44 px target');
  assert.equal(await button.evaluate(n=>!!n.closest('.bag-scene-actions')&&!n.closest('[data-bag-canvas]')),true,'Tips share the action row, outside gestures');
  await shot('after');metrics.push({width,height,sceneHeight:(await scene.boundingBox()).height});
  await button.focus();assert.ok(await button.evaluate(n=>getComputedStyle(n).outlineStyle!=='none'),'Visible keyboard focus');
  const press=async locator=>{if(touch)await locator.tap();else await locator.click();};
  const open=async()=>{await press(button);await page.waitForFunction(()=>document.querySelector('#bagTips').matches(':popover-open'));assert.equal(await panel.locator('p').innerText(),instructions);assert.equal(await button.getAttribute('aria-expanded'),'true');await page.waitForTimeout(180);};
  const closed=async()=>{await page.waitForFunction(()=>!document.querySelector('#bagTips').matches(':popover-open'));assert.equal(await button.getAttribute('aria-expanded'),'false');await page.waitForFunction(()=>document.querySelector('#bagTipsButton')===document.activeElement);};
  await open();
  const geometry=await panel.evaluate(n=>{const p=n.getBoundingClientRect(),c=document.querySelector('[data-bag-controls]').getBoundingClientRect();return {left:p.left,right:p.right,top:p.top,bottom:p.bottom,controlsTop:c.top,viewW:innerWidth,viewH:innerHeight};});
  assert.ok(geometry.left>=8&&geometry.right<=geometry.viewW-8&&geometry.top>=8&&geometry.bottom<=geometry.viewH-8,'Card inside viewport '+JSON.stringify(geometry));
  assert.ok(geometry.bottom<=geometry.controlsTop-6,'Card clears controls');
  assert.equal(await page.getByRole('button',{name:'Close bag tips'}).evaluate(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),true,'Close stays reachable');
  await shot('open');await press(page.getByRole('button',{name:'Close bag tips'}));await closed();
  await open();await page.keyboard.press('Escape');await closed();
  await open();const b=await button.boundingBox();if(touch)await page.touchscreen.tap(12,b.y+b.height/2);else await page.mouse.click(12,b.y+b.height/2);await closed();
  if(touch){
   // A finger can remain down across frames before the compatibility click moves focus.
   await open();const bounds=await button.boundingBox(),session=await context.newCDPSession(page);
   await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:12,y:bounds.y+bounds.height/2}]});
   await page.waitForTimeout(120);await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();
   await closed();
  }
  await open();await press(button);await closed();
  if(touch){
   await open();
   // Keep the icon visible near the top: the card must relocate below the controls.
   await page.evaluate(()=>scrollBy(0,document.querySelector('#bagTipsButton').getBoundingClientRect().top-120));
   await page.waitForTimeout(200);
   const shifted=await panel.evaluate(n=>{const r=n.getBoundingClientRect(),a=document.querySelector('.bag-scene-actions').getBoundingClientRect();return {top:r.top,bottom:r.bottom,actionsBottom:a.bottom};});
   assert.ok(shifted.top>=shifted.actionsBottom+6&&shifted.bottom<=height-8,'Scrolled card clears controls '+JSON.stringify(shifted));
   await page.keyboard.press('Escape');await closed();
  }
  // An uncovered disc remains clickable while tips are open, on that very first press.
  if(!touch){
   await open();
   const target=await scene.locator('[data-physical-disc][aria-hidden="false"]').evaluateAll(nodes=>{
    for(const n of nodes){const r=n.getBoundingClientRect();for(const [fx,fy] of [[.5,.5],[.2,.2],[.8,.2]]){
     const x=r.left+r.width*fx,y=r.top+r.height*fy;
     if(x>=0&&y>=0&&x<innerWidth&&y<innerHeight&&document.elementFromPoint(x,y)?.closest('[data-physical-disc]')===n)return {id:n.dataset.physicalDisc,x,y};
    }}return null;
   });
   assert.ok(target,'An uncovered disc is reachable');await page.mouse.click(target.x,target.y);
   await page.waitForFunction(id=>document.querySelector('[data-bag-canvas]').bagViewer.outDiscs.includes(id),target.id);
   await page.waitForFunction(()=>!document.querySelector('[data-bag-canvas]').bagViewer.stage.moving);
   assert.equal(await panel.evaluate(n=>n.matches(':popover-open')),false,'First disc press dismisses tips');
   await page.locator(`[data-physical-disc="${target.id}"]`).click();
   await page.waitForFunction(()=>!document.querySelector('[data-bag-canvas]').bagViewer.stage.moving);
  }
  // Normal disc pulls/returns still use real pointer input on desktop and phones.
  const disc=page.locator('[data-pocket="main"] [data-physical-disc][aria-hidden="false"]').first(),id=await disc.getAttribute('data-physical-disc');
  await press(disc);await page.waitForFunction(id=>document.querySelector('[data-bag-canvas]').bagViewer.outDiscs.includes(id),id);
  await page.waitForFunction(()=>!document.querySelector('[data-bag-canvas]').bagViewer.stage.moving);
  await press(disc);await page.waitForFunction(id=>!document.querySelector('[data-bag-canvas]').bagViewer.outDiscs.includes(id),id);
  assert.equal(await page.locator('#detail').isVisible(),false,'Disc click does not open details');
  // Tips reset on a fresh load; Storage and Lost keep their existing sibling bars.
  await open();await page.reload();assert.equal(await panel.isVisible(),false);
  await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s.dataset.engine==='ready'&&s.dataset.phase==='open'&&!s.querySelector('[data-bag-canvas]').bagViewer.stage.moving;});
  await page.evaluate(()=>document.querySelector('[data-theme-choice="midnight"]').click());
  await page.waitForFunction(()=>document.documentElement.dataset.theme==='midnight'&&!document.documentElement.classList.contains('theme-switching'));
  await open();await shot('open-midnight');await page.keyboard.press('Escape');await closed();
  await page.emulateMedia({reducedMotion:'reduce'});await open();
  assert.equal(await panel.evaluate(n=>getComputedStyle(n).scale),'none','Reduced motion uses shared opacity-only policy');
  await page.keyboard.press('Escape');await closed();
  assert.ok((await page.locator('#storageSceneHint').textContent()).startsWith('Every Storage disc stands in a slot'));
  assert.ok((await page.locator('#lostSceneHint').textContent()).length>0);
  console.log(`PASS ${width}×${height}: hidden, exact text, close/Esc/outside/toggle, focus, geometry, disc pull/return, reload`);
  await context.close();
 }
 assert.deepEqual(errors,[],'No page errors');fs.writeFileSync(`${dir}/${baseline?'before':'after'}-metrics.json`,JSON.stringify(metrics,null,2));
} finally {await browser?.close();server.kill();}
