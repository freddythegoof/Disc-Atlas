// Photo-led, zoom-aware clusters. All hit targets remain native keyboard buttons.
let mapClusters=[],activeCluster=null,clusterPinned=false,clusterAnchor=null,clusterPicks=new Set(),clusterCompared=false;
let clusterHoverTimer=null,clusterCloseTimer=null,markerSignature='',mapDrag=null;
function photoMarkup(d,extra=''){
 const label=d.catalogName||d.name;
 const hue=[...d.brand].reduce((n,c)=>(n*31+c.charCodeAt(0))%360,0);
 return `<span class="disc-art atlas-illustration ${extra}" style="--disc-color:${discColor(d)};--art-hue:${hue}deg" role="img" aria-label="${esc(d.brand+' '+label)} — generic disc illustration, not a product photo"><img src="/art/disc-base.png" alt="" loading="lazy" decoding="async"><span class="art-label"><small>${esc(d.brand)}</small><b>${esc(label)}</b><em>DISC ATLAS</em></span></span>`;
}
const featuredMolds=['destroyer','wraith','buzzz','zone','hex','crave','envy','luna','teebird'];
function featuredRank(d){const n=featuredMolds.indexOf(d.name.toLowerCase());return n>=0?n:99;}
function buildClusters(items,w,h){
 const step=(selectedBrands.size||window.BagApp?.isMapActive())?76:28,left=46,top=39,cols=Math.max(1,Math.floor((w-84)/step)),rows=Math.max(1,Math.floor((h-78)/step)),dx=(w-84)/cols,dy=(h-78)/rows;
 const bins=new Map();
 for(const d of items){if(d.speed==null)continue;const px=left+(score(d)/100)*(w-92)*zoom+pan.x,py=h-40-((d.speed-1)/14)*(h-84)*zoom+pan.y;
  if(px<-step||px>w+step||py<-step||py>h+step)continue;
  const gx=Math.round((px-42)/dx),gy=Math.round((py-top)/dy),key=gx+':'+gy;
  if(!bins.has(key))bins.set(key,{key,x:42+gx*dx,y:top+gy*dy,members:[],sumX:0,sumY:0});
  const g=bins.get(key);g.members.push(d);g.sumX+=px;g.sumY+=py;
 }
 const groups=[...bins.values()].map(g=>({...g,x:Math.max(38,Math.min(w-38,g.x)),y:Math.max(39,Math.min(h-38,g.y)),actualX:g.sumX/g.members.length,actualY:g.sumY/g.members.length})).filter(g=>g.actualX>=12&&g.actualX<=w-12&&g.actualY>=15&&g.actualY<=h-10);
 const large=[];
 for(const g of [...groups].sort((a,b)=>Math.min(...a.members.map(featuredRank))-Math.min(...b.members.map(featuredRank)))){
  const photos=[...g.members].sort((a,b)=>featuredRank(a)-featuredRank(b));
  g.lead=photos[0]||g.members[0];g.large=false;
  const featured=featuredRank(g.lead)<99;
  // A sparse set of familiar molds anchors the full map. Brand views use a richer mix.
  const candidate=(selectedBrands.size||window.BagApp?.isMapActive())?(photos.length>0||g.members.length>=4):featured;
  if(candidate){const clearance=(selectedBrands.size||window.BagApp?.isMapActive())?72:62;
   const offsets=(selectedBrands.size||window.BagApp?.isMapActive())?[0]:[0,-30,30,-60,60];
   for(const offset of offsets){const xx=g.x+offset;if(xx<34||xx>w-34)continue;if(large.every(p=>Math.hypot(p.x-xx,p.y-g.y)>clearance)){g.x=xx;g.large=true;large.push(g);break;}}
  }
 }
 // Fold dots covered by a featured photo into that photo's hover gallery.
 const covered=new Set();
 for(const g of groups.filter(g=>!g.large)){
  const target=large.find(p=>Math.hypot(p.x-g.x,p.y-g.y)<((selectedBrands.size||window.BagApp?.isMapActive())?40:35));
  if(target){target.members.push(...g.members);target.sumX+=g.sumX;target.sumY+=g.sumY;target.actualX=target.sumX/target.members.length;target.actualY=target.sumY/target.members.length;covered.add(g);}
 }
 return groups.filter(g=>!covered.has(g));
}
function draw(){
 if(view!=='map')return;
 const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height;if(!w||!h)return;
 const dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const x=s=>46+(s/100)*(w-92)*zoom+pan.x,y=s=>h-40-((s-1)/14)*(h-84)*zoom+pan.y;
 ctx.lineWidth=1;ctx.font='12px DM Sans, sans-serif';
 for(let n=1;n<=15;n++){const yy=y(n);if(yy<26||yy>h-18)continue;ctx.strokeStyle=themePalette.grid;ctx.beginPath();ctx.moveTo(31,yy);ctx.lineTo(w-16,yy);ctx.stroke();ctx.fillStyle=themePalette.muted;ctx.fillText(n,10,yy+4);}
 for(let n=0;n<=100;n+=10){const xx=x(n);if(xx<28||xx>w-15)continue;ctx.strokeStyle=n===50?themePalette.center:themePalette.grid;ctx.setLineDash(n===50?[]:[2,6]);ctx.beginPath();ctx.moveTo(xx,24);ctx.lineTo(xx,h-15);ctx.stroke();}ctx.setLineDash([]);
 mapClusters=buildClusters(filtered,w,h);
 // A subtle tether preserves the underlying mean coordinate when markers separate.
 for(const g of mapClusters){if(Math.hypot(g.x-g.actualX,g.y-g.actualY)>13){ctx.strokeStyle=themePalette.grid;ctx.beginPath();ctx.moveTo(g.actualX,g.actualY);ctx.lineTo(g.x,g.y);ctx.stroke();}}
 renderMarkers();$('#zoomLabel').textContent=zoom.toFixed(1)+'×';$('#empty').hidden=filtered.some(d=>d.speed!=null);
 $('#mapSummary').textContent=`${mapClusters.length} flight ${mapClusters.length===1?'group':'groups'} · ${filtered.filter(d=>d.speed!=null).length} discs`;
}
function renderMarkers(){
 const signature=JSON.stringify([zoom,Math.round(pan.x),Math.round(pan.y),selected?.id,document.documentElement.dataset.theme,[...selectedBrands],mapClusters.map(g=>[g.key,g.x,g.y,g.members.map(d=>d.id)])]);
 if(markerSignature===signature)return;markerSignature=signature;
 $('#mapMarkers').innerHTML=mapClusters.map(g=>{
  const pictures=[...g.members],lead=g.lead||pictures[0]||g.members[0],stack=[lead,...pictures.filter(d=>d!==lead)].slice(0,3),active=g.members.includes(selected),n=g.members.length;
  return `<button type="button" class="atlas-marker ${g.large?'is-large':'is-dot'} ${selectedBrands.size||window.BagApp?.isMapActive()?'brand-view':'overview'} ${n>1?'is-stack':''} ${active?'is-selected':''}" data-cluster="${esc(g.key)}" style="left:${g.x}px;top:${g.y}px;--disc-color:${discColor(lead)}" aria-label="${n===1?esc(lead.name):n+' discs with nearby flight ratings'} — ${n<=3?'preview and automatically compare':'open disc gallery'}" aria-haspopup="dialog"><span class="marker-halo"></span><span class="map-dot"></span><span class="marker-stack">${stack.slice().reverse().map((d,i)=>photoMarkup(d,'stack-'+(stack.length-i-1))).join('')}</span>${n>1?`<span class="cluster-count">${n}</span>`:''}<span class="marker-name">${esc(lead.name)}${n>1?` <small>+${n-1}</small>`:''}</span></button>`;
 }).join('');
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
 if(innerWidth<700){pop.style.left='12px';pop.style.top='';pop.style.bottom='12px';return;}
 pop.style.bottom='';const height=Math.min(pop.getBoundingClientRect().height,innerHeight*.8);
 let left=a.right+16,top=a.top-24;
 if(left+width>innerWidth-12){left=a.left-width-16;if(left<12){left=Math.max(12,Math.min(innerWidth-width-12,a.left-width/2));top=a.bottom+16;if(top+height>innerHeight-12)top=a.top-height-16;}}
 pop.style.left=Math.max(12,Math.min(innerWidth-width-12,left))+'px';pop.style.top=Math.max(12,Math.min(innerHeight-height-12,top))+'px';
}
function comparisonMarkup(items){
 const palette=document.documentElement.dataset.theme==='dark'?['#92b8ff','#ffab7a','#66d9bf']:['#265bad','#984216','#126852'];
 return `<div class="cluster-flight"><div class="flight-overlay-label"><span>FLIGHT OVERLAY</span><span>${hand} · ${power}% power</span></div><svg viewBox="0 0 250 180" role="img" aria-label="Illustrative flight comparison"><path d="M125 155V12 M30 50H220 M30 100H220 M30 150H220" stroke="${themePalette.grid}" fill="none" stroke-dasharray="3 5"/>${items.map((d,i)=>`<path class="comparison-route" d="${path(d)}" fill="none" stroke="${palette[i]}" stroke-width="3" stroke-linecap="round" ${i===1?'stroke-dasharray="8 4"':i===2?'stroke-dasharray="2 4"':''}/>`).join('')}<circle cx="125" cy="155" r="4" fill="${themePalette.text}"/></svg><p class="micro">Flat release · illustrative paths</p></div><div class="cluster-specs">${items.map((d,i)=>`<div class="cluster-stat"><strong><i class="dot" style="background:${palette[i]}"></i>${esc(d.name)}</strong><small>${esc(d.brand)}</small><div class="mini-numbers">${['speed','glide','turn','fade'].map(k=>`<span><b>${d[k]}</b><small>${k[0].toUpperCase()}</small></span>`).join('')}</div><span class="micro">${stability(d)} · index ${score(d)}</span></div>`).join('')}</div>`;
}
function renderCluster(){
 if(!activeCluster)return;const pop=$('#clusterPopover'),items=activeCluster.members,small=items.length<=3,speeds=items.map(d=>d.speed),scores=items.map(score),range=a=>Math.min(...a)===Math.max(...a)?String(a[0]):`${Math.min(...a)}–${Math.max(...a)}`;
 pop.hidden=false;pop.innerHTML=`<div class="cluster-heading"><div><div class="eyebrow">${small?'THE FLIGHT MATCHUP':'EXPLORE THIS FLIGHT GROUP'}</div><h3 id="clusterTitle">${items.length===1?esc(items[0].name):items.length+' discs. Similar territory.'}</h3><p>Speed ${range(speeds)} <span>•</span> Stability ${range(scores)}</p></div><button id="clusterClose" aria-label="Close disc group" type="button">×</button></div><div class="cluster-scroll"><div class="cluster-gallery ${small?'small-group':''}">${items.map(d=>`<article class="cluster-disc"><button class="inspect-disc" type="button" data-inspect="${d.id}" aria-label="Inspect ${esc(d.brand+' '+d.name)}">${photoMarkup(d)}<strong>${esc(d.name)}</strong><small>${esc(d.brand)}</small></button>${!small?`<button class="pick-compare ${clusterPicks.has(d.id)?'is-picked':''}" type="button" data-pick="${d.id}" aria-pressed="${clusterPicks.has(d.id)}">${clusterPicks.has(d.id)?'✓ Selected':'+ Compare'}</button>`:''}</article>`).join('')}</div>${small?`<div class="auto-compare-label">${items.length>1?'AUTOMATIC COMPARISON':'FLIGHT PREVIEW'}</div><div class="cluster-comparison">${comparisonMarkup(items)}</div>`:`<div id="clusterComparison" class="cluster-comparison" ${clusterCompared?'':'hidden'}>${clusterCompared?comparisonMarkup(items.filter(d=>clusterPicks.has(d.id))):''}</div>`}</div><div class="cluster-footer">${small?`<span class="micro">Select a disc to see its full details.</span><button type="button" id="keepComparison" class="cluster-action">Keep ${items.length>1?'comparison':'disc'}</button>`:`<span id="clusterPickStatus" class="micro" aria-live="polite">${clusterPicks.size} / 3 selected · choose up to three</span><button type="button" id="compareCluster" class="cluster-action" ${clusterPicks.size<2?'disabled':''}>Compare selected${clusterPicks.size?' ('+clusterPicks.size+')':''}</button>`}</div>`;
}
function initAtlasMap(){
 const map=$('#map'),layer=$('#mapMarkers'),pop=$('#clusterPopover');
 layer.addEventListener('pointerover',e=>{const button=e.target.closest('[data-cluster]');if(!button||button.contains(e.relatedTarget)||e.pointerType==='touch'||clusterPinned)return;clearClusterTimers();const g=mapClusters.find(x=>x.key===button.dataset.cluster);clusterHoverTimer=setTimeout(()=>openCluster(g,button),160);});
 layer.addEventListener('pointerout',e=>{const button=e.target.closest('[data-cluster]');if(button&&!button.contains(e.relatedTarget))scheduleClusterClose();});
 layer.addEventListener('click',e=>{const button=e.target.closest('[data-cluster]');if(!button)return;e.stopPropagation();openCluster(mapClusters.find(g=>g.key===button.dataset.cluster),button,true);});
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
 map.addEventListener('pointerdown',e=>{if(e.target.closest('button')||e.button!==0)return;closeCluster();mapDrag={x:e.clientX,y:e.clientY};map.setPointerCapture(e.pointerId);map.classList.add('is-dragging');});
 map.addEventListener('pointermove',e=>{if(!mapDrag)return;pan.x+=e.clientX-mapDrag.x;pan.y+=e.clientY-mapDrag.y;mapDrag={x:e.clientX,y:e.clientY};draw();});
 const stop=e=>{mapDrag=null;map.classList.remove('is-dragging');if(map.hasPointerCapture(e.pointerId))map.releasePointerCapture(e.pointerId);};map.addEventListener('pointerup',stop);map.addEventListener('pointercancel',stop);
 map.addEventListener('wheel',e=>{e.preventDefault();changeZoom(e.deltaY<0?1.18:1/1.18,{x:e.clientX-map.getBoundingClientRect().left,y:e.clientY-map.getBoundingClientRect().top});},{passive:false});
 map.addEventListener('keydown',e=>{if(e.target!==map)return;const commands={ArrowLeft:[40,0],ArrowRight:[-40,0],ArrowUp:[0,40],ArrowDown:[0,-40]};if(commands[e.key]){e.preventDefault();closeCluster();pan.x+=commands[e.key][0];pan.y+=commands[e.key][1];draw();}else if(e.key==='+'||e.key==='='){e.preventDefault();changeZoom(1.3);}else if(e.key==='-'){e.preventDefault();changeZoom(1/1.3);}});
 window.addEventListener('resize',()=>closeCluster());window.addEventListener('scroll',e=>{if(activeCluster&&!clusterPinned&&!pop.contains(e.target))closeCluster();},true);
}
function changeZoom(factor,anchor){
 closeCluster();const old=zoom;zoom=Math.min(8,Math.max(1,zoom*factor));const w=canvas.clientWidth,h=canvas.clientHeight,at=anchor||{x:w/2,y:h/2},ratio=zoom/old;
 pan.x=at.x-46-(at.x-46-pan.x)*ratio;pan.y=at.y-(h-40)-(at.y-(h-40)-pan.y)*ratio;
 if(zoom===1)pan={x:0,y:0};draw();
}
