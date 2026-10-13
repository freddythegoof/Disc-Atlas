# Pop-out render quality

October 13, 2026. Main checkout, from clean `cd450f7` (Prompt 4). One fix, one file of product code. No data, geometry, clay rendering, morph, theme painting or press feedback changed.

No duplication: Prompt 4 did not touch pop-out sizing (its write-up has nothing on it), and the screenshots below show the pop-out was still blurry on `cd450f7`.

## Determination

**Overall softness from a buffer too small for its canvas, not faceting.** The pop-out's drawing buffer was a fraction of its on-screen size (574x320 drawn into a 1988x1108 area on desktop, 234x408 into 688x1196 on phone), so the browser stretched it. Everything shows it: the silhouette edge is stair-stepped, the stamp rings and lettering are blocky, shading is smeared. Geometry is fine (pop-out 128 segments against the panel's 80; not touched). Pixel ratio and antialiasing are shared and fine. The stamp texture (512 px) is about 1:1 with device pixels at pop-out size, so it was not a second cause and was left alone. Canvas CSS and the element `resize()` measures are the same element (`.disc3d-viewport`, canvas `inset:0`), so they agree.

## Mechanism (proven)

Instrumented the open on desktop at 2x with a Wraith (buffer, laid-out size and the dialog's transform, every frame):

| t (ms) | buffer | laid-out x ratio | dialog transform |
|---|---|---|---|
| 81 | 1988x1114 | 1988x1114 | none (attach, before the morph) |
| 120 | **574x322** | 1988x1108 | scale(0.288) |
| 139 to 433 | 574x320 | 1988x1108 | scale rises to 1 |
| after the morph | 574x320 | 1988x1108 | none |

`attach()` sized the buffer correctly. The layout then shifted by a few pixels (1114 to 1108), which fired the ResizeObserver one frame after the open morph began. `resize()` read `getBoundingClientRect()`, which includes the morph's `scale(0.288)`, so it measured 573x319 and locked the buffer there. Nothing re-measured afterwards, so the canvas stayed at full size with a quarter-width buffer.

Freddy's clay-toggle repro fits exactly. Clay changes layout (the cross-section figure appears), which fires the observer against the final, untransformed rect: after toggling clay on the buffer was 1988x812, after toggling off 1988x1108. The buffer was never capped; the first measure was wrong and a later one fixed it. The same happens on phone (buffer 234x408 against 688x1196).

## The fix

`resize()` in [public/disc3d/viewer.mjs](../public/disc3d/viewer.mjs) now measures layout size, `viewport.offsetWidth` and `offsetHeight`, which ignore CSS and WAAPI transforms. The buffer therefore always matches the laid-out size times the pixel ratio, whenever the observer fires: during the morph, after it, on reopen, and in the reduced-motion fade. The panel viewer uses the same code and is unchanged in behaviour (no transform on its viewport).

After the fix, with no clay toggle, the buffer is 1988x1108 on desktop and 688x1196 on phone at every sampled moment from open.

## Regression test

`tests/disc3d-popout-browser.mjs`, section "Sharpness": for desktop, phone, desktop reduced motion and phone reduced motion, open the pop-out, wait for the open to land, and assert the canvas buffer equals `offsetWidth/Height x min(devicePixelRatio, 2)`. Then close, reopen, and assert again; also assert the panel's buffer. No clay toggle and no manual resize in the flow. On the pre-fix code it fails (`[574, 320]` against `[1988, 1108]`); with the fix it passes.

## Before and after

In `outputs/popout-quality/` (git-ignored): `{before,after}-{desktop,phone}-{profile,top}-{panel,popout,popout-full}.png`, the same Wraith at the same pose in the panel and the pop-out. Before, the pop-out rim is jagged and the stamp rings are blocky; after, it matches the panel's crispness at the larger size. Clay and the profile overlay were not touched; the clay pop-out suites still pass, including the checks that the cross-section and disc keep their places.

## Performance

Pop-out render, one frame with a forced GPU readback, 60 samples, RTX 3070:

| | buffer | median | p95 |
|---|---|---|---|
| desktop, after the fix | 1988x1108 | 0.90 ms | 1.30 ms |
| desktop, pre-fix, after a clay toggle (same buffer) | 1988x1108 | 1.00 ms | 1.60 ms |
| phone, after the fix | 688x1196 | 0.50 ms | 1.20 ms |

Full resolution is cheap on this GPU. Not measured: low-end phones or software GL, where a full-size buffer costs more; the pop-out already ran at this size once a clay toggle had re-measured it, and the pixel ratio stays capped at 2.

`test:atlas:3d:perf` (does not exercise the pop-out) is green: desktop 3D warm flight median 1.9 ms, p95 4.1 ms, 0 long tasks; phone 3D warm flight median 4.7 ms, p95 11 ms.

## Verification

All exit 0: `test:disc3d` (including the new check), `test:apple-design` (16 checks), `test:apple-design:2` (29, including the pop-out morph, reversal and reduced-motion fade), `test:apple-design:3` (14), `test:atlas:persist` (13), `test:atlas:3d:perf`. Prompt 4 added no suites beyond those.

## Feel check

Pop the same disc out twice; it should be crisp both times, and the Clay button should no longer be needed to sharpen it.
