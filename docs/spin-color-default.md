# Viewer spin and the full-colour default

October 22, 2026. Claude Opus 5.5 (high effort), Freddy's Mac. Branch `claude/spin-color-default`, in its own worktree,
from freshly fetched `origin/main` at **`c040219`** (PR #42, photo stamps v3.1). v3.1 was confirmed merged before work
began. Local commits only: no push, no PR, no merge, no deploy. **No migration**: nothing stored changes shape.

Two small presentation-layer changes Freddy asked for on October 21, bundled because both live in the viewer and edit-sheet
layer.

## Part A: Full color is the game asset's default. Implemented, not verify-only

**Main did not already do this.** On `c040219` the sheet's Look row was three equal choices: *Photo · Game asset · Full
color*. "Game asset" made and wore the **one-ink** asset. Full color had to be picked separately. One read made both
layers, so the colour layer was always there, but nobody saw it unless they asked for it.

What changed (`public/disc-photo.mjs`, `public/my-bag.css`):

- The Look row is now **Photo · Game asset**. While the disc wears a game asset, a second row appears under it: **Style:
  Full color · One ink**. Under Photo there is no style row.
- **A new asset lands on Full color.** This covers one click on Game asset from Photo, Make again on a disc that wears its
  photo, and the higher-resolution original. The status reads *"Full-color asset made. Saved to your account."* If a
  stamp is too detailed to keep in colour, the asset is one ink, with v2's existing message.
- **Switching Game asset on again picks the style this way:**
  1. The style the disc wore before it went to Photo, if that happened during this visit.
  2. Otherwise **Full color**, if the asset has a colour layer.
  3. Otherwise the one-ink asset already there: a pre-v2 asset, or a stamp too detailed for colour. Nothing is made
     again because of a switch. Picking Full color on such a disc still makes the colour layer in one click, as before.
- **Saved choices persist.** A disc whose look is One ink keeps it after a reload and on every device. **Make again keeps
  the disc's style**, so a one-ink disc is remade in one ink. Only new generations and first-time switches follow the
  default.
- **No stored data changed.** The saved `look` is still `photo`, `asset` (One ink) or `color`, on the account and in the
  cache. No discs were re-rendered, no field was added, and there is no migration. The only other code change is the
  default of `savePhotoStamp`'s optional `look` parameter (`public/disc3d/photo-stamps.mjs`). Both callers pass it
  explicitly.
- Copy: under Photo the note reads *"Game asset draws this disc's stamp from its photo in full color, with the photo's
  glare left out…"*. One ink's note begins *"One ink draws…"*, and Full color's note is unchanged.

**A known edge.** "The style it wore before Photo" is remembered in memory for the visit. After a reload, a disc the player
flipped from One ink to Photo comes back to Game asset in Full color. Remembering it longer would need a new stored field,
and this part's fence is "defaults, never stored data". It is a one-tap fix for the player and the sheet shows it plainly.

## Part B: Spin, a turntable for the 3D viewer

A **Spin** toggle on the shared viewer (`public/disc3d/viewer.mjs`), so it appears everywhere that viewer draws a single
disc: the detail panel, its pop-out, My Bag's inspect view of a pulled disc (the same detail viewer), and the Gallery. It
is a 32 px icon button (40 px on touch) in the stage's top-left corner, the Enlarge button's twin. It shows a disc with an
arrow going round, has `aria-label` "Spin the disc", and uses `aria-pressed` for its state. It is not in the toolbar
because a fifth label there clipped the preset buttons at the panel's width (the existing `disc3d-browser` suite caught
this at 1440 px).

**The knob.** `SPIN_PERIOD_S = 5`: one revolution every 5 s at full speed (measured: 1.26 rad/s, one turn in 4.99 s).
`SPIN_EASE_MS = 900`: speed follows a smoothstep up from rest and back down to it. Starting reads as the disc picking up,
and stopping coasts about 31°, a little under a tenth of a turn. Both are exported constants at the top of the viewer
module.

**Direction: the hand's way.** A right-hand backhand turns the disc clockwise seen from above. RHFH and LHBH turn it the
other way, using the same `hyzerSign` the tilt uses. Changing the throwing hand reverses the spin. The spin is about the
disc's own axis, so its direction belongs to the disc, not to the stage. A flipped disc, seen from above, therefore turns
the other way.

**Interaction law.**
- Grabbing the disc takes it from the turntable **at once**. This covers an orbit drag, a rim-tilt drag, a pinch or a tap.
  It does not coast to a stop under your finger.
- On release, the spin **eases back up** if the toggle is on. OrbitControls' own damping can still be gliding the camera
  while it does.
- Scroll-zoom and the arrow keys move the camera only, so they do not interrupt the spin.
- Turning the toggle off **eases to a stop and leaves the disc at the angle it reached**. A new disc starts at 0°, as
  before.
- **Rim tilt composes.** The disc group turns inside the tilt and flip groups, so a disc tilted 30° spins about its own
  tilted axis, like a coin on edge. The test measures that axis as constant to 1e-6 while the disc turns.

**Preference.** The toggle is remembered per browser, like the display preferences: localStorage key
`disc-atlas-viewer-spin`, written only by the reader's own tap. It is a separate key rather than a field of
`DisplayPalette`, because every palette commit broadcasts `atlas-palette-change`, and every stamp surface redraws on that.
A motion toggle should not trigger that. A fresh player has it off. Under `prefers-reduced-motion` a remembered spin
**never starts on its own**, though the button still starts it. The pop-out and the Gallery carry it across with the
viewer's pose (`getPose()` now includes `turn`, the disc's angle, and `spin`). So a disc spun by the reader's tap keeps
spinning when enlarged, even under reduced motion.

**Render-loop discipline.**
- The viewer draws on demand, and still does whenever spin is off. Spin is one more term in the existing `render()`:
  `turn(now)` advances `discGroup.rotation.y` and returns true while the turntable is moving, so the existing
  `request()` chain keeps the frames coming. There is no second loop, and the geometry is never rebuilt; only the disc
  group's rotation changes.
- When it stops, frames stop. The suite checks that `state.frames` does not advance after a stop.
- The turntable eases out when it is off screen (an IntersectionObserver on the stage) and comes back when it returns.
- While the pop-out is open, the panel's viewer rests with no frames, and the pop-out hands the turntable back when it
  closes. One spinning disc is drawn at a time.
- **Frame cost is flat:** the renderer call takes 0.27 ms spinning against 0.25 ms still on the desktop, and 0.26 ms
  against 0.26 ms at phone size. A spinning frame is the same draw as a still one.

**Why it matters for the stamps.** On a spinning full-colour or stock-stamped disc, a foil finish's sheen moves across the
stamp as it turns past the model's lights. A photo's glare is baked into the photo, so on the Photo look it rides round
with the disc instead of staying with the light. The money shot below shows both.

## The money shot

Captured in the real pop-out viewer on the local signed-in harness, in real time: 26 screenshots 200 ms apart, about one
turn at 72° a second. The photo is Freddy's own DD3 (`IMG_0800`, the disc with the real window glare). Like every
player photo it is **never committed**. It was read from the v3.1 worktree's ignored photos folder, and everything made
from it is in this checkout's ignored `work/spin-color-default/evidence/`. The links open in this checkout only.

- [spin-color.webp](../work/spin-color-default/evidence/spin-color.webp): the DD3 as a **full-colour game asset**, made
  by one click on *Game asset*. That click landed on Full color (status *"Full-color asset made. Saved to your
  account."*, row checked `game` + `color`: Part A in the real flow, 9.3 s). It is shown in **Rainbow foil**. The
  colour asset wears the finish as v2's light sheen (0.35 strength), so it is quiet: it glints and shifts across the
  crystals as they pass the key light.
- [spin-buzzz.webp](../work/spin-color-default/evidence/spin-buzzz.webp): a **Buzzz with its Discraft stock stamp** in
  the same Rainbow foil. Here the sheen plainly travels: "BUZZZ" runs green, gold and magenta as the disc turns through
  the light.
- [spin-photo.webp](../work/spin-color-default/evidence/spin-photo.webp), the contrast: the same DD3 in its **Photo**
  look. The window's glare is baked into the photo, so the pale arc **rides round with the disc** instead of staying
  with the light. The de-lighting ruling exists to prevent exactly this.
- [spin-filmstrip.jpg](../work/spin-color-default/evidence/spin-filmstrip.jpg): every third frame of all three, side
  by side.

Reproduce: `node work/spin-color-default/lab/moneyshot.mjs`, then `node work/spin-color-default/lab/post.mjs` (both
ignored; they need the v3.1 worktree's photos).

## Verification

Each suite ran one at a time from this worktree, on `f3f9118`.

| Suite | Result |
| --- | --- |
| `tests/spin-color-default-browser.mjs` (new). A fresh player is off and on demand. Spin eases in (0.06 rad/s in the first 250 ms) to 1.26 rad/s, one turn in 4.99 s, clockwise for RHBH; RHFH turns the other way. Tilted 30°, the disc spins about its own axis (constant to 1e-6). A drag stops it at once with no turning while held, and release eases it back up. Off coasts 31° and stops where it reached, then on demand (no frames). The choice survives a reload. Under reduced motion a remembered spin does not start, and the tap does. The pop-out takes the turntable, the panel rests (no frames) and gets it back on close. Frame cost: 0.27 vs 0.25 ms desktop, 0.26 vs 0.26 ms phone | **Pass** |
| `tests/photo-stamp-one-click-browser.mjs`, the Part A cases. A fresh generation lands on Full color (the row checks Game asset and Full color; the account and cache say `color`) with no style row under Photo. One ink applies at once and is saved. **Make again keeps One ink** (new revision, `asset` on the account, colour made beside it). **After a reload it is still One ink**, from the account and the cache, same revision. Photo and back returns to One ink and re-renders nothing. A second disc lands on Full color, and the original link keeps One ink. Chromium desktop and WebKit phone (taps) | **Pass, both engines** |
| `all-discs-browser` (Gallery; gained a spin block: off for a fresh player, turns, still on for the next disc, eases to a stop away from 0°) | **Pass** |
| `disc3d-browser`, `disc3d-popout-browser`, `compare-viewer-polish-browser` (the viewer with spin off, unchanged) | **Pass** |
| Photo-stamp family: `assets`, `color-assets` (Chromium and WebKit), `sync` (desktop and WebKit phone), `stall` (WebKit and Chromium), `level`, updated for the new row | **Pass** |
| `photo-stamp-identity-browser`: photo look and one-ink asset vs `c040219` on every surface | **Pass: 0 differences**, noise floor 0 |
| `disc-appearance-browser`, `bag-browser`, `halo-plastic-browser` | **Pass** |
| `apple-design-2-browser` | Fails at *"before anything has been selected"*, a phone touch on an **atlas map marker**. It fails **identically on untouched `c040219`** (run as a control in the same session). Pre-existing, outside this change |
| Unit: every `tests/*.mjs` that is not a browser, evidence or perf script (`node --test`) | 303 pass. 3 fail for the environment, as recorded for v3.1: `palette` and `redesign` want a dev server on :5173, and `prompt-4-stability-fixture` wants an `outputs/` file |

`photo-stamp-level-browser` rewrites `docs/photo-stamp-orientation/` evidence images when it runs. They were restored
before committing.

## The Gallery gate

`public/disc3d/viewer.mjs` and `public/all-discs-gallery.js` are shared rendering files, so the Gallery gate ran under the
quiet protocol, paired with current main. The gate is `node tests/gallery-fixes-browser.mjs`, unchanged. The runner is
the one used for PR #39, [gate-pair.sh.txt](assets/spin-color-default/gate/gate-pair.sh.txt): AC power only, and before
each run 12 consecutive samples (about 60 s) at ≥85% idle with no foreign headless browser, `workerd` or Wrangler.
Each run's report was copied out and the tracked `docs/images/storage-all-discs-fixes/` restored. **Gate, baselines,
limits and rep counts are untouched.** Trees: this branch at `da28018` and main at `c040219`, both clean. Order: branch,
main, main, branch.

**Result: the gate passes on all four runs, branch and main alike.** Every warm rep, desktop and phone, had **0 long
tasks**. Every behaviour check (`placement`, `top`, `noPopIn`, `sticky`) is true, with zero page errors. All four drew on
ANGLE Metal (Apple M4).

| Run | Started | Desktop fly p95 per warm rep (limit 3.455) | Phone fly p95 per warm rep (limit 10.13) | Long tasks, desktop / phone | Verdict |
| --- | --- | --- | --- | --- | --- |
| branch 1 | 22:40:59 | 2.6 2.6 2.7 2.6 2.7 2.5 2.5 | 6.9 6.9 6.8 | 0 / 0 | **pass** |
| main 1 | 22:44:41 | 2.7 2.6 2.5 2.7 2.6 2.5 2.6 | 6.2 6.3 6.3 | 0 / 0 | **pass** |
| main 2 | 22:48:08 | 2.6 2.5 2.5 2.6 2.5 2.6 2.5 | 7.0 7.2 7.7 | 0 / 0 | **pass** |
| branch 2 | 23:21:47 | 3.2 3.1 3.1 3.2 3.2 3.2 3.2 | 6.4 6.4 6.2 | 0 / 0 | **pass** |

Stills were 0.1–0.5 ms against limits of 1.96 (desktop) and 3.12 (phone) on every run.

**What happened to the window.** The runner waited for AC from the moment the money shot finished and started at 22:40.
The first three runs went back to back. Then another project's local dev server (`wrangler dev` on port 8789, outside this
repository) came up. It counted as foreign, so the protocol refused to start the last run. That server was left alone,
and so was a brief off-AC reading at 22:59, which aborted the waiting runner as designed. A second runner, same protocol,
started the last run at 23:21:47, once the server had gone and a clean quiet minute had passed. Logs:
[runs.log](assets/spin-color-default/gate/runs.log), [quiet.log](assets/spin-color-default/gate/quiet.log),
[window.log](assets/spin-color-default/gate/window.log), and each run's gate log and `after.darwin.json` in
[gate/](assets/spin-color-default/gate/).

**One number, read honestly.** The second branch run's desktop fly p95 is 3.1–3.2 ms, about 0.5 ms above the other
three runs (2.5–2.7). It is still inside the 3.455 limit. It is **not this change**. Branch 1 is the identical tree,
measured with the same profile 40 minutes earlier, and it gave 2.5–2.7. The gate runs a fresh profile, so spin is off,
and with spin off `turn()` returns at once and requests no frames. The machine samples for the two branch runs look
alike (idle 77–91%, AC throughout). It is run-to-run variance between windows, and phone, the sensitive device, was the
lowest of the four on that run.

## Fences kept

- Disc geometry, stamp extraction, photo rendering: untouched. The diff touches only the viewer's rotation and toggle,
  the edit sheet's Look row, and their styles.
- With spin off, orbit, zoom, rim tilt, flip, the preset views, Clay and the pop-out behave exactly as on main. The
  existing `disc3d-browser`, `disc3d-popout-browser`, `compare-viewer-polish-browser` and Gallery suites pass unchanged
  (the Gallery suite gained a spin block).
- Part A changes defaults only: no migration, no mass re-render, no new stored field.
- The atlas map is out of scope and untouched. Atlas markers do not use the shared viewer.

## Files

- `public/disc-photo.mjs`: the Look row (Photo · Game asset, then Style: Full color · One ink), the default and the
  per-visit style memory.
- `public/my-bag.css`: the hidden style row.
- `public/disc3d/photo-stamps.mjs`: `savePhotoStamp`'s default look.
- `public/disc3d/viewer.mjs`: the turntable (`turn`, `setSpin`, the hold on grab, the off-screen pause, the pose fields,
  the button).
- `public/disc3d.css`, `public/cosmic.css`: the button and its press.
- `public/disc3d.js`: the panel rests while the pop-out spins.
- `public/all-discs-gallery.js`: the Gallery keeps the disc's own angle when it restores the camera.
- Tests: `tests/spin-color-default-browser.mjs` (new), `tests/photo-stamp-one-click-browser.mjs` (the Part A cases),
  `tests/all-discs-browser.mjs` (Gallery spin), and the photo-stamp family updated for the new row.

## Landing

Freddy's feel checks are the gate: the default should feel invisible (colour is just there), and the spin should feel
fun, not mechanical. If it feels too slow or too fast, `SPIN_PERIOD_S` is the one number to change; `SPIN_EASE_MS` sets
how soft the start and the stop are. On his word, the standard flow follows: push, PR, merge, deploy from a clean
detached worktree, and edge verification. There is no migration to apply.
