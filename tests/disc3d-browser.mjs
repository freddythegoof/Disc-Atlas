// Plan 09's 3D disc in the detail panel, in a real browser: three.js loads only once a rated disc is
// shown; the panel's DOM diff keeps the same canvas across re-renders; preset views, flip and the
// hyzer/anhyzer tilt (mirrored by throwing hand) work; unrated discs keep the static illustration.
// Writes review shots: a driver and a putter (rim difference) and the hollow underside. Phase 2: each mold
// is shaped and scaled from its PDGA dimensions (Destroyer vs Buzzz vs Aviar side by side, ten random
// molds), a record without them falls back to the generic shape, and the phone draws no slower.
// Prompt 4: the Clay toggle swaps to clay materials on a dark ground and back exactly, keeps the overmold split
// in two clay tones, survives a change of disc, and shows a cross-section drawn from the geometry's own profile
// points with the panel's PDGA numbers.
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
// Clay: which materials the mesh wears, the plastic materials underneath, the stamp, ground and cross-section.
const clayState=page=>page.evaluate(()=>{
 const v=Disc3D.viewer,{body,stamp,bodyMaterial,rimMaterial,clayMaterial,clayRimMaterial,profileFigure}=v.debug;
 const name=m=>m===clayMaterial?'clay':m===clayRimMaterial?'clayRim':m===bodyMaterial?'body':m===rimMaterial?'rim':'?';
 const snap=m=>({uuid:m.uuid,type:m.type,color:'#'+m.color.getHexString(),roughness:m.roughness,clearcoat:m.clearcoat,clearcoatRoughness:m.clearcoatRoughness});
 const vp=v.element.querySelector('.disc3d-viewport'),fig=profileFigure.getBoundingClientRect(),canvas=vp.getBoundingClientRect();
 return {clay:v.state.clay,host:Disc3D.clay,pressed:v.element.querySelector('[data-disc3d-clay]').getAttribute('aria-pressed'),
  mats:[].concat(body.material).map(name),plastic:{body:snap(bodyMaterial),rim:snap(rimMaterial)},
  tones:['#'+clayMaterial.color.getHexString(),'#'+clayRimMaterial.color.getHexString()],stamp:stamp.visible,
  ground:getComputedStyle(vp).backgroundImage,profileHidden:profileFigure.hidden,figure:{top:fig.top,bottom:fig.bottom,height:fig.height,left:fig.left,right:fig.right},
  canvas:{top:canvas.top,bottom:canvas.bottom},label:v.debug.renderer.domElement.getAttribute('aria-label')};
});
// The cross-section's outline against the live geometry: LatheGeometry's first ring (angle 0) lies in the z-y
// plane with z the radius, so its first n vertices are the profile points the lathe was given.
const profileVsGeometry=page=>page.evaluate(()=>{
 const v=Disc3D.viewer,pos=v.debug.body.geometry.attributes.position,svg=v.debug.profileFigure.querySelector('svg'),n=v.state.profile.points.length;
 const s=+svg.dataset.scale,cx=+svg.dataset.cx,base=+svg.dataset.base,bottom=+svg.dataset.bottom;
 const d=svg.querySelector('.disc3d-profile-outline').getAttribute('d').replace(/Z$/,'').slice(1).split('L').map(p=>p.split(' ').map(Number));
 let worst=0,mirror=0;
 for(let i=0;i<n;i++){const z=pos.getZ(i),y=pos.getY(i),[px,py]=d[i],[lx,ly]=d[d.length-1-i];
  worst=Math.max(worst,Math.abs(pos.getX(i)),Math.abs((px-cx)/s-z),Math.abs((base-py)/s+bottom-y));mirror=Math.max(mirror,Math.abs((cx-lx)/s-z),Math.abs(ly-py));}
 const texts=[...svg.querySelectorAll('text')].map(t=>t.textContent);
 const panel=Object.fromEntries([...document.querySelectorAll('#detail > details.specs > div')].map(r=>[r.querySelector('span').textContent,r.querySelector('b').textContent]));
 return {n,drawn:d.length,worst,mirror,texts,panel,caption:v.debug.profileFigure.querySelector('figcaption').textContent,rims:svg.querySelectorAll('.disc3d-profile-rim').length};
});
// The colour at the middle of the canvas (the top of the disc in the 3/4 view), straight after a draw.
const centrePixel=page=>page.evaluate(()=>{const v=Disc3D.viewer;v.debug.renderNow();const gl=v.debug.renderer.getContext(),px=new Uint8Array(4);
 gl.readPixels(Math.round(gl.drawingBufferWidth/2),Math.round(gl.drawingBufferHeight*.52),1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);return [...px];});

try{
 // Desktop.
 {
  const {page,requests,context}=await open({width:1440,height:900});
  await page.waitForTimeout(600);
  // Since Plan 16 the atlas draws its own discs with three.js (disc3d/atlas-art.mjs), so three.js loads with
  // it; the viewer, its controls and its panel still wait until a disc is shown.
  assert.ok(!requests.some(u=>/disc3d\/viewer|OrbitControls/.test(u)),'the viewer is not loaded with the atlas');
  check('the viewer stays unloaded until a disc is shown');

  await show(page,'Destroyer');
  assert.ok(requests.some(u=>/three\.module/.test(u))&&requests.some(u=>/disc3d\/viewer\.mjs/.test(u)));
  check('selecting a rated disc lazy-loads three.js and the viewer');
  for(const width of [1440,1100,800]){
   await page.setViewportSize({width,height:900});await page.waitForTimeout(150);
   const clipped=await page.evaluate(()=>[...document.querySelectorAll('#detail .disc3d-toolbar button')].filter(b=>b.scrollWidth>b.clientWidth+1).map(b=>`${b.textContent} ${b.clientWidth}/${b.scrollWidth}`));
   assert.deepEqual(clipped,[],`at ${width} px no toolbar label clips beside Clay`);
  }
  await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(150);
  check('the toolbar fits Clay without clipping a preset at 1440, 1100 and 800 px');
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
  for(const name of ['Destroyer','Buzzz','Aviar']){
   await show(page,name);
   for(const [label,cam] of [['side',[-8.4,0,15]],['under',[-6.8,-3.6,14]]]){
    await page.evaluate(cam=>{const {camera,controls}=Disc3D.viewer.debug;controls.enabled=false;controls.target.set(-8.4,0,0);camera.position.set(...cam);camera.lookAt(controls.target);},cam);
    await page.evaluate(()=>Disc3D.viewer.debug.renderer.render(Disc3D.viewer.debug.scene,Disc3D.viewer.debug.camera));
    await page.waitForTimeout(120);await shot(page,`rim-${label}-${name.toLowerCase()}`,'#detail .disc3d-viewport');
   }
   await page.evaluate(()=>{const {controls}=Disc3D.viewer.debug;controls.target.set(0,0,0);controls.enabled=true;});
  }
  check('rim close-ups written');

  // Phase 2: Destroyer, Buzzz and Aviar from their PDGA dimensions, at true scale. In the profile view
  // (same fixed camera for all three) the projected width follows the measured diameter.
  const molds=[];
  for(const name of ['Destroyer','Buzzz','Aviar']){
   await show(page,name);
   const info=await page.evaluate(()=>{
    const v=Disc3D.viewer,d=discs.find(x=>x.id===document.querySelector('#detail .disc3d-stage').dataset.disc);
    return {source:v.state.source,specs:d.specs,caption:document.querySelector('#detail [data-disc3d] .illustration-caption').textContent,
     label:v.debug.renderer.domElement.getAttribute('aria-label')};
   });
   assert.equal(info.source,'pdga',name+' is shaped from its PDGA dimensions');
   assert.match(info.caption,/PDGA dimensions, to scale/);assert.match(info.label,/PDGA dimensions/);
   await shot(page,`mold-${name.toLowerCase()}-34`,'#detail .disc3d-viewport');
   await view(page,'profile');
   const width=await page.evaluate(()=>{
    const {camera,body}=Disc3D.viewer.debug,pos=body.geometry.attributes.position,v=new camera.position.constructor();
    body.updateMatrixWorld(true);let lo=9,hi=-9;
    for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(body.matrixWorld).project(camera);lo=Math.min(lo,v.x);hi=Math.max(hi,v.x);}
    return hi-lo;
   });
   await shot(page,`mold-${name.toLowerCase()}-profile`,'#detail .disc3d-viewport');
   molds.push({name,width,specs:info.specs});
  }
  const [mDestroyer,mBuzzz,mAviar]=molds;
  for(const m of [mBuzzz,mAviar]){
   const want=Number(m.specs.Diameter)/Number(mDestroyer.specs.Diameter),got=m.width/mDestroyer.width;
   assert.ok(Math.abs(got-want)<.01,`${m.name} draws ${got.toFixed(3)}x the Destroyer's width; PDGA says ${want.toFixed(3)}x`);
  }
  check(`molds draw at true scale (Buzzz ${(mBuzzz.width/mDestroyer.width).toFixed(3)}x, Aviar ${(mAviar.width/mDestroyer.width).toFixed(3)}x the Destroyer)`);

  // Ten random rated molds: each mesh is as wide as its PDGA diameter and as tall as its height (to the
  // 0.1 cm rounding), every vertex finite.
  const picks=await page.evaluate(()=>{let seed=91009;const rand=()=>(seed=(seed*1664525+1013904223)>>>0)/2**32;
   const pool=discs.filter(d=>d.speed!=null&&d.turn!=null&&d.fade!=null),out=new Set();while(out.size<10)out.add(pool[Math.floor(rand()*pool.length)].id);return [...out];});
  const sampled=[];
  for(const id of picks){
   await page.evaluate(id=>select(discs.find(d=>d.id===id)),id);
   await page.waitForFunction(id=>{const s=document.querySelector('#detail .disc3d-stage');return s?.dataset.state==='ready'&&s.dataset.disc===id;},id);
   const g=await page.evaluate(()=>{
    const {body}=Disc3D.viewer.debug,pos=body.geometry.attributes.position,d=discs.find(x=>x.id===document.querySelector('#detail .disc3d-stage').dataset.disc);
    let finite=true,maxR=0,minY=1e9,maxY=-1e9;
    for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);if(![x,y,z].every(Number.isFinite))finite=false;maxR=Math.max(maxR,Math.hypot(x,z));minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
    return {name:d.catalogName||d.name,speed:d.speed,specs:d.specs,source:Disc3D.viewer.state.source,finite,diameter:maxR*2,height:maxY-minY};
   });
   assert.equal(g.source,'pdga',g.name);assert.ok(g.finite,g.name+' has finite vertices');
   assert.ok(Math.abs(g.diameter-Number(g.specs.Diameter))<.01,`${g.name}: ${g.diameter.toFixed(3)} cm across vs ${g.specs.Diameter}`);
   assert.ok(Math.abs(g.height-Number(g.specs.Height))<=.121,`${g.name}: ${g.height.toFixed(3)} cm tall vs ${g.specs.Height}`);
   await settle(page);await shot(page,`random-${sampled.length+1}`,'#detail .disc3d-viewport');
   sampled.push(g);
  }
  check('ten random molds draw at their PDGA diameter and height: '+sampled.map(g=>g.name).join(', '));

  // Boards for the review: the three molds side by side (3/4, profile, rim cross-section), and the ten.
  {
   const img=f=>'data:image/png;base64,'+fs.readFileSync(`${dir}/${f}.png`).toString('base64');
   const css='<style>body{margin:0;padding:24px;font:15px system-ui;background:#fff;color:#1d232b}main{display:grid;gap:20px}h2{margin:0 0 4px;font-size:20px}p{margin:0 0 10px;color:#5b6470}img{width:100%;display:block;border:1px solid #e3e7ec;border-radius:8px;margin-bottom:10px}</style>';
   const dims=s=>`${s.Diameter} cm across · ${s.Height} tall · rim ${s['Rim width']} wide, ${s['Rim depth']} deep`;
   const board=await context.newPage();
   await board.setViewportSize({width:1500,height:900});
   await board.setContent(css+`<main style="grid-template-columns:repeat(3,1fr)">${molds.map(m=>{const n=m.name.toLowerCase();
    return `<section><h2>${m.name}</h2><p>PDGA: ${dims(m.specs)}</p><img src="${img('mold-'+n+'-34')}"><img src="${img('mold-'+n+'-profile')}"><img src="${img('rim-side-'+n)}"></section>`;}).join('')}</main>`);
   await board.screenshot({path:`${dir}/molds-side-by-side.png`,fullPage:true});
   await board.setContent(css+`<main style="grid-template-columns:repeat(5,1fr)">${sampled.map((g,i)=>`<section><h2>${g.name}</h2><p>speed ${g.speed} · ${dims(g.specs)}</p><img src="${img('random-'+(i+1))}"></section>`).join('')}</main>`);
   await board.screenshot({path:`${dir}/molds-random-ten.png`,fullPage:true});
   await board.close();
  }
  check('review boards written');

  // Plan 12: overmold discs draw the rim and the flight plate in two materials, split at the measured rim
  // width. Detection is per disc: Axiom's Envy, MVP's Volt and Innova's Atlas are overmolds; Streamline's
  // Drift (same family) and Innova's Destroyer are one material, as before.
  const material=page=>page.evaluate(()=>{
   const v=Disc3D.viewer,{body,camera,renderer}=v.debug,g=body.geometry,pos=g.attributes.position,idx=g.index.array;
   const d=discs.find(x=>x.id===document.querySelector('#detail .disc3d-stage').dataset.disc);
   const mats=[].concat(body.material);
   // Radii of the vertices each group draws, overall and on the top surface (normals facing up).
   const nrm=g.attributes.normal;
   const groups=g.groups.map(gr=>{let lo=1e9,hi=-1e9,topLo=1e9,topHi=-1e9;for(let i=gr.start;i<gr.start+gr.count;i++){const k=idx[i],r=Math.hypot(pos.getX(k),pos.getZ(k));lo=Math.min(lo,r);hi=Math.max(hi,r);if(nrm.getY(k)>.5){topLo=Math.min(topLo,r);topHi=Math.max(topHi,r);}}return {material:gr.materialIndex,lo,hi,topLo,topHi};});
   // Top view: the colour drawn halfway across the rim and halfway between the stamp and the seam.
   v.setView('top',{instant:true});v.debug.renderNow();
   const sample=r=>{const p=new camera.position.constructor(r,0,0);body.updateMatrixWorld(true);p.y=g.boundingBox.max.y;p.applyMatrix4(body.matrixWorld).project(camera);
    const gl=renderer.getContext(),x=Math.round((p.x+1)/2*gl.drawingBufferWidth),y=Math.round((p.y+1)/2*gl.drawingBufferHeight),px=new Uint8Array(4);gl.readPixels(x,y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);return [...px];};
   const R=Number(d.specs.Diameter)/2,w=Number(d.specs['Rim width']),stampR=Math.min(R*.6,6.2);
   const pixels=v.state.overmold?{rim:sample(R-w/2),plate:sample((R-w+stampR)/2+.3)}:null;
   v.setView('angle',{instant:true});v.debug.renderNow();
   return {name:d.catalogName||d.name,manufacturer:d.manufacturer,R,w,overmold:v.state.overmold,colors:v.state.colors,seam:v.state.seamRadius,
    materials:mats.length,distinct:new Set(mats.map(m=>m.uuid)).size,colorHex:mats.map(m=>'#'+m.color.getHexString()),groups,pixels};
  });
  const overmolds=[];
  for(const [name,maker] of [['Envy','Axiom Discs'],['Volt','MVP Disc Sports'],['Atlas','Innova Champion Discs']]){
   await show(page,name);
   const m=await material(page);
   assert.equal(m.manufacturer,maker);
   assert.equal(m.overmold,true,name+' is an overmold');
   assert.equal(m.materials,2);assert.equal(m.distinct,2,name+' draws two distinct materials');
   assert.notEqual(m.colorHex[0],m.colorHex[1],name+': rim and plate differ in colour');
   assert.equal(m.colorHex[1],m.colors.rim);assert.equal(m.colorHex[0],m.colors.plate);
   // The seam: the plate's top reaches exactly R − rim width, and the rim's top starts there.
   const plate=m.groups.find(g=>g.material===0),rim=m.groups.find(g=>g.material===1);
   assert.ok(Math.abs(m.seam-(m.R-m.w))<1e-6,`${name}: seam ${m.seam} at ${m.R} − ${m.w}`);
   assert.ok(Math.abs(plate.topHi-(m.R-m.w))<1e-4,`${name}: plate top ends at ${plate.topHi.toFixed(4)}, rim width says ${(m.R-m.w).toFixed(4)}`);
   assert.ok(Math.abs(rim.topLo-(m.R-m.w))<1e-4,`${name}: rim top starts at ${rim.topLo.toFixed(4)}`);
   assert.ok(Math.abs(rim.hi-m.R)<1e-4,'the rim runs out to the nose');
   assert.ok(plate.hi<=m.R-m.w+1e-4,'no plate vertex outside the seam');
   assert.ok(rim.lo>m.R-m.w-.1,'the rim keeps to its own width (the inner wall leans in 0.06 cm)');
   // And on screen: the rim and the plate draw in different colours.
   const diff=m.pixels.rim.slice(0,3).reduce((s,c,i)=>s+Math.abs(c-m.pixels.plate[i]),0);
   assert.ok(diff>60,`${name}: rim ${m.pixels.rim} vs plate ${m.pixels.plate} on screen`);
   assert.match(await page.locator('#detail canvas').getAttribute('aria-label'),/overmold rim/);
   const slug=name.toLowerCase();
   await shot(page,`overmold-${slug}-34`,'#detail .disc3d-viewport');
   await view(page,'top');await shot(page,`overmold-${slug}-top`,'#detail .disc3d-viewport');
   await view(page,'bottom');await shot(page,`overmold-${slug}-bottom`,'#detail .disc3d-viewport');
   overmolds.push(m);
  }
  check('Envy (Axiom), Volt (MVP) and Atlas (Innova) draw two materials split at the measured rim width: '+overmolds.map(m=>`${m.name} ${m.colors.rim}/${m.colors.plate}`).join(', '));
  for(const [name,maker] of [['Drift','Streamline Discs'],['Destroyer','Innova Champion Discs'],['Buzzz','Discraft']]){
   await show(page,name);
   const m=await material(page);
   assert.equal(m.manufacturer,maker);assert.equal(m.overmold,false,name+' is not an overmold');
   assert.equal(m.materials,1,name+' is one material');assert.equal(m.groups.length,0,name+' has no material groups');
   assert.ok(!/overmold/.test(await page.locator('#detail canvas').getAttribute('aria-label')));
  }
  await shot(page,'single-buzzz-34','#detail .disc3d-viewport');
  check('Streamline Drift, Innova Destroyer and Discraft Buzzz stay one material');

  // The colour API: optional rim/plate colours through Disc3D.sync, defaults when absent.
  {
   await show(page,'Envy');
   const id=await byName(page,'Envy');
   // sync() applies the props once the (already loaded) viewer promise settles.
   const colors=c=>page.evaluate(async([id,c])=>{const d=discs.find(x=>x.id===id);Disc3D.sync(document.querySelector('#detail'),d,{color:'#d94f2b',colors:c,hand:'RHBH'});await new Promise(r=>setTimeout(r,0));
    const {bodyMaterial,rimMaterial}=Disc3D.viewer.debug;return {state:Disc3D.viewer.state.colors,plate:'#'+bodyMaterial.color.getHexString(),rim:'#'+rimMaterial.color.getHexString()};},[id,c]);
   const both=await colors({rim:'#111111',plate:'#f5f5f5'});
   assert.deepEqual(both.state,{rim:'#111111',plate:'#f5f5f5'});
   assert.equal(both.rim,'#111111');assert.equal(both.plate,'#f5f5f5');
   await settle(page);await shot(page,'overmold-envy-custom-colors','#detail .disc3d-viewport');
   const rimOnly=await colors({rim:'#2b6cd9'});
   assert.deepEqual(rimOnly.state,{rim:'#2b6cd9',plate:'#d94f2b'});
   const none=await colors(undefined);
   assert.equal(none.state.plate,'#d94f2b');assert.notEqual(none.state.rim,'#d94f2b');
   assert.equal(none.rim,none.state.rim);
   check(`rim/plate colours override the defaults and fall back without them (default rim ${none.state.rim} for #d94f2b)`);
  }
  {
   const img=f=>'data:image/png;base64,'+fs.readFileSync(`${dir}/${f}.png`).toString('base64');
   const css='<style>body{margin:0;padding:24px;font:15px system-ui;background:#fff;color:#1d232b}main{display:grid;gap:20px;grid-template-columns:repeat(3,1fr)}h2{margin:0 0 4px;font-size:20px}p{margin:0 0 10px;color:#5b6470}img{width:100%;display:block;border:1px solid #e3e7ec;border-radius:8px;margin-bottom:10px}</style>';
   const board=await context.newPage();await board.setViewportSize({width:1500,height:900});
   await board.setContent(css+`<main>${overmolds.map(m=>{const n=m.name.toLowerCase();return `<section><h2>${m.name}</h2><p>${m.manufacturer} · rim ${m.w} cm · ${m.colors.rim} rim, ${m.colors.plate} plate</p><img src="${img('overmold-'+n+'-34')}"><img src="${img('overmold-'+n+'-top')}"><img src="${img('overmold-'+n+'-bottom')}"></section>`;}).join('')}</main>`);
   await board.screenshot({path:`${dir}/overmolds.png`,fullPage:true});await board.close();
  }
  check('overmold review board written');

  // Prompt 4, clay mode. Destroyer first: plastic, then clay, then plastic again, exactly as it was.
  {
   await show(page,'Destroyer');
   const before=await clayState(page),beforePixel=await centrePixel(page);
   assert.equal(before.clay,false);assert.equal(before.pressed,'false');assert.deepEqual(before.mats,['body']);
   assert.equal(before.stamp,true);assert.equal(before.profileHidden,true);
   await shot(page,'clay-off-destroyer','#detail .disc3d-viewer');
   await page.locator('#detail [data-disc3d-clay]').click();await settle(page);
   const on=await clayState(page),onPixel=await centrePixel(page);
   assert.equal(on.clay,true);assert.equal(on.host,true,'the host remembers clay');assert.equal(on.pressed,'true');
   assert.deepEqual(on.mats,['clay'],'the mesh wears the clay material');
   assert.equal(on.stamp,false,'the name stamp is hidden in clay');
   assert.deepEqual(on.plastic,before.plastic,'the plastic material underneath is untouched');
   assert.match(on.ground,/rgb\(22, 24, 28\)/,'dark clay ground: '+on.ground);
   assert.match(on.label,/plain clay/);
   assert.ok(Math.max(...onPixel.slice(0,3))-Math.min(...onPixel.slice(0,3))<10,`the disc draws neutral grey: ${onPixel}`);
   assert.notDeepEqual(onPixel,beforePixel);
   // The cross-section: below the stage, never over it; drawn from the geometry's own points; the panel's numbers.
   assert.equal(on.profileHidden,false);
   assert.ok(on.figure.top>=on.canvas.bottom-.5&&on.figure.height>40,`the cross-section sits below the stage: ${JSON.stringify(on.figure)} vs ${JSON.stringify(on.canvas)}`);
   const prof=await profileVsGeometry(page);
   assert.equal(prof.drawn,prof.n*2,'both halves of every lathe point');
   assert.ok(prof.worst<.01,`outline matches the lathe's profile points to ${prof.worst.toFixed(4)} cm`);
   assert.ok(prof.mirror<.01,'the left half mirrors the right');
   for(const k of ['Diameter','Height','Rim width','Rim depth'])assert.ok(prof.texts.includes(`${k} ${prof.panel[k]}`),`${k} reads ${prof.panel[k]} as in the panel: ${prof.texts.join(' | ')}`);
   assert.equal(prof.texts.length,4);assert.match(prof.caption,/PDGA dimensions, to scale/);
   await shot(page,'clay-on-destroyer','#detail .disc3d-viewer');
   check(`clay: matte grey on a dark ground, stamp hidden, plastic untouched; cross-section below the stage from the lathe's ${prof.n} points with the panel's ${prof.texts.join(', ')}`);

   // Another disc keeps clay on, rendered for the new disc.
   const looks=[];
   for(const name of ['Buzzz','Aviar','Destroyer']){
    await show(page,name);
    const st=await clayState(page),pr=await profileVsGeometry(page);
    assert.equal(st.clay,true,name+' keeps clay on');assert.deepEqual(st.mats,['clay']);assert.equal(st.stamp,false);
    assert.ok(pr.worst<.01,`${name}: outline matches its own lathe points`);
    assert.ok(pr.texts.includes(`Diameter ${pr.panel.Diameter}`)&&pr.texts.includes(`Rim width ${pr.panel['Rim width']}`),name+': its own numbers '+JSON.stringify(pr));
    await shot(page,`clay-${name.toLowerCase()}`,'#detail .disc3d-viewer');
    looks.push({name,texts:pr.texts});
   }
   assert.notDeepEqual(looks[0].texts,looks[1].texts);
   check('clay stays on from disc to disc, each drawn and annotated for itself');

   // Theme: the clay ground stays dark in every theme; the plastic ground comes back with the theme's own.
   const theme0=await page.evaluate(()=>document.documentElement.dataset.theme);
   for(const theme of ['light','midnight','charcoal','black']){
    await page.evaluate(t=>{document.documentElement.dataset.theme=t;window.dispatchEvent(new CustomEvent('atlas-theme-change',{detail:t}));},theme);
    const st=await clayState(page);
    assert.match(st.ground,/rgb\(22, 24, 28\)/,theme+': dark clay ground');assert.deepEqual(st.mats,['clay'],theme+': still clay');
   }
   await page.evaluate(t=>{document.documentElement.dataset.theme=t;window.dispatchEvent(new CustomEvent('atlas-theme-change',{detail:t}));},theme0);
   check('the clay ground is dark in light, midnight, charcoal and black');

   // Off again: exactly the plastic it had.
   await page.locator('#detail [data-disc3d-clay]').click();await settle(page);
   const off=await clayState(page);
   assert.equal(off.clay,false);assert.equal(off.host,false);assert.equal(off.pressed,'false');
   assert.deepEqual(off.mats,['body']);assert.deepEqual(off.plastic,before.plastic,'the same plastic material, colour and finish');
   assert.equal(off.stamp,true);assert.equal(off.profileHidden,true);
   assert.equal(off.ground,before.ground,'the theme backdrop is back');assert.equal(off.label,before.label);
   assert.deepEqual(await centrePixel(page),beforePixel,'the same pixels as before clay');
   check('turning clay off restores the plastic material, finish, colour, stamp and backdrop exactly');
  }

  // Overmold in clay: two clay tones split at the same seam; a chosen rim colour waits underneath.
  {
   await show(page,'Envy');
   const id=await byName(page,'Envy');
   const plasticBefore=await clayState(page);
   await page.locator('#detail [data-disc3d-clay]').click();await settle(page);
   const st=await clayState(page),m=await material(page);
   assert.deepEqual(st.mats,['clay','clayRim'],'plate and rim each in their clay tone');
   assert.notEqual(st.tones[0],st.tones[1]);
   assert.deepEqual(m.colorHex,st.tones);
   const diff=m.pixels.rim.slice(0,3).reduce((s,c,i)=>s+Math.abs(c-m.pixels.plate[i]),0);
   assert.ok(diff>45,`the overmold split shows in clay: rim ${m.pixels.rim} vs plate ${m.pixels.plate}`);
   const pr=await profileVsGeometry(page);
   assert.equal(pr.rims,2,'the cross-section draws both rim pieces');assert.ok(pr.worst<.01);
   await shot(page,'clay-overmold-envy','#detail .disc3d-viewer');
   await view(page,'top');await shot(page,'clay-overmold-envy-top','#detail .disc3d-viewport');await view(page,'angle');
   // A user-chosen rim colour does not tint the clay, and is there when clay is turned off.
   await page.evaluate(async id=>{Disc3D.sync(document.querySelector('#detail'),discs.find(x=>x.id===id),{color:'#d94f2b',colors:{rim:'#2b6cd9'},hand:'RHBH'});await new Promise(r=>setTimeout(r,0));},id);
   const chosen=await clayState(page);
   assert.deepEqual(chosen.mats,['clay','clayRim']);assert.deepEqual(chosen.tones,st.tones,'clay tones ignore the chosen rim colour');
   assert.equal(chosen.plastic.rim.color,'#2b6cd9','the chosen rim colour is applied underneath');
   await page.locator('#detail [data-disc3d-clay]').click();await settle(page);
   const back=await clayState(page);
   assert.deepEqual(back.mats,['body','rim']);assert.equal(back.plastic.rim.color,'#2b6cd9');assert.equal(back.stamp,true);
   await page.evaluate(async id=>{Disc3D.sync(document.querySelector('#detail'),discs.find(x=>x.id===id),{color:'#d94f2b',hand:'RHBH'});await new Promise(r=>setTimeout(r,0));},id);
   assert.equal((await clayState(page)).plastic.rim.color,plasticBefore.plastic.rim.color);
   await shot(page,'clay-off-overmold-envy','#detail .disc3d-viewer');
   check(`overmold in clay: plate ${st.tones[0]} and rim ${st.tones[1]} split at the seam on screen and in the cross-section; a chosen rim colour waits underneath`);
  }

  // Board: Destroyer, Buzzz and Aviar in clay, side by side.
  {
   const img=f=>'data:image/png;base64,'+fs.readFileSync(`${dir}/${f}.png`).toString('base64');
   const board=await context.newPage();await board.setViewportSize({width:1500,height:900});
   await board.setContent('<style>body{margin:0;padding:24px;font:15px system-ui;background:#fff;color:#1d232b}main{display:grid;gap:20px;grid-template-columns:repeat(4,1fr)}h2{margin:0 0 8px;font-size:18px}img{width:100%;display:block}</style>'+
    `<main>${['destroyer','buzzz','aviar','overmold-envy'].map(n=>`<section><h2>${n}</h2><img src="${img('clay-'+n)}"></section>`).join('')}</main>`);
   await board.screenshot({path:`${dir}/clay-side-by-side.png`,fullPage:true});await board.close();
  }

  // A rated disc without PDGA dimensions falls back to the Phase 1 generic shape and caption.
  {
   const id=await byName(page,'Leopard');
   await page.evaluate(id=>{const d=discs.find(x=>x.id===id);d.__specs=d.specs;delete d.specs;select(d);},id);
   await page.waitForFunction(id=>{const s=document.querySelector('#detail .disc3d-stage');return s?.dataset.state==='ready'&&s.dataset.disc===id&&Disc3D.viewer.state.source==='flight';},id);
   assert.match(await page.locator('#detail [data-disc3d] .illustration-caption').textContent(),/generic shape from the flight numbers/);
   await settle(page);await shot(page,'no-specs-generic-leopard');
   // In clay, its cross-section is that generic shape, labelled so, with no numbers.
   await page.locator('#detail [data-disc3d-clay]').click();await settle(page);
   const gp=await profileVsGeometry(page);
   assert.ok(gp.worst<.01,'the generic cross-section is the generic lathe profile');
   assert.deepEqual(gp.texts,[],'no PDGA numbers on a generic shape');assert.match(gp.caption,/generic shape from its flight numbers/);
   await shot(page,'clay-generic-leopard','#detail .disc3d-viewer');
   await page.locator('#detail [data-disc3d-clay]').click();
   await page.evaluate(id=>{const d=discs.find(x=>x.id===id);d.specs=d.__specs;delete d.__specs;},id);
   check('a rated disc without PDGA dimensions keeps the Phase 1 generic shape');
  }

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
  // Per-mold shapes cost the phone nothing: the same triangles, and frames no slower than the Phase 1
  // generic shape of the same disc (median of 40 synchronous draws each).
  const perf=await page.evaluate(()=>{
   const v=Disc3D.viewer,base=v.state.props,info=v.debug.renderer.info,gl=v.debug.renderer.getContext();
   const time=()=>{const t=[];for(let i=0;i<40;i++){const s=performance.now();v.debug.renderNow();gl.finish();t.push(performance.now()-s);}t.sort((a,b)=>a-b);return {ms:t[20],tris:info.render.triangles};};
   v.update({...base,specs:null});const generic={...time(),source:v.state.source};
   v.update(base);const measured={...time(),source:v.state.source};
   return {generic,measured};
  });
  assert.equal(perf.generic.source,'flight');assert.equal(perf.measured.source,'pdga');
  assert.equal(perf.measured.tris,perf.generic.tris,'same triangle count');
  assert.ok(perf.measured.ms<=Math.max(perf.generic.ms*1.5,perf.generic.ms+2),`frame ${perf.measured.ms.toFixed(2)} ms vs ${perf.generic.ms.toFixed(2)} ms`);
  check(`phone frames: ${perf.measured.tris} triangles, ${perf.measured.ms.toFixed(2)} ms per mold vs ${perf.generic.ms.toFixed(2)} ms generic`);
  // An overmold on the phone: two materials, the same triangle budget (one extra profile point), controls fit.
  await show(page,'Envy');
  const om=await page.evaluate(()=>{const v=Disc3D.viewer;v.debug.renderNow();return {overmold:v.state.overmold,materials:[].concat(v.debug.body.material).length,tris:v.debug.renderer.info.render.triangles};});
  assert.equal(om.overmold,true);assert.equal(om.materials,2);
  assert.ok(om.tris<=perf.measured.tris+2*56+2,`overmold triangles ${om.tris} vs ${perf.measured.tris}`);
  const bar=await page.locator('#detail .disc3d-toolbar').boundingBox(),sheet=await page.locator('#detail').boundingBox();
  assert.ok(bar.x>=sheet.x&&bar.x+bar.width<=sheet.x+sheet.width+.5);
  assert.ok(await coverage(page)>.06);
  await page.screenshot({path:`${dir}/phone-envy.png`});
  check(`phone draws the Envy overmold in two materials (${om.tris} triangles)`);
  // Clay on the phone: the cross-section sits under the stage, inside the sheet, never over the disc.
  for(const name of ['Destroyer','Envy']){
   await show(page,name);
   if(!await page.evaluate(()=>Disc3D.clay))await page.locator('#detail [data-disc3d-clay]').click();
   await settle(page);
   const st=await clayState(page),sh=await page.locator('#detail').boundingBox(),tb=await page.locator('#detail .disc3d-toolbar').boundingBox();
   assert.equal(st.clay,true);assert.equal(st.profileHidden,false);
   assert.ok(st.figure.top>=st.canvas.bottom-.5,`phone ${name}: cross-section below the stage`);
   assert.ok(st.figure.left>=sh.x-.5&&st.figure.right<=sh.x+sh.width+.5,'phone: cross-section fits the sheet');
   assert.ok(tb.x+tb.width<=sh.x+sh.width+.5&&tb.y>=st.figure.bottom-.5,'phone: toolbar fits, under the cross-section');
   const clipped=await page.evaluate(()=>[...document.querySelectorAll('#detail .disc3d-toolbar button')].filter(b=>b.scrollWidth>b.clientWidth+1).map(b=>b.textContent));
   assert.deepEqual(clipped,[],'no toolbar label clips');
   await page.locator('#detail .disc3d-viewer').scrollIntoViewIfNeeded();
   await page.screenshot({path:`${dir}/phone-clay-${name.toLowerCase()}.png`});
  }
  await page.locator('#detail [data-disc3d-clay]').click();await settle(page);
  assert.equal((await clayState(page)).clay,false);
  await page.locator('#detail .disc3d-viewer').scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/phone-clay-off-envy.png`});
  check('phone: clay keeps its cross-section under the stage and the controls inside the sheet');
  await context.close();
 }
 const real=errors.filter(e=>!/Frontend test: backend excluded|status of 503|Failed to load resource/.test(e));
 assert.deepEqual(real,[],'no page errors');
 check('no page errors');
}finally{
 await browser.close();server.close();
}
