import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// My Bag (Oct 6): a collapsible putter pocket and drag-to-spin.
// Pocket: the "Putter pocket" button beside Top view slides every putter down into the top pocket
// and back up into its row, with the bag left open the whole time; a putter that is out goes home
// first, then the row goes down. The choice holds through closing and opening the bag.
// Spin: a horizontal drag spins the bag from anywhere on it (discs included), with momentum on a
// flick and none after holding still; it holds the angle it is left at. A press that barely moves
// is still a tap (the disc toggles), and a press on a coasting bag catches it. Mouse and touch.
// Runs on the signed-out demo bag (no account needed).
const config='tests/auth.wrangler.jsonc',state='work/bag-spin-pocket/d1-qa',base='https://localhost:8812',dir='outputs/bag-spin-pocket';
fs.rmSync(dir,{recursive:true,force:true});
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8812','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const errors=[],shots=[],checks=[],metrics={};
const check=label=>{checks.push(label);console.log('ok -',label);};
const THEMES=['midnight','light','charcoal'];
try {
 const deadline=Date.now()+45000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});

 // Helpers bound to a page (desktop or phone).
 const tools=page=>{
  const viewer=(fn,arg)=>page.locator('[data-bag-canvas]').evaluate((n,[source,value])=>new Function('v','arg',`return (${source})(v,arg)`)(n.bagViewer,value),[fn.toString(),arg]);
  const scene=page.locator('#bagScene'),detail=page.locator('#detail'),slot=id=>page.locator(`[data-physical-disc="${id}"]`),pocket=page.locator('[data-bag-pocket]');
  const setTheme=theme=>page.evaluate(t=>document.querySelector(`[data-theme-choice="${t}"]`).click(),theme);
  const settled=()=>page.waitForFunction(()=>{const s=document.querySelector('#bagScene'),v=s.querySelector('[data-bag-canvas]').bagViewer;return !v.stage.moving && !v.turning && v.puttersSettled && (s.dataset.staging===undefined || s.dataset.staging==='still') && s.dataset.putterPocket!=='moving' && !s.querySelector('[data-bag-canvas]').getAnimations().length;},null,{timeout:15000});
  const outIds=()=>viewer(v=>v.outDiscs);
  const openBag=async()=>{await page.goto(base+'/?bag=1');await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s.dataset.engine==='ready' && s.dataset.phase==='open';},null,{timeout:30000});await scene.scrollIntoViewIfNeeded();await page.mouse.move(2,2).catch(()=>{});await settled();};
  const stageBox=()=>page.locator('.bag-3d-stage canvas').boundingBox();
  const center=async locator=>{const b=await locator.boundingBox();return {x:b.x+b.width/2,y:b.y+b.height/2};};
  const putters=()=>viewer(v=>v.getBagLayoutState().filter(d=>d.pocket==='putter' && !d.empty).map(d=>({id:d.id,pose:d.pose,rise:d.rise,slide:d.slide})));
  const mainPoses=()=>viewer(v=>Object.fromEntries(v.getBagLayoutState().filter(d=>d.pocket==='main' && !d.empty).map(d=>[d.id,d.pose])));
  // The turn the bag had at the moment the pointer let go (read before the viewer handles the release).
  const armRelease=()=>page.evaluate(()=>{window.releaseTurn=null;document.addEventListener('pointerup',()=>{window.releaseTurn=document.querySelector('[data-bag-canvas]').bagViewer.turn;},{capture:true,once:true});});
  // Every frame: the turn, the coast and the putters (rise, slide, pose), and the flap.
  const startSampling=()=>page.locator('[data-bag-canvas]').evaluate(n=>{const s=n.samples=[];n.sampling=true;const tick=()=>{const v=n.bagViewer,state=v.getBagLayoutState();s.push({t:performance.now(),turn:v.turn,spinning:v.spinning,velocity:v.spinVelocity,flap:v.compartmentProgress,phase:document.querySelector('#bagScene').dataset.phase,
   putters:Object.fromEntries(state.filter(d=>d.pocket==='putter' && !d.empty).map(d=>[d.id,{rise:d.rise,slide:d.slide,pose:d.pose}]))});if(n.sampling)requestAnimationFrame(tick);};requestAnimationFrame(tick);});
  const stopSampling=()=>page.locator('[data-bag-canvas]').evaluate(n=>{n.sampling=false;return n.samples;});
  const shot=async name=>{await page.mouse.move(2,2).catch(()=>{});await page.evaluate(()=>{document.activeElement?.blur?.();return document.fonts.ready;});await page.waitForTimeout(350);await scene.screenshot({path:`${dir}/${name}.png`});shots.push(name);};
  return {viewer,scene,detail,slot,pocket,setTheme,settled,outIds,openBag,stageBox,center,putters,mainPoses,armRelease,startSampling,stopSampling,shot};
 };
 const t=tools(page),{viewer,scene,detail,slot,pocket,settled,outIds,openBag,stageBox,center,putters,mainPoses,armRelease,startSampling,stopSampling}=t;
 const flick=async(x,y,dx,{hold=0,steps=6}={})=>{await armRelease();await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+dx,y+2,{steps});if(hold)await page.waitForTimeout(hold);await page.mouse.up();};
 const closeDetails=async()=>{if(await detail.isVisible()){await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});}await page.mouse.move(2,2);await settled();};

 await page.emulateMedia({reducedMotion:'no-preference'});
 await openBag();await t.setTheme('midnight');await settled();
 const reachable=await page.locator('[data-physical-disc][tabindex="0"]').evaluateAll(l=>l.map(n=>[n.dataset.physicalDisc,n.dataset.pocket]));
 const mains=reachable.filter(([,p])=>p==='main').map(([id])=>id);
 const putterIds=(await page.locator('[data-physical-disc][data-pocket="putter"]').evaluateAll(l=>l.map(n=>n.dataset.physicalDisc)));
 assert.ok(mains.length>=10 && putterIds.length===4,'Demo bag: main discs and four putters');

 // ── Spin ──────────────────────────────────────────────────────────────────────────────────────
 // 1. A tap on a disc still toggles it, even with a few pixels of wobble; a drag that starts on a
 // disc spins the bag instead and leaves the disc in its pocket.
 const disc=mains[3];
 {const c=await center(slot(disc));await page.mouse.move(c.x,c.y);await page.mouse.down();await page.mouse.move(c.x+4,c.y+1,{steps:2});await page.mouse.up();}
 await settled();assert.deepEqual(await outIds(),[disc],'A press that moves 4 px is a tap: the disc slides out');
 await detail.waitFor({state:'visible'});await closeDetails();
 await slot(disc).click();await settled();await closeDetails();assert.deepEqual(await outIds(),[],'A second tap puts it back');
 assert.equal(await viewer(v=>v.turn),0,'Taps never turn the bag');
 {
  const c=await center(slot(disc));await flick(c.x,c.y,80,{hold:180});await settled();
  const turn=await viewer(v=>v.turn);
  assert.ok(turn>.6,'A drag that starts on a disc spins the bag: '+turn);
  assert.deepEqual(await outIds(),[],'…and does not toggle the disc');assert.equal(await detail.isVisible(),false,'…or open its details');
  assert.equal(await scene.getAttribute('data-phase'),'open','…or toggle the flap');
  metrics.dragOnDisc=+turn.toFixed(3);
 }
 check(`Tap vs drag: a 4 px press on a disc still toggles it (and opens its details); a drag starting on the disc spins the bag ${metrics.dragOnDisc} rad and leaves the disc, its details and the flap alone`);

 // 2. A flick coasts: the bag keeps turning the same way after release, slowing smoothly to a stop,
 // and then holds that angle.
 // An empty spot on the canvas (lower left), measured fresh: the canvas widens and the page may scroll.
 const empty=async()=>{await scene.scrollIntoViewIfNeeded();const box=await stageBox();return [box.x+box.width*.1,box.y+box.height*.8];};
 {
  const start=await viewer(v=>v.turn);
  await startSampling();await flick(...await empty(),140,{steps:5});
  await page.waitForFunction(()=>!document.querySelector('[data-bag-canvas]').bagViewer.turning,null,{timeout:8000});
  const samples=await stopSampling(),release=await page.evaluate(()=>window.releaseTurn),end=await viewer(v=>v.turn);
  const coast=samples.filter(s=>s.spinning);
  assert.ok(release>start+1,'The drag itself turns the bag');
  assert.ok(coast.length>=10,`It coasts over ${coast.length} frames`);
  assert.ok(end-release>.4,`…carrying on the same way after release (${(end-release).toFixed(2)} rad)`);
  for(let i=1;i<coast.length;i++){
   assert.ok(coast[i].turn>=coast[i-1].turn-1e-9,'The coast never turns back');
   assert.ok(Math.abs(coast[i].velocity)<=Math.abs(coast[i-1].velocity)+1e-9,'…and only slows down');
  }
  const steps=coast.slice(1).map((s,i)=>(s.turn-coast[i].turn)*16.7/Math.max(1,s.t-coast[i].t));
  assert.ok(Math.max(...steps)<.3,'No jumps (largest step '+Math.max(...steps).toFixed(3)+' rad per frame)');
  const took=coast.at(-1).t-coast[0].t;assert.ok(took>250 && took<4000,`It glides to a stop in ${took.toFixed(0)} ms`);
  assert.equal(await scene.getAttribute('data-dragging'),null,'Targets come back once it stops');
  await page.waitForTimeout(2000);assert.equal(await viewer(v=>v.turn),end,'The bag holds the angle it stopped at (2 s later)');
  metrics.flick={release:+(release-start).toFixed(3),coast:+(end-release).toFixed(3),frames:coast.length,ms:Math.round(took),startVelocity:+coast[0].velocity.toFixed(2)};
 }
 check(`Flick: the drag turns the bag ${metrics.flick.release} rad, then it coasts ${metrics.flick.coast} rad more over ${metrics.flick.frames} frames (${metrics.flick.ms} ms, from ${metrics.flick.startVelocity} rad/s), never reversing or speeding up, and holds the angle where it stops`);

 // 3. Drag, hold still, let go: no coast, the bag stays exactly where it was let go.
 {
  await flick(...await empty(),-70,{hold:200});
  const release=await page.evaluate(()=>window.releaseTurn);
  assert.equal(await viewer(v=>v.spinning),false,'No coast after holding still');
  await settled();assert.equal(await viewer(v=>v.turn),release,'It stays exactly where it was let go');
  await page.waitForTimeout(1200);assert.equal(await viewer(v=>v.turn),release);
 }
 check('Hold then release: no momentum; the bag stays exactly at the release angle');

 // 4. Catch: a press on a coasting bag stops it there, and is not a tap (flap and discs untouched).
 {
  await flick(...await empty(),160,{steps:4});await page.waitForTimeout(120);
  assert.equal(await viewer(v=>v.spinning),true,'Coasting');
  const out=await outIds();
  await page.mouse.down();await page.waitForTimeout(40);
  assert.equal(await viewer(v=>v.spinning),false,'The press catches the spin');
  const caught=await viewer(v=>v.turn);await page.waitForTimeout(150);assert.equal(await viewer(v=>v.turn),caught,'Held while pressed');
  await page.mouse.up();await settled();
  assert.equal(await viewer(v=>v.turn),caught,'Stays where it was caught');
  assert.equal(await scene.getAttribute('data-phase'),'open','Catching is not a tap on the bag (flap untouched)');
  assert.deepEqual(await outIds(),out,'…nor on a disc');
 }
 check('Catch: pressing a coasting bag stops it on the spot; the press is not a tap');

 // 5. The angle persists through everything else: pulling discs out and returning them, the top
 // view, closing and opening the bag, collapsing the pocket, and a theme change.
 {
  // Back to a front-facing angle (held, no coast), so every pocket stays in reach.
  let turn=await viewer(v=>v.turn),k=Math.round(turn/(2*Math.PI))*2*Math.PI-turn+.5;
  await flick(...await empty(),Math.round(k/.012),{hold:200,steps:10});await settled();
  const kept=await viewer(v=>v.turn);assert.ok(await viewer(v=>v.frontFacing),'Front facing: '+kept);
  const same=async label=>assert.ok(Math.abs(await viewer(v=>v.turn)-kept)<1e-9,`${label} keeps the angle`);
  await page.locator('[data-type-out="distance"]').click();await settled();await same('Pulling out a type');
  await page.locator('.bag-return-all').click();await settled();await same('Return all');
  await page.locator('[data-bag-top-view]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.camera==='top');await same('Top view');
  await page.locator('[data-bag-top-view]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.camera==='front');await settled();
  await page.locator('[data-bag-toggle]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='closed');await same('Closing the bag');
  await page.locator('[data-bag-toggle]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='open');await settled();await same('Opening it');
  await pocket.click();await settled();await pocket.click();await settled();await same('Collapsing and expanding the pocket');
  await t.setTheme('light');await page.waitForTimeout(300);await t.setTheme('midnight');await same('A theme change');
  // An out disc holds still in the room while the bag coasts under it.
  await slot(mains[0]).click();await settled();await closeDetails();
  const before=(await viewer(v=>v.discRects())).find(r=>r.out);
  await flick(...await empty(),120,{steps:4});assert.equal(await viewer(v=>v.spinning),true);await settled();
  const after=(await viewer(v=>v.discRects())).find(r=>r.out);
  assert.ok(Math.abs(after.left-before.left)<2 && Math.abs(after.top-before.top)<2,'The out disc stays put while the bag coasts: '+JSON.stringify({before,after}));
  await page.locator('.bag-return-all').click();await settled();
  metrics.persist=+kept.toFixed(3);
 }
 check(`Angle persists (${metrics.persist} rad) through a type pull-out, Return all, the top view, closing and opening the bag, the pocket and a theme change; an out disc holds still while the bag coasts`);

 // 6. Reduced motion: a flick stops where it is let go.
 await page.emulateMedia({reducedMotion:'reduce'});
 await flick(...await empty(),140,{steps:4});
 assert.equal(await viewer(v=>v.spinning),false,'No coast with reduced motion');assert.equal(await viewer(v=>v.turn),await page.evaluate(()=>window.releaseTurn));
 await page.emulateMedia({reducedMotion:'no-preference'});await settled();
 check('Reduced motion: no momentum');

 // ── Putter pocket ─────────────────────────────────────────────────────────────────────────────
 await openBag();
 // 7. The control: beside Top view, under the canvas (clear of the bag, discs, names, zoom and Return all).
 assert.equal((await pocket.innerText()).trim(),'Putter pocket');
 assert.equal(await pocket.getAttribute('aria-expanded'),'true');assert.equal(await pocket.isEnabled(),true);
 assert.equal(await scene.getAttribute('data-putter-pocket'),'open');assert.equal(await viewer(v=>v.puttersOut),true);
 {
  const [p,top,c]=await Promise.all([pocket.boundingBox(),page.locator('[data-bag-top-view]').boundingBox(),page.locator('[data-bag-canvas]').boundingBox()]);
  assert.ok(p.y>=c.y+c.height,'The control sits below the canvas, clear of everything drawn in it');
  assert.ok(Math.abs(p.y-top.y)<2 && p.x>top.x,'…in the row beside Top view');
  assert.ok(p.height>=44,'44 px target');
 }
 check('Control: "Putter pocket" (aria-expanded) in the bag\'s button row beside Top view, below the canvas, 44 px tall');

 // 8. Collapse: every putter slides down into the pocket; the bag stays open throughout and the main
 // discs never move.
 const restPutters=await putters(),restMains=await mainPoses();
 const watchPhase=()=>page.evaluate(()=>{const s=document.querySelector('#bagScene');window.phases=[];window.phaseObserver=new MutationObserver(()=>window.phases.push(s.dataset.phase));window.phaseObserver.observe(s,{attributes:true,attributeFilter:['data-phase']});});
 const phasesSeen=()=>page.evaluate(()=>{window.phaseObserver.disconnect();return window.phases;});
 const smoothRise=(samples,ids,direction,label)=>{
  for(const id of ids){
   const list=samples.map(s=>s.putters[id]).filter(Boolean);
   for(let i=1;i<list.length;i++){
    assert.ok(direction<0?list[i].rise<=list[i-1].rise+1e-9:list[i].rise>=list[i-1].rise-1e-9,`${label}: ${id} moves one way`);
    assert.ok(Math.hypot(...list[i].pose.map((v,k)=>v-list[i-1].pose[k]))<.03,`${label}: ${id} glides (no jump)`);
   }
  }
  const moving=samples.filter(s=>ids.some(id=>s.putters[id] && s.putters[id].rise>0 && s.putters[id].rise<1)).length;
  assert.ok(moving>=12,`${label}: animated over ${moving} frames`);
  return moving;
 };
 {
  await watchPhase();await startSampling();await pocket.click();
  await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.putterPocket==='collapsed',null,{timeout:8000});await settled();
  const samples=await stopSampling();
  assert.deepEqual(await phasesSeen(),[],'The bag never closes or reopens');
  assert.ok(samples.every(s=>s.phase==='open' && s.flap===1),'The flap stays fully open every frame');
  assert.equal(await pocket.getAttribute('aria-expanded'),'false');assert.equal(await viewer(v=>v.puttersOut),false);
  const now=await putters();
  for(const p of now){const before=restPutters.find(q=>q.id===p.id);assert.equal(p.rise,0,`${p.id} stowed`);assert.ok(before.pose[1]-p.pose[1]>.03,`${p.id} sits lower, in the pocket (${(before.pose[1]-p.pose[1]).toFixed(3)} m)`);}
  assert.deepEqual(await mainPoses(),restMains,'Main discs stay put');
  metrics.collapseFrames=smoothRise(samples,putterIds,-1,'Collapse');
  metrics.collapseDrop=+Math.min(...now.map(p=>restPutters.find(q=>q.id===p.id).pose[1]-p.pose[1])).toFixed(3);
 }
 check(`Collapse: all four putters slide ${metrics.collapseDrop}+ m down into the pocket over ${metrics.collapseFrames} frames, each one way with no jumps; the flap stays fully open and the main discs never move`);
 for(const theme of THEMES){await t.setTheme(theme);await t.shot(`pocket-collapsed-1440-${theme}`);}
 await t.setTheme('midnight');

 // 9. With the pocket collapsed the bag still works: a main disc toggles out and back.
 await slot(mains[1]).click();await settled();assert.deepEqual(await outIds(),[mains[1]]);await closeDetails();
 await slot(mains[1]).click();await settled();await closeDetails();assert.deepEqual(await outIds(),[]);
 check('Collapsed: main discs still toggle with the bag open');

 // 10. Expand: the putters rise back into their row, exactly where they were.
 {
  await startSampling();await pocket.click();
  await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.putterPocket==='open',null,{timeout:8000});await settled();
  const samples=await stopSampling();
  assert.equal(await pocket.getAttribute('aria-expanded'),'true');assert.equal(await viewer(v=>v.puttersOut),true);
  for(const p of await putters()){const before=restPutters.find(q=>q.id===p.id);assert.equal(p.rise,1);assert.ok(Math.hypot(...p.pose.map((v,k)=>v-before.pose[k]))<1e-4,`${p.id} back in its row`);}
  metrics.expandFrames=smoothRise(samples,putterIds,1,'Expand');
 }
 check(`Expand: the putters rise back into their row (to the same spots) over ${metrics.expandFrames} frames`);
 for(const theme of THEMES){await t.setTheme(theme);await t.shot(`pocket-open-1440-${theme}`);}
 await t.setTheme('midnight');

 // 11. Edge case: a putter is out (its details open) when the pocket collapses. It goes home first,
 // then the row goes down; a main disc that is out stays out.
 {
  const putter=putterIds.at(-1);
  await slot(mains[0]).click();await settled();await closeDetails();
  await slot(putter).click();await settled();await detail.waitFor({state:'visible'});
  assert.deepEqual(await outIds(),[mains[0],putter]);
  await startSampling();await pocket.click();
  await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.putterPocket==='collapsed',null,{timeout:10000});await settled();
  const samples=await stopSampling();
  assert.deepEqual(await outIds(),[mains[0]],'The putter is back in the bag; the main disc stays out');
  await detail.waitFor({state:'hidden'});
  assert.equal(await slot(putter).getAttribute('aria-pressed'),'false');
  assert.equal((await page.locator('.bag-return-all').innerText()).replace(/\s+/g,' ').trim(),'Return all 1');
  const home=samples.find(s=>s.putters[putter].slide===0)?.t,lowering=samples.find(s=>putterIds.some(id=>s.putters[id].rise<1))?.t;
  assert.ok(home && lowering,'Both phases sampled');
  assert.ok(lowering>=home-1,`The putter is home (${home.toFixed(0)}) before the row starts down (${lowering.toFixed(0)})`);
  assert.ok(samples.some(s=>s.putters[putter].slide>0 && s.putters[putter].slide<1),'…sliding home, not jumping');
  assert.ok((await putters()).every(p=>p.rise===0 && p.slide===0),'Every putter ends stowed, the returned one too');
  assert.ok(samples.every(s=>s.phase==='open'),'The bag stays open');
  metrics.outPutter={homeToLowerMs:Math.round(lowering-home)};
  await pocket.click();await settled();await page.locator('.bag-return-all').click();await settled();
 }
 check(`Out putter: collapsing first slides the out putter home (closing its details), then lowers the row (${metrics.outPutter.homeToLowerMs} ms later); the out main disc stays out`);

 // 12. The choice holds through closing and opening the bag; closed, the control is off.
 {
  await pocket.click();await settled();
  await page.locator('[data-bag-toggle]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='closed');
  assert.equal(await pocket.isDisabled(),true,'Off while the bag is closed');
  await page.locator('[data-bag-toggle]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='open');await settled();
  assert.equal(await pocket.isEnabled(),true);assert.equal(await pocket.getAttribute('aria-expanded'),'false','Still collapsed after reopening');
  assert.ok((await putters()).every(p=>p.rise===0),'The putters stay down when the bag opens');
  // A putter can still come out of the collapsed pocket (the type button too), and goes back into it.
  await page.locator('[data-type-out="putter"]').click();await settled();
  assert.deepEqual([...await outIds()].sort(),[...putterIds].sort(),'Putter pulls every putter out of the collapsed pocket');
  await page.locator('.bag-return-all').click();await settled();
  assert.ok((await putters()).every(p=>p.rise===0 && p.slide===0),'…and Return all puts them back down in it');
  await pocket.click();await settled();assert.ok((await putters()).every(p=>p.rise===1));
 }
 check('Persistence: the collapsed pocket stays collapsed through closing and opening the bag (control off while closed); putters still come out of it and go back into it');

 // 13. Keyboard: Enter and Space toggle it, and focus stays on the control.
 {
  await pocket.focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.putterPocket==='collapsed',null,{timeout:8000});await settled();
  assert.ok(await pocket.evaluate(n=>n===document.activeElement),'Focus stays on the control');
  await page.keyboard.press('Space');await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.putterPocket==='open',null,{timeout:8000});await settled();
  assert.ok(await pocket.evaluate(n=>n===document.activeElement));
 }
 check('Keyboard: Enter collapses, Space expands, focus stays on the control');

 // 14. Reduced motion: instant both ways.
 await page.emulateMedia({reducedMotion:'reduce'});
 await pocket.evaluate(n=>n.click());await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.putterPocket==='collapsed',null,{timeout:2000});
 assert.ok((await putters()).every(p=>p.rise===0),'Instant collapse');
 await pocket.evaluate(n=>n.click());await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.putterPocket==='open',null,{timeout:2000});
 assert.ok((await putters()).every(p=>p.rise===1),'Instant expand');
 await page.emulateMedia({reducedMotion:'no-preference'});
 check('Reduced motion: the pocket collapses and expands instantly');

 // Spun-bag screenshots (held, so every theme shows the same angle).
 await openBag();
 await flick(...await empty(),-75,{hold:200,steps:8});await settled();
 for(const theme of THEMES){await t.setTheme(theme);await t.shot(`spun-1440-${theme}`);}

 // ── Phone (touch) ─────────────────────────────────────────────────────────────────────────────
 const touch=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:360,height:800},isMobile:true,hasTouch:true});
 const mobile=await touch.newPage();mobile.on('pageerror',e=>errors.push(e.stack));mobile.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const m=tools(mobile),cdp=await touch.newCDPSession(mobile);
 await m.openBag();await m.setTheme('midnight');await m.settled();
 const swipe=async(x,y,dx,dy,{hold=0,steps=10}={})=>{
  await m.armRelease();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=steps;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/steps,y:y+dy*i/steps}]});await mobile.waitForTimeout(12);}
  if(hold)await mobile.waitForTimeout(hold);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 };
 const mobileMains=(await mobile.locator('[data-physical-disc][data-pocket="main"][tabindex="0"]').evaluateAll(l=>l.map(n=>n.dataset.physicalDisc)));
 // 15. A touch flick that starts on a disc spins the bag with momentum and leaves the disc alone.
 {
  const c=await m.center(m.slot(mobileMains[4]));
  await swipe(c.x,c.y,90,2);
  const release=await mobile.evaluate(()=>window.releaseTurn);
  assert.ok(release>.5,'The touch drag turns the bag: '+release);
  await mobile.waitForFunction(()=>!document.querySelector('[data-bag-canvas]').bagViewer.turning,null,{timeout:8000});
  const end=await m.viewer(v=>v.turn);assert.ok(end-release>.2,`Touch flick coasts (${(end-release).toFixed(2)} rad)`);
  assert.deepEqual(await m.outIds(),[],'The disc under the finger stays in');
  await mobile.waitForTimeout(1500);assert.equal(await m.viewer(v=>v.turn),end,'Holds the angle');
  metrics.touch={release:+release.toFixed(3),coast:+(end-release).toFixed(3)};
 }
 // 16. A vertical swipe is the page's: no turn.
 {
  const before=await m.viewer(v=>v.turn),c=await m.center(m.slot(mobileMains[2]));
  await swipe(c.x,c.y,3,-120);await mobile.waitForTimeout(300);
  assert.equal(await m.viewer(v=>v.turn),before,'A vertical swipe never turns the bag');assert.deepEqual(await m.outIds(),[]);
  await m.scene.scrollIntoViewIfNeeded();await m.settled();
 }
 // 17. A tap still toggles a disc (turn back to the front first, held).
 {
  const turn=await m.viewer(v=>v.turn),k=Math.round(turn/(2*Math.PI))*2*Math.PI-turn,b=await m.stageBox();
  await swipe(b.x+b.width*.15,b.y+b.height*.85,Math.round(k/.012),1,{hold:200,steps:14});await m.settled();
  const id=(await mobile.locator('[data-physical-disc][data-pocket="main"][tabindex="0"]').evaluateAll(l=>l.map(n=>n.dataset.physicalDisc)))[3];
  await m.slot(id).tap();await m.settled();assert.deepEqual(await m.outIds(),[id],'A tap toggles the disc out');
  await mobile.locator('#detail').waitFor({state:'visible'});await mobile.keyboard.press('Escape');await mobile.locator('#detail').waitFor({state:'hidden'});
  await m.scene.scrollIntoViewIfNeeded();await m.settled();
  await m.slot(id).tap();await m.settled();assert.deepEqual(await m.outIds(),[],'…and back');
  if(await mobile.locator('#detail').isVisible()){await mobile.keyboard.press('Escape');await mobile.locator('#detail').waitFor({state:'hidden'});}
 }
 check(`Touch: a flick that starts on a disc spins the bag ${metrics.touch.release} rad and coasts ${metrics.touch.coast} rad more, then holds; a vertical swipe never turns it; a tap still toggles the disc`);

 // 18. Phone pocket: the control fits the row (no sideways scroll); a tap collapses, the out putter goes home first.
 {
  await m.scene.scrollIntoViewIfNeeded();
  const p=await m.pocket.boundingBox();assert.ok(p && p.x>=0 && p.x+p.width<=360,'The control fits a 360 px screen');
  assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal scroll');
  for(const theme of THEMES){await m.setTheme(theme);await m.shot(`pocket-open-360-${theme}`);}
  await m.setTheme('midnight');
  const putter=(await mobile.locator('[data-physical-disc][data-pocket="putter"]').evaluateAll(l=>l.map(n=>n.dataset.physicalDisc))).at(-1);
  await m.slot(putter).tap();await m.settled();
  if(await mobile.locator('#detail').isVisible()){await mobile.keyboard.press('Escape');await mobile.locator('#detail').waitFor({state:'hidden'});}
  await m.scene.scrollIntoViewIfNeeded();await m.settled();assert.deepEqual(await m.outIds(),[putter]);
  await m.pocket.tap();await mobile.waitForFunction(()=>document.querySelector('#bagScene').dataset.putterPocket==='collapsed',null,{timeout:10000});await m.settled();
  assert.deepEqual(await m.outIds(),[],'The out putter went home');assert.ok((await m.putters()).every(p=>p.rise===0),'Every putter down');
  assert.equal(await m.scene.getAttribute('data-phase'),'open');
  for(const theme of THEMES){await m.setTheme(theme);await m.shot(`pocket-collapsed-360-${theme}`);}
  await m.setTheme('midnight');await m.pocket.tap();await m.settled();
  const b=await m.stageBox();await swipe(b.x+b.width*.15,b.y+b.height*.85,-60,1,{hold:200});await m.settled();
  for(const theme of THEMES){await m.setTheme(theme);await m.shot(`spun-360-${theme}`);}
 }
 check('Phone: the pocket control fits the row with no sideways scroll; a tap collapses it (an out putter goes home first) with the bag open');
 await touch.close();

 assert.deepEqual(errors,[],'No page errors');
 const gallery=shots.map(name=>`<figure><img src="${name}.png" alt="${name}"><figcaption>${name}</figcaption></figure>`).join('\n');
 fs.writeFileSync(`${dir}/screenshots.html`,`<!doctype html><meta charset="utf-8"><title>Putter pocket and spin</title><style>body{font:14px system-ui;background:#111;color:#eee;margin:24px}figure{display:inline-block;margin:0 16px 24px 0;vertical-align:top}img{max-width:680px;border:1px solid #333}</style>\n${gallery}`);
 fs.writeFileSync(`${dir}/qa.json`,JSON.stringify({checks,shots,metrics},null,1));
 console.log(`PASS bag spin + pocket: ${checks.length} checks, ${shots.length} screenshots in ${dir} ${JSON.stringify(metrics)}`);
} catch(error) {
 if(errors.length)console.error('Page errors:',errors);
 throw error;
} finally {
 await browser?.close();server.kill();
}
