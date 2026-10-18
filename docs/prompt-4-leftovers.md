# Prompt 4 leftovers — verification ledger

Base: cad422abeeed109b2a8e34fa24f5b69f2e01ef27. Branch: codex/clay-leftovers-verify. PC, October 18, 2026. Local commits only; no push/deploy. No catalog, flight, geometry, score or tier edits authorized.

Execution plan: A — clay/profile browser evidence; B — information-page parity, stability-help and motion-token audit; C — reproduce and diagnose five suites before any scoped repair/baseline refresh; D — Chromium/WebKit and installed-Firefox exit/reduced-motion/far-origin matrix; E — requested regression suites, isolated perf run, Freddy decisions, AST-only Graphify refresh, final review. Findings and actual outputs are appended below as work completes.

Environment: isolated worktree requested in chat; node_modules junction reuses disc-atlas-halo-pr23's Playwright 1.64.1/Wrangler 4.92.0. Browser caches contain Chromium and WebKit, no Firefox. App attachment rejected this Git-created checkout as unmanaged; Git isolation itself is valid. First bag attempt overlapped this run's accounts build and hit EPERM deleting dist/workers-public; this is harness interference, excluded from product verdict. Worker-building suites run serially thereafter.

## Part A — clay and profile

**PASS**, Chromium 1.64.1's matching build, desktop 1440×900 and emulated phone 390×844, both light and midnight. `node tests/prompt-4-leftovers-browser.mjs clay` prints `PASS Prompt 4 clay: 4 clay viewports, 0 browser rows`. [Structured evidence](prompt-4-evidence/clay.json).

- Real measured overmold: Axiom Envy, plate #247baf, explicitly chosen pink rim #ff0077, supported matte `base` finish. Clay wears two MeshMatcapMaterials, plate **#b3b3af**, rim **#6c6c6a**; the pink rim never replaces either clay material. Screenshots visually checked at desktop and phone.
- Panel Clay → Enlarge opens in clay. Pop-out Clay off/on changes both viewers. Off restores the panel's **same original body/rim material objects**, plus identical material type, colour, roughness, metalness, clearcoat, plastic intent, stamp visibility and computed theme backdrop. Pop-out and panel signatures match. Both light and midnight were tested.
- Annotations equal the actual rendered panel spec rows: **rim width 1.1 cm, rim depth 1.4 cm, height 1.8 cm, diameter 21.0 cm**. Both viewer sizes show the same numbers.
- Switching while clay is on preserves clay; stamp stays hidden. Every rated record in this snapshot has complete measurements, so the generic path uses an explicitly synthetic, in-memory copy with specs/model removed and the name `Generic shape fixture`. Its panel and profile both say generic shape, with zero dimension annotations. No catalog object/file is modified.

Changes: focused reusable proof harness, evidence and screenshots only. No clay/viewer product changes.

| View | Light | Midnight |
| --- | --- | --- |
| Desktop panel off/on | [off](images/prompt-4/clay-1440-light-panel-off.png) / [on](images/prompt-4/clay-1440-light-panel-on.png) | [off](images/prompt-4/clay-1440-midnight-panel-off.png) / [on](images/prompt-4/clay-1440-midnight-panel-on.png) |
| Desktop pop-out off/on | [off](images/prompt-4/clay-1440-light-popout-off.png) / [on](images/prompt-4/clay-1440-light-popout-on.png) | [off](images/prompt-4/clay-1440-midnight-popout-off.png) / [on](images/prompt-4/clay-1440-midnight-popout-on.png) |
| Phone panel off/on | [off](images/prompt-4/clay-390-light-panel-off.png) / [on](images/prompt-4/clay-390-light-panel-on.png) | [off](images/prompt-4/clay-390-midnight-panel-off.png) / [on](images/prompt-4/clay-390-midnight-panel-on.png) |
| Phone pop-out off/on | [off](images/prompt-4/clay-390-light-popout-off.png) / [on](images/prompt-4/clay-390-light-popout-on.png) | [off](images/prompt-4/clay-390-midnight-popout-off.png) / [on](images/prompt-4/clay-390-midnight-popout-on.png) |

## Part B — parity, stability help, tokens

**Privacy/Terms parity PASS:** existing batch-3 suite checks all five pages at 1440 and 390, light and midnight. Same lockup position/size, header height token, actions position, surface/hairline; icon toggle, ordered Light/Midnight/Charcoal/Black radios, checked-state update, Escape close. No drift or product edits. [Verbatim output](prompt-4-evidence/test-apple-design-3.log). Header screenshots are in `docs/images/prompt-4/`: [Privacy phone light](images/prompt-4/privacy-390-light.png), [Terms desktop midnight](images/prompt-4/terms-1440-midnight.png), with matching About/Account and all other width/theme combinations beside them.

**Stability-help is dead, left untouched:** Graphify query surfaced only the file node; directed path to web/index.html found no path. `rg -n 'stability-help|stabilityHelp' public web workers` found the script's own IDs and CSS remnants, no HTML/script loader/import. Graph limitations mean this search/source check is essential. Current map help lives in the methodology dialog. Existing dead script's four exit paths were exercised in an isolated browser fixture: Escape and outside click from pinned state, pointer-leave and focus-out from unpinned state all set hidden immediately. Source separately confirms aria-expanded updates. The fixture loads polish/cosmic CSS but does not carry the .stability-popover class, so its runtime evidence is limited to functional hidden-state changes; the instant-hide CSS verdict below is a source audit. [Fixture evidence](prompt-4-evidence/stability.json), command `node tests/prompt-4-stability-fixture.mjs`.

Gap: `.stability-popover[hidden]{display:none}` has no batch-style discrete opacity exit. This affects no current page. Freddy decides delete/keep; if revived, add the shared exit pattern then. No wiring or animation fix here.

**Motion refresh confirmed:** `public/atlas-motion.js` reveal reads `token('--dur-ui',.18)`, dismiss reads `token('--dur-press',.12)`, expand reads `token('--dur-surface',.28)`. Batch-3 browser interception confirms live 180/100/280 ms tokens. **Untouched finding for Freddy:** marker pointerover still uses `.18` at line 80 and pointermove `.12` at line 87; release uses `.32`. Those are hover behaviours, outside the panel migration.

## Part C — diagnosis before repair

### C1 — Atlas 3D LOD flake

Verdict: **test timing/observation hardening; no demonstrated product LOD bug**. Original full suite passed on the first run (11 checks), including the reported assertion. `f5f9132` already changed the old stand-in-render comparison to decided `want` values. Source still showed two independent clocks (camera and `ART_SETTLE=180`) covered by fixed 450/250 ms sleeps, plus an unrelated rAF observer sampling the result after paint. This leaves observation timing dependent on callback order/load. The historical failure itself was **not reproduced**, so this is not a claim that its exact root cause is conclusively established.

Diagnosis was reported before editing. Changed **tests/atlas-3d-browser.mjs only**: wait for current zoom/art clock to be quiet, actual pending/arrival/LOD convergence, then two frames; observe immediately after each real `drawGaps` call; forget entries while no drawn/decided LOD exists. The original count >20, low→mid, mini-only and unique exactly-once assertions remain unchanged. Full changed suite passes **11/11**. [Before](prompt-4-evidence/atlas-3d-before.log), [after](prompt-4-evidence/atlas-3d-after.log). No thresholds, geometry, grouping, tiers or product waits changed. Historical load-dependent reproduction remains on the still-verify list.

### C2 — Show all

Verdict: **old test rot, already repaired in main** by `b9b03ba` (Oct 13). The organic 1× atlas intentionally draws a curated composition; the current assertion checks all rated filtered members plus joined members exactly once, zero strays, and visible groups/gaps. Full `node tests/motion.mjs` passes without edits:

```text
PASS: stable marker identity and focus, panels, complete catalog, search, reduced motion, mobile sheet.
```

[Verbatim output](prompt-4-evidence/motion-before.log). No evidence of rated discs being dropped.

### C3 — accounts

Verdict: **closed test rot; confirmed green, no new failure**. Current suite already expects four themes ending Black and End reaches it. `npm run test:accounts:browser` exits 0. [Verbatim output](prompt-4-evidence/accounts.log).

```text
PASS: dev Worker + D1 + signed OAuth fixture; all menu states, 4 themes, desktop/360px, profile, settings, persistence, sign-out and confirmed deletion. Screenshots: outputs/plan-08a.
```

### C4 — bag popup settle

Verdict: **old test race, already repaired in main** by `4f2efb4` (Oct 13). Theme snapshot clicks used to scroll the bag offscreen; the intentionally paused viewer then could not settle. Current `setTheme` waits for the requested theme and the end of `theme-switching` before interacting. Complete suite passes at 1440, 360 and 390, all 1–24 disc cases; no condition/tolerance edits. [Verbatim output](prompt-4-evidence/bag-before.log).

```text
PASS bag popup: 7 checks, 18 screenshots in outputs/bag-popup
```

### C5 — dropdown baseline and new product inconsistency

Two separate verdicts:

1. **Stale historical baseline.** The prompt's old toolbar crops were 1064 px; current crops are 804 px (780 px toolbar + 12 px padding each side). `aedd524` (Oct 8) moved the lens/map dropdown from the toolbar to separate top-right map chrome and removed the width expansion to 1040 px. That is the visible change accepted here. This branch makes no toolbar edit. The available main-checkout local baseline was already 804 px when inspected; the original 1064 px images were not available in this worktree. Regeneration is explicitly against `cad422ab` intended layout, not a claim to have pixel-reviewed missing historical images.
2. **NEW, REAL PRODUCT INCONSISTENCY, minimally fixed:** first audit failed on native `marker: <summary>Adjust photo</summary>` before reaching baseline comparison. The newer photo editor omitted the unified disclosure indicator. Changed `public/disc-photo.mjs` to insert the existing large indicator; extended the existing disclosure selector in `public/dropdown-indicator.css` to `.photo-aligner-adjust`. No photo processing/gesture behaviour changed. The existing assertion reproduced the failure and passes after the fix; nothing was deleted, loosened or retried to obtain green.

Baseline command: `DD_PHASE=before node tests/dropdown-indicator-browser.mjs` (PowerShell environment equivalent). Final comparison: `node tests/dropdown-indicator-browser.mjs`. **66 screenshots, 1260 measured controls**, existing **2 px screenshot-size / 1 px control-size** tolerances unchanged; final **9 checks PASS**. [Initial failure](prompt-4-evidence/dropdown-before-refresh.log), [baseline run](prompt-4-evidence/dropdown-baseline.log), [final run](prompt-4-evidence/dropdown-after.log). The regenerated `outputs/dropdown-indicator/before/` baseline is committed deliberately despite outputs normally being ignored. This is a size/state audit, not a pixel-diff proof.

## Part D — cross-browser matrix

Command: `node tests/prompt-4-leftovers-browser.mjs matrix`. Matching Playwright **1.64.1** browser builds. This is a static local frontend, with 2D atlas art to keep transition checks independent of WebGL. [Full per-frame evidence](prompt-4-evidence/matrix.json) records opacity, display, scale, translate and box dimensions, plus support probes. No page errors. Logical close ends `display:none` within the 400 ms observation window for every tested surface.

| Browser | Motion | Manufacturer | Map menu | Site menu | Add popover | Native dialog | Compare tray |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Chromium | Full | Fade | Fade | Fade | Fade | Fade | Fade |
| Chromium | Reduced | Fade | Fade | Fade | Fade | Fade | Fade |
| WebKit | Full | Instant hide | Fade | Fade | Instant hide | Instant hide | Fade |
| WebKit | Reduced | Instant hide | Fade | Fade | Instant hide | Instant hide | Fade |
| Firefox | Both | **Not run:** matching executable not installed | — | — | — | — | — |

WebKit reports support for allow-discrete, starting-style and view transitions, but support detection alone does not imply all actual exits animate. Its instantaneous exits meet the designed fallback. Every exit ends hidden; all recorded visible exit samples have non-increasing opacity and a single box size. No opacity flash or box-size jump appears in those samples. A separate full-page layout-shift metric was not instrumented. This automated desktop evidence does not certify physical Safari/iOS feel. The batch-3 forced reduced-motion transition-property override preserves map/site menu and tray fades in WebKit; Manufacturer/Add/dialog remain instant. Recorded reduced-mode values never scale or travel. No product edits.

**Far-marker fallback forced:** offscreen anchor at −1500/−1500, real `openCluster`/`positionCluster` logic. Both engines and both motion modes choose **50% 50%**. Box width 680 px, computed origin x=340 px and y≈340.945 px (half its layout height). [Chromium](images/prompt-4/chromium-full-far-origin.png), [WebKit](images/prompt-4/webkit-full-far-origin.png). This validates the far branch rather than the normal corner branch; batch-2 suite separately passes the nearby marker case.

## Freddy's calls — evidence, unchanged

- **Dead stability-help:** no production loader; all four functional exits work in isolation, no shared animated exit. Decide delete/keep. File untouched.
- **View-Transition click swallow:** `public/cosmic.css:63` already has `:root.theme-snapshots::view-transition{pointer-events:none}`. In Chromium a real mouse click at the site menu button during snapshot animation (`theme-switching=true`, pseudo computed pointer-events `none`) delivered **0 button clicks**, menu stayed closed. After the transition, the same coordinate delivered **1**, menu opened. Candidate is already present yet insufficient in this test. [Raw evidence](prompt-4-evidence/matrix.json), `clicks` entry. Recommendation: investigate snapshot hit-testing and any broader suppression with a focused reproduction before changing behaviour. No CSS/theme change in this run.
- **Preset buttons:** current viewer exposes 3/4, Top, Profile, Bottom, plus separate Flip and Clay; 3/4 initially pressed, aria-pressed tracks the view, label-sized flex keeps Bottom visible. They remain visible in clay. Existing full disc3d suite passes desktop/phone preset/touch coverage. Screenshots show the current design; visual/verdict remains Freddy's. No redesign.
- **Hover tween tokens:** `.18/.12` in atlas-motion hover handlers remain as requested; migrate only on Freddy's call.

## Requested regression evidence

All commands run against this worktree. Full unabridged logs are retained under [prompt-4-evidence](prompt-4-evidence/); commands were not substituted with individual subsets.

| Command | Result | Verbatim log |
| --- | --- | --- |
| `npm run test:disc3d` | Exit 0; 29 Node tests, panel and pop-out browser checks | [disc3d.log](prompt-4-evidence/disc3d.log) |
| `npm run test:apple-design` | Exit 0; 6 Node tests and 16 browser checks | [log](prompt-4-evidence/test-apple-design.log) |
| `npm run test:apple-design:2` | Exit 0; 29 browser checks | [log](prompt-4-evidence/test-apple-design-2.log) |
| `npm run test:apple-design:3` | Exit 0; 14 browser checks | [log](prompt-4-evidence/test-apple-design-3.log) |
| `npm run test:atlas:persist` | Exit 0 | [log](prompt-4-evidence/test-atlas-persist.log) |
| `npm run test:add-menu` | Exit 0; 9 checks | [log](prompt-4-evidence/test-add-menu.log) |
| `npm run test:atlas:3d:perf` | **Exit 1: phone long-task gate fails** | [verbatim log](prompt-4-evidence/perf.log), [all measurements](prompt-4-evidence/perf.json) |

## Still verify / physical checks

Freddy retains real-phone feel, a real reduced-motion device, and throttled-phone panel-swap perception. Also retain the historical Atlas flake under its original reproducing load/environment (this run did not reproduce it); Firefox matrix after installation; real Safari/iOS feel beyond the matching Windows WebKit build; and his decisions on presets, the dead stability-help file, click-swallow, and optional hover-token migration. No non-trivial product change was attempted for these findings.

## Perf gate — one quiet run, retained red

**NON-TRIVIAL PERFORMANCE FINDING; NOT FIXED.** Before starting, elevated process-command inspection found no other test suite in flight. All functional suites and Graphify extraction had finished. Defaults were preserved: **7 desktop / 3 phone warm pairs**, one cold flight per page, alternating serial 2D/3D order, full 241-flight/120-overview frames. No retry, repetition reduction, allowance change, or discarded sample. The read-only reviewer did not run tests, browsers, builds, or extraction during perf.

Verbatim verdict/error lines from the single run:

```text
ok - desktop: median warm 3D vs 2D
not ok - phone: median warm 3D vs 2D
Measurement wall-clock: 187.6 s
AssertionError [ERR_ASSERTION]: 3D median warm frames/long tasks exceed the 2D allowance (see every repetition below)
```

[Full verbatim console output](prompt-4-evidence/perf.log), including all 24 cold/warm rows and tables; [raw JSON](prompt-4-evidence/perf.json). Exit **1**.

| Device / metric | 2D median | 3D median | Limit | Paired median excess | Verdict |
| --- | ---: | ---: | ---: | ---: | --- |
| Desktop flight p95, ms | 5.6 | 6.5 | 7.94 | −1.15 | Pass |
| Desktop 1× p95, ms | 1.1 | 1.8 | 2.765 | −1.165 | Pass |
| Desktop long tasks | 0 | 0 | 1 | −1 | Pass |
| Phone flight p95, ms | 26.1 | 25.5 | 33.015 | −10.735 | Pass |
| Phone 1× p95, ms | 3.6 | 4.6 | 7.14 | −2.54 | Pass |
| **Phone long tasks** | **16** | **22** | **17** | **+8** | **Fail: median and paired checks** |

Phone warm long-task pairs (2D→3D): **22→18, 5→22, 16→25**. This is a current-main performance finding, not evidence that the small disclosure change caused it: the atlas product/rendering code is byte-identical to cad422ab. Root cause is not established by this gate. Recommendation: profile phone long tasks, including render/stamp preparation and regroup work, before choosing an optimization; keep this failed distribution as the comparison. Physical throttled-phone judgement stays Freddy's. No attempted performance fix in this verification run.

## Graphify and final review

Ran **`graphify update .` at defaults**, after code changes and before review handoff; exit 0. Read `.graphifyignore` first: `.env*`, `.dev.vars*`, credential JSON, PEM/key files, .aws and dependencies/generated outputs remain excluded. AST-only; no API key, model call, deep mode, semantic extraction or labeling. **2,525 nodes / 5,147 edges / 136 communities**, 343 uncached code files extracted. [Full output](prompt-4-evidence/graphify.log). Coverage warnings retained: 82 unclassified paths and 16 code files without symbols. Labels warning retained: community membership changed, 7 hub-based names reconciled; the tool's suggestion to run LLM labeling was **not** followed. Committed generated graph/report/HTML and saved-label/signature refresh, without hand-editing them.

A fresh read-only reviewer found **no product defects and no weakened Atlas assertions**. It agreed that clay, dimensions, restoration, parity, the exit table and click-swallow statements match saved evidence. Two minor harness follow-ups are deferred: add explicit opener-success assertions and apply reduced-motion guards to Add in the persistent matrix harness; add the .stability-popover class and aria-expanded assertions to the isolated dead-script fixture. Current JSON was additionally inspected: all 24 surface entries end visibly open at opacity 1; every reduced row including Add has no scale/travel. The fixture claims above were narrowed to exactly the hidden-state evidence it asserts. These are future guard improvements, not current product failures.

No push, PR, merge or deploy. No data/flight/geometry/score/tier file changed. All existing batch motion and reduced-motion implementations are preserved. Scoped local commits preserve each verification/repair part; perf remains explicitly red for Freddy's review. Raw console logs intentionally retain their original whitespace; code/diff whitespace checks exclude those verbatim logs.

Final freshness check: after the proof harness EOF whitespace cleanup, a second default `graphify update .` exited 0 with **no code-graph topology changes; outputs left untouched**. It reported 85 unclassified paths and 219 uncached files in this cached pass; 16 no-symbol warnings remain. [Final refresh log](prompt-4-evidence/graphify-final.log). Graph JSON validation confirms unique node IDs, valid endpoints, and no environment/credential sources.
