# Photo cleanup: only the disc survives

Branch `codex/photo-edge-cleanup`, from `main` at `38a8c4a` (the PR #9 merge). October 16, 2026.

Freddy's feel check of PR #9: the one-piece edge fix works on his Wraith, but his photo of it wasn't
perfectly aligned, and bits of his fingers and the table show baked into the texture. Then, on the same
build, his Destroyer shows his fingers and his DD3s read misaligned, where before PR #9 they looked clean.
His ruling: people take imperfect photos; take the stuff out automatically; only the disc matters. And
"more like it was before, but just include these fixes": keep the Wraith win, restore the clean look, and
heal the photos already stored **without re-upload**.

## What it was (characterization)

`tests/photo-cleanup-characterize-browser.mjs` draws four phone-like photos (`tests/photo-cleanup-fixtures.mjs`:
a disc on a busy wood table, lit from the upper left, with a soft shadow, a darker shoulder and a glare arc),
runs them through `preparePhoto()` exactly as the aligner's Use photo does (the upload is byte-equal to it,
`test:photo-textures`), and compares the stored WebP with ground truth: for every texture pixel, where in the
photo the aligner took it from, and whether that is disc, table or finger.

| Fixture | Framing | Class | Foreign in the stored texture, by ring | Shown before PR #9 | Shown after PR #9 |
|---|---|---|---|---|---|
| DD3, blue | 2% of the photo right, 1% up, 3% large | **Misalignment**: a crescent of table inside the crop; the disc itself cut on the far side | table 6% at 0.88 R, 29% at 0.91, 44% at 0.94, 56% at 0.97 | 0% | 7.6% of the disc |
| Leopard, red | centred, 7% large | **Misalignment** (generous circle): a ring of table all round | table 17% at 0.91 R, 100% from 0.94 R | 0% | 12.3% |
| Destroyer, purple | exact | **Occlusion at the rim**: two fingers and a thumb on the outer annulus | skin 1% at 0.85 R, 4% at 0.88, 8–9% from 0.91 R | 0% | 1.8% |
| Thunderbird, green | exact | control | none | 0% | 0% |

![](assets/photo-edge-cleanup/fixture-misaligned.jpg) ![](assets/photo-edge-cleanup/truth-misaligned.png) ![](assets/photo-edge-cleanup/truth-generous.png) ![](assets/photo-edge-cleanup/truth-fingers.png)

(Fixture photo; then each stored texture with its ground truth: table magenta, fingers cyan.)

Every foreign pixel lies outside the shoulder (`Rs` is 0.81 R on the DD3, 0.82 on the Destroyer, 0.88 on the
Leopard). That is exactly why Freddy's discs looked clean before PR #9 and not after: the shoulder cut-off
was hiding the outer annulus, and PR #9 put it on view. PR #9 damaged nothing; it exposed what was baked in.
The DD3 symptom ("misaligned") is the same bake: the disc's centre sits at (−0.072, 0.027) of the crop, so
its stamp is off centre on the model, and the crescent shows on one side of the shoulder. Numbers:
[characterize.json](assets/photo-edge-cleanup/characterize.json).

## The fix

### Load time: stored textures heal for display (`public/disc3d/photo-clean.mjs`)

`acquirePhoto()` (photo.mjs) is the one loader behind every surface: the detail viewer and pop-out, My Bag's
pocket and pulled discs, Storage and Lost, the list thumbnails and My Map (atlas art). Each stored photo now
gets a **cleanup plan**, made once per stored texture (its URL names its version) from a 256 px read of the
stored WebP, and shared by every size and surface. A photo the plan leaves alone decodes exactly as before;
a changed one is drawn from the plan at its tier. Plans and cleaned images are made in a module worker
(`photo-clean-worker.mjs`), with the same functions on the main thread as a fallback. Nothing stored
changes, and the plan is a pure function of the stored pixels (seeded RANSAC, no clocks, no randomness).

1. **The disc's real edge.** Along 180 rays from the centre, colour steps where the inside is the disc's
   own colour and the outside is a colour the disc's face never shows. A disc is a rigid circle, so its edge
   is the one circle that many rays agree on: a seeded RANSAC over the steps, scored so that a ray that
   should see the edge and does not costs two that do, then a least-squares fit (algebraic, then
   Gauss-Newton on geometric distance, which removes the algebraic fit's pull toward small circles on a
   partial arc). "The face's colours" is a chromaticity histogram of the middle of the crop, learned only
   from smooth pixels: the antialiased edge of white ink on red runs through every pink between them, and
   would vouch for wood or skin. Neutral pixels compare by brightness, so a grey table is foreign to a
   disc whose only neutral is white ink.
2. **Re-registration.** An edge that crosses the crop, with foreign colour outside it, is the photo's real
   edge: the texture is re-centred and re-scaled so it lands on the model's nose (inset 0.8% so the edge's
   blend with the table stays out), with the existing antialiased feather on the new edge. These are the
   user's own pixels, moved. Where the crop had cut the disc off, its own edge pixels are extended outward
   along its radius. A circle wholly inside the crop is a generous framing **or** the disc's own band or
   stamp ring; it is re-scaled only when what lies outside it is foreign *and busy* (wood grain, carpet,
   a table's shadow: mean neighbour difference ≥ 4 levels). Plastic is smooth: a band of pale yellow on a
   purple disc measures 0.41 and stays.
3. **Outer-annulus cleanup.** From 0.80 R to the nose: connected patches of colour the face never shows that
   touch the edge, span under 150°, and have a smooth core (at least 16 pixels and 15% of the patch: skin
   and wood have one; an antialiased stripe edge or a glare line is only ever a thin line). Each patch,
   with two pixels of margin, is replaced by the disc's own pixels at the same radius just past both ends
   of the patch, blended by angular distance (extension, in the spirit of PR #9; nothing generated).
   Anything the face shows (stamp art continuous with the face) and anything that runs all round (a band,
   a rim) stays. Nothing inside 0.80 R is touched.

Overmolds: their photos stop at the seam, and the Pixel's dark rim piece is a ring all round; its plan is
"untouched". Classification is untouched everywhere.

### Upload time: the aligner snaps to the disc (`public/disc-photo.mjs`)

`snapToDisc(image, options)` runs the same edge finder on the raw photo, around the aligner's ring (radius
0.7–1.25 of it, centre within 0.3), and returns the framing that puts the ring on the disc's edge (inset
0.5%). Here the outermost well-supported circle wins: a band can gather as many rays as the edge, and the
disc's edge is always outside it. The aligner runs it when it opens and 350 ms after each drag, pinch,
key or slider settles. When the edge is at least 1.5% away, the ring **visibly moves** onto the disc and the
aligner says "Snapped the ring to your disc's edge." with **Undo**. Undo puts the ring back, says "Ring back
where you put it.", and stops snapping for that photo until **Snap to edge**. Use photo never snaps on the
way out: what is saved is what was on screen. Snapping sets only centre and size (the circle), never the
tilt sliders.

![](assets/photo-edge-cleanup/fresh-aligner-snapped.jpg) ![](assets/photo-edge-cleanup/fresh-aligner-undone.jpg)

(A fresh photo, off centre and held by fingers: snapped on opening; and after a nudge by hand and Undo.)

## Proof

`npm run test:photo-cleanup` (new): `tests/photo-cleanup-taxonomy-browser.mjs` (about 15 s, no server) and then
`tests/photo-edge-cleanup-browser.mjs` (about 2 min, local Wrangler + D1). The second one uploads the fixtures
and PR #9's stamp, halo and Pixel **through the real editor with main's own `disc-photo.mjs` served in place
of the working copy**, so the stored textures are made exactly as Freddy's were. Every surface then draws
them first with main's `photo.mjs` (before) and then with the working copy (after), in one run on one GPU.

Foreign hue (table or skin) per ring, before → after, on the texture the panel's photo mesh actually draws
(1024 tier, read back from the GPU texture) and on the other surfaces:

| | 0.88 R | 0.91 R | 0.94 R | 0.97 R | Stamp ring centre |
|---|---|---|---|---|---|
| DD3, panel texture | 5.6 → **0** | 28.7 → **0** | 43.0 → **0** | 54.5 → **0** | 0.075 R → **0.0001 R** off |
| DD3, list thumbnail | 2.1 → 0 | 23.3 → 0 | 38.7 → 0 | 42.4 → 0 | |
| DD3, My Map | 3.5 → 0 | 26.0 → 0 | 39.3 → 0 | 45.0 → 0 | |
| Leopard (generous), panel texture | 0 → 0 | 17.2 → **0** | 100 → **0** | 100 → **0** | |
| Leopard, thumbnail / My Map | 0 / 0 | 20.2 / 20.4 → 0 / 0 | 91.5 / 89.9 → 0 / 0 | 71.3 / 71.4 → 0 / 0 | |
| Destroyer (fingers), panel texture | 3.1 → **0** | 4.1 → **0** | 4.1 → **0** | 5.1 → **0** | |
| Destroyer, thumbnail / My Map | 2.4 / 3.0 → 0 / 0 | 4.4 / 4.2 → 0 / 0 | 4.3 / 4.2 → 0 / 0 | 4.4 / 5.6 → 0 / 0 | |
| Destroyer, My Bag pulled | 0 → 0 | 0 → 0 | 1.2 → 0 | 3.4 → 0 | |

Byte for byte: the Thunderbird control and PR #9's stamp, halo and Pixel draw **identical** textures before
and after (same hash on the panel texture and on the list thumbnail), and their plans are "untouched". The
stamp still runs to the edge; the Pixel keeps its rim.

| | Before | After |
|---|---|---|
| DD3 (misaligned), panel top | ![](assets/photo-edge-cleanup/before-misaligned-panel-top.png) | ![](assets/photo-edge-cleanup/after-misaligned-panel-top.png) |
| Leopard (generous), panel top | ![](assets/photo-edge-cleanup/before-generous-panel-top.png) | ![](assets/photo-edge-cleanup/after-generous-panel-top.png) |
| Destroyer (fingers), panel top | ![](assets/photo-edge-cleanup/before-fingers-panel-top.png) | ![](assets/photo-edge-cleanup/after-fingers-panel-top.png) |
| Thunderbird (control) | ![](assets/photo-edge-cleanup/before-clean-panel-top.png) | ![](assets/photo-edge-cleanup/after-clean-panel-top.png) |
| PR #9 stamp | ![](assets/photo-edge-cleanup/before-stamp-panel-top.png) | ![](assets/photo-edge-cleanup/after-stamp-panel-top.png) |
| PR #9 halo | ![](assets/photo-edge-cleanup/before-halo-panel-top.png) | ![](assets/photo-edge-cleanup/after-halo-panel-top.png) |
| PR #9 Pixel | ![](assets/photo-edge-cleanup/before-pixel-panel-top.png) | ![](assets/photo-edge-cleanup/after-pixel-panel-top.png) |
| DD3, My Bag pulled | ![](assets/photo-edge-cleanup/before-misaligned-bag-pulled.png) | ![](assets/photo-edge-cleanup/after-misaligned-bag-pulled.png) |
| Destroyer, My Bag pulled | ![](assets/photo-edge-cleanup/before-fingers-bag-pulled.png) | ![](assets/photo-edge-cleanup/after-fingers-bag-pulled.png) |
| Destroyer, Storage pulled | ![](assets/photo-edge-cleanup/before-fingers-storage-pulled.png) | ![](assets/photo-edge-cleanup/after-fingers-storage-pulled.png) |
| DD3, list thumbnail / My Map | ![](assets/photo-edge-cleanup/before-misaligned-thumb.png) ![](assets/photo-edge-cleanup/before-misaligned-mymap.png) | ![](assets/photo-edge-cleanup/after-misaligned-thumb.png) ![](assets/photo-edge-cleanup/after-misaligned-mymap.png) |
| Destroyer, list thumbnail / My Map | ![](assets/photo-edge-cleanup/before-fingers-thumb.png) ![](assets/photo-edge-cleanup/before-fingers-mymap.png) | ![](assets/photo-edge-cleanup/after-fingers-thumb.png) ![](assets/photo-edge-cleanup/after-fingers-mymap.png) |

Purity: for every stored texture, two plans made on the main thread and the worker's plan are identical
(report and mask), two cleaned images at each tier are identical, and the panel's texture is exactly the
plan's 1024 image. Each stored texture is planned once per page however many surfaces and tiers draw it
(8 plans for 8 textures on the page that drew the bag, the list, My Map and the panel).

The fresh upload: snapped on opening, cleared its Undo when nudged by hand, snapped back once settled,
Undo kept the hand framing (and stayed), Snap to edge snapped again. The saved texture needs no
re-registration (plan: no edge), its fingers are cleaned at load, and the panel shows no table or skin.
All numbers: [metrics.json](assets/photo-edge-cleanup/metrics.json).

## Failure taxonomy

From `tests/photo-cleanup-taxonomy-browser.mjs` ([taxonomy.json](assets/photo-edge-cleanup/taxonomy.json)), which
asserts each line:

**Fixed**
- Misalignment crescent (off-centre framing): re-registered on the true edge (fit within 0.002 of truth,
  92 of 93 rays in view), table gone, stamp centred. The far side, cut off by the old crop, is the disc's
  own edge pixels extended outward along its radius.
- Generous framing, table all round, on wood and on a plain grey table (soft shadow and noise read as busy;
  plastic does not). Fit within 0.005 of truth.
- Fingers at the rim (on the annulus, outside 0.80 R): one patch per finger, replaced by the plastic either
  side.
- New uploads: the aligner snaps hand misalignment away before it bakes in.

**Bounded**
- **A foreign colour the disc also has.** On a tan disc held by fingers, skin is mostly the face's own
  colour: only two small patches (4.6° each) are cleaned, the rest of the fingers stay. Same for wood on a
  brown disc. Evidence: ![](assets/photo-edge-cleanup/taxonomy-tanFingers-before.png) → ![](assets/photo-edge-cleanup/taxonomy-tanFingers-after.png)
- **A smooth ring all round in a colour the face never shows** is treated as plastic, never re-scaled:
  that is what protects a Halo-style band (a pale yellow band from 0.90 R on purple is found as a full
  circle, foreign and smooth, busy 0.41, and stays byte-identical). The cost: a generous framing on a
  perfectly uniform, shadowless surface of one colour would stay too. The plain grey table fixture,
  with its shadow, is cleaned.
- **Fill quality.** The gap fill blends the plastic either side at the same radius. On plain plastic it
  is invisible; next to stamp art that runs to the edge it carries that art's colour across the gap (on
  the Destroyer, a short white streak from the "R" that is cut off at the rim). Glare arcs are kept, they
  are the disc's own light.
- **Small misalignment.** An edge under 1.2% off centre is not re-registered, and the aligner's snap ignores
  misses under 1.5% (moving the ring for less would fight the user's hand). A sliver of table up to that
  width (about 6 px of a 1024 px texture, on one side of the nose) can remain unless the annulus pass
  takes it as a patch.
- **Overmolds** are not cleaned beyond their seam (their photo stops there anyway); the rim piece keeps its
  stored colour.

**Impossible, scoped out**
- **A hand across the face.** A finger laid across the disc to 0.45 R is real occlusion: the disc's art
  under it is not in the photo. Its skin is in the face, so it is "the face's own colour" and nothing is
  touched, by design: no generative fill, nothing invented (Plan 22). Retake the photo. Evidence:
  ![](assets/photo-edge-cleanup/taxonomy-faceHand-after.png)
- **The part of a finger inside 0.80 R** stays for the same reason, even when its annulus part is cleaned.

## Cost

Per stored texture, once per page: a plan, about **16–77 ms** on the main thread for the seven textures
(RTX 3070 desktop; 114–148 ms average in the worker across runs, while the bag scene loads around it), off the main
thread in the worker. Untouched textures cost nothing more. A changed texture costs one cleaned image per
tier it is drawn at: **59–91 ms** at 1024 px, **15–18 ms** at 256 px, also in the worker. Nothing runs per
frame; the cleaned image is the texture, cached as photo textures always were. The aligner's snap is
**16–41 ms** per run on a 1600 × 1200 photo, after a gesture settles. A plan is a few hundred bytes, plus a
128 KiB cell index and 8 bytes per masked cell when patches are found; up to 64 are kept.

## Tests

- `npm run test:photo-cleanup` (new): taxonomy and proof, above.
- `tests/photo-cleanup-characterize-browser.mjs` (new): the characterization table above.
- Existing, all green on this branch: `test:photo-textures`, `test:photo-rim`, `test:photo-edge`,
  `test:photo-edge:atlas`, `test:disc3d`, `test:bag`, `test:bag:browser`, `test:bag:pulled-sizing`,
  `test:bag:pulled-quality`, `test:bag:overmold`, `test:bag:collections`, `test:bag:scene`,
  `test:appearance`, `test:my-map`, `test:atlas:3d`.
- One `test:photo-cleanup` run (of four) failed in fixture setup: the local Worker answered "Disc saved. Its
  photo could not save" for one upload made with main's own `disc-photo.mjs`, before any cleanup code ran.
  The rerun passed. It saves `failure-add.png` and the dialog's text if it recurs.
- `test:photo-phone`: its WebKit halves cannot launch in this environment (Playwright's WebKit is not
  installed in the shared browser runtime). Its four suites pass on Chromium: gestures, editor contract,
  source chooser, compression. `photo-gestures-browser.mjs` now sets `data-photo-snap="off"` on the page:
  it measures raw gesture maths, and a snap 350 ms after release would race its readings.

## Freddy's feel check after deploy

Without re-applying or re-uploading anything:
- Destroyer: his fingers gone from the rim.
- DD3s: read aligned, stamp centred, no table crescent.
- 30-stamp Wraith: the pattern still runs to the edge.
- Pixel: unchanged.
- One fresh imperfect photo, taken the normal way: the aligner snaps the ring to the disc and says so.

## Round 2: Freddy's real photos (October 16, 2026)

Branch `codex/photo-edge-cleanup-2`, from `main` at `549150a` (the PR #10 merge).

Freddy's feel check of the deployed PR #10 build: the **Destroyer is fixed** (fingers gone, so the cleanup runs
on his real textures). **The Wraith is "pretty bad"**, and two more photo discs show edge errors: a pale
pink/white disc whose rim still carries foreign remnants, and an orange disc with a pale crescent outside its
silhouette. Round 1's fixtures all passed: saturated discs on a dark, busy wood table, drawn as clean PNGs.
His failures share what those lacked: **bright or pale discs whose background sits close to them in brightness
and hue, glare across the rim, and phone JPEGs**.

### The signatures, reproduced

`tests/photo-cleanup-signatures.mjs` draws five phone-like photos (sensor noise, JPEG at 0.88), each with its
ground truth (the disc's circle and a finger mask), framed with steps the aligner's own controls reach:

| Fixture | Photo | Framing |
|---|---|---|
| **Wraith** (30 stamp) | yellow and blue stripes, white "30" outlined in black; pale grey concrete; heavy glare across the rim; two fingers | 2% left, 2% large |
| **Halo Star Wraith** | purple, pale lilac halo from 0.8 R; white table; glare; a thumb on the rim | 2% right, 1% down, 3% large |
| **Pale pink** | pale pink, dark stamp; cream table; three fingers on the rim | 1% up, 2% large |
| **Orange** | orange, **white foil stamp**; off-white table; strong glare | 3% right, 4% large |
| **Destroyer** | round 1's Destroyer as a phone JPEG: purple, white stamp, wood, two fingers and a thumb | exact |

![](assets/photo-edge-cleanup/round2/photo-wraith.jpg) ![](assets/photo-edge-cleanup/round2/photo-halo.jpg) ![](assets/photo-edge-cleanup/round2/photo-pink.jpg) ![](assets/photo-edge-cleanup/round2/photo-orange.jpg)

Each goes through `preparePhoto()` as the aligner's Use photo does. The stored texture is then planned by PR #10's
`photo-clean.mjs` and by this branch, and every cleaned pixel is traced back to the photo pixels it shows
(registration, fills and the stop, as the renderer composes them: `provenance()`). A pixel counts as **foreign
shown** when at least half of it comes from table or finger. `tests/photo-cleanup-signatures-browser.mjs` asserts
each finding below ([signatures.json](assets/photo-edge-cleanup/round2/signatures.json)).

### What each one was under PR #10, and what changed

Foreign shown by ring, PR #10 → this branch:

| | 0.85 R | 0.90 R | 0.95 R | Failure under PR #10 |
|---|---|---|---|---|
| Wraith | 1.5 → **0** | 3.9 → **0.9** | 20.6 → **0** | **wrong fit**, and glare filled as foreign |
| Halo Star Wraith | 4.7 → **0** | 36.8 → **0** | 59.6 → **0** | **no plan**, and the thumb merged into the halo |
| Pale pink | 3.5 → **0** | 9.2 → **0** | 54.0 → **0** | **no plan**, and fingers classified as plastic |
| Orange | 26.7 → **0** | 44.9 → **0** | 59.5 → **0** | **no plan** for the crescent (an off edge it would not register) |
| Destroyer (JPEG) | 0 → 0 | 0 → 0 | 0 → 0 | **wrong fit**, harmless by luck |

**Wraith: wrong fit, and glare classified as foreign.** PR #10's edge search keeps a colour step only when its
outside is a colour the face never shows. The 30 stamp's face shows white, black and greys, so the grey floor
counted as "disc" and the true edge's steps were thrown away. What was left (glare and fingers) gathered a
51-of-71-ray circle at (0.105, 0.022, r 1.013) against the truth (0.072, 0, 0.973), 0.040 off. It was registered:
the floor crescent stayed and the far side was extended from the wrong place. Separately, a 94° glare arc on the
rim has a smooth core, so it was taken for a foreign patch and filled from the plastic either side. That paints a
smooth band over the stripes, which reads as an added rim, and may be part of "pretty bad". Now the second
search fits (0.066, −0.003, 0.971), 84 of 94 rays, within 0.006 of the truth, and registers it. The glare stays
(720 px kept as the disc's own light), the fingers are three patches, and what crossed the crop's cut is refilled
from the clean edge.

**Halo Star Wraith: no plan.** In a stored texture PR #10 also needs the step's *inside* to be a face colour. At
a Halo's edge the inside is the pale halo band, never the purple face, so every step was rejected. The patch pass
then saw the halo as a rare colour running all the way round, so halo, thumb and crescent made one 360° patch,
kept as "a band". Now the second search sure-fits (−0.074, −0.027, 0.962) against the truth (−0.071, −0.027,
0.960). The disc's soft shadow on the white table is a gradual ramp, and the strongest change lies about 4% out
in it, where the shadow would have stayed as a dark rim. So each step moves in to where its foreign run begins.
Colours that run all round the annulus (the halo) are learned as plastic, so the thumb is a patch of its own.

**Pale pink: no plan, and a patch-classification miss.** The upload's light removal pulls a pale pink disc to
near grey (205, 202, 207 in the stored texture) and skin on it to pale beige (236, 223, 205). Both count as
"neutral", which round 1 compares by brightness alone (16 bins), so skin, cream table and plastic all read as the
disc. Now pale pixels keep their tint (fine bins: r − g and (r + g)/2 − b in steps of 7 levels), and the fingers
are patches. The edge is found but only **likely** (57 of 79 rays: the crescent thins out at both ends), so the
safety rule below applies: the photo stops at 0.934 and the plate shows past it.

**Orange: no plan for the crescent.** PR #10 found an edge 0.019 off (68 of 97 rays) but would not register it.
Only 28% of the crescent is "a colour the face never shows", against a 35% threshold, because the white table
matches the white foil stamp. Now the second search fits the truth to 0.002 (102 of 107 rays). Foreignness past an
edge also counts what differs from the plastic just inside it on its own radius, so the crescent is 100% foreign
and is registered away.

**Destroyer (the still-fixed control): wrong fit, harmless by luck.** Round 1's own Destroyer, re-encoded as a
phone JPEG, makes PR #10 register a 36-of-43-ray circle 0.15 off. That zooms the texture out and smears its cut
side; no table shows only because the crop was exact. Freddy's real Destroyer was luckier. Now the fit is
rejected (not sure, and nothing for the second search) and the fingers are patches: still fixed, no longer by
luck.

### The fixes (`public/disc3d/photo-clean.mjs`)

1. **Confidence.** Only a **sure** fit moves pixels: at least 54 rays (a third of the circumference) see the
   step, and four in five of the rays that should see it do. Round 1 accepted 30 rays at 70%. That let partial
   arcs register (the Wraith, the JPEG Destroyer), because a circle that leaves the crop can't be checked there.
2. **A second search, by each ray's own colours** (texture mode only; the aligner's snap is unchanged). A step's
   outside must be unlike every colour its own ray of disc shows from 0.62 to 0.8 R. "Unlike" is judged by tint,
   at a brightness the light could give the same plastic (`alike()`). The outside must also stay unlike out to
   the crop's edge, so a glare arc, with plastic past it, is not an edge. A pale disc on a pale table, or a
   white-stamped disc on a white floor: the background is "a colour the face shows" somewhere, but rarely on the
   same ray as the edge it meets. Each step moves inward to where its foreign run begins (shadow). In this search
   a larger circle displaces a smaller one only when they are concentric.
3. **Fine bins** for pale pixels (above), in the patch pass and in the registration's foreignness.
4. **Ring colours are plastic.** A colour seen in at least 22 of 32 sectors round the annulus runs all round
   (a halo, a rim). A patch joined to it is still judged as a patch.
5. **Glare stays.** A rare patch is glare when it is mostly the photo's own white (its brightest half percent)
   and runs round the rim far more than across it. Its white pixels are kept; anything compact inside it (a
   fingertip with its white nail) is still a patch.
6. **The cut side.** Where the crop had cut the disc, registration repeats the crop's edge outward. Foreign matter
   that crossed that edge (a thumb, a fingertip) would be stretched along the rim. There, anything rare or unlike
   its own ray's colours is refilled from the clean repeated edge either side, with a margin. Showing the plate
   there instead was tried: on a Halo the plate is the purple face, and a purple sliver read as an added rim.

### The safety principle: never a crescent, at worst a short photo

An edge can be **likely** (at least 20 rays, 55% of those in view) but not sure. Then it can't be placed well
enough to move pixels, and it can't be ignored either. The plan gets a **stop**: the photo stops inside every
step that supports the likely circle (1.2% in, never inside the old shoulder at 0.80 R). Past it the photo's
opacity fades out over 1.5% and the plate's own plastic shows, exactly the pre-PR #9 shoulder look for that
texture. The photo mesh is already transparent over the plate on every surface (viewer, pop-out, bag, Storage,
list thumbnails, My Map), so no rendering code changed. The stop applies only when what lies past the circle is
foreign; a smooth ring all round is a band and stays. Pixels past the stop no longer join patches, so a crescent
beyond it can't merge the fingers inside it into a "ring".

Where the principle sits: in **fit acceptance** (only sure fits register) and as a **conservative re-mask** (the
stop) for likely ones. A texture with no evidence at all is left exactly as it was, because "no edge found" is
also what a perfectly framed photo looks like. So the clean control and PR #9's stamp, halo and Pixel stay
byte-identical.

### On the app surfaces

`tests/photo-cleanup-round2-browser.mjs` uploads the five signatures and the four guards through the real editor,
on local Wrangler, with the aligner as it was when Freddy stored his photos (`38a8c4a`, no snap). Each surface then
draws them with PR #10's cleanup (before) and this branch's (after), in one run on one GPU
([metrics.json](assets/photo-edge-cleanup/round2/metrics.json)):

- The detail panel draws exactly the plan's pixels (texture hash = the plan's 1024 image).
- Foreign shown on the annulus (0.8–0.995 R) of the textures as uploaded: Wraith **0.1%**, Halo Star Wraith
  **0.78%** (a hairline where the thumb crossed the crop's cut), pale pink, orange and Destroyer **0%**.
- Pale pink: rim opacity 255 → 0 past the stop at 0.934 (the plate shows).
- The clean control and PR #9's stamp, halo and Pixel: texture and list thumbnail **byte-identical** before and
  after; their plans are "untouched".

| | PR #10 | Round 2 |
|---|---|---|
| Wraith, panel top | ![](assets/photo-edge-cleanup/round2/before-wraith-panel-top.png) | ![](assets/photo-edge-cleanup/round2/after-wraith-panel-top.png) |
| Halo Star Wraith, panel top | ![](assets/photo-edge-cleanup/round2/before-halo-panel-top.png) | ![](assets/photo-edge-cleanup/round2/after-halo-panel-top.png) |
| Pale pink, panel top | ![](assets/photo-edge-cleanup/round2/before-pink-panel-top.png) | ![](assets/photo-edge-cleanup/round2/after-pink-panel-top.png) |
| Orange, panel top | ![](assets/photo-edge-cleanup/round2/before-orange-panel-top.png) | ![](assets/photo-edge-cleanup/round2/after-orange-panel-top.png) |
| Destroyer (JPEG), panel top | ![](assets/photo-edge-cleanup/round2/before-destroyer-panel-top.png) | ![](assets/photo-edge-cleanup/round2/after-destroyer-panel-top.png) |
| List thumbnails: Wraith, Halo, pink, orange | ![](assets/photo-edge-cleanup/round2/before-wraith-thumb.png) ![](assets/photo-edge-cleanup/round2/before-halo-thumb.png) ![](assets/photo-edge-cleanup/round2/before-pink-thumb.png) ![](assets/photo-edge-cleanup/round2/before-orange-thumb.png) | ![](assets/photo-edge-cleanup/round2/after-wraith-thumb.png) ![](assets/photo-edge-cleanup/round2/after-halo-thumb.png) ![](assets/photo-edge-cleanup/round2/after-pink-thumb.png) ![](assets/photo-edge-cleanup/round2/after-orange-thumb.png) |
| My Map: Wraith, pink, orange | ![](assets/photo-edge-cleanup/round2/before-wraith-mymap.png) ![](assets/photo-edge-cleanup/round2/before-pink-mymap.png) ![](assets/photo-edge-cleanup/round2/before-orange-mymap.png) | ![](assets/photo-edge-cleanup/round2/after-wraith-mymap.png) ![](assets/photo-edge-cleanup/round2/after-pink-mymap.png) ![](assets/photo-edge-cleanup/round2/after-orange-mymap.png) |

### What still can't be caught, and why

- **A fingertip in a colour the face shows.** On the Wraith fixture part of one fingertip stays at 0.90–0.95 R
  (0.9% of that ring). After light removal it is the same cream as the face's own glare on the yellow stripes, so
  by colour it is the disc (round 1's tan-disc case, now on a bright disc).
- **A hairline at the crop's cut.** On the Halo Star Wraith, the thumb's soft edge leaves a thread where it crossed
  the crop's edge on the side the crop had cut (0.78% of the annulus as uploaded).
- **The stop shows as a ring.** A likely-but-unsure edge gives that texture the old shoulder look: on the pale
  pink, the plate's plastic from 0.934 R out, with a faint line at the stop. That is the trade the principle
  chose: a slightly short photo, never a crescent.
- **No evidence, no change.** A crescent with no step at all (the table matching the rim in tint and brightness,
  no shadow) gives nothing to find, and the texture stays as stored. Such a crescent is also nearly invisible.
- **Pale glare on a pale disc is filled**, not kept: it is not near the photo's white (the pink's 88° arc), so it
  is filled from the plastic either side. On plain plastic that is invisible; over art it would smear.
- **These are fixtures, not Freddy's files.** The signatures are built from his descriptions and screenshots; his
  own stored textures were not available here. The feel check on his discs is the proof that counts.

### Cost

Same page, same stored blobs, medians of five (`planPhoto` includes the 256 px decode): plans for the guards
21–48 ms (PR #10: 15–31 ms), for the signatures 54–87 ms (PR #10: 25–81 ms). The cleaned image at 1024 px:
58–90 ms (PR #10: 45–101 ms; round 1's documented envelope 59–91 ms). Still once per stored texture, in the
worker; nothing per frame. In round 1's proof run, with the bag scene loading around it, the worker averaged
174 ms per plan (round 1 documented 114–148 ms there), and 71 ms per cleaned image. The patch fill's gap walk is now one run table per ring (it was a walk per masked
cell: 55 ms on wide patches), and plain registered pixels skip the general composer.

### Tests (round 2)

- `npm run test:photo-cleanup` now runs `tests/photo-cleanup-taxonomy-browser.mjs` (round 1, unchanged, green),
  `tests/photo-cleanup-signatures-browser.mjs` (new, about 30 s, no server), `tests/photo-edge-cleanup-browser.mjs`
  (round 1's proof) and `tests/photo-cleanup-round2-browser.mjs` (new: app surfaces, about 4 min, local Wrangler on
  port 8844).
- All green on this branch, in one sequential run: `test:photo-cleanup` (all four), `test:photo-textures`,
  `test:photo-rim`, `test:photo-edge`, `test:photo-edge:atlas`, `test:disc3d`, `test:bag`, `test:bag:browser`,
  `test:bag:pulled-sizing`, `test:bag:pulled-quality`, `test:bag:overmold`, `test:bag:collections`,
  `test:bag:scene`, `test:my-map`, `test:appearance`, `test:atlas:3d`.
- Round 1's proof (`tests/photo-edge-cleanup-browser.mjs`) still holds every round-1 claim: DD3 54.5% → 0% table,
  stamp ring 0.075 → 0.0001 R off, Leopard 100% → 0%, Destroyer 5.1% → 0%, the control and PR #9's fixtures
  byte-identical, one plan per texture, the fresh upload snaps.

### Freddy's feel check after deploy

The same discs, without re-uploading anything:
- **The Wraith first**: no floor crescent at the rim, no band over the stripes; the glare stays.
- The pale pink/white disc: no fingers or table at the rim. If its edge is one the cleanup can't place, the photo
  stops a little short with plain plastic past it (the old look), never a crescent.
- The orange disc: no pale crescent outside its silhouette.
- The Destroyer: still no fingers (the still-fixed control).
