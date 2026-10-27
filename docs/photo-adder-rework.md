# Photo adder rework: one dot, one flow

Branch `claude/photo-adder-rework`, its own worktree off `main` 7039c62 (PR #48). Built Oct 27, 2026 from Freddy's two
asks (his words, Oct 27): no more "tilt and do this and do that and frame it", one dot in the middle and the photo
adjusts itself, because "a lot of these stamps are just not on the middle of the disc and you can tell"; and "I want to
just put the photo and then get the game asset already". Then: keep the crosshair ("I want to have the cross so I can
center it perfect"), and level it too ("or even have the thing auto fucking level it"). Auto-fit and auto-level do the
work, the cross is what he checks against and nudges with, and his eye is the final judge. **This stops at an open PR:
no merge, no deploy.**

**The discs** are Freddy's own photos already on this Mac: the DD3 and the Destroyer (ProRAW originals from his camera
roll, as `photo-stamp-assets` used them), the Pixel (`IMG_0811.HEIC` in Downloads), and the stored textures his own
framing made (the Pixel's, read for `pixel-stamp-placement`; the Raptor's two, `0cef6b2f` and `71c60188`, read for PR
#46 and #47). The Raptor's original is not on this Mac. Copies, the lab (`lab/`) and every render (`out/`) sit in the
ignored `work/photo-adder-rework/` of this checkout. **Photos, and renders made from them, are never committed.**

**Look at first:** `work/photo-adder-rework/out/before-after.jpg` (today's best framing beside the new fit, the cross
over each), `out/browser-fitted-chromium.png` (the new aligner) and `out/browser-sheet-chromium.png` (the sheet after
Use photo: the game asset already made and shown).

## 0. What ships, in one paragraph

Choosing a photo opens the aligner already fitted: the disc's rim found and put on the ring, the disc's middle on the
cross, its stamp levelled. The aligner is the cross (edge to edge), the centre dot, the rim and plate rings, and the turn
buttons; drag or tap moves the disc's middle (the rim never leaves the ring), the buttons and a two-finger twist turn it,
**Auto** puts the automatic level back. Use photo prepares the photo and, in the same sitting, makes the game asset from
that original, showing each step and then the result in the sheet, with Look on Game asset · Full color. Save keeps the
photo and its asset together on the account. A photo the fit cannot do honestly (too far off square, or no clear rim)
goes to today's aligner, for that photo only, with the reason in plain words.

## 1. Step 0a: the flow as it was

1. **Edit disc** (`#addDiscDialog`, `public/my-bag.js`) → Photo row → **Add photo** → file → the aligner
   (`public/disc-photo.mjs`, `createPhotoEditor`, mode `frame`).
2. **The aligner asks for everything by hand**: drag (and pinch, and the wheel) until the disc's edge sits on the outer
   ring and its centre on the crosshair; under *Adjust photo*, five sliders (Framing, Tilt correction, Tilt direction,
   Perspective, Rotate); the level row (±1°, ±0.1°, 0°, Level lines).
3. **Use photo** prepares the upload (de-lit, plate colour and true colour read) and returns to the sheet with a
   thumbnail. **No Look row**: it shows only for the saved photo (`owned && current && !used`), because a game asset
   belongs to a photo *version*, the `texture_key` the server assigns when the photo is PUT, which happens on **Save**.
4. **Save** → disc PUT/POST → photo PUT → `texture_key` → the sheet closes.
5. **Edit disc** again → `reset(item)` → `owned` is set → Look row → **Game asset** → `makeFromPhoto`: fetch the stored
   1024 texture, extract, `savePhotoStamp(id, key)`.

**The exit-and-return is an accident of the sheet's structure, not a dependency.** The asset needs the photo's key to be
*saved*, not to be *made*: making it needs only pixels, and the sheet already holds the camera original (finer than the
stored texture the one click reads). Nothing forces the asset to wait for the key except the Look row's visibility
rule. So Part B makes the asset as soon as the photo is used and saves it the moment Save gets the key.

## 2. Step 0b: why stamps sit off the middle

For each disc: the rim fitted (`public/disc-register.mjs findDisc`, checked by eye at four compass points on every disc,
`out/*-edges.jpg`), the crop registered on it, the stamp extracted by the product's own extractor, and the centre of its
ink's bounds measured from the crop's centre, in % of the disc's radius R.

**Three causes, not two.** The brief separated (i) registration error (Freddy's framing was off) from (ii) the stamp
physically off-centre. The measurements found a third, and it dominates: **(iii) perspective**. A phone held close
makes the near half of the disc look bigger, so *the outline's centre is not the disc's centre*. Centring the outline
perfectly, by hand or by the old aligner, still leaves the stamp off by about the disc's radius over its distance times
the sine of the tilt: 5% for a 6° tilt at arm's length, more for a closer, more tilted shot. The old Perspective slider
was a hand control for exactly this, and nobody can set it by eye.

| Disc | (i) Freddy's framing of the outline | (iii) perspective: disc centre vs outline centre | (ii) physical / design offset | Dominant |
|---|---|---|---|---|
| Pixel (Electron, overmold) | 0.6% R (his stored crop's fitted rim vs its centre) | **11.7% R**, measured: the gate mark (the moulding's injection point, the disc's true centre, visible through the plastic) sits 11.7% R below the outline's centre | 11.7% R left, 0.5% R vertical: the design is lopsided by design (its cube graphic), centred on the gate vertically | (iii) vertically; design horizontally |
| Raptor (clear Z) | 1.0% R on both stored crops (plate-edge walk, PR #46's) | the printed ring vs the plate edge differs by 1.9% R and 1.4% R **in opposite directions** on the two photos | ≤ 0.3% R (the two photos' mean) | (iii)/(i); print is centred |
| Destroyer (Star) | — (no stored crop of his on this Mac) | 3.3% R predicted (the camera fit's chosen centre); no visible gate | not separable from (iii) | (iii) likely |
| DD3 (S-Line) | — | 4.0–5.8% R predicted (the two camera centres); no visible gate | not separable from (iii) | unknown |

"Before", the stamp's offset with the outline centred perfectly (the best today's aligner can do; Freddy's own crops sit
within 1% R of it): **DD3 4.6% R, Destroyer 4.6% R, Pixel 13.6% R.**

**What that decided.** Registration error by hand is small; Freddy frames outlines well. Physical print offset was not
shown on any disc (the Raptor's print is centred to 0.3% R). Perspective is what makes his stamps look off. So the fix
is the registration itself, and **no stamp re-centring ships** (§6.1): re-centring the ink's bounds would also shove a
lopsided design like the Pixel's 12% sideways.

## 3. Part A: one-dot registration

`public/disc-register.mjs` (pure, no DOM; the aligner runs it in the stamp worker):

1. **The rim.** 256 rays from a point inside the disc collect colour-edge candidates. Two independent fits: a circle vote
   (every candidate votes for its distance from each possible centre) refined to an ellipse by an aspect vote, and a
   seeded RANSAC; the one more rays agree with wins. Then an **outward climb**: a concentric edge further out (3% to
   150% beyond) whose scale most rays vote for is the disc's own edge, so a printed ring (the Raptor's), a plate edge or
   an overmold seam (the Pixel's) is never mistaken for the rim; a climbed edge must be found on 60% of the rays, else
   (a hand, the room) the scaled copy stands. Support (rays agreeing) under 35% is no rim.
2. **The dot is the disc's centre, and with the rim it fixes the whole fit.** The centre's polar line in the rim's
   ellipse is the disc's vanishing line; together they give the homography that puts the rim on the crop's edge and the
   centre in the middle (`registration`, applied through a new `H` option of `photoPoint`). **Moving the dot changes the
   perspective, never the rim**: whatever Freddy does, the disc still fills the ring.
3. **Where the dot starts** (`autoRegister`): the outline's centre, or one of the two centres a phone camera allows for
   that outline (`poseCentres`, a 25 mm full-frame-equivalent lens, the phone main camera), whichever puts the stamp's
   ink (read by the product's extractor at 384 px) nearest the middle. A camera centre must beat the outline's by 1.5% R:
   on a disc shot square on they all agree. On the Pixel the chosen centre lands **3.1% R from its gate mark** (the
   outline's centre: 11.7% R). In the synthetic suite, with the true lens, 0.1% R.
4. **Level** (`levelAngle`): the deskew a scanner does, on the stamp's level edges only (baselines, frames, underlines;
   upright strokes are left out because italic type leans them on purpose), within ±8° (a disc photographed by hand is
   held near upright; wider, a star or a slanted word is what it finds). It is applied when its peak stands 15% above
   its value 3° either side, else the photo stays as held and the status says there was nothing straight to level by.
5. **The caps** (reported numbers, not silent choices): the outline's squash (minor over major axis) ≥ **0.80**, a disc
   shot no more than about 37° off square, the same reach as the old Tilt correction slider; the dot within **20% R** of
   the outline's centre; the crop's stretch (largest over smallest scale anywhere on the disc) ≤ **2.0** (an 18° close
   shot is 1.67; the Pixel's chosen fit 1.85). Past squash or no rim → today's aligner with the reason. A drag past the
   dot or stretch cap stops where allowed: "That's as far as this photo's angle allows: past it, the stamp would be
   stretched. If the middle still looks off, frame it by hand."

**The aligner, fitted** (`dialog[data-fit="fitted"]`): the cross edge to edge, the centre dot, the rim ring and the
dashed plate ring; no grid, no labels, no sliders, no Level lines. One finger drags the disc's middle (the photo follows
the finger under the cross), a tap says "this is the middle", two fingers twist it, the arrow keys nudge, `[` and `]`
turn; the turn row is ±1°, ±0.1°, the readout and **Auto**. One quiet link, **Frame it by hand instead**, is today's
aligner for this photo: the one control that is neither the cross nor the flow, kept because a fit that is confidently
wrong needs a way out (§6.4). While the fit runs (under a second on the Mac) the status says "Finding the disc's edge…"
and Use photo waits.

## 4. Part B: one sitting

After **Use photo**, the sheet makes the game asset from the same original and framing (`photoStampAsset`, the v3.1
engine; read at full detail from the original, as "Use a higher-resolution original instead" did), naming each step in
the photo status ("Making the game asset: finding the stamp…", "…drawing it in full color…"), then shows the result: a
preview of the disc in its colour wearing the asset, a faint cross over it, and the Look row on Game asset · Full color
(One ink and Photo choosable before Save). **Save** uploads the photo, gets its key, and keeps the asset under it
(`photoEditor.keepAsset` → `savePhotoStamp`). What it keeps is a snapshot taken with the photo's bytes before the
first save request (`pendingAsset`, PR #49 Codex round 1): the photo, its asset, the Look and the finish as Save found
them, so a photo replaced or adjusted while the save is in flight never lends its stamp to the one uploaded
(`tests/photo-editor-races.mjs`). Choosing Photo keeps the photo alone, exactly as before; Game asset
later makes one with the one click. If the finish changed to or
from Clear before Save, the asset is made again first (a clear disc's asset is the clean stamp, PR #45). If the asset
cannot be made or saved, the disc and its photo stay saved and the bag's status says why and how to make it again.
**No step needs another screen**: the asset needs the photo's key only to be saved, and Save has it.

## 5. Results

### 5.1 Freddy's discs (the product's extractor, ink bounds from the crop's centre, % of R)

| Disc | Before (outline centred, unturned) | After, automatic | Turned | Residual tilt by eye | Fit time (Node) |
|---|---|---|---|---|---|
| DD3 | 4.6% (−2.5, +3.9) | 4.6% (outline kept: neither camera centre beat it by 1.5% R) | 0° (no straight edge sure enough) | ~0.5–1° (Q-LINE box, DD3 letters) | 1.2 s |
| Destroyer | 4.6% (+1.1, −4.5) | **2.8%** (+2.4, −1.5) | +3.6° | **≤ 0.3°** (underline bar, DISTANCE DRIVER, flight boxes) | 0.9 s |
| Pixel | 13.6% (−11.0, +8.0) | 12.2% (−11.9, −2.7): **vertically centred**; the 11.9% sideways is its design | 0° (already level to its deskew) | **~0.5°** (PIXEL baseline, on the outline-centred crop) | 0.8 s |
| Pixel, dot on its gate | — | 11.7% (−11.7, −0.5) | — | — | — |

**With Freddy's nudge** (what the dot can reach against the cross: the lab moves it, within the caps, until the stamp's
ink box sits on the cross, `lab/nudge.mjs`; his eye, not the ink box, is the real target):

| Disc | Dot moved from the outline's centre | Stretch | Stamp offset | Residual tilt (ink deskew) |
|---|---|---|---|---|
| DD3 | 8.3% R (−4.6, +6.9) | 1.39 | **0.15%** | −0.9° (no straight edge sure enough; by eye ~0.5°) |
| Destroyer | 8.2% R (+4.2, −7.0) | 1.39 | **0.14%** | 0.5° |
| Pixel | 16.9% R, at the stretch cap | 1.98 | 2.9%: centring a lopsided design's box is the wrong target; on its gate mark the stamp is centred vertically to 0.5% | 0° |

So the target (centred to ~1% R, level to ~1°) is reachable through the dot on all three, automatically on the
Destroyer's level and the Pixel's vertical, by a nudge for DD3's centre. The DD3 and Destroyer nudges imply perspective
of about 8% R, more than the default lens predicts (4–6%); whether that is the photos' real angle or the stamps' own
placement, only a photo with a visible centre mark could say.

### 5.2 The flow, in the real app (`tests/photo-adder-rework-browser.mjs`, synthetic photos through a known camera)

The tilted photo is a disc shot 16° off square at about two and a half radii, its print turned 3°; the truth is the
camera's own (where the disc's centre and its print's level line land in the photo).

| | Chromium, desktop | WebKit, phone size, touch |
|---|---|---|
| Fit, from choosing the photo to fitted | 0.92 s | 0.91 s |
| The dot from the disc's true centre | 0.13% R | 0.13% R |
| Level applied / true / residual | −3.3° / −3.39° / 0.09° | −3.2° / −3.40° / 0.20° |
| Use photo → game asset made and shown, in the sheet | 4.2 s | 5.1 s |
| Drag and tap move the middle; the rim stays on the ring (worst rim point off the fitted ellipse) | < 0.2% | < 0.2% |
| Drag past the cap | stops at 20% R, says so | stops, says so |
| A disc shot 48° off square | hand aligner: "…looks 70% as wide one way as the other…" | same |
| A photo with no disc | hand aligner: "The disc's edge didn't show clearly enough…" | same |
| Save | photo and asset on the account, the asset under the photo's new key, Look Full color; no file asked for twice | same |

## 6. Fences, and what is Freddy's to decide

1. **No stamp re-centring.** Step 0 did not show physical print offset (the Raptor's print is centred to 0.3% R); it
   showed perspective. Shifting the asset onto its ink's centre would push the Pixel's design 12% sideways. If, after
   flying it, Freddy still sees stamps off the middle, re-centring is a few lines in `photoStampAsset` (the asset's
   square around its ink's centre instead of the crop's); his call.
2. **The Photo look's stored photo is registered the same way** (the same `options`), so a new photo's stored texture
   is now perspective-correct too. That is "where registration itself improves them"; the Photo look's rendering,
   `disc3d/photo.mjs`, and the opaque path are untouched. Flagged, not hidden: he may want to compare a re-added photo.
3. **Unchanged:** account sync (v3: assets and looks on the account, the phone shows what the computer made), true
   colour and clear (PR #46/#47: the sampler, its refusals, the crossed-band cut, the sheet's wording), the one-click
   make from a stored photo, **Level stamp** on a saved photo (its own mode, as before), and *Use a higher-resolution
   original instead* (now fitted like a new photo).
4. **The one extra control**, *Frame it by hand instead*. CLEAN says it does not ship unless it is the cross or the flow.
   It is the fallback the brief asks for, made reachable when the fit is wrong without refusing. Cut it if he disagrees.
5. **Constants to move by eye:** the lens prior (`PHONE_FOCAL`, 25 mm equivalent), the caps (squash 0.80, centre 20%
   R, stretch 2.0), the level's ±8° and its 1.15 bar, and the 1.5% R a camera centre must win by.
6. **Not tested on the Raptor's original** (not on this Mac); the synthetic suite's tilted disc has its features (a
   printed ring, a plate edge, a rim band, strong perspective) and the fit climbs past the ring to the rim.

## 7. Suites

Every suite at its standing baseline (Oct 27, the Mac, Chromium on Metal; WebKit where a suite runs it):

| Suite | Result |
|---|---|
| Unit, `node --test` over every non-browser suite | 332 / 335; the 3 failures are environment-only and fail on `main` too (palette and redesign need a dev server on :5173, prompt-4 needs `outputs/`) |
| `tests/photo-register.mjs` (new) | 7 / 7: rim with a hand over it, the camera's centres, the homography (centre dot ≤ 1% R, ink lines straight), the affine fit equals the old crop, auto centre ≤ 2% R and level ≤ 0.5°, squash refusal, no-disc refusal |
| `tests/photo-editor-races.mjs` | 13 / 13 (two new: the asset is kept under the saved key, its failure never undoes the save; a photo replaced mid-save keeps the uploaded photo's own asset) |
| `tests/photo-adder-rework-browser.mjs` (new) | passes, Chromium desktop and WebKit phone (§5.2) |
| 21 photo, clear, Halo, edge, gallery and bag browser suites | pass |
| `photo-compression-browser`, `photo-editor-contract-browser` | fail **identically on `main` 7039c62** (native WebP bytes; the contract's f31fd41 baseline module) |

**Suites changed, and why.** Fourteen browser suites were written for the old flow: a photo framed at the aligner's
default, saved wearing Photo. Where their subject is something else (compression, the rim colour, Halo bands, identity
against `main`, the one-click make from a saved photo, gestures of the hand aligner), they now take two steps from
`tests/photo-flow.mjs`: *Frame it by hand instead* (today's aligner at its own default framing, so bytes and arithmetic
are main's) and Photo before Save (so the saved photo wears Photo, as before). Both are no-ops on an older tree, so the
identity probe runs the same steps in the baseline checkout. `photo-stamp-assets-browser` asserts the new behaviour
instead where it changed on purpose: a chosen photo's Look row now shows (on Game asset), the original is fitted ("Check
it against the cross"), and a replaced photo gets its own asset under its new key. The clear suites need the Raptor
photo in `work/` (copied in from the PR #47 worktree; never committed); the browser suites rewrite tracked proof images
under `docs/`, restored before committing.

**The real gate is Freddy's**: add a photo of each of his discs, check it against the cross, nudge if his eye says so,
Use photo, and see the asset in the sheet. If aligning still feels like work, this missed the point.
