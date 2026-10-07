import assert from 'node:assert/strict';
import {test} from 'node:test';
import {bagLayout,depthOrder,DISC,MAIN,PUTTER,GOTO,TOP,FRONT,BAG_BOX,STAGE,stageMode,assignSides,sideOrder,sideFrame,spotBox,SIDE_BAG} from '../public/bag3d/bag-layout.mjs';
import {bagSlots} from '../public/bag-values.js';
import models from '../source-data/bag-models.json' with {type:'json'};

const disc=(id,color='#ed7868')=>({id,color});
const filled=placements=>placements.filter(p=>!p.empty);

test('every bag model fits its main and putter capacity in the 3D pockets', () => {
 for(const model of models.models){
  const main=(model.main_capacity ?? model.capacity)+(model.extra_capacity ?? 0),putter=model.putter_capacity ?? 0;
  const {placements,clipped}=bagLayout({main:Array(main).fill(null),putter:Array(putter).fill(null),goTo:[null]});
  assert.equal(placements.filter(p=>p.pocket==='main').length,main,model.name);
  assert.equal(placements.filter(p=>p.pocket==='putter').length,putter,model.name);
  assert.deepEqual(clipped,{main:0,putter:0,goTo:0},model.name);
 }
});

test('main slots stay inside the compartment, left to right, without touching rims', () => {
 for(const count of [1,12,18,26,48]){
  const mains=bagLayout({main:Array.from({length:count},(_,i)=>disc('m'+i))}).placements;
  assert.deepEqual(mains.map(p=>p.order),[...Array(count).keys()]);
  for(const [i,p] of mains.entries()){
   const half=DISC.thickness*p.scale[0]/2;
   assert.ok(p.position[0]-half>=MAIN.xMin-1e-9 && p.position[0]+half<=MAIN.xMax+1e-9,`slot ${i}/${count} inside the opening`);
   if(i)assert.ok(p.position[0]-mains[i-1].position[0]>DISC.thickness*p.scale[0],`slot ${i}/${count} clears its neighbor`);
  }
 }
});

test('putters ride in the top pocket; go-to sits in the front pocket above main', () => {
 const {placements}=bagLayout({main:[disc('m')],putter:[disc('p'),disc('p2'),null],goTo:[disc('g')]});
 const by=id=>placements.find(p=>p.id===id);
 assert.equal(by('g').pocket,'goTo');assert.equal(by('p').pocket,'putter');
 assert.equal(PUTTER.y,TOP.y);assert.equal(GOTO.y,FRONT.y);
 assert.ok(by('p').position[1]>by('g').position[1] && by('g').position[1]>by('m').position[1],'putters (top) > go-to (front) > main');
 assert.ok(by('g').position[2]>by('p').position[2] && by('g').position[2]>by('m').position[2],'go-to pocket is the front pocket');
 // Pocketed discs face forward; main discs stand edge-on.
 assert.equal(by('p').rotation[1],-Math.PI/2);assert.equal(by('g').rotation[1],-Math.PI/2);assert.equal(by('m').rotation[1],0);
 // Putters stand in one neat row: same x and tilt, even spacing, each a step higher so every rim shows.
 const row=placements.filter(p=>p.pocket==='putter');
 assert.ok(row.every(p=>p.position[0]===0 && p.rotation[0]===TOP.tilt),'aligned, consistent tilt');
 const steps=row.slice(1).map((p,i)=>[p.position[1]-row[i].position[1],row[i].position[2]-p.position[2]]);
 assert.ok(steps.every(([dy,dz])=>dy>0 && Math.abs(dy-steps[0][0])<1e-12 && Math.abs(dz-steps[0][1])<1e-12),'even spacing');
 const zs=placements.filter(p=>p.pocket==='putter').map(p=>p.position[2]);
 assert.ok(Math.abs((Math.max(...zs)+Math.min(...zs))/2-TOP.center)<1e-9,'putter stack centered in the top pocket');
 assert.equal(placements.find(p=>p.pocket==='putter' && p.empty).key,'putter-empty-2');
});

test('empty go-to is a single placeholder; several go-to copies share the front pocket', () => {
 assert.deepEqual(bagLayout({goTo:[null]}).placements.map(p=>[p.pocket,p.empty]),[['goTo',true]]);
 const tops=bagLayout({goTo:[disc('a'),disc('b'),disc('c')]}).placements;
 assert.equal(new Set(tops.map(p=>p.position[2])).size,3,'copies stack front to back');
 const zs=tops.map(p=>p.position[2]);
 assert.ok(Math.max(...zs)===FRONT.front && Math.min(...zs)>=FRONT.front-FRONT.span-1e-9,'stack runs back from the front pocket face');
 assert.deepEqual(bagLayout({goTo:[null]}).placements[0].position,[0,FRONT.y,FRONT.front],'empty slot outline sits in the front pocket');
 assert.ok(tops.every(p=>Math.abs(p.position[0])<=GOTO.maxX));
});

test('each disc appears once and keeps its own color; keys are stable ids', () => {
 const rows=[{id:'a',mold_id:'x',pocket:'main',in_bag:true,color:'#111111'},{id:'b',mold_id:'x',pocket:'putter',in_bag:true,color:'#222222'},{id:'c',mold_id:'x',pocket:'goto',in_bag:true,color:'#333333'},{id:'d',mold_id:'x',pocket:'main',in_bag:false,color:'#444444'}];
 const slots=bagSlots(rows,{main_capacity:4,putter_capacity:2},()=>({speed:5}));
 const {placements}=bagLayout({main:slots.main,putter:slots.putter,goTo:slots.goto});
 const discs=filled(placements);
 assert.deepEqual(discs.map(p=>[p.id,p.pocket,p.color]).sort(),[['a','main','#111111'],['b','putter','#222222'],['c','goTo','#333333']]);
 assert.equal(new Set(placements.map(p=>p.key)).size,placements.length,'keys are unique');
 assert.equal(placements.filter(p=>p.empty).length,3+1,'three empty main slots and one empty putter slot');
});

test('slots beyond the illustrated maximum are reported, not drawn', () => {
 const {placements,clipped}=bagLayout({main:[...Array.from({length:50},(_,i)=>disc('m'+i)),null],putter:Array.from({length:9},(_,i)=>disc('p'+i))});
 assert.equal(placements.filter(p=>p.pocket==='main').length,MAIN.maxSlots);assert.equal(clipped.main,2);
 assert.equal(placements.filter(p=>p.pocket==='putter').length,PUTTER.maxSlots);assert.equal(clipped.putter,1);
});

test('hit order puts front discs last so they win where pockets overlap', () => {
 const order=depthOrder(bagLayout({main:[disc('m')],putter:[disc('p0'),disc('p1')],goTo:[disc('g')]}).placements).map(p=>p.key);
 assert.deepEqual(order,['m','p1','p0','g']);
});

test('lift poses come forward, toward the viewer', () => {
 for(const p of bagLayout({main:[disc('m'),null],putter:[disc('p')],goTo:[disc('g')]}).placements)assert.ok(p.lift[2]>p.position[2],p.key);
});

test('slide-out runs along each pocket axis until the whole disc is clear', () => {
 const {placements}=bagLayout({main:[disc('m'),disc('m2')],putter:[disc('p0'),disc('p1'),disc('p2'),disc('p3')],goTo:[disc('g')]});
 for(const p of placements.filter(p=>p.pocket!=='main')){
  const [x,y,z]=p.slide.position,radius=.101*p.scale[1];
  assert.equal(x,p.position[0],p.key+' keeps its x: straight up');assert.ok(y-radius>p.mouth,p.key+' bottom clears the pocket mouth');
  assert.deepEqual(p.slide.rotation,p.rotation,p.key+' keeps its tilt');
 }
 const putters=placements.filter(p=>p.pocket==='putter'),front=Math.max(...putters.map(p=>p.position[2]));
 assert.ok(putters.every(p=>p.slide.position[2]>front),'a slid putter rests in front of the stack');
 const goTo=placements.find(p=>p.pocket==='goTo');assert.ok(goTo.slide.position[2]>goTo.position[2],'go-to comes forward and up');
 for(const p of placements.filter(p=>p.pocket==='main')){
  assert.ok(p.slide.position[2]>FRONT.front+DISC.radius,p.key+' comes out of the compartment, in front of the front pocket');
  assert.ok(p.slide.position[1]>p.position[1],p.key+' and up');assert.equal(p.slide.rotation[1],-Math.PI/2,p.key+' turns face-on');
 }
});

test('stowed putters sit at one height inside the top pocket with only their rims above the mouth', () => {
  const {placements} = bagLayout({putter: [{id: 'a'}, {id: 'b'}, {id: 'c'}, {id: 'd'}], goTo: [{id: 'g'}]});
  const putters = placements.filter(p => p.pocket === 'putter');
  for (const p of putters) {
    assert.ok(p.stow, 'Each putter has a stowed seat');
    assert.deepEqual([p.stow.position[0], p.stow.position[2]], [p.position[0], p.position[2]], 'Stowing only lowers it');
    assert.equal(p.stow.position[1], TOP.stowY);
    const rim = p.stow.position[1] + DISC.radius * p.stow.scale[1];
    assert.ok(rim > TOP.mouth && rim - TOP.mouth < .015, `Only the rim shows above the mouth: ${(rim - TOP.mouth).toFixed(3)} m`);
  }
  assert.ok(!placements.find(p => p.pocket === 'goTo').stow, 'The go-to does not stow');
});

// Staging: out discs stay out until clicked again and, however many there are, rest in side
// columns beside the bag, every one named.
const HALF_HEIGHT = 1.3507 * Math.tan(33 / 2 * Math.PI / 180);
const entry = (key, x, y) => ({key, atlas: x === null ? null : {x, y}});

test('staging always uses the side layout: there is no map mode at any count', () => {
  assert.deepEqual([0, 1, 5, 6, 7, 12, 24, 48].map(stageMode), [null, 'side', 'side', 'side', 'side', 'side', 'side', 'side']);
  assert.equal(STAGE.map, undefined);
});

// Left and right columns from assignSides, each listed by key.
const columns = list => { const sides = assignSides(list); return {left: list.filter(d => sides.get(d.key) === 'left').map(d => d.key), right: list.filter(d => sides.get(d.key) === 'right').map(d => d.key)}; };
const stabilityOf = list => key => list.find(d => d.key === key).atlas?.x ?? .5;
// Stability mixes of any size: spread over the whole range, all overstable, all understable, all neutral.
const mixes = count => ({
  mixed: Array.from({length: count}, (_, i) => entry('m' + i, ((i * 37) % 100) / 100, ((i * 53) % 97) / 97)),
  overstable: Array.from({length: count}, (_, i) => entry('o' + i, .7 + ((i * 7) % count) * .25 / count, ((i * 53) % 97) / 97)),
  understable: Array.from({length: count}, (_, i) => entry('u' + i, .05 + ((i * 5) % count) * .2 / count, ((i * 31) % 89) / 89)),
  neutral: Array.from({length: count}, (_, i) => entry('n' + i, .5, .5)),
});

test('the split is relative to the out discs, at the median, never a fixed threshold, at any count', () => {
  for (let count = 1; count <= 24; count++) for (const [mix, list] of Object.entries(mixes(count))) {
    const {left, right} = columns(list), x = stabilityOf(list), name = `${mix} ${count}`;
    assert.ok(Math.abs(left.length - right.length) <= 1, `${name}: even ${left.length}/${right.length}`);
    if (count % 2 === 0) assert.equal(left.length, right.length, `${name}: an even count splits exactly at the median`);
    if (left.length && right.length) assert.ok(Math.max(...left.map(x)) <= Math.min(...right.map(x)), `${name}: every left disc is no more overstable than every right disc`);
  }
  // An all-overstable (or all-understable) set still spreads evenly: no fixed threshold.
  const allOver = [entry('o1', .78, .9), entry('o2', .95, .3), entry('o3', .7, .5), entry('o4', .88, .6), entry('o5', .82, .1), entry('o6', .91, .4), entry('o7', .74, .7)];
  const allUnder = [entry('u1', .05, .9), entry('u2', .3, .3), entry('u3', .12, .5), entry('u4', .2, .6), entry('u5', .26, .1)];
  assert.deepEqual(columns(allOver.slice(0, 4)), {left: ['o1', 'o3'], right: ['o2', 'o4']}, 'Four overstable discs: the two least overstable go left');
  assert.deepEqual(columns(allOver.slice(0, 6)), {left: ['o1', 'o3', 'o5'], right: ['o2', 'o4', 'o6']}, 'Six overstable discs split 3/3');
  assert.deepEqual(columns(allUnder.slice(0, 4)), {left: ['u1', 'u3'], right: ['u2', 'u4']}, 'Four understable discs: the two most overstable go right');
  // Mixed set: understable left, overstable right, around this set's own median.
  assert.deepEqual(columns([entry('fade', .9, .4), entry('turn', .1, .6), entry('neutral', .52, .5), entry('flip', .3, .8), entry('stable', .7, .2), entry('beef', .95, .1)]),
    {left: ['turn', 'neutral', 'flip'], right: ['fade', 'stable', 'beef']});
  // Even counts split exactly at the median.
  assert.deepEqual(columns([entry('a', .61, 0), entry('b', .6, 0)]), {left: ['b'], right: ['a']});
  // Odd counts: the median joins the neighbor it is nearer in stability; the right on a tie.
  assert.deepEqual(columns([entry('a', .7, 0), entry('m', .72, 0), entry('b', .95, 0)]), {left: ['a', 'm'], right: ['b']}, 'Median near the lower neighbor goes left');
  assert.deepEqual(columns([entry('a', .7, 0), entry('m', .93, 0), entry('b', .95, 0)]), {left: ['a'], right: ['m', 'b']}, 'Median near the upper neighbor goes right');
  assert.deepEqual(columns([entry('a', .2, 0), entry('m', .5, 0), entry('b', .8, 0)]), {left: ['a'], right: ['m', 'b']}, 'A tie goes right');
  assert.deepEqual(columns([entry('a', .1, 0), entry('b', .2, 0), entry('m', .5, 0), entry('c', .52, 0), entry('d', .9, 0)]), {left: ['a', 'b'], right: ['m', 'c', 'd']});
  assert.deepEqual(columns(allOver), {left: ['o1', 'o3', 'o5', 'o7'], right: ['o2', 'o4', 'o6']}, 'Seven overstable: the median (.82) is nearer .78 than .88, so it joins the left');
  // A lone disc rests on the right whatever its stability.
  assert.deepEqual(columns([entry('turn', .1, .4)]), {left: [], right: ['turn']});
  assert.deepEqual(columns([entry('fade', .9, .4)]), {left: [], right: ['fade']});
  // Equal stability splits in out order; unrated discs count as neutral.
  assert.deepEqual(columns([entry('p', .6, 0), entry('q', .6, 0), entry('r', .6, 0), entry('s', .6, 0)]), {left: ['p', 'q'], right: ['r', 's']});
  assert.equal(assignSides([entry('x', null), entry('y', .9, .3)]).get('x'), 'left');
});

test('side order: each side listed most extreme first', () => {
  const list = [entry('fade', .9, 0), entry('x', null), entry('turn', .1, 0), entry('p', .55, 0), entry('flip', .3, 0), entry('beef', .8, 0)];
  const {left, right} = sideOrder(list);
  assert.deepEqual(left.map(d => d.key), ['turn', 'flip', 'x']);
  assert.deepEqual(right.map(d => d.key), ['fade', 'beef', 'p']);
});

// Out discs with a name of `width` × `height` (page-view meters, room around it included) each.
const named = (list, width, height) => list.map(d => ({...d, label: {width, height}}));
const boxesOverlap = (a, b) => a.xMin < b.xMax - 1e-6 && b.xMin < a.xMax - 1e-6 && a.yMin < b.yMax - 1e-6 && b.yMin < a.yMax - 1e-6;
// A wide desktop canvas (the page's free width at the bag's usual height) and a phone's. Names keep
// their pixel size: about .09 × .03 m at the page view on a desktop canvas, .16 × .06 m on a phone's.
const WIDE = {aspect: 1392 / 850, halfHeight: HALF_HEIGHT, centerY: .075}, NARROW = {aspect: 344 / 430, halfHeight: HALF_HEIGHT, centerY: .075};
const DESKTOP = {width: .09, height: .03}, PHONE = {width: .16, height: .06};
// The zoom corner and the pocket button, as the page keeps them clear.
const RESERVE = {width: .12, height: .08}, CLEAR = [{left: 0, top: 0, right: .13, bottom: .08}];

// Every rule the side layout keeps, for one frame.
const sideChecks = (frame, discs, label, name) => {
  const stability = key => discs.find(d => d.key === key).atlas?.x ?? .5, speed = key => discs.find(d => d.key === key).atlas?.y ?? .5;
  const sides = assignSides(discs);
  assert.ok(frame.fits, `${name}: fits with every name`);
  assert.equal(frame.spots.size, discs.length, `${name}: every disc placed`);
  assert.ok(['below', 'flush', 'outer'].includes(frame.labels), `${name}: names under or beside`);
  const left = [...frame.spots].filter(([, s]) => s.side === 'left').map(([k]) => k), right = [...frame.spots].filter(([, s]) => s.side === 'right').map(([k]) => k);
  for (const [key, spot] of frame.spots) {
    assert.equal(spot.side, sides.get(key), `${name}: ${key} on its relative side`);
    assert.ok(spot.side === 'left' ? spot.position[0] < SIDE_BAG.xMin : spot.position[0] > SIDE_BAG.xMax, `${name}: ${key} beside the bag`);
  }
  if (left.length && right.length) assert.ok(Math.max(...left.map(stability)) <= Math.min(...right.map(stability)), `${name}: every left disc is less overstable than every right disc`);
  // Side columns: the first column of each side hugs the bag, the rest step outward; faster discs higher in each.
  for (const side of ['left', 'right']) {
    const cols = frame.columns.filter(c => c.side === side), sign = side === 'left' ? -1 : 1;
    for (let i = 1; i < cols.length; i++) assert.ok(sign * (cols[i].x - cols[i - 1].x) > 0, `${name}: ${side} columns run from the bag outward`);
    if (cols.length) {
      const inner = cols[0], spot = frame.spots.get(inner.keys[0]), box = spotBox(spot, {width: label.width * frame.pull, height: label.height * frame.pull}, frame.labels);
      const gapToBag = side === 'left' ? SIDE_BAG.xMin - box.xMax : box.xMin - SIDE_BAG.xMax;
      assert.ok(gapToBag < STAGE.side.gap + 1e-6, `${name}: ${side} column hugs the bag (gap ${gapToBag.toFixed(3)})`);
    }
    for (const column of cols) for (let i = 1; i < column.keys.length; i++) {
      const [a, b] = [column.keys[i - 1], column.keys[i]];
      assert.ok(frame.spots.get(a).position[1] > frame.spots.get(b).position[1] && speed(a) >= speed(b), `${name}: faster discs higher (${a} over ${b})`);
    }
  }
  // Nothing on the bag, a kept-clear box or another disc or name; everything inside the frame.
  const boxes = [...frame.spots].map(([key, spot]) => [key, spotBox(spot, {width: label.width * frame.pull, height: label.height * frame.pull}, frame.labels)]);
  for (const [key, box] of boxes) {
    assert.ok(!boxesOverlap(box, SIDE_BAG), `${name}: ${key} and its name clear of the bag`);
    for (const other of frame.avoid) assert.ok(!boxesOverlap(box, other), `${name}: ${key} clear of a kept-clear box`);
    assert.ok(box.xMin >= frame.region.xMin - 1e-6 && box.xMax <= frame.region.xMax + 1e-6 && box.yMin >= frame.region.yMin - 1e-6 && box.yMax <= frame.region.yMax + 1e-6, `${name}: ${key} inside the frame`);
  }
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) assert.ok(!boxesOverlap(boxes[i][1], boxes[j][1]), `${name}: ${boxes[i][0]} and ${boxes[j][0]} (with names) apart`);
};

test('desktop: any count rests in side columns beside the full-size bag, every disc named', () => {
  for (const count of [1, 2, 3, 5, 6, 8, 10, 12, 14, 18, 24]) for (const [mix, list] of Object.entries(mixes(count))) {
    const discs = named(list, DESKTOP.width, DESKTOP.height), frame = sideFrame({...WIDE, reserve: RESERVE, clear: CLEAR, entries: discs}), name = `${count} ${mix}`;
    sideChecks(frame, discs, DESKTOP, name);
    assert.equal(frame.pull, 1, `${name}: the bag keeps its full size`);
    assert.deepEqual([...sideFrame({...WIDE, reserve: RESERVE, clear: CLEAR, entries: discs}).spots], [...frame.spots], `${name}: deterministic`);
  }
});

test('a column grows before it wraps: one column a side up to fourteen out, the largest discs while they fit', () => {
  const frame = count => sideFrame({...WIDE, reserve: RESERVE, clear: CLEAR, entries: named(mixes(count).mixed, DESKTOP.width, DESKTOP.height)});
  for (const count of [1, 2, 5, 6, 8]) {
    const f = frame(count);
    assert.deepEqual([f.scale, f.labels], [.58, 'below'], `${count}: full-size discs, names under them`);
    assert.ok(f.columns.length <= 2, `${count}: one column a side`);
  }
  for (const count of [10, 12, 14]) {
    const f = frame(count);
    assert.equal(f.columns.length, 2, `${count}: still one column a side (${f.columns.map(c => c.keys.length)})`);
  }
  // Names move beside the discs before the discs shrink much: ten keep their full size.
  assert.deepEqual([frame(10).scale, frame(10).labels], [.58, 'outer']);
  // The rows close up as the column grows, and the column stays centered on the bag while it is short.
  const pitch = f => { const ys = f.columns[0].keys.map(k => f.spots.get(k).position[1]); return ys.length > 1 ? ys[0] - ys[1] : 0; };
  assert.ok(pitch(frame(4)) >= pitch(frame(8)) - 1e-9, 'Rows close up as the column grows');
  const two = frame(2);
  for (const spot of two.spots.values()) assert.ok(Math.abs(spot.position[1] - STAGE.side.y) < 1e-9, 'A lone disc a side rests level with the bag\'s middle');
  // Past what one column holds, a side wraps into a second column beside the first, rows by speed.
  const many = frame(24);
  assert.equal(many.columns.length, 4, '24 out: two columns a side');
  for (const side of ['left', 'right']) {
    const [inner, outer] = many.columns.filter(c => c.side === side), speed = k => mixes(24).mixed.find(d => d.key === k).atlas.y;
    const rowOf = k => many.spots.get(k).row;
    for (const a of [...inner.keys, ...outer.keys]) for (const b of [...inner.keys, ...outer.keys]) if (rowOf(a) < rowOf(b)) assert.ok(speed(a) >= speed(b), `${side}: every row is faster than the rows under it`);
  }
});

test('the side layout keeps the panel strip free, and on a phone pulls back only as far as it must, never dropping names', () => {
  // A full-height strip at one side (a details panel over the canvas) is left empty.
  const panel = {left: .75, top: 0, right: 1, bottom: 1};
  for (const count of [3, 8, 12]) {
    const discs = named(mixes(count).mixed, DESKTOP.width, DESKTOP.height), frame = sideFrame({...WIDE, reserve: RESERVE, clear: [...CLEAR, panel], entries: discs});
    sideChecks(frame, discs, DESKTOP, `${count} beside the panel`);
    const w = WIDE.halfHeight * frame.pull * WIDE.aspect, strip = -w + 2 * w * panel.left;
    for (const [key, spot] of frame.spots) assert.ok(spotBox(spot, {width: DESKTOP.width * frame.pull, height: DESKTOP.height * frame.pull}, frame.labels).xMax <= strip + 1e-9, `${count}: ${key} keeps out of the panel strip`);
  }
  // A phone's narrow canvas has little room beside a full-size bag: it pulls back, names kept.
  const pulls = {};
  for (const count of [1, 3, 5, 6, 8, 10, 12, 18]) for (const [mix, list] of Object.entries(mixes(count))) {
    const discs = named(list, PHONE.width, PHONE.height), frame = sideFrame({...NARROW, reserve: RESERVE, clear: CLEAR, entries: discs});
    sideChecks(frame, discs, PHONE, `phone ${count} ${mix}`);
    pulls[count] = Math.max(pulls[count] ?? 0, frame.pull);
  }
  assert.ok(pulls[1] > 1 && pulls[1] < 2, 'Phone, one disc: pull ' + pulls[1]);
  assert.ok(pulls[8] < 2, 'Phone, eight discs: pull ' + pulls[8]);
  assert.ok(pulls[18] < 2.6, 'Phone, eighteen discs: pull ' + pulls[18]);
  for (let i = 1; i < Object.keys(pulls).length; i++) { const [a, b] = Object.keys(pulls).map(Number).slice(i - 1, i + 1); assert.ok(pulls[b] >= pulls[a] - 1e-9, `More discs never bring the camera in (${a}: ${pulls[a]}, ${b}: ${pulls[b]})`); }
  // On a phone a few discs keep their names under them (flush with the disc's inner edge when
  // centered names would not fit), and a flush name reaches only outward, away from the bag.
  for (const count of [1, 3, 5]) assert.ok(['below', 'flush'].includes(sideFrame({...NARROW, reserve: RESERVE, clear: CLEAR, entries: named(mixes(count).mixed, PHONE.width, PHONE.height)}).labels), `Phone ${count}: names under the discs`);
  for (const side of ['left', 'right']) {
    const spot = {position: [side === 'left' ? -.4 : .4, 0, 0], scale: .5, side}, r = DISC.radius * .5, box = spotBox(spot, {width: .3, height: .05}, 'flush');
    assert.ok(Math.abs(side === 'left' ? box.xMax - (-.4 + r) : box.xMin - (.4 - r)) < 1e-9, `${side}: a flush name's inner edge is the disc's`);
    assert.ok(Math.abs(box.xMax - box.xMin - .3) < 1e-9, `${side}: it reaches only outward`);
  }
  // A crowd past every layout says so (the page still names every disc, placed as clear as it can).
  assert.equal(sideFrame({...NARROW, entries: named(mixes(60).mixed, .3, .12)}).fits, false);
});
