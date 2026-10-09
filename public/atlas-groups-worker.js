/* Regrouping can be expensive at dense zoom levels, so do it away from input frames. */
self.window=self;
importScripts('atlas-layout.js','atlas-groups.js');
self.onmessage=event=>{
 const {revision,level,items,positions,width,height,immersive,personal,footprints,featured,organic}=event.data;
 // My Map's positions already include its personal lens; only the Atlas spreads filtered sets.
 const base=new Map(positions),shown=personal?base:AtlasLayout.adapt(items,base,width,height,immersive);
 const prints=new Map(footprints),result=AtlasGroups.build(items,shown,width,height,level,immersive,prints,featured);
 // Curate the level as the main thread would at any zoom the level shows at, keyed the same way.
 if(organic){
  const area=AtlasLayout.bounds(width,height,immersive),chrome=Object.assign(organic.chrome,{key:organic.chromeKey});
  const options=AtlasGroups.organicOptions({area,width,height,level,zoom:AtlasGroups.organicRange(level).floor,extent:result.extent,chrome});
  const first=organic.first?result.groups.find(g=>g.members.includes(organic.first)):null;
  result.gaps=AtlasGroups.curate(result.groups,prints,options.zoom,2**(level/3),{...options,first,points:AtlasGroups.pointIds(result.points,items)}).gaps;
  result.prominence=options.key+'|'+first?.key;
 }
 // The packed points move to the main thread rather than being copied.
 self.postMessage({revision,level,...result},[result.points.index.buffer,result.points.xy.buffer]);
};
