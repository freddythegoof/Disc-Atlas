// Stable scattered flight positions, grouped only where screen space is limited.
let mapClusters=[],activeCluster=null,clusterPinned=false,clusterAnchor=null,clusterPicks=new Set(),clusterCompared=false;
let clusterHoverTimer=null,clusterCloseTimer=null,mapDrag=null;
// Readable means clickable, and stays put while the pointer reaches for it (AtlasTargets). `pointerAt`: the
// pointer in map pixels, when it last moved, pressed or wheeled, and whether it is down. A regroup that falls
// due waits on it (`swapDueAt`, `holdTimer`); a readable disc a set change would drop stays as a pin while the
// pointer is on or near it (`markerPins` for DOM discs, `gapPins` for the canvas's), then fades as a regroup's do.
const pointerAt={x:0,y:0,at:0,inside:false,pressed:false};
const markerPins=new Map(),gapPins=new Map();let swapDueAt=0,holdTimer=0,pinTimer=0;
function photoMarkup(d,extra=''){
 const label=d.catalogName||d.name;
 return `<span class="disc-art clean-disc ${extra}" style="--disc-color:${discColor(d)}" role="img" aria-label="${esc(d.brand+' '+label)} — representative disc illustration"></span>`;
}
// `band`: a Halo copy's photographed band colour (disc3d/halo.mjs haloBand), or nothing; `model` its v2 wash and
// dye front (haloModel), or nothing.
// `finish`: 'clear' for a clear copy (disc3d/clear.mjs). `trueColor`: the plastic's true colour from its photo, or
// nothing (docs/clear-plastic-true-color.md).
function thumbnailMarkup(d,color,rim,photoURL,band,model,finish,trueColor){
 const label=d?d.brand+' '+(d.catalogName||d.name):'Saved disc';
 return `<span class="disc-art clean-disc disc-thumbnail" data-disc-thumbnail="${esc(d?.id||'')}" data-plate-color="${esc(color)}" data-photo-url="${esc(photoURL||'')}" data-rim-color="${esc(rim||'')}"${band?` data-halo-band="${esc(band)}"`:''}${model?` data-halo-model="${esc(model)}"`:''}${finish==='clear'?' data-finish="clear"':''}${finish==='clear'&&trueColor?` data-true-color="${esc(trueColor)}"`:''} style="--disc-color:${esc(color)}" role="img" aria-label="${esc(label)}"></span>`;
}
function observeDiscThumbnails(root,lookup,options){
 if(window.ATLAS_3D_OFF)return;
 import('./disc3d/thumbnails.mjs').then(m=>m.observeThumbnails(root,lookup,options)).catch(()=>{});
}
window.DiscThumbnails={markup:thumbnailMarkup,observe:observeDiscThumbnails};
let atlasPositions = new Map();
let groupCache=null;
let groupRevision=0,groupWorker=null,groupContext=null,regrouping=false,retirementTimer=null,retirementFrame=0,regroupToken=0,hasPaintedMarkers=false;
const preparedGroups=new Map(),pendingGroups=new Set();
const markerNodes=new Map();
const MAX_MAP_ZOOM=9;
let satelliteLabelsSuppressed=false;
let mapViewport=null;
const fullLabelFootprints=new Map();
// How a curated name is set, per breakpoint (measureFullLabels reads it off the probe): the canvas sets
// tiers 2 and 3's names the same way.
const gapTypes=new Map();
function measureFullLabels(items){
 // The main Atlas draws 76px art, My Map 68px (cosmic.css): measure under the layer's class for this map.
 const organic=organicAtlas(),keyPrefix=(innerWidth<700?'mobile:':'desktop:')+(organic?'organic:':''),pending=[];
 $('#mapMarkers').classList.toggle('atlas-organic',organic);
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
   if(organic&&!gapTypes.has(keyPrefix)){
    const name=getComputedStyle(node.firstChild),brand=getComputedStyle(node.firstChild.lastChild),font=s=>s.fontWeight+' '+s.fontSize+' '+s.fontFamily;
    gapTypes.set(keyPrefix,{name:font(name),nameSpacing:name.letterSpacing,line:parseFloat(name.lineHeight),width:parseFloat(name.maxWidth),
     brand:font(brand),brandSpacing:brand.letterSpacing,brandLine:parseFloat(brand.lineHeight),brandGap:parseFloat(brand.marginTop),upper:brand.textTransform==='uppercase'});
   }
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
// after fonts.ready, so measure again whenever any font finishes loading. The canvas's small names
// (gapName) were set in whatever face had loaded: `gapNameFonts` marks them for drawing again.
let gapNameFonts=0;
const remeasureLabels=()=>{fullLabelFootprints.clear();gapTypes.clear();groupContext=null;gapNameFonts++;scheduleMapDraw();};
document.fonts.ready.then(remeasureLabels);document.fonts.addEventListener?.('loadingdone',remeasureLabels);
function measureMap(){mapViewport=canvas.getBoundingClientRect();mapChrome=null;}
// The chrome over the map in map pixels. The organic overview keeps every disc and name clear of it at
// 1x; deeper in, discs run on under it to the map's edges as before.
let mapChrome=null;
function measureChrome(){
 const map=mapViewport||canvas.getBoundingClientRect();
 mapChrome=[...document.querySelectorAll('.explore-tools,.atlas-lens,.map-caption,.map-toolbar,.map-controls,#coachButton')].flatMap(node=>{
  const r=node.getBoundingClientRect();
  if(!r.width||!r.height||node.checkVisibility?.({visibilityProperty:true})===false)return [];
  const box={x:r.left-map.left,y:r.top-map.top,w:r.width,h:r.height};
  return box.x<map.width&&box.y<map.height&&box.x+box.w>0&&box.y+box.h>0?[box]:[];
 });
 mapChrome.key=mapChrome.map(b=>[b.x,b.y,b.w,b.h].map(Math.round).join(',')).join(';');
 return mapChrome;
}
// The main Atlas rests discs organically (AtlasGroups.curate); My Map keeps its plotted overview.
function organicAtlas(){return !myMap;}
function immersiveMap(){return !document.body.classList.contains('my-bag-mode');}
// Curate options for a level at the current zoom (AtlasGroups.organicOptions), with the chrome measured here.
function organicOptions(area,w,h,cache,first=null){
 if(!mapChrome)measureChrome();
 return {...window.AtlasGroups.organicOptions({area,width:w,height:h,level:cache.level,zoom,extent:cache.extent,chrome:mapChrome||[]}),first};
}
// The selected disc's group: the curate walk places it first when it would otherwise be hidden.
function selectedGroup(groups){return selected?groups.find(g=>g.members.includes(selected)||g.members.includes(selected.id)):null;}
// Readable means clickable (AtlasTargets). Everything the map draws at a readable size is a target: a curated
// disc's art and its name's box, a dot's art (and its name once strong enough), a small disc's or mini's art
// and its name on the canvas. Boxes are the ones layout reserved (the measured footprints), so a click lands
// wherever a viewer sees the disc or its name.
function markerLabel(g,f){
 if(!f)return null;
 if(g.large)return {x:g.x+f.x+(g.nudge?.x||0),y:g.y+f.y+(g.nudge?.y||0),w:f.w,h:f.h};
 if(g.minorLabel||g.satellite){const s=f.satellite,o=g.labelOffset||{x:0,y:0};return {x:g.x+s.x+o.x,y:g.y+s.y+o.y,w:s.w,h:s.h};}
 // A complete view's dot, named where its name is strong enough (it hangs as far below its edge as a curated name).
 if(g.gapLabel&&AtlasGroups.gapLabelAlpha(zoom)>=AtlasTargets.READABLE)return {x:g.x+f.x,y:g.y+f.y+AtlasGroups.gapDrop(AtlasGroups.gapSize(zoom,'small')),w:f.w,h:f.h};
 return null;
}
// Organic dots share their drawn radius with compare rings; hit targets add 6px slack.
function dotArtRadius(){return AtlasGroups.gapSize(zoom,'small')/2;}
function markerTarget(g){
 const f=groupCache.footprints.get(g.key);
 return {kind:'marker',ref:g,x:g.x,y:g.y,r:g.large?(f?.radius??34)*mapMarkerScale()+8:organicAtlas()?dotArtRadius()+6:22,label:markerLabel(g,f)};
}
function gapTarget(e){return {kind:'gap',ref:e,x:e.x,y:e.y,r:Math.max(e.size/2+6,12),label:e.strength>=AtlasTargets.READABLE&&e.box?e.box:null};}
function mapTargets(){
 const out=[];
 for(const g of mapClusters){const node=markerNodes.get(g.key);if(node&&!node.position.inert)out.push(markerTarget(g));}
 // A small disc fading out (its level just changed) is still on screen, so it still lands a click.
 for(const e of mapGaps)if(e.drawn&&(e.on||e.art>=.35))out.push(gapTarget(e));
 return out;
}
// A regroup falls due when the zoom asks for a level the map is not at. It waits while the pointer is
// reaching for a disc (AtlasTargets.hold) and happens once the pointer has settled.
function levelHeld(wanted){
 if(!groupCache||wanted===groupCache.level){swapDueAt=0;return false;}
 const now=performance.now();if(!swapDueAt)swapDueAt=now;
 const verdict=AtlasTargets.hold({now,due:swapDueAt,pointer:pointerAt,onTarget:AtlasTargets.reads(mapTargets(),pointerAt.x,pointerAt.y)});
 if(verdict.hold&&isFinite(verdict.until)){clearTimeout(holdTimer);holdTimer=setTimeout(scheduleMapDraw,verdict.until-now+20);}
 return verdict.hold;
}
// A readable disc that a new set (a regroup, or a zoom between levels re-curating) drops stays, in place, while
// the pointer is on or near it: a pin. It goes once the pointer has been away AtlasTargets.PIN.leave ms (a
// press keeps it) and fades as a regroup's retiring discs do. `place` is buildClusters' own, so a pin follows the
// camera like any disc.
function keepPinned(result,place){
 const now=performance.now(),P=AtlasTargets.PIN,live=new Set(result.map(g=>g.key)),pointing=pointerAt.inside||pointerAt.pressed;
 if(pointing)for(const g of mapClusters){
  if(live.has(g.key)||markerPins.has(g.key)||!markerLabel(g,groupCache.footprints.get(g.key)))continue;
  if(AtlasTargets.reach(markerTarget(g),pointerAt.x,pointerAt.y,P.slack))markerPins.set(g.key,{g:{...g,joined:null,leader:null,pinned:true},since:now,away:0});
 }
 for(const [key,pin] of markerPins){
  const entry=live.has(key)?null:place(pin.g);
  if(!entry){markerPins.delete(key);continue;}
  if(pointing&&AtlasTargets.reach(markerTarget(entry),pointerAt.x,pointerAt.y,P.slack))pin.away=0;
  else if(!pin.away)pin.away=now;
  if(now-pin.since>P.max||pin.away&&now-pin.away>P.leave&&!pointerAt.pressed){markerPins.delete(key);continue;}
  result.push(entry);
 }
}
function cancelRegroup(){
 regroupToken++;clearTimeout(retirementTimer);cancelAnimationFrame(retirementFrame);
 retirementTimer=null;retirementFrame=0;regrouping=false;
 for(const node of markerNodes.values())node.position.classList.remove('is-updating');
 $('#mapMarkers').classList.remove('is-regrouping');
}
function hydrateGroups(raw,items,w,h,level,immersive){
 const byId=new Map(items.map(d=>[d.id,d]));
 // A worker that curated for this camera already settled prominence (see prepareGroups).
 return {items,w,h,level,immersive,footprints:measureFullLabels(items),extent:raw.extent,prominenceZoom:raw.prominence,points:raw.points&&AtlasGroups.pointIds(raw.points,items),
  gaps:hydrateGaps(raw.gaps,byId),levelGaps:raw.gaps,byId,groups:raw.groups.map(g=>({
  ...g,members:g.members.map(id=>byId.get(id)),lead:byId.get(g.key),joined:g.joined?.map(id=>byId.get(id))
 }))};
}
function hydrateGaps(gaps,byId){return gaps?gaps.map(g=>({...g,d:byId.get(g.id)})):null;}
function prepareGroups(level,items,w,h,immersive){
 if(preparedGroups.has(level)||pendingGroups.has(level)||!groupWorker)return;
 pendingGroups.add(level);
 // The worker also curates the level (AtlasGroups.organicZoom), so the main thread curates only when
 // the selection or chrome changed meanwhile, or a zoom-out tween runs below the level's floor.
 if(organicAtlas()&&!mapChrome)measureChrome();
 const organic=organicAtlas()?{chrome:mapChrome||[],chromeKey:mapChrome?.key,first:selected?.id}:null;
 groupWorker.postMessage({revision:groupRevision,level,width:w,height:h,immersive,personal:!!myMap,footprints:groupContext.footprints,featured:atlasPriority(),organic,
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
   const prepared=hydrateGroups(raw,items,w,h,level,immersive);preparedGroups.set(level,prepared);warmGapNames(prepared.gaps);warmArt(prepared);
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
 const immersive=immersiveMap(),area=window.AtlasLayout.bounds(w,h,immersive);
 const changed=!groupContext||groupContext.items!==items||groupContext.w!==w||groupContext.h!==h||groupContext.immersive!==immersive;
 if(changed){
  cancelRegroup();
  for(const node of markerNodes.values()){node.position.classList.remove('is-new','is-retiring');node.position.inert=false;}
  markerPins.clear();gapPins.clear();
  groupRevision++;groupContext={items,w,h,immersive,footprints:measureFullLabels(items)};preparedGroups.clear();pendingGroups.clear();
  // The organic overview is a pure function of footprints and camera; keep it while they hold.
  if(groupCache){
   const footprints=measureFullLabels(groupCache.items);
   if(!organicAtlas()||[...footprints].some(([key,f])=>groupCache.footprints.get(key)!==f))groupCache.prominenceZoom=null;
   groupCache.footprints=footprints;
  }
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
 const wanted=AtlasGroups.level(zoom,groupCache?.level);
 const level=groupCache&&(cameraTween||mapDrag||levelHeld(wanted))?groupCache.level:wanted;
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
 // The organic 1x overview is one composition, laid out for one camera: show all pins it.
 const bounded=window.AtlasLayout.constrain({zoom,...(organicAtlas()&&zoom<=1.0001?{x:0,y:0}:pan)},area,groupCache.extent);
 pan={x:bounded.x,y:bounded.y};
 // Labels do not scale with the camera. Recheck at the actual zoom, including
 // intermediate animation frames and while a new worker level is pending.
 const organic=organicAtlas(),first=organic?selectedGroup(groupCache.groups):null;
 const options=organic&&organicOptions(area,w,h,groupCache,first);
 const prominence=organic?options.key+'|'+first?.key:zoom;
 groupCache.organicFirst=first?.key;
 if(groupCache.prominenceZoom!==prominence){
  if(organic){
   // A camera between levels (a tween still showing this one) is laid out on every frame: tier 2 then
   // keeps the level's own small discs where they stay clear instead of walking the catalog again.
   const between=options.zoom!==AtlasGroups.organicRange(groupCache.level).floor&&groupCache.levelGaps;
   const {gaps}=window.AtlasGroups.curate(groupCache.groups,groupCache.footprints,options.zoom,2**(groupCache.level/3),{...options,points:groupCache.points,gapsFrom:between||null});
   if(!between)groupCache.levelGaps=gaps;
   groupCache.gaps=hydrateGaps(gaps,groupCache.byId);
   if(!between)warmGapNames(groupCache.gaps);
  }
  else{
   const satellites=zoom>=7?new Map([...groupCache.footprints].map(([key,f])=>[key,f.satellite])):undefined;
   const minors=zoom<2.9&&(!satelliteLabelsSuppressed||zoom<=2.7)?new Map([...groupCache.footprints].map(([key,f])=>[key,f.satellite])):undefined;
   window.AtlasGroups.promote(groupCache.groups,groupCache.footprints,zoom,2**(groupCache.level/3),satellites,minors);
  }
  groupCache.prominenceZoom=prominence;
 }
 // Where a group stands on screen now, or null past the map's edges.
 const place=g=>{
  const x=area.left+g.pos.x*area.width*zoom+pan.x,y=area.bottom-g.pos.y*area.height*zoom+pan.y;
  // Keep the entire enlarged disc beyond the clipped plot viewport.
  // A 48px entry band covers its radius; the wider exit band prevents DOM churn.
  const margin=markerNodes.has(g.key)?80:48;
  // Discs run on under the toolbar and legend to the map's own edges.
  if(x < -margin||x>w+margin||y < -margin||y>h+margin)return null;
  const original=g.pos;
  const dx=g.markerOffset?.x||0,dy=g.markerOffset?.y||0;
  const leader=g.leader?{x1:x+g.leader.x1-g.px*zoom/(2**(groupCache.level/3)),
   y1:y+g.leader.y1+g.py*zoom/(2**(groupCache.level/3)),x2:x,y2:y}:null;
  return {...g,members:g.joined?[...g.members,...g.joined]:g.members,x:x+dx,y:y+dy,leader,actualX:area.left+original.x*area.width*zoom+pan.x,actualY:area.bottom-original.y*area.height*zoom+pan.y};
 };
 const result=[];
 for(const g of groupCache.groups){
  // The organic overview draws only the discs it placed; the rest wait for room deeper in.
  if(organic&&g.hidden)continue;
  const placed=place(g);if(placed)result.push(placed);
 }
 // A readable disc this set drops stays while the pointer is on it (a pin).
 if(!changed&&!contextPending)keepPinned(result,place);
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
 return shownPositions(filtered,w,h,immersiveMap()).get(id)??atlasPositions.get(id);
}
function featuredDisc(){return filtered.find(d=>d.name.toLowerCase()==='destroyer'&&/innova/i.test(d.brand)&&d.speed!=null)||filtered.find(d=>d.speed!=null);}
function focusFeatured(){
 const d=featuredDisc();
 if(!d)return;
 selected=d;const p=shownPosition(d.id);if(!p)return;
 const camera=window.AtlasLayout.camera(p,canvas.clientWidth,canvas.clientHeight,innerWidth<700?4:2.8);
 zoom=camera.zoom;pan={x:camera.x,y:camera.y};draw();
}
// Only a presentation of the shared Atlas consumes the intro (Directory is phone home).
let atlasPresented=false,atlasIntro=null,atlasCaught=false,atlasSettling=false,settleTimer=0;
try{atlasPresented=sessionStorage.getItem('atlas-intro-seen')==='1';}catch{}
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- app.js owns shared Atlas presentations.
function presentAtlas(){
 if(myMap||view!=='map'||!filtered.some(d=>d.speed!=null))return;
 measureMap();if(!mapViewport.width||!mapViewport.height)return;
 stopCamera();
 const first=!atlasPresented;atlasPresented=true;
 if(first||!selected)selected=featuredDisc();
 try{sessionStorage.setItem('atlas-intro-seen','1');}catch{}
 const {width,height}=mapViewport;
 // Match buildClusters' pinned 1x camera exactly, including its current extent.
 const extent=AtlasLayout.extent(shownPositions(filtered,width,height,true));
 const fit=AtlasLayout.fit(extent,width,height);
 const target=boundedCamera(fit.zoom===1?{zoom:1,x:0,y:0}:fit);
 if(!first||!window.AtlasMotion?.enabled()){
  zoom=target.zoom;pan={x:target.x,y:target.y};atlasSettling=true;draw();return;
 }
 focusFeatured();
 tweenCamera(target);
 const token=(name,fallback)=>(window.AtlasMotion.token?.(name,fallback)??fallback)*1000;
 atlasIntro={at:null,breath:token('--dur-ui',.18),duration:token('--dur-surface',.28)*5};
}
function catchAtlasIntro(event){
 // Input before the rest settles: the map is the player's, as it is after any open.
 atlasSettling=false;
 if(event?.type==='pointerdown')atlasCaught=!!atlasIntro;
 if(!atlasIntro)return;
 // A tap catches even during the opening breath, as it does during a flick.
 mapCaught=true;stopCamera();scheduleMapDraw();
}
// A presentation's rest is one state, whatever led to it. The reveal lands on the static open's camera exactly,
// but the layers under it remember the trip: markers and small discs paint in the order they first appeared
// (overlapping shadows and art stack differently), small discs hold the levels of detail they passed through, and
// the grouping keeps the levels it was prepared at. A direct open remembers its own first frames too: art and
// fonts arriving over them leave the browser's raster a level apart in places. So every presentation, once still
// and fully loaded, drops all of that and draws its camera from nothing, as an open's first frame does: the rest is
// the same by construction. Never under the pointer, a pin or keyboard focus on a disc (the player is there; leaving
// looks again) or mid-fade (it would pop); never once the camera moves on.
function settleAtlas(){
 if(!atlasSettling)return false;
 // A camera moving again (a search's fly-to, a drag) is no longer the presentation's rest.
 if(cameraTween||mapDrag){atlasSettling=false;return false;}
 if(pointerAt.inside||pointerAt.pressed||markerPins.size||gapPins.size||$('#mapMarkers').contains(document.activeElement))return false;
 if(artState==='loading'||document.fonts.status!=='loaded'||regrouping||retirementTimer||retirementFrame||gapsMoving||artPending||$('#mapMarkers').querySelector('.is-new,.is-retiring,.is-arriving')){
  clearTimeout(settleTimer);settleTimer=setTimeout(scheduleMapDraw,ART_SETTLE);return false;
 }
 atlasSettling=false;
 for(const node of markerNodes.values()){window.gsap?.killTweensOf([node,...node.children]);clearTimeout(node.artTimer);clearTimeout(node.fadeTimer);node.position.remove();}
 markerNodes.clear();gapFade.clear();gapClock=0;groupCache=null;groupContext=null;satelliteLabelsSuppressed=false;
 // The map's own composited raster keeps its first frames as well (a level apart, under GPU raster, where shadows
 // thin out). Moved in place, it is rasterized afresh; its canvas keeps its bitmap and is drawn again at once.
 const map=$('#map'),focused=map.contains(document.activeElement)?document.activeElement:null;
 map.parentNode.insertBefore(map,map.nextSibling);focused?.focus({preventScroll:true});
 // A move paints the same, so the browser may keep its background's tiles from a rest drawn under other paint (the tab
 // buttons' transitions on phone: a level apart in places). Its background clip, flipped between two that draw alike
 // (the map has no border), paints it again for real.
 map.style.backgroundClip=map.style.backgroundClip?'':'padding-box';
 return true;
}
function draw(){
 // Fonts/worker callbacks can schedule a frame before app.js has initialized.
 if(typeof view==='undefined'||view!=='map')return;
 if(!mapViewport)measureMap();const {width:w,height:h}=mapViewport;if(!w||!h)return;
 artFrame();
 const dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.font='12px DM Sans, sans-serif';}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const immersive=immersiveMap();
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
 drawGaps(area,w,h);
 // Explain the selected disc's offset without turning a dense view into a web of lines.
 // An organic rest offset is the disc's own small toss, not a displacement worth a line.
 for(const g of mapClusters){if(!organicAtlas()&&!g.satellite&&g.members.includes(selected)&&Math.hypot(g.x-g.actualX,g.y-g.actualY)>13){ctx.strokeStyle=themePalette.grid;ctx.beginPath();ctx.moveTo(g.actualX,g.actualY);ctx.lineTo(g.x,g.y);ctx.stroke();}}
 updateSatelliteLabelSuppression();
 renderMarkers();drawSatelliteLeaders();drawCompareHighlights();setMapText($('#zoomLabel'),'Zoom '+zoom.toFixed(1)+'×');$('#empty').hidden=filtered.some(d=>d.speed!=null);setMapText($('#empty').firstChild,'No discs match these filters.');setMapText($('#emptyReset'),'Clear filters');
 setMapText($('#mapSummary'),`${mapClusters.length} flight ${mapClusters.length===1?'group':'groups'} · ${filtered.filter(d=>d.speed!=null).length} discs`);
 // Discs still waiting for their 3D render get another frame's budget.
 if(atlasArt&&mapClusters.length)artFirst=false;
 if(artPending)scheduleMapDraw();
 // Pins let go when the pointer has been away a while: look again.
 if(markerPins.size||gapPins.size){clearTimeout(pinTimer);pinTimer=setTimeout(scheduleMapDraw,120);}
 if(atlasSettling&&settleAtlas())draw();
}
// A steady dashed outline identifies tray membership independently of hover/selection glow.
// Paint in screen pixels outside the art, including small canvas discs and a stack's hidden members.
function drawCompareHighlights(){
 if(!comparison.length)return;
 const ids=new Set(comparison.map(d=>d.id)),organic=organicAtlas(),scale=mapMarkerScale();
 ctx.save();ctx.globalAlpha=1;
 const ring=(x,y,r)=>{
  r=Math.max(7,r+5);
  ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
  ctx.setLineDash([]);ctx.lineWidth=5;ctx.strokeStyle=themePalette.background;ctx.stroke();
  ctx.setLineDash([4,3]);ctx.lineWidth=2.5;ctx.strokeStyle=themePalette.compare;ctx.stroke();
 };
 for(const g of mapClusters)if(g.members.some(d=>ids.has(d.id))){
  // Reserve the selected art's extra scale too, so selecting a compared disc cannot cover its ring.
  const radius=g.large?(organic?38:34)*scale*1.09:organic?dotArtRadius():16*scale*1.12;
  ring(g.x,g.y,radius);
 }
 for(const g of mapGaps)if(g.on&&g.drawn&&ids.has(g.id))ring(g.x,g.y,g.size/2);
 ctx.restore();
}
// Tiers 2 and 3 (AtlasGroups.GAP): the rest of the rated catalog as small discs and minis on the
// canvas, under every curated disc, in the room curate left them. Each grows with the zoom to a
// curated disc's full size at the deepest zoom, where it draws as one does: the same art, the same
// name and manufacturer. Their set follows the level; a disc or name that joins or leaves fades over
// GAP_FADE ms instead of popping, and a name's strength follows its disc's size on screen.
const GAP_FADE=180,gapFade=new Map(),gapSprites=new Map(),gapNames=new Map();let gapClock=0,mapGaps=[],gapsMoving=false;
// Plan 16: on the main Atlas every disc is its 3D model seen from straight above, lying on the ground
// (disc3d/atlas-art.mjs): each mold's own shape, overmolds in two colours, rendered once per disc and size
// and drawn where the 2D orb was. Curated discs and dots carry the render in their DOM art; small discs and
// minis are blits on the canvas. Renders happen within a per-frame budget (ART_BUDGET ms, a long first one
// while the map first fills), idle time draws a prepared level's discs ahead, and a disc still waiting for
// its render shows the orb, then crossfades over ART_FADE ms. Without WebGL the orbs stay.
// window.ATLAS_3D_OFF (set before load) keeps the orbs too, for comparison.
const ART_BUDGET=6,ART_FIRST_BUDGET=250,ART_FADE=180;
// While the zoom is changing, a canvas disc keeps the level of detail it has (a size crossing a threshold
// back and forth would otherwise redraw it at each nudge, and show a stand-in scaled from another level
// meanwhile); it is looked at again once the zoom has been still for ART_SETTLE ms. A level also holds
// across a threshold by a margin (disc3d/lod.mjs), so a size hovering there doesn't flip it either.
const ART_SETTLE=180;
let atlasArt=null,artState='off',artDeadline=0,artFirst=true,artPending=0,artZoom=0,artZoomAt=0,artZoomTimer=0;
// For tests: the art's state ('off', 'loading', 'ready' or 'failed'), the last frame's waiting discs and
// the renderer's own counts.
const mapArt={get state(){return artState;},get pending(){return artPending;},get stats(){return atlasArt?.stats||null;},get lods(){return atlasArt?.lodFor;}};
function loadAtlasArt(){
 if(window.ATLAS_3D_OFF||artState!=='off')return;
 artState='loading';
 import('./disc3d/atlas-art.mjs').then(m=>m.getAtlasArt()).then(art=>{
  atlasArt=art;artState='ready';window.addEventListener('atlas-photo-ready',()=>scheduleMapDraw());window.addEventListener('atlas-stamp-ready',()=>scheduleMapDraw());scheduleMapDraw();
  for(const prepared of preparedGroups.values())warmArt(prepared);
 },err=>{
  artState='failed';
  // Software WebGL is an expected fallback, not a fault.
  if(!/^Software WebGL/.test(err?.message))console.warn('3D atlas discs unavailable; keeping the 2D discs.',err);
 });
}
function artFrame(){artDeadline=performance.now()+(artFirst&&atlasArt?ART_FIRST_BUDGET:ART_BUDGET);artPending=0;}
// True while the zoom is moving; draws once more when it has settled to look at the levels again.
function artZooming(){
 const now=performance.now();
 if(zoom!==artZoom){
  const first=!artZoom;artZoom=zoom;
  if(!first){artZoomAt=now;clearTimeout(artZoomTimer);artZoomTimer=setTimeout(scheduleMapDraw,ART_SETTLE+20);}
 }
 return now-artZoomAt<ART_SETTLE;
}
// A disc's render for `size` px on screen: cached, or drawn now while the frame's budget lasts. Null while
// it must wait (it counts as pending, and the frame asks for another). A cached render of another size
// stands in until its own is drawn.
function discArt(d,color,size,lod){
 if(!atlasArt)return null;
 const rim=mapRimColor(d);d=photoDisc(d);
 if(!atlasArt.has(d,color,size,rim,lod,true)){
  if(performance.now()<artDeadline)atlasArt.render(d,color,size,rim,lod,true);
  else artPending++;
 }
 return atlasArt.get(d,color,size,rim,lod,true);
}
function photoDisc(d){
 if(!(myMap||activeLens()!=='default'))return d;
 const photoURL=window.BagApp?.mapPhotos?.().get(d.id),haloBand=photoURL?window.BagApp?.mapHaloBands?.().get(d.id):null,haloModel=haloBand?window.BagApp?.mapHaloModels?.().get(d.id):null;
 // A clear copy (disc3d/clear.mjs) filters the map behind it, in its photo's true colour when it has one
 // (docs/clear-plastic-true-color.md).
 const clear=window.BagApp?.mapFinishes?.().get(d.id)==='clear'?{finish:'clear',page:mapPage(),trueColor:window.BagApp?.mapTrueColors?.().get(d.id)||null}:null;
 // The player's own disc on their map wears their stamp appearance. A photo already carries its own stamp, unless its
 // owner switched it to the game-asset look (disc3d/photo-stamps.mjs): only then does atlas-art use the style.
 const stampStyle=photoURL||myColor(d)?window.DisplayPalette?.stampStyle?.():null;
 if(photoURL)return {...d,photoURL,...haloBand&&{haloBand},...haloModel&&{haloModel},...stampStyle&&{stampStyle},...clear};
 return stampStyle||clear?{...d,...stampStyle&&{stampStyle},...clear}:d;
}
// The map's own colour, read once per theme.
let mapPageColor=null;
function mapPage(){
 const theme=document.documentElement.dataset.theme;
 if(mapPageColor?.theme!==theme){const c=/rgba?\(([^)]+)\)/.exec(getComputedStyle($('#map')).backgroundColor)?.[1].split(/[ ,/]+/).map(Number)||[255,255,255];mapPageColor={theme,color:'#'+c.slice(0,3).map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')};}
 return mapPageColor.color;
}
function mapRimColor(d){return myMap||activeLens()!=='default'?window.BagApp?.mapRimColors?.().get(d.id):undefined;}
// Idle time draws a neighbouring level's discs before the camera gets there: its curated discs and dots at
// full size, its small discs and minis at the size they reach at the level's top.
function warmArt(prepared){
 if(!atlasArt||!organicAtlas()||!prepared||!window.requestIdleCallback)return;
 // Only the levels next to the camera's: a zoom passes through them next.
 if(groupCache&&Math.abs(prepared.level-groupCache.level)>1)return;
 const {top}=AtlasGroups.organicRange(prepared.level);
 const list=[...prepared.groups.filter(g=>!g.hidden&&g.lead).map(g=>[g.lead,AtlasGroups.GAP.disc*AtlasGroups.artRoom(9)]),
  ...(prepared.gaps||[]).filter(g=>g.d).map(g=>[g.d,AtlasGroups.gapSize(top,g.tier)])];
 const next=deadline=>{
  while(list.length&&deadline.timeRemaining()>3){const [d,size]=list.shift();if(atlasArt&&organicAtlas())atlasArt.render(photoDisc(d),discColor(d),size,mapRimColor(d),undefined,true);}
  if(list.length)requestIdleCallback(next);
 };
 requestIdleCallback(next);
}
// A curated disc's or dot's DOM art carries its render: the orb's paint gives way (cosmic.css .has-3d),
// keeping its drop shadows. A render that arrives after the orb has shown fades in over it first.
function syncMarkerArt(node,d,color,dot=false){
 const host=dot?node.dot:node.querySelector('.disc-art');if(!host)return;
 if(node.discArt!==host){dropMarkerArt(node);node.discArt=host;}
 const entry=artState==='ready'?discArt(d,color,dot?12:AtlasGroups.GAP.disc*AtlasGroups.artRoom(9)):null;
 if(!entry){
  // No render of this colour at any size yet (a theme or view just recoloured it): the orb shows meanwhile.
  dropMarkerArt(node);
  if(artState==='ready'||artState==='loading')node.artWaited=true;
  return;
 }
 if(node.art3d===entry.canvas)return;
 node.art3d?.remove();node.art3d=entry.canvas;
 const c=entry.canvas,pad=((1/entry.fill-1)/2*100).toFixed(3)+'%',size=(100/entry.fill).toFixed(3)+'%';
 c.className='disc-art-3d';c.setAttribute('aria-hidden','true');
 Object.assign(c.style,{left:'-'+pad,top:'-'+pad,width:size,height:size});
 const fade=node.artWaited&&!host.classList.contains('has-3d')&&window.AtlasMotion?.enabled();
 host.append(c);
 if(fade){
  c.classList.add('is-arriving');clearTimeout(node.artTimer);
  node.artTimer=setTimeout(()=>{c.classList.remove('is-arriving');if(node.art3d===c)host.classList.add('has-3d');},ART_FADE);
 }else host.classList.add('has-3d');
 node.artWaited=false;
}
function dropMarkerArt(node){
 if(!node.art3d)return;
 node.art3d.remove();node.art3d=null;clearTimeout(node.artTimer);node.discArt?.classList.remove('has-3d');
}
// A curated disc's art (cosmic.css .clean-disc, light and dark) drawn once per color and look at
// SPRITE_SCALE times its 76px, shadows and all: SPRITE_PAD of its size beyond each edge holds them.
const SPRITE_SCALE=2,SPRITE_PAD=.5;
// `shadowOnly`: just the drop shadows, for under a 3D render.
function gapSprite(color,shadowOnly=false){
 const theme=document.documentElement.dataset.theme,light=(window.discAtlasTone?.(theme)??(theme==='light'?'light':'dark'))==='light',key=color+(light?'|light':'|dark')+(shadowOnly?'|shadow':'');
 let sprite=gapSprites.get(key);if(sprite)return sprite;
 if(gapSprites.size>48)gapSprites.clear();
 const k=SPRITE_SCALE,D=AtlasGroups.GAP.disc*k,n=Math.ceil(D*(1+SPRITE_PAD*2)),c=document.createElement('canvas');c.width=c.height=n;
 const g=c.getContext('2d'),r=D/2,cx=n/2,cy=n/2,left=cx-r,top=cy-r,circle=(radius=r)=>{g.beginPath();g.arc(cx,cy,radius,0,Math.PI*2);};
 const rgb=hex=>{const v=parseInt(hex.slice(1,7),16);return [(v>>16)&255,(v>>8)&255,v&255];};
 const mix=(to,amount,alpha=1)=>{const a=rgb(color),b=rgb(to),ch=i=>Math.round(a[i]*amount+b[i]*(1-amount));return `rgba(${ch(0)},${ch(1)},${ch(2)},${alpha})`;};
 const shadow=(y,blur,tint,x=0)=>{g.shadowOffsetX=x;g.shadowOffsetY=y*k;g.shadowBlur=blur*k;g.shadowColor=tint;};
 // Outer shadows: a disc off the sprite casts them onto it.
 for(const [y,blur,tint] of light?[[5,9,'#1523401c'],[13,23,'#15234016']]:[[7,15,'#0007'],[0,24,mix(color,1,.13)]]){
  g.save();shadow(y,blur,tint,n*2);g.translate(-n*2,0);circle();g.fillStyle='#000';g.fill();g.restore();
 }
 if(shadowOnly){gapSprites.set(key,c);return c;}
 // The body: a lit radial gradient (a circle at 42% 32%, out to the farthest corner) under a glare
 // (an ellipse at 30% 18%, likewise), both placed in the art's own box.
 const body=g.createRadialGradient(left+.42*D,top+.32*D,0,left+.42*D,top+.32*D,Math.hypot(.58,.68)*D);
 body.addColorStop(.1,mix('#ffffff',.86));body.addColorStop(.48,color);body.addColorStop(.85,mix('#000000',.64));
 circle();g.fillStyle=body;g.fill();
 g.save();circle();g.clip();
 const rx=Math.SQRT2*.7*D,ry=Math.SQRT2*.82*D;g.translate(left+.3*D,top+.18*D);g.scale(1,ry/rx);
 const glare=g.createRadialGradient(0,0,0,0,0,rx);glare.addColorStop(0,'rgba(255,255,255,.44)');glare.addColorStop(.46,'rgba(255,255,255,0)');
 g.fillStyle=glare;g.fillRect(-rx,-rx,rx*2,rx*2);g.restore();
 // Inset shadows: the sprite outside the disc casts them inward, clipped to it.
 for(const [y,blur,tint] of light?[[1,2,'#ffffff80'],[-3,6,'#0003']]:[[1,3,'#ffffff65'],[-4,8,'#0005']]){
  g.save();circle();g.clip();shadow(y,blur,tint);g.beginPath();g.rect(0,0,n,n);g.arc(cx,cy,r,0,Math.PI*2,true);g.fillStyle='#000';g.fill('evenodd');g.restore();
 }
 g.lineWidth=k;g.strokeStyle=mix('#ffffff',.7);circle(r-k/2);g.stroke();
 // The inner rim (::after, inset 8%).
 g.save();shadow(1,2,'#0002');g.strokeStyle='#ffffff35';circle(r*.84);g.stroke();g.restore();
 gapSprites.set(key,c);return c;
}
// A small disc's or mini's name, set as a curated disc's (its name over its manufacturer, wrapped to
// the label's width, with its halo, text-shadow 0 1px 4px map-bg), drawn once per theme and type and
// blitted after: a blurred fillText on every frame is far too slow.
// At most `budget` new ones a frame (null when spent): a name first shows at a sliver of strength, so
// one drawn a frame or two late is never seen, and a level's names never cost one long frame.
let gapNameBudget=6;
function gapName(d){
 const type=gapTypes.get((innerWidth<700?'mobile:':'desktop:')+'organic:');if(!type)return null;
 const text=d.catalogName||d.name,brand=type.upper?d.brand.toUpperCase():d.brand;
 const dpr=Math.min(devicePixelRatio||1,2),key=text+'|'+brand+'|'+type.name+type.width+'|'+themePalette.text+themePalette.muted+themePalette.background+dpr;
 let name=gapNames.get(key);if(name?.fonts===gapNameFonts)return name;
 // One set before a face finished loading stands in until it is drawn again in it.
 if(gapNameBudget<=0)return name||null;gapNameBudget--;
 if(gapNames.size>600)gapNames.clear();
 const c=document.createElement('canvas'),g=c.getContext('2d');
 // Greedy wrap at spaces, as the label's normal white-space does; a long word stays whole.
 const wrap=(words,font,spacing)=>{
  g.font=font;g.letterSpacing=spacing;const lines=[];
  for(const word of words.split(/\s+/).filter(Boolean)){const last=lines.at(-1);if(last&&g.measureText(last+' '+word).width<=type.width)lines[lines.length-1]=last+' '+word;else lines.push(word);}
  return lines.map(line=>({line,font,spacing,w:g.measureText(line).width}));
 };
 const names=wrap(text,type.name,type.nameSpacing),brands=wrap(brand,type.brand,type.brandSpacing),pad=6;
 const w=Math.ceil(Math.max(...names.map(l=>l.w),...brands.map(l=>l.w)))+pad*2;
 const h=Math.ceil(names.length*type.line+type.brandGap+brands.length*type.brandLine)+pad*2;
 c.width=w*dpr;c.height=h*dpr;g.scale(dpr,dpr);g.textAlign='center';g.textBaseline='middle';
 g.shadowColor=themePalette.background;g.shadowBlur=4;g.shadowOffsetY=1;
 let y=pad;
 for(const l of names){g.font=l.font;g.letterSpacing=l.spacing;g.fillStyle=themePalette.text;g.fillText(l.line,w/2,y+type.line/2);y+=type.line;}
 y+=type.brandGap;
 for(const l of brands){g.font=l.font;g.letterSpacing=l.spacing;g.fillStyle=themePalette.muted;g.fillText(l.line,w/2,y+type.brandLine/2);y+=type.brandLine;}
 name={canvas:c,w,h,fonts:gapNameFonts};gapNames.set(key,name);return name;
}
function drawGaps(area,w,h){
 mapGaps=[];
 const list=organicAtlas()&&groupCache.gaps||[],now=performance.now(),animate=gapClock&&window.AtlasMotion?.enabled();
 gapNameBudget=6;let waiting=false;
 const zooming=artZooming();
 const step=animate?Math.min(1,(now-gapClock)/GAP_FADE):1;gapClock=now;
 for(const e of gapFade.values())e.on=false;
 for(const g of list){
  // One entry per disc and tier: a disc that changes tier across a level swap fades out as one and in as the other.
  // A disc a pinned marker still shows is drawn once: its small disc waits for the pin to go.
  if(markerPins.has(g.id))continue;
  const key=g.id+'|'+g.tier;let e=gapFade.get(key);
  if(!e){e={id:g.id,art:0,label:0,ox:g.x,oy:g.y};gapFade.set(key,e);}
  e.on=true;e.d=g.d;e.pos=g.pos;e.tx=g.x;e.ty=g.y;e.named=g.label;e.tier=g.tier;
 }
 keepPinnedGaps(now,new Set(list.map(g=>g.id)));
 const toward=(v,t,s)=>v<t?Math.min(t,v+s):Math.max(t,v-s),dpr=Math.min(devicePixelRatio||1,2),snap=v=>Math.round(v*dpr)/dpr;
 const depth=AtlasGroups.gapAlpha(zoom);
 const look=Object.fromEntries(AtlasGroups.TIERS.map(t=>{const size=AtlasGroups.gapSize(zoom,t);return [t,{size,strength:AtlasGroups.nameAlpha(size,t),drop:AtlasGroups.gapDrop(size)}];}));
 let moving=false;
 // Each entry is also its record in mapGaps (for tests): id, tier, name, x, y, size, art (its
 // presence), label (its name's presence), strength (what shows of its name), named, on, rest (at
 // its rest spot), box (its name's box), paint (its sprite's box, shadows and all), drawn (on screen), lod (its
 // 3D render's level of detail, null while it shows the orb) and three (how far its render has faded in).
 for(const [key,e] of gapFade){
  e.art=toward(e.art,e.on?1:0,step);const shown=e.label=toward(e.label,e.on&&e.named?1:0,step);
  // A disc that stays across a level swap eases to its new rest spot (a few px at most).
  e.ox=toward(e.ox,e.tx,step*12);e.oy=toward(e.oy,e.ty,step*12);
  if(!e.on&&!e.art){gapFade.delete(key);continue;}
  e.rest=e.ox===e.tx&&e.oy===e.ty;
  if(e.art!==(e.on?1:0)||shown!==(e.on&&e.named?1:0)||!e.rest)moving=true;
  const x=area.left+e.pos.x*area.width*zoom+pan.x+e.ox,y=area.bottom-e.pos.y*area.height*zoom+pan.y+e.oy;
  const {size,strength,drop}=look[e.tier],reach=size*(.5+SPRITE_PAD);
  e.x=x;e.y=y;e.size=size;e.name=e.d.catalogName||e.d.name;e.box=null;e.drawn=false;e.paint={x:x-reach,y:y-reach,w:reach*2,h:reach*2};
  // Its name's strength: present (fading with level swaps) times its size's.
  const alpha=e.strength=shown*strength;
  mapGaps.push(e);
  // Its name hangs up to about 100px below it.
  if(x<-reach-80||x>w+reach+80||y<-reach-100||y>h+reach){e.want=null;continue;}
  // Its 3D render over its drop shadows; the orb while the render waits, crossfading when it arrives.
  e.want=atlasArt?.lodFor(size,e.want,zooming)||null;
  const color=discColor(e.d),art=discArt(e.d,color,size,e.want);
  if(!art)e.three=0;
  else if(e.three==null)e.three=1;
  else if(e.three<1){e.three=animate?Math.min(1,e.three+step*GAP_FADE/ART_FADE):1;moving=true;}
  e.lod=art?.lod||null;
  if(e.three<1){ctx.globalAlpha=e.art*depth*(1-e.three);ctx.drawImage(gapSprite(color),x-reach,y-reach,reach*2,reach*2);}
  if(art&&e.three>0){
   ctx.globalAlpha=e.art*depth*e.three;ctx.drawImage(gapSprite(color,true),x-reach,y-reach,reach*2,reach*2);
   const s=size/art.fill;ctx.drawImage(art.canvas,x-s/2,y-s/2,s,s);
  }
  const f=groupCache.footprints.get(e.id);
  if(f){
   // A curated name's box, raised to hang as far below this disc as a curated name hangs below its art.
   e.box={x:x+f.x,y:y+f.y+drop,w:f.w,h:f.h};
   // Below 1% a name is invisible; skip the blit.
   if(alpha>=.01){
    const name=gapName(e.d);
    if(name){ctx.globalAlpha=alpha;ctx.drawImage(name.canvas,snap(e.box.x+e.box.w/2-name.w/2),snap(e.box.y+e.box.h/2-name.h/2),name.w,name.h);if(name.fonts!==gapNameFonts)waiting=true;}
    else waiting=true;
   }
  }
  e.drawn=true;
 }
 ctx.globalAlpha=1;gapsMoving=moving||waiting;
 if(moving||waiting)scheduleMapDraw();
}
// A small disc or mini with a readable name that a new set would fade out stays while the pointer is on or
// near it (markers' keepPinned does the same for the DOM's): its entry holds `on`, drawn where it was.
function keepPinnedGaps(now,listed){
 const P=AtlasTargets.PIN,pointing=pointerAt.inside||pointerAt.pressed;
 // Not a disc the new set still lists (in another tier it crossfades) or has made a curated disc.
 const shown=id=>listed.has(id)||mapClusters.some(g=>g.key===id);
 if(pointing)for(const [key,e] of gapFade){
  if(e.on||gapPins.has(key)||!e.drawn||e.strength<AtlasTargets.READABLE||e.art<.5||shown(e.id))continue;
  if(AtlasTargets.reach(gapTarget(e),pointerAt.x,pointerAt.y,P.slack))gapPins.set(key,{since:now,away:0});
 }
 for(const [key,pin] of gapPins){
  const e=gapFade.get(key);
  if(!e||e.on||!e.drawn||shown(e.id)){gapPins.delete(key);continue;}
  if(pointing&&AtlasTargets.reach(gapTarget(e),pointerAt.x,pointerAt.y,P.slack))pin.away=0;
  else if(!pin.away)pin.away=now;
  if(now-pin.since>P.max||pin.away&&now-pin.away>P.leave&&!pointerAt.pressed){gapPins.delete(key);continue;}
  e.on=true;
 }
}
// Draw a level's small names ahead, while the browser is idle, so zooming in finds them ready.
function warmGapNames(gaps){
 const names=(gaps||[]).filter(g=>g.label).map(g=>g.d);
 if(!names.length||!window.requestIdleCallback)return;
 const next=deadline=>{
  while(names.length&&deadline.timeRemaining()>2){gapNameBudget=1;gapName(names.pop());}
  if(names.length)requestIdleCallback(next);
 };
 requestIdleCallback(next);
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
function mapMarkerScale(){return AtlasGroups.artRoom(zoom);}
function updateSatelliteLabelSuppression(){
 // My Map's live promotion path still depends on this shipped hysteresis.
 if(zoom>=2.9)satelliteLabelsSuppressed=true;
 else if(zoom<=2.7)satelliteLabelsSuppressed=false;
}
function renderMarkers(){
 const layer=$('#mapMarkers'),live=new Set(),brandView=!!(selectedBrands.size||myMap);
 layer.classList.toggle('atlas-organic',organicAtlas());
 // select() repaints markers only; a new selection may need a curated spot (it always shows).
 if(organicAtlas()&&groupCache.organicFirst!==selectedGroup(groupCache.groups)?.key)scheduleMapDraw();
 const scale=mapMarkerScale(),organic=organicAtlas(),dotSize=organic?AtlasGroups.gapSize(zoom,'small'):0;
 // A complete view's dots on the main Atlas are its small discs: the curated art (76px, cosmic.css) at
 // tier 2's size, growing with the canvas's small discs to the full size, their names fading in with it.
 const dotScale=organic?dotSize/AtlasGroups.GAP.disc:scale;
 const scaleValue=scale.toFixed(3)+'/'+dotScale.toFixed(3),gapLabel=AtlasGroups.gapLabelAlpha(zoom).toFixed(3);
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
  // A pinned disc is updated at once: the pointer is on it.
  if(regrouping&&!g.pinned&&(!node||node.groupVersion!==groupCache)){
   if(updated>=8){pendingMarkers=true;continue;}updated++;
  }
  if(!node){
   node=document.createElement('button');node.type='button';node.dataset.cluster=g.key;node.className='atlas-marker';
   node.innerHTML='<span class="marker-halo"></span><span class="map-dot"></span><span class="marker-zoom"><span class="marker-stack">'+photoMarkup(lead,'stack-0')+'</span></span><span class="cluster-count"></span><span class="marker-name">'+esc(lead.catalogName||lead.name)+'<small>'+esc(lead.brand)+'</small></span>';
   // The camera's art scale sits on .marker-zoom; hover motion (atlas-motion.js) owns .marker-stack's
   // transform inside it, so neither undoes the other.
   node.art=node.querySelector('.marker-zoom');node.dot=node.querySelector('.map-dot');
   node.querySelector('.disc-art').style.removeProperty('--disc-color');
   node.badge=node.querySelector('.cluster-count');markerNodes.set(g.key,node);node.position=document.createElement('div');node.position.className='marker-position';
   if(regrouping){node.position.classList.add('is-new');node.position.inert=true;}
   node.position.append(node);layer.append(node.position);
   if(!hasPaintedMarkers)window.AtlasMotion?.enter(node);
   if(regrouping)requestAnimationFrame(()=>requestAnimationFrame(()=>{node.position.classList.remove('is-new');if(!node.position.classList.contains('is-retiring'))node.position.inert=false;}));
  }
  if(node.position.classList.contains('is-retiring')){clearTimeout(node.fadeTimer);node.position.classList.remove('is-retiring');node.position.inert=false;}
  if(node.discCount!==n){node.discCount=n;node.badge.hidden=n<2;node.badge.textContent=n;node.setAttribute('aria-label',(lead.catalogName||lead.name)+', '+lead.brand+', '+({putter:'Putter',mid:'Midrange',fairway:'Fairway driver',distance:'Distance driver',unknown:'Unrated'}[typeOf(lead)])+(n>1?' and '+(n-1)+' nearby discs':'')+' - view disc details');}
  if(node.discColor!==color){node.discColor=color;node.style.setProperty('--disc-color',color);}
  node.pinned=!!g.pinned;
  syncMarkerArt(node,lead,color,!!myMap&&!g.large&&!g.satellite);
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
  node.classList.toggle('is-counted',!!g.complete);
  node.classList.toggle('is-satellite',!!g.satellite);
  node.style.setProperty('--satellite-label-x',(g.labelOffset?.x||0)+'px');
  node.style.setProperty('--satellite-label-y',(g.labelOffset?.y||0)+'px');
  node.style.setProperty('--label-nudge-x',(g.nudge?.x||0)+'px');
  node.style.setProperty('--label-nudge-y',(g.nudge?.y||0)+'px');
  // A complete view's dots are its small discs: their names show where curate cleared them (tier 2),
  // at their size's strength. Set per named dot, never on the layer, which would restyle every marker.
  const named=organicAtlas()&&!g.large&&!!g.gapLabel;
  node.classList.toggle('is-gap-label',named);
  if(named&&node.gapLabel!==gapLabel){node.style.setProperty('--gap-label',gapLabel);node.gapLabel=gapLabel;}
  const selectedScale=g.members.includes(selected)?1.12:1;
  if(node.markerScale!==scaleValue||node.dotSelection!==selectedScale||node.scaleLarge!==g.large){
   if(g.large)node.art.style.scale=scale.toFixed(3);
   // Its halo, count and name follow its radius (--gap-half); selected, it grows as curated art does.
   else if(organic){node.art.style.scale=dotScale.toFixed(3);node.dot.style.removeProperty('scale');node.style.setProperty('--gap-half',(dotSize/2).toFixed(2)+'px');}
   else{node.art.style.removeProperty('scale');node.dot.style.scale=(dotScale*selectedScale).toFixed(3);}
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
  // A pin letting go fades out as a regroup's retiring discs do, rather than vanishing.
  if(node.position.classList.contains('is-retiring')&&node.fadeTimer)continue;
  if(node.pinned&&node.position.isConnected){fadeOut(key,node);continue;}
  if(document.activeElement===node)$('#map').focus({preventScroll:true});
  window.gsap?.killTweensOf([node,...node.children]);node.position.remove();markerNodes.delete(key);
 }
}
function fadeOut(key,node){
 node.pinned=false;node.position.classList.add('is-retiring');node.position.inert=true;
 node.fadeTimer=setTimeout(()=>{
  if(markerNodes.get(key)!==node||!node.position.classList.contains('is-retiring'))return;
  if(document.activeElement===node)$('#map').focus({preventScroll:true});
  window.gsap?.killTweensOf([node,...node.children]);node.position.remove();markerNodes.delete(key);
 },220);
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
 // The popover grows from the marker that opened it (its centre, kept inside the popover); a phone sheet
 // rises from its bottom edge, and a marker far from the popover leaves it scaling from the centre.
 const origin=()=>{
  if(innerWidth<700){pop.style.setProperty('--menu-origin','50% 100%');return;}
  // Layout sizes, not getBoundingClientRect: the popover is mid-scale while it enters.
  const left=parseFloat(pop.style.left)||0,top=parseFloat(pop.style.top)||0,w=pop.offsetWidth,h=pop.offsetHeight,cx=a.left+a.width/2,cy=a.top+a.height/2;
  const dx=Math.max(left-cx,0,cx-left-w),dy=Math.max(top-cy,0,cy-top-h);
  pop.style.setProperty('--menu-origin',clusterAnchor&&Math.hypot(dx,dy)<=220?`${Math.round(Math.min(w,Math.max(0,cx-left)))}px ${Math.round(Math.min(h,Math.max(0,cy-top)))}px`:'50% 50%');
 };
 const width=Math.min(680,innerWidth-24);pop.style.width=width+'px';
 // Reserve the entire control band, including when the popover is a mobile sheet.
 const controlTop=$('.map-controls').getBoundingClientRect().top,coach=$('#coachButton');
 const ceiling=Math.min(controlTop,getComputedStyle(coach).visibility==='hidden'?controlTop:coach.getBoundingClientRect().top)-16;
 pop.style.maxHeight=Math.max(120,ceiling-16)+'px';
 if(innerWidth<700){pop.style.left='12px';pop.style.top='';pop.style.bottom=(innerHeight-ceiling)+'px';origin();return;}
 pop.style.bottom='';const height=Math.min(pop.offsetHeight,ceiling-16);
 let left=a.right+16,top=a.top-24;
 if(left+width>innerWidth-12){left=a.left-width-16;if(left<12){left=Math.max(12,Math.min(innerWidth-width-12,a.left-width/2));top=a.bottom+16;if(top+height>innerHeight-12)top=a.top-height-16;}}
 pop.style.left=Math.max(12,Math.min(innerWidth-width-12,left))+'px';pop.style.top=Math.max(12,Math.min(ceiling-height,top))+'px';
 origin();
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
 loadAtlasArt();
 // Capture before controls/markers/normal wheel retargeting see the intro's destination.
 // Do not prevent the event: its usual handler gets the live camera immediately.
 for(const type of ['pointerdown','wheel','keydown','click'])document.addEventListener(type,catchAtlasIntro,{capture:true,passive:true});
 const glow=document.createElement('div');glow.className='map-edge-feedback';glow.setAttribute('aria-hidden','true');
 for(const side of ['left','right','top','bottom']){const edge=document.createElement('i');edge.className=side;glow.append(edge);}map.append(glow);
 map.addEventListener('pointerenter',measureMap);
 layer.addEventListener('pointerout',e=>{const button=e.target.closest('[data-cluster]');if(button&&!button.contains(e.relatedTarget))scheduleClusterClose();});
 map.addEventListener('click',e=>{
  if(e.target.closest('.map-controls,#clusterPopover,a'))return;
  if(e.detail!==0&&(mapMoved||mapCaught)){mapCaught=false;return;}
  const button=e.target.closest('[data-cluster]');
  if(!button&&e.target.closest('button'))return;
  let group=button?mapClusters.find(g=>g.key===button.dataset.cluster):null,gap=null;
  // Dot buttons have generous invisible targets. In a dense deep view those
  // can cover a neighbor's visible center; resolve pointer clicks spatially.
  // Keyboard activation keeps the focused button's identity. Off a button (or
  // from 2.7x, always) a click lands on whatever the map drew there: a disc's
  // art or its name, a marker's or one the canvas draws (AtlasTargets).
  if(e.detail!==0&&(zoom>=2.7||!button)){
   const hit=AtlasTargets.pick(mapTargets(),e.clientX-mapViewport.left,e.clientY-mapViewport.top);
   group=hit?.kind==='marker'?hit.ref:null;gap=hit?.kind==='gap'?hit.ref:null;
  }
  if(gap){e.stopPropagation();select(gap.d);return;}
  if(group){e.stopPropagation();if(group.members.length>1&&group.members.length<=3)openStackDetail(group,markerNodes.get(group.key));else select(group.lead);}
 });
 // Where the pointer is, for what the map holds still for it (levelHeld, keepPinned) and its cursor.
 const track=e=>{
  const r=mapViewport||canvas.getBoundingClientRect();
  Object.assign(pointerAt,{x:e.clientX-r.left,y:e.clientY-r.top,at:performance.now(),inside:true});
  if(e.pointerType==='mouse'&&!pointerAt.pressed)map.classList.toggle('is-over-disc',!!AtlasTargets.pick(mapTargets(),pointerAt.x,pointerAt.y));
 };
 map.addEventListener('pointermove',track);map.addEventListener('pointerenter',track);
 map.addEventListener('pointerleave',()=>{
  pointerAt.inside=false;map.classList.remove('is-over-disc');
  // A regroup that waited on the pointer happens now.
  if(swapDueAt||markerPins.size||gapPins.size||atlasSettling)scheduleMapDraw();
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
 const pointers=new Map();let pinchDistance=0,pinchMidpoint=null,velocity={zoom:0,x:0,y:0},lastMove=0,gestureCancelled=false;
 map.addEventListener('pointerdown',e=>{
  if(e.button!==0||e.target.closest('.map-controls')||pointers.size>=2)return;
  if(!pointers.size){mapCaught=atlasCaught||cameraMoving();mapMoved=false;gestureCancelled=false;}
  measureMap();stopCamera();resetEdge();closeCluster();velocity={zoom:0,x:0,y:0};lastMove=performance.now();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  track(e);pointerAt.pressed=true;
  mapDrag={x:e.clientX,y:e.clientY};
  if(!e.target.closest('button'))map.setPointerCapture(e.pointerId);
  map.classList.add('is-dragging');
  if(pointers.size===2){const [a,b]=[...pointers.values()];pinchDistance=Math.hypot(a.x-b.x,a.y-b.y);pinchMidpoint={x:(a.x+b.x)/2-mapViewport.left,y:(a.y+b.y)/2-mapViewport.top};}
 });
 map.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId))return;
  const previous=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pointers.size===2){const [a,b]=[...pointers.values()],distance=Math.hypot(a.x-b.x,a.y-b.y),r=mapViewport;
   const midpoint={x:(a.x+b.x)/2-r.left,y:(a.y+b.y)/2-r.top},before={zoom,x:pan.x,y:pan.y};
   if(pinchDistance)changeZoom(distance/pinchDistance,pinchMidpoint);
   panMap(midpoint.x-pinchMidpoint.x,midpoint.y-pinchMidpoint.y);
   const now=performance.now(),dt=Math.max(8,now-lastMove);lastMove=now;
   for(const axis of CAMERA_AXES)velocity[axis]=velocity[axis]*.55+((axis==='zoom'?zoom:pan[axis])-before[axis])/dt*.45;
   pinchDistance=distance;pinchMidpoint=midpoint;mapMoved=true;map.classList.add('is-panning');
  }else{const dx=e.clientX-previous.x,dy=e.clientY-previous.y;
   if(!mapMoved&&Math.hypot(e.clientX-mapDrag.x,e.clientY-mapDrag.y)<5)return;
   const now=performance.now(),dt=Math.max(8,now-lastMove);lastMove=now;
   velocity={zoom:0,x:velocity.x*.55+dx/dt*.45,y:velocity.y*.55+dy/dt*.45};
   mapMoved=true;map.classList.add('is-panning');map.setPointerCapture(e.pointerId);panMap(dx,dy);
  }
 });
 const stop=e=>{if(!pointers.has(e.pointerId))return;if(e.type!=='pointerup')gestureCancelled=true;pointers.delete(e.pointerId);pinchDistance=0;pinchMidpoint=null;mapDrag=pointers.size?[...pointers.values()][0]:null;
  if(!pointers.size){map.classList.remove('is-dragging','is-panning');pointerAt.pressed=false;pointerAt.at=performance.now();
   // A finger that lifts leaves nothing to hover.
   if(e.pointerType==='touch')pointerAt.inside=false;
   releaseEdge();
   if(!gestureCancelled&&e.type==='pointerup'&&mapMoved&&performance.now()-lastMove<90&&window.AtlasMotion?.enabled()){
    releaseCamera(velocity);
   }
  }
  if(map.hasPointerCapture(e.pointerId))map.releasePointerCapture(e.pointerId);
  if(!pointers.size&&!cameraTween)scheduleMapDraw();
 };
 map.addEventListener('pointerup',stop);map.addEventListener('pointercancel',stop);map.addEventListener('lostpointercapture',stop);
 map.addEventListener('wheel',e=>{
  e.preventDefault();measureMap();track(e);
  // Wheel and trackpad pinch always zoom, including fine pixel deltas.
  // Capture over child controls too so the atlas never scrolls the document.
  resetEdge();
  const unit=e.deltaMode===1?16:e.deltaMode===2?mapViewport.height:1;
  const delta=Math.max(-600,Math.min(600,(e.deltaY || e.deltaX)*unit));
  animateZoom(Math.exp(-delta*.0015),{x:e.clientX-mapViewport.left,y:e.clientY-mapViewport.top});
 },{passive:false});
 map.addEventListener('keydown',e=>{if(e.target!==map)return;const commands={ArrowLeft:[40,0],ArrowRight:[-40,0],ArrowUp:[0,40],ArrowDown:[0,-40]};if(commands[e.key]){e.preventDefault();closeCluster();tweenCamera({zoom:cameraDestination?.zoom??zoom,x:(cameraDestination?.x??pan.x)+commands[e.key][0],y:(cameraDestination?.y??pan.y)+commands[e.key][1]});}else if(e.key==='+'||e.key==='='){e.preventDefault();animateZoom(1.3);}else if(e.key==='-'){e.preventDefault();animateZoom(1/1.3);}});
 window.addEventListener('resize',()=>{stopCamera();closeCluster();});window.addEventListener('scroll',e=>{if(e.target===document)measureMap();if(activeCluster&&!clusterPinned&&!pop.contains(e.target))closeCluster();},true);
}
let mapMoved=false,mapCaught=false,mapFrame=0,cameraTween=null,cameraDestination=null;
// One camera spring; cameraTween remains the shared moving/LOD-hold flag for existing callers.
const CAMERA_AXES=['zoom','x','y'];
const cameraSpring={velocity:{zoom:0,x:0,y:0},step:{zoom:1,x:0,y:0},at:0,area:null,zooming:false};
// Reduced motion: no spring, no overshoot; the camera eases to its target over 150 ms (expo-out family) instead of jumping.
const CALM_CAMERA_MS=150;let cameraEase=null;
const edgeFeedback={x:0,y:0};let edgeTween=null,edgeReleaseTimer=null;
function boundedCamera(target,result,area){
 const {width:w,height:h}=mapViewport;
 return window.AtlasLayout.constrain(target,area||window.AtlasLayout.bounds(w,h,immersiveMap()),groupCache?.extent,36,result);
}
function paintEdge(){
 const map=$('#map'),x=edgeFeedback.x,y=edgeFeedback.y;
 for(const [side,value] of [['left',x],['right',-x],['top',y],['bottom',-y]])map.style.setProperty('--edge-'+side,Math.min(1,Math.max(0,value/12)));
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
 const dimensionX=Math.min(64,mapViewport.width*.15),dimensionY=Math.min(64,mapViewport.height*.15);
 const unband=(value,dimension)=>value*dimension/(.55*Math.max(.0001,dimension-Math.abs(value)));
 // Include resisted travel in the next drag delta, including reversals away from an edge.
 const target={zoom,x:pan.x+dx+unband(edgeFeedback.x,dimensionX),y:pan.y+dy+unband(edgeFeedback.y,dimensionY)},bounded=boundedCamera(target);
 pan={x:bounded.x,y:bounded.y};
 for(const axis of ['x','y']){
  const over=target[axis]-bounded[axis],dimension=axis==='x'?dimensionX:dimensionY;
  edgeFeedback[axis]=over*dimension*.55/(dimension+.55*Math.abs(over));
 }
 paintEdge();scheduleMapDraw();
}
function scheduleMapDraw(){if(!mapFrame)mapFrame=requestAnimationFrame(now=>{mapFrame=0;stepCamera(now);draw();if(cameraTween)scheduleMapDraw();});}
function stopCamera(){cameraTween=null;cameraDestination=null;cameraEase=null;atlasIntro=null;for(const axis of CAMERA_AXES)cameraSpring.velocity[axis]=0;}
function cameraMoving(){
 if(!cameraTween)return false;
 const v=cameraSpring.velocity,r=mapViewport;
 // Same 0.025 px/ms threshold as release. Include zoom's motion in screen pixels.
 return Math.max(Math.hypot(v.x,v.y),Math.abs(v.zoom)*Math.max(r.width,r.height)/zoom)>25;
}
function stepCamera(now){
 if(!cameraTween)return;
 if(atlasIntro){
  if(!window.AtlasMotion?.enabled()||atlasIntro.at!==null&&now>=atlasIntro.at+atlasIntro.breath+atlasIntro.duration){
   zoom=cameraDestination.zoom;pan.x=cameraDestination.x;pan.y=cameraDestination.y;stopCamera();atlasSettling=true;return;
  }
  // Start the clock on the first paint, so startup work cannot eat the close-up.
  if(atlasIntro.at===null){atlasIntro.at=now;cameraSpring.at=now+atlasIntro.breath;return;}
  if(now<=atlasIntro.at+atlasIntro.breath)return;
 }
 const s=cameraSpring,dt=Math.max(0,(now-s.at)/1000);s.at=now;
 // A filter can replace the extent during a glide. Keep its landing point reachable.
 boundedCamera(cameraDestination,cameraDestination,s.area);
 let moving=false;
 if(cameraEase){
  const t=Math.min(1,Math.max(0,(now-cameraEase.at)/CALM_CAMERA_MS)),e=1-(1-t)**3;
  for(const axis of CAMERA_AXES){s.step[axis]=cameraEase.from[axis]+(cameraDestination[axis]-cameraEase.from[axis])*e;s.velocity[axis]=0;}
  moving=t<1;
 }else for(const axis of CAMERA_AXES){
  const target=cameraDestination[axis],position=axis==='zoom'?zoom:pan[axis],v=s.velocity[axis];
  const omega=atlasIntro?12/(atlasIntro.duration/1000):2*Math.PI/(axis==='zoom'||s.zooming ? .35 : .4),d=position-target,c=v+omega*d,e=Math.exp(-omega*dt);
  let next=target+(d+c*dt)*e,velocity=(v-omega*c*dt)*e;
  const epsilon=axis==='zoom' ? .0001 : .05;
  if(!window.AtlasMotion?.enabled()||Math.abs(next-target)<epsilon&&Math.abs(velocity)<epsilon*10){next=target;velocity=0;}
  else moving=true;
  s.step[axis]=next;s.velocity[axis]=velocity;
 }
 const x=s.step.x,y=s.step.y;
 const z=Math.max(1,Math.min(MAX_MAP_ZOOM,s.step.zoom));
 if(z!==s.step.zoom)s.velocity.zoom=0;s.step.zoom=z;
 boundedCamera(s.step,s.step,s.area);
 if(x!==s.step.x)s.velocity.x=0;if(y!==s.step.y)s.velocity.y=0;
 zoom=s.step.zoom;pan.x=s.step.x;pan.y=s.step.y;
 if(!moving&&!atlasIntro)stopCamera();
}
// Existing callers keep this entry point; it now retargets the shared spring.
function tweenCamera(target){
 closeCluster();
 target=boundedCamera(target);
 if(!window.AtlasMotion?.enabled()&&!window.AtlasMotion?.reduced()){stopCamera();zoom=target.zoom;pan={x:target.x,y:target.y};draw();return;}
 if(!cameraTween)cameraSpring.at=performance.now();
 cameraEase=window.AtlasMotion.enabled()?null:{from:{zoom,x:pan.x,y:pan.y},at:performance.now()};
 cameraSpring.area=AtlasLayout.bounds(mapViewport.width,mapViewport.height,immersiveMap());
 cameraSpring.zooming=target.zoom!==zoom;
 cameraDestination=target;cameraTween=cameraSpring;scheduleMapDraw();
}
function releaseCamera(velocity){
 const vx=velocity.x,vy=velocity.y,vz=velocity.zoom;
 if(Math.max(Math.hypot(vx,vy),Math.abs(vz)*Math.max(mapViewport.width,mapViewport.height)/zoom)<=.025)return;
 const project=v=>v*.99/(1-.99),cap=.5*Math.max(mapViewport.width,mapViewport.height);
 const dx=project(vx),dy=project(vy),scale=Math.min(1,cap/Math.max(1,Math.hypot(dx,dy)));
 const z=Math.max(1,Math.min(MAX_MAP_ZOOM,zoom+Math.max(-zoom*.4,Math.min(zoom*.4,project(vz)))));
 tweenCamera({zoom:z,x:pan.x+dx*scale,y:pan.y+dy*scale});
 if(!cameraTween)return;
 for(const axis of CAMERA_AXES){
  const position=axis==='zoom'?zoom:pan[axis],v=axis==='zoom'?vz:axis==='x'?vx:vy;
  // At a clamped edge, remove outward momentum; elsewhere hand off release velocity.
  const distance=cameraDestination[axis]-position,omega=2*Math.PI/(axis==='zoom'||cameraSpring.zooming ? .35 : .4);
  cameraSpring.velocity[axis]=distance*v>0?Math.sign(v)*Math.min(Math.abs(v*1000),omega*Math.abs(distance)):0;
 }
}
function zoomDestination(next,anchor,source){
 const {width:w,height:h}=mapViewport,at=anchor||{x:w/2,y:h/2},ratio=next/(source?.zoom??zoom);
 const area=window.AtlasLayout.bounds(w,h,immersiveMap());
 return {zoom:next,x:next===1?0:at.x-area.left-(at.x-area.left-(source?.x??pan.x))*ratio,
  y:next===1?0:at.y-area.bottom-(at.y-area.bottom-(source?.y??pan.y))*ratio};
}
function changeZoom(factor,anchor){
 stopCamera();closeCluster();const target=zoomDestination(Math.min(MAX_MAP_ZOOM,Math.max(1,zoom*factor)),anchor);
 zoom=target.zoom;pan={x:target.x,y:target.y};scheduleMapDraw();
}
function animateZoom(factor,anchor){
 const target=zoomDestination(Math.min(MAX_MAP_ZOOM,Math.max(1,(cameraDestination?.zoom??zoom)*factor)),anchor,cameraDestination);
 prepareZoomLevel(target.zoom);
 tweenCamera(target);
}
