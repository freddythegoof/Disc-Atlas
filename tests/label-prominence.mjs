import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function checkLabelProminence(browser,base){
 const before=process.argv.includes('--labels-before'),dir='outputs/label-prominence';
 fs.mkdirSync(dir,{recursive:true});
 const context=await browser.newContext({viewport:{width:2560,height:1320},colorScheme:'dark'});
 const page=await context.newPage();
 const settled=()=>page.waitForFunction(()=>!cameraTween&&groupCache.items===filtered&&groupCache.level===Math.round(Math.log2(zoom)*3)&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));
 try{
  await page.goto(base);await page.locator('.atlas-marker.is-selected').waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>{selectedBrands.add(discs.find(d=>d.name==='Savant').brand);filter();animateZoom(100);});await settled();
  console.log('Brands/view',await page.evaluate(()=>({brands:[...selectedBrands],count:filtered.length,zoom})));
  await page.evaluate(()=>{
   const g=groupCache.groups.find(g=>g.lead.name==='Savant'),area=AtlasLayout.bounds(mapViewport.width,mapViewport.height);
   pan={x:700-area.left-g.pos.x*area.width*zoom,y:400-area.bottom+g.pos.y*area.height*zoom};draw();
  });await settled();await page.waitForTimeout(350);
  const target=await page.evaluate(()=>mapClusters.filter(g=>['Viking','Savant','Python','Teebird 3'].includes(g.lead.name)).map(g=>({name:g.lead.name,large:g.large,x:g.x,y:g.y})));
  console.log('Target neighborhood',target);
  await page.screenshot({path:`${dir}/deep-${before?'before':'after'}.png`,clip:{x:412,y:204,width:1076,height:924}});
  if(before)return;
  assert.equal(target.length,4);
  assert.ok(target.every(g=>g.large),'Viking, Savant, Python and Teebird 3 each have room for full labels');
  const overlaps=()=>page.evaluate(()=>{
   const boxes=[...document.querySelectorAll('.marker-position:not(.is-retiring) .is-large .marker-name')].map(n=>({name:n.textContent,r:n.getBoundingClientRect()}));
   return boxes.flatMap((a,i)=>boxes.slice(i+1).filter(b=>a.r.left<b.r.right&&a.r.right>b.r.left&&a.r.top<b.r.bottom&&a.r.bottom>b.r.top).map(b=>[a.name,b.name]));
  });
  assert.deepEqual(await overlaps(),[],'Deep full labels do not overlap');
  await page.evaluate(()=>reset());await settled();await page.waitForTimeout(350);
  await page.screenshot({path:`${dir}/overview-after.png`});
  assert.deepEqual(await overlaps(),[],'Overview full labels do not overlap');
  const overview=await page.evaluate(()=>({large:mapClusters.filter(g=>g.large).map(g=>g.lead.name),dots:mapClusters.filter(g=>!g.large).length}));
  console.log('Overview prominence',{featured:overview.large.filter(n=>['Destroyer','Buzzz','Zone','Crave','Envy','TeeBird'].includes(n)),large:overview.large.length,dots:overview.dots});
  assert.ok(overview.large.includes('Destroyer')&&overview.large.includes('Buzzz')&&overview.dots>0);
  // Inspect painted labels every frame, including old worker groups during zoom.
  for(const factor of [4,.25]){
  const motionOverlaps=await page.evaluate(factor=>new Promise(resolve=>{
   const failures=[];let frames=0;
   animateZoom(factor,{x:mapViewport.width/2,y:mapViewport.height/2});
   function sample(){
    const labels=[...document.querySelectorAll('.is-large .marker-name')].filter(n=>getComputedStyle(n).visibility!=='hidden'&&Number(getComputedStyle(n).opacity)>.05&&Number(getComputedStyle(n.parentElement.parentElement).opacity)>.05).map(n=>({name:n.textContent,r:n.getBoundingClientRect()}));
    for(let i=0;i<labels.length;i++)for(const b of labels.slice(i+1)){const a=labels[i];if(a.r.left<b.r.right&&a.r.right>b.r.left&&a.r.top<b.r.bottom&&a.r.bottom>b.r.top)failures.push([a.name,b.name]);}
    if(++frames<70)requestAnimationFrame(sample);else resolve(failures.slice(0,8));
   }requestAnimationFrame(sample);
  }),factor);
  assert.deepEqual(motionOverlaps,[],'Full labels stay separate during animated regrouping');
  }
  for(const [width,height] of [[1440,900],[390,844]]){
   await page.setViewportSize({width,height});await page.evaluate(()=>reset());await settled();await page.waitForTimeout(300);
   assert.deepEqual(await overlaps(),[],`${width}px overview labels do not overlap`);
   await page.screenshot({path:`${dir}/overview-${width}.png`});
   // Exercise every worker level and the spaces between levels with real CSS.
   for(const z of [1.15,1.5,2,2.8,3.5,4.5,5]){
    await page.evaluate(z=>{stopCamera();zoom=z;draw();},z);await settled();await page.waitForTimeout(220);
    assert.deepEqual(await overlaps(),[],`${width}px labels do not overlap at ${z}x`);
    assert.ok(await page.evaluate(()=>groupCache.groups.every(g=>{const p=atlasPositions.get(g.key);return g.pos.x===p.x&&g.pos.y===p.y;})),'Zoom preserves marker coordinates');
   }
  }
  // The same geometry must work when workers are unavailable.
  await page.addInitScript(()=>{window.Worker=undefined;});await page.reload();await page.locator('#mapTab').click();await page.waitForFunction(()=>filtered.length>0);await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>{zoom=5;draw();});await settled();await page.waitForTimeout(300);
  assert.deepEqual(await overlaps(),[],'Synchronous fallback has no label overlaps');
  assert.ok(await page.evaluate(()=>mapClusters.some(g=>g.large)),'Synchronous fallback retains prominent labels');
 }finally{await context.close();}
}
