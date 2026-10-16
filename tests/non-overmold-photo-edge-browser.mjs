// Non-overmold photo discs reach the edge (Oct 16): a one-piece disc's photo carries its own pixels out over
// the shoulder to the nose, where the face used to stop at the shoulder and leave a ring of flat plate-colour
// plastic that read as an added rim. Overmolds still stop at the seam, byte for byte.
//
// Fixtures for Freddy's two cases plus a control, uploaded through the real editor on a local Wrangler + D1:
//   stamp  Wraith, a full-front "30" stamp: diagonal stripes and the numerals run to the physical edge.
//   halo   Wraith, Halo-style purple: a pale band in the plastic from 0.80 R to the edge, in the photo.
//   pixel  Pixel (overmold control): orange plate to the seam, a dark rim piece outside it.
// Each runs in the detail panel (top and 3/4), My Bag pulled, and Storage pulled, first on the pre-fix photo.mjs
// (EDGE_BASE, the merge before the fix; served in place of the working copy), then on the working copy, so
// before and after come from one run and one GPU. EDGE_BEFORE=0 skips the before half.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const config='tests/auth.wrangler.jsonc',state='work/non-overmold-photo-edge/local',base='https://localhost:8841',dir='outputs/non-overmold-photo-edge';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8841','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='',browser;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>output+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const before=process.env.EDGE_BEFORE==='0'?null:execFileSync('git',['show',(process.env.EDGE_BASE||'0dedf8a')+':public/disc3d/photo.mjs'],{encoding:'utf8'});
const metrics={};
try{
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.env.BAG3D_CHROMIUM_ARGS?.split(' ')||['--use-angle=d3d11','--enable-gpu']});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}}),errors=[];
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

 // The three photos, as a phone would frame them: the disc at the editor's default crop (0.94 of the frame)
 // on a dark table. Ri/R is the Pixel's own seam, so its rim fills exactly the rim piece.
 const COLORS={stripeA:'#f2c230',stripeB:'#1d3f8f',purple:'#5b2a86',band:'#e9c8f7',orange:'#b45a28',rim:'#101418'};
 const fixtures=await page.evaluate(async C=>{
  const {shapeForDisc,shapeFrame}=await import('/disc3d/shape.mjs');
  const pixel=discs.find(d=>d.name==='Pixel'),{shape}=shapeForDisc({model:pixel.model3d,specs:pixel.specs,flight:{speed:pixel.speed,turn:pixel.turn,fade:pixel.fade}}),{R,Ri}=shapeFrame(shape);
  const n=1024,c=n/2,r=n*.47,png=async draw=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=n;const g=canvas.getContext('2d');
   g.fillStyle='#2a2d33';g.fillRect(0,0,n,n);g.save();g.beginPath();g.arc(c,c,r,0,Math.PI*2);g.clip();draw(g);g.restore();
   return [...new Uint8Array(await (await new Promise(res=>canvas.toBlob(res,'image/png'))).arrayBuffer())];};
  return {
   stamp:await png(g=>{
    g.fillStyle=C.stripeA;g.fillRect(0,0,n,n);g.fillStyle=C.stripeB;
    g.save();g.translate(c,c);g.rotate(Math.PI/4);for(let x=-n;x<n;x+=72)g.fillRect(x,-n,36,2*n);g.restore();
    g.font='900 560px Arial Black, Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=28;g.strokeStyle='#111';g.strokeText('30',c,c+30);g.fillStyle='#fff';g.fillText('30',c,c+30);
   }),
   halo:await png(g=>{
    const ring=g.createRadialGradient(c,c,0,c,c,r);ring.addColorStop(0,C.purple);ring.addColorStop(.78,C.purple);ring.addColorStop(.84,C.band);ring.addColorStop(1,C.band);
    g.fillStyle=ring;g.fillRect(0,0,n,n);g.fillStyle='#d8b04a';g.font='700 64px Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('WRAITH',c,c);
   }),
   pixel:await png(g=>{
    g.fillStyle=C.rim;g.fillRect(0,0,n,n);g.fillStyle=C.orange;g.beginPath();g.arc(c,c,r*Ri/R,0,Math.PI*2);g.fill();
    g.fillStyle='#111';g.fillRect(c-24,c-200,48,400);
   }),
   seam:Ri/R,
  };
 },COLORS);
 for(const k of ['stamp','halo','pixel'])fs.writeFileSync(`${dir}/fixture-${k}.png`,Buffer.from(fixtures[k]));
 const add=async(name,photo,destination)=>{
  await page.evaluate(({name,destination})=>{const d=discs.find(d=>d.name===name&&/Innova|Axiom/.test(d.manufacturer));if(!d)throw Error('Missing mold '+name);return BagApp.add(d,null,destination);},{name,destination});
  await page.locator('#addDiscDialog').waitFor();
  await page.locator('.bag-photo-file').setInputFiles(photo);await page.locator('.photo-aligner[open]').waitFor();await page.locator('.photo-aligner [data-aligner-confirm]').click();await page.locator('.photo-aligner').waitFor({state:'hidden'});await page.locator('.bag-photo-thumb img').waitFor();
  await page.locator('#saveDisc').click();
  await page.locator('#addDiscDialog').waitFor({state:'hidden'}).catch(async e=>{await page.screenshot({path:`${dir}/failure-add.png`});throw Error(e.message+' | Dialog: '+await page.locator('#addDiscDialog').innerText());});
 };
 const CASES=[['stamp','Wraith'],['halo','Wraith'],['pixel','Pixel']];
 for(const destination of ['bag','storage'])for(const [k,mold] of CASES)await add(mold,{name:k+'.png',mimeType:'image/png',buffer:Buffer.from(fixtures[k])},destination);
 const data=await (await page.request.get(base+'/api/bag')).json();
 assert.equal(data.discs.length,6);
 const ids={bag:{},storage:{}};data.discs.forEach((d,i)=>{ids[i<3?'bag':'storage'][CASES[i%3][0]]=d.id;});
 // Product law: classification is the catalog's, never the photo's. No rim sample on the Wraiths.
 const stored=Object.fromEntries(data.discs.map((d,i)=>[(i<3?'bag-':'storage-')+CASES[i%3][0],{in_bag:d.in_bag,photo_rim_color:d.photo_rim_color,rim_color:d.rim_color,color:d.color}]));
 metrics.stored=stored;
 for(const where of ['bag','storage']){assert.equal(stored[where+'-stamp'].photo_rim_color,null);assert.equal(stored[where+'-halo'].photo_rim_color,null);assert.ok(stored[where+'-pixel'].photo_rim_color,'the Pixel samples its rim');}

 // Rings of a screenshot around a known centre: mean colour, and how often the brightness crosses its own
 // mean around the ring (a plain plastic ring crosses ~0 times; the stamp's stripes dozens).
 const rings=(png,{cx,cy,R},on=page)=>on.evaluate(async({b64,cx,cy,R})=>{
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
    const geometry=v.debug.photo.geometry,g=geometry.attributes.position;let reach=0;for(let i=0;i<g.count;i++)reach=Math.max(reach,Math.hypot(g.getX(i),g.getZ(i)));
    // FNV-1a over the photo mesh's bytes: the same hash before and after is the same geometry.
    let hash=0x811c9dc5;for(const array of [g.array,geometry.attributes.uv.array,geometry.attributes.normal.array,geometry.index.array])for(const byte of new Uint8Array(array.buffer,array.byteOffset,array.byteLength))hash=Math.imul(hash^byte,16777619)>>>0;
    // Frame cost: 120 forced frames, closed by a pixel read so the GPU work is inside the timing.
    const gl=v.debug.renderer.getContext(),px=new Uint8Array(4);v.debug.renderNow();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);
    const t0=performance.now();for(let i=0;i<120;i++)v.debug.renderNow();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);const ms=(performance.now()-t0)/120;
    return {clip:{x:rect.left+l-6,y:rect.top+t-6,width:r-l+12,height:b-t+12},R:(r-l)/2,photoReach:reach/v.state.radius,hash:hash.toString(16),triangles:geometry.index.count/3,ms,overmold:v.state.overmold,multi:Array.isArray(v.debug.body.material),rim:v.state.overmold?'#'+v.debug.rimMaterial.color.getHexString():null};
   });
   await page.waitForTimeout(150);
   const png=await page.screenshot({clip:top.clip,path:`${dir}/${label}-${k}-panel-top.png`});
   result[k]={panel:{photoReach:+top.photoReach.toFixed(4),hash:top.hash,triangles:top.triangles,frameMs:+top.ms.toFixed(3),overmold:top.overmold,multi:top.multi,rim:top.rim,rings:await rings(png,{cx:top.clip.width/2,cy:top.clip.height/2,R:top.R})}};
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
 // Two screenshots of one surface: the largest channel difference and how many pixels moved at all.
 const diff=(a,b)=>page.evaluate(async([a,b])=>{
  const read=async b64=>{const img=await createImageBitmap(await (await fetch('data:image/png;base64,'+b64)).blob()),c=new OffscreenCanvas(img.width,img.height),g=c.getContext('2d');g.drawImage(img,0,0);return {w:img.width,h:img.height,d:g.getImageData(0,0,img.width,img.height).data};};
  const x=await read(a),y=await read(b);if(x.w!==y.w||x.h!==y.h)return {size:[x.w,x.h,y.w,y.h]};
  let max=0,moved=0,over8=0;for(let i=0;i<x.d.length;i+=4){const m=Math.max(...[0,1,2].map(c=>Math.abs(x.d[i+c]-y.d[i+c])));if(m){moved++;max=Math.max(max,m);}if(m>8)over8++;}
  return {max,moved,over8,pixels:x.w*x.h};
 },[a,b].map(f=>fs.readFileSync(f).toString('base64')));

 if(before){
  await page.route('**/disc3d/photo.mjs',route=>route.fulfill({status:200,contentType:'text/javascript',body:before}));
  metrics.before=await surfaces('before');
  await page.unroute('**/disc3d/photo.mjs');
 }
 const label=before?'after':'current',after=metrics.after=await surfaces(label);
 if(before){
  metrics.pixelDiff={};
  for(const k of ['stamp','halo','pixel'])for(const s of ['panel-angle','panel-top','bag-pulled','storage-pulled'])metrics.pixelDiff[k+'-'+s]=await diff(`${dir}/before-${k}-${s}.png`,`${dir}/after-${k}-${s}.png`);
 }
 fs.writeFileSync(`${dir}/metrics.json`,JSON.stringify(metrics,null,2));
 const ring=(m,f)=>m.rings[f],channels=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)),OUTER=[.88,.91,.94,.97];
 for(const k of ['stamp','halo']){
  const p=after[k].panel;
  assert.deepEqual([p.overmold,p.multi,p.rim],[false,false,null],`${k}: a Wraith stays one piece, one material`);
  assert.ok(p.photoReach>=1&&p.photoReach<1.003,`${k}: the photo reaches the nose (${p.photoReach} R)`);
  assert.equal(after[k].bag.overmold,false);
 }
 // (a) The stamp's stripes keep crossing every outer ring, on the panel and the pulled bag disc.
 for(const s of ['panel','bag'])for(const f of OUTER)assert.ok(ring(after.stamp[s],f).crossings>=20,`stamp ${s}: stripes reach ${f} R (${JSON.stringify(ring(after.stamp[s],f))})`);
 // (b) The outer rings are the photo's own pale band, not the plate's purple.
 for(const s of ['panel','bag'])for(const f of OUTER)assert.ok(Math.min(...channels(ring(after.halo[s],f).rgb))>=0xc8,`halo ${s}: the band at ${f} R is the photo's (${ring(after.halo[s],f).rgb})`);
 // Control: the Pixel's photo stops at its seam and its rim piece keeps its sampled colour.
 const pix=after.pixel.panel;
 assert.deepEqual([pix.overmold,pix.multi,pix.rim],[true,true,'#101418']);
 assert.ok(Math.abs(pix.photoReach-fixtures.seam)<1e-3,`the Pixel's photo stops at the seam (${pix.photoReach} R, seam ${fixtures.seam.toFixed(4)})`);
 if(before){
  for(const k of ['stamp','halo'])assert.ok(Math.abs(metrics.before[k].panel.photoReach-.8274)<1e-3,`${k} before: stopped at the shoulder`);
  for(const f of OUTER)assert.equal(ring(metrics.before.stamp.panel,f).crossings,0,'the before half reproduces the plain ring');
  assert.equal(metrics.before.pixel.panel.hash,pix.hash,'the Pixel photo mesh is byte-identical');
  assert.deepEqual(metrics.before.pixel.panel.rings,pix.rings,'and its rings read the same');
  assert.equal(metrics.before.pixel.panel.rim,pix.rim);
  // The Pixel draws the same before and after; the rack is never quite still (its lights and hover settle on
  // their own clock), so every surface gets a hair of tolerance and the bytes are reported.
  for(const s of ['panel-angle','panel-top','bag-pulled','storage-pulled']){const d=metrics.pixelDiff['pixel-'+s];assert.ok(!d.size&&d.over8<=d.pixels*.002,`pixel ${s}: unchanged (${JSON.stringify(d)})`);}
 }
 assert.deepEqual(errors,[]);
 console.log(`ok - one-piece photos run to the nose: stamp stripes ${OUTER.map(f=>ring(after.stamp.panel,f).crossings).join('/')} crossings at ${OUTER.join('/')} R, halo band ${ring(after.halo.panel,.94).rgb}; Pixel ${before?'byte-identical mesh, '+['panel-angle','bag-pulled'].map(s=>s+' max diff '+metrics.pixelDiff['pixel-'+s].max).join(', '):'stops at its seam'}; frame ${['stamp','pixel'].map(k=>k+' '+after[k].panel.frameMs+' ms').join(', ')}`);
}finally{await browser?.close();server.kill();}
