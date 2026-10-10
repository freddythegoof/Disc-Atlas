# 3D disc viewer (Plan 09, phase 1)

The detail panel draws the selected disc as an interactive 3D model. You can drag to turn it, scroll
or pinch to zoom, use the preset views (3/4, Top, Profile, Bottom), flip it over, and tilt it from
anhyzer to hyzer. The tilt is mirrored for the throwing hand chosen in the flight sketch. Discs
without flight numbers keep the static illustration.

## Files

- `public/disc3d/shape.mjs`: the parametric generator, pure math with no three.js. `discProfile(params)`
  traces the cross-section from the axis back to the axis, and `shapeFromFlight(disc)` turns flight
  numbers into params.
- `public/disc3d/viewer.mjs`: `createDiscViewer()`, which spins the profile with `LatheGeometry` and
  owns the camera, controls and UI. It takes the props `{model, flight, mold, color, plastic, hand}`.
- `public/disc3d.js`: `window.Disc3D`, the panel glue. `markup(d, poster)` returns the 3D host, or null
  for the fallback. `sync(panel, d, opts)` mounts the one shared viewer.
- `public/disc3d.css`: styles for the stage, toolbar and tilt control.
- Tests: `npm run test:disc3d` runs the shape rules in Node, then the panel in Chromium (GPU flags).
  The browser suite writes its screenshots to `outputs/disc3d/`.

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
none should be until brand permission exists. No third-party mold data is used. Every record in
`data.json` carries PDGA specs (diameter, height, rim width, rim depth). That is the natural phase 2
source, and it goes in through `d.model3d` or `model` explicit params.

## Later phases

- Phase 2: per-mold profiles from PDGA-verified measurements.
- Phase 3: a plastic picker using PBR materials (`PLASTICS` in `viewer.mjs` holds two finishes today),
  stamp decals, a 3D comparison overlay, and flight-path animation.
