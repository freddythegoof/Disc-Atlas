import {plasticOptions,defaultDiscDetails,wearLabel,bagClass,validateDiscDetails,validateLostDetails,validateBagSettings,plasticColor,bagComparator,stabilityBiasLabel,pocketLabel,POCKETS,defaultPocket} from './bag-values.js';
import {BagScene} from './bag-scene.js';
import {moldShifts,personalPositions} from './personal-lens.js';
import {DEMO_BAG,DEMO_DISCS} from './bag-demo.js';
import {isOvermold,overmoldColors} from './disc3d/overmold.mjs';
import {StorageScene,LostScene} from './collection-scenes.js';
import {rackOrder} from './collection3d/rack-layout.mjs';

const $ = s => document.querySelector(s), esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let account = window.AtlasAccount?.current || null, settings = {bag_model:'Custom bag',capacity:20}, items = [], active = false;
let plastics, models, editing = null, removing = null, losing = null, generation = 0, loading = false, loadError = '', opener = null, readSequence = 0;
let colorCustomized=false,rimCustomized=false,ordering=false,dragging=null,mapOpen=false,myMapKey='';
// The view above (Bag, My Map, Storage or Lost) and the one list shown below it (Bag, Storage or Lost).
let bagView='bag',listView='bag',removeOrigin=null;
const pendingPockets=new Map();
const pendingFound=new Set();
const catalogs = Promise.all(['/bag-plastics.json','/bag-models.json'].map(async path => {const r = await fetch(path);if (!r.ok) throw Error('Bag choices could not load. Please try again.');return r.json();})).then(([p,m])=>{plastics=p;models=m;});
// Fetch failures are surfaced when opening a sheet, without an unhandled rejection.
catalogs.catch(()=>{});
const mold = id => discs.find(d=>d.id===id);
// Signed out, My Bag shows a static, read-only demo bag; nothing in it reaches the bag API.
const isDemo = () => !!account && !account.user;
function showDemo(){if(isDemo() && items!==DEMO_DISCS){items=DEMO_DISCS;settings=DEMO_BAG;}}
const name = d => d?.catalogName || d?.name || 'Catalog mold unavailable';
// The atlas shows the signed-in player's bag in its own colors: one color per mold, from its
// first copy in bag order. Storage discs are not in the bag.
let bagColorMap=new Map(),bagColorKey='[]';
function publishBagColors(){
 const bagged=account?.user?items.filter(i=>i.in_bag!==false && mold(i.mold_id)).sort(bagComparator(settings.sort_mode,mold)):[],next=new Map();
 for(const i of bagged)if(!next.has(i.mold_id))next.set(i.mold_id,i.color||'#e6c668');
 const key=JSON.stringify([...next]);if(key===bagColorKey)return;bagColorKey=key;bagColorMap=next;
 window.dispatchEvent(new CustomEvent('atlas-bag-change'));
}
const scene=new BagScene($('#bagScene'),{lookup:mold,inspect:openBagDetail,deselect:closeBagDetail});
// Storage racks and the lost-disc graveyard: their 3D loads only when their tab first shows.
const storageScene=new StorageScene($('#storageScene'),{lookup:mold,name,
 moveToBag:(item,button)=>void moveDisc(item.id,button),
 details:item=>openBagDetail(mold(item.mold_id),item),
 remove:item=>openRemove(item,'card')});
const lostScene=new LostScene($('#lostScene'),{lookup:mold,name,classOf:bagClass,
 found:(item,button)=>void foundDisc(item.id,button),pending:id=>pendingFound.has(id)});
const storedItems=()=>rackOrder(items.filter(i=>i.in_bag===false && i.status!=='lost'),{classOf:i=>bagClass(mold(i.mold_id)),compare:bagComparator(settings.sort_mode,mold)});
const lostItems=()=>items.filter(i=>i.status==='lost').sort((a,b)=>b.lostDate.localeCompare(a.lostDate) || a.id.localeCompare(b.id));
// Focus the first of these that is on screen (rows in a hidden list don't count).
function focusFirst(...selectors){for(const selector of selectors){const node=selector && $(selector);if(node?.checkVisibility() && !node.disabled){node.focus({preventScroll:true});return node;}}return null;}
// The row after this one in its own list (or before it, at the end), to keep focus nearby when it leaves.
function neighborOf(id){
 const row=$(`#myBagContents [data-disc-id="${CSS.escape(id)}"],#myBagContents [data-memorial-id="${CSS.escape(id)}"]`),list=row?.closest('#bagLineup,#bagStorage,#bagMemorial');if(!list)return null;
 const rows=[...list.querySelectorAll('[data-disc-id],[data-memorial-id]')],i=rows.indexOf(row),next=rows[i+1]||rows[i-1];
 return next?(next.dataset.discId||next.dataset.memorialId):null;
}
// Disc details open in the atlas's own panel, docked on the My Bag page, with this copy's details and notes.
let detailItem=null;const detailPanel=$('#detail'),detailHome=detailPanel.parentNode;
function openBagDetail(d,item){
 if(!d || !item)return;detailItem=item;
 if(detailPanel.parentNode!==$('#myBagView'))$('#myBagView').append(detailPanel);
 select(d);
}
// Putting an out disc back closes its details (when they show that disc); Escape or a click on
// empty space closes the details the bag opened.
function closeBagDetail(item){if(detailPanel.parentNode===$('#myBagView') && !detailPanel.hidden && (!item || !detailItem || detailItem.id===item.id))closeDetail(false);}
function undockDetail(){detailItem=null;if(detailPanel.parentNode!==detailHome)detailHome.append(detailPanel);}
function refreshBagDetail(){
 if(!detailItem || detailPanel.hidden || detailPanel.parentNode!==$('#myBagView'))return;
 const item=items.find(i=>i.id===detailItem.id);
 if(item){detailItem=item;detail();}else closeDetail(false);
}
function bagDetailMarkup(d){
 // On My Map a disc is a mold; its details describe the first bagged copy.
 const item=detailItem?.mold_id===d.id?detailItem:mapOpen?bagged().find(i=>i.mold_id===d.id):null;if(!active || !item)return '';
 const rated=d.speed!=null,index=rated?Math.max(0,Math.min(100,50+10*(d.turn+d.fade))):null;
 const shift=mapOpen && rated?moldShifts(bagged().filter(i=>i.mold_id===d.id)).get(d.id):0,personal=Math.round(Math.max(0,Math.min(100,index+shift)));
 return `<section class="bag-detail-personal" aria-labelledby="bagDetailTitle"><div class="bag-detail-heading"><span class="bag-disc-swatch" style="--disc-color:${esc(item.color||'#e6c668')}" aria-hidden="true"></span><div><h3 id="bagDetailTitle">${isDemo()?'Sample disc':'Your disc'}</h3><span>${item.in_bag===false?'In Storage':pocketLabel(item.pocket)}</span></div></div><dl class="bag-detail-facts"><div><dt>Plastic</dt><dd>${esc(item.plastic)}</dd></div><div><dt>Weight</dt><dd>${item.weight_g} g</dd></div><div><dt>Wear</dt><dd>${item.wear}/10 · ${wearLabel(item.wear)}</dd></div>${item.stability_bias?`<div><dt>This copy</dt><dd>${stabilityBiasLabel(item.stability_bias)}</dd></div>`:''}${shift && personal!==index?`<div><dt>On your map</dt><dd>Stability ${personal} · consensus ${index}</dd></div>`:''}</dl><h4>Personal notes</h4>${item.notes?`<p class="bag-detail-notes">${esc(item.notes)}</p>`:'<p class="bag-detail-notes is-empty">No notes yet.</p>'}<div class="bag-detail-actions"><button type="button" class="wide bag-detail-atlas" data-show-on-atlas="${esc(d.id)}" ${rated?'':'disabled aria-describedby="bagDetailUnmapped"'}>Show on Atlas ↗</button>${isDemo()?'':`<button type="button" class="wide bag-detail-edit" data-bag-detail-edit="${esc(item.id)}">Edit disc</button>`}</div>${rated?'':'<p id="bagDetailUnmapped" class="micro">Not on the map yet: this mold has no flight ratings.</p>'}</section>`;
}
function detailAppearance(d){
 const item=detailItem?.mold_id===d.id?detailItem:mapOpen?bagged().find(i=>i.mold_id===d.id):null;
 return active && item?{color:item.color,colors:{plate:item.color,rim:item.rim_color || undefined}}:{};
}
detailPanel.addEventListener('click',event=>{
 const show=event.target.closest('[data-show-on-atlas]'),edit=event.target.closest('[data-bag-detail-edit]');
 if(show && !show.disabled){const d=mold(show.dataset.showOnAtlas);leaveBag('map');showOnAtlas(d);}
 if(edit){const item=items.find(i=>i.id===edit.dataset.bagDetailEdit);if(item)void openDisc(mold(item.mold_id),item);}
});
function status(message) {$('#myBagStatus').textContent = message;}
async function api(path = '',method = 'GET',data) {
 if (!account?.user) throw Error('Sign in to build and save your own bag.');
 const epoch = generation;
 const r = await fetch('/api/bag' + path,{method,credentials:'same-origin',cache:'no-store',headers:method==='GET'?{}:{'Content-Type':'application/json','X-Atlas-CSRF':account?.csrfToken || ''},...(data ? {body:JSON.stringify(data)} : {})});
 const result = await r.json();
 if (epoch !== generation) throw new DOMException('Account changed','AbortError');
 if (!r.ok) throw Error(result.error || 'Please try again.');
 return result;
}
async function loadBag() {
 if (!account?.user) return;
 const epoch = generation, sequence = ++readSequence; loading = true; loadError = ''; render();
 try {const data = await api();if(sequence!==readSequence)return;settings=data.bag;items=data.discs;}
 catch(error) {if (error.name !== 'AbortError' && sequence===readSequence) loadError=error.message;}
 finally {if(epoch===generation && sequence===readSequence){loading=false;render();}}
}
function sync(data) {
 const changed = account?.csrfToken !== data.csrfToken || !!account?.user !== !!data.user;
 account = data;
 if(changed) {
  generation++;mapOpen=false;bagView='bag';listView='bag';scene.reset();if(detailPanel.parentNode!==detailHome){closeDetail(false);undockDetail();}items=[];settings={bag_model:'Custom bag',capacity:20};loadError='';loading=false;editing=null;removing=null;losing=null;ordering=false;dragging=null;pendingPockets.clear();pendingFound.clear();
  window.AtlasDropdown.close(false);
  for(const id of ['addDiscDialog','bagModelDialog','removeDiscDialog','lostDiscDialog']) if($('#'+id).open)$('#'+id).close();
  status('');
 }
 showDemo();render();if(changed && data.user)void loadBag();
}
function render() {
 const signedIn = !!account?.user,demo=isDemo(),shown=signedIn || demo;publishBagColors();
 // Until the account check answers, the teaser holds the place; signed out, the demo bag shows.
 $('#myBagTeaser').hidden=shown;$('#myBagDemo').hidden=!demo;$('#myBagEyebrow').textContent=demo?'SAMPLE LINEUP':'YOUR EVERYDAY LINEUP';
 $('#myBagTeaserStatus').textContent='Checking your account…';
 $('#myBagTools').hidden=!shown;$('#editBagModel').hidden=demo;$('#myBagContents').hidden=!shown || loading || !!loadError;
 $('#myBagLoadState').hidden=!signedIn || (!loading && !loadError);
 $('#myBagLoadMessage').textContent=loading?'Loading your bag…':loadError;$('#retryMyBag').hidden=!loadError;
 $('#addBagDisc').hidden=!signedIn;
 const bagged=items.filter(i=>i.in_bag!==false).sort(bagComparator(settings.sort_mode,mold)),stored=items.filter(i=>i.in_bag===false && i.status!=='lost'),count=bagged.length;
 $('#bagSort').value=settings.sort_mode || 'speed';$('#bagSort').disabled=loading || !!loadError || ordering;
 $('#bagSortHint').textContent=settings.sort_mode==='custom'?'Drag the grip, or use Move earlier / later.':settings.sort_mode==='stability'?'Most stable first · shared atlas index':'Fastest first · stability within each speed';
 $('#bagScene').hidden=!shown || loading || !!loadError || bagView!=='bag';
 $('#myBagViews').hidden=!signedIn;$('.bag-sort-bar').hidden=bagView!=='bag';$('.bag-sort-bar').toggleAttribute('data-demo',!!demo);
 for(const button of $('#myBagViews').querySelectorAll('[data-bag-view]')){const on=button.dataset.bagView===bagView;button.setAttribute('aria-checked',String(on));button.tabIndex=on?0:-1;}
 $('#myBagContents').hidden||=mapOpen;$('#myMapPanel').hidden=!signedIn || loading || !!loadError || !mapOpen;syncMyMap();
 // One list at a time: the picker chooses Bag, Storage or Lost (the demo has no Lost list).
 if(demo && listView==='lost')listView='bag';
 const lost=items.filter(i=>i.status==='lost');
 $('#bagListPicker').hidden=$('#myBagContents').hidden;$('#bagListPicker [data-bag-list="lost"]').hidden=!!demo;
 for(const button of $('#bagListPicker').querySelectorAll('[data-bag-list]')){const on=button.dataset.bagList===listView;button.setAttribute('aria-checked',String(on));button.tabIndex=on?0:-1;}
 $('#bagListPicker [data-list-count="bag"]').textContent=count;$('#bagListPicker [data-list-count="storage"]').textContent=stored.length;$('#bagListPicker [data-list-count="lost"]').textContent=lost.length;
 const ready=signedIn && !loading && !loadError && active;
 storageScene.sync(ready && bagView==='storage',ready && bagView==='storage'?storedItems():[]);
 lostScene.sync(ready && bagView==='lost',ready && bagView==='lost'?lostItems():[]);
 $('#bagSlotMeter').textContent=`${count} / ${settings.capacity}`;
 const breakdown=`${settings.main_capacity ?? settings.capacity} main + ${settings.putter_capacity ?? 0} putter${settings.extra_capacity?' + '+settings.extra_capacity+' extra':''}`;
 $('#bagSlotMeter').title=breakdown;$('#bagPocketBreakdown').textContent=breakdown;
 $('#bagModelName').textContent=settings.bag_model;
 $('#bagSlotProgress').max=settings.capacity;$('#bagSlotProgress').value=Math.min(count,settings.capacity);
 $('#bagCapacityNotice').hidden=count<settings.capacity;
 $('#bagCapacityNotice').textContent=count===settings.capacity?'Your bag is full. You can still add a disc.':'A little over capacity. Move a spare to Storage, or keep carrying it.';
 $('#editBagModel').disabled=loading || !!loadError || ordering;
 if(!shown || loading || loadError){$('#myBagContents').replaceChildren();return;}
 scene.update(items,settings);if(active && bagView==='bag')void scene.reveal();refreshBagDetail();
 const groups=[['distance','Distance drivers'],['fairway','Fairway drivers'],['mid','Midranges'],['putter','Putters'],['unknown','Unclassified discs']];
 const grouped=(collection,ordered=false)=>(ordered?[['lineup','Bag discs']]:groups).map(([key,label])=>{
  const rows=ordered?collection:collection.filter(i=>bagClass(mold(i.mold_id))===key).sort(bagComparator(settings.sort_mode,mold));if(!rows.length)return '';
  return `<section class="my-bag-group ${ordered?'bag-ordered-list':''}" style="--bag-class:var(--${key==='unknown'?'muted':key})" aria-label="${label}">${ordered?'':`<div class="bag-group-heading"><h2>${label}</h2><span>${rows.length}</span></div>`}${rows.map(i=>{
   const d=mold(i.mold_id), rated=d?.speed!=null, index=rated?Math.max(0,Math.min(100,50+10*(d.turn+d.fade))):null;
   const manual=ordered && settings.sort_mode==='custom',position=rows.indexOf(i);
   return `<article class="my-bag-disc" data-disc-id="${i.id}"><span class="bag-disc-swatch" style="--disc-color:${esc(i.color||'#e6c668')}" aria-label="Disc color ${esc(i.color||'#e6c668')}"></span><div class="my-bag-disc-copy"><button class="my-bag-disc-name" data-bag-inspect="${esc(i.id)}" ${d?'':'disabled'}>${esc(name(d))}</button><span class="my-bag-brand">${esc(d?.brand || 'Saved disc')}</span><div class="my-bag-disc-details"><span>${esc(i.plastic)}</span><span>${i.weight_g} g</span><span class="wear-badge" data-beat="${i.wear<=2}">${i.wear}/10 · ${wearLabel(i.wear)}</span>${demo?`<span class="bag-pocket-text">${i.in_bag===false?'Storage':pocketLabel(i.pocket)}</span>`:`<label class="bag-pocket-inline"><span class="bag-sr">Pocket for ${esc(name(d))}</span><span class="dd-select dd-select-sm"><select data-bag-pocket="${i.id}" ${ordering||pendingPockets.has(i.id)?'disabled':''}>${POCKETS.map(([value,label])=>`<option value="${value}"${(pendingPockets.get(i.id) ?? i.pocket)===value?' selected':''}>${label}</option>`).join('')}</select>${window.DropdownIndicator.indicator('sm')}</span></label>`}${i.stability_bias?`<span class="bag-bias-label">${stabilityBiasLabel(i.stability_bias)}</span>`:''}</div>${i.notes?`<p class="my-bag-notes">${esc(i.notes)}</p>`:''}</div><div class="bag-consensus"><strong>${rated?[d.speed,d.glide,d.turn,d.fade].join(' / '):'Unrated'}</strong><small>${rated?'Consensus · stability '+index+'/100':'Consensus unavailable'}</small></div>${demo?'':`<div class="my-bag-disc-actions"><button type="button" data-bag-move="${i.id}" aria-label="${i.in_bag===false?'Bag':'Store'} ${esc(name(d))}">${i.in_bag===false?'Move to bag':'Store'}</button><button type="button" data-bag-edit="${i.id}" aria-label="Edit ${esc(name(d))}">Edit</button>${i.in_bag!==false?`<button type="button" data-bag-lost="${i.id}" aria-label="Mark ${esc(name(d))} lost">Lost</button>`:''}<button type="button" data-bag-remove="${i.id}" aria-label="Remove ${esc(name(d))}">Remove</button></div>`}${manual?`<div class="bag-reorder-controls"><button type="button" data-bag-drag="${i.id}" aria-label="Drag ${esc(name(d))} to reorder" aria-describedby="bagSortHint" ${ordering?'disabled':''}>⠿</button><button type="button" data-bag-earlier="${i.id}" aria-label="Move ${esc(name(d))} earlier" ${ordering||position===0?'disabled':''}>↑</button><button type="button" data-bag-later="${i.id}" aria-label="Move ${esc(name(d))} later" ${ordering||position===rows.length-1?'disabled':''}>↓</button></div>`:''}</article>`;
  }).join('')}</section>`;
 }).join('');
 $('#myBagContents').innerHTML=`<section id="bagLineup" aria-labelledby="bagLineupTitle" ${listView==='bag'?'':'hidden'}><div class="bag-section-heading"><h2 id="bagLineupTitle">Bag</h2><span>${count} ${count===1?'disc':'discs'} for the round</span></div>${count?grouped(bagged,true):'<div id="myBagEmpty" class="my-bag-empty"><h3>Your bag is empty.</h3><p>Add a disc from the Directory, or bring one over from Storage.</p><button id="emptyBagDirectory" class="pill-button primary" type="button">Explore the Directory ↗</button></div>'}</section><section id="bagStorage" aria-labelledby="bagStorageTitle" ${listView==='storage'?'':'hidden'}><div class="bag-section-heading"><h2 id="bagStorageTitle">Storage</h2><span>${stored.length} ${stored.length===1?'disc':'discs'} off the course</span></div><p class="bag-storage-note">The backups, the experiments, the ones waiting for their next round.</p>${stored.length?grouped(stored):'<div id="bagStorageEmpty" class="bag-storage-empty"><p>No discs in Storage yet. Tap Store on a disc to give it a rest.</p></div>'}</section>${demo?'':memorialWall()}`;
}
function memorialWall(){
 const lost=lostItems();
 const date=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'});
 return `<section id="bagMemorial" aria-labelledby="bagMemorialTitle" ${listView==='lost'?'':'hidden'}><div class="bag-section-heading"><h2 id="bagMemorialTitle" tabindex="-1">Gone But Not Forgotten</h2>${lost.length?`<span>${lost.length} ${lost.length===1?'disc':'discs'} remembered</span>`:''}</div>${lost.length?`<p class="bag-memorial-note">Good flights. Better stories. Until we meet again.</p><div class="bag-memorial-wall">${lost.map(i=>{
  const d=mold(i.mold_id);
  return `<article class="bag-memorial-card" data-memorial-id="${esc(i.id)}"><div class="bag-memorial-heading"><span class="bag-disc-swatch" style="--disc-color:${esc(i.color||'#e6c668')}" aria-hidden="true"></span><div><h3>${esc(name(d))}</h3><p>${esc(i.plastic)}${d?.brand?` · ${esc(d.brand)}`:''}</p></div></div><p class="bag-memorial-place"><time datetime="${esc(i.lostDate)}">${date.format(new Date(i.lostDate+'T12:00:00'))}</time>${i.lostCourse?`<span data-lost-course>${esc(i.lostCourse)}</span>`:''}${i.lostHole!=null?`<span data-lost-hole>Hole ${i.lostHole}</span>`:''}</p>${i.lostStory?`<p class="bag-memorial-story">${esc(i.lostStory)}</p>`:''}<div class="bag-memorial-actions"><button type="button" data-bag-found="${esc(i.id)}" aria-label="Found ${esc(name(d))}!" ${pendingFound.has(i.id)?'disabled':''}>${pendingFound.has(i.id)?'Restoring…':'Found it!'}</button><button type="button" data-bag-remove="${esc(i.id)}" aria-label="Remove memorial for ${esc(name(d))}" ${pendingFound.has(i.id)?'disabled':''}>Remove</button></div></article>`;
 }).join('')}</div>`:'<div id="bagMemorialEmpty" class="bag-memorial-empty"><svg viewBox="0 0 80 48" aria-hidden="true"><path d="M4 34c16 0 14-22 30-22s15 22 30 22"/><ellipse cx="64" cy="34" rx="11" ry="4"/><path d="m61 6 2 4 4 1-4 2-2 4-1-4-4-2 4-1"/></svg><p>No discs to remember here.</p><span>May your throws stay findable.</span></div>'}</section>`;
}
function activateBag() {
 active=true;undockDetail();setView('bag');$('main').hidden=true;$('#myBagView').hidden=false;$('#bagTab').classList.add('active');
 for(const id of ['mapTab','listTab','bagTab'])$('#'+id).setAttribute('aria-current',id==='bagTab'?'page':'false');
 history.replaceState(null,'','/?bag=1');render();window.scrollTo(0,0);
}
function leaveBag(view) {
 active=false;syncMyMap();scene.release();storageScene.sync(false,[]);lostScene.sync(false,[]);undockDetail();$('#myBagView').hidden=true;$('main').hidden=false;$('#bagTab').classList.remove('active');
 for(const id of ['mapTab','listTab','bagTab'])$('#'+id).setAttribute('aria-current',id===(view==='map'?'mapTab':'listTab')?'page':'false');
 history.replaceState(null,'','/');setView(view);
}
const bagged=()=>items.filter(i=>i.in_bag!==false && mold(i.mold_id)).sort(bagComparator(settings.sort_mode,mold));
// My Map: the atlas's own map, docked here, showing only bagged discs at their personal positions
// (consensus shifted by the player's stability notes). Positions are recomputed when the bag changes.
function syncMyMap(){
 if(!mapOpen || !active || !account?.user || loading || loadError || !discs.length){myMapKey='';hideMyMap();return;}
 const copies=bagged(),molds=[...new Set(copies.map(i=>i.mold_id))].map(mold),rated=molds.filter(d=>d.speed!=null),unrated=molds.length-rated.length;
 const shifts=moldShifts(copies),moved=rated.filter(d=>shifts.get(d.id)).length;
 $('#myMapEmpty').hidden=rated.length>0;$('#myMapHost').hidden=!rated.length;$('.my-map-axis').hidden=!rated.length;
 $('#myMapEmptyTitle').textContent=molds.length?'Nothing to plot yet.':'Your map is empty.';
 $('#myMapEmptyText').textContent=molds.length?'None of the discs in your bag have flight ratings yet, so none of them has a place on the map.':'Add discs to your bag and they appear here, placed where they fly for you.';
 $('#myMapSummary').textContent=!rated.length?'':`${rated.length} ${rated.length===1?'disc':'discs'} · `+(moved?`${moved} moved by your stability notes. A dashed ring marks the consensus spot.`:'all at consensus positions. Mark a copy More stable or Less stable in Edit to move it here.');
 $('#myMapNote').textContent=unrated && rated.length?`${unrated} ${unrated===1?'disc in your bag has':'discs in your bag have'} no flight ratings yet, so ${unrated===1?'it isn’t':'they aren’t'} plotted.`:'';
 if(!rated.length){myMapKey='';hideMyMap();return;}
 if(detailPanel.parentNode!==$('#myBagView'))$('#myBagView').append(detailPanel);
 const key=JSON.stringify([rated.map(d=>d.id),[...shifts]]);
 if(key===myMapKey && myMap && !$('#mapWrap').hidden)return;myMapKey=key;
 showMyMap({ids:new Set(rated.map(d=>d.id)),positions:personalPositions(window.AtlasLayout,rated,shifts),shifts},$('#myMapHost'));
}
function setBagView(next){
 if(bagView===next)return;bagView=next;mapOpen=next==='map';
 // The list follows the view: Storage shows the Storage list, Lost the memorials. My Map has no list.
 if(next!=='map')listView=next;
 if(detailPanel.parentNode===$('#myBagView') && !detailPanel.hidden)closeDetail(false);undockDetail();scene.release();render();
}
$('#myBagViews').addEventListener('click',event=>{const button=event.target.closest('[data-bag-view]');if(button)setBagView(button.dataset.bagView);});
$('#myBagViews').addEventListener('keydown',event=>{
 const keys={ArrowLeft:-1,ArrowUp:-1,ArrowRight:1,ArrowDown:1};if(!keys[event.key])return;event.preventDefault();
 const buttons=[...$('#myBagViews').querySelectorAll('[data-bag-view]')],next=buttons[(buttons.indexOf(document.activeElement)+keys[event.key]+buttons.length)%buttons.length];
 setBagView(next.dataset.bagView);next.focus();
});
function setListView(next){if(listView===next)return;listView=next;render();}
$('#bagListPicker').addEventListener('click',event=>{const button=event.target.closest('[data-bag-list]');if(button)setListView(button.dataset.bagList);});
$('#bagListPicker').addEventListener('keydown',event=>{
 const keys={ArrowLeft:-1,ArrowUp:-1,ArrowRight:1,ArrowDown:1};if(!keys[event.key])return;event.preventDefault();
 const buttons=[...$('#bagListPicker').querySelectorAll('[data-bag-list]')].filter(b=>!b.hidden),next=buttons[(buttons.indexOf(document.activeElement)+keys[event.key]+buttons.length)%buttons.length];
 setListView(next.dataset.bagList);next.focus();
});
$('#myMapDirectory').addEventListener('click',()=>directory());
function directory() {leaveBag('list');$('#search').focus({preventScroll:true});window.scrollTo(0,0);}
function show(dialog) {opener=document.activeElement;dialog.showModal();}
for(const id of ['addDiscDialog','bagModelDialog','removeDiscDialog','lostDiscDialog']) {
 const dialog=$('#'+id);dialog.addEventListener('close',()=>{const target=opener,focus=document.activeElement;if(target?.isConnected && (focus===document.body || focus===dialog || dialog.contains(focus)))target.focus({preventScroll:true});});
 dialog.querySelectorAll('[data-bag-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const controls=[...dialog.querySelectorAll('button:not([disabled]),input:not([type="hidden"]):not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')].filter(node=>node.getClientRects().length);
  const first=controls[0],last=controls.at(-1);
  if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}
  else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}
 });
}
function updateWear() {const wear=Number($('#bagWear').value), label=wearLabel(wear);$('#bagWearValue').textContent=`${wear}/10 · ${label}`;$('#bagWear').setAttribute('aria-valuetext',`${wear} out of 10, ${label}`);$('#bagWearWarning').hidden=wear>2;}
function updatePlastic() {const other=$('#bagPlastic').value==='__other';$('#bagPlasticOther').hidden=!other;$('#bagPlasticOther').required=other;}
async function openDisc(d,item=null,destination='bag') {
 if(!d)return;
 // Signed out there is nothing to save into: show the bag page (the demo) and point at sign-in.
 if(!account?.user){activateBag();if(isDemo()){status('Sign in to build and save your own bag.');$('#myBagSignIn').focus({preventScroll:true});}return;}
 const epoch=generation,trigger=document.activeElement;
 try {await catalogs;if(epoch!==generation)return;} catch(error) {activateBag();status(error.message);return;}
 editing=item;const values=item || defaultDiscDetails(d,plastics), choices=plasticOptions(d,plastics);
 $('#addDiscId').value=d.id;$('#addDiscBrand').textContent=d.brand;$('#addDiscHeading').textContent=(item?'Edit ':'Add ')+name(d);
 $('#bagPlastic').innerHTML=(values.plastic?'':'<option value="">Choose plastic…</option>')+choices.options.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('')+'<option value="__other">Other…</option>';
 $('#bagPlastic').value=choices.options.includes(values.plastic)?values.plastic:values.plastic?'__other':'';
 $('#bagPlasticOther').value=values.plastic || '';updatePlastic();
 $('#plasticHint').textContent='Plastic families vary by mold and run.';
 $('#bagWear').value=values.wear;updateWear();$('#bagWeight').value=values.weight_g;$('#bagNotes').value=values.notes || '';
 $('#bagDestination').value=item?(item.in_bag?'bag':'storage'):destination;$('#bagPocket').value=values.pocket;
 updatePocketField();
 setStabilityBias(values.stability_bias);
 $('#bagDiscColor').value=values.color || plasticColor(d.brand,values.plastic,plastics);colorCustomized=!!item;
 const overmold=isOvermold({...d,record:d.name});
 $('#bagDiscColorLabel').textContent=overmold?'Flight plate':'Disc color';
 $('#bagRimColorField').hidden=!overmold;
 rimCustomized=!!values.rim_color;
 $('#bagRimColor').value=overmoldColors($('#bagDiscColor').value,{rim:values.rim_color}).rim;
 $('#addDiscStatus').textContent='';updateSaveLabel();$('#saveDisc').disabled=false;
 opener=trigger;$('#addDiscDialog').showModal();$('#saveDisc').focus();
}
$('#addDiscForm').addEventListener('submit',async event=>{
 event.preventDefault();const epoch=generation,edited=editing,button=$('#saveDisc');button.disabled=true;$('#addDiscStatus').textContent='Saving…';
 try {
  const value=validateDiscDetails({mold_id:$('#addDiscId').value,plastic:$('#bagPlastic').value==='__other'?$('#bagPlasticOther').value:$('#bagPlastic').value,wear:Number($('#bagWear').value),weight_g:Number($('#bagWeight').value),notes:$('#bagNotes').value,color:$('#bagDiscColor').value,rim_color:rimCustomized && !$('#bagRimColorField').hidden?$('#bagRimColor').value:null,in_bag:$('#bagDestination').value==='bag',pocket:$('#bagPocket').value,stability_bias:$('#bagStabilityBias').value || null},mold($('#addDiscId').value),plastics);
  const result=await api('/discs'+(edited?'/'+edited.id:''),edited?'PUT':'POST',value);
  items=edited?items.map(i=>i.id===edited.id?result.disc:i):[...items,result.disc];if(loading)void loadBag();render();$('#addDiscDialog').close();
  // An edited row is re-rendered, so explicitly restore keyboard focus to its new button.
  if(active && edited)$(`[data-bag-edit="${edited.id}"]`)?.focus({preventScroll:true});
  status(edited?'Disc updated.':result.disc.in_bag?'Disc added to your bag.':'Disc added to Storage.');
 } catch(error) {if(error.name!=='AbortError')$('#addDiscStatus').textContent=error.message;}
 finally {if(epoch===generation)button.disabled=false;}
});
function updateRimColor(){if(!rimCustomized)$('#bagRimColor').value=overmoldColors($('#bagDiscColor').value).rim;}
$('#bagWear').addEventListener('input',updateWear);$('#bagDiscColor').addEventListener('input',()=>{colorCustomized=true;updateRimColor();});
$('#bagRimColor').addEventListener('input',()=>{rimCustomized=true;});
$('#bagPlastic').addEventListener('change',()=>{updatePlastic();if(!colorCustomized)$('#bagDiscColor').value=plasticColor(mold($('#addDiscId').value).brand,$('#bagPlastic').value,plastics);updateRimColor();if(!$('#bagPlasticOther').hidden)$('#bagPlasticOther').focus();});
function setStabilityBias(value){
 $('#bagStabilityBias').value=value || '';
 document.querySelectorAll('[data-stability-bias]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.stabilityBias===value)));
}
document.querySelectorAll('[data-stability-bias]').forEach(button=>button.addEventListener('click',()=>setStabilityBias($('#bagStabilityBias').value===button.dataset.stabilityBias?null:button.dataset.stabilityBias)));
function updateSaveLabel(){$('#saveDisc').textContent=editing?'Save changes':$('#bagDestination').value==='storage'?'Save to Storage':'Save to bag';}
function updatePocketField(){
 const isStorage=$('#bagDestination').value==='storage';
 const pocketWrapper=document.querySelector('.bag-pocket-field');
 if(pocketWrapper)pocketWrapper.hidden=isStorage;
 if(isStorage){
  const d=mold($('#addDiscId').value);
  if(d)$('#bagPocket').value=defaultPocket(d);
 }
}
$('#bagDestination').addEventListener('change',()=>{updateSaveLabel();updatePocketField();});
$('#bagSort').addEventListener('change',async()=>{
 if(ordering)return;const epoch=generation;ordering=true;$('#bagSort').disabled=true;
 try{const data=await api('','PATCH',{sort_mode:$('#bagSort').value});settings=data.bag;readSequence++;loading=false;status('Disc order updated.');}
 catch(error){if(error.name!=='AbortError')status(error.message);}
 finally{if(epoch===generation){ordering=false;render();}}
});
async function reorderDisc(id,targetId,focusSelector){
 if(ordering || settings.sort_mode!=='custom' || id===targetId)return;
 const ids=items.filter(i=>i.in_bag).sort(bagComparator('custom',mold)).map(i=>i.id),from=ids.indexOf(id),to=ids.indexOf(targetId);
 if(from<0 || to<0)return;ids.splice(from,1);ids.splice(to,0,id);
 const epoch=generation;ordering=true;$('#bagSort').disabled=true;
 try{const data=await api('/order','PUT',{ids});items=data.discs;readSequence++;loading=false;status(`${name(mold(items.find(i=>i.id===id).mold_id))} moved to position ${to+1}.`);}
 catch(error){if(error.name!=='AbortError'){status(error.message);if(error.message.includes('Refresh'))void loadBag();}}
 finally{if(epoch===generation){ordering=false;render();if(focusSelector){const next=$(focusSelector);(next && !next.disabled?next:$(`[data-bag-drag="${id}"]`))?.focus({preventScroll:true});}}}
}
$('#myBagContents').addEventListener('pointerdown',event=>{
 const handle=event.target.closest('[data-bag-drag]');if(!handle || ordering || event.button!==0)return;
 dragging={id:handle.dataset.bagDrag,handle,pointerId:event.pointerId,x:event.clientX,y:event.clientY,moved:false,target:null};handle.setPointerCapture(event.pointerId);
});
$('#myBagContents').addEventListener('pointermove',event=>{
 if(!dragging || event.pointerId!==dragging.pointerId)return;
 if(!dragging.moved && Math.hypot(event.clientX-dragging.x,event.clientY-dragging.y)<6)return;
 dragging.moved=true;event.preventDefault();
 const row=document.elementFromPoint(event.clientX,event.clientY)?.closest('#bagLineup [data-disc-id]');
 dragging.target=row?.dataset.discId || null;
 document.querySelectorAll('[data-disc-id]').forEach(n=>{n.classList.toggle('is-drop-target',n===row);n.classList.toggle('is-reordering',n.dataset.discId===dragging.id);});
 if(event.clientY>innerHeight-70)window.scrollBy(0,18);else if(event.clientY<70)window.scrollBy(0,-18);
});
const endDrag=event=>{
 if(!dragging || event.pointerId!==dragging.pointerId)return;const drag=dragging;dragging=null;
 if(drag.handle.hasPointerCapture(event.pointerId))drag.handle.releasePointerCapture(event.pointerId);
 document.querySelectorAll('.is-drop-target,.is-reordering').forEach(n=>n.classList.remove('is-drop-target','is-reordering'));
 if(event.type==='pointerup' && drag.moved && drag.target)void reorderDisc(drag.id,drag.target,`[data-bag-drag="${drag.id}"]`);
};
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('#myBagContents').addEventListener(event,endDrag);
function pocketTotal(){const choice=models.models.find(m=>m.name===$('#bagModel').value),extra=choice?.presetSplit?choice.extra_capacity||0:0;const total=Number($('#bagMainCapacity').value)+Number($('#bagPutterCapacity').value)+extra;$('#bagCapacity').value=total;$('#bagCapacityLabel').textContent=total+' discs'+(extra?' · includes '+extra+' extra slots':'');}
function modelFields() {
 const choice=models.models.find(m=>m.name===$('#bagModel').value),custom=$('#bagModel').value==='__custom';
 $('#customBagField').hidden=!custom;$('#customBagName').required=custom;
 const fixed=!!choice?.presetSplit;
 $('#bagMainCapacity').readOnly=fixed;$('#bagPutterCapacity').readOnly=fixed;
 if(fixed){$('#bagMainCapacity').value=choice.main_capacity;$('#bagPutterCapacity').value=choice.putter_capacity;}
 else if(choice?.capacity && choice.name!==settings.bag_model){$('#bagMainCapacity').value=choice.capacity;$('#bagPutterCapacity').value=0;}
 $('#bagCapacityHint').textContent=fixed?choice.note:choice?.capacity?`Advertised total: ${choice.capacity} discs. Enter the main and putter slots for your bag.`:'Enter the main and putter slots for your bag.';pocketTotal();
}
$('#editBagModel').addEventListener('click',async()=>{
 const epoch=generation;
 try{await catalogs;if(epoch!==generation || !account?.user)return;
  $('#bagModel').innerHTML=models.models.map(m=>`<option value="${esc(m.name)}">${esc(m.name)}</option>`).join('')+'<option value="__custom">Custom bag…</option>';
  $('#bagModel').value=models.models.some(m=>m.name===settings.bag_model)?settings.bag_model:'__custom';$('#customBagName').value=settings.bag_model;
  $('#bagMainCapacity').value=settings.main_capacity ?? settings.capacity;$('#bagPutterCapacity').value=settings.putter_capacity ?? 0;$('#bagFabricColor').value=settings.bag_color || '#343c49';$('#bagModelStatus').textContent='';$('#saveBagModel').disabled=false;modelFields();show($('#bagModelDialog'));
 }catch(error){status(error.message);}
});
$('#bagModel').addEventListener('change',modelFields);
$('#bagMainCapacity').addEventListener('input',pocketTotal);$('#bagPutterCapacity').addEventListener('input',pocketTotal);
$('#bagModelForm').addEventListener('submit',async event=>{
 event.preventDefault();const epoch=generation,button=$('#saveBagModel');button.disabled=true;$('#bagModelStatus').textContent='Saving…';
 try{const value=validateBagSettings({bag_model:$('#bagModel').value==='__custom'?$('#customBagName').value:$('#bagModel').value,capacity:Number($('#bagCapacity').value),main_capacity:Number($('#bagMainCapacity').value),putter_capacity:Number($('#bagPutterCapacity').value),bag_color:$('#bagFabricColor').value,sort_mode:settings.sort_mode || 'speed'},models);const data=await api('','PUT',value);settings=data.bag;render();$('#bagModelDialog').close();status('Bag updated.');}
 catch(error){if(error.name!=='AbortError')$('#bagModelStatus').textContent=error.message;}
 finally{if(epoch===generation)button.disabled=false;}
});
$('#myBagContents').addEventListener('click',event=>{
 if(ordering)return;
 const earlier=event.target.closest('[data-bag-earlier]'),later=event.target.closest('[data-bag-later]');
 if(earlier || later){const id=(earlier || later).dataset[earlier?'bagEarlier':'bagLater'],ordered=items.filter(i=>i.in_bag).sort(bagComparator('custom',mold)),index=ordered.findIndex(i=>i.id===id),target=ordered[index+(earlier?-1:1)];if(target)void reorderDisc(id,target.id,`[data-bag-${earlier?'earlier':'later'}="${id}"]`);return;}
 const edit=event.target.closest('[data-bag-edit]'),remove=event.target.closest('[data-bag-remove]'),inspect=event.target.closest('[data-bag-inspect]'),move=event.target.closest('[data-bag-move]');
 const lost=event.target.closest('[data-bag-lost]'),found=event.target.closest('[data-bag-found]');
 if(lost)openLostDisc(lost);
 if(found)void foundDisc(found.dataset.bagFound,found);
 if(move)void moveDisc(move.dataset.bagMove,move);
 if(edit){const item=items.find(i=>i.id===edit.dataset.bagEdit);void openDisc(mold(item.mold_id),item);}
 if(remove && !remove.disabled)openRemove(items.find(i=>i.id===remove.dataset.bagRemove),'list');
 // A Storage disc's name also pulls it out of its rack when the racks are showing.
 if(inspect){const item=items.find(i=>i.id===inspect.dataset.bagInspect);if(item){if(bagView==='storage' && item.in_bag===false)storageScene.reveal(item.id);openBagDetail(mold(item.mold_id),item);}}
 if(event.target.closest('#emptyBagDirectory'))directory();
});
function openRemove(item,origin){
 if(!item)return;removing=item;removeOrigin=origin;const memorial=removing.status==='lost';$('#removeDiscName').textContent=name(mold(removing.mold_id));$('#removeDiscHeading').textContent=memorial?'Remove this memorial?':'Remove this disc?';$('#removeDiscConsequence').textContent=memorial?'and its memorial will be permanently removed from your collection.':'will be removed from your collection.';$('#cancelRemoveDisc').textContent=memorial?'Keep memorial':'Keep disc';$('#confirmRemoveDisc').textContent=memorial?'Remove memorial':'Remove disc';$('#removeDiscStatus').textContent='';$('#confirmRemoveDisc').disabled=false;show($('#removeDiscDialog'));$('#cancelRemoveDisc').focus();
}
$('#myBagContents').addEventListener('change',event=>{const select=event.target.closest('[data-bag-pocket]');if(select)void setPocket(select);});
// Inline pocket changes persist immediately; the stored column is the only source after insert.
async function setPocket(select){
 const item=items.find(i=>i.id===select.dataset.bagPocket),pocket=select.value;if(!item || ordering || pendingPockets.has(item.id) || item.pocket===pocket)return;
 const epoch=generation,focused=document.activeElement===select;pendingPockets.set(item.id,pocket);select.disabled=true;
 try{const data=await api('/discs/'+item.id,'PATCH',{pocket});items=items.map(i=>i.id===item.id?data.disc:i);status(`${name(mold(item.mold_id))} moved to ${pocketLabel(data.disc.pocket)}.`);}
 catch(error){if(error.name!=='AbortError')status(error.message);}
 finally{if(epoch===generation){pendingPockets.delete(item.id);if(loading)void loadBag();render();if(focused)$(`[data-bag-pocket="${item.id}"]`)?.focus({preventScroll:true});}}
}
// Bag <-> Storage. The disc leaves the list (or rack card) it was in, so focus stays nearby: the next
// row's same button, or the list picker; from a rack card, the racks.
async function moveDisc(id,button){
 const item=items.find(i=>i.id===id);if(!item || button?.disabled)return;if(button)button.disabled=true;
 const fromCard=!!button?.closest('#storageScene'),next=neighborOf(item.id);
 try{const data=await api('/discs/'+item.id,'PATCH',{in_bag:!item.in_bag});items=items.map(i=>i.id===item.id?data.disc:i);if(loading)void loadBag();render();
  if(fromCard)focusFirst('#storageScene [data-collection-canvas]');else focusFirst(next && `[data-bag-move="${CSS.escape(next)}"]`,'#bagListPicker [aria-checked="true"]');
  status(data.disc.in_bag?`${name(mold(item.mold_id))} moved to your bag.`:`${name(mold(item.mold_id))} moved to Storage.`);}
 catch(error){if(error.name!=='AbortError'){status(error.message);if(button)button.disabled=false;}}
}
function openLostDisc(button){
 const item=items.find(i=>i.id===button.dataset.bagLost);if(!item || item.status==='lost')return;
 if(pendingPockets.has(item.id)){status('Your pocket change is still saving. Please try again in a moment.');return;}
 losing=item;$('#lostDiscName').textContent=name(mold(item.mold_id));$('#lostDiscForm').reset();
 const today=new Date();$('#lostDate').value=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
 $('#lostDiscStatus').textContent='';$('#confirmLostDisc').disabled=false;show($('#lostDiscDialog'));$('#lostDate').focus();
}
$('#lostDiscForm').addEventListener('submit',async event=>{
 event.preventDefault();if(!losing || $('#confirmLostDisc').disabled)return;
 const epoch=generation,item=losing,button=$('#confirmLostDisc'),next=neighborOf(item.id);button.disabled=true;$('#lostDiscStatus').textContent='Saving its story…';
 try {
  const value=validateLostDetails({status:'lost',lostDate:$('#lostDate').value,lostCourse:$('#lostCourse').value,lostHole:$('#lostHole').value?Number($('#lostHole').value):null,lostStory:$('#lostStory').value});
  const data=await api('/discs/'+item.id,'PATCH',value);items=items.map(i=>i.id===item.id?data.disc:i);if(loading)void loadBag();render();$('#lostDiscDialog').close();
  focusFirst(next && `[data-bag-lost="${CSS.escape(next)}"]`,'#bagListPicker [aria-checked="true"]');status(`${name(mold(item.mold_id))} moved to Gone But Not Forgotten. Its headstone is in Lost.`);
 }catch(error){if(error.name!=='AbortError')$('#lostDiscStatus').textContent=error.message;}
 finally{if(epoch===generation)button.disabled=false;}
});
// Found it!, from a memorial card in the Lost list or a headstone's card in the graveyard.
async function foundDisc(id,button){
 const item=items.find(i=>i.id===id);if(!item || pendingFound.has(item.id))return;
 const epoch=generation,fromGrave=!!button?.closest('#lostScene'),next=neighborOf(item.id);pendingFound.add(item.id);
 for(const node of document.querySelectorAll(`[data-bag-found="${CSS.escape(item.id)}"],[data-grave-found="${CSS.escape(item.id)}"]`)){node.disabled=true;node.textContent='Restoring…';}
 const remove=$(`[data-memorial-id="${CSS.escape(item.id)}"] [data-bag-remove]`);if(remove)remove.disabled=true;
 try{
  const data=await api('/discs/'+item.id,'PATCH',{status:'active'});items=items.map(i=>i.id===item.id?data.disc:i);if(loading)void loadBag();render();
  if(fromGrave)focusFirst('#lostScene [data-grave-found]','#lostScene [data-collection-canvas]','#myBagViews [aria-checked="true"]');
  else focusFirst(next && `[data-bag-found="${CSS.escape(next)}"]`,'#bagListPicker [aria-checked="true"]');
  status(`${name(mold(item.mold_id))} is back in your bag. Welcome home.`);
 }catch(error){if(error.name!=='AbortError')status(error.message);}
 finally{if(epoch===generation){pendingFound.delete(item.id);if(items.some(i=>i.id===item.id && i.status==='lost')){render();focusFirst(fromGrave?'#lostScene [data-grave-found]':`[data-bag-found="${CSS.escape(item.id)}"]`);}}}
}
$('#confirmRemoveDisc').addEventListener('click',async()=>{
 if(!removing)return;const epoch=generation,removed=removing,button=$('#confirmRemoveDisc');button.disabled=true;
 const next=neighborOf(removed.id),origin=removeOrigin;
 try {await api('/discs/'+removed.id,'DELETE');items=items.filter(i=>i.id!==removed.id);if(loading)void loadBag();render();$('#removeDiscDialog').close();status(removed.status==='lost'?'Memorial removed.':'Disc removed.');
  if(origin==='card')focusFirst('#storageScene [data-collection-canvas]');
  else focusFirst(next && `[data-bag-remove="${CSS.escape(next)}"]`,removed.status==='lost'?'#bagMemorialTitle':'#emptyBagDirectory','#bagListPicker [aria-checked="true"]');}
 catch(error){if(error.name!=='AbortError')$('#removeDiscStatus').textContent=error.message;}
 finally{if(epoch===generation)button.disabled=false;}
});
$('#bagTab').onclick=activateBag;$('#mapTab').onclick=()=>leaveBag('map');$('#listTab').onclick=()=>leaveBag('list');
$('#addBagDisc').onclick=directory;$('#retryMyBag').onclick=loadBag;
const addMenu=$('#addDestinationMenu'),dropdown=window.AtlasDropdown;
// The Add menu is one of the site's dropdowns: app.js opens it, closes it on an outside press, Escape,
// another dropdown, a scroll that takes its button off screen and every view change.
const addMenuOpen=()=>dropdown.current()?.panel===addMenu;
function closeAddMenu(restore=false){if(addMenuOpen())dropdown.close(restore);}
function positionAddMenu(panel,trigger){
 const rect=trigger.getBoundingClientRect();
 if(rect.bottom<0 || rect.top>innerHeight){dropdown.close(false);return;}
 // A full-width trigger (Add to in the details) gets a menu as wide as itself, under its left edge;
 // a small one (a directory row's Add) gets a menu sized to its choices, under its right edge.
 // The visible viewport excludes a classic scrollbar (innerWidth includes it), and the menu stays 8 px inside it.
 const viewW=document.documentElement.clientWidth,viewH=document.documentElement.clientHeight,wide=rect.width>=220;
 addMenu.style.maxWidth=viewW-16+'px';addMenu.style.width=wide?Math.min(viewW-16,rect.width)+'px':'';
 const width=addMenu.offsetWidth,height=addMenu.offsetHeight,below=rect.bottom+height+8<=viewH;
 addMenu.style.left=Math.max(8,Math.min(viewW-width-8,wide?rect.left:rect.right-width))+'px';
 addMenu.style.top=(below?rect.bottom+6:Math.max(8,rect.top-height-6))+'px';addMenu.dataset.placement=below?'below':'above';
}
document.addEventListener('click',event=>{
 const action=event.target.closest('[data-add-menu]');
 if(action){event.preventDefault();
  if(dropdown.current()?.button===action){dropdown.close(true);return;}
  addMenu.dataset.moldId=action.dataset.addMenu;dropdown.show(addMenu,action,positionAddMenu);addMenu.querySelector('button').focus({preventScroll:true});return;
 }
 const choice=event.target.closest('[data-add-destination]');
 if(choice){const disc=mold(addMenu.dataset.moldId),destination=choice.dataset.addDestination;closeAddMenu(true);void openDisc(disc,null,destination);}
});
addMenu.addEventListener('keydown',event=>{
 const keys=['ArrowDown','ArrowUp','Home','End'];
 if(keys.includes(event.key)){event.preventDefault();const options=[...addMenu.querySelectorAll('button')],index=options.indexOf(document.activeElement),next=event.key==='Home'?0:event.key==='End'?options.length-1:(index+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;options[next].focus();}
 if(event.key==='Tab')closeAddMenu(true);
});
window.addEventListener('atlas-account-change',event=>sync(event.detail));
window.BagApp={add:openDisc,catalogReady:render,isMapActive:()=>false,detailExtras:bagDetailMarkup,detailAppearance,mapColors:()=>bagColorMap,
 // For tests: the Storage and Lost scenes' 3D viewers (null until their tab first shows).
 scenes:{get storage(){return storageScene.viewer||null;},get lost(){return lostScene.viewer||null;}}};
showDemo();render();if(account?.user)void loadBag();if(new URLSearchParams(location.search).get('bag')==='1')activateBag();
