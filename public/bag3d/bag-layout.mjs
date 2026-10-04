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
// Top pocket, behind the front pocket. Stacks around its center line.
export const TOP = {anchor: 'center', center: .017, span: .060, y: .249, mouth: .252, scale: .92, rise: .008, spread: .012, maxX: .030,
  tilt: -.12, raise: .03, forward: .08};
export const PUTTER = {...TOP, maxSlots: 8};
export const GOTO = {...FRONT, maxSlots: 6};
// The GLB authors its go-to accent rim and dashed outline around a disc seated in the top
// pocket; the viewer moves them from this pose to the go-to's front-pocket pose.
export const GLB_ACCENT_POSE = {position: [0, TOP.y, TOP.center], rotation: [TOP.tilt, -Math.PI / 2, 0], scale: [1, TOP.scale, TOP.scale]};

const FACE_FORWARD = -Math.PI / 2, MAX_GAP = .012;
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
      lift: [clamp(x, -.045, .045), .005, .235], slotWidth: step});
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
        // Only the part above the pocket's mouth is visible (and targetable).
        mouth: spec.mouth});
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
