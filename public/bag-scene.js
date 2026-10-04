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
 constructor(root,{lookup,inspect}){
  this.root=root;this.lookup=lookup;this.inspect=inspect;this.open=false;this.ready=false;this.running=false;this.key='';this.epoch=0;
  this.toggle=root.querySelector('[data-bag-toggle]');this.info=root.querySelector('[data-bag-lift-info]');this.canvas=root.querySelector('[data-bag-canvas]');
  this.toggle.addEventListener('click',()=>void this.setOpen(!this.open));
  this.stage=div('bag-3d-stage');this.layer=div('bag-hit-layer',{role:'group','aria-label':'Your disc golf bag'});this.status=div('bag-3d-status',{role:'status'});
  this.canvas.replaceChildren(this.stage,this.layer,this.status);
  const hoverOut=event=>{if(event.pointerType!=='touch' && this.lifted && document.activeElement!==this.lifted && (event.type==='pointerleave' || !event.target.closest('[data-physical-disc]')))this.settle(this.lifted);};
  this.canvas.addEventListener('pointermove',hoverOut);this.canvas.addEventListener('pointerleave',hoverOut);
  addEventListener('atlas-theme-change',()=>this.viewer?.setAccentColor(accent()));
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>this.viewer?.setAnimated(!reduced()));
 }
 load(){
  this.loading??=(async()=>{
   this.root.dataset.engine='loading';this.status.textContent='Loading your bag…';
   try{
    const {mountBag,depthOrder}=await loadViewer();this.depthOrder=depthOrder;
    const viewer=await mountBag(this.stage,{background:'transparent',interaction:'turntable',turn:false,view:'page',contactShadow:true,
     animated:!reduced(),accentColor:accent(),compartmentDuration:.75,maxPixels:2.4e6,ambientFps:30,quality:'auto',
     ...(this.data?{layout:this.slots(this.data).layout,bagColor:this.bagColor(this.data.settings)}:{})});
    this.viewer=viewer;
    // The hit layer and the list carry the content; the canvas itself is decorative.
    this.stage.querySelector('canvas').setAttribute('aria-hidden','true');
    // Exposed for QA scripts that verify the rendered state matches the saved bag.
    Object.defineProperty(this.canvas,'bagViewer',{value:viewer,configurable:true});
    this.stage.addEventListener('bagviewlayout',()=>this.place());
    this.stage.addEventListener('bagclick',()=>void this.setOpen(!this.open));
    this.stage.addEventListener('bagdragstart',()=>this.clearLift());
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
  this.clearLift();const {items,settings}=this.data,{slots,layout}=this.slots(this.data);
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
   const disc=div('bag-physical-disc',{'data-physical-disc':item.id,'data-pocket':pocket,'data-slot-order':tabOrder.get(rect.key),role:'button',tabindex:'-1','aria-label':`${title}, ${item.plastic}, wear ${item.wear} of 10, ${item.weight_g} grams, ${pocketLabel(item.pocket)}. Enter to explore.`,'aria-describedby':'bagLiftInfo'});
   disc.style.setProperty('--disc-color',item.color||'#e6c668');
   disc.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')this.lift(disc,item,title);});
   disc.addEventListener('pointerleave',event=>{if(event.pointerType!=='touch' && document.activeElement!==disc)this.settle(disc);});
   disc.addEventListener('focus',()=>this.lift(disc,item,title));disc.addEventListener('blur',()=>this.settle(disc));
   disc.addEventListener('keydown',event=>{
    if(event.key==='Tab'){
     // Hit-layer paint order differs from the reading order; keep Tab in slot order.
     const ordered=[...this.layer.querySelectorAll('[data-physical-disc]:not([aria-hidden="true"])')].sort((a,b)=>Number(a.dataset.slotOrder)-Number(b.dataset.slotOrder));
     const next=ordered[ordered.indexOf(disc)+(event.shiftKey?-1:1)];
     event.preventDefault();if(next)next.focus({preventScroll:true});else (event.shiftKey?document.querySelector('#bagSort'):this.toggle).focus({preventScroll:true});
    }
    if(event.key==='Enter'||event.key===' '){event.preventDefault();if(this.reachable(disc))this.inspect(mold);}
    if(event.key==='Escape'){this.settle(disc);this.toggle.focus();}
   });
   disc.addEventListener('click',event=>{if(!this.reachable(disc))return;
    if(event.pointerType==='touch' && this.tapped!==disc){this.tapped=disc;this.lift(disc,item,title);return;}
    this.inspect(mold);
   });
   slot.append(disc);
  }
  this.place();this.interactive(!this.running);
 }
 // Main discs sit behind the flap, so they only respond while the bag is open.
 reachable(disc){return this.ready && !this.running && (this.open || disc.dataset.pocket!=='main');}
 interactive(on){
  for(const disc of this.layer.querySelectorAll('[data-physical-disc]')){const ok=on && this.reachable(disc);disc.setAttribute('tabindex',ok?'0':'-1');disc.setAttribute('aria-hidden',String(!ok));}
 }
 place(){
  if(!this.viewer || !this.slotsByKey)return;
  for(const rect of this.viewer.discRects()){
   const slot=this.slotsByKey.get(rect.key);if(!slot)continue;
   Object.assign(slot.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
  }
 }
 lift(disc,item,title){
  if(!this.reachable(disc))return;if(this.lifted && this.lifted!==disc)this.settle(this.lifted);
  this.lifted=disc;disc.classList.add('is-lifted');
  this.viewer.turnHome(reduced());this.viewer.liftDisc(disc.dataset.physicalDisc,{instant:reduced()});
  this.info.querySelector('strong').textContent=title;this.info.querySelector('span').textContent=`${item.plastic} · ${item.wear}/10 ${wearLabel(item.wear)} · ${item.weight_g} g · ${pocketLabel(item.pocket)}`;
  const note=this.info.querySelector('[data-lift-note]'),bias=this.info.querySelector('[data-lift-bias]');
  note.textContent=item.notes || '';note.hidden=!item.notes;
  bias.textContent=stabilityBiasLabel(item.stability_bias);bias.hidden=!bias.textContent;
  this.info.dataset.pocket=disc.dataset.pocket;this.info.dataset.visible='true';this.info.setAttribute('aria-hidden','false');
 }
 settle(disc){
  disc.classList.remove('is-lifted');
  if(this.lifted===disc){this.lifted=null;this.tapped=null;this.viewer?.liftDisc(null,{instant:reduced()});this.info.dataset.visible='false';this.info.setAttribute('aria-hidden','true');}
 }
 clearLift(){if(this.lifted)this.settle(this.lifted);this.info.dataset.visible='false';this.info.setAttribute('aria-hidden','true');}
 async reveal(){this.visible=true;await this.load();if(this.revealed||!this.ready||this.open||this.running||!this.visible)return;this.revealed=true;void this.setOpen(true);}
 async setOpen(open){
  if(!this.ready||this.running||open===this.open)return;const epoch=++this.epoch;this.running=true;this.clearLift();this.toggle.setAttribute('aria-disabled','true');
  this.root.dataset.phase=open?'opening':'closing';this.interactive(false);
  await this.viewer.setCompartmentOpen(open,{instant:reduced()});
  if(epoch!==this.epoch)return;this.open=open;this.running=false;this.root.dataset.phase=open?'open':'closed';
  this.toggle.removeAttribute('aria-disabled');this.toggle.textContent=open?'Close bag':'Open bag';this.toggle.setAttribute('aria-expanded',String(open));
  if(this.pendingDraw){this.pendingDraw=false;this.draw();}else this.interactive(true);
 }
 reset(){
  this.epoch++;this.running=false;this.open=false;this.visible=false;this.revealed=false;this.pendingDraw=false;this.data=null;this.key='';this.clearLift();
  if(this.ready){void this.viewer.setCompartmentOpen(false,{instant:true});this.viewer.setBagLayout({main:[],putter:[],goTo:[null]});this.viewer.setBagColor(null);}
  this.layer.replaceChildren();this.slotsByKey=null;
  if(this.root.dataset.engine!=='error')this.toggle.disabled=false;
  this.toggle.removeAttribute('aria-disabled');this.toggle.textContent='Open bag';this.toggle.setAttribute('aria-expanded','false');this.root.dataset.phase='closed';
 }
}
