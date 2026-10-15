// The glare experiment's evidence (docs/photo-glare-experiment.md): baseline (softenGlare:false, the exact
// pre-experiment output) vs experiment, side by side, for every case in photo-glare-cases.mjs and the repo's
// own photo fixture. Each case gets a flat strip (photo | baseline | experiment | changed pixels) and the two
// textures on the real 3D detail viewer (the Pixel's mold, the matched plate colour), 3/4 and top views.
// Also checks, on the real 1024 px textures: no-glare and white-ink cases are byte-identical, nothing outside
// the glare changes, and the highlight gets darker. Writes docs/photo-glare/*.jpg and results.json.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/photo-glare-ab-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir='docs/photo-glare';fs.mkdirSync(dir,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.wasm':'application/wasm','.glb':'model/gltf-binary'};
const photos=new Map();
const page='<!doctype html><meta charset="utf-8"><script type="importmap">{"imports":{"three":"/bag3d/vendor/three/three.module.min.js","three/addons/":"/bag3d/vendor/three/addons/"}}</script><link rel="stylesheet" href="/disc3d.css"><style>body{margin:0;background:#0f1418;color:#e8eef2;font:600 15px system-ui,sans-serif}#grid{display:grid;grid-template-columns:repeat(2,440px);gap:10px;padding:12px;width:max-content}#grid figure{margin:0}#grid figcaption{padding:4px 2px 6px}#grid .host{width:440px;height:330px;position:relative}.disc3d-viewport{height:100%}.host>div>:not(.disc3d-viewport),.disc3d-hint,.disc3d-expand{display:none!important}</style><div id="grid"></div>';
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(req.method==='PUT'){const chunks=[];req.on('data',c=>chunks.push(c));req.on('end',()=>{photos.set(url.pathname.slice(8),Buffer.concat(chunks));res.end('ok');});return;}
 if(url.pathname==='/'){res.writeHead(200,{'Content-Type':types['.html']});res.end(page);return;}
 const photo=url.pathname.match(/^\/api\/bag\/discs\/[^/]+\/photo$/)&&photos.get(url.searchParams.get('v'));
 if(photo){res.writeHead(200,{'Content-Type':'image/webp','Cache-Control':'no-store'});res.end(photo);return;}
 const file=url.pathname.startsWith('/tests/')?'.'+url.pathname:'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu']});
const results={};
try{
 const tab=await browser.newPage({viewport:{width:940,height:760},deviceScaleFactor:1});
 const errors=[];tab.on('pageerror',e=>errors.push(e.message));
 await tab.goto(base+'/');
 const cases=await tab.evaluate(async()=>Object.keys((await import('/tests/photo-glare-cases.mjs')).GLARE_CASES));
 // The photo route takes hex keys only (disc3d/photo.mjs), so each texture is uploaded as <case>-<a|b>.
 for(const [index,name] of [...cases,'fixture-stamped-disc'].entries()){
  // Flat: run baseline and experiment on the same 1024 px crop, measure, encode both as the upload would be.
  const flat=await tab.evaluate(async({name,key})=>{
   const {delightPixels}=await import('/disc-albedo.mjs'),{glarePhoto,GLARE_CASES}=await import('/tests/photo-glare-cases.mjs'),{decodePhoto,photoCanvas}=await import('/disc-photo.mjs');
   const size=1024;let input,added=null;
   if(name in GLARE_CASES){const photo=glarePhoto({...GLARE_CASES[name],size});input=photo.data;added=photo.added;}
   else{const image=await decodePhoto(await (await fetch('/tests/fixtures/stamped-disc.webp')).blob());input=photoCanvas(image,{},size).getContext('2d').getImageData(0,0,size,size).data;image.close();}
   const baseline=input.slice(),experiment=input.slice();
   const a=delightPixels(baseline,size,{softenGlare:false});const t=performance.now();const b=delightPixels(experiment,size,{softenGlare:true});const ms=performance.now()-t;
   const lin=v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;},lum=(d,k)=>.2126*lin(d[k])+.7152*lin(d[k+1])+.0722*lin(d[k+2]);
   // The same photo shot without glare, through the baseline: what the softening aims for.
   const reference=added&&glarePhoto({...GLARE_CASES[name],glare:[],size}).data;if(reference)delightPixels(reference,size,{softenGlare:false});
   let changed=0,outside=0,brightened=0,count=0,before=0,after=0,errBefore=0,errAfter=0;const mask=new Uint8ClampedArray(size*size*4);
   for(let p=0;p<size*size;p++){
    const k=4*p,diff=baseline[k]!==experiment[k]||baseline[k+1]!==experiment[k+1]||baseline[k+2]!==experiment[k+2]||baseline[k+3]!==experiment[k+3];
    mask.set(diff?[255,40,200,255]:[24,30,36,input[k+3]],k);
    if(diff){changed++;if(added&&added[p]<.005)outside++;if(lum(experiment,k)>=lum(baseline,k))brightened++;}
    if(added?added[p]>=.3&&input[k+3]===255:diff){count++;before+=lum(baseline,k);after+=lum(experiment,k);if(reference){errBefore+=Math.abs(lum(baseline,k)-lum(reference,k));errAfter+=Math.abs(lum(experiment,k)-lum(reference,k));}}
   }
   const canvas=(data)=>{const c=document.createElement('canvas');c.width=c.height=size;c.getContext('2d').putImageData(new ImageData(data,size,size),0,0);return c;};
   const panels=[['Photo',input],['Baseline (today)',baseline],['Experiment',experiment],['Changed pixels',mask]],W=300,strip=document.createElement('canvas');strip.width=W*4+50;strip.height=W+40;
   const g=strip.getContext('2d');g.fillStyle='#0f1418';g.fillRect(0,0,strip.width,strip.height);g.font='600 15px system-ui,sans-serif';g.fillStyle='#e8eef2';
   panels.forEach(([label,data],i)=>{g.drawImage(canvas(data),10+i*(W+10),30,W,W);g.fillText(label,10+i*(W+10),20);});
   const upload=async(data,key)=>{const blob=await new Promise(r=>canvas(data).toBlob(r,'image/webp',.86));await fetch('/upload/'+key,{method:'PUT',body:blob});};
   await upload(baseline,key+'-a.webp');await upload(experiment,key+'-b.webp');
   return {strip:strip.toDataURL('image/jpeg',.86),color:a.color,sameColor:a.color===b.color,glare:b.glare,changed,outside,brightened,ms:Math.round(ms),
    highlight:count?{pixels:count,baseline:+(before/count).toFixed(4),experiment:+(after/count).toFixed(4),reduction:+(1-after/before).toFixed(4),
     ...reference&&{errorBaseline:+(errBefore/count).toFixed(4),errorExperiment:+(errAfter/count).toFixed(4)}}:null};
  },{name,key:index.toString(16)});
  fs.writeFileSync(`${dir}/${name}-flat.jpg`,Buffer.from(flat.strip.split(',')[1],'base64'));delete flat.strip;
  // 3D: the two textures on the detail viewer, 3/4 (the default view) and top.
  await tab.evaluate(async({key,color})=>{
   const {createDiscViewer}=await import('/disc3d/viewer.mjs'),data=await (await fetch('/data.json')).json(),d=data.discs.find(d=>d.name==='Pixel');
   const grid=document.querySelector('#grid');for(const v of window.viewers||[])v.dispose();grid.innerHTML='';window.viewers=[];
   for(const [view,label] of [['angle','3/4 view'],['top','Top view']])for(const kind of ['baseline','experiment']){
    const figure=document.createElement('figure');figure.innerHTML=`<figcaption>${kind==='baseline'?'Baseline (today)':'Experiment'} · ${label}</figcaption><div class="host"></div>`;grid.append(figure);
    const viewer=createDiscViewer();viewer.attach(figure.querySelector('.host'));
    viewer.update({photoURL:`/api/bag/discs/ab/photo?v=${key}-${kind==='baseline'?'a':'b'}.webp`,model:d.model3d||null,specs:d.specs||null,flight:{speed:d.speed,turn:d.turn,fade:d.fade},mold:'Pixel',color,plastic:'premium',hand:'RHBH',manufacturer:d.manufacturer,record:d.name});
    viewer.setView(view);window.viewers.push(viewer);
   }
  },{key:index.toString(16),color:flat.color||'#2b8384'});
  await tab.waitForFunction(()=>window.viewers.every(v=>v.debug.photo?.userData.photoReady));
  await tab.waitForTimeout(900);await tab.evaluate(()=>window.viewers.forEach(v=>v.debug.renderNow()));await tab.waitForTimeout(100);
  await tab.locator('#grid').screenshot({path:`${dir}/${name}-3d.jpg`,type:'jpeg',quality:84});
  results[name]=flat;
  console.log(name.padEnd(22),JSON.stringify(flat));
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();server.close();}
fs.writeFileSync(`${dir}/results.json`,JSON.stringify(results,null,1)+'\n');
// The same claims the unit tests make, here on the real 1024 px textures.
for(const [name,r] of Object.entries(results)){
 assert.ok(r.sameColor,name+': matched plate colour unchanged');assert.equal(r.brightened,0,name+': nothing brightened');assert.equal(r.outside,0,name+': nothing outside the glare changed');
}
for(const name of ['no-glare','white-ink-clipped'])assert.equal(results[name].changed,0,name+': byte-identical to the baseline');
for(const name of ['hotspot','hotspot-on-stamp','tube-streak','dark-disc'])assert.ok(results[name].highlight.reduction>.35,name+': highlight darker by '+results[name].highlight.reduction);
console.log('PASS: glare A/B written to '+dir+' (flat strips, 3D pairs, results.json)');
