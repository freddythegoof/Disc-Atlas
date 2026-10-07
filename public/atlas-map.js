// Stable scattered flight positions, grouped only where screen space is limited.
let mapClusters=[],activeCluster=null,clusterPinned=false,clusterAnchor=null,clusterPicks=new Set(),clusterCompared=false;
let clusterHoverTimer=null,clusterCloseTimer=null,mapDrag=null;
function photoMarkup(d,extra=''){
 const label=d.catalogName||d.name;
 return `<span class="disc-art clean-disc ${extra}" style="--disc-color:${discColor(d)}" role="img" aria-label="${esc(d.brand+' '+label)} — representative disc illustration"></span>`;
}
let atlasPositions = new Map();
let groupCache=null;
let groupRevision=0,groupWorker=null,groupContext=null,regrouping=false,retirementTimer=null,retirementFrame=0,regroupToken=0,hasPaintedMarkers=false;
const preparedGroups=new Map(),pendingGroups=new Set();
const markerNodes=new Map();
const MAX_MAP_ZOOM=9;
const planetLabels=new Map();
let satelliteLabelsSuppressed=false;
let mapViewport=null;
const fullLabelFootprints=new Map();
function measureFullLabels(items){
 const mobile=innerWidth<700,keyPrefix=mobile?'mobile:':'desktop:',pending=[];
 const host=document.createElement('div');host.style.cssText='position:absolute;visibility:hidden;pointer-events:none';
 for(const d of items){
  const key=keyPrefix+d.id;if(fullLabelFootprints.has(key))continue;
  const node=document.createElement('div');node.className='atlas-marker is-large overview';
  node.innerHTML='<span class="marker-name">'+esc(d.catalogName||d.name)+'<small>'+esc(d.brand)+'</small></span>';
  const satellite=node.cloneNode(true);satellite.className='atlas-marker is-dot is-satellite overview';
  host.append(node,satellite);pending.push({key,node,satellite});
 }
 if(pending.length){
  $('#mapMarkers').append(host);
  // Batch writes before reads; this runs only for new labels/breakpoints/fonts.
  for(const {key,node,satellite} of pending){
   const marker=node.getBoundingClientRect(),label=node.firstChild.getBoundingClientRect();
   const gap=parseFloat(getComputedStyle(node.firstChild).lineHeight)/4;
   const dot=satellite.getBoundingClientRect(),dotLabel=satellite.firstChild.getBoundingClientRect();
   fullLabelFootprints.set(key,{x:label.x-marker.x-marker.width/2-gap,y:label.y-marker.y-marker.height/2-gap,
    w:label.width+gap*2,h:label.height+gap*2,radius:marker.width/2,
    satellite:{x:dotLabel.x-dot.x-dot.width/2-gap,y:dotLabel.y-dot.y-dot.height/2-gap,
     w:dotLabel.width+gap*2,h:dotLabel.height+gap*2,radius:14}});
  }
  host.remove();
 }
 return new Map(items.map(d=>[d.id,fullLabelFootprints.get(keyPrefix+d.id)]));
}
// Label footprints must use the real fonts. A face first requested by these measurements loads
// after fonts.ready, so measure again whenever any font finishes loading.
const remeasureLabels=()=>{fullLabelFootprints.clear();groupContext=null;scheduleMapDraw();};
document.fonts.ready.then(remeasureLabels);document.fonts.addEventListener?.('loadingdone',remeasureLabels);
function measureMap(){mapViewport=canvas.getBoundingClientRect();}
function cancelRegroup(){
 regroupToken++;clearTimeout(retirementTimer);cancelAnimationFrame(retirementFrame);
 retirementTimer=null;retirementFrame=0;regrouping=false;
 for(const node of markerNodes.values())node.position.classList.remove('is-updating');
 $('#mapMarkers').classList.remove('is-regrouping');
}
function hydrateGroups(raw,items,w,h,level,immersive){
 const byId=new Map(items.map(d=>[d.id,d]));
 return {items,w,h,level,immersive,footprints:measureFullLabels(items),extent:raw.extent,groups:raw.groups.map(g=>({
  ...g,members:g.members.map(id=>byId.get(id)),lead:byId.get(g.key)
 }))};
}
function prepareGroups(level,items,w,h,immersive){
 if(preparedGroups.has(level)||pendingGroups.has(level)||!groupWorker)return;
 pendingGroups.add(level);
 groupWorker.postMessage({revision:groupRevision,level,width:w,height:h,immersive,personal:!!myMap,footprints:groupContext.footprints,featured:atlasPriority(),
  items:items.map(d=>({id:d.id,name:d.name,brand:d.brand,speed:d.speed})),
  positions:items.filter(d=>atlasPositions.has(d.id)).map(d=>[d.id,atlasPositions.get(d.id)])});
}
function ensureGroupWorker(){
 if(groupWorker||!window.Worker)return;
 try{
  groupWorker=new Worker('atlas-groups-worker.js');
  groupWorker.onmessage=event=>{
   const {revision,level,...raw}=event.data;
   if(revision!==groupRevision||!groupContext)return;
   pendingGroups.delete(level);
   const {items,w,h,immersive}=groupContext;
   preparedGroups.set(level,hydrateGroups(raw,items,w,h,level,immersive));
   if(!cameraTween&&AtlasGroups.level(zoom,groupCache?.level)===level)scheduleMapDraw();
  };
  groupWorker.onerror=()=>{groupWorker.terminate();groupWorker=null;pendingGroups.clear();scheduleMapDraw();};
 }catch{groupWorker=null;}
}
function prepareZoomLevel(nextZoom){
 if(!groupContext)return;
 const level=AtlasGroups.level(nextZoom,groupCache?.level);
 if(level!==groupCache?.level){const {items,w,h,immersive}=groupContext;prepareGroups(level,items,w,h,immersive);}
}
function buildClusters(items,w,h){
 const immersive=!document.body.classList.contains('my-bag-mode'),area=window.AtlasLayout.bounds(w,h,immersive);
 const changed=!groupContext||groupContext.items!==items||groupContext.w!==w||groupContext.h!==h||groupContext.immersive!==immersive;
 if(changed){
  cancelRegroup();
  for(const node of markerNodes.values()){node.position.classList.remove('is-new','is-retiring');node.position.inert=false;}
  groupRevision++;groupContext={items,w,h,immersive,footprints:measureFullLabels(items)};preparedGroups.clear();pendingGroups.clear();
  if(groupCache){groupCache.footprints=measureFullLabels(groupCache.items);groupCache.prominenceZoom=null;}
  ensureGroupWorker();
  // The initial map has no previous frame to retain. Later filter/size changes
  // use the same worker and staged swap as zoom changes, even at the same level.
  if(!groupCache||!hasPaintedMarkers){
   const initial=Math.round(Math.log2(zoom)*3);
   groupCache=hydrateGroups(window.AtlasGroups.build(items,shownPositions(items,w,h,immersive),w,h,initial,immersive,groupContext.footprints,atlasPriority()),items,w,h,initial,immersive);
   preparedGroups.set(initial,groupCache);
  }
 }
 // Keep the current map intact while a different density is prepared in a worker.
 const level=groupCache&&(cameraTween||mapDrag)?groupCache.level:AtlasGroups.level(zoom,groupCache?.level);
 const contextPending=groupCache.items!==items||groupCache.w!==w||groupCache.h!==h||groupCache.immersive!==immersive;
 let appliedContext=false;
 if(contextPending||level!==groupCache.level){
  if(preparedGroups.has(level)){
   cancelRegroup();groupCache=preparedGroups.get(level);regrouping=true;appliedContext=contextPending;
   $('#mapMarkers').classList.add('is-regrouping');
  }
  else if(groupWorker)prepareGroups(level,items,w,h,immersive);
  else {groupCache=hydrateGroups(window.AtlasGroups.build(items,shownPositions(items,w,h,immersive),w,h,level,immersive,groupContext.footprints,atlasPriority()),items,w,h,level,immersive);appliedContext=contextPending;}
 }
 // Labels do not scale with the camera. Recheck at the actual zoom, including
 // intermediate animation frames and while a new worker level is pending.
 if(groupCache.prominenceZoom!==zoom){
  const satellites=zoom>=7?new Map([...groupCache.footprints].map(([key,f])=>[key,f.satellite])):undefined;
  const minors=zoom<2.9&&(!satelliteLabelsSuppressed||zoom<=2.7)?new Map([...groupCache.footprints].map(([key,f])=>[key,f.satellite])):undefined;
  window.AtlasGroups.promote(groupCache.groups,groupCache.footprints,zoom,2**(groupCache.level/3),satellites,minors);
  groupCache.prominenceZoom=zoom;
 }
 const bounded=window.AtlasLayout.constrain({zoom,...pan},area,groupCache.extent);
 pan={x:bounded.x,y:bounded.y};
 const result=[];
 for(const g of groupCache.groups){
  const x=area.left+g.pos.x*area.width*zoom+pan.x,y=area.bottom-g.pos.y*area.height*zoom+pan.y;
  // Keep the entire enlarged disc beyond the clipped plot viewport.
  // A 48px entry band covers its radius; the wider exit band prevents DOM churn.
  const margin=markerNodes.has(g.key)?80:48;
  // Discs run on under the toolbar and legend to the map's own edges.
  if(x < -margin||x>w+margin||y < -margin||y>h+margin)continue;
  const original=g.pos;
  const dx=g.markerOffset?.x||0,dy=g.markerOffset?.y||0;
  const leader=g.leader?{x1:x+g.leader.x1-g.px*zoom/(2**(groupCache.level/3)),
   y1:y+g.leader.y1+g.py*zoom/(2**(groupCache.level/3)),x2:x,y2:y}:null;
  result.push({...g,x:x+dx,y:y+dy,leader,actualX:area.left+original.x*area.width*zoom+pan.x,actualY:area.bottom-original.y*area.height*zoom+pan.y});
 }
 // Evaluate offscreen filter results only after their worker result is applied.
 // Keeping the old groups visible must not suppress the existing Show all fallback.
 if(appliedContext&&!result.length&&items.some(d=>d.speed!=null)&&zoom!==1){
  zoom=1;pan={x:0,y:0};return buildClusters(items,w,h);
 }
 return result;
}
// Where discs are drawn: a filtered map spreads into the room it frees, as the worker does.
function shownPositions(items,w,h,immersive){
 // My Map's lens already supplies consensus + copy notes. Amplifying its scatter and repelling
 // neighbors again can reverse speed ordering (Premier DD1/DD3). Only the Atlas adapts filters.
 return myMap?atlasPositions:window.AtlasLayout.adapt(items,atlasPositions,w,h,immersive);
}
function shownPosition(id){
 const {width:w,height:h}=mapViewport||canvas.getBoundingClientRect();
 return shownPositions(filtered,w,h,!document.body.classList.contains('my-bag-mode')).get(id)??atlasPositions.get(id);
}
function focusFeatured(){
 const d=filtered.find(d=>d.name.toLowerCase()==='destroyer'&&/innova/i.test(d.brand)&&d.speed!=null)||filtered.find(d=>d.speed!=null);
 if(!d)return;
 selected=d;const p=shownPosition(d.id);if(!p)return;
 const camera=window.AtlasLayout.camera(p,canvas.clientWidth,canvas.clientHeight,innerWidth<700?4:2.8);
 zoom=camera.zoom;pan={x:camera.x,y:camera.y};draw();
}
function draw(){
 // Fonts/worker callbacks can schedule a frame before app.js has initialized.
 if(typeof view==='undefined'||view!=='map')return;
 if(!mapViewport)measureMap();const {width:w,height:h}=mapViewport;if(!w||!h)return;
 const dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.font='12px DM Sans, sans-serif';}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const immersive=!document.body.classList.contains('my-bag-mode');
 const area=window.AtlasLayout.bounds(w,h,immersive),plotBottom=h-(immersive?(w<700?155:110):16);
 mapClusters=buildClusters(filtered,w,h);
 const x=s=>area.left+(s/100)*area.width*zoom+pan.x,y=s=>area.bottom-((s-1)/14)*area.height*zoom+pan.y;
 ctx.lineWidth=1;
 ctx.globalAlpha=Math.min(.65,.16+(zoom-1)*.13);
 // The grid runs under the chrome with the discs; speed numbers stay clear of the captions.
 for(let n=1;n<=15;n+=zoom<1.8?2:1){const yy=y(n);if(yy<0||yy>h)continue;ctx.strokeStyle=themePalette.grid;ctx.beginPath();ctx.moveTo(31,yy);ctx.lineTo(w-16,yy);ctx.stroke();if(yy<(immersive?82:26)||yy>plotBottom)continue;ctx.fillStyle=themePalette.muted;ctx.fillText(n,10,yy+4);}
 for(let n=0;n<=100;n+=zoom<1.8?20:10){const xx=x(n);if(xx<28||xx>w-15)continue;ctx.strokeStyle=n===50?themePalette.center:themePalette.grid;ctx.setLineDash(n===50?[]:[2,6]);ctx.beginPath();ctx.moveTo(xx,0);ctx.lineTo(xx,h);ctx.stroke();}ctx.setLineDash([]);ctx.globalAlpha=1;
 // My Map: a disc moved by the player's stability notes keeps a faint ring where the consensus puts it.
 if(myMap){
  ctx.save();ctx.strokeStyle=themePalette.muted;ctx.globalAlpha=.6;ctx.setLineDash([3,4]);
  for(const [id,shift] of myMap.shifts){
   const consensus=sharedPositions.get(id),personal=atlasPositions.get(id);if(!shift||!consensus||!personal)continue;
   const to=shownPosition(id);
   // The ring keeps its offset from the disc as shown, which a sparse map may have spread.
   const from={x:to.x-personal.x+consensus.x,y:to.y};
   const fx=area.left+from.x*area.width*zoom+pan.x,fy=area.bottom-from.y*area.height*zoom+pan.y;
   ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(area.left+to.x*area.width*zoom+pan.x,fy);ctx.stroke();
   ctx.beginPath();ctx.arc(fx,fy,7,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
 }
 // Explain the selected disc's offset without turning a dense view into a web of lines.
 for(const g of mapClusters){if(!g.satellite&&g.members.includes(selected)&&Math.hypot(g.x-g.actualX,g.y-g.actualY)>13){ctx.strokeStyle=themePalette.grid;ctx.beginPath();ctx.moveTo(g.actualX,g.actualY);ctx.lineTo(g.x,g.y);ctx.stroke();}}
 drawPlanetLabels();
 renderMarkers();drawSatelliteLeaders();setMapText($('#zoomLabel'),'Zoom '+zoom.toFixed(1)+'×');$('#empty').hidden=filtered.some(d=>d.speed!=null);setMapText($('#empty').firstChild,'No discs match these filters.');setMapText($('#emptyReset'),'Clear filters');
 setMapText($('#mapSummary'),`${mapClusters.length} flight ${mapClusters.length===1?'group':'groups'} · ${filtered.filter(d=>d.speed!=null).length} discs`);
}
function drawSatelliteLeaders(){
 if(zoom<7)return;
 ctx.save();
 ctx.strokeStyle=themePalette.muted;ctx.fillStyle=themePalette.muted;ctx.globalAlpha=.35;ctx.lineWidth=1;
 for(const g of mapClusters){
  const node=markerNodes.get(g.key),l=g.leader;
  if(!l||!node||node.groupVersion!==groupCache||node.mapX!==g.x||node.mapY!==g.y)continue;
  ctx.beginPath();ctx.moveTo(l.x1,l.y1);ctx.lineTo(l.x2,l.y2);ctx.stroke();
  ctx.beginPath();ctx.arc(l.x2,l.y2,1.5,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
}
function setMapText(node,text){if(node.textContent!==text)node.textContent=text;}
// Growth settles before the deepest regroup boundary; only artwork scales.
function mapMarkerScale(){return 1+.08*(Math.min(4,zoom)-1);}
function drawPlanetLabels(){
 // Preserve the shipped label-density hysteresis. Automatic low-zoom names
 // now come exclusively from measured DOM promotion at their true positions.
 if(zoom>=2.9)satelliteLabelsSuppressed=true;
 else if(zoom<=2.7)satelliteLabelsSuppressed=false;
 planetLabels.clear();groupCache.labelPlacements?.clear();
}
function renderMarkers(){
 const layer=$('#mapMarkers'),live=new Set(),brandView=!!(selectedBrands.size||myMap);
 const scale=mapMarkerScale();
 const scaleValue=scale.toFixed(3);
 const filterPending=groupCache.items!==filtered;
 // Artwork can retire in batches, but obsolete full labels must disappear
 // before a newly promoted neighbor paints. Do not fade colliding text out.
 const current=new Map(mapClusters.map(g=>[g.key,g]));
 for(const [key,node] of markerNodes){
  const g=current.get(key);
  const visible=g&&(g.large||g.minorLabel||satelliteLabelsSuppressed||zoom<7)&&node.groupVersion===groupCache&&node.mapX===g.x&&node.mapY===g.y;
  node.querySelector('.marker-name').style.visibility=visible?'':'hidden';
  // Drop an obsolete automatic label immediately, including budgeted updates.
  if(node.classList.contains('is-satellite')&&(!g?.satellite||!visible)){
   node.querySelector('.marker-name').style.visibility='hidden';
  }
 }
 let updated=0,pendingMarkers=false;
 for(const g of mapClusters){
  live.add(g.key);let node=markerNodes.get(g.key);const lead=g.lead,n=g.members.length,color=filterPending&&node?node.discColor:discColor(lead);
  // Existing markers can change size and label priority too; budget those updates
  // together with additions so the browser does not repaint a whole level at once.
  if(regrouping&&(!node||node.groupVersion!==groupCache)){
   if(updated>=8){pendingMarkers=true;continue;}updated++;
  }
  if(!node){
   node=document.createElement('button');node.type='button';node.dataset.cluster=g.key;node.className='atlas-marker';
   node.innerHTML='<span class="marker-halo"></span><span class="map-dot"></span><span class="marker-stack">'+photoMarkup(lead,'stack-0')+'</span><span class="cluster-count"></span><span class="marker-name">'+esc(lead.catalogName||lead.name)+'<small>'+esc(lead.brand)+'</small></span>';
   node.art=node.querySelector('.marker-stack');node.dot=node.querySelector('.map-dot');
   node.querySelector('.disc-art').style.removeProperty('--disc-color');
   node.badge=node.querySelector('.cluster-count');markerNodes.set(g.key,node);node.position=document.createElement('div');node.position.className='marker-position';
   if(regrouping){node.position.classList.add('is-new');node.position.inert=true;}
   node.position.append(node);layer.append(node.position);
   if(!hasPaintedMarkers)window.AtlasMotion?.enter(node);
   if(regrouping)requestAnimationFrame(()=>requestAnimationFrame(()=>{node.position.classList.remove('is-new');if(!node.position.classList.contains('is-retiring'))node.position.inert=false;}));
  }
  if(node.position.classList.contains('is-retiring')){node.position.classList.remove('is-retiring');node.position.inert=false;}
  if(node.discCount!==n){node.discCount=n;node.badge.hidden=n<2;node.badge.textContent=n;node.setAttribute('aria-label',(lead.catalogName||lead.name)+', '+lead.brand+', '+({putter:'Putter',mid:'Midrange',fairway:'Fairway driver',distance:'Distance driver',unknown:'Unrated'}[typeOf(lead)])+(n>1?' and '+(n-1)+' nearby discs':'')+' - view disc details');}
  if(node.discColor!==color){node.discColor=color;node.style.setProperty('--disc-color',color);}
  if(!filterPending&&(node.groupVersion!==groupCache||node.brandView!==brandView||node.selection!==selected||node.scaleLarge!==g.large)){
   if(regrouping&&node.groupVersion&&(node.classList.contains('is-large')!==g.large||node.mapX!==g.x||node.mapY!==g.y))node.position.classList.add('is-updating');
   const flags={'is-large':g.large,'is-dot':!g.large,'brand-view':brandView,overview:!brandView,'is-stack':n>1,'is-selected':g.members.includes(selected),'is-mine':!!myColor(lead)};
   for(const [name,on] of Object.entries(flags))if(node.classList.contains(name)!==on)node.classList.toggle(name,on);
   node.groupVersion=groupCache;node.brandView=brandView;node.selection=selected;
   node.position.style.zIndex=g.members.includes(selected)?3:g.large?2:1;
  }
  if(node.mapX!==g.x||node.mapY!==g.y){node.position.style.transform='translate3d('+g.x.toFixed(2)+'px,'+g.y.toFixed(2)+'px,0)';node.mapX=g.x;node.mapY=g.y;}
  node.querySelector('.marker-name').style.visibility=g.large||g.minorLabel||satelliteLabelsSuppressed||zoom<7?'':'hidden';
  if(node.classList.contains('is-minor-label')&&!g.minorLabel)node.querySelector('.marker-name').style.transition='none';
  node.classList.toggle('is-minor-label',!!g.minorLabel);
  node.classList.toggle('is-satellite',!!g.satellite);
  node.style.setProperty('--satellite-label-x',(g.labelOffset?.x||0)+'px');
  node.style.setProperty('--satellite-label-y',(g.labelOffset?.y||0)+'px');
  node.style.setProperty('--label-nudge-x',(g.nudge?.x||0)+'px');
  node.style.setProperty('--label-nudge-y',(g.nudge?.y||0)+'px');
  const selectedScale=g.members.includes(selected)?1.12:1;
  if(node.markerScale!==scaleValue||node.dotSelection!==selectedScale||node.scaleLarge!==g.large){
   if(g.large)node.art.style.scale=scaleValue;
   else{node.art.style.removeProperty('scale');node.dot.style.scale=(scale*selectedScale).toFixed(3);}
   node.markerScale=scaleValue;node.dotSelection=selectedScale;node.scaleLarge=g.large;
  }
 }
 if(mapClusters.length)hasPaintedMarkers=true;
 if(pendingMarkers){scheduleMapDraw();return;}
 if(regrouping){
  regrouping=false;
  for(const [key,node] of markerNodes)if(!live.has(key)){
   if(document.activeElement===node)$('#map').focus({preventScroll:true});
   node.position.classList.add('is-retiring');node.position.inert=true;
  }
  const token=regroupToken;
  retirementTimer=setTimeout(()=>{
   if(token!==regroupToken)return;
   retirementTimer=null;
   const removeBatch=()=>{
    if(token!==regroupToken)return;
    let removed=0;
    for(const [key,node] of markerNodes)if(node.position.classList.contains('is-retiring')){
     if(document.activeElement===node)$('#map').focus({preventScroll:true});
     window.gsap?.killTweensOf([node,...node.children]);node.position.remove();markerNodes.delete(key);
     if(++removed===8)break;
    }
    if([...markerNodes.values()].some(node=>node.position.classList.contains('is-retiring')))retirementFrame=requestAnimationFrame(removeBatch);
    else{retirementFrame=0;layer.classList.remove('is-regrouping');for(const node of markerNodes.values())node.position.classList.remove('is-updating');}
   };
   removeBatch();
  },200);
  return;
 }
 if(retirementTimer||retirementFrame)return;
 for(const [key,node] of markerNodes)if(!live.has(key)){
  if(document.activeElement===node)$('#map').focus({preventScroll:true});
  window.gsap?.killTweensOf([node,...node.children]);node.position.remove();markerNodes.delete(key);
 }
}
function clearClusterTimers(){clearTimeout(clusterHoverTimer);clearTimeout(clusterCloseTimer);clusterHoverTimer=null;clusterCloseTimer=null;}
function scheduleClusterClose(){clearTimeout(clusterHoverTimer);if(clusterPinned)return;clearTimeout(clusterCloseTimer);clusterCloseTimer=setTimeout(()=>closeCluster(),420);}
function closeCluster(restoreFocus=false){
 clearClusterTimers();const anchor=clusterAnchor;activeCluster=null;clusterPinned=false;clusterAnchor=null;clusterPicks.clear();clusterCompared=false;
 const pop=$('#clusterPopover');if(pop)pop.hidden=true;
 document.querySelectorAll('.atlas-marker.is-open').forEach(n=>n.classList.remove('is-open'));
 if(restoreFocus&&anchor?.isConnected)anchor.focus({preventScroll:true});
}
function openCluster(g,anchor,pinned=false){
 clearClusterTimers();if(!g)return;
 if(activeCluster?.key===g.key){clusterPinned=clusterPinned||pinned;if(pinned)$('#clusterClose').focus({preventScroll:true});return;}
 closeCluster();activeCluster={...g,members:[...g.members].sort((a,b)=>a.name.localeCompare(b.name))};clusterAnchor=anchor;clusterPinned=pinned;clusterPicks=new Set();clusterCompared=false;
 anchor?.classList.add('is-open');renderCluster();positionCluster();
 if(pinned)$('#clusterClose').focus({preventScroll:true});
}
function positionCluster(){
 if(!activeCluster)return;const pop=$('#clusterPopover'),a=clusterAnchor?.getBoundingClientRect()||$('#map').getBoundingClientRect();
 const width=Math.min(680,innerWidth-24);pop.style.width=width+'px';
 // Reserve the entire control band, including when the popover is a mobile sheet.
 const controlTop=$('.map-controls').getBoundingClientRect().top,coach=$('#coachButton');
 const ceiling=Math.min(controlTop,getComputedStyle(coach).visibility==='hidden'?controlTop:coach.getBoundingClientRect().top)-16;
 pop.style.maxHeight=Math.max(120,ceiling-16)+'px';
 if(innerWidth<700){pop.style.left='12px';pop.style.top='';pop.style.bottom=(innerHeight-ceiling)+'px';return;}
 pop.style.bottom='';const height=Math.min(pop.getBoundingClientRect().height,ceiling-16);
 let left=a.right+16,top=a.top-24;
 if(left+width>innerWidth-12){left=a.left-width-16;if(left<12){left=Math.max(12,Math.min(innerWidth-width-12,a.left-width/2));top=a.bottom+16;if(top+height>innerHeight-12)top=a.top-height-16;}}
 pop.style.left=Math.max(12,Math.min(innerWidth-width-12,left))+'px';pop.style.top=Math.max(12,Math.min(ceiling-height,top))+'px';
}
function comparisonPalette(){return brandPalette.slice(0,3);}
function comparisonMarkup(items){
 const palette=comparisonPalette();
 return `<div class="cluster-flight"><div class="flight-overlay-label"><span>FLIGHT OVERLAY</span><span>${hand} · ${power}% power</span></div><svg viewBox="0 0 250 180" role="img" aria-label="Illustrative flight comparison"><path d="M125 155V12 M30 50H220 M30 100H220 M30 150H220" stroke="${themePalette.grid}" fill="none" stroke-dasharray="3 5"/>${items.map((d,i)=>`<path class="comparison-route" d="${path(d)}" fill="none" stroke="${palette[i]}" stroke-width="3" stroke-linecap="round" ${i===1?'stroke-dasharray="8 4"':i===2?'stroke-dasharray="2 4"':''}/>`).join('')}<circle cx="125" cy="155" r="4" fill="${themePalette.text}"/></svg><p class="micro">Flat release · illustrative paths</p></div><div class="cluster-specs">${items.map((d,i)=>`<div class="cluster-stat"><strong><i class="dot" style="background:${palette[i]}"></i>${esc(d.catalogName||d.name)}</strong><small>${esc(d.brand)}</small><div class="mini-numbers">${['speed','glide','turn','fade'].map(k=>`<span><b>${d[k]}</b><small>${k[0].toUpperCase()}</small></span>`).join('')}</div><span class="micro">${stability(d)} · index ${score(d)}</span></div>`).join('')}</div>`;
}
function renderCluster(){
 if(!activeCluster)return;const pop=$('#clusterPopover'),items=activeCluster.members,small=items.length<=3,speeds=items.map(d=>d.speed),scores=items.map(score),range=a=>Math.min(...a)===Math.max(...a)?String(a[0]):`${Math.min(...a)}–${Math.max(...a)}`;
 pop.hidden=false;pop.innerHTML=`<div class="cluster-heading"><div><div class="eyebrow">${small?'THE FLIGHT MATCHUP':'EXPLORE THIS FLIGHT GROUP'}</div><h3 id="clusterTitle">${items.length===1?esc(items[0].catalogName||items[0].name):items.length+' discs. Similar territory.'}</h3><p>Speed ${range(speeds)} <span>•</span> Stability ${range(scores)}</p></div><button id="clusterClose" aria-label="Close disc group" type="button">×</button></div><div class="cluster-scroll"><div class="cluster-gallery ${small?'small-group':''}">${items.map(d=>`<article class="cluster-disc"><button class="inspect-disc" type="button" data-inspect="${d.id}" aria-label="Inspect ${esc(d.brand+' '+(d.catalogName||d.name))}">${photoMarkup(d)}<strong>${esc(d.catalogName||d.name)}</strong><small>${esc(d.brand)}</small></button>${!small?`<button class="pick-compare ${clusterPicks.has(d.id)?'is-picked':''}" type="button" data-pick="${d.id}" aria-pressed="${clusterPicks.has(d.id)}">${clusterPicks.has(d.id)?'✓ Selected':'+ Compare'}</button>`:''}</article>`).join('')}</div>${small?`<div class="auto-compare-label">${items.length>1?'AUTOMATIC COMPARISON':'FLIGHT PREVIEW'}</div><div class="cluster-comparison">${comparisonMarkup(items)}</div>`:`<div id="clusterComparison" class="cluster-comparison" ${clusterCompared?'':'hidden'}>${clusterCompared?comparisonMarkup(items.filter(d=>clusterPicks.has(d.id))):''}</div>`}</div><div class="cluster-footer">${small?`<span class="micro">Select a disc to see its full details.</span><button type="button" id="keepComparison" class="cluster-action">Keep ${items.length>1?'comparison':'disc'}</button>`:`<span id="clusterPickStatus" class="micro" aria-live="polite">${clusterPicks.size} / 3 selected · choose up to three</span><button type="button" id="compareCluster" class="cluster-action" ${clusterPicks.size<2?'disabled':''}>Compare selected${clusterPicks.size?' ('+clusterPicks.size+')':''}</button>`}</div>`;
}
function initAtlasMap(){
 const map=$('#map'),layer=$('#mapMarkers'),pop=$('#clusterPopover');
 const glow=document.createElement('div');glow.className='map-edge-feedback';glow.setAttribute('aria-hidden','true');
 for(const side of ['left','right','top','bottom']){const edge=document.createElement('i');edge.className=side;glow.append(edge);}map.append(glow);
 map.addEventListener('pointerenter',measureMap);
 layer.addEventListener('pointerout',e=>{const button=e.target.closest('[data-cluster]');if(button&&!button.contains(e.relatedTarget))scheduleClusterClose();});
 map.addEventListener('click',e=>{
  if(e.target.closest('.map-controls,#clusterPopover,a')||mapMoved&&e.detail!==0)return;
  const button=e.target.closest('[data-cluster]');
  if(!button&&(zoom<2.7||e.target.closest('button')))return;
  let group=button?mapClusters.find(g=>g.key===button.dataset.cluster):null;
  // Dot buttons have generous invisible targets. In a dense deep view those
  // can cover a neighbor's visible center; resolve pointer clicks spatially.
  // Keyboard activation keeps the focused button's identity.
  if(zoom>=2.7&&e.detail!==0){
   const x=e.clientX-mapViewport.left,y=e.clientY-mapViewport.top;let best=Infinity;
   group=null;
   for(const g of mapClusters){
    const node=markerNodes.get(g.key);if(!node||node.position.inert)continue;
    const distance=Math.hypot(g.x-x,g.y-y),radius=g.large?34*mapMarkerScale()+8:22;
    if(distance<=radius&&distance<best){best=distance;group=g;}
   }
  }
  if(group){e.stopPropagation();if(group.members.length>1&&group.members.length<=3)openStackDetail(group,markerNodes.get(group.key));else select(group.lead);}
 });
 pop.addEventListener('pointerenter',()=>clearClusterTimers());pop.addEventListener('pointerleave',()=>scheduleClusterClose());
 pop.addEventListener('focusin',()=>{clusterPinned=true;clearClusterTimers();});
 pop.addEventListener('click',e=>{
  const close=e.target.closest('#clusterClose');if(close){closeCluster(true);return;}
  const inspect=e.target.closest('[data-inspect]');if(inspect){const d=discs.find(x=>x.id===inspect.dataset.inspect);closeCluster();select(d);return;}
  const pick=e.target.closest('[data-pick]');if(pick){clusterPinned=true;const id=pick.dataset.pick;if(clusterPicks.has(id))clusterPicks.delete(id);else if(clusterPicks.size<3)clusterPicks.add(id);else{$('#clusterPickStatus').textContent='Three selected. Remove one to choose another.';return;}clusterCompared=false;const scroll=$('.cluster-scroll').scrollTop;renderCluster();$('.cluster-scroll').scrollTop=scroll;document.querySelector(`[data-pick="${id}"]`)?.focus({preventScroll:true});return;}
  if(e.target.closest('#compareCluster')&&clusterPicks.size>=2){clusterPinned=true;clusterCompared=true;comparison=activeCluster.members.filter(d=>clusterPicks.has(d.id));renderCluster();renderCompare();if(selected)detail();$('#clusterComparison').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});$('#compareCluster').focus({preventScroll:true});return;}
  if(e.target.closest('#keepComparison')){comparison=[...activeCluster.members];renderCompare();if(selected)detail();closeCluster();$('#compareBar').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});}
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&activeCluster){e.preventDefault();closeCluster(true);}});
 document.addEventListener('pointerdown',e=>{if(activeCluster&&!pop.contains(e.target)&&!e.target.closest('[data-cluster]'))closeCluster();});
 document.addEventListener('error',e=>{if(e.target.tagName==='IMG'&&e.target.closest('.disc-art')){e.target.hidden=true;const fallback=e.target.closest('.disc-art').querySelector('.disc-symbol');if(fallback)fallback.hidden=false;}},true);
 const pointers=new Map();let pinchDistance=0,velocity={x:0,y:0},lastMove=0;
 map.addEventListener('pointerdown',e=>{
  if(e.button!==0||e.target.closest('.map-controls'))return;
  measureMap();stopCamera();resetEdge();closeCluster();velocity={x:0,y:0};lastMove=performance.now();mapMoved=false;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  mapDrag={x:e.clientX,y:e.clientY};
  if(!e.target.closest('button'))map.setPointerCapture(e.pointerId);
  map.classList.add('is-dragging');
  if(pointers.size===2){const [a,b]=[...pointers.values()];pinchDistance=Math.hypot(a.x-b.x,a.y-b.y);}
 });
 map.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId))return;
  const previous=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){const [a,b]=[...pointers.values()],distance=Math.hypot(a.x-b.x,a.y-b.y),r=mapViewport;
   if(pinchDistance)changeZoom(distance/pinchDistance,{x:(a.x+b.x)/2-r.left,y:(a.y+b.y)/2-r.top});
   pinchDistance=distance;velocity={x:0,y:0};mapMoved=true;
  }else{const dx=e.clientX-previous.x,dy=e.clientY-previous.y;
   if(!mapMoved&&Math.hypot(e.clientX-mapDrag.x,e.clientY-mapDrag.y)<5)return;
   const now=performance.now(),dt=Math.max(8,now-lastMove);lastMove=now;
   velocity={x:velocity.x*.55+dx/dt*.45,y:velocity.y*.55+dy/dt*.45};
   mapMoved=true;map.setPointerCapture(e.pointerId);panMap(dx,dy);
  }
 });
 const stop=e=>{if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);pinchDistance=0;mapDrag=pointers.size?[...pointers.values()][0]:null;
  if(!pointers.size){map.classList.remove('is-dragging');
   const hitEdge=!!(edgeFeedback.x||edgeFeedback.y);releaseEdge();
   if(!hitEdge&&e.type==='pointerup'&&mapMoved&&performance.now()-lastMove<90&&window.AtlasMotion?.enabled()){
    const vx=Math.max(-1.5,Math.min(1.5,velocity.x)),vy=Math.max(-1.5,Math.min(1.5,velocity.y));
    if(Math.hypot(vx,vy)>.025)tweenCamera({zoom,x:pan.x+vx*70,y:pan.y+vy*70},.24);
   }
  }else{velocity={x:0,y:0};lastMove=performance.now();}
  if(map.hasPointerCapture(e.pointerId))map.releasePointerCapture(e.pointerId);
  if(!pointers.size&&!cameraTween)scheduleMapDraw();
 };
 map.addEventListener('pointerup',stop);map.addEventListener('pointercancel',stop);map.addEventListener('lostpointercapture',stop);
 map.addEventListener('wheel',e=>{
  e.preventDefault();measureMap();
  // Wheel and trackpad pinch always zoom, including fine pixel deltas.
  // Capture over child controls too so the atlas never scrolls the document.
  resetEdge();
  const unit=e.deltaMode===1?16:e.deltaMode===2?mapViewport.height:1;
  const delta=Math.max(-600,Math.min(600,(e.deltaY || e.deltaX)*unit));
  animateZoom(Math.exp(-delta*.0015),{x:e.clientX-mapViewport.left,y:e.clientY-mapViewport.top});
 },{passive:false});
 map.addEventListener('keydown',e=>{if(e.target!==map)return;const commands={ArrowLeft:[40,0],ArrowRight:[-40,0],ArrowUp:[0,40],ArrowDown:[0,-40]};if(commands[e.key]){e.preventDefault();closeCluster();tweenCamera({zoom,x:(cameraDestination?.x??pan.x)+commands[e.key][0],y:(cameraDestination?.y??pan.y)+commands[e.key][1]},.22);}else if(e.key==='+'||e.key==='='){e.preventDefault();animateZoom(1.3);}else if(e.key==='-'){e.preventDefault();animateZoom(1/1.3);}});
 window.addEventListener('resize',()=>{stopCamera();closeCluster();});window.addEventListener('scroll',e=>{if(e.target===document)measureMap();if(activeCluster&&!clusterPinned&&!pop.contains(e.target))closeCluster();},true);
}
let mapMoved=false,mapFrame=0,cameraTween=null,cameraDestination=null;
const edgeFeedback={x:0,y:0};let edgeTween=null,edgeReleaseTimer=null;
function boundedCamera(target){
 const {width:w,height:h}=mapViewport;
 return window.AtlasLayout.constrain(target,window.AtlasLayout.bounds(w,h,!document.body.classList.contains('my-bag-mode')),groupCache?.extent);
}
function paintEdge(){
 const map=$('#map'),x=edgeFeedback.x,y=edgeFeedback.y;
 for(const [side,value] of [['left',x],['right',-x],['top',y],['bottom',-y]])map.style.setProperty('--edge-'+side,Math.max(0,value/12));
 const offset=window.AtlasMotion?.enabled()?`${x}px ${y}px`:'0px 0px';
 canvas.style.translate=offset;$('#mapMarkers').style.translate=offset;
}
function resetEdge(){clearTimeout(edgeReleaseTimer);edgeTween?.kill();edgeTween=null;if(!edgeFeedback.x&&!edgeFeedback.y)return;edgeFeedback.x=0;edgeFeedback.y=0;paintEdge();}
function releaseEdge(){
 clearTimeout(edgeReleaseTimer);edgeTween?.kill();
 if(!window.AtlasMotion?.enabled()){resetEdge();return;}
 edgeTween=gsap.to(edgeFeedback,{x:0,y:0,duration:.55,ease:'elastic.out(1,0.55)',onUpdate:paintEdge,onComplete:()=>{edgeTween=null;}});
}
function panMap(dx,dy){
 edgeTween?.kill();edgeTween=null;
 const target={zoom,x:pan.x+dx,y:pan.y+dy},bounded=boundedCamera(target);
 pan={x:bounded.x,y:bounded.y};
 for(const axis of ['x','y']){
  const excess=target[axis]-bounded[axis];
  edgeFeedback[axis]=excess?Math.sign(excess)*Math.min(12,Math.abs(edgeFeedback[axis])*.65+Math.abs(excess)*.18):0;
 }
 paintEdge();scheduleMapDraw();
}
function scheduleMapDraw(){if(!mapFrame)mapFrame=requestAnimationFrame(()=>{mapFrame=0;draw();});}
function stopCamera(){cameraTween?.kill();cameraTween=null;cameraDestination=null;}
function tweenCamera(target,duration=.16){
 stopCamera();closeCluster();
 target=boundedCamera(target);
 if(!window.AtlasMotion?.enabled()){zoom=target.zoom;pan={x:target.x,y:target.y};draw();return;}
 cameraDestination=target;const camera={zoom,x:pan.x,y:pan.y};
 cameraTween=gsap.to(camera,{...target,duration,ease:'power3.out',onUpdate:()=>{zoom=camera.zoom;pan={x:camera.x,y:camera.y};draw();},onComplete:()=>{cameraTween=null;cameraDestination=null;draw();}});
}
function zoomDestination(next,anchor){
 const {width:w,height:h}=mapViewport,at=anchor||{x:w/2,y:h/2},ratio=next/zoom;
 const area=window.AtlasLayout.bounds(w,h,!document.body.classList.contains('my-bag-mode'));
 return {zoom:next,x:next===1?0:at.x-area.left-(at.x-area.left-pan.x)*ratio,
  y:next===1?0:at.y-area.bottom-(at.y-area.bottom-pan.y)*ratio};
}
function changeZoom(factor,anchor){
 stopCamera();closeCluster();const target=zoomDestination(Math.min(MAX_MAP_ZOOM,Math.max(1,zoom*factor)),anchor);
 zoom=target.zoom;pan={x:target.x,y:target.y};scheduleMapDraw();
}
function animateZoom(factor,anchor){
 const target=zoomDestination(Math.min(MAX_MAP_ZOOM,Math.max(1,(cameraDestination?.zoom??zoom)*factor)),anchor);
 prepareZoomLevel(target.zoom);
 tweenCamera(target,.16);
}
