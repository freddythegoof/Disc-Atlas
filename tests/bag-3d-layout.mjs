import assert from 'node:assert/strict';
import {test} from 'node:test';
import {bagLayout,depthOrder,DISC,MAIN,PUTTER,GOTO,TOP,FRONT,BAG_BOX,STAGE,stageMode,assignSides,sideSpots,mapFrame,mapSpots} from '../public/bag3d/bag-layout.mjs';
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

test('beside the bag, discs sort by stability: understable left, overstable right, balanced', () => {
  const discs = [entry('fade', .9, .4), entry('turn', .1, .6), entry('neutral', .52, .5), entry('flip', .3, .8), entry('stable', .7, .2)];
  for (let count = 1; count <= 5; count++) {
    const list = discs.slice(0, count), sides = assignSides(list);
    const left = list.filter(d => sides.get(d.key) === 'left'), right = list.filter(d => sides.get(d.key) === 'right');
    assert.ok(Math.abs(left.length - right.length) <= 1, `${count}: balanced ${left.length}/${right.length}`);
    if (left.length && right.length) assert.ok(Math.max(...left.map(d => d.atlas.x)) <= Math.min(...right.map(d => d.atlas.x)), `${count}: every left disc is less stable than every right disc`);
  }
  // A lone disc (or the middle one of an odd count) takes the side its own stability is on.
  assert.equal(assignSides([entry('fade', .9, .4)]).get('fade'), 'right');
  assert.equal(assignSides([entry('turn', .2, .4)]).get('turn'), 'left');
  assert.equal(assignSides([entry('a', .1, 0), entry('m', .8, 0), entry('b', .9, 0)]).get('m'), 'right');
  assert.equal(assignSides([entry('a', .1, 0), entry('m', .3, 0), entry('b', .9, 0)]).get('m'), 'left');
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

test('map spots follow Atlas positions around the bag without overlapping it or each other', () => {
  // Every disc also stays on the side of the bag its stability leans to, even when one side is crowded.
  const lopsided = Array.from({length: 14}, (_, i) => entry('o' + i, .55 + i * .02, (i * 7 % 14) / 14));
  const leftCount = 0, crowded = mapSpots(lopsided, mapFrame({count: 14, aspect: .8, halfHeight: HALF_HEIGHT, centerY: .075, left: leftCount, right: 14}));
  for (const [key, spot] of crowded) assert.ok(spot.position[0] > 0, `${key} (overstable) stays right of center`);
  assert.ok(minGap(crowded) >= 2 * DISC.radius * STAGE.map.scale + STAGE.map.gap - 1e-6, 'A crowded side still has no overlaps');
  const radius = DISC.radius * STAGE.map.scale, apart = 2 * radius + STAGE.map.gap;
  for (const count of [6, 10, 18, 26]) {
    const discs = Array.from({length: count}, (_, i) => entry('d' + i, ((i * 37) % 100) / 100, ((i * 53) % 97) / 97));
    const frame = mapFrame({count, aspect: .8, halfHeight: HALF_HEIGHT, centerY: .075, reserve: {width: .2, height: .1}});
    const spots = mapSpots(discs, frame), {region} = frame;
    assert.equal(spots.size, count);
    assert.ok(minGap(spots) >= apart - 1e-6, `${count}: no overlaps (${minGap(spots).toFixed(4)})`);
    for (const [key, spot] of spots) {
      assert.ok(clearOfBag(spot, radius), `${count}: ${key} is not on the bag ${spot.position}`);
      assert.ok(spot.position[0] >= region.xMin - 1e-9 && spot.position[0] <= region.xMax + 1e-9 && spot.position[1] >= region.yMin - 1e-9 && spot.position[1] <= region.yMax + 1e-9, `${count}: ${key} inside the frame`);
    }
    assert.deepEqual([...mapSpots(discs, frame)], [...spots], 'Deterministic');
  }
});

test('the map keeps the Atlas order: stability left to right, speed bottom to top', () => {
  // Well-separated discs land where the Atlas puts them, scaled to the frame.
  const frame = mapFrame({count: 6, aspect: .8, halfHeight: HALF_HEIGHT, centerY: .075});
  const discs = [entry('understable-fast', .05, .95), entry('overstable-fast', .95, .95), entry('understable-slow', .05, .1), entry('overstable-slow', .95, .1), entry('neutral-fast', .5, 1), entry('flippy-mid', .1, .55)];
  const spots = mapSpots(discs, frame), x = key => spots.get(key).position[0], y = key => spots.get(key).position[1];
  assert.ok(x('understable-fast') < x('neutral-fast') && x('neutral-fast') < x('overstable-fast'), 'Stability runs left to right');
  assert.ok(y('understable-slow') < y('flippy-mid') && y('flippy-mid') < y('understable-fast'), 'Speed runs bottom to top');
  assert.ok(y('neutral-fast') > BAG_BOX.yMax, 'A neutral fast disc rests above the bag');
  // A neutral slow disc would land on the bag: it steps out to the side its stability leans to.
  const pushed = mapSpots([entry('neutral-slow-under', .48, .2), entry('neutral-slow-over', .52, .2), ...discs.slice(0, 4)], frame);
  assert.ok(pushed.get('neutral-slow-under').position[0] < BAG_BOX.xMin && pushed.get('neutral-slow-over').position[0] > BAG_BOX.xMax, 'Pushed off the bag toward its own side');
  // Two copies of one mold share an Atlas position and part side by side.
  const twins = mapSpots([entry('a', .2, .5), entry('b', .2, .5), ...discs.slice(0, 4)], frame);
  assert.ok(Math.hypot(twins.get('a').position[0] - twins.get('b').position[0], twins.get('a').position[1] - twins.get('b').position[1]) >= 2 * DISC.radius * STAGE.map.scale);
});

test('the map frame pulls back only as far as the count needs, and keeps the zoom corner clear', () => {
  const pulls = [6, 12, 20, 30].map(count => mapFrame({count, aspect: .8, halfHeight: HALF_HEIGHT, centerY: .075}).pull);
  assert.equal(pulls[0], STAGE.map.pull, 'Six discs take the least pull-back');
  assert.ok(pulls.every((pull, i) => i === 0 || pull >= pulls[i - 1]) && pulls.at(-1) <= STAGE.map.maxPull, 'More discs pull back further, within the cap: ' + pulls);
  const frame = mapFrame({count: 12, aspect: .8, halfHeight: HALF_HEIGHT, centerY: .075, reserve: {width: .3, height: .15}});
  const corner = frame.avoid[1], spots = mapSpots(Array.from({length: 12}, (_, i) => entry('c' + i, .9 + i * .008, .9 + i * .008)), frame);
  for (const spot of spots.values()) assert.ok(!(spot.position[0] > corner.xMin && spot.position[1] > corner.yMin), 'No disc under the zoom buttons ' + spot.position);
});

test('a typical bag, bunched around neutral, keeps its stability order on the map', () => {
  // Real bags cluster near the middle of the stability axis; most of them land beside the bag.
  const discs = [[.38, .85], [.44, .78], [.47, .6], [.52, .55], [.55, .82], [.58, .35], [.61, .4], [.64, .2], [.66, .12], [.7, .1], [.5, .25], [.42, .15]].map(([x, y], i) => entry('t' + i, x, y));
  const spots = mapSpots(discs, mapFrame({count: discs.length, aspect: .8, halfHeight: HALF_HEIGHT, centerY: .075}));
  const rank = values => { const order = values.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]), r = []; order.forEach(([, i], k) => r[i] = k); return r; };
  const rho = (a, b) => { const ra = rank(a), rb = rank(b), n = a.length; return 1 - 6 * ra.reduce((sum, r, i) => sum + (r - rb[i]) ** 2, 0) / (n * (n * n - 1)); };
  const xs = rho(discs.map(d => spots.get(d.key).position[0]), discs.map(d => d.atlas.x)), ys = rho(discs.map(d => spots.get(d.key).position[1]), discs.map(d => d.atlas.y));
  assert.ok(xs >= .8, 'Stability order: rank correlation ' + xs.toFixed(3));
  assert.ok(ys >= .9, 'Speed order: rank correlation ' + ys.toFixed(3));
  for (const d of discs) assert.equal(Math.sign(spots.get(d.key).position[0]), d.atlas.x < .5 ? -1 : 1, d.key + ' on the side of the bag its stability leans to');
});
