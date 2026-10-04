const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const selectedBrands=new Set();
const featuredRanks=new Map((window.DiscAtlasFeatured||[]).map((disc,index)=>[disc.id,index]));
let manufacturers=[],stackDiscs=[],speedAscending=false,stabilityAscending=false,newestAscending=false;
let discs=[],meta={},filtered=[],selected=null,hover=null,type='all',view=document.body.dataset.view,limit=80,zoom=1,pan={x:0,y:0},points=[],comparison=[],hand='RHBH',power=100,drag=null,moved=false;
const colors={putter:'',mid:'',fairway:'',distance:'',unknown:''},typeOf=d=>d.speed==null?'unknown':d.category==='Putter'?'putter':d.category==='Midrange'?'mid':d.category==='Control Driver'?'fairway':d.category==='Distance Driver'?'distance':d.speed<=3?'putter':d.speed<=5?'mid':d.speed<=9?'fairway':'distance',score=d=>d.speed==null?null:Math.max(0,Math.min(100,50+10*(d.turn+d.fade))),stability=d=>score(d)==null?'Not rated':score(d)<40?'Understable':score(d)>60?'Overstable':'Neutral';
const canvas=$('#canvas'),ctx=canvas.getContext('2d');
let themePalette={};
let brandPalette=[];
function applyTheme(theme,persist=false){
 document.documentElement.dataset.theme=theme;
 if(persist){try{localStorage.setItem('disc-atlas-theme',theme);}catch{}}
 const css=getComputedStyle(document.documentElement),token=n=>css.getPropertyValue('--'+n).trim();
 themePalette={text:token('text'),muted:token('muted'),background:token('map-bg'),grid:token('grid'),center:token('center-line')};
 for(const kind of Object.keys(colors))colors[kind]=token(kind);
 brandPalette=['blue','orange','green','purple','sky','yellow','vermillion'].map(hue=>token('palette-'+hue));

 document.querySelector('meta[name="theme-color"]').setAttribute('content',token('bg'));
 draw();if(selected&&selected.speed!=null)flight();renderCompare();renderLegend();renderContextTitle();if(activeCluster)renderCluster();if(stackDiscs.length&&!$('#detail').hidden)renderStackDetail();
}
window.addEventListener('atlas-theme-change',e=>applyTheme(e.detail));
applyTheme(document.documentElement.dataset.theme||'light');
// Keep source loading separate so an unavailable catalog has an explicit recovery state.
async function load(){try{const response=await fetch('data.json');if(!response.ok)throw new Error('Catalog unavailable');const data=await response.json();discs=data.discs;atlasPositions=window.AtlasLayout.positions(discs);meta=data.meta;manufacturers=[...new Set(discs.map(d=>d.brand))].sort();renderBrands();const rated=discs.filter(d=>d.speed!=null).length,photos=discs.length;$('#coverage').innerHTML=`<strong>${discs.length.toLocaleString()} discs</strong> in the registry<br>${rated.toLocaleString()} with flight ratings · original disc illustrations`;$('#snapshot').textContent=`Registry snapshot · ${meta.date}`;$('#dataSummary').innerHTML=`Snapshot: ${esc(meta.date)}<br>${discs.length.toLocaleString()} approval records · ${rated.toLocaleString()} matched flight ratings · original labeled illustrations for every record.<br>${esc(meta.note||'')}`;filter();if(view==='map')focusFeatured();window.BagApp?.catalogReady();if(window.requestIdleCallback)requestIdleCallback(prepareFeaturedDetails);else setTimeout(prepareFeaturedDetails,200);}catch(e){$('#coverage').textContent='The catalog could not load. Refresh to try again.';$('#count').textContent='Catalog unavailable';$('#empty').hidden=false;$('#empty').firstChild.textContent='Unable to load the catalog. Please reload.';}}
function compareOptional(a,b,ascending){const missingA=a==null||!Number.isFinite(a),missingB=b==null||!Number.isFinite(b);return missingA?Number(!missingB):missingB?-1:ascending?a-b:b-a;}
function filter(){stopCamera();closeCluster();const q=$('#search').value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(),s=Number($('#speed').value),st=$('#stability').value;filtered=discs.filter(d=>(window.BagApp?.isMapActive()?window.BagApp.ids().has(d.id):inCollection(d))&&(!q||searchText(d).includes(q))&&(!selectedBrands.size||selectedBrands.has(d.brand))&&(type==='all'||typeOf(d)===type)&&(!s||d.speed===s)&&(!st||(st==='unknown'?d.speed==null:d.speed!=null&&(st==='under'?score(d)<40:st==='over'?score(d)>60:score(d)>=40&&score(d)<=60))));const sort=$('#sort').value;filtered.sort((a,b)=>sort==='featured'?((featuredRanks.get(a.id)??Infinity)-(featuredRanks.get(b.id)??Infinity)||a.name.localeCompare(b.name)||a.brand.localeCompare(b.brand)||a.id.localeCompare(b.id)):sort==='speed'?(a.speed==null?Number(b.speed!=null):b.speed==null?-1:(speedAscending?a.speed-b.speed:b.speed-a.speed)):sort==='stability'?compareOptional(score(a),score(b),stabilityAscending):sort==='brand'?a.brand.localeCompare(b.brand)||a.name.localeCompare(b.name):sort==='new'?compareOptional(a.date?Date.parse(a.date):null,b.date?Date.parse(b.date):null,newestAscending):a.name.localeCompare(b.name));if(selected&&!filtered.includes(selected)){selected=null;closeDetail(false);}renderSearchCoverage(q);limit=80;$('#count').textContent=view==='map'?`${filtered.filter(d=>d.speed!=null).length.toLocaleString()} mapped`:`${filtered.length.toLocaleString()} discs`;$('#unratedBtn').textContent=`${filtered.filter(d=>d.speed==null).length.toLocaleString()} unrated in directory ↗`;$('#speedValue').textContent=s?`Speed ${s}`:'Any speed';draw();if(view==='map'&&groupCache?.items===filtered&&!mapClusters.length&&filtered.some(d=>d.speed!=null)){zoom=1;pan={x:0,y:0};draw();}renderList();renderBrands();renderContextTitle();renderLegend();updateCollectionNote();}
function reset(){stopCamera();$('#search').value='';selectedBrands.clear();$('#brandSearch').value='';$('#collection').value='current';$('#speed').value=0;$('#stability').value='';type='all';document.querySelectorAll('#types button').forEach(b=>b.classList.toggle('active',b.dataset.type==='all'));zoom=1;pan={x:0,y:0};filter();renderCompare();if(selected)detail();}
function setView(v){stopCamera();closeCluster();closeDetail(false);document.body.dataset.view=v;view=v;$('#count').textContent=v==='map'?`${filtered.filter(d=>d.speed!=null).length.toLocaleString()} mapped`:`${filtered.length.toLocaleString()} discs`;$('#mapWrap').hidden=v!=='map';$('#directory').hidden=v!=='list';$('#mapTab').classList.toggle('active',v==='map');$('#listTab').classList.toggle('active',v==='list');$('#viewTitle').textContent=v==='map'?'Find your line.':'Every mold. Every maker.';if(v==='map')requestAnimationFrame(draw);else renderList();}
function hash(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h);}
// Warm the initial panel after the map paints, outside the user's selection path.
function prepareFeaturedDetails(){if(selected&&$('#detail').hidden&&$('#detail .detail-placeholder')){detail();$('#flight svg')?.pauseAnimations();}}
let detailTrigger=null;
function closeDetail(restore=true){stackDiscs=[];window.AtlasMotion.dismiss($('#detail'),!restore);document.body.classList.remove('detail-open');if(restore)(detailTrigger?.isConnected?detailTrigger:$('#map')).focus({preventScroll:true});}
function select(d){
 if(!d)return;stopCamera();closeCluster();
 if(!$('#detail').contains(document.activeElement))detailTrigger=document.activeElement;
 selected=d;stackDiscs=[];if(view==='map')renderMarkers();
 detail();document.body.classList.add('detail-open');window.AtlasMotion.reveal($('#detail'));
 window.AtlasMotion.selected(markerNodes.get(mapClusters.find(g=>g.members.includes(d))?.key));if(view==='list')renderList();
 requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!$('#detail').hidden&&!$('#detail').inert&&!$('#detail').contains(document.activeElement))$('#closeDetail')?.focus({preventScroll:true});}));
}
function openStackDetail(group,trigger){
 stopCamera();closeCluster();detailTrigger=trigger;stackDiscs=[...group.members];selected=group.lead;renderMarkers();
 renderStackDetail();document.body.classList.add('detail-open');window.AtlasMotion.reveal($('#detail'));
 requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!$('#detail').hidden&&!$('#detail').inert&&!$('#detail').contains(document.activeElement))$('#closeDetail')?.focus({preventScroll:true});}));
}
function renderStackDetail(){
 const panel=$('#detail'),expanded=panel.classList.contains('is-expanded');
 panel.innerHTML=`<div class="detail-actions"><span>CHOOSE YOUR DISC</span><button id="expandDetail" aria-expanded="${expanded}">${expanded?'Collapse':'Full screen'}</button><button id="closeDetail" aria-label="Close disc details">&times;</button></div><div class="stack-matchup"><h2>${stackDiscs.length} discs.<br>Find your line.</h2><p class="micro">Compare their flights, then choose a disc to explore.</p>${comparisonMarkup(stackDiscs)}<div class="stack-choices">${stackDiscs.map((d,i)=>`<button class="stack-choice" style="--flight-color:${comparisonPalette()[i]}" data-choose-disc="${esc(d.id)}">${photoMarkup(d)}<span><strong>${esc(d.catalogName||d.name)}</strong><small>${esc(d.brand)} ? ${['Solid','Dashed','Dotted'][i]} line</small><span class="stack-ratings">${[d.speed,d.glide,d.turn,d.fade].join(' / ')}<small>Speed / Glide / Turn / Fade</small></span></span><span aria-hidden="true">↗</span></button>`).join('')}</div></div>`;
 panel.scrollTop=0;
 $('#closeDetail').onclick=()=>closeDetail();
 $('#expandDetail').onclick=()=>window.AtlasMotion.expand(panel,()=>{const open=panel.classList.toggle('is-expanded');$('#expandDetail').setAttribute('aria-expanded',String(open));$('#expandDetail').textContent=open?'Collapse':'Full screen';});
 panel.querySelectorAll('[data-choose-disc]').forEach(button=>button.onclick=()=>select(stackDiscs.find(d=>d.id===button.dataset.chooseDisc)));
}
// Keep the panel's controls and unchanged sections mounted across selections.
function updateDetail(html){
 const template=document.createElement('template');template.innerHTML=html;
 function sync(parent,source){
  const old=[...parent.childNodes],used=new Set();let cursor=parent.firstChild;
  for(const next of [...source.childNodes]){
   const key=node=>node.nodeType===1?node.tagName+':'+node.id+':'+node.className:node.nodeType;
   const node=old.find(node=>!used.has(node)&&key(node)===key(next));
   if(node){
    used.add(node);
    if(node.nodeType===1){
     for(const attr of [...node.attributes])if(!next.hasAttribute(attr.name))node.removeAttribute(attr.name);
     for(const attr of next.attributes)if(node.getAttribute(attr.name)!==attr.value)node.setAttribute(attr.name,attr.value);
     sync(node,next);
    }else if(node.nodeValue!==next.nodeValue)node.nodeValue=next.nodeValue;
    if(node!==cursor)parent.insertBefore(node,cursor);cursor=node.nextSibling;
   }else{parent.insertBefore(next,cursor);}
  }
  for(const node of old)if(!used.has(node))node.remove();
 }
 sync($('#detail'),template.content);

}
function addDestinationControl(d,classes,id='') {return `<button ${id?'id="'+id+'"':''} class="${classes}" type="button" data-add-menu="${esc(d.id)}" aria-label="Add ${esc(d.catalogName||d.name)} to Bag or Storage" aria-haspopup="menu" aria-controls="addDestinationMenu" aria-expanded="false">${classes==='directory-add'?'<span aria-hidden="true">＋</span>':'＋ Add to'} <span aria-hidden="true">⌄</span></button>`;}
function renderList(){const rows=filtered.slice(0,limit);$('#rows').innerHTML=rows.length?rows.map(d=>`<div class="directory-row"><button class="disc-row ${d===selected?'selected':''}" data-id="${esc(d.id)}"><span class="row-identity">${photoMarkup(d)}<span><strong>${esc(d.catalogName||d.name)}</strong><small>${esc(d.brand)}</small></span></span><span class="nums">${d.speed!=null?[d.speed,d.glide,d.turn,d.fade].join(' / '):'Not yet rated'}</span><span class="score">${score(d)??'—'}</span></button>${addDestinationControl(d,'directory-add')}</div>`).join(''):'<p class="muted">No discs match these filters.</p>';$('#more').hidden=limit>=filtered.length;$('#more').textContent=`Show more · ${filtered.length-limit} remaining`;}
function detail(){const d=selected;if(!d)return;const rated=d.speed!=null,nearby=mapClusters.find(g=>g.members.includes(d)&&g.members.length>1);updateDetail(`<div class="detail-actions"><span>DISC DETAILS</span><button id="expandDetail" aria-expanded="${$('#detail').classList.contains('is-expanded')}">${$('#detail').classList.contains('is-expanded')?'Collapse':'Full screen'}</button><button id="closeDetail" aria-label="Close disc details">&times;</button></div><div class="detail-top"><span class="badge">${d.approved===false?'CATALOG ENTRY':'PDGA APPROVED'}</span><span class="micro">${esc(d.date||'')}</span></div>${nearby?`<button id="nearbyDiscs" class="wide nearby-discs">Explore ${nearby.members.length-1} nearby discs</button>`:''}<div class="disc-photo illustration-detail">${photoMarkup(d,'detail-art')}<span class="illustration-caption">Illustration · color and shape are representative</span></div><button type="button" class="brand-name brand-link" id="detailBrand" title="Filter by ${esc(d.brand)}" aria-pressed="${selectedBrands.has(d.brand)}">${esc(d.brand)} <span aria-hidden="true">↗</span></button><h2>${esc(d.catalogName||d.name)}</h2>${addDestinationControl(d,'wide bag-add primary','addToBag')}${d.catalogName&&d.catalogName!==d.name?`<p class="approval-name">PDGA record: ${esc(d.name)}</p>`:''}${d.catalogNote?`<p class="catalog-note">${esc(d.catalogNote)}</p>`:''}<p class="production-note">${productionLabel(d)}${d.production?.source?` · <a href="${esc(d.production.source)}" target="_blank" rel="noopener">Source ↗</a>`:''}</p><div class="numbers">${['speed','glide','turn','fade'].map(k=>`<div><strong>${d[k]??'—'}</strong><small>${k.toUpperCase()}</small></div>`).join('')}</div>${d.ratingBasis==='retailer_catalog'?'<p class="micro rating-note">Infinite Discs catalog ratings; may reflect player reviews rather than manufacturer flight numbers.</p>':''}${d.ratingBasis==='atlas_adjusted'?`<p class="micro rating-note">Atlas-adjusted from ${['speed','glide','turn','fade'].map(k=>d.manufacturerNumbers[k]).join(' / ')}. ${esc(d.flightNote)}</p>`:''}${rated?`<div class="index-row"><span>${stability(d)}</span><b>${score(d)} <span class="muted">/ 100</span></b></div><div class="index-track"><i style="left:calc(${score(d)}% - 5px)"></i></div><div class="micro">Shared stability index · provisional</div><div class="flight-head"><span>FLIGHT SKETCH</span><select id="hand" aria-label="Throwing hand and style"><option ${hand==='RHBH'?'selected':''}>RHBH</option><option ${hand==='RHFH'?'selected':''}>RHFH</option><option ${hand==='LHBH'?'selected':''}>LHBH</option><option ${hand==='LHFH'?'selected':''}>LHFH</option></select></div><div class="flight" id="flight"></div><div class="power"><label for="power">Relative throwing power</label><span id="powerValue">${power}%</span></div><input id="power" type="range" min="60" max="120" step="5" value="${power}"><p class="micro">Flat release · calm air · illustrative, not measured</p>`:'<p class="micro">Flight ratings have not been confidently matched for this approval record. Its stability and flight path are left unknown.</p>'}<button id="compare" class="wide primary">${comparison.includes(d)?'Remove from comparison':comparison.length>=3?'Comparison full · remove a disc':'＋ Compare this disc'}</button>${d.specs?`<details class="specs"><summary>PDGA dimensions</summary>${Object.entries(d.specs).map(([k,v])=>`<div><span>${k}</span><b>${esc(v)} ${k==='Max weight'?'g':'cm'}</b></div>`).join('')}<p class="micro">Certification ${esc(d.certification)}</p></details>`:''}${window.AtlasShopping.render(d)}<details class="disc-sources"><summary>Sources & provenance</summary>${d.url?`<a class="source" href="${esc(d.url)}" target="_blank" rel="noopener">View PDGA approval ↗</a>`:''}<p class="micro">Original representative disc illustration. Not a manufacturer image, stamp or exact mold rendering.</p>${rated?`<a class="source" href="${esc(d.flightSource||'https://discit-api.fly.dev/disc')}" target="_blank" rel="noopener">Flight data: ${esc(d.flightSourceLabel||'DiscIt / Marshall Street')} ↗</a>`:''}</details>`);if($('#nearbyDiscs'))$('#nearbyDiscs').onclick=()=>openCluster(nearby,$('#nearbyDiscs'),true);$('#closeDetail').onclick=()=>closeDetail();$('#expandDetail').onclick=()=>{window.AtlasMotion.expand($('#detail'),()=>{const expanded=$('#detail').classList.toggle('is-expanded');$('#expandDetail').setAttribute('aria-expanded',String(expanded));$('#expandDetail').textContent=expanded?'Collapse':'Full screen';});};$('#detailBrand').onclick=()=>toggleBrand(d.brand);const photo=$('#detail img');if(photo)photo.onerror=()=>{photo.parentElement.innerHTML='<div class="photo-missing">Photo unavailable</div>';};if(rated){flight();$('#hand').onchange=e=>{hand=e.target.value;flight();renderCompare()};$('#power').oninput=e=>{power=+e.target.value;$('#powerValue').textContent=power+'%';flight();renderCompare()};}$('#compare').onclick=()=>{if(comparison.includes(d))comparison=comparison.filter(x=>x!==d);else if(comparison.length<3)comparison.push(d);detail();renderCompare();};}
function path(d){const sign=hand==='RHFH'||hand==='LHBH'?-1:1,t=-d.turn*(power/100)*12,f=(d.fade+(100-power)/25)*12,end=125+sign*(t*.55-f);return`M125 155 C125 125 ${125+sign*t} 65 ${125+sign*t*.65} 49 S${end+sign*15} 27 ${end} 19`;}
function flight(){if(!$('#flight'))return;const d=selected,p=path(d);$('#flight').innerHTML=`<svg viewBox="0 0 250 175" role="img" aria-label="Illustrative ${hand} flight path for ${esc(d.catalogName||d.name)}"><path d="M125 155V12 M25 50H225 M25 100H225 M25 150H225" stroke="${themePalette.grid}" fill="none" stroke-dasharray="3 5"/><path class="route" id="flightRoute" d="${p}" fill="none" stroke="${discColor(d)}" stroke-width="3" stroke-linecap="round"/><circle cx="125" cy="155" r="4" fill="${themePalette.text}"/><text x="15" y="166" fill="${themePalette.muted}" font-size="12">RELEASE</text><text x="180" y="166" fill="${themePalette.muted}" font-size="12">${hand}</text>${matchMedia('(prefers-reduced-motion: reduce)').matches?'':`<circle r="4" fill="${themePalette.text}" class="moving"><animateMotion dur="3s" repeatCount="indefinite" path="${p}"/></circle>`}</svg>`;}
function renderCompare(){const bar=$('#compareBar');bar.hidden=!comparison.length;bar.innerHTML=`<div class="eyebrow">COMPARE · ${comparison.length} / 3</div><div class="compare-items">${comparison.map(d=>`<div class="compare-item"><button data-remove="${esc(d.id)}" aria-label="Remove ${esc(d.catalogName||d.name)}">×</button>${photoMarkup(d)}<strong>${esc(d.catalogName||d.name)}</strong><small>${esc(d.brand)}</small><p>${d.speed==null?'Not yet rated':[d.speed,d.glide,d.turn,d.fade].join(' / ')}</p><b>${score(d)??'—'}</b> <small>stability index</small>${d.speed==null?'':`<svg viewBox="0 0 250 175" height="100" style="width:100%" aria-label="Flight sketch"><path d="${path(d)}" stroke="${discColor(d)}" stroke-width="3" fill="none"/></svg>`}${addDestinationControl(d,'compare-bag-add')}</div>`).join('')}</div>`;}
$('#search').oninput=filter;$('#speed').oninput=filter;$('#stability').onchange=filter;$('#sort').onchange=()=>{filter();setView('list')};$('#types').onclick=e=>{const b=e.target.closest('button');if(!b)return;type=b.dataset.type;document.querySelectorAll('#types button').forEach(x=>x.classList.toggle('active',x===b));filter()};$('#reset').onclick=reset;$('#emptyReset').onclick=()=>{if(filtered.some(d=>d.speed!=null)){$('#zoomReset').click();}else reset();};$('#mapTab').onclick=()=>setView('map');$('#listTab').onclick=()=>setView('list');$('#unratedBtn').onclick=()=>{$('#method').close();$('#stability').value='unknown';filter();setView('list')};$('#rows').onclick=e=>{const b=e.target.closest('[data-id]');if(b)select(discs.find(d=>d.id===b.dataset.id));};$('#more').onclick=()=>{limit+=80;renderList()};$('#zoomIn').onclick=()=>animateZoom(1.3);$('#zoomOut').onclick=()=>animateZoom(1/1.3);$('#zoomReset').onclick=()=>tweenCamera({zoom:1,x:0,y:0},.28);$('#compareBar').onclick=e=>{const b=e.target.closest('[data-remove]');if(b){comparison=comparison.filter(d=>d.id!==b.dataset.remove);renderCompare();detail();}};['#sourcesBtn','#coverageBtn'].forEach(s=>$(s).onclick=()=>$('#method').showModal());$('#closeMethod').onclick=()=>$('#method').close();$('#method').onclick=e=>{if(e.target===$('#method')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};initAtlasMap();new ResizeObserver(()=>{measureMap();draw();}).observe($('#map'));setView(view);load();

function recentCutoff(){const date=new Date((meta.statusAsOf||'2026-09-23')+'T00:00:00Z');date.setUTCMonth(date.getUTCMonth()-24);return date;}
function isCurrentOrRecent(d){const p=d.production||{};if(p.status==='active'||p.status==='catalog_listed')return true;if(p.status!=='retired'||!p.retirementAnnouncedAt)return false;const date=new Date(p.retirementAnnouncedAt+'T00:00:00Z'),asOf=new Date((meta.statusAsOf||'2026-09-23')+'T00:00:00Z');return date>=recentCutoff()&&date<=asOf;}
function searchText(d){return `${d.name} ${d.brand} ${d.catalogName||''} ${(d.aliases||[]).join(' ')} ${d.catalogName==='Cigarra'?'Cigara':''}`.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function inCollection(d){return $('#collection').value==='all'||isCurrentOrRecent(d);}
function productionLabel(d){const p=d.production||{};if(p.status==='active')return 'Active · manufacturer confirmed';if(p.status==='catalog_listed')return 'Catalog-listed · production unverified';if(p.status==='retired')return 'Retirement announced '+esc(p.retirementAnnouncedAt)+(isCurrentOrRecent(d)?' · within 2 years':'');if(p.status==='retired_date_unknown')return 'Out of production · retirement date unknown';return 'Production status unknown';}
function updateCollectionNote(){const current=discs.filter(isCurrentOrRecent).length;$('#coverage').innerHTML=`<strong>${current.toLocaleString()} current + recent</strong><br>${discs.length.toLocaleString()} total approval records<br>Original labeled disc illustrations`;const all=$('#collection').value==='all';$('#collectionNote').textContent=all?'All approval records, including historical molds and unverified production status.':'Catalog-listed + retirements since Sep 23, 2024. Production status is not fully verified.';}
function toggleBrand(brand){if(selectedBrands.has(brand))selectedBrands.delete(brand);else selectedBrands.add(brand);filter();renderCompare();if(selected)detail();}
function renderBrands(){if(!manufacturers.length)return;const query=$('#brandSearch').value.toLowerCase().trim(),counts=new Map();for(const d of discs)if(inCollection(d))counts.set(d.brand,(counts.get(d.brand)||0)+1);const shown=manufacturers.filter(b=>!query||b.toLowerCase().includes(query)).sort((a,b)=>Number(selectedBrands.has(b))-Number(selectedBrands.has(a))||(counts.get(b)||0)-(counts.get(a)||0)||a.localeCompare(b));$('#brandOptions').innerHTML=shown.length?shown.map(b=>`<label class="brand-option"><input type="checkbox" value="${esc(b)}" ${selectedBrands.has(b)?'checked':''}><span>${esc(b)}</span><small>${counts.get(b)||0}</small></label>`).join(''):'<p class="micro">No manufacturers found.</p>';$('#brandSummary').textContent=selectedBrands.size?`${selectedBrands.size} selected`:'All manufacturers';$('#clearBrands').disabled=!selectedBrands.size;}
function brandColor(brand){const i=Math.max(0,[...selectedBrands].indexOf(brand));return brandPalette[i%brandPalette.length];}
function discColor(d){return selectedBrands.size>1?(selectedBrands.has(d.brand)?brandColor(d.brand):colors.unknown):colors[typeOf(d)];}
function renderContextTitle(){
 const brands=[...selectedBrands],active=brands.length>0,brand=active?brands.join(' + '):'Disc Atlas';
 const subtitle=active&&type!=='all'?$('#types button[data-type="'+type+'"]').firstChild.textContent.trim():'';
 const identity=$('.header-identity'),key=JSON.stringify([brands,subtitle]);
 if(identity.dataset.context===key)return;
 const previous=identity.dataset.context;identity.dataset.context=key;
 const home=identity.querySelector('.logo'),button=$('#contextTitle'),hadFocus=identity.contains(document.activeElement);
 home.hidden=active;button.hidden=!active;
 $('#contextBrand').textContent=brand;$('#contextType').textContent=subtitle;$('#contextType').hidden=!subtitle;
 button.setAttribute('aria-label',`${brand}${subtitle?', '+subtitle:''}. Clear brand and type filters`);
 button.title=`${brand}${subtitle?' / '+subtitle:''}. Clear brand and type filters`;
 if(hadFocus)(active?button:home).focus({preventScroll:true});
 const target=active?button:home;
 identity.getAnimations({subtree:true}).forEach(animation=>animation.cancel());
 if(previous&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  target.animate([{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'cubic-bezier(.2,.8,.2,1)'});
 }
}
$('#contextTitle').onclick=()=>{
 selectedBrands.clear();type='all';
 document.querySelectorAll('#types button').forEach(button=>button.classList.toggle('active',button.dataset.type==='all'));
 filter();renderCompare();if(selected)detail();
};
function renderLegend(){const names=[...selectedBrands];$('#legend').innerHTML=names.length>1?`<span class="legend-label">BRANDS</span>`+names.slice(0,7).map(b=>`<span><i class="dot" style="background:${brandColor(b)}"></i>${esc(b)}</span>`).join('')+(names.length>7?`<span>+${names.length-7} more</span>`:''):'<span><i class="dot putter"></i>Putter</span><span><i class="dot mid"></i>Mid</span><span><i class="dot fairway"></i>Fairway</span><span><i class="dot distance"></i>Distance</span>';}
$('#collection').onchange=()=>{zoom=1;pan={x:0,y:0};filter();};
$('#brandSearch').oninput=renderBrands;
$('#brandOptions').onchange=e=>{if(e.target.matches('input[type="checkbox"]')){const brand=e.target.value;toggleBrand(brand);const replacement=[...document.querySelectorAll('#brandOptions input')].find(x=>x.value===brand);replacement?.focus({preventScroll:true});}};
$('#clearBrands').onclick=()=>{selectedBrands.clear();filter();renderCompare();if(selected)detail();};

function renderSearchCoverage(q){const node=$('#searchCoverage');if(!node)return;const matches=q?discs.filter(d=>searchText(d).includes(q)):[],hidden=matches.filter(d=>!filtered.includes(d));node.hidden=!q;node.innerHTML=!q?'':hidden.length?`${hidden.length} matching approval record${hidden.length===1?' is':'s are'} outside these filters. <button id="searchAllRecords" class="pill-button">Search all approvals</button>`:matches.length?`${matches.length} matching approval record${matches.length===1?'':'s'}.`:'No matching approval in this registry snapshot. Try another spelling or manufacturer.';$('#searchAllRecords')?.addEventListener('click',()=>{if(window.BagApp?.isMapActive())$('#listTab').click();$('#collection').value='all';selectedBrands.clear();type='all';$('#speed').value=0;$('#stability').value='';document.querySelectorAll('#types button').forEach(b=>b.classList.toggle('active',b.dataset.type==='all'));$('#search').value=q;filter();setView('list');});}

$('#filtersToggle').onclick=()=>{const open=$('#filtersToggle').getAttribute('aria-expanded')!=='true';$('#filtersToggle').setAttribute('aria-expanded',String(open));if(open){window.AtlasMotion.reveal($('#filters'),'left');$('#closeFilters').focus();}else{window.AtlasMotion.dismiss($('#filters'));$('#filtersToggle').focus();}};
$('#closeFilters').onclick=()=>{window.AtlasMotion.dismiss($('#filters'));$('#filtersToggle').setAttribute('aria-expanded','false');$('#filtersToggle').focus();};
document.addEventListener('keydown',e=>{if(e.key!=='Escape'||document.querySelector('dialog[open]')||activeCluster)return;if(!$('#detail').hidden)closeDetail();else if(!$('#filters').hidden)$('#closeFilters').click();});

// Native buttons toggle each active numeric/date sort with mouse, Enter or Space.
$('#sortBar').onclick=e=>{
 const button=e.target.closest('[data-sort]');if(!button)return;
 const next=button.dataset.sort;
 speedAscending=next==='speed'&&$('#sort').value==='speed'?!speedAscending:false;
 stabilityAscending=next==='stability'&&$('#sort').value==='stability'?!stabilityAscending:false;
 newestAscending=next==='new'&&$('#sort').value==='new'?!newestAscending:false;
 $('#sort').value=next;
 for(const option of $('#sortBar').querySelectorAll('[data-sort]')){
  option.setAttribute('aria-pressed',String(option.dataset.sort===next));
  const config={speed:['Speed',speedAscending,'fastest first','slowest first'],stability:['Stability',stabilityAscending,'most overstable first','most understable first'],new:['Newest',newestAscending,'newest first','oldest first']}[option.dataset.sort];
  if(config){
   const [label,ascending,descendingText,ascendingText]=config,current=ascending?ascendingText:descendingText,other=ascending?descendingText:ascendingText;
   const displayLabel=option.dataset.sort==='new'&&ascending?'Oldest':label;
   option.textContent=displayLabel+(ascending?' ↑':' ↓');
   option.title=current[0].toUpperCase()+current.slice(1)+'. Click for '+other+'.';
   option.setAttribute('aria-label',displayLabel+': '+current);
  }
 }
 $('#sort').dispatchEvent(new Event('change'));
};
