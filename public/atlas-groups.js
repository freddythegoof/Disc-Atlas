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
 // Tiers 2 and 3 of the organic overview: the rest of the rated catalog resting in the room the
 // curated discs leave, a field they sit in front of. Small discs (`small`) take the room first; minis
 // (`mini`) fill what is still left. Each tier is a share of a curated disc (76px `disc` art times
 // artRoom): its `start` at 1x, two thirds for a small disc and 12px for a mini, growing evenly in log
 // zoom to all of it at the deepest zoom (`top`, the map's 9x), where every tier is a full-size disc.
 // One rule names both: a name's strength follows its disc's size on screen, none below `labelFrom`
 // px, all from `labelFull`, smooth between (nameAlpha), and it is reserved only where it will show;
 // where it shows at least `named` strength, a disc rests only with its name, never as a nameless one.
 // The name is a curated disc's (name and manufacturer), sitting as far below the disc's edge as a
 // curated name sits below its 76px art (gapDrop). Each rests within `reach` of its own radius from its
 // point. It keeps `art` px from a curated disc, `label` px from a curated name and `apart` px from
 // another small disc, mini or name, with its tier's `space` (`phoneSpace` under 700px) between its
 // room and another of the same tier, and a mini keeps `clear` px between its room and a small disc's.
 // At 1x they draw at `far` strength, quieter than the discs in front, coming up to full as they grow.
 GAP:{disc:76,top:9,labelFrom:54,labelFull:84,named:.5,reach:.6,art:20,label:8,apart:6,far:.72,
  small:{start:2/3,space:48,phoneSpace:40},mini:{start:12/76,space:48,phoneSpace:40,clear:24}},
 TIERS:['small','mini'],
 // How far toward the deepest zoom `zoom` is: 0 at 1x, 1 at GAP.top, even in log zoom.
 gapDepth(zoom){return Math.max(0,Math.min(1,Math.log(zoom)/Math.log(this.GAP.top)));},
 gapSize(zoom,tier='small'){const G=this.GAP,s=G[tier].start;return G.disc*this.artRoom(zoom)*(s+(1-s)*this.gapDepth(zoom));},
 gapAlpha(zoom){const G=this.GAP;return G.far+(1-G.far)*this.gapDepth(zoom);},
 // How visible a small disc's or mini's name is at its size on screen: the one rule for both tiers.
 nameAlpha(size,tier='mini'){
  if(tier==='small')return 1;
  const {labelFrom:a,labelFull:b}=this.GAP,t=Math.max(0,Math.min(1,(size-a)/(b-a)));
  return t*t*(3-2*t);
 },
 gapLabelAlpha(zoom,tier='small'){return this.nameAlpha(this.gapSize(zoom,tier),tier);},
 // How far above a curated disc's name (footprint y) a `size` px disc's name sits: as far below its
 // own edge, until it reaches the curated art, whose name stays put as the art grows past it.
 gapDrop(size){return (Math.min(size,this.GAP.disc)-this.GAP.disc)/2;},
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
 //    size; a lead with no room at full size rests as a dot, a small disc of tier 2's size (its name
 //    on hover and focus), within the same reach and clear of everything; with no room even for
 //    that, its discs join
 //    the stack of the nearest placed disc (`joined`). The overview never shows dots.
 // 7. Tiers 2 and 3 (GAP), in a view that hides discs: every other rated disc (`points`, from
 //    pointIds, in the same order) may rest as a small disc near its own atlas point, within
 //    GAP.reach of its room, where it is clear of every curated disc, name and chrome and of the
 //    small discs placed before it (8 spots: its seeded toss, its point and 6 around its reach).
 //    A second walk, in the same order, rests the discs still left as minis in the room that
 //    is still clear. A tier's discs are sized for the level's top zoom. Where a tier's names will
 //    show (`gapLabels`), a disc gets its name if that is clear too, and later discs keep off it. A
 //    disc that would crowd anything is not placed. Curated discs never move for them.
 //    In a complete view the dots are the small discs: where names will show, a dot whose name is
 //    clear gets it (`gapLabel`); where a dot rests is unchanged. `gapsFrom` (a camera between levels,
 //    laid out on every frame) keeps the level's own small discs and minis at their spots where they
 //    are still clear, rather than walking the whole catalog again.
 // It is seeded by disc id, so the same data, view, zoom and selection always rest the same way.
 // `spacing` is the least distance between disc centers in an overview: 138px on desktop (24 discs
 // at 1x on a 1440 x 900 map, under the cap of 29), 112px on maps under 700px wide, where the same
 // 76px art fills far more of the screen.
 ORGANIC:{perView:32,view:1320*640,min:8,reach:.6,gap:12,spacing:138,phoneSpacing:112,region:300},
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
 // Curate options for a level and camera zoom: the zoom to rest discs at, the cap and spacing, `unitY`
 // (px per atlas unit of speed axis at that zoom, for the speed band), and
 // for a 1x layout (level 0, or any level a tween shows at 1x) the map's edges and `chrome` (rects
 // in map pixels) as fixed spots in group space, placed for the camera 1x pins (centered on `extent`). `key` names everything that
 // shapes the result, so a worker's curation stands in for the main thread's.
 organicOptions({area,width,height,level,zoom,extent,chrome=[]}){
  const at=this.organicZoom(level,zoom),{top}=this.organicRange(level),overview=at===1,inset=4;
  const pan=overview?globalThis.AtlasLayout.constrain({zoom:1,x:0,y:0},area,extent):{x:0,y:0},origin={x:area.left+pan.x,y:area.bottom+pan.y};
  const tiers=f=>Object.fromEntries(this.TIERS.map(t=>[t,f(t)]));
  return {zoom:at,artZoom:top,stretch:Math.max(1,top/at),unitY:area.height*at,cap:this.organicCap(area.view,at),spacing:width<700?this.ORGANIC.phoneSpacing:this.ORGANIC.spacing,
   gapSpacing:tiers(t=>width<700?this.GAP[t].phoneSpace:this.GAP[t].space),gapLabels:tiers(t=>this.gapLabelAlpha(Math.max(at,top),t)>0),
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
 curate(groups,footprints,zoom,groupZoom,{cap=Infinity,gap=this.ORGANIC.gap,spacing=this.ORGANIC.spacing,obstacles=[],frame=null,first=null,artZoom=zoom,stretch=1,points=null,gapSpacing=null,gapLabels=false,gapsFrom=null,unitY=null}={}){
  // This can run on camera frames, so the grids use numeric keys and a lead fails fast.
  const cellSize=128,scale=this.artRoom(Math.max(zoom,artZoom)),ratio=zoom/groupZoom,K=1<<20;
  const tiers=f=>Object.fromEntries(this.TIERS.map(t=>[t,f(t)]));
  gapSpacing=gapSpacing||tiers(t=>this.GAP[t].space);
  if(typeof gapLabels!=='object')gapLabels=tiers(()=>!!gapLabels);
  const near=(a,b,pad)=>a.x-pad<b.x+b.w&&a.x+a.w+pad>b.x&&a.y-pad<b.y+b.h&&a.y+a.h+pad>b.y;
  const outside=box=>frame&&(box.x<frame.x||box.y<frame.y||box.x+box.w>frame.x+frame.w||box.y+box.h>frame.y+frame.h);
  const region=g=>Math.floor(g.px*ratio/this.ORGANIC.region)*K+Math.floor(-g.py*ratio/this.ORGANIC.region);
  // Every tier rests in its speed band (AtlasLayout.BAND): a rest spot `o` from a point at y px (down)
  // is drawn up or down to within CEIL of its disc's true speed, ty in atlas units. The point is in the
  // band, so the spot only comes nearer it. Zooming in within a level only shrinks a rest offset in
  // atlas units, so a spot in band at the curate zoom stays in band.
  const edge=globalThis.AtlasLayout.CEIL*unitY;
  const banded=(o,y,ty)=>{
   if(!unitY||ty==null)return o;
   const line=-ty*unitY,my=Math.max(line-edge,Math.min(line+edge,y+o.y));
   return my===y+o.y?o:{x:o.x,y:my-y};
  };
  const complete=groups.reduce((n,g)=>n+g.members.length,0)<=cap;
  if(complete)spacing=0;
  const G=this.GAP;let gaps=[];
  // Each tier's room (half its art) at the level's top, its largest, and the box its name needs: a
  // curated name's, from where it hangs at this zoom down to where it hangs at the top, as it follows
  // the growing disc.
  const rooms=tiers(t=>this.gapSize(Math.max(zoom,artZoom),t)/2);
  const must=tiers(t=>gapLabels[t]&&this.gapLabelAlpha(zoom,t)>=G.named);
  const nameBox=(f,tier,x,y,owner)=>{
   const low=this.gapDrop(this.gapSize(zoom,tier)),high=this.gapDrop(2*rooms[tier]);
   return {x:x+f.x,y:y+f.y+low,w:f.w,h:f.h+high-low,kind:'smallLabel',owner};
  };
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
    for(const spot of this.organicOffsets(g.key,reach)){
     const o=banded(spot,y,g.ty),mx=x+o.x,my=y+o.y;
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
   if(!complete){if(points)gaps=gapWalk(roomy,occupy,arts);return;}
   for(const g of order){
    const f=footprints.get(g.key);if(!g.hidden||!f)continue;
    const x=g.px*ratio,y=-g.py*ratio,r=rooms.small,reach=f.radius*this.ORGANIC.reach;
    if(hemmed(x,y,r,reach))continue;
    for(const spot of this.organicOffsets(g.key,reach)){
     const o=banded(spot,y,g.ty),dot={x:x+o.x-r,y:y+o.y-r,w:2*r,h:2*r};
     if(blocked(dot,x,y))continue;
     // Where its name shows strongly, it rests only with it.
     const label=must.small&&nameBox(f,'small',x+o.x,y+o.y,g.key);
     if(label&&!roomy(label,x,y))continue;
     dot.kind='small';dot.owner=g.key;occupy(dot,x,y);g.hidden=false;g.markerOffset=o;
     if(label){occupy(label,x,y);g.gapLabel=true;}
     break;
    }
   }
   // Names for the dots, where they will show and are clear. Placement above is already final.
   if(gapLabels.small)for(const g of order){
    const f=footprints.get(g.key);if(g.hidden||g.large||g.gapLabel||!f)continue;
    const label=nameBox(f,'small',g.px*ratio+g.markerOffset.x,-g.py*ratio+g.markerOffset.y,g.key);
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
  // Tiers 2 and 3 rest after the curated walk, in the room it left: small discs first, then minis.
  const gapWalk=(roomy,occupy,arts)=>{
   const shown=new Set(),rested=new Set(),centers=tiers(()=>new Map()),out=[];
   // Each tier's art is sized for the largest it draws at on this level, and its least distance
   // between centers follows: its room twice over and its space.
   const reach=tiers(t=>rooms[t]*G.reach),step=tiers(t=>2*rooms[t]+gapSpacing[t]);
   for(const g of groups)if(!g.hidden)shown.add(g.key);
   const near=(tier,x,y,within)=>{
    const cx=Math.floor(x/step[tier]),cy=Math.floor(y/step[tier]);
    for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const c of centers[tier].get((cx+i)*K+cy+j)||[])if((c.x-x)**2+(c.y-y)**2<within*within)return true;
    return false;
   };
   // Is (x, y) too near a placed center, less `slack`? Same-tier centers keep the tier's step; a
   // mini also keeps `clear` between its room and a small disc's.
   const crowded=(tier,x,y,slack=0)=>near(tier,x,y,step[tier]-slack)||tier==='mini'&&near('small',x,y,rooms.small+rooms.mini+G.mini.clear-slack);
   // A curated disc so close to the point that no spot within reach clears it.
   const hemmed=(tier,x,y,r)=>{
    const cx=Math.floor(x/cellSize),cy=Math.floor(y/cellSize);
    for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(const a of arts.get((cx+i)*K+cy+j)||[])
     if(Math.max(Math.abs(a.x-x),Math.abs(a.y-y))<a.r+r+G.art-reach[tier])return true;
    return false;
   };
   const {ids,xy,ty}=points;
   // Rest point n as a `tier` disc at the first clear spot of `spots`; `n` names it in `points` for gapsFrom.
   const rest=(n,tier,spots)=>{
    const id=ids[n];if(shown.has(id)||rested.has(id))return;
    const x=xy[4*n]*ratio,y=-xy[4*n+1]*ratio,r=rooms[tier];
    if(crowded(tier,x,y,reach[tier])||hemmed(tier,x,y,r))return;
    const f=gapLabels[tier]?footprints.get(id):null;
    for(const spot of spots||this.organicOffsets(id,reach[tier],6)){
     const o=banded(spot,y,ty?.[n]),mx=x+o.x,my=y+o.y;
     if(crowded(tier,mx,my))continue;
     const art={x:mx-r,y:my-r,w:2*r,h:2*r,kind:'small',owner:id};
     if(!roomy(art,x,y))continue;
     const label=f&&nameBox(f,tier,mx,my,id);
     const named=!!label&&roomy(label,x,y);if(must[tier]&&!named)continue;
     occupy(art,x,y);if(named)occupy(label,x,y);rested.add(id);
     const cell=Math.floor(mx/step[tier])*K+Math.floor(my/step[tier]);
     if(!centers[tier].has(cell))centers[tier].set(cell,[]);centers[tier].get(cell).push({x:mx,y:my});
     out.push({id,n,tier,pos:{x:xy[4*n+2],y:xy[4*n+3]},x:o.x,y:o.y,label:named});return;
    }
   };
   if(gapsFrom)for(const g of gapsFrom)rest(g.n,g.tier,[g]);
   else for(const tier of this.TIERS)for(let n=0;n<ids.length;n++)rest(n,tier);
   return out;
  };
  walk(groups);
  if(first&&first.hidden)walk([first,...groups.filter(g=>g!==first)]);
  return {gaps};
 },
 build(items, positions, width, height, level, immersive, footprints=new Map(), featured=[]) {
  const area=globalThis.AtlasLayout.bounds(width,height,immersive);
  const groupZoom=2**(level/3),groups=[],cells=new Map(),index=[],xy=[],ty=[];
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
   // group-space point and atlas position, and its true speed-axis position (`ty`, for curate's
   // speed band), packed so the worker can hand them over without copying.
   const speed=(d.speed-1)/14;
   index.push(i);xy.push(x,y,pos.x,pos.y);ty.push(speed);
   let nearby=null,best=size*size;
   for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const g of cells.get((cx+dx)+':'+(cy+dy))||[]){
    if(g.members.length>=capacity)continue;
    const distance=(g.px-x)**2+(g.py-y)**2;if(distance<best){best=distance;nearby=g;}
   }
   if(nearby){nearby.members.push(d.id);continue;}
   const g={key:d.id,pos,px:x,py:y,ty:speed,members:[d.id],large:false,nudge:nudges.get(d.id)||null};groups.push(g);
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
  return {groups,points:{index:Int32Array.from(index),xy:Float64Array.from(xy),ty:Float64Array.from(ty)},extent:globalThis.AtlasLayout.extent(new Map(groups.map(g=>[g.key,g.pos])))};
 },
 // build's packed points with their disc ids, as curate takes them (`items` is build's own list).
 pointIds(points,items){return {ids:Array.from(points.index,i=>items[i].id),xy:points.xy,ty:points.ty};}
};
