// Compare complete warm 3D/2D flights on desktop and an emulated mid-range phone.
// PERF_REPS (integer >= 3, default 3) controls repetitions. One cold flight warms each
// page; warm repetitions alternate build order and run serially on the machine's GPU.
// Each flight retains the original 241 zoom frames and 120 full-view frames.
// Verdict: median warm p95/counts plus median paired excess, with the original margins.
// Every cold/warm repetition is printed and saved, including on a red run.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/atlas-3d-perf.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';

function parseReps(value){
 const reps=value===undefined?3:Number(value);
 assert.ok((value===undefined||/^[1-9]\d*$/.test(value))&&Number.isSafeInteger(reps)&&reps>=3,'PERF_REPS must be an integer >= 3');
 return reps;
}
function median(values){
 assert.ok(values.length>0&&values.every(Number.isFinite),'median requires finite measurements');
 const sorted=[...values].sort((a,b)=>a-b),mid=Math.floor(sorted.length/2);
 return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;
}
function decide(device,flat,three){
 assert.ok(flat.length>0&&flat.length===three.length,'paired measurements require matching nonempty repetition counts');
 const slack=device==='phone'?3:1.5;
 const metrics=[['flight p95',r=>r.fly.p95,1.15,slack],['1x p95',r=>r.still.p95,1.15,slack],['long tasks',r=>r.longTasks,1,1]].map(([metric,read,multiplier,allowance])=>{
  const twoD=median(flat.map(read)),threeD=median(three.map(read)),limit=twoD*multiplier+allowance;
  const excesses=three.map((r,i)=>read(r)-(read(flat[i])*multiplier+allowance)),pairedExcess=median(excesses);
  const medianFailed=threeD>limit,pairedFailed=pairedExcess>0;
  return {device,metric,'2D median':twoD,'3D median':threeD,limit,'paired excesses':excesses,'paired median excess':pairedExcess,medianFailed,pairedFailed,failed:medianFailed||pairedFailed};
 });
 return {device,metrics,failed:metrics.some(r=>r.failed)};
}

// Run without a browser: node tests/atlas-3d-perf.mjs --self-test
if(process.argv.includes('--self-test')){
 assert.equal(median([9,1,3]),3);
 assert.equal(median([4,1,3,2]),2.5);
 assert.equal(parseReps(undefined),3);assert.equal(parseReps('5'),5);
 for(const value of ['','0','1','2','3.5','NaN','Infinity','5oops'])assert.throws(()=>parseReps(value),/PERF_REPS/);
 const sample=(flight,still=1,longTasks=0)=>({fly:{p95:flight},still:{p95:still},longTasks});
 const flat=[sample(4),sample(4),sample(4)];
 assert.equal(decide('desktop',flat,[sample(5),sample(90),sample(5)]).failed,false,'an isolated slow repetition must not set the verdict');
 assert.equal(decide('desktop',flat,[sample(7),sample(7),sample(5)]).failed,true,'sustained flight slowdown must fail');
 assert.equal(decide('desktop',flat,[sample(5,3),sample(5,3),sample(5)]).failed,true,'sustained 1x slowdown must fail');
 assert.equal(decide('phone',flat,[sample(5,1,2),sample(5,1,2),sample(5)]).failed,true,'sustained excess long tasks must fail');
 assert.equal(decide('phone',flat,[sample(5,1,1),sample(5,1,1),sample(5,1,90)]).failed,false,'the median long-task allowance includes equality');
 assert.equal(decide('desktop',flat,[sample(6.1),sample(6.1),sample(6.1)]).failed,false,'frame limit includes equality');
 const crossedFlat=[sample(4.6),sample(5.1),sample(3.7)],crossedThree=[sample(7.8),sample(6.1),sample(6.5)];
 assert.equal(decide('desktop',crossedFlat,crossedThree).failed,true,'paired flight regressions must not hide behind crossed independent medians');
 assert.equal(decide('phone',[sample(4,1,5),sample(4,1,10),sample(4,1,1)],[sample(5,1,7),sample(5,1,5),sample(5,1,3)]).failed,true,'paired long-task regressions must not hide behind crossed independent medians');
 assert.equal(decide('phone',flat,[sample(7),sample(7),sample(7)]).failed,false,'phone retains its 3ms allowance');
 assert.equal(decide('desktop',flat,[sample(7),sample(7),sample(7)]).failed,true,'desktop retains its tighter allowance');
 assert.throws(()=>decide('desktop',[],[]),/paired/);
 assert.throws(()=>decide('desktop',flat,[sample(5)]),/paired/);
 console.log('PASS: perf aggregation, frame/long-task regressions, boundaries and PERF_REPS validation');
 process.exit(0);
}


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


async function main(){
 const reps=parseReps(process.env.PERF_REPS),started=performance.now();
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
 const rows=[],summary=[];let browser,error;
 const record=async(device,flat,rep,phase,page)=>{
  const result=await page.evaluate(FLIGHT);
  const {state,renders}=await page.evaluate(()=>({state:mapArt.state,renders:mapArt.stats?.renders??0}));
  rows.push({device,build:flat?'2D':'3D',rep,run:phase,'flight median':result.fly.median,'flight p95':result.fly.p95,'flight max':result.fly.max,'flight frames':result.fly.frames,'1x median':result.still.median,'1x p95':result.still.p95,'1x max':result.still.max,'1x frames':result.still.frames,'long tasks':result.longTasks,longest:result.longest,discs:result.discs,renders,state});
  assert.equal(state,flat?'off':'ready',device+': '+(flat?'2D must be off':'3D must be ready'));
  return result;
 };
 try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const base='http://127.0.0.1:'+server.address().port;
  const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
  browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
  console.log('Atlas perf: '+reps+' warm repetitions per configuration; one cold flight per page; serial, alternating 2D/3D order');
  for(const device of Object.keys(DEVICES)){
   const contexts=[],pages=new Map(),warm=new Map([[true,[]],[false,[]]]);
   try{
    for(const flat of [true,false]){
     const context=await browser.newContext(DEVICES[device].context);contexts.push(context);
     if(flat)await context.addInitScript(()=>{window.ATLAS_3D_OFF=true;});
     const page=await context.newPage();pages.set(flat,page);
     await page.goto(base);
     if(device==='phone')await page.locator('#mapTab').click();
     await page.waitForFunction(()=>filtered.length>0&&mapClusters.length>0&&mapArt.state!=='loading');
     await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(800);
     const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:DEVICES[device].cpu});
     await record(device,flat,0,'cold',page);
    }
    for(let rep=1;rep<=reps;rep++){
     for(const flat of rep%2?[false,true]:[true,false]){
      const page=pages.get(flat);await page.bringToFront();
      warm.get(flat).push(await record(device,flat,rep,'warm',page));
     }
     console.log('measured - '+device+' repetition '+rep+'/'+reps);
    }
    const verdict=decide(device,warm.get(true),warm.get(false));summary.push(...verdict.metrics);
    console.log((verdict.failed?'not ok':'ok')+' - '+device+': median warm 3D vs 2D');
    console.table(verdict.metrics);
   }finally{for(const context of contexts)await context.close();}
  }
  assert.ok(!summary.some(r=>r.failed),'3D median warm frames/long tasks exceed the 2D allowance (see every repetition below)');
 }catch(cause){error=cause;}
 finally{
  const report={reps,elapsedSeconds:+((performance.now()-started)/1000).toFixed(2),rows,summary,...(error?{error:error.message}:{})};
  try{
   console.log('Full cold/warm repetition distribution (rep 0 is diagnostic only):');console.table(rows);
   console.log('Measurement wall-clock: '+report.elapsedSeconds+' s');
   fs.mkdirSync('outputs/atlas-3d',{recursive:true});fs.writeFileSync('outputs/atlas-3d/perf.json',JSON.stringify(report,null,1));
  }finally{
   try{await browser?.close();}finally{await new Promise(resolve=>server.close(resolve));}
  }
 }
 if(error)throw error;
}
await main();
