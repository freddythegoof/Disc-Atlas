import {bagSlots,wearLabel,stabilityBiasLabel,pocketLabel} from './bag-values.js';

export const BAG_SPRING='cubic-bezier(.2,1.35,.35,1)';
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
// three.js and the bag model (~2.6 MB) load only when the bag is first shown.
const loadViewer=()=>import('./bag3d/viewer.mjs');
const accent=()=>getComputedStyle(document.documentElement).getPropertyValue('--lime').trim()||null;
const DEFAULT_BAG='#343c49';
// Each zoom button step (the viewer allows 1× to its maxZoom).
const ZOOM_STEP=1.4;
const POCKET={main:'main',putter:'putter',goTo:'goto'};
// The Stitch grid's pitch (stitch.css): the bag's map grid lines up with the page's.
const GRID=48;
// An out disc's name: px between it and its disc, and the room kept around it (so names never touch).
const NAME_GAP=6,NAME_SPACE=4;
const div=(className,attributes={})=>{const node=document.createElement('div');node.className=className;for(const [key,value]of Object.entries(attributes))node.setAttribute(key,value);return node;};

// The 3D bag renders in a canvas. A matching layer of positioned slot elements carries
// focus, hover/touch targets and labels, so keyboard and screen-reader use stay intact.
export class BagScene {
 constructor(root,{lookup,inspect,deselect}){
  this.root=root;this.lookup=lookup;this.inspect=inspect;this.deselect=deselect;this.open=false;this.ready=false;this.running=false;this.key='';this.epoch=0;this.top=false;this.stageToken=0;
  // Out discs (item ids, in the order they came out) stay out until they are clicked again.
  // `inspected` is the disc whose details the bag opened.
  this.out=[];this.inspected=null;
  this.toggle=root.querySelector('[data-bag-toggle]');this.info=root.querySelector('[data-bag-lift-info]');this.canvas=root.querySelector('[data-bag-canvas]');
  this.topToggle=root.querySelector('[data-bag-top-view]');
  this.toggle.addEventListener('click',()=>void this.setOpen(!this.open));
  this.topToggle.addEventListener('click',()=>void this.setTopView(!this.top));
  this.stage=div('bag-3d-stage');this.layer=div('bag-hit-layer',{role:'group','aria-label':'Your disc golf bag'});this.status=div('bag-3d-status',{role:'status'});
  // Hovering (or focusing) a disc shows only its name; the disc itself stays put.
  this.tag=div('bag-name-pill bag-hover-name',{'aria-hidden':'true'});this.tag.hidden=true;
  // Each out disc carries its name under it.
  this.names=div('bag-out-names',{'aria-hidden':'true'});this.nameById=new Map();
  // Six or more out discs spread evenly on a ring around the bag, drawn on the Stitch grid. The
  // ring runs clockwise from the most understable (lower left) to the most overstable (lower right).
  this.mapGrid=div('bag-map-grid',{'aria-hidden':'true'});
  for(const [side,text] of [['left','← More turn'],['right','Stronger fade →']]){const caption=document.createElement('span');caption.className='bag-map-caption';caption.dataset.side=side;caption.textContent=text;this.mapGrid.append(caption);}
  this.pockets=div('bag-pocket-labels',{'aria-hidden':'true'});
  // Zoom: these buttons, a pinch, or Ctrl/⌘ + scroll (a plain scroll keeps scrolling the page).
  this.zoomControls=div('bag-zoom',{role:'group','aria-label':'Zoom the bag'});
  const zoomButton=(label,text,action)=>{const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',label);button.textContent=text;button.addEventListener('click',action);return button;};
  this.zoomOut=zoomButton('Zoom out','−',()=>this.zoomBy(1/ZOOM_STEP));this.zoomReset=zoomButton('Reset zoom','100%',()=>this.zoomTo(1));this.zoomIn=zoomButton('Zoom in','+',()=>this.zoomBy(ZOOM_STEP));
  this.zoomReset.className='bag-zoom-level';this.zoomControls.append(this.zoomOut,this.zoomReset,this.zoomIn);
  // Return all: shown while any disc is out (top left, across from zoom); every out disc slides back in at once.
  this.returnAll=document.createElement('button');this.returnAll.type='button';this.returnAll.className='bag-return-all';this.returnAll.hidden=true;
  this.returnAll.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 2.5 7 6 10.5"/><path d="M2.5 7h7a4 4 0 0 1 0 8h-2"/></svg><span>Return all</span><b data-return-count></b>';
  this.returnAll.addEventListener('click',()=>void this.returnAllOut());
  this.canvas.replaceChildren(this.mapGrid,this.stage,this.pockets,this.names,this.layer,this.tag,this.zoomControls,this.returnAll,this.status);
  this.canvas.addEventListener('wheel',event=>{
   if(!this.ready || !(event.ctrlKey || event.metaKey))return;event.preventDefault();
   const box=this.canvas.getBoundingClientRect(),delta=Math.max(-100,Math.min(100,event.deltaY*(event.deltaMode===1?16:1)));
   this.viewer.setZoom(this.viewer.zoom*Math.exp(-delta*.01),{anchor:{x:event.clientX-box.left,y:event.clientY-box.top},instant:true});
  },{passive:false});
  const touches=new Map();let pinch=null;
  this.canvas.addEventListener('pointerdown',event=>{
   if(event.pointerType!=='touch')return;touches.set(event.pointerId,{x:event.clientX,y:event.clientY});
   if(touches.size!==2 || !this.ready)return;
   // Two fingers pinch-zoom; the turn that the first finger may have started is dropped.
   this.viewer.cancelPress();this.clearLift();const [a,b]=[...touches.values()];pinch={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),zoom:this.viewer.zoom};
  });
  this.canvas.addEventListener('pointermove',event=>{
   if(!touches.has(event.pointerId))return;touches.set(event.pointerId,{x:event.clientX,y:event.clientY});if(!pinch || touches.size<2)return;
   const [a,b]=[...touches.values()],box=this.canvas.getBoundingClientRect();
   this.viewer.setZoom(pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/pinch.distance,{anchor:{x:(a.x+b.x)/2-box.left,y:(a.y+b.y)/2-box.top},instant:true});
  });
  for(const type of ['pointerup','pointercancel'])this.canvas.addEventListener(type,event=>{touches.delete(event.pointerId);if(touches.size<2)pinch=null;});
  // Clicking empty space closes the details the bag opened; out discs stay out. Clicks on the
  // details panel, dialogs or a disc do not count (a disc's own click toggles it).
  document.addEventListener('pointerdown',event=>{
   this.swallowClick=false;
   if(!this.detailOpen() || event.target.closest?.('#detail,dialog,[popover],[data-physical-disc],[data-out-name]'))return;
   this.swallowClick=this.stage.contains(event.target);this.closeDetails();
  },true);
  // Escape closes the details the bag opened (focus returns to that disc); with none open, it
  // leaves the top view. Out discs stay out either way.
  document.addEventListener('keydown',event=>{
   if(event.key!=='Escape' || !this.ready || !this.root.checkVisibility() || document.querySelector('dialog[open],:popover-open'))return;
   if(this.detailOpen()){event.preventDefault();event.stopPropagation();const disc=this.discFor(this.inspected);this.closeDetails();(disc && this.reachable(disc)?disc:this.toggle).focus({preventScroll:true});return;}
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
    // The bag starts closed, so its putters start stowed in the top pocket.
    const viewer=await mountBag(this.stage,{background:'transparent',interaction:'turntable',turn:false,view:'page',contactShadow:true,
     animated:!reduced(),accentColor:accent(),compartmentDuration:.75,maxPixels:2.4e6,ambientFps:30,quality:'auto',toneMapping:'neutral',puttersOut:this.open,
     ...(this.data?{layout:this.slots(this.data).layout,bagColor:this.bagColor(this.data.settings)}:{})});
    this.viewer=viewer;
    // The hit layer and the list carry the content; the canvas itself is decorative.
    this.stage.querySelector('canvas').setAttribute('aria-hidden','true');
    // Exposed for QA scripts that verify the rendered state matches the saved bag.
    Object.defineProperty(this.canvas,'bagViewer',{value:viewer,configurable:true});
    this.stage.addEventListener('bagviewlayout',()=>this.place());
    // A click that only closed the details leaves the flap alone.
    this.stage.addEventListener('bagclick',()=>{if(this.swallowClick){this.swallowClick=false;return;}void this.setOpen(!this.open);});
    // The bag stays turned where the user leaves it; targets and labels follow once the drag ends.
    this.stage.addEventListener('bagdragstart',()=>{this.clearLift();this.root.dataset.dragging='';});
    this.stage.addEventListener('bagdragend',()=>{delete this.root.dataset.dragging;this.interactive(!this.running);});
    this.stage.addEventListener('bagviewererror',event=>{this.status.textContent=event.detail;});
    this.stage.addEventListener('bagzoom',event=>this.showZoom(event.detail.zoom));
    this.ready=true;this.status.textContent='';this.root.dataset.engine='ready';this.showZoom(viewer.zoom);
    // The map's frame follows the canvas size.
    new ResizeObserver(()=>{if(this.out.length)void this.stageOut();}).observe(this.canvas);
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
  this.clearLift();const {items,settings}=this.data,{slots,layout}=this.slots(this.data);this.items=items;
  // The default charcoal keeps the model's original tonal fabric.
  this.viewer.setBagColor(this.bagColor(settings));this.root.dataset.bagColor=this.viewer.bagColor;
  this.viewer.setBagLayout(layout);
  const clipped=this.viewer.clipped,extra=slots.overflow.length+clipped.main+clipped.putter+clipped.goTo;
  this.root.querySelector('[data-bag-overflow]').textContent=extra?`${extra} more ${extra===1?'disc':'discs'} listed below · beyond the illustrated slots`:'';
  const byId=new Map(items.map(item=>[item.id,item])),rects=this.viewer.discRects();
  // Out discs stay out through a redraw; a disc that left the bag (or its illustrated slots) drops out.
  this.out=this.out.filter(id=>rects.some(rect=>rect.key===id && !rect.empty));
  if(this.inspected && !this.out.includes(this.inspected))this.inspected=null;
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
   const disc=div('bag-physical-disc',{'data-physical-disc':item.id,'data-pocket':pocket,'data-slot-order':tabOrder.get(rect.key),role:'button',tabindex:'-1','aria-describedby':'bagLiftInfo'});
   disc.bagItem=item;disc.bagTitle=title;this.label(disc);
   disc.style.setProperty('--disc-color',item.color||'#e6c668');
   // Touch has no hover: a tap is a click.
   disc.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')this.lift(disc,item,title);});
   disc.addEventListener('pointerleave',()=>{if(document.activeElement!==disc)this.settle(disc);});
   disc.addEventListener('focus',()=>this.lift(disc,item,title));disc.addEventListener('blur',()=>this.settle(disc));
   disc.addEventListener('keydown',event=>{
    if(event.key==='Tab'){event.preventDefault();this.tabFrom(disc,event.shiftKey);}
    if(event.key==='Enter'||event.key===' '){event.preventDefault();void this.toggleOut(disc);}
    if(event.key==='Escape'){this.settle(disc);this.toggle.focus();}
   });
   // One click (or tap) slides the disc out and opens its details; the next puts it back.
   this.onTap(disc,()=>void this.toggleOut(disc));
   slot.append(disc);
  }
  this.names.replaceChildren();this.nameById.clear();
  this.place();this.interactive(!this.running);void this.stageOut();
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
 // (front facing back), and in the top view, only the top pocket's putters are in reach.
 // Out discs rest in front of the room, so they stay in reach while the bag is closed or turned.
 reachable(disc){
  if(!this.ready || this.running)return false;
  const pocket=disc.dataset.pocket;if(this.top)return pocket==='putter';
  return this.out.includes(disc.dataset.physicalDisc) || ((this.open || pocket!=='main') && (pocket==='putter' || this.viewer.frontFacing));
 }
 label(disc){
  const item=disc.bagItem,out=this.out.includes(item.id);disc.setAttribute('aria-pressed',String(out));
  disc.setAttribute('aria-label',`${disc.bagTitle}, ${item.plastic}, wear ${item.wear} of 10, ${item.weight_g} grams, ${pocketLabel(item.pocket)}. ${out?'Out of the bag. Enter to put it back.':'Enter to slide it out.'}`);
 }
 discFor(id){return id?this.layer.querySelector(`[data-physical-disc="${CSS.escape(id)}"]`):null;}
 interactive(on){
  for(const disc of this.layer.querySelectorAll('[data-physical-disc]')){const ok=on && this.reachable(disc);disc.setAttribute('tabindex',ok?'0':'-1');disc.setAttribute('aria-hidden',String(!ok));}
 }
 place(){
  if(!this.viewer || !this.slotsByKey)return;
  for(const rect of this.viewer.discRects()){
   const slot=this.slotsByKey.get(rect.key);if(!slot)continue;
   Object.assign(slot.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
   slot.dataset.shape=rect.shape;if(rect.out)slot.dataset.out='';else delete slot.dataset.out;
  }
  this.placeNames();this.placePockets();this.placeGrid();if(this.lifted && !this.tag.hidden)this.placeTag(this.lifted);
 }
 // A click toggles one disc: in its pocket, it slides out and its details open; out, it goes
 // back (closing its details if they show). Every disc is independent and stays out until
 // clicked again. Up to five rest beside the bag; six or more lay out on a map around it.
 async toggleOut(disc){
  if(!this.reachable(disc) || this.viewer.cameraMoving)return;
  const item=disc.bagItem,id=item.id,index=this.out.indexOf(id);this.clearLift();
  if(index>=0){this.out.splice(index,1);if(this.inspected===id)this.closeDetails();}
  else{this.out.push(id);this.inspected=id;this.inspect(this.lookup(item.mold_id),item);}
  this.label(disc);
  const settled=this.stageOut();
  // On phones the details are a bottom sheet: scroll the page so the disc rests above it.
  if(index<0)this.keepAboveSheet(id);
  await settled;
 }
 // Return all: every out disc slides back into its pocket at once (closing the details the bag
 // opened); focus moves to the bag's toggle, as the button itself goes away.
 async returnAllOut(){
  if(!this.ready || this.running || !this.out.length || this.viewer.cameraMoving)return;
  const focused=this.returnAll.contains(document.activeElement);this.clearLift();
  if(this.inspected)this.closeDetails();this.out=[];
  const settled=this.stageOut();
  if(focused)this.toggle.focus({preventScroll:true});
  await settled;
 }
 // Stages every out disc in the viewer: their Atlas positions order them (stability, and speed
 // beside the bag), each with room for its name; the zoom buttons, the return button and the
 // map's captions stay clear. Resolves true once this staging settles.
 stageOut({instant=reduced()}={}){
  if(!this.ready || !this.items)return Promise.resolve(false);
  this.showReturnAll();
  const token=++this.stageToken,atlas=new Map();
  for(const id of this.out){
   const item=this.items.find(i=>i.id===id),mold=item && this.lookup(item.mold_id);
   atlas.set(id,mold && window.AtlasLayout?.positions([mold]).get(mold.id) || null);
  }
  // Names take the coming mode's style before they are measured.
  const coming=this.viewer.stageMode(this.out.length);
  if(coming){this.root.dataset.stage=coming;this.root.dataset.out=String(this.out.length);}else{delete this.root.dataset.stage;delete this.root.dataset.out;}
  // Each name's room, in the coming mode's style and (for a crowd on the ring) the compact one.
  const measure=()=>new Map(this.out.map(id=>{const node=this.nameNode(id);node.hidden=false;return [id,{width:node.offsetWidth+2*NAME_SPACE,height:node.offsetHeight+NAME_GAP+NAME_SPACE}];}));
  delete this.root.dataset.names;const labels=measure();let compact=null;
  if(coming==='map'){this.root.dataset.names='compact';compact=measure();delete this.root.dataset.names;}
  const box=this.canvas.getBoundingClientRect(),zoom=this.zoomControls.getBoundingClientRect();
  const reserve=zoom.width && box.width?{width:(box.right-zoom.left+6)/box.width,height:(zoom.bottom-box.top+6)/box.height}:{width:0,height:0};
  const clear=box.width?[...this.captionBoxes(),...this.returnBoxes()].map(c=>({left:c.left/box.width,top:c.top/box.height,right:c.right/box.width,bottom:c.bottom/box.height})):[];
  const motion=this.viewer.stageDiscs(this.out,{atlas,labels,compact,reserve,clear,instant}),mode=this.viewer.stage.mode,names=this.viewer.stage.names;
  if(names==='full')delete this.root.dataset.names;else this.root.dataset.names=names;
  if(mode!==coming){if(mode){this.root.dataset.stage=mode;this.root.dataset.out=String(this.viewer.outDiscs.length);}else{delete this.root.dataset.stage;delete this.root.dataset.out;}}
  this.root.dataset.staging='moving';
  for(const disc of this.layer.querySelectorAll('[data-physical-disc]'))this.label(disc);
  this.place();this.interactive(!this.running);
  return motion.then(()=>{
   if(token!==this.stageToken)return false;
   this.root.dataset.staging='still';this.place();return true;
  });
 }
 // The map's axis captions (canvas px, a little room around each) while the map shows; names and discs keep off them.
 captionBoxes(){
  if(this.root.dataset.stage!=='map')return [];
  const box=this.canvas.getBoundingClientRect();
  return [...this.mapGrid.querySelectorAll('.bag-map-caption')].map(n=>n.getBoundingClientRect()).filter(r=>r.width)
   .map(r=>({left:r.left-box.left-6,top:r.top-box.top-6,right:r.right-box.left+6,bottom:r.bottom-box.top+6}));
 }
 // The return button (canvas px, a little room around it) while it shows; discs and names keep off it.
 returnBoxes(){
  if(this.returnAll.hidden)return [];
  const box=this.canvas.getBoundingClientRect(),r=this.returnAll.getBoundingClientRect();
  return r.width?[{left:r.left-box.left-6,top:r.top-box.top-6,right:r.right-box.left+6,bottom:r.bottom-box.top+6}]:[];
 }
 showReturnAll(){
  const count=this.out.length;this.returnAll.hidden=!count;
  if(count){this.returnAll.querySelector('[data-return-count]').textContent=String(count);this.returnAll.setAttribute('aria-label',`Return all ${count} out ${count===1?'disc':'discs'} to the bag`);}
 }
 // An out disc's name (made on first use). Clicking it reopens the disc's details (the disc itself toggles).
 nameNode(id){
  let node=this.nameById.get(id);
  if(node)return node;
  const item=this.items.find(i=>i.id===id),mold=item && this.lookup(item.mold_id);
  node=div('bag-name-pill bag-out-name',{'data-out-name':id});node.textContent=mold?.catalogName || mold?.name || 'Saved disc';
  node.addEventListener('click',()=>{if(!item || !this.out.includes(id))return;this.inspected=id;this.inspect(mold,item);});
  this.names.append(node);this.nameById.set(id,node);
  return node;
 }
 detailOpen(){const panel=document.querySelector('#detail');return !!this.inspected && !!panel && !panel.hidden;}
 closeDetails(){const id=this.inspected;this.inspected=null;if(id)this.deselect?.(this.items?.find(i=>i.id===id));}
 // My Bag hands the details panel elsewhere (leaving the page, My Map): the bag forgets it opened them.
 release(){this.inspected=null;}
 keepAboveSheet(id){
  const panel=document.querySelector('#detail'),rect=this.viewer?.outRect(id);
  if(!panel || panel.hidden || !rect || !matchMedia('(max-width:700px)').matches)return;
  const box=this.canvas.getBoundingClientRect(),sheetTop=innerHeight-panel.offsetHeight,top=box.top+rect.top,bottom=top+rect.height+40;
  const by=Math.min(bottom-(sheetTop-8),top-8);
  if(by>0)scrollBy({top:by,behavior:reduced()?'instant':'smooth'});
 }
 // Every out disc shows its name, beside the bag and on the map. The layout leaves room under each
 // disc, so a name sits there, centered; where that spot is taken (zoomed in, an odd size), it
 // tries under the disc's outer edge, above it, then beside it, and takes the first spot clear of
 // the bag, every disc, every placed name, the zoom buttons and the map's captions (or, failing
 // all, the one that covers least). A disc zoomed out of the canvas has no name.
 placeNames(){
  if(!this.viewer || !this.items)return;
  const rects=new Map(this.viewer.discRects().filter(rect=>rect.out).map(rect=>[rect.key,rect]));
  for(const [id,node] of this.nameById)if(!rects.has(id)){node.remove();this.nameById.delete(id);}
  const width=this.canvas.clientWidth,height=this.canvas.clientHeight,canvas=this.canvas.getBoundingClientRect();
  const edges=rect=>({key:rect.key,left:rect.left,top:rect.top,right:rect.left+rect.width,bottom:rect.top+rect.height});
  const zoom=this.zoomControls.getBoundingClientRect(),bag=this.viewer.bagRect();
  const taken=[...[...rects.values()].map(edges),...(bag?[edges(bag)]:[]),...this.captionBoxes(),...this.returnBoxes(),
   ...(zoom.width?[{left:zoom.left-canvas.left-4,top:zoom.top-canvas.top-4,right:zoom.right-canvas.left+4,bottom:zoom.bottom-canvas.top+4}]:[])];
  const covered=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  const centerX=width/2;
  for(const id of this.out){
   const rect=rects.get(id),node=this.nameNode(id);
   const cx=rect && rect.left+rect.width/2,cy=rect && rect.top+rect.height/2;
   // A crowd too big for names on the ring shows them on hover and focus only.
   if(!rect || cx<0 || cx>width || cy<0 || cy>height || this.root.dataset.names==='none'){node.hidden=true;delete node.dataset.shown;continue;}
   node.hidden=false;
   const w=node.offsetWidth,h=node.offsetHeight,out=cx<centerX?-1:1,bottom=rect.top+rect.height;
   const spots=[[cx,bottom+NAME_GAP],[cx+out*Math.max(0,(w-rect.width)/2),bottom+NAME_GAP],[cx,rect.top-NAME_GAP-h],
    [rect.left+rect.width+NAME_GAP+w/2,cy-h/2],[rect.left-NAME_GAP-w/2,cy-h/2]];
   let best=null;
   for(const [sx,sy] of spots){
    const x=Math.min(width-w/2-4,Math.max(w/2+4,sx)),top=Math.min(height-h-4,Math.max(4,sy));
    const box={left:x-w/2,right:x+w/2,top,bottom:top+h};
    const cost=taken.reduce((sum,other)=>other.key===id?sum:sum+covered(box,other),0);
    if(!best || cost<best.cost)best={x,top,box,cost};
    if(!cost)break;
   }
   node.dataset.shown='';taken.push({key:id,...best.box});
   Object.assign(node.style,{left:best.x+'px',top:best.top+'px'});
  }
  this.names.replaceChildren(...this.out.map(id=>this.nameById.get(id)).filter(Boolean));
  if(this.lifted && this.nameById.get(this.lifted.dataset.physicalDisc)?.dataset.shown!==undefined)this.tag.hidden=true;
 }
 // The bag's map grid lines up with the page's Stitch grid.
 placeGrid(){
  const box=this.canvas.getBoundingClientRect(),x=-((box.left+scrollX)%GRID),y=-((box.top+scrollY)%GRID);
  this.mapGrid.style.setProperty('--grid-x',x+'px');this.mapGrid.style.setProperty('--grid-y',y+'px');
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
  this.top=on;this.clearLift();this.interactive(false);
  this.topToggle.setAttribute('aria-pressed',String(on));this.root.dataset.camera='moving';
  const view=await this.viewer.setTopView(on,{instant:reduced()});
  if(view!==this.top)return;
  this.root.dataset.camera=on?'top':'front';this.place();this.interactive(!this.running);
 }
 zoomBy(factor){if(this.ready)this.zoomTo(this.viewer.zoom*factor);}
 zoomTo(value){if(this.ready){this.clearLift();this.viewer.setZoom(value,{instant:reduced()});}}
 showZoom(zoom){
  const percent=Math.round(zoom*100)+'%';this.zoomReset.textContent=percent;this.zoomReset.setAttribute('aria-label',`Reset zoom (now ${percent})`);
  this.zoomReset.disabled=zoom<=1.001;this.zoomOut.disabled=zoom<=1.001;this.zoomIn.disabled=zoom>=this.viewer.maxZoom-.001;this.root.dataset.zoomed=String(zoom>1.001);
 }
 // Top view looks into the putter pocket, named with the putters it holds.
 placePockets(){
  if(!this.top || !this.viewer || !this.items){this.pockets.replaceChildren();return;}
  const rects=this.viewer.pocketRects(),names={putter:[]};
  for(const item of this.items)if(item.in_bag!==false)names[item.pocket]?.push(this.lookup(item.mold_id)?.catalogName || this.lookup(item.mold_id)?.name || 'Saved disc');
  const labels=[['putter','Top pocket · Putters',rects.putter]];
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
  this.lifted=disc;disc.classList.add('is-hovered');this.root.dataset.hovered='';this.viewer.glowDisc(disc.dataset.physicalDisc,{instant:reduced()});
  this.tag.textContent=title;this.tag.style.setProperty('--disc-color',item.color||'#e6c668');
  // An out disc whose name already shows needs no hover name.
  this.tag.hidden=this.nameById.get(item.id)?.dataset.shown!==undefined;if(!this.tag.hidden)this.placeTag(disc);
  this.info.querySelector('strong').textContent=title;this.info.querySelector('span').textContent=`${item.plastic} · ${item.wear}/10 ${wearLabel(item.wear)} · ${item.weight_g} g · ${pocketLabel(item.pocket)}`;
  const note=this.info.querySelector('[data-lift-note]'),bias=this.info.querySelector('[data-lift-bias]');
  note.textContent=item.notes || '';note.hidden=!item.notes;
  bias.textContent=stabilityBiasLabel(item.stability_bias);bias.hidden=!bias.textContent;
  this.info.dataset.pocket=disc.dataset.pocket;this.info.dataset.visible='true';this.info.setAttribute('aria-hidden','false');
 }
 settle(disc){
  disc.classList.remove('is-hovered');
  if(this.lifted===disc){this.lifted=null;delete this.root.dataset.hovered;this.tag.hidden=true;this.info.dataset.visible='false';this.info.setAttribute('aria-hidden','true');this.viewer?.glowDisc(null,{instant:reduced()});}
 }
 clearLift(){if(this.lifted)this.settle(this.lifted);this.tag.hidden=true;this.info.dataset.visible='false';this.info.setAttribute('aria-hidden','true');if(this.viewer?.glowingDisc)this.viewer.glowDisc(null,{instant:reduced()});}
 async reveal(){this.visible=true;await this.load();if(this.revealed||!this.ready||this.open||this.running||!this.visible)return;this.revealed=true;void this.setOpen(true);}
 async setOpen(open){
  if(!this.ready||this.running||open===this.open)return;const epoch=++this.epoch;this.running=true;this.clearLift();this.toggle.setAttribute('aria-disabled','true');
  this.root.dataset.phase=open?'opening':'closing';this.interactive(false);
  // The flap and the putters move together: closed, the putters stow in the top pocket;
  // open, they come back out into their row. The flap sets the pace (the putters' wave is no
  // longer), so a slow frame delaying the putters' timer never holds up the bag's state.
  void this.viewer.setPuttersOut(open,{instant:reduced()});await this.viewer.setCompartmentOpen(open,{instant:reduced()});
  if(epoch!==this.epoch)return;this.open=open;this.running=false;this.root.dataset.phase=open?'open':'closed';
  this.toggle.removeAttribute('aria-disabled');this.toggle.textContent=open?'Close bag':'Open bag';this.toggle.setAttribute('aria-expanded',String(open));
  if(this.pendingDraw){this.pendingDraw=false;this.draw();}else this.interactive(true);
 }
 reset(){
  this.epoch++;this.running=false;this.open=false;this.visible=false;this.revealed=false;this.pendingDraw=false;this.data=null;this.key='';this.items=null;this.clearLift();
  this.out=[];this.inspected=null;this.stageToken++;for(const key of ['stage','out','staging','names'])delete this.root.dataset[key];this.names.replaceChildren();this.nameById.clear();this.returnAll.hidden=true;
  this.top=false;this.topToggle.setAttribute('aria-pressed','false');delete this.root.dataset.camera;this.pockets.replaceChildren();
  if(this.ready){void this.viewer.stageDiscs([],{instant:true});void this.viewer.setTopView(false,{instant:true});void this.viewer.setCompartmentOpen(false,{instant:true});void this.viewer.setPuttersOut(false,{instant:true});this.viewer.setZoom(1,{instant:true});this.viewer.setBagLayout({main:[],putter:[],goTo:[null]});this.viewer.setBagColor(null);}
  this.layer.replaceChildren();this.slotsByKey=null;
  if(this.root.dataset.engine!=='error')this.toggle.disabled=false;
  this.toggle.removeAttribute('aria-disabled');this.toggle.textContent='Open bag';this.toggle.setAttribute('aria-expanded','false');this.root.dataset.phase='closed';
 }
}
