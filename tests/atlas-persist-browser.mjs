// Readable means clickable on the Atlas, in a real browser. A disc the map draws at a size you can read
// lands a click on its art and on its name, whether it is a marker or a small disc the canvas draws; it
// stays where it is while the pointer reaches for it (no regroup under a moving pointer or one resting on
// a readable disc), and a disc a new set would drop stays under the pointer instead of vanishing, then
// fades once the pointer has gone. Desktop mouse and phone touch.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/atlas-persist-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');

const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const file=url.pathname==='/'?'web/index.html':'public'+url.pathname;
 if(file.includes('..')){res.writeHead(400);res.end();return;}
 if(url.pathname.startsWith('/api/')){res.writeHead(503,{'Content-Type':'application/json'});res.end('{"error":"Frontend test: backend excluded"}');return;}
 try{
  const data=fs.readFileSync(file);
  res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH});
const checks=[],errors=[];
const check=label=>{checks.push(label);console.log('ok -',label);};
const VIEWPORTS={desktop:{width:1440,height:900},phone:{width:390,height:844}};

async function open(viewport){
 const context=await browser.newContext({viewport:VIEWPORTS[viewport],hasTouch:viewport==='phone'});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 await page.goto(base);
 if(viewport==='phone')await page.locator('#mapTab').click();
 await page.waitForFunction(()=>filtered.length>0&&mapClusters.length>0);
 await page.evaluate(()=>document.fonts.ready);
 return page;
}
// Settled: the level is current, nothing is arriving or retiring, every small disc has finished fading.
const settled=async page=>{
 await page.waitForFunction(()=>!cameraTween&&groupCache&&groupCache.items===filtered&&groupCache.level===AtlasGroups.level(zoom,groupCache.level)&&
  !document.querySelector('#mapMarkers').classList.contains('is-regrouping')&&!document.querySelector('.marker-position.is-retiring,.marker-position.is-new'));
 await page.waitForTimeout(450);
 await page.evaluate(()=>draw());
 await page.waitForFunction(()=>mapGaps.every(g=>g.on&&g.art===1&&g.rest)&&[...gapFade.values()].every(e=>e.on));
 await page.waitForTimeout(150);
};
// A camera: zoom about a point (fractions of the map), the pointer parked in the corner, nothing selected.
async function show(page,zoomTo,at=[.55,.5]){
 await page.mouse.move(1,1);
 await page.evaluate(([z,at])=>{
  selected=null;closeDetail(false);document.querySelector('#search').value='';selectedBrands.clear();selectedTypes.clear();
  zoom=1;pan={x:0,y:0};filter();
  if(z>1){const {width:w,height:h}=mapViewport;const t=boundedCamera(zoomDestination(z,{x:w*at[0],y:h*at[1]}));zoom=t.zoom;pan={x:t.x,y:t.y};}
  draw();
 },[zoomTo,at]);
 await settled(page);
}
const mapOrigin=page=>page.evaluate(()=>{const r=canvas.getBoundingClientRect();return {x:r.left,y:r.top};});
// Where the page's own chrome (not the map) would take a click: the point must be the map's to be fair.
const onMap=(page,p)=>page.evaluate(({x,y})=>{
 const hit=document.elementFromPoint(x,y);
 return !!hit&&(hit===canvas||!!hit.closest('#mapMarkers'))&&x>0&&y>0&&x<innerWidth&&y<innerHeight;
},p);
// The readable discs of a kind whose art the map itself receives a pointer on (none under its chrome).
const mapOwned=async(page,kind)=>{
 const out=[];
 for(const r of await page.evaluate(READABLE))if(r.kind===kind&&await onMap(page,r.art)&&await onMap(page,{x:r.label.x,y:r.label.y})&&r.art.x>360&&r.art.y>220&&r.art.y<(await page.evaluate(()=>innerHeight))-200)out.push(r);
 return out;
};
const reset=async page=>{await page.evaluate(()=>{selected=null;closeDetail(false);closeCluster();});await page.mouse.move(1,1);await page.waitForTimeout(80);};

// What a viewer can read: each curated disc's name as the DOM sets it, each small disc's as the canvas
// does, with the disc each stands for. Screen points for the middle of its art and of its name.
const READABLE=()=>{
 const map=canvas.getBoundingClientRect(),out=[];
 for(const g of mapClusters){
  const node=markerNodes.get(g.key);if(!node||node.position.inert)continue;
  const name=node.querySelector('.marker-name'),style=getComputedStyle(name);
  if(style.visibility==='hidden'||style.display==='none'||+style.opacity<.9||+getComputedStyle(node.position).opacity<.9)continue;
  const r=name.getBoundingClientRect(),art=node.querySelector('.disc-art').getBoundingClientRect();
  out.push({kind:'marker',id:g.key,name:g.lead.catalogName||g.lead.name,art:{x:art.left+art.width/2,y:art.top+art.height/2},label:{x:r.left+r.width/2,y:r.top+r.height/2,box:{x:r.left-map.left,y:r.top-map.top,w:r.width,h:r.height}}});
 }
 for(const e of mapGaps){
  if(!e.drawn||!e.on||e.art<1||e.strength<AtlasGroups.GAP.named||!e.box)continue;
  out.push({kind:'gap',id:e.id,name:e.name,art:{x:map.left+e.x,y:map.top+e.y},label:{x:map.left+e.box.x+e.box.w/2,y:map.top+e.box.y+e.box.h/2,box:e.box}});
 }
 return out;
};
const PICK=([x,y])=>{const t=AtlasTargets.pick(mapTargets(),x,y);return t&&{kind:t.kind,id:t.kind==='marker'?t.ref.key:t.ref.id,pinned:!!t.ref.pinned};};
// A click lands on `disc`: it opens that disc's detail.
async function clickLands(page,point,disc,how,label){
 await reset(page);
 await page.mouse.move(point.x,point.y);
 if(how==='tap')await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);
 await page.waitForFunction(()=>selected!==null,null,{timeout:2500}).catch(()=>{});
 const got=await page.evaluate(()=>selected&&selected.id);
 assert.equal(got,disc,`${label}: a click at (${Math.round(point.x)}, ${Math.round(point.y)}) selected ${got}, not ${disc}`);
}


async function completeDot(page,z,brand){
 await show(page,1);
 await page.evaluate(([brand,z])=>{
  document.querySelector('#collection').value='all';
  if(brand)selectedBrands.add(brand);filter();
  const {width:w,height:h}=mapViewport,t=boundedCamera(zoomDestination(z,{x:w*.55,y:h*.5}));
  zoom=t.zoom;pan={x:t.x,y:t.y};draw();
 },[brand,z]);
 await settled(page);
 const ids=await page.evaluate(()=>groupCache.groups.filter(g=>!g.large&&!g.hidden&&g.complete&&g.members.length===1).map(g=>g.key));
 for(const id of ids){
  await page.mouse.move(1,1);
  await page.evaluate(id=>{
   const g=groupCache.groups.find(g=>g.key===id),{width:w,height:h}=mapViewport,a=AtlasLayout.bounds(w,h,true);
   const t=boundedCamera({zoom,x:w*.55-a.left-g.pos.x*a.width*zoom-(g.markerOffset?.x||0),y:h*.5-a.bottom+g.pos.y*a.height*zoom-(g.markerOffset?.y||0)});
   pan={x:t.x,y:t.y};draw();
  },id);
  await settled(page);
  const dot=await page.evaluate(id=>{
   const g=mapClusters.find(g=>g.key===id),n=markerNodes.get(id);
   if(!g||g.large||!n?.classList.contains('is-dot')||n.position.inert)return;
   const m=canvas.getBoundingClientRect(),art=n.querySelector('.disc-art').getBoundingClientRect(),label=n.querySelector('.marker-name').getBoundingClientRect();
   const cx=art.left+art.width/2,cy=art.top+art.height/2,r=art.width/2,targets=mapTargets();
   for(let i=0;i<32;i++){
    const angle=-Math.PI/2+i*Math.PI/16,x=cx+Math.cos(angle)*r*.9,y=cy+Math.sin(angle)*r*.9,hit=document.elementFromPoint(x,y);
    if(x<20||x>innerWidth-20||y<150||y>innerHeight-160||!hit||!(hit===canvas||hit.closest('#mapMarkers')))continue;
    if(x>=label.left&&x<=label.right&&y>=label.top&&y<=label.bottom)continue;
    if(targets.some(t=>t.ref!==g&&AtlasTargets.reach(t,x-m.left,y-m.top)))continue;
    return {id:g.key,name:g.lead.name,x,y,r,offset:r*.9};
   }
  },id);
  if(dot)return dot;
 }
}

try{

 // Complete-view dots: click visible plastic at 90% of its DOM-measured radius, outside the name.
 // The denser phone layout retains Innova dots at 6.5x/9x; desktop Innova promotes them all.
 const dotFailures=[];
 for(const [viewport,brand,z] of [['desktop','Innova',3],['phone','Innova',6.5],['phone','Innova',9],['desktop',null,9]]){
  const page=await open(viewport),label=viewport+' '+(brand||'unfiltered')+' '+z+'x';
  const dot=await completeDot(page,z,brand);
  assert.ok(dot,label+': a drawn complete-view dot with unobstructed plastic outside its name');
  assert.ok(dot.offset>22,label+': the point is beyond the legacy 22px hit circle');
  await page.mouse.click(dot.x,dot.y);
  await page.waitForFunction(()=>selected!==null,null,{timeout:2500}).catch(()=>{});
  const got=await page.evaluate(()=>selected?.id??null);
  if(got!==dot.id)dotFailures.push({label,disc:dot.id,selected:got,offset:dot.offset});
  else check(label+': '+dot.name+' selects at 0.9 of its drawn radius');
  await page.context().close();
 }
 assert.deepEqual(dotFailures,[],'complete-view dot off-centre clicks select their discs');

 for(const viewport of ['desktop','phone']){
  const page=await open(viewport),how=viewport==='phone'?'tap':'click';
  const cameras=viewport==='desktop'?[['1x',1],['3x',3],['6.5x',6.5]]:[['1x',1],['3x',3]];
  for(const [name,z] of cameras){
   await show(page,z);
   const readable=await page.evaluate(READABLE),label=`${viewport} ${name}`;
   const markers=readable.filter(r=>r.kind==='marker'),gaps=readable.filter(r=>r.kind==='gap');
   assert.ok(markers.length>=3,`${label}: ${markers.length} readable curated discs`);
   // A phone's room is mostly curated discs; small discs come and go with the room.
   if(viewport==='desktop')assert.ok(gaps.length>=1,`${label}: ${gaps.length} readable small discs`);
   // Layout's boxes are what the DOM draws: the target's name box holds the name the viewer reads.
   const boxes=await page.evaluate(()=>mapTargets().filter(t=>t.kind==='marker'&&t.label).map(t=>({key:t.ref.key,box:t.label,node:(()=>{const n=markerNodes.get(t.ref.key).querySelector('.marker-name');const r=n.getBoundingClientRect(),m=canvas.getBoundingClientRect();return {x:r.left-m.left,y:r.top-m.top,w:r.width,h:r.height,hidden:getComputedStyle(n).visibility==='hidden'};})()})));
   for(const b of boxes.filter(b=>!b.node.hidden)){
    // The measured box is the name plus a margin all round: the drawn name lies inside it.
    assert.ok(b.node.x>=b.box.x-1&&b.node.y>=b.box.y-1&&b.node.x+b.node.w<=b.box.x+b.box.w+1&&b.node.y+b.node.h<=b.box.y+b.box.h+1,`${label}: ${b.key}'s drawn name ${JSON.stringify(b.node)} is not inside its target ${JSON.stringify(b.box)}`);
   }
   // A click selects, which re-curates: each disc is found again, where it is now, just before its click.
   const fresh=async r=>(await page.evaluate(READABLE)).find(x=>x.kind===r.kind&&x.id===r.id);
   const fair=async r=>!!r&&await onMap(page,r.art)&&await onMap(page,{x:r.label.x,y:r.label.y});
   const run=async(list,max,what)=>{
    let n=0;
    for(const first of list){
     if(n>=max)break;
     await reset(page);await settled(page);
     let r=await fresh(first);if(!await fair(r))continue;
     await clickLands(page,r.art,r.id,how,`${label}: ${what} ${r.name}'s art`);
     await reset(page);await settled(page);
     r=await fresh(first);if(!await fair(r))continue;
     await clickLands(page,{x:r.label.x,y:r.label.y},r.id,how,`${label}: ${what} ${r.name}'s name`);
     n++;
    }
    return n;
   };
   const tested=await run(markers,3,'curated disc');
   assert.ok(tested>=2,`${label}: only ${tested} curated discs to click`);
   const gapTested=await run(gaps,3,'small disc');
   if(gaps.length)assert.ok(gapTested>=1,`${label}: no small disc to click`);
   check(`${viewport} ${name}: ${tested} curated discs and ${gapTested} small discs land a ${how} on their art and on their name`);
  }
  await page.context().close();
 }

 // The pointer says so: a disc on the canvas shows the pointer cursor, empty map does not.
 {
  const page=await open('desktop');await show(page,1);
  const gap=(await page.evaluate(READABLE)).find(r=>r.kind==='gap');
  await page.mouse.move(gap.art.x,gap.art.y);
  assert.equal(await page.evaluate(()=>document.querySelector('#map').classList.contains('is-over-disc')),true);
  assert.equal(await page.evaluate(()=>getComputedStyle(canvas).cursor),'pointer','over a small disc');
  const blank=await page.evaluate(()=>{const {width:w,height:h}=mapViewport,m=canvas.getBoundingClientRect(),t=mapTargets();
   for(let y=h*.2;y<h*.8;y+=17)for(let x=w*.1;x<w*.9;x+=17)if(!AtlasTargets.pick(t,x,y)&&document.elementFromPoint(m.left+x,m.top+y)===canvas)return {x:m.left+x,y:m.top+y};});
  await page.mouse.move(blank.x,blank.y);
  assert.equal(await page.evaluate(()=>document.querySelector('#map').classList.contains('is-over-disc')),false);
  check('desktop: the pointer cursor shows over a small disc on the canvas and not over empty map');
  await page.context().close();
 }

 // The regroup waits for a pointer that is reaching for a disc. Zoom just short of a level boundary
 // (level 2 -> 3 falls at 2^(2.5/3) = 1.78x), nudge across it, and watch when the level changes.
 {
  let page=await open('desktop');
  const nudge=async()=>{await page.mouse.wheel(0,-35);};
  const levelAfter=async ms=>{await page.waitForTimeout(ms);return page.evaluate(()=>groupCache.level);};
  // Each scene starts from a fresh page, so the level is the one the zoom asks for, not one held by hysteresis.
  const lead=async z=>{if(lead.used){await page.context().close();page=await open('desktop');}lead.used=true;await show(page,z);};
  // 1. A pointer that keeps moving holds the level; once it stops, the level changes.
  await lead(1.74);
  assert.equal(await page.evaluate(()=>groupCache.level),2);
  const blank=await page.evaluate(()=>{const {width:w,height:h}=mapViewport,m=canvas.getBoundingClientRect(),t=mapTargets();
   for(let y=h*.25;y<h*.7;y+=19)for(let x=w*.2;x<w*.8;x+=19)if(!AtlasTargets.reach({x:0,y:0,r:0,label:null},x,y)&&t.every(k=>!AtlasTargets.reach(k,x,y,60))&&document.elementFromPoint(m.left+x,m.top+y)===canvas)return {x:m.left+x,y:m.top+y};});
  await page.mouse.move(blank.x,blank.y);await page.waitForTimeout(300);
  await nudge();
  const t0=Date.now();
  let moved=0;
  while(Date.now()-t0<900){await page.mouse.move(blank.x+(moved%2?4:-4),blank.y);moved++;await page.waitForTimeout(60);assert.equal(await page.evaluate(()=>groupCache.level),2,'the level holds while the pointer moves');}
  assert.ok(await page.evaluate(()=>zoom>1.78),'the zoom crossed the boundary');
  await page.waitForFunction(()=>groupCache.level===3,null,{timeout:2500});
  check('desktop: a regroup due while the pointer moves waits until the pointer has stopped, then happens');

  // 2. The pointer resting on a readable disc holds it for the hover time, but no longer.
  await lead(1.74);
  const disc=(await mapOwned(page,'marker'))[2];
  await page.mouse.move(disc.art.x,disc.art.y);await page.waitForTimeout(300);
  await nudge();const t1=Date.now();
  await page.waitForFunction(()=>zoom>1.78);
  assert.equal(await levelAfter(900),2,'the level holds 900ms on a disc');
  assert.equal(await page.evaluate(()=>groupCache.level),2);
  await page.waitForFunction(()=>groupCache.level===3,null,{timeout:3000});
  const held=Date.now()-t1;
  assert.ok(held>1000&&held<2600,`the level changed ${held}ms after the nudge`);
  check(`desktop: a regroup waits for a pointer resting on a readable disc (${held}ms), and then happens`);

  // 3. Cursor anchoring and the zoom cap hold while it waits: the point under the pointer stays under it.
  await lead(1.74);
  const probe=(await mapOwned(page,'marker')).sort((a,b)=>Math.hypot(a.art.x-720,a.art.y-450)-Math.hypot(b.art.x-720,b.art.y-450))[0];
  const drift=({x,y,wx,wy})=>page.evaluate(({x,y,wx,wy})=>{const m=canvas.getBoundingClientRect(),a=AtlasLayout.bounds(mapViewport.width,mapViewport.height,true);
   return Math.hypot(m.left+a.left+wx*a.width*zoom+pan.x-x,m.top+a.bottom-wy*a.height*zoom+pan.y-y);},{x,y,wx,wy});
  const world=await page.evaluate(({x,y})=>{const m=canvas.getBoundingClientRect(),a=AtlasLayout.bounds(mapViewport.width,mapViewport.height,true);
   return {wx:(x-m.left-a.left-pan.x)/(a.width*zoom),wy:(a.bottom-(y-m.top)+pan.y)/(a.height*zoom)};},probe.art);
  await page.mouse.move(probe.art.x,probe.art.y);await page.waitForTimeout(250);
  for(let i=0;i<4;i++){await nudge();await page.waitForTimeout(40);}
  await page.waitForFunction(()=>!cameraTween);
  const off=await drift({...probe.art,...world});
  assert.ok(off<.5,`the point under the pointer drifts ${off.toFixed(2)}px as the zoom changes`);
  for(let i=0;i<40;i++)await page.mouse.wheel(0,-600);
  await page.waitForFunction(()=>!cameraTween);
  assert.equal(await page.evaluate(()=>zoom),9,'the zoom cap holds');
  check('desktop: cursor anchoring and the 9x cap hold');
  await page.context().close();
 }

 // A disc a new set would drop stays under the pointer, then fades once the pointer has gone.
 {
  const page=await open('desktop');
  const pinCases=[['curated disc',3,'marker'],['small disc',1,'gap']];
  for(const [what,z,kind] of pinCases){
   // Take a readable disc out of the set the way a re-curate would: hidden, and (for a small disc) not in
   // the level's list. Selecting re-curates, so the click and the release are separate runs.
   const drop=async()=>{
    await show(page,z);
    // The map measures its chrome when the pointer enters it, which can re-lay-out: let that finish first.
    await page.mouse.move(700,500);await page.waitForTimeout(250);await page.evaluate(()=>draw());await settled(page);
    const disc=(await mapOwned(page,kind))[1];
    assert.ok(disc,`a ${what} to pin`);
    await page.mouse.move(disc.art.x,disc.art.y);await page.waitForTimeout(200);
    await page.evaluate(([kind,id])=>{
     if(kind==='marker')groupCache.groups.find(g=>g.key===id).hidden=true;
     else groupCache.gaps=groupCache.gaps.filter(g=>g.id!==id);
     draw();
    },[kind,disc.id]);
    return disc;
   };
   // It is still there, on the pointer, a pin; the click lands on it.
   let disc=await drop();
   for(const wait of [0,150,400]){
    await page.waitForTimeout(wait);
    const o=await mapOrigin(page);
    const hit=await page.evaluate(PICK,[disc.art.x-o.x,disc.art.y-o.y]);
    assert.ok(hit&&hit.id===disc.id&&hit.kind===kind,`${what}: after ${wait}ms the pointer is on ${JSON.stringify(hit)}, not ${disc.id}`);
    if(kind==='marker')assert.equal(hit.pinned,true);
   }
   await page.mouse.click(disc.art.x,disc.art.y);
   assert.equal(await page.evaluate(()=>selected&&selected.id),disc.id,`${what}: the click lands on the pinned disc`);
   // The pointer goes: the pin lets go and the disc fades out; it is no longer a target.
   disc=await drop();
   await page.mouse.move(1,1);
   await page.waitForFunction(id=>!mapClusters.some(g=>g.key===id)&&!mapGaps.some(e=>e.id===id&&e.on),disc.id,{timeout:3000});
   await page.waitForFunction(id=>!markerNodes.has(id)&&![...gapFade.values()].some(e=>e.id===id),disc.id,{timeout:3000});
   check(`desktop: a ${what} the new set drops stays under the pointer and lands its click, then fades once the pointer has gone`);
  }

  // A disc merged into a stack: the pointer on it still reaches it; the stack holds it once the pin lets go.
  // (Selecting re-curates, so the click and the release are separate runs.)
  const merge=async()=>{
   await show(page,3);
   await page.mouse.move(700,500);await page.waitForTimeout(250);await page.evaluate(()=>draw());await settled(page);
   const m=(await mapOwned(page,'marker'))[2];
   const heirKey=await page.evaluate(id=>{
    const g=groupCache.groups.find(g=>g.key===id);
    return groupCache.groups.filter(h=>!h.hidden&&h!==g).sort((a,b)=>Math.hypot(a.pos.x-g.pos.x,a.pos.y-g.pos.y)-Math.hypot(b.pos.x-g.pos.x,b.pos.y-g.pos.y))[0].key;
   },m.id);
   await page.mouse.move(m.art.x,m.art.y);await page.waitForTimeout(250);
   await page.evaluate(([id,heir])=>{
    const g=groupCache.groups.find(g=>g.key===id),h=groupCache.groups.find(g=>g.key===heir);
    g.hidden=true;h.joined=[...(h.joined||[]),...g.members];draw();
   },[m.id,heirKey]);
   await page.waitForTimeout(150);
   return {m,heirKey};
  };
  let {m,heirKey}=await merge();
  const o=await mapOrigin(page);
  const hit=await page.evaluate(PICK,[m.art.x-o.x,m.art.y-o.y]);
  assert.ok(hit&&hit.id===m.id,`merged disc: the pointer is on ${JSON.stringify(hit)}, not ${m.id}`);
  await page.mouse.click(m.art.x,m.art.y);
  assert.equal(await page.evaluate(()=>selected&&selected.id),m.id,'a click on the merged disc lands on it');
  ({m,heirKey}=await merge());
  await page.mouse.move(1,1);
  await page.waitForFunction(id=>!markerNodes.has(id),m.id,{timeout:3000});
  const stack=await page.evaluate(([id,heir])=>{const h=mapClusters.find(g=>g.key===heir);return h&&{has:h.members.some(d=>d.id===id),count:markerNodes.get(heir).badge.textContent};},[m.id,heirKey]);
  assert.ok(stack&&stack.has&&+stack.count>=2,`the stack ${heirKey} holds the merged disc: ${JSON.stringify(stack)}`);
  check('desktop: a disc merged into a stack stays reachable under the pointer, then its stack holds it');
  await page.context().close();
 }

 // Small zoom nudges across a level boundary, a pointer on a readable disc: the disc never leaves the
 // pointer until the regroup happens, and is reachable (at its new spot) after it.
 {
  const page=await open('desktop');
  for(const [kind,z] of [['marker',1.74],['gap',1.74],['marker',2.6],['gap',2.6]]){
   await show(page,z);
   const pool=await mapOwned(page,kind);
   for(const disc of pool.slice(0,2)){
    await show(page,z);
    const target=(await page.evaluate(READABLE)).find(r=>r.kind===kind&&r.id===disc.id);if(!target)continue;
    await page.mouse.move(target.art.x,target.art.y);await page.waitForTimeout(250);
    const o=await mapOrigin(page);
    await page.evaluate(([x,y,id])=>{
     window.__track={lost:[],frames:0};
     const frame=()=>{const t=AtlasTargets.pick(mapTargets(),x,y);const ok=t&&(t.kind==='marker'?t.ref.members.some(d=>d.id===id):t.ref.id===id);__track.frames++;if(!ok)__track.lost.push(Math.round(performance.now()));__track.raf=requestAnimationFrame(frame);};
     frame();
    },[target.art.x-o.x,target.art.y-o.y,disc.id]);
    for(let i=0;i<3;i++){await page.mouse.wheel(0,-25);await page.waitForTimeout(70);}
    await page.waitForTimeout(500);
    const during=await page.evaluate(()=>({...__track,level:groupCache.level}));
    assert.deepEqual(during.lost,[],`${kind} ${disc.name} at ${z}x: the pointer lost it on ${during.lost.length} of ${during.frames} frames`);
    await page.waitForFunction(()=>!cameraTween&&groupCache.level===AtlasGroups.level(zoom,groupCache.level),null,{timeout:4000});
    await page.waitForTimeout(500);
    await page.evaluate(()=>cancelAnimationFrame(__track.raf));
   }
  }
  check('desktop: small zoom nudges across a level boundary never take a readable disc from under the pointer');
  await page.context().close();
 }
}finally{
 await browser.close();server.close();
}
assert.deepEqual(errors,[],'no page errors');
console.log(`PASS: ${checks.length} checks.`);
