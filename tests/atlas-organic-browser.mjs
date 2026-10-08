// The main Atlas's organic overview in a real browser: discs rest near their atlas points like discs
// tossed on a table, tipped a little, with room around each one. Every shown disc stays within its
// reach of its true (computed, untouched) position; discs, names and the map's controls never touch;
// a disc's neighbors stay its neighbors; the visible set follows the documented walk (selection
// order, coverage then depth, the cap); and the same data always lands the same way, to the pixel.
// Desktop and phone, three themes, the full atlas and three filtered subsets (Putter: still an
// overview; Axiom: complete on desktop, where every match shows; a "buzzz" search: complete
// everywhere). See docs/atlas-organic.md.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/atlas-organic-browser.mjs   (shots: outputs/atlas-organic/)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');

const dir='outputs/atlas-organic';
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
const SCENARIOS={
 full:'',
 putter:"type='putter';",
 axiom:"selectedBrands.add('Axiom');",
 buzzz:"document.querySelector('#search').value='buzzz';",
};

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
// The full atlas or a filtered subset at 1x, nothing selected, no hover.
async function show(page,scenario,theme){
 await page.mouse.move(1,1);
 await page.evaluate(([scenario,theme])=>{
  document.querySelector(`[data-theme-choice="${theme}"]`).click();
  selected=null;closeDetail(false);
  document.querySelector('#search').value='';selectedBrands.clear();type='all';
  new Function(scenario)();zoom=1;pan={x:0,y:0};filter();
 },[SCENARIOS[scenario],theme]);
 await settled(page);
}
// Everything shown, in map pixels: where each disc is drawn and where its data puts it.
const layout=page=>page.evaluate(()=>{
 const map=document.querySelector('#map').getBoundingClientRect(),{width:w,height:h}=mapViewport,area=AtlasLayout.bounds(w,h,true);
 const rect=n=>{const r=n.getBoundingClientRect();return {x:r.left-map.left,y:r.top-map.top,w:r.width,h:r.height};};
 const ratio=zoom/2**(groupCache.level/3),rank=new Map(atlasPriority().map((d,i)=>[d.id,i]));
 const order=(a,b)=>(rank.get(a.id)??Infinity)-(rank.get(b.id)??Infinity)||a.name.localeCompare(b.name)||(a.brand||'').localeCompare(b.brand||'')||a.id.localeCompare(b.id);
 const featured=new Set((window.DiscAtlasFeatured||[]).map(d=>d.id));
 const items=mapClusters.map(g=>{
  const node=markerNodes.get(g.key),art=node.querySelector(g.large?'.disc-art':'.map-dot'),box=rect(art),name=node.querySelector('.marker-name');
  const shown=shownPosition(g.key),own=groupCache.groups.find(x=>x.key===g.key).members;
  return {key:g.key,name:g.lead.name,score:score(g.lead),large:g.large,featured:featured.has(g.key),
   center:{x:box.x+box.w/2,y:box.y+box.h/2},
   truth:{x:area.left+g.pos.x*area.width*zoom+pan.x,y:area.bottom-g.pos.y*area.height*zoom+pan.y},
   untouched:shown.x===g.pos.x&&shown.y===g.pos.y,
   reach:groupCache.footprints.get(g.key).radius*AtlasGroups.ORGANIC.reach,
   region:Math.floor(g.px*ratio/AtlasGroups.ORGANIC.region)+':'+Math.floor(-g.py*ratio/AtlasGroups.ORGANIC.region),
   leadsOwn:own.every(m=>order(g.lead,m)<=0),members:g.members.map(m=>m.id),rank:rank.get(g.key)??Infinity,
   boxes:[box,...g.large&&getComputedStyle(name).visibility!=='hidden'&&getComputedStyle(name).opacity!=='0'?[rect(name)]:[]],
   transform:node.position.style.transform,tilt:node.style.getPropertyValue('--tilt')+' '+node.style.getPropertyValue('--tip')};
 });
 const chrome=[...document.querySelectorAll('.explore-tools,.map-caption,.map-toolbar,.map-controls,#coachButton')]
  .filter(n=>n.checkVisibility({visibilityProperty:true})).map(rect).filter(b=>b.w&&b.h);
 return {items,chrome,map:{w:map.width,h:map.height},zoom,cap:organicOptions(area,w,h,groupCache).cap,
  rated:filtered.filter(d=>d.speed!=null).length,complete:groupCache.groups.some(g=>g.complete),
  // Every disc a shown group carries, on screen or off: its own members and any that joined it.
  carried:groupCache.groups.filter(g=>!g.hidden).flatMap(g=>[...g.members,...g.joined||[]].map(d=>d.id))};
});
const touch=(a,b)=>a.x<b.x+b.w-.5&&b.x<a.x+a.w-.5&&a.y<b.y+b.h-.5&&b.y<a.y+a.h-.5;
const near=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function verify(view,label,{chrome=true}={}){
 const {items}=view;
 assert.ok(items.length,label+': discs show');
 for(const d of items){
  assert.ok(d.untouched,`${label}: ${d.name} keeps its computed atlas position`);
  const off=near(d.center,d.truth);
  assert.ok(off<=d.reach+.75,`${label}: ${d.name} rests ${off.toFixed(1)}px from its point (reach ${d.reach.toFixed(1)})`);
 }
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++)for(const a of items[i].boxes)for(const b of items[j].boxes)
  assert.ok(!touch(a,b),`${label}: ${items[i].name} and ${items[j].name} touch`);
 if(chrome)for(const d of items)for(const box of d.boxes){
  assert.ok(box.x>=0&&box.y>=0&&box.x+box.w<=view.map.w&&box.y+box.h<=view.map.h,`${label}: ${d.name} stays inside the map`);
  for(const c of view.chrome)assert.ok(!touch(box,c),`${label}: ${d.name} clears the controls`);
 }
 // Curation: the cap, no duplicates, each lead its group's first disc in selection order.
 assert.ok(items.length<=view.cap,`${label}: ${items.length} shown, cap ${view.cap}`);
 const ids=items.flatMap(d=>d.members);
 assert.equal(new Set(ids).size,ids.length,`${label}: no disc shows twice`);
 assert.ok(items.every(d=>d.leadsOwn),`${label}: every shown disc leads its group in selection order`);
 if(view.complete){
  assert.equal(new Set(view.carried).size,view.carried.length,`${label}: no disc is carried twice`);
  assert.equal(view.carried.length,view.rated,`${label}: a complete view shows every match`);
 }
 else assert.ok(items.every(d=>d.large),`${label}: an overview shows no dots`);
}

try{
 const neighborhoods={};
 for(const viewport of Object.keys(VIEWPORTS)){
  const page=await open(viewport);
  for(const theme of THEMES)for(const scenario of Object.keys(SCENARIOS)){
   await show(page,scenario,theme);
   const view=await layout(page),label=`${viewport} ${scenario} ${theme}`;
   verify(view,label);
   assert.equal(view.complete,view.rated<=view.cap,`${label}: complete exactly when every match fits the cap`);
   if(scenario==='buzzz'||scenario==='axiom'&&viewport==='desktop')assert.ok(view.complete,label+' is a complete view');
   if(scenario==='full'&&theme==='midnight')neighborhoods[viewport]=view;
   await page.screenshot({path:`${dir}/${viewport}-${scenario}-${theme}.png`});
  }
  check(`${viewport}: full atlas, Putter, Axiom and a search in three themes rest within reach, touch nothing and follow the walk`);
  await page.context().close();
 }

 // Curation on the full atlas: the featured list leads. A disc from outside it shows either as its
 // region's coverage disc (no earlier disc of its region shows) or because every featured disc was
 // tried first and they did not fill the cap (the exact walk is pinned in tests/atlas-organic.mjs).
 for(const [viewport,view] of Object.entries(neighborhoods)){
  const featured=view.items.filter(d=>d.featured).length;
  assert.ok(featured/view.items.length>=.75,`${viewport}: ${featured} of ${view.items.length} shown discs are featured`);
  for(const d of view.items.filter(d=>!d.featured))
   assert.ok(!view.items.some(o=>o.region===d.region&&o.rank<d.rank)||featured<view.cap,`${viewport}: ${d.name} shows by coverage or after every featured disc`);
  console.log(`  ${viewport}: ${view.items.length} shown (cap ${view.cap}), ${featured} featured; others: ${view.items.filter(d=>!d.featured).map(d=>d.name).join(', ')||'none'}`);
 }
 check('Full atlas: featured discs lead; others show by coverage or after every featured disc; the cap holds');

 // Neighbors stay neighbors: each disc's nearest shown disc, as drawn, is among its three nearest by
 // data, and the stable, neutral and understable neighborhoods read the same as their data.
 for(const [viewport,view] of Object.entries(neighborhoods)){
  const {items}=view;
  for(const d of items){
   const drawn=items.filter(o=>o!==d).sort((a,b)=>near(a.center,d.center)-near(b.center,d.center))[0];
   const truth=items.filter(o=>o!==d).sort((a,b)=>near(a.truth,d.truth)-near(b.truth,d.truth)).slice(0,3);
   assert.ok(truth.includes(drawn),`${viewport}: ${d.name}'s nearest disc ${drawn.name} is one of its data neighbors`);
  }
  for(const [band,test] of [['understable',s=>s<40],['neutral',s=>s>=40&&s<=60],['overstable',s=>s>60]]){
   const members=items.filter(d=>test(d.score));
   if(!members.length)continue;
   for(const d of members){
    // Order along the stability axis is kept for any two discs farther apart than both reaches.
    for(const o of items)if(Math.abs(d.truth.x-o.truth.x)>d.reach+o.reach)
     assert.equal(Math.sign(d.center.x-o.center.x),Math.sign(d.truth.x-o.truth.x),`${viewport} ${band}: ${d.name} and ${o.name} keep their order`);
   }
   console.log(`  ${viewport} ${band}: ${members.map(d=>d.name).join(', ')}`);
  }
 }
 check('Neighborhoods: nearest neighbors and stability order are preserved on desktop and phone');

 // Determinism: two fresh pages draw the same data identically, layout and pixels.
 for(const viewport of Object.keys(VIEWPORTS))for(const scenario of ['full','axiom']){
  const runs=[];
  for(let i=0;i<2;i++){
   const page=await open(viewport);await show(page,scenario,'midnight');
   const view=await layout(page);
   runs.push({layout:view.items.map(d=>[d.key,d.transform,d.tilt,d.large]),shot:await page.screenshot({animations:'disabled'})});
   await page.context().close();
  }
  assert.deepEqual(runs[1].layout,runs[0].layout,`${viewport} ${scenario}: same layout`);
  assert.ok(runs[1].shot.equals(runs[0].shot),`${viewport} ${scenario}: same pixels`);
 }
 check('Determinism: fresh renders match exactly, layout and pixels, desktop and phone');

 // The landing view (2.8x on Destroyer, selected) and deep views keep discs and names apart too.
 {
  const page=await open('desktop');
  await page.evaluate(()=>{document.querySelector('[data-theme-choice="midnight"]').click();focusFeatured();});await settled(page);
  let view=await layout(page);
  verify(view,'landing',{chrome:false});
  assert.ok(view.items.some(d=>d.name==='Destroyer'),'The selected disc shows');
  await page.screenshot({path:`${dir}/desktop-landing-midnight.png`});
  for(const z of [5,9]){
   await page.evaluate(z=>{zoom=z;draw();},z);await settled(page);
   view=await layout(page);verify(view,'zoom '+z,{chrome:false});
  }
  // A selected disc the walk would hide still shows, and selecting a shown disc moves nothing.
  await page.evaluate(()=>{selected=null;closeDetail(false);zoom=1;pan={x:0,y:0};draw();});await settled(page);
  const before=await layout(page),hidden=await page.evaluate(()=>{
   const shown=new Set(mapClusters.flatMap(g=>g.members.map(m=>m.id)));return filtered.find(d=>d.speed!=null&&!shown.has(d.id)).id;});
  await page.evaluate(id=>select(discs.find(d=>d.id===id)),before.items[0].key);await settled(page);
  assert.deepEqual((await layout(page)).items.map(d=>[d.key,d.transform]),before.items.map(d=>[d.key,d.transform]),'Selecting a shown disc moves nothing');
  await page.evaluate(id=>select(discs.find(d=>d.id===id)),hidden);await settled(page);
  view=await layout(page);verify(view,'hidden selected');
  assert.ok(view.items.some(d=>d.members.includes(hidden)),'A selected disc always shows');
  await page.context().close();
 }
 check('Landing (2.8x), 5x and 9x views touch nothing; selection shows its disc without reshuffling');

 assert.deepEqual(errors,[]);
 console.log(`PASS: ${checks.length} checks, ${fs.readdirSync(dir).length} screenshots in ${dir}`);
}finally{
 await browser.close();server.close();
}
