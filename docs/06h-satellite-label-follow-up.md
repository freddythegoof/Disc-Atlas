# Plan 06H revised follow-up: readable deep satellites

Status: implemented locally and left uncommitted for review. This replaces the earlier max-zoom-only label follow-up.

From exactly 7x upward, fitting unstacked satellites use 28px disc artwork and a measured DOM name label. Primary artwork remains larger (up to 66.96px). Primary promotion and world-space grouping retain their existing priority, coordinates, capacity and hysteresis.

The satellite pass shares the primary footprint contention grid. It first tries the true position, then short offsets within 56 CSS pixels with an adjacent DOM label. Every displaced marker has a subtle straight vector ending at its true atlas coordinate. Vectors start outside the artwork, avoid labels and markers, and cannot cross or touch other vectors. Selecting a satellite keeps exactly one vector. Reserved true-position footprints protect stack dots, fallback dots and vector endpoints. Names are DOM text; only vectors and endpoint dots use the canvas.

Below 7x, the satellite pass is disabled. At 3x and 5x satellites remain unlabeled, clickable dots without vectors; the existing overview label behavior below the 2.9x/2.7x suppression hysteresis remains intact. Stacked satellites retain the existing badges and immediate stack comparison/chooser behavior.

## Dense dark putter-band captures

Playwright uses the existing 1440x900 viewport and band framing. Counts include the inset view and its neighboring midrange strip, matching the earlier grouping tests. All 1,037 rated discs remain represented.

| Zoom | Labeled smaller markers / unstacked satellites | Necessary fallback dots | Label/marker overlaps | Vector collisions | Maximum visible marker offset |
| --- | ---: | --- | ---: | ---: | ---: |
| [7x](../outputs/grouping-zoom/putter-7x-satellite-markers.png) | 14 / 16 | Rot, Xero | 0 | 0 | 32px |
| [8x](../outputs/grouping-zoom/putter-8x-satellite-markers.png) | 15 / 15 | None | 0 | 0 | 24px |
| [9x](../outputs/grouping-zoom/putter-9x-satellite-markers.png) | 9 / 11 | Bluebonnet, Scarab | 0 | 0 | 24px |

These captures do not label every single: they exercise the explicitly requested genuine-no-fit fallback. Rot's real coordinate is inside Alpaca's reserved label; Bluebonnet's is inside Judge's label; Scarab's is inside Gnome's label. Offsetting those markers would require a vector passing through those labels. Xero at 7x has no clean nearby marker/label/vector placement. The regression independently searches a denser 4px grid within the 56px limit and confirms no clean placement for each exception. Hover, keyboard name reveal, keyboard activation, and taps are verified for every fallback. Stacks are excluded from automatic satellite marker promotion.

Machine-readable [capture measurements](../outputs/grouping-zoom/satellite-markers-metrics.json).

## Validation

- 13 grouping/geometry unit tests and 5 atlas-layout tests pass.
- Updated grouping-zoom Playwright suite passes: all three dark captures, rendered artwork and label contention, vector intersections, honest endpoints, genuine fallback checks, fallback hover/keyboard/taps, displaced selection with exactly one vector, stack comparison, worker/fallback grouping equality, 7x boundary reversals, grouping hysteresis, zoom ceiling and mobile taps.
- Deep-zoom regression passes: camera, viewport-edge reversals, primary rim clicks, reset, theme change and mobile neighborhood.
- Label-prominence regression passes: original brand-neighborhood check, animated primary label contention, desktop/mobile zoom sweep and synchronous fallback.
- JavaScript syntax and git diff whitespace checks pass.

## Performance limitation

A small local probe forces prominence recalculation on 12 draws at each fixed zoom with 4x CPU slowdown. It measures computation rather than a sustained animation benchmark. The new placement search costs more at deep zoom:

| Zoom | Previous HEAD median / p95 | Revised median / p95 |
| --- | ---: | ---: |
| 7x | 9.3 / 12.8ms | 28.1 / 53.9ms |
| 8x | 6.5 / 7.7ms | 18.5 / 22.6ms |
| 9x | 9.9 / 12.9ms | 20.4 / 27.7ms |

The 7x tail exceeds 50ms under throttling; this is not a claim of smooth deep zoom on a heavily constrained CPU. Pan-only draws retain cached prominence, and below-7x draws do not run satellite placement. Baseline is the repository HEAD at the start of this revised request, which includes the earlier max-zoom label follow-up. Raw probes: [before](../outputs/grouping-zoom/satellite-cpu-before.json), [after](../outputs/grouping-zoom/satellite-cpu-after.json).
