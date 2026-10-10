# 3D disc viewer (Plan 09, phases 1 and 2)

The detail panel draws the selected disc as an interactive 3D model. You can drag to turn it, scroll
or pinch to zoom, use the preset views (3/4, Top, Profile, Bottom), flip it over, and tilt it from
anhyzer to hyzer. The tilt is mirrored for the throwing hand chosen in the flight sketch. Discs
without flight numbers keep the static illustration. Since phase 2, each mold is shaped and scaled from
its own PDGA dimensions.

## Files

- `public/disc3d/shape.mjs`: the parametric generator, pure math with no three.js. `discProfile(params)`
  traces the cross-section from the axis back to the axis. `shapeFromMeasurements(specs, flight)` turns a
  mold's PDGA dimensions into params (phase 2), `shapeFromFlight(disc)` is the phase 1 generic shape, and
  `shapeForDisc(props)` picks between them and reports the source.
- `public/disc3d/viewer.mjs`: `createDiscViewer()`, which spins the profile with `LatheGeometry` and
  owns the camera, controls and UI. It takes the props `{model, specs, flight, mold, color, plastic, hand}`.
- `public/disc3d.js`: `window.Disc3D`, the panel glue. `markup(d, poster)` returns the 3D host, or null
  for the fallback. `sync(panel, d, opts)` mounts the one shared viewer.
- `public/disc3d.css`: styles for the stage, toolbar and tilt control.
- Tests: `npm run test:disc3d` runs the shape rules (`tests/disc3d-shape.mjs`) and the per-mold rules
  (`tests/disc3d-molds.mjs`) in Node, then the panel in Chromium (GPU flags; set `PLAYWRIGHT_MODULE`).
  The browser suite writes its screenshots to `outputs/disc3d/`, including `molds-side-by-side.png`
  and `molds-random-ten.png`.

## Shape parameters

| Param | Meaning | From flight numbers |
|---|---|---|
| `rimWidth` | nose to inner rim wall (cm) | 0.95 (speed 1) to 2.4 (speed 14) |
| `rimDepth` | foot to underside of plate (cm) | 1.65 down to 1.15 |
| `domeHeight` | centre rise above the shoulder (cm) | ~0.3 at speed 1 down to ~0.22 at speed 14, then minus 0.035 × stability |
| `sharpness` | 0 round blunt nose, 1 thin sharp nose | (speed − 3) / 9 |
| `bevel` | lower wing: −1 convex, 1 concave | follows sharpness, plus 0.05 × stability |
| `partingLine` | nose height ÷ shoulder height | 0.5 to 0.42 with sharpness, plus 0.012 × stability |
| `diameter`, `plate` | outer diameter, plate thickness | 21.2, 0.22 |

"Stability" here is the panel's own index, turn + fade, clamped to the range −4 to 5. It changes only
the look of the model, never map placement.

Rules built in:
- The underside is always a hollow plate: a thin flight plate over a cavity more than 1 cm deep.
- Rim sharpness, width and lower-wing concavity scale with speed.
- Flatter tops go with more stability, as the brief asks. The disc-atlas-stability skill warns
  against drawing overstability by flattening alone, so the same stability term also nudges the
  parting line up and the lower wing more concave. All three cues are small, and speed still sets
  the rim: an understable driver still looks like a driver.

## Per-mold shapes from PDGA dimensions (phase 2)

Every record in `data.json` carries its PDGA certification dimensions in `specs`: `Diameter`,
`Height`, `Rim width` and `Rim depth`. They are strings in centimetres, rounded to 0.1 cm, and all
2,434 records have all four. The generator already works in centimetres, so no unit conversion is needed.

The shape source is chosen in this order: `d.model3d` explicit params, then the PDGA dimensions, then
the phase 1 shape from flight numbers.

| Param | From the PDGA dimensions |
|---|---|
| `diameter`, `rimWidth`, `rimDepth` | as measured |
| `plate` | half of the gap (height − rim depth), from 0.12 to 0.22 cm |
| `domeHeight` | the rest of the gap, minus 0.01 × stability |
| `sharpness` | the average of rim width ((w − 1.1) / 1.1) and speed ((speed − 3) / 9), each from 0 to 1; rim width alone when unrated |
| `bevel`, `partingLine` | as in phase 1, from that sharpness and stability |

- **Height.** The model stands as tall as PDGA measured, to their 0.1 cm rounding. The exception is a
  gap under 0.12 cm, too small for a plate; only Ace Race 2024 has one, and its model runs 0.12 cm
  taller than its listed height.
- **Sharpness.** Rim width tracks speed closely across the catalog: a median of 1.0 cm at speed 2,
  1.4 cm at speed 5 and 2.3 cm at speed 12. Measured rim width is therefore a good proxy for the nose.
  Averaging it with speed lets a mold's own rim move it off its speed class.
- **Stability.** Phase 1's judgment call stands. A flatter top still goes with more stability, but the
  cue is only 0.01 cm per point (at most 0.05 cm), inside PDGA's rounding, so the measured dome is what
  shows. The parting-line and bevel cues are unchanged.
- **Scale.** The camera frames a fixed 22 cm disc rather than the selected one, so molds show at true
  size. A 21.7 cm Buzzz draws 3% wider than a 21.1 cm Destroyer. Golf discs are 21 to 22 cm, so the
  difference is real but small. Discs over 22 cm are framed by their own diameter.
- **Who gets 3D.** The viewer is still offered to rated discs only (1,182 of 2,434). Unrated records have
  dimensions too, and `shapeFromMeasurements` handles them (sharpness from rim width alone), but many
  are not golf discs (ultimate and catch discs, up to 27.6 cm). Opening 3D to them is a product decision
  left for later.
- `normalizeShape` now allows a dome up to 1.5 cm (was 0.8), because tall putters such as the Nova
  (2.7 cm) need about 1 cm.
- The caption and canvas label say which source drew the disc.

## Lazy loading and performance

`three` resolves through the import map in `web/index.html`, which points to the vendored three.js
0.180 that the 3D bag already uses (MIT, `public/bag3d/vendor/three/LICENSE`). Neither three.js nor
the viewer loads with the atlas. They load the first time a rated disc is shown in a visible panel.
On page load the hidden panel is warmed, so the glue waits for it to be shown.

One renderer is reused for every disc, and it draws only while something moves. Each disc is
80 lathe segments (56 on coarse pointers), about 11.5k triangles including the stamp.

The panel's DOM diff (`updateDetail` in `app.js`) skips any `[data-sync-keep]` node, so re-renders
keep the canvas.

## Stamps and data rights

The stamp is generated text: the disc's name inside two rings. No manufacturer artwork is used, and
none should be until brand permission exists. No third-party mold data is used:
per-mold shapes come only from the PDGA certification dimensions already in `data.json`.

## Later phases

- Phase 2 (done): per-mold profiles from the PDGA dimensions in `data.json`.
- Phase 3: a plastic picker using PBR materials (`PLASTICS` in `viewer.mjs` holds two finishes today),
  stamp decals, a 3D comparison overlay, and flight-path animation.
