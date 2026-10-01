import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function checkDeepZoom(browser,base){
 const baseline=process.argv.includes('--baseline'),dir='outputs/deep-zoom';
 fs.mkdirSync(dir,{recursive:true});
 const visual=process.argv.includes('--deep-visual');
 const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'dark',...(visual?{recordVideo:{dir,size:{width:1440,height:900}}}:{})});
 const page=await context.newPage();
 try{
  await page.goto(base);await page.locator('.atlas-marker.is-selected').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>animateZoom(100,{x:720,y:400}));
  await page.waitForFunction(()=>!cameraTween&&groupCache.level===Math.round(Math.log2(zoom)*3)&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));
  await page.waitForTimeout(300);
  await page.screenshot({path:`${dir}/max-${baseline?'before':'after'}.png`});
  const depth=await page.evaluate(()=>({zoom,count:mapClusters.filter(g=>g.x>80&&g.x<1360&&g.y>100&&g.y<650).length}));
  console.log('Deepest view',depth);
  // Move a real large marker through the old inset cutoff, retaining DOM identity.
  const edge=await page.evaluate(()=>{
   const area=AtlasLayout.bounds(mapViewport.width,mapViewport.height),g=groupCache.groups.find(g=>g.large&&g.pos.x>.35&&g.pos.x<.65&&g.pos.y>.3&&g.pos.y<.7);
   window.edgeGroup=g;pan={x:42-area.left-g.pos.x*area.width*zoom,y:350-area.bottom+g.pos.y*area.height*zoom};draw();
   window.edgeNode=markerNodes.get(g.key);return g.key;
  });
  const samples=[];
  for(const x of [42,39,41,35,20,0,-20]){
   samples.push(await page.evaluate(x=>{
    const area=AtlasLayout.bounds(mapViewport.width,mapViewport.height);pan.x=x-area.left-edgeGroup.pos.x*area.width*zoom;draw();
    return {x,retained:markerNodes.get(edgeGroup.key)===edgeNode,rendered:mapClusters.some(g=>g.key===edgeGroup.key)};
   },x));
   if(visual)await page.waitForTimeout(150);
   if(x===20)await page.screenshot({path:`${dir}/edge-${baseline?'before':'after'}.png`});
  }
  fs.writeFileSync(`${dir}/edge-${baseline?'before':'after'}.json`,JSON.stringify({depth,edge,samples},null,2));
  if(baseline)return;
  assert.ok(samples.every(s=>s.retained&&s.rendered),'A disc at/near the viewport edge remains rendered without removal/recreation');
  assert.ok(depth.zoom===9&&depth.count>=8,'Maximum zoom retains a useful neighborhood');
  await page.evaluate(()=>{const area=AtlasLayout.bounds(mapViewport.width,mapViewport.height);pan.x=-250-area.left-edgeGroup.pos.x*area.width*zoom;draw();});
  assert.equal(await page.evaluate(()=>markerNodes.has(edgeGroup.key)),false,'A disc is culled after it is fully panned past');
  for(const side of ['left','right','top','bottom']){
   assert.ok(await page.evaluate(side=>{
    const area=AtlasLayout.bounds(mapViewport.width,mapViewport.height),w=mapViewport.width,h=mapViewport.height;
    const center=(x,y)=>{pan={x:x-area.left-edgeGroup.pos.x*area.width*zoom,y:y-area.bottom+edgeGroup.pos.y*area.height*zoom};draw();};
    const positions=side==='left'?[[20,350],[0,350],[-20,350],[10,350]]:side==='right'?[[w-20,350],[w,350],[w+20,350],[w-10,350]]:side==='top'?[[700,90],[700,70],[700,50],[700,80]]:[[700,h-130],[700,h-110],[700,h-90],[700,h-120]];
    center(...positions[0]);const node=markerNodes.get(edgeGroup.key);
    return positions.every(([x,y])=>{center(x,y);return node&&markerNodes.get(edgeGroup.key)===node;});
   },side),`${side} edge reversals retain marker identity`);
  }
  await page.evaluate(()=>{focusFeatured();animateZoom(100,{x:720,y:400});});
  await page.waitForFunction(()=>!cameraTween&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));
  await page.waitForTimeout(300);
  const labels=await page.evaluate(()=>[...planetLabels.values()].filter(n=>n.opacity>.5).length);
  assert.equal(labels,0,'Deep satellites have no duplicate canvas labels');
  assert.ok(await page.evaluate(()=>[...planetLabels.values()].every(p=>!p.opacity||p.leader===false)),'Removed minor canvas renderer cannot add leader lines');
  assert.ok(await page.evaluate(()=>mapClusters.filter(g=>g.large).every(g=>!planetLabels.get(g.key)?.opacity)),'Readable large discs do not get duplicate planet labels');
  assert.ok(await page.locator('.atlas-marker.is-large .disc-art').first().evaluate(n=>n.getBoundingClientRect().width)>60,'Deep zoom enlarges disc art');
  await page.screenshot({path:`${dir}/leader-labels.png`});
  // Scale expands art beyond the old 54px button: the visible rim still selects it.
  const hit=await page.evaluate(()=>{const g=mapClusters.find(g=>g.large&&g.x>100&&g.x<1300&&g.y>150&&g.y<550),r=canvas.getBoundingClientRect();return {key:g.key,x:r.left+g.x+32,y:r.top+g.y};});
  await page.mouse.click(hit.x,hit.y);assert.equal(await page.evaluate(()=>selected?.id),hit.key,'The enlarged disc rim remains clickable');
  await page.locator('#closeDetail').click();await page.locator('#detail').waitFor({state:'hidden'});
  await page.evaluate(()=>changeZoom(100));await page.waitForTimeout(250);
  assert.ok(await page.evaluate(()=>zoom===9),'Immediate pinch zoom uses the same ceiling');
  await page.locator('#zoomReset').click();await page.waitForFunction(()=>!cameraTween&&groupCache.level===0&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));await page.waitForTimeout(250);
  assert.ok(await page.evaluate(()=>planetLabels.size===0&&mapClusters.every(g=>!g.minorLabel||g.members.length===1&&!g.large&&g.markerOffset===null)),'Overview labels only identify fitting single dots at true positions');
  await page.getByRole('button',{name:'Switch to light mode'}).click();
  await page.evaluate(()=>{focusFeatured();animateZoom(100);});await page.waitForFunction(()=>!cameraTween&&groupCache.level===10&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));await page.waitForTimeout(250);
  await page.screenshot({path:`${dir}/light-labels.png`});
  await page.setViewportSize({width:390,height:844});await page.reload();await page.locator('#mapTab').click();await page.waitForFunction(()=>filtered.length>0);
  await page.evaluate(()=>{focusFeatured();animateZoom(100);});await page.waitForFunction(()=>!cameraTween&&groupCache.level===10&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));await page.waitForTimeout(250);
  assert.ok(await page.evaluate(()=>zoom===9&&mapClusters.filter(g=>g.x>0&&g.x<390&&g.y>70&&g.y<canvas.clientHeight-155).length>=6),'Mobile deepest view retains a neighborhood');
  await page.screenshot({path:`${dir}/mobile-deepest.png`});
 }finally{const video=page.video();await context.close();if(video)await video.saveAs(`${dir}/${baseline?'before':'after'}.webm`);}
}
