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
| Go-to: accent rim, dashed hollow when empty | The front pocket, directly above the main compartment, like a real Grip-style bag. Since Oct 5 the go-to renders clean: no accent rim, outline or glow (the GLB rim stays hidden). The model's dashed outline still marks an empty go-to pocket. Several go-to copies stack in the pocket. |
| Main / putter pockets, capacities | Main slots = `main_capacity + extra_capacity` across the main compartment (thinner discs as capacity grows). Putter slots = `putter_capacity` in the top pocket, in a fanned stack so every rim shows. Empty slots are faint ghosts. More than 48 main / 8 putter / 6 go-to slots go to the existing "beyond the illustrated slots" note. All curated models fit. |
| Per-disc colors, bag color | Each disc's own material. The fabric follows `bag_color` with tonal panels and piping. Zippers and hardware stay fixed. The default charcoal restores the model's fabric. Tone mapping is Khronos PBR Neutral, so a lifted `#ed7868` renders `#f17f78`. ACES rendered it pastel `#f2b8b2`. |
| Capacity meter, Storage | Unchanged (they live outside the graphic). The 3D layout drops stored discs and re-adds them live. |
| Open/close | The model's authored flap fold, run at 0.75 s on wall-clock time (the SVG sequence was about 0.8 s). Toggle button, clicking the bag body, and reduced motion (instant) all work. |
| Hover/focus lift + info card | Since Oct 5, hover and focus show only a dark name pill above the disc; the disc does not move. The former info card stays as the visually hidden `aria-describedby` description (plastic, wear, weight, pocket, notes). |
| Size S / M / L | Same control and widths (360 / 560 / 880 px, capped to the viewport height). The canvas re-renders at each size instead of being upscaled. |

Deliberate differences:

- With the flap closed, putters and go-to discs stay focusable and liftable, because they sit in outside pockets. Main discs are unreachable until the bag opens, as before.
- A sideways drag (mouse or finger) turns the bag, and it stays exactly where the user lets go: no ease back (fixed Oct 5). Hit targets and labels re-measure for the turn. Turned so the front faces away, only the top pocket's putters stay in reach. There is no orbit or zoom: the canvas uses `touch-action: pan-y` and ignores the wheel, so page scrolling over the bag keeps working. OrbitControls never loads.
- The SVG asset `public/bag.svg` is deleted (nothing references it). Restore it with `git checkout -- public/bag.svg` if wanted.

## Slide-out, details and top view (Oct 4–5 2026)

- **Hover = name only.** Hovering or focusing a disc shows a dark rounded pill with its name in white, in every theme. The disc stays in its pocket. On touch there is no hover: a tap is a click.
- **Click = slide out along the pocket.** Each slot has a `slide` pose in `bag-layout.mjs`. A putter rises straight up until its whole face clears the top pocket's mouth, then steps forward past the front putter, so nothing in the pocket covers it. The go-to rises out of the front pocket and comes slightly forward. A main disc comes forward out of the open compartment, then up, turning face-on. The motion is time-linear progress mapped through two eased stages (along the pocket first, then the rest), about 0.6 s. The slid-out disc shows its full face plus a name pill. One disc is out at a time: clicking another sends the first home before the second leaves.
- **Putters in one row.** The four putters share one x and one tilt, with even spacing and a 16 mm step up per disc. The step keeps each rim visible and gives back putters a target of about 9 px tall at 360 px.
- **Details on My Bag.** Clicking the slid-out disc or its name opens the atlas's own `#detail` panel, docked on the My Bag page: the disc details plus a "Your disc" section with this copy's pocket, plastic, weight, wear, stability note and personal notes, Edit disc, and **Show on Atlas**. It never goes to the Directory. The list's disc names open the same panel.
- **Show on Atlas** goes to the map, clears any filter that hides the disc, zooms (4× or more) until the disc has its own marker, centers it where the panel leaves the map visible and opens its details. Molds without flight ratings have no map position, so the button is disabled with that reason.
- **Deselect.** Escape or a click on empty space slides the disc home and closes its details in one step. A click on the bag body that only dismisses does not also toggle the flap. With nothing out, Escape leaves the top view.
- **Touch taps.** Taps are read from the pointer events, not the click. Chrome drops the click for the first tap after the turntable drag, which would otherwise make that tap do nothing. The click that follows a handled tap is swallowed, so it can't land on the panel that just opened.
- **Top view.** The "Top view" toggle beside Open bag moves the camera to straight above in 0.6 s (eased) and back on a second click or Escape. From above, the fabric turns translucent and three labels name the main compartment, top putter pocket and front go-to pocket with their discs. The user's turn is kept, and leaving the top view returns to the camera as it was. The first switch compiles the translucent shaders; hovering or focusing the toggle warms them.
- **Framing.** The page camera sits 3 cm higher (position y 0.20, target y 0.075), so a putter slid out of the top pocket stays inside the canvas.

## Performance

- Rendering is on demand. The loop runs only during motion and the gentle float (throttled to 30 fps when nothing else moves). It stops when the bag is offscreen or the tab is hidden. Shaders compile up front with `compileAsync`. Mount phases yield to the main thread.
- **Phone profile** (360×800, DPR 2.625, 4× CPU throttling via CDP, hardware GPU): first open 1.5 s; frame p95 is 16.8 ms idle, 16.8 ms for close/open and 16.7 ms for a lift sweep across every disc. That is zero frames over 34 ms and no main-thread task over 100 ms during interaction. Loading the bag the first time costs three main-thread tasks (95 / 212 / 112 ms at 4×). Most of that is three.js module evaluation and model upload, shown under "Loading your bag…".
- **Caveat:** the GPU was a desktop RTX 3070, so this profile proves main-thread headroom, not mobile GPU fill rate. No physical phone was tested.
- **Software WebGL** (SwiftShader, llvmpipe, blocklisted GPUs) is detected automatically. The viewer then drops MSAA, caps the pixel ratio at 1 and stops ambient motion. It draws motion at half resolution and settles on one full-resolution frame. Under SwiftShader the existing scene suite measures a 23.7 ms average frame cadence during lifts, and the open completes inside its 1 s budget.

## Tests

```powershell
node --test --test-isolation=none tests/bag.mjs tests/bag-values.mjs tests/bag-3d-layout.mjs tests/auth.mjs tests/coach.mjs tests/atlas-layout.mjs tests/atlas-groups.mjs
node tests/bag-3d-browser.mjs
node tests/bag-interactions-browser.mjs
node tests/bag-v13-browser.mjs
node tests/bag-pockets-browser.mjs
node tests/bag-scene-browser.mjs
node tests/bag-v12-browser.mjs
node tests/bag-browser.mjs
```

- `tests/bag-3d-layout.mjs` (new, Node): every curated bag model fits, main slots stay inside the compartment without touching, pocket order and depth, go-to stacking, no duplicate discs, caps and hit order.
- `tests/bag-interactions-browser.mjs` (port 8803, `work/bag-interactions/d1-qa`, seeds the Grip BX3: 18 main, 4 putters, Järn go-to): putter alignment and a clean go-to; hover pill (dark, white text, disc unmoved); frame-sampled slide paths (putter straight up then forward, main forward and up, go-to up and forward); full visibility by pixel color; one disc at a time; details from the label or the disc with personal notes; Escape and empty-space deselect; keyboard; Show on Atlas; camera persistence (mouse and finger drags, through hover, slide-out, Escape and top view; targets follow the turn); top view. 36 screenshots: hover label, slid-out putter, slid-out main disc, details from a clicked label, held rotation and top view, in Light, Midnight and Charcoal at 1440 px and 360 px. Gallery: [outputs/bag-3d/slide-out/screenshots.html](../outputs/bag-3d/slide-out/screenshots.html).
- `tests/bag-3d-browser.mjs` (new, port 8802, `work/bag-3d/d1-qa`). Lazy loading by network log. Live sync: after each change, the rendered 3D state (read from the materials) and the hit layer must equal `/api/bag`, with no navigation. Parity counts. Color fidelity. Open/close. Drag and scroll behavior. Sizes. The phone performance profile. 39 screenshots: open with go-to, closed, mid-fold, lifted main, lifted go-to, the list, in Light, Midnight and Charcoal at 1440 px and 360 px, plus bag color and S/L. Gallery: [outputs/bag-3d/screenshots.html](../outputs/bag-3d/screenshots.html) · [qa.json](../outputs/bag-3d/qa.json). The SVG-era shots are kept for comparison in `outputs/bag-3d/baseline-svg/`.
- The existing suites keep every behavioral check. Only assertions that read SVG internals were ported to their 3D equivalents:
  - `bag-scene-browser`: SVG layer ids became the canvas + hit-layer structure. CSS `--bag-*` variables became the bag color read back from the fabric material. "Lifted top inside the SVG opening" became "lifted disc inside the canvas" plus the 3D disc being lifted. Clicks on the SVG body became clicks on the canvas body. The lid `transform` and paused Web Animations became flap progress under the virtual clock: one pause per theme and width, at 110 ms and 450 ms.
  - `bag-v13-browser`: slot centers are measured from the hit layer in the former 800×1000 units. "Go-to x = 400" became "centered over the main compartment". "Putters flank the go-to" became "putters ride in the top pocket, above the go-to's front pocket". "No raster in the canvas" became "canvas buffer matches its displayed size". The go-to ring class check became the 3D layout state.
  - `bag-pockets-browser`: SVG transform `y` became hit-layer centers.
- Results: 66/66 unit tests. All five existing browser suites and the new 3D suite pass. The baseline at HEAD was green before the port.

## Pocket arrangement (correction)

Putters ride in the **top** pocket and the go-to disc sits in the **front** pocket above the main compartment, matching a real bag. The first version had these reversed. `bag-layout.mjs` now defines the pockets by location (`TOP`, `FRONT`) and maps `PUTTER` to the top and `GOTO` to the front. The viewer carries the GLB's go-to accent rim and dashed outline from the top pocket, where the model authors them, to the go-to's front seat. Screenshots of putters only, go-to only, both, and an empty go-to, at desktop and 360 px: `outputs/bag-3d/pocket-check/`.
