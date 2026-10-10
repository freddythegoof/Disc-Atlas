// Storage racks, as pure math (no three.js, so Node tests read it). The rack model is Freddy's wooden
// rack (wooden-disc-rack.glb): metres, Y up, +Z toward the viewer, 72 upright slots. Slots run left to
// right, top tier first: 0–23 top, 24–47 middle, 48–71 bottom, eight to a bay, three bays to a tier.
// A full rack starts another, with no limit: rack count is just ceil(discs / 72), and never zero.

export const RACK_CAPACITY=72;
export const SLOTS_PER_BAY=8,BAYS_PER_TIER=3,SLOTS_PER_TIER=SLOTS_PER_BAY*BAYS_PER_TIER;
// Model bounds (README, model-info.json): 96 × 108 × 33 cm. Racks stand side by side with a hand's gap.
export const RACK_WIDTH=.96,RACK_HEIGHT=1.081,RACK_DEPTH=.328,RACK_GAP=.14;
// A slot's rest node sits this far above its shelf (build_rack.py: floor + .111).
export const SLOT_REST_HEIGHT=.111;
// Discs stand on the shelf with this much air under them, so no rim sinks into a slat.
export const SHELF_CLEARANCE=.002;
// Storage order: drivers on the top tier, putters at the bottom, like a tidy shelf.
export const CLASS_ORDER=['distance','fairway','mid','putter','unknown'];

export const rackCount=discs=>Math.max(1,Math.ceil(Math.max(0,discs|0)/RACK_CAPACITY));

// Where the nth stored disc (0-based) lives.
export function rackSlot(index){
 if(!Number.isInteger(index)||index<0)throw new RangeError('A rack index is a whole number from 0.');
 const rack=Math.floor(index/RACK_CAPACITY),slot=index%RACK_CAPACITY;
 return {rack,slot,tier:Math.floor(slot/SLOTS_PER_TIER),bay:Math.floor(slot%SLOTS_PER_TIER/SLOTS_PER_BAY)};
}

// Each rack's centre on X; the row is centred on the origin.
export const rackX=(rack,count)=>(rack-(count-1)/2)*(RACK_WIDTH+RACK_GAP);
export const rowWidth=count=>count*RACK_WIDTH+(count-1)*RACK_GAP;

// A disc's centre height in its slot: the shelf top plus its own radius (metres), so a 21.7 cm putter
// and a 21.1 cm driver both stand on the slats.
export const restHeight=(slotRestY,radius)=>slotRestY-SLOT_REST_HEIGHT+radius+SHELF_CLEARANCE;

// The stored discs in rack order: by class, then the bag's own comparator inside each class.
export function rackOrder(items,{classOf,compare=()=>0}){
 const rank=item=>{const i=CLASS_ORDER.indexOf(classOf(item));return i<0?CLASS_ORDER.length:i;};
 return [...items].sort((a,b)=>rank(a)-rank(b)||compare(a,b));
}

// Where a pulled disc shows itself: in front of its own bay, raised to eye level and turned face out.
export function pulledSpot(rest,{bayX}){return [bayX,Math.max(rest[1],.56)+.04,.42];}
