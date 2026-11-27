# Stamp pipeline v2: spike and eval (segment, warp at full resolution, separate in Lab)

Branch `claude/stamp-pipeline-v2`, its own worktree, off `origin/main` **6fd064e** (PR #54, clear opacity: the tip was
read back before branching). Seat: Opus, on the Mac. Pool: Claude is the abundant pool since the Max 5x upgrade
(Oct 17, 2026), so Opus owns this run; Fable is not the seat and is not in the per-photo loop. Spike only: nothing here
is wired into a production path, no migration, no push, no PR, no deploy.

**Status (Nov 14, 2026). STOPPED for Freddy's eye, with a control regression on the table.** The brief's fence says a
regression on a control stops the spike report. Here it has: v2 is measurably worse than today on the **DD3** (a sheen
patch 11.5× larger) and visibly rougher on the **Destroyer** (grey halos, holes in the silver letters). It also loses
the Raptor's black print. v2 is not a candidate to ship as built. What it does prove is narrower and still useful:

- **The Berg blotch is not a resolution problem.** Today's extractor tips over on near-identical inputs of the same
  photo. v2's separation does not, at the same resolution (§2).
- **Letters:** on the Berg's camera original, v2 reads every letter and every flight glyph whole. On its stored photo, v2
  reads 11 of 13 letters and 7 of 7 flight glyphs, where today reads 8 and 4 (§3).
- **The pair gate holds on v2:** the Proxy is letter-complete and the Wraith ghost-free, on one set of settings (§4).
- **The Raptor's true colour is not decided:** its backlit second shot does not exist yet (§5).

**Build (same day, Freddy: "Build it").** The post-pass is in production code on branch `claude/stamp-blotch-veto`
(§10): `public/disc-stamp-separate.mjs` and a veto in the stamp worker, with a regression test that fails without it.
The unit set and 15 of the 16 photo and stamp browser suites pass; the 16th fails identically on main. It stops at an
open PR: no merge, no deploy.

**Build v2 (Nov 26, task bslhk2, branch `claude/stamp-pipeline-v2-build` off main 5597801). The extractor STOPPED again
at the control fence, after two strikes; the retake prompts are built (§11).** The full v2 extractor still regresses the
controls, and the second approach tried (today's extractor plus v2's segmentation adding only the marks today misses
whole) adds a 509 px clump and specks to the Destroyer without bringing back the Berg's PRO. So no extractor change ships.
What ships is the capture gate's retake prompts in the product, re-fitted for the crop a make reads, with no change to
any asset. The PR #55 veto stays exactly as it is.

**Follow-up (same day, Freddy: "Try the post-pass").** The narrower option is built and measured in §9. Today's
extractor stays, and v2's separation only vetoes ink it does not support. On the Berg it removes the blotch: stray ink
falls from 14k–340k px to 0–224 across all four stress inputs. The Destroyer's and Wraith's colour assets come out
**byte-identical**; their one-ink alpha differs only in faint edge bytes (§9, corrected).
The DD3 loses its sheen speckle. No letter anywhere is removed. It adds no letters either, so the Berg's stored photo
still reads 8/13.

## 0. Inputs, and what was missing

**Real photos, all local and ignored** (`work/stamp-pipeline-v2/input/`, never committed):

| Disc | Photo | Production path compared |
|---|---|---|
| Berg (K1 Glow) | camera original `IMG_0870.HEIC` (4284×5712 after EXIF), and the live stored photo (`input-live2`, 1024) | original: the aligner's saved fit (H matrix, +1.8°) at 2048; stored: one-click at 2048 |
| Proxy (Eclipse) | live stored photo, 1024 | one-click |
| Proto Glow Champion Wraith | live stored photo, 1024 | one-click, `seeThrough` |
| Raptor (Z, clear) | live stored photo `71c60188` (the dark-surface photo), 1024 | one-click, `clear` |
| DD3 (S-Line), control | ProRAW `IMG_0800.DNG`, JPEG q95 export, 3024×4032 | original, the Oct 20 framing |
| Destroyer (Star), control | ProRAW `IMG_0788.DNG`, JPEG q95 export, 3024×4032 | original, the Oct 20 framing |

**Missing, and reported rather than worked around:**

- **The research report** named in the brief (`~/workspace/research_notes/claude-releases-disc-atlas-upgrades-20261112-1848/report.md`)
  is not on this Mac. No `research_notes` directory exists under `~/workspace` or anywhere searched. This run worked
  from the brief's own summary of §2.1–2.2.
- **No camera originals for the Proxy, Wraith or Raptor**, only their stored 1024 textures. On those three, "full
  resolution" is 1024. v2's separation is the only variable there.
- **No second shots.** No angled foil shot and no backlit-on-black shot of any disc exist. The two-shot handling is
  built and checked on synthetic pairs only (§5). There is no verdict from it.
- **No SAM key, no API key.** This machine has no `ANTHROPIC_API_KEY`, no `ant` profile, and no Replicate, fal or
  Photoroom key. Creating accounts or keys is Freddy's call. So:
  - **SAM 3.1 was not run.** Step 2's disc mask came from production's own rim fit, which was verified correct on the
    Berg in October (`berg-rim-fit`). The circle is analytic, with a sub-pixel edge, so step 7's matting fallback never
    had a hard-edged mask to fix, and **was not run either**.
  - **The supervisor ran through the `claude` CLI**, headless, on Freddy's subscription (§6).

Personal photos left this Mac **only** in the supervisor and QA calls the design names: 7 Sonnet 5.5 calls (photo and
v2 composite side by side, 1568×784) and 7 Haiku 5.5 calls (the photo, 784×784), all through `claude -p`. Nothing went
to SAM, Photoroom or any other service.

## 1. What was built (`spikes/stamp-pipeline-v2/`, lab code; no production file changed)

| Step | File | What it does |
|---|---|---|
| 1 QA gate | `qa.mjs`, `qa-run.mjs` | Blur, exposure, resolution, fill, glare, each with a plain-words retake prompt. Pure JS, $0 |
| 2 localise | (production) `photoPoint` + the saved fit | A stand-in for SAM (not run, above) |
| 3 warp | `common.mjs` `crop` at `nativeDiameter` | The canonical circle at **one crop pixel per photo pixel** across the disc: 3778 px for the Berg, 2960/3020 for the controls. Production reads 2048 through a ≤4096 working copy |
| 4 separate | `separate.mjs` | Below |
| 4 colour | `v2.mjs` | Production's colour pass, **unchanged**, run on v2's mask with the pre-softening crop (`softenGlare:false`). On a clear disc, production's clear passes (`unshadow`, `shoulder`, the clean finish) run around v2's separation |
| 5 supervisor | `supervise.mjs` | Sonnet 5.5 JSON verdict, Haiku 5.5 capture QA. Never touches asset pixels |
| 6 two-shot | `twoshot.mjs` | Foil from an angled pair; opacity from a backlit pair. `--self-test` |
| post-pass (§9) | `extract-post.mjs`, `post.mjs`, `colourdiff.mjs` | Today's extractor plus v2's veto, and what it changes |
| eval | `baseline.mjs`, `stability.mjs`, `native-prod.mjs`, `summary.mjs`, `zoom.mjs`, `view.mjs`, `sheet.mjs`, `review.sh` | Today's extraction (main's `extract()`, unchanged) on the same photos, and every measure below |

**`separate.mjs`, the separation:**

- **Plastic.** The dominant colour is the densest cell of a Lab histogram over the plate (a median fails on the DD3,
  where print covers most of the plate). A smooth local field of it comes from 48×48 cells of near-plastic pixels,
  holes filled from their neighbours. Shading belongs to the field, not to the stamp.
- **Distance.** Each pixel's ΔE from the field under it. Noise is read from the plastic alone.
- **Marks.** Hysteresis: seeds at `hi`, grown through `lo`. A weak pass then admits faint marks (seeds halfway between
  `lo` and `hi`) that sit beside kept print, the Berg's last H for example. There is no area floor beyond a few seed
  pixels.
- **Plastic, not print.** Three rules decide it (blotch, sheen, ghost):
  - **Blotch:** the plastic's own hue, faint, soft-edged. Lighter than the plastic needs only a soft edge; darker
    needs a very soft, broad one.
  - **Sheen:** a soft mark lighter than the plastic that reaches the plate's edge, whose difference from the plastic
    points toward white.
  - **Ghost** (see-through plastic only): the plastic's own hue, darker, faint, soft.
- **Alpha** is coverage: ΔE over the strongest ΔE within about 2 px at 1024, so each ink of a mixed mark reaches full
  level. Anything at `hi` or over is full ink.

**Honest note on the rules.** Edge sharpness alone did not separate print from plastic on real photos. Three measures
were tried: the gradient at the boundary, the peak gradient, and the area between contours. With real camera blur,
faint print and a pen ghost have the same edge width (about 3.5–9 vs 6–10 px at 1024). What separates them on these
seven photos is **direction** (lighter or darker than the plastic), **hue**, **position** (the rim) and **plastic
type**. That is the same physics today's extractor encodes in its ghost and reflection rules. The thresholds in
`TUNING` were fitted on these seven photos and are not validated beyond them.

## 2. Cause 1, the blotch: resolution DISPROVED; extractor instability PROVED (on this Mac's pixels)

The brief's hypothesis: a resize or recompression step, "any vision model in the pixel loop caps the image at
2,576px". **There is no vision model in today's pixel loop.** `disc-photo.mjs` → `disc-stamp-worker.mjs` is pure JS:
the original is read through a ≤4096 working copy into a 2048 crop. So the 2,576 px cap cannot be the cause in this
codebase. Resolution itself was tested both ways:

**Same resolution, near-identical inputs.** Two 2048 crops of the Berg's camera original with the same fit were
compared: WebKit's exact worker input, captured Oct 27 (`stamp-look-extraction runs/orig-berg2`), and this lab's Node
crop. They are **0.5/255 apart** per channel on average. Each also ran at 1.3× contrast, the stress that reproduced
Freddy's live blotch pattern in `berg-blobs/REPORT.md`. Results, with ink at alpha over half and "stray" meaning ink
beyond 0.62 of the radius, where the Berg has no print:

| Extractor | alpha IoU, Node vs WebKit | stray px: WebKit | Node | WebKit ×1.3 | Node ×1.3 |
|---|---|---|---|---|---|
| today (main `extract()`) | **0.572** | 14,327 | **93,002** | **339,551** | 99,524 |
| v2 `separate()` | **0.983** | 314 | 305 | 577 | 401 |

**Higher resolution, today's extractor.** Production's `extract()` was fed v2's 3778 px crop, the photo's own pixels
with no downsample: **296,371 stray px** at 2048, *worse* than either 2048 read. More resolution does not cure the
blotch. Production's thresholds pick up more of the plastic's mottling at higher resolution.

What this proves: **today's extractor is unstable on this near-neutral glow plastic.** A sub-1-level difference in
resampling (Node bilinear against WebKit `drawImage`) moves a blotch of 80,000+ px in or out. Freddy's top-right blob
and arc appear in the Node read (`runs/berg-original/cap-vs-node.png`). On the same inputs, v2's local plastic field
and its plastic-colour rules hold steady.

What it does **not** prove: what Freddy's phone hands the worker (still unobserved, as on Oct 28), and that the Berg
is fixed. **Berg acceptance stays Freddy's camera-original re-make after any landing.**

## 3. Cause 2, low-contrast stamps: segmentation, PROVED on the Berg (letters named, not vibes)

The ground truth is the Berg's small print, read off the photo: **PUTT & APPROACH** (13 glyphs, counting &) and
**1/1/0/2** (7 glyphs). The close-ups are `work/stamp-pipeline-v2/sheets/berg-original-small.png` and
`berg-stored-small.png`.

| Berg photo | Extractor | Letters | Flight glyphs | Missing / broken |
|---|---|---|---|---|
| camera original | today, WebKit input | 13/13 | 7/7 | first A thin; H a fragment; **2 broken** |
| camera original | today, Node crop | 13/13 | 7/7 | **blotch over the first 1**; 2 broken |
| camera original | **v2, 3778 native** | **13/13** | **7/7** | H's right stem faint; none broken |
| stored 1024 | today | 8/13 | 4/7 | **P R O C H missing**; all three slashes missing; 2 broken |
| stored 1024 | **v2** | **11/13** | **7/7** | **H missing**; R reads as P; C broken; the 2 blobby |

The camera original is what lets **today's** extractor read PROACH. That confirms October's option (b), "re-make from
the camera original", **on this Mac**. On that photo v2 adds the whole 2 and the blotch-free plate. On the stored photo
v2 recovers PROAC and the slashes, but not the H. The supervisor read the stored v2 line as "APPPOAL" and called it
**wrong** (§6).

Why it is segmentation: the missing letters sit at ΔE 6.7–8.4 over the plastic (October's measure). Today's
component-area floors drop them. v2 keeps them through hysteresis and the weak pass, with no area floor. A bigger
vision model would not change that number.

## 4. The pair gate: **HOLDS on v2** (one verdict, one set of settings)

- **Proxy, letter-complete:** PUTT & APPROACH, 3/3/-1/0.5, ECLIPSE, Glow Plastic and AXIOM DISCS all read whole
  (`proxy-small.png`, `proxy-bottom.png`). Today's extractor is complete too. v2's strokes are slightly heavier, and
  the supervisor notes speckle on the crescents.
- **Wraith, ghost-free:** the penned "132" and the injection-gate blob are both out, and every printed element is
  intact (`wraith-ghost.png`). Sonnet: "the handwritten '1132' … is not carried over", confidence 0.9.

Both pass together, on the same `TUNING`. The ghost rule is gated to see-through plastic, as today's is.

## 5. Cause 3, clear true colour: capture problem, NOT TESTED (no backlit shot exists)

- **Today, single shot:** the live Raptor (texture `71c60188`, the dark-surface photo) has `photo_true_color` NULL
  (refused) and colour `#537b80`. Its plate here reads `#4f7b81`. That is the photo's colour over a dark surface, not
  the plastic's (`docs/clear-plastic-true-color.md`).
- **Two-shot handling:** `twoshot.mjs clearFromBacklit` reads transmission from the backlit plate over the backlight
  at the rim; opacity is 1 − transmission, and the render colour comes from the diffuse shot. `foilFromPair` marks foil
  where lightness moves with the angle beyond 4σ of the plastic's own change. The self-test passes: synthetic foil
  found, ink not; transmission 0.399 against 0.40 set; colour exact. **That checks the code. It is not a verdict on
  the Raptor.**
- **Needed from Freddy:** the Raptor backlit on black (a phone torch under it, on a dark cloth), and one angled shot of
  a foil disc. Then the comparison against today's single-shot read can run.

**v2's stamp on the Raptor regresses**, and the supervisor caught it: v2 loses the black "5X PAIGE PIERCE WORLD
CHAMPION" and the signature, and adds blue rim arcs. The separation keeps the black text (contrast 36–43, kept). It is
lost afterwards, in production's clear clean finish (the colour pass's `kept`), when that pass is fed v2's mask. The
rim arcs join the red foil ring in one mark.

## 6. Controls, supervisor, cost and latency

### Controls: **REGRESSION, the report stops here**

| Control | v2 against today | Verdict |
|---|---|---|
| DD3 | sheen at 3 o'clock: **13,792 px vs 1,198** (alpha over half, box 0.83–0.92 × 0.50–0.62 at 2048); a grey fringe round the crystals. The crystal art reads solid in v2, which is arguably truer (it has no bare plastic inside) | **worse** |
| Destroyer | all print present (the supervisor agrees). Grey halos round strokes, holes in the silver OYER, a clump by GOLF (`destroyer-top.png`, `destroyer-bottom.png`) | **visibly rougher** |

Neither is byte-identical (a different algorithm cannot be), and neither is "no worse". By the fence, this is not
averaged away.

### Supervisor (Sonnet 5.5) and capture QA (Haiku 5.5)

| Disc | Sonnet verdict | What it flagged |
|---|---|---|
| Berg original | ok, 0.7 | the gold foil comes out black (today's colour pass, seen in October too); specks |
| Berg stored | **wrong**, 0.8 | "APPPOAL"; blotches inside the Berg letters |
| Proxy | ok, 0.8 | crescents speckled; AXIOM DISCS faint |
| Wraith | ok, 0.9 | halo and speckle on edges; the pen correctly left out |
| Raptor | **wrong**, 0.85 | the black text and signature missing; rim arcs added |
| DD3 | ok, 0.88 | "faint orange smudge to the right": the sheen |
| Destroyer | ok, 0.88 | one dark speck |

Its OCR matched the photos on all seven, and its colour names were right. **It catches gross failures** (missing text,
added rim). **It passes stroke-quality regressions** (the Destroyer's halos) at 784 px. It is a useful flag, not a
gate. Haiku answered every capture question as "fine" on all seven (whole disc, legible, top, no glare over the stamp):
correct, but this set has no bad captures to tell it from.

### Capture gate (step 1)

All checks ran in 26–302 ms per photo. The Laplacian-variance blur score **fails the Destroyer control** (33 against a
threshold of 60, while busy prints score 726–788). It measures how much print a disc carries, not focus. An
edge-normalised score (|Laplacian| / gradient on the strongest edges) reads 0.83–1.79 and does not single out the
Destroyer. It is logged as **advisory only**: this set has no known-blurry photo to calibrate a threshold. Glare passed
on all seven; the DD3's sheen is bright but not clipped. Exposure, resolution and fill passed.

### Cost per image, measured

API-equivalent cost of each call: image tokens (w×h/750) plus prompt plus measured output tokens, at list price
(Sonnet 5.5 $2/$10, Haiku 5.5 $0.10/$0.50 per MTok).

| Disc | Sonnet supervisor | Haiku QA | SAM (not run; brief's price) | Total |
|---|---|---|---|---|
| Berg original | $0.0113 | $0.00035 | ($0.0025) | **$0.0142** |
| Berg stored | $0.0083 | $0.00032 | ($0.0025) | $0.0112 |
| Proxy | $0.0086 | $0.00035 | ($0.0025) | $0.0115 |
| Wraith | $0.0073 | $0.00046 | ($0.0025) | $0.0103 |
| Raptor | $0.0090 | $0.00034 | ($0.0025) | $0.0118 |
| DD3 | $0.0080 | $0.00033 | ($0.0025) | $0.0108 |
| Destroyer | $0.0097 | $0.00038 | ($0.0025) | $0.0126 |

All within the brief's $0.005–$0.03. The CLI's own billed totals ran **$0.10–0.21 per Sonnet call**, almost all
Claude Code's cached system prompt (~25K tokens). That is an artefact of having no API key, not the design's cost.

### Latency per step (ms, this Mac, Node)

| Disc | QA | decode | warp | separate | colour | Sonnet | Haiku | today: crop + extract |
|---|---|---|---|---|---|---|---|---|
| Berg original (3778) | 302 | 215 | 681 | 6,519 | 16,142 | 12,533 | 8,396 | 445 + 7,995 |
| Berg stored (1024) | 65 | 7 | 51 | 462 | 1,557 | 9,375 | 8,110 | 198 + 6,296 |
| Proxy | 68 | 7 | 44 | 447 | 1,553 | 8,381 | 8,706 | 199 + 9,483 |
| Wraith | 72 | 8 | 44 | 374 | 1,406 | 8,414 | 8,370 | 198 + 6,789 |
| Raptor | 90 | 8 | 46 | 938 | 1,924 | 8,995 | 8,146 | 199 + 12,120 |
| DD3 (2960) | 251 | 39 | 376 | 2,987 | 10,935 | 8,689 | 8,656 | 215 + 8,157 |
| Destroyer (3020) | 181 | 32 | 435 | 3,941 | 9,298 | 9,307 | 8,697 | 207 + 6,896 |

The model calls include CLI start-up. Production's colour pass at native resolution is the slowest pixel step (16 s
on the Berg). On a phone that would need its own budget (today's `MAKE_LIMITS.extract` is 180 s).

## 7. The three causes, in one line each

1. **Blotch:** the resize / vision-model-cap cause is **disproved**: no model in the loop, and more resolution made
   today's extractor worse. **Proved instead:** the extractor tips over on near-identical inputs. v2's separation holds
   at the same resolution.
2. **Low contrast:** **proved** to be segmentation. Letters return with hysteresis and no area floor (Berg stored: 8→11
   letters, 4→7 flight glyphs); the camera original gives both extractors PROACH.
3. **Clear true colour:** **not tested**: the backlit shot does not exist. The handling is built and self-tested only.

## 8. For Freddy (nothing wired, nothing pushed)

The sheets, Paper and Midnight, today's asset beside v2's on the same photo, are in the ignored
`work/stamp-pipeline-v2/sheets/<disc>-sheet.jpg`, with close-ups beside them. They hold his photos, so they are not
committed. `spikes/stamp-pipeline-v2/review.sh` and `sheet.mjs` rebuild them.

Decisions that are his:

- **Whether to pursue v2's separation at all**, given the control regressions. A narrower option, not built here:
  keep today's extractor and port only the piece that proved out, the local plastic field and the blotch/sheen rules,
  as a **post-pass** that removes plate-hued blotches. That is October's option (b) for the Berg, now with a measured
  mechanism. It would need its own bag-wide check.
- **Keys:** SAM 3.1 (Replicate or fal) and an Anthropic API key, if the model steps go further. Account creation is his.
- **The two-shot capture:** a backlit Raptor and an angled foil shot, so §5 can give a verdict.
- **The Berg:** still his camera-original re-make after any landing. Nothing here claims it is fixed.

No migration was needed or written.

## 9. The post-pass: today's extractor plus v2's veto

**What it is** (`spikes/stamp-pipeline-v2/extract-post.mjs`). It is a copy of `disc-stamp-worker.mjs` `extract()` with
one step inserted after the stamp is found. Before that step:

- v2's separation reads the same 2048 crop: the raw one, or the unshadowed one on a clear disc.
- Its print is grown by `SUPPORT` = 1.5 px at 1024.

Then today's ink outside that support is dropped from the alpha, the mask and the layers, before the colour pass and
the clear passes. It **only removes**, so today's edges, layers, letters and colour pass are untouched wherever v2 sees
print.

- **Fidelity:** with the veto off, the copy matches production **byte for byte** (alpha and colour) on all ten runs.
- **Margin:** 3 px left a sliver of the blotch on the Berg's first "1". At 1.5 px it goes, and nothing printed is
  shaved (`sheets/post-berg-node-print.png`, `post-berg-removed-print.png`).

**Every photo disc available, alpha over half at 2048.** The pinned seven, plus the Pixel and the Raptor's earlier
photo, both from the bag.

| Disc | Today's ink px | Removed | Within 0.62 R | Alpha bytes changed | Colour on shared ink, mean ΔE (share > 5) | What went |
|---|---|---|---|---|---|---|
| Berg original, WebKit input | 176,263 | 15,456 | 1,150 | – | – | the lower-left rim fragments (October's #50 regression); a stray V between two rays; slivers beside a ray and under the arc |
| Berg original, Node crop | 258,914 | 96,156 | 3,154 | – | 0.47 (2.6%) | **the blotch and top arc**; the blob over the first 1; a speck above the B; a sliver inside the B |
| Berg stored | 163,062 | 0 | 0 | 57 (all under half) | 0.03 | nothing |
| Proxy | 123,844 | 4 | 4 | 145 | 0.03 | **one printed spray dot below the sun** (about 3 px across) |
| Wraith | 245,886 | 0 | 0 | 3 (max 3/255) | **0 (colour byte-identical)** | nothing |
| Raptor (live photo) | 316,824 | 2,111 (+1,636 added by the clear clean finish's re-decision) | 870 | – | 2.26 (13%) | fragments; the black text and signature **stay** |
| DD3, control | 948,902 | 3,079 | 0 | 9,505 | 0.96 (4.2%) | **the sheen speckle at 3 o'clock** (1,198 px of it in the box §6 measured) |
| Destroyer, control | 149,350 | 0 | 0 | 80 (max 51/255, the swoosh's feather) | **0 (colour byte-identical)** | nothing over half |
| Pixel | 152,652 | 164 | 8 | 530 | 0.12 | specks beside the cube graphic |
| Raptor (earlier photo) | 264,106 | 562 (+390 added) | 95 | – | 1.38 (8%) | fragments |

**Correction (same day).** This table's first version called the Wraith and Destroyer byte-identical. That check ran
at the earlier 3 px margin; at 1.5 px the veto also zeroes a few faint anti-aliased bytes on their edges. The rows
above are re-measured through the production build (§10), which matches this post-pass pixel for pixel. The colour
assets of both are byte-identical; the one-ink alpha differs by 3 bytes (Wraith, at most 3/255) and 80 bytes (Destroyer,
at most 51/255, the swoosh's feathered edge), none of it visible (`sheets/feather-destroyer.png`). On the Proxy the 4
px are one printed spray dot below the sun, about 3 px across: the only print the veto takes in the set
(`sheets/feather-proxy.png`).

**The colour shifts** come from the colour pass, not the veto. It clusters its inks over the whole mask, so a mask with
a few thousand fewer pixels re-assigns some shards. On the DD3 they are scattered single shards in the holographic art.
On the Raptor they fall along the red foil's edges. Neither is visible side by side (`post-dd3-colour.png`,
`post-raptor-colour.png`, white = unchanged, red = ΔE 15+). They are real, measured changes, so the DD3 control is
**not byte-identical**: it is measurably better on the sheen and shuffled within its foil. That is Freddy's call.

**The blotch, the same four Berg inputs as §2:**

| | IoU Node vs WebKit | stray px: WebKit | Node | WebKit ×1.3 | Node ×1.3 |
|---|---|---|---|---|---|
| today | 0.572 | 14,327 | 93,002 | 339,551 | 99,524 |
| **post-pass** | **0.958** | **21** | **0** | **224** | **0** |

At 1.3× contrast, Freddy's live pattern loses its top arc and its 3 o'clock blob entirely
(`sheets/post-berg-contrast13.png`). **What remains is patches touching the underside of "Berg" and the small print.**
v2's own separation grows those into the letters at that contrast, so the veto supports them. Extra ink inside the
print area under the stress drops from 34,221 to 12,119 px, part of which is letter edges thickening with contrast. So
the post-pass **removes the blotch pattern's detached parts, not the patches joined to the print**.

**What it does not do:**

- **Letters:** it never adds, so the Berg's stored photo still reads 8/13 letters and 4/7 flight glyphs. The camera
  original already reads 13/13 today.
- **Colour:** the Berg's gold foil is still black in the colour asset.
- **Clear true colour:** untouched.

**Cost:** $0, no model call. **Time:** +0.7 to +3.5 s per make on this Mac (today 6.3–12.1 s; post-pass 7.8–15.6 s),
for one more pass of v2's separation at 2048.

**If Freddy wants it in production**, it would be a separate build: the veto inside `disc-stamp-worker.mjs` `extract()`,
`separate.mjs` moved under `public/`, and a test that fails without it (the Berg Node crop's stray count). It is a
**global** change: every photo disc made or re-made after deploy, existing assets untouched until Make again. That
needs the bag-wide identity check and the browser suites that PR #50 ran. No migration. The Berg's acceptance would
still be his camera-original re-make.

## 10. The build: the veto in production (branch `claude/stamp-blotch-veto`)

Freddy, Nov 14: "Build it", as its own PR, stopping at an open PR. The branch is cut from the spike branch, so this PR
carries the spike's lab code and write-up beside the build.

**What changed (production):**

- `public/disc-stamp-separate.mjs` (new): `printSupport(rgba, size, {plate, seeThrough})` is v2's separation, support
  only. It returns 1 where print is, or within `GROW` = 2.5 px at 1024 of a kept mark. That is the spike's coverage ring
  plus its 1.5 px margin, as one reach. It does not compute the coverage alpha, which the veto never used. It holds Lab
  only until ΔE is computed, samples the plastic field on demand, and rounds Lab to single precision as the lab
  measured it.
- `public/disc-stamp-worker.mjs` `extract()`:
  - the support is read first, on the crop as given (a clear disc's after its shadow pass, before de-lighting), so its
    working memory is free before the other passes allocate theirs;
  - ink outside the support is dropped from the alpha, the mask and the layers, right after the stamp is found;
  - `register()`'s ink reads pass `{veto:false}`, read from `arguments[3]` so the signature line the browser suites
    patch is unchanged. The aligner's fit is exactly as before.
- Nothing else: no migration, no sheet or renderer change. Existing assets change only when their owner taps Make again.

**Tested:** `tests/stamp-blotch-veto.mjs` uses drawn discs only: near-neutral glow plastic, a patch of lighter fractal
mottling, and a gold print.

- Today's extractor reads 12,279 px of the mottling as ink.
- With the veto, under half is left (the test's bound), and the print is byte-for-byte untouched.
- A clean disc is byte-identical, alpha and colour, with the veto on or off.
- **With the veto line removed, the first test fails** ("12279 of 12279 px left").

**Identity through the production worker** (`spikes/stamp-pipeline-v2/identity.mjs`, every photo disc available, against
main's extraction of the same crops):

| Disc | Removed (alpha over half) | Matches the §9 post-pass | Support read | Peak memory of the read |
|---|---|---|---|---|
| Berg original, WebKit / Node | 15,456 / 96,156 | yes / yes | 1.7 / 1.8 s | 92 / 102 MB |
| Berg stored | 0 | yes | 1.7 s | 85 MB |
| Proxy | 4 (the spray dot) | yes | 1.6 s | 84 MB |
| Wraith | 0 | yes | 1.4 s | 79 MB |
| Raptor (live) | 2,111 (+1,636 by the clean finish) | yes | 1.4 s | 93 MB |
| DD3 | 3,079 (the sheen) | yes | 1.1 s | 108 MB |
| Destroyer | 0 | yes | 1.4 s | 86 MB |
| Pixel | 164 | yes | 1.7 s | 91 MB |
| Raptor (earlier) | 565 | 60 px apart | 1.4 s | 84 MB |

The spike's separation peaked near 230 MB at 2048. Reading it at 1024 instead was tried and rejected: it took 675 px of
the Destroyer's and 304 of the Pixel's thin print (`work/stamp-pipeline-v2/post1024.json`).

**Suites (Nov 14, this Mac):**

- **Unit set** (`node --test` over `tests/*.mjs` minus browser, evidence, perf and harness modules): branch **367/372**,
  main **364/369**. The same three fail on both, for environment only: `palette`, `prompt-4-stability-fixture` and
  `redesign` (they need a server on :5173 or `outputs/`). The branch adds `stamp-blotch-veto` (4/4).
- **Browser, the 16 photo and stamp suites:**
  - **15 pass:** stamp-look, clear-plastic, clear-true-color, clear-opacity, photo-adder-rework, photo-stamp-one-click,
    photo-stamp-sync, photo-stamp-color-assets, photo-stamp-assets, photo-stamp-identity, photo-stamp-level,
    photo-stamp-stall (its shortened make limits hold with the extra read), halo-plastic, photo-gestures and
    photo-source-chooser.
  - **The three clear suites** first failed on setup ("Use a square processed photo up to 1024 pixels."). They read the
    Raptor photo from an ignored `work/` path and fall back to a 1254 px fixture that upload refuses. With the photos
    copied into `work/` (never committed), all three pass.
  - **photo-editor-contract** fails at "This photo could not be compressed", and **fails identically on main**
    (6fd064e, same run, same message). The Oct 20 record has its WebKit half failing the same way. Not this change.

**Landing (Freddy's).** No migration. Deploy the Worker as usual (`build:workers` then `deploy:workers`). Nothing on
the account changes until a disc's owner taps Make again. The Berg's acceptance stays his re-make from the camera
original. What to look at on his discs: the Berg's top-right and edge (the blotch), the DD3's 3 o'clock (the sheen
speckle), and the Proxy's spray dots below the sun (the one place the veto takes print, one dot about 3 px across).

## 11. Build v2 (Nov 26): the extractor stops at the fence; the retake prompts ship

Task bslhk2 (Maximus, from Freddy's roadmap: SAM-class segmentation, warp at native resolution, ink-only cleanup). The
branch is `claude/stamp-pipeline-v2-build`, cut from `origin/main` **5597801** (PR #65). Freddy's Nov 26 rules: no paid
services and no photo off the machine; no two-shot or clear true colour in this PR; the retake prompts shown in the
product. Seat: Claude Code, on the Mac.

### The extractor: two strikes, nothing wired

**Today's production on this tip.** `baseline.mjs` was re-run through main 5597801's worker, with the veto on, on every
photo disc available. It reproduces §9–10: the Berg's Node and WebKit crops agree at alpha IoU **0.958**, and the
blotch's detached parts are gone (`sheets/blotch-berg-*-topright.png`). The Nov 14 runs are kept in `runs-nov14/`.

**Strike 1 (Nov 14): full v2 as the stamp** (§6). The DD3 sheen comes out 11.5× larger, the Destroyer gets halos and
holes, and the Raptor loses its black print. Nothing since has changed those numbers: v2's code is the same, and so are
the photos.

**Strike 2 (this build): today's extractor plus v2's whole-new marks** (`additions.mjs`). This was the narrowest
segmentation-first design left. Today's strokes, layers, colour and veto stay. A v2 mark (alpha over half, read at the
photo's own resolution) is added only when at least 80% of it lies over 3 px (at 1024) from today's ink, so it is print
today missed whole, not today's stroke with v2's heavier edge. The Destroyer's halos, the DD3's sheen and the Raptor's
clean finish never reach it: they all sit on today's ink. What it adds, alpha over half at 2048:

| Disc | Today's ink px | Marks added | px added | Largest | What they are |
|---|---|---|---|---|---|
| Berg original | 162,758 | 159 | 953 | 102 | specks |
| Berg stored | 163,062 | 83 | 2,612 | 292 | **the three slashes and the O**; specks |
| Proxy | 123,840 | 28 | 573 | 118 | specks |
| Wraith | 245,886 | 85 | 1,686 | 166 | specks and blobs off the print |
| DD3 (control) | 945,823 | 104 | 951 | 103 | specks |
| Destroyer (control) | 149,350 | 21 | 813 | **509** | **a clump between DES and T**, specks |

The Berg's stored photo gains its flight slashes and the O. It does not gain **PRO**: v2 reads APPPOAL as one mark that
touches today's AP, so it counts as today's stroke. It also gains a stray bar at the right edge
(`sheets/hyb-berg-stored-small.png`). The Destroyer control gains a 509 px clump. That is bigger than the slashes
(106–167 px), so no area floor could keep the slashes and drop the clump (`sheets/hyb-destroyer-top.png`). By the
spike's fence that is a control regression. By the two-strikes rule it is the second miss on the same problem.
**No extractor change is wired.**

**SAM and native resolution.** SAM-class segmentation is not run here or anywhere in the pipeline. Every hosted SAM is
a paid cloud service that would take the photo off the machine, which Freddy's Nov 26 rule forbids. A local SAM is a
model download of hundreds of MB that has to run on the phone. The disc is still localised by production's own rim
fit (`disc-register.mjs`), the stand-in §0 documents. Native resolution still makes today's extractor worse (§2:
296,371 stray px at 3778). v2 at native costs 6.5 s and about 3.4 times the 230 MB it peaked at 2048 (§10) for the separation on
the Berg, plus 16 s of colour pass in Node (§6). That is too much for a phone with no gain the controls allow.

**The veto (PR #55) stays as it is**, the only production change from this line of work. Nothing measured here makes it
unnecessary. Without it, the blotch returns (§9: 14k–340k stray px).

### The retake prompts, in the product

The spike's capture gate (`qa.mjs`) runs on the device in `public/disc-photo-qa.mjs`. Its prompts now carry the feel
check's words (Nov 26, see "Feel-check fixes" below; `tests/photo-qa.mjs` checks them). Two things changed in how it
reads, both measured:

- **Where it reads.** It reads the same 2048 crop the make reads (`photoStampAsset`), before extraction. For a camera
  original it also reads the disc's diameter in the photo's own pixels (resolution and fill). A stored texture is never
  read for those: its size is the site's, not the camera's.
- **Sharpness**, on its second measure. The spike's Laplacian variance failed the sharp Destroyer (§6). The first
  replacement, the edge-normalised |Laplacian| over gradient the spike logged beside it, fitted cleanly on the nine
  real photos (0.475–0.975, blurred 0.305 or less). It then read the photo suites' clean drawn photos as soft
  (0.21–0.41): it rewards a camera's noise and sharpening halos, not focus. That was strike one on this measure. The check
  now measures **edge width**: across each of the strongest edges (the top 2%, at least 200), the width of the
  gradient at half its peak, in px at 1024; the gate takes the median. `qa-calibrate.mjs` blurred each disc (Gaussian,
  sigma 1–5 px at 2048), brightened ×1.8 and darkened ×0.15:
  - real photos read **1.69–2.13 px**. The widest are stored 1024 textures: the Raptor 2.13, the Pixel 2.09;
  - the suites' clean drawn photos read 1.43–2.01;
  - blurred by sigma 1 (half a pixel at 1024), 1.90–2.33. This is a slight softness the extraction reads through, and
    it passes on purpose;
  - blurred by sigma 2 (about 1 px at 1024) or more, every disc reads **2.59 px or more**;
  - brightening or darkening moves the width by at most 0.28 px, and no lit copy fails on it;
  - the threshold is **2.45 px**.

  Exposure, glare, resolution and fill keep the spike's thresholds. Every real photo passes them, and the brightened
  copies fail clipped and glare, as they should. The ×0.15 darkening crushes only the darkest plastics. Those read 0.018–0.086 crushed
  against the 0.05 threshold, so the darker discs among them are prompted.

**A prompt never stops a make.** The asset is made and saved as before. The prompts, worst first, sit under the make's own
status line, and an asset that could not be made carries them too ("No stamp showed up …" then how to retake). A disc
too few pixels across gets the small prompt alone; a disc with pixels enough that still leaves the frame empty gets the
fill prompt. Resolution counts only when the disc also does not fill the photo: a disc filling a low-resolution photo (the stall suite's 1600 px original) cannot be helped by a step closer. The gate adds 78–106 ms per make in Node on this Mac (four photos) and sends nothing
anywhere. The analysis itself is best-effort: if it fails (a phone refusing the glare check's 16 MiB scratch array,
say), the make goes on into extraction with no prompts (`tests/photo-retake-advisory-browser.mjs` injects that failure
on all three Make paths).

**Feel-check fixes (Nov 26, Product & UX at 1280 × 800 and 390 × 844).** The prompts ran on after the make's words in the
same line and style, and read as fine print; on a laptop they sat below the sheet's fold.
- They are their own list (`ul.photo-retake`, role `status`) right under the make's line: one prompt per line, a warning
  triangle, amber text mixed 60% toward the theme's text colour (about 5.8–8.1:1 on the panels of the default, Paper,
  Dusk and dark themes, by the WCAG formula). They belong to the words they came with: any later status clears them.
- When they show, the sheet scrolls them, and the Retake photo button beside them (it is Replace photo), into view.
- Wording: blurry, washed out, too dark, reflection, small, fill (`RETAKE` in `disc-photo-qa.mjs`). None mentions the
  circle guide or tapping to focus, neither of which is on screen then. `RETAKE.fill` was dead code (fill failures said
  "small"); it is now its own line.
- Switching a new photo's Look to Photo replaces "Game asset made" with "Showing the photo."; the prompts clear with it.

**Screenshots** (synthetic photos only, made at run time by `tests/photo-retake-browser.mjs`). They are in
`docs/assets/stamp-pipeline-v2/retake-*`, in the default theme, Paper and Dusk, on desktop Chromium (1280 × 800) and
phone WebKit: a new soft photo, Game asset in one click from a saved soft photo, a small disc and an unfilled one read as
originals. The `-viewport` shots are the whole window the moment a prompt shows.

**Berg sheets** (Freddy's photos, so in ignored `work/stamp-pipeline-v2/sheets/` only, never committed or sent):
`berg-original-sheet.jpg` and `berg-stored-sheet.jpg` show today's production asset beside v2's on the same photo.
`blotch-berg-original-topright.png` and `blotch-berg-stored-topright.png` are the blotch region, top-right and edge.
Today's asset is the production one; nothing here changes it. **The Berg's acceptance stays Freddy's camera-original
re-make.**

**Tested (Nov 26, this Mac; `pnpm` is not on its PATH, so package scripts ran through `npm run`, which runs the same
script lines):**

- `node --test tests/photo-qa.mjs` 6/6 (new) and `node --test tests/stamp-blotch-veto.mjs` 4/4 (the veto, unchanged).
- `npm run test:clear-stamp` passes. `npm run test:photo-stamp-sync` passes: its unit set, the sync suite, and the stall
  suite on WebKit and Chromium.
- `node tests/photo-retake-browser.mjs` passes, on desktop Chromium and, with `PHOTO_STAMP_ENGINE=webkit`, on phone WebKit.
- Review fixes (Nov 26): `node tests/photo-retake-advisory-browser.mjs` passes on Chromium and WebKit and fails on
  7d9fda2. photo-stamp-assets timed out at its pulled-bag-disc check about half the time on main too: a stamp look set
  while the 3D bag was still mounting never reached it (`bag-scene.js` read it before `mountBag` and its listener had no
  viewer yet). The bag now takes the current look once mounted; with the bag model delayed 6 s the check fails every run
  on main and passes every run here.
- These pass: the stamp-look, clear-opacity and halo-plastic unit sets, and the browser suites stamp-look,
  clear-plastic, clear-true-color, clear-opacity, photo-adder-rework, photo-stamp-one-click, photo-stamp-color-assets,
  photo-stamp-assets, photo-stamp-identity, photo-stamp-level, halo-plastic, photo-gestures and photo-source-chooser.
- **photo-editor-contract fails identically on main 5597801** ("This photo could not be compressed"), as on Nov 14.
- Seen on main too, and environment only:
  - clear-true-color and clear-opacity fail on both trees until the Raptor photo is copied into the ignored `work/`.
    With it, both pass on both.
  - photo-stamp-assets timed out at the 3D bag's stamp layer once on each tree, then passed.
  - photo-adder-rework's rim fit hit its 60 s limit once under load, then passed.
- What the gate changed along the way: the sync suite's clean drawn photo read as soft on the first sharpness measure,
  so that measure was replaced (above). The stall suite's 1600 px original was asked to move closer, so resolution now
  defers to fill (above).

### For Freddy

- **The prompts' feel:** wording, placement and whether a soft-photo prompt after a successful make reads right
  (`docs/assets/stamp-pipeline-v2/`). Should a failing photo stop the make instead? It does not today.
- **The extractor:** v2 stays off by the fence. To go further, the controls' regressions have to be fixed first, or
  the fence relaxed by Freddy for a named control. A local, on-device segmentation model is the other route, and it is
  a separate build with its own size and speed budget.
