// Isolated preview only: origin/main renderer bytes are routed in memory.
// Branch renderer files and pilot records remain untouched.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir='docs/assets/discraft-stamp-sweep/batch-1-fraction-audit';
const rows=JSON.parse(fs.readFileSync(dir+'/measurements.json'));
const standard='3abd397caba4591eb97486e967c428277c4018ef',base='ba081fd';
const mainFiles=['disc3d.js','disc3d/stamp.mjs','disc3d/viewer.mjs','disc3d/thumbnails.mjs','bag3d/viewer.mjs','collection3d/stage.mjs'];
const overlay=Object.fromEntries(mainFiles.map(p=>['/'+p,execFileSync('git',['show',standard+':public/'+p],{maxBuffer:8e6})]));
const oldData=execFileSync('git',['show',base+':public/data.json'],{maxBuffer:8e6});
const controls=[{mold:'Buzzz',brand:'Discraft'},{mold:'Zone',brand:'Discraft'},{mold:'Luna',brand:'Discraft'},{mold:'Zone GT (Banger Top)',brand:'Discraft'},{mold:'Destroyer',brand:'Innova'}];
const hash=data=>createHash('sha256').update(typeof data==='string'||Buffer.isBuffer(data)?data:JSON.stringify(data)).digest('hex');
const slug=mold=>rows.find(r=>r.catalogMold===mold)?.slug||mold.toLowerCase().replaceAll(/[^a-z0-9]+/g,'-').replace(/-$/,'');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const p=new URL(req.url,'http://local').pathname;
 if(p.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{}');return;}
 try{const file=p==='/'?'web/index.html':'public'+p;res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--use-angle=d3d11','--enable-gpu']});
const results={},canvases={},pixelDifferences={};
async function measure(p){return p.evaluate(()=>{
 const v=Disc3D.popout,{renderer,scene,camera,stamp}=v.debug;
 const read=()=>{renderer.render(scene,camera);const c=document.createElement('canvas');c.width=renderer.domElement.width;c.height=renderer.domElement.height;c.getContext('2d').drawImage(renderer.domElement,0,0);return c.getContext('2d').getImageData(0,0,c.width,c.height);};
 stamp.visible=true;const inked=read();stamp.visible=false;const bare=read();stamp.visible=true;renderer.render(scene,camera);
 const bounds=pred=>{let l=1e9,t=1e9,r=-1,b=-1;for(let y=0;y<bare.height;y++)for(let x=0;x<bare.width;x++){const i=4*(y*bare.width+x);if(pred(i)){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);}}return [l,t,r+1,b+1];};
 const disc=bounds(i=>bare.data[i+3]>127),ink=bounds(i=>Math.max(...[0,1,2].map(k=>Math.abs(inked.data[i+k]-bare.data[i+k])))>3),extent=b=>Math.max(b[2]-b[0],b[3]-b[1]);
 const pos=stamp.geometry.attributes.position;let radius=0;for(let i=0;i<pos.count;i++)radius=Math.max(radius,Math.hypot(pos.getX(i),pos.getZ(i)));
 return {discBounds:disc,inkBounds:ink,canvasSize:[bare.width,bare.height],renderedFraction:extent(ink)/extent(disc),meshRadiusCm:radius,discRadiusCm:v.state.radius,texture:stamp.material.map.image.toDataURL(),canvas:renderer.domElement.toDataURL(),geometry:[...pos.array]};
});}
try{
 for(const phase of ['before','branch','preview']){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await context.route('**/*',route=>{const p=new URL(route.request().url()).pathname;const body=phase==='before'&&p==='/data.json'?oldData:phase==='preview'?overlay[p]:null;return body?route.fulfill({contentType:p.endsWith('.json')?'application/json':'text/javascript',body}):route.continue();});
  const p=await context.newPage(),errors=[],requests=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>requests.push(new URL(r.url()).pathname));
  await p.goto('http://127.0.0.1:'+server.address().port);await p.waitForFunction(()=>typeof discs!=='undefined'&&discs.length>0);await p.waitForFunction(()=>mapClusters.length>0&&mapArt.state!=='loading');
  assert.equal(requests.filter(p=>p.startsWith('/stamps/')).length,0,'atlas makes no stamp requests');results[phase]={};canvases[phase]={};
  for(const item of [...rows.map(r=>({mold:r.catalogMold,brand:'Discraft',row:r})),...controls]){
   await p.evaluate(({mold,brand})=>select(discs.find(d=>(d.catalogName||d.name)===mold&&d.brand===brand)),item);
   await p.waitForFunction(mold=>Disc3D.viewer?.state.props?.mold===mold,item.mold);
   if(item.row||['Buzzz','Zone','Luna'].includes(item.mold))await p.waitForFunction(()=>!!Disc3D.viewer.debug.stamp.material.map.userData.stampAsset);
   await p.evaluate(()=>{Disc3D.viewer.setView('top',{instant:true});Disc3D.open();});await p.waitForFunction(()=>Disc3D.popout?.state.frames>0);
   if(item.row||['Buzzz','Zone','Luna'].includes(item.mold))await p.waitForFunction(()=>!!Disc3D.popout.debug.stamp.material.map.userData.stampAsset);
   await p.evaluate(()=>{const v=Disc3D.popout;v.setView('top',{instant:true});v.applyPose({...v.getPose(),view:null,zoom:1.6});v.debug.renderNow();});
   await p.waitForTimeout(100);
   const result=await measure(p);canvases[phase][item.mold]=result.canvas;result.textureSHA256=hash(result.texture);result.canvasSHA256=hash(result.canvas);result.geometrySHA256=hash(result.geometry);delete result.texture;delete result.canvas;delete result.geometry;
   results[phase][item.mold]=result;
   if(phase!=='branch')await p.locator('.disc3d-dialog-body').screenshot({path:`${dir}/${phase}-${slug(item.mold)}-viewer.png`});
   if(item.row){
    const physical=item.row.assetInkFraction*result.meshRadiusCm/result.discRadiusCm;
    const expected=phase==='preview'?item.row.diameterFraction:item.row.legacyEffectiveFraction;
    assert.ok(Math.abs(physical-expected)<1e-6,item.mold+' physical fraction');
    if(phase==='preview')assert.ok(Math.abs(result.renderedFraction-expected)<.02,item.mold+' flat Top within two points: '+result.renderedFraction+' vs '+expected);
   }
   await p.evaluate(()=>Disc3D.close());await p.waitForFunction(()=>!Disc3D.popout);
  }
  if(phase!=='branch'){
   await p.evaluate(async()=>{
    document.querySelector('#detail').hidden=true;const host=document.createElement('div');host.id='fraction-proof-bag';Object.assign(host.style,{position:'fixed',inset:'0',zIndex:9999,background:'#161d24'});document.body.append(host);
    const THREE=await import('three');window.auditDraws=new WeakMap();THREE.Scene.prototype.onBeforeRender=function(renderer,scene,camera){auditDraws.set(renderer.domElement,{renderer,scene,camera});};
    const {mountBag}=await import('/bag3d/viewer.mjs');window.auditBag=await mountBag(host,{interaction:'page',view:'page',animated:false,turn:false,quality:'high',toneMapping:'neutral'});
   });
   results[phase].bag={};
   for(const row of rows){
    await p.evaluate(async id=>{const d=discs.find(d=>d.id===id),slots=Array.from({length:24},(_,i)=>({id:'proof'+i,color:discColor(d),mold:d}));auditBag.setBagLayout({main:slots,putter:[],goTo:[]});await auditBag.stageDiscs(['proof0'],{instant:true,desktopSizing:{entries:slots.map(s=>({key:s.id,label:{width:80,height:22}}))}});},row.id);
    await p.waitForTimeout(450);
    const m=await p.evaluate(async()=>{
     const THREE=await import('three'),canvas=document.querySelector('#fraction-proof-bag canvas'),{renderer,scene,camera}=auditDraws.get(canvas);let stamp;scene.traverse(o=>{if(o.isMesh&&o.material?.map?.userData.stampAsset)stamp=o;});if(!stamp)throw Error('Bag stock stamp not loaded');
     const read=()=>{renderer.render(scene,camera);const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;c.getContext('2d').drawImage(canvas,0,0);return c.getContext('2d').getImageData(0,0,c.width,c.height);};
     const withInk=read();stamp.visible=false;const bare=read();stamp.visible=true;renderer.render(scene,camera);let l=1e9,t=1e9,r=-1,b=-1;
     for(let y=0;y<bare.height;y++)for(let x=0;x<bare.width;x++){const i=4*(y*bare.width+x);if(Math.max(...[0,1,2].map(k=>Math.abs(withInk.data[i+k]-bare.data[i+k])))>3){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);}}
     const ink=[l,t,r+1,b+1],body=stamp.parent,pos=body.geometry.attributes.position,point=new THREE.Vector3();l=t=1e9;r=b=-1;body.updateWorldMatrix(true,false);
     for(let i=0;i<pos.count;i++){point.fromBufferAttribute(pos,i).applyMatrix4(body.matrixWorld).project(camera);const x=(point.x+1)*canvas.width/2,y=(1-point.y)*canvas.height/2;l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
     return {inkBounds:ink,discBounds:[l,t,r,b],renderedFraction:Math.max(ink[2]-ink[0],ink[3]-ink[1])/Math.max(r-l,b-t)};
    });
    results[phase].bag[row.catalogMold]=m;
    if(phase==='preview')assert.ok(Math.abs(m.renderedFraction-row.diameterFraction)<.02,row.mold+' bag within two points');
    if(['hades','meteor','drive','force'].includes(row.slug))await p.locator('#fraction-proof-bag').screenshot({path:`${dir}/${phase}-${row.slug}-bag.png`});
   }
   await p.evaluate(()=>{auditBag.dispose();document.querySelector('#fraction-proof-bag').remove();});
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 const pixelPage=await browser.newPage();
 async function compareUnchanged(mold,phase){
  const b=results.before[mold],a=results[phase][mold];
  assert.deepEqual({...b,canvasSHA256:undefined},{...a,canvasSHA256:undefined},mold+' '+phase+' numeric/texture/geometry control unchanged');
  const diff=await pixelPage.evaluate(async urls=>{
   const images=await Promise.all(urls.map(src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;})));
   const pixels=images.map(im=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;c.getContext('2d').drawImage(im,0,0);return c.getContext('2d').getImageData(0,0,c.width,c.height).data;});
   if(pixels[0].length!==pixels[1].length)throw Error('Control canvas size changed');let maxChannelDelta=0,changedPixels=0;
   for(let i=0;i<pixels[0].length;i+=4){let changed=false;for(let j=0;j<4;j++){const d=Math.abs(pixels[0][i+j]-pixels[1][i+j]);maxChannelDelta=Math.max(maxChannelDelta,d);changed ||= d!==0;}if(changed)changedPixels++;}
   return {maxChannelDelta,changedPixels,totalPixels:pixels[0].length/4};
  },[canvases.before[mold],canvases[phase][mold]]);
  pixelDifferences[mold+' '+phase]=diff;
  // Inherited Batch 1 screenshot-readback bound; texture/geometry stay exact.
  assert.ok(diff.maxChannelDelta<=1&&diff.changedPixels/diff.totalPixels<=.0001,mold+' '+phase+' pixels: '+JSON.stringify(diff));
 }
 for(const row of rows){
  const b=results.before[row.catalogMold],a=results.preview[row.catalogMold];
  assert.equal(b.textureSHA256,a.textureSHA256,row.mold+' alpha/ink unchanged');
  await compareUnchanged(row.catalogMold,'branch');
 }
 for(const c of controls){
  await compareUnchanged(c.mold,'branch');
  await compareUnchanged(c.mold,'preview');
 }
 console.log('PASS: all 14 physical/Top/bag fractions; identical textures; unchanged pre-merge renders and five controls; zero atlas stamp requests');
}finally{
 fs.writeFileSync(dir+'/verification.json',JSON.stringify({base,standard,previewOnly:true,pixelDifferences,rendererHashes:Object.fromEntries(Object.entries(overlay).map(([p,b])=>[p,hash(b)])),results},null,2)+'\n');
 await browser.close();await new Promise(r=>server.close(r));
}
