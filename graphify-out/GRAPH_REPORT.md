# Graph Report - disc-atlas  (2026-10-17)

## Corpus Check
- 330 files · ~4,865,303 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 67 file(s) not represented in the graph (top: .log 31, .css 15, .ttf 8)

## Summary
- 2463 nodes · 5008 edges · 142 communities (113 shown, 29 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 192 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e59e67e1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- workers/auth.mjs
- Bag scene
- bag.js
- bag-scene-browser.mjs
- scripts
- Photo editing and albedo
- sampling-audit-draw.mjs
- package.json
- disc3d-popout-browser.mjs
- ref_node_http
- manufacturer-diff.py
- non-overmold-photo-edge-atlas-browser.mjs
- disc3d/viewer.mjs
- my-bag.js
- atlas-map.js
- Shared 3D disc viewer
- AuditTests
- SceneView
- bag3d/viewer.mjs
- bag-layout.mjs
- StampManifestTests
- shape.mjs
- all-discs-gallery.js
- bag-values.js
- dependencies
- LostScene
- ref_node_assert
- Account and bag SQL schema
- mountGraveyard
- racks.mjs
- initAtlasMap
- ref_node_fs
- .zoom
- bag-3d-layout.mjs
- mountRacks
- atlas-art.mjs
- devDependencies
- collection-scenes.js
- discraft-stamps-batch2-browser.mjs
- photo-editor-races.mjs
- compilerOptions
- atlas-groups.js
- ref_node_path
- bagDetailMarkup
- bag-interactions-browser.mjs
- components.json
- Detail and pop-out viewer bridge
- pnpm-install.mjs
- api.cjs
- atlas-persist-browser.mjs
- atlas-organic-browser.mjs
- Catalog generation and stamp validation
- about-hero.js
- .zoom
- apple-design-2-browser.mjs
- overmold.mjs
- sites-env.sh
- atlas-depth.mjs
- bag-popup-browser.mjs
- bag-staging-browser.mjs
- vite.config.ts
- bag-pockets-browser.mjs
- rack-motion.mjs
- atlas-layout.mjs
- bag-3d-browser.mjs
- bag-tweaks-browser.mjs
- lens-corner-browser.mjs
- pathlib
- atlas-speed-band.mjs
- atlas-speed-band-browser.mjs
- bag-animation-perf.mjs
- dropdown-indicator-browser.mjs
- slider-drag-browser.mjs
- extract-discraft-batch2.py
- buildClusters
- atlas-groups.mjs
- ref_node_module
- render
- bag-v13-browser.mjs
- my-map-browser.mjs
- pulled-sizing.mjs
- ref_node_test
- ref_node_vm
- atlas-organic.mjs
- ref_node_child_process
- palette.mjs
- discraft-fraction-audit-browser.mjs
- draw
- profile.mjs
- StampManifestTests
- apple-design-3-browser.mjs
- renderMarkers
- disc-appearance-browser.mjs
- grouping-zoom.mjs
- drawCompareHighlights
- atlas-motion.js
- coach.js
- context-header.mjs
- install-pnpm.sh
- discraft_batch2_test.py
- stamp_fraction_audit_test.py
- bag-pulled-sizing.mjs
- schema.ts
- account.js
- coach-browser.mjs
- personal-map-worker.mjs
- next
- atlas-targets.js
- disc-state.mjs
- shopping.js
- install-ci.sh
- bag-spin-pocket-browser.mjs
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- leaveBag
- cloudflare-env.d.ts
- overrides
- drizzle-kit
- engines
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- compose-discraft-fraction-proofs.py
- atlas-3d-perf.mjs
- bag-memorial-browser.mjs

## God Nodes (most connected - your core abstractions)
1. `BagScene` - 63 edges
2. `scripts` - 55 edges
3. `createDiscViewer()` - 44 edges
4. `mountRacks()` - 36 edges
5. `render()` - 32 edges
6. `mountBag()` - 31 edges
7. `SceneView` - 29 edges
8. `AuditTests` - 29 edges
9. `theme()` - 28 edges
10. `disc()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `layout()` --indirect_call--> `columns()`  [INFERRED]
  public/collection3d/graveyard.mjs → tests/bag-3d-layout.mjs
- `fitDistance()` --indirect_call--> `probe()`  [INFERRED]
  public/disc3d/viewer.mjs → tests/slider-drag-browser.mjs
- `update()` --indirect_call--> `photo()`  [INFERRED]
  public/disc3d/viewer.mjs → tests/photo-albedo.mjs
- `createBag()` --calls--> `validateDiscDetails()`  [EXTRACTED]
  workers/bag.mjs → public/bag-values.js
- `createBag()` --calls--> `validateBagSettings()`  [EXTRACTED]
  workers/bag.mjs → public/bag-values.js

## Import Cycles
- None detected.

## Communities (142 total, 29 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (80): activeLens(), addDestinationControl(), applyTheme(), atlasPriority(), bagColors(), brandColor(), brandList(), brandPalette (+72 more)

### Community 1 - "workers/auth.mjs"
Cohesion: 0.05
Nodes (50): jose, delete(), fixture(), item, setup(), database(), setup(), googleFetch (+42 more)

### Community 2 - "Bag scene"
Cohesion: 0.10
Nodes (9): accent(), BAG_SPRING, BagScene, div(), loadViewer(), POCKET, reduced(), pocketLabel() (+1 more)

### Community 3 - "bag.js"
Cohesion: 0.10
Nodes (49): dynamic, GET(), GET(), DELETE(), photoBytes(), POST(), PUT(), save() (+41 more)

### Community 4 - "bag-scene-browser.mjs"
Cohesion: 0.22
Nodes (6): {chromium}, errors, metrics, server, themes, widths

### Community 5 - "scripts"
Cohesion: 0.04
Nodes (55): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+47 more)

### Community 6 - "Photo editing and albedo"
Cohesion: 0.08
Nodes (39): basis(), delightPixels(), encode(), evaluate(), fitQuadratic(), luma(), median(), plateColor() (+31 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.05
Nodes (37): a, args, base(), brandCount, byId, cellPool(), cells, excludedIds (+29 more)

### Community 8 - "package.json"
Cohesion: 0.05
Nodes (41): name, packageManager, private, type, version, @base-ui/react, class-variance-authority, @cloudflare/vite-plugin (+33 more)

### Community 9 - "disc3d-popout-browser.mjs"
Cohesion: 0.07
Nodes (19): byName(), {chromium}, errors, server, settle(), show(), types, view() (+11 more)

### Community 10 - "ref_node_http"
Cohesion: 0.06
Nodes (25): output, server, {chromium}, errors, originals, requests, result, server (+17 more)

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.07
Nodes (33): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+25 more)

### Community 12 - "non-overmold-photo-edge-atlas-browser.mjs"
Cohesion: 0.10
Nodes (15): {chromium}, server, {chromium}, metrics, server, {chromium}, metrics, server (+7 more)

### Community 13 - "disc3d/viewer.mjs"
Cohesion: 0.14
Nodes (25): DISC_BUDGET, discColors(), discMaterial(), discModel(), discParts(), parts, getAtlasArt(), PLASTICS (+17 more)

### Community 14 - "my-bag.js"
Cohesion: 0.06
Nodes (41): addMenu, addMenuOpen(), bagColorMap, bagPhotoMap, bagRimColorMap, catalogs, closeAddMenu(), colorHint() (+33 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.08
Nodes (33): artZooming(), atlasPositions, CAMERA_AXES, cameraSpring, clusterPicks, discArt(), drawGaps(), dropMarkerArt() (+25 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.16
Nodes (33): bagRimColor(), angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), attach(), build(), cancelRim() (+25 more)

### Community 18 - "SceneView"
Cohesion: 0.12
Nodes (6): clamp(), coarse(), NameTag, SceneView, softwareRenderer(), stage()

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.13
Nodes (17): STAGE, advanceTime(), poseAt(), clamp01(), easeInOut(), easeOut(), FABRIC, MAX_ZOOM (+9 more)

### Community 20 - "bag-layout.mjs"
Cohesion: 0.13
Nodes (24): bagLayout(), brickRows(), byKey(), clamp(), depthOrder(), DISC, fan(), footprint() (+16 more)

### Community 22 - "shape.mjs"
Cohesion: 0.12
Nodes (32): attachDiscFeatures(), bagDiscGeometry(), mountBag(), discGeometry(), groupRim(), lathePoints(), clamp(), cubic() (+24 more)

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.32
Nodes (6): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), rackOrder()

### Community 24 - "bag-values.js"
Cohesion: 0.16
Nodes (21): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagClass(), bagPalette(), bagSlots(), DEFAULT_BAG_COLOR (+13 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "LostScene"
Cohesion: 0.17
Nodes (6): rackCount(), CollectionScene, count(), esc(), LostScene, StorageScene

### Community 27 - "ref_node_assert"
Cohesion: 0.06
Nodes (14): bagCalls, checks, {chromium}, errors, server, shots, read(), {chromium} (+6 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.11
Nodes (19): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+11 more)

### Community 29 - "mountGraveyard"
Cohesion: 0.15
Nodes (22): ABOVE_GROUND, engraving(), graveColumns(), mountGraveyard(), dress(), hover(), idAt(), layout() (+14 more)

### Community 30 - "racks.mjs"
Cohesion: 0.09
Nodes (24): rackStyle(), BAYS_PER_TIER, CLASS_ORDER, pulledSpot(), RACK_DEPTH, RACK_GAP, RACK_HEIGHT, RACK_WIDTH (+16 more)

### Community 31 - "initAtlasMap"
Cohesion: 0.17
Nodes (23): animateZoom(), boundedCamera(), cameraMoving(), changeZoom(), clearClusterTimers(), closeCluster(), initAtlasMap(), loadAtlasArt() (+15 more)

### Community 32 - "ref_node_fs"
Cohesion: 0.12
Nodes (14): output, data, results, results, baseline, characterize, ref, results (+6 more)

### Community 33 - ".zoom"
Cohesion: 0.09
Nodes (15): level(), SCENE(), checkAtlasInteractions(), layout(), checkDeepZoom(), checkFilterRegroup(), checkLabelProminence(), baseline (+7 more)

### Community 34 - "bag-3d-layout.mjs"
Cohesion: 0.11
Nodes (17): BAG_BOX, FRONT, PUTTER, TOP, boxesOverlap(), CLEAR, DESKTOP, disc() (+9 more)

### Community 35 - "mountRacks"
Cohesion: 0.22
Nodes (20): rackSlot(), rackX(), restHeight(), rowWidth(), mountRacks(), batchFor(), box(), drop() (+12 more)

### Community 36 - "atlas-art.mjs"
Cohesion: 0.21
Nodes (16): createAtlasArt(), dispose(), geometryOf(), get(), has(), render(), shapeOf(), touch() (+8 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "collection-scenes.js"
Cohesion: 0.18
Nodes (16): RACK_STYLES, epitaph(), EPITAPHS, hash(), lifespan(), MAX_LEAN, MAX_TURN, PLOT_DEPTH (+8 more)

### Community 39 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.05
Nodes (32): mold(), rated(), assignments, baseline, batch, {chromium}, controls, molds (+24 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.10
Nodes (5): apiSource, bagSource, closeSource, saveSource, stampStubs

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.22
Nodes (17): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+9 more)

### Community 43 - "ref_node_path"
Cohesion: 0.12
Nodes (10): readExecutionProfile(), NpmCacheProgress, runNpmInstall(), cli, [command, ...args], projectRoot, checks, {chromium} (+2 more)

### Community 44 - "bagDetailMarkup"
Cohesion: 0.26
Nodes (10): photoURL(), bagDetailMarkup(), bagged(), detailAppearance(), syncMyMap(), COPY_BIAS_SHIFT, moldShifts(), personalPositions() (+2 more)

### Community 45 - "bag-interactions-browser.mjs"
Cohesion: 0.11
Nodes (11): checks, {chromium}, errors, GOTO, MAIN, metrics, PUTTERS, server (+3 more)

### Community 46 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, registries, rsc (+9 more)

### Community 47 - "Detail and pop-out viewer bridge"
Cohesion: 0.19
Nodes (12): clay(), closePopout(), load(), lockScroll(), openPopout(), popoutDialog(), requestClose(), resolveColor() (+4 more)

### Community 48 - "pnpm-install.mjs"
Cohesion: 0.19
Nodes (10): CACHE_SEEDS, holdInstallLocks(), InstallProgress, main(), openLock(), openReport(), OPERATIONAL_FAILURE_CODES, showLine() (+2 more)

### Community 49 - "api.cjs"
Cohesion: 0.12
Nodes (11): assert, {createRequire}, fs, {Miniflare}, req, root, assert, ctx (+3 more)

### Community 50 - "atlas-persist-browser.mjs"
Cohesion: 0.15
Nodes (12): checks, {chromium}, clickLands(), errors, mapOwned(), onMap(), READABLE(), reset() (+4 more)

### Community 51 - "atlas-organic-browser.mjs"
Cohesion: 0.16
Nodes (12): checks, {chromium}, errors, near(), SCENARIOS, server, settled(), show() (+4 more)

### Community 52 - "Catalog generation and stamp validation"
Cohesion: 0.25
Nodes (4): brandnorm(), norm(), validate_stamp_fields(), validate_stamp_manifest()

### Community 53 - "about-hero.js"
Cohesion: 0.12
Nodes (22): active(), canvas, desktop, eligible(), fallback(), frame(), hero, motion (+14 more)

### Community 54 - ".zoom"
Cohesion: 0.20
Nodes (7): checks, {chromium}, errors, server, settled(), show(), VIEWPORTS

### Community 55 - "apple-design-2-browser.mjs"
Cohesion: 0.13
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 56 - "overmold.mjs"
Cohesion: 0.20
Nodes (13): DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, isOvermold(), KEYS, LIST, OVERMOLD_DISCS, overmoldColors(), parseColor() (+5 more)

### Community 57 - "sites-env.sh"
Cohesion: 0.14
Nodes (13): HOME, MINIFLARE_REGISTRY_PATH, npm_config_audit, npm_config_cache, npm_config_fund, npm_config_update_notifier, sites-env.sh script, SITES_ENV_READY (+5 more)

### Community 58 - "atlas-depth.mjs"
Cohesion: 0.15
Nodes (9): boxes(), CHROME, discs, LEVELS, positions, prints, rooms(), runtime (+1 more)

### Community 59 - "bag-popup-browser.mjs"
Cohesion: 0.14
Nodes (9): bigDemo, checks, {chromium}, demoSource, errors, EXTRA, metrics, server (+1 more)

### Community 60 - "bag-staging-browser.mjs"
Cohesion: 0.14
Nodes (9): bigDemo, checks, {chromium}, demoSource, errors, EXTRA, metrics, server (+1 more)

### Community 61 - "vite.config.ts"
Cohesion: 0.25
Nodes (3): vinext, vite, localBindingConfig

### Community 62 - "bag-pockets-browser.mjs"
Cohesion: 0.22
Nodes (6): {chromium}, errors, server, shots, themes, widths

### Community 63 - "rack-motion.mjs"
Cohesion: 0.23
Nodes (11): clamp(), DEFAULT_RACK_COLOR, discPose(), easeInOut(), mix(), RESTAGE_MS, SLIDE_MS, stage() (+3 more)

### Community 64 - "atlas-layout.mjs"
Cohesion: 0.19
Nodes (9): catalogBase, context, filters(), fixtures, random(), rated, score(), sizes (+1 more)

### Community 65 - "bag-3d-browser.mjs"
Cohesion: 0.15
Nodes (8): checks, {chromium}, errors, perf, server, shots, themes, widths

### Community 66 - "bag-tweaks-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, errors, GOTO, MAIN, metrics, PUTTERS, server (+1 more)

### Community 67 - "lens-corner-browser.mjs"
Cohesion: 0.15
Nodes (8): checks, {chromium}, errors, server, shots, THEMES, WIDTHS, ZOOMS

### Community 68 - "pathlib"
Cohesion: 0.16
Nodes (6): extract(), slug(), extract(), main(), slug(), tile()

### Community 69 - "atlas-speed-band.mjs"
Cohesion: 0.18
Nodes (9): base, CHROME, off(), prints, rated, runtime, SIZES, STATES (+1 more)

### Community 70 - "atlas-speed-band-browser.mjs"
Cohesion: 0.18
Nodes (10): CAMERAS, {chromium}, errors, failures, RENDERED(), server, settled(), show() (+2 more)

### Community 71 - "bag-animation-perf.mjs"
Cohesion: 0.17
Nodes (8): baseline, {chromium}, photos, profile, server, verifyLayout, verifyTextures, verifyTransitions

### Community 72 - "dropdown-indicator-browser.mjs"
Cohesion: 0.17
Nodes (8): checks, {chromium}, controls, errors, server, shots, THEMES, WIDTHS

### Community 73 - "slider-drag-browser.mjs"
Cohesion: 0.24
Nodes (10): assertRangeDrag(), checkRangeDefaults(), dragRange(), {chromium}, errors, probe(), results, server (+2 more)

### Community 74 - "extract-discraft-batch2.py"
Cohesion: 0.23
Nodes (5): digest(), measure(), digest(), run(), slug()

### Community 75 - "buildClusters"
Cohesion: 0.31
Nodes (11): buildClusters(), cancelRegroup(), ensureGroupWorker(), hydrateGaps(), hydrateGroups(), measureChrome(), measureFullLabels(), organicAtlas() (+3 more)

### Community 76 - "atlas-groups.mjs"
Cohesion: 0.18
Nodes (8): area, build(), featured, footprints, items, label, worker, runtime

### Community 77 - "ref_node_module"
Cohesion: 0.05
Nodes (30): theme(), {chromium}, server, checks, {chromium}, errors, server, types (+22 more)

### Community 78 - "render"
Cohesion: 0.25
Nodes (23): bagComparator(), api(), chooseRackStyle(), focusFirst(), foundDisc(), loadBag(), lostItems(), memorialWall() (+15 more)

### Community 79 - "bag-v13-browser.mjs"
Cohesion: 0.18
Nodes (7): checks, {chromium}, errors, server, shots, themes, widths

### Community 80 - "my-map-browser.mjs"
Cohesion: 0.18
Nodes (7): BAG, checks, {chromium}, errors, metrics, server, shots

### Community 81 - "pulled-sizing.mjs"
Cohesion: 0.20
Nodes (14): assignSides(), stabilityOf(), clamp(), desktopPulledLayout(), packing(), PHONE_PULLED_COUNT, PHONE_PULLED_MAX, phonePulledFit() (+6 more)

### Community 82 - "ref_node_test"
Cohesion: 0.20
Nodes (3): ids, items, close()

### Community 84 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

### Community 85 - "ref_node_child_process"
Cohesion: 0.04
Nodes (27): {chromium}, errors, server, {chromium}, server, {chromium}, metrics, server (+19 more)

### Community 86 - "palette.mjs"
Cohesion: 0.22
Nodes (6): {chromium}, contrast(), errors, luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.08
Nodes (18): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+10 more)

### Community 88 - "draw"
Cohesion: 0.25
Nodes (9): artFrame(), draw(), drawPlanetLabels(), drawSatelliteLeaders(), focusFeatured(), measureMap(), setMapText(), shownPosition() (+1 more)

### Community 89 - "profile.mjs"
Cohesion: 0.14
Nodes (18): acquirePhoto(), cache, photoGeometry(), photoSurface(), reliefTexture(), CLAY_TONES, esc(), LABELS (+10 more)

### Community 91 - "apple-design-3-browser.mjs"
Cohesion: 0.17
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 92 - "renderMarkers"
Cohesion: 0.29
Nodes (8): comparisonMarkup(), comparisonPalette(), fadeOut(), photoMarkup(), renderCluster(), renderMarkers(), selectedGroup(), selected()

### Community 93 - "disc-appearance-browser.mjs"
Cohesion: 0.25
Nodes (7): by(), catalog, {chromium}, examples, items, server, settings

### Community 94 - "grouping-zoom.mjs"
Cohesion: 0.58
Nodes (6): checkGroupingZoom(), checkLowZoomLabels(), checkZoomCandidates(), frameBand(), measureBand(), settleMap()

### Community 95 - "drawCompareHighlights"
Cohesion: 0.33
Nodes (7): drawCompareHighlights(), keepPinned(), levelHeld(), mapMarkerScale(), mapTargets(), markerLabel(), markerTarget()

### Community 96 - "atlas-motion.js"
Cohesion: 0.32
Nodes (3): dismiss(), reveal(), slide()

### Community 97 - "coach.js"
Cohesion: 0.50
Nodes (7): allowance(), api(), append(), appendDraft(), open(), render(), reset()

### Community 98 - "context-header.mjs"
Cohesion: 0.83
Nodes (3): checkContextHeader(), checkHeaderMenu(), checkThemePicker()

### Community 99 - "install-pnpm.sh"
Cohesion: 0.39
Nodes (7): acquire_shared_lock(), can_write_directory(), release_shared_lock(), report_store(), install-pnpm.sh script, XDG_CACHE_HOME, XDG_DATA_HOME

### Community 102 - "bag-pulled-sizing.mjs"
Cohesion: 0.17
Nodes (9): DETAIL, detailSegments(), PHOTO_TIERS, photoTier(), bag, blocks, entries, phone (+1 more)

### Community 103 - "schema.ts"
Cohesion: 0.33
Nodes (4): bagItems, coachUsage, profiles, drizzle-orm

### Community 104 - "account.js"
Cohesion: 0.52
Nodes (5): api(), refresh(), renderPage(), signOut(), sync()

### Community 106 - "coach-browser.mjs"
Cohesion: 0.33
Nodes (5): baselines, {chromium}, command(), live, sql()

### Community 108 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 109 - "atlas-targets.js"
Cohesion: 0.53
Nodes (4): inBox(), pick(), reach(), reads()

### Community 110 - "disc-state.mjs"
Cohesion: 0.80
Nodes (4): createDiscState(), normalizeHex(), parseDiscParams(), validateSlot()

### Community 111 - "shopping.js"
Cohesion: 0.70
Nodes (4): offers(), render(), row(), tracking()

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 113 - "bag-spin-pocket-browser.mjs"
Cohesion: 0.18
Nodes (7): checks, {chromium}, errors, metrics, server, shots, THEMES

### Community 115 - "0000_powerful_pepper_potts.sql"
Cohesion: 0.50
Nodes (3): `bag_items`, `coach_usage`, `profiles`

### Community 116 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 117 - "leaveBag"
Cohesion: 0.29
Nodes (7): activateBag(), closeBagTips(), directory(), leaveBag(), positionBagTips(), setBagView(), undockDetail()

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 144 - "atlas-3d-perf.mjs"
Cohesion: 0.43
Nodes (7): decide(), deviceReps(), DEVICES, FLIGHT(), main(), median(), parseReps()

### Community 145 - "bag-memorial-browser.mjs"
Cohesion: 0.25
Nodes (5): {chromium}, errors, server, shots, themes

## Knowledge Gaps
- **53 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+48 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1148 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jose` connect `workers/auth.mjs` to `package.json`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _53 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05759623861298854 - nodes in this community are weakly interconnected._
- **Why does `inCollection()` connect `app.js` to `bag-tweaks-browser.mjs`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `workers/auth.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05189189189189189 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10434782608695652 - nodes in this community are weakly interconnected._