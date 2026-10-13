// Findings 1–3: camera continuity, catch taps, shared theme transitions. Touch is emulated;
// this does not replace a real-phone feel test. Uses the same local frontend as the Atlas suites.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=url.pathname==='/'?'web/index.html':url.pathname==='/account-settings'?'public/account-page.html':'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{}');return;}
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream'});res.end(data);}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--use-angle=d3d11','--enable-gpu']});
const errors=[],checks=[];
const check=label=>{checks.push(label);console.log('ok - '+label);};
async function open(route='/',options={}){
 const context=await browser.newContext({viewport:{width:1440,height:900},...options});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+route);await page.evaluate(()=>document.fonts.ready);
 if(route==='/')await page.waitForFunction(()=>filtered.length&&mapClusters.length);
 return page;
}
async function show(page){
 await page.mouse.move(1,1);
 await page.evaluate(()=>{stopCamera();selected=null;closeDetail(false);zoom=3;pan={x:-650,y:450};draw();});
 await page.waitForTimeout(700);
}
const marker=page=>page.evaluate(()=>{
 for(const node of document.querySelectorAll('#mapMarkers [data-cluster]')){
  const r=node.querySelector('.disc-art').getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
  if(x>370&&x<innerWidth-150&&y>180&&y<innerHeight-240&&document.elementFromPoint(x,y)?.closest('[data-cluster]')===node)return {x,y,id:node.dataset.cluster};
 }
 throw Error('No unobscured marker');
});
try{
 if(!process.argv.includes('--catch')&&!process.argv.includes('--themes')){
  const page=await open('/',{hasTouch:true});await show(page);
  const cdp=await page.context().newCDPSession(page);
  const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([id,x,y])=>({id,x,y})),modifiers:0});
  const before=await page.evaluate(()=>({zoom,x:pan.x,y:pan.y}));
  await touch('touchStart',[[1,600,350],[2,800,350]]);
  await touch('touchMove',[[1,620,365],[2,820,365]]);
  const after=await page.evaluate(()=>({zoom,x:pan.x,y:pan.y}));
  assert.ok(Math.abs(after.zoom-before.zoom)<.001,'Parallel fingers do not zoom');
  assert.ok(Math.abs(after.x-before.x-20)<.1&&Math.abs(after.y-before.y-15)<.1,`Parallel fingers pan 1:1 (${JSON.stringify({before,after})})`);
  await touch('touchEnd',[]);await page.waitForFunction(()=>!cameraTween);
  check('Two parallel fingers pan 1:1 in touch emulation');
  await show(page);
  await touch('touchStart',[[1,600,350],[2,800,350]]);
  for(let i=1;i<=4;i++){
   await page.waitForTimeout(16);await touch('touchMove',[[1,600-i*5,350],[2,800+i*5,350]]);
  }
  const release=await page.evaluate(()=>zoom);await touch('touchEnd',[]);
  await page.waitForTimeout(60);
  assert.ok(await page.evaluate(z=>zoom>z+.005,release),'Pinch release continues zoom momentum');
  await page.waitForFunction(()=>!cameraTween);
  check('Pinch release hands zoom momentum to the camera');
  await show(page);
  await page.evaluate(()=>{
   const target=document.querySelector('#mapMarkers [data-cluster]');
   const send=(type,id,x)=>target.dispatchEvent(new PointerEvent(type,{bubbles:true,button:0,pointerId:id,pointerType:'touch',clientX:x,clientY:350}));
   send('pointerdown',101,600);send('pointerdown',102,800);send('pointerdown',103,900);
   send('pointercancel',103,900);send('pointermove',101,610);
   send('pointercancel',101,610);send('pointerup',102,800);
  });
  assert.equal(await page.evaluate(()=>!!cameraTween),false,'A cancelled pinch does not throw on the final lift');
  check('Extra fingers are ignored; cancelled pinches do not throw or resume momentum');
  await show(page);
  const handoff=await page.evaluate(async()=>{
   animateZoom(1.3,{x:700,y:350});
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   const before=cameraSpring.velocity.zoom;
   animateZoom(1.03,{x:700,y:350});
   return {before,after:cameraSpring.velocity.zoom};
  });
  assert.ok(handoff.before>0);assert.equal(handoff.after,handoff.before,'Wheel retargeting inherits current velocity');
  assert.equal(await page.evaluate(()=>artZooming()),true,'The existing LOD hold stays active during the spring');
  await page.waitForFunction(()=>!cameraTween);
  check('Wheel retargeting preserves velocity rather than restarting an ease');
  await page.waitForTimeout(220);
  assert.equal(await page.evaluate(()=>artZooming()),false,'The existing LOD hold settles after the camera stops');
  check('Spring motion preserves the existing LOD hold and 180ms settle');
  await show(page);await page.mouse.move(600,350);await page.mouse.down();
  await page.evaluate(()=>document.querySelector('#map').addEventListener('pointerup',()=>{
   window.lastThrow={x:pan.x,target:cameraDestination?.x,v:cameraSpring.velocity.x,width:mapViewport.width};
  },{once:true}));
  for(let i=1;i<=6;i++){await page.waitForTimeout(8);await page.mouse.move(600+i*35,350);}
  await page.mouse.up();
  const throwState=await page.evaluate(()=>lastThrow);
  assert.ok(throwState.target-throwState.x>70,`A hard flick has a longer projected throw (${JSON.stringify(throwState)})`);
  assert.ok(throwState.target-throwState.x<=throwState.width,'Throw is capped by the viewport');
  const catchAt=await marker(page);await page.mouse.click(catchAt.x,catchAt.y);
  assert.equal(await page.evaluate(()=>selected),null,'Catching a real flick on a marker does not select');
  assert.equal(await page.evaluate(()=>!!cameraTween),false,'Catching a flick stops immediately');
  const rest=await page.evaluate(()=>pan.x);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>pan.x),rest,'Spring sleeps at rest');
  check('Flick projects a capped throw; catching on a marker stops without selecting');
  await page.emulateMedia({reducedMotion:'reduce'});
  // Batch 3 (finding 10) supersedes batch 1 here: reduced motion no longer teleports the camera. It eases to its
  // target over 150 ms with no spring travel and no overshoot.
  const calm=await page.evaluate(()=>new Promise(done=>{
   const start=zoom,target=Math.min(MAX_MAP_ZOOM,start*1.2),rows=[];animateZoom(1.2);const t0=performance.now();
   const tick=()=>{rows.push({t:performance.now()-t0,zoom,velocity:cameraSpring.velocity.zoom,moving:!!cameraTween});if(cameraTween&&performance.now()-t0<1200)requestAnimationFrame(tick);else done({start,target,rows,end:zoom});};tick();
  }));
  assert.ok(calm.rows.length>1&&calm.rows[0].moving,'Reduced motion camera eases instead of jumping');
  assert.ok(calm.rows.every((r,i)=>i===0||r.zoom>=calm.rows[i-1].zoom-1e-9)&&calm.rows.every(r=>r.zoom<=calm.target+1e-9),'with no overshoot');
  assert.ok(calm.rows.every(r=>r.velocity===0),'and no spring velocity');
  assert.ok(Math.abs(calm.end-calm.target)<1e-6,'landing exactly on the target');
  assert.ok(calm.rows.at(-1).t<=400,`in a short time (${Math.round(calm.rows.at(-1).t)} ms)`);
  check('Reduced motion eases the camera over 150 ms: no spring travel, no overshoot');
  await page.context().close();
 }
 if(!process.argv.includes('--themes')&&!process.argv.includes('--camera')){
  for(const touch of [false,true]){
   const page=await open('/',{hasTouch:touch});await show(page);
   await page.evaluate(()=>tweenCamera({zoom,x:pan.x+100,y:pan.y}));
   await page.waitForTimeout(25);
   const p=await marker(page);
   if(touch)await page.touchscreen.tap(p.x,p.y);else await page.mouse.click(p.x,p.y);
   assert.equal(await page.evaluate(()=>selected),null,'A tap catching camera motion must not select');
   assert.equal(await page.evaluate(()=>!!cameraTween),false,'Pointerdown catches motion');
   const still=await marker(page);
   if(touch)await page.touchscreen.tap(still.x,still.y);else await page.mouse.click(still.x,still.y);
   assert.equal(await page.evaluate(()=>selected?.id),still.id,'A stationary marker still selects');
   await page.evaluate(()=>{selected=null;closeDetail(false);});
   await page.locator(`[data-cluster="${still.id}"]`).focus();await page.keyboard.press('Enter');
   assert.equal(await page.evaluate(()=>selected?.id),still.id,'Keyboard activation still selects after a catch');
   check(`${touch?'touch':'mouse'}: catch suppresses selection; next stationary tap selects`);
   await page.context().close();
  }
 }
 if(!process.argv.includes('--catch')&&!process.argv.includes('--camera')){
  for(const route of ['/','/about.html','/account-settings'])for(const fallback of [false,true]){
   const page=await open(route);
   await page.evaluate(fallback=>{
    window.themeTransitions=[];
    if(fallback)document.startViewTransition=undefined;
    else{const start=document.startViewTransition.bind(document);document.startViewTransition=(...args)=>{const t=start(...args);themeTransitions.push(t);return t;};}
   },fallback);
   const choose=async value=>{
    // About now shares Account's icon toggle and menu (batch 3), so every route chooses through the site menu.
    if(!await page.locator('#siteMenu').isVisible())await page.locator('#siteMenuButton').click();
    await page.locator(`[data-theme-choice="${value}"]`).click();
   };
   for(const from of ['light','midnight','charcoal','black']){
    await choose(from);
    await page.waitForFunction(v=>document.documentElement.dataset.theme===v&&!document.documentElement.classList.contains('theme-switching'),from);
    for(const to of ['light','midnight','charcoal','black'].filter(v=>v!==from)){
     await choose(to);
     assert.ok(await page.evaluate(()=>document.documentElement.classList.contains('theme-switching')),'Theme change is scoped');
     if(!fallback){
      await page.evaluate(()=>themeTransitions.at(-1).ready);
      assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement,'::view-transition-new(root)').animationDuration),'0.24s');
     }
     await page.waitForFunction(v=>document.documentElement.dataset.theme===v&&!document.documentElement.classList.contains('theme-switching'),to);
     assert.equal(await page.evaluate(()=>localStorage.getItem('disc-atlas-theme')),to);
     await choose(from);await page.waitForFunction(v=>document.documentElement.dataset.theme===v&&!document.documentElement.classList.contains('theme-switching'),from);
    }
   }
   if(fallback){
    await choose('light');await page.waitForFunction(()=>!document.documentElement.classList.contains('theme-switching'));
    await choose('black');await page.waitForFunction(()=>document.documentElement.dataset.theme==='black');
    await page.waitForTimeout(30);
    const backdrop=await page.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor);
    await choose('midnight');
    assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).backgroundColor),backdrop,'Retargeting a fallback retains its visible backdrop');
    await page.waitForFunction(()=>!document.documentElement.classList.contains('theme-switching'));
   }
   // Latest input wins even before a native snapshot's asynchronous update callback.
   await page.evaluate(()=>{
    for(const value of ['midnight','light','black']){
     const select=document.querySelector('[data-theme-select]');
     if(select){select.value=value;select.dispatchEvent(new Event('change'));}
     else document.querySelector(`[data-theme-choice="${value}"]`).click();
    }
   });
   await page.waitForFunction(()=>document.documentElement.dataset.theme==='black'&&!document.documentElement.classList.contains('theme-switching'));
   await page.emulateMedia({reducedMotion:'reduce'});
   // Batch 3 (finding 10) supersedes batch 1: reduced motion keeps the theme change as a short opacity cross-fade
   // (the same View Transition or opacity fallback, 150 ms) instead of swapping instantly.
   const count=await page.evaluate(()=>themeTransitions.length);await choose('light');
   assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('theme-calm')),true,'Reduced motion marks its theme change calm');
   if(!fallback)assert.equal(await page.evaluate(()=>themeTransitions.length),count+1,'and still runs the cross-fade');
   await page.waitForFunction(()=>document.documentElement.dataset.theme==='light'&&!document.documentElement.classList.contains('theme-switching'));
   check(`${route}: all 12 theme pairs, rapid changes and reduced motion (${fallback?'opacity fallback':'native snapshots'})`);
   await page.context().close();
  }
  const page=await open('/about.html',{colorScheme:'light'});
  assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('theme-switching')),false,'Initial pre-paint theme is instant');
  await page.emulateMedia({colorScheme:'dark'});
  await page.waitForFunction(()=>document.documentElement.dataset.theme==='midnight'&&!document.documentElement.classList.contains('theme-switching'));
  assert.equal(await page.evaluate(()=>localStorage.getItem('disc-atlas-theme')),null,'System follow stays unsaved');
  await page.locator('#siteMenuButton').click();await page.locator('[data-theme-choice="charcoal"]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.theme==='charcoal'&&!document.documentElement.classList.contains('theme-switching'));
  await page.emulateMedia({colorScheme:'light'});
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'charcoal','Explicit choice stops following system');
  check('System follow transitions without saving; initial apply stays instant');await page.context().close();
 }
 assert.deepEqual(errors,[],'No page errors');
 console.log(`${checks.length} checks passed.`);
}finally{await browser.close();server.close();}
