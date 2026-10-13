// The atlas art's levels of detail and which one a disc on screen is drawn at. Kept apart from atlas-art.mjs
// (which needs three.js and WebGL) so the choice can be tested on its own.
//
// `css`: the largest on-screen diameter a level serves. The full level covers a curated disc at its
// largest (76 px × artRoom 1.24 = 94 px).
export const LODS=Object.freeze({
 low:Object.freeze({css:24,segments:24,detail:.35}),
 mid:Object.freeze({css:64,segments:48,detail:.6}),
 full:Object.freeze({css:96,segments:96,detail:1}),
});
export const ORDER=Object.freeze(['low','mid','full']);
// A disc keeps its level until its size is this share past a threshold, so a size hovering at a threshold
// (a slow wheel nudge) never flips it back and forth. A held level also stands in, scaled, for a growing
// disc only up to HOLD_LIMIT times its own size: beyond that it is too soft to keep showing.
export const LOD_MARGIN=.18,HOLD_LIMIT=1.5;

// The level `size` (CSS px) needs. With `prev`, the level the disc is drawn at now, it stays there until
// `size` leaves that level's range by LOD_MARGIN; with `hold` as well (the camera is mid-zoom) it stays
// until a growing disc outgrows the level's image (HOLD_LIMIT), and a shrinking one always keeps it.
export function lodFor(size,prev,hold=false){
 const plain=size<=LODS.low.css?'low':size<=LODS.mid.css?'mid':'full';
 if(!prev||!LODS[prev])return plain;
 const i=ORDER.indexOf(prev),top=LODS[prev].css,bottom=i?LODS[ORDER[i-1]].css:0;
 if(hold)return size<=(i<ORDER.length-1?top*HOLD_LIMIT:Infinity)?prev:plain;
 return size>bottom*(1-LOD_MARGIN)&&(i===ORDER.length-1||size<=top*(1+LOD_MARGIN))?prev:plain;
}
