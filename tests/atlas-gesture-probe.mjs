// Human-shaped gestures through the atlas's real input path (docs/atlas-smoothness-diagnosis.md §8): wheel notches
// as a PC mouse sends them (deltaY ±100), doubles, a nudge roll, trackpad-fine deltas, a drag and a flick, a long
// roll, notches with the pointer resting on a disc, and the cold and warm intro. The camera spring, the level hold
// and the art clock all run as they do under a hand. Each gesture is recorded frame by frame with the visible-change
// probe (tests/atlas-visible-change.mjs) and judged: what changed while the camera visibly moved (mid-gesture), and
// what arrived after it stopped (the swap, then any late pop). Render counts, curate time and frame intervals are
// reported alongside.
//
// Default: report only, written to outputs/atlas-gesture/<label>.json and printed. `--assert` applies the
// mid-gesture gate (ruling 2): no disc appears, vanishes, hops or jumps while the camera moves in an ordinary
// gesture, nothing anywhere changes abruptly, and an ordinary gesture ends in at most one burst of change.
// Timing (frame intervals, curate ms) counts only from a quiet machine; the counts of visible change do not
// depend on load.
//
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/atlas-gesture-probe.mjs [--assert] [--dpr=1|2] [--label=name]
//      [--only=gesture,gesture] [--no-intro] [--intro-only]
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pageProbe,summarize} from './atlas-visible-change.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');

const args=Object.fromEntries(process.argv.slice(2).map(a=>{const [k,v]=a.replace(/^--/,'').split('=');return [k,v??true];}));
const dpr=Number(args.dpr||1),label=args.label||'probe-dpr'+dpr,only=args.only?String(args.only).split(','):null;
const out='outputs/atlas-gesture';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"Frontend test: backend excluded"}');return;}
 try{
  const data=fs.readFileSync(file);
  res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream','Cache-Control':'max-age=3600'});res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
const viewport={width:1440,height:900};
const report={label,dpr,viewport,gpuArgs,when:new Date().toISOString(),load:(await import('node:os')).loadavg(),gestures:{},intro:{}};
const errors=[];

async function open(context,{seen=true}={}){
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 if(seen)await page.addInitScript(()=>{try{sessionStorage.setItem('atlas-intro-seen','1');}catch{}});
 await page.addInitScript(pageProbe);
 return page;
}
const settled=page=>page.waitForFunction(()=>{
 try{return !cameraTween&&!mapDrag&&groupCache&&groupCache.items===filtered&&groupCache.level===AtlasGroups.level(zoom,groupCache.level)&&!regrouping&&!retirementTimer&&!retirementFrame&&!gapsMoving&&!artPending&&!atlasSettling&&
  !document.querySelector('.marker-position.is-new,.marker-position.is-retiring');}catch{return false;}
},null,{timeout:15000,polling:50});
// A camera at `z`, the zoom anchored a little right of centre, as a hand would leave it.
async function at(page,z){
 await page.evaluate(z=>{stopCamera();const a={x:mapViewport.width*.55,y:mapViewport.height*.5};const t=boundedCamera(zoomDestination(z,a,{zoom:1,x:0,y:0}));zoom=t.zoom;pan={x:t.x,y:t.y};scheduleMapDraw();},z);
 await page.waitForTimeout(400);await settled(page);await page.waitForTimeout(300);
}
// A spot on empty map near the middle (nothing readable within 70 px), or a curated disc's centre.
const spot=(page,onDisc)=>page.evaluate(onDisc=>{
 const r=mapViewport,targets=mapTargets(),cx=r.width*.55,cy=r.height*.5;
 if(onDisc){const g=mapClusters.filter(g=>g.large).sort((a,b)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(b.x-cx,b.y-cy))[0];return {x:r.left+g.x,y:r.top+g.y,key:g.key};}
 let best=null;
 for(let y=r.height*.3;y<=r.height*.7;y+=12)for(let x=r.width*.3;x<=r.width*.75;x+=12){
  const clear=Math.min(...targets.map(t=>Math.hypot(t.x-x,t.y-y)-t.r),...targets.filter(t=>t.label).map(t=>Math.max(t.label.x-x,x-t.label.x-t.label.w,t.label.y-y,y-t.label.y-t.label.h)));
  if(clear>70){const d=Math.hypot(x-cx,y-cy);if(!best||d<best.d)best={x,y,d};}
 }
 best??={x:cx,y:cy};return {x:r.left+best.x,y:r.top+best.y};
},onDisc);
const notches=(dy,n,every)=>Array.from({length:n},(_,i)=>[{wheel:dy},...(i<n-1?[{wait:every}]:[])]).flat();
const GESTURES={
 'notch-in':{start:1,steps:[...notches(-100,1,0),{wait:2500},...notches(-100,1,0),{wait:2500},...notches(-100,1,0),{wait:2500}]},
 'notch-out':{start:3,steps:[...notches(100,1,0),{wait:2500},...notches(100,1,0),{wait:2500},...notches(100,1,0),{wait:2500}]},
 'double-in':{start:1.5,steps:[...notches(-100,2,60),{wait:2500},...notches(-100,2,60),{wait:2500}]},
 'double-out':{start:4,steps:[...notches(100,2,60),{wait:2500},...notches(100,2,60),{wait:2500}]},
 'nudge-roll':{start:2,steps:[0,1,2].flatMap(()=>[...notches(-100,3,150),{wait:1500},...notches(100,2,150),{wait:1500}])},
 'trackpad':{start:2,steps:[...notches(-6,20,16),{wait:1500},...notches(6,20,16),{wait:1500}]},
 'trackpad-long':{start:2,steps:[...notches(-6,40,16),{wait:1500},...notches(6,40,16),{wait:1500}],long:true},
 'drag':{start:3,steps:[{drag:{dx:-300,dy:80,ms:500}},{wait:2000},{drag:{dx:220,dy:-40,ms:90,flick:true}},{wait:2500}]},
 'long-roll':{start:1,steps:[...notches(-100,12,120),{wait:2500},...notches(100,12,120),{wait:2500}],long:true},
 'on-disc':{start:2,onDisc:true,steps:[...notches(-100,1,0),{wait:3500},...notches(100,1,0),{wait:3500}],hold:true},
};
async function run(page,name,g){
 await at(page,g.start);
 const p=await spot(page,g.onDisc);await page.mouse.move(p.x,p.y);await page.waitForTimeout(400);await settled(page).catch(()=>{});
 await page.evaluate(()=>__probe.start());
 for(const s of g.steps){
  if(s.wheel)await page.mouse.wheel(0,s.wheel);
  else if(s.wait)await page.waitForTimeout(s.wait);
  else if(s.drag){
   const from=await page.evaluate(()=>({x:mapViewport.left+mapViewport.width*.5,y:mapViewport.top+mapViewport.height*.5}));
   await page.mouse.move(from.x,from.y);await page.mouse.down();
   const n=Math.max(4,Math.round(s.drag.ms/16));
   for(let i=1;i<=n;i++){await page.mouse.move(from.x+s.drag.dx*i/n,from.y+s.drag.dy*i/n);await page.waitForTimeout(16);}
   await page.mouse.up();
   await page.mouse.move(p.x,p.y);
  }
 }
 await settled(page).catch(()=>{});await page.waitForTimeout(800);
 const rec=await page.evaluate(()=>__probe.stop());
 const s=summarize(rec);
 report.gestures[name]={...g,steps:undefined,summary:s,error:await page.evaluate(()=>__probe.error||null)};
 return s;
}

// Step 0: the art renderer's WebGL adapter, as the harness sees it.
async function adapter(page){
 return page.evaluate(()=>{try{const gl=atlasArt.debug.renderer.getContext(),i=gl.getExtension('WEBGL_debug_renderer_info');return {state:mapArt.state,renderer:String(gl.getParameter(i?i.UNMASKED_RENDERER_WEBGL:gl.RENDERER)),vendor:String(gl.getParameter(i?i.UNMASKED_VENDOR_WEBGL:gl.VENDOR)),attributes:gl.getContextAttributes()};}catch(e){return {state:mapArt.state,error:String(e)};}});
}

if(!args['intro-only']){
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr});
 const page=await open(context);
 await page.goto(base);
 await page.waitForFunction(()=>{try{return filtered.length>0&&mapClusters.length>0&&mapArt.state!=='loading';}catch{return false;}},null,{timeout:60000});
 await page.evaluate(()=>document.fonts.ready);await settled(page);
 report.adapter=await adapter(page);
 console.log('adapter',JSON.stringify(report.adapter));
 for(const [name,g] of Object.entries(GESTURES)){
  if(only&&!only.includes(name))continue;
  const s=await run(page,name,g);
  for(const [i,x] of s.gestures.entries())console.log(`${name}#${i}`,JSON.stringify({in:x.inputs,ms:x.ms,mid:x.mid,post:x.post,bursts:x.bursts,swap:x.swapAfterInput,late:x.late.total,lateAt:x.lateAfterInput,long:x.longFrames,run:x.longestRun,worst:x.worstFrame,curateMs:x.curateMs,curateFrames:x.curateFrames,renders:x.renders,evicted:x.evicted,resizes:x.canvasResizes}));
 }
 await context.close();
}

// The intro, cold (a fresh context: empty HTTP cache, fonts and three.js fetched over a throttled link) and warm
// (a second tab of the same context: everything cached, a fresh session so the intro plays).
async function intro(kind,context){
 const page=await open(context,{seen:false});
 if(kind==='cold'){const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:20e6/8,uploadThroughput:5e6/8});}
 await page.addInitScript(()=>window.__probe.start());
 await page.goto(base);
 await page.waitForFunction(()=>{try{return __probe.marks.intro?.end;}catch{return false;}},null,{timeout:60000}).catch(()=>{});
 await settled(page).catch(()=>{});await page.waitForTimeout(1500);
 const rec=await page.evaluate(()=>__probe.stop());
 const m=rec.marks,at=m.intro?.at;
 const rel=t=>t==null||at==null?null:Math.round(t-at);
 const end=at==null?null:Math.max(...rec.frames.filter(f=>f.t>=at&&f.move>.75).map(f=>f.t),at);
 const during=rec.frames.filter(f=>at!=null&&f.t>=at&&f.t<=end);
 const periods=rec.frames.map(f=>f.dt).filter(d=>d>0).sort((a,b)=>a-b),period=periods[Math.floor(periods.length/2)]||16.7;
 const ev=rec.events.filter(e=>at!=null&&e.t>=at&&e.t<=end);
 const tally=list=>{const o={total:list.length,abrupt:list.filter(e=>e.abrupt).length};for(const e of list){const k=e.layer+':'+e.kind+(e.abrupt?'!':'');o[k]=(o[k]||0)+1;}return o;};
 const post=rec.events.filter(e=>end!=null&&e.t>end);
 let r=0,lr=0;for(const f of during){if(f.dt>period*1.5){r++;lr=Math.max(lr,r);}else r=0;}
 // What ran in each long task on the way (3D renders, worker results hydrated, labels measured, with their start).
 const inTask=l=>Object.fromEntries(Object.entries(rec.cost||{}).map(([k,list])=>[k,list.filter(c=>c.t>=l.t-1&&c.t<=l.t+l.d).map(c=>Math.round(c.ms)+(c.n?'ms/'+c.n:'ms'))]).filter(([,v])=>v.length));
 const s={period:+period.toFixed(2),flightMs:end==null?null:Math.round(end-at),hold:m.intro?.hold??null,pullBackAt:rel(m.intro?.flightAt),
  marks:{artReady:rel(m.art.find(a=>a.state==='ready')?.t),fonts:m.fonts.map(rel),level0:rel(m.level0),end:rel(m.intro?.end),settled:rel(m.settled)},
  frames:during.length,longFrames:during.filter(f=>f.dt>period*1.5).length,longestRun:lr,worstFrame:Math.round(Math.max(0,...during.map(f=>f.dt))),
  worstDraw:+Math.max(0,...during.map(f=>f.draw)).toFixed(1),curateMs:+during.reduce((a,f)=>a+f.curate,0).toFixed(1),curateFrames:during.filter(f=>f.curates).length,
  longTasks:rec.longtasks.filter(l=>at!=null&&l.t+l.d>=at-200&&l.t<=end).map(l=>({at:rel(l.t),ms:Math.round(l.d),...inTask(l)})),
  slowRenders:(rec.slow||[]).map(x=>({...x,t:rel(x.t)})),
  // The pull-back alone (after the hold and the breath): what the eye follows as flight.
  pullBack:(()=>{const from=(m.intro?.flightAt??at)+(m.intro?.breath??0),f=rec.frames.filter(x=>x.t>=from&&x.t<=end);return {frames:f.length,longFrames:f.filter(x=>x.dt>period*1.5).length,worstFrame:Math.round(Math.max(0,...f.map(x=>x.dt))),worstDraw:+Math.max(0,...f.map(x=>x.draw)).toFixed(1),curateMs:+f.reduce((a,x)=>a+x.curate,0).toFixed(1),longTasks:rec.longtasks.filter(l=>l.t+l.d>=from&&l.t<=end).length};})(),
  mid:tally(ev),post:tally(post),samples:ev.filter(e=>e.abrupt||e.kind==='hop').slice(0,6)};
 report.intro[kind]=s;
 console.log('intro-'+kind,JSON.stringify(s));
 await page.close();
 return s;
}
if(!args['no-intro']){
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr});
 await intro('cold',context);
 await intro('warm',context);
 await context.close();
}

await browser.close();server.close();
report.errors=errors;
fs.writeFileSync(`${out}/${label}.json`,JSON.stringify(report,null,1));
console.log('wrote',`${out}/${label}.json`);
if(errors.length)console.log('page errors',errors.slice(0,5));

if(args.assert){
 // Ordinary: within the held level's reach (two notches out, three in; atlas-map.js LEVEL_REACH). Longer flights
 // (the long roll, a long trackpad pinch) may change level mid-flight as a crossfade (ruling 1); like the pointer-hold
 // case they are held to nothing abrupt and no hops.
 const ordinary=['notch-in','notch-out','double-in','double-out','nudge-roll','trackpad','drag'];
 for(const [name,g] of Object.entries(report.gestures)){
  for(const [i,x] of g.summary.gestures.entries()){
   const where=`${name}#${i}`;
   assert.equal(x.mid.abrupt,0,`${where}: nothing changes abruptly mid-gesture ${JSON.stringify(x.mid)} ${JSON.stringify(x.samples.mid)}`);
   assert.equal(x.post.abrupt,0,`${where}: nothing changes abruptly after the gesture ${JSON.stringify(x.post)}`);
   const hops=(x.mid['marker:hop']||0)+(x.mid['gap:hop']||0)+(x.mid['marker:jump!']||0);
   assert.equal(hops,0,`${where}: no disc changes its rest spot mid-gesture ${JSON.stringify(x.mid)}`);
   if(ordinary.includes(name)){
    const seen=['marker:appear','marker:vanish','gap:appear','gap:vanish'].reduce((n,k)=>n+(x.mid[k]||0),0);
    assert.equal(seen,0,`${where}: no disc appears or vanishes mid-gesture ${JSON.stringify(x.mid)} ${JSON.stringify(x.samples.mid)}`);
    assert.ok(x.bursts<=1,`${where}: the gesture ends in at most one burst of change (${x.bursts}; late ${JSON.stringify(x.late)} at ${x.lateAfterInput} ms) ${JSON.stringify(x.samples.late)}`);
   }
  }
 }
 for(const [kind,s] of Object.entries(report.intro)){
  assert.equal(s.mid.abrupt,0,`intro ${kind}: nothing changes abruptly during the pull-back ${JSON.stringify(s.mid)} ${JSON.stringify(s.samples)}`);
  assert.equal((s.mid['marker:hop']||0)+(s.mid['gap:hop']||0),0,`intro ${kind}: no disc hops during the pull-back ${JSON.stringify(s.mid)}`);
 }
 assert.deepEqual(errors,[],'no page errors');
 console.log('PASS: visible-change gate (ruling 2) on every gesture and the intro');
}
