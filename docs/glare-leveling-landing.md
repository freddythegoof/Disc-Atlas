# Landing the glare pass and stamp levelling on main

Branch `codex/glare-leveling-land`. It was first cut from `origin/main` at `a2fc0ba` (PR #13 merged) on October 16, 2026. On **October 17** it was rebased onto **`466c92e`** (PR #21 merged). Two commits port the work Freddy accepted on October 15 from `codex/photo-glare-orientation`: `22246e1` (levelling) and `69adbbb` (glare), in that order. The reference branch was not merged or rebased. Its tip `30ccc69` merges `codex/photo-rim-color` in, and that merge was skipped.

**Every acceptance suite ran on the rebased branch. Nothing is NOT RUN.** That includes the WebKit editor suites: `photo-compression`, `photo-editor-contract` and `photo-source-chooser` ran on Chromium and on WebKit 2359. The full regression passed on the first run. **The perf gate passed both runs on a quiet machine.** The gate ran at its default settings with margins unchanged. The first three branch runs (fail, fail, pass) happened while an unrelated `graphify query` process had been using about 1.4 cores since 06:55. Clean `main` failed and passed the same way during that time. After that process was stopped, the gate ran four more times, alternating the branch and clean `main` (`466c92e`). The branch passed 2 of 2. Clean main passed 1 of 2: its second run failed on phone flight p95 and long tasks. The port does not touch the Atlas render path, so these failures are the gate's own noise on this machine, not a regression. Every run is listed under [Refresh onto `466c92e`](#refresh-onto-466c92e-october-17).

| Commit | What |
| --- | --- |
| `d65577e` Add stamp levelling tools to the photo aligner | port of `22246e1` (was `58ad1fe` before the rebase) |
| `491fc01` Add glare softening pass behind a kill switch | port of `69adbbb` (+ the accepted-status doc text of `5aa4008`) (was `82cd66f`) |
| this write-up + Graphify refresh | |

## Refresh onto `466c92e` (October 17)

Main moved on by PRs #14–#21 after the first port. Those PRs brought Discraft stamp sweeps, stamp scale, Graphify adoption and refresh, Atlas stamps, the All Discs gallery, and compare/viewer polish. The rebase applied without conflicts. The kept pre-rebase tip is `backup/glare-leveling-land-pre-rebase` (`ffc4301`).

- **Ported surfaces were unaffected.** Main did not touch `public/disc-photo.mjs` or `public/disc-albedo.mjs` between `a2fc0ba` and `466c92e`, and after the rebase the port's versions of both are byte-identical to the pre-rebase port. `public/my-bag.css` and `package.json` gained main's All Discs rules and the `test:bag:album` and `test:atlas:stamps` scripts. These sit beside the level row and `test:photo-level`, with no overlap.
- **`public/bag3d/viewer.mjs` changed on main** (19 lines, PR #19's gallery). The floating-roll check was rerun against it: still **−0.02°**, so the hunk stays unported.
- **One test pin moved.** The levelling suite's 0° parity reference went from `a2fc0ba` to `466c92e`, so "current main's pipeline" means today's main.
- **Graphify** was refreshed with `graphify update .` (AST-only) on top of PR #21's refresh: 2,493 nodes, 5,059 edges, 153 communities. `softenGlare`, `levelCanvas` and the new tests are in the graph. `.env*` and `.dev.vars*` stay in `.graphifyignore`.
- **The suites were rerun on the rebased code** (October 17, RTX 3070 desktop, Playwright 1.63 with Chromium 1243 and WebKit 2359). The figures in the two tables below were all reproduced exactly, except the GPU-rendered A/B JPEGs (see Part 1) and timings. The regenerated proof images were restored from git, not committed. Midway through, `origin/main` moved from `58cf748` to `466c92e`. PR #21 touched only `docs/graphify-adoption.md` and `graphify-out/`, so the suites below cover `466c92e`'s code. `test:photo-level` was run again after the second rebase.

| Suite (October 17, rebased) | Result |
| --- | --- |
| `test:photo-level` | pass. 0° export byte-identical to `466c92e` (pixels, colour, rim, WebP, four framings). Floating disc on main's viewer −0.02° (bug viewer `5b50637` −5.32°) |
| `tests/photo-glare-ab-browser.mjs` | pass. `results.json` identical apart from timings |
| `test:photo-rim` | pass |
| `test:photo-textures` | **pass, the whole chain, node half included.** Main's PR #14–#20 change to `tests/photo-editor-races.mjs` fixed the two thumbnail tests that failed on October 16, so the Worker half no longer has to run on its own. Re-level through the Worker: −3.00° → −0.03°, 27,628 B, colour `#e1733c` kept, rim `#eb6d37` → `#eb6e36` |
| `node --test` albedo / math / textures / level-measure | pass |
| Kill switch vs `466c92e`'s `disc-albedo.mjs` (6 glare cases × 256/512/1024) | **18/18 byte-identical**, with `softenGlare:false` and with `SOFTEN_GLARE=false` in a copy. Pixels, plate colour and rim all match. With the pass on, plate and rim equal main's in 18/18 |
| `test:disc3d`, `test:bag`, `test:photo-edge`, `test:photo-edge:atlas` | pass |
| `test:photo-phone` | pass. Chromium + WebKit 2359 (compression, gestures, editor contract exact baseline on both engines, source chooser) |
| `test:my-map`, `test:appearance`, `test:atlas:3d` | pass |
| `test:atlas:stamps`, `test:bag:album` (new on main) | pass |
| `test:bag:browser`, `:overmold`, `:collections`, `:staging`, `:pulled-sizing`, `:pulled-quality`, `:demo`, `:popup`, `:spin`, `:tips`, `:3d` | pass, all on the first run (no `bag:3d` timeout) |
| `test:atlas:3d:perf` (default settings, margins not loosened) | **quiet machine: pass, pass.** Loaded machine before that: fail, fail, pass. Clean main: loaded fail, pass; quiet pass, fail (details below) |
| `tests/discraft-stamps-browser.mjs` | not rerun. As on October 16, it fails by construction on any branch cut from a main that already has the stamps |

**Perf gate, every run** (default settings, margins never loosened). Desktop passed all nine runs. Phone 1x p95 passed all nine. Each failure was phone "long tasks" (the median count, 3D vs 2D), and in one run phone flight p95 as well:

| Run | Machine | Code | Phone long tasks 2D → 3D (limit) | Phone flight p95 2D / 3D (limit) | Verdict |
| --- | --- | --- | --- | --- | --- |
| 1 | loaded | port | 14 → 17 (15) | 24.0 / 26.5 ms (30.6) | fail |
| 2 | loaded | port | 14 → 24 (15) | 24.2 / 27.8 ms (30.8) | fail |
| 3 | loaded | port | 10 → 8 (11) | 20.6 / 21.0 ms (26.7) | pass |
| 4 | loaded | clean `main` `466c92e` | 11 → 16 (12) | 20.5 / 22.1 ms (26.6) | fail |
| 5 | loaded | clean `main` `466c92e` | 4 → 5 (5) | 13.6 / 17.5 ms (18.6) | pass |
| 6 | quiet | port | 3 → 3 (4) | 14.1 / 15.5 ms (19.2) | **pass** |
| 7 | quiet | clean `main` `466c92e` | 5 → 3 (6) | 16.8 / 15.3 ms (22.3) | pass |
| 8 | quiet | port | 0 → 1 (1) | 9.4 / 9.5 ms (13.8) | **pass** |
| 9 | quiet | clean `main` `466c92e` | 3 → 9 (4) | 14.1 / 19.7 ms (19.2) | fail |

"Loaded" means the stray `graphify query` (PID 34144, unrelated to this branch) was still running. Runs 6–9 came after it was stopped, alternating the two codebases so drift affected both equally. ChatGPT and other desktop apps stayed open throughout. Run 8 matches October 16's quiet figure (phone 2D flight p95 9.8 ms). The port does not touch the Atlas render path: neither `disc-photo.mjs`, `disc-albedo.mjs` nor the `my-bag.css` level row loads on the Atlas. Clean main fails the same gate as often as the port does, or more often. That is gate noise on this machine, not a port regression.

## What ported cleanly, what drifted

**Ported as written.** These came across hunk for hunk: `photoPoint`'s `rotate` option, the level row (nudges, readout, 0° snap), the Rotate slider, the `[`/`]` keys, the Level lines guide canvas, level-only mode (`data-mode="level"`, which leaves drag, pinch, wheel and arrows inert), Level stamp on a saved photo, the `my-bag.css` level row, `softenGlare` and `pullPush` and the `SOFTEN_GLARE` switch, plus every test and fixture. `photo-source-chooser-browser.mjs` and `photo-textures-browser.mjs` had not changed on main since `5b50637`, so their branch hunks applied as they were. Main's version of each file was kept and only the hunk was added.

**Drift 1: main's rim colour (PR #7).** Main's `disc-photo.mjs` drifted from `5b50637` by exactly one feature: the photo-matched overmold rim. `albedoCanvas` samples `rimColor` after `delightPixels`, `preparePhoto` keeps the 1024 px sample, and the editor sends it as `X-Atlas-Photo-Rim-Color`. Two places had to agree with it:

- *Levelling (commit 1).* A re-levelled overmold photo must re-measure and re-send its rim. A new `levelCanvas` resamples the saved texture and runs main's unchanged `rimColor` on it. `preparePhoto(…,{albedo:false})` uses it in place of `albedoCanvas`, and keeps the first rung's sample exactly as main does. The editor passes `rimInner` in both modes. This is the same resolution the reference branch reached in its merge commit `30ccc69`. The ported `disc-photo.mjs` differs from `22246e1`'s hunks only in those rim lines (checked by diffing the two patches).
- *Glare (commit 2).* The sampling-order invariant says the rim is measured before the pass and must never depend on it. Main sampled the rim *after* `delightPixels`, and the pass runs at the end of `delightPixels`. So `delightPixels` now takes `rimInner` and calls main's `rimColor` (body unchanged) between the baseline and `softenGlare`, just as it already did for `plateColor`. `albedoCanvas` reads that result. Nothing else changed: the `rimColor` code, `bagRimColor`, the precedence (explicit `rim_color` > `photo_rim_color` > theme) and migration `0011` are all untouched. The result is byte-identical to `30ccc69`'s `disc-albedo.mjs` and `disc-photo.mjs`.

**Drift 2: the floating-disc roll fix was already on main.** See the verdict below. The `bag3d/viewer.mjs` hunk was not ported, and that file is untouched.

**Test-side pins.** The source-chooser suite's default options gained `rotate: 0` (one line, on main's copy). The level suite's parity reference moved from `5b50637` to **`a2fc0ba`** (current main's pipeline) and gained a fourth framing that carries `rimInner`, so the rim is compared too. Its roll check now measures `5b50637`'s bag viewer (the bug) against today's (no hunk ported). The Worker test's PASS line now prints the colour and the rim before and after.

**Fences held.** The diff from `a2fc0ba` touches only `public/disc-photo.mjs`, `public/disc-albedo.mjs`, `public/my-bag.css` and `package.json` (`test:photo-level`), plus tests, fixtures and docs. `photoGeometry` and its shoulder cut are unchanged, and `photo-clean.mjs` is absent. Discraft stamps, bag sizing and animation, clay, themes, `data.json`, migrations and Worker routes are all untouched. `softenGlare` is reachable only through `albedoCanvas`, the upload and save flow. Stored textures are never re-processed. Levelling a saved photo does not de-light or soften it again. It only resamples it.

## Floating-disc roll: already fixed on main

Measured with the doc's method: a level test photo, staged out of the real bag, compared with a stamp-free blank in the same pose (`tests/photo-stamp-level-browser.mjs`).

| Bag viewer | Floating stamp angle |
| --- | --- |
| `5b50637` (what `22246e1` was written against) | **−5.32°** (bug reproduced) |
| `main` `a2fc0ba`, as it is | **−0.02°** |
| `main` `466c92e` (October 17, after PR #19 touched the viewer) | **−0.02°** |

Main landed the same `uprightFacing` turn in `23d6d3d` ("Fix pulled disc stamp roll and float drift", the PR #8 pulled-disc work). The hunk was skipped and no bag behaviour changed.

## Part 2: levelling proof

From `npm run test:photo-level`, Chromium on the RTX 3070. Results are in [photo-stamp-orientation/results.json](photo-stamp-orientation/results.json). Every figure matches the reference run to three decimals.

| Check | Reference (`22246e1`, its results.json) | Port |
| --- | --- | --- |
| Level photo: texture / top / 3/4 | −0.03° / −0.11° / −0.05° | −0.03° / −0.11° / −0.05° |
| Crooked fixture as photographed | −3.00° | −3.00° |
| …after +3.0° in the aligner: texture / top / 3/4 | −0.01° / −0.14° / −0.02° | −0.01° / −0.14° / −0.02° |
| Saved crooked, re-exported at 0° | −3.01°, PSNR 49.76 dB, max Δ 34 | −3.01°, PSNR 49.76 dB, max Δ 34 |
| Saved crooked, re-levelled +3.0°: texture / top / 3/4 | −0.03° / −0.11° / 0.00° | −0.03° / −0.11° / 0.00° |
| Through the real Worker (`test:photo-textures`) | −3.00° → −0.03°, 27,628 B | −3.00° → −0.03°, 27,628 B, colour `#e1733c` kept, rim `#eb6d37` → `#eb6e36` (≤ 4 levels/channel asserted) |
| 0° export vs **current main** `a2fc0ba`, and again vs `466c92e` on October 17 (4 framings, one with `rimInner`) | n/a (was vs `5b50637`) | pixels, plate colour, rim and WebP bytes **identical** |
| `photoPoint` `rotate:0` vs none, 1,500 points (`tests/photo-math.mjs`) | `Object.is` identical | `Object.is` identical |
| Level lines on: upload vs pipeline output | byte-identical | byte-identical |
| 0° vs the editor-contract baseline (Chromium + WebKit) | identical | identical |

The tools behave the same: three 0.1° nudges give exactly 0.3, 0° snaps back to exactly 0, `]` and Shift+`]` work, drag, wheel, arrows and ± leave the saved framing alone in level mode, re-levelling sends no new plate colour, and Adjust reopens the saved texture rather than the re-export. One correction to the ported design doc: it said PSNR 48.7 dB, but the branch's own results.json (and this run) say 49.76. The doc now says 49.8.

## Part 1: glare fixture battery

From `node tests/photo-glare-ab-browser.mjs` (1024 px textures, Chromium). [photo-glare/results.json](photo-glare/results.json) is **identical to the reference's apart from timings**. 13 of the 14 A/B images are byte-identical too. The odd one, `hotspot-3d.jpg`, is a GPU render, and those are not pixel-deterministic.

| Case | Pixels changed | Outside the glare | Brightened | Highlight luminance | Reduction | Error vs no-glare | Plate colour |
| --- | --- | --- | --- | --- | --- | --- | --- |
| no-glare | **0** | 0 | 0 | — | — | — | identical |
| fixture (`stamped-disc.webp`) | **0** | 0 | 0 | — | — | — | identical |
| white-ink-clipped | **0** (1 patch seen and refused) | 0 | 0 | — | — | — | identical |
| hotspot | 18,974 | 0 | 0 | 0.551 → 0.340 | 38% | 0.362 → 0.151 | identical |
| hotspot-on-stamp | 30,359 | 0 | 0 | 0.674 → 0.331 | 51% | 0.521 → 0.178 | identical |
| tube-streak | 45,957 | 0 | 0 | 0.803 → 0.350 | 56% | 0.613 → 0.160 | identical |
| dark-disc | 29,517 | 0 | 0 | 0.954 → 0.055 | 94% | 0.925 → 0.025 | identical |

These are the doc's numbers exactly, and the reference's pixel counts exactly. No guard case changed a pixel.

**Kill switch vs the unported baseline** (rerun on October 17 against `466c92e`, whose `disc-albedo.mjs` is unchanged from `a2fc0ba`: 18/18 identical again). Main's own `a2fc0ba` `disc-albedo.mjs` ran against the port on every glare case at 256, 512 and 1024 px (18 runs). With `softenGlare:false`, and again with `SOFTEN_GLARE` set to `false` in a copy of the file, the port matched main on all of these: the de-lit bytes, the plate colour and the rim (main's `rimColor` after `delightPixels`, the port's inside it). 0 mismatches. With the pass on, the plate and rim colours still equal main's in all 18 runs. In-repo, `tests/photo-albedo.mjs` checks `false` against the default, which follows the switch.

## Rim

- `test:photo-rim`: **pass**, on the final code. The explicit `rim_color` > `photo_rim_color` > theme precedence, the panel, pop-out and clay paths, and the non-overmold null all hold.
- **The near-white rim with a glare wedge** (the case from the glare doc) runs in `tests/photo-albedo.mjs` and was also run directly at 256 and 1024 px. The rim is `#e4e8ec` with the pass off, `#e4e8ec` with it on, and the plate is `#b45a28` both ways. The pass did act: 198,052 px were softened at 1024. Had the rim been sampled after the pass (main's old call site with the pass added), it would read **`#c4c3c7`**. That is the greying the original caught as `#c6c6c9`. The ordering is what holds it.
- Re-levelling an overmold through the Worker kept the rim within 4 levels per channel, as asserted.

**One limit to know about.** Re-levelling a saved overmold photo re-measures the rim from the *stored* texture. If that photo had a glare hotspot on its rim when first saved, the stored texture is already softened there, so the re-measured rim can come out a little darker than the first save's. The prompt asked for exactly this re-measure and re-send. Keeping the stored `photo_rim_color` on a re-level would be the alternative, if real photos ever show drift.

## Suites (October 16, first port on `a2fc0ba`)

The October 17 rerun on `466c92e` is in [Refresh onto `466c92e`](#refresh-onto-466c92e-october-17) above.

Run on this branch (`82cd66f` code) on October 16, 2026, one suite after another, on the RTX 3070 desktop with Playwright 1.63 (Chromium 1243, WebKit 2359).

| Suite | Result |
| --- | --- |
| `test:disc3d` | pass (24 node tests + browser + pop-out) |
| `test:bag` | pass (73 tests) |
| `test:photo-textures` | node half: 36/38. The 2 failures are the pre-existing thumbnail tests (below), and they stop the npm chain. **Browser half run on its own: pass** (Worker save/remove, re-level through the Worker, HEIC, panel, pop-out, clay) |
| `test:photo-rim` | pass |
| `test:photo-level` (new) | pass |
| `test:photo-edge`, `test:photo-edge:atlas` | pass. The PR #12 shoulder-cut geometry is unchanged |
| `test:photo-phone` | **pass, all four, Chromium + WebKit 2359**: `photo-compression`, `photo-gestures`, `photo-editor-contract` (exact baseline pixels, colour and WebP for three transforms, both engines), `photo-source-chooser` (default options pinned with `rotate: 0`) |
| `test:my-map`, `test:appearance` | pass |
| `test:atlas:3d` | pass |
| `test:bag:browser`, `:overmold`, `:collections`, `:staging`, `:pulled-sizing`, `:pulled-quality`, `:demo`, `:popup`, `:spin`, `:tips`, `:3d` | pass, all first time (the known `bag:3d` 30 s timeout did not recur) |
| `test:atlas:3d:perf` (perf gate, default settings, not loosened) | **pass**, first run. Median warm flight p95: desktop 3D 4.2 ms vs 2D 3.4 ms, phone 3D 9.9 ms vs 2D 9.8 ms; warm long tasks 0 except one 50 ms task in one phone 3D rep |
| `tests/discraft-stamps-browser.mjs` (PR #13's proof, not an npm suite) | fails at "Buzzz uses extracted artwork", **by construction**. Its "before" is `git merge-base main HEAD`, which is now `a2fc0ba` and already holds the stamps, so it compares main with main. It cannot pass on any branch cut from today's main. None of the six files it compares are touched here. Running it rewrites PR #13's screenshots in `docs/assets/discraft-stock-stamps/`; those were restored from git, not committed |
| `tests/photo-glare-ab-browser.mjs` | pass (the table above) |

Not part of the regression, and also run: the kill-switch comparison against `a2fc0ba` (above), and `node --test tests/photo-albedo.mjs tests/photo-math.mjs tests/photo-textures.mjs` (28/28).

**Pre-existing, not caused here (fixed on main since; passes on `466c92e`):** `tests/photo-editor-races.mjs` has two failing tests on clean `a2fc0ba` too ("photo readiness redraws only intersecting thumbnails…" and "finished thumbnails stop being observed…"). Each loads `disc3d/thumbnails.mjs` into a VM after stripping only its *first* `import` line. PR #13 (`6c96e50`) gave that file a second import, so the VM throws "Cannot use import statement outside a module". Because `test:photo-textures` chains its browser half after the node tests with `&&`, `npm run test:photo-textures` stops before the Worker suite. That suite was therefore run on its own (below). The fix is in the test, outside this port's surfaces (PR #13's area), so it is left for its own change.

**Side effect on this machine:** `playwright install webkit` (Playwright 1.63's CLI) also garbage-collected browser builds that no registered Playwright install referenced: `chromium-1248`, `chromium_headless_shell-1248` and `ffmpeg-1013`. Whatever tool used them will download them again on its next `playwright install`.

## After deploy (Freddy)

Follow the Pixel Level stamp flow in [photo-stamp-orientation.md](photo-stamp-orientation.md), "Freddy's acceptance run". Then upload one real glared photo. If it looks wrong, `SOFTEN_GLARE=false` restores the old output byte for byte, and levelling does not depend on it.
