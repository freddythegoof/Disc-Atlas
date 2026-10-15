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

## Phone check after Freddy deploys

On the iPhone 16 Pro Max in Safari, try Add photo from both the library and the
rear camera with High Efficiency enabled, then Use photo, save, and reopen the
disc to verify its photo and matched color. This real-device check is Freddy's
after deployment; it has not been performed here.
