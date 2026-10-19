# Atlas map audit — read-only findings

Run date: October 19, 2026. Base: `main` at `7d9ab21` (contains Halo v2, PR #26 `f271f00`, and the
intro reveal, PR #27 `7d9ab21`; gate checked before the pass). Branch `claude/atlas-map-audit`, this
document only. No product code, config, test or data changed. Every claim below was read in source at
the cited lines; where a number comes from running the layout code or the catalog through a script,
the section says so. Graphify was used only for orientation (`graphify-out/GRAPH_REPORT.md`; the CLI
is not installed on this Mac). No performance numbers were taken: this machine was not quiet, and the
doctrine is that verdicts come from the gate (`tests/atlas-3d-perf.mjs`), not from a read.

The constitution's laws are referenced as L1–L8 (score ordering, three tiers, readable = clickable,
CLEAN, neutral vs personal, colorblind palette, data laws, the `3915ede` label conflict).

## 1. Subsystem orientation

### Files and responsibilities

All map code is classic scripts sharing one global scope, loaded in this order by `web/index.html`
(line 26): `vendor/gsap.min.js`, `atlas-motion.js`, `atlas-layout.js`, `atlas-groups.js`,
`atlas-targets.js`, `atlas-map.js`, …, `app.js`, then `my-bag.js` as a module. `atlas-map.js` reads
`app.js` globals (`filtered`, `selected`, `zoom`, `pan`, `view`, `myMap`, `themePalette`, `colors`)
that are declared *after* it loads; `draw()` guards this with `typeof view==='undefined'` (372).

| File | Lines | Owns | Runs in |
| --- | ---: | --- | --- |
| `public/atlas-layout.js` (`AtlasLayout`) | 199 | Positions from ratings (`positions`: x = clamp(50 + 10·(turn+fade))/100 + seeded scatter, y = (speed−1)/14 + scatter, 33–44), the 1× frame and view box (`bounds`, 50–58), camera helpers (`camera`, `fit`, `constrain`, 59–92), the filtered-view spread (`adapt`, 133–197), speed band constants (`BAND`, `CEIL`). Pure. | main + worker |
| `public/atlas-groups.js` (`AtlasGroups`) | 479 | Level hysteresis (`level`, 5–8), grouping into screen cells with capacity (`build`, 426–476), the legacy label-contention pass (`promote`, 63–144), the organic walk and tiers 2/3 (`curate`, 223–425), tier constants (`GAP`, `ORGANIC`, 37–38, 182), level ranges and curate options (`organicRange`/`organicOptions`, 194–210). Pure. | main + worker |
| `public/atlas-groups-worker.js` | 19 | Per level: `adapt` → `build` → `curate`; transfers packed points back. | worker |
| `public/atlas-targets.js` (`AtlasTargets`) | 45 | Hit-testing (`pick`, `reach`, `reads`) and the regroup hold/pin constants (`HOLD`, `PIN`, `READABLE`). Pure. | main |
| `public/atlas-motion.js` (`AtlasMotion`) | 117 | Reduced-motion/GSAP gate, motion tokens, marker hover and press tweens, panel reveal/dismiss. | main |
| `public/atlas-map.js` | 1122 | All map state: `buildClusters` (200–290), `draw` (370–412), tiers 2/3 on canvas (`drawGaps`, 608–674), DOM markers (`renderMarkers`, 726–842), hold and pins (126–153, 677–693), 3D art glue (456–539), sprites and name bitmaps (544–607), the intro and rest (`presentAtlas`/`settleAtlas`, 313–369), input (`initAtlasMap`, 898–1002), the camera spring (1003–1122), the cluster popover (851–897), and `window.DiscThumbnails` for the Directory (10–24). | main |
| `public/app.js` | 397 | Catalog load, `filtered`, lens state, `applyTheme` (29–39), `select`, `showOnAtlas` (50–65), `showMyMap`/`hideMyMap` (69–81), control wiring (227). | main |
| `public/theme.js` | 120 | Theme choice, system follow, `atlas-theme-change`. | main |
| `public/disc3d/atlas-art.mjs` (+ `lod.mjs`, `mesh.mjs`, `shape.mjs`, `stamp.mjs`, `halo.mjs`, `halo-shader.mjs`, `overmold.mjs`, `photo.mjs`) | 224 (+) | The top-down renders (Plan 16): one offscreen three.js renderer, LRU of images keyed by disc/LOD/colours/photo/stamp, LOD choice with hysteresis. Shared with the Directory thumbnails (`thumbnails.mjs`). | main (dynamic import) |
| `public/personal-lens.js` | 22 | My Map's ±10 index-point shifts. | main (module, via `my-bag.js`) |
| `public/featured.js` | 176 | `DiscAtlasFeatured`: curation order and per-disc label nudges. | main |
| `public/cosmic.css` | — | Marker, dot, organic-overview and 3D-art rules (116–130, 195–207, 294–304, 329–370); the four themes' tokens (4–48). | — |

### Data flow: `data.json` → pixels

1. **Load.** `load()` (`app.js:43`) fetches `data.json` (2,434 records, 1,182 rated) and computes
   `sharedPositions = AtlasLayout.positions(discs)` once. `atlasPositions` points at it unless My Map
   has swapped in personal positions (`swapPositions`, `app.js:68`).
2. **Filter.** `filter()` (`app.js:45`) builds `filtered` from lens, collection, search, brand, type,
   speed and stability, then calls `draw()` synchronously.
3. **Context.** `buildClusters` (`atlas-map.js:200`) notices a new `items`/size/mode, measures every
   label's box in the DOM once per breakpoint (`measureFullLabels`, 38–70; cached in
   `fullLabelFootprints`), posts the level to the worker (`prepareGroups`, 169–179) and, for the
   very first paint, builds synchronously (217–221).
4. **Level.** The worker runs `adapt` (spreads a sparse filtered set), `build` (cells of
   `max(25, 65/groupZoom)` px, capacity `Infinity` at level 0 else `≥3`; also emits every rated disc
   as packed points) and `curate` at the level's floor zoom (the organic walk: coverage pass, depth
   pass, cap, selection first; then tiers 2 and 3 in the room left). The main thread hydrates the
   result (`hydrateGroups`, 160–167) and keeps it in `preparedGroups`.
5. **Frame.** Each `draw()`: choose the level (hysteresis in `AtlasGroups.level`; held while a tween,
   a drag or the pointer hold is on, 224–225), recurate on the main thread only when the
   "prominence" key changes (241–261), `place()` every group to screen px (263–275), add pins
   (283), then paint: grid (383–384), My Map consensus rings (386–398), tiers 2/3 sprites or renders
   and their name bitmaps on the canvas (`drawGaps`), the selected disc's offset line (402), DOM
   markers for tier 1 and complete-view dots (`renderMarkers`), satellite leaders (My Map ≥7×),
   compare rings, chrome text.
6. **Input.** Wheel/pinch/drag/keys retarget one critically damped camera spring (`tweenCamera`,
   `stepCamera`, 1047–1092); `scheduleMapDraw` is a single rAF (1039). Clicks resolve against what
   was drawn via `AtlasTargets.pick(mapTargets())` (908–925).

### What runs every frame (the honest list)

`draw()` → `artFrame` (budget reset) → canvas resize check, clear → `buildClusters` (level choice;
`organicOptions` allocation and `AtlasLayout.constrain`; recurate only on key change; `place()` for
every group with an object spread each; `keepPinned` → `mapTargets()` when pins exist) → grid
(~26 strokes) → `drawGaps` (per tier-2/3 entry: fades, `discColor`, `discArt` → `atlasArt.has`+`get`,
one or two `drawImage`s, a name blit) → `renderMarkers` (per cluster: ~8 style/class writes, two
`querySelector('.marker-name')`s, a transform write when moved) → `drawSatelliteLeaders` →
`drawCompareHighlights` → four `setMapText`s plus `filtered.filter(...)` and `filtered.some(...)`
scans (404–405). Scheduling continues while the spring moves, while art is pending, while gaps fade,
and every 120 ms while a pin exists (408–411).

## 2. Findings, ranked

Each finding: category · law touched · evidence · cost or risk · confidence · smallest scoped build.
Behaviour-changing items are decisions, not repairs.

### URGENT

#### U1. A complete-view dot's hit circle is 22 px while its art is drawn 51–94 px wide (L3)

- **Category:** real bug (suspected; code-read, not yet reproduced in a browser).
- **Evidence.** `markerTarget` gives a non-large marker a fixed radius: `r: g.large ? … : 22`
  (`atlas-map.js:116`). On the organic atlas a dot's art is the 76 px curated art scaled to tier 2's
  size: `node.art.style.scale = dotScale` where `dotScale = gapSize(zoom,'small')/76`
  (`atlas-map.js:731–734, 802`; `cosmic.css:351`). `gapSize` runs from 50.7 px at 1× to 94 px at
  9× (`atlas-groups.js:42`). From 2.7× every pointer click is resolved spatially, even when the
  button itself was hit: `if(e.detail!==0&&(zoom>=2.7||!button))` → `AtlasTargets.pick` →
  `group = hit?.kind==='marker' ? hit.ref : null` (`atlas-map.js:919–921`). `pick` accepts a point
  only within `t.r` or inside the name box (`atlas-targets.js:26–30`). So in a complete view at
  ≥2.7×, a click on a dot's plastic more than 22 px from its centre, outside its name box, selects
  nothing. The 22 was written for 12–16 px dots (`27b3177`, Plan 06F); the dot art started scaling
  to `gapSize` in `36935c7` (Oct 9) and the constant was not revisited.
- **Where it bites.** Complete views are every view whose matches fit under the cap: narrow brand or
  type filters from about 2.2× (Innova, 141 discs, is complete from level 4), searches, and the
  unfiltered desktop map from about 6.9× (`docs/atlas-organic.md`, "complete views"). At 9× every
  dot is full size with its name (L2), so the deepest zoom, the view whose whole point is "every
  disc readable", has a 25–47 px ring of visible, named plastic that does not answer a click. The
  pointer cursor (`is-over-disc`, 930) also stays an arrow there, while the CSS hover lift still
  fires (the DOM button is 44 px, `cosmic.css:200`, but its art overflows it).
- **Test gap.** `tests/atlas-persist-browser.mjs` clicks curated markers and canvas small discs at
  their art centre (lines 245, 277, via `PICK`); no suite clicks a complete-view dot off-centre, and
  no suite other than `tests/palette.mjs` mentions `is-dot`.
- **Confidence:** high on the code path; the browser reproduction is the one step not taken.
- **Smallest build.** In `markerTarget`, derive the non-large radius from what is drawn: on the
  organic atlas `gapSize(zoom,'small')/2 + slack`, else keep 22. One line plus a browser check in
  the persist suite that clicks a dot at 0.9 of its radius at 3×, 6.5× and 9× on a brand filter and
  the unfiltered 9× map. Nothing else changes: `drawCompareHighlights` already uses
  `gapSize(zoom,'small')/2` for the same dots (427).

### Decisions for Freddy

#### D1. Small discs carry names at 1×, and rest only where a name fits (L2, L8 — the `3915ede` conflict)

- **Category:** decision-for-Freddy. Flagged against `3915ede`, not resolved.
- **Evidence.** `nameAlpha(size, tier)` returns 1 for `'small'` regardless of size
  (`atlas-groups.js:45–46`); `drawGaps` uses it per tier (`atlas-map.js:626`); `must.small` is
  therefore true at every level, so a small disc without room for its name is not placed
  (`atlas-groups.js:249, 411`). A complete view's dots inherit the same rule (`markerLabel`, 110;
  `--gap-label` is `gapLabelAlpha(zoom)` = 1, 735, 797). `docs/atlas-organic.md` documents the
  post-`3915ede` behaviour ("Small discs: always") and its cost: about 13 small discs and 42 minis
  on the unfiltered 1440×900 1× map, none and 14 on a phone, against 22 and 4 nameless.
- **What L2 says.** "smalls are unlabeled colored dots … Labels only on bigs at 1×." The code and the
  organic doc say the opposite since `3915ede`. This pass does not treat it as a defect.
- **Interplay with L4 (CLEAN).** The 1× desktop map draws about 24 curated + 13 small + 42 mini ≈
  79 discs. Whether that is the density Freddy wants is part of the same decision: the nameless
  variant shows fewer minis and more small discs.
- **Confidence:** high that this is the live behaviour.
- **Smallest build, either way.** Keep: amend L2's text. Revert: return `nameAlpha` to the size rule
  for both tiers (the pre-`3915ede` body, 5 lines in `atlas-groups.js`), set `gapLabels.small`
  back to "from level 1" in `organicOptions`, and restore the `atlas-depth` unit and browser
  expectations the commit changed (`tests/atlas-depth.mjs`, `tests/atlas-depth-browser.mjs`).

#### D2. The seeded scatter reorders discs within about 12 index points (L1)

- **Category:** decision-for-Freddy.
- **Evidence.** `positions` adds a seeded x offset of up to ±0.062 (6.2 index points) to every disc
  (`atlas-layout.js:14–18, 39`). Two discs 5 or 10 points apart can therefore draw in the wrong
  order. Run through the real `AtlasLayout` (node `vm`, as `tests/atlas-layout.mjs` loads it) on
  the shipped catalog: the unfiltered layout has **9,648** pairs where the more stable disc draws
  left of the less stable one, **1,411** of them 10 or more points apart and **850** on the same
  speed row (so side by side). Under filters `adapt` grows the scatter up to 2× and repels
  neighbours (`ADAPT.scale`, 127; 138–191): Innova 106 inversions, Distance drivers 1,638, speed
  11–12 563. Only at full strength (≤40 discs, `adaptStrength`, 128–131) do cohorts become
  non-overlapping columns and the count drops to 0.
- **What is guaranteed today.** Cohort *means* keep order at every strength and whole cohorts at
  full strength (`tests/atlas-layout.mjs:131–139`); `docs/atlas-organic.md` promises order only for
  discs "farther apart than both reaches". Wraith vs Destroyer (L7) is fine in every layout checked:
  Wraith x = 0.744 vs Destroyer 0.821 unfiltered; 0.735 vs 0.844 on Innova; 0.751 vs 0.810 on
  Distance; 0.721 vs 0.803 on Innova + Distance (both desktop and phone sizes). Separately, the
  score clamps at 100 (`app.js:25`, `atlas-layout.js:39`): 9 discs rate above 100 and 20 at exactly
  100, so their mutual order is a tie broken by scatter.
- **The question.** Is L1 a per-pair law (then the scatter width is the thing to decide) or a
  cohort law (then the code already keeps it and L1's wording could say so)? Either answer is
  Freddy's; the first changes where every disc sits.
- **Confidence:** high (computed from the shipped code and data).
- **Smallest build if per-pair is meant.** Cap the x scatter at under half the smallest index step
  on the map (5 points → ±0.024) in `scatter`, re-run `tests/atlas-layout.mjs` and
  `tests/atlas-speed-band.mjs`, and accept the tighter columns in the organic 1× look; the y
  scatter and the speed band are untouched.

#### D3. The signed-in default is the Personalized lens, which changes which discs lead (L5)

- **Category:** decision-for-Freddy.
- **Evidence.** `defaultMap='mine'` (`app.js:11`) unless the player chose otherwise. With a bag,
  `atlasPriority()` puts bag discs first (`app.js:22`), and `build` sorts by that rank
  (`atlas-groups.js:433–437`), so bag discs win the curated slots and lead their groups; `myColor`
  recolours them. Positions are never shifted on the shared map: `shownPositions` only applies
  `adapt`, and the ±10 shift exists only on My Map (`personalPositions`, `my-bag.js:238`).
- **Why it is a question, not a defect.** L5 says the Main Atlas is the neutral consensus and the
  lens a separate transform. The code keeps positions neutral but makes the *curated set* personal
  by default for signed-in players. Whether "Standard" should be the opening view is Freddy's call.
- **Confidence:** high.
- **Smallest build if Standard should open.** Change the one literal at `app.js:11` and the
  `aria-checked` default in the site menu (`web/index.html`, `data-map-choice="mine"`).

#### D4. Canvas small discs and minis are readable and clickable, but not focusable (L3 spirit)

- **Category:** decision-for-Freddy.
- **Evidence.** Tiers 2 and 3 are canvas blits (`drawGaps`), reachable only by pointer
  (`mapTargets`, 119–125). Tier 1 and dots are `<button>`s. `docs/atlas-organic.md` still says they
  are "not buttons: a click on one does nothing, and they are not in the tab order" — the first half
  is stale since `docs/atlas-readable-clickable.md`.
- **Risk.** A keyboard or screen-reader user cannot reach a named small disc that a mouse user can.
- **Confidence:** high. **Build sketch:** a hidden, focusable list of the named canvas discs that
  `select`s on activation, refreshed when `mapGaps` changes; no drawing change. Or a documented
  "pointer-only" decision with the stale sentence fixed.

### Perf smells (hypotheses with a mechanism; the gate decides)

#### P1. Between-level frames run the full curated walk on every frame

- **Evidence.** When a tween shows a zoom outside the current level's range, `organicZoom` returns
  the live zoom, so `options.key` changes every frame and `buildClusters` recurates
  (`atlas-map.js:241–254`). `gapsFrom` makes the tier-2/3 pass cheap, but `curate` always runs
  `walk(groups)` first, and again with the selection first when it was hidden
  (`atlas-groups.js:422–423`); each walk allocates fresh grids and tries up to 38 spots per lead
  (314–342). The level is held for the whole tween (`cameraTween||mapDrag||levelHeld`, 225), so a
  wheel zoom that crosses a level boundary (every ~1.3× of zoom; one notch is 1.16×) pays this on
  every frame from the crossing until the spring settles, and `hydrateGaps` allocates alongside.
- **Mechanism for the parked zoom complaint.** Main-thread work that scales with the number of
  groups at the level, concentrated exactly in the frames of a zoom gesture. At mid zooms the cap
  is in the hundreds (`organicCap`, 183–186).
- **Confidence:** medium (the mechanism is certain; its share of a frame is not measured here). The
  perf gate's 1×→9×→1× flight exercises it, and the last qualifying run was green.
- **Smallest build.** Skip the curated `walk` while `between` and reuse the level's curated layout
  (its `large`/`hidden` flags do not depend on the between-zoom; only the tier-2/3 re-check does),
  i.e. pass a `curatedFrom` the way `gapsFrom` is passed. Then measure with the gate.

#### P2. Wheel-rate layout reads and queries

- **Evidence.** Every wheel event: `measureMap()` (a `getBoundingClientRect`, and it nulls
  `mapChrome`, 77), `track(e)` (`mapTargets()` + `pick` + a class toggle on `#map`, 927–931),
  `animateZoom` → `tweenCamera` → `closeCluster` → `document.querySelectorAll('.atlas-marker.is-open')`
  (1084, 856) → `boundedCamera`. Then the next `draw()` re-measures the chrome: six selectors and a
  `getBoundingClientRect` each (`measureChrome`, 81–91), because `measureMap` cleared it, even
  though the chrome only affects the layout key at 1× (`organicOptions.key`, `atlas-groups.js:209`).
- **Mechanism.** Style/layout flushes interleaved with the frame's style writes at trackpad event
  rates (60–120 Hz).
- **Confidence:** medium-low; cheap individually, suspicious in aggregate during a pinch.
- **Smallest build.** Let `measureMap` keep `mapChrome` unless the viewport size changed; move
  `closeCluster` out of `tweenCamera` into the user-facing callers that can have a popover open.

#### P3. The level swap waits for the spring to settle, then stages the DOM over several frames

- **Evidence.** The level is held while `cameraTween` is set (225); the spring clears only below
  `epsilon` (1069–1070), about 0.3 s after the last wheel event at ω = 2π/0.35. Then `regrouping`
  updates at most 8 markers a frame (755–756), `is-updating` transitions run (`cosmic.css:329`),
  and retirement starts 200 ms later in batches of 8 (816–831). `levelHeld` can add up to 2.4 s
  (`HOLD.max`) while the pointer rests on a readable disc.
- **Mechanism for feel.** Not frame time: a reshuffle that arrives a beat after the zoom stops. This
  is by design (readable = clickable), so it is listed as a candidate explanation, not a defect.
- **Confidence:** medium as a feel mechanism; it needs Freddy's eyes, not a profiler.

#### P4. `renderMarkers` writes styles and classes unconditionally per marker per frame

- **Evidence.** The flags block is guarded (`classList.contains(name)!==on`, 779) but the lines
  after it are not: four `style.setProperty` calls (789–792) and four `classList.toggle`s (786–788,
  796) on every live marker every frame, plus `querySelector('.marker-name')` twice per marker per
  frame (743, 784). The visibility expression at 742 and 784 reduces to `true` on the organic atlas
  (`satelliteLabelsSuppressed` is true from 2.9×, and `zoom<7` covers the rest), so on the main map
  that work is inert.
- **Mechanism.** Attribute mutations that may invalidate style per marker per frame while panning.
- **Confidence:** low-medium (browsers short-circuit identical values in places; the cost is not
  measured). **Smallest build:** cache `.marker-name` on the node like `node.art`/`node.dot`, and
  guard the eight writes with the same `!==` pattern already used at 779.

#### P5. The art helper rebuilds its cache key twice per canvas disc per frame (the `reliefTexture()` class)

- **Evidence.** `discArt` calls `atlasArt.has(...)` and then `atlasArt.get(...)` (`atlas-map.js:484–488`).
  Each call runs `shapeOf`, `stampAssetOf` (a regex, `atlas-art.mjs:89`), `colorsOf` (an object,
  a `document.documentElement.dataset.theme` read, and `parseHalo` when a band exists, 144–145) and
  `keyOf` (string concatenation; for the 33 stamped Discraft discs also
  `JSON.stringify(catalogStampPlacement(d))`, 146–147); `get` also allocates the `order` array
  (156). `photoDisc` adds three `Map` lookups and an object spread on personal lenses (490–494).
  This is per drawn tier-2/3 disc per frame, and per curated marker per frame via `syncMarkerArt`
  (516).
- **Mechanism.** Allocation and string work in the hot loop that grows with the number of canvas
  discs (≈55 at 1×). Cheap each; the same pattern the gallery stall came from.
- **Confidence:** low-medium. **Smallest build:** give `atlasArt` a `lookup(d,color,size,rim,lod)`
  that builds the key once and returns `{entry, cached}`; `discArt` uses it instead of `has`+`get`.

#### P6. `build` always runs `promote`, and `showOnAtlas` runs `build` up to five times on a click

- **Evidence.** `AtlasGroups.build` calls `promote` for every level (`atlas-groups.js:455`) although
  the organic path immediately resets every flag it set (`curate`'s `walk`, 256–259). `showOnAtlas`
  probes `[4,5,6.35,8,9].find(own)` with a synchronous `build` each (`app.js:56–57`), on the main
  thread, including the initial-paint path at 217–221 and the no-worker fallback at 234.
- **Mechanism.** Wasted contention-grid work in the worker; a click handler that can do five full
  groupings of ~1,000 discs before the camera moves.
- **Confidence:** medium. **Smallest build:** skip `promote` when `build` is called for an organic
  level (a flag from the worker/main thread), and have `showOnAtlas` stop at the first level whose
  prepared result already holds the disc as a lead before building new ones.

#### P7. `organicOffsets` memoises without bound, on both threads

- **Evidence.** `atlas-groups.js:214`: keyed by disc id, reach and count; reach differs per level for
  tiers 2/3 (`rooms[t]*G.reach`, 381), so the memo grows toward (levels × tiers + 1) × rated discs
  entries, each an array of 8 or 39 points, in the worker and again on the main thread.
- **Confidence:** high that it grows; low that it matters (single-digit MB). Listed for completeness.

#### P8. `track` allocates the whole target list on every pointer move

- **Evidence.** `atlas-map.js:927–931`: `mapTargets()` builds one object per cluster and per drawn
  gap, plus `markerLabel` boxes, on each `pointermove`, only to toggle the cursor class.
- **Confidence:** low that it matters. **Build sketch:** reuse the last frame's target list until the
  next draw.

#### P9. Per-frame catalog scans and element lookups in `draw`

- **Evidence.** `filtered.filter(d=>d.speed!=null).length` and `filtered.some(...)` run every frame
  (404–405), and about eight `$()` lookups per frame (`#zoomLabel`, `#empty` ×3, `#emptyReset`,
  `#mapSummary`, `#mapMarkers` in `buildClusters` and `renderMarkers`).
- **Confidence:** low. Trivial on their own; part of the "what runs every frame" inventory.

### Fragility

#### F1. A font finishing to load regroups the map, outside the pointer hold

- **Evidence.** `document.fonts` `loadingdone` → `remeasureLabels` → `groupContext=null`
  (`atlas-map.js:74–76`). The next frame treats that as a context change: `groupRevision++`,
  `preparedGroups.clear()`, every pin dropped (203–207), a worker prepare, then a staged swap. The
  pointer hold (`levelHeld`) only governs level changes, and `keepPinned` is skipped while
  `contextPending` (283), so this swap happens under the pointer. Today the result is identical
  (same footprints → `prominenceZoom` kept, 209–213), so nothing moves; `settleAtlas` also waits for
  `fonts.status==='loaded'` (354).
- **Risk.** Any face that loads late (a panel's font first used after the map settled) drops the
  prepared neighbour levels and pins silently. Benign now; a trap for the next label-metrics change.
- **Confidence:** high on the path, low on present harm. **Build sketch:** compare the new footprints
  to the old before nulling `groupContext`, and only invalidate when a box changed.

#### F2. The rest-state repaint hack is load-bearing for the strict gate

- **Evidence.** `settleAtlas` (349–369) removes every marker, nulls `groupCache`/`groupContext`,
  re-inserts `#map` before itself and flips `background-clip` to force a fresh raster. It exists so
  the reveal's rest is pixel-identical to a direct open (`docs/atlas-intro-reveal.md`, "the settle
  repaints the map's background"). Side effects: a synchronous main-thread `build` + `curate` +
  `measureFullLabels` at rest (217–221 via `changed`), and all prepared levels discarded, so the
  first zoom after a reveal waits on the worker.
- **Risk.** Browser-version sensitive by construction (it exists because two rasters differed by one
  level), and the strict gate already had an intermittent 8 px desktop residue before the fix. Not a
  defect; a known fragile edge worth naming in the doc that owns it.
- **Confidence:** high. No build proposed; the owning doc already tracks it.

#### F3. The hit-test and the drawn art are tuned in two places (the cause of U1)

- **Evidence.** Sizes live in `AtlasGroups.GAP`/`artRoom` and `cosmic.css`; hit radii live in
  `markerTarget`/`gapTarget` (114–118) with their own literals (`34`, `8`, `22`, `12`, `6`).
  `gapTarget` tracks `e.size` (good); `markerTarget` tracks the footprint for large markers (good)
  and a literal for the rest (U1).
- **Build sketch:** fold the dot radius into the same expression `drawCompareHighlights` uses (427),
  so there is one source for "how big is a dot on screen".

#### F4. `typeOf` recognises four category strings; the catalog has nine

- **Evidence.** `app.js:25` maps `Putter`, `Midrange`, `Control Driver`, `Distance Driver`; other
  values fall through to speed thresholds. The catalog (counted) carries `Hybrid Driver` (84),
  `Approach Discs` (44), `Fairway Driver` (1), `Disc Golf Sets` (1) and no category (252).
- **Risk.** Colour (L6 palette) and the type filter follow speed for those 130 discs, not the
  catalog's word. Probably intended for hybrids; `Fairway Driver` vs `Control Driver` looks like a
  data spelling the map does not know. A data question more than a map one.
- **Confidence:** high on the facts. **Build sketch:** none here; raise with the pipeline owner.

### Dead and duplicated code (each proven by grep across `public/`, `web/`, `tests/`)

| # | What | Evidence | Verdict |
| --- | --- | --- | --- |
| X1 | `drawPlanetLabels`, `planetLabels`, `groupCache.labelPlacements` | `atlas-map.js:31, 719–725`; `planetLabels` is never written, `labelPlacements` never assigned; only the unwired legacy suites read `planetLabels.size` (`tests/deep-zoom.mjs:52–65`) | Dead, except that the function also owns the 2.9×/2.7× hysteresis flag (722–723), which My Map's `promote` path still uses (257). Keep the two lines, drop the rest. |
| X2 | `satelliteLabelsSuppressed`, `minorLabel`, `satellite`, `leader`, `drawSatelliteLeaders`, `promote` | Live only when `organicAtlas()` is false, i.e. My Map (`atlas-map.js:255–259, 704–715`; `atlas-groups.js:63–144`) | Not dead: My Map's label system. Worth a comment at 92 saying so; a reader of the main atlas will otherwise chase it. |
| X3 | `AtlasLayout.spread` | `atlas-layout.js:95–116`; no product caller (`shownPositions` uses `adapt`); tests only (`tests/atlas-layout.mjs`, `tests/atlas-speed-band.mjs:64`) | Product-dead, test-kept. |
| X4 | `hover`, `points`, `drag`, `moved` globals; `hash()` | `app.js:24, 82`; no other reference | Dead. |
| X5 | `themePalette.edge` | read at `app.js:33`, never used | Dead token read (the `--marker-edge` CSS token itself is used by `cosmic.css:418`). |
| X6 | `applyTheme(theme, persist)` | only called with one argument (`app.js:40–41`); the `persist` branch (31) never runs | Dead branch. |
| X7 | `tweenCamera(target, .28)` / `(…, .45)` | `app.js:227, 64`; `tweenCamera` takes one argument (`atlas-map.js:1083`) | Leftover duration args from the pre-spring API. |
| X8 | `.marker-name` visibility written twice per frame | `atlas-map.js:742–747` and 784 | Duplicated; the first loop is documented as "obsolete labels first", the second is the per-marker write. On the organic atlas both evaluate to visible. |
| X9 | `keepPinned` vs `keepPinnedGaps`; `measureFullLabels` vs `gapName` | 139–153 vs 677–693; 38–70 vs 582–607 | Two implementations each of one rule (pins; label typography), by design (DOM vs canvas). Not dead; the typography pair must stay in step by hand — the `gapTypes` probe (57–60) is the only coupling. |
| X10 | `!document.body.classList.contains('my-bag-mode')` | repeated in `draw`, `buildClusters`, `boundedCamera`, `tweenCamera`, `zoomDestination`, `shownPosition`, `showOnAtlas` | Seven copies of one predicate; a one-line helper would do. |
| X11 | `window.DiscThumbnails` (`thumbnailMarkup`, `observeDiscThumbnails`) | defined in `atlas-map.js:16–24`, used by `app.js:159` and `my-bag.js` | Not dead, misplaced: Directory code in the map module. |
| X12 | Legacy map suites | `tests/motion.mjs`, `deep-zoom`, `grouping-zoom`, `label-prominence`, `zoom-candidates`, `filter-regroup`, `zoom-boundary`, `premium`, `atlas-interactions`, `atlas-groups`, `context-header` exist but no `package.json` script runs them; some docs still cite `node tests/motion.mjs --boundaries` | Test debt, not product code. They are the only readers of X1. |
| X13 | Stale doc sentence | `docs/atlas-organic.md`: canvas discs "are not buttons: a click on one does nothing" | Contradicted by `docs/atlas-readable-clickable.md` and `mapTargets`. Docs-only fix. |

## 3. Checked and clean

- **Three tiers (L2), sizes and growth.** `GAP.small.start = 2/3`, `GAP.mini.start = 12/76`, both
  grow in log zoom to `76 × artRoom(9)` = 94 px at 9×, equal to a curated disc (`atlas-groups.js:37–42`).
  Minis' names follow `nameAlpha` from 54 to 84 px (3.2×–6.8×). Tiers are per level, laid out at the
  level's floor and stretch-aware (`organicRange`, `clear`, 194–195, 277–280). The exception to L2 is
  D1, a known decision.
- **Readable = clickable (L3) for tier 1 and the canvas tiers.** Curated markers: hit radius
  `38·artRoom + 8` tracks the drawn art (`markerTarget`, 116; footprint radius from the organic
  probe, 45, 63). Canvas small discs and minis: radius `max(size/2+6, 12)` and the name box when
  strength ≥ 0.5 (`gapTarget`, 118); fading-out entries stay targets (123); pins keep a dropped
  readable disc under the pointer (139–153, 677–693); below 2.7× a click on a name (which is
  `pointer-events:none`) still resolves spatially because `!button` (919). Marker precedence and
  "art beats name" match `docs/atlas-readable-clickable.md` (`atlas-targets.js:23–33`). Phones: taps
  resolve spatially (`e.detail` ≠ 0), and a lifted finger clears `inside` (981). The one hole is U1.
- **Score ordering guarantees that do hold.** Cohort means keep order under every filter and
  size, whole cohorts at full strength (`tests/atlas-layout.mjs:131–139`, run logic re-executed
  here); the speed band keeps y within ±0.035 of the true speed for every tier, including curate's
  rest toss (`banded`, `atlas-groups.js:237–241`; `tests/atlas-speed-band.mjs`). Wraith never plots
  more stable than Destroyer in any layout computed (D2 lists them).
- **Neutral vs personal (L5), positions.** The shared map never applies a shift:
  `AtlasLayout.positions(discs)` with the default `shift` (`app.js:43`), `adapt` only
  (`shownPositions`, 292–296). My Map swaps `atlasPositions` wholesale and restores
  `sharedPositions` and the saved camera on exit (`swapPositions`, `showMyMap`, `hideMyMap`,
  `app.js:68–81`); the worker is told `personal` and skips `adapt` (`atlas-groups-worker.js:7`;
  `tests/personal-map-worker.mjs`). Photos, rim colours and Halo bands reach the renderer only on
  My Map or a non-default lens (`photoDisc`, `mapRimColor`, 490–495), and the image cache keys
  include them (`keyOf`, `atlas-art.mjs:146`), so a personal render can never stand in for a
  neutral one. `settleAtlas` and the intro never run on My Map (314). D3 is the one question.
- **Theme interactions (four themes + system follow).** `theme.js` applies the saved theme before
  paint and follows the system only while nothing is saved (69–71). The map reads tokens once per
  change in `applyTheme` and redraws synchronously inside the view transition (`app.js:29–40`;
  `theme.js:43–47`). Canvas caches are keyed correctly: sprites by light/dark (the three dark
  themes share one `.clean-disc` shadow rule, `cosmic.css:293`), name bitmaps by text/muted/bg
  colours and DPR (`gapName`, 585), 3D images by resolved plate and rim colours, with the overmold
  rim default resolved per theme before lookup (`colorsOf`, `atlas-art.mjs:141–145`). A light↔dark
  switch re-renders every visible disc within the frame budget and shows the orb meanwhile
  (517–521) — designed, and hidden by the view transition's snapshot. `atlas-theme-change` has no
  other map listener.
- **Colorblind palette (L6).** Type and brand colours come only from the Okabe-Ito tokens
  (`cosmic.css:11–13, 26–27, 36–37, 46–47`; `docs/color-palette.md`), read through `applyTheme`
  (`app.js:34–35`); compare rings use vermillion over a background halo (422–423); bag discs add an
  outline, not just a colour (`cosmic.css:454`). The 3D plate is tuned to its palette colour
  (`docs/atlas-3d-discs.md`). No hard-coded disc colour in the map code.
- **Camera.** One spring for every move; wheel, keys, pinch and flick all go through
  `tweenCamera`/`stepCamera` (1047–1107); clamped to 1–9× (`MAX_MAP_ZOOM`, 30; 1075, 1098); bounds
  re-applied to the destination each step so a filter mid-glide cannot strand it (1059); reduced
  motion eases over 150 ms with no overshoot (1008, 1061–1064); release momentum is capped and
  stripped at a clamped edge (1093–1107). Time-based, so 30/60/120 Hz match
  (`tests/apple-camera.mjs`). Edge resistance is continuous on reversal (1026–1037).
- **Intro and rest.** First shared presentation only (`sessionStorage`, 311, 319); starts on the
  Destroyer camera, breath then spring to `AtlasLayout.fit` (313–332, 1049–1056); any input
  catches it (903, 333–340); phone consumes it on first Flight Atlas (`setView`); the rest draws
  from nothing (F2). Covered by `tests/atlas-intro-reveal.mjs` and the browser suite; the strict
  0 px gate is green as of `6c5824e` per `docs/atlas-intro-reveal.md`.
- **3D layer / 2D interplay (Plan 16).** Renders are cached per LOD, never per pixel size
  (`has`/`get` key by `lod`, 161–164), so a zoom costs no renders until a LOD changes; LOD holds
  with hysteresis and outright while zooming (`lod.mjs:20–26`; `artZooming`, 470–477); budgets
  6 ms a frame, 250 ms on the first (446–468); idle warms neighbouring levels (498–510); orbs are
  the fallback and the crossfade (`three`, 650–658); DOM markers carry the render as a child canvas
  with the orb's shadows kept (`syncMarkerArt`; `cosmic.css:363–368`). Size and name boxes are
  independent of the art (`docs/atlas-3d-discs.md` tests assert equality with the 2D build).
  Software WebGL is rejected (`atlas-art.mjs:49–53`). Caches are capped (images by bytes,
  geometries 400, photos 8, stamps 8, masks 12, sprites 48, names 600).
- **Worker protocol.** Revision-checked and context-checked on receipt (186), packed points
  transferred not copied (`atlas-groups-worker.js:18`), `onerror` falls back to main-thread
  building (192), prepared levels keyed and cleared on context change.
- **Data assumptions.** Every rated disc has numeric `speed`, `turn`, `fade` (counted: 0 gaps);
  no duplicate ids; speed 1–15 with 25 half speeds (the band handles them, `docs/atlas-organic.md`);
  `model3d` is absent for all 2,434 records so every shape derives from `specs` (present for all);
  33 records carry `stampAsset`+`stampPlacement`. `brand ≠ manufacturer` on 845 records, and the
  map labels by `brand` everywhere while `catalogStampAsset` accepts either (`stamp.mjs:8`) —
  consistent. F4 is the one catalog/category mismatch found.
- **Memory and listeners.** No per-frame listener registration; `loadAtlasArt`, the font listeners
  and the worker are created once; `gapFade`, `markerNodes`, `markerPins`, `gapPins` are pruned;
  timers are cleared on cancel paths (`cancelRegroup`, `stopCamera`, `clearClusterTimers`).
- **Filters that empty the view** fall back to 1× once (`buildClusters`, 286–288; `filter`,
  `app.js:45`), and `showOnAtlas` clears hiding filters before flying (`app.js:52`).

## 4. Coverage cuts and what was not verified

- **No browser reproduction.** U1, P1–P9 and F1 are code-read. U1's smallest build includes the
  browser check that would confirm it; it was not run here because the pass is docs-only and the
  machine was not quiet enough for anything timing-related to be trusted anyway.
- **No gate numbers.** Per the doctrine. The last qualifying perf-gate run on record is green on
  `c589f19` (`docs/atlas-intro-reveal.md`).
- **My Map's own `promote` path** (satellites, minor labels, leaders at ≥7×) was read for liveness
  (X2) but not audited for correctness; it is the personal map, not the Main Atlas.
- **The cluster popover** (`openCluster`, `renderCluster`, `positionCluster`, 851–897) was read
  for references only; its layout rules were not audited.
- **The data pipeline** (`prepare_data.py`, consensus overrides) is out of scope by the brief; only
  the map's assumptions about `data.json` were checked (section 3, F4, D2's clamp note).
- **Graphify** was not refreshed (CLI absent; docs-only branch), so `graphify-out/` still describes
  `fd1b999`, one commit behind this base.

## 5. One note on the architecture, in evidence terms

Not a redesign proposal. Two facts a future map task should know before it starts:

1. `atlas-map.js` is three things in one global scope: the map (frame, tiers, markers, camera,
   input), the cluster popover, and `DiscThumbnails` for the Directory (X11). Every one of its
   ~40 module-level `let`s is reachable from `app.js` and the tests by name, which is how the
   browser suites inspect it (`mapGaps`, `mapClusters`, `mapArt`, `selected`), so moving anything
   has a test cost the file does not show.
2. The organic atlas and My Map share `buildClusters`/`renderMarkers` but take different branches
   at nine points (`organicAtlas()` at 93, 174–175, 241–259, 279, 402, 417, 427, 499, 506, 728–735,
   795–803; `myMap` at 295, 386, 491, 495, 775). The legacy `promote` label system is alive only on
   the second branch (X2). That is the main source of "code that looks dead but isn't" in this
   subsystem, and the reason U1 could hide: a dot is a My-Map-era object wearing organic-era art.
