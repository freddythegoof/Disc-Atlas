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
 segmentsCross(a,b) {
  if(Math.max(a.x1,a.x2)<Math.min(b.x1,b.x2)||Math.max(b.x1,b.x2)<Math.min(a.x1,a.x2)||
   Math.max(a.y1,a.y2)<Math.min(b.y1,b.y2)||Math.max(b.y1,b.y2)<Math.min(a.y1,a.y2))return false;
  const cross=(x1,y1,x2,y2,x3,y3)=>(x2-x1)*(y3-y1)-(y2-y1)*(x3-x1);
  return cross(a.x1,a.y1,a.x2,a.y2,b.x1,b.y1)*cross(a.x1,a.y1,a.x2,a.y2,b.x2,b.y2)<=0&&
   cross(b.x1,b.y1,b.x2,b.y2,a.x1,a.y1)*cross(b.x1,b.y1,b.x2,b.y2,a.x2,a.y2)<=0;
 },
 // Rectangles are measured from the rendered name/brand label in CSS pixels.
 // Keep priority order; screen-space contention alone determines prominence.
 promote(groups, footprints, zoom, groupZoom, satelliteFootprints) {
  const occupied=new Map(),cellSize=128,scale=1+.08*(Math.min(4,zoom)-1),ratio=zoom/groupZoom;
  const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const cells=box=>{
   const keys=[];
   for(let x=Math.floor(box.x/cellSize);x<=Math.floor((box.x+box.w)/cellSize);x++)
    for(let y=Math.floor(box.y/cellSize);y<=Math.floor((box.y+box.h)/cellSize);y++)keys.push(x+':'+y);
   return keys;
  };
  for(const g of groups){
   g.labelVisible=false;
   g.labelOffset=null;g.markerOffset=null;g.satellite=false;g.leader=null;
   const f=footprints.get(g.key);
   if(!f){g.large=false;continue;}
   const x=g.px*ratio,y=-g.py*ratio,r=f.radius*scale;
   const label={x:x+f.x,y:y+f.y,w:f.w,h:f.h};
   const marker={x:x-r,y:y-r,w:2*r,h:2*r};
   const boxes=[label,marker],keys=boxes.map(cells);
   g.large=!boxes.some((box,i)=>keys[i].some(key=>(occupied.get(key)||[]).some(b=>overlaps(box,b))));
   if(g.large)boxes.forEach((box,i)=>keys[i].forEach(key=>{
    if(!occupied.has(key))occupied.set(key,[]);occupied.get(key).push(box);
   }));
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
 build(items, positions, width, height, level, immersive, footprints=new Map(), featured=[]) {
  const area=globalThis.AtlasLayout.bounds(width,height,immersive);
  const groupZoom=2**(level/3),groups=[],cells=new Map();
  // Keep overview grouping; deep views merge neighbors within about 25px.
  // Leads stay anchored and the capacity below still caps deep stacks at three.
  const size=Math.max(25,65/Math.max(1,groupZoom));
  const capacity=level<=0?Infinity:Math.max(3,Math.ceil(48/(groupZoom*groupZoom)));
  const ranks=new Map(featured.map((disc,index)=>[disc.id,index]));
  const ordered=items.filter(d=>d.speed!=null).map(d=>({d,rank:ranks.get(d.id)??Infinity}))
   .sort((a,b)=>a.rank-b.rank||a.d.name.localeCompare(b.d.name)||(a.d.brand||'').localeCompare(b.d.brand||'')||a.d.id.localeCompare(b.d.id));
  for(const {d} of ordered){
   const pos=positions.get(d.id);if(!pos)continue;
   const x=pos.x*area.width*groupZoom,y=pos.y*area.height*groupZoom,cx=Math.floor(x/size),cy=Math.floor(y/size);
   let nearby=null,best=size*size;
   for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const g of cells.get((cx+dx)+':'+(cy+dy))||[]){
    if(g.members.length>=capacity)continue;
    const distance=(g.px-x)**2+(g.py-y)**2;if(distance<best){best=distance;nearby=g;}
   }
   if(nearby){nearby.members.push(d.id);continue;}
   const g={key:d.id,pos,px:x,py:y,members:[d.id],large:false};groups.push(g);
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
  return {groups,extent:globalThis.AtlasLayout.extent(new Map(groups.map(g=>[g.key,g.pos])))};
 }
};
