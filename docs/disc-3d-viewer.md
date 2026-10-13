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
- `public/disc3d/overmold.mjs`: the verified overmold list (`isOvermold`) and the rim/plate colours (`overmoldColors`), pure JS.
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

## Overmold rims in two colours (Plan 12)

Overmold discs, such as MVP's and Axiom's GYRO molds, mold the rim as a separate piece from the flight
plate, usually in a second colour. The viewer draws these discs in two materials. Every other disc is
still drawn in one material, and its pixels match the pre-overmold build exactly: 96 renders of 32
non-overmold molds were compared byte for byte, in three views and five colours.

- **Detection is per disc, never per brand.** `public/disc3d/overmold.mjs` holds a verified list keyed by
  PDGA manufacturer and PDGA record name (`d.manufacturer`, `d.name`). A record's own boolean `overmold`
  flag, if one is ever added to `data.json`, wins over the list. The Innova Atlas proves the point: it
  is an overmold, while the Destroyer is not. So does Streamline, MVP's sister brand, which molds in one
  piece. Discs that are only two-tone in colour (swirls, bursts, blends) are not overmolds.
- **The split.** `overmoldProfile(shape)` in `shape.mjs` returns the usual profile with one extra point on
  top, at r = R − rim width (the measured PDGA rim width), and marks which edges belong to the rim. The rim
  covers the top of the inner wall, the foot, the wing, the nose and the shoulder, and it meets the plate
  at that point. Underneath, it meets the plate at the top of the inner rim wall. The viewer builds one
  `LatheGeometry` and reorders its index into two groups: the plate (material 0) and the rim
  (material 1). The vertices and normals are unchanged, so the seam shades smoothly. The triangle count is
  the same as before, give or take one ring.
- **Colours.** `overmoldColors(base, {rim, plate})`. By default the plate keeps the disc's colour and
  the rim is black (`DEFAULT_RIM_COLOR`, `#0a0a0a`) on every overmold disc, whatever the plate colour. Either colour can be overridden: `Disc3D.sync(panel, d, {color, colors: {rim,
  plate}})`, with the viewer prop `colors`. Overrides are ready for the planned per-disc bag colour
  choices, and unreadable values fall back to the defaults. The stamp's ink follows the plate colour.
- **Tests.** `tests/disc3d-overmold.mjs` (Node) covers the list, the seam and the colours.
  `tests/disc3d-browser.mjs` checks that Envy, Volt and Atlas draw two materials split at the measured
  rim width, both in the geometry and on screen. It also checks that Streamline's Drift, the Destroyer
  and the Buzzz stay one material, that the colour overrides work, and that the phone renders correctly.
  It writes the review board `outputs/disc3d/overmolds.png`.

### The verified list and its sources (Oct 2026)

| Discs | Evidence |
|---|---|
| MVP (51 molds) and Axiom (32 molds) | [MVP: GYRO overmold](https://mvpdiscsports.com/technologies/gyro-overmold/), a two-step molding process. Retailers file these molds under GYRO. The Beam is confirmed as a Proton double mold ([Infinite Discs](https://infinitediscs.com/mvp-beam/proton)) and the retooled Time-Lapse as GYRO. |
| Streamline (excluded) | "Unlike the existing Axiom and MVP brands, Streamline discs will not feature the double mold 'Gyro' technology" ([Infinite Discs blog](https://blog.infinitediscs.com/?p=17100)) |
| Innova Atlas | "The Atlas is the first disc manufactured by Innova that combines two different plastics in the same disc" ([Infinite Discs](https://infinitediscs.com/Innova-Atlas)) |
| Innova Nova | "XT Nova discs are made of two separate chemically bonded pieces" ([Pro Disc Golf](https://www.prodiscgolf.net/xt-overmold-nova)) |
| Innova Avatar | "an overmold midrange disc", Double Mold plastic ([Infinite Discs](https://infinitediscs.com/Innova-Avatar)) |
| Latitude 64 Bryce, Gobi, Sarek, Zion | Opto flight plate with a Gold Line overmold rim ([Infinite Discs blog](https://blog.infinitediscs.com/?p=17312), [Zion](https://infinitediscs.com/Latitude-64-Zion)) |
| Yikun Meteor Hammer, Tomahawk, Twin Swords | Tortoise Line "SHELL" overmold, with a soft rim on a stiff flight plate ([Twin Swords](https://infinitediscs.com/Yikun-Twin-Swords/Tortoise-Line), [Tomahawk](https://infinitediscs.com/yikun-tomahawk/tortoise-line), [Meteor Hammer](https://infinitediscs.com/yikun-meteor-hammer)). Yikun also sells these molds in single-mold plastics, but the model draws the overmold run. |

The rest of the catalog was searched manufacturer by manufacturer, and no other overmolds turned up.
The following are still open:
- MVP's Mass (approved Aug 2026) and Axiom's three Simon Line Balance prototypes are left off until each
  is confirmed. They are unrated, so the viewer doesn't draw them today.
- A search budget ran out before 16 small manufacturers were checked: ProtoFlyte, Premier Discs, Lucky
  Discs, FotCot, True Par, Lightspeed, Momentum Disc Golf AB, UB Hand Candy, CHING Disc Golf, Tomahawk
  Specialty, Plastic Paradise, Appalachian Mountain, Evolvent, OZDG, Synergy and Deity.
- ODDGRIP's G1 uses an "undermold" (material added under the plate). It is not a separate rim, so it is
  excluded.

## Pop-out (Oct 2026)

Clicking the panel's viewer, or its Enlarge button (top right of the canvas), opens the disc in a larger modal.
A drag that moves more than 6 px, a press held over 600 ms or a pinch is never a click, so turning and zooming
the panel viewer work as before.

- **Same component.** The modal is a second `createDiscViewer()` from `viewer.mjs`, given the panel viewer's
  props (`viewer.state.props`, so overmold rim/plate colours and custom colours match) and its pose. It has
  128 lathe segments on fine pointers (72 on coarse), since it is drawn large. Everything else is shared:
  Top/Profile/Bottom/Flip, the tilt slider mirrored by throwing hand, drag, wheel, pinch and the arrow keys.
- **Pose hand-off.** `getPose()` and `applyPose()` carry camera angle, zoom (relative to the fitted distance, so
  it survives the size change), preset, tilt and flip. The modal starts from the panel's pose and, on close,
  hands its pose back. The panel viewer itself is not touched while the modal is open.
- **Dialog.** A native `<dialog>` (`disc3d.js`), like the site's others: `showModal()` makes the page inert and
  keeps Tab inside, Escape closes it, and the backdrop uses the site's dialog style, with the site's tokens
  for both themes. A click on the backdrop closes it, but not a drag that began inside and ended over it.
  The page behind does not scroll while it is open (the scrollbar's width is kept).
- **Focus.** On open it moves to the modal's canvas (arrow keys turn it at once). On close it returns to the
  element that opened it: the Enlarge button, or the canvas when it was a tap on the canvas.
- **Lifetime.** The modal's viewer is built per opening and disposed on close, including
  `renderer.forceContextLoss()`, so repeated openings do not accumulate WebGL contexts. One `<dialog>` element is reused.
- **Phones.** Within 8 px of the screen edge, 44 px controls, a flexible canvas (`dvh`), and a compact landscape
  layout (caption and hint hidden below 520 px of height). The panel's hint says "tap to enlarge" there.
- **API.** `Disc3D.open()`, `Disc3D.close()` and `Disc3D.popout` (the modal's viewer, or null) are for tests.
- **Tests.** `npm run test:disc3d:popout` (also part of `test:disc3d`): open, close (Escape, ×, backdrop, drag
  that ends outside), focus in and back, Tab containment, same model and colours (Destroyer, Envy with custom
  colours), all controls, theme, repeated open and close, and a 390 px phone with touch rotate, pinch and
  landscape. Shots go to `outputs/disc3d-popout/`.

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
- Plan 12 (done): overmold discs in two colours. Next: per-disc rim/plate colour choices in the bag, wired through `colors`.
- Phase 3: a plastic picker using PBR materials (`PLASTICS` in `viewer.mjs` holds two finishes today),
  stamp decals, a 3D comparison overlay, and flight-path animation.
