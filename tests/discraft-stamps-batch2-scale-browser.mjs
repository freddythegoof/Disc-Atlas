// Verify each Batch 2 alpha's physical ink span through the unchanged full-disc renderer.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const rows=JSON.parse(fs.readFileSync('docs/assets/discraft-stamp-sweep/batch-2/extraction.json')).filter(e=>e.outcome==='extracted');
assert.equal(rows.length,16);
const assignments=JSON.parse(fs.readFileSync('source-data/stamp-manifest.json'));
const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://local').pathname,file=p==='/'?'web/index.html':'public'+p;if(p.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{}');return;}try{res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.html':'text/html','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--use-angle=d3d11','--enable-gpu']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),results=[],requests=[];page.on('request',r=>requests.push(new URL(r.url()).pathname));
try{
 await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>typeof discs!=='undefined'&&discs.length>0);
 await page.waitForFunction(()=>mapClusters.length>0&&mapArt.state!=='loading');assert.equal(requests.filter(p=>p.startsWith('/stamps/')).length,0,'native atlas requests no stamps');
 for(const row of rows){
  const entry=assignments.find(e=>e.asset===row.asset);await page.evaluate(id=>select(discs.find(d=>d.id===id)),entry.id);
  await page.waitForFunction(asset=>Disc3D.viewer?.debug.stamp.material.map.userData.stampAsset===asset,row.asset);
  const result=await page.evaluate(()=>{const v=Disc3D.viewer,pos=v.debug.stamp.geometry.attributes.position;let radius=0;for(let i=0;i<pos.count;i++)radius=Math.max(radius,Math.hypot(pos.getX(i),pos.getZ(i)));return {fullDiscDiameterCm:v.state.radius*2,textureDiameterCm:radius*2,physicalInkFraction:radius/v.state.radius*v.state.props.stampPlacement.assetInkFraction};});
  assert.ok(Math.abs(result.physicalInkFraction-row.placement.diameterFraction)<2e-6,row.mold+' source fraction not realized');results.push({mold:row.mold,asset:row.asset,target:row.placement.diameterFraction,...result,error:result.physicalInkFraction-row.placement.diameterFraction});
 }
 const baseline=JSON.parse(execFileSync('git',['show','4005a8c:public/data.json'],{maxBuffer:8e6})).discs;
 const current=JSON.parse(fs.readFileSync('public/data.json')).discs;
 const extra=current.filter(d=>(d.brand==='Discraft'&&['Nuke','Archer'].includes(d.name))||(d.brand==='Innova'&&d.name==='Destroyer')).map(d=>d.id);
 const ids=[...assignments.map(e=>e.id),...extra],newIds=rows.map(r=>assignments.find(e=>e.asset===r.asset).id),controlIds=ids.filter(id=>!newIds.includes(id));
 await page.evaluate(({baseline,ids})=>{
  document.querySelector('#detail').hidden=true;window.thumbBefore=new Map(baseline.map(d=>[d.id,d]));window.thumbIds=ids;
  for(const [phase,left,lookup] of [['before',12,id=>thumbBefore.get(id)],['after',720,id=>discs.find(d=>d.id===id)]]){
   const root=document.createElement('div');root.id='native-thumbs-'+phase;Object.assign(root.style,{position:'fixed',top:'20px',left:left+'px',zIndex:9999,width:'660px',height:'740px',background:'#161d24',display:'grid',gridTemplateColumns:'repeat(6,96px)',gridAutoRows:'96px',gap:'12px',padding:'12px'});
   for(const id of ids){const d=lookup(id),host=document.createElement('div');host.dataset.discThumbnail=id;host.dataset.plateColor=discColor(d);Object.assign(host.style,{position:'relative',width:'96px',height:'96px'});root.append(host);}document.body.append(root);
  }
 },{baseline,ids});
 await page.evaluate(async()=>{const {observeThumbnails}=await import('/disc3d/thumbnails.mjs');observeThumbnails(document.querySelector('#native-thumbs-before'),id=>thumbBefore.get(id));observeThumbnails(document.querySelector('#native-thumbs-after'),id=>discs.find(d=>d.id===id));});
 await page.waitForFunction(()=>document.querySelectorAll('#native-thumbs-before .has-3d').length===thumbIds.length&&document.querySelectorAll('#native-thumbs-after .has-3d').length===thumbIds.length);
 await page.waitForFunction(ids=>ids.every(id=>{const a=document.querySelector('#native-thumbs-before [data-disc-thumbnail="'+id+'"] canvas'),b=document.querySelector('#native-thumbs-after [data-disc-thumbnail="'+id+'"] canvas');return a&&b&&a.toDataURL()!==b.toDataURL();}),newIds);
 await page.waitForTimeout(400);
 const thumbs=await page.evaluate(()=>Object.fromEntries(['before','after'].map(phase=>[phase,Object.fromEntries([...document.querySelectorAll('#native-thumbs-'+phase+' [data-disc-thumbnail]')].map(h=>[h.dataset.discThumbnail,h.querySelector('canvas').toDataURL()]))])));
 for(const id of controlIds)assert.equal(thumbs.before[id],thumbs.after[id],id+' native control thumbnail unchanged');
 for(const id of newIds)assert.notEqual(thumbs.before[id],thumbs.after[id],id+' native thumbnail shows assigned stamp');
 await page.screenshot({path:'docs/assets/discraft-stamp-sweep/batch-2/native-thumbnails.png'});
 fs.writeFileSync('docs/assets/discraft-stamp-sweep/batch-2/native-thumbnails.json',JSON.stringify({base:'4005a8c',nativeAtlasStampRequestsBeforeSelecting:0,unchangedControls:controlIds.length,newStampedThumbnails:newIds.length},null,2));
 console.log('PASS: native visible thumbnails: '+newIds.length+' new designs; '+controlIds.length+' unchanged controls');
 fs.writeFileSync('docs/assets/discraft-stamp-sweep/batch-2/placement-verification.json',JSON.stringify(results,null,2));console.log('PASS: all 16 physical ink/full-disc fractions match their own source measurements');
}finally{await browser.close();await new Promise(r=>server.close(r));}
