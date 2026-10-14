# Photos on your discs

Plan 22 adds one **Add photo** button (a labelled Photo field with a camera icon) to the bag Add/Edit sheet. Mobile offers the rear camera; desktop opens the file picker. The selected image stays on this device. Choosing it opens the **aligner**, a large pop-out (full screen on phones) whose editor-only guides show the crop's rim circle, the mold's flight-plate circle, a crosshair with a centre point and a light grid, with everything outside the rim dimmed. Photograph straight down, with the whole disc in frame. Drag (or arrow keys, scroll, +/−) to center; **Adjust photo** changes framing, foreshortening, its direction, and a small near/far perspective correction. **Use photo** prepares the upload and returns to the sheet with its thumbnail; **Cancel** returns with nothing changed. This is a guided crop, not automatic disc detection or a reconstruction of an arbitrary oblique photograph.

Save sends only the processed WebP. The original filename, source bytes and EXIF/GPS are never uploaded. Replace photo and Remove photo work on the same physical copy. A failed photo upload keeps the saved copy and its ID so retry does not add another disc. Account changes and closing/reopening the editor invalidate pending processing. Using a photo sets the disc's colour to the plate colour measured from it (editable; Remove in the same sheet restores the colour it replaced).

## Processing and projection

`public/disc-photo.mjs` decodes locally, samples through an inverse projective crop with bilinear interpolation, preserves source alpha, and applies an antialiased circular mask. The working source is at most 2048 pixels on its longest side. Output starts at 1024 × 1024, tries WebP qualities 0.86 through 0.40, then 768 and 512 pixels if needed. Before encoding, `public/disc-albedo.mjs` removes the photo's own lighting: a robust quadratic illumination fit over the plate is divided out in linear light (fine detail survives), a warm or cool cast is removed only when near-neutral white ink or glare shows it, exposure is kept in a sane band and clipped glare is pulled halfway back. The guides never reach the upload. Nothing above **512 KiB** is sent. Sources above 30 MiB or 60 megapixels are rejected. HEIC/HEIF depends on the browser decoder; the UI asks for JPG/PNG/WebP when decoding is unavailable.

The photo has its own dome-following top mesh (`public/disc3d/photo.mjs`). Its UV coordinates are Cartesian: `u = 0.5 + x / diameter`, `v = 0.5 - z / diameter`. They do not use the lathe's angular UVs. Vertex height comes from the same `topHeight` used by the mold. Projection stops at the shoulder, or the inner overmold seam. The photo wears a copy of the plate material it covers (same lighting model, roughness, clearcoat and shader hook), so the scene lights the design like the plastic; detail views add a faint relief from the design's contrast. The outer rim, underside, chosen solid colors and overmold material are untouched. The photo covers the full photographed diameter mathematically; the physical flight plate clips the photo's rim area.

The generic text stamp stays visible while loading and on load failure, then hides when the photo is ready. Clay hides the photo and stamp; switching Clay off restores the photo. Panel and popout receive the same private photo URL. Bag meshes, bag/storage/lost thumbnails, pulled storage discs, lost discs and personal map art use the same projection. Stowed rack discs retain their efficient instanced side profiles; pulling a disc reveals its photo. The bag's photo surface takes a quarter turn about the disc's own axis so a pulled bag disc reads upright, as the rack's pulled disc already did. Copies without a photo keep the existing appearance.

Detailed viewers decode at 1024 pixels, collection displays at 512, and bag/map/thumbnail displays at 256. Live textures are reference-counted, disposed when their last consumer releases them, and cleared on an account change. Map artwork keeps the eight most recently drawn photos live (a loading photo is never evicted), so a level change draws at once; a finished image at any level beats a loading placeholder, and the final image key does not depend on a live GPU texture. Thumbnail loading follows intersection visibility, refreshes only the completed photo's visible consumers, and releases a row once its image is final.

## Private storage and cleanup

The public Worker remains `workers/public.mjs`, configured by `wrangler.public.jsonc`. Its existing bindings are AI, ASSETS and the D1 DB `disc-atlas-accounts`; this change adds **TEXTURES → disc-atlas-textures**. No public bucket access or public image URL is configured.

Migration `0010_bag_texture.sql` adds nullable, constrained `bag_discs.texture_key` beside the existing appearance data. Existing rows get NULL. R2 contains the processed image; D1 contains only its random object key.

`GET`, `PUT`, and `DELETE /api/bag/discs/:id/photo` authenticate the cookie session and query the row with both its ID and owner ID. Mutations also verify Origin and the session CSRF token. Another owner receives 404. Responses use `private, no-store`; client fetches use same-origin credentials and no-store. The Worker checks the upload byte cap, static WebP chunk structure, coded dimensions (not just the extended canvas), and rejects EXIF/XMP, animation, oversized frames, and unexpected payloads. A bounded ICC color profile from the browser encoder is accepted.

Every upload writes a durable cleanup intent before putting its unique object in R2. A D1 batch conditionally attaches the key only if that copy and its old key still match, then clears the new object's cleanup intent. SQL triggers queue replaced keys and deleted-copy keys, including account deletion through the foreign-key cascade. The Worker attempts deletion immediately on replacement, removal, disc deletion and account deletion. Failed R2 deletes keep their queue entries; a 15-minute Worker cron retries them. Interrupted uploads become eligible after one hour. Thus an outage may delay physical deletion, but detached objects remain durably tracked for cleanup. No cleanup depends on a fire-and-forget in-memory promise.

## Local verification

`tests/auth.wrangler.jsonc` binds a **local** R2 bucket and the existing local Google fixture. `tests/photo-textures-browser.mjs` builds the assets, applies migrations with `--local`, and runs Wrangler with `--local` using isolated state under `work/photo-textures/local`. It never creates a Cloudflare bucket or uses remote D1/R2.

Run `npm.cmd run test:photo-textures` with the same `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_EXECUTABLE_PATH` environment variables as the other browser tests. Coverage includes processing/mask/UVs, real local D1/R2 save/replace/remove, owner denial, migration constraints, cleanup retries and races, copy-specific fallback, panel/popout, Clay, more than eight photos, visible-only thumbnails, upload retries and account/editor races.

Review images are under `outputs/photo-textures/`: `panel-before.png`, `panel-after.png`, `popout-before.png`, `popout-after.png`, and `photo-editor.png`. `tests/fixtures/stamped-disc.webp` is a synthetic, AI-generated top-down disc photo with an original FIELD TEST mountain/sun stamp, used for reproducible QA; it is not Freddy's photograph or manufacturer artwork.

### Recorded results — October 13, 2026

**Update (Plan 22 review, October 13):** the gate's failures are pre-existing variance; see [plan-22-review.md](plan-22-review.md) for the interleaved evidence. The record below is the builder's, unchanged.

**The atlas performance gate remains unresolved.** Functional checks passed, but both attempts at the required atlas performance command exited 1. This change is not a demonstrated performance-gate pass, and the measurements do not establish that there is no regression.

| Requested command, verbatim | Latest exit code | Result |
| --- | ---: | --- |
| `npm.cmd run test:disc3d` | 0 | Pass |
| `npm.cmd run test:apple-design` | 0 | Pass after fixing photo-event registration in the browser bootstrap; the initial run failed six VM tests |
| `npm.cmd run test:apple-design:2` | 0 | Pass |
| `npm.cmd run test:apple-design:3` | 0 | Pass |
| `npm.cmd run test:atlas:persist` | 0 | Pass |
| `npm.cmd run test:add-menu` | 0 | Pass |
| `npm.cmd run test:bag:popup` | 0 | Pass |
| `npm.cmd run test:sliders` | 0 | Pass |
| `npm.cmd run test:atlas:3d:perf` | 1 | Fail on both attempts; details below |

Additional checks passed: `npm.cmd run test:photo-textures` (14 unit/race tests plus local Wrangler browser coverage), `npm.cmd run test:bag` (60 tests), and `node --test --test-isolation=none tests/auth.mjs tests/photo-textures.mjs tests/photo-editor-races.mjs tests/photo-math.mjs tests/bag.mjs` (38 tests). The latter includes account deletion through the actual Worker route, isolated owner cleanup, and scheduled recovery after an R2 outage. Independent review led to committed regressions for account/editor races, upload retry reconciliation and visible-only thumbnail loading.

The feel check used Add photo on a real bag entry: the synthetic sample's navy FIELD TEST stamp appeared on the coral top plate in the detail panel and popout, with the dark rim preserved. Clay hid the image and switching it off restored it. Replacing the photo persisted after reload; a second copy without a photo retained its original appearance; removing the photo restored the generated stamp and made the old private image unavailable. Desktop and phone viewport screenshots were inspected.

| View | Before | After |
| --- | --- | --- |
| Detail panel | [Plain disc](../outputs/photo-textures/panel-before.png) | [Photo plate](../outputs/photo-textures/panel-after.png) |
| Popout | [Plain disc](../outputs/photo-textures/popout-before.png) | [Photo plate](../outputs/photo-textures/popout-after.png) |
| Phone viewport | — | [Panel](../outputs/photo-textures/panel-after-phone.png), [popout](../outputs/photo-textures/popout-after-phone.png) |
| Add/Edit sheet | — | [Photo guide](../outputs/photo-textures/photo-editor.png) |

These screenshots and raw logs are local review artifacts in ignored `outputs/`; the synthetic WebP fixture and test scripts are committed.

### Texture cost and isolated rendering

The sample compressed to **93,430 bytes (91.24 KiB)** at 1024 × 1024, against the 524,288-byte hard cap. A decoded RGBA bitmap is 4 MiB at that size. RGBA8 GPU storage including mipmaps is approximately **5.33 MiB per WebGL context**: panel and popout together can allocate 10.67 MiB even when sharing the CPU texture source. The 256-pixel bag/map texture costs approximately 0.333 MiB on the GPU; a 512-pixel collection texture costs 1.333 MiB. These are incremental photo costs, excluding existing geometry, environment maps and cached raster canvases.

`node tests/photo-texture-perf-browser.mjs` ran on a quiet machine with an NVIDIA RTX 3070 through ANGLE D3D11. Each run warmed 32 frames and measured 128 `renderer.render` calls followed by `gl.finish`, alternating plain/photo/plain/photo/plain in the same renderer with the same pose and lights. This synchronizes completed WebGL work rather than measuring only CPU submission. Browser timing is coarse; a recorded zero median means below the roughly 0.1 ms timer resolution, not zero rendering cost.

| Viewport / renderer buffer | Plain median / p95 | Photo median / p95 |
| --- | --- | --- |
| Desktop / 300 × 230 | <0.1 / 0.1 ms | <0.1 / 0.1 ms |
| Phone viewport, 4× CPU slowdown / 340 × 190 | 0.2 / 0.3–0.4 ms | 0.2 / 0.4–0.5 ms |

Both appearances used three draw calls; triangles increased from 11,488 to 12,768. The phone case still uses the desktop GPU and is not a physical phone measurement. Raw results: [texture-perf.json](../outputs/photo-textures/texture-perf.json).

### Unresolved atlas performance gate

The full atlas benchmark measures navigation and long tasks separately from the isolated disc renderer above. Both current-tree attempts ran with other test and agent browser workloads idle, with an untouched `9ef2810` baseline run between them. No thresholds were changed.

| Run | Desktop warm flight p95, 3D / 2D | Phone warm flight p95, 3D / 2D | Phone warm long tasks, 3D / 2D | Result |
| --- | --- | --- | --- | --- |
| Current, first attempt | 6.1 / 3.7 ms | 21.7 / 23.5 ms | 11 / 12 | Fail: desktop frame-time comparison |
| Untouched `9ef2810` baseline | 5.4 / 3.9 ms | 21.2 / 16.5 ms | 10 / 9 | Pass |
| Current, second attempt | 5.2 / 4.1 ms | 20.6 / 17.0 ms | 7 / 5 | Fail: phone long tasks exceed the allowed +1 |

The second run passed frame-time comparisons, but its seven phone long tasks exceeded the six permitted against the five-task 2D result. Different failure conditions across the two attempts show variability, but the passing baseline means these results cannot be dismissed as a proven pre-existing failure. Further performance investigation is still needed.

Logs: [first current run](../outputs/photo-textures/test-atlas-3d-perf.log), [baseline](../outputs/photo-textures/atlas-perf-baseline.log), [second current run](../outputs/photo-textures/test-atlas-3d-perf-rerun.log), and [command exit codes](../outputs/photo-textures/regression-results.txt). The latest structured atlas result is [perf.json](../outputs/atlas-3d/perf.json).

Investigation stopped after the second failure under the local [Map QA skill](C:/Users/user/.codex/skills/map-qa/SKILL.md): “**Two-strikes:** miss twice on the same problem → stop, report, escalate. Do not keep trying variants.” This leaves the performance gate explicitly open while preserving the verified functionality. The user's instruction prohibits deployment during this task.

## Deploy sequence — Freddy runs these

These commands are documentation only. No bucket creation, remote migration, push or deployment was run for this change.

```powershell
npx.cmd wrangler r2 bucket create disc-atlas-textures
npx.cmd wrangler d1 migrations apply disc-atlas-accounts --remote --config wrangler.public.jsonc
npm.cmd run deploy:workers
```

`deploy:workers` is the established `wrangler deploy --config wrangler.public.jsonc` command; that config's build hook packages the public assets. The deploy includes the R2 binding and cleanup cron. Keep the bucket private. After deployment, verify Add/Replace/Remove in a real account and confirm another signed-in account cannot retrieve its photo.
