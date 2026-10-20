// Photos stop at the shoulder (Oct 16 revert, docs/photo-edge-revert.md): a one-piece disc's photo covers the
// top inside the shoulder cut (Rs) and the rim is generated plastic in the photo-matched colour; an overmold's
// photo stops at its seam (Ri) and its rim piece wears the sampled rim colour. Stored textures draw as stored:
// no load-time cleanup, no aligner snap.
//
// Cases (tests/photo-edge-shared.mjs): stamp, halo, wraith and clean (one piece), pixel (overmold), each uploaded
// through the real editor on a local Wrangler + D1, into the bag and into Storage. Each draws in the detail panel
// (top and 3/4), My Bag pulled and Storage pulled.
//
// EDGE_REFERENCE=<built checkout> draws every surface through that tree first, then through this one, in one run
// on one GPU, and requires the same photo meshes, the same texture bytes and the same pixels (GPU tolerance).
// EDGE_REFERENCE_SAME=0 records the comparison without requiring it (a contrast run).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {caseList,addDisc,referenceTree,pixelDiff} from './photo-edge-shared.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const config='tests/auth.wrangler.jsonc',state='work/non-overmold-photo-edge/local',base='https://localhost:8841',dir='outputs/photo-edge';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js',SAME=process.env.EDGE_REFERENCE_SAME!=='0';
fs.mkdirSync(dir,{recursive:true});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8841','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='',browser;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>output+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const metrics={};
try{
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.env.BAG3D_CHROMIUM_ARGS?.split(' ')||(process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'])});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}}),errors=[],requests=[];
 const reference=await referenceTree(context,base);
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 // This tree's requests only: a reference half fetches whatever its own tree does.
 context.on('request',r=>{if(!reference?.on)requests.push(r.url());});
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

 // Geometry: every photo mesh ends at the shoulder (one piece) or the seam (overmold), whatever else is passed.
 metrics.geometry=await page.evaluate(async()=>{
  const {photoGeometry}=await import('/disc3d/photo.mjs'),{shapeForDisc,shapeFrame}=await import('/disc3d/shape.mjs'),{isOvermold}=await import('/disc3d/overmold.mjs');
  const out={};
  for(const name of ['Wraith','Destroyer','Thunderbird','Aviar','Pixel','Atlas']){
   const d=discs.find(d=>d.name===name&&/Innova|Axiom/.test(d.manufacturer)),overmold=isOvermold({...d,record:d.name});
   const {shape}=shapeForDisc({model:d.model3d,specs:d.specs,flight:{speed:d.speed,turn:d.turn,fade:d.fade}}),{R,Rs,Ri}=shapeFrame(shape);
   const g=photoGeometry(shape,{overmold}),asked=photoGeometry(shape,{overmold,edge:true}),p=g.attributes.position;
   let reach=0;for(let i=0;i<p.count;i++)reach=Math.max(reach,Math.hypot(p.getX(i),p.getZ(i)));
   const same=['position','uv','normal'].every(k=>g.attributes[k].array.length===asked.attributes[k].array.length&&g.attributes[k].array.every((v,i)=>v===asked.attributes[k].array[i]));
   out[name]={overmold,reach:+(reach/R).toFixed(4),stop:+((overmold?Ri:Rs)/R).toFixed(4),shoulder:+(Rs/R).toFixed(4),ignoresEdge:same,triangles:g.index.count/3};
   g.dispose();asked.dispose();
  }
  return out;
 });
 for(const [name,g] of Object.entries(metrics.geometry)){
  assert.equal(g.reach,g.stop,`${name}: the photo stops at the ${g.overmold?'seam':'shoulder'} (${JSON.stringify(g)})`);
  assert.ok(g.ignoresEdge,`${name}: no edge path; the same mesh whatever is asked`);
 }
 // The cleanup layer and the aligner snap are gone from the served tree.
 const gone=await page.evaluate(async()=>{const photo=await import('/disc3d/photo.mjs'),editor=await import('/disc-photo.mjs');return {photoCleanup:'photoCleanup' in photo,snapToDisc:'snapToDisc' in editor,cleanModule:await fetch('/disc3d/photo-clean.mjs?probe').then(r=>r.ok&&!!r.headers.get('content-type')?.includes('javascript'))};});
 assert.deepEqual(gone,{photoCleanup:false,snapToDisc:false,cleanModule:false},'no cleanup or snap left in the tree');

 const {cases:CASES,seam}=await caseList(page,['stamp','halo','wraith','clean','pixel']);
 for(const destination of ['bag','storage'])for(const [,c] of CASES)await addDisc(page,dir,c,destination);
 assert.equal(await page.locator('.photo-aligner-snap').count(),0,'the aligner has no snap line');
 const data=await (await page.request.get(base+'/api/bag')).json(),n=CASES.length;
 assert.equal(data.discs.length,2*n);
 const ids={bag:{},storage:{}};data.discs.forEach((d,i)=>{ids[i<n?'bag':'storage'][CASES[i%n][0]]=d.id;});
 // Product law: classification is the catalog's, never the photo's. Only the overmold samples a rim.
 metrics.stored=Object.fromEntries(data.discs.map((d,i)=>[(i<n?'bag-':'storage-')+CASES[i%n][0],{photo_rim_color:d.photo_rim_color,rim_color:d.rim_color,color:d.color}]));
 for(const where of ['bag','storage'])for(const [k] of CASES){
  if(k==='pixel')assert.ok(metrics.stored[where+'-pixel'].photo_rim_color,'the Pixel samples its rim');
  else assert.equal(metrics.stored[where+'-'+k].photo_rim_color,null,`${k}: one piece, no rim sample`);
 }

 // Rings of a screenshot around a known centre: mean colour, and how often the brightness crosses its own
 // mean around the ring (a plain plastic ring crosses ~0 times; the stamp's stripes dozens).
 const rings=(png,{cx,cy,R})=>page.evaluate(async({b64,cx,cy,R})=>{
  const img=await createImageBitmap(await (await fetch('data:image/png;base64,'+b64)).blob()),c=new OffscreenCanvas(img.width,img.height),g=c.getContext('2d');g.drawImage(img,0,0);
  const d=g.getImageData(0,0,img.width,img.height).data,out={};
  for(const f of [.6,.75,.8,.85,.88,.91,.94,.97]){
   const samples=[];for(let i=0;i<720;i++){const a=i/720*Math.PI*2,x=Math.round(cx+Math.cos(a)*R*f),y=Math.round(cy+Math.sin(a)*R*f),k=4*(y*img.width+x);samples.push([d[k],d[k+1],d[k+2]]);}
   const luma=samples.map(([r,g,b])=>.2126*r+.7152*g+.0722*b),mean=luma.reduce((a,b)=>a+b)/luma.length;
   let crossings=0,side=0;for(const l of luma){const s=l>mean+18?1:l<mean-18?-1:0;if(s&&side&&s!==side)crossings++;if(s)side=s;}
   const rgb=[0,1,2].map(ch=>Math.round(samples.reduce((a,s)=>a+s[ch],0)/samples.length));
   out[f]={rgb:'#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join(''),crossings,spread:Math.round(Math.max(...luma)-Math.min(...luma))};
  }
  return out;
 },{b64:png.toString('base64'),cx,cy,R});

 const surfaces=async label=>{
  const result={};
  // Texture cost: each stored photo fetched and decoded fresh at the detail size, to its texture (where a load-time
  // cleanup would sit). One warm-up, then the median of three per photo.
  await page.goto(base+'/?bag=1');await page.locator(`[data-bag-edit="${ids.bag.stamp}"]`).waitFor();
  result.textureMs=await page.evaluate(async urls=>{
   const {acquirePhoto,clearPhotoCache}=await import('/disc3d/photo.mjs'),out={};
   const once=async url=>{clearPhotoCache();const t=performance.now(),h=acquirePhoto(url,1024);await h.ready;const ms=performance.now()-t;h.release();return ms;};
   await once(Object.values(urls)[0]);
   for(const [k,url] of Object.entries(urls)){const runs=[await once(url),await once(url),await once(url)].sort((a,b)=>a-b);out[k]=+runs[1].toFixed(1);}
   clearPhotoCache();return out;
  },Object.fromEntries(data.discs.slice(0,n).map((d,i)=>[CASES[i][0],'/api/bag/discs/'+encodeURIComponent(d.id)+'/photo?v='+encodeURIComponent(d.texture_key)])));
  // Detail panel: the top view (where the ring is measured) and the default 3/4 view.
  await page.goto(base+'/?bag=1');await page.locator(`[data-bag-edit="${ids.bag.stamp}"]`).waitFor();
  for(const [k] of CASES){
   await page.locator(`[data-disc-id="${ids.bag[k]}"] [data-bag-inspect]`).click();
   await page.waitForFunction(()=>Disc3D.viewer?.debug.photo?.userData.photoReady,null,{timeout:20000});await page.waitForTimeout(400);
   const host=page.locator('#detail .disc3d-canvas, #detail canvas').first();
   await host.screenshot({path:`${dir}/${label}-${k}-panel-angle.png`});
   const top=await page.evaluate(()=>{
    const v=Disc3D.viewer;v.setView('top',{instant:true});v.debug.renderNow();
    const cam=v.debug.camera,body=v.debug.body,V=cam.position.constructor,rect=v.debug.renderer.domElement.getBoundingClientRect();
    body.updateWorldMatrix(true,false);cam.updateMatrixWorld();let l=1e9,r=-1e9,t=1e9,b=-1e9;
    for(let i=0;i<64;i++){const a=i/64*Math.PI*2,p=new V(Math.cos(a)*v.state.radius,0,Math.sin(a)*v.state.radius).applyMatrix4(body.matrixWorld).project(cam),x=(p.x+1)/2*rect.width,y=(1-p.y)/2*rect.height;l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
    const mesh=v.debug.photo,geometry=mesh.geometry,g=geometry.attributes.position;let reach=0;for(let i=0;i<g.count;i++)reach=Math.max(reach,Math.hypot(g.getX(i),g.getZ(i)));
    // FNV-1a over the photo mesh's bytes, and over the texture's own pixels as decoded: the same hash is the same.
    const fnv=(arrays,h=0x811c9dc5)=>{for(const array of arrays)for(const byte of new Uint8Array(array.buffer,array.byteOffset,array.byteLength))h=Math.imul(h^byte,16777619)>>>0;return h.toString(16);};
    const image=mesh.material.map.image,c=new OffscreenCanvas(image.width,image.height),cg=c.getContext('2d');cg.drawImage(image,0,0);
    // Frame cost: 120 forced frames, closed by a pixel read so the GPU work is inside the timing.
    const gl=v.debug.renderer.getContext(),px=new Uint8Array(4);v.debug.renderNow();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);
    const t0=performance.now();for(let i=0;i<120;i++)v.debug.renderNow();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);const ms=(performance.now()-t0)/120;
    return {clip:{x:rect.left+l-6,y:rect.top+t-6,width:r-l+12,height:b-t+12},R:(r-l)/2,photoReach:reach/v.state.radius,
     mesh:fnv([g.array,geometry.attributes.uv.array,geometry.attributes.normal.array,geometry.index.array]),texture:fnv([cg.getImageData(0,0,image.width,image.height).data]),textureSize:[image.width,image.height],
     triangles:geometry.index.count/3,ms,overmold:v.state.overmold,multi:Array.isArray(v.debug.body.material),rim:v.state.overmold?'#'+v.debug.rimMaterial.color.getHexString():null};
   });
   await page.waitForTimeout(150);
   const png=await page.screenshot({clip:top.clip,path:`${dir}/${label}-${k}-panel-top.png`});
   result[k]={panel:{photoReach:+top.photoReach.toFixed(4),mesh:top.mesh,texture:top.texture,textureSize:top.textureSize,triangles:top.triangles,frameMs:+top.ms.toFixed(3),overmold:top.overmold,multi:top.multi,rim:top.rim,rings:await rings(png,{cx:top.clip.width/2,cy:top.clip.height/2,R:top.R})}};
   await page.evaluate(()=>Disc3D.viewer.setView('angle',{instant:true}));
   await page.locator('#closeDetail').click();
  }
  // My Bag: each disc pulled on its own, so it takes the detail look at the largest tier.
  for(const [k] of CASES){
   await page.goto(base+'/?bag=1');
   await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s?.dataset.engine==='ready'&&s.dataset.phase==='open';},null,{timeout:40000});
   await page.evaluate(()=>document.fonts.ready);await page.locator('[data-bag-canvas]').scrollIntoViewIfNeeded();await page.mouse.move(2,2);
   await page.locator(`[data-physical-disc="${ids.bag[k]}"]`).evaluate(n=>n.click());
   await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return !s.querySelector('[data-bag-canvas]').bagViewer.stage.moving&&s.dataset.staging==='still';},null,{timeout:20000});
   await page.waitForFunction(key=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().find(d=>d.key===key).photo?.relief,ids.bag[k],{timeout:20000});await page.waitForTimeout(400);
   const m=await page.locator('[data-bag-canvas]').evaluate((n,key)=>{const v=n.bagViewer,c=n.getBoundingClientRect(),r=v.discScreenRect(key,{rim:true}),s=v.getBagLayoutState().find(d=>d.key===key);
    return {look:s.look,photo:s.photo,overmold:s.overmold,clip:{x:c.left+r.left-6,y:c.top+r.top-6,width:r.width+12,height:r.height+12},R:Math.min(r.width,r.height)/2};},ids.bag[k]);
   const png=await page.screenshot({clip:m.clip,path:`${dir}/${label}-${k}-bag-pulled.png`});
   result[k].bag={look:m.look,photo:m.photo,overmold:m.overmold,rings:await rings(png,{cx:m.clip.width/2,cy:m.clip.height/2,R:m.R})};
  }
  // Storage: the rack's pulled disc, face on to the camera.
  await page.goto(base+'/?bag=1');await page.getByRole('radio',{name:'Storage',exact:true}).and(page.locator('[data-bag-view]')).click();
  await page.locator('#storageScene[data-engine="ready"]').waitFor({timeout:30000});
  // The rack frames itself on open; let that camera glide finish before the first pull and zoom.
  await page.waitForFunction(()=>window.BagApp.scenes.storage&&!window.BagApp.scenes.storage.state.moving,null,{timeout:15000});await page.waitForTimeout(1200);
  for(const [k] of CASES){
   await page.waitForFunction(()=>window.BagApp.scenes.storage&&!window.BagApp.scenes.storage.state.moving,null,{timeout:15000});
   await page.evaluate(id=>window.BagApp.scenes.storage.pull(id),ids.storage[k]);
   await page.waitForFunction(id=>window.BagApp.scenes.storage.state.pulled===id&&!window.BagApp.scenes.storage.state.moving,ids.storage[k],{timeout:15000});await page.waitForTimeout(900);
   const canvas=page.locator('#storageScene [data-collection-canvas]'),project=()=>page.evaluate(id=>window.BagApp.scenes.storage.project(id),ids.storage[k]);
   // Where the pulled disc stands once it has stopped: two readings 250 ms apart within half a pixel.
   const still=async()=>{let a=await project();for(let i=0;i<40;i++){await page.waitForTimeout(250);const b=await project();if(Math.hypot(b.x-a.x,b.y-a.y)<.5)return b;a=b;}throw Error('The pulled disc never settled');};
   await page.locator('#storageScene').screenshot({path:`${dir}/${label}-${k}-storage-scene.png`});
   // Ctrl + scroll zooms about the pointer (one notch of 60, about 1.8×): close enough to read the edge.
   // Measured after the scene shot, which scrolls the page to the scene.
   let at=await still(),box=await canvas.boundingBox();await page.mouse.move(box.x+at.x,box.y+at.y);await page.keyboard.down('Control');
   await page.mouse.wheel(0,-60);await page.keyboard.up('Control');
   await page.waitForFunction(()=>!window.BagApp.scenes.storage.state.moving,null,{timeout:15000});at=await still();
   box=await canvas.boundingBox();
   const half=110;await page.screenshot({clip:{x:box.x+at.x-half,y:box.y+at.y-half,width:2*half,height:2*half},path:`${dir}/${label}-${k}-storage-pulled.png`});
   await page.evaluate(()=>{window.BagApp.scenes.storage.zoomTo(1);window.BagApp.scenes.storage.putBack();});await page.mouse.move(2,2);
  }
  return result;
 };

 if(reference){
  reference.on=true;metrics.reference=await surfaces('reference');reference.on=false;
  metrics.referenceServed=reference.served;assert.ok(reference.served>0,'the reference tree answered the asset requests');
 }
 const label=reference?'current':'shoulder',now=metrics.current=await surfaces(label);
 if(reference){
  metrics.pixelDiff={};
  for(const [k] of CASES)for(const s of ['panel-angle','panel-top','bag-pulled','storage-pulled'])metrics.pixelDiff[k+'-'+s]=await pixelDiff(page,`${dir}/reference-${k}-${s}.png`,`${dir}/current-${k}-${s}.png`);
 }
 metrics.cleanupRequests=requests.filter(u=>/photo-clean/.test(u)&&!u.endsWith('?probe'));
 fs.writeFileSync(`${dir}/metrics.json`,JSON.stringify(metrics,null,2));

 const ring=(m,f)=>m.rings[f],channels=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)),OUTER=[.88,.91,.94,.97];
 for(const [k] of CASES.filter(([k])=>k!=='pixel')){
  const p=now[k].panel,mold=k==='clean'?'Thunderbird':'Wraith';
  assert.deepEqual([p.overmold,p.multi,p.rim],[false,false,null],`${k}: one piece, one material`);
  assert.ok(Math.abs(p.photoReach-metrics.geometry[mold].shoulder)<1e-3,`${k}: the photo stops at the shoulder (${p.photoReach} R, shoulder ${metrics.geometry[mold].shoulder})`);
  assert.equal(now[k].bag.overmold,false);
 }
 // The shoulder is generated plastic: the stamp's stripes stop inside it, on the panel and the pulled bag disc
 // (at most the key light's one highlight arc), and the halo's outer rings are the plate's purple, not the band.
 for(const s of ['panel','bag'])for(const f of OUTER){
  assert.ok(ring(now.stamp[s],f).crossings<=2,`stamp ${s}: plain plastic at ${f} R (${JSON.stringify(ring(now.stamp[s],f))})`);
  assert.ok(Math.min(...channels(ring(now.halo[s],f).rgb))<0xc8,`halo ${s}: the plate's colour at ${f} R, not the photo's band (${ring(now.halo[s],f).rgb})`);
 }
 // Control: the Pixel's photo stops at its seam and its rim piece keeps its sampled colour.
 const pix=now.pixel.panel;
 assert.deepEqual([pix.overmold,pix.multi,pix.rim],[true,true,'#101418']);
 assert.ok(Math.abs(pix.photoReach-seam)<1e-3,`the Pixel's photo stops at the seam (${pix.photoReach} R, seam ${seam.toFixed(4)})`);
 assert.deepEqual(metrics.cleanupRequests,[],'no cleanup module or worker is fetched');
 if(reference&&SAME){
  // Same geometry and the same texture bytes, so the same drawing; the screens get a hair of GPU tolerance
  // (the rack's lights and hover settle on their own clock).
  for(const [k] of CASES){
   const a=metrics.reference[k].panel,b=now[k].panel;
   assert.deepEqual([a.mesh,a.texture,a.photoReach,a.rim],[b.mesh,b.texture,b.photoReach,b.rim],`${k}: the reference draws the same photo mesh and texture`);
   for(const s of ['panel-angle','panel-top','bag-pulled','storage-pulled']){const d=metrics.pixelDiff[k+'-'+s];assert.ok(!d.size&&d.over8<=d.pixels*.002,`${k} ${s}: the same as the reference (${JSON.stringify(d)})`);}
  }
 }
 assert.deepEqual(errors,[]);
 const cmp=reference?'; vs reference '+CASES.map(([k])=>k+' '+Math.max(...['panel-angle','panel-top','bag-pulled','storage-pulled'].map(s=>metrics.pixelDiff[k+'-'+s].max))).join(', ')+' max diff':'';
 console.log(`ok - photos stop at the shoulder: stamp ${OUTER.map(f=>ring(now.stamp.panel,f).crossings).join('/')} crossings at ${OUTER.join('/')} R, halo ${ring(now.halo.panel,.94).rgb} at 0.94 R; Pixel stops at its seam, rim ${pix.rim}; texture ${Object.entries(now.textureMs).map(([k,v])=>k+' '+v).join(', ')} ms${cmp}`);
}finally{await browser?.close();server.kill();}
