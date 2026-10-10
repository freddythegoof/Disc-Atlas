// Plan 09's 3D disc in the detail panel, in a real browser: three.js loads only once a rated disc is
// shown; the panel's DOM diff keeps the same canvas across re-renders; preset views, flip and the
// hyzer/anhyzer tilt (mirrored by throwing hand) work; unrated discs keep the static illustration.
// Writes review shots: a driver and a putter (rim difference) and the hollow underside.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/disc3d-browser.mjs   (shots: outputs/disc3d/)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');

const dir='outputs/disc3d';
fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"Frontend test: backend excluded"}');return;}
 try{const data=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(data);}
 catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const gpuArgs=process.env.BAG3D_CHROMIUM_ARGS?process.env.BAG3D_CHROMIUM_ARGS.split(' ').filter(Boolean):process.platform==='win32'?['--use-angle=d3d11','--enable-gpu']:['--enable-gpu'];
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:gpuArgs});
const errors=[];
const check=label=>console.log('ok -',label);

async function open(viewport){
 const context=await browser.newContext({viewport,deviceScaleFactor:2});
 const page=await context.newPage();
 const requests=[];
 page.on('request',r=>requests.push(r.url()));
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(m.text());});
 await page.goto(base);
 await page.waitForFunction(()=>typeof filtered!=='undefined'&&filtered.length>0);
 await page.evaluate(()=>document.fonts.ready);
 return {page,requests,context};
}
const byName=(page,name)=>page.evaluate(n=>discs.find(d=>(d.catalogName||d.name)===n&&d.speed!=null)?.id,name);
async function show(page,name){
 const id=await byName(page,name);assert.ok(id,name+' is in the catalog');
 await page.evaluate(id=>select(discs.find(d=>d.id===id)),id);
 await page.waitForFunction(id=>{const s=document.querySelector('#detail .disc3d-stage');return s?.dataset.state==='ready'&&s.dataset.disc===id&&Disc3D.viewer?.state.frames>0;},id);
 await settle(page);
}
// Finish any tween and draw, then wait for the browser to present it.
async function settle(page){
 await page.evaluate(()=>Disc3D.viewer.debug.renderNow());
 await page.waitForTimeout(120);
}
// How much of the canvas the disc covers, read straight after a synchronous draw.
const coverage=page=>page.evaluate(()=>{
 const v=Disc3D.viewer;v.debug.renderNow();
 const src=v.debug.renderer.domElement,c=document.createElement('canvas');c.width=src.width;c.height=src.height;
 const g=c.getContext('2d');g.drawImage(src,0,0);const data=g.getImageData(0,0,c.width,c.height).data;
 let on=0;for(let i=3;i<data.length;i+=4)if(data[i]>40)on++;
 return on/(c.width*c.height);
});
const shot=(page,name,selector='#detail')=>page.locator(selector).screenshot({path:`${dir}/${name}.png`});
const view=async(page,name)=>{await page.locator(`#detail [data-disc3d-view="${name}"]`).click();await page.waitForTimeout(750);await settle(page);};

try{
 // Desktop.
 {
  const {page,requests,context}=await open({width:1440,height:900});
  await page.waitForTimeout(600);
  assert.ok(!requests.some(u=>/three\.module|disc3d\/viewer/.test(u)),'three.js is not loaded with the atlas');
  check('three.js and the viewer stay unloaded until a disc is shown');

  await show(page,'Destroyer');
  assert.ok(requests.some(u=>/three\.module/.test(u))&&requests.some(u=>/disc3d\/viewer\.mjs/.test(u)));
  check('selecting a rated disc lazy-loads three.js and the viewer');
  const frame=await coverage(page);
  assert.ok(frame>.08&&frame<.9,`the whole disc is in frame at the default camera (covers ${(frame*100).toFixed(0)}%)`);
  // Project every vertex of the mesh (not its box: a box's corners sit outside a round disc).
  const bounds=await page.evaluate(()=>{
   const {camera,body}=Disc3D.viewer.debug,pos=body.geometry.attributes.position,v=new camera.position.constructor();
   body.updateMatrixWorld(true);let minX=9,maxX=-9,minY=9,maxY=-9;
   for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(body.matrixWorld).project(camera);minX=Math.min(minX,v.x);maxX=Math.max(maxX,v.x);minY=Math.min(minY,v.y);maxY=Math.max(maxY,v.y);}
   return {minX,maxX,minY,maxY};
  });
  assert.ok(bounds.minX>-1&&bounds.maxX<1&&bounds.minY>-1&&bounds.maxY<1,'default camera frames the whole disc: '+JSON.stringify(bounds));
  check(`default 3/4 camera frames the whole disc (${(frame*100).toFixed(0)}% of the canvas)`);
  const tris=await page.evaluate(()=>Disc3D.viewer.debug.renderer.info.render.triangles);
  assert.ok(tris<20000,'modest poly count: '+tris);
  check(`one disc, ${tris} triangles per frame`);
  await shot(page,'driver-destroyer-34');

  // The panel re-renders through its DOM diff (Compare toggles it): the canvas must survive.
  const canvasBefore=await page.evaluateHandle(()=>document.querySelector('#detail canvas'));
  await page.locator('#compare').click();await page.waitForTimeout(100);
  assert.ok(await page.evaluate(c=>c.isConnected&&document.querySelector('#detail canvas')===c,canvasBefore));
  await page.locator('#compare').click();
  check('the canvas survives a detail re-render');

  await view(page,'profile');
  assert.equal(await page.locator('#detail [data-disc3d-view="profile"]').getAttribute('aria-pressed'),'true');
  await shot(page,'driver-destroyer-profile');
  await view(page,'bottom');
  const under=await page.evaluate(()=>Disc3D.viewer.debug.camera.position.y);
  assert.ok(under<0,'bottom view looks up from below');
  await shot(page,'driver-destroyer-bottom');
  check('profile and bottom presets move the camera');
  await view(page,'top');
  assert.ok(await page.evaluate(()=>{const p=Disc3D.viewer.debug.camera.position;return p.y>0&&Math.hypot(p.x,p.z)<.01;}));
  check('top preset looks straight down');

  // Flip turns the disc over; the bottom of a flipped disc faces the top camera.
  await page.locator('#detail [data-disc3d-flip]').click();await page.waitForTimeout(800);await settle(page);
  assert.ok(await page.evaluate(()=>Math.abs(Disc3D.viewer.debug.flipGroup.rotation.x-Math.PI)<1e-6));
  assert.equal(await page.locator('#detail [data-disc3d-flip]').getAttribute('aria-pressed'),'true');
  await shot(page,'driver-destroyer-flipped-top');
  await page.locator('#detail [data-disc3d-flip]').click();await page.waitForTimeout(800);
  check('flip turns the disc over and back');

  // Tilt: hyzer drops the fade side, so RHBH (fade left) and RHFH (fade right) mirror each other.
  await view(page,'angle');
  await page.locator('#detail [data-disc3d-tilt]').fill('30');
  const rhbh=await page.evaluate(()=>Disc3D.viewer.debug.tiltGroup.rotation.z);
  assert.equal(await page.locator('#detail [data-disc3d-tilt-value]').textContent(),'30° hyzer');
  assert.ok(rhbh>0,'RHBH hyzer drops the left edge');
  await settle(page);await shot(page,'driver-destroyer-hyzer-rhbh');
  await page.selectOption('#hand','RHFH');
  const rhfh=await page.evaluate(()=>Disc3D.viewer.debug.tiltGroup.rotation.z);
  assert.ok(Math.abs(rhfh+rhbh)<1e-9,'RHFH hyzer drops the right edge');
  await page.locator('#detail [data-disc3d-tilt]').fill('-20');
  assert.equal(await page.locator('#detail [data-disc3d-tilt-value]').textContent(),'20° anhyzer');
  await page.selectOption('#hand','RHBH');await page.locator('#detail [data-disc3d-tilt]').fill('0');
  check('hyzer/anhyzer tilt follows the throwing hand');

  // Keyboard: arrows turn, + zooms.
  await page.locator('#detail canvas').focus();
  const before=await page.evaluate(()=>Disc3D.viewer.debug.camera.position.toArray());
  await page.keyboard.press('ArrowRight');await page.keyboard.press('+');
  const after=await page.evaluate(()=>Disc3D.viewer.debug.camera.position.toArray());
  assert.ok(Math.hypot(...after)<Math.hypot(...before)-.5&&Math.abs(after[0]-before[0])>.5);
  check('arrow keys turn and + zooms');

  // Drag turns the disc; the wheel zooms.
  const box=await page.locator('#detail canvas').boundingBox();
  const p0=await page.evaluate(()=>Disc3D.viewer.debug.camera.position.toArray());
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.mouse.move(box.x+box.width/2+80,box.y+box.height/2+30,{steps:6});await page.mouse.up();
  await page.waitForTimeout(400);
  const p1=await page.evaluate(()=>Disc3D.viewer.debug.camera.position.toArray());
  assert.ok(Math.hypot(p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2])>1,'drag orbits the camera');
  assert.equal(await page.locator('#detail [data-disc3d-view][aria-pressed=true]').count(),0,'a drag leaves the presets');
  const d0=await page.evaluate(()=>Disc3D.viewer.debug.camera.position.length());
  await page.mouse.wheel(0,-400);await page.waitForTimeout(500);
  const d1=await page.evaluate(()=>Disc3D.viewer.debug.camera.position.length());
  assert.ok(d1<d0,'wheel zooms in');
  check('drag turns and the wheel zooms');

  // Putter: same canvas, new geometry, back to the 3/4 view.
  await show(page,'Aviar');
  assert.equal(await page.locator('#detail [data-disc3d-view="angle"]').getAttribute('aria-pressed'),'true');
  await shot(page,'putter-aviar-34');
  await view(page,'profile');await shot(page,'putter-aviar-profile');
  await view(page,'bottom');await shot(page,'putter-aviar-bottom');
  check('a putter replaces the driver in the same viewer');

  // Rim close-ups for the review, the same two cameras for each disc: side-on at the nose, where the
  // silhouette is the cross-section, and from just below, looking into the cavity past the rim.
  for(const name of ['Destroyer','Aviar']){
   await show(page,name);
   for(const [label,cam] of [['side',[-8.4,0,15]],['under',[-6.8,-3.6,14]]]){
    await page.evaluate(cam=>{const {camera,controls}=Disc3D.viewer.debug;controls.enabled=false;controls.target.set(-8.4,0,0);camera.position.set(...cam);camera.lookAt(controls.target);},cam);
    await page.evaluate(()=>Disc3D.viewer.debug.renderer.render(Disc3D.viewer.debug.scene,Disc3D.viewer.debug.camera));
    await page.waitForTimeout(120);await shot(page,`rim-${label}-${name.toLowerCase()}`,'#detail .disc3d-viewport');
   }
   await page.evaluate(()=>{const {controls}=Disc3D.viewer.debug;controls.target.set(0,0,0);controls.enabled=true;});
  }
  check('rim close-ups written');

  // An unrated disc keeps the static illustration and no canvas.
  await page.evaluate(()=>select(discs.find(d=>d.speed==null)));
  await page.waitForTimeout(150);
  assert.equal(await page.locator('#detail canvas').count(),0);
  assert.equal(await page.locator('#detail .disc-photo .detail-art').count(),1);
  await shot(page,'unrated-fallback');
  // And the next rated disc gets the viewer back.
  await show(page,'Firebird');
  assert.equal(await page.locator('#detail canvas').count(),1);
  await shot(page,'driver-firebird-34');
  check('discs without model data fall back to the illustration');
  await context.close();
 }
 // Phone: the bottom sheet.
 {
  const {page,context}=await open({width:390,height:844});
  await show(page,'Destroyer');
  const frame=await coverage(page);
  assert.ok(frame>.06,'disc is drawn on the phone');
  const toolbar=await page.locator('#detail .disc3d-toolbar').boundingBox(),panel=await page.locator('#detail').boundingBox();
  assert.ok(toolbar.x>=panel.x&&toolbar.x+toolbar.width<=panel.x+panel.width+.5,'toolbar fits the sheet');
  await page.screenshot({path:`${dir}/phone-destroyer.png`});
  check('phone bottom sheet draws the disc and fits its controls');
  await context.close();
 }
 const real=errors.filter(e=>!/Frontend test: backend excluded|status of 503|Failed to load resource/.test(e));
 assert.deepEqual(real,[],'no page errors');
 check('no page errors');
}finally{
 await browser.close();server.close();
}
