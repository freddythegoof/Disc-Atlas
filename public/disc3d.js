// The detail panel's 3D disc (Plan 09). markup() decides 3D or the static illustration; sync() mounts the
// one shared viewer into the panel. three.js and the viewer load only when a disc with model data is
// shown in a visible panel, so the atlas's first paint never pays for them.
// Model data: explicit shape params on d.model3d, otherwise the mold's PDGA dimensions (d.specs, phase 2),
// otherwise the Phase 1 generic shape from flight numbers. The 3D view is offered to rated discs only: an
// unrated record keeps the static illustration, as in Phase 1.
// Tapping the panel's viewer (or its Enlarge button) pops it out into a larger dialog: a second viewer from
// the same module, given the same props and pose, so model, materials and overmold colours match exactly.
// The panel's own viewer is left alone while the dialog is open and takes the dialog's pose back on close.
// Spin (docs/spin-color-default.md) travels with the pose, like the disc's angle.
// Clay mode (Prompt 4) is one setting for both: the Clay button in either viewer turns it on or off in both, a
// pop-out opens in the current mode, and it stays on from disc to disc until it is turned off.
(()=>{
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 const hasModel=d=>!!d&&(!!d.model3d||[d.speed,d.turn,d.fade].every(finite));
 // Mirrors measurementsFromSpecs in disc3d/shape.mjs (this script loads before the module does).
 const measured=d=>['Diameter','Height','Rim width','Rim depth'].every(k=>{const v=d?.specs?.[k];return (typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v))&&Number(v)>0;});
 let loading=null,viewer=null,failed=false,waiting=null,hand='RHBH',viewerModule=null,dialog=null,popout=null,clay=false;
 const coarse=()=>matchMedia('(pointer: coarse)').matches;

 // Theme colours arrive as CSS values (var(), hex, rgb); three.js wants something it can parse.
 function resolveColor(color){
  if(!color)return '#8a8f98';
  if(!/var\(/.test(color))return color;
  const probe=document.createElement('span');probe.style.color=color;probe.hidden=true;document.body.appendChild(probe);
  const value=getComputedStyle(probe).color;probe.remove();return value||'#8a8f98';
 }
 // The 3D host, or null when the disc has no model data (the caller keeps its static illustration).
 // The stage is data-sync-keep: the panel's DOM diff leaves it to the viewer.
 function markup(d,poster){
  if(!hasModel(d))return null;
  let caption=d.model3d?'3D illustration · a modelled mold profile, not a scan; generic stamp':measured(d)?'3D illustration · built from the PDGA dimensions, to scale; not a scan of the mold, generic stamp':'3D illustration · a generic shape from the flight numbers, not a measured mold or stamp';
  if(d.brand==='Discraft'&&d.stampAsset)caption=caption.replace('generic stamp','official Discraft stock stamp').replace('not a measured mold or stamp','not a measured mold; official Discraft stock stamp');
  return `<div class="disc-photo illustration-detail disc3d" data-disc3d><div class="disc3d-stage" data-sync-keep><div class="disc3d-poster">${poster}</div></div><span class="illustration-caption">${caption}</span></div>`;
 }
 function load(){
  return loading||=import('./disc3d/viewer.mjs').then(m=>{viewerModule=m;viewer=m.createDiscViewer({onExpand:openPopout,onClay:setClay,hint:`Drag to turn · Drag the rim to tilt · ${coarse()?'pinch':'scroll'} to zoom · ${coarse()?'tap':'click'} to enlarge`});return viewer;}).catch(err=>{failed=true;console.warn('3D disc viewer unavailable; keeping the illustration.',err);throw err;});
 }
 // `colors` {rim, plate} are optional overmold colours (bag colour choices later); without them the viewer
 // derives both from `color`. Whether a disc is an overmold is decided per record in disc3d/overmold.mjs.
 // `stampStyle`: the player's stamp appearance, passed only for their own disc (display customization).
 function sync(panel,d,{color,colors,plastic,finish,photoURL,texture_key,photo_rim_color,haloBand,haloModel,poster,stampStyle,hand:nextHand}={}){
  if(nextHand)hand=nextHand;
  const stage=panel?.querySelector('[data-disc3d] .disc3d-stage');
  if(!stage||!hasModel(d))return;
  const props={brand:d.brand,stampAsset:d.stampAsset,stampPlacement:d.stampPlacement,finish:finish||'opaque',photoURL,texture_key,photo_rim_color,haloBand:haloBand||null,haloModel:haloModel||null,model:d.model3d||null,specs:d.specs||null,flight:{speed:d.speed,turn:d.turn,fade:d.fade},mold:d.catalogName||d.name,color:resolveColor(color),plastic:plastic||'premium',hand,
   manufacturer:d.manufacturer,record:d.name,overmold:typeof d.overmold==='boolean'?d.overmold:undefined,
   colors:colors?{rim:colors.rim&&resolveColor(colors.rim),plate:colors.plate&&resolveColor(colors.plate)}:undefined,stampStyle:stampStyle||null};
  if(photoURL)panel.querySelector('.illustration-caption').textContent='Your photo · projected onto a representative 3D shape';
  if(failed){stage.dataset.state='fallback';if(poster&&stage.dataset.disc!==d.id)stage.querySelector('.disc3d-poster').innerHTML=poster;stage.dataset.disc=d.id;return;}
  // A hidden panel (the landing page warms it) waits until it is shown before loading anything.
  waiting?.disconnect();waiting=null;
  if(panel.hidden||!panel.isConnected){
   waiting=new MutationObserver(()=>{if(!panel.hidden){waiting.disconnect();waiting=null;sync(panel,d,{color,colors,plastic,finish,photoURL,texture_key,photo_rim_color,haloBand,haloModel,poster,stampStyle,hand});}});
   waiting.observe(panel,{attributes:true,attributeFilter:['hidden']});return;
  }
  stage.dataset.disc=d.id;if(!stage.dataset.state)stage.dataset.state='loading';
  load().then(v=>{
   if(stage.dataset.disc!==d.id||!stage.isConnected)return;
   v.attach(stage);v.update(props);stage.dataset.state='ready';
  },()=>{stage.dataset.state='fallback';if(poster)stage.querySelector('.disc3d-poster').innerHTML=poster;});
 }
 // The pop-out is a native modal <dialog>, like the site's others: the browser keeps focus inside it, closes
 // it on Escape and inerts the page behind. The viewer inside is built per opening and released on close.
 // It opens as a FLIP out of the panel's stage and closes by reversing that same animation (WAAPI, transform and
 // opacity), so it can be turned around at any moment from where it is; the panel's disc turns to the pose
 // the reader left across the exit. On a phone, a swipe down from the header dismisses it.
 const EASE='cubic-bezier(.16,1,.3,1)',MORPH_MS=320;
 const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function popoutDialog(){
  if(dialog)return dialog;
  dialog=document.createElement('dialog');dialog.className='disc3d-dialog';dialog.setAttribute('aria-labelledby','disc3dDialogTitle');
  dialog.innerHTML='<div class="disc3d-dialog-panel"><div class="disc3d-dialog-head"><div><div class="disc3d-dialog-eyebrow">3D VIEW</div><h2 id="disc3dDialogTitle"></h2></div><button type="button" class="close" data-disc3d-close aria-label="Close 3D view">×</button></div><div class="disc3d-dialog-body"></div><p class="illustration-caption disc3d-dialog-caption"></p></div>';
  // A click outside the panel lands on the dialog itself; one that began inside (a drag that ended over the
  // backdrop) must not close it.
  let pressedOutside=false;
  dialog.addEventListener('pointerdown',e=>{pressedOutside=e.target===dialog;});
  dialog.addEventListener('click',e=>{
   if(e.target.closest('[data-disc3d-close]')||e.target===dialog&&pressedOutside)requestClose();
   pressedOutside=false;
  });
  // Escape runs the same exit as the close button.
  dialog.addEventListener('cancel',e=>{e.preventDefault();requestClose();});
  dialog.addEventListener('close',closePopout);
  swipeToDismiss(dialog);
  document.body.appendChild(dialog);
  return dialog;
 }
 // Where the dialog starts: shrunk about a point chosen so its centre lands on the stage's centre (transform-origin
 // at the stage), at the scale that fits it inside the stage. Layout sizes, so a running animation cannot skew them.
 function morphFrames(dlg,stage){
  const w=dlg.offsetWidth,h=dlg.offsetHeight,left=dlg.offsetLeft,top=dlg.offsetTop,s=stage.getBoundingClientRect();
  const scale=Math.max(.05,Math.min(s.width/w,s.height/h,1)),cx=left+w/2,cy=top+h/2,sx=s.left+s.width/2,sy=s.top+s.height/2;
  const k=1-scale,ox=k>.02?(sx-scale*cx)/k:cx,oy=k>.02?(sy-scale*cy)/k:cy;
  dlg.style.transformOrigin=`${ox-left}px ${oy-top}px`;
  return [{transform:`scale(${scale})`,opacity:0},{opacity:1,offset:.45},{transform:'none',opacity:1}];
 }
// Reduced motion keeps the pop-out as a plain opacity fade: no travel, no scale.
 const CALM_MS=150,frames=(dlg,stage)=>calm()?[{opacity:0},{opacity:1}]:morphFrames(dlg,stage);
 // `trigger` is the element that was used (the Enlarge button or the canvas); focus returns to it on close.
 function openPopout(trigger){
  if(popout||!viewer?.state.props||!viewerModule)return;
  const props={...viewer.state.props,hand:viewer.state.hand},pose=viewer.getPose();
  // The pop-out takes the turntable with the pose; the panel's disc rests behind it and gets it back on close.
  viewer.setSpin(false,{instant:true});
  let big;
  try{big=viewerModule.createDiscViewer({segments:coarse()?72:128,onClay:setClay,hint:`Drag to turn · Drag the rim to tilt · ${coarse()?'pinch':'scroll'} to zoom`});}
  catch(err){console.warn('3D pop-out unavailable; keeping the panel viewer.',err);return;}
  const dlg=popoutDialog(),lock=lockScroll(),stage=viewer.element.closest('.disc3d-stage')||viewer.element;
  dlg.querySelector('#disc3dDialogTitle').textContent=props.mold||'Disc';
  dlg.querySelector('.disc3d-dialog-caption').textContent=viewer.element.closest('[data-disc3d]')?.querySelector('.illustration-caption')?.textContent||'';
  big.setClay(clay);big.update(props);
  const p=popout={viewer:big,trigger:trigger||document.activeElement,lock,stage,anim:null,closing:false,done:false};
  dlg.classList.remove('is-closing');
  // Held invisible until the morph starts, so the full-size dialog is never painted ahead of it.
  dlg.style.opacity='0';
  dlg.showModal();
  // Attach once the dialog is laid out so the first fit measures the real canvas, then start from the same pose.
  big.attach(dlg.querySelector('.disc3d-dialog-body'));big.applyPose(pose);
  big.element.querySelector('canvas').focus({preventScroll:true});
  // One frame first: the renderer's context, shaders and first draw (queued by attach) land before the morph.
  requestAnimationFrame(()=>{
   if(popout!==p||p.closing||!dlg.open)return;
   p.anim=dlg.animate(frames(dlg,stage),{duration:calm()?CALM_MS:MORPH_MS,easing:EASE,fill:'backwards'});
   dlg.style.opacity='';
  });
 }
 // The exit: the open animation reversed from wherever it is, the backdrop fading with it, the panel's disc
 // turning to the dialog's pose; the dialog closes when it ends.
 function requestClose(){
  const p=popout,dlg=dialog;if(!p||!dlg?.open||p.closing)return;
  if(!p.anim){dlg.close();return;}
  p.closing=true;dlg.classList.add('is-closing');
  if(p.anim.playState==='finished')p.anim.effect.setKeyframes(frames(dlg,p.stage));
  viewer?.glidePose(p.viewer.getPose(),MORPH_MS);
  p.anim.reverse();
  p.anim.onfinish=()=>{if(popout===p){p.done=true;dlg.close();}};
 }
 function closePopout(){
  const p=popout;if(!p)return;popout=null;
  p.anim?.cancel();p.swipeAnim?.cancel();
  if(dialog){dialog.classList.remove('is-closing');dialog.style.cssText='';}
  if(!p.done)viewer?.applyPose(p.viewer.getPose());
  p.viewer.dispose();p.lock();
  const back=p.trigger?.isConnected?p.trigger:viewer?.element.querySelector('canvas');
  back?.focus({preventScroll:true});
 }
 // Phones: drag the header down to dismiss. The gesture lives on the header only, so it never competes with
 // the canvas's own rotate; a release past ~22% of the screen, or a fling, finishes the exit from there,
 // anything less springs back.
 function swipeToDismiss(dlg){
  const head=dlg.querySelector('.disc3d-dialog-head');let swipe=null;
  head.addEventListener('pointerdown',e=>{
   const p=popout;
   if(!p||p.closing||p.anim?.playState==='running'||e.pointerType==='mouse'||!e.isPrimary||e.target.closest('button')||!matchMedia('(max-width:700px)').matches)return;
   swipe={id:e.pointerId,y0:e.clientY,t:e.timeStamp,y:e.clientY,v:0,dy:0};head.setPointerCapture(e.pointerId);
  });
  head.addEventListener('pointermove',e=>{
   if(!swipe||e.pointerId!==swipe.id)return;
   const dy=e.clientY-swipe.y0,dt=Math.max(1,e.timeStamp-swipe.t);
   swipe.v=swipe.v*.6+(e.clientY-swipe.y)/dt*.4;swipe.t=e.timeStamp;swipe.y=e.clientY;
   swipe.dy=dy>0?dy:dy*.15;   // pulling up meets resistance
   dlg.style.transform=`translateY(${swipe.dy}px)`;dlg.style.opacity=String(1-Math.min(.45,Math.max(0,swipe.dy)/innerHeight));
  });
  const release=e=>{
   if(!swipe||e.pointerId!==swipe.id)return;
   const {dy,v}=swipe,p=popout;swipe=null;
   if(!p)return;
   const from={transform:`translateY(${dy}px)`,opacity:dlg.style.opacity||'1'},dismiss=e.type==='pointerup'&&dy+v*180>Math.min(160,innerHeight*.22);
   dlg.style.transform='';dlg.style.opacity='';
   if(!dismiss){if(dy&&!calm())dlg.animate([from,{transform:'none',opacity:1}],{duration:300,easing:EASE});return;}
   p.closing=true;dlg.classList.add('is-closing');
   if(calm()){p.done=true;viewer?.applyPose(p.viewer.getPose());dlg.close();return;}
   viewer?.glidePose(p.viewer.getPose(),220);
   p.swipeAnim=dlg.animate([from,{transform:`translateY(${dy+(innerHeight-dy)*.5}px)`,opacity:0}],{duration:220,easing:'cubic-bezier(.4,0,1,1)',fill:'forwards'});
   p.swipeAnim.onfinish=()=>{if(popout===p){p.done=true;dlg.close();}};
  };
  head.addEventListener('pointerup',release);head.addEventListener('pointercancel',release);
 }
 // The page behind must not scroll under a touch or wheel on the backdrop; the scrollbar's width is kept.
 function lockScroll(){
  const root=document.documentElement,before={overflow:root.style.overflow,paddingRight:root.style.paddingRight};
  const bar=window.innerWidth-root.clientWidth;
  root.style.overflow='hidden';if(bar>0)root.style.paddingRight=bar+'px';
  return ()=>{root.style.overflow=before.overflow;root.style.paddingRight=before.paddingRight;};
 }
 function setHand(next){hand=next||'RHBH';viewer?.setHand(hand);popout?.viewer.setHand(hand);}
 function setClay(on){clay=!!on;viewer?.setClay(clay);popout?.viewer.setClay(clay);}
 window.Disc3D={hasModel,markup,sync,setHand,setClay,get clay(){return clay;},get viewer(){return viewer;},get popout(){return popout?.viewer||null;},get popoutAnimation(){return popout?.anim||null;},
  open:()=>openPopout(viewer?.element.querySelector('[data-disc3d-expand]')),close:()=>requestClose()};
})();
