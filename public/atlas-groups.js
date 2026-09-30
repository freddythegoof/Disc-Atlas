/* Pure world-space grouping, shared by the initial render and the background worker. */
globalThis.AtlasGroups = {
 // Rectangles are measured from the rendered name/brand label in CSS pixels.
 // Keep priority order; screen-space contention alone determines prominence.
 promote(groups, footprints, zoom, groupZoom) {
  const occupied=new Map(),cellSize=128,scale=1+.08*(Math.min(4,zoom)-1),ratio=zoom/groupZoom;
  const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const cells=box=>{
   const keys=[];
   for(let x=Math.floor(box.x/cellSize);x<=Math.floor((box.x+box.w)/cellSize);x++)
    for(let y=Math.floor(box.y/cellSize);y<=Math.floor((box.y+box.h)/cellSize);y++)keys.push(x+':'+y);
   return keys;
  };
  for(const g of groups){
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
  return {groups,extent:globalThis.AtlasLayout.extent(new Map(groups.map(g=>[g.key,g.pos])))};
 }
};
