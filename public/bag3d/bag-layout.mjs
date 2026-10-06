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
// takes its place on an even ring around the bag (map mode), in stability order along the arc. Positions are in the bag's frame with the
// user's turn removed, so out discs hold still while the bag turns between them.
// The bag's silhouette (meshes measured from the GLB, putters standing): x ±.228, top .39 with
// putters out. The open flap hangs forward to y −.47, so nothing rests below the bag.
export const BAG_BOX = {xMin: -.235, xMax: .235, yMin: -.50, yMax: .40};
export const STAGE = {
  sideMax: 5,
  // Beside the bag: columns just clear of its sides, room for a name under each disc.
  side: {scale: .58, gap: .02, row: .09, y: .03, z: .05},
  // Around the bag: smaller discs on a ring; the camera pulls back as far as the ring needs, up to `maxPull`.
  map: {scale: .40, gap: .014, z: .05, maxPull: 4, edge: .012},
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

// Around the bag (map mode) the out discs ring an ellipse centered on the view, the bag inside
// it. The layout is driven by evenness, not by the Atlas: the discs sit at even angles around the
// ellipse, in stability order along the arc (see ringAngle), so a bag of any stability mix spreads
// the same way. The ring clears the bag's silhouette as the page sees it in the discs' plane
// (measured from the GLB at the page view: x ±.23, bottom −.27, putters standing to .40); the
// open flap hangs out of sight behind it, so unlike BAG_BOX this box ends at the visible bottom.
export const RING_BAG = {xMin: -.235, xMax: .235, yMin: -.28, yMax: .40};

/** Ring order: least overstable first (unrated discs count as neutral; equal stability keeps the out order). */
export function ringOrder(entries) {
  const stability = entry => entry.atlas?.x ?? .5;
  return entries.map((entry, index) => ({entry, index})).sort((a, b) => stability(a.entry) - stability(b.entry) || a.index - b.index).map(({entry}) => entry);
}

/**
 * The ring angle of the `rank`-th of `count` discs (radians, counterclockwise from the right with
 * y up), as seen from the ring's center: evenly spaced, running clockwise from just left of the bottom (the most understable disc)
 * up the left side, over the top and down the right side to just right of the bottom (the most
 * overstable). The seam between the two ends sits at the bottom, one even step wide.
 */
export const ringAngle = (rank, count) => -Math.PI / 2 - (rank + .5) * 2 * Math.PI / count;

/**
 * The ring for `entries` ([{key, atlas, label}], as for sideSpots) at pull-back `pull`: each disc's
 * footprint (the disc and the name under it) centers on an ellipse around `center` whose height is
 * `ratio` times its width, where the ray at its ringAngle crosses it. Even angles leave a tall
 * ring's top and bottom, where names sit side by side, roomier than its sides, where they stack.
 * Without a `size` (the ellipse's half width), the ring
 * is the smallest that keeps every disc and name off the bag (`bag`, RING_BAG) and off each other.
 * Returns {spots: Map key → {position, scale, angle, rank}, ring: {center, a, b}}.
 * Deterministic: the same entries always give the same ring.
 */
export function ringLayout(entries, {pull = 1, center = [0, 0], ratio = 1.25, bag = RING_BAG, size} = {}) {
  const {scale, gap, z} = STAGE.map, radius = DISC.radius * scale, order = ringOrder(entries), count = order.length;
  const feet = order.map((entry, rank) => ({key: entry.key, rank, angle: ringAngle(rank, count), ...footprint(radius, labelAt(entry, pull))}));
  // A footprint centers on the ellipse where the ray at its angle crosses it, so its disc sits half
  // a name's height above that point.
  const at = a => feet.map(foot => {
    const b = ratio * a, cos = Math.cos(foot.angle), sin = Math.sin(foot.angle), r = a * b / Math.hypot(b * cos, a * sin);
    return {...foot, x: center[0] + r * cos, y: center[1] + r * sin + foot.below / 2};
  });
  const keep = inflate(bag, radius + gap);
  const clean = points => points.every((p, i) => !blocks(p, keep, radius) && points.every((q, j) => j <= i || !overlapOf(p, q, radius, gap - 1e-6)));
  let a = size;
  if (a === undefined) {
    // Clearance grows with the ring (very nearly in step), so halve toward the least clean size,
    // then step out until it is clean for certain.
    let low = 0, high = 1;
    while (!clean(at(high))) high *= 2;
    for (let i = 0; i < 30; i++) { const mid = (low + high) / 2; if (clean(at(mid))) high = mid; else low = mid; }
    a = high;
    while (!clean(at(a))) a += .002;
  }
  const points = at(a);
  return {spots: new Map(points.map(p => [p.key, {position: [p.x, p.y, z], scale, angle: p.angle, rank: p.rank}])), ring: {center: [...center], a, b: ratio * a}};
}

/**
 * The ring's frame: the least camera pull-back (1 = the page view) at which the ring around the bag
 * fits the canvas, every disc and name at least `edge` (page-view meters, at least STAGE.map.edge)
 * inside its edges and clear of the kept-clear boxes. The view's half height at the page distance
 * is `halfHeight` around `centerY`; `aspect` is width / height. `reserve` keeps a top-right corner
 * clear (fractions of the canvas), e.g. for the zoom buttons; `clear` lists more boxes to keep
 * clear ({left, top, right, bottom}, fractions of the canvas), e.g. the captions and the return
 * button. The ring centers on the view, in the shape (as tall for its width as one of RATIOS) that
 * lets the camera stay closest.
 * Names keep their pixel size while the scene shrinks, so the ring is laid out again at each pull.
 * Returns {pull, region, avoid, ratio, spots, ring, fits}, where `fits` is false when no ring fits
 * even at STAGE.map.maxPull (the caller may then make the names smaller or leave them out).
 */
export function ringFrame({aspect, halfHeight, centerY, reserve = {width: 0, height: 0}, clear = [], edge = 0, entries}) {
  const {scale, maxPull} = STAGE.map, radius = DISC.radius * scale;
  const frameAt = pull => {
    const h = halfHeight * pull, w = h * aspect, margin = radius + Math.max(STAGE.map.edge, edge) * pull;
    const region = {xMin: -w + margin, xMax: w - margin, yMin: centerY - h + margin, yMax: centerY + h - margin};
    const corner = {xMin: w - 2 * w * reserve.width - radius, xMax: Infinity, yMin: centerY + h - 2 * h * reserve.height - radius, yMax: Infinity};
    const boxes = clear.map(box => inflate({xMin: -w + 2 * w * box.left, xMax: -w + 2 * w * box.right, yMin: centerY + h - 2 * h * box.bottom, yMax: centerY + h - 2 * h * box.top}, radius));
    return {pull, region, avoid: [corner, ...boxes]};
  };
  const attempt = (pull, ratio) => {
    const frame = frameAt(pull), layout = ringLayout(entries, {pull, center: [0, centerY], ratio});
    return {...frame, ratio, ...layout, fits: fitsFrame(entries, frame, layout.spots)};
  };
  // The least pull-back that fits: coarse steps, then fine ones back from the first fit.
  const least = ratio => {
    let pull = 1, fit = attempt(pull, ratio);
    while (!fit.fits && pull < maxPull) { pull = Math.min(maxPull, pull + .2); fit = attempt(pull, ratio); }
    if (!fit.fits) return fit;
    for (let finer = pull - .02; finer > Math.max(1, pull - .2) - 1e-9; finer -= .02) { const next = attempt(finer, ratio); if (!next.fits) break; fit = next; }
    return fit;
  };
  // The shape that lets the camera stay closest (the roundest on a tie); with none fitting, the smallest ring.
  return RATIOS.map(least).reduce((best, option) => (option.fits && (!best.fits || option.pull < best.pull - 1e-9)) || (!best.fits && !option.fits && option.ring.a < best.ring.a) ? option : best);
}
// The ring shapes tried: height over width.
const RATIOS = [1, 1.15, 1.3, 1.45, 1.6];
// Whether every disc and its name lie inside the frame's region, clear of its kept-clear boxes.
function fitsFrame(entries, {pull, region, avoid}, spots) {
  const radius = DISC.radius * STAGE.map.scale;
  return entries.every(entry => {
    const [x, y] = spots.get(entry.key).position, point = {x, y, ...footprint(radius, labelAt(entry, pull))}, extra = point.reach - radius;
    return point.x - extra >= region.xMin - 1e-6 && point.x + extra <= region.xMax + 1e-6 && point.y - point.below >= region.yMin - 1e-6 && point.y <= region.yMax + 1e-6
      && !avoid.some(box => blocks(point, box, radius));
  });
}
// A disc with its name under it: `reach` is how far it spans either side of the disc's center
// (the disc or its name, whichever is wider), `below` how far the name hangs under the disc.
const footprint = (radius, label) => ({reach: Math.max(radius, label.width / 2), below: label.height});
// Whether a disc at `point` (with its footprint) would reach into `box`, a box disc centers keep
// out of: its name widens the box by its extra reach and raises the box's top by the name's height.
const blocks = (point, box, radius) => point.x > box.xMin - (point.reach - radius) && point.x < box.xMax + (point.reach - radius) && point.y > box.yMin && point.y < box.yMax + point.below;
const inflate = (box, by) => ({xMin: box.xMin - by, xMax: box.xMax + by, yMin: box.yMin - by, yMax: box.yMax + by});
// How far two discs' footprints (disc and name) overlap, `gap` apart counted: the shorter way out
// ('x' or 'y'), by how much, and which way b lies from a (0 when they coincide). Null when clear.
function overlapOf(a, b, radius, gap) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const x = a.reach + b.reach + gap - Math.abs(dx), y = radius + (dy >= 0 ? b.below : a.below) + radius + gap - Math.abs(dy);
  if (x <= 1e-6 || y <= 1e-6) return null;
  return x <= y ? {axis: 'x', by: x, sign: Math.sign(dx)} : {axis: 'y', by: y, sign: Math.sign(dy) || 1};
}
