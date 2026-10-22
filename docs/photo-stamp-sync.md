# Photo stamps v3: account-synced assets and phone generation

October 21, 2026. Branch `claude/photo-stamp-server-sync`, own worktree, from freshly fetched `origin/main` **`86eed7f`**
(photo stamps v2, PR #40). Local commits only: no push, no PR, no merge, no deploy. In order: `b3b4b59` the build,
`f88a8b4` a test race fixed, `90fbdd5` Graphify, `16c1455`/`a4bda73` this write-up, `335df04` no step waits forever,
then the write-up and Graphify for it.

> **Migration first.** This branch adds **`migrations/accounts/0013_photo_stamps.sql`**. Apply it to the remote
> `disc-atlas-accounts` D1 **before** deploying the Worker, in the standard order:
>
> ```bash
> npx wrangler d1 migrations apply disc-atlas-accounts --remote --config wrangler.public.jsonc
> ```
>
> If the Worker goes out first, nothing is lost but two things stop until the migration lands: every stamp route answers
> 503 (the sheets say the account could not be reached and keep the look as it was), and the textures cleanup cron skips
> its run (its query now also reads `bag_photo_stamps`; the queue keeps its rows and drains once the table exists).
> Nothing was applied remotely from this branch.

## Freddy's ruling, in one line

After v2 shipped, Freddy opened his bag on his phone: the discs wore the old look, and the phone would not generate
assets either. "If I did it on the computer, it should be the same on my phone." The v1/v2 rule that kept assets in the
browser (IndexedDB, no migration) is retired: **the generated stamp assets and the Look belong to the account.**

## The phone's refusal: what it actually was

The suspect on file was the WebKit failure in `photo-editor-contract-browser`, *"This photo could not be compressed"*:
Safari's canvas writing PNG when asked for WebP. **That was not it.**

- **That message comes from old code.** The contract suite checks today's photo pipeline against the one at `f31fd41`
  (October 14, before the bundled WebP encoder existed). In WebKit, the canvas writes PNG when asked for WebP, and the
  October 14 code has no fallback, so *the baseline* throws. Today's pipeline already falls back to the bundled encoder.
  The suite still fails in WebKit for that reason. This branch leaves it as it is (it is not the generation path).
- **The real cause, found by running generation itself in WebKit at phone size:** the sheet stayed on *"Making the game
  asset…"* forever, with one page error: `TypeError: null is not an object (evaluating 'e.message')`. Broken into
  stages (`work/photo-stamp-server-sync/diag-stages.mjs`):

  | Stage, WebKit 2370 | Result |
  | --- | --- |
  | Decode the original | ok |
  | Extract both assets (worker) | ok, 4.8 s; canvas WebP → PNG, so the bundled encoder wrote the colour WebP (158 KB) |
  | IndexedDB, put a string | ok |
  | **IndexedDB, put a Blob** | **aborts:** `UnknownError: Error preparing Blob/File data to be stored in object store` |

  WebKit cannot keep a `Blob` in IndexedDB in an **ephemeral profile**: Safari's Private Browsing, and the profile
  Playwright's WebKit uses. A persistent WebKit profile and Chromium both keep it
  (`work/photo-stamp-server-sync/diag-idb.mjs`). An `ArrayBuffer` is kept by all three. v1/v2 stored the Blob. Its
  transaction's `onerror` fires *before* the abort, while `transaction.error` is still `null`, so the save rejected
  with `null`. The sheet's handler then read `e.message`, threw, and never cleared its busy state. So the sheet hung,
  and nothing said why.

- **Freddy's phone: a normal tab, the same hang.** Freddy confirmed (October 21) a **normal Safari tab**, and what he
  saw: he tapped *Make game asset*, the line said *"Making the game asset…"*, and nothing ever happened after. No
  message, no progress. So the Private Browsing trigger above is not his. But the hang is not specific to that trigger.
  **v2 hangs this way on any IndexedDB write that fails asynchronously, in any tab, in both engines**, because every
  such failure reaches its handler before the transaction records an error. Shown on untouched `origin/main` (a detached
  `86eed7f` worktree, this branch's stall suite cut to that one case): a write that fails after it is made leaves both
  WebKit and Chromium on *"Making the game asset…"* past 90 s, with `null is not an object (evaluating 'e.message')`.
  A full or unwell store (quota, storage pressure, a storage-process fault) fails that way. A throw at the moment of
  the write does not hang (it is a real error); only the asynchronous kind does.

  What made the write fail on his phone is not known: this Mac has no Xcode (so no iOS Simulator), and I had no
  iPhone. The other things that could leave the sheet waiting are a step that never answers. Each is now bounded and
  tested (below). Ruled out or unlikely:

  | Candidate | Status |
  | --- | --- |
  | Canvas WebP (the suspect on file) | Ruled out: the bundled encoder stands in, and works in WebKit. |
  | Photo size | Ruled out: both originals are 12 MP (4032 × 3024). Every canvas on the asset path stays under iOS's 16.7 MP limit. |
  | ProRAW handed over as DNG, which no browser decodes | Ruled out by the symptom (that refusal shows a message), and unlikely anyway: WebKit's iOS upload panel (`WKFileUploadPanel.mm`, `_preferredAssetRepresentationMode`) asks PhotoKit for the *compatible* form (a JPEG) when the input's `accept` list names specific types, as the original-photo input does. |
  | Memory pressure (the tab reloads mid-make) | Unlikely by the symptom: the line stayed on screen. |

- **A second WebKit difference, found on the way:** WebKit's canvas writes an **`eXIf` chunk into every PNG** (68
  bytes of resolution data from its image I/O, never camera data). Chromium writes none. The account takes no EXIF in
  an image, the same rule as for bag photos. So the phone's first upload was refused until the client learned to strip
  non-image chunks (below). This matters for adopt-up too: assets made in Mac Safari by v1/v2 carry the chunk.

### The fix

1. **The account first.** Signed in, a new asset is uploaded before anything is kept locally. A failed upload saves
   nothing and says why.
2. **The cache keeps an ArrayBuffer** (`{rev, type, bytes}`), which every engine and profile keeps. v1/v2's Blob
   records still read. A cache write that fails anyway is ignored: the bytes are fetched from the account when drawn.
3. **No rejection without a reason.** `run()` rejects with `transaction.error` or a real `Error`, and swallows the early
   `onerror`. The sheet reads `e?.message`.
4. **PNGs go up plain.** Chunks other than image and colour-space chunks (`eXIf`, text) are dropped before upload. Each
   chunk carries its own CRC, so what remains is byte for byte what the canvas wrote.
5. **No step waits forever** (`MAKE_LIMITS` in `public/disc-photo.mjs`, generous for a slow phone). If the extraction
   never answers within 180 s, the worker is stopped and the aligner says *"Finding the stamp took too long on this
   device. Try again, or make it on a computer: it shows here too."* An encode that never answers within 90 s counts as
   no image data, and the colour asset falls back to PNG. A save that never answers within 90 s says *"Saving to your
   account took too long. Check your connection and try again."*, and keeps nothing. Account requests end after a
   minute. A cache transaction that does not answer within 8 s gives up the cache for the session, and the account
   serves the bytes instead.
6. **The status names the step**: *"Making the game asset: finding the stamp… / drawing it in one ink… / drawing it in
   full color… / saving to your account…"*. If a phone ever stalls again, the words on screen say where.
7. **A format fallback, kept small.** WebP was not the cause, but the brief asked for a fallback where WebP cannot be
   written, and it is cheap. Should neither the canvas nor the bundled encoder write WebP (the encoder failed to load),
   the colour asset is a PNG under the same 1.5 MiB budget. The account and every renderer take either format.

Proved in WebKit and Chromium by `tests/photo-stamp-stall-browser.mjs` (new). At phone size, each way a step could
stall is forced: IndexedDB never answering, every write failing after it is made, the worker never answering, no canvas
WebP *and* the bundled encoder never loading, the upload never answering. The sheet either finishes (the asset made,
saved and drawn from the account) or names the step that failed and lets the aligner try again. It never sits there.

Also proved in WebKit: the v1 and v2 suites pass in WebKit (`PHOTO_STAMP_ENGINE=webkit`), and the new cross-device suite
makes a Full color asset on a WebKit phone profile in **5.3–5.5 s** (the desktop's 5.5 s, five runs). The **control**:
origin/main's own v2 suite, unchanged except for the harness's engine switch, run in WebKit in a detached `86eed7f`
worktree, **times out after 180 s waiting for "Full-color asset made"**. That is the phone's hang, on untouched main
(`work/photo-stamp-server-sync/before-webkit-v2.log`).

## The storage shape

The same pattern Plan 22 set for bag photos. Bytes go to the private R2 bucket `disc-atlas-textures`, under
`stamp/<uuid>.png|webp`, so they never collide with photo keys (`<uuid>.webp`). One D1 row per disc holds the
references. Reads are owner-only. An upload intent is queued before R2, so no object can become untracked.

### Migration 0013 (`migrations/accounts/0013_photo_stamps.sql`)

```
bag_photo_stamps
  disc_id         TEXT PK → bag_discs(id) ON DELETE CASCADE
  texture_key     TEXT      the photo version the assets were read from
  look            'photo' | 'asset' | 'color'
  rev             [a-z0-9]{1,16}, new on every upload (cache keys and asset ids carry it)
  ink_key         stamp/*.png|webp, UNIQUE        the one-ink game asset
  ink_diameter, ink_fraction                      its placement (0 < diameter ≤ fraction ≤ 1)
  layered         0 | 1                           an illustrated stamp's fill/line/solid layers
  color_key       stamp/*.png|webp, UNIQUE, NULL  the full-colour asset
  color_diameter, color_fraction                  its placement, NULL exactly when color_key is
  updated_at
  CHECK look <> 'color' OR color_key IS NOT NULL
```

Three triggers, all feeding 0010's `texture_cleanup` queue (drained by the Worker cron):

- `bag_photo_stamp_photo`: a disc's `texture_key` changes (photo replaced or removed) → its stamp row goes. The assets
  belong to one photo, as they did locally.
- `bag_photo_stamp_replace`: an asset key changes (made again) → the old key is queued.
- `bag_photo_stamp_delete`: a row goes (directly, by the trigger above, or by the cascade from a deleted disc or
  account) → both keys are queued.

The cleanup query now also skips any key a stamp row still references. Existing rows are untouched: the migration only
adds the table and triggers (tested: every `bag_discs` row reads back the same).

### Routes (`workers/stamps.mjs`, mounted in `workers/bag.mjs`)

| Route | What it does |
| --- | --- |
| `GET /api/bag/stamps` | The account's stamps (look, rev, placements, layered, colour or not; never object keys), plus the discs that have a photo (for adopt-up). |
| `PUT /api/bag/discs/:id/stamp` | Multipart: `meta` (photo version, look, placements, layered), `ink`, optional `color`. Refused unless the photo version is the disc's current one (409). |
| `PATCH /api/bag/discs/:id/stamp` | `{look}`. Full color only with a colour asset (409, and a CHECK). |
| `DELETE /api/bag/discs/:id/stamp` | Removes both assets. |
| `GET /api/bag/discs/:id/stamp/ink\|color` | The bytes: `private, no-store`, `nosniff`, `Cross-Origin-Resource-Policy: same-origin`, owner only. |

Writes need the session, its CSRF token and a same-origin `Origin`, as every bag write does. Another account gets 404
for every route. **No public URL exists.**

**Validation:** the body is read with a byte cap (3.5 MiB + 64 KiB) before anything is parsed. Each part must be PNG or
WebP, *and be what it claims*. A PNG must be one square 8-bit RGB or RGBA image, 16 to 2048 px, with only IHDR,
colour-space chunks, IDAT and IEND (no text, no EXIF). A WebP passes the bag photo's own validator, given stamp bounds
(square, 16 to 2048 px; static subset only, no EXIF or XMP).

### Budgets: v2's discipline, held on the server

| Asset | Budget | Over it |
| --- | --- | --- |
| Full colour | **1.5 MiB** (v2's) | Unchanged from v2: quality 0.9 → 0.7, then ×0.8 resolution steps; one that still cannot fit is not kept, and the sheet says *"Game asset made in one ink. This stamp is too detailed to keep in full color."* |
| One-ink | **2 MiB** (new) | Same resolution steps, placement unchanged. No stamp measured so far comes near it: the DD3's is 1.64 MB, the Destroyer's 350 KB. One that still cannot fit is refused with a message. |

So the account holds at most 3.5 MiB per disc. The server enforces both budgets, and the client enforces them first.

## In the browser: a cache, the account the source

`public/disc3d/photo-stamps.mjs` keeps its API. Every renderer still calls `photoStampFor` synchronously and redraws on
`atlas-palette-change`. Underneath it:

- **Saving** (the sheet): upload → the account's row (with its `rev`) becomes the local entry, marked `server`. The bytes
  are cached as `{rev, type, bytes}`.
- **Drawing** (`photoStampBlob`): the cached bytes of that `rev`, else the account's (cached on arrival), else the disc
  is *broken* for the session and shows its photo, as v1/v2 did for lost bytes. Surfaces asking at once share one read.
- **Choosing a look**: it applies at once, then a PATCH. If the account refuses it, or cannot be reached, the disc goes
  back to the look the account has, and the sheet says why.
- **Sync** (`syncPhotoStamps`): on sign-in, on load when signed in, and when the page comes back into view (at most once
  every 30 s). The account's stamps replace this browser's, the account winning any difference. An entry the account
  confirmed (`server`) but no longer has (the photo was replaced on another device) is removed, cache and all.
- **Signed out:** unchanged. A signed-out visitor has no bag photos, so every disc wears the catalog look, as before.

### Adopt-up (Freddy's Mac assets reach his phone without regenerating)

During sync, an entry this browser made that the account lacks (not marked `server`, for a disc whose current photo is
that entry's photo version) is uploaded once, silently, with its look. Its bytes come from the v1/v2 cache, Blob
records included, and PNGs are stripped as above. The account's row then replaces the entry, and the cache is rewritten
in the new format.

- **Once.** After the upload, the entry carries `server`, so it is never sent again. The test counts one PUT across
  two loads.
- **If the account refuses the colour asset** (400), the one-ink asset goes up alone, and a Full color look becomes Game
  asset. If it refuses even that, the entry is marked `refused` and is never offered again. A lost connection, or a 401,
  403 or 409, simply waits for the next sync.
- **On a shared browser,** only discs of the signed-in account are offered, since the server lists the account's own
  photos.

**What Freddy will see:** after deploy, open the bag once on the Mac, in the browser where the DD3 and Destroyer were
made. That page load uploads them. Then the phone shows them.

## Fences

| Fence | How it holds |
| --- | --- |
| Photo look default and byte-for-byte unchanged | No entry → `photoStampFor` returns null → every surface takes the photo path. Identity probe vs `origin/main`: **0 differences** on every surface (noise floor 0). Cross-device suite: after the phone sets Photo, the desktop's viewer photo hashes the same as before any asset existed. |
| One-ink and full-colour renderers unchanged | `stamp.mjs`, `viewer.mjs`, `bag3d/viewer.mjs`, `collection3d/stage.mjs`, `atlas-art.mjs`, `thumbnails.mjs`: one comment line changed in `stamp.mjs`, nothing else. The bytes are the same: the phone's asset hashes equal the desktop's. |
| Assets private to the owner | Owner-only routes, CSRF and Origin on writes, `private, no-store`, CORP same-origin. Another account gets 404 (tested). |
| Catalog/Discraft stamp system | Untouched. |

## Verification

| Suite | Result |
| --- | --- |
| `tests/photo-stamp-sync.mjs` (new, server on real SQLite with every migration) | **6/6.** Store and read back on the owner's devices, never another account's. Look moves, Full color needs its asset. Validation: a PNG labelled WebP, WebP labelled PNG, JPEG, EXIF/text chunk, non-square, over 2 MiB, over 2048 px, stale photo version (409). Replace/photo/disc/account cascades to cleanup. Cleanup never takes a referenced asset. A failed attach stays queued. The migration leaves existing rows alone. |
| `tests/photo-stamp-sync-browser.mjs` (new, real app, harness Worker + local D1/R2) | **Pass, 5 of 5 runs** after the fix below. (1) Desktop Chromium makes Full color. (2) A fresh **WebKit phone profile** (390 px, touch) first shows that it cannot keep a Blob in IndexedDB, then signs in and draws the same asset id, **byte-identical** bytes, with the inks present, in the **3D viewer** and on the pulled bag disc. Its sheet shows Full color. (3) The phone makes its own Full color asset (5.6 s) and caches it as bytes; the desktop then draws it, the same bytes. (4) A look set on the phone reaches the desktop, and Photo is the photo exactly. A look the account cannot take goes back and says so. (5) Adopt-up: a profile with v2-format Blob records uploads them once, and the account holds those very bytes. The phone draws them. A photo replaced on one device clears the stamp on the others. No page errors on any device. |
| `tests/photo-stamp-stall-browser.mjs` (new, real app, phone size), **WebKit** / Chromium | **Pass / Pass.** No fault: made, each step named (5.0–5.6 s). IndexedDB never answers: made, saved, then drawn in the viewer from the account. Every write fails after it is made: made, and the account has it. Worker never answers: *"Finding the stamp took too long…"*, retry enabled, nothing kept. No canvas WebP and the encoder never loads: made, colour asset stored as PNG. Upload never answers: *"Saving to your account took too long…"*, retry enabled, nothing kept. No page errors. |
| The same "write fails after it is made" case on untouched `origin/main` | **Hangs** past 90 s in WebKit and in Chromium, on *"Making the game asset…"*, with the `e.message`-on-null page error: Freddy's symptom. |
| `tests/photo-stamp-assets-browser.mjs` (v1), Chromium / **WebKit** | Pass / **Pass** |
| `tests/photo-stamp-color-assets-browser.mjs` (v2), Chromium / **WebKit** | Pass / **Pass** |
| `tests/photo-stamp-identity-browser.mjs` vs `origin/main` | **Pass: 0 differences** (made one-ink asset bytes, and every surface's stamp texture, material, photo texture and map still, in Auto/flat and gold foil); branch vs itself 0 |
| Unit sweep (36 files, every non-browser `node:test` file) | **289/289** |
| `tests/photo-textures.mjs`, `tests/bag.mjs`, `tests/auth.mjs` | 35/35 (the cleanup query change) |

Changed by design in the v1/v2 suites: *"bytes this browser lost bring the photo back"* now has two halves. With the
cache cleared, the stamp still draws (from the account). With the cache cleared *and* the account unreachable, the photo
returns. The v2 suite's "asset made before full colour existed" case is now set up through the account, as an adopted v1
asset would be. The cache's shape (`{rev, type, bytes}`) is read in the IndexedDB probes.

**A test race, found and fixed.** The sync suite at first hung in 2 of 3 untraced runs (never when traced). A watchdog
that names the stalled step and dumps each device's state found it: the asset had been made and the sheet *had* closed.
The suite's `closeSheet()` sent its close listener and the Escape key together, and the key sometimes arrived first, so
the close went unheard. The listener is now in place before Escape. v2's identical helper got the same fix (it had the
same latent race). The suite keeps the watchdog: a stalled step fails within 5 minutes, with its name.

## Gallery gate

`node tests/gallery-fixes-browser.mjs`, unchanged (no edits to the gate, its baseline, limits, margins or reps), under the
quiet protocol, with v2's runner (`docs/assets/gallery-photo-continuation-fix/gate/gate-pair.sh.txt`): AC power
required, 12 consecutive samples (about 60 s) at 85% idle or more with no foreign headless browser, `workerd` or
Wrangler before each run, and power/CPU/load logged every ~15 s. Logs: `work/photo-stamp-server-sync/gate/`.

Run twice: on the account-sync build (`90fbdd5`), and again on the final code with the bounded steps (`335df04`). The
second session's branch runs show `dirty=1`: the uncommitted write-up, no code.

**Grading: PASS on every run of both sessions, branch and control alike.**

| Run (Oct 21) | Tree | Desktop fly p95 per rep (limit 3.455 ms) | Phone fly p95 per rep (limit 10.13) | Long tasks, desktop / phone warm | Result |
| --- | --- | --- | --- | --- | --- |
| 20:26–20:29 | branch `90fbdd5` | 2.5–2.8 | 6.5–7.2 | 0 / 0 | **pass** |
| 20:30–20:32 | `origin/main` `86eed7f` (control) | 2.4–2.6 | 6.5–7.3 | 0 / 0 | **pass** |
| 20:33–20:36 | branch `90fbdd5` | 2.6–2.7 | 6.4–7.5 | 0 / 0 | **pass** |
| 21:11–21:14 | branch `335df04` | 2.4–2.8 | 6.1–7.4 | 0 / 0 | **pass** |
| 21:14–21:17 | `origin/main` `86eed7f` (control) | 2.5–2.8 | 6.3–7.0 | 0 / 0 | **pass** |
| 21:18–21:21 | branch `335df04` | 2.5–2.8 | 6.4–8.0 | 0 / 0 | **pass** |

- **Windows:** first session 44 samples, second 53, all on AC power; the second session's runs started at 89.0–89.5%
  idle. Logs: `work/photo-stamp-server-sync/gate/` and `…/gate2/`. First session: 44 samples, all on AC power. Each run started after 12 qualifying samples, at 90.5–92.8% idle. During the
  runs, idle was 75.5–95.7% and `foreign=8`: the gate's own browser and `workerd`. No outside process was seen.
- The branch sits within 0.1–0.2 ms of the control on desktop and the same on phone. v2's morning desktop-fly failure
  (3.5–3.8 on both trees) did not recur in this evening window. That fits v2's reading that the machine was the cause.
- Why the change should not move these numbers: the gate's discs have owner photos but no stamps, so every surface takes
  the photo path. One addition is per page load when signed in: `GET /api/bag/stamps`, a small JSON read off the main
  thread's critical path.

## Landing (on Freddy's word only)

1. **Remote migration 0013 first** (command at the top), then confirm the table exists:
   `npx wrangler d1 execute disc-atlas-accounts --remote --config wrangler.public.jsonc --command "SELECT name FROM sqlite_master WHERE name='bag_photo_stamps'"`.
2. Push, PR, merge, deploy (`npm run deploy:workers` from a clean checkout of the merge), edge-verify the changed public
   files against the build, and check `GET /api/bag/stamps` answers 401 signed out (route live, not 503).
3. Freddy's acceptance, literally: on the computer, open the bag in the browser that made the DD3 and Destroyer assets.
   That load uploads them (adopt-up), or he can make them again with Full color. Then open the phone and see the same
   discs, in the 3D viewer too. Then make one on the phone itself.

## Known limits and follow-ups (not built)

- **What made the write fail on Freddy's phone is not known.** The hang it caused is fixed, and every other way to wait
  forever is bounded. If the phone fails again, the aligner now shows the reason, or the step it stopped at.

- **Real iPhone hardware not run** (no Xcode on this Mac, no device). WebKit's engine was, at phone size.
  Freddy's own acceptance (the DD3 + Destroyer on the computer, then the phone, then one made on the phone) is the
  hardware check.
- **The local cache outlives sign-out** on that browser, as v1/v2's assets did. Clearing it on sign-out is a small
  follow-up if Freddy wants shared devices covered.
- **`photo-editor-contract-browser`** still fails in WebKit, for the reason above (its October 14 baseline cannot write
  WebP there). Repairing the suite means choosing a WebKit-capable baseline, which is a test-design call, not done here.
- **A look changed while offline** goes back to the account's look and says so. It is not queued for later.

## Graphify

Refreshed on this Mac with `graphify update .` (AST only, 0.9.91 under uv in a session scratchpad), on the final code,
and committed: 2,909 nodes, 6,142 edges, 166 communities. No `.env*` or `.dev.vars*` files exist in the checkout. The
ignored `work/` folder (diagnostics, logs, the control worktree, synthetic photos) is not in the graph. No LLM labeling
ran.
