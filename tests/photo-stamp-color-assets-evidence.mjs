// Evidence for docs/photo-stamp-color-assets.md: a player's own photos through the real product flow on the local
// signed-in harness (tests/display-harness.mjs), then the photo, the one-ink game asset (v1) and the full-colour asset
// (v2) side by side in the viewer (3/4, Top, and Top zoomed) and in the bag (desktop and phone).
//
// Photos are the player's and are never committed. They are read only from the ignored work/photo-stamp-color-assets/
// photos/ (framing.json there names each file, its catalog mold, plastic and aligner framing), and everything this writes
// goes to the ignored work/photo-stamp-color-assets/evidence/. Without that folder it stops: there is no fixture stand-in.
//   node tests/photo-stamp-color-assets-evidence.mjs
// With --finish-only it takes only the colour asset in each disc's chosen finish (for comparing finish strengths) into
// evidence/<disc>-<--tag>-*.png.
import fs from 'node:fs';
import {startHarness} from './display-harness.mjs';

const PHOTOS='work/photo-stamp-color-assets/photos',OUT='work/photo-stamp-color-assets/evidence';
// A finish per disc for the "chosen finish" column, close to what each disc really wears.
const CHOSEN={destroyer:['silver','rainbow'],dd3:['silver','shatter']};
const finishOnly=process.argv.includes('--finish-only'),tag=process.argv[process.argv.indexOf('--tag')+1]||'colorFull';
if(!fs.existsSync(PHOTOS+'/framing.json')){console.error('No photos in '+PHOTOS+' (framing.json): nothing to show.');process.exit(1);}
const cases=JSON.parse(fs.readFileSync(PHOTOS+'/framing.json','utf8'));
fs.mkdirSync(OUT,{recursive:true});
const results={cases:{}};

// At a phone's and a laptop's real density, so fine line work is judged as it is seen.
const h=await startHarness({port:Number(process.env.PHOTO_STAMP_PORT||8879),state:'work/photo-stamp-color-assets/d1',deviceScaleFactor:2});
const {page,base,errors}=h;
const wait=ms=>page.waitForTimeout(ms);
try{
 await h.signIn();
 await h.seedBag(Object.entries(cases).map(([name,c])=>({mold_id:c.mold,plastic:c.plastic,wear:8,weight_g:174,color:'#888888',notes:name})));
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=2);
 const items=async()=>(await page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs));

 // The aligner's own controls set the framing, as a player would (as tests/photo-stamp-assets-evidence.mjs does).
 async function frame(framing,image){
  await page.waitForSelector('dialog.photo-aligner[open]');
  for(const k of ['scale','aspect','angle','perspective','rotate'])if(framing[k]!==undefined)await page.evaluate(([k,v])=>{const el=document.querySelector(`dialog.photo-aligner[open] [data-photo="${k}"]`);el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},[k,framing[k]]);
  const geo=await page.evaluate(()=>{const f=document.querySelector('dialog.photo-aligner[open] .photo-aligner-frame').getBoundingClientRect(),v=document.querySelector('dialog.photo-aligner[open] .photo-aligner-view').getBoundingClientRect();return {span:f.width/1.2,x:v.left+v.width/2,y:v.top+v.height/2};});
  const ratio=Math.min(1,2048/Math.max(image.width,image.height)),w=Math.round(image.width*ratio),hgt=Math.round(image.height*ratio),radius=Math.min(w,hgt)*(framing.scale??.94);
  const dx=-((framing.cx??.5)-.5)*w*geo.span/radius,dy=-((framing.cy??.5)-.5)*hgt*geo.span/radius;
  await page.mouse.move(geo.x,geo.y);await page.mouse.down();
  for(let i=1;i<=8;i++)await page.mouse.move(geo.x+dx*i/8,geo.y+dy*i/8);
  await page.mouse.up();await wait(300);
 }
 const sizeOf=file=>{const b=fs.readFileSync(file);for(let i=2;i<b.length;){const m=b[i+1],len=b.readUInt16BE(i+2);if(m>=0xc0&&m<=0xc3)return {height:b.readUInt16BE(i+5),width:b.readUInt16BE(i+7)};i+=2+len;}throw Error('no JPEG size');};
 const blobOf=asset=>page.evaluate(asset=>import('/disc3d/photo-stamps.mjs').then(m=>m.photoStampBlob(asset)).then(b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(b);})),asset);

 for(const [name,c] of Object.entries(cases)){
  const file=PHOTOS+'/'+c.file,image=sizeOf(file),item=(await items()).find(i=>i.notes===name);
  results.cases[name]={source:c.source,mold:c.mold,framing:c.framing,width:image.width,height:image.height,id:item.id};
  // 1. Today's flow: the photo, framed and used, then the sheet saved.
  await page.locator(`[data-bag-edit="${item.id}"]`).click();await page.waitForSelector('#addDiscDialog[open]');
  await page.setInputFiles('#addDiscDialog .bag-photo-file',file);
  await frame(c.framing,image);
  await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
  await page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]'),null,{timeout:60000});
  await page.locator('#saveDisc').click();await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'),null,{timeout:60000});
  const saved=(await items()).find(i=>i.id===item.id);if(!saved.texture_key)throw Error(name+': the photo did not save');
  results.cases[name].plate=saved.color;results.cases[name].texture_key=saved.texture_key;
  // 2. The new flow: Look → Full color, the original framed the same way; one read makes both assets.
  await page.locator(`[data-bag-edit="${item.id}"]`).click();await page.waitForSelector('#addDiscDialog[open] .bag-photo-look:not([hidden])');
  const chooser=page.waitForEvent('filechooser');
  await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Full color'}).click();
  await (await chooser).setFiles(file);
  await frame(c.framing,image);
  const started=Date.now();
  await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
  await page.waitForFunction(()=>/Full-color asset made/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:180000});
  results.cases[name].makeMs=Date.now()-started;
  const looks=await page.evaluate(([id,key])=>import('/disc3d/photo-stamps.mjs').then(m=>{const url='/api/bag/discs/'+encodeURIComponent(id)+'/photo?v='+encodeURIComponent(key),color=m.photoStampFor(url);m.setPhotoLook(id,key,'asset');const one=m.photoStampFor(url);m.setPhotoLook(id,key,'color');return {color,one};}),[item.id,saved.texture_key]);
  results.cases[name].assets=looks;
  // The assets themselves, as stored.
  const one=Buffer.from(await blobOf(looks.one.asset),'base64'),color=Buffer.from(await blobOf(looks.color.asset),'base64');
  fs.writeFileSync(`${OUT}/${name}-asset.png`,one);fs.writeFileSync(`${OUT}/${name}-color.webp`,color);
  results.cases[name].bytes={oneInk:one.length,color:color.length};
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'));
  console.log(name,JSON.stringify(results.cases[name]));
 }

 // 3. Captures.
 const stage=()=>page.locator('#detail .disc3d-stage');
 const setLook=(c,look)=>page.evaluate(([id,key,look])=>import('/disc3d/photo-stamps.mjs').then(m=>m.setPhotoLook(id,key,look)),[c.id,c.texture_key,look]);
 const setStamp=(ink,finish)=>page.evaluate(([ink,finish])=>DisplayPalette.setStamp({ink,finish}),[ink,finish]);
 // The viewer as My Bag opens it for one of the player's discs: 3/4, Top, and Top's centre at twice the size.
 async function viewerShots(id){
  await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-inspect]').length>=2);await wait(800);
  await page.locator(`[data-bag-inspect="${id}"]`).first().click();
  await page.waitForFunction(()=>document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready');await wait(2500);
  const view=name=>page.locator('#detail [data-disc3d] button',{hasText:new RegExp('^'+name+'$')}).click();
  await view('3/4');await wait(900);const a=await stage().screenshot();
  await view('Top');await wait(900);const top=await stage().screenshot(),box=await stage().boundingBox();
  const zoom=await page.screenshot({clip:{x:box.x+box.width*.25,y:box.y+box.height*.25,width:box.width*.5,height:box.height*.5}});
  return [a,top,zoom];
 }
 // The bag with the disc pulled out: desktop, and a phone, where the bag and its pulled disc are smallest.
 async function bagShots(id){
  const shots=[];
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
   await page.setViewportSize(viewport);
   await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelector('#bagScene')?.dataset.phase==='open');await wait(1500);
   await page.locator('#bagScene').evaluate(n=>n.scrollIntoView({block:'start'}));await wait(300);
   await page.locator(`[data-physical-disc="${id}"]`).evaluate(n=>n.click());await wait(3000);
   const box=await page.locator('#bagScene').boundingBox();
   shots.push(await page.screenshot({clip:{x:0,y:Math.max(0,box.y),width:viewport.width,height:Math.min(viewport.height-Math.max(0,box.y),box.height)}}));
  }
  await page.setViewportSize({width:1440,height:1000});
  return shots;
 }
 const take=async(c,key)=>{const [v34,vTop,vZoom]=await viewerShots(c.id),[bag,bagPhone]=await bagShots(c.id);for(const [view,png] of Object.entries({v34,vTop,vZoom,bag,bagPhone}))fs.writeFileSync(`${OUT}/${c.name}-${key}-${view}.png`,png);};
 for(const [name,c] of Object.entries(results.cases)){
  c.name=name;const [ink,finish]=CHOSEN[name]||['silver','foil'];
  if(finishOnly){await setLook(c,'color');await setStamp(ink,finish);await take(c,tag);await setStamp('auto','flat');continue;}
  await setStamp('auto','flat');
  await setLook(c,'photo');await take(c,'photo');
  await setLook(c,'asset');await take(c,'asset');
  await setLook(c,'color');await take(c,'color');
  await setStamp(ink,finish);c.chosen=`${ink} ${finish}`;
  await take(c,'colorChosen');
  await setLook(c,'asset');await take(c,'assetChosen');
  await setStamp('auto','flat');
 }
 if(!finishOnly){
  // The other personal surfaces in the colour look: the map still, the bag list thumbnail, the gallery.
  for(const c of Object.values(results.cases))await setLook(c,'color');
  await page.goto(base+'/');await page.waitForFunction(()=>typeof discs!=='undefined'&&discs.length>0);
  const stills=await page.evaluate(async([list])=>{
   const art=await (await import('/disc3d/atlas-art.mjs')).getAtlasArt(),out=[];
   for(const c of list){const d=discs.find(d=>d.id===c.mold),photoURL='/api/bag/discs/'+encodeURIComponent(c.id)+'/photo?v='+encodeURIComponent(c.texture_key);
    let e;for(let i=0;i<60;i++){e=art.render({...d,photoURL},c.plate,320,undefined,'full',true);if(e&&!e.pending)break;await new Promise(r=>setTimeout(r,100));}
    out.push(e.canvas.toDataURL('image/png').split(',')[1]);}
   return out;
  },[Object.values(results.cases)]);
  Object.keys(results.cases).forEach((name,i)=>fs.writeFileSync(`${OUT}/${name}-color-mapstill.png`,Buffer.from(stills[i],'base64')));
  await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelector('#bagScene')?.dataset.phase==='open');await wait(1200);
  await page.evaluate(()=>document.querySelector('#myBagViews [data-bag-view="gallery"]').click());await wait(4000);
  fs.writeFileSync(`${OUT}/gallery-color.png`,await page.screenshot());
  await page.evaluate(()=>document.querySelector('#myBagViews [data-bag-view="bag"]').click());await wait(1500);
  await page.locator('#myBagContents').scrollIntoViewIfNeeded();await wait(1500);
  fs.writeFileSync(`${OUT}/list-color.png`,await page.locator('#myBagContents').screenshot());
  fs.writeFileSync(`${OUT}/results.json`,JSON.stringify(results,null,1));
 }
 if(errors.length)console.log('page errors',errors);
}finally{await h.stop();}
