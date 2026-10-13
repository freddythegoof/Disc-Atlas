// The detail panel's 3D disc (Plan 09). markup() decides 3D or the static illustration; sync() mounts the
// one shared viewer into the panel. three.js and the viewer load only when a disc with model data is
// shown in a visible panel, so the atlas's first paint never pays for them.
// Model data: explicit shape params on d.model3d, otherwise the mold's PDGA dimensions (d.specs, phase 2),
// otherwise the Phase 1 generic shape from flight numbers. The 3D view is offered to rated discs only: an
// unrated record keeps the static illustration, as in Phase 1.
// Tapping the panel's viewer (or its Enlarge button) pops it out into a larger dialog: a second viewer from
// the same module, given the same props and pose, so model, materials and overmold colours match exactly.
// The panel's own viewer is left alone while the dialog is open and takes the dialog's pose back on close.
(()=>{
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 const hasModel=d=>!!d&&(!!d.model3d||[d.speed,d.turn,d.fade].every(finite));
 // Mirrors measurementsFromSpecs in disc3d/shape.mjs (this script loads before the module does).
 const measured=d=>['Diameter','Height','Rim width','Rim depth'].every(k=>{const v=d?.specs?.[k];return (typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v))&&Number(v)>0;});
 let loading=null,viewer=null,failed=false,waiting=null,hand='RHBH',viewerModule=null,dialog=null,popout=null;
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
  return `<div class="disc-photo illustration-detail disc3d" data-disc3d><div class="disc3d-stage" data-sync-keep><div class="disc3d-poster">${poster}</div></div><span class="illustration-caption">${d.model3d?'3D illustration · a modelled mold profile, not a scan; generic stamp':measured(d)?'3D illustration · built from the PDGA dimensions, to scale; not a scan of the mold, generic stamp':'3D illustration · a generic shape from the flight numbers, not a measured mold or stamp'}</span></div>`;
 }
 function load(){
  return loading||=import('./disc3d/viewer.mjs').then(m=>{viewerModule=m;viewer=m.createDiscViewer({onExpand:openPopout,hint:`Drag to turn · ${coarse()?'pinch':'scroll'} to zoom · ${coarse()?'tap':'click'} to enlarge`});return viewer;}).catch(err=>{failed=true;console.warn('3D disc viewer unavailable; keeping the illustration.',err);throw err;});
 }
 // `colors` {rim, plate} are optional overmold colours (bag colour choices later); without them the viewer
 // derives both from `color`. Whether a disc is an overmold is decided per record in disc3d/overmold.mjs.
 function sync(panel,d,{color,colors,plastic,poster,hand:nextHand}={}){
  if(nextHand)hand=nextHand;
  const stage=panel?.querySelector('[data-disc3d] .disc3d-stage');
  if(!stage||!hasModel(d))return;
  const props={model:d.model3d||null,specs:d.specs||null,flight:{speed:d.speed,turn:d.turn,fade:d.fade},mold:d.catalogName||d.name,color:resolveColor(color),plastic:plastic||'premium',hand,
   manufacturer:d.manufacturer,record:d.name,overmold:typeof d.overmold==='boolean'?d.overmold:undefined,
   colors:colors?{rim:colors.rim&&resolveColor(colors.rim),plate:colors.plate&&resolveColor(colors.plate)}:undefined};
  if(failed){stage.dataset.state='fallback';if(poster&&stage.dataset.disc!==d.id)stage.querySelector('.disc3d-poster').innerHTML=poster;stage.dataset.disc=d.id;return;}
  // A hidden panel (the landing page warms it) waits until it is shown before loading anything.
  waiting?.disconnect();waiting=null;
  if(panel.hidden||!panel.isConnected){
   waiting=new MutationObserver(()=>{if(!panel.hidden){waiting.disconnect();waiting=null;sync(panel,d,{color,colors,plastic,poster,hand});}});
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
 function popoutDialog(){
  if(dialog)return dialog;
  dialog=document.createElement('dialog');dialog.className='disc3d-dialog';dialog.setAttribute('aria-labelledby','disc3dDialogTitle');
  dialog.innerHTML='<div class="disc3d-dialog-panel"><div class="disc3d-dialog-head"><div><div class="disc3d-dialog-eyebrow">3D VIEW</div><h2 id="disc3dDialogTitle"></h2></div><button type="button" class="close" data-disc3d-close aria-label="Close 3D view">×</button></div><div class="disc3d-dialog-body"></div><p class="illustration-caption disc3d-dialog-caption"></p></div>';
  // A click outside the panel lands on the dialog itself; one that began inside (a drag that ended over the
  // backdrop) must not close it.
  let pressedOutside=false;
  dialog.addEventListener('pointerdown',e=>{pressedOutside=e.target===dialog;});
  dialog.addEventListener('click',e=>{
   if(e.target.closest('[data-disc3d-close]')||e.target===dialog&&pressedOutside)dialog.close();
   pressedOutside=false;
  });
  dialog.addEventListener('close',closePopout);
  document.body.appendChild(dialog);
  return dialog;
 }
 // `trigger` is the element that was used (the Enlarge button or the canvas); focus returns to it on close.
 function openPopout(trigger){
  if(popout||!viewer?.state.props||!viewerModule)return;
  const props={...viewer.state.props,hand:viewer.state.hand},pose=viewer.getPose();
  let big;
  try{big=viewerModule.createDiscViewer({segments:coarse()?72:128,hint:`Drag to turn · ${coarse()?'pinch':'scroll'} to zoom`});}
  catch(err){console.warn('3D pop-out unavailable; keeping the panel viewer.',err);return;}
  const dlg=popoutDialog(),lock=lockScroll();
  dlg.querySelector('#disc3dDialogTitle').textContent=props.mold||'Disc';
  dlg.querySelector('.disc3d-dialog-caption').textContent=viewer.element.closest('[data-disc3d]')?.querySelector('.illustration-caption')?.textContent||'';
  big.update(props);
  popout={viewer:big,trigger:trigger||document.activeElement,lock};
  dlg.showModal();
  // Attach once the dialog is laid out so the first fit measures the real canvas, then start from the same pose.
  big.attach(dlg.querySelector('.disc3d-dialog-body'));big.applyPose(pose);
  big.element.querySelector('canvas').focus({preventScroll:true});
 }
 function closePopout(){
  const p=popout;if(!p)return;popout=null;
  viewer?.applyPose(p.viewer.getPose());
  p.viewer.dispose();p.lock();
  const back=p.trigger?.isConnected?p.trigger:viewer?.element.querySelector('canvas');
  back?.focus({preventScroll:true});
 }
 // The page behind must not scroll under a touch or wheel on the backdrop; the scrollbar's width is kept.
 function lockScroll(){
  const root=document.documentElement,before={overflow:root.style.overflow,paddingRight:root.style.paddingRight};
  const bar=window.innerWidth-root.clientWidth;
  root.style.overflow='hidden';if(bar>0)root.style.paddingRight=bar+'px';
  return ()=>{root.style.overflow=before.overflow;root.style.paddingRight=before.paddingRight;};
 }
 function setHand(next){hand=next||'RHBH';viewer?.setHand(hand);popout?.viewer.setHand(hand);}
 window.Disc3D={hasModel,markup,sync,setHand,get viewer(){return viewer;},get popout(){return popout?.viewer||null;},
  open:()=>openPopout(viewer?.element.querySelector('[data-disc3d-expand]')),close:()=>dialog?.open&&dialog.close()};
})();
