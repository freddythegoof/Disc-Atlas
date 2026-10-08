import {createRequire} from 'node:module';
import {execFileSync,spawn} from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';

const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const zoomProfile=process.argv.includes('--zoom-profile');
const selectionProfile=process.argv.includes('--selection-profile');
const profiling=process.argv.includes('--profile')||zoomProfile||selectionProfile;
const baseline=new Map();
if(profiling||process.argv.includes('--baseline'))for(const file of ['web/index.html','public/app.js','public/atlas-map.js','public/atlas-groups.js','public/atlas-groups-worker.js','public/atlas-layout.js','public/atlas-motion.js','public/cosmic.css','public/theme.js']){
 baseline.set(file,execFileSync('git',['show','HEAD:'+file]));
}
let revision=process.argv.includes('--baseline')?'HEAD':'working';
const labelBaseline=new Map();
if(process.argv.includes('--labels-before'))for(const file of ['public/atlas-map.js','public/atlas-groups.js','public/atlas-groups-worker.js'])labelBaseline.set(file,execFileSync('git',['show','HEAD:'+file]));
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"Frontend test: backend excluded"}');return;}
 try{
  const data=labelBaseline.get(file)||(revision==='HEAD'&&baseline.has(file)?baseline.get(file):fs.readFileSync(file));
  res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
const base='http://127.0.0.1:'+server.address().port;
try{
 if(process.argv.includes('--header-menu')){
  const {checkHeaderMenu}=await import('./context-header.mjs');await checkHeaderMenu(browser,base);
 }else if(process.argv.includes('--low-zoom-labels')){
  const {checkLowZoomLabels}=await import('./grouping-zoom.mjs');await checkLowZoomLabels(browser,base);
 }else if(process.argv.includes('--zoom-candidates')){
  const {checkZoomCandidates}=await import('./zoom-candidates.mjs');
  await checkZoomCandidates(browser,base);
 }else if(process.argv.includes('--grouping-zoom')){
  const {checkGroupingZoom}=await import('./grouping-zoom.mjs');
  await checkGroupingZoom(browser,base);
 }else if(process.argv.includes('--label-prominence')){
  const {checkLabelProminence}=await import('./label-prominence.mjs');
  await checkLabelProminence(browser,base);
 }else if(process.argv.includes('--deep-zoom')){
  const {checkDeepZoom}=await import('./deep-zoom.mjs');
  await checkDeepZoom(browser,base);
 }else if(process.argv.includes('--directory')){
  const {checkDirectory}=await import('./directory.mjs');
  await checkDirectory(browser,base);
 }else if(process.argv.includes('--context-header')){
  const {checkContextHeader}=await import('./context-header.mjs');
  await checkContextHeader(browser,base);
 }else if(process.argv.includes('--brand-dropdown')){
  const {checkBrandDropdown}=await import('./brand-dropdown.mjs');
  await checkBrandDropdown(browser,base);
 }else if(process.argv.includes('--type-chips')){
  const {checkTypeChips}=await import('./type-chips.mjs');
  await checkTypeChips(browser,base);
 }else if(process.argv.includes('--filter-regroup')){
  const {checkFilterRegroup}=await import('./filter-regroup.mjs');
  await checkFilterRegroup(browser,base);
 }else if(process.argv.includes('--zoom-boundary')){
  const {checkZoomBoundary}=await import('./zoom-boundary.mjs');
  await checkZoomBoundary(browser,base);
 }else if(process.argv.includes('--premium')){
  const {checkPremium}=await import('./premium.mjs');
  await checkPremium(browser,base);
 }else if(process.argv.includes('--boundaries')){
  const {checkAtlasInteractions}=await import('./atlas-interactions.mjs');
  await checkAtlasInteractions(browser,base);
 }else if(process.argv.includes('--regression')){
  await new Promise((resolve,reject)=>{
   const child=spawn(process.execPath,['tests/redesign.mjs'],{env:{...process.env,ATLAS_URL:base},stdio:'inherit'});
   child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error('Redesign regression failed: '+code)));
  });
 }else if(profiling){
  for(const version of process.argv.includes('--current-only')?['working']:['HEAD','working'])for(const rate of process.argv.includes('--slow-only')?[4]:[1,4]){
   revision=version;
   const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'dark'});
   const page=await context.newPage(),cdp=await context.newCDPSession(page);
   await page.goto(base);await page.locator('.atlas-marker.is-selected').waitFor();await page.evaluate(()=>document.fonts.ready);
   await page.waitForTimeout(400);
   const box=await page.locator('.atlas-marker.is-selected').boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2;
   await page.mouse.move(x,y);if(!zoomProfile&&!selectionProfile)await page.mouse.down();
   await cdp.send('Emulation.setCPUThrottlingRate',{rate});await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:500});
   const events=[];cdp.on('Tracing.dataCollected',d=>events.push(...d.value));
   await cdp.send('Tracing.start',{categories:'devtools.timeline,v8,disabled-by-default-devtools.timeline',transferMode:'ReportEvents'});await cdp.send('Profiler.start');
   await page.evaluate(()=>{
    window.measure={frames:[],last:0,active:true,added:0,removed:0};
    measure.observer=new MutationObserver(list=>{for(const m of list){measure.added+=m.addedNodes.length;measure.removed+=m.removedNodes.length;}});
    measure.observer.observe(document.querySelector('#mapMarkers'),{childList:true});
    function tick(t){if(measure.last)measure.frames.push(t-measure.last);measure.last=t;if(measure.active)requestAnimationFrame(tick);}requestAnimationFrame(tick);
   });
   const start=Date.now();
   if(selectionProfile){for(let i=0;i<8;i++){await page.evaluate(i=>select(filtered.filter(d=>d.speed!=null)[i*5]),i);await page.waitForTimeout(500);}}
   else {if(zoomProfile)await page.keyboard.down('Control');for(let i=0;i<90;i++){if(zoomProfile)await page.mouse.wheel(0,i%30<15?-15:15);else await page.mouse.move(x+Math.sin(i/16)*110,y+Math.sin(i/19)*25);await page.waitForTimeout(12);}if(zoomProfile)await page.keyboard.up('Control');}
   const elapsed=Date.now()-start;
   const observed=await page.evaluate(()=>{measure.active=false;measure.observer.disconnect();const f=measure.frames.sort((a,b)=>a-b);return {frames:f.length,p95:f[Math.floor(f.length*.95)],max:f.at(-1),over25:f.filter(n=>n>25).length,added:measure.added,removed:measure.removed};});
   const {profile}=await cdp.send('Profiler.stop');const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');await done;
   const sums={},counts={};for(const e of events)if(e.ph==='X'&&e.dur){sums[e.name]=(sums[e.name]||0)+e.dur/1000;counts[e.name]=(counts[e.name]||0)+1;}
   const nodes=new Map(profile.nodes.map(n=>[n.id,n])),parents=new Map(),inclusive={},self={};for(const n of profile.nodes)for(const c of n.children||[])parents.set(c,n.id);
   for(let i=0;i<profile.samples.length;i++){let id=profile.samples[i];const frame=nodes.get(id).callFrame,key=(frame.functionName||'(anonymous)')+' '+frame.url.split('/').pop()+':'+(frame.lineNumber+1);self[key]=(self[key]||0)+profile.timeDeltas[i]/1000;while(id){const name=nodes.get(id).callFrame.functionName;if(['draw','renderMarkers','buildClusters','focus','select','detail','renderList'].includes(name))inclusive[name]=(inclusive[name]||0)+profile.timeDeltas[i]/1000;id=parents.get(id);}}
   console.log(JSON.stringify({revision,scenario:selectionProfile?'disc-selection':zoomProfile?'wheel-zoom':'marker-pan',rate,elapsed,observed,cpuInclusive:inclusive,cpuSelf:Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,12),timeline:Object.fromEntries(['UpdateLayoutTree','Layout','Paint','ParseHTML','RasterTask'].map(k=>[k,{ms:sums[k]||0,count:counts[k]||0}]))}));
   if(!zoomProfile)await page.mouse.up();await context.close();
  }
 }else if(process.argv.includes('--game-feel')){
  const page=await browser.newPage({viewport:{width:1440,height:900},colorScheme:'dark'});
  fs.mkdirSync('outputs/motion',{recursive:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.locator('.atlas-marker.is-selected').waitFor();
  await page.evaluate(()=>{window.firstRow=document.querySelector('#rows').firstChild;select(selected);});
  assert.ok(await page.evaluate(()=>firstRow===document.querySelector('#rows').firstChild),'Map selection leaves the hidden directory intact');
  await page.evaluate(()=>{window.originalClose=document.querySelector('#closeDetail');select(filtered.find(d=>d.speed===5));});
  assert.ok(await page.evaluate(()=>originalClose===document.querySelector('#closeDetail')),'Changing discs preserves sidebar controls');
  await page.locator('#closeDetail').click();await page.locator('#detail').waitFor({state:'hidden'});
  // A sparse map spreads even coincident discs apart: each gets its own marker and opens directly.
  // Dense-catalog stacks keep the chooser (checked below).
  for(const size of [2,3])for(const level of [2.8,12]){
   const first=await page.evaluate(({size,level})=>{
    const items=discs.filter(d=>d.speed===12).slice(0,size);filtered=items;selected=null;
    for(const d of items)atlasPositions.set(d.id,{x:.5,y:.5});
    const camera=AtlasLayout.camera(shownPosition(items[0].id),canvas.clientWidth,canvas.clientHeight,level);
    zoom=camera.zoom;pan={x:camera.x,y:camera.y};draw();return items[0].id;
   },{size,level});
   await page.waitForFunction(()=>groupCache.items===filtered&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));
   assert.ok(await page.evaluate(size=>groupCache.groups.length===size&&groupCache.groups.every(g=>g.members.length===1),size),'Coincident discs in a sparse map spread into separate markers');
   const expected=await page.evaluate(id=>discs.find(d=>d.id===id).name,first);
   await page.locator(`[data-cluster="${first}"]`).click();
   await page.locator('#detail h2').waitFor();
   assert.equal(await page.locator('#detail [data-choose-disc]').count(),0,'A spread disc opens directly, without a stack chooser');
   assert.equal(await page.locator('#clusterPopover').isVisible(),false);
   assert.equal(await page.locator('#detail h2').innerText(),expected.trim(),'Clicking a spread disc opens that disc');
   assert.ok(await page.evaluate(()=>groupCache.groups.every(g=>{const p=shownPosition(g.key);return g.pos.x===p.x&&g.pos.y===p.y;})),'Selecting keeps every marker at its spread position');
   await page.keyboard.press('Escape');await page.locator('#detail').waitFor({state:'hidden'});
  }
  await page.reload();await page.locator('.atlas-marker.is-selected').waitFor();
  const groupId=await page.evaluate(()=>mapClusters.find(g=>g.members.length===2)?.key);
  if(groupId){
   await page.locator(`[data-cluster="${groupId}"]`).click();await page.waitForTimeout(250);
   assert.equal(await page.locator('#detail [data-choose-disc]').count(),2,'Dense views retain the small stack chooser');
   assert.equal(await page.locator('#detail .comparison-route').count(),2,'Dense stacks retain automatic flight comparisons');
   fs.mkdirSync('outputs/motion',{recursive:true});await page.screenshot({path:'outputs/motion/stack-sidebar.png'});
   await page.locator('#closeDetail').click();await page.locator('#detail').waitFor({state:'hidden'});
  }
  await page.locator('#zoomReset').click();await page.waitForFunction(()=>!cameraTween);
  // The organic overview (Oct 7) shows a curated set; its groups still hold the entire catalog.
  assert.ok(await page.evaluate(()=>groupCache.groups.reduce((n,g)=>n+g.members.length,0)===filtered.filter(d=>d.speed!=null).length&&
   mapClusters.length===AtlasGroups.organicCap(AtlasLayout.bounds(mapViewport.width,mapViewport.height).view,zoom)),'Expanded graph groups the entire catalog and shows the curated cap');
  await page.setViewportSize({width:390,height:844});await page.reload();await page.locator('#mapTab').click();await page.waitForFunction(()=>filtered.length>0);await page.evaluate(()=>focusFeatured());await page.locator('.atlas-marker.is-selected').waitFor();
  // A real stack in the dense catalog, which keeps its positions and its stacks.
  await page.waitForFunction(()=>!cameraTween&&groupCache.items===filtered&&groupCache.level===AtlasGroups.level(zoom,groupCache.level)&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));
  const mobileStack=await page.evaluate(()=>{selected=null;draw();return mapClusters.find(g=>g.members.length>1&&g.members.length<=3&&g.x>30&&g.x<innerWidth-30&&g.y>150&&g.y<innerHeight-220)?.key;});
  assert.ok(mobileStack,'The dense phone map has a stack in view');
  await page.locator(`[data-cluster="${mobileStack}"]`).click();await page.locator('#detail h2').waitFor();
  assert.ok(await page.locator('#detail [data-choose-disc]').count()>1,'The phone sheet keeps the stack chooser');
  await page.locator('#expandDetail').click();await page.waitForFunction(()=>document.querySelector('#detail').getBoundingClientRect().y===0);
  await page.screenshot({path:'outputs/motion/stack-mobile.png'});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.ok(await page.locator('#detail h2').isVisible());assert.deepEqual(errors,[]);
  console.log('PASS: stable directory, sparse discs at normal/max zoom, dense stack chooser, graph coverage, mobile and reduced motion.');
 }else{
  const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'dark'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.locator('.atlas-marker.is-selected').waitFor();
  await page.evaluate(()=>{window.originalMarker=document.querySelector('.atlas-marker.is-selected');originalMarker.focus();pan.x+=12;draw();});
  assert.ok(await page.evaluate(()=>originalMarker===document.querySelector('.atlas-marker.is-selected')),'Panning preserves the selected disc element, rather than replacing it');
  assert.ok(await page.evaluate(()=>document.activeElement===originalMarker),'Focus remains on the original disc');
  await page.locator('.atlas-marker.is-selected').hover();
  await page.waitForFunction(()=>gsap.getProperty(document.querySelector('.atlas-marker.is-selected .marker-stack'),'scaleX')>1.03);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>Math.abs(gsap.getProperty(document.querySelector('.atlas-marker.is-selected .marker-stack'),'scaleX')-1)<.005);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.mouse.move(5,5);await page.waitForTimeout(750);
  assert.ok(await page.evaluate(()=>Math.abs(gsap.getProperty(document.querySelector('.atlas-marker.is-selected .marker-stack'),'scaleX')-1)<.005),'Hover returns to rest');
  await page.locator('.atlas-marker.is-selected').click();await page.locator('#detail').waitFor({state:'visible'});
  // A new selection while the opening animation is running must finish fully visible.
  await page.evaluate(()=>select(selected));
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#detail')).opacity==='1');
  await page.locator('#closeDetail').click();await page.locator('#detail').waitFor({state:'hidden'});
  await page.locator('#filtersToggle').click();await page.locator('#filters').waitFor({state:'visible'});
  await page.keyboard.press('Escape');await page.locator('#filters').waitFor({state:'hidden'});
  const dragArea=await page.locator('#map').boundingBox();
  await page.mouse.move(dragArea.x+500,dragArea.y+110);await page.mouse.down();await page.mouse.move(dragArea.x+620,dragArea.y+110,{steps:8});await page.mouse.up();
  const releaseX=await page.evaluate(()=>pan.x);await page.waitForTimeout(100);
  assert.ok(await page.evaluate(x=>pan.x>x+1,releaseX),'Release continues with a short glide');
  await page.waitForTimeout(650);const resting=await page.evaluate(()=>pan.x);await page.waitForTimeout(200);
  assert.equal(await page.evaluate(()=>pan.x),resting,'Release glide settles instead of drifting indefinitely');
  await page.locator('#zoomReset').click();await page.waitForFunction(()=>Math.abs(zoom-1)<.001);
  assert.ok(await page.evaluate(()=>mapClusters.reduce((n,g)=>n+g.members.length,0)===filtered.filter(d=>d.speed!=null).length),'Show all still includes every rated disc');
  await page.locator('#search').fill('Buzzz');assert.ok(await page.locator('.atlas-marker').count()>0);
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#search').fill('');
  const area=await page.locator('#map').boundingBox();await page.mouse.move(area.x+500,area.y+110);await page.mouse.down();await page.mouse.move(area.x+610,area.y+110,{steps:8});await page.mouse.up();
  const released=await page.evaluate(()=>({x:pan.x,y:pan.y}));await page.waitForTimeout(250);
  assert.deepEqual(await page.evaluate(()=>({x:pan.x,y:pan.y})),released,'Reduced motion disables release inertia');
  await page.setViewportSize({width:390,height:844});await page.reload();await page.locator('#mapTab').click();await page.waitForFunction(()=>filtered.length>0);await page.evaluate(()=>focusFeatured());await page.locator('.atlas-marker.is-selected').waitFor();
  await page.locator('.atlas-marker.is-selected').click();await page.locator('#detail').waitFor({state:'visible'});
  await page.locator('#expandDetail').click();await page.waitForFunction(()=>document.querySelector('#detail').getBoundingClientRect().y===0);
  await page.locator('#closeDetail').click();await page.locator('#detail').waitFor({state:'hidden'});
  fs.mkdirSync('outputs/motion',{recursive:true});
  await page.screenshot({path:'outputs/motion/mobile.png'});
  await page.setViewportSize({width:1440,height:900});await page.reload();await page.locator('.atlas-marker.is-selected').waitFor();await page.waitForTimeout(400);
  await page.screenshot({path:'outputs/motion/desktop.png'});
  assert.deepEqual(errors,[]);console.log('PASS: stable marker identity and focus, panels, complete catalog, search, reduced motion, mobile sheet.');
  await context.close();
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}
