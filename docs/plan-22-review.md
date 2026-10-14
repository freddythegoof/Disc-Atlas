# Plan 22 — independent review and fix pass

Reviewer: Claude (Opus), October 13, 2026. Scope: the photo-to-3D build (`e73065f`, `5dbe267`, `07fb634` on
top of `9ef2810`), reviewed from the diff, plus Freddy's live feedback of October 13 (Parts 3–6). Nothing was
pushed or deployed and no remote Cloudflare command was run. `wrangler.public.jsonc` had an uncommitted,
formatting-only rewrite when this pass began (same settings, reindented — wrangler rewrites its own config);
it was left untouched and never staged.

The original brief, `photo-to-3d-texture-prompt.md`, is not on this machine (searched Documents, Desktop,
Downloads, OneDrive and the repo). The review therefore checks the code against the brief's items as
restated in the Plan 22 review prompt and against `docs/photo-textures.md`, not against the original file.

## Part 1 — the build against the brief

| Item | Verdict | Evidence |
| --- | --- | --- |
| Privacy / ownership | **Clean** | `photoRoute` runs only after `auth.session`; every GET/PUT/DELETE selects the row by `user_id` **and** `id`; another owner gets 404, signed out 401 (tests). Mutations check Origin + CSRF. Keys are random UUIDs, the bucket has no public binding or domain (grep: no `r2.dev`/custom domain anywhere), image responses are `private, no-store`, `nosniff`, `Cross-Origin-Resource-Policy: same-origin`. The client caches nothing persistently (no service worker, IndexedDB or Cache Storage; in-memory caches clear on account change). |
| Processing honesty | **Clean; coverage added** | Only `processPhoto`'s canvas WebP is sent (no source bytes; canvas encoding carries no EXIF/GPS). The Worker streams with a hard 512 KiB cap (Content-Length not trusted), requires the RIFF size to equal the payload (no trailing bytes), accepts only VP8X/ICCP/ALPH/VP8/VP8L, rejects animation/EXIF/XMP flags and chunks, checks coded frame size against the canvas, square 128–1024. The builder's tests did not exercise the animation/EXIF/XMP *flags*, bytes after the RIFF payload, a lossy frame that disagrees with its canvas, an interframe, or declared-but-missing alpha — `7444f6b` adds all of them (they pass: no code defect). |
| Projection | **Clean (Parts 3/5 changed the material and the bag's roll)** | Photo mesh stops at the shoulder (or overmold seam); rim/underside/overmold materials untouched; stamp hides only when `photoReady`; Clay hides and restores; discs without a photo get no photo mesh and keep their old appearance (the only change is a cache-key suffix). |
| Cleanup durability | **Fixed** (`f734cc5`) | Upload intent is written before the R2 put, attach and dequeue share a D1 batch, triggers queue replaced and deleted keys including the account FK cascade, and the cron converges (LIMIT 100 per run, idempotent R2 delete). **Defect:** `cleanupTextures`' first query could throw *after* the delete/attach had committed, so a D1 hiccup turned account deletion into a 503 **without clearing the session cookie**, and turned a saved photo replace or disc removal into an error the client would retry. It now never throws (the queue is durable; the cron retries). Regression tests for account deletion and photo routes. |
| Migration `0010` | **Clean** | Mirrors `0008`: one nullable `ADD COLUMN` with a CHECK (41 chars, hex/hyphen UUID + `.webp`), existing rows NULL; partial unique index; queue table; two triggers. |
| Claimed race fixes | **Confirmed by mutation; gaps closed** | Mutating each guard makes a test fail (see *Mutation check*). Missing before this pass: closing the editor during compression (`d1e03c8`), a non-JSON error page during upload (`fd1e281`), thumbnail release (`041ac69`), photo level changes in atlas art (`2131d35`), cleanup outages (`f734cc5`). |

### Defects fixed

1. **Cleanup outage after a committed change reported failure** — above (`f734cc5`).
2. **Photo upload failure messages hid that the disc had saved** (`fd1e281`). A dropped connection showed
   "Failed to fetch"; an edge error page (413/502 HTML) showed a raw JSON parse error. Both now say
   "Disc saved." with the reason and reconcile; retry still updates the same copy.
3. **Finished thumbnails stayed observed forever** (`041ac69`). Plan 22 removed the `unobserve` after a
   thumbnail rendered (to refresh photo rows), so every list row stayed under the IntersectionObserver and
   re-rendered each time it scrolled back into view. Rows are now released once final; only a row whose
   photo is still loading stays watched.
4. **A photo disc's atlas image flickered off on zoom and was refetched per level** (`2131d35`). Atlas art
   disposed each photo after its first rasterisation, so every level change on My Map fetched (no-store)
   and decoded the photo again, and meanwhile the *plain* placeholder at the new level shadowed the finished
   photo image at the old level. Decoded photos now stay live for the 8 most recently drawn discs (a loading
   photo is never evicted — a naïve LRU would livelock with more than 8 photos loading), a finished image at
   any level beats a placeholder, and placeholders are dropped once replaced.

### Mutation check (do the tests catch regressions?)

Run in a throwaway worktree; each guard removed in turn:

| Mutation | Caught by |
| --- | --- |
| Drop the post-compression account/editor guard | account switch during compression; closing during compression |
| Drop the post-upload editor guard | closing / reopening the editor during upload |
| Keep offscreen rows in the visible set | photo readiness redraws only intersecting thumbnails |
| Never release finished rows | finished thumbnails stop being observed |
| Attach without checking the old key | a delayed upload cannot resurrect a deleted disc or overwrite a newer photo |
| Disable the delete trigger | migration … including account cascades |
| Disable the replace trigger | private photo route … replaces and removes; cleanup outage |
| Skip the upload intent | every photo PUT test (attach requires the intent) |

### Judgment calls for Freddy (deviations kept, not silently)

- **Cleanup is best-effort inline + durable cron**, not transactional with R2. One theoretical orphan path
  remains: an upload that stalls for about an hour, attaching at the very moment its intent expires, on a
  Worker whose clock trails the cron's. Closing it would mean dequeuing before the R2 delete, which turns
  every R2 outage into a permanent orphan instead. Left as is.
- **A future table rebuild of `bag_discs`** (like `0006`) silently drops the cleanup triggers and the
  `texture_key` column unless it recreates them. Worth a comment in whichever migration does that next.
- **Lost/Storage cards show a colour swatch, not the photo.** With colour auto-match the swatch now agrees
  with the plate; switching those cards to photo thumbnails is a small follow-up if you want it.
- **The WebP validator accepts any bytes inside a valid VP8/VP8L frame chunk.** It bounds decode size and
  rejects metadata chunks, but cannot prove the frame contains only pixels without decoding. Only the
  owner can read the object back, so this is not a privacy gap.

## Part 2 — the atlas performance gate: **(b) pre-existing variance**

Protocol: quiet machine (no other test or agent browser running; Wallpaper Engine and chat apps idle, all
under 8% CPU). Baseline `9ef2810` and current `07fb634` each ran from their own detached worktree, so this
checkout was never disturbed and edits here could not leak into a measurement. The exact command
`npm.cmd run test:atlas:3d:perf` ran interleaved, current-first for 2 rounds and baseline-first for 6,
with the same Playwright/Chromium (1.62.1 / chromium-1243, ANGLE D3D11, RTX 3070) as the builder.

### The gate itself, interleaved (warm runs; 3D/2D)

| Round | Tree | Desktop flight p95, ms | Phone flight p95, ms | Phone long tasks | Result |
| --- | --- | --- | --- | --- | --- |
| r1 1 | baseline `9ef2810` | 6.4 / 6.5 | 20.8 / 21.1 | 5 / 12 | Pass |
| r1 1 | current `07fb634` | 6.4 / 5.1 | 26.2 / 17.2 | 20 / 8 | **Fail** (phone) |
| r1 2 | current `07fb634` | 6.4 / 5.6 | 22.2 / 20.4 | 10 / 11 | Pass |
| r2 1 | baseline `9ef2810` | 7.7 / 6 | 25.4 / 28 | 19 / 23 | Pass |
| r2 1 | current `07fb634` | 7.3 / 7.8 | 25.5 / 18.1 | 15 / 10 | **Fail** (phone) |
| r2 2 | baseline `9ef2810` | 6.8 / 5.9 | 33.3 / 27.8 | 38 / 16 | **Fail** (phone) |
| r2 2 | current `07fb634` | 7.5 / 5.3 | 21.6 / 18.3 | 11 / 8 | **Fail** (phone) |
| r2 3 | baseline `9ef2810` | 7.5 / 4.9 | 20.6 / 27.2 | 10 / 15 | **Fail** (desktop) |
| r2 3 | current `07fb634` | 5.7 / 5.7 | 25.3 / 17.5 | 22 / 10 | **Fail** (phone) |
| r2 4 | baseline `9ef2810` | 8.6 / 4.3 | 27.6 / 43.2 | 17 / 43 | **Fail** (desktop) |
| r2 4 | current `07fb634` | 6.5 / 4.6 | 24.2 / 16.9 | 15 / 7 | **Fail** (phone) |
| r2 5 | baseline `9ef2810` | 6.3 / 5.5 | 20.8 / 20.4 | 8 / 10 | Pass |
| r2 5 | current `07fb634` | 6.1 / 6.1 | 36.1 / 24.9 | 34 / 11 | **Fail** (phone) |
| r2 6 | baseline `9ef2810` | 6.7 / 4.3 | 22.2 / 31.7 | 5 / 25 | **Fail** (desktop) |
| r2 6 | current `07fb634` | 6.6 / 4.4 | 23.5 / 21.3 | 9 / 10 | **Fail** (desktop) |

Round labels: `r1` ran current-first, `r2` baseline-first. One baseline run was interrupted by me moving the protocol to frozen worktrees and is excluded (its JSON was the previous run's leftover).

Passes: **current 1 of 8, baseline 3 of 7.** The untouched baseline fails too, and in both of the ways the
builder saw: desktop flight frame time (3 times) and phone (once: 1x p95 19.9 vs 3.0 ms, long tasks 38 vs 16).
The current tree's failures cluster on phone. The direct A/B below shows why that is not a regression.

### Direct A/B: the same measurement, alternating page loads in one browser

`perf-ab.mjs` runs the test's own `FLIGHT` function (extracted verbatim from `tests/atlas-3d-perf.mjs`) on
both trees served side by side, alternating order every round. Medians of each run's warm figures:

| Device / build | n per tree | flight p95, baseline → current | 1x p95 | long tasks |
| --- | ---: | --- | --- | --- |
| Phone 3D | 10 | 23.5 → **22.8 ms** | 5.0 → 3.7 ms | 12 → 9 |
| Phone 2D | 8 | 21.3 → **21.2 ms** | 2.7 → 3.3 ms | 10 → 8 |
| Desktop 3D | 8 | 6.7 → **6.4 ms** | 1.9 → 2.0 ms | 0 → 0 |
| Desktop 2D | 8 | 4.4 → **4.4 ms** | 1.2 → 1.3 ms | 0 → 0 |

The photo build costs nothing measurable on the atlas with no photos. The gate's verdict varies because a
single run's own 2D reference is as noisy as its 3D: within the gate, phone 2D flight p95 ranged
16.9–43.2 ms across identical code, and phone long tasks 5–43. A pass or fail turns on which way that run's
2D happened to fall.

### Why the gate flips (an argument, not a change — thresholds untouched)

- **Desktop:** the limit is `2D × 1.15 + 1.5 ms`. With 2D at 4.4 ms that is about 6.56 ms, and both trees'
  3D median sits at 6.4–6.7 ms — on the line. Roughly half of all runs fail on either tree.
- **Phone long tasks:** the limit is 2D's count **+1**, but the count varies by ±5 or more between identical
  runs (2D: 5–43). A +1 allowance on a noisy count is a coin toss.

Suggested for Freddy's decision only: compare medians of several warm runs per build, or widen the
long-task allowance proportionally (for example `max(2, 25%)`). The test, thresholds and comparison rules
were not changed.

### After this pass

The final tree (`5d316a7`, all fixes and Parts 3–6) against the baseline, same protocol, baseline-first:

| Round | Tree | Desktop flight p95, ms | Phone flight p95, ms | Phone long tasks | Result |
| --- | --- | --- | --- | --- | --- |
| 1 | baseline `9ef2810` | 5.8 / 4.9 | 19.1 / 17.5 | 4 / 5 | Pass |
| 1 | final `5d316a7` | 5.4 / 4.3 | 20.6 / 17.8 | 14 / 3 | **Fail** (phone) |
| 2 | baseline `9ef2810` | 6.5 / 4.2 | 19 / 20.7 | 6 / 8 | **Fail** (desktop) |
| 2 | final `5d316a7` | 5.4 / 4.4 | 20.2 / 16.6 | 5 / 6 | Pass |
| 3 | baseline `9ef2810` | 6 / 5.1 | 20.3 / 15.2 | 2 / 6 | Pass |
| 3 | final `5d316a7` | 6.1 / 4.4 | 18.3 / 18.8 | 2 / 12 | **Fail** (desktop) |
| 4 | baseline `9ef2810` | 6.6 / 4.3 | 21.8 / 31.5 | 9 / 22 | **Fail** (desktop) |
| 4 | final `5d316a7` | 6.3 / 3.9 | 20.2 / 20.5 | 6 / 10 | **Fail** (desktop) |
| 5 | baseline `9ef2810` | 4.9 / 4.1 | 22.5 / 15.9 | 9 / 4 | **Fail** (phone) |
| 5 | final `5d316a7` | 5.6 / 4.2 | 17.7 / 18.1 | 5 / 2 | **Fail** (phone) |
| 6 | baseline `9ef2810` | 5.8 / 5.1 | 18.1 / 16.8 | 10 / 4 | **Fail** (phone) |
| 6 | final `5d316a7` | 6.5 / 4.2 | 21.3 / 19.6 | 9 / 6 | **Fail** (desktop, phone) |

**Final tree 1 of 6, baseline 2 of 6.** The untouched baseline failed 4 of 6 here, in both ways (desktop frame time twice, phone long tasks twice). Over every interleaved run in this review the baseline passed **5 of 13**. Absolute 3D cost is unchanged: phone 3D flight p95 medians 20.2 ms (final) vs 19.7 ms (baseline), desktop 5.9 vs 5.9 ms. So the gate does not pass reliably on the final tree, and it does not pass reliably on the code from before Plan 22 either. It is variance the baseline shares, not a regression this work introduced or fixed. Making it pass would mean changing the measurement, which is Freddy's call.

## Part 3 — the photo reads as the model, not a picture

**Delighting** (`6c1ae36`, `public/disc-albedo.mjs`), applied before upload, in linear light:

1. *Illumination field.* A quadratic surface is fitted to log luminance over the flight plate (inside 78% of
   the radius), robustly: six Tukey-reweighted passes drop the stamp, scuffs and glare as outliers. Dividing it
   out flattens top-to-bottom gradients and falloff. Being quadratic it cannot follow fine detail, so stamp
   edges and scuffs survive at full contrast (unit test: stamp and a 2 px scratch within 12% of truth), and,
   unlike dividing by a heavy blur, it leaves no halo round a large stamp.
2. *White balance, only from evidence.* The brightest 3% of plate pixels are white ink or glare, both the
   colour of the light. When they are near-neutral (chroma < 0.3), their cast is removed, at most ±15% per
   channel. A saturated disc with no white keeps its colour rather than being greyed (unit test).
3. *Exposure.* The plate's median is moved only if it falls outside a sane band (0.08–0.6 linear).
4. *Glare.* Clipped, colourless pixels well above the light field are pulled halfway back to the plate.

**Limits, plainly:** a hard reflection can be reduced, not un-invented (there is no colour under a clipped
pixel, so the test photo's glare spot is dimmer, not gone); a hard cast shadow (phone, hand) is not smooth
and stays; mixed-colour lighting is corrected only for its average; a disc whose design covers most of the
plate gives the fit less plain plastic to read.

**Lit by the engine** (`391b632`). The photo surface now wears a *copy of the plate material it covers*:
the same physical material, roughness and clearcoat, and in atlas art the same slope-shading shader hook.
Before this, the bag and collections used three.js' default matte material for the photo and atlas art
dropped the slope shading. Highlights and falloff now come from the model. Detail views add a faint relief
whose height is how far each pixel's brightness sits from the plate's, so a stamp — dark on light or light
on dark — catches light at its edges (bump scale 0.35, detail viewers only). In the bag, a hovered photo
plate now glows with its disc.

**Colour auto-match** (`9cb66a7`). Use photo sets the sheet's disc colour to the plate colour measured from
the delit photo: the most common colour on the plate, from a coarse 3D histogram, so inks and glare don't
vote. The rim, edges, stowed rack discs, swatches and map dots agree with the photographed plate. The colour
stays editable and is saved with the photo; Replace re-measures it; Remove in the same sheet restores the
colour it replaced unless that was changed by hand since. **Judgment call:** across sessions the
pre-photo colour is not stored (that needs a nullable column, i.e. a migration you would have to apply
remotely; the brief said no storage changes). Removing a photo saved in an earlier session keeps the
matched colour, which is the disc's real colour anyway. Photos uploaded before this change are not
re-processed or re-matched until replaced.

Test input: `outputs/plan-22-review/room-light-disc.jpg` is the builder's synthetic, evenly lit sample
(not a real photograph, not Freddy's disc) with ordinary room light applied by `perf/room.mjs`: top 2.3×
brighter than the bottom, a warm cast and one hard glare spot. Freddy should judge with a real photo.

| View | Shipped (`07fb634`) | This pass |
| --- | --- | --- |
| Panel, desktop | [before](../outputs/plan-22-review/panel-desktop-before.png) | [after](../outputs/plan-22-review/panel-desktop-after.png) |
| Pop-out, desktop | [before](../outputs/plan-22-review/popout-desktop-before.png) | [after](../outputs/plan-22-review/popout-desktop-after.png) |
| Panel, phone | [before](../outputs/plan-22-review/panel-phone-before.png) | [after](../outputs/plan-22-review/panel-phone-after.png) |
| Pop-out, phone | [before](../outputs/plan-22-review/popout-phone-before.png) | [after](../outputs/plan-22-review/popout-phone-after.png) |
| Processed upload | [before](../outputs/plan-22-review/processed-before.webp) | [after](../outputs/plan-22-review/processed-after.webp) |

## Part 4 — the aligner pops out, with guides (`8b73b72`, `d1546f6`)

Choosing a photo opens the aligner in its own large pop-out. It reuses the 3D pop-out's frame: up to
880 × 920 on desktop, full screen on phones. The disc fills as much of it as the screen allows. The view
reaches 20% past the crop circle, so an off-centre disc shows what is being cut off. The guides are drawn on
their own canvas over the view and are never read by processing:
- a light grid;
- a crosshair with a centre point and ring;
- the **rim** circle (the crop's edge), solid;
- the **flight-plate** circle, dashed, from the mold's real shape (shoulder, or overmold seam);
- everything outside the rim is dimmed.

Drag, arrow keys (Shift for larger steps), scroll or +/− adjust; the framing and tilt sliders sit in the
pop-out (open by default on desktop). Use photo prepares the upload there and returns to the sheet with a
thumbnail; Cancel returns with nothing changed. The browser test proves the guides never reach the upload:
the uploaded bytes equal `preparePhoto`'s own output for the same photo and framing. The save flow is
unchanged: Save still uploads `photoEditor.value()` after the disc.

[Desktop](../outputs/plan-22-review/aligner-desktop-after.png) ·
[phone](../outputs/plan-22-review/aligner-phone-after.png) ·
off-centre disc: [desktop](../outputs/plan-22-review/aligner-offcenter-desktop-after.png),
[phone](../outputs/plan-22-review/aligner-offcenter-phone-after.png).

## Part 5 — a pulled disc reads upright (`58eb2cd`)

The photo's UVs and the generic stamp's share one convention (`u = .5 + x/2R`, `v = .5 − z/2R`, top at
`v = 1`), so every pose built to read the stamp reads the photo too. The storage rack's pulled disc already
spins a quarter turn about its own axis (`SPIN`) for its stamp, and reads upright. The **bag** mesh never had
a stamp. It shows a disc by turning its +X toward the viewer about the vertical axis
(`setFromUnitVectors(X, face)`), which leaves texture-up pointing sideways. The fix is in the bag's
presentation only: its photo surface takes the same quarter turn about the disc's own axis. The shared
texture, the detail viewer and the pop-out are untouched. Checked: bag pulled (was sideways, now upright);
storage pulled (already upright); Lost graveyard (lies flat, design top away from the viewer, upright); list
thumbnails (top-down, upright). This was verified by screenshot, not by an automated test.

[Bag pulled, before](../outputs/plan-22-review/bag-pulled-closeup-before.png) ·
[after](../outputs/plan-22-review/bag-pulled-closeup-after.png) (full frames:
[before](../outputs/plan-22-review/bag-pulled-desktop-before.png),
[after](../outputs/plan-22-review/bag-pulled-desktop-after.png)) ·
storage pulled [before](../outputs/plan-22-review/storage-pulled-desktop-before.png) /
[after](../outputs/plan-22-review/storage-pulled-desktop-after.png) ·
Lost [before](../outputs/plan-22-review/lost-desktop-before.png) /
[after](../outputs/plan-22-review/lost-desktop-after.png).

## Part 6 — a better Add photo button (`5d316a7`)

The 12 px underlined link is now a labelled **Photo** field ("Your disc's own stamp on its 3D model. Only you
can see it.") with a camera-icon button in the sheet's chip family. It has an accent outline and soft accent
fill, so it reads as an action without competing with Save. It is 44 px tall (48 px on phones) and uses the
theme tokens, so it holds in all four themes. Replace photo keeps the same weight; Remove photo is a plain
chip beside it and the photo's thumbnail.

| Theme | Before | After (no photo) | After (with photo) |
| --- | --- | --- | --- |
| Light | [sheet](../outputs/plan-22-review/sheet-light-desktop-before.png) | [sheet](../outputs/plan-22-review/sheet-light-desktop-after.png) | [control](../outputs/plan-22-review/sheet-photo-light-desktop-after.png) |
| Midnight | [sheet](../outputs/plan-22-review/sheet-midnight-desktop-before.png) | [sheet](../outputs/plan-22-review/sheet-midnight-desktop-after.png) | [control](../outputs/plan-22-review/sheet-photo-midnight-desktop-after.png) |

Phone versions sit beside them (`*-phone-*.png`).

## Verification

Run on the final code (`5d316a7`) with Playwright 1.62.1 / chromium-1243. Verbatim output: `outputs/plan-22-review/logs/` (`exit-codes.txt` and one log per command).

| Command | Exit | Summary line(s), verbatim |
| --- | ---: | --- |
| `npm.cmd run test:photo-textures` | 0 | `ℹ tests 24 · ℹ pass 24 · ℹ fail 0`, then `PASS: local D1/R2 photo save/remove, circular processing, planar UV, private route, fallback, panel/popout and clay. Compressed upload bytes: 90884` |
| `npm.cmd run test:disc3d` | 0 | `ℹ tests 23 · ℹ pass 23 · ℹ fail 0`, then the browser and pop-out checks ending `ok - no page errors` |
| `npm.cmd run test:apple-design` | 0 | `16 checks passed.` |
| `npm.cmd run test:apple-design:2` | 0 | `29 checks passed.` |
| `npm.cmd run test:apple-design:3` | 0 | `14 checks passed.` |
| `npm.cmd run test:atlas:persist` | 0 | `PASS: 13 checks.` |
| `npm.cmd run test:add-menu` | 0 | `PASS add menu dismissal: 9 checks, 18 screenshots in outputs/add-menu-dismiss` |
| `npm.cmd run test:bag:popup` | 0 | `PASS bag popup: 7 checks, 18 screenshots in outputs/bag-popup` |
| `npm.cmd run test:sliders` | 0 | `PASS slider drag: 60 stepped drags; live feedback, track jumps, keyboard and snapping` |
| `npm.cmd run test:bag` | 0 | `ℹ tests 60 · ℹ pass 60 · ℹ fail 0` |
| `npm.cmd run test:atlas:3d:perf` | 1 on 5 of 6 final-tree runs (and 4 of 6 baseline runs) | per Part 2: `not ok - phone: 3D frames are slower than 2D's when warm` / `not ok - desktop: …`; logs in `perf/interleaved/f-*` |

Also run: `node --test tests/photo-albedo.mjs` (5 tests: gradient flattened, mask untouched, stamp and 2 px scratch contrast kept, cast reduced only with white evidence, saturated disc not greyed), part of `test:photo-textures` now.

## Commits

| Commit | Concern |
| --- | --- |
| `f734cc5` Keep committed photo and account changes successful when cleanup fails | Part 1 fix + tests |
| `7444f6b` Cover WebP flags, trailing bytes and lossy frame mismatches | Part 1 coverage |
| `fd1e281` Say the disc saved when only its photo upload fails | Part 1 fix + tests |
| `d1e03c8` Cover closing the disc editor during photo compression | Part 1 coverage |
| `041ac69` Stop observing finished disc thumbnails | Part 1 fix + test |
| `2131d35` Keep a photo disc's finished atlas image across level changes | Part 1 fix + test |
| `6c1ae36` Remove the photo's own lighting before upload | Part 3.1 |
| `391b632` Light the photo plate exactly like the plastic it covers | Part 3.2 |
| `8b73b72` Pop the disc aligner out, with centring guides | Part 4 |
| `9cb66a7` Start a photographed disc in its photo's plate colour | Part 3.3 |
| `58eb2cd` Read a pulled bag disc's photo upright | Part 5 |
| `d1546f6` Keep the aligner's RIM and FLIGHT PLATE labels apart | Part 4 polish |
| `5d316a7` Make Add photo a real, findable button | Part 6 |
| *(this document)* | Write-up, and `docs/photo-textures.md` brought in line with the new behaviour |

Review artefacts (ignored `outputs/plan-22-review/`): screenshots, `logs/` (verbatim test output and exit
codes), `perf/interleaved/` (every gate run's log and JSON), `perf/ab/` (the direct A/B), and the harness
scripts (`perf-interleave.sh`, `perf-ab.mjs`, `perf-table.mjs`, `shots.mjs`, `room.mjs`). The screenshot
harness serves a tree's public files with an in-memory, signed-in mock of the bag API, so the same disc can
be shot on any commit; nothing leaves the machine.

## Left alone, deliberately

- `wrangler.public.jsonc`'s formatting-only working-tree change (yours; never staged).
- The perf test, its thresholds and comparison rules (argued above, not changed).
- No remote migration, bucket, deploy or push. These changes need no new migration: colour matching stores
  into the existing `color` column.
- Already-uploaded photos are not re-processed; replacing one runs the new pipeline.

## Freddy's feel check

Put a photo of one of your real discs on its bag entry on the live site — it should appear on the 3D model
wearing its own stamp, and nobody else's account should ever see it.
