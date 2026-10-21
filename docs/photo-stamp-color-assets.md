# Photo stamps v2: full-colour game assets

October 21, 2026. Branch `claude/photo-stamp-color-assets`, own worktree, from freshly fetched `origin/main` **`01971aa`**
(the gallery photo-continuation fix, PR #39, on top of photo stamps v1, PR #37). Local commits only: no push, no PR, no
merge, no deploy, until Freddy rules on the side-by-sides.

**Photos are never committed.** Freddy's originals, their exports, every render made from them and the evidence sheets
live in the ignored `work/photo-stamp-color-assets/` folder of this checkout. The branch carries code, tests on drawn
synthetic discs, and this write-up. The evidence links below point into that ignored folder: they open in this checkout
and nowhere else.

## The ask, in one line

Freddy flipped his Gannon Buhr DD3 to v1's game-asset look and ruled that the design reads great, but the foil carries
many colours and the asset must copy the colours over too. v2 adds a full-colour variant: the stamp's own colours from
the original photo, with the photo's light taken out, so it reads as printed foil laid on the disc and not as a patch of
photograph.

## Verdicts (Freddy's eye is the gate)

| Disc | Verdict | In one line |
| --- | --- | --- |
| **DD3** | **Reads as the printed multicolour foil** | Periwinkle face with its halftone, shatter-foil crystals with their rainbow shards, the teal-to-cream lettering gradient, black outlines and the shield, flattened like print. No glare or shadow survives inside the design. |
| **Destroyer** | **Reads as its foil, as photographed** | Rainbow DESTROYER, pale STAR, charcoal lines and signature: the silver holo as the camera saw it at that moment. One limit: a holo's colours *are* reflections, so this is one angle's colours, frozen. |

Details: [DD3](#dd3), [Destroyer](#destroyer). Neither disc hit the stop rule: no baked-in glare or shadow survives on
the DD3's design.

**A file-name correction.** The brief named the DD3 `IMG_0788.DNG` and the Destroyer `IMG_0800.DNG`. v1's records
(capture times, `framing.json`) have them the other way round, and so do the photos themselves: **`IMG_0800` is the DD3
and `IMG_0788` is the Destroyer.** This build used v1's mapping.

## Step 0: the spike

Same sources as v1: the ProRAW originals rendered once by macOS's RAW engine to full-resolution JPEG (no metadata), read
at 2048 px through the aligner's arithmetic, de-lit by `delightPixels(…, {softenGlare:false})`, and v1's own extractor
for the design mask. Spike scripts and every intermediate are in `work/photo-stamp-color-assets/lab/`.

Five variants were tried on both discs, composited on the measured plate:

| Variant | What it does | Result |
| --- | --- | --- |
| Raw | The de-lit photo's colour inside v1's mask | Already close to the photo. Edge pixels carry a fringe of the plastic's colour, and foil sparkle and JPEG grain show at zoom. |
| Smooth | Each pixel the local mean of its own ink (k-means), over ~12 px | **Rejected.** The DD3's halftone face turns into blotches; the Destroyer's foil sweep breaks into patches. |
| Poster | Each pixel its ink's centre colour | **Rejected.** Same blotches, and every gradient in the print is lost. |
| Per-ink flatten | Clean colour, then each ink's broad lightness forced to its median | **Rejected.** It evens the window-lit crystals, but it also lifts the "2025" end of the lettering, flattening a gradient that is printed, not lit. In a synthetic test a sheen that also desaturates an ink splits into its own cluster, and only ~10% of the sheen goes (8.6 → 7.5 L). |
| **Clean + plastic light probe (built)** | See below | Reads as print on both discs; the sheen test drops 8.6 → 4.0 L; halftone, shards and gradients survive. |

The decisive idea: **the plastic is a light probe.** The plate is one known colour, so wherever bare plate is, its
deviation from the plate's median measures the light there. Light falls on everything in a place at once, while a
print's own gradient belongs to one ink. So the light measured on the plate around the stamp is divided out of every ink
under it, and the print's own variation is left alone.

Spike evidence (ignored folder): `lab/out/cmp-*.jpg` (raw/smooth/poster), `lab/out/cmp2-*`, `lab/out/flatdiff-dd3.png`
(where per-ink flattening moved lightness), `lab/out/flatcmp-dd3.jpg`, `lab/out/light-*.png` (the probe's gain and white
fields), `lab/out/whole2-*.jpg` (photo vs final, whole disc).

## What was built

### 1. Extraction (`public/disc-stamp-color.mjs`, new)

Pure JS, no DOM, run in the same module worker as v1. Every constant is disc-independent.

1. **Light.** In 32 × 32 cells of *open* plate (away from the design, and not plastic the design closes round, which
   reads darker through a print), the plate's colour is fitted as *gain × plate + added white* in linear RGB. The gain is
   shading the de-light quadratic missed; the added white is a sheen or a mirrored window. The field is pull-push filled
   under the design, smoothed, and divided out of every design pixel.
2. **Inks.** k-means over the design's interior (Lab, lightness at half weight, since light moves lightness more than
   hue), close clusters merged.
3. **Unreliable pixels.** Clipped glare (the raw crop at 250+, nearly colourless, plus its soft rim) and the design's
   edge. An edge pixel's ink is found by *un-blending it from the plastic* (blend = t·ink + (1 − t)·plastic), so a dark
   line's soft edge on red plastic is not a red-brown ink of its own.
4. **Colour.** An interior pixel keeps its own colour, lightly denoised among its own ink (≈2 px at 2048): the halftone,
   the lettering gradient and the foil shards all survive. Edge pixels take their ink's colour from reliable pixels
   nearby; glare is in-painted from the design around it.
5. **Alpha.** v1's final mask with v1's sub-pixel blur. Where the plastic shows through the print (halftone gaps,
   knocked-out line work), it shows through here too.

v1's extractor gained one option, `keepMask`, which returns its final binary mask; its output is otherwise untouched.

### 2. Making one (the disc sheet)

The Look row gains a third chip. **Proposed name: "Full color"**, beside "Photo" and "Game asset". It follows the sheet's
short, plain chip labels and the site's American spelling ("colorblind-safe", "Class colors"). One read of the original
makes **both** assets (the one-ink asset exactly as v1 makes it, and the colour one), so the row then switches between
all three looks at once. "Make again from original photo" redoes both.

- Choosing Full color on a disc with no asset, or with a v1 asset made before colour existed, asks for the original
  photo (the same aligner, "Frame the original").
- The note under the row changes with the look. For Full color: *"Full color keeps the stamp’s own colors from your
  original photo, so your stamp ink doesn’t apply; a foil finish adds only a light sheen. Only in this browser; the photo
  stays saved."*
- **The ink picker.** The brief asked for the ink picker to be disabled with a one-line note. The only ink picker is the
  Appearance sheet's *Stamp ink*, and it is global: it sets the ink of every stamp the player owns. Disabling it because
  one disc wears full colour would take it away from all the others, so it stays live. Instead, while any disc wears Full
  color, a one-line note sits under it: *"Discs in Full color keep their own colors, so the ink doesn’t reach them."* The
  disc sheet carries its own note (above). If Freddy wants a per-disc ink control, that is a new control, not this one.
- At phone width (390 px) the row wraps: "Full color" sits on a second line under "Look"
  ([screenshot](../work/photo-stamp-color-assets/evidence/phone-look-row.png)). The chips stay 44 px tall, and the page
  does not scroll sideways. Left as is; a tighter row, or a shorter label, is Freddy's call.
- Measured in the evidence run: **5.6 s** for the Destroyer and **6.9 s** for the DD3 (v1 alone: 1.9 / 2.5 s). The status
  line says "Making the game asset…" throughout.

### 3. Finishes: a sheen over colour

A finish stays available in Full color, at reduced strength: a colour asset wears its finish with **0.35 of its
metalness and iridescence** (`colorStyle` in `public/disc3d/stamp.mjs`). Flat stays today's flat material. The ink is
never applied.

Evaluated on both discs in the viewer, comparing the flat colour render with the chosen finish at full strength and at
0.35 (mean ΔE over the stamp's pixels, Top view, zoomed):

| Disc, finish | Full strength | Sheen (0.35) |
| --- | --- | --- |
| DD3, Shatter foil | ΔE **10.7**: the shards turn pink and purple, the face goes violet; the colours are replaced | ΔE **2.2**: the colours hold, with a light shimmer |
| Destroyer, Rainbow foil | ΔE 3.0: the charcoal lines and signature turn rainbow | ΔE 1.8: the colours hold; the charcoal lines and signature read a little paler |

A full-strength foil would distort the colours, so it is not used. A sheen keeps them, so finishes stay on. One thing
for Freddy's eye: on the Destroyer the sheen lightens the dark ink a little. If that reads wrong, the alternative is
finishes off in Full color (one line in `colorStyle`). Evidence: `evidence/finish-dd3.jpg`, `evidence/finish-destroyer.jpg`
(flat / sheen / full), and the `sheet-*-colorFull.jpg` sheets.

### 4. Where it is kept

Browser-local, beside v1's assets. **No account storage, no migration, no server change.**

- The localStorage index entry gains an optional `color` part (`{rev, placement}`) and a third look, `"color"`. An entry
  without it is exactly a v1 entry, and a v1 entry still validates and renders as before.
- The colour asset's bytes sit in the same IndexedDB store, keyed `<disc>/<photo version>/c`. Its asset id ends in `/c`.
- It is **WebP** (lossy colour, exact alpha), cropped to the smallest centred square holding the design, the same rule
  as v1. Stored sizes: **208 KB** (Destroyer) and **773 KB** (DD3), against the one-ink assets' 350 KB and 1.64 MB.
  The budget is **1.5 MiB, enforced**. Encoding tries quality 0.9, 0.8 and 0.7. Past that it steps the image down in
  resolution (×0.8 each step, placement unchanged, since the texture spans the same share of the disc at any size). A
  colour asset that still cannot fit is not kept: the one-ink asset is saved alone, and the sheet says *"Game asset made
  in one ink. This stamp is too detailed to keep in full color in this browser."* Where the canvas cannot write WebP,
  the bundled encoder does. (Codex review on PR #40 caught that the first version returned an over-budget blob after
  quality 0.7. Fixed and tested before merge.)
- Replacing the photo is a new version, so the look returns to Photo, and both of the old assets are deleted. Colour
  bytes this browser can no longer read give the disc its photo back, everywhere, as in v1.

### 5. Rendering: the same stamp path

A colour asset goes through v1's path unchanged (`photoStampFor` → `stampTexture` / `stampGeometry` / `stampMaterial`).
Two differences, both keyed on the `/c` asset: `stampTexture` draws it as it is (no layering, no ink, opaque), and each
surface hands it `colorStyle(style)` instead of the player's style. Surfaces: the detail viewer (2048 px), the gallery,
the pulled bag disc (1024), storage racks and the graveyard (1024), personalized map stills, and bag-list thumbnails.

## The evidence

Per disc, the sheet has rows for viewer 3/4, viewer Top, Top's centre zoomed 2×, the bag with the disc pulled (desktop),
and the same on a phone. Columns: photo (today) · v1 one-ink (Auto, flat) · v2 full color (flat) · v2 full color in the
disc's chosen finish (sheen). Taken at 2× density through the real product flow.

- [DD3 sheet](../work/photo-stamp-color-assets/evidence/sheet-dd3.jpg) (chosen: shatter foil);
  [with the full-strength column](../work/photo-stamp-color-assets/evidence/sheet-dd3-colorFull.jpg)
- [Destroyer sheet](../work/photo-stamp-color-assets/evidence/sheet-destroyer.jpg) (chosen: rainbow foil);
  [with the full-strength column](../work/photo-stamp-color-assets/evidence/sheet-destroyer-colorFull.jpg)
- The stored colour assets: [DD3](../work/photo-stamp-color-assets/evidence/dd3-color.webp),
  [Destroyer](../work/photo-stamp-color-assets/evidence/destroyer-color.webp)
- Other surfaces in Full color: [gallery](../work/photo-stamp-color-assets/evidence/gallery-color.png),
  [bag list](../work/photo-stamp-color-assets/evidence/list-color.png), map stills
  ([DD3](../work/photo-stamp-color-assets/evidence/dd3-color-mapstill.png),
  [Destroyer](../work/photo-stamp-color-assets/evidence/destroyer-color-mapstill.png))
- Flat, whole-disc extraction views (photo vs asset on the plate):
  [DD3](../work/photo-stamp-color-assets/lab/out/whole2-dd3.jpg),
  [Destroyer](../work/photo-stamp-color-assets/lab/out/whole2-destroyer.jpg)

Regenerate with `node tests/photo-stamp-color-assets-evidence.mjs` (photos in `work/photo-stamp-color-assets/photos/`
with `framing.json`), then `node work/photo-stamp-color-assets/lab/sheets.mjs`.

### DD3

- **Carried over:** the periwinkle face with its halftone (the red plastic shows through the hatching, as on the disc);
  the shatter-foil crystals, silver with their rainbow shards; the lettering's teal → periwinkle → cream gradient; the
  near-black outlines, eyes and teeth; the Discmania shield; Q-LINE, PREMIER SERIES and GANNON BUHR.
- **Flattened:** the window reflected on the right shoulder is gone, because the plate is no longer photographed. The
  probe measured added white of up to 0.08 there and evened the window-lit crystals on the right. The disc's shading,
  left darker and lower-left brighter, is divided out.
- **Still photograph-like, honestly:** the shards' rainbow is the foil's response at one angle, frozen into the asset.
  That is what shatter foil looks like in a photo, and it reads as foil. Fine red lines between dark outlines are the
  plastic showing through (v1's mask), so they are as red as the plate, slightly brighter than the photo's shadowed
  maroon.

### Destroyer

- **Carried over:** the rainbow sweep across DESTROYER (gold to silver), the pale-blue STAR, the star and its ring, and
  in charcoal DISTANCE DRIVER, the flight-number boxes, the McBeth signature, "PAUL MCBETH 4X WORLD CHAMPION", INNOVA and
  DISC GOLF, plus the swoosh's rainbow.
- **The limit:** this is a silver holo stamp. Its colours are reflections, so the asset holds one angle's reflections:
  bright rainbow where the window was, charcoal where the room was dark. It reads as the foil Freddy photographed. The
  one-ink asset with a rainbow-foil finish remains the "one foil, any angle" version.
- **From v1, unchanged:** the dash in "MCBETH-4X" and parts of the Y and the O of GOLF, lost in v1's mask (foil mirroring
  the plastic's own colour), are missing in colour too.

## Fences, as observed

- **Photo and one-ink modes are byte-identical to `origin/main`, on every surface: test-asserted.**
  `tests/photo-stamp-identity-browser.mjs` runs one probe in this checkout and one in a detached worktree of `origin/main`
  (`01971aa`), each building and serving its own `public/`. Both take the same drawn synthetic photo through the same
  sheet flow, then make the one-ink game asset from the same original. It then compares:
  - the made one-ink asset's bytes;
  - for the photo look and the one-ink look, each in Auto/flat and in gold foil: the viewer's photo or stamp texture and
    stamp material, the gallery's, the storage disc model's textures and materials, the bag-list thumbnail, the
    personalized map still, and the pulled bag disc's stamp layer (finish, metalness, asset).

  **Result: 23 pixel captures plus every material, all identical, with zero values differing** (the asset bytes too).
  A second probe of this checkout also matched the first exactly, so there is no run-to-run noise to hide behind, and
  the test compares exactly. The pulled bag disc is compared on its stamp layer's material and asset, not its texture
  pixels; that texture comes from the same `stampTexture` as the viewer's. Report:
  `work/photo-stamp-color-assets/identity/report.json`.
- v1's own browser suite (`photo-stamp-assets-browser`) passes unchanged on this branch. It covers the photo look's
  route bytes and decoded pixels before and after a round trip through the game asset.

- **Originals only.** Making either asset asks for the original photo and reads it at 2048 from a working copy up to
  4096. The site's stored 1024 px texture is never an input.
- **No server storage, no migration, no catalog-stamp change.** The Discraft stock-stamp path (`STOCK` assets) is
  untouched: the colour branch in `stampTexture` keys only on a `/c` photo-stamp id. The neutral Standard map test shows
  the catalog Destroyer unchanged.
- **Photos never committed.** `work/` is ignored. Test fixtures are drawn SVGs.

## Suites

Run on this Mac (ANGLE on Metal, `--enable-gpu`), at commit `7fab320`. Logs: `work/photo-stamp-color-assets/suites/`.

| Suite | Result |
| --- | --- |
| Every unit suite (35 files, `node:test`, incl. the new `tests/disc-stamp-color.mjs`) | **283 / 283 pass** (277 before + 6 new) |
| `tests/disc-stamp-color.mjs` (new, drawn synthetic discs: every ink keeps its colour and the plate carries nothing; the same print on another plastic; an edge is the ink, not a blend with the plastic; the plastic shows through a halftone; a sheen across one ink and a clipped glare spot; the one-ink asset byte-identical to v1's with and without the colour asset) | Pass, 6 |
| `tests/photo-stamp-color-assets-browser.mjs` (new: the Look row's three choices; Full color from the original; both assets stored, the colour one as WebP within budget; the viewer at 2048 carrying all four drawn inks; gold ink leaves it as it was; the finish becomes `rainbow~sheen` at 0.35 with the texture unchanged; the Appearance note; the pulled bag disc; the bag-list thumbnail; the gallery; storage's disc model; the map still; the catalog Destroyer untouched; Game asset in gold; back to Photo byte-for-byte; lost colour bytes give the photo back; a v1-only entry asks for the original again; a replaced photo returns to Photo; the size budget: a halved budget gives a smaller image in the same placement, an impossible one keeps the one-ink asset alone) | Pass, 3 of 3 after the review fix |
| `tests/photo-stamp-identity-browser.mjs` (new, above) | Pass: 0 differences vs `origin/main` |
| Browser sweep: the 40 suites the last landing ran, plus `display-customization`, `stamp-scale`, `photo-stamp-assets` and `photo-stamp-color-assets` (44) | **40 pass.** One of the passes, `photo-decode-browser`, is a helper module another suite imports: run alone, it exits 0 having checked nothing. |
| `bag-interactions-browser` (details panel never opens), `bag-tweaks-browser` ("Discs reach close to both sides at 1440"), `photo-compression-browser` ("native bytes unchanged"), `photo-editor-contract-browser` ("This photo could not be compressed") | **Fail on `origin/main` too, identically**: the paired control ran in the detached `01971aa` worktree, same messages (`work/photo-stamp-color-assets/suites-control/`). Recorded as failing on main in earlier landings. |

Not run: `discraft-stamps-browser` (fails on main, recorded in docs/display-customization.md) and the Atlas perf gate (no
atlas code path changed for discs without a photo stamp; the map-still path is covered by the identity probe).

## Gallery gate

`node tests/gallery-fixes-browser.mjs`, unchanged (no edits to the gate, its baseline, limits, margins or reps), under the
quiet protocol, with the same runner as the photo-continuation landing
(`docs/assets/gallery-photo-continuation-fix/gate/gate-pair.sh.txt`). The runner aborts unless `pmset` reports AC power.
Before each run it waits for 12 consecutive samples (about 60 s) at 85% idle or more with no foreign headless browser,
`workerd` or Wrangler, and it logs power, CPU, load and foreign processes every ~15 s throughout. Logs:
`work/photo-stamp-color-assets/gate/` and `…/gate-pair/`.

**Grading: FAIL, on one row only, and current main fails the same row in the same window.**

| Run (Oct 21) | Tree | Desktop fly p95 (limit 3.455 ms) | Every other row | Phone warm long tasks | Checks / errors |
| --- | --- | --- | --- | --- | --- |
| 08:01–08:04 | branch `7fab320` | **3.5 FAIL** (reps 3.3–3.8) | pass | **0 / 0 / 0** | 4/4 · 0 |
| 08:05–08:08 | `origin/main` `01971aa` (control) | **3.7 FAIL** (reps 3.5–3.8) | pass | **0 / 0 / 0** | 4/4 · 0 |
| 08:08–08:11 | branch `7fab320` | **3.8 FAIL** (reps 3.3–3.9) | pass | **0 / 0 / 0** | 4/4 · 0 |

- **Window:** 45 samples, every one on AC power. Each run started after 12 qualifying samples at 94.7–95.4% idle with
  `foreign=0`. Idle during the runs was 77–95% (the low end is the gate's own browser), and load was 1.6–3.4.
- **What failed:** only desktop fly p95. The baseline is 1.7 ms, and the limit 3.455 is 1.7 × 1.15 + 1.5. All three runs
  landed at 3.5–3.8, untouched main in the middle of the branch's two. The photo-continuation landing measured 2.5 on
  this row. So this morning's desktop flight is slower on both trees alike, and the change does not account for it.
  Desktop long tasks were 0 on every run.
- **PR #39's scheduling fix is not regressed:** phone warm long tasks were 0 / 0 / 0 on every run of both trees (limit:
  median ≤ 1). Phone fly p95 was 6.3 / 6.6 against 10.13, and every behaviour check was true.
- Why the change should not move the Gallery's numbers: the gate's discs have owner photos but no game assets. With no
  entry in the photo-stamp index, every surface takes the photo path, which the identity probe shows byte-identical to
  main.
- **Owed:** a passing run in a better window (the gate grades the machine's state as much as the code). Freddy may
  prefer to run it himself, as before.

## Known limits and follow-ups (not built)

- **A holo's colours are one angle's.** A second photo at another angle could separate the foil's own colour from what
  it mirrors. Not attempted.
- **Make time roughly triples** (≈6–7 s on these photos, in the worker; the page stays responsive).
- **Only this browser has it**, as in v1. Cross-device needs account storage, a migration, which was not built.
- **Light the plastic does not see.** The probe reads light on the plastic. A foil mirrors a window far more strongly
  than glossy plastic does, so a strong mirrored highlight on foil is only partly removed. In the synthetic test, about
  half of a strong sheen remains (8.6 → 4.0 L).

## Graphify

Refreshed on this Mac with `graphify update .` (AST only, 0.9.91 under uv in the session scratchpad), on the final code,
and committed with this write-up: 2,834 nodes, 5,969 edges, 163 communities. No `.env*` or `.dev.vars*` files exist in
the checkout. The ignored `work/` folder, holding the photos, the baseline worktree and the evidence, is not in the
graph. Graphify's own deterministic community step rewrote the label signatures; no LLM labeling ran. The dated backup
it writes (`graphify-out/2026-10-21/`) is git-ignored.
