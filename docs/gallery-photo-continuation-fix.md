# Gallery phone long tasks: the owner-photo continuation's cost

October 20, 2026. Claude Opus 5.5 (high effort), Freddy's Mac (Apple M4, macOS 15.7.3 / Darwin 24.6.0, Node 24.21.0, Playwright 1.64.1, `HeadlessChrome/156.0.8078.4`, ANGLE Metal). Branch `claude/gallery-photo-continuation-fix` off `origin/main` at **`5fb9801`** (PR #36), in its own worktree `.claude/worktrees/gallery-photo-continuation-fix`. Photo stamps had not landed on main at fire time, so this builds on main without them. While this work ran, `origin/main` moved to `d157c4a` (PR #37, photo stamps). That merge does not touch `public/disc3d/photo.mjs`. At Freddy's request it was then merged into this branch (`e5a39d0`), and the gate pair was re-run against it; see "After merging photo stamps" below. Local commits only; push, PR, merge and deploy are Freddy's.

**Result:** the Gallery gate passes on the fixed tree, and unfixed main fails it in the same window. Step 0 named the dominant slice: `reliefTexture()`'s two pixel loops, 81% of the long tasks' sampled time. On roughly one Destroyer arrival in four, V8's on-stack-replacement churn leaves those loops in a slow tier, and the continuation takes 68–70 ms instead of about 20. The fix is lever 2 only. The loops run in 128-row bands, each band a small function, with a yield between bands. It is one file (`public/disc3d/photo.mjs`). The relief bytes are identical on 25 of 25 inputs, and the continuation's ordering guarantee holds. In the paired quiet-protocol window, run in the order fixed, main, main, fixed, **phone warm long tasks were 0 / 0 / 0 and 0 / 0 / 0 on the fixed tree** (median 0, paired excess −1, PASS twice). Unfixed main had **4 / 7 / 3 and 12 / 4 / 0** (median 4 both times, paired excess +2 / +3, FAIL). The baseline, limits, margins and reps are unchanged. Every behaviour check is true on all four runs. The Atlas perf gate is green on both trees. Five browser suites fail, and all five fail identically on untouched main. After photo stamps (`d157c4a`) were merged in, the pair was re-run and repeated: the merged fix had 0 / 0 / 0 twice (PASS), and `d157c4a` had 6 / 4 / 0 and 3 / 7 / 2 (FAIL).

## Why this exists

The Gallery perf gate (`node tests/gallery-fixes-browser.mjs`) grades phone long tasks at a median of ≤1 against the Mac baseline (`before.darwin.json`, phone warm 1 / 0 / 0). The landing tree passed it on the morning of October 20 (`53d8d6e`, 1 / 3 / 1). That evening six runs across three trees failed, with medians of 4 to 11, on battery, on AC and after a reboot. Every long task was the same ≈67–73 ms owner-photo continuation class. Desktop was clean, and the behaviour checks passed. Freddy ruled that the photo-stamp branch lands on its paired evidence. This is the separate job of making the gate green robustly instead of depending on the weather.

## Step 0 — the profile, before any code

Probe: [probe.mjs.txt](assets/gallery-photo-continuation-fix/step0/probe.mjs.txt), an ignored diagnostic that copies the gate's setup. It builds the workers and starts the local Wrangler auth/D1/R2 fixture on its own port and state. It signs in through the routed Google callback and creates the same four owned copies, with `stamped-disc.webp` as the owner photo on the Destroyer. It then runs the phone context (390 × 844, DPR 2, 4× CPU, `--enable-gpu`, ANGLE Metal) through the gate's own warm-rep loop: 241 flips plus 120 stills, one cold rep, then warm reps. Three captures were taken on untouched main `5fb9801`, all in the same session as the fix.

### 1. Untraced, with slice timestamps

The probe served `photo.mjs` to its own browser context with `performance.now()` stamps between the continuation's steps ([photo.instrumented.diff](assets/gallery-photo-continuation-fix/step0/photo.instrumented.diff)). The arithmetic is unchanged, and the product file is untouched. Long tasks were **cold 17, warm 15 / 12 / 7**: a median of 12, a fail. All 34 warm long tasks were the owner-photo continuation, matched by timestamp, at 67.3–73.5 ms. Per-arrival rows are in [slices.json](assets/gallery-photo-continuation-fix/step0/slices.json).

| Slice (median ms, 4× CPU) | Fast arrivals (147 of 181) | Slow arrivals (34 of 181) |
| --- | ---: | ---: |
| Decode, `createImageBitmap` 1024² (async, wall; resolves before the task) | 13.0–13.2 | 13.2–13.3 |
| `drawImage` to the 512² read canvas | 0.9–1.0 | 0.9–1.1 |
| `getImageData` readback | 3.0–3.2 | 2.9–3.0 |
| Luminance + histogram loop (`photo.mjs` L23–26) | **2.9** | **32.1–33.3** |
| 3 × 3 height loop (L29–33) | **12.2–12.7** | **31.9–32.6** |
| `DataTexture` construction | 0.0 | 0.1–0.3 |
| **The continuation, end to end** | **18.8–20.1** | **68.3–70.3** |

No albedo work runs in this continuation. Photo albedo is prepared at upload (`disc-photo.mjs`), not on view. No texture upload happens in it either: the GPU upload runs at the next render, outside this task.

### 2. Traced, with V8 sampling

This rep ran on the unmodified module. The trace categories were `devtools.timeline`, `v8.execute`, `disabled-by-default-v8.cpu_profiler` and GC, analysed by [analyze.mjs.txt](assets/gallery-photo-continuation-fix/step0/analyze.mjs.txt) ([trace-r1.analyze.txt](assets/gallery-photo-continuation-fix/step0/trace-r1.analyze.txt)). The rep had 23 long tasks in the flip block, every one a `BlinkScheduler_PerformMicrotaskCheckpoint` / `RunMicrotasks` task of 50.9–77.3 ms with thread-CPU / wall at 1.00. That makes it CPU-bound, with no wait. None of these tasks contained an animation frame, input, style recalculation, layout, paint or GL call. Of the 5,796 V8 samples inside them:

| Where | Share of samples |
| --- | ---: |
| 3 × 3 height loop (L29–33) | 45.9% |
| Luminance loop (L23–25, including its OSR frames attributed to the L45 continuation) | 35.3% |
| `(program)` | 7.5% |
| `getImageData` | 4.5% |
| GC | 1.9% |
| `drawImage` | 0.2% |

**The dominant slice is `reliefTexture()`'s two pixel loops: 81% of the long tasks' samples.** It is the owner-photo continuation, as the prompt expected. Decode is not in the task, so lever 3 is out. Readback and upload are small.

### 3. Why one arrival in four runs three times slower

The slow arrivals run the same loops on the same pixels. Only the cost changes, and the pattern is not random. Here is per-rep fast/slow by Destroyer arrival (`S` = slow):

```text
rep 1  .S.S.S.S.S.S.S.S.S..S..S.S..........................S..S.S..
rep 2  S.S.S.S.S....................................S.S..S..S.S.S.S
rep 3  .S....S.S.S.S.S.S............................................
```

The function alternates in runs and then settles for a while, which is the signature of JIT tiering. `--js-flags="--trace-opt --trace-deopt"` on one cold and one warm rep ([deopt-tally.txt](assets/gallery-photo-continuation-fix/step0/deopt-tally.txt)) shows why. `reliefTexture()` runs once per arrival, so its loops reach optimized code only by on-stack replacement inside each call. The record has 60 Maglev OSR compiles and 59 Turbofan OSR compiles. Interleaved with them are 30 "prepare for OSR" deopts, 26 + 3 "insufficient type feedback for generic named access" deopts (at the canvas calls at the top of the function), 20 "exit from OSR'd inner loop" deopts in the nested height loop, and 4 "embedded weak objects cleared" invalidations after GC. On arrivals where that churn leaves the loops in a lower tier, both passes run at about 32 ms instead of 3 and 12.

### What the profile rules in and out

- **Lever 3 (decode off the main thread):** out. Decode is about 13 ms of async wall time and resolves before the task begins.
- **Lever 1 (pre-warm the neighbours):** this does not move the number by itself. The gate's album has four discs and flips forward, so the Destroyer is a neighbour of the disc before it on every lap. A pre-warm would do the same once-per-lap processing at a different moment, as one long task of the same size, unless that work were also chunked.
- **Lever 2 (chunk the continuation):** chosen. The dominant slice is pure array work after a single readback, so it slices cleanly into row bands with no change to the result.
- `reliefTexture()` is shared photo-texture code, and the profile places the dominant slice there, so the fence permits touching it. The Atlas perf gate and the bag suites joined the verification set.

## The fix — lever 2, and nothing else

One file: [`public/disc3d/photo.mjs`](../public/disc3d/photo.mjs).

- The luminance pass and the 3 × 3 height pass move into two small functions, `luminanceRows()` and `heightRows()`, with their expressions copied unchanged. `reliefTexture()` calls them over **128-row bands**: four bands per pass on the 512² read canvas.
- Between bands, `reliefTexture()` yields with `scheduler.yield()`. Browsers without it (Safari, Firefox) yield a `MessageChannel` turn instead of `setTimeout`, which nested timers would clamp to 4 ms per yield.
- `reliefTexture()` is now `async`. `acquirePhoto()` awaits it inside the same promise chain, so `ready` still resolves once, with `{map, relief}` both complete. After each yield the band loop checks the entry is still live: same cache epoch, controller not aborted. If a photo is released or the cache cleared mid-relief, the loop throws `Photo cleared`, the existing `catch` drops the entry, and `photoSurface()`'s existing handler ignores it for a disposed surface. That is what already happened when a release beat the decode.
- Nothing else changes. The read canvas, readback, plate median, `DataTexture` settings, bump scale, cache, the release path, the Gallery hold and its reveal are the same. The continuation keeps its ordering guarantee: the photo's `photoReady` flag is still set only after the relief exists, so the Gallery keeps the previous disc's render hidden behind its neutral hold until the new appearance is complete.

Splitting the loops into small functions has a second effect. Each band function is called several times per photo, so V8 optimizes it as a whole function and keeps it, instead of re-entering OSR once per photo. Variant A, the same split with no yields, was run through the probe to separate the two effects. It also measured 0 long tasks (table below), so the JIT churn was the entire excess. The yields are kept anyway. They make each piece a few milliseconds by construction, so the result no longer depends on V8's heuristics or on how slow the phone is. That is the "robustly green" the job asks for.

### Identical output

- **Old vs new, same page, 25 inputs:** [relief-equivalence.mjs.txt](assets/gallery-photo-continuation-fix/relief-equivalence.mjs.txt) loads the shipped `5fb9801` `photo.mjs` and the working-tree one side by side in one Chromium page, with `reliefTexture` exported only for the check. It runs both on the same `ImageBitmap`s. The inputs are all six photo fixtures, decoded as `acquirePhoto` decodes (flipY, square resize at 1024, 512 and 256), plus seeded synthetic images: noise with varied alpha, a gradient, a flat colour, a transparent disc, a non-square 700 × 300 and a 37 × 37. **25 of 25 are byte-identical, with the same texture settings** ([relief-equivalence.log](assets/gallery-photo-continuation-fix/relief-equivalence.log)). A one-byte mutation of the new height expression is caught (15 of 25 inputs differ; [relief-equivalence.mutant.log](assets/gallery-photo-continuation-fix/relief-equivalence.mutant.log)), so the check can see a difference.
- **In the running Gallery:** after each probe run, the probe hashed the relief bytes the album viewer actually holds on the Destroyer. The hash was SHA-256 `e9d0f202…29b3c3` for main, variant A, variant B, the fixed tree, and the fixed tree with `scheduler.yield` deleted (the fallback path).

### Probe comparison, same session

Untraced phone loop, cold rep then three warm reps, one tree after another:

| Tree | Warm long tasks | Destroyer reveal median / p95 / max (ms) | Other discs' reveal median / p95 |
| --- | --- | --- | --- |
| main `5fb9801` (control) | **26 / 18 / 2** | 58.8 / 109.0 / 134.5 | 17.5 / 18.7 |
| Variant A: band functions, no yields | 0 / 0 / 0 | 60.5 / 69.0 / 77.3 | 17.5 / 18.6 |
| Variant B: band functions + yields, 64-row bands | 0 / 0 / 0 | 61.7 / 69.6 / 72.9 | 17.4 / 18.6 |
| **Fixed tree: 128-row bands** | **0 / 0 / 0** (cold 0) | 58.5 / 64.5 / 68.2 | — |
| Fixed tree, `scheduler.yield` removed | 0 (one rep, cold 0) | — | — |

Reveal on Destroyer arrivals costs a millisecond or two at the median for the yields and is better at the tail, because the slow mode is gone. Other discs are unchanged. Reveal is recorded by the gate, not gated.

## The acceptance run — the gate, unchanged, paired with main

`tests/gallery-fixes-browser.mjs`, `before.darwin.json` and every limit, margin and rep count are untouched. The script is not in the diff.

**Protocol** ([gate-pair.sh.txt](assets/gallery-photo-continuation-fix/gate/gate-pair.sh.txt)): abort unless `pmset` reports AC power. Before each run, wait for 12 consecutive samples (about 60 s) at ≥85% idle with no foreign headless browser, `workerd` or Wrangler. Log power, CPU, load and foreign processes every 15 s for the whole session. Run the gate under `caffeinate -dims`, then copy its `after.darwin.json` and restore the tree's tracked screenshots. The control tree was a detached worktree of `5fb9801`, identical to this branch's base. The runs went in the order fixed, main, main, fixed, so that drift across the window cancels.

**Window** ([window.log](assets/gallery-photo-continuation-fix/gate/window.log), [quiet.log](assets/gallery-photo-continuation-fix/gate/quiet.log), [runs.log](assets/gallery-photo-continuation-fix/gate/runs.log)): 22:07:25–22:21:12 on October 20. The window had 59 samples, every one on AC Power. Idle at each run's start was 92.96–97.56%, after twelve qualifying samples each time. Idle during the runs was 75.3–98.3%, the low end being the gate's own browser. Load was 1.2–2.8. The session's first sample saw one leftover foreign process; it reset the quiet count and was gone by the next sample. Every run started at `foreign=0`.

| Run | Start | Tree | Phone warm long tasks (cold) | Longest | Median | Limit | Paired excess | Desktop long tasks | Exit |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| fixed1 | 22:08:16 | `5fb9801` + fix | **0 / 0 / 0** (0) | 0 | **0** | 1 | **−1** | 0 × 7 (0) | **0, PASS** |
| main1 | 22:11:42 | `5fb9801` | 4 / 7 / 3 (8) | 73 | 4 | 1 | +2 | 0 × 7 (0) | 1, FAIL |
| main2 | 22:15:09 | `5fb9801` | 12 / 4 / 0 (3) | 70 | 4 | 1 | +3 | 0 × 7 (0) | 1, FAIL |
| fixed2 | 22:18:35 | `5fb9801` + fix | **0 / 0 / 0** (0) | 0 | **0** | 1 | **−1** | 0 × 7 (0) | **0, PASS** |

Every other gate row passes on all four runs, and the two trees match within a few tenths of a millisecond:

| Device | Metric | Baseline | fixed1 / fixed2 | main1 / main2 | Limit |
| --- | --- | ---: | --- | --- | ---: |
| Desktop | fly p95 | 1.7 | 2.7 / 2.8 | 2.7 / 2.7 | 3.455 |
| Desktop | still p95 | 0.4 | 0.4 / 0.4 | 0.4 / 0.4 | 1.96 |
| Phone | fly p95 | 6.2 | 5.9 / 6.1 | 5.9 / 5.9 | 10.13 |
| Phone | still p95 | 0.1 | 0.1 / 0.1 | 0.1 / 0.1 | 3.115 |

The behaviour checks `placement`, `top`, `noPopIn` and `sticky` are all `true` on all four runs, with zero page errors. All four ran on `ANGLE (Apple, ANGLE Metal Renderer: Apple M4, Unspecified Version)` with `--enable-gpu`, per each report's own `renderer` block. Phone reveal p95 per warm rep was 57.1–58.8 ms on the fixed tree and 55.2–82.0 ms on main. Desktop reveal p95 had a median of 50.3–50.4 ms on both. Reports and logs: [gate/](assets/gallery-photo-continuation-fix/gate/).

On the evidence the fix removes the class outright, not just most of the time. A traced warm phone rep of the fixed tree ([fixed-trace-r1.bands.txt](assets/gallery-photo-continuation-fix/step0/fixed-trace-r1.bands.txt), with [bands.mjs.txt](assets/gallery-photo-continuation-fix/step0/bands.mjs.txt)) has 0 tasks over 50 ms. The 520 tasks that run relief bands take 0.2–14.0 ms, median 3.9 ms. On main the continuations took 18.8–77 ms each.

## After merging photo stamps (`d157c4a`)

At Freddy's request, `origin/main` at **`d157c4a`** (PR #37, photo stamps) was merged into this branch as **`e5a39d0`**. Only `graphify-out/` conflicted. It was taken from main and regenerated AST-only with `graphify update .` (2,733 nodes; `luminanceRows()` and `heightRows()` present). Against `d157c4a`, the merged tree differs only in `public/disc3d/photo.mjs`, this write-up, its evidence and the graph. Photo stamps leave the relief path alone. The shared viewer skips `photoSurface` only for a disc whose owner switched it to the game-asset look, which the gate fixture does not do. `photo.mjs`, `tests/gallery-fixes-browser.mjs` and `before.darwin.json` are byte-identical between `5fb9801` and `d157c4a`.

- **Probe on the merged tree:** phone warm long tasks 0 / 0 / 0, with the same relief SHA-256 `e9d0f202…29b3c3`. The old-vs-new identity check is still 25 of 25.
- **Suites on the merged tree** ([suites-merged/](assets/gallery-photo-continuation-fix/suites-merged/)): unit **34 suites, 277 tests, 277 pass**. Browser: `photo-stamp-assets-browser`, `all-discs-browser`, `bag-collections-browser`, `photo-textures-browser`, `photo-texture-perf-browser`, `photo-stamp-level-browser`, `photo-rim-color-browser`, `disc3d-browser`, `bag-3d-browser`, `bag-pulled-quality-browser` and `non-overmold-photo-edge-browser`: **11 of 11 pass**.
- **Paired quiet gate, the same protocol, merged fix vs `d157c4a`** ([gate-merged/](assets/gallery-photo-continuation-fix/gate-merged/)): 22:54:36–23:09:05 on October 20, 62 samples, all on AC Power. Idle at each run's start was 90.6–98.3% after twelve qualifying samples, with `foreign=0`. The low of 59.5% was the gate's own browser, mid-run. The control was a detached `d157c4a` worktree.

| Run | Start | Tree | Phone warm long tasks (cold) | Longest | Median | Limit | Paired excess | Desktop long tasks | Exit |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| fixed1 | 22:55:27 | `e5a39d0` (merged fix) | **0 / 0 / 0** (0) | 0 | **0** | 1 | **−1** | 0 × 7 (0) | **0, PASS** |
| main1 | 22:59:35 | `d157c4a` | 6 / 4 / 0 (7) | 68 | 4 | 1 | +3 | 0 × 7 (0) | 1, FAIL |
| main2 | 23:03:03 | `d157c4a` | 3 / 7 / 2 (6) | 70 | 3 | 1 | +1 | 0 × 7 (0) | 1, FAIL |
| fixed2 | 23:06:29 | `e5a39d0` (merged fix) | **0 / 0 / 0** (0) | 0 | **0** | 1 | **−1** | 0 × 7 (0) | **0, PASS** |

The other ten gate rows pass on all four runs: desktop fly p95 2.5–2.8 against a limit of 3.455, phone fly p95 5.9–6.7 against 10.13, and stills within 0.5 ms. Every behaviour check is true, and every run had zero page errors and drew on ANGLE Metal. Main's failures are the same owner-photo class, with a longest of 67–70 ms per rep.

## Verification

- **Unit:** every non-browser `node:test` suite (`tests/*.mjs` importing `node:test`, excluding `*-browser.mjs`): **33 suites, 271 tests, 271 pass, 0 fail** ([unit.log](assets/gallery-photo-continuation-fix/suites/unit.log)).
- **Browser, at their defaults:** 40 suites covering Gallery, bag, photo, disc3d and the Atlas photo/stamp paths, run serially by [run-suites.sh.txt](assets/gallery-photo-continuation-fix/suites/run-suites.sh.txt) ([summary.log](assets/gallery-photo-continuation-fix/suites/summary.log)). **35 pass**, among them `all-discs-browser`, `bag-collections-browser`, `photo-textures-browser`, `photo-texture-perf-browser`, `photo-decode-browser`, `photo-gestures-browser`, `photo-source-chooser-browser`, `photo-rim-color-browser`, `photo-stamp-level-browser`, both `non-overmold-photo-edge` suites, `disc3d-browser`, `disc3d-popout-browser`, `disc-appearance-browser`, `atlas-3d-browser`, `atlas-stamps-browser` and 18 of the 21 bag suites. `bag-pulled-quality-browser` and `non-overmold-photo-edge-browser` pass at their defaults here. The landing recorded both as D3D11-flag failures. On this main both suites now choose their launch flags by platform, so they no longer request D3D11 on the Mac.
- **The five that fail, fail identically on untouched main:** each was rerun on the `5fb9801` control worktree with the same signature ([suites-control/](assets/gallery-photo-continuation-fix/suites-control/)).
  - `bag-staging-browser`: "8 out with details (1440): demo-04 inside the canvas".
  - `bag-tweaks-browser`: "Discs reach close to both sides at 1440".
  - `bag-interactions-browser`: timeout waiting for `#detail`.
  - `photo-compression-browser`: "native bytes unchanged".
  - `photo-editor-contract-browser`: "This photo could not be compressed", the WebKit half the photo-stamp notes already record on main.

  None of the five reaches relief. The three bag suites drive the demo bag, which has no owner photos. The two photo suites exercise the upload and compression path in `disc-photo.mjs`. They are outside this job's fences, so they are recorded here and left alone.
- **Gallery behaviour checks:** true on all four gate runs (above).
- **Atlas perf gate,** because shared photo-texture code changed: `node tests/atlas-3d-perf.mjs` under the same quiet protocol ([atlas/](assets/gallery-photo-continuation-fix/atlas/), 22:32–22:39, AC throughout), on the fixed tree and then on main. **Both exit 0**, every row passing. Phone long tasks were 0 / 0 with paired excess −1 on both trees. Phone flight p95 medians were 3.1 / 4.2 ms (fixed, 2D / 3D) against 3.0 / 4.1 ms (main), and desktop flight p95 1.6 / 2.2 ms against 1.6 / 2.3 ms.

## Evidence and reproduction

- [assets/gallery-photo-continuation-fix/step0/](assets/gallery-photo-continuation-fix/step0/): the probe and analyser (`.txt` copies of the ignored `outputs/gpc/` scripts), the instrumentation diff, `slices.json`, the traced rep's `analyze.txt` and `loop.json`, the deopt tally, and the gzipped trace with its sha256 in `manifest.json`.
- [assets/gallery-photo-continuation-fix/gate/](assets/gallery-photo-continuation-fix/gate/): the gate runner, the window, quiet and run logs, and every run's gate log and `after.darwin.json`.
- [assets/gallery-photo-continuation-fix/suites/](assets/gallery-photo-continuation-fix/suites/): the suite runner, its summary, and each suite's log.
- Reproduce from the worktree root. Profile: `node outputs/gpc/probe.mjs --stage=setup`, then `--stage=slices --tag=slices --reps=3` (the instrumented module), `--stage=trace --tag=trace --reps=1`, or `--stage=run --tag=<name> --reps=3 [--variant=A|B] [--noyield]`. The `run` stage serves what `dist/` holds, so run `node scripts/build-workers.mjs` after editing the source. Then `node outputs/gpc/analyze.mjs <trace>`. Identity: `node outputs/gpc/relief-equivalence.mjs`. Gate: `outputs/gpc/gate-pair.sh <outdir> fixed=<this tree> main=<a 5fb9801 checkout> …`.

## Fences held

- **The gate did not change:** no edit to `tests/gallery-fixes-browser.mjs`, `before.darwin.json`, the limits, the margins or the rep counts. Each run's rewritten screenshots and report were copied out and the tracked files restored, so `docs/images/storage-all-discs-fixes/` is unchanged in the diff.
- **No pop-in regression:** the continuation is intact, and it still holds the reveal until the relief exists. `noPopIn`, `placement`, `top` and `sticky` are true on every run.
- **Identical output:** 25 of 25 inputs byte-identical old vs new, a mutation shown to be caught, and the same in-app relief hash on every tree and path.
- **Shared code touched only on the profile's say-so:** Step 0 placed 81% of the long tasks' samples in `reliefTexture()`'s loops. The Atlas perf gate and the bag suites joined the verification set, and are reported above.
- **Levers taken in order, smallest change that moves the number:** lever 1 was not built, because it moves the cost rather than removing it; lever 3 was ruled out, because decode is not in the task. Lever 2 is one file, +25 / −9 lines.
- **Photo stamps:** not landed on main at fire time. This builds on `5fb9801` and touches neither the photo-stamp branch nor its feature code.
- No push, PR or deploy. Local commits on `claude/gallery-photo-continuation-fix`, including the merge of `d157c4a` Freddy asked for, with the Graphify refresh regenerated AST-only (`graphify update .`) and committed alongside.
