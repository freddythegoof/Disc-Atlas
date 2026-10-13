# Apple design fixes — batch 1

October 13, 2026. Main checkout, starting from clean `6389bef`. Implemented findings 2 → 3 → 1, following the review's suggested order and skipping findings 4–11.

**1. Camera feel.** `public/atlas-map.js` now integrates one analytic critically damped spring in the existing map frame callback: response 0.35 s for zoom, 0.4 s for pan, with velocity carried through retargets and releases. The 0.99 projection is capped at **half the larger viewport dimension** for pan and ±40% of the current zoom for pinch; bounds remove outward momentum. Two-finger midpoint translation follows the fingers, and edge resistance is progressive and reversible.

`public/atlas-layout.js` accepts an optional reusable constraint output, with the same bounds math. The spring adds no per-marker frame traversal or per-frame allocation. Existing renderer, grouping, marker persistence, LOD hysteresis and 180 ms LOD settling remain unchanged. Reduced motion skips spring travel and release momentum.

**2. Flick-catch selection.** `public/atlas-map.js` records motion before stopping the camera on pointerdown, using 0.025 px/ms (25 px/s), including zoom in screen pixels. The resulting pointer click is swallowed; a subsequent stationary art/name tap and keyboard activation still select normally. Extra fingers are ignored and a cancelled pinch cannot resume momentum on its final lift.

**3. Theme cross-fade.** `public/theme.js` and `public/cosmic.css` use a 240 ms ease-out root View Transition, with temporary classes and an opacity-only fallback (120 ms out, 120 ms in). The fallback holds its backdrop across interruptions; the latest rapid choice wins. Existing shared controls cover Atlas, About and Account, all four explicit themes and unsaved system-follow. Initial application and reduced motion are instant; palettes and layouts are unchanged.

`public/disc3d/viewer.mjs` paints theme updates synchronously so the new WebGL image is present when the transition captures its snapshot. Component transition timing returns after the temporary theme classes clear. API reference: [MDN startViewTransition](https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition).

## Verification

Passed:

- `npm.cmd run test:apple-design`: 6 camera unit tests and 16 browser checks. Includes 30/60/120 Hz integration, velocity handoff, half-viewport cap, bounds, reduced motion, touch-emulated parallel pan/pinch release, cancellation, actual flick-catch, stationary tap/keyboard activation, LOD hold/settle, all 12 explicit theme pairs on each page with native/fallback paths, rapid changes, fallback interruptions and system-follow.
- `npm.cmd run test:atlas:persist`: 7 target unit tests and 13 browser checks, including art/name targets, pointer holds, pins, merge transfer and small zoom nudges.
- `node --test --test-isolation=none tests/apple-camera.mjs tests/atlas-layout.mjs tests/atlas-lod.mjs tests/atlas-targets.mjs`: 31 tests.
- `node tests/motion.mjs --boundaries`: camera bounds, wheel, corner feedback, sparse/dense views, mobile and reduced motion.
- `node tests/motion.mjs --header-menu`: menu and theme controls, keyboard/pointer choice, OS defaults, persistence and shared page controls. Its theme check now waits for the asynchronous snapshot callback.
- `npm.cmd run test:disc3d`: model/overmold unit tests, viewer and pop-out browser checks, including theme changes and phone layouts.
- JavaScript syntax checks and `git diff --check`.
- Final `npm.cmd run test:atlas:3d:perf`: exit 0; full output below.

**Inherited failures, reproduced using unmodified HEAD files served by a separate local test server without moving the checkout:**

- `npm.cmd run test:atlas:3d` / `tests/atlas-3d-browser.mjs:286`: “once settled, the minis that outgrew the margin move up a level, once.” Rendering, 2D/3D position/size/name comparisons, selection and filters pass before this assertion. The same assertion fails on unmodified `6389bef`. Cached-art/LOD code and this assertion are unchanged in the final diff.
- Default `node tests/motion.mjs`, line 192: “Show all still includes every rated disc.” Also fails with its `--baseline` option; it expects every rated disc in the curated `mapClusters` set. The dedicated camera-boundary suite passes.

**Performance limits.** Earlier measurements failed, so the throw cap was reduced to half a viewport. A contemporary unmodified-HEAD control also failed the desktop gate (5.9 vs 3.8 ms flight p95), while passing phone (14.3 vs 13.9 ms). Results varied across runs. The final preserved-renderer measurement passes; this is an emulated 390×844 phone at 2× DPR and 4× CPU slowdown on the host GPU, not a physical phone. The benchmark drives zoom directly, so it measures map draw cost rather than the projected throw's length.

**Still verify on a real phone.** No physical touch device was available. Parallel two-finger pan, pinch momentum and catch suppression pass Chromium touch emulation, but their real-device feel and theme snapshot performance remain unverified.

## Freddy's feel test

1. **Slow wheel nudges:** zoom around the cursor, then reverse direction. Motion should stay continuous without a new speed kick each tick; LOD should hold during motion and settle afterward.
2. **Hard flick caught on a marker:** zoom to about 3×, drag quickly, release, then press a readable marker mid-glide. The camera should stop immediately and no detail/stack panel should open.
3. **Plain marker tap:** on the now-stationary map, tap the marker's art and then its name. Each should select the correct disc normally. Enter/Space on a focused marker should still work.
4. **Two fingers on a phone:** slide them in parallel, then pinch and lift both. The map should follow the midpoint 1:1, continue briefly after release, stay bounded and settle without bounce.
5. **Themes on every page:** use the Atlas and Account toggle/menu and About's select; try Light, Midnight, Charcoal and Black, then change choices rapidly. The whole page should fade together with no old-theme buttons or backdrop flash. In a fresh unsaved session, OS light/dark changes should follow; with reduced motion, theme and camera changes should be immediate.

## Final required performance output (verbatim)

```text
npm notice run disc-atlas@0.1.0 test:atlas:3d:perf
npm notice run node tests/atlas-3d-perf.mjs
ok - desktop: warm 3D frames are no slower than the 2D build's (flight p95 4.8 vs 3.9 ms, 1x p95 1.6 vs 1.4 ms; 695 renders)
ok - phone: warm 3D frames are no slower than the 2D build's (flight p95 16.3 vs 19 ms, 1x p95 3.5 vs 2.4 ms; 193 renders)
┌─────────┬───────────┬───────┬────────┬───────────────┬────────────┬────────────┬───────────┬────────┬────────────┬─────────┬───────┐
│ (index) │ device    │ build │ run    │ flight median │ flight p95 │ flight max │ 1x median │ 1x p95 │ long tasks │ longest │ discs │
├─────────┼───────────┼───────┼────────┼───────────────┼────────────┼────────────┼───────────┼────────┼────────────┼─────────┼───────┤
│ 0       │ 'desktop' │ '2D'  │ 'cold' │ 2             │ 4.2        │ 11.7       │ 0.7       │ 1.4    │ 0          │ 0       │ 77    │
│ 1       │ 'desktop' │ '2D'  │ 'warm' │ 1.9           │ 3.9        │ 12.7       │ 0.8       │ 1.4    │ 0          │ 0       │ 77    │
│ 2       │ 'desktop' │ '3D'  │ 'cold' │ 2.6           │ 7.7        │ 18.9       │ 1.1       │ 1.7    │ 0          │ 0       │ 77    │
│ 3       │ 'desktop' │ '3D'  │ 'warm' │ 2.3           │ 4.8        │ 8.3        │ 1         │ 1.6    │ 0          │ 0       │ 77    │
│ 4       │ 'phone'   │ '2D'  │ 'cold' │ 5.6           │ 17.4       │ 60.7       │ 1.8       │ 3      │ 12         │ 86      │ 17    │
│ 5       │ 'phone'   │ '2D'  │ 'warm' │ 5.9           │ 19         │ 85         │ 1.6       │ 2.4    │ 7          │ 111     │ 17    │
│ 6       │ 'phone'   │ '3D'  │ 'cold' │ 7.3           │ 19.5       │ 41.4       │ 2.1       │ 3.5    │ 12         │ 92      │ 17    │
│ 7       │ 'phone'   │ '3D'  │ 'warm' │ 5.9           │ 16.3       │ 34.1       │ 2         │ 3.5    │ 6          │ 62      │ 17    │
└─────────┴───────────┴───────┴────────┴───────────────┴────────────┴────────────┴───────────┴────────┴────────────┴─────────┴───────┘
```

