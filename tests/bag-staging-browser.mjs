import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// Out discs on My Bag (Oct 6): a click slides a disc out and it stays out until clicked again,
// each disc on its own. One to five rest beside the bag, understable left and overstable right;
// the sixth turns on map mode, where every out disc takes its Atlas place (stability across,
// speed up) around the bag on the Stitch grid; back to five returns to the sides. The same grid
// sits under the main atlas in every theme. Runs on the signed-out demo bag (no account needed).
const config='tests/auth.wrangler.jsonc',state='work/bag-staging/d1-qa',base='https://localhost:8807',dir='outputs/bag-staging';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8807','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const errors=[],shots=[],checks=[],metrics={};
const check=label=>{checks.push(label);console.log('ok -',label);};
const overlap=(a,b)=>a.left<b.left+b.width-1 && b.left<a.left+a.width-1 && a.top<b.top+b.height-1 && b.top<a.top+a.height-1;
// Spearman rank correlation, for "the map keeps the Atlas order".
const ranks=values=>{const order=values.map((v,i)=>[v,i]).sort((a,b)=>a[0]-b[0]),r=[];order.forEach(([,i],k)=>r[i]=k);return r;};
const spearman=(a,b)=>{const ra=ranks(a),rb=ranks(b),n=a.length,d=ra.reduce((s,r,i)=>s+(r-rb[i])**2,0);return 1-6*d/(n*(n*n-1));};
try {
 const deadline=Date.now()+45000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const viewer=(fn,arg)=>page.locator('[data-bag-canvas]').evaluate((n,[source,value])=>new Function('v','arg',`return (${source})(v,arg)`)(n.bagViewer,value),[fn.toString(),arg]);
 const scene=page.locator('#bagScene'),detail=page.locator('#detail'),slot=id=>page.locator(`[data-physical-disc="${id}"]`),nameOf=id=>page.locator(`[data-out-name="${id}"]`);
 const setTheme=theme=>page.evaluate(t=>document.querySelector(`[data-theme-choice="${t}"]`).click(),theme);
 const settled=()=>page.waitForFunction(()=>{const s=document.querySelector('#bagScene'),v=s.querySelector('[data-bag-canvas]').bagViewer;return !v.stage.moving && (s.dataset.staging===undefined || s.dataset.staging==='still');},null,{timeout:15000});
 const outIds=()=>viewer(v=>v.outDiscs);
 const canvasBox=()=>page.locator('[data-bag-canvas]').evaluate(n=>({width:n.clientWidth,height:n.clientHeight}));
 const local=locator=>locator.evaluate(n=>{const c=n.closest('[data-bag-canvas]').getBoundingClientRect(),r=n.getBoundingClientRect();return {left:r.left-c.left,top:r.top-c.top,width:r.width,height:r.height};});
 const shot=async(name,target=page.locator('[data-bag-canvas]'))=>{await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(350);await target.screenshot({path:`${dir}/${name}.png`});shots.push(name);};
 // A click that leaves no details open, so the next disc is never under the phone's bottom sheet.
 const toggle=async id=>{await slot(id).click();await settled();if(await detail.isVisible()){await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});}await page.mouse.move(2,2);};
 const openBag=async()=>{await page.goto(base+'/?bag=1');await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s.dataset.engine==='ready' && s.dataset.phase==='open';},null,{timeout:30000});await scene.scrollIntoViewIfNeeded();await page.mouse.move(2,2);};
 // Each demo disc's Atlas position, the same AtlasLayout.positions the map uses.
 const atlasOf=()=>page.evaluate(async()=>{const {DEMO_DISCS}=await import('/bag-demo.js');return Object.fromEntries(DEMO_DISCS.map(item=>{const mold=discs.find(d=>d.id===item.mold_id),p=mold && window.AtlasLayout.positions([mold]).get(mold.id);return [item.id,p?{x:p.x,y:p.y,name:mold.catalogName||mold.name}:null];}));});
 // Out discs' rects and names must sit inside the canvas, discs never on each other or under the zoom buttons.
 const layoutChecks=async label=>{
  const box=await canvasBox(),rects=(await viewer(v=>v.discRects())).filter(r=>r.out),zoom=await local(page.locator('.bag-zoom'));
  for(const r of rects){
   assert.ok(r.left>=-1 && r.top>=-1 && r.left+r.width<=box.width+1 && r.top+r.height<=box.height+1,`${label}: ${r.id} inside the canvas ${JSON.stringify(r)}`);
   assert.ok(!overlap(r,zoom),`${label}: ${r.id} clear of the zoom buttons`);
  }
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
   const a=rects[i],b=rects[j],ca=[a.left+a.width/2,a.top+a.height/2],cb=[b.left+b.width/2,b.top+b.height/2];
   assert.ok(Math.hypot(ca[0]-cb[0],ca[1]-cb[1])>=(Math.min(a.width,b.width))*.98,`${label}: ${a.id} and ${b.id} do not overlap `+JSON.stringify({a,b}));
  }
  const names=await page.locator('[data-out-name]:not([hidden])').evaluateAll(list=>list.map(n=>{const c=n.closest('[data-bag-canvas]').getBoundingClientRect(),r=n.getBoundingClientRect();return {id:n.dataset.outName,left:r.left-c.left,top:r.top-c.top,width:r.width,height:r.height};}));
  for(const n of names){
   assert.ok(n.left>=0 && n.left+n.width<=box.width+1 && n.top>=0 && n.top+n.height<=box.height+1,`${label}: name of ${n.id} inside the canvas`);
   for(const r of rects)if(r.id!==n.id)assert.ok(!overlap(n,r),`${label}: name of ${n.id} clear of ${r.id}`);
   for(const m of names)if(m!==n)assert.ok(!overlap(n,m),`${label}: names ${n.id} and ${m.id} apart`);
  }
  return {rects,names};
 };
 // Frame sampling: every out (or returning) disc's live pose and the camera's pull-back, each frame.
 const startSampling=()=>page.locator('[data-bag-canvas]').evaluate(n=>{const s=n.stageSamples=[];n.stageSampling=true;const tick=()=>{const v=n.bagViewer;s.push({t:performance.now(),pull:v.stage.pull,discs:Object.fromEntries(v.getBagLayoutState().filter(d=>d.slide>0).map(d=>[d.id,d.pose]))});if(n.stageSampling)requestAnimationFrame(tick);};requestAnimationFrame(tick);});
 const stopSampling=()=>page.locator('[data-bag-canvas]').evaluate(n=>{n.stageSampling=false;return n.stageSamples;});
 // Smooth: every disc and the camera move continuously. Steps are scaled to 16.7 ms frames; a pop
 // is a step far larger than the steps around it (motion eases in and out, so speed changes gradually).
 const smooth=(samples,label)=>{
  const steps=new Map(),pulls=[];
  for(let i=1;i<samples.length;i++){
   const a=samples[i-1],b=samples[i],scale=16.7/Math.max(1,b.t-a.t);
   for(const [id,p] of Object.entries(b.discs))if(a.discs[id]){if(!steps.has(id))steps.set(id,[]);steps.get(id).push(Math.hypot(p[0]-a.discs[id][0],p[1]-a.discs[id][1],p[2]-a.discs[id][2])*scale);}
   pulls.push(Math.abs(b.pull-a.pull)*scale);
  }
  const pops=list=>list.filter((step,i)=>step>.02 && step>2.5*Math.max(list[i-1]??0,list[i+1]??0)).length;
  const worst=Math.max(0,...[...steps.values()].flat()),worstPull=Math.max(0,...pulls),popped=[...steps.values()].reduce((sum,list)=>sum+pops(list),0)+pops(pulls.map(v=>v*10));
  metrics[label]={frames:samples.length,worstStep:+worst.toFixed(4),worstPullStep:+worstPull.toFixed(4),pops:popped};
  assert.ok(samples.length>=20,`${label}: animated over ${samples.length} frames`);
  assert.equal(popped,0,`${label}: no disc or camera pops`);
  assert.ok(worst<.1,`${label}: no disc teleports (largest step ${worst.toFixed(3)} m per frame)`);
  assert.ok(worstPull<.05,`${label}: the camera glides (largest pull step ${worstPull.toFixed(3)} per frame)`);
 };

 // 0. Toolbar: the Manufacturer chip leads the type chips; the map dropdown names "My Bag".
 await page.goto(base);await page.waitForFunction(()=>typeof discs!=='undefined' && discs.length && filtered.length);
 const chips=await page.locator('#typeChips').evaluate(n=>[...n.children].map(c=>c.id||c.textContent.trim()));
 assert.deepEqual(chips.slice(0,5),['brandChip','Driver','Fairway','Midrange','Putter'],'Manufacturer first: '+chips);
 assert.equal((await page.locator('#brandChip').innerText()).trim(),'Manufacturer');
 await page.evaluate(()=>{toggleBrand('Innova');toggleBrand('Discraft');});
 assert.equal((await page.locator('#brandChip').innerText()).trim(),'2 manufacturers');
 await page.evaluate(()=>{toggleBrand('Discraft');});assert.equal((await page.locator('#brandChip').innerText()).trim(),'Innova');
 await page.evaluate(()=>{toggleBrand('Innova');});
 assert.equal(await page.locator('#lensMenu [data-lens="only"]').textContent(),'My Bag');
 assert.equal((await page.locator('[data-map-choice="only"]').textContent()).trim().replace('✓',''),'My Bag');
 assert.equal(await page.locator('#brandSummary').innerText(),'All manufacturers','The Filters drawer says manufacturers too');
 check('Toolbar: Manufacturer chip first (brand name or "2 manufacturers" when picked); the map dropdown and Default map say My Bag');

 // 1. The Stitch grid under the main atlas, in all three themes; the markers draw exactly as before.
 for(const theme of ['light','midnight','charcoal']){
  await setTheme(theme);await page.waitForTimeout(400);
  const grid=await page.locator('#map').evaluate(n=>{const b=getComputedStyle(n,'::before');return {content:b.content,z:b.zIndex,image:b.backgroundImage,size:b.backgroundSize,events:b.pointerEvents};});
  assert.equal(grid.content,'""');assert.equal(grid.z,'-1','Under the canvas and markers');assert.equal(grid.events,'none');
  assert.match(grid.size,/48px 48px/,'The Stitch 48px pitch');
  const colors=[...grid.image.matchAll(/rgba\(([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)\)/g)].filter(m=>+m[4]>0);
  assert.ok(colors.length && colors.every(m=>Math.max(+m[1],+m[2],+m[3])-Math.min(+m[1],+m[2],+m[3])<=40 && +m[4]<=.08),`${theme}: neutral (no hue to tell apart), faint lines: ${grid.image}`);
  // Clean: hiding the grid changes no marker or label.
  const markers=()=>page.locator('#mapMarkers').evaluate(n=>[...n.querySelectorAll('.atlas-marker')].map(m=>{const r=m.getBoundingClientRect();return [m.dataset.cluster,Math.round(r.left),Math.round(r.top),Math.round(r.width),getComputedStyle(m.querySelector('.marker-name')||m).font];}));
  // Wait for the map to settle after the theme change (two identical reads), then compare.
  const steady=async()=>{let last=await markers();for(let i=0;i<20;i++){await page.waitForTimeout(250);const next=await markers();if(JSON.stringify(next)===JSON.stringify(last))return next;last=next;}return last;};
  const withGrid=await steady();await page.addStyleTag({content:'#map::before{display:none!important}'});const without=await steady();
  assert.deepEqual(without,withGrid,`${theme}: markers identical with and without the grid`);
  await page.evaluate(()=>document.querySelectorAll('style').forEach(s=>{if(s.textContent.includes('#map::before{display:none'))s.remove();}));
  await page.waitForTimeout(250);await shot(`atlas-grid-1440-${theme}`,page);
 }
 check('Main atlas: the Stitch 48px grid sits under the canvas and markers in light, midnight and charcoal; neutral and faint; markers and labels unchanged');

 // 2. Toggle semantics on the demo bag.
 await setTheme('midnight');await openBag();
 const atlas=await atlasOf(),reachable=await page.locator('[data-physical-disc][tabindex="0"]').evaluateAll(l=>l.map(n=>[n.dataset.physicalDisc,n.dataset.pocket]));
 const mains=reachable.filter(([,p])=>p==='main').map(([id])=>id),goto=reachable.find(([,p])=>p==='goto')[0];
 const putterFront=(await page.locator('[data-physical-disc][data-pocket="putter"]').evaluateAll(l=>l.map(n=>n.dataset.physicalDisc))).at(-1);
 const [a,b,c]=[mains[1],mains[6],mains[11]];
 await slot(a).click();await settled();
 assert.deepEqual(await outIds(),[a]);assert.equal(await slot(a).getAttribute('aria-pressed'),'true');assert.match(await slot(a).getAttribute('aria-label'),/Enter to put it back/);
 await detail.waitFor({state:'visible'});assert.equal(await detail.locator('h2').first().innerText(),atlas[a].name,'One click opens its details too');
 await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});assert.deepEqual(await outIds(),[a],'Escape closes the details only');
 // Its name reopens the details; an empty-space click closes them (flap untouched) and leaves the disc out.
 await nameOf(a).click();await detail.waitFor({state:'visible'});
 const stage=await page.locator('.bag-3d-stage canvas').boundingBox();await page.mouse.click(stage.x+stage.width*.5,stage.y+stage.height*.985);
 await detail.waitFor({state:'hidden'});await settled();
 assert.deepEqual(await outIds(),[a],'An empty-space click leaves it out');assert.equal(await scene.getAttribute('data-phase'),'open','The dismissing click does not toggle the flap');
 await page.locator('[data-bag-toggle]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='closed');
 assert.deepEqual(await outIds(),[a],'Closing the bag leaves it out');assert.equal(await slot(a).getAttribute('tabindex'),'0','An out main disc stays in reach with the flap shut');
 await page.locator('[data-bag-toggle]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='open');
 await page.locator('[data-bag-top-view]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.camera==='top');
 assert.deepEqual(await outIds(),[a],'The top view leaves it out');
 await page.locator('[data-bag-top-view]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.camera==='front');await settled();
 assert.deepEqual(await outIds(),[a]);
 await toggle(b);await toggle(c);assert.deepEqual(await outIds(),[a,b,c],'Each disc comes out on its own');
 await toggle(b);assert.deepEqual(await outIds(),[a,c],'Clicking one puts back only that one');
 assert.equal(await slot(b).getAttribute('aria-pressed'),'false');
 await slot(c).focus();await page.keyboard.press('Enter');await settled();assert.deepEqual(await outIds(),[a],'Enter toggles too');
 await toggle(a);assert.deepEqual(await outIds(),[]);assert.equal(await scene.getAttribute('data-stage'),null);
 assert.equal(await viewer(v=>v.stage.pull),1,'With nothing out the camera is back at the page view');
 check('Toggle: a click (or Enter) slides a disc out with its details and it stays out through Escape, empty-space clicks, closing the bag and the top view; each disc is independent; the next click puts back just that disc');

 // 3. One to five: beside the bag, understable left and overstable right, balanced.
 const five=[mains[0],mains[4],goto,mains[9],putterFront];
 for(let i=0;i<five.length;i++){
  await toggle(five[i]);const out=five.slice(0,i+1),st=await viewer(v=>v.stage);
  assert.equal(st.mode,'side',`${out.length} out: side layout`);assert.equal(await scene.getAttribute('data-stage'),'side');
  const left=out.filter(id=>st.sides[id]==='left'),right=out.filter(id=>st.sides[id]==='right');
  assert.ok(Math.abs(left.length-right.length)<=1,`${out.length} out: balanced ${left.length}/${right.length}`);
  const x=id=>atlas[id]?.x ?? .5;
  if(left.length && right.length)assert.ok(Math.max(...left.map(x))<=Math.min(...right.map(x)),`${out.length} out: understable left, overstable right `+JSON.stringify(out.map(id=>[atlas[id]?.name,x(id).toFixed(2),st.sides[id]])));
  const state=await viewer(v=>v.getBagLayoutState().filter(d=>d.out));
  for(const d of state)assert.ok(Math.abs(d.spot[0])>.25 && Math.sign(d.spot[0])===(st.sides[d.id]==='left'?-1:1),`${d.id} rests beside the bag on its side`);
  await layoutChecks(`${out.length} out`);
 }
 metrics.sidePull=await viewer(v=>v.stage.pull);
 assert.ok(metrics.sidePull>=1 && metrics.sidePull<1.4,'The bag stays near full size beside five discs: pull '+metrics.sidePull);
 const sideNames=await page.locator('[data-out-name]:not([hidden])').count();assert.equal(sideNames,5,'Every disc beside the bag shows its name');
 await shot('side-5-1440-midnight');
 check(`1–5 out: beside the bag, balanced, every left disc less stable than every right disc, names shown, nothing overlapping; camera pulled back only to ${metrics.sidePull.toFixed(2)}×`);

 // 4. The sixth turns on map mode: every out disc takes its Atlas place around the bag.
 await startSampling();
 await toggle(mains[12]);
 smooth(await stopSampling(),'5 → 6 (map)');
 let st=await viewer(v=>v.stage);assert.equal(st.mode,'map');assert.equal(await scene.getAttribute('data-stage'),'map');assert.equal(await scene.getAttribute('data-out'),'6');
 for(const id of [mains[2],mains[7]])await toggle(id);
 const mapState=async()=>{const out=await viewer(v=>v.getBagLayoutState().filter(d=>d.out));return out.filter(d=>atlas[d.id]);};
 const atlasOrder=async label=>{
  const out=await mapState(),xs=spearman(out.map(d=>d.spot[0]),out.map(d=>atlas[d.id].x)),ys=spearman(out.map(d=>d.spot[1]),out.map(d=>atlas[d.id].y));
  metrics[label]={count:out.length,stabilityRank:+xs.toFixed(3),speedRank:+ys.toFixed(3)};
  assert.ok(xs>=.8,`${label}: stability order kept left to right (rank correlation ${xs.toFixed(2)})`);
  assert.ok(ys>=.8,`${label}: speed order kept bottom to top (rank correlation ${ys.toFixed(2)})`);
  for(const d of out)assert.ok(Math.abs(d.spot[0])>.235+.04 || d.spot[1]>.4+.04,`${label}: ${atlas[d.id].name} is not on the bag ${d.spot}`);
 };
 await atlasOrder('map 8 (1440)');await layoutChecks('map 8');
 st=await viewer(v=>v.stage);metrics.mapPull=st.pull;
 assert.ok(st.pull>=1 && st.pull<1.7,'The bag stays roughly full size on the map: pull '+st.pull);
 assert.ok(await page.locator('.bag-map-grid').evaluate(n=>getComputedStyle(n).opacity==='1'),'The Stitch grid shows under the map');
 assert.equal(await page.locator('.bag-map-caption').allInnerTexts().then(t=>t.join('|')),'← MORE TURN|STRONGER FADE →|SPEED ↑');
 await shot('map-8-1440-midnight');
 // Toggling works in map mode too.
 await toggle(mains[2]);assert.equal((await outIds()).length,7);assert.equal((await viewer(v=>v.stage)).mode,'map');
 await toggle(mains[2]);assert.equal((await outIds()).length,8);
 check(`6th out: map mode; ${metrics['map 8 (1440)'].count} discs keep the Atlas order (stability ρ ${metrics['map 8 (1440)'].stabilityRank}, speed ρ ${metrics['map 8 (1440)'].speedRank}), none on the bag, none overlapping, all in the canvas and clear of the zoom buttons; bag at pull ${metrics.mapPull.toFixed(2)}×; Stitch grid and axis captions; toggles still work`);

 // 5. Back to five: a smooth glide back to the sides, no popping.
 await toggle(mains[2]);await toggle(mains[7]);
 await startSampling();
 await slot(mains[12]).click();await settled();
 const back=await stopSampling();
 await page.keyboard.press('Escape').catch(()=>{});
 smooth(back,'6 → 5 (side)');
 st=await viewer(v=>v.stage);assert.equal(st.mode,'side');assert.equal(await scene.getAttribute('data-stage'),'side');
 assert.ok(Math.abs(st.pull-metrics.sidePull)<1e-6,'The camera comes back in to the side framing');
 // Names fade while discs move and return when they settle.
 const sawMoving=await page.evaluate(()=>new Promise(resolve=>{const s=document.querySelector('#bagScene'),seen=[];const o=new MutationObserver(()=>seen.push(s.dataset.staging));o.observe(s,{attributes:true,attributeFilter:['data-staging']});document.querySelector(`[data-physical-disc="${s.querySelector('[aria-pressed="true"]').dataset.physicalDisc}"]`).click();setTimeout(()=>{o.disconnect();resolve(seen);},1600);}));
 assert.deepEqual([sawMoving[0],sawMoving.at(-1)],['moving','still'],'Staging goes moving → still');
 await settled();await page.keyboard.press('Escape').catch(()=>{});
 check(`Transitions: 5→6 and 6→5 glide frame by frame with no pops (largest disc step ${metrics['5 → 6 (map)'].worstStep}/${metrics['6 → 5 (side)'].worstStep} m, camera ${metrics['5 → 6 (map)'].worstPullStep}/${metrics['6 → 5 (side)'].worstPullStep} per frame); back at five the camera returns to the side framing; names hide while moving`);

 // 6. Phone: side layout and map mode inside a 360 px canvas.
 for(const id of await outIds())await toggle(id);
 await page.setViewportSize({width:360,height:800});await setTheme('light');await openBag();
 for(const id of [mains[0],goto,mains[9]])await toggle(id);
 assert.equal((await viewer(v=>v.stage)).mode,'side');await layoutChecks('phone side');await shot('side-3-360-light');
 for(const id of [mains[4],putterFront,mains[12],mains[2]])await toggle(id);
 assert.equal((await viewer(v=>v.stage)).mode,'map');await atlasOrder('map 7 (360)');await layoutChecks('phone map');
 metrics.phoneMapPull=await viewer(v=>v.stage.pull);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal scroll on a phone');
 await shot('map-7-360-light');await setTheme('charcoal');await shot('map-7-360-charcoal');
 await page.setViewportSize({width:1440,height:1000});await setTheme('light');await settled();await layoutChecks('desktop map after resize');await shot('map-7-1440-light');
 check(`Phone (360 px): side layout and map mode fit the canvas with names clear of discs; map keeps the Atlas order (ρ ${metrics['map 7 (360)'].stabilityRank}/${metrics['map 7 (360)'].speedRank}); pull ${metrics.phoneMapPull.toFixed(2)}×; restaged on resize`);

 // 7. Reduced motion stages instantly.
 await page.emulateMedia({reducedMotion:'reduce'});
 await slot(mains[12]).evaluate(n=>n.click());
 assert.equal(await viewer(v=>v.stage.moving),false,'Instant with reduced motion');
 await page.emulateMedia({reducedMotion:'no-preference'});
 check('Reduced motion: staging is instant');

 assert.deepEqual(errors,[],'No page errors');
 const gallery=shots.map(name=>`<figure><img src="${name}.png" alt="${name}"><figcaption>${name}</figcaption></figure>`).join('\n');
 fs.writeFileSync(`${dir}/screenshots.html`,`<!doctype html><meta charset="utf-8"><title>Out discs and map mode</title><style>body{font:14px system-ui;background:#111;color:#eee;margin:24px}figure{display:inline-block;margin:0 16px 24px 0;vertical-align:top}img{max-width:680px;border:1px solid #333}</style>\n${gallery}`);
 fs.writeFileSync(`${dir}/qa.json`,JSON.stringify({checks,shots,metrics},null,1));
 console.log(`PASS bag staging: ${checks.length} checks, ${shots.length} screenshots in ${dir} ${JSON.stringify(metrics)}`);
} catch(error) {
 if(errors.length)console.error('Page errors:',errors);
 throw error;
} finally {
 await browser?.close();server.kill();
}
