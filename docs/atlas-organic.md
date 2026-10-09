# Organic Atlas: how the main map chooses and places its discs

Since October 7, 2026, the main Flight Atlas draws discs the way out discs rest beside the bag on
My Bag. They lie scattered, with room around every one. Since October 8 they face front: the
discs are round and untipped, and full-size art is 76 px (My Map keeps 68 px). This changes the
rendering only. Every disc keeps its computed position: `public/data.json`, the overrides, the
consensus pipeline, `AtlasLayout.positions` and the adaptive spread (`AtlasLayout.adapt`) are
untouched. My Map keeps its plotted overview (`AtlasGroups.promote`).

The code is `AtlasGroups.curate` and its helpers in `public/atlas-groups.js`. The main thread runs it
from `buildClusters` in `public/atlas-map.js`, and the grouping worker runs it for each level it
prepares.

## Which discs show

The visible set comes from a fixed procedure, not a random sample. For the discs that pass the
current filters, search and lens:

1. **Selection order.** This is the Directory's Featured order. On the bag lenses your bag comes
   first. Then `public/featured.js` rank, then name, brand and ID. Discs within about one marker of
   each other share a group, as before. A group shows its first disc in this order.
2. **Coverage, then depth.** The map is cut into 300 px regions. The first pass takes each region's
   first disc, so every part of the spectrum that has discs shows its best-known one. Understable
   and overstable edges are never left empty because popular neutral molds used up the slots. The
   second pass takes the remaining discs in selection order.
3. **Room.** A disc must rest within its reach of its true point, with a 12 px gap to every placed
   disc and name. In an overview, disc centers must also be at least 138 px apart (112 px on maps
   under 700 px wide). At 1x it must also stay inside the map and clear of the controls: the search
   and filter chips, the speed caption, the stability legend, the zoom controls and the Coach
   button. A disc with no room is hidden at this zoom.
4. **The cap.** Both passes stop at 32 discs per desktop-sized view (1320 × 640 px of map). The cap
   scales with view area and zoom², so the room per disc on screen stays the same at every zoom.
   The floor is 8 discs, for phones.
5. **Selection always shows.** A selected disc that the passes would hide is placed first. Selecting
   a disc that is already showing moves nothing.
6. **Complete views hide nothing.** A view is complete when the matching discs fit under the cap. That
   covers a narrow filter, a search, or deep zoom (about 6× and up on desktop). Every match shows
   there. The 130 px spacing is dropped, so more discs rest at full size. A disc with no room for
   full size becomes a small dot whose name shows on hover and focus. A disc with no room even for
   a dot joins the stack of the nearest shown disc, and complete views show stack counts. The
   overview never shows dots or counts.

On the unfiltered 1x map at 1440 × 900, this shows 24 discs, under the cap of 29: the 138 px
spacing is what limits it. 22 are featured molds. The other two (Pestilence and Berg X) are the
best-known disc in an otherwise empty region. A 390 × 844 phone shows 6, limited by the room
between the controls (the cap there is 8).

## Where each disc rests

- **Reach.** A disc rests within 0.6 marker radii of its true point: about 23 px for the 76 px art.
  Its first choice is a seeded "toss" at 45–100% of that reach in a seeded direction. If that spot
  is taken, it uses the free spot nearest to it, from 38 candidates. Dots use the same reach.
- **Front facing.** Every disc is drawn round and face on, with no per-disc tilt. Full-size art is
  76 px and its name starts 90 px below the marker's top (`#mapMarkers.atlas-organic` in
  `public/cosmic.css`). That is 52 px below the center, scaled from the 68 px art's 46 px, so the
  name stays clear of its art when the art grows past 4× and is selected (1.24 × 1.09). Label
  footprints are measured separately for the main Atlas and My Map, and a click lands within the
  art's radius (38 px) plus 8 px.
- **Determinism.** Every choice is seeded by disc ID, so the same data, view, zoom and selection
  always land the same way, to the pixel.
- **Neighbors.** 23 px is small next to the 138 px spacing. A disc's nearest neighbor on screen is
  always one of its three nearest by data, and two discs farther apart than both reaches keep
  their order on both axes.

## Zoom

Each grouping level is laid out once, for the smallest zoom it is shown at (`organicRange`). Within
the level, zooming in only spreads true points apart, by up to 1.31×. Two boxes count as clear only
along an axis where they still keep the gap after that stretch. So discs keep their spots across a
level and change only where the map already regroups. A tween that shows a level outside its range
is laid out again at each frame's own zoom. Level 0 is always the 1x layout. Past 1x, discs run on
under the controls to the map's edges, as before.

The worker lays out each level it prepares, so after a filter change the main thread does no
layout work.

## Two tiers of depth

Since October 9, 2026, the main Atlas draws its discs in two tiers. The curated discs above are
tier 1. Tier 2 fills the room between them with small discs from the rest of the rated catalog, a
distant field the curated discs sit in front of. My Map has no tier 2.

The October 8 attempt drew every curated disc smaller at 1x (`discScale`). That was reverted.
Curated discs draw exactly as before it: 76 px art growing with `AtlasGroups.artRoom` (1 at 1x,
settling at 1.24 from 4x), with every name and manufacturer shown. Their spots, the curated set and
every name box match the pre-depth build to the pixel at 1x, on the landing camera, at 3x and at 9x.
The camera's scale sits on `.marker-zoom`, which wraps only `.marker-stack`. Hover motion
(`atlas-motion.js`) animates the stack inside it, so hover lifts a disc 6% and returns it to exactly
its size. Before, GSAP took over the stack's `scale` and left a hovered disc at 1.0.

### Which discs, and where

Tier 2 is a final pass of `AtlasGroups.curate` (rule 7), run only in views that hide discs.

- **Candidates.** Every rated disc in the view, in the curated set's own selection order, except
  the leads already shown. That includes hidden members of shown groups: at 1x a group spans 65 px,
  far more than a small disc needs. `build` passes them in as `points`.
- **Spot.** Each small disc rests near its own atlas point, with the same seeded toss as a curated
  disc. Its reach is 0.6 of its 8 px room (about 5 px), so it tries 8 spots, not the curated 38:
  its toss, its point and 6 around the reach, nearest the toss first.
- **Clearance.** A small disc is placed only where it stays 20 px from every curated disc's art
  (`GAP.art`) and 8 px from every curated name (`GAP.label`). It also stays 6 px from other small
  discs and names (`GAP.apart`), keeps 60 px between small centers (54 px on phones), and stays off
  the chrome and inside the map at 1x. These distances are stretch-aware, like the curated discs'
  own, so they hold at every zoom the level is shown at. A small disc that would crowd anything is
  not placed. Curated discs never move for tier 2: curating with and without it gives the same
  curated layout at every level.
- **Per level.** Tier 2 is laid out with its level, in the worker or on the main thread, so it is
  stable while you zoom within a level. It changes only where the map already regroups. A camera
  between levels (a tween still showing the old one) is laid out again on every frame. There, tier 2
  re-checks the level's own small discs at their spots (`gapsFrom`) and drops any that are no longer
  clear, rather than walking the whole catalog again. A settled camera always gets the full pass.
- **Packed.** `build` hands curate its points as typed arrays (`index` into the items, then x, y and
  the atlas position), and the worker transfers them rather than copying them.

The unfiltered 1440 × 900 map shows about 60 small discs at 1x, 62 at 3x and 22 at 6.5x. A phone
shows 17 at 1x. A complete view (every match shows, such as a narrow filter or desktop past about
7x) has no tier 2: its dots are its small discs. Their places are curate's, unchanged.

### How they look

- **Size.** `GAP.size` is 12 px at 1x, growing with `artRoom` to about 15 px from 4x. That is the
  same size and look as a complete view's dots (`.is-dot .map-dot`): disc-colored, lit from the upper
  left, edged with `--marker-edge`. So the switch between tiers at a complete boundary reads as one
  field. A small disc is never more than a fifth of a curated disc.
- **Distance.** Small discs draw at 72% strength at 1x (`GAP.far`), rising with the art to full
  strength by 4x, as if they come closer as you fly in.
- **Canvas.** They are drawn on the map canvas under every DOM marker (`drawGaps` in
  `public/atlas-map.js`), so they always sit behind the curated discs. Each disc is a blit of a
  cached sprite. Each name is drawn once per theme and font, with the curated names' halo, into a
  cached sprite. Names are drawn only above 1% strength, and at most 6 new name sprites are made in a
  frame. A level's names are also drawn ahead in idle time. They are decoration for the eye, not
  buttons: a click on one does nothing, and they are not in the tab order.
- **Cost.** Under 4× CPU throttling, the tier-2 pass adds about 5 ms to a layout. On the
  `--zoom-boundary` suite, which crosses 4.49×, the level where names are first reserved, long tasks
  run about 55–90 ms, against 0–70 ms at HEAD. That suite's 50 ms limit already failed on most HEAD
  runs on this machine. Two things that were slower were removed: a CSS variable on the marker layer,
  which restyled every marker each frame, and blurred `fillText` each frame.

### Names

- **None at 1x.** A small disc's name is reserved only on levels whose zoom range reaches
  `GAP.labelFrom` (4.5x), from level 7 up. Its strength is `gapLabelAlpha(zoom)`, a smoothstep from 0
  at 4.5x to 1 at 6x. Level 7 is entered at 4.49x and left at 4.37x, where the strength is 0. So the
  first level to reserve names never shows one at the moment it appears.
- **Only with room.** A small disc gets its name only if the name keeps the same distances as the
  disc itself. Later small discs keep off it. Some small discs stay unnamed in crowded spots. A
  complete view's dots get names the same way, after their places are final (`gapLabel`). Their name
  is the DOM marker's, styled to match (`.is-gap-label` in `public/cosmic.css`), and it fades with
  `--gap-label`.
- **Style.** Name only, 11 px, muted, 11 px below the disc's center, one line. The curated names
  stay 13 px, full-strength text, with the manufacturer below.
- **No popping.** When a level swaps, a small disc or name that arrives or leaves fades over 180 ms
  (`GAP_FADE`). A small disc that stays eases to its new rest spot. Its name's strength otherwise
  follows only the zoom. A small disc is recorded in `mapGaps` whether or not it is on screen, for
  tests. A marker mid-regroup still hides an obsolete name at once, as every curated name does.

## Tests

- `node --test tests/atlas-organic.mjs`: the rules above, on controlled fixtures.
- `PLAYWRIGHT_MODULE=… node tests/atlas-organic-browser.mjs` covers desktop and phone in all three
  themes. It runs on the full atlas, Putter, Axiom and a "buzzz" search. It checks each disc's
  that each disc is round, untipped 76 px art with its name 90 px down, its reach and its untouched
  position, and that discs, names and controls never overlap. It also
  checks the curation rules, neighborhoods, pixel-identical determinism, and the landing, 5×, 9×
  and selection views. Screenshots go to `outputs/atlas-organic/`.
- The older map suites (`tests/motion.mjs --boundaries`, `--game-feel`, `--grouping-zoom`,
  `--low-zoom-labels`, `--label-prominence`, `--deep-zoom` and `--zoom-candidates`) were updated.
  The overview no longer has dots, satellites, leader lines or automatic minor labels. Their
  overlap, stack, ceiling, DOM-identity and worker checks are unchanged.
- `node --test tests/atlas-depth.mjs` covers the two tiers on the real catalog, desktop and phone,
  levels 0–9. Curated layout must be identical with and without tier 2, and `artRoom` must be
  unchanged with `discScale` gone. Small discs must be non-curated, in selection order and within
  their reach. Every tier-2 distance must hold at the floor, middle and top of each level, and
  small discs must stay inside the map and off the chrome at 1x. Names must be reserved only where
  they show, and none may show at the first reserving level's entry or exit. The name fade must be
  smooth and monotonic. The suite also covers size limits, complete views (dots unchanged, names
  only with room), determinism, and a selected hidden disc coming forward.
- `PLAYWRIGHT_MODULE=… node tests/atlas-depth-browser.mjs` covers desktop and phone in three themes
  at 1x, on the landing camera, at 3x, 6.5x, 9x and 9x at an edge.
  - Every curated disc must draw at 76 px × `artRoom` with its name and manufacturer. Small discs
    must fill the gaps, unnamed at 1x and named deep in.
  - No name may touch anything. No small disc may touch a curated disc, a curated name or another
    small disc.
  - The canvas may paint only the grid and the small discs. A redraw must be identical to the pixel.
  - Hover must lift a disc 6% and return it exactly.
  - It flies 1x→9x and 9x→1x over 120 frames each. No small disc or name may change faster than one
    180 ms fade (plus the zoom's own change in name strength), and nothing may touch on any frame.
  - It closes in on a cluster of named small discs: their names must start at nothing and fade in
    with no pop and no overlap.
  - Two fresh pages must render the same scene and canvas pixels.
  - Screenshots of far, mid, deep and max in every theme go to `outputs/atlas-depth/`
    (`npm run test:atlas:depth`).
