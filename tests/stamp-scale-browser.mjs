// Pixel measurement on the production viewer, plus production bag-float evidence.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const dir='docs/assets/stamp-scale-fix', measurements=JSON.parse(fs.readFileSync(dir+'/measurements.json'));
const base='d4a49442c0912c06a1831343a7267a416c339198';
const files=['disc3d.js','disc3d/stamp.mjs','disc3d/viewer.mjs','disc3d/thumbnails.mjs','bag3d/viewer.mjs','collection3d/stage.mjs','data.json'];
const baseline=Object.fromEntries(files.map(p=>['/'+p,execFileSync('git',['show',base+':public/'+p],{maxBuffer:8e6})]));
const server=http.createServer((req,res)=>{
 const p=new URL(req.url,'http://local').pathname;
 const file=p==='/'?'web/index.html':p==='/stamps/discraft/hades.png'?dir+'/hades-asset.png':'public'+p;
 if(p.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{}');return;}
 try{res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.html':'text/html','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--use-angle=d3d11','--enable-gpu']});
async function measureViewer(p,which){return p.evaluate(which=>{
    const v=Disc3D[which],{renderer,scene,camera,stamp}=v.debug;
    const read=()=>{renderer.render(scene,camera);const c=document.createElement('canvas');c.width=renderer.domElement.width;c.height=renderer.domElement.height;const g=c.getContext('2d');g.drawImage(renderer.domElement,0,0);return g.getImageData(0,0,c.width,c.height);};
    stamp.visible=true;const withInk=read();stamp.visible=false;const bare=read();stamp.visible=true;renderer.render(scene,camera);
    const bounds=predicate=>{let l=1e9,t=1e9,r=-1,b=-1;for(let y=0;y<bare.height;y++)for(let x=0;x<bare.width;x++){const i=4*(y*bare.width+x);if(predicate(i)){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);}}return [l,t,r+1,b+1];};
    const disc=bounds(i=>bare.data[i+3]>127);
    const ink=bounds(i=>Math.max(...[0,1,2].map(k=>Math.abs(withInk.data[i+k]-bare.data[i+k])))>3);
    const extent=b=>Math.max(b[2]-b[0],b[3]-b[1]);
    const pos=stamp.geometry.attributes.position;let radius=0;for(let i=0;i<pos.count;i++)radius=Math.max(radius,Math.hypot(pos.getX(i),pos.getZ(i)));
    return {discBounds:disc,inkBounds:ink,discDiameterPx:extent(disc),stampDiameterPx:extent(ink),renderedFraction:extent(ink)/extent(disc),meshRadiusCm:radius,discRadiusCm:v.state.radius,texture:stamp.material.map.image.toDataURL()};
   },which);}
const results={},diagnose=process.argv.includes('--diagnose');
try{
 for(const phase of diagnose?['before']:['before','after']){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  if(phase==='before')await context.route('**/*',route=>{const body=baseline[new URL(route.request().url()).pathname];return body?route.fulfill({contentType:'text/javascript',body}):route.continue();});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:'+server.address().port);await p.waitForFunction(()=>typeof discs!=='undefined'&&discs.length>0);
  results[phase]={};
  for(const row of measurements){
   const mold=row.mold==='buzzz'?'Buzzz':row.mold[0].toUpperCase()+row.mold.slice(1);
   await p.evaluate(({mold,row})=>{
    const d=discs.find(d=>d.name===mold&&d.brand==='Discraft');
    if(mold==='Hades'){d.stampAsset='stamps/discraft/hades.png';d.stampPlacement={diameterFraction:row.diameterFraction,assetInkFraction:row.assetInkFraction};}
    select(d);
   },{mold,row});
   await p.waitForFunction(mold=>Disc3D.viewer?.state.props?.mold===mold,mold);
   await p.waitForFunction(()=>!!Disc3D.viewer.debug.stamp.material.map.userData.stampAsset);
   await p.evaluate(()=>{Disc3D.viewer.setView('top',{instant:true});Disc3D.viewer.debug.renderNow();});
   const defaultDetail=await measureViewer(p,'viewer');delete defaultDetail.texture;
   await p.evaluate(()=>Disc3D.open());await p.waitForFunction(()=>Disc3D.popout?.state.frames>0);
   await p.waitForFunction(()=>!!Disc3D.popout.debug.stamp.material.map.userData.stampAsset);
   await p.evaluate(()=>{Disc3D.popout.setView('top',{instant:true});const v=Disc3D.popout;v.applyPose({...v.getPose(),view:null,zoom:1.6});v.debug.renderNow();});
   await p.waitForTimeout(100);
   await p.locator('.disc3d-dialog-body').screenshot({path:`${dir}/${phase}-${row.mold}-viewer.png`});
   results[phase][row.mold]=await measureViewer(p,"popout");
   results[phase][row.mold].defaultDetail=defaultDetail;
   results[phase][row.mold].storagePhysicalFraction=await p.evaluate(async ({mold,row})=>{
    const {discModel,disposeObject}=await import('/collection3d/stage.mjs'),d=discs.find(d=>d.name===mold&&d.brand==='Discraft'),group=discModel(d,{color:discColor(d)});
    const ink=group.children.find(c=>c.material?.map?.userData.stampAsset),pos=ink.geometry.attributes.position;let radius=0;
    for(let i=0;i<pos.count;i++)radius=Math.max(radius,Math.hypot(pos.getX(i),pos.getZ(i)));
    const fraction=row.assetInkFraction*radius*100/(Number(d.specs.Diameter)/2);disposeObject(group);return fraction;
   },{mold,row});
   console.log(phase,row.mold,JSON.stringify({...results[phase][row.mold],texture:undefined}));
   await p.evaluate(()=>Disc3D.close());await p.waitForFunction(()=>!Disc3D.popout);
  }
  // Generated names and failed-load fallback must remain exactly the baseline size and texture.
  for(const asset of [null,'stamps/discraft/missing-scale-proof.png']){
   const control=await p.evaluate(async asset=>{const v=Disc3D.viewer;v.update({...v.state.props,mold:'Fallback',stampAsset:asset,stampPlacement:{diameterFraction:.8,assetInkFraction:.95}});await new Promise(r=>setTimeout(r,150));v.debug.renderNow();return {geometry:[...v.debug.stamp.geometry.attributes.position.array],texture:v.debug.stamp.material.map.image.toDataURL()};},asset);
   results[phase][asset?'failedFallback':'generatedFallback']=control;
  }
  await p.evaluate(async()=>{
   document.querySelector('#detail').hidden=true;
   const host=document.createElement('div');host.id='stamp-scale-bag';Object.assign(host.style,{position:'fixed',inset:'0',zIndex:9999,background:'#161d24'});document.body.append(host);
   const THREE=await import('three');window.scaleDraws=new WeakMap();THREE.Scene.prototype.onBeforeRender=function(renderer,scene,camera){scaleDraws.set(renderer.domElement,{renderer,scene,camera});};
   const {mountBag}=await import('/bag3d/viewer.mjs');window.proofBag=await mountBag(host,{interaction:'page',view:'page',animated:false,turn:false,quality:'high',toneMapping:'neutral'});
  });
  for(const row of measurements.filter(r=>r.mold!=='hades')){
   await p.evaluate(async mold=>{const d=discs.find(d=>d.name.toLowerCase()===mold&&d.brand==='Discraft'),slots=Array.from({length:24},(_,i)=>({id:'proof'+i,color:discColor(d),mold:d}));proofBag.setBagLayout({main:slots,putter:[],goTo:[]});await proofBag.stageDiscs(['proof0'],{instant:true,desktopSizing:{entries:slots.map(s=>({key:s.id,label:{width:80,height:22}}))}});},row.mold);
   await p.waitForTimeout(450);
   const bagMeasure=await p.evaluate(async()=>{
    const THREE=await import('three'),canvas=document.querySelector('#stamp-scale-bag canvas'),{renderer,scene,camera}=scaleDraws.get(canvas);
    let stamp;scene.traverse(o=>{if(o.isMesh&&o.material?.map?.userData.stampAsset)stamp=o;});
    const read=()=>{renderer.render(scene,camera);const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;const g=c.getContext('2d');g.drawImage(canvas,0,0);return g.getImageData(0,0,c.width,c.height);};
    const withInk=read();stamp.visible=false;const bare=read();stamp.visible=true;renderer.render(scene,camera);
    let l=1e9,t=1e9,r=-1,b=-1;for(let y=0;y<bare.height;y++)for(let x=0;x<bare.width;x++){const i=4*(y*bare.width+x);if(Math.max(...[0,1,2].map(k=>Math.abs(withInk.data[i+k]-bare.data[i+k])))>3){l=Math.min(l,x);t=Math.min(t,y);r=Math.max(r,x);b=Math.max(b,y);}}
    const ink=[l,t,r+1,b+1],body=stamp.parent,pos=body.geometry.attributes.position,point=new THREE.Vector3();l=t=1e9;r=b=-1;body.updateWorldMatrix(true,false);
    for(let i=0;i<pos.count;i++){point.fromBufferAttribute(pos,i).applyMatrix4(body.matrixWorld).project(camera);const x=(point.x+1)*canvas.width/2,y=(1-point.y)*canvas.height/2;l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
    const disc=[l,t,r,b],diameter=Math.max(r-l,b-t);return {inkBounds:ink,discBounds:disc,renderedFraction:Math.max(ink[2]-ink[0],ink[3]-ink[1])/diameter};
   });results[phase][row.mold].bag=bagMeasure;console.log(phase,row.mold,'bag',bagMeasure.renderedFraction);
   await p.locator('#stamp-scale-bag').screenshot({path:`${dir}/${phase}-${row.mold}-bag.png`});
   assert.ok(await p.evaluate(()=>proofBag.getBagLayoutState().find(r=>r.key==='proof0').shown>300));
  }
  await p.evaluate(()=>proofBag.dispose());assert.deepEqual(errors,[]);await context.close();
 }
 if(!diagnose){
  for(const row of measurements){
   const result=results.after[row.mold];
   assert.equal(results.before[row.mold].texture,result.texture,row.mold+' official alpha and ink unchanged');
   assert.ok(Math.abs(row.assetInkFraction*result.meshRadiusCm/result.discRadiusCm-row.diameterFraction)<1e-6,row.mold+' physical full-disc fraction');
   assert.ok(Math.abs(result.storagePhysicalFraction-row.diameterFraction)<1e-6,row.mold+' storage full-disc fraction');
  }
  for(const row of measurements)assert.ok(Math.abs(results.after[row.mold].renderedFraction-row.diameterFraction)<.02,`${row.mold} source ${row.diameterFraction} vs render ${results.after[row.mold].renderedFraction}`);
  for(const row of measurements.filter(r=>r.mold!=='hades'))assert.ok(Math.abs(results.after[row.mold].bag.renderedFraction-row.diameterFraction)<.02,`${row.mold} bag source fraction`);
  for(const key of ['generatedFallback','failedFallback'])assert.deepEqual(results.before[key],results.after[key],key+' unchanged');
 }
}finally{
 for(const phase of Object.values(results)){
  for(const row of measurements)if(phase[row.mold])delete phase[row.mold].texture;
  for(const key of ['generatedFallback','failedFallback'])if(phase[key])phase[key]=Object.fromEntries(Object.entries(phase[key]).map(([k,v])=>[k+'SHA256',createHash('sha256').update(JSON.stringify(v)).digest('hex')]));
 }
 fs.writeFileSync(dir+(diagnose?'/diagnosis.json':'/verification.json'),JSON.stringify({base,results},null,2));
 await browser.close();await new Promise(r=>server.close(r));
}
