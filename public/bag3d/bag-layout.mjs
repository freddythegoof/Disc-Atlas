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
  map: {scale: .40, gap: .014, z: .05, pull: 1.3, maxPull: 2.6, fill: 1.6},
};
export const stageMode = count => count < 1 ? null : count <= STAGE.sideMax ? 'side' : 'map';

/**
 * Splits out discs between the bag's sides by stability, as evenly as possible: the more
 * understable half rests on the left, the more overstable half on the right, like the Atlas's
 * stability axis. With an odd count the middle disc takes the side its own stability is on.
 * entries: [{key, atlas}] (atlas: {x: stability 0–1, y: speed 0–1} or null, which counts as
 * neutral). Returns Map key → 'left' | 'right'.
 */
export function assignSides(entries) {
  const stability = entry => entry.atlas?.x ?? .5;
  const ranked = entries.map((entry, index) => ({entry, index})).sort((a, b) => stability(a.entry) - stability(b.entry) || a.index - b.index);
  const half = Math.floor(ranked.length / 2), sides = new Map();
  ranked.forEach(({entry}, rank) => sides.set(entry.key, rank < half ? 'left' : rank >= ranked.length - half ? 'right' : stability(entry) < .5 ? 'left' : 'right'));
  return sides;
}

// Beside the bag: each side is one column centered on the bag, faster discs higher (the Atlas's
// speed axis). `row` is the room between discs for a name (at least STAGE.side.row).
export function sideSpots(entries, sides = assignSides(entries), {row = STAGE.side.row} = {}) {
  const {scale, gap, y, z} = STAGE.side, radius = DISC.radius * scale, step = 2 * radius + Math.max(row, STAGE.side.row), spots = new Map();
  const speed = entry => entry.atlas?.y ?? .5;
  for (const [side, sign] of [['left', -1], ['right', 1]]) {
    const column = entries.map((entry, index) => ({entry, index})).filter(({entry}) => sides.get(entry.key) === side)
      .sort((a, b) => speed(b.entry) - speed(a.entry) || a.index - b.index).map(({entry}) => entry.key);
    const x = sign * (Math.max(-BAG_BOX.xMin, BAG_BOX.xMax) + gap + radius);
    column.forEach((key, index) => spots.set(key, {position: [x, y + ((column.length - 1) / 2 - index) * step, z], scale, side}));
  }
  return spots;
}

/**
 * The map's frame for `count` discs: how far the camera pulls back (`pull`, 1 = the page view)
 * and the box disc centers may use, in the bag's frame. The view's half height at the page
 * distance is `halfHeight` around `centerY`; `aspect` is width / height. `reserve` keeps a
 * top-right corner clear (fractions of the canvas), e.g. for the zoom buttons.
 */
export function mapFrame({count, aspect, halfHeight, centerY, reserve = {width: 0, height: 0}, left = count / 2, right = count / 2}) {
  const {scale, gap, pull: least, maxPull, fill} = STAGE.map, radius = DISC.radius * scale, apart = 2 * radius + gap;
  const frameAt = pull => {
    const h = halfHeight * pull, w = h * aspect, margin = radius + .012 * pull;
    const region = {xMin: -w + margin, xMax: w - margin, yMin: centerY - h + margin, yMax: centerY + h - margin};
    const corner = {xMin: w - 2 * w * reserve.width - radius, xMax: Infinity, yMin: centerY + h - 2 * h * reserve.height - radius, yMax: Infinity};
    return {pull, region, avoid: [inflate(BAG_BOX, radius + gap), corner]};
  };
  // Room on each side of the bag (understable left, overstable right): how many discs fit on a
  // square grid of disc spacing in that half, off the bag and the reserved corner. Pull back
  // until each side holds its discs with some slack.
  const fits = frame => gridSlots(frame, -1, apart).length >= Math.ceil(left * fill) && gridSlots(frame, 1, apart).length >= Math.ceil(right * fill);
  let pull = least;
  while (pull < maxPull && !fits(frameAt(pull))) pull += .02;
  return frameAt(Math.min(pull, maxPull));
}
// Disc-spaced grid points on one side of the bag's center line (side −1 left, 1 right), off the
// bag and the reserved corner: the spots a crowded side can always fall back to.
function gridSlots({region, avoid}, side, apart) {
  const slots = [];
  for (let x = apart / 2; x <= Math.abs(side < 0 ? region.xMin : region.xMax) + 1e-9; x += apart)
    for (let y = region.yMin; y <= region.yMax + 1e-9; y += apart)
      if (!avoid.some(box => inside({x: side * x, y}, box))) slots.push({x: side * x, y});
  return slots;
}
const inflate = (box, by) => ({xMin: box.xMin - by, xMax: box.xMax + by, yMin: box.yMin - by, yMax: box.yMax + by});
const intersect = (a, b) => ({xMin: Math.max(a.xMin, b.xMin), xMax: Math.min(a.xMax, b.xMax), yMin: Math.max(a.yMin, b.yMin), yMax: Math.min(a.yMax, b.yMax)});
const area = box => Math.max(0, box.xMax - box.xMin) * Math.max(0, box.yMax - box.yMin);
const inside = (point, box) => point.x > box.xMin && point.x < box.xMax && point.y > box.yMin && point.y < box.yMax;

/**
 * Out discs on the flight map around the bag. entries: [{key, atlas}] where atlas is the disc's
 * Atlas position ({x: stability 0–1, y: speed 0–1}, as AtlasLayout.positions gives it) or null
 * for a mold without flight ratings. Stability runs left (more turn) to right (more fade), speed
 * bottom to top, across the frame's region; beside the bag each half of the stability axis fills
 * its own flank. A disc still on the bag (or the reserved corner) steps out by the shortest way;
 * discs then push apart until none overlap.
 * Deterministic: the same entries always give the same spots.
 */
export function mapSpots(entries, {region, avoid}) {
  const {scale, gap, z} = STAGE.map, apart = 2 * DISC.radius * scale + gap;
  const lerp = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));
  let unrated = 0;
  // Beside the bag (its height), each half of the stability axis spreads across its own flank, so
  // discs keep their left-to-right order instead of piling up at the bag's edges.
  const [bag] = avoid, flank = (x, side) => {
    const edge = side < 0 ? region.xMin : region.xMax, inner = side < 0 ? bag.xMin : bag.xMax;
    return inner + Math.min(1, Math.max(0, x / edge)) * (edge - inner);
  };
  const points = entries.map(({key, atlas}) => {
    // No flight ratings, no Atlas position: these line up along the bottom edge from the left.
    if (!atlas) return {key, x: region.xMin + apart * unrated++, y: region.yMin, side: -1};
    const side = atlas.x < .5 ? -1 : 1, x = lerp(region.xMin, region.xMax, atlas.x), y = lerp(region.yMin, region.yMax, atlas.y);
    return {key, x: y > bag.yMin && y < bag.yMax && bag.xMin > region.xMin && bag.xMax < region.xMax ? flank(x, side) : x, y, side, rated: true};
  });
  // Each rated disc keeps to its half: understable left of the bag's center line, overstable right.
  const settle = point => {
    point.x = Math.min(region.xMax, Math.max(region.xMin, point.x));
    if (point.rated) point.x = point.side < 0 ? Math.min(point.x, -apart / 2) : Math.max(point.x, apart / 2);
    point.y = Math.min(region.yMax, Math.max(region.yMin, point.y));
    avoid.forEach((box, index) => {
      if (!inside(point, box)) return;
      // A disc never leaves the bag (the first box) on the other side from its stability.
      const sticky = index === 0;
      const exits = [
        ...(sticky && point.side > 0 ? [] : [{x: box.xMin, y: point.y, cost: point.x - box.xMin}]),
        ...(sticky && point.side < 0 ? [] : [{x: box.xMax, y: point.y, cost: box.xMax - point.x}]),
        {x: point.x, y: box.yMin, cost: point.y - box.yMin},
        {x: point.x, y: box.yMax, cost: box.yMax - point.y},
      ].filter(exit => exit.x >= region.xMin - 1e-9 && exit.x <= region.xMax + 1e-9 && exit.y >= region.yMin - 1e-9 && exit.y <= region.yMax + 1e-9);
      const best = exits.sort((a, b) => a.cost - b.cost)[0];
      if (best) { point.x = best.x; point.y = best.y; }
    });
  };
  points.forEach(settle);
  for (let round = 0; round < 1500; round++) {
    let moved = false;
    for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
      const a = points[i], b = points[j];
      let dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy);
      if (distance >= apart - 1e-6) continue;
      // Coincident discs (two copies of one mold) part along the stability axis.
      if (distance < 1e-9) { dx = 1; dy = (j - i) % 2 ? .25 : -.25; distance = Math.hypot(dx, dy); }
      const push = (apart - distance) / 2 + 1e-5, ux = dx / distance, uy = dy / distance;
      a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push;
      moved = true;
    }
    points.forEach(settle);
    if (!moved) break;
  }
  // A side too crowded to settle snaps to its grid: each disc, in speed then stability order,
  // takes the free grid point nearest where the Atlas put it.
  for (const side of [-1, 1]) {
    const group = points.filter(point => point.side === side);
    const crowded = group.some((a, i) => group.some((b, j) => j > i && Math.hypot(a.x - b.x, a.y - b.y) < apart - 1e-6));
    if (!crowded) continue;
    const free = gridSlots({region, avoid}, side, apart);
    for (const point of [...group].sort((a, b) => b.y - a.y || side * (b.x - a.x))) {
      if (!free.length) break;
      let best = 0;
      free.forEach((slot, i) => { if (Math.hypot(slot.x - point.x, slot.y - point.y) < Math.hypot(free[best].x - point.x, free[best].y - point.y)) best = i; });
      [{x: point.x, y: point.y}] = free.splice(best, 1);
    }
  }
  return new Map(points.map(point => [point.key, {position: [point.x, point.y, z], scale}]));
}
