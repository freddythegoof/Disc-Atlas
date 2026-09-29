import {createRequire} from 'node:module';
import {execFileSync,spawn} from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';

const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const zoomProfile=process.argv.includes('--zoom-profile');
const profiling=process.argv.includes('--profile')||zoomProfile;
const baseline=new Map();
if(profiling)for(const file of ['web/index.html','public/app.js','public/atlas-map.js','public/cosmic.css']){
 baseline.set(file,execFileSync('git',['show','HEAD:'+file]));
}
let revision='working';
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"Frontend test: backend excluded"}');return;}
 try{
  const data=revision==='HEAD'&&baseline.has(file)?baseline.get(file):fs.readFileSync(file);
  res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true});
const base='http://127.0.0.1:'+server.address().port;
try{
 if(process.argv.includes('--regression')){
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
   await page.mouse.move(x,y);if(!zoomProfile)await page.mouse.down();
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
   for(let i=0;i<90;i++){if(zoomProfile)await page.mouse.wheel(0,i%30<15?-15:15);else await page.mouse.move(x+Math.sin(i/16)*110,y+Math.sin(i/19)*25);await page.waitForTimeout(12);}
   const elapsed=Date.now()-start;
   const observed=await page.evaluate(()=>{measure.active=false;measure.observer.disconnect();const f=measure.frames.sort((a,b)=>a-b);return {frames:f.length,p95:f[Math.floor(f.length*.95)],max:f.at(-1),over25:f.filter(n=>n>25).length,added:measure.added,removed:measure.removed};});
   const {profile}=await cdp.send('Profiler.stop');const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');await done;
   const sums={},counts={};for(const e of events)if(e.ph==='X'&&e.dur){sums[e.name]=(sums[e.name]||0)+e.dur/1000;counts[e.name]=(counts[e.name]||0)+1;}
   const nodes=new Map(profile.nodes.map(n=>[n.id,n])),parents=new Map(),inclusive={},self={};for(const n of profile.nodes)for(const c of n.children||[])parents.set(c,n.id);
   for(let i=0;i<profile.samples.length;i++){let id=profile.samples[i];const frame=nodes.get(id).callFrame,key=(frame.functionName||'(anonymous)')+' '+frame.url.split('/').pop()+':'+(frame.lineNumber+1);self[key]=(self[key]||0)+profile.timeDeltas[i]/1000;while(id){const name=nodes.get(id).callFrame.functionName;if(['draw','renderMarkers','buildClusters','focus'].includes(name))inclusive[name]=(inclusive[name]||0)+profile.timeDeltas[i]/1000;id=parents.get(id);}}
   console.log(JSON.stringify({revision,scenario:zoomProfile?'wheel-zoom':'marker-pan',rate,elapsed,observed,cpuInclusive:inclusive,cpuSelf:Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,12),timeline:Object.fromEntries(['UpdateLayoutTree','Layout','Paint','ParseHTML','RasterTask'].map(k=>[k,{ms:sums[k]||0,count:counts[k]||0}]))}));
   if(!zoomProfile)await page.mouse.up();await context.close();
  }
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
  await page.setViewportSize({width:390,height:844});await page.reload();await page.locator('.atlas-marker.is-selected').waitFor();
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
