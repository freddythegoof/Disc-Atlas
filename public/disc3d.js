// The detail panel's 3D disc (Plan 09). markup() decides 3D or the static illustration; sync() mounts the
// one shared viewer into the panel. three.js and the viewer load only when a disc with model data is
// shown in a visible panel, so the atlas's first paint never pays for them.
// Model data: explicit shape params on d.model3d, otherwise the mold's PDGA dimensions (d.specs, phase 2),
// otherwise the Phase 1 generic shape from flight numbers. The 3D view is offered to rated discs only: an
// unrated record keeps the static illustration, as in Phase 1.
(()=>{
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 const hasModel=d=>!!d&&(!!d.model3d||[d.speed,d.turn,d.fade].every(finite));
 // Mirrors measurementsFromSpecs in disc3d/shape.mjs (this script loads before the module does).
 const measured=d=>['Diameter','Height','Rim width','Rim depth'].every(k=>{const v=d?.specs?.[k];return (typeof v==='number'||typeof v==='string'&&v.trim()!=='')&&Number.isFinite(Number(v))&&Number(v)>0;});
 let loading=null,viewer=null,failed=false,waiting=null,hand='RHBH';

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
  return loading||=import('./disc3d/viewer.mjs').then(m=>{viewer=m.createDiscViewer();return viewer;}).catch(err=>{failed=true;console.warn('3D disc viewer unavailable; keeping the illustration.',err);throw err;});
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
 function setHand(next){hand=next||'RHBH';viewer?.setHand(hand);}
 window.Disc3D={hasModel,markup,sync,setHand,get viewer(){return viewer;}};
})();
