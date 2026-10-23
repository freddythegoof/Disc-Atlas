# Clear plastics: a clear finish, and a clean stamp mode

Branch `claude/clear-plastic-discs`, off `origin/main` 573c80c (photo stamps through v3.1 and the viewer spin).
Two commits: **Part A**, a clear finish for bag discs, and **Part B**, the clean stamp mode, an experiment that
stopped for Freddy's eye. **Freddy kept Part B on Oct 23, 2026**, from the A/B sheet. Nothing pushed, merged or deployed.

**Freddy's case**, pinned Oct 23, 2026: the blue Raptor (Discraft Z) in Storage, with its existing photo. The photo was
read from the live account once, read-only, with Freddy's go-ahead: one `SELECT` on D1 and one `GET` from R2
(`0cef6b2f-….webp`, sha256 `0625424b…`). Nothing was written. **Photos are never committed.** That photo, every render
made from it and the A/B sheets live in the ignored `work/clear-plastic-discs/` folder of this checkout. Links into
`work/` open in this checkout and nowhere else. Committed images use catalog stock stamps only.

## Where to look

| | |
|---|---|
| **The A/B** (Part B, Freddy's call) | [sheet-partb-viewer.jpg](../work/clear-plastic-discs/evidence/sheet-partb-viewer.jpg): A today's texture · B stamp only · C main's game asset · opaque control, Top / centre 2× / 3/4, light and Midnight. [sheet-partb-pulled.jpg](../work/clear-plastic-discs/evidence/sheet-partb-pulled.jpg): B out of its Storage rack and out of the bag. |
| **Clear vs opaque** (Part A) | [viewer-opaque-vs-clear.jpg](assets/clear-plastic-discs/viewer-opaque-vs-clear.jpg), [surfaces.jpg](assets/clear-plastic-discs/surfaces.jpg), [bag-and-list.jpg](assets/clear-plastic-discs/bag-and-list.jpg) |

---

## 1. Characterization

### How a disc's plastic is drawn today

Every 3D surface builds the disc from one lathe (`disc3d/mesh.mjs`) in one material family: `PLASTICS.premium`, a
`MeshPhysicalMaterial` (roughness .3, clear coat .6), lit by a `RoomEnvironment`. `disc3d/quality.mjs` holds the
detail tier the viewer uses and My Bag's pulled discs share: 80 segments on desktop, 56 on a coarse pointer, pixel
ratio capped at 2. My Bag's pockets, Storage's racks (instanced, one batch per mold) and the top-down stills
(`atlas-art.mjs`: thumbnails, My Map, the gallery's list art) use lighter paths. All of it is opaque.

Every canvas that draws a disc is **transparent over the page**: the viewer's stage is a CSS gradient behind an
`alpha:true` canvas, and the bag and the racks are the same. That decides how clear plastic can be drawn.

### What clear plastic costs: real transmission against the approximation

**three.js transmission** (`MeshPhysicalMaterial.transmission`, with thickness and attenuation) renders the scene's
opaque objects into a second target every frame, builds its mip chain, and refracts that. It cannot see the page. The
CSS behind the canvas is not in any render target, so the disc would show black or the clear colour behind it. To be
right it needs a backdrop drawn into the scene anyway, and then it pays a second scene pass on every frame.

**Ordinary transparency** (blend towards the tint) can't be both saturated and see-through on a light page. A
saturated blue needs its red channel near zero, so the blend is nearly opaque. The first attempt looked like frosted
glass, pale and washed out.

**What ships (disc3d/clear.mjs): tinted plastic as a filter.** Under the disc, wherever the canvas is still empty, the
page's own colour is filled in (read off the host's CSS). The plastic then **multiplies** what is behind it by its
transmission, back wall first, then front wall (Beer–Lambert: `colour^(0.5/cos θ)` per wall, so the flat of the plate
is lightest and the rim, seen edge on, deepest). Each wall then **adds its shine**: the reflections, the clear coat, a
little haze, and light piped to the rim, at full strength. The picked colour is read as both walls square on over a
light surface, which is what a photo of the plate samples. Where the bag's fabric, a rack or another disc is behind,
the plastic filters that instead.

**Measured** frame cost (`work/clear-plastic-discs/lab/measure.mjs`): the Raptor in the viewer, each frame rendered then
forced to finish, median of five runs (120 frames each on the GPU, 12 on SwiftShader). ANGLE on Metal is the Mac's
GPU. SwiftShader is software: every fragment costs CPU, so it shows fill cost the way a weak phone GPU does. The
phone tier is the coarse-pointer settings (56 segments, 390 px wide, pixel ratio capped at 2) **on this Mac, not a
phone**.

| Tier | Engine | Opaque | **Clear** (×) | Transmission (×) | Opaque + photo | Clear + photo |
|---|---|---|---|---|---|---|
| Detail panel (560×420 css, ×2) | GPU (Metal) | 3.6 ms | **5.8 ms (1.6×)** | 11.5 ms (3.2×) | 3.2 ms | 6.1 ms |
| Detail panel (560×420 css, ×2) | SwiftShader | 40.2 ms | **90.0 ms (2.2×)** | 195.9 ms (4.9×) | 38.6 ms | 90.7 ms |
| Pop-out (1200×820 css, ×2) | GPU (Metal) | 6.0 ms | **7.9 ms (1.3×)** | 10.4 ms (1.7×) | 5.7 ms | 7.9 ms |
| Pop-out (1200×820 css, ×2) | SwiftShader | 121.5 ms | **253.5 ms (2.1×)** | 628.3 ms (5.2×) | 119.7 ms | 251.7 ms |
| Phone tier (350×330 css, ×2, 56 segments) | GPU (Metal) | 2.5 ms | **4.3 ms (1.8×)** | 6.3 ms (2.5×) | 2.6 ms | 4.2 ms |
| Phone tier (350×330 css, ×2, 56 segments) | SwiftShader | 25.1 ms | **59.2 ms (2.4×)** | 123.7 ms (4.9×) | 23.8 ms | 57.2 ms |

Draw calls per frame: opaque 2, clear 8 (page fill, two walls × filter and shine, the stamp), transmission 3 plus its extra scene pass.

**Decision:** ship the filter approximation. It costs **1.3–1.8× the opaque disc on the GPU and 2.1–2.4× on
SwiftShader** (the phone tier: 2.5 → 4.3 ms on the GPU). Real transmission costs **1.7–3.2× on the GPU and about 5×
on SwiftShader**, and it still could not see the page. The viewer draws only while something moves, so the cost is
paid while turning or spinning, not at rest. Nothing in the atlas or its
perf gate changes: catalog discs never take this path, and the gate's thresholds are untouched. (The gate itself was
not run on this branch. Opaque and atlas renders are pixel-identical to main; see Proof.)

**What the approximation trades**, against true transmission:
- **No refraction.** What is behind is tinted, not bent or displaced. On a flat page there is nothing to bend; over
  the bag's fabric, the fabric shows through undistorted.
- **No blur through rough plastic.** Every clear plastic here is the premium finish.
- **The page is one colour.** The fill is the stage's own colour (the centre of its gradient). Under the disc the CSS
  gradient is a few levels lighter or darker at the rim. That's invisible through the tint, but not exact.
- **Shine over things that aren't the page** (a stamp seen from below, the bag's fabric) is added against a grey
  estimate of what's behind, so it can be a little too bright or dim there, never off in hue. (A per-channel
  estimate drew a pink seam on the shoulder.)
- **Shadows aren't tinted.** A clear disc in Storage or the bag casts no shadow; an opaque one does.

### Where the finish lives: migration 0014 (stopped, flagged, approved)

`bag_discs` had nowhere for it: rim, photo rim and Halo each took their own column. So this stopped and flagged the
shape, and Freddy approved it Oct 23:

```sql
-- migrations/accounts/0014_disc_finish.sql
ALTER TABLE bag_discs ADD COLUMN finish TEXT NOT NULL DEFAULT 'opaque' CHECK(finish IN ('opaque','clear'));
```

Every existing row reads `'opaque'`. It ran only against local SQLite/D1 here. **Freddy applies 0014 remotely before
deploying.** A Worker that selects `finish` before the column exists would fail every bag read.

The Worker reads and writes it beside `rim_color` (`workers/bag.mjs`). `validateDiscDetails` (`bag-values.js`) takes
`'opaque'` or `'clear'`, defaults a new disc to opaque, and keeps the saved value when an edit doesn't mention it (an
older client). PATCH (moves, lost) doesn't touch it.

The sheet takes it where the colour is chosen: **Plastic: Opaque · Clear**, in the same pills as the photo's Look row.

### How the photo meets the material, and the upload contract

The stored photo is a 1024 WebP (≤ 512 KiB), validated by the Worker (`workers/textures.mjs`). That validator **already
admits alpha** (a `VP8X` alpha flag with `ALPH`, or lossless `VP8L`), and every stored photo already has a transparent
edge. The photo is drawn on its own mesh over the plate (`disc3d/photo.mjs`), wearing a copy of the plate's material.

Part B's output is not a new photo. It is the **game asset**: the existing per-disc stamp asset (`stamp/<uuid>.webp|png`,
colour with alpha, `workers/stamps.mjs`). So **no contract change was needed.** The Raptor's clean asset is a 280 KB
WebP, accepted as is.

### Rim-colour sampling on a clear disc (a Freddy decision, not changed)

What a photo's samples mean on a clear copy:
- **The plate colour** (`color`, matched at "Use photo") is the plastic **over the surface it was photographed on**.
  Over a light table that is exactly what the clear material reads the colour as (both walls over a light surface).
  Over a dark surface it comes out too dark. The colour picker still corrects it.
- **The overmold rim sample** (`photo_rim_color`) is honest. The rim piece of an overmold stays opaque plastic on a
  clear copy (MVP's clear cores sit in opaque rims), and it's sampled as before.
- **A Halo band's sample** on a clear copy would be dye-through-plastic over the surface: the same caveat as the plate.

Nothing here samples differently by finish. **Matched rim stays the opaque-finish behaviour, untouched.** Whether a
clear copy should skip photo matching, or warn when the photo's surface was dark, is Freddy's call.

---

## 2. Part A: the clear finish (built)

- **Per disc, in the sheet**, saved with the copy, surviving reload (unit and browser suites). Catalog and atlas discs
  are untouched.
- **The material** (`disc3d/clear.mjs`) as described above. **Both themes**: on a light page it reads as deep tinted
  plastic, the inner rim wall showing through the top as a darker ring. On Midnight it reads as glassy: dark plastic
  with bright reflections and the rim lit by piped light. See [viewer-opaque-vs-clear.jpg](assets/clear-plastic-discs/viewer-opaque-vs-clear.jpg).
  A clear disc's print (stamp or photo) shows through from below, mirrored and tinted.
- **Surfaces.** Each one carries `finish`:

  | Surface | What a clear copy draws |
  |---|---|
  | Viewer (detail panel and pop-out), gallery viewer | both walls |
  | My Bag, pulled out large (over 128 px, the viewer's own tier) | both walls |
  | My Bag, in its pocket or pulled at bag size | front wall, carrying both walls' tint |
  | Storage, racked | its own instanced batch: front wall |
  | Storage, pulled from the rack | both walls |
  | Lost | front wall |
  | Bag list thumbnails, My Map | front wall over the row's / map's colour (cached per page colour) |

  **Nowhere draws a clear copy opaque.** The suite checks the viewer, pop-out, bag, racks and thumbnails.
- **A clear disc with no photo**: the tint, and its stock or generic stamp, clean.
- **A clear disc with a photo** (the interim before Part B, and the fallback if B is killed): today's texture on the
  clear plate, unchanged. It is visibly imperfect: the table, the stamp's shadows and the glare sit on the plate as a
  printed patch, while the rim and underside around it are clear. That's row **A** in the A/B sheet. The sheet says so:
  *"Your photo was taken on a surface, and it shows through the plastic in the photo. The photo stays as it was taken;
  the plastic around it turns clear."*

## 3. Part B: the clean stamp mode (experiment, then stop)

**Where it lives.** "Stamp only" is the existing **Game asset** look, made from the disc's stored photo in one click
(v3.1). On a Clear disc the sheet makes it in clean mode. A new pre-pass, `public/disc-stamp-clear.mjs`, runs on the
same pixels before the unchanged extraction (`disc-stamp-worker.mjs`, `clear: true`).

**The signals.** These are measured on the Raptor's photo, and every constant is disc-independent:
- **Print** is either another colour than the plastic (the red foil: turned off the plate's hue axis by more than 14
  ΔE) or a **crisp** dark mark (darker by 14 L with a sharp edge). The edge-sharpness map leaves the stamp crisp and
  the shadows faint.
- **The shadow is the print moved by one vector**: the light's angle times the plate's height above the table. The
  print correlated against the plate-hued darkening around it gives the Raptor's shadow at **(−25…−30, +27) px at
  1024**, 2.3–2.5× its median score. (Per region it runs from (−28, 28) to (−32, 42): the dome is higher in the middle,
  so the footprint is spread to cover that.) A disc with no clear peak (under 1.6×) is left exactly as it was.
- **Navy ink casts a navy shadow** dark and crisp enough to pass for print. The test that separates them is physical:
  **ink casts, a shadow does not.** A plate-hued mark whose caster (one offset back) is darker, and which darkens
  nothing one offset on, is a shadow. A darkness-only test erased the C of CHAMPION and a signature stroke. This one
  keeps them.
- **The shadow is lifted, not replaced.** Shadowed pixels get back the darkness they lost, towards the local plate
  field, tapered before the plate's edge. Replacing them drew steps the extraction read as specks.
- **The shoulder** (past 0.87–0.9 of the plate's radius) is the thick rim showing its colour deepest, scratched and
  catching light. It casts nothing, and plate-hued "design" there is dropped after the extraction. Foil there stays.

**The A/B** ([sheet-partb-viewer.jpg](../work/clear-plastic-discs/evidence/sheet-partb-viewer.jpg)), all through the
real product (`tests/clear-plastic-partb-evidence.mjs`, the local signed-in harness, the stored photo uploaded as is,
the asset made with one click on Game asset):

| Row | What it is | What it shows |
|---|---|---|
| **A** | Clear, Photo look (today's texture) | The table, the soft shadow copies of DISCRAFT, 5X PAIGE PIERCE and RAPTOR, and the glare streak, all printed on the plate. |
| **B** | Clear, Game asset in clean mode | **The stamp alone**: red foil and navy ink crisp on the clear blue plastic, no shadow copies. **Left over:** a thin glare fleck beside PIERCE (in C too: the existing glare handling's), and a thin streak hugging the outer ring at top right. |
| **C** | Clear, Game asset by main's extraction | For reference: the RAPTOR shadow comes through as dark ink under the letters, plus a ghost "X" under 5X. This is what Game asset gives a clear disc without Part B. |
| Control | Opaque, Photo look | Today's opaque pipeline. Its renders and its extraction are **byte-identical to main** (see Proof). |

[sheet-partb-pulled.jpg](../work/clear-plastic-discs/evidence/sheet-partb-pulled.jpg) shows B out of its Storage
rack (both walls) and out of the bag, light and Midnight. In a two-disc bag the pulled disc shows at 124 px, just
under the viewer tier's 128, so it draws the front wall, carrying both walls' tint.

Making the asset in clean mode took 10.6 s on this Mac, against 8.8 s for main's (the pre-pass is about 1–2 s at 2048).

**Constraints, either way.**
- **The photo itself is never changed.** Originals aren't stored (Plan 22), and the clean asset is made from the
  stored photo, so switching finish needs **no re-shoot**. It does need the asset **made again**, because an asset
  made on Opaque carries the shadows. The sheet says that plainly on a clear disc with a photo: *"Your photo was taken
  on a surface, which shows through the plastic in it, with the stamp's shadow. The photo stays as it was taken. Game
  asset keeps just the stamp: after changing the finish, make it again."* Nothing remakes it behind the player's back.
- **Rim sampling**: unchanged (§1).

**Ruling: kept** (Freddy, Oct 23, 2026, from the A/B sheet). Had it been killed, a revert of commit 2541078 would have
left Part A standing, with a clear disc's photo showing row A's look, or C's under Game asset. The two blemishes
left in row B (the glare fleck beside PIERCE, and the thin streak along the outer ring at top right) ship as they are.

## Proof

| Check | Result |
|---|---|
| `tests/bag.mjs` (new cases): finish persists through create, move, an edit that omits it, every read; bad values refused; another player can't reach it; 0014 leaves every row opaque and accepts only opaque/clear | `npm run test:bag` 75/75 |
| `tests/clear-plastic-browser.mjs` (new): the sheet saves Opaque · Clear and it survives a reload; a clear copy is see-through in fact (the same pixels move by 35/30 levels between light and Midnight, an opaque copy's by 0/0); pop-out; My Bag pocket (1 wall) and pulled large (2), with the page filled behind it; Storage; thumbnails | `npm run test:clear` passes |
| `tests/disc-stamp-clear.mjs` (new, synthetic discs): the shadow found at its offset and lifted, print bytes untouched; plate-hued ink kept; a disc with no shadow byte for byte; the shoulder rule; `extract` with clean mode off is today's | `npm run test:clear-stamp` 5/5 |
| **Opaque discs pixel-unchanged**: the viewer (Raptor, the Raptor with its photo, an overmold, a Halo band, a Buzzz marked opaque; 3/4, Top, Bottom; light and Midnight), the atlas with its 3D discs, and signed in: My Bag with a disc pulled out, Storage racked and pulled, the bag list's thumbnails, both themes. Branch against `origin/main`, and main against itself. | **identical**, every image (`work/clear-plastic-discs/lab/identity*.mjs`) |
| **Opaque extraction**: this branch's worker (clean mode off) against main's on the same pixels, the Raptor's photo and the stamped-disc fixture, stored and camera paths | **identical** (sha256 of every output) |
| Existing suites: disc3d, photo-textures (unit + browser), photo-rim, photo-edge (+ atlas), photo-level, photo-stamp-sync, halo, bag pulled-quality, overmold, collections, album, 3d, memorial, appearance, atlas 3d, atlas stamps, my-map, 3d polish, photo-stamp one-click, color-assets, assets, identity | all pass |

Found and fixed along the way:
- `photo-editor-races` runs the sheet's real save code in a sandbox, which had no `finishChoice`. Stubbed there.
- The finish pills first reused the Look row's class, which the colour-assets suite counts. They now have their own.
- In My Bag, the "print on top" draw order was given to the clear passes too, and `walls(1)` hid the page fill (its
  name matched `clear-back`). The pocket tier drew no tint at all and a pulled bag-size disc came out white. The
  suite now fails if a clear copy's page fill is missing.

Side effects to restore before any commit: `photo-stamp-level` rewrites `docs/photo-stamp-orientation/`, and
`atlas-stamps` rewrites `docs/assets/atlas-stamps/` (both restored here).

## Codex review on PR #44 (fixed)

Codex reviewed 180f76d and left three P2 findings. All three were checked in the source, and Freddy ruled to fix them:
1. **Clear thumbnails kept the old theme's row colour** after a theme switch (finished thumbnails are no longer
   watched, and nothing listened for the theme). Each list now watches its clear thumbnails again on
   `atlas-theme-change`, so they redraw over the new colour. Opaque thumbnails are not touched.
2. **Lost kept a clear disc's light-theme fill** on a dark canvas: the graveyard had no `setTheme`, which is what the
   scene forwards theme changes to. It now repaints its clear discs' page colour.
3. **The worker copied the "untouched" photo after the shadow pass.** The copy now comes first. It is only read for
   blown-out glare, which the pass never touches, so the Raptor's clean asset is byte-identical before and after this
   fix.

The browser suite now switches theme with the list and Lost open (no reload) and checks the clear thumbnail and the
Lost disc against a fresh load in that theme. Both checks fail without their fixes. Opaque renders and extraction are
still identical to main.

Codex's re-review (df1a234) found one more, also real and fixed:
4. **A make read the finish late.** A one-click make outlives its sheet (v3.1), but it asked the sheet for the finish
   only after fetching and decoding the photo. If you started a make on a clear disc, closed the sheet and opened a disc
   with the other finish, the asset came out in the wrong mode. Both make paths now record the finish when the make
   starts: the one-click job, next to its plate, and the camera-original make, next to its look. The suite starts a make
   on the clear Raptor with its photo held back, moves the sheet to an opaque disc, releases the photo, and checks the
   mode the extraction actually ran in. It fails on the old code. (`photo-editor-races`' thumbnail sandbox recorded the
   last listener added as the photo listener; its stub now keys listeners by event type.)

Codex's next review (8ba3882) raised the clean pass's memory (P2): at 2048 px it kept many 16 MiB full-size fields
alive at once, a risk to a low-memory phone's worker. Freddy ruled to fix it:
5. **Detection at 1024, lift at full size.** The print, the offset, the recast and the footprint are found on a 2 × 2
   averaged copy at 1024 px. The lift then walks the full 2048 photo, computing each pixel's colour as it goes and
   reading the footprint and plate field from the 1024 maps. No full-size working field is kept, and the blurs and
   working fields share a few reused buffers. Peak resident memory in the same Node harness (the Raptor's photo at
   2048, two runs each; the harness alone peaks at 116 MiB):

   | | Before | After |
   |---|---|---|
   | Opaque extraction | 912 MiB | 897 / 911 MiB |
   | Clear extraction | 892 MiB | 946 / 924 MiB |
   | Shadow pass alone | 568 MiB | **201 / 206 MiB** |

   The pass's own working memory fell from about 452 to about 88 MiB. The clear extraction's overall peak is still set by
   the existing extraction after it, as before; the run-to-run swing is the garbage collector.
   **The Raptor's clean asset is not byte-identical:** the same shadow is found (offset (−50, 54), strength 2.55), but
   293 of 1,048,576 mask pixels flip (single pixels on the RAPTOR letters' lower edges, and specks by the glare at
   PIERCE and the left ring) and 3.8% of colour pixels shift, 29,001 of 40,034 of them by 1–2 levels. Freddy reviewed
   the comparison and accepted it.

## Left undone, on purpose

- **The atlas perf gate was not run.** Its thresholds are untouched, catalog discs never take the clear path, and the
  atlas renders pixel-identical to main.
- **No phone was measured.** The phone tier's numbers are its settings on this Mac. SwiftShader stands in for a weak
  GPU's fill cost.
- **Glare on clear discs.** The fleck beside PIERCE belongs to the existing glare handling, the same with or without
  Part B.
- **A clear copy casts no shadow** in Storage or the bag.
- **Clear and Halo.** A Halo copy marked Clear draws its band as clear dyed plastic. No real one was tried.
- **Rim matching on clear** (§1) is left as the opaque behaviour: Freddy's decision.
- **Deploy order:** 0014 remotely, then the Worker.
