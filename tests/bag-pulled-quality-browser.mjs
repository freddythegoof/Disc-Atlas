// My Bag's pulled discs against the 3D viewer: quality path (photo tier, lathe, pixel ratio) by size, and
// an upright, face-on stamp. Real local D1 + the signed Google fixture; no live account is touched.
// A 2× display (Retina) is the case where the canvas cap upscaled large pulled discs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const config='tests/auth.wrangler.jsonc',state='work/bag-pulled-quality/test-d1',base='https://localhost:8832',dir='outputs/bag-pulled-quality';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8832','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='',browser;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>output+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const metrics={};
try{
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.env.BAG3D_CHROMIUM_ARGS?.split(' ')||(process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'])});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000},deviceScaleFactor:2}),errors=[];
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
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

 // The pose fixture: a disc photo whose stamp is one vertical bar, with a blue dot above it. Its orientation
 // is known exactly, so the rendered bar's angle is the presentation's own roll.
 const fixture=Buffer.from(await page.evaluate(async()=>{
  const n=1024,c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d');
  g.fillStyle='#2a2d33';g.fillRect(0,0,n,n);g.fillStyle='#e9e2cc';g.beginPath();g.arc(n/2,n/2,n*.47,0,Math.PI*2);g.fill();
  g.fillStyle='#111111';g.fillRect(n*.475,n*.26,n*.05,n*.48);g.fillStyle='#1f5fd6';g.beginPath();g.arc(n/2,n*.18,n*.035,0,Math.PI*2);g.fill();
  return [...new Uint8Array(await (await new Promise(r=>c.toBlob(r,'image/png'))).arrayBuffer())];
 }));
 const add=async(name,photo)=>{
  await page.evaluate(async name=>{const d=discs.find(d=>d.name===name||d.id===name);if(!d)throw Error('Missing mold '+name);await BagApp.add(d,null,'bag');},name);
  await page.locator('#addDiscDialog').waitFor();
  if(photo){await page.locator('.bag-photo-file').setInputFiles(photo);await page.locator('.photo-aligner[open]').waitFor();await page.locator('.photo-aligner [data-aligner-confirm]').click();await page.locator('.photo-aligner').waitFor({state:'hidden'});await page.locator('.bag-photo-thumb img').waitFor();}
  await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});
 };
 await add('Destroyer',{name:'orientation.png',mimeType:'image/png',buffer:fixture});
 await add('Buzzz','tests/fixtures/stamped-disc.webp');
 for(const name of ['Judge','Wraith','Firebird','Zone'])await add(name);
 // Six more plain molds (from the demo bag), so six out is a middling count rather than the whole bag.
 for(const mold of ['da3c28085382','e70f48273d7f','e9a88cc4f3b1','ba675aed468a','df3915bf7676','f95c107f4dd7'])await add(mold);
 const data=await (await page.request.get(base+'/api/bag')).json();
 const names=await page.evaluate(list=>list.map(d=>discs.find(m=>m.id===d.mold_id)?.name),data.discs);
 const id=name=>data.discs[names.indexOf(name)].id,destroyer=id('Destroyer'),buzzz=id('Buzzz'),plain=['Judge','Wraith','Firebird','Zone'].map(id);
 assert.ok(data.discs.find(d=>d.id===destroyer).texture_key&&data.discs.find(d=>d.id===buzzz).texture_key);

 const open=async()=>{
  await page.goto(base+'/?bag=1');
  await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s?.dataset.engine==='ready'&&s.dataset.phase==='open';},null,{timeout:40000});
  await page.evaluate(()=>document.fonts.ready);await page.locator('[data-bag-canvas]').scrollIntoViewIfNeeded();await page.mouse.move(2,2);
  assert.equal(await page.locator('[data-bag-canvas]').evaluate(n=>n.bagViewer.renderer.quality),'high','the GPU path, where pulled discs take the detail look');
 };
 const settled=()=>page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return !s.querySelector('[data-bag-canvas]').bagViewer.stage.moving&&s.dataset.staging==='still';},null,{timeout:20000});
 const pull=async key=>{await page.locator(`[data-physical-disc="${key}"]`).evaluate(n=>n.click());await settled();};
 // A pulled disc's photo is decoded off the frame: wait until what shows is what the look asks for.
 const photoShows=(key,size)=>page.waitForFunction(({key,size})=>{const s=document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().find(d=>d.key===key);return s.photo?.size===size;},{key,size},{timeout:20000})
  .catch(async e=>{throw Error(e.message+'\n'+JSON.stringify(await page.locator('[data-bag-canvas]').evaluate(n=>n.bagViewer.getBagLayoutState().filter(d=>d.out).map(({key,look,photo,shown,segments})=>({key,look,photo,shown,segments})))));});
 const measure=key=>page.locator('[data-bag-canvas]').evaluate((n,key)=>{
  const v=n.bagViewer,c=n.getBoundingClientRect(),r=v.discScreenRect(key,{rim:true}),s=v.getBagLayoutState().find(d=>d.key===key);
  return {look:s.look,material:s.material,photo:s.photo,segments:s.segments,shown:s.shown,pixelRatio:v.renderer.pixelRatio,dpr:devicePixelRatio,
   disc:{left:c.left+r.left,top:c.top+r.top,width:r.width,height:r.height},rendered:r.width*v.renderer.pixelRatio,displayed:r.width*devicePixelRatio};
 },key);
 // The stamp's angle from the pixels: dark pixels on the plate (the bar), their principal axis in degrees from
 // vertical, + clockwise on screen; and whether the blue dot is above the bar's middle.
 const stampAngle=async(m,file,on=page)=>{
  const png=await on.screenshot({clip:{x:m.disc.left,y:m.disc.top,width:m.disc.width,height:m.disc.height},...(file?{path:file}:{})});
  return on.evaluate(async b64=>{
   const img=await createImageBitmap(await (await fetch('data:image/png;base64,'+b64)).blob()),c=new OffscreenCanvas(img.width,img.height),g=c.getContext('2d');g.drawImage(img,0,0);
   const d=g.getImageData(0,0,img.width,img.height).data,w=img.width,h=img.height,cx=w/2,cy=h/2,R=Math.min(w,h)/2*.8,luma=i=>.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];
   const hist=new Uint32Array(256);let total=0;for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2)if((x-cx)**2+(y-cy)**2<=R*R){hist[luma(4*(y*w+x))|0]++;total++;}
   let plate=0;for(let v=0,seen=0;v<256;v++){seen+=hist[v];if(seen>=total/2){plate=v;break;}}
   let n=0,sx=0,sy=0,sxx=0,syy=0,sxy=0,bn=0,by=0;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){if((x-cx)**2+(y-cy)**2>R*R)continue;const i=4*(y*w+x);
    if(luma(i)<plate-60&&Math.abs(d[i]-d[i+2])<40){n++;sx+=x;sy+=y;sxx+=x*x;syy+=y*y;sxy+=x*y;}
    if(d[i+2]>120&&d[i+2]>d[i]+60&&d[i+2]>d[i+1]+30){bn++;by+=y;}}
   const mx=sx/n,my=sy/n,cxx=sxx/n-mx*mx,cyy=syy/n-my*my,cxy=sxy/n-mx*my,theta=.5*Math.atan2(2*cxy,cxx-cyy)*180/Math.PI;
   return {angle:((theta-90+630)%180)-90,dark:n,blueAbove:bn>50&&by/bn<my,center:[mx,my]};
  },png.toString('base64'));
 };

 // Control: the shortest-arc facing this branch replaces rolls the stamp a few degrees.
 // The fixture must see that, or a pass below proves nothing.
 const viewerSource=fs.readFileSync('public/bag3d/viewer.mjs','utf8'),oldFacing=viewerSource.replace('quaternion: uprightFacing(face)','quaternion: new THREE.Quaternion().setFromUnitVectors(X_AXIS, face)');
 assert.notEqual(oldFacing,viewerSource);
 await page.route('**/bag3d/viewer.mjs',route=>route.fulfill({status:200,contentType:'text/javascript',body:oldFacing}));
 await open();await pull(destroyer);await photoShows(destroyer,1024);await page.waitForTimeout(300);
 const control=await stampAngle(await measure(destroyer),`${dir}/upright-before.png`);
 assert.ok(control.dark>2000&&control.blueAbove,'the fixture stamp is found');
 assert.ok(Math.abs(control.angle)>2,`the old facing visibly rolls the stamp (${control.angle.toFixed(2)}°)`);
 metrics.uprightBefore=control.angle;
 await page.unroute('**/bag3d/viewer.mjs');

 // One out: the largest tier takes the viewer's path in full.
 await open();await pull(destroyer);await photoShows(destroyer,1024);
 const one=await measure(destroyer);metrics.one=one;
 assert.equal(one.look,'detail');assert.equal(one.material,'MeshPhysicalMaterial','the viewer\'s premium plastic');
 assert.deepEqual(one.photo,{size:1024,relief:true},'the 3D viewer\'s own photo: 1024 px with its relief');
 assert.equal(one.segments,80,'the viewer\'s lathe');
 assert.ok(one.shown>400,'the max tier');
 assert.equal(one.pixelRatio,2,'the canvas draws at the viewer\'s pixel ratio');
 assert.ok(Math.abs(one.rendered-one.displayed)<1,`rendered at display size (${one.rendered.toFixed(1)} of ${one.displayed.toFixed(1)} px)`);
 // Upright through the bag's 8 s float: its rock no longer reaches the pulled disc.
 const angles=[],centers=[];
 for(let i=0;i<4;i++){if(i)await page.waitForTimeout(1900);const a=await stampAngle(one,i?null:`${dir}/upright-after.png`);assert.ok(a.blueAbove,'the stamp\'s top is up');angles.push(a.angle);centers.push(a.center);}
 assert.ok(angles.every(a=>Math.abs(a)<.5),`the stamp stands vertical (${angles.map(a=>a.toFixed(3)).join(', ')}°)`);
 metrics.uprightAfter=angles;
 // And still: the drawn stamp stays put through the float's bob (±8 px before), on the resting box where its
 // name, hit target and focus ring are placed. Device px, within one fixed clip.
 const drift=Math.max(...centers.map(c=>Math.hypot(c[0]-centers[0][0],c[1]-centers[0][1])));
 assert.ok(drift<1.5,`the disc holds its resting place against the float (${drift.toFixed(2)} device px)`);metrics.drift=drift;

 // Two out: both in the max tier, both on the viewer's photo.
 await pull(buzzz);await photoShows(buzzz,1024);
 const two=await measure(buzzz);metrics.two=two;
 assert.equal(two.look,'detail');assert.deepEqual(two.photo,{size:1024,relief:true});
 await page.mouse.move(2,2);await page.waitForTimeout(300);
 await page.screenshot({clip:{x:two.disc.left-4,y:two.disc.top-4,width:two.disc.width+8,height:two.disc.height+8},path:`${dir}/quality-pulled.png`});

 // The 3D viewer, same disc, its pop-out from the top, zoomed to the pulled disc's size on screen.
 await page.evaluate(key=>document.querySelector(`[data-disc-id="${key}"] [data-bag-inspect]`).click(),buzzz);
 await page.waitForFunction(()=>Disc3D.viewer?.debug.photo?.userData.photoReady,null,{timeout:20000});
 await page.evaluate(()=>document.querySelector('#detail [data-disc3d-expand]').click());
 await page.waitForFunction(()=>Disc3D.popout?.debug.photo?.userData.photoReady,null,{timeout:20000});await page.waitForTimeout(900);
 const viewer=await page.evaluate(target=>{
  const v=Disc3D.popout;v.setView('top',{instant:true});v.debug.renderNow();
  const cam=v.debug.camera,body=v.debug.body,V=cam.position.constructor,canvas=v.debug.renderer.domElement,rect=canvas.getBoundingClientRect();
  const span=()=>{body.updateWorldMatrix(true,false);cam.updateMatrixWorld();let l=1e9,r=-1e9,t=1e9,b=-1e9;for(let i=0;i<64;i++){const a=i/64*Math.PI*2,p=new V(Math.cos(a)*v.state.radius,0,Math.sin(a)*v.state.radius).applyMatrix4(body.matrixWorld).project(cam),x=(p.x+1)/2*rect.width,y=(1-p.y)/2*rect.height;l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}return {l,r,t,b};};
  const before=span(),pose=v.getPose();v.applyPose({...pose,view:null,zoom:pose.zoom*(before.r-before.l)/target});v.debug.renderNow();
  const s=span();
  return {pixelRatio:v.debug.renderer.getPixelRatio(),photo:{size:v.debug.photo.material.map.image.width,relief:!!v.debug.photo.material.bumpMap},disc:{left:rect.left+s.l,top:rect.top+s.t,width:s.r-s.l,height:s.b-s.t}};
 },two.disc.width);
 metrics.viewer=viewer;
 await page.waitForTimeout(200);
 await page.screenshot({clip:{x:viewer.disc.left-4,y:viewer.disc.top-4,width:viewer.disc.width+8,height:viewer.disc.height+8},path:`${dir}/quality-viewer.png`});
 assert.deepEqual(two.photo,viewer.photo,'the pulled disc wears the same photo tier as the viewer');
 assert.equal(two.pixelRatio,viewer.pixelRatio,'and draws at the same pixel ratio');
 assert.ok(Math.abs(two.disc.width-viewer.disc.width)<4,'compared at the same size on screen');
 await page.keyboard.press('Escape');await page.waitForTimeout(500);await page.evaluate(()=>document.querySelector('#closeDetail')?.click());

 // Six out, the photo discs pulled last: a middling disc takes the smallest tier that covers its device pixels.
 await open();
 for(const key of [...plain,destroyer,buzzz])await pull(key);
 await photoShows(buzzz,512);
 const six=await measure(buzzz);metrics.six=six;
 assert.ok(six.shown>200&&six.shown<256,'a middling tier');
 assert.equal(six.look,'detail');assert.deepEqual(six.photo,{size:512,relief:true},'2× display: 512 covers its device pixels');
 assert.ok(Math.abs(six.rendered-six.displayed)<1,'still rendered at display size');
 // All out: back at the size discs had before they grew, on the bag's own lighter path.
 await page.locator('.bag-dump').evaluate(n=>n.click());await settled();
 await page.waitForFunction(()=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().every(d=>d.look==='bag'),null,{timeout:5000});
 const all=await measure(buzzz);metrics.all=all;
 assert.ok(all.shown<=128,'the floor tier');
 assert.deepEqual(all.photo,{size:256,relief:false},'the bag\'s thumbnail photo');assert.equal(all.segments,40);
 assert.ok(all.pixelRatio<2,'the canvas is back under its pixel budget');
 // Home again: nothing keeps the detail look.
 await page.locator('.bag-return-all').evaluate(n=>n.click());await settled();
 await page.waitForFunction(()=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().every(d=>d.look==='bag'&&(!d.photo||d.photo.size===256)),null,{timeout:8000});
 // A phone (390 px, a 3x display): a grown pulled disc keeps the bag's own path, and its 256 px photo
 // covers the disc's device pixels (no second quality system for phones).
 const phoneContext=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:390,height:844},deviceScaleFactor:3,storageState:await context.storageState()});
 const phone=await phoneContext.newPage();phone.on('pageerror',e=>errors.push(e.stack));
 await phone.goto(base+'/?bag=1');
 await phone.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s?.dataset.engine==='ready'&&s.dataset.phase==='open';},null,{timeout:40000});
 await phone.locator(`[data-physical-disc="${buzzz}"]`).evaluate(n=>n.click());
 await phone.waitForFunction(()=>{const s=document.querySelector('#bagScene');return !s.querySelector('[data-bag-canvas]').bagViewer.stage.moving&&s.dataset.staging==='still';},null,{timeout:20000});
 await phone.waitForFunction(key=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().find(d=>d.key===key).photo?.size===256,buzzz,{timeout:20000});
 const grown=await phone.locator('[data-bag-canvas]').evaluate((n,key)=>{const v=n.bagViewer,s=v.getBagLayoutState().find(d=>d.key===key);
  return {look:s.look,photo:s.photo,shown:s.shown,width:v.discScreenRect(key,{rim:true}).width,pixelRatio:v.renderer.pixelRatio,dpr:devicePixelRatio,sizing:v.stage.phoneSizing};},buzzz);
 metrics.phone=grown;
 assert.equal(grown.dpr,3);
 assert.ok(grown.sizing&&!grown.sizing.original&&grown.width>grown.sizing.today+5,`the phone disc grew (${grown.width.toFixed(1)} px from ${grown.sizing?.today.toFixed(1)})`);
 assert.equal(grown.look,'bag','phone pulled discs stay under the detail-look size');
 assert.deepEqual(grown.photo,{size:256,relief:false},'the bag photo tier');
 assert.ok(grown.width*grown.dpr<=256,`256 px covers the grown disc's ${(grown.width*grown.dpr).toFixed(0)} device px`);
 // Upright and still on the phone too: the fixture's bar, second disc out.
 await phone.locator(`[data-physical-disc="${destroyer}"]`).evaluate(n=>n.click());
 await phone.waitForFunction(()=>{const s=document.querySelector('#bagScene');return !s.querySelector('[data-bag-canvas]').bagViewer.stage.moving&&s.dataset.staging==='still';},null,{timeout:20000});
 await phone.waitForFunction(key=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().find(d=>d.key===key).photo?.size===256,destroyer,{timeout:20000});
 await phone.mouse.move(2,2);await phone.waitForTimeout(300);
 const phoneAngles=[];
 for(const wait of [0,700,1400]){
  await phone.waitForTimeout(wait&&700);
  const m=await phone.locator('[data-bag-canvas]').evaluate((n,key)=>{const c=n.getBoundingClientRect(),r=n.bagViewer.discScreenRect(key,{rim:true});return {disc:{left:c.left+r.left,top:c.top+r.top,width:r.width,height:r.height}};},destroyer);
  const stamp=await stampAngle(m,wait?null:`${dir}/upright-phone.png`,phone);
  assert.ok(stamp.dark>200&&stamp.blueAbove,'the fixture stamp is found on the phone');
  phoneAngles.push(stamp.angle);
 }
 metrics.phoneUpright=phoneAngles;
 assert.ok(phoneAngles.every(a=>Math.abs(a)<.5),`phone stamp upright (${phoneAngles.map(a=>a.toFixed(3)).join('/')}°)`);
 assert.ok(Math.max(...phoneAngles)-Math.min(...phoneAngles)<.2,'and still across the float');
 await phoneContext.close();
 assert.deepEqual(errors,[]);
 fs.writeFileSync(`${dir}/metrics.json`,JSON.stringify(metrics,null,2));
 console.log(`ok - pulled discs: viewer quality by size (1024/512/256, ×${one.pixelRatio}), stamp upright (${control.angle.toFixed(2)}° before, ${angles.map(a=>a.toFixed(3)).join('/')}° after)`);
}finally{await browser?.close();server.kill();}
