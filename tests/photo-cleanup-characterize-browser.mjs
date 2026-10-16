// Characterization for the photo edge cleanup (docs/photo-edge-cleanup.md): what foreign matter the upload
// pipeline bakes into a stored texture, where, and which class it belongs to. No fix is involved: the photos
// go through preparePhoto() exactly as the aligner's Use photo does (the upload is byte-equal to it,
// test:photo-textures), and the stored WebP is compared pixel by pixel with the fixtures' ground truth.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/photo-cleanup-characterize-browser.mjs
import fs from 'node:fs';
import http from 'node:http';
import {createRequire} from 'node:module';
import {makeFixtures} from './photo-cleanup-fixtures.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir=process.env.CLEANUP_OUT||'outputs/photo-edge-cleanup/characterize';fs.mkdirSync(dir,{recursive:true});
const types={'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.json':'application/json','.wasm':'application/wasm'};
const server=http.createServer((req,res)=>{
 const path=new URL(req.url,'http://x').pathname,file=path==='/'?null:'public'+path;
 if(!file){res.writeHead(200,{'Content-Type':'text/html'});res.end('<!doctype html><title>characterize</title>');return;}
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[file.slice(file.lastIndexOf('.'))]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.stack));
 await page.goto(base+'/');
 const fixtures=await page.evaluate(makeFixtures);
 const result=await page.evaluate(async F=>{
  const {preparePhoto,photoPoint}=await import('/disc-photo.mjs'),{shapeForDisc,shapeFrame}=await import('/disc3d/shape.mjs'),{isOvermold}=await import('/disc3d/overmold.mjs');
  const catalog=(await (await fetch('/data.json')).json()).discs;
  const bitmap=bytes=>createImageBitmap(new Blob([new Uint8Array(bytes)],{type:'image/png'}));
  const pixels=(image,w=image.width,h=image.height)=>{const c=new OffscreenCanvas(w,h),g=c.getContext('2d');g.drawImage(image,0,0,w,h);return g.getImageData(0,0,w,h).data;};
  const maskImage=await bitmap(F.fingerMask),finger=pixels(maskImage);
  const png=async(data,n)=>{const c=new OffscreenCanvas(n,n);c.getContext('2d').putImageData(new ImageData(data,n,n),0,0);const b=await c.convertToBlob({type:'image/png'});return [...new Uint8Array(await b.arrayBuffer())];};
  const out={};
  for(const name of ['misaligned','generous','fingers','clean']){
   const f=F[name],d=catalog.find(d=>d.id===f.mold),{shape}=shapeForDisc({model:d.model3d||null,specs:d.specs||null,flight:{speed:d.speed,turn:d.turn,fade:d.fade}}),{R,Rs,Ri}=shapeFrame(shape);
   const overmold=isOvermold({manufacturer:d.manufacturer,record:d.name});
   const image=await bitmap(f.photo),{blob}=await preparePhoto(image,f.options);
   const stored=await createImageBitmap(blob),n=stored.width,data=pixels(stored);
   // Ground truth for each texture pixel: where the aligner took it from in the photo, and what is there.
   const o={scale:.94,aspect:1,perspective:0,angle:0,cx:.5,cy:.5,...f.options,width:F.W,height:F.H};
   const rings=Array.from({length:12},(_,i)=>({from:.64+i*.03,to:.67+i*.03,total:0,table:0,finger:0}));
   const overlay=new Uint8ClampedArray(data);
   for(let j=0;j<n;j++)for(let i=0;i<n;i++){
    const u=(i+.5)/n*2-1,v=(j+.5)/n*2-1,r=Math.hypot(u,v),k=4*(j*n+i);if(r>=1||data[k+3]<200)continue;
    const p=photoPoint(u,v,o),table=Math.hypot(p.x-F.disc.x,p.y-F.disc.y)>F.disc.r,hand=f.hasFingers&&!table&&finger[4*(Math.round(p.y)*F.W+Math.round(p.x))]>127;
    const ring=rings.find(g=>r>=g.from&&r<g.to);if(ring){ring.total++;ring.table+=table;ring.finger+=hand;}
    if(table){overlay[k]=255;overlay[k+1]=0;overlay[k+2]=255;}else if(hand){overlay[k]=0;overlay[k+1]=255;overlay[k+2]=255;}
   }
   // Where the disc's own circle sits in the texture (the crop is the unit circle).
   const r0=Math.min(F.W,F.H)*o.scale/2,center={x:(F.disc.x-o.cx*F.W)/r0,y:(F.disc.y-o.cy*F.H)/r0};
   out[name]={mold:d.name,manufacturer:d.manufacturer,overmold,Rs:+(Rs/R).toFixed(4),Ri:+(Ri/R).toFixed(4),bytes:blob.size,size:n,
    discInTexture:{x:+center.x.toFixed(4),y:+center.y.toFixed(4),r:+(F.disc.r/r0).toFixed(4)},
    rings:rings.map(g=>({ring:g.from.toFixed(2)+'-'+g.to.toFixed(2),table:+(100*g.table/g.total).toFixed(2),finger:+(100*g.finger/g.total).toFixed(2)})),
    // Before PR #9 a one-piece photo was drawn only inside Rs; after it, to the nose.
    foreignShown:{beforePR9:0,afterPR9:0},
    stored:await png(data,n),overlay:await png(overlay,n)};
   let before=0,after=0,all=0;for(let j=0;j<n;j++)for(let i=0;i<n;i++){const u=(i+.5)/n*2-1,v=(j+.5)/n*2-1,r=Math.hypot(u,v),k=4*(j*n+i);if(r>=1||data[k+3]<200)continue;all++;if(overlay[k]!==data[k]||overlay[k+1]!==data[k+1]||overlay[k+2]!==data[k+2]){after++;if(r<Rs/R)before++;}}
   out[name].foreignShown={beforePR9:+(100*before/all).toFixed(2),afterPR9:+(100*after/all).toFixed(2)};
  }
  return out;
 },fixtures);
 for(const name of Object.keys(result)){
  fs.writeFileSync(`${dir}/${name}-stored.png`,Buffer.from(result[name].stored));fs.writeFileSync(`${dir}/${name}-truth.png`,Buffer.from(result[name].overlay));
  fs.writeFileSync(`${dir}/${name}-photo.png`,Buffer.from(fixtures[name].photo));delete result[name].stored;delete result[name].overlay;
 }
 fs.writeFileSync(`${dir}/characterize.json`,JSON.stringify(result,null,1));
 for(const [name,r] of Object.entries(result)){
  console.log(`${name}: ${r.mold} (${r.manufacturer}), overmold ${r.overmold}, Rs ${r.Rs} R, stored ${r.size}px ${r.bytes} B; disc in texture at (${r.discInTexture.x}, ${r.discInTexture.y}) r ${r.discInTexture.r}; foreign shown before PR #9 ${r.foreignShown.beforePR9}%, after ${r.foreignShown.afterPR9}%`);
  console.log('  '+r.rings.filter(g=>g.table||g.finger).map(g=>`${g.ring}: table ${g.table}% finger ${g.finger}%`).join(' | '));
 }
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser?.close();server.close();}
