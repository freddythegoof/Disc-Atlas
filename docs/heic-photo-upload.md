# iPhone HEIC photo upload

Base: clean `main` at `ee74817920c600fb109b5ef70bdf194ac5e242f3`.
Work is isolated on `codex/heic-photo-upload`; the original checkout's
`wrangler.public.jsonc` modification is preserved. No push, deployment, or
remote Cloudflare operation is part of this work.

## Part 1: reproduction

Run `node tests/photo-heic-characterize-browser.mjs ee74817` with
`PLAYWRIGHT_MODULE` and `PLAYWRIGHT_EXECUTABLE_PATH` set as for other browser
suites. Chromium 153.0.8010.12 executed the actual historical module:

| Actual bytes | File.type | Result / failure door |
| --- | --- | --- |
| HEVC HEIC, 128 × 96 | empty | Type gate: "Choose a JPG, PNG or WebP photo up to 30 MB." |
| Same HEIC | image/heic | createImageBitmap: "This photo could not open. Try a JPG, PNG or WebP." |
| Same HEIC | application/octet-stream | Type gate: "Choose a JPG, PNG or WebP photo up to 30 MB." |
| JPEG, 20 × 20 | image/jpeg | Decoded successfully |
| PNG, 128 × 96 | image/png | Decoded successfully |

`tests/fixtures/disc-photo.heic` is genuinely HEVC encoded, not a renamed JPEG.
`tests/fixtures/generate-heic.py` generates the synthetic disc with Pillow and
Pillow-HEIF 1.8.1, including deliberately fake GPS (0° N, 0° E) and a description.
Pillow-HEIF reopens it and verifies dimensions and GPS. Separately, libheif-js
1.23.5's WASM decoder opens and displays it: 128 × 96, center RGBA
`[234, 113, 82, 255]`. The fixture contains no personal photograph or location.
The matching PNG is also generated; the JPEG is the existing fixture.

These tests characterize genuine HEIC bytes with the missing and unexpected
MIME labels an iOS file selection can deliver. They do not establish what this
particular iPhone sends or test Safari's native HEIC support.

## Part 2: shipped decode ladder

The first 4 KiB identify JPEG, PNG, WebP, or HEIF by signatures and ISO BMFF
`ftyp` major/compatible brands. Empty and misleading MIME labels are repaired
from the bytes. SVG, GIF and AVIF remain unsupported; a claimed raster MIME
type cannot admit their bytes.

1. `createImageBitmap` handles the usual native formats.
2. On failure, an `<img>` uses a temporary object URL, draws into a canvas,
   and normalizes to an ImageBitmap. Its object URL is always revoked. Where
   canvas-to-bitmap support is absent too, the canvas carries the editor's
   existing `.close()` release contract (clearing its backing pixels).
3. Only HEIC/HEIF reaching this step dynamically imports the self-hosted,
   unmodified libheif-js 1.23.5 WASM module. It decodes the primary image to
   canvas pixels and normalizes through the same bitmap helper. Handles and
   the decoder context are freed in `finally`; initialized WASM is reused.

The source cap remains 30 MiB, and every decoded path enforces 60 MP. Native
oversized bitmaps are closed; fallback dimensions are checked before allocating
canvas pixels. There are no Worker, storage, projection, editor control,
delighting, color-match, upload-cap, or catalog changes. Every result still
passes through `preparePhoto`'s existing circular rasterization and metadata-free
WebP encoder; originals are never returned as upload data.

The lazy asset costs **2,043,959 raw bytes**, **713,695 gzip bytes** (level 9),
or **515,490 Brotli bytes** (Node defaults), measured locally. Actual transfer
depends on the host's content encoding. There is no decoder fetch or WASM
initialization for native success. Source, hash, upstream links and distribution
licenses are in `public/vendor/libheif/README.md` and its adjacent license files.
HEIC failure explicitly names HEIC and suggests Safari or a new Most Compatible
camera photo; other recognized but undecodable files are described as possibly
damaged.

Initial evidence: three new unit tests failed on the old MIME gate/missing byte
sniffer, then all four `photo-math` tests passed. The local photo browser suite
failed on its new empty-MIME regression before the fix, then passed with real
WASM HEIC pixels for empty, HEIC, octet-stream and incorrect JPEG labels. It
observed one lazy module request across repeated HEIC decodes and none for the
preceding native PNG. Existing local D1/R2 photo behavior passed (90,884-byte
processed WebP).

## Part 3: verification evidence

All checks below ran locally; no remote Cloudflare command was run.

| Check | Result / evidence |
| --- | --- |
| `npm.cmd run test:photo-textures` | Pass: 27 unit/race tests and the full local D1/R2 browser suite, including the new HEIC checks |
| `node tests/photo-textures-browser.mjs` | Pass independently; there is no separate `test:photo-textures:browser` npm script in this checkout |
| `node tests/photo-texture-perf-browser.mjs` | Pass, thresholds unchanged: desktop p95 0.1 ms with/without photo; phone viewport with 4× CPU p95 0.3–0.4 ms with photo vs 0.3 ms without |
| All 26 non-browser `node:test` modules | 210 tests pass: `node --test --test-isolation=none` with the files discovered by `rg -l 'node:test' tests -g '*.mjs' -g '!*-browser.mjs'` (no aggregate `npm test` script exists) |
| `npm.cmd run build` | Pass: catalog rights gate and production vinext build |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Pass |
| Python `-X utf8 validate_data.py` | Pass: 2,434 approval records, 1,182 flight matches, 0 local photos |
| Full repository ESLint | **Pre-existing failure:** 40 errors in unchanged vendored Three.js files, 1,548 warnings. Unchanged base checkout: 43 errors and the same 1,548 warnings; its additional three errors were false React-hook detections of the photo test helper named `usePhoto`. Renaming that helper to `confirmPhoto` removes those without changing behavior. |
| ESLint on changed pipeline/tests | Pass: 0 errors, four existing unused-variable warnings |
| `git diff --check` | Pass |

The browser checks exercise each rung:

- **Bitmap:** real PNG pixels with empty MIME and a misleading `.heic` filename;
  no codec request. Existing WebP editor and JPEG characterization stay green.
- **Image element:** force only the native Blob-to-bitmap API to reject, then
  decode a real PNG through `<img>` and canvas. Exact center pixel is
  `[235, 113, 83, 255]`; the returned ImageBitmap supports `.close()`. Successful
  and corrupt-file URLs are revoked. A second case disables bitmap creation
  entirely and verifies the closeable canvas still produces bounded WebP,
  then releases its pixels. Oversized native-image dimensions reject at 60 MP
  before canvas allocation. None of these cases requests the HEIC module.
- **Converter:** real HEVC fixture bytes decode in Chromium with empty,
  `image/heic`, `application/octet-stream`, and incorrect `image/jpeg` labels.
  Dimensions and colored pixels are checked; there is one module request across
  all decodes. No converter is mocked. A modified `ispe` dimension box exercises
  the 60 MP rejection before RGBA allocation; truncated HEIC gets the honest
  HEIC/Safari/Most Compatible error.
- **Real editor and upload:** `IMG_0001.HEIC` goes through the bag's file input,
  aligner, Use photo, save, private Worker route, reload, and 3D rendering. An
  actual File with empty type replaces it through the same input. The matched
  plate color saves with the disc; replacement changes its key. The captured
  upload is **25,140 bytes**, a WebP with neither EXIF nor XMP chunks nor the
  fixture's embedded description. The original HEIC/GPS never uploads.

The optional photo performance harness initially timed out on its pre-existing
`.bag-photo-edit` selector (the current UI uses the aligner). The test now waits
for the real aligner, clicks Use photo, and waits for it to close before saving.
No assertion or performance threshold was removed or weakened. Python's first
validation attempt encountered Windows' default cp1252 decoding; UTF-8 mode
resolved that without a source change.

A read-only reviewer independently passed the 27 photo unit tests, verified the
vendor hash/ownership, and checked real WASM decoding with HEIF rotations of
0°, 90°, 180° and 270°. No actionable findings. Native HEIC on Safari and
physical camera/library selection remain unverified; the PNG fallback tests
exercise the same native-element branch but do not claim an iPhone test.

Scope audit: `public/data.json`, Workers, upload limits, storage, projection and
editor interactions are unchanged. Only the photo decode module, its decoder
asset/licenses, photo tests/fixtures and this write-up changed. The vendor-local
`.gitattributes` preserves the upstream module's exact bytes across checkouts.

## Phone check after Freddy deploys

On the iPhone 16 Pro Max in Safari, try Add photo from both the library and the
rear camera with High Efficiency enabled, then Use photo, save, and reopen the
disc to verify its photo and matched color. This real-device check is Freddy's
after deployment; it has not been performed here.
