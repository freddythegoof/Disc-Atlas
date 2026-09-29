// Stable scattered flight positions, grouped only where screen space is limited.
let mapClusters=[],activeCluster=null,clusterPinned=false,clusterAnchor=null,clusterPicks=new Set(),clusterCompared=false;
let clusterHoverTimer=null,clusterCloseTimer=null,mapDrag=null;
function photoMarkup(d,extra=''){
 const label=d.catalogName||d.name;
 return `<span class="disc-art clean-disc ${extra}" style="--disc-color:${discColor(d)}" role="img" aria-label="${esc(d.brand+' '+label)} — representative disc illustration"></span>`;
}
const featuredMolds=['destroyer','wraith','buzzz','zone','hex','crave','envy','luna','teebird'];
function featuredRank(d){const n=featuredMolds.indexOf(d.name.toLowerCase());return n>=0?n:99;}
let atlasPositions = new Map();
let groupCache=null;
const markerNodes=new Map();
let mapViewport=null;
function measureMap(){mapViewport=canvas.getBoundingClientRect();}
function buildClusters(items,w,h){
 const immersive=!document.body.classList.contains('my-bag-mode'),area=window.AtlasLayout.bounds(w,h,immersive);
 // Group in world space at discrete zoom levels. Panning never changes a disc's group.
 const level=groupCache&&(cameraTween||mapDrag)?groupCache.level:Math.round(Math.log2(zoom)*3),groupZoom=2**(level/3);
 if(!groupCache||groupCache.items!==items||groupCache.w!==w||groupCache.h!==h||groupCache.level!==level||groupCache.immersive!==immersive){
  const groups=[],cells=new Map(),size=65;
  const scattered=window.AtlasLayout.spread(items,atlasPositions,area.width*groupZoom,area.height*groupZoom);
  const ordered=items.filter(d=>d.speed!=null).map(d=>({d,rank:featuredRank(d)}))
   .sort((a,b)=>a.rank-b.rank||a.d.id.localeCompare(b.d.id));
  for(const {d} of ordered){
   const pos=(scattered||atlasPositions).get(d.id);if(!pos)continue;
   const x=pos.x*area.width*groupZoom,y=pos.y*area.height*groupZoom,cx=Math.floor(x/size),cy=Math.floor(y/size);
   let nearby=null,best=size*size;
   for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const g of cells.get((cx+dx)+':'+(cy+dy))||[]){
    const distance=(g.px-x)**2+(g.py-y)**2;if(distance<best){best=distance;nearby=g;}
   }
   if(nearby){nearby.members.push(d);continue;}
   const g={key:d.id,pos,px:x,py:y,members:[d],lead:d,large:false};groups.push(g);
   const key=cx+':'+cy;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(g);
  }
  const large=[],clearance=scattered?72:w<700?105:155;
  for(const g of groups)if(large.every(other=>(other.px-g.px)**2+(other.py-g.py)**2>clearance**2)){g.large=true;large.push(g);}
  groupCache={items,w,h,level,immersive,groups,extent:window.AtlasLayout.extent(new Map(groups.map(g=>[g.key,g.pos])))};
 }
 const bounded=window.AtlasLayout.constrain({zoom,...pan},area,groupCache.extent);
 pan={x:bounded.x,y:bounded.y};
 const result=[];
 for(const g of groupCache.groups){
  const x=area.left+g.pos.x*area.width*zoom+pan.x,y=area.bottom-g.pos.y*area.height*zoom+pan.y;
  if(x<40||x>w-40||y<(immersive?82:24)||y>h-(immersive?(w<700?210:180):54))continue;
  const original=atlasPositions.get(g.lead.id);
  result.push({...g,x,y,actualX:area.left+original.x*area.width*zoom+pan.x,actualY:area.bottom-original.y*area.height*zoom+pan.y});
 }
 return result;
}
function focusFeatured(){
 const d=filtered.find(d=>d.name.toLowerCase()==='destroyer'&&/innova/i.test(d.brand)&&d.speed!=null)||filtered.find(d=>d.speed!=null);
 if(!d)return;
 selected=d;const p=atlasPositions.get(d.id);if(!p)return;
 const camera=window.AtlasLayout.camera(p,canvas.clientWidth,canvas.clientHeight,innerWidth<700?4:2.8);
 zoom=camera.zoom;pan={x:camera.x,y:camera.y};draw();
}
function draw(){
 if(view!=='map')return;
 if(!mapViewport)measureMap();const {width:w,height:h}=mapViewport;if(!w||!h)return;
 const dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const immersive=!document.body.classList.contains('my-bag-mode');
 const area=window.AtlasLayout.bounds(w,h,immersive),plotBottom=h-(immersive?(w<700?155:110):16);
 mapClusters=buildClusters(filtered,w,h);
 const x=s=>area.left+(s/100)*area.width*zoom+pan.x,y=s=>area.bottom-((s-1)/14)*area.height*zoom+pan.y;
 ctx.lineWidth=1;ctx.font='12px DM Sans, sans-serif';
 ctx.globalAlpha=Math.min(.65,.16+(zoom-1)*.13);
 for(let n=1;n<=15;n+=zoom<1.8?2:1){const yy=y(n);if(yy<(immersive?82:26)||yy>plotBottom)continue;ctx.strokeStyle=themePalette.grid;ctx.beginPath();ctx.moveTo(31,yy);ctx.lineTo(w-16,yy);ctx.stroke();ctx.fillStyle=themePalette.muted;ctx.fillText(n,10,yy+4);}
 for(let n=0;n<=100;n+=zoom<1.8?20:10){const xx=x(n);if(xx<28||xx>w-15)continue;ctx.strokeStyle=n===50?themePalette.center:themePalette.grid;ctx.setLineDash(n===50?[]:[2,6]);ctx.beginPath();ctx.moveTo(xx,immersive?82:24);ctx.lineTo(xx,plotBottom);ctx.stroke();}ctx.setLineDash([]);ctx.globalAlpha=1;
 // A subtle tether preserves the underlying mean coordinate when markers separate.
 for(const g of mapClusters){if(Math.hypot(g.x-g.actualX,g.y-g.actualY)>13){ctx.strokeStyle=themePalette.grid;ctx.beginPath();ctx.moveTo(g.actualX,g.actualY);ctx.lineTo(g.x,g.y);ctx.stroke();}}
 renderMarkers();setMapText($('#zoomLabel'),'Zoom '+zoom.toFixed(1)+'×');$('#empty').hidden=filtered.some(d=>d.speed!=null);setMapText($('#empty').firstChild,'No discs match these filters.');setMapText($('#emptyReset'),'Clear filters');
 setMapText($('#mapSummary'),`${mapClusters.length} flight ${mapClusters.length===1?'group':'groups'} · ${filtered.filter(d=>d.speed!=null).length} discs`);
}
function setMapText(node,text){if(node.textContent!==text)node.textContent=text;}
function renderMarkers(){
 const layer=$('#mapMarkers'),live=new Set(),brandView=!!(selectedBrands.size||window.BagApp?.isMapActive());
 for(const g of mapClusters){
  live.add(g.key);let node=markerNodes.get(g.key);const lead=g.lead,n=g.members.length,color=discColor(lead);
  if(!node){
   node=document.createElement('button');node.type='button';node.dataset.cluster=g.key;node.className='atlas-marker';
   node.innerHTML='<span class="marker-halo"></span><span class="map-dot"></span><span class="marker-stack">'+photoMarkup(lead,'stack-0')+'</span><span class="cluster-count"></span><span class="marker-name">'+esc(lead.catalogName||lead.name)+'<small>'+esc(lead.brand)+'</small></span>';
   node.querySelector('.disc-art').style.removeProperty('--disc-color');
   node.badge=node.querySelector('.cluster-count');markerNodes.set(g.key,node);node.position=document.createElement('div');node.position.className='marker-position';node.position.append(node);layer.append(node.position);window.AtlasMotion?.enter(node);
  }
  if(node.discCount!==n){node.discCount=n;node.badge.hidden=n<2;node.badge.textContent=n;node.setAttribute('aria-label',lead.name+(n>1?' and '+(n-1)+' nearby discs':'')+' - view disc details');}
  if(node.discColor!==color){node.discColor=color;node.style.setProperty('--disc-color',color);}
  if(node.groupVersion!==groupCache||node.brandView!==brandView||node.selection!==selected){
   const flags={'is-large':g.large,'is-dot':!g.large,'brand-view':brandView,overview:!brandView,'is-stack':n>1,'is-selected':g.members.includes(selected)};
   for(const [name,on] of Object.entries(flags))if(node.classList.contains(name)!==on)node.classList.toggle(name,on);
   node.groupVersion=groupCache;node.brandView=brandView;node.selection=selected;
   node.position.style.zIndex=g.members.includes(selected)?3:g.large?2:1;
  }
  if(node.mapX!==g.x||node.mapY!==g.y){node.position.style.transform='translate3d('+g.x.toFixed(2)+'px,'+g.y.toFixed(2)+'px,0)';node.mapX=g.x;node.mapY=g.y;}
 }
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
function comparisonPalette(){return document.documentElement.dataset.theme!=='light'?['#92b8ff','#ffab7a','#66d9bf']:['#265bad','#984216','#126852'];}
function comparisonMarkup(items){
 const palette=comparisonPalette();
 return `<div class="cluster-flight"><div class="flight-overlay-label"><span>FLIGHT OVERLAY</span><span>${hand} · ${power}% power</span></div><svg viewBox="0 0 250 180" role="img" aria-label="Illustrative flight comparison"><path d="M125 155V12 M30 50H220 M30 100H220 M30 150H220" stroke="${themePalette.grid}" fill="none" stroke-dasharray="3 5"/>${items.map((d,i)=>`<path class="comparison-route" d="${path(d)}" fill="none" stroke="${palette[i]}" stroke-width="3" stroke-linecap="round" ${i===1?'stroke-dasharray="8 4"':i===2?'stroke-dasharray="2 4"':''}/>`).join('')}<circle cx="125" cy="155" r="4" fill="${themePalette.text}"/></svg><p class="micro">Flat release · illustrative paths</p></div><div class="cluster-specs">${items.map((d,i)=>`<div class="cluster-stat"><strong><i class="dot" style="background:${palette[i]}"></i>${esc(d.name)}</strong><small>${esc(d.brand)}</small><div class="mini-numbers">${['speed','glide','turn','fade'].map(k=>`<span><b>${d[k]}</b><small>${k[0].toUpperCase()}</small></span>`).join('')}</div><span class="micro">${stability(d)} · index ${score(d)}</span></div>`).join('')}</div>`;
}
function renderCluster(){
 if(!activeCluster)return;const pop=$('#clusterPopover'),items=activeCluster.members,small=items.length<=3,speeds=items.map(d=>d.speed),scores=items.map(score),range=a=>Math.min(...a)===Math.max(...a)?String(a[0]):`${Math.min(...a)}–${Math.max(...a)}`;
 pop.hidden=false;pop.innerHTML=`<div class="cluster-heading"><div><div class="eyebrow">${small?'THE FLIGHT MATCHUP':'EXPLORE THIS FLIGHT GROUP'}</div><h3 id="clusterTitle">${items.length===1?esc(items[0].name):items.length+' discs. Similar territory.'}</h3><p>Speed ${range(speeds)} <span>•</span> Stability ${range(scores)}</p></div><button id="clusterClose" aria-label="Close disc group" type="button">×</button></div><div class="cluster-scroll"><div class="cluster-gallery ${small?'small-group':''}">${items.map(d=>`<article class="cluster-disc"><button class="inspect-disc" type="button" data-inspect="${d.id}" aria-label="Inspect ${esc(d.brand+' '+d.name)}">${photoMarkup(d)}<strong>${esc(d.name)}</strong><small>${esc(d.brand)}</small></button>${!small?`<button class="pick-compare ${clusterPicks.has(d.id)?'is-picked':''}" type="button" data-pick="${d.id}" aria-pressed="${clusterPicks.has(d.id)}">${clusterPicks.has(d.id)?'✓ Selected':'+ Compare'}</button>`:''}</article>`).join('')}</div>${small?`<div class="auto-compare-label">${items.length>1?'AUTOMATIC COMPARISON':'FLIGHT PREVIEW'}</div><div class="cluster-comparison">${comparisonMarkup(items)}</div>`:`<div id="clusterComparison" class="cluster-comparison" ${clusterCompared?'':'hidden'}>${clusterCompared?comparisonMarkup(items.filter(d=>clusterPicks.has(d.id))):''}</div>`}</div><div class="cluster-footer">${small?`<span class="micro">Select a disc to see its full details.</span><button type="button" id="keepComparison" class="cluster-action">Keep ${items.length>1?'comparison':'disc'}</button>`:`<span id="clusterPickStatus" class="micro" aria-live="polite">${clusterPicks.size} / 3 selected · choose up to three</span><button type="button" id="compareCluster" class="cluster-action" ${clusterPicks.size<2?'disabled':''}>Compare selected${clusterPicks.size?' ('+clusterPicks.size+')':''}</button>`}</div>`;
}
function initAtlasMap(){
 const map=$('#map'),layer=$('#mapMarkers'),pop=$('#clusterPopover');
 const glow=document.createElement('div');glow.className='map-edge-feedback';glow.setAttribute('aria-hidden','true');
 for(const side of ['left','right','top','bottom']){const edge=document.createElement('i');edge.className=side;glow.append(edge);}map.append(glow);
 map.addEventListener('pointerenter',measureMap);
 layer.addEventListener('pointerout',e=>{const button=e.target.closest('[data-cluster]');if(button&&!button.contains(e.relatedTarget))scheduleClusterClose();});
 layer.addEventListener('click',e=>{const button=e.target.closest('[data-cluster]');if(!button)return;e.stopPropagation();if(mapMoved&&e.detail!==0)return;const group=mapClusters.find(g=>g.key===button.dataset.cluster);if(group){if(group.members.length>1&&group.members.length<=3)openStackDetail(group,button);else select(group.lead);}});
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
 let trackpadUntil=0;
 map.addEventListener('wheel',e=>{
  if(e.target.closest('.map-controls'))return;
  e.preventDefault();measureMap();
  // WheelEvent has no device type. Fine pixel deltas / horizontal gestures identify
  // trackpad drags; keep that classification through the gesture's momentum tail.
  // Coarse, line and page deltas are mouse wheels. Ctrl/Meta always means pinch zoom.
  const now=performance.now(),pinch=e.ctrlKey||e.metaKey;
  const fine=e.deltaMode===0&&(e.deltaX!==0||Math.abs(e.deltaY)<40||!Number.isInteger(e.deltaY));
  if(!pinch&&e.deltaMode===0&&(fine||now<trackpadUntil)){
   trackpadUntil=now+180;stopCamera();closeCluster();
   panMap(-e.deltaX,-e.deltaY);
   clearTimeout(edgeReleaseTimer);edgeReleaseTimer=setTimeout(releaseEdge,120);return;
  }
  trackpadUntil=0;resetEdge();
  const unit=e.deltaMode===1?16:e.deltaMode===2?mapViewport.height:1;
  const delta=Math.max(-600,Math.min(600,e.deltaY*unit));
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
function resetEdge(){clearTimeout(edgeReleaseTimer);edgeTween?.kill();edgeTween=null;edgeFeedback.x=0;edgeFeedback.y=0;paintEdge();}
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
 stopCamera();closeCluster();const target=zoomDestination(Math.min(12,Math.max(1,zoom*factor)),anchor);
 zoom=target.zoom;pan={x:target.x,y:target.y};scheduleMapDraw();
}
function animateZoom(factor,anchor){
 const target=zoomDestination(Math.min(12,Math.max(1,(cameraDestination?.zoom??zoom)*factor)),anchor);
 tweenCamera(target,.16);
}
