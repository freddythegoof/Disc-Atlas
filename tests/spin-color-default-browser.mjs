// Spin (docs/spin-color-default.md): the 3D viewer's turntable, in the detail panel's real viewer.
//   a fresh player       · off, and the viewer draws only on demand;
//   Spin                 · the disc turns about its own axis, the hand's way, easing up to one turn per SPIN_PERIOD_S;
//   rim tilt             · a tilted disc spins like a coin on edge: its own axis stays put while it turns;
//   a drag               · takes the disc at once (no turning while held); letting go eases it back up;
//   off                  · eases to a stop where it got to, and the viewer is on demand again;
//   a reload             · the choice is remembered;
//   reduced motion       · a remembered spin never starts by itself; a tap still starts it;
//   the pop-out          · takes the turntable with the pose; the panel's disc rests behind it and gets it back;
//   frame cost           · a spinning frame costs what a still one does (desktop and phone).
// Run: node tests/spin-color-default-browser.mjs   (PLAYWRIGHT_MODULE=<playwright> to use another install)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');

const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"Frontend test: backend excluded"}');return;}
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
const errors=[];
const check=label=>console.log('ok -',label);

async function open({viewport={width:1440,height:1000},reducedMotion='no-preference',remembered=false,context:extra={}}={}){
 const context=await browser.newContext({viewport,deviceScaleFactor:2,reducedMotion,...extra});
 if(remembered)await context.addInitScript(()=>{try{localStorage.setItem('disc-atlas-viewer-spin','1');}catch{}});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 // The static server has no backend: its 404s and 503s are expected noise.
 page.on('console',m=>{if(m.type()==='error'&&!/^Failed to load resource/.test(m.text()))errors.push(m.text());});
 await page.goto(base);
 await page.waitForFunction(()=>typeof filtered!=='undefined'&&filtered.length>0);
 return {page,context};
}
async function show(page,name='Destroyer'){
 const id=await page.evaluate(n=>discs.find(d=>(d.catalogName||d.name)===n&&d.speed!=null)?.id,name);assert.ok(id,name);
 await page.evaluate(id=>select(discs.find(d=>d.id===id)),id);
 await page.waitForFunction(id=>{const s=document.querySelector('#detail .disc3d-stage');return s?.dataset.state==='ready'&&s.dataset.disc===id&&Disc3D.viewer?.state.frames>0;},id);
}
const spinButton='#detail [data-disc3d-spin]';
const turn=page=>page.evaluate(()=>Disc3D.viewer.debug.discGroup.rotation.y);
const frames=page=>page.evaluate(()=>Disc3D.viewer.state.frames);
// The disc's angle on every animation frame for `ms`, unwrapped: [[t ms, angle rad], ...].
const trace=(page,ms,v='Disc3D.viewer')=>page.evaluate(([ms,v])=>new Promise(resolve=>{
 const viewer=eval(v),out=[],start=performance.now();let last=null,total=0;
 const step=now=>{const y=viewer.debug.discGroup.rotation.y;if(last!==null){let d=y-last;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;total+=d;}last=y;out.push([now-start,total]);
  if(now-start<ms)requestAnimationFrame(step);else resolve(out);};
 requestAnimationFrame(step);
}),[ms,v]);
// Mean angular speed (rad/s, signed) over the trace's [from, to) ms.
const speed=(t,from,to)=>{const a=t.find(p=>p[0]>=from),b=[...t].reverse().find(p=>p[0]<to);return a&&b&&b[0]>a[0]?(b[1]-a[1])/((b[0]-a[0])/1000):0;};
const FULL=2*Math.PI/5;

try{
 // A fresh player: off, and nothing draws while nothing moves.
 {
  const {page,context}=await open();await show(page);
  assert.equal(await page.locator(spinButton).getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator(spinButton).getAttribute('aria-label'),'Spin the disc');
  assert.equal(await page.evaluate(()=>Disc3D.viewer.state.spin),false);
  await page.waitForTimeout(400);const f=await frames(page);await page.waitForTimeout(600);
  assert.equal(await frames(page),f,'on demand: no frames while still');assert.equal(await turn(page),0);
  check('a fresh player: spin off, the viewer on demand, the disc at rest');

  // Spin: eases up, then one turn per SPIN_PERIOD_S, clockwise from above for a right-hand backhand (angle falling).
  await page.locator(spinButton).click();
  assert.equal(await page.locator(spinButton).getAttribute('aria-pressed'),'true');
  assert.equal(await page.evaluate(()=>localStorage.getItem('disc-atlas-viewer-spin')),'1');
  let t=await trace(page,2600);
  const early=-speed(t,0,250),full=-speed(t,1300,2600);
  assert.ok(early<FULL*.35,'eases in: '+early.toFixed(3)+' rad/s in the first quarter second');
  assert.ok(Math.abs(full-FULL)<FULL*.12,'full speed '+full.toFixed(3)+' rad/s vs '+FULL.toFixed(3));
  check(`spin eases in (${early.toFixed(2)} rad/s at first) to ${full.toFixed(2)} rad/s, one turn in ${(2*Math.PI/full).toFixed(2)} s, clockwise from above (RHBH)`);
  // The hand's way: a right-hand forehand turns the other way.
  await page.evaluate(()=>Disc3D.setHand('RHFH'));t=await trace(page,500);
  assert.ok(speed(t,0,500)>FULL*.8,'RHFH counter-clockwise');await page.evaluate(()=>Disc3D.setHand('RHBH'));
  check('a right-hand forehand spins the other way');

  // Rim tilt composes: tilted 30°, the disc's own axis stays where the tilt put it while the disc turns about it.
  await page.evaluate(()=>Disc3D.viewer.setTilt(30));
  const axis=()=>page.evaluate(()=>{const g=Disc3D.viewer.debug.discGroup;g.updateWorldMatrix(true,false);const e=g.matrixWorld.elements,l=Math.hypot(e[4],e[5],e[6]);return [e[4]/l,e[5]/l,e[6]/l,g.rotation.y];});
  const a1=await axis();await page.waitForTimeout(500);const a2=await axis();
  assert.ok(Math.hypot(a1[0]-a2[0],a1[1]-a2[1],a1[2]-a2[2])<1e-6,'own axis fixed: '+a1+' / '+a2);
  assert.ok(Math.abs(a1[3]-a2[3])>.3,'and turning about it');assert.ok(Math.abs(a1[0])>.4,'the axis is tilted');
  check(`tilted 30°: spins about its own (tilted) axis (${a1.slice(0,3).map(v=>v.toFixed(3)).join(', ')})`);
  await page.evaluate(()=>Disc3D.viewer.setTilt(0));

  // A drag takes the disc at once; letting go eases it back up.
  const box=await page.locator('#detail .disc3d-canvas').boundingBox(),cx=box.x+box.width/2,cy=box.y+box.height/2;
  await page.mouse.move(cx,cy);await page.mouse.down();
  const held=await page.evaluate(()=>({held:Disc3D.viewer.debug.spin.held,level:Disc3D.viewer.debug.spin.level}));
  assert.deepEqual(held,{held:true,level:0},'grabbed: the turntable stops at once');
  const h0=await turn(page);
  for(let i=1;i<=8;i++){await page.mouse.move(cx+i*6,cy);await page.waitForTimeout(30);}
  await page.waitForTimeout(250);assert.equal(await turn(page),h0,'no turning while held');
  await page.mouse.up();
  t=await trace(page,1600);
  assert.ok(-speed(t,0,200)<FULL*.3&&-speed(t,1100,1600)>FULL*.85,'released: eases back up ('+(-speed(t,0,200)).toFixed(2)+' → '+(-speed(t,1100,1600)).toFixed(2)+')');
  check('a drag takes the disc at once; release eases the spin back up');

  // Off: eases to a stop where it got to, then on demand again.
  await page.locator(spinButton).click();
  assert.equal(await page.locator(spinButton).getAttribute('aria-pressed'),'false');
  assert.equal(await page.evaluate(()=>localStorage.getItem('disc-atlas-viewer-spin')),null);
  t=await trace(page,1300);
  const coast=Math.abs(t.at(-1)[1]);
  assert.ok(-speed(t,0,150)>FULL*.6,'still turning just after');assert.ok(Math.abs(speed(t,1000,1300))<1e-9,'stopped');
  assert.ok(coast>.2&&coast<1,'a short coast: '+coast.toFixed(2)+' rad');
  const rest=await turn(page);assert.notEqual(rest,0);
  const f2=await frames(page);await page.waitForTimeout(600);
  assert.equal(await frames(page),f2,'on demand again');assert.equal(await turn(page),rest,'left where it reached');
  check(`off: coasts ${(coast*180/Math.PI).toFixed(0)}° to a stop at ${(rest*180/Math.PI).toFixed(0)}°, then on demand`);

  // Remembered across a reload.
  await page.locator(spinButton).click();
  await page.reload();await page.waitForFunction(()=>typeof filtered!=='undefined'&&filtered.length>0);await show(page);
  assert.equal(await page.locator(spinButton).getAttribute('aria-pressed'),'true');
  t=await trace(page,1500);assert.ok(-speed(t,1000,1500)>FULL*.85,'spinning after a reload');
  check('the choice survives a reload');

  // The pop-out takes the turntable; the panel's disc rests behind it and spins again on close.
  await page.evaluate(()=>Disc3D.open());await page.waitForFunction(()=>Disc3D.popout?.state.frames>0);
  assert.equal(await page.evaluate(()=>Disc3D.popout.state.spin),true);
  assert.deepEqual(await page.evaluate(()=>[Disc3D.viewer.state.spin,Disc3D.viewer.debug.spin.level]),[false,0],'the panel rests');
  t=await trace(page,1200,'Disc3D.popout');assert.ok(-speed(t,700,1200)>FULL*.85,'the pop-out spins');
  const pf=await frames(page);await page.waitForTimeout(400);assert.equal(await frames(page),pf,'the panel draws nothing behind the pop-out');
  await page.evaluate(()=>Disc3D.close());await page.waitForFunction(()=>!Disc3D.popout);
  assert.equal(await page.evaluate(()=>Disc3D.viewer.state.spin),true);
  t=await trace(page,1500);assert.ok(-speed(t,1000,1500)>FULL*.85,'the panel spins again');
  check('the pop-out takes the turntable with the pose, and hands it back');
  await context.close();
 }

 // Reduced motion: a remembered spin does not start by itself; a tap still starts it.
 {
  const {page,context}=await open({reducedMotion:'reduce',remembered:true});await show(page);
  assert.equal(await page.evaluate(()=>Disc3D.viewer.state.spin),false);
  assert.equal(await page.locator(spinButton).getAttribute('aria-pressed'),'false');
  const r0=await turn(page);await page.waitForTimeout(800);assert.equal(await turn(page),r0,'no auto-start');
  await page.locator(spinButton).click();const t=await trace(page,1500);
  assert.ok(-speed(t,1000,1500)>FULL*.85,'the tap starts it');
  check('reduced motion: never starts by itself; the tap still works');
  await context.close();
 }

 // Frame cost: a spinning frame against a still one (render call time), on the desktop and a phone.
 for(const [label,options] of [['desktop',{}],['phone',{viewport:{width:390,height:844},context:{hasTouch:true,isMobile:true}}]]){
  const {page,context}=await open(options);await show(page);
  const cost=await page.evaluate(async()=>{
   const v=Disc3D.viewer,r=v.debug.renderer,render=r.render.bind(r),times=[];
   r.render=(...a)=>{const t=performance.now();render(...a);times.push(performance.now()-t);};
   const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
   for(let i=0;i<90;i++){v.debug.renderNow();await new Promise(r=>requestAnimationFrame(r));}
   const still=mean(times.splice(0));
   v.setSpin(true);await new Promise(r=>setTimeout(r,1500));times.length=0;await new Promise(r=>setTimeout(r,1500));
   const spinning=mean(times),count=times.length;v.setSpin(false,{instant:true});r.render=render;
   return {still,spinning,count};
  });
  assert.ok(cost.spinning<=cost.still*1.5+.3,label+' spinning frame '+cost.spinning.toFixed(3)+' ms vs still '+cost.still.toFixed(3));
  check(`${label} frame cost: ${cost.spinning.toFixed(2)} ms spinning (${cost.count} frames in 1.5 s) vs ${cost.still.toFixed(2)} ms still`);
  await context.close();
 }

 assert.deepEqual(errors,[]);check('no page errors');
 console.log('spin: pass');
}finally{await browser.close();server.close();}
