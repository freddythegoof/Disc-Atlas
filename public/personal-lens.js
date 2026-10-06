// My Map's personal lens: where a player's own discs fly, relative to the shared consensus.
// Shifts are in stability-index points, the atlas's 0–100 horizontal axis (50 + 10 × (turn + fade)),
// so 10 points is one unit of turn + fade. Speed is never shifted. With no bias, a disc sits
// exactly at its consensus position.
// Inputs today: each bagged copy's More stable / Less stable note (bag_discs.stability_bias).
// `playerBias` is the extension point for a stored player-wide bias (none exists yet); it adds to every disc.
export const COPY_BIAS_SHIFT={more_stable:10,less_stable:-10};

// One shift per mold: copies of the same mold average their notes (a copy with no note counts as 0).
export function moldShifts(copies,{playerBias=0}={}){
 const notes=new Map();
 for(const copy of copies){
  if(!notes.has(copy.mold_id))notes.set(copy.mold_id,[]);
  notes.get(copy.mold_id).push(COPY_BIAS_SHIFT[copy.stability_bias] ?? 0);
 }
 return new Map([...notes].map(([id,values])=>[id,playerBias+values.reduce((a,b)=>a+b,0)/values.length]));
}

// The atlas's own layout (same scatter, same clamp), with each mold's shift applied to its index.
export function personalPositions(layout,molds,shifts){
 return layout.positions(molds,d=>shifts.get(d.id) || 0);
}
