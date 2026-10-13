# Grab the rim to tilt — October 13, 2026

Started in the main checkout, `C:\Users\user\disc-atlas`, with a clean tree at
`cee17cb59d4261acbb8fb49c0318e58fa67a0060`, after the slider investigation documented
in `docs/slider-drag-fix.md`. That investigation made no production slider changes.

## Interaction and grab zone

Both the detail panel and pop-out use the same gesture in `createDiscViewer()`.
Pointer down raycasts the actual disc body, excluding the stamp. A hit belongs to
the rim band when its mesh-local radius is at least 70% of the disc radius. This
works with the actual profile geometry, overmold materials, and clay materials.
Interior and off-disc presses continue through the existing OrbitControls path.

The hit must also have visible vertical leverage around the existing world-Z
tilt axis: the camera-space vertical component of `(-worldY, worldX, 0)`, divided
by disc radius, must have magnitude at least 0.15. This avoids interpreting a
front/back hit near the tilt axis as an edge-lifting gesture. In Profile the
left/right edges are easy to grab; the central portion continues to orbit.
In 3/4 the outer shoulder and side edges are available. Bottom also works.

**Top deliberately orbits, including rim presses.** Looking down the disc's
normal, rotation around the tilt axis initially moves the edge in depth rather
than vertically on screen. A vertical rim gesture would communicate the wrong
axis. The same leverage test naturally excludes other camera angles where
vertical edge movement is ambiguous; the slider remains available at every view.

The sign of that projected leverage, combined with `hyzerSign(hand)`, makes the
grabbed edge follow the pointer through the existing `setTilt()` path. Pulling
up on the right raises the right; pulling up on the left raises the left.
`setTilt()` still owns integer snapping, the ±40° clamp, the hand convention,
the existing range input, its accessible value, and the readout.

## Sensitivity and feel

Sensitivity is `max(2, canvas height / 80)` CSS pixels per degree, locked at down:
**2.875 px/degree in the 230 px panel**; an enlarged 560 px canvas would use
7 px/degree. Thus a full canvas-height drag crosses the entire 80° range at
normal viewer sizes. The 2 px minimum avoids excessive sensitivity in an unusually
short stage. Zoom does not change the control gain.

The existing 6 px tap allowance is honored before the grab becomes a drag.
After that, moves immediately call `setTilt()` with displacement from the initial
press and tilt. There is no tilt tween, momentum, or release animation. The
camera's existing damping configuration is unchanged.

Before: dragging a rim orbited the camera, so lifting one edge required the
slider. After: six stepped upward moves produce 3°, 6°, 9°, 12°, 15°, and 18°
(mirrored for the opposite edge/hand), with the slider and readout agreeing at
every step and the grabbed mesh point rising on screen. This is an automated
mouse/touch feel check, not a claim of physical-phone testing. Top is the
intentional exclusion described above.

## Orbit, capture, taps, and cleanup

Capture-phase canvas listeners intercept only a rim press, before OrbitControls
registers it. They save and disable `controls.enabled`, capture the pointer, and
cancel any camera preset tween at its current presentation. Up, cancel, lost
capture, window blur, and disposal restore the saved enabled state; capture
keeps moves and releases working outside the canvas.

When a second pointer arrives, the grab ends. Because OrbitControls never saw
the first down, the viewer dispatches one guarded synthetic down at the first
pointer's current position, then lets the real second down reach OrbitControls.
Its existing touch handling then owns pinch zoom. No private OrbitControls fields
or pinch implementation were added. The first tilt remains, and pinch changes
zoom without continuing the tilt or expanding the panel.

The existing tap timing and movement allowance remain: stationary rim and interior
taps expand the panel at click; a stationary pop-out rim tap leaves it open.
Dragging does not expand. Presets, Flip, clay, keyboard controls, and pose transfer
continue using their existing paths. No flip gesture was added.

Hover raycasts run at most every 40 ms and show `ns-resize` over eligible rim
points. Both viewer hints and the accessible description mention “Drag the rim
to tilt.” The existing hint wraps within narrow stages and still fades after
interaction. No controls or overlays were added.

## Regression coverage and verification

`tests/disc3d-rim-drag.mjs` runs through both existing browser suites. It projects
independently chosen real mesh points, uses native browser mouse input with
stepped vertical moves, and checks every intermediate tilt, slider, readout,
rotation, camera position, and final projected edge position. Cases cover 3/4,
Profile, Bottom, opposite edges, mirrored hands, clay, interior orbit with zero
tilt, both clamps, outside release, hover, and Top's orbit fallback. Native CDP
touch input checks one-finger tilt, second-finger pinch zoom, and cancellation.
The pop-out suite checks rim and interior stationary taps with mouse and touch.

The tests were added before product code. The initial unchanged-viewer run failed
on the missing rim hover affordance. After tightening the assertions, temporary
test servers served the exact `cee17cb` viewer while retaining the final tests:
**both detail and pop-out runs failed on the first drag move with `0 !== 3`**
(“each vertical move directly changes tilt in the correct direction”). No checkout,
HEAD, or production file was reverted for this contrast. The interior check is
deliberately a characterization/regression guard: admitting interior presses as
rim grabs would fail its camera-orbit and zero-tilt assertions. The clamp checks
require actually reaching +40 and −40, so absent gestures or incorrect limits
fail rather than passing just because zero is within the range.

All six requested commands ran serially and exited **0**:

| Command (verbatim) | Result |
| --- | --- |
| `npm.cmd run test:disc3d` | PASS — 23 unit tests, detail and pop-out browser suites |
| `npm.cmd run test:apple-design` | PASS — 6 camera unit tests and 16 browser checks |
| `npm.cmd run test:apple-design:2` | PASS — 29 checks |
| `npm.cmd run test:apple-design:3` | PASS — 14 checks |
| `npm.cmd run test:atlas:persist` | PASS — 7 unit tests and 13 browser checks |
| `npm.cmd run test:atlas:3d:perf` | PASS — desktop and emulated-phone gates |

The performance gate ran alone after the other requested suites exited, with no
concurrent test suite or review browser. Existing thresholds were unchanged.

| Warm p95, milliseconds | 3D | 2D |
| --- | ---: | ---: |
| Desktop flight | 5.9 | 4.4 |
| Desktop 1× | 1.9 | 1.2 |
| Emulated phone flight | 21.2 | 24.9 |
| Emulated phone 1× | 3.7 | 2.4 |

These pass the existing tolerance-based gates; the desktop 3D path is not claimed
to be faster than 2D. Browser launches required running outside the filesystem
sandbox's process-launch restriction. The local PowerShell runner also needed a
process-only execution-policy bypass; neither changed application code.
Logs, baseline contrast runs, and exit codes are in ignored
`work/viewer-rim-tilt/` artifacts.

A separate read-only code review found no critical or important issues. Its minor
request to retain interior tap checks alongside rim taps was incorporated.
After the baseline contrast and those final coverage refinements,
`npm.cmd run test:disc3d` ran again and exited **0**, including the exact signed
per-move assertions and both rim/interior tap cases. Its log is
`work/viewer-rim-tilt/final-test-disc3d.log`. `git diff --check` also passed.
The change is a scoped local commit; nothing was pushed or deployed.

## Freddy's feel check

“Open a disc, grab its right edge, pull up — the right side rises and the slider follows.”
