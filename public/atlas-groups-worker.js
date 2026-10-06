/* Regrouping can be expensive at dense zoom levels, so do it away from input frames. */
self.window=self;
importScripts('atlas-layout.js','atlas-groups.js');
self.onmessage=event=>{
 const {revision,level,items,positions,width,height,immersive,footprints,featured}=event.data;
 // A filtered map spreads into the room it frees; the unfiltered catalog keeps its positions.
 const shown=AtlasLayout.adapt(items,new Map(positions),width,height,immersive);
 const result=AtlasGroups.build(items,shown,width,height,level,immersive,new Map(footprints),featured);
 self.postMessage({revision,level,...result});
};
