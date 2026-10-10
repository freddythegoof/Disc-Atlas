// My Bag's Storage and Lost tabs: the DOM around their 3D scenes (collection3d/). Each scene loads its
// three.js module only when its tab first shows, and keeps the canvas, a hover name, zoom controls and
// a card under the canvas in sync with the player's discs. The card is where actions live (Move to bag,
// Found it!), so nothing floats over the drawing but names. The lists below remain the full keyboard path.
import {rackCount,rackSlot,RACK_CAPACITY} from './collection3d/rack-layout.mjs';
import {epitaph,lifespan,restingPlace} from './collection3d/graveyard-layout.mjs';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const accent=()=>getComputedStyle(document.documentElement).getPropertyValue('--lime').trim()||null;
const plural=(n,one,many=one+'s')=>`${n} ${n===1?one:many}`;
const ZOOM_STEP=1.4,TURN_STEP=.15;
const TIERS=['Top','Middle','Bottom'],BAYS=['left','middle','right'];

class CollectionScene{
 constructor(root,{lookup,name,load}){
  this.root=root;this.lookup=lookup;this.name=name;this.loader=load;this.items=[];this.visible=false;
  this.canvas=root.querySelector('[data-collection-canvas]');this.status=root.querySelector('[data-collection-status]');
  this.pill=root.querySelector('[data-collection-hover]');this.card=root.querySelector('[data-collection-card]');
  this.summary=root.querySelector('[data-collection-summary]');
  const zoom=root.querySelector('[data-collection-zoom]');
  zoom.querySelector('[data-zoom="out"]').addEventListener('click',()=>this.viewer?.zoomBy(1/ZOOM_STEP));
  zoom.querySelector('[data-zoom="in"]').addEventListener('click',()=>this.viewer?.zoomBy(ZOOM_STEP));
  zoom.querySelector('[data-zoom="reset"]').addEventListener('click',()=>this.viewer?.zoomTo(1));
  this.zoomLevel=zoom.querySelector('[data-zoom="reset"]');
  // The canvas takes the keyboard too: arrows turn the scene, + and − zoom.
  this.canvas.addEventListener('keydown',event=>{
   if(!this.viewer||event.target!==this.canvas)return;
   const turn={ArrowLeft:-TURN_STEP,ArrowRight:TURN_STEP}[event.key];
   if(turn){event.preventDefault();this.viewer.turnBy(turn);}
   else if(event.key==='+'||event.key==='='){event.preventDefault();this.viewer.zoomBy(ZOOM_STEP);}
   else if(event.key==='-'||event.key==='_'){event.preventDefault();this.viewer.zoomBy(1/ZOOM_STEP);}
  });
  addEventListener('atlas-theme-change',()=>this.viewer?.setAccent?.(accent()));
 }
 load(){
  this.loading??=this.loader().then(viewer=>{this.viewer=viewer;this.root.dataset.engine='ready';this.status.textContent='';return viewer;},error=>{
   this.root.dataset.engine='failed';this.status.textContent=this.failText;console.warn('3D scene unavailable; the list below still has every disc.',error);throw error;
  });
  return this.loading;
 }
 showZoom(zoom){this.zoomLevel.textContent=Math.round(zoom*100)+'%';this.zoomLevel.disabled=zoom<=1.001;}
 hover(text,p){
  if(!text||!p){this.pill.hidden=true;return;}
  this.pill.textContent=text;this.pill.hidden=false;
  const w=this.canvas.clientWidth,pw=this.pill.offsetWidth;
  this.pill.style.left=Math.max(6,Math.min(w-pw-6,p.x-pw/2))+'px';this.pill.style.top=Math.max(6,p.y-44)+'px';
 }
 // Show or hide the scene; while shown it draws `items`.
 sync(visible,items){
  this.items=items;this.visible=visible;this.root.hidden=!visible;
  if(!visible){this.viewer?.hide();this.hover(null);return;}
  this.render();
  if(!this.wants()){this.viewer?.hide();return;}
  if(!this.viewer){this.root.dataset.engine||='loading';if(this.root.dataset.engine==='loading')this.status.textContent=this.loadText;}
  this.load().then(viewer=>{if(!this.visible||!this.wants())return;viewer.show();this.draw(viewer);},()=>{});
 }
 wants(){return true;}
}

// Storage: racks of upright discs. A tapped disc comes out of its slot; its card offers Move to bag,
// Details and Remove. More than one rack adds a rack picker that frames one rack or the whole row.
export class StorageScene extends CollectionScene{
 constructor(root,{lookup,name,moveToBag,details,remove}){
  super(root,{lookup,name,load:()=>import('./collection3d/racks.mjs').then(m=>m.mountRacks(this.canvas,{
   onPick:id=>{this.picked=id;this.renderCard();},
   onHover:(id,p)=>{const item=id&&this.items.find(i=>i.id===id);this.hover(item&&this.name(this.lookup(item.mold_id)),p);},
   onZoom:z=>this.showZoom(z),
  }))});
  this.loadText='Setting up your racks…';this.failText='The 3D racks couldn’t load here. Every stored disc is in the Storage list below.';
  this.handlers={moveToBag,details,remove};this.picked=null;this.focusRack=null;
  this.picker=root.querySelector('[data-rack-picker]');
  this.picker.addEventListener('click',event=>{
   const button=event.target.closest('[data-rack]');if(!button)return;
   this.focusRack=button.dataset.rack==='all'?null:Number(button.dataset.rack);this.viewer?.focusRack(this.focusRack);this.renderPicker();
  });
  this.card.addEventListener('click',event=>{
   const action=event.target.closest('[data-storage-action]');if(!action||action.disabled)return;
   const item=this.items.find(i=>i.id===action.dataset.id);if(!item)return;
   const kind=action.dataset.storageAction;
   if(kind==='return'){this.picked=null;this.viewer?.putBack();this.renderCard();this.canvas.focus({preventScroll:true});}
   else this.handlers[kind]?.(item,action);
  });
  // Escape slides a pulled disc home; while a dialog or the details panel is open, Escape is theirs.
  // (Capture phase: this runs before app.js closes the details on the same key.)
  document.addEventListener('keydown',event=>{
   if(event.key!=='Escape'||!this.visible||!this.picked||document.querySelector('dialog[open]')||!document.querySelector('#detail')?.hidden)return;
   const inCard=this.card.contains(document.activeElement);
   this.picked=null;this.viewer?.putBack();this.renderCard();if(inCard)this.canvas.focus({preventScroll:true});
  },true);
 }
 render(){
  const n=this.items.length,racks=rackCount(n),free=racks*RACK_CAPACITY-n;
  this.summary.textContent=`${plural(n,'disc')} in Storage · ${plural(racks,'rack')} · ${plural(free,'open slot')}`;
  this.root.dataset.racks=String(racks);
  if(this.focusRack!=null&&this.focusRack>=racks)this.focusRack=null;
  if(this.picked&&!this.items.some(i=>i.id===this.picked))this.picked=null;
  this.root.querySelector('[data-collection-empty]').hidden=n>0;
  this.renderPicker();this.renderCard();
 }
 renderPicker(){
  const racks=rackCount(this.items.length);this.picker.hidden=racks<2;if(racks<2){this.picker.replaceChildren();return;}
  const counts=Array.from({length:racks},(_,r)=>Math.min(RACK_CAPACITY,this.items.length-r*RACK_CAPACITY));
  this.picker.innerHTML=`<button type="button" data-rack="all" aria-pressed="${this.focusRack==null}">All racks</button>${counts.map((c,r)=>`<button type="button" data-rack="${r}" aria-pressed="${this.focusRack===r}" aria-label="Rack ${r+1}, ${plural(c,'disc')}">Rack ${r+1}<span aria-hidden="true">${c}</span></button>`).join('')}`;
 }
 renderCard(){
  const index=this.items.findIndex(i=>i.id===this.picked),item=this.items[index];
  if(!item){this.card.innerHTML=this.items.length?'<p class="collection-card-hint">Tap a disc to pull it from the rack. Drag sideways to turn the racks.</p>':'';this.card.dataset.state='hint';return;}
  const d=this.lookup(item.mold_id),{rack,tier,bay}=rackSlot(index),title=this.name(d);
  const where=`${rackCount(this.items.length)>1?`Rack ${rack+1} · `:''}${TIERS[tier]} shelf, ${BAYS[bay]} bay`;
  const focused=this.card.contains(document.activeElement)?document.activeElement.dataset.storageAction:null;
  this.card.dataset.state='disc';
  this.card.innerHTML=`<article class="collection-card" data-storage-card="${esc(item.id)}"><span class="bag-disc-swatch" style="--disc-color:${esc(item.color||'#e6c668')}" aria-hidden="true"></span><div class="collection-card-copy"><h3>${esc(title)}</h3><p>${esc([d?.brand,item.plastic,item.weight_g?item.weight_g+' g':''].filter(Boolean).join(' · '))}</p><p class="collection-card-where">${esc(where)}</p></div><div class="collection-card-actions"><button type="button" class="pill-button primary" data-storage-action="moveToBag" data-id="${esc(item.id)}">Move to bag</button><button type="button" class="pill-button" data-storage-action="details" data-id="${esc(item.id)}" ${d?'':'disabled'}>Details</button><button type="button" class="collection-card-quiet" data-storage-action="remove" data-id="${esc(item.id)}">Remove</button><button type="button" class="collection-card-quiet" data-storage-action="return" data-id="${esc(item.id)}">Put back</button></div></article>`;
  if(focused)this.card.querySelector(`[data-storage-action="${focused}"]`)?.focus({preventScroll:true});
 }
 draw(viewer){
  viewer.update(this.items.map(i=>{const d=this.lookup(i.mold_id);return {id:i.id,d,color:i.color,rimColor:i.rim_color,name:this.name(d)};}));
  if(this.picked&&viewer.state.pulled!==this.picked)viewer.pull(this.picked);
  if(!this.picked&&viewer.state.pulled)viewer.putBack();
 }
 // From the Storage list: bring this disc out of its rack.
 reveal(id){if(!this.items.some(i=>i.id===id))return;this.picked=id;this.renderCard();this.load().then(v=>{if(this.visible)v.pull(id);},()=>{});}
}

// Lost: one headstone per lost disc, newest first. The selected stone's card carries the full memorial
// and Found it!. Keyboard: the headstones are one tab stop; arrow keys move between them.
export class LostScene extends CollectionScene{
 constructor(root,{lookup,name,classOf,found,pending}){
  super(root,{lookup,name,load:()=>import('./collection3d/graveyard.mjs').then(m=>m.mountGraveyard(this.canvas,{
   accent:accent(),
   onPick:id=>this.choose(id),
   onHover:(id,p)=>{const item=id&&this.items.find(i=>i.id===id);this.hover(item&&`Here lies ${this.name(this.lookup(item.mold_id))}`,p);},
   onCamera:()=>this.placeTargets(),
   onZoom:z=>this.showZoom(z),
  }))});
  this.loadText='Opening the gates…';this.failText='The graveyard couldn’t load here. Every memorial is in the Lost list below.';
  this.classOf=classOf;this.found=found;this.pending=pending;this.selected=null;
  this.targets=root.querySelector('[data-grave-targets]');this.empty=root.querySelector('[data-collection-empty]');
  this.targets.addEventListener('click',event=>{const b=event.target.closest('[data-grave]');if(b)this.choose(b.dataset.grave);});
  this.targets.addEventListener('keydown',event=>{
   const step={ArrowLeft:-1,ArrowUp:-1,ArrowRight:1,ArrowDown:1}[event.key];if(!step)return;event.preventDefault();
   const ids=this.items.map(i=>i.id),next=ids[(ids.indexOf(this.selected)+step+ids.length)%ids.length];
   this.choose(next);this.targets.querySelector(`[data-grave="${CSS.escape(next)}"]`)?.focus({preventScroll:true});
  });
  this.card.addEventListener('click',event=>{
   const found=event.target.closest('[data-grave-found]');if(found&&!found.disabled){const item=this.items.find(i=>i.id===found.dataset.graveFound);if(item)this.found(item,found);}
   const nav=event.target.closest('[data-grave-step]');
   if(nav){const ids=this.items.map(i=>i.id),next=ids[(ids.indexOf(this.selected)+Number(nav.dataset.graveStep)+ids.length)%ids.length];this.choose(next);}
  });
 }
 wants(){return this.items.length>0;}
 lines(item){
  const d=this.lookup(item.mold_id);
  return {name:this.name(d),dates:lifespan(item),place:restingPlace(item),epitaph:epitaph(item,this.classOf(d))};
 }
 choose(id){this.selected=id;this.viewer?.select(id);this.renderCard();this.renderTargets();}
 render(){
  const n=this.items.length;
  this.summary.textContent=n?`${plural(n,'disc')} remembered · Good flights. Better stories.`:'';
  this.empty.hidden=n>0;this.root.toggleAttribute('data-empty',!n);
  if(!this.items.some(i=>i.id===this.selected))this.selected=this.items[0]?.id||null;
  this.renderTargets();this.renderCard();
 }
 renderTargets(){
  const date=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'});
  const have=new Map([...this.targets.children].map(b=>[b.dataset.grave,b]));
  const next=this.items.map(item=>{
   let b=have.get(item.id);if(!b){b=document.createElement('button');b.type='button';b.className='grave-target';b.dataset.grave=item.id;}
   b.setAttribute('aria-label',`Headstone for ${this.name(this.lookup(item.mold_id))}, lost ${date.format(new Date(item.lostDate+'T12:00:00'))}`);
   b.setAttribute('aria-pressed',String(item.id===this.selected));b.tabIndex=item.id===this.selected?0:-1;return b;
  });
  this.targets.replaceChildren(...next);this.placeTargets();
 }
 placeTargets(){
  if(!this.viewer||!this.visible)return;
  const anchors=new Map(this.viewer.anchors().map(a=>[a.id,a]));
  for(const b of this.targets.children){
   const a=anchors.get(b.dataset.grave);b.hidden=!a||!a.visible;if(!a)continue;
   const h=Math.max(24,a.bottom-a.top),w=Math.max(24,a.width);
   Object.assign(b.style,{left:a.x-w/2+'px',top:a.top+'px',width:w+'px',height:h+'px'});
  }
 }
 renderCard(){
  const item=this.items.find(i=>i.id===this.selected);
  if(!item){this.card.replaceChildren();return;}
  const d=this.lookup(item.mold_id),lines=this.lines(item),pending=this.pending(item.id),n=this.items.length,at=this.items.indexOf(item);
  const date=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(item.lostDate+'T12:00:00'));
  const focused=this.card.contains(document.activeElement)?(document.activeElement.dataset.graveStep||'found'):null;
  this.card.innerHTML=`<article class="epitaph-card" data-epitaph="${esc(item.id)}" aria-labelledby="epitaphTitle"><div class="epitaph-heading"><span class="bag-disc-swatch" style="--disc-color:${esc(item.color||'#e6c668')}" aria-hidden="true"></span><div><span class="epitaph-eyebrow">Here lies</span><h3 id="epitaphTitle">${esc(lines.name)}</h3></div></div><p class="epitaph-line">“${esc(lines.epitaph)}”</p><p class="bag-memorial-place"><time datetime="${esc(item.lostDate)}" aria-label="Lost ${esc(date)}">${esc(lines.dates)}</time>${item.lostCourse?`<span>${esc(item.lostCourse)}</span>`:''}${item.lostHole!=null?`<span>Hole ${esc(item.lostHole)}</span>`:''}</p><p class="epitaph-meta">${esc([item.plastic,d?.brand].filter(Boolean).join(' · '))}</p>${item.lostStory?`<p class="bag-memorial-story">${esc(item.lostStory)}</p>`:'<p class="epitaph-quiet">No story yet. Some losses speak for themselves.</p>'}<div class="epitaph-actions"><button type="button" class="pill-button primary" data-grave-found="${esc(item.id)}" ${pending?'disabled':''}>${pending?'Restoring…':'Found it!'}</button>${n>1?`<span class="epitaph-nav"><button type="button" data-grave-step="-1" aria-label="Previous headstone">←</button><span>${at+1} of ${n}</span><button type="button" data-grave-step="1" aria-label="Next headstone">→</button></span>`:''}</div></article>`;
  if(focused)this.card.querySelector(focused==='found'?'[data-grave-found]':`[data-grave-step="${focused}"]`)?.focus({preventScroll:true});
 }
 draw(viewer){
  viewer.update(this.items.map(i=>{const d=this.lookup(i.mold_id);return {id:i.id,d,color:i.color,rimColor:i.rim_color,name:this.name(d),lines:this.lines(i)};}));
  viewer.select(this.selected);this.placeTargets();
 }
}
