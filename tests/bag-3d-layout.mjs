import assert from 'node:assert/strict';
import {test} from 'node:test';
import {bagLayout,depthOrder,DISC,MAIN,PUTTER,GOTO,TOP,FRONT,BAG_BOX,STAGE,stageMode,assignSides,scatterFrame,spotBox,SIDE_BAG} from '../public/bag3d/bag-layout.mjs';
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

// Staging: out discs stay out until clicked again and, however many there are, rest scattered
// beside the bag like discs tossed on a table, every one named.
const HALF_HEIGHT = 1.3507 * Math.tan(33 / 2 * Math.PI / 180);
const entry = (key, x, y) => ({key, atlas: x === null ? null : {x, y}});

test('staging always scatters: there is no map mode or column layout at any count', () => {
  assert.deepEqual([0, 1, 5, 6, 7, 12, 24, 48].map(stageMode), [null, 'scatter', 'scatter', 'scatter', 'scatter', 'scatter', 'scatter', 'scatter']);
  assert.equal(STAGE.map, undefined);
  assert.equal(STAGE.side, undefined);
});

// Left and right sides from assignSides, each listed by key.
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
  // Equal stability splits by key, whatever order the discs came out in; unrated discs count as neutral.
  assert.deepEqual(columns([entry('p', .6, 0), entry('q', .6, 0), entry('r', .6, 0), entry('s', .6, 0)]), {left: ['p', 'q'], right: ['r', 's']});
  assert.deepEqual(columns([entry('s', .6, 0), entry('r', .6, 0), entry('q', .6, 0), entry('p', .6, 0)]), {left: ['q', 'p'], right: ['s', 'r']});
  assert.equal(assignSides([entry('x', null), entry('y', .9, .3)]).get('x'), 'left');
});

// Out discs with a name of `width` × `height` (page-view meters, room around it included) each.
const named = (list, width, height) => list.map(d => ({...d, label: {width, height}}));
const boxesOverlap = (a, b) => a.xMin < b.xMax - 1e-6 && b.xMin < a.xMax - 1e-6 && a.yMin < b.yMax - 1e-6 && b.yMin < a.yMax - 1e-6;
// A wide desktop canvas (the page's free width at the bag's usual height) and a phone's. Names keep
// their pixel size: about .09 × .03 m at the page view on a desktop canvas, .16 × .06 m on a phone's.
const WIDE = {aspect: 1392 / 850, halfHeight: HALF_HEIGHT, centerY: .075}, NARROW = {aspect: 344 / 430, halfHeight: HALF_HEIGHT, centerY: .075};
const DESKTOP = {width: .09, height: .03}, PHONE = {width: .16, height: .06};
// A kept-clear corner and box, as a page could ask for.
const RESERVE = {width: .12, height: .08}, CLEAR = [{left: 0, top: 0, right: .13, bottom: .08}];
// Spearman's rank correlation of two equal-length lists.
const ranks = values => { const order = values.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]), out = []; order.forEach(([, i], r) => { out[i] = r; }); return out; };
const spearman = (a, b) => { const ra = ranks(a), rb = ranks(b), n = a.length; return 1 - 6 * ra.reduce((sum, r, i) => sum + (r - rb[i]) ** 2, 0) / (n * (n * n - 1)); };

// Every rule the scatter keeps, for one frame.
const scatterChecks = (frame, discs, label, name) => {
  const sides = assignSides(discs), speed = key => discs.find(d => d.key === key).atlas?.y ?? .5;
  assert.ok(frame.fits, `${name}: fits with every name`);
  assert.equal(frame.spots.size, discs.length, `${name}: every disc placed`);
  // Names under the discs; staggered rows (a crowd on a phone) may set them beside the discs instead.
  assert.ok(['below', 'flush'].includes(frame.labels) || (frame.brick && frame.labels === 'outer'), `${name}: names under the discs (${frame.labels})`);
  for (const [key, spot] of frame.spots) {
    assert.equal(spot.side, sides.get(key), `${name}: ${key} on its relative side`);
    assert.equal(spot.scale, frame.scale, `${name}: ${key} the same size as every other out disc`);
    // A disc stays in its own half; beside the bag unless the scatter runs around it.
    const r = DISC.radius * spot.scale, [x] = spot.position;
    const edge = frame.around ? STAGE.scatter.gap / 2 - 1e-6 : SIDE_BAG.xMax;
    assert.ok(spot.side === 'left' ? x + r <= -edge + 1e-6 : x - r >= edge - 1e-6, `${name}: ${key} on the ${spot.side} (${x.toFixed(3)})`);
    assert.equal(spot.tilt, undefined, `${name}: ${key} faces the camera with no tip`);
  }
  // Nothing on the bag, a kept-clear box or another disc or name; everything inside the frame.
  const boxes = [...frame.spots].map(([key, spot]) => [key, spotBox(spot, {width: label.width * frame.pull, height: label.height * frame.pull}, frame.labels)]);
  for (const [key, box] of boxes) {
    assert.ok(!boxesOverlap(box, SIDE_BAG), `${name}: ${key} and its name clear of the bag`);
    for (const other of frame.avoid) assert.ok(!boxesOverlap(box, other), `${name}: ${key} clear of a kept-clear box`);
    assert.ok(box.xMin >= frame.region.xMin - 1e-6 && box.xMax <= frame.region.xMax + 1e-6 && box.yMin >= frame.region.yMin - 1e-6 && box.yMax <= frame.region.yMax + 1e-6, `${name}: ${key} inside the frame`);
  }
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) assert.ok(!boxesOverlap(boxes[i][1], boxes[j][1]), `${name}: ${boxes[i][0]} and ${boxes[j][0]} (with names) apart`);
  // Faster discs toward the top: on each side, the fastest disc sits higher than the slowest, and
  // heights follow speed overall (a lean, not rows).
  for (const side of ['left', 'right']) {
    const keys = [...frame.spots].filter(([, s]) => s.side === side).map(([k]) => k);
    if (keys.length < 2) continue;
    const y = key => frame.spots.get(key).position[1], speeds = keys.map(speed);
    if (Math.max(...speeds) - Math.min(...speeds) < .05) continue;
    const fastest = keys.reduce((a, b) => speed(b) > speed(a) ? b : a), slowest = keys.reduce((a, b) => speed(b) < speed(a) ? b : a);
    // (Staggered rows may seat them in one row.)
    assert.ok(frame.brick ? y(fastest) >= y(slowest) - 1e-9 : y(fastest) > y(slowest), `${name}: ${side}: the fastest disc rests above the slowest`);
    if (keys.length >= 4) assert.ok(spearman(speeds, keys.map(y)) >= .5, `${name}: ${side}: heights lean with speed (ρ ${spearman(speeds, keys.map(y)).toFixed(2)})`);
  }
};

// Evenness: a side's discs spread over its room, without clumps or lonely outliers, and never
// line up as a shelf. The room is the strip beside the bag (or its half of the canvas, when the
// scatter runs around the bag).
const evenChecks = (frame, name) => {
  const stats = {};
  for (const side of ['left', 'right']) {
    const points = [...frame.spots.values()].filter(s => s.side === side).map(s => s.position);
    if (!points.length) continue;
    const area = frame.areas[side], inner = frame.around ? 0 : side === 'left' ? SIDE_BAG.xMin : SIDE_BAG.xMax;
    const room = side === 'left' ? {xMin: area.xMin, xMax: inner} : {xMin: inner, xMax: area.xMax};
    const fx = x => (x - room.xMin) / (room.xMax - room.xMin), fy = y => (y - area.yMin) / (area.yMax - area.yMin);
    // Not clumped in a corner: the discs' middle sits in the middle half of the room either way.
    const cx = points.reduce((s, p) => s + fx(p[0]), 0) / points.length, cy = points.reduce((s, p) => s + fy(p[1]), 0) / points.length;
    assert.ok(cx > .2 && cx < .8 && cy > .25 && cy < .75, `${name}: ${side} discs centered in their room (${cx.toFixed(2)}, ${cy.toFixed(2)})`);
    if (points.length >= 3) {
      // Spread: from the room's top part to its bottom part.
      const ys = points.map(p => fy(p[1]));
      assert.ok(Math.max(...ys) - Math.min(...ys) >= .45, `${name}: ${side} discs spread down the room (${(Math.max(...ys) - Math.min(...ys)).toFixed(2)})`);
      // No clump, no lonely outlier: each disc's nearest neighbor is about as near as anyone's.
      const nearest = points.map((p, i) => Math.min(...points.filter((_, j) => j !== i).map(q => Math.hypot(p[0] - q[0], p[1] - q[1]))));
      const mean = nearest.reduce((a, b) => a + b, 0) / nearest.length;
      assert.ok(Math.min(...nearest) >= .45 * mean && Math.max(...nearest) <= 2.2 * mean, `${name}: ${side} spacing even (nearest ${Math.min(...nearest).toFixed(3)}–${Math.max(...nearest).toFixed(3)}, mean ${mean.toFixed(3)})`);
      // Not a shelf: never all in one column, and no three level in a row or plumb in a column.
      const xs = points.map(p => p[0]), spreadX = Math.max(...xs) - Math.min(...xs);
      assert.ok(spreadX > DISC.radius * frame.scale * .5, `${name}: ${side} discs not stacked in one column`);
      for (const axis of [0, 1]) {
        const values = points.map(p => p[axis]).sort((a, b) => a - b);
        for (let i = 2; i < values.length; i++) assert.ok(values[i] - values[i - 2] > .002, `${name}: ${side}: no three discs ${axis ? 'level in a row' : 'plumb in a column'}`);
      }
      stats[side] = {cx: +cx.toFixed(2), cy: +cy.toFixed(2), nn: +(Math.max(...nearest) / Math.min(...nearest)).toFixed(2)};
    }
  }
  return stats;
};

test('desktop: 1–24 out scatter beside the full-size bag, evenly, every disc named, the same way every time', () => {
  for (let count = 1; count <= 24; count++) for (const [mix, list] of Object.entries(mixes(count))) {
    const discs = named(list, DESKTOP.width, DESKTOP.height), frame = scatterFrame({...WIDE, entries: discs}), name = `${count} ${mix}`;
    scatterChecks(frame, discs, DESKTOP, name);
    if (mix !== 'neutral') evenChecks(frame, name);
    assert.equal(frame.pull, 1, `${name}: the bag keeps its full size`);
    assert.equal(frame.around, false, `${name}: beside the bag`);
    // Deterministic: the same set lands the same way, whatever order its discs came out in.
    for (const order of [[...discs].reverse(), [...discs].sort((a, b) => (a.key.length * 7 + a.key.charCodeAt(1)) % 5 - (b.key.length * 7 + b.key.charCodeAt(1)) % 5)]) {
      const again = scatterFrame({...WIDE, entries: order});
      for (const [key, spot] of frame.spots) assert.deepEqual(again.spots.get(key), spot, `${name}: ${key} lands the same way`);
    }
  }
  // Few discs keep the largest size; a crowd shrinks every disc alike before the camera moves.
  for (const count of [1, 6, 12, 16]) assert.equal(scatterFrame({...WIDE, entries: named(mixes(count).mixed, DESKTOP.width, DESKTOP.height)}).scale, .58, `${count}: full-size discs`);
  for (const count of [18, 24]) assert.ok(scatterFrame({...WIDE, entries: named(mixes(count).mixed, DESKTOP.width, DESKTOP.height)}).scale < .58, `${count}: smaller discs, the bag still full size`);
});

test('adding a disc moves the others only a little', () => {
  // The scatter starts each disc from its own key and speed rank, so one more disc shifts the rest
  // rather than shuffling them.
  const list = mixes(12).mixed, a = scatterFrame({...WIDE, entries: named(list.slice(0, 11), DESKTOP.width, DESKTOP.height)}), b = scatterFrame({...WIDE, entries: named(list, DESKTOP.width, DESKTOP.height)});
  const moves = [...a.spots].filter(([key]) => b.spots.get(key).side === a.spots.get(key).side).map(([key, spot]) => Math.hypot(spot.position[0] - b.spots.get(key).position[0], spot.position[1] - b.spots.get(key).position[1]));
  const median = moves.sort((x, y) => x - y)[Math.floor(moves.length / 2)];
  assert.ok(median < .2, `Median move ${median.toFixed(3)} m`);
});

test('kept-clear boxes and the panel strip stay free', () => {
  // A full-height strip at one side (a details panel over the canvas) is left empty, as are kept-clear boxes.
  const panel = {left: .75, top: 0, right: 1, bottom: 1};
  for (const count of [3, 8, 12, 18]) {
    const discs = named(mixes(count).mixed, DESKTOP.width, DESKTOP.height), frame = scatterFrame({...WIDE, reserve: RESERVE, clear: [...CLEAR, panel], entries: discs});
    scatterChecks(frame, discs, DESKTOP, `${count} beside the panel`);
    const w = WIDE.halfHeight * frame.pull * WIDE.aspect, strip = -w + 2 * w * panel.left;
    for (const [key, spot] of frame.spots) assert.ok(spotBox(spot, {width: DESKTOP.width * frame.pull, height: DESKTOP.height * frame.pull}, frame.labels).xMax <= strip + 1e-9, `${count}: ${key} keeps out of the panel strip`);
  }
});

test('phone: 1–24 out fit a 360 px canvas with every name, pulling back only as far as they must', () => {
  const pulls = {};
  for (let count = 1; count <= 24; count++) for (const [mix, list] of Object.entries(mixes(count))) {
    const discs = named(list, PHONE.width, PHONE.height), frame = scatterFrame({...NARROW, entries: discs}), name = `phone ${count} ${mix}`;
    scatterChecks(frame, discs, PHONE, name);
    pulls[count] = Math.max(pulls[count] ?? 0, frame.pull);
  }
  assert.ok(pulls[1] < 1.8, 'Phone, one disc: pull ' + pulls[1]);
  assert.ok(pulls[8] < 2, 'Phone, eight discs: pull ' + pulls[8]);
  assert.ok(pulls[18] < 3, 'Phone, eighteen discs: pull ' + pulls[18]);
  assert.ok(pulls[24] < 3, 'Phone, twenty-four discs: pull ' + pulls[24]);
  // A crowd past every layout says so (the page still names every disc, placed as clear as it can).
  assert.equal(scatterFrame({...NARROW, entries: named(mixes(60).mixed, .3, .12)}).fits, false);
  // A flush name's inner edge is its disc's, so it reaches only outward.
  for (const side of ['left', 'right']) {
    const spot = {position: [side === 'left' ? -.4 : .4, 0, 0], scale: .5, side}, r = DISC.radius * .5, box = spotBox(spot, {width: .3, height: .05}, 'flush');
    assert.ok(Math.abs(side === 'left' ? box.xMax - (-.4 + r) : box.xMin - (.4 - r)) < 1e-9, `${side}: a flush name's inner edge is the disc's`);
    assert.ok(Math.abs(box.xMax - box.xMin - .3) < 1e-9, `${side}: it reaches only outward`);
  }
});

test('out discs carry no tip: they face the camera round', () => {
  assert.equal(STAGE.scatter.tilt, undefined);
});
