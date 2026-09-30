import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function checkFilterRegroup(browser,base){
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const settled=()=>groupCache.items===filtered&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping');
 try{
  await page.goto(base);await page.locator('.atlas-marker.is-selected').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>{stopCamera();zoom=5;pan={x:-1200,y:300};draw();});
  await page.waitForFunction(()=>groupCache.level===7&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));
  await page.waitForTimeout(400);
  const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  const results=[];
  for(const action of ['brand','clear-brand','type']){
   await page.evaluate(()=>{
    window.filterMeasure={tasks:[],syncBuilds:0,arrivals:0,timings:[],originals:{}};
    for(const name of ['filter','draw','renderMarkers','detail','renderList','renderBrands']){
     const original=window[name];filterMeasure.originals[name]=original;
     window[name]=function(...args){const start=performance.now();try{return original.apply(this,args);}finally{filterMeasure.timings.push([name,performance.now()-start]);}};
    }
    const build=AtlasGroups.build;
    filterMeasure.build=build;
    AtlasGroups.build=(...args)=>{filterMeasure.syncBuilds++;return build(...args);};
    filterMeasure.observer=new PerformanceObserver(list=>filterMeasure.tasks.push(...list.getEntries().map(e=>e.duration)));
    filterMeasure.observer.observe({entryTypes:['longtask']});
    filterMeasure.arrival=e=>{if(e.animationName==='atlas-arrive')filterMeasure.arrivals++;};
    document.querySelector('#mapMarkers').addEventListener('animationstart',filterMeasure.arrival,true);
   });
   const retained=await page.evaluate(action=>{
    const previous=groupCache;
    if(action==='brand')toggleBrand('Innova');
    else if(action==='clear-brand')toggleBrand('Innova');
    else document.querySelector('#types button[data-type="distance"]').click();
    return groupCache===previous&&mapClusters.length>0;
   },action);
   await page.waitForFunction(settled,null,{timeout:20000});await page.waitForTimeout(250);
   const result=await page.evaluate(()=>{
    const m=filterMeasure;m.observer.disconnect();AtlasGroups.build=m.build;
    Object.assign(window,m.originals);
    document.querySelector('#mapMarkers').removeEventListener('animationstart',m.arrival,true);
    return {tasks:m.tasks,maxTask:Math.max(0,...m.tasks),syncBuilds:m.syncBuilds,arrivals:m.arrivals,groups:groupCache.groups.length,timings:m.timings.sort((a,b)=>b[1]-a[1]).slice(0,5)};
   });
   results.push({action,retained,...result});
  }
  fs.mkdirSync('outputs/zoom-review',{recursive:true});
  fs.writeFileSync(`outputs/zoom-review/filter-${process.argv.includes('--baseline')?'before':'after'}.json`,JSON.stringify(results,null,2));
  console.log('Filter regroup (4x CPU):',JSON.stringify(results));
  for(const r of results){
   assert.equal(r.syncBuilds,0,`${r.action}: filtering never builds groups on the main thread`);
   assert.ok(r.retained,`${r.action}: the previous groups remain until the worker replies`);
   assert.ok(r.maxTask<50,`${r.action}: no long task over 50ms (observed ${r.maxTask}ms)`);
   assert.equal(r.arrivals,0,'Filtering does not replay entrance animations');
  }
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
  await page.evaluate(()=>{type='all';selectedBrands.clear();filter();selectedBrands.add('Axiom');filter();});
  await page.waitForFunction(settled);
  assert.ok(await page.evaluate(()=>groupCache.groups.every(g=>g.members.every(d=>d.brand==='Axiom'))),'Obsolete worker results cannot restore a previous filter');
  assert.equal(await page.locator('.is-new,.is-retiring').count(),0);
  await page.locator('#search').fill('no-such-disc-filter-regression');await page.waitForFunction(settled);
  assert.equal(await page.locator('.atlas-marker').count(),0,'An empty filter retires every marker');
  await page.locator('#empty').waitFor({state:'visible'});
  await page.evaluate(()=>{
   selectedBrands.clear();type='all';document.querySelector('#search').value='';filter();
  });
  await page.waitForFunction(settled);
  await page.evaluate(()=>{
   const driver=filtered.find(d=>d.name.toLowerCase()==='destroyer');
   const camera=AtlasLayout.camera(atlasPositions.get(driver.id),canvas.clientWidth,canvas.clientHeight,12);
   zoom=camera.zoom;pan={x:camera.x,y:camera.y};draw();
  });
  await page.waitForFunction(()=>groupCache.level===Math.round(Math.log2(zoom)*3)&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));
  await page.locator('#search').fill('Buzzz');await page.waitForFunction(settled);
  assert.ok(await page.evaluate(()=>mapClusters.length>0&&mapClusters.every(g=>g.members.every(d=>filtered.includes(d)))),'A distant search brings its new results into view');
  assert.deepEqual(errors,[]);
 }finally{await context.close();}
}
