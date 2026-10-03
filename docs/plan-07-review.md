# Plan 07 review — October 2, 2026

Both requested behaviors already exist in the clean checkout: the menu was added in d434036, and true-position low-zoom labels were added in 9bf99b7. This review changes tests and this document only. No product code, page content, catalog data or 7x+ rendering was changed. Nothing was committed, pushed or deployed.

The current featured file contains 170 unique entries (the request mentioned 168), with label nudges for Predator, Stiletto, Paradox and Enforcer. Verification used that current file.

## Menu

The existing compact menu links to /about, /privacy and /terms. Playwright verifies menu roles, visible keyboard focus, arrow-key navigation, Home/End, Escape with focus return, Tab dismissal, outside dismissal, button toggling, and viewport containment in dark/light themes at 1440px and 360px. The tests now also exercise Enter/Space opening and keyboard activation of all three links. Route destinations use test fixtures; page contents are unchanged.

| View | Closed | Open |
| --- | --- | --- |
| Desktop dark | [Screenshot](../outputs/plan-07/menu-1440-dark-closed.png) | [Screenshot](../outputs/plan-07/menu-1440-dark-open.png) |
| Desktop light | [Screenshot](../outputs/plan-07/menu-1440-light-closed.png) | [Screenshot](../outputs/plan-07/menu-1440-light-open.png) |
| 360px dark | [Screenshot](../outputs/plan-07/menu-360-dark-closed.png) | [Screenshot](../outputs/plan-07/menu-360-dark-open.png) |
| 360px light | [Screenshot](../outputs/plan-07/menu-360-light-closed.png) | [Screenshot](../outputs/plan-07/menu-360-light-open.png) |

## Low-zoom labels

The existing engine promotes fitting minor names at their true marker positions before its 2.9x entry/2.7x exit suppression boundary. Names that do not fit remain available on hover or keyboard focus. Dense mid-zoom suppression and 7x+ satellite rendering retain their current behavior.

The tests now count actual non-grid canvas strokes, including selection of a stack member away from its lead at 1x, 3x and 6.99x. This covers a leftover selected-marker drawing path that previous state-only leader counts did not inspect; it emitted no lines in these checks. A new unit test verifies that minor names yield to the occupied footprint of a nudged primary label.

Both requested dark captures have zero state leaders, zero painted leaders, zero label overlaps, zero artwork/label overlaps and no marker displacement:

- [1x sparse distance band](../outputs/plan-07/sparse-distance-1x-dark.png)
- [3x sparse distance band](../outputs/plan-07/sparse-distance-3x-dark.png)
- [Measurements](../outputs/plan-07/low-zoom-metrics.json)

## Validation and limits

Passed:

- 20 grouping/layout unit tests.
- Extended header-menu and contextual-header Playwright checks, including long brand names at 360px and all eight screenshots.
- Extended low-zoom Playwright checks through 1x, 1.5x, 2x, 2.7x, 2.9x, 3x, 5x and 6.99x, including hover/keyboard reveal and activation.
- Standalone Worker regression, targeted ESLint, JavaScript syntax and diff whitespace checks.

Broader checks exposed failures:

- checkGroupingZoom: '7x fallback dots have no clean nearby placement'. The independent test verifier omits primary label nudges; one attempted verifier correction did not resolve the failure. That speculative correction was reverted. Investigation stopped after the second failure under the two-strikes rule. No 7x+ rendering changes were made. The subsequent label-prominence, deep-zoom, premium, boundaries and directory runs in that batch were not reached.
- The unrelated existing About-hero regression failed its frame-rate budget in local headless Chromium (about 19.2 FPS). Its page and renderer were not changed or investigated.

The requested menu and sparse low-zoom checks pass. The broader suite is not fully green. Screenshots and logs are local ignored artifacts under outputs/plan-07; the three test files and this review document remain uncommitted for review.
