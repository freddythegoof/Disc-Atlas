import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// My Bag (Oct 10), two tweaks.
// Switch: once the details panel shows one of the bag's discs, clicking another disc switches the
// panel straight to it, with no popup in between. A click on a disc in the bag slides it out and
// shows it; a click on another out disc shows it (it stays out); a click on an out disc's name (or a
// bagged disc's hover name) shows it. A click on the disc the panel shows still puts it back.
// Dump bag: a button beside Return all takes every disc in the bag out at once, opening the bag and
// the putter pocket first if need be. It goes away once everything is out, and Return all puts it all back.
// Runs on the signed-out demo bag, on a desktop (side panel) and a phone (bottom sheet, touch).
const config='tests/auth.wrangler.jsonc',state='work/bag-switch-dump/d1-qa',base='https://localhost:8816',dir='outputs/bag-switch-dump';
fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
execFileSync(process.execPath,[wrangler,'d1','migrations','apply','disc-atlas-accounts','--local','--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8816','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const errors=[];
const check=label=>console.log('ok -',label);
try {
 const deadline=Date.now()+45000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
 const open=async({width,height,touch})=>{
  const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height},isMobile:touch,hasTouch:touch,deviceScaleFactor:touch?2:1});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const viewer=fn=>page.locator('[data-bag-canvas]').evaluate((n,source)=>new Function('v',`return (${source})(v)`)(n.bagViewer),fn.toString());
  const scene=page.locator('#bagScene'),detail=page.locator('#detail'),popup=page.locator('.bag-disc-popup'),slot=id=>page.locator(`[data-physical-disc="${id}"]`),nameOf=id=>page.locator(`[data-out-name="${id}"][data-shown]`);
  const dump=page.locator('.bag-dump'),back=page.locator('.bag-return-all');
  const settled=()=>page.waitForFunction(()=>{const s=document.querySelector('#bagScene'),c=s.querySelector('[data-bag-canvas]'),v=c.bagViewer;return v && !v.stage.moving && !v.turning && v.puttersSettled && (s.dataset.staging===undefined || s.dataset.staging==='still') && s.dataset.putterPocket!=='moving' && s.dataset.phase!=='opening' && !c.getAnimations().length;},null,{timeout:20000});
  const outIds=()=>viewer(v=>v.outDiscs);
  const openBag=async()=>{await page.goto(base+'/?bag=1');await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s.dataset.engine==='ready' && s.dataset.phase==='open';},null,{timeout:30000});await scene.scrollIntoViewIfNeeded();if(!touch)await page.mouse.move(2,2);await settled();};
  const title=id=>slot(id).evaluate(n=>n.bagTitle);
  const shows=id=>title(id).then(name=>page.waitForFunction(name=>{const d=document.querySelector('#detail');return !d.hidden && d.querySelector('h2')?.textContent===name;},name,{timeout:5000}));
  const press=async locator=>{if(touch){await locator.scrollIntoViewIfNeeded();const b=await locator.boundingBox();await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);}else await locator.click();};
  const reachable=()=>page.locator('[data-physical-disc][tabindex="0"]').evaluateAll(l=>l.map(n=>({id:n.dataset.physicalDisc,pocket:n.dataset.pocket})));
  // The bag's drawn discs (each can come out).
  const bagIds=()=>page.locator('[data-physical-disc]').evaluateAll(l=>l.map(n=>n.dataset.physicalDisc));
  return {context,page,viewer,scene,detail,popup,slot,nameOf,dump,back,settled,outIds,openBag,title,shows,press,reachable,bagIds};
 };

 // Desktop: the side panel.
 {
  const t=await open({width:1440,height:900,touch:false}),{page,detail,popup,slot,nameOf,dump,back,settled,outIds}=t;
  await t.openBag();
  const all=await t.bagIds(),mains=(await t.reachable()).filter(d=>d.pocket==='main').map(d=>d.id);
  assert.ok(all.length>=10,'the demo bag has its discs');
  const [a,b,c]=[mains[1],mains[5],mains[9]];

  // Dump bag shows from the start, counting every disc in the bag; Return all waits for an out disc.
  assert.ok(await dump.isVisible(),'Dump bag shows');assert.equal(await back.isVisible(),false);
  assert.equal(await dump.locator('[data-dump-count]').innerText(),String(all.length));
  assert.match(await dump.getAttribute('aria-label'),new RegExp(`take out all ${all.length} discs`));

  // Switch. A out, its details open from the popup, as before.
  await slot(a).click();await settled();await page.mouse.move(2,2);
  await nameOf(a).click();await popup.waitFor({state:'visible'});await popup.click();await t.shows(a);
  // A disc in the bag: one click slides it out and shows it, no popup; A stays out.
  await slot(b).click();await t.shows(b);await settled();
  assert.deepEqual(await outIds(),[a,b],'B slid out beside A');assert.equal(await popup.isVisible(),false,'no popup on the way');
  await page.screenshot({path:`${dir}/desktop-switch-to-bagged.png`});
  // An out disc's name: one click shows it.
  await nameOf(a).click();await t.shows(a);assert.equal(await popup.isVisible(),false);
  assert.deepEqual(await outIds(),[a,b]);
  await page.screenshot({path:`${dir}/desktop-switch-by-name.png`});
  // Another out disc: one click shows it, and it stays out.
  await slot(b).click();await t.shows(b);await page.waitForTimeout(300);
  assert.deepEqual(await outIds(),[a,b],'clicking a shown-elsewhere out disc keeps it out');
  // A bagged disc's hover name: one click shows it (it stays in the bag).
  await slot(c).hover();const tag=page.locator('.bag-hover-name:not([hidden])');await tag.waitFor({state:'visible'});
  await tag.click();await t.shows(c);assert.deepEqual(await outIds(),[a,b],'the hover name shows the disc without sliding it out');
  // Keyboard: Enter on another disc switches too.
  await slot(a).focus();await page.keyboard.press('Enter');await t.shows(a);
  // The disc the panel shows: a click puts it back, closing the panel, as before.
  await page.mouse.move(2,2);await slot(a).click();await detail.waitFor({state:'hidden'});await settled();
  assert.deepEqual(await outIds(),[b],'the shown disc went back');
  // With the panel closed, a click toggles again and a name click pins its popup (no details).
  await nameOf(b).click();await popup.waitFor({state:'visible'});assert.equal(await detail.isVisible(),false);
  await page.keyboard.press('Escape');await page.mouse.move(2,2);
  check('Switch (1440): with the details showing a bag disc, a click on a bagged disc slides it out and shows it, on another out disc or any name shows it, Enter too; no popup in between; a click on the shown disc still puts it back');

  // Dump bag: everything comes out; the button goes, Return all counts them all and takes focus.
  assert.equal(await dump.locator('[data-dump-count]').innerText(),String(all.length-1),'it counts what is still in the bag');
  await dump.focus();await page.keyboard.press('Enter');await settled();
  assert.deepEqual([...await outIds()].sort(),[...all].sort(),'every disc is out');
  assert.equal(await dump.isVisible(),false,'Dump bag goes once the bag is empty');
  assert.equal(await back.locator('[data-return-count]').innerText(),String(all.length));
  assert.ok(await back.evaluate(n=>document.activeElement===n),'focus moves to Return all');
  const names=await page.locator('[data-out-name][data-shown]:not([hidden])').count();
  assert.equal(names,all.length,'every out disc shows its name');
  await page.screenshot({path:`${dir}/desktop-dumped.png`});
  // Switching works across the dumped discs too.
  await page.mouse.move(2,2);await nameOf(c).click();await popup.click();await t.shows(c);
  await nameOf(a).click();await t.shows(a);
  await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});
  // Return all puts them back and Dump bag returns.
  await back.click();await settled();assert.deepEqual(await outIds(),[]);
  assert.ok(await dump.isVisible());assert.equal(await back.isVisible(),false);
  // From a closed bag with the putter pocket collapsed: Dump bag opens both first.
  await page.locator('[data-bag-toggle]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='closed');
  await page.locator('[data-bag-pocket]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.putterPocket==='collapsed');await settled();
  await dump.click();await page.waitForFunction(n=>document.querySelector('[data-bag-canvas]').bagViewer.outDiscs.length===n,all.length,{timeout:20000});await settled();
  assert.equal(await t.scene.getAttribute('data-phase'),'open');assert.equal(await t.scene.getAttribute('data-putter-pocket'),'open');
  await back.click();await settled();
  check(`Dump bag (1440): one press takes all ${all.length} discs out (names showing), the button goes and Return all takes focus and puts them back; from a closed bag with the pocket collapsed it opens both first`);
  await t.context.close();
 }

 // Phone: the bottom sheet, touch.
 {
  const t=await open({width:390,height:844,touch:true}),{page,detail,popup,nameOf,dump,back,settled,outIds}=t;
  await t.openBag();
  const all=await t.bagIds();
  await t.press(dump);await settled();
  assert.equal((await outIds()).length,all.length,'a tap dumps the bag');assert.equal(await dump.isVisible(),false);
  await page.screenshot({path:`${dir}/phone-dumped.png`});
  // A name, its popup, the sheet; then a tap on another name in view above the sheet switches it.
  const [first]=await outIds();
  await t.press(nameOf(first));await popup.waitFor({state:'visible'});await t.press(popup);await t.shows(first);await page.waitForTimeout(500);
  const other=await page.evaluate(first=>{
   const top=innerHeight-document.querySelector('#detail').offsetHeight;
   return [...document.querySelectorAll('[data-out-name][data-shown]:not([hidden])')].map(n=>({id:n.dataset.outName,r:n.getBoundingClientRect()}))
    .find(({id,r})=>id!==first && r.top>8 && r.bottom<top-8)?.id;
  },first);
  assert.ok(other,'another name shows above the sheet');
  await t.press(nameOf(other));await t.shows(other);assert.equal(await popup.isVisible(),false,'no popup on the way');
  await page.screenshot({path:`${dir}/phone-switch-by-name.png`});
  // The sheet covers the button row: close it, then Return all.
  await t.press(page.locator('#closeDetail'));await detail.waitFor({state:'hidden'});
  await t.press(back);await settled();assert.deepEqual(await outIds(),[]);
  check('Phone (390, touch): a tap dumps the bag; with the sheet up, a tap on another name switches it; Return all puts everything back');
  await t.context.close();
 }
 const real=errors.filter(e=>!/status of 40[134]|Failed to load resource/.test(e));
 assert.deepEqual(real,[],'no page errors');
 check('No page or console errors');
} finally {
 await browser?.close();server.kill();
}
