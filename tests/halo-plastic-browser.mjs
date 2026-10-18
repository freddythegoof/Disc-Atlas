// Halo plastic (docs/halo-plastic.md): a photographed Halo copy shows its band, sampled from its own photo at
// save, as ordinary plastic on the rim outside the photo's shoulder cut; the photo inside the shoulder is
// untouched. Everything else draws exactly as before: the same photo on Star plastic, a Halo copy without a
// photo, and the Pixel overmold.
//
// Cases, each added through the real editor (or the API, for the photo-less pair) on a local Wrangler + D1:
//   halo-star        Wraith, the photo-edge suite's drawn Halo (purple plate, pale band from 0.80 R), on Halo Star
//   halo-plain       the same photo on the editor's default plastic (Star): the control, no band
//   destroyer-halo   Destroyer, the repo's photographic fixture (tests/fixtures/stamped-disc.webp) inside a blue
//                    dyed band from 0.76 R, on Halo Star
//   pixel            the Pixel overmold control (its rim piece, its own sample)
//   destroyer-bare   Destroyer on Halo Star with no photo: no band (no default band colour exists)
// Each draws in the detail panel (top and 3/4), My Bag pulled and the bag list thumbnail.
//
// EDGE_REFERENCE=<built checkout of main> draws every surface through that tree first: the before half. Then
// every control must match it pixel for pixel (GPU tolerance), and the Halo copies must differ only outside
// the photo, toward the band.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {caseList,addDisc,referenceTree,pixelDiff,COLORS} from './photo-edge-shared.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const config='tests/auth.wrangler.jsonc',state='work/halo-plastic/local',base='https://localhost:8851',dir='outputs/halo-plastic';
const wrangler='node_modules/wrangler/wrangler-dist/cli.js',BAND='#2f5fb8';
fs.mkdirSync(dir,{recursive:true});
const command=args=>execFileSync(process.execPath,[wrangler,...args,'--config',config,'--persist-to',state],{windowsHide:true,stdio:'pipe'});
execFileSync(process.execPath,['scripts/build-workers.mjs'],{windowsHide:true,stdio:'inherit'});
command(['d1','migrations','apply','disc-atlas-accounts','--local']);
command(['d1','execute','disc-atlas-accounts','--local','--command','DELETE FROM auth_users;']);
const server=spawn(process.execPath,[wrangler,'dev','--config',config,'--local','--port','8851','--ip','127.0.0.1','--local-protocol','https','--inspector-port','0','--persist-to',state],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let output='',browser,page;for(const stream of [server.stdout,server.stderr])stream.on('data',d=>output+=d);
const ready=()=>new Promise(resolve=>{const r=https.get(base,{rejectUnauthorized:false,family:4},res=>{res.resume();resolve(res.statusCode===200);});r.on('error',()=>resolve(false));r.setTimeout(500,()=>r.destroy());});
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),dist=(a,b)=>Math.hypot(...hex(a).map((v,i)=>v-hex(b)[i]));
const metrics={};
try{
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.env.BAG3D_CHROMIUM_ARGS?.split(' ')||(process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'])});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}}),errors=[];
 const reference=await referenceTree(context,base);
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 await context.route(/^https:\/\/accounts\.google\.com\//,async route=>{
  const u=new URL(route.request().url()),code=Buffer.from(JSON.stringify({nonce:u.searchParams.get('nonce'),challenge:u.searchParams.get('code_challenge')})).toString('base64');
  const callback=new URL(u.searchParams.get('redirect_uri'));callback.search=new URLSearchParams({code,state:u.searchParams.get('state')}).toString();
  await route.fulfill({contentType:'text/html',body:`<a href="${callback.href.replaceAll('&','&amp;')}">Continue as Atlas Player</a>`});
 });
 await page.goto(base+'/?bag=1');await page.locator('#myBagDemo').waitFor();await page.locator('#myBagSignIn').click();
 const link=page.getByRole('link',{name:'Continue with Google',exact:true});await link.waitFor();
 const redirect=await page.request.get(base+await link.getAttribute('href'),{maxRedirects:0});
 await page.goto(redirect.headers().location);await page.getByRole('link',{name:'Continue as Atlas Player'}).click();
 await page.waitForFunction(()=>window.AtlasAccount?.current?.user);await page.locator('#myBagEmpty').waitFor();
 const api=async(path,method='GET',body)=>page.evaluate(async({path,method,body})=>{
  const r=await fetch('/api/bag'+path,{method,headers:{'Content-Type':'application/json','X-Atlas-CSRF':AtlasAccount.current.csrfToken},...(body?{body:JSON.stringify(body)}:{})});
  if(!r.ok)throw Error(await r.text());return r.json();
 },{path,method,body});

 // A photographic Halo Destroyer: the worn red fixture inside a blue dyed band (a clean boundary, as v1 draws it).
 const destroyer=await page.evaluate(()=>discs.find(d=>d.manufacturer==='Innova Champion Discs'&&d.name==='Destroyer'));
 const destroyerHalo=Buffer.from(await page.evaluate(async({bytes,band})=>{
  const image=await createImageBitmap(new Blob([new Uint8Array(bytes)]));
  const n=1024,c=n/2,r=n*.47,canvas=document.createElement('canvas');canvas.width=canvas.height=n;const g=canvas.getContext('2d');
  g.fillStyle='#2a2d33';g.fillRect(0,0,n,n);g.fillStyle=band;g.beginPath();g.arc(c,c,r,0,Math.PI*2);g.fill();
  g.save();g.beginPath();g.arc(c,c,r*.76,0,Math.PI*2);g.clip();g.drawImage(image,c-r,c-r,2*r,2*r);g.restore();image.close();
  return [...new Uint8Array(await (await new Promise(res=>canvas.toBlob(res,'image/png'))).arrayBuffer())];
 },{bytes:[...fs.readFileSync('tests/fixtures/stamped-disc.webp')],band:BAND}));
 fs.writeFileSync(dir+'/input-destroyer-halo.png',destroyerHalo);
 const {cases:drawn}=await caseList(page,['halo','pixel']),input=Object.fromEntries(drawn);
 fs.writeFileSync(dir+'/input-wraith-halo.png',input.halo.photo);
 const CASES=[
  ['halo-star',{...input.halo,plastic:'Halo Star'}],
  ['halo-plain',input.halo],
  ['destroyer-halo',{mold:destroyer.id,photo:destroyerHalo,plastic:'Halo Star'}],
  ['pixel',input.pixel],
 ];
 for(const [,c] of CASES)await addDisc(page,dir,c);
 await api('/discs','POST',{mold_id:destroyer.id,plastic:'Halo Star',weight_g:175,wear:10,color:'#cf7d9e',pocket:'main',in_bag:true});
 const ALL=[...CASES.map(([k])=>k),'destroyer-bare'];
 let data=await (await page.request.get(base+'/api/bag')).json();
 assert.equal(data.discs.length,ALL.length);
 const ids=Object.fromEntries(data.discs.map((d,i)=>[ALL[i],d.id]));
 metrics.stored=Object.fromEntries(data.discs.map((d,i)=>[ALL[i],{plastic:d.plastic,color:d.color,photo_rim_color:d.photo_rim_color,rim_color:d.rim_color}]));
 // Product law: overmold is the catalog's, Halo is the copy's plastic, and only a photo gives a band.
 const S=metrics.stored;
 assert.ok(S['halo-star'].photo_rim_color&&dist(S['halo-star'].photo_rim_color,COLORS.band)<48,`Wraith band sampled near the drawn band (${S['halo-star'].photo_rim_color} vs ${COLORS.band})`);
 assert.ok(dist(S['halo-star'].photo_rim_color,S['halo-star'].color)>80,'the band is not the plate');
 assert.ok(S['destroyer-halo'].photo_rim_color&&dist(S['destroyer-halo'].photo_rim_color,BAND)<48,`Destroyer band sampled near the dye (${S['destroyer-halo'].photo_rim_color} vs ${BAND})`);
 assert.equal(S['halo-plain'].photo_rim_color,null,'the same photo on Star stores no band');
 assert.ok(S.pixel.photo_rim_color,'the Pixel still samples its rim piece');
 assert.equal(S['destroyer-bare'].photo_rim_color,null);
 for(const k of ALL)assert.equal(S[k].rim_color,null,`${k}: no explicit rim colour`);

 const rings=(png,{cx,cy,R})=>page.evaluate(async({b64,cx,cy,R})=>{
  const img=await createImageBitmap(await (await fetch('data:image/png;base64,'+b64)).blob()),c=new OffscreenCanvas(img.width,img.height),g=c.getContext('2d');g.drawImage(img,0,0);
  const d=g.getImageData(0,0,img.width,img.height).data,out={};
  for(const f of [.5,.6,.7,.75,.88,.91,.94,.97]){
   const rgb=[0,0,0];let n=0;
   for(let i=0;i<720;i++){const a=i/720*Math.PI*2,x=Math.round(cx+Math.cos(a)*R*f),y=Math.round(cy+Math.sin(a)*R*f),k=4*(y*img.width+x);for(let ch=0;ch<3;ch++)rgb[ch]+=d[k+ch];n++;}
   out[f]='#'+rgb.map(v=>Math.round(v/n).toString(16).padStart(2,'0')).join('');
  }
  return out;
 },{b64:png.toString('base64'),cx,cy,R});
 const OUTER=[.88,.91,.94,.97],INNER=[.5,.6,.7,.75];

 const surfaces=async label=>{
  const result={};
  await page.goto(base+'/?bag=1');await page.locator(`[data-bag-edit="${ids.pixel}"]`).waitFor();
  for(const k of ALL){
   const photo=k!=='destroyer-bare';
   await page.locator(`[data-disc-id="${ids[k]}"] [data-bag-inspect]`).click();
   await page.waitForFunction(({photo,mold})=>{const v=Disc3D.viewer;return v&&v.state.props?.mold===mold&&(!photo||v.debug.photo?.userData.photoReady);},{photo,mold:k.startsWith('destroyer')?'Destroyer':k==='pixel'?'Pixel':'Wraith'},{timeout:20000});await page.waitForTimeout(400);
   await page.locator('#detail .disc3d-canvas').first().screenshot({path:`${dir}/${label}-${k}-panel-angle.png`});
   const top=await page.evaluate(()=>{
    const v=Disc3D.viewer;v.setView('top',{instant:true});v.debug.renderNow();
    const cam=v.debug.camera,body=v.debug.body,V=cam.position.constructor,rect=v.debug.renderer.domElement.getBoundingClientRect();
    body.updateWorldMatrix(true,false);cam.updateMatrixWorld();let l=1e9,r=-1e9,t=1e9,b=-1e9;
    for(let i=0;i<64;i++){const a=i/64*Math.PI*2,p=new V(Math.cos(a)*v.state.radius,0,Math.sin(a)*v.state.radius).applyMatrix4(body.matrixWorld).project(cam),x=(p.x+1)/2*rect.width,y=(1-p.y)/2*rect.height;l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
    const g=v.debug.photo?.geometry.attributes.position;let reach=0;if(g)for(let i=0;i<g.count;i++)reach=Math.max(reach,Math.hypot(g.getX(i),g.getZ(i)));
    const multi=Array.isArray(v.debug.body.material);
    return {clip:{x:rect.left+l-6,y:rect.top+t-6,width:r-l+12,height:b-t+12},R:(r-l)/2,photoReach:g?+(reach/v.state.radius).toFixed(4):null,
     overmold:v.state.overmold,band:v.state.band??null,multi,rim:multi?'#'+v.debug.rimMaterial.color.getHexString():null,
     rimRoughness:multi?v.debug.rimMaterial.roughness:null,plateRoughness:v.debug.bodyMaterial.roughness,label:v.debug.renderer.domElement.getAttribute('aria-label')};
   });
   await page.waitForTimeout(150);
   const png=await page.screenshot({clip:top.clip,path:`${dir}/${label}-${k}-panel-top.png`});
   const clay=await page.evaluate(()=>{Disc3D.setClay(true);const v=Disc3D.viewer,m=v.debug.body.material,svg=v.debug.profileFigure.innerHTML;Disc3D.setClay(false);return {split:Array.isArray(m),profileRim:svg.includes('disc3d-profile-rim')};});
   const {clip,R,...rest}=top;result[k]={panel:{...rest,clay,rings:await rings(png,{cx:clip.width/2,cy:clip.height/2,R})}};
   await page.evaluate(()=>Disc3D.viewer.setView('angle',{instant:true}));
   await page.locator('#closeDetail').click();
  }
  // The bag list's thumbnails (atlas-art, the same renderer as the atlas's discs).
  await page.goto(base+'/?bag=1');
  for(const k of ALL){
   const host=page.locator(`[data-disc-id="${ids[k]}"] [data-disc-thumbnail]`);await host.scrollIntoViewIfNeeded();
   await page.locator(`[data-disc-id="${ids[k]}"] [data-disc-thumbnail].has-3d`).waitFor({timeout:20000});await page.waitForTimeout(k==='destroyer-bare'?300:1500);
   const png=await host.screenshot({path:`${dir}/${label}-${k}-thumbnail.png`}),box=await host.boundingBox();
   result[k].thumbnail={band:await host.getAttribute('data-halo-band'),rings:await rings(png,{cx:box.width/2,cy:box.height/2,R:box.width/2*.94})};
  }
  // My Bag: each disc pulled on its own, so it takes the detail look.
  for(const k of ALL){
   await page.goto(base+'/?bag=1');
   await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return s?.dataset.engine==='ready'&&s.dataset.phase==='open';},null,{timeout:40000});
   await page.evaluate(()=>document.fonts.ready);await page.locator('[data-bag-canvas]').scrollIntoViewIfNeeded();await page.mouse.move(2,2);
   await page.locator(`[data-physical-disc="${ids[k]}"]`).evaluate(n=>n.click());
   await page.waitForFunction(()=>{const s=document.querySelector('#bagScene');return !s.querySelector('[data-bag-canvas]').bagViewer.stage.moving&&s.dataset.staging==='still';},null,{timeout:20000});
   if(k!=='destroyer-bare')await page.waitForFunction(key=>document.querySelector('[data-bag-canvas]').bagViewer.getBagLayoutState().find(d=>d.key===key).photo?.relief,ids[k],{timeout:20000});
   await page.waitForTimeout(400);
   const m=await page.locator('[data-bag-canvas]').evaluate((n,key)=>{const v=n.bagViewer,c=n.getBoundingClientRect(),r=v.discScreenRect(key,{rim:true}),s=v.getBagLayoutState().find(d=>d.key===key);
    return {look:s.look,overmold:s.overmold,haloBand:s.haloBand??null,rimColor:s.rimColor,clip:{x:c.left+r.left-6,y:c.top+r.top-6,width:r.width+12,height:r.height+12},R:Math.min(r.width,r.height)/2};},ids[k]);
   const png=await page.screenshot({clip:m.clip,path:`${dir}/${label}-${k}-bag-pulled.png`});
   const {clip,R,...rest}=m;result[k].bag={...rest,rings:await rings(png,{cx:clip.width/2,cy:clip.height/2,R})};
  }
  return result;
 };

 if(reference){
  reference.on=true;metrics.reference=await surfaces('before');reference.on=false;
  assert.ok(reference.served>0,'the reference tree answered the asset requests');
 }
 const now=metrics.after=await surfaces(reference?'after':'current');
 const label=reference?'after':'current';

 // Halo copies: the band, as plastic, outside the photo; the photo reach is the shoulder, unchanged.
 for(const k of ['halo-star','destroyer-halo']){
  const p=now[k].panel,band=S[k].photo_rim_color;
  assert.equal(p.overmold,false,`${k}: never an overmold`);assert.equal(p.band,band);assert.equal(p.multi,true);assert.equal(p.rim,band);
  assert.equal(p.rimRoughness,p.plateRoughness,`${k}: the band wears the plate's plastic`);
  assert.match(p.label,/Halo band/);assert.doesNotMatch(p.label,/overmold/);
  assert.deepEqual(p.clay,{split:false,profileRim:false},`${k}: clay shows one piece`);
  assert.equal(now[k].bag.haloBand,band);assert.equal(now[k].bag.overmold,false);assert.equal(now[k].bag.rimColor,null);
  assert.equal(now[k].thumbnail.band,band);
 }
 // The same photo on Star, and the bare Halo copy: one material, no band; the Pixel keeps its overmold rim.
 for(const k of ['halo-plain','destroyer-bare']){
  const p=now[k].panel;assert.deepEqual([p.overmold,p.band,p.multi],[false,null,false],k);
  assert.equal(now[k].bag.haloBand,null);assert.equal(now[k].thumbnail.band,null);
 }
 assert.deepEqual([now.pixel.panel.overmold,now.pixel.panel.band,now.pixel.panel.multi],[true,null,true]);
 assert.equal(now['halo-star'].panel.photoReach,now['halo-plain'].panel.photoReach,'a Halo photo still stops at the shoulder');
 // On screen: outside the photo the Halo Wraith is nearer its band than the Star copy is; inside, the same photo.
 for(const s of ['panel','bag','thumbnail']){
  const halo=now['halo-star'][s].rings,plain=now['halo-plain'][s].rings,band=S['halo-star'].photo_rim_color;
  for(const f of OUTER.slice(1))assert.ok(dist(halo[f],band)+20<dist(plain[f],band),`${s} ${f} R: the band shows (${halo[f]} vs Star ${plain[f]}, band ${band})`);
  if(s==='panel')for(const f of INNER)assert.ok(dist(halo[f],plain[f])<=6,`${s} ${f} R: the photo inside the shoulder is untouched (${halo[f]} vs ${plain[f]})`);
 }

 if(reference){
  metrics.pixelDiff={};
  for(const k of ALL)for(const s of ['panel-angle','panel-top','bag-pulled','thumbnail'])metrics.pixelDiff[k+'-'+s]=await pixelDiff(page,`${dir}/before-${k}-${s}.png`,`${dir}/after-${k}-${s}.png`);
  // Controls: the same as main, pixel for pixel (a hair of GPU tolerance, as the photo-edge suite allows).
  for(const k of ['halo-plain','pixel','destroyer-bare'])for(const s of ['panel-angle','panel-top','bag-pulled','thumbnail']){
   const d=metrics.pixelDiff[k+'-'+s];assert.ok(!d.size&&d.over8<=d.pixels*.002,`${k} ${s}: unchanged from main (${JSON.stringify(d)})`);
  }
  // Halo copies: on main they drew the plate colour outside the photo; now the band. Inside, unchanged.
  for(const k of ['halo-star','destroyer-halo']){
   const a=metrics.reference[k].panel.rings,b=now[k].panel.rings,band=S[k].photo_rim_color;
   for(const f of OUTER.slice(1))assert.ok(dist(b[f],band)+20<dist(a[f],band),`${k} ${f} R: nearer the band than on main (${b[f]} vs ${a[f]})`);
   for(const f of INNER)assert.ok(dist(a[f],b[f])<=6,`${k} ${f} R: the photo unchanged from main`);
   assert.equal(metrics.reference[k].panel.multi,false,'main drew a Halo copy in one colour');
  }
 }

 // The photo_rim_color contract, Halo side: levelling re-samples, a plastic change hides a stale sample,
 // replacing re-samples, removing clears.
 const id=ids['halo-star'],first=S['halo-star'].photo_rim_color;
 const edit=async()=>{await page.goto(base+'/?bag=1');await page.locator(`[data-bag-edit="${id}"]`).click();await page.locator('#addDiscDialog').waitFor();};
 const save=async()=>{await page.locator('#saveDisc').click();await page.locator('#addDiscDialog').waitFor({state:'hidden'});return (await api('/discs/'+id)).disc;};
 await edit();await page.locator('.bag-photo-level').click();await page.locator('.photo-aligner[open]').waitFor();
 await page.locator('[data-aligner-confirm]').click();await page.locator('.photo-aligner').waitFor({state:'hidden'});
 let disc=await save();metrics.levelled=disc.photo_rim_color;assert.ok(dist(disc.photo_rim_color,first)<=6,`levelling keeps the band (${disc.photo_rim_color} vs ${first})`);
 await edit();await page.locator('#bagPlastic').selectOption('Star');disc=await save();
 assert.equal(disc.plastic,'Star');assert.ok(disc.photo_rim_color,'the stored sample stays');
 const viewerBand=async()=>{await page.goto(base+'/?bag=1');await page.locator(`[data-disc-id="${id}"] [data-bag-inspect]`).click();await page.waitForFunction(()=>Disc3D.viewer?.debug.photo?.userData.photoReady);
  return page.evaluate(()=>({band:Disc3D.viewer.state.band,multi:Array.isArray(Disc3D.viewer.debug.body.material)}));};
 assert.deepEqual(await viewerBand(),{band:null,multi:false},'a copy no longer Halo shows no band');
 await edit();await page.locator('#bagPlastic').selectOption('Halo Star');disc=await save();
 assert.deepEqual(await viewerBand(),{band:disc.photo_rim_color,multi:true},'back on Halo Star, its band returns');
 await edit();await page.locator('.bag-photo-file').setInputFiles({name:'destroyer.png',mimeType:'image/png',buffer:destroyerHalo});
 await page.locator('.photo-aligner[open]').waitFor();await page.locator('[data-aligner-confirm]').click();await page.locator('.photo-aligner').waitFor({state:'hidden'});
 disc=await save();metrics.replaced=disc.photo_rim_color;assert.ok(dist(disc.photo_rim_color,BAND)<48,'replacing the photo re-samples the band');
 await edit();await page.locator('.bag-photo-remove').click();disc=await save();
 assert.equal(disc.texture_key,null);assert.equal(disc.photo_rim_color,null,'removing the photo clears the band');

 fs.writeFileSync(dir+'/metrics.json',JSON.stringify(metrics,null,2));
 assert.deepEqual(errors,[]);
 const ring=k=>now[k].panel.rings[.94];
 console.log(`ok - halo plastic: Wraith band ${S['halo-star'].photo_rim_color} (drawn ${COLORS.band}), Destroyer band ${S['destroyer-halo'].photo_rim_color} (dyed ${BAND}); at 0.94 R Halo ${ring('halo-star')} vs Star ${ring('halo-plain')}; photo reach ${now['halo-star'].panel.photoReach} R both; level ${metrics.levelled}, replace ${metrics.replaced}, remove null`+
  (reference?`; vs main: controls max ${Math.max(...['halo-plain','pixel','destroyer-bare'].flatMap(k=>['panel-angle','panel-top','bag-pulled','thumbnail'].map(s=>metrics.pixelDiff[k+'-'+s].max)))}`:''));
}catch(error){if(page)await page.screenshot({path:dir+'/failure.png',fullPage:true}).catch(()=>{});throw error;}
finally{await browser?.close();server.kill();}
