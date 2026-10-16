// Round 2 of the photo cleanup on the real app surfaces (docs/photo-edge-cleanup.md, "Round 2"). Freddy's failures
// after PR #10 were textures he had stored before it, so the signature fixtures (tests/photo-cleanup-signatures.mjs)
// are uploaded through the real editor with the aligner as it was then (UPLOAD_BASE's disc-photo.mjs: no snap),
// framed with its own controls. Every surface then draws them with PR #10's photo-clean.mjs (CLEANUP_BASE, "before")
// and with the working copy ("after"), in one run on one GPU: the detail panel's texture (read back from the mesh)
// and its top view, the list thumbnail and My Map. The guards (round 1's clean control, PR #9's stamp, halo and
// Pixel) must draw byte-identical textures and thumbnails before and after.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/photo-cleanup-round2-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {makeSignatures} from './photo-cleanup-signatures.mjs';
import {makeFixtures} from './photo-cleanup-fixtures.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const config='tests/auth.wrangler.jsonc',state='outputs/photo-edge-cleanup/round2-local',base='https://localhost:8844',dir='outputs/photo-edge-cleanup/round2-app';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js',UPLOAD=process.env.UPLOAD_BASE||'38a8c4a',CLEAN=process.env.CLEANUP_BASE||'549150a';
fs.mkdirSync(dir,{recursive:true});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8844','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='',browser;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>output+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const old=(sha,file)=>execFileSync('git',['show',sha+':public/'+file],{encoding:'utf8'});
const uploadAligner=old(UPLOAD,'disc-photo.mjs'),beforeClean=old(CLEAN,'disc3d/photo-clean.mjs');
const metrics={};
try{
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.env.BAG3D_CHROMIUM_ARGS?.split(' ')||['--use-angle=d3d11','--enable-gpu']});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000},deviceScaleFactor:2}),errors=[];
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 await context.addInitScript(()=>{window.__hash=data=>{let h=0x811c9dc5;for(let i=0;i<data.length;i++)h=Math.imul(h^data[i],16777619)>>>0;return h.toString(16);};});
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const callback=new URL(u.searchParams.get('redirect_uri'));callback.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${callback.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 // Context routes reach the cleanup worker's own module requests too.
 const serveOld=(pattern,body)=>context.route(pattern,route=>route.fulfill({status:200,contentType:'text/javascript',body}));
 await page.goto(base+'/?bag=1');await page.locator('#myBagDemo').waitFor();await page.locator('#myBagSignIn').click();
 const link=page.getByRole('link',{name:'Continue with Google',exact:true});await link.waitFor();
 const redirect=await page.request.get(base+await link.getAttribute('href'),{maxRedirects:0});
 await page.goto(redirect.headers().location);await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();
 const S=await page.evaluate(makeSignatures),T=await page.evaluate(makeFixtures);
 const pr9=k=>fs.readFileSync(`docs/assets/non-overmold-photo-edge/fixture-${k}.png`);
 const SIGS=['wraith','halo','pink','orange','destroyer'],GUARDS=['clean','stamp','halo9','pixel'];
 const CASES={...Object.fromEntries(SIGS.map(k=>[k,{mold:S[k].mold,photo:S[k].photo,framing:S[k].options,name:'photo.jpg',type:'image/jpeg'}])),
  clean:{mold:T.clean.mold,photo:T.clean.photo,framing:T.exact},stamp:{mold:'e70f48273d7f',photo:pr9('stamp')},halo9:{mold:'ba675aed468a',photo:pr9('halo')},pixel:{mold:'e125b84243c2',photo:pr9('pixel')}};
 const names=Object.keys(CASES);
 const frame=async o=>{
  if(!o)return;
  await page.evaluate(scale=>{const el=document.querySelector('.photo-aligner [data-photo="scale"]');el.value=scale;el.dispatchEvent(new Event('input',{bubbles:true}));},o.scale);
  await page.locator('.photo-aligner-view').focus();
  const press=async(key,n)=>{for(let i=0;i<n;i++)await page.keyboard.press(key);};
  await press(o.cx>.5?'ArrowLeft':'ArrowRight',Math.round(Math.abs(o.cx-.5)/.01));await press(o.cy>.5?'ArrowUp':'ArrowDown',Math.round(Math.abs(o.cy-.5)/.01));
 };
 const add=async({mold,photo,framing,name='photo.png',type='image/png'})=>{
  await page.evaluate(mold=>{const d=discs.find(d=>d.id===mold);if(!d)throw Error('Missing mold '+mold);return BagApp.add(d,null,'bag');},mold);
  await page.locator('#addDiscDialog').waitFor();
  await page.locator('.bag-photo-file').setInputFiles({name,mimeType:type,buffer:Buffer.from(photo)});await page.locator('.photo-aligner[open]').waitFor();
  await frame(framing);await page.locator('.photo-aligner [data-aligner-confirm]').click();await page.locator('.photo-aligner').waitFor({state:'hidden'});await page.locator('.bag-photo-thumb img').waitFor();
  await page.locator('#saveDisc').click();
  await page.locator('#addDiscDialog').waitFor({state:'hidden'}).catch(async e=>{await page.screenshot({path:`${dir}/failure-add.png`});throw Error(e.message+' | Dialog: '+await page.locator('#addDiscDialog').innerText());});
 };
 // 1. The textures, made the way Freddy's were.
 await serveOld('**/disc-photo.mjs',uploadAligner);await page.goto(base+'/?bag=1');await page.locator('#myBagEmpty').waitFor();
 for(const k of names)await add(CASES[k]);
 await context.unroute('**/disc-photo.mjs');
 const data=await (await page.request.get(base+'/api/bag')).json();assert.equal(data.discs.length,names.length);
 const ids={},urls={};data.discs.forEach((d,i)=>{ids[names[i]]=d.id;urls[names[i]]=`/api/bag/discs/${encodeURIComponent(d.id)}/photo?v=${encodeURIComponent(d.texture_key)}`;});
 for(const k of names)fs.writeFileSync(`${dir}/stored-${k}.webp`,await (await page.request.get(base+urls[k])).body());
 const png=(file,b64)=>fs.writeFileSync(`${dir}/${file}.png`,Buffer.from(b64,'base64'));
 const readTexture=()=>page.evaluate(async()=>{
  const image=Disc3D.viewer.debug.photo.material.map.image,n=image.width,c=new OffscreenCanvas(n,n),g=c.getContext('2d');
  g.translate(0,n);g.scale(1,-1);g.drawImage(image,0,0);const data=g.getImageData(0,0,n,n).data;
  // Opacity on the outer annulus: where the plate shows through (the stop), the photo's alpha is gone.
  let rim=0,count=0;for(let j=0;j<n;j++)for(let i=0;i<n;i++){const r=Math.hypot(i+.5-n/2,j+.5-n/2)/(n/2);if(r<.965||r>=.985)continue;rim+=data[4*(j*n+i)+3];count++;}
  const blob=await c.convertToBlob({type:'image/png'}),b64=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(blob);});
  return {n,hash:window.__hash(data),rimAlpha:+(rim/count).toFixed(1),b64};
 });
 const canvasShot=handle=>handle.evaluate(canvas=>{const n=canvas.width,d=canvas.getContext('2d').getImageData(0,0,n,n).data;return {n,hash:window.__hash(d),b64:canvas.toDataURL('image/png').split(',')[1]};});
 const finished=url=>page.waitForFunction(async url=>{const art=await (await import('/disc3d/atlas-art.mjs')).getAtlasArt();return [...art.debug.images.keys()].some(k=>k.endsWith('|'+url));},url,{timeout:30000});
 const surfaces=async label=>{
  const out={};
  await page.goto(base+'/?bag=1');await page.locator(`[data-bag-edit="${ids.wraith}"]`).waitFor();
  // Which cleanup made these plans: round 2's reports carry a confidence.
  out.module=await page.evaluate(async()=>{const {photoCleanup}=await import('/disc3d/photo.mjs');return photoCleanup;}).then(()=>label);
  for(const k of names){
   await page.locator(`[data-disc-id="${ids[k]}"] [data-bag-inspect]`).click();
   await page.waitForFunction(()=>Disc3D.viewer?.debug.photo?.userData.photoReady,null,{timeout:30000});await page.waitForTimeout(300);
   const t=await readTexture();png(`${label}-${k}-texture`,t.b64);delete t.b64;
   const clip=await page.evaluate(()=>{
    const v=Disc3D.viewer;v.setView('top',{instant:true});v.debug.renderNow();
    const cam=v.debug.camera,body=v.debug.body,V=cam.position.constructor,rect=v.debug.renderer.domElement.getBoundingClientRect();
    body.updateWorldMatrix(true,false);cam.updateMatrixWorld();let l=1e9,r=-1e9,t=1e9,b=-1e9;
    for(let i=0;i<64;i++){const a=i/64*Math.PI*2,p=new V(Math.cos(a)*v.state.radius,0,Math.sin(a)*v.state.radius).applyMatrix4(body.matrixWorld).project(cam),x=(p.x+1)/2*rect.width,y=(1-p.y)/2*rect.height;l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
    return {x:rect.left+l-6,y:rect.top+t-6,width:r-l+12,height:b-t+12};
   });
   await page.waitForTimeout(150);await page.screenshot({clip,path:`${dir}/${label}-${k}-panel-top.png`});
   await page.evaluate(()=>Disc3D.viewer.setView('angle',{instant:true}));await page.waitForTimeout(150);
   await page.screenshot({clip,path:`${dir}/${label}-${k}-panel-angle.png`});
   out[k]={texture:t};
   await page.locator('#closeDetail').click();
  }
  for(const k of names){
   const host=page.locator(`[data-disc-id="${ids[k]}"] [data-disc-thumbnail]`).first();await host.scrollIntoViewIfNeeded();
   await finished(await host.getAttribute('data-photo-url'));
   await page.waitForFunction(h=>h.classList.contains('has-3d')&&h.querySelector('canvas'),await host.elementHandle());await page.waitForTimeout(400);
   const t=await canvasShot(await host.locator('canvas').elementHandle());png(`${label}-${k}-thumb`,t.b64);delete t.b64;out[k].thumb=t;
  }
  await page.getByRole('radio',{name:'My Map'}).click();
  await page.waitForFunction(()=>myMap&&document.querySelector('#mapWrap').closest('#myMapHost')&&!cameraTween&&groupCache?.items===filtered);
  for(const k of names){
   const mold=CASES[k].mold,url=urls[k];
   const ok=await page.waitForFunction(async ({mold,url})=>{const art=await (await import('/disc3d/atlas-art.mjs')).getAtlasArt(),canvas=document.querySelector(`#mapMarkers .atlas-marker[data-cluster="${mold}"] canvas.disc-art-3d`);return !!canvas&&[...art.debug.images].some(([key,e])=>e.canvas===canvas&&key.endsWith('|'+url));},{mold,url},{timeout:15000}).then(()=>true,()=>false);
   // One marker per mold: a second photo of the same mold (the two Wraiths) draws no art of its own.
   if(!ok){out[k].map=null;continue;}
   const t=await canvasShot(await page.locator(`#mapMarkers .atlas-marker[data-cluster="${mold}"] canvas.disc-art-3d`).elementHandle());png(`${label}-${k}-mymap`,t.b64);delete t.b64;out[k].map=t;
  }
  // The plans the app made (in its worker), as reported.
  out.plans=await page.evaluate(async urls=>{const {photoCleanup}=await import('/disc3d/photo.mjs');const o={};for(const [k,u] of Object.entries(urls)){const p=await photoCleanup.plans.get(u);o[k]=p&&{changed:p.changed,report:p.report};}return o;},urls);
  return out;
 };
 await serveOld('**/disc3d/photo-clean.mjs',beforeClean);
 metrics.before=await surfaces('before');
 await context.unroute('**/disc3d/photo-clean.mjs');
 metrics.after=await surfaces('after');
 // 2. The app draws exactly the plan's pixels, and what they show, against ground truth.
 metrics.check=await page.evaluate(async({urls,sigs,S})=>{
  const {planPhoto,cleanPhoto,provenance}=await import('/disc3d/photo-clean.mjs'),{photoPoint}=await import('/disc-photo.mjs'),out={};
  const read=image=>{const n=image.width,c=new OffscreenCanvas(n,n),g=c.getContext('2d');g.translate(0,n);g.scale(1,-1);g.drawImage(image,0,0);return g.getImageData(0,0,n,n).data;};
  for(const [k,u] of Object.entries(urls)){
   const blob=await (await fetch(u,{credentials:'same-origin'})).blob(),plan=await planPhoto(blob),row={changed:plan.changed,planMs:+plan.ms.toFixed(1)};
   if(plan.changed){const t=performance.now(),img=await cleanPhoto(blob,1024,plan);row.cleanMs=+(performance.now()-t).toFixed(1);row.hash=window.__hash(read(img));}
   if(sigs.includes(k)){
    const f=S[k],o={scale:.94,aspect:1,perspective:0,angle:0,cx:.5,cy:.5,...f.options,width:S.W,height:S.H};
    const m=await createImageBitmap(new Blob([new Uint8Array(f.mask)])),c=new OffscreenCanvas(S.W,S.H),g=c.getContext('2d');g.drawImage(m,0,0);const finger=g.getImageData(0,0,S.W,S.H).data;
    const foreignAt=(x,y)=>{const p=photoPoint(x,y,o);if(Math.hypot(p.x-S.disc.x,p.y-S.disc.y)>S.disc.r)return true;const X=Math.round(p.x),Y=Math.round(p.y);return f.hasFingers&&X>=0&&Y>=0&&X<S.W&&Y<S.H&&finger[4*(Y*S.W+X)]>127;};
    let all=0,bad=0;for(let j=0;j<512;j+=2)for(let i=0;i<512;i+=2){const x=(i+.5)/256-1,y=(j+.5)/256-1,r=Math.hypot(x,y);if(r<.8||r>=.995)continue;all++;let w=0;if(plan.changed)provenance(plan,x,y,1-3/1024,(a,b,q)=>{if(foreignAt(a,b))w+=q;});else w=foreignAt(x,y)?1:0;bad+=w>=.5;}
    row.annulusForeign=+(100*bad/all).toFixed(2);
   }
   out[k]=row;
  }
  return out;
 },{urls,sigs:SIGS,S});
 fs.writeFileSync(`${dir}/metrics.json`,JSON.stringify(metrics,null,1));
 const {before,after,check}=metrics;
 for(const k of names)console.log(`${k.padEnd(9)} texture ${before[k].texture.hash}→${after[k].texture.hash} rim alpha ${before[k].texture.rimAlpha}→${after[k].texture.rimAlpha}; thumb ${before[k].thumb.hash}→${after[k].thumb.hash}; plan ${JSON.stringify(after.plans[k]?.report?.register||null)} stop ${after.plans[k]?.report?.stop??null}; annulus foreign ${check[k].annulusForeign??'-'}%; plan ${check[k].planMs} ms clean ${check[k].cleanMs??'-'} ms`);
 // The before half really ran PR #10's cleanup (its reports carry no confidence), the after half round 2's.
 assert.ok(SIGS.every(k=>!before.plans[k]?.report?.edge||before.plans[k].report.edge.confidence===undefined),'before: PR #10 plans');
 assert.ok(after.plans.wraith.report.ray,'after: round 2 plans');
 for(const k of GUARDS){
  assert.equal(after[k].texture.hash,before[k].texture.hash,`${k}: texture byte-identical`);assert.equal(after[k].thumb.hash,before[k].thumb.hash,`${k}: thumbnail byte-identical`);
  assert.equal(check[k].changed,false,`${k}: the plan leaves it alone`);
 }
 for(const k of SIGS){
  assert.notEqual(after[k].texture.hash,before[k].texture.hash,`${k}: drawn differently`);
  assert.equal(after[k].texture.hash,check[k].hash,`${k}: the panel draws the plan's pixels`);
 }
 // At most a hairline: the Halo's thumb leaves a thread where it crossed the crop's cut, the Wraith part of a
 // fingertip in a colour its own face shows (docs: bounded).
 for(const k of SIGS)assert.ok(check[k].annulusForeign<=1,`${k}: no foreign matter on the annulus beyond a hairline (${check[k].annulusForeign}%)`);
 // The pale pink's edge is likely but not sure: the photo stops and the plate shows on its outer rim.
 assert.ok(after.plans.pink.report.stop&&before.pink.texture.rimAlpha>=250&&after.pink.texture.rimAlpha<=5,`pale pink: the plate shows past the stop (rim alpha ${before.pink.texture.rimAlpha} → ${after.pink.texture.rimAlpha})`);
 assert.deepEqual(errors,[]);
 console.log(`ok - round 2 on the app surfaces: ${SIGS.join(', ')} cleaned (annulus foreign ${SIGS.map(k=>check[k].annulusForeign+'%').join(', ')}); ${GUARDS.join('/')} byte-identical; pale pink stops at ${after.plans.pink.report.stop}`);
}finally{await browser?.close();server.kill();}
