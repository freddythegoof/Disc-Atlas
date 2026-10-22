// Evidence for docs/photo-stamp-one-click.md: a player's own photos, as they are and with a hard flash hotspot added
// across the stamp (work/photo-stamp-one-click/lab/flashphotos.mjs), through the real product flow on the local
// signed-in harness. Each disc's assets are made four ways and shown on the 3D model (Top, and its centre at twice the
// size) and pulled from the bag: from the stored photo in one click and from the camera original, each by this branch's
// extraction and by main's (the un-flattened extraction: origin/main's three extractor modules served in place of this
// branch's, from the ignored work/photo-stamp-one-click/lab/old/).
//
// Photos are the player's and are never committed: read only from the ignored work/photo-stamp-one-click/photos/, and
// everything this writes goes to the ignored work/photo-stamp-one-click/evidence/.
//   node tests/photo-stamp-one-click-evidence.mjs
import fs from 'node:fs';
import {startHarness} from './display-harness.mjs';

const PHOTOS='work/photo-stamp-one-click/photos',OLD='work/photo-stamp-one-click/lab/old',OUT='work/photo-stamp-one-click/evidence';
if(!fs.existsSync(PHOTOS+'/framing.json')||!fs.existsSync(OLD+'/disc-stamp-worker.mjs')){console.error('No photos or no main modules in work/photo-stamp-one-click: nothing to show.');process.exit(1);}
const framing=JSON.parse(fs.readFileSync(PHOTOS+'/framing.json','utf8'));
const cases=Object.entries(framing).flatMap(([name,c])=>[['clean',c.file],['flash',name+'-flash.jpg']].filter(([,f])=>fs.existsSync(PHOTOS+'/'+f)).map(([variant,file])=>({...c,name,variant,file})));
fs.mkdirSync(OUT,{recursive:true});
const results={cases:{}};

const h=await startHarness({port:Number(process.env.PHOTO_STAMP_PORT||8895),state:'work/photo-stamp-one-click/d1',deviceScaleFactor:2});
const {page,base,context}=h;
const wait=ms=>page.waitForTimeout(ms);
// main's extraction: its worker, mask and colour modules in place of this branch's.
const MAIN=/\/disc-stamp-(worker|extract|color)\.mjs(\?.*)?$/;
const useMain=async on=>{if(on)await context.route(MAIN,route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(OLD+'/disc-stamp-'+MAIN.exec(new URL(route.request().url()).pathname)[1]+'.mjs')}));else await context.unroute(MAIN);};
try{
 await h.signIn();
 await h.seedBag(cases.map(c=>({mold_id:c.mold,plastic:c.plastic,wear:8,weight_g:174,color:'#888888',notes:c.name+'-'+c.variant})));
 const items=async()=>(await page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs));
 const openBag=async()=>{await page.goto(base+'/?bag=1');await page.waitForFunction(n=>document.querySelectorAll('[data-bag-edit]').length>=n,cases.length);};
 const edit=async id=>{await page.locator(`[data-bag-edit="${id}"]`).first().evaluate(n=>n.click());await page.waitForSelector('#addDiscDialog[open] .bag-photo-look',{state:'attached'});};
 const closeSheet=async()=>{await page.evaluate(()=>{window.__closed=new Promise(r=>document.querySelector('#addDiscDialog').addEventListener('close',()=>setTimeout(r),{once:true}));});await page.keyboard.press('Escape');await page.evaluate(()=>window.__closed);};
 const status=()=>page.waitForFunction(()=>/^(?!Making the game asset)\S/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:240000}).then(()=>page.locator('#addDiscDialog .bag-photo-status').textContent());
 // The aligner's own controls set the framing, as a player would (as tests/photo-stamp-color-assets-evidence.mjs does).
 const sizeOf=file=>{const b=fs.readFileSync(file);for(let i=2;i<b.length;){const m=b[i+1],len=b.readUInt16BE(i+2);if(m>=0xc0&&m<=0xc3)return {height:b.readUInt16BE(i+5),width:b.readUInt16BE(i+7)};i+=2+len;}throw Error('no JPEG size');};
 async function frame(f,image){
  await page.waitForSelector('dialog.photo-aligner[open]');
  for(const k of ['scale','aspect','angle','perspective','rotate'])if(f[k]!==undefined)await page.evaluate(([k,v])=>{const el=document.querySelector(`dialog.photo-aligner[open] [data-photo="${k}"]`);el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},[k,f[k]]);
  const geo=await page.evaluate(()=>{const fr=document.querySelector('dialog.photo-aligner[open] .photo-aligner-frame').getBoundingClientRect(),v=document.querySelector('dialog.photo-aligner[open] .photo-aligner-view').getBoundingClientRect();return {span:fr.width/1.2,x:v.left+v.width/2,y:v.top+v.height/2};});
  const ratio=Math.min(1,2048/Math.max(image.width,image.height)),w=Math.round(image.width*ratio),hgt=Math.round(image.height*ratio),radius=Math.min(w,hgt)*(f.scale??.94);
  const dx=-((f.cx??.5)-.5)*w*geo.span/radius,dy=-((f.cy??.5)-.5)*hgt*geo.span/radius;
  await page.mouse.move(geo.x,geo.y);await page.mouse.down();for(let i=1;i<=8;i++)await page.mouse.move(geo.x+dx*i/8,geo.y+dy*i/8);await page.mouse.up();await wait(300);
 }
 const stage=()=>page.locator('#detail .disc3d-stage');
 const setLook=(c,look)=>page.evaluate(([id,key,look])=>import('/disc3d/photo-stamps.mjs').then(m=>m.setPhotoLook(id,key,look)),[c.id,c.texture_key,look]);
 async function shots(c,key){
  await openBag();await wait(800);
  await page.locator(`[data-bag-inspect="${c.id}"]`).first().click();
  await page.waitForFunction(()=>document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready');await wait(2500);
  await page.locator('#detail [data-disc3d] button',{hasText:/^Top$/}).click();await wait(900);
  fs.writeFileSync(`${OUT}/${c.tag}-${key}-vTop.png`,await stage().screenshot());
  const box=await stage().boundingBox();
  fs.writeFileSync(`${OUT}/${c.tag}-${key}-vZoom.png`,await page.screenshot({clip:{x:box.x+box.width*.25,y:box.y+box.height*.2,width:box.width*.5,height:box.height*.5}}));
  await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelector('#bagScene')?.dataset.phase==='open');await wait(1500);
  await page.locator('#bagScene').evaluate(n=>n.scrollIntoView({block:'start'}));await wait(300);
  await page.locator(`[data-physical-disc="${c.id}"]`).evaluate(n=>n.click());await wait(3000);
  const bag=await page.locator('#bagScene').boundingBox();
  fs.writeFileSync(`${OUT}/${c.tag}-${key}-bag.png`,await page.screenshot({clip:{x:0,y:Math.max(0,bag.y),width:1440,height:Math.min(1000-Math.max(0,bag.y),bag.height)}}));
 }
 // Both looks of what was just made, then the asset bytes as stored.
 async function record(c,key){
  for(const look of ['asset','color']){await setLook(c,look);await shots(c,key+'-'+look);}
  const blobs=await page.evaluate(([id,key])=>import('/disc3d/photo-stamps.mjs').then(async m=>{const url='/api/bag/discs/'+encodeURIComponent(id)+'/photo?v='+encodeURIComponent(key);
   const out={};for(const look of ['asset','color']){await m.setPhotoLook(id,key,look);const a=m.photoStampFor(url);const b=await m.photoStampBlob(a.asset);out[look]={type:b.type,data:await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(b);})};}return out;}),[c.id,c.texture_key]);
  for(const [look,b] of Object.entries(blobs))fs.writeFileSync(`${OUT}/${c.tag}-${key}-${look}.${b.type==='image/webp'?'webp':'png'}`,Buffer.from(b.data,'base64'));
 }
 const all=await items();
 for(const c of cases){
  c.tag=c.name+'-'+c.variant;c.id=all.find(i=>i.notes===c.tag).id;const file=PHOTOS+'/'+c.file,image=sizeOf(file);
  // The photo, framed and saved as today.
  await openBag();await edit(c.id);await page.setInputFiles('#addDiscDialog .bag-photo-file',file);await frame(c.framing,image);
  await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();await page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]'),null,{timeout:60000});
  await page.locator('#saveDisc').click();await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'),null,{timeout:60000});
  c.texture_key=(await items()).find(i=>i.id===c.id).texture_key;await setLook(c,'photo');await shots(c,'photo');
  const R=results.cases[c.tag]={file:c.file,texture_key:c.texture_key,made:{}};
  for(const [key,main,original] of [['stored',false,false],['stored-main',true,false],['original',false,true],['original-main',true,true]]){
   await useMain(main);await openBag();await edit(c.id);const t=Date.now();
   if(original){const chooser=page.waitForEvent('filechooser');await page.locator('#addDiscDialog .bag-photo-asset-original').click();await (await chooser).setFiles(file);await frame(c.framing,image);await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();}
   else await page.locator((await page.locator('#addDiscDialog .bag-photo-asset-make').isVisible())?'#addDiscDialog .bag-photo-asset-make':'#addDiscDialog .bag-photo-look label:has-text("Full color")').click();
   R.made[key]={status:await status(),ms:Date.now()-t};await closeSheet();await useMain(false);
   await record(c,key);console.log(c.tag,key,JSON.stringify(R.made[key]));
  }
 }
 fs.writeFileSync(`${OUT}/results.json`,JSON.stringify(results,null,1));
}finally{await h.stop();}
