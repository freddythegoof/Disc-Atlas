# Atlas audit follow-ups

October 19, 2026. Base: main at **567118ce**. Branch: **codex/atlas-audit-followups**.
Work was isolated in the PC worktree; the older primary checkout was left alone.
The spec is [atlas-map-audit.md](atlas-map-audit.md): U1, F3, and the approved X items.

## Part A: reproduction, red test, and fix

Reproduced in Chromium against **unchanged product files at the base commit**, before editing hit-testing.
The normal collection filter was set to All, then Innova for the brand cases. Each complete-view
dot was panned into clear map space. The click was at 0.9 of the radius measured from the drawn
.disc-art DOM bounds, outside its name box, clear of other art/name targets and map chrome.

| Viewport | View / zoom | Disc | Drawn radius | Click distance | Before |
| --- | --- | --- | ---: | ---: | --- |
| 1440 × 900 | Innova, 3× | Cheetah (90bdbd3a045f) | 36.75 px | 33.07 px | selected: null |
| 390 × 844 | Innova, 6.5× | Caiman (7a72f1a90dba) | 44.80 px | 40.32 px | selected: null |
| 390 × 844 | Innova, 9× | Classic Roc (aa882a7b105d) | 47.12 px | 42.41 px | selected: null |
| 1440 × 900 | Unfiltered, 9× | Enemy (40b1969411e6) | 47.12 px | 42.41 px | selected: null |

The actual target radius before the fix was 22 px. An initial current-production desktop Innova
probe also missed Boss at 3×; at 6.5×/9× that desktop view had no non-large dots because they had
all been promoted. The regression therefore uses the denser phone viewport for the deeper brand
cases and All production records. No catalog, grouping, tier, or placement rule was changed to
manufacture a dot.

Extended tests/atlas-persist-browser.mjs with these four real pointer-click cases. With only
the test additions and unchanged product code, running that suite exited 1:
all four dotFailures entries had selected: null. With the fix, all four select their own disc.
The full persist suite passed 17 checks before Part A was committed.

dotArtRadius() is now the shared expression AtlasGroups.gapSize(zoom,'small')/2 for organic
complete-view dots and their compare rings (F3). The non-large organic hit target adds 6 px
of slack. Personal dots retain 22 px. The large-marker expression and gapTarget() are unchanged;
compare-ring sizes, target ordering, labels, and click dispatch are unchanged.

## Part B: fresh reference evidence

Searches below were run across public/, web/, and tests/ before the corresponding removals,
then inspected for actual scope. Searches also included package.json and scripts/ for X12.
The audit was a starting claim; these are the rechecked results at the base plus Part A.

| Item | Search / observed references | Change |
| --- | --- | --- |
| X1 | rg for planetLabels, labelPlacements, drawPlanetLabels: the map declaration, call, function, and clear; readers only in deep-zoom, grouping-zoom, label-prominence, and zoom-candidates. No write populated the map or assigned labelPlacements. | Removed the empty map and dead clears. Renamed the remaining live two-line update to updateSatelliteLabelSuppression(), called at exactly the old point in draw(). The ≥2.9 / ≤2.7 hysteresis and its My Map promotion readers stay. |
| X4 | Whole-word rg for hover, points, drag, moved, hash: the four app globals had no consumers. Other matches were prose/CSS, object properties, or independently scoped declarations. Stamp tests define their own hash; collection and bag hashes are module/local functions. | Removed only the four declarations from app.js and its unused hash(). |
| X5 | rg for themePalette and marker-edge, then themePalette.edge: the palette object populated edge, with no consumer. | Removed only edge:token('marker-edge'). The CSS token and its CSS uses stay. |
| X6 | rg for applyTheme(: theme-event listener, initial application, and browser-test calls all pass one argument. | Removed persist=false and its unreachable localStorage branch. Theme persistence in theme.js stays. |
| X7 | rg for tweenCamera(: one-argument spring API; only the two app calls supplied obsolete duration arguments. | Removed .45 from showOnAtlas and .28 from zoom reset. |
| X10 | Literal rg for !document.body.classList.contains('my-bag-mode'): seven product copies, plus independent test observations. | Added immersiveMap() and substituted exactly those seven call sites: buildClusters, shownPosition, draw, boundedCamera, tweenCamera, zoomDestination, showOnAtlas. No condition, evaluation order, or logic was moved. Tests keep their independent predicate observations. |
| X12 | Checked every filename against every package.json script: **zero** references for each. Filename/import searches showed only the legacy runner importing its helpers, plus grouping-zoom importing zoom-candidates; no retained runner imported this set. | Deleted exactly the eleven files listed below. Unrelated product files named motion.mjs stay. |
| X13 | Read the “not buttons: a click … does nothing” paragraph against docs/atlas-readable-clickable.md, mapTargets(), and the click handler. | Corrected only that stale sentence: art/readable-name clicks select the disc; these canvas entries remain outside the tab order. |

Reproducible reference searches (patterns kept narrow; broad X4 results were checked for lexical scope):

    rg -n 'planetLabels|labelPlacements|drawPlanetLabels' public web tests
    rg -n '\b(hover|points|drag|moved|hash)\b' public web tests
    rg -n 'themePalette|marker-edge' public web tests
    rg -n 'themePalette\.edge' public web tests
    rg -n 'applyTheme\(|tweenCamera\(' public web tests
    rg -n -F "!document.body.classList.contains('my-bag-mode')" public web tests
    rg -n -F '<each legacy filename>.mjs' package.json public web tests scripts

Post-sweep searches find no planetLabels, labelPlacements, or drawPlanetLabels references in
public/, web/, or retained tests/. The seven product predicate copies are now seven helper calls
and one predicate definition.

### X8 verdict: leave both writes

The first visibility pass includes current-group membership, node version, and old/new position
checks, then hides obsolete satellite labels. The per-marker pass writes the live label state
after updating that marker. During staged regrouping, a marker may have an old version/position
or be skipped by the update budget; the first pass still needs to hide its obsolete label.
Thus the two writes do not agree on every branch, even though ordinary organic settled frames
can agree. No all-branches equivalence has been established for organic Atlas and My Map, so
neither write was removed. The satellite, minor-label, and leader paths are intact.

### X12 deletion list

- tests/motion.mjs
- tests/deep-zoom.mjs
- tests/grouping-zoom.mjs
- tests/label-prominence.mjs
- tests/zoom-candidates.mjs
- tests/filter-regroup.mjs
- tests/zoom-boundary.mjs
- tests/premium.mjs
- tests/atlas-interactions.mjs
- tests/atlas-groups.mjs
- tests/context-header.mjs

### Deliberately kept

- X2: My Map's live labels, promotion, satellites, and leaders.
- X3: AtlasLayout.spread, actively kept by retained tests.
- X9: the DOM/canvas pin and typography implementation pairs.
- X11: window.DiscThumbnails, still used by Directory and My Bag.
- D1–D4: names/nameAlpha, scatter and positions, default lens, and focusability.
- P1–P9 and F4: no performance implementation or category/data-pipeline work.
- Score ordering, all three tiers, the colorblind palette, and the neutral/personal boundary.

## Verification

The repository has no bare npm test script. All 32 retained non-browser Node unit suites were
discovered with rg -l 'node:test' tests -g '*.mjs' -g '!*-browser.mjs' and passed with
node --test followed by those filenames: **250 tests, 0 failures** after the sweep.
The first run could not load jose for auth/bag/coach; reusing the existing jose@6.2.12 installation
through an ignored local junction resolved that setup failure. No manifest or lockfile changed.

- npm run test:atlas:stamps: passed, including official art, tiny-tier identity, owner-photo precedence, and cache/placement isolation.
- npm run test:atlas:organic: passed all 6 checks on desktop and phone, including determinism, neighborhoods/order, 2.8×/5×/9×, and selection without reshuffling.
- npm run test:atlas:intro: passed, including strict resting-frame PNG byte equality for reveal/direct and reduced/direct on desktop and phone (0 px difference).
- npm run test:atlas:persist: passed again on the final product tree, all 17 browser checks plus 7 target unit tests.
- npm run test:my-map: passed 6 unit tests and 10 browser checks, including personal coordinates, neutral return, zoom regrouping, theme/phone views, and repeated map hand-offs.
- node tests/atlas-3d-perf.mjs --self-test: passed aggregation and boundary checks; this is not the performance gate.
- node --check public/atlas-map.js, node --check public/app.js, and git diff --check: passed.
- Independent read-only code review: no actionable correctness, scope, or test findings.

Browser suites regenerated proof images/measurement files; those incidental tracked changes were
restored before the scoped commits. No deployment, push, or PR is part of this task.

## Performance gate

**Owed; not attempted in this window.** After functional verification completed and its test sessions
exited, a five-second process-CPU sample showed sustained background Python/assistant compute and
active game/browser processes. This was not an honestly quiet window. No performance verdict or
loaded-machine gate numbers are being quoted. Run npm run test:atlas:3d:perf after those workloads
are quiet; the passing aggregation self-test above does not discharge that gate.

## Graphify

Ran graphify update . on the final code tree: **2,582 nodes, 5,392 edges, 142 communities**.
The report records 0 input / 0 output model tokens. No semantic extraction, deep mode, or LLM
labeling ran. The tool retained/reconciled its existing community labels locally.

Before refresh, checked the explicit .env*, .dev.vars*, credentials.json, .aws/, *.pem, and *.key
exclusions, and the actual ignore predicates for file patterns. Markdown, catalog data, outputs,
and dependencies remain excluded, keeping maintenance AST-only. Directory-only rules require
existing directories for the predicate API; no credential contents were opened. After refresh,
checked that the eleven deleted suites have no source nodes, new helpers are represented, and
excluded credential/Markdown source nodes are absent. Existing extraction gaps remain documented
in docs/graphify-adoption.md. The graph refresh is a separate scoped commit.
