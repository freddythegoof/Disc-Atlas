// Photos stop at the shoulder in the atlas's top-down renders too (Oct 16 revert, docs/photo-edge-revert.md):
// the My Bag list thumbnails and My Map's photo discs (atlas-art.mjs) draw a one-piece disc's photo inside the
// shoulder cut, the same photo mesh as every other surface; overmolds stop at the seam.
//
// Cases (tests/photo-edge-shared.mjs): stamp, wraith and clean (one piece), pixel (overmold), uploaded through
// the real editor on a local Wrangler + D1, each read from the list thumbnail's canvas and its My Map marker's
// canvas. It also times a photo disc's atlas render.
//
// EDGE_REFERENCE=<built checkout> draws every surface through that tree first, then through this one, in one run
// on one GPU, and requires the same pixels (GPU tolerance). EDGE_REFERENCE_SAME=0 only records the comparison.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {caseList,addDisc,referenceTree,pixelDiff} from './photo-edge-shared.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const config='tests/auth.wrangler.jsonc',state='work/non-overmold-photo-edge-atlas/local',base='https://localhost:8842',dir='outputs/photo-edge-atlas';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js',SAME=process.env.EDGE_REFERENCE_SAME!=='0';
fs.mkdirSync(dir,{recursive:true});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8842','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='',browser;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>output+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const metrics={};
try{
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,200));}
 // A real GPU: the atlas art refuses software WebGL and keeps its 2D orbs.
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.env.BAG3D_CHROMIUM_ARGS?.split(' ')||['--use-angle=d3d11','--enable-gpu']});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000},deviceScaleFactor:2}),errors=[];
 const reference=await referenceTree(context,base);
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

 const {cases:CASES}=await caseList(page,['stamp','wraith','clean','pixel']);
 for(const [,c] of CASES)await addDisc(page,dir,c,'bag');
 const data=await (await page.request.get(base+'/api/bag')).json();
 assert.equal(data.discs.length,CASES.length);
 const ids={},molds={},photos={};
 data.discs.forEach((d,i)=>{const k=CASES[i][0];ids[k]=d.id;molds[k]=d.mold_id;});
 metrics.stored=Object.fromEntries(data.discs.map((d,i)=>[CASES[i][0],{mold_id:d.mold_id,photo_rim_color:d.photo_rim_color,rim_color:d.rim_color,color:d.color}]));
 // Product law: classification is the catalog's, never the photo's.
 for(const [k] of CASES){if(k==='pixel')assert.ok(metrics.stored.pixel.photo_rim_color,'the Pixel samples its rim');else assert.equal(metrics.stored[k].photo_rim_color,null);}
 // Two cases share a mold (stamp and wraith are both Wraiths) and My Map draws one marker per mold, wearing one of
 // its photos: the map half reads each marker as the case whose photo it wears.
 const markers=[...new Set(Object.values(molds))],onMap=[];

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
  for(const mold of markers){
   const marker=page.locator(`#mapMarkers .atlas-marker[data-cluster="${mold}"]`),mine=CASES.map(([k])=>k).filter(k=>molds[k]===mold);
   const url=await (await page.waitForFunction(async urls=>{
    const art=await (await import('/disc3d/atlas-art.mjs')).getAtlasArt(),canvas=document.querySelector(`#mapMarkers .atlas-marker[data-cluster="${urls.mold}"] canvas.disc-art-3d`);
    const hit=canvas&&[...art.debug.images].find(([key,e])=>e.canvas===canvas&&urls.list.some(u=>key.endsWith('|'+u)));
    return hit&&hit[0].slice(hit[0].lastIndexOf('|')+1);
   },{mold,list:mine.map(k=>photos[k])},{timeout:20000})).jsonValue(),k=mine.find(k=>photos[k]===url);
   if(!onMap.includes(k))onMap.push(k);
   await page.waitForTimeout(300);
   // A full marker draws its art in the disc stack; a depth-tier dot (the Thunderbird here) in the dot itself.
   const art=marker.locator('canvas.disc-art-3d').first(),box=await art.locator('..').boundingBox();
   await page.screenshot({path:`${dir}/${label}-${k}-mymap.png`,clip:{x:box.x-14,y:box.y-14,width:box.width+28,height:box.height+28}});
   result[k].map=await save(await art.elementHandle(),`${label}-${k}-mymap-art`);
  }
  await page.locator('#myMapPanel').screenshot({path:`${dir}/${label}-mymap-panel.png`});
  // Cost: a fresh art context draws the Wraith's photo at the full level 60 times (a new plate colour
  // each, so none is a cache hit), after a warm-up pass once the photo has loaded. Mean ms per render,
  // readback into its image included (that is what the atlas pays per disc).
  result.cost=await page.evaluate(async ({mold,url})=>{
   const {createAtlasArt}=await import('/disc3d/atlas-art.mjs');
   const art=await createAtlasArt({dpr:2}),d={...discs.find(d=>d.id===mold),photoURL:url},plain=discs.find(d=>d.id===mold);
   art.render(d,'#808080',94);
   for(let i=0;i<200&&!art.has(d,'#808080',94);i++){await new Promise(r=>setTimeout(r,50));art.render(d,'#808080',94);}
   // Each pass its own colours: a colour drawn before is a cache hit.
   let pass=0;const time=disc=>{const base=0x204060+0x100000*pass++,t=performance.now();for(let i=0;i<60;i++)art.render(disc,'#'+(base+i*0x000203).toString(16),94);return +((performance.now()-t)/60).toFixed(3);};
   time(d);time(plain);
   const out={photo:time(d),plain:time(plain),overmold:art.debug.shapeOf(d).overmold};
   art.dispose();return out;
  },{mold:molds.stamp,url:photos.stamp});
  result.overmold=await page.evaluate(async m=>{const art=await (await import('/disc3d/atlas-art.mjs')).getAtlasArt();return Object.fromEntries(Object.entries(m).map(([k,id])=>[k,art.debug.shapeOf(discs.find(d=>d.id===id)).overmold]));},molds);
  return result;
 };

 if(reference){
  reference.on=true;metrics.reference=await surfaces('reference');reference.on=false;
  metrics.referenceServed=reference.served;assert.ok(reference.served>0,'the reference tree answered the asset requests');
 }
 const label=reference?'current':'shoulder',now=metrics.current=await surfaces(label);
 if(reference){
  metrics.pixelDiff={};
  for(const [k] of CASES)for(const s of onMap.includes(k)?['thumb','mymap-art']:['thumb'])metrics.pixelDiff[k+'-'+s]=await pixelDiff(page,`${dir}/reference-${k}-${s}.png`,`${dir}/current-${k}-${s}.png`);
 }
 fs.writeFileSync(`${dir}/metrics.json`,JSON.stringify(metrics,null,2));
 const ring=(m,f)=>m.rings[f],OUTER=[.88,.91,.94,.97];
 assert.deepEqual(now.overmold,{stamp:false,wraith:false,clean:false,pixel:true},'the catalog classifies: Wraith and Thunderbird one piece, Pixel overmold');
 // The shoulder is generated plastic: the stamp's stripes stop inside it, in the thumbnail and on My Map
 // (at most the key light's one highlight arc, two crossings).
 assert.ok(onMap.includes('stamp'),`My Map's Wraith marker wears the stamp photo (${onMap})`);
 for(const s of ['thumb','map'])for(const f of OUTER)assert.ok(ring(now.stamp[s],f).crossings<=2,`stamp ${s}: plain plastic at ${f} R (${JSON.stringify(ring(now.stamp[s],f))})`);
 if(reference&&SAME){
  // GPU canvases are not pixel-deterministic, so a hair of tolerance.
  for(const [key,d] of Object.entries(metrics.pixelDiff))assert.ok(!d.size&&d.over8<=d.pixels*.002,`${key}: the same as the reference (${JSON.stringify(d)})`);
 }
 assert.deepEqual(errors,[]);
 const cost=r=>`${r.cost.photo} ms photo / ${r.cost.plain} ms plain`;
 console.log(`ok - atlas photos stop at the shoulder: stamp thumb ${OUTER.map(f=>ring(now.stamp.thumb,f).crossings).join('/')}, My Map ${OUTER.map(f=>ring(now.stamp.map,f).crossings).join('/')} crossings at ${OUTER.join('/')} R; render ${reference?'reference '+cost(metrics.reference)+', ':''}${cost(now)}${reference?'; vs reference max diff '+Object.entries(metrics.pixelDiff).map(([k,d])=>k+' '+d.max).join(', '):''}`);
}finally{await browser?.close();server.kill();}
