# My Bag · 3D bag

The SVG bag graphic is replaced by the ChatGPT-built 3D backpack (`floating-bag-web.zip`, three.js 0.180). The list view, including its inline pocket dropdowns, is unchanged. All changes are left uncommitted: nothing was pushed, deployed or migrated, and no schema or API change was needed.

## Integration

- **Direct module, no iframe.** `public/bag-scene.js` keeps the `BagScene` contract that `my-bag.js` already used (`update`, `reveal`, `setOpen`, `reset`) and drives `mountBag()` from `public/bag3d/viewer.mjs` directly. Every saved change (pocket, go-to, disc color, Storage, bag color, capacities) reaches the 3D scene on the same render pass as the list. There is no postMessage and no reload.
- **Lazy loading.** `web/index.html` declares an import map only. three.js, the viewer and `charcoal-bag.glb` (2.06 MB total, uncompressed) load on the first `reveal()`, when a signed-in user opens the Bag tab. Signed-out visitors and the map/list never request anything under `/bag3d/`.
- **Vendored viewer.** `public/bag3d/` is the zip's runtime (no demo page). The original API still works unchanged (12-ID disc API, URL parsing, orbit). The Disc Atlas additions are opt-in options, documented in `public/bag3d/README.md`. `bag-layout.mjs` holds the slot math with no three.js dependency.
- **Accessibility layer.** The canvas is decorative (`aria-hidden`). A positioned hit layer above it mirrors every slot, using the SVG's structure: `[data-pocket] > [data-physical-disc]` with the same labels, `data-slot-order`, Tab/Escape/Enter handling, hover/focus lift and touch double-tap. Main slots are non-overlapping columns. Pocketed discs are domes clipped at the pocket mouth, so the front disc wins where pockets overlap.

## Feature parity

| SVG bag | 3D bag |
| --- | --- |
| Go-to: accent rim, dashed hollow when empty | The front pocket, directly above the main compartment, like a real Grip-style bag. Its rim and glow use the theme's `--lime`. The model's dashed outline shows there when empty. Several go-to copies stack in the pocket. |
| Main / putter pockets, capacities | Main slots = `main_capacity + extra_capacity` across the main compartment (thinner discs as capacity grows). Putter slots = `putter_capacity` in the top pocket, in a fanned stack so every rim shows. Empty slots are faint ghosts. More than 48 main / 8 putter / 6 go-to slots go to the existing "beyond the illustrated slots" note. All curated models fit. |
| Per-disc colors, bag color | Each disc's own material. The fabric follows `bag_color` with tonal panels and piping. Zippers and hardware stay fixed. The default charcoal restores the model's fabric. Tone mapping is Khronos PBR Neutral, so a lifted `#ed7868` renders `#f17f78`. ACES rendered it pastel `#f2b8b2`. |
| Capacity meter, Storage | Unchanged (they live outside the graphic). The 3D layout drops stored discs and re-adds them live. |
| Open/close | The model's authored flap fold, run at 0.75 s on wall-clock time (the SVG sequence was about 0.8 s). Toggle button, clicking the bag body, and reduced motion (instant) all work. |
| Hover/focus lift + info card | The disc pulls out toward the viewer and turns its face to the camera. The same lift card shows. |
| Size S / M / L | Same control and widths (360 / 560 / 880 px, capped to the viewport height). The canvas re-renders at each size instead of being upscaled. |

Deliberate differences:

- With the flap closed, putters and go-to discs stay focusable and liftable, because they sit in outside pockets. Main discs are unreachable until the bag opens, as before.
- A sideways drag turns the bag and it eases back to the front. There is no orbit or zoom: the canvas uses `touch-action: pan-y` and ignores the wheel, so page scrolling over the bag keeps working. OrbitControls never loads.
- The SVG asset `public/bag.svg` is deleted (nothing references it). Restore it with `git checkout -- public/bag.svg` if wanted.

## Performance

- Rendering is on demand. The loop runs only during motion and the gentle float (throttled to 30 fps when nothing else moves). It stops when the bag is offscreen or the tab is hidden. Shaders compile up front with `compileAsync`. Mount phases yield to the main thread.
- **Phone profile** (360×800, DPR 2.625, 4× CPU throttling via CDP, hardware GPU): first open 1.5 s; frame p95 is 16.8 ms idle, 16.8 ms for close/open and 16.7 ms for a lift sweep across every disc. That is zero frames over 34 ms and no main-thread task over 100 ms during interaction. Loading the bag the first time costs three main-thread tasks (95 / 212 / 112 ms at 4×). Most of that is three.js module evaluation and model upload, shown under "Loading your bag…".
- **Caveat:** the GPU was a desktop RTX 3070, so this profile proves main-thread headroom, not mobile GPU fill rate. No physical phone was tested.
- **Software WebGL** (SwiftShader, llvmpipe, blocklisted GPUs) is detected automatically. The viewer then drops MSAA, caps the pixel ratio at 1 and stops ambient motion. It draws motion at half resolution and settles on one full-resolution frame. Under SwiftShader the existing scene suite measures a 23.7 ms average frame cadence during lifts, and the open completes inside its 1 s budget.

## Tests

```powershell
node --test --test-isolation=none tests/bag.mjs tests/bag-values.mjs tests/bag-3d-layout.mjs tests/auth.mjs tests/coach.mjs tests/atlas-layout.mjs tests/atlas-groups.mjs
node tests/bag-3d-browser.mjs
node tests/bag-v13-browser.mjs
node tests/bag-pockets-browser.mjs
node tests/bag-scene-browser.mjs
node tests/bag-v12-browser.mjs
node tests/bag-browser.mjs
```

- `tests/bag-3d-layout.mjs` (new, Node): every curated bag model fits, main slots stay inside the compartment without touching, pocket order and depth, go-to stacking, no duplicate discs, caps and hit order.
- `tests/bag-3d-browser.mjs` (new, port 8802, `work/bag-3d/d1-qa`). Lazy loading by network log. Live sync: after each change, the rendered 3D state (read from the materials) and the hit layer must equal `/api/bag`, with no navigation. Parity counts. Color fidelity. Open/close. Drag and scroll behavior. Sizes. The phone performance profile. 39 screenshots: open with go-to, closed, mid-fold, lifted main, lifted go-to, the list, in Light, Midnight and Charcoal at 1440 px and 360 px, plus bag color and S/L. Gallery: [outputs/bag-3d/screenshots.html](../outputs/bag-3d/screenshots.html) · [qa.json](../outputs/bag-3d/qa.json). The SVG-era shots are kept for comparison in `outputs/bag-3d/baseline-svg/`.
- The existing suites keep every behavioral check. Only assertions that read SVG internals were ported to their 3D equivalents:
  - `bag-scene-browser`: SVG layer ids became the canvas + hit-layer structure. CSS `--bag-*` variables became the bag color read back from the fabric material. "Lifted top inside the SVG opening" became "lifted disc inside the canvas" plus the 3D disc being lifted. Clicks on the SVG body became clicks on the canvas body. The lid `transform` and paused Web Animations became flap progress under the virtual clock: one pause per theme and width, at 110 ms and 450 ms.
  - `bag-v13-browser`: slot centers are measured from the hit layer in the former 800×1000 units. "Go-to x = 400" became "centered over the main compartment". "Putters flank the go-to" became "putters ride in the top pocket, above the go-to's front pocket". "No raster in the canvas" became "canvas buffer matches its displayed size". The go-to ring class check became the 3D layout state.
  - `bag-pockets-browser`: SVG transform `y` became hit-layer centers.
- Results: 66/66 unit tests. All five existing browser suites and the new 3D suite pass. The baseline at HEAD was green before the port.

## Pocket arrangement (correction)

Putters ride in the **top** pocket and the go-to disc sits in the **front** pocket above the main compartment, matching a real bag. The first version had these reversed. `bag-layout.mjs` now defines the pockets by location (`TOP`, `FRONT`) and maps `PUTTER` to the top and `GOTO` to the front. The viewer carries the GLB's go-to accent rim and dashed outline from the top pocket, where the model authors them, to the go-to's front seat. Screenshots of putters only, go-to only, both, and an empty go-to, at desktop and 360 px: `outputs/bag-3d/pocket-check/`.
