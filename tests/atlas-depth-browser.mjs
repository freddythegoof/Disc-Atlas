// The main Atlas's discs at depth in a real browser (AtlasGroups.discScale). Zooming flies toward the
// discs: they draw small at 1x and grow smoothly to full size at 9x, with no pop on any frame, in
// both directions. Only the art changes: the discs shown, where they rest and where their names sit
// are exactly what layout gives them, and no name touches another name or any disc at any zoom.
// The background dot field is gone: the canvas holds only the grid and its numbers. Desktop and
// phone, three themes.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/atlas-depth-browser.mjs   (shots: outputs/atlas-depth/)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');

const dir='outputs/atlas-depth';
fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"Frontend test: backend excluded"}');return;}
 try{
  const data=fs.readFileSync(file);
  res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
const checks=[],errors=[];
const check=label=>{checks.push(label);console.log('ok -',label);};
const VIEWPORTS={desktop:{width:1440,height:900},phone:{width:390,height:844}};
const THEMES=['midnight','charcoal','light'];

async function open(viewport){
 const context=await browser.newContext({viewport:VIEWPORTS[viewport]});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 await page.goto(base);
 if(viewport==='phone')await page.locator('#mapTab').click();
 await page.waitForFunction(()=>filtered.length>0&&mapClusters.length>0);
 await page.evaluate(()=>document.fonts.ready);
 return page;
}
const settled=async page=>{
 await page.waitForFunction(()=>!cameraTween&&groupCache&&groupCache.items===filtered&&groupCache.level===AtlasGroups.level(zoom,groupCache.level)&&
  !document.querySelector('#mapMarkers').classList.contains('is-regrouping')&&!document.querySelector('.marker-position.is-retiring,.marker-position.is-new'));
 await page.waitForTimeout(450);
};
// Cameras: far (1x), the landing camera (Destroyer selected, as the page opens), mid zoom and the 9x
// maximum, each about a point of the map (fractions of its width and height).
const CAMERAS={
 far:{zoom:1},
 landing:{landing:true},
 mid:{zoom:3,at:[.55,.5]},
 max:{zoom:9,at:[.55,.5]},
 'max-edge':{zoom:9,at:[.2,.75]},
 'max-landing':{landing:true,zoom:9},
};
const SHOTS=['far','mid','max'];
async function show(page,camera,theme){
 await page.mouse.move(1,1);
 await page.evaluate(([camera,theme])=>{
  document.querySelector(`[data-theme-choice="${theme}"]`).click();
  selected=null;closeDetail(false);document.querySelector('#search').value='';selectedBrands.clear();type='all';
  zoom=1;pan={x:0,y:0};filter();
  if(camera.landing)focusFeatured();
  if(camera.zoom&&camera.zoom!==1){
   const {width:w,height:h}=mapViewport,at=camera.at?{x:w*camera.at[0],y:h*camera.at[1]}:{x:w/2,y:h/2};
   const target=boundedCamera(zoomDestination(camera.zoom,at));zoom=target.zoom;pan={x:target.x,y:target.y};
  }
  draw();
 },[camera,theme]);
 await settled(page);
 await page.evaluate(()=>draw());
}
// Every marker on screen, in map pixels: its art box, its name box and whether a viewer sees the name.
// Markers mid-regroup (arriving or retiring) are flagged; a settled view has none.
const SCENE=()=>{
 const map=canvas.getBoundingClientRect(),rect=n=>{const r=n.getBoundingClientRect();return {x:r.left-map.left,y:r.top-map.top,w:r.width,h:r.height};};
 const marks=[...document.querySelectorAll('#mapMarkers .marker-position')].map(p=>{
  const node=p.querySelector('.atlas-marker'),large=node.classList.contains('is-large'),name=node.querySelector('.marker-name'),style=getComputedStyle(name);
  return {key:node.dataset.cluster,name:name.firstChild.textContent,large,selected:node.classList.contains('is-selected'),
   moving:p.classList.contains('is-retiring')||p.classList.contains('is-new')||node.groupVersion!==groupCache,
   transform:p.style.transform,art:rect(node.querySelector(large?'.disc-art':'.map-dot')),label:rect(name),
   shown:style.visibility!=='hidden'&&style.opacity!=='0'&&style.display!=='none'&&getComputedStyle(p).opacity!=='0'};
 }).sort((a,b)=>a.key<b.key?-1:a.key>b.key?1:0);
 // Keyed by disc: the markers' DOM order follows when the worker answered, which never shows.
 return {zoom,scale:AtlasGroups.discScale(zoom),map:{w:map.width,h:map.height},marks};
};
const scene=page=>page.evaluate(SCENE);
const touch=(a,b)=>a.x<b.x+b.w-.5&&b.x<a.x+a.w-.5&&a.y<b.y+b.h-.5&&b.y<a.y+a.h-.5;
// Drawn size: 76px art times the depth scale, and 9% more when selected.
const expected=(m,scale)=>76*scale*(m.selected?1.09:1);
function sizes(view,label){
 for(const m of view.marks.filter(m=>m.large&&!m.moving)){
  const size=expected(m,view.scale);
  assert.ok(Math.abs(m.art.w-size)<.6&&Math.abs(m.art.h-size)<.6,`${label}: ${m.name} draws ${m.art.w.toFixed(1)}px, not ${size.toFixed(1)}px`);
 }
}
// No name touches another name, another disc, or its own disc; in a settled view no two discs touch.
// (Mid-swap frames can briefly bring two discs together under any art size: a level that is still
// being prepared shows the old one. That is layout's, and it clears once the level settles.)
function labels(view,label,{arts=true}={}){
 const marks=view.marks.filter(m=>!m.moving),named=marks.filter(m=>m.shown&&m.large);
 for(const a of named){
  assert.ok(!touch(a.label,a.art),`${label}: ${a.name}'s name touches its own disc`);
  for(const b of marks){
   if(a===b)continue;
   assert.ok(!touch(a.label,b.art),`${label}: ${a.name}'s name touches ${b.name}'s disc`);
   if(b.shown&&b.large)assert.ok(!touch(a.label,b.label),`${label}: ${a.name}'s and ${b.name}'s names touch`);
  }
 }
 if(arts)for(let i=0;i<marks.length;i++)for(let j=i+1;j<marks.length;j++)
  assert.ok(!touch(marks[i].art,marks[j].art),`${label}: ${marks[i].name} and ${marks[j].name} touch`);
 return named.length;
}
// The canvas under the discs: count its arcs while it draws (the dot field drew arcs; the grid draws
// none), then check every painted pixel lies on a grid line or among the speed numbers at its left.
const CANVAS=()=>{
 let arcs=0;const arc=ctx.arc;ctx.arc=function(...a){arcs++;return arc.apply(this,a);};
 try{draw();}finally{ctx.arc=arc;}
 const {width:w,height:h}=mapViewport,area=AtlasLayout.bounds(w,h,!document.body.classList.contains('my-bag-mode')),dpr=canvas.width/w;
 const rows=[],cols=[];
 for(let n=1;n<=15;n+=zoom<1.8?2:1)rows.push(area.bottom-((n-1)/14)*area.height*zoom+pan.y);
 for(let n=0;n<=100;n+=zoom<1.8?20:10)cols.push(area.left+(n/100)*area.width*zoom+pan.x);
 const data=ctx.getImageData(0,0,canvas.width,canvas.height).data,stray=[];let painted=0;
 for(let py=0;py<canvas.height;py++)for(let px=0;px<canvas.width;px++){
  if(!data[(py*canvas.width+px)*4+3])continue;
  painted++;const x=(px+.5)/dpr,y=(py+.5)/dpr;
  if(rows.some(r=>Math.abs(y-r)<=1.5)||cols.some(c=>Math.abs(x-c)<=1.5)||x<30&&rows.some(r=>y>r-12&&y<r+8))continue;
  if(stray.length<5)stray.push([x,y]);
 }
 return {arcs,painted,stray,dots:typeof depthDots!=='undefined',module:!!window.AtlasDepth,
  token:getComputedStyle(document.documentElement).getPropertyValue('--depth-dot').trim()};
};

try{
 for(const viewport of Object.keys(VIEWPORTS)){
  const page=await open(viewport),counts={};
  for(const theme of THEMES)for(const [name,camera] of Object.entries(CAMERAS)){
   await show(page,camera,theme);
   const view=await scene(page),label=`${viewport} ${name} ${theme} (${view.zoom.toFixed(1)}x)`;
   assert.ok(view.marks.some(m=>m.large),`${label}: discs show`);
   sizes(view,label);
   const names=labels(view,label);
   assert.ok(names,`${label}: names show`);
   // No dot field: nothing on the canvas but the grid and its numbers, in any theme.
   const paint=await page.evaluate(CANVAS);
   assert.ok(!paint.dots&&!paint.module&&!paint.token,`${label}: the dot field's code or color remains`);
   assert.equal(paint.arcs,0,`${label}: the canvas draws ${paint.arcs} dots`);
   assert.ok(paint.painted>0,`${label}: the grid paints`);
   assert.deepEqual(paint.stray,[],`${label}: the canvas paints off the grid`);
   // Same zoom, same render.
   const again=await page.evaluate(()=>{draw();return null;}).then(()=>scene(page));
   assert.deepEqual(again,view,`${label}: redrawing changes the render`);
   counts[name]=`${(76*view.scale).toFixed(1)}px art, ${names} names`;
   if(SHOTS.includes(name)){
    // Same camera, same pixels.
    const shot=await page.screenshot({path:`${dir}/${viewport}-${name}-${theme}.png`,animations:'disabled'});
    await page.evaluate(()=>draw());
    assert.ok(shot.equals(await page.screenshot({animations:'disabled'})),`${label}: redrawing changes the pixels`);
   }
  }
  console.log(`  ${viewport}: ${Object.entries(counts).map(([k,v])=>k+' '+v).join('; ')}`);
  check(`${viewport}: at 1x, landing, mid and 9x in three themes, discs draw at their depth size, no name touches anything, the canvas holds only the grid, and a redraw is identical to the pixel`);

  // Rendering only: with the old growth curve in place of depth, the same discs rest in the same
  // spots and their names sit in the same boxes. Only the art's size differs.
  for(const name of ['far','landing','mid','max']){
   await show(page,CAMERAS[name],'midnight');
   const depth=await scene(page);
   await page.evaluate(()=>{window.depthScale=AtlasGroups.discScale;AtlasGroups.discScale=z=>AtlasGroups.artRoom(z);draw();});
   const old=await scene(page);
   await page.evaluate(()=>{AtlasGroups.discScale=window.depthScale;draw();});
   const plain=v=>v.marks.map(m=>[m.key,m.large,m.transform,m.shown,m.label]);
   assert.deepEqual(plain(depth),plain(old),`${viewport} ${name}: depth moves a disc or a name, or changes the set`);
   if(name==='far')assert.ok(depth.marks.filter(m=>m.large).every((m,i)=>m.art.w<old.marks.filter(o=>o.large)[i].art.w),`${viewport}: 1x art is smaller than before`);
  }
  check(`${viewport}: depth changes only the art: same discs, same spots, same name boxes as the old curve`);

  // Hover lifts the art 6% from its depth size and lets it back down to exactly that size: hover
  // motion never takes over the camera's scale (a far disc must not jump to full size).
  if(viewport==='desktop'){
   for(const name of ['far','max']){
    await show(page,CAMERAS[name],'midnight');
    const at=await page.evaluate(()=>{
     const {width:w,height:h}=mapViewport,map=canvas.getBoundingClientRect();
     const g=mapClusters.filter(g=>g.large&&!g.members.includes(selected)).sort((a,b)=>Math.hypot(a.x-w/2,a.y-h/2)-Math.hypot(b.x-w/2,b.y-h/2))[0];
     return {key:g.key,x:map.left+g.x,y:map.top+g.y};
    });
    const size=()=>page.evaluate(key=>document.querySelector(`[data-cluster="${key}"] .disc-art`).getBoundingClientRect().width,at.key);
    const rest=76*await page.evaluate(()=>AtlasGroups.discScale(zoom));
    await page.mouse.move(at.x,at.y);await page.waitForTimeout(450);
    const lifted=await size();
    await page.mouse.move(1,1);await page.waitForTimeout(900);
    const settledSize=await size();
    assert.ok(Math.abs(lifted-rest*1.06)<1.5,`${name}: hovered art is ${lifted.toFixed(1)}px, not ${(rest*1.06).toFixed(1)}px`);
    assert.ok(Math.abs(settledSize-rest)<.6,`${name}: after hover the art is ${settledSize.toFixed(1)}px, not ${rest.toFixed(1)}px`);
    console.log(`  desktop ${name}: rest ${rest.toFixed(1)}px, hovered ${lifted.toFixed(1)}px, after ${settledSize.toFixed(1)}px`);
   }
   check('desktop: hover lifts a disc 6% from its depth size and returns it exactly, far and at 9x');
  }

  // Fly in from 1x to 9x and back out, frame by frame as the map renders a camera move. Every disc
  // grows (then shrinks) on every frame by no more than the camera's step allows: no pop. No name
  // touches a name or a disc on any frame, and the settled ends are exact.
  for(const [from,to] of [[1,9],[9,1]]){
   await show(page,{zoom:from,at:[.55,.5]},'midnight');
   const frames=await page.evaluate(async([from,to,SCENE])=>{
    const read=new Function('return ('+SCENE+')()'),out=[],steps=120;
    for(let i=1;i<=steps;i++){
     const z=from*(to/from)**(i/steps),{width:w,height:h}=mapViewport;
     const t=boundedCamera(zoomDestination(z,{x:w*.55,y:h*.5}));zoom=t.zoom;pan={x:t.x,y:t.y};draw();
     await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
     out.push(read());
    }
    return out;
   },[from,to,SCENE.toString()]);
   const sign=Math.sign(to-from);let pairs=0,worst=0,named=0;
   for(let i=0;i<frames.length;i++){
    const f=frames[i],label=`${viewport} ${from}x→${to}x frame ${i+1} (${f.zoom.toFixed(2)}x)`;
    named+=labels(f,label,{arts:false});
    if(!i)continue;
    const p=frames[i-1],before=new Map(p.marks.filter(m=>m.large&&!m.moving).map(m=>[m.key,m]));
    // A frame may show a marker one camera step late (regroups budget their updates): allow two steps.
    const allowed=76*1.09*Math.abs(f.scale-(frames[i-2]?.scale??p.scale-(f.scale-p.scale)))+.6;
    for(const m of f.marks.filter(m=>m.large&&!m.moving)){
     const q=before.get(m.key);if(!q||q.selected!==m.selected)continue;
     const change=m.art.w-q.art.w;pairs++;worst=Math.max(worst,Math.abs(change));
     assert.ok(change*sign>=-.05,`${label}: ${m.name} ${sign>0?'shrinks':'grows'} by ${Math.abs(change).toFixed(2)}px`);
     assert.ok(Math.abs(change)<=allowed,`${label}: ${m.name} pops ${change.toFixed(2)}px (allowed ${allowed.toFixed(2)})`);
    }
   }
   assert.ok(pairs>=frames.length,`${viewport} ${from}x→${to}x: only ${pairs} frame-to-frame sizes compared`);
   await settled(page);await page.evaluate(()=>draw());
   const end=await scene(page);sizes(end,`${viewport} after ${from}x→${to}x`);labels(end,`${viewport} after ${from}x→${to}x`);
   console.log(`  ${viewport} ${from}x→${to}x: ${frames.length} frames, ${pairs} size steps, largest ${worst.toFixed(2)}px, ${named} names checked`);
  }
  check(`${viewport}: zooming 1x→9x and 9x→1x, discs grow and shrink smoothly on every frame and no name touches anything`);
  await page.context().close();
 }

 // Determinism: two fresh pages draw the same camera identically: every disc, its spot, its art size,
 // its name box and whether the name shows. (Their screenshots can differ in antialiasing alone when
 // the worker answered in another order, since marker DOM order sets compositor layer order.)
 for(const viewport of Object.keys(VIEWPORTS))for(const name of ['far','mid','max']){
  const runs=[];
  for(let i=0;i<2;i++){
   const page=await open(viewport);await show(page,CAMERAS[name],'midnight');
   runs.push(await scene(page));
   await page.context().close();
  }
  assert.deepEqual(runs[1],runs[0],`${viewport} ${name}: same render`);
 }
 check('Determinism: fresh pages at 1x, 3x and 9x render the same discs, sizes and names, desktop and phone');

 assert.deepEqual(errors,[],'page errors');
 console.log(`\n${checks.length} checks passed. Screenshots: ${dir}/`);
}finally{await browser.close();server.close();}
