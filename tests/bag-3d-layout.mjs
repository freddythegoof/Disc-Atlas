import assert from 'node:assert/strict';
import {test} from 'node:test';
import {bagLayout,depthOrder,DISC,MAIN,PUTTER,GOTO,TOP,FRONT,BAG_BOX,STAGE,stageMode,assignSides,sideSpots,RING_BAG,flankOrder,flankFrame} from '../public/bag3d/bag-layout.mjs';
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

// Staging: out discs stay out until clicked again; 1–5 rest beside the bag, 6+ go on a map around it.
const HALF_HEIGHT = 1.3507 * Math.tan(33 / 2 * Math.PI / 180);
const entry = (key, x, y) => ({key, atlas: x === null ? null : {x, y}});
const minGap = spots => {
  const points = [...spots.values()].map(spot => spot.position);let gap = Infinity;
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) gap = Math.min(gap, Math.hypot(points[i][0] - points[j][0], points[i][1] - points[j][1]));
  return gap;
};
const clearOfBag = (spot, radius) => spot.position[0] <= BAG_BOX.xMin - radius || spot.position[0] >= BAG_BOX.xMax + radius || spot.position[1] >= BAG_BOX.yMax + radius;

test('staging switches from the side layout to the map at the sixth out disc', () => {
  assert.deepEqual([0, 1, 5, 6, 7, 24].map(stageMode), [null, 'side', 'side', 'map', 'map', 'map']);
  assert.equal(STAGE.sideMax, 5);
});

// Left and right columns from assignSides, each listed by key.
const columns = list => { const sides = assignSides(list); return {left: list.filter(d => sides.get(d.key) === 'left').map(d => d.key), right: list.filter(d => sides.get(d.key) === 'right').map(d => d.key)}; };
const stabilityOf = list => key => list.find(d => d.key === key).atlas?.x ?? .5;

test('beside the bag, discs split relative to each other: less overstable half left, more overstable half right, balanced', () => {
  const mixed = [entry('fade', .9, .4), entry('turn', .1, .6), entry('neutral', .52, .5), entry('flip', .3, .8), entry('stable', .7, .2)];
  const allOver = [entry('o1', .78, .9), entry('o2', .95, .3), entry('o3', .7, .5), entry('o4', .88, .6), entry('o5', .82, .1)];
  const allUnder = [entry('u1', .05, .9), entry('u2', .3, .3), entry('u3', .12, .5), entry('u4', .2, .6), entry('u5', .26, .1)];
  for (const [name, discs] of [['mixed', mixed], ['all overstable', allOver], ['all understable', allUnder]]) {
    for (let count = 1; count <= 5; count++) {
      const list = discs.slice(0, count), {left, right} = columns(list), x = stabilityOf(list);
      assert.ok(Math.abs(left.length - right.length) <= 1, `${name} ${count}: even ${left.length}/${right.length}`);
      if (left.length && right.length) assert.ok(Math.max(...left.map(x)) <= Math.min(...right.map(x)), `${name} ${count}: every left disc is less overstable than every right disc`);
    }
  }
  // An all-overstable (or all-understable) set still spreads evenly: no fixed threshold.
  assert.deepEqual(columns(allOver.slice(0, 4)), {left: ['o1', 'o3'], right: ['o2', 'o4']}, 'Four overstable discs: the two least overstable go left');
  assert.deepEqual(columns(allUnder.slice(0, 4)), {left: ['u1', 'u3'], right: ['u2', 'u4']}, 'Four understable discs: the two most overstable go right');
  // Even counts split exactly at the median.
  assert.deepEqual(columns([entry('a', .61, 0), entry('b', .6, 0)]), {left: ['b'], right: ['a']});
  // Odd counts: the median joins the neighbor it is nearer in stability; the right on a tie.
  assert.deepEqual(columns([entry('a', .7, 0), entry('m', .72, 0), entry('b', .95, 0)]), {left: ['a', 'm'], right: ['b']}, 'Median near the lower neighbor goes left');
  assert.deepEqual(columns([entry('a', .7, 0), entry('m', .93, 0), entry('b', .95, 0)]), {left: ['a'], right: ['m', 'b']}, 'Median near the upper neighbor goes right');
  assert.deepEqual(columns([entry('a', .2, 0), entry('m', .5, 0), entry('b', .8, 0)]), {left: ['a'], right: ['m', 'b']}, 'A tie goes right');
  assert.deepEqual(columns([entry('a', .1, 0), entry('b', .2, 0), entry('m', .5, 0), entry('c', .52, 0), entry('d', .9, 0)]), {left: ['a', 'b'], right: ['m', 'c', 'd']});
  // A lone disc rests on the right whatever its stability.
  assert.deepEqual(columns([entry('turn', .1, .4)]), {left: [], right: ['turn']});
  assert.deepEqual(columns([entry('fade', .9, .4)]), {left: [], right: ['fade']});
  // Equal stability splits in out order; unrated discs count as neutral.
  assert.deepEqual(columns([entry('p', .6, 0), entry('q', .6, 0), entry('r', .6, 0), entry('s', .6, 0)]), {left: ['p', 'q'], right: ['r', 's']});
  assert.equal(assignSides([entry('x', null), entry('y', .9, .3)]).get('x'), 'left');
});

test('side spots rest just clear of the bag, faster discs higher, with room for names', () => {
  const discs = [entry('fast', .2, .9), entry('slow', .25, .1), entry('mid', .3, .5), entry('r1', .8, .7), entry('r2', .9, .2)];
  const sides = assignSides(discs), spots = sideSpots(discs, sides), radius = DISC.radius * STAGE.side.scale;
  assert.equal(spots.size, 5);
  for (const [key, spot] of spots) {
    assert.ok(clearOfBag(spot, radius), `${key} clears the bag`);
    assert.equal(Math.sign(spot.position[0]), sides.get(key) === 'left' ? -1 : 1, `${key} on its side`);
  }
  const y = key => spots.get(key).position[1];
  assert.ok(y('fast') > y('mid') && y('mid') > y('slow'), 'Faster discs sit higher in their column');
  assert.ok(minGap(spots) >= 2 * radius + STAGE.side.row - 1e-9, 'Room for a name between discs');
  // Unrated discs count as neutral and still get a spot.
  assert.equal(sideSpots([entry('x', null), entry('y', .2, .3)]).size, 2);
});

// Out discs with a name of `width` × `height` (page-view meters, gap above included) under each.
const named = (list, width, height) => list.map(d => ({...d, label: {width, height}}));
// The disc-and-name box of a staged spot, for a name of label × pull.
const footBox = (spot, label, pull) => {
  const r = DISC.radius * spot.scale, reach = Math.max(r, label.width * pull / 2), [x, y] = spot.position;
  return {xMin: x - reach, xMax: x + reach, yMin: y - r - label.height * pull, yMax: y + r};
};
const boxesOverlap = (a, b, by = 0) => a.xMin < b.xMax + by - 1e-6 && b.xMin < a.xMax + by - 1e-6 && a.yMin < b.yMax + by - 1e-6 && b.yMin < a.yMax + by - 1e-6;

test('beside the bag, wide names step their column out so no name reaches the bag; tall names open the rows', () => {
  const discs = named([entry('a', .2, .9), entry('b', .25, .1), entry('c', .3, .5), entry('d', .8, .7), entry('e', .9, .2)], .2, .05);
  for (const pull of [1, 1.4]) {
    const spots = sideSpots(discs, undefined, {pull}), label = {width: .2, height: .05};
    const boxes = [...spots.values()].map(spot => footBox(spot, label, pull));
    for (const box of boxes) assert.ok(!boxesOverlap(box, BAG_BOX), `${pull}: name clear of the bag ${JSON.stringify(box)}`);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) assert.ok(!boxesOverlap(boxes[i], boxes[j]), `${pull}: discs and names apart`);
  }
  // Narrow names leave the columns where they were.
  const plain = sideSpots(discs.map(({label, ...d}) => d)), narrow = sideSpots(named(discs, .01, .01));
  assert.deepEqual([...narrow].map(([k, s]) => [k, s.position[0]]), [...plain].map(([k, s]) => [k, s.position[0]]));
});

const inflateBy = (box, by) => ({xMin: box.xMin - by, xMax: box.xMax + by, yMin: box.yMin - by, yMax: box.yMax + by});

// Map mode: the discs flank the bag in columns that fill the free canvas, and the bag keeps its
// full size. A wide desktop canvas (the page's free width at the bag's usual height) and a phone's.
const WIDE = {aspect: 1392 / 850, halfHeight: HALF_HEIGHT, centerY: .075}, NARROW = {aspect: 374 / 468, halfHeight: HALF_HEIGHT, centerY: .075};
// Names keep their pixel size: about .09 × .03 m at the page view on a desktop canvas, .14 × .06 m on a phone's.
const DESKTOP = {width: .09, height: .03}, PHONE = {width: .14, height: .06};
const mixes = count => ({
  mixed: Array.from({length: count}, (_, i) => entry('m' + i, ((i * 37) % 100) / 100, ((i * 53) % 97) / 97)),
  overstable: Array.from({length: count}, (_, i) => entry('o' + i, .7 + ((i * 7) % count) * .25 / count, ((i * 53) % 97) / 97)),
  understable: Array.from({length: count}, (_, i) => entry('u' + i, .05 + ((i * 5) % count) * .2 / count, ((i * 31) % 89) / 89)),
  neutral: Array.from({length: count}, (_, i) => entry('n' + i, .5, .5)),
});

test('flank order: the relative split, each side listed outermost (most extreme) first', () => {
  const list = [entry('fade', .9, 0), entry('x', null), entry('turn', .1, 0), entry('p', .55, 0), entry('flip', .3, 0), entry('beef', .8, 0)];
  const {left, right} = flankOrder(list);
  assert.deepEqual(left.map(d => d.key), ['turn', 'flip', 'x']);
  assert.deepEqual(right.map(d => d.key), ['fade', 'beef', 'p']);
});

test('map mode flanks the full-size bag: more turn left, more fade right, outermost the most extreme, faster higher', () => {
  for (const count of [6, 8, 12, 18]) for (const [mix, list] of Object.entries(mixes(count))) {
    const discs = named(list, DESKTOP.width, DESKTOP.height), frame = flankFrame({...WIDE, entries: discs}), name = `${count} ${mix}`;
    const stability = key => discs.find(d => d.key === key).atlas?.x ?? .5, speed = key => discs.find(d => d.key === key).atlas?.y ?? .5;
    assert.ok(frame.fits, `${name}: fits with names`);
    assert.equal(frame.pull, 1, `${name}: the bag keeps its full size`);
    assert.equal(frame.spots.size, count);
    const sides = assignSides(discs), {left, right} = flankOrder(discs);
    for (const [key, spot] of frame.spots) {
      assert.equal(spot.side, sides.get(key), `${name}: ${key} on its side`);
      assert.ok(spot.side === 'left' ? spot.position[0] < RING_BAG.xMin : spot.position[0] > RING_BAG.xMax, `${name}: ${key} beside the bag, not over or under it`);
    }
    assert.ok(Math.max(...left.map(d => stability(d.key))) <= Math.min(...right.map(d => stability(d.key))), `${name}: every left disc is less overstable than every right disc`);
    // Columns: outermost first on each side, each one's discs at least as extreme as the next one in; faster discs higher.
    for (const side of ['left', 'right']) {
      const columns = frame.columns.filter(c => c.side === side), sign = side === 'left' ? 1 : -1;
      for (let i = 1; i < columns.length; i++) {
        assert.ok(sign * (columns[i].x - columns[i - 1].x) > 0, `${name}: ${side} columns run outermost first`);
        assert.ok(Math.max(...columns[i - 1].keys.map(stability)) * sign <= Math.min(...columns[i].keys.map(stability)) * sign || sign < 0 && Math.min(...columns[i - 1].keys.map(stability)) >= Math.max(...columns[i].keys.map(stability)), `${name}: ${side} outer column is the more extreme`);
      }
      for (const column of columns) for (let i = 1; i < column.keys.length; i++) {
        const [a, b] = [frame.spots.get(column.keys[i - 1]), frame.spots.get(column.keys[i])];
        assert.ok(a.position[1] > b.position[1] && speed(column.keys[i - 1]) >= speed(column.keys[i]), `${name}: faster discs higher`);
      }
    }
    // Nothing on the bag or another disc or name; every disc and name inside the frame.
    const boxes = [...frame.spots].map(([key, spot]) => [key, footBox(spot, DESKTOP, frame.pull)]);
    for (const [key, box] of boxes) {
      assert.ok(!boxesOverlap(box, RING_BAG), `${name}: ${key} and its name clear of the bag`);
      assert.ok(box.xMin >= frame.region.xMin - DISC.radius * STAGE.map.scale - 1e-6 && box.xMax <= frame.region.xMax + DISC.radius * STAGE.map.scale + 1e-6, `${name}: ${key} inside the frame`);
    }
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) assert.ok(!boxesOverlap(boxes[i][1], boxes[j][1]), `${name}: ${boxes[i][0]} and ${boxes[j][0]} (with names) apart`);
    assert.deepEqual([...flankFrame({...WIDE, entries: discs}).spots], [...frame.spots], `${name}: deterministic`);
  }
});

test('the flanks use all the room: columns spread to the canvas edge, rows over its full height', () => {
  const discs = named(mixes(18).mixed, DESKTOP.width, DESKTOP.height), frame = flankFrame({...WIDE, entries: discs});
  const reach = Math.max(DISC.radius * STAGE.map.scale, DESKTOP.width / 2), xs = [...frame.spots.values()].map(s => s.position[0]), ys = [...frame.spots.values()].map(s => s.position[1]);
  assert.ok(Math.abs(Math.min(...xs) - (frame.region.xMin + reach - DISC.radius * STAGE.map.scale)) < 1e-9 && Math.abs(Math.max(...xs) - (frame.region.xMax - reach + DISC.radius * STAGE.map.scale)) < 1e-9, 'Outermost columns reach the edges');
  assert.ok(Math.abs(Math.max(...ys) - frame.region.yMax) < 1e-9 && Math.min(...ys) - DESKTOP.height <= frame.region.yMin + 1e-9, 'Rows run from the top of the frame to its bottom');
  assert.ok(frame.columns.length >= 4, 'Eighteen discs take two columns a side: ' + frame.columns.length);
  // A few discs take one column a side, midway between the bag and the edge.
  const six = flankFrame({...WIDE, entries: named(mixes(6).mixed, DESKTOP.width, DESKTOP.height)});
  assert.equal(six.columns.length, 2);
  for (const column of six.columns) assert.ok(Math.abs(column.x) > RING_BAG.xMax + .1, 'One column a side sits out in the room, not hugging the bag');
});

test('the flanks keep the panel strip, the zoom corner and the kept-clear boxes free, pulling back only as far as they need', () => {
  const reserve = {width: .12, height: .08}, clear = [{left: 0, top: 0, right: .13, bottom: .08}, {left: 0, top: .96, right: .1, bottom: 1}, {left: .9, top: .96, right: 1, bottom: 1}];
  for (const count of [6, 8, 12, 16]) {
    const discs = named(mixes(count).mixed, DESKTOP.width, DESKTOP.height), frame = flankFrame({...WIDE, reserve, clear, entries: discs});
    const keep = frame.avoid.map(box => inflateBy(box, -DISC.radius * STAGE.map.scale));
    for (const [key, spot] of frame.spots) for (const box of keep) assert.ok(!boxesOverlap(footBox(spot, DESKTOP, frame.pull), box), `${count}: ${key} clear of a kept-clear box`);
    assert.equal(frame.pull, 1, `${count}: full-size bag with kept-clear boxes`);
  }
  // A full-height strip at one side (a details panel over the canvas) is left empty.
  const panel = {left: .75, top: 0, right: 1, bottom: 1}, discs = named(mixes(8).mixed, DESKTOP.width, DESKTOP.height);
  const beside = flankFrame({...WIDE, clear: [panel], entries: discs}), w = WIDE.halfHeight * beside.pull * WIDE.aspect, strip = -w + 2 * w * panel.left;
  for (const [key, spot] of beside.spots) assert.ok(footBox(spot, DESKTOP, beside.pull).xMax <= strip + 1e-9, `${key} keeps out of the panel strip`);
  // A phone's narrow canvas has no room beside a full-size bag: it pulls back, names kept, below the named limit.
  const phone = flankFrame({...NARROW, entries: named(mixes(8).mixed, PHONE.width, PHONE.height)});
  assert.ok(phone.fits && phone.pull > 1 && phone.pull < 2.6, 'Phone pull ' + phone.pull);
  // A crowd whose names cannot fit says so (the viewer then shrinks the names or leaves them out),
  // while the same discs without names fit.
  const crowd = mixes(40).mixed;
  assert.equal(flankFrame({...NARROW, entries: named(crowd, .3, .12)}).fits, false);
  assert.equal(flankFrame({...WIDE, entries: crowd}).fits, true);
});
