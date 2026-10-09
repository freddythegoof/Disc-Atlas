/* Pure world-space grouping, shared by the initial render and the background worker. */
globalThis.AtlasGroups = {
 // Enter at the normal density boundary; leave slightly below it. This works
 // for every level, including the final boundary just below the zoom ceiling.
 level(zoom, previous) {
  const value=Math.log2(zoom)*3,next=Math.round(value);
  return previous!=null&&next<previous&&value>previous-.65?previous:next;
 },
 // Inclusive segment tests also reject touching/collinear leaders.
 segmentHitsBox(line,box) {
  let lo=0,hi=1;
  for(const [start,delta,min,max] of [[line.x1,line.x2-line.x1,box.x,box.x+box.w],
   [line.y1,line.y2-line.y1,box.y,box.y+box.h]]){
   if(Math.abs(delta)<1e-8){if(start<min||start>max)return false;continue;}
   const a=(min-start)/delta,b=(max-start)/delta;
   lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));if(lo>hi)return false;
  }
  return true;
 },
 // The art size layout keeps room for at a zoom, relative to the CSS art: modest growth that settles
 // at 4x. promote and curate clear every disc for this, and both maps draw their art at this size.
 artRoom(zoom){return 1+.08*(Math.min(4,zoom)-1);},
 // Tier 2 of the organic overview: the rest of the rated catalog as small discs resting in the room
 // the curated discs leave, a distant field they sit in front of. They match a complete view's dots:
 // `size` px across at 1x, growing with artRoom to about 15px from 4x, inside the 16px `room` that
 // curate keeps for a dot (ORGANIC.dot), and rest within `reach` of that room from their own point.
 // Names are reserved only where they will show (from `labelFrom`) and fade in with zoom up to
 // `labelTo`. A small disc keeps `art` px from a curated disc, `label` px from a curated name and
 // `apart` px from another small disc or its name, with `spacing` (`phoneSpacing` under 700px)
 // between small disc centers. At 1x they draw at `far` strength, quieter than the discs in front,
 // and come up to full strength as the art grows (4x).
 GAP:{size:12,room:8,reach:.6,spacing:60,phoneSpacing:54,art:20,label:8,apart:6,labelFrom:4.5,labelTo:6,far:.72},
 gapSize(zoom){return this.GAP.size*this.artRoom(zoom);},
 gapAlpha(zoom){return this.GAP.far+(1-this.GAP.far)*(this.artRoom(zoom)-1)/.24;},
 // How visible small discs' names are at a zoom: none below labelFrom, all from labelTo, smooth between.
 gapLabelAlpha(zoom){
  const {labelFrom:a,labelTo:b}=this.GAP,t=Math.max(0,Math.min(1,(zoom-a)/(b-a)));
  return t*t*(3-2*t);
 },
 segmentsCross(a,b) {
  if(Math.max(a.x1,a.x2)<Math.min(b.x1,b.x2)||Math.max(b.x1,b.x2)<Math.min(a.x1,a.x2)||
   Math.max(a.y1,a.y2)<Math.min(b.y1,b.y2)||Math.max(b.y1,b.y2)<Math.min(a.y1,a.y2))return false;
  const cross=(x1,y1,x2,y2,x3,y3)=>(x2-x1)*(y3-y1)-(y2-y1)*(x3-x1);
  return cross(a.x1,a.y1,a.x2,a.y2,b.x1,b.y1)*cross(a.x1,a.y1,a.x2,a.y2,b.x2,b.y2)<=0&&
   cross(b.x1,b.y1,b.x2,b.y2,a.x1,a.y1)*cross(b.x1,b.y1,b.x2,b.y2,a.x2,a.y2)<=0;
 },
 // Rectangles are measured from the rendered name/brand label in CSS pixels.
 // Keep priority order; screen-space contention alone determines prominence.
 promote(groups, footprints, zoom, groupZoom, satelliteFootprints, minorFootprints) {
  const occupied=new Map(),cellSize=128,scale=this.artRoom(zoom),ratio=zoom/groupZoom;
  const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const cells=box=>{
   const keys=[];
   for(let x=Math.floor(box.x/cellSize);x<=Math.floor((box.x+box.w)/cellSize);x++)
    for(let y=Math.floor(box.y/cellSize);y<=Math.floor((box.y+box.h)/cellSize);y++)keys.push(x+':'+y);
   return keys;
  };
  for(const g of groups){
   g.labelVisible=false;
   g.labelOffset=null;g.markerOffset=null;g.satellite=false;g.leader=null;g.minorLabel=false;
   const f=footprints.get(g.key);
   if(!f){g.large=false;continue;}
   const x=g.px*ratio,y=-g.py*ratio,r=f.radius*scale;
   const label={x:x+f.x+(g.nudge?.x||0),y:y+f.y+(g.nudge?.y||0),w:f.w,h:f.h};
   const marker={x:x-r,y:y-r,w:2*r,h:2*r};
   const boxes=[label,marker],keys=boxes.map(cells);
   g.large=!boxes.some((box,i)=>keys[i].some(key=>(occupied.get(key)||[]).some(b=>overlaps(box,b))));
   if(g.large)boxes.forEach((box,i)=>keys[i].forEach(key=>{
    if(!occupied.has(key))occupied.set(key,[]);occupied.get(key).push(box);
   }));
  }
  // Overview names have one fixed footprint at the true marker position.
  // They share primary contention and never get offsets or canvas leaders.
  if(minorFootprints){
   const insert=box=>cells(box).forEach(key=>{if(!occupied.has(key))occupied.set(key,[]);occupied.get(key).push(box);});
   for(const g of groups)if(!g.large){const r=g.members.length>1?12:8;
    insert({x:g.px*ratio-r,y:-g.py*ratio-r,w:2*r,h:2*r});
   }
   for(const g of groups){
    if(g.large||g.members.length!==1)continue;
    const f=minorFootprints.get(g.key);if(!f)continue;
    const label={x:g.px*ratio+f.x,y:-g.py*ratio+f.y,w:f.w,h:f.h};
    if(cells(label).some(key=>(occupied.get(key)||[]).some(b=>overlaps(label,b))))continue;
    g.minorLabel=true;g.labelVisible=true;insert(label);
   }
  }
  // Keep the primary pass unchanged. Deep singles may use smaller artwork;
  // reserved true-position dots protect stacks/fallbacks and vector endpoints.
  if(satelliteFootprints){
   const insert=box=>cells(box).forEach(key=>{if(!occupied.has(key))occupied.set(key,[]);occupied.get(key).push(box);});
   const contenders=(box,key)=>[...new Set(cells(box).flatMap(cell=>occupied.get(cell)||[]))].filter(b=>b.owner!==key);
   const blocked=(box,key)=>contenders(box,key).some(b=>overlaps(box,b));
   const leaders=[];
   for(const g of groups)if(!g.large){const x=g.px*ratio,y=-g.py*ratio,r=g.members.length>1?12:8;
    insert({x:x-r,y:y-r,w:r*2,h:r*2,owner:g.key});
   }
   const offsets=[{x:0,y:0}];
   for(const radius of [24,32,40,48,56])for(let i=0;i<16;i++){
    const angle=i*Math.PI/8;offsets.push({x:Math.cos(angle)*radius,y:Math.sin(angle)*radius});
   }
   for(const g of groups){
    if(g.large||g.members.length!==1)continue;
    const f=satelliteFootprints.get(g.key);if(!f)continue;
    const x=g.px*ratio,y=-g.py*ratio,r=f.radius+2;
    const labelOffsets=[{x:f.x,y:f.y},{x:f.x,y:-18-f.h},{x:r+6,y:-f.h/2},{x:-r-6-f.w,y:-f.h/2}];
    let placement=null;
    for(const offset of offsets){
     const mx=x+offset.x,my=y+offset.y,marker={x:mx-r,y:my-r,w:2*r,h:2*r};
     if(blocked(marker,g.key)||leaders.some(l=>this.segmentHitsBox(l,marker)))continue;
     const distance=Math.hypot(offset.x,offset.y);
     const edge=Math.max(Math.abs(offset.x),Math.abs(offset.y));
     const leader=distance?{x1:mx-offset.x*r/edge,y1:my-offset.y*r/edge,x2:x,y2:y}:null;
     if(leader){
      const bounds={x:Math.min(leader.x1,x),y:Math.min(leader.y1,y),w:Math.abs(leader.x1-x),h:Math.abs(leader.y1-y)};
      if(contenders(bounds,g.key).some(b=>this.segmentHitsBox(leader,b))||leaders.some(l=>this.segmentsCross(leader,l)))continue;
     }
     for(const labelOffset of labelOffsets){
      const label={x:mx+labelOffset.x,y:my+labelOffset.y,w:f.w,h:f.h};
      if(blocked(label,g.key)||leaders.some(l=>this.segmentHitsBox(l,label))||leader&&this.segmentHitsBox(leader,label))continue;
      placement={offset,labelOffset,marker,label,leader};break;
     }
     if(placement)break;
    }
    if(!placement)continue;
    g.satellite=true;g.labelVisible=true;g.markerOffset=placement.offset;
    g.labelOffset={x:placement.labelOffset.x-f.x,y:placement.labelOffset.y-f.y};g.leader=placement.leader;
    insert(placement.marker);insert(placement.label);if(placement.leader)leaders.push(placement.leader);
   }
  }
 },
 // The main Atlas's organic overview (My Map keeps promote). Discs rest near their atlas point the
 // way out discs rest beside the bag: front facing, none touching, room around every one.
 // The visible set is an explicit walk, never a sample:
 // 1. Groups arrive in selection order (build's sort): the bag first on bag lenses, then featured.js
 //    rank, then name, brand and id. A group shows only its lead, its first member in that order.
 // 2. Coverage: the walk first takes each region's first lead (regions are `region` px squares of the
 //    map at this zoom), so every stretch of the spectrum that has discs shows its best known one.
 //    Depth: a second walk takes the remaining leads in the same order.
 // 3. A lead rests at its seeded spot, or else the clear spot nearest that, at most `reach` disc
 //    radii from its true atlas point. Clear means `gap` px from every placed disc and name, at least
 //    `spacing` px between disc centers, off the `obstacles` (the chrome) and inside `frame` (the
 //    map). A lead with no clear spot stays hidden.
 // 4. Both walks stop after `cap` leads in all: `perView` per desktop-sized view, by view area and
 //    zoom² (the level's floor zoom, see organicZoom), so the room per disc on screen stays the same.
 // 5. `first` (the selected disc's group) is placed ahead of both walks when they would hide it.
 // 6. A complete view, one with no more discs than the cap (a narrow filter or search, or deep zoom),
 //    hides nothing. Its leads keep only the `gap`, not the overview's `spacing`, so more rest at full
 //    size; a lead with no room at full size rests as a small dot (its name on hover and focus),
 //    within the same reach and clear of everything; with no room even for that, its discs join
 //    the stack of the nearest placed disc (`joined`). The overview never shows dots.
 // 7. Tier 2 (GAP), in a view that hides discs: every other rated disc (`points`, from pointIds, in
 //    the same order) may rest as a small disc near its own atlas point, within GAP.reach of its
 //    room, where it is clear of every curated disc, name and chrome and of the small discs placed
 //    before it (8 spots: its seeded toss, its point and 6 around its few-px reach). Where its
 //    name will show (`gapLabels`), it gets the name if that is clear too, and later small discs keep
 //    off it. A small disc that would crowd anything is not placed. Curated discs never move for them.
 //    In a complete view the dots are the small discs: where names will show, a dot whose name is
 //    clear gets it (`gapLabel`); where a dot rests is unchanged. `gapsFrom` (a camera between levels,
 //    laid out on every frame) keeps the level's own small discs at their spots where they are still
 //    clear, rather than walking the whole catalog again.
 // It is seeded by disc id, so the same data, view, zoom and selection always rest the same way.
 // `spacing` is the least distance between disc centers in an overview: 138px on desktop (24 discs
 // at 1x on a 1440 x 900 map, under the cap of 29), 112px on maps under 700px wide, where the same
 // 76px art fills far more of the screen.
 ORGANIC:{perView:32,view:1320*640,min:8,reach:.6,gap:12,spacing:138,phoneSpacing:112,region:300,dot:8},
 organicCap(view,zoom){
  const O=this.ORGANIC;
  return Math.max(O.min,Math.round(O.perView*(view.right-view.left)*(view.bottom-view.top)/O.view*zoom*zoom));
 },
 // A level rests its discs once, for the least zoom it shows at (its floor, from the exit hysteresis
 // in level) and keeps them up to its top, where the next level takes over. Zooming in multiplies
 // every distance between true points by up to `stretch` (top / floor, at most 1.31), while rest
 // offsets and names keep their pixels. Two boxes count as clear only along an axis where they stay
 // `gap` apart after that stretch (curate's `clear`), and the art is sized for the top. So discs keep
 // their spots across a level and change only where the grouping already regroups. A camera outside
 // the range (a tween that still shows the old level) is curated at its own zoom on every frame.
 organicRange(level){return {floor:Math.max(1,2**((level-.65)/3)),top:2**((level+.5)/3)};},
 organicZoom(level,zoom){const {floor,top}=this.organicRange(level);return zoom>=floor&&zoom<=top?floor:zoom;},
 // Curate options for a level and camera zoom: the zoom to rest discs at, the cap and spacing, and
 // for a 1x layout (level 0, or any level a tween shows at 1x) the map's edges and `chrome` (rects
 // in map pixels) as fixed spots in group space, placed for the camera 1x pins (centered on `extent`). `key` names everything that
 // shapes the result, so a worker's curation stands in for the main thread's.
 organicOptions({area,width,height,level,zoom,extent,chrome=[]}){
  const at=this.organicZoom(level,zoom),{top}=this.organicRange(level),overview=at===1,inset=4;
  const pan=overview?globalThis.AtlasLayout.constrain({zoom:1,x:0,y:0},area,extent):{x:0,y:0},origin={x:area.left+pan.x,y:area.bottom+pan.y};
  return {zoom:at,artZoom:top,stretch:Math.max(1,top/at),cap:this.organicCap(area.view,at),spacing:width<700?this.ORGANIC.phoneSpacing:this.ORGANIC.spacing,
   gapSpacing:width<700?this.GAP.phoneSpacing:this.GAP.spacing,gapLabels:this.gapLabelAlpha(Math.max(at,top))>0,
   obstacles:overview?chrome.map(b=>({x:b.x-origin.x,y:b.y-origin.y,w:b.w,h:b.h})):[],
   frame:overview?{x:inset-origin.x,y:inset-origin.y,w:width-inset*2,h:height-inset*2}:null,
   key:[level,at,overview?chrome.key:''].join('|')};
 },
 // The seeded rest spot first, then every candidate within `reach` px, nearest the rest spot first:
 // the curated 38, or for a small disc (whose few-px reach needs no more) its point and `count` on the reach.
 organicOffsets(key,reach,count=null){
  const memo=this.organicMemo||(this.organicMemo=new Map()),id=key+'@'+reach.toFixed(2)+(count?'/'+count:'');
  if(memo.has(id))return memo.get(id);
  const seed=globalThis.AtlasLayout.seed,turn=seed(key+':rest')*Math.PI*2,out=(.45+.55*seed(key+':reach'))*reach;
  const rest={x:Math.cos(turn)*out,y:Math.sin(turn)*out},spots=[rest];
  const rings=count?[[0,1],[1,count]]:[0,1/3,2/3,1].map(ring=>[ring,ring?Math.round(4+ring*12):1]);
  for(const [ring,n] of rings)for(let i=0;i<n;i++){const angle=turn+i*Math.PI*2/n;spots.push({x:Math.cos(angle)*ring*reach,y:Math.sin(angle)*ring*reach});}
  const result=spots.map((o,i)=>({o,i,d:Math.hypot(o.x-rest.x,o.y-rest.y)})).sort((a,b)=>a.d-b.d||a.i-b.i).map(s=>s.o);
  memo.set(id,result);return result;
 },
 curate(groups,footprints,zoom,groupZoom,{cap=Infinity,gap=this.ORGANIC.gap,spacing=this.ORGANIC.spacing,obstacles=[],frame=null,first=null,artZoom=zoom,stretch=1,points=null,gapSpacing=this.GAP.spacing,gapLabels=false,gapsFrom=null}={}){
  // This can run on camera frames, so the grids use numeric keys and a lead fails fast.
  const cellSize=128,scale=this.artRoom(Math.max(zoom,artZoom)),ratio=zoom/groupZoom,K=1<<20;
  const near=(a,b,pad)=>a.x-pad<b.x+b.w&&a.x+a.w+pad>b.x&&a.y-pad<b.y+b.h&&a.y+a.h+pad>b.y;
  const outside=box=>frame&&(box.x<frame.x||box.y<frame.y||box.x+box.w>frame.x+frame.w||box.y+box.h>frame.y+frame.h);
  const region=g=>Math.floor(g.px*ratio/this.ORGANIC.region)*K+Math.floor(-g.py*ratio/this.ORGANIC.region);
  const complete=groups.reduce((n,g)=>n+g.members.length,0)<=cap;
  if(complete)spacing=0;
  const G=this.GAP;let gaps=[];
  const walk=order=>{
   const occupied=new Map(),centers=new Map(),arts=new Map(),covered=new Set(),tried=new Set();let placed=0;
   for(const g of groups){
    g.large=false;g.hidden=true;g.labelVisible=false;g.labelOffset=null;g.markerOffset=null;
    g.satellite=false;g.leader=null;g.minorLabel=false;g.joined=null;g.complete=complete;g.gapLabel=false;
   }
   gaps=[];
   // Is a placed center within `within` px of (x, y)?
   const crowded=(x,y,within)=>{
    if(within<=0)return false;
    const cx=Math.floor(x/spacing),cy=Math.floor(y/spacing);
    for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const c of centers.get((cx+i)*K+cy+j)||[])if((c.x-x)**2+(c.y-y)**2<within*within)return true;
    return false;
   };
   // Is a placed disc's art so close to (x, y) that no spot within `reach` can clear it by `gap`?
   const hemmed=(x,y,r,reach)=>{
    const cx=Math.floor(x/cellSize),cy=Math.floor(y/cellSize);
    for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const a of arts.get((cx+i)*K+cy+j)||[])
     if(Math.max(Math.abs(a.x-x),Math.abs(a.y-y))<a.r+r+gap-reach)return true;
    return false;
   };
   // Box a (true point x, y) is clear of placed box b along an axis where it stays `gap` apart once
   // zooming stretches the true points apart: a side whose points draw together loses that much.
   const clear=(a,b,x,y,space=gap)=>{
    const dx=x-b.ox,dy=y-b.oy,keep=(apart,toward)=>apart-Math.max(0,-toward)*(stretch-1)>=space;
    return keep(a.x-b.x-b.w,dx)||keep(b.x-a.x-a.w,-dx)||keep(a.y-b.y-b.h,dy)||keep(b.y-a.y-a.h,-dy);
   };
   // Only boxes whose order along an axis is flipped from their points' can draw together, by at
   // most the label drop plus both reaches times (stretch - 1): `pad` covers it.
   const pad=gap+Math.ceil(160*(stretch-1));
   const blocked=(box,x,y)=>{
    if(outside(box))return true;
    for(const b of obstacles)if(near(box,b,gap))return true;
    for(let i=Math.floor((box.x-pad)/cellSize);i<=Math.floor((box.x+box.w+pad)/cellSize);i++)
     for(let j=Math.floor((box.y-pad)/cellSize);j<=Math.floor((box.y+box.h+pad)/cellSize);j++)
      for(const b of occupied.get(i*K+j)||[])if(!clear(box,b,x,y))return true;
    return false;
   };
   const occupy=(box,x,y)=>{
    box.ox=x;box.oy=y;
    for(let x=Math.floor(box.x/cellSize);x<=Math.floor((box.x+box.w)/cellSize);x++)
     for(let y=Math.floor(box.y/cellSize);y<=Math.floor((box.y+box.h)/cellSize);y++){
      const key=x*K+y;if(!occupied.has(key))occupied.set(key,[]);occupied.get(key).push(box);
     }
   };
   // Tier 2's distances: a small disc keeps `art` px from a curated disc and `label` px from a curated
   // name; anything else small keeps `apart`. Stretch-aware, like the curated discs.
   const smallPad=G.art+Math.ceil(160*(stretch-1));
   const roomy=(box,x,y)=>{
    if(outside(box))return false;
    for(const b of obstacles)if(near(box,b,gap))return false;
    for(let i=Math.floor((box.x-smallPad)/cellSize);i<=Math.floor((box.x+box.w+smallPad)/cellSize);i++)
     for(let j=Math.floor((box.y-smallPad)/cellSize);j<=Math.floor((box.y+box.h+smallPad)/cellSize);j++)
      for(const b of occupied.get(i*K+j)||[]){
       if(b.owner!=null&&b.owner===box.owner)continue;
       const space=b.kind==='art'?(box.kind==='small'?G.art:G.label):b.kind==='label'?G.label:G.apart;
       if(!clear(box,b,x,y,space))return false;
      }
    return true;
   };
   const place=g=>{
    const f=footprints.get(g.key);if(!f)return false;
    const x=g.px*ratio,y=-g.py*ratio,r=f.radius*scale,reach=f.radius*this.ORGANIC.reach;
    // Every spot lies within `reach` of the true point, so a center this close blocks them all.
    if(crowded(x,y,spacing-reach)||hemmed(x,y,r,reach))return false;
    for(const o of this.organicOffsets(g.key,reach)){
     const mx=x+o.x,my=y+o.y;
     if(crowded(mx,my,spacing))continue;
     const marker={x:mx-r,y:my-r,w:2*r,h:2*r},label={x:mx+f.x+(g.nudge?.x||0),y:my+f.y+(g.nudge?.y||0),w:f.w,h:f.h};
     if(blocked(marker,x,y)||blocked(label,x,y))continue;
     marker.kind='art';label.kind='label';occupy(marker,x,y);occupy(label,x,y);
     const art=Math.floor(mx/cellSize)*K+Math.floor(my/cellSize);
     if(!arts.has(art))arts.set(art,[]);arts.get(art).push({x:mx,y:my,r});
     if(spacing>0){
      const key=Math.floor(mx/spacing)*K+Math.floor(my/spacing);
      if(!centers.has(key))centers.set(key,[]);centers.get(key).push({x:mx,y:my});
     }
     g.large=true;g.hidden=false;g.labelVisible=true;g.markerOffset=o;return true;
    }
    return false;
   };
   // Coverage walks until each region holds one disc; depth takes the rest. Room only shrinks, so a
   // lead that found none is not tried again.
   for(const depth of [false,true])for(const g of order){
    if(placed>=cap)break;
    if(tried.has(g)||!depth&&g!==first&&covered.has(region(g)))continue;
    tried.add(g);
    if(place(g)){placed++;covered.add(region(g));}
   }
   if(!complete){if(points)gaps=smallWalk(roomy,occupy,arts);return;}
   for(const g of order){
    const f=footprints.get(g.key);if(!g.hidden||!f)continue;
    const x=g.px*ratio,y=-g.py*ratio,r=this.ORGANIC.dot,reach=f.radius*this.ORGANIC.reach;
    if(hemmed(x,y,r,reach))continue;
    for(const o of this.organicOffsets(g.key,reach)){
     const dot={x:x+o.x-r,y:y+o.y-r,w:2*r,h:2*r};
     if(blocked(dot,x,y))continue;
     dot.kind='small';dot.owner=g.key;occupy(dot,x,y);g.hidden=false;g.markerOffset=o;break;
    }
   }
   // Names for the dots, where they will show and are clear. Placement above is already final.
   if(gapLabels)for(const g of order){
    const f=footprints.get(g.key)?.gap;if(g.hidden||g.large||!f)continue;
    const x=g.px*ratio+g.markerOffset.x,y=-g.py*ratio+g.markerOffset.y;
    const label={x:x+f.x,y:y+f.y,w:f.w,h:f.h,kind:'smallLabel',owner:g.key};
    if(roomy(label,g.px*ratio,-g.py*ratio)){occupy(label,g.px*ratio,-g.py*ratio);g.gapLabel=true;}
   }
   for(const g of order){
    if(!g.hidden)continue;
    let nearest=null,best=Infinity;
    for(const h of groups){
     if(h.hidden)continue;
     const distance=(h.px+(h.markerOffset?.x||0)/ratio-g.px)**2+(h.py-(h.markerOffset?.y||0)/ratio-g.py)**2;
     if(distance<best){best=distance;nearest=h;}
    }
    if(nearest)nearest.joined=[...nearest.joined||[],...g.members];
   }
  };
  // Tier 2 rests after the curated walk, in the room it left.
  const smallWalk=(roomy,occupy,arts)=>{
   const shown=new Set(),centers=new Map(),r=G.room,reach=r*G.reach,out=[],step=gapSpacing;
   for(const g of groups)if(!g.hidden)shown.add(g.key);
   const crowded=(x,y,within)=>{
    const cx=Math.floor(x/step),cy=Math.floor(y/step);
    for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const c of centers.get((cx+i)*K+cy+j)||[])if((c.x-x)**2+(c.y-y)**2<within*within)return true;
    return false;
   };
   // A curated disc so close to the point that no spot within reach clears it.
   const hemmed=(x,y)=>{
    const cx=Math.floor(x/cellSize),cy=Math.floor(y/cellSize);
    for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const a of arts.get((cx+i)*K+cy+j)||[])
     if(Math.max(Math.abs(a.x-x),Math.abs(a.y-y))<a.r+r+G.art-reach)return true;
    return false;
   };
   const {ids,xy}=points;
   // Rest point n at the first clear spot of `spots`; `n` names it in `points` for gapsFrom.
   const rest=(n,spots)=>{
    const id=ids[n];if(shown.has(id))return;
    const x=xy[4*n]*ratio,y=-xy[4*n+1]*ratio;
    if(crowded(x,y,step-reach)||hemmed(x,y))return;
    const f=gapLabels?footprints.get(id)?.gap:null;
    for(const o of spots||this.organicOffsets(id,reach,6)){
     const mx=x+o.x,my=y+o.y;
     if(crowded(mx,my,step))continue;
     const art={x:mx-r,y:my-r,w:2*r,h:2*r,kind:'small',owner:id};
     if(!roomy(art,x,y))continue;
     const label=f&&{x:mx+f.x,y:my+f.y,w:f.w,h:f.h,kind:'smallLabel',owner:id};
     const named=!!label&&roomy(label,x,y);
     occupy(art,x,y);if(named)occupy(label,x,y);
     const cell=Math.floor(mx/step)*K+Math.floor(my/step);
     if(!centers.has(cell))centers.set(cell,[]);centers.get(cell).push({x:mx,y:my});
     out.push({id,n,pos:{x:xy[4*n+2],y:xy[4*n+3]},x:o.x,y:o.y,label:named});return;
    }
   };
   if(gapsFrom)for(const g of gapsFrom)rest(g.n,[g]);
   else for(let n=0;n<ids.length;n++)rest(n);
   return out;
  };
  walk(groups);
  if(first&&first.hidden)walk([first,...groups.filter(g=>g!==first)]);
  return {gaps};
 },
 build(items, positions, width, height, level, immersive, footprints=new Map(), featured=[]) {
  const area=globalThis.AtlasLayout.bounds(width,height,immersive);
  const groupZoom=2**(level/3),groups=[],cells=new Map(),index=[],xy=[];
  // Keep overview grouping; deep views merge neighbors within about 25px.
  // Leads stay anchored and the capacity below still caps deep stacks at three.
  const size=Math.max(25,65/Math.max(1,groupZoom));
  const capacity=level<=0?Infinity:Math.max(3,Math.ceil(48/(groupZoom*groupZoom)));
  const ranks=new Map(featured.map((disc,index)=>[disc.id,index]));
  // Optional per-entry label nudge in CSS pixels: shifts only that lead's name so a few-pixel contact does not cost a neighbor its slot.
  const nudges=new Map(featured.filter(disc=>disc.nudge).map(disc=>[disc.id,disc.nudge]));
  const ordered=items.map((d,i)=>({d,i,rank:ranks.get(d.id)??Infinity})).filter(({d})=>d.speed!=null)
   .sort((a,b)=>a.rank-b.rank||a.d.name.localeCompare(b.d.name)||(a.d.brand||'').localeCompare(b.d.brand||'')||a.d.id.localeCompare(b.d.id));
  for(const {d,i} of ordered){
   const pos=positions.get(d.id);if(!pos)continue;
   const x=pos.x*area.width*groupZoom,y=pos.y*area.height*groupZoom,cx=Math.floor(x/size),cy=Math.floor(y/size);
   // Every rated disc, in selection order, for curate's small discs: its index in `items`, then its
   // group-space point and atlas position, packed so the worker can hand them over without copying.
   index.push(i);xy.push(x,y,pos.x,pos.y);
   let nearby=null,best=size*size;
   for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const g of cells.get((cx+dx)+':'+(cy+dy))||[]){
    if(g.members.length>=capacity)continue;
    const distance=(g.px-x)**2+(g.py-y)**2;if(distance<best){best=distance;nearby=g;}
   }
   if(nearby){nearby.members.push(d.id);continue;}
   const g={key:d.id,pos,px:x,py:y,members:[d.id],large:false,nudge:nudges.get(d.id)||null};groups.push(g);
   const key=cx+':'+cy;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(g);
  }
  globalThis.AtlasGroups.promote(groups,footprints,groupZoom,groupZoom);
  // At deep zoom, a dot beside a primary is easier to reach through its stack.
  // Only absorb satellites: established primary positions and priority survive.
  if(groupZoom>3.3){
   // Fixed CSS pixels: deeper zoom must release neighbors, not absorb farther.
   const absorbed=new Set(),radius=64;
   for(const satellite of groups){
    if(satellite.large)continue;
    let nearest=null,best=radius*radius;
    for(const primary of groups){
     if(!primary.large||primary.members.length+satellite.members.length>3)continue;
     const distance=(primary.px-satellite.px)**2+(primary.py-satellite.py)**2;
     if(distance>=best)continue;
     if(!satellite.members.every(id=>{const p=positions.get(id);return Math.hypot(p.x*area.width*groupZoom-primary.px,p.y*area.height*groupZoom-primary.py)<=radius;}))continue;
     nearest=primary;best=distance;
    }
    if(nearest){nearest.members.push(...satellite.members);absorbed.add(satellite);}
   }
   for(let i=groups.length-1;i>=0;i--)if(absorbed.has(groups[i]))groups.splice(i,1);
  }
  return {groups,points:{index:Int32Array.from(index),xy:Float64Array.from(xy)},extent:globalThis.AtlasLayout.extent(new Map(groups.map(g=>[g.key,g.pos])))};
 },
 // build's packed points with their disc ids, as curate takes them (`items` is build's own list).
 pointIds(points,items){return {ids:Array.from(points.index,i=>items[i].id),xy:points.xy};}
};
