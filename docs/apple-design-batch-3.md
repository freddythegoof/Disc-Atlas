# Apple design fixes — batch 3

October 13, 2026. Main checkout, starting from clean `c9693fe` (batch 2). Implemented findings 8, 9, 10 and 11 from `docs/apple-design-review.md`; findings 1–7 are unchanged except where finding 10 deliberately supersedes batch 1/2's reduced-motion behaviour (called out below). No data, flight numbers, map geometry, score logic, tier/label rules or palette changed (the one palette move is About's light surface). The logo lockup is untouched.

**8. Detail panel swaps.**
- *Content swap* (`public/app.js`): selecting a different disc while the panel is open cross-fades the text blocks over 120 ms, opacity only. The old blocks are kept as inert, id-stripped ghosts in a `.detail-ghosts` layer clipped to the panel's new height (so the old content cannot lengthen the scroll area) and fade out while the new blocks fade in. The `.detail-actions` row, the 3D container and anything holding a `data-sync-keep` node are not faded (the stage is the same node). No fade for the same disc re-rendering (hand, power, compare toggle), for a fresh open, or inside a reveal (`AtlasMotion.busy`, new). It stays under reduced motion: it is a fade.
- *Expand* (`public/atlas-motion.js`): `power3.inOut` → `expo.out` over 280 ms (the surface duration). The sheet's corner radius (22 px → 0 at full screen on phones) is tweened with the height, and both are cleared afterwards, so the instant radius flip is gone. `100dvh` itself was never the problem: the height tween already measured it.
- *Context title* (`app.js`, `renderContextTitle`): **verified: it popped.** The outgoing wordmark/title was hidden in one frame while the incoming one rose in over 180 ms with a 4 px translate. It is now a 120 ms opacity-only cross-fade: the outgoing element stays as an inert ghost positioned over its own box (`.header-identity` is now `position:relative`) and fades out as the new one fades in. It also stays under reduced motion (a fade, not travel).

**9. Motion scale** (`public/cosmic.css`). `:root` now defines `--dur-press:100ms`, `--dur-ui:180ms`, `--dur-surface:280ms`, `--ease-out:cubic-bezier(.16,1,.3,1)`. Used by this batch's new CSS and by the migrations below. Batch 2's `--ease-enter` is now an alias of `--ease-out`; `--ease-exit` (`cubic-bezier(.4,0,1,1)`) stays its own value. Two durations in this batch are fixed by the brief rather than the scale: the 120 ms panel and title fades (JS constants, no token) and the 150 ms reduced-motion camera ease and theme fade.

*Migrated* (each within ~20 ms of its old value, easing unchanged or identical; felt behaviour unchanged):
- `button{transition}` background/color `.18s` → `--dur-ui` (exact)
- `--press-rest` / `--press-down` (press feedback): the two `cubic-bezier(.16,1,.3,1)` → `--ease-out` (identical); dip `.09s` → `--dur-press` (+10 ms); background/color/border `.2s` → `--dur-ui` (−20 ms)
- `.map-dot` press `.09s cubic-bezier(.16,1,.3,1)` → `--dur-press`, `--ease-out`
- `.disc-row,.inspect-disc` background `.2s` → `--dur-ui`
- `.atlas-marker .stack-0` scale `.2s`, `.marker-name` opacity `.2s` (two rules) → `--dur-ui`
- the four regroup rules (`.marker-position`, `.is-updating` ×3) `.18s` → `--dur-ui` (exact; the JS LOD settle is untouched)
- `.context-title` `.16s` → `--dur-ui` (+20 ms)
- batch 2 exits: `.chip-popover/.site-menu` `[hidden]`, the Add/rack popovers, the dialogs: `.1s` → `--dur-press` (exact); cluster popover enter `.18s` → `--dur-ui` (exact), exit `.12s` → `--dur-press` (−20 ms)
- `.disc3d-dialog::backdrop` `.3s cubic-bezier(.16,1,.3,1)` → `--dur-surface`, `--ease-out` (−20 ms)
- `dropdown-indicator.css` `--dd-ease` → `var(--ease-out)` (identical curve)

*Left unmigrated* (a token would change how it feels): menu/dialog enters `.15s` (30 ms from `--dur-ui`), compare tray `.22s`/`.15s`, `.directory-row`/`.directory-add` `.15s`, the dropdown indicator's `150ms`, press `scale .22s` return and `box-shadow .15s`, the 0.24 s theme View Transition (40 ms from `--dur-surface`), marker/hover `.22s`/`.25s`/`.3s`/`.4s`/`.45s` rules, the old `style.css` rules (`.2s`, `.22s`, `.25s`), and every GSAP duration in `atlas-motion.js` (`.18` reveal, `.12` dismiss, the hover tweens).

**10. Reduced motion keeps fades** (`cosmic.css` plus the files that carried their own kill). The three global kills (`polish.css`, `style.css`, `cosmic.css`) are replaced by one block: keyframe `animation` and `scroll-behavior` stay off, and `transition-property` is forced to `opacity, color, background-color, border-color, outline-color, text-decoration-color, fill, stroke`. Anything with a duration keeps it for those properties; transform, scale and translate transitions simply stop existing, and an element with no transition still has none. Menus, popovers, dialogs and the compare tray also keep `display`/`overlay` (so exits fade) and are forced to `scale:none; translate:none` (no scale snap during the fade). Component-level `transition:none` rules that were killing pure fades (marker halo/name/regroup, directory rows, the pop-out hint and backdrop, the old `style.css` marker rule) were removed; the bag-specific reduced rules in `my-bag.css` are left alone.
- *Camera* (`atlas-map.js`): under reduced motion `tweenCamera` runs a 150 ms ease-out (cubic) to the target, retargetable from the live value, with no spring velocity and no overshoot (also for wheel, buttons, keys). Release momentum and edge elasticity remain off.
- *Theme* (`theme.js`, `cosmic.css`): reduced motion no longer applies the theme instantly; it runs the same View Transition (or the opacity fallback) at 150 ms via a `.theme-calm` class. Full motion keeps its 240 ms.
- *Panels* (`atlas-motion.js`): detail/filters reveal and dismiss fade (opacity only, no 14–18 px slide) instead of appearing instantly.
- *Batch 2's JS*: compare cards fade in and out (no scale, no FLIP); the pop-out fades in and out (no morph; the dialog is held at opacity 0 for one frame, then a 150 ms fade). The swipe-to-dismiss still closes at once.
- *Press feedback* is unchanged under reduced motion (the instant dip), since scale transitions are movement but the state change is not.

**11. Branding consistency.**
- *Theme control:* `public/about.html` takes Account's header markup (icon toggle + site menu with Light / Midnight / Charcoal / Black radios, plus the Sign-in link) and loads `account.js` so that link and the menu's signed-in items hydrate. `theme.js` already drove it; the labelled select and its Midnight-first order are gone from About. **Privacy and Terms still carry the labelled select** (the brief named only About); see "Out of scope, noticed".
- *Light surface:* `about-hero.css` drops its light `--bg:#f7f3ec` and `--line:#dfd5c9` overrides, so About's light theme is the app's cool `#f7f8fa` surface and hairline (this was the flagged judgement call). The warm `--text`, `--muted`, `--lime` and the hero's terracotta/amber washes stay.
- *Header height and position:* the info pages and Account take `--header-height` (68 px, defined on `.info-page,.account-page` because they have no tab row) as their header height, and on phones the app's first-row padding (10 px top, 8 px bottom, 16 px sides) instead of 18 px (About) and 28 px (Account), via `cosmic.css`, `account.css`. The old `.info-page header{height:68px}` is removed. Measured: About, Account, Privacy and Terms put the lockup at the same x/y/size at 1440 and 390; its left edge equals the app's, and its vertical centre is within 1.5 px of the app's first row on phones (the app's header is 112 px tall there because of its tab row; an info page's is 68 px).

## Updated reduced-motion assertions (called out)

- `tests/apple-design-browser.mjs`: "Reduced motion camera updates instantly" → the camera must ease in ≤ 400 ms, monotonically, with no overshoot and zero spring velocity; "Reduced motion applies instantly" (theme) → the change carries `theme-calm`, still runs the View Transition (native path), and settles to the chosen theme. Both theme loops now choose through the site menu on About too.
- `tests/apple-design-2-browser.mjs`: reduced-motion menus, the Add popover and dialogs now fade (opacity ramps, never scaled or moved) instead of being instant; compare cards animate opacity only; the pop-out animates opacity only and never changes size. Press feedback under reduced motion is still instant (unchanged assertion).
- Other tests touched for current behaviour: `atlas-interactions.mjs` waits out the regroup after the (now eased) reduced-motion reset; `brand-browser.mjs` waits for the theme cross-fade; `context-header.mjs` and `dropdown-indicator-browser.mjs` use About's new theme control.

## Verification

Windows, Chromium 1243. Required results:

- `npm.cmd run test:apple-design`: 6 camera unit tests, 16 browser checks.
- `npm.cmd run test:atlas:persist`: 7 target unit tests, 13 browser checks.
- `npm.cmd run test:disc3d`: model/overmold unit tests and the viewer and pop-out browser suites, "no page errors".
- `npm.cmd run test:atlas:3d:perf`: exit 0 (verbatim output below). Run with no `workerd` on the machine; batch 2 documented that other sessions' wrangler runs make this gate fail.
- **New** `npm.cmd run test:apple-design:3` (`tests/apple-design-3-browser.mjs`, 13 checks; `--panel|--reduced|--branding`): panel content-swap (ghost layer, 120 ms opacity-only keyframes on every text block, header row/3D stage untouched, no duplicate ids, same-disc and in-reveal skips, full and reduced motion); expand easing and corner radius on a phone, clean collapse; the context title's ghost/fade both ways; reduced-motion `transition-property` on controls, menu, tray, no movement transitions, the detail panel fading with no slide, camera ease, 150 ms vs 240 ms theme transition durations; the tokens; About's theme control (no select, toggle + four radios in Account's order, works), header height token, lockup position, surfaces and About ⇄ Account in light across About, Account, Privacy and Terms at 1440 and 390 in light and midnight.
- Also run and passing: `npm.cmd run test:apple-design:2` (29 checks), `test:add-menu` (9), `test:directory:layout`, `test:3d:polish`, `tests/motion.mjs --header-menu` and `--boundaries`, `tests/atlas-interactions.mjs`, `tests/brand-browser.mjs`, `tests/context-header.mjs`.

Screenshots (`outputs/apple-design-3/`): `about-`, `account-` and `app-` at 1440 and 390 in light and midnight, plus `account-1440-light-after-about.png` (header and background after navigating About → Account).

**Inherited failures** (fail on unmodified code too; not chased):
- `tests/atlas-3d-browser.mjs` "once settled, the minis that outgrew the margin move up a level, once" (it has also passed on some runs, so it is flaky) and default `tests/motion.mjs` line 192 "Show all still includes every rated disc."
- From batch 2: `test:bag:popup` (settle timeout) and `test:accounts:browser` (expects Charcoal to be the last theme in the site menu; the menu ends with Black).
- `tests/dropdown-indicator-browser.mjs` fails its "picture sizes match the before set" check because its `outputs/dropdown-indicator/before` baseline is stale (the 1440 toolbar pictures are 1064 px wide there, 804 now; no toolbar code is touched here). Its About/info-page shot now targets `.header-actions`, since the labelled `.theme-picker` it screenshotted no longer exists.

## Still verify

- **Real reduced-motion device.** The reduced-motion behaviour was exercised with Chromium's emulated `prefers-reduced-motion` only: the 150 ms camera ease on a touch pan/zoom, the theme fade snapshot cost, and whether fades-without-motion feel calm enough to you.
- **Safari/Firefox** for `transition-behavior: allow-discrete` on the reduced-motion menu exits and the forced `transition-property` override (a Safari with partial support would show instant exits, as before batch 2).
- **Panel swap on a slow phone**: the cross-fade clones the old text blocks (about 25 nodes) once per swap; no per-frame work, but I have not timed it on a throttled phone.
- **Light About** is now cool grey with the warm terracotta washes still in the hero; judge the pairing by eye (flagged as the one judgement call).
- **Phone header**: the info pages' 68 px header against the app's 112 px (with tab row) is intentional, not a bug; the lockup row lines up within 1.5 px.
- **Gaps not exercised**: the in-reveal skip is tested by calling `select` twice synchronously, not by a human double-click.

## Out of scope, noticed (not built)

- Privacy and Terms still have the labelled theme select (and its old option order); they could take the same Account control (finding 11 named About only).
- The Stability help popover (`.stability-popover`, a `hidden`-toggled tooltip) still has no exit (finding 4's list did not include it).
- The detail panel's GSAP reveal/dismiss still use hard-coded `.18`/`.12` durations rather than the tokens (not migrated: JS).

## Freddy's feel test

1. **Clicking through discs with the panel open:** click Destroyer, then Buzzz, Wraith, Zone in the directory or on the map. The name, numbers, flight sketch and sources should melt from one disc to the next in about an eighth of a second, with no flash to blank; the 3D disc and the title/close row should not flicker or fade at all. Change the throwing hand on one disc: only the sketch redraws. Open the panel fresh: it should slide in as before with no extra fade on top.
2. **Expanding the panel (phone):** tap Full screen and Collapse. It should leap away quickly and settle softly, the rounded top corners straightening as it rises (not snapping square at the start); collapsing rounds them back.
3. **Header title:** tick a manufacturer chip, then clear it. The "Disc Atlas" wordmark and the manufacturer title should cross-fade in place, neither blinking out first nor jumping up.
4. **Reduced motion on (OS setting):** zoom with the buttons and the wheel: the map should glide for a blink (about 150 ms) with no spring overshoot or momentum. Switch themes: a quick fade rather than a hard cut. Open menus, the Add menu, a dialog, the pop-out and the compare tray: they fade in and out without scaling or sliding. Hover a button: its colour still eases. Open the detail panel: it fades in without sliding.
5. **About ⇄ Account in light mode:** go back and forth with the browser back button and the About/Account links. The page background should not change hue, and the logo and the right-hand controls should stay put to the pixel. About's theme control should now be the sun/moon button and the ☰ menu with the four themes, same as Account.

## Final required performance output (verbatim)

```text
npm notice run disc-atlas@0.1.0 test:atlas:3d:perf
npm notice run node tests/atlas-3d-perf.mjs
ok - desktop: warm 3D frames are no slower than the 2D build's (flight p95 4.2 vs 3.8 ms, 1x p95 1.5 vs 1.1 ms; 921 renders)
ok - phone: warm 3D frames are no slower than the 2D build's (flight p95 14.7 vs 13.8 ms, 1x p95 2.8 vs 2.9 ms; 871 renders)
┌─────────┬───────────┬───────┬────────┬───────────────┬────────────┬────────────┬───────────┬────────┬────────────┬─────────┬───────┐
│ (index) │ device    │ build │ run    │ flight median │ flight p95 │ flight max │ 1x median │ 1x p95 │ long tasks │ longest │ discs │
├─────────┼───────────┼───────┼────────┼───────────────┼────────────┼────────────┼───────────┼────────┼────────────┼─────────┼───────┤
│ 0       │ 'desktop' │ '2D'  │ 'cold' │ 1.7           │ 4.5        │ 9.3        │ 0.5       │ 1      │ 0          │ 0       │ 77    │
│ 1       │ 'desktop' │ '2D'  │ 'warm' │ 1.9           │ 3.8        │ 8.6        │ 0.5       │ 1.1    │ 0          │ 0       │ 77    │
│ 2       │ 'desktop' │ '3D'  │ 'cold' │ 2.9           │ 8.1        │ 18.1       │ 0.9       │ 2.1    │ 0          │ 0       │ 77    │
│ 3       │ 'desktop' │ '3D'  │ 'warm' │ 2.1           │ 4.2        │ 6.7        │ 0.9       │ 1.5    │ 0          │ 0       │ 77    │
│ 4       │ 'phone'   │ '2D'  │ 'cold' │ 5.1           │ 16.3       │ 49.6       │ 2         │ 3.3    │ 5          │ 74      │ 17    │
│ 5       │ 'phone'   │ '2D'  │ 'warm' │ 4.8           │ 13.8       │ 29.4       │ 1.4       │ 2.9    │ 3          │ 53      │ 17    │
│ 6       │ 'phone'   │ '3D'  │ 'cold' │ 5.7           │ 14.5       │ 40.4       │ 2         │ 3.3    │ 7          │ 81      │ 17    │
│ 7       │ 'phone'   │ '3D'  │ 'warm' │ 5.8           │ 14.7       │ 30.4       │ 2         │ 2.8    │ 1          │ 50      │ 17    │
└─────────┴───────────┴───────┴────────┴───────────────┴────────────┴────────────┴───────────┴────────┴────────────┴─────────┴───────┘
```
