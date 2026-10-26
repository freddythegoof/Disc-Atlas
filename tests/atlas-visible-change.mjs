// What the eye catches on the atlas while it moves (Freddy's ruling 2, Oct 26, 2026): a disc that appears,
// vanishes or changes its rest spot, a name that cuts in or out, an art image that swaps without a fade. Render
// counts stay as diagnostics only. Shared by tests/atlas-gesture-probe.mjs and tests/atlas-3d-browser.mjs.
//
// `pageProbe` runs in the page (page.addInitScript or page.evaluate). It samples once per animation frame, from
// its own rAF loop, what the previous frame put on screen: the camera, every DOM marker (its key, its written
// spot, its rest offset, whether it is fading in or out, its name's state and its 3D art) and every canvas disc
// (gapFade: presence, rest spot, level of detail, crossfade). It records an event for each visible change:
//   appear / vanish   a disc entering or leaving the field away from the viewport's edges (40 px inset)
//   hop               a disc's drawn spot starting to move to another rest spot (`abrupt` when one frame covers most of
//                     the way, more than 4 px: a snap rather than an ease)
//   jump              a drawn spot jumping more than 2 px without a rest change (always abrupt)
//   label-cut         a curated or named dot's name hidden or shown at once (abrupt)
//   label-fade        the same, through a fade
//   art               a disc's image replaced (`abrupt` unless it crossfades)
// and, per frame: the frame interval, how far the camera moved on screen (the largest displacement of the
// viewport's corners and centre, px), main-thread draw() and AtlasGroups.curate time, renders, evictions.
// `abrupt: false` means the change runs through a fade or an eased move. Events at the viewport's edges are a
// pan bringing discs in or out, not the field changing, and are not counted.
export function pageProbe(){
 if(window.__probe)return;
 const P=window.__probe={unpinned:new Map(),recording:false,frames:[],events:[],inputs:[],marks:{fonts:[],art:[]},longtasks:[],curate:{calls:0,ms:0}};
 const now=()=>performance.now();
 // A camera moving less than this many px a frame (45 px/s at 60 Hz) reads as still.
 P.MOVE=.75;
 const seen=type=>e=>{if(type==='pointermove'&&!e.buttons)return;P.lastInput=now();if(P.recording)P.inputs.push({t:P.lastInput,type});};
 for(const type of ['wheel','pointerdown','pointermove','pointerup','keydown','touchstart','touchmove'])addEventListener(type,seen(type),{capture:true,passive:true});
 try{new PerformanceObserver(l=>{for(const e of l.getEntries())P.longtasks.push({t:e.startTime,d:e.duration});}).observe({type:'longtask',buffered:true});}catch{}
 document.fonts?.addEventListener?.('loadingdone',()=>P.marks.fonts.push(now()));
 const hook=()=>{
  if(P.hooked)return true;
  try{if(typeof draw!=='function'||typeof AtlasGroups!=='object')return false;}catch{return false;}
  P.hooked=true;
  const drawFn=draw;let depth=0;
  window.draw=function(){
   if(depth)return drawFn.apply(this,arguments);
   depth++;const t=now();
   try{return drawFn.apply(this,arguments);}finally{depth--;const ms=now()-t;P.frameDraw=(P.frameDraw||0)+ms;P.drawMax=Math.max(P.drawMax||0,ms);try{P.drawnCam={zoom,x:pan.x,y:pan.y};}catch{}}
  };
  const curate=AtlasGroups.curate;
  AtlasGroups.curate=function(){const t=now();try{return curate.apply(this,arguments);}finally{const ms=now()-t;P.curate.calls++;P.curate.ms+=ms;P.frameCurate=(P.frameCurate||0)+ms;P.frameCurates=(P.frameCurates||0)+1;}};
  // Where main-thread time goes, by cause, for attributing long frames: 3D renders, worker results hydrated, labels measured.
  P.cost={render:[],hydrate:[],measure:[]};
  for(const [name,kind] of [['hydrateGroups','hydrate'],['measureFullLabels','measure']]){
   const fn=window[name];if(typeof fn!=='function')continue;
   window[name]=function(){const t=now();try{return fn.apply(this,arguments);}finally{const ms=now()-t;if(ms>4)P.cost[kind].push({t:Math.round(t),ms:+ms.toFixed(1)});}};
  }
  return true;
 };
 const hookArt=()=>{
  try{if(P.artHooked||typeof atlasArt==='undefined'||!atlasArt)return;}catch{return;}
  P.artHooked=true;const render=atlasArt.render;let burst=null;
  atlasArt.render=function(){const t=now();try{return render.apply(this,arguments);}finally{const ms=now()-t;
   // Renders within 2 ms of each other are one burst (one frame's budget or one idle callback).
   if(burst&&t-burst.end<2){burst.end=now();burst.ms+=ms;burst.n++;}else{burst={t:Math.round(t),end:now(),ms,n:1};P.cost.render.push(burst);}
   if(ms>20){const d=arguments[0]||{};(P.slow??=[]).push({t:Math.round(t),ms:Math.round(ms),name:d.name,brand:d.brand,lod:arguments[4]||null,size:Math.round(arguments[2]||0),stamp:!!d.stampAsset,photo:!!d.photoURL});}}};
 };
 addEventListener('DOMContentLoaded',hook);
 let last=null,prevCam=null,prevT=0,artState=null,introSeen=false,level0=false,settling=false;
 P.reset=()=>{P.frames=[];P.events=[];P.inputs=[];P.curate={calls:0,ms:0};P.drawMax=0;last=null;};
 P.start=()=>{P.reset();P.recording=true;};
 P.stop=()=>{P.recording=false;return {frames:P.frames,events:P.events,inputs:P.inputs,curate:P.curate,longtasks:P.longtasks,marks:P.marks,drawMax:P.drawMax||0,cost:P.cost||null,slow:P.slow||[]};};
 const marks=t=>{
  try{
   if(typeof mapArt!=='undefined'&&mapArt.state!==artState){artState=mapArt.state;P.marks.art.push({t,state:artState});}
   if(!introSeen&&typeof atlasIntro!=='undefined'&&atlasIntro&&atlasIntro.at!=null){introSeen=true;P.marks.intro={at:atlasIntro.at,breath:atlasIntro.breath,duration:atlasIntro.duration,hold:atlasIntro.hold??null};}
   if(introSeen&&P.marks.intro&&!P.marks.intro.end&&typeof atlasIntro!=='undefined'){if(atlasIntro){P.marks.intro.hold=atlasIntro.hold;P.marks.intro.holding=!!atlasIntro.holding;if(!atlasIntro.holding&&P.marks.intro.flightAt==null)P.marks.intro.flightAt=atlasIntro.at;}else P.marks.intro.end=t;}
   if(!level0&&typeof preparedGroups!=='undefined'&&preparedGroups.has(0)){level0=true;P.marks.level0=t;}
   if(typeof atlasSettling!=='undefined'){if(atlasSettling)settling=true;else if(settling){settling=false;P.marks.settled=t;}}
  }catch{}
 };
 const sample=t=>{
  let vp,w,h,area;
  try{vp=mapViewport;if(!vp||view!=='map')return;}catch{return;}
  w=vp.width;h=vp.height;if(!w||!h)return;
  area=AtlasLayout.bounds(w,h,immersiveMap());
  // The camera the last draw placed everything with (a drag moves `pan` between frames, ahead of the drawing).
  const cam=P.drawnCam||{zoom,x:pan.x,y:pan.y};
  let move=0;
  if(prevCam)for(const [cx,cy] of [[0,0],[w,0],[0,h],[w,h],[w/2,h/2]]){
   const wx=(cx-area.left-prevCam.x)/(area.width*prevCam.zoom),wy=(area.bottom+prevCam.y-cy)/(area.height*prevCam.zoom);
   const sx=area.left+wx*area.width*cam.zoom+cam.x,sy=area.bottom-wy*area.height*cam.zoom+cam.y;
   move=Math.max(move,Math.hypot(sx-cx,sy-cy));
  }
  const stats=typeof mapArt!=='undefined'&&mapArt.stats||{};
  const frame={t,dt:prevT?t-prevT:0,move,zoom:cam.zoom,draw:P.frameDraw||0,curate:P.frameCurate||0,curates:P.frameCurates||0,
   renders:stats.renders||0,evicted:stats.evicted||0,pending:mapArt.pending||0,level:groupCache?.level??null,
   tween:!!cameraTween,regrouping:!!regrouping,due:!!swapDueAt,canvasW:canvas.width,canvasH:canvas.height};
  P.frameDraw=0;P.frameCurate=0;P.frameCurates=0;prevT=t;prevCam=cam;
  if(P.recording)P.frames.push(frame);
  const inside=(x,y)=>x>40&&x<w-40&&y>40&&y<h-40;
  // Discs held under the pointer (AtlasTargets.PIN): their letting go is the pin rule's, recorded as `unpin`.
  const cur={markers:new Map(),gaps:new Map(),pins:new Set([...markerPins.keys(),...gapPins.keys()])};
  const byKey=new Map(mapClusters.map(g=>[g.key,g]));
  for(const [key,node] of markerNodes){
   if(!node.position.isConnected)continue;
   const g=byKey.get(key),cl=node.position.classList,name=node.nameEl||node.querySelector('.marker-name');
   const proj=g?{x:area.left+g.pos.x*area.width*cam.zoom+cam.x,y:area.bottom-g.pos.y*area.height*cam.zoom+cam.y}:null;
   cur.markers.set(key,{x:node.mapX,y:node.mapY,res:proj?{x:node.mapX-proj.x,y:node.mapY-proj.y}:null,
    rest:g?{x:g.markerOffset?.x||0,y:g.markerOffset?.y||0}:null,
    retiring:cl.contains('is-retiring'),fade:cl.contains('is-new')||/atlas-arrive/.test(node.style.animation),updating:cl.contains('is-updating'),
    named:node.classList.contains('is-large')||node.classList.contains('is-gap-label'),
    label:name&&name.style.visibility==='hidden'?'cut':node.classList.contains('is-label-yield')||node.classList.contains('is-label-out')?'faded':'on',
    art:node.art3d||null,artFade:!!node.art3d?.classList.contains('is-arriving')});
  }
  for(const [key,e] of gapFade)cur.gaps.set(key,{on:e.on,drawn:e.drawn,x:e.x,y:e.y,tx:e.tx,ty:e.ty,ox:e.ox,oy:e.oy,art:e.art,lod:e.lod,xf:e.xf});
  if(last&&P.recording){
   // A pin letting go (a disc held under the pointer, or a small disc waiting for its pinned marker) is the pin rule's.
   for(const key of last.pins)if(!cur.pins.has(key))P.unpinned.set(key,t);
   const recent=key=>last.pins.has(key)||t-(P.unpinned.get(key)??-1e9)<300;
   const pinned=key=>recent(key)||recent(String(key).split('|')[0]);
   const ev=(kind,layer,key,abrupt,x,y)=>P.events.push({t,kind:(kind==='vanish'||kind==='appear')&&pinned(key)?'unpin':kind,layer,key,abrupt,moving:move>P.MOVE,x:Math.round(x),y:Math.round(y)});
   for(const [key,m] of cur.markers){
    const was=last.markers.get(key);
    if(!was){if(!m.retiring&&inside(m.x,m.y))ev('appear','marker',key,!m.fade,m.x,m.y);continue;}
    if(!inside(m.x,m.y)&&!inside(was.x,was.y))continue;
    if(!was.retiring&&m.retiring){ev('vanish','marker',key,false,m.x,m.y);continue;}
    // Brought back mid-fade-out (its position's opacity transition carries it back up): a fade.
    if(was.retiring&&!m.retiring)ev('appear','marker',key,false,m.x,m.y);
    if(m.retiring)continue;
    // What is drawn: the disc's offset from where the camera puts its point (`res`). A hop is that offset starting to
    // move (a frame after one where it held still); it is abrupt when one frame covers most of the way to where it
    // rests (a snap) rather than a fraction (an eased move). A drawn spot moving while its rest spot stays, and not
    // closing in on it, is a jump (always abrupt).
    const step=was.res&&m.res?Math.hypot(m.res.x-was.res.x,m.res.y-was.res.y):0;
    const left=was.res&&m.rest?Math.hypot(was.res.x-m.rest.x,was.res.y-m.rest.y):0;
    const closing=m.rest&&was.res&&m.res?left-Math.hypot(m.res.x-m.rest.x,m.res.y-m.rest.y):0;
    const retarget=was.rest&&m.rest&&Math.hypot(was.rest.x-m.rest.x,was.rest.y-m.rest.y)>.5;
    if(step>.5&&!m.updating){
     if(!(was.step>.5))ev('hop','marker',key,step>4&&step>=.7*left,m.x,m.y);
     else if(!retarget&&closing<.8*step&&step>2)ev('jump','marker',key,true,m.x,m.y);
    }
    m.step=step;
    if(m.named&&was.named&&was.label!==m.label)ev(was.label==='cut'||m.label==='cut'?'label-cut':'label-fade','marker',key,was.label==='cut'||m.label==='cut',m.x,m.y);
    if(m.art&&was.art!==m.art)ev('art','marker',key,!m.artFade,m.x,m.y);
   }
   for(const [key,was] of last.markers)if(!cur.markers.has(key)&&!was.retiring&&inside(was.x,was.y))ev('vanish','marker',key,true,was.x,was.y);
   for(const [key,e] of cur.gaps){
    const was=last.gaps.get(key);
    if(!e.drawn||!inside(e.x,e.y))continue;
    if((!was||!was.on)&&e.on)ev('appear','gap',key,e.art>=1&&(!was||was.art<=0),e.x,e.y);
    else if(was&&was.on&&!e.on)ev('vanish','gap',key,false,e.x,e.y);
    else if(was&&was.on&&e.on){
     // The drawn offset starting to move (eased a few px a frame toward its rest spot) is a hop.
     const step=Math.hypot(e.ox-was.ox,e.oy-was.oy);
     if(step>.5&&!(was.step>.5))ev('hop','gap',key,step>4&&step>=.7*Math.hypot(was.ox-e.tx,was.oy-e.ty),e.x,e.y);
     cur.gaps.get(key).step=step;
    }
    if(was&&was.lod&&e.lod&&was.lod!==e.lod)ev('art','gap',key,!(e.xf!=null&&e.xf<1),e.x,e.y);
   }
   for(const [key,was] of last.gaps)if(!cur.gaps.has(key)&&was.on&&was.drawn&&inside(was.x,was.y))ev('vanish','gap',key,true,was.x,was.y);
  }
  last=cur;
 };
 const tick=t=>{
  requestAnimationFrame(tick);
  hook();hookArt();marks(t);
  try{sample(t);}catch(e){P.error=String(e?.stack||e);}
 };
 requestAnimationFrame(tick);
}

// Node side: split a recording into gestures and judge each. Inputs more than `gap` ms apart start a new
// gesture. A gesture runs from its first input to the last frame whose camera still visibly moves (the probe's
// MOVE); events inside are mid-gesture. What follows, until the next gesture, is post-gesture: its events are
// grouped into bursts (events within `burst` ms of each other); the first burst is the swap the hand expects,
// any later one is a late pop.
export function summarize(rec,{gap=600,burst=150,move=.75}={}){
 const frames=rec.frames,events=rec.events,inputs=rec.inputs.filter(i=>i.type!=='pointermove'||true);
 const periods=frames.map(f=>f.dt).filter(d=>d>0).sort((a,b)=>a-b);
 const period=periods.length?periods[Math.floor(periods.length/2)]:16.7;
 const longFrames=frames.filter(f=>f.dt>period*1.5);
 let run=0,longestRun=0;for(const f of frames){if(f.dt>period*1.5){run++;longestRun=Math.max(longestRun,run);}else run=0;}
 const groups=[];
 for(const i of inputs){const g=groups.at(-1);if(g&&i.t-g.last<=gap){g.last=i.t;g.count++;}else groups.push({first:i.t,last:i.t,count:1});}
 const tally=list=>{
  const out={total:list.length,abrupt:list.filter(e=>e.abrupt).length};
  for(const e of list){const k=e.layer+':'+e.kind+(e.abrupt?'!':'');out[k]=(out[k]||0)+1;}
  return out;
 };
 const gestures=groups.map((g,n)=>{
  const next=groups[n+1]?.first??Infinity;
  const moving=frames.filter(f=>f.t>=g.first&&f.t<next&&f.move>move);
  const end=Math.max(g.last,moving.at(-1)?.t??g.last);
  const mid=events.filter(e=>e.t>=g.first&&e.t<=end);
  const post=events.filter(e=>e.t>end&&e.t<next&&e.kind!=='unpin');
  const bursts=[];for(const e of post){const b=bursts.at(-1);if(b&&e.t-b.last<=burst){b.last=e.t;b.events.push(e);}else bursts.push({first:e.t,last:e.t,events:[e]});}
  const during=frames.filter(f=>f.t>=g.first&&f.t<=end);
  const fp=during.map(f=>f.dt).filter(d=>d>0);
  let r=0,lr=0;for(const d of fp){if(d>period*1.5){r++;lr=Math.max(lr,r);}else r=0;}
  return {inputs:g.count,ms:Math.round(end-g.first),stillAfterInput:Math.round(end-g.last),
   mid:tally(mid),post:tally(post),bursts:bursts.length,swapAfterInput:bursts[0]?Math.round(bursts[0].first-g.last):null,
   late:tally(bursts.slice(1).flatMap(b=>b.events)),lateAfterInput:bursts[1]?Math.round(bursts[1].first-g.last):null,
   frames:during.length,longFrames:fp.filter(d=>d>period*1.5).length,longestRun:lr,worstFrame:Math.round(Math.max(0,...fp)),
   curateMs:+during.reduce((s,f)=>s+f.curate,0).toFixed(1),curateFrames:during.filter(f=>f.curates).length,
   drawMax:+Math.max(0,...during.map(f=>f.draw)).toFixed(1),renders:during.length?during.at(-1).renders-during[0].renders:0,
   evicted:during.length?during.at(-1).evicted-during[0].evicted:0,canvasResizes:new Set(during.map(f=>f.canvasW+'x'+f.canvasH)).size-1,
   heldMs:Math.round(frames.filter(f=>f.t>end&&f.t<next&&f.due).reduce((a,f)=>a+f.dt,0)),
   samples:{abrupt:[...mid,...post].filter(e=>e.abrupt).slice(0,4),mid:mid.slice(0,4),late:bursts.slice(1).flatMap(b=>b.events).slice(0,4)}};
 });
 return {period:+period.toFixed(2),frames:frames.length,longFrames:longFrames.length,longestRun,curate:rec.curate,gestures,
  all:{mid:tally(gestures.length?events.filter(e=>groups.some((g,n)=>e.t>=g.first&&e.t<=g.first+gestures[n].ms)):[]),events:tally(events)}};
}
