# Clear finish: the opacity meter

Branch `claude/clear-opacity`, off `origin/main` 730ac3c. Commits on the branch only: nothing pushed, merged or deployed.
Migration 0018 is applied locally only.

**Freddy's ask, Oct 23, 2026:** clear is not one thing. Every manufacturer has a clear-ish plastic, and they sit at different
opacities: near-glass, frosted, halfway to solid. So a clear copy gets a meter, on the disc's finish controls.

| | |
|---|---|
| **The sweep** (stock stamp, no photo) | [sweep.jpg](assets/clear-opacity/sweep.jpg): 0 to 99 and the opaque control, 3/4 and top, Paper and Midnight |
| **With a true colour** | [sweep-true-color.jpg](assets/clear-opacity/sweep-true-color.jpg): the walls moving from the true colour to the disc's own colour |
| **Pulled from the bag** | [bag-pulled.jpg](assets/clear-opacity/bag-pulled.jpg): 0, 60 and 100 out of the bag, both themes |

---

## For Freddy: what is yours to call

1. **Apply migration 0018 before the Worker deploys** (section 2). A Worker that selects the column first fails every bag read.
2. **Brand-named presets: not built, your call.** The control says Clear and Opaque at its ends and a class word for where it
   sits (Crystal, Clear, Frosted, Milky, Opaque). No position names a plastic. If you want "Champion" or "Z" as presets, they
   would be a row of named stops over this same number, with no data change. Which brand sits where is a judgement about real
   plastics, so it is not one to default.
3. **The word "Milky".** The brief offered Smoky as a class word. What the top of the range draws is pale and bright, not dark,
   so I used Milky. One line to change (`opacityWord` in `my-bag.js`).
4. **The constants**, all in one place and all a one-line move: `FINISH_OPACITY.today` 30 (where today's look sits on the
   slider, `bag-values.js`), and `CLEAR_RANGE` `density` .14 and `haze` .4 (how far the glass end goes), `hides` .2 (`disc3d/clear.mjs`).
5. **The Photo look** (section 4): a photo is a picture of its plastic, so the plate stays the photo at every position and only the shoulder, rim and underside follow.
   A copy with both a photo and a true colour also jumps from 99 to 100. I left both as they are and the sheet says so; your eye may want otherwise.

---

## 1. What it does

`finish_opacity` is 0 to 100 per copy. 0 is the most transparent the renderer draws, 100 is opaque, and **30 is today's look**.

- **30 down to 0, less dye.** The walls' density falls to 14% of today's, the haze to 40%, the rim glow with them. The page
  comes through almost untinted; surface reflections and a trace of the colour stay, so it still reads as a disc on Midnight.
- **30 up to 99, more scatter.** Each wall lets less of the background through while the diffuse light it had been taking away
  comes back. It reads frosted, then milky. A copy with a true colour moves from it to the disc's own colour on the way.
- **100 is the opaque path.** `renderFinish` hands every renderer `opaque`, so no clear pass draws at all, and the disc is the
  opaque disc in that colour by construction. Its stored finish stays `clear`, so the sheet and the game asset do not change.

Saving at 30 stores `NULL`, not 30. A copy never moved follows `FINISH_OPACITY.today` if it is ever re-tuned.

The sheet shows the slider on Clear only, under the finish pills, with a small live disc beside it. Without that the slider
would be blind until Save: nothing else in the sheet draws the plastic. It was not in the brief; it is a thumbnail, through the
ordinary thumbnail path, redrawn at most once a frame.

### Why not simply a stronger or weaker filter

Two things found on the way, both in the write-up because they are easy to reintroduce:

- **Shine has to know what it lands on.** A clear disc's shine is added to sRGB values against a *grey* estimate of what is
  behind it. That is fine for a highlight and wrong once the shine is most of the disc: the first build read brighter and more
  cyan than the opaque control all the way to 99. The estimate now turns per channel on the way to opaque.
- **The inside of the far rim.** A front-facing surface hidden under the top plate is drawn by the shine, because clear passes
  write no depth. Through clear plastic that is correct. Past frosted it is a bright arc, so above `hides` the front wall writes
  depth. No extra pass.

After both, position 99 is within 4/255 of the opaque disc at worst, mean difference about 1, on both themes.

## 2. Data: migration 0018

Stopped and flagged as the brief asks, **approved by Freddy Nov 6, 2026** as shaped. The brief said 0015; 0015 to 0017 had landed
since, so this is 0018. No field could carry it: `finish` has a CHECK of two values, `stamp_*` and `photo_*` are checked or mean
something else, `notes` is the owner's text, and `bags` is per user.

```sql
-- migrations/accounts/0018_finish_opacity.sql
ALTER TABLE bag_discs ADD COLUMN finish_opacity INTEGER
 CHECK(finish_opacity IS NULL OR (typeof(finish_opacity)='integer' AND finish_opacity BETWEEN 0 AND 100));
```

Every existing row reads `NULL`, today's look, with no backfill. The validator stores `NULL` on any opaque copy and keeps the
saved value when an edit does not mention it (an older client). PATCH (moves, lost) does not touch it.

**Order: apply 0018 remotely, then deploy the Worker.** Freddy's hands, on his go.

## 3. Every render of the copy

The value travels beside `trueColor`, the same road: bag list thumbnail, detail heading, panel viewer, pop-out, bag pocket and
pulled, Storage's racks and a pulled rack disc, Lost, My Map, the gallery. Storage racks instanced by mold, so a copy off today's
racks in a batch for its mold and value. **Cost: each distinct value on a mold adds a batch**, three draws per piece. Copies at
today's look or at 100 share the existing batches.

## 4. Photos: is opacity baked in?

**The game asset: no.** Extraction takes `color`, `stored`, `clear` and `seeThrough`; opacity is not an input. The stamp-only asset
is drawn over the plastic, so the plastic changes and the stamp stays printed. The suite moves a copy with a saved asset through
0, 60, 100 and back: no make runs, and the stored asset does not change.

**The Photo look:** **yes, in the sense the brief asks about, and it is surfaced here rather than solved.** A photo is drawn solid over the plate
and shows the plastic as it was photographed, so the plate does not move with the slider. The shoulder, rim and underside outside
its cut do. The sheet says this under the slider whenever the copy has a photo. Making it a filter over the photo would be guessing
at what the surface under the disc was when it was taken.

One more edge, seen only with a photo **and** a true colour: the photo is retinted and cut as a clear photo at every position below
100, and at 100 it is the plain opaque photo. So 99 to 100 is a visible jump in that look, in the plate's colour. 100 matching the
opaque disc is the acceptance, so it stays. The alternative is to let the retint follow the slider, which decodes the photo again
for each value. Not built; say if you want it.

## 5. Fences

Measured against a detached `origin/main` tree (`work/clear-opacity/baseline`), real GPU, pixel for pixel.

| Fence | Shots | Result |
|---|---|---|
| Opaque discs, viewer (plain, true colour field set, photo, overmold, Halo band; 3 views, 2 themes) | 30 | **30 identical** |
| Clear discs with no value saved, viewer, same set | 30 | **30 identical** on the second pass. The first pass had one shot off by ±1 across 22k pixels, which did not repeat |
| Clear discs with the slider's own value (30) saved, against main | 30 | **30 identical** |
| Thumbnails, bag pockets, pulled discs (clear and opaque) | 14 | **14 identical** |
| Storage racks, racked and pulled | 4 | ±1 on at most 4 pixels. Main against itself: ±1 on up to 10 |
| Lost | 2 | Differs by about 39k pixels, as main does against itself, so a pixel fence says nothing here. Same shader and inputs |

This is exact by construction, not by luck: a part at today's look compiles the same GLSL as main (`CLEAR_OFF` unset). The first
build shared one shader, and ±1 appeared on a dozen pixels per shot from GPU float rounding, so it was split.

Opaque data: the validator stores `NULL` for every opaque copy, and the Worker's only change for it is one more column in its reads.

**Extremes**, read off the drawing buffer through the product, Paper against Midnight: the page moves a near-glass plate by 117 levels,
today's by 42, frosted's by 16, and a copy at 100 by 0. At 100 the viewer's canvas equals the opaque copy's byte for byte on both themes.

## 6. Frame cost

The original build's method (`docs/clear-plastic-discs.md`): the Raptor's mold in the viewer, each frame rendered then forced to
finish, median of five runs (120 frames on the GPU, 12 on SwiftShader). **Four passes in different orders**, because the GPU
figures move with order. Each cell is the median of the four, with their range. ANGLE on Metal is this Mac's GPU. SwiftShader is
software and shows fill cost the way a weak phone GPU does. The phone tier is the coarse-pointer settings **on this Mac, not a
phone**: 56 segments, 350×330 css, ×2.

| Tier | Engine | Opaque | Today (30) | **Most transparent (0)** | Frosted (60) | 99 | 100 |
|---|---|---|---|---|---|---|---|
| Detail panel | GPU | 3.1 (3.0–3.4) | 6.3 (2.8–6.5) | **5.1 (2.6–6.6)** | 6.2 (5.2–6.6) | 6.3 (4.6–6.5) | 3.2 (3.1–3.3) |
| Pop-out | GPU | 6.2 (4.0–8.3) | 7.9 (5.9–12.2) | **7.6 (4.7–12.2)** | 7.8 (5.8–14.9) | 8.8 (5.6–12.7) | 5.8 (3.3–8.3) |
| Phone tier | GPU | 2.3 (2.0–2.5) | 4.4 (3.0–4.7) | **4.4 (3.7–4.7)** | 4.1 (3.2–4.6) | 4.1 (2.5–4.6) | 2.4 (2.1–2.5) |
| Detail panel | SwiftShader | 43.6 (40.9–44.8) | 96.4 (93.7–97.6) | **101.8 (96.8–122.4)** | 100.8 (93.2–112.8) | 98.8 (97.5–113.8) | 43.7 (41.2–49.3) |
| Pop-out | SwiftShader | 144.6 (131.3–176.7) | 315.7 (269.2–341.1) | **315.2 (286.9–358.9)** | 307.5 (269.6–364.2) | 315.3 (277.6–358.5) | 150.8 (134.5–189.0) |
| Phone tier | SwiftShader | 29.5 (25.6–35.6) | 76.1 (68.6–82.5) | **75.8 (68.6–81.6)** | 72.7 (69.0–92.9) | 72.4 (68.6–81.6) | 28.8 (27.0–30.6) |

Milliseconds per frame. Draw calls: 8 at every position below 100, 2 at 100 and opaque.

**No position blows the budget, and no approximation trade was needed.** Transmission does not scale with the slider here: the
passes are the same at every position, so the most transparent end costs what today's look costs. The worst ratio to today across
the six rows is 1.06× (SwiftShader panel, within its own spread). The one position that differs is 100, which costs what an opaque
disc costs.

## 7. Not verified

- **No phone.** The phone tier is its settings on this Mac. WebKit compiled and drew positions 0, 30, 60 and 99 on both themes with no
  shader error, headless on this Mac.
- **Your eye and the live Raptor.** Production was not read or touched. The Raptor's check here is its stored photo and mold on the
  local harness, and the pixel fences above.
- **My Map and the gallery** carry the value and their own suites pass, but neither suite sets a non-default opacity.
- **Many values on one mold in the racks.** The batch cost in section 3 is by construction and was exercised with three values, not measured
  at scale.

## 8. Tests

`npm run test:clear-opacity`: `tests/clear-opacity.mjs` (validator, Worker round trip, migration, `renderFinish`) and
`tests/clear-opacity-browser.mjs` (the sheet, the Add flow, a save with no reload, viewers, bag, racks, Lost, thumbnails, extremes on
both themes, 100 pixel-equal to the opaque disc, the game asset untouched).

Run on this branch: `test:clear-opacity`, `clear-plastic-browser`, `clear-true-color-browser` (its fences need a pre-PR-46 tree, not
present, so those were skipped), `stamp-look`, `stamp-look-browser`, `bag-collections-browser`, `my-map-browser`, `all-discs-browser`,
`disc3d-browser`, `bag-browser`, the `test:bag` unit set, `photo-true-color`, `disc-stamp-clear`, `atlas-stamp-cache`, and the photo unit set:
**all pass.** `photo-editor-contract-browser` fails with "This photo could not be compressed", and **fails identically on main**. The full
repo suite was not run.

The lab is in the ignored `work/clear-opacity/lab/`. Worth knowing if it is reused: the older `work/clear-plastic-discs/lab/serve.mjs` this
started from rejects its own `../input/` photo path with a 400, so any "photo" shot from it draws the fallback stamp. Fixed here by
resolving the path, and the labs now wait for the photo to be ready.
