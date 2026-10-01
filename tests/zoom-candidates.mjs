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
 const artwork=mapClusters.filter(g=>g.large||g.satellite).map(g=>({key:g.key,r:markerNodes.get(g.key)?.querySelector('.disc-art')?.getBoundingClientRect()})).filter(a=>a.r);
 const rectanglesOverlap=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
 const markerOverlaps=artwork.flatMap((a,i)=>artwork.slice(i+1).filter(b=>rectanglesOverlap(a.r,b.r)).map(b=>[a.key,b.key]));
 for(const a of artwork)for(const b of labels)if(rectanglesOverlap(a.r,b.r))markerOverlaps.push([a.key,b.name]);
 const vectors=mapClusters.filter(g=>g.leader).map(g=>({key:g.key,...g.leader}));
 const leaderCollisions=vectors.flatMap((a,i)=>vectors.slice(i+1).filter(b=>AtlasGroups.segmentsCross(a,b)).map(b=>[a.key,b.key]));
 for(const a of vectors)for(const b of [...labels,...artwork]){
  const r=b.r,box={x:r.left-mapViewport.left,y:r.top-mapViewport.top,w:r.width,h:r.height};
  if(AtlasGroups.segmentHitsBox(a,box))leaderCollisions.push([a.key,b.name||b.key]);
 }

 const pairs=visible.flatMap((g,i)=>visible.slice(i+1).map(h=>({g,h,d:Math.hypot(g.x-h.x,g.y-h.y)})));
 const putters=visible.filter(g=>typeOf(g.lead)==='putter');
 const putterGroups=groupCache.groups.filter(g=>g.members.some(d=>typeOf(d)==='putter'));
 return {zoom,level:groupCache.level,visible:visible.length,primaries:primaries.length,satellites:dots.length,labeledSatellites:dots.filter(labeled).length,
  readableSatellites:dots.filter(g=>g.members.length===1&&g.satellite&&labeled(g)).length,
  markerOverlaps,leaderCollisions,maxOffset:Math.max(0,...visible.map(g=>Math.hypot(g.x-g.actualX,g.y-g.actualY))),
  unstackedSatellites:dots.filter(g=>g.members.length===1).length,
  unlabeledSingles:dots.filter(g=>g.members.length===1&&!labeled(g)).map(g=>g.lead.name),
  putters:{visible:putters.length,satellites:putters.filter(g=>!g.large).length,labeledSatellites:putters.filter(g=>!g.large&&labeled(g)).length,
   stacks:putters.filter(g=>g.members.length>1).length,
   wholeBandStackExtras:putterGroups.reduce((n,g)=>n+Math.max(0,g.members.filter(d=>typeOf(d)==='putter').length-1),0)},
  stacks:visible.filter(g=>g.members.length>1).length,stackMembers:visible.reduce((n,g)=>n+g.members.length-1,0),largest:Math.max(...visible.map(g=>g.members.length)),
  crowdedDotPairs:pairs.filter(p=>(!p.g.large||!p.h.large)&&p.d<40).length,
  primaryGap:Math.min(...pairs.filter(p=>p.g.large&&p.h.large).map(p=>p.d-54*mapMarkerScale())),
  scale:mapMarkerScale(),artScale:Math.max(...[...markerNodes.values()].filter(n=>n.classList.contains('is-large')&&!n.position.classList.contains('is-retiring')).map(n=>Number(n.art.style.scale))),
  leaders:vectors.length+[...planetLabels.values()].filter(p=>p.opacity>.01&&p.leader!==false).length,
  overlaps:labels.flatMap((a,i)=>labels.slice(i+1).filter(b=>a.r.left<b.r.right&&a.r.right>b.r.left&&a.r.top<b.r.bottom&&a.r.bottom>b.r.top).map(b=>[a.name,b.name])),
  honest:visible.every(g=>Math.hypot(g.x-g.actualX,g.y-g.actualY)<.01||(g.satellite&&g.leader&&Math.hypot(g.leader.x2-g.actualX,g.leader.y2-g.actualY)<.01)),totalDiscs:groupCache.groups.reduce((n,g)=>n+g.members.length,0)};
});
// Independently search a dense 4px grid, beyond the runtime's radial candidates.
// Fallbacks must genuinely have no clean marker/label/vector placement nearby.
export const verifySatelliteFallbacks=page=>page.evaluate(()=>{
 const ratio=zoom/2**(groupCache.level/3),groups=groupCache.groups;
 const visible=mapClusters.filter(g=>!g.large&&!g.satellite&&g.members.length===1&&g.x>70&&g.x<mapViewport.width-70&&g.y>110&&g.y<690);
 const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
 return visible.map(g=>{
  const x=g.px*ratio,y=-g.py*ratio,f=groupCache.footprints.get(g.key).satellite,r=f.radius+2;
  const boxes=groups.flatMap(h=>{
   const hx=h.px*ratio,hy=-h.py*ratio,hf=groupCache.footprints.get(h.key);
   if(h.large){const radius=hf.radius*mapMarkerScale();return [{x:hx-radius,y:hy-radius,w:radius*2,h:radius*2},{x:hx+hf.x,y:hy+hf.y,w:hf.w,h:hf.h}];}
   if(h.key===g.key)return [];
   const radius=h.members.length>1?12:8,result=[{x:hx-radius,y:hy-radius,w:radius*2,h:radius*2}];
   if(h.satellite){const sf=hf.satellite,sr=sf.radius+2,mx=hx+h.markerOffset.x,my=hy+h.markerOffset.y;
    result.push({x:mx-sr,y:my-sr,w:sr*2,h:sr*2},{x:mx+sf.x+h.labelOffset.x,y:my+sf.y+h.labelOffset.y,w:sf.w,h:sf.h});}
   return result;
  });
  const vectors=groups.filter(h=>h.leader).map(h=>h.leader);
  const endpointObstructed=boxes.some(b=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h);
  let fits=false;
  for(let dx=-56;dx<=56&&!fits;dx+=4)for(let dy=-56;dy<=56&&!fits;dy+=4){
   const distance=Math.hypot(dx,dy);if(distance>56||distance>0&&distance<24)continue;
   const mx=x+dx,my=y+dy,marker={x:mx-r,y:my-r,w:r*2,h:r*2};
   if(boxes.some(b=>overlap(marker,b))||vectors.some(v=>AtlasGroups.segmentHitsBox(v,marker)))continue;
   const edge=Math.max(Math.abs(dx),Math.abs(dy)),vector=distance?{x1:mx-dx*r/edge,y1:my-dy*r/edge,x2:x,y2:y}:null;
   if(vector&&(boxes.some(b=>AtlasGroups.segmentHitsBox(vector,b))||vectors.some(v=>AtlasGroups.segmentsCross(vector,v))))continue;
   for(const offset of [{x:f.x,y:f.y},{x:f.x,y:-18-f.h},{x:r+6,y:-f.h/2},{x:-r-6-f.w,y:-f.h/2}]){
    const label={x:mx+offset.x,y:my+offset.y,w:f.w,h:f.h};
    if(!boxes.some(b=>overlap(label,b))&&!vectors.some(v=>AtlasGroups.segmentHitsBox(v,label))&&(!vector||!AtlasGroups.segmentHitsBox(vector,label))){fits=true;break;}
   }
  }
  return {key:g.key,name:g.lead.name,noCleanPlacement:!fits,endpointObstructed};
 });
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
    if(z<7)assert.equal(state.labeledSatellites,0);
    else assert.ok(state.labeledSatellites>0,'Max zoom promotes measured satellite labels');
    if(z<7)assert.equal(state.leaders,0);assert.deepEqual(state.overlaps,[]);assert.deepEqual(state.markerOverlaps,[]);assert.deepEqual(state.leaderCollisions,[]);
    assert.ok(state.honest);assert.ok(state.scale<=1.24&&state.artScale<=1.24);assert.ok(state.primaries>0);
    assert.ok(state.largest<=(z===3?5:3));
   }
  }
  fs.writeFileSync(`${dir}/candidates-${suffix}.json`,JSON.stringify(results,null,2));console.log(results);
 }finally{await context.close();}
}
