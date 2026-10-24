# Clear plastics: the true colour (diagnosis, design, build)

Branch `claude/clear-plastic-true-color`, off `origin/main` 4bb2c9c (clear stamp cleanliness, PR #45). The diagnosis and
design (§0–§7) were written Oct 24, 2026 with no product code changed; **Freddy's go came the same day and §8 is the
build**, with the acceptance suite of §6 run against a baseline tree. Nothing pushed, merged or deployed; migration 0015
has run only locally.

**The case** is the pinned clear-disc test: Freddy's blue Raptor (Discraft Z) with its stored photo
(`0cef6b2f-….webp`, read once from the live account on Oct 23 with his go-ahead). The copy sits in the ignored
`work/clear-plastic-true-color/input/` of this checkout, with the lab scripts (`lab/`) and every render (`evidence/`).
**Photos, and renders made from them, are never committed.** Links into `work/` open in this checkout and nowhere else.
Every render goes through the real product: the local signed-in harness (`tests/display-harness.mjs`), the stored photo
uploaded as is, the detail panel and the pop-out viewer, Chromium on Metal at 2×. The candidate "after" renders use lab
copies of two modules served in place of the real ones by the test browser (`lab/repro2.mjs`, `lab/repro3.mjs`,
knobs in `localStorage.__lab`): nothing under `public/` was edited.

Freddy's two screenshots were not in the session; the defect was reproduced from his words and matches them (§1).

**Sheets to look at first:**
[sheet-before-after.png](../work/clear-plastic-true-color/evidence/after2/sheet-before-after.png) (today against the
proposal, 3/4 and 7° hyzer, Paper and Midnight),
[sheet-before-after-views.png](../work/clear-plastic-true-color/evidence/after2/sheet-before-after-views.png) (Top and
25° hyzer), [sheet-streak-fix.png](../work/clear-plastic-true-color/evidence/after2/sheet-streak-fix.png) (the cut
alone, and the Game asset look), [sheet-candidates.png](../work/clear-plastic-true-color/evidence/after/sheet-candidates.png)
(the knob). Hex values are printed under each tile.

---

## 0. The premise, checked against the photo

**The ruling stands; the photo data does not refute it.** Median colours by region of the stored texture
(1024 px, after the lighting pass the product runs at Use photo; `lab/sample.mjs`):

| Region of the photo | Colour | Lab L, a, b | What it is |
|---|---|---|---|
| Flight plate, r < 0.6 R, every quadrant | **`#0485a6`** (`#0d85a6` to `#0385a7`) | 51, −18, −26 | the plastic over the white table, two thin walls: a pale teal |
| Rim band, 0.86–0.98 R, 11 of 12 sectors | **`#004388`** (`#003e85` to `#004c9d`) | 29, +11, −44 | the thick rim: a deep, fully saturated royal blue |
| Rim band, the one remaining sector | `#547fba` | 53, +3, −36 | glare on the rim (the pass caps glare, it cannot remove it) |
| `plateColor()`, what Use photo wrote to `color` | **`#0984a8`** | 51, −17, −28 | the harness seed, and per the Oct 23 suite the live copy's colour |

The band is one colour all the way round (ΔE under 4 between sectors, the glare sector apart), so it is the plastic:
not a shadow, not something blue reflected, not stamp. Its hue is bluer than the plate's (HSV 211° against 193°): the
thin plate over white paper lets most of the light through and reads pale and a little green; the rim is many times the
path and shows the dye.

**Two caveats, neither a refutation:**
- **It cannot be derived from the plate colour.** The best per-channel power law `plate^k` (k = 2.15, in sRGB or in
  linear light) lands on `#003e68`, ΔE 17 from the band: the lightness right, the hue wrong (`lab/fit.mjs`). The true
  colour has to be *sampled* from the rim band; `color` alone does not hold it. That validates Freddy's candidate.
- **The streak Freddy sees is lit.** In the viewer the band renders `#2858a9` (HSV 218°, 0.76, 0.66), brighter than the
  texel `#004388` it comes from, because the Photo look draws the photo as an opaque lit surface. "Close to the streak's
  colour" therefore means the *rendered* plate near the *rendered* streak; §4.5 measures exactly that.

---

## 1. Reproduced

`lab/repro.mjs`, pop-out viewer (1200 × 820 css at 2×), light theme, 3/4 view, 7° hyzer, the disc as the viewer opens it
(`evidence/repro/`). "Streak class" counts pixels of hue 215–225°, saturation ≥ 0.5, value ≥ 0.3: the band's colour,
which neither the plate (196°) nor today's shoulder (204°) has.

| Render | Plate (most common colour, inner 45%) | Streak class | What shows |
|---|---|---|---|
| **Raptor, Clear, Photo look** ([3/4 7°](../work/clear-plastic-true-color/evidence/repro/real-light-pop-angle7.png), [Top](../work/clear-plastic-true-color/evidence/repro/real-light-pop-top.png), [Midnight](../work/clear-plastic-true-color/evidence/repro/real-dark-pop-angle7.png)) | `#47bbe6` | **23,406** | the pale teal plate; a saturated blue band hugging the plate's edge at 7–8 o'clock, a sliver at 9 |
| Same, Top | `#47bbe5` | all round, thickest at 7–8 | a blue ring at the plate edge, uneven |
| Raptor, **Opaque**, the same photo ([3/4 7°](../work/clear-plastic-true-color/evidence/repro/opaque-light-pop-angle7.png)) | `#47bbe6` | 23,239 | the same band is drawn, in the plate's own hue: it reads as shading, not a streak |
| Raptor, Clear, **Game asset** look ([3/4 7°](../work/clear-plastic-true-color/evidence/repro/asset-light-pop-angle7.png)) | `#147bb4` | 1,158 | no band: the asset holds print only; the plate is the clear walls at `#0984a8` |
| Lab: the photo mesh shrunk to 0.92 × its radius ([3/4 7°](../work/clear-plastic-true-color/evidence/repro/shrink-light-pop-angle7.png)) | `#2ab8e3` | **125** | **the band is gone**; the pale plate stays |

Where the band sits on screen, by clock sector: 7: 3,595 · **8: 7,151** · 9: 4,625 · 10: 2,116, against 300–600 at
1–3 o'clock. That is the lower-left streak and the 9 o'clock sliver. Midnight shows it the same.

**The Game asset look differs**: no streak, and a deeper plate (`#147bb4` against `#47bbe6`), because its plate is the
clear walls filtering the page, not the photo lit as a surface. Both looks are far paler than the true colour.

---

## 2. Where a clear photo disc's tint comes from today

- **Use photo** (`disc-photo.mjs` `albedoCanvas` → `disc-albedo.mjs` `delightPixels`): the crop's lighting is fitted
  over the plate (r < 0.78 R) and divided out, then **`plateColor()` takes the most common colour over the plate** and
  the sheet writes it to the disc's `color` ("Matched to your photo.", `my-bag.js` `matchPhotoColor`). That is the only
  colour a one-piece mold's photo contributes. `rimColor()` samples an annulus only on overmolds (the opaque rim piece,
  `photo_rim_color`, migration 0011), `bandColor()` only on Halo copies. **Nothing samples the rim band of a one-piece
  clear disc.**
- **The clear material** (`disc3d/clear.mjs`): `color` is read as the transmission of both walls square on
  (`CLEAR.density` 0.5 per wall), each wall filtering what is behind it by `color^(density / cos θ)`: the flat of the
  plate shows the colour itself over the page; the shoulder and rim, seen at an angle, go deeper. Every surface paints
  the same part with the same colour: the viewer (`disc3d/viewer.mjs` `clearPlate.paint(color)`), My Bag and Storage
  (`bag3d/viewer.mjs` `clearDisc`), thumbnails and My Map (`disc3d/atlas-art.mjs`, one wall carrying both walls'
  exponent), the gallery (the same viewer). The whole tint, everywhere, is `color` = the pale plate sample.
- **The Photo look** (`disc3d/photo.mjs`): the photo is drawn on its own mesh over the plate, an opaque lit surface
  wearing a copy of the plate's material with the photo as its colour, plus a relief bump map. On a clear disc it is
  drawn above both walls from above (`CLEAR_ORDER.printAbove`). **Its mesh is a ring out to the shoulder radius `Rs`**
  (`photoGeometry`, `shapeFrame`), and the whole square crop maps onto the disc's diameter: whatever the photo holds
  between its own plate edge and `Rs` is drawn on the model's plate shoulder.

So the plate shows the photo's pale teal, the shoulder and rim show the clear walls in the pale teal, and nothing
anywhere knows the true colour.

---

## 3. The streak, named

**The step:** `photoGeometry()` in `disc3d/photo.mjs` ends the photo at the model's shoulder, `Rs` = **0.850 R** on the
Raptor (`shapeFrame` from the PDGA specs: R 10.65, Ri 8.75, Rs 9.053), while the photo's own flight plate ends short of
that, and off centre. Measured on the texture (`lab/transition.mjs`: the radius where the hue flips from the plate's to
the band's, per 15° sector, outside the stamp's rings):

| Sector of the photo (0° = right, 90° = down) | Plate edge, share of R | Band drawn on the model (edge → 0.85) |
|---|---|---|
| 300–345° (upper right) | 0.834–0.858 | **none**: the edge is outside the mesh |
| 0–120° (right, lower right) | 0.806–0.818 | 3–4% of R |
| **150–255° (left, lower left)** | **0.790–0.804** | **5–6% of R** |
| median | 0.808 | 4% of R |

A circle fitted to that edge (`lab/repro3.mjs`) has radius **0.808 R** and its centre **0.027 R right, 0.014 R down**
of the crop's: the plate edge is a circle, off centre by 3% of R (the photo taken a little off axis, or centred on the
rim's outer edge, which is what the aligner asks for). So the slice of the photo's rim that lands on the model is a
crescent: nothing at 1–2 o'clock, widest at 7–9. Those texels are the rim's `#004388`; drawn as a lit opaque surface
they come out `#2858a9`: the electric-blue streak and the sliver. The relief pass raises them too (their luminance is
far from the plate's), which catches the light along the band's edge.

**Proof:** ending the photo inside its plate edge, and nothing else, removes the blue class from 23,406 to 125 pixels
(§1, the shrink variant), and the cut of §4.3 from 23,298 to **130** at 3/4 and 7°, **5** from the Top
([sheet-streak-fix.png](../work/clear-plastic-true-color/evidence/after2/sheet-streak-fix.png)). On an Opaque copy the
same crescent is drawn (23,239 pixels of the class) in the plate's own hue, so it reads as shading. **Opaque discs are
fenced: no change is proposed for them; this is an observation.**

Not the stamp pipeline (the Game asset look shows no band). Not the clear passes (the Opaque control has the band
too). Not the theme.

---

## 4. The design

Three parts: sample the true colour, carry it to every surface, and end the photo at its own plate edge. Every part is
clear-finish only; opaque discs render byte for byte as today.

### 4.1 Where the true colour comes from: the rim band, with the sampler that exists

On a **one-piece, non-Halo mold**, Use photo samples the outer band of the crop with `rimColor(data, size, 0.88)`: the
overmold sampler as it is (4 rings × 128 angles over 0.89–0.98 R, transparent pixels skipped, a glare ceiling at the
median + 3 MAD, per-channel median). On the Raptor it returns **`#004386`**, and `#004288`–`#004784` for an inner edge
anywhere from 0.84 to 0.92, so it does not depend on where the band starts (`lab/truecolor.mjs`). The glare sector is
taken out by the ceiling, as it is for overmolds.

**Accepted only when it is the plastic seen thicker:** darker than the plate colour by at least 8 L, at least 80% of
the plate's chroma, and within 60° of its Lab hue (the Raptor: 22 L deeper, 1.4× the chroma, 44° of hue). A band that
fails (a photo on a dark table where the rim catches the light; a rim of another colour) gives **no true colour**, and
the disc renders as today. Overmolds (the rim piece is opaque) and Halo copies (the band is the dye) never sample one:
the core's true colour is not in their photo.

The sample is taken whether the copy is Opaque or Clear at the time (as `photo_rim_color` is), so switching finish
later needs no re-shoot and no re-match.

### 4.2 Where it is stored: one column, migration 0015 (specified, not run)

`color` stays the owner's colour, the matched plate colour or their pick. **This design never rewrites it.**

```sql
-- migrations/accounts/0015_photo_true_color.sql
-- The plastic's true colour, sampled from the photo's rim band on a one-piece mold (docs/clear-plastic-true-color.md).
-- NULL until a photo is matched for it; never inferred from `color`.
ALTER TABLE bag_discs ADD COLUMN photo_true_color TEXT
 CHECK(photo_true_color IS NULL OR (length(photo_true_color)=7 AND substr(photo_true_color,1,1)='#' AND substr(photo_true_color,2) NOT GLOB '*[^0-9a-fA-F]*'));
```

It travels exactly as `photo_rim_color` does: set with the photo (`PUT …/photo`, header `X-Atlas-Photo-True-Color`,
validated as a six-digit hex in `workers/textures.mjs`), cleared with it (`DELETE …/photo`), in the Worker's bag field
list (`workers/bag.mjs`), and out through `my-bag.js` `detailAppearance`, `disc3d.js` `sync`, `all-discs-gallery.js`,
`bag3d/bag-layout.mjs` placements and `atlas-map.js` thumbnail hosts (`data-true-color`). **Apply 0015 remotely before
the Worker that reads it deploys**, as 0014 was.

### 4.3 How it reaches every render surface

**The streak fix, for every clear disc with a photo, automatic.** In `disc3d/photo.mjs` `acquirePhoto`, on a clear
finish, once per photo load (the banded pixel pass that already builds the relief; this runs on the 1024 texture):
1. **The photo's own plate colour** `P`: `plateColor()` on the decoded crop, the function Use photo ran (the Raptor:
   `#0984a8`).
2. **Find the plate edge**: at 256 angles walk inward from the crop's edge until six consecutive samples are within
   ΔE 16 of `P`; **fit a circle** to those points, twice, dropping points more than 1.2% of R off it (the Raptor: 252 of
   256 kept, radius 0.808 R, centre off by 0.027, 0.014 R). A per-angle edge alone is not enough: where the photo's glare
   band crosses the plate edge the walk goes deep, and smoothing left a notch at 1 o'clock
   ([the first cut, Top](../work/clear-plastic-true-color/evidence/after/A70-light-pop-top.png)); the circle does not
   ([cut, Top](../work/clear-plastic-true-color/evidence/after2/cut-light-pop-top.png)). The plate edge of a disc *is* a
   circle, moved by the shot; that is the right model.
3. **Fade the alpha** to nothing over 2% of R outside that circle. The clear walls show through where the photo ends, in
   the tint's own deepening. The relief is built from the cut texture, so it loses the band too.

This changes no colour: with today's `color` the plate renders `#2ab8e3`, within noise of today's `#47bbe6` by the
plate measure, and the shoulder is untouched (`#075c95` against `#085c95`). It is a defect fix, so it applies to every
clear photo disc on load, as PR #45's cleanliness did. Opaque discs never enter it.

**The tint.** Wherever a clear part is painted today with `color`, it is painted with `photo_true_color ?? color`:
`disc3d/viewer.mjs` (panel, pop-out, gallery), `bag3d/viewer.mjs` `clearDisc` (pockets, pulled out, Storage racked and
pulled, Lost), `disc3d/atlas-art.mjs` (list thumbnails, My Map). **With a true colour the walls' exponent is `a / 2` per
wall** instead of 0.5, so the flat of the plate shows `T^a`, a step lighter than the true colour, and the shoulder and
rim deepen toward `T` and past it with the path length, as the material already does. Without a true colour nothing
changes: 0.5 and `color`, as today. That the exponent follows the true colour and not the finish matters: applied
blindly it would lift the clear Buzzz (no photo, the owner's pick `#b99bdd`) from `#b689fb` to `#caa4ff`
([sheet-buzzz.png](../work/clear-plastic-true-color/evidence/after/sheet-buzzz.png)). The stamp, a Halo band and an
overmold's rim piece are untouched.

**The Photo look's plastic** (clear finish with a true colour only), in the same `acquirePhoto` pass, before the cut:
**retint the plastic, not the print.** Every texel within ΔE 10 of `P` is multiplied, per channel, by `T^a_photo / P`
(texels at ΔE 25 and beyond are left alone, smooth between). The red foil, the navy ink, a white ink keep their colour;
the plate, the shadow copies and the scuffs move with it, as the plastic they are. The texture cache key takes the
tint, so a disc whose true colour changes reloads its photo. `photoSurface` gets `tint` from the surface that owns it,
beside `like`; for every other disc `acquirePhoto` is the function it is today. The Game asset look needs none of
this: its plate is the walls.

**Two exponents, not one.** The Photo look lights the plate as a surface, the walls filter the page: at the same `a`
the Photo look lands lighter (`#298bd9` against `#1553ab` at a = 0.7, ΔE 26;
[sheet-looks.png](../work/clear-plastic-true-color/evidence/after/sheet-looks.png)). So the photo's retint takes its
own exponent, `a_photo`, set so the two looks land together: **`a_photo` = 1.0 with the walls at `a` = 0.7** puts the
Photo look's plate at `#2965b8` and the Game asset's at `#1553ab`, ΔE 8.7, both within ΔE 6 of the streak's own colour.

### 4.4 Existing clear discs: nothing silent

- **The streak fix is automatic** for every clear photo disc, on its next load. It removes a defect and changes no
  colour.
- **The colour is the owner's click.** A clear disc saved before 0015 has `photo_true_color` NULL and keeps today's tint
  until its owner acts. The sample needs the stored photo's pixels, which only the browser can read, so it is taken at
  one of these moments, and the sheet says what happened:
  - **Use photo** (a new or replaced photo): sampled with the plate colour, stored with the photo. The hint on a Clear
    copy: *"Matched to your photo: the plate's colour, and the plastic's true colour from the rim."*
  - **Make the Game asset** (one click, v3.1): the make already fetches and decodes the stored photo; it samples the
    true colour in the same pass and saves it beside the asset. The status line: *"Full-color asset made. The plastic's
    true colour matched from your photo."* Freddy's Raptor, already on Clear, gets its true colour the next time he
    makes its asset.
  - **A "Match the plastic's colour" button** in the sheet on a Clear copy with a photo and no true colour yet, for an
    owner who keeps the Photo look. It fetches the stored photo, samples, and PATCHes the column. The one piece of new
    UI; Freddy may drop it and keep the two above.
- No re-make of the photo, the texture or the asset is needed, and none happens on its own. Switching finish does not
  touch the column; it is read only when the finish is Clear.

### 4.5 The knob, measured

Rendered through the lab modules on the true-colour copy (`#004388`), pop-out, light, 3/4 and 7° hyzer
(`evidence/after/`, `evidence/after2/`; [sheet-candidates.png](../work/clear-plastic-true-color/evidence/after/sheet-candidates.png)).
The streak's rendered colour is `#2858a9` (L 46). L is Lab lightness.

| Candidate | Plate, Photo look | Plate, Game asset look | Shoulder at 7:30 | ΔE plate → streak | Streak class |
|---|---|---|---|---|---|
| **Today** (`color` `#0984a8`) | `#47bbe6` (L 71) | `#147bb4` (L 49) | `#085c95` (L 38) | 49 | 23,298 |
| a = 0.6 | `#299ce6` (L 62) | – | `#093f94` | 30 | – |
| a = 0.7 | `#298bd9` (L 56) | `#1553ab` (L 37) | `#09378d` (L 26) | 22 | – |
| a = 0.85 | `#2977c8` (L 49) | – | `#0b3085` | 13 | – |
| a = 1 (flat, walls too) | `#2965b8` (L 43) | `#153c95` (L 28) | `#415995` | 5.5 | – |
| **Proposal: `a_photo` 1.0, walls 0.7** | **`#2965b8` (L 43)** | **`#1553ab` (L 37)** | **`#09378d` (L 26)** | **5.5 / 5.1** | **130** |

The proposal, in the other views ([sheet-before-after-views.png](../work/clear-plastic-true-color/evidence/after2/sheet-before-after-views.png)):
Top, plate `#3b6cba`; 25° hyzer, plate `#1759a8` and shoulder `#05348a`; Midnight, plate `#2965b8` and the Game asset's
`#2a4a86`. In each the shoulder is a smooth ring, 17 L deeper than the plate at 7°, and the streak class is under 150
at every angle. The a = 1 row with the walls at a = 1 as well is the "one flat colour" overshoot: the shoulder
(`#415995`) sits *lighter* than the walls do at 0.7, and the thickness difference goes.

**Proposed: `a_photo` 1.0, walls 0.7.** Two constants, both Freddy's to move from the sheet.

---

## 5. Alternatives killed

| Alternative | Why not |
|---|---|
| **Derive the true colour from `color`** by a power law (no column, automatic for every disc) | ΔE 17 at best; the hue is wrong (§0). |
| **Overwrite `color` with the rim sample** on a clear copy (no column) | Silently changes the owner's colour, the picker's swatch and the atlas's bag colours; a hand-picked colour would be lost; and the Photo look needs the plate colour `P` anyway. |
| **Sample at render time** from the texture (no column) | The Game asset look, the bag's pocket tier and the list thumbnails do not hold the photo at the right moment, and every surface would pay a pixel pass per load. |
| **One flat colour** (walls and photo at a = 1) | Rendered in §4.5: the plate at the rim's colour, the thickness difference gone. Freddy's correction of Oct 24, 16:52. |
| **One exponent for both looks** | The looks land ΔE 26 apart at a = 0.7 (§4.3): a lit surface and a filter are not the same thing. |
| **Shrink the photo mesh** by a constant (the lab's proof variant) or move `Rs` | Cuts a fixed ring: on the Raptor it needs 8% to clear the eccentric edge everywhere and takes plate with it on the other side; `Rs` is right for the stamp and the opaque Photo look. |
| **A per-angle edge, smoothed** (the first lab cut) | Notches where the glare band crosses the plate edge (§4.3). The circle fit replaces it. |
| **Cut the photo at upload** (alpha in the stored WebP; the validator admits alpha) | Changes the stored photo, which the sheet promises stays as taken; existing photos would be re-encoded lossy to get it. |
| **Chroma-key the band out by colour** everywhere | Takes the glare band's pale pixels and foil near the edge with it; the inward walk from the crop's edge, bound to a circle, is the safe form of the idea. |
| **Retint in the shader** instead of once at load | The same arithmetic per frame on every surface; a load-time pass costs once per photo and leaves the materials as they are. |
| **three.js transmission** | Killed in PR #44: cost, and it cannot see the page. |

---

## 6. Acceptance test for the build

A browser suite on the local harness (`tests/clear-true-color-browser.mjs`), the Raptor's photo from `work/` as the
clear suite reads it, the pop-out's drawing buffer at 2×:

1. **The streak fix alone** (the clear Raptor with `photo_true_color` NULL): the streak class (hue 215–225°, sat ≥ 0.5,
   val ≥ 0.3) under 500 pixels at 3/4 7° hyzer, Top and 3/4 25° hyzer, light and Midnight (today 23,406 / 15,315 at
   Top); the plate's most common colour within ΔE 6 of today's; the shoulder ring at 7:30 within ΔE 3 of today's.
2. **Close to the true colour** (the Raptor with its true colour stored): the plate's most common colour within ΔE 10 of
   the chosen candidate's value in §4.5, and within ΔE 12 of the streak's rendered colour `#2858a9`.
3. **Rim deeper than plate, and no stripe**: from the Top, the ring just inside the shoulder has every 30° sector's
   median within ΔE 16 and 12° of hue of the ring's median (the band was a hue of its own, 218° against the plate's
   196°, and ΔE 25–50; the photo's own glare band, scuffs and stamp rings move a sector by ΔE 10–12 on their own, which
   is why the design's ΔE 8 was loosened in the build); at 3/4 7°, the shoulder ring at 7:30 at least 10 L deeper than
   the plate.
4. **Both looks agree**: the Game asset look's plate within ΔE 12 of the Photo look's in the light theme and ΔE 20 on
   Midnight (there the walls filter a dark page while the photo is lit as a surface, so the looks sit a step apart).
5. **Fences**: the Opaque Raptor with the same photo, every view, pixel-identical to main; the clear Buzzz with no photo
   pixel-identical to main; opaque extraction byte-identical (the clean-stamp identity script); the clear Raptor's clean
   asset byte-identical to main's (the stamp path is not touched).
6. **Storage**: 0015 leaves every row NULL; the photo PUT stores the header's value and the DELETE clears it; a bad
   value is refused; another player cannot read it; a copy switched Opaque → Clear → Opaque keeps it; an overmold's and
   a Halo copy's photo store none.
7. **The sampler**: `rimColor(data, 1024, 0.88)` on the Raptor's texture returns `#004386`; the acceptance rule of §4.1
   admits it and refuses a synthetic photo whose rim is lighter than its plate.
8. **Before/after sheets** written by the suite (main's modules against the build's, the same pose, hex values printed
   under each tile) for the Raptor and for a second clear disc, at 3/4 7°, Top and 25°, light and Midnight.

**The second disc is still needed.** The only other photos on this Mac (the Oct 13 Destroyer and DD3 from the stamp-assets
work) are of Star plastic, opaque: no rim band to sample. Freddy supplies one clear or tinted disc photo (any brand) for
the build's sheet; the design does not depend on it, the acceptance does.

---

## 7. Left for Freddy

- **The two knobs** (§4.5): `a_photo` 1.0 and walls 0.7 are proposed, from the sheets.
- **Where existing discs get their true colour** (§4.4): the Game asset make alone, or with the button.
- **A second clear-disc photo** for the build's acceptance.
- His two screenshots, to set beside [real-light-pop-angle7.png](../work/clear-plastic-true-color/evidence/repro/real-light-pop-angle7.png).

## What was run for the diagnosis

| Check | Result |
|---|---|
| `lab/sample.mjs`, `lab/transition.mjs`, `lab/fit.mjs`, `lab/truecolor.mjs` on the stored photo | the numbers of §0, §3 and §4.1 |
| `lab/repro.mjs`: the harness, Opaque and Game-asset controls, the shrink variant, both themes | `evidence/repro/`, §1 |
| `lab/repro2.mjs`: lab `photo.mjs` (retint, per-angle cut) and `clear.mjs` (exponent) served in place of the real ones; the sweep | `evidence/after/`, §4.5 |
| `lab/repro3.mjs`: the circle-fit cut and the proposal, both themes, three views; the Game asset made in one click (9.6 s) | `evidence/after2/`, the sheets |
| `lab/analyse.mjs` / `lab/probe.mjs` / `lab/sheet.mjs` / `lab/crop.mjs` | every hex value above |

---

## 8. The build (Oct 24, 2026)

Built as §4 says, with two constants where the design left knobs: `CLEAR.trueDensity` 0.35 (the walls at a = 0.7) and
`CLEAR.truePhoto` 1 (the Photo look's plastic), both in `disc3d/clear.mjs`. Freddy's eye moves them. The "Match the
plastic's colour" button of §4.4 was not built: Use photo and the one-click Game asset are the two ways a copy gets its
true colour.

**What changed**

| Where | What |
|---|---|
| `migrations/accounts/0015_photo_true_color.sql` | the column, as specified in §4.2; run locally only |
| `workers/textures.mjs`, `workers/bag.mjs` | `PUT …/photo` stores the `X-Atlas-Photo-True-Color` header (six-digit hex or nothing), `DELETE` clears the column, and a new `PATCH …/photo` `{photo_true_color, texture_key}` lets the one-click make store what it read from the photo it names (409 when the photo was replaced meanwhile); the bag's field list carries it |
| `disc-albedo.mjs` `trueColor()` | the sampler of §4.1: `rimColor` at 0.88 R, accepted when deeper by 8 L, at least 80% of the plate's chroma and within 60° of its hue; the Raptor gives `#004386` |
| `disc-photo.mjs` | Use photo samples it on a one-piece mold (with the plate colour, before the glare pass) and the sheet stores it for every copy but a Halo's; the one-click make reads it from the decoded stored photo (`storedTrueColor`) and PATCHes it after the asset saves, the status line saying so |
| `my-bag.js` | the header on save, the colour hint *"Matched to your photo: the plate's colour, and the plastic's true colour from the rim."*, the finish hint's last sentence, the row and detail thumbnails, the viewer's appearance, and the row updated when a make stores the colour |
| `disc-photo-clear.mjs` (new) | the clear photo's pixel work, pure: the plate-edge walk and robust circle fit (`plateEdge`), the retint gains and the feathered cut (`applyClearPhotoRows`), in rows so the page can yield between bands |
| `disc3d/photo.mjs` | `acquirePhoto` takes `clear` and `tint`; on a clear copy the decoded crop goes through the pass above (banded, like the relief) and the cache key carries the tint |
| `disc3d/clear.mjs` | `clearTint()` picks the tint and its per-wall exponent (`photo_true_color` with `trueDensity`, never on an overmold; else `color` with `density`); `clearPart.paint` takes the exponent and `clearRig.walls` keeps it |
| `disc3d/viewer.mjs`, `bag3d/viewer.mjs`, `bag3d/bag-layout.mjs`, `disc3d/atlas-art.mjs`, `disc3d/thumbnails.mjs`, `atlas-map.js`, `disc3d.js`, `all-discs-gallery.js` | the tint and the photo options on every surface, plumbed as `photo_rim_color` is (`data-true-color` on thumbnail hosts, `trueColor` on bag placements) |
| `tests/photo-true-color.mjs` (new), `tests/clear-true-color-browser.mjs` (new), `npm run test:true-color` | the suite of §6 |

Opaque discs never enter the photo pass and keep `density`: the stamp pipeline (`disc-stamp-*.mjs`) was not touched.

**The acceptance suite, run on this Mac** (Chromium on Metal, 2×; `tests/clear-true-color-browser.mjs` with the
baseline tree `work/clear-plastic-true-color/baseline`, a detached checkout of `origin/main` 4bb2c9c):

| §6 check | Result |
|---|---|
| 1. The streak fix alone (no true colour): streak class at 3/4 7°, Top, 25°, light and Midnight | **130 / 5 / 205 / 44 / 4 / 127** pixels (the baseline: 23,298); plate `#46bbe5`, the Opaque copy's exactly |
| 2. Close to the true colour | plate **`#2a66b6`**, ΔE 2.0 to the proposal's `#2965b8`; L 43 against 71 without it |
| 3. Rim deeper than plate, no stripe | shoulder `#11479c` (L 29) under the plate; every Top sector within the rule |
| 4. Both looks | Game asset `#1754aa` (light) and `#2b4b85` (Midnight) with the Photo look's `#2a66b6` / `#2a66b6` |
| 5. Fences | the Opaque Raptor with the same photo and the clear Buzzz with no photo **pixel-identical** to the baseline; the stamp pipeline untouched |
| 6. Storage | the unit suite: PUT header, PATCH for the named photo (409 on a replaced one, 400 on a bad value, 404 for another player), DELETE clears, a finish change keeps it; 0015 leaves every row NULL and refuses anything but a six-digit hex |
| 6. The sheet | Use photo on the Raptor's PNG stored `#00428c` and said so; the one-click make on the copy without a true colour stored `#004386` and said *"The plastic's true colour matched from your photo."*; the row's thumbnail host carries it |
| 7. The sampler | `#004386` on the Raptor's texture, stable for an inner edge from 0.84 to 0.92; a lighter, a grey and a red rim refused on a synthetic crop; the plate edge found as a circle at 0.808 R, 3% off centre |
| 8. Sheets | [sheet-before-after.png](../work/clear-plastic-true-color/evidence/suite/sheet-before-after.png) (the baseline, the cut alone, the true colour in both looks), [sheet-views.png](../work/clear-plastic-true-color/evidence/suite/sheet-views.png) (Top, 25°, Midnight) |
| Existing suites | `photo-textures` (unit, with `photo-editor-races`), `bag`, `bag-values`, `disc-stamp-clear`, `halo-plastic`, `photo-stamp-sync`: 93/93; `clear-plastic-browser`: every check; eslint clean on the changed files |

**Still Freddy's:** the two constants, from the sheets; a second clear-disc photo for the suite's `SECOND_PHOTO`
(the Destroyer and DD3 on this Mac are opaque Star plastic); and the deploy order, 0015 remotely before the Worker.

### Codex review on PR #46 (fixed)

Codex reviewed the PR as it opened and left two findings. Both were checked in the source and were real: §4.3 named
Storage, Lost and My Map among the surfaces, but the build had plumbed `bag3d/viewer.mjs` and the thumbnails, and
those three scenes take other paths.
1. **My Map** draws a bagged disc from `my-bag.js` `publishBagColors()` through `atlas-map.js` `photoDisc()`, which
   carried colours, photos, Halo data and the finish, not the true colour. Both now carry it (`mapTrueColors`, in the
   map's invalidation key), so a clear disc on My Map wears the same tint as its list thumbnail and its viewer.
2. **Storage and Lost** draw through `collection-scenes.js` → `collection3d/racks.mjs` or `graveyard.mjs` →
   `collection3d/stage.mjs` `discModel()`, which painted the clear walls with the plate colour and gave `photoSurface`
   neither `clear` nor `tint`: the pulled Storage disc and a Lost disc kept the streak and the pale tint. The adapters
   now pass `trueColor`; `discModel` paints the walls through `clearTint()` and cuts and retints the photo; the racked
   copies (instanced, one shared part) keep their tint as the instance colour and take a batch of their own,
   `'|clear:true'`, on a second shared part read with the true colour's exponent.

The suite gained the checks: My Map's adapter returns the bagged copy's true colour; Storage racks three batches for
an opaque Raptor, a clear one and a clear one with a true colour; the pulled Storage disc shows no streak and wears
the true colour (its plate against the copy without one).
