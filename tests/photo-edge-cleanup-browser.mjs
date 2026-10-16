// Only the disc survives (docs/photo-edge-cleanup.md). Imperfect photos are the common case: a crop a little off
// the disc bakes a crescent of table into the stored texture, fingers holding the rim bake in on its outer
// annulus. PR #9 runs one-piece photos to the nose, which put that annulus on view. The stored textures are
// healed for display (photo-clean.mjs, in photo.mjs's loader), without re-upload; new uploads snap the aligner
// to the disc's own edge.
//
// 1. Existing textures, made the way Freddy's were: the fixtures (tests/photo-cleanup-fixtures.mjs) and PR #9's
//    stamp, halo and Pixel, uploaded through the real editor with main's own disc-photo.mjs (CLEANUP_BASE) served
//    in place of the working copy, framed with the aligner's own controls.
// 2. Every surface draws them first with main's photo.mjs (before) and then with the working copy (after), in one
//    run on one GPU: the detail panel's texture (read back from the mesh), the list thumbnail, My Map, My Bag's
//    pulled disc and Storage's.
// 3. Purity: the plan and the cleaned pixels are the same on every call, on the main thread and in the worker.
// 4. A fresh imperfect photo through the new aligner: it snaps, says so, undoes and re-snaps.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {makeFixtures} from './photo-cleanup-fixtures.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const config='tests/auth.wrangler.jsonc',state='work/photo-edge-cleanup/local',base='https://localhost:8843',dir='outputs/photo-edge-cleanup';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js',BASE=process.env.CLEANUP_BASE||'38a8c4a';
fs.mkdirSync(dir,{recursive:true});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8843','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='',browser;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>output+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const old=file=>execFileSync('git',['show',BASE+':public/'+file],{encoding:'utf8'});
const oldDiscPhoto=old('disc-photo.mjs'),oldPhoto=old('disc3d/photo.mjs');
const metrics={};
try{
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.env.BAG3D_CHROMIUM_ARGS?.split(' ')||['--use-angle=d3d11','--enable-gpu']});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000},deviceScaleFactor:2}),errors=[];
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 // Rings of an RGBA disc image (unflipped, its disc spanning `fill` of the width around the centre): the share
 // of each ring that is table or skin (the fixtures' only warm hues: hue 10–50°, saturated, not dark).
 await context.addInitScript(()=>{
  window.__foreign=(data,n,fill=1)=>{
   const out={},edges=[.8,.85,.88,.91,.94,.97,.995];
   for(let e=0;e<edges.length-1;e++){
    let total=0,foreign=0;const lo=edges[e]*fill*n/2,hi=edges[e+1]*fill*n/2;
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){
     const r=Math.hypot(i+.5-n/2,j+.5-n/2);if(r<lo||r>=hi)continue;const k=4*(j*n+i);if(data[k+3]<200)continue;total++;
     const R=data[k]/255,G=data[k+1]/255,B=data[k+2]/255,max=Math.max(R,G,B),min=Math.min(R,G,B),d=max-min;if(max<.15||d<.25*max)continue;
     let h=max===R?((G-B)/d)%6:max===G?(B-R)/d+2:(R-G)/d+4;h*=60;if(h<0)h+=360;if(h>=10&&h<=50)foreign++;
    }
    out[edges[e].toFixed(2)]=total?+(100*foreign/total).toFixed(2):null;
   }
   return out;
  };
  // The white stamp ring (DD3 fixtures) as a circle: its centre's offset from the image centre, in disc radii.
  window.__stampRing=(data,n)=>{
   let sx=0,sy=0,sxx=0,syy=0,sxy=0,sz=0,sxz=0,syz=0,m=0;
   for(let j=0;j<n;j++)for(let i=0;i<n;i++){
    const u=(i+.5)/n*2-1,v=(j+.5)/n*2-1,r=Math.hypot(u,v),k=4*(j*n+i);if(r<.5||r>.76)continue;
    if(Math.min(data[k],data[k+1],data[k+2])<215)continue;const z=-(u*u+v*v);
    sx+=u;sy+=v;sxx+=u*u;syy+=v*v;sxy+=u*v;sz+=z;sxz+=u*z;syz+=v*z;m++;
   }
   // Kåsa fit: u² + v² + Du + Ev + F = 0.
   const A=[[sxx,sxy,sx,sxz],[sxy,syy,sy,syz],[sx,sy,m,sz]];
   for(let i=0;i<3;i++){let p=i;for(let k=i+1;k<3;k++)if(Math.abs(A[k][i])>Math.abs(A[p][i]))p=k;[A[i],A[p]]=[A[p],A[i]];for(let k=0;k<3;k++)if(k!==i){const f=A[k][i]/A[i][i];for(let j=i;j<4;j++)A[k][j]-=f*A[i][j];}}
   const D=A[0][3]/A[0][0],E=A[1][3]/A[1][1],x=-D/2,y=-E/2;return {x:+x.toFixed(4),y:+y.toFixed(4),offset:+Math.hypot(x,y).toFixed(4),pixels:m};
  };
  window.__hash=data=>{let h=0x811c9dc5;for(let i=0;i<data.length;i++)h=Math.imul(h^data[i],16777619)>>>0;return h.toString(16);};
 });
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const callback=new URL(u.searchParams.get('redirect_uri'));callback.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${callback.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 const serveOld=(pattern,body)=>page.route(pattern,route=>route.fulfill({status:200,contentType:'text/javascript',body}));
 await page.goto(base+'/?bag=1');await page.locator('#myBagDemo').waitFor();await page.locator('#myBagSignIn').click();
 const link=page.getByRole('link',{name:'Continue with Google',exact:true});await link.waitFor();
 const redirect=await page.request.get(base+await link.getAttribute('href'),{maxRedirects:0});
 await page.goto(redirect.headers().location);await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();
 const F=await page.evaluate(makeFixtures);
 for(const k of ['misaligned','generous','fingers','clean','fresh'])fs.writeFileSync(`${dir}/fixture-${k}.png`,Buffer.from(F[k].photo));
 const pr9=k=>fs.readFileSync(`docs/assets/non-overmold-photo-edge/fixture-${k}.png`);
 // name → [mold id, photo bytes, framing {scale, cx, cy} or null for the aligner's default].
 const CASES={misaligned:[F.misaligned.mold,F.misaligned.photo,F.misaligned.options],generous:[F.generous.mold,F.generous.photo,F.generous.options],
  fingers:[F.fingers.mold,F.fingers.photo,F.exact],clean:[F.clean.mold,F.clean.photo,F.exact],
  stamp:['e70f48273d7f',pr9('stamp'),null],halo:['ba675aed468a',pr9('halo'),null],pixel:['e125b84243c2',pr9('pixel'),null]};
 const ONE_PIECE=['misaligned','generous','fingers','clean'],IDENTITY=['clean','stamp','halo','pixel'];
 // The aligner's own controls: the Framing slider, then arrow keys (each moves the photo 0.01 of its width).
 const frame=async o=>{
  if(!o)return;
  await page.evaluate(scale=>{const el=document.querySelector('.photo-aligner [data-photo="scale"]');el.value=scale;el.dispatchEvent(new Event('input',{bubbles:true}));},o.scale);
  await page.locator('.photo-aligner-view').focus();
  const press=async(key,n)=>{for(let i=0;i<n;i++)await page.keyboard.press(key);};
  await press(o.cx>.5?'ArrowLeft':'ArrowRight',Math.round(Math.abs(o.cx-.5)/.01));await press(o.cy>.5?'ArrowUp':'ArrowDown',Math.round(Math.abs(o.cy-.5)/.01));
 };
 const add=async(mold,photo,framing,destination='bag')=>{
  await page.evaluate(({mold,destination})=>{const d=discs.find(d=>d.id===mold);if(!d)throw Error('Missing mold '+mold);return BagApp.add(d,null,destination);},{mold,destination});
  await page.locator('#addDiscDialog').waitFor();
  await page.locator('.bag-photo-file').setInputFiles({name:'photo.png',mimeType:'image/png',buffer:Buffer.from(photo)});await page.locator('.photo-aligner[open]').waitFor();
  await frame(framing);await page.locator('.photo-aligner [data-aligner-confirm]').click();await page.locator('.photo-aligner').waitFor({state:'hidden'});await page.locator('.bag-photo-thumb img').waitFor();
  await page.locator('#saveDisc').click();
  await page.locator('#addDiscDialog').waitFor({state:'hidden'}).catch(async e=>{await page.screenshot({path:`${dir}/failure-add.png`});throw Error(e.message+' | Dialog: '+await page.locator('#addDiscDialog').innerText());});
 };
 // 1. Existing textures, made by main's aligner.
 await serveOld('**/disc-photo.mjs',oldDiscPhoto);await page.goto(base+'/?bag=1');await page.locator('#myBagEmpty').waitFor();
 for(const [mold,photo,framing] of Object.values(CASES))await add(mold,photo,framing);
 await add(CASES.fingers[0],CASES.fingers[1],CASES.fingers[2],'storage');
 await page.unroute('**/disc-photo.mjs');
 let data=await (await page.request.get(base+'/api/bag')).json();
 const names=Object.keys(CASES),ids={},urls={};
 data.discs.forEach((d,i)=>{const k=i<names.length?names[i]:'storage-fingers';ids[k]=d.id;urls[k]=`/api/bag/discs/${encodeURIComponent(d.id)}/photo?v=${encodeURIComponent(d.texture_key)}`;});
 assert.equal(data.discs.length,names.length+1);
 metrics.stored=Object.fromEntries(data.discs.map((d,i)=>[i<names.length?names[i]:'storage-fingers',{mold:d.mold_id,photo_rim_color:d.photo_rim_color,in_bag:d.in_bag}]));

 const png=(file,b64)=>fs.writeFileSync(`${dir}/${file}.png`,Buffer.from(b64,'base64'));
 // The texture a mesh draws, read back unflipped, with its rings, stamp ring and hash.
 const readTexture=()=>page.evaluate(async()=>{
  const image=Disc3D.viewer.debug.photo.material.map.image,n=image.width,c=new OffscreenCanvas(n,n),g=c.getContext('2d');
  g.translate(0,n);g.scale(1,-1);g.drawImage(image,0,0);const data=g.getImageData(0,0,n,n).data;
  const blob=await c.convertToBlob({type:'image/png'}),b64=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(blob);});
  return {n,foreign:window.__foreign(data,n),stamp:window.__stampRing(data,n),hash:window.__hash(data),b64};
 });
 const canvasRings=handle=>handle.evaluate(canvas=>{const n=canvas.width,d=canvas.getContext('2d').getImageData(0,0,n,n).data;return {n,foreign:window.__foreign(d,n,(n-2)/n),hash:window.__hash(d),b64:canvas.toDataURL('image/png').split(',')[1]};});
 const finished=url=>page.waitForFunction(async url=>{const art=await (await import('/disc3d/atlas-art.mjs')).getAtlasArt();return [...art.debug.images.keys()].some(k=>k.endsWith('|'+url));},url,{timeout:30000});
 const shotRings=async(file,clip)=>{const b=await page.screenshot({clip,path:`${dir}/${file}.png`});return page.evaluate(async b64=>{const img=await createImageBitmap(await (await fetch('data:image/png;base64,'+b64)).blob()),n=Math.min(img.width,img.height),c=new OffscreenCanvas(n,n),g=c.getContext('2d');g.drawImage(img,0,0,n,n);return window.__foreign(g.getImageData(0,0,n,n).data,n,.92);},b.toString('base64'));};

 const surfaces=async label=>{
  const out={};
  // Detail panel: the texture on the photo mesh (1024 tier), and the top view as seen.
  await page.goto(base+'/?bag=1');await page.locator(`[data-bag-edit="${ids.misaligned}"]`).waitFor();
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
   out[k]={texture:t};
   await page.evaluate(()=>Disc3D.viewer.setView('angle',{instant:true}));await page.locator('#closeDetail').click();
  }
  // My Bag list thumbnails (the atlas art's top-down image).
  for(const k of names){
   const host=page.locator(`[data-disc-id="${ids[k]}"] [data-disc-thumbnail]`).first();await host.scrollIntoViewIfNeeded();
   await finished(await host.getAttribute('data-photo-url'));
   await page.waitForFunction(h=>h.classList.contains('has-3d')&&h.querySelector('canvas'),await host.elementHandle());await page.waitForTimeout(400);
   const t=await canvasRings(await host.locator('canvas').elementHandle());png(`${label}-${k}-thumb`,t.b64);delete t.b64;out[k].thumb=t;
  }
  // My Map: each mold's marker art (one photo disc per mold).
  await page.getByRole('radio',{name:'My Map'}).click();
  await page.waitForFunction(()=>myMap&&document.querySelector('#mapWrap').closest('#myMapHost')&&!cameraTween&&groupCache?.items===filtered);
  for(const k of names){
   const mold=CASES[k][0],url=urls[k];
   const ok=await page.waitForFunction(async ({mold,url})=>{const art=await (await import('/disc3d/atlas-art.mjs')).getAtlasArt(),canvas=document.querySelector(`#mapMarkers .atlas-marker[data-cluster="${mold}"] canvas.disc-art-3d`);return !!canvas&&[...art.debug.images].some(([key,e])=>e.canvas===canvas&&key.endsWith('|'+url));},{mold,url},{timeout:15000}).then(()=>true,()=>false);
   // A marker grouped under another lead at this zoom draws no art of its own: reported, not measured.
   if(!ok){out[k].map=null;continue;}
   const t=await canvasRings(await page.locator(`#mapMarkers .atlas-marker[data-cluster="${mold}"] canvas.disc-art-3d`).elementHandle());png(`${label}-${k}-mymap`,t.b64);delete t.b64;out[k].map=t;
  }
  await page.locator('#myMapPanel').screenshot({path:`${dir}/${label}-mymap-panel.png`});
  // My Bag: the pulled disc (detail look at the largest tier), for the three repaired photos.
  for(const k of ['misaligned','generous','fingers']){
   await page.goto(base+'/?bag=1');
   await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s?.dataset.engine==='ready'&&s.dataset.phase==='open';},null,{timeout:40000});
   await page.locator('[data-bag-canvas]').scrollIntoViewIfNeeded();await page.mouse.move(2,2);
   await page.locator(`[data-physical-disc="${ids[k]}"]`).evaluate(n=>n.click());
   await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return !s.querySelector('[data-bag-canvas]').bagViewer.stage.moving&&s.dataset.staging==='still';},null,{timeout:20000});
   await page.waitForFunction(key=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().find(d=>d.key===key).photo?.relief,ids[k],{timeout:20000});await page.waitForTimeout(400);
   const clip=await page.locator('[data-bag-canvas]').evaluate((n,key)=>{const v=n.bagViewer,c=n.getBoundingClientRect(),r=v.discScreenRect(key,{rim:true});return {x:c.left+r.left,y:c.top+r.top,width:r.width,height:r.height};},ids[k]);
   out[k].bag=await shotRings(`${label}-${k}-bag-pulled`,clip);
  }
  // Storage: the rack's pulled copy of the fingers photo, zoomed.
  await page.goto(base+'/?bag=1');await page.getByRole('radio',{name:'Storage',exact:true}).and(page.locator('[data-bag-view]')).click();
  await page.locator('#storageScene[data-engine="ready"]').waitFor({timeout:30000});
  await page.waitForFunction(()=>window.BagApp.scenes.storage&&!window.BagApp.scenes.storage.state.moving,null,{timeout:15000});await page.waitForTimeout(1200);
  await page.evaluate(id=>window.BagApp.scenes.storage.pull(id),ids['storage-fingers']);
  await page.waitForFunction(id=>window.BagApp.scenes.storage.state.pulled===id&&!window.BagApp.scenes.storage.state.moving,ids['storage-fingers'],{timeout:15000});await page.waitForTimeout(900);
  const project=()=>page.evaluate(id=>window.BagApp.scenes.storage.project(id),ids['storage-fingers']);
  const still=async()=>{let a=await project();for(let i=0;i<40;i++){await page.waitForTimeout(250);const b=await project();if(Math.hypot(b.x-a.x,b.y-a.y)<.5)return b;a=b;}throw Error('The pulled disc never settled');};
  const canvas=page.locator('#storageScene [data-collection-canvas]');
  await page.locator('#storageScene').scrollIntoViewIfNeeded();let at=await still(),box=await canvas.boundingBox();await page.mouse.move(box.x+at.x,box.y+at.y);await page.keyboard.down('Control');
  await page.mouse.wheel(0,-60);await page.keyboard.up('Control');await page.waitForFunction(()=>!window.BagApp.scenes.storage.state.moving,null,{timeout:15000});at=await still();box=await canvas.boundingBox();
  await page.screenshot({clip:{x:box.x+at.x-110,y:box.y+at.y-110,width:220,height:220},path:`${dir}/${label}-fingers-storage-pulled.png`});
  return out;
 };
 await serveOld('**/disc3d/photo.mjs',oldPhoto);
 metrics.before=await surfaces('before');
 await page.unroute('**/disc3d/photo.mjs');
 const after=metrics.after=await surfaces('after');

 // 3. Purity and cost, on the stored blobs themselves.
 metrics.purity=await page.evaluate(async({urls,names})=>{
  const {planPhoto,cleanPhoto}=await import('/disc3d/photo-clean.mjs'),{photoCleanup,acquirePhoto}=await import('/disc3d/photo.mjs');
  // The app's own loader, at two tiers per photo: one plan per stored texture, made in the worker.
  const start={...photoCleanup.stats},handles=[];
  for(const k of names)for(const size of [1024,256]){const h=acquirePhoto(urls[k],size);handles.push(h);await h.ready;}
  const read=image=>{const n=image.width,c=new OffscreenCanvas(n,n),g=c.getContext('2d');g.translate(0,n);g.scale(1,-1);g.drawImage(image,0,0);return g.getImageData(0,0,n,n).data;};
  const out={};
  for(const k of names){
   const blob=await (await fetch(urls[k],{credentials:'same-origin'})).blob();
   const a=await planPhoto(blob),b=await planPhoto(blob),worker=await photoCleanup.plans.get(urls[k]);
   const same=(p,q)=>JSON.stringify(p.report)===JSON.stringify(q.report)&&String(p.mask)===String(q.mask);
   const row={changed:a.changed,report:a.report,planMs:+a.ms.toFixed(1),repeatable:same(a,b),workerMatches:!!worker&&same(a,worker)};
   for(const size of [1024,256]){
    const t=performance.now(),x=a.changed?await cleanPhoto(blob,size,a):null,ms=performance.now()-t,y=a.changed?await cleanPhoto(blob,size,a):null;
    row['clean'+size]=a.changed?{ms:+ms.toFixed(1),hash:window.__hash(read(x)),repeatable:window.__hash(read(x))===window.__hash(read(y))}:null;
   }
   out[k]=row;
  }
  // Over this whole page (the bag scene drew every photo before this ran): each stored texture planned once.
  const s=photoCleanup.stats;out.stats={...s,planned:photoCleanup.plans.size,cleanedHere:s.cleaned-start.cleaned};
  for(const h of handles)h.release();
  return out;
 },{urls,names});

 // 4. A fresh imperfect photo through the new aligner.
 await page.goto(base+'/?bag=1');await page.locator(`[data-bag-edit="${ids.misaligned}"]`).waitFor();
 await page.evaluate(mold=>BagApp.add(discs.find(d=>d.id===mold),null,'bag'),F.fresh.mold);await page.locator('#addDiscDialog').waitFor();
 await page.locator('.bag-photo-file').setInputFiles({name:'fresh.png',mimeType:'image/png',buffer:Buffer.from(F.fresh.photo)});await page.locator('.photo-aligner[open]').waitFor();
 const snapLine=page.locator('.photo-aligner-snap'),snapText=()=>snapLine.locator('span').textContent();
 const fresh=metrics.fresh={};
 await page.waitForFunction(()=>/Snapped/.test(document.querySelector('.photo-aligner-snap span').textContent),null,{timeout:5000});fresh.onOpen=await snapText();
 await page.waitForTimeout(300);await page.locator('.photo-aligner').screenshot({path:`${dir}/fresh-aligner-snapped.png`});
 // A nudge by hand: the Undo goes, and the ring snaps back once it settles.
 await page.locator('.photo-aligner-view').focus();for(let i=0;i<3;i++)await page.keyboard.press('ArrowLeft');
 fresh.afterNudge=await snapLine.isHidden();
 await page.waitForFunction(()=>/Snapped/.test(document.querySelector('.photo-aligner-snap span').textContent)&&!document.querySelector('.photo-aligner-snap').hidden,null,{timeout:5000});
 await page.locator('.photo-aligner-snap-action').click();fresh.undo=await snapText();
 await page.waitForTimeout(300);await page.locator('.photo-aligner').screenshot({path:`${dir}/fresh-aligner-undone.png`});
 await page.waitForTimeout(600);fresh.stayedUndone=await snapText();
 assert.equal(await page.locator('.photo-aligner-snap-action').textContent(),'Snap to edge');await page.locator('.photo-aligner-snap-action').click();fresh.resnap=await snapText();
 await page.locator('.photo-aligner [data-aligner-confirm]').click();await page.locator('.photo-aligner').waitFor({state:'hidden'});await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 data=await (await page.request.get(base+'/api/bag')).json();
 const freshDisc=data.discs.find(d=>d.mold_id===F.fresh.mold),freshURL=`/api/bag/discs/${encodeURIComponent(freshDisc.id)}/photo?v=${encodeURIComponent(freshDisc.texture_key)}`;
 Object.assign(fresh,await page.evaluate(async url=>{
  const {planPhoto}=await import('/disc3d/photo-clean.mjs'),blob=await (await fetch(url,{credentials:'same-origin'})).blob(),plan=await planPhoto(blob);
  const image=await createImageBitmap(blob),n=image.width,c=new OffscreenCanvas(n,n),g=c.getContext('2d');g.drawImage(image,0,0);
  return {report:plan.report,storedForeign:window.__foreign(g.getImageData(0,0,n,n).data,n)};
 },freshURL));
 await page.locator(`[data-disc-id="${freshDisc.id}"] [data-bag-inspect]`).click();await page.waitForFunction(()=>Disc3D.viewer?.debug.photo?.userData.photoReady,null,{timeout:30000});await page.waitForTimeout(300);
 const ft=await readTexture();png('fresh-texture',ft.b64);delete ft.b64;fresh.texture=ft;

 fs.writeFileSync(`${dir}/metrics.json`,JSON.stringify(metrics,null,1));
 // Verdicts.
 const before=metrics.before,max=o=>Math.max(...Object.values(o).filter(v=>v!=null)),outer=o=>Math.max(o['0.88'],o['0.91'],o['0.94'],o['0.97']);
 assert.ok(outer(before.misaligned.texture.foreign)>=20&&outer(before.generous.texture.foreign)>=50&&outer(before.fingers.texture.foreign)>=3,'the before half reproduces the crescent, the ring and the fingers');
 for(const k of ['misaligned','generous','fingers']){
  assert.ok(max(after[k].texture.foreign)<=.5,`${k}: no table or skin left on the texture (${JSON.stringify(after[k].texture.foreign)})`);
  assert.ok(max(after[k].thumb.foreign)<=1.5,`${k}: thumbnail clean (${JSON.stringify(after[k].thumb.foreign)})`);
  if(after[k].map)assert.ok(max(after[k].map.foreign)<=1.5,`${k}: My Map clean (${JSON.stringify(after[k].map.foreign)})`);
  assert.ok(max(after[k].bag)<=1.5,`${k}: pulled bag disc clean (${JSON.stringify(after[k].bag)})`);
 }
 // DD3: the stamp ring reads centred once re-registered.
 assert.ok(before.misaligned.texture.stamp.offset>=.05&&after.misaligned.texture.stamp.offset<=.01,`DD3 stamp ring centred (${before.misaligned.texture.stamp.offset} → ${after.misaligned.texture.stamp.offset})`);
 // Control and PR #9's fixtures: not a byte moved, on the texture and in the atlas images.
 for(const k of IDENTITY){
  assert.equal(after[k].texture.hash,before[k].texture.hash,`${k}: texture byte-identical`);
  assert.equal(metrics.purity[k].changed,false,`${k}: the plan leaves it alone`);
  assert.equal(after[k].thumb.hash,before[k].thumb.hash,`${k}: thumbnail byte-identical`);
 }
 for(const k of names){assert.ok(metrics.purity[k].repeatable&&metrics.purity[k].workerMatches,`${k}: the same plan on every call, main thread and worker`);if(metrics.purity[k].clean1024)assert.ok(metrics.purity[k].clean1024.repeatable&&metrics.purity[k].clean256.repeatable,`${k}: the same pixels on every call`);}
 // The panel's texture is exactly the cleaned image the worker made for its tier.
 for(const k of ['misaligned','generous','fingers'])assert.equal(after[k].texture.hash,metrics.purity[k].clean1024.hash,`${k}: the panel draws the plan's pixels`);
 const changedCount=names.filter(k=>metrics.purity[k].changed).length;
 const st=metrics.purity.stats;
 assert.ok(st.planned>=names.length&&st.plans===st.planned,`one plan per stored texture on the page, whatever the surfaces and tiers (${st.plans} plans, ${st.planned} textures)`);
 assert.ok(st.cleanedHere<=2*changedCount,'cleaned images only for photos the plan changes');assert.equal(st.worker,true,'made in the worker');
 // Fresh upload: the aligner snapped and said so, Undo kept the user's ring, and the texture needs no re-registration.
 assert.match(fresh.onOpen,/Snapped/);assert.equal(fresh.afterNudge,true);assert.match(fresh.undo,/back where you put it/);assert.match(fresh.stayedUndone,/back where you put it/);assert.match(fresh.resnap,/Snapped/);
 assert.equal(fresh.report.register,null,'the snapped crop is the disc');assert.ok(max(fresh.texture.foreign)<=.5,`fresh: no table or skin on view (${JSON.stringify(fresh.texture.foreign)})`);
 assert.deepEqual(errors,[]);
 const p=metrics.purity;
 console.log(`ok - only the disc: DD3 outer rings ${outer(before.misaligned.texture.foreign)}% → ${outer(after.misaligned.texture.foreign)}% table, stamp ring off by ${before.misaligned.texture.stamp.offset} → ${after.misaligned.texture.stamp.offset} R; generous ${outer(before.generous.texture.foreign)}% → ${outer(after.generous.texture.foreign)}%; fingers ${outer(before.fingers.texture.foreign)}% → ${outer(after.fingers.texture.foreign)}%; ${IDENTITY.join('/')} byte-identical; ${p.stats.plans} plans for ${p.stats.planned} textures (${(p.stats.planMs/Math.max(1,p.stats.plans)).toFixed(1)} ms each in the worker), ${p.stats.cleaned} cleaned (${(p.stats.cleanMs/Math.max(1,p.stats.cleaned)).toFixed(1)} ms each); fresh upload snapped`);
}finally{await browser?.close();server.kill();}
