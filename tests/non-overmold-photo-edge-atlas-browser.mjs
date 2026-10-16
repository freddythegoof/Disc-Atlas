// Non-overmold photo discs reach the edge in the atlas's top-down renders too (Oct 16): the My Bag list
// thumbnails and My Map's photo discs (atlas-art.mjs) draw a one-piece disc's photo over the shoulder to the
// nose, where they used to stop at the shoulder and leave a ring of plate-colour plastic. Overmolds stay as they were.
//
// Fixtures, uploaded through the real editor on a local Wrangler + D1 (as in non-overmold-photo-edge-browser.mjs):
//   stamp  Wraith, a full-front "30" stamp: diagonal stripes and the numerals run to the physical edge.
//   pixel  Pixel (overmold control): orange plate to the seam, a dark rim piece outside it.
// Each is read from the list thumbnail's canvas and from its My Map marker's canvas, first with the pre-fix
// atlas-art.mjs (EDGE_ATLAS_BASE, served in place of the working copy), then with the working copy, so
// before and after come from one run and one GPU. It also times a photo disc's atlas render both ways.
// EDGE_BEFORE=0 skips the before half.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const config='tests/auth.wrangler.jsonc',state='work/non-overmold-photo-edge-atlas/local',base='https://localhost:8842',dir='outputs/non-overmold-photo-edge-atlas';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js';
fs.mkdirSync(dir,{recursive:true});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8842','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='',browser;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>output+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const before=process.env.EDGE_BEFORE==='0'?null:execFileSync('git',['show',(process.env.EDGE_ATLAS_BASE||'500dae4')+':public/disc3d/atlas-art.mjs'],{encoding:'utf8'});
const metrics={};
try{
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,200));}
 // A real GPU: the atlas art refuses software WebGL and keeps its 2D orbs.
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.env.BAG3D_CHROMIUM_ARGS?.split(' ')||['--use-angle=d3d11','--enable-gpu']});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000},deviceScaleFactor:2}),errors=[];
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 // Rings of a canvas whose disc spans all but a pixel at each edge (the atlas art's `fill`): mean colour,
 // and how often the brightness crosses its own mean around the ring (plain plastic ~0, the stripes dozens).
 await context.addInitScript(()=>{window.__rings=canvas=>{
  const px=canvas.width,d=canvas.getContext('2d').getImageData(0,0,px,px).data,c=px/2,R=(px-2)/2,out={};
  for(const f of [.6,.75,.8,.85,.88,.91,.94,.97]){
   const samples=[];for(let i=0;i<720;i++){const a=i/720*Math.PI*2,x=Math.floor(c+Math.cos(a)*R*f),y=Math.floor(c+Math.sin(a)*R*f),k=4*(y*px+x);samples.push([d[k],d[k+1],d[k+2]]);}
   const luma=samples.map(([r,g,b])=>.2126*r+.7152*g+.0722*b),mean=luma.reduce((a,b)=>a+b)/luma.length;
   let crossings=0,side=0;for(const l of luma){const s=l>mean+18?1:l<mean-18?-1:0;if(s&&side&&s!==side)crossings++;if(s)side=s;}
   const rgb=[0,1,2].map(ch=>Math.round(samples.reduce((a,s)=>a+s[ch],0)/samples.length));
   out[f]={rgb:'#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join(''),crossings,spread:Math.round(Math.max(...luma)-Math.min(...luma))};
  }
  return out;
 };});
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

 // The photos as a phone would frame them: the disc at the editor's default crop (0.94 of the frame) on a
 // dark table. Ri/R is the Pixel's own seam, so its rim fills exactly the rim piece.
 const COLORS={stripeA:'#f2c230',stripeB:'#1d3f8f',orange:'#b45a28',rim:'#101418'};
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
   pixel:await png(g=>{
    g.fillStyle=C.rim;g.fillRect(0,0,n,n);g.fillStyle=C.orange;g.beginPath();g.arc(c,c,r*Ri/R,0,Math.PI*2);g.fill();
    g.fillStyle='#111';g.fillRect(c-24,c-200,48,400);
   }),
  };
 },COLORS);
 const add=async(name,photo)=>{
  await page.evaluate(name=>{const d=discs.find(d=>d.name===name&&/Innova|Axiom/.test(d.manufacturer));if(!d)throw Error('Missing mold '+name);return BagApp.add(d,null,'bag');},name);
  await page.locator('#addDiscDialog').waitFor();
  await page.locator('.bag-photo-file').setInputFiles(photo);await page.locator('.photo-aligner[open]').waitFor();await page.locator('.photo-aligner [data-aligner-confirm]').click();await page.locator('.photo-aligner').waitFor({state:'hidden'});await page.locator('.bag-photo-thumb img').waitFor();
  await page.locator('#saveDisc').click();
  await page.locator('#addDiscDialog').waitFor({state:'hidden'}).catch(async e=>{await page.screenshot({path:`${dir}/failure-add.png`});throw Error(e.message+' | Dialog: '+await page.locator('#addDiscDialog').innerText());});
 };
 const CASES=[['stamp','Wraith'],['pixel','Pixel']];
 for(const [k,mold] of CASES)await add(mold,{name:k+'.png',mimeType:'image/png',buffer:Buffer.from(fixtures[k])});
 const data=await (await page.request.get(base+'/api/bag')).json();
 assert.equal(data.discs.length,2);
 const ids={},molds={},photos={};
 data.discs.forEach((d,i)=>{const k=CASES[i][0];ids[k]=d.id;molds[k]=d.mold_id;});
 metrics.stored=Object.fromEntries(data.discs.map((d,i)=>[CASES[i][0],{mold_id:d.mold_id,photo_rim_color:d.photo_rim_color,rim_color:d.rim_color,color:d.color}]));
 // Product law: classification is the catalog's, never the photo's.
 assert.equal(metrics.stored.stamp.photo_rim_color,null);assert.ok(metrics.stored.pixel.photo_rim_color,'the Pixel samples its rim');

 // The atlas art's finished (not placeholder) image of this photo, at any level, has been drawn.
 const finished=url=>page.waitForFunction(async url=>{const art=await (await import('/disc3d/atlas-art.mjs')).getAtlasArt();return [...art.debug.images.keys()].some(k=>k.endsWith('|'+url));},url,{timeout:20000});
 const save=async(handle,file)=>{
  const out=await handle.evaluate(canvas=>{
   // Three times up, nearest neighbour, so the docs show the pixels the list and map draw.
   const big=document.createElement('canvas');big.width=big.height=canvas.width*3;const g=big.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(canvas,0,0,big.width,big.height);
   return {raw:canvas.toDataURL('image/png'),big:big.toDataURL('image/png'),px:canvas.width,rings:window.__rings(canvas)};
  });
  fs.writeFileSync(`${dir}/${file}.png`,Buffer.from(out.raw.split(',')[1],'base64'));fs.writeFileSync(`${dir}/${file}-3x.png`,Buffer.from(out.big.split(',')[1],'base64'));
  return {px:out.px,rings:out.rings};
 };
 const surfaces=async label=>{
  const result={};
  // My Bag list: the row's thumbnail canvas (a copy of the atlas art's image, 62 px on screen).
  await page.goto(base+'/?bag=1');await page.locator(`[data-bag-edit="${ids.stamp}"]`).waitFor();
  for(const [k] of CASES){
   const host=page.locator(`[data-disc-id="${ids[k]}"] [data-disc-thumbnail]`).first();
   await host.scrollIntoViewIfNeeded();photos[k]=await host.getAttribute('data-photo-url');assert.ok(photos[k],k+': the row has its photo');
   await finished(photos[k]);
   // The finished image lands on the row on its next frame.
   await page.waitForFunction(host=>host.classList.contains('has-3d')&&host.querySelector('canvas'),await host.elementHandle());await page.waitForTimeout(500);
   await host.screenshot({path:`${dir}/${label}-${k}-thumb-row.png`});
   result[k]={thumb:await save(await host.locator('canvas').elementHandle(),`${label}-${k}-thumb`)};
  }
  // My Map: the marker's art canvas is the atlas art's own image of the disc, at the full level.
  await page.getByRole('radio',{name:'My Map'}).click();
  await page.waitForFunction(()=>myMap&&document.querySelector('#mapWrap').closest('#myMapHost'));
  await page.waitForFunction(()=>!cameraTween&&groupCache?.items===filtered&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));
  for(const [k] of CASES){
   const marker=page.locator(`#mapMarkers .atlas-marker[data-cluster="${molds[k]}"]`);
   await page.waitForFunction(async ({mold,url})=>{
    const art=await (await import('/disc3d/atlas-art.mjs')).getAtlasArt(),canvas=document.querySelector(`#mapMarkers .atlas-marker[data-cluster="${mold}"] canvas.disc-art-3d`);
    return !!canvas&&[...art.debug.images].some(([key,e])=>e.canvas===canvas&&key.endsWith('|'+url));
   },{mold:molds[k],url:photos[k]},{timeout:20000});
   await page.waitForTimeout(300);
   const box=await marker.locator('.disc-art').first().boundingBox();
   await page.screenshot({path:`${dir}/${label}-${k}-mymap.png`,clip:{x:box.x-14,y:box.y-14,width:box.width+28,height:box.height+28}});
   result[k].map=await save(await marker.locator('canvas.disc-art-3d').elementHandle(),`${label}-${k}-mymap-art`);
  }
  await page.locator('#myMapPanel').screenshot({path:`${dir}/${label}-mymap-panel.png`});
  // Cost: a fresh art context draws the Wraith's photo at the full level 60 times (a new plate colour
  // each, so none is a cache hit), after a warm-up pass once the photo has loaded. Mean ms per render,
  // readback into its image included (that is what the atlas pays per disc).
  result.cost=await page.evaluate(async ({mold,url})=>{
   const {createAtlasArt}=await import('/disc3d/atlas-art.mjs'),{photoGeometry}=await import('/disc3d/photo.mjs');
   const art=await createAtlasArt({dpr:2}),d={...discs.find(d=>d.id===mold),photoURL:url},plain=discs.find(d=>d.id===mold);
   art.render(d,'#808080',94);
   for(let i=0;i<200&&!art.has(d,'#808080',94);i++){await new Promise(r=>setTimeout(r,50));art.render(d,'#808080',94);}
   // Each pass its own colours: a colour drawn before is a cache hit.
   let pass=0;const time=disc=>{const base=0x204060+0x100000*pass++,t=performance.now();for(let i=0;i<60;i++)art.render(disc,'#'+(base+i*0x000203).toString(16),94);return +((performance.now()-t)/60).toFixed(3);};
   time(d);time(plain);
   const out={photo:time(d),plain:time(plain),overmold:art.debug.shapeOf(d).overmold,triangles:{edge:photoGeometry(art.debug.shapeOf(d).shape,{edge:true}).index.count/3,shoulder:photoGeometry(art.debug.shapeOf(d).shape).index.count/3}};
   art.dispose();return out;
  },{mold:molds.stamp,url:photos.stamp});
  result.overmold=await page.evaluate(async m=>{const art=await (await import('/disc3d/atlas-art.mjs')).getAtlasArt();return Object.fromEntries(Object.entries(m).map(([k,id])=>[k,art.debug.shapeOf(discs.find(d=>d.id===id)).overmold]));},molds);
  return result;
 };
 // Two saved canvases: the largest channel difference and how many pixels moved at all.
 const diff=(a,b)=>page.evaluate(async([a,b])=>{
  const read=async b64=>{const img=await createImageBitmap(await (await fetch('data:image/png;base64,'+b64)).blob()),c=new OffscreenCanvas(img.width,img.height),g=c.getContext('2d');g.drawImage(img,0,0);return {w:img.width,h:img.height,d:g.getImageData(0,0,img.width,img.height).data};};
  const x=await read(a),y=await read(b);if(x.w!==y.w||x.h!==y.h)return {size:[x.w,x.h,y.w,y.h]};
  let max=0,moved=0,over8=0;for(let i=0;i<x.d.length;i+=4){const m=Math.max(...[0,1,2,3].map(c=>Math.abs(x.d[i+c]-y.d[i+c])));if(m){moved++;max=Math.max(max,m);}if(m>8)over8++;}
  return {max,moved,over8,pixels:x.w*x.h};
 },[a,b].map(f=>fs.readFileSync(f).toString('base64')));

 if(before){
  await page.route('**/disc3d/atlas-art.mjs',route=>route.fulfill({status:200,contentType:'text/javascript',body:before}));
  metrics.before=await surfaces('before');
  await page.unroute('**/disc3d/atlas-art.mjs');
 }
 const label=before?'after':'current',after=metrics.after=await surfaces(label);
 if(before){
  metrics.pixelDiff={};
  for(const k of ['stamp','pixel'])for(const s of ['thumb','mymap-art'])metrics.pixelDiff[k+'-'+s]=await diff(`${dir}/before-${k}-${s}.png`,`${dir}/after-${k}-${s}.png`);
 }
 fs.writeFileSync(`${dir}/metrics.json`,JSON.stringify(metrics,null,2));
 const ring=(m,f)=>m.rings[f],OUTER=[.88,.91,.94,.97];
 assert.deepEqual(after.overmold,{stamp:false,pixel:true},'the catalog classifies: Wraith one piece, Pixel overmold');
 // The stamp's stripes keep crossing the shoulder's rings out to the nose, in the thumbnail and on My Map.
 for(const s of ['thumb','map'])for(const f of OUTER)assert.ok(ring(after.stamp[s],f).crossings>=12,`stamp ${s}: stripes reach ${f} R (${JSON.stringify(ring(after.stamp[s],f))})`);
 if(before){
  // Plain plastic: at most the key light's one highlight arc on the shoulder (two crossings).
  for(const s of ['thumb','map'])for(const f of OUTER)assert.ok(ring(metrics.before.stamp[s],f).crossings<=2,`the before half reproduces the plain ring (${s} ${f} R: ${JSON.stringify(ring(metrics.before.stamp[s],f))})`);
  // The Pixel draws the same before and after: GPU canvases are not pixel-deterministic, so a hair of tolerance.
  for(const s of ['thumb','mymap-art']){const d=metrics.pixelDiff['pixel-'+s];assert.ok(!d.size&&d.over8<=d.pixels*.002,`pixel ${s}: unchanged (${JSON.stringify(d)})`);}
  for(const s of ['thumb','map'])for(const f of [.6,.8,.88,.94])assert.equal(ring(after.pixel[s],f).rgb,ring(metrics.before.pixel[s],f).rgb,`pixel ${s} ${f} R reads the same`);
 }
 assert.deepEqual(errors,[]);
 const cost=r=>`${r.cost.photo} ms photo / ${r.cost.plain} ms plain`;
 console.log(`ok - atlas photos run to the nose: stamp thumb ${OUTER.map(f=>ring(after.stamp.thumb,f).crossings).join('/')}, My Map ${OUTER.map(f=>ring(after.stamp.map,f).crossings).join('/')} crossings at ${OUTER.join('/')} R${before?` (before ${OUTER.map(f=>ring(metrics.before.stamp.thumb,f).crossings).join('/')})`:''}; Pixel ${before?'thumb max diff '+metrics.pixelDiff['pixel-thumb'].max+', map max diff '+metrics.pixelDiff['pixel-mymap-art'].max:'overmold'}; render ${before?'before '+cost(metrics.before)+', after ':''}${cost(after)}; photo mesh ${after.cost.triangles.shoulder} -> ${after.cost.triangles.edge} triangles`);
}finally{await browser?.close();server.kill();}
