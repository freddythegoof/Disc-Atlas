// Real local D1 + the existing signed Google fixture; no live account is touched.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config='tests/auth.wrangler.jsonc',state='work/photo-textures/local',base='https://localhost:8822',dir='outputs/photo-textures';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8822','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
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

 await open('Envy');await save();
 let data=await (await page.request.get(base+'/api/bag')).json(),disc=data.discs[0];
 const inspect=async()=>{await page.locator(`[data-disc-id="${disc.id}"] [data-bag-inspect]`).click();await page.waitForFunction(()=>Disc3D.viewer?.state.props?.mold==='Envy');};
 await inspect();await page.locator('#detail').screenshot({path:dir+'/panel-before.png'});
 await page.locator('#detail [data-disc3d-expand]').click();await page.locator('.disc3d-dialog').screenshot({path:dir+'/popout-before.png'});await page.keyboard.press('Escape');await page.waitForTimeout(400);await page.locator('#closeDetail').click();
 await page.locator(`[data-bag-edit="${disc.id}"]`).click();
 await page.locator('.bag-photo-file').setInputFiles('tests/fixtures/stamped-disc.webp');
 await page.locator('.bag-photo-edit').waitFor();await page.locator('#addDiscDialog').screenshot({path:dir+'/photo-editor.png'});
 let upload;page.on('request',r=>{if(r.method()==='PUT'&&r.url().includes('/photo')){upload=r.postDataBuffer();fs.writeFileSync(dir+'/processed-upload.webp',upload);}});
 await save();assert.ok(upload.length<=512*1024);assert.equal(upload.toString('ascii',0,4),'RIFF');
 data=await (await page.request.get(base+'/api/bag')).json();disc=data.discs[0];assert.ok(disc.texture_key);
 const privatePhoto=await page.request.get(base+'/api/bag/discs/'+disc.id+'/photo');assert.equal(privatePhoto.status(),200);assert.equal(privatePhoto.headers()['cache-control'],'private, no-store');
 const anonymous=await browser.newContext({ignoreHTTPSErrors:true});assert.equal((await anonymous.request.get(base+'/api/bag/discs/'+disc.id+'/photo')).status(),401);await anonymous.close();
 await inspect();await page.waitForFunction(()=>Disc3D.viewer?.debug.photo?.userData.photoReady);
 assert.equal(await page.evaluate(()=>Disc3D.viewer.debug.stamp.visible),false);
 await page.locator('#detail').screenshot({path:dir+'/panel-after.png'});
 await page.locator('#detail [data-disc3d-expand]').click();await page.waitForFunction(()=>Disc3D.popout?.debug.photo?.userData.photoReady);await page.locator('.disc3d-dialog').screenshot({path:dir+'/popout-after.png'});
 await page.evaluate(()=>Disc3D.setClay(true));assert.equal(await page.evaluate(()=>Disc3D.popout.debug.photo.visible),false);
 await page.evaluate(()=>Disc3D.setClay(false));assert.equal(await page.evaluate(()=>Disc3D.popout.debug.photo.visible),true);
 await page.keyboard.press('Escape');await page.waitForTimeout(400);
 const checks=await page.evaluate(async()=>{
  const {photoGeometry}=await import('/disc3d/photo.mjs'),{shapeFrame}=await import('/disc3d/shape.mjs'),{photoCanvas,processPhoto}=await import('/disc-photo.mjs');
  const shape=Disc3D.viewer.state.shape,{R,Ri}=shapeFrame(shape),g=photoGeometry(shape,{overmold:true}),p=g.attributes.position,uv=g.attributes.uv;
  let projection=true,rim=true;for(let i=0;i<p.count;i++){projection&&=Math.abs(uv.getX(i)-(.5+p.getX(i)/(2*R)))<1e-6;rim&&=Math.hypot(p.getX(i),p.getZ(i))<=Ri+.00001;}g.dispose();
  const canvas=document.createElement('canvas');canvas.width=canvas.height=100;const ctx=canvas.getContext('2d');ctx.fillStyle='red';ctx.fillRect(0,0,100,100);const out=photoCanvas(canvas,{},128),c=out.getContext('2d');
  const blob=await processPhoto(canvas),bitmap=await createImageBitmap(blob);const dimensions=[bitmap.width,bitmap.height];bitmap.close();
  ctx.clearRect(0,0,100,100);ctx.fillStyle='rgba(255,0,0,.5)';ctx.fillRect(0,0,100,100);const sourceAlpha=photoCanvas(canvas,{},128).getContext('2d').getImageData(64,64,1,1).data[3];
  return {projection,rim,sourceAlpha,corner:c.getImageData(0,0,1,1).data[3],center:[...c.getImageData(64,64,1,1).data],dimensions};
 });assert.deepEqual(checks,{projection:true,rim:true,sourceAlpha:128,corner:0,center:[255,0,0,255],dimensions:[1024,1024]});


 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);await page.locator('#detail').screenshot({path:dir+'/panel-after-phone.png'});
 await page.locator('#detail [data-disc3d-expand]').click();await page.waitForFunction(()=>Disc3D.popout?.debug.photo?.userData.photoReady);await page.locator('.disc3d-dialog').screenshot({path:dir+'/popout-after-phone.png'});await page.keyboard.press('Escape');await page.waitForTimeout(400);await page.setViewportSize({width:1440,height:1000});
 const cap=await page.evaluate(async()=>{const {processPhoto}=await import('/disc-photo.mjs'),c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d'),d=g.createImageData(1024,1024);let seed=17;for(let i=0;i<d.data.length;i+=4){for(let k=0;k<3;k++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;d.data[i+k]=seed>>>24;}d.data[i+3]=255;}g.putImageData(d,0,0);return (await processPhoto(c)).size;});assert.ok(cap<=512*1024,'high entropy crop obeys the hard upload cap');
 // More than eight unique photos must finish; offscreen thumbnails must not start work.
 let fixtureLoads=0;
 await context.route(/\/api\/bag\/discs\/cache-.*\/photo/,async route=>{fixtureLoads++;await route.fulfill({contentType:'image/webp',body:upload});});
 await page.evaluate(async()=>{
  const {createAtlasArt}=await import('/disc3d/atlas-art.mjs');window.photoTestArt=await createAtlasArt({dpr:1});
  window.photoTestDiscs=Array.from({length:12},(_,i)=>({...discs.find(d=>d.name==='Envy'),id:'test-'+i,photoURL:'/api/bag/discs/cache-'+i+'/photo?v=00000000-0000-0000-0000-'+String(i).padStart(12,'0')+'.webp'}));
  for(const d of photoTestDiscs)photoTestArt.render(d,'#e6c668',80);
 });
 await page.waitForFunction(()=>{for(const d of photoTestDiscs)photoTestArt.render(d,'#e6c668',80);return photoTestDiscs.every(d=>photoTestArt.has(d,'#e6c668',80));});
 assert.equal(fixtureLoads,12);
 // Changing level: a recently drawn photo draws at once from its live texture; an evicted one shows its
 // finished image from another level meanwhile, never the plain placeholder.
 const relevel=await page.evaluate(()=>{
  // Draw every disc at a new level in order, so the least recently drawn are test-0 … test-4.
  for(const d of photoTestDiscs)photoTestArt.render(d,'#e6c668',40);
  const extra={...photoTestDiscs[0],id:'test-extra',photoURL:'/api/bag/discs/cache-extra/photo?v=00000000-0000-0000-0000-999999999999.webp'};
  photoTestArt.render(extra,'#e6c668',80);
  const recent=photoTestArt.render(photoTestDiscs[11],'#e6c668',20);
  photoTestArt.render(photoTestDiscs[0],'#e6c668',20);
  const evicted=photoTestArt.get(photoTestDiscs[0],'#e6c668',20);
  return {recent:!!recent.pending,evicted:!!evicted.pending,evictedLevel:evicted.lod};
 });
 assert.deepEqual(relevel,{recent:false,evicted:false,evictedLevel:'mid'});
 await page.waitForFunction(()=>{photoTestArt.render(photoTestDiscs[0],'#e6c668',20);return photoTestArt.has(photoTestDiscs[0],'#e6c668',20);});
 assert.equal(fixtureLoads,14,'only the new photo and the evicted one are fetched again');
 await page.evaluate(()=>photoTestArt.dispose());
 fixtureLoads=0;
 await page.evaluate(async()=>{
  const root=document.createElement('div');root.id='photoScrollTest';root.style='position:fixed;right:0;top:0;height:90px;width:90px;overflow:auto;z-index:99999';document.body.append(root);
  const d=discs.find(d=>d.name==='Envy');root.innerHTML=Array.from({length:15},(_,i)=>'<div style="height:85px">'+DiscThumbnails.markup(d,'#e6c668',null,'/api/bag/discs/cache-scroll-'+i+'/photo?v=00000000-0000-0000-0000-'+String(i).padStart(12,'0')+'.webp')+'</div>').join('');
  for(const el of root.querySelectorAll('[data-disc-thumbnail]'))el.style='display:block;width:80px;height:80px';
  (await import('/disc3d/thumbnails.mjs')).observeThumbnails(root,id=>discs.find(d=>d.id===id));
 });
 await page.waitForTimeout(1000);assert.ok(fixtureLoads>0&&fixtureLoads<=2,'only intersecting thumbnails load: '+fixtureLoads);await page.evaluate(()=>document.querySelector('#photoScrollTest').remove());
 // Replacing keeps the copy ID; a fresh page receives the new key and photo.
 await page.locator('#closeDetail').click();await page.locator(`[data-bag-edit="${disc.id}"]`).click();await page.locator('.bag-photo-file').setInputFiles('tests/fixtures/stamped-disc.webp');await page.locator('.bag-photo-edit').waitFor();
 await page.locator('[data-photo="scale"]').evaluate(n=>{n.value='.88';n.dispatchEvent(new Event('input',{bubbles:true}));});const oldKey=disc.texture_key;await save();
 data=await (await page.request.get(base+'/api/bag')).json();disc=data.discs.find(d=>d.id===disc.id);assert.notEqual(disc.texture_key,oldKey);assert.equal(data.discs.length,1);
 await page.reload();await page.locator(`[data-bag-edit="${disc.id}"]`).waitFor();await inspect();await page.waitForFunction(()=>Disc3D.viewer?.debug.photo?.userData.photoReady);
 // A late network failure still leaves one saved copy; retry updates it instead of duplicating it.
 await page.locator('#closeDetail').click();await open('Envy');await page.locator('.bag-photo-file').setInputFiles('tests/fixtures/stamped-disc.webp');await page.locator('.bag-photo-edit').waitFor();
 await context.route(/\/api\/bag\/discs\/[^/]+\/photo$/,route=>route.request().method()==='PUT'?route.abort('failed'):route.continue(),{times:1});
 await page.locator('#saveDisc').click();await page.waitForFunction(()=>!document.querySelector('#saveDisc').disabled&&document.querySelector('#addDiscStatus').textContent!=='Saving…');
 await save();data=await (await page.request.get(base+'/api/bag')).json();assert.equal(data.discs.length,2);assert.equal(await page.locator('[data-bag-edit]').count(),2);
 // An untextured copy retains the generic stamp when moving between copies of the same mold.
 await open('Envy');await save();data=await (await page.request.get(base+'/api/bag')).json();const plain=data.discs.find(d=>!d.texture_key);
 await page.locator(`[data-disc-id="${plain.id}"] [data-bag-inspect]`).click();await page.waitForFunction(()=>Disc3D.viewer?.debug.stamp.visible&&!Disc3D.viewer.debug.photo);
 await page.locator('#closeDetail').click();await inspect();await page.waitForFunction(()=>Disc3D.viewer?.debug.photo?.userData.photoReady);
 await page.locator('#closeDetail').click();await page.locator(`[data-bag-edit="${disc.id}"]`).click();await page.locator('.bag-photo-remove').click();await save();await inspect();
 assert.equal(await page.evaluate(()=>Disc3D.viewer.debug.stamp.visible),true);assert.equal(await page.evaluate(()=>Disc3D.viewer.debug.photo),null);
 assert.equal((await page.request.get(base+'/api/bag/discs/'+disc.id+'/photo')).status(),404);
 assert.deepEqual(errors,[]);console.log('PASS: local D1/R2 photo save/remove, circular processing, planar UV, private route, fallback, panel/popout and clay. Compressed upload bytes: '+upload.length);
}catch(error){if(page)await page.screenshot({path:dir+'/failure.png',fullPage:true});throw error;}
finally{await browser?.close();server.kill();}
