import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function checkGroupingZoom(browser,base){
 const before=process.argv.includes('--baseline'),suffix=before?'before':'after',dir='outputs/grouping-zoom';
 fs.mkdirSync(dir,{recursive:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'dark',hasTouch:true});
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
  const bands={};
  for(const theme of ['dark','light']){
   if(theme==='light')await page.getByRole('button',{name:'Switch to light mode'}).click();
   for(const [band,py] of [['putter',.1],['fairway',.5]]){
    await page.evaluate(py=>{const area=AtlasLayout.bounds(mapViewport.width,mapViewport.height);pan={x:720-area.left-.5*area.width*zoom,y:430-area.bottom+py*area.height*zoom};draw();},py);
    await settled();await page.waitForTimeout(350);
    const state=await page.evaluate(()=>{
     const visible=mapClusters.filter(g=>g.x>70&&g.x<1370&&g.y>110&&g.y<690);
     const labels=[...document.querySelectorAll('.marker-position:not(.is-retiring) .marker-name')].filter(n=>getComputedStyle(n).visibility!=='hidden'&&getComputedStyle(n).display!=='none').map(n=>({name:n.textContent,r:n.getBoundingClientRect()}));
     return {primaries:visible.filter(g=>g.large).length,satellites:visible.filter(g=>!g.large).length,
      labeledSatellites:visible.filter(g=>!g.large&&planetLabels.get(g.key)?.opacity>.01).length,
      leaders:[...planetLabels.values()].filter(p=>p.opacity>.001).length,
      overlaps:labels.flatMap((a,i)=>labels.slice(i+1).filter(b=>a.r.left<b.r.right&&a.r.right>b.r.left&&a.r.top<b.r.bottom&&a.r.bottom>b.r.top).map(b=>[a.name,b.name])),
      honest:visible.filter(g=>g.large).every(g=>g.x===g.actualX&&g.y===g.actualY)};
    });
    bands[`${band}-${theme}`]=state;
    await page.screenshot({path:`${dir}/${band}-${theme}-${suffix}.png`});
    if(!before){
     assert.ok(state.primaries>0&&state.satellites>0,`${band}/${theme} mixes primaries and satellites`);
     assert.equal(state.labeledSatellites,0,'Deep satellites are plain dots');
     assert.equal(state.leaders,0,'Deep labels have no leader thicket or leader collisions');
     assert.deepEqual(state.overlaps,[],'Measured primary labels do not overlap');
     assert.ok(state.honest,'Primary orbs keep their actual coordinates');
     const dot=await page.evaluate(()=>{const g=mapClusters.find(g=>!g.large&&g.members.length===1&&g.x>100&&g.x<900&&g.y>150&&g.y<600);return g?{key:g.key,name:g.lead.catalogName||g.lead.name,x:mapViewport.left+g.x,y:mapViewport.top+g.y}:null;});
     assert.ok(dot,'An unlabeled single is available to tap');
     await page.touchscreen.tap(dot.x,dot.y);
     await page.locator('#detail').waitFor({state:'visible'});
     assert.equal(await page.evaluate(()=>selected.id),dot.key,'Spatial tapping opens the unlabeled disc');
     assert.ok((await page.locator('#detail').innerText()).includes(dot.name));
     await page.locator('#closeDetail').click();await page.locator('#detail').waitFor({state:'hidden'});
    }
   }
  }
  if(!before){
   // Cross the cutoff in both directions to catch stale canvas text/leader caches.
   for(const z of [3.3,3.31,3.3,5]){
    await page.evaluate(z=>{stopCamera();zoom=z;draw();},z);await settled();await page.waitForTimeout(350);
    const count=await page.evaluate(()=>[...planetLabels.values()].filter(p=>p.opacity>.01).length);
    if(z>3.3)assert.equal(count,0,'Crossing into deep zoom clears satellite labels');
    else assert.ok(count>0,'Zooming back restores single-dot identification');
   }
  }
  fs.writeFileSync(`${dir}/metrics-${suffix}.json`,JSON.stringify({overview,deep,bands},null,2));
  console.log('Bands',bands);
  console.log(suffix,JSON.stringify({overview:{...overview,signature:undefined},deep:{...deep,signature:undefined}}));
  if(before)return;
  assert.ok(deep.anchored&&deep.maxDisplacement<25,'Deep markers stay anchored; grouped members are within 25px');
  assert.equal(deep.largest,3);assert.ok(deep.singles/deep.discs>.7,'Most discs render individually at deep zoom');
  assert.equal(deep.discs,overview.discs);assert.ok(overview.largest>3,'Overview remains coarsely grouped');
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
