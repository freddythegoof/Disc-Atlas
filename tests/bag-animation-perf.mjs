// Local desktop Chromium repro. Diagnostic probes are response-only overrides, never product flags.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const tag=process.argv[2]||'before',probe=process.argv[3]||'none',photos=process.argv.includes('--photos');
const verifyLayout=process.argv.includes('--verify-layout');
const profile=process.argv.includes('--profile'),baseline=process.argv.includes('--base');
const verifyTextures=process.argv.includes('--verify-textures');
const verifyTransitions=process.argv.includes('--verify-transitions');
const cpuRate=process.argv.includes('--cpu4')?4:1;
const dir='outputs/bag-animation',base='https://localhost:8834',wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'pipe'});
const server=spawn(process.execPath,[wrangler,'dev','--config','tests/auth.wrangler.jsonc','--local','--port','8834','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to','work/bag-animation/local'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const median=a=>a.length?[...a].sort((a,b)=>a-b)[Math.floor(a.length/2)]:0;
const percentile=(a,p)=>a.length?[...a].sort((a,b)=>a-b)[Math.min(a.length-1,Math.floor(a.length*p))]:0;
try{
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--use-angle=d3d11','--enable-gpu']});
 const page=await browser.newPage({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000},deviceScaleFactor:2});
 if(cpuRate!==1){const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpuRate});}
 const errors=[];page.on('pageerror',e=>errors.push(e.stack));
 // Timers retain CPU sections and actual GPU elapsed time where ANGLE exposes the extension.
 await page.route('**/bag3d/viewer.mjs',async route=>{
  let source=baseline?execFileSync('git',['show','3930a0c1:public/bag3d/viewer.mjs'],{encoding:'utf8',windowsHide:true}):fs.readFileSync('public/bag3d/viewer.mjs','utf8');
  if(probe==='budget')source=source.replace('return detailRatio && !low ? Math.max(ratio, detailPixelRatio()) : ratio;','return ratio;');
  if(probe==='quality')source=source.replace('if (low || !record.parts) return;','return;');
  if(probe==='size')source=source.replace('if(record.spot.sizeDuration){','if(false){');
  if(probe==='textures'){
   const condition=/if \((?:(?:now >= photoAfter|!holding) && )?placement\.photoURL && \(/;
   assert.ok(condition.test(source),'texture ablation must match its product condition');
   source=source.replace(condition,'if (false && (');
  }
  source=source.replace("renderer.domElement.setAttribute('aria-label'",`{
   const gl=renderer.getContext(),ext=gl.getExtension('EXT_disjoint_timer_query_webgl2'),pending=[];
    window.bagPerf={frames:[],draw:[],gpu:[],layout:[],ratios:[],long:[],looks:0,gpuTimer:!!ext};
   const render=renderer.render.bind(renderer);renderer.render=(...args)=>{
    const p=window.bagPerf;
    while(pending.length&&gl.getQueryParameter(pending[0],gl.QUERY_RESULT_AVAILABLE)){
     const q=pending.shift();if(!gl.getParameter(ext.GPU_DISJOINT_EXT))p.gpu.push(gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6);gl.deleteQuery(q);
    }
    const q=ext?gl.createQuery():null;if(q)gl.beginQuery(ext.TIME_ELAPSED_EXT,q);
    const start=performance.now();render(...args);p.draw.push(performance.now()-start);
    if(q){gl.endQuery(ext.TIME_ELAPSED_EXT);pending.push(q);}
   };
   const setRatio=renderer.setPixelRatio.bind(renderer);renderer.setPixelRatio=ratio=>{window.bagPerf.ratios.push({t:performance.now(),ratio});return setRatio(ratio);};
  }
  renderer.domElement.setAttribute('aria-label'`);
  source=source.replace('const syncLook = (record, now = performance.now()) => {','const syncLook = (record, now = performance.now()) => { window.bagPerf.looks++;');
  await route.fulfill({contentType:'text/javascript',body:source});
 });
 if(baseline)await page.route('**/bag-scene.js',r=>r.fulfill({contentType:'text/javascript',body:execFileSync('git',['show','3930a0c1:public/bag-scene.js'],{encoding:'utf8',windowsHide:true})}));
 if(photos){
  await page.route('**/bag-demo.js',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('public/bag-demo.js','utf8').replace("id:`demo-${", "texture_key:'aabbcc.webp',id:`demo-${")}));
  await page.route('**/api/bag/discs/demo-*/photo?*',r=>r.fulfill({contentType:'image/webp',body:fs.readFileSync('tests/fixtures/stamped-disc.webp')}));
 }
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s?.dataset.engine==='ready'&&s.dataset.phase==='open';},null,{timeout:30000});
 await page.evaluate(async ({probe,profile})=>{
  await document.fonts.ready;
  const {BagScene}=await import('/bag-scene.js'),place=BagScene.prototype.place;
  BagScene.prototype.place=function(...args){const start=performance.now();if(probe!=='names')place.apply(this,args);window.bagPerf.layout.push(performance.now()-start);};
  if(profile){
   bagPerf.sections={};
   const wrap=(target,key)=>{const fn=target[key];target[key]=function(...args){const t=performance.now(),result=fn.apply(this,args);(bagPerf.sections[key]??=[]).push(performance.now()-t);return result;};};
   for(const key of ['placeSlots','placeNames','placePockets','placePopup'])wrap(BagScene.prototype,key);
   const v=document.querySelector('[data-bag-canvas]').bagViewer;for(const key of ['bagRect','discRects'])wrap(v,key);
  }
  if(probe==='footprint'){
   const v=document.querySelector('[data-bag-canvas]').bagViewer,rect=v.bagRect.bind(v);
   v.bagRect=()=>bagPerf.heldFootprint??=rect();
  }
  new PerformanceObserver(list=>window.bagPerf.long.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask'});
 },{probe,profile});
 if(verifyLayout)await page.evaluate(()=>{
  bagPerf.reparented=0;
  new MutationObserver(records=>{
   if(!bagPerf.sampling)return;
   const out=new Set(document.querySelector('[data-bag-canvas]').bagViewer.outDiscs);
   for(const record of records)for(const node of record.removedNodes)if(out.has(node.dataset?.outName))bagPerf.reparented++;
  }).observe(document.querySelector('.bag-out-names'),{childList:true});
 });
 await page.waitForTimeout(2500); // Same shader warm-up window before every sample.
 if(photos)await page.waitForFunction(()=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().filter(d=>!d.empty).every(d=>d.photo?.size===256));
 const metadata=await page.evaluate(()=>{
  const c=document.querySelector('[data-bag-canvas]'),gl=c.querySelector('canvas').getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');
  return {userAgent:navigator.userAgent,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),gpuTimer:bagPerf.gpuTimer,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,bag:c.bagViewer.getBagLayoutState().filter(d=>!d.empty).length};
 });
 const settled=()=>page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return !s.querySelector('[data-bag-canvas]').bagViewer.stage.moving&&s.dataset.staging==='still';});
 const sample=async(selector)=>{
  await page.evaluate(verifyTextures=>{
   const p=bagPerf,v=document.querySelector('[data-bag-canvas]').bagViewer;
   for(const key of ['frames','draw','gpu','layout','ratios','long'])p[key]=[];
   p.sections={};p.heldFootprint=null;p.looks=0;p.reparented=0;p.upgrades=0;p.sampling=true;p.start=performance.now();
   const tiers=new Map(v.getBagLayoutState().map(d=>[d.id,d.photo?.size??0]));let last=null;
   const frame=t=>{if(last!==null)p.frames.push(t-last);last=t;
    if(verifyTextures&&v.stage.moving)p.upgrades+=v.getBagLayoutState().filter(d=>(d.photo?.size??0)>(tiers.get(d.id)??0)).length;
    if(p.sampling)requestAnimationFrame(frame);
   };requestAnimationFrame(frame);
  },verifyTextures);
  await page.locator(selector).evaluate(n=>n.click());await settled();
  const data=await page.evaluate(()=>{bagPerf.sampling=false;const v=document.querySelector('[data-bag-canvas]').bagViewer;return {...bagPerf,end:performance.now(),renderer:v.renderer,out:v.outDiscs,looksState:v.getBagLayoutState()};});
  data.long=data.long.filter(t=>t.start>=data.start&&t.start<data.end);
  if(verifyLayout)assert.equal(data.reparented,0,'moving labels retain their DOM nodes/focus throughout restaging');
  if(verifyTextures)assert.equal(data.upgrades,0,'each disc retains its current photo tier throughout staging');
  if(verifyTextures)await page.waitForFunction(()=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().filter(d=>!d.empty).every(d=>d.look==='detail'?d.photo?.relief&&d.photo.size>=(d.shown>256?1024:d.shown*devicePixelRatio):d.photo?.size===256));
  return {...data,summary:{frameMedian:median(data.frames),frameP95:percentile(data.frames,.95),frameMax:Math.max(...data.frames),drawMedian:median(data.draw),gpuMedian:median(data.gpu),layoutMedian:median(data.layout),layoutTotal:data.layout.reduce((s,n)=>s+n,0),longTasks:data.long.length,longTaskMs:data.long.reduce((s,n)=>s+n.duration,0)}};
 };
 const runs=[];
 if(verifyTransitions){
  assert.ok(photos,'transition verification needs --photos');
  await page.locator('[data-physical-disc="demo-01"]').evaluate(n=>n.click());await settled();
  await page.waitForFunction(()=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().find(d=>d.id==='demo-01').photo?.size===1024);
  await page.locator('.bag-dump').evaluate(n=>n.click());await settled();
  await page.waitForFunction(()=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().filter(d=>!d.empty).every(d=>d.photo?.size===256),null,{timeout:5000});
  console.log('PASS: a 1024 photo shrinks back to its visible 256 photo when the whole bag comes out');
  // Force an earlier stage's detail request to complete halfway through the next
  // glide. It must keep the current visible tier, then still reach full quality.
  await page.locator('.bag-return-all').evaluate(n=>n.click());await settled();
  let delayedResponses=0;
  await page.route('**/api/bag/discs/demo-*/photo?*',async r=>{await new Promise(resolve=>setTimeout(resolve,350));delayedResponses++;await r.fulfill({contentType:'image/webp',body:fs.readFileSync('tests/fixtures/stamped-disc.webp')});});
  await page.locator('[data-physical-disc="demo-01"]').evaluate(n=>n.click());await settled();
  await page.evaluate(()=>{
   window.raceTiers=[];window.raceWatching=true;
   const frame=()=>{const v=document.querySelector('[data-bag-canvas]').bagViewer;
    if(v.stage.moving)raceTiers.push(...v.getBagLayoutState().filter(d=>!d.empty).map(d=>({id:d.id,size:d.photo?.size??0,look:d.look,t:performance.now()})));
    if(raceWatching)requestAnimationFrame(frame);
   };requestAnimationFrame(frame);
  });
  await page.locator('.bag-dump').evaluate(n=>n.click());await settled();
  const tiers=await page.evaluate(()=>{raceWatching=false;return raceTiers;});
  assert.ok(delayedResponses>0&&tiers.length>0,'a delayed detail response landed during the retargeted glide');
  fs.writeFileSync(`${dir}/${tag}-race.json`,JSON.stringify({delayedResponses,tiers},null,2));
  assert.ok(tiers.every(d=>d.size===256),'the in-flight decode neither replaces nor hides the current tier');
  await page.locator('.bag-return-all').evaluate(n=>n.click());await settled();
  await page.locator('[data-physical-disc="demo-01"]').evaluate(n=>n.click());await settled();
  await page.waitForFunction(()=>{const d=document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().find(d=>d.id==='demo-01');return d.photo?.size===1024&&d.photo.relief;});
  console.log('PASS: delayed decode across a new glide holds 256 and later resolves 1024 + relief');
  await page.evaluate(()=>document.querySelector('[data-bag-canvas]').bagViewer.setAnimated(false));
  await page.locator('.bag-return-all').evaluate(n=>n.click());await settled();
  await page.locator('[data-physical-disc="demo-02"]').evaluate(n=>n.click());await settled();
  await page.waitForFunction(()=>{const d=document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().find(d=>d.id==='demo-02');return d.photo?.size===1024&&d.photo.relief;});
  console.log('PASS: a settled large disc resolves 1024 + relief with ambient frames disabled');
 }
 for(let i=0;i<(verifyTransitions?0:verifyLayout||verifyTextures?2:6);i++){
  await page.locator('.bag-dump').evaluate(n=>n.click());await settled();await page.waitForTimeout(300);
  const run={};
  for(const [name,selector] of [['drivers','[data-type-out="distance"]'],['midranges','[data-type-out="mid"]'],['stow','.bag-return-all']]){
   run[name]=await sample(selector);await page.waitForTimeout(300);
   if(photos)run[name].postGlideLongTasks=await page.evaluate(end=>bagPerf.long.filter(t=>t.start>=end),run[name].end);
  }
  runs.push(run);
 }
 const summary=verifyTransitions?{}:Object.fromEntries(['drivers','midranges','stow'].map(name=>[name,Object.fromEntries(Object.keys(runs[0][name].summary).map(key=>[key,median(runs.slice(1).map(r=>r[name].summary[key]))]))]));
 assert.deepEqual(errors,[]);
 const result={tag,probe,photos,cpuRate,metadata,summary,runs,errors};fs.writeFileSync(`${dir}/${tag}.json`,JSON.stringify(result,null,2));console.log(JSON.stringify({tag,probe,photos,cpuRate,metadata,summary},null,2));
}finally{await browser?.close();server.kill();}
