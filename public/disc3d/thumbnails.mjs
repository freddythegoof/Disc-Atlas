import {getAtlasArt} from './atlas-art.mjs';

const lists=new WeakMap();
// Observe only the current rows. Hidden/offscreen rows neither initialize WebGL nor render a disc.
// Replacing a list cancels its old work; the atlas's byte-capped cache survives between lists.
export function observeThumbnails(root,lookup){
 let state=lists.get(root);
 if(state){state.observer.disconnect();window.removeEventListener('atlas-photo-ready',state.onPhoto);cancelAnimationFrame(state.frame);state.pending.clear();}
 state={pending:new Set(),visible:new Set(),frame:0};lists.set(root,state);
 let art=null,loading=false,failed=false;
 const schedule=()=>{
  if(failed||loading||state.frame||!state.pending.size)return;
  if(!art){loading=true;getAtlasArt().then(value=>{art=value;loading=false;if(lists.get(root)===state)schedule();},()=>{failed=true;state.pending.clear();});return;}
  state.frame=requestAnimationFrame(()=>{
   state.frame=0;if(lists.get(root)!==state)return;
   const deadline=performance.now()+6;
   for(const host of state.pending){
    state.pending.delete(host);
    if(!host.isConnected||!host.checkVisibility())continue;
    const d=lookup(host.dataset.discThumbnail);if(!d)continue;
    const size=host.getBoundingClientRect().width,plate=host.dataset.plateColor,rim=host.dataset.rimColor||undefined;
    const entry=art.render({...d,photoURL:host.dataset.photoUrl||null},plate,size,rim);
    if(entry){
     // Never reparent the cache's canvas: another row or the map can use the same image.
     const canvas=document.createElement('canvas');canvas.width=canvas.height=entry.px;
     canvas.getContext('2d').drawImage(entry.canvas,0,0);canvas.setAttribute('aria-hidden','true');
     const pad=(1/entry.fill-1)/2*100;Object.assign(canvas.style,{left:-pad+'%',top:-pad+'%',width:100/entry.fill+'%',height:100/entry.fill+'%'});
     host.replaceChildren(canvas);host.classList.add('has-3d');
    }

    if(performance.now()>=deadline)break;
   }
   schedule();
  });
 };
 state.onPhoto=event=>{for(const host of state.visible)if(host.isConnected&&host.dataset.photoUrl===event.detail?.url)state.pending.add(host);schedule();};window.addEventListener('atlas-photo-ready',state.onPhoto);
 state.observer=new IntersectionObserver(entries=>{
  for(const e of entries)if(e.isIntersecting){state.visible.add(e.target);state.pending.add(e.target);}else{state.visible.delete(e.target);state.pending.delete(e.target);}
  schedule();
 });
 for(const host of root.querySelectorAll('[data-disc-thumbnail]'))state.observer.observe(host);
}
