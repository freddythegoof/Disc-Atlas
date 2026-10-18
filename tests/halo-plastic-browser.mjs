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
//   swirl            Wraith on Halo Star, the swirled-dye stand-in for Freddy's disc (tests/fixtures/halo-swirl.mjs,
//                    docs/halo-band-sampling.md): its band must store the dye, not the wash
//   swirl-main       (reference runs only) the same photo saved through the reference tree's editor: the band as
//                    the previous sampler stored it, for the before/after
// Each draws in the detail panel (top and 3/4), My Bag pulled and the bag list thumbnail.
//
// HALO_REFERENCE=v2: the reference is a v2 tree (the swirl-streak experiment's before/after): no '-main' copies,
// each disc against itself across the two renderers.
// EDGE_REFERENCE=<built checkout of main> draws every surface through that tree first. The renderers are the
// same on both sides of the band-sampling fix, so every surface must match it pixel for pixel (GPU tolerance).
// PR #23's own before/after (main without Halo) is recorded in docs/halo-plastic.md.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import https from 'node:https';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import zlib from 'node:zlib';
import {caseList,addDisc,referenceTree,pixelDiff,COLORS} from './photo-edge-shared.mjs';
import {swirlPhoto,swirlCrop,drawnFront,SEAM} from './fixtures/halo-swirl.mjs';
import {parseHalo,frontAt,HALO_FEATHER} from '../public/disc3d/halo.mjs';
import {delightPixels,bandColor} from '../public/disc-albedo.mjs';
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
const lab=h=>{const lin=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;},[r,g,b]=hex(h).map(lin),f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;
 const fx=f((.4124*r+.3576*g+.1805*b)/.95047),fy=f(.2126*r+.7152*g+.0722*b),fz=f((.0193*r+.1192*g+.9505*b)/1.08883);return [116*fy-16,500*(fx-fy),200*(fy-fz)];};
const dE=(a,b)=>{const p=lab(a),q=lab(b);return Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);},chroma=h=>Math.hypot(lab(h)[1],lab(h)[2]);
// The swirl's dye as the pipeline itself de-lights it (the solid-dye control, tests/halo-band-sampling.mjs).
const SWIRL_DYE='#5a267b';
// Halo v2 (docs/halo-band-v2.md): the asymmetric swirl's wash as the pipeline de-lights it (its wash-only control),
// and the front tolerance: RMS 0.015 R and worst 0.035 R against the drawn front, both under its 0.045 R feather.
const ASYM_WASH=(()=>{const d=swirlCrop(1024,{washOnly:true});delightPixels(d,1024,{});return bandColor(d,1024,SEAM);})(),FRONT_RMS=.015,FRONT_MAX=.035;
// A minimal RGBA PNG (one IDAT, filter 0) for the fixture photo.
const png=(rgba,n)=>{
 const crc=b=>{let c=~0;for(const x of b){c^=x;for(let k=0;k<8;k++)c=c>>>1^(c&1?0xedb88320:0);}return ~c>>>0;};
 const chunk=(type,body)=>{const t=Buffer.from(type),len=Buffer.alloc(4),sum=Buffer.alloc(4);len.writeUInt32BE(body.length);sum.writeUInt32BE(crc(Buffer.concat([t,body])));return Buffer.concat([len,t,body,sum]);};
 const head=Buffer.alloc(13);head.writeUInt32BE(n,0);head.writeUInt32BE(n,4);head[8]=8;head[9]=6;
 const raw=Buffer.alloc(n*(4*n+1));for(let y=0;y<n;y++)Buffer.from(rgba.buffer,y*n*4,n*4).copy(raw,y*(4*n+1)+1);
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',head),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
};
const metrics={};
try{
 const deadline=Date.now()+45000;while(!await ready()){if(Date.now()>deadline||server.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:process.env.BAG3D_CHROMIUM_ARGS?.split(' ')||(process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'])});
 const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}}),errors=[];
 const reference=await referenceTree(context,base),MAIN=!!reference&&process.env.HALO_REFERENCE!=='v2';
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
 const swirl={mold:input.halo.mold,photo:png(swirlPhoto(1024),1024),plastic:'Halo Star'};fs.writeFileSync(dir+'/input-swirl.png',swirl.photo);
 await addDisc(page,dir,swirl);
 // Halo v2: the asymmetric marbled swirl (a wash ring, a lopsided dye front), a fat-dyed control (dye from the
 // seam: no wash) and a solid-dye control. Both controls must store no two-colour model and draw as v1 did.
 const variant=(name,options)=>{const photo=png(swirlPhoto(1024,options),1024);fs.writeFileSync(`${dir}/input-${name}.png`,photo);return {mold:input.halo.mold,photo,plastic:'Halo Star'};};
 const asym=variant('asym',{asym:true});
 for(const c of [asym,variant('fat',{front:.80}),variant('solid',{pure:true})])await addDisc(page,dir,c);
 // The before half: the same photos saved through the reference tree's own editor and sampler.
 if(MAIN){
  reference.on=true;await page.goto(base+'/?bag=1');await page.locator('[data-bag-edit]').first().waitFor();
  await addDisc(page,dir,swirl);await addDisc(page,dir,asym);reference.on=false;await page.goto(base+'/?bag=1');
 }
 const ALL=[...CASES.map(([k])=>k),'destroyer-bare','swirl','asym','fat','solid',...MAIN?['swirl-main','asym-main']:[]];
 let data=await (await page.request.get(base+'/api/bag')).json();
 assert.equal(data.discs.length,ALL.length);
 const ids=Object.fromEntries(data.discs.map((d,i)=>[ALL[i],d.id]));
 metrics.stored=Object.fromEntries(data.discs.map((d,i)=>[ALL[i],{plastic:d.plastic,color:d.color,photo_rim_color:d.photo_rim_color,photo_halo:d.photo_halo??null,rim_color:d.rim_color}]));
 // Product law: overmold is the catalog's, Halo is the copy's plastic, and only a photo gives a band.
 const S=metrics.stored;
 assert.ok(S['halo-star'].photo_rim_color&&dist(S['halo-star'].photo_rim_color,COLORS.band)<48,`Wraith band sampled near the drawn band (${S['halo-star'].photo_rim_color} vs ${COLORS.band})`);
 assert.ok(dist(S['halo-star'].photo_rim_color,S['halo-star'].color)>80,'the band is not the plate');
 assert.ok(S['destroyer-halo'].photo_rim_color&&dist(S['destroyer-halo'].photo_rim_color,BAND)<48,`Destroyer band sampled near the dye (${S['destroyer-halo'].photo_rim_color} vs ${BAND})`);
 assert.equal(S['halo-plain'].photo_rim_color,null,'the same photo on Star stores no band');
 assert.ok(S.pixel.photo_rim_color,'the Pixel still samples its rim piece');
 assert.equal(S['destroyer-bare'].photo_rim_color,null);
 for(const k of ALL)assert.equal(S[k].rim_color,null,`${k}: no explicit rim colour`);
 // The swirl stores its dye: within ΔE 6 of the de-lit dye, at least 85% of its chroma (not the pastel median).
 const swirlBand=S.swirl.photo_rim_color;
 assert.ok(swirlBand&&dE(swirlBand,SWIRL_DYE)<=6&&chroma(swirlBand)>=.85*chroma(SWIRL_DYE),`swirl band ${swirlBand} is the dye ${SWIRL_DYE} (ΔE ${swirlBand&&dE(swirlBand,SWIRL_DYE).toFixed(1)})`);
 // v2 never moves the dye: the reference editor (main, PR #24's sampler) stores the same band for the same photo.
 if(MAIN)for(const k of ['swirl','asym'])assert.equal(S[k+'-main'].photo_rim_color,S[k].photo_rim_color,`${k}: the same dye as main stores`);
 // v2: the asymmetric swirl stores its wash and a front that tracks the drawn one; the controls store none.
 const model=parseHalo(S.asym.photo_halo);assert.ok(model,`the asymmetric swirl stores a two-colour model (${S.asym.photo_halo})`);
 assert.ok(dE(model.wash,ASYM_WASH)<=4,`stored wash ${model.wash} ≈ the drawn wash ${ASYM_WASH} (ΔE ${dE(model.wash,ASYM_WASH).toFixed(1)})`);
 assert.ok(dE(S.asym.photo_rim_color,SWIRL_DYE)<=6,`the dye is still the dye (${S.asym.photo_rim_color})`);
 const frontErrors=Array.from({length:360},(_,i)=>{const a=(i+.5)*Math.PI/180;return frontAt(model.front,a)-drawnFront(a,{asym:true});});
 metrics.front={rms:+Math.sqrt(frontErrors.reduce((sum,e)=>sum+e*e,0)/360).toFixed(4),max:+Math.max(...frontErrors.map(Math.abs)).toFixed(4),bias:+(frontErrors.reduce((sum,e)=>sum+e,0)/360).toFixed(4),
  range:[+Math.min(...model.front).toFixed(3),+Math.max(...model.front).toFixed(3)]};
 assert.ok(metrics.front.rms<=FRONT_RMS&&metrics.front.max<=FRONT_MAX,`the stored front tracks the drawn front (${JSON.stringify(metrics.front)})`);
 for(const k of ['fat','solid','halo-star','destroyer-halo'])assert.equal(S[k].photo_halo,null,`${k}: one colour across the band, no two-colour model`);
 assert.ok(S.fat.photo_rim_color&&S.solid.photo_rim_color,'the controls still store their dye');
 if(MAIN)for(const k of ['swirl-main','asym-main'])assert.equal(S[k].photo_halo,null,`${k}: the reference editor stores no model`);

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
   // The edge-on and underside views, for the before/after sheets of the two-colour band.
   if(['asym','asym-main','fat','swirl'].includes(k))for(const view of ['profile','bottom']){
    await page.evaluate(view=>{const v=Disc3D.viewer;v.setView(view,{instant:true});v.debug.renderNow();},view);await page.waitForTimeout(150);
    await page.locator('#detail .disc3d-canvas').first().screenshot({path:`${dir}/${label}-${k}-panel-${view}.png`});
   }
   const top=await page.evaluate(()=>{
    const v=Disc3D.viewer;v.setView('top',{instant:true});v.debug.renderNow();
    const cam=v.debug.camera,body=v.debug.body,V=cam.position.constructor,rect=v.debug.renderer.domElement.getBoundingClientRect();
    body.updateWorldMatrix(true,false);cam.updateMatrixWorld();let l=1e9,r=-1e9,t=1e9,b=-1e9;
    for(let i=0;i<64;i++){const a=i/64*Math.PI*2,p=new V(Math.cos(a)*v.state.radius,0,Math.sin(a)*v.state.radius).applyMatrix4(body.matrixWorld).project(cam),x=(p.x+1)/2*rect.width,y=(1-p.y)/2*rect.height;l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
    const g=v.debug.photo?.geometry.attributes.position;let reach=0;if(g)for(let i=0;i<g.count;i++)reach=Math.max(reach,Math.hypot(g.getX(i),g.getZ(i)));
    const multi=Array.isArray(v.debug.body.material);
    return {clip:{x:rect.left+l-6,y:rect.top+t-6,width:r-l+12,height:b-t+12},R:(r-l)/2,photoReach:g?+(reach/v.state.radius).toFixed(4):null,
     overmold:v.state.overmold,band:v.state.band??null,halo:v.state.halo??null,twoTone:multi&&v.debug.body.material[1]===v.debug.haloRimMaterial,multi,rim:multi?'#'+v.debug.rimMaterial.color.getHexString():null,
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
    return {look:s.look,overmold:s.overmold,haloBand:s.haloBand??null,haloTwoTone:s.haloTwoTone,rimColor:s.rimColor,clip:{x:c.left+r.left-6,y:c.top+r.top-6,width:r.width+12,height:r.height+12},R:Math.min(r.width,r.height)/2};},ids[k]);
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

 // Halo copies: the band, as plastic, outside the photo; the photo reach is the shoulder, unchanged.
 for(const k of ['halo-star','destroyer-halo','swirl','asym','fat','solid',...MAIN?['swirl-main','asym-main']:[]]){
  const p=now[k].panel,band=S[k].photo_rim_color;
  assert.equal(p.overmold,false,`${k}: never an overmold`);assert.equal(p.band,band);assert.equal(p.multi,true);assert.equal(p.rim,band);
  assert.equal(p.rimRoughness,p.plateRoughness,`${k}: the band wears the plate's plastic`);
  assert.match(p.label,/Halo band/);assert.doesNotMatch(p.label,/overmold/);
  assert.deepEqual(p.clay,{split:false,profileRim:false},`${k}: clay shows one piece`);
  assert.equal(now[k].bag.haloBand,band);assert.equal(now[k].bag.overmold,false);assert.equal(now[k].bag.rimColor,null);
  assert.equal(now[k].thumbnail.band,band);
  // Two colours only where a model is stored (photo_halo); every other band is the v1 one colour.
  const toned=!!S[k].photo_halo;
  assert.equal(p.halo,S[k].photo_halo);assert.equal(p.twoTone,toned,`${k}: two-tone in the viewer`);assert.equal(now[k].bag.haloTwoTone,toned,`${k}: two-tone in the bag`);
 }
 // Halo v2 on screen, measured without the light: the asymmetric swirl's band drawn top-down by atlas art (the
 // thumbnails' and the Atlas's renderer; orthographic, so screen radius is disc radius, and its axes are the
 // photo's) at 960 px, three times under the same light: v2, and the v1 one-colour band in the dye and in the wash.
 // Per pixel, (v2 − dye) / (wash − dye) is the wash's share there: diffuse light, specular and reflections cancel.
 // Along 16 rays at known photo angles that gives where the purple takes over and how wide its blend is.
 {
  const RAY_A=Array.from({length:16},(_,j)=>(j+.5)*Math.PI/8),RAY_T=Array.from({length:63},(_,i)=>+(.83+.0025*i).toFixed(4));
  const profiles=async linear=>page.evaluate(async({mold,color,band,model,wash,RAY_A,RAY_T,linear})=>{
   const {createAtlasArt}=await import('/disc3d/atlas-art.mjs'),art=await createAtlasArt({dpr:10});
   // Linear tone mapping at low exposure keeps light proportional (no highlight roll-off, no clipping), so the share
   // reads the band's own albedo blend; the product's Neutral mapping is what a person sees.
   if(linear){art.debug.renderer.toneMapping=1;art.debug.renderer.toneMappingExposure=.3;}
   // The experiment's wisps lighten the dye; measured without them, the blend is the front's alone.
   if(art.debug.haloRim?.haloStreak)art.debug.haloRim.haloStreak.value=0;
   const d=discs.find(x=>x.id===mold),lin=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;};
   const draw=(id,b,m)=>{const e=art.render({...d,id:'halo-ray-'+id,haloBand:b,...m&&{haloModel:m}},color,96,undefined,'full');
    return {px:e.px,R:(e.px-2)/2,data:e.canvas.getContext('2d').getImageData(0,0,e.px,e.px).data};};
   const two=draw('v2',band,model),dye=draw('dye',band,null),pale=draw('wash',wash,null),c=two.px/2;
   const Y=(img,x,y)=>{const k=4*(Math.round(y)*img.px+Math.round(x));return .2126*lin(img.data[k])+.7152*lin(img.data[k+1])+.0722*lin(img.data[k+2]);};
   const out=RAY_A.map(a=>RAY_T.map(t=>{const x=c+t*two.R*Math.cos(a),y=c+t*two.R*Math.sin(a),lo=Y(dye,x,y),hi=Y(pale,x,y);return (Y(two,x,y)-lo)/Math.max(1e-5,hi-lo);}));
   art.dispose();return out;
  },{mold:input.halo.mold,color:S.asym.color,band:S.asym.photo_rim_color,model:S.asym.photo_halo,wash:parseHalo(S.asym.photo_halo).wash,RAY_A,RAY_T,linear});
  const at=(share,level)=>{for(let i=1;i<share.length;i++)if(share[i-1]>level&&share[i]<=level)return RAY_T[i-1]+(RAY_T[i]-RAY_T[i-1])*(share[i-1]-level)/(share[i-1]-share[i]);return null;};
  const measure=rays=>rays.map((ray,j)=>{
   const wash=ray.map(v=>Math.min(1,Math.max(0,v))),front=at(wash,.5),inner=at(wash,.9),outer=at(wash,.1);
   return {angle:+(RAY_A[j]*180/Math.PI).toFixed(1),drawn:+drawnFront(RAY_A[j],{asym:true}).toFixed(3),rendered:front&&+front.toFixed(3),blend:inner&&outer&&+(outer-inner).toFixed(3)};
  });
  metrics.rays=measure(await profiles(true));metrics.raysOnScreen=measure(await profiles(false));
  fs.writeFileSync(dir+'/rays.json',JSON.stringify({albedo:metrics.rays,onScreen:metrics.raysOnScreen},null,1));
  for(const r of metrics.rays){
   assert.ok(r.rendered!==null&&Math.abs(r.rendered-r.drawn)<=FRONT_MAX,`ray ${r.angle}°: the purple takes over at ${r.rendered} R, drawn ${r.drawn} R`);
   assert.ok(r.blend!==null&&Math.abs(r.blend-HALO_FEATHER)<=.008,`ray ${r.angle}°: a soft front, ${r.blend} R wide (HALO_FEATHER ${HALO_FEATHER})`);
  }
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
  // Every disc without a two-colour model draws as main draws it, pixel for pixel (a hair of GPU tolerance, as the
  // photo-edge suite allows): v1 bands, the controls, overmold and plain discs are untouched.
  for(const k of ALL.filter(k=>!S[k].photo_halo))for(const s of ['panel-angle','panel-top','bag-pulled','thumbnail']){
   const d=metrics.pixelDiff[k+'-'+s];assert.ok(!d.size&&d.over8<=d.pixels*.002,`${k} ${s}: unchanged from main (${JSON.stringify(d)})`);
  }
  // The asymmetric swirl, v1 (main's editor and renderer) against v2, the same photo: inside the photo, the same;
  // at 0.88 R the v2 band is the wash's, and at the lip both are dye.
  if(MAIN){
  const before=now['asym-main'].panel.rings,after=now.asym.panel.rings,wash=parseHalo(S.asym.photo_halo).wash;
  assert.ok(dE(after[.88],wash)+10<dE(before[.88],wash),`asym 0.88 R: the wash ring shows (${after[.88]} vs v1 ${before[.88]}, wash ${wash})`);
  assert.ok(dE(after[.97],before[.97])<=12,`asym 0.97 R: still the dye at the lip (${after[.97]} vs v1 ${before[.97]})`);
  for(const f of INNER)assert.ok(dist(before[f],after[f])<=6,`asym ${f} R: the photo is the same photo`);
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
  `; swirl band ${swirlBand} (dye ${SWIRL_DYE})`+`; v2 asym wash ${parseHalo(S.asym.photo_halo).wash} front rms ${metrics.front.rms} max ${metrics.front.max} R, on screen within ${Math.max(...metrics.rays.map(r=>Math.abs(r.rendered-r.drawn))).toFixed(3)} R, blend ${Math.min(...metrics.rays.map(r=>r.blend))}–${Math.max(...metrics.rays.map(r=>r.blend))} R`+
  (reference?`; vs main: dye unchanged, unmodelled surfaces max ${Math.max(...Object.entries(metrics.pixelDiff).filter(([k])=>!S[ALL.find(n=>k.startsWith(n+'-panel')||k.startsWith(n+'-bag')||k.startsWith(n+'-thumb'))]?.photo_halo).map(([,d])=>d.max))}`:''));
}catch(error){if(page)await page.screenshot({path:dir+'/failure.png',fullPage:true}).catch(()=>{});throw error;}
finally{await browser?.close();server.kill();}
