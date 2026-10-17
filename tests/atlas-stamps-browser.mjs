// Production GPU integration: official Atlas artwork, owner precedence, tiny tiers and cache isolation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir='docs/assets/atlas-stamps',baseSHA='6e53bc8b629c63ac04777fe8400609cfc23cb2f3';
fs.mkdirSync(dir,{recursive:true});
const originals=new Map(['disc3d/atlas-art.mjs','atlas-map.js'].map(p=>['/'+p,execFileSync('git',['show',baseSHA+':public/'+p],{maxBuffer:8e6})]));
let baseline=false,missing=false;const requests=[];
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://local'),p=url.pathname;
 requests.push(p);
 if(p==='/api/bag/discs/reference/photo'){res.setHeader('Content-Type','image/webp');res.end(fs.readFileSync('tests/fixtures/stamped-disc.webp'));return;}
 if(p.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{}');return;}
 if(missing&&p==='/stamps/discraft/buzzz.png'){res.statusCode=404;res.end();return;}
 const file=p==='/'?'web/index.html':'public'+p;
 if(file.includes('..')){res.statusCode=400;res.end();return;}
 try{res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.html':'text/html','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(baseline&&originals.has(p)?originals.get(p):fs.readFileSync(file));}catch{res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu']});
const result={},errors=[];
try{
 for(const phase of ['before','after']){
  baseline=phase==='before';
  const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.waitForFunction(()=>mapArt.state==='ready'&&discs.length>0);
  result[phase]=await page.evaluate(async()=>{
   const {createAtlasArt}=await import('/disc3d/atlas-art.mjs');
   const art=await createAtlasArt({dpr:2,maxBytes:64e6});
   const names=['Buzzz','Zone','Luna','Force','Photo Buzzz','Nuke'];
   const photoURL='/api/bag/discs/reference/photo?v=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.webp';
   const out={tiers:{},cost:{},catalogCount:discs.filter(d=>d.stampAsset).length};
   const hash=c=>{const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=2166136261;for(const v of data)h=Math.imul(h^v,16777619);return h>>>0;};
   const ready=async(d,size,official=true,color='#dcac60')=>{
    let e;for(let i=0;i<150;i++){e=art.render(d,color,size,undefined,undefined,official);if(!e.pending)break;await new Promise(r=>setTimeout(r,20));}
    if(e.pending)throw Error('Art did not finish: '+d.name+' '+size);
    return e;
   };
   for(const [tier,size] of [['full',94.24],['mid',51],['mini-readable',36],['tiny',12],['low-boundary',24]]){
    out.tiers[tier]={size,discs:{}};
    for(const name of names){
     const mold=name==='Photo Buzzz'?'Buzzz':name,source=discs.find(d=>d.brand==='Discraft'&&d.name===mold);
     if(!source)throw Error('Missing '+mold);
     const d=name==='Photo Buzzz'?{...source,photoURL}:source;
     const plain=await ready(d,size,false),entry=await ready(d,size,true);
     const entryAgain=await ready(d,size,true);
     out.tiers[tier].discs[name]={hash:hash(entry.canvas),bareHash:hash(plain.canvas),sameEntry:entry===entryAgain,lod:entry.lod,png:entry.canvas.toDataURL(),fill:entry.fill,asset:source.stampAsset||null};
    }
   }
   // Cache hits must not redraw; catalog asset/placement changes must not reuse stale art.
   const buz=discs.find(d=>d.brand==='Discraft'&&d.name==='Buzzz'),force=discs.find(d=>d.brand==='Discraft'&&d.name==='Force');
   const original=await ready(buz,94.24),renders=art.stats.renders;await ready(buz,94.24);
   out.cacheHitRenders=art.stats.renders-renders;
   const swapped=await ready({...buz,stampAsset:force.stampAsset,stampPlacement:force.stampPlacement},94.24);
   const scaled=await ready({...buz,stampPlacement:{...buz.stampPlacement,diameterFraction:buz.stampPlacement.diameterFraction*.7}},94.24);
   out.assetChangesPixels=hash(swapped.canvas)!==hash(original.canvas);out.placementChangesPixels=hash(scaled.canvas)!==hash(original.canvas);
   // Low requests may not borrow decorated full/mid cached stand-ins, even during a held zoom.
   const low=await ready(buz,12),lowBare=await ready(buz,12,false);
   out.lowCacheIsolation=hash(low.canvas)===hash(lowBare.canvas);
   const start=performance.now();for(let i=0;i<40;i++)await ready(buz,94.24,true,'#'+(0x603010+i*257).toString(16));
   out.cost.officialMs=(performance.now()-start)/40;
   const startPlain=performance.now();for(let i=0;i<40;i++)await ready(buz,94.24,false,'#'+(0x603010+i*257).toString(16));
   out.cost.bareMs=(performance.now()-startPlain)/40;
   out.bytes=art.stats.bytes;out.renders=art.stats.renders;
   art.dispose();return out;
  });
  // Exercise the production map call site, not just the additive renderer API.
  result[phase].map=await page.evaluate(async()=>{
   const buz=discs.find(d=>d.brand==='Discraft'&&d.name==='Buzzz'),color=discColor(buz);
   const out={};
   const hash=c=>{const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=2166136261;for(const v of data)h=Math.imul(h^v,16777619);return h>>>0;};
   for(const [tier,size] of [['full',94.24],['mid',51],['tiny',12]]){
    let actual;
    for(let i=0;i<100;i++){artDeadline=performance.now()+100;actual=discArt(buz,color,size);if(actual&&!actual.pending)break;await new Promise(r=>setTimeout(r,20));}
    const bare=atlasArt.render(buz,color,size,mapRimColor(buz));
    out[tier]={hash:hash(actual.canvas),bareHash:hash(bare.canvas)};
   }
   const originalMap=myMap,originalBag=window.BagApp;
   const url='/api/bag/discs/reference/photo?v=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.webp';
   // Finish the real async photo load before temporarily supplying the owner-map input.
   const prepared={...buz,photoURL:url};
   for(let i=0;i<100;i++){const e=atlasArt.render(prepared,color,94.24);if(!e.pending)break;await new Promise(r=>setTimeout(r,20));}
   try{
    myMap={shifts:new Map()};window.BagApp={...originalBag,mapPhotos:()=>new Map([[buz.id,url]])};
    const owned=photoDisc(buz);out.ownerURL=owned.photoURL;
    artDeadline=performance.now()+100;const actual=discArt(buz,color,94.24);
    const photo=atlasArt.render(owned,color,94.24,mapRimColor(buz));
    out.ownerPhotoWins=hash(actual.canvas)===hash(photo.canvas);
   }finally{myMap=originalMap;window.BagApp=originalBag;}
   return out;
  });
  await page.screenshot({path:dir+'/'+phase+'-atlas.png'});
  // Named controls in real markers at the largest camera tier, with existing labels intact.
  result[phase].markers={};
  for(const name of ['Buzzz','Zone','Luna','Force','Nuke']){
   await page.locator('#search').fill(name);
   await page.evaluate(name=>{
    const d=discs.find(d=>d.brand==='Discraft'&&d.name===name);selected=d;
    const area=AtlasLayout.bounds(mapViewport.width,mapViewport.height,true),p=shownPosition(d.id);
    zoom=9;pan={x:mapViewport.width/2-area.left-p.x*area.width*zoom,y:mapViewport.height/2-area.bottom+p.y*area.height*zoom};draw();
   },name);
   await page.waitForFunction(()=>!regrouping&&mapArt.pending===0&&groupCache.items===filtered);
   await page.waitForTimeout(300);
   const marker=page.locator('.atlas-marker.is-selected').first();
   await marker.waitFor();
   result[phase].markers[name]=await marker.evaluate(n=>({label:n.querySelector('.marker-name').textContent,canvas:!!n.querySelector('.disc-art-3d'),artWidth:n.querySelector('.disc-art').getBoundingClientRect().width,x:n.mapX,y:n.mapY}));
   const clip=await marker.evaluate(n=>{
    const a=n.querySelector('.disc-art').getBoundingClientRect(),b=n.querySelector('.marker-name').getBoundingClientRect(),pad=22;
    return {x:Math.min(a.left,b.left)-pad,y:Math.min(a.top,b.top)-pad,width:Math.max(a.right,b.right)-Math.min(a.left,b.left)+pad*2,height:Math.max(a.bottom,b.bottom)-Math.min(a.top,b.top)+pad*2};
   });
   await page.screenshot({path:dir+'/'+phase+'-'+name.toLowerCase()+'-atlas-full.png',clip});
  }
  await page.evaluate(()=>select(discs.find(d=>d.brand==='Discraft'&&d.name==='Nuke')));
  await page.waitForFunction(()=>Disc3D.viewer?.state.props?.mold==='Nuke');
  result[phase].nukeViewer=await page.evaluate(()=>({visible:Disc3D.viewer.debug.stamp.visible,asset:Disc3D.viewer.debug.stamp.material.map.userData.stampAsset||null,png:Disc3D.viewer.debug.stamp.material.map.image.toDataURL()}));
  await page.locator('#detail').screenshot({path:dir+'/'+phase+'-nuke-viewer.png'});
  await context.close();
 }
 // Proof sheets use the exact production image at each tier, at its native CSS size.
 const board=await browser.newPage({viewport:{width:1110,height:520}});
 for(const tier of Object.keys(result.after.tiers)){
  const size=result.after.tiers[tier].size;
  await board.setContent('<style>body{margin:0;background:#10141d;color:#eef1f6;font:14px system-ui}h1{font-size:22px;margin:24px}section{display:flex;align-items:center;height:180px;border-top:1px solid #303745}b{width:100px;margin-left:24px}figure{margin:0;width:155px;height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}figcaption{font-size:13px;color:#c5cbd5}img{object-fit:contain}</style><h1>Atlas '+tier+' · '+size+'px · production art at native size</h1>'+['before','after'].map(phase=>'<section><b>'+phase+'</b>'+Object.entries(result[phase].tiers[tier].discs).map(([name,d])=>'<figure><img width="'+size/d.fill+'" height="'+size/d.fill+'" src="'+d.png+'"><figcaption>'+name+'</figcaption></figure>').join('')+'</section>').join(''));
  await board.screenshot({path:dir+'/'+tier+'-parity.png'});
 }
 await board.close();
 const compact=structuredClone(result);for(const phase of Object.values(compact))for(const tier of Object.values(phase.tiers))for(const d of Object.values(tier.discs))delete d.png;
 fs.writeFileSync(dir+'/measurements.json',JSON.stringify(compact,null,2));
 for(const tier of ['full','mid'])assert.notEqual(result.after.map[tier].hash,result.after.map[tier].bareHash,'production map opts in at '+tier);
 assert.equal(result.after.map.tiny.hash,result.before.map.tiny.hash,'production map tiny bytes unchanged');
 assert.ok(result.after.map.ownerPhotoWins,'production personal-map photo wins');
 assert.ok(result.after.map.ownerURL,'production photo resolver supplies owner URL');
 for(const name of ['Buzzz','Zone','Luna','Force','Nuke']){
  assert.deepEqual(result.after.markers[name],result.before.markers[name],name+' position, size and label unchanged');
  assert.ok(result.after.markers[name].label.includes(name));
 }
 assert.ok(result.after.nukeViewer.visible);assert.equal(result.after.nukeViewer.asset,null);
 assert.equal(result.after.nukeViewer.png,result.before.nukeViewer.png,'Nuke generated viewer art unchanged');
 for(const tier of ['full','mid','mini-readable']){
  for(const name of ['Buzzz','Zone','Luna','Force']){
   const d=result.after.tiers[tier].discs[name];
   assert.notEqual(d.hash,d.bareHash,name+' official artwork appears at '+tier);
   assert.ok(d.sameEntry,name+' cached at '+tier);
  }
 }
 for(const tier of Object.keys(result.after.tiers)){
  for(const name of ['Photo Buzzz','Nuke']){
   const a=result.after.tiers[tier].discs[name],b=result.before.tiers[tier].discs[name];
   assert.equal(a.hash,a.bareHash,name+' is never overridden at '+tier);assert.equal(a.hash,b.hash,name+' unchanged at '+tier);
  }
 }
 for(const tier of ['tiny','low-boundary'])for(const name of ['Buzzz','Zone','Luna','Force']){
  const a=result.after.tiers[tier].discs[name];assert.equal(a.hash,a.bareHash,name+' no tiny stamp');assert.equal(a.hash,result.before.tiers[tier].discs[name].hash,name+' byte-identical tiny art');
 }
 assert.equal(result.after.cacheHitRenders,0);assert.ok(result.after.lowCacheIsolation);
 assert.ok(result.after.assetChangesPixels,'stamp asset participates in cache identity');
 assert.ok(result.after.placementChangesPixels,'placement participates in cache identity');
 missing=true;baseline=false;
 const failedContext=await browser.newContext();
 await failedContext.addInitScript(()=>{window.ATLAS_3D_OFF=true;});
 const failedPage=await failedContext.newPage();await failedPage.goto(url);
 await failedPage.waitForFunction(()=>discs.length>0);
 const failure=await failedPage.evaluate(async()=>{
  const art=await (await import('/disc3d/atlas-art.mjs')).createAtlasArt({dpr:1});
  const d=discs.find(d=>d.brand==='Discraft'&&d.name==='Buzzz'),color='#dcac60';
  const bare=art.render(d,color,94),pending=art.render(d,color,94,undefined,undefined,true);
  const pixels=e=>Array.from(e.canvas.getContext('2d').getImageData(0,0,e.px,e.px).data);
  const same=(a,b)=>JSON.stringify(pixels(a))===JSON.stringify(pixels(b));
  const loadingIsBare=same(bare,pending);let final;
  for(let i=0;i<100;i++){final=art.render(d,color,94,undefined,undefined,true);if(!final.pending)break;await new Promise(r=>setTimeout(r,20));}
  const out={loadingIsBare,failedIsBare:same(bare,final),finished:!final.pending};art.dispose();return out;
 });
 assert.deepEqual(failure,{loadingIsBare:true,failedIsBare:true,finished:true},'loading and failed assets never show generated art');
 await failedContext.close();
 assert.deepEqual(errors,[]);
 console.log('PASS: official art at full/mid, photo precedence, Nuke control, tiny pixel identity, cache and placement isolation. Proof: '+dir);
}finally{await browser.close();await new Promise(r=>server.close(r));}
