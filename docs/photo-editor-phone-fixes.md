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
