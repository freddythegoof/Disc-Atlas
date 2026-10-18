// Storage selects the copy; the shared detail viewer owns geometry, materials and photos.
import {bagClass} from './bag-values.js';
import {rackOrder} from './collection3d/rack-layout.mjs';
import {photoURL} from './disc-photo.mjs';
import {haloBand,haloModel} from './disc3d/halo.mjs';
import {shapeForDisc} from './disc3d/shape.mjs';
const title=d=>d?.catalogName||d?.name||'Catalog mold unavailable';
const CLASSES={distance:'Distance driver',fairway:'Fairway driver',mid:'Midrange',putter:'Putter',unknown:'Unclassified'};
const EMPTY={all:'discs',distance:'drivers',fairway:'fairways',mid:'midranges',putter:'putters'};
export function albumItems(items,lookup,filter='all'){
 const owned=[...new Map(items.filter(i=>i.status!=='lost').map(i=>[i.id,i])).values()];
 return rackOrder(owned.filter(i=>filter==='all'||bagClass(lookup(i.mold_id))===filter),{
  classOf:i=>bagClass(lookup(i.mold_id)),
  compare:(a,b)=>(lookup(b.mold_id)?.speed??-1)-(lookup(a.mold_id)?.speed??-1)||title(lookup(a.mold_id)).localeCompare(title(lookup(b.mold_id)))||(a.added_at||'').localeCompare(b.added_at||'')||a.id.localeCompare(b.id),
 });
}
export class AllDiscsGallery{
 constructor(root,{lookup}){
  this.root=root;this.lookup=lookup;this.visible=false;this.filter='all';this.index=0;this.items=[];this.revision=0;this.clay=false;
  this.stage=root.querySelector('[data-album-stage]');this.host=root.querySelector('[data-album-viewer]');
  this.empty=root.querySelector('[data-album-empty]');this.message=root.querySelector('[data-album-message]');
  root.addEventListener('click',event=>{
   const filter=event.target.closest('[data-album-filter]'),step=event.target.closest('[data-album-step]');
   if(filter){this.filter=filter.dataset.albumFilter;this.index=0;this.items=albumItems(this.collection,this.lookup,this.filter);this.render();}
   if(step)this.step(Number(step.dataset.albumStep));
  });
  // Capture before the viewer's arrows. Navigation, forms and open dialogs keep their own keys.
  window.addEventListener('keydown',event=>{
   if(!this.visible||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey||document.querySelector('dialog[open]')||document.querySelector('#detail:not([hidden])'))return;
   if(event.target.closest('input,select,textarea,[contenteditable]:not([contenteditable="false"]),[role="radiogroup"]'))return;
   const step={ArrowLeft:-1,ArrowRight:1}[event.key];if(!step)return;
   event.preventDefault();event.stopImmediatePropagation();this.step(step);
  },true);
  // Observe OrbitControls rather than replacing it, preserving pinch and disc turning.
  // A deliberate horizontal single-finger stroke flips the album on release.
  let swipe=null;const pointers=new Set();
  this.stage.addEventListener('pointerdown',e=>{
   if(e.pointerType==='mouse'||e.target.closest('button,input,select,textarea,[contenteditable]'))return;pointers.add(e.pointerId);
   if(pointers.size>1){swipe=null;return;}swipe={id:e.pointerId,x:e.clientX,y:e.clientY};
  },true);
  const release=e=>{
   pointers.delete(e.pointerId);const start=swipe;if(start?.id!==e.pointerId)return;swipe=null;
   const dx=e.clientX-start.x,dy=e.clientY-start.y;
   if(e.type==='pointerup'&&Math.abs(dx)>=50&&Math.abs(dx)>Math.abs(dy)*1.5)this.step(dx<0?1:-1);
  };
  this.stage.addEventListener('pointerup',release,true);this.stage.addEventListener('pointercancel',release,true);
 }
 sync(visible,collection){
  if(!visible){this.visible=false;this.root.hidden=true;this.revision++;this.viewer?.dispose();this.viewer=null;this.filter='all';this.index=0;this.collection=[];this.items=[];return;}
  const selected=this.items[this.index]?.id;
  this.visible=true;this.root.hidden=false;this.collection=collection;this.items=albumItems(collection,this.lookup,this.filter);
  this.index=Math.max(0,this.items.findIndex(i=>i.id===selected));this.render();
 }
 step(delta){if(!this.items.length)return;this.index=(this.index+delta+this.items.length)%this.items.length;this.render();}
 render(){
  const revision=++this.revision,item=this.items[this.index],d=item&&this.lookup(item.mold_id);
  for(const b of this.root.querySelectorAll('[data-album-filter]'))b.setAttribute('aria-pressed',String(b.dataset.albumFilter===this.filter));
  for(const b of this.root.querySelectorAll('[data-album-step]'))b.disabled=!item;
  this.root.querySelector('[data-album-counter]').textContent=`${item?this.index+1:0} / ${this.items.length}`;
  this.root.querySelector('[data-album-name]').textContent=item?title(d):'';
  this.root.querySelector('[data-album-class]').textContent=item?CLASSES[bagClass(d)]:'';
  this.root.querySelector('[data-album-flight]').textContent=d&&[d.speed,d.glide,d.turn,d.fade].every(Number.isFinite)?[d.speed,d.glide,d.turn,d.fade].join(' / '):'';
  this.root.querySelector('[data-album-bag]').hidden=!item||item.in_bag===false;
  this.empty.hidden=!!item;this.empty.textContent=`No ${EMPTY[this.filter]} in the collection yet`;
  this.stage.dataset.discId=item?.id||'';
  // Let the shared resolver use measured dimensions even without flight ratings.
  const model=!!d&&!!shapeForDisc({model:d.model3d,specs:d.specs,flight:{speed:d.speed,turn:d.turn,fade:d.fade}});
  this.stage.hidden=!item||!model;this.message.hidden=!item||model;
  this.message.textContent=item&&!model?'A 3D view isn’t available for this disc yet.':'';
  if(!model){this.viewer?.dispose();this.viewer=null;return;}
  this.stage.setAttribute('aria-busy','true');
  const show=()=>{
   if(!this.visible||revision!==this.revision)return;
   this.viewer??=this.module.createDiscViewer({onClay:on=>{this.clay=on;}});
   const v=this.viewer;
   v.attach(this.host);v.update({brand:d.brand,stampAsset:d.stampAsset,stampPlacement:d.stampPlacement,
    model:d.model3d||null,specs:d.specs||null,flight:{speed:d.speed,turn:d.turn,fade:d.fade},mold:title(d),
    manufacturer:d.manufacturer,record:d.name,overmold:typeof d.overmold==='boolean'?d.overmold:undefined,
    color:item.color,colors:{plate:item.color,rim:item.rim_color||undefined},plastic:item.plastic||'premium',
    photoURL:photoURL(item),texture_key:item.texture_key,photo_rim_color:item.photo_rim_color,haloBand:haloBand(item),haloModel:haloModel(item)});
   v.setClay(this.clay);this.stage.setAttribute('aria-busy','false');this.message.hidden=true;
   this.host.getAnimations().forEach(a=>a.cancel());
   if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const style=getComputedStyle(this.root),token=style.getPropertyValue('--dur-ui').trim();
    const duration=(parseFloat(token)||.18)*(token.endsWith('ms')?1:1000);
    this.host.animate([{opacity:.65},{opacity:1}],{duration,easing:style.getPropertyValue('--ease-out').trim()||'ease-out'});
   }
  };
  const failed=()=>{if(revision!==this.revision)return;this.viewer?.dispose();this.viewer=null;this.stage.hidden=true;this.stage.setAttribute('aria-busy','false');this.message.hidden=false;this.message.textContent='The 3D view couldn’t load here. You can still browse every disc’s details.';};
  if(this.module){try{show();}catch{failed();}}
  else (this.loading??=import('./disc3d/viewer.mjs')).then(m=>{this.module=m;try{show();}catch{failed();}},failed);
 }
}
