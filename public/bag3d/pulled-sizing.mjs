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
