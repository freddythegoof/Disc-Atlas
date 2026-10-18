# Graph Report - disc-atlas-halo-pr24  (2026-10-18)

## Corpus Check
- 340 files · ~4,912,527 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 67 file(s) not represented in the graph (top: .log 31, .css 15, .ttf 8)

## Summary
- 2550 nodes · 5207 edges · 161 communities (129 shown, 32 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 193 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d551c6d2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- workers/auth.mjs
- Bag scene
- bag.js
- ref_node_module
- scripts
- disc-photo.mjs
- sampling-audit-draw.mjs
- package.json
- disc3d-popout-browser.mjs
- ref_node_child_process
- manufacturer-diff.py
- photo-textures-browser.mjs
- halo-plastic-browser.mjs
- my-bag.js
- atlas-map.js
- Shared 3D disc viewer
- AuditTests
- SceneView
- bag3d/viewer.mjs
- mountGraveyard
- StampManifestTests
- shape.mjs
- all-discs-gallery.js
- bag-values.js
- dependencies
- LostScene
- detail
- Account and bag SQL schema
- ref_node_vm
- render
- initAtlasMap
- bag-3d-layout.mjs
- ref_node_assert
- bag-layout.mjs
- scheduleMapDraw
- atlas-art.mjs
- devDependencies
- racks.mjs
- discraft-stamps-batch2-browser.mjs
- photo-editor-races.mjs
- compilerOptions
- atlas-groups.js
- disc3d/viewer.mjs
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
- mountRacks
- sites-env.sh
- atlas-depth.mjs
- ref_node_https
- bag-staging-browser.mjs
- vite.config.ts
- ref_node_http
- rack-motion.mjs
- atlas-layout.mjs
- bag-3d-browser.mjs
- bag-tweaks-browser.mjs
- lens-corner-browser.mjs
- hashlib
- atlas-speed-band.mjs
- atlas-speed-band-browser.mjs
- bag-animation-perf.mjs
- apple-design-3-browser.mjs
- slider-drag-browser.mjs
- disc-albedo.mjs
- buildClusters
- atlas-groups.mjs
- bag-spin-pocket-browser.mjs
- mold
- halo-swirl.mjs
- my-map-browser.mjs
- bag-scene-browser.mjs
- bag-v12-browser.mjs
- collection-scenes.js
- atlas-organic.mjs
- collection-layout.mjs
- palette.mjs
- discraft-fraction-audit-browser.mjs
- draw
- profile.mjs
- StampManifestTests
- discraft-stamps-batch1-browser.mjs
- photo-albedo.mjs
- atlas-layout.js
- grouping-zoom.mjs
- activeLens
- atlas-motion.js
- coach.js
- bag-collections-browser.mjs
- install-pnpm.sh
- discraft_batch2_test.py
- stamp_fraction_audit_test.py
- bag-pulled-sizing.mjs
- schema.ts
- account.js
- overmold.mjs
- coach-browser.mjs
- personal-map-worker.mjs
- next
- atlas-targets.js
- halo-band-sampling.mjs
- shopping.js
- install-ci.sh
- dropdown-indicator-browser.mjs
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- Page
- cloudflare-env.d.ts
- overrides
- drizzle-kit
- engines
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- renderList
- directory-layout-browser.mjs
- compose-discraft-fraction-proofs.py
- filter
- pulled-sizing.mjs
- sync
- brandList
- updateDetail
- photo-level-measure.mjs
- bag-demo-browser.mjs
- bag-map-controls-browser.mjs
- bag-memorial-browser.mjs
- disc-webp.mjs
- add-menu-dismiss-browser.mjs
- bag-pulled-sizing-browser.mjs
- disc-state.mjs
- all-discs-browser.mjs
- halo.mjs
- HttpCache
- DiscmaniaIdentity
- photo-math.mjs

## God Nodes (most connected - your core abstractions)
1. `BagScene` - 63 edges
2. `scripts` - 56 edges
3. `createDiscViewer()` - 44 edges
4. `mountRacks()` - 36 edges
5. `render()` - 33 edges
6. `mountBag()` - 31 edges
7. `SceneView` - 29 edges
8. `AuditTests` - 29 edges
9. `theme()` - 28 edges
10. `shapeForDisc()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `layout()` --indirect_call--> `columns()`  [INFERRED]
  public/collection3d/graveyard.mjs → tests/bag-3d-layout.mjs
- `sampled()` --calls--> `delightPixels()`  [EXTRACTED]
  tests/halo-band-sampling.mjs → public/disc-albedo.mjs
- `editorFixture()` --indirect_call--> `isHalo()`  [INFERRED]
  tests/photo-editor-races.mjs → public/disc3d/halo.mjs
- `flagged()` --calls--> `isOvermold()`  [EXTRACTED]
  tests/disc3d-overmold.mjs → public/disc3d/overmold.mjs
- `fitDistance()` --indirect_call--> `probe()`  [INFERRED]
  public/disc3d/viewer.mjs → tests/slider-drag-browser.mjs

## Import Cycles
- None detected.

## Communities (161 total, 32 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.09
Nodes (22): brandPalette, canvas, colors, compareCards, comparison, ctx, discs, featuredRanks (+14 more)

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
Cohesion: 0.07
Nodes (14): {chromium}, server, {chromium}, errors, server, {chromium}, errors, metrics (+6 more)

### Community 5 - "scripts"
Cohesion: 0.04
Nodes (56): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+48 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.14
Nodes (27): albedoCanvas(), bandRatio(), canvasBitmap(), canvasBlob(), checkPhotoSize(), createPhotoEditor(), decodePhoto(), DEFAULTS (+19 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.05
Nodes (37): a, args, base(), brandCount, byId, cellPool(), cells, excludedIds (+29 more)

### Community 8 - "package.json"
Cohesion: 0.05
Nodes (41): name, packageManager, private, type, version, @base-ui/react, class-variance-authority, @cloudflare/vite-plugin (+33 more)

### Community 9 - "disc3d-popout-browser.mjs"
Cohesion: 0.07
Nodes (19): byName(), {chromium}, errors, server, settle(), show(), types, view() (+11 more)

### Community 10 - "ref_node_child_process"
Cohesion: 0.07
Nodes (24): readExecutionProfile(), NpmCacheProgress, runNpmInstall(), cli, [command, ...args], projectRoot, {chromium}, errors (+16 more)

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.10
Nodes (29): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+21 more)

### Community 12 - "photo-textures-browser.mjs"
Cohesion: 0.33
Nodes (3): verifyPhotoDecode(), {chromium}, server

### Community 13 - "halo-plastic-browser.mjs"
Cohesion: 0.07
Nodes (28): by(), catalog, {chromium}, examples, items, server, settings, chroma() (+20 more)

### Community 14 - "my-bag.js"
Cohesion: 0.07
Nodes (33): defaultPocket(), addMenu, addMenuOpen(), bagColorMap, bagHaloMap, bagPhotoMap, bagRimColorMap, catalogs (+25 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.08
Nodes (29): atlasPositions, CAMERA_AXES, cameraSpring, clusterPicks, comparisonMarkup(), comparisonPalette(), discArt(), dropMarkerArt() (+21 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.16
Nodes (32): angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), attach(), build(), cancelRim(), dispose() (+24 more)

### Community 18 - "SceneView"
Cohesion: 0.14
Nodes (3): clamp(), NameTag, SceneView

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.12
Nodes (25): stageMode(), advanceTime(), poseAt(), phonePulledFit(), phonePulledLayout(), clamp01(), easeInOut(), easeOut() (+17 more)

### Community 20 - "mountGraveyard"
Cohesion: 0.15
Nodes (21): ABOVE_GROUND, engraving(), mountGraveyard(), dress(), hover(), idAt(), layout(), makePlot() (+13 more)

### Community 21 - "StampManifestTests"
Cohesion: 0.13
Nodes (4): main(), slug(), tile(), Validator

### Community 22 - "shape.mjs"
Cohesion: 0.12
Nodes (35): bagDiscGeometry(), discParts(), discGeometry(), groupRim(), lathePoints(), isOvermold(), clamp(), cubic() (+27 more)

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.29
Nodes (8): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagClass(), rackOrder(), storedItems()

### Community 24 - "bag-values.js"
Cohesion: 0.16
Nodes (19): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagPalette(), bagSlots(), DEFAULT_BAG_COLOR, defaultDiscDetails() (+11 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 27 - "detail"
Cohesion: 0.19
Nodes (19): addDestinationControl(), applyTheme(), closeDetail(), compareCardMarkup(), compareSketchMarkup(), detail(), esc(), flight() (+11 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.11
Nodes (19): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+11 more)

### Community 30 - "render"
Cohesion: 0.19
Nodes (19): bagComparator(), pocketLabel(), stabilityBiasLabel(), wearLabel(), haloBand(), bagRimColor(), photoURL(), bagDetailMarkup() (+11 more)

### Community 31 - "initAtlasMap"
Cohesion: 0.17
Nodes (21): animateZoom(), boundedCamera(), cameraMoving(), changeZoom(), clearClusterTimers(), closeCluster(), initAtlasMap(), openCluster() (+13 more)

### Community 32 - "bag-3d-layout.mjs"
Cohesion: 0.11
Nodes (16): depthOrder(), DISC, MAIN, SIDE_BAG, boxesOverlap(), CLEAR, DESKTOP, entry() (+8 more)

### Community 33 - "ref_node_assert"
Cohesion: 0.06
Nodes (28): level(), output, data, checkAtlasInteractions(), checkContextHeader(), checkHeaderMenu(), checkThemePicker(), checkDeepZoom() (+20 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.12
Nodes (27): assignSides(), BAG_BOX, bagLayout(), brickRows(), byKey(), clamp(), fan(), footprint() (+19 more)

### Community 35 - "scheduleMapDraw"
Cohesion: 0.24
Nodes (10): artZooming(), drawGaps(), gapName(), gapSprite(), gapTarget(), keepPinnedGaps(), levelHeld(), mapTargets() (+2 more)

### Community 36 - "atlas-art.mjs"
Cohesion: 0.21
Nodes (16): createAtlasArt(), dispose(), geometryOf(), get(), has(), render(), shapeOf(), touch() (+8 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "racks.mjs"
Cohesion: 0.10
Nodes (23): BAYS_PER_TIER, CLASS_ORDER, pulledSpot(), RACK_DEPTH, RACK_GAP, RACK_HEIGHT, RACK_WIDTH, SHELF_CLEARANCE (+15 more)

### Community 39 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.12
Nodes (13): assignments, baseline, batch, {chromium}, controls, drops, molds, newMolds (+5 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.11
Nodes (5): apiSource, bagSource, closeSource, saveSource, stampStubs

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.22
Nodes (17): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+9 more)

### Community 43 - "disc3d/viewer.mjs"
Cohesion: 0.13
Nodes (27): observeDiscThumbnails(), coarse(), DISC_BUDGET, discColors(), discMaterial(), discModel(), parts, softwareRenderer() (+19 more)

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
Cohesion: 0.23
Nodes (12): active(), canvas, desktop, eligible(), fallback(), frame(), hero, motion (+4 more)

### Community 54 - ".zoom"
Cohesion: 0.15
Nodes (13): drawCompareHighlights(), keepPinned(), mapMarkerScale(), markerLabel(), markerTarget(), checks, {chromium}, errors (+5 more)

### Community 55 - "apple-design-2-browser.mjs"
Cohesion: 0.13
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 56 - "mountRacks"
Cohesion: 0.23
Nodes (20): rackX(), restHeight(), rowWidth(), mountRacks(), batchFor(), box(), drop(), ensureRacks() (+12 more)

### Community 57 - "sites-env.sh"
Cohesion: 0.14
Nodes (13): HOME, MINIFLARE_REGISTRY_PATH, npm_config_audit, npm_config_cache, npm_config_fund, npm_config_update_notifier, sites-env.sh script, SITES_ENV_READY (+5 more)

### Community 58 - "atlas-depth.mjs"
Cohesion: 0.15
Nodes (9): boxes(), CHROME, discs, LEVELS, positions, prints, rooms(), runtime (+1 more)

### Community 59 - "ref_node_https"
Cohesion: 0.05
Nodes (29): theme(), {chromium}, server, {chromium}, server, {chromium}, errors, server (+21 more)

### Community 60 - "bag-staging-browser.mjs"
Cohesion: 0.14
Nodes (9): bigDemo, checks, {chromium}, demoSource, errors, EXTRA, metrics, server (+1 more)

### Community 61 - "vite.config.ts"
Cohesion: 0.25
Nodes (3): vinext, vite, localBindingConfig

### Community 62 - "ref_node_http"
Cohesion: 0.05
Nodes (26): output, server, checks, {chromium}, errors, server, decide(), deviceReps() (+18 more)

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

### Community 68 - "hashlib"
Cohesion: 0.12
Nodes (8): digest(), measure(), extract(), slug(), digest(), run(), slug(), extract()

### Community 69 - "atlas-speed-band.mjs"
Cohesion: 0.18
Nodes (9): base, CHROME, off(), prints, rated, runtime, SIZES, STATES (+1 more)

### Community 70 - "atlas-speed-band-browser.mjs"
Cohesion: 0.18
Nodes (10): CAMERAS, {chromium}, errors, failures, RENDERED(), server, settled(), show() (+2 more)

### Community 71 - "bag-animation-perf.mjs"
Cohesion: 0.17
Nodes (8): baseline, {chromium}, photos, profile, server, verifyLayout, verifyTextures, verifyTransitions

### Community 72 - "apple-design-3-browser.mjs"
Cohesion: 0.17
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 73 - "slider-drag-browser.mjs"
Cohesion: 0.24
Nodes (10): assertRangeDrag(), checkRangeDefaults(), dragRange(), {chromium}, errors, probe(), results, server (+2 more)

### Community 74 - "disc-albedo.mjs"
Cohesion: 0.27
Nodes (17): bandColor(), basis(), compress(), delightPixels(), encode(), evaluate(), fitQuadratic(), labOf() (+9 more)

### Community 75 - "buildClusters"
Cohesion: 0.31
Nodes (11): buildClusters(), cancelRegroup(), ensureGroupWorker(), hydrateGaps(), hydrateGroups(), measureChrome(), measureFullLabels(), organicAtlas() (+3 more)

### Community 76 - "atlas-groups.mjs"
Cohesion: 0.18
Nodes (8): area, build(), featured, footprints, items, label, worker, runtime

### Community 77 - "bag-spin-pocket-browser.mjs"
Cohesion: 0.18
Nodes (7): checks, {chromium}, errors, metrics, server, shots, THEMES

### Community 78 - "mold"
Cohesion: 0.22
Nodes (20): api(), chooseRackStyle(), endDrag(), focusFirst(), foundDisc(), gallery, loadBag(), lostScene (+12 more)

### Community 79 - "halo-swirl.mjs"
Cohesion: 0.20
Nodes (17): DYE, [dye,wash,plate,ink], enc(), glared(), INK, light(), lin(), mix() (+9 more)

### Community 80 - "my-map-browser.mjs"
Cohesion: 0.18
Nodes (7): BAG, checks, {chromium}, errors, metrics, server, shots

### Community 81 - "bag-scene-browser.mjs"
Cohesion: 0.22
Nodes (6): {chromium}, errors, metrics, server, themes, widths

### Community 82 - "bag-v12-browser.mjs"
Cohesion: 0.22
Nodes (6): {chromium}, errors, server, shots, themes, widths

### Community 83 - "collection-scenes.js"
Cohesion: 0.23
Nodes (9): rackStyle(), RACK_CAPACITY, rackCount(), rackSlot(), BAYS, esc(), plural(), StorageScene (+1 more)

### Community 84 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

### Community 85 - "collection-layout.mjs"
Cohesion: 0.26
Nodes (12): epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN, MAX_TURN, PLOT_DEPTH (+4 more)

### Community 86 - "palette.mjs"
Cohesion: 0.22
Nodes (6): {chromium}, contrast(), errors, luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.08
Nodes (18): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+10 more)

### Community 88 - "draw"
Cohesion: 0.18
Nodes (14): artFrame(), draw(), drawPlanetLabels(), drawSatelliteLeaders(), fadeOut(), focusFeatured(), measureMap(), photoMarkup() (+6 more)

### Community 89 - "profile.mjs"
Cohesion: 0.14
Nodes (18): acquirePhoto(), cache, photoGeometry(), photoSurface(), reliefTexture(), CLAY_TONES, esc(), LABELS (+10 more)

### Community 91 - "discraft-stamps-batch1-browser.mjs"
Cohesion: 0.07
Nodes (22): {chromium}, metrics, server, mold(), rated(), assignments, baseline, batch (+14 more)

### Community 92 - "photo-albedo.mjs"
Cohesion: 0.24
Nodes (11): SOFTEN_GLARE, ab(), enc(), lin(), luma(), lumAt(), photo(), enc() (+3 more)

### Community 93 - "atlas-layout.js"
Cohesion: 0.28
Nodes (10): adapt(), adaptStrength(), bandSlope(), bounds(), camera(), inBand(), positions(), scatter() (+2 more)

### Community 94 - "grouping-zoom.mjs"
Cohesion: 0.58
Nodes (6): checkGroupingZoom(), checkLowZoomLabels(), checkZoomCandidates(), frameBand(), measureBand(), settleMap()

### Community 95 - "activeLens"
Cohesion: 0.27
Nodes (11): activeLens(), atlasPriority(), bagColors(), brandColor(), discColor(), inLens(), myColor(), renderLegend() (+3 more)

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

### Community 105 - "overmold.mjs"
Cohesion: 0.22
Nodes (11): DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, KEYS, LIST, OVERMOLD_DISCS, overmoldColors(), parseColor(), toHex() (+3 more)

### Community 106 - "coach-browser.mjs"
Cohesion: 0.33
Nodes (5): baselines, {chromium}, command(), live, sql()

### Community 107 - "personal-map-worker.mjs"
Cohesion: 0.29
Nodes (4): ids, items, worker(), runtime

### Community 108 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 109 - "atlas-targets.js"
Cohesion: 0.53
Nodes (4): inBox(), pick(), reach(), reads()

### Community 110 - "halo-band-sampling.mjs"
Cohesion: 0.27
Nodes (10): dE(), disc(), enc(), isDye(), L(), lab(), lch(), lin() (+2 more)

### Community 111 - "shopping.js"
Cohesion: 0.70
Nodes (4): offers(), render(), row(), tracking()

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 113 - "dropdown-indicator-browser.mjs"
Cohesion: 0.17
Nodes (8): checks, {chromium}, controls, errors, server, shots, THEMES, WIDTHS

### Community 115 - "0000_powerful_pepper_potts.sql"
Cohesion: 0.50
Nodes (3): `bag_items`, `coach_usage`, `profiles`

### Community 116 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 140 - "renderList"
Cohesion: 0.31
Nodes (9): closeDropdown(), flightCells(), openLensMenu(), placeDropdown(), reanchorDropdown(), renderList(), setView(), showDropdown() (+1 more)

### Community 141 - "directory-layout-browser.mjs"
Cohesion: 0.18
Nodes (9): checks, {chromium}, desktop, errors, metrics, phone, server, shots (+1 more)

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 143 - "filter"
Cohesion: 0.28
Nodes (9): compareOptional(), filter(), inCollection(), isCurrentOrRecent(), recentCutoff(), renderContextTitle(), renderSearchCoverage(), searchText() (+1 more)

### Community 144 - "pulled-sizing.mjs"
Cohesion: 0.29
Nodes (9): clamp(), desktopPulledLayout(), packing(), PHONE_PULLED_COUNT, PHONE_PULLED_MAX, PULLED_SIZE_MS, PULLED_SPACE, pulledDiameter() (+1 more)

### Community 145 - "sync"
Cohesion: 0.24
Nodes (9): activateBag(), closeBagTips(), directory(), leaveBag(), positionBagTips(), setBagView(), showDemo(), sync() (+1 more)

### Community 146 - "brandList"
Cohesion: 0.50
Nodes (5): brandList(), load(), prepareFeaturedDetails(), renderBrandChip(), renderBrands()

### Community 147 - "updateDetail"
Cohesion: 0.50
Nodes (5): detailBlocks(), detailGhosts(), fadeDetail(), updateDetail(), sync()

### Community 148 - "photo-level-measure.mjs"
Cohesion: 0.43
Nodes (4): angleOf(), luma(), renderedStampAngle(), stampAngle()

### Community 149 - "bag-demo-browser.mjs"
Cohesion: 0.20
Nodes (6): bagCalls, checks, {chromium}, errors, server, shots

### Community 150 - "bag-map-controls-browser.mjs"
Cohesion: 0.25
Nodes (5): checks, {chromium}, errors, server, shots

### Community 151 - "bag-memorial-browser.mjs"
Cohesion: 0.25
Nodes (5): {chromium}, errors, server, shots, themes

### Community 152 - "disc-webp.mjs"
Cohesion: 0.33
Nodes (3): fallbackWebP(), encodeWebP(), loadEncoder()

### Community 153 - "add-menu-dismiss-browser.mjs"
Cohesion: 0.29
Nodes (5): checks, {chromium}, errors, server, types

### Community 154 - "bag-pulled-sizing-browser.mjs"
Cohesion: 0.29
Nodes (4): {chromium}, errors, metrics, server

### Community 155 - "disc-state.mjs"
Cohesion: 0.60
Nodes (5): attachDiscFeatures(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot()

### Community 156 - "all-discs-browser.mjs"
Cohesion: 0.33
Nodes (3): {chromium}, errors, server

### Community 157 - "halo.mjs"
Cohesion: 0.40
Nodes (4): HALO_PLASTICS, isHalo(), NAMES, editorFixture()

## Knowledge Gaps
- **53 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+48 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1175 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jose` connect `workers/auth.mjs` to `package.json`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _53 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08666666666666667 - nodes in this community are weakly interconnected._
- **Why does `inCollection()` connect `filter` to `app.js`, `bag-tweaks-browser.mjs`, `brandList`, `detail`, `activeLens`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `workers/auth.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05189189189189189 - nodes in this community are weakly interconnected._
- **Why does `createDiscViewer()` connect `Shared 3D disc viewer` to `overmold.mjs`, `disc3d/viewer.mjs`, `bag3d/viewer.mjs`, `shape.mjs`, `profile.mjs`, `render`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10842844600526778 - nodes in this community are weakly interconnected._