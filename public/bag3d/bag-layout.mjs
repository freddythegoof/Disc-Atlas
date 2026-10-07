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
// However many are out, they rest beside the bag scattered like discs tossed on a table: split
// relative to each other (the less overstable half left, the more overstable half right), evenly
// spread over each side, faster discs toward the top, every disc named. Positions are in the bag's
// frame with the user's turn removed, so out discs hold still while the bag turns between them.
// The bag's silhouette (meshes measured from the GLB, putters standing): x ±.228, top .39 with
// putters out. The open flap hangs forward to y −.47, so nothing rests below the bag.
export const BAG_BOX = {xMin: -.235, xMax: .235, yMin: -.50, yMax: .40};
// The bag as the page sees it in the out discs' plane (measured from the GLB at the page view:
// x ±.23, bottom −.27, putters standing to .40). The scatter keeps clear of it, unless the caller
// passes the bag as drawn (the viewer measures its silhouette).
export const SIDE_BAG = {xMin: -.235, xMax: .235, yMin: -.28, yMax: .40};
export const STAGE = {
  // `scales` are the disc sizes a scatter may take, largest first; every out disc takes the same
  // one. A side too crowded for the largest takes the next size down, and only when the smallest
  // cannot fit does the camera pull back (up to `maxPull`). `gap` is the least room between two
  // discs' boxes (names included) and between a side and the bag; `reach` caps how far a side runs
  // out from the bag (page-view meters, growing with the pull-back), so a few discs on a very wide
  // canvas still read as one group; `edge` keeps discs and names inside the canvas. `settle` is how
  // many relaxation rounds even a side out, `rise` how strongly a disc keeps to its speed's height
  // while they do (0: evenness alone, 1: rows by speed), and `tilt` the range of each disc's tip
  // (radians), so they read as tossed rather than shelved.
  scatter: {scales: [.58, .52, .46, .40], gap: .024, z: .05, maxPull: 5, edge: .012, reach: .62, settle: 14, rise: .2, tilt: [.10, .22]},
};
// Each fallback (the scatter around the bag, then staggered rows) is taken only where it lets the
// camera stay at least this much closer than the layout before it.
const AROUND_SAVES = .75;
// The pull-back is searched in coarse steps, then eased back in fine ones (.02) to the least that fits.
const PULL_STEP = .2;
// A scatter needs some room to spare: its boxes may fill at most this share of a side's reach.
const SPARE = .8;
// Each size gets these seedings before the next size down is tried.
const SALTS = ['', ':2', ':3'];
// Discs closer than this (meters) across or up count as lined up.
const LEVEL = .006;
export const stageMode = count => count < 1 ? null : 'scatter';

// Equal stability (or speed) ranks by key, never by the order discs came out, so a disc set always
// lands the same way however it was pulled out.
const byKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
const stabilityOf = entry => entry.atlas?.x ?? .5, speedOf = entry => entry.atlas?.y ?? .5;

/**
 * Splits out discs between the bag's sides relative to each other, never by a fixed stability
 * threshold: ranked by stability, the less overstable half rests on the left and the more
 * overstable half on the right, so both sides stay even whatever the bag leans to. With an odd
 * count the median disc joins the neighbor it is nearer in stability (the right on a tie, and a
 * lone disc rests on the right).
 * entries: [{key, atlas}] (atlas: {x: stability 0–1, y: speed 0–1} or null, which counts as
 * neutral). Returns Map key → 'left' | 'right'.
 */
export function assignSides(entries) {
  const ranked = [...entries].sort((a, b) => stabilityOf(a) - stabilityOf(b) || byKey(a, b));
  const half = Math.floor(ranked.length / 2), sides = new Map();
  ranked.forEach((entry, rank) => sides.set(entry.key, rank < half ? 'left' : 'right'));
  if (ranked.length % 2 && half > 0) {
    const [below, median, above] = ranked.slice(half - 1, half + 2).map(stabilityOf);
    if (median - below < above - median - 1e-9) sides.set(ranked[half].key, 'left');
  }
  return sides;
}

// Seeded randomness: a disc's own numbers come from its key, so it lands (and tips) the same way
// every time. FNV-1a over the text, then one mulberry32 step.
const hash = text => { let h = 2166136261; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const seeded = (key, salt) => {
  let t = (hash(`${salt}:${key}`) + 0x6D2B79F5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
/** A disc's tip as it rests out: {angle (radians, within STAGE.scatter.tilt), toward (radians, the direction it tips in the view's plane)}. */
export const tiltOf = key => {
  const [low, high] = STAGE.scatter.tilt;
  return {angle: low + (high - low) * seeded(key, 'tilt'), toward: 2 * Math.PI * seeded(key, 'toward')};
};

// A name rests centered under its disc ('below'), or, where the sides are narrow, under it with
// its inner edge flush with the disc's (the side toward the bag, 'flush'), so it reaches only
// outward; or, in a crowd, beside the disc on the side away from the bag ('outer'), so each disc
// and its name take less height. One layout uses one of the three for every name. Entries may carry `label: {width,
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
 * Both sides' scatter: each side's discs (`lists.left`, `lists.right`) spread evenly over the room
 * (`rooms`, meters), each disc and its name one box (`feet`, key → footprint), clear of every other
 * by `gap` and of the `avoid` boxes. A disc keeps to its own half of the canvas (clear of the bag's
 * middle by half a gap) and within its side's reach; only a name may cross the middle, so a narrow
 * canvas can still stagger names across it. Unless `around`, every disc rests beside the bag (clear
 * of its silhouette across), never above or below it.
 * Each disc starts at a height by its speed rank on its side (fastest at the top) and an across set
 * by its key; a few rounds of relaxation (each disc moves to the middle of the room nearer to it than
 * to any other, kept to its range) even them out while each keeps a little to its speed's height;
 * then they sway apart so they read as tossed, and a last pass nudges apart any two that still touch.
 * A scatter that still leaves three discs in a line, or a side stacked in one column, counts as not
 * fitting: it reads as a shelf. With `brick`, a crowd too dense to scatter takes staggered rows
 * instead. `salt` varies the seeding, for another try at the same size. Returns key → disc center
 * ([x, y], meters), or null when they cannot all fit clear.
 */
function scatterSides(lists, rooms, radius, feet, gap, avoid, around, brick, bag, salt = '') {
  const middle = (bag.xMin + bag.xMax) / 2, n = lists.left.length + lists.right.length;
  const xMin = Math.min(rooms.left.xMin, rooms.right.xMin), xMax = Math.max(rooms.left.xMax, rooms.right.xMax), {yMin, yMax} = rooms.left;
  // A disc's box in the room: across, its disc in its own half (or beside the bag) and its box in its reach.
  const inner = (side, lean) => side === 'left' ? (around ? middle - gap / 2 : bag.xMin - gap) - radius - lean : (around ? middle + gap / 2 : bag.xMax + gap) + radius + lean;
  const bySpeed = list => [...list].sort((a, b) => speedOf(b) - speedOf(a) || stabilityOf(a) - stabilityOf(b) || byKey(a, b));
  if (brick) return brickRows(lists, rooms, feet, gap, avoid, inner, bySpeed);
  const {settle, rise} = STAGE.scatter, entries = [...lists.left, ...lists.right];
  const box = key => { const f = feet.get(key); return {w: f.inner + f.outer, h: f.up + f.down, lean: (f.outer - f.inner) / 2, rise: (f.up - f.down) / 2}; };
  // Units: the average box plus its gap, so the relaxation's distances suit the boxes' shape.
  const sizes = entries.map(entry => box(entry.key)), cw = sizes.reduce((sum, s) => sum + s.w, 0) / n + gap, ch = sizes.reduce((sum, s) => sum + s.h, 0) / n + gap;
  const U = (xMax - xMin) / cw, V = (yMax - yMin) / ch, gu = gap / cw, gv = gap / ch;
  if (sizes.reduce((sum, s) => sum + (s.w + gap) * (s.h + gap), 0) > (xMax - xMin + gap) * (yMax - yMin + gap)) return null;
  // Each side's discs must fit its own reach, with room to spare for a scatter (else it is rows).
  for (const side of ['left', 'right']) {
    const reach = side === 'left' ? [rooms.left.xMin, inner('left', 0) + radius] : [inner('right', 0) - radius, rooms.right.xMax];
    const need = lists[side].reduce((sum, entry) => { const s = box(entry.key); return sum + (s.w + gap) * (s.h + gap); }, 0);
    if (lists[side].length && need > SPARE * (Math.max(0, reach[1] - reach[0]) + gap) * (yMax - yMin + gap)) return null;
  }
  const blocked = avoid.map(b => ({u0: (b.xMin - xMin) / cw, u1: (b.xMax - xMin) / cw, v0: (b.yMin - yMin) / ch, v1: (b.yMax - yMin) / ch})).filter(b => b.u1 > 0 && b.u0 < U && b.v1 > 0 && b.v0 < V);
  const points = [];
  for (const side of ['left', 'right']) {
    const list = bySpeed(lists[side]);
    for (const [rank, entry] of list.entries()) {
      const s = box(entry.key), hu = s.w / 2 / cw, hv = s.h / 2 / ch;
      const across = side === 'left' ? [Math.max(xMin, rooms.left.xMin) + s.w / 2, Math.min(xMax - s.w / 2, inner(side, s.lean))] : [Math.max(xMin + s.w / 2, inner(side, s.lean)), Math.min(xMax, rooms.right.xMax) - s.w / 2];
      const lo = (across[0] - xMin) / cw, hi = (across[1] - xMin) / cw, bottom = hv, top = V - hv;
      if (lo > hi + 1e-9 || bottom > top + 1e-9) return null;
      const height = bottom + (top - bottom) * (1 - (rank + .5) / list.length);
      points.push({entry, side, s, hu, hv, lo, hi, bottom, top, height, u: lo + (hi - lo) * (.12 + .76 * seeded(entry.key, 'across' + salt)), v: Math.min(top, Math.max(bottom, height + (seeded(entry.key, 'up' + salt) - .5) * .5))});
    }
  }
  const clampU = (p, u) => Math.min(p.hi, Math.max(p.lo, u)), clampV = (p, v) => Math.min(p.top, Math.max(p.bottom, v));
  // A disc's box over a blocked one (the bag, a kept-clear box), and the ways out of it.
  const blockedAt = (p, u, v) => blocked.find(b => u - p.hu < b.u1 - 1e-9 && u + p.hu > b.u0 + 1e-9 && v - p.hv < b.v1 - 1e-9 && v + p.hv > b.v0 + 1e-9);
  // The room, sampled about six times a unit (at most ~1200 samples), less the blocked boxes.
  const step = Math.max(1 / 6, Math.sqrt(Math.max(U, .01) * Math.max(V, .01) / 1200)), samples = [], mean = {hu: (cw - gap) / 2 / cw, hv: (ch - gap) / 2 / ch};
  const nu = Math.max(1, Math.ceil(U / step)), nv = Math.max(1, Math.ceil(V / step));
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const u = U * (i + .5) / nu, v = V * (j + .5) / nv; if (!blockedAt(mean, u, v)) samples.push(u, v); }
  for (let round = 0; round < settle && samples.length; round++) {
    const sum = points.map(() => ({u: 0, v: 0, count: 0}));
    for (let s = 0; s < samples.length; s += 2) {
      let best = 0, nearest = Infinity;
      for (let p = 0; p < n; p++) { const du = Math.abs(samples[s] - points[p].u), dv = Math.abs(samples[s + 1] - points[p].v), d = du > dv ? du : dv; if (d < nearest) { nearest = d; best = p; } }
      sum[best].u += samples[s]; sum[best].v += samples[s + 1]; sum[best].count++;
    }
    points.forEach((point, p) => {
      if (!sum[p].count) return;
      point.u = clampU(point, sum[p].u / sum[p].count);
      point.v = clampV(point, (1 - rise) * sum[p].v / sum[p].count + rise * point.height);
    });
  }
  // Relaxed alone, a narrow side settles into a straight column, which reads as a shelf. Top to
  // bottom, a side's discs sway alternately toward and away from the bag (by a seeded amount, as
  // far as the room allows, less where it is crowded); rows read as a shelf too, so across a side
  // they step alternately up and down, and each drifts a little, so they read as tossed. A scatter
  // too crowded to clear after its sway settles for the relaxed spread alone.
  const relaxed = points.map(({u, v}) => [u, v]);
  const crowd = points.reduce((sum, p) => sum + (2 * p.hu + gu) * (2 * p.hv + gv), 0) / (U * V), give = Math.min(1, Math.max(.5, 1.2 - crowd));
  const toss = () => {
    for (const side of ['left', 'right']) points.filter(p => p.side === side).sort((a, b) => b.v - a.v).forEach((point, order) => {
      const sway = Math.min((point.hi - point.lo) / 2, .55) * give;
      point.u = clampU(point, point.u + (order % 2 ? 1 : -1) * sway * (.6 + .4 * seeded(point.entry.key, 'sway' + salt)));
    });
    for (const side of ['left', 'right']) points.filter(p => p.side === side).sort((a, b) => a.u - b.u).forEach((point, order) => {
      point.v = clampV(point, point.v + (order % 2 ? 1 : -1) * .14 * give + (seeded(point.entry.key, 'drift' + salt) - .5) * .3);
    });
  };
  // How far two boxes must sit apart, across and up, to clear each other by the gap.
  const apart = (p, q) => [p.hu + q.hu + gu, p.hv + q.hv + gv];
  // Nudge apart: two boxes touching move apart along the shallower overlap, half each; a box over a
  // blocked one steps out the nearest way. Every disc keeps to its own range.
  const push = () => {
    let moved = false;
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      const p = points[a], q = points[b], [needU, needV] = apart(p, q), du = q.u - p.u, dv = q.v - p.v, across = needU - Math.abs(du), up = needV - Math.abs(dv);
      if (across <= 1e-6 || up <= 1e-6) continue;
      moved = true;
      // The shallower way first; where a range or the room's edge stops that, the other way.
      const sa = (du < 0 ? -1 : 1) * (across / 2 + 1e-4), pu = clampU(p, p.u - sa), qu = clampU(q, q.u + sa);
      const sv = (dv < 0 ? -1 : 1) * (up / 2 + 1e-4), pv = clampV(p, p.v - sv), qv = clampV(q, q.v + sv);
      const clearsAcross = Math.abs(qu - pu) >= needU - 1e-6, clearsUp = Math.abs(qv - pv) >= needV - 1e-6;
      if (clearsAcross && (!clearsUp || across * cw < up * ch)) { p.u = pu; q.u = qu; }
      else if (clearsUp) { p.v = pv; q.v = qv; }
      else if (across * cw < up * ch) { p.u = pu; q.u = qu; }
      else { p.v = pv; q.v = qv; }
    }
    for (const p of points) {
      const b = blockedAt(p, p.u, p.v);
      if (!b) continue;
      moved = true;
      const exits = [[b.u0 - p.hu - 1e-4, p.v], [b.u1 + p.hu + 1e-4, p.v], [p.u, b.v0 - p.hv - 1e-4], [p.u, b.v1 + p.hv + 1e-4]].filter(([u, v]) => u >= p.lo - 1e-9 && u <= p.hi + 1e-9 && v >= p.bottom - 1e-9 && v <= p.top + 1e-9);
      if (!exits.length) return null;
      [p.u, p.v] = exits.reduce((best, e) => Math.hypot(e[0] - p.u, e[1] - p.v) < Math.hypot(best[0] - p.u, best[1] - p.v) ? e : best);
    }
    return moved;
  };
  const settled = () => { for (let pass = 0; pass < 400; pass++) { const moved = push(); if (moved === null) return false; if (!moved) return true; } return false; };
  toss();
  if (!settled()) {
    points.forEach((point, p) => { [point.u, point.v] = relaxed[p]; });
    if (!settled()) return null;
  }
  // Held against the room's edges, a crowd can still end up three level in a row or three plumb in
  // a column: the middle one steps a little off the line, where it stays clear.
  const clearAt = (p, u, v) => u >= p.lo - 1e-9 && u <= p.hi + 1e-9 && v >= p.bottom - 1e-9 && v <= p.top + 1e-9 && !blockedAt(p, u, v)
    && points.every(q => { if (q === p) return true; const [needU, needV] = apart(p, q); return Math.abs(q.u - u) >= needU - 1e-6 || Math.abs(q.v - v) >= needV - 1e-6; });
  const level = {u: LEVEL / cw, v: LEVEL / ch};
  for (let round = 0; round < 3; round++) for (const axis of ['u', 'v']) for (const side of axis === 'v' ? ['both'] : ['left', 'right']) {
    const line = points.filter(p => side === 'both' || p.side === side).sort((a, b) => a[axis] - b[axis]);
    for (let i = 2; i < line.length; i++) {
      if (line[i][axis] - line[i - 2][axis] > level[axis]) continue;
      const p = line[i - 1];
      for (const step of [.1, -.1, .2, -.2, .3, -.3]) {
        const u = axis === 'u' ? p.u + step : p.u, v = axis === 'v' ? p.v + step : p.v;
        if (clearAt(p, u, v)) { p.u = u; p.v = v; break; }
      }
    }
  }
  // Settling can leave a slower disc above a clearly faster one on its side: where both still fit
  // clear in each other's places, they swap, so faster discs read higher.
  for (let round = 0; round < 3; round++) for (const side of ['left', 'right']) {
    const list = points.filter(p => p.side === side);
    for (const p of list) for (const q of list) {
      if (speedOf(p.entry) - speedOf(q.entry) <= .05 || p.v >= q.v) continue;
      // Their places outright; else their heights alone, each keeping (or nudging) its own across.
      const [pu, pv, qu, qv] = [p.u, p.v, q.u, q.v];
      const tries = [[qu, qv, pu, pv], [pu, qv, qu, pv], ...[.15, -.15, .3, -.3].map(d => [pu + d, qv, qu - d, pv])];
      const swapped = tries.some(([u1, v1, u2, v2]) => {
        p.u = clampU(p, u1); p.v = clampV(p, v1); q.u = clampU(q, u2); q.v = clampV(q, v2);
        return p.v > q.v && clearAt(p, p.u, p.v) && clearAt(q, q.u, q.v);
      });
      if (!swapped) { p.u = pu; p.v = pv; q.u = qu; q.v = qv; }
    }
  }
  // Three plumb in a column, or a side in one column, within a side; three level in a row anywhere,
  // as a row across the bag reads as a shelf too, as does every disc in one band (a narrow strip
  // above the bag).
  const runs = line => line.sort((a, b) => a - b).some((value, i) => i >= 2 && value - line[i - 2] <= level.v);
  const heights = points.map(p => p.v);
  const lined = runs([...heights]) || (n >= 3 && Math.max(...heights) - Math.min(...heights) < 1.5) || ['left', 'right'].some(side => {
    const line = points.filter(p => p.side === side).map(p => p.u).sort((a, b) => a - b);
    return line.some((value, i) => i >= 2 && value - line[i - 2] <= level.u) || (line.length >= 3 && (line.at(-1) - line[0]) * cw < radius);
  });
  if (lined) return null;
  // Back to meters: a box's middle to its disc's center (a flush name reaches outward only).
  return new Map(points.map(({entry, side, s, u, v}) => [entry.key, [xMin + u * cw + (side === 'left' ? s.lean : -s.lean), yMin + v * ch - s.rise]]));
}

/**
 * A crowd too dense to scatter: rows, each disc's box its own width (`feet`). Rows sit a box apart
 * (closer than scattered discs: each name already has room around it, so a sliver of the gap is
 * enough between rows) and run the room's full height. The left side packs each row from the left
 * edge inward and the right side from the right edge inward, around the bag and the kept-clear
 * boxes, every box clear of the next by the gap; a disc keeps to its own half (`inner`). Each side's
 * discs spread evenly down the rows, fastest at the top, a disc that finds no room in its row taking
 * the nearest row that has some; odd rows start a little in, so the rows stagger. Returns key → disc
 * center, or null when the rows cannot hold them.
 */
function brickRows(lists, rooms, feet, gap, avoid, inner, bySpeed) {
  const xMin = Math.min(rooms.left.xMin, rooms.right.xMin), xMax = Math.max(rooms.left.xMax, rooms.right.xMax), {yMin, yMax} = rooms.left;
  const all = [...lists.left, ...lists.right], h = Math.max(...all.map(entry => { const f = feet.get(entry.key); return f.up + f.down; }));
  const pitch = h + gap / 4, R = Math.floor((yMax - yMin - h) / pitch + 1e-9) + 1;
  if (R < 1) return null;
  const rows = Array.from({length: R}, (_, r) => {
    const y = yMax - h / 2 - (R > 1 ? r * (yMax - yMin - h) / (R - 1) : (yMax - yMin - h) / 2);
    // The row's blocked stretches across (the bag, kept-clear boxes over its band).
    const cuts = avoid.filter(b => b.yMin < y + h / 2 - 1e-9 && b.yMax > y - h / 2 + 1e-9).map(b => [b.xMin, b.xMax]).sort((a, b) => a[0] - b[0]);
    const stagger = r % 2 ? gap * 2 : 0;
    return {y, cuts, from: {left: xMin + stagger, right: xMax - stagger}, left: 0, right: 0, count: {left: 0, right: 0}};
  });
  // The next spot in a row for a box `w` wide from one side: past any cut it would cross. Returns the
  // box's [from, to], or null when it meets the other side's boxes or its disc leaves its half.
  const fit = (row, side, w, f) => {
    let from = side === 'left' ? row.left : row.right - w;
    for (let moved = true; moved;) {
      moved = false;
      for (const [a, b] of row.cuts) if (from < b - 1e-9 && from + w > a + 1e-9) { from = side === 'left' ? b : a - w; moved = true; }
    }
    if (from < xMin - 1e-9 || from + w > xMax + 1e-9 || (side === 'left' ? from + w > row.right + 1e-9 : from < row.left - 1e-9)) return null;
    const disc = side === 'left' ? from + f.outer : from + f.inner;
    return (side === 'left' ? disc <= inner('left', 0) + 1e-9 : disc >= inner('right', 0) - 1e-9) ? [from, from + w] : null;
  };
  // Packs every disc, each side fastest first, into the rows `rowsFor(side, k)` lists (best first).
  const pack = rowsFor => {
    for (const row of rows) { row.left = row.from.left; row.right = row.from.right; row.count = {left: 0, right: 0}; }
    const spots = new Map();
    for (const side of ['left', 'right']) for (const [k, entry] of bySpeed(lists[side]).entries()) {
      const f = feet.get(entry.key), w = f.inner + f.outer, row = rowsFor(side, k).map(i => rows[i]).find(row => fit(row, side, w, f));
      if (!row) return null;
      const [from, to] = fit(row, side, w, f);
      if (side === 'left') row.left = to + gap; else row.right = from - gap;
      row.count[side]++;
      spots.set(entry.key, [side === 'left' ? from + f.outer : from + f.inner, row.y - (f.up - f.down) / 2]);
    }
    return spots;
  };
  // First each disc in the row its speed rank spreads it to (else the nearest row with room); then,
  // with as many a row as that found room for, fastest discs fill the top rows in order, so speed
  // reads down every side (kept unless the names' widths differ too much for it).
  const near = want => Array.from({length: R}, (_, i) => i).sort((a, b) => Math.abs(a - want) - Math.abs(b - want) || b - a);
  const spread = pack((side, k) => near(Math.min(R - 1, Math.floor((k + .5) * R / lists[side].length))));
  if (!spread) return null;
  const counts = {left: rows.map(row => row.count.left), right: rows.map(row => row.count.right)};
  const inOrder = pack((side, k) => { let r = 0, seen = counts[side][0]; while (k >= seen && r < R - 1) seen += counts[side][++r]; return [r]; });
  const spots = inOrder ?? pack((side, k) => near(Math.min(R - 1, Math.floor((k + .5) * R / lists[side].length))));
  // Rows are for a crowd: a few discs all in one band (a strip above the bag) read as a shelf.
  const heights = [...spots.values()].map(([, y]) => y);
  return spots.size >= 3 && Math.max(...heights) - Math.min(...heights) < 1.5 * h ? null : spots;
}

/**
 * The scatter's frame. The view's half height at the page distance (in the discs' plane) is
 * `halfHeight` around `centerY`; `aspect` is width / height. Every disc and name stays at least
 * `edge` (page-view meters, at least STAGE.scatter.edge) inside the canvas and clear of the bag and
 * the kept-clear boxes: `reserve` keeps a top-right corner clear (fractions of the canvas); `clear`
 * lists more boxes ({left, top, right, bottom}, fractions of the canvas). A clear box that spans
 * the canvas's full height at one side (a details panel over it) takes that strip out of the free canvas.
 * `bag` is the bag's box in the discs' plane (SIDE_BAG unless the caller measured it as drawn); a
 * side's half of the canvas runs to its middle.
 * Each side's discs scatter over the room between the bag and the canvas's edge (at most `reach`
 * out), evenly, all one size, faster discs toward the top. A side too crowded takes smaller discs,
 * then names flush under them; the camera pulls back only when none of that fits, as little as it can.
 * `verify` (optional) gets each layout that fits as planned, at its pull-back, and may turn it down
 * (the viewer projects it for real); the scatter draws in a little, or the next preference, or the
 * next pull-back, is tried instead.
 * A caller that knows the view exactly (the camera looks on at an angle, so the canvas covers a
 * skewed patch of the discs' plane) passes `view`, the page view's rectangle in the discs' plane
 * ({xMin, xMax, yMin, yMax}, meters), `center`, where the camera aims in it ({x, y}), and `keep`,
 * more kept-clear boxes in those meters; then `aspect` and `halfHeight` are not needed.
 * Returns {pull, region, avoid, areas: {left, right} (each side's room), spots: Map key →
 * {position, scale, side, tilt}, scale, labels: 'below' | 'flush' | 'outer', around (above and below the bag
 * too), brick (staggered rows), fits} (`fits` false: nothing
 * fit even at `maxPull`, and the discs are spread as best they can be).
 */
export function scatterFrame({aspect, halfHeight, centerY, view = null, center = null, keep = [], reserve = {width: 0, height: 0}, clear = [], edge = 0, bag = SIDE_BAG, entries, maxPull = STAGE.scatter.maxPull, verify = null}) {
  const middle = (bag.xMin + bag.xMax) / 2;
  const {gap, z, scales, reach} = STAGE.scatter, sides = assignSides(entries);
  const lists = {left: entries.filter(e => sides.get(e.key) === 'left').sort(byKey), right: entries.filter(e => sides.get(e.key) === 'right').sort(byKey)};
  // The view at a pull-back: the page view's rectangle (and the kept-clear boxes) grown about the
  // view's center, as the camera pulls straight back.
  const page = view ?? {xMin: -halfHeight * aspect, xMax: halfHeight * aspect, yMin: centerY - halfHeight, yMax: centerY + halfHeight};
  const origin = center ?? {x: (page.xMin + page.xMax) / 2, y: (page.yMin + page.yMax) / 2};
  const grow = (box, pull) => ({xMin: origin.x + (box.xMin - origin.x) * pull, xMax: origin.x + (box.xMax - origin.x) * pull, yMin: origin.y + (box.yMin - origin.y) * pull, yMax: origin.y + (box.yMax - origin.y) * pull});
  // `inset` draws the free region in about the view's center (1: none), for a layout the caller turned down.
  const frameAt = (pull, inset = 1) => {
    const v = grow(page, pull), w = v.xMax - v.xMin, h = v.yMax - v.yMin, margin = Math.max(STAGE.scatter.edge, edge) * pull;
    const drawn = grow(v, inset);
    const region = {xMin: drawn.xMin + margin, xMax: drawn.xMax - margin, yMin: drawn.yMin + margin, yMax: drawn.yMax - margin};
    for (const box of clear) if (box.top <= .02 && box.bottom >= .98) {
      if (box.right >= .98) region.xMax = Math.min(region.xMax, v.xMin + w * box.left - margin);
      if (box.left <= .02) region.xMin = Math.max(region.xMin, v.xMin + w * box.right + margin);
    }
    const toBox = box => ({xMin: v.xMin + w * box.left, xMax: v.xMin + w * box.right, yMin: v.yMax - h * box.bottom, yMax: v.yMax - h * box.top});
    const avoid = [...(reserve.width && reserve.height ? [toBox({left: 1 - reserve.width, top: 0, right: 1, bottom: reserve.height})] : []),
      ...clear.filter(box => !(box.top <= .02 && box.bottom >= .98)).map(toBox), ...keep.map(box => grow(box, pull))];
    const areas = {
      left: {xMin: Math.max(region.xMin, bag.xMin - gap - reach * pull), xMax: Math.min(region.xMax, middle - gap / 2), yMin: region.yMin, yMax: region.yMax},
      right: {xMin: Math.max(region.xMin, middle + gap / 2), xMax: Math.min(region.xMax, bag.xMax + gap + reach * pull), yMin: region.yMin, yMax: region.yMax},
    };
    return {pull, region, avoid, areas};
  };
  // The bag, with a gap around it, is blocked in both sides' rooms.
  const bagClear = {xMin: bag.xMin - gap, xMax: bag.xMax + gap, yMin: bag.yMin - gap, yMax: bag.yMax + gap};
  const attempt = (pull, scale, labels, inset = 1, around = false, brick = false) => {
    const frame = frameAt(pull, inset), radius = DISC.radius * scale, spots = new Map();
    if (entries.length) {
      const feet = new Map(entries.map(entry => [entry.key, footprint(radius, labelAt(entry, pull), labels)]));
      // A scatter that cannot clear (or lines up) gets two more seedings before the next size.
      let placed = null;
      for (const salt of brick ? [''] : SALTS) if ((placed = scatterSides(lists, frame.areas, radius, feet, gap, [...frame.avoid, bagClear], around, brick, bag, salt))) break;
      if (!placed) return null;
      for (const [key, [x, y]] of placed) spots.set(key, {position: [x, y, z], scale, side: sides.get(key), tilt: tiltOf(key)});
    }
    // Everything inside the region, clear of the bag, the kept-clear boxes and each other.
    const boxes = entries.map(entry => spotBox(spots.get(entry.key), labelAt(entry, pull), labels));
    for (const [i, box] of boxes.entries()) {
      if (box.xMin < frame.region.xMin - 1e-9 || box.xMax > frame.region.xMax + 1e-9 || box.yMin < frame.region.yMin - 1e-9 || box.yMax > frame.region.yMax + 1e-9) return null;
      if (overlaps(box, bag) || frame.avoid.some(other => overlaps(box, other)) || boxes.some((other, j) => j > i && overlaps(box, other))) return null;
    }
    return {...frame, spots, scale, labels, around, brick, fits: true};
  };
  // Preference: the largest discs, names centered under them; then flush under them; then smaller
  // discs. Staggered rows may also put names beside the discs, once no size fits with names under them.
  const under = scales.flatMap(scale => ['below', 'flush'].map(labels => [scale, labels])), beside = [...under, ...scales.map(scale => [scale, 'outer'])];
  const first = (pull, around, brick) => {
    for (const [scale, labels] of brick ? beside : under) {
      // A layout the caller turns down first draws in a little before the next preference.
      for (const inset of verify ? [1, .97, .94, .91, .88] : [1]) {
        const fit = attempt(pull, scale, labels, inset, around, brick);
        if (!fit) break;
        if (!verify || verify(fit)) return {fit, pull, choice: [scale, labels, inset, around, brick]};
      }
    }
    return null;
  };
  // The least pull-back that fits: discs scattered beside the bag; or, where that would shrink the
  // bag by a quarter more, scattered all around it (above and below too, each in its own half); or,
  // where even that would shrink it by a quarter more (a crowd on a phone), staggered rows around it.
  // The three are searched together, the pull-back stepping out, each only while it could still
  // be the one taken.
  const tiers = [[false, false], [true, false], [true, true]], found = [null, null, null];
  const taken = () => found.reduce((best, fit) => fit && (!best || fit.pull <= best.pull * AROUND_SAVES + 1e-9) ? fit : best, null);
  const worth = (t, pull) => !found[t]
    && found.slice(0, t).every(fit => !fit || pull <= fit.pull * AROUND_SAVES + 1e-9)
    && found.slice(t + 1).every(fit => !fit || pull < fit.pull / AROUND_SAVES - 1e-9);
  for (let pull = 1; ; pull = Math.min(maxPull, pull + PULL_STEP)) {
    for (let t = 0; t < tiers.length; t++) if (worth(t, pull)) found[t] = first(pull, ...tiers[t]);
    const next = Math.min(maxPull, pull + PULL_STEP);
    if (pull >= maxPull - 1e-9 || (taken() && !tiers.some((_, t) => worth(t, next)))) break;
  }
  const chosen = taken();
  if (!chosen) {
    // Nothing fits: the smallest discs at the furthest pull-back, each side spread evenly down the
    // room beside the bag, flagged (the page still names every disc, placed as clear as it can).
    const scale = scales.at(-1), frame = frameAt(maxPull), radius = DISC.radius * scale, spots = new Map();
    for (const side of ['left', 'right']) {
      const area = frame.areas[side], ranked = [...lists[side]].sort((a, b) => speedOf(b) - speedOf(a) || byKey(a, b));
      ranked.forEach((entry, rank) => {
        const x = side === 'left' ? bag.xMin - gap - radius : bag.xMax + gap + radius, y = area.yMax - radius - (area.yMax - area.yMin - 2 * radius) * (rank + .5) / ranked.length;
        spots.set(entry.key, {position: [x, y, z], scale, side, tilt: tiltOf(entry.key)});
      });
    }
    return {...frame, spots, scale, labels: 'below', fits: false};
  }
  // Back in finer steps from the first pull-back that fits, keeping the layout that fit.
  let {fit, pull} = chosen;
  for (let finer = pull - .02; pull > 1 && finer > Math.max(1, pull - PULL_STEP) - 1e-9; finer -= .02) { const next = attempt(finer, ...chosen.choice); if (!next || (verify && !verify(next))) break; fit = next; }
  return fit;
}
