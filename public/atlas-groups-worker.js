/* Regrouping can be expensive at dense zoom levels, so do it away from input frames. */
self.window=self;
importScripts('atlas-layout.js','atlas-groups.js');
self.onmessage=event=>{
 const {revision,level,items,positions,width,height,immersive,footprints}=event.data;
 const result=AtlasGroups.build(items,new Map(positions),width,height,level,immersive,new Map(footprints));
 self.postMessage({revision,level,...result});
};
