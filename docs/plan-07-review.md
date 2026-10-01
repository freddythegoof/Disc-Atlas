# Plan 07 review

Implemented locally; uncommitted and not deployed. About, Privacy and Terms page contents are unchanged.

## Header menu

The info-dot disclosure is replaced by a compact three-line menu button in the same header slot. Its three menu items link to `/about`, `/privacy` and `/terms`. Theme colors, borders, spacing and focus styling follow the existing header. Desktop and 360px mobile checks confirm that the button and open menu stay inside the viewport without displacing the identity or other controls, including the existing long-brand header state.

The button exposes `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`; the panel and links use menu/menuitem roles. Click, Enter/Space, Arrow Down/Up, Home/End, Escape, Tab and outside-pointer dismissal are supported. Escape restores focus to the visibly outlined button. The first implementation exposed a focusout/click ordering issue when toggling closed; the correction uses the focus event's related target and passes the full menu matrix.

Existing atlas reading guidance, mapped/unrated counts and the unrated-directory control moved into the Sources & methodology dialog. The unrated control closes that dialog before switching to the directory. Page contents and footer links were not edited.

Menu screenshots frame the header and dropdown so their layout is easy to review.

| View | Closed | Open |
| --- | --- | --- |
| Desktop dark | [Screenshot](../outputs/plan-07/menu-1440-dark-closed.png) | [Screenshot](../outputs/plan-07/menu-1440-dark-open.png) |
| Desktop light | [Screenshot](../outputs/plan-07/menu-1440-light-closed.png) | [Screenshot](../outputs/plan-07/menu-1440-light-open.png) |
| 360px dark | [Screenshot](../outputs/plan-07/menu-360-dark-closed.png) | [Screenshot](../outputs/plan-07/menu-360-dark-open.png) |
| 360px light | [Screenshot](../outputs/plan-07/menu-360-light-closed.png) | [Screenshot](../outputs/plan-07/menu-360-light-open.png) |

## Low-zoom labels

The old minor-disc canvas renderer chose among four off-center label positions and drew thin elbow leaders, even when the best candidate overlapped. That renderer and the obsolete selected-marker line path are removed. Before the existing 2.9x entry/2.7x exit label-suppression boundary, minor names now use fixed DOM labels centered beneath their true marker position. Their measured footprints contend with primary artwork/labels and other minor labels in the same spatial grid. A name that does not fit remains suppressed, while the dot retains hover reveal, keyboard reveal and keyboard activation.

The dense mid-zoom suppression behavior is preserved. No label/marker offsets or leader vectors exist below 7x. The 7x+ satellite marker placement, size, name labels, leader vectors and stack behavior remain unchanged; the full 06H regression retains its previous 7x/8x/9x counts and geometry.

The requested dark sparse captures filter to distance drivers and frame the left distance-band edge. At 1x the constrained camera shows the distance overview; at 3x it shows the sparse band edge. Both have zero leaders, zero label overlaps and zero primary artwork/label overlaps, with all markers at their true coordinates.

- [1x sparse distance band](../outputs/plan-07/sparse-distance-1x-dark.png)
- [3x sparse distance band](../outputs/plan-07/sparse-distance-3x-dark.png)
- [Machine-readable measurements](../outputs/plan-07/low-zoom-metrics.json)

## Validation

- 14 grouping/geometry unit tests pass, including fixed low-zoom label placement and suppression under contention.
- Contextual-header and menu Playwright checks pass: menu roles/links, navigation, focus return, 360px layout, long brand names, outside dismissal and all eight menu screenshots.
- Low-zoom Playwright checks pass through 1x, 1.5x, 2x, 2.7x, 2.9x, 3x, 5x and 6.99x, including sparse captures and suppressed-name hover/keyboard activation.
- Full grouping-zoom, label-prominence, deep-zoom and premium desktop/mobile UI regressions pass. The existing 06H deep satellite geometry is preserved.
- Targeted ESLint passes with zero errors and 14 existing unused-variable/function warnings in the legacy browser scripts. JavaScript syntax and diff whitespace checks pass.

The menu passed after one focused correction; the low-zoom implementation passed its first attempt. Neither task required a second failed implementation attempt.
