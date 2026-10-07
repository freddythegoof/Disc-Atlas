import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
// Out discs on My Bag: a click slides a disc out and it stays out until clicked again, each disc
// on its own. However many are out, they rest scattered beside the bag like discs tossed on a table
// (no map mode, no columns): split relative to each other at their median (the less overstable half
// left, the more overstable half right, even for a bag that leans one way), spread evenly over each
// side, all one size, each tipped a little, faster discs toward the top. The same set always lands
// the same way. With any disc out the canvas spans the page's free width (to the details panel when
// it shows) at its usual height, so the bag keeps its full size on a desktop. A Return all button,
// shown while any disc is out, stows them all at once. Type buttons beside the sort pull out every
// disc of one type and put them back. The Stitch grid sits under the main atlas in every theme.
// Every out disc shows its name, clear of the bag, the discs and the other names, on desktops and
// phones, in every theme. The controls (putter pocket, zoom, open/close) sit in one cluster under
// the canvas, with the return button in the row under it, so none of them ever covers a disc or a
// name. Since Oct 7 a disc's click opens no details: its name's popup does. Runs on the signed-out
// demo bag (no account needed), served with six more main discs so every count up to 24 can come out.
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
// The demo bag plus six main discs (24 in the bag), as the popup suite serves it.
const EXTRA=[['cbb390068b86','Gold',174,8,'#ed7868'],['9554f962a394','Neo',173,9,'#70b7cd'],['0dc8d1cbf7b6','Neo',172,9,'#a7c68c'],['b880e2ae803c','Opto',175,8,'#b99bdd'],['f5fb00eb9fa5','Neo',177,9,'#e49376'],['d52158a41efd','ESP',174,9,'#79b3a8']];
const demoSource=fs.readFileSync('public/bag-demo.js','utf8');
const bigDemo=demoSource.replace("capacity:24,main_capacity:20","capacity:32,main_capacity:26")
 .replace(' // Storage: off the course for now',EXTRA.map(([id,plastic,weight,wear,color])=>` ['${id}','${plastic}',${weight},${wear},'${color}','main',null,''],`).join('\n')+'\n // Storage: off the course for now');
assert.notEqual(bigDemo,demoSource,'The test bag is built');
try {
 const deadline=Date.now()+45000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
 await context.route('**/bag-demo.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:bigDemo}));
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
 // Details open from a name's popup: click the name (it pins the popup), then the popup.
 const openDetails=async id=>{await nameOf(id).click();await page.locator('.bag-disc-popup:not([hidden])').click();await detail.waitFor({state:'visible'});};
 // A click that leaves no details open, so the next disc is never under the phone's bottom sheet.
 const toggle=async id=>{await slot(id).click();await settled();if(await detail.isVisible()){await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});await page.waitForTimeout(60);await settled();}await page.mouse.move(2,2);};
 const openBag=async()=>{await page.goto(base+'/?bag=1');await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s.dataset.engine==='ready' && s.dataset.phase==='open';},null,{timeout:30000});await scene.scrollIntoViewIfNeeded();await page.mouse.move(2,2);};
 // Each demo disc's Atlas position, the same AtlasLayout.positions the map uses.
 const atlasOf=()=>page.evaluate(async()=>{const {DEMO_DISCS}=await import('/bag-demo.js');return Object.fromEntries(DEMO_DISCS.map(item=>{const mold=discs.find(d=>d.id===item.mold_id),p=mold && window.AtlasLayout.positions([mold]).get(mold.id);return [item.id,p?{x:p.x,y:p.y,name:mold.catalogName||mold.name}:null];}));});
 // Out discs' rects and names must sit inside the canvas, discs never on each other, nor under the
 // control cluster or the return button; every out disc shows its name, clear of the bag, every disc,
 // every other name, the cluster's controls and the return button.
 const layoutChecks=async label=>{
  const all=await viewer(v=>v.discRects()),box=await canvasBox(),rects=all.filter(r=>r.out);
  // The discs standing in the top and front pockets (their visible part) count as the bag.
  const standing=all.filter(r=>!r.out && !r.empty && (r.pocket==='putter' || r.pocket==='goTo'));
  const cluster=await local(page.locator('[data-bag-controls]')),controls=await Promise.all(['[data-bag-pocket]','.bag-zoom','[data-bag-toggle]'].map(s=>local(page.locator(`#bagScene ${s}`))));
  assert.ok(cluster.top>=box.height-.5,`${label}: the control cluster sits under the canvas`);
  const ret=await page.locator('.bag-return-all').isVisible()?await local(page.locator('.bag-return-all')):null;
  assert.equal(!!ret,rects.length>0,`${label}: the return button shows exactly while discs are out`);
  if(ret)assert.ok(ret.top>=cluster.top+cluster.height,`${label}: return button under the cluster`);
  const bag=await viewer(v=>v.bagRect());
  assert.ok(bag && bag.width>40,`${label}: the bag's silhouette is measured`);
  for(const r of rects){
   assert.ok(r.left>=-1 && r.top>=-1 && r.left+r.width<=box.width+1 && r.top+r.height<=box.height+1,`${label}: ${r.id} inside the canvas ${JSON.stringify(r)}`);
   for(const c of controls)assert.ok(!overlap(r,c),`${label}: ${r.id} clear of the control cluster`);
   for(const p of standing)assert.ok(!overlap(r,p),`${label}: ${r.id} clear of ${p.id} standing in its pocket`);
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
   for(const p of standing)assert.ok(!overlap(n,p),`${label}: name of ${n.id} clear of ${p.id} standing in its pocket`);
   for(const c of controls)assert.ok(!overlap(n,c),`${label}: name of ${n.id} clear of the control cluster`);
   if(ret)assert.ok(!overlap(n,ret),`${label}: name of ${n.id} clear of the return button`);
   assert.ok(n.left>=0 && n.left+n.width<=box.width+1 && n.top>=0 && n.top+n.height<=box.height+1,`${label}: name of ${n.id} inside the canvas`);
   for(const r of rects)if(r.id!==n.id)assert.ok(!overlap(n,r),`${label}: name of ${n.id} clear of ${r.id}`);
   for(const m of names)if(m!==n)assert.ok(!overlap(n,m),`${label}: names ${n.id} and ${m.id} apart`);
  }
  return {rects,names};
 };
 // The scatter, in the layout's own state and as drawn: the relative split (balanced, every left
 // disc no more overstable than every right disc, an even count exactly at the median), each disc
 // drawn on its side of the bag (beside it, unless the scatter runs around it on a crowded phone),
 // every disc the same size, faster discs toward the top, each side spread evenly (not clumped in a
 // corner, not one column); then every layout check.
 const sideCheck=async(out,label)=>{
  const st=await viewer(v=>v.stage),x=id=>atlas[id]?.x ?? .5,y=id=>atlas[id]?.y ?? .5;
  assert.equal(st.mode,'scatter',`${label}: scatter layout`);assert.equal(await scene.getAttribute('data-stage'),'scatter');
  assert.equal(await scene.getAttribute('data-names'),st.labels,`${label}: names ${st.labels}`);
  assert.equal(st.columns,undefined,`${label}: no columns`);
  assert.deepEqual(Object.keys(st.sides).sort(),[...out].sort(),`${label}: every out disc placed`);
  const left=out.filter(id=>st.sides[id]==='left'),right=out.filter(id=>st.sides[id]==='right');
  assert.ok(Math.abs(left.length-right.length)<=1,`${label}: even ${left.length}/${right.length}`);
  if(out.length%2===0)assert.equal(left.length,right.length,`${label}: an even count splits exactly at the median`);
  if(left.length && right.length)assert.ok(Math.max(...left.map(x))<=Math.min(...right.map(x)),`${label}: every left disc less overstable than every right disc `+JSON.stringify(out.map(id=>[atlas[id]?.name,x(id).toFixed(2),st.sides[id]])));
  const drawn=Object.fromEntries((await viewer(v=>v.discRects())).filter(d=>d.out).map(d=>[d.id,d]));
  const rects=Object.fromEntries(Object.entries(drawn).map(([id,d])=>[id,{x:d.left+d.width/2,y:d.top+d.height/2}]));
  const bag=await viewer(v=>v.bagRect()),middle=bag.left+bag.width/2,box=await canvasBox();
  for(const id of left)assert.ok(st.around || st.brick?drawn[id].left+drawn[id].width<=middle+1:rects[id].x<bag.left,`${label}: ${atlas[id]?.name} drawn left of the bag`);
  for(const id of right)assert.ok(st.around || st.brick?drawn[id].left>=middle-1:rects[id].x>bag.left+bag.width,`${label}: ${atlas[id]?.name} drawn right of the bag`);
  // One size: every out disc takes the same scale; drawn, they differ only by the camera's
  // perspective (it looks on from one side and above, so nearer discs draw a little larger).
  const scales=(await viewer(v=>v.getBagLayoutState().filter(d=>d.out).map(d=>d.spotScale)));
  assert.ok(scales.every(v=>v===st.scale),`${label}: every out disc the same size (${[...new Set(scales)]})`);
  const sizes=Object.values(drawn).map(d=>Math.max(d.width,d.height));
  assert.ok(Math.max(...sizes)/Math.min(...sizes)<1.2,`${label}: drawn sizes differ only by perspective (${Math.min(...sizes).toFixed(1)}–${Math.max(...sizes).toFixed(1)} px)`);
  const spread={};
  for(const [side,ids] of [['left',left],['right',right]]){
   if(ids.length<2)continue;
   // Faster toward the top, as a lean: a side's fastest disc rests above its slowest when they are
   // clearly apart (a driver and a putter), and with four or more a side, heights follow speed.
   const fastest=ids.reduce((p,q)=>y(q)>y(p)?q:p),slowest=ids.reduce((p,q)=>y(q)<y(p)?q:p);
   if(y(fastest)-y(slowest)>=.3)assert.ok(rects[fastest].y<=rects[slowest].y+1,`${label}: ${side}: the fastest (${atlas[fastest]?.name}) rests above the slowest (${atlas[slowest]?.name})`);
   if(ids.length>=4){
    const rank=v=>{const o=v.map((x,i)=>[x,i]).sort((a,b)=>a[0]-b[0]),r=[];o.forEach(([,i],k)=>{r[i]=k;});return r;};
    const a=rank(ids.map(y)),b=rank(ids.map(id=>-rects[id].y)),n=ids.length,rho=1-6*a.reduce((s,v,i)=>s+(v-b[i])**2,0)/(n*(n*n-1));
    // Firmly on a desktop; on a phone, where a crowd spills above and below the bag, never inverted.
    assert.ok(rho>=(box.width>700?.5:0),`${label}: ${side}: heights lean with speed (ρ ${rho.toFixed(2)})`);
   }
   if(ids.length>=3){
    const ys=ids.map(id=>rects[id].y),xs=ids.map(id=>rects[id].x),cy=ys.reduce((p,q)=>p+q,0)/ys.length/box.height;
    assert.ok(cy>.25 && cy<.75,`${label}: ${side} discs centered down the canvas (${cy.toFixed(2)})`);
    assert.ok((Math.max(...ys)-Math.min(...ys))/box.height>.3,`${label}: ${side} discs spread down the canvas`);
    if(!st.brick)assert.ok(Math.max(...xs)-Math.min(...xs)>Math.min(...sizes)*.25,`${label}: ${side} discs not stacked in one column`);
    spread[side]=+((Math.max(...ys)-Math.min(...ys))/box.height).toFixed(2);
   }
  }
  metrics[label]={count:out.length,labels:st.labels,scale:st.scale,pull:+st.pull.toFixed(2),around:st.around,brick:st.brick,spread};
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
 await page.waitForTimeout(300);assert.equal(await detail.isVisible(),false,'A click opens no details (Oct 7)');
 // Its name's popup opens the details; Escape closes them and leaves the disc out.
 await openDetails(a);assert.equal(await detail.locator('h2').first().innerText(),atlas[a].name,'The popup opens its details');
 await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});assert.deepEqual(await outIds(),[a],'Escape closes the details only');
 // An empty-space click closes them (flap untouched) and leaves the disc out.
 await openDetails(a);
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
 check('Toggle: a click (or Enter) slides a disc out (no details; the popup on its name opens them) and it stays out through Escape, empty-space clicks, closing the bag; each disc is independent; the next click puts back just that disc');

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
  await sideCheck(out,`${out.length} out`);assert.equal(await scene.getAttribute('data-stage'),'scatter');
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

 // 4. The sixth and beyond stay scattered beside the bag: no map mode, no grid, no captions.
 await startSampling();
 await toggle(mains[12]);
 smooth(await stopSampling(),'5 → 6');
 assert.equal(await scene.getAttribute('data-stage'),'scatter');assert.equal(await scene.getAttribute('data-out'),'6');
 assert.equal(await page.locator('.bag-map-grid,.bag-map-caption').count(),0,'No map grid or captions around the bag');
 await sideCheck(await outIds(),'6 out (1440, from five)');
 for(const id of [mains[2],mains[7]])await toggle(id);
 await sideCheck(await outIds(),'8 out (1440)');
 let st=await viewer(v=>v.stage);metrics.eightPull=st.pull;
 assert.equal(st.pull,1,'The bag keeps its full size beside eight discs: pull '+st.pull);
 const wide=await page.locator('[data-bag-canvas]').evaluate(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,height:r.height,page:document.documentElement.clientWidth};});
 assert.ok(wide.left<=24.5 && wide.right>=wide.page-24.5,'The canvas spans the page to its gutters: '+JSON.stringify(wide));
 // Toggling re-scatters them.
 await toggle(mains[2]);assert.equal((await outIds()).length,7);await sideCheck(await outIds(),'7 out (1440)');
 await toggle(mains[2]);assert.equal((await outIds()).length,8);
 // With the details panel open the canvas ends at the panel and the bag slides over, still full size.
 await openDetails(mains[2]);await settled();await page.waitForTimeout(450);
 const beside=await page.evaluate(()=>{const c=document.querySelector('[data-bag-canvas]').getBoundingClientRect(),d=document.querySelector('#detail');return {right:c.right,panel:d.offsetLeft};});
 assert.ok(beside.right<=beside.panel,'The canvas ends at the details panel: '+JSON.stringify(beside));
 st=await viewer(v=>v.stage);assert.ok(st.pull<=1.0001,'Full-size bag with the panel open: pull '+st.pull);
 await sideCheck(await outIds(),'8 out with details (1440)');await shot('side-8-details-1440-midnight',page);
 await page.keyboard.press('Escape');await detail.waitFor({state:'hidden'});await settled();await page.waitForTimeout(450);
 assert.ok(await page.locator('[data-bag-canvas]').evaluate(n=>n.getBoundingClientRect().right>=document.documentElement.clientWidth-24.5),'Closing the panel gives the room back');
 check(`6+ out: still scattered beside the full-size bag (pull ${metrics.eightPull.toFixed(2)}×; eight with names ${metrics['8 out (1440)'].labels}, scale ${metrics['8 out (1440)'].scale}), no map grid or captions; toggles re-scatter; with the details open the canvas ends at the panel and the bag stays full size`);

 // 5. Back to five and out to six again: smooth glides, no popping, the camera unmoved.
 await toggle(mains[2]);await toggle(mains[7]);
 await startSampling();
 await slot(mains[12]).click();await settled();
 const back=await stopSampling();
 await page.keyboard.press('Escape').catch(()=>{});
 smooth(back,'6 → 5');
 st=await viewer(v=>v.stage);assert.equal(st.mode,'scatter');assert.equal(await scene.getAttribute('data-stage'),'scatter');
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
 await stageSet(sets['mixed-8']);await openDetails(sets['mixed-8'][3]);
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

 // 7. The same set always lands the same way: staged in reverse click order, every disc rests where it did.
 const spotsOf=async()=>Object.fromEntries((await viewer(v=>v.getBagLayoutState().filter(d=>d.out))).map(d=>[d.id,[...d.spot,d.spotScale]]));
 await stageSet([]);await stageSet(sets['mixed-12']);const firstSpots=await spotsOf();
 await stageSet([]);for(const id of [...sets['mixed-12']].reverse())await slot(id).evaluate(n=>n.click());await settled();await page.mouse.move(2,2);
 const againSpots=await spotsOf();
 assert.deepEqual(Object.keys(againSpots).sort(),Object.keys(firstSpots).sort());
 for(const [id,spot] of Object.entries(firstSpots))assert.ok(spot.every((v,i)=>Math.abs(v-againSpots[id][i])<1e-9),`${atlas[id]?.name} lands the same way: ${spot} vs ${againSpots[id]}`);
 check('Deterministic: twelve discs staged in reverse click order rest exactly where they did');

 // The requested matrix: 1, 6, 12 and 18 out, a mixed set (spread over the bag's stability range)
 // and the most overstable discs of the bag, in all three themes; then 1–24 out, each count checked
 // in all three themes for zero overlaps.
 const pool=[...ranked,...reachable.map(([id])=>id).filter(id=>!ranked.includes(id))];
 const mixedOf=count=>count===1?[ranked[Math.floor(ranked.length/2)]]:spread(pool,count);
 const matrix=width=>Object.fromEntries([1,6,12,18].flatMap(count=>[[`mixed-${count}`,mixedOf(count)],[`overstable-${count}`,ranked.slice(-count)]]));
 metrics.overstableSets=Object.fromEntries([1,6,12,18].map(count=>[count,ranked.slice(-count).map(id=>+atlas[id].x.toFixed(2))]));
 const sweep=async width=>{
  const pulls=[];
  for(let count=1;count<=pool.length;count++){
   const ids=mixedOf(count);await stageSet(ids);await sideCheck(ids,`sweep ${count} (${width})`);
   for(const theme of ['light','charcoal']){await setTheme(theme);await page.waitForTimeout(200);await layoutChecks(`sweep ${count} (${width}) ${theme}`);}
   await setTheme('midnight');await page.waitForTimeout(150);
   pulls.push(`${count}:${metrics[`sweep ${count} (${width})`].pull}${metrics[`sweep ${count} (${width})`].brick?'r':metrics[`sweep ${count} (${width})`].around?'a':''}`);
  }
  return pulls;
 };
 assert.equal(pool.length,24,'All 24 discs can come out');
 for(const [name,ids] of Object.entries(matrix(1440))){
  await stageSet(ids);await sideCheck(ids,`${name} (1440)`);
  assert.equal(metrics[`${name} (1440)`].pull,1,`${name}: full-size bag`);
  await themeShots(`scatter-${name}-1440`);
 }
 const desktopPulls=await sweep(1440);
 // The bag keeps its full size up to twenty out; past that the camera eases back a little.
 for(const p of desktopPulls){const [count,pull]=p.split(':').map(parseFloat);assert.ok(count<=20?pull===1:pull<1.25,`${count} out: pull ${pull} (${desktopPulls})`);}
 check(`Desktop (1440): 1, 6, 12 and 18 out, mixed and most-overstable (stability ${Object.entries(metrics.overstableSets).map(([k,v])=>`${k}: ${Math.min(...v)}–${Math.max(...v)}`).join('; ')}), shot in midnight, light and charcoal; 1–24 out, every count in all three themes: every disc on its side, one size, faster toward the top, spread evenly, every name in full, no disc, name, bag, control or button overlapping; full-size bag up to twenty out (scale ${[1,6,12,18].map(c=>metrics[`mixed-${c} (1440)`].scale).join('/')}); pull per count ${desktopPulls.join(' ')}`);

 // 8. Phone: the same inside a 360 px canvas.
 await stageSet([]);await setTheme('midnight');
 await page.setViewportSize({width:360,height:800});await openBag();
 for(const id of leaning)await toggle(id);
 await sideCheck(leaning,'phone overstable 8');
 for(const [name,ids] of Object.entries(matrix(360))){
  await stageSet(ids);await sideCheck(ids,`${name} (360)`);
  await themeShots(`scatter-${name}-360`);
 }
 const phonePulls=await sweep(360);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal scroll on a phone');
 await page.setViewportSize({width:1440,height:1000});await setTheme('light');await stageSet(sets['mixed-8']);await sideCheck(sets['mixed-8'],'after resize (1440)');
 check(`Phone (360 px): 1, 6, 12 and 18 out, mixed and most-overstable, shot in all three themes; 1–24 out in all three themes with every name, nothing overlapping; pull per count ${phonePulls.join(' ')} (a: around the bag, r: staggered rows); restaged on resize`);

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
 fs.writeFileSync(`${dir}/screenshots.html`,`<!doctype html><meta charset="utf-8"><title>Out discs scattered</title><style>body{font:14px system-ui;background:#111;color:#eee;margin:24px}figure{display:inline-block;margin:0 16px 24px 0;vertical-align:top}img{max-width:680px;border:1px solid #333}</style>\n${gallery}`);
 fs.writeFileSync(`${dir}/qa.json`,JSON.stringify({checks,shots,metrics},null,1));
 console.log(`PASS bag staging: ${checks.length} checks, ${shots.length} screenshots in ${dir} ${JSON.stringify(metrics)}`);
} catch(error) {
 if(errors.length)console.error('Page errors:',errors);
 throw error;
} finally {
 await browser?.close();server.kill();
}
