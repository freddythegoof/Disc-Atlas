# Disc Atlas: Apple design review

Review date: Oct 12, 2026. Review only: no code, data, geometry or palette was changed, and nothing is committed.
Lenses: `apple-design` (fluid interfaces, translated for the web) and `apple-animation-patterns` (Apple's animation vocabulary). Skill citations below read `[AD §n]` for `apple-design` section n and `[AP]` for `apple-animation-patterns`.

**How this was done, and its limits.** This is a static read of the motion and interaction code (`atlas-map.js`, `atlas-motion.js`, `theme.js`, `disc3d.js`/`.css`, `app.js` dropdown and compare code, `cosmic.css`, `style.css`, `directory.css`, `my-bag.css`, `dropdown-indicator.css`), plus rendered screenshots of About and Account at desktop and phone width. I did not profile frames or run on a real phone, and I did not reproduce the Directory Add bug (see finding 4). Claims about feel are inferred from the code paths. Anything marked **verify** should be checked live before it is built.

**Plan 16 and phone budget.** Every fix below uses `transform`/`opacity` only, adds no per-marker work, and adds no per-frame allocation. Fixes touching the camera note their draw-loop cost explicitly. Re-run `npm run test:atlas:3d:perf` after anything in findings 1 to 3.

---

## Summary, ordered by impact

Feel-first: what a user touches every session comes first.

| # | Finding | Surface | Impact | Effort | Perf risk |
|---|---------|---------|--------|--------|-----------|
| 1 | Camera: short fixed-duration throw, restarting tweens, no zoom momentum, dead two-finger pan | Atlas pan/zoom | High | M | Low (watch frame count) |
| 2 | Catching a moving map on a marker selects the marker | Atlas pan | High | S | None |
| 3 | Theme switch is a hard cut (buttons fade, everything else snaps) | All pages | High | S–M | Low |
| 4 | Menus and popovers enter, but never exit | Dropdowns, Add, site menu, cluster | High | S–M | None |
| 5 | Pop-out viewer: not anchored to its source, no exit, can't be reversed | 3D pop-out | Med–High | M | Low (second GL context) |
| 6 | No press feedback on the most-tapped targets (markers, rows, cluster actions) | Markers, directory, popover | Medium | S | None |
| 7 | Compare tray appears, grows and shrinks with no motion; full `innerHTML` re-render | Compare tray | Medium | M | None |
| 8 | Detail panel content swaps pop; expand mixes eases | Detail panel | Low–Med | S | None |
| 9 | No motion scale: about a dozen unrelated durations and eases | Whole UI | Low (craft) | S | None |
| 10 | Reduced motion removes fades instead of replacing slides with them | Whole UI | Low | S | None |
| 11 | Branding is restrained; three small consistency gaps across pages | Layout/About/Account | Low | S | None |

---

## Findings

### 1. Camera: the throw is short and fixed-length, retargets restart the curve, and two-finger pan does nothing

**Where:** `public/atlas-map.js:749-782` (pointer handling), `:825-831` (`tweenCamera`), `:842-846` (`animateZoom`), `:758-763` (pinch), `:801-812` (edge).

**What it does now**
- **Pan.** Dragging is 1:1 and delta-based, with pointer capture and a 5 px threshold. Good (see "Already good"). On release it runs one `gsap` tween to `pan + v·70` px over 0.24 s with `power3.out`. Velocity is clamped to ±1.5 px/ms, so the longest throw is about 105 px.
- **Wheel, buttons, keys.** Each wheel event calls `animateZoom` → `tweenCamera`, which kills the running tween and starts a new 0.16 s `power3.out`. It starts from the live position, which is correct, but a fresh `power3.out` always starts at peak speed. A trackpad delivering about 60 events/s therefore re-enters the fast part of the curve every tick, so zoom speed pulses. There is no velocity handoff between tweens.
- **Pinch.** `changeZoom` runs 1:1 about the finger midpoint (good), but it only applies the zoom factor. The midpoint's own translation is never applied, so two fingers moving in parallel without changing distance do not pan. **Verify on a phone.** If confirmed, the pinch is not direct manipulation: the content does not follow the fingers.
- **Release.** Pinch release zeroes velocity and stops dead. Pan into an edge bounds the throw target, so the camera hits the clamp with no overshoot. The rubber band is a capped 12 px displacement that eases back with `elastic.out`.

**Principle violated**
- Momentum projection and velocity handoff [AD §5, §6].
- "Never replace one animation with another at a reversal"; blend velocity instead [AD §3, "brick wall"].
- Springs for anything the user can touch [AD §4].
- Direct manipulation: content and fingers move together [AD §2].
- Progressive resistance at boundaries [AD §9].

**Numbers.** Apple's projection with `decelerationRate = 0.998` throws about 499 px per px/ms. With 0.99 it is about 99 px per px/ms. The current 70 px per px/ms is close to a 0.986 rate, so a flick travels roughly one seventh of an iOS scroll flick, and ends after 240 ms rather than the 1 s or more users expect. The tween's initial speed is `3·D/T ≈ 0.875·v`, so the handoff at release is already about 88% continuous. That is the one thing here that is nearly right.

**Fix (no geometry or grouping change)**
1. Replace the per-event `gsap` camera tween with one critically damped spring on `{zoom, x, y}`: a `target`, a `velocity` per axis, integrated in the existing frame callback. Wheel, `+`/`−`, arrow keys, buttons and flicks all just move `target` or inject `velocity`. This is about 30 lines. `draw()` already runs once per frame during a tween, so there is no new per-frame cost.
2. Spring parameters per [AD §4]: damping 1.0, response about 0.35 s for wheel and button zoom; damping 1.0 and response about 0.4 s for pan settling. The `apple-design` skill lists no bounce for a pure reposition. Keep the edge under damping 1.0, and let the rubber band do the soft landing.
3. Release: `project(v, 0.99)` for the landing point, then hand `v` to the spring as initial velocity. **Cap the projected distance** (for example, one viewport dimension) so the camera does not spend long in `groupCache.level` swap territory. Longer throws mean more frames in tween mode. Re-run the perf suite at the new duration.
4. Make `rubberband()` progressive per [AD §9], replacing the capped linear 12 px. It can keep the existing `--edge-*` glow.
5. Pinch: apply the midpoint delta as a pan (anchor-follow) on each move. On release, hand the last zoom velocity to the spring, with `bounce: 0`.

**Cost.** Medium. Keep `AtlasMotion.enabled()` as the reduced-motion gate (finding 10).

---

### 2. Catching a moving map on a marker selects the marker

**Where:** `public/atlas-map.js:752` (`stopCamera()` on pointerdown) and `:719` (click guard `mapMoved&&e.detail!==0`).

**What it does now.** `pointerdown` stops the camera, so the map is grabbable mid-flight. That part is good. But `mapMoved` is reset to `false` at that same pointerdown and nothing records that the camera was moving. If the stopping touch lands on a marker and the finger lifts without dragging, `click` fires and the marker opens its detail panel or cluster. A user braking a throw selects a disc by accident.

**Principle violated.** Predictability: a gesture to stop motion must not also commit an action [AD §10, tap rules; AD §1, response without surprise]. iOS scroll views swallow the tap that stops a decelerating scroll.

**Fix.** In `pointerdown`, record `const caught = !!cameraTween || speed > threshold` (or the spring's velocity once finding 1 lands). Suppress the resulting click when `caught` is true and the pointer didn't move, then clear the flag. No visual change, no perf cost. **Verify** live by flicking, then tapping a marker mid-glide on a phone.

---

### 3. Theme switching is a hard cut, with buttons fading while everything else snaps

**Where:** `public/theme.js:8-24` (`apply` sets `data-theme` and dispatches `atlas-theme-change`), `public/app.js:29-40` (`applyTheme` re-reads tokens and calls `draw()` immediately), `public/cosmic.css:54` (`button{transition:background .18s,color .18s}`).

**What it does now.** Switching sets `data-theme` on `<html>`. The surfaces (`body`, panels, header, the map canvas, dots, cards) change in one frame. Buttons are the exception: the global `button` rule transitions `background` and `color` over 180 ms, so for about 180 ms the buttons are visibly in the old theme while their surroundings are in the new one. That reads as a flicker, not a transition. Light↔dark is the worst case (a full brightness jump), and the four explicit themes (Light, Midnight, Charcoal, Black) make a 4×3 set of such jumps. The 3D viewers and map redraw immediately on the same event.

**Principle violated.** Ease brightness changes between light and dark; no abrupt brightness jumps [AD §14]. Continuity of state change [AD intro, "continuous" feel; AP transitions].

**Fix.** Two web-appropriate options. Pick one:
- **View Transitions API (preferred).** Wrap the `apply()` DOM update in `document.startViewTransition(...)` and style `::view-transition-old(root)` / `::view-transition-new(root)` as a 220–260 ms ease-out cross-fade. Guard with `if (!document.startViewTransition || reducedMotion) apply(...)` so unsupported browsers and the initial pre-paint apply stay as they are today. This handles canvases and WebGL uniformly because it cross-fades snapshots. Cost: two viewport textures held for about 250 ms. Check it on the phone budget. If it hitches on low-end phones, gate it on `!matchMedia('(pointer: coarse)')` and use the fallback below there.
- **Scoped class fallback.** Add `.theme-switching` to `<html>` only on a user-initiated change, remove it after about 300 ms. While present, apply `transition: background-color, border-color, color, fill, stroke .22s` to the main surfaces. Do not make those transitions permanent: that would slow hover states and collide with the existing per-component transitions. The map canvas redraw still cuts, so fade `#map`'s opacity down and up across the change.

Either way, keep the initial pre-paint `apply()` untransitioned so the page never flashes on load.

**Note on "5 themes".** I found four explicit themes in `public/theme.js:4` (`light`, `midnight`, `charcoal`, `black`), plus `dark` kept as a legacy alias for midnight, and system-follow when nothing is saved. I did not find a fifth in `web/index.html` or `theme.js`. If a fifth is in flight in another session, the findings apply unchanged.

---

### 4. Menus and popovers have an enter but no exit

**Where:** `public/app.js:215-235` (`showDropdown`/`closeDropdown`), `public/theme.js:43-69` (site menu), `public/my-bag.css:82-88` (Add menu), `public/atlas-map.js:676-681` (`closeCluster`), `public/style.css:95-96` (`cluster-appear`).

**What it does now**
- **Toolbar dropdowns** toggle `panel.hidden`: instant in, instant out.
- **Site menu** (`#siteMenu`) toggles `hidden`: no animation at all, in or out.
- **Add menu** (Directory and detail) is a `popover=manual`. It enters with `add-menu-in` (150 ms, `cubic-bezier(.16,1,.3,1)`, ±4 px, mirrored for above/below, which is good) but `hidePopover()` removes it in the same frame. The rule `.add-destination-menu:not(:popover-open){display:none}` actively prevents an exit transition.
- **Cluster popover** enters with `cluster-appear` (200 ms, `translateY(8px) scale(.98)`) from its centre, not from the marker that opened it. `closeCluster` sets `pop.hidden=true`.

So the user sees a considered entrance and an abrupt vanish. The mismatch makes every menu feel like it blinks out.

**Principle violated.** Enter and exit on the same path; anchor to the source [AD §7]. Mirror reversible transitions [AD §7]. Transitions: `.asymmetric` only when intended [AP, transitions].

**Fix.** Use native CSS for symmetric exits: `@starting-style` plus `transition: opacity, translate, overlay .15s allow-discrete, display .15s allow-discrete` on `[popover]` and `dialog`. This is Baseline 2024 (Chrome 117, Safari 17.4, Firefox 129). For the `[hidden]`-toggled menus, switch to a `data-open` attribute and remove `hidden` only after `transitionend`, or switch them to `popover` too. Exit at about two thirds of the enter duration (about 100 ms), mirrored easing. Set `transform-origin` to the trigger's attachment corner, and scale from about .96 (same restraint as today). Leave the cluster popover's centre origin only if the marker is far from it. Otherwise, anchor to the marker.

**About the buggy Directory Add.** I did not reproduce the bug, so I will not guess a root cause. Two code-level facts worth checking when you look at it:
1. `placeDropdown` runs on every capture-phase `scroll` (`app.js:238`). Scrolling the directory rows repositions the open menu synchronously on every event.
2. `renderList()` (`app.js:136`) replaces `#rows.innerHTML`. If any re-render happens while the menu is open, the trigger is disconnected and `placeDropdown` closes the menu (`!button.isConnected`). That would read as the menu vanishing.

Either could look like a bug and neither is motion. Treat both as leads, not diagnoses.

---

### 5. Pop-out viewer: not anchored to its source, no exit, can't be reversed

**Where:** `public/disc3d.js:56-97`, `public/disc3d.css:34`, `:49`.

**What it does now**
- Open: a native modal `<dialog>` with one 160 ms ease-out keyframe (`translateY(8px)` + fade). It appears centred on the page, not from the panel viewer or the Enlarge button it came from.
- The `::backdrop` appears instantly (`#0008`, no transition).
- Close: `dialog.close()` hides the dialog in one frame. `closePopout()` disposes the large viewer and calls `viewer.applyPose(...)` on the panel viewer, so the panel disc **snaps** to the dialog's final orientation.
- Interrupt: the keyframe cannot be reversed. A click on the backdrop or Esc mid-open cuts straight to closed. An `@keyframes` animation has no "current value" to reverse from.
- The pose copy on open is good: the big viewer starts at the panel viewer's orientation.

**Principle violated.** Spatial consistency: emerge from where it came, return to where it came from [AD §7]. Always animate from the current presentation value; never lock out input; avoid `@keyframes` for anything the user can interrupt [AD §3]. Materials arrive, not just fade [AD §12]. `matchedTransitionSource`-style zoom transition is Apple's own vocabulary for exactly this expand-in-place [AP, transitions].

**Fix**
1. **Open.** FLIP from the panel stage's `getBoundingClientRect()` to the dialog panel's rect with WAAPI (`transform` + `opacity`), spring-like `cubic-bezier(.16,1,.3,1)`, 280–340 ms, `transform-origin` at the stage. WAAPI animations can be cancelled and reversed from their current time, so close can start from wherever the open animation reached.
2. **Close.** Reverse the same animation (`animation.reverse()`), then `dialog.close()` on `finish`. Fade the backdrop with a `::backdrop` transition. Animate the panel disc's pose to the dialog's final pose across the exit, so the closing disc doesn't pop. The snap hides today only because the dialog vanishes instantly.
3. **Phones.** The dialog is nearly full-screen (`inset:8px`). A swipe-down-to-dismiss with velocity projection [AD §6] fits, but start the gesture on the header area only, so it never fights the canvas rotate.
4. **Perf.** The animation is `transform`/`opacity` on one element. The second WebGL renderer is created in `openPopout` today. Create it, attach it, and wait one frame **before** starting the animation, so context creation doesn't land inside the first frames. Keep the panel's poster behind the morph. This respects the single-context concern on mobile Safari.

**Cost.** Medium. This is the newest surface, so it is the highest "polish per hour" fix after the camera.

---

### 6. No press feedback on the most-tapped targets

**Where:** `public/cosmic.css:193-199` (the covered set), `public/cosmic.css:100` (`.atlas-marker{... transition:none!important}`), `public/atlas-motion.js:62-70` (hover excludes touch).

**What it does now.** Press scale (`scale(.96)`) exists on `.explore-tools`, `.atlas-lens`, `.map-controls`, `.detail-actions`, `.coach-launch`, `.pill-button`, `.wide`, `.stack-choice` and `.directory-add`. It is missing from:
- **`.atlas-marker`**, the primary tap target. Hover motion (`atlas-motion.js`) skips `pointerType==='touch'`, so on a phone a marker gives no response until the detail panel arrives.
- **`.disc-row`** (the directory row), `.inspect-disc`, `.compare-item` and its remove ×.
- `.cluster-action`, `#clusterClose`, `.pick-compare`.
- `.disc3d-toolbar button`, `.disc3d-expand`, the dialog `.close`.
- `header nav button` and every `.site-menu` / `.add-destination-menu` item.

Where `:active` exists, release is slow: the element's `transition: transform .25s` is also the release curve.

**Principle violated.** Respond on pointer-down, not on release; feedback must be instant [AD §1]. Tap: highlight on touch-down, commit on touch-up [AD §10].

**Fix.** Add one shared rule: `:active` → `transform: scale(.97); transition-duration: 80–100ms` for the entry, with the normal curve back on release. For markers, press the art child only (`.marker-stack`), since `.atlas-marker` itself is positioned by transform and hover owns `.marker-stack` via GSAP (`atlas-motion.js:66`). Pressing at pointerdown also masks the first frames of the detail-panel reveal on phones. For rows, a background tint on `:active` is enough. Gate the hover lift with `@media(hover:hover)`, as it already is.

---

### 7. Compare tray: no motion in, out or between states

**Where:** `public/app.js:140` (`renderCompare`), `public/cosmic.css:142` (`#compareBar`).

**What it does now.** `bar.hidden = !comparison.length` shows and hides the tray in a frame. Each change rebuilds the whole tray with `bar.innerHTML = ...`: all three cards, including their flight-sketch SVGs and disc art, are recreated even when only one disc was added or removed. Adding a disc pops a card in. Removing one pops a card out and the others jump to fill the gap. The pick button's `.is-picked` state (`style.css:99`) only transitions colour; its border and background change is otherwise unanswered.

**Principle violated.** Every state change answered with motion; continuity of layout [AD §3, §7, §16 craft]. Insert/remove transitions [AP, transitions]. Per-frame costs aside, rebuilding unchanged DOM also risks visible image flicker.

**Fix.**
1. Tray: enter with `translateY(12px)` + fade, `cubic-bezier(.16,1,.3,1)`, about 220 ms; exit mirrored at about 150 ms. Same `@starting-style` approach as finding 4.
2. Key the cards by disc id and only insert/remove the changed one. Animate the new card in with scale .96 → 1 and fade. When a card leaves, FLIP the siblings (measure before and after, animate `transform` only).
3. Optional, and the one move here that earns its keep: have the added card originate from the pick button's position (spatial source, [AD §7]). Skip it if it complicates the phone layout.

No effect on the map or the 3D art path.

---

### 8. Detail panel: reveal is good, content swaps and expand have small gaps

**Where:** `public/app.js:109-118` (`updateDetail` diff), `public/atlas-motion.js:36-44` (`expand`), `public/cosmic.css:165`.

- **Content swap.** Selecting a different disc while the panel is open diffs the DOM in place. The name, numbers, flight sketch and photo change in the same frame. This is the most frequent detail interaction, because users click through discs. A 120 ms cross-fade of the text blocks (not the 3D stage, which is `data-sync-keep` and handles its own poster) answers the change. Keep it opacity-only and skip it when the panel was just revealed.
- **Expand.** `AtlasMotion.expand` measures the live height and tweens it, so it is interruptible and starts from the presentation value (good). Two nits. It uses `power3.inOut` for a user-triggered toggle, where an ease-out or spring reads as more responsive [AD §4]. And `.is-expanded` flips `border-radius` and `100dvh` instantly while only height animates.
- **Context title.** The header swaps the wordmark for the context title with `hidden` toggling (`app.js:162-174`). **Verify** whether it pops. A 120 ms cross-fade would be enough.

---

### 9. No motion scale: a dozen unrelated durations and eases

**Where:** across the CSS and `atlas-motion.js`.

Durations in use: .12, .15, .16, .18, .2, .22, .25, .3, .32, .35, .4, .45 s. Easings: `ease`, `ease-out`, `power3.out`, `power3.inOut`, `elastic.out(1,.65)`, `elastic.out(1,.55)`, `cubic-bezier(.2,.8,.2,1)` and `cubic-bezier(.16,1,.3,1)`. None of the individual choices is wrong, but the sum reads as hand-tuned per component. Per the craft principle, every timing should be a value you can defend [AD §16, "Craft"].

**Fix.** Define three custom properties on `:root`, for example `--dur-press: 100ms`, `--dur-ui: 180ms`, `--dur-surface: 280ms`, plus `--ease-out: cubic-bezier(.16,1,.3,1)` (the one the dropdown indicator and Add menu already use). Use them for new work first (findings 3 to 8). Migrate old rules opportunistically. This changes no behaviour on its own.

---

### 10. Reduced motion removes fades instead of replacing slides with them

**Where:** `public/polish.css:15` and `public/cosmic.css:169` (`*{animation:none!important;transition:none!important}`), `atlas-motion.js:3-4` (`enabled()` false when reduced).

Under `prefers-reduced-motion: reduce`, all transitions and animations are removed, including opacity and colour changes that help comprehension, and the camera jumps to its destination. [AD §14] asks for the opposite: replace slides, springs and parallax with short opacity cross-fades; keep colour and opacity changes. A zoom that teleports is more disorienting than a short fade. **Fix:** exempt `opacity` and `color` transitions from the global kill, and give the camera a 150 ms opacity-free ease instead of a jump. Apply the same gate to the theme transition in finding 3.

---

### 11. Branding in layout, About and Account: restrained, with three small gaps

**Checked:** desktop and phone screenshots of About and Account, and the header markup in `web/index.html`, `about.html`, `account-page.html`.

The lockup itself is restrained. It uses the mono ink (`--da-ink` follows `--text`), with the accent confined to the submark. The wordmark is 120×19 beside a 34 px mark, with the mark at about 1.8× the wordmark's height, which keeps the hierarchy clear. Screen-reader text is handled. On About, the terracotta appears only in the back-link and the hero. I would not change any of that.

Gaps:
1. **Theme control differs on every page.** The app header uses an icon toggle plus a menu with radios. Account uses an icon toggle and a menu. About uses a labelled `Theme: Midnight ▾` select whose option order (Midnight, Charcoal, Black, Light) differs from the menu's. Same function, three affordances: a familiarity gap [AD §16, "Familiarity"]. Use the Account pattern on About.
2. **Light surfaces differ between pages.** About's light theme is a warm cream (`#f7f3ec`, `about-hero.css:10`) while Account's and the app's are a cool `#f7f8fa`. Navigating About ↔ Account in light mode flashes a hue change. Intended as an About-only moment, but worth a decision rather than a default.
3. **Header height and spacing are driven by page-specific rules** (`info-page header{height:68px}` against `--header-height` in the app). The lockup's baseline moves a few pixels between pages. Aligning them would stop the logo from "jumping" on navigation.

---

## Already good: don't fix these

- **Grab-while-moving.** `pointerdown` calls `stopCamera()` and the pan is delta-based (respects grab offset), with pointer capture after the 5 px threshold and `pointercancel`/`lostpointercapture` handled. This is real direct manipulation [AD §2, §3].
- **Throw gating.** Momentum only runs if the pointer moved within 90 ms of release, so a pause before lifting cancels the throw, as on iOS.
- **Edge feedback.** Release uses an `elastic.out` return and an edge glow instead of a hard stop [AD §9]. It just needs the progressive curve (finding 1).
- **Retargeting from the live value.** Both `tweenCamera` and `AtlasMotion.slide` start from the presentation value, and wheel retargets accumulate `cameraDestination`. The panels' reveal/dismiss is interruptible with asymmetric timing (.18 in, .12 out).
- **Hover as a physical response.** Pointer-fine only, skipped while dragging, a subtle magnetic tilt on the art child with an elastic release (`atlas-motion.js:56-77`). It animates transform only and never touches layout. It is the most Apple-feeling thing in the app.
- **Marker choreography.** Regroup cross-fades (`.18 s`), the draw loop eases each marker toward its rest spot (`gapFade`, `toward(...)`), and `.atlas-marker` uses `transition:none!important` so CSS never fights per-frame positioning. Plan 16's art cross-fade (`ART_FADE` 180 ms, `ART_SETTLE`, 6 ms budget) is sound.
- **Dropdown indicator.** One chevron, three sizes, state set by the trigger, 150 ms expo-out, 180° on open (`dropdown-indicator.css`). Model citizen. Its easing should become the house ease (finding 9).
- **Add menu entrance.** Expo-out, ±4 px, mirrored when it flips above the trigger. It only needs an exit.
- **Press scale on the main buttons**, gated by `hover:hover` for the lift. The pattern is right; coverage is the gap (finding 6).
- **3D viewer rotation** already has inertia (`enableDamping`, `dampingFactor .12`, `viewer.mjs:69`), and the pop-out hands the pose across on open.
- **Native `<dialog>` modals** give Esc, focus containment and inert background for free. Keep them. Add exit and anchoring on top.
- **Reduced-motion is respected everywhere.** The gap is quality (finding 10), not coverage.
- **Branding.** See finding 11: the mark/wordmark system is restrained and the terracotta palette is untouched.

---

## What the skills don't cover (web constraints and budgets)

- **`apple-animation-patterns` is SwiftUI.** Its API detail (`PhaseAnimator`, `matchedTransitionSource`, `symbolEffect`) does not transfer. What transfers is vocabulary: spring-first, additive/interruptible motion, asymmetric insert/remove, restraint, per-frame closures stay cheap. `apple-design` carries the web mapping and I relied on it for the specifics.
- **Compositor limits.** Only `transform` and `opacity` run off the main thread. The map camera, marker positions and 3D art are main-thread (canvas, DOM transforms set in `draw()`), so any extra per-frame work competes with the 6 ms art budget and the phone's ~13 ms p95 `draw()` (Plan 16 measurements). Prefer fixes that reduce or keep per-frame work. A spring camera is neutral. Long throws are not.
- **View Transitions and `@starting-style`/`allow-discrete`** are now Baseline in current Chrome, Safari and Firefox, but a View Transition holds viewport snapshots. Test it on the throttled phone profile before shipping it everywhere.
- **WebGL context count.** The pop-out creates a second renderer. Mobile Safari limits live contexts, so create it before the open animation and dispose it after the close animation finishes.
- **No spring primitive in CSS.** `linear()` easing can approximate a spring for fixed transitions (menus, tray), but not for interruptible camera or gesture work. Use a small rAF integrator there. This avoids a new dependency.
- **Haptics and sound** [AD §13] are not available on iOS Safari (no Vibration API). Skip them.
- **Materials** [AD §12]: the app uses opaque panels. Adding `backdrop-filter` blur on large surfaces (cluster popover, compare tray, pop-out) would cost fill-rate on phones for little gain. I recommend against it for this pass.

## Suggested build order (Freddy's call)

1. **#2** (catch-tap guard): tiny, removes a real accident.
2. **#6** (press feedback): one shared rule plus markers.
3. **#4** (menu exits): one CSS pattern, reused by #7 and #5.
4. **#3** (theme cross-fade): high visibility, small code.
5. **#1** (spring camera): the biggest feel change. Do it alone, then re-run the perf suite.
6. **#5**, **#7**, then **#8 to #11** as polish.
