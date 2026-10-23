// Photo stamps v3 (docs/photo-stamp-sync.md): generated stamp assets and the Look belong to the account. In the real app
// on the local signed-in harness, with drawn synthetic disc photos made at run time (never a player's photo):
//  1. a desktop Chromium profile makes a Full color asset;
//  2. a fresh phone profile in WebKit (touch, 390 px) signs in and draws the same disc, the same bytes, in colour and
//     in 3D, with nothing generated there;
//  3. the phone makes one of its own (WebKit's ephemeral profile cannot keep a Blob in IndexedDB, the cause of the
//     phone's refusal), and the desktop then draws it;
//  4. a look chosen on one device reaches the other, and the photo look comes back byte for byte;
//  5. a browser holding v2 assets the account lacks uploads them once on sign-in (adopt-up), and the phone draws them.
//   node tests/photo-stamp-sync-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {startHarness} from './display-harness.mjs';
const sharp=createRequire(import.meta.url)('sharp');

const DIR='work/photo-stamp-server-sync/synthetic';fs.mkdirSync(DIR,{recursive:true});
const BLUE='#7f93e0',YELLOW='#e8c43c',PALE='#dfe2e6',INK='#1b1719',RED='#d4473a';
const photo=async(file,body,plate='#5c9daa')=>{
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2000"><rect width="1600" height="2000" fill="#3a3530"/><circle cx="800" cy="1000" r="752" fill="${plate}"/>${body}</svg>`;
 await sharp(Buffer.from(svg)).jpeg({quality:92}).toFile(file);return file;
};
const first=await photo(DIR+'/sync-a.jpg',`<polygon points="520,720 800,690 840,980 560,1020" fill="${BLUE}" stroke="${INK}" stroke-width="16"/>`+
 `<polygon points="880,720 1040,750 1020,980 870,950" fill="${PALE}" stroke="${INK}" stroke-width="16"/>`+
 `<rect x="540" y="1080" width="520" height="90" fill="${YELLOW}"/><rect x="620" y="1220" width="360" height="40" fill="${INK}"/>`);
const second=await photo(DIR+'/sync-b.jpg',`<circle cx="800" cy="900" r="180" fill="${RED}" stroke="${INK}" stroke-width="18"/><rect x="560" y="1160" width="480" height="70" fill="${YELLOW}"/>`,'#b99bdd');

const lab=([r,g,b])=>{const f=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;},R=f(r),G=f(g),B=f(b),h=t=>t>216/24389?Math.cbrt(t):(24389/27*t+16)/116;
 const x=h((.4124*R+.3576*G+.1805*B)/.95047),y=h(.2126*R+.7152*G+.0722*B),z=h((.0193*R+.1192*G+.9505*B)/1.08883);return [116*y-16,500*(x-y),200*(y-z)];};
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const dE=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const inksIn=(px,inks)=>Object.fromEntries(inks.map(h=>{const L=lab(hex(h));let n=0;for(let i=0;i<px.length;i+=4)if(px[i+3]>200&&dE(lab([px[i],px[i+1],px[i+2]]),L)<12)n++;return [h,n];}));
const sha=s=>createHash('sha256').update(s).digest('hex');

// A step that never finishes fails with its name rather than hanging the run (an evaluate has no timeout of its own).
let at='start',since=Date.now();const step=name=>{at=name;since=Date.now();},states=[];
setInterval(async()=>{if(Date.now()-since<300000)return;since=Infinity;console.error('Stalled for 5 minutes at: '+at);
 for(const state of states)console.error(JSON.stringify(await Promise.race([state().catch(e=>e.message),new Promise(r=>setTimeout(()=>r('no answer'),5000))])));process.exit(1);},5000).unref();

const h=await startHarness({port:Number(process.env.PHOTO_STAMP_PORT||8883),state:'work/photo-stamp-server-sync/d1-test'});
const desk=h,{base}=h;let phone=null,mac=null;
// Each device: its sheet, its viewer and its own view of the account.
const on=device=>{
 const page=device.page,wait=ms=>page.waitForTimeout(ms);
 const items=()=>page.evaluate(async()=>(await (await fetch('/api/bag',{credentials:'same-origin'})).json()).discs);
 const openBag=async()=>{await page.goto(base+'/?bag=1');await page.waitForFunction(()=>document.querySelectorAll('[data-bag-edit]').length>=3);};
 const edit=async id=>{await page.locator(`[data-bag-edit="${id}"]`).first().evaluate(n=>n.click());await page.waitForSelector('#addDiscDialog[open]');};
 // The listener is in place before Escape is sent: sent together, the key can win and the close go unheard.
 const closeSheet=async()=>{await page.evaluate(()=>{window.__sheetClosed=new Promise(r=>document.querySelector('#addDiscDialog').addEventListener('close',()=>setTimeout(r),{once:true}));});await page.keyboard.press('Escape');await page.evaluate(()=>window.__sheetClosed);};
 const savePhoto=async(id,file)=>{
  await edit(id);await page.setInputFiles('#addDiscDialog .bag-photo-file',file);
  await page.waitForSelector('dialog.photo-aligner[open]');await page.locator('dialog.photo-aligner[open] [data-aligner-confirm]').click();
  await page.waitForFunction(()=>!document.querySelector('dialog.photo-aligner[open]'),null,{timeout:60000});
  await page.locator('#saveDisc').click();await page.waitForFunction(()=>!document.querySelector('#addDiscDialog[open]'),null,{timeout:60000});
  return (await items()).find(i=>i.id===id);
 };
 // Full color through the sheet. v3.1 (docs/photo-stamp-one-click.md): one tap, from the photo the disc already has; no
 // file is asked for and no aligner opens. `again`: a disc already in Full color is made again with "Make again".
 // (`file`, the photo saved for the disc, is not asked for again.)
 const makeColor=async(id,file,again=false)=>{
  await edit(id);let asked=false;const ask=()=>{asked=true;};page.on('filechooser',ask);
  const t=Date.now();await (again?page.locator('#addDiscDialog .bag-photo-asset-make'):page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Full color'})).click();
  await page.waitForFunction(()=>/^(?!Making the game asset)\S/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||''),null,{timeout:240000});
  page.off('filechooser',ask);
  assert.equal(await page.locator('#addDiscDialog .bag-photo-status').textContent(),'Full-color asset made. Saved to your account.');
  assert.equal(asked,false,'no file asked for');assert.equal(await page.locator('dialog.photo-aligner[open]').count(),0,'no aligner');
  await closeSheet();return Date.now()-t;
 };
 const look=id=>page.evaluate(id=>JSON.parse(localStorage.getItem('disc-atlas-photo-stamps')||'null')?.discs?.[id]||null,id);
 const inspect=async id=>{
  await openBag();await page.locator(`[data-bag-inspect="${id}"]`).first().evaluate(n=>n.click());
  await page.waitForFunction(()=>document.querySelector('#detail .disc3d-stage')?.dataset.state==='ready',null,{timeout:60000});
 };
 const viewerStamp=()=>page.evaluate(()=>{const m=Disc3D.viewer.debug.stamp.material,c=m.map?.image;if(!c?.getContext)return {asset:m.map?.userData.stampAsset||null};const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,s=[];for(let i=0;i<d.length;i+=28)s.push(d[i],d[i+1],d[i+2],d[i+3]);
  return {asset:m.map.userData.stampAsset||null,color:!!m.map.userData.stampColor,size:c.width,visible:Disc3D.viewer.debug.stamp.visible,photo:!!Disc3D.viewer.debug.photo,sample:s};});
 const photoPixels=()=>page.evaluate(()=>{const p=Disc3D.viewer.debug.photo;if(!p?.userData.photoReady)return null;const img=p.material.map.image,c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);return Array.from(g.getImageData(0,0,c.width,c.height).data.filter((_,i)=>i%97===0)).join(',');});
 // The bytes a renderer gets for an asset (cache or account), hashed.
 const assetHash=asset=>page.evaluate(async asset=>{const {photoStampBlob}=await import('/disc3d/photo-stamps.mjs');const b=new Uint8Array(await (await photoStampBlob(asset)).arrayBuffer());const d=new Uint8Array(await crypto.subtle.digest('SHA-256',b));return Array.from(d,x=>x.toString(16).padStart(2,'0')).join('');},asset);
 const stamps=()=>page.evaluate(async()=>(await (await fetch('/api/bag/stamps',{credentials:'same-origin'})).json()).stamps);
 states.push(()=>page.evaluate(name=>({device:name,open:[...document.querySelectorAll('dialog[open]')].map(d=>d.id||d.className),active:document.activeElement?.outerHTML.slice(0,100),status:document.querySelector('#addDiscDialog .bag-photo-status')?.textContent,aligner:document.querySelector('.photo-aligner-status')?.textContent}),device.name));
 const steps={openBag,edit,closeSheet,savePhoto,makeColor,inspect,viewerStamp,photoPixels,assetHash,stamps};
 for(const [name,fn] of Object.entries(steps))steps[name]=(...a)=>{step(device.name+' '+name+'('+a.filter(v=>typeof v==='string').join(',')+')');return fn(...a);};
 return {page,wait,items,look,...steps};
};
try{
 // 1. Desktop: a photo on two discs, Full color on the first.
 desk.name='desktop';await desk.signIn();
 await desk.seedBag([{mold_id:'3d60892b6812',plastic:'Star',wear:8,weight_g:172,color:'#70b7cd'},{mold_id:'7446eb39abe5',plastic:'Z',wear:8,weight_g:177,color:'#b99bdd'},{mold_id:'6be51219c6db',plastic:'ESP',wear:9,weight_g:174,color:'#f2c14e'}]);
 const D=on(desk);await D.openBag();
 const all=await D.items(),A=all.find(i=>i.mold_id==='3d60892b6812').id,B=all.find(i=>i.mold_id==='7446eb39abe5').id;
 await D.savePhoto(A,first);const keyB=(await D.savePhoto(B,second)).texture_key;
 await D.inspect(A);await D.page.waitForFunction(()=>Disc3D.viewer.debug.photo?.userData.photoReady,null,{timeout:30000});
 const photoA=sha(await D.photoPixels());
 console.log('desktop Full color in '+await D.makeColor(A,first)+' ms');
 const entryA=await D.look(A);assert.equal(entryA.look,'color');assert.equal(entryA.server,true,'the account confirmed it');
 assert.deepEqual((await D.stamps()).map(s=>[s.disc_id,s.look,s.rev,!!s.color]),[[A,'color',entryA.rev,true]]);
 await D.inspect(A);await D.page.waitForFunction(()=>/\/c$/.test(Disc3D.viewer.debug.stamp.material.map?.userData.stampAsset||''),null,{timeout:30000});
 const deskA=await D.viewerStamp();assert.equal(deskA.color,true);assert.equal(deskA.photo,false);
 const deskHash=await D.assetHash(deskA.asset);

 // 2. The phone: a fresh WebKit profile. Nothing local; the account brings the look and the bytes.
 step('phone opens');phone=await h.device({engine:'webkit',viewport:{width:390,height:844},deviceScaleFactor:2,context:{hasTouch:true,isMobile:true}});
 phone.name='phone';const P=on(phone);
 // The phone condition, reproduced: this profile (like Safari's private browsing) cannot keep a Blob in IndexedDB.
 await phone.page.goto(base+'/api/bag/stamps');
 assert.equal(await phone.page.evaluate(()=>new Promise(res=>{const r=indexedDB.open('blob-probe',1);r.onupgradeneeded=()=>r.result.createObjectStore('s');r.onsuccess=()=>{const t=r.result.transaction('s','readwrite');t.objectStore('s').put(new Blob([new Uint8Array(64)],{type:'image/png'}),'k');t.oncomplete=()=>res('kept');t.onabort=()=>res('aborted');};})),'aborted','WebKit refuses the Blob');
 await phone.signIn();
 await P.inspect(A);
 await P.page.waitForFunction(()=>/\/c$/.test(Disc3D.viewer.debug.stamp.material.map?.userData.stampAsset||''),null,{timeout:60000});
 const phoneA=await P.viewerStamp();
 assert.equal(phoneA.asset,deskA.asset,'the same asset, by id');assert.equal(phoneA.color,true);assert.equal(phoneA.photo,false,'3D on the phone wears the stamp, not the photo');
 assert.equal(phoneA.size,deskA.size);
 assert.equal(await P.assetHash(phoneA.asset),deskHash,'byte for byte the asset the desktop made');
 const found=inksIn(phoneA.sample,[BLUE,YELLOW,PALE,INK]);for(const [ink,n] of Object.entries(found))assert.ok(n>40,'the phone texture carries '+ink+': '+JSON.stringify(found));
 // The phone's pulled bag disc wears it too.
 await P.page.waitForFunction(()=>document.querySelector('#bagScene')?.dataset.phase==='open',null,{timeout:30000});await P.wait(800);
 await P.page.locator(`[data-physical-disc="${A}"]`).evaluate(n=>n.click());
 await P.page.waitForFunction(id=>document.querySelector('[data-bag-canvas]').bagViewer.stampLayers.some(l=>l.key===id&&/\/c$/.test(l.asset||'')),A,{timeout:30000});
 // The phone's sheet shows the look it wears, and says where it is kept.
 await P.openBag();await P.edit(A);
 assert.equal(await P.page.locator('#addDiscDialog .bag-photo-look input[value="color"]').isChecked(),true);
 assert.match(await P.page.locator('#addDiscDialog .bag-photo-look-note').textContent(),/Saved to your account, on every device/);
 await P.closeSheet();

 // 3. The phone makes one of its own, in WebKit.
 console.log('phone (WebKit) Full color in '+await P.makeColor(B,second)+' ms');
 const entryB=await P.look(B);assert.equal(entryB.server,true);
 const cache=await P.page.evaluate(k=>new Promise(res=>{const r=indexedDB.open('disc-atlas-photo-stamps');r.onsuccess=()=>{const g=r.result.transaction('assets').objectStore('assets').get(k);g.onsuccess=()=>res(g.result?{blob:g.result instanceof Blob,bytes:g.result.bytes?.byteLength||0,type:g.result.type,rev:g.result.rev}:null);};}),B+'/'+keyB+'/c');
 assert.ok(cache&&!cache.blob&&cache.bytes>0&&cache.rev===entryB.rev,'the phone caches the bytes it can keep: '+JSON.stringify(cache));
 // Back on the desktop: it reaches it when the page comes back into view (here, a load).
 await D.inspect(B);await D.page.waitForFunction(()=>/\/c$/.test(Disc3D.viewer.debug.stamp.material.map?.userData.stampAsset||''),null,{timeout:60000});
 const deskB=await D.viewerStamp();assert.equal(deskB.asset,'photo-stamp/'+B+'/'+keyB+'/'+entryB.rev+'/c');
 assert.equal(await D.assetHash(deskB.asset),await P.assetHash(deskB.asset));
 const inksB=inksIn(deskB.sample,[RED,YELLOW]);assert.ok(inksB[RED]>40&&inksB[YELLOW]>40,'the desktop draws the phone’s colours: '+JSON.stringify(inksB));

 // The phone makes B again while the desktop still holds B's old entry (no sync since) and has lost its bytes: the
 // desktop never fills the old revision with the new bytes (they belong to another placement); it catches up instead.
 const oldB=deskB.asset;
 await D.page.evaluate(k=>new Promise(res=>{const r=indexedDB.open('disc-atlas-photo-stamps');r.onsuccess=()=>{const t=r.result.transaction('assets','readwrite');t.objectStore('assets').delete(k);t.oncomplete=()=>{r.result.close();res();};};}),B+'/'+keyB+'/c');
 await P.openBag();await P.makeColor(B,second,true);const remade=(await P.look(B)).rev;assert.notEqual(remade,entryB.rev);
 assert.equal(await D.page.evaluate(a=>import('/disc3d/photo-stamps.mjs').then(m=>m.photoStampBlob(a)).then(()=>'drawn',()=>'refused'),oldB),'refused','the old revision is not served the new bytes');
 await D.page.waitForFunction(([id,rev])=>JSON.parse(localStorage.getItem('disc-atlas-photo-stamps')).discs[id]?.rev===rev,[B,remade],{timeout:30000});
 const slot=await D.page.evaluate(k=>new Promise(res=>{const r=indexedDB.open('disc-atlas-photo-stamps');r.onsuccess=()=>{const g=r.result.transaction('assets').objectStore('assets').get(k);g.onsuccess=()=>res(g.result?.rev??null);};}),B+'/'+keyB+'/c');
 assert.notEqual(slot,entryB.rev,'nothing cached under the old revision');

 // A sync whose snapshot was read before a look changed does not undo it: the snapshot is held back until the look
 // has landed.
 await P.page.evaluate(()=>import('/disc3d/photo-stamps.mjs').then(m=>m.syncPhotoStamps()));
 let release,fetched;const gate=new Promise(r=>release=r),read=new Promise(r=>fetched=r);
 await P.page.route('**/api/bag/stamps',async route=>{const stale=await route.fetch();fetched();await gate;await route.fulfill({response:stale});});
 await P.page.evaluate(()=>{window.__sync=import('/disc3d/photo-stamps.mjs').then(m=>m.syncPhotoStamps());});
 await read;
 await P.page.evaluate(([id,k])=>import('/disc3d/photo-stamps.mjs').then(m=>m.setPhotoLook(id,k,'asset')),[B,keyB]);
 release();await P.page.evaluate(()=>window.__sync);await P.page.unroute('**/api/bag/stamps');
 assert.equal((await P.look(B)).look,'asset','the look set during the sync stands');
 await P.page.evaluate(([id,k])=>import('/disc3d/photo-stamps.mjs').then(m=>m.setPhotoLook(id,k,'color')),[B,keyB]);

 // 4. A look chosen on the phone reaches the desktop; the photo look is the photo exactly.
 await P.openBag();await P.edit(A);await P.page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Photo'}).click();
 await P.page.waitForFunction(()=>document.querySelector('#addDiscDialog .bag-photo-status')?.textContent==='Showing the photo.');
 await P.page.waitForFunction(async id=>(await (await fetch('/api/bag/stamps',{credentials:'same-origin'})).json()).stamps.find(s=>s.disc_id===id)?.look==='photo',A,{timeout:15000});
 await P.closeSheet();
 await D.inspect(A);await D.page.waitForFunction(()=>Disc3D.viewer.debug.photo?.userData.photoReady,null,{timeout:30000});
 assert.equal(sha(await D.photoPixels()),photoA,'the photo look is byte-for-byte the photo');
 assert.equal(await D.page.evaluate(()=>Disc3D.viewer.debug.stamp.visible),false);
 // A look the account refuses (here: no connection) puts the disc back and says so.
 await P.openBag();await P.page.route('**/api/bag/discs/*/stamp',route=>route.request().method()==='PATCH'?route.abort():route.continue());
 await P.edit(A);await P.page.locator('#addDiscDialog .bag-photo-look label',{hasText:'Game asset'}).click();
 await P.page.waitForFunction(()=>!/^Showing/.test(document.querySelector('#addDiscDialog .bag-photo-status')?.textContent||'Showing'));
 assert.equal(await P.page.locator('#addDiscDialog .bag-photo-look input[value="photo"]').isChecked(),true,'back to the look the account has');
 await P.closeSheet();await P.page.unroute('**/api/bag/discs/*/stamp');

 // 5. Adopt-up: a browser with v2 assets of its own (Blobs in IndexedDB, an entry the account never saw) on the
 // third disc. Made with this checkout's own extractor, then written exactly as v2 wrote them.
 const C=all.find(i=>i.mold_id==='6be51219c6db').id,keyC=(await D.savePhoto(C,first)).texture_key;
 step('mac opens');mac=await h.device({});mac.name='mac';const M=on(mac);await mac.signIn();
 await mac.page.goto(base+'/api/bag/stamps');
 const legacy=await mac.page.evaluate(async([id,key,bytes])=>{
  const {decodePhoto,photoStampAsset}=await import('/disc-photo.mjs');
  const image=await decodePhoto(new File([new Uint8Array(bytes)],'o.jpg',{type:'image/jpeg'})),a=await photoStampAsset(image,{},{plate:.8,color:true});
  await new Promise((res,rej)=>{const r=indexedDB.open('disc-atlas-photo-stamps',1);r.onupgradeneeded=()=>r.result.createObjectStore('assets');r.onsuccess=()=>{const t=r.result.transaction('assets','readwrite');t.objectStore('assets').put(a.blob,id+'/'+key);t.objectStore('assets').put(a.color.blob,id+'/'+key+'/c');t.oncomplete=()=>{r.result.close();res();};t.onerror=rej;};});
  const rev='lv2'+Date.now().toString(36);
  localStorage.setItem('disc-atlas-photo-stamps',JSON.stringify({v:1,discs:{[id]:{key,rev,look:'color',placement:a.placement,layered:!!a.layered,color:{rev,placement:a.color.placement},savedAt:new Date().toISOString()}}}));
  const hash=async b=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await b.arrayBuffer())),x=>x.toString(16).padStart(2,'0')).join('');
  return {ink:await hash(a.blob),color:await hash(a.color.blob)};
 },[C,keyC,[...fs.readFileSync(first)]]);
 const puts=[];mac.page.on('request',r=>{if(r.method()==='PUT'&&/\/stamp$/.test(r.url()))puts.push(r.url());});
 await M.openBag();
 await M.page.waitForFunction(id=>JSON.parse(localStorage.getItem('disc-atlas-photo-stamps')||'{}').discs?.[id]?.server===true,C,{timeout:30000});
 const adopted=(await M.stamps()).find(s=>s.disc_id===C);assert.equal(adopted?.look,'color','the account took the v2 look');
 const hashes=await M.page.evaluate(async id=>{const h=async p=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await (await fetch('/api/bag/discs/'+id+'/stamp/'+p,{credentials:'same-origin'})).arrayBuffer())),x=>x.toString(16).padStart(2,'0')).join('');return {ink:await h('ink'),color:await h('color')};},C);
 assert.deepEqual(hashes,legacy,'the account holds the very bytes this browser made');
 await M.openBag();await M.wait(1500);
 assert.equal(puts.length,1,'uploaded once, not on every load: '+puts.length);
 // The phone draws them, nothing regenerated.
 await P.inspect(C);await P.page.waitForFunction(()=>/\/c$/.test(Disc3D.viewer.debug.stamp.material.map?.userData.stampAsset||''),null,{timeout:60000});
 assert.equal(await P.assetHash((await P.viewerStamp()).asset),legacy.color);

 // A photo replaced on one device takes its stamp with it everywhere.
 await D.savePhoto(C,second);
 await M.openBag();await M.page.waitForFunction(id=>!JSON.parse(localStorage.getItem('disc-atlas-photo-stamps')||'{}').discs?.[id],C,{timeout:30000});
 assert.equal((await M.stamps()).some(s=>s.disc_id===C),false);

 for(const [name,d] of [['desktop',desk],['phone',phone],['mac',mac]])assert.deepEqual(d.errors,[],name+' page errors');
 console.log('photo stamp sync: pass');
}finally{await phone?.close();await mac?.close();await h.stop();}
