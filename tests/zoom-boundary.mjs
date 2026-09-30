import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function checkZoomBoundary(browser, base) {
  const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'dark'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto(base);await page.locator('.atlas-marker.is-selected').waitFor();
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(()=>{stopCamera();zoom=4.45;pan={x:-1200,y:300};draw();});
    await page.waitForFunction(()=>groupCache.level===6&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'),null,{timeout:15000});
    await page.mouse.move(700,390);
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(()=>groupCache.level),6,'The test starts below the cluster boundary near 4.49×');
    const before=await page.evaluate(()=>markerNodes.size);
    const cdp=await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
    await page.evaluate(()=>{
      window.boundaryMeasure={tasks:[],added:0,removed:0,arrivals:0,timings:[],minVisible:Infinity,frame:0};
      const sample=()=>{
        const visible=[...markerNodes.values()].filter(node=>!node.position.classList.contains('is-new')&&!node.position.classList.contains('is-retiring')).length;
        boundaryMeasure.minVisible=Math.min(boundaryMeasure.minVisible,visible);
        boundaryMeasure.frame=requestAnimationFrame(sample);
      };sample();
      for(const name of ['draw','buildClusters','renderMarkers']){
        const previous=window[name];window[name]=function(...args){const start=performance.now();try{return previous.apply(this,args);}finally{boundaryMeasure.timings.push([name,start,performance.now()-start]);}};
      }
      const layer=document.querySelector('#mapMarkers');
      boundaryMeasure.observer=new MutationObserver(changes=>{
        for(const change of changes){boundaryMeasure.added+=change.addedNodes.length;boundaryMeasure.removed+=change.removedNodes.length;}
      });
      boundaryMeasure.observer.observe(layer,{childList:true});
      boundaryMeasure.arrival=event=>{if(event.animationName==='atlas-arrive')boundaryMeasure.arrivals++;};
      layer.addEventListener('animationstart',boundaryMeasure.arrival,true);
      boundaryMeasure.perf=new PerformanceObserver(list=>boundaryMeasure.tasks.push(...list.getEntries().map(entry=>({start:entry.startTime,duration:entry.duration}))));
      boundaryMeasure.perf.observe({entryTypes:['longtask']});
    });
    await page.mouse.wheel(0,-45);
    await page.waitForFunction(()=>groupCache.level===7&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));
    await page.waitForTimeout(250);
    const result=await page.evaluate(()=>{
      const m=boundaryMeasure;
      cancelAnimationFrame(m.frame);
      m.observer.disconnect();m.perf.disconnect();document.querySelector('#mapMarkers').removeEventListener('animationstart',m.arrival,true);
      return {zoom,level:groupCache.level,markers:markerNodes.size,minVisible:m.minVisible,added:m.added,removed:m.removed,arrivals:m.arrivals,maxTask:Math.max(0,...m.tasks.map(t=>t.duration)),tasks:m.tasks,timings:m.timings.sort((a,b)=>b[2]-a[2]).slice(0,8)};
    });
    fs.mkdirSync('outputs/zoom-review',{recursive:true});
    fs.writeFileSync('outputs/zoom-review/'+(process.argv.includes('--baseline')?'before':'after')+'.json',JSON.stringify({rate:4,before,...result},null,2));
    console.log('Boundary zoom:',JSON.stringify(result));
    assert.ok(result.zoom>4.49,'The wheel crosses the boundary');
    assert.equal(result.level,7,'The higher zoom eventually reveals finer clusters');
    assert.ok(result.minVisible>0,'Every sampled transition frame retains visible discs');
    assert.ok(result.maxTask<50,`Boundary wheel tick stayed below 50ms (observed ${result.maxTask.toFixed(1)}ms)`);
    assert.equal(result.arrivals,0,'Existing map discs do not replay entrance animation');
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
    await page.mouse.wheel(0,45);
    await page.waitForFunction(()=>groupCache.level===6&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));
    assert.equal(await page.locator('.is-new,.is-retiring').count(),0,'Reversing across a cached boundary leaves no ghost markers');
    if(process.argv.includes('--zoom-visual')){
      await page.screenshot({path:'outputs/zoom-review/boundary-before.png'});
      await page.mouse.wheel(0,-45);
      await page.waitForFunction(()=>groupCache.level===7);
      await page.screenshot({path:'outputs/zoom-review/boundary-blend.png'});
      await page.waitForTimeout(300);
      await page.screenshot({path:'outputs/zoom-review/boundary-after.png'});
    }
    await page.evaluate(()=>{animateZoom(1.7);selectedBrands.clear();selectedBrands.add('Axiom');filter();});
    await page.waitForTimeout(1000);
    assert.ok(await page.evaluate(()=>groupCache.groups.every(g=>g.members.every(d=>d.brand==='Axiom'))),'A stale worker result cannot restore discs removed by a filter');
    assert.ok(await page.evaluate(()=>[...markerNodes.keys()].every(key=>filtered.some(d=>d.id===key))),'Interrupting a transition removes all obsolete markers');
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
}
