import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// Out discs on My Bag (Oct 6): a click slides a disc out and it stays out until clicked again,
// each disc on its own. One to five rest beside the bag, split relative to each other (the less
// overstable half left, the more overstable half right, even for a bag that leans one way);
// the sixth turns on map mode, where the out discs spread evenly on a ring around the bag (even
// angles, in stability order clockwise from the lower left), on the Stitch grid; back to five
// returns to the sides. A Return all button, shown while any disc is out, stows them all at once.
// The same grid sits under the main atlas in every theme. Every out disc shows its name in both
// layouts (a phone crowd too big for names keeps them on hover and focus), clear of the bag, the
// discs, the other names, the zoom buttons, the return button and the map's captions. Runs on
// the signed-out demo bag (no account needed).
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
 const shot=async(name,target=page.locator('[data-bag-canvas]'))=>{await page.evaluate(()=>{document.activeElement?.blur?.();return document.fonts.ready;});await page.waitForTimeout(350);await target.screenshot({path:`${dir}/${name}.png`});shots.push(name);};
 // A click that leaves no details open, so the next disc is never under the phone's bottom sheet.
 const toggle=async id=>{await slot(id).click();await settled();if(await detail.isVisible()){await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});}await page.mouse.move(2,2);};
 const openBag=async()=>{await page.goto(base+'/?bag=1');await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s.dataset.engine==='ready' && s.dataset.phase==='open';},null,{timeout:30000});await scene.scrollIntoViewIfNeeded();await page.mouse.move(2,2);};
 // Each demo disc's Atlas position, the same AtlasLayout.positions the map uses.
 const atlasOf=()=>page.evaluate(async()=>{const {DEMO_DISCS}=await import('/bag-demo.js');return Object.fromEntries(DEMO_DISCS.map(item=>{const mold=discs.find(d=>d.id===item.mold_id),p=mold && window.AtlasLayout.positions([mold]).get(mold.id);return [item.id,p?{x:p.x,y:p.y,name:mold.catalogName||mold.name}:null];}));});
 // Out discs' rects and names must sit inside the canvas, discs never on each other, under the zoom
 // buttons or under the return button; every out disc shows its name (a crowd too big for names on
 // a phone ring shows none), clear of the bag, every disc, every other name, the zoom buttons, the
 // return button and (on the map) the axis captions.
 const layoutChecks=async label=>{
  const box=await canvasBox(),rects=(await viewer(v=>v.discRects())).filter(r=>r.out),zoom=await local(page.locator('.bag-zoom'));
  const ret=await page.locator('.bag-return-all').isVisible()?await local(page.locator('.bag-return-all')):null;
  assert.equal(!!ret,rects.length>0,`${label}: the return button shows exactly while discs are out`);
  if(ret)assert.ok(!overlap(ret,zoom),`${label}: return button clear of the zoom buttons`);
  const hiddenNames=await scene.getAttribute('data-names')==='none';
  const bag=await viewer(v=>v.bagRect()),map=await scene.getAttribute('data-stage')==='map';
  const captions=map?await page.locator('.bag-map-caption').evaluateAll(list=>list.map(n=>{const c=n.closest('.bag-scene').querySelector('[data-bag-canvas]').getBoundingClientRect(),r=n.getBoundingClientRect();return {text:n.textContent,left:r.left-c.left,top:r.top-c.top,width:r.width,height:r.height};})):[];
  assert.ok(bag && bag.width>40,`${label}: the bag's silhouette is measured`);
  for(const r of rects)for(const c of captions)assert.ok(!overlap(r,c),`${label}: ${r.id} clear of the "${c.text}" caption`);
  for(const r of rects){
   assert.ok(r.left>=-1 && r.top>=-1 && r.left+r.width<=box.width+1 && r.top+r.height<=box.height+1,`${label}: ${r.id} inside the canvas ${JSON.stringify(r)}`);
   assert.ok(!overlap(r,zoom),`${label}: ${r.id} clear of the zoom buttons`);
   if(ret)assert.ok(!overlap(r,ret),`${label}: ${r.id} clear of the return button`);
  }
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
   const a=rects[i],b=rects[j],ca=[a.left+a.width/2,a.top+a.height/2],cb=[b.left+b.width/2,b.top+b.height/2];
   assert.ok(Math.hypot(ca[0]-cb[0],ca[1]-cb[1])>=(Math.min(a.width,b.width))*.98,`${label}: ${a.id} and ${b.id} do not overlap `+JSON.stringify({a,b}));
  }
  const names=await page.locator('[data-out-name]:not([hidden])').evaluateAll(list=>list.map(n=>{const c=n.closest('[data-bag-canvas]').getBoundingClientRect(),r=n.getBoundingClientRect();return {id:n.dataset.outName,left:r.left-c.left,top:r.top-c.top,width:r.width,height:r.height};}));
  if(hiddenNames)assert.equal(names.length,0,`${label}: a crowd too big for names shows none`);
  else{assert.equal(await page.locator('[data-out-name][hidden]').count(),0,`${label}: no name hidden`);assert.deepEqual(names.map(n=>n.id).sort(),rects.map(r=>r.id).sort(),`${label}: every out disc shows its name`);}
  for(const n of names){
   assert.ok(!overlap(n,bag),`${label}: name of ${n.id} clear of the bag `+JSON.stringify({n,bag}));
   assert.ok(!overlap(n,zoom),`${label}: name of ${n.id} clear of the zoom buttons`);
   if(ret)assert.ok(!overlap(n,ret),`${label}: name of ${n.id} clear of the return button`);
   for(const c of captions)assert.ok(!overlap(n,c),`${label}: name of ${n.id} clear of the "${c.text}" caption`);
   assert.ok(n.left>=0 && n.left+n.width<=box.width+1 && n.top>=0 && n.top+n.height<=box.height+1,`${label}: name of ${n.id} inside the canvas`);
   for(const r of rects)if(r.id!==n.id)assert.ok(!overlap(n,r),`${label}: name of ${n.id} clear of ${r.id}`);
   for(const m of names)if(m!==n)assert.ok(!overlap(n,m),`${label}: names ${n.id} and ${m.id} apart`);
  }
  return {rects,names};
 };
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

 // 3a. A bag that leans overstable: the five most overstable discs still split evenly, the less
 // overstable half left. Covers a single disc, even counts (exactly at the median) and odd ones.
 const byStability=reachable.map(([id])=>id).filter(id=>atlas[id]).sort((p,q)=>atlas[q].x-atlas[p].x);
 const leaning=byStability.slice(0,5);metrics.leaningStability=leaning.map(id=>+atlas[id].x.toFixed(3));
 const sideCheck=async(out,label)=>{
  const st=await viewer(v=>v.stage),x=id=>atlas[id]?.x ?? .5;
  assert.equal(st.mode,'side',`${label}: side layout`);
  const left=out.filter(id=>st.sides[id]==='left'),right=out.filter(id=>st.sides[id]==='right');
  assert.ok(Math.abs(left.length-right.length)<=1,`${label}: even ${left.length}/${right.length}`);
  if(left.length && right.length)assert.ok(Math.max(...left.map(x))<=Math.min(...right.map(x)),`${label}: every left disc less overstable than every right disc `+JSON.stringify(out.map(id=>[atlas[id]?.name,x(id).toFixed(2),st.sides[id]])));
  if(out.length%2===0)assert.equal(left.length,right.length,`${label}: an even count splits exactly at the median`);
  // Faster discs higher within each column.
  const state=await viewer(v=>v.getBagLayoutState().filter(d=>d.out)),y=Object.fromEntries(state.map(d=>[d.id,d.spot[1]]));
  for(const column of [left,right])for(const p of column)for(const q of column)if(atlas[p]&&atlas[q]&&atlas[p].y>atlas[q].y+1e-9)assert.ok(y[p]>y[q],`${label}: ${atlas[p].name} (faster) above ${atlas[q].name}`);
  await layoutChecks(label);
  return {left,right};
 };
 for(let i=0;i<leaning.length;i++){
  await toggle(leaning[i]);const out=leaning.slice(0,i+1),{left,right}=await sideCheck(out,`overstable ${out.length} out`);
  if(out.length===1)assert.deepEqual([left.length,right.length],[0,1],'A lone disc rests on the right');
 }
 assert.ok(metrics.leaningStability.filter(v=>v>=.5).length>=3,'The set leans overstable: '+metrics.leaningStability);
 await shot('side-overstable-5-1440-midnight');
 for(const id of [...leaning].reverse())await toggle(id);
 check(`Relative split: the demo bag's five most overstable discs (stability ${metrics.leaningStability.join(', ')}) still split 0/1, 1/1, 1/2, 2/2, 2/3 — less overstable half left, faster higher, every name shown and clear`);

 // 3. One to five: beside the bag, less overstable left and more overstable right, balanced.
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
 const sideNames=await page.locator('[data-out-name][data-shown]').count();assert.equal(sideNames,5,'Every disc beside the bag shows its name');
 await shot('side-5-1440-midnight');
 check(`1–5 out: beside the bag, balanced, every left disc less stable than every right disc, names shown, nothing overlapping; camera pulled back only to ${metrics.sidePull.toFixed(2)}×`);

 // Map mode is an even ring: each out disc's angle (as seen from the ring's center) is one even
 // step from the next, in stability order clockwise from just left of the bottom (most turn) up,
 // over the top and down to just right of the bottom (most fade). Checked exactly in the ring's
 // own state and, as drawn, from the discs' screen positions.
 const ringOrderOf=ids=>ids.map((id,i)=>({id,i})).sort((p,q)=>(atlas[p.id]?.x ?? .5)-(atlas[q.id]?.x ?? .5)||p.i-q.i).map(o=>o.id);
 const ringChecks=async label=>{
  const st=await viewer(v=>v.stage),out=await outIds(),n=out.length,step=2*Math.PI/n,order=ringOrderOf(out);
  assert.equal(st.mode,'map',`${label}: map mode`);assert.ok(st.ring,`${label}: a ring`);
  order.forEach((id,rank)=>assert.ok(Math.abs(st.ring.angles[id]-(-Math.PI/2-(rank+.5)*step))<1e-9,`${label}: ${atlas[id]?.name} at even angle ${rank} of ${n}`));
  // As drawn: angles clockwise from straight down around the ring's center (where the disc centers' ring is).
  const state=await viewer(v=>v.getBagLayoutState().filter(d=>d.out)),spot=Object.fromEntries(state.map(d=>[d.id,d.spot]));
  const {center,a,b}=st.ring,first=order[0],t=st.ring.angles[first],r=a*b/Math.hypot(b*Math.cos(t),a*Math.sin(t)),lift=spot[first][1]-center[1]-r*Math.sin(t);
  const hub=await viewer((v,p)=>v.projectPoint(p),[center[0],center[1]+lift,spot[first][2]]);
  const rects=Object.fromEntries((await viewer(v=>v.discRects())).filter(d=>d.out).map(d=>[d.id,{x:d.left+d.width/2,y:d.top+d.height/2}]));
  const turn=id=>{const p=rects[id];return ((Math.atan2(-(p.x-hub.x),p.y-hub.y)%(2*Math.PI))+2*Math.PI)%(2*Math.PI);};
  const turns=order.map(turn),drawnOrder=[...order].sort((p,q)=>turn(p)-turn(q));
  assert.deepEqual(drawnOrder,order,`${label}: drawn clockwise from the bottom in stability order `+JSON.stringify(order.map(id=>[atlas[id]?.name,(atlas[id]?.x??.5).toFixed(2),(turn(id)*180/Math.PI).toFixed(0)])));
  const gaps=turns.map((v,i)=>((turns[(i+1)%n]-v)+2*Math.PI)%(2*Math.PI)),spacing=order.map((id,i)=>{const p=rects[id],q=rects[order[(i+1)%n]];return Math.hypot(p.x-q.x,p.y-q.y);});
  const evenness={gapMin:+(Math.min(...gaps)/step).toFixed(2),gapMax:+(Math.max(...gaps)/step).toFixed(2),spacingRatio:+(Math.max(...spacing)/Math.min(...spacing)).toFixed(2)};
  assert.ok(evenness.gapMin>=.75 && evenness.gapMax<=1.3,`${label}: even angles as drawn ${JSON.stringify(evenness)}`);
  assert.ok(evenness.spacingRatio<=1.8,`${label}: a fairly even spread ${JSON.stringify(evenness)}`);
  // The less overstable half of the arc on the left of the bag, the more overstable half on the right.
  const mid=(await viewer(v=>v.bagRect())),bagX=mid.left+mid.width/2;
  order.forEach((id,rank)=>{if(n%2 && rank===(n-1)/2)return;assert.equal(Math.sign(rects[id].x-bagX),rank<n/2?-1:1,`${label}: ${atlas[id]?.name} on its half of the arc`);});
  metrics[label]={count:n,names:st.names,pull:+st.pull.toFixed(2),...evenness};
  return st;
 };
 // Puts the given discs out (and every other one back), by a direct click on each; Escape closes the details.
 const stageSet=async ids=>{
  const out=await outIds();
  for(const id of out)if(!ids.includes(id))await slot(id).evaluate(n=>n.click());
  for(const id of ids)if(!out.includes(id))await slot(id).evaluate(n=>n.click());
  await settled();if(await detail.isVisible()){await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});}
  await page.mouse.move(2,2);await settled();
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
 assert.ok(sets['overstable-8'].every(id=>atlas[id].x>=.5) || sets['overstable-8'].filter(id=>atlas[id].x>=.5).length>=6,'The overstable set leans overstable');

 // 4. The sixth turns on map mode: every out disc spreads evenly around the bag.
 await startSampling();
 await toggle(mains[12]);
 smooth(await stopSampling(),'5 → 6 (ring)');
 let st=await viewer(v=>v.stage);assert.equal(st.mode,'map');assert.equal(await scene.getAttribute('data-stage'),'map');assert.equal(await scene.getAttribute('data-out'),'6');
 await ringChecks('ring 6 (1440, from the sides)');await layoutChecks('ring 6');
 for(const id of [mains[2],mains[7]])await toggle(id);
 await ringChecks('ring 8 (1440)');await layoutChecks('ring 8');
 st=await viewer(v=>v.stage);metrics.mapPull=st.pull;
 assert.ok(st.pull>=1 && st.pull<1.7,'The bag stays roughly full size around the ring: pull '+st.pull);
 assert.equal(st.names,'full','Every name shows on a desktop ring of eight');
 assert.ok(await page.locator('.bag-map-grid').evaluate(n=>getComputedStyle(n).opacity==='1'),'The Stitch grid shows under the ring');
 assert.equal(await page.locator('.bag-map-caption').allInnerTexts().then(t=>t.join('|')),'← MORE TURN|STRONGER FADE →','The arc runs from more turn to stronger fade; no speed caption');
 // Toggling works in map mode too, and the ring re-spaces evenly.
 await toggle(mains[2]);assert.equal((await outIds()).length,7);await ringChecks('ring 7 (1440)');
 await toggle(mains[2]);assert.equal((await outIds()).length,8);
 check(`6th out: map mode is an even ring around the bag (angles exactly 360°/n apart, drawn within ${metrics['ring 8 (1440)'].gapMin}–${metrics['ring 8 (1440)'].gapMax}× of a step, neighbor spacing ratio ${metrics['ring 8 (1440)'].spacingRatio}), stability order clockwise from the lower left; none on the bag, none overlapping, every name shown; bag at pull ${metrics.mapPull.toFixed(2)}×; toggles re-space the ring`);

 // 5. Back to five: a smooth glide back to the sides, no popping; then 5 → 6 again.
 await toggle(mains[2]);await toggle(mains[7]);
 await startSampling();
 await slot(mains[12]).click();await settled();
 const back=await stopSampling();
 await page.keyboard.press('Escape').catch(()=>{});
 smooth(back,'6 → 5 (side)');
 st=await viewer(v=>v.stage);assert.equal(st.mode,'side');assert.equal(await scene.getAttribute('data-stage'),'side');assert.equal(st.ring,null);
 assert.ok(Math.abs(st.pull-metrics.sidePull)<1e-6,'The camera comes back in to the side framing');
 await startSampling();await toggle(mains[12]);smooth(await stopSampling(),'5 → 6 again');
 assert.equal((await viewer(v=>v.stage)).mode,'map');
 await startSampling();await toggle(mains[12]);smooth(await stopSampling(),'6 → 5 again');
 assert.equal((await viewer(v=>v.stage)).mode,'side');
 // Names fade while discs move and return when they settle.
 const sawMoving=await page.evaluate(()=>new Promise(resolve=>{const s=document.querySelector('#bagScene'),seen=[];const o=new MutationObserver(()=>seen.push(s.dataset.staging));o.observe(s,{attributes:true,attributeFilter:['data-staging']});document.querySelector(`[data-physical-disc="${s.querySelector('[aria-pressed="true"]').dataset.physicalDisc}"]`).click();setTimeout(()=>{o.disconnect();resolve(seen);},1600);}));
 assert.deepEqual([sawMoving[0],sawMoving.at(-1)],['moving','still'],'Staging goes moving → still');
 await settled();await page.keyboard.press('Escape').catch(()=>{});
 check(`Threshold both ways: 5→6 and 6→5 (twice) glide frame by frame with no pops (largest disc step ${metrics['5 → 6 (ring)'].worstStep}/${metrics['6 → 5 (side)'].worstStep} m, camera ${metrics['5 → 6 (ring)'].worstPullStep}/${metrics['6 → 5 (side)'].worstPullStep} per frame); back at five the camera returns to the side framing; names hide while moving`);

 // 6. Return all: shown while any disc is out, it stows every out disc at once with the slide-in feel.
 await stageSet([]);
 assert.equal(await returnButton.isVisible(),false,'No button with nothing out');
 await toggle(mains[0]);
 assert.equal(await returnButton.isVisible(),true,'Shown with one disc out');
 assert.equal((await returnButton.innerText()).replace(/\s+/g,' ').trim(),'Return all 1');
 assert.equal(await returnButton.getAttribute('aria-label'),'Return all 1 out disc to the bag');
 await layoutChecks('return button, one out');
 // Side mode, by keyboard: three out, Enter on the button.
 await stageSet([mains[0],goto,mains[9]]);await layoutChecks('return button, three out');
 assert.equal((await returnButton.innerText()).replace(/\s+/g,' ').trim(),'Return all 3');
 await returnButton.focus();await page.keyboard.press('Enter');await settled();
 assert.deepEqual(await outIds(),[],'Enter returns every disc');assert.equal(await returnButton.isVisible(),false,'The button goes with the last disc');
 assert.equal(await page.evaluate(()=>document.activeElement?.matches('[data-bag-toggle]')),true,'Focus moves to the bag toggle');
 assert.equal(await scene.getAttribute('data-stage'),null);
 // Map mode, by click, with the details of one out disc open: every disc slides back together.
 await stageSet(sets['mixed-8']);await nameOf(sets['mixed-8'][3]).click();await detail.waitFor({state:'visible'});
 assert.equal(await returnButton.getAttribute('aria-label'),'Return all 8 out discs to the bag');
 await shot('ring-8-return-button-1440-midnight');
 await startSampling();const pressed=Date.now();
 await returnButton.click();await settled();const tookAll=Date.now()-pressed;
 const stowSamples=await stopSampling();smooth(stowSamples,'return all 8 (ring → bag)');
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
 check(`Return all: hidden with nothing out, "Return all n" from one disc up; Enter or click stows every out disc at once (side and ring), closes the details, brings the camera home and moves focus to the bag toggle; eight discs leave within ${metrics.returnAll.startSpreadMs} ms and land within ${metrics.returnAll.endSpreadMs} ms of each other, each sliding steadily (${tookAll} ms vs ${tookOne} ms for one disc)`);

 // 7. Screenshots: the ring with various counts and stability mixes, in all three themes.
 const themeShots=async name=>{for(const theme of ['midnight','light','charcoal']){await setTheme(theme);await page.waitForTimeout(250);await layoutChecks(`${name} ${theme}`);await shot(`${name}-${theme}`);}};
 for(const [name,ids] of Object.entries(sets)){
  await stageSet(ids);await ringChecks(`ring ${name} (1440)`);await layoutChecks(`ring ${name} (1440)`);
  await themeShots(`ring-${name}-1440`);
 }
 assert.ok(['mixed-6','overstable-8','understable-8','mixed-8','mixed-12','all'].every(k=>metrics[`ring ${k} (1440)`].names==='full'),'Every name shows on desktop rings up to all eighteen');
 check(`Desktop rings (1440): ${Object.keys(sets).map(k=>`${k} pull ${metrics[`ring ${k} (1440)`].pull}× gaps ${metrics[`ring ${k} (1440)`].gapMin}–${metrics[`ring ${k} (1440)`].gapMax}`).join('; ')}; every mix spreads evenly with every name; midnight, light and charcoal`);

 // 8. Phone: side layout and the ring inside a 360 px canvas.
 await stageSet([]);await setTheme('light');
 await page.setViewportSize({width:360,height:800});await openBag();
 for(const id of [mains[0],goto,mains[9]])await toggle(id);
 assert.equal((await viewer(v=>v.stage)).mode,'side');await layoutChecks('phone side');await shot('side-3-360-light');
 await stageSet([]);
 for(const id of leaning)await toggle(id);
 await sideCheck(leaning,'phone overstable 5');await shot('side-overstable-5-360-light');
 const phoneSets={'mixed-6':sets['mixed-6'],'overstable-8':sets['overstable-8'],'understable-8':sets['understable-8'],'mixed-10':spread(ranked,10),'mixed-12':sets['mixed-12'],'all':sets.all};
 for(const [name,ids] of Object.entries(phoneSets)){
  await stageSet(ids);await ringChecks(`ring ${name} (360)`);await layoutChecks(`ring ${name} (360)`);
  await themeShots(`ring-${name}-360`);
 }
 // A crowd too big for names on a phone ring keeps every disc clean and names on focus.
 const crowd=Object.keys(phoneSets).filter(k=>metrics[`ring ${k} (360)`].names==='none');
 if(crowd.length){
  await stageSet(phoneSets[crowd.at(-1)]);const id=phoneSets[crowd.at(-1)][0];
  assert.equal(await scene.getAttribute('data-names'),'none');
  await slot(id).focus();await page.locator('.bag-hover-name').waitFor({state:'visible'});
  assert.equal(await page.locator('.bag-hover-name').innerText(),atlas[id].name,'Focus names a disc on a crowded ring');
  await page.mouse.move(2,2);await slot(id).blur();
 }
 assert.ok(['mixed-6','overstable-8','understable-8'].every(k=>metrics[`ring ${k} (360)`].names==='full'),'Every name shows on phone rings up to eight');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal scroll on a phone');
 await page.setViewportSize({width:1440,height:1000});await setTheme('light');await stageSet(sets['mixed-8']);await layoutChecks('desktop ring after resize');await ringChecks('ring after resize (1440)');
 check(`Phone (360 px): side layout (also the overstable-leaning five) and the ring fit the canvas, clear of the bag, discs, names, zoom, the return button and the captions; ${Object.keys(phoneSets).map(k=>`${k} pull ${metrics[`ring ${k} (360)`].pull}× names ${metrics[`ring ${k} (360)`].names}`).join('; ')}; a crowd too big for names keeps them on focus; restaged on resize`);

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
 fs.writeFileSync(`${dir}/screenshots.html`,`<!doctype html><meta charset="utf-8"><title>Out discs and map mode</title><style>body{font:14px system-ui;background:#111;color:#eee;margin:24px}figure{display:inline-block;margin:0 16px 24px 0;vertical-align:top}img{max-width:680px;border:1px solid #333}</style>\n${gallery}`);
 fs.writeFileSync(`${dir}/qa.json`,JSON.stringify({checks,shots,metrics},null,1));
 console.log(`PASS bag staging: ${checks.length} checks, ${shots.length} screenshots in ${dir} ${JSON.stringify(metrics)}`);
} catch(error) {
 if(errors.length)console.error('Page errors:',errors);
 throw error;
} finally {
 await browser?.close();server.kill();
}
