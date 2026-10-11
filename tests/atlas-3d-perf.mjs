// Plan 16 frame cost: the main Atlas with 3D discs against the 2D build (window.ATLAS_3D_OFF), on a desktop
// and an emulated mid-range phone (390 × 844 at 2x, touch, CPU throttled 4x). Both run on the machine's GPU.
// Each run flies 1x → 9x → 1x over 240 frames, drawing the map once a frame as a zoom does (renders for
// new discs included, within their budget), then redraws the full 1x view, every disc on screen, for 120
// frames. Twice: cold (a fresh page) and warm (the same flight again). It reports each frame's draw() time
// (median, 95th percentile, worst) and long tasks, and fails if 3D's warm 95th percentile or its long tasks
// are worse than the 2D build's beyond noise.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/atlas-3d-perf.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');

const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{}');return;}
 try{
  const data=fs.readFileSync(file);
  res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
const DEVICES={
 desktop:{context:{viewport:{width:1440,height:900}},cpu:1},
 phone:{context:{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true},cpu:4},
};

const FLIGHT=async()=>{
 const stats=a=>{const s=[...a].sort((x,y)=>x-y),q=p=>s[Math.min(s.length-1,Math.floor(p*s.length))];return {median:+q(.5).toFixed(2),p95:+q(.95).toFixed(2),max:+s.at(-1).toFixed(2),frames:s.length};};
 const longs=[];const observer=new PerformanceObserver(l=>{for(const e of l.getEntries())longs.push(e.duration);});observer.observe({type:'longtask'});
 const frame=()=>new Promise(r=>requestAnimationFrame(r));
 const {width:w,height:h}=mapViewport,center={x:w*.55,y:h*.5};
 selected=null;closeDetail(false);zoom=1;pan={x:0,y:0};filter();draw();await frame();
 const fly=[],still=[];
 for(let i=0;i<=240;i++){
  const t=i<=120?i/120:(240-i)/120,z=Math.exp(Math.log(9)*t);
  const target=boundedCamera(zoomDestination(z,center));zoom=target.zoom;pan={x:target.x,y:target.y};
  await frame();const a=performance.now();draw();fly.push(performance.now()-a);
 }
 zoom=1;pan={x:0,y:0};
 for(let i=0;i<120;i++){await frame();const a=performance.now();draw();still.push(performance.now()-a);}
 await new Promise(r=>setTimeout(r,100));observer.disconnect();
 return {fly:stats(fly),still:stats(still),longTasks:longs.length,longest:+Math.max(0,...longs).toFixed(0),discs:mapClusters.length+mapGaps.filter(g=>g.drawn).length};
};

async function measure(device,flat){
 const context=await browser.newContext(DEVICES[device].context);
 if(flat)await context.addInitScript(()=>{window.ATLAS_3D_OFF=true;});
 const page=await context.newPage();
 await page.goto(base);
 if(device==='phone')await page.locator('#mapTab').click();
 await page.waitForFunction(()=>filtered.length>0&&mapClusters.length>0&&mapArt.state!=='loading');
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(800);
 const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:DEVICES[device].cpu});
 const cold=await page.evaluate(FLIGHT),warm=await page.evaluate(FLIGHT);
 const state=await page.evaluate(()=>mapArt.state),renders=await page.evaluate(()=>mapArt.stats?.renders??0);
 await context.close();
 return {cold,warm,state,renders};
}

const rows=[];let failed=false;
try{
 for(const device of Object.keys(DEVICES)){
  const flat=await measure(device,true),three=await measure(device,false);
  assert.equal(three.state,'ready',`${device}: 3D is on`);assert.equal(flat.state,'off',`${device}: the 2D build is off`);
  for(const [label,r] of [['2D',flat],['3D',three]])for(const run of ['cold','warm'])
   rows.push({device,build:label,run,'flight median':r[run].fly.median,'flight p95':r[run].fly.p95,'flight max':r[run].fly.max,'1x median':r[run].still.median,'1x p95':r[run].still.p95,'long tasks':r[run].longTasks,longest:r[run].longest,discs:r[run].discs});
  // Noise allowance: a frame's draw() varies by a millisecond or two between identical runs.
  const slack=device==='phone'?3:1.5;
  const worse=[['flight p95',three.warm.fly.p95,flat.warm.fly.p95],['1x p95',three.warm.still.p95,flat.warm.still.p95]].filter(([,a,b])=>a>b*1.15+slack);
  if(worse.length||three.warm.longTasks>flat.warm.longTasks+1){failed=true;console.log(`not ok - ${device}: 3D frames are slower than 2D's when warm`,worse,three.warm.longTasks,flat.warm.longTasks);}
  else console.log(`ok - ${device}: warm 3D frames are no slower than the 2D build's (flight p95 ${three.warm.fly.p95} vs ${flat.warm.fly.p95} ms, 1x p95 ${three.warm.still.p95} vs ${flat.warm.still.p95} ms; ${three.renders} renders)`);
 }
 console.table(rows);
 fs.mkdirSync('outputs/atlas-3d',{recursive:true});fs.writeFileSync('outputs/atlas-3d/perf.json',JSON.stringify(rows,null,1));
 assert.ok(!failed,'3D frames are no slower than the 2D build');
}finally{await browser.close();server.close();}
