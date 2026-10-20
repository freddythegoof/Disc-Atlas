# Phase 4b — the two control captures (session interesting-bun-3677b7, branch claude/interesting-bun-3677b7 = 4c853e9 + Phase 4b commit)

## Result in one line
The before build (e59e67e replayed through the gate's own installBaseline route) blocks in the same compositor readback per flip under the gate flags on this Mac: phone 244, desktop 195 (after build under the same flags: 242 / 64 in Phase 4). The "phone 2 / desktop 0" before numbers are the committed PC rows in docs/images/storage-all-discs-fixes/before.json, which the gate reads from disk (tests/gallery-fixes-browser.mjs:90) for its limits; they were never a Mac measurement. On the Metal path (Atlas flags, --enable-gpu only) the after build has zero GLES2::ReadPixels: phone 16 (all the owner-photo continuation on Destroyer returns, 72–73 ms CPU at 4×), desktop 0.

## Numbers (one copy of the gate's warm rep each)
| Capture | Flags | Renderer | Long tasks obs/trace | Longest | fly/still/reveal p95 | Readbacks ≥50 ms in flip block |
|---|---|---|---|---|---|---|
| before-phone | gate | SwiftShader | 244/244 | 302 | 12.7/0.9/170 | 241 of 360 |
| before-desktop | gate | SwiftShader | 195/195 | 240 | 3.3/0.1/103.6 | 62 of 360 |
| atlas-phone (after) | atlas | ANGLE Metal M4 | 16/16 | 73 | 8.1/0.2/104.3 | 0 (no ReadPixels) |
| atlas-desktop (after) | atlas | ANGLE Metal M4 | 0/0 | 0 | 2.8/0.5/50.2 | 0 |

Before build classes: click frame (readback inside the click frame, no reveal frame) 180 phone / 135 desktop, viewer scheduled photo draw on Destroyer arrival 63 / 60 (236–302 ms, DoLinkProgram present). Per transition the Stalker arrival (from Destroyer) stays under the line (click frame 43.7 ms phone, readback 28.6 = stills level); Buzzz/Luna 90 ms; cause not chased. Desktop 195 vs 64 is line placement (stock click frames 51–52 ms vs after's reveal frames 46–47).

Caveat: analyze.py's per-flip columns attribute click-frame tasks to the previous flip (task starts ~1 ms before the mark); extra.py keys by the mark's own flip and is the source of the per-transition table.

## Where
Doc: docs/gallery-perf-hunt.md "Phase 4b". Evidence: docs/assets/gallery-perf-hunt/phase4b/ (four gzipped traces ~42 MB with sha256 in manifest.json, tasks CSVs, summaries, extra.json, logs, loop JSONs, renderer smoke record, probe.mjs/extra.py/window.py as .txt, sha256.json). Ignored scripts in outputs/gallery-perf-hunt-mac/. Gate file byte-identical to 12b939f. Committed locally, not pushed. The branch was pointed at 4c853e9 (it had no commits of its own) so 4b stacks on 4.

## Open for Freddy (gate edits, outside brief)
D3D11 only on Windows in the gate's launch line (as tests/atlas-3d-perf.mjs:125)? before.json recorded per machine? The before build under the Atlas flags was not captured.
