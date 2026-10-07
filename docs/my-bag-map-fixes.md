# My Bag map fixes — October 7, 2026

Top view is removed. Putter pocket occupies the upper-left control corner, across from zoom, with discs and names kept clear. Return all occupies a separate centered row below the canvas, with its row height reserved when the button is hidden. Both controls have 44 px targets. Return all stays outside the drawing area, and the pocket control keeps the proven upper-left clearance in the tested zoom, spin and out-disc layouts. Theme colors continue to use the existing Midnight, Light and Charcoal tokens.

## DD1/DD3 investigation

`public/data.json` was read only. Discmania's current pages match the catalog:

| Approval | Catalog id | Speed / Glide / Turn / Fade | Consensus x / y |
| --- | --- | --- | --- |
| [Premier DD1](https://www.discmania.net/collections/premier-dd1) | `9554f962a394` | 11 / 6 / −1 / 2 | 0.573441 / 0.734513 |
| [Premier DD3](https://www.discmania.net/collections/premier-dd3) | `b52c5cb1753a` | 12 / 6 / −1 / 2 | 0.587224 / 0.758483 |
| [DD3](https://www.discmania.net/collections/dd3) (new approval) | `a5ca585ab070` | 12 / 5 / −1 / 3 | 0.669041 / 0.763529 |

The local development bag contains one bagged Premier DD1 and one bagged Premier DD3; both have `stability_bias = NULL`. Its two Destroyer copies are also untagged. The live D1 SELECT was denied by Cloudflare (7403), so these local records are not a claim about the current live account. No saved data was changed.

The user describes DD1 as more understable and DD3 as more stable, but less stable than Destroyer. A test-only Less stable DD1 note reproduces that relationship, with DD3 at consensus and the fixture Destroyer tagged More stable. This does not infer or change the live account's notes.

The copy-note transform is correct: More stable adds 10 index points, Less stable subtracts 10, copies average, and speed is unchanged. The error was a second transform during rendering: sparse Atlas spreading also ran on My Map, doubling decorative scatter and repelling close neighbors. For just the two Premier discs at a 324 × 520 map, the displayed y values became **DD1 0.838286 / DD3 0.661714**: the slower disc appeared faster. A 12-mold browser reproduction also inverted the ordering. The grouping worker repeated the same transform after zoom and resize.

My Map now uses the existing personal coordinates in both rendering paths. The worker receives an explicit personal-mode flag; its default Atlas path still adapts filtered sets exactly as before. No mold-specific swap or catalog override is applied. Both Premier molds have manufacturer stability index 60; regular DD3 has index 70. There is no manufacturer-supported data discrepancy to add to the stability queue. `source-data/verified-model-overrides.json` and `public/data.json` remain unchanged.

## Verification

- `npm run test:bag:controls`: 6 cases and 30 screenshots; all three themes, 1440 × 1000 and touch-enabled 360 × 800; single, distance and crowded out-disc layouts, expanded/collapsed pocket, keyboard Return all, no control/disc/name/zoom overlaps or horizontal overflow.
- `npm run test:bag:spin`: 16 checks and 18 screenshots. Staging: 12 checks and 46 screenshots; tweaks: 8 checks and 27 screenshots; interactions: 8 checks and 30 screenshots. Bag v1.3 and the account/API bag browser suite also passed.
- `npm run test:my-map`: 6 unit tests, 10 browser checks and 18 screenshots; note shifts/averaging, direct personal rendering, worker regrouping, readable Premier DD1/DD3 close-ups, all three themes at 1440 and 360, and repeated hand-offs restoring the full Atlas with its unchanged spread.
- 92 combined unit regressions passed: accounts, bag, coach, layout, groups, personal lens, worker and public Worker.

The interaction test now waits for the viewer and canvas to settle, records the complete motion rather than stopping at 120 frames, and measures the current canvas after the details panel changes its width, and scrolls the actual canvas into view before gestures and pixel sampling. The original commit reproduced the early endpoint and stale-width failures in an isolated local fixture.

Screenshot galleries are generated locally at `outputs/bag-map-controls/screenshots.html`, `outputs/bag-spin-pocket/screenshots.html` and `outputs/my-map/screenshots.html`. Browser suites use only local D1 and the Google test fixture.

Sidebar dropdowns and CLEAN marker/label behavior are unchanged. Commit only; no push or deployment.
