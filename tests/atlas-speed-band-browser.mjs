// The speed axis in a real browser: every disc the map draws (curated markers with their rest toss,
// a complete view's dots, small discs and minis on the canvas) sits within AtlasLayout.BAND of its true
// speed, (speed - 1) / 14, so a slower disc never draws above a faster one. Unfiltered, by manufacturer
// and by type, at 1x, the landing camera and deeper. Discmania's 11-speed DD1s sit strictly below its
// 12-speed DD2, DD3 and Enigma.
// Run: PLAYWRIGHT_MODULE=<playwright> node tests/atlas-speed-band-browser.mjs   (shots: outputs/atlas-speed-band/)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');

const dir=process.env.SHOTS_DIR||'outputs/atlas-speed-band';
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
const errors=[],failures=[];
const VIEWPORTS={desktop:{width:1440,height:900},phone:{width:390,height:844}};

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
 await page.evaluate(()=>draw());
 await page.waitForFunction(()=>mapGaps.every(g=>!g.on||g.art===1&&g.rest));
 await page.waitForTimeout(250);
};
// A filter (brands, type) and a camera: 1x, the landing camera, or a zoom centered on the map.
async function show(page,{brands=[],type:kind='all',camera='far',zoom:z=1,on=null}){
 await page.mouse.move(1,1);
 await page.evaluate(([brands,kind,camera,z,on])=>{
  selected=null;closeDetail(false);document.querySelector('#search').value='';selectedBrands.clear();for(const b of brands)selectedBrands.add(b);
  type=kind;zoom=1;pan={x:0,y:0};filter();
  if(camera==='landing')focusFeatured();
  if(on){const d=filtered.find(d=>d.name===on),{width:w,height:h}=mapViewport,target=boundedCamera(AtlasLayout.camera(shownPosition(d.id),w,h,z));zoom=target.zoom;pan={x:target.x,y:target.y};}
  else if(z!==1){const {width:w,height:h}=mapViewport,target=boundedCamera(zoomDestination(z,{x:w/2,y:h/2}));zoom=target.zoom;pan={x:target.x,y:target.y};}
  draw();
 },[brands,kind,camera,z,on]);
 await settled(page);
}
// Every drawn disc's speed-axis position, in atlas units, from where it draws on screen.
const RENDERED=()=>{
 const {width:w,height:h}=mapViewport,area=AtlasLayout.bounds(w,h,!document.body.classList.contains('my-bag-mode'));
 const at=y=>(area.bottom+pan.y-y)/(area.height*zoom);
 const out=[];
 for(const g of mapClusters){const d=g.lead||g.members[0];if(d?.speed!=null)out.push({id:d.id,name:d.name,brand:d.brand,speed:d.speed,kind:g.large?'curated':'dot',y:at(g.y),screen:g.y});}
 for(const g of mapGaps)if(g.on&&g.d?.speed!=null)out.push({id:g.d.id,name:g.d.name,brand:g.d.brand,speed:g.d.speed,kind:g.tier,y:at(g.y),screen:g.y});
 return {zoom,band:AtlasLayout.BAND??.035,discs:out};
};
const STATES=[
 {name:'unfiltered',filter:{}},
 {name:'discmania',filter:{brands:['Discmania']}},
 {name:'innova',filter:{brands:['Innova']}},
 {name:'mvp',filter:{brands:['MVP']}},
 {name:'distance',filter:{type:'distance'}},
 {name:'putter',filter:{type:'putter'}},
 {name:'discmania-distance',filter:{brands:['Discmania'],type:'distance'}},
];
const CAMERAS={far:{camera:'far'},landing:{camera:'landing'},mid:{zoom:3},deep:{zoom:6.5}};
let measured=0;
for(const viewport of ['desktop','phone']){
 const page=await open(viewport);
 for(const state of STATES)for(const [cameraName,camera] of Object.entries(CAMERAS)){
  if(viewport==='phone'&&cameraName!=='far'&&cameraName!=='landing')continue;
  await show(page,{...state.filter,...camera});
  const {band,discs}=await page.evaluate(RENDERED);
  const label=`${viewport} ${state.name} ${cameraName}`;
  measured+=discs.length;
  for(const d of discs){
   const off=Math.abs(d.y-(d.speed-1)/14);
   if(!(off<band))failures.push(`${label}: ${d.name} (${d.brand}, ${d.speed}, ${d.kind}) draws ${(off*14).toFixed(2)} speed units off (${off.toFixed(4)} > ${band})`);
  }
  // No slower disc draws above (screen y less than) a faster one by whole speeds.
  const whole=discs.filter(d=>Number.isInteger(d.speed));
  let inversions=0;
  for(const a of whole)for(const b of whole)if(a.speed<b.speed&&a.screen<b.screen)inversions++;
  if(inversions)failures.push(`${label}: ${inversions} whole-speed pairs draw out of order`);
  console.log(`${failures.length?'..':'ok'} - ${label}: ${discs.length} drawn discs measured`);
  if(cameraName==='far'&&(state.name==='unfiltered'||state.name==='discmania'))await page.screenshot({path:`${dir}/${viewport}-${state.name}.png`});
 }
 if(viewport==='desktop'){
  // Discmania's drivers, at every camera where they draw: 11-speed strictly below 12-speed. `drivers`
  // zooms in on the DDs so all six draw.
  for(const [cameraName,camera] of Object.entries({...CAMERAS,drivers:{zoom:3,on:'DD3 (new)'}})){
   await show(page,{brands:['Discmania'],...camera});
   const {discs}=await page.evaluate(RENDERED);
   const slow=discs.filter(d=>/^(Premier )?DD1$/.test(d.name)),fast=discs.filter(d=>/^(DD2 \(2025\)|Premier DD3|DD3 \(new\)|Enigma)$/.test(d.name));
   console.log(`   discmania ${cameraName}: ${[...slow,...fast].map(d=>`${d.name} ${d.speed} y=${d.y.toFixed(4)}`).join(', ')||'none drawn'}`);
   for(const s of slow)for(const f of fast)if(!(s.y<f.y))failures.push(`discmania ${cameraName}: ${s.name} (${s.speed}) draws at or above ${f.name} (${f.speed})`);
   if(cameraName==='drivers'){
    if(slow.length+fast.length<4)failures.push(`discmania drivers: only ${slow.length+fast.length} of the DDs draw`);
    await page.screenshot({path:`${dir}/desktop-discmania-drivers.png`});
   }
  }
 }
 await page.context().close();
}
await browser.close();server.close();
assert.deepEqual(errors,[],'No page errors');
assert.ok(measured>0,'Discs were measured');
assert.deepEqual(failures,[],failures.slice(0,40).join('\n'));
console.log(`ok - ${measured} drawn discs stay in their speed band`);
