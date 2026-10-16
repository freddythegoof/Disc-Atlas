// Actual rendered maps, asynchronous replacement, photo/clay precedence and pixel controls.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=http.createServer((req,res)=>{
 const p=new URL(req.url,'http://local').pathname;
 const file=p==='/'?'web/index.html':p.startsWith('/fixtures/')?'tests'+p:'public'+p;
 if(p==='/api/bag/discs/proof/photo'){res.setHeader('Content-Type','image/webp');res.end(fs.readFileSync('tests/fixtures/stamped-disc.webp'));return;}
 if(p.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{}');return;}
 try{res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.html':'text/html','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--use-angle=d3d11','--enable-gpu']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),requests=[];
page.on('request',r=>requests.push(new URL(r.url()).pathname));
const dir='docs/assets/discraft-stamp-sweep/batch-1';fs.mkdirSync(dir,{recursive:true});
const assignments=JSON.parse(fs.readFileSync('source-data/stamp-manifest.json'));
const batch=assignments.filter(e=>e.sourceRetailer==='Infinite Discs');
assert.equal(batch.length,15);
const newMolds=batch.map(e=>e.mold);
const controls=['Buzzz','Zone','Luna','Nuke','Destroyer'];
const molds=[...newMolds,...controls];
const slug=mold=>batch.find(e=>e.mold===mold)?.asset.split('/').at(-1).replace('.png','')||mold.toLowerCase().replaceAll(' ','-');
const base='771e8da';
const baseline={'/data.json':execFileSync('git',['show',base+':public/data.json'],{maxBuffer:8*1024*1024})};
const hash=s=>createHash('sha256').update(s).digest('hex');
const results={};
try{
 await page.goto('http://127.0.0.1:'+server.address().port);
 await page.waitForFunction(()=>typeof discs!=='undefined'&&discs.length>0);
 await page.waitForFunction(()=>mapClusters.length>0&&mapArt.state!=='loading');
 assert.equal(requests.filter(p=>p.startsWith('/stamps/')).length,0,'landing/atlas never prefetches stock stamps');
 await page.evaluate(()=>select(discs.find(d=>d.name==='Buzzz'&&d.brand==='Discraft')));
 await page.waitForFunction(()=>Disc3D.viewer?.state.props?.mold==='Buzzz');
 await page.waitForTimeout(700);
 const official=await page.evaluate(()=>Disc3D.viewer.debug.stamp.material.map.image.toDataURL());
 const generic=await page.evaluate(async()=>{const {stampTexture}=await import('/disc3d/stamp.mjs');return stampTexture('Buzzz',Disc3D.viewer.state.props.color).image.toDataURL();});
 assert.ok(official!==generic,'Buzzz must replace the generated stamp with its official alpha artwork');
 const tint=await page.evaluate(async()=>{
  const {stampTexture,catalogStampAsset}=await import('/disc3d/stamp.mjs');
  const sample=color=>{const t=stampTexture('Buzzz',color,{asset:'stamps/discraft/buzzz.png'}),pixels=t.image.getContext('2d').getImageData(0,0,512,512).data;let best=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]>pixels[best+3])best=i;const ink=[...pixels.slice(best,best+4)];t.dispose();return ink;};
  return {light:sample('#ffffff'),dark:sample('#000000'),gate:catalogStampAsset({brand:'Innova',stampAsset:'stamps/discraft/buzzz.png'})};
 });
 assert.deepEqual(tint.light.slice(0,3),[18,22,28]);assert.deepEqual(tint.dark.slice(0,3),[255,255,255]);assert.equal(tint.gate,null);
 await page.route('**/stamps/discraft/delayed.png',async route=>{await new Promise(r=>setTimeout(r,200));await route.fulfill({contentType:'image/png',body:fs.readFileSync('public/stamps/discraft/buzzz.png')});});
 const race=await page.evaluate(async()=>{
  const {stampTexture}=await import('/disc3d/stamp.mjs');let changed=0;
  const t=stampTexture('Fallback','#222',{asset:'stamps/discraft/delayed.png',onChange:()=>changed++}),before=t.image.toDataURL();t.dispose();
  const failed=stampTexture('Fallback','#222',{asset:'stamps/discraft/missing.png'}),fallback=failed.image.toDataURL();
  await new Promise(r=>setTimeout(r,600));
  const result={changed,disposedUnchanged:before===t.image.toDataURL(),failureFallback:failed.userData.stampFailed&&fallback===failed.image.toDataURL()};failed.dispose();return result;
 });
 assert.deepEqual(race,{changed:0,disposedUnchanged:true,failureFallback:true});
 await page.close();
 for(const phase of ['before','after']){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  if(phase==='before')await context.route('**/*',route=>{const body=baseline[new URL(route.request().url()).pathname];return body?route.fulfill({contentType:'application/json',body}):route.continue();});
  const p=await context.newPage();results[phase]={};const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:'+server.address().port);
  await p.waitForFunction(()=>typeof discs!=='undefined'&&discs.length>0);
  for(const mold of molds){
   await p.evaluate(mold=>select(discs.find(d=>(d.catalogName||d.name)===mold&&d.brand===(mold==='Destroyer'?'Innova':'Discraft'))),mold);
   await p.waitForFunction(mold=>Disc3D.viewer?.state.props?.mold===mold,mold);
   if(['Buzzz','Zone','Luna'].includes(mold)||(phase==='after'&&newMolds.includes(mold)))await p.waitForFunction(()=>!!Disc3D.viewer.debug.stamp.material.map.userData.stampAsset);
   if(phase==='after'&&newMolds.includes(mold))assert.equal(await p.evaluate(()=>Disc3D.viewer.debug.stamp.material.map.userData.stampAsset),batch.find(e=>e.mold===mold).asset);
   await p.evaluate(()=>{Disc3D.viewer.setView('top',{instant:true});Disc3D.viewer.debug.renderNow();});
   results[phase][mold]=await p.evaluate(()=>{
    const v=Disc3D.viewer;v.debug.renderNow();return {stamp:v.debug.stamp.material.map.image.toDataURL(),canvas:v.debug.renderer.domElement.toDataURL(),color:v.debug.bodyMaterial.color.getHexString()};
   });
   results[phase][mold].presented=hash(await p.locator('#detail .disc3d-stage').screenshot({path:`${dir}/${phase}-${slug(mold)}-viewer.png`}));
   if(mold==='Buzzz'){
    await p.evaluate(()=>Disc3D.open());await p.waitForFunction(()=>Disc3D.popout?.state.frames>0);
    await p.evaluate(()=>{Disc3D.popout.setView('top',{instant:true});Disc3D.popout.debug.renderNow();});
    await p.locator('.disc3d-dialog-body').screenshot({path:`${dir}/${phase}-buzzz-popout.png`});
    await p.evaluate(()=>Disc3D.close());await p.waitForFunction(()=>!Disc3D.popout);
    await p.evaluate(()=>{Disc3D.setClay(true);Disc3D.viewer.debug.renderNow();});
    assert.equal(await p.evaluate(()=>Disc3D.viewer.debug.stamp.visible),false);
    results[phase].clay=await p.evaluate(()=>{Disc3D.viewer.debug.renderNow();return Disc3D.viewer.debug.renderer.domElement.toDataURL();});
    await p.locator('#detail .disc3d-stage').screenshot({path:`${dir}/${phase}-clay.png`});
    await p.evaluate(()=>{Disc3D.setClay(false);const v=Disc3D.viewer;v.update({...v.state.props,photoURL:'/api/bag/discs/proof/photo?v=abc.webp'});});
    await p.waitForFunction(()=>Disc3D.viewer.debug.photo?.userData.photoReady);
    assert.equal(await p.evaluate(()=>Disc3D.viewer.debug.stamp.visible),false);
    results[phase].photo=await p.evaluate(()=>{Disc3D.viewer.debug.renderNow();return Disc3D.viewer.debug.renderer.domElement.toDataURL();});
    results[phase].photoTexture=await p.evaluate(()=>{const photo=Disc3D.viewer.debug.photo,image=photo.material.map.image,c=document.createElement('canvas');c.width=image.width;c.height=image.height;c.getContext('2d').drawImage(image,0,0);return c.toDataURL();});
    await p.locator('#detail .disc3d-stage').screenshot({path:`${dir}/${phase}-user-photo.png`});
   }
  }
  // Drive the production bag renderer without authentication or edits to a user's account.
  await p.evaluate(async()=>{
   document.querySelector('#detail').hidden=true;
   const host=document.createElement('div');host.id='stamp-proof-bag';Object.assign(host.style,{position:'fixed',inset:'0',zIndex:9999,background:'#161d24'});document.body.append(host);
   const {mountBag}=await import('/bag3d/viewer.mjs');window.proofBag=await mountBag(host,{interaction:'page',view:'page',animated:false,turn:false,quality:'high',toneMapping:'neutral'});
  });
  results[phase].bag={};
  for(const mold of molds.filter(m=>m!=='Destroyer')){
   await p.evaluate(async mold=>{const d=discs.find(d=>(d.catalogName||d.name)===mold&&d.brand==='Discraft'),slots=Array.from({length:24},(_,i)=>({id:'proof'+i,color:discColor(d),mold:d}));proofBag.setBagLayout({main:slots,putter:[],goTo:[]});await proofBag.stageDiscs(['proof0'],{instant:true,desktopSizing:{entries:slots.map(s=>({key:s.id,label:{width:80,height:22}}))}});},mold);
   await p.waitForTimeout(350);
   results[phase].bag[mold]=hash(await p.locator('#stamp-proof-bag').screenshot({path:`${dir}/${phase}-${slug(mold)}-bag.png`}));
   assert.ok(await p.evaluate(()=>proofBag.getBagLayoutState().find(r=>r.key==='proof0').shown>300),'proof uses a large pulled disc');
  }
  await p.evaluate(()=>{proofBag.dispose();document.querySelector('#stamp-proof-bag').remove();});
  // The storage pull uses these production meshes. Check its texture and original dome geometry.
  results[phase].storage={};
  for(const mold of molds){
   const result=await p.evaluate(async mold=>{
    const {discModel,disposeObject}=await import('/collection3d/stage.mjs');
    const d=discs.find(d=>(d.catalogName||d.name)===mold&&d.brand===(mold==='Destroyer'?'Innova':'Discraft'));let group=discModel(d,{color:discColor(d)});
    const mesh=group.children.find(c=>c.material?.map);
    if(d.stampAsset){for(let n=0;n<100&&!mesh.material.map.userData.stampAsset;n++)await new Promise(r=>setTimeout(r,20));if(!mesh.material.map.userData.stampAsset)throw Error('Storage stamp did not load: '+mold);}
    const result=mesh.material.map.image.toDataURL();disposeObject(group);return result;
   },mold);
   results[phase].storage[mold]=hash(result);
  }
  // Production list renderer: only visible rows get art. The atlas cache stays stamp-free.
  await p.evaluate(async()=>{
   const root=document.createElement('div');root.id='stamp-proof-thumbs';Object.assign(root.style,{position:'fixed',inset:'0',zIndex:9999,background:'#161d24',display:'flex',gap:'32px',padding:'40px'});
   for(const name of ['Buzzz','Zone','Luna','Force','Nuke']){const d=discs.find(d=>d.name===name&&d.brand==='Discraft');const h=document.createElement('div');h.dataset.discThumbnail=d.id;h.dataset.plateColor=discColor(d);Object.assign(h.style,{position:'relative',width:'96px',height:'96px'});root.append(h);}
   document.body.append(root);const {observeThumbnails}=await import('/disc3d/thumbnails.mjs');observeThumbnails(root,id=>discs.find(d=>d.id===id));
  });
  await p.waitForFunction(()=>document.querySelectorAll('#stamp-proof-thumbs .has-3d').length===5);await p.waitForTimeout(400);
  await p.locator('#stamp-proof-thumbs').screenshot({path:`${dir}/${phase}-thumbnails.png`});
  const thumbHashes=await p.evaluate(()=>[...document.querySelectorAll('#stamp-proof-thumbs canvas')].map(c=>c.toDataURL()));
  results[phase].thumbnails=thumbHashes.map(hash);
  assert.deepEqual(errors,[]);await context.close();
 }
 for(const mold of newMolds){
  assert.notEqual(results.before[mold].stamp,results.after[mold].stamp,mold+' replaces fallback');
  assert.equal(results.before[mold].color,results.after[mold].color,mold+' keeps class colour');
  assert.notEqual(results.before.storage[mold],results.after.storage[mold],mold+' storage uses own asset');
  assert.notEqual(results.before.bag[mold],results.after.bag[mold],mold+' pulled bag changes');
 }
 const screenshotDifferences={};
 const pixelPage=await browser.newPage();
 const comparePresented=async(before,after,label)=>{
  const urls=[before,after].map(file=>'data:image/png;base64,'+fs.readFileSync(file).toString('base64'));
  const diff=await pixelPage.evaluate(async urls=>{
   const images=await Promise.all(urls.map(src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;})));
   const pixels=images.map(im=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;c.getContext('2d').drawImage(im,0,0);return c.getContext('2d').getImageData(0,0,c.width,c.height).data;});
   if(pixels[0].length!==pixels[1].length)throw Error('Control dimensions changed');
   let maxChannelDelta=0,changedPixels=0;
   for(let i=0;i<pixels[0].length;i+=4){let changed=false;for(let j=0;j<4;j++){const d=Math.abs(pixels[0][i+j]-pixels[1][i+j]);maxChannelDelta=Math.max(maxChannelDelta,d);changed ||= d!==0;}if(changed)changedPixels++;}
   return {maxChannelDelta,changedPixels,totalPixels:pixels[0].length/4};
  },urls);
  screenshotDifferences[label]=diff;
  // ANGLE screenshot readback can quantize a handful of pixels by one level.
  // Texture pixels and all runtime files are independently required identical.
  assert.ok(diff.maxChannelDelta<=1&&diff.changedPixels/diff.totalPixels<=.0001,label+' presentation changed beyond GPU quantization: '+JSON.stringify(diff));
 };
 for(const mold of controls){
  await comparePresented(`${dir}/before-${slug(mold)}-viewer.png`,`${dir}/after-${slug(mold)}-viewer.png`,mold+' viewer');
  assert.equal(hash(results.before[mold].stamp),hash(results.after[mold].stamp),mold+' stamp pixels unchanged');
  assert.equal(results.before.storage[mold],results.after.storage[mold],mold+' storage unchanged');
  if(mold!=='Destroyer')await comparePresented(`${dir}/before-${slug(mold)}-bag.png`,`${dir}/after-${slug(mold)}-bag.png`,mold+' bag');
 }
 for(const key of ['photoTexture','clay'])assert.equal(hash(results.before[key]),hash(results.after[key]),key+' pixels unchanged');
 for(let i=0;i<5;i++)assert.equal(results.before.thumbnails[i]===results.after.thumbnails[i],i!==3,'only Force thumbnail changes in this control board');
 await pixelPage.close();
 const summary={base,screenshotDifferences,controlStampTexturesByteIdentical:true,batchAssets:batch.map(e=>({id:e.id,mold:e.mold,asset:e.asset})),unchangedControls:controls,photoDecodedPixelsIdentical:true,clayIdentical:true,atlasStampRequests:0,brandGate:true,bagControlsIdentical:controls.filter(m=>m!=='Destroyer'),thumbnails:results.after.thumbnails};
 fs.writeFileSync(`${dir}/verification.json`,JSON.stringify(summary,null,2));
 console.log('Batch 1 stock stamp browser checks passed: 15 own-mold assignments and 5 unchanged controls');
}finally{await browser.close();await new Promise(r=>server.close(r));}
