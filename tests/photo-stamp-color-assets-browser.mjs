// Photo stamps v2, the full-colour game asset (docs/photo-stamp-color-assets.md), in the real app on the local signed-in
// harness, with a drawn synthetic multicolour disc photo made at run time (never a player's photo): the Look row's third
// choice, both assets from one read of the original, storage, every personal surface drawing the stamp's own colours
// (viewer, bag, gallery, storage, map still, bag list), the ink never reaching it, a finish as a sheen, and the way
// back to the one-ink asset and to the photo exactly as it was.
//   node tests/photo-stamp-color-assets-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {startHarness} from './display-harness.mjs';
const sharp=createRequire(import.meta.url)('sharp');

// A teal disc filling the aligner's default framing (scale .94) of a 1600 x 2000 photo, printed in four inks: a blue
// face and a pale crystal outlined in near-black, a yellow word, a near-black name.
const DIR='work/photo-stamp-color-assets/synthetic';fs.mkdirSync(DIR,{recursive:true});
const BLUE='#7f93e0',YELLOW='#e8c43c',PALE='#dfe2e6',INK='#1b1719';
const photo=async(file,body)=>{
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2000"><rect width="1600" height="2000" fill="#3a3530"/><circle cx="800" cy="1000" r="752" fill="#5c9daa"/>${body}</svg>`;
 await sharp(Buffer.from(svg)).jpeg({quality:92}).toFile(file);return file;
};
const first=await photo(DIR+'/print-a.jpg',`<polygon points="520,720 800,690 840,980 560,1020" fill="${BLUE}" stroke="${INK}" stroke-width="16"/>`+
 `<polygon points="880,720 1040,750 1020,980 870,950" fill="${PALE}" stroke="${INK}" stroke-width="16"/>`+
 `<rect x="540" y="1080" width="520" height="90" fill="${YELLOW}"/><rect x="620" y="1220" width="360" height="40" fill="${INK}"/>`);
const second=await photo(DIR+'/print-b.jpg',`<rect x="600" y="800" width="400" height="60" fill="${INK}"/>`);

const lab=([r,g,b])=>{const f=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;},R=f(r),G=f(g),B=f(b),h=t=>t>216/24389?Math.cbrt(t):(24389/27*t+16)/116;
 const x=h((.4124*R+.3576*G+.1805*B)/.95047),y=h(.2126*R+.7152*G+.0722*B),z=h((.0193*R+.1192*G+.9505*B)/1.08883);return [116*y-16,500*(x-y),200*(y-z)];};
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const dE=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
// Opaque pixels of a sampled canvas within ΔE 12 of each ink.
const inksIn=(px,inks)=>Object.fromEntries(inks.map(h=>{const L=lab(hex(h));let n=0;for(let i=0;i<px.length;i+=4)if(px[i+3]>200&&dE(lab([px[i],px[i+1],px[i+2]]),L)<12)n++;return [h,n];}));

// PHOTO_STAMP_ENGINE=webkit runs it in the phone's engine (docs/photo-stamp-sync.md).
const h=await startHarness({port:Number(process.env.PHOTO_STAMP_PORT||8877),state:'work/photo-stamp-color-assets/d1-test',engine:process.env.PHOTO_STAMP_ENGINE||'chromium'});
const {page,base,errors}=h;
const wait=ms=>page.waitForTimeout(ms);
const items=()=>page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs);
try{
 await h.signIn();
 await h.seedBag([{mold_id:'3d60892b6812',plastic:'Star',wear:8,weight_g:172,color:'#70b7cd'},{mold_id:'7446eb39abe5',plastic:'Z',wear:8,weight_g:177,color:'#b99bdd'}]);
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=2);
 const disc=(await items()).find(i=>i.mold_id==='3d60892b6812');
 const edit=async()=>{await page.locator(`[data-bag-edit="${disc.id}"]`).evaluate(n=>n.click());await page.waitForSelector('#addDiscDialog[open]');};
 // The sheet clears its photo editor on the dialog's close event, a task after Escape: wait for it, or a sheet reopened at
 // once would be wiped by the late event.
 // (The listener is in place before Escape is sent: sent together, the key can win and the close go unheard.)
 const closeSheet=async()=>{await page.evaluate(()=>{window.__sheetClosed=new Promise(r=>document.querySelector('#addDiscDialog').addEventListener('close',()=>setTimeout(r),{once:true}));});await page.keyboard.press('Escape');await page.evaluate(()=>window.__sheetClosed);};
 const look=v=>page.locator(`#addDiscDialog .bag-photo-look input[value="${v}"]`);
 const usePhoto=async file=>{
  await edit();await page.setInputFiles('#addDiscDialog .bag-photo-file',file);
  await page.waitForSelector('dialog.photo-aligner[open]');await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
  await page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]'),null,{timeout:60000});
  await page.locator('#saveDisc').click();await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'),null,{timeout:60000});
  return (await items()).find(i=>i.id===disc.id);
 };
 const saved=await usePhoto(first),key=saved.texture_key,url='/api/bag/discs/'+encodeURIComponent(disc.id)+'/photo?v='+encodeURIComponent(key);
 const idb=()=>page.evaluate(()=>new Promise((res,rej)=>{const r=indexedDB.open('disc-atlas-photo-stamps');r.onsuccess=()=>{const t=r.result.transaction('assets'),s=t.objectStore('assets'),out={};const c=s.openCursor();c.onsuccess=()=>{const k=c.result;if(!k){r.result.close();res(out);return;}out[k.key]={type:k.value.type,size:k.value.size??k.value.bytes?.byteLength};k.continue();};c.onerror=rej;};r.onerror=rej;}));

 const inspect=async()=>{
  await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-inspect]').length>=2);
  await page.locator(`[data-bag-inspect="${disc.id}"]`).first().evaluate(n=>n.click());
  await page.waitForFunction(()=>document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready');
 };
 const photoPixels=()=>page.evaluate(()=>{const p=Disc3D.viewer.debug.photo;if(!p?.userData.photoReady)return null;const img=p.material.map.image,c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);return Array.from(g.getImageData(0,0,c.width,c.height).data.filter((_,i)=>i%97===0)).join(',');});
 // The viewer's stamp texture, sampled: its pixels (every 7th), a hash of all of them, and what it is.
 const viewerStamp=()=>page.evaluate(()=>{const m=Disc3D.viewer.debug.stamp.material,c=m.map.image,d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,s=[];for(let i=0;i<d.length;i+=28)s.push(d[i],d[i+1],d[i+2],d[i+3]);
  return {asset:m.map.userData.stampAsset||null,color:!!m.map.userData.stampColor,size:c.width,finish:m.userData.stampFinish||'flat',metalness:m.metalness,iridescence:m.iridescence||0,sample:s,all:Array.from(d.filter((_,i)=>i%13===0)).join(',')};});
 await inspect();await page.waitForFunction(()=>Disc3D.viewer.debug.photo?.userData.photoReady,null,{timeout:30000});
 const pixelsBefore=createHash('sha256').update(await photoPixels()).digest('hex');

 // The Look row: three choices. The original (v3.1: the quiet option; one click from the stored photo is the default,
 // tests/photo-stamp-one-click-browser.mjs) is framed and read once for both assets; Full color then applies at once.
 await edit();
 assert.deepEqual(await page.locator('#addDiscDialog .bag-photo-look-row label').allTextContents(),['Photo','Game asset','Full color']);
 assert.equal(await look('photo').isChecked(),true);
 const chooser=page.waitForEvent('filechooser');
 await page.locator('#addDiscDialog .bag-photo-asset-original').click();
 await (await chooser).setFiles(first);
 await page.waitForSelector('dialog.photo-aligner[open]');
 assert.equal(await page.locator('dialog.photo-aligner[open] h2').textContent(),'Frame the original');
 await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
 await page.waitForFunction(()=>/Game asset made/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:120000});
 await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Full color'}).click();
 await page.waitForFunction(()=>/Showing the full-color asset/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:30000});
 assert.equal(await look('color').isChecked(),true);
 assert.match(await page.locator('#addDiscDialog .bag-photo-look-note').textContent(),/stamp ink doesn’t apply/);
 await closeSheet();

 // Storage: the one-ink asset and the colour asset side by side, the colour one as WebP, near the one-ink one's size.
 const stored=await idb();
 assert.deepEqual(Object.keys(stored).sort(),[disc.id+'/'+key,disc.id+'/'+key+'/c']);
 assert.equal(stored[disc.id+'/'+key+'/c'].type,'image/webp');
 assert.ok(stored[disc.id+'/'+key+'/c'].size<=1.5*1024*1024,'colour asset within budget: '+stored[disc.id+'/'+key+'/c'].size);
 const entry=await page.evaluate(()=>JSON.parse(localStorage.getItem('disc-atlas-photo-stamps')).discs);
 assert.equal(entry[disc.id].look,'color');assert.ok(entry[disc.id].color.rev&&entry[disc.id].color.placement.diameterFraction>0);
 // (An outlined print is a layered one-ink asset, disc-stamp-extract.mjs; the colour asset beside it is not layered.)
 const state=await page.evaluate(([id,k])=>import('/disc3d/photo-stamps.mjs').then(m=>m.photoLook(id,k)),[disc.id,key]);
 assert.deepEqual([state.available,state.look,state.color],[true,'color',true]);

 // Viewer: the colour asset at 2048, its own inks on it, no photo.
 await inspect();
 await page.waitForFunction(()=>/\/c$/.test(Disc3D.viewer.debug.stamp.material.map?.userData.stampAsset||''),null,{timeout:30000});
 assert.equal(await page.evaluate(()=>!!Disc3D.viewer.debug.photo),false);
 const auto=await viewerStamp();
 assert.equal(auto.color,true);assert.equal(auto.size,2048);assert.equal(auto.finish,'flat');
 const found=inksIn(auto.sample,[BLUE,YELLOW,PALE,INK]);
 for(const [ink,n] of Object.entries(found))assert.ok(n>40,'the texture carries '+ink+': '+JSON.stringify(found));

 // The ink never reaches it; a finish is a sheen over the same colours.
 await page.evaluate(()=>DisplayPalette.setStamp({ink:'gold',finish:'flat'}));await wait(600);
 // A redraw of the same asset may differ by a step or two where alpha is faint (the browser's premultiplied canvas); an
 // ink would change every printed pixel. So: the same asset, and at most a rounding step on under 0.1% of the values.
 const same=(a,b,what)=>{assert.equal(a.asset,b.asset,what);if(a.all===b.all)return;const x=a.all.split(',').map(Number),y=b.all.split(',').map(Number);let n=0,most=0;for(let i=0;i<x.length;i++)if(x[i]!==y[i]){n++;most=Math.max(most,Math.abs(x[i]-y[i]));}
  assert.ok(n<x.length/1000&&most<=3,what+': '+n+' of '+x.length+' values differ, by up to '+most);console.log(what+': '+n+' of '+x.length+' values differ, by up to '+most);};
 same(await viewerStamp(),auto,'gold ink leaves the colour asset as it was');
 await page.evaluate(()=>DisplayPalette.setStamp({ink:'gold',finish:'rainbow'}));
 await page.waitForFunction(()=>Disc3D.viewer.debug.stamp.material.userData.stampFinish==='rainbow~sheen'&&/\/c$/.test(Disc3D.viewer.debug.stamp.material.map?.userData.stampAsset||''),null,{timeout:15000});
 const sheen=await viewerStamp();
 same(sheen,auto,'the finish changes light only');
 assert.ok(Math.abs(sheen.metalness-.35)<1e-6&&Math.abs(sheen.iridescence-.35)<1e-6,'a sheen, not a full metal: '+sheen.metalness+'/'+sheen.iridescence);
 // The Appearance sheet says the ink does not reach it.
 await page.evaluate(()=>window.AppearanceSheet.open());await page.waitForSelector('#appearanceDialog[open]');
 assert.equal(await page.locator('[data-color-look-note]').isVisible(),true);
 await page.locator('#appearanceDialog [data-appearance-close]').first().click();

 // Bag: a pulled disc wears the colour asset, its finish a sheen.
 await page.waitForFunction(()=>document.querySelector('#bagScene')?.dataset.phase==='open',null,{timeout:30000});await wait(800);
 await page.locator(`[data-physical-disc="${disc.id}"]`).evaluate(n=>n.click());
 await page.waitForFunction(id=>document.querySelector('[data-bag-canvas]').bagViewer.stampLayers.some(l=>l.key===id&&/\/c$/.test(l.asset||'')&&l.finish==='rainbow~sheen'),disc.id,{timeout:20000});

 // Bag list: the thumbnail draws the colour asset's own inks.
 // (Thumbnails draw once in view.)
 const host=`#myBagContents [data-disc-thumbnail][data-photo-url="${url}"]`;
 await page.locator(host).first().scrollIntoViewIfNeeded();
 await page.waitForFunction(([sel])=>{const c=document.querySelector(sel+' canvas');if(!c)return false;const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let i=3;i<d.length;i+=4)if(d[i])return true;return false;},[host],{timeout:20000}).catch(()=>{});
 await wait(1500);
 const thumb=await page.evaluate(sel=>{const c=document.querySelector(sel+' canvas');if(!c)return null;return Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data);},host);
 assert.ok(thumb,'the bag list thumbnail is drawn');
 const listInks=inksIn(thumb,[BLUE,YELLOW]);assert.ok(listInks[BLUE]>3&&listInks[YELLOW]>3,'the list thumbnail carries the inks: '+JSON.stringify(listInks));

 // Gallery: the same, through the shared viewer, and it reveals.
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=2);
 await page.evaluate(()=>document.querySelector('#myBagViews [data-bag-view="gallery"]').click());
 for(let i=0;i<4;i++){const id=await page.evaluate(()=>document.querySelector('[data-album-stage]')?.dataset.discId);if(id===disc.id)break;await page.locator('[data-album-step="1"]').first().click();await wait(400);}
 await page.waitForFunction(id=>{const stage=document.querySelector('[data-album-stage]');return stage?.dataset.discId===id&&stage.closest('[data-appearance]')?.dataset.appearance==='ready';},disc.id,{timeout:30000});
 assert.match(await page.evaluate(()=>BagApp.scenes.album.debug.stamp.material.map.userData.stampAsset),/\/c$/);
 assert.equal(await page.evaluate(()=>BagApp.scenes.album.debug.stamp.material.userData.stampFinish),'rainbow~sheen');
 await page.evaluate(()=>document.querySelector('#myBagViews [data-bag-view="bag"]').click());

 // Storage and the graveyard draw their discs through the collection stage's disc model.
 const rack=await page.evaluate(async([url,mold])=>{
  const {discModel}=await import('/collection3d/stage.mjs'),d=discs.find(d=>d.id===mold);
  let done;const ready=new Promise(r=>done=r),group=discModel(d,{color:'#5c9daa',photoURL:url,onChange:()=>done()});
  const ink=group.children.find(m=>m.material?.map?.userData);
  for(let i=0;i<100&&!ink.material.map.userData.stampAsset;i++)await Promise.race([ready,new Promise(r=>setTimeout(r,100))]);
  return {asset:ink.material.map.userData.stampAsset,color:!!ink.material.map.userData.stampColor,finish:ink.material.userData.stampFinish,metalness:ink.material.metalness};
 },[url,disc.mold_id]);
 assert.match(rack.asset,/\/c$/);assert.equal(rack.color,true);assert.equal(rack.finish,'rainbow~sheen');
 await page.evaluate(()=>DisplayPalette.setStamp({ink:'auto',finish:'flat'}));

 // Map still (the personalized map's marker art): stamped in colour, not photographed.
 const still=await page.evaluate(async([url,mold])=>{
  const art=await (await import('/disc3d/atlas-art.mjs')).getAtlasArt(),d=discs.find(d=>d.id===mold);
  for(let i=0;i<60;i++){const e=art.render({...d,photoURL:url,stampStyle:DisplayPalette.stampStyle()},'#5c9daa',320,undefined,'full',true);if(e&&!e.pending)break;await new Promise(r=>setTimeout(r,100));}
  return [...art.debug.images.keys()].filter(k=>k.startsWith(mold+'|'));
 },[url,disc.mold_id]);
 assert.ok(still.some(k=>/\|stamp:photo-stamp\/.*\/c\|/.test(k)&&!k.includes('/photo?')),'the still is drawn from the colour asset: '+still.join(' '));

 // Neutral: the catalog Destroyer on the Standard map knows nothing of it.
 await page.goto(base+'/');await page.waitForFunction(()=>typeof discs!=='undefined'&&discs.length>0);
 await page.evaluate(()=>document.querySelector('#lensMenu [data-lens="default"]').click());await wait(500);
 await page.evaluate(id=>select(discs.find(d=>d.id===id)),disc.mold_id);
 await page.waitForFunction(()=>document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready');await wait(500);
 assert.equal(await page.evaluate(()=>Disc3D.viewer.debug.stamp.material.map?.userData.stampAsset||null),null);

 // Game asset: the one-ink asset made from the same read, in the player's ink again.
 await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=2);
 await edit();await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Game asset'}).click();
 assert.equal(await look('asset').isChecked(),true);
 assert.match(await page.locator('#addDiscDialog .bag-photo-look-note').textContent(),/in your stamp ink and finish/);
 await closeSheet();
 await page.evaluate(()=>DisplayPalette.setStamp({ink:'gold',finish:'flat'}));
 await inspect();
 await page.waitForFunction(()=>/^photo-stamp\/[^/]+\/[^/]+\/[a-z0-9]+(\/l)?$/.test(Disc3D.viewer.debug.stamp.material.map?.userData.stampAsset||''),null,{timeout:30000});
 const one=await viewerStamp();assert.equal(one.color,false);
 const gold=lab(hex('#d6a83a'));let goldPx=0,inked=0;for(let i=0;i<one.sample.length;i+=4)if(one.sample[i+3]>200){inked++;if(dE(lab(one.sample.slice(i,i+3)),gold)<3)goldPx++;}
 assert.ok(inked>100&&goldPx===inked,'one ink, the player\'s gold: '+goldPx+'/'+inked);
 await page.evaluate(()=>DisplayPalette.setStamp({ink:'auto',finish:'flat'}));

 // Back to Photo: exactly the photo it showed before, and the Appearance note goes.
 await edit();await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Photo'}).click();await closeSheet();
 await inspect();await page.waitForFunction(()=>Disc3D.viewer.debug.photo?.userData.photoReady,null,{timeout:30000});
 assert.equal(createHash('sha256').update(await photoPixels()).digest('hex'),pixelsBefore,'the photo look is byte-for-byte the same');
 assert.equal(await page.evaluate(()=>Disc3D.viewer.debug.stamp.visible),false);
 await page.evaluate(()=>window.AppearanceSheet.open());await page.waitForSelector('#appearanceDialog[open]');
 assert.equal(await page.locator('[data-color-look-note]').isHidden(),true);
 await page.locator('#appearanceDialog [data-appearance-close]').first().click();

 // v3 (docs/photo-stamp-sync.md): colour bytes this browser lost (cleared site data) come back from the account; only
 // when the account cannot give them either does the disc show its photo again.
 await page.evaluate(([id,k])=>import('/disc3d/photo-stamps.mjs').then(m=>m.setPhotoLook(id,k,'color')),[disc.id,key]);
 const dropColor=()=>page.evaluate(k=>new Promise((res,rej)=>{const r=indexedDB.open('disc-atlas-photo-stamps');r.onsuccess=()=>{const t=r.result.transaction('assets','readwrite');t.objectStore('assets').delete(k);t.oncomplete=()=>{r.result.close();res();};t.onerror=rej;};}),disc.id+'/'+key+'/c');
 await dropColor();
 await inspect();await page.waitForFunction(()=>/\/c$/.test(Disc3D.viewer.debug.stamp.material.map?.userData.stampAsset||''),null,{timeout:30000});
 assert.equal(await page.evaluate(()=>!!Disc3D.viewer.debug.photo),false,'drawn from the account, not the photo');
 await dropColor();await page.route('**/stamp/color?*',route=>route.fulfill({status:503,contentType:'application/json',body:'{"error":"offline"}'}));
 await inspect();await page.waitForFunction(()=>Disc3D.viewer.debug.photo?.userData.photoReady,null,{timeout:30000});
 await page.unroute('**/stamp/color?*');

 // An asset made before full colour existed (a v1 entry, no colour part; v3: as the account holds one adopted from a v1
 // browser): Full color makes both again. v3.1: in one click, from the stored photo, with no file asked for.
 await page.evaluate(async([id,k])=>{
  const ink=await (await fetch('/api/bag/discs/'+id+'/stamp/ink',{credentials:'same-origin'})).blob(),{stamp}=await (await fetch('/api/bag/discs/'+id+'/stamp',{credentials:'same-origin'})).json();
  const form=new FormData();form.set('meta',JSON.stringify({texture_key:k,look:'asset',placement:stamp.placement,layered:stamp.layered,color:null}));form.set('ink',ink,'ink');
  const r=await fetch('/api/bag/discs/'+id+'/stamp',{method:'PUT',body:form,credentials:'same-origin',headers:{'X-Atlas-CSRF':AtlasAccount.current.csrfToken}});if(!r.ok)throw Error(await r.text());
 },[disc.id,key]);
 await page.reload();await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=2);
 await edit();
 assert.equal(await look('asset').isChecked(),true);
 let asked=false;page.once('filechooser',()=>{asked=true;});
 await page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Full color'}).click();
 await page.waitForFunction(()=>/Full-color asset made/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:120000});
 assert.equal(asked,false,'no file asked for');assert.equal(await page.locator('dialog.photo-aligner[open]').count(),0);
 await closeSheet();

 // A replaced photo is a new version: the look returns to Photo, and both of the old assets go.
 const replaced=await usePhoto(second);assert.notEqual(replaced.texture_key,key);
 assert.deepEqual(await page.evaluate(([id,k])=>import('/disc3d/photo-stamps.mjs').then(m=>m.photoLook(id,k)),[disc.id,replaced.texture_key]),{available:false,look:'photo'});

 // The colour asset's size budget holds: over it, the image steps down in resolution in the same placement; one that
 // cannot fit is not kept, and the one-ink asset stands alone.
 const budget=await page.evaluate(async bytes=>{
  const {decodePhoto,photoStampAsset}=await import('/disc-photo.mjs');
  const make=async limit=>{const image=await decodePhoto(new File([new Uint8Array(bytes)],'print.jpg',{type:'image/jpeg'}));const r=await photoStampAsset(image,{},{color:true,...limit&&{colorBytes:limit}});image.close?.();
   const size=r.color?await createImageBitmap(r.color.blob).then(b=>{const w=b.width;b.close();return w;}):null;return {one:r.blob.size,color:r.color?{bytes:r.color.blob.size,type:r.color.blob.type,side:size,placement:r.color.placement}:null};};
  const full=await make(),half=await make(Math.floor(full.color.bytes/2)),none=await make(500);
  return {full,half,none,limit:Math.floor(full.color.bytes/2)};
 },[...fs.readFileSync(first)]);
 assert.ok(budget.half.color.bytes<=budget.limit,'within a halved budget: '+JSON.stringify(budget));
 assert.ok(budget.half.color.side<budget.full.color.side,'by stepping down in resolution');
 assert.deepEqual(budget.half.color.placement,budget.full.color.placement,'in the same placement');
 assert.equal(budget.none.color,null,'a colour asset that cannot fit is not kept');
 assert.equal(budget.none.one,budget.full.one,'the one-ink asset stands alone, as made');

 assert.deepEqual(errors,[]);
 console.log('photo stamp color assets: pass');
}finally{await h.stop();}
