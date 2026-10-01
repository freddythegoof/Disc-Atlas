import assert from 'node:assert/strict';
import fs from 'node:fs';

export const settleMap=page=>page.waitForFunction(()=>!cameraTween&&groupCache.items===filtered&&groupCache.level===(AtlasGroups.level?.(zoom,groupCache.level)??Math.round(Math.log2(zoom)*3))&&!document.querySelector('#mapMarkers').classList.contains('is-regrouping'));
export async function frameBand(page,z,py=.1){
 await page.evaluate(({z,py})=>{stopCamera();zoom=z;const a=AtlasLayout.bounds(mapViewport.width,mapViewport.height);pan={x:mapViewport.width/2-a.left-.5*a.width*z,y:430-a.bottom+py*a.height*z};draw();},{z,py});
 await settleMap(page);await page.waitForTimeout(350);
}
export const measureBand=page=>page.evaluate(()=>{
 const visible=mapClusters.filter(g=>g.x>70&&g.x<mapViewport.width-70&&g.y>110&&g.y<690);
 const labels=[...document.querySelectorAll('.marker-position:not(.is-retiring) .marker-name')].filter(n=>{const s=getComputedStyle(n),r=n.getBoundingClientRect();return s.visibility!=='hidden'&&Number(s.opacity)>.01&&r.bottom>110&&r.top<690;}).map(n=>({name:n.textContent,r:n.getBoundingClientRect()}));
 const labeled=g=>{const n=markerNodes.get(g.key)?.querySelector('.marker-name'),s=n&&getComputedStyle(n);return planetLabels.get(g.key)?.opacity>.01||(s&&s.visibility!=='hidden'&&Number(s.opacity)>.01);};
 const primaries=visible.filter(g=>g.large),dots=visible.filter(g=>!g.large);
 const pairs=visible.flatMap((g,i)=>visible.slice(i+1).map(h=>({g,h,d:Math.hypot(g.x-h.x,g.y-h.y)})));
 const putters=visible.filter(g=>typeOf(g.lead)==='putter');
 const putterGroups=groupCache.groups.filter(g=>g.members.some(d=>typeOf(d)==='putter'));
 return {zoom,level:groupCache.level,visible:visible.length,primaries:primaries.length,satellites:dots.length,labeledSatellites:dots.filter(labeled).length,
  putters:{visible:putters.length,satellites:putters.filter(g=>!g.large).length,labeledSatellites:putters.filter(g=>!g.large&&labeled(g)).length,
   stacks:putters.filter(g=>g.members.length>1).length,
   wholeBandStackExtras:putterGroups.reduce((n,g)=>n+Math.max(0,g.members.filter(d=>typeOf(d)==='putter').length-1),0)},
  stacks:visible.filter(g=>g.members.length>1).length,stackMembers:visible.reduce((n,g)=>n+g.members.length-1,0),largest:Math.max(...visible.map(g=>g.members.length)),
  crowdedDotPairs:pairs.filter(p=>(!p.g.large||!p.h.large)&&p.d<40).length,
  primaryGap:Math.min(...pairs.filter(p=>p.g.large&&p.h.large).map(p=>p.d-54*mapMarkerScale())),
  scale:mapMarkerScale(),artScale:Math.max(...[...markerNodes.values()].filter(n=>n.classList.contains('is-large')&&!n.position.classList.contains('is-retiring')).map(n=>Number(n.art.style.scale))),
  leaders:[...planetLabels.values()].filter(p=>p.opacity>.01&&p.leader!==false).length,
  overlaps:labels.flatMap((a,i)=>labels.slice(i+1).filter(b=>a.r.left<b.r.right&&a.r.right>b.r.left&&a.r.top<b.r.bottom&&a.r.bottom>b.r.top).map(b=>[a.name,b.name])),
  honest:visible.every(g=>g.x===g.actualX&&g.y===g.actualY),totalDiscs:groupCache.groups.reduce((n,g)=>n+g.members.length,0)};
});
export async function checkZoomCandidates(browser,base){
 const dir='outputs/grouping-zoom',baseline=process.argv.includes('--baseline'),suffix=baseline?'before':'after';fs.mkdirSync(dir,{recursive:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'dark'}),page=await context.newPage();
 try{
  await page.goto(base);await page.locator('.atlas-marker.is-selected').waitFor();await page.evaluate(()=>document.fonts.ready);await page.mouse.move(10,80);
  const results=[];
  // Camera probes intentionally bypass the shipped ceiling; no candidate is selected yet.
  for(const z of [3,5,7,8,9,10]){
   await frameBand(page,z);const state=await measureBand(page);results.push(state);
   await page.screenshot({path:`${dir}/putter-${z}x-${suffix}.png`});
   if(!baseline){
    assert.equal(state.labeledSatellites,0);assert.equal(state.leaders,0);assert.deepEqual(state.overlaps,[]);
    assert.ok(state.honest);assert.ok(state.scale<=1.24&&state.artScale<=1.24);assert.ok(state.primaries>0);
    assert.ok(state.largest<=(z===3?5:3));
   }
  }
  fs.writeFileSync(`${dir}/candidates-${suffix}.json`,JSON.stringify(results,null,2));console.log(results);
 }finally{await context.close();}
}
