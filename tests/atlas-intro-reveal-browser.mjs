// Real camera/DOM, local catalog and renderer. Freeze only the RAF clock for proof frames.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='docs/assets/atlas-intro-reveal';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{}');return;}
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream'});res.end(data);}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
// GPU flags as the 3D perf gate chooses them (BAG3D_CHROMIUM_ARGS overrides): ANGLE/D3D11 on Windows, the platform GPU
// elsewhere. On macOS the D3D11 flags fall back to software WebGL, which leaves the atlas on its 2D discs.
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
const errors=[],report=[],pixelFailures=[];
const camera=()=>({zoom,x:pan.x,y:pan.y,selected:selected?.id,active:!!cameraTween,intro:!!atlasIntro});
async function open(device,{reduced=false,freeze=false,baseline=false,seen=false}={}){
 const phone=device==='phone';
 const context=await browser.newContext({viewport:phone?{width:390,height:844}:{width:1440,height:900},isMobile:phone,hasTouch:phone,deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 if(seen)await context.addInitScript(()=>sessionStorage.setItem('atlas-intro-seen','1'));
 if(phone&&process.argv.includes('--load-bench')){const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});}
 if(baseline)await page.route('**/app.js',async route=>{
  const source=fs.readFileSync('public/app.js','utf8').replace("if(view==='map')presentAtlas();","if(view==='map')focusFeatured();").replace("if(v==='map'){presentAtlas();requestAnimationFrame(draw);}else renderList();","if(v==='map')requestAnimationFrame(draw);else renderList();");
  await route.fulfill({body:source,contentType:'application/javascript'});
 });
 await page.route('**/atlas-map.js',async route=>{
  const instrument=`
   const realStop=stopCamera;stopCamera=function(){if(atlasIntro)window.introStopStack=new Error().stack;realStop();};
   const realPresent=presentAtlas;presentAtlas=function(){window.presentationRequested??=performance.now();realPresent();
    if(atlasIntro){window.introMeasurement={at:performance.now(),expected:atlasIntro.breath+atlasIntro.duration,initial:{zoom,x:pan.x,y:pan.y}};
     ${freeze?"cancelAnimationFrame(mapFrame);mapFrame=0;window.resumeDraw=scheduleMapDraw;scheduleMapDraw=()=>{};":''}
    }
   };
   const realSettle=settleAtlas;settleAtlas=function(){const done=realSettle();if(done)window.settles=(window.settles||0)+1;return done;};
   const realFocus=focusFeatured;focusFeatured=function(){window.presentationRequested??=performance.now();return realFocus();};
   const realStep=stepCamera;stepCamera=function(now){${freeze?"if(!window.manualIntroStep)return;":''}const intro=!!atlasIntro,first=atlasIntro?.at===null;realStep(now);if(first&&atlasIntro)window.introMeasurement.at=atlasIntro.at;if(intro&&!atlasIntro&&window.introMeasurement)window.introMeasurement.elapsed=now-window.introMeasurement.at;};
   const realDraw=draw;draw=function(){realDraw();if(typeof view!=='undefined'&&view==='map'&&mapClusters.length&&!window.firstAtlasQueued){window.firstAtlasQueued=true;requestAnimationFrame(()=>{window.firstAtlasFrame=performance.now();window.firstAtlasZoom=zoom;});}};
  `;
  await route.fulfill({body:fs.readFileSync('public/atlas-map.js','utf8')+instrument,contentType:'application/javascript'});
 });
 await page.goto(base);await page.waitForFunction(()=>typeof filtered!=='undefined'&&filtered.length);
 if(phone){assert.equal(await page.evaluate(()=>view),'list');assert.equal(await page.evaluate(()=>atlasPresented),seen);await page.evaluate(()=>{window.presentationRequested=performance.now();});await page.locator('#mapTab').click();}
 await page.waitForFunction(()=>mapClusters.length>0);
 return page;
}
// A presentation rests once its settle (settleAtlas) has drawn it from nothing.
async function settle(page){await page.waitForFunction(()=>!cameraTween);await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>!atlasSettling);await page.waitForTimeout(800);}
try{
 if(process.argv.includes('--load-bench')){
  const samples=[];
  for(const device of ['desktop','phone'])for(let rep=0;rep<5;rep++)for(const baseline of rep%2?[true,false]:[false,true]){
   const page=await open(device,{baseline});await page.waitForFunction(()=>!!window.firstAtlasFrame);
   samples.push({device,rep,build:baseline?'old-opening':'intro',...await page.evaluate(()=>({navigationToFrame:window.firstAtlasFrame,presentationToFrame:window.firstAtlasFrame-window.presentationRequested,firstZoom:window.firstAtlasZoom}))});
   if(!baseline)assert.equal(samples.at(-1).firstZoom,device==='phone'?4:2.8,'First painted frame remains tight');
   await page.context().close();
  }
  fs.writeFileSync(`${out}/load-measurements.json`,JSON.stringify(samples,null,2));console.log(JSON.stringify(samples,null,2));
 }else{
 for(const device of ['desktop','phone']){
  const page=await open(device);await settle(page);
  const end=await page.evaluate(camera),timing=await page.evaluate(()=>({...window.introMeasurement,firstFrame:window.firstAtlasFrame}));
  assert.ok(timing.elapsed>=1200&&timing.elapsed<=1800,JSON.stringify({...timing,stop:await page.evaluate(()=>window.introStopStack)}));
  const calm=await open(device,{reduced:true});await settle(calm);
  assert.deepEqual(await calm.evaluate(camera),end,'Completed camera equals the no-animation camera');
  assert.equal(await calm.evaluate(()=>window.introMeasurement),undefined,'Reduced motion never starts an intro');
  const geometry=p=>p.evaluate(()=>mapClusters.map(g=>({key:g.key,x:g.x,y:g.y,large:g.large,hidden:g.hidden})).sort((a,b)=>a.key.localeCompare(b.key)));
  assert.deepEqual(await geometry(page),await geometry(calm),'Resting marker layout is identical');
  const direct=await open(device,{seen:true});await settle(direct);
  await page.waitForFunction(()=>mapArt.pending===0);await direct.waitForFunction(()=>mapArt.pending===0);
  // Exact camera/geometry equality and raw pixel equality are separate assertions.
  const resting=()=>({nodes:[...markerNodes].filter(([,n])=>!n.position.classList.contains('is-retiring')).map(([id,n])=>({id,classes:n.className,
   label:n.querySelector('.marker-name').getBoundingClientRect().toJSON(),art:n.art.getBoundingClientRect().toJSON(),transform:getComputedStyle(n.position).transform})).sort((a,b)=>a.id.localeCompare(b.id)),
   gaps:mapGaps.filter(g=>g.drawn).map(g=>({id:g.id,tier:g.tier,x:g.x,y:g.y,size:g.size,art:g.art,three:g.three,lod:g.lod,want:g.want,strength:g.strength})).sort((a,b)=>(a.id+a.tier).localeCompare(b.id+b.tier))});
  assert.deepEqual(await page.evaluate(resting),await direct.evaluate(resting),'Completed and direct no-animation camera, art, labels, tiers and pixel geometry match exactly');
  await calm.waitForFunction(()=>mapArt.pending===0);
  // Each rest is drawn from nothing exactly once: the reveal's landing, the direct open and the reduced-motion open.
  for(const p of [page,direct,calm])assert.equal(await p.evaluate(()=>window.settles),1,'One settle per presentation');
  // Strict: raw PNG bytes of the map, reveal vs direct and reduced-motion vs direct. Saved either way as proof.
  const finishedPixels=await page.locator('#map').screenshot(),directPixels=await direct.locator('#map').screenshot(),calmPixels=await calm.locator('#map').screenshot();
  const pixelEquivalent=finishedPixels.equals(directPixels)&&calmPixels.equals(directPixels);
  fs.mkdirSync(`${out}/takeover`,{recursive:true});
  for(const [name,png] of [['reveal',finishedPixels],['direct',directPixels],['reduced',calmPixels]])fs.writeFileSync(`${out}/takeover/${device}-rest-${name}.png`,png);
  if(!pixelEquivalent)pixelFailures.push(device);
  // Every fully rendered marker and readable label remains inside the map on both aspect ratios.
  const clipped=await page.evaluate(()=>{
   const b=canvas.getBoundingClientRect();
   return [...document.querySelectorAll('#mapMarkers .atlas-marker')].flatMap(n=>{
    if(n.closest('.is-retiring')||!n.checkVisibility())return [];
    return [...n.querySelectorAll('.disc-art,.marker-name')].filter(e=>Number(getComputedStyle(e).opacity)>.5&&e.checkVisibility()).flatMap(e=>{
     const r=e.getBoundingClientRect();return r.width&&r.height&&(r.left<b.left-1||r.right>b.right+1||r.top<b.top-1||r.bottom>b.bottom+1)?[{id:n.dataset.cluster,part:e.className,rect:{x:r.x,y:r.y,w:r.width,h:r.height}}]:[];
    });
   });
  });
  assert.deepEqual(clipped,[],'Whole-atlas framing has no clipped art or readable labels');
  await page.evaluate(()=>{setView('list');setView('map');});await settle(page);
  assert.deepEqual(await page.evaluate(camera),end,'Returning does not replay');
  await page.reload();await page.waitForFunction(()=>filtered.length);if(device==='phone')await page.locator('#mapTab').click();await settle(page);
  assert.equal(await page.evaluate(()=>window.introMeasurement),undefined,'Session survives reload');
  assert.deepEqual(await page.evaluate(camera),end,'Session-restored no-animation opening equals completed reveal');
  // Controlled times run the production spring, not an alternate animation.
  const proof=await open(device,{freeze:true});
  const frames=[];
  for(const [name,ms] of [['start',0],['mid',400],['end',1580]]){
   await proof.evaluate(ms=>{window.manualIntroStep=true;stepCamera(window.introMeasurement.at+ms);draw();window.manualIntroStep=false;},ms);
   if(name==='start')assert.equal(await proof.evaluate(()=>zoom),device==='phone'?4:2.8,'Start is the original Destroyer zoom');
   if(name==='end'){await proof.evaluate(()=>{window.manualIntroStep=true;scheduleMapDraw=window.resumeDraw;scheduleMapDraw();});await settle(proof);}
   await proof.screenshot({path:`${out}/${device}-${name}.png`});frames.push({name,ms,...await proof.evaluate(camera)});
  }
  const baseline=await open(device,{baseline:true});await settle(baseline);
  const firstFrameBaseline=await baseline.evaluate(()=>window.firstAtlasFrame);
  report.push({device,gpuArgs,art:await page.evaluate(()=>mapArt.state),timing,firstFrameBaseline,frames,clipped,pixelEquivalent,pixelMethod:'Buffer.equals on #map PNG screenshots: reveal vs direct (session seen), reduced motion vs direct'});
  for(const p of [page,calm,direct,proof,baseline])await p.context().close();
  console.log('ok - '+device+': start / end, reduced motion, session return / reload, marker fit, proof frames');
 }
 // Exercise the real event path at a known mid-reveal state, including the breath.
 for(const input of ['tap','drag','wheel','pinch','key','unhandled-key','control','breath']){
  const page=await open('desktop',{freeze:true});
  await page.evaluate(input=>{window.manualIntroStep=true;stepCamera(window.introMeasurement.at);stepCamera(window.introMeasurement.at+(input==='breath'?50:400));draw();window.manualIntroStep=false;},input);
  const before=await page.evaluate(camera),r=await page.locator('#canvas').boundingBox(),x=r.x+r.width*.5,y=r.y+r.height*.5;
  if(input==='wheel'){await page.mouse.move(x,y);await page.mouse.wheel(0,-80);}
  else if(input==='key'||input==='unhandled-key'){await page.locator('#map').focus();await page.keyboard.press(input==='key'?'ArrowLeft':'a');}
  else if(input==='control'){await page.locator('#zoomIn').click();}
  else if(input==='pinch'){
   const cdp=await page.context().newCDPSession(page);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:x-50,y},{id:2,x:x+50,y}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{id:1,x:x-70,y},{id:2,x:x+70,y}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  }else{
   await page.mouse.move(x,y);await page.mouse.down();
   assert.equal(await page.evaluate(()=>!!cameraTween),false,'Pointer catches before a move or lift');
   if(input==='drag')await page.mouse.move(x+30,y+20);
   await page.mouse.up();
  }
  const after=await page.evaluate(camera);assert.equal(after.intro,false,input+': intro canceled');
  if(['tap','breath','unhandled-key'].includes(input)){
   assert.deepEqual(after,before&&{...before,active:false,intro:false},'Catch holds the live camera');
   assert.equal(await page.evaluate(()=>activeCluster),null,'Catch does not click through');
  }
  if(input==='drag')assert.ok(after.x!==before.x||after.y!==before.y,'Drag owns the camera');
  if(input==='pinch')assert.ok(after.zoom>before.zoom,'Pinch owns the camera');
  if(['key','wheel','control'].includes(input))assert.equal(after.active,true,'Normal input starts the usual spring');
  await page.evaluate(()=>{window.manualIntroStep=true;scheduleMapDraw=window.resumeDraw;scheduleMapDraw();});await settle(page);await page.context().close();
  console.log('ok - mid-intro '+input+' hands control to normal handlers');
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/measurements.json`,JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
 assert.deepEqual(pixelFailures,[],'Strict resting-frame PNG equality');
 }
}finally{await browser.close();await new Promise(r=>server.close(r));}
