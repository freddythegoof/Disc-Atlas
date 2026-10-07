import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config='tests/auth.wrangler.jsonc',state='work/bag-map-controls/d1-qa',base='https://localhost:8813',dir='outputs/bag-map-controls';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
execFileSync(process.execPath,[wrangler,'d1','migrations','apply','disc-atlas-accounts','--local','--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8813','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const errors=[],shots=[],checks=[];
const overlaps=(a,b)=>a.x<b.x+b.width && a.x+a.width>b.x && a.y<b.y+b.height && a.y+a.height>b.y;
try{
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu']});
 for(const width of [1440,360]){
  const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height:width===360?800:1000},isMobile:width===360,hasTouch:width===360});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(base+'/?bag=1');
  await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='open' && document.querySelector('#bagScene').dataset.engine==='ready');
  const settled=()=>page.waitForFunction(()=>{const s=document.querySelector('#bagScene'),c=s.querySelector('[data-bag-canvas]'),v=c.bagViewer;return !v.stage.moving && !v.turning && v.puttersSettled && s.dataset.putterPocket!=='moving' && s.dataset.staging!=='moving' && !c.getAnimations().length;});
  const scene=page.locator('#bagScene'),pocket=scene.locator('[data-bag-pocket]'),back=scene.locator('.bag-return-all'),canvas=scene.locator('[data-bag-canvas]');
  const shot=async name=>{
   await page.mouse.move(2,2);await page.evaluate(()=>{document.activeElement?.blur?.();return document.fonts.ready;});await settled();await page.waitForTimeout(300);
   // The crowded canvas extends beyond its figure: capture their union, including both corner
   // controls and the footer, rather than clipping to the narrower figure or a long bag list.
   const clip=await scene.evaluate(n=>{const s=n.getBoundingClientRect(),c=n.querySelector('[data-bag-canvas]').getBoundingClientRect(),x=Math.max(0,Math.min(s.left,c.left)),y=Math.min(s.top,c.top)+scrollY;return {x,y,width:Math.min(innerWidth,Math.max(s.right,c.right))-x,height:Math.max(s.bottom,c.bottom)+scrollY-y};});
   await page.screenshot({path:`${dir}/${name}.png`,fullPage:true,clip});shots.push(name);
  };
  const geometry=async label=>{
   await page.mouse.move(2,2);await settled();
   const [p,r,c,z]=await Promise.all([pocket.boundingBox(),back.boundingBox(),canvas.boundingBox(),scene.locator('.bag-zoom').boundingBox()]);
   assert.ok(p.y>=c.y+6 && p.y<=c.y+14 && Math.abs(p.x-(c.x+10))<1,`${label}: pocket stays in the upper-left control corner, including its hover lift`);
   assert.ok(r.y>=c.y+c.height+4,`${label}: Return all is below the drawing area`);
   for(const [name,b] of [['pocket',p],['Return all',r]]){
    assert.ok(b.height>=44-.01 && b.x>=0 && b.x+b.width<=width,`${label}: ${name} fits with a 44px target ${JSON.stringify(b)}`);
    assert.ok(!overlaps(b,z),`${label}: ${name} clears zoom`);
    for(const disc of await scene.locator('[data-out-name]:visible,[data-physical-disc][aria-hidden="false"]').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height};})))assert.ok(!overlaps(b,disc),`${label}: ${name} clears discs and names`);
   }
   assert.ok(!overlaps(p,r),`${label}: controls are separate`);
   const bag=await canvas.evaluate(n=>{const c=n.getBoundingClientRect(),r=n.bagViewer.bagRect();return {x:c.x+r.left,y:c.y+r.top,width:r.width,height:r.height};});
   assert.ok(!overlaps(p,bag) && !overlaps(r,bag),`${label}: both controls clear the bag`);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${label}: no sideways scroll`);
  };
  await settled();
  assert.equal(await page.getByRole('button',{name:'Top view',exact:true}).count(),0,'Top view is removed');
  for(const theme of ['midnight','light','charcoal']){
   await page.evaluate(t=>document.querySelector(`[data-theme-choice="${t}"]`).click(),theme);
   // A type pull-out opens details; close it to verify the full map area.
   await page.locator('[data-type-out="distance"]').click();await settled();
   if(await page.locator('#detail').isVisible()){await page.keyboard.press('Escape');await page.locator('#detail').waitFor({state:'hidden'});await settled();}
   await geometry(`${width} ${theme} distance`);await shot(`return-distance-${width}-${theme}`);
   for(const type of ['fairway','mid','putter']){await page.locator(`[data-type-out="${type}"]`).click();await settled();}
   if(await page.locator('#detail').isVisible()){await page.keyboard.press('Escape');await page.locator('#detail').waitFor({state:'hidden'});await settled();}
   assert.ok(await canvas.evaluate(n=>n.bagViewer.outDiscs.length>=6),'A crowded ring is exercised');
   if(width===1440)assert.equal(await canvas.evaluate(n=>n.bagViewer.stage.pull),1,'The footer reserves no space inside the canvas; the bag stays full size');
   await geometry(`${width} ${theme} crowd`);await shot(`return-crowd-${width}-${theme}`);
   await pocket.click();await settled();assert.equal(await pocket.getAttribute('aria-expanded'),'false');
   await geometry(`${width} ${theme} collapsed`);await shot(`return-collapsed-${width}-${theme}`);
   await pocket.click();await settled();
   await back.focus();await page.keyboard.press('Enter');await settled();
   assert.equal(await back.isHidden(),true,'Return all hides after returning every disc');
   assert.deepEqual(await canvas.evaluate(n=>n.bagViewer.outDiscs),[],'Return all returns every disc');
   await shot(`returned-${width}-${theme}`);
   // A single disc uses the side-by-side layout rather than the ring.
   await scene.locator('[data-physical-disc][data-pocket="main"][tabindex="0"]').first().click();await settled();
   await page.keyboard.press('Escape');await page.locator('#detail').waitFor({state:'hidden'});await settled();
   await geometry(`${width} ${theme} single`);await shot(`return-single-${width}-${theme}`);
   await back.click();await settled();
   checks.push(`${width} ${theme}: open/collapsed pocket, crowd, distance and single out discs, keyboard Return all, no overlaps or overflow`);
  }
  await context.close();
 }
 assert.deepEqual(errors,[],'No browser errors');
 fs.writeFileSync(`${dir}/qa.json`,JSON.stringify({checks,shots,errors},null,2));
 fs.writeFileSync(`${dir}/screenshots.html`,`<!doctype html><meta charset="utf-8"><title>Bag map controls</title><style>body{font:14px system-ui;background:#111;color:#eee;margin:24px}figure{display:inline-block;vertical-align:top;margin:0 16px 24px 0}img{max-width:680px;display:block}</style>${shots.map(s=>`<figure><img src="${s}.png" alt="${s}"><figcaption>${s}</figcaption></figure>`).join('')}`);
 console.log(`PASS bag map controls: ${checks.length} cases, ${shots.length} screenshots`);
}finally{await browser?.close();server.kill();}
