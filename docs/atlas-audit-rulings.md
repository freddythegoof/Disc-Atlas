# Atlas audit rulings — docs pass

Rulings: Freddy, Oct 19, 2026. Branch: `codex/atlas-audit-rulings`. Exact base:
`893e70c610dd36d3052c45b54a130a27e75f1ab3` (`main`, PR #29 included).
Worktree: `C:/Users/user/.codex/worktrees/atlas-audit-rulings/disc-atlas`.

This build records the final D1–D4 decisions. It changes four Markdown documents only:
[Organic Atlas](atlas-organic.md), [color/label law](color-palette.md), the append-only
[audit addendum](atlas-map-audit.md#rulings-freddy-oct-19-2026), and this evidence record.
No behavior, product code, data, pipeline, migration, config, dependency manifest, or test changes.
The sole product-code inspection was the read-only D3 `defaultMap` trace in `public/app.js`.

## Grep evidence and reconciliation

The following searches ran before edits, starting with the organic doc and audit. Locations in
the tables are **base line numbers at `893e70c6`**, so the evidence stays identifiable after wrapping.
The broader search also covered repository Markdown, including hidden documentation, excluding
Git internals, dependencies, generated graph/output, vendor files, and nested worktrees.
No separate checked-in constitution/law document was found; the old L2 text is quoted in the audit.

```powershell
rg -n -i 'unlabel|labels only|smalls.*label|score ordering|whole cohorts|cohort means|farther apart than both reaches|name shows on hover|hover/focus labels for small' docs -g '*.md'
rg -n -i 'unlabel|labels only|only.*bigs|smalls.*label|smalls.*name|name.*smalls|score.order|ordering law|per.pair|whole.cohort|cohort|constitution|L[1278][^a-z]' docs -g '*.md' -g '!stability-review-queue.md' -g '!consensus*' -g '!graphify-adoption.md'
rg -n -i --hidden --max-columns 350 --max-columns-preview 'smalls are|labels only on|unlabeled colored|unlabelled|smalls?[^.\r\n]{0,70}(unlabel|label|name)|score.order|per.cohort|constitution|3915ede' --glob '*.md' --glob '!.git/**' --glob '!node_modules/**' --glob '!graphify-out/**' --glob '!outputs/**' --glob '!public/vendor/**' --glob '!work/**' --glob '!.claude/worktrees/**' --glob '!docs/stability-review-queue.md' .
```

### D1 — KEEP: the law text moves, the code does not

**Ruled law:** smalls that earn name room carry names at 1×; that is now the law, not a violation.

| Base location | Statement found | Reconciliation |
| --- | --- | --- |
| `atlas-map-audit.md:118–137`, especially 128–129 | “smalls are unlabeled colored dots … Labels only on bigs at 1×”; the `3915ede` conflict and keep/revert alternatives | Preserved verbatim as historical findings. The appended D1 ruling explicitly supersedes the old quotation and closes the decision as KEEP; `nameAlpha` is unchanged. |
| `atlas-organic.md:39–40` | Complete-view small dots' “name shows on hover and focus” | “name is shown in full wherever the disc and its name have room, including at 1x.” |
| `color-palette.md:17` | “Brand names remain on large markers and on hover/focus labels for small markers.” | Curated markers carry disc/brand names; smalls that earn name room carry names at 1x and remain named at every zoom; minis earn names as they grow. Accessible names are scoped to DOM marker buttons. |
| `atlas-organic.md:90–95,132–134,185–189,195–203,239–253` | Existing depth, clearance, Names and test text already says smalls are named at every zoom, including 1x | Affirmed as law in the Three tiers and Names introductions. Name-room admission, mini size thresholds, and existing test descriptions remain. |

### D2 — COHORT: score ordering is per-cohort

**Ruled law**, written into both law locations touched by D1 (`atlas-organic.md`, Where each disc
rests; `color-palette.md`, label/position paragraph): the score-ordering law is **per-cohort**;
the seeded scatter may invert neighbours within ~12 index points; whole cohorts stay ordered,
and the named guarantees (Wraith never more stable than Destroyer) hold absolutely.

| Base location | Statement found | Reconciliation |
| --- | --- | --- |
| `atlas-organic.md:72–74` | Two discs “farther apart than both reaches keep their order on both axes” | Replaced this ordering formulation with the ruled per-cohort law above. The neighboring-disc description remains. |
| `color-palette.md:17` | “Map position continues to encode speed and stability.” | Retained, followed by the same explicit per-cohort law, ~12-point allowance and absolute named guarantee. |
| `atlas-map-audit.md:139–165`, especially 151–160 | Cohort means ordered at every strength, whole cohorts at full strength; quotes the organic reach rule; asks per-pair versus cohort | Historical evidence remains untouched. The appended D2 ruling closes the question as COHORT in Freddy's terms. |
| `atlas-map-audit.md:382–386` | “Score ordering guarantees that do hold”; cohort means, full-strength cohorts, Wraith/Destroyer examples | Historical findings remain untouched; the addendum states the standing law and absolute named guarantee. |
| `atlas-map-audit.md:11–12`; `atlas-audit-followups.md:98–100` | Law-name inventory and prior build's unchanged-scope statement (“Score ordering, all three tiers…”) | References, not competing law text; retained. The addendum and updated law locations resolve D1/D2. |

Other search hits were classified rather than rewritten: `06h-satellite-label-follow-up.md:9`
says satellites at 3x/5x remain unlabeled, and `plan-07-review.md:20` describes legacy minor-label
hover/focus fallback. Those are records of the separate satellite/promotion path, retained on
My Map (audit X2), not the main Atlas's canvas-small law. “Labels only” hits in
`stability-review-queue.md:2217,2854,3182,3358` concern manufacturer flight-number evidence,
not map labels. The organic doc's “automatic minor labels” note at 228 concerns the replaced
legacy overview. None reasserts the old main-Atlas small-label law.

### D3 — KEEP 'mine', with Freddy's addendum: verify only

**Standing rule:** signed-in users opening on Personalized is fine, and the app opens to whatever
default the user has set for themselves. The literal is a fallback; the preference mechanism exists.

Read-only search: `rg -n 'defaultMap|setLens|activeLens|localStorage|sessionStorage|preferences|settings|mine|initPersonal' public/app.js`.

| Source at base | Verified flow |
| --- | --- |
| `public/app.js:10–13` | `lensNames` accepts `default`, `mine`, `only`. Start with `'mine'`; read `atlas-default-map`, falling back via `??` to legacy `atlas-lens`; a valid value overrides the literal, is saved under the current key, and the legacy key is removed. `atlasLens` starts from the result. |
| `public/app.js:18` | With no bag colors, `activeLens()` returns `'default'` (Standard). |
| `public/app.js:273–285,291` | Menu state reflects the saved default; the toolbar calls `setLens`, which changes the current lens without persisting a new default. |
| `public/app.js:297–300` | The site menu's Default map choice assigns `defaultMap`, writes `atlas-default-map` to localStorage, and applies it now. |

The addendum states the verification answer in one sentence. Persistence here is browser-local;
this trace makes no claim of account-wide synchronization. With no valid saved preference (or
unavailable localStorage), `'mine'` remains the fallback, subject to the no-bag Standard behavior.
No unbuilt preference-mechanism follow-up is needed, and nothing was built or changed.

### D4 — DOCUMENT: pointer-only canvas tiers

| Base location | Statement found | Reconciliation |
| --- | --- | --- |
| `atlas-organic.md:175–177` | “A pointer click on their art or a readable name selects the disc; they are not buttons and are not in the tab order.” (PR #29's X13 correction) | The corrected click sentence is preserved. Beside it: canvas smalls/minis are **pointer-only**, clickable but not keyboard-focusable or screen-reader reachable; tier-1 discs are real buttons. Freddy's known, accepted limitation is stated plainly. |
| `color-palette.md:17` | Generic “Marker accessible names include the brand and disc type” beside the small-marker claim | Scoped to DOM marker buttons, with a pointer-only canvas distinction and link to the organic rule. |
| `atlas-map-audit.md:182–192,365` | D4 focusability finding and X13's pre-fix stale quotation | Preserved as the audit record; the appended D4 ruling records DOCUMENT and acknowledges PR #29's existing click correction. |

## Verification and limits

Applied the graphify navigation skill before source searches, then verified D3 in source.
**No Graphify refresh was needed or run:** this is a docs-only pass; the graph tool is code-only.
`graphify-out/` is unchanged. No deep/semantic extraction or provider calls ran.

The repository has no bare `npm test` script. The same complete retained non-browser Node unit
set recorded by PR #29 was discovered and run with Node `v24.21.0`:

```powershell
$unitSuites = @(rg -l 'node:test' tests -g '*.mjs' -g '!*-browser.mjs' | Sort-Object)
node --test @unitSuites
```

**PASS: all 32 suites, 250 tests, 0 failures, 0 skipped.** Existing installed dependencies were
reused through an ignored worktree-local `node_modules` junction; no package or lockfile changed.

Extra checks do not support a claim that every test in the repository is green:

- Python discovery with the bundled runtime and imaging packages:
  `python -m unittest discover -s tests -p '*test*.py'` — **49 tests, 46 passed,
  2 failures, 1 error**, all remaining problems in unchanged `stamp_fraction_audit_test`.
  Its historical `ba081fd` comparison cannot find `public/stamps/discraft/anax.png`, expects
  only fourteen catalog placement additions, and expects Buzzz's old manifest entry unchanged.
  Current stamp assets/catalog/manifest and those tests are unchanged from `893e70c6`.
  The system Python initially also lacked NumPy/Pillow; the bundled runtime removed those errors.
- `node --test scripts/about-hero.test.mjs` could not load `playwright`; this is an additional
  browser-dependent script, outside the 32 retained unit suites. The initial sandbox attempt
  also hit `spawn EPERM`; the normal-access retry exposed the missing package. No browser or
  performance gate result is claimed for this docs pass.

Thus the retained Node-unit acceptance is green; a literal all-repository-tests-green claim
would be false. Stamp-test/fixture repairs remain outside this docs-only order. No tests were
changed to obtain a pass. Generated Python bytecode was restored/removed after the extra checks.

`git diff --check` passes. The audit's original bytes, through its final findings paragraph,
are preserved as an exact prefix, followed only by the requested Rulings section. Scope checks
compare against `893e70c6` and require exactly the four Markdown paths listed above; product
code (including `nameAlpha`), tests, data, pipeline, migrations and graph outputs are unchanged.
Delivery is three scoped local commits: law text, audit addendum, and this write-up.
No push or PR is part of this build; those are Freddy's steps.
