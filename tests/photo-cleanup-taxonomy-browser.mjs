// The cleanup's failure taxonomy (docs/photo-edge-cleanup.md): what it fixes, what it leaves bounded, and what it
// cannot honestly do, each with a fixture. No server: every photo goes through preparePhoto() exactly as the
// aligner's Use photo does (the upload is byte-equal to it), and the stored WebP through planCleanup() and
// applyCleanup() exactly as photo.mjs's loader runs them. Fast enough to run on every change to photo-clean.mjs.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/photo-cleanup-taxonomy-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import {createRequire} from 'node:module';
import {makeFixtures} from './photo-cleanup-fixtures.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir='outputs/photo-edge-cleanup/taxonomy';fs.mkdirSync(dir,{recursive:true});
const types={'.mjs':'application/javascript','.js':'application/javascript','.json':'application/json'};
const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://x').pathname;if(p==='/'){res.writeHead(200,{'Content-Type':'text/html'});res.end('<!doctype html><title>taxonomy</title>');return;}if(p.includes('..')){res.writeHead(400);res.end();return;}try{const d=fs.readFileSync((p.startsWith('/docs/')?'.':'public')+p);res.writeHead(200,{'Content-Type':types[p.slice(p.lastIndexOf('.'))]||'application/octet-stream'});res.end(d);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch();
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack));await page.goto(base+'/');
 const F=await page.evaluate(makeFixtures,true);
 const out=await page.evaluate(async F=>{
  const {preparePhoto}=await import('/disc-photo.mjs'),{planCleanup,applyCleanup,ANALYSIS}=await import('/disc3d/photo-clean.mjs');
  const fromBytes=b=>createImageBitmap(new Blob([new Uint8Array(b)]));
  const read=(img,n)=>{const c=new OffscreenCanvas(n,n),g=c.getContext('2d');g.drawImage(img,0,0,n,n);return g.getImageData(0,0,n,n).data;};
  const b64=async blob=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(blob);});
  const png=async(d,n)=>{const c=new OffscreenCanvas(n,n);c.getContext('2d').putImageData(new ImageData(d,n,n),0,0);return b64(await c.convertToBlob());};
  // Share of each outer ring in the fixtures' warm hues (table, skin).
  const warm=(d,n)=>{const res={};for(const [lo,hi] of [[.8,.88],[.88,.94],[.94,.995]]){let t=0,w=0;for(let j=0;j<n;j++)for(let i=0;i<n;i++){const r=Math.hypot(i+.5-n/2,j+.5-n/2)/(n/2),k=4*(j*n+i);if(r<lo||r>=hi||d[k+3]<200)continue;t++;const R=d[k]/255,G=d[k+1]/255,B=d[k+2]/255,mx=Math.max(R,G,B),mn=Math.min(R,G,B),dd=mx-mn;if(mx<.15||dd<.25*mx)continue;let h=mx===R?((G-B)/dd)%6:mx===G?(B-R)/dd+2:(R-G)/dd+4;h*=60;if(h<0)h+=360;if(h>=10&&h<=50)w++;}res[lo]=t?+(100*w/t).toFixed(2):null;}return res;};
  const cases={};
  for(const k of ['misaligned','generous','plainTable','fingers','clean','tanFingers','faceHand','band']){const o=F[k].options,r0=Math.min(F.W,F.H)*o.scale/2;cases[k]={photo:F[k].photo,options:o,truth:{x:(F.disc.x-o.cx*F.W)/r0,y:(F.disc.y-o.cy*F.H)/r0,r:F.disc.r/r0}};}
  for(const k of ['stamp','halo','pixel'])cases[k]={photo:[...new Uint8Array(await (await fetch('/docs/assets/non-overmold-photo-edge/fixture-'+k+'.png')).arrayBuffer())],options:{}};
  const res={};
  for(const [k,c] of Object.entries(cases)){
   const {blob}=await preparePhoto(await fromBytes(c.photo),c.options),stored=await createImageBitmap(blob),n=stored.width;
   const t0=performance.now(),small=await createImageBitmap(blob,{resizeWidth:ANALYSIS,resizeHeight:ANALYSIS,resizeQuality:'high'}),plan=planCleanup(read(small,ANALYSIS)),t1=performance.now();
   const full=read(stored,n),t2=performance.now(),cleaned=plan.changed?applyCleanup(full,n,plan):full,t3=performance.now();
   let same=true;for(let i=0;i<full.length;i++)if(full[i]!==cleaned[i]){same=false;break;}
   // The plan drawn over the stored texture: the detected edge (yellow), the true one (green), masked patches (red).
   const ov=new Uint8ClampedArray(full),q=n/ANALYSIS;
   if(plan.mask)for(let j=0;j<n;j++)for(let i=0;i<n;i++)if(plan.mask[Math.floor(j/q)*ANALYSIS+Math.floor(i/q)]){const p=4*(j*n+i);ov[p]=255;ov[p+1]=0;ov[p+2]=0;ov[p+3]=255;}
   const oc=new OffscreenCanvas(n,n),og=oc.getContext('2d');og.putImageData(new ImageData(ov,n,n),0,0);og.lineWidth=3;
   const e=plan.report.edge;if(e){og.strokeStyle='#ff0';og.beginPath();og.arc((e.x+1)*n/2,(e.y+1)*n/2,e.r*n/2,0,7);og.stroke();}
   if(c.truth){og.strokeStyle='#0f0';og.beginPath();og.arc((c.truth.x+1)*n/2,(c.truth.y+1)*n/2,c.truth.r*n/2,0,7);og.stroke();}
   res[k]={report:plan.report,changed:plan.changed,same,truth:c.truth||null,warm:{before:warm(full,n),after:warm(cleaned,n)},planMs:+(t1-t0).toFixed(1),applyMs:+(t3-t2).toFixed(1),
    before:await png(full,n),after:await png(cleaned,n),overlay:await b64(await oc.convertToBlob())};
  }
  return res;
 },F);
 const summary={};
 for(const [k,r] of Object.entries(out)){
  for(const s of ['before','after','overlay'])fs.writeFileSync(`${dir}/${k}-${s}.png`,Buffer.from(r[s],'base64'));
  if(F[k]?.photo)fs.writeFileSync(`${dir}/${k}-photo.png`,Buffer.from(F[k].photo));
  delete r.before;delete r.after;delete r.overlay;summary[k]=r;
  console.log(k.padEnd(11),r.changed?'changed':'untouched',`plan ${r.planMs} ms, apply ${r.applyMs} ms`,JSON.stringify(r.report));
 }
 fs.writeFileSync(`${dir}/taxonomy.json`,JSON.stringify(summary,null,1));
 const near=(e,t)=>Math.hypot(e.x-t.x,e.y-t.y)<.01&&Math.abs(e.r-t.r)<.01,max=o=>Math.max(...Object.values(o));
 // Fixed: off-centre crescent, a generous framing on wood and on a plain table, fingers on the rim.
 for(const k of ['misaligned','generous','plainTable']){const r=summary[k];assert.ok(r.report.register&&near(r.report.edge,r.truth),`${k}: re-registered on the true edge (${JSON.stringify(r.report.edge)} vs ${JSON.stringify(r.truth)})`);}
 for(const k of ['misaligned','generous','fingers'])assert.ok(max(summary[k].warm.before)>=3&&max(summary[k].warm.after)<=.5,`${k}: table and skin gone (${JSON.stringify(summary[k].warm)})`);
 assert.equal(summary.fingers.report.register,null);assert.equal(summary.fingers.report.foreign.patches.length,3,'one patch per finger');
 // Content is sacred: the control, a smooth band in a colour the face never shows, and PR #9's stamp, halo and Pixel.
 for(const k of ['clean','band','stamp','halo','pixel'])assert.ok(!summary[k].changed&&summary[k].same,`${k}: untouched, byte for byte`);
 // Impossible: a finger across the face is the face's own colour by the time it reaches the annulus; nothing is invented.
 assert.ok(!summary.faceHand.changed,'a hand across the face is left as it is');
 // Bounded: skin on a tan disc is mostly the face's own colour; whatever is not stays.
 assert.equal(summary.tanFingers.report.register,null);
 assert.deepEqual(errors,[]);
 console.log('ok - taxonomy: crescent, generous framings (wood, plain table) and rim fingers fixed; control, band, stamp, halo, Pixel byte-identical; face hand untouched; tan disc fingers bounded');
}finally{await browser.close();server.close();}
