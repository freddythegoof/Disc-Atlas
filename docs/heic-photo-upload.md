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

## Phone check after Freddy deploys

On the iPhone 16 Pro Max in Safari, try Add photo from both the library and the
rear camera with High Efficiency enabled, then Use photo, save, and reopen the
disc to verify its photo and matched color. This real-device check is Freddy's
after deployment; it has not been performed here.
