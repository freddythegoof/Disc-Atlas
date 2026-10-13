// What the pointer can reach on the atlas, and when the discs may change under it. Pure: atlas-map.js
// builds the targets from what it drew, so a disc shown at a readable size is a disc a click lands on.
// A target is {kind: 'marker' | 'gap', x, y, r, label}: the centre and radius of its hit circle, and the box
// of its name when that name is readable (else null). All in map pixels.
globalThis.AtlasTargets={
 // A name at this strength or more can be read, so its disc is clickable (AtlasGroups.GAP.named).
 READABLE:.5,
 // The discs wait for a pointer that is reaching for one. A regroup due while the pointer moved less than
 // `settle` ms ago waits for it to stop; while it rests on a readable disc it waits up to `hover` ms; and
 // nothing but a press holds it longer than `max` ms after it fell due.
 HOLD:{settle:220,hover:1400,max:2400},
 // A readable disc a regroup would drop stays while the pointer is within `slack` px of it, until the
 // pointer has been away `leave` ms, and for no longer than `max` ms.
 PIN:{slack:28,leave:380,max:5000},
 inBox(box,x,y,slack=0){return !!box&&x>=box.x-slack&&x<=box.x+box.w+slack&&y>=box.y-slack&&y<=box.y+box.h+slack;},
 // Is (x, y) on the target: its hit circle or its name's box, each grown by `slack`?
 reach(target,x,y,slack=0){return Math.hypot(target.x-x,target.y-y)<=target.r+slack||this.inBox(target.label,x,y,slack);},
 // Does the pointer rest on a disc whose name can be read?
 reads(targets,x,y){return targets.some(t=>t.label&&this.reach(t,x,y));},
 // The target a point at (x, y) lands on. A curated disc is above the canvas's small discs, and a hit on
 // a disc's art beats a hit on a name; of two hits of one kind the nearer centre wins, as a click always
 // resolved among overlapping dot boxes.
 pick(targets,x,y){
  let best=null,rank=Infinity;
  for(const t of targets){
   const distance=Math.hypot(t.x-x,t.y-y),group=t.kind==='marker'?0:2;
   let score=Infinity;
   if(distance<=t.r)score=group*1e6+distance;
   else if(this.inBox(t.label,x,y))score=(group+1)*1e6+Math.hypot(t.label.x+t.label.w/2-x,t.label.y+t.label.h/2-y);
   if(score<rank){rank=score;best=t;}
  }
  return best;
 },
 // Whether a regroup that fell due at `due` waits at `now`, and until when. `pointer` is {inside, pressed,
 // at (when it last moved, pressed or wheeled)}; `onTarget`: it rests on a readable disc.
 hold({now,due,pointer,onTarget}){
  const H=this.HOLD;
  if(pointer.pressed)return {hold:true,until:Infinity};
  if(!pointer.inside)return {hold:false,until:0};
  let until=pointer.at+H.settle;
  if(onTarget)until=Math.max(until,due+H.hover);
  until=Math.min(until,due+H.max);
  return {hold:now<until,until};
 },
};
