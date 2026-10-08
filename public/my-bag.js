import {plasticOptions,defaultDiscDetails,wearLabel,bagClass,validateDiscDetails,validateBagSettings,plasticColor,bagComparator,stabilityBiasLabel,pocketLabel,POCKETS} from './bag-values.js';
import {BagScene} from './bag-scene.js';
import {moldShifts,personalPositions} from './personal-lens.js';
import {DEMO_BAG,DEMO_DISCS} from './bag-demo.js';

const $ = s => document.querySelector(s), esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let account = window.AtlasAccount?.current || null, settings = {bag_model:'Custom bag',capacity:20}, items = [], active = false;
let plastics, models, editing = null, removing = null, generation = 0, loading = false, loadError = '', opener = null, readSequence = 0;
let colorCustomized=false,ordering=false,dragging=null,mapOpen=false,myMapKey='';
const pendingPockets=new Map();
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
  generation++;mapOpen=false;scene.reset();if(detailPanel.parentNode!==detailHome){closeDetail(false);undockDetail();}items=[];settings={bag_model:'Custom bag',capacity:20};loadError='';loading=false;editing=null;removing=null;ordering=false;dragging=null;pendingPockets.clear();
  if($('#addDestinationMenu').matches(':popover-open'))$('#addDestinationMenu').hidePopover();
  for(const id of ['addDiscDialog','bagModelDialog','removeDiscDialog']) if($('#'+id).open)$('#'+id).close();
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
 const bagged=items.filter(i=>i.in_bag!==false).sort(bagComparator(settings.sort_mode,mold)),stored=items.filter(i=>i.in_bag===false),count=bagged.length;
 $('#bagSort').value=settings.sort_mode || 'speed';$('#bagSort').disabled=loading || !!loadError || ordering;
 $('#bagSortHint').textContent=settings.sort_mode==='custom'?'Drag the grip, or use Move earlier / later.':settings.sort_mode==='stability'?'Most stable first · shared atlas index':'Fastest first · stability within each speed';
 $('#bagScene').hidden=!shown || loading || !!loadError || mapOpen;
 $('#myBagViews').hidden=!signedIn;$('.bag-sort-bar').hidden=mapOpen;$('.bag-sort-bar').toggleAttribute('data-demo',!!demo);
 for(const button of $('#myBagViews').querySelectorAll('[data-bag-view]')){const on=(button.dataset.bagView==='map')===mapOpen;button.setAttribute('aria-checked',String(on));button.tabIndex=on?0:-1;}
 $('#myBagContents').hidden||=mapOpen;$('#myMapPanel').hidden=!signedIn || loading || !!loadError || !mapOpen;syncMyMap();
 $('#bagSlotMeter').textContent=`${count} / ${settings.capacity}`;
 const breakdown=`${settings.main_capacity ?? settings.capacity} main + ${settings.putter_capacity ?? 0} putter${settings.extra_capacity?' + '+settings.extra_capacity+' extra':''}`;
 $('#bagSlotMeter').title=breakdown;$('#bagPocketBreakdown').textContent=breakdown;
 $('#bagModelName').textContent=settings.bag_model;
 $('#bagSlotProgress').max=settings.capacity;$('#bagSlotProgress').value=Math.min(count,settings.capacity);
 $('#bagCapacityNotice').hidden=count<settings.capacity;
 $('#bagCapacityNotice').textContent=count===settings.capacity?'Your bag is full. You can still add a disc.':'A little over capacity. Move a spare to Storage, or keep carrying it.';
 $('#editBagModel').disabled=loading || !!loadError || ordering;
 if(!shown || loading || loadError){$('#myBagContents').replaceChildren();return;}
 scene.update(items,settings);if(active && !mapOpen)void scene.reveal();refreshBagDetail();
 const groups=[['distance','Distance drivers'],['fairway','Fairway drivers'],['mid','Midranges'],['putter','Putters'],['unknown','Unclassified discs']];
 const grouped=(collection,ordered=false)=>(ordered?[['lineup','Bag discs']]:groups).map(([key,label])=>{
  const rows=ordered?collection:collection.filter(i=>bagClass(mold(i.mold_id))===key).sort(bagComparator(settings.sort_mode,mold));if(!rows.length)return '';
  return `<section class="my-bag-group ${ordered?'bag-ordered-list':''}" style="--bag-class:var(--${key==='unknown'?'muted':key})" aria-label="${label}">${ordered?'':`<div class="bag-group-heading"><h2>${label}</h2><span>${rows.length}</span></div>`}${rows.map(i=>{
   const d=mold(i.mold_id), rated=d?.speed!=null, index=rated?Math.max(0,Math.min(100,50+10*(d.turn+d.fade))):null;
   const manual=ordered && settings.sort_mode==='custom',position=rows.indexOf(i);
   return `<article class="my-bag-disc" data-disc-id="${i.id}"><span class="bag-disc-swatch" style="--disc-color:${esc(i.color||'#e6c668')}" aria-label="Disc color ${esc(i.color||'#e6c668')}"></span><div class="my-bag-disc-copy"><button class="my-bag-disc-name" data-bag-inspect="${esc(i.id)}" ${d?'':'disabled'}>${esc(name(d))}</button><span class="my-bag-brand">${esc(d?.brand || 'Saved disc')}</span><div class="my-bag-disc-details"><span>${esc(i.plastic)}</span><span>${i.weight_g} g</span><span class="wear-badge" data-beat="${i.wear<=2}">${i.wear}/10 · ${wearLabel(i.wear)}</span>${demo?`<span class="bag-pocket-text">${i.in_bag===false?'Storage':pocketLabel(i.pocket)}</span>`:`<label class="bag-pocket-inline"><span class="bag-sr">Pocket for ${esc(name(d))}</span><span class="dd-select dd-select-sm"><select data-bag-pocket="${i.id}" ${ordering||pendingPockets.has(i.id)?'disabled':''}>${POCKETS.map(([value,label])=>`<option value="${value}"${(pendingPockets.get(i.id) ?? i.pocket)===value?' selected':''}>${label}</option>`).join('')}</select>${window.DropdownIndicator.indicator('sm')}</span></label>`}${i.stability_bias?`<span class="bag-bias-label">${stabilityBiasLabel(i.stability_bias)}</span>`:''}</div>${i.notes?`<p class="my-bag-notes">${esc(i.notes)}</p>`:''}</div><div class="bag-consensus"><strong>${rated?[d.speed,d.glide,d.turn,d.fade].join(' / '):'Unrated'}</strong><small>${rated?'Consensus · stability '+index+'/100':'Consensus unavailable'}</small></div>${demo?'':`<div class="my-bag-disc-actions"><button type="button" data-bag-move="${i.id}" aria-label="${i.in_bag===false?'Bag':'Store'} ${esc(name(d))}">${i.in_bag===false?'Move to bag':'Store'}</button><button type="button" data-bag-edit="${i.id}" aria-label="Edit ${esc(name(d))}">Edit</button><button type="button" data-bag-remove="${i.id}" aria-label="Remove ${esc(name(d))}">Remove</button></div>`}${manual?`<div class="bag-reorder-controls"><button type="button" data-bag-drag="${i.id}" aria-label="Drag ${esc(name(d))} to reorder" aria-describedby="bagSortHint" ${ordering?'disabled':''}>⠿</button><button type="button" data-bag-earlier="${i.id}" aria-label="Move ${esc(name(d))} earlier" ${ordering||position===0?'disabled':''}>↑</button><button type="button" data-bag-later="${i.id}" aria-label="Move ${esc(name(d))} later" ${ordering||position===rows.length-1?'disabled':''}>↓</button></div>`:''}</article>`;
  }).join('')}</section>`;
 }).join('');
 $('#myBagContents').innerHTML=`<section id="bagLineup" aria-labelledby="bagLineupTitle"><div class="bag-section-heading"><h2 id="bagLineupTitle">Bag</h2><span>${count} ${count===1?'disc':'discs'} for the round</span></div>${count?grouped(bagged,true):'<div id="myBagEmpty" class="my-bag-empty"><h3>Your bag is empty.</h3><p>Add a disc from the Directory, or bring one over from Storage.</p><button id="emptyBagDirectory" class="pill-button primary" type="button">Explore the Directory ↗</button></div>'}</section><section id="bagStorage" aria-labelledby="bagStorageTitle"><div class="bag-section-heading"><h2 id="bagStorageTitle">Storage</h2><span>${stored.length} ${stored.length===1?'disc':'discs'} off the course</span></div><p class="bag-storage-note">The backups, the experiments, the ones waiting for their next round.</p>${stored.length?grouped(stored):'<div id="bagStorageEmpty" class="bag-storage-empty"><p>No discs in Storage yet. Tap Store on a disc to give it a rest.</p></div>'}</section>`;
}
function activateBag() {
 active=true;undockDetail();setView('bag');$('main').hidden=true;$('#myBagView').hidden=false;$('#bagTab').classList.add('active');
 for(const id of ['mapTab','listTab','bagTab'])$('#'+id).setAttribute('aria-current',id==='bagTab'?'page':'false');
 history.replaceState(null,'','/?bag=1');render();window.scrollTo(0,0);
}
function leaveBag(view) {
 active=false;syncMyMap();scene.release();undockDetail();$('#myBagView').hidden=true;$('main').hidden=false;$('#bagTab').classList.remove('active');
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
 if(mapOpen===(next==='map'))return;mapOpen=next==='map';
 if(detailPanel.parentNode===$('#myBagView') && !detailPanel.hidden)closeDetail(false);undockDetail();scene.release();render();
}
$('#myBagViews').addEventListener('click',event=>{const button=event.target.closest('[data-bag-view]');if(button)setBagView(button.dataset.bagView);});
$('#myBagViews').addEventListener('keydown',event=>{
 const keys={ArrowLeft:-1,ArrowUp:-1,ArrowRight:1,ArrowDown:1};if(!keys[event.key])return;event.preventDefault();
 const buttons=[...$('#myBagViews').querySelectorAll('[data-bag-view]')],next=buttons[(buttons.indexOf(document.activeElement)+keys[event.key]+buttons.length)%buttons.length];
 setBagView(next.dataset.bagView);next.focus();
});
$('#myMapDirectory').addEventListener('click',()=>directory());
function directory() {leaveBag('list');$('#search').focus({preventScroll:true});window.scrollTo(0,0);}
function show(dialog) {opener=document.activeElement;dialog.showModal();}
for(const id of ['addDiscDialog','bagModelDialog','removeDiscDialog']) {
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
 setStabilityBias(values.stability_bias);
 $('#bagDiscColor').value=values.color || plasticColor(d.brand,values.plastic,plastics);colorCustomized=!!item;
 $('#addDiscStatus').textContent='';updateSaveLabel();$('#saveDisc').disabled=false;
 opener=trigger;$('#addDiscDialog').showModal();$('#saveDisc').focus();
}
$('#addDiscForm').addEventListener('submit',async event=>{
 event.preventDefault();const epoch=generation,edited=editing,button=$('#saveDisc');button.disabled=true;$('#addDiscStatus').textContent='Saving…';
 try {
  const value=validateDiscDetails({mold_id:$('#addDiscId').value,plastic:$('#bagPlastic').value==='__other'?$('#bagPlasticOther').value:$('#bagPlastic').value,wear:Number($('#bagWear').value),weight_g:Number($('#bagWeight').value),notes:$('#bagNotes').value,color:$('#bagDiscColor').value,in_bag:$('#bagDestination').value==='bag',pocket:$('#bagPocket').value,stability_bias:$('#bagStabilityBias').value || null},mold($('#addDiscId').value),plastics);
  const result=await api('/discs'+(edited?'/'+edited.id:''),edited?'PUT':'POST',value);
  items=edited?items.map(i=>i.id===edited.id?result.disc:i):[...items,result.disc];if(loading)void loadBag();render();$('#addDiscDialog').close();
  // An edited row is re-rendered, so explicitly restore keyboard focus to its new button.
  if(active && edited)$(`[data-bag-edit="${edited.id}"]`)?.focus({preventScroll:true});
  status(edited?'Disc updated.':result.disc.in_bag?'Disc added to your bag.':'Disc added to Storage.');
 } catch(error) {if(error.name!=='AbortError')$('#addDiscStatus').textContent=error.message;}
 finally {if(epoch===generation)button.disabled=false;}
});
$('#bagWear').addEventListener('input',updateWear);$('#bagDiscColor').addEventListener('input',()=>{colorCustomized=true;});$('#bagPlastic').addEventListener('change',()=>{updatePlastic();if(!colorCustomized)$('#bagDiscColor').value=plasticColor(mold($('#addDiscId').value).brand,$('#bagPlastic').value,plastics);if(!$('#bagPlasticOther').hidden)$('#bagPlasticOther').focus();});
function setStabilityBias(value){
 $('#bagStabilityBias').value=value || '';
 document.querySelectorAll('[data-stability-bias]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.stabilityBias===value)));
}
document.querySelectorAll('[data-stability-bias]').forEach(button=>button.addEventListener('click',()=>setStabilityBias($('#bagStabilityBias').value===button.dataset.stabilityBias?null:button.dataset.stabilityBias)));
function updateSaveLabel(){$('#saveDisc').textContent=editing?'Save changes':$('#bagDestination').value==='storage'?'Save to Storage':'Save to bag';}
$('#bagDestination').addEventListener('change',updateSaveLabel);
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
 if(move)void moveDisc(move);
 if(edit){const item=items.find(i=>i.id===edit.dataset.bagEdit);void openDisc(mold(item.mold_id),item);}
 if(remove){removing=items.find(i=>i.id===remove.dataset.bagRemove);$('#removeDiscName').textContent=name(mold(removing.mold_id));$('#removeDiscStatus').textContent='';$('#confirmRemoveDisc').disabled=false;show($('#removeDiscDialog'));$('#cancelRemoveDisc').focus();}
 if(inspect){const item=items.find(i=>i.id===inspect.dataset.bagInspect);if(item)openBagDetail(mold(item.mold_id),item);}
 if(event.target.closest('#emptyBagDirectory'))directory();
});
$('#myBagContents').addEventListener('change',event=>{const select=event.target.closest('[data-bag-pocket]');if(select)void setPocket(select);});
// Inline pocket changes persist immediately; the stored column is the only source after insert.
async function setPocket(select){
 const item=items.find(i=>i.id===select.dataset.bagPocket),pocket=select.value;if(!item || ordering || pendingPockets.has(item.id) || item.pocket===pocket)return;
 const epoch=generation,focused=document.activeElement===select;pendingPockets.set(item.id,pocket);select.disabled=true;
 try{const data=await api('/discs/'+item.id,'PATCH',{pocket});items=items.map(i=>i.id===item.id?data.disc:i);status(`${name(mold(item.mold_id))} moved to ${pocketLabel(data.disc.pocket)}.`);}
 catch(error){if(error.name!=='AbortError')status(error.message);}
 finally{if(epoch===generation){pendingPockets.delete(item.id);if(loading)void loadBag();render();if(focused)$(`[data-bag-pocket="${item.id}"]`)?.focus({preventScroll:true});}}
}
async function moveDisc(button){
 const item=items.find(i=>i.id===button.dataset.bagMove);if(!item || button.disabled)return;button.disabled=true;
 try{const data=await api('/discs/'+item.id,'PATCH',{in_bag:!item.in_bag});items=items.map(i=>i.id===item.id?data.disc:i);if(loading)void loadBag();render();$(`[data-bag-move="${item.id}"]`)?.focus({preventScroll:true});status(data.disc.in_bag?'Disc moved to your bag.':'Disc moved to Storage.');}
 catch(error){if(error.name!=='AbortError'){status(error.message);button.disabled=false;}}
}
$('#confirmRemoveDisc').addEventListener('click',async()=>{
 if(!removing)return;const epoch=generation,removed=removing,button=$('#confirmRemoveDisc'),index=items.findIndex(i=>i.id===removed.id);button.disabled=true;
 try {await api('/discs/'+removed.id,'DELETE');items=items.filter(i=>i.id!==removed.id);render();$('#removeDiscDialog').close();status('Disc removed.');const next=items[Math.min(index,items.length-1)];(next?$(`[data-bag-remove="${next.id}"]`):$('#emptyBagDirectory'))?.focus({preventScroll:true});}
 catch(error){if(error.name!=='AbortError')$('#removeDiscStatus').textContent=error.message;}
 finally{if(epoch===generation)button.disabled=false;}
});
$('#bagTab').onclick=activateBag;$('#mapTab').onclick=()=>leaveBag('map');$('#listTab').onclick=()=>leaveBag('list');
$('#addBagDisc').onclick=directory;$('#retryMyBag').onclick=loadBag;
const addMenu=$('#addDestinationMenu');let addMenuTrigger=null;
function closeAddMenu(restore=false){addMenuTrigger?.setAttribute('aria-expanded','false');if(addMenu.matches(':popover-open'))addMenu.hidePopover();if(restore && addMenuTrigger?.isConnected)addMenuTrigger.focus({preventScroll:true});}
function positionAddMenu(){
 if(!addMenuTrigger?.isConnected){closeAddMenu();return;}
 const rect=addMenuTrigger.getBoundingClientRect();
 if(rect.bottom<0 || rect.top>innerHeight){closeAddMenu();return;}
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
 if(action){event.preventDefault();if(addMenu.matches(':popover-open') && addMenuTrigger===action){closeAddMenu(true);return;}
  closeAddMenu();addMenuTrigger=action;addMenu.dataset.moldId=action.dataset.addMenu;
  action.setAttribute('aria-expanded','true');addMenu.showPopover();positionAddMenu();addMenu.querySelector('button').focus({preventScroll:true});return;
 }
 const choice=event.target.closest('[data-add-destination]');
 if(choice){const disc=mold(addMenu.dataset.moldId),destination=choice.dataset.addDestination;closeAddMenu(true);void openDisc(disc,null,destination);}
});
addMenu.addEventListener('toggle',event=>{if(event.newState==='closed' && !addMenu.matches(':popover-open') && addMenuTrigger)addMenuTrigger.setAttribute('aria-expanded','false');});
addMenu.addEventListener('keydown',event=>{
 const keys=['ArrowDown','ArrowUp','Home','End'];
 if(keys.includes(event.key)){event.preventDefault();const options=[...addMenu.querySelectorAll('button')],index=options.indexOf(document.activeElement),next=event.key==='Home'?0:event.key==='End'?options.length-1:(index+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;options[next].focus();}
 if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeAddMenu(true);}
 if(event.key==='Tab')closeAddMenu(true);
});
window.addEventListener('resize',()=>closeAddMenu());window.addEventListener('scroll',event=>{if(addMenu.matches(':popover-open') && !addMenu.contains(event.target))positionAddMenu();},true);
window.addEventListener('atlas-account-change',event=>sync(event.detail));
window.BagApp={add:openDisc,catalogReady:render,isMapActive:()=>false,detailExtras:bagDetailMarkup,mapColors:()=>bagColorMap};
showDemo();render();if(account?.user)void loadBag();if(new URLSearchParams(location.search).get('bag')==='1')activateBag();
