# Graphify adoption — Disc Atlas

Run date: October 16, 2026 (America/New_York). Status: **conditional adoption**, retaining the trial's honest theme limitation. AST only; no model key, semantic extraction, deep mode, or LLM labeling. Roger remains parked.

## Base, isolation and sequencing

- Fetched `origin` before branching. Branch `codex/graphify-adoption` starts at **`3abd397caba4591eb97486e967c428277c4018ef`**, the then-current `origin/main` HEAD.
- Own managed worktree: `C:/Users/user/.codex/worktrees/graphify-adoption/disc-atlas`. No other agent built or updated this checkout during extraction.
- Base includes PR #12's photo-edge revert, PR #13's Discraft Buzzz/Zone/Luna stock stamps, PR #14's thumbnail race-test repair, and PR #15's stock-stamp scale correction. The graph describes that tree, not the October 15 trial's `3930a0c1`.
- **Glare/leveling fence:** `codex/glare-leveling-land` (`ffc4301` at inspection) was not an ancestor of the base. If it merges before adoption, incorporate that merge and immediately run `graphify update .`, commit the refresh, and **do not merge adoption before that refresh**. This run does not merge or push anything.
- Freddy supplied the October 13 rollout text in chat because `~/workspace/your_files/graphify-rollout-disc-atlas-roger.md` was not present on this Windows machine. This adoption prompt explicitly authorizes one local commit, superseding the older trial instruction to wait for approval before committing. Push/merge still require Freddy's review.

## Deployment audit before curation

`package.json`'s `deploy:workers` invokes Wrangler with `wrangler.public.jsonc`. That config selects **`workers/public.mjs`**, runs **`node scripts/build-workers.mjs`**, and serves **`dist/workers-public`** through `ASSETS`. The build copies **all `public/`**, **`web/index.html`**, and `source-data/bag-plastics.json` / `bag-models.json`. D1 uses `migrations/accounts`. The production frontend is the vanilla atlas, not the unused shadcn component collection.

The framework path also matters: `build`/`dev` invoke `scripts/run-framework.mjs`, which selects Vite/vinext; `vite.config.ts` imports `build/sites-vite-plugin.ts`. `app/route.ts` serves `web/index.html`; `app/api/**`, `app/chatgpt-auth.ts`, `lib/server.ts`, `lib/validation.ts`, and `db/` support that preview/account path. **None of those directories is excluded by our rules.** Keep framework configs, `build/`, `app/`, `db/`, `drizzle/`, `web/`, `workers/`, and product helpers. Repository import inspection found `components/ui/`, `hooks/use-mobile.ts`, and `lib/utils.ts` used only by the unused starter component collection, with no caller in the product entry/build paths. Root `vendor/` is third-party shadcn CSS, not authored app logic.

**Extractor gap discovered by checking retention:** Graphify 0.9.91 itself unconditionally treats a directory named `build` as generated noise. It omits `build/sites-vite-plugin.ts` despite our not ignoring it. The unresolved `vite.config.ts` import remains. Do not mistake the omission for proof that this live preview helper is unused. No product code was moved or changed to accommodate the tool. CSS and the HTML entry also have little/no AST representation; see Q2/Q3. These limits are disclosed in the report and assistant instructions.

## Installation and exact build commands

Existing installed package: `graphifyy 0.9.91`, Python 3.12, isolated uv tool environment. Its installed `METADATA` explicitly declares the `sql` extra with `tree-sitter-sql`; installed CLI help governs flags. Ran:

```text
uv tool install --force "graphifyy[sql]==0.9.91"
graphify extract . --code-only --no-cluster --max-workers 4
graphify cluster-only . --no-label
graphify claude install --project
graphify codex install --project
graphify update .
```

SQL grammar installed: **`tree-sitter-sql 0.3.11`**. No database connection was used. The upstream repository named in the rollout now redirects to [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify); this run followed the installed 0.9.91 code/help, not newer defaults.

Before the first extraction, tested the actual Graphify `ignored_predicate` against `.env`, `.env.local`, nested `.env.production`, `.dev.vars`, `.dev.vars.local`, nested `.dev.vars`, generated data, and vendor paths: all excluded. The same preflight detected the upstream `build/` omission. Secret assertions passed before the first build. No environment-file contents were read. Sensitive-path and graph-source checks were repeated before committing.

`--no-cluster` then `cluster-only --no-label` explicitly prevents an automatic LLM naming pass. Labels were subsequently generated locally with Graphify's `label_communities_by_hub`, with selected community names reviewed manually, persisted with `community_member_sigs`, and exported using Graphify's `to_json`, `report.generate`, and `to_html`. No `graphify label` or backend call ran. Both builds/reports recorded zero input/output model tokens.

Maintenance smoke test revealed that `update .` also parses Markdown locally. Added `*.md` to maintain the code-only corpus, then ran `graphify update .` again. It pruned those document nodes. The final graph is this maintenance-compatible AST graph, with reviewed labels and an explicit coverage appendix in `GRAPH_REPORT.md`.

## Trial versus adoption

| Measure | October 15 trial | Adoption |
| --- | ---: | ---: |
| Base | `3930a0c1` | `3abd397c` |
| Nodes | 5,646 | 2,320 |
| Persisted edges / report edges | 11,819 / 11,819 | 4,711 / 4,711 |
| Communities | 255 | 140 |
| Shown / thin omitted | 170 / 85 | 112 / 28 |
| SQL-source nodes | 0 | 35 |
| SQL files represented | 0 of 13 | 13 of 13 |
| Edges touching SQL nodes | 0 | 37 |
| Model tokens, input / output | 0 / 0 | 0 / 0 |

First-pass adoption extraction wrote 4,958 raw links. Graphify's regular update collapses parallel endpoint links into the 4,711-edge analysis graph. Report and final JSON now agree. Counts are observed output, not a claim that every runtime relationship is extracted.

| Rank | Trial god node (degree) | Adoption god node (degree) |
| --- | --- | --- |
| 1 | `cn()` (327) | `BagScene` (63) |
| 2 | `Ks` (107) | package `scripts` (52) |
| 3 | `In` (65) | `createDiscViewer()` (44) |
| 4 | `BagScene` (63) | `mountRacks()` (36) |
| 5 | `qs()` (60) | my-bag `render()` (32) |
| 6 | `dn` (56) | `mountBag()` (31) |
| 7 | `s` (55) | `SceneView` (29) |
| 8 | `react` (54) | `AuditTests` (29) |
| 9 | `ti` (53) | collection-scenes `theme()` (28) |
| 10 | `ar` (49) | audit-test `disc()` (26) |

The minified library and shadcn hubs are gone. Most hubs are product abstractions; package-script metadata and two test hubs remain. Tests were intentionally retained, not hidden to manufacture a clean ranking. Core communities still separate atlas app/map/camera, shared disc viewer, detail/pop-out bridge, bag scene/controls/layout, collections/racks/graveyard, photo/albedo, account/coach APIs, catalog/stamp validation, and SQL schema. Some cross-file communities follow shared test/import nodes rather than a neat product feature; directory UI is largely inside `public/app.js`, not its own independent subsystem.

SQL detail: 30 nodes from 11 `migrations/accounts/*.sql` files plus 5 from 2 `drizzle/*.sql` files. Of the 35, 13 are file nodes and 22 are schema/index symbols. CREATE statements now contribute tables/indexes (accounts, sessions, bag items, coach usage, textures). Five account migrations without CREATE statements and `drizzle/0001_chemical_may_parker.sql` contribute file nodes only; the extractor does not model their column-level deltas. “SQL parses” is not a claim of full migration semantics.

The structural stop condition did not trigger: the report is no longer vendor-dominated and communities match the real application. This is not an unconditional retrieval pass; Q2 remains weak and Q3 requires source confirmation.

## `.graphifyignore`, every entry justified

The table reproduces every non-comment entry in file order.

| Entry | One-line justification |
| --- | --- |
| `node_modules/` | Installed dependencies, not repository product source. |
| `.wrangler/` | Local emulation state and generated caches, potentially including account data. |
| `graphify-out/` | Prevent the graph, report, visualization, and cache from indexing themselves. |
| `public/data.json` | Generated catalog; index its generator/validator rather than memorizing records. |
| `.env*` | Exclude all environment and secret files before any scan, including nested files. |
| `.dev.vars*` | Exclude Wrangler credentials and local/suffixed variable files. |
| `*.lock` | Preserve the trial rule excluding tool lock/state files. |
| `pnpm-lock.yaml` | Actual dependency lockfile does not match `*.lock`; omit dependency-resolution mass. |
| `.next/` | Generated Next build/cache output. |
| `.vinext/` | Generated vinext build/cache output. |
| `dist/` | Generated deployment/preview bundles, not their authored inputs. |
| `outputs/` | Local verification artifacts already excluded from version control. |
| `work/` | Nested agent worktrees; never scan another task's checkout. |
| `.claude/` | Assistant settings, installed skill docs, backups, and nested worktrees are not product code. |
| `.sites-runtime/` | Checkout-local runtime/profile state. |
| `*.tsbuildinfo` | Generated TypeScript compiler state, including the tracked root artifact. |
| `/components/ui/` | Unused shadcn starter component collection; no product/build entry imports it. |
| `/hooks/use-mobile.ts` | Starter UI-only helper with no product caller. |
| `/lib/utils.ts` | Starter UI-only `cn()` helper responsible for the trial's misleading top hub. |
| `/examples/` | D1 sample notes API/schema, separate from the actual account/bag API. |
| `/vendor/` | Third-party shadcn stylesheet and license; keep authored callers/config instead. |
| `/public/vendor/` | Vendored GSAP, HEIF, and WebP implementations; product photo/motion callers remain. |
| `/public/bag3d/vendor/` | Vendored Three.js/addons; authored bag/disc/collection viewers remain. |
| `.codex/` | Assistant hooks and installed skill state are tooling, not product source. |
| `.agents/` | Checkout-local assistant skills/instructions, not product source. |
| `*.pem` | Private certificate/key material, if present locally. |
| `*.key` | Private key material, if present locally. |
| `credentials.json` | Explicitly exclude locally introduced credential stores. |
| `*.md` | Preserve this adoption's code-only scope during normal maintenance updates. |

Vendored libraries still ship as assets, but their internals are intentionally outside the authored-code graph. No authored product ignore entry was added. Graphify also honors existing `.gitignore` and its own sensitive-file/noise filters; their limitations are not silently counted as successful authored-code coverage.

`.gitignore` additionally keeps Graphify cache, manifest, machine root, pending hub labels, dated backups, and installer `.graphify-bak` backups local. Reviewed graph JSON/report/HTML, analysis, labels, and label signatures are committed. `.codex/` was already ignored; only the intended hook/skill files are force-added.

## Wiring inventory and behavior

Ran the project-scoped variants of the requested installers so hook commands are portable `graphify ...`, not this PC's absolute executable path. The existing `frontend-design` enabled-plugin setting is preserved.

Wiring touched these exact files (including installed skills needed on another machine):

- `CLAUDE.md` — graph-first navigation plus local rollout constraints.
- `AGENTS.md` — graph-first navigation plus local rollout constraints.
- `.claude/settings.json` — `Bash|Grep` search guard and `Read|Glob` read guard, each with a 10-second timeout.
- `.claude/CLAUDE.md` — project skill registration.
- `.codex/hooks.json` — `Bash` PreToolUse `graphify hook-check`.
- `.claude/skills/graphify/.graphify_version`
- `.claude/skills/graphify/SKILL.md`
- `.claude/skills/graphify/references/add-watch.md`
- `.claude/skills/graphify/references/exports.md`
- `.claude/skills/graphify/references/extraction-spec.md`
- `.claude/skills/graphify/references/github-and-merge.md`
- `.claude/skills/graphify/references/hooks.md`
- `.claude/skills/graphify/references/query.md`
- `.claude/skills/graphify/references/transcribe.md`
- `.claude/skills/graphify/references/update.md`
- `.codex/skills/graphify/.graphify_version`
- `.codex/skills/graphify/SKILL.md`
- `.codex/skills/graphify/references/add-watch.md`
- `.codex/skills/graphify/references/exports.md`
- `.codex/skills/graphify/references/extraction-spec.md`
- `.codex/skills/graphify/references/github-and-merge.md`
- `.codex/skills/graphify/references/hooks.md`
- `.codex/skills/graphify/references/query.md`
- `.codex/skills/graphify/references/transcribe.md`
- `.codex/skills/graphify/references/update.md`
- `.claude/settings.json.graphify-bak` — installer backup of the old settings, kept local and not committed.

Installed-version difference from the rollout: **Codex's `hook-check` is intentionally a no-op** because this integration cannot emit PreToolUse additionalContext into Codex Desktop. Codex's always-on guidance comes from `AGENTS.md`; do not claim the hook injects the report. Claude's guards nudge graph-first navigation. No strict blocking mode, global skill installation, git post-commit/checkout/merge hooks, scheduled watcher, or cloud integration was installed.

Root assistant instructions override the upstream skill's optional semantic/deep workflows: this project's approved build stays `extract --code-only` / `update .`, with no LLM labeling. Another machine needs the same CLI/SQL extra on PATH; the graph can be read without rebuilding.

## Trial questions against the final graph

All three exact questions were rerun with `graphify query "<question>" --budget 2000`, BFS depth 2. These were direct CLI queries and source checks by the adopting agent, not a claimed fresh-session speed benchmark.

### Q1 — What connects the detail-panel 3D viewer to the pop-out viewer?

**PASS (trial: PASS).** The exact query reaches `public/disc3d.js`, `public/disc3d/viewer.mjs`, `openPopout()`, `load()`, and the shared renderer/material modules. It visits 263 nodes, showing 67 within the budget; some irrelevant seeds remain.

Focused proof commands:

```text
graphify path public_disc3d_load public_disc3d_viewer_creatediscviewer --undirected
graphify path public_disc3d_openpopout public_disc3d_viewer_creatediscviewer --undirected
graphify explain public/disc3d.js --all
```

First path: `load()` → imports `disc3d/viewer.mjs` → contains `createDiscViewer()` (2 EXTRACTED hops). Second: `openPopout()` ← `load()` → viewer module → `createDiscViewer()` (3 hops, first INFERRED). The inference is navigation, not proof of state transfer.

Source confirms: `public/app.js:161` renders detail markup and calls `Disc3D.sync`; `public/disc3d.js:35` lazy-imports the common factory and registers `onExpand:openPopout`. `sync` builds shared disc/stamp/photo/hand props. `openPopout` at line 99 copies `viewer.state.props`, hand, clay state, and `getPose()`, creates another instance of the same factory, attaches it in a dialog, and applies the pose. On close, the panel glides toward the pop-out pose before the modal disposes. The bridge is shared factory plus transferred state, not merely two unrelated viewers using Three.js.

### Q2 — Where does theme switching live, and what does changing a theme touch?

**WEAK (trial: WEAK).** The exact question starts from `live` (coach test), `touch()` (atlas art), and collection `theme()`, visiting 345 nodes and showing 68. It again floods into browser tests and does not surface `public/theme.js` or `public/cosmic.css` in the result.

```text
graphify query "theme switching" --seed public/theme.js --budget 1200
```

Even the seeded query yields only the theme file and a spurious inferred `close()` callback link to a photo-math test. The theme IIFE's internal functions are not represented; CSS is unsupported. Curation cannot fix those extractor/keyword limitations, and tests were not deleted from the graph to conceal them.

Source-confirmed answer (not credited to the graph): `public/theme.js` runs before paint from `web/index.html`, owns saved/system theme selection, four choices, toggle/select controls, transitions/reduced motion, root `data-theme`, metadata/favicon updates, and `atlas-theme-change`. `public/cosmic.css` supplies theme tokens/cross-fades. `public/app.js:29–41` consumes the event, reads CSS tokens, redraws map/flight/comparison/legend/context/active detail UI. `public/disc3d/viewer.mjs:404` updates viewer theme; bag and collection scenes listen at `public/bag-scene.js:132` and `public/collection-scenes.js:38` for accent/background changes. Read these sources for theme work; the current graph cannot reliably answer its impact alone.

### Q3 — How does a disc get from source-data to the live map?

**PARTIAL / weak unseeded retrieval (trial: never answered).** The exact question visits 156 nodes (61 shown), mis-seeding on the saved-user-data API, audit tests, and `mapTargets()`. It misses the generator. Focused seeds retrieve the real files and stamp-validator relationships:

```text
graphify query "source data pipeline" --seed prepare_data.py --seed stamp_manifest.py --seed validate_data.py --seed scripts/build-workers.mjs --seed public/app.js --budget 3000
graphify explain validate_stamp_manifest --all
```

Graph evidence: `prepare_data.py` imports `validate_stamp_manifest()` from `stamp_manifest.py`; `validate_stamp_fields()` calls the same validator; generator, validator, build script and frontend file nodes exist. Renderer nodes include `catalogStampAsset()`, `catalogStampPlacement()`, `stampTexture()`, `stampGeometry()`, and `stampMaterial()` in `public/disc3d/stamp.mjs`. The graph does not encode the top-level JSON/CSV I/O, HTML script ordering, or Wrangler asset deployment as a complete path. No claim of an end-to-end graph-only PASS.

Source-confirmed path: `source-data/pdga-approved-discs.csv` provides immutable approval identity; flights/recent approvals/photo/status/reviewed overrides/reconciliation enrich matching records in `prepare_data.py`. Reviewed overrides take priority over the baseline flight match, with reviewed reconciliation used when ratings are still missing. `source-data/stamp-manifest.json` is checked through `stamp_manifest.py`, then `stampAsset` and `stampPlacement` are attached before writing generated `public/data.json` (`prepare_data.py:57–63`). `validate_data.py` checks identities, numbers, photo records, stamp rights/assets and placement. It is a verification step run deliberately; the public build does not automatically run both Python scripts. `scripts/build-workers.mjs` runs the catalog-rights check, copies the public tree plus HTML and bag metadata; `wrangler.public.jsonc` deploys the Worker/assets. Browser `public/app.js:43` fetches `data.json`, builds `AtlasLayout.positions`, filters and draws through atlas-map/layout/groups/targets. Detail/map 3D rendering consumes the catalog stamp fields through `disc3d.js` / `disc3d/stamp.mjs`. Buzzz, Zone and Luna stock stamp records are included in this base; post-revert photo modules are represented and deleted cleanup modules are absent.

## Artifacts and verification

Final reviewed output sizes (bytes):

- `graphify-out/graph.json`: **1,797,036** (about 1.71 MiB), included.
- `graphify-out/GRAPH_REPORT.md`: **24,861**, included.
- `graphify-out/graph.html`: **1,972,245** (about 1.88 MiB), included: reasonable for a navigable 2,320-node graph, under 2 MiB.
- `.graphify_analysis.json`, `.graphify_labels.json`, and `.graphify_labels.json.sig`: small supporting artifacts, included for community membership and label reuse; SHA/AST cache and manifest stay machine-local.

Validation covers secret rules before extraction, absence of ignored sources in graph JSON, source-path existence, SQL contribution, stamp/post-revert photo coverage, graph/report count agreement, JSON validity and portable hook commands, the three questions, the actual maintenance update, and staged diff scope. No product file changes and no deployment. Hook smoke checks all exited 0: Codex `hook-check` emitted no context as documented, Claude search guard emitted graph guidance with the actual viewer files, and Claude read guard accepted the payload. A final fetch still showed `origin/main` at the recorded base and the local glare branch unmerged. Product tests/builds are unnecessary for this tooling-only commit and were not run. This is navigation validation, not a runtime regression test or measured token/time-savings claim.

## Maintenance — Freddy's routine

Before every model handoff and **after every big merge**, run **`graphify update .`** in the owning checkout. Commit the refresh **with the work it describes**. Never refresh while another agent is mid-task in that checkout. Keep the SQL extra installed on both machines. Keep exclusions in place; do not opt into docs/semantic/deep extraction as part of this adoption.

Review freshness against product source changes, not just an unavoidable different HEAD after a tooling-only adoption commit: this graph records base `3abd397c`, whose product files this commit does not alter. Recheck god nodes/communities after curation or tool upgrades. `update .` regenerates the report, so the detailed limits/verdicts remain durably documented here and in assistant rules; curated labels are preserved/reconciled by Graphify's signature mechanism.

The glare/leveling refresh fence above is still owed if its port lands first. Freddy reviews this diff like any other change. Normal PR/review/deploy drill happens later; **this run commits locally and stops**. Keep `C:/Users/user/disc-atlas-graphify` intact until adoption lands; delete that trial worktree only afterward. Roger Phase 2 stays parked.
