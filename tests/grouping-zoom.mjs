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
    for(const [band,py] of [['putter',.1],['fairway',.5],['distance',.8]]){
    await page.evaluate(py=>{const area=AtlasLayout.bounds(mapViewport.width,mapViewport.height);pan={x:720-area.left-.5*area.width*zoom,y:430-area.bottom+py*area.height*zoom};draw();},py);
    await settled();await page.waitForTimeout(350);
    const state=await page.evaluate(()=>{
     const visible=mapClusters.filter(g=>g.x>70&&g.x<1370&&g.y>110&&g.y<690);
     const labels=[...document.querySelectorAll('.marker-position:not(.is-retiring) .is-large .marker-name')].filter(n=>getComputedStyle(n).visibility!=='hidden'&&getComputedStyle(n).display!=='none').map(n=>({name:n.textContent,r:n.getBoundingClientRect()}));
     for(const p of planetLabels.values())if(p.opacity>.01)labels.push({name:p.name,r:{left:p.x+mapViewport.left,right:p.x+p.w+mapViewport.left,top:p.y+mapViewport.top,bottom:p.y+p.h+mapViewport.top}});
     return {primaries:visible.filter(g=>g.large).length,satellites:visible.filter(g=>!g.large).length,
      labeledSatellites:visible.filter(g=>!g.large&&planetLabels.get(g.key)?.opacity>.01).length,
      anonymousSingles:visible.filter(g=>!g.large&&g.members.length===1&&!planetLabels.get(g.key)?.opacity).map(g=>g.lead.name),
      leaders:[...planetLabels.values()].filter(p=>p.opacity>.001&&p.leader!==false).length,
      overlaps:labels.flatMap((a,i)=>labels.slice(i+1).filter(b=>a.r.left<b.r.right&&a.r.right>b.r.left&&a.r.top<b.r.bottom&&a.r.bottom>b.r.top).map(b=>[a.name,b.name])),
      honest:visible.filter(g=>g.large).every(g=>g.x===g.actualX&&g.y===g.actualY)};
    });
    bands[`${band}-${theme}`]=state;
    await page.screenshot({path:`${dir}/${band}-${theme}-${suffix}.png`});
    if(!before){
     assert.ok(state.primaries>0&&state.satellites>0,`${band}/${theme} mixes primaries and satellites`);
     assert.ok(state.labeledSatellites>0,'Remaining satellites have compact names');
     assert.deepEqual(state.anonymousSingles,[],'Every remaining single has a name instead of an anonymous dot');
     assert.equal(state.leaders,0,'Deep labels have no leader thicket or leader collisions');
     assert.deepEqual(state.overlaps,[],'Measured primary labels do not overlap');
     assert.ok(state.honest,'Primary orbs keep their actual coordinates');
     const dot=await page.evaluate(()=>{const g=mapClusters.find(g=>!g.large&&g.members.length===1&&g.x>100&&g.x<900&&g.y>150&&g.y<600);return g?{key:g.key,name:g.lead.catalogName||g.lead.name,x:mapViewport.left+g.x,y:mapViewport.top+g.y}:null;});
     assert.ok(dot,'A remaining single satellite is available to tap');
     await page.keyboard.press('Tab');await page.locator(`[data-cluster="${dot.key}"]`).focus();
     await page.waitForTimeout(250);
     assert.ok(await page.locator(`[data-cluster="${dot.key}"] .marker-name`).evaluate(n=>getComputedStyle(n).visibility==='visible'&&Number(getComputedStyle(n).opacity)>.9),'Keyboard focus reveals the full dot name and brand');
     await page.evaluate(()=>document.activeElement.blur());
     await page.touchscreen.tap(dot.x,dot.y);
     await page.locator('#detail').waitFor({state:'visible'});
     assert.equal(await page.evaluate(()=>selected.id),dot.key,'Spatial tapping opens the correct satellite');
     assert.ok((await page.locator('#detail').innerText()).includes(dot.name));
     await page.locator('#closeDetail').click();await page.locator('#detail').waitFor({state:'hidden'});
     const label=await page.evaluate(()=>{
      for(const [key,p] of planetLabels){
       const g=mapClusters.find(g=>g.key===key);
       if(p.opacity<.5||p.x<100||p.x+p.w>900||p.y<150||p.y>600||g?.members.length!==1)continue;
       const x=g.x<p.x+p.w/2?p.x+p.w-1:p.x+1,y=p.y+p.h/2;
       if(Math.hypot(x-g.x,y-g.y)>24)return {key,x:mapViewport.left+x,y:mapViewport.top+y};
      }
      return null;
     });
     assert.ok(label,'A compact single-disc label is available');
     await page.touchscreen.tap(label.x,label.y);
     await page.locator('#detail').waitFor({state:'visible'});
     assert.equal(await page.evaluate(()=>selected.id),label.key,'The name itself is a usable tap target');
     await page.locator('#closeDetail').click();await page.locator('#detail').waitFor({state:'hidden'});
    }
   }
  }
  if(!before){
   // Cross the cutoff in both directions to catch stale canvas text/leader caches.
   for(const z of [3.3,3.31,3.3,5]){
    await page.evaluate(z=>{stopCamera();zoom=z;draw();},z);await settled();await page.waitForTimeout(350);
    const count=await page.evaluate(()=>[...planetLabels.values()].filter(p=>p.opacity>.01).length);
    if(z>3.3){assert.ok(count>0,'Deep zoom keeps accessible compact labels');assert.ok(await page.evaluate(()=>[...planetLabels.values()].every(p=>!p.opacity||p.leader===false)),'Deep zoom clears leader lines');}
    else assert.ok(count>0,'Zooming back restores single-dot identification');
   }
  }
  fs.writeFileSync(`${dir}/metrics-${suffix}.json`,JSON.stringify({overview,deep,bands},null,2));
  console.log('Bands',bands);
  console.log(suffix,JSON.stringify({overview:{...overview,signature:undefined},deep:{...deep,signature:undefined}}));
  if(before)return;
  assert.ok(deep.anchored&&deep.maxDisplacement<65,'Deep leads stay anchored; absorbed satellites remain local');
  assert.equal(deep.largest,3);
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
  await page.setViewportSize({width:390,height:844});await page.reload();await page.locator('#mapTab').click();await page.waitForFunction(()=>filtered.length>0);
  await page.evaluate(()=>{stopCamera();zoom=5;const area=AtlasLayout.bounds(mapViewport.width,mapViewport.height);pan={x:195-area.left-.5*area.width*zoom,y:350-area.bottom+.8*area.height*zoom};draw();});
  await settled();await page.waitForTimeout(350);
  const mobileLabel=await page.evaluate(()=>{const entry=[...planetLabels].find(([key,p])=>p.opacity>.5&&p.x>15&&p.x+p.w<375&&p.y>150&&p.y<550&&mapClusters.find(g=>g.key===key)?.members.length===1);return entry?{key:entry[0],x:mapViewport.left+entry[1].x+entry[1].w/2,y:mapViewport.top+entry[1].y+7}:null;});
  assert.ok(mobileLabel,'Mobile retains a labeled single satellite');
  await page.screenshot({path:`${dir}/distance-mobile-after.png`});
  await page.touchscreen.tap(mobileLabel.x,mobileLabel.y);await page.locator('#detail').waitFor({state:'visible'});
  assert.equal(await page.evaluate(()=>selected.id),mobileLabel.key,'Mobile label taps open the correct disc');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
}
