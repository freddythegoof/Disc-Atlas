# 3D discs on the atlas (Plan 16)

Since October 11, 2026, the main Flight Atlas draws every disc as its 3D model, seen from straight above like
a disc lying on the ground. Each disc uses the model the detail panel's viewer draws (see
`docs/disc-3d-viewer.md`): its mold's shape from its PDGA dimensions, and overmold molds in two colours.
Everything else is unchanged: which discs show, where they sit, how big they are, their names, the three
depth tiers (`docs/atlas-organic.md`), clicking, hovering, filters and the palette. My Map keeps its 2D
discs.

## How it works

- `public/disc3d/atlas-art.mjs`: one offscreen three.js renderer with an orthographic camera looking
  straight down renders each disc once per size class into a small image, its **render**.
  `createAtlasArt()` is async. Setting up takes a few long tasks (the WebGL context, the environment map,
  the shaders), so it yields between them, and it starts while `data.json` is still loading.
- `public/disc3d/mesh.mjs`: the lathe geometry and the overmold split, now shared by the viewer and the
  atlas.
- `public/atlas-map.js`: the glue (`discArt`, `syncMarkerArt`, `warmArt`, and the art branch in
  `drawGaps`).
  - A curated disc or dot keeps its DOM button. Its `.disc-art` gets the render as a `<canvas>` child, and
    the orb's paint gives way (`.has-3d` in `public/cosmic.css`). The orb's drop shadows stay, on the same
    round box. Hover lift, selection, halos, outlines, arrival and retirement fades all still come from the
    DOM, so they apply to the render unchanged.
  - Small discs and minis are still blits on the map canvas: the orb sprite's drop shadows
    (`gapSprite(color, true)`), then the render on top.
- **Why renders and not live meshes.** Seen from above, with the light fixed and the discs never turning,
  a live mesh would redraw the same pixels every frame. A cached render makes a pan or zoom cost no more
  than the 2D orbs did, on any phone. The live-mesh plan's goals are all met:
  - **Shared geometry.** Molds are radially symmetric, so one geometry per shape and level of detail
    serves every disc and colour that uses it.
  - **Culling.** Only discs about to be drawn on screen are rendered.
  - **LOD by tier.**

  | Level | Serves | Segments | Profile detail | Image (CSS px) |
  |---|---|---|---|---|
  | full | 64 px and up: curated discs and dots (76 px × artRoom, up to 94) | 96 | 1 | 96 |
  | mid | 24–64 px: small discs at 1x (51 px) | 48 | 0.6 | 64 |
  | low | up to 24 px: minis at 1x (12 px) | 24 | 0.35 | 24 |

  Images are drawn at the screen's pixel ratio, capped at 2. The level follows the disc's size on screen,
  so at 1x it follows the tier. A small disc or mini that grows past its level as you zoom in is drawn
  again at the next level. Until then it shows its smaller image, scaled up. Every level is the full
  lathe model with fewer segments and profile points. The underside is never visible from above, but it
  costs nothing after the one render.
- **Budget.** Missing renders are drawn in `draw()` within `ART_BUDGET` (6 ms) a frame. The first frame
  after the renderer is ready gets `ART_FIRST_BUDGET` (250 ms), so the map fills in one go. Idle time
  draws the discs of the levels on either side of the camera's ahead of time, so a zoom usually finds
  them ready. A disc still waiting shows its orb, then crossfades to its render over `ART_FADE` (180 ms),
  matching the atlas's other fades.
- **Memory.** Renders are kept in an LRU capped by bytes (64 MB, 24 MB on coarse pointers). Geometries
  are kept in an LRU capped at 400.
- **Fallback.** The orbs stay if WebGL is missing, or if it runs only in software. Software rendering
  (SwiftShader, llvmpipe) takes about 50 ms a disc, so the atlas rejects it, using
  `failIfMajorPerformanceCaveat` and the renderer's name. The headless browser suites without GPU flags
  therefore run the 2D path, as before. Setting `window.ATLAS_3D_OFF = true` before load also keeps the
  orbs, for comparisons.
- `three` now loads with the atlas (the import map in `web/index.html`). The viewer module and its
  controls still load only when a disc's panel is shown.

## The look

- **Lighting.** The key light comes from the upper left, as the orbs' highlight did, at 35°. There is a
  weak fill, a hemisphere light, and a little environment (0.12): more makes the glossy top reflect white
  and washes out the colour. The plastic is the viewer's premium finish.
- **Slope shading.** From straight above, the shoulder is a narrow band of slope. The atlas's material
  darkens a surface by how far it turns from the viewer (`pow(normal.z, 2.5)`, at 85%), so the rim reads as
  a ring all the way round. The flight plate faces the camera and keeps its colour. A light from above
  would do the same, but it puts a mirror highlight on the glossy plate.
- **Colour.** Tuned so the plate draws at about its palette colour: within 82–112% of its luminance and
  10° of its hue. The colourblind-safe palette therefore still tells the types apart.
- **Size.** Each disc fills its art box (76 px on the curated tier). Every mold is framed by its own
  diameter, because the layout, halos, shadows and names are built around one disc size. The proportions
  are per mold: rim width against diameter, dome, nose. A 21.1 cm and a 21.7 cm disc draw at the same size
  on the map, but true to scale in the viewer.
- **No stamps on the map.** At 76 px a name stamp would be an unreadable smudge beside the disc's own
  label. The viewer keeps its generic name-only stamp, and no manufacturer artwork is used anywhere.

## Tests

- `npm run test:atlas:3d` (`tests/atlas-3d-browser.mjs`) uses a GPU (`--use-angle=d3d11 --enable-gpu` on
  Windows, or `BAG3D_CHROMIUM_ARGS`).
  - **Renders.** Every archetype and every rated overmold (91) must be round and solid. Its plate must be
    within its palette colour's luminance and hue. A plain rim must shade into a ring at least 10% darker
    than the plate and catch more light upper left than lower right. An overmold rim must be dark beyond
    the measured seam, with the plate's colour inside it.
  - **Levels of detail.** Thresholds, per-level resolution and segment counts must hold, and a recolour
    must reuse the shape's geometry.
  - **On the map.** Desktop and phone, dark and light, at 1x, 3x, 9x and a complete Axiom view (1x and 9x).
    Every curated disc and dot must carry its full render. Every small disc and mini must carry its level's
    render, fully faded in. Every disc's spot and size and every name's box must equal the 2D build's to
    the hundredth of a pixel.
  - **Interaction.** Hover must lift the render 6% and return it. Clicking discs must open their panels,
    with the viewer ready. A putter filter and an Innova + Discraft brand view must show only their discs,
    repainted in the view's colours.
  - **Fallback.** Without WebGL the orbs must stay.
  - Shots go to `outputs/atlas-3d/`: `renders.png` is the review board, and `*-2d.png` files show the
    orbs for comparison.
- `npm run test:atlas:3d:perf` (`tests/atlas-3d-perf.mjs`) times each frame's `draw()`, 3D against the 2D
  build. It runs a 1x→9x→1x flight over 240 frames, then 120 redraws of the full 1x view, cold and warm.
  It covers a desktop and an emulated mid-range phone (390 × 844 at 2x, touch, CPU throttled 4×), and
  fails if 3D's warm 95th percentile or long tasks are worse than the 2D build's beyond noise. The
  emulated phone throttles the CPU, not the GPU, so a check on a real mid-range phone is still worth doing.
  Results go to `outputs/atlas-3d/perf.json`.
- **Measured (Oct 11, RTX 3070 desktop; phone emulated).** `draw()` per frame, 95th percentile, 3D against 2D.

  | | Flight, warm | 1x redraw, warm | Flight, cold | Long tasks, cold |
  |---|---|---|---|---|
  | Desktop | 4.4 vs 3.7 ms | 1.1 vs 0.8 ms | 7.1 vs 3.8 ms | 0 vs 0 |
  | Phone | 8.8 vs 9.7 ms | 2.8 vs 2.7 ms | 13.4 vs 16.8 ms | 5 vs 2 (longest 59 vs 55 ms) |

  Once a disc's render exists, frames cost the same as with orbs. The first pass through new discs costs up
  to `ART_BUDGET` more per frame while they render. A render takes about 1.4 ms at full size and 0.4 ms for
  a mini (desktop GPU). Setting up takes about 0.7 s of main-thread work in five tasks, overlapping the
  catalog's download.
- The depth suite's pixel-exact checks (redraw hash, screenshot equality, fresh-page canvas) hold only on
  software rendering. Headless Chromium's GPU canvas varies by a few pixels from one draw to the next even
  with 3D off. On the GPU, with 3D on and only those three comparisons left out, every other depth rule
  passes.
- The depth suite's `settled` also waits for every on-screen render, so its redraw and determinism checks
  hold on a GPU. Six suites' static servers learned the `.mjs` type, so they load the art module as
  production does. The viewer suite now checks that the viewer, not three.js, stays unloaded until a
  disc is shown.
