// Evidence for docs/photo-stamp-assets.md: a player's own photos through the real product flow on the local signed-in
// harness (tests/display-harness.mjs), then the photo render, the game-asset render and the Discraft stock standard side
// by side in the viewer and the bag.
//
// Photos are the player's and are never committed. They are read only from the ignored work/photo-stamp-assets/photos/
// (framing.json there names each file, its catalog mold, plastic and aligner framing), and everything this writes goes
// to the ignored work/photo-stamp-assets/evidence/. Without that folder it stops: there is no fixture stand-in.
//   node tests/photo-stamp-assets-evidence.mjs
import fs from 'node:fs';
import {startHarness} from './display-harness.mjs';

const PHOTOS='work/photo-stamp-assets/photos',OUT='work/photo-stamp-assets/evidence',BUZZZ='7446eb39abe5';
// A finish per disc for the "chosen ink and finish" column, close to what each disc really wears.
const CHOSEN={destroyer:['silver','rainbow'],dd3:['silver','shatter']};
if(!fs.existsSync(PHOTOS+'/framing.json')){console.error('No photos in '+PHOTOS+' (framing.json): nothing to show.');process.exit(1);}
const cases=JSON.parse(fs.readFileSync(PHOTOS+'/framing.json','utf8'));
fs.mkdirSync(OUT,{recursive:true});
const results={cases:{}};

// At a phone's and a laptop's real density, so fine line work is judged as it is seen.
const h=await startHarness({port:Number(process.env.PHOTO_STAMP_PORT||8873),state:'work/photo-stamp-assets/d1',deviceScaleFactor:2});
const {page,base,browser,errors}=h;
const wait=ms=>page.waitForTimeout(ms);
try{
 await h.signIn();
 // The two photo discs, plus a Discraft Buzzz on each one's plate colour: the stock-stamp standard.
 const seeded=[...Object.entries(cases).map(([name,c])=>({mold_id:c.mold,plastic:c.plastic,wear:8,weight_g:174,color:'#888888',notes:name})),
  {mold_id:BUZZZ,plastic:'Z',wear:8,weight_g:177,color:'#888888',notes:'standard'}];
 await h.seedBag(seeded);
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=2);
 const items=async()=>(await page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs));

 // The aligner's own controls set the framing, as a player would: sliders for scale and tilt, a drag for the centre.
 async function frame(framing,image){
  await page.waitForSelector('dialog.photo-aligner[open]');
  for(const k of ['scale','aspect','angle','perspective','rotate'])if(framing[k]!==undefined)await page.evaluate(([k,v])=>{const el=document.querySelector(`dialog.photo-aligner[open] [data-photo="${k}"]`);el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},[k,framing[k]]);
  // One-pointer pan (disc-photo.mjs): cx moves by -dx/span*radius/w, with span the frame width over VIEW (1.2), radius
  // the working copy's short side times scale, and w,h the 2048-px working copy.
  const geo=await page.evaluate(()=>{const f=document.querySelector('dialog.photo-aligner[open] .photo-aligner-frame').getBoundingClientRect(),v=document.querySelector('dialog.photo-aligner[open] .photo-aligner-view').getBoundingClientRect();return {span:f.width/1.2,x:v.left+v.width/2,y:v.top+v.height/2};});
  const ratio=Math.min(1,2048/Math.max(image.width,image.height)),w=Math.round(image.width*ratio),hgt=Math.round(image.height*ratio),radius=Math.min(w,hgt)*(framing.scale??.94);
  const dx=-((framing.cx??.5)-.5)*w*geo.span/radius,dy=-((framing.cy??.5)-.5)*hgt*geo.span/radius;
  await page.mouse.move(geo.x,geo.y);await page.mouse.down();
  for(let i=1;i<=8;i++)await page.mouse.move(geo.x+dx*i/8,geo.y+dy*i/8);
  await page.mouse.up();await wait(300);
 }
 const sizeOf=file=>{const b=fs.readFileSync(file);for(let i=2;i<b.length;){const m=b[i+1],len=b.readUInt16BE(i+2);if(m>=0xc0&&m<=0xc3)return {height:b.readUInt16BE(i+5),width:b.readUInt16BE(i+7)};i+=2+len;}throw Error('no JPEG size');};

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
  // 2. The new flow: Look → Game asset, the original framed the same way, the asset made in this browser.
  await page.locator(`[data-bag-edit="${item.id}"]`).click();await page.waitForSelector('#addDiscDialog[open] .bag-photo-look:not([hidden])');
  const chooser=page.waitForEvent('filechooser');
  await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Game asset'}).click();
  await (await chooser).setFiles(file);
  await frame(c.framing,image);
  const started=Date.now();
  await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
  await page.waitForFunction(()=>/Game asset made/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:120000});
  results.cases[name].makeMs=Date.now()-started;
  const look=await page.evaluate(([id,key])=>import('/disc3d/photo-stamps.mjs').then(m=>({look:m.photoLook(id,key),stamp:m.photoStampFor('/api/bag/discs/'+encodeURIComponent(id)+'/photo?v='+encodeURIComponent(key))})),[item.id,saved.texture_key]);
  results.cases[name].asset=look;
  // The asset itself, as stored.
  const png=await page.evaluate(asset=>import('/disc3d/photo-stamps.mjs').then(m=>m.photoStampBlob(asset)).then(b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(b);})),look.stamp.asset);
  fs.writeFileSync(`${OUT}/${name}-asset.png`,Buffer.from(png,'base64'));results.cases[name].assetBytes=Buffer.from(png,'base64').length;
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'));
  console.log(name,JSON.stringify(results.cases[name]));
 }

 // 3. Captures. The Buzzz is the Discraft stock standard, recoloured to each disc's own plate between cases.
 const ready=()=>page.waitForFunction(()=>typeof discs!=='undefined'&&discs.length>0&&typeof DisplayPalette!=='undefined');
 const stage=()=>page.locator('#detail .disc3d-stage');
 const setLook=(c,look)=>page.evaluate(([id,key,look])=>import('/disc3d/photo-stamps.mjs').then(m=>m.setPhotoLook(id,key,look)),[c.id,c.texture_key,look]);
 const setStamp=(ink,finish)=>page.evaluate(([ink,finish])=>DisplayPalette.setStamp({ink,finish}),[ink,finish]);
 // The viewer as My Bag opens it for one of the player's discs (its details, docked beside the bag).
 async function viewerShots(id){
  await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-inspect]').length>=2);await wait(800);
  await page.locator(`[data-bag-inspect="${id}"]`).first().click();
  await page.waitForFunction(()=>document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready');await wait(2500);
  const view=name=>page.locator('#detail [data-disc3d] button',{hasText:new RegExp('^'+name+'$')}).click();
  await view('3/4');await wait(900);const a=await stage().screenshot();
  await view('Top');await wait(900);return [a,await stage().screenshot()];
 }
 // The bag with the disc pulled out: desktop, and a phone, where the bag and its pulled disc are smallest.
 async function bagShots(id){
  const shots=[];
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
   await page.setViewportSize(viewport);
   await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelector('#bagScene')?.dataset.phase==='open');await wait(1500);
   await page.locator('#bagScene').evaluate(n=>n.scrollIntoView({block:'start'}));await wait(300);
   await page.locator(`[data-physical-disc="${id}"]`).evaluate(n=>n.click());await wait(3000);
   // The scene, full width: a pulled disc stands out past the scene's own box.
   const box=await page.locator('#bagScene').boundingBox();
   shots.push(await page.screenshot({clip:{x:0,y:Math.max(0,box.y),width:viewport.width,height:Math.min(viewport.height-Math.max(0,box.y),box.height)}}));
  }
  await page.setViewportSize({width:1440,height:1000});
  return shots;
 }
 const standard=(await items()).find(i=>i.notes==='standard');
 const recolour=color=>page.evaluate(async([d,color])=>{const r=await fetch('/api/bag/discs/'+d.id,{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Atlas-CSRF':window.AtlasAccount.current.csrfToken},body:JSON.stringify({mold_id:d.mold_id,plastic:d.plastic,wear:d.wear,weight_g:d.weight_g,notes:d.notes,color,in_bag:true,pocket:d.pocket})});if(!r.ok)throw Error(await r.text());},[standard,color]);
 const shots={};
 for(const [name,c] of Object.entries(results.cases)){
  const [ink,finish]=CHOSEN[name]||['silver','foil'],row=shots[name]={};
  await recolour(c.plate);
  const take=async key=>{const id=key==='standard'?standard.id:c.id,[v34,vTop]=await viewerShots(id),[bag,bagPhone]=await bagShots(id);row[key]={v34,vTop,bag,bagPhone};};
  await setStamp('auto','flat');
  await setLook(c,'photo');await take('photo');
  await setLook(c,'asset');await take('asset');await take('standard');
  await setStamp(ink,finish);row.chosen=`${ink} ${finish}`;
  const keep={...row};await take('asset');row.assetChosen=row.asset;row.asset=keep.asset;
  await take('standard');row.standardChosen=row.standard;row.standard=keep.standard;
  await setStamp('auto','flat');
  for(const [key,set] of Object.entries(row))if(set?.v34)for(const [view,png] of Object.entries(set))fs.writeFileSync(`${OUT}/${name}-${key}-${view}.png`,png);
 }
 // The other personal surfaces, asset look in the default ink: the map still, the bag list thumbnail, the gallery.
 for(const c of Object.values(results.cases))await setLook(c,'asset');
 await page.goto(base+'/');await ready();
 const stills=await page.evaluate(async([list])=>{
  const art=await (await import('/disc3d/atlas-art.mjs')).getAtlasArt(),out=[];
  for(const c of list){const d=discs.find(d=>d.id===c.mold),photoURL='/api/bag/discs/'+encodeURIComponent(c.id)+'/photo?v='+encodeURIComponent(c.texture_key);
   let e;for(let i=0;i<60;i++){e=art.render({...d,photoURL},c.plate,320,undefined,'full',true);if(e&&!e.pending)break;await new Promise(r=>setTimeout(r,100));}
   out.push(e.canvas.toDataURL('image/png').split(',')[1]);}
  return out;
 },[Object.values(results.cases)]);
 Object.keys(results.cases).forEach((name,i)=>fs.writeFileSync(`${OUT}/${name}-asset-mapstill.png`,Buffer.from(stills[i],'base64')));
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelector('#bagScene')?.dataset.phase==='open');await wait(1200);
 await page.evaluate(()=>document.querySelector('#myBagViews [data-bag-view="gallery"]').click());await wait(4000);
 fs.writeFileSync(`${OUT}/gallery-asset.png`,await page.screenshot());
 await page.evaluate(()=>document.querySelector('#myBagViews [data-bag-view="bag"]').click());await wait(1500);
 fs.writeFileSync(`${OUT}/list-asset.png`,await page.locator('#myBagContents').screenshot());
 fs.writeFileSync(`${OUT}/results.json`,JSON.stringify(results,null,1));
 if(errors.length)console.log('page errors',errors);
}finally{await h.stop();}
