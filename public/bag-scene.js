import {bagSlots,wearLabel,stabilityBiasLabel,pocketLabel} from './bag-values.js';

export const BAG_SPRING='cubic-bezier(.2,1.35,.35,1)';
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
// three.js and the bag model (~2.6 MB) load only when the bag is first shown.
const loadViewer=()=>import('./bag3d/viewer.mjs');
const accent=()=>getComputedStyle(document.documentElement).getPropertyValue('--lime').trim()||null;
const DEFAULT_BAG='#343c49';
const POCKET={main:'main',putter:'putter',goTo:'goto'};
const div=(className,attributes={})=>{const node=document.createElement('div');node.className=className;for(const [key,value]of Object.entries(attributes))node.setAttribute(key,value);return node;};

// The 3D bag renders in a canvas. A matching layer of positioned slot elements carries
// focus, hover/touch targets and labels, so keyboard and screen-reader use stay intact.
export class BagScene {
 constructor(root,{lookup,inspect,deselect}){
  this.root=root;this.lookup=lookup;this.inspect=inspect;this.deselect=deselect;this.open=false;this.ready=false;this.running=false;this.key='';this.epoch=0;this.top=false;this.slid=null;this.slideToken=0;
  this.toggle=root.querySelector('[data-bag-toggle]');this.info=root.querySelector('[data-bag-lift-info]');this.canvas=root.querySelector('[data-bag-canvas]');
  this.topToggle=root.querySelector('[data-bag-top-view]');
  this.toggle.addEventListener('click',()=>void this.setOpen(!this.open));
  this.topToggle.addEventListener('click',()=>void this.setTopView(!this.top));
  for(const type of ['pointerenter','focus'])this.topToggle.addEventListener(type,()=>void this.viewer?.prepareTopView());
  this.stage=div('bag-3d-stage');this.layer=div('bag-hit-layer',{role:'group','aria-label':'Your disc golf bag'});this.status=div('bag-3d-status',{role:'status'});
  // Hovering (or focusing) a disc shows only its name; the disc itself stays put.
  this.tag=div('bag-name-pill bag-hover-name',{'aria-hidden':'true'});this.tag.hidden=true;
  // A clicked disc slides out of its pocket; this card covers it and carries its name.
  this.card=div('bag-slide-out',{role:'button',tabindex:'-1','aria-hidden':'true','data-bag-slide-out':''});this.cardName=document.createElement('span');this.cardName.className='bag-name-pill bag-slide-name';
  this.card.append(this.cardName);
  this.pockets=div('bag-pocket-labels',{'aria-hidden':'true'});
  this.canvas.replaceChildren(this.stage,this.pockets,this.layer,this.tag,this.card,this.status);
  this.onTap(this.card,()=>this.openSlid());
  this.card.addEventListener('keydown',event=>{
   if(event.key==='Enter'||event.key===' '){event.preventDefault();this.openSlid();}
   if(event.key==='Tab'){const disc=this.slid?.disc;event.preventDefault();void this.slideIn();if(disc?.isConnected)this.tabFrom(disc,event.shiftKey);}
  });
  // Clicking empty space slides the disc back and closes its details. Clicks on the details
  // panel or dialogs do not count; a click on another disc swaps discs (its click handler does that).
  document.addEventListener('pointerdown',event=>{
   this.swallowClick=false;
   if(!this.slid || event.target.closest?.('[data-bag-slide-out],#detail,dialog,[popover],[data-physical-disc]'))return;
   this.swallowClick=this.stage.contains(event.target);void this.slideIn();
  },true);
  // Escape puts the slid-out disc back and closes everything; with nothing out, it leaves the top view.
  document.addEventListener('keydown',event=>{
   if(event.key!=='Escape' || !this.ready || !this.root.checkVisibility() || document.querySelector('dialog[open],:popover-open'))return;
   if(this.slid){event.preventDefault();event.stopPropagation();void this.slideIn({focus:true});return;}
   const detail=document.querySelector('#detail');if(detail && !detail.hidden && !detail.inert)return;
   if(this.top){event.preventDefault();void this.setTopView(false);}
  },true);
  addEventListener('atlas-theme-change',()=>this.viewer?.setAccentColor(accent()));
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>this.viewer?.setAnimated(!reduced()));
 }
 load(){
  this.loading??=(async()=>{
   this.root.dataset.engine='loading';this.status.textContent='Loading your bag…';
   try{
    const {mountBag,depthOrder}=await loadViewer();this.depthOrder=depthOrder;
    const viewer=await mountBag(this.stage,{background:'transparent',interaction:'turntable',turn:false,view:'page',contactShadow:true,
     animated:!reduced(),accentColor:accent(),compartmentDuration:.75,maxPixels:2.4e6,ambientFps:30,quality:'auto',toneMapping:'neutral',
     ...(this.data?{layout:this.slots(this.data).layout,bagColor:this.bagColor(this.data.settings)}:{})});
    this.viewer=viewer;
    // The hit layer and the list carry the content; the canvas itself is decorative.
    this.stage.querySelector('canvas').setAttribute('aria-hidden','true');
    // Exposed for QA scripts that verify the rendered state matches the saved bag.
    Object.defineProperty(this.canvas,'bagViewer',{value:viewer,configurable:true});
    this.stage.addEventListener('bagviewlayout',()=>this.place());
    // A click that only slid a disc back in leaves the flap alone.
    this.stage.addEventListener('bagclick',()=>{if(this.swallowClick){this.swallowClick=false;return;}void this.setOpen(!this.open);});
    // The bag stays turned where the user leaves it; targets and labels follow once the drag ends.
    this.stage.addEventListener('bagdragstart',()=>{this.clearLift();this.root.dataset.dragging='';});
    this.stage.addEventListener('bagdragend',()=>{delete this.root.dataset.dragging;this.interactive(!this.running);});
    this.stage.addEventListener('bagviewererror',event=>{this.status.textContent=event.detail;});
    this.ready=true;this.status.textContent='';this.root.dataset.engine='ready';
    if(this.data)this.draw();
   }catch{
    this.root.dataset.engine='error';this.status.textContent='The 3D bag could not load. Your discs are listed below.';this.toggle.disabled=true;
   }
  })();
  return this.loading;
 }
 update(items,settings){
  const key=JSON.stringify([items,settings]);if(key===this.key)return;this.key=key;this.data={items,settings};
  if(this.running)this.pendingDraw=true;else if(this.ready)this.draw();
 }
 slots({items,settings}){
  const slots=bagSlots(items,settings,this.lookup);
  return {slots,layout:{main:slots.main,putter:slots.putter,goTo:slots.goto}};
 }
 bagColor(settings){const color=settings.bag_color || DEFAULT_BAG;return color===DEFAULT_BAG?null:color;}
 draw(){
  this.clearLift();void this.slideIn();const {items,settings}=this.data,{slots,layout}=this.slots(this.data);this.items=items;
  // The default charcoal keeps the model's original tonal fabric.
  this.viewer.setBagColor(this.bagColor(settings));this.root.dataset.bagColor=this.viewer.bagColor;
  this.viewer.setBagLayout(layout);
  const clipped=this.viewer.clipped,extra=slots.overflow.length+clipped.main+clipped.putter+clipped.goTo;
  this.root.querySelector('[data-bag-overflow]').textContent=extra?`${extra} more ${extra===1?'disc':'discs'} listed below · beyond the illustrated slots`:'';
  const byId=new Map(items.map(item=>[item.id,item])),rects=this.viewer.discRects();
  // Hit order: back-most first so a front disc wins where pockets overlap. Keyboard order
  // follows the pockets instead: main left to right, then putters front to back, then go-to.
  const keyboard={main:0,putter:1,goTo:2},painted=this.depthOrder(rects);
  const tabOrder=new Map(rects.filter(r=>!r.empty).sort((a,b)=>keyboard[a.pocket]-keyboard[b.pocket]||a.order-b.order).map((r,i)=>[r.key,i]));
  this.layer.replaceChildren();this.slotsByKey=new Map();
  for(const rect of painted){
   const pocket=POCKET[rect.pocket],slot=div('bag-hit-slot'+(rect.pocket==='goTo'?' bag-goto-slot':''),{'data-pocket':pocket,'data-shape':rect.shape});
   this.slotsByKey.set(rect.key,slot);this.layer.append(slot);
   const item=byId.get(rect.id);
   if(!item){slot.setAttribute('aria-hidden','true');slot.append(div('bag-slot-hollow'));continue;}
   const mold=this.lookup(item.mold_id),title=mold?.catalogName||mold?.name||'Saved disc';
   const disc=div('bag-physical-disc',{'data-physical-disc':item.id,'data-pocket':pocket,'data-slot-order':tabOrder.get(rect.key),role:'button',tabindex:'-1','aria-label':`${title}, ${item.plastic}, wear ${item.wear} of 10, ${item.weight_g} grams, ${pocketLabel(item.pocket)}. Enter to slide it out.`,'aria-describedby':'bagLiftInfo'});
   disc.style.setProperty('--disc-color',item.color||'#e6c668');
   // Touch has no hover: a tap is a click.
   disc.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')this.lift(disc,item,title);});
   disc.addEventListener('pointerleave',()=>{if(document.activeElement!==disc)this.settle(disc);});
   disc.addEventListener('focus',()=>this.lift(disc,item,title));disc.addEventListener('blur',()=>this.settle(disc));
   disc.addEventListener('keydown',event=>{
    if(event.key==='Tab'){event.preventDefault();this.tabFrom(disc,event.shiftKey);}
    if(event.key==='Enter'||event.key===' '){event.preventDefault();void this.slideOut(disc,item,title);}
    if(event.key==='Escape'){this.settle(disc);this.toggle.focus();}
   });
   // One click (or tap) slides the disc out; clicking the slid-out disc opens its details.
   this.onTap(disc,()=>void this.slideOut(disc,item,title));
   slot.append(disc);
  }
  this.place();this.interactive(!this.running);
 }
 // Touch has no hover: a tap is a click. Taps are read from the pointer events themselves,
 // because a browser may drop the click for the first tap after a drag (as Chrome does after
 // the turntable drag); the click that does follow a tap is then ignored.
 onTap(node,action){
  let press=null,tapped=0;
  node.addEventListener('pointerdown',event=>{press=event.pointerType==='touch'?{id:event.pointerId,x:event.clientX,y:event.clientY,at:event.timeStamp}:null;});
  node.addEventListener('pointerup',event=>{
   const start=press;press=null;
   if(!start || event.pointerId!==start.id || Math.hypot(event.clientX-start.x,event.clientY-start.y)>10 || event.timeStamp-start.at>600)return;
   tapped=event.timeStamp;action();
   // The click that follows lands on whatever the tap opened (the details panel); swallow it.
   const swallow=click=>{if(click.timeStamp-tapped<800 && !node.contains(click.target)){click.preventDefault();click.stopPropagation();}};
   document.addEventListener('click',swallow,{capture:true,once:true});setTimeout(()=>document.removeEventListener('click',swallow,{capture:true}),800);
  });
  node.addEventListener('click',event=>{if(tapped && event.timeStamp-tapped<800){tapped=0;return;}action();});
 }
 // Hit-layer paint order differs from the reading order; keep Tab in slot order.
 tabFrom(disc,back){
  const ordered=[...this.layer.querySelectorAll('[data-physical-disc]:not([aria-hidden="true"])')].sort((a,b)=>Number(a.dataset.slotOrder)-Number(b.dataset.slotOrder));
  const next=ordered[ordered.indexOf(disc)+(back?-1:1)];
  if(next)next.focus({preventScroll:true});else (back?document.querySelector('#bagSort'):this.toggle).focus({preventScroll:true});
 }
 // Main discs sit behind the flap, so they only respond while the bag is open. Turned away
 // (front facing back), only the top pocket's putters are in reach.
 reachable(disc){return this.ready && !this.running && (this.open || disc.dataset.pocket!=='main') && (disc.dataset.pocket==='putter' || this.viewer.frontFacing);}
 interactive(on){
  for(const disc of this.layer.querySelectorAll('[data-physical-disc]')){const ok=on && this.reachable(disc);disc.setAttribute('tabindex',ok?'0':'-1');disc.setAttribute('aria-hidden',String(!ok));}
 }
 place(){
  if(!this.viewer || !this.slotsByKey)return;
  for(const rect of this.viewer.discRects()){
   const slot=this.slotsByKey.get(rect.key);if(!slot)continue;
   Object.assign(slot.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
  }
  this.placeCard();this.placePockets();if(this.lifted && !this.tag.hidden)this.placeTag(this.lifted);
 }
 // One disc out at a time: a second disc waits for the first to slide home.
 async slideOut(disc,item,title){
  if(!this.reachable(disc) || this.viewer.cameraMoving)return;
  if(this.slid?.disc===disc){if(this.root.dataset.slide==='out')this.openSlid();return;}
  const token=++this.slideToken;this.clearLift();
  if(this.slid){await this.putBack();if(token!==this.slideToken || !disc.isConnected)return;}
  const slid=this.slid={disc,item,title,mold:this.lookup(item.mold_id)};
  this.cardName.textContent=title;this.card.setAttribute('aria-label',`${title}, out of the bag. Enter for disc details, Escape to put it back.`);
  this.cardName.style.setProperty('--disc-color',item.color||'#e6c668');
  this.root.dataset.slide='moving';
  await this.viewer.slideDisc(disc.dataset.physicalDisc,{instant:reduced()});
  if(this.slid!==slid)return;
  this.root.dataset.slide='out';this.card.setAttribute('aria-hidden','false');this.card.tabIndex=0;
  this.placeCard();this.card.focus({preventScroll:true});
 }
 // Escape, a click on empty space and every other reset put the disc back and close its details.
 slideIn(options){this.slideToken++;return this.putBack(options);}
 putBack({focus=false}={}){
  const slid=this.slid;if(!slid)return Promise.resolve();this.slid=null;
  delete this.root.dataset.slide;this.card.setAttribute('aria-hidden','true');this.card.tabIndex=-1;
  this.deselect?.();
  if(focus)(slid.disc.isConnected && this.reachable(slid.disc)?slid.disc:this.toggle).focus({preventScroll:true});
  return this.viewer?.slidDisc?this.viewer.slideDisc(null,{instant:reduced()}):Promise.resolve();
 }
 openSlid(){if(this.slid?.mold)this.inspect(this.slid.mold,this.slid.item);}
 // The card covers the slid-out disc where it rests; its name sits under it (above, if the
 // canvas ends first).
 placeCard(){
  const rect=this.slid && this.root.dataset.slide==='out' && this.viewer?.slideRect();if(!rect)return;
  Object.assign(this.card.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
  const room=this.canvas.clientHeight-(rect.top+rect.height);this.card.dataset.label=room<this.cardName.offsetHeight+18?'above':'below';
 }
 // The hover name sits just above its disc (below, near the canvas top), kept inside the canvas.
 placeTag(disc){
  const slot=disc.parentNode,width=this.canvas.clientWidth,left=slot.offsetLeft,top=slot.offsetTop;
  const half=this.tag.offsetWidth/2,x=Math.min(width-half-6,Math.max(half+6,left+slot.offsetWidth/2));
  const above=top>this.tag.offsetHeight+14;
  Object.assign(this.tag.style,{left:x+'px',top:(above?top-8:top+slot.offsetHeight+8)+'px'});this.tag.dataset.side=above?'above':'below';
 }
 async setTopView(on){
  if(!this.ready || on===this.top)return;
  this.top=on;void this.slideIn();this.clearLift();
  this.topToggle.setAttribute('aria-pressed',String(on));this.root.dataset.camera='moving';
  const view=await this.viewer.setTopView(on,{instant:reduced()});
  if(view!==this.top)return;
  this.root.dataset.camera=on?'top':'front';this.place();
 }
 // Top view: each pocket is named, with the discs it holds.
 placePockets(){
  if(!this.top || !this.viewer || !this.items){this.pockets.replaceChildren();return;}
  const rects=this.viewer.pocketRects(),names={main:[],putter:[],goto:[]};
  for(const item of this.items)if(item.in_bag!==false)names[item.pocket]?.push(this.lookup(item.mold_id)?.catalogName || this.lookup(item.mold_id)?.name || 'Saved disc');
  const labels=[['putter','Top pocket · Putters',rects.putter],['goto','Front pocket · Go-to',rects.goTo],['main','Main compartment',rects.main]];
  this.pockets.replaceChildren(...labels.map(([pocket,heading,rect])=>{
   const label=div('bag-pocket-label',{'data-pocket':pocket}),strong=document.createElement('strong'),list=document.createElement('span');
   strong.textContent=heading;const shown=names[pocket].slice(0,4);
   list.textContent=names[pocket].length?shown.join(', ')+(names[pocket].length>shown.length?` +${names[pocket].length-shown.length} more`:''):'Empty';
   label.append(strong,list);label.style.setProperty('--x',rect.left+rect.width/2+'px');label.style.setProperty('--top',rect.top+'px');label.style.setProperty('--bottom',rect.top+rect.height+'px');
   return label;
  }));
 }
 // Hover/focus: the name pill only. The hidden description keeps plastic, wear, weight,
 // pocket and notes available to screen readers (aria-describedby).
 lift(disc,item,title){
  if(!this.reachable(disc) || this.root.dataset.dragging!==undefined)return;if(this.lifted && this.lifted!==disc)this.settle(this.lifted);
  this.lifted=disc;disc.classList.add('is-hovered');this.root.dataset.hovered='';
  this.tag.textContent=title;this.tag.style.setProperty('--disc-color',item.color||'#e6c668');
  this.tag.hidden=this.slid?.disc===disc;if(!this.tag.hidden)this.placeTag(disc);
  this.info.querySelector('strong').textContent=title;this.info.querySelector('span').textContent=`${item.plastic} · ${item.wear}/10 ${wearLabel(item.wear)} · ${item.weight_g} g · ${pocketLabel(item.pocket)}`;
  const note=this.info.querySelector('[data-lift-note]'),bias=this.info.querySelector('[data-lift-bias]');
  note.textContent=item.notes || '';note.hidden=!item.notes;
  bias.textContent=stabilityBiasLabel(item.stability_bias);bias.hidden=!bias.textContent;
  this.info.dataset.pocket=disc.dataset.pocket;this.info.dataset.visible='true';this.info.setAttribute('aria-hidden','false');
 }
 settle(disc){
  disc.classList.remove('is-hovered');
  if(this.lifted===disc){this.lifted=null;delete this.root.dataset.hovered;this.tag.hidden=true;this.info.dataset.visible='false';this.info.setAttribute('aria-hidden','true');}
 }
 clearLift(){if(this.lifted)this.settle(this.lifted);this.tag.hidden=true;this.info.dataset.visible='false';this.info.setAttribute('aria-hidden','true');}
 async reveal(){this.visible=true;await this.load();if(this.revealed||!this.ready||this.open||this.running||!this.visible)return;this.revealed=true;void this.setOpen(true);}
 async setOpen(open){
  if(!this.ready||this.running||open===this.open)return;const epoch=++this.epoch;this.running=true;this.clearLift();void this.slideIn();this.toggle.setAttribute('aria-disabled','true');
  this.root.dataset.phase=open?'opening':'closing';this.interactive(false);
  await this.viewer.setCompartmentOpen(open,{instant:reduced()});
  if(epoch!==this.epoch)return;this.open=open;this.running=false;this.root.dataset.phase=open?'open':'closed';
  this.toggle.removeAttribute('aria-disabled');this.toggle.textContent=open?'Close bag':'Open bag';this.toggle.setAttribute('aria-expanded',String(open));
  if(this.pendingDraw){this.pendingDraw=false;this.draw();}else this.interactive(true);
 }
 reset(){
  this.epoch++;this.running=false;this.open=false;this.visible=false;this.revealed=false;this.pendingDraw=false;this.data=null;this.key='';this.items=null;this.clearLift();void this.slideIn();
  this.top=false;this.topToggle.setAttribute('aria-pressed','false');delete this.root.dataset.camera;this.pockets.replaceChildren();
  if(this.ready){void this.viewer.setTopView(false,{instant:true});void this.viewer.setCompartmentOpen(false,{instant:true});this.viewer.setBagLayout({main:[],putter:[],goTo:[null]});this.viewer.setBagColor(null);}
  this.layer.replaceChildren();this.slotsByKey=null;
  if(this.root.dataset.engine!=='error')this.toggle.disabled=false;
  this.toggle.removeAttribute('aria-disabled');this.toggle.textContent='Open bag';this.toggle.setAttribute('aria-expanded','false');this.root.dataset.phase='closed';
 }
}
