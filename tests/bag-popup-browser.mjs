import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// My Bag (Oct 7): one bottom control cluster and popup-first discs.
// Controls: the putter pocket button, the zoom buttons and the bag's open/close button sit together
// in one cluster under the canvas; nothing floats over the drawing. At every out-disc count from 1
// to 24, on a desktop and a phone, the cluster clears the bag, every disc, every name and the popup.
// Popup: a disc's click (or tap) slides it out or back and never opens the details. Hovering a name
// (an out disc's name, or a bagged disc's hover name) shows a popup with its key numbers; a click or
// tap on the name toggles it; a press elsewhere (or Escape) dismisses it; only one shows at a time,
// clear of every other name and of the controls. Clicking the popup opens the disc's details.
// Runs on the signed-out demo bag, served with six more main discs so 24 can come out.
const config='tests/auth.wrangler.jsonc',state='work/bag-popup/d1-qa',base='https://localhost:8815',dir='outputs/bag-popup';
fs.rmSync(dir,{recursive:true,force:true});
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8815','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const errors=[],shots=[],checks=[],metrics={};
const check=label=>{checks.push(label);console.log('ok -',label);};
const overlap=(a,b)=>!!a && !!b && a.left<b.left+b.width-1 && b.left<a.left+a.width-1 && a.top<b.top+b.height-1 && b.top<a.top+a.height-1;
// The demo bag plus six main discs (24 in the bag), so every count up to 24 can come out.
const EXTRA=[['cbb390068b86','Gold',174,8,'#ed7868'],['9554f962a394','Neo',173,9,'#70b7cd'],['0dc8d1cbf7b6','Neo',172,9,'#a7c68c'],['b880e2ae803c','Opto',175,8,'#b99bdd'],['f5fb00eb9fa5','Neo',177,9,'#e49376'],['d52158a41efd','ESP',174,9,'#79b3a8']];
const demoSource=fs.readFileSync('public/bag-demo.js','utf8');
const bigDemo=demoSource.replace("capacity:24,main_capacity:20","capacity:32,main_capacity:26")
 .replace(' // Storage: off the course for now',EXTRA.map(([id,plastic,weight,wear,color])=>` ['${id}','${plastic}',${weight},${wear},'${color}','main',null,''],`).join('\n')+'\n // Storage: off the course for now');
assert.notEqual(bigDemo,demoSource,'The test bag is built');
try {
 const deadline=Date.now()+45000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
 const open=async({width,height,touch})=>{
  const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width,height},isMobile:touch,hasTouch:touch,deviceScaleFactor:touch?2:1});
  await context.route('**/bag-demo.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:bigDemo}));
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  return {context,page};
 };
 const tools=(page,{touch=false}={})=>{
  const viewer=fn=>page.locator('[data-bag-canvas]').evaluate((n,source)=>new Function('v',`return (${source})(v)`)(n.bagViewer),fn.toString());
  const scene=page.locator('#bagScene'),detail=page.locator('#detail'),popup=page.locator('.bag-disc-popup'),slot=id=>page.locator(`[data-physical-disc="${id}"]`),nameOf=id=>page.locator(`[data-out-name="${id}"]`);
  const settled=()=>page.waitForFunction(()=>{const s=document.querySelector('#bagScene'),c=s.querySelector('[data-bag-canvas]'),v=c.bagViewer;return v && !v.stage.moving && !v.turning && v.puttersSettled && (s.dataset.staging===undefined || s.dataset.staging==='still') && s.dataset.putterPocket!=='moving' && !c.getAnimations().length;},null,{timeout:20000});
  const outIds=()=>viewer(v=>v.outDiscs);
  const openBag=async()=>{await page.goto(base+'/?bag=1');await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s.dataset.engine==='ready' && s.dataset.phase==='open';},null,{timeout:30000});await scene.scrollIntoViewIfNeeded();if(!touch)await page.mouse.move(2,2);await settled();};
  const center=async locator=>{await locator.scrollIntoViewIfNeeded();const b=await locator.boundingBox();return {x:b.x+b.width/2,y:b.y+b.height/2};};
  const tap=async locator=>{const c=await center(locator);await page.touchscreen.tap(c.x,c.y);};
  const popupFor=(id,pinned)=>page.waitForFunction(([id,pinned])=>{const p=document.querySelector('.bag-disc-popup');return !p.hidden && p.dataset.disc===id && (pinned===null || p.dataset.pinned===String(pinned));},[id,pinned??null],{timeout:5000});
  const popupGone=()=>page.waitForFunction(()=>document.querySelector('.bag-disc-popup').hidden,null,{timeout:5000});
  const setTheme=theme=>page.evaluate(t=>document.querySelector(`[data-theme-choice="${t}"]`).click(),theme);
  // Everything the cluster and the popup must clear, in page pixels.
  const geometry=()=>page.evaluate(()=>{
   const scene=document.querySelector('#bagScene'),canvas=scene.querySelector('[data-bag-canvas]'),v=canvas.bagViewer,c=canvas.getBoundingClientRect();
   const box=n=>{const r=n.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height};};
   const shown=n=>!!n && !n.hidden && n.checkVisibility({visibilityProperty:true}) && n.getBoundingClientRect().width>0;
   const cluster=scene.querySelector('[data-bag-controls]'),parts={pocket:scene.querySelector('[data-bag-pocket]'),zoom:scene.querySelector('.bag-zoom'),toggle:scene.querySelector('[data-bag-toggle]')};
   const bag=v.bagRect(),popup=scene.querySelector('.bag-disc-popup'),back=scene.querySelector('.bag-return-all');
   return {
    canvas:box(canvas),cluster:box(cluster),inCluster:Object.values(parts).every(n=>cluster.contains(n) && !canvas.contains(n)),
    controls:Object.fromEntries(Object.entries(parts).map(([k,n])=>[k,box(n)])),
    bag:bag && {left:c.left+bag.left,top:c.top+bag.top,width:bag.width,height:bag.height},
    discs:v.discRects().filter(r=>!r.empty && (r.out || canvas.querySelector(`[data-physical-disc="${CSS.escape(r.id)}"]`)?.getAttribute('aria-hidden')==='false')).map(r=>({id:r.key,out:!!r.out,left:c.left+r.left,top:c.top+r.top,width:r.width,height:r.height})),
    names:[...scene.querySelectorAll('[data-out-name],.bag-hover-name')].filter(shown).map(n=>({id:n.dataset.outName || 'hover',...box(n)})),
    popup:shown(popup)?{id:popup.dataset.disc,...box(popup)}:null,back:shown(back)?box(back):null,
    pull:v.stage.pull,names_mode:scene.dataset.names || null,
    clashes:(()=>{const n=[...scene.querySelectorAll('[data-out-name][data-shown]:not([hidden])')].map(n=>n.getBoundingClientRect());let c=0;for(let i=0;i<n.length;i++)for(let j=i+1;j<n.length;j++)if(n[i].left<n[j].right-1 && n[j].left<n[i].right-1 && n[i].top<n[j].bottom-1 && n[j].top<n[i].bottom-1)c++;return c;})(),under:scene.querySelectorAll('[data-out-name][data-under-popup]').length,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,
   };
  });
  return {viewer,scene,detail,popup,slot,nameOf,settled,outIds,openBag,center,tap,popupFor,popupGone,setTheme,geometry};
 };
 // The cluster: all three controls in it, under the canvas, 44 px targets, clear of the bag, every
 // disc, every name, the popup and each other.
 const clusterChecks=(g,label,{oneRow=true}={})=>{
  assert.ok(g.inCluster,`${label}: pocket, zoom and open/close are in the cluster, none on the canvas`);
  assert.ok(g.cluster.top>=g.canvas.top+g.canvas.height-.5 && g.cluster.top<=g.canvas.top+g.canvas.height+24,`${label}: the cluster sits right under the canvas ${JSON.stringify({cluster:g.cluster,canvas:g.canvas})}`);
  const parts=Object.entries(g.controls);
  for(const [name,b] of parts){
   assert.ok(b.height>=43.5,`${label}: ${name} is a 44 px target`);
   assert.ok(b.left>=0 && b.left+b.width<=g.viewport,`${label}: ${name} inside the page`);
   assert.ok(!overlap(b,g.bag),`${label}: ${name} clears the bag`);
   for(const d of g.discs)assert.ok(!overlap(b,d),`${label}: ${name} clears disc ${d.id}`);
   for(const n of g.names)assert.ok(!overlap(b,n),`${label}: ${name} clears the name of ${n.id}`);
   assert.ok(!overlap(b,g.popup),`${label}: ${name} clears the popup`);
   assert.ok(!overlap(b,g.back),`${label}: ${name} clears Return all`);
   for(const [other,o] of parts)if(other!==name)assert.ok(!overlap(b,o),`${label}: ${name} and ${other} apart`);
  }
  if(oneRow){const ys=parts.map(([,b])=>b.top+b.height/2);assert.ok(Math.max(...ys)-Math.min(...ys)<2,`${label}: one row ${ys}`);}
  assert.ok(g.scrollWidth<=g.viewport,`${label}: no sideways scroll`);
 };
 // The popup: inside the canvas, clear of every name (its own included), the cluster and Return all.
 const popupChecks=(g,id,label)=>{
  assert.ok(g.popup && g.popup.id===id,`${label}: the popup shows for ${id}`);
  const p=g.popup,c=g.canvas;
  assert.ok(p.left>=c.left-.5 && p.top>=c.top-.5 && p.left+p.width<=c.left+c.width+.5 && p.top+p.height<=c.top+c.height+.5,`${label}: popup inside the canvas ${JSON.stringify({p,c})}`);
  for(const n of g.names)assert.ok(!overlap(p,n),`${label}: popup clears the name of ${n.id} ${JSON.stringify({p,n})}`);
  assert.ok(!overlap(p,g.cluster),`${label}: popup clears the control cluster`);
  for(const [name,b] of Object.entries(g.controls))assert.ok(!overlap(p,b),`${label}: popup clears ${name}`);
  assert.ok(!overlap(p,g.back),`${label}: popup clears Return all`);
 };
 // A viewport capture (a full-page one resizes the window, and the phone's canvas with it): the canvas
 // at the top of the window, through Return all's row.
 // Framing scrolls the page, which moves the scene under a resting mouse: frame before a hover.
 const frame=page=>page.evaluate(()=>{const c=document.querySelector('#bagScene [data-bag-canvas]').getBoundingClientRect(),a=document.querySelector('#bagScene .bag-scene-actions').getBoundingClientRect();if(c.top<0 || a.bottom>innerHeight)scrollTo({top:Math.max(0,c.top+scrollY-8),behavior:'instant'});});
 const shot=async(page,name,{pad=0}={})=>{
  await page.evaluate(()=>document.fonts.ready);await frame(page);await page.waitForTimeout(250);
  const clip=await page.locator('#bagScene').evaluate((n,pad)=>{const s=n.getBoundingClientRect(),c=n.querySelector('[data-bag-canvas]').getBoundingClientRect(),a=n.querySelector('.bag-scene-actions').getBoundingClientRect();const x=Math.max(0,Math.min(s.left,c.left)-pad),y=Math.max(0,c.top-pad);return {x,y,width:Math.min(innerWidth,Math.max(s.right,c.right)+pad)-x,height:Math.min(innerHeight,a.bottom+pad)-y};},pad);
  await page.screenshot({path:`${dir}/${name}.png`,clip});shots.push(name);
 };

 // ── 1. Desktop, mouse ─────────────────────────────────────────────────────────────────────────
 // BAG_POPUP_ONLY=phone reruns just the phone half.
 if(process.env.BAG_POPUP_ONLY!=='phone'){
  const {context,page}=await open({width:1440,height:1000,touch:false});
  const t=tools(page),{scene,detail,popup,slot,nameOf,settled,outIds,popupFor,popupGone,geometry}=t;
  await t.openBag();await t.setTheme('midnight');await settled();
  const reachable=await page.locator('[data-physical-disc][tabindex="0"]').evaluateAll(l=>l.map(n=>[n.dataset.physicalDisc,n.dataset.pocket]));
  assert.equal(reachable.length,24,'All 24 discs are in reach with the bag open: '+reachable.length);
  const mains=reachable.filter(([,p])=>p==='main').map(([id])=>id),bagged=reachable.find(([,p])=>p==='goto')[0];
  const title=id=>page.evaluate(id=>{const n=document.querySelector(`[data-physical-disc="${id}"]`);return n.bagTitle;},id);

  // The cluster with nothing out: one row under the canvas, in order pocket, zoom, open/close.
  {const g=await geometry();clusterChecks(g,'1440 none out');
   assert.ok(g.controls.pocket.left<g.controls.zoom.left && g.controls.zoom.left<g.controls.toggle.left,'Pocket, zoom, then open/close');
   await shot(page,'cluster-1440-midnight',{pad:8});}
  // The cluster works: zoom, pocket, close and open.
  await page.locator('.bag-zoom [aria-label="Zoom in"]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.zoomed==='true');
  await page.locator('.bag-zoom .bag-zoom-level').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.zoomed==='false');
  await page.locator('[data-bag-pocket]').click();await settled();assert.equal(await page.locator('[data-bag-pocket]').getAttribute('aria-expanded'),'false');
  await page.locator('[data-bag-pocket]').click();await settled();assert.equal(await page.locator('[data-bag-pocket]').getAttribute('aria-expanded'),'true');
  await page.locator('[data-bag-toggle]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='closed');
  await page.locator('[data-bag-toggle]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='open');await settled();
  check('Cluster (1440): putter pocket, zoom and open/close in one row under the canvas; each still works');

  // A disc's click slides it out and opens nothing.
  const a=mains[2],b=mains[8];
  await slot(a).click();await settled();
  assert.deepEqual(await outIds(),[a]);await page.waitForTimeout(300);
  assert.equal(await detail.isVisible(),false,'A disc click no longer opens the details');
  assert.equal(await popup.isHidden(),true,'Nor a popup');
  // Hovering its name shows the popup; moving away hides it.
  await page.mouse.move(2,2);await page.waitForTimeout(250);
  {const c=await t.center(nameOf(a));await page.mouse.move(c.x,c.y);}
  await popupFor(a,false);
  assert.equal(await popup.locator('.bag-popup-name').innerText(),await title(a));
  assert.equal(await popup.locator('.bag-popup-number').count(),4,'Speed, glide, turn and fade');
  assert.match(await popup.innerText(),/Speed[\s\S]*Glide[\s\S]*Turn[\s\S]*Fade/i);
  popupChecks(await geometry(),a,'hover popup');
  await page.mouse.move(2,2);await popupGone();
  // A click on the name keeps it (pinned) when the pointer leaves; a second click hides it.
  await nameOf(a).click();await popupFor(a,true);await page.mouse.move(2,2);await page.waitForTimeout(400);
  assert.equal(await popup.isVisible(),true,'A clicked popup stays when the pointer leaves');
  await nameOf(a).click();await popupGone();
  // Only one at a time: a second disc's name replaces the first's popup, hover or click.
  await slot(b).click();await settled();
  await nameOf(a).click();await popupFor(a,true);
  {const c=await t.center(nameOf(b));await page.mouse.move(c.x,c.y);}await popupFor(b,null);
  assert.equal(await page.locator('.bag-disc-popup:not([hidden])').count(),1,'One popup');
  await nameOf(b).click();await popupFor(b,true);assert.equal(await page.locator('.bag-disc-popup:not([hidden])').count(),1);
  // A press elsewhere dismisses it, and leaves the flap alone.
  {const s=await page.locator('.bag-3d-stage canvas').boundingBox();await page.mouse.click(s.x+s.width*.5,s.y+s.height*.985);}
  await popupGone();assert.equal(await scene.getAttribute('data-phase'),'open','The dismissing press does not toggle the flap');
  // Clicking the popup opens the details for that disc.
  await nameOf(a).click();await popupFor(a,true);
  await popup.click();await detail.waitFor({state:'visible'});
  assert.equal(await detail.locator('h2').first().innerText(),await title(a),'The popup opens its disc\'s details');
  assert.equal(await popup.isHidden(),true,'The popup goes once the details open');
  assert.deepEqual(await outIds(),[a,b],'Opening details moves no disc');
  await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});await settled();
  // Escape dismisses a popup too.
  await nameOf(b).click();await popupFor(b,true);await page.keyboard.press('Escape');await popupGone();
  check('Popup (1440): a disc click slides it out without details; hovering its name shows the popup (name, speed/glide/turn/fade); leaving hides it; a click pins it and a second click hides it; one at a time; a press elsewhere or Escape dismisses it without moving the flap; clicking it opens that disc\'s details');

  // A bagged disc: hover shows its name, moving onto the name shows its popup, and the popup opens the details.
  await page.locator('.bag-return-all').click();await settled();await frame(page);
  await page.mouse.move(2,2);await page.waitForTimeout(250);
  {const c=await t.center(slot(bagged));await page.mouse.move(c.x,c.y);}
  await page.locator('.bag-hover-name:not([hidden])').waitFor();
  {const c=await t.center(page.locator('.bag-hover-name'));await page.mouse.move(c.x,c.y,{steps:4});}
  await popupFor(bagged,false);
  popupChecks(await geometry(),bagged,'bagged popup');clusterChecks(await geometry(),'bagged popup');
  {const c=await t.center(popup);await page.mouse.move(c.x,c.y,{steps:4});}
  await page.waitForTimeout(300);assert.equal(await popup.isVisible(),true,'The popup holds while the pointer is on it');
  await shot(page,'popup-bagged-1440-midnight');
  await popup.click();await detail.waitFor({state:'visible'});
  assert.equal(await detail.locator('h2').first().innerText(),await title(bagged));
  assert.deepEqual(await outIds(),[],'The bagged disc stays in its pocket');
  await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});await page.mouse.move(2,2);await settled();
  // Keyboard: a focused disc shows its popup, Tab reaches it, Enter opens the details.
  // Shift+Tab to the disc before it (its popup shows), Tab into that popup, Tab on to this disc.
  await slot(bagged).focus();await page.keyboard.press('Shift+Tab');
  const before=await page.evaluate(()=>document.activeElement.dataset.physicalDisc);assert.ok(before && before!==bagged,'Shift+Tab reaches the disc before');
  await popupFor(before,null);
  await page.keyboard.press('Tab');assert.equal(await popup.evaluate(n=>n===document.activeElement),true,'Tab enters the focused disc\'s popup');
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.dataset.physicalDisc),bagged,'Tab from a popup moves on to the next disc');
  await popupFor(bagged,null);
  await page.keyboard.press('Tab');assert.equal(await popup.evaluate(n=>n===document.activeElement),true,'Tab moves from the disc to its popup');
  await page.keyboard.press('Enter');await detail.waitFor({state:'visible'});
  assert.equal(await detail.locator('h2').first().innerText(),await title(bagged));
  await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});
  check('Bagged disc (1440): hover shows its name, the name shows its popup and the popup holds under the pointer; its click opens the details with the disc left in its pocket; by keyboard, focus shows the popup, Tab reaches it, Enter opens the details');

  // Out disc popup screenshots in each theme.
  await slot(mains[5]).click();await slot(mains[11]).click();await slot(bagged).click();await settled();await page.mouse.move(2,2);
  for(const theme of ['midnight','light','charcoal']){
   await t.setTheme(theme);await page.waitForTimeout(200);
   await nameOf(mains[11]).click();await popupFor(mains[11],true);await page.mouse.move(2,2);
   popupChecks(await geometry(),mains[11],`out popup ${theme}`);clusterChecks(await geometry(),`out popup ${theme}`);
   await shot(page,`popup-out-1440-${theme}`);await page.keyboard.press('Escape');await popupGone();
  }
  await t.setTheme('midnight');await page.locator('.bag-return-all').click();await settled();

  // 1–24 out: the cluster clears everything and every popup clears every name and the cluster.
  const order=reachable.map(([id])=>id);await frame(page);
  metrics.desktop={};
  for(let n=1;n<=order.length;n++){
   await slot(order[n-1]).evaluate(node=>node.click());await settled();await page.mouse.move(2,2);
   assert.equal((await outIds()).length,n);
   const label=`1440 ${n} out`,before=await geometry();clusterChecks(before,label);
   const id=order[n-1];{const c=await t.center(nameOf(id));await page.mouse.move(c.x,c.y);}await popupFor(id,false);await page.waitForTimeout(60);
   const g=await geometry();popupChecks(g,id,label);clusterChecks(g,label+' with popup');
   metrics.desktop[n]={pull:+g.pull.toFixed(2),names:g.names_mode,under:g.under,clashes:before.clashes};
   assert.equal(g.under,0,`${label}: on a desktop the popup always finds a spot clear of every name`);
   if([1,6,12,18,24].includes(n))await shot(page,`out-${n}-popup-1440-midnight`);
   await page.mouse.move(2,2);await popupGone();
  }
  check(`Cluster and popup (1440), 1–24 out: the cluster clears the bag, every disc, every name and the popup; each newest disc's popup clears every name and the cluster (pull ${Object.values(metrics.desktop).map(m=>m.pull).join(', ')})`);
  await context.close();
 }

 // ── 2. Phone, touch ───────────────────────────────────────────────────────────────────────────
 for(const width of [360,390]){
  const {context,page}=await open({width,height:800,touch:true});
  const t=tools(page,{touch:true}),{scene,detail,popup,slot,nameOf,settled,outIds,popupFor,popupGone,geometry,tap}=t;
  await t.openBag();await t.setTheme('light');await settled();
  const reachable=await page.locator('[data-physical-disc][tabindex="0"]').evaluateAll(l=>l.map(n=>[n.dataset.physicalDisc,n.dataset.pocket]));
  const mains=reachable.filter(([,p])=>p==='main').map(([id])=>id);
  {const g=await geometry();clusterChecks(g,`${width} none out`);if(width===360)await shot(page,'cluster-360-light',{pad:4});}
  if(width===360){
   // Tap a disc: out, no details. Tap its name: popup; again: gone. Tap a second name: only that one.
   const [a,b]=[mains[3],mains[9]];
   await tap(slot(a));await settled();assert.deepEqual(await outIds(),[a]);await page.waitForTimeout(300);
   assert.equal(await detail.isVisible(),false,'A tap on a disc no longer opens the details');
   await tap(nameOf(a));await popupFor(a,true);
   popupChecks(await geometry(),a,'phone tap popup');
   await tap(nameOf(a));await popupGone();
   await tap(slot(b));await settled();
   await tap(nameOf(a));await popupFor(a,true);await tap(nameOf(b));await popupFor(b,true);
   assert.equal(await page.locator('.bag-disc-popup:not([hidden])').count(),1,'One popup on a phone too');
   // A tap elsewhere dismisses it (the flap stays open).
   await page.touchscreen.tap(4,(await page.locator('[data-bag-canvas]').boundingBox()).y+6);await popupGone();
   assert.equal(await scene.getAttribute('data-phase'),'open');
   {const s=await page.locator('.bag-3d-stage canvas').boundingBox();await tap(nameOf(b));await popupFor(b,true);await page.touchscreen.tap(s.x+s.width*.5,s.y+s.height*.985);}
   await popupGone();await page.waitForTimeout(200);assert.equal(await scene.getAttribute('data-phase'),'open','A dismissing tap on the bag\'s empty space leaves the flap alone');
   // Tapping the popup opens the details (the phone's bottom sheet).
   await tap(nameOf(a));await popupFor(a,true);await shot(page,'popup-out-360-light');
   await tap(popup);await detail.waitFor({state:'visible'});
   assert.equal(await detail.locator('h2').first().innerText(),await slot(a).evaluate(n=>n.bagTitle));
   await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});await settled();
   // A bagged disc's popup, from its hover name (a phone with a pointer).
   await page.locator('.bag-return-all').click();await settled();
   const goto=reachable.find(([,p])=>p==='goto')[0];await frame(page);
   {const c=await t.center(slot(goto));await page.mouse.move(c.x,c.y);}
   await page.locator('.bag-hover-name:not([hidden])').waitFor();
   {const c=await t.center(page.locator('.bag-hover-name'));await page.mouse.move(c.x,c.y,{steps:4});}
   await popupFor(goto,false);popupChecks(await geometry(),goto,'phone bagged popup');clusterChecks(await geometry(),'phone bagged popup');
   await shot(page,'popup-bagged-360-light');
   await page.mouse.move(2,2);await popupGone();
   check('Popup (360, touch): a tap on a disc slides it out without details; a tap on its name toggles the popup; one at a time; a tap elsewhere dismisses it (the flap stays open); a tap on the popup opens the bottom sheet; a bagged disc\'s hover name shows its popup');
  }
  // 1–24 out on the phone.
  const order=reachable.map(([id])=>id);metrics[width]={};
  for(let n=1;n<=order.length;n++){
   await slot(order[n-1]).evaluate(node=>node.click());await settled();
   const label=`${width} ${n} out`,before=await geometry();clusterChecks(before,label);
   const id=order[n-1];await tap(nameOf(id));await popupFor(id,true);await page.waitForTimeout(60);
   const g=await geometry();popupChecks(g,id,label);clusterChecks(g,label+' with popup');
   metrics[width][n]={pull:+g.pull.toFixed(2),names:g.names_mode,under:g.under,clashes:before.clashes};
   if(width===360 && [1,6,12,18,24].includes(n))await shot(page,`out-${n}-popup-360-light`);
   await page.keyboard.press('Escape');await popupGone();
  }
  const stepped=Object.entries(metrics[width]).filter(([,m])=>m.under).map(([n,m])=>`${n}:${m.under}`);
  // Recorded, not asserted: the out-disc layout itself (unchanged from Oct 7's earlier pass) was verified only to 18.
  const clashes=Object.entries(metrics[width]).filter(([,m])=>m.clashes).map(([n,m])=>`${n}:${m.clashes}`);
  if(clashes.length)console.log(`note - ${width}: out-disc names overlapping each other before any popup (count:pairs) ${clashes.join(', ')}`);
  check(`Cluster and popup (${width}, touch), 1–24 out: the cluster clears the bag, every disc, every name and the popup; each newest disc's popup clears every shown name and the cluster (pull ${Object.values(metrics[width]).map(m=>m.pull).join(', ')}; names stepped aside under the popup where no clear spot is near its name, count:names ${stepped.join(', ') || 'none'})`);
  await context.close();
 }

 assert.deepEqual(errors,[],'No page errors');
 fs.writeFileSync(`${dir}/screenshots.html`,`<!doctype html><meta charset="utf-8"><title>Bag popup and controls</title><style>body{font:14px system-ui;background:#111;color:#eee;margin:24px}figure{display:inline-block;margin:0 16px 24px 0;vertical-align:top}img{max-width:720px;border:1px solid #333}</style>\n${shots.map(name=>`<figure><img src="${name}.png" alt="${name}"><figcaption>${name}</figcaption></figure>`).join('\n')}`);
 fs.writeFileSync(`${dir}/qa.json`,JSON.stringify({checks,shots,metrics},null,1));
 console.log(`PASS bag popup: ${checks.length} checks, ${shots.length} screenshots in ${dir}`);
} catch(error) {
 if(errors.length)console.error('Page errors:',errors);
 throw error;
} finally {
 await browser?.close();server.kill();
}
