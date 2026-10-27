// Shared by the photo-edge suites (docs/photo-edge-revert.md): the fixtures, the editor upload, and the
// reference tree a run can draw through first.
import fs from 'node:fs';
// docs/photo-adder-rework.md: this suite's photos go through today's aligner and are saved wearing Photo (tests/photo-flow.mjs).
import {frameByHand,keepPhotoLook} from './photo-flow.mjs';
import path from 'node:path';

// Molds by catalog id: Wraith (one piece), Thunderbird (one piece, the clean control), Pixel (overmold control).
export const MOLDS={wraith:'e70f48273d7f',thunderbird:'e9a88cc4f3b1',pixel:'e125b84243c2'};
// Each case: its mold, its photo, and how the aligner frames it (null: the editor's default crop).
//   stamp   Wraith, a full-front "30" stamp: diagonal stripes and numerals run to the physical edge.
//   halo    Wraith, Halo-style purple: a pale band in the plastic from 0.80 R to the edge.
//   wraith  Wraith, the round-2 signature of Freddy's stored Wraith texture (tests/fixtures/photo-edge-wraith.jpg).
//   clean   Thunderbird, framed exactly with nothing in the way: the clean control.
//   pixel   Pixel (overmold control): orange plate to the seam, a dark rim piece outside it.
export const COLORS={stripeA:'#f2c230',stripeB:'#1d3f8f',purple:'#5b2a86',band:'#e9c8f7',orange:'#b45a28',rim:'#101418'};
export async function caseList(page,names){
 const drawn=await page.evaluate(async C=>{
  const {shapeForDisc,shapeFrame}=await import('/disc3d/shape.mjs');
  const pixel=discs.find(d=>d.name==='Pixel'),{shape}=shapeForDisc({model:pixel.model3d,specs:pixel.specs,flight:{speed:pixel.speed,turn:pixel.turn,fade:pixel.fade}}),{R,Ri}=shapeFrame(shape);
  const n=1024,c=n/2,r=n*.47,png=async draw=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=n;const g=canvas.getContext('2d');
   g.fillStyle='#2a2d33';g.fillRect(0,0,n,n);g.save();g.beginPath();g.arc(c,c,r,0,Math.PI*2);g.clip();draw(g);g.restore();
   return [...new Uint8Array(await (await new Promise(res=>canvas.toBlob(res,'image/png'))).arrayBuffer())];};
  return {
   stamp:await png(g=>{
    g.fillStyle=C.stripeA;g.fillRect(0,0,n,n);g.fillStyle=C.stripeB;
    g.save();g.translate(c,c);g.rotate(Math.PI/4);for(let x=-n;x<n;x+=72)g.fillRect(x,-n,36,2*n);g.restore();
    g.font='900 560px Arial Black, Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=28;g.strokeStyle='#111';g.strokeText('30',c,c+30);g.fillStyle='#fff';g.fillText('30',c,c+30);
   }),
   halo:await png(g=>{
    const ring=g.createRadialGradient(c,c,0,c,c,r);ring.addColorStop(0,C.purple);ring.addColorStop(.78,C.purple);ring.addColorStop(.84,C.band);ring.addColorStop(1,C.band);
    g.fillStyle=ring;g.fillRect(0,0,n,n);g.fillStyle='#d8b04a';g.font='700 64px Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('WRAITH',c,c);
   }),
   pixel:await png(g=>{
    g.fillStyle=C.rim;g.fillRect(0,0,n,n);g.fillStyle=C.orange;g.beginPath();g.arc(c,c,r*Ri/R,0,Math.PI*2);g.fill();
    g.fillStyle='#111';g.fillRect(c-24,c-200,48,400);
   }),
   seam:Ri/R,
  };
 },COLORS);
 const fixture=f=>fs.readFileSync(new URL('./fixtures/'+f,import.meta.url));
 const all={
  stamp:{mold:MOLDS.wraith,photo:Buffer.from(drawn.stamp)},
  halo:{mold:MOLDS.wraith,photo:Buffer.from(drawn.halo)},
  wraith:{mold:MOLDS.wraith,photo:fixture('photo-edge-wraith.jpg'),type:'image/jpeg',framing:{scale:.74,cx:.48,cy:.5}},
  clean:{mold:MOLDS.thunderbird,photo:fixture('photo-edge-clean.jpg'),type:'image/jpeg',framing:{scale:.72,cx:.5,cy:.5}},
  pixel:{mold:MOLDS.pixel,photo:Buffer.from(drawn.pixel)},
 };
 return {cases:names.map(k=>[k,all[k]]),seam:drawn.seam};
}
// The real editor: choose the photo, frame it with the aligner's own controls, use it, save.
// `plastic`: one of the editor's plastic options (default: the editor's own default for the brand).
export async function addDisc(page,dir,{mold,photo,framing,type='image/png',plastic},destination='bag'){
 await page.evaluate(({mold,destination})=>{const d=discs.find(d=>d.id===mold);if(!d)throw Error('Missing mold '+mold);return BagApp.add(d,null,destination);},{mold,destination});
 await page.locator('#addDiscDialog').waitFor();
 if(plastic)await page.locator('#bagPlastic').selectOption(plastic);
 await page.locator('.bag-photo-file').setInputFiles({name:'photo.'+type.split('/')[1],mimeType:type,buffer:photo});await page.locator('.photo-aligner[open]').waitFor();await frameByHand(page);
 if(framing){
  await page.evaluate(scale=>{const el=document.querySelector('.photo-aligner [data-photo="scale"]');el.value=scale;el.dispatchEvent(new Event('input',{bubbles:true}));},framing.scale);
  await page.locator('.photo-aligner-view').focus();
  const press=async(key,n)=>{for(let i=0;i<n;i++)await page.keyboard.press(key);};
  await press(framing.cx>.5?'ArrowLeft':'ArrowRight',Math.round(Math.abs(framing.cx-.5)/.01));await press(framing.cy>.5?'ArrowUp':'ArrowDown',Math.round(Math.abs(framing.cy-.5)/.01));
 }
 await page.locator('.photo-aligner [data-aligner-confirm]').click();await page.locator('.photo-aligner').waitFor({state:'hidden'});await page.locator('.bag-photo-thumb img').waitFor();
 await keepPhotoLook(page);await page.locator('#saveDisc').click();
 await page.locator('#addDiscDialog').waitFor({state:'hidden'}).catch(async e=>{await page.screenshot({path:`${dir}/failure-add.png`});throw Error(e.message+' | Dialog: '+await page.locator('#addDiscDialog').innerText());});
}
// EDGE_REFERENCE=<checkout>: a scratch checkout of another commit, built (node scripts/build-workers.mjs), whose
// served tree (dist/workers-public) answers every asset request in place of this one's while `serve` is on.
// The worker routes (/api, /auth) and the stored textures stay this run's own, so both halves draw the same photos.
export async function referenceTree(context,base){
 const root=process.env.EDGE_REFERENCE&&path.resolve(process.env.EDGE_REFERENCE,'dist/workers-public');
 if(!root)return null;
 if(!fs.existsSync(root))throw Error('EDGE_REFERENCE has no built tree at '+root+' (run node scripts/build-workers.mjs there)');
 const TYPES={'.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.glb':'model/gltf-binary'};
 const ref={root,on:false,served:0};
 await context.route(url=>url.href.startsWith(base),async route=>{
  const u=new URL(route.request().url());
  if(!ref.on||/^\/(api|auth)\//.test(u.pathname))return route.fallback();
  const file=path.join(root,decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));
  if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fallback();
  ref.served++;
  return route.fulfill({status:200,headers:{'content-type':TYPES[path.extname(file)]||'application/octet-stream','cache-control':'no-store'},body:fs.readFileSync(file)});
 });
 return ref;
}
// Two PNG files of one surface: the largest channel difference and how many pixels moved at all.
export const pixelDiff=(page,a,b)=>page.evaluate(async([a,b])=>{
 const read=async b64=>{const img=await createImageBitmap(await (await fetch('data:image/png;base64,'+b64)).blob()),c=new OffscreenCanvas(img.width,img.height),g=c.getContext('2d');g.drawImage(img,0,0);return {w:img.width,h:img.height,d:g.getImageData(0,0,img.width,img.height).data};};
 const x=await read(a),y=await read(b);if(x.w!==y.w||x.h!==y.h)return {size:[x.w,x.h,y.w,y.h]};
 let max=0,moved=0,over8=0;for(let i=0;i<x.d.length;i+=4){const m=Math.max(...[0,1,2,3].map(c=>Math.abs(x.d[i+c]-y.d[i+c])));if(m){moved++;max=Math.max(max,m);}if(m>8)over8++;}
 return {max,moved,over8,pixels:x.w*x.h};
},[a,b].map(f=>fs.readFileSync(f).toString('base64')));
