# Photo edge revert: the shoulder cut is the photo rendering

Branch `codex/photo-edge-revert`, from `main` at `3d5639c` (the PR #11 merge). October 16, 2026.
Target: photo rendering as of `0dedf8a` (the PR #8 merge, before PR #9).

## Closing record

After PR #9 (photos to the nose) and two cleanup rounds (PR #10, PR #11), Freddy's feel checks on his own
discs failed twice. The Wraith, Halo Wraith and DD3 were still wrong, and the purple Halo band rendered
underneath instead of at the edge. On **October 16, 2026** he decided, as a final call, to go back to the
rendering he liked: the one his family saw before PR #9. In that rendering the photo sits inside the
shoulder cut, and the rim is clean generated plastic in the photo-matched rim colour.

**The full-edge project is dropped, not parked.** He has weighed the cost twice and chose the clean edge
both times. Stamp art near the rim stays clipped at the shoulder, and one-piece discs keep a slight overmold
look. None of the cleanup machinery is kept "for later". Git history keeps the code (`500dae4`, `0d62a65`,
`7f0ee37`, `ce48a5b`); the live tree does not.

**Settled behaviour.** On every surface (detail viewer, pop-out, My Bag, Storage, list thumbnails, My Map),
a one-piece disc's photo stops at the shoulder (`Rs`). An overmold's photo stops at the seam (`Ri`), and its
rim piece wears the sampled `photo_rim_color`. Stored textures draw exactly as stored. Nothing is cleaned,
inpainted or re-registered at load time, and the aligner does not snap.

## What was reverted, by PR

The only first-parent merges between `0dedf8a` and `3d5639c` are PRs #9, #10 and #11. Every change they made
under `public/` is reverted, so `public/` is restored from `0dedf8a` as a whole:
`git diff 0dedf8a HEAD -- public/` is empty. Outside `public/`, `docs/` and `tests/`, those PRs changed only
`package.json` scripts. The worker, migrations and `web/` are unchanged, so the served build
(`dist/workers-public`) is byte-identical to a build of `0dedf8a` (`diff -rq`, no differences).

| PR | What it added | Now |
|---|---|---|
| #9 `500dae4` | `photoGeometry(shape, {overmold, edge})`: one-piece photo mesh runs over the shoulder to the nose (`edgeGeometry`); `topProfile()` in `shape.mjs`; `edge: true` from the detail viewer, the bag (detail and resting photos) and the Storage rack | removed; one-piece mesh stops at `Rs` again |
| #9 `0d62a65` | `atlas-art.mjs` passes `edge: true` (list thumbnails, My Map) | removed; atlas uses the same shoulder-cut mesh |
| #10 `7f0ee37` | `photo-clean.mjs`, `photo-clean-worker.mjs`; `acquirePhoto` routed every stored texture through a cleanup plan (worker, plan cache, `photoCleanup` stats); aligner snap (`snapToDisc`, the snap line and its CSS, `data-photo-snap`) | deleted; `acquirePhoto` decodes the stored texture directly again |
| #11 `ce48a5b` | round-2 signatures in `photo-clean.mjs` (pale, glare, JPEG; sure-fit, ray search, stop fallback) | deleted with the module |

**The aligner snap went too.** The brief lists the aligner as a keeper, and it is: the aligner is Plan 22's,
exactly as of `0dedf8a`. The automatic snap-to-edge was not Plan 22's. PR #10 added it as part of the cleanup,
and it is built on `photo-clean.mjs` (`findDiscCircle`, `discColours`). It existed to keep table pixels out of a
texture whose edge pixels now showed. With the shoulder cut those pixels are hidden again, as they were
before PR #9. Keeping the snap would have meant keeping the cleanup's circle finder alive, which the decision
rules out. If Freddy wants the snap back on its own, that is a new decision.

## What was kept, and why

- **Photo upload, the aligner, texture storage (Plan 22):** unchanged; they are the `0dedf8a` versions.
- **`photo_rim_color` sampling and rim precedence (PRs #5, #7):** unchanged. The photo-matched rim colour is
  part of why the pre-#9 rendering looked right.
- **Overmold rendering and the Pixel:** unchanged. The Pixel's photo mesh hashes the same on `0dedf8a`, on
  `main` and on this branch (`cdc4fef9`).
- **Bag work (PRs #6–#8), clay mode, themes, stamps:** untouched; they were all merged before `0dedf8a`.
- **Stored textures and bag data:** untouched. This change is rendering only, with no migration. The cleanup
  only ever ran at load time and never wrote back. A photo uploaded while the snap was live keeps the
  framing it was saved with.

## Tests

- **Deleted** (they tested only the cleanup): `tests/photo-cleanup-characterize-browser.mjs`,
  `photo-cleanup-fixtures.mjs`, `photo-cleanup-round2-browser.mjs`, `photo-cleanup-signatures-browser.mjs`,
  `photo-cleanup-signatures.mjs`, `photo-cleanup-taxonomy-browser.mjs`, `photo-edge-cleanup-browser.mjs`, and
  the `test:photo-cleanup` script.
- **Back to `0dedf8a`:** `tests/photo-gestures-browser.mjs` (it no longer turns the snap off) and
  `tests/photo-textures-browser.mjs` (its PR #9 edge-geometry block is gone; the photo-edge suite now owns
  geometry).
- **Rewritten:** `test:photo-edge` (`tests/non-overmold-photo-edge-browser.mjs`) and `test:photo-edge:atlas`
  (`tests/non-overmold-photo-edge-atlas-browser.mjs`), with shared fixtures and upload helpers in
  `tests/photo-edge-shared.mjs`. Cases: the PR #9 stamp and Halo Wraiths, the round-2 Wraith signature (the
  striped "30" Wraith with fingers on the rim, `tests/fixtures/photo-edge-wraith.jpg`), the round-1 clean
  Thunderbird control (`tests/fixtures/photo-edge-clean.jpg`), and the Pixel. Each goes through the real editor
  on local Wrangler + D1. The suites assert:
  - **Geometry.** For Wraith, Destroyer, Thunderbird, Aviar, Pixel and Atlas, the photo mesh's reach equals
    `Rs/R` for one-piece discs and `Ri/R` for overmolds. Passing `edge: true` builds the same mesh byte for
    byte, so no edge path remains.
  - **App surfaces.** In the detail panel, the photo stops at the shoulder: 0.8274 R on the Wraith, 0.8493 R on
    the Thunderbird. The stamp's stripes stop inside the shoulder: 0 crossings at 0.88–0.97 R on the panel and
    the pulled bag disc, and at most the key light's highlight arc (≤ 2) in the thumbnail and on My Map. The
    Halo's outer rings are the plate's purple (`#9b63d4` at 0.94 R, the same value the pre-#9 run measured), not
    the photo's pale band. The Pixel stops at its seam with its `#101418` rim.
  - **No cleanup left.** `photo.mjs` exports no `photoCleanup` and `disc-photo.mjs` no `snapToDisc`. No
    `photo-clean` module or worker is fetched, and the aligner has no snap line.
  - **Reference A/B.** `EDGE_REFERENCE=<built checkout>` draws every surface through that checkout's served
    tree first, then this one. It requires the same photo mesh hash, the same texture bytes and the same pixels
    within GPU tolerance. `EDGE_REFERENCE_SAME=0` only records the comparison (a contrast run).

## Equivalence evidence

**Method.** A scratch worktree of `0dedf8a`, built with `node scripts/build-workers.mjs`. Both suites ran with
`EDGE_REFERENCE` pointing at it. In one run, on one browser and one GPU (RTX 3070, ANGLE D3D11), against one
local D1/R2 holding the same uploaded textures, the suite first serves every asset request from the
`0dedf8a` tree (603 requests answered in the panel suite) and then from this branch. Worker routes
(`/api`, `/auth`) are this run's own in both halves, so both halves draw the same stored bytes.

The comparison covers four kinds of evidence:

1. The photo mesh's bytes (FNV-1a over position, UV, normal and index).
2. The decoded texture's own pixels (the 1024 px `ImageBitmap` the viewer maps, drawn to a canvas and hashed).
3. Screenshots of each surface.
4. The atlas art's canvases, read directly.

**Result: equivalent.** Mesh and texture hashes are identical for every case. Every screen is within one
8-bit level of the reference, and the atlas canvases match pixel for pixel.

| Case | Mesh | Texture | Panel 3/4 · top · bag pulled · Storage pulled (max diff / pixels moved) | Thumbnail · My Map |
|---|---|---|---|---|
| Wraith (round-2 signature) | `d1f4eeec` = | `2297cc` = | 1/11 · 0/0 · 1/10 · 1/1 | 0 · (marker wears the stamp Wraith) |
| Wraith stamp | `d1f4eeec` = | `61c04f48` = | 0/0 · 0/0 · 1/4 · 1/5 | 0 · 0 |
| Halo Wraith | `d1f4eeec` = | `7b5f79a8` = | 0/0 · 1/8 · 1/4 · 0/0 | (not in the atlas suite) |
| Thunderbird (clean control) | `7507d82d` = | `f2fac84d` = | 1/1 · 1/6 · 1/8 · 1/7 | 0 · 0 (a depth-tier dot) |
| Pixel (overmold control) | `cdc4fef9` = | `43d9bdd0` = | 0/0 · 0/0 · 0/0 · 1/1 | 0 · 0 |

No pixel in any screen moved by more than 8 levels; the gate allows 0.2% of pixels. The one-level
differences are GPU run-to-run noise. Because the client code is byte-identical, this check confirms that the harness and the GPU agree.
Equivalence of the code itself is shown by the empty `git diff` and the identical `dist/workers-public`.
Evidence: `docs/assets/photo-edge-revert/` (`equivalence-metrics.json`, `equivalence-atlas-metrics.json`;
`0dedf8a-*` next to `revert-*` images).

**Contrast with current `main` (`3d5639c`).** The same suite, `EDGE_REFERENCE` at a built `3d5639c`,
`EDGE_REFERENCE_SAME=0` (`contrast-main-metrics.json`, `main-*` images):

- **Photo reach:** 1.0011 R on `main` → 0.8274 R here (Wraith); 1.0013 → 0.8493 (Thunderbird); Pixel 0.9057 on both.
- **Photo mesh:** 3,840 → 2,048 triangles on one-piece discs.
- **Texture bytes:** `main`'s cleanup rewrote the round-2 Wraith's texture. The stamp, halo, clean and Pixel
  textures were left alone on `main` too, and match.
- **The Halo:** `main` draws the photo's pale band out to the nose (`main-halo-panel-top.png`). Here the band
  stops at the shoulder and the rim is the photo-matched purple plastic (`revert-halo-panel-top.png`).

## Cost

**The cleanup's per-texture cost is gone.** The contrast run timed each stored photo fresh, from fetch to
texture at 1024 px: median of 3 after a warm-up, with the plan cache cleared each time.

| Photo | `main` (plan + clean in the worker) | This branch |
|---|---|---|
| Wraith stamp | 132.9 ms | 89.0 ms |
| Halo Wraith | 49.0 ms | 26.0 ms |
| Wraith (round-2 signature, cleaned on `main`) | 155.2 ms | 27.0 ms |
| Thunderbird | 77.2 ms | 26.7 ms |
| Pixel | 83.3 ms | 23.2 ms |

On `main`, every texture paid for a plan, and a cleaned one also paid for a cleaned image. PR #11 documented
114–174 ms per plan and 58–90 ms per cleaned image in the worker. Here the cost is the fetch and decode alone,
and no worker is started. Frame cost in the detail viewer is unchanged within noise (0.04–0.06 ms per forced
frame). The atlas render of a photo disc measured 0.137 ms here against 0.170 ms for the `0dedf8a` reference
in the same run, which is noise between halves.

## Regression

Run on this branch on October 16, 2026 (RTX 3070 desktop, Playwright 1.63), one suite after another:

| Suite | Result |
|---|---|
| `test:disc3d` | pass |
| `test:bag` (node, 73 tests) | pass |
| `test:bag:browser`, `:overmold`, `:collections`, `:staging`, `:pulled-sizing`, `:pulled-quality`, `:demo`, `:popup` | pass |
| `test:bag:3d` | failed once in the back-to-back run (a 30 s `waitForFunction` timeout); passed 8/8 on rerun. The suite and the code it drives are unchanged since `0dedf8a`. |
| `test:photo-textures` | pass (its browser file is the `0dedf8a` version) |
| `test:photo-rim` | pass |
| `test:photo-edge`, `test:photo-edge:atlas` | pass (also with `EDGE_REFERENCE`, above) |
| `test:photo-phone` | `photo-gestures-browser.mjs` passes. **`photo-compression-browser.mjs`, `photo-editor-contract-browser.mjs` and `photo-source-chooser-browser.mjs` were not run:** each also launches WebKit, and this machine has WebKit build 2336 while Playwright 1.63 needs 2359 (`Executable doesn't exist ... webkit-2359`). None of the three changed since `0dedf8a`, and neither did the code they test. Run them where WebKit 2359 is installed. |
| `test:my-map` | pass |
| `test:appearance` | pass |
| `test:atlas:3d` | pass (11 checks) |
| `test:atlas:3d:perf` (perf gate, default settings, not loosened) | failed once in the back-to-back run, which printed no metric past the assertion. Both standalone reruns passed. Desktop warm 3D vs 2D: flight p95 3.6 vs 3.0 ms (limit 4.95), 1x p95 1.0 vs 0.6 ms, long tasks 0 vs 0. Phone: flight p95 9.9 vs 9.8 ms (limit 14.27), 1x p95 4.1 vs 3.4 ms, long tasks 1 vs 0 (limit 1). Phone long tasks at 3 repetitions is this gate's known noise. |

The perf gate draws the atlas without bag photos, so it never loaded a stored texture, with or without the
cleanup. The cleanup's cost sat in the texture load, and the Cost table above measures it there: gone.


## Feel check after deploy

The bag as Freddy's cousin saw it. On the Wraith, Halo, DD3, Destroyer and Pixel: edges are clean generated
plastic, rims match the photo, and stamp clipping is back to the accepted pre-#9 amount.
