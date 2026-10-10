// The Lost tab's graveyard, as pure math and words (no three.js, so Node tests read it).
// One plot per lost disc, newest first, in centred rows that step back from the viewer. Metres, Y up.

export const PLOT_WIDTH=.64,PLOT_DEPTH=.9;
// Each stone leans and turns a touch, the same way every visit (seeded by the disc's id).
export const MAX_LEAN=4,MAX_TURN=7;

// FNV-1a: a small, stable hash so every disc keeps its own epitaph and lean.
export function hash(text){
 let h=0x811c9dc5;
 for(const ch of String(text)){h^=ch.codePointAt(0);h=Math.imul(h,0x01000193)>>>0;}
 return h>>>0;
}
const unit=(seed,salt)=>hash(seed+':'+salt)/0xffffffff;

// Columns for a canvas width (CSS px): three on a phone, up to five on a desktop; never more than plots.
export const graveColumns=(width,count)=>Math.max(1,Math.min(count,width<520?3:width<900?4:5));

export function plots(ids,columns){
 const rows=Math.ceil(ids.length/columns);
 return ids.map((id,i)=>{
  const row=Math.floor(i/columns),col=i%columns,inRow=Math.min(columns,ids.length-row*columns);
  // Every other row shifts half a plot, so the back stones peek between the front ones.
  const shift=row%2&&inRow===columns&&columns>1?PLOT_WIDTH*.25:0;
  return {id,row,col,rows,
   x:(col-(inRow-1)/2)*PLOT_WIDTH+shift+(unit(id,'x')-.5)*.06,
   z:-row*PLOT_DEPTH,
   lean:(unit(id,'lean')-.5)*2*MAX_LEAN,
   turn:(unit(id,'turn')-.5)*2*MAX_TURN,
   variant:hash(id)%3};
 });
}

// Funny, never cruel: these were good discs. Context lines win when the story names the culprit (water,
// trees); course names (Maple Hill, Lake Park) don't count. Otherwise the disc's class picks the pool,
// mixed with the general pool.
const EPITAPHS={
 any:['Flew true. Landed somewhere new.','Gone to the big basket in the sky.','It just wanted to see the world.','Last seen chasing the fade.','Taken too soon, and a little too far left.','Never chained out. Never forgotten.','Somewhere out there, still flying.','Forever in the rough. Forever in our hearts.'],
 distance:['All arm. No fade. No regrets.','It finally got the distance it always wanted.','Threw it to the moon. It stayed.'],
 fairway:['Hit the gap. Found a different one.','Straight as an arrow, right up until it wasn’t.','Threaded every line but the last.'],
 mid:['Steady to the very end.','It turned over. It never turned back.','Reliable in every way but one.'],
 putter:['Never missed from circle one. Missed the parking lot.','Short game. Long goodbye.','It putted its way into our hearts.'],
 water:['Went for a swim. Stayed for good.','The pond keeps the good ones.','Skipped once. Skipped twice. Skipped town.'],
 trees:['The trees took it. The trees always take the good ones.','Branched out. Never came back.'],
};
const WATER=/\b(water|pond|lake|creek|river|stream|splash|swim|sank|sunk|drink|ocean|bay)\b/i;
const TREES=/\b(trees?|woods|forest|brush|bush|bushes|thicket|branch|branches|canopy|leaves|pines?|oaks?|birch|spruce|cedars?|willows?|maples?)\b/i;

export function epitaph(item,classKey='unknown'){
 const text=item.lostStory||'';
 const pool=WATER.test(text)?EPITAPHS.water:TREES.test(text)?EPITAPHS.trees:[...(EPITAPHS[classKey]||[]),...EPITAPHS.any];
 return pool[hash(item.id)%pool.length];
}

// "Mar 2025 – Oct 8, 2026": from the day it joined the collection to the day it was lost.
export function lifespan(item,{locale='en-US'}={}){
 const lost=new Date(item.lostDate+'T12:00:00');
 const end=new Intl.DateTimeFormat(locale,{month:'short',day:'numeric',year:'numeric'}).format(lost);
 const added=item.added_at?new Date(item.added_at):null;
 if(!added||Number.isNaN(+added)||added>lost)return end;
 return `${new Intl.DateTimeFormat(locale,{month:'short',year:'numeric'}).format(added)} – ${end}`;
}

// Where it happened, short enough to engrave: "Hole 8 · Maple Hill".
export const restingPlace=item=>[item.lostHole!=null?`Hole ${item.lostHole}`:'',item.lostCourse||''].filter(Boolean).join(' · ');
