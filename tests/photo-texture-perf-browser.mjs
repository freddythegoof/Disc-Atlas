// Real local D1 + the existing signed Google fixture; no live account is touched.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config='tests/auth.wrangler.jsonc',state='work/photo-textures/perf-local',base='https://localhost:8824',dir='outputs/photo-textures';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8824','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='',browser,page;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>output+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
try {
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline || server.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu']});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}}),errors=[];
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const callback=new URL(u.searchParams.get('redirect_uri'));callback.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${callback.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 await page.goto(base+'/?bag=1');await page.locator('#myBagDemo').waitFor();await page.locator('#myBagSignIn').click();
 const link=page.getByRole('link',{name:'Continue with Google',exact:true});await link.waitFor();
 const redirect=await page.request.get(base+await link.getAttribute('href'),{maxRedirects:0});
 await page.goto(redirect.headers().location);await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();
 const open=async(name,destination='bag')=>{
  await page.evaluate(async({name,destination})=>{const d=discs.find(d=>d.name===name);if(!d)throw Error('Missing mold '+name);await BagApp.add(d,null,destination);},{name,destination});
  await page.locator('#addDiscDialog').waitFor();
 };
 // My Bag shows one list at a time (Bag, Storage or Lost).
 const showList=name=>page.locator(`#bagListPicker [data-bag-list="${name}"]`).click();
 const save=async()=>{await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});};


 await open('Envy');await page.locator('.bag-photo-file').setInputFiles('tests/fixtures/stamped-disc.webp');
 await page.locator('.photo-aligner[open]').waitFor();await page.locator('.photo-aligner [data-aligner-confirm]').click();
 await page.locator('.photo-aligner').waitFor({state:'hidden'});await save();
 const data=await (await page.request.get(base+'/api/bag')).json(),disc=data.discs[0];
 await page.locator(`[data-disc-id="${disc.id}"] [data-bag-inspect]`).click();await page.waitForFunction(()=>Disc3D.viewer?.debug.photo?.userData.photoReady);
 await page.evaluate(()=>{window.photoPerfProps={...Disc3D.viewer.state.props};});
 const cdp=await context.newCDPSession(page),results=[];
 for(const config of [{name:'desktop',width:1440,height:1000,cpu:1},{name:'phone viewport, 4x CPU',width:390,height:844,cpu:4}]){
  await page.setViewportSize({width:config.width,height:config.height});await cdp.send('Emulation.setCPUThrottlingRate',{rate:config.cpu});await page.waitForTimeout(300);
  for(const photo of [false,true,false,true,false]){
   await page.evaluate(photo=>{Disc3D.viewer.update({...photoPerfProps,photoURL:photo?photoPerfProps.photoURL:null});Disc3D.viewer.setView('angle',{instant:true});},photo);
   if(photo)await page.waitForFunction(()=>Disc3D.viewer.debug.photo?.userData.photoReady);
   await page.waitForTimeout(200);
   const result=await page.evaluate(()=>{
    const v=Disc3D.viewer,{renderer,scene,camera,tiltGroup}=v.debug,gl=renderer.getContext(),info=gl.getExtension('WEBGL_debug_renderer_info'),samples=[];
    for(let i=0;i<160;i++){tiltGroup.rotation.z=Math.sin(i*.04)*.1;const start=performance.now();renderer.render(scene,camera);gl.finish();if(i>=32)samples.push(performance.now()-start);}
    tiltGroup.rotation.z=0;samples.sort((a,b)=>a-b);
    return {median:samples[64],p95:samples[Math.floor(samples.length*.95)],frames:samples.length,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,buffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],gpu:gl.getParameter(info?info.UNMASKED_RENDERER_WEBGL:gl.RENDERER)};
   });results.push({device:config.name,photo,...result});
  }
 }
 fs.writeFileSync(dir+'/texture-perf.json',JSON.stringify({method:'32 warmup + 128 measured renderer.render + gl.finish frames, alternating plain/photo/plain/photo/plain; same renderer, pose and lights',results},null,2));
 console.table(results.map(({gpu,buffer,...r})=>r));assert.deepEqual(errors,[]);
}finally{await browser?.close();server.kill();}
