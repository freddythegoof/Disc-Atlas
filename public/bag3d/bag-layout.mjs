// Disc Atlas extension: places a bag's slots inside the GLB's pockets.
// Units are the GLB's meters (Y up, +Z front). The disc mesh is 10 mm thick along
// its local X axis and 202 mm across, so an unrotated disc stands edge-on to the front.
// No three.js dependency, so the placement rules are unit-testable in Node.

export const DISC = {radius: .101, thickness: .010};
// The main compartment's inner span, from the GLB's DiscSlot00–11 centers (±0.102) plus half a disc.
export const MAIN = {xMin: -.107, xMax: .107, y: -.072, z: .01, maxSlots: 48};
// Pockets by physical location. Like a real Grip-style bag, putters ride in the TOP pocket
// and the go-to disc sits in the FRONT pocket above the main compartment.
// Front pocket: mouth at y 0.145, depth z 0.121–0.191, width ±0.126. Stacks from its front edge.
export const FRONT = {anchor: 'front', front: .176, span: .044, y: .137, mouth: .145, scale: .85, rise: .009, spread: .013, maxX: .036,
  tilt: 0, raise: .085, forward: .05};
// Top pocket, behind the front pocket. Putters stand in one neat row around its center line:
// same x, same tilt, even spacing, each a step higher so every rim shows above the one in front.
// Stowed (bag closed), they sink to one height with only their rims above the mouth.
export const TOP = {anchor: 'center', center: .017, span: .060, y: .249, mouth: .252, scale: .92, rise: .016, spread: 0, maxX: .030,
  tilt: -.12, raise: .03, forward: .08, stowY: .172};
export const PUTTER = {...TOP, maxSlots: 8};
export const GOTO = {...FRONT, maxSlots: 6};
// The GLB authors its go-to accent rim and dashed outline around a disc seated in the top
// pocket; the viewer moves them from this pose to the go-to's front-pocket pose.
export const GLB_ACCENT_POSE = {position: [0, TOP.y, TOP.center], rotation: [TOP.tilt, -Math.PI / 2, 0], scale: [1, TOP.scale, TOP.scale]};

const FACE_FORWARD = -Math.PI / 2, MAX_GAP = .012;
// Slide-out: how far clear of a pocket mouth a pulled disc rests, and where main discs come to rest.
const CLEAR = .006;
export const SLIDE = {main: {y: .05, z: .30, maxX: .035}, forward: .014};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
// Alternate later discs left/right so each one's rim shows above the disc in front of it.
const fan = (order, spread, max) => order === 0 ? 0 : clamp((order % 2 ? 1 : -1) * Math.ceil(order / 2) * spread, -max, max);
const slotId = slot => slot?.id ?? slot?.item?.id ?? null;
const slotColor = slot => slot?.color ?? slot?.item?.color ?? null;

/**
 * slots: {main, putter, goTo}, each an ordered array whose entries are a disc
 * ({id, color}, or bagSlots()' {item}) or null/{item:null} for an empty slot.
 * Returns {placements, clipped}. Slots beyond a pocket's illustrated maximum are
 * counted in `clipped` (filled discs only) so the page can list them instead.
 */
export function bagLayout({main = [], putter = [], goTo = []} = {}) {
  const placements = [], clipped = {main: 0, putter: 0, goTo: 0};
  const take = (list, max, pocket) => {
    clipped[pocket] = list.slice(max).filter(slot => slotId(slot) !== null).length;
    return list.slice(0, max);
  };
  const entry = (slot, pocket, order) => {
    const id = slotId(slot);
    return {key: id === null ? `${pocket}-empty-${order}` : id, id, color: slotColor(slot), pocket, order, empty: id === null};
  };

  const mains = take(main, MAIN.maxSlots, 'main');
  const step = (MAIN.xMax - MAIN.xMin) / Math.max(mains.length, 1);
  // Leave a sliver between rims; thin discs stay readable as edges.
  const thin = Math.min(1, step * .82 / DISC.thickness);
  mains.forEach((slot, order) => {
    const x = MAIN.xMin + step * (order + .5);
    placements.push({...entry(slot, 'main', order), position: [x, MAIN.y, MAIN.z], rotation: [0, 0, 0], scale: [thin, 1, 1],
      // Pulled forward out of the opening, toward the viewer.
      lift: [clamp(x, -.045, .045), .005, .235], slotWidth: step,
      // Slid out: drawn forward out of the open compartment, then up and turned to show its face.
      slide: {position: [clamp(x, -SLIDE.main.maxX, SLIDE.main.maxX), SLIDE.main.y, SLIDE.main.z], rotation: [0, FACE_FORWARD, 0], scale: [1, 1, 1]}});
  });

  // Putters and go-to discs face forward in a shallow stack: order 0 is the front disc.
  const stack = (list, spec, pocket) => {
    const gap = list.length > 1 ? Math.min(MAX_GAP, spec.span / (list.length - 1)) : 0;
    const depthScale = list.length > 1 ? Math.min(1, gap * .85 / DISC.thickness) : 1;
    const front = spec.anchor === 'front' ? spec.front : spec.center + gap * (list.length - 1) / 2;
    list.forEach((slot, order) => {
      const x = fan(order, spec.spread, spec.maxX), y = spec.y + order * spec.rise, z = front - order * gap;
      placements.push({...entry(slot, pocket, order), position: [x, y, z], rotation: [spec.tilt, FACE_FORWARD, 0],
        scale: [depthScale, spec.scale, spec.scale], lift: [x * .5, y + spec.raise, z + spec.forward],
        ...(spec.stowY === undefined ? {} : {stow: {position: [x, spec.stowY, z], rotation: [spec.tilt, FACE_FORWARD, 0], scale: [depthScale, spec.scale, spec.scale]}}),
        // Only the part above the pocket's mouth is visible (and targetable).
        mouth: spec.mouth,
        // Slid out: straight up until the whole disc clears the mouth, then a short step forward
        // past the stack's front disc so nothing in the pocket covers it.
        slide: {position: [x, spec.mouth + DISC.radius * spec.scale + CLEAR, front + SLIDE.forward], rotation: [spec.tilt, FACE_FORWARD, 0], scale: [1, spec.scale, spec.scale]}});
    });
  };
  stack(take(putter, PUTTER.maxSlots, 'putter'), PUTTER, 'putter');
  // Several go-to copies share the front pocket.
  stack(take(goTo, GOTO.maxSlots, 'goTo'), GOTO, 'goTo');
  return {placements, clipped};
}

// Hit/paint order for the overlapping upper pockets: back-most first, so the front disc wins.
export function depthOrder(placements) {
  return [
    ...placements.filter(p => p.pocket === 'main'),
    ...placements.filter(p => p.pocket !== 'main').sort((a, b) => a.position[2] - b.position[2]),
  ];
}

// Staging: a clicked disc slides out of its pocket and stays out until it is clicked again.
// One to five out discs rest beside the bag, understable left and overstable right; from the sixth, every out disc
// takes its place on a small flight map around the bag. Positions are in the bag's frame with the
// user's turn removed, so out discs hold still while the bag turns between them.
// The bag's silhouette (meshes measured from the GLB, putters standing): x ±.228, top .39 with
// putters out. The open flap hangs forward to y −.47, so nothing rests below the bag.
export const BAG_BOX = {xMin: -.235, xMax: .235, yMin: -.50, yMax: .40};
export const STAGE = {
  sideMax: 5,
  // Beside the bag: columns just clear of its sides, room for a name under each disc.
  side: {scale: .58, gap: .02, row: .09, y: .03, z: .05},
  // Around the bag: smaller discs; the camera pulls back at least `pull` and more as the count grows.
  map: {scale: .40, gap: .014, z: .05, pull: 1.3, maxPull: 2.6, fill: 1.6, edge: .012},
};
export const stageMode = count => count < 1 ? null : count <= STAGE.sideMax ? 'side' : 'map';

/**
 * Splits out discs between the bag's sides relative to each other, never by a fixed stability
 * threshold: ranked by stability, the less overstable half rests on the left and the more
 * overstable half on the right, so both columns stay even whatever the bag leans to. With an odd
 * count the median disc joins the neighbor it is nearer in stability (the right on a tie, and a
 * lone disc rests on the right).
 * entries: [{key, atlas}] (atlas: {x: stability 0–1, y: speed 0–1} or null, which counts as
 * neutral). Returns Map key → 'left' | 'right'.
 */
export function assignSides(entries) {
  const stability = entry => entry.atlas?.x ?? .5;
  const ranked = entries.map((entry, index) => ({entry, index})).sort((a, b) => stability(a.entry) - stability(b.entry) || a.index - b.index);
  const half = Math.floor(ranked.length / 2), sides = new Map();
  ranked.forEach(({entry}, rank) => sides.set(entry.key, rank < half ? 'left' : 'right'));
  if (ranked.length % 2 && half > 0) {
    const [below, median, above] = ranked.slice(half - 1, half + 2).map(({entry}) => stability(entry));
    if (median - below < above - median - 1e-9) sides.set(ranked[half].entry.key, 'left');
  }
  return sides;
}

// A name rests under its disc. Entries may carry `label: {width, height}`, the name's size in the
// bag's meters at the page view (pull-back 1, including the gap above it); it grows with the
// pull-back because names keep their pixel size while the scene shrinks.
const labelAt = (entry, pull) => ({width: (entry.label?.width ?? 0) * pull, height: (entry.label?.height ?? 0) * pull});

// Beside the bag: each side is one column centered on the bag, faster discs higher (the Atlas's
// speed axis). `row` is the room between discs for a name (at least STAGE.side.row, and at least
// the tallest name at `pull`); a column whose names are wider than its discs steps out from the
// bag so no name reaches it.
export function sideSpots(entries, sides = assignSides(entries), {row = STAGE.side.row, pull = 1} = {}) {
  const {scale, gap, y, z} = STAGE.side, radius = DISC.radius * scale, spots = new Map();
  const tallest = Math.max(0, ...entries.map(entry => labelAt(entry, pull).height));
  const step = 2 * radius + Math.max(row, STAGE.side.row, tallest + gap);
  const speed = entry => entry.atlas?.y ?? .5;
  for (const [side, sign] of [['left', -1], ['right', 1]]) {
    const column = entries.map((entry, index) => ({entry, index})).filter(({entry}) => sides.get(entry.key) === side)
      .sort((a, b) => speed(b.entry) - speed(a.entry) || a.index - b.index).map(({entry}) => entry);
    const reach = Math.max(radius, ...column.map(entry => labelAt(entry, pull).width / 2));
    const x = sign * (Math.max(-BAG_BOX.xMin, BAG_BOX.xMax) + gap + reach);
    column.forEach((entry, index) => spots.set(entry.key, {position: [x, y + ((column.length - 1) / 2 - index) * step, z], scale, side}));
  }
  return spots;
}

/**
 * The map's frame for `count` discs: how far the camera pulls back (`pull`, 1 = the page view)
 * and the box disc centers may use, in the bag's frame. The view's half height at the page
 * distance is `halfHeight` around `centerY`; `aspect` is width / height. `reserve` keeps a
 * top-right corner clear (fractions of the canvas), e.g. for the zoom buttons; `clear` lists more
 * boxes to keep clear ({left, top, right, bottom}, fractions of the canvas), e.g. the axis
 * captions. `label` is the largest name's size (see sideSpots), so each side's room counts a name
 * under every disc. `edge` is the least room between a disc (or name) and the canvas's edge, at the
 * page view (at least STAGE.map.edge; a small canvas asks for more, as its pixels are bigger).
 * Given the `entries` themselves (see mapSpots), the frame is the least pull-back at which their
 * laid-out map comes out clean, every disc and name clear of the rest, and keeps the Atlas order
 * (or, if no pull-back up to the cap keeps it, the least one that comes out clean).
 */
export function mapFrame({count, aspect, halfHeight, centerY, reserve = {width: 0, height: 0}, clear = [], label = {width: 0, height: 0}, edge = 0, left = count / 2, right = count / 2, entries = null}) {
  const {scale, gap, pull: least, maxPull, fill} = STAGE.map, radius = DISC.radius * scale;
  const frameAt = pull => {
    const h = halfHeight * pull, w = h * aspect, margin = radius + Math.max(STAGE.map.edge, edge) * pull;
    const region = {xMin: -w + margin, xMax: w - margin, yMin: centerY - h + margin, yMax: centerY + h - margin};
    const corner = {xMin: w - 2 * w * reserve.width - radius, xMax: Infinity, yMin: centerY + h - 2 * h * reserve.height - radius, yMax: Infinity};
    const boxes = clear.map(box => inflate({xMin: -w + 2 * w * box.left, xMax: -w + 2 * w * box.right, yMin: centerY + h - 2 * h * box.bottom, yMax: centerY + h - 2 * h * box.top}, radius));
    return {pull, region, avoid: [inflate(BAG_BOX, radius + gap), corner, ...boxes]};
  };
  // Room on each side of the bag (understable left, overstable right): how many discs, each with
  // its name, fit on a grid in that half, off the bag and the kept-clear boxes. Pull back until
  // each side holds its discs with some slack. With the entries given, the grid counts discs alone
  // (names stagger, so a grid of whole footprints overstates their need), then the pull-back grows
  // until the laid-out map is clean.
  const lattice = entries ? {width: 0, height: 0} : label;
  const fits = frame => {
    const cell = footprint(radius, labelAt({label: lattice}, frame.pull));
    return gridSlots(frame, -1, cell).length >= Math.ceil(left * fill) && gridSlots(frame, 1, cell).length >= Math.ceil(right * fill);
  };
  let pull = least;
  while (pull < maxPull && !fits(frameAt(pull))) pull += .02;
  if (!entries) return frameAt(Math.min(pull, maxPull));
  let clean = null;
  for (; pull < maxPull + 1e-9; pull += .02) {
    const frame = frameAt(pull), spots = mapSpots(entries, frame);
    if (!cleanMap(entries, frame, spots)) continue;
    clean ??= frame;
    if (keepsOrder(entries, spots)) return frame;
  }
  return clean ?? frameAt(maxPull);
}
// Whether the rated discs' spots keep the Atlas order: stability left to right and speed bottom to
// top, each with a rank correlation of at least .85 (fewer than four rated discs always do).
const ORDER = .85;
function keepsOrder(entries, spots) {
  const rated = entries.filter(entry => entry.atlas);
  if (rated.length < 4) return true;
  const rank = values => { const order = values.map((value, i) => [value, i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]), ranks = []; order.forEach(([, i], k) => { ranks[i] = k; }); return ranks; };
  const rho = (a, b) => { const ra = rank(a), rb = rank(b), n = a.length; return 1 - 6 * ra.reduce((sum, r, i) => sum + (r - rb[i]) ** 2, 0) / (n * (n * n - 1)); };
  const at = (entry, axis) => spots.get(entry.key).position[axis];
  return rho(rated.map(entry => at(entry, 0)), rated.map(entry => entry.atlas.x)) >= ORDER && rho(rated.map(entry => at(entry, 1)), rated.map(entry => entry.atlas.y)) >= ORDER;
}
// Whether the entries' map at `frame` comes out clean: every disc and its name inside the region,
// off the bag and the kept-clear boxes, and clear of every other disc and name.
function cleanMap(entries, frame, spots) {
  const {scale, gap} = STAGE.map, radius = DISC.radius * scale, {region, avoid} = frame;
  const points = entries.map(entry => { const [x, y] = spots.get(entry.key).position; return {x, y, ...footprint(radius, labelAt(entry, frame.pull))}; });
  return points.every((point, i) => point.x - (point.reach - radius) >= region.xMin - 1e-6 && point.x + (point.reach - radius) <= region.xMax + 1e-6
    && point.y - point.below >= region.yMin - 1e-6 && point.y <= region.yMax + 1e-6
    && !avoid.some(box => blocks(point, box, radius)) && points.every((other, j) => j <= i || !overlapOf(point, other, radius, gap - 1e-6)));
}
// A disc with its name under it: `reach` is how far it spans either side of the disc's center
// (the disc or its name, whichever is wider), `below` how far the name hangs under the disc.
const footprint = (radius, label) => ({reach: Math.max(radius, label.width / 2), below: label.height});
// Whether a disc at `point` (with its footprint) would reach into `box`, a box disc centers keep
// out of: its name widens the box by its extra reach and raises the box's top by the name's height.
const blocks = (point, box, radius) => point.x > box.xMin - (point.reach - radius) && point.x < box.xMax + (point.reach - radius) && point.y > box.yMin && point.y < box.yMax + point.below;
// Grid points one footprint (`cell`) apart on one side of the bag's center line (side −1 left,
// 1 right), off the bag and the kept-clear boxes: the spots a crowded side can always fall back to.
function gridSlots({region, avoid}, side, cell) {
  const {gap, scale} = STAGE.map, radius = DISC.radius * scale, slots = [];
  const extra = cell.reach - radius, edge = Math.abs(side < 0 ? region.xMin : region.xMax) - extra;
  for (let x = cell.reach + gap / 2; x <= edge + 1e-9; x += 2 * cell.reach + gap)
    for (let y = region.yMin + cell.below; y <= region.yMax + 1e-9; y += 2 * radius + cell.below + gap)
      if (!avoid.some(box => blocks({x: side * x, y, ...cell}, box, radius))) slots.push({x: side * x, y});
  return slots;
}
const inflate = (box, by) => ({xMin: box.xMin - by, xMax: box.xMax + by, yMin: box.yMin - by, yMax: box.yMax + by});

/**
 * Out discs on the flight map around the bag. entries: [{key, atlas, label}] where atlas is the
 * disc's Atlas position ({x: stability 0–1, y: speed 0–1}, as AtlasLayout.positions gives it) or
 * null for a mold without flight ratings, and label its name's size (see sideSpots). Stability
 * runs left (more turn) to right (more fade), speed bottom to top, across the frame's region;
 * beside the bag each half of the stability axis fills its own flank. A disc (with the name under
 * it) still on the bag or a kept-clear box steps out by the shortest way; discs then push apart
 * until no disc or name overlaps another.
 * Deterministic: the same entries always give the same spots.
 */
export function mapSpots(entries, {pull = 1, region, avoid}) {
  const {scale, gap, z} = STAGE.map, radius = DISC.radius * scale;
  const lerp = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));
  let unrated = region.xMin;
  // Beside the bag (its height), each half of the stability axis spreads across its own flank, so
  // discs keep their left-to-right order instead of piling up at the bag's edges.
  const [bag] = avoid, flank = (x, side, extra) => {
    const edge = side < 0 ? region.xMin + extra : region.xMax - extra, inner = side < 0 ? bag.xMin - extra : bag.xMax + extra;
    return inner + Math.min(1, Math.max(0, x / edge)) * (edge - inner);
  };
  const points = entries.map(entry => {
    const {key, atlas} = entry, foot = footprint(radius, labelAt(entry, pull)), extra = foot.reach - radius;
    // No flight ratings, no Atlas position: these line up along the bottom edge from the left.
    if (!atlas) { const x = unrated + extra; unrated += 2 * foot.reach + gap; return {key, ...foot, x, y: region.yMin + foot.below, side: -1}; }
    const side = atlas.x < .5 ? -1 : 1, x = lerp(region.xMin, region.xMax, atlas.x), y = lerp(region.yMin, region.yMax, atlas.y);
    return {key, ...foot, x: y > bag.yMin && y < bag.yMax + foot.below && bag.xMin > region.xMin && bag.xMax < region.xMax ? flank(x, side, extra) : x, y, side, rated: true};
  });
  // Each rated disc keeps to its half: understable left of the bag's center line, overstable right.
  const settle = point => {
    const extra = point.reach - radius;
    point.x = Math.min(region.xMax - extra, Math.max(region.xMin + extra, point.x));
    if (point.rated) point.x = point.side < 0 ? Math.min(point.x, -point.reach - gap / 2) : Math.max(point.x, point.reach + gap / 2);
    point.y = Math.min(region.yMax, Math.max(region.yMin + point.below, point.y));
    avoid.forEach((box, index) => {
      if (!blocks(point, box, radius)) return;
      // A disc never leaves the bag (the first box) on the other side from its stability.
      const sticky = index === 0, left = box.xMin - extra, right = box.xMax + extra, top = box.yMax + point.below;
      const exits = [
        ...(sticky && point.side > 0 ? [] : [{x: left, y: point.y, cost: point.x - left}]),
        ...(sticky && point.side < 0 ? [] : [{x: right, y: point.y, cost: right - point.x}]),
        {x: point.x, y: box.yMin, cost: point.y - box.yMin},
        {x: point.x, y: top, cost: top - point.y},
      ].filter(exit => exit.x >= region.xMin + extra - 1e-9 && exit.x <= region.xMax - extra + 1e-9 && exit.y >= region.yMin + point.below - 1e-9 && exit.y <= region.yMax + 1e-9);
      const best = exits.sort((a, b) => a.cost - b.cost)[0];
      if (best) { point.x = best.x; point.y = best.y; }
    });
  };
  points.forEach(settle);
  for (let round = 0; round < 1500; round++) {
    let moved = false;
    for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
      const a = points[i], b = points[j], overlap = overlapOf(a, b, radius, gap);
      if (!overlap) continue;
      // Apart along the shorter way out; coincident discs (two copies of one mold) part along the
      // stability axis.
      const push = overlap.by / 2 + 1e-5, sign = overlap.sign || ((j - i) % 2 ? 1 : -1);
      if (overlap.axis === 'x') { a.x -= sign * push; b.x += sign * push; } else { a.y -= sign * push; b.y += sign * push; }
      moved = true;
    }
    points.forEach(settle);
    if (!moved) break;
  }
  // A side too crowded to settle snaps to its grid: each disc, in speed then stability order,
  // takes the free grid point nearest where the Atlas put it.
  for (const side of [-1, 1]) {
    const group = points.filter(point => point.side === side);
    const crowded = group.some((a, i) => group.some((b, j) => j > i && overlapOf(a, b, radius, gap)));
    if (!crowded) continue;
    const cell = {reach: Math.max(...group.map(point => point.reach)), below: Math.max(...group.map(point => point.below))};
    const free = gridSlots({region, avoid}, side, cell);
    for (const point of [...group].sort((a, b) => b.y - a.y || side * (b.x - a.x))) {
      if (!free.length) break;
      let best = 0;
      free.forEach((slot, i) => { if (Math.hypot(slot.x - point.x, slot.y - point.y) < Math.hypot(free[best].x - point.x, free[best].y - point.y)) best = i; });
      [{x: point.x, y: point.y}] = free.splice(best, 1);
    }
  }
  return new Map(points.map(point => [point.key, {position: [point.x, point.y, z], scale}]));
}
// How far two discs' footprints (disc and name) overlap, `gap` apart counted: the shorter way out
// ('x' or 'y'), by how much, and which way b lies from a (0 when they coincide). Null when clear.
function overlapOf(a, b, radius, gap) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const x = a.reach + b.reach + gap - Math.abs(dx), y = radius + (dy >= 0 ? b.below : a.below) + radius + gap - Math.abs(dy);
  if (x <= 1e-6 || y <= 1e-6) return null;
  return x <= y ? {axis: 'x', by: x, sign: Math.sign(dx)} : {axis: 'y', by: y, sign: Math.sign(dy) || 1};
}
