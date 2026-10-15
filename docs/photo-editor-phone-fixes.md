# Photo editor phone fixes

## Plan and constraints

Baseline: clean managed worktree at `f31fd41` (PR #2); `sniffPhotoFormat` verified before branching. Remote main was checked read-only and matches. The original checkout's existing `wrangler.public.jsonc` formatting change is preserved.

Freddy's October 14 brief is the implementation specification. Execute inline, compression before gestures, one scoped commit per numbered part; no push, deploy, or remote Cloudflare commands.

- [ ] Part 1: instrument the actual compression ladder with a real photo in Chromium and WebKit, including forced PNG/null boundaries. Save matrices and a standalone dev-only phone diagnostic under `tests/diagnostics/` (never `public/`). Record verdict before product edits.
- [ ] Part 2: test the absent-WebP boundary RED, add a same-origin lazy pixel-only WASM encoder, retain `[1024,768,512]` / `[.86,.72,.56,.4]` order and 512 KiB cap, and verify GREEN with the Worker's unchanged structural validator and native-output equality.
- [ ] Part 3: record pre-fix CDP touch streams; test pinch distance/midpoint anchoring, finger transitions, cancellation/capture loss, and desktop controls RED; implement persistent captured Pointer Events state and local Safari interference guards; verify GREEN.
- [ ] Part 4: run photo/HEIC, bag, viewer and motion suites; run the atlas perf gate once; lint changed source; record payload sizes, evidence and limitations; independent code review.

Review focus: null canvas results must be distinguished from unsupported WebP; failed lazy downloads must remain retryable; fingers landing/lifting must re-anchor with no change; non-default aspect/perspective must retain the crop point under the pinch midpoint; reset/close/confirm must clear captured pointers without changing an in-flight export.

Upload remains structurally validated WebP, at most 512 KiB and 1024 square. Delight/color, crop sampling, guides and Worker are unchanged. Original bytes and metadata never upload. Physical iPhone success is unverified until Freddy checks after his deploy.

## Part 1 — compression characterization (before product edits)

**Verdict:** no spontaneous failure in the installed engines. Chromium 151.0.7922.34 and Windows Playwright WebKit 26.5 both return WebP. Unsupported WebP simulated by returning native PNG reproduces all 12 type rejections; simulated null reproduces all 12 empty results. These are different failures with the same old generic message. The iPhone cause remains unconfirmed; this WebKit build is not iOS Safari. WebKit was missing and installed for this task (59.6 MiB archive, revision 2336).

Command: `node tests/photo-compression-characterize-browser.mjs f31fd41` (`PLAYWRIGHT_MODULE` may point to the bundled Playwright). Uses the actual historical module and the real 1254 × 1254 `stamped-disc.webp` photograph; only the canvas encoding boundary is overridden for PNG/null cases. Full matrices and actual `preparePhoto` calls: [compression-before.json](photo-phone-evidence/compression-before.json).

Each cell below lists bytes at quality **.86, .72, .56, .4**, in that order:

| Engine / returned type | 1024 px | 768 px | 512 px |
| --- | --- | --- | --- |
| Both native / image/webp | 90764, 49296, 40076, 32836 | 63398, 34920, 28224, 23282 | 36336, 21006, 17426, 14226 |
| Chromium forced PNG / image/png | 1527769 × 4 | 932664 × 4 | 453270 × 4 |
| WebKit forced PNG / image/png | 1227849 × 4 | 764461 × 4 | 380658 × 4 |
| Both forced null / null | null × 4 | null × 4 | null × 4 |

Native `preparePhoto` accepts 1024/.86 at 90,764 bytes. PNG and null each exhaust 12 attempts and throw `This photo could not be compressed. Try another photo.` Even the sub-cap PNG at 512 fails on type alone; PNG quality has no effect. This evidence was collected and recorded before implementing the fix.

Standalone phone probe: [photo-encode.html](../tests/diagnostics/photo-encode.html). Copy this one HTML file to a phone-accessible dev host or open it locally in Safari; select the failing photo and copy the printed support result and 12-row matrix. It has no external dependencies or upload code. It uses a centered circular crop without the app's lighting correction, so exact byte counts differ; the encoding API, requested types, sizes and qualities are identical. Its answer on Freddy's iPhone is ground truth. It is outside `public/` and is not shipped by the app build.

## Part 2 — compression fix and proof

One 1 px canvas probe per module lifetime distinguishes WebP, a returned alternative format, and an inconclusive null. WebP remains the native `toBlob` fast path with identical sizes/qualities. A returned PNG triggers dynamic import of `disc-webp.mjs`, then the pinned portable jSquash encoder. A later unexpected PNG also recovers at the same rung. Null results retain native retries at the original qualities/sizes; they do not masquerade as missing format support. Each rung's canvas is released after use. Original bytes never enter the encoder: it sees only the exact existing cropped, de-lit RGBA pixels; color measurement is untouched.

Errors distinguish empty native encoding results, genuine 512 KiB exhaustion, encoder import/download failure, and WASM encoding failure. A failed WASM download can be retried in-place; a failed JavaScript module import asks for reload (browser module maps cache import failures).

New lazy executable payload: **321,869 bytes raw / 126,320 gzip-9 / 101,105 Brotli**, summing independently compressed files. WASM alone: 281,261 raw / 114,911 gzip / 90,860 Brotli. Native browsers fetch none of it. [Vendor provenance, hashes and licenses](../public/vendor/webp/README.md); package source: [jSquash](https://github.com/jamsinclair/jSquash). No application package or lockfile change.

`node tests/photo-compression-browser.mjs` first failed against unmodified `preparePhoto` with `chromium/png: This photo could not be compressed. Try another photo.` After the fix it passes in both engines, using the real WASM encoder and the unchanged production Worker `photoRoute` to validate every returned upload structurally (storage alone is doubled).

| Case (both engines) | After |
| --- | --- |
| Native | 1024 px, 90,764 bytes; exact equality with original native canvas output; no fallback requests |
| PNG, including unexpected PNG after successful probe | 1024 px, 88,778 bytes; structurally valid WebP, below 512 KiB |
| Repeated unsupported saves | One probe, one WASM download |
| All null | Honest `browser returned no image data` error; no WASM download |
| 1024 null, smaller succeeds | Original four 1024 attempts, then 768/.86, 63,398 bytes |
| Every encoded blob over cap | All 12 rungs in original order, honest 512 KiB error |
| WASM download HTTP 503 then retry | Load-specific error, then valid 88,778-byte WebP |

Full after results: [compression-tests.json](photo-phone-evidence/compression-tests.json). Existing photo math/albedo/Worker/race/HEIC-sniff unit suites: **27/27 pass**. Changed source lint: clean.

Existing local D1/R2 photo browser suite also passes, including real HEIC decode for four MIME labels, native element/canvas fallbacks and cleanup, 60 MP caps, editor choose/use/save/reload/render/replace, color matching and EXIF/GPS stripping. Its recorded upload remains 25,140 bytes.

## Part 3 — captured pan/pinch gestures

Before: `node tests/photo-gestures-browser.mjs --characterize f31fd41` uses Chromium CDP touch injection with a 430 × 932 mobile viewport and an actual 386 px aligner stage. [Full pre-fix event stream](photo-phone-evidence/gestures-before.json) includes coordinates, pointer IDs/capture and the resulting options after every event. The harness waits two animation frames after each injection so coalesced events and preview redraws settle. Single-pointer cancellation is the only synthetic Pointer Event boundary; CDP's `touchCancel` cancels the entire contact set. All other sequences use real browser-generated Pointer Events from CDP touch input.

| Sequence | Before | After |
| --- | --- | --- |
| One finger +24/+12 px | cx .429865285, cy .464932642, scale .94 | Identical |
| Distance 120 → 160 px; midpoint +20/+10 px | scale .94 (no zoom), cx .850673575 (teleport) | scale **.705**, cx **.470777202**, cy **.485388601** |
| Pinch back to 130 px | scale .94 | **.867692308** |
| Drag +20, second finger, two-finger pan +10 | cx **.704559585** (teleport) | **.412331606** |
| Lift second finger, move survivor +10 | cx .704559585 (stuck) | **.383108808** |
| Cancel, fresh single drag +10 | cx .675336788 (retains wrong framing) | **.383108808** |

Before assertions fail with `pinch-out scale: 0.94 != 0.705`; the selected cancellation sequence also fails with `mid-drag pan: 0.704559585492228 != 0.41233160621761655`. Both original failure sequences pass after. [Full after stream](photo-phone-evidence/gestures-after.json).

Implementation: one editor-owned pointer map and gesture anchor, with per-pointer capture. One pointer preserves the existing drag semantics. Two pointers invert the distance ratio into crop scale (smaller crop scale means a larger visible photo) and preserve the exact source point under the moving midpoint using the unchanged `photoPoint` projection. Landing, lifting, cancel and lost capture re-anchor without changing any option. Preview/guide redraws do not recreate gesture state. Sliders, wheel, keys and resize re-anchor around the current options. Close/reset/confirm clear captures; confirmation snapshots the options and ignores input while preparing the export.

The stage has `touch-action:none`; the dialog uses `touch-action:manipulation` and retains hidden overflow. Non-passive touch and Safari legacy gesture listeners prevent stage scrolling, page pinch and stage double-tap interference. Native single-finger control taps remain usable. No new gesture payload or library.

`node tests/photo-gestures-browser.mjs` passes ten sequences with **1e-5 tolerance**: drag, pinch in/out with off-center midpoint, mid-drag landing/lift, full cancellation, partial cancellation, lost capture, tilt/aspect/perspective anchoring, both zoom bounds, mouse/wheel/keyboard/sliders after touch, and reset during capture. Capture is asserted for every down; viewport scale and page scroll stay unchanged. Controls test waits for the dialog close event before reopening, matching the editor's asynchronous lifecycle.

`node tests/photo-editor-contract-browser.mjs` compares baseline and final processing in Chromium and WebKit for default, pinched and corrected transforms: **exact RGBA/color/WebP equality** for all three. It also verifies computed touch-action/overflow, effective `preventDefault` for legacy gesture/touch/double-click events and uncancelled native control taps. The dialog guard assertion was observed RED (`auto` instead of `manipulation`) then GREEN. These synthetic legacy events prove listener registration/cancellation, not physical Safari behavior. Guides and crop math are unchanged.
