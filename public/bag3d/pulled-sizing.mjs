import {assignSides} from './bag-layout.mjs';

// My Bag's desktop-only pulled discs. All values here are screen pixels; the
// viewer projects the resulting centers back onto its existing disc plane.
export const PULLED_SIZE_MS=300;
export const PULLED_SPACE={edge:12,inner:24,gap:12};
const {edge:EDGE,inner:INNER,gap:GAP}=PULLED_SPACE;
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
const weight=(n,total,decay)=>(n**-decay-total**-decay)/(1-total**-decay);

export function pulledDiameter(n,{total,floor,max,zoneBound=max,decay=.5}){
 const ceiling=Math.min(max,zoneBound);
 if(ceiling<floor)throw new RangeError('The zone cannot hold the full-count floor.');
 if(total<=1)return floor;
 n=clamp(n,1,total);
 if(n===1)return ceiling;
 if(n===total)return floor;
 return floor+(ceiling-floor)*weight(n,total,decay);
}

// The largest square disc that fits `count` footprints in a side. Names keep
// their measured size. Trying column counts permits a dense bag to use the
// available width, without shrinking its all-out floor.
function packing(count,width,height,label){
 const choices=[];
 for(let columns=1;columns<=count;columns++){
  const rows=Math.ceil(count/columns),cellWidth=(width-(columns-1)*GAP)/columns;
  if(cellWidth<label.width)continue;
  const diameter=Math.min(cellWidth,(height-(rows-1)*GAP)/rows-label.height);
  if(diameter>0)choices.push({columns,rows,diameter});
 }
 return choices;
}

export function desktopPulledLayout({entries,allEntries,viewport,bag,floor,curve=null}){
 if(!entries.length||!allEntries.length)return null;
 const sides=assignSides(entries),total=Math.ceil(allEntries.length/2);
 const fullSides=assignSides(allEntries),capacity={left:0,right:0};
 for(const side of fullSides.values())capacity[side]++;
 const label={width:Math.max(...allEntries.map(e=>e.label?.width??0)),height:Math.max(...allEntries.map(e=>e.label?.height??0))};
 const zones={
  left:{left:EDGE,right:bag.left-INNER},
  right:{left:bag.left+bag.width+INNER,right:viewport.width-EDGE},
 };
 const width=Math.min(...Object.values(zones).map(z=>z.right-z.left)),height=viewport.height-2*EDGE;
 // Keep the largest one-disc tier. If a dense bag needs more rapid decay than
 // inverse square root, find the least exponent that fits *every* count. The
 // viewer freezes this calibration across camera pullback and count changes.
 const bounds=[];
 for(let count=1;count<=total;count++){
  const bound=Math.max(0,...packing(count,width,height,label).map(p=>p.diameter));
  if(!curve&&bound<floor)return null;
  bounds[count]=bound;
 }
 const max=curve?.max??(total===1?floor:bounds[1]);
 const fits=decay=>Object.values(capacity).every(size=>{
  for(let count=1;count<=size;count++)if(pulledDiameter(count,{total:size,floor,max,decay})>bounds[count]+1e-7)return false;
  return true;
 });
 let decay=curve?.decay??.5;
 if(!curve&&!fits(decay)){
  if(curve||!fits(8))return null;
  let low=.5,high=8;
  for(let i=0;i<32;i++){const mid=(low+high)/2;if(fits(mid))high=mid;else low=mid;}
  decay=high;
 }
 const spots=new Map(),diameters={};
 for(const side of ['left','right']){
  const list=entries.filter(e=>sides.get(e.key)===side).sort((a,b)=>(b.atlas?.y??.5)-(a.atlas?.y??.5)||(a.atlas?.x??.5)-(b.atlas?.x??.5)||String(a.key).localeCompare(String(b.key)));
  if(!list.length)continue;
  const diameter=pulledDiameter(list.length,{total:capacity[side],floor,max,decay});
  const zone=zones[side],zoneWidth=zone.right-zone.left;
  const grid=packing(list.length,zoneWidth,height,label).find(p=>p.diameter>=diameter-1e-6);
  if(!grid)return null;
  const cellWidth=(zoneWidth-(grid.columns-1)*GAP)/grid.columns,cellHeight=(height-(grid.rows-1)*GAP)/grid.rows;
  const spareX=Math.max(0,(cellWidth-Math.max(diameter,label.width))/2);
  list.forEach((entry,index)=>{
   const row=Math.floor(index/grid.columns),column=index%grid.columns;
   // Alternate the across lean in a single column, rather than making a rigid
   // vertical stack. The whole disc/name footprint stays inside its cell.
   const lean=grid.rows>1?(row%2?1:-1)*.72*spareX:0;
   const x=zone.left+column*(cellWidth+GAP)+cellWidth/2+lean;
   const y=EDGE+row*(cellHeight+GAP)+(cellHeight-label.height)/2;
   spots.set(entry.key,{x,y,diameter,side});
  });
  diameters[side]=diameter;
 }
 return {spots,diameters,max,floor,decay};
}

// My Bag's phone pulled discs. The side zones beside a phone's bag are narrower than a
// pulled disc already is, so one or two discs out (PHONE_PULLED_COUNT) grow in the room
// above the bag instead, as large as it holds up to PHONE_PULLED_MAX (a 256 px photo still
// covers that on a 3x display). More discs out keep the original scatter. Screen pixels.
export const PHONE_PULLED_COUNT=2,PHONE_PULLED_MAX=80;

// Rows of disc + name footprints, top to bottom, at one `diameter`; names beside their
// discs, away from the bag ('outer'), or centered under them ('below'). `bag` is the bag's
// body and `standing` the discs that stay in its pockets (the putters stand above it); every
// footprint keeps PULLED_SPACE.inner from each. Each side's discs, fastest first, fill its
// half of each row from the top, innermost room first. Returns {spots: key → {x, y,
// diameter, side}, labels} or null.
export function phonePulledLayout({entries,viewport,bag,standing=[],diameter,labels='outer'}){
 if(!entries.length)return null;
 const sides=assignSides(entries),d=diameter;
 const foot=entry=>{
  const w=entry.label?.width??0,h=entry.label?.height??0;
  return labels==='outer'?{width:d+w,height:Math.max(d,h)}:{width:Math.max(d,w),height:d+h};
 };
 const feet=new Map(entries.map(entry=>[entry.key,foot(entry)]));
 const rowHeight=Math.max(...[...feet.values()].map(f=>f.height));
 const middle=bag.left+bag.width/2,blocks=[bag,...standing].map(r=>({left:r.left-INNER,right:r.left+r.width+INNER,top:r.top-INNER,bottom:r.top+r.height+INNER}));
 // A side's free room in a row: its half of the canvas less every block level with the row,
 // innermost (nearest the bag's middle) first.
 const room=(top,side)=>{
  let spans=[side==='left'?{from:EDGE,to:middle-GAP/2}:{from:middle+GAP/2,to:viewport.width-EDGE}];
  for(const block of blocks){
   if(!(top<block.bottom&&top+rowHeight>block.top))continue;
   spans=spans.flatMap(span=>[{from:span.from,to:Math.min(span.to,block.left)},{from:Math.max(span.from,block.right),to:span.to}]).filter(span=>span.to-span.from>1e-9);
  }
  return side==='left'?spans.sort((a,b)=>b.to-a.to):spans.sort((a,b)=>a.from-b.from);
 };
 const rows=[];
 for(let top=EDGE;top+rowHeight<=viewport.height-EDGE+1e-9;top+=rowHeight+GAP)rows.push(top);
 const spots=new Map();
 for(const side of ['left','right']){
  const list=entries.filter(e=>sides.get(e.key)===side).sort((a,b)=>(b.atlas?.y??.5)-(a.atlas?.y??.5)||(a.atlas?.x??.5)-(b.atlas?.x??.5)||String(a.key).localeCompare(String(b.key)));
  let index=0;
  for(const top of rows)for(const span of room(top,side)){
   if(index>=list.length)break;
   const width=span.to-span.from,taken=[];
   let used=0;
   while(index<list.length){
    const next=used+(taken.length?GAP:0)+feet.get(list[index].key).width;
    if(next>width+1e-9)break;
    used=next;taken.push(list[index++]);
   }
   if(!taken.length)continue;
   // Spread a span's discs evenly across it, the disc toward the bag and its name outward.
   const spare=(width-used)/(taken.length+1),out=side==='left'?-1:1;
   let x=side==='left'?span.to:span.from;
   for(const entry of taken){
    const f=feet.get(entry.key);
    x+=out*spare;
    spots.set(entry.key,{x:x+out*(labels==='outer'?d:f.width)/2,y:top+(labels==='outer'?rowHeight/2:d/2),diameter:d,side});
    x+=out*(f.width+GAP);
   }
  }
  if(index<list.length)return null;
 }
 return {spots,labels,diameter:d};
}

// The largest phone layout up to `cap` (null when even `min` does not fit): each name
// placement is searched, the larger taken.
export function phonePulledFit({entries,viewport,bag,standing=[],cap,min=0}){
 let best=null;
 for(const labels of ['outer','below']){
  const at=d=>phonePulledLayout({entries,viewport,bag,standing,diameter:d,labels});
  if(!at(min))continue;
  let low=min,high=cap;
  if(at(cap))low=cap;
  else for(let i=0;i<24;i++){const mid=(low+high)/2;if(at(mid))low=mid;else high=mid;}
  if(!best||low>best.diameter+1e-6)best=at(low);
 }
 return best;
}
