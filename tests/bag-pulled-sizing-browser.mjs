import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const base='https://localhost:8810',config='tests/auth.wrangler.jsonc',dir='outputs/bag-pulled-sizing';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8810','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to','work/bag-pulled-sizing/d1-qa'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const overlap=(a,b)=>a.left<b.left+b.width-.5&&b.left<a.left+a.width-.5&&a.top<b.top+b.height-.5&&b.top<a.top+a.height-.5;
const errors=[],metrics={};
try{
 const deadline=Date.now()+45000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.env.BAG3D_CHROMIUM_ARGS?.split(' ')||['--use-angle=d3d11','--enable-gpu']});
 const page=await browser.newPage({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
 page.on('pageerror',e=>errors.push(e.stack));
 const demo=fs.readFileSync('public/bag-demo.js','utf8').replace("'4f7f3d501174'","'b52c5cb1753a'");
 await page.route('**/bag-demo.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:demo}));
 const open=async()=>{await page.goto(base+'/?bag=1');await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s?.dataset.engine==='ready'&&s.dataset.phase==='open';},null,{timeout:30000});await page.evaluate(()=>document.fonts.ready);await page.mouse.move(2,2);};
 const settled=()=>page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return !s.querySelector('[data-bag-canvas]').bagViewer.stage.moving&&s.dataset.staging==='still';},null,{timeout:20000});
 const pull=async id=>{await page.locator(`[data-physical-disc="${id}"]`).evaluate(n=>n.click());await settled();};
 const snapshot=()=>page.locator('[data-bag-canvas]').evaluate(n=>{
  const v=n.bagViewer,c=n.getBoundingClientRect();
  return {stage:v.stage,discs:v.discRects().filter(r=>r.out),standing:v.discRects().filter(r=>!r.out&&!r.empty&&(r.pocket==='putter'||r.pocket==='goTo')),bag:v.bagRect(),width:c.width,height:c.height,names:[...n.querySelectorAll('[data-out-name][data-shown]')].map(e=>{const r=e.getBoundingClientRect();return {id:e.dataset.outName,left:r.left-c.left,top:r.top-c.top,width:r.width,height:r.height};})};
 });
 const check=async label=>{
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-out-name][data-shown]')].every(n=>Number(getComputedStyle(n).opacity)>.99),null,{timeout:2500});
  const f=await snapshot();assert.equal(f.names.length,f.discs.length,`${label}: every disc has a label`);
  const boxes=[...f.discs,...f.names];
  for(const box of boxes){
   assert.ok(box.left>=7.5&&box.top>=7.5&&box.left+box.width<=f.width-7.5&&box.top+box.height<=f.height-7.5,`${label}: ${box.id} within viewport`);
   assert.ok(!overlap(box,f.bag),`${label}: ${box.id} clear of bag`);
   for(const standing of f.standing)assert.ok(!overlap(box,standing),`${label}: ${box.id} clear of pocket discs`);
  }
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)assert.ok(!overlap(boxes[i],boxes[j]),`${label}: ${boxes[i].id} and ${boxes[j].id} footprints apart`);
  for(const disc of f.discs)assert.ok(f.stage.sides[disc.id]==='left'?disc.left+disc.width<=f.bag.left-12:disc.left>=f.bag.left+f.bag.width+12,`${label}: hard inner boundary`);
  metrics[label]={diameters:f.discs.map(d=>+d.width.toFixed(2)),stage:f.stage};
  return f;
 };
 const shot=async name=>{await page.mouse.move(2,2);await page.waitForTimeout(250);await page.locator('[data-bag-canvas]').screenshot({path:`${dir}/${name}.png`});};
 await open();
 const ids=['demo-04','demo-01',...(await page.locator('[data-physical-disc]').evaluateAll(l=>l.map(n=>n.dataset.physicalDisc))).filter(id=>!['demo-04','demo-01'].includes(id))];
 await pull(ids[0]);const one=await check('desktop-1');await shot('desktop-1');
 assert.ok(one.discs[0].width>=3*124.05,'single pulled disc reaches at least 3× its measured desktop baseline');
 await pull(ids[1]);const two=await check('desktop-2');await shot('desktop-2');
 assert.ok(two.discs.every(d=>d.width>=3*124.05),'Premier DD3 + Destroyer are both in the large max tier');
 // Watch a real size change, including the DOM label, while the side count grows.
 await page.locator('[data-bag-canvas]').evaluate(n=>{
  n.sizingFrames=[];n.sizingSampling=true;const start=performance.now();
  const tick=()=>{const v=n.bagViewer,c=n.getBoundingClientRect();n.sizingFrames.push({t:performance.now()-start,labelOpacity:Number(getComputedStyle(n.querySelector('.bag-out-names')).opacity),discs:v.discRects().filter(d=>d.out).map(d=>{const r=v.discScreenRect(d.id,{rim:true}),label=n.querySelector(`[data-out-name="${d.id}"]`)?.getBoundingClientRect();return {id:d.id,width:r.width,labelTop:label?.top-c.top,discBottom:r.top+r.height};})});if(n.sizingSampling)requestAnimationFrame(tick);};requestAnimationFrame(tick);
 });
 await pull(ids[2]);
 const three=await check('desktop-3');
 const frames=await page.locator('[data-bag-canvas]').evaluate(n=>{n.sizingSampling=false;return n.sizingFrames;});
 const changed=two.discs.find(d=>three.discs.find(e=>e.id===d.id).width<d.width-10);
 assert.ok(changed,'existing discs shrink when their side count grows');
 const target=three.discs.find(d=>d.id===changed.id).width;
 const samples=frames.map(f=>({t:f.t,width:f.discs.find(d=>d.id===changed.id)?.width})).filter(f=>f.width!==undefined);
 fs.writeFileSync(`${dir}/animation-debug.json`,JSON.stringify({changed,target,samples},null,2));
 assert.ok(samples.some(s=>s.width<changed.width-2&&s.width>target+2),'size glides through intermediate diameters');
 const reached=samples.find(s=>Math.abs(s.width-target)<1);
 assert.ok(reached&&reached.t<=450,`size reaches its target around the 300 ms token (observed ${reached?.t} ms)`);
 const labelFrames=frames.filter(f=>f.t>80&&f.t<600).map(f=>f.discs.find(d=>d.id===changed.id));
 assert.ok(labelFrames.every(f=>Math.abs(f.labelTop-f.discBottom-6)<8),'label follows the live rim throughout the glide without jumping to a fallback position');
 assert.ok(frames.filter(f=>f.t>100&&f.t<600).every(f=>f.labelOpacity>.9),'desktop labels remain visible while their discs resize');
 metrics.animation={target,frames:samples,reachedMs:reached.t};
 for(let i=3;i<6;i++)await pull(ids[i]);
 const several=await check('desktop-6');await shot('desktop-6');
 assert.ok(several.discs.every(d=>d.width<Math.min(...two.discs.map(e=>e.width))));
 await page.locator(`[data-out-name="${ids[1]}"]`).click();await page.locator('.bag-disc-popup:not([hidden])').click();await page.locator('#detail').waitFor({state:'visible'});await settled();
 assert.ok((await snapshot()).stage.pull<=1.0001,'a partial bag keeps the full-sized camera beside details');
 await check('desktop-6-details');await page.mouse.move(2,2);await page.waitForTimeout(200);
 await page.keyboard.press('Escape');await page.locator('#detail').waitFor({state:'hidden'});
 await page.waitForFunction(()=>{const n=document.querySelector('[data-bag-canvas]');return n.getBoundingClientRect().right>=document.documentElement.clientWidth-24.5&&!n.getAnimations().length&&!n.bagViewer.stage.moving;},null,{timeout:15000});
 await check('desktop-6-details-closed');
 await page.locator('.bag-dump').evaluate(n=>n.click());await settled();
 const all=await check('desktop-all');await shot('desktop-all');
 assert.equal(all.discs.length,18);
 assert.ok(all.discs.every(d=>Math.abs(d.width-85.55)<.2),'all-out floor preserves the measured baseline');
 assert.ok(all.discs.every(d=>d.width<Math.min(...several.discs.map(e=>e.width))));
 // Returning discs grows their remaining neighbors; return-all still empties staging.
 await pull(ids[0]);await check('desktop-return-one');
 await page.locator('.bag-return-all').evaluate(n=>n.click());await settled();
 assert.equal((await snapshot()).discs.length,0);
 // Turning the bag must leave the enlarged resting discs clear of its new silhouette.
 await pull(ids[0]);await pull(ids[1]);await page.locator('[data-bag-canvas]').scrollIntoViewIfNeeded();
 const turnBox=await page.locator('[data-bag-canvas]').boundingBox();
 const tx=turnBox.x+turnBox.width/2,ty=turnBox.y+turnBox.height*.9;
 await page.mouse.move(tx,ty);await page.mouse.down();await page.mouse.move(tx+50,ty,{steps:8});await page.waitForTimeout(220);await page.mouse.up();
 await page.waitForFunction(()=>!document.querySelector('[data-bag-canvas]').bagViewer.turning);await settled();
 const turn=await page.locator('[data-bag-canvas]').evaluate(n=>n.bagViewer.turn);
 assert.ok(Math.abs(turn)>.2,'bounds test actually turned the bag');
 await check('desktop-2-after-turn');
 await page.setViewportSize({width:1280,height:900});await open();
 for(const id of ids.slice(0,6))await pull(id);
 await check('desktop-1280-6');
 await page.locator('.bag-dump').evaluate(n=>n.click());await settled();await check('desktop-1280-all');
 // A larger real DOM fixture exercises camera pullback and the full-count
 // boundary. Compare its floor with the existing planner, with sizing disabled.
 const extras=Array.from({length:14},()=>" ['3d60892b6812','Star',173,8,'#ed7868','main',null,''],").join('\n');
 const denseDemo=demo.replace('capacity:24,main_capacity:20','capacity:40,main_capacity:36').replace(' // Storage: off the course for now',extras+'\n // Storage: off the course for now');
 const legacy=await browser.newPage({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
 await legacy.route('**/bag-demo.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:denseDemo}));
 const source=fs.readFileSync('public/bag-scene.js','utf8'),disabled=source.replace("matchMedia('(min-width:701px)').matches",'false');
 assert.notEqual(source,disabled,'the comparison disables only the desktop opt-in');
 await legacy.route('**/bag-scene.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:disabled}));
 await legacy.goto(base+'/?bag=1');await legacy.waitForFunction(()=>document.querySelector('#bagScene')?.dataset.engine==='ready'&&document.querySelector('#bagScene').dataset.phase==='open');
 await legacy.locator('.bag-dump').evaluate(n=>n.click());
 await legacy.waitForFunction(()=>!document.querySelector('[data-bag-canvas]').bagViewer.stage.moving&&document.querySelector('#bagScene').dataset.staging==='still');
 const denseFloor=await legacy.locator('[data-bag-canvas]').evaluate(n=>n.bagViewer.discRects().filter(d=>d.out)[0].width);
 await legacy.close();
 await page.unroute('**/bag-demo.js');await page.route('**/bag-demo.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:denseDemo}));
 await page.setViewportSize({width:1440,height:1000});await open();
 const denseIds=await page.locator('[data-physical-disc]').evaluateAll(l=>l.map(n=>n.dataset.physicalDisc));
 assert.equal(denseIds.length,32);
 let prior=null,last=0;
 for(const count of [2,8,16,18,24,31,32]){
  await page.locator('[data-physical-disc]').evaluateAll((nodes,ids)=>{for(const id of ids)nodes.find(n=>n.dataset.physicalDisc===id).click();},denseIds.slice(last,count));
  await settled();
  const f=await check(`desktop-32bag-${count}`);
  assert.ok(f.discs.every(d=>d.width>=denseFloor-.2),'large bag never shrinks below its own legacy floor');
  if(prior)for(const side of ['left','right']){
   const current=f.discs.filter(d=>f.stage.sides[d.id]===side),previous=prior.discs.filter(d=>prior.stage.sides[d.id]===side);
   if(current.length>previous.length)assert.ok(current[0].width<previous[0].width-.01,'more discs shrink even across camera pullback');
  }
  prior=f;last=count;
 }
 assert.ok(prior.discs.every(d=>Math.abs(d.width-denseFloor)<.2),'large-bag full count preserves its measured legacy floor');
 metrics.denseFloor=denseFloor;
 // Phone takes exactly the existing path. Use its original demo fixture too.
 await page.unroute('**/bag-demo.js');await page.setViewportSize({width:390,height:1000});await open();
 const phoneIds=await page.locator('[data-physical-disc][tabindex="0"]').evaluateAll(l=>l.map(n=>n.dataset.physicalDisc));
 for(const count of [1,2,6,18]){
  if(count===18){await page.locator('.bag-dump').evaluate(n=>n.click());await settled();}
  else for(let i=count===1?0:count===2?1:2;i<count;i++)await pull(phoneIds[i]);
  const f=await snapshot(),baseline=JSON.parse(fs.readFileSync(`docs/assets/bag-pulled-disc-sizing/baseline-390-${count===2||count===6?1:count}.json`,'utf8'));
  const expected={1:41.2974,2:41.1809,6:33.565,18:27.196}[count];
  assert.ok(f.discs.every(d=>Math.abs(d.width-expected)<.2),`phone ${count}: unchanged diameters`);
  if(count===1||count===18){
   assert.equal(f.stage.around,baseline.stage.around);
   for(const d of f.discs){const old=baseline.discs.find(e=>e.id===d.id);assert.ok(Math.abs(d.left-old.left)<.2&&Math.abs(d.top-old.top)<.2,'phone centers unchanged');}
  }
  metrics[`phone-${count}`]={diameters:f.discs.map(d=>d.width),stage:f.stage};
 }
 await shot('phone-unchanged');
 assert.deepEqual(errors,[]);
 fs.writeFileSync(`${dir}/metrics.json`,JSON.stringify(metrics,null,2));
 console.log('ok - desktop sizes, bounds, labels, animation, return behavior, smaller desktop, and unchanged phone');
}finally{await browser?.close();server.kill();}
