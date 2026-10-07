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
// However many are out, they rest beside the bag in side columns: split relative to each other
// (the less overstable half left, the more overstable half right), faster discs higher, every
// disc named. Positions are in the bag's frame with the user's turn removed, so out discs hold
// still while the bag turns between them.
// The bag's silhouette (meshes measured from the GLB, putters standing): x ±.228, top .39 with
// putters out. The open flap hangs forward to y −.47, so nothing rests below the bag.
export const BAG_BOX = {xMin: -.235, xMax: .235, yMin: -.50, yMax: .40};
// The bag as the page sees it in the out discs' plane (measured from the GLB at the page view:
// x ±.23, bottom −.27, putters standing to .40). The columns keep clear of it.
export const SIDE_BAG = {xMin: -.235, xMax: .235, yMin: -.28, yMax: .40};
export const STAGE = {
  // `scales` are the disc sizes a column may take, largest first: a column that grows past the
  // canvas's height first closes up its rows, then takes the next size down, then wraps into a
  // second column beside it (up to `maxColumns` a side), and only then does the camera pull back
  // (up to `maxPull`). `row` is the room under a disc for its name when rows are not crowded;
  // `edge` keeps discs and names inside the canvas (page-view meters).
  side: {scales: [.58, .52, .46, .40], gap: .02, row: .09, y: .03, z: .05, maxColumns: 3, maxPull: 5, edge: .012},
};
export const stageMode = count => count < 1 ? null : 'side';

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

/**
 * Splits `entries` for the sides: {left, right}, each most extreme first (left: least overstable
 * first; right: most overstable first; unrated discs count as neutral; equal stability keeps the out order).
 */
export function sideOrder(entries) {
  const stability = entry => entry.atlas?.x ?? .5, sides = assignSides(entries);
  const ranked = entries.map((entry, index) => ({entry, index})).sort((a, b) => stability(a.entry) - stability(b.entry) || a.index - b.index).map(({entry}) => entry);
  return {left: ranked.filter(entry => sides.get(entry.key) === 'left'), right: ranked.filter(entry => sides.get(entry.key) === 'right').reverse()};
}

// A name rests centered under its disc ('below'); where the sides are narrow, under it with its
// inner edge flush with the disc's (the side toward the bag, 'flush'), so it reaches only outward;
// or, when the columns are tall, beside the disc on the side away from the bag ('outer'), so a
// column reads like a legend. One layout uses one of the three for every name. Entries may carry `label: {width,
// height}`, the name's size in the bag's meters at the page view (pull-back 1, the room around it
// included); it grows with the pull-back because names keep their pixel size while the scene shrinks.
const labelAt = (entry, pull) => ({width: (entry.label?.width ?? 0) * pull, height: (entry.label?.height ?? 0) * pull});
// A disc and its name as one box around the disc's center: how far it reaches toward the bag
// (`inner`) and away from it (`outer`), above (`up`) and below (`down`).
const footprint = (radius, label, labels) => labels === 'outer'
  ? {inner: radius, outer: radius + label.width, up: Math.max(radius, label.height / 2), down: Math.max(radius, label.height / 2)}
  : labels === 'flush' ? {inner: radius, outer: Math.max(radius, label.width - radius), up: radius, down: radius + label.height}
  : {inner: Math.max(radius, label.width / 2), outer: Math.max(radius, label.width / 2), up: radius, down: radius + label.height};
// The disc-and-name box of a spot, in the bag's meters, for a name of `label` (already at the pull).
export function spotBox(spot, label, labels) {
  const f = footprint(DISC.radius * spot.scale, label, labels), [x, y] = spot.position, left = spot.side === 'left';
  return {xMin: x - (left ? f.outer : f.inner), xMax: x + (left ? f.inner : f.outer), yMin: y - f.down, yMax: y + f.up};
}
const overlaps = (a, b) => a.xMin < b.xMax - 1e-9 && b.xMin < a.xMax - 1e-9 && a.yMin < b.yMax - 1e-9 && b.yMin < a.yMax - 1e-9;

/**
 * The side columns' frame. The view's half height at the page distance (in the discs' plane) is
 * `halfHeight` around `centerY`; `aspect` is width / height. Every disc and name stays at least
 * `edge` (page-view meters, at least STAGE.side.edge) inside the canvas and clear of the bag and
 * the kept-clear boxes: `reserve` keeps a top-right corner clear (fractions of the canvas), e.g.
 * for the zoom buttons; `clear` lists more boxes ({left, top, right, bottom}, fractions of the
 * canvas), e.g. the putter-pocket button. A clear box that spans the canvas's full height at one
 * side (a details panel over it) takes that strip out of the free canvas.
 * Each side is one column hugging the bag, faster discs higher, rows centered on the bag. A column
 * too tall for the canvas closes up its rows, then takes smaller discs, then names its discs beside
 * them instead of under them, then wraps into more columns (the more extreme discs of a row
 * further out); the camera pulls back only when none of that fits, as little as it can.
 * `verify` (optional) gets each layout that fits as planned, at its pull-back, and may turn it down
 * (the viewer projects it for real); the next preference, or the next pull-back, is tried instead.
 * A caller that knows the view exactly (the camera looks on at an angle, so the canvas covers a
 * skewed patch of the discs' plane) passes `view`, the page view's rectangle in the discs' plane
 * ({xMin, xMax, yMin, yMax}, meters), `center`, where the camera aims in it ({x, y}), and `keep`,
 * more kept-clear boxes in those meters; then `aspect` and `halfHeight` are not needed.
 * Returns {pull, region, spots: Map key → {position, scale, side, column, row}, columns: [{side,
 * x, keys}], scale, labels: 'below' | 'flush' | 'outer', fits} (`fits` false: nothing fit even at `maxPull`).
 */
export function sideFrame({aspect, halfHeight, centerY, view = null, center = null, keep = [], reserve = {width: 0, height: 0}, clear = [], edge = 0, entries, maxPull = STAGE.side.maxPull, verify = null}) {
  const {gap, row: roomy, y: middle, z, scales, maxColumns} = STAGE.side, order = sideOrder(entries);
  const speed = entry => entry.atlas?.y ?? .5, index = new Map(entries.map((entry, i) => [entry.key, i]));
  // The view at a pull-back: the page view's rectangle (and the kept-clear boxes) grown about the
  // view's center, as the camera pulls straight back.
  const page = view ?? {xMin: -halfHeight * aspect, xMax: halfHeight * aspect, yMin: centerY - halfHeight, yMax: centerY + halfHeight};
  const origin = center ?? {x: (page.xMin + page.xMax) / 2, y: (page.yMin + page.yMax) / 2};
  const grow = (box, pull) => ({xMin: origin.x + (box.xMin - origin.x) * pull, xMax: origin.x + (box.xMax - origin.x) * pull, yMin: origin.y + (box.yMin - origin.y) * pull, yMax: origin.y + (box.yMax - origin.y) * pull});
  // `inset` draws the free region in about the view's center (1: none), for a layout the caller turned down.
  const frameAt = (pull, inset = 1) => {
    const v = grow(page, pull), w = v.xMax - v.xMin, h = v.yMax - v.yMin, margin = Math.max(STAGE.side.edge, edge) * pull;
    const drawn = grow(v, inset);
    const region = {xMin: drawn.xMin + margin, xMax: drawn.xMax - margin, yMin: drawn.yMin + margin, yMax: drawn.yMax - margin};
    for (const box of clear) if (box.top <= .02 && box.bottom >= .98) {
      if (box.right >= .98) region.xMax = Math.min(region.xMax, v.xMin + w * box.left - margin);
      if (box.left <= .02) region.xMin = Math.max(region.xMin, v.xMin + w * box.right + margin);
    }
    const toBox = box => ({xMin: v.xMin + w * box.left, xMax: v.xMin + w * box.right, yMin: v.yMax - h * box.bottom, yMax: v.yMax - h * box.top});
    const avoid = [...(reserve.width && reserve.height ? [toBox({left: 1 - reserve.width, top: 0, right: 1, bottom: reserve.height})] : []),
      ...clear.filter(box => !(box.top <= .02 && box.bottom >= .98)).map(toBox), ...keep.map(box => grow(box, pull))];
    return {pull, region, avoid};
  };
  const attempt = (pull, count, scale, labels, inset = 1) => {
    const frame = frameAt(pull, inset), {region, avoid} = frame, radius = DISC.radius * scale;
    const feet = new Map(entries.map(entry => [entry.key, footprint(radius, labelAt(entry, pull), labels)]));
    const widest = list => list.reduce((most, entry) => {
      const f = feet.get(entry.key);
      return {inner: Math.max(most.inner, f.inner), outer: Math.max(most.outer, f.outer), up: Math.max(most.up, f.up), down: Math.max(most.down, f.down)};
    }, {inner: radius, outer: radius, up: radius, down: radius});
    // Rows run by speed, fastest first, `count` discs to a row; within a row the more extreme discs
    // sit further out. A short last row keeps to the columns nearest the bag.
    const sides = [];
    for (const [side, list, sign] of [['left', order.left, -1], ['right', order.right, 1]]) {
      if (!list.length) continue;
      const columns = Math.min(count, list.length), byRow = [...list].sort((a, b) => speed(b) - speed(a) || index.get(a.key) - index.get(b.key));
      const rows = [];
      for (let i = 0; i < byRow.length; i += columns) rows.push(byRow.slice(i, i + columns));
      const cells = rows.map(row => {
        const extreme = [...row].sort((a, b) => list.indexOf(a) - list.indexOf(b));
        // Most extreme outermost: column (row.length − 1) … 0 counted from the bag.
        return extreme.map((entry, i) => ({entry, column: row.length - 1 - i}));
      });
      // Column centers, from the bag outward: each clears the one inside it, names included.
      const reach = Array.from({length: columns}, (_, c) => widest(cells.flatMap(row => row.filter(cell => cell.column === c).map(cell => cell.entry))));
      const xs = [];
      for (let c = 0; c < columns; c++) {
        const from = c === 0 ? (sign < 0 ? -SIDE_BAG.xMin : SIDE_BAG.xMax) : Math.abs(xs[c - 1]) + reach[c - 1].outer;
        xs.push(sign * (from + gap + reach[c].inner));
      }
      sides.push({side, sign, columns, rows: cells, xs, reach});
    }
    // One row pitch for both sides, so the rows line up across the bag: roomy when the column is
    // short, closing up to just clear of the names when it is tall.
    const all = widest(entries), tight = all.up + all.down + gap, ideal = Math.max(tight, labels === 'outer' ? tight + gap : 2 * radius + Math.max(roomy, all.down - radius + gap));
    let pitch = ideal;
    for (const s of sides) {
      // Each side's vertical room: its columns' spans, trimmed by kept-clear boxes over them.
      let high = region.yMax - all.up, low = region.yMin + all.down;
      for (let c = 0; c < s.columns; c++) {
        const x = s.xs[c], span = {xMin: x - (s.sign < 0 ? s.reach[c].outer : s.reach[c].inner), xMax: x + (s.sign < 0 ? s.reach[c].inner : s.reach[c].outer)};
        for (const box of avoid) if (span.xMin < box.xMax && box.xMin < span.xMax) {
          if ((box.yMin + box.yMax) / 2 > middle) high = Math.min(high, box.yMin - all.up);
          else low = Math.max(low, box.yMax + all.down);
        }
      }
      s.high = high; s.low = low;
      if (s.rows.length > 1) pitch = Math.min(pitch, (high - low) / (s.rows.length - 1));
      else if (high < low - 1e-9) return null;
    }
    if (pitch < tight - 1e-9) return null;
    const spots = new Map(), columns = [];
    for (const s of sides) {
      const block = (s.rows.length - 1) * pitch, top = Math.min(s.high, Math.max(s.low + block, middle + block / 2));
      s.rows.forEach((row, r) => row.forEach(({entry, column}) => spots.set(entry.key, {position: [s.xs[column], top - r * pitch, z], scale, side: s.side, column, row: r})));
      for (let c = 0; c < s.columns; c++) columns.push({side: s.side, x: s.xs[c], keys: s.rows.flatMap(row => row.filter(cell => cell.column === c).map(cell => cell.entry.key))});
    }
    // Everything inside the region, clear of the bag and the kept-clear boxes.
    for (const entry of entries) {
      const box = spotBox(spots.get(entry.key), labelAt(entry, pull), labels);
      if (box.xMin < region.xMin - 1e-9 || box.xMax > region.xMax + 1e-9 || box.yMin < region.yMin - 1e-9 || box.yMax > region.yMax + 1e-9) return null;
      if (overlaps(box, SIDE_BAG) || avoid.some(other => overlaps(box, other))) return null;
    }
    return {...frame, spots, columns, scale, labels, fits: true};
  };
  // Preference: one column a side, the largest discs, names centered under them; then flush under
  // them; then beside them; then smaller discs; then more columns.
  const candidates = [];
  for (let count = 1; count <= maxColumns; count++) for (const scale of scales) for (const labels of ['below', 'flush', 'outer']) candidates.push([count, scale, labels]);
  const first = pull => {
    for (const [count, scale, labels] of candidates) {
      // A layout the caller turns down first draws in a little (rows closing up) before the next preference.
      for (const inset of verify ? [1, .97, .94, .91, .88] : [1]) {
        const fit = attempt(pull, count, scale, labels, inset);
        if (!fit) break;
        if (!verify || verify(fit)) return {fit, choice: [count, scale, labels, inset]};
      }
    }
    return null;
  };
  let pull = 1, found = first(pull);
  while (!found && pull < maxPull - 1e-9) { pull = Math.min(maxPull, pull + .1); found = first(pull); }
  if (!found) {
    // Nothing fits: the most compact layout at the furthest pull-back, flagged.
    const [count, scale, labels] = candidates.at(-1), frame = frameAt(maxPull), radius = DISC.radius * scale, spots = new Map(), columns = [];
    for (const [side, list, sign] of [['left', order.left, -1], ['right', order.right, 1]]) {
      const x = sign * (Math.max(-SIDE_BAG.xMin, SIDE_BAG.xMax) + gap + radius), step = 2 * radius + gap;
      const rows = [...list].sort((a, b) => speed(b) - speed(a) || index.get(a.key) - index.get(b.key));
      rows.forEach((entry, row) => spots.set(entry.key, {position: [x, middle + ((rows.length - 1) / 2 - row) * step, z], scale, side, column: 0, row}));
      if (rows.length) columns.push({side, x, keys: rows.map(entry => entry.key)});
    }
    return {...frame, spots, columns, scale, labels, fits: false, count};
  }
  // Back in finer steps from the first pull-back that fits, keeping the layout that fit.
  let {fit} = found;
  for (let finer = pull - .02; pull > 1 && finer > Math.max(1, pull - .1) - 1e-9; finer -= .02) { const next = attempt(finer, ...found.choice); if (!next || (verify && !verify(next))) break; fit = next; }
  return fit;
}
