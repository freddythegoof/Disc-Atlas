# Non-overmold photo discs must not grow a rim

Branch `codex/non-overmold-photo-edge`, from `main` at `0dedf8a` (the PR #8 merge). October 16, 2026.
Freddy's report, from the deployed PR #7 build: his 30-stamp Wraith reads as if a rim was added (the
pattern changes near the edge instead of running to it), and his Halo Star Wraith in Storage renders its
edge band like an overmold rim. His rule: no overmold unless the PDGA says so, however the photo looks.

## What it was

All three surfaces (detail panel, My Bag's pulled disc, Storage's pulled disc) draw the photo from the
same mesh, `photoGeometry()` in `public/disc3d/photo.mjs`. The photo is mapped top-down onto the
disc's whole diameter, but the mesh it is drawn on stopped at **`Rs`, the shoulder**, on one-piece discs.
On a Wraith that is 0.827 R. Past it, the shoulder slopes down to the nose (0.827 R → R, 1.8 cm), and
nothing drew the photo there, so it showed bare plate-coloured plastic. From the top that ring is
about a third of the disc's area (1 − 0.827² = 32%). The plate colour is the one the editor measures
from the photo (`#d1d2d3` for the stamp fixture, `#6c339e` for the halo), so the ring looked like a
piece of plastic in its own colour: a rim.

The mechanism, checked against the alternatives the brief listed:

| Candidate | Finding |
|---|---|
| Photo radius | **The cause.** The photo mesh reaches 0.8274 R on both Wraiths (`Rs/R`); the photo's own outer annulus, 0.827–1.0 R, is never drawn. |
| Material split | None. Both Wraiths have `overmold:false` and one material in the panel, bag and rack. `photo_rim_color` is null, since no rim was sampled at upload. |
| Relief step at the seam | None. The photo mesh hugs the top (+0.003 cm) and the relief map only covers the photo. The "rim" is just the shoulder's own shading, in plate colour. |
| Classification | Correct. The Wraith is not on the overmold list, and the Pixel is. |

Why the halo looked like an overmold in particular: its band starts at 0.80 R, so the photo drew a thin
sliver of it (0.80–0.827 R), and then the plate-purple shoulder took over. That gives purple, a thin
lilac line, then a purple outer ring: the silhouette of a rim piece in a second colour.

The measurement: brightness around rings of the top-view render. Each cell is the ring's mean colour and
how many times its brightness crosses its own mean (the stamp's stripes cross dozens of times; plain
plastic doesn't cross).

| Ring | Stamp, panel, before | Stamp, panel, after | Halo, panel, before | Halo, panel, after |
|---|---|---|---|---|
| 0.80 R | `#aea6a3` · 68 | `#aea6a3` · 68 | `#ba8eeb` · 0 | `#ba8eeb` · 0 |
| 0.88 R | `#f3f4f5` · **0** | `#b4a78a` · 50 | `#9657d3` (plate) | `#fae8fa` (band) |
| 0.94 R | `#f0f1f2` · **0** | `#9d9d9d` · 46 | `#9b63d4` (plate) | `#f6e6f7` (band) |
| 0.97 R | `#eeeff0` · **0** | `#a19d8b` · 58 | `#8e4dc9` (plate) | `#f6e5f7` (band) |

The bag's pulled disc reads the same (stamp 0 → 48/46/50 crossings; halo `#9048cc` → `#fae7f8` at 0.88 R).
All numbers are in [metrics.json](assets/non-overmold-photo-edge/metrics.json).

## The fix

`photoGeometry(shape, {overmold, edge})`. With `edge` on a one-piece disc, the photo mesh follows the
disc's real top profile: the dome out to the shoulder as before, then the profile's own shoulder points
(`topProfile()`, new in `shape.mjs`, from the same trace the lathe spins) down to the nose. The UV of
each vertex is still its own top-down position, so the shoulder takes the photo's outer annulus: the
pixels the camera actually saw there. The photo's edge pixels carry the face to the edge. Nothing is
invented or stretched, and the photo's own transparent edge feather still ends at the nose.

Two details keep it seated on the slope:
- Each vertex stands off the surface along the profile normal, 0.003 cm as before, plus its own chord
  sag (`R(1 − cos π/64)` ≈ 0.013 cm) where the surface faces outward. Between vertices it then never
  dips under the disc mesh on the shoulder, whatever the disc mesh's own segment count (20–80).
- Normals come from the profile analytically, so the scene lights the band over the shoulder exactly as
  it lights the plastic.

Overmold discs ignore `edge`: the same code path, the same arrays, photo stops at `Ri`. Callers that
pass `edge: true`: the detail viewer (panel + pop-out), the bag (pocket photo and pulled detail photo)
and the Storage/Lost collection models. **The atlas does not** (`atlas-art.mjs` untouched, per the
brief), so the top-down atlas images (My Map's photo discs and the My Bag list thumbnails) still
stop at the shoulder. Extending it there is a one-word change, but it touches the atlas and needs the
perf gate rerun, so it's left as a follow-up.

Nothing else moved: no classification change, no stored data, no upload pipeline change, and
`public/data.json` is untouched. Freddy's existing photos render the new way as soon as this deploys.

## Screenshots

Fixtures, uploaded through the real editor on a local Wrangler + D1:
[stamp](assets/non-overmold-photo-edge/fixture-stamp.png) (Wraith: diagonal stripes and a "30"
running to the physical edge), [halo](assets/non-overmold-photo-edge/fixture-halo.png) (Wraith: purple,
a pale band from 0.80 R to the edge), [pixel](assets/non-overmold-photo-edge/fixture-pixel.png) (Pixel
control: orange plate to the seam, a dark rim piece). Before is the pre-fix `photo.mjs` from `0dedf8a`,
served in place of the working copy in the same run, on the same GPU.

### (a) Full-front stamp, Wraith

| | Before | After |
|---|---|---|
| Panel, 3/4 | ![](assets/non-overmold-photo-edge/before-stamp-panel-angle.png) | ![](assets/non-overmold-photo-edge/after-stamp-panel-angle.png) |
| Panel, top | ![](assets/non-overmold-photo-edge/before-stamp-panel-top.png) | ![](assets/non-overmold-photo-edge/after-stamp-panel-top.png) |
| My Bag, pulled | ![](assets/non-overmold-photo-edge/before-stamp-bag-pulled.png) | ![](assets/non-overmold-photo-edge/after-stamp-bag-pulled.png) |
| Storage, pulled | ![](assets/non-overmold-photo-edge/before-stamp-storage-pulled.png) | ![](assets/non-overmold-photo-edge/after-stamp-storage-pulled.png) |

### (b) Halo band, Wraith

| | Before | After |
|---|---|---|
| Panel, 3/4 | ![](assets/non-overmold-photo-edge/before-halo-panel-angle.png) | ![](assets/non-overmold-photo-edge/after-halo-panel-angle.png) |
| Panel, top | ![](assets/non-overmold-photo-edge/before-halo-panel-top.png) | ![](assets/non-overmold-photo-edge/after-halo-panel-top.png) |
| My Bag, pulled | ![](assets/non-overmold-photo-edge/before-halo-bag-pulled.png) | ![](assets/non-overmold-photo-edge/after-halo-bag-pulled.png) |
| Storage, pulled | ![](assets/non-overmold-photo-edge/before-halo-storage-pulled.png) | ![](assets/non-overmold-photo-edge/after-halo-storage-pulled.png) |

### Control: Pixel (true overmold)

| | Before | After |
|---|---|---|
| Panel, 3/4 | ![](assets/non-overmold-photo-edge/before-pixel-panel-angle.png) | ![](assets/non-overmold-photo-edge/after-pixel-panel-angle.png) |
| Panel, top | ![](assets/non-overmold-photo-edge/before-pixel-panel-top.png) | ![](assets/non-overmold-photo-edge/after-pixel-panel-top.png) |
| My Bag, pulled | ![](assets/non-overmold-photo-edge/before-pixel-bag-pulled.png) | ![](assets/non-overmold-photo-edge/after-pixel-bag-pulled.png) |
| Storage, pulled | ![](assets/non-overmold-photo-edge/before-pixel-storage-pulled.png) | ![](assets/non-overmold-photo-edge/after-pixel-storage-pulled.png) |

The Pixel's photo mesh is byte-identical before and after (FNV hash `cdc4fef9` over positions, UVs,
normals and index; photo stops at 0.9057 R = its seam; rim `#101418` = its stored sample). Its renders:

| Surface | Max channel difference | Pixels that moved |
|---|---|---|
| Panel 3/4 | 0 | 0 of 69,300 |
| Panel top | 1 | 7 of 37,636 |
| My Bag pulled | 0 | 0 of 177,241 |
| Storage pulled | 1 | 6 of 48,400 |

The one-level, single-digit-pixel differences are GPU noise on the same mesh (the brief's "not a pixel"
holds for the geometry; the GPU canvas is not pixel-deterministic, as noted for Plan 16).

## Cost

The photo mesh of a one-piece disc goes from 2,048 to 3,840 triangles (64 segments × 30 profile steps
in place of 64 × 16). Overmold photos stay at 2,048, and photo-less discs have no photo mesh. That's
the only per-frame change: no shader, texture, tier or pixel-ratio change, so PR #6's photo tiers
(256/512/1024) and the pulled disc's detail look are as they were (`test:bag:pulled-quality` green).
Measured in the panel at the 1024 tier, 120 forced frames closed by a pixel read, RTX 3070:
0.044–0.047 ms per frame before, 0.058–0.062 ms after, inside run-to-run noise (other runs: 0.045–0.080).
In the bag, each one-piece photo disc adds 1,792 triangles, about 43k for a bag of 24 photo discs.

## Tests

- `npm run test:photo-edge` (new, `tests/non-overmold-photo-edge-browser.mjs`, about 65 s): the three
  fixtures in all three surfaces, before and after in one run. It asserts stripes cross every ring from
  0.88 R to 0.97 R (≥ 20 times), the halo's outer rings are the band's colour (every channel ≥ `0xc8`),
  the Wraiths stay one piece with one material and no rim sample, and the before half reproduces the
  plain ring. For the Pixel: the mesh hash is identical, the rings read the same, the rim is the stored
  sample, and no surface moves more than 0.2% of pixels by more than 8 levels. `EDGE_BEFORE=0` skips the
  before half; `EDGE_BASE` names another pre-fix commit.
- `test:photo-textures` (the suite that owns `photoGeometry`): for the Wraith, Destroyer and Aviar
  (driver, driver, putter), the `edge` photo reaches the nose (1.000–1.002 R) and its UV reaches the
  photo's edge. Every vertex sits on or above the top profile, and every triangle faces the way its
  normals do. Without `edge` it still stops at the shoulder. For the Pixel and the Atlas, `edge` gives
  the same arrays as before. Results:
  [edge-geometry.json](assets/non-overmold-photo-edge/edge-geometry.json).
- Existing suites on this branch, run one after another on the RTX 3070: `test:photo-textures`,
  `test:photo-rim`, `test:disc3d`, `test:bag`, `test:bag:pulled-sizing`, `test:bag:pulled-quality`,
  `test:bag:overmold`, `test:bag:collections`, `test:bag:browser`, `test:bag:scene` and `test:appearance`
  are all green. `test:bag:scene` failed once with `clock.pauseAt: Cannot fast-forward to the past`
  (`tests/bag-scene-browser.mjs:99` pauses the fake clock 50 ms ahead of a `Date.now()` read, which a slow
  step can overrun). That's a race in the test, not in the photo code, and it passed on both reruns.
  The atlas suites and perf gate were not run: atlas code is unchanged.

One `test:photo-edge` run (of eight) timed out in fixture setup, with the add-disc dialog never closing
after Save, before any change was exercised. The next run passed. It now saves a failure screenshot and
the dialog's text if it recurs.

## Freddy's feel check after deploy

- 30-stamp Wraith: the pattern runs to the edge, with no added rim.
- Halo Wraith in Storage: the band is the photo's own, with no purple outer ring.
- Pixel: unchanged, with its black overmold rim.
- Known, by design for now: the small list thumbnail and My Map still stop at the shoulder (atlas).
