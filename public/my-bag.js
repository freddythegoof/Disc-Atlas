import {plasticOptions,defaultDiscDetails,wearLabel,bagClass,validateDiscDetails,validateBagSettings,plasticColor,bagComparator,stabilityBiasLabel,pocketLabel} from './bag-values.js';
import {BagScene} from './bag-scene.js';

const $ = s => document.querySelector(s), esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let account = window.AtlasAccount?.current || null, settings = {bag_model:'Custom bag',capacity:20}, items = [], active = false;
let plastics, models, editing = null, removing = null, generation = 0, loading = false, loadError = '', opener = null, readSequence = 0;
let colorCustomized=false,ordering=false,dragging=null;
const catalogs = Promise.all(['/bag-plastics.json','/bag-models.json'].map(async path => {const r = await fetch(path);if (!r.ok) throw Error('Bag choices could not load. Please try again.');return r.json();})).then(([p,m])=>{plastics=p;models=m;});
// Fetch failures are surfaced when opening a sheet, without an unhandled rejection.
catalogs.catch(()=>{});
const mold = id => discs.find(d=>d.id===id);
const name = d => d?.catalogName || d?.name || 'Catalog mold unavailable';
const scene=new BagScene($('#bagScene'),{lookup:mold,inspect:inspectDisc});
function inspectDisc(d){if(d){leaveBag('list');select(d);}}
function status(message) {$('#myBagStatus').textContent = message;}
async function api(path = '',method = 'GET',data) {
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
  generation++;scene.reset();items=[];settings={bag_model:'Custom bag',capacity:20};loadError='';loading=false;editing=null;removing=null;ordering=false;dragging=null;
  if($('#addDestinationMenu').matches(':popover-open'))$('#addDestinationMenu').hidePopover();
  for(const id of ['addDiscDialog','bagModelDialog','removeDiscDialog']) if($('#'+id).open)$('#'+id).close();
  status('');
 }
 render();if(changed && data.user)void loadBag();
}
function render() {
 const signedIn = !!account?.user;
 $('#myBagTeaser').hidden=signedIn;$('#myBagSignIn').hidden=!account || signedIn;
 $('#myBagTeaserStatus').textContent=account?'Sign in to keep your discs with your account.':'Checking your account…';
 $('#myBagTools').hidden=!signedIn;$('#myBagContents').hidden=!signedIn || loading || !!loadError;
 $('#myBagLoadState').hidden=!signedIn || (!loading && !loadError);
 $('#myBagLoadMessage').textContent=loading?'Loading your bag…':loadError;$('#retryMyBag').hidden=!loadError;
 $('#addBagDisc').hidden=!signedIn;
 const bagged=items.filter(i=>i.in_bag!==false).sort(bagComparator(settings.sort_mode,mold)),stored=items.filter(i=>i.in_bag===false),count=bagged.length;
 $('#bagSort').value=settings.sort_mode || 'speed';$('#bagSort').disabled=loading || !!loadError || ordering;
 $('#bagSortHint').textContent=settings.sort_mode==='custom'?'Drag the grip, or use Move earlier / later.':settings.sort_mode==='stability'?'Most stable first · shared atlas index':'Fastest first · stability within each speed';
 $('#bagScene').hidden=!signedIn || loading || !!loadError;
 $('#bagSlotMeter').textContent=`${count} / ${settings.capacity}`;
 const breakdown=`${settings.main_capacity ?? settings.capacity} main + ${settings.putter_capacity ?? 0} putter${settings.extra_capacity?' + '+settings.extra_capacity+' extra':''}`;
 $('#bagSlotMeter').title=breakdown;$('#bagPocketBreakdown').textContent=breakdown;
 $('#bagModelName').textContent=settings.bag_model;
 $('#bagSlotProgress').max=settings.capacity;$('#bagSlotProgress').value=Math.min(count,settings.capacity);
 $('#bagCapacityNotice').hidden=count<settings.capacity;
 $('#bagCapacityNotice').textContent=count===settings.capacity?'Your bag is full. You can still add a disc.':'A little over capacity. Move a spare to Storage, or keep carrying it.';
 $('#editBagModel').disabled=loading || !!loadError || ordering;
 if(!signedIn || loading || loadError){$('#myBagContents').replaceChildren();return;}
 scene.update(items,settings);if(active)void scene.reveal();
 const groups=[['distance','Distance drivers'],['fairway','Fairway drivers'],['mid','Midranges'],['putter','Putters'],['unknown','Unclassified discs']];
 const grouped=(collection,ordered=false)=>(ordered?[['lineup','Bag discs']]:groups).map(([key,label])=>{
  const rows=ordered?collection:collection.filter(i=>bagClass(mold(i.mold_id))===key).sort(bagComparator(settings.sort_mode,mold));if(!rows.length)return '';
  return `<section class="my-bag-group ${ordered?'bag-ordered-list':''}" style="--bag-class:var(--${key==='unknown'?'muted':key})" aria-label="${label}">${ordered?'':`<div class="bag-group-heading"><h2>${label}</h2><span>${rows.length}</span></div>`}${rows.map(i=>{
   const d=mold(i.mold_id), rated=d?.speed!=null, index=rated?Math.max(0,Math.min(100,50+10*(d.turn+d.fade))):null;
   const manual=ordered && settings.sort_mode==='custom',position=rows.indexOf(i);
   return `<article class="my-bag-disc" data-disc-id="${i.id}"><span class="bag-disc-swatch" style="--disc-color:${esc(i.color||'#e6c668')}" aria-label="Disc color ${esc(i.color||'#e6c668')}"></span><div class="my-bag-disc-copy"><button class="my-bag-disc-name" data-bag-inspect="${esc(i.mold_id)}" ${d?'':'disabled'}>${esc(name(d))}</button><span class="my-bag-brand">${esc(d?.brand || 'Saved disc')}</span><div class="my-bag-disc-details"><span>${esc(i.plastic)}</span><span>${i.weight_g} g</span><span class="wear-badge" data-beat="${i.wear<=2}">${i.wear}/10 · ${wearLabel(i.wear)}</span><span>${esc(pocketLabel(i.pocket))}</span>${i.stability_bias?`<span class="bag-bias-label">${stabilityBiasLabel(i.stability_bias)}</span>`:''}</div>${i.notes?`<p class="my-bag-notes">${esc(i.notes)}</p>`:''}</div><div class="bag-consensus"><strong>${rated?[d.speed,d.glide,d.turn,d.fade].join(' / '):'Unrated'}</strong><small>${rated?'Consensus · stability '+index+'/100':'Consensus unavailable'}</small></div><div class="my-bag-disc-actions"><button type="button" data-bag-move="${i.id}" aria-label="${i.in_bag===false?'Bag':'Store'} ${esc(name(d))}">${i.in_bag===false?'Move to bag':'Store'}</button><button type="button" data-bag-edit="${i.id}" aria-label="Edit ${esc(name(d))}">Edit</button><button type="button" data-bag-remove="${i.id}" aria-label="Remove ${esc(name(d))}">Remove</button></div>${manual?`<div class="bag-reorder-controls"><button type="button" data-bag-drag="${i.id}" aria-label="Drag ${esc(name(d))} to reorder" aria-describedby="bagSortHint" ${ordering?'disabled':''}>⠿</button><button type="button" data-bag-earlier="${i.id}" aria-label="Move ${esc(name(d))} earlier" ${ordering||position===0?'disabled':''}>↑</button><button type="button" data-bag-later="${i.id}" aria-label="Move ${esc(name(d))} later" ${ordering||position===rows.length-1?'disabled':''}>↓</button></div>`:''}</article>`;
  }).join('')}</section>`;
 }).join('');
 $('#myBagContents').innerHTML=`<section id="bagLineup" aria-labelledby="bagLineupTitle"><div class="bag-section-heading"><h2 id="bagLineupTitle">Bag</h2><span>${count} ${count===1?'disc':'discs'} for the round</span></div>${count?grouped(bagged,true):'<div id="myBagEmpty" class="my-bag-empty"><h3>Your bag is empty.</h3><p>Add a disc from the Directory, or bring one over from Storage.</p><button id="emptyBagDirectory" class="pill-button primary" type="button">Explore the Directory ↗</button></div>'}</section><section id="bagStorage" aria-labelledby="bagStorageTitle"><div class="bag-section-heading"><h2 id="bagStorageTitle">Storage</h2><span>${stored.length} ${stored.length===1?'disc':'discs'} off the course</span></div><p class="bag-storage-note">The backups, the experiments, the ones waiting for their next round.</p>${stored.length?grouped(stored):'<div id="bagStorageEmpty" class="bag-storage-empty"><p>No discs in Storage yet. Tap Store on a disc to give it a rest.</p></div>'}</section>`;
}
function activateBag() {
 active=true;setView('bag');$('main').hidden=true;$('#myBagView').hidden=false;$('#bagTab').classList.add('active');
 for(const id of ['mapTab','listTab','bagTab'])$('#'+id).setAttribute('aria-current',id==='bagTab'?'page':'false');
 history.replaceState(null,'','/?bag=1');render();window.scrollTo(0,0);
}
function leaveBag(view) {
 active=false;$('#myBagView').hidden=true;$('main').hidden=false;$('#bagTab').classList.remove('active');
 for(const id of ['mapTab','listTab','bagTab'])$('#'+id).setAttribute('aria-current',id===(view==='map'?'mapTab':'listTab')?'page':'false');
 history.replaceState(null,'','/');setView(view);
}
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
 if(!d)return;if(!account?.user){activateBag();return;}
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
 if(inspect)inspectDisc(mold(inspect.dataset.bagInspect));
 if(event.target.closest('#emptyBagDirectory'))directory();
});
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
 const rect=addMenuTrigger.getBoundingClientRect(),width=180,height=106;
 if(rect.bottom<0 || rect.top>innerHeight){closeAddMenu();return;}
 addMenu.style.left=Math.max(8,Math.min(innerWidth-width-8,rect.right-width))+'px';
 addMenu.style.top=(rect.bottom+height+8<=innerHeight?rect.bottom+6:Math.max(8,rect.top-height-6))+'px';
}
document.addEventListener('click',event=>{
 const action=event.target.closest('[data-add-menu]');
 if(action){event.preventDefault();if(addMenu.matches(':popover-open') && addMenuTrigger===action){closeAddMenu(true);return;}
  closeAddMenu();addMenuTrigger=action;addMenu.dataset.moldId=action.dataset.addMenu;
  positionAddMenu();
  action.setAttribute('aria-expanded','true');addMenu.showPopover();addMenu.querySelector('button').focus({preventScroll:true});return;
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
window.BagApp={add:openDisc,catalogReady:render,isMapActive:()=>false};
render();if(account?.user)void loadBag();if(new URLSearchParams(location.search).get('bag')==='1')activateBag();
