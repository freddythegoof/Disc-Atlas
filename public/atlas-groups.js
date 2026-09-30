/* Pure world-space grouping, shared by the initial render and the background worker. */
globalThis.AtlasGroups = {
 build(items, positions, width, height, level, immersive) {
  const area=globalThis.AtlasLayout.bounds(width,height,immersive);
  const groupZoom=2**(level/3),groups=[],cells=new Map(),size=65;
  const scattered=globalThis.AtlasLayout.spread(items,positions,area.width*groupZoom,area.height*groupZoom);
  const featured=['destroyer','wraith','buzzz','zone','hex','crave','envy','luna','teebird'];
  const ordered=items.filter(d=>d.speed!=null).map(d=>({d,rank:featured.indexOf(d.name.toLowerCase())}))
   .sort((a,b)=>(a.rank<0?99:a.rank)-(b.rank<0?99:b.rank)||a.d.id.localeCompare(b.d.id));
  for(const {d} of ordered){
   const pos=(scattered||positions).get(d.id);if(!pos)continue;
   const x=pos.x*area.width*groupZoom,y=pos.y*area.height*groupZoom,cx=Math.floor(x/size),cy=Math.floor(y/size);
   let nearby=null,best=size*size;
   for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const g of cells.get((cx+dx)+':'+(cy+dy))||[]){
    const distance=(g.px-x)**2+(g.py-y)**2;if(distance<best){best=distance;nearby=g;}
   }
   if(nearby){nearby.members.push(d.id);continue;}
   const g={key:d.id,pos,px:x,py:y,members:[d.id],large:false};groups.push(g);
   const key=cx+':'+cy;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(g);
  }
  // Sparse collections show every disc; dense zoomed views still need room for names.
  const large=[],clearance=scattered&&ordered.length<=60?72:width<700?105:155;
  for(const g of groups)if(large.every(other=>(other.px-g.px)**2+(other.py-g.py)**2>clearance**2)){g.large=true;large.push(g);}
  return {groups,extent:globalThis.AtlasLayout.extent(new Map(groups.map(g=>[g.key,g.pos])))};
 }
};
