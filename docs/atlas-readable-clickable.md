# Atlas: readable means clickable

The rule: a disc the Atlas draws at a size you can read its name is a disc a click lands on, and it
does not vanish while the pointer is reaching for it. This is interaction logic only. Nothing is
redrawn, and cursor anchoring, the 9x zoom cap and the existing marker hit-testing are unchanged.

## What was wrong

- **Small discs and minis were not clickable.** The canvas draws tiers 2 and 3 (`mapGaps`) with their
  names, but the click handler only searched `mapClusters`. A click on a named small disc did nothing.
- **Names were not clickable.** `.marker-name` is `pointer-events:none`, and from 2.7x the click was
  resolved by the distance to a marker's art alone, so a click on a curated disc's name did nothing.
  (Measured: 0 of 6 curated names landed a click at 6.5x.)
- **The marker set changed under the pointer.** A regroup swapped the level the moment the camera tween
  ended, wherever the pointer was, and a re-curate between levels could drop a marker or a small disc
  that was on screen and readable. The disc you were reaching for was gone.

## What it does now

`public/atlas-targets.js` (`AtlasTargets`, pure) and `public/atlas-map.js`.

1. **Hit-testing matches what is drawn.** `mapTargets()` lists everything drawn at a readable size: each
   marker's art and its name's box (the measured footprint, the same box layout reserved), each dot's art
   (and its name once `AtlasGroups.GAP.named` strong), and each small disc or mini on the canvas with its
   name's box. `AtlasTargets.pick` resolves a click: a curated disc is above a small disc, art beats a
   name, and of two hits of one kind the nearer centre wins (as overlapping dot boxes always resolved).
   Below 2.7x a click on a marker button keeps resolving by the button, as before. The pointer shows the
   pointer cursor over a canvas disc (`#map.is-over-disc`).
2. **A regroup waits for a pointer that is reaching.** `levelHeld` defers the level swap while a press is
   down (as long as it lasts); while the pointer moved, pressed or wheeled less than `HOLD.settle` (220 ms)
   ago; and, while the pointer rests on a readable disc, until `HOLD.hover` (1.4 s) after the swap fell
   due. Nothing but a press holds it past `HOLD.max` (2.4 s), so a zoom still resolves. The swap happens
   when the pointer has settled (or left the map, or the timer runs out), by a timer or `pointerleave`.
3. **A disc a new set would drop stays under the pointer (a pin).** When a regroup, or a zoom between
   levels re-curating on each frame, drops a readable marker or small disc and the pointer is on it or
   within `PIN.slack` (28 px), it stays in place, tracking the camera, a normal target. It lets go once
   the pointer has been away `PIN.leave` (380 ms) and fades out as a regroup's retiring discs do (a
   press keeps it; `PIN.max` 5 s bounds it). A pinned marker's small disc waits for the pin to go, so a
   disc is drawn once.
4. **Merges.** A disc that joins a stack (`joined`) is pinned the same way, so it is individually
   reachable under the pointer; once the pin lets go the stack holds it (its count includes the disc,
   and the stack's chooser lists it). Filters and size changes drop every pin.

## The LOD hysteresis work

`disc3d/lod.mjs` and `artZooming` (Plan 16, uncommitted when this landed) hold a canvas disc's 3D *render
level* (low, mid, full) while the zoom changes. That keeps the image steady; it does not touch which
discs are in the set, where a click lands or when a regroup happens. It does not cover this, so this
ships on its own. The two do not interact: a pinned small disc keeps its `want` level like any other.

## Tests

- `tests/atlas-targets.mjs` (unit): picking, reach, readable names, the hold rules.
- `tests/atlas-persist-browser.mjs`: on desktop (1x, 3x, 6.5x) and phone (1x, 3x), a click or tap lands
  on the art and on the name of curated discs and small discs; the pointer cursor; a regroup waits for a
  moving pointer and for one resting on a disc, and then happens; cursor anchoring and the cap hold;
  a dropped curated disc and a dropped small disc stay under the pointer, land the click, then fade;
  a merged disc stays reachable, then its stack holds it; small wheel nudges across a level boundary
  never take a readable disc from under the pointer (checked on every frame).
- `npm run test:atlas:persist` runs both.
