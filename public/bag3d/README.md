# Charcoal disc-golf backpack

A clean, unbranded web approximation based on `bag-preview.png`, with the front putter pocket and top grab-and-go pocket arranged like the supplied Grip EQ BX3 photos. The existing shell, side compartments, handle, straps, controls, lighting, and floating motion are preserved.

The main compartment opens to reveal twelve individually configurable discs. Its flap lifts clear of the disc rims, folds inward, and parks behind them against an interior Velcro landing. Closing reverses the same motion. Trim conforms to the fabric surfaces, side panels share their seams with the compartment shell, and the lower shoulder straps pass over the lumbar pad.

## Files

- **charcoal-bag.glb** — self-contained glTF 2.0 web asset, including the fabric normal texture. No decoder or extension required.
- **charcoal-bag.gltf**, **charcoal-bag.bin**, **fabric-normal.png** — equivalent editable glTF bundle. Keep all three together.
- **index.html** — standalone Three.js viewer, including URL configuration.
- **viewer.mjs** — reusable `mountBag()` module and `parseDiscParams()` export.
- **disc-state.mjs**, **disc-features.mjs** — disc configuration, validation, independent materials, and pocket placement.
- **motion.mjs** — original floating animation.
- **vendor/three/** — local Three.js 0.180.0 modules and MIT license. No CDN requests at runtime.

Copy this entire folder into your site's public/static assets. Preserve the relative paths, or resolve the Three.js imports through your bundler.

## Preview and URL parameters

Serve this folder through a local static web server, for example:

```sh
python -m http.server 8080 --bind 127.0.0.1
```

Open `http://127.0.0.1:8080/`. Module imports and model loading require HTTP; opening the HTML directly as a file will not work.

The existing controls open/close the compartment, pause/resume floating, reset the camera, inspect front/rear, and switch backgrounds. Drag to orbit and scroll/pinch to zoom. Reduced-motion preferences, hidden-page pausing, and the brief pause after dragging still apply. Pausing the float keeps the compartment responsive.

All disc indices are **zero-based, 0–11**. They identify the original main-compartment positions from left to right when viewed from the front. IDs stay the same when discs move between pockets.

| Parameter | Example | Behavior |
| --- | --- | --- |
| `colors` | `colors=ff0000,00ff00,0000ff` | Colors slots 0, 1, and 2. Comma positions correspond to slot IDs. |
| `putters` | `putters=1,2` | Moves these discs into the distinct front pocket, behind the unbranded Velcro patch panel. |
| `goto` | `goto=4` | Moves one disc into the top pocket with an accent rim and subtle glow. |
| `goto` omitted, empty, or `none` | `goto=none` | Leaves the top slot empty with a dashed disc outline. |
| `compartment` | `compartment=open` | Starts with the main flap opening. |
| `motion` | `motion=off` | Starts with floating motion paused. |
| `view` | `view=front` or `view=rear` | Sets the initial camera view. |
| `background` | `background=transparent` | Transparent canvas/page, with no floor shadow. |
| `embed` | `embed` | Hides the header and controls for iframe embedding. |

Colors accept three or six hex digits. Use hex without `#` in URLs, or encode `#` as `%23`. Empty color entries keep that slot's original look: `colors=ff0000,,0000ff` changes only slots 0 and 2. Malformed URL entries are ignored individually; valid entries still apply.

Example showing all three features:

```text
index.html?colors=ff615a,ffffff,1e88e5,46b6aa,ffcc66,c37dcc&putters=1,2&goto=4&compartment=open&view=front
```

Transparent iframe example:

```html
<iframe
  src="/floating-bag/index.html?embed&background=transparent&colors=ff615a,ffffff,1e88e5&putters=1&goto=2&compartment=open"
  title="My disc-golf bag"
  style="width:100%;height:560px;border:0;background:transparent"
></iframe>
```

URL parameters configure `index.html` when the page loads. For live updates from your site, mount the viewer directly and call its methods below. The neutral background retains the original soft contact shadow.

## JavaScript API

Use this import map before importing `viewer.mjs`, or resolve `three` and its addons through your bundler:

```html
<script type="importmap">
{"imports":{
  "three":"./vendor/three/three.module.min.js",
  "three/addons/":"./vendor/three/addons/"
}}
</script>
<div id="bag" style="height:480px"></div>
<script type="module">
  import { mountBag } from './viewer.mjs';
  const viewer = await mountBag(document.querySelector('#bag'), {
    background: 'transparent',
    discColors: [{ slot: 1, color: '#ffffff' }],
    putterSlots: [1],
    goToDisc: null
  });
  viewer.setDiscColors([
    { slot: 0, color: '#ff0000' },
    { slot: 2, color: '#0000ff' }
  ]);
  viewer.setPutterSlots([1, 2]);
  viewer.setGoToDisc(0);
  viewer.setCompartmentOpen(true);

  // Clear the top slot; disc 0 returns to its assigned pocket.
  // viewer.setGoToDisc(null);
  // Restore a disc's original color.
  // viewer.setDiscColors([{ slot: 0, color: null }]);
  // Call viewer.dispose() when unmounting a component.
</script>
```

| Method/property | Meaning |
| --- | --- |
| `setDiscColors([{slot, color}, ...])` | Patches only listed slots; other colors remain unchanged. Accepts `#rrggbb`, `rrggbb`, or shorthand hex. `color: null` restores that slot's original material color. |
| `setPutterSlots([slot, ...])` | Replaces the putter assignment list. `[]` returns putters to the main compartment, except the current go-to disc. Duplicates are collapsed. |
| `setGoToDisc(slotIndex)` | Assigns exactly one top disc. `null` clears the top slot and shows the dashed outline. |
| `getDiscState()` | Returns a fresh array of `{slot, color, defaultColor, isPutter, isGoTo, location}`. `location` is `main`, `putter`, or `goTo`. |
| `discCount` | Number of available IDs; this model contains 12. |

The go-to assignment takes precedence over putter placement. A disc appears only once and retains its color. Clearing go-to returns the disc to the front pocket if it is still assigned as a putter, or to its original main slot otherwise. Main-slot gaps are retained. Putters face forward above the front patch panel; main discs remain upright side by side. Multiple putters form a shallow stack in the front pocket, with thinner spacing for large lists.

API calls validate the entire input before changing state. Invalid colors throw `TypeError`; noninteger/out-of-range IDs throw `RangeError`. Listen on the mounting container for `discstatechange` to receive the latest array in `event.detail` after updates.

`mountBag(container, options)` also accepts `modelUrl`, `background`, `animated`, and `onReady`. `onReady` receives `{triangles, meshes, discCount}`. Initial disc options are `discColors`, `putterSlots`, and `goToDisc`, as above. Its existing methods remain `setCompartmentOpen(bool)`, `setAnimated(bool)`, `setBackground('neutral'|'transparent')`, `view('home'|'front'|'rear')`, and `dispose()`, with `compartmentOpen` and `animated` state properties. Compartment direction can be reversed while it is moving.

To use the same URL parsing in your own mounting page:

```js
import { mountBag, parseDiscParams } from './viewer.mjs';
const config = parseDiscParams(location.search, 12);
const viewer = await mountBag(container, {
  discColors: config.colors,
  putterSlots: config.putters,
  goToDisc: config.goTo
});
// config.issues contains messages for ignored invalid URL entries.
```

## GLB integration and animation

Load `charcoal-bag.glb` with `GLTFLoader`. It uses meters, Y up, and +Z as the front. The original closed bag shell is approximately **45.3 × 55.6 × 33.7 cm**, including the handle and straps. The new front pocket and top disc outline extend the overall visual bounds to approximately **45.3 × 59.9 × 37.9 cm**. The bottom is at Y = −0.256 m.

The GLB includes twelve separate `DiscSlot00`–`DiscSlot11` nodes, each with glTF extras `discSlot` (0–11) and `role: 'disc'`, available as Three.js `userData`. It also contains physical `PutterPocket` and `GoToPocket` nodes, plus `GoToPlaceholder` and `GoToAccent` visual nodes. The default exported model places all twelve discs in the main compartment, with the empty top outline visible. Colors and assignments are applied by the viewer at runtime; downloading the GLB does not bake current viewer choices into the file.

The **OpenCloseCompartment** animation lasts 2.15 seconds and uses three morph targets for lift, inward fold, and stow. It starts closed. Play forward to open and backward to close using `AnimationMixer`, or call `setCompartmentOpen()`. The flap, stitched trim, and pulls move together; the rim stays attached to the shell. This is an authored fold rather than fabric physics.

The viewer separately adds the unchanged floating motion: ±8 mm bobbing on a five-second cycle and one turn every two minutes. These values live in `motion.mjs`.

## Asset budget and validation

- 47,617 triangles, 38,767 vertices, 25 meshes, and 33 material batches.
- 1,832,664 bytes (about 1.83 MB), before HTTP compression.
- One 128 × 128 tileable fabric normal texture embedded in the GLB.
- Matte charcoal PBR fabric, black rubber/binding, gunmetal hardware, and a subtle teal top-slot accent.
- No logos or brand markings.
- Checked GLB/glTF equivalence, binary layout, finite geometry, normals, indices, triangle winding, and file budget.
- Regression checks cover unchanged original bag vertices, trim seating, side seams, lumbar strap clearance, fold targets, and floating motion.
- Disc checks cover independent colors, original defaults, invalid input, URL parsing, pocket precedence, restored transforms, and no duplicate discs. The real model is loaded and visually checked in the supplied viewer.

This is a visual web approximation, not measured product geometry or a manufacturing model. Fabric folds and tiny stitching details are simplified.

## Disc Atlas integration (extensions to this viewer)

Disc Atlas mounts this viewer directly in the My bag page (`public/bag-scene.js`), with no iframe. three.js and `charcoal-bag.glb` load on demand, through the page's import map, only when the Bag tab first shows a signed-in bag. Everything above still works unchanged: the 12-ID disc API, URL parsing, orbit controls and the original defaults. These additions are opt-in:

| Option | Meaning |
| --- | --- |
| `layout: {main, putter, goTo}` | Arbitrary slot counts. Each entry is a disc (`{id, color}`) or `null` for an empty slot. Layout mode hides the GLB's twelve fixed discs and builds slots from the same disc mesh. Empty main and putter slots render as faint ghosts. Disc Atlas seats putters in the top pocket and the go-to in the front pocket, moving the GLB's accent rim and dashed outline there. An empty go-to slot shows the dashed outline. (The 12-ID API above keeps the model's original arrangement.) |
| `bagColor` | Fabric color. Panels, piping, padding and seam thread keep their tonal ratio to the shell. Zipper tape, teeth and hardware stay fixed. `null` restores the original charcoal. |
| `accentColor` | Go-to accent rim and glow (Disc Atlas passes the theme's `--lime`). |
| `interaction: 'turntable'` | Replaces orbit/zoom with a horizontal drag that eases back to the front. `touch-action: pan-y` and no wheel capture keep page scrolling intact. `'orbit'` (the default) loads OrbitControls on demand. |
| `turn: false` | Disables the slow continuous rotation, so the front pockets stay facing the viewer. |
| `view: 'page'` | A three-quarter framing for a 4:5 box. |
| `compartmentDuration` | Flap fold time in seconds (the clip is 2.15 s; Disc Atlas uses 0.75 s). |
| `quality: 'auto'` | Detects software WebGL (SwiftShader, llvmpipe). It then drops MSAA, caps the pixel ratio at 1, skips ambient motion and draws motion at half resolution, settling on one full-resolution frame. |
| `toneMapping: 'neutral'` | Khronos PBR Neutral tone mapping at exposure 0.75. Disc faces render close to their chosen hex, where ACES (the default) washes bright, camera-facing discs toward pastel. |
| `maxPixels`, `ambientFps` | Cap the drawing buffer, and throttle the ambient float when nothing else moves. |

Added methods: `setBagLayout(slots)`, `setBagColor(hex|null)`, `bagColor` (read back from the shell material), `customBagColor`, `setAccentColor(hex)`, `liftDisc(id|null, {instant})`, `liftedDisc`, `turnHome()`, `discRects()` (container-pixel slot rectangles at rest: columns for main slots; domes for pocketed discs, clipped at the pocket mouth), `discScreenRect(id)` (current pose), `clipped` (filled slots beyond the illustrated maximum: 48 main, 8 putter, 6 go-to), `getBagLayoutState()` (rendered discs, read from their materials), `compartmentProgress`, `renderer` (`{pixelRatio, width, height, rendering, visible, quality}`) and `invalidate()`. `setCompartmentOpen(open, {instant})` now returns a promise that settles when the flap finishes. A timer settles it even when no frame runs, for example offscreen or in a hidden tab.

Slide-out and top view: `slideDisc(id|null, {instant})` pulls one disc out of its pocket to a face-on resting place just above the view center (whatever the camera angle; it stays in front of the bag body) and returns a promise that settles when it arrives. `slidDisc` names it, and `slideRect()` gives its resting rectangle in container pixels, for a label. `setTopView(on, {instant})` moves the camera on a sphere around the bag, from wherever it is to straight above (front pocket at the bottom) or back to the starting view, over 0.6 s with ease-in-out; it returns a promise that settles with the final state. While above, the fabric fades to 9 % opacity with a faint cool glow, so the main compartment reads through the top panel in light and dark pages, and a hovered disc rises toward the camera instead of out the front. In `orbit` mode the controls pause during the move and the polar limit is lifted while above. `prepareTopView()` compiles the translucent fabric early (call it on hover or focus of a toggle). Also: `topView`, `cameraMoving`, `cameraState` (`{polar, azimuth, radius, xray}`), `pocketRects()` (each pocket's volume in container pixels) and `projectPoint([x, y, z])`.

Added events on the container: `bagviewlayout` (after a resize, layout or view change; reposition anything aligned to `discRects()`), `bagclick` (a press without a drag), `bagdragstart`/`bagdragend`, and `compartmentchange`.

Rendering is on demand. The loop runs only while something moves or the float is active. It stops while the container is offscreen or the page is hidden.

`bag-layout.mjs` holds the placement math without three.js, and `tests/bag-3d-layout.mjs` unit-tests it in Node.
