import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config='tests/auth.wrangler.jsonc',state='work/bag-3d/d1-qa',base='https://localhost:8802',dir='outputs/bag-3d';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8802','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;
for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
// Hardware GPU when the machine has one (faithful screenshots and frame timing);
// Chromium falls back to SwiftShader otherwise, which the viewer detects.
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const themes=['light','midnight','charcoal'],widths=[1440,360],errors=[],shots=[],checks=[],perf={};
const check=label=>checks.push(label);
const percentile=(values,p)=>{const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.floor(p*sorted.length))];};
try {
 const deadline=Date.now()+45000;
 while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const cb=new URL(u.searchParams.get('redirect_uri'));cb.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${cb.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const requests=[];page.on('request',r=>requests.push(new URL(r.url()).pathname));
 const bagRequests=()=>requests.filter(p=>p.startsWith('/bag3d/'));
 const phase=want=>page.waitForFunction(w=>document.querySelector('#bagScene').dataset.phase===w,want);
 const viewer=(fn,arg)=>page.locator('[data-bag-canvas]').evaluate((n,[source,value])=>new Function('v','arg',`return (${source})(v,arg)`)(n.bagViewer,value),[fn.toString(),arg]);
 const data=async()=>await (await page.request.get(base+'/api/bag')).json();
 const setTheme=async theme=>{await page.getByRole('button',{name:'Site menu',exact:true}).click();await page.getByRole('menuitemradio',{name:theme[0].toUpperCase()+theme.slice(1),exact:true}).click();await page.keyboard.press('Escape');};
 // The rendered 3D state must match the saved bag exactly: same discs, pockets and colors.
 const inSync=async(label)=>{
  const saved=(await data()).discs.filter(d=>d.in_bag),rendered=await viewer(v=>v.getBagLayoutState().filter(d=>!d.empty));
  const pocketOf={main:'main',putter:'putter',goTo:'goto'};
  const want=saved.map(d=>[d.id,d.pocket,d.color]).sort().join('|'),got=rendered.map(d=>[d.id,pocketOf[d.pocket],d.color]).sort().join('|');
  assert.equal(got,want,`3D state matches the saved bag: ${label}`);
  const targets=await page.locator('[data-physical-disc]').evaluateAll(nodes=>nodes.map(n=>[n.dataset.physicalDisc,n.parentNode.dataset.pocket]).sort().join('|'));
  assert.equal(targets,saved.map(d=>[d.id,d.pocket]).sort().join('|'),`Hit layer matches: ${label}`);
 };
 const settle=()=>page.waitForTimeout(500);
 const shot=async(state,width,theme,options={})=>{
  await page.evaluate(()=>document.fonts.ready);await settle();
  const name=`${state}-${width}-${theme}.png`;await (options.locator||page).screenshot({path:`${dir}/${name}`});shots.push({state,width,theme,name});
 };

 // 1. Lazy loading: on the atlas, nothing 3D loads until My Bag is shown (signed out, the demo bag).
 await page.goto(base+'/');await page.waitForFunction(()=>window.AtlasAccount?.current);await page.waitForTimeout(800);
 assert.deepEqual(bagRequests(),[],'Atlas: no 3D assets');
 await page.locator('#bagTab').click();await page.locator('#myBagDemo').waitFor();
 await page.locator('#myBagSignIn').click();await page.getByRole('link',{name:'Continue with Google',exact:true}).waitFor();
 const href=await page.getByRole('link',{name:'Continue with Google',exact:true}).getAttribute('href');
 const redirect=await page.request.get(base+href,{maxRedirects:0});await page.goto(redirect.headers().location);
 await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();
 // Seed a realistic bag through the API: Grip BX3 (18 main + 4 putter + 1 extra).
 const seeded=await page.evaluate(async()=>{
  const headers={'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken},rows=[];
  const bag=await fetch('/api/bag',{method:'PUT',headers,body:JSON.stringify({bag_model:'Grip BX3',bag_color:'#343c49'})});if(!bag.ok)throw Error(await bag.text());
  for(const disc of [
   {mold_id:'3d60892b6812',plastic:'Champion',wear:9,weight_g:172,color:'#70b7cd',pocket:'goto',notes:'Tee shot on 1'},
   {mold_id:'3d60892b6812',plastic:'Star',wear:4,weight_g:170,color:'#ed7868',stability_bias:'less_stable'},
   {mold_id:'35dae588c670',plastic:'Neutron',wear:7,weight_g:175,color:'#a7c68c'},
   {mold_id:'7446eb39abe5',plastic:'Z',wear:8,weight_g:180,color:'#b99bdd'},
   {mold_id:'761c90d342f5',plastic:'Electron',wear:6,weight_g:175,color:'#e6c668'},
   {mold_id:'ff4bf9e7743c',plastic:'Putter Line Hard',wear:10,weight_g:174,color:'#e2d8c1'},
   {mold_id:'9152771e1f7b',plastic:'DX',wear:3,weight_g:180,color:'#79b3a8',in_bag:false,notes:'Backup · windy rounds'}
  ]){const r=await fetch('/api/bag/discs',{method:'POST',headers,body:JSON.stringify(disc)});if(!r.ok)throw Error(await r.text());rows.push((await r.json()).disc);}
  return rows;
 });
 const [goto,driver,fairway,mid,putter,luna,stored]=seeded;
 requests.length=0;
 await page.goto(base+'/');await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.waitForFunction(()=>filtered.length>0);await page.waitForTimeout(1200);
 assert.deepEqual(bagRequests(),[],'Signed in on the map: three.js and the model are not loaded');
 const importMap=await page.evaluate(()=>!!document.querySelector('script[type="importmap"]'));assert.ok(importMap);
 const opened=Date.now();await page.locator('#bagTab').click();await phase('open');perf.firstOpenMs=Date.now()-opened;
 const loaded=bagRequests();
 for(const asset of ['/bag3d/viewer.mjs','/bag3d/vendor/three/three.module.min.js','/bag3d/vendor/three/three.core.min.js','/bag3d/charcoal-bag.glb'])assert.ok(loaded.includes(asset),`Bag tab loads ${asset}`);
 assert.ok(!loaded.includes('/bag3d/vendor/three/addons/controls/OrbitControls.js'),'Turntable mode never loads OrbitControls');
 perf.bytes=await page.evaluate(()=>performance.getEntriesByType('resource').filter(e=>new URL(e.name).pathname.startsWith('/bag3d/')).reduce((sum,e)=>sum+(e.encodedBodySize||0),0));
 check(`Lazy load: no 3D requests on the atlas (signed out or in); Bag tab loads three.js + model (${(perf.bytes/1e6).toFixed(2)} MB) and opens in ${perf.firstOpenMs} ms`);
 perf.renderer=await page.evaluate(()=>{const gl=document.createElement('canvas').getContext('webgl2');const d=gl.getExtension('WEBGL_debug_renderer_info');return gl.getParameter(d?d.UNMASKED_RENDERER_WEBGL:gl.RENDERER);});
 perf.quality=await viewer(v=>v.renderer.quality);

 // 2. Feature parity: pockets, capacities, go-to, colors.
 await inSync('initial load');
 const layout=await viewer(v=>v.getBagLayoutState());
 const count=pocket=>layout.filter(d=>d.pocket===pocket).length;
 assert.equal(count('main'),19,'18 main + 1 extra slots');assert.equal(count('putter'),4,'4 putter slots');
 assert.equal(await page.locator('.bag-goto-slot [data-physical-disc]').count(),1);assert.equal(await page.locator('.bag-goto-slot .bag-slot-hollow').count(),0);
 const at=id=>layout.find(d=>d.id===id).position,pocketOf=id=>layout.find(d=>d.id===id).pocket;
 assert.equal(pocketOf(goto.id),'goTo');assert.equal(pocketOf(putter.id),'putter');assert.equal(pocketOf(driver.id),'main');
 assert.ok(at(putter.id)[1]>at(goto.id)[1] && at(goto.id)[1]>at(driver.id)[1],'Putters in the top pocket, go-to in the front pocket above main');
 assert.ok(at(goto.id)[2]>at(putter.id)[2] && at(goto.id)[2]>at(driver.id)[2],'Go-to pocket is the front pocket');
 assert.equal(layout.find(d=>d.id===driver.id).color,'#ed7868','Per-disc color reaches the 3D material');
 assert.match(await page.locator('#bagSlotMeter').innerText(),/^6 \/ 23$/);assert.ok(await page.locator('#bagStorage').isHidden(),'One list at a time: Storage waits behind the list picker');assert.equal(await page.locator('[data-list-count="storage"]').innerText(),'1');
 check('Parity: 19 main + 4 putter slots, putters in the top pocket, go-to in the front pocket above main, per-disc colors, meter and Storage');

 // 3. Live sync: every change applies to the 3D scene without a reload.
 const reloads=[];page.on('framenavigated',f=>{if(f===page.mainFrame())reloads.push(f.url());});
 const setInline=async(id,pocket)=>{const saved=page.waitForResponse(r=>r.url().endsWith('/api/bag/discs/'+id) && r.request().method()==='PATCH');await page.locator(`select[data-bag-pocket="${id}"]`).selectOption(pocket);assert.equal((await saved).status(),200);await page.waitForFunction(([id,p])=>{const s=document.querySelector(`select[data-bag-pocket="${id}"]`);return s && !s.disabled && s.value===p;},[id,pocket]);};
 await setInline(fairway.id,'putter');await inSync('inline move to putter');
 await setInline(mid.id,'goto');await inSync('second go-to copy');
 assert.equal(await page.locator('.bag-goto-slot [data-physical-disc]').count(),2,'Two go-to copies share the front pocket');
 await setInline(mid.id,'main');await setInline(fairway.id,'main');await inSync('back to main');
 await setInline(goto.id,'main');await inSync('go-to cleared');
 assert.equal(await page.locator('.bag-goto-slot .bag-slot-hollow').count(),1,'Empty go-to outline returns');
 await setInline(goto.id,'goto');await inSync('go-to reassigned');
 // Color via the edit sheet.
 await page.locator(`[data-bag-edit="${luna.id}"]`).click();await page.locator('#bagDiscColor').fill('#ffcc66');await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 await inSync('disc color edit');
 // Storage and back (My Bag shows one list at a time: Storage, then Bag).
 await page.locator('#bagListPicker [data-bag-list="storage"]').click();
 await page.locator(`[data-bag-move="${stored.id}"]`).click();await page.waitForFunction(()=>document.querySelector('#bagSlotMeter').textContent==='7 / 23');await inSync('stored disc bagged');
 await page.locator('#bagListPicker [data-bag-list="bag"]').click();
 await page.locator(`[data-bag-move="${stored.id}"]`).click();await page.waitForFunction(()=>document.querySelector('#bagSlotMeter').textContent==='6 / 23');await inSync('disc stored');
 // Bag color and capacities via Bag settings.
 await page.locator('#editBagModel').click();await page.locator('#bagModel').selectOption('__custom');await page.locator('#customBagName').fill('Tournament pack');
 await page.locator('#bagMainCapacity').fill('14');await page.locator('#bagPutterCapacity').fill('3');await page.locator('#bagFabricColor').fill('#436752');
 await page.locator('#saveBagModel').click();await page.locator('#bagModelDialog').waitFor({state:'hidden'});
 assert.equal(await viewer(v=>v.bagColor),'#436752');assert.equal(await page.locator('#bagScene').getAttribute('data-bag-color'),'#436752');
 const resized=await viewer(v=>v.getBagLayoutState());assert.equal(resized.filter(d=>d.pocket==='main').length,14);assert.equal(resized.filter(d=>d.pocket==='putter').length,3);
 await inSync('capacity change');
 assert.deepEqual(reloads,[],'No navigation or reload during live updates');
 check('Live sync without reloads: inline pocket moves, two go-to copies, go-to clear/assign, disc color, Storage round trip, bag color and capacities');

 // 4. Open/close, keyboard and pointer behavior.
 const mainDisc=page.locator(`[data-physical-disc="${driver.id}"]`),topDisc=page.locator(`[data-physical-disc="${goto.id}"]`);
 await page.locator('[data-bag-toggle]').click();await phase('closed');
 assert.equal(await viewer(v=>v.compartmentProgress),0);assert.equal(await mainDisc.getAttribute('tabindex'),'-1');
 assert.equal(await topDisc.getAttribute('tabindex'),'0','Go-to stays reachable with the flap closed');
 // Focus (like hover) names the disc in a pill; the disc stays in its pocket.
 await topDisc.focus();await settle();assert.equal(await viewer(v=>v.liftedDisc),null);assert.ok(await page.locator('.bag-hover-name').isVisible());assert.match(await page.locator('#bagLiftInfo').innerText(),/Go-to/);
 await page.keyboard.press('Escape');assert.ok(await page.locator('[data-bag-toggle]').evaluate(n=>n===document.activeElement));
 await page.keyboard.press('Enter');await phase('open');assert.equal(await viewer(v=>v.compartmentProgress),1);assert.equal(await mainDisc.getAttribute('tabindex'),'0');
 const resting=await viewer((v,id)=>v.discScreenRect(id),driver.id);
 await mainDisc.hover();await settle();assert.equal(await viewer(v=>v.liftedDisc),null,'Hover does not move the disc');
 assert.deepEqual(await viewer((v,id)=>v.discScreenRect(id),driver.id),resting);assert.equal((await page.locator('.bag-hover-name').innerText()).trim(),'Destroyer','Hover names the disc');
 // A click slides the disc out of the compartment, face-on.
 await mainDisc.click();await page.waitForFunction(()=>document.querySelector('#bagScene').dataset.staging==='still' && document.querySelector('#bagScene').dataset.out);await settle();
 const lifted=await viewer((v,id)=>v.discScreenRect(id),driver.id),box=await page.locator('[data-bag-canvas]').evaluate(n=>({w:n.clientWidth,h:n.clientHeight}));
 assert.ok(lifted.left>=0 && lifted.top>=0 && lifted.left+lifted.width<=box.w && lifted.top+lifted.height<=box.h,'Slid-out disc stays inside the canvas');
 // Color fidelity: the slid-out disc's face renders close to the saved color (#ed7868).
 const face=await page.locator('[data-bag-canvas]').boundingBox(),crop=await page.screenshot({clip:{x:face.x+lifted.left+lifted.width*.5-2,y:face.y+lifted.top+lifted.height*.5-2,width:5,height:5}});
 const rendered=await page.evaluate(async b64=>{const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();const c=document.createElement('canvas');c.width=5;c.height=5;const x=c.getContext('2d');x.drawImage(img,0,0);return [...x.getImageData(2,2,1,1).data.slice(0,3)];},crop.toString('base64'));
 const wanted=[0xed,0x78,0x68],drift=Math.max(...rendered.map((v,i)=>Math.abs(v-wanted[i])));perf.liftedFace={rendered:'#'+rendered.map(v=>v.toString(16).padStart(2,'0')).join(''),wanted:'#ed7868',drift};
 assert.ok(drift<=40,`Slid-out disc keeps its color: rendered ${perf.liftedFace.rendered} vs #ed7868`);
 // Its name's popup opens its details; Escape closes them and returns focus to it; the disc stays out until it is clicked again.
 await page.locator(`[data-out-name="${driver.id}"][data-shown]`).click();await page.locator('.bag-disc-popup:not([hidden])').click();await page.locator('#detail').waitFor({state:'visible'});
 await page.keyboard.press('Escape');await page.locator('#detail').waitFor({state:'hidden'});
 assert.deepEqual(await viewer(v=>v.outDiscs),[driver.id],'Escape leaves the disc out');assert.ok(await mainDisc.evaluate(n=>n===document.activeElement),'Escape returns focus to the disc');
 await mainDisc.click();await page.waitForFunction(()=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().every(d=>d.slide===0));
 await page.mouse.move(5,5);await settle();assert.deepEqual(await viewer(v=>v.outDiscs),[],'A second click puts it back');
 // Drag sideways turns the bag and it stays turned; a drag never toggles.
 const canvas=await page.locator('.bag-3d-stage canvas').boundingBox(),cx=canvas.x+canvas.width*.15,cy=canvas.y+canvas.height*.6;
 await page.mouse.move(cx,cy);await page.mouse.down();await page.mouse.move(cx+160,cy+6,{steps:10});
 const turned=await page.locator('[data-bag-canvas]').evaluate(n=>n.querySelector('canvas').style.cursor);assert.equal(turned,'grabbing');
 await page.mouse.up();await page.waitForTimeout(900);assert.equal(await page.locator('#bagScene').getAttribute('data-phase'),'open','Drag does not toggle the flap');
 assert.equal(await page.locator('.bag-3d-stage canvas').evaluate(n=>getComputedStyle(n).touchAction),'pan-y','Vertical swipes scroll the page on touch');
 const before=await page.evaluate(()=>scrollY);await page.mouse.move(cx,cy);await page.mouse.wheel(0,300);await page.waitForTimeout(300);
 assert.ok(await page.evaluate(b=>scrollY>b,before),'The wheel scrolls the page over the bag (no zoom capture)');
 await page.evaluate(()=>scrollTo(0,0));
 check(`Slid-out disc color ${perf.liftedFace.rendered} vs saved #ed7868 (max channel drift ${perf.liftedFace.drift})`);
 check('Open/close: flap progress 0↔1, main discs unreachable when closed, go-to/putters still reachable; hover/focus name pill, click slide-out (stays out through Escape, back on a second click), drag-to-turn, page scroll preserved');

 // 5. One size (Oct 5 tweaks), re-rendered (not upscaled), and zoomed instead of S/M/L.
 const measure=()=>page.locator('[data-bag-canvas]').evaluate(n=>{const c=n.querySelector('canvas'),r=n.bagViewer.renderer;return {css:Math.round(c.clientWidth),buffer:c.width,ratio:r.pixelRatio,target:Math.round(n.querySelector(`[data-pocket="main"] > [data-physical-disc]`).getBoundingClientRect().height)};});
 assert.equal(await page.locator('input[name="bagSize"]').count(),0,'No size options');
 const sizes={base:await measure()};
 await page.locator('#bagScene').getByRole('button',{name:'Zoom in'}).click();await page.waitForTimeout(350);sizes.zoomed=await measure();
 for(const size of ['base','zoomed'])assert.equal(sizes[size].buffer,Math.round(sizes[size].css*sizes[size].ratio),`${size}: canvas buffer matches its displayed size`);
 assert.equal(sizes.base.css,680);assert.ok(sizes.zoomed.target>sizes.base.target*1.3,'Hit targets scale with the zoom');
 await page.locator('#bagScene').getByRole('button',{name:/^Reset zoom/}).click();await page.waitForTimeout(350);
 check(`Size: ${sizes.base.css}px at 1440×1000 (one size), rendered at full resolution; zoom scales hit targets ${sizes.base.target}→${sizes.zoomed.target}px`);

 // 6. Performance on a mid-range phone profile: 360×800, DPR 2.625, 4× CPU slowdown.
 const phone=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:360,height:800},deviceScaleFactor:2.625,isMobile:true,hasTouch:true,storageState:await context.storageState()});
 const mobile=await phone.newPage();mobile.on('pageerror',e=>errors.push(e.stack));
 const cdp=await phone.newCDPSession(mobile);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await mobile.goto(base+'/');await mobile.waitForFunction(()=>window.AtlasAccount?.current?.user);await mobile.waitForFunction(()=>filtered.length>0);
 await mobile.evaluate(()=>{window.__long=[];new PerformanceObserver(list=>{for(const e of list.getEntries())window.__long.push(Math.round(e.duration));}).observe({type:'longtask'});});
 const tap=Date.now();await mobile.locator('#bagTab').tap();await mobile.waitForFunction(()=>document.querySelector('#bagScene').dataset.phase==='open',null,{timeout:60000});
 perf.phone={openMs:Date.now()-tap,loadLongTasks:await mobile.evaluate(()=>window.__long.slice())};
 await mobile.locator('#bagScene').scrollIntoViewIfNeeded();
 const frames=async action=>mobile.evaluate(async source=>{
  window.__long=[];const times=[];let last=performance.now(),done=false;
  const tick=now=>{times.push(now-last);last=now;if(!done)requestAnimationFrame(tick);};requestAnimationFrame(tick);
  await new Function(`return (${source})()`)();done=true;await new Promise(r=>setTimeout(r,50));
  return {frames:times.length,times,longTasks:window.__long.slice()};
 },action.toString());
 const summarize=r=>({frames:r.frames,p50:+percentile(r.times,.5).toFixed(1),p95:+percentile(r.times,.95).toFixed(1),max:+Math.max(...r.times).toFixed(1),over34:r.times.filter(t=>t>34).length,longTasks:r.longTasks});
 perf.phone.idle=summarize(await frames(async()=>new Promise(r=>setTimeout(r,2000))));
 perf.phone.closeOpen=summarize(await frames(async()=>{const wait=w=>new Promise(r=>{const t=()=>document.querySelector('#bagScene').dataset.phase===w?r():setTimeout(t,16);t();});document.querySelector('[data-bag-toggle]').click();await wait('closed');document.querySelector('[data-bag-toggle]').click();await wait('open');}));
 perf.phone.liftSweep=summarize(await frames(async()=>{for(const n of document.querySelectorAll('[data-physical-disc]')){n.focus();await new Promise(r=>setTimeout(r,250));}document.activeElement.blur();await new Promise(r=>setTimeout(r,400));}));
 perf.phone.renderer=await mobile.locator('[data-bag-canvas]').evaluate(n=>n.bagViewer.renderer);
 for(const [name,run] of Object.entries({idle:perf.phone.idle,closeOpen:perf.phone.closeOpen,liftSweep:perf.phone.liftSweep})){
  assert.ok(run.p95<=34,`${name}: 95% of frames within two vsyncs on the phone profile (${run.p95} ms)`);
  assert.ok(!run.longTasks.some(t=>t>100),`${name}: no main-thread task over 100 ms during interaction (${run.longTasks})`);
 }
 perf.phone.maxLoadTask=Math.max(0,...perf.phone.loadLongTasks);
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});await phone.close();
 check(`Phone profile (4× CPU, DPR 2.625): idle p95 ${perf.phone.idle.p95} ms, close+open p95 ${perf.phone.closeOpen.p95} ms, lift sweep p95 ${perf.phone.liftSweep.p95} ms; longest task while loading ${perf.phone.maxLoadTask} ms`);

 // 7. Screenshots: 3D bag with discs, go-to assigned, open/closed, lifted; all themes, desktop and 360px.
 await page.locator('#editBagModel').click();await page.locator('#bagModel').selectOption('Grip BX3');await page.locator('#bagFabricColor').fill('#343c49');await page.locator('#saveBagModel').click();await page.locator('#bagModelDialog').waitFor({state:'hidden'});
 const scene=page.locator('#bagScene');
 for(const theme of themes)for(const width of widths){
  await page.setViewportSize({width,height:width===360?800:1000});await setTheme(theme);await page.reload();await phase('open');
  await scene.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
  await shot('open-goto',width,theme,{locator:scene});
  await page.locator('[data-bag-toggle]').click();await phase('closed');await shot('closed',width,theme,{locator:scene});
  await page.clock.install();await page.clock.pauseAt(await page.evaluate(()=>Date.now()+50));await page.locator('[data-bag-toggle]').click();await page.clock.runFor(330);
  assert.equal(await scene.getAttribute('data-phase'),'opening');await page.evaluate(()=>document.fonts.ready);await scene.screenshot({path:`${dir}/opening-${width}-${theme}.png`});shots.push({state:'opening',width,theme,name:`opening-${width}-${theme}.png`});
  await page.clock.runFor(1200);await page.clock.resume();await phase('open');
  await page.locator(`[data-physical-disc="${driver.id}"]`).focus();await shot('named-main',width,theme,{locator:scene});
  await page.locator(`[data-physical-disc="${goto.id}"]`).focus();await shot('named-goto',width,theme,{locator:scene});
  await page.keyboard.press('Escape');
  await page.locator('#bagLineup').scrollIntoViewIfNeeded();await page.locator(`select[data-bag-pocket="${goto.id}"]`).focus();await shot('list-inline-pocket',width,theme,{locator:page.locator('#bagLineup')});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
 }
 await page.setViewportSize({width:1440,height:1000});await setTheme('light');await page.reload();await phase('open');
 await page.locator('#editBagModel').click();await page.locator('#bagFabricColor').fill('#436752');await page.locator('#saveBagModel').click();await page.locator('#bagModelDialog').waitFor({state:'hidden'});
 await scene.scrollIntoViewIfNeeded();await shot('custom-color',1440,'light',{locator:scene});
 await page.locator('#bagScene').getByRole('button',{name:'Zoom in'}).click();await page.waitForTimeout(350);await scene.scrollIntoViewIfNeeded();await shot('zoomed',1440,'light',{locator:scene});
 await page.locator('#bagScene').getByRole('button',{name:/^Reset zoom/}).click();await page.waitForTimeout(350);
 check(`Screenshots: ${shots.length} across ${themes.length} themes at 1440px and 360px (open with go-to, closed, mid-fold, named main, named go-to, list), plus bag color and zoom`);

 // 8. Sign-out clears the player's discs from the scene; the read-only demo bag takes their place.
 await page.evaluate(()=>window.AtlasAccount.signOut());await page.waitForFunction(()=>!window.AtlasAccount.current.user);
 await page.locator('#myBagDemo').waitFor();await page.waitForFunction(()=>{const ids=[...document.querySelectorAll('[data-physical-disc]')].map(n=>n.dataset.physicalDisc);return ids.length===18&&ids.every(id=>id.startsWith('demo-'));});
 assert.deepEqual(errors,[]);
 fs.writeFileSync(dir+'/qa.json',JSON.stringify({passed:true,checks,perf,sizes,gpuArgs,themes,widths,screenshots:shots,errors},null,2));
 const order=['open-goto','closed','opening','named-main','named-goto','list-inline-pocket','custom-color','size-s','size-l'];
 fs.writeFileSync(dir+'/screenshots.html',`<!doctype html><meta charset="utf-8"><title>3D bag QA</title><style>body{margin:32px;background:#14191f;color:#e9edf0;font:16px system-ui}section{margin:40px 0}figure{display:inline-block;vertical-align:top;margin:12px}img{width:420px;max-width:100%}.mobile img{width:300px}a{color:inherit}figcaption{margin-top:6px;font-size:13px}li{margin:4px 0}pre{background:#0c1014;padding:16px;overflow:auto;font-size:12px}</style><h1>3D bag · local QA</h1><ul>${checks.map(c=>`<li>✓ ${c}</li>`).join('')}</ul><pre>${JSON.stringify({renderer:perf.renderer,quality:perf.quality,phone:{openMs:perf.phone.openMs,maxLoadTask:perf.phone.maxLoadTask,idle:perf.phone.idle,closeOpen:perf.phone.closeOpen,liftSweep:perf.phone.liftSweep}},null,1)}</pre>${['light','midnight','charcoal'].map(theme=>`<section><h2>${theme}</h2>${order.flatMap(state=>shots.filter(s=>s.theme===theme && s.state===state)).map(s=>`<figure class="${s.width===360?'mobile':''}"><a href="${s.name}"><img src="${s.name}" loading="lazy"></a><figcaption>${s.state} · ${s.width}px</figcaption></figure>`).join('')}</section>`).join('')}`);
 console.log(checks.map(c=>'✓ '+c).join('\n'));
 console.log(`PASS: ${checks.length} checks, ${shots.length} screenshots; renderer ${perf.renderer} (${perf.quality}); no page errors.`);
 await context.close();
} finally {await browser?.close();server.kill();}
