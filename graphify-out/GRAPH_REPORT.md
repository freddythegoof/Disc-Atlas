# Graph Report - atlas-intro-reveal  (2026-10-18)

## Corpus Check
- 361 files · ~5,239,715 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 86 file(s) not represented in the graph (top: .log 50, .css 15, .ttf 8)

## Summary
- 2627 nodes · 5482 edges · 146 communities (115 shown, 31 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 230 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `13a2c177`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- workers/auth.mjs
- Bag scene
- bag.js
- theme
- scripts
- disc-photo.mjs
- sampling-audit-draw.mjs
- package.json
- disc3d-popout-browser.mjs
- render
- manufacturer-diff.py
- initAtlasMap
- halo-plastic-browser.mjs
- my-bag.js
- atlas-map.js
- Shared 3D disc viewer
- AuditTests
- SceneView
- bag3d/viewer.mjs
- mountRacks
- StampManifestTests
- overmold.mjs
- all-discs-gallery.js
- bag-values.js
- dependencies
- LostScene
- stage.mjs
- Account and bag SQL schema
- collection-scenes.js
- discraft-stamps-batch2-browser.mjs
- lens-corner-browser.mjs
- collection-layout.mjs
- .zoom
- bag-layout.mjs
- disc-albedo.mjs
- createAtlasArt
- devDependencies
- racks.mjs
- halo-swirl.mjs
- photo-editor-races.mjs
- compilerOptions
- atlas-groups.js
- ref_node_test
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
- ref_node_child_process
- halo-band-v2.mjs
- sites-env.sh
- atlas-depth.mjs
- bag-popup-browser.mjs
- bag-staging-browser.mjs
- vite.config.ts
- ref_node_https
- rack-motion.mjs
- atlas-layout.mjs
- bag-3d-browser.mjs
- bag-tweaks-browser.mjs
- apple-design-3-browser.mjs
- pathlib
- atlas-speed-band.mjs
- atlas-speed-band-browser.mjs
- bag-animation-perf.mjs
- ref_node_module
- apple-design-2-browser.mjs
- extract-discraft-batch2.py
- playwright
- atlas-groups.mjs
- slider-drag-browser.mjs
- mold
- ref_node_assert
- photo-albedo.mjs
- bag-demo-browser.mjs
- bag-v13-browser.mjs
- halo-band-sampling.mjs
- atlas-organic.mjs
- buildClusters
- palette.mjs
- discraft-fraction-audit-browser.mjs
- mountGraveyard
- profile.mjs
- StampManifestTests
- discraft-stamps-batch1-browser.mjs
- ref_node_http
- directory-layout-browser.mjs
- atlas-intro-reveal-browser.mjs
- draw
- atlas-motion.js
- coach.js
- bag-collections-browser.mjs
- install-pnpm.sh
- discraft_batch2_test.py
- stamp_fraction_audit_test.py
- bag-pockets-browser.mjs
- schema.ts
- account.js
- leaveBag
- prompt-4-leftovers-browser.mjs
- personal-map-worker.mjs
- next
- atlas-targets.js
- atlas-3d-perf.mjs
- shopping.js
- install-ci.sh
- stamp-scale-browser.mjs
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- atlas-lod.mjs
- cloudflare-env.d.ts
- overrides
- drizzle-kit
- engines
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- disc-appearance-browser.mjs
- grouping-zoom.mjs
- compose-discraft-fraction-proofs.py
- photo-level-measure.mjs
- disc-webp.mjs

## God Nodes (most connected - your core abstractions)
1. `BagScene` - 63 edges
2. `scripts` - 57 edges
3. `createDiscViewer()` - 48 edges
4. `mountRacks()` - 36 edges
5. `mountBag()` - 35 edges
6. `render()` - 34 edges
7. `state()` - 31 edges
8. `theme()` - 29 edges
9. `SceneView` - 29 edges
10. `AuditTests` - 29 edges

## Surprising Connections (you probably didn't know these)
- `layout()` --indirect_call--> `columns()`  [INFERRED]
  public/collection3d/graveyard.mjs → tests/bag-3d-layout.mjs
- `sampled()` --calls--> `delightPixels()`  [EXTRACTED]
  tests/halo-band-sampling.mjs → public/disc-albedo.mjs
- `editorFixture()` --indirect_call--> `isHalo()`  [INFERRED]
  tests/photo-editor-races.mjs → public/disc3d/halo.mjs
- `fitDistance()` --indirect_call--> `probe()`  [INFERRED]
  public/disc3d/viewer.mjs → tests/slider-drag-browser.mjs
- `update()` --indirect_call--> `photo()`  [INFERRED]
  public/disc3d/viewer.mjs → tests/photo-albedo.mjs

## Import Cycles
- None detected.

## Communities (146 total, 31 thin omitted)

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

### Community 4 - "theme"
Cohesion: 0.05
Nodes (28): theme(), {chromium}, server, checks, {chromium}, errors, server, shots (+20 more)

### Community 5 - "scripts"
Cohesion: 0.04
Nodes (57): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+49 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.12
Nodes (29): encodeHalo(), albedoCanvas(), bandRatio(), canvasBitmap(), canvasBlob(), checkPhotoSize(), createPhotoEditor(), decodePhoto() (+21 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.05
Nodes (37): a, args, base(), brandCount, byId, cellPool(), cells, excludedIds (+29 more)

### Community 8 - "package.json"
Cohesion: 0.05
Nodes (40): name, packageManager, private, type, version, @base-ui/react, class-variance-authority, @cloudflare/vite-plugin (+32 more)

### Community 9 - "disc3d-popout-browser.mjs"
Cohesion: 0.07
Nodes (19): byName(), {chromium}, errors, server, settle(), show(), types, view() (+11 more)

### Community 10 - "render"
Cohesion: 0.28
Nodes (14): bagComparator(), stabilityBiasLabel(), haloBand(), haloModel(), bagRimColor(), photoURL(), bagDetailMarkup(), bagged() (+6 more)

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.07
Nodes (33): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+25 more)

### Community 12 - "initAtlasMap"
Cohesion: 0.19
Nodes (22): animateZoom(), boundedCamera(), catchAtlasIntro(), changeZoom(), clearClusterTimers(), closeCluster(), initAtlasMap(), loadAtlasArt() (+14 more)

### Community 13 - "halo-plastic-browser.mjs"
Cohesion: 0.09
Nodes (24): chroma(), {chromium}, command(), dE(), dist(), hex(), lab(), metrics (+16 more)

### Community 14 - "my-bag.js"
Cohesion: 0.07
Nodes (36): addMenu, addMenuOpen(), bagColorMap, bagHaloMap, bagHaloModelMap, bagPhotoMap, bagRimColorMap, catalogs (+28 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.07
Nodes (42): artZooming(), atlasPositions, CAMERA_AXES, cameraMoving(), cameraSpring, clusterPicks, comparisonMarkup(), comparisonPalette() (+34 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.17
Nodes (32): angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), attach(), build(), cancelRim(), dispose() (+24 more)

### Community 18 - "SceneView"
Cohesion: 0.12
Nodes (6): clamp(), coarse(), NameTag, SceneView, softwareRenderer(), stage()

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.07
Nodes (44): stageMode(), attachDiscFeatures(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot(), advanceTime(), poseAt() (+36 more)

### Community 20 - "mountRacks"
Cohesion: 0.22
Nodes (21): rackX(), restHeight(), rowWidth(), mountRacks(), batchFor(), box(), drop(), ensureRacks() (+13 more)

### Community 22 - "overmold.mjs"
Cohesion: 0.20
Nodes (13): DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, isOvermold(), KEYS, LIST, OVERMOLD_DISCS, overmoldColors(), parseColor() (+5 more)

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.29
Nodes (8): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagClass(), rackOrder(), storedItems()

### Community 24 - "bag-values.js"
Cohesion: 0.15
Nodes (21): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagPalette(), bagSlots(), DEFAULT_BAG_COLOR, defaultDiscDetails() (+13 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 27 - "stage.mjs"
Cohesion: 0.11
Nodes (37): DISC_BUDGET, discModel(), discParts(), parts, getAtlasArt(), HALO_FEATHER, HALO_FORMAT, HALO_RING (+29 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.11
Nodes (19): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+11 more)

### Community 29 - "collection-scenes.js"
Cohesion: 0.23
Nodes (9): rackStyle(), RACK_CAPACITY, rackCount(), rackSlot(), BAYS, esc(), plural(), StorageScene (+1 more)

### Community 30 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.12
Nodes (13): assignments, baseline, batch, {chromium}, controls, drops, molds, newMolds (+5 more)

### Community 31 - "lens-corner-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, server, shots, THEMES, WIDTHS (+1 more)

### Community 32 - "collection-layout.mjs"
Cohesion: 0.26
Nodes (11): epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN, MAX_TURN, PLOT_DEPTH (+3 more)

### Community 33 - ".zoom"
Cohesion: 0.08
Nodes (18): level(), drawCompareHighlights(), mapMarkerScale(), checkAtlasInteractions(), checkContextHeader(), checkHeaderMenu(), checkThemePicker(), checkDeepZoom() (+10 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.07
Nodes (43): assignSides(), BAG_BOX, bagLayout(), brickRows(), byKey(), clamp(), depthOrder(), DISC (+35 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.21
Nodes (24): bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress(), delightPixels() (+16 more)

### Community 36 - "createAtlasArt"
Cohesion: 0.36
Nodes (11): createAtlasArt(), dispose(), geometryOf(), get(), has(), render(), shapeOf(), touch() (+3 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "racks.mjs"
Cohesion: 0.10
Nodes (24): BAYS_PER_TIER, CLASS_ORDER, pulledSpot(), RACK_DEPTH, RACK_GAP, RACK_HEIGHT, RACK_WIDTH, SHELF_CLEARANCE (+16 more)

### Community 39 - "halo-swirl.mjs"
Cohesion: 0.14
Nodes (23): ASYM_FEATHER, asymFront(), drawnFront(), DYE, [dye,wash,plate,ink], dyeShare(), enc(), fbm() (+15 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.10
Nodes (7): isHalo(), apiSource, bagSource, closeSource, editorFixture(), saveSource, stampStubs

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.22
Nodes (17): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+9 more)

### Community 43 - "ref_node_test"
Cohesion: 0.13
Nodes (26): bagDiscGeometry(), HALO_PLASTICS, clamp(), DEFAULTS, discProfile(), domeCurve(), finite(), lerp() (+18 more)

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
Nodes (23): active(), canvas, desktop, eligible(), fallback(), frame(), hero, motion (+15 more)

### Community 54 - ".zoom"
Cohesion: 0.18
Nodes (8): checks, {chromium}, errors, SCENE(), server, settled(), show(), VIEWPORTS

### Community 55 - "ref_node_child_process"
Cohesion: 0.08
Nodes (21): NpmCacheProgress, runNpmInstall(), projectRoot, {chromium}, errors, originals, requests, result (+13 more)

### Community 56 - "halo-band-v2.mjs"
Cohesion: 0.20
Nodes (12): frontAt(), FRONT_RING, dE(), delit(), disc(), enc(), L(), lab() (+4 more)

### Community 57 - "sites-env.sh"
Cohesion: 0.14
Nodes (13): HOME, MINIFLARE_REGISTRY_PATH, npm_config_audit, npm_config_cache, npm_config_fund, npm_config_update_notifier, sites-env.sh script, SITES_ENV_READY (+5 more)

### Community 58 - "atlas-depth.mjs"
Cohesion: 0.15
Nodes (9): boxes(), CHROME, discs, LEVELS, positions, prints, rooms(), runtime (+1 more)

### Community 59 - "bag-popup-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 60 - "bag-staging-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 61 - "vite.config.ts"
Cohesion: 0.18
Nodes (6): vinext, vite, readExecutionProfile(), cli, [command, ...args], localBindingConfig

### Community 62 - "ref_node_https"
Cohesion: 0.04
Nodes (38): {chromium}, command(), errors, server, state(), {chromium}, command(), server (+30 more)

### Community 63 - "rack-motion.mjs"
Cohesion: 0.23
Nodes (11): clamp(), DEFAULT_RACK_COLOR, discPose(), easeInOut(), mix(), RESTAGE_MS, SLIDE_MS, stage() (+3 more)

### Community 64 - "atlas-layout.mjs"
Cohesion: 0.19
Nodes (9): catalogBase, context, filters(), fixtures, random(), rated, score(), sizes (+1 more)

### Community 65 - "bag-3d-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, perf, server, shots, themes (+1 more)

### Community 66 - "bag-tweaks-browser.mjs"
Cohesion: 0.15
Nodes (10): checks, {chromium}, command(), errors, GOTO, MAIN, metrics, PUTTERS (+2 more)

### Community 67 - "apple-design-3-browser.mjs"
Cohesion: 0.17
Nodes (6): checks, {chromium}, errors, only, server, types

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

### Community 72 - "ref_node_module"
Cohesion: 0.06
Nodes (19): {chromium}, errors, server, {chromium}, errors, metrics, server, checks (+11 more)

### Community 73 - "apple-design-2-browser.mjs"
Cohesion: 0.13
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 74 - "extract-discraft-batch2.py"
Cohesion: 0.23
Nodes (5): digest(), measure(), digest(), run(), slug()

### Community 76 - "atlas-groups.mjs"
Cohesion: 0.18
Nodes (8): area, build(), featured, footprints, items, label, worker, runtime

### Community 77 - "slider-drag-browser.mjs"
Cohesion: 0.24
Nodes (10): assertRangeDrag(), checkRangeDefaults(), dragRange(), {chromium}, errors, probe(), results, server (+2 more)

### Community 78 - "mold"
Cohesion: 0.17
Nodes (24): pocketLabel(), api(), chooseRackStyle(), endDrag(), focusFirst(), foundDisc(), gallery, loadBag() (+16 more)

### Community 79 - "ref_node_assert"
Cohesion: 0.05
Nodes (24): output, data, context, T, {chromium}, errors, metrics, server (+16 more)

### Community 80 - "photo-albedo.mjs"
Cohesion: 0.24
Nodes (11): SOFTEN_GLARE, ab(), enc(), lin(), luma(), lumAt(), photo(), enc() (+3 more)

### Community 81 - "bag-demo-browser.mjs"
Cohesion: 0.20
Nodes (7): bagCalls, checks, {chromium}, command(), errors, server, shots

### Community 82 - "bag-v13-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, server, shots, themes, widths

### Community 83 - "halo-band-sampling.mjs"
Cohesion: 0.27
Nodes (10): dE(), disc(), enc(), isDye(), L(), lab(), lch(), lin() (+2 more)

### Community 84 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

### Community 85 - "buildClusters"
Cohesion: 0.27
Nodes (12): buildClusters(), cancelRegroup(), ensureGroupWorker(), hydrateGaps(), hydrateGroups(), measureChrome(), measureFullLabels(), organicAtlas() (+4 more)

### Community 86 - "palette.mjs"
Cohesion: 0.22
Nodes (6): {chromium}, contrast(), errors, luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.12
Nodes (11): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+3 more)

### Community 88 - "mountGraveyard"
Cohesion: 0.16
Nodes (22): ABOVE_GROUND, engraving(), plots(), mountGraveyard(), dress(), hover(), idAt(), layout() (+14 more)

### Community 89 - "profile.mjs"
Cohesion: 0.13
Nodes (22): acquirePhoto(), cache, photoGeometry(), photoSurface(), reliefTexture(), CLAY_TONES, esc(), LABELS (+14 more)

### Community 91 - "discraft-stamps-batch1-browser.mjs"
Cohesion: 0.07
Nodes (23): {chromium}, command(), metrics, server, mold(), rated(), assignments, baseline (+15 more)

### Community 92 - "ref_node_http"
Cohesion: 0.06
Nodes (20): output, server, checks, {chromium}, errors, server, types, checks (+12 more)

### Community 93 - "directory-layout-browser.mjs"
Cohesion: 0.18
Nodes (9): checks, {chromium}, desktop, errors, metrics, phone, server, shots (+1 more)

### Community 94 - "atlas-intro-reveal-browser.mjs"
Cohesion: 0.20
Nodes (7): camera(), {chromium}, errors, pixelFailures, report, server, png()

### Community 95 - "draw"
Cohesion: 0.24
Nodes (12): artFrame(), draw(), drawPlanetLabels(), drawSatelliteLeaders(), featuredDisc(), focusFeatured(), measureMap(), presentAtlas() (+4 more)

### Community 96 - "atlas-motion.js"
Cohesion: 0.19
Nodes (8): fadeOut(), photoMarkup(), renderMarkers(), selectedGroup(), dismiss(), reveal(), selected(), slide()

### Community 97 - "coach.js"
Cohesion: 0.50
Nodes (7): allowance(), api(), append(), appendDraft(), open(), render(), reset()

### Community 98 - "bag-collections-browser.mjs"
Cohesion: 0.18
Nodes (9): {chromium}, COLORS, command(), errors, MOLDS, PLASTICS, report, server (+1 more)

### Community 99 - "install-pnpm.sh"
Cohesion: 0.39
Nodes (7): acquire_shared_lock(), can_write_directory(), release_shared_lock(), report_store(), install-pnpm.sh script, XDG_CACHE_HOME, XDG_DATA_HOME

### Community 102 - "bag-pockets-browser.mjs"
Cohesion: 0.22
Nodes (7): {chromium}, command(), errors, server, shots, themes, widths

### Community 103 - "schema.ts"
Cohesion: 0.33
Nodes (4): bagItems, coachUsage, profiles, drizzle-orm

### Community 104 - "account.js"
Cohesion: 0.52
Nodes (5): api(), refresh(), renderPage(), signOut(), sync()

### Community 105 - "leaveBag"
Cohesion: 0.29
Nodes (7): activateBag(), closeBagTips(), directory(), leaveBag(), positionBagTips(), setBagView(), undockDetail()

### Community 106 - "prompt-4-leftovers-browser.mjs"
Cohesion: 0.12
Nodes (11): baselines, {chromium}, command(), live, sql(), start(), pause(), pw (+3 more)

### Community 108 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 109 - "atlas-targets.js"
Cohesion: 0.53
Nodes (4): inBox(), pick(), reach(), reads()

### Community 110 - "atlas-3d-perf.mjs"
Cohesion: 0.43
Nodes (7): decide(), deviceReps(), DEVICES, FLIGHT(), main(), median(), parseReps()

### Community 111 - "shopping.js"
Cohesion: 0.70
Nodes (4): offers(), render(), row(), tracking()

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 113 - "stamp-scale-browser.mjs"
Cohesion: 0.20
Nodes (7): baseline, {chromium}, diagnose, files, measurements, results, server

### Community 115 - "0000_powerful_pepper_potts.sql"
Cohesion: 0.50
Nodes (3): `bag_items`, `coach_usage`, `profiles`

### Community 116 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 117 - "atlas-lod.mjs"
Cohesion: 0.36
Nodes (6): HOLD_LIMIT, LOD_MARGIN, lodFor(), LODS, ORDER, walk()

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 140 - "disc-appearance-browser.mjs"
Cohesion: 0.25
Nodes (7): by(), catalog, {chromium}, examples, items, server, settings

### Community 141 - "grouping-zoom.mjs"
Cohesion: 0.58
Nodes (6): checkGroupingZoom(), checkLowZoomLabels(), checkZoomCandidates(), frameBand(), measureBand(), settleMap()

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 148 - "photo-level-measure.mjs"
Cohesion: 0.43
Nodes (4): angleOf(), luma(), renderedStampAngle(), stampAngle()

### Community 149 - "disc-webp.mjs"
Cohesion: 0.33
Nodes (3): fallbackWebP(), encodeWebP(), loadEncoder()

## Knowledge Gaps
- **52 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1171 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jose` connect `workers/auth.mjs` to `package.json`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05759623861298854 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `workers/auth.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05189189189189189 - nodes in this community are weakly interconnected._
- **Why does `inCollection()` connect `app.js` to `bag-tweaks-browser.mjs`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10842844600526778 - nodes in this community are weakly interconnected._