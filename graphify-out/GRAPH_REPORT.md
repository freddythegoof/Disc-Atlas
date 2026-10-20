# Graph Report - interesting-bun-3677b7  (2026-10-19)

## Corpus Check
- 369 files · ~5,062,408 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 130 file(s) not represented in the graph (top: .log 67, .gz 18, .css 15)

## Summary
- 2464 nodes · 5011 edges · 147 communities (118 shown, 29 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 193 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `edd49bc0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- workers/auth.mjs
- Bag scene
- bag.js
- ref_node_module
- scripts
- Photo editing and albedo
- sampling-audit-draw.mjs
- package.json
- disc3d-popout-browser.mjs
- ref_node_path
- manufacturer-diff.py
- non-overmold-photo-edge-atlas-browser.mjs
- stage.mjs
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
- bag-demo-browser.mjs
- Account and bag SQL schema
- mountGraveyard
- racks.mjs
- initAtlasMap
- photo-harness.mjs
- ref_node_assert
- bag-3d-layout.mjs
- mountRacks
- createAtlasArt
- devDependencies
- collection-scenes.js
- discraft-stamps-batch2-browser.mjs
- photo-editor-races.mjs
- compilerOptions
- atlas-groups.js
- gallery-fixes-browser.mjs
- personal-lens.mjs
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
- render
- pathlib
- atlas-speed-band.mjs
- atlas-speed-band-browser.mjs
- bag-animation-perf.mjs
- dropdown-indicator-browser.mjs
- slider-drag-browser.mjs
- extract-discraft-batch2.py
- buildClusters
- atlas-groups.mjs
- theme
- foundDisc
- bag-v13-browser.mjs
- my-map-browser.mjs
- pulled-sizing.mjs
- disc3d/viewer.mjs
- discraft-stamps-batch1-browser.mjs
- atlas-organic.mjs
- ref_node_child_process
- palette.mjs
- discraft-fraction-audit-browser.mjs
- draw
- profile.mjs
- StampManifestTests
- apple-design-3-browser.mjs
- NameTag
- disc-appearance-browser.mjs
- grouping-zoom.mjs
- .zoom
- atlas-motion.js
- coach.js
- bag-collections-browser.mjs
- install-pnpm.sh
- discraft_batch2_test.py
- stamp_fraction_audit_test.py
- bag-pulled-sizing.mjs
- schema.ts
- account.js
- directory-layout-browser.mjs
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
- sync
- cloudflare-env.d.ts
- overrides
- drizzle-kit
- engines
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- discraft-stamps-browser.mjs
- scheduleMapDraw
- compose-discraft-fraction-proofs.py
- stamp-scale-browser.mjs
- atlas-3d-perf.mjs
- atlas-lod.mjs
- bag-v12-browser.mjs

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

## Communities (147 total, 29 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (80): activeLens(), addDestinationControl(), applyTheme(), atlasPriority(), bagColors(), brandColor(), brandList(), brandPalette (+72 more)

### Community 1 - "workers/auth.mjs"
Cohesion: 0.05
Nodes (50): jose, delete(), fixture(), item, setup(), database(), setup(), googleFetch (+42 more)

### Community 2 - "Bag scene"
Cohesion: 0.11
Nodes (7): accent(), BAG_SPRING, BagScene, div(), loadViewer(), POCKET, reduced()

### Community 3 - "bag.js"
Cohesion: 0.10
Nodes (49): dynamic, GET(), GET(), DELETE(), photoBytes(), POST(), PUT(), save() (+41 more)

### Community 4 - "ref_node_module"
Cohesion: 0.09
Nodes (12): {chromium}, errors, metrics, server, themes, widths, {chromium}, errors (+4 more)

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

### Community 10 - "ref_node_path"
Cohesion: 0.05
Nodes (27): output, server, readExecutionProfile(), projectRoot, checks, {chromium}, errors, server (+19 more)

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.07
Nodes (33): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+25 more)

### Community 12 - "non-overmold-photo-edge-atlas-browser.mjs"
Cohesion: 0.15
Nodes (12): {chromium}, metrics, server, {chromium}, metrics, server, addDisc(), caseList() (+4 more)

### Community 13 - "stage.mjs"
Cohesion: 0.21
Nodes (18): mountBag(), DISC_BUDGET, discColors(), discMaterial(), discModel(), parts, getAtlasArt(), photoSurface() (+10 more)

### Community 14 - "my-bag.js"
Cohesion: 0.07
Nodes (30): addMenu, addMenuOpen(), bagColorMap, bagPhotoMap, bagRimColorMap, catalogs, closeAddMenu(), colorHint() (+22 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.08
Nodes (32): atlasPositions, CAMERA_AXES, cameraSpring, clusterPicks, comparisonMarkup(), comparisonPalette(), discArt(), dropMarkerArt() (+24 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.17
Nodes (32): angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), attach(), build(), cancelRim(), dispose() (+24 more)

### Community 18 - "SceneView"
Cohesion: 0.20
Nodes (5): clamp(), coarse(), SceneView, softwareRenderer(), stage()

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.11
Nodes (21): GLB_ACCENT_POSE, advanceTime(), poseAt(), clamp01(), easeInOut(), easeOut(), FABRIC, MAX_ZOOM (+13 more)

### Community 20 - "bag-layout.mjs"
Cohesion: 0.13
Nodes (24): BAG_BOX, bagLayout(), brickRows(), byKey(), clamp(), DISC, fan(), footprint() (+16 more)

### Community 22 - "shape.mjs"
Cohesion: 0.12
Nodes (29): acquirePhoto(), cache, photoGeometry(), reliefTexture(), clamp(), cubic(), DEFAULTS, discProfile() (+21 more)

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.32
Nodes (6): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), rackOrder()

### Community 24 - "bag-values.js"
Cohesion: 0.15
Nodes (22): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagClass(), bagPalette(), bagSlots(), DEFAULT_BAG_COLOR (+14 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "LostScene"
Cohesion: 0.15
Nodes (6): rackCount(), CollectionScene, esc(), LostScene, plural(), StorageScene

### Community 27 - "bag-demo-browser.mjs"
Cohesion: 0.20
Nodes (6): bagCalls, checks, {chromium}, errors, server, shots

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.11
Nodes (19): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+11 more)

### Community 29 - "mountGraveyard"
Cohesion: 0.20
Nodes (17): engraving(), mountGraveyard(), dress(), hover(), idAt(), layout(), makePlot(), placeRing() (+9 more)

### Community 30 - "racks.mjs"
Cohesion: 0.10
Nodes (21): BAYS_PER_TIER, CLASS_ORDER, pulledSpot(), RACK_DEPTH, RACK_HEIGHT, SHELF_CLEARANCE, SLOT_REST_HEIGHT, SLOTS_PER_BAY (+13 more)

### Community 31 - "initAtlasMap"
Cohesion: 0.18
Nodes (20): animateZoom(), boundedCamera(), cameraMoving(), changeZoom(), clearClusterTimers(), closeCluster(), initAtlasMap(), openCluster() (+12 more)

### Community 32 - "photo-harness.mjs"
Cohesion: 0.14
Nodes (12): output, data, results, results, baseline, characterize, ref, results (+4 more)

### Community 33 - "ref_node_assert"
Cohesion: 0.07
Nodes (14): context, T, checkContextHeader(), checkHeaderMenu(), checkThemePicker(), baseline, {chromium}, labelBaseline (+6 more)

### Community 34 - "bag-3d-layout.mjs"
Cohesion: 0.11
Nodes (17): depthOrder(), FRONT, SIDE_BAG, TOP, boxesOverlap(), CLEAR, DESKTOP, disc() (+9 more)

### Community 35 - "mountRacks"
Cohesion: 0.22
Nodes (21): rackSlot(), rackX(), restHeight(), rowWidth(), mountRacks(), batchFor(), box(), drop() (+13 more)

### Community 36 - "createAtlasArt"
Cohesion: 0.40
Nodes (10): createAtlasArt(), dispose(), geometryOf(), get(), has(), render(), shapeOf(), touch() (+2 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "collection-scenes.js"
Cohesion: 0.15
Nodes (21): ABOVE_GROUND, epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN, MAX_TURN (+13 more)

### Community 39 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.12
Nodes (13): assignments, baseline, batch, {chromium}, controls, drops, molds, newMolds (+5 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.10
Nodes (5): apiSource, bagSource, closeSource, saveSource, stampStubs

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.20
Nodes (18): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+10 more)

### Community 43 - "gallery-fixes-browser.mjs"
Cohesion: 0.13
Nodes (8): NpmCacheProgress, runNpmInstall(), read(), {chromium}, errors, file(), report, server

### Community 44 - "personal-lens.mjs"
Cohesion: 0.39
Nodes (6): syncMyMap(), COPY_BIAS_SHIFT, moldShifts(), personalPositions(), context, molds

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
Cohesion: 0.21
Nodes (10): CACHE_SEEDS, holdInstallLocks(), InstallProgress, main(), openLock(), openReport(), OPERATIONAL_FAILURE_CODES, showLine() (+2 more)

### Community 49 - "api.cjs"
Cohesion: 0.12
Nodes (11): assert, {createRequire}, fs, {Miniflare}, req, root, assert, ctx (+3 more)

### Community 50 - "atlas-persist-browser.mjs"
Cohesion: 0.15
Nodes (12): checks, {chromium}, clickLands(), errors, mapOwned(), onMap(), READABLE(), reset() (+4 more)

### Community 51 - "atlas-organic-browser.mjs"
Cohesion: 0.15
Nodes (13): checks, {chromium}, errors, layout(), near(), SCENARIOS, server, settled() (+5 more)

### Community 52 - "Catalog generation and stamp validation"
Cohesion: 0.25
Nodes (4): brandnorm(), norm(), validate_stamp_fields(), validate_stamp_manifest()

### Community 53 - "about-hero.js"
Cohesion: 0.12
Nodes (22): active(), canvas, desktop, eligible(), fallback(), frame(), hero, motion (+14 more)

### Community 54 - ".zoom"
Cohesion: 0.18
Nodes (8): checks, {chromium}, errors, SCENE(), server, settled(), show(), VIEWPORTS

### Community 55 - "apple-design-2-browser.mjs"
Cohesion: 0.13
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 56 - "overmold.mjs"
Cohesion: 0.18
Nodes (18): bagDiscGeometry(), discParts(), DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, isOvermold(), KEYS, LIST, OVERMOLD_DISCS (+10 more)

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

### Community 67 - "render"
Cohesion: 0.19
Nodes (20): bagComparator(), pocketLabel(), stabilityBiasLabel(), bagRimColor(), photoURL(), bagDetailMarkup(), bagged(), detailAppearance() (+12 more)

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

### Community 77 - "theme"
Cohesion: 0.06
Nodes (20): theme(), checks, {chromium}, errors, server, shots, {chromium}, pages (+12 more)

### Community 78 - "foundDisc"
Cohesion: 0.19
Nodes (20): rackStyle(), api(), chooseRackStyle(), endDrag(), focusFirst(), foundDisc(), loadBag(), lostScene (+12 more)

### Community 79 - "bag-v13-browser.mjs"
Cohesion: 0.18
Nodes (7): checks, {chromium}, errors, server, shots, themes, widths

### Community 80 - "my-map-browser.mjs"
Cohesion: 0.18
Nodes (7): BAG, checks, {chromium}, errors, metrics, server, shots

### Community 81 - "pulled-sizing.mjs"
Cohesion: 0.20
Nodes (14): assignSides(), stabilityOf(), clamp(), desktopPulledLayout(), packing(), PHONE_PULLED_COUNT, PHONE_PULLED_MAX, phonePulledFit() (+6 more)

### Community 82 - "disc3d/viewer.mjs"
Cohesion: 0.21
Nodes (11): discGeometry(), groupRim(), lathePoints(), PLASTICS, detailPixelRatio(), clayMatcap(), ease(), FRAME_DIAMETER (+3 more)

### Community 83 - "discraft-stamps-batch1-browser.mjs"
Cohesion: 0.15
Nodes (10): assignments, baseline, batch, {chromium}, controls, molds, newMolds, requests (+2 more)

### Community 84 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

### Community 85 - "ref_node_child_process"
Cohesion: 0.04
Nodes (27): cli, [command, ...args], {chromium}, server, {chromium}, errors, server, {chromium} (+19 more)

### Community 86 - "palette.mjs"
Cohesion: 0.22
Nodes (6): {chromium}, contrast(), errors, luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.12
Nodes (11): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+3 more)

### Community 88 - "draw"
Cohesion: 0.19
Nodes (13): artFrame(), draw(), drawPlanetLabels(), drawSatelliteLeaders(), fadeOut(), focusFeatured(), measureMap(), renderMarkers() (+5 more)

### Community 89 - "profile.mjs"
Cohesion: 0.20
Nodes (11): CLAY_TONES, esc(), LABELS, n(), PROFILE_FRAME, profileDimensions(), profileSVG(), SPEC (+3 more)

### Community 91 - "apple-design-3-browser.mjs"
Cohesion: 0.17
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 93 - "disc-appearance-browser.mjs"
Cohesion: 0.07
Nodes (15): {chromium}, server, {chromium}, server, by(), catalog, {chromium}, examples (+7 more)

### Community 94 - "grouping-zoom.mjs"
Cohesion: 0.58
Nodes (6): checkGroupingZoom(), checkLowZoomLabels(), checkZoomCandidates(), frameBand(), measureBand(), settleMap()

### Community 95 - ".zoom"
Cohesion: 0.19
Nodes (11): drawCompareHighlights(), keepPinned(), mapMarkerScale(), markerLabel(), markerTarget(), checkAtlasInteractions(), checkDeepZoom(), checkFilterRegroup() (+3 more)

### Community 96 - "atlas-motion.js"
Cohesion: 0.32
Nodes (3): dismiss(), reveal(), slide()

### Community 97 - "coach.js"
Cohesion: 0.50
Nodes (7): allowance(), api(), append(), appendDraft(), open(), render(), reset()

### Community 98 - "bag-collections-browser.mjs"
Cohesion: 0.18
Nodes (8): {chromium}, COLORS, errors, MOLDS, PLASTICS, report, server, shots

### Community 99 - "install-pnpm.sh"
Cohesion: 0.39
Nodes (7): acquire_shared_lock(), can_write_directory(), release_shared_lock(), report_store(), install-pnpm.sh script, XDG_CACHE_HOME, XDG_DATA_HOME

### Community 102 - "bag-pulled-sizing.mjs"
Cohesion: 0.25
Nodes (5): bag, blocks, entries, phone, viewport

### Community 103 - "schema.ts"
Cohesion: 0.33
Nodes (4): bagItems, coachUsage, profiles, drizzle-orm

### Community 104 - "account.js"
Cohesion: 0.52
Nodes (5): api(), refresh(), renderPage(), signOut(), sync()

### Community 105 - "directory-layout-browser.mjs"
Cohesion: 0.18
Nodes (9): checks, {chromium}, desktop, errors, metrics, phone, server, shots (+1 more)

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
Cohesion: 0.60
Nodes (5): attachDiscFeatures(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot()

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

### Community 117 - "sync"
Cohesion: 0.24
Nodes (9): activateBag(), closeBagTips(), directory(), leaveBag(), positionBagTips(), setBagView(), showDemo(), sync() (+1 more)

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 140 - "discraft-stamps-browser.mjs"
Cohesion: 0.18
Nodes (9): mold(), rated(), base, baseline, changed, {chromium}, requests, results (+1 more)

### Community 141 - "scheduleMapDraw"
Cohesion: 0.24
Nodes (10): artZooming(), drawGaps(), gapName(), gapSprite(), gapTarget(), keepPinnedGaps(), levelHeld(), mapTargets() (+2 more)

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 143 - "stamp-scale-browser.mjs"
Cohesion: 0.20
Nodes (7): baseline, {chromium}, diagnose, files, measurements, results, server

### Community 144 - "atlas-3d-perf.mjs"
Cohesion: 0.43
Nodes (7): decide(), deviceReps(), DEVICES, FLIGHT(), main(), median(), parseReps()

### Community 145 - "atlas-lod.mjs"
Cohesion: 0.36
Nodes (6): HOLD_LIMIT, LOD_MARGIN, lodFor(), LODS, ORDER, walk()

### Community 146 - "bag-v12-browser.mjs"
Cohesion: 0.22
Nodes (6): {chromium}, errors, server, shots, themes, widths

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
  _Cohesion score 0.10842844600526778 - nodes in this community are weakly interconnected._