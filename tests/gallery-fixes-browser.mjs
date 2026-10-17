// Gallery-only regressions and before/after evidence; real local auth/D1/R2 and shared WebGL viewer.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const phase=process.argv.includes('--before')?'before':process.env.GALLERY_FIXES_PHASE||'after',before=phase==='before';
const config='tests/auth.wrangler.jsonc',state='work/gallery-fixes/d1',base='https://localhost:8843',dir='docs/images/storage-all-discs-fixes';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8843','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='',browser;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>logs+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const report={phase,base:'e59e67e10f263718a47ca4fd842a70db630d5987',checks:{},appearance:[],perf:process.env.GALLERY_FIXES_EVIDENCE_ONLY?JSON.parse(fs.readFileSync(`${dir}/${phase}.json`,'utf8')).perf:[]},errors=[];
// Baseline serves the exact shipped sources; rerunning this differential gate needs no checkout.
const baselineFiles=before?new Map([['/','web/index.html'],['/my-bag.js','public/my-bag.js'],['/my-bag.css','public/my-bag.css'],['/all-discs-gallery.js','public/all-discs-gallery.js']].map(([url,file])=>[url,{body:execFileSync('git',['show',report.base+':'+file]),contentType:file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':'application/javascript'}])):null;
const installBaseline=async c=>{if(before)await c.route('**/*',route=>{const u=new URL(route.request().url()),file=baselineFiles.get(u.pathname);if(u.origin===base&&file){(report.baselineRoutes??=[]).push(u.pathname);return route.fulfill(file);}return route.fallback();});};
try{
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.env.BAG3D_CHROMIUM_ARGS?.split(' ').filter(Boolean)||['--use-angle=d3d11','--enable-gpu']});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64'),cb=new URL(u.searchParams.get('redirect_uri'));cb.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();await route.fulfill({contentType:'text/html',body:`<a href="${cb.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});});
 await page.goto(base+'/?bag=1');await page.locator('#myBagSignIn').click();const link=page.getByRole('link',{name:'Continue with Google',exact:true});await link.waitFor();const redirect=await page.request.get(base+await link.getAttribute('href'),{maxRedirects:0});await page.goto(redirect.headers().location);await page.getByRole('link',{name:'Continue as Atlas Player'}).click();await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor().catch(async error=>{report.error={message:error.message,errors,dom:await page.evaluate(()=>({url:location.href,mode:!!document.querySelector('#storageModes'),bagApp:!!window.BagApp,status:document.querySelector('#myBagLoadMessage')?.textContent,contents:document.querySelector('#myBagContents')?.innerHTML.slice(0,500)}))};throw error;});
 const api=async(path='',method='GET',body)=>{const r=await page.request.fetch(base+'/api/bag'+path,{method,headers:await page.evaluate(()=>({'Content-Type':'application/json',Origin:location.origin,'X-Atlas-CSRF':AtlasAccount.current.csrfToken})),...(body?{data:body}:{})});assert.ok(r.ok(),await r.text());return r.json();};
 // The auth callback serves its own current HTML shell; replay the baseline only after sign-in.
 await installBaseline(context);
 const owned=[];for(const [mold_id,plastic,in_bag] of [['3d60892b6812','Star',true],['8cc6c4a94762','ESP',false],['7446eb39abe5','ESP',false],['ff4bf9e7743c','Putter Line Hard',false]])owned.push((await api('/discs','POST',{mold_id,plastic,in_bag,wear:8,weight_g:173,color:'#e6c668'})).disc);
 const bytes=await page.evaluate(async bytes=>{const {preparePhoto}=await import('/disc-photo.mjs');const bitmap=await createImageBitmap(new Blob([new Uint8Array(bytes)],{type:'image/webp'}));const {blob}=await preparePhoto(bitmap,{});bitmap.close();return [...new Uint8Array(await blob.arrayBuffer())];},[...fs.readFileSync('tests/fixtures/stamped-disc.webp')]);
 const upload=await page.request.put(base+'/api/bag/discs/'+owned[0].id+'/photo',{headers:await page.evaluate(()=>({'Content-Type':'image/webp',Origin:location.origin,'X-Atlas-CSRF':AtlasAccount.current.csrfToken})),data:Buffer.from(bytes)});assert.ok(upload.ok(),await upload.text());
 const enter=async p=>{await p.goto(base+'/?bag=1');await p.waitForFunction(()=>window.AtlasAccount?.current?.user&&discs.length>0);await p.locator('#myBagLoadState').waitFor({state:'hidden'});if(before){await p.locator('[data-bag-view="storage"]').click();await p.locator('[data-storage-mode="all"]').click();}else await p.locator('[data-bag-view="gallery"]').click();await p.waitForFunction(()=>!!BagApp.scenes.album);};
 const appearanceReady=()=>{const v=BagApp.scenes.album;if(!v)return false;const p=v.state.props,photo=v.debug.photo,stamp=v.debug.stamp.material.map;return !!p&&(!p.photoURL||photo?.userData.photoReady)&&(!p.stampAsset||p.photoURL||stamp?.userData.stampAsset);};
 const shot=async(name,p=page)=>{await p.evaluate(()=>document.fonts.ready);await p.locator('#allDiscsGallery').screenshot({path:`${dir}/${phase}-${name}.png`});};
 // Hold actual asset responses to expose every possible generated-then-real appearance frame.
 let releasePhoto;const photoGate=new Promise(r=>releasePhoto=r);
 await context.route(/\/api\/bag\/discs\/[^/]+\/photo\?/,async route=>{await photoGate;await route.continue();});
 let releaseStamp;const stampGate=new Promise(r=>releaseStamp=r);await context.route('**/stamps/discraft/stalker.png',async route=>{await stampGate;await route.continue();});
 await enter(page);
 report.navigation=await page.locator('#myBagViews [data-bag-view]').allInnerTexts();report.checks.placement=report.navigation.join('|')==='Bag|My Map|Storage|Gallery|Lost';
 await page.locator('#myBagViews').screenshot({path:`${dir}/${phase}-navigation.png`});
 report.initialView=await page.evaluate(()=>BagApp.scenes.album.state.view);report.checks.top=report.initialView==='top';
 const observe=async p=>p.evaluate(()=>{window.galleryAppearanceFrames=[];window.galleryAppearanceStop=false;const frame=()=>{const v=BagApp.scenes.album,h=document.querySelector('[data-album-viewer]');if(v&&h){const p=v.state.props,ready=p?.photoURL?!!v.debug.photo?.userData.photoReady:!p?.stampAsset||!!v.debug.stamp.material.map?.userData.stampAsset;const rect=h.getBoundingClientRect(),style=getComputedStyle(h);galleryAppearanceFrames.push({t:performance.now(),ready,visible:rect.height>0&&style.visibility!=='hidden'&&style.opacity!=='0'&&!h.hidden});}if(!galleryAppearanceStop)requestAnimationFrame(frame);};requestAnimationFrame(frame);});
 await observe(page);await page.waitForTimeout(250);await shot('photo-pending');releasePhoto();await page.waitForFunction(appearanceReady);await page.waitForTimeout(100);await shot('photo-ready');
 report.appearance.push(await page.evaluate(()=>{galleryAppearanceStop=true;return {kind:'photo',frames:galleryAppearanceFrames,wrongFrames:galleryAppearanceFrames.filter(f=>f.visible&&!f.ready).length};}));await context.unroute(/\/api\/bag\/discs\/[^/]+\/photo\?/);
 await observe(page);await page.locator('[data-album-step="1"]').click();await page.waitForTimeout(250);await shot('stamp-pending');releaseStamp();await page.waitForFunction(appearanceReady);await page.waitForTimeout(100);await shot('stamp-ready');
 report.appearance.push(await page.evaluate(()=>{galleryAppearanceStop=true;return {kind:'stock stamp',frames:galleryAppearanceFrames,wrongFrames:galleryAppearanceFrames.filter(f=>f.visible&&!f.ready).length};}));await context.unroute('**/stamps/discraft/stalker.png');
 report.checks.noPopIn=report.appearance.every(r=>r.wrongFrames===0);
 await page.locator('[data-album-filter="all"]').click();await page.waitForFunction(appearanceReady);
 await page.locator('[data-disc3d-view="profile"]').click();await page.waitForTimeout(700);
 report.views=[];for(let i=0;i<3;i++){await page.locator('[data-album-step="1"]').click();await page.waitForFunction(appearanceReady);report.views.push(await page.evaluate(()=>BagApp.scenes.album.state.view));await shot('profile-disc-'+(i+1));}
 report.checks.sticky=report.views.every(v=>v==='profile');
 if(!before){
  await page.locator('[data-bag-view="storage"]').click();await page.locator('#storageScene[data-engine="ready"]').waitFor();assert.equal(await page.locator('[data-storage-mode]').count(),0);assert.ok(await page.locator('#allDiscsGallery').isHidden());await page.locator('#storageScene').screenshot({path:`${dir}/after-storage-rack.png`});
  await page.locator('[data-bag-view="gallery"]').click();await page.waitForFunction(appearanceReady);assert.equal(await page.evaluate(()=>BagApp.scenes.album.state.view),'top');await shot('default-top');
  // Preset choices, filters, keys and swaps all retain the selection, scoped to this gallery session.
  for(const view of ['angle','bottom','top']){await page.locator(`[data-disc3d-view="${view}"]`).click();await page.waitForTimeout(700);await page.locator('[data-album-step="-1"]').click();await page.waitForFunction(appearanceReady);assert.equal(await page.evaluate(()=>BagApp.scenes.album.state.view),view);}
  await page.locator('[data-album-filter="putter"]').click();await page.waitForFunction(appearanceReady);assert.equal(await page.evaluate(()=>BagApp.scenes.album.state.view),'top');
  // An asset error stays neutral; no generated replacement disc leaks into the gallery.
  await context.route('**/stamps/discraft/buzzz.png',route=>route.abort());await page.reload();await page.waitForFunction(()=>window.AtlasAccount?.current?.user&&discs.length>0);await page.locator('#myBagLoadState').waitFor({state:'hidden'});await page.locator('[data-bag-view="gallery"]').click();await page.waitForFunction(appearanceReady);await page.locator('[data-album-step="1"]').click();await page.waitForFunction(appearanceReady);await page.locator('[data-album-step="1"]').click();await page.waitForFunction(()=>document.querySelector('#allDiscsGallery').dataset.appearance==='failed');assert.equal(await page.locator('[data-album-viewer]').evaluate(h=>getComputedStyle(h).visibility),'hidden');await context.unroute('**/stamps/discraft/buzzz.png');
 }
 // The repository defaults: serial 7 desktop / 3 phone warm reps, 4x CPU phone, viewer quality intact.
 const session=await context.storageState();await context.close();
 if(!process.env.GALLERY_FIXES_EVIDENCE_ONLY)for(const device of ['desktop','phone']){
  const c=await browser.newContext({ignoreHTTPSErrors:true,storageState:session,...(device==='desktop'?{viewport:{width:1440,height:900}}:{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true})}),p=await c.newPage();
  await installBaseline(c);
  const cdp=await c.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:device==='phone'?4:1});await enter(p);await p.waitForFunction(appearanceReady);await p.locator('#allDiscsGallery').scrollIntoViewIfNeeded();
  const reps=device==='desktop'?7:3;
  for(let rep=0;rep<=reps;rep++){
   const result=await p.evaluate(async()=>{
    const stats=a=>{const s=[...a].sort((a,b)=>a-b),q=p=>s[Math.min(s.length-1,Math.floor(s.length*p))];return {median:q(.5),p95:q(.95),max:s.at(-1),frames:s.length};};
    const longs=[],o=new PerformanceObserver(l=>{for(const e of l.getEntries())longs.push(e.duration);});o.observe({type:'longtask'});
    const frame=()=>new Promise(r=>requestAnimationFrame(r)),fly=[],still=[],reveal=[];
    for(let i=0;i<241;i++){
     await frame();const start=performance.now();document.querySelector('[data-album-step="1"]').click();BagApp.scenes.album.debug.renderNow();fly.push(performance.now()-start);
     let limit=performance.now()+10000;while(true){const v=BagApp.scenes.album,p=v.state.props,ready=(!p.photoURL||v.debug.photo?.userData.photoReady)&&(!p.stampAsset||p.photoURL||v.debug.stamp.material.map?.userData.stampAsset);if(ready&&document.querySelector('#allDiscsGallery').dataset.appearance!=='loading')break;if(performance.now()>limit)throw Error('Appearance timed out');await frame();}
     reveal.push(performance.now()-start);
    }
    for(let i=0;i<120;i++){await frame();const start=performance.now();BagApp.scenes.album.debug.renderNow();still.push(performance.now()-start);}
    await new Promise(r=>setTimeout(r,100));o.disconnect();
    const v=BagApp.scenes.album;return {fly:stats(fly),still:stats(still),reveal:stats(reveal),longTasks:longs.length,longest:Math.max(0,...longs),calls:v.debug.renderer.info.render.calls,triangles:v.debug.renderer.info.render.triangles,pixelRatio:v.debug.renderer.getPixelRatio(),segments:v.debug.body.geometry.parameters?.radialSegments,canvases:document.querySelectorAll('#allDiscsGallery canvas').length};
   });
   report.perf.push({device,rep,phase:rep?'warm':'cold',...result});console.log(phase,device,rep+'/'+reps,JSON.stringify(result));
  }
  await c.close();
 }
 if(!before&&!process.env.GALLERY_FIXES_EVIDENCE_ONLY){
  const baseline=JSON.parse(fs.readFileSync(`${dir}/before.json`,'utf8'));const median=a=>{const s=[...a].sort((a,b)=>a-b);return s[Math.floor(s.length/2)];};report.gate=[];
  for(const device of ['desktop','phone']){
   const b=baseline.perf.filter(r=>r.device===device&&r.phase==='warm'),a=report.perf.filter(r=>r.device===device&&r.phase==='warm');assert.equal(a.length,device==='desktop'?7:3);assert.equal(b.length,a.length);
   for(const metric of ['fly','still','longTasks']){const read=r=>metric==='longTasks'?r.longTasks:r[metric].p95,mul=metric==='longTasks'?1:1.15,slack=metric==='longTasks'?1:device==='phone'?3:1.5,base=median(b.map(read)),actual=median(a.map(read)),limit=base*mul+slack,paired=median(a.map((r,i)=>read(r)-read(b[i])*mul-slack));report.gate.push({device,metric,baseline:base,actual,limit,pairedExcess:paired,passed:actual<=limit&&paired<=0});}
  }
 }
 report.errors=errors;fs.writeFileSync(`${dir}/${phase}.json`,JSON.stringify(report,null,2)+'\n');
 assert.deepEqual(errors,[]);assert.ok(Object.values(report.checks).every(v=>before?!v:v),JSON.stringify(report.checks));if(report.gate)assert.ok(report.gate.every(r=>r.passed),JSON.stringify(report.gate));
 console.log(before?'Shipped gallery baseline reproduced':process.env.GALLERY_FIXES_EVIDENCE_ONLY?'Gallery functional fixes passed':'Gallery fixes and gallery performance gate passed');
}finally{fs.writeFileSync(`${dir}/${phase}.json`,JSON.stringify(report,null,2)+'\n');await browser?.close();server.kill();}
