// Round 2 of the photo cleanup (docs/photo-edge-cleanup.md, "Round 2"): the failure signatures of Freddy's real
// photos after PR #10, as fixtures (tests/photo-cleanup-signatures.mjs), and what each one was. No server: every
// photo goes through preparePhoto() exactly as the aligner's Use photo does, then the stored WebP is planned by
// main's photo-clean.mjs (CLEANUP_BASE, PR #10: "before") and by the working copy ("after").
//
// Ground truth: for every texture pixel, where in the photo the aligner took it from and whether that is the disc,
// the table or a finger. A cleaned pixel is foreign when at least half of what it shows comes from foreign pixels
// (provenance: registration, fills and the stop, exactly as the renderer composes them). Each signature's
// round-1 failure is classified from the before plan:
//   no-plan     no confident edge, the crescent took the untouched path;
//   wrong-fit   a circle registered, but too big or off the true edge;
//   patch-miss  the fit (or no fit needed) was right, foreign matter was classified as plastic, or plastic
//               (glare) as foreign.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/photo-cleanup-signatures-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {makeSignatures} from './photo-cleanup-signatures.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.CLEANUP_BASE||'549150a',dir='outputs/photo-edge-cleanup/round2';fs.mkdirSync(dir,{recursive:true});
const old=execFileSync('git',['show',BASE+':public/disc3d/photo-clean.mjs'],{encoding:'utf8'});
const types={'.mjs':'application/javascript','.js':'application/javascript','.json':'application/json'};
const server=http.createServer((req,res)=>{
 const p=new URL(req.url,'http://x').pathname;
 if(p==='/'){res.writeHead(200,{'Content-Type':'text/html'});res.end('<!doctype html><title>round 2</title>');return;}
 if(p==='/before/photo-clean.mjs'){res.writeHead(200,{'Content-Type':'application/javascript'});res.end(old);return;}
 if(p.includes('..')){res.writeHead(400);res.end();return;}
 try{const d=fs.readFileSync((p.startsWith('/docs/')?'.':'public')+p);res.writeHead(200,{'Content-Type':types[p.slice(p.lastIndexOf('.'))]||'application/octet-stream'});res.end(d);}catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch();
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack));await page.goto(base+'/');
 const F=await page.evaluate(makeSignatures);
 const out=await page.evaluate(async F=>{
  const {preparePhoto,photoPoint}=await import('/disc-photo.mjs'),after=await import('/disc3d/photo-clean.mjs'),before=await import('/before/photo-clean.mjs');
  const bitmap=b=>createImageBitmap(new Blob([new Uint8Array(b)]));
  const read=(img,n,w=n,h=n)=>{const c=new OffscreenCanvas(w,h),g=c.getContext('2d');g.drawImage(img,0,0,w,h);return g.getImageData(0,0,w,h).data;};
  const b64=async blob=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(blob);});
  const png=async(d,n)=>{const c=new OffscreenCanvas(n,n);c.getContext('2d').putImageData(new ImageData(d,n,n),0,0);return b64(await c.convertToBlob());};
  // Round 1's renderer (PR #10), for its plans: registration, then the fill across each patch, nothing else.
  const source=(reg,u,v,limit)=>{if(!reg)return [u,v];let x=reg.x+reg.r*u,y=reg.y+reg.r*v;if(x*x+y*y<=limit*limit)return [x,y];const dx=x-reg.x,dy=y-reg.y,b=reg.x*dx+reg.y*dy,a=dx*dx+dy*dy,c=reg.x*reg.x+reg.y*reg.y-limit*limit,t=(-b+Math.sqrt(Math.max(0,b*b-a*c)))/a;return [reg.x+dx*t,reg.y+dy*t];};
  const roundOne=(plan,u,v,limit,emit)=>{
   const {reg,mask,gaps,n}=plan,r=Math.hypot(u,v);if(r>=1)return;
   const i=Math.floor((u+1)/2*n),j=Math.floor((v+1)/2*n),m=mask&&mask[j*n+i]?j*n+i:-1;
   if(m<0){const [x,y]=source(reg,u,v,limit);emit(x,y,1);return;}
   const a=Math.atan2(v,u),ci=m%n,cj=(m-ci)/n;let da=a-Math.atan2((cj+.5)/n*2-1,(ci+.5)/n*2-1);da-=2*Math.PI*Math.round(da/(2*Math.PI));
   const g=2*(mask[m]-1),lo=Math.max(1e-4,gaps[g]+da),hi=Math.max(1e-4,gaps[g+1]-da),t=lo/(lo+hi);
   emit(...source(reg,r*Math.cos(a-lo),r*Math.sin(a-lo),limit),1-t);emit(...source(reg,r*Math.cos(a+hi),r*Math.sin(a+hi),limit),t);
  };
  const res={};
  for(const k of ['wraith','halo','pink','orange','destroyer']){
   const f=F[k],o={scale:.94,aspect:1,perspective:0,angle:0,cx:.5,cy:.5,...f.options,width:F.W,height:F.H},r0=Math.min(F.W,F.H)*o.scale/2;
   const truth={x:(F.disc.x-o.cx*F.W)/r0,y:(F.disc.y-o.cy*F.H)/r0,r:F.disc.r/r0};
   const finger=read(await bitmap(f.mask),0,F.W,F.H);
   const foreignAt=(u,v)=>{const p=photoPoint(u,v,o);if(Math.hypot(p.x-F.disc.x,p.y-F.disc.y)>F.disc.r)return true;const x=Math.round(p.x),y=Math.round(p.y);return f.hasFingers&&x>=0&&y>=0&&x<F.W&&y<F.H&&finger[4*(y*F.W+x)]>127;};
   const {blob}=await preparePhoto(await bitmap(f.photo),f.options),stored=await createImageBitmap(blob),n=stored.width,full=read(stored,n);
   const small=read(await createImageBitmap(blob,{resizeWidth:after.ANALYSIS,resizeHeight:after.ANALYSIS,resizeQuality:'high'}),after.ANALYSIS);
   const t0=performance.now(),plans={before:before.planCleanup(small),after:after.planCleanup(small)},planMs=performance.now()-t0;
   const row={truth:Object.fromEntries(Object.entries(truth).map(([q,v])=>[q,+v.toFixed(4)])),planMs:+planMs.toFixed(1)};
   for(const [label,plan] of Object.entries(plans)){
    const trace=label==='before'?roundOne:after.provenance,rings={},overlay=new Uint8ClampedArray(plan.changed?(label==='before'?before:after).applyCleanup(full,n,plan):full),limit=1-3/n;
    for(let j=0;j<n;j+=2)for(let i=0;i<n;i+=2){
     const u=(i+.5)/n*2-1,v=(j+.5)/n*2-1,r=Math.hypot(u,v);if(r<.8||r>=.995)continue;
     let shown=0,bad=0;trace(plan,u,v,limit,(x,y,w)=>{shown+=w;if(foreignAt(x,y))bad+=w;});
     const key=(Math.floor(r*20)/20).toFixed(2);rings[key]??=[0,0];rings[key][0]++;
     if(bad>=.5){rings[key][1]++;for(const [di,dj] of [[0,0],[1,0],[0,1],[1,1]]){const q=4*((j+dj)*n+i+di);overlay[q]=255;overlay[q+1]=0;overlay[q+2]=0;overlay[q+3]=255;}}
    }
    row[label]={report:plan.report,changed:plan.changed,rings:Object.fromEntries(Object.entries(rings).sort().map(([q,[t,b]])=>[q,+(100*b/t).toFixed(1)])),image:await png(overlay,n)};
   }
   row.stored=await png(full,n);res[k]=row;
  }
  return res;
 },F);
 const summary={};
 for(const [k,r] of Object.entries(out)){
  fs.writeFileSync(`${dir}/${k}-photo.jpg`,Buffer.from(F[k].photo));fs.writeFileSync(`${dir}/${k}-stored.png`,Buffer.from(r.stored,'base64'));delete r.stored;
  for(const s of ['before','after']){fs.writeFileSync(`${dir}/${k}-${s}.png`,Buffer.from(r[s].image,'base64'));delete r[s].image;}
  summary[k]=r;
 }
 // What each signature was under PR #10, from its plan and the ground truth.
 const off=(e,t)=>e&&+Math.max(Math.hypot(e.x-t.x,e.y-t.y),Math.abs(e.r-t.r)).toFixed(4);
 for(const [k,r] of Object.entries(summary)){
  const b=r.before.report,reg=b.register&&{...b.register,r:b.register.r+.008},outer=Math.max(...Object.values(r.before.rings));
  r.classified=reg&&off(reg,r.truth)>.01?'wrong-fit':!reg&&b.edge==null&&outer>=5?'no-plan':!reg&&outer>=5&&b.edge?'no-plan':'patch-miss';
  r.evidence={edge:b.edge,register:b.register,offTruth:off(reg,r.truth),patches:b.foreign?.patches.map(p=>p.span)||[],outerForeign:outer};
 }
 fs.writeFileSync(`${dir}/signatures.json`,JSON.stringify(summary,null,1));
 for(const [k,r] of Object.entries(summary)){
  console.log(`${k.padEnd(10)} PR #10: ${r.classified.padEnd(10)} ${JSON.stringify(r.evidence)}`);
  console.log(`${''.padEnd(10)} foreign shown by ring, before ${JSON.stringify(r.before.rings)} → after ${JSON.stringify(r.after.rings)}; now ${JSON.stringify({edge:r.after.report.edge,ray:r.after.report.ray,register:r.after.report.register,stop:r.after.report.stop,patches:r.after.report.foreign?.patches.map(p=>p.span),glare:r.after.report.glare,cut:r.after.report.cut})} (${r.planMs} ms for both plans)`);
 }
 const max=o=>Math.max(...Object.values(o));
 // Each signature reproduces, and is the failure it is.
 assert.equal(summary.wraith.classified,'wrong-fit','Wraith: PR #10 registered a circle off the true edge');
 assert.ok(summary.wraith.before.report.foreign.patches.some(p=>p.span>60),'Wraith: PR #10 also filled its rim glare as foreign (a band over the stripes)');
 assert.equal(summary.halo.classified,'no-plan','Halo Wraith: PR #10 found no edge');
 assert.equal(summary.pink.classified,'no-plan','pale pink: PR #10 found no edge');
 assert.equal(summary.pink.before.report.foreign,null,'pale pink: and its fingers were classified as plastic');
 assert.ok(summary.orange.classified==='no-plan'&&summary.orange.before.report.edge&&!summary.orange.before.report.register,'orange: PR #10 had an off edge it would not register; the crescent stayed');
 assert.equal(summary.destroyer.classified,'wrong-fit','Destroyer-shaped JPEG: PR #10 registered a 43-ray circle off the true edge');
 for(const k of ['wraith','halo','pink','orange'])assert.ok(max(summary[k].before.rings)>=20,`${k}: the before half shows the failure (${JSON.stringify(summary[k].before.rings)})`);
 // Fixed: crescents gone, fingers gone, glare kept; anything left is a few pixels at the rim (docs: bounded).
 for(const k of ['halo','pink','orange','destroyer'])assert.ok(max(summary[k].after.rings)<=.5,`${k}: no foreign matter shown (${JSON.stringify(summary[k].after.rings)})`);
 assert.ok(max(summary.wraith.after.rings)<=2.5,`Wraith: at most a fingertip in the face's own colour (${JSON.stringify(summary.wraith.after.rings)})`);
 for(const k of ['wraith','orange','halo']){const a=summary[k].after.report;assert.ok(a.register&&off({...a.register,r:a.register.r+.008},summary[k].truth)<=.01,`${k}: re-registered on the true edge (${JSON.stringify(a.register)} vs ${JSON.stringify(summary[k].truth)})`);}
 assert.ok(!summary.wraith.after.report.foreign?.patches.some(p=>p.span>30)&&summary.wraith.after.report.glare>0,'Wraith: the rim glare is kept, the fingers are patches');
 // The safety principle: the pale pink's edge is likely but not sure, so the photo stops short of it.
 assert.ok(summary.pink.after.report.stop>=.8&&summary.pink.after.report.stop<.97&&!summary.pink.after.report.register,`pale pink: the photo stops at ${summary.pink.after.report.stop}, unregistered`);
 // The Destroyer stays fixed, and no longer by luck: the wrong fit is rejected, its fingers are patches.
 assert.ok(!summary.destroyer.after.report.register&&!summary.destroyer.after.report.stop&&summary.destroyer.after.report.foreign.patches.length>=3,'Destroyer: no registration, no stop, finger patches');
 assert.deepEqual(errors,[]);
 console.log('ok - round 2 signatures: Wraith (wrong fit + glare filled), Halo Wraith and pale pink (no plan), orange (unregistered off edge), Destroyer JPEG (wrong fit) all reproduce and are fixed; pale pink stops short');
}finally{await browser.close();server.close();}
