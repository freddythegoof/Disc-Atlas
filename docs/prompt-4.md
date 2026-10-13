# Prompt 4: clay mode and profile, batch 3 leftovers, test repairs, browser matrix

October 13, 2026. Main checkout, starting from clean `cdf1cb6` (Apple batch 3). Four parts, each committed on its own, not pushed or deployed. No data, flight numbers, map geometry, score or tier logic changed, and `public/data.json` was not touched. Everything batches 1 to 3 landed is unchanged: camera spring and flick-catch, marker persistence, LOD hysteresis and settle, theme cross-fades (including the viewer's synchronous paint), press feedback, popover/menu/dialog exits, compare-tray motion, pop-out morph, panel swap fades, the motion tokens, and reduced motion keeping fades without movement.

| Part | Commit | |
|---|---|---|
| A | `e21a447` | Clay inspect mode and profile cross-section |
| A | `568a375` | Profile label spacing (follow-up) |
| B | `1148710` | Privacy and Terms take the Account theme control |
| B | `0afbdf3` | Detail panel GSAP durations from the motion tokens |
| C | `b9b03ba` | motion.mjs Show all check (organic 1x atlas) |
| C | `2c2bf9f` | accounts suite: four themes, dialog exits |
| C | `4f2efb4` | bag popup suite: wait out the theme cross-fade |
| C | `f5f9132` | atlas 3D LOD check: decisions, not stand-in renders |
| C | `18d0b1b` | dropdown indicator suite: two races fixed before the baseline refresh |

## Part A: clay inspect mode and profile outline

**What it is.** A **Clay** button in the 3D viewer's toolbar, after Flip, in both the detail-panel viewer and the pop-out. While it is on, the disc is matte grey studio clay on a dark ground, the name stamp is hidden, and the mold's cross-section is drawn under the stage. Mold geometry is untouched: shapes stay PDGA-true, and clay changes only how they are shaded.

**Files.**
- `public/disc3d/viewer.mjs`: the toggle, the clay materials, `setClay(on)`, the `onClay` option, and the profile figure.
- `public/disc3d/profile.mjs` (new): the cross-section as SVG. Pure JS, so Node tests import it.
- `public/disc3d/mesh.mjs`: `lathePoints()` is now the one place the lathe's profile comes from. `discGeometry()` returns it alongside the geometry. Behaviour is unchanged for the atlas and the bag.
- `public/disc3d.js`: one clay setting shared by both viewers.
- `public/disc3d.css`: the button, the dark ground, the figure.

**Shading: a matcap, not a light rig.** The clay is `MeshMatcapMaterial` with a grey sphere baked once per page into a 256² canvas (no lights, no environment map, not tone mapped). I chose a matcap because its shading follows the camera, so the read is the same in every preset, flipped or tilted, and it costs less than the plastic material it replaces.

The sphere is built to separate the parts of the disc:
- A key light from the upper left falls off as diffuse², so the dome, shoulder and flat of the flight plate land on distinct values.
- A tight highlight traces the shoulder's curvature.
- A fill from below lifts the cavity in the Bottom view; the first version left it black.
- A bright fresnel edge keeps the silhouette off the dark ground from any angle.

The Destroyer's wedge, the Buzzz's rounded shoulder and the Aviar's thick rim band read apart in the 3/4 and Profile presets (`outputs/disc3d/clay-side-by-side.png`).

**Tones, overmolds and the stamp.**
- The plate is `#b3b3af`. An overmold's rim piece is `#6c6c6a`, so the split still shows, both on the 3D mesh and in the cross-section (`CLAY_TONES` in `profile.mjs`, shared by both).
- A user-chosen rim colour is applied to the plastic material underneath and does not tint the clay.
- The stamp mesh is hidden.

**Backdrop.** `.is-clay` paints the viewport with a fixed dark radial ground (`#2a2d33` to `#16181c`) in all four themes, and lightens the hint text.

**Turning it off restores exactly.**
- Clay swaps `body.material` to its own two materials. The plastic materials (colour, finish, overmold rim) are never modified, so turning clay off puts back the very same objects.
- The test checks that the material objects and their properties are identical, and that the rendered pixel at the centre is identical before clay and after it is turned off.
- The theme backdrop comes back from CSS.

**Persistence.**
- Clay stays on across disc changes, rendered for each new disc.
- It is session-only, not saved.
- Either viewer's button turns it on or off in both: a pop-out opens in the current mode, and toggling in the pop-out changes the panel too.

**Cost.** No second renderer and no per-frame work: a material swap and a CSS class. The cross-section is static SVG, rebuilt only for a new disc or a new width.

**The cross-section.**
- It is drawn from `state.profile`, the exact `{points, rim}` the lathe was spun from (`lathePoints`), never a second shape source. The test reads LatheGeometry's first ring (angle 0, where z is the radius) and matches every point of the outline's right half to within 0.01 cm, with the left half mirrored.
- It shows the full slice through the axis, both halves, at true scale on the same fixed 22 cm frame as the 3D camera, so a Buzzz draws wider than a Destroyer. The scale is uniform, with no vertical exaggeration. Molds are millimetres apart, and the true-scale drawing shows that.
- Annotations appear only when the shape comes from the mold's PDGA dimensions. They show the four spec strings the detail panel's "PDGA dimensions" block prints (`${v} cm`): Height, Rim width, Rim depth, Diameter. Nothing is measured off the model.
- A disc on the generic flight-number shape is drawn unannotated, captioned "Cross-section · a generic shape from its flight numbers". A PDGA-shaped disc is captioned "… its PDGA dimensions, to scale". Both are the viewer's existing source wording.
- The SVG has an accessible label with the same numbers.
- Placement: under the stage, before the toolbar, on the same dark ground. It never covers the disc.
  - Phones: it pushes the toolbar down inside the sheet.
  - Phone pop-out: disc, then cross-section, then controls; the stage keeps more than 220 px.
  - Landscape phone pop-out (`max-height:520px`): it is hidden, as the caption and hint are there, so the disc keeps its full height.

**One layout change outside clay.** With Clay in the toolbar, the narrowest panel (280 px, 800–1100 px windows) clipped "Bottom". The four preset buttons now size by their labels (`flex:1 1 auto`) instead of sharing equal widths, and Flip/Clay padding went from 12 to 10 px. The preset group looks slightly uneven now. A test checks that no toolbar label clips at 1440, 1100, 800 and on phones.

**Tests.**
- `tests/disc3d-profile.mjs` (new, in `test:disc3d`): outline equals the lathe points, both halves; true scale and uniform aspect; the panel's spec strings, and only four of them; the generic shape unannotated; the overmold rim in its own tone.
- `tests/disc3d-browser.mjs`:
  - Clay swaps and restores materials, finish, colour, stamp, backdrop and pixels.
  - Dark ground in light, midnight, charcoal and black.
  - Disc changes keep clay.
  - Outline matches the live geometry and carries the panel's numbers.
  - Overmold in two clay tones, on screen and in the cross-section.
  - A chosen rim colour waits underneath.
  - The generic profile is unannotated.
  - Phone placement.
  - No clipped toolbar labels.
- `tests/disc3d-popout-browser.mjs`:
  - Clay carries into the pop-out with the same materials and numbers.
  - Toggling in either viewer turns both.
  - It stays on after close.
  - Phone and landscape placement.

**Screenshots** (gitignored `outputs/`, copied to `outputs/prompt-4/`):
- Panel, desktop: `clay-off-destroyer`, `clay-on-destroyer`, `clay-overmold-envy`, `clay-off-overmold-envy`, `clay-side-by-side`.
- Panel, phone: `phone-clay-destroyer`, `phone-clay-envy`, `phone-clay-off-envy`.
- Pop-out: `popout-desktop-clay-envy`, `popout-desktop-clay-destroyer`, `popout-desktop-off`, `popout-phone-clay-envy`, `popout-phone-off`, `popout-phone-landscape-clay`.

## Part B: batch 3 leftovers

**Privacy and Terms theme control** (`public/privacy.html`, `public/terms.html`). Both now have About's exact header markup: the identity wrapper, the Sign-in link, the sun/moon toggle and the site menu with Light / Midnight / Charcoal / Black radios. Like About, they load `account.js`, so the menu's signed-in items and the Sign-in link hydrate the same way. The labelled select and its Midnight-first order are gone from every page.
- `tests/apple-design-3-browser.mjs` now asserts the Account control on About, Privacy and Terms (no select, toggle plus four radios in order, toggling works, a radio checks). At 1440 and 390, in light and midnight, all four pages also share:
  - the header token;
  - the lockup position;
  - the controls' right edge and vertical centre;
  - the surface and hairline.
- It screenshots Privacy and Terms too.
- `tests/brand-browser.mjs` picks the theme from the site menu on `/privacy`.

**Stability help popover exit: not built, because the popover no longer exists.** The Stability help markup (`#stabilityHelp`, `.stability-popover`) was removed from `web/index.html` in `8a995ba` ("Fourth overhaul", Sep 29). No page loads `public/stability-help.js` any more, and the `.stability-popover` rules in `polish.css` and `cosmic.css` match nothing. Batch 3's "noticed" item described dead code. I wrote the exit and its test, found the test had no element to open, and reverted both rather than add CSS for an element no page renders. **Recommendation:** delete `stability-help.js` and the orphaned `.stability-popover`/`.index-ranges` rules, or restore the tooltip on purpose. If it comes back, it should take the cluster popover's `[hidden]` + `allow-discrete` exit (enter `--dur-ui`, exit `--dur-press`/`--ease-exit`, origin at its anchor) and join batch 3's reduced-motion list.

**Detail panel GSAP durations** (`public/atlas-motion.js`). Read once from `:root`, with the old value as fallback:

| Tween | Was | Now | Difference |
|---|---|---|---|
| Reveal | `.18` | `--dur-ui` | exact |
| Dismiss | `.12` | `--dur-press` | −20 ms, the same mapping batch 3 made for the cluster exit |
| Expand | `.28` | `--dur-surface` | exact |

Easing is unchanged (`power3.out`, `expo.out`). Left as they were: the marker hover tweens (`.18`, `.32`, outside the brief) and the reduced-motion paths. `apple-design-3 --reduced` asserts the durations GSAP actually receives: reveal and dismiss on desktop, expand on a phone.

## Part C: inherited failures, diagnosed, then repaired

All five were **test rot**. None needed a product change. Each was reproduced on unmodified `cdf1cb6` first.

### `tests/atlas-3d-browser.mjs`: "once settled, the minis that outgrew the margin move up a level, once" (flaky)

**Diagnosis.** I ran the zoom block on its own in a loop.
- Unthrottled it passed 8/8. Under CDP CPU throttling ×4 it failed 8/8, so the trigger is load.
- The test sampled `g.lod`, the level of the image on screen. `atlas-art.mjs` `get()` deliberately shows "the best other level already drawn" while the wanted one waits for the 6 ms per-frame render budget. Under load these stand-ins appear: small discs showed a prewarmed `full` image, then their own `mid`; a held mini briefly showed a cached `full`.
- The test also tracked by disc id, so a mini that left the set mid-zoom and rejoined (a new entry that decides afresh from its size, by design) looked like a flip.

**LOD logic: no bug.** The decisions themselves (`g.want`) were correct in every throttled run: only minis, low→mid, once each, and the image on screen always converged to the decision.

**Verdict: test rot (a race).** The test now:
- tracks decisions per entry for the hysteresis checks;
- after settling, waits for the real condition, every drawn disc showing its decided level;
- then asserts every change was a mini going low→mid once, and the minis show mid.

The repaired block passes 8/8 throttled ×4 and 4/4 unthrottled. Mutation check:
- Forcing `hold` off fails the browser block ("renders hold while the zoom is moving").
- `LOD_MARGIN=0` is caught by `tests/atlas-lod.mjs`. Neither the old nor the new browser block exercises the margin; the old one only failed it by flaking.

### Default `tests/motion.mjs` ~192: "Show all still includes every rated disc"

**Diagnosis.** The assertion compared the members of `mapClusters` with every rated filtered disc. Since `9944812` (Oct 7, the organic atlas), 1x draws a curated composition, and the rest "wait for room deeper in" (`docs/atlas-organic.md`). Settled at 1440×900, Show all draws:
- about 24 groups holding 319 discs;
- 53 small discs and minis.

The groups behind the map hold all 1,037 rated discs exactly, with nothing dropped and nothing extra. The 37 the failing run saw was a frame mid-tween (zoom 1.0008).

**Verdict: test rot.** No disc is dropped. The test now waits for the camera to land (zoom 1, pan 0,0). It asserts that the map's groups hold exactly the rated filtered discs, once each, and that the 1x composition and its gap tiers are drawn. It still fails if Show all ever loses or duplicates a disc.

### `npm.cmd run test:accounts:browser`

**Diagnosis.** Known rot, plus more of the same:
- `End` in the signed-out menu lands on the last radio, which is Black since the four-theme change.
- All three theme loops covered only light, midnight and charcoal.
- Once past the menu, a second failure: right after Escape the delete-account dialog was still "visible". That is batch 2's 100 ms dialog exit fade, which holds `display` while it fades. Intended.

**Verdict: test rot.** The test now:
- asserts the radios read Light/Midnight/Charcoal/Black, and that `End` reaches Black (signed in, the menu still ends on "My Bag", as asserted);
- loops all four themes;
- checks the dialog is closed (`open` false) at once and gone within 1 s.

### `npm.cmd run test:bag:popup`: settle timeout

**Diagnosis.** I instrumented the settle wait. `stage.moving` stayed true because three discs that "Return all" sent home froze mid-slide. The bag viewer had stopped drawing because its canvas was off screen (canvas at y −916 to −66, `scrollY` 1498), and pausing off screen is by design ("Offscreen or hidden containers stop drawing entirely").

The page scrolled before `returnAllOut()` ran, with focus still on `body`. `elementFromPoint` over the button returned `<html>`. The test chooses a theme and clicks Return all at once, and since batch 1 a theme change is a 240 ms View Transition during which hits land on the root. Playwright saw the button as covered, scrolled to find a clear spot (574 → 542 → 1020 → 1498), and clicked once the transition ended, with the canvas already scrolled away.

**Verdict: test rot (a race with the theme cross-fade).** It is the same class batch 3 fixed in `brand-browser.mjs`. The settle condition is correct and the bag behaves as designed. `setTheme` in the suite now waits for the theme to land and `theme-switching` to clear, which replaces a 200 ms sleep. 7/7 pass. The product side effect is listed under "Out of scope, noticed".

### `tests/dropdown-indicator-browser.mjs`: "picture sizes match the before set"

**Diagnosis.** 24 of 69 pictures differed from `outputs/dropdown-indicator/before`, captured Oct 6 (around `d465a98`/`e79aace`). I looked at each before/after pair and traced it to a commit:

| Picture | Before → now | What changed | Commit |
|---|---|---|---|
| `toolbar-1440-*` | 1064 → 804 wide | The map dropdown left the `.explore-tools` row for the atlas's top-right corner; search reads "Disc or manufacturer" | `aedd524` (Oct 8), `8b4050c` |
| `lens-open-360-*` | 210 → 214 | The same move; the open caret sits on its lime tint | `aedd524` |
| `directory-sort-1440-*` | 1407 → 1391 | Directory rows: separate Speed/Glide/Turn/Fade columns, labelled "+ Add ⌄" buttons, Brand → Manufacturer | `8b4050c` (Oct 8) |
| `info-theme-*` | select → toggle + menu | The info pages' labelled select became Account's control (the 1440 picture includes the signed-in "Hi Atlas" link) | batch 3 (About), Part B (Privacy, Terms) |
| `bag-sort-360-*` | 128 → 234 tall | The bag sort bar carries the type pull-out chips (Distance, Fairway, Midrange, Putter), wrapping on a phone | `e79aace` |
| `detail-1440-*` | 559 → 500 | The 3D viewer now sits above "Add to" (Plan 09), and the detail actions were restyled | `6c54b6d`, `9a49891` |
| `disc-sheet-360-*` | 118 → (30) → 321 | The add-disc sheet grew (the overmold rim-colour field among others), pushing its selects below a phone's fold, so the old shot pictured an empty strip. The refreshed one frames Plastic, Keep in and Pocket | `abb894c` and later sheet changes |

Before refreshing, I fixed three things in the test so the new baseline would be deterministic:
- **Detail:** in light, the first theme, the lazily loaded 3D viewer grew about 88 px during the shot's 300 ms settle. That made the picture 412 px in light and 500 in the dark themes. The detail shot now waits for the 3D stage to be ready or fall back, and all three themes are 500.
- **Disc sheet:** the shot deliberately never scrolled inside dialogs, so the phone's Pocket field was pictured as a blank 30 px strip. Dialog contents now scroll into view with `block:'nearest'`, which is a no-op when the control is already visible.
- **Disabled state:** "disabled at 35%" read opacity after a fixed 200 ms against a 150 ms fade, and failed under load in my baseline run. It now waits for the opacity to land.

**Verdict: test rot (a stale baseline, plus two races).** No toolbar or indicator code changed in this prompt. The baseline was regenerated with `DD_PHASE=before`, and the old set is kept beside it as `outputs/dropdown-indicator/before-2026-10-06`. The comparison then passed twice in a row: 66 surfaces and 1,260 controls.

## Part D: browser matrix

**WebKit and Firefox: not run.** This Playwright install (1.63) has only `chromium-1243`. Adding WebKit and Firefox would mean new browser downloads of roughly 70–90 MB each, which the brief rules out, so the exit and reduced-motion checks in those engines are unverified. **Recommendation:** when a download is fine, run `npx playwright install webkit firefox`, then:
- `tests/apple-design-2-browser.mjs --menus` and `--compare` with `chromium` swapped for `webkit` and `firefox`. The suites hard-code `chromium`; a `PW_BROWSER` switch would be a one-line change.
- Look for:
  - menus, the Add popover, dialogs and the compare tray hiding instantly where `transition-behavior: allow-discrete` / `@starting-style` don't run (the designed fallback), not sticking visible;
  - WebKit's handling of the forced reduced-motion `transition-property` list on menu exits.

**Cluster popover far-marker fallback: verified in Chromium.** This one is engine-independent. I opened a real cluster from an anchor placed far off screen (−1600, 880), so the clamped popover sat more than 220 px away from it:
- `--menu-origin` became `50% 50%`, and the computed origin was 340 × 341 px, the exact centre of the 680 × 682 box.
- During the enter, the box's horizontal centre did not move at all (0 px). The 6 px vertical change is the batch 2 rise (`translate: 0 6px`), not the scale origin.
- For comparison, a near marker below the popover put the origin on the popover's bottom edge over the marker.

So the far case grows from the centre, not a wrong corner.

## Verification

Windows, Chromium 1243, GPU flags as the suites set them. Required results (verbatim summaries below).

| Suite | Result |
|---|---|
| `npm.cmd run test:disc3d` | 23 unit tests (shape, molds, overmold, profile) pass; viewer suite and pop-out suite all `ok`, "no page errors" (re-run after the label nudge `568a375`) |
| `test:apple-design` | 6 camera unit tests, 16 browser checks |
| `test:apple-design:2` | 29 checks |
| `test:apple-design:3` | 14 checks (13 from batch 3, plus the GSAP token durations; the branding checks now cover Privacy and Terms) |
| `test:atlas:persist` | 7 target unit tests, 13 browser checks |
| `test:add-menu` | 9 checks |
| `test:atlas:3d:perf` | exit 0 (below). Run on a quiet machine: no `workerd`, the other node processes idle (0 CPU over 3 s) |

Part C suites, green for the reasons in their diagnoses:
- `tests/motion.mjs`: PASS.
- `test:accounts:browser`: PASS, 4 themes. Run with no other wrangler session in flight.
- `test:bag:popup`: 7 checks.
- `test:atlas:3d`: 7 LOD unit tests plus 11 browser checks. The repaired block also passed 8/8 under ×4 CPU throttling.
- `tests/dropdown-indicator-browser.mjs`: 9 checks, twice in a row against the refreshed baseline.

None stayed red.

Also run: `tests/brand-browser.mjs` (40 combinations, PASS; it also passes on HEAD).

Screenshots for review are in `outputs/prompt-4/`: the panel and the pop-out at desktop and phone width, clay on and off, the Envy overmold, the Leopard's generic profile, the side-by-side board, and Privacy and Terms at 1440 and 390 in light and midnight.

### Final required performance output (verbatim)

```text
npm notice run disc-atlas@0.1.0 test:atlas:3d:perf
npm notice run node tests/atlas-3d-perf.mjs
ok - desktop: warm 3D frames are no slower than the 2D build's (flight p95 4.1 vs 3.8 ms, 1x p95 1.3 vs 0.7 ms; 921 renders)
ok - phone: warm 3D frames are no slower than the 2D build's (flight p95 15.1 vs 15.1 ms, 1x p95 3.9 vs 2.6 ms; 851 renders)
┌─────────┬───────────┬───────┬────────┬───────────────┬────────────┬────────────┬───────────┬────────┬────────────┬─────────┬───────┐
│ (index) │ device    │ build │ run    │ flight median │ flight p95 │ flight max │ 1x median │ 1x p95 │ long tasks │ longest │ discs │
├─────────┼───────────┼───────┼────────┼───────────────┼────────────┼────────────┼───────────┼────────┼────────────┼─────────┼───────┤
│ 0       │ 'desktop' │ '2D'  │ 'cold' │ 1.7           │ 3.6        │ 11.5       │ 0.5       │ 0.7    │ 0          │ 0       │ 77    │
│ 1       │ 'desktop' │ '2D'  │ 'warm' │ 1.8           │ 3.8        │ 13.3       │ 0.5       │ 0.7    │ 0          │ 0       │ 77    │
│ 2       │ 'desktop' │ '3D'  │ 'cold' │ 2.2           │ 6.8        │ 11.4       │ 0.8       │ 1.4    │ 0          │ 0       │ 77    │
│ 3       │ 'desktop' │ '3D'  │ 'warm' │ 2.1           │ 4.1        │ 11.7       │ 0.8       │ 1.3    │ 0          │ 0       │ 77    │
│ 4       │ 'phone'   │ '2D'  │ 'cold' │ 4.8           │ 15.1       │ 45.8       │ 1.4       │ 2.5    │ 9          │ 67      │ 17    │
│ 5       │ 'phone'   │ '2D'  │ 'warm' │ 4.7           │ 15.1       │ 43.6       │ 1.4       │ 2.6    │ 5          │ 70      │ 17    │
│ 6       │ 'phone'   │ '3D'  │ 'cold' │ 5.1           │ 13.7       │ 42.5       │ 2         │ 3.6    │ 4          │ 60      │ 17    │
│ 7       │ 'phone'   │ '3D'  │ 'warm' │ 5             │ 15.1       │ 28.8       │ 2         │ 3.9    │ 2          │ 61      │ 17    │
└─────────┴───────────┴───────┴────────┴───────────────┴────────────┴────────────┴───────────┴────────┴────────────┴─────────┴───────┘
```

## Still verify

- **Clay by eye.** The matcap and the two tones were tuned on an RTX 3070 in headless Chromium. Look at the Destroyer, Buzzz and Aviar in 3/4 and Profile on a real screen, and a light-plastic overmold (Atlas). If you'd rather have a warmer clay or a stronger rim contrast, the knobs are `CLAY_TONES` and the five terms of the matcap in `viewer.mjs`.
- **The preset buttons' uneven widths** (sized by label now so "Bottom" fits beside Clay): acceptable, or would you rather shorten a label?
- **Cross-section legibility on a small phone.** The true-scale slice is thin, about 28 px tall at 390 px. The numbers carry the detail, and the drawing is honest. Say if you want a magnified rim inset; that would be new chrome, so I didn't add one.
- **Part D in Safari/Firefox:** not run (see above).
- Carried over from batch 3, and yours: real phone feel, a real reduced-motion device, panel swap on a throttled phone.

## Out of scope, noticed (not built)

- **Clicks are swallowed during a theme change.** For the 240 ms View Transition (150 ms under reduced motion), hit-testing lands on the root. A tap within a quarter-second of choosing a theme does nothing, and a scripted click retries. This is what tripped `test:bag:popup`. A candidate fix is `::view-transition{pointer-events:none}` so input reaches the live page underneath. It changes batch 1's behaviour, so it's not done here.
- **Orphaned Stability help** (`public/stability-help.js` and its CSS): see Part B.
- **Privacy at 390 px:** the "← Disc Atlas" back link runs into "Updated October 3, 2026 · Invited preview" with no gap (page body, not the header; untouched).
- **The pop-out caption says "generic stamp"** while clay hides the stamp. Harmless, since the caption describes the model, but worth knowing.

## Freddy's feel test

1. **Clay side by side.** Open a Destroyer, tap Clay, then switch to a Buzzz and an Aviar: clay stays on. In 3/4, the Destroyer's thin wedge rim, the Buzzz's rounded shoulder and the Aviar's thick, blunt rim band should read at a glance. Try Profile and Bottom too.
2. **Overmold.** Open an Envy or an Atlas in clay: the rim piece is a darker clay than the plate, on the disc and in the cross-section. Pick a rim colour in My Bag, then come back to clay: it stays clay grey, and your colour is there again when Clay is off.
3. **Clay into the pop-out.** With Clay on, tap the disc to enlarge it: the pop-out opens in clay with the same cross-section and numbers. Turn Clay off in the pop-out and close it: the panel is off too.
4. **The numbers.** Open "PDGA dimensions" under the panel and compare it with the cross-section's Height, Rim width, Rim depth and Diameter: the same four values.
5. **Clay off.** Turn it off: the disc's own colour, finish and name stamp come back exactly, on the theme's own backdrop.
6. **Privacy and Terms.** Open About, Privacy and Terms: each has the sun/moon button and the ☰ menu with Light, Midnight, Charcoal, Black, in the same place, the same as Account.
