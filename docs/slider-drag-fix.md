# Slider drag investigation — October 13, 2026

Started in the main checkout, `C:\Users\user\disc-atlas`, with a clean tree at
`9fc7923feedeed0917df140f8259770a24926795` (the pop-out quality fix).
Freddy's earlier failure and his ~6:15 PM EDT report that dragging worked were
both treated as evidence. No assumption that today's work introduced a regression.

**Result: the failure was not reproduced on any of the five surfaces. No cause
was established, and no production slider code or CSS was changed.** The report
remains intermittent, with its original slider, input device, and context unknown.
Passing Chromium emulation cannot prove the report never occurs on another device
or browser. A physical-device feel check remains useful.

## Per-surface verdict and cause

| Surface | Mouse / touch verdict | Cause and observed behavior |
| --- | --- | --- |
| Speed, `#speed`, Filters drawer, 0–15 | Not reproduced / not reproduced | No cause established. `filter()` changes the results and speed output live; it preserves the drawer's original input. Tested in map and directory views, both directions. |
| Wear, `#bagWear`, Add/Edit sheet, 1–10 | Not reproduced / not reproduced | No cause established. `updateWear()` updates the existing output and warning without replacing the input. Add and Edit both track; the warning changes at wear 1–2 and the factory-new label returns at 10. |
| Release angle, detail viewer, −40–40 | Not reproduced / not reproduced | No cause established. `setTilt()` changes the existing disc rotation and output live; the slider remains attached throughout input. Tested in normal details and with comparison, including the expanded phone sheet. |
| Release angle, pop-out viewer, −40–40 | Not reproduced / not reproduced | No cause established. The pop-out's own slider also survives input and changes its disc rotation live. Tested on first open and after reopening in clay mode. |
| Throwing power, `#power`, details, 60–120, step 5 | Not reproduced / not reproduced | No cause established. Its input handler redraws `#flight` and the comparison sketch, preserving `#power`. Actual flight-route geometry changes during the drag. Normal details and comparison/expanded phone details both pass. |

The range-input inventory found only `web/index.html` (speed and wear),
`public/app.js` (power), and `public/disc3d/viewer.mjs` (tilt markup instantiated
twice). The React `components/ui/slider.tsx` is a separate component wrapper,
not another rendered `input[type=range]` in this app.

## Reproduction and evidence

Before any product changes, Playwright pressed the **current thumb centre**,
moved it in ten small steps with 60 ms between moves, and released. The harness
recorded the initial value, value immediately after pressing, and value after
each move. Mouse used `page.mouse`; touch used CDP `Input.dispatchTouchEvent`
through Chromium's native input pipeline. It did not simulate dragging by
assigning `.value`, calling `.fill()`, or dispatching DOM input events.

Initial baseline: desktop 1440×900 mouse, desktop 1440×900 touch, then phone
390×900 touch. Each of the five sliders passed on all three paths: **15/15**.

| Surface | Initial mouse trail | Initial touch trail (desktop and phone) |
| --- | --- | --- |
| Speed | `0,0,1,2,4,5,6,7,8,10,11,12` | `0,0,1,2,4,5,6,7,8,10,11,12` |
| Wear | `10,10,9,8,7,6,6,5,4,3,2,1` | `10,10,9,8,7,6,6,5,4,3,2,1` |
| Detail tilt | `0,0,3,6,10,13,16,19,22,26,29,32` | `0,0,0,6,10,13,16,19,22,26,29,32` |
| Pop-out tilt | `32,32,26,19,13,6,0,-6,-13,-19,-26,-32` | `32,32,26,19,13,6,0,-6,-13,-19,-26,-32` |
| Power | `100,100,100,105,105,110,110,110,115,115,120,120` | `100,100,100,105,105,110,110,110,115,115,120,120` |

Repeated samples are expected from native step snapping and the small initial
touch movement. All trails continue through intermediate values to the target;
none stops at the initial value or a single jump.

The extended characterization runs both directions in these contexts on each
of the three paths:

- Speed in map and directory drawers.
- Detail tilt and power with and without comparison; phone details also expanded.
- Pop-out tilt on first open and reopened in clay mode.
- Wear in Add and Edit sheets.

That is **60 stepped drags**. Every sample, including after release, checks the original node is still
connected and current, as well as live feedback. Power checks route changes in
both directions and matching comparison geometry when comparison is active;
wear checks every descriptive label against independent expected text. Assertions require multiple
intermediate values, monotonic movement, the target, native pointer/input events,
release/change events, and no `pointercancel`. Separate checks cover native track click/tap jumps,
Home/End, arrow keys, and the specified bounds and increments.

The initial event traces and source inspection tested the suggested hypotheses:

1. **Replacement during input:** no input detached; every sampled node identity
   survived. Power replaces only its flight SVG; speed redraws other containers;
   wear updates text/visibility; tilt changes the existing viewer.
2. **Gesture interference:** no pointer cancellation; native input events continued.
   `OrbitControls` is attached to the viewer canvas, and pop-out swipe dismissal
   starts on its header. Neither owns the tilt input. The tested document press
   feedback does not prevent slider pointer defaults.
3. **CSS/overlay:** the thumb received native pointerdown. All five inputs computed
   to `touch-action: manipulation`, with `auto` ancestors in the tested contexts.
   The map is not a slider ancestor; its `touch-action:none` was left intact.
4. **State reset:** no value trail resets. `setTilt()` writes the input value only
   when it differs from the clamped state, without rebuilding slider markup.

These observations rule out those mechanisms **in the tested contexts**, not in
every possible environment.

## Changes and before/after

Added `tests/range-drag.mjs`, `tests/slider-drag-browser.mjs`, and
`npm.cmd run test:sliders` to preserve the executable investigation. The suite
writes per-move values, live state, node identity, and pointer events to
`outputs/slider-drag/results.json` and prints each value trail.

No fixed-slider regression is claimed: all surfaces passed before implementation,
so there is no honest failing-before/passing-after product test. These are
characterization checks. No slider needed a rendering deferral; all existing
live behavior remains. No changes to map gestures, viewer orbit, drawer/dialog
gestures, press feedback, or the pop-out morph.

Before: **15/15** baseline drags passed on unchanged HEAD.
After adding tests: **60/60** extended drags passed, still with unchanged product
code. The first extended-harness attempt tried the phone-only Full screen button
on desktop and timed out; the test setup was corrected to expand only on phone.
This was not a slider failure.

## Verification

All requested commands ran serially and exited **0**. The performance gate ran
last, with no other test suite or review browser running. No thresholds were changed.

| Command (verbatim) | Result |
| --- | --- |
| `npm.cmd run test:disc3d` | PASS — unit, detail viewer, and pop-out suites |
| `npm.cmd run test:apple-design` | PASS — 16 browser checks plus camera unit tests |
| `npm.cmd run test:apple-design:2` | PASS — 29 checks |
| `npm.cmd run test:apple-design:3` | PASS — 14 checks |
| `npm.cmd run test:atlas:persist` | PASS — 7 unit tests and 13 browser checks |
| `npm.cmd run test:add-menu` | PASS — 9 checks, 18 screenshots |
| `npm.cmd run test:bag:popup` | PASS — 7 checks, 18 screenshots |
| `npm.cmd run test:atlas:3d:perf` | PASS — desktop and emulated phone gates |

Performance: warm 3D/2D flight p95 was **7.0/5.1 ms** on desktop and
**20.0/20.4 ms** on the throttled phone. Warm 1x p95 was **1.9/1.3 ms**
and **4.1/3.5 ms**, respectively. These passed the existing gate tolerances.
Full local logs and exit codes are in `work/slider-drag/` (ignored artifacts).

The added `npm.cmd run test:sliders` also passed, exit **0**, after the final
assertion changes. Its terminal result was:

```text
PASS slider drag: 60 stepped drags; live feedback, track jumps, keyboard and snapping
```

It uses the same `PLAYWRIGHT_MODULE` / `PLAYWRIGHT_EXECUTABLE_PATH` environment
convention as the existing browser suites, with an installed Chromium executable
and native GPU flags. Touch is emulated, not a physical-phone claim.

Independent read-only review checked the drag mechanics, assertions, and report.
Its coverage findings were addressed with comparison-geometry checks, reverse
redraw checks, exact wear descriptors, and post-release sampling.

## Freddy's feel check

“Drag every slider slowly — the value follows the whole way, mouse and touch.”
