/* Regrouping can be expensive at dense zoom levels, so do it away from input frames. */
self.window=self;
importScripts('atlas-layout.js','atlas-groups.js');
self.onmessage=event=>{
 const {revision,level,items,positions,width,height,immersive,personal,footprints,featured}=event.data;
 // My Map's positions already include its personal lens; only the Atlas spreads filtered sets.
 const base=new Map(positions),shown=personal?base:AtlasLayout.adapt(items,base,width,height,immersive);
 const result=AtlasGroups.build(items,shown,width,height,level,immersive,new Map(footprints),featured);
 self.postMessage({revision,level,...result});
};
