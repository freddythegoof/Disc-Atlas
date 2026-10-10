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
   full size becomes a dot, a small disc of tier 2's size (see below), whose name shows on hover and
   focus. A disc with no room even for that joins the stack of the nearest shown disc, and complete
   views show stack counts. The
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
tier 1. Tier 2, small discs, and tier 3, minis, fill the room between them with the rest of the
rated catalog. Curated and small discs are named at every zoom; minis earn their names deeper in. Together they form a field the curated discs sit in front
of, and more of it shows the further you zoom. At 9x, the deepest zoom, the tiers converge: every
disc is full size with its name, told apart from a curated disc only by curation. My Map has
neither tier.

The October 8 attempt drew every curated disc smaller at 1x (`discScale`). That was reverted.
Curated discs draw exactly as before it: 76 px art growing with `AtlasGroups.artRoom` (1 at 1x,
settling at 1.24 from 4x), with every name and manufacturer shown. Their spots, the curated set and
every name box match the pre-depth build to the pixel at 1x, on the landing camera, at 3x and at 9x.
The camera's scale sits on `.marker-zoom`, which wraps only `.marker-stack`. Hover motion
(`atlas-motion.js`) animates the stack inside it, so hover lifts a disc 6% and returns it to exactly
its size. Before, GSAP took over the stack's `scale` and left a hovered disc at 1.0.

The first version of the tiers (5637bfd) drew small discs at 12 px and minis at 5 px, growing only
to 18 px. That was too small. On October 9 the ladder moved up: minis now start at the old small
size, small discs start at two thirds of a curated disc, and both grow to full size.

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
  reach is 0.6 of its own radius (`GAP.reach`), so it tries 8 spots, not the curated 38: its toss,
  its point and 6 around the reach, nearest the toss first.
- **Clearance.** Each tier's box is the size it draws at the level's top zoom, its largest there.
  A small disc or mini is placed only where it stays 20 px from every curated disc's art
  (`GAP.art`) and 8 px from every curated name (`GAP.label`). It also stays 6 px from every other
  small disc, mini and name (`GAP.apart`) and stays off the chrome and inside the map at 1x.
  Discs of the same tier keep 48 px between their edges (40 px on phones, `GAP[tier].space`), and a
  mini keeps 24 px between its edge and a small disc's (`GAP.mini.clear`). These distances are
  stretch-aware, like the curated discs' own, so they hold at every zoom the level is shown at. A
  disc that would crowd anything is not placed. Curated discs never move for these tiers: curating
  with and without them gives the same curated layout at every level.
- **Names come with the disc.** Where a tier's names show at half strength or more at the level's
  floor (`GAP.named`: small discs always, minis deep in), a disc rests only if its name fits too. So
  no small disc, and no full-size disc, ever shows without its name.
- **Per level.** Both tiers are laid out with their level, in the worker or on the main thread, so
  they are stable while you zoom within a level. They change only where the map already regroups.
  A camera between levels (a tween still showing the old one) is laid out again on every frame.
  There, the level's own small discs and minis are re-checked at their spots (`gapsFrom`), and any
  that are no longer clear are dropped, rather than walking the whole catalog again. A settled
  camera always gets the full pass.
- **Packed.** `build` hands curate its points as typed arrays (`index` into the items, then x, y and
  the atlas position), and the worker transfers them rather than copying them.

On screen, the unfiltered 1440 × 900 map shows about 13 small discs and 42 minis at 1x and 7 and 17
at 3x. At 6.5x it shows about 4 small discs and no minis, because full-size discs with full names
take most of the room. A phone shows no small discs and 14 minis at 1x. A complete view (every match shows, such as a
narrow filter or desktop past about 6.9x) has neither tier. Its dots are its small discs: the
curated art at tier 2's size, placed in a room of that size, and named the same way. At 9x desktop
they are full size, each with its name. A dot with no room joins a stack, so deep complete views
hold larger stacks than they did with 16 px dots: up to 8 in the crowded putter band at 8x, where
they stayed at 3.

A phone's 9x is never complete: its cap stays under the catalog. A disc with no room there for full
size and its name is not drawn at all, as curated discs already were.

### How they look

- **Size.** Each tier is a share of a curated disc (76 px × `artRoom`), `gapSize(zoom, tier)`. At
  1x it is the tier's `start`: two thirds for a small disc (about 51 px), and 12 px for a mini.
  It grows evenly in log zoom (`gapDepth`) to all of it at 9x (`GAP.top`, the map's maximum),
  where both tiers are 94 px, as a curated disc is. Below 9x both stay smaller than a curated
  disc, so they never compete with one. A small disc is 73 px at 3x and 90 px at 6.5x. A mini is
  35 px at 2x, 51 px at 3x and 82 px at 6.5x.
- **Art.** They draw the curated art: `.clean-disc`'s lit gradient, glare, edge, inner rim, inset
  shadows and drop shadows, in its light or dark look, painted once per color into a sprite at
  twice 76 px with room for the shadows (`gapSprite`). A complete view's dot shows the same
  `.disc-art`, 76 px and scaled to tier 2's size (`--gap-half` places its halo, count and hover
  name on its edge).
- **Distance.** Both draw at 72% strength (`GAP.far`) at 1x, rising evenly in log zoom to full
  strength at 9x, as if they come closer as you fly in.
- **Canvas.** They are drawn on the map canvas under every DOM marker (`drawGaps` in
  `public/atlas-map.js`), so they always sit behind the curated discs. Each disc is a blit of a
  cached sprite. Each name is drawn once per theme and type, into a cached sprite. Names are drawn
  only above 1% strength, and at most 6 new name sprites are made in a frame. A level's names are
  also drawn ahead in idle time. They are decoration for the eye, not buttons: a click on one does
  nothing, and they are not in the tab order.
- **Cost.** The depth pass runs in the worker with its level. On the main thread it runs only when no
  worker result fits. A frame between levels only re-checks the level's own spots. Two slower
  approaches were removed: a CSS variable on the marker layer, which restyled every marker each
  frame, and blurred `fillText` each frame.

### Names

- **Small discs: always.** Every small disc wears its name at every zoom, 1x included, in full
  (`nameAlpha(size, 'small')` is 1). That is what makes a small disc the medium tier: clearly
  smaller than a curated disc, but a named, readable one. A small disc rests only where its name
  fits as well (`GAP.named`), so the 1x map holds fewer of them than it would nameless: about 13 on
  desktop and none on a phone, where the room runs out. The nameless alternative was 22 and 4.
- **Minis: by size.** A mini's name strength is `nameAlpha(size)` of its disc's size on screen: 0
  below 54 px (`GAP.labelFrom`), 1 from 84 px (`GAP.labelFull`), and a smoothstep between, with no
  thresholds and no popping. Minis start at 12 px, so they earn their names deep in, from about 3.2x
  to 6.8x, before the desktop map turns complete. `gapLabelAlpha(zoom, tier)` reads the same
  value from the zoom.
- **Reserved where they show.** A tier's names are reserved only on levels where they will show at
  the level's top (`organicOptions` → `gapLabels`, per tier): small names from level 0, mini names
  from level 5. For minis, the strength is 0 at both the first such level's entry and its floor, so
  their names never show at the moment they are first reserved.
- **Only with room.** A disc gets its name only if the name keeps the same distances as the disc
  itself. Later discs keep off it. Where a tier's names show at half strength or more (small discs
  always, minis deep in), a disc without room for its name is not placed. A complete view's dots get names the same way, at the
  small disc's strength. Their name is the DOM marker's, styled to match a curated name
  (`.is-gap-label` in `public/cosmic.css`), and it fades with `--gap-label`.
- **Style.** The curated name: 13 px text over the manufacturer, wrapped to the label's width, with
  its halo. The canvas reads the type off the curated label probe in `measureFullLabels` (per
  breakpoint, `gapTypes`). The name hangs as far below the disc's edge as a curated name below its
  76 px art, 14 px. Once the disc passes 76 px it stays 52 px below the center, where a curated
  name stays as its art grows (`gapDrop`). Curate reserves the band the name moves through as the
  disc grows across the level.
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
    size there and each name where it hangs at that zoom. The tiers' space must hold, and so must a
    mini's distance from small discs. Both tiers must stay inside the map and off the chrome at 1x.
  - Names must be reserved per tier only where they show. Small discs are named in full at every
    zoom. A mini's name must not show at 1x or at its first reserving level's entry or floor. Where
    names show at half strength, every small disc, mini and dot must wear its name.
  - A mini's name strength must equal `nameAlpha` of its size, monotonic and smooth, starting past
    3x and complete before level 9.
  - Sizes must be as stated: two thirds of a curated disc and 12 px at 1x, growing only, smaller
    than a curated disc below 9x, and a curated disc's full size, fully named, at 9x.
  - It also covers complete views (dots are full-size small discs at 9x, each named), determinism,
    and a selected hidden disc coming forward.
- `PLAYWRIGHT_MODULE=… node tests/atlas-depth-browser.mjs` covers desktop and phone in three themes
  at 1x, on the landing camera, at 3x, 6.5x, 9x and 9x at an edge.
  - Every curated disc must draw at 76 px × `artRoom` with its name and manufacturer, and every dot
    at tier 2's size. At 1x small discs must be two thirds of a curated disc, named in full, and
    minis 12 px and unnamed. At 3x, small discs must still be named and minis not. From 6.5x every small disc, mini and
    dot must be named, and at 9x each must be full size with its name in full.
  - No name may touch anything. No small disc or mini may touch a curated disc, a curated name or
    another one.
  - The canvas may paint only the grid, the small discs' and minis' sprites, and their names. A
    redraw must be identical to the pixel.
  - Hover must lift a disc 6% and return it exactly.
  - It flies 1x→9x and 9x→1x over 120 frames each. No disc or name may change faster than one 180 ms
    fade (plus its size's own change in name strength), and no mini's name may show below 54 px. Mini
    names must not begin before 3x, and nothing may touch on any frame.
  - It flies from 1x to 9x onto a small disc (one named at 3x) and onto a mini (one named at 5x). Each
    name must be there throughout for the small disc and start at nothing and fade in as the mini
    grows, with no pop and no overlap. At 9x it must be full size with its name, or be a curated disc or in a curated
    stack. A phone's incomplete 9x may hide a disc with no room.
  - Two fresh pages must render the same scene and canvas pixels.
  - Screenshots of far, mid, deep and max in every theme go to `outputs/atlas-depth/`
    (`npm run test:atlas:depth`).
