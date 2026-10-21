import {getAtlasArt} from './atlas-art.mjs';
import {catalogStampAsset,catalogStampPlacement,stampTexture} from './stamp.mjs';
import {photoStampFor} from './photo-stamps.mjs';
import {shapeForDisc,shapeFrame} from './shape.mjs';

const lists=new WeakMap();
// Observe only the current rows. Hidden/offscreen rows neither initialize WebGL nor render a disc.
// Replacing a list cancels its old work; the atlas's byte-capped cache survives between lists.
// `personal`: the player's own list (My Bag). Its stock stamps take the player's stamp ink. A thumbnail is a flat
// image, so a foil finish is not imitated here: the ink colour only (display customization).
export function observeThumbnails(root,lookup,{personal=false}={}){
 const style=personal?window.DisplayPalette?.stampStyle?.():null,ink2d=style?.ink?{...style,finish:{id:'flat'}}:null;
 let state=lists.get(root);
 if(state){state.observer.disconnect();window.removeEventListener('atlas-photo-ready',state.onPhoto);cancelAnimationFrame(state.frame);state.pending.clear();for(const t of state.stamps.values())t.dispose();}
 state={pending:new Set(),visible:new Set(),stamps:new Map(),frame:0};lists.set(root,state);
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
    const entry=art.render({...d,photoURL:host.dataset.photoUrl||null,haloBand:host.dataset.haloBand||null,haloModel:host.dataset.haloModel||null},plate,size,rim);
    // A photo disc in its game-asset look (photo-stamps.mjs): the disc bare (atlas-art drops the photo) under its stamp.
    const look=photoStampFor(host.dataset.photoUrl),asset=look?look.asset:host.dataset.photoUrl?null:catalogStampAsset(d);
    let ink=state.stamps.get(host);
    if(asset&&!ink){ink=stampTexture(d.catalogName||d.name,plate,{asset,style:ink2d,onChange:()=>{if(lists.get(root)===state&&state.visible.has(host)&&state.stamps.has(host)){state.pending.add(host);schedule();}}});state.stamps.set(host,ink);}
    if(entry){
     // Never reparent the cache's canvas: another row or the map can use the same image.
     const canvas=document.createElement('canvas');canvas.width=canvas.height=entry.px;
     canvas.getContext('2d').drawImage(entry.canvas,0,0);canvas.setAttribute('aria-hidden','true');
     if(ink?.userData.stampAsset){
      const {shape}=shapeForDisc({model:d.model3d,specs:d.specs,flight:d}),{Rs,R}=shapeFrame(shape);
      const placement=look?look.placement:catalogStampPlacement(d);
      const width=entry.px*entry.fill*(placement?placement.diameterFraction/placement.assetInkFraction:Math.min(Rs*.78,6.2)/R);
      canvas.getContext('2d').drawImage(ink.image,(entry.px-width)/2,(entry.px-width)/2,width,width);
     }
     const pad=(1/entry.fill-1)/2*100;Object.assign(canvas.style,{left:-pad+'%',top:-pad+'%',width:100/entry.fill+'%',height:100/entry.fill+'%'});
     host.replaceChildren(canvas);host.classList.add('has-3d');
    }
    // A finished image needs no more observation; only a row whose photo is still loading stays watched,
    // so the photo's readiness can redraw it while it is on screen.
    if(!entry?.pending&&(!ink||ink.userData.stampAsset||ink.userData.stampFailed)){state.observer.unobserve(host);state.visible.delete(host);ink?.dispose();state.stamps.delete(host);}
    if(performance.now()>=deadline)break;
   }
   schedule();
  });
 };
 state.onPhoto=event=>{for(const host of state.visible)if(host.isConnected&&host.dataset.photoUrl===event.detail?.url)state.pending.add(host);schedule();};window.addEventListener('atlas-photo-ready',state.onPhoto);
 state.observer=new IntersectionObserver(entries=>{
  for(const e of entries)if(e.isIntersecting){state.visible.add(e.target);state.pending.add(e.target);}else{state.visible.delete(e.target);state.pending.delete(e.target);state.stamps.get(e.target)?.dispose();state.stamps.delete(e.target);}
  schedule();
 });
 for(const host of root.querySelectorAll('[data-disc-thumbnail]'))state.observer.observe(host);
}
