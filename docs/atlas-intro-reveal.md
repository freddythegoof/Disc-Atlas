# Atlas opening: whole-atlas reveal

Branch `codex/atlas-intro-reveal`, based on `main` at `38a8c4a0`. Commit only; no push, merge or deployment. **Acceptance is incomplete:** strict resting-frame pixel equality and a green local performance gate remain unmet.

The first shared Atlas presentation establishes the Destroyer neighborhood, holds briefly, then retreats to the complete atlas. Desktop starts on page load. Phone still starts in Directory and consumes the reveal only when Flight Atlas first appears. Returning to Flight Atlas or reloading within the same browser-tab session opens directly at the fitted view.

## Camera and lifecycle

- The start uses the existing `focusFeatured()` camera unchanged: 2.8× desktop, 4× phone. The first animation frame retains this camera even when startup work delays that frame.
- `AtlasLayout.fit()` derives zoom and center from the actual displayed positions and viewport bounds, reserving 36px for art. It respects the existing 1–9× zoom range. The full catalog reaches the existing 1× floor; the existing curated overview supplies its footprint and chrome clearance. No catalog positions, grouping, spacing, rendering tiers, label rules or zoom limits change.
- The existing critically damped camera spring owns the entire move, its destination, velocity, RAF scheduling and LOD hold. The intro gives that same spring a slower response and a finite landing time. There is no second tween.
- Timing uses the existing motion tokens: one `--dur-ui` breath (180ms), followed by five `--dur-surface` units (1,400ms), totaling **1,580ms**. The completion lands on the exact fitted camera and clears the intro, destination and velocity. Ordinary wheel, drag, pinch and flick spring parameters remain unchanged.
- Document capture catches pointerdown, wheel, keydown and click before controls, markers or ordinary camera handlers see the intro destination. Events continue to their usual handlers. A tap catches without clicking through; a drag, wheel, pinch or key immediately works from the live camera. This also works during the breath.
- Reduced motion never starts the intro. Enabling it mid-reveal finishes directly at the fitted camera. Existing reduced-motion rules for user-driven camera movement remain unchanged.
- `sessionStorage['atlas-intro-seen']` records the first real presentation. In-memory state remains available if storage is blocked. A fresh reload still initializes the default Destroyer selection without replaying the reveal; later same-page presentations retain user selection.
- The atlas-side background bag-color refresh preserves an active intro. This avoids a startup refresh canceling the reveal. Actual user input still cancels before filtering. No bag files were edited.

## Proof frames

The browser test freezes only RAF advancement for these captures and calls the production `stepCamera()` at the indicated times. It also measures an uninterrupted reveal separately in real time. The end frames allow normal renderer settling after the camera lands.

| View | Start | Mid-reveal | End |
| --- | --- | --- | --- |
| Desktop, 1440 × 900 | 0ms, 2.8× | 400ms | 1,580ms, 1× |
| Phone, 390 × 844 | 0ms, 4× | 400ms | 1,580ms, 1× |

### Desktop

Start:

![Desktop start on the Destroyer cluster](assets/atlas-intro-reveal/desktop-start.png)

Mid-reveal:

![Desktop pull-back at 400ms](assets/atlas-intro-reveal/desktop-mid.png)

End:

![Desktop complete atlas with breathing room](assets/atlas-intro-reveal/desktop-end.png)

### Phone

Start:

![Phone start on the Destroyer cluster](assets/atlas-intro-reveal/phone-start.png)

Mid-reveal:

![Phone pull-back at 400ms](assets/atlas-intro-reveal/phone-mid.png)

End:

![Phone complete atlas with breathing room](assets/atlas-intro-reveal/phone-end.png)

## Verification

`npm run test:atlas:intro` runs camera tests and the browser proof harness. It covers actual-extent fitting at desktop and phone sizes, exact completion/no-animation camera equality, initial framing, interruption, reduced motion, session return/reload, delayed first paint and refresh-rate independence. The browser compares all final marker-art and label rectangles, transforms and canvas tier states against a direct no-animation opening; the resting geometry matches exactly. It also checks that no visible marker art or readable label crosses the map edges.

The input checks exercise actual pointer, wheel, touch/pinch and keyboard event handlers, including zoom controls and an otherwise unhandled key. They verify that a catch clears the intro and that normal handlers retain camera ownership.

The 3D browser suite's LOD-threshold setup now explicitly approaches from below. An opening pull-back can already have populated mid-LOD history; the test still uses every original threshold, hysteresis and rendering assertion.

The uninterrupted browser capture measured **1,583.3ms desktop / 1,583.2ms phone**. Full frame state and clipping results are in [measurements.json](assets/atlas-intro-reveal/measurements.json).

### First-frame measurements

Five alternating pairs used fresh browser contexts and the local static server. The old-opening comparison restores the two original opening call sites in the same served build. Phone uses 4× CPU throttling. These are navigation-to-first-Atlas-frame medians, including the first switch from Directory on phone; they are local diagnostics, not production network timings.

| Device | Old opening | Reveal | Difference |
| --- | ---: | ---: | ---: |
| Desktop | 336.7ms | 326.7ms | −10.0ms |
| Phone, 4× CPU | 2,278.9ms | 2,424.3ms | +145.4ms |

The phone now draws the requested close-up before retreating; its extra first-frame work is measurable. Input listeners are installed before catalog loading and there is no input lock or timer delaying presentation. Every sample is retained in [load-measurements.json](assets/atlas-intro-reveal/load-measurements.json); the navigation-to-frame values above are the comparison metric.

### Performance gate: failed locally, unchanged

The full `test:atlas:3d:perf` gate ran with its original 7 desktop / 3 phone warm repetitions, 241 flight frames and 120 overview frames per repetition. No gate code, thresholds, allowances or repetition defaults changed.

| Isolated reveal run | 2D median | 3D median | Allowed | Result |
| --- | ---: | ---: | ---: | --- |
| Desktop flight p95 | 4.1ms | 4.9ms | 6.215ms | Pass |
| Desktop 1× p95 | 0.9ms | 1.4ms | 2.535ms | Pass |
| Desktop long tasks | 0 | 0 | 1 | Pass |
| Phone flight p95 | 17.4ms | 17.5ms | 23.01ms | Pass |
| Phone 1× p95 | 3.0ms | 3.7ms | 6.45ms | Pass |
| Phone long tasks | 7 | 9 | 8 | **Fail** |

The same gate with the old opening restored also failed the phone long-task check: 2D median 7, 3D median 10, allowance 8; paired excess 3. All its frame-time checks passed. Thus this machine did not establish a green gate even without the reveal, and the failure cannot be attributed solely to the reveal.

Reports retain every cold and warm repetition: [isolated reveal](assets/atlas-intro-reveal/perf-isolated.json), [old opening](assets/atlas-intro-reveal/perf-old-opening.json). The earlier [contended run](assets/atlas-intro-reveal/perf-contended.json) overlapped a unit-test run and is retained for transparency, not used as the causal comparison.

### Remaining pixel discrepancy

Exact camera coordinates, all marker art and label rectangles/transforms, and canvas tier/size/position/fade/LOD states match the direct no-animation opening. **Raw resting-frame PNG equality does not pass on either desktop or phone.** The browser harness retains that failing assertion and saves both frames; it does not silently replace it with a geometry-only check. The comparison frames are [desktop completed](assets/atlas-intro-reveal/desktop-pixel-finished.png), [desktop direct](assets/atlas-intro-reveal/desktop-pixel-direct.png), [phone completed](assets/atlas-intro-reveal/phone-pixel-finished.png), and [phone direct](assets/atlas-intro-reveal/phone-pixel-direct.png).

The existing organic-layout browser suite passed its layout, clearance, coverage, cap and neighborhood checks, then failed `desktop full: same pixels`. Its old-opening diagnostic baseline passed all six checks, including fresh-page pixel determinism. This remains a reveal-related acceptance issue.

Review identified different canvas and DOM paint orders retained from camera history; canvas shadow rectangles can overlap even when disc/label footprints do not. Diagnostics that restored ordering and preserved entry state did not establish full PNG equality. No speculative change to marker rendering, labels, positions or disc-art modules was shipped.

### Other checks

- All **236 non-browser unit tests** run together passed, including seven focused intro camera tests.
- The 3D browser suite passed 11 checks, including tiers, full renders, themes, filters, selection, WebGL fallback and LOD hysteresis.
- The readable/clickable persistence suite passed 13 checks, including cursor anchoring, the 9× cap, pointer holds and fading pins.
- The speed-band browser suite checked 991 drawn discs without a position regression.
- The Apple camera/design browser suite passed 16 checks, including pan/pinch, momentum, catches, ordinary reduced-motion behavior and theme transitions.
- Repository lint reported 40 errors and 1,548 warnings in its full run. Comparing changed files against `main` found no added diagnostics; [comparison](assets/atlas-intro-reveal/lint-comparison.json). Existing lint errors were left untouched.
- Read-only review caught and verified the session-reload selection fix. The strict pixel issue and local perf gate are explicitly unresolved.

Further fix attempts stopped under the Map QA skill's two-strikes rule. This commit is reviewable work with recorded acceptance failures, not a claim that every requested gate is green.

## Feel check after a future deployment

No deployment was performed. On a real phone and desktop, cold-open a new session, confirm the close-up and breath, then grab the atlas during the retreat. It should be the player's immediately. Phone must still open in Directory. This local browser proof does not replace Freddy's real-device feel check.

## Takeover: resting-frame pixel equality (Opus)

Opus continued on the same branch with new commits on top of Sol's `3c5613a`; Sol's write-up above is unchanged.

The reveal itself is unchanged:

- Same spring, timing and easing, re-measured at **1,583.2–1,583.3 ms** on desktop and phone.
- Same tight Destroyer open, instant catch and once-per-session behavior.
- Reduced motion still opens at the end framing.

Zoom limits, the three tiers, label rules, marker persistence and all photo code are untouched.

### Characterization: what differed

**Method.** Each check takes a `#map` PNG screenshot, decodes it to raw RGBA and counts every pixel with any channel difference. The diff is split by layer:

- the page as shown;
- the canvas alone (`toDataURL`);
- the DOM alone (canvas hidden);
- everything except the marker layer.

These numbers use Sol's original GPU flags, which on this Mac fall back to software WebGL and the 2D disc art. Full numbers are in [layer-diff.json](assets/atlas-intro-reveal/takeover/layer-diff.json).

| Before the fix | Desktop 1440 × 900 | Phone 390 × 844 |
| --- | ---: | ---: |
| Whole map | 168,608–169,918 px, max Δ 214 | 16,356 px, max Δ 80 |
| Canvas only | 9,015 px, max Δ 255 | 0 |
| DOM only | 162,693–164,000 px, max Δ 159 | 16,339 px, max Δ 80 |
| Two direct opens, same build | 0 | 0 |

The following were ruled out, because they were identical between the completed reveal and the direct open:

- the camera (`zoom 1, x 0, y 0` bit for bit);
- the canvas buffer;
- the sets of markers and small discs and their tier, LOD and strength records;
- the group lists (`mapClusters` and `groupCache.gaps` order).

No animation residual remained on the camera. The delta came from history kept in the layers under the camera.

**1. Paint order is first-appearance order.** `renderMarkers` appends a marker's node when its group first appears, and the node persists. `drawGaps` iterates `gapFade`, a `Map` in insertion order.

- A direct open builds both at the rest camera, so each order equals the group list's order, which was verified.
- The reveal builds both at 2.8× or 4× and adds to them as it pulls back.
  - Desktop: the same 24 markers and 53 small discs, in a different order.
  - Phone: the same 6 markers, with two swapped.
- Overlapping drop shadows and art therefore stack differently.

As an experiment, the reveal's nodes and entries were moved into the direct order with nothing else changed. The desktop DOM delta fell to **0**. See the [desktop mask](assets/atlas-intro-reveal/takeover/before-desktop-diff-mask.png) and [phone mask](assets/atlas-intro-reveal/takeover/before-phone-diff-mask.png). This is the ordering Sol identified; it is necessary but not sufficient.

**2. Small-name bitmaps are cached in whatever face had loaded.** After the reorder, the desktop canvas still differed by 9,015 px, all on canvas-drawn small-disc names. See the [mask](assets/atlas-intro-reveal/takeover/before-desktop-canvas-after-reorder-mask.png) and the [crop: reveal | direct | diff](assets/atlas-intro-reveal/takeover/before-desktop-stale-name-crop.png).

`gapName()` caches each bitmap under its text, font string, width, theme and dpr. `remeasureLabels` re-measures footprints whenever a font finishes loading but never invalidated these bitmaps. Logging each bitmap's creation against `document.fonts.check()` showed:

- Names drawn before DM Sans 600 finished loading were rasterized in the fallback face and kept for good. Up to 10 of 19 bitmaps differed under identical keys; one differed in width ("Insanity", 61 px vs 60 px).
- Which names land in that window depends on camera history.
- The direct open itself rested with **18 of 19** names in the fallback face. The static open's pixels depended on font timing, and Sol's direct proof frames show this.

**3. The browser's raster keeps its first frames.** Once causes 1 and 2 were fixed, the reduced-motion open differed from the session-seen open.

- With 2D art: 2 px at Δ 1, deterministic. Rebuilding that page's markers at rest cleared it. Under reduced motion, art arrives without the arrive-fade, so the first frames invalidate differently.
- With GPU 3D art (`--enable-gpu`, the path the perf gate and real devices use):
  - Settle without re-insert: 2 channel values at Δ 1 in reduced-motion opens in 6 of 6 fresh browsers, and once in 6 in reveal opens. A second direct open was 0 of 6.
  - Every DOM- and CSS-observable state was identical: computed styles, markup, art bitmaps and the composited layer tree.
  - Media flips, marker rebuilds and art-canvas replacement left the residue in place. A viewport resize cycle cleared it, and so did re-inserting `#map` in place.
  - The residue lives in the map element's own composited raster. Evidence: [gpu-raster-residue.json](assets/atlas-intro-reveal/takeover/gpu-raster-residue.json).

### Fix: every presentation's rest is drawn from nothing

The working hypothesis held and was extended. The reveal already ends on the static open's camera, through the same fit computation. Exactness also needs the layers under the camera to keep nothing of how they got there.

**`settleAtlas()`** (`public/atlas-map.js`) runs once for every shared-Atlas presentation:

- the reveal's landing;
- a session-seen or reduced-motion open;
- a return to the map.

It waits until the presentation is still and fully loaded:

- art not loading, fonts loaded;
- no regroup, retirement or pending art;
- no small disc or name mid-fade;
- no `.is-new`, `.is-retiring` or `.is-arriving` marker.

Then, in one task, it:

- drops the marker nodes, `gapFade`, the grouping (`groupCache`/`groupContext`) and the label-density hysteresis flag;
- moves `#map` in place, so it is rasterized afresh (its canvas keeps its bitmap, and focus is restored);
- draws the camera from nothing, which is exactly what an open's first frame does.

Paint order, held LODs, grouping levels and raster state are then those of a first frame at that camera, by construction rather than by tuning. Nothing visibly changes except which of two overlapping shadows sits on top.

**Limits on the settle:**

- It never runs under the pointer, a pin or keyboard focus on a disc; the player is there, and `pointerleave` looks again.
- Any input (the intro's capture handler) cancels it, and so does any later camera motion, programmatic or not. It is one-shot.
- Cost, measured as a fresh rebuild at rest: 3–16 ms on desktop, 10–34 ms on a 4×-throttled phone. That is under the 50 ms long-task threshold and the same work a direct open does on its first frame.

**Small names follow font loads.** `remeasureLabels` now advances `gapNameFonts`, and each cached name records the value it was drawn under.

- A stale name stands in until it is redrawn within the existing per-frame budget, and the frame asks for another draw meanwhile, so names never blink.
- This completes the existing re-measure-on-font-load contract. Which names show, and how strongly, is unchanged.
- Visible consequence: canvas small names now rest in DM Sans in every open, not the fallback face.

### Proof

**Comparison method.** Sol's harness, `tests/atlas-intro-reveal-browser.mjs`, compares raw PNG bytes (`Buffer.equals`) of `#map` element screenshots at dpr 1. Byte equality implies pixel equality. Extensions:

- `settle()` waits for the presentation's settle, and each of the three opens must settle exactly once.
- The reduced-motion open's PNG must equal the session-seen open's, alongside the reveal's. All resting frames are saved.
- GPU flags follow the perf gate's convention: D3D11 on Windows, `--enable-gpu` elsewhere, `BAG3D_CHROMIUM_ARGS` to override. On this Mac, Sol's hard-coded D3D11 flags never reached the 3D art. The report records the art state.

The harness was run with both flag sets ([harness-runs.json](assets/atlas-intro-reveal/takeover/harness-runs.json)):

| After the fix | Desktop | Phone |
| --- | --- | --- |
| Reveal vs session-seen open, 2D art (Sol's flags) | identical bytes | identical bytes |
| Reduced motion vs session-seen open, 2D art | identical bytes | identical bytes |
| Reveal vs session-seen open, GPU 3D art | identical bytes | identical bytes |
| Reduced motion vs session-seen open, GPU 3D art | identical bytes | identical bytes |
| Fresh-browser repeats, GPU 3D: reveal / reduced / direct vs direct | 0 / 0 / 0 in 6 rounds | 0 / 0 / 0 in 3 rounds |

Before frames are Sol's failing pairs, retained:

- [desktop completed](assets/atlas-intro-reveal/desktop-pixel-finished.png) / [desktop direct](assets/atlas-intro-reveal/desktop-pixel-direct.png)
- [phone completed](assets/atlas-intro-reveal/phone-pixel-finished.png) / [phone direct](assets/atlas-intro-reveal/phone-pixel-direct.png)

After frames, GPU 3D art, byte-identical across each row:

| | Reveal, settled | Session-seen open | Reduced motion |
| --- | --- | --- | --- |
| Desktop | [reveal](assets/atlas-intro-reveal/takeover/desktop-rest-reveal.png) | [direct](assets/atlas-intro-reveal/takeover/desktop-rest-direct.png) | [reduced](assets/atlas-intro-reveal/takeover/desktop-rest-reduced.png) |
| Phone | [reveal](assets/atlas-intro-reveal/takeover/phone-rest-reveal.png) | [direct](assets/atlas-intro-reveal/takeover/phone-rest-direct.png) | [reduced](assets/atlas-intro-reveal/takeover/phone-rest-reduced.png) |

The start, mid and end proof frames above were regenerated by the same GPU run, so they now show the 3D art.

### Other checks

All runs below are on this branch's final code.

**Unit tests.** All 252 non-browser tests pass: `node --test` over `tests/*.mjs`, excluding `*-browser`, the perf gate, and the three dev-server suites `motion`, `palette` and `redesign`. Sol's commit gives the same 252/252. Sol's 236 is this set minus 16 single-test script files, so all 236 are green. That includes the 7 intro camera tests and the 6 Apple camera tests.

**Browser suites:**

- **Reveal:** green under both GPU flag sets, three consecutive passes, including one under another agent's load.
- **3D:** 11 checks passed.
- **Readable/clickable persistence:** 13 checks passed.
- **Speed band:** 991 drawn discs stay in their band.
- **Depth:** 8 checks passed.
- **Apple camera/design:** 16 checks passed. One run under heavy machine load failed its 30 ms theme-fallback backdrop timing check. That check involves no map code, and theme clicks cancel any pending settle. It passed 2/2 on immediate rerun, and also passed 2/2 on Sol's commit.
- **Organic layout:** now **6/6**, including `desktop full: same pixels`, which Sol had open. Its determinism check opens two fresh pages and immediately sets `zoom=1` and filters programmatically. Under the reveal, that cut the intro at whatever point each page had reached, so the two pages started from different camera histories. `open()` now waits for the presentation's rest (`!atlasIntro&&!atlasSettling`) before acting. The strict PNG assertion is unchanged.

**Perf gate: not rerun.** Throughout this session another agent's browser tests were running in a separate checkout (`tests/halo-plastic-browser.mjs` with a wrangler dev server), at load averages of 3–6. That is not the quiet window the gate needs, and nothing in it was loosened. The change adds one 3–34 ms task per presentation, at rest and below the long-task threshold. The gate compares 3D against 2D inside one build, so the opening affects both arms. Sol's finding stands as an environment result for Freddy's own quiet rerun, with the final build and the old opening side by side.

**Graphify.** This branch predates the Graphify adoption (no `graphify-out/`, no CLI installed here), so there was no graph to refresh.

### Review notes for Freddy

- The settle covers every shared-Atlas presentation, not only the reveal. That is what makes the reduced-motion and session-seen opens equal to each other, not just to the reveal.
- On desktop, with the mouse resting over the map, the settle waits for the pointer to leave. Until then the rest keeps the reveal's paint order, which differs only where shadows overlap. Moving or clicking takes the map as usual and cancels the settle.
- Moving `#map` in place is the heaviest part of the settle. It happens once per presentation, at rest, with no pointer, pin or disc focus. Watch for it in the real-device feel check: when the reveal lands and about a beat later, nothing should visibly change.

## Merge with main (`f271f00`) and its repair audit

The branch forked at `38a8c4a`, before PR #10. Main (`f271f00`, 58 commits) was merged in at `13a2c17`. Graphify was refreshed on the merged tree as its own commit, `c04e6eb` (`graphify update .`, AST-only, 0.9.91; 2,627 nodes, 5,482 edges). Nothing was pushed.

### Resolution

- **`package.json`** was the only textual conflict: two new scripts on adjacent lines. Both are kept (`test:atlas:intro` from this branch, `test:atlas:stamps` from main).
- **`graphify-out/`** takes main's files as they were, before the refresh.
- **`public/atlas-map.js`** auto-merged. To check that resolution, the file was rebuilt as main's `f271f00` file with this branch's whole diff (`38a8c4a..d784a17`, i.e. `3c5613a` and `d784a17`) re-applied. All 14 hunks applied cleanly (two at a 6-line offset). The rebuild is **byte-identical** to the merge result (SHA-1 `4ec931e5…`). It carries the presentation layer (`presentAtlas`, `catchAtlasIntro`, `settleAtlas`, `featuredDisc`) and the font-load label-cache invalidation (`gapNameFonts`, `gapsMoving`), together with all of main's changes. There was nothing to repair.
- In `tests/atlas-3d-browser.mjs` and `tests/atlas-organic-browser.mjs`, every line either side changed is present in the merged file. The repo has no conflict markers anywhere.

### Cross-file audit

These are the couplings this branch adds across files. All of them are satisfied in the merged tree:

| Caller | Uses | Defined in |
| --- | --- | --- |
| `app.js` `load()`, `setView()` | `presentAtlas()` | `atlas-map.js` |
| `app.js` `filter()` | `atlasIntro` (global read) | `atlas-map.js` |
| `atlas-map.js` `presentAtlas()` | `AtlasLayout.fit`, `AtlasLayout.extent` | `atlas-layout.js` |
| `atlas-map.js` `presentAtlas()` | `AtlasMotion.token` | `atlas-motion.js` |

The other 18 `app.js` calls into `atlas-map.js` already existed before the branch and are still defined. The branch removes or renames nothing that main's callers use. Note that a call-only scan misses `atlasIntro`, which is a variable read, not a call.

### The stamps canary: a test baseline, not the merge

`test:atlas:stamps` passes on main and fails on the merged tree. Its "before" phase serves `atlas-map.js` and `disc3d/atlas-art.mjs` from `6e53bc8` together with the **current** `app.js`. On the merged tree that `app.js` calls `presentAtlas()` and reads `atlasIntro`, and the old file defines neither. The page throws `presentAtlas is not defined`, the catalog never loads, and `waitForFunction(mapArt.state==='ready'&&discs.length>0)` times out after 30 s. A scratch copy of the test was run with only its baseline file extended by `let atlasIntro=null;function presentAtlas(){focusFeatured();}`, which reproduces main's old `load()` behaviour. That copy **passed 2/2**. The fix belongs in the test's baseline (that shim, or serving `6e53bc8`'s `app.js` alongside); product code does not need to change. **Not applied yet.**

### Gates on the merged tree

| Gate | Result |
| --- | --- |
| Unit set (`node --test` over non-browser `tests/*.mjs`, excluding perf, `motion`, `palette`, `redesign`) | 286/286. `prompt-4-stability-fixture.mjs` needs its gitignored `outputs/prompt-4/` folder to exist. |
| Organic (strict `desktop full: same pixels`) | Pass, 6/6, twice |
| Depth | 8/8; the process then hangs in teardown (test file unchanged by either side) |
| 3D / persist / speed band | 11/11 / 13/13 / 991 discs in band |
| Apple design | 16/16 on the merged tree; also timed out once on main |
| Photo-edge atlas | Fails identically on main on this Mac (WebGL context creation) |
| Stamps | Fails on the merged tree only (baseline above) |
| **Intro strict (0 px)** | **Fails 0/7.** See below. |

**Intro strict, before and after the merge**, measured interleaved on the same quiet Mac with `--enable-gpu`:

- Pre-merge `d784a17`: **3/7** pass. Every failure is desktop reveal vs session-seen open, **8 px at Δ1**, in the same bounding box (402,533–1080,705). Phone was 0 px in all runs. The flake predates the merge.
- Merged: **0/7**. The same desktop 8 px appears in 4 of 6 measured runs. In addition there is a **new phone diff in every run: 1 px at Δ1, at (110,560)**. It falls on bare background beside a grid line (G 243 vs 244), not on any disc art or label. It shows in reduced motion vs session-seen every time, and in reveal vs session-seen once. It belongs to the same class as the raster residue described above; something in main's changes triggers it on phone. **Not investigated, and the assertion is unchanged.**

**Perf gate: not run.** It needs a genuinely quiet window on the merged tree before this branch goes toward a PR.

## After the merge: the two strict residues, a settle patch tried and reverted, and the perf gate

All measurements are on the merged tree, with `--enable-gpu`, a fresh browser per run, and the strict assertion unchanged. "Reveal", "reduced" and "direct" are the three resting `#map` frames the harness compares. The direct frame is the session-seen open.

### Phone: 1 px, reproduces exactly

- **Every merged run shows it, and no pre-merge run does.** It is the same pixel, (110,560), every time, at Δ1 (green 243 vs 244). It appeared in 17 of 17 unpatched harness runs, always reduced vs direct and in some runs also reveal vs direct. It appeared in 0 of 7 runs on `d784a17`.
- **It belongs to `#map`'s own radial-gradient background**, which can end up drawn as either of two values. The map canvas is transparent at that point. Hiding the markers changes nothing, and every computed style on every covering layer is identical between the opens.
  - The direct open rests on 244. Any repaint of `#map` (an injected style) turns it into 243.
  - Forcing `#map` onto its own layer (`will-change: transform`) gives 244 in every open.
  - Re-inserting `#map`, which is what the settle does, does not reliably change it.
- **The tab transitions trigger it.** Disabling only the CSS transitions on `#mapTab`, `#listTab` and `#coachButton` removes the pixel (0 of 3 runs, against 3 of 3 for the control). None of those buttons overlaps the pixel.
- **Main's stamp path is what exposes it.** Serving the pre-merge version of main's `atlas-map.js` changes, or of the disc3d/art modules, removes the pixel in 0 of 6 runs each. The pre-merge `data.json` reduces it to 2 of 6. Stamp-ready events fire 30–60 ms *before* the settle, and blocking the stamp PNGs does not help.
- **The phone settle now happens later.** Pre-merge it ran about 82–100 ms after the map-tab tap, before those transitions had started. Merged, it runs about 150–180 ms after the tap, while they are running.

**Patch tried and reverted.** `settleAtlas()` was made to also wait until no `CSSTransition` was running, keeping every existing guard. It worked as written: the settle moved to about 350 ms after the tap, with nothing running. **The pixel stayed in 3 of 3 runs.** So the difference is laid down while the tab transitions run, and a later re-insert does not clear it. Waiting for the transitions is the wrong lever. The patch was not kept; nothing in the product changed.

### Desktop: 8 px, comes and goes

- **When present, it is always the same 8 isolated single pixels** (8 clusters of size 1, every one Δ1) at the same coordinates with the same values, scattered across x 402–1080, y 533–705. That is the isolated Δ1 raster-residue signature, not a coherent region.
- **Only the reveal frame changes.** The direct and reduced desktop frames are byte-identical in every run of each tree, and the reveal frame is either that same frame or one stable alternative.
- **Distribution:**

| Tree | Runs with the 8 px |
| --- | --- |
| Pre-merge `d784a17`, morning | 4 of 7 |
| Merged, morning | 4 of 6 |
| Merged, evening | 0 of 11 |

The frequency moves with the session, not the code, and the merge doesn't change it. It is **the residue class, so no fix was attempted.**

### Stamps canary

The shim in [the merge section](#the-stamps-canary-a-test-baseline-not-the-merge) is still pending approval and **not applied**.

### Perf gate: qualifying pass on `801eda3`

The gate ran on 2026-10-18 at 22:00. The lid was open, the Mac was on AC, and the run was wrapped in `caffeinate -dims` because system sleep is set to 1 minute. Before the start there were 5 consecutive quiet samples, with Spotlight/Photos at 0% and total CPU at 19–44%. During the run, samples arrived every 30 s with no gaps, and Spotlight/Photos stayed at 0–0.1%. Measuring took 156 s. The earlier 42-minute attempt was mostly the Mac sleeping and does not count.

Defaults: 7 desktop / 3 phone repetitions. Times are p95 frame times in ms.

| Device | Flight p95, 2D → 3D (limit) | Still-view p95, 2D → 3D (limit) | Long tasks, 2D / 3D |
| --- | --- | --- | --- |
| Desktop | 1.6 → 2.2 (3.34) | 1.8 → 1.9 (3.57) | 0 / 0 |
| Phone | 2.9 → 4.2 (6.33) | 0.6 → 0.6 (3.69) | 0 / 0 |

Every paired median excess is negative. The settle patch was reverted, so this pass stands for the current tree.

## Stamps shim applied; the settle repaints the map's background

### Stamps canary: green

The shim from [the merge section](#the-stamps-canary-a-test-baseline-not-the-merge) was approved and applied as shown, in `fd1b999`. The applied file is byte-identical to the scratch copy that passed 2/2. `npm run test:atlas:stamps` now passes (2/2 unit, browser PASS, 7–8 s). The "after" phase still tests the merged code; only the "before" phase's old `atlas-map.js` gains `atlasIntro` and `presentAtlas()`.

### Phone 1 px: fixed by a real repaint in `settleAtlas()`

**Why the re-insert was not enough.** Moving `#map` in place produces the same paint. In a probe, it re-rasterized the background in some runs and not in others. That fits the browser keeping the existing background tiles when the paint output is unchanged. A real computed-style change on `#map` did repaint it every time.

**The change** (`6c5824e`). Right after the re-insert, `settleAtlas()` flips `#map`'s `background-clip` between its default (`border-box`) and `padding-box`. The two draw identically because `#map` has no border (computed 0px on every side). The flip is a real style change, so the background is painted afresh. Every earlier guard is unchanged and still runs before it: the cancel on input or camera motion; never under a resting pointer, a pin, keyboard focus or a fade; and the wait for art, fonts and regroups. In a probe on the session-seen phone open, the flip turned the frame byte-identical to the reduced open's (0 px), and so was every frame captured after it.

**Proof on the fixed tree:**

| Check | Result |
| --- | --- |
| Intro strict, 3 fresh browsers: desktop reveal/reduced vs direct | 0 / 0 px in every run |
| Intro strict, 3 fresh browsers: phone reveal/reduced vs direct | 0 / 0 px in every run |
| Organic strict | 6/6, including the determinism pixel check |
| ESLint, changed files | 0 errors; the same 3 warnings as before |

**No flicker or flash from the change.** A probe held each presentation's settle until the map was otherwise at rest, captured that frame, released the settle, and captured the next 4 frames. It covered reveal, session-seen and reduced opens on phone and desktop. In every case the 4 frames after the settle were identical to each other, so there was no transient frame. With the repaint, the settled frame differs from the held frame by 0–6 px at Δ1 for session-seen and reduced. Those are the residue pixels being corrected.

**Existing landing nudge, unchanged by this fix.** On the reveal opens, the settle changes 3,252 px (phone, max Δ62) and about 69,000 px (desktop, max Δ196). The diff mask shows marker-label glyph edges, moved by about a pixel as the labels are redrawn at rest, plus the faint shadow rings around the discs. Side by side the frames look the same. The unpatched settle gives the same numbers (3,252 / 69,012 px), so this is the existing "rest drawn from nothing" rebuild, not the repaint. It is the moment the review notes above already flag for the real-device feel check.

### Final batch on `6c5824e`

| Gate | Result |
| --- | --- |
| `test:atlas:intro` (strict) | 7/7 unit; browser suite green; pixel-equal on desktop and phone |
| `test:atlas:organic` (strict) | 6/6 |
| Unit set (non-browser `tests/*.mjs`, excluding perf, `motion`, `palette`, `redesign`) | 286/286 |
| `test:atlas:stamps` | Pass |
| Perf gate | **Pending.** The settle changed, so the gate has to pass again on this tree. At the time of the batch the Mac was on battery, not the AC power the 22:00 qualifying run used, so the run waits for AC power, lid open and idle indexing. |
