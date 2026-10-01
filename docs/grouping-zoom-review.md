# Plan 06G follow-up: label triage and deeper zoom

Review status: implemented locally, uncommitted, not deployed. Selected maximum: **9?**.

## What was wrong

The 3.3? threshold was reached, and satellite classification was working. `drawPlanetLabels()` explicitly called `drawDeepPlanetLabels()` above it. That second canvas renderer placed compact names next to every satellite it could fit, sometimes moving dots by up to 60 pixels to accommodate names. The previous grouping-zoom test required labeled satellites and rejected anonymous single dots, cementing the opposite of the intended triage.

The HEAD baseline reproduces this: the sampled 5? putter view contains 28 putter satellites, all labeled (32 including the neighboring midrange discs). At 3?, the canvas has 102 active leaders. These are local HEAD reproductions, not claims of a fresh production deployment.

The compact-name renderer and its dot nudging are removed. Satellite canvas labels suppress on entering 2.9? and return below 2.7?. Full primary name/brand labels still use measured DOM footprints; dots retain accessible names and reveal their full label on keyboard focus or hover. Pointer taps resolve to the nearest marker from 2.7?, and keyboard activation retains the focused marker identity. All plotted primary and satellite centers now remain at their existing atlas coordinates.

## Candidate review

Playwright drove the same 1440?900 dark-mode viewport, same catalog (1,037 rated discs), same world center (x=.5, y=.1), and same screen anchor for every candidate. The probe sets the camera directly to inspect candidates beyond the shipped ceiling; a separate interaction test verifies wheel, plus, and pinch all clamp at the chosen 9?. Screenshots show the whole viewport so surrounding density and empty space remain visible. Counts use an inset region x=70?1370, y=110?690 to exclude clipped edge markers; the neighboring midrange strip is included in the general view counts.

| Zoom / screenshot | Visible groups | Putter groups | Putter stacks | Putter dots | Close dot-involving pairs* | Minimum primary rim gap |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| [3?](../outputs/grouping-zoom/putter-3x-after.png) | 170 | 103 | 41 | 81 | 103 | 15.5 px |
| [5?](../outputs/grouping-zoom/putter-5x-after.png) | 63 | 53 | 27 | 28 | 6 | 11.6 px |
| [7?](../outputs/grouping-zoom/putter-7x-after.png) | 48 | 44 | 17 | 20 | 2 | 13.1 px |
| [8?](../outputs/grouping-zoom/putter-8x-after.png) | 43 | 40 | 11 | 15 | 3 | 2.8 px |
| **[9? ? selected](../outputs/grouping-zoom/putter-9x-after.png)** | **37** | **36** | **5** | **13** | **1** | **7.4 px** |
| [10?](../outputs/grouping-zoom/putter-10x-after.png) | 27 | 27 | 4 | 7 | 0 | 15.7 px |

*Pairs less than 40 CSS pixels apart with at least one satellite, across the inset view. Rim gaps exclude halos, stack badges, and hover effects.

All six corrected captures have **zero automatic satellite names, zero leaders, and zero name/brand label overlaps**. Artwork growth stops at 1.24? from 4? onward. All rated discs remain represented; no filtering or hiding was introduced.

Against the design-vision skill's restraint and disc-first hierarchy:

- **7?:** clearer than 5?, but 17 putter stacks still make the denser right-hand neighborhood feel packed. Candy/Dart and Pure/Proxy become easier to read.
- **8?:** releases more names and stacks, but newly promoted neighbors create a tight near-touching pair (minimum rim gap 2.8 px). Eleven putter stacks remain.
- **9?:** five visible putter stacks, all pairs rather than triples in this sample. Names have room, primary rims separate, and 36 putter groups still read as a neighborhood. This is the best balance of breathing room and density in the evaluated view.
- **10?:** the same grouping level as 9?; no additional groups split across the full band. It reduces visible putter stacks only from five to four while losing nine visible putter groups (25%). Larger gaps and clipped context require more panning. The extra separation is useful locally, but the overall view begins to read as scattered.

Across the entire putter band, extra putter members held in stacks fall from **77 at 5? ? 59 at 7? ? 52 at 8? ? 41 at 9? ? 41 at 10?**. This verifies real stack thinning beyond the effect of groups leaving the viewport.

Before captures: [3? leader web](../outputs/grouping-zoom/putter-3x-before.png), [5? satellite names](../outputs/grouping-zoom/putter-5x-before.png). Machine-readable measurements: [before](../outputs/grouping-zoom/candidates-before.json), [after](../outputs/grouping-zoom/candidates-after.json).

## Screen space, caps, and hysteresis

The 06G grouping cell remains 25 reference-screen pixels at deep zoom. Satellite absorption previously used `64 * groupZoom / 5`, so its reach grew as the camera zoomed in and counteracted separation. It now stays at 64 reference-screen pixels. Existing third-octave grouping buckets mean actual screen distances vary slightly between regroup boundaries; neither cell size nor absorption radius grows linearly with zoom anymore. Measured label promotion still runs at the actual current zoom. The existing 48 px entry / 80 px exit viewport margins remain appropriate for the capped 33.48 px primary radius and pass edge reversals at 9?.

Grouping levels enter at their normal rounded-log boundary and exit 0.15 level below that boundary. Level 10 enters around 8.98? and exits around 8.67?. Worker prefetch, worker completion, and synchronous fallback share this rule. Reversals through 9, 8.99, 8.97, 8.9, and 9 retain both grouping-cache identity and surviving DOM nodes. Large zoom-outs jump directly to the correct level.

The 06F capacity curve is unchanged: `max(3, ceil(48 / groupZoom?))`. At 3? the rounded level is 5, reference zoom ?3.175, and capacity is **5**. A four-disc stack there is expected. At 4? and deeper, the capacity is **3**. Tests cover the curve through level 10 and verify all members are retained.

## Validation

- Grouping/layout: 16 unit tests pass, including fixed-radius release, the intermediate capacity curve, top-level hysteresis, priority, positions, and worker payload parity.
- Updated grouping-zoom Playwright regression: dark/light putter, fairway, and distance views; canvas plus DOM satellite counts; dot taps at 5? and 9?; keyboard full-name reveal; three-disc click-to-compare at 5? and stack comparison at 9?; worker/fallback equality; mobile taps; label-threshold reversal; actual 9? wheel/plus/pinch limits; whole-band and visible stack thinning.
- Candidate sweep: 3?, 5?, 7?, 8?, 9?, 10? screenshots and geometry checks.
- Deep-zoom regression: viewport entry/exit reversals on all four edges at 9?, mobile neighborhood, primary rim click, reset, and theme changes.
- Label prominence: measured label overlap checks through 9? on desktop/mobile and during animation; targeted original 5? brand-neighborhood regression retained.
- Standard motion suite, desktop/mobile redesign interaction regression, filter-regroup checks under 4? CPU slowdown, and standalone Worker checks pass.
- 4? CPU boundary test: no observed long tasks over 50 ms, slowest sampled draw 12.9 ms, no entrance replay or empty transition frames; reversal leaves no ghost markers.
- Sustained 4? CPU wheel profile, HEAD ? working: sampled draw CPU 9,950 ? 7,548 ms (~24% lower); p95 frame time 183.4 ? 166.7 ms; maximum frame 300 ? 233.4 ms. This stress test remains slow; the improvement is not a claim of smooth performance under throttling. Total run durations differ (26.3 vs 23.9 seconds), and DOM churn was higher in the working run (405 additions vs 365), so treat these as observational measurements rather than a benchmark guarantee.

The production correction passed its first implementation attempt. No second speculative correction was needed. Expected red tests first reproduced the satellite-name and growing-absorption bugs. Screenshot outputs are intentionally in the ignored `outputs/` folder; the tests regenerate them.
