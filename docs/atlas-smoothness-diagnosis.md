# Atlas smoothness — diagnosis: why the zoom still pops and glitches

Fable, October 26, 2026. Base `main` at `86e9d72`, branch `worktree-atlas-smoothness-diagnosis`. Analysis
and design only: this document is the whole deliverable. No product code, test, config or data changed; no
gate was run (this Mac was not quiet, and a verdict from a loaded machine is worse than none). Every claim
below is either read in source at the cited lines, derived from the constants there (the spring math, the
cache arithmetic), or marked as a claim to measure. Sol's write-up (`docs/atlas-zoom-smoothness.md`, PC
worktree) was not on this machine; its findings are taken from the brief and treated as claims. Graphify's
CLI is not installed on this Mac; `graphify-out/GRAPH_REPORT.md` was used for orientation only.

Freddy's spec, kept whole: flight through a field of objects with depth, constant, glitch-free passing
motion; nothing pops, flashes, snaps, steps or stutters; smoothness and cleanness outrank everything else.

## 0. The call in six lines

1. The atlas does not fly through a fixed field. While the camera moves across a level boundary, the
   field is **re-laid out on every frame at the live zoom**: discs hop between candidate rest spots,
   appear and vanish without fades, and small discs flicker in and out. That is the popping, and it is
   literally back and forth: a notch in and a notch out walk the same discs between the same spots.
2. The same per-frame re-layout is a full curated walk over hundreds of groups on the main thread, every
   frame of the gesture. That is the lag. It scales with zoom depth and group count, not with the GPU.
3. When the hand stops, nothing is finished: the level swap waits for the spring to reach a numeric
   epsilon (about 0.55 s after the last notch), then stages the DOM over several frames; the art waits
   180 ms longer and then sharpens in waves under a 6 ms budget. Each nudge leaves a cascade of two or
   three visible changes landing 0.6 to 1.0 s later (up to 3 s with the pointer on a disc).
4. The instruments cannot see any of this. The perf gate sets the zoom directly each frame (no spring, no
   wheel), so the level never stays held and the per-frame re-layout never runs; it times `draw()`'s own
   JavaScript, not frames; and it reports p95, which hides a cluster of five bad frames in 241.
5. The cold intro hitch has four concrete homes, all inside the 1.58 s pull-back: the 250 ms first-fill
   frame, WebGL setup and first-use shader links (Windows pays most), a late font arrival that remeasures
   every label mid-reveal, and a landing that waits on a worker it never asked for.
6. The fix is not architectural. Three changes (freeze the layout during motion, swap on perceptual
   stillness with a crossfade, crossfade every art change) get the flight; the intro needs its own four
   small changes; a motion-layer architecture is the horizon, not the next build.

## 1. How a zoom actually moves today

Read this section once; every candidate hangs on these numbers.

### The input

- A wheel event zooms by `exp(-delta * 0.0015)` about the pointer, clamped to ±600
  (`public/atlas-map.js:1006-1014`). It retargets the camera's destination from the *current destination*
  (`animateZoom`, 1133-1137), so notches accumulate.
- A PC mouse notch is `deltaY = ±100` in Chrome on Windows (claim: log one on Freddy's mouse; some mice
  send 120). One notch is therefore a **16 % step** of the destination (1.161× in, 0.861× out).
- A Mac trackpad pinch or two-finger scroll arrives as many small pixel deltas (1–30 px at 60–120 Hz),
  each a 0.2–5 % retarget. The Mac drives the same spring with a near-continuous target; the PC drives
  it with steps. This alone makes the two machines feel different with identical code.

### The spring

- One critically damped spring (`stepCamera`, 1062-1096), ω = 2π/0.35 ≈ 17.95 s⁻¹ for zoom
  (1082). Step response: 54 % at 100 ms, 87 % at 200 ms, 97 % at 300 ms.
- It is declared finished only when every axis is within ε of its target *and* its velocity is within
  10ε (1084-1085): ε = 10⁻⁴ for zoom. For a one-notch step at zoom 2 (a 0.32 change), that is reached
  at ωt ≈ 10.3, i.e. **about 0.57 s after the last notch**. The motion is visually over by 0.3 s. For
  the remaining quarter second the camera is "moving" to every consumer of `cameraTween`.
- `scheduleMapDraw` is one rAF (1054); while `cameraTween` is set it re-arms every frame.

### What `cameraTween` holds

- **The grouping level.** `buildClusters` keeps `groupCache.level` while `cameraTween || mapDrag ||
  levelHeld(wanted)` (228). Levels are a third of an octave apart (`AtlasGroups.level`,
  `public/atlas-groups.js:5-8`): 1.26× each. A level's layout is valid from its floor to its top,
  `2^((L-.65)/3)` to `2^((L+.5)/3)`, a 1.30× range (`organicRange`, 194). One notch is 1.16×, so most
  single notches, and every double notch, carry the camera outside the held level's range.
- **The art's levels of detail.** `artZooming()` is true while `zoom !== artZoom` and for `ART_SETTLE`
  (180 ms) after the last change (473-480). The comparison is exact, so the art clock does not start
  until the spring reaches ε: art is re-evaluated about **0.75 s after the last notch**, not 0.18 s.

### What runs while the level is held outside its range

`organicZoom(level, zoom)` returns the level's floor inside the range and **the live zoom outside it**
(`atlas-groups.js:195`). `organicOptions.key` includes that zoom (209), so `buildClusters` sees a new
prominence key **on every frame** of the gesture (`atlas-map.js:246-264`) and calls
`AtlasGroups.curate` with the held level's groups at the live zoom (253):

- `walk(groups)` runs in full (`atlas-groups.js:422`): every lead, in order, tries up to 38 candidate
  spots nearest its seeded toss (`organicOffsets`, 213-222; `place`, 314-334), against a grid of boxes
  placed earlier in the same walk. If the selected disc's group ends hidden, the whole walk runs again
  with it first (423). The cap scales with zoom² (`organicCap`, 183-186), so at 3× the walk places
  about nine times the 1× count.
- The tier-2/3 pass takes the `gapsFrom` shortcut (418): the level's own small discs are re-checked at
  their spots and **dropped where no longer clear**; they are not re-placed and nothing new is added.
- The result is hydrated (`hydrateGaps`, 171) and the frame is drawn from it.

Two things follow, and they are the heart of this document:

1. **Spot hops.** A lead's spot is the first clear candidate in a fixed order. "Clear" depends on where
   every earlier lead landed at *this* frame's ratio (`ratio = zoom/groupZoom`, 225). Labels are fixed
   pixels while the true points spread with zoom, so as the zoom moves the first clear candidate changes:
   a lead snaps from its toss to the next ring (up to `reach` = 0.6 of its radius, about 23 px) and back,
   and every later lead in the walk can cascade. The DOM marker takes the new position as a direct
   transform write (`renderMarkers`, 798). No transition applies: `.is-updating` exists only during a
   regroup (`public/cosmic.css:351`), and a regroup is not what this is.
2. **Set churn.** `g.hidden` and `g.large` are recomputed per frame (257, 331). Zooming out below the
   floor shrinks the cap and the room, so leads lose their spot and **vanish in one frame**: a marker
   that is not in `live` is removed immediately unless pinned or mid-regroup (850-856). Zooming in past
   the top grows the cap, so leads **appear in one frame** (773-785, no `is-new` outside a regroup).
   Small discs near a hopping lead fail `roomy` and start a 180 ms fade out, then pass it and fade back
   (`drawGaps`, 650-655): a shimmer tied to the camera's motion.

This is by design and documented ("A camera between levels … is laid out again on every frame",
`docs/atlas-organic.md:142`); it protects CLEAN against transient label overlap. It is also exactly a
field that does not stay still while you fly through it.

### What lands after the hand stops

For one notch with the pointer over empty map, in order:

| When (after last notch) | What | Where |
| --- | --- | --- |
| 0.3 s | motion visually over; per-frame re-layout still running until ε | 1062-1096 |
| ≈ 0.57 s | spring hits ε → `stopCamera` → level no longer held → prepared level swaps; `regrouping`: at most 8 markers updated per frame, `.is-updating` 180 ms transitions, canvas tiers crossfade 180 ms | 228-238, 770-772, `cosmic.css:351-356` |
| ≈ 0.57 s + 200 ms | retiring markers removed in batches of 8 per frame | 831-846 |
| ≈ 0.75 s | `ART_SETTLE` elapses → `lodFor` re-evaluated with the 18 % margin → every canvas disc that crossed a threshold re-renders under the 6 ms budget, a few per frame, each swapping its image **with no fade** | 473-492, 665-675, `public/disc3d/lod.mjs:20-26` |

With the pointer resting on a readable disc (likely: the wheel zooms about the pointer, and curated discs
are where the eye goes), the level swap waits a further `HOLD.hover` 1,400 ms, capped at 2,400 ms
(`public/atlas-targets.js:11, 36-44`; `levelHeld`, `atlas-map.js:131-137`). The art wave still lands
at 0.75 s. So a nudge can produce three distinct pops spread over a second, or over three.

During *repeated* nudging at human cadence (a notch every 100–250 ms) none of this lands: the spring never
reaches ε, the level never swaps, the art never re-evaluates. The field hops and churns under the per-frame
walk for the whole roll, every disc shows a scaled stand-in, and the entire cascade arrives when the hand
finally rests. That is the signature Freddy describes: glitchy while moving, popping after stopping.

## 2. Why the instruments say it is fixed

- **The gate never holds the level.** `tests/atlas-3d-perf.mjs:89-93` assigns `zoom` and `pan` directly
  every frame and calls `draw()`. `cameraTween` is never set, `mapDrag` is null, the pointer is not inside,
  so `buildClusters` follows `wanted` and the camera is always inside its level's range. `organicZoom`
  returns the floor, the prominence key is stable, and the per-frame walk of §1 **does not run** (except
  for the few frames a worker reply is pending). The gate exercises a different code path from a hand on
  a wheel.
- **It times `draw()`, not frames.** Line 92 brackets the function call with `performance.now()`. Style
  recalculation of ~40 marker subtrees whose custom properties were just written, layout, paint, raster
  of the markers' blurred shadows and composite are all outside the bracket, as is the wheel handler
  itself (`measureMap`, `track`, `closeCluster`; audit P2). Frame-to-frame intervals are never recorded.
- **p95 hides clusters.** 241 flight frames; p95 permits twelve frames at any cost. A level crossing that
  stalls five consecutive frames is invisible to the verdict and is exactly what a hand feels.
- **Warm by construction.** Repetitions run on an already-filled art cache and prepared levels (`warm`
  rows are the verdict; `cold` is "diagnostic only", line 159). Nothing after the first repetition ever
  renders a disc or waits for a worker.
- **Scripted gestures are not human.** The 3D suite's mid-gesture check nudges ±9 px alternately
  (`tests/atlas-3d-browser.mjs:292-300`), a 1.4 % zoom change that never leaves the level's range or
  crosses an LOD threshold; it asserts *no render*, not *no visible change*. The persistence suite sends
  40 × −600 (line 262), a flick. Neither resembles three notches, a pause, two notches back.
- **Sol's measured claim** (mid-gesture LOD switches 3 → 0) counts renders during scripted motion. Under
  §1, the discs the eye catches changing mid-gesture are not switching LOD; they are hopping spots,
  appearing and vanishing. The counter was on the wrong quantity. Removing `HOLD_LIMIT` is harmless but
  also means stand-ins now scale without bound during a long roll and the sharpening pop at the end is
  bigger, not smaller.
- **The intro strict gate** compares resting frames (`docs/atlas-intro-reveal.md`); it says nothing about
  the frames in between, and its harness freezes the rAF clock for the proof frames.

None of this argues for loosening anything. It argues that the thing to count is visible change per frame
while a human-shaped gesture is in flight, and worst-frame clusters, not `draw()` p95.

## 3. Candidates, by symptom

Each row: the mechanism, what separates it from its neighbours, and what the two machines would show if
it is the cause. "Trace" means a Chrome performance trace (DevTools or Playwright `tracing`) of a
hand-shaped gesture; "counters" means the instrumentation in §8.

### (a) Popping and flashing of discs while moving

| # | Candidate | Evidence in source | Discriminating measurement | 3070 desktop (notched mouse, DPR 1) | M4 Mac (trackpad, DPR 2) | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | **Per-frame re-curation between levels: spot hops and set churn** (§1) | `atlas-groups.js:195, 209, 254-334`; `atlas-map.js:246-264, 773-785, 798, 850-856` | Counter: per frame, number of markers whose `(g.x,g.y)` moved by more than the camera's own transform of their last position, plus markers added/removed outside `regrouping`, plus `gapFade` entries whose `on` flipped. Non-zero during a gesture = A1. | Large: 16 % steps carry the camera out of range on most notches; hops of up to 23 px with cascades; leads vanish on zoom-out | Smaller: finer deltas, shorter excursions per gesture, same mechanism | **Primary** |
| A2 | Post-gesture level swap landing late and staged | `atlas-map.js:228, 1084-1085, 770-772, 831-846`; `atlas-targets.js:11` | Counter: ms from last wheel event to `stopCamera`, then to the first `regrouping` frame; predicted ≈ 570 ms, or +1,400–2,400 ms with the pointer on a readable disc | Same timing; more notches per gesture means a bigger reshuffle | Same | **Primary (second pop)** |
| A3 | Post-settle LOD re-render wave, hard image swap | `atlas-map.js:473-492, 665-675`; `lod.mjs:20-26`; `atlas-art.mjs:182-188` | Counter: `mapArt.stats.renders` delta in the 300 ms after `stopCamera`; per canvas disc, `e.lod` changes between frames. A render changing a displayed image with `e.three === 1` is a cut, not a fade | Modest: stand-ins scale 1.16–1.5× per gesture; visible on minis growing past 24 px | Same, plus eviction churn (A7) | Real, third pop; smaller than A1/A2 |
| A4 | Scaled-fallback or orb flash for discs entering the viewport during a pan | `atlas-map.js:484-492, 515-527, 665-675` | Counter: `mapArt.pending > 0` or `renders` incrementing during a drag with no zoom; `e.three < 1` entries appearing at the viewport edge | Rare once `warmArt` has run (it warms the whole level); common in the first seconds and right after a settle | Common at depth: 64 MB cannot hold a level at DPR 2 (A7) | Secondary, Mac-leaning |
| A5 | Label-layer redraws riding along with art | `renderMarkers` 798-820; `cosmic.css:136, 146, 385` | Trace: paint invalidations on `.marker-position` layers per frame; label text re-rasterized when `.marker-zoom` scale changes (every frame below 4×; dots at every zoom in complete views) | Present, cheap at DPR 1 | Present, 4× the pixels | Cost, not popping; fold into B3 |
| A6 | DPR or canvas-tier switch mid-gesture | `atlas-map.js:378` resizes only when CSS size changes; DPR read per frame but constant | Counter: `canvas.width` changes during a gesture; expected 0 | 0 | 0 | **Ruled out** by read; one counter confirms |
| A7 | Image LRU eviction churn at DPR 2 | `atlas-art.mjs:237, 263`; `lod.mjs:6-10` | Arithmetic: full LOD at DPR 2 is 192² × 4 = 147 KB; 1,182 discs = 174 MB against 64 MB; mid is 77 MB. `warmArt` renders a whole neighbouring level at its top size (515-527), evicting on-screen images, which then show another level scaled until re-rendered. Counter: `mapArt.stats.evicted` rising during a session | Not a factor: at DPR 1 full is 37 KB, 43 MB fits | **Mac-specific** popping and extra renders | Real on the Mac; explains "milder but present" only partly |
| A8 | Name blits late (6 per frame budget) | `atlas-map.js:598-624, 681-684` | Counter: `waiting` frames; names appear at a sliver of alpha so this is by design invisible | — | — | Ruled out as a pop |

### (b) Glitchy and laggy motion itself

| # | Candidate | Evidence | Discriminating measurement | 3070 desktop | M4 Mac | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | **Main-thread curate walk every frame of the gesture** | §1; audit P1 | Counter: ms inside `AtlasGroups.curate` per frame while `cameraTween`; count of frames with a prominence-key change. Trace: long `draw()` self time only while the camera is outside the held range | Heavy: deeper excursions per notch, more frames out of range; a desktop CPU is not faster than an M4 single-thread | Lighter per frame, fewer out-of-range frames | **Primary for lag** |
| B2 | Notched input shaped by a fast spring: velocity pulses per notch | `atlas-map.js:1013, 1082` | Derived: each notch's zoom rate peaks at ≈ 0.37·ω·d ≈ 1.1 zoom/s then decays; at notch spacing > 300 ms the motion is a train of eases, not a glide. Measure: zoom velocity per frame against notch timestamps | **PC-only** by nature | Absent (continuous deltas) | Real; a feel question for Freddy's hands, below A1 |
| B3 | Render-pipeline work per frame outside `draw()`: per-marker custom-property writes, `.marker-zoom` scale re-raster of blurred shadows, label text | `renderMarkers` 798-820; `cosmic.css:136, 351, 385`; audit P4 | Trace: UpdateLayoutTree, Paint, Rasterize per frame; compare a frame with and without the scale write | Moderate | Moderate, more raster | Secondary, cheap to trim |
| B4 | Forced layout per wheel frame: `measureMap` nulls `mapChrome`, next `organicOptions` re-measures six chrome nodes | `atlas-map.js:78, 82-92, 97-100`; audit P2 | Trace: forced "Layout" inside rAF with a dirty style tree, once per wheel-driven frame | Present at notch rate | Present at 60–120 Hz event rate (worse here) | Secondary |
| B5 | Per-wheel-event handler cost: `track` → `mapTargets` + `pick`, `closeCluster` query, `prepareZoomLevel` post | 1006-1014, 942-946, 1099, 198-202 | Trace: handler self time; expected < 0.5 ms | Low | Low at high event rates, still low | Minor |
| B6 | WebGL context on the wrong adapter: `powerPreference: 'low-power'` | `atlas-art.mjs:51` | On a dual-GPU Windows box Chrome may honour low-power and put the offscreen renderer on the integrated GPU, making every `render()` slower and each `drawImage` from the WebGL canvas a cross-adapter copy. Check `chrome://gpu` and `WEBGL_debug_renderer_info` on Freddy's PC: does it say GeForce RTX 3070? | **PC-only** if it bites; ten seconds to rule out | Not applicable | Low prior; must be checked once because it is PC-specific and cheap |
| B7 | Worker reply hydration on the main thread (`measureFullLabels`, `warmGapNames`, `warmArt` scheduling) | 187-194, 163-170 | Trace: a long task at the worker's `onmessage` during a gesture | Small (footprints cached) | Small | Minor |
| B8 | Full-scene canvas redraw per frame at depth (hundreds of tier-2/3 blits, two or three `drawImage` each) | `drawGaps` 649-688 | Counter: `mapGaps.filter(g=>g.drawn).length` per frame against `draw()` ms with curate excluded | Fine on a 3070 | Fine | Ruled out as primary; the audit's "what runs every frame" inventory already bounds it |

### (c) The cold-intro hitch

| # | Candidate | Evidence | Discriminating measurement | PC | Mac | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| C1 | **The 250 ms first-fill frame** when the art becomes ready during the pull-back | `atlas-map.js:449, 471, 459-470`; `app.js:48` (`presentAtlas` runs at catalog arrival; `loadAtlasArt` started earlier in `initAtlasMap`) | Marks: `artState → 'ready'` time against `atlasIntro.at`; duration of the next `draw()`. If ready lands inside the 1.58 s window, one frame of ≈ 250 ms | Same | Same | **Primary, both cold and warm**; cold decides *where* it lands |
| C2 | WebGL setup long tasks overlapping the reveal: context, PMREM environment, two program links, warm draws | `atlas-art.mjs:48-71, 244-247`; "about 0.7 s in five tasks" (`docs/atlas-3d-discs.md:120`) | Long-task observer with timestamps relative to `atlasIntro.at`; trace shows `compileAsync`/`render` inside `createAtlasArt` | Larger: ANGLE D3D11 program links are slow | Smaller on Metal | Primary on PC cold |
| C3 | **First-use shader links not covered by the warm-up**: the stamp material (`MeshStandardMaterial` with a map), halo, clear and photo programs link on their first `render()` | `atlas-art.mjs:244-247` warms only plate and plate+rim; `stamp.mjs:121-124`; `clear.mjs:68-79`; `halo-shader.mjs:71-78`. Curated Discraft discs carry catalog stamps from mid LOD up (`stampAssetOf`, 107), and are on screen at 1× | Marks: first `render()` with `ink?.userData.stampAsset` and its duration; `renderer.info.programs.length` over the first seconds | 100 ms class stall on Windows per program | Tens of ms | Real, PC-worse; one stall inside the first fill or mid-reveal |
| C4 | **Late font arrival remeasures every label mid-reveal** | `atlas-map.js:75-77` (`loadingdone` → `remeasureLabels` → `groupContext = null`) → next frame `changed` (205-225): `measureFullLabels` for every rated disc (two `getBoundingClientRect` per probe), `preparedGroups.clear()`; audit F1 | Marks: `document.fonts` `loadingdone` time against `atlasIntro.at`; duration of the next `buildClusters`. Cold only: warm fonts resolve before first paint | Same | Same | **Cold-specific**; a strong fit for "cold hitch, no LOD flipping" |
| C5 | Landing waits on a worker it never asked for, then regroups, then settles with a full rebuild | `presentAtlas` 316-335 never calls `prepareZoomLevel(target.zoom)` (`animateZoom` and `showOnAtlas` do); level held at 4 for the whole pull-back; at ε, level 0 is prepared (236), staged regroup, retirement, then `settleAtlas` wipes and rebuilds synchronously (352-372, 220-224) | Marks: worker post/reply for level 0 against landing; `settleAtlas` frame duration | Same | Same | Real; the end of the reveal is a flurry, not a landing |
| C6 | Per-frame curate during the pull-back itself (A1/B1 at its worst: level 4's groups, every frame, 1.58 s, plus a `first` second walk for the selected Destroyer) | §1 | Same counters as B1 during the intro window | Heavy | Lighter | Real; the pull-back is a 1.58 s between-levels gesture |
| C7 | Network: `data.json` 1.6 MB uncompressed, three 339 KB + 381 KB core + addons, no `modulepreload` for three | `web/index.html` import map; `public/bag3d/vendor/three/` | Resource timing: does `three` arrive before or after the catalog? Cold: usually after, so C1/C2 fall inside the reveal; warm: before, so they fall at or before the breath | Same | Same | Cold-vs-warm *placement* of C1–C3, not a hitch itself |

## 4. The primary mechanism, and what would prove it wrong

**(a) Popping: A1 with A2 as its tail.** The field is re-laid out on every frame while the camera is
outside the held level's range, with discrete spot choices and no transitions; then, after the spring's
numeric epsilon and the pointer hold, the prepared level replaces it in a staged regroup. A3 is the third,
smaller pop. "Back and forth" is literal: a notch out and a notch in walk the same leads between the same
candidate spots.

Falsifiers, any one of which kills the call:

- Instrument §8's layout counter and have Freddy nudge-zoom for ten seconds on the PC. If the counter
  stays at zero while his hands still see popping, A1 is not it.
- Pin `organicZoom` to return the floor during motion (a one-line experiment, not a fix) and repeat the
  ten seconds. If the popping is unchanged, A1 is not it. If it moves to the moment the hand stops, A2 is
  confirmed as the tail.
- If the popping Freddy sees is on discs that did not move or change membership, but changed *image*,
  it is A3 (or A7 on the Mac), and the order of fixes below reverses.

**(b) Lag: B1**, with B2 the PC's own input texture on top. Falsifier: curate time per frame during a
gesture below 2 ms on the PC while the lag is still felt. Then look at B3/B4 (trace, not `draw()`), and
at B6 before anything else, because it is ten seconds to rule out.

**(c) Cold hitch: C1 and C4 are the two long frames with a cold-specific placement; C2/C3 add long tasks
that the PC pays more for; C5 makes the landing busy.** Falsifier: a cold trace with the intro window
marked that shows no frame over 50 ms from `artState→ready`, `loadingdone`, `createAtlasArt` or a first
stamped render. Then the hitch is C5/C6 (the landing and the walk) and the fix is the choreography in §7.

What would prove the whole frame wrong: a gesture trace on a quiet PC in which every frame interval is
under one display period *and* the layout counter is zero *and* Freddy still feels it. Then the feel is the
camera model itself (B2) and §6 F4 becomes first.

## 5. "Prioritize smoothness", made concrete for this codebase

Three rules the builder can check against every change, and Freddy can check against his hands:

1. **Motion never waits on layout or art.** While the camera is moving (perceptually: `cameraMoving()`-class
   velocity, not the spring's ε), the only per-frame work on the field is `place()`: a camera transform of a
   fixed layout. No curate, no hydrate, no render decides where or whether a disc shows. Renders may happen
   in the background budget, but they do not change what is displayed until rule 2 allows.
2. **Nothing on the field changes abruptly, ever.** Every change to a disc's presence, position (other than
   the camera's own transform) or image goes through a fade or an eased move of at least `--dur-ui`
   (180 ms). This includes a stand-in giving way to its own sharper render, a level swap's additions and
   removals, and a label hiding for a collision. "Abrupt" means a one-frame cut; the counter in §8 is the
   definition.
3. **Worst frames, not average frames.** The acceptance measure for motion is the count of frames over
   1.5× the display period during a gesture, and the longest run of consecutive bad frames. p95 of `draw()`
   stays as a regression guard; it stops being a smoothness verdict.

A sentence Freddy's hands can falsify in ten seconds: *while the wheel moves, no disc or name appears,
disappears or shifts against its neighbours; when the wheel stops, at most one crossfade begins, within a
quarter second, and nothing else happens afterwards.*

## 6. The fix, ordered by feel gained per unit of risk

Landed law is untouched throughout: LOD tiers stay, the pointer hold (readable = clickable) stays, intro
behaviour stays, score ordering and label rules stay, CLEAN stays. Where a change trades a transient
against a pop, it is marked as Freddy's decision.

### F1. Freeze the field during motion (largest gain; medium risk)

- **Change.** `organicOptions` returns the held level's floor zoom whenever the camera is moving or a swap
  is held, i.e. `buildClusters` never re-curates on a camera frame. The `between` branch at
  `atlas-map.js:252-256` goes; `organicZoom`'s "outside the range → live zoom" behaviour is reserved for
  a *settled* camera (the one case `docs/atlas-organic.md:144-145` calls the full pass).
- **What replaces it for CLEAN.** A monotone, fade-only collision pass per frame: keep every placed disc at
  its spot; for curated labels, test overlap pairwise among on-screen leads at the live zoom (about 40
  boxes; trivially cheap) and *hide the lower-priority label with a fade* while they overlap. Never
  re-place, never add, never remove a disc. Small discs keep the existing `gapsFrom` presence check but
  it runs only once per level swap, not per frame. Transient overlaps that survive this (a label over a
  disc's art during a zoom-out of up to 1.3×) last the gesture and end at the swap.
- **Decision for Freddy.** This accepts brief label-over-art contact *during* motion in exchange for a
  field that does not move. The alternative that keeps zero contact is what exists today. Rule 2 says
  the fade is the right tool; the CLEAN directive's text should say whether it governs frames in motion.
- **Risk.** Tests that assert layout invariants at intermediate camera frames (the organic and depth
  browser suites check floor, middle and top of each level, which is inside the range and unaffected;
  anything that samples a frame *between* ranges during a tween would change meaning and is a Freddy
  call, not a loosening). `tests/atlas-depth.mjs` and `tests/atlas-organic-browser.mjs` to be read by
  the builder before touching `curate`'s call site.
- **Files.** `public/atlas-map.js` (`buildClusters` 244-264, `organicOptions` 97-100), possibly a
  `moving` flag passed into `AtlasGroups.organicOptions` (`atlas-groups.js:201-210`) so the worker's key
  logic is untouched.

### F2. Swap on perceptual stillness, with one crossfade (large gain; low-medium risk)

- **Change.** In `buildClusters` (228) replace the `cameraTween` hold with a stillness test: the camera
  counts as moving while its screen-space velocity exceeds the threshold `cameraMoving()` already uses
  (1056-1061), not until the spring reaches ε. `levelHeld` stays exactly as it is (the law). With the
  pointer off a disc, the swap then begins about 200–250 ms after the last notch, in the spring's
  deceleration tail, and its 180 ms crossfade ends as the motion does: one event, where the eye expects
  it. With the pointer on a readable disc, the hold still applies, but under F1 nothing moves while it
  waits, so the wait is invisible.
- **Also.** Start `ART_SETTLE` on the same stillness, not on `zoom !== artZoom` exactness (473-480), so
  the art and the level change in the same window rather than 180 ms apart. Prepare the destination level
  on every retarget (already done for wheel, 1135; add to `presentAtlas`, see §7).
- **Risk.** `tests/atlas-lod.mjs:68` ("held through a wheel gesture changes nothing until it settles")
  tests `lodFor` in isolation and is unaffected; the browser nudge test asserts no *render* mid-gesture
  and will need to assert no *visible change* instead (§8), a Freddy decision on what the test measures.
- **Files.** `public/atlas-map.js` 228, 473-480, 1056-1061.

### F3. Crossfade every art change (medium gain; low risk)

- **Change.** On the canvas, when `discArt` returns a different `entry` than the one last drawn for a
  disc (a stand-in giving way to its own level, or a level change), crossfade over `ART_FADE` exactly as
  the orb→render path already does with `e.three` (665-675): keep the previous canvas as the "from"
  image. In the DOM, `syncMarkerArt` (530-552) already fades an arriving render; extend the same
  `is-arriving` fade to a *replacement* render (today 540-541 swaps canvases with no fade; curated art
  is a steady full LOD so this rarely fires, but it must never cut).
- **Then** restore a generous hold ceiling (`HOLD_LIMIT` ≈ 2.0 rather than none) so a long roll never
  shows mush; with F3 the upgrade is a fade, not a pop, so the ceiling costs nothing in feel.
- **Allow rendering ahead during motion** within the 6 ms budget (it already happens for first renders);
  F3 is what makes that safe to display.
- **Files.** `public/atlas-map.js` 665-675, 530-552; `public/disc3d/lod.mjs:15`.

### F4. Shape notched input (uncertain gain; low code risk; Freddy's hands decide)

- **Options**, smallest first: (i) for `deltaMode 0` with `|deltaY| ≥ 100` (a notched mouse), lower the
  zoom spring's ω toward 2π/0.5 so each notch is a longer glide and consecutive notches blend; (ii) treat
  notches as velocity impulses into a log-zoom rate with a soft cap and exponential decay (a "cruise"
  model), which gives constant velocity under a steady roll; (iii) leave as is. Trackpad deltas are left
  alone in all cases.
- **Why last among the small ones.** Under A1 the pulsing is masked by popping; only once F1–F3 land can
  Freddy's hands judge B2 on its own. Any change here is pure feel and must be tried, not reasoned.
- **Files.** `public/atlas-map.js` 1011-1013, 1082.

### F5. Pipeline hygiene (small gain; near-zero risk)

- `measureMap` keeps `mapChrome` unless the viewport size changed (78, 82-92; audit P2).
- Cache `.marker-name` on the node and guard the per-frame custom-property writes with the `!==` pattern
  already used for flags (798-820; audit P4).
- Move `closeCluster` out of `tweenCamera` into the callers that can have a popover open (1099).
- `discArt`: one key build instead of `has` + `get` (484-492; audit P5).

### F6. Mac only: the image budget at DPR 2 (medium gain on the Mac; low risk)

- Scale `maxBytes` with DPR² (or by tier counts) so a level's images fit at DPR 2 (`atlas-art.mjs:263`),
  and make `warmArt` skip when the budget could not hold the current level plus the neighbour (515-527),
  so background warming can never evict what is on screen. Counter A7 confirms before and after.

### F7. The horizon: a motion layer apart from the art layer (architectural; not this build)

If after F1–F3 Freddy's hands still want more "sauce" than a DOM-marker field can give, the shape is: every
disc is a world-anchored sprite on one surface (a single canvas or a WebGL quad batch), the camera is one
transform per frame, and the DOM holds only the current level's labels (positioned by the same transform).
Depth is then free: parallax per tier, a motion blur or trail on the canvas discs, continuous size rather
than three tiers of art. That is a different map; the three laws (score ordering, tiers, readable =
clickable) survive it, but every test that reads marker geometry changes. Sketch only; it is not what the
evidence says is wrong today.

## 7. The intro: cold versus warm, what loads when, and whether to re-choreograph

### What happens, in order

1. Scripts load (`web/index.html`: gsap, motion, layout, groups, targets, map, …, app). `initAtlasMap()`
   starts `loadAtlasArt()` → dynamic `import('./disc3d/atlas-art.mjs')` → three (339 KB) + core (381 KB)
   + `RoomEnvironment` addon, then `createAtlasArt`: context, PMREM, two program links, two warm draws,
   yielding between them (`atlas-art.mjs:48-71, 244-247`). About 0.7 s of main-thread work.
2. `load()` fetches `data.json` (1.6 MB), then `filter()` → first `draw()` (synchronous `build` at the
   initial level, `atlas-map.js:220-224`), then `presentAtlas()` → `focusFeatured()` (2.8×, level 4) →
   `tweenCamera(fit)` with the intro's slower ω; the clock starts on the first painted frame (1069).
3. For 1.58 s the camera descends to 1× with level 4 held: the per-frame walk of §1 runs on level 4's
   groups at the live zoom every frame (C6), with a second walk whenever the selected Destroyer's group
   is hidden.
4. Somewhere in here, depending on network and cache: the art becomes ready and the next frame spends
   `ART_FIRST_BUDGET` 250 ms rendering (C1); the stamp program links on the first stamped Discraft disc
   (C3); fonts finish and `remeasureLabels` nulls `groupContext`, so the next frame re-measures every
   label and drops the prepared levels (C4).
5. At ε, level 0 is prepared for the first time (C5: `presentAtlas` never pre-asked), the worker replies,
   a staged regroup runs, retirement 200 ms later, then `settleAtlas` wipes markers and caches and rebuilds
   synchronously, re-inserting `#map` (352-372). At rest, so no motion is disturbed, but it is the frame
   that would delay a first wheel.

### Cold versus warm

- **Cold:** `data.json` and three both download. The catalog usually lands first (it is one file, three is
  three), so the reveal starts while the art is still setting up; C1–C3 land *inside* the pull-back. Fonts
  are also cold: `loadingdone` lands inside or just after the reveal (C4). This is Freddy's "cold hitch".
- **Warm:** three and fonts come from cache; `createAtlasArt` often finishes before or during the breath,
  and the 250 ms fill frame lands before the camera moves (invisible) or in the first frames of the
  pull-back (a visible stall right at the start). The intro doc's measured 1,583 ms is a warm page.
- The measurement in §8 marks every one of these against `atlasIntro.at`; the placement decides which
  are hitches.

### Fixes, all inside landed intro law (once per session, interruptible, reduced motion at rest, resting frame pixel-identical)

- **I1.** `presentAtlas` calls `prepareZoomLevel(target.zoom)` before `tweenCamera`, so level 0 is ready
  before the landing (one line, zero risk).
- **I2.** No 250 ms frame while the intro is active: use the normal budget during `atlasIntro`, and let
  the fill proceed across frames with the existing orb→render crossfade; the first-fill fast path stays
  for a static open.
- **I3.** Warm every program the map can use in the setup loop (`atlas-art.mjs:244-247`): plate, plate+rim,
  stamp (with a 1×1 map), halo, and the clear set. Also compile the stamp material at `warmArt` time for
  stamped discs. Fixes C3 everywhere, biggest on Windows.
- **I4.** `remeasureLabels` compares new footprints to the cached ones before nulling `groupContext`
  (audit F1's build sketch), and never during an active intro; defer the remeasure to the rest.
- **I5.** F1 applies to the pull-back too: level 4's layout frozen and transformed, no per-frame walk.
- **Choreography decision for Freddy.** With I1–I5 the pull-back carries no heavy work and needs no
  re-choreography. If he wants belt and braces on cold loads: start the breath only once
  `artState === 'ready'` and `document.fonts.status === 'loaded'`, with a cap (say 600 ms) after which the
  reveal starts anyway. The close-up simply holds a beat longer on a cold network; nothing in the law
  changes. The landing's settle stays as is: it is at rest by construction and the strict gate depends on
  it; I1 removes the worker wait in front of it.

## 8. The measurement that settles it

Nothing here changes a gate or adds a baseline. It is a diagnostic harness and a set of counters the
builder adds behind a flag (or reads from a Playwright `evaluate`), run on a *quiet* machine, PC and Mac.

### Human-shaped gestures

Real `wheel` events on the map at human cadence, pointer inside the map and over a curated disc (to engage
the hold), on both a cold page (cache disabled, fresh profile) and a warm one:

- Nudge roll: 3 notches of −100 at 150 ms spacing, pause 1,500 ms, 2 notches of +100, pause 1,500 ms,
  repeat ×3.
- Single notch, pause 2,500 ms, ×4 (lets every post-gesture event land and be timed).
- Trackpad emulation for the Mac path: 40 events of −6 at 16 ms, pause, 40 of +6.
- A drag of 300 px over 500 ms with the mouse, then a flick release.

### Counters (per rAF frame, from inside the page)

| Counter | Reads | Separates |
| --- | --- | --- |
| frame interval | `requestAnimationFrame` timestamps; report count > 1.5× display period and longest consecutive run | smoothness vs `draw()` time (B1–B5 vs A1) |
| layout flips | markers whose position changed by more than the camera transform of their previous position; markers added/removed while `!regrouping`; `gapFade` `on` flips; `g.hidden`/`g.large` flips | **A1** |
| curate ms | time inside `AtlasGroups.curate` on the main thread, and prominence-key changes | **B1**, C6 |
| swap latency | ms from last wheel to `stopCamera`, to first `regrouping` frame, to last retirement | **A2** |
| art changes | `mapArt.stats.renders` and `evicted` deltas; canvas entries whose `art.canvas` identity changed with `e.three === 1` (a cut) | **A3**, A7 |
| pending during pan | `mapArt.pending`, `renders` during a drag | A4 |
| canvas size | `canvas.width` changes during a gesture | A6 (expect 0) |
| intro marks | `atlasIntro.at`; `artState→ready`; first-fill `draw()` ms; `createAtlasArt` phase durations; first stamped render ms; `fonts` `loadingdone`; worker post/reply for level 0; `settleAtlas` frame ms | C1–C5 |

### Trace

One Chrome trace per machine per gesture set (DevTools Performance or Playwright `tracing.start`), to get
what the counters cannot: style recalc, layout, paint, raster and composite per frame (B3, B4), long tasks
with stacks (C2, C3), and the GPU process for B6. Check `chrome://gpu` on the PC once for the active
adapter.

### What each machine should show if §4 is right

- PC: layout flips in the tens per gesture; curate ms 3–15 per frame while out of range; swap latency
  ≈ 570 ms (or 1.9–2.9 s on a disc); zoom velocity pulsing at notch timestamps (B2); cold intro with long
  tasks for program links and a 250 ms fill frame inside the window.
- Mac: the same flips at lower counts; curate ms lower; `evicted` rising at depth (A7); same intro frames
  with smaller setup tasks.
- If both machines show zero flips and sub-2 ms curate while Freddy still feels it, go to B2/B6 and the
  trace, and §4's "whole frame wrong" clause applies.

## 9. Builder-ready outline

A follow-up build prompt can lift this section as its plan. Order is by dependency and by feel per risk.
Each step names the acceptance measurement; "hands" means Freddy's ten-second check from §5.

1. **Instrument first** (no behaviour change). Add the §8 counters behind `window.ATLAS_PROBE` (or expose
   on `mapArt`), and a `tests/atlas-gesture-probe.mjs` harness that drives the §8 gestures on a local page
   with `--enable-gpu` and writes `outputs/atlas-gesture/*.json` (frame intervals, flips, curate ms,
   swap latency, art changes, intro marks). Run once on each machine, quiet, cold and warm, *before* any
   fix: this is the baseline the fix is measured against and the first falsifier of §4.
   Files: `public/atlas-map.js` (probe hooks), new test file. Acceptance: the probe runs green on main and
   its numbers match §8's predictions, or §4 is revised before building.
2. **F2 + the art clock** (`atlas-map.js:228, 473-480`): hold on `cameraMoving()`-class stillness, not
   `cameraTween`; `ART_SETTLE` from the same clock. Acceptance: swap latency ≤ 300 ms off-disc; hold law
   unchanged on-disc (`tests/atlas-persist-browser.mjs` hold cases still pass).
3. **F3** (`atlas-map.js:665-675, 530-552`; `lod.mjs:15`): crossfade every displayed image change;
   restore `HOLD_LIMIT ≈ 2`. Acceptance: art-change counter shows zero cuts during and after gestures;
   `tests/atlas-3d-browser.mjs:292-300` re-targeted from "no render" to "no visible change" (Freddy
   decision recorded in the build).
4. **F1** (`atlas-map.js:244-264, 97-100`; `atlas-groups.js:201-210`): no curate on camera frames; fade-only
   collision pass for curated labels; `gapsFrom` presence check once per swap. Acceptance: layout flips
   = 0 during every §8 gesture; curate ms = 0 while moving; organic and depth suites unchanged at floor,
   middle and top; CLEAN-in-motion decision recorded.
5. **Hands.** Freddy nudge-zooms for ten seconds on the PC and the Mac. This is the gate for continuing.
6. **Intro I1–I5** (`atlas-map.js:316-335, 449-471, 75-77`; `atlas-art.mjs:244-247`). Acceptance: cold
   and warm intro traces with no frame over 50 ms inside `[atlasIntro.at, at + 1,580 ms]`; strict
   resting-frame gate unchanged and green; `npm run test:atlas:intro` green.
7. **F5, F6** hygiene and the DPR 2 budget. Acceptance: probe frame intervals do not regress; `evicted`
   stays 0 through a 1×→9×→1× roll on the Mac.
8. **F4** only now, as A/B on the PC with Freddy: ω variants for notched input; keep what his hands pick.
9. **Perf gate stays as is**; in the build's write-up, record what it should additionally measure (frame
   intervals under a spring-driven gesture, worst-frame runs) as a separate Freddy decision.
10. `graphify update .` and commit the probe outputs' summaries with the work.

## 10. Decisions this leaves with Freddy

- CLEAN during motion: a fade-only collision pass accepts brief label-over-art contact while the wheel
  moves (F1). Yes or no.
- The 3D browser suite's mid-gesture assertion: "no render" versus "no visible change" (F3).
- Whether the cold reveal may hold the close-up up to ~600 ms longer for art and fonts (§7), or rely on
  I1–I5 alone.
- Whether the perf gate should grow a gesture-driven, frame-interval mode (separate from this build).
- B6: a one-time check of the PC's active WebGL adapter before the build starts, since a yes changes the
  order (an adapter fix would come first).

## 11. The build (Opus, October 26, 2026)

Branch `claude/atlas-smoothness`, worktree `.claude/worktrees/atlas-smoothness`, off `main` at `fdde447` (PR #47's
merge; it touched no atlas file, so every line reference above still holds). Local only: no push, no PR, no deploy.
Sol's parked PC worktree (`codex/atlas-zoom-smoothness`) was not touched. Freddy's three rulings are law here:
CLEAN governs frames in motion (1), the mid-gesture gate counts visible change (2), a cold reveal may hold the
close-up invisibly (3).

### 11.1 Step 0

- **WebGL adapter.** The art renderer asks for `powerPreference: 'low-power'` (`public/disc3d/atlas-art.mjs:51`). The
  harness's context on this Mac reports `ANGLE (Apple, ANGLE Metal Renderer: Apple M4)`: hardware, not software and
  not integrated-versus-discrete (the M4 has one GPU). The PC is Freddy's glance: the probe prints the same line
  (`adapter …`) on any machine, or `chrome://gpu` shows it; it should name the RTX 3070.
- **Gate honesty.** `tests/atlas-3d-perf.mjs` assigns `zoom` and `pan` each frame (lines 89–93). It cannot drive the
  spring, so it never ran the code path this build changes. It was not used to certify anything here and was not
  changed. The new probe below replaces it for this arc.

### 11.2 The measurement (ruling 2)

`tests/atlas-visible-change.mjs` is the counter; `tests/atlas-gesture-probe.mjs` drives it. Gestures go through the real
input path (Playwright wheel and pointer events, so the spring, the level hold and the art clock all run as under a
hand): a single PC notch (`deltaY` ±100) in and out, doubles 60 ms apart, a nudge roll (three in at 150 ms, two out, ×3),
trackpad-fine deltas (20 × 6 px at 16 ms, and a long pinch of 40), a drag and a flick, a long roll (12 notches in, 12
out), notches with the
pointer resting on a curated disc, and the intro cold (fresh context, empty cache, 20 Mbps / 40 ms link) and warm.

Each frame it records what the previous frame put on screen and counts, away from the viewport's edges (a pan
bringing discs in is not the field changing): a disc **appearing** or **vanishing**, a disc **hopping** (its drawn spot
starting to move to another rest spot), a drawn spot **jumping**, a name **cut** (or faded), an image **swapped**
(or crossfaded). Each event is `abrupt` or not: a cut, a snap or a swap is abrupt, a fade or an eased move is not.
It also records frame intervals (rAF timestamps, not `draw()` time), main-thread curate time, renders and evictions,
and for the intro the marks (art ready, fonts, level 0 prepared, hold, landing, settle) and long tasks attributed to
renders, worker hydration and label measuring.

A gesture runs from its first input to the last frame whose camera still moves on screen (0.75 px a frame, 45 px/s);
its events are **mid-gesture**. After it, events group into **bursts** (within 150 ms of each other): the first is
the swap the hand expects; any later one is a **late pop**.

The gate (`--assert`, ruling 2), on every gesture: nothing abrupt, mid-gesture or after; no disc hops mid-gesture. On
the ordinary gestures, those within the held level's reach (single and double notches, the nudge roll, the short
trackpad pinch, drag): no disc appears or vanishes mid-gesture, and the gesture ends in at most one burst. The long
roll, the long pinch and the intro may crossfade levels mid-flight (ruling 1 licenses it); they are held to nothing
abrupt and no hops. A pin letting go (the pin rule's own timing) is recorded as `unpin` and kept out of the bursts. `tests/atlas-3d-browser.mjs`'s mid-gesture
checks now count the same visible change; render changes print as diagnostics.

### 11.3 What changed

All in `public/atlas-map.js` unless named.

1. **The level swaps when the motion looks still** (`cameraLooksStill`): under 3 px of travel left and 45 px/s at
   the viewport's farthest corner, the threshold the probe uses for "moving". That is about 0.35 s after a notch, in
   the spring's tail, instead of at its epsilon. The art's levels of detail are looked at again in the same frame as
   the swap (`artZooming` also waits while a swap is due), so the post-gesture cascade (epsilon wait, then 180 ms,
   then the art wave) is one change. The pointer hold (`levelHeld`) is unchanged.
2. **Every art change crossfades.** A canvas disc whose image changes (another level of detail, a finished photo or
   stamp, a stand-in giving way) fades from the old image over `ART_FADE`, including mid fade-in from the orb. A
   curated disc's replacement render fades in over the old one, which goes once covered.
3. **The field is frozen while the camera moves.**
   - A level is laid out once, at its floor, as the worker already does; the per-frame curate at the live zoom is
     gone. Curate runs on the main thread only for what shapes the layout (a new selection, the chrome at 1×), and
     those in-place re-layouts now present as a regroup (fades and eases), not cuts.
   - The held level carries the camera past its own range: two notches out (1.36×, where names start to yield) and
     three in (1.6×, where the field only spreads). Farther, a long roll or the intro changes level mid-flight, as a
     crossfade, to the destination's level when it is prepared and in reach, else the live zoom's.
   - While it moves, a kept disc keeps the spot it is drawn at; it eases to its new rest spot (~180 ms) in the swap at
     stillness. Curated markers now ease in JS with the camera (`placeMarker`); the regroup's CSS transform
     transition, which made markers trail a moving camera, is gone (`public/cosmic.css`).
   - Names that the frozen layout brings onto a disc or another name past its range fade out (`yieldNames`; discs
     always win, then curate's order) and fade back when clear. A name a marker no longer carries fades rather than
     cuts (`is-label-out`). A faded name is not a click target.
   - Markers the regroup's 8-a-frame budget reaches later still follow the camera (they froze, then jumped).
   - Pins let go only while the camera looks still.
   - A still camera that the pointer hold keeps on a level past its range for more than 300 ms lays that level out
     once at where it lands, through the same fades, so the resting map stays clean during a long hold (a short one,
     the pointer settling, just waits for the swap).
   - A disc a pin brings back inside the map outside a regroup fades in.
   - Fades step by the time since the last frame, capped at 50 ms (`FADE_FRAME`). Before, a map left idle (the
     pointer hold draws nothing) finished every fade in its first frame back: an abrupt swap.
4. **Hygiene.** The chrome's boxes are measured once per map size, not per wheel event; per-marker class and
   custom-property writes happen only when they change; `.marker-name` is cached; `closeCluster` runs only when
   something is open; `discArt` finds a cached image with one key (`atlasArt.lookup`, `public/disc3d/atlas-art.mjs`).
   **Input shaping is opt-in for an A/B:** `?wheel=glide` (or localStorage `atlas-wheel` = `glide`) gives a notched
   mouse wheel a slower zoom spring (0.5 s against 0.35 s), so a roll blends into one flight. Off by default;
   trackpads never. **Not done:** the DPR 2 image budget (diagnosis F6): evictions measured 0 in every gesture at
   DPR 2, so there was no evidence to act on.
5. **The intro.**
   - **The invisible hold (ruling 3).** From the first paint, the close-up holds until the 3D art has drawn what is on
     screen, the fonts are in, any label re-measure is done and the pull-back's levels are prepared, at most
     `INTRO_HOLD_MAX` 1.2 s. It never freezes: the camera is already leaving, creeping back from the Destroyer at
     2.5 % of its zoom a second, and the pull-back carries on from that speed with no still breath between (the creep
     is the opening beat). The zoom only ever falls (the intro units' "pull-back never reverses" holds). Ready at the
     first paint, there is no hold and the breath and pull-back run as before. Once per session, interruptible,
     reduced motion at rest, `settleAtlas()` and the resting frame are untouched (settle also waits for markers
     easing, with its other "never mid-fade" guards).
   - Every level the pull-back passes through is prepared by the worker and drawn ahead (`warmArt`) during the hold,
     so each level change on the way is one crossfade and the landing finds level 0 ready.
   - No 250 ms first-fill frame during the intro; the renders take the normal budget and crossfade in.
   - A font finishing mid-reveal no longer re-measures every label in flight: it runs in the hold (which waits for it)
     or at rest, and invalidates the layout only if a box changed.
   - The stamp and Halo programs are compiled at setup with the plate's. A compare of the renderer's programs after
     setup and after the map drew shows none compiled later.

### 11.4 What the counters say

Main (`fdde447`'s `public/` and `web/`, exported untouched) against the build, under the same final probe, both on
this M4 at 1440 × 900. Each cell totals the gesture's repetitions and reads baseline → build. "Appear/vanish" counts
faded ones too (ruling 2 counts them; the build's are the long flights' mid-flight crossfades). Frame timing comes from
a machine at load 2–3.8 with other sessions running: the intervals are listed, not certified.

**DPR 1 (the PC's density)**

| Gesture (reps) | Abrupt mid-gesture | Appear/vanish mid-gesture | Hops mid-gesture | Abrupt after | Gestures with a late pop | Swap after input (ms, mean) | Latest late pop (ms) | Main-thread curate (ms) | Long frames |
|---|---|---|---|---|---|---|---|---|---|
| notch-in (3) | 119 → **0** | 134 → **0** | 57 → **0** | 73 → **0** | 1 → **0** | 489 → **381** | 630 → **–** | 9.5 → **0** | 1 → **0** |
| notch-out (3) | 168 → **0** | 150 → **0** | 72 → **0** | 147 → **0** | 1 → **0** | 356 → **390** | 2097 → **–** | 28.7 → **0** | 0 → **0** |
| double-in (2) | 285 → **0** | 243 → **0** | 115 → **0** | 88 → **0** | 1 → **0** | 1232 → **391** | 2114 → **–** | 22.5 → **0** | 0 → **0** |
| double-out (2) | 276 → **0** | 196 → **0** | 126 → **0** | 99 → **0** | 2 → **0** | 381 → **407** | 2148 → **–** | 38.7 → **0** | 0 → **0** |
| nudge-roll (6) | 1166 → **0** | 782 → **0** | 529 → **0** | 137 → **0** | 2 → **0** | 425 → **557** | 681 → **–** | 146 → **0** | 0 → **0** |
| trackpad (2) | 220 → **0** | 181 → **0** | 109 → **0** | 8 → **0** | 0 → **0** | 265 → **382** | – → **–** | 33.5 → **0** | 0 → **0** |
| trackpad-long (2) | 646 → **0** | 440 → **52** | 329 → **0** | 3 → **0** | 0 → **0** | 200 → **373** | – → **–** | 110.8 → **0** | 0 → **0** |
| drag (2) | 0 → **0** | 0 → **0** | 0 → **0** | 0 → **0** | 0 → **0** | – → **–** | – → **–** | 0 → **0** | 0 → **0** |
| long-roll (2) | 1227 → **0** | 880 → **526** | 497 → **0** | 44 → **0** | 2 → **0** | 349 → **407** | 799 → **–** | 159.3 → **0** | 0 → **0** |
| on-disc (2) | 142 → **0** | 148 → **0** | 52 → **0** | 98 → **0** | 2 → **0** | 398 → **382** | 1798 → **–** | 17.6 → **0** | 0 → **0** |

| Intro | Hold (ms) | Pull-back starts (ms) | Abrupt during flight | Hops during flight | Abrupt after landing | Pull-back long frames / worst (ms) | Long tasks in the window |
|---|---|---|---|---|---|---|---|
| cold | 0 → **367** | 0 → **367** | 174 → **0** | 60 → **0** | 19 → **0** | 0 / 17 → **0 / 17** | -9ms:101 → **2ms:91** |
| warm | 0 → **333** | 0 → **333** | 178 → **0** | 62 → **0** | 17 → **0** | 0 / 17 → **0 / 17** | -13ms:51 → **-11ms:56** |

**DPR 2 (the Mac's density)**

| Gesture (reps) | Abrupt mid-gesture | Appear/vanish mid-gesture | Hops mid-gesture | Abrupt after | Gestures with a late pop | Swap after input (ms, mean) | Latest late pop (ms) | Main-thread curate (ms) | Long frames |
|---|---|---|---|---|---|---|---|---|---|
| notch-in (3) | 36 → **0** | 58 → **0** | 15 → **0** | 35 → **0** | 1 → **0** | 331 → **330** | 581 → **–** | 8.8 → **0** | 1 → **1** |
| notch-out (3) | 67 → **0** | 51 → **0** | 33 → **0** | 48 → **0** | 1 → **0** | 315 → **347** | 2048 → **–** | 17 → **0** | 0 → **0** |
| double-in (2) | 126 → **0** | 111 → **0** | 52 → **0** | 52 → **0** | 1 → **0** | 315 → **331** | 2014 → **–** | 9.4 → **0** | 0 → **0** |
| double-out (2) | 113 → **0** | 58 → **0** | 72 → **0** | 44 → **0** | 1 → **0** | 331 → **364** | 648 → **–** | 31 → **0** | 0 → **0** |
| nudge-roll (6) | 750 → **0** | 544 → **0** | 372 → **0** | 75 → **0** | 1 → **0** | 294 → **498** | 616 → **–** | 85.7 → **0** | 0 → **0** |
| trackpad (2) | 0 → **0** | 0 → **0** | 0 → **0** | 0 → **0** | 0 → **0** | – → **–** | – → **–** | 0 → **0** | 0 → **0** |
| trackpad-long (2) | 238 → **0** | 188 → **0** | 122 → **0** | 11 → **0** | 0 → **0** | 114 → **323** | – → **–** | 62.3 → **0** | 0 → **0** |
| drag (2) | 0 → **0** | 0 → **0** | 0 → **0** | 0 → **0** | 0 → **0** | – → **–** | – → **–** | 0 → **0** | 0 → **0** |
| long-roll (2) | 952 → **0** | 699 → **345** | 498 → **0** | 67 → **0** | 1 → **0** | 465 → **316** | 548 → **–** | 119.5 → **0** | 0 → **0** |
| on-disc (2) | 0 → **0** | 0 → **0** | 0 → **0** | 0 → **0** | 0 → **0** | – → **–** | – → **–** | 0 → **0** | 0 → **0** |

| Intro | Hold (ms) | Pull-back starts (ms) | Abrupt during flight | Hops during flight | Abrupt after landing | Pull-back long frames / worst (ms) | Long tasks in the window |
|---|---|---|---|---|---|---|---|
| cold | 0 → **367** | 0 → **367** | 174 → **0** | 64 → **0** | 19 → **0** | 1 / 33 → **0 / 17** | 6ms:101 → **-7ms:97** |
| warm | 0 → **367** | 0 → **367** | 185 → **0** | 60 → **0** | 19 → **0** | 0 / 17 → **0 / 17** | -12ms:51 → **1ms:53** |

Reading it:

- **Mid-gesture.** Every ordinary gesture (notches, doubles, the nudge roll, trackpad, drag) goes from tens to hundreds
  of abrupt changes and hops to **none**, and no disc appears or vanishes while the camera moves. The long roll and
  the long trackpad pinch still change level mid-flight (52 to 526 discs fading in or out over 12-notch rolls): all
  fades, no hop, nothing abrupt.
- **After the hand stops.** No late pop in any gesture; the baseline had them up to 2.1 s after the input. The swap
  lands as one burst, on average 0.33–0.41 s after the last notch (the nudge roll's mean includes repetitions the
  pointer's 220 ms settle kept a beat longer).
- **Main-thread curate during gestures** goes from 8–160 ms per gesture to 0. Frame intervals on this machine were
  already clean in both builds (one 33 ms frame on each side, in different gestures); the lag mechanism (diagnosis
  B1) is removed, whatever it cost on the PC.
- **The intro.** The pull-back has nothing abrupt, no hop and nothing popping after the landing (baseline: about 175
  abrupt changes in flight and 19 after landing). The hold measured 333–367 ms, cold and warm, the close-up creeping
  back meanwhile; the pull-back's frames show no long frame, worst 17 ms. The one long task (90–100 ms, the first
  renders and the first label measure) sits at the first paint, before the camera moves.
- **The pointer hold** is still law. On these runs it never delayed a swap into a second burst. When it does (the
  pointer resting on a readable disc), the swap lands up to 2.4 s later as one crossfade, and the resting map is
  re-laid out once after 300 ms so it rests clean meanwhile.

### 11.5 Suites

All on the final tree, this Mac, `--enable-gpu`, one after another.

| Suite | Result |
| --- | --- |
| Gesture gate (`tests/atlas-gesture-probe.mjs --assert`), DPR 1 and 2 | pass, pass |
| Organic, depth (their raster checks were reported red on the PC) | pass, pass (both green here; nothing chased) |
| 3D (mid-gesture checks now count visible change) | pass |
| Persist (readable = clickable, the hold and pins) | pass |
| Intro, strict resting frame 0 px | pass (pixel-equivalent on desktop and phone) |
| Stamps, My Map, lens corner, Apple design | pass |
| Units (`node --test`, 312) | 304 pass, 2 skipped, 6 fail: the six `*-evidence.mjs` scripts read gitignored `work/` evidence, and all six fail identically on untouched `main` |
| Perf gate (`atlas-3d-perf.mjs`) | not run: it cannot drive the spring (11.1), and the machine was not quiet |

Test changes, none loosening a margin: the 3D suite's mid-gesture assertions count visible change (ruling 2), and its
settle waits on the camera's stillness instead of the removed `artZoom` clock; the intro suite times the reveal from
the hold's end (same 1.2–1.8 s bounds), steps through the hold explicitly in its frozen proof frames, and asserts the
hold never passes its cap.

### 11.6 Decisions for Freddy

1. **The pointer hold.** With the pointer resting on a readable disc, the level still waits up to 2.4 s (law,
   `AtlasTargets.HOLD.hover`), then crossfades. Pins already keep the disc under the pointer. If his hands call that
   late fade a pop, the hold can give way to pins alone at stillness; that changes landed law, so it is his call.
2. **The reach.** Two notches out and three in carry one field; beyond that the level crossfades mid-flight. A larger
   outward reach means fewer mid-flight fades on long zoom-outs but a denser field mid-flight (names fade where they
   meet; discs can touch in a deep complete view).
3. **The wheel glide A/B.** `?wheel=glide` on the PC's notched mouse: keep it as the default, or drop it.
4. **The intro's creep** (2.5 % of zoom a second while held): its rate, and whether it should also run on a warm open
   that needs no hold.
5. **My Map is not in this build.** It still re-promotes labels at the live zoom on every camera frame
   (`AtlasGroups.promote`); the same freeze applies there if he wants it.

### 11.7 For his hands (falsifiable in ten seconds)

PC first, then the Mac. The preview serves this worktree as the browser suites do (signed out, backend excluded) at
http://127.0.0.1:8870/; `HOST=0.0.0.0` on the preview server opens it to another machine on the network.

- Nudge the wheel one or two notches in and out, anywhere: while it moves, no disc or name appears, disappears or
  jumps against its neighbours. When it stops, at most one soft change, within about a third of a second, and
  nothing after it.
- Roll the wheel hard across many levels: discs fade in and out as you fly; none snaps or hops.
- Open it cold in a fresh window: the close-up is never still (it is already drifting back), and the pull-back flies
  without a stall.

If any of that fails, the counters measured the wrong thing again, and his hands win.
