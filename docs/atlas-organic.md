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
  name stays clear of its art when the art grows past 4× and is selected (1.24 × 1.09). Label footprints are measured separately for the main Atlas and My Map,
  and a click lands within the art's radius (38 px) plus 8 px.
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

## Background depth dots

Since October 8, 2026, a sparse field of small neutral specks sits behind the main Atlas, on the
canvas under the grid and every disc. They are decoration. They carry no data and never move a disc,
change the curation or affect a label. My Map draws none. The code is `AtlasDepth.field` in
`public/atlas-depth.js`, drawn by `drawDepthDots` in `public/atlas-map.js`.

- **Depth.** The dots lie in shells behind the disc plane. A shell `e` behind the discs draws at
  scale `zoom / (1 + e·zoom)`, which is always below the discs' own zoom. Zooming in flies toward
  the discs. Every shell spreads outward slower than the discs do, and nearer shells spread faster
  than farther ones, so the field reads as parallax. Panning moves every dot less than the discs.
- **Sparse at every zoom.** A shell's dot sites are spaced in proportion to its depth, so each
  shell is equally sparse at 1x. Nearer shells thin out as you fly in. Far shells fade in from
  nothing as they come into range, so no dot pops. A 1440 × 900 desktop shows about 70–120 dots and
  a phone about 10–30.
- **Clear of discs and names.** A dot is skipped, never moved, if it would come within 6 px of a
  disc's art (and a selected disc's glow), a shown name, or the name a dot-sized disc opens on
  hover.
- **Small and quiet.** Dots are 1–2.2 px, far below a 10 px data dot or 76 px art. Their color is
  the per-theme `--depth-dot` token in `public/cosmic.css`. Even at full alpha it stays under 5:1
  contrast against the map and under a third of a name's contrast (light 3.2, midnight 4.4,
  charcoal 4.3).
- **Deterministic.** Every dot is seeded by its shell and cell. The same camera always draws the
  same field.

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
- `node --test tests/atlas-depth.mjs` covers the depth dots: determinism, sparseness, size, shells
  behind the discs, parallax on zoom and pan, the fade-in, and avoidance.
  `PLAYWRIGHT_MODULE=… node tests/atlas-depth-browser.mjs` checks that no dot touches a disc or name
  at 1x, on the landing camera, at mid zoom and at 9x, on desktop and phone in three themes. It also
  checks contrast and real parallax. Screenshots go to `outputs/atlas-depth/`
  (`npm run test:atlas:depth`).
