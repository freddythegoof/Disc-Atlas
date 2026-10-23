# Photo stamps v3.1: one click from the disc's own photo, with no camera light in the asset

October 21–22, 2026. Branch `claude/photo-stamp-one-click`, own worktree, from freshly fetched `origin/main` **`6d99800`**
(photo stamps v3, PR #41). Local commits only: no push, no PR, no merge, no deploy. **No migration**: this phase adds no
table, column or route; v3's sync, budgets and surfaces are unchanged.

**Photos are never committed.** Freddy's originals, the flash test photos made from them, every render and the evidence
sheets live in the ignored `work/photo-stamp-one-click/` folder of this checkout. The branch carries code, tests on drawn
synthetic discs, and this write-up. Links into `work/` open in this checkout and nowhere else.

## Freddy's two rulings

1. **Convenience wins.** "When I click Game asset I shouldn't have to put the picture in again if it's the same
   picture." One click makes the asset from the photo the disc already has. The camera original stays as a quiet,
   optional path.
2. **The asset carries no camera light.** People's photos will have glare; the glare is part of the photo, not the disc.
   The 3D model lights the asset, so the asset is flat print (albedo): nothing baked in. A flash hotspot across the stamp
   must neither eat the design (one-ink mask) nor bleach it (full colour).

## What changed for the player

- **Game asset** or **Full color** on a photo disc with no asset makes it **at once, from the stored photo**: no file
  picker, no aligner. The sheet's status names each step: *opening your photo… / finding the stamp… / drawing it in one
  ink… / drawing it in full color… / saving to your account…*, then *"Game asset made. Saved to your account."* (or
  *Full-color…*). One read makes both layers, so switching between the two looks afterwards is instant, as before.
- **Make again** (shown once an asset exists) does the same: one click, a new revision, from the stored photo.
- The camera original is a quiet underlined link below the note, **"Use a higher-resolution original instead"**. It
  opens the same aligner as before ("Frame the original", "Make game asset"). It is never required, and nothing points to
  it as a step.
- While an asset is being made, the Look row shows the look asked for and waits (`aria-busy`; its controls are marked
  `aria-disabled` and a choice made meanwhile is put back). The make **outlives the sheet**: closing the sheet does not
  cancel it, and the asset still saves to the account. (The row is marked rather than disabled on purpose. A disabled
  control that holds focus swallows keys in Chromium, so Escape could not close the sheet. The new suite caught this.)
- The notes now say the stamp is drawn "from its photo … with the photo's glare left out".
- The phone gets the same sheet: one tap.
- Unchanged: a disc without a photo shows no Look row (nothing to make an asset from). The Photo look, and every asset
  already made (local or account-synced), is untouched. Nothing is invalidated or made again on its own.

Code: `public/disc-photo.mjs` (`makeFromPhoto`, `photoStampAsset(…, {stored})`, the Look row), `public/my-bag.css` (the
quiet link, the waiting row).

### How the stored photo is read

The stored photo is the 1024 px texture the site keeps for the disc. It is already cropped to the disc, levelled and de-lit once, at upload,
*with* glare softening, then WebP. One click fetches it (bounded at 60 s like v3's requests), reads it with the level
framing (scale 1, centred; the same framing "Level stamp" uses) into the extractor's 2048 px crop, and runs the same
worker as the original path with `stored: true`. On that path the worker **does not run `delightPixels` a second time**.
A second pass would re-balance the stored texture's white against its own brightest neutral pixels, which on a flash
photo is the upload's softened glare core. On the DD3 test that tinted the whole disc pink. It only measures the plastic
(`plateColor`), and goes straight to the new light stage below.

## No camera light: the extraction contract

New module **`public/disc-stamp-delight.mjs`** (`delightStamp`), upstream of both looks, in the worker
(`public/disc-stamp-worker.mjs`). It builds on what was there rather than beside it:

| Light | Taken out by |
| --- | --- |
| Shading gradients, vignette, exposure, colour cast | `delightPixels`' quadratic, white balance and exposure (`public/disc-albedo.mjs`, unchanged), and v2's plastic light probe for the colour layer (`lightField`, unchanged) |
| **Added light**: a flash or bulb hotspot, a mirrored window, sheen | **new**: `delightStamp`'s white field |
| **Clipped light**: a hotspot's core, where the sensor stopped counting | **new**: marked unreliable, then decided from around it (both layers) |

The model is the dichromatic one, in linear light: **pixel = g × print + white**. The print is one of a few materials:
the plastic and the stamp's inks, found by k-means. The white is the light's colour (neutral after white balance), a
smooth field. v2's prior is generalised from the plastic to every material: *light falls on everything in a place at
once, while a print's own gradient belongs to one ink.* So:

1. **Each pixel is read as the material that explains it best with the least white** (a 2-unknown least-squares fit
   per material). A glare-lifted blue reads as blue plus white, not as silver ink. A learned "material" that is just
   another material plus white (a halo the field has not yet taken out) is dropped, so the light cannot explain itself
   away.
2. **White per 16 px cell = the smallest of each material's median white in it.** A print fading toward cream is one
   material and cannot pass as light (asserted in the unit test). A hotspot lifts plastic and every ink alike. A cell
   with one ink and no plastic says nothing about light and is filled from its neighbours. A 3 × 3 median takes out
   single-cell sparkle.
3. **Inside lit cells, the white's shape is followed per pixel** (each pixel's own fit, blurred among confident fits),
   capped at 1.25 × the cells' estimate. Neutral inks (silver foil, white, black) cannot tell their brightness from white,
   so they do not vote. This is the fix for DESTROYER's foil, whose sparkle the first cut read as light.
4. **Unreliable pixels.** A clipped pixel (neutral at 250+, or a channel at the top under light) is unreliable where
   the light found explains at least 30% of it, or where its clipped patch sits in a **rising halo**: the light just
   outside the patch is at least twice the light a few radii further out, in at least 24 of 32 directions. (A hard
   core's own light can't be measured, so it is interpolated low; a hotspot's halo rises toward it all round, while
   clipped ink or foil under an even sheen does not rise, and a holographic facet among brighter facets rises only in
   places.)
   Foil and white ink can clip on their own; the experiment's white-ink guard still holds (asserted). On the stored path
   there is no clipping left to see: the upload's softening replaced each clipped core with a smooth fill at its ceiling.
   So that core is found as **the flat plateau at a hotspot's peak**: flood-filled from each strong white peak through
   textureless pixels at the plateau's luminance that still carry ≥ 40% of the peak's light, within 240 px.
5. **Filling what light hid** (revised after Freddy saw the DD3 smudge, below).
   - **A core inside printed area** (≥ 70% of the ring round it is print, not plastic) is **filled with that print,
     cloned from nearby**, the way a retoucher's stamp works (`cloneCores`). First the whole core in one piece: the
     offset whose ring best matches the core's ring and whose patch has the ring's colour statistics, then aligned to
     the pixel so a halftone's or hatching's phase runs on, its tone matched to the core's ring (capped). If no single
     patch fits, it is filled in tiles from the edge inward, each from the source whose surroundings best match its own.
     From a camera original the filled zone reaches 1.25× the core's radius into the under-measured halo. Cloned pixels
     are print again: both looks draw them as print.
   - **Any other unreliable pixel** in the mask (`unknown`, `disc-stamp-extract.mjs`) is design only when **enclosed by
     design**: along at least 5 of 8 lines through it, the nearest read pixels on *both* sides are design. A core on bare
     plastic, or across a mark's edge, stays plastic (**no glare-shaped blob**); a stroke that crossed it shows a gap,
     like wear. Its ink (line or fill) and, in the colour layer, its colour come from **the ring of print around it**
     (`fillFromRing`): the dominant ink, or the nearer of two that share the ring, in that ink's own mean colour. Never
     the mean of everything around, which blends a face's lines and fills into a colour neither has.
   - **Stranded stubs go.** A small mark (under 1,200 px at 2048) touching a core is the end of a stroke the core cut,
     and on the model reads as a dot. From a stored photo the same holds beside strong light (white past half the
     softening's ceiling), where the upload laid plastic over the print. (Not on the original: there the print near
     strong light is still in the photo, and a small letter beside a hotspot is a letter.)
6. **Reflection residue.** v1's reflection rule dropped soft marks lighter than the plastic. Once the light is out, a
   window reflection's leftovers no longer look lighter. So a small stray mark (under 2000 px at 1024) lying ≥ 90% in
   lit pixels, away from the rest of the design, is dropped too. (Without this, the DD3 with no flash grew a speck at its
   window-lit shoulder.)

A photo with no added light is left **byte for byte** as it was: the white field is zero below 0.012 linear, and pixels
it does not touch keep their bytes. On drawn discs, v2's test *"the one-ink asset is exactly what v1 makes"* still
passes unchanged.

## Evidence: glare

Two kinds, as the ruling asked. (1) **A deliberately glare-y test photo**: Freddy's two real photos with a **hard flash
hotspot** added across each stamp (`work/photo-stamp-one-click/lab/flashphotos.mjs`). It is added in linear light: a
Gaussian lobe of 3× full scale (σ = 3% of the disc's radius, so a clipped core about 4.4% of the diameter, roughly 9 mm on
a 21 cm disc) plus a faint veil, in the light's colour, clipped like a sensor. **This is synthetic glare on a real
photo, not a flash photograph**; I have no camera, and it is labelled as such everywhere. Its advantage is ground truth:
the same photo without the flash. (2) **A real disc whose photo has known glare**: the DD3, photographed with a window
reflected across its right shoulder and its foil crystals, as taken. The Destroyer's photo also carries a real window
glare along its top rim.

### Rendered on the 3D model, side by side (Freddy's eye is the gate)

Sheets: rows are the viewer's Top view, its centre at 2×, and the disc pulled from the bag. Columns are the Photo look,
then the asset made **in one click from the stored photo by this branch**, the same stored photo through **main's
(un-flattened) extraction**, then the camera original by this branch and by main. Main's columns are origin/main's own
three extractor modules served in place of this branch's (`tests/photo-stamp-one-click-evidence.mjs`), so they are
main's code on the same photos, not a reconstruction.

| Sheet | What it shows |
| --- | --- |
| [Destroyer, flash, full color](../work/photo-stamp-one-click/evidence/sheet-destroyer-flash-color.jpg) · [game asset](../work/photo-stamp-one-click/evidence/sheet-destroyer-flash-asset.jpg) | **Main bakes the flash in**: a pink spot from the stored photo, a white one from the original, visible even in the bag at pulled size. **This branch: no spot, and no dot.** "DISTANCE" shows a gap where the clipped core sat. From the stored photo more is lost near the core (parts of "OYER" and "DRIVER"), because the upload's softening had already laid plastic over them. |
| [DD3, flash, full color](../work/photo-stamp-one-click/evidence/sheet-dd3-flash-color.jpg) · [game asset](../work/photo-stamp-one-click/evidence/sheet-dd3-flash-asset.jpg) | **Main bakes a white highlight into the face** from the original, plainly visible in the bag, and a pale pink spot from the stored photo. **This branch: the core reads as the face's own print** (periwinkle fills, red line work) from both the stored photo and the original; from the stored photo it is a little redder than the face around it (the stored photo itself carries a pink haze there). |
| [DD3, as taken, full color](../work/photo-stamp-one-click/evidence/sheet-dd3-clean-color.jpg) · [game asset](../work/photo-stamp-one-click/evidence/sheet-dd3-clean-asset.jpg) | The real disc with known glare (the window across its shoulder and crystals). All four columns read as the same print at bag size; the branch's crystals are a little calmer where the window lit them. |
| [Destroyer, as taken, full color](../work/photo-stamp-one-click/evidence/sheet-destroyer-clean-color.jpg) · [game asset](../work/photo-stamp-one-click/evidence/sheet-destroyer-clean-asset.jpg) | Indistinguishable across the four at bag size and at 2×. |

### Numbers

Measured in Node through the product's own pixel code (`work/photo-stamp-one-click/lab/`). sharp's WebP stands in for
the browser's encoder on the stored path. "Zone" is a circle of 18% of the radius round the flash.

**The light left in the recovered print**, against the same photo without the flash (ΔE, glare zone, unreliable pixels
excluded; the flash's whole-photo white-balance shift matched out first):

| | Destroyer | DD3 |
| --- | --- | --- |
| Camera original: `delightPixels` only (main) → + `delightStamp` | 5.4 → **2.6** | 13.7 → **8.0** |
| Stored photo: main's re-delight → this branch | 5.5 → **2.8** | 12.7 → **9.9** |

**The assets in the zone**, flash vs no flash. *Blob* is design that appears; *eaten* is design that disappears; both
are shares of the clean design in the zone. Colour ΔE includes the flash's whole-photo white-balance shift.

| | Blob | Eaten | Colour ΔE |
| --- | --- | --- | --- |
| Destroyer, camera original: main → branch | 0.518 → **0.100** | 0.070 → 0.254 | 19.5 → **11.2** |
| Destroyer, stored photo: main → branch | 0.547 → **0.052** | 0.087 → 0.429 | 22.7 → **13.4** |
| DD3, camera original: main → branch | 0.183 → **0.100** | 0.000 → 0.020 | 21.8 → **19.2** |
| DD3, stored photo: main → branch | 0.083 → **0.057** | 0.000 → 0.012 | 22.2 → 22.8 |
| Drawn disc (unit test), camera original: main → branch | 0.464 → **0.000** | 0.015 → 0.075 | |
| Drawn disc, stored photo: main → branch | 0.009 → 0.026 | 0.065 → **0.033** | |

The trade, stated plainly: **the blobs and the bleach go; what the clipped core hid is lost as a gap.** On the
Destroyer the flash sits on "DISTANCE DRIVER" and the flight numbers. From the original, the gap is the clipped core
alone. From the stored photo it is wider, because the upload's softening had already overwritten the letters under the
core with the plastic around them: they are not in the stored copy at all. Main keeps those pixels "eaten-free" only by
filling them with a glare disc. One residue remains on the stored Destroyer: a few crumbs where the core meets "OY".

**No flash: what moves on Freddy's real photos**, branch vs main (mask IoU / colour ΔE where both are opaque). The
white field found real glare on both: peak 0.17 on the Destroyer (the window along its top rim), 0.27 on the DD3 (the
window on its shoulder and crystals). The crystals' window-lit sparkle is calmer on the branch, which is that window's
light coming out.

| | Camera original | Stored photo |
| --- | --- | --- |
| Destroyer | 0.969 / 1.8 | 0.950 / 2.2 |
| DD3 | 0.978 / 4.3 | 0.983 / 5.7 |

**Cost.** The light stage adds about 2–3 s per make in Node (Destroyer 4.9 → 7.2 s, DD3 6.2 → 9.3 s). In the browser
suites a one-click Game asset takes 6.4 s in desktop Chromium and 7.1 s in WebKit at phone size on this Mac. A real
phone will be slower; v3's 180 s extraction limit has ample room.

## Follow-up: the DD3 smudge and the Destroyer dot (October 22)

Freddy saw the first sheets and ruled the DD3's stored-photo core, a dark magenta smudge, not good enough: it should read
as plain print. He also spotted a dot on the Destroyer. Causes and fixes:

- **The smudge** was the colour layer filling the core with the mean colour of everything around it, and on the DD3's
  face that is red line work averaged with periwinkle fill. Filling with the dominant ink alone was tried first: a flat
  mauve patch, which reads as a hole. Now a core inside print is **cloned from nearby print** (rule 5 above), so it
  carries the face's own lines and halftone. The first clone pasted the Discmania logo into the face, because it matched
  surroundings only; the patch must now also match the print's colour statistics, and is aligned to the pixel.
- **The dot** on the Destroyer was a real piece of print: a 583 px stub of the underline beneath DESTROYER, stranded
  when the core cut the stroke (from the stored photo), plus a 233 px fleck at the core's edge (from the original).
  Small marks touching a core, or strong light on the stored path, now go.
- **Found on the way:** the colour layer re-ran its own clipping test on the raw photo and re-filled cores the light
  stage had already cloned (radial petals). It now skips exactly the pixels the light stage filled (`filled`).
- **Caught on the way back:** the first rising-halo test fired on one of the DD3's holographic crystal facets in the
  photo with no flash (clipped foil among bright foil), and the tile fill turned it to blocks. The rise must now hold
  all round (24 of 32 directions); on the DD3 as taken nothing is filled.
- **A limit, measured on a drawn disc:** a near-neutral dark ink (navy) beside a fast-clipping colour (yellow) under a
  hard flash measures its halo light low, so the plastic can show through a ring round the core. Neither of Freddy's
  discs is like that; DD3-like inks (periwinkle hatched with dark red, on red) come back clean and are the unit test.

## Stored copy vs camera original: the quality delta, on record

The ruling stands regardless. This is documentation, not a re-vote. Both from this branch, no flash:

| | Destroyer | DD3 |
| --- | --- | --- |
| Pixels across the disc at the stamp read | stored 1024 (upsampled to 2048) vs original 2048, from ~2,960 native | same |
| Mask agreement (IoU) | **0.860** | **0.734** |
| Colour ΔE where both are opaque | **3.2** | **8.8** |
| Design coverage, original → stored | 0.070 → 0.069 | 0.241 → 0.277 |

- **Destroyer: the stored copy is close.** Its bold single-ink lettering survives the halving. The difference is edge
  softness, visible in the bag only when zoomed.
- **DD3: the stored copy is coarser.** The illustrated face's fine line work and halftone are below the stored
  texture's resolution, so lines fuse (coverage up 15%) and the halftone flattens. At bag size it reads as the same
  print; zoomed on the model the original's line work is visibly finer. This is the case the quiet "higher-resolution
  original" link exists for.

The [DD3](../work/photo-stamp-one-click/evidence/sheet-dd3-clean-color.jpg) and [Destroyer](../work/photo-stamp-one-click/evidence/sheet-destroyer-clean-color.jpg) sheets above, "as taken",
compare them rendered: **at bag size and at the viewer's 2× Top, stored and original are hard to tell apart on both
discs.** The difference lives in the asset itself at full zoom. The stored assets are
`../work/photo-stamp-one-click/evidence/<disc>-clean-stored-color.webp`, the originals `…-clean-original-color.webp`.

## Verification

| Suite | Result |
| --- | --- |
| `tests/photo-stamp-one-click-browser.mjs` (new). Desktop Chromium, and `PHOTO_STAMP_ENGINE=webkit` at phone size with taps. Covers: no photo, no Look row; Game asset in one click (no file picker, no aligner, each step named, look applied, both layers on the account, the viewer wears it); Make again (new revision, no file); Full color on a disc with no asset, the sheet closed mid-make and the asset still saved; a choice made while it waits is put back; the quiet original still frames and makes; the photos' bytes unchanged | **Pass, both engines** |
| `tests/disc-stamp-delight.mjs` (new, drawn discs). Covers: no glare = bytes untouched; a cream-fading print is not light; clipped white ink is not glare; a flash leaves no blob (< 0.03) and no bleach (halo ΔE < 8) with the print kept but for the core; the same from a stored texture (upload softening included); a flash inside hatched print comes back hatched (its spread, share of print and colours) | Pass, 6 |
| Unit: `disc-stamp-color`, `disc-stamp-extract`, `photo-albedo`, `photo-stamp-sync` and the rest of `tests/*.mjs` | 302 pass. 3 fail for the environment, not this change: `palette` and `redesign` want a dev server on :5173, and `prompt-4-stability-fixture` wants an `outputs/` file this worktree does not have |
| v1 `photo-stamp-assets-browser` (its original step now through the quiet link) | **Pass**, Chromium and WebKit |
| v2 `photo-stamp-color-assets-browser` (the original through the link; a v1 entry's Full color now one click, no file) | **Pass**, Chromium and WebKit |
| v3 `photo-stamp-sync-browser` (Full color in one tap on desktop and on the WebKit phone; Make again) | **Pass** (desktop Full color in one click, 6.7 s) |
| v3 `photo-stamp-stall-browser` (every stall forced through the one-tap path, the sheet naming the step or the failure and the Look row usable again; the original keeps "finishes" and "silent extraction, aligner retries"), WebKit and Chromium | **Pass**, both engines |
| `photo-stamp-identity-browser` (Photo look and one-ink asset vs origin/main, every surface; baseline a detached `6d99800` worktree in `work/photo-stamp-one-click/baseline`) | **Pass**: branch vs baseline differences: none (the one-ink asset byte-for-byte main's, on the drawn photo) |

| `photo-stamp-level-browser` | **Pass**. It rewrites `docs/photo-stamp-orientation/` shots with run-to-run noise; restored, not committed |

Every browser suite ran one at a time on a quiet machine. Under load, v1's 20 s wait for the bag's pulled disc timed out once in Chromium while the evidence run was going; alone it passes.

## Files

- `public/disc-stamp-delight.mjs`: new, the light stage.
- `public/disc-stamp-worker.mjs`: the stage wired in; `stored` skips the second de-light.
- `public/disc-stamp-extract.mjs`: `unknown` (enclosure decision, ink from the ring, stranded stubs), `lit` (reflection residue), `strong`, and `fillFromRing`.
- `public/disc-stamp-color.mjs`: `glare` (the upstream unreliable mask) and `filled` (cloned print); glare in-painted by the ring's ink.
- `public/disc-albedo.mjs`: exports `GLARE_CEILING` (the softening's ceiling, KNEE + ROOM), otherwise unchanged.
- `public/disc-photo.mjs`, `public/my-bag.css`: the one-click flow.
- Tests above; `tests/photo-stamp-one-click-evidence.mjs` writes the evidence (needs the ignored photos).

## Landing (on Freddy's word)

Freddy's acceptance: on the phone, pick a photo disc, tap Game asset once, watch it change. Then the standard flow:
push, PR, merge, deploy, edge verification. **No migration order to call out: there is no migration.**
