import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// Out discs on My Bag: a click slides a disc out and it stays out until clicked again, each disc
// on its own. However many are out, they rest in side columns beside the bag (no map mode): split
// relative to each other at their median (the less overstable half left, the more overstable half
// right, even for a bag that leans one way), faster discs higher in each column. A column grows
// (rows close up, then smaller discs, then names beside the discs) before it wraps into a second
// column. With any disc out the canvas spans the page's free width (to the details panel when it
// shows) at its usual height, so the bag keeps its full size on a desktop. A Return all button,
// shown while any disc is out, stows them all at once. Type buttons beside the sort pull out every
// disc of one type and put them back. The Stitch grid sits under the main atlas in every theme.
// Every out disc shows its name, clear of the bag, the discs, the other names, the zoom buttons,
// the pocket button and the return button, on desktops and phones, in every theme. Runs on the
// signed-out demo bag (no account needed).
const config='tests/auth.wrangler.jsonc',state='work/bag-staging/d1-qa',base='https://localhost:8807',dir='outputs/bag-staging';
fs.rmSync(dir,{recursive:true,force:true});
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
 const settled=()=>page.waitForFunction(()=>{const s=document.querySelector('#bagScene'),v=s.querySelector('[data-bag-canvas]').bagViewer;return !v.stage.moving && (s.dataset.staging===undefined || s.dataset.staging==='still') && !s.querySelector('[data-bag-canvas]').getAnimations().length;},null,{timeout:15000});
 const outIds=()=>viewer(v=>v.outDiscs);
 const canvasBox=()=>page.locator('[data-bag-canvas]').evaluate(n=>({width:n.clientWidth,height:n.clientHeight}));
 const local=locator=>locator.evaluate(n=>{const c=n.closest('.bag-scene').querySelector('[data-bag-canvas]').getBoundingClientRect(),r=n.getBoundingClientRect();return {left:r.left-c.left,top:r.top-c.top,width:r.width,height:r.height};});
 const shot=async(name,target=page.locator('[data-bag-canvas]'))=>{await page.evaluate(()=>{document.activeElement?.blur?.();return document.fonts.ready;});await page.waitForTimeout(350);await target.screenshot({path:`${dir}/${name}.png`});shots.push(name);};
 // A click that leaves no details open, so the next disc is never under the phone's bottom sheet.
 const toggle=async id=>{await slot(id).click();await settled();if(await detail.isVisible()){await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});await page.waitForTimeout(60);await settled();}await page.mouse.move(2,2);};
 const openBag=async()=>{await page.goto(base+'/?bag=1');await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s.dataset.engine==='ready' && s.dataset.phase==='open';},null,{timeout:30000});await scene.scrollIntoViewIfNeeded();await page.mouse.move(2,2);};
 // Each demo disc's Atlas position, the same AtlasLayout.positions the map uses.
 const atlasOf=()=>page.evaluate(async()=>{const {DEMO_DISCS}=await import('/bag-demo.js');return Object.fromEntries(DEMO_DISCS.map(item=>{const mold=discs.find(d=>d.id===item.mold_id),p=mold && window.AtlasLayout.positions([mold]).get(mold.id);return [item.id,p?{x:p.x,y:p.y,name:mold.catalogName||mold.name}:null];}));});
 // Out discs' rects and names must sit inside the canvas, discs never on each other, under the zoom
 // buttons, the pocket button or the return button; every out disc shows its name, clear of the
 // bag, every disc, every other name, the zoom buttons, the pocket button and the return button.
 const layoutChecks=async label=>{
  const box=await canvasBox(),rects=(await viewer(v=>v.discRects())).filter(r=>r.out),zoom=await local(page.locator('.bag-zoom'));
  const pocket=await page.locator('[data-bag-pocket]').isVisible()?await local(page.locator('[data-bag-pocket]')):null;
  const ret=await page.locator('.bag-return-all').isVisible()?await local(page.locator('.bag-return-all')):null;
  assert.equal(!!ret,rects.length>0,`${label}: the return button shows exactly while discs are out`);
  if(ret)assert.ok(!overlap(ret,zoom),`${label}: return button clear of the zoom buttons`);
  const bag=await viewer(v=>v.bagRect());
  assert.ok(bag && bag.width>40,`${label}: the bag's silhouette is measured`);
  for(const r of rects){
   assert.ok(r.left>=-1 && r.top>=-1 && r.left+r.width<=box.width+1 && r.top+r.height<=box.height+1,`${label}: ${r.id} inside the canvas ${JSON.stringify(r)}`);
   assert.ok(!overlap(r,zoom),`${label}: ${r.id} clear of the zoom buttons`);
   if(pocket)assert.ok(!overlap(r,pocket),`${label}: ${r.id} clear of the pocket button`);
   if(ret)assert.ok(!overlap(r,ret),`${label}: ${r.id} clear of the return button`);
  }
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
   const a=rects[i],b=rects[j],ca=[a.left+a.width/2,a.top+a.height/2],cb=[b.left+b.width/2,b.top+b.height/2];
   assert.ok(Math.hypot(ca[0]-cb[0],ca[1]-cb[1])>=(Math.min(a.width,b.width))*.98,`${label}: ${a.id} and ${b.id} do not overlap `+JSON.stringify({a,b}));
  }
  const names=await page.locator('[data-out-name]:not([hidden])').evaluateAll(list=>list.map(n=>{const c=n.closest('[data-bag-canvas]').getBoundingClientRect(),r=n.getBoundingClientRect();return {id:n.dataset.outName,left:r.left-c.left,top:r.top-c.top,width:r.width,height:r.height,clipped:n.scrollWidth>n.clientWidth+1};}));
  assert.equal(await page.locator('[data-out-name][hidden]').count(),0,`${label}: no name hidden`);
  assert.deepEqual(names.map(n=>n.id).sort(),rects.map(r=>r.id).sort(),`${label}: every out disc shows its name`);
  for(const n of names){
   assert.ok(!n.clipped,`${label}: name of ${n.id} shows in full`);
   assert.ok(!overlap(n,bag),`${label}: name of ${n.id} clear of the bag `+JSON.stringify({n,bag}));
   assert.ok(!overlap(n,zoom),`${label}: name of ${n.id} clear of the zoom buttons`);
   if(pocket)assert.ok(!overlap(n,pocket),`${label}: name of ${n.id} clear of the pocket button`);
   if(ret)assert.ok(!overlap(n,ret),`${label}: name of ${n.id} clear of the return button`);
   assert.ok(n.left>=0 && n.left+n.width<=box.width+1 && n.top>=0 && n.top+n.height<=box.height+1,`${label}: name of ${n.id} inside the canvas`);
   for(const r of rects)if(r.id!==n.id)assert.ok(!overlap(n,r),`${label}: name of ${n.id} clear of ${r.id}`);
   for(const m of names)if(m!==n)assert.ok(!overlap(n,m),`${label}: names ${n.id} and ${m.id} apart`);
  }
  return {rects,names};
 };
 // The side layout, in the layout's own state and as drawn: every out disc in one column, the
 // relative split (balanced, every left disc no more overstable than every right disc, an even
 // count exactly at the median), columns from the bag outward drawn beside it, faster discs higher
 // in each column; then every layout check.
 const sideCheck=async(out,label)=>{
  const st=await viewer(v=>v.stage),x=id=>atlas[id]?.x ?? .5,y=id=>atlas[id]?.y ?? .5;
  assert.equal(st.mode,'side',`${label}: side layout`);assert.equal(await scene.getAttribute('data-stage'),'side');
  assert.equal(await scene.getAttribute('data-names'),st.labels,`${label}: names ${st.labels}`);
  assert.deepEqual(st.columns.flatMap(c=>c.keys).sort(),[...out].sort(),`${label}: every out disc in one column`);
  const left=out.filter(id=>st.sides[id]==='left'),right=out.filter(id=>st.sides[id]==='right');
  assert.ok(Math.abs(left.length-right.length)<=1,`${label}: even ${left.length}/${right.length}`);
  if(out.length%2===0)assert.equal(left.length,right.length,`${label}: an even count splits exactly at the median`);
  if(left.length && right.length)assert.ok(Math.max(...left.map(x))<=Math.min(...right.map(x)),`${label}: every left disc less overstable than every right disc `+JSON.stringify(out.map(id=>[atlas[id]?.name,x(id).toFixed(2),st.sides[id]])));
  const rects=Object.fromEntries((await viewer(v=>v.discRects())).filter(d=>d.out).map(d=>[d.id,{x:d.left+d.width/2,y:d.top+d.height/2}]));
  const bag=await viewer(v=>v.bagRect());
  for(const id of left)assert.ok(rects[id].x<bag.left,`${label}: ${atlas[id]?.name} drawn left of the bag`);
  for(const id of right)assert.ok(rects[id].x>bag.left+bag.width,`${label}: ${atlas[id]?.name} drawn right of the bag`);
  for(const side of ['left','right']){
   const cols=st.columns.filter(c=>c.side===side);
   for(let i=1;i<cols.length;i++)assert.ok(side==='left'?rects[cols[i].keys[0]].x<rects[cols[i-1].keys[0]].x:rects[cols[i].keys[0]].x>rects[cols[i-1].keys[0]].x,`${label}: ${side} columns run from the bag outward`);
   for(const c of cols)for(let i=1;i<c.keys.length;i++)assert.ok(rects[c.keys[i-1]].y<rects[c.keys[i]].y && y(c.keys[i-1])>=y(c.keys[i]),`${label}: faster discs higher (${atlas[c.keys[i-1]]?.name} over ${atlas[c.keys[i]]?.name})`);
  }
  metrics[label]={count:out.length,labels:st.labels,scale:st.scale,pull:+st.pull.toFixed(2),columns:st.columns.map(c=>c.side[0]+c.keys.length).join(' ')};
  await layoutChecks(label);
  return {left,right};
 };
 const themeShots=async name=>{for(const theme of ['midnight','light','charcoal']){await setTheme(theme);await page.waitForTimeout(250);await layoutChecks(`${name} ${theme}`);await shot(`${name}-${theme}`);}await setTheme('midnight');await page.waitForTimeout(150);};
 // Frame sampling: every out (or returning) disc's live pose and the camera's pull-back, each frame.
 const startSampling=()=>page.locator('[data-bag-canvas]').evaluate(n=>{const s=n.stageSamples=[];n.stageSampling=true;const tick=()=>{const v=n.bagViewer;const state=v.getBagLayoutState().filter(d=>d.slide>0);s.push({t:performance.now(),pull:v.stage.pull,discs:Object.fromEntries(state.map(d=>[d.id,d.pose])),slides:Object.fromEntries(state.map(d=>[d.id,d.slide]))});if(n.stageSampling)requestAnimationFrame(tick);};requestAnimationFrame(tick);});
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
 assert.equal(await page.getByRole('button',{name:'Top view',exact:true}).count(),0,'Top view is removed');
 await toggle(b);await toggle(c);assert.deepEqual(await outIds(),[a,b,c],'Each disc comes out on its own');
 await toggle(b);assert.deepEqual(await outIds(),[a,c],'Clicking one puts back only that one');
 assert.equal(await slot(b).getAttribute('aria-pressed'),'false');
 await slot(c).focus();await page.keyboard.press('Enter');await settled();assert.deepEqual(await outIds(),[a],'Enter toggles too');
 await toggle(a);assert.deepEqual(await outIds(),[]);assert.equal(await scene.getAttribute('data-stage'),null);
 assert.equal(await viewer(v=>v.stage.pull),1,'With nothing out the camera is back at the page view');
 check('Toggle: a click (or Enter) slides a disc out with its details and it stays out through Escape, empty-space clicks, closing the bag; each disc is independent; the next click puts back just that disc');

 // 3a. A bag that leans overstable: its eight most overstable discs, out one by one, still split
 // evenly at their own median, the less overstable half left. Covers a single disc, even counts
 // (exactly at the median), odd ones, and six and more.
 const byStability=reachable.map(([id])=>id).filter(id=>atlas[id]).sort((p,q)=>atlas[q].x-atlas[p].x);
 const leaning=byStability.slice(0,8);metrics.leaningStability=leaning.map(id=>+atlas[id].x.toFixed(3));
 const splits=[];
 for(let i=0;i<leaning.length;i++){
  await toggle(leaning[i]);const out=leaning.slice(0,i+1),{left,right}=await sideCheck(out,`overstable ${out.length} out`);
  if(out.length===1)assert.deepEqual([left.length,right.length],[0,1],'A lone disc rests on the right');
  splits.push(`${left.length}/${right.length}`);
  if(out.length===5)await shot('side-overstable-5-1440-midnight');
 }
 assert.ok(metrics.leaningStability.every(v=>v>=.5),'The set leans overstable: '+metrics.leaningStability);
 await themeShots('side-overstable-8-1440');
 for(const id of [...leaning].reverse())await toggle(id);
 check(`Relative split: the demo bag's eight most overstable discs (stability ${metrics.leaningStability.join(', ')}) still split ${splits.join(', ')}, the less overstable half left, faster higher, every name shown and clear`);

 // 3. One to five: beside the bag, less overstable left and more overstable right, balanced.
 const five=[mains[0],mains[4],goto,mains[9],putterFront];
 for(let i=0;i<five.length;i++){
  await toggle(five[i]);const out=five.slice(0,i+1);
  await sideCheck(out,`${out.length} out`);assert.equal(await scene.getAttribute('data-stage'),'side');
  const st=await viewer(v=>v.stage),state=await viewer(v=>v.getBagLayoutState().filter(d=>d.out));
  for(const d of state)assert.ok(Math.abs(d.spot[0])>.25 && Math.sign(d.spot[0])===(st.sides[d.id]==='left'?-1:1),`${d.id} rests beside the bag on its side`);
 }
 metrics.sidePull=await viewer(v=>v.stage.pull);
 assert.equal(metrics.sidePull,1,'The bag keeps its full size beside five discs: pull '+metrics.sidePull);
 assert.equal(await page.locator('[data-out-name][data-shown]').count(),5,'Every disc beside the bag shows its name');
 await shot('side-5-1440-midnight');
 check(`1–5 out: beside the bag, balanced, every left disc less stable than every right disc, names shown, nothing overlapping; camera pulled back only to ${metrics.sidePull.toFixed(2)}×`);

 // Puts the given discs out (and every other one back), by a direct click on each; Escape closes the details.
 const stageSet=async ids=>{
  const out=await outIds();
  for(const id of out)if(!ids.includes(id))await slot(id).evaluate(n=>n.click());
  for(const id of ids)if(!out.includes(id))await slot(id).evaluate(n=>n.click());
  await settled();if(await detail.isVisible()){await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});}
  await page.mouse.move(2,2);await page.waitForTimeout(60);await settled();
  assert.deepEqual([...await outIds()].sort(),[...ids].sort());
 };
 const returnButton=page.locator('.bag-return-all');
 // Stability mixes from the demo bag, least to most overstable.
 const ranked=reachable.map(([id])=>id).filter(id=>atlas[id]).sort((p,q)=>atlas[p].x-atlas[q].x);
 const spread=(list,count)=>Array.from({length:count},(_,i)=>list[Math.round(i*(list.length-1)/(count-1))]);
 const sets={
  'mixed-6':spread(ranked,6),'overstable-8':ranked.slice(-8),'understable-8':ranked.slice(0,8),'mixed-8':spread(ranked,8),
  'mixed-12':spread(ranked,12),'all':reachable.map(([id])=>id),
 };
 metrics.mixes=Object.fromEntries(Object.entries(sets).map(([k,ids])=>[k,ids.map(id=>+(atlas[id]?.x ?? .5).toFixed(2))]));

 // 4. The sixth and beyond stay in side columns: no map mode, no grid, no captions.
 await startSampling();
 await toggle(mains[12]);
 smooth(await stopSampling(),'5 → 6');
 assert.equal(await scene.getAttribute('data-stage'),'side');assert.equal(await scene.getAttribute('data-out'),'6');
 assert.equal(await page.locator('.bag-map-grid,.bag-map-caption').count(),0,'No map grid or captions around the bag');
 await sideCheck(await outIds(),'6 out (1440, from five)');
 for(const id of [mains[2],mains[7]])await toggle(id);
 await sideCheck(await outIds(),'8 out (1440)');
 let st=await viewer(v=>v.stage);metrics.eightPull=st.pull;
 assert.equal(st.pull,1,'The bag keeps its full size beside eight discs: pull '+st.pull);
 const wide=await page.locator('[data-bag-canvas]').evaluate(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,height:r.height,page:document.documentElement.clientWidth};});
 assert.ok(wide.left<=24.5 && wide.right>=wide.page-24.5,'The canvas spans the page to its gutters: '+JSON.stringify(wide));
 // Toggling re-stacks the columns.
 await toggle(mains[2]);assert.equal((await outIds()).length,7);await sideCheck(await outIds(),'7 out (1440)');
 await toggle(mains[2]);assert.equal((await outIds()).length,8);
 // With the details panel open the canvas ends at the panel and the bag slides over, still full size.
 await nameOf(mains[2]).click();await detail.waitFor({state:'visible'});await settled();await page.waitForTimeout(450);
 const beside=await page.evaluate(()=>{const c=document.querySelector('[data-bag-canvas]').getBoundingClientRect(),d=document.querySelector('#detail');return {right:c.right,panel:d.offsetLeft};});
 assert.ok(beside.right<=beside.panel,'The canvas ends at the details panel: '+JSON.stringify(beside));
 st=await viewer(v=>v.stage);assert.ok(st.pull<=1.0001,'Full-size bag with the panel open: pull '+st.pull);
 await sideCheck(await outIds(),'8 out with details (1440)');await shot('side-8-details-1440-midnight',page);
 await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});await settled();await page.waitForTimeout(450);
 assert.ok(await page.locator('[data-bag-canvas]').evaluate(n=>n.getBoundingClientRect().right>=document.documentElement.clientWidth-24.5),'Closing the panel gives the room back');
 check(`6+ out: still side columns beside the full-size bag (pull ${metrics.eightPull.toFixed(2)}×; eight as ${metrics['8 out (1440)'].columns}, names ${metrics['8 out (1440)'].labels}), no map grid or captions; toggles re-stack; with the details open the canvas ends at the panel and the bag stays full size`);

 // 5. Back to five and out to six again: smooth glides, no popping, the camera unmoved.
 await toggle(mains[2]);await toggle(mains[7]);
 await startSampling();
 await slot(mains[12]).click();await settled();
 const back=await stopSampling();
 await page.keyboard.press('Escape').catch(()=>{});
 smooth(back,'6 → 5');
 st=await viewer(v=>v.stage);assert.equal(st.mode,'side');assert.equal(await scene.getAttribute('data-stage'),'side');
 assert.ok(Math.abs(st.pull-metrics.sidePull)<1e-6,'The camera keeps the side framing');
 await startSampling();await toggle(mains[12]);smooth(await stopSampling(),'5 → 6 again');
 await startSampling();await toggle(mains[12]);smooth(await stopSampling(),'6 → 5 again');
 // Names fade while discs move and return when they settle.
 const sawMoving=await page.evaluate(()=>new Promise(resolve=>{const s=document.querySelector('#bagScene'),seen=[];const o=new MutationObserver(()=>seen.push(s.dataset.staging));o.observe(s,{attributes:true,attributeFilter:['data-staging']});document.querySelector(`[data-physical-disc="${s.querySelector('[aria-pressed="true"]').dataset.physicalDisc}"]`).click();setTimeout(()=>{o.disconnect();resolve(seen);},1600);}));
 assert.deepEqual([sawMoving[0],sawMoving.at(-1)],['moving','still'],'Staging goes moving → still');
 await settled();await page.keyboard.press('Escape').catch(()=>{});
 check(`5↔6 (twice) glide frame by frame with no pops (largest disc step ${metrics['5 → 6'].worstStep}/${metrics['6 → 5'].worstStep} m, camera ${metrics['5 → 6'].worstPullStep}/${metrics['6 → 5'].worstPullStep} per frame); names hide while moving`);

 // 6. Return all: shown while any disc is out, it stows every out disc at once with the slide-in feel.
 await stageSet([]);
 assert.equal(await returnButton.isVisible(),false,'No button with nothing out');
 await toggle(mains[0]);
 assert.equal(await returnButton.isVisible(),true,'Shown with one disc out');
 assert.equal((await returnButton.innerText()).replace(/\s+/g,' ').trim(),'Return all 1');
 assert.equal(await returnButton.getAttribute('aria-label'),'Return all 1 out disc to the bag');
 await layoutChecks('return button, one out');
 // By keyboard: three out, Enter on the button.
 await stageSet([mains[0],goto,mains[9]]);await layoutChecks('return button, three out');
 assert.equal((await returnButton.innerText()).replace(/\s+/g,' ').trim(),'Return all 3');
 await returnButton.focus();await page.keyboard.press('Enter');await settled();
 assert.deepEqual(await outIds(),[],'Enter returns every disc');assert.equal(await returnButton.isVisible(),false,'The button goes with the last disc');
 assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-bag-toggle]')),true,'Focus moves to the bag toggle');
 assert.equal(await scene.getAttribute('data-stage'),null);
 // Eight out, by click, with the details of one out disc open: every disc slides back together.
 await stageSet(sets['mixed-8']);await nameOf(sets['mixed-8'][3]).click();await detail.waitFor({state:'visible'});
 assert.equal(await returnButton.getAttribute('aria-label'),'Return all 8 out discs to the bag');
 await shot('side-8-return-button-1440-midnight');
 await startSampling();const pressed=Date.now();
 await returnButton.click();await settled();const tookAll=Date.now()-pressed;
 const stowSamples=await stopSampling();smooth(stowSamples,'return all 8');
 await detail.waitFor({state:'hidden'});
 assert.deepEqual(await outIds(),[],'Every disc is back');
 assert.equal(await scene.getAttribute('data-stage'),null);assert.equal(await scene.getAttribute('data-out'),null);
 assert.equal(await returnButton.isVisible(),false);
 assert.equal(await viewer(v=>v.stage.pull),1,'The camera is back at the page view');
 assert.ok((await viewer(v=>v.getBagLayoutState())).every(d=>d.slide===0),'Every disc is home in its pocket');
 // At once: every disc starts back on the first frames and all of them land together, each sliding
 // steadily home like a single disc does.
 const slides=id=>stowSamples.map(s=>[s.t,s.slides[id]]).filter(([,v])=>v!==undefined);
 const starts=[],ends=[];
 for(const id of sets['mixed-8']){
  const list=slides(id);assert.ok(list.length>5,`${id} sampled`);
  for(let i=1;i<list.length;i++)assert.ok(list[i][1]<=list[i-1][1]+1e-9,`${id} slides steadily home`);
  starts.push(list.find(([,v])=>v<1-1e-6)?.[0] ?? Infinity);ends.push(list.at(-1)[0]);
 }
 assert.ok(Math.max(...starts)-Math.min(...starts)<120,`All eight leave together (${(Math.max(...starts)-Math.min(...starts)).toFixed(0)} ms apart)`);
 assert.ok(Math.max(...ends)-Math.min(...ends)<120,`All eight land together (${(Math.max(...ends)-Math.min(...ends)).toFixed(0)} ms apart)`);
 // One disc's own way home, for the feel: the same slide length.
 await toggle(mains[0]);await startSampling();const single=Date.now();await slot(mains[0]).click();await settled();const tookOne=Date.now()-single;await stopSampling();
 await page.keyboard.press('Escape').catch(()=>{});
 metrics.returnAll={allMs:tookAll,oneMs:tookOne,startSpreadMs:Math.round(Math.max(...starts)-Math.min(...starts)),endSpreadMs:Math.round(Math.max(...ends)-Math.min(...ends))};
 assert.ok(tookAll<tookOne*1.6+400,`Return all takes about as long as one disc going home (${tookAll} vs ${tookOne} ms)`);
 check(`Return all: hidden with nothing out, "Return all n" from one disc up; Enter or click stows every out disc at once, closes the details, brings the camera home and moves focus to the bag toggle; eight discs leave within ${metrics.returnAll.startSpreadMs} ms and land within ${metrics.returnAll.endSpreadMs} ms of each other, each sliding steadily (${tookAll} ms vs ${tookOne} ms for one disc)`);

 // 6b. Type buttons: each pulls out every disc of its type (as the Atlas types it) and puts them back.
 await stageSet([]);
 const typeButton=type=>page.locator(`[data-type-out="${type}"]`);
 const ofType=type=>page.evaluate(type=>{const scene=document.querySelector('#bagScene'),ids=[...scene.querySelectorAll('[data-physical-disc]')].map(n=>n.dataset.physicalDisc);
  return ids.filter(id=>{const disc=scene.querySelector(`[data-physical-disc="${id}"]`).bagItem,mold=discs.find(d=>d.id===disc.mold_id);return mold && typeOf(mold)===type;});},type);
 const typed={};for(const type of ['distance','fairway','mid','putter'])typed[type]=await ofType(type);
 assert.ok(Object.values(typed).every(ids=>ids.length>0),'The demo bag has all four types: '+JSON.stringify(Object.fromEntries(Object.entries(typed).map(([k,v])=>[k,v.length]))));
 for(const type of Object.keys(typed))assert.equal(await typeButton(type).getAttribute('aria-pressed'),'false');
 await typeButton('distance').click();await settled();
 assert.deepEqual([...await outIds()].sort(),[...typed.distance].sort(),'Distance pulls out every distance driver');
 assert.equal(await typeButton('distance').getAttribute('aria-pressed'),'true');
 assert.equal(await viewer(v=>v.stage.pull),1,'Full-size bag');
 await typeButton('fairway').click();await settled();
 assert.deepEqual([...await outIds()].sort(),[...typed.distance,...typed.fairway].sort(),'Fairway adds every fairway driver');
 await sideCheck(await outIds(),'types distance + fairway (1440)');await shot('types-distance-fairway-1440-midnight',page);
 await typeButton('distance').click();await settled();
 assert.deepEqual([...await outIds()].sort(),[...typed.fairway].sort(),'A second click puts the distance drivers back and leaves the fairways out');
 assert.equal(await typeButton('distance').getAttribute('aria-pressed'),'false');assert.equal(await typeButton('fairway').getAttribute('aria-pressed'),'true');
 // A disc out on its own counts toward its type; returning the type returns it too.
 await toggle(typed.mid[0]);
 await typeButton('mid').click();await settled();{const out=await outIds();assert.ok(typed.mid.every(id=>out.includes(id)),'Mid pulls out the rest of the midranges');}
 assert.equal(await typeButton('mid').getAttribute('aria-pressed'),'true');
 await typeButton('mid').click();await settled();assert.ok((await outIds()).every(id=>!typed.mid.includes(id)),'Mid goes back, including the one out on its own');
 // With the bag closed, a type button opens it first (putters too).
 await returnButton.click();await settled();await page.locator('[data-bag-toggle]').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='closed');
 await typeButton('putter').click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='open' && document.querySelector('[data-bag-canvas]').bagViewer.outDiscs.length>0,null,{timeout:15000});await settled();
 assert.equal(await scene.getAttribute('data-phase'),'open','The bag opens for a type button');
 assert.deepEqual([...await outIds()].sort(),[...typed.putter].sort(),'Putter pulls out every putter');
 await returnButton.click();await settled();
 for(const type of Object.keys(typed))assert.equal(await typeButton(type).getAttribute('aria-pressed'),'false','Return all releases every type');
 check(`Type buttons: Distance, Fairway, Midrange and Putter each pull out every disc of that type (${Object.entries(typed).map(([k,v])=>`${k} ${v.length}`).join(', ')}) and put them back on a second click, leaving other out discs out; pressed while all of a type are out; a closed bag opens first; the bag stays full size`);

 // 7. Screenshots: the side columns with various counts and stability mixes, in all three themes.
 for(const [name,ids] of Object.entries(sets)){
  await stageSet(ids);await sideCheck(ids,`${name} (1440)`);
  assert.equal(metrics[`${name} (1440)`].pull,1,`${name}: full-size bag`);
  await themeShots(`side-${name}-1440`);
 }
 check(`Desktop (1440): ${Object.keys(sets).map(k=>`${k} as ${metrics[`${k} (1440)`].columns} (names ${metrics[`${k} (1440)`].labels}, scale ${metrics[`${k} (1440)`].scale})`).join('; ')}; full-size bag and every name for every mix, all eighteen included; midnight, light and charcoal`);

 // 8. Phone: the same side columns inside a 360 px canvas, every name shown.
 await stageSet([]);await setTheme('light');
 await page.setViewportSize({width:360,height:800});await openBag();
 for(const id of [mains[0],goto,mains[9]])await toggle(id);
 await sideCheck([mains[0],goto,mains[9]],'phone 3');await shot('side-3-360-light');
 await stageSet([]);
 for(const id of leaning)await toggle(id);
 await sideCheck(leaning,'phone overstable 8');await themeShots('side-overstable-8-360');
 const phoneSets={'mixed-6':sets['mixed-6'],'understable-8':sets['understable-8'],'mixed-10':spread(ranked,10),'mixed-12':sets['mixed-12'],'all':sets.all};
 for(const [name,ids] of Object.entries(phoneSets)){
  await stageSet(ids);await sideCheck(ids,`${name} (360)`);
  await themeShots(`side-${name}-360`);
 }
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal scroll on a phone');
 await page.setViewportSize({width:1440,height:1000});await setTheme('light');await stageSet(sets['mixed-8']);await sideCheck(sets['mixed-8'],'after resize (1440)');
 check(`Phone (360 px): side columns fit the canvas with every name, clear of the bag, discs, names, zoom and the pocket button; overstable 8 pull ${metrics['phone overstable 8'].pull}×; ${Object.keys(phoneSets).map(k=>`${k} pull ${metrics[`${k} (360)`].pull}× ${metrics[`${k} (360)`].columns} names ${metrics[`${k} (360)`].labels}`).join('; ')}; restaged on resize`);

 // 9. Reduced motion stages instantly, return all included.
 await page.emulateMedia({reducedMotion:'reduce'});
 await slot(mains[12]).evaluate(n=>n.click());
 assert.equal(await viewer(v=>v.stage.moving),false,'Instant with reduced motion');
 await returnButton.evaluate(n=>n.click());
 assert.equal(await viewer(v=>v.stage.moving),false,'Return all is instant too');assert.deepEqual(await outIds(),[]);
 await page.emulateMedia({reducedMotion:'no-preference'});
 check('Reduced motion: staging and return all are instant');

 assert.deepEqual(errors,[],'No page errors');
 const gallery=shots.map(name=>`<figure><img src="${name}.png" alt="${name}"><figcaption>${name}</figcaption></figure>`).join('\n');
 fs.writeFileSync(`${dir}/screenshots.html`,`<!doctype html><meta charset="utf-8"><title>Out discs in side columns</title><style>body{font:14px system-ui;background:#111;color:#eee;margin:24px}figure{display:inline-block;margin:0 16px 24px 0;vertical-align:top}img{max-width:680px;border:1px solid #333}</style>\n${gallery}`);
 fs.writeFileSync(`${dir}/qa.json`,JSON.stringify({checks,shots,metrics},null,1));
 console.log(`PASS bag staging: ${checks.length} checks, ${shots.length} screenshots in ${dir} ${JSON.stringify(metrics)}`);
} catch(error) {
 if(errors.length)console.error('Page errors:',errors);
 throw error;
} finally {
 await browser?.close();server.kill();
}
