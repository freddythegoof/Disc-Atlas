// The main Atlas's two tiers of depth in a real browser. Tier 1, the curated discs, draws exactly as
// before the depth work: 76px art growing with artRoom, every name and manufacturer shown. Tier 2
// (AtlasGroups.GAP) fills the room between them with small discs from the rest of the rated catalog,
// drawn on the canvas under every curated disc: unlabeled at 1x, their names fading in as you zoom
// in, never popping. No name touches anything and no small disc crowds a curated disc or name, at
// any zoom tested or on any frame of a flight. Desktop and phone, three themes.
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
// How long a small disc or name takes to fade fully in or out (atlas-map.js GAP_FADE).
const GAP_FADE=180;

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
// Settled: the level is current, no marker is arriving or retiring, and every small disc and name has
// finished fading.
const settled=async page=>{
 await page.waitForFunction(()=>!cameraTween&&groupCache&&groupCache.items===filtered&&groupCache.level===AtlasGroups.level(zoom,groupCache.level)&&
  !document.querySelector('#mapMarkers').classList.contains('is-regrouping')&&!document.querySelector('.marker-position.is-retiring,.marker-position.is-new'));
 await page.waitForTimeout(450);
 await page.evaluate(()=>draw());
 await page.waitForFunction(()=>mapGaps.every(g=>g.on&&g.art===1&&g.rest&&g.strength===(g.named?AtlasGroups.gapLabelAlpha(zoom):0)));
 await page.waitForTimeout(250);
};
// Cameras: 1x, the landing camera (Destroyer selected, as the page opens), mid zoom, deep (names in
// full), the 9x maximum, and 9x at an edge of the map.
const CAMERAS={
 far:{zoom:1},
 landing:{landing:true},
 mid:{zoom:3,at:[.55,.5]},
 deep:{zoom:6.5,at:[.55,.5]},
 max:{zoom:9,at:[.55,.5]},
 'max-edge':{zoom:9,at:[.2,.75]},
};
const SHOTS=['far','mid','deep','max'];
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
}
// Everything on the map, in map pixels. Curated discs and a complete view's dots are DOM markers: their
// art box, their name box and how strongly the name shows. A marker arriving, retiring or gliding to
// its new level's spot (is-updating, a CSS transition) is moving: its box is not where layout put it.
// So is one past the map's edge that the camera no longer places (it waits there to be removed). Small discs come from the canvas's own
// record of what it drew (mapGaps): their art box and, while it shows, their name box.
const SCENE=()=>{
 const live=new Set(mapClusters.map(g=>g.key)),map=canvas.getBoundingClientRect(),rect=n=>{const r=n.getBoundingClientRect();return {x:r.left-map.left,y:r.top-map.top,w:r.width,h:r.height};};
 const marks=[...document.querySelectorAll('#mapMarkers .marker-position')].map(p=>{
  const node=p.querySelector('.atlas-marker'),large=node.classList.contains('is-large'),name=node.querySelector('.marker-name'),style=getComputedStyle(name);
  // What a viewer sees: the name's own opacity times its marker's (an arriving marker fades in).
  const own=style.visibility==='hidden'||style.display==='none'?0:+style.opacity,present=+getComputedStyle(p).opacity*+getComputedStyle(node).opacity,strength=own*present;
  return {key:node.dataset.cluster,name:name.firstChild.textContent,brand:name.querySelector('small')?.textContent||'',large,
   selected:node.classList.contains('is-selected'),small:node.classList.contains('is-gap-label'),
   moving:p.classList.contains('is-retiring')||p.classList.contains('is-new')||p.classList.contains('is-updating')||node.groupVersion!==groupCache||!live.has(node.dataset.cluster),
   transform:p.style.transform,art:rect(node.querySelector(large?'.disc-art':'.map-dot')),label:rect(name),strength:+strength.toFixed(3),own:+own.toFixed(3),arriving:present<1};
 }).sort((a,b)=>a.key<b.key?-1:a.key>b.key?1:0);
 const gaps=mapGaps.map(g=>({key:g.id,name:g.name,x:+g.x.toFixed(2),y:+g.y.toFixed(2),size:+g.size.toFixed(3),art:g.art,label:+g.strength.toFixed(4),named:g.named,on:g.on,rest:g.rest,drawn:g.drawn,
  box:g.box&&{x:g.box.x,y:g.box.y,w:g.box.w,h:g.box.h}})).sort((a,b)=>a.key<b.key?-1:a.key>b.key?1:0);
 return {zoom,clock:gapClock,room:AtlasGroups.artRoom(zoom),gapSize:AtlasGroups.gapSize(zoom),labelAlpha:AtlasGroups.gapLabelAlpha(zoom),map:{w:map.width,h:map.height},marks,gaps};
};
const scene=page=>page.evaluate(SCENE);
// A render without the time it was drawn at.
const still=view=>({...view,clock:null});
const touch=(a,b)=>a.x<b.x+b.w-.5&&b.x<a.x+a.w-.5&&a.y<b.y+b.h-.5&&b.y<a.y+a.h-.5;
const gapArt=g=>({x:g.x-g.size/2,y:g.y-g.size/2,w:g.size,h:g.size});
// A curated disc draws exactly as before the depth work: 76px art times artRoom, 9% more when selected.
function sizes(view,label){
 for(const m of view.marks.filter(m=>m.large&&!m.moving)){
  const size=76*view.room*(m.selected?1.09:1);
  assert.ok(Math.abs(m.art.w-size)<.6&&Math.abs(m.art.h-size)<.6,`${label}: ${m.name} draws ${m.art.w.toFixed(1)}px, not ${size.toFixed(1)}px`);
 }
}
// No name touches anything: not a curated disc or name, not a small disc or its name, not its own
// disc. No small disc touches a curated disc, a curated name or another small disc. In a settled view
// no two curated discs touch. A small disc mid-ease (a level swap moves its rest spot a few px) or
// leaving is left out; one arriving is in, at any strength.
function clean(view,label,{arts=true}={}){
 const marks=view.marks.filter(m=>!m.moving),gaps=view.gaps.filter(g=>g.drawn&&g.on&&g.rest);
 const things=[];
 for(const m of marks){
  things.push({who:m.name+(m.large?'':' (dot)'),key:m.key,kind:m.large?'art':'small',box:m.art});
  if(m.strength>0&&(m.large||m.small))things.push({who:m.name+"'s name",key:m.key,kind:'name',box:m.label});
 }
 for(const g of gaps){
  things.push({who:g.name+' (small)',key:g.key,kind:'small',box:gapArt(g)});
  if(g.label>0)things.push({who:g.name+"'s small name",key:g.key,kind:'name',box:g.box});
 }
 // Only what a viewer can see: boxes wholly past the map's edges are left out.
 const seen=t=>t.box.x+t.box.w>0&&t.box.y+t.box.h>0&&t.box.x<view.map.w&&t.box.y<view.map.h;
 things.splice(0,things.length,...things.filter(seen));
 let names=0;
 for(let i=0;i<things.length;i++){
  const a=things[i];if(a.kind==='name')names++;
  for(let j=i+1;j<things.length;j++){
   const b=things[j];
   if(a.kind==='name'||b.kind==='name'){assert.ok(!touch(a.box,b.box),`${label}: ${a.who} touches ${b.who}`);continue;}
   if(a.key===b.key)continue;
   if(a.kind==='small'||b.kind==='small')assert.ok(!touch(a.box,b.box),`${label}: ${a.who} touches ${b.who}`);
   else if(arts)assert.ok(!touch(a.box,b.box),`${label}: ${a.who} and ${b.who} touch`);
  }
 }
 return names;
}
// The canvas under the discs holds the grid, its numbers and the small discs with their names: every
// painted pixel lies on a grid line, among the numbers, or on a small disc or its name.
const CANVAS=()=>{
 draw();
 const {width:w,height:h}=mapViewport,area=AtlasLayout.bounds(w,h,!document.body.classList.contains('my-bag-mode')),dpr=canvas.width/w;
 const rows=[],cols=[];
 for(let n=1;n<=15;n+=zoom<1.8?2:1)rows.push(area.bottom-((n-1)/14)*area.height*zoom+pan.y);
 for(let n=0;n<=100;n+=zoom<1.8?20:10)cols.push(area.left+(n/100)*area.width*zoom+pan.x);
 const data=ctx.getImageData(0,0,canvas.width,canvas.height).data,stray=[];let painted=0,hash=0;
 for(let i=0;i<data.length;i++)hash=(Math.imul(hash,31)+data[i])|0;
 for(let py=0;py<canvas.height;py++)for(let px=0;px<canvas.width;px++){
  if(!data[(py*canvas.width+px)*4+3])continue;
  painted++;const x=(px+.5)/dpr,y=(py+.5)/dpr;
  if(rows.some(r=>Math.abs(y-r)<=1.5)||cols.some(c=>Math.abs(x-c)<=1.5)||x<30&&rows.some(r=>y>r-12&&y<r+8))continue;
  if(mapGaps.some(g=>Math.hypot(x-g.x,y-g.y)<=g.size/2+1||g.strength>0&&g.box&&x>g.box.x-6&&x<g.box.x+g.box.w+6&&y>g.box.y-6&&y<g.box.y+g.box.h+7))continue;
  if(stray.length<5)stray.push([x,y]);
 }
 return {painted,stray,hash};
};

try{
 for(const viewport of Object.keys(VIEWPORTS)){
  const page=await open(viewport),counts={};
  for(const theme of THEMES)for(const [name,camera] of Object.entries(CAMERAS)){
   await show(page,camera,theme);
   const view=await scene(page),label=`${viewport} ${name} ${theme} (${view.zoom.toFixed(1)}x)`;
   assert.ok(view.marks.some(m=>m.large),`${label}: curated discs show`);
   sizes(view,label);
   const names=clean(view,label);
   // Every curated disc shows its name and manufacturer, at every zoom.
   for(const m of view.marks.filter(m=>m.large))assert.ok(m.strength===1&&m.brand,`${label}: ${m.name} hides its name or manufacturer`);
   const complete=await page.evaluate(()=>!!groupCache.groups[0]?.complete);
   const drawn=view.gaps.filter(g=>g.drawn);
   if(!complete)assert.ok(drawn.length>=(viewport==='desktop'?15:8),`${label}: only ${drawn.length} small discs`);
   for(const g of drawn){
    assert.equal(g.size,+view.gapSize.toFixed(3));
    assert.ok(g.size*5<=76*view.room,`${label}: a small disc competes with the curated ones`);
    assert.equal(g.label,g.named?+view.labelAlpha.toFixed(4):0,`${label}: ${g.name}'s name shows at ${g.label}`);
   }
   if(name==='far'){
    assert.ok(drawn.length>=(viewport==='desktop'?80:18),`${label}: ${drawn.length} small discs at 1x`);
    assert.ok(drawn.every(g=>g.label===0)&&!view.marks.some(m=>!m.large&&m.strength>0),`${label}: a small disc is named at 1x`);
   }
   // Deep in, small discs show names (where any rest in view; a complete view may show every disc in full).
   if((name==='max'||name==='deep')&&(drawn.length||view.marks.some(m=>!m.large))){
    const shownSmall=drawn.filter(g=>g.label>0).length+view.marks.filter(m=>m.small&&m.strength>0).length;
    assert.ok(shownSmall>0,`${label}: no small disc is named`);
   }
   const paint=await page.evaluate(CANVAS);
   assert.ok(paint.painted>0,`${label}: the canvas paints`);
   assert.deepEqual(paint.stray,[],`${label}: the canvas paints off the grid and the small discs`);
   // Same zoom, same render, same pixels.
   await page.evaluate(()=>draw());
   assert.deepEqual(still(await scene(page)),still(view),`${label}: redrawing changes the render`);
   assert.equal((await page.evaluate(CANVAS)).hash,paint.hash,`${label}: redrawing changes the canvas`);
   counts[name]=`${view.marks.filter(m=>m.large).length} curated, ${drawn.length} small (${drawn.filter(g=>g.label>0).length} named), ${names} names`;
   if(SHOTS.includes(name)){
    const shot=await page.screenshot({path:`${dir}/${viewport}-${name}-${theme}.png`,animations:'disabled'});
    await page.evaluate(()=>draw());
    assert.ok(shot.equals(await page.screenshot({animations:'disabled'})),`${label}: redrawing changes the pixels`);
   }
  }
  console.log(`  ${viewport}: ${Object.entries(counts).map(([k,v])=>k+' '+v).join('; ')}`);
  check(`${viewport}: at 1x, landing, mid, 6.5x and 9x in three themes, curated discs draw at full size with their names, small discs fill the gaps unnamed at 1x and named deep in, nothing touches, and a redraw is identical`);

  // Hover lifts the art 6% from its size and lets it back down to exactly that size.
  if(viewport==='desktop'){
   for(const name of ['far','max']){
    await show(page,CAMERAS[name],'midnight');
    const at=await page.evaluate(()=>{
     const {width:w,height:h}=mapViewport,map=canvas.getBoundingClientRect();
     const g=mapClusters.filter(g=>g.large&&!g.members.includes(selected)).sort((a,b)=>Math.hypot(a.x-w/2,a.y-h/2)-Math.hypot(b.x-w/2,b.y-h/2))[0];
     return {key:g.key,x:map.left+g.x,y:map.top+g.y};
    });
    const size=()=>page.evaluate(key=>document.querySelector(`[data-cluster="${key}"] .disc-art`).getBoundingClientRect().width,at.key);
    const rest=76*await page.evaluate(()=>AtlasGroups.artRoom(zoom));
    await page.mouse.move(at.x,at.y);await page.waitForTimeout(450);
    const lifted=await size();
    await page.mouse.move(1,1);await page.waitForTimeout(900);
    const after=await size();
    assert.ok(Math.abs(lifted-rest*1.06)<1.5,`${name}: hovered art is ${lifted.toFixed(1)}px, not ${(rest*1.06).toFixed(1)}px`);
    assert.ok(Math.abs(after-rest)<.6,`${name}: after hover the art is ${after.toFixed(1)}px, not ${rest.toFixed(1)}px`);
   }
   check('desktop: hover lifts a curated disc 6% and returns it to exactly its size, at 1x and 9x');
  }

  // Fly in from 1x to 9x and back out, frame by frame. Curated discs grow (then shrink) smoothly.
  // A small disc or name never pops: arriving or leaving, it takes the full fade (GAP_FADE ms) to go
  // from nothing to full strength, and a name's strength otherwise follows the zoom alone. Nothing
  // touches on any frame.
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
   const sign=Math.sign(to-from);let steps=0,named=0,worst=0,shown=0;
   for(let i=0;i<frames.length;i++){
    const f=frames[i],label=`${viewport} ${from}x→${to}x frame ${i+1} (${f.zoom.toFixed(2)}x)`;
    named+=clean(f,label,{arts:false});shown=Math.max(shown,f.gaps.filter(g=>g.label>0).length);
    if(!i)continue;
    const p=frames[i-1],before=new Map(p.marks.filter(m=>m.large&&!m.moving).map(m=>[m.key,m]));
    for(const m of f.marks.filter(m=>m.large&&!m.moving)){
     const q=before.get(m.key);if(!q||q.selected!==m.selected)continue;
     assert.ok((m.art.w-q.art.w)*sign>=-.05,`${label}: ${m.name} ${sign>0?'shrinks':'grows'}`);
    }
    // Small discs: present in both frames, or arriving/leaving from nothing.
    const fade=(f.clock-p.clock)/GAP_FADE+1e-6,zoomed=Math.abs(f.labelAlpha-p.labelAlpha)+3e-4;
    const was=new Map(p.gaps.map(g=>[g.key,g])),now=new Map(f.gaps.map(g=>[g.key,g]));
    for(const key of new Set([...was.keys(),...now.keys()])){
     const a=was.get(key)||{art:0,label:0},b=now.get(key)||{art:0,label:0};
     // Every small disc is recorded, drawn or off screen; one missing has fully faded (or not begun).
     const art=Math.abs(b.art-a.art),name=Math.abs(b.label-a.label);steps++;worst=Math.max(worst,name);
     assert.ok(art<=fade,`${label}: ${b.name||a.name} pops in or out (${a.art.toFixed(2)} → ${b.art.toFixed(2)} in ${(f.clock-p.clock).toFixed(0)}ms)`);
     assert.ok(name<=fade+zoomed,`${label}: ${b.name||a.name}'s name pops (${a.label.toFixed(2)} → ${b.label.toFixed(2)} in ${(f.clock-p.clock).toFixed(0)}ms)`);
    }
    // A complete view's dot names fade too: a .2s CSS ease, whose steepest rate is under 1.7x linear.
    // (A marker mid-regroup hides an obsolete name at once, as every curated name does, so it never
    // collides with a neighbor that is arriving: those are left out.)
    // Markers fading in as a whole (arriving, as curated discs do) are left out too.
    const dots=new Map(p.marks.filter(m=>m.small&&!m.moving&&!m.arriving).map(m=>[m.key,m.own])),eased=1.7*(f.clock-p.clock)/200+zoomed+.02;
    for(const m of f.marks.filter(m=>m.small&&!m.moving&&!m.arriving&&dots.has(m.key)))assert.ok(Math.abs(m.own-dots.get(m.key))<=eased,`${label}: ${m.name}'s dot name pops (${dots.get(m.key)} → ${m.own}, ${(f.clock-p.clock).toFixed(0)}ms, ${f.labelAlpha.toFixed(3)}, allowed ${eased.toFixed(3)})`);
   }
   if(from===1)assert.ok(shown>0,`${viewport} 1x→9x: no small name ever shows`);
   await settled(page);
   const end=await scene(page);sizes(end,`${viewport} after ${from}x→${to}x`);clean(end,`${viewport} after ${from}x→${to}x`);
   console.log(`  ${viewport} ${from}x→${to}x: ${frames.length} frames, ${steps} small-disc steps, largest name step ${worst.toFixed(3)}, ${named} names checked`);
  }
  check(`${viewport}: flying 1x→9x and 9x→1x, curated discs grow and shrink smoothly, small discs and names fade without popping, and nothing touches on any frame`);

  // Zoom in on a cluster of small discs: their names fade in as the camera closes in, from nothing.
  await show(page,{zoom:6.5,at:[.5,.5]},'midnight');
  const target=await page.evaluate(()=>{
   const named=mapGaps.filter(g=>g.drawn&&g.strength>0),{width:w,height:h}=mapViewport;
   // The named small disc with the most named neighbors within 160px, nearest the center.
   const score=g=>named.filter(o=>Math.hypot(o.x-g.x,o.y-g.y)<160).length*1e4-Math.hypot(g.x-w/2,g.y-h/2);
   const g=named.sort((a,b)=>score(b)-score(a))[0];
   const {width,height}=mapViewport,area=AtlasLayout.bounds(width,height,true);
   return {id:g.id,name:g.name,neighbors:named.filter(o=>o!==g&&Math.hypot(o.x-g.x,o.y-g.y)<160).map(o=>o.id),
    world:{x:(g.x-area.left-pan.x)/zoom,y:(area.bottom+pan.y-g.y)/zoom}};
  });
  assert.ok(target.neighbors.length>=1,`${viewport}: no cluster of named small discs`);
  const approach=await page.evaluate(async([target,SCENE])=>{
   const read=new Function('return ('+SCENE+')()'),out=[],{width:w,height:h}=mapViewport,area=AtlasLayout.bounds(w,h,true);
   for(let i=0;i<=100;i++){
    const z=2*(6.5/2)**(i/100);
    // Keep the cluster at the center of the map as the camera closes in.
    const t=boundedCamera({zoom:z,x:w/2-area.left-target.world.x*z,y:h/2-area.bottom+target.world.y*z});zoom=t.zoom;pan={x:t.x,y:t.y};draw();
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const f=read();out.push({zoom:f.zoom,cluster:[target.id,...target.neighbors].map(id=>f.gaps.find(g=>g.key===id)?.label??null),frame:f});
   }
   return out;
  },[target,SCENE.toString()]);
  const labelFrom=await page.evaluate(()=>AtlasGroups.GAP.labelFrom);
  for(let i=0;i<approach.length;i++){
   const f=approach[i],label=`${viewport} closing on ${target.name} (${f.zoom.toFixed(2)}x)`;
   clean(f.frame,label,{arts:false});
   if(f.zoom<labelFrom)assert.ok(f.cluster.every(a=>!a),`${label}: a name shows before ${labelFrom}x`);
   if(i){
    const p=approach[i-1].frame,allowed=(f.frame.clock-p.clock)/GAP_FADE+Math.abs(f.frame.labelAlpha-p.labelAlpha)+3e-4;
    for(let k=0;k<f.cluster.length;k++){
     const a=approach[i-1].cluster[k]??0,b=f.cluster[k]??0;
     assert.ok(Math.abs(b-a)<=allowed,`${label}: a name in the cluster pops (${a.toFixed(2)} → ${b.toFixed(2)})`);
    }
   }
  }
  await settled(page);
  const close=await scene(page),last=[target.id,...target.neighbors].map(id=>close.gaps.find(g=>g.key===id));
  assert.ok(last.filter(g=>g?.label===1).length>=2,`${viewport}: the cluster's names do not all show once close`);
  console.log(`  ${viewport}: closing on ${target.name} and ${target.neighbors.length} neighbors, names from ${approach.find(f=>f.cluster.some(a=>a>0))?.zoom.toFixed(2)}x`);
  check(`${viewport}: closing in on a cluster of small discs, their names fade in from nothing with no pop and no overlap`);
  await page.context().close();
 }

 // Determinism: two fresh pages draw the same camera identically: every curated disc and its name,
 // every small disc, its spot and its name's strength, and the canvas to the pixel.
 for(const viewport of Object.keys(VIEWPORTS))for(const name of ['far','mid','deep','max']){
  const runs=[];
  for(let i=0;i<2;i++){
   const page=await open(viewport);await show(page,CAMERAS[name],'midnight');
   runs.push({scene:still(await scene(page)),canvas:(await page.evaluate(CANVAS)).hash});
   await page.context().close();
  }
  assert.deepEqual(runs[1],runs[0],`${viewport} ${name}: same render`);
 }
 check('Determinism: fresh pages at 1x, 3x, 6.5x and 9x render the same curated discs, small discs, names and canvas pixels, desktop and phone');

 assert.deepEqual(errors,[],'page errors');
 console.log(`\n${checks.length} checks passed. Screenshots: ${dir}/`);
}finally{await browser.close();server.close();}
