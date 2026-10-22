// Photo stamps v2 fence (docs/photo-stamp-color-assets.md): the photo look and the one-ink game asset draw exactly what
// the baseline draws, on every surface. The same probe runs in this checkout and in a baseline checkout (default: a
// detached worktree of origin/main in the ignored work/photo-stamp-color-assets/baseline), each building and serving its
// own public/, with the same drawn synthetic photo through the same flow; then every captured input to the renderer is
// compared: the made one-ink asset's bytes, and per surface its stamp texture, stamp material, photo texture and the
// map still, in Auto/flat and in gold foil.
//   node tests/photo-stamp-identity-browser.mjs [--baseline <dir>]
// Each tree is also compared with itself (two probes of this checkout), so any run-to-run noise would show; on the Mac
// there was none, and pixels are compared exactly.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const sharp=createRequire(import.meta.url)('sharp');
const SELF=fileURLToPath(import.meta.url),WORK=path.resolve('work/photo-stamp-color-assets/identity');

if(process.argv[2]==='--probe'){
 const {startHarness}=await import('./display-harness.mjs');
 const [,, ,out,photoFile,port]=process.argv;
 const h=await startHarness({port:Number(port),state:'work/photo-stamp-identity/d1'});
 const {page,base,errors}=h,wait=ms=>page.waitForTimeout(ms);
 const items=()=>page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs);
 const result={};
 try{
  await h.signIn();
  await h.seedBag([{mold_id:'3d60892b6812',plastic:'Star',wear:8,weight_g:172,color:'#70b7cd'},{mold_id:'7446eb39abe5',plastic:'Z',wear:8,weight_g:177,color:'#b99bdd'}]);
  await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=2);
  const disc=(await items()).find(i=>i.mold_id==='3d60892b6812');
  const edit=async()=>{await page.locator(`[data-bag-edit="${disc.id}"]`).evaluate(n=>n.click());await page.waitForSelector('#addDiscDialog[open]');};
  await edit();await page.setInputFiles('#addDiscDialog .bag-photo-file',photoFile);
  await page.waitForSelector('dialog.photo-aligner[open]');await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
  await page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]'),null,{timeout:60000});
  await page.locator('#saveDisc').click();await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'),null,{timeout:60000});
  const key=(await items()).find(i=>i.id===disc.id).texture_key,url='/api/bag/discs/'+encodeURIComponent(disc.id)+'/photo?v='+encodeURIComponent(key);
  // The one-ink game asset, made through the sheet from the same original.
  await edit();const chooser=page.waitForEvent('filechooser');
  await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Game asset'}).click();await (await chooser).setFiles(photoFile);
  await page.waitForSelector('dialog.photo-aligner[open]');await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
  await page.waitForFunction(()=>/Game asset made/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:120000});
  await page.keyboard.press('Escape');
  result.assetBytes=await page.evaluate(k=>new Promise((res,rej)=>{const r=indexedDB.open('disc-atlas-photo-stamps');r.onsuccess=()=>{const g=r.result.transaction('assets').objectStore('assets').get(k);g.onsuccess=async()=>{const v=g.result,b=new Uint8Array(v instanceof Blob?await v.arrayBuffer():v.bytes);res(Array.from(b).join(','));};g.onerror=rej;};}),disc.id+'/'+key);
  const setLook=look=>page.evaluate(([id,k,look])=>import('/disc3d/photo-stamps.mjs').then(m=>m.setPhotoLook(id,k,look)),[disc.id,key,look]);
  // Every 13th byte of a canvas or image.
  const SAMPLE='const sample=img=>{const c=document.createElement("canvas");c.width=img.width;c.height=img.height;const g=c.getContext("2d");g.drawImage(img,0,0);return Array.from(g.getImageData(0,0,c.width,c.height).data.filter((_,i)=>i%13===0)).join(",");};';
  const mat=`const mat=m=>m?{type:m.type,metalness:m.metalness,roughness:m.roughness,iridescence:m.iridescence??null,transparent:m.transparent,opacity:m.opacity,finish:m.userData.stampFinish||"flat",envMapIntensity:m.envMapIntensity??null}:null;`;
  const capture=async label=>{
   const r=result[label]={};
   // Viewer, as My Bag opens it.
   await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-inspect]').length>=2);
   await page.locator(`[data-bag-inspect="${disc.id}"]`).first().evaluate(n=>n.click());
   await page.waitForFunction(()=>document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready');
   await page.waitForFunction(()=>{const v=Disc3D.viewer.debug;return v.photo?v.photo.userData.photoReady:v.stamp.material.map?.userData.stampAsset||v.stamp.material.map?.userData.stampFailed;},null,{timeout:30000});await wait(500);
   r.viewer=await page.evaluate(new Function(`${SAMPLE}${mat}const v=Disc3D.viewer.debug;return {photo:v.photo?sample(v.photo.material.map.image):null,stampVisible:v.stamp.visible,stamp:v.stamp.visible&&v.stamp.material.map?sample(v.stamp.material.map.image):null,material:v.stamp.visible?mat(v.stamp.material):null};`));
   // Bag, the disc pulled.
   await page.waitForFunction(()=>document.querySelector('#bagScene')?.dataset.phase==='open',null,{timeout:30000});await wait(800);
   await page.locator(`[data-physical-disc="${disc.id}"]`).evaluate(n=>n.click());await wait(3500);
   r.bag=await page.evaluate(new Function('id',`${SAMPLE}${mat}const l=document.querySelector('[data-bag-canvas]').bagViewer.stampLayers.find(l=>l.key===id);return l?{finish:l.finish,metalness:l.metalness,asset:!!l.asset}:null;`),disc.id);
   // Bag list thumbnail.
   const host=`#myBagContents [data-disc-thumbnail][data-photo-url="${url}"]`;
   await page.locator(host).first().scrollIntoViewIfNeeded();await wait(2500);
   r.list=await page.evaluate(new Function('sel',`${SAMPLE}const c=document.querySelector(sel+' canvas');return c?sample(c):null;`),host);
   // Gallery.
   await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=2);
   await page.evaluate(()=>document.querySelector('#myBagViews [data-bag-view="gallery"]').click());
   for(let i=0;i<4;i++){const id=await page.evaluate(()=>document.querySelector('[data-album-stage]')?.dataset.discId);if(id===disc.id)break;await page.locator('[data-album-step="1"]').first().click();await wait(400);}
   await page.waitForFunction(id=>{const s=document.querySelector('[data-album-stage]');return s?.dataset.discId===id&&s.closest('[data-appearance]')?.dataset.appearance==='ready';},disc.id,{timeout:30000});await wait(500);
   r.gallery=await page.evaluate(new Function(`${SAMPLE}${mat}const v=BagApp.scenes.album.debug;return {photo:v.photo?sample(v.photo.material.map.image):null,stamp:v.stamp.visible&&v.stamp.material.map?sample(v.stamp.material.map.image):null,material:v.stamp.visible?mat(v.stamp.material):null};`));
   await page.evaluate(()=>document.querySelector('#myBagViews [data-bag-view="bag"]').click());
   // Storage's disc model, and the personalized map's still.
   r.storage=await page.evaluate(new Function('args',`${SAMPLE}${mat}return (async()=>{const [url,mold]=args;const {discModel}=await import('/collection3d/stage.mjs'),d=discs.find(d=>d.id===mold);
    const group=discModel(d,{color:'#5c9daa',photoURL:url});for(let i=0;i<80;i++){const m=group.children.map(c=>c.material).filter(Boolean);if(m.every(m=>!m.map||m.map.userData.stampAsset||m.map.userData.photoReady||m.map.image?.width))break;await new Promise(r=>setTimeout(r,100));}await new Promise(r=>setTimeout(r,1500));
    return group.children.map(c=>c.material).filter(m=>m?.map?.image).map(m=>({material:mat(m),map:m.map.image.width?sample(m.map.image):null}));})();`),[url,disc.mold_id]);
   r.still=await page.evaluate(new Function('args',`return (async()=>{const [url,mold]=args;const art=await (await import('/disc3d/atlas-art.mjs')).getAtlasArt(),d=discs.find(d=>d.id===mold);let e;
    for(let i=0;i<80;i++){e=art.render({...d,photoURL:url,stampStyle:DisplayPalette.stampStyle()},'#5c9daa',320,undefined,'full',true);if(e&&!e.pending)break;await new Promise(r=>setTimeout(r,100));}
    const g=e.canvas.getContext('2d')||null;const c=document.createElement('canvas');c.width=e.canvas.width;c.height=e.canvas.height;c.getContext('2d').drawImage(e.canvas,0,0);return Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data.filter((_,i)=>i%13===0)).join(',');})();`),[url,disc.mold_id]);
  };
  for(const look of ['photo','asset'])for(const [ink,finish] of [['auto','flat'],['gold','foil']]){
   await setLook(look);await page.evaluate(([ink,finish])=>DisplayPalette.setStamp({ink,finish}),[ink,finish]);
   await capture(look+'/'+ink+'/'+finish);
  }
  result.errors=errors;
 }finally{fs.writeFileSync(out,JSON.stringify(result));await h.stop();}
 process.exit(0);
}

// The driver.
const at=process.argv.indexOf('--baseline'),baseline=path.resolve(at>0?process.argv[at+1]:'work/photo-stamp-color-assets/baseline');
fs.mkdirSync(WORK,{recursive:true});
if(!fs.existsSync(baseline+'/package.json')){
 execFileSync('git',['worktree','add','--detach',baseline,'origin/main'],{stdio:'inherit'});
 fs.symlinkSync(path.resolve('node_modules'),baseline+'/node_modules');
}
const photoFile=WORK+'/synthetic.jpg';
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2000"><rect width="1600" height="2000" fill="#3a3530"/><circle cx="800" cy="1000" r="752" fill="#5c9daa"/><polygon points="520,720 800,690 840,980 560,1020" fill="#7f93e0" stroke="#1b1719" stroke-width="16"/><rect x="540" y="1080" width="520" height="90" fill="#e8c43c"/><rect x="620" y="1220" width="360" height="40" fill="#1b1719"/></svg>`)).jpeg({quality:92}).toFile(photoFile);
const probe=(cwd,name,port)=>{const out=WORK+'/'+name+'.json';execFileSync(process.execPath,[SELF,'--probe',out,photoFile,String(port)],{cwd,stdio:['ignore','ignore','inherit'],timeout:900000});return JSON.parse(fs.readFileSync(out,'utf8'));};
const runs={branch:probe(process.cwd(),'branch',8881),baseline:probe(baseline,'baseline',8883),branch2:probe(process.cwd(),'branch-again',8881)};

// Compare two captures: equal, or pixel strings within one step on under 0.1% of values. Returns the worst pixel diff.
function compare(a,b,where,report){
 if(typeof a==='string'&&typeof b==='string'&&a.includes(',')&&a.length>200){
  if(a===b){report.push([where,0,0]);return;}
  const x=a.split(',').map(Number),y=b.split(',').map(Number);assert.equal(x.length,y.length,where+': size');
  let n=0,most=0;for(let i=0;i<x.length;i++)if(x[i]!==y[i]){n++;most=Math.max(most,Math.abs(x[i]-y[i]));}
  report.push([where,n,most]);return;
 }
 if(a&&typeof a==='object'&&b&&typeof b==='object'){assert.deepEqual(Object.keys(a).sort(),Object.keys(b).sort(),where+': keys');for(const k of Object.keys(a))compare(a[k],b[k],where+'.'+k,report);return;}
 assert.deepEqual(a,b,where);
}
const table=(a,b)=>{const report=[];for(const k of Object.keys(a.branch??a))if(k!=='errors')compare(a[k],b[k],k,report);return report;};
const vsBaseline=table(runs.branch,runs.baseline),noise=table(runs.branch,runs.branch2);
const summary=r=>r.filter(([,n])=>n).map(([w,n,m])=>`${w}: ${n} values, ≤${m}`);
console.log('branch vs baseline differences:',summary(vsBaseline).join('; ')||'none');
console.log('branch vs branch (noise floor):',summary(noise).join('; ')||'none');
fs.writeFileSync(WORK+'/report.json',JSON.stringify({vsBaseline,noise,errors:{branch:runs.branch.errors,baseline:runs.baseline.errors}},null,1));
assert.equal(runs.branch.assetBytes,runs.baseline.assetBytes,'the one-ink asset is byte-for-byte the baseline\'s');
// Pixels are compared exactly: the two trees, like two runs of one tree, drew the same bytes on every surface.
for(const [where,n,most] of vsBaseline)assert.equal(n,0,where+': '+n+' values differ, by up to '+most);
assert.deepEqual(runs.branch.errors,[]);
console.log('photo stamp identity: pass');
