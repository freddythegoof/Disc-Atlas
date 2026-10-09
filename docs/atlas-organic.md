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

## Three tiers of depth

Since October 9, 2026, the main Atlas draws its discs in three tiers. The curated discs above are
tier 1, the only discs named at 1x. Tier 2, small discs, and tier 3, minis, fill the room between
them with the rest of the rated catalog. Together they form a distant field the curated discs sit in
front of, and more of it shows the further you zoom. My Map has neither.

The October 8 attempt drew every curated disc smaller at 1x (`discScale`). That was reverted.
Curated discs draw exactly as before it: 76 px art growing with `AtlasGroups.artRoom` (1 at 1x,
settling at 1.24 from 4x), with every name and manufacturer shown. Their spots, the curated set and
every name box match the pre-depth build to the pixel at 1x, on the landing camera, at 3x and at 9x.
The camera's scale sits on `.marker-zoom`, which wraps only `.marker-stack`. Hover motion
(`atlas-motion.js`) animates the stack inside it, so hover lifts a disc 6% and returns it to exactly
its size. Before, GSAP took over the stack's `scale` and left a hovered disc at 1.0.

### Which discs, and where

Tiers 2 and 3 are a final pass of `AtlasGroups.curate` (rule 7), run only in views that hide discs.

- **Candidates.** Every rated disc in the view, in the curated set's own selection order, except
  the leads already shown. That includes hidden members of shown groups: at 1x a group spans 65 px,
  far more than a small disc needs. `build` passes them in as `points`.
- **Two walks.** Small discs walk the candidates first. Minis then walk the same order again,
  taking discs that are still left, in the room that is still clear. So the better-known discs are
  the small ones, and minis fill the remaining gaps between the curated and small discs. A disc
  rests once per level, in one tier.
- **Spot.** Each rests near its own atlas point, with the same seeded toss as a curated disc. Its
  reach is 0.6 of an 8 px room (about 5 px), so it tries 8 spots, not the curated 38: its toss, its
  point and 6 around the reach, nearest the toss first.
- **Clearance.** Each tier's box is the size it draws at the level's top zoom, its largest there.
  A small disc or mini is placed only where it stays 20 px from every curated disc's art
  (`GAP.art`) and 8 px from every curated name (`GAP.label`). It also stays 6 px from every other
  small disc, mini and name (`GAP.apart`) and stays off the chrome and inside the map at 1x.
  Centers of the same tier keep 60 px apart (54 px on phones), and a mini keeps 30 px from a small
  disc's center (`GAP.mini.clear`). These distances are stretch-aware, like the curated discs' own,
  so they hold at every zoom the level is shown at. A disc that would crowd anything is not placed.
  Curated discs never move for these tiers: curating with and without them gives the same curated
  layout at every level.
- **Per level.** Both tiers are laid out with their level, in the worker or on the main thread, so
  they are stable while you zoom within a level. They change only where the map already regroups.
  A camera between levels (a tween still showing the old one) is laid out again on every frame.
  There, the level's own small discs and minis are re-checked at their spots (`gapsFrom`), and any
  that are no longer clear are dropped, rather than walking the whole catalog again. A settled
  camera always gets the full pass.
- **Packed.** `build` hands curate its points as typed arrays (`index` into the items, then x, y and
  the atlas position), and the worker transfers them rather than copying them.

On screen, the unfiltered 1440 × 900 map shows about 65 small discs and 57 minis at 1x, 60 and 34
at 3x, and 22 and 2 at 6.5x, where names take most of the room. A phone shows 19 and 12 at 1x. A
complete view (every match shows, such as a narrow filter or desktop past about 6.9x) has neither
tier: its dots are its small discs. Their places are curate's, unchanged.

### How they look

- **Size.** Each tier starts at its own size at 1x: 12 px for a small disc (`GAP.small.size`) and
  5 px for a mini (`GAP.mini.size`). Each grows by 4.8 px for every doubling of zoom (`GAP.grow`) up
  to the 18 px full size both share (`GAP.full`), `gapSize(zoom, tier)`. A small disc reaches it at
  about 2.4x. A mini, starting much smaller, reaches it at about 6.5x. Neither is ever more than a
  quarter of a curated disc. They look like a complete view's dots (`.is-dot .map-dot`):
  disc-colored, lit from the upper left, edged with `--marker-edge`. On the main Atlas those dots
  grow on the small disc's curve too, so the switch between tiers at a complete boundary reads as
  one field. Their 16 px room in curate is unchanged, and at 18 px they reach 1 px past it on each
  side, inside the 12 px gap.
- **Distance.** Both draw at 72% strength (`GAP.far`) until they pass 12 px, rising to full strength
  at the full size, as if they come closer as you fly in.
- **Canvas.** They are drawn on the map canvas under every DOM marker (`drawGaps` in
  `public/atlas-map.js`), so they always sit behind the curated discs. Each disc is a blit of a
  cached sprite. Each name is drawn once per theme and font, with the curated names' halo, into a
  cached sprite. Names are drawn only above 1% strength, and at most 6 new name sprites are made in a
  frame. A level's names are also drawn ahead in idle time. They are decoration for the eye, not
  buttons: a click on one does nothing, and they are not in the tab order.
- **Cost.** Unthrottled on this machine, the depth pass takes about 8–13 ms a layout with both
  walks, against 3.5–7 ms with small discs alone (1440 × 900, levels 0, 4 and 8). It runs in the
  worker with its level. On the main thread it runs only when no worker result fits. A frame between
  levels only re-checks the level's own spots. Two slower approaches were removed: a CSS variable on
  the marker layer, which restyled every marker each frame, and blurred `fillText` each frame.

### Names

- **One rule, by size.** Small discs and minis share one rule. A name's strength is
  `nameAlpha(size)` of its disc's size on screen: 0 below 15 px (`GAP.labelFrom`), 1 at the full 18
  px, and a smoothstep between, with no thresholds and no popping. So small discs earn their names
  first, from about 1.55x to 2.4x. Minis, starting smaller, earn theirs deeper in, from about 4.25x
  to 6.5x, before the desktop map turns complete. `gapLabelAlpha(zoom, tier)` is the same value read
  from the zoom.
- **None at 1x.** A tier's names are reserved only on levels where they will show at the level's top
  (`organicOptions` → `gapLabels`, per tier): small names from level 2, mini names from level 6. On
  the first such level, the strength is 0 at both its entry and its floor, so a tier's names never
  show at the moment they are first reserved.
- **Only with room.** A disc gets its name only if the name keeps the same distances as the disc
  itself. Later discs keep off it. Some stay unnamed in crowded spots, or where the level's stretch
  could bring a neighbor within reach. A complete view's dots get names the same way, after their
  places are final (`gapLabel`), at the small disc's strength. Their name is the DOM marker's,
  styled to match (`.is-gap-label` in `public/cosmic.css`), and it fades with `--gap-label`.
- **Style.** Name only, 11 px, muted, 11 px below the disc's center, one line. At the full 18 px, a
  disc's edge is 9 px from its center, so the name stays clear of it. The curated names stay 13 px,
  full-strength text, with the manufacturer below.
- **No popping.** When a level swaps, a disc or name that arrives or leaves fades over 180 ms
  (`GAP_FADE`). A disc that stays in its tier eases to its new rest spot. A disc that changes tier
  across the swap fades out as one and in as the other, because entries are kept per disc and tier.
  Otherwise its size, and so its name's strength, would jump. A name's strength otherwise follows
  only its size. Every entry is recorded in `mapGaps` whether or not it is on screen, for tests. A
  marker mid-regroup still hides an obsolete name at once, as every curated name does.

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
- `node --test tests/atlas-depth.mjs` covers the three tiers on the real catalog, desktop and phone,
  levels 0–9.
  - Curated layout must be identical with and without tiers 2 and 3, and `artRoom` must be unchanged
    with `discScale` gone.
  - Small discs and minis must be non-curated, each disc in one tier, smalls before minis, in
    selection order within each tier, and within their reach.
  - Every distance must hold at the floor, middle and top of each level, with each tier's art at its
    size there. The tiers' spacing must hold, and so must a mini's distance from small centers. Both
    tiers must stay inside the map and off the chrome at 1x.
  - Names must be reserved per tier only where they show, and none may show at 1x or at either
    tier's first reserving level's entry or floor.
  - One rule: each tier's name strength must equal `nameAlpha` of its size, monotonic and smooth, with
    small names complete before mini names begin and mini names complete before level 9.
  - Sizes must be as stated: a mini at most half a small disc at 1x, both growing to the full size,
    and neither more than a quarter of a curated disc.
  - It also covers complete views (dots unchanged, names only with room), determinism, and a
    selected hidden disc coming forward.
- `PLAYWRIGHT_MODULE=… node tests/atlas-depth-browser.mjs` covers desktop and phone in three themes
  at 1x, on the landing camera, at 3x, 6.5x, 9x and 9x at an edge.
  - Every curated disc must draw at 76 px × `artRoom` with its name and manufacturer. Small discs
    and minis must fill the gaps, unnamed at 1x, each at its tier's size. At 3x, small discs must be
    named and minis not.
  - No name may touch anything. No small disc or mini may touch a curated disc, a curated name or
    another one.
  - The canvas may paint only the grid, small discs and minis. A redraw must be identical to the
    pixel.
  - Hover must lift a disc 6% and return it exactly.
  - It flies 1x→9x and 9x→1x over 120 frames each. No disc or name may change faster than one 180 ms
    fade (plus its size's own change in name strength), and no name may show below 15 px. Small
    discs must be named before minis, and nothing may touch on any frame.
  - It closes in from 1x on a cluster of named small discs and minis: their names must start at
    nothing and fade in as they grow, with no pop and no overlap.
  - Two fresh pages must render the same scene and canvas pixels.
  - Screenshots of far, mid, deep and max in every theme go to `outputs/atlas-depth/`
    (`npm run test:atlas:depth`).
