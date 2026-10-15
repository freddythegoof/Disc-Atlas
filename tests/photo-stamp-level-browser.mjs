// Stamp levelling (docs/photo-stamp-orientation.md), in a real browser:
// 1. Where rotation lives: a level test photo, through today's pipeline, is level in its texture, in the
//    detail viewer (top and 3/4) and, since this fix, on a disc floating out of the 3D bag. Before the fix the
//    bag's staged disc rolled the stamp a few degrees (measured on BEFORE, the bag viewer at main).
// 2. The aligner's tools: a photo whose stamp is turned 3° counterclockwise is levelled with the nudges and
//    level lines; the texture and the 3D render come out level. Nudges land on exact tenths, 0° snaps back
//    exactly, the keyboard nudges too, and the level lines never reach the upload.
// 3. After saving: the saved crooked texture is opened again from the sheet (Level stamp), turned, and
//    re-exported through preparePhoto (same WebP size cap) without the original photo; framing stays put.
// 4. At 0° the export is byte-identical to BEFORE's disc-photo.mjs.
// Shots and numbers: docs/photo-stamp-orientation/. Run: PLAYWRIGHT_MODULE=<playwright> node tests/photo-stamp-level-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const BEFORE='5b50637',dir='docs/photo-stamp-orientation',fixture='tests/fixtures/crooked-stamp.jpg';
fs.mkdirSync(dir,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.wasm':'application/wasm','.glb':'model/gltf-binary','.svg':'image/svg+xml','.woff2':'font/woff2'};
const photos=new Map(),before=new Map();
const page='<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script type="importmap">{"imports":{"three":"/bag3d/vendor/three/three.module.min.js","three/addons/":"/bag3d/vendor/three/addons/"}}</script><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/disc3d.css"><link rel="stylesheet" href="/my-bag.css"><style>body{margin:0;padding:12px;background:#0f1418;color:#e8eef2;font:600 14px system-ui,sans-serif}.row{display:flex;gap:10px;flex-wrap:wrap}.row figure{margin:0}.row figcaption{padding:2px 2px 6px}.host{width:600px;height:450px;position:relative}.disc3d-viewport{height:100%}.host>div>:not(.disc3d-viewport),.disc3d-hint,.disc3d-expand{display:none!important}.bag{width:900px;height:620px;position:relative}</style><div id="editor"></div><div id="stage" class="row"></div>';
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(req.method==='PUT'){const chunks=[];req.on('data',c=>chunks.push(c));req.on('end',()=>{photos.set(url.pathname.slice(8),Buffer.concat(chunks));res.end('ok');});return;}
 if(url.pathname==='/'){res.writeHead(200,{'Content-Type':types['.html']});res.end(page);return;}
 if(url.pathname.match(/^\/api\/bag\/discs\/[^/]+\/photo$/)){const photo=photos.get(url.searchParams.get('v'));res.writeHead(photo?200:404,{'Content-Type':'image/webp','Cache-Control':'private, no-store'});res.end(photo);return;}
 // BEFORE's modules: /before/<path> is git's public/<path> at BEFORE; /before-photo.mjs is BEFORE's crop and
 // export code importing today's albedo module (the comparison isolates disc-photo.mjs).
 if(url.pathname.startsWith('/before/')||url.pathname==='/before-photo.mjs'){
  const source=url.pathname==='/before-photo.mjs'?'public/disc-photo.mjs':'public/'+url.pathname.slice(8);
  if(!before.has(source))before.set(source,execFileSync('git',['show',BEFORE+':'+source],{maxBuffer:1<<28}));
  res.writeHead(200,{'Content-Type':types[path.extname(source)]||'application/octet-stream'});res.end(before.get(source));return;
 }
 const file=url.pathname.startsWith('/tests/')?'.'+url.pathname:'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu']});
const numbers={},near=(value,target,tolerance,label)=>{assert.ok(Math.abs(value-target)<=tolerance,`${label}: ${value.toFixed(3)}° (want ${target}° ± ${tolerance}°)`);numbers[label]=+value.toFixed(3);console.log('ok -',label,value.toFixed(2)+'°');};
try{
 const tab=await browser.newPage({viewport:{width:1300,height:1000},deviceScaleFactor:1});
 const errors=[];tab.on('pageerror',e=>errors.push(e.message));
 await tab.goto(base+'/');
 // Helpers in the page: the measure module, the Pixel's record, a texture's angle, detail viewers showing a
 // photo, and a blank (the same disc without its stamp) every render is compared with.
 await tab.evaluate(async()=>{
  window.measure=await import('/tests/photo-level-measure.mjs');window.photo=await import('/disc-photo.mjs');
  window.pixel=(await (await fetch('/data.json')).json()).discs.find(d=>d.name==='Pixel');
  window.textureAngle=async blob=>{const image=await createImageBitmap(blob),{data,width}=measure.pixelsOf(image);image.close();return measure.stampAngle(data,width);};
  window.upload=async(blob,key)=>{await fetch('/upload/'+key,{method:'PUT',body:blob});return '/api/bag/discs/d1/photo?v='+key;};
  const bitmap=await createImageBitmap(measure.crookedPhoto({stamp:false})),{blob}=await photo.preparePhoto(bitmap,{});bitmap.close();
  window.blankURL=await upload(blob,'f0.webp');
  const {createDiscViewer}=await import('/disc3d/viewer.mjs');
  window.discProps=url=>({photoURL:url,model:pixel.model3d||null,specs:pixel.specs,flight:{speed:pixel.speed,turn:pixel.turn,fade:pixel.fade},mold:'Pixel',color:'#e4703a',plastic:'premium',hand:'RHBH',manufacturer:pixel.manufacturer,record:pixel.name});
  window.showViewers=async list=>{
   const stage=document.querySelector('#stage');for(const v of window.viewers||[])v.viewer.dispose();stage.innerHTML='';window.viewers=[];
   for(const {url,view,label} of list){
    const figure=document.createElement('figure');figure.innerHTML=`<figcaption>${label}</figcaption><div class="host"></div>`;stage.append(figure);
    const viewer=createDiscViewer();viewer.attach(figure.querySelector('.host'));viewer.update(discProps(url));viewer.setView(view);window.viewers.push({viewer,view,url});
   }
  };
  window.decode=async b64=>{const image=await createImageBitmap(await (await fetch('data:image/png;base64,'+b64)).blob()),p=measure.pixelsOf(image);image.close();return p;};
  window.shotAngle=async(stamped,blank)=>{const a=await decode(stamped),b=await decode(blank);return measure.renderedStampAngle(a.data,b.data,a.width);};
 });
 const viewersReady=async()=>{await tab.waitForFunction(()=>window.viewers.every(({viewer})=>viewer.debug.photo?.userData.photoReady));await tab.waitForTimeout(800);};
 // The stamp's angle on each viewer as drawn: a screenshot with its photo, then one with the blank in the same
 // pose (only the photo changes, so the camera stays), compared; then the photos go back.
 const renderAngles=async()=>{
  const hosts=await tab.locator('#stage .host').all(),shots=async()=>{const list=[];for(const host of hosts)list.push((await host.screenshot()).toString('base64'));return list;};
  const stamped=await shots();
  await tab.evaluate(()=>viewers.forEach(({viewer})=>viewer.update(discProps(blankURL))));await viewersReady();const blank=await shots();
  await tab.evaluate(()=>viewers.forEach(({viewer,url})=>viewer.update(discProps(url))));await viewersReady();
  const angles=[];for(let i=0;i<hosts.length;i++)angles.push(await tab.evaluate(([a,b])=>shotAngle(a,b),[stamped[i],blank[i]]));return angles;
 };

 // 1. Characterize: a level photo stays level everywhere it is shown.
 const level=await tab.evaluate(async()=>{
  const bitmap=await createImageBitmap(measure.crookedPhoto({tilt:0})),{blob}=await photo.preparePhoto(bitmap,{});bitmap.close();
  return {texture:await textureAngle(blob),url:await upload(blob,'a0.webp')};
 });
 near(level.texture,0,.15,'level photo: texture');
 await tab.evaluate(url=>showViewers([{url,view:'top',label:'Level photo · top'},{url,view:'angle',label:'Level photo · 3/4'}]),level.url);await viewersReady();
 await tab.locator('#stage').screenshot({path:dir+'/level-photo-viewer.jpg',type:'jpeg',quality:85});
 const [levelTop,levelAngle]=await renderAngles();
 near(levelTop,0,.3,'level photo: detail viewer top');near(levelAngle,0,.3,'level photo: detail viewer 3/4');
 assert.deepEqual(await tab.evaluate(()=>viewers.map(({viewer})=>{const p=viewer.getPose();return [p.tilt,p.flipped];})),[[0,false],[0,false]],'the viewer opens flat, unflipped');
 // The 3D bag: the same disc slid out and floating beside the bag, in BEFORE's viewer and today's.
 const bagShot=async(module,url)=>{
  const clip=await tab.evaluate(async({module,url})=>{
   const stage=document.querySelector('#stage');for(const v of window.viewers||[])v.viewer.dispose();window.viewers=[];window.bag?.dispose?.();stage.innerHTML='<div class="bag"></div>';
   const {mountBag}=await import(module),key=url.split('v=')[1];
   const bag=window.bag=await mountBag(stage.firstChild,{background:'transparent',interaction:'turntable',turn:false,view:'page',animated:false,quality:'high',toneMapping:'neutral',
    layout:{main:[{item:{id:'d1',texture_key:key,color:'#e4703a',mold_id:pixel.id},mold:pixel}],putter:[],goTo:[]}});
   await bag.stageDiscs(['d1'],{instant:true});await new Promise(r=>setTimeout(r,1500));
   const rect=bag.outRect('d1'),box=stage.firstChild.getBoundingClientRect();return {x:rect.left+box.left,y:rect.top+box.top,width:rect.width,height:rect.height};
  },{module,url});
  await tab.waitForTimeout(400);return tab.screenshot({clip});
 };
 for(const [label,module] of [['before','/before/bag3d/viewer.mjs'],['after','/bag3d/viewer.mjs']]){
  const stamped=await bagShot(module,level.url),blank=await bagShot(module,await tab.evaluate(()=>blankURL));
  fs.writeFileSync(`${dir}/bag-floating-${label}.png`,stamped);
  const angle=await tab.evaluate(([a,b])=>shotAngle(a,b),[stamped.toString('base64'),blank.toString('base64')]);
  if(label==='before'){assert.ok(Math.abs(angle)>2,'BEFORE: the floating disc rolled the stamp ('+angle.toFixed(2)+'°)');numbers['level photo: floating out of the bag, before fix']=+angle.toFixed(3);console.log('ok - before fix, floating disc roll',angle.toFixed(2)+'°');}
  else near(angle,0,.3,'level photo: floating out of the bag, after fix');
 }
 await tab.evaluate(()=>{window.bag?.dispose?.();window.bag=null;document.querySelector('#stage').innerHTML='';});

 // 2. The aligner levels a photo whose stamp is turned 3° counterclockwise.
 if(!fs.existsSync(fixture)){
  const jpeg=await tab.evaluate(()=>measure.crookedPhoto({tilt:-3}).toDataURL('image/jpeg',.9));
  fs.writeFileSync(fixture,Buffer.from(jpeg.split(',')[1],'base64'));
 }
 await tab.setViewportSize({width:412,height:915});
 await tab.evaluate(()=>{window.colors=[];window.editor=photo.createPhotoEditor(document.querySelector('#editor'),{onColor:c=>colors.push(c)});});
 await tab.locator('.bag-photo-file').setInputFiles(fixture);await tab.locator('.photo-aligner[open]').waitFor();
 const crooked=await tab.evaluate(async()=>{const {blob}=await photo.preparePhoto(editor.debug.draft.bitmap,editor.debug.draft.options);return {angle:await textureAngle(blob),url:await upload(blob,'b0.webp')};});
 near(crooked.angle,-3,.2,'crooked photo: texture before levelling');
 const rotate=()=>tab.evaluate(()=>editor.debug.draft.options.rotate),readout=()=>tab.locator('.photo-aligner-angle').textContent();
 await tab.locator('[data-level-lines]').click();assert.equal(await tab.locator('[data-level-lines]').getAttribute('aria-pressed'),'true');
 await tab.waitForTimeout(400);await tab.locator('.photo-aligner').screenshot({path:dir+'/aligner-crooked.png'});
 for(let i=0;i<3;i++)await tab.locator('[data-rotate="0.1"]').click();
 assert.ok(Object.is(await rotate(),.3),'three 0.1° nudges land on exactly 0.3');assert.equal(await readout(),'+0.3°');
 await tab.locator('[data-rotate-zero]').click();assert.ok(Object.is(await rotate(),0),'0° snaps back to exactly 0');assert.equal(await readout(),'0.0°');
 await tab.locator('[data-rotate="-1"]').click();assert.equal(await readout(),'−1.0°');
 await tab.locator('.photo-aligner-view').focus();await tab.keyboard.press('BracketRight');assert.ok(Object.is(await rotate(),-.9),'] nudges 0.1° clockwise');
 await tab.keyboard.press('Shift+BracketRight');assert.ok(Object.is(await rotate(),.1),'Shift+] nudges 1°');
 await tab.locator('[data-rotate-zero]').click();
 for(let i=0;i<3;i++)await tab.locator('[data-rotate="1"]').click();
 assert.ok(Object.is(await rotate(),3));assert.equal(await readout(),'+3.0°');assert.equal(await tab.locator('[data-photo="rotate"]').inputValue(),'3');
 await tab.waitForTimeout(400);await tab.locator('.photo-aligner').screenshot({path:dir+'/aligner-levelled.png'});
 await tab.locator('[data-aligner-confirm]').click();await tab.locator('.photo-aligner').waitFor({state:'hidden'});
 const levelled=await tab.evaluate(async()=>{
  const used=editor.debug.used,bytes=new Uint8Array(await used.blob.arrayBuffer());
  // The level lines were on: the upload is still exactly the pipeline's output for this photo and angle.
  const {blob}=await photo.preparePhoto(used.bitmap,used.options),again=new Uint8Array(await blob.arrayBuffer());
  return {angle:await textureAngle(used.blob),size:bytes.length,riff:String.fromCharCode(...bytes.slice(0,4))+String.fromCharCode(...bytes.slice(8,12)),
   chromeFree:again.length===bytes.length&&again.every((v,i)=>v===bytes[i]),colors:colors.length,url:await upload(used.blob,'b3.webp')};
 });
 near(levelled.angle,0,.2,'crooked photo: texture after +3.0° in the aligner');
 assert.ok(levelled.chromeFree,'level lines never reach the upload');assert.ok(levelled.size<=512*1024);assert.equal(levelled.riff,'RIFFWEBP');assert.equal(levelled.colors,1,'a new photo still matches the disc colour');
 await tab.setViewportSize({width:1300,height:1000});
 await tab.evaluate(({a,b})=>showViewers([{url:a,view:'top',label:'As photographed · top'},{url:b,view:'top',label:'Levelled +3.0° · top'},{url:a,view:'angle',label:'As photographed · 3/4'},{url:b,view:'angle',label:'Levelled +3.0° · 3/4'}]),{a:crooked.url,b:levelled.url});await viewersReady();
 const rendered=await renderAngles();
 near(rendered[0],-3,.3,'crooked photo: detail viewer top, before');near(rendered[1],0,.3,'crooked photo: detail viewer top, levelled');near(rendered[3],0,.3,'crooked photo: detail viewer 3/4, levelled');
 await tab.locator('#stage').screenshot({path:dir+'/aligner-before-after-viewer.jpg',type:'jpeg',quality:85});

 // 3. After saving: the crooked texture is saved; Level stamp opens it again and only the angle can change.
 await tab.setViewportSize({width:412,height:915});
 await tab.evaluate(()=>{for(const v of window.viewers)v.viewer.dispose();window.viewers=[];document.querySelector('#stage').innerHTML='';editor.reset({id:'d1',texture_key:'b0.webp'},pixel);colors.length=0;});
 assert.equal(await tab.locator('.bag-photo-level').isVisible(),true,'a saved photo offers Level stamp');assert.equal(await tab.locator('.bag-photo-adjust').isVisible(),false);
 await tab.locator('.bag-photo-level').click();await tab.locator('.photo-aligner[open]').waitFor();
 assert.equal(await tab.locator('#photoAlignerTitle').textContent(),'Level the stamp');
 assert.equal(await tab.locator('.photo-aligner-level').isVisible(),true,'the level row is out on a phone');
 await tab.locator('.photo-aligner-adjust summary').click();
 assert.equal(await tab.locator('.photo-aligner [data-photo="scale"]').isVisible(),false,'framing is not offered');assert.equal(await tab.locator('.photo-aligner [data-photo="rotate"]').isVisible(),true);
 await tab.locator('.photo-aligner-adjust summary').click();
 const framing=await tab.evaluate(()=>({...editor.debug.draft.options}));
 const view=await tab.locator('.photo-aligner-view').boundingBox();
 await tab.mouse.move(view.x+view.width/2,view.y+view.height/2);await tab.mouse.down();await tab.mouse.move(view.x+view.width/2+80,view.y+view.height/2+40,{steps:4});await tab.mouse.up();
 await tab.mouse.wheel(0,400);await tab.locator('.photo-aligner-view').focus();await tab.keyboard.press('ArrowLeft');await tab.keyboard.press('-');
 assert.deepEqual(await tab.evaluate(()=>({...editor.debug.draft.options})),framing,'drag, wheel and keys leave the saved framing alone');
 // At 0°, the re-export is the saved texture again, through one more WebP encode (the quality note).
 await tab.locator('[data-aligner-confirm]').click();await tab.locator('.photo-aligner').waitFor({state:'hidden'});
 const copy=await tab.evaluate(async()=>{
  const decode=async blob=>{const image=await createImageBitmap(blob),p=measure.pixelsOf(image);image.close();return p;};
  const saved=await decode(await (await fetch('/api/bag/discs/d1/photo?v=b0.webp')).blob()),again=await decode(editor.debug.used.blob);
  let sum=0,max=0,n=0;for(let i=0;i<saved.data.length;i+=4){if(saved.data[i+3]<255||again.data[i+3]<255)continue;for(let c=0;c<3;c++){const d=saved.data[i+c]-again.data[i+c];sum+=d*d;max=Math.max(max,Math.abs(d));}n+=3;}
  return {size:[again.width,again.height],psnr:10*Math.log10(255*255/(sum/n)),max,angle:measure.stampAngle(again.data,again.width)};
 });
 assert.deepEqual(copy.size,[1024,1024]);assert.ok(copy.psnr>38,'one more encode at 0°: PSNR '+copy.psnr.toFixed(1)+' dB');near(copy.angle,-3,.2,'saved photo: re-exported at 0° (unchanged)');
 numbers['re-export at 0°: PSNR dB']=+copy.psnr.toFixed(2);numbers['re-export at 0°: max channel difference']=copy.max;
 // Adjust reopens the levelling step on the same saved texture, not on the re-export: one resample in all.
 assert.equal(await tab.locator('.bag-photo-adjust').isVisible(),true);await tab.locator('.bag-photo-adjust').click();await tab.locator('.photo-aligner[open]').waitFor();
 assert.equal(await tab.locator('#photoAlignerTitle').textContent(),'Level the stamp');
 for(let i=0;i<3;i++)await tab.locator('[data-rotate="1"]').click();
 await tab.locator('[data-level-lines]').evaluate(b=>b.getAttribute('aria-pressed')==='true'||b.click());
 await tab.waitForTimeout(400);await tab.locator('.photo-aligner').screenshot({path:dir+'/relevel-saved.png'});
 await tab.locator('[data-aligner-confirm]').click();await tab.locator('.photo-aligner').waitFor({state:'hidden'});
 const relevelled=await tab.evaluate(async()=>{
  const used=editor.debug.used,bytes=new Uint8Array(await used.blob.arrayBuffer()),image=await createImageBitmap(used.blob),size=[image.width,image.height];image.close();
  return {angle:await textureAngle(used.blob),size,bytes:bytes.length,riff:String.fromCharCode(...bytes.slice(0,4))+String.fromCharCode(...bytes.slice(8,12)),colors:colors.length,changed:editor.changed,value:(await editor.value()).size,url:await upload(used.blob,'c3.webp')};
 });
 near(relevelled.angle,0,.2,'saved photo: texture after re-levelling +3.0°');
 assert.deepEqual(relevelled.size,[1024,1024]);assert.ok(relevelled.bytes<=512*1024);assert.equal(relevelled.riff,'RIFFWEBP');
 assert.equal(relevelled.colors,0,'re-levelling keeps the disc colour');assert.equal(relevelled.changed,true);assert.equal(relevelled.value,relevelled.bytes,'the sheet saves the re-levelled photo');
 await tab.setViewportSize({width:1300,height:1000});
 await tab.evaluate(({a,b})=>showViewers([{url:a,view:'top',label:'Saved crooked · top'},{url:b,view:'top',label:'Re-levelled after saving · top'},{url:a,view:'angle',label:'Saved crooked · 3/4'},{url:b,view:'angle',label:'Re-levelled after saving · 3/4'}]),{a:crooked.url,b:relevelled.url});await viewersReady();
 const after=await renderAngles();near(after[1],0,.3,'saved photo: detail viewer top, re-levelled');near(after[3],0,.3,'saved photo: detail viewer 3/4, re-levelled');
 await tab.locator('#stage').screenshot({path:dir+'/relevel-saved-viewer.jpg',type:'jpeg',quality:85});

 // 4. At 0° the export is BEFORE's, byte for byte (pixels, colour and WebP), for three framings.
 const parity=await tab.evaluate(async()=>{
  const old=await import('/before-photo.mjs'),image=await photo.decodePhoto(await (await fetch('/tests/fixtures/stamped-disc.webp')).blob()),rows=[];
  for(const options of [{},{rotate:0},{scale:.8,aspect:1.1,angle:35,perspective:.08,cx:.45,cy:.55,rotate:0}]){
   const a=photo.photoCanvas(image,options,512).getContext('2d').getImageData(0,0,512,512).data,b=old.photoCanvas(image,options,512).getContext('2d').getImageData(0,0,512,512).data;
   const x=await photo.preparePhoto(image,options),y=await old.preparePhoto(image,options),xb=new Uint8Array(await x.blob.arrayBuffer()),yb=new Uint8Array(await y.blob.arrayBuffer());
   rows.push({pixels:a.every((v,i)=>v===b[i]),color:x.color===y.color,bytes:xb.length===yb.length&&xb.every((v,i)=>v===yb[i])});
  }
  image.close();return rows;
 });
 assert.deepEqual(parity,Array.from({length:3},()=>({pixels:true,color:true,bytes:true})),'0° export is byte-identical to '+BEFORE);
 console.log('ok - 0° export byte-identical to',BEFORE,'(pixels, colour, WebP) for three framings');
 assert.deepEqual(errors,[]);
}finally{await browser.close();server.close();}
fs.writeFileSync(dir+'/results.json',JSON.stringify(numbers,null,1)+'\n');
console.log('PASS: stamp levelling: characterization, aligner tools, post-save re-level, 0° parity. Shots in '+dir);
