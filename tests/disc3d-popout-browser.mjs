// The detail panel's 3D disc pops out into a larger modal (public/disc3d.js, built on the same
// disc3d/viewer.mjs): the Enlarge button or a tap on the canvas opens it; it shows the same model, materials
// and overmold colours, takes the same drag / wheel / pinch / preset / flip / tilt input, and starts from the
// panel's pose and hands its pose back. Escape, the close button or a click outside close it; focus moves in
// and returns to the opener. The panel's own viewer is untouched while it is open. Phones: fits the screen,
// touch rotate and pinch zoom.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/disc3d-popout-browser.mjs   (shots: outputs/disc3d-popout/)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');

const dir='outputs/disc3d-popout';
fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"Frontend test: backend excluded"}');return;}
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
const errors=[];
const check=label=>console.log('ok -',label);

async function open(contextOptions){
 const context=await browser.newContext({deviceScaleFactor:2,...contextOptions});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(m.text());});
 await page.goto(base);
 await page.waitForFunction(()=>typeof filtered!=='undefined'&&filtered.length>0);
 await page.evaluate(()=>document.fonts.ready);
 return {page,context};
}
async function show(page,name){
 const id=await page.evaluate(n=>discs.find(d=>(d.catalogName||d.name)===n&&d.speed!=null)?.id,name);assert.ok(id,name+' is in the catalog');
 await page.evaluate(id=>select(discs.find(d=>d.id===id)),id);
 await page.waitForFunction(id=>{const s=document.querySelector('#detail .disc3d-stage');return s?.dataset.state==='ready'&&s.dataset.disc===id&&Disc3D.viewer?.state.frames>0;},id);
}
const dlg='dialog.disc3d-dialog';
const isOpen=page=>page.evaluate(sel=>!!document.querySelector(sel)?.open,dlg);
const waitOpen=async page=>{await page.waitForFunction(sel=>document.querySelector(sel)?.open&&document.querySelector(sel+' canvas'),dlg);await page.evaluate(()=>Disc3D.popout.debug.renderNow());};
const waitClosed=page=>page.waitForFunction(sel=>!document.querySelector(sel)?.open&&!Disc3D.popout,dlg);
const camera=(page,which='popout')=>page.evaluate(w=>Disc3D[w].debug.camera.position.toArray(),which);
const dist=v=>Math.hypot(...v);
const settle=async page=>{await page.evaluate(()=>Disc3D.popout&&Disc3D.popout.debug.renderNow());await page.waitForTimeout(100);};
const focusInside=page=>page.evaluate(sel=>document.querySelector(sel).contains(document.activeElement),dlg);
// The page behind a modal dialog is inert: Tab may leave for the browser's own UI (nothing focused in the page) but never reaches it.
const focusContained=page=>page.evaluate(sel=>{const a=document.activeElement;return a===document.body||document.querySelector(sel).contains(a);},dlg);
// What a viewer is showing: shape, colours and materials, independent of mesh resolution.
const look=(page,which)=>page.evaluate(w=>{
 const v=Disc3D[w],{body,bodyMaterial,rimMaterial}=v.debug;body.geometry.computeBoundingBox();const b=body.geometry.boundingBox;
 return {diameter:+((b.max.x-b.min.x)).toFixed(4),height:+(b.max.y-b.min.y).toFixed(4),source:v.state.source,overmold:v.state.overmold,colors:v.state.colors,
  plate:'#'+bodyMaterial.color.getHexString(),rim:'#'+rimMaterial.color.getHexString(),materials:[].concat(body.material).length,label:v.debug.renderer.domElement.getAttribute('aria-label')};
},which);

try{
 // Desktop.
 {
  const {page,context}=await open({viewport:{width:1440,height:900}});
  await show(page,'Destroyer');
  assert.equal(await page.locator('#detail [data-disc3d-expand]').count(),1,'the panel viewer offers an Enlarge button');
  assert.equal(await page.locator(dlg).count(),0,'no dialog until it is asked for');
  assert.match(await page.locator('#detail .disc3d-hint').textContent(),/click to enlarge/);
  const panelBox=await page.locator('#detail canvas').boundingBox();
  check('the panel viewer offers Enlarge and builds no dialog until asked');

  const panelBefore=await camera(page,'viewer'),panelLook=await look(page,'viewer');
  await page.locator('#detail [data-disc3d-expand]').click();await waitOpen(page);
  assert.ok(await isOpen(page));
  assert.equal(await page.locator(`${dlg}[aria-labelledby]`).count(),1);
  assert.equal(await page.locator(`${dlg} h2`).textContent(),'Destroyer');
  check('Enlarge opens a modal dialog titled with the disc');

  // Focus moves into the modal; the page behind is inert, so Tab cannot leave.
  assert.ok(await focusInside(page),'focus is inside the dialog');
  assert.equal(await page.evaluate(sel=>document.activeElement===document.querySelector(sel+' canvas'),dlg),true,'focus lands on the 3D canvas');
  for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert.ok(await focusContained(page),'Tab never reaches the page behind (press '+(i+1)+')');}
  await page.locator(`${dlg} canvas`).focus();
  check('focus moves into the dialog and Tab never reaches the page behind');

  // Bigger, and the same disc: same size in 3D, same shape source, materials and caption.
  const big=await page.locator(`${dlg} canvas`).boundingBox();
  assert.ok(big.width>panelBox.width*2&&big.height>panelBox.height*1.8,`the pop-out canvas is much larger (${big.width}x${big.height} vs ${panelBox.width}x${panelBox.height})`);
  const popLook=await look(page,'popout');
  assert.deepEqual({...popLook,label:0},{...panelLook,label:0},'same model, source and materials');
  assert.equal(popLook.label,panelLook.label,'same accessible description');
  assert.equal(await page.locator(`${dlg} .disc3d-dialog-caption`).textContent(),await page.locator('#detail [data-disc3d] .illustration-caption').textContent());
  const frame=await page.evaluate(()=>{ // the whole disc is in frame at the larger size too
   const {camera,body}=Disc3D.popout.debug,pos=body.geometry.attributes.position,v=new camera.position.constructor();body.updateMatrixWorld(true);let m=0;
   for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(body.matrixWorld).project(camera);m=Math.max(m,Math.abs(v.x),Math.abs(v.y));}return m;});
  assert.ok(frame<1,'the disc fits the larger canvas: '+frame);
  await settle(page);await page.screenshot({path:`${dir}/desktop-open.png`});
  check('the pop-out is the same viewer and model, larger, with the whole disc in frame');

  // The panel's viewer is left alone while the dialog is open.
  // Full interaction: drag, wheel, presets, flip, tilt.
  const c0=await camera(page);
  await page.mouse.move(big.x+big.width/2,big.y+big.height/2);await page.mouse.down();
  await page.mouse.move(big.x+big.width/2+120,big.y+big.height/2+40,{steps:8});await page.mouse.up();
  await page.waitForTimeout(400);
  const c1=await camera(page);
  assert.ok(Math.hypot(c1[0]-c0[0],c1[1]-c0[1],c1[2]-c0[2])>1,'drag orbits the camera');
  assert.equal(await page.locator(`${dlg} [data-disc3d-view][aria-pressed=true]`).count(),0,'a drag leaves the presets');
  assert.ok(await isOpen(page),'dragging inside the dialog does not close or reopen it');
  await page.mouse.wheel(0,-500);await page.waitForTimeout(500);
  assert.ok(dist(await camera(page))<dist(c1),'wheel zooms in');
  await page.mouse.wheel(0,1500);await page.waitForTimeout(500);
  assert.ok(dist(await camera(page))>dist(c1)*.95,'wheel zooms back out');
  check('drag turns and the wheel zooms in the pop-out');

  await page.locator(`${dlg} [data-disc3d-view="profile"]`).click();await page.waitForTimeout(800);await settle(page);
  assert.equal(await page.locator(`${dlg} [data-disc3d-view="profile"]`).getAttribute('aria-pressed'),'true');
  assert.ok(Math.abs((await camera(page))[1])<.3,'profile looks from the side');
  await page.screenshot({path:`${dir}/desktop-profile.png`});
  await page.locator(`${dlg} [data-disc3d-view="bottom"]`).click();await page.waitForTimeout(800);await settle(page);
  assert.ok((await camera(page))[1]<0,'bottom looks up from below');
  await page.locator(`${dlg} [data-disc3d-view="top"]`).click();await page.waitForTimeout(800);await settle(page);
  assert.ok(await page.evaluate(()=>{const p=Disc3D.popout.debug.camera.position;return p.y>0&&Math.hypot(p.x,p.z)<.01;}),'top looks straight down');
  await page.locator(`${dlg} [data-disc3d-flip]`).click();await page.waitForTimeout(800);
  assert.ok(await page.evaluate(()=>Math.abs(Disc3D.popout.debug.flipGroup.rotation.x-Math.PI)<1e-6),'flip turns the disc over');
  assert.equal(await page.locator(`${dlg} [data-disc3d-flip]`).getAttribute('aria-pressed'),'true');
  await page.locator(`${dlg} [data-disc3d-flip]`).click();await page.waitForTimeout(800);
  check('Top, Profile, Bottom and Flip work in the pop-out');

  await page.locator(`${dlg} [data-disc3d-view="angle"]`).click();await page.waitForTimeout(800);
  await page.locator(`${dlg} [data-disc3d-tilt]`).fill('30');
  assert.equal(await page.locator(`${dlg} [data-disc3d-tilt-value]`).textContent(),'30° hyzer');
  const rhbh=await page.evaluate(()=>Disc3D.popout.debug.tiltGroup.rotation.z);
  assert.ok(rhbh>0,'RHBH hyzer drops the left edge');
  await page.evaluate(()=>Disc3D.setHand('RHFH'));
  const rhfh=await page.evaluate(()=>Disc3D.popout.debug.tiltGroup.rotation.z);
  assert.ok(Math.abs(rhfh+rhbh)<1e-9,'throwing hand mirrors the tilt in the pop-out');
  await page.evaluate(()=>Disc3D.setHand('RHBH'));
  await page.locator(`${dlg} [data-disc3d-tilt]`).fill('-20');
  assert.equal(await page.locator(`${dlg} [data-disc3d-tilt-value]`).textContent(),'20° anhyzer');
  await settle(page);await page.screenshot({path:`${dir}/desktop-anhyzer.png`});
  // Keyboard: arrows turn, + zooms.
  await page.locator(`${dlg} canvas`).focus();
  const k0=await camera(page);await page.keyboard.press('ArrowRight');await page.keyboard.press('+');
  const k1=await camera(page);
  assert.ok(dist(k1)<dist(k0)-.3&&Math.abs(k1[0]-k0[0])>.3,'arrow keys turn and + zooms');
  check('tilt follows the throwing hand; arrows and + work from the keyboard');

  // The panel's viewer did not move while the dialog was in use.
  assert.deepEqual(await camera(page,'viewer'),panelBefore,'the panel viewer is untouched while the pop-out is open');
  assert.equal(await page.locator('#detail [data-disc3d-tilt-value]').textContent(),'Flat');
  check('the panel viewer is untouched while the pop-out is open');

  // Escape closes; focus returns to the opener; the pop-out's WebGL context is released.
  await page.evaluate(()=>{window.__popRenderer=Disc3D.popout.debug.renderer;});
  await page.keyboard.press('Escape');await waitClosed(page);
  assert.equal(await page.locator(`${dlg} canvas`).count(),0,'the pop-out viewer is removed');
  assert.equal(await page.evaluate(()=>window.__popRenderer.getContext().isContextLost()),true,'its WebGL context is released');
  assert.equal(await page.evaluate(()=>document.activeElement.matches('[data-disc3d-expand]')),true,'focus returns to the Enlarge button');
  assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),'','page scrolling is restored');
  assert.equal(await page.locator('#detail').isVisible(),true,'Escape closed only the pop-out, not the detail panel');
  check('Escape closes the pop-out, frees its context and returns focus to the Enlarge button');

  // The pose came back: the last tilt, the arrow-key turn and zoom.
  assert.equal(await page.locator('#detail [data-disc3d-tilt-value]').textContent(),'20° anhyzer','tilt handed back to the panel');
  assert.equal(await page.locator('#detail [data-disc3d-view][aria-pressed=true]').count(),0);
  // And the panel still works exactly as before.
  await page.locator('#detail [data-disc3d-view="profile"]').click();await page.waitForTimeout(750);
  assert.equal(await page.locator('#detail [data-disc3d-view="profile"]').getAttribute('aria-pressed'),'true');
  await page.locator('#detail [data-disc3d-tilt]').fill('0');
  check('the pop-out hands its pose back, and the panel viewer keeps working');

  // Reopen: starts from the panel's pose (profile view), with the same state.
  await page.locator('#detail [data-disc3d-expand]').click();await waitOpen(page);
  assert.equal(await page.locator(`${dlg} [data-disc3d-view="profile"]`).getAttribute('aria-pressed'),'true','opens in the view the panel was in');
  assert.equal(await page.locator(`${dlg} [data-disc3d-tilt-value]`).textContent(),'Flat');

  // The × button closes.
  await page.locator(`${dlg} [data-disc3d-close]`).click();await waitClosed(page);
  assert.equal(await page.evaluate(()=>document.activeElement.matches('[data-disc3d-expand]')),true);
  check('the close button closes and returns focus');

  // A click outside the panel closes; a drag that merely ends outside it does not.
  await page.locator('#detail [data-disc3d-expand]').click();await waitOpen(page);
  const box=await page.locator(`${dlg} canvas`).boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.mouse.move(2,2,{steps:6});await page.mouse.up();
  await page.waitForTimeout(150);
  assert.ok(await isOpen(page),'a drag released over the backdrop does not close the dialog');
  await page.mouse.click(2,450);await waitClosed(page);
  assert.equal(await page.evaluate(()=>document.activeElement.matches('[data-disc3d-expand]')),true);
  check('clicking outside closes; a drag that ends outside does not');

  // A tap on the canvas (press and release without moving) opens it too; a drag does not. Focus returns to the canvas.
  const pbox=await page.locator('#detail canvas').boundingBox();
  await page.mouse.move(pbox.x+pbox.width/2,pbox.y+pbox.height/2);await page.mouse.down();
  await page.mouse.move(pbox.x+pbox.width/2+60,pbox.y+pbox.height/2+20,{steps:6});await page.mouse.up();
  await page.waitForTimeout(300);
  assert.equal(await isOpen(page),false,'dragging the panel viewer does not open the pop-out');
  await page.mouse.click(pbox.x+pbox.width/2,pbox.y+pbox.height/2);await waitOpen(page);
  await page.keyboard.press('Escape');await waitClosed(page);
  assert.equal(await page.evaluate(()=>document.activeElement===document.querySelector('#detail canvas')),true,'focus returns to the canvas that was clicked');
  check('a click on the canvas pops it out; a drag only turns it');

  // Wheel over the panel viewer still zooms it and never opens the pop-out.
  await page.mouse.wheel(0,-300);await page.waitForTimeout(300);
  assert.equal(await isOpen(page),false);

  // An overmold with custom colours is the same in the pop-out: two materials, same colours.
  await show(page,'Envy');
  const id=await page.evaluate(()=>document.querySelector('#detail .disc3d-stage').dataset.disc);
  await page.evaluate(async id=>{Disc3D.sync(document.querySelector('#detail'),discs.find(x=>x.id===id),{color:'#d94f2b',colors:{rim:'#2b6cd9',plate:'#f5f5f5'},hand:'RHBH'});await new Promise(r=>setTimeout(r,0));},id);
  const envy=await look(page,'viewer');
  assert.equal(envy.overmold,true);assert.deepEqual(envy.colors,{rim:'#2b6cd9',plate:'#f5f5f5'});
  await page.locator('#detail [data-disc3d-expand]').click();await waitOpen(page);
  const envyBig=await look(page,'popout');
  assert.deepEqual({...envyBig,label:0},{...envy,label:0},'overmold model and custom colours carry over');
  assert.equal(envyBig.materials,2);assert.match(envyBig.label,/overmold rim/);
  await page.locator(`${dlg} [data-disc3d-view="top"]`).click();await page.waitForTimeout(800);await settle(page);
  await page.screenshot({path:`${dir}/desktop-envy-custom-top.png`});
  // The theme follows: with no colour override the default rim changes between light and dark.
  await page.keyboard.press('Escape');await waitClosed(page);
  await page.evaluate(async id=>{Disc3D.sync(document.querySelector('#detail'),discs.find(x=>x.id===id),{color:'#d94f2b',hand:'RHBH'});await new Promise(r=>setTimeout(r,0));},id);
  await page.locator('#detail [data-disc3d-expand]').click();await waitOpen(page);
  const themeOf=()=>page.evaluate(()=>({theme:document.documentElement.dataset.theme||'',rim:Disc3D.popout.state.colors.rim,panel:getComputedStyle(document.querySelector('dialog.disc3d-dialog')).backgroundColor}));
  const t0=await themeOf();
  await page.evaluate(t=>{document.documentElement.dataset.theme=t==='light'?'dark':'light';window.dispatchEvent(new CustomEvent('atlas-theme-change',{detail:document.documentElement.dataset.theme}));},t0.theme);
  await page.waitForTimeout(200);
  const t1=await themeOf();
  assert.notEqual(t1.rim,t0.rim,'the default overmold rim follows the theme in the pop-out');
  assert.notEqual(t1.panel,t0.panel,'the dialog follows the theme');
  await settle(page);await page.screenshot({path:`${dir}/desktop-theme-${t1.theme}.png`});
  await page.evaluate(t=>{document.documentElement.dataset.theme=t;window.dispatchEvent(new CustomEvent('atlas-theme-change',{detail:t}));},t0.theme);
  await page.keyboard.press('Escape');await waitClosed(page);
  check('overmold two-tone and custom colours carry over; the pop-out follows the theme');

  // Opening and closing repeatedly leaves no dialog viewer or open context behind.
  for(let i=0;i<4;i++){await page.locator('#detail [data-disc3d-expand]').click();await waitOpen(page);await page.keyboard.press('Escape');await waitClosed(page);}
  assert.equal(await page.locator('dialog.disc3d-dialog').count(),1,'one dialog element is reused');
  assert.equal(await page.locator(`${dlg} canvas`).count(),0);
  check('repeated open and close reuses one dialog and leaves no viewer behind');
  await context.close();
 }

 // Phone: touch rotate and pinch zoom, fits the viewport.
 {
  const {page,context}=await open({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await show(page,'Destroyer');
  assert.ok(await page.evaluate(()=>matchMedia('(pointer: coarse)').matches),'touch emulation is coarse');
  assert.match(await page.locator('#detail .disc3d-hint').textContent(),/tap to enlarge/);
  const cdp=await context.newCDPSession(page);
  const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map((p,i)=>({x:p[0],y:p[1],id:i}))});
  const center=async sel=>{const b=await page.locator(sel).boundingBox();return [b.x+b.width/2,b.y+b.height/2,b];};

  // A fresh open frames the whole disc at the phone's portrait aspect.
  await page.locator('#detail [data-disc3d-expand]').tap();await waitOpen(page);
  const fresh=await page.evaluate(()=>{const {camera,body}=Disc3D.popout.debug,pos=body.geometry.attributes.position,v=new camera.position.constructor();body.updateMatrixWorld(true);let m=0;
   for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(body.matrixWorld).project(camera);m=Math.max(m,Math.abs(v.x),Math.abs(v.y));}return m;});
  assert.ok(fresh<1,'a fresh phone pop-out frames the whole disc: '+fresh);
  await page.waitForTimeout(300);await page.screenshot({path:`${dir}/phone-fresh.png`});
  await page.locator(`${dlg} [data-disc3d-close]`).tap();await waitClosed(page);
  check('phone: a fresh pop-out frames the whole disc');

  // A tap on the panel viewer opens it; a pinch or a drag on it does not.
  await page.locator('#detail canvas').scrollIntoViewIfNeeded();
  const [px,py]=await center('#detail canvas');
  await page.touchscreen.tap(px,py);await waitOpen(page);
  await page.locator(`${dlg} [data-disc3d-close]`).tap();await waitClosed(page);
  await page.locator('#detail canvas').scrollIntoViewIfNeeded();
  const [qx,qy]=await center('#detail canvas');
  await touch('touchStart',[[qx-30,qy],[qx+30,qy]]);await touch('touchMove',[[qx-60,qy],[qx+60,qy]]);await touch('touchEnd',[]);
  await page.waitForTimeout(300);
  assert.equal(await isOpen(page),false,'pinching the panel viewer does not open the pop-out');
  await touch('touchStart',[[qx,qy]]);await touch('touchMove',[[qx+40,qy+10]]);await touch('touchEnd',[]);
  await page.waitForTimeout(300);
  assert.equal(await isOpen(page),false,'dragging the panel viewer does not open the pop-out');
  // Open it again for the rest (the pinch above zoomed the panel viewer, and the pop-out starts from that).
  await page.evaluate(()=>Disc3D.open());await waitOpen(page);
  check('on a phone a tap opens the pop-out; a pinch or a drag only moves the disc');

  // It fits the viewport and its controls are reachable.
  const vp=page.viewportSize(),d=await page.locator(dlg).boundingBox();
  assert.ok(d.x>=0&&d.y>=0&&d.x+d.width<=vp.width+.5&&d.y+d.height<=vp.height+.5,'the dialog fits the screen: '+JSON.stringify(d));
  assert.ok(d.width>=vp.width-20&&d.height>=vp.height-20,'and uses nearly all of it');
  for(const sel of ['.disc3d-toolbar','.disc3d-tilt','[data-disc3d-close]','.disc3d-views']){
   const b=await page.locator(`${dlg} ${sel}`).first().boundingBox();
   assert.ok(b.x>=d.x-.5&&b.x+b.width<=d.x+d.width+.5&&b.y>=d.y-.5&&b.y+b.height<=d.y+d.height+.5,sel+' sits inside the dialog');
  }
  const closeBox=await page.locator(`${dlg} [data-disc3d-close]`).boundingBox();
  assert.ok(closeBox.width>=43.9&&closeBox.height>=43.9,'close target is at least 44px: '+JSON.stringify(closeBox));
  for(const b of await page.locator(`${dlg} .disc3d-toolbar button`).all()){const bb=await b.boundingBox();assert.ok(bb.height>=44,'toolbar buttons are touch-sized: '+bb.height);}
  const vbox=await page.locator(`${dlg} .disc3d-viewport`).boundingBox();
  assert.ok(vbox.height>250&&vbox.width>330,`a roomy canvas: ${vbox.width}x${vbox.height}`);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal overflow');
  await page.evaluate(()=>Disc3D.popout.debug.renderNow());await page.waitForTimeout(150);
  await page.screenshot({path:`${dir}/phone-open.png`});
  check(`phone: the pop-out fits the screen (${Math.round(d.width)}x${Math.round(d.height)}) with touch-sized controls`);

  // Touch rotate and pinch zoom.
  const [cx,cy]=await center(`${dlg} canvas`);
  const t0=await camera(page);
  await touch('touchStart',[[cx,cy]]);
  for(let i=1;i<=8;i++)await touch('touchMove',[[cx+i*14,cy+i*5]]);
  await touch('touchEnd',[]);await page.waitForTimeout(500);
  const t1=await camera(page);
  assert.ok(Math.hypot(t1[0]-t0[0],t1[1]-t0[1],t1[2]-t0[2])>1,'a one-finger drag rotates');
  assert.ok(await isOpen(page),'rotating by touch does not close the pop-out');
  await touch('touchStart',[[cx-20,cy],[cx+20,cy]]);
  for(let i=1;i<=8;i++)await touch('touchMove',[[cx-20-i*9,cy],[cx+20+i*9,cy]]);
  await touch('touchEnd',[]);await page.waitForTimeout(600);
  const t2=await camera(page);
  assert.ok(dist(t2)<dist(t1)-.5,`a pinch out zooms in (${dist(t1).toFixed(1)} -> ${dist(t2).toFixed(1)})`);
  assert.ok(await isOpen(page));
  await touch('touchStart',[[cx-110,cy],[cx+110,cy]]);
  for(let i=1;i<=8;i++)await touch('touchMove',[[cx-110+i*10,cy],[cx+110-i*10,cy]]);
  await touch('touchEnd',[]);await page.waitForTimeout(600);
  assert.ok(dist(await camera(page))>dist(t2)+.5,'a pinch in zooms out');
  check('phone: one finger rotates, two fingers pinch zoom');

  // Buttons by touch; close by touch returns focus.
  await page.locator(`${dlg} [data-disc3d-view="top"]`).tap();await page.waitForTimeout(800);
  assert.equal(await page.locator(`${dlg} [data-disc3d-view="top"]`).getAttribute('aria-pressed'),'true');
  await page.locator(`${dlg} [data-disc3d-close]`).tap();await waitClosed(page);
  assert.equal(await page.evaluate(()=>document.activeElement.matches('[data-disc3d-expand]')),true,'focus returns to the Enlarge button');
  assert.equal(await page.locator('#detail [data-disc3d-view="top"]').getAttribute('aria-pressed'),'true','the panel took the pop-out\'s Top view back');
  // The Enlarge button works by touch too.
  await page.locator('#detail [data-disc3d-expand]').tap();await waitOpen(page);
  assert.ok(await focusInside(page));
  await page.locator(`${dlg} [data-disc3d-close]`).tap();await waitClosed(page);
  assert.equal(await page.evaluate(()=>document.activeElement.matches('[data-disc3d-expand]')),true);
  check('phone: presets and close by touch; focus returns to the opener');

  // Landscape: the controls still fit.
  await page.setViewportSize({width:844,height:390});await page.waitForTimeout(200);
  await page.locator('#detail [data-disc3d-expand]').scrollIntoViewIfNeeded();
  await page.evaluate(()=>Disc3D.open());await waitOpen(page);
  const ld=await page.locator(dlg).boundingBox(),lv=await page.locator(`${dlg} .disc3d-viewport`).boundingBox(),ltilt=await page.locator(`${dlg} .disc3d-tilt`).boundingBox();
  assert.ok(ld.y>=0&&ld.y+ld.height<=390.5&&ltilt.y+ltilt.height<=ld.y+ld.height+.5,'landscape: controls fit the screen');
  assert.ok(lv.height>=120,'landscape: the disc keeps some height: '+lv.height);
  await page.evaluate(()=>Disc3D.popout.debug.renderNow());await page.waitForTimeout(150);
  await page.screenshot({path:`${dir}/phone-landscape.png`});
  await page.evaluate(()=>Disc3D.close());await waitClosed(page);
  check(`phone landscape: controls fit and the disc keeps ${Math.round(lv.height)}px of height`);
  await context.close();
 }

 const real=errors.filter(e=>!/Frontend test: backend excluded|status of 503|Failed to load resource/.test(e));
 assert.deepEqual(real,[],'no page errors');
 check('no page errors');
}finally{
 await browser.close();server.close();
}
