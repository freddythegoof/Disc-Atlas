// Real local D1 + the existing signed Google fixture; no live account is touched.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const config='tests/auth.wrangler.jsonc',state='work/photo-rim-color/local',base='https://localhost:8823',dir='outputs/photo-rim-color';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8823','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
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
 const api=async(path,method='GET',body)=>page.evaluate(async({path,method,body})=>{
  const r=await fetch('/api/bag'+path,{method,headers:{'Content-Type':'application/json','X-Atlas-CSRF':AtlasAccount.current.csrfToken},...(body?{body:JSON.stringify(body)}:{})});
  if(!r.ok)throw Error(await r.text());return r.json();
 },{path,method,body});
 const pixel=await page.evaluate(()=>discs.find(d=>d.name==='Pixel'));
 const create=async(d=pixel)=> (await api('/discs','POST',{mold_id:d.id,plastic:d.brand==='Axiom'?'Neutron':'Other',weight_g:175,wear:10,color:'#b45a28',pocket:'main',in_bag:true})).disc;
 // The real cropped input: a known orange plate, a known rim, and a white glare sector.
 const photo=async(rim)=>Buffer.from(await page.evaluate(async({rim,pixel})=>{
  const {shapeForDisc,shapeFrame}=await import('/disc3d/shape.mjs');
  const {shape}=shapeForDisc({model:pixel.model3d,specs:pixel.specs,flight:{speed:pixel.speed,turn:pixel.turn,fade:pixel.fade}}),{R,Ri}=shapeFrame(shape);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const g=canvas.getContext('2d'),outer=256*.94,inner=outer*Ri/R;
  g.fillStyle=rim;g.beginPath();g.arc(256,256,outer,0,Math.PI*2);g.fill();
  g.fillStyle='#b45a28';g.beginPath();g.arc(256,256,inner,0,Math.PI*2);g.fill();
  g.fillStyle='white';g.beginPath();g.arc(256,256,outer,-1.1,-.8);g.arc(256,256,inner,-.8,-1.1,true);g.closePath();g.fill();
  const blob=await new Promise(r=>canvas.toBlob(r,'image/png'));return [...new Uint8Array(await blob.arrayBuffer())];
 },{rim,pixel}));
 const dark=await photo('#101418'),light=await photo('#e4e8ec');
 fs.writeFileSync(dir+'/synthetic-pixel-dark.png',dark);fs.writeFileSync(dir+'/synthetic-pixel-light.png',light);
 let disc=await create();
 // A legacy photo with no sample recreates the old theme-based appearance honestly.
 await page.evaluate(async({id,bytes})=>{
  const {preparePhoto}=await import('/disc-photo.mjs'),image=await createImageBitmap(new Blob([new Uint8Array(bytes)]));
  const {blob}=await preparePhoto(image);image.close();
  const r=await fetch('/api/bag/discs/'+id+'/photo',{method:'PUT',headers:{'Content-Type':'image/webp','X-Atlas-CSRF':AtlasAccount.current.csrfToken},body:blob});if(!r.ok)throw Error(await r.text());
 },{id:disc.id,bytes:[...dark]});
 const refresh=async()=>{await page.reload();await page.locator(`[data-bag-edit="${disc.id}"]`).waitFor();};
 const inspect=async()=>{await page.locator(`[data-disc-id="${disc.id}"] [data-bag-inspect]`).click();await page.waitForFunction(()=>Disc3D.viewer?.debug.photo?.userData.photoReady);};
 const setTheme=async(theme)=>page.evaluate(theme=>{document.documentElement.dataset.theme=theme;window.dispatchEvent(new CustomEvent('atlas-theme-change',{detail:theme}));},theme);
 const rendered=()=>page.evaluate(()=> '#'+Disc3D.viewer.debug.rimMaterial.color.getHexString());
 const close=async()=>{await page.locator('#closeDetail').click();};
 const apply=async(bytes)=>{
  await page.locator(`[data-bag-edit="${disc.id}"]`).click();
  await page.locator('.bag-photo-file').setInputFiles({name:'synthetic-pixel.png',mimeType:'image/png',buffer:bytes});
  await page.locator('.photo-aligner[open]').waitFor();await page.locator('[data-aligner-confirm]').click();
  await page.locator('.photo-aligner').waitFor({state:'hidden'});await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
  return (await api('/discs/'+disc.id)).disc;
 };
 await refresh();await page.setViewportSize({width:390,height:844});
 for(const theme of ['midnight','light']){
  await setTheme(theme);await inspect();
  assert.equal(await rendered(),theme==='light'?'#0a0a0a':'#ffffff','legacy photo retains the existing fallback');
  await page.locator('#detail').screenshot({path:dir+'/'+theme+'-before.png'});await close();
 }
 disc=await apply(dark);assert.equal(disc.rim_color,null);
 const darkSample=disc.photo_rim_color;
 const near=(actual,expected,tolerance=8)=>{for(let c=0;c<3;c++)assert.ok(Math.abs(parseInt(actual.slice(1+2*c,3+2*c),16)-parseInt(expected.slice(1+2*c,3+2*c),16))<=tolerance,actual+' versus '+expected);};
 near(disc.photo_rim_color,'#101418');
 await refresh();
 for(const theme of ['midnight','light']){
  await setTheme(theme);await inspect();near(await rendered(),'#101418');
  await page.locator('#detail').screenshot({path:dir+'/'+theme+'-after.png'});
  await page.locator('#detail [data-disc3d-expand]').click();await page.waitForFunction(()=>Disc3D.popout?.debug.photo?.userData.photoReady);
  near(await page.evaluate(()=> '#'+Disc3D.popout.debug.rimMaterial.color.getHexString()),'#101418');
  await page.locator('.disc3d-dialog').screenshot({path:dir+'/'+theme+'-popout-after.png'});
  const clay=await page.evaluate(()=>{
   Disc3D.setClay(true);const on=[Disc3D.viewer,Disc3D.popout].every(v=>v.debug.body.material[1]===v.debug.clayRimMaterial&&!v.debug.photo.visible);
   Disc3D.setClay(false);return {on,off:[Disc3D.viewer,Disc3D.popout].every(v=>v.debug.body.material[1]===v.debug.rimMaterial&&v.debug.photo.visible)};
  });assert.deepEqual(clay,{on:true,off:true});
  await page.keyboard.press('Escape');await page.locator('.disc3d-dialog').waitFor({state:'hidden'});await close();
 }
 // Bag materials, thumbnail inputs, map colors and collection meshes use the same saved sample.
 await page.setViewportSize({width:1440,height:1000});
 await page.waitForFunction(()=>document.querySelector('[data-bag-canvas]')?.bagViewer?.getBagLayoutState().some(d=>d.rimColor?.startsWith('#')));
 const bagRim=await page.locator('[data-bag-canvas]').evaluate((n,id)=>n.bagViewer.getBagLayoutState().find(d=>d.id===id).rimColor,disc.id);near(bagRim,'#101418');
 const thumb=await page.locator(`[data-disc-id="${disc.id}"] [data-disc-thumbnail]`).getAttribute('data-rim-color');near(thumb,'#101418');
 near(await page.evaluate(id=>BagApp.mapRimColors().get(id),pixel.id),'#101418');
 const meshColors=await page.evaluate(async({pixel,disc})=>{
  const {discModel}=await import('/collection3d/stage.mjs'),{bagRimColor}=await import('/disc3d/overmold.mjs');
  const group=discModel(pixel,{color:disc.color,rimColor:bagRimColor(disc),stamp:false});
  const rim='#'+group.children[1].material.color.getHexString();
  for(const child of group.children)child.material.dispose();return rim;
 },{pixel,disc});near(meshColors,'#101418');
 // Real rendered atlas pixels in the outer ring agree with a manually colored reference.
 const pixels=await page.evaluate(async({pixel,disc})=>{
  const {createAtlasArt}=await import('/disc3d/atlas-art.mjs'),{bagRimColor}=await import('/disc3d/overmold.mjs');const art=await createAtlasArt({dpr:2});
  const a=art.render(pixel,disc.color,94,bagRimColor(disc)),b=art.render(pixel,disc.color,94,'#101418');
  const read=e=>[...e.canvas.getContext('2d').getImageData(e.px-5,e.px/2|0,1,1).data];
  const result=[read(a),read(b)];art.dispose();return result;
 },{pixel,disc});assert.ok(pixels[0][3]>0,'comparison samples the visible rim');for(let c=0;c<3;c++)assert.ok(Math.abs(pixels[0][c]-pixels[1][c])<=8);
 disc=await apply(light);near(disc.photo_rim_color,'#e4e8ec');const lightSample=disc.photo_rim_color;await refresh();
 for(const theme of ['midnight','light']){
  await setTheme(theme);await inspect();near(await rendered(),'#e4e8ec');
  await page.locator('#detail').screenshot({path:dir+'/'+theme+'-light-rim-after.png'});await close();
 }
 // Explicit choices survive photo replacement, fresh reload and removal.
 disc=(await api('/discs/'+disc.id,'PUT',{...disc,rim_color:'#663399'})).disc;
 await refresh();disc=await apply(dark);await refresh();await inspect();assert.equal(await rendered(),'#663399');await close();
 await page.locator(`[data-bag-edit="${disc.id}"]`).click();await page.locator('.bag-photo-remove').click();await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 disc=(await api('/discs/'+disc.id)).disc;assert.equal(disc.texture_key,null);assert.equal(disc.photo_rim_color,null);assert.equal(disc.rim_color,'#663399');
 // Clearing the deliberate override restores the same theme fallback in both themes.
 disc=(await api('/discs/'+disc.id,'PUT',{...disc,rim_color:null})).disc;await refresh();
 for(const theme of ['midnight','light']){
  await setTheme(theme);await page.locator(`[data-disc-id="${disc.id}"] [data-bag-inspect]`).click();
  await page.waitForFunction(()=>Disc3D.viewer?.state.props?.mold==='Pixel'&&!Disc3D.viewer.debug.photo);
  assert.equal(await rendered(),theme==='light'?'#0a0a0a':'#ffffff');
  await page.locator('#detail').screenshot({path:dir+'/'+theme+'-photo-removed.png'});await close();
 }
 // A stamped Pixel with an existing stored black rim: exercise the viewer's own saved-input
 // contract too, without pre-resolving colors at its caller. No re-apply between panel/popout opens.
 const stamped=Buffer.from(await page.evaluate(async bytes=>{
  const image=await createImageBitmap(new Blob([new Uint8Array(bytes)]));
  const c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d');
  g.fillStyle='#101418';g.beginPath();g.arc(512,512,481,0,Math.PI*2);g.fill();
  g.save();g.beginPath();g.arc(512,512,410,0,Math.PI*2);g.clip();g.drawImage(image,31,31,962,962);g.restore();image.close();
  return [...new Uint8Array(await (await new Promise(r=>c.toBlob(r,'image/png'))).arrayBuffer())];
 },[...fs.readFileSync('tests/fixtures/stamped-disc.webp')]));
 disc=await apply(stamped);await refresh();near(disc.photo_rim_color,'#101418');
 for(const theme of ['midnight','light']){
  await setTheme(theme);await inspect();
  near(await rendered(),'#101418'); // The normal bag detail path already worked on the base merge.
  if(theme==='midnight')await page.locator('#detail').screenshot({path:dir+'/viewer-bag-integration.png'});
  const rawSync=async()=>page.evaluate(({disc,pixel})=>Disc3D.sync(document.querySelector('#detail'),pixel,{
   color:disc.color,colors:{plate:disc.color,rim:disc.rim_color},photoURL:'/api/bag/discs/'+disc.id+'/photo?v='+disc.texture_key,
   texture_key:disc.texture_key,photo_rim_color:disc.photo_rim_color,
  }),{disc,pixel});
  await rawSync();await page.waitForTimeout(300);
  if(theme==='midnight')await page.locator('#detail').screenshot({path:dir+'/viewer-saved-input.png'});
  near(await rendered(),'#101418');
  await page.locator('#detail [data-disc3d-expand]').click();await page.waitForFunction(()=>Disc3D.popout?.debug.photo?.userData.photoReady);
  near(await page.evaluate(()=> '#'+Disc3D.popout.debug.rimMaterial.color.getHexString()),'#101418');
  assert.ok(await page.evaluate(()=>[Disc3D.viewer,Disc3D.popout].every(v=>v.state.props.photo_rim_color&&v.state.props.texture_key)),'both viewers carry the stored sample');
  const clay=await page.evaluate(()=>{Disc3D.setClay(true);return [Disc3D.viewer,Disc3D.popout].every(v=>v.debug.body.material[1]===v.debug.clayRimMaterial&&!v.debug.photo.visible);});assert.ok(clay);
  await page.evaluate(()=>Disc3D.setClay(false));
  await page.keyboard.press('Escape');await page.locator('.disc3d-dialog').waitFor({state:'hidden'});
  disc=(await api('/discs/'+disc.id,'PUT',{...disc,rim_color:'#663399'})).disc;
  await rawSync();await page.waitForTimeout(200);assert.equal(await rendered(),'#663399');
  await page.locator('#detail [data-disc3d-expand]').click();await page.waitForFunction(()=>Disc3D.popout?.debug.photo?.userData.photoReady);
  assert.equal(await page.evaluate(()=> '#'+Disc3D.popout.debug.rimMaterial.color.getHexString()),'#663399');
  await page.keyboard.press('Escape');await page.locator('.disc3d-dialog').waitFor({state:'hidden'});await close();
  disc=(await api('/discs/'+disc.id,'PUT',{...disc,rim_color:null})).disc;await refresh();
 }
 await page.locator(`[data-bag-edit="${disc.id}"]`).click();await page.locator('.bag-photo-remove').click();await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 disc=(await api('/discs/'+disc.id)).disc;await refresh();
 for(const theme of ['midnight','light']){
  await setTheme(theme);await page.locator(`[data-disc-id="${disc.id}"] [data-bag-inspect]`).click();
  await page.waitForFunction(()=>Disc3D.viewer?.state.props?.mold==='Pixel'&&!Disc3D.viewer.debug.photo);
  const fallback=theme==='light'?'#0a0a0a':'#ffffff';assert.equal(await rendered(),fallback);
  await page.locator('#detail [data-disc3d-expand]').click();await page.waitForFunction(()=>Disc3D.popout?.state.props?.mold==='Pixel');
  assert.equal(await page.evaluate(()=> '#'+Disc3D.popout.debug.rimMaterial.color.getHexString()),fallback);
  await page.evaluate(()=>Disc3D.setClay(true));assert.ok(await page.evaluate(()=>[Disc3D.viewer,Disc3D.popout].every(v=>v.debug.body.material[1]===v.debug.clayRimMaterial)));
  await page.evaluate(()=>Disc3D.setClay(false));await page.keyboard.press('Escape');await page.locator('.disc3d-dialog').waitFor({state:'hidden'});await close();
 }
 const pilot=await page.evaluate(()=>discs.find(d=>d.name==='Pilot'));
 disc=await create(pilot);await refresh();disc=await apply(dark);assert.equal(disc.photo_rim_color,null,'non-overmold photo is not rim-matched');
 await refresh();await inspect();
 const single=await page.evaluate(()=>{
  const v=Disc3D.viewer;
  return {overmold:v.state.overmold,multi:Array.isArray(v.debug.body.material),plate:'#'+v.debug.bodyMaterial.color.getHexString()};
 });assert.deepEqual(single,{overmold:false,multi:false,plate:disc.color});
 fs.writeFileSync(dir+'/measurements.json',JSON.stringify({darkSample,lightSample,toleranceSRGB:8,glare:true,errors},null,2));
 assert.deepEqual(errors,[]);console.log('PASS: photo rim dark/light ±8 sRGB, real D1 reload/replace/remove, explicit choice, panel/popout/clay, bag/collection/thumbnail/map, non-overmold.');
}catch(error){if(page)await page.screenshot({path:dir+'/failure.png',fullPage:true});throw error;}
finally{await browser?.close();server.kill();}
