import {plasticOptions,defaultDiscDetails,wearLabel,bagClass,validateDiscDetails,validateBagSettings} from './bag-values.js';

const $ = s => document.querySelector(s), esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let account = window.AtlasAccount?.current || null, settings = {bag_model:'Custom bag',capacity:20}, items = [], active = false;
let plastics, models, editing = null, removing = null, generation = 0, loading = false, loadError = '', opener = null, readSequence = 0;
const catalogs = Promise.all(['/bag-plastics.json','/bag-models.json'].map(async path => {const r = await fetch(path);if (!r.ok) throw Error('Bag choices could not load. Please try again.');return r.json();})).then(([p,m])=>{plastics=p;models=m;});
// Fetch failures are surfaced when opening a sheet, without an unhandled rejection.
catalogs.catch(()=>{});
const mold = id => discs.find(d=>d.id===id);
const name = d => d?.catalogName || d?.name || 'Catalog mold unavailable';
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
  generation++;items=[];settings={bag_model:'Custom bag',capacity:20};loadError='';loading=false;editing=null;removing=null;
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
 $('#bagSlotMeter').textContent=`${items.length} / ${settings.capacity}`;
 $('#bagModelName').textContent=settings.bag_model;
 $('#bagSlotProgress').max=settings.capacity;$('#bagSlotProgress').value=Math.min(items.length,settings.capacity);
 $('#bagCapacityNotice').hidden=items.length<settings.capacity;
 $('#bagCapacityNotice').textContent=items.length===settings.capacity?'Your bag is full. You can still add a disc.':'A little over capacity. You can still add discs.';
 $('#editBagModel').disabled=loading || !!loadError;
 if(!signedIn || loading || loadError){$('#myBagContents').replaceChildren();return;}
 if(!items.length){$('#myBagContents').innerHTML='<div id="myBagEmpty" class="my-bag-empty"><div class="empty-bag-mark" aria-hidden="true">＋</div><h2>Your bag is empty.</h2><p>Add discs from the map, the Directory, or any detail panel.</p><button id="emptyBagDirectory" class="pill-button primary" type="button">Explore the Directory <span aria-hidden="true">↗</span></button></div>';return;}
 const groups=[['distance','Distance drivers'],['fairway','Fairway drivers'],['mid','Midranges'],['putter','Putters'],['unknown','Unclassified discs']];
 $('#myBagContents').innerHTML=groups.map(([key,label])=>{
  const rows=items.filter(i=>bagClass(mold(i.mold_id))===key);if(!rows.length)return '';
  return `<section class="my-bag-group" style="--bag-class:var(--${key==='unknown'?'muted':key})" aria-label="${label}"><div class="bag-group-heading"><h2>${label}</h2><span>${rows.length}</span></div>${rows.map(i=>{
   const d=mold(i.mold_id), rated=d?.speed!=null, index=rated?Math.max(0,Math.min(100,50+10*(d.turn+d.fade))):null;
   return `<article class="my-bag-disc">${d?photoMarkup(d):'<span class="bag-missing-art" aria-hidden="true">?</span>'}<div class="my-bag-disc-copy"><button class="my-bag-disc-name" data-bag-inspect="${esc(i.mold_id)}" ${d?'':'disabled'}>${esc(name(d))}</button><span class="my-bag-brand">${esc(d?.brand || 'Saved disc')}</span><div class="my-bag-disc-details"><span>${esc(i.plastic)}</span><span>${i.weight_g} g</span><span class="wear-badge" data-beat="${i.wear<=2}">${i.wear}/10 · ${wearLabel(i.wear)}</span></div>${i.notes?`<p class="my-bag-notes">${esc(i.notes)}</p>`:''}</div><div class="bag-consensus"><strong>${rated?[d.speed,d.glide,d.turn,d.fade].join(' / '):'Unrated'}</strong><small>${rated?'Consensus · stability '+index+'/100':'Consensus unavailable'}</small></div><div class="my-bag-disc-actions"><button type="button" data-bag-edit="${i.id}" aria-label="Edit ${esc(name(d))}">Edit</button><button type="button" data-bag-remove="${i.id}" aria-label="Remove ${esc(name(d))}">Remove</button></div></article>`;
  }).join('')}</section>`;
 }).join('');
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
 const dialog=$('#'+id);dialog.addEventListener('close',()=>{const target=opener;if(target?.isConnected)target.focus({preventScroll:true});});
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
async function openDisc(d,item=null) {
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
 $('#addDiscStatus').textContent='';$('#saveDisc').textContent=item?'Save changes':'Save to bag';$('#saveDisc').disabled=false;
 opener=trigger;$('#addDiscDialog').showModal();$('#saveDisc').focus();
}
$('#addDiscForm').addEventListener('submit',async event=>{
 event.preventDefault();const epoch=generation,edited=editing,button=$('#saveDisc');button.disabled=true;$('#addDiscStatus').textContent='Saving…';
 try {
  const value=validateDiscDetails({mold_id:$('#addDiscId').value,plastic:$('#bagPlastic').value==='__other'?$('#bagPlasticOther').value:$('#bagPlastic').value,wear:Number($('#bagWear').value),weight_g:Number($('#bagWeight').value),notes:$('#bagNotes').value},mold($('#addDiscId').value),plastics);
  const result=await api('/discs'+(edited?'/'+edited.id:''),edited?'PUT':'POST',value);
  items=edited?items.map(i=>i.id===edited.id?result.disc:i):[...items,result.disc];if(loading)void loadBag();render();$('#addDiscDialog').close();
  // An edited row is re-rendered, so explicitly restore keyboard focus to its new button.
  if(active && edited)$(`[data-bag-edit="${edited.id}"]`)?.focus({preventScroll:true});
  status(edited?'Disc updated.':'Disc added to your bag.');
 } catch(error) {if(error.name!=='AbortError')$('#addDiscStatus').textContent=error.message;}
 finally {if(epoch===generation)button.disabled=false;}
});
$('#bagWear').addEventListener('input',updateWear);$('#bagPlastic').addEventListener('change',()=>{updatePlastic();if(!$('#bagPlasticOther').hidden)$('#bagPlasticOther').focus();});
function modelFields() {
 const choice=models.models.find(m=>m.name===$('#bagModel').value),custom=$('#bagModel').value==='__custom';
 $('#customBagField').hidden=!custom;$('#customBagName').required=custom;
 $('#bagCapacity').readOnly=choice?.capacity!=null;if(choice?.capacity!=null)$('#bagCapacity').value=choice.capacity;
 $('#bagCapacityHint').textContent=choice?.capacity!=null?'Disc-slot capacity for this model.':choice?'Enter the capacity of your bag.':'Choose the number of discs your bag holds.';
}
$('#editBagModel').addEventListener('click',async()=>{
 const epoch=generation;
 try{await catalogs;if(epoch!==generation || !account?.user)return;
  $('#bagModel').innerHTML=models.models.map(m=>`<option value="${esc(m.name)}">${esc(m.name)}</option>`).join('')+'<option value="__custom">Custom bag…</option>';
  $('#bagModel').value=models.models.some(m=>m.name===settings.bag_model)?settings.bag_model:'__custom';$('#customBagName').value=settings.bag_model;
  $('#bagCapacity').value=settings.capacity;$('#bagModelStatus').textContent='';$('#saveBagModel').disabled=false;modelFields();show($('#bagModelDialog'));
 }catch(error){status(error.message);}
});
$('#bagModel').addEventListener('change',modelFields);
$('#bagModelForm').addEventListener('submit',async event=>{
 event.preventDefault();const epoch=generation,button=$('#saveBagModel');button.disabled=true;$('#bagModelStatus').textContent='Saving…';
 try{const value=validateBagSettings({bag_model:$('#bagModel').value==='__custom'?$('#customBagName').value:$('#bagModel').value,capacity:Number($('#bagCapacity').value)},models);const data=await api('','PUT',value);settings=data.bag;render();$('#bagModelDialog').close();status('Bag updated.');}
 catch(error){if(error.name!=='AbortError')$('#bagModelStatus').textContent=error.message;}
 finally{if(epoch===generation)button.disabled=false;}
});
$('#myBagContents').addEventListener('click',event=>{
 const edit=event.target.closest('[data-bag-edit]'),remove=event.target.closest('[data-bag-remove]'),inspect=event.target.closest('[data-bag-inspect]');
 if(edit){const item=items.find(i=>i.id===edit.dataset.bagEdit);void openDisc(mold(item.mold_id),item);}
 if(remove){removing=items.find(i=>i.id===remove.dataset.bagRemove);$('#removeDiscName').textContent=name(mold(removing.mold_id));$('#removeDiscStatus').textContent='';$('#confirmRemoveDisc').disabled=false;show($('#removeDiscDialog'));$('#cancelRemoveDisc').focus();}
 if(inspect){const d=mold(inspect.dataset.bagInspect);if(d){leaveBag('list');select(d);}}
 if(event.target.closest('#emptyBagDirectory'))directory();
});
$('#confirmRemoveDisc').addEventListener('click',async()=>{
 if(!removing)return;const epoch=generation,removed=removing,button=$('#confirmRemoveDisc'),index=items.findIndex(i=>i.id===removed.id);button.disabled=true;
 try {await api('/discs/'+removed.id,'DELETE');items=items.filter(i=>i.id!==removed.id);render();$('#removeDiscDialog').close();status('Disc removed.');const next=items[Math.min(index,items.length-1)];(next?$(`[data-bag-remove="${next.id}"]`):$('#emptyBagDirectory'))?.focus({preventScroll:true});}
 catch(error){if(error.name!=='AbortError')$('#removeDiscStatus').textContent=error.message;}
 finally{if(epoch===generation)button.disabled=false;}
});
$('#bagTab').onclick=activateBag;$('#mapTab').onclick=()=>leaveBag('map');$('#listTab').onclick=()=>leaveBag('list');
$('#addBagDisc').onclick=directory;$('#retryMyBag').onclick=loadBag;
document.addEventListener('click',event=>{const action=event.target.closest('[data-bag-add]');if(action){event.preventDefault();void openDisc(mold(action.dataset.bagAdd));}});
window.addEventListener('atlas-account-change',event=>sync(event.detail));
window.BagApp={add:openDisc,catalogReady:render,isMapActive:()=>false};
render();if(account?.user)void loadBag();if(new URLSearchParams(location.search).get('bag')==='1')activateBag();
