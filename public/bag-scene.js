import {bagPalette,bagSlots,wearLabel,stabilityBiasLabel} from './bag-values.js';

const NS='http://www.w3.org/2000/svg';
export const BAG_SPRING='cubic-bezier(.2,1.35,.35,1)';
const springProgress=t=>{let lo=0,hi=1,u=t;const bezier=(p,a,b)=>3*(1-p)*(1-p)*p*a+3*(1-p)*p*p*b+p*p*p;for(let i=0;i<16;i++){u=(lo+hi)/2;if(bezier(u,.2,.35)<t)lo=u;else hi=u;}return bezier(u,1.35,1);};
const svgAsset=fetch('/bag.svg').then(async r=>{if(!r.ok)throw Error('Bag artwork could not load.');return r.text();});
svgAsset.catch(()=>{});
const el=(tag,attributes={})=>{const node=document.createElementNS(NS,tag);for(const [key,value]of Object.entries(attributes))node.setAttribute(key,value);return node;};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

// The supplied asset stays intact. Only this application's disc layer is inserted.
export class BagScene {
 constructor(root,{lookup,inspect}){
  this.root=root;this.lookup=lookup;this.inspect=inspect;this.open=false;this.ready=false;this.running=false;this.key='';this.epoch=0;
  this.toggle=root.querySelector('[data-bag-toggle]');this.info=root.querySelector('[data-bag-lift-info]');
  this.toggle.addEventListener('click',()=>void this.setOpen(!this.open));
  this.asset=svgAsset.then(source=>{
   const svg=new DOMParser().parseFromString(source,'image/svg+xml').documentElement;
   this.svg=document.importNode(svg,true);this.svg.classList.add('interactive-bag-svg');this.svg.setAttribute('role','group');this.svg.setAttribute('aria-label','Your disc golf bag');this.svg.removeAttribute('aria-labelledby');
   this.lid=this.svg.querySelector('#bag-lid');this.layer=el('g',{id:'bag-disc-layer'});this.svg.insertBefore(this.layer,this.svg.querySelector('#bag-front'));
   root.querySelector('[data-bag-canvas]').replaceChildren(this.svg);this.ready=true;
   this.svg.addEventListener('click',event=>{if(!event.target.closest('[data-physical-disc]'))void this.setOpen(!this.open);});
   const hoverOut=event=>{if(event.pointerType!=='touch' && this.lifted && document.activeElement!==this.lifted && (event.type==='pointerleave' || !event.target.closest('[data-physical-disc]')))this.settle(this.lifted);};
   this.svg.addEventListener('pointermove',hoverOut);this.svg.addEventListener('pointerleave',hoverOut);
   if(this.data)this.draw();if(this.visible)void this.reveal();
  }).catch(()=>{root.querySelector('[data-bag-canvas]').textContent='Artwork unavailable. Your discs are listed below.';this.toggle.disabled=true;});
 }
 update(items,settings){
  const key=JSON.stringify([items,settings]);if(key===this.key)return;this.key=key;this.data={items,settings};
  if(this.running)this.pendingDraw=true;else if(this.ready)this.draw();
 }
 draw(){
  this.clearLift();const {items,settings}=this.data,palette=bagPalette(settings.bag_color || '#343c49');
  // Keep built-in charcoal defaults, including the original secondary/accent.
  for(const part of ['primary','secondary','accent']){if(palette.primary==='#343c49')this.svg.style.removeProperty('--bag-'+part);else this.svg.style.setProperty('--bag-'+part,palette[part]);}
  const slots=bagSlots(items,settings,this.lookup);this.layer.replaceChildren();
  this.root.querySelector('[data-bag-overflow]').textContent=slots.overflow.length?`${slots.overflow.length} more ${slots.overflow.length===1?'disc':'discs'} listed below · beyond the illustrated slots`:'';
  let keyboardOrder=0;
  const drawSlots=(list,pocket)=>{
   const total=list.length,main=pocket==='main';
   // The main discs live strictly in x270–530/y545–790; the putter tops
   // emerge above the fixed pocket face. Its rear/face naturally occlude bottoms.
   const min=main?270:280,max=main?530:520,step=(max-min)/Math.max(total,1),rx=Math.max(.5,Math.min(main?26:48,step*.44)),cy=main?670:240,ry=main?115:98;
   for(const slot of list){
    const x=min+step*(slot.index+.5),position=el('g',{transform:`translate(${x} ${cy})`,'data-pocket':pocket});
    if(!slot.item){position.append(el('ellipse',{cx:0,cy:0,rx,ry,fill:'#0c1118',stroke:'#697485','stroke-opacity':'.18','stroke-width':1,class:'bag-slot-hollow'}));position.setAttribute('aria-hidden','true');this.layer.append(position);continue;}
    const item=slot.item,mold=this.lookup(item.mold_id),title=mold?.catalogName||mold?.name||'Saved disc';
    const disc=el('g',{class:'bag-physical-disc','data-physical-disc':item.id,'data-slot-order':keyboardOrder++,tabindex:this.open?'0':'-1',role:'button','aria-label':`${title}, ${item.plastic}, wear ${item.wear} of 10, ${item.weight_g} grams. Enter to explore.`, 'aria-describedby':'bagLiftInfo'});
    const visual=el('g',{class:'bag-disc-visual'});visual.style.transformOrigin='0px 0px';disc.dataset.slotX=x;disc.dataset.pocket=pocket;disc.style.opacity=this.open?'1':'0';
    // The slot's hit area stays still while the top turns and lifts. It keeps
    // hovering/touching the original slot from fighting the spring motion.
    disc.append(el('rect',{x:-rx,y:-ry,width:rx*2,height:ry*2,fill:'transparent'}));disc.append(visual);
    // A quiet bevel defines a physical rim without copying manufacturer stamps.
    visual.append(el('ellipse',{cx:0,cy:0,rx,ry,fill:item.color||'#e6c668',class:'bag-disc-face'}));
    visual.append(el('ellipse',{cx:0,cy:0,rx:rx*.7,ry:ry*.91,fill:'none',stroke:'white','stroke-opacity':'.2','stroke-width':1}));
    visual.append(el('path',{d:`M ${-rx*.35} ${-ry*.85} Q ${-rx*.8} 0 ${-rx*.35} ${ry*.85}`,stroke:'white','stroke-opacity':'.32','stroke-width':1.5}));
    disc.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')this.lift(disc,item,title,rx);});
    disc.addEventListener('pointerleave',event=>{if(event.pointerType!=='touch' && document.activeElement!==disc)this.settle(disc);});
    disc.addEventListener('focus',()=>this.lift(disc,item,title,rx));disc.addEventListener('blur',()=>this.settle(disc));
    disc.addEventListener('keydown',event=>{
     if(event.key==='Tab'){
      // SVG paint order changes during a lift; keyboard order stays in slots.
      const ordered=[...this.layer.querySelectorAll('[data-physical-disc]')].sort((a,b)=>Number(a.dataset.slotOrder)-Number(b.dataset.slotOrder));
      const next=ordered[ordered.indexOf(disc)+(event.shiftKey?-1:1)];
      event.preventDefault();if(next)next.focus({preventScroll:true});else (event.shiftKey?document.querySelector('#bagSort'):this.toggle).focus({preventScroll:true});
     }
     if(event.key==='Enter'||event.key===' '){event.preventDefault();if(this.open&&!this.running)this.inspect(mold);}
     if(event.key==='Escape'){this.settle(disc);this.toggle.focus();}
    });
    disc.addEventListener('click',event=>{event.stopPropagation();if(!this.open||this.running)return;
     if(event.pointerType==='touch' && this.tapped!==disc){this.tapped=disc;this.lift(disc,item,title,rx);return;}
     this.inspect(mold);
    });
    position.append(disc);this.layer.append(position);
   }
  };
  drawSlots(slots.main,'main');drawSlots(slots.putter,'putter');
 }
 lift(disc,item,title,rx){
  if(!this.open||this.running)return;if(this.lifted && this.lifted!==disc)this.settle(this.lifted);
  this.lifted=disc;
  // appendChild detaches a focused SVG descendant. Atomic moves retain focus;
  // older browsers keep keyboard paint order instead of dropping the focus.
  if(this.layer.moveBefore)this.layer.moveBefore(disc.parentNode,null);else if(document.activeElement!==disc)this.layer.append(disc.parentNode);
  disc.classList.add('is-lifted');
  // Widen the visible top as it comes out of the tightly packed row.
  const x=Number(disc.dataset.slotX),target=Math.max(320,Math.min(480,x));
  this.motion(disc.querySelector('.bag-disc-visual'),`translate(${target-x}px,-72px) scale(${Math.max(1.12,72/rx)},.66)`,360);
  this.info.querySelector('strong').textContent=title;this.info.querySelector('span').textContent=`${item.plastic} · ${item.wear}/10 ${wearLabel(item.wear)} · ${item.weight_g} g`;
  const note=this.info.querySelector('[data-lift-note]'),bias=this.info.querySelector('[data-lift-bias]');
  note.textContent=item.notes || '';note.hidden=!item.notes;
  bias.textContent=stabilityBiasLabel(item.stability_bias);bias.hidden=!bias.textContent;
  this.info.dataset.visible='true';this.info.setAttribute('aria-hidden','false');
 }
 settle(disc){this.motion(disc.querySelector('.bag-disc-visual'),'translateY(0px) scale(1)',360);disc.classList.remove('is-lifted');if(this.lifted===disc){this.lifted=null;this.tapped=null;this.info.dataset.visible='false';this.info.setAttribute('aria-hidden','true');}}
 clearLift(){if(this.lifted)this.settle(this.lifted);this.info.dataset.visible='false';this.info.setAttribute('aria-hidden','true');}
 motion(node,transform,duration,delay=0){
  const from=getComputedStyle(node).transform;node.getAnimations().forEach(a=>a.cancel());node.style.transform=transform;
  if(!reduced())node.animate([{transform:from==='none'?'translateY(0px) scale(1)':from},{transform}],{duration,delay,easing:BAG_SPRING,fill:'backwards'});
 }
 async reveal(){this.visible=true;await this.asset;if(this.revealed||!this.ready||this.open||this.running)return;this.revealed=true;void this.setOpen(true);}
 async setOpen(open){
  if(!this.ready||this.running||open===this.open)return;const epoch=++this.epoch;this.running=true;this.clearLift();this.toggle.setAttribute('aria-disabled','true');
  this.root.dataset.phase=open?'opening':'closing';const discs=[...this.layer.querySelectorAll('[data-physical-disc]')];
  for(const d of discs){d.setAttribute('tabindex','-1');d.setAttribute('aria-hidden','true');}
  if(reduced()){
   this.svg.dataset.state=open?'open':'closed';for(const d of discs){d.style.opacity=open?'1':'0';d.style.transform='';}
  }else if(open){
   // A short pull cue precedes the fold; hardware colors remain unchanged.
   const pulls=this.lid.querySelectorAll('[id^="lid-zipper-pull"]');
   for(const p of pulls)p.animate([{opacity:1},{opacity:.35}],{duration:80,easing:BAG_SPRING});
   await wait(80);if(epoch!==this.epoch)return;
   await this.fold(1,.05,220,epoch);if(epoch!==this.epoch)return;
   this.svg.dataset.state='open';this.lid.removeAttribute('transform');
   const stagger=Math.min(50,240/Math.max(1,discs.length-1));
   discs.forEach((d,i)=>{const visual=d.querySelector('.bag-disc-visual');visual.style.transform='translateY(95px) scale(.94)';d.style.opacity='1';this.motion(visual,'translateY(0px) scale(1)',330,i*stagger);d.animate([{opacity:0},{opacity:1}],{duration:200,delay:i*stagger,easing:BAG_SPRING,fill:'backwards'});});
   await wait(330+Math.min(240,Math.max(0,discs.length-1)*stagger));
  }else{
   for(const d of discs){this.motion(d.querySelector('.bag-disc-visual'),'translateY(95px) scale(.94)',180);d.animate([{opacity:1},{opacity:0}],{duration:180,easing:BAG_SPRING,fill:'forwards'});}
   await wait(180);if(epoch!==this.epoch)return;
   for(const d of discs){d.getAnimations().forEach(a=>a.cancel());d.style.opacity='0';}
   this.lid.setAttribute('transform','translate(0 488) scale(1 .05) translate(0 -488)');this.svg.dataset.state='closed';
   await this.fold(.05,1,280,epoch);this.lid.removeAttribute('transform');
  }
  if(epoch!==this.epoch)return;this.open=open;this.running=false;this.root.dataset.phase=open?'open':'closed';
  this.toggle.removeAttribute('aria-disabled');this.toggle.textContent=open?'Close bag':'Open bag';this.toggle.setAttribute('aria-expanded',String(open));
  for(const d of discs){d.getAnimations({subtree:true}).forEach(a=>a.cancel());d.style.opacity=open?'1':'0';d.querySelector('.bag-disc-visual').style.transform='translateY(0px) scale(1)';d.setAttribute('tabindex',open?'0':'-1');d.setAttribute('aria-hidden',String(!open));}
  if(this.pendingDraw){this.pendingDraw=false;this.draw();}
 }
 fold(from,to,duration,epoch){
  const hinge=Number(this.lid.dataset.hingeY);
  return new Promise(resolve=>{const start=performance.now();const frame=now=>{if(epoch!==this.epoch){resolve();return;}const t=Math.min(1,(now-start)/duration),s=Math.max(.05,from+(to-from)*springProgress(t));this.lid.setAttribute('transform',`translate(0 ${hinge}) scale(1 ${s}) translate(0 -${hinge})`);if(t<1)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
 }
 reset(){this.epoch++;this.running=false;this.open=false;this.visible=false;this.revealed=false;this.pendingDraw=false;this.data=null;this.key='';this.clearLift();if(this.ready){this.svg.dataset.state='closed';this.lid.removeAttribute('transform');this.layer.replaceChildren();}this.toggle.disabled=false;this.toggle.removeAttribute('aria-disabled');this.toggle.textContent='Open bag';this.toggle.setAttribute('aria-expanded','false');this.root.dataset.phase='closed';}
}
