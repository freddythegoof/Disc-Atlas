import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function checkGroupingZoom(browser,base){
 const before=process.argv.includes('--baseline'),suffix=before?'before':'after',dir='outputs/grouping-zoom';
 fs.mkdirSync(dir,{recursive:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'dark'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const settled=()=>page.waitForFunction(()=>!cameraTween&&groupCache.items===filtered&&groupCache.level===Math.round(Math.log2(zoom)*3)&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));
 const summary=()=>page.evaluate(()=>{
  const area=AtlasLayout.bounds(mapViewport.width,mapViewport.height);
  return {zoom,level:groupCache.level,groups:groupCache.groups.length,singles:groupCache.groups.filter(g=>g.members.length===1).length,
   largest:Math.max(...groupCache.groups.map(g=>g.members.length)),discs:groupCache.groups.reduce((n,g)=>n+g.members.length,0),
   maxDisplacement:Math.max(...groupCache.groups.flatMap(g=>g.members.map(d=>{const p=atlasPositions.get(d.id);return Math.hypot((p.x-g.pos.x)*area.width*zoom,(p.y-g.pos.y)*area.height*zoom);}))),
   anchored:groupCache.groups.every(g=>{const p=atlasPositions.get(g.key);return p.x===g.pos.x&&p.y===g.pos.y;}),
   signature:groupCache.groups.map(g=>[g.key,g.members.map(d=>d.id)])};
 });
 try{
  await page.goto(base);await page.locator('.atlas-marker.is-selected').waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.locator('#zoomReset').click();await settled();await page.waitForTimeout(350);
  const overview=await summary();await page.screenshot({path:`${dir}/overview-${suffix}.png`});
  await page.evaluate(()=>{stopCamera();zoom=5;const area=AtlasLayout.bounds(mapViewport.width,mapViewport.height);pan={x:720-area.left-.6*area.width*zoom,y:380-area.bottom+.3*area.height*zoom};draw();});
  await settled();await page.waitForTimeout(350);
  const deep=await summary();await page.screenshot({path:`${dir}/deep-${suffix}.png`});
  fs.writeFileSync(`${dir}/metrics-${suffix}.json`,JSON.stringify({overview,deep},null,2));
  console.log(suffix,JSON.stringify({overview:{...overview,signature:undefined},deep:{...deep,signature:undefined}}));
  if(before)return;
  assert.ok(deep.anchored&&deep.maxDisplacement<15,'Deep markers stay anchored; grouped members are within 15px');
  assert.equal(deep.largest,3);assert.ok(deep.singles/deep.discs>.7,'Most discs render individually at deep zoom');
  assert.equal(deep.discs,overview.discs);assert.ok(overview.largest>3,'Overview remains coarsely grouped');
  assert.deepEqual(await page.evaluate(()=>{
   const labels=[...planetLabels.values()].filter(p=>p.opacity>.5);
   return labels.flatMap((a,i)=>labels.slice(i+1).filter(b=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y).map(b=>[a.name,b.name]));
  }),[],'Deep planet labels must not overlap');
  // Pan an actual triple into view, then use its real clickable marker.
  const triple=await page.evaluate(()=>{
   const g=groupCache.groups.find(g=>g.members.length===3);
   const area=AtlasLayout.bounds(mapViewport.width,mapViewport.height);pan={x:550-area.left-g.pos.x*area.width*zoom,y:350-area.bottom+g.pos.y*area.height*zoom};draw();return {key:g.key,names:g.members.map(d=>d.catalogName||d.name)};
  });await settled();await page.waitForTimeout(350);
  const point=await page.evaluate(key=>{const g=mapClusters.find(g=>g.key===key),r=canvas.getBoundingClientRect();return {x:r.left+g.x,y:r.top+g.y};},triple.key);
  await page.mouse.click(point.x,point.y);
  await page.locator('#detail').waitFor({state:'visible'});await page.waitForTimeout(350);
  const text=await page.locator('#detail').innerText();
  for(const name of triple.names)assert.ok(text.includes(name),`${name} appears in immediate comparison`);
  assert.equal(await page.locator('#detail .comparison-route').count(),3,'All three flight paths open immediately');
  await page.screenshot({path:`${dir}/three-disc-comparison.png`});
  // A taller capture includes all three choices without changing panel styles.
  await page.setViewportSize({width:1440,height:1100});await settled();await page.waitForTimeout(350);
  await page.screenshot({path:`${dir}/three-disc-comparison-full.png`});
  await page.setViewportSize({width:1440,height:900});
  // The actual worker and no-worker path must produce identical groups.
  await page.addInitScript(()=>{window.Worker=undefined;});await page.reload();await page.locator('.atlas-marker.is-selected').waitFor();
  await page.evaluate(()=>{stopCamera();zoom=5;draw();});await settled();
  assert.deepEqual((await summary()).signature,deep.signature,'Worker and synchronous grouping agree');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
}
