# Graph Report - stamp-pipeline-v2-build  (2026-11-26)

## Corpus Check
- 520 files · ~5,895,986 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 315 file(s) not represented in the graph (top: .log 239, .gz 23, .css 17)

## Summary
- 3571 nodes · 7786 edges · 185 communities (148 shown, 37 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 275 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `74f7d661`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- workers/auth.mjs
- Bag scene
- bag.js
- bag-popup-browser.mjs
- scripts
- disc-photo.mjs
- sampling-audit-draw.mjs
- package.json
- disc3d-popout-browser.mjs
- photo-gestures-browser.mjs
- manufacturer-diff.py
- initAtlasMap
- halo-plastic-browser.mjs
- my-bag.js
- atlas-map.js
- Shared 3D disc viewer
- AuditTests
- SceneView
- bag3d/viewer.mjs
- accent-follows-appearance-evidence.mjs
- verify-discraft-fraction-schema.py
- halo-swirl.mjs
- all-discs-gallery.js
- bag-values.js
- dependencies
- bag-pockets-browser.mjs
- v2.mjs
- Account and bag SQL schema
- atlas-gesture-probe.mjs
- atlas-depth-browser.mjs
- clear-true-color-browser.mjs
- photo-stamp-stall-browser.mjs
- v2.mjs
- bag-layout.mjs
- disc-albedo.mjs
- .zoom
- devDependencies
- photo-stamps.mjs
- lens-corner-browser.mjs
- photo-editor-races.mjs
- compilerOptions
- atlas-groups.js
- atlas-3d-browser.mjs
- halo-band-v2.mjs
- bag-interactions-browser.mjs
- components.json
- Detail and pop-out viewer bridge
- photo-true-color.mjs
- api.cjs
- public/disc-stamp-extract.mjs
- atlas-organic-browser.mjs
- Catalog generation and stamp validation
- about-hero.js
- shapeForDisc
- colourdiff.mjs
- racks.mjs
- sites-env.sh
- atlas-depth.mjs
- disc3d/viewer.mjs
- personal-lens.mjs
- vite.config.ts
- bag-pulled-sizing.mjs
- pnpm-install.mjs
- display-customization-browser.mjs
- disc-register.mjs
- common.mjs
- state
- pathlib
- tests/disc-stamp-clear.mjs
- atlas-speed-band-browser.mjs
- photo-stamp-sync.mjs
- photo-stamp-one-click-browser.mjs
- photo-stamp-identity-browser.mjs
- display-palette.mjs
- appearance.js
- display-customization-evidence.mjs
- slider-drag-browser.mjs
- workers/bag.mjs
- dropdown-indicator-browser.mjs
- photo-albedo.mjs
- theme
- MergedRecords
- atlas-layout.js
- public/disc-stamp-color.mjs
- buildClusters
- tests/auth.mjs
- discraft-fraction-audit-browser.mjs
- public.mjs
- hyzer-coach-browser.mjs
- StampManifestTests
- clear-plastic-partb-evidence.mjs
- apple-design-2-browser.mjs
- disc-stamp-worker.mjs
- display-palette.js
- draw
- atlas-motion.js
- coach.js
- tests/disc-stamp-extract.mjs
- install-pnpm.sh
- discraft_batch2_test.py
- stamp_fraction_audit_test.py
- bag-collections-browser.mjs
- halo-band-sampling.mjs
- account.js
- ref_node_fs
- appearance.js
- photo-adder-rework-browser.mjs
- next
- atlas-targets.js
- ref_node_module
- bag-tweaks-browser.mjs
- install-ci.sh
- ref_node_test
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- cloudflare-env.d.ts
- overrides
- bag-demo.mjs
- display-customization-browser.mjs
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- disc-request.js
- stability.mjs
- compose-discraft-fraction-proofs.py
- shopping.js
- Page
- lens-corner-browser.mjs
- disc-photo-qa.mjs
- photo-level-measure.mjs
- display-customization-evidence.mjs
- atlas-layout.mjs
- rack-motion.mjs
- workers/bag.mjs
- display-harness.mjs
- photo-stamp-assets-evidence.mjs
- more-packs-evidence.mjs
- 0017_disc_requests.sql
- prompt-4-leftovers-browser.mjs
- tests/disc-stamp-delight.mjs
- clear-plastic-partb-evidence.mjs
- disc-appearance-browser.mjs
- palette.mjs
- photo-stamp-sync-browser.mjs
- collection-scenes.js
- photo-adder-rework-browser.mjs
- workers/coach.mjs
- ref_node_fs
- personal-lens.mjs
- atlas-3d-perf.mjs
- photo-stamp-level-browser.mjs
- photo-retake-advisory-browser.mjs
- stamp-extraction-fidelity.mjs
- HttpCache
- photo-stamp-assets-evidence.mjs
- atlas-organic.mjs
- drizzle-kit
- engines
- playwright

## God Nodes (most connected - your core abstractions)
1. `scripts` - 67 edges
2. `createDiscViewer()` - 66 edges
3. `BagScene` - 63 edges
4. `mountRacks()` - 44 edges
5. `mountBag()` - 43 edges
6. `render()` - 37 edges
7. `theme()` - 36 edges
8. `createAtlasArt()` - 36 edges
9. `state()` - 35 edges
10. `delightPixels()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `page()` --indirect_call--> `theme()`  [INFERRED]
  tests/hyzer-coach-browser.mjs → public/collection-scenes.js
- `layout()` --indirect_call--> `columns()`  [INFERRED]
  public/collection3d/graveyard.mjs → tests/bag-3d-layout.mjs
- `sampled()` --calls--> `delightPixels()`  [EXTRACTED]
  tests/halo-band-sampling.mjs → public/disc-albedo.mjs
- `labAt()` --calls--> `rgbToLab()`  [EXTRACTED]
  tests/disc-stamp-delight.mjs → public/disc-stamp-extract.mjs
- `prod()` --calls--> `extract()`  [EXTRACTED]
  spikes/stamp-pipeline-v2/stability.mjs → public/disc-stamp-worker.mjs

## Import Cycles
- None detected.

## Communities (185 total, 37 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (84): activeLens(), addDestinationControl(), applyTheme(), atlasPriority(), bagColors(), brandColor(), brandList(), brandPalette (+76 more)

### Community 1 - "workers/auth.mjs"
Cohesion: 0.22
Nodes (18): base64url(), body(), cookie(), createAuth(), account(), callback(), session(), start() (+10 more)

### Community 2 - "Bag scene"
Cohesion: 0.10
Nodes (10): accent(), BAG_SPRING, BagScene, div(), loadViewer(), POCKET, reduced(), stampStyle() (+2 more)

### Community 3 - "bag.js"
Cohesion: 0.10
Nodes (49): dynamic, GET(), GET(), DELETE(), photoBytes(), POST(), PUT(), save() (+41 more)

### Community 4 - "bag-popup-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 5 - "scripts"
Cohesion: 0.03
Nodes (67): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+59 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.08
Nodes (45): photoLook(), canvasBitmap(), canvasBlob(), checkPhotoSize(), colorStampBlob(), createPhotoEditor(), decodePhoto(), DEFAULTS (+37 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.10
Nodes (23): a, args, base(), brandCount, byId, cellPool(), cells, excludedIds (+15 more)

### Community 8 - "package.json"
Cohesion: 0.05
Nodes (40): name, packageManager, private, type, version, @base-ui/react, class-variance-authority, @cloudflare/vite-plugin (+32 more)

### Community 9 - "disc3d-popout-browser.mjs"
Cohesion: 0.07
Nodes (19): byName(), {chromium}, errors, server, settle(), show(), types, view() (+11 more)

### Community 10 - "photo-gestures-browser.mjs"
Cohesion: 0.19
Nodes (10): results, results, baseline, characterize, ref, results, selected, photoHarness() (+2 more)

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.09
Nodes (31): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+23 more)

### Community 12 - "initAtlasMap"
Cohesion: 0.18
Nodes (22): animateZoom(), cameraMoving(), catchAtlasIntro(), changeZoom(), clearClusterTimers(), closeCluster(), initAtlasMap(), levelHeld() (+14 more)

### Community 13 - "halo-plastic-browser.mjs"
Cohesion: 0.03
Nodes (66): {chromium}, {chromium}, command(), metrics, server, probe(), chroma(), {chromium} (+58 more)

### Community 14 - "my-bag.js"
Cohesion: 0.05
Nodes (61): seeThroughPlastic(), isHalo(), addMenu, addMenuOpen(), bagColorMap, bagFinishMap, bagHaloMap, bagHaloModelMap (+53 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.06
Nodes (44): artZooming(), atlasPositions, CAMERA_AXES, cameraLooksStill(), cameraSpring, clusterPicks, comparisonMarkup(), comparisonPalette() (+36 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.14
Nodes (40): camera(), lightTheme(), angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), applyTurn(), attach() (+32 more)

### Community 18 - "SceneView"
Cohesion: 0.13
Nodes (3): clamp(), NameTag, SceneView

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.09
Nodes (37): attachDiscFeatures(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot(), advanceTime(), poseAt(), clamp() (+29 more)

### Community 20 - "accent-follows-appearance-evidence.mjs"
Cohesion: 0.15
Nodes (20): BEFORE, box(), CHOSEN, clip(), closeMenu(), compose(), LIME, load() (+12 more)

### Community 21 - "verify-discraft-fraction-schema.py"
Cohesion: 0.20
Nodes (4): main(), slug(), tile(), DiscmaniaIdentity

### Community 22 - "halo-swirl.mjs"
Cohesion: 0.16
Nodes (21): ASYM_FEATHER, asymFront(), drawnFront(), [dye,wash,plate,ink], dyeShare(), enc(), fbm(), glared() (+13 more)

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.22
Nodes (18): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagLayout(), renderFinish(), stampChoiceOf() (+10 more)

### Community 24 - "bag-values.js"
Cohesion: 0.11
Nodes (28): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagClass(), bagPalette(), bagSlots(), DEFAULT_BAG_COLOR (+20 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "bag-pockets-browser.mjs"
Cohesion: 0.13
Nodes (9): {chromium}, command(), errors, server, shots, themes, widths, {chromium} (+1 more)

### Community 27 - "v2.mjs"
Cohesion: 0.17
Nodes (21): GLARE_CEILING, box(), CLONE_STEPS, cloneCores(), delightStamp(), distanceTo(), encode(), f() (+13 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.10
Nodes (23): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+15 more)

### Community 29 - "atlas-gesture-probe.mjs"
Cohesion: 0.14
Nodes (16): args, at(), {chromium}, dpr, errors, GESTURES, intro(), open() (+8 more)

### Community 30 - "atlas-depth-browser.mjs"
Cohesion: 0.12
Nodes (14): CAMERAS, checks, {chromium}, clean(), errors, gapArt(), SCENE(), server (+6 more)

### Community 31 - "clear-true-color-browser.mjs"
Cohesion: 0.12
Nodes (20): asset, dE(), flag, haveRaptor, hex(), hsv(), lab(), med() (+12 more)

### Community 32 - "photo-stamp-stall-browser.mjs"
Cohesion: 0.21
Nodes (10): CACHE_SEEDS, holdInstallLocks(), InstallProgress, main(), openLock(), openReport(), OPERATIONAL_FAILURE_CODES, showLine() (+2 more)

### Community 33 - "v2.mjs"
Cohesion: 0.05
Nodes (17): output, server, output, data, {chromium}, context, T, checkCatalogIdentity() (+9 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.07
Nodes (43): assignSides(), BAG_BOX, brickRows(), byKey(), clamp(), depthOrder(), DISC, fan() (+35 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.14
Nodes (34): encodeHalo(), bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress() (+26 more)

### Community 36 - ".zoom"
Cohesion: 0.15
Nodes (13): checks, {chromium}, clickLands(), completeDot(), errors, mapOwned(), onMap(), READABLE() (+5 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "photo-stamps.mjs"
Cohesion: 0.14
Nodes (33): account(), adoptUp(), api(), assetOf(), blobOf(), broken, cached(), changed() (+25 more)

### Community 39 - "lens-corner-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, server, shots, THEMES, WIDTHS (+1 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.10
Nodes (6): keepSnapshotAsset(), apiSource, bagSource, closeSource, saveSource, stampStubs

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.20
Nodes (17): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+9 more)

### Community 43 - "atlas-3d-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, errors, SCENE(), server, settled(), show(), VIEWPORTS

### Community 44 - "halo-band-v2.mjs"
Cohesion: 0.32
Nodes (5): jose, googleFetch, reply, worker, googleFixture()

### Community 45 - "bag-interactions-browser.mjs"
Cohesion: 0.11
Nodes (11): checks, {chromium}, errors, GOTO, MAIN, metrics, PUTTERS, server (+3 more)

### Community 46 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, registries, rsc (+9 more)

### Community 47 - "Detail and pop-out viewer bridge"
Cohesion: 0.19
Nodes (12): clay(), closePopout(), load(), lockScroll(), openPopout(), popoutDialog(), requestClose(), resolveColor() (+4 more)

### Community 48 - "photo-true-color.mjs"
Cohesion: 0.15
Nodes (17): applyClearPhotoRows(), clearPhotoPixels(), EDGE, edgeRadius(), fitCircle(), hexBytes(), labOf(), planClearPhoto() (+9 more)

### Community 49 - "api.cjs"
Cohesion: 0.12
Nodes (11): assert, {createRequire}, fs, {Miniflare}, req, root, assert, ctx (+3 more)

### Community 50 - "public/disc-stamp-extract.mjs"
Cohesion: 0.13
Nodes (25): close(), components(), distanceTo(), extractPhotoStamp(), f(), fillFromRing(), gaussian(), ghosts() (+17 more)

### Community 51 - "atlas-organic-browser.mjs"
Cohesion: 0.15
Nodes (13): checks, {chromium}, errors, layout(), near(), SCENARIOS, server, settled() (+5 more)

### Community 52 - "Catalog generation and stamp validation"
Cohesion: 0.14
Nodes (9): brandnorm(), norm(), validate_stamp_fields(), validate_stamp_manifest(), merges(), candidates(), load_alias(), norm() (+1 more)

### Community 53 - "about-hero.js"
Cohesion: 0.23
Nodes (12): active(), canvas, desktop, eligible(), fallback(), frame(), hero, motion (+4 more)

### Community 54 - "shapeForDisc"
Cohesion: 0.28
Nodes (8): DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, KEYS, LIST, OVERMOLD_DISCS, overmoldColors(), parseColor(), toHex()

### Community 55 - "colourdiff.mjs"
Cohesion: 0.05
Nodes (28): a, b, [disc,box,out], H, heat, L, P, T (+20 more)

### Community 56 - "racks.mjs"
Cohesion: 0.07
Nodes (62): rackStyle(), ABOVE_GROUND, engraving(), graveColumns(), plots(), mountGraveyard(), dress(), hover() (+54 more)

### Community 57 - "sites-env.sh"
Cohesion: 0.14
Nodes (13): HOME, MINIFLARE_REGISTRY_PATH, npm_config_audit, npm_config_cache, npm_config_fund, npm_config_update_notifier, sites-env.sh script, SITES_ENV_READY (+5 more)

### Community 58 - "atlas-depth.mjs"
Cohesion: 0.15
Nodes (9): boxes(), CHROME, discs, LEVELS, positions, prints, rooms(), runtime (+1 more)

### Community 59 - "disc3d/viewer.mjs"
Cohesion: 0.09
Nodes (39): CLEAR, discGeometry(), groupRim(), lathePoints(), liftThumbtack(), PLASTICS, topLayerGeometry(), acquirePhoto() (+31 more)

### Community 60 - "personal-lens.mjs"
Cohesion: 0.17
Nodes (13): activateBag(), closeBagTips(), directory(), leaveBag(), positionBagTips(), setBagView(), syncMyMap(), undockDetail() (+5 more)

### Community 61 - "vite.config.ts"
Cohesion: 0.25
Nodes (3): vinext, vite, localBindingConfig

### Community 62 - "bag-pulled-sizing.mjs"
Cohesion: 0.25
Nodes (5): bag, blocks, entries, phone, viewport

### Community 63 - "pnpm-install.mjs"
Cohesion: 0.24
Nodes (23): bagComparator(), pocketLabel(), api(), chooseRackStyle(), focusFirst(), foundDisc(), loadBag(), lostItems() (+15 more)

### Community 64 - "display-customization-browser.mjs"
Cohesion: 0.29
Nodes (3): agree(), CLASSIC, consumers()

### Community 65 - "disc-register.mjs"
Cohesion: 0.12
Nodes (35): along(), apply(), autoRegister(), CENTRE_CAP, cropThrough(), designCentre(), eigen(), ellipseFrom() (+27 more)

### Community 66 - "common.mjs"
Cohesion: 0.07
Nodes (35): only, only, berg, crop(), exists, EXTRA, framing, IN (+27 more)

### Community 67 - "state"
Cohesion: 0.04
Nodes (35): {chromium}, state(), checks, {chromium}, command(), errors, perf, server (+27 more)

### Community 68 - "pathlib"
Cohesion: 0.12
Nodes (8): digest(), measure(), extract(), slug(), digest(), run(), slug(), extract()

### Community 69 - "tests/disc-stamp-clear.mjs"
Cohesion: 0.18
Nodes (14): clearPhoto(), disc(), GLARE, glareCase(), HAIR, inBox(), NAVY, NAVY_BOX (+6 more)

### Community 70 - "atlas-speed-band-browser.mjs"
Cohesion: 0.18
Nodes (10): CAMERAS, {chromium}, errors, failures, RENDERED(), server, settled(), show() (+2 more)

### Community 71 - "photo-stamp-sync.mjs"
Cohesion: 0.15
Nodes (12): validateUpload(), chunk(), extended(), fixture(), byId, createBag(), idAliases, cleanupTextures() (+4 more)

### Community 72 - "photo-stamp-one-click-browser.mjs"
Cohesion: 0.18
Nodes (9): base, CHROME, off(), prints, rated, runtime, SIZES, STATES (+1 more)

### Community 73 - "photo-stamp-identity-browser.mjs"
Cohesion: 0.11
Nodes (13): {chromium}, ink(), server, at, baseline, compare(), noise, runs (+5 more)

### Community 74 - "display-palette.mjs"
Cohesion: 0.23
Nodes (11): contrast(), distance(), lab(), linear(), luminance(), MATRICES, minDistance(), oklch() (+3 more)

### Community 75 - "appearance.js"
Cohesion: 0.10
Nodes (53): FINISH_OPACITY, coarse(), DISC_BUDGET, discMaterial(), discModel(), parts, personalStampStyle(), softwareRenderer() (+45 more)

### Community 76 - "display-customization-evidence.mjs"
Cohesion: 0.46
Nodes (6): catalogDisc(), ready(), setTheme(), shot(), trio(), wait()

### Community 77 - "slider-drag-browser.mjs"
Cohesion: 0.24
Nodes (10): assertRangeDrag(), checkRangeDefaults(), dragRange(), {chromium}, errors, probe(), results, server (+2 more)

### Community 78 - "workers/bag.mjs"
Cohesion: 0.23
Nodes (14): body(), json(), LOOKS, owned(), part(), placed(), PNG_CHUNKS, shape() (+6 more)

### Community 79 - "dropdown-indicator-browser.mjs"
Cohesion: 0.17
Nodes (9): checks, {chromium}, command(), controls, errors, server, shots, THEMES (+1 more)

### Community 80 - "photo-albedo.mjs"
Cohesion: 0.24
Nodes (11): SOFTEN_GLARE, ab(), enc(), lin(), luma(), lumAt(), photo(), enc() (+3 more)

### Community 81 - "theme"
Cohesion: 0.05
Nodes (31): theme(), bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA (+23 more)

### Community 83 - "atlas-layout.js"
Cohesion: 0.15
Nodes (15): ACCENTS, actions(), BEFORE, CHOSEN, closeSheet(), doneStates(), load(), openSheet() (+7 more)

### Community 84 - "public/disc-stamp-color.mjs"
Cohesion: 0.28
Nodes (14): plastic(), box(), distanceTo(), encode(), extractStampColor(), finv(), gaussian(), kmeans() (+6 more)

### Community 85 - "buildClusters"
Cohesion: 0.18
Nodes (21): buildClusters(), cancelRegroup(), dotArtRadius(), drawCompareHighlights(), ensureGroupWorker(), flightLevel(), hydrateGaps(), hydrateGroups() (+13 more)

### Community 86 - "tests/auth.mjs"
Cohesion: 0.22
Nodes (8): {chromium}, contrast(), errors, full(), linear(), luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.08
Nodes (18): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+10 more)

### Community 88 - "public.mjs"
Cohesion: 0.13
Nodes (14): fixture(), item, setup(), item, setup(), createCoach(), cleanupDiscRequestThrottle(), createDiscRequests() (+6 more)

### Community 89 - "hyzer-coach-browser.mjs"
Cohesion: 0.07
Nodes (21): bagItems, checks, {chromium}, discs, engineRequests, errors, json(), page() (+13 more)

### Community 91 - "clear-plastic-partb-evidence.mjs"
Cohesion: 0.33
Nodes (3): log(), photo, results

### Community 92 - "apple-design-2-browser.mjs"
Cohesion: 0.13
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 93 - "disc-stamp-worker.mjs"
Cohesion: 0.14
Nodes (15): inkBounds(), shoulder, lin(), printSupport(), SEPARATE, extract(), register(), a (+7 more)

### Community 94 - "display-palette.js"
Cohesion: 0.42
Nodes (8): accentTokens(), classColor(), commit(), css(), get(), normalize(), paint(), toneOf()

### Community 95 - "draw"
Cohesion: 0.18
Nodes (18): artFrame(), boundedCamera(), draw(), drawSatelliteLeaders(), featuredDisc(), focusFeatured(), immersiveMap(), introCreep() (+10 more)

### Community 96 - "atlas-motion.js"
Cohesion: 0.19
Nodes (8): fadeOut(), photoMarkup(), renderMarkers(), selectedGroup(), dismiss(), reveal(), selected(), slide()

### Community 97 - "coach.js"
Cohesion: 0.28
Nodes (14): allowance(), api(), append(), appendDraft(), hyzerLabels(), mood(), open(), render() (+6 more)

### Community 98 - "tests/disc-stamp-extract.mjs"
Cohesion: 0.53
Nodes (5): at(), disc(), extract(), mean(), sharp

### Community 99 - "install-pnpm.sh"
Cohesion: 0.39
Nodes (7): acquire_shared_lock(), can_write_directory(), release_shared_lock(), report_store(), install-pnpm.sh script, XDG_CACHE_HOME, XDG_DATA_HOME

### Community 101 - "stamp_fraction_audit_test.py"
Cohesion: 0.11
Nodes (3): Validator, blob(), FractionAuditTests

### Community 102 - "bag-collections-browser.mjs"
Cohesion: 0.09
Nodes (14): {chromium}, COLORS, command(), errors, MOLDS, PLASTICS, report, server (+6 more)

### Community 103 - "halo-band-sampling.mjs"
Cohesion: 0.24
Nodes (12): bestShift(), box(), CHROMA, encode(), field(), INK, labToRgb(), RIM (+4 more)

### Community 104 - "account.js"
Cohesion: 0.52
Nodes (5): api(), refresh(), renderPage(), signOut(), sync()

### Community 105 - "ref_node_fs"
Cohesion: 0.28
Nodes (10): adapt(), adaptStrength(), bandSlope(), bounds(), fit(), inBand(), positions(), scatter() (+2 more)

### Community 106 - "appearance.js"
Cohesion: 0.60
Nodes (3): build(), paint(), preview()

### Community 107 - "photo-adder-rework-browser.mjs"
Cohesion: 0.50
Nodes (4): log(), results, sharp, shoot()

### Community 108 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 109 - "atlas-targets.js"
Cohesion: 0.53
Nodes (4): inBox(), pick(), reach(), reads()

### Community 110 - "ref_node_module"
Cohesion: 0.03
Nodes (49): {chromium}, {chromium}, server, {chromium}, command(), errors, server, baseline (+41 more)

### Community 111 - "bag-tweaks-browser.mjs"
Cohesion: 0.15
Nodes (10): checks, {chromium}, command(), errors, GOTO, MAIN, metrics, PUTTERS (+2 more)

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 113 - "ref_node_test"
Cohesion: 0.07
Nodes (64): bagDiscGeometry(), discParts(), isOvermold(), photoGeometry(), CLAY_TONES, esc(), LABELS, n() (+56 more)

### Community 115 - "0000_powerful_pepper_potts.sql"
Cohesion: 0.50
Nodes (3): `bag_items`, `coach_usage`, `profiles`

### Community 116 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 120 - "bag-demo.mjs"
Cohesion: 0.22
Nodes (12): DYE, SEAM, dE(), disc(), enc(), isDye(), L(), lab() (+4 more)

### Community 121 - "display-customization-browser.mjs"
Cohesion: 0.05
Nodes (32): mold(), rated(), assignments, baseline, batch, {chromium}, controls, molds (+24 more)

### Community 140 - "disc-request.js"
Cohesion: 0.36
Nodes (5): clearErrors(), fieldsFor(), fillBrands(), open(), showErrors()

### Community 141 - "stability.mjs"
Cohesion: 0.18
Nodes (11): extract(), half(), support, separate(), TUNING, node, out, postPass() (+3 more)

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 143 - "shopping.js"
Cohesion: 0.70
Nodes (4): offers(), render(), row(), tracking()

### Community 146 - "lens-corner-browser.mjs"
Cohesion: 0.33
Nodes (4): bagItems, coachUsage, profiles, drizzle-orm

### Community 147 - "disc-photo-qa.mjs"
Cohesion: 0.19
Nodes (17): exposure(), GATE, glare(), luma(), luma1024(), photoGate(), RETAKE, sharpness() (+9 more)

### Community 148 - "photo-level-measure.mjs"
Cohesion: 0.43
Nodes (4): angleOf(), luma(), renderedStampAngle(), stampAngle()

### Community 149 - "display-customization-evidence.mjs"
Cohesion: 0.14
Nodes (17): frontAt(), HALO_FEATHER, HALO_FORMAT, HALO_PLASTICS, HALO_RING, HALO_STREAKS, NAMES, dE() (+9 more)

### Community 152 - "atlas-layout.mjs"
Cohesion: 0.19
Nodes (9): catalogBase, context, filters(), fixtures, random(), rated, score(), sizes (+1 more)

### Community 153 - "rack-motion.mjs"
Cohesion: 0.23
Nodes (11): clamp(), DEFAULT_RACK_COLOR, discPose(), easeInOut(), mix(), RESTAGE_MS, SLIDE_MS, stage() (+3 more)

### Community 154 - "workers/bag.mjs"
Cohesion: 0.17
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 155 - "display-harness.mjs"
Cohesion: 0.08
Nodes (13): scene, photo, photoSource, directoryLink, form, mapLink, rows(), sheet (+5 more)

### Community 156 - "photo-stamp-assets-evidence.mjs"
Cohesion: 0.20
Nodes (4): delete(), database(), setup(), valid

### Community 157 - "more-packs-evidence.mjs"
Cohesion: 0.31
Nodes (5): openSheet(), packs(), region(), setTheme(), wait()

### Community 159 - "0017_disc_requests.sql"
Cohesion: 0.60
Nodes (4): disc_request_throttle, disc_request_throttle_hour, disc_requests, disc_requests_status

### Community 160 - "prompt-4-leftovers-browser.mjs"
Cohesion: 0.18
Nodes (5): pause(), pw, report, selectDisc(), server

### Community 161 - "tests/disc-stamp-delight.mjs"
Cohesion: 0.27
Nodes (7): disc(), enc(), flash(), labAt(), lin(), sharp, SPOT

### Community 164 - "clear-plastic-partb-evidence.mjs"
Cohesion: 0.22
Nodes (7): {chromium}, command(), errors, server, shots, themes, widths

### Community 165 - "disc-appearance-browser.mjs"
Cohesion: 0.25
Nodes (7): by(), catalog, {chromium}, examples, items, server, settings

### Community 166 - "palette.mjs"
Cohesion: 0.31
Nodes (8): C, fixture(), form(), P, png(), put(), sharp, webp()

### Community 167 - "photo-stamp-sync-browser.mjs"
Cohesion: 0.18
Nodes (9): checks, {chromium}, desktop, errors, metrics, phone, server, shots (+1 more)

### Community 168 - "collection-scenes.js"
Cohesion: 0.08
Nodes (30): RACK_STYLES, epitaph(), EPITAPHS, hash(), lifespan(), MAX_LEAN, MAX_TURN, PLOT_DEPTH (+22 more)

### Community 169 - "photo-adder-rework-browser.mjs"
Cohesion: 0.36
Nodes (6): HOLD_LIMIT, LOD_MARGIN, lodFor(), LODS, ORDER, walk()

### Community 172 - "workers/coach.mjs"
Cohesion: 0.24
Nodes (10): database(), setup(), askCoach(), coachContext(), groundedReply(), headers, instructions(), json() (+2 more)

### Community 173 - "ref_node_fs"
Cohesion: 0.03
Nodes (45): readExecutionProfile(), NpmCacheProgress, runNpmInstall(), cli, [command, ...args], projectRoot, bag, delay (+37 more)

### Community 174 - "personal-lens.mjs"
Cohesion: 0.11
Nodes (10): {chromium}, command(), errors, file(), report, server, make(), ready() (+2 more)

### Community 175 - "atlas-3d-perf.mjs"
Cohesion: 0.31
Nodes (8): bagShots(), cases, CHOSEN, finishOnly, frame(), results, viewerShots(), wait()

### Community 177 - "photo-stamp-level-browser.mjs"
Cohesion: 0.38
Nodes (6): at(), extract(), LETTERS, peak(), sharp, SMALL

### Community 178 - "photo-retake-advisory-browser.mjs"
Cohesion: 0.31
Nodes (7): cases, frame(), framing, record(), results, shots(), wait()

### Community 179 - "stamp-extraction-fidelity.mjs"
Cohesion: 0.43
Nodes (7): decide(), deviceReps(), DEVICES, FLIGHT(), main(), median(), parseReps()

### Community 182 - "HttpCache"
Cohesion: 0.47
Nodes (5): brow(), c, hyzer, onPlate(), sunk()

### Community 184 - "photo-stamp-assets-evidence.mjs"
Cohesion: 0.36
Nodes (7): bagShots(), cases, CHOSEN, frame(), results, viewerShots(), wait()

### Community 186 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

## Knowledge Gaps
- **52 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1521 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `inCollection()` connect `app.js` to `bag-tweaks-browser.mjs`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `createDiscViewer()` (e.g. with `applyPose()` and `attach()`) actually correct?**
  _`createDiscViewer()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05636114911080711 - nodes in this community are weakly interconnected._
- **Why does `jose` connect `halo-band-v2.mjs` to `package.json`, `workers/auth.mjs`, `photo-stamp-assets-evidence.mjs`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10261569416498995 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._