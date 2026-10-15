# Photo rim color

Implemented on `codex/photo-rim-color`, based on local `main` at
`5b5063795559bfa0d128a5b00d1a07c066f0ca07`. Initial investigation and Freddy's
storage decision: October 14, 2026. Verification: October 15, 2026.

## Behavior and precedence

A photo applied to an overmold now measures its rim independently of its plate.
The saved sample reaches the detail panel and popout, bag meshes, Storage/Lost
collection models (including stowed rack instances and pulled discs), list/detail
thumbnails, and personal-map artwork through the existing rim-color inputs.
No renderer samples pixels, and photo projection and disc geometry are unchanged.

Clay materials still win while clay is on. With clay off, resolution is:

1. An explicit `rim_color` wins, including after photo replacement or removal.
2. An attached photo's stored `photo_rim_color` supplies an automatic rim.
3. With no photo or no stored sample, the renderer's existing fallback applies.

Non-overmolds retain their single material and do not sample a rim on apply.
The editable plate color keeps its existing behavior: applying a new photo
matches the plate; subsequent manual edits persist. The rim input still denotes
an explicit choice, not the automatic photo sample.

The detail/popout and atlas/thumbnail fallbacks are black (`#0a0a0a`) in Light
and white (`#ffffff`) in dark themes. Bag/collection models already defaulted to
black in all themes; those existing photo-less defaults remain unchanged.

## Sampling method

`public/disc-albedo.mjs` exports `rimColor()`. At **Use photo**, the existing crop
and albedo pass prepares 1024 × 1024 RGBA pixels. The estimator runs once on those
processed pixels, before lossy encoding. If compression subsequently requires
768 or 512 pixels, the 1024-pixel sample is retained. It is not recalculated on
render, theme change, clay change, or reload.

The inner sampling boundary is the mold's actual overmold seam, `Ri / R` from
`shapeFrame()`, shared with the editor guide and the photo projection cutoff.
The seam guard is the greater of two pixels or 8% of the annulus width. The outer
guard is the greater of two pixels or 2% of the disc radius, excluding the
antialiased crop edge. Four radial bands × 128 equally spaced angles yield
512 candidate samples, so a localized hotspot has limited angular votes.
Only pixels with alpha at least 250 count; fewer than 256 opaque candidates
returns NULL rather than inventing a color.

For candidate pixels, compute linear-light luminance and its median and median
absolute deviation (MAD). Keep samples no brighter than the lower of the 90th
percentile and `median + 3 × max(0.005, 1.4826 × MAD)`. This removes specular
outliers relative to that rim's own distribution. A uniformly white rim remains
white; there is no absolute white-pixel rejection. The retained samples' per-channel
linear-light medians are encoded through the existing sRGB lookup to `#rrggbb`.
The existing plate estimator and albedo correction remain unchanged.

## Persistence and lifecycle

The first pass correctly stopped because `bag_discs.rim_color` already stores
explicit user intent, while the plate match persists in `bag_discs.color`.
Freddy resolved this on October 14 by authorizing a dedicated nullable column.

`migrations/accounts/0011_photo_rim_color.sql` adds `photo_rim_color` with the
same six-digit hex constraint as the explicit rim field. Existing rows default
to NULL. No existing explicit choices or photo keys are rewritten.

The editor captures the prepared Blob and sample together before the metadata
save. It sends the sample in `X-Atlas-Photo-Rim-Color` on the existing private WebP
PUT. The Worker validates plain `#rrggbb`, normalizes case, and updates the new
field **in the same conditional SQL UPDATE and D1 transaction that attaches the
texture key**. Ownership, Origin/CSRF checks, upload limits, cleanup intents,
and the existing compare-and-swap protection remain in force. Invalid samples
cannot replace the saved photo. A stale or failed attachment cannot replace its
sample either.

Replacement overwrites both values. Missing/empty sample headers remain
compatible with older upload clients and clear any old automatic sample.
Photo DELETE clears the key and sample in one UPDATE, preserving explicit
`rim_color`. Disc/account deletion removes the row and its sample. Ordinary bag
edits preserve the sample; it cannot be changed through the generic disc fields.
All bag read endpoints include it. The shared `bagRimColor()` requires an attached
photo before using the automatic sample, preventing a stale value from keeping a
removed photo's rim alive.

**Existing photos require reapplying/replacing the photo to obtain a sample.**
The migration does not backfill image-derived values. An already-saved Pixel with
NULL retains its old fallback until the user reapplies its photo. This is the
specified apply-time sampling lifecycle, not an in-memory persistence workaround.

## Freddy's deploy order

**Apply migration 0011 remotely BEFORE deploying any code that reads the new
column.** Freddy runs the established remote D1 migration step himself, then the
normal deployment. This branch only exercised migrations against local SQLite
and isolated local Wrangler D1/R2. No remote command, push, or deployment was run.
The pre-existing modification to `wrangler.public.jsonc` was left untouched.

## Verification

The sampler, attach lifecycle, and bag propagation regressions were observed
failing before their respective fixes, then passing. Independent review found a
delayed metadata-save race; its new regression failed before the Blob/sample
snapshot fix and passed afterward. Existing editor/account/upload race coverage
continues to pass.

`npm run test:photo-rim` exercises a real local Worker, D1/R2, signed-in fixture,
the actual photo editor, and GPU materials. Its synthetic Pixel photos have
known dark `#101418` and light `#e4e8ec` rims plus a white glare sector. Acceptance
is **±8 sRGB byte values per channel** against known rim colors, including the
real crop/albedo/encode/attach/reload path. It verifies detail and popout material
colors, clay on/off, bag/collection materials, thumbnail inputs, map color
publication, and rendered atlas rim pixels against an independently colored
reference. It also covers explicit-choice precedence, photo replacement/removal,
theme fallback restoration, and a non-overmold with an actual photo.

Raw sampler unit cases include dark, light, saturated-color rims, glare, plate
contamination, transparent edges, and insufficient coverage. Storage tests cover
migration preservation/constraints, invalid input, older clients without a sample,
fresh endpoint reads, removal, and late uploads losing to newer photos/deletion.

### Screenshot evidence

These are **synthetic Pixel reproductions**, not Freddy's photograph. The before
images use a real saved legacy photo with NULL sample, recreating the old renderer
fallback; after images use the same source reapplied through the real editor.

| Theme | Before | After |
| --- | --- | --- |
| Dark (Midnight), 390px | [White fallback rim](../outputs/photo-rim-color/midnight-before.png) | [Photo-matched dark rim](../outputs/photo-rim-color/midnight-after.png) |
| Light, 390px | [Black fallback rim](../outputs/photo-rim-color/light-before.png) | [Photo-matched dark rim](../outputs/photo-rim-color/light-after.png) |

Additional images show both popouts, the light photo rim in both themes, and
photo removal restoring each theme's fallback. Inputs, measurements, screenshot
artifacts, and suite logs are in ignored `outputs/photo-rim-color/`. The regression
script generates its deterministic input PNGs; no remote media or live account
is used.

### Regression results

The initial batch is recorded in `outputs/photo-rim-color/suite-results.json`;
fresh final runs are recorded separately in `recheck-results.json`. Initial
failures are retained rather than overwritten.

Three browser-harness repairs preserve their original assertions:

- `test:appearance` timed out on a cache-key suffix that predated photo keys.
  The identical timeout reproduced on untouched `main`. It now checks the public
  `atlasArt.get()` API for the desired rim, rather than private key formatting.
- `test:bag:demo` read phone overflow before the resized 3D hit targets had
  followed the canvas. It now waits for the no-overflow condition before checking
  the same bounds. Untouched `main` passed that check, confirming it was transient.
- `test:bag:spin` attempted a pointer tap while a theme-transition snapshot still
  intercepted events. The identical failure reproduced on untouched `main`.
  Its theme helper now waits for `theme-switching` to clear before interacting.

The older standalone `tests/bag-interactions-browser.mjs` and
`tests/bag-tweaks-browser.mjs` **still fail**, identically on this branch and an
untouched archive of the base commit. They are not registered package scripts.
The former waits for the pre-October-7 one-click detail behavior at line 159;
current interaction suites require opening the popup from the disc's name first.
The latter fails its older map-margin target at line 59 (right margin
78.4599609375 px in both trees). Changing interactions or map geometry to make
these older expectations pass would exceed this rim-color task. Their baseline
and current logs are retained under `outputs/photo-rim-color/`. Consequently,
**the claim that every standalone bag file is green remains unmet**; these are
explicit pre-existing verification flags, not demonstrated photo-rim regressions.

An extra invocation of `photo-heic-characterize-browser.mjs` without a historical
ref also failed: it expects the old decoder's failures, while current HEIC
decoding succeeds. The documented invocation with ref `ee74817` passed. This is
a historical characterization, not a current-decoder regression check; current
HEIC decoding and editor flows passed in the photo suites.

**All 19 registered photo/bag/appearance/disc3d commands below passed (exit 0).**
This includes 32 photo unit/race tests, 61 bag unit tests, and the real browser
flows. The two older standalone bag failures above remain flagged; this is not
an assertion that every file under `tests/` passes.

| Command | Final result |
| --- | --- |
| `npm run test:photo-textures` | Pass |
| `npm run test:photo-phone` | Pass |
| `npm run test:bag` | Pass |
| `npm run test:bag:browser` | Pass |
| `npm run test:bag:overmold` | Pass |
| `npm run test:appearance` | Pass |
| `npm run test:bag:demo` | Pass |
| `npm run test:bag:memorial` | Pass |
| `npm run test:bag:collections` | Pass |
| `npm run test:bag:scene` | Pass |
| `npm run test:bag:v13` | Pass |
| `npm run test:bag:3d` | Pass |
| `npm run test:bag:staging` | Pass |
| `npm run test:bag:spin` | Pass |
| `npm run test:bag:controls` | Pass |
| `npm run test:bag:popup` | Pass |
| `npm run test:bag:switch-dump` | Pass |
| `npm run test:disc3d` | Pass |
| `npm run test:photo-rim` | Pass |

Additional checks passed: the isolated photo-texture performance script, current
compression characterization, the standalone bag v1.2 suite, and the standalone
map-controls run. The HEIC historical characterization passed with `ee74817`.
Syntax checks and `git diff --check` passed. Independent code review has no
remaining actionable findings.

The synthetic glare fixtures measured **dark `#101418` and light `#e4e8ec`**,
exactly matching their known input colors (0 channel error; acceptance ±8).
`measurements.json` records these values and an empty page-error list. Both
before/after themes and the additional light-rim/removal screenshots were
visually inspected. There is no remaining persistence stop: migration 0011 is
written and locally verified; remote application remains Freddy's step.
