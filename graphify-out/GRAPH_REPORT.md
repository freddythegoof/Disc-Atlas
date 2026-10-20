# Graph Report - disc-atlas  (2026-10-19)

## Corpus Check
- 350 files · ~5,234,357 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 86 file(s) not represented in the graph (top: .log 50, .css 15, .ttf 8)

## Summary
- 2582 nodes · 5392 edges · 142 communities (112 shown, 30 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 219 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `faedb5e4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- workers/auth.mjs
- Bag scene
- bag.js
- ref_node_https
- scripts
- disc-photo.mjs
- sampling-audit-draw.mjs
- package.json
- disc3d-popout-browser.mjs
- dropdown-indicator-browser.mjs
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
- disc3d/viewer.mjs
- Account and bag SQL schema
- scheduleMapDraw
- bag-spin-pocket-browser.mjs
- lens-corner-browser.mjs
- collection-scenes.js
- ref_node_assert
- bag-layout.mjs
- disc-albedo.mjs
- stage.mjs
- devDependencies
- racks.mjs
- halo-swirl.mjs
- photo-editor-races.mjs
- compilerOptions
- atlas-groups.js
- shape.mjs
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
- my-map-browser.mjs
- halo-band-v2.mjs
- sites-env.sh
- atlas-depth.mjs
- bag-popup-browser.mjs
- bag-scene-browser.mjs
- vite.config.ts
- state
- rack-motion.mjs
- atlas-layout.mjs
- bag-3d-browser.mjs
- bag-tweaks-browser.mjs
- apple-design-3-browser.mjs
- pathlib
- atlas-speed-band.mjs
- atlas-speed-band-browser.mjs
- ref_node_child_process
- ref_node_module
- apple-design-2-browser.mjs
- extract-discraft-batch2.py
- playwright
- renderMarkers
- slider-drag-browser.mjs
- mold
- ref_node_fs
- photo-albedo.mjs
- bag-demo-browser.mjs
- disc-features.mjs
- halo-band-sampling.mjs
- atlas-organic.mjs
- buildClusters
- palette.mjs
- discraft-fraction-audit-browser.mjs
- mountGraveyard
- atlas-targets.mjs
- StampManifestTests
- discraft-stamps-batch2-browser.mjs
- ref_node_path
- directory-layout-browser.mjs
- atlas-intro-reveal-browser.mjs
- draw
- atlas-motion.js
- coach.js
- bag-collections-browser.mjs
- install-pnpm.sh
- discraft_batch2_test.py
- stamp_fraction_audit_test.py
- schema.ts
- account.js
- render
- prompt-4-leftovers-browser.mjs
- ref_node_vm
- next
- atlas-targets.js
- atlas-3d-perf.mjs
- install-ci.sh
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

## Communities (142 total, 30 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (79): activeLens(), addDestinationControl(), applyTheme(), atlasPriority(), bagColors(), brandColor(), brandList(), brandPalette (+71 more)

### Community 1 - "workers/auth.mjs"
Cohesion: 0.05
Nodes (50): jose, delete(), fixture(), item, setup(), database(), setup(), googleFetch (+42 more)

### Community 2 - "Bag scene"
Cohesion: 0.11
Nodes (7): accent(), BAG_SPRING, BagScene, div(), loadViewer(), POCKET, reduced()

### Community 3 - "bag.js"
Cohesion: 0.10
Nodes (49): dynamic, GET(), GET(), DELETE(), photoBytes(), POST(), PUT(), save() (+41 more)

### Community 4 - "ref_node_https"
Cohesion: 0.04
Nodes (35): theme(), {chromium}, server, checks, {chromium}, errors, server, shots (+27 more)

### Community 5 - "scripts"
Cohesion: 0.04
Nodes (57): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+49 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.12
Nodes (28): encodeHalo(), albedoCanvas(), bandRatio(), canvasBitmap(), canvasBlob(), checkPhotoSize(), createPhotoEditor(), decodePhoto() (+20 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.05
Nodes (37): a, args, base(), brandCount, byId, cellPool(), cells, excludedIds (+29 more)

### Community 8 - "package.json"
Cohesion: 0.05
Nodes (40): name, packageManager, private, type, version, @base-ui/react, class-variance-authority, @cloudflare/vite-plugin (+32 more)

### Community 9 - "disc3d-popout-browser.mjs"
Cohesion: 0.07
Nodes (19): byName(), {chromium}, errors, server, settle(), show(), types, view() (+11 more)

### Community 10 - "dropdown-indicator-browser.mjs"
Cohesion: 0.17
Nodes (9): checks, {chromium}, command(), controls, errors, server, shots, THEMES (+1 more)

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.07
Nodes (33): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+25 more)

### Community 12 - "initAtlasMap"
Cohesion: 0.17
Nodes (21): animateZoom(), boundedCamera(), cameraMoving(), catchAtlasIntro(), changeZoom(), clearClusterTimers(), closeCluster(), initAtlasMap() (+13 more)

### Community 13 - "halo-plastic-browser.mjs"
Cohesion: 0.09
Nodes (25): SEAM, chroma(), {chromium}, command(), dE(), dist(), hex(), lab() (+17 more)

### Community 14 - "my-bag.js"
Cohesion: 0.07
Nodes (33): addMenu, addMenuOpen(), bagColorMap, bagHaloMap, bagHaloModelMap, bagPhotoMap, bagRimColorMap, catalogs (+25 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.09
Nodes (27): atlasPositions, CAMERA_AXES, cameraSpring, clusterPicks, discArt(), dropMarkerArt(), edgeFeedback, fullLabelFootprints (+19 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.17
Nodes (32): angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), attach(), build(), cancelRim(), dispose() (+24 more)

### Community 18 - "SceneView"
Cohesion: 0.14
Nodes (3): clamp(), NameTag, SceneView

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.08
Nodes (39): stageMode(), advanceTime(), poseAt(), clamp(), desktopPulledLayout(), packing(), PHONE_PULLED_COUNT, PHONE_PULLED_MAX (+31 more)

### Community 20 - "mountRacks"
Cohesion: 0.22
Nodes (21): rackSlot(), rackX(), restHeight(), rowWidth(), mountRacks(), batchFor(), box(), drop() (+13 more)

### Community 22 - "overmold.mjs"
Cohesion: 0.20
Nodes (13): DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, isOvermold(), KEYS, LIST, OVERMOLD_DISCS, overmoldColors(), parseColor() (+5 more)

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.18
Nodes (16): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagComparator(), rackOrder(), haloBand() (+8 more)

### Community 24 - "bag-values.js"
Cohesion: 0.15
Nodes (21): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagClass(), bagPalette(), bagSlots(), DEFAULT_BAG_COLOR (+13 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "LostScene"
Cohesion: 0.18
Nodes (5): rackCount(), CollectionScene, esc(), LostScene, StorageScene

### Community 27 - "disc3d/viewer.mjs"
Cohesion: 0.14
Nodes (21): HALO_FEATHER, HALO_FORMAT, HALO_RING, HALO_STREAKS, NAMES, parseHalo(), haloCoord(), linear() (+13 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.11
Nodes (19): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+11 more)

### Community 29 - "scheduleMapDraw"
Cohesion: 0.22
Nodes (11): artZooming(), drawGaps(), gapName(), gapSprite(), gapTarget(), keepPinnedGaps(), levelHeld(), mapTargets() (+3 more)

### Community 30 - "bag-spin-pocket-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, metrics, server, shots, THEMES

### Community 31 - "lens-corner-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, server, shots, THEMES, WIDTHS (+1 more)

### Community 32 - "collection-scenes.js"
Cohesion: 0.18
Nodes (16): RACK_STYLES, epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN, MAX_TURN (+8 more)

### Community 33 - "ref_node_assert"
Cohesion: 0.07
Nodes (11): {chromium}, command(), errors, server, shots, themes, widths, verifyPhotoDecode() (+3 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.07
Nodes (42): assignSides(), BAG_BOX, bagLayout(), brickRows(), byKey(), clamp(), depthOrder(), fan() (+34 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.20
Nodes (25): bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress(), delightPixels() (+17 more)

### Community 36 - "stage.mjs"
Cohesion: 0.13
Nodes (35): coarse(), DISC_BUDGET, discColors(), discMaterial(), discModel(), parts, softwareRenderer(), stage() (+27 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "racks.mjs"
Cohesion: 0.10
Nodes (24): BAYS_PER_TIER, CLASS_ORDER, pulledSpot(), RACK_CAPACITY, RACK_DEPTH, RACK_GAP, RACK_HEIGHT, RACK_WIDTH (+16 more)

### Community 39 - "halo-swirl.mjs"
Cohesion: 0.16
Nodes (21): asymFront(), drawnFront(), DYE, [dye,wash,plate,ink], dyeShare(), enc(), fbm(), glared() (+13 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.10
Nodes (7): isHalo(), apiSource, bagSource, closeSource, editorFixture(), saveSource, stampStubs

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.20
Nodes (17): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+9 more)

### Community 43 - "shape.mjs"
Cohesion: 0.09
Nodes (45): bagDiscGeometry(), discParts(), HALO_PLASTICS, photoGeometry(), CLAY_TONES, esc(), LABELS, n() (+37 more)

### Community 44 - "personal-lens.mjs"
Cohesion: 0.39
Nodes (6): syncMyMap(), COPY_BIAS_SHIFT, moldShifts(), personalPositions(), context, molds

### Community 45 - "bag-interactions-browser.mjs"
Cohesion: 0.11
Nodes (12): checks, {chromium}, command(), errors, GOTO, MAIN, metrics, PUTTERS (+4 more)

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
Nodes (13): checks, {chromium}, clickLands(), completeDot(), errors, mapOwned(), onMap(), READABLE() (+5 more)

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
Cohesion: 0.15
Nodes (14): dotArtRadius(), drawCompareHighlights(), keepPinned(), mapMarkerScale(), markerLabel(), markerTarget(), checks, {chromium} (+6 more)

### Community 55 - "my-map-browser.mjs"
Cohesion: 0.18
Nodes (8): BAG, checks, {chromium}, command(), errors, metrics, server, shots

### Community 56 - "halo-band-v2.mjs"
Cohesion: 0.18
Nodes (13): frontAt(), FRONT_RING, ASYM_FEATHER, dE(), delit(), disc(), enc(), L() (+5 more)

### Community 57 - "sites-env.sh"
Cohesion: 0.14
Nodes (13): HOME, MINIFLARE_REGISTRY_PATH, npm_config_audit, npm_config_cache, npm_config_fund, npm_config_update_notifier, sites-env.sh script, SITES_ENV_READY (+5 more)

### Community 58 - "atlas-depth.mjs"
Cohesion: 0.15
Nodes (9): boxes(), CHROME, discs, LEVELS, positions, prints, rooms(), runtime (+1 more)

### Community 59 - "bag-popup-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 60 - "bag-scene-browser.mjs"
Cohesion: 0.22
Nodes (7): {chromium}, command(), errors, metrics, server, themes, widths

### Community 61 - "vite.config.ts"
Cohesion: 0.25
Nodes (3): vinext, vite, localBindingConfig

### Community 62 - "state"
Cohesion: 0.07
Nodes (22): {chromium}, command(), errors, server, state(), {chromium}, command(), server (+14 more)

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

### Community 71 - "ref_node_child_process"
Cohesion: 0.07
Nodes (19): readExecutionProfile(), cli, [command, ...args], baseline, {chromium}, photos, profile, server (+11 more)

### Community 72 - "ref_node_module"
Cohesion: 0.07
Nodes (15): {chromium}, command(), errors, server, shots, themes, {chromium}, errors (+7 more)

### Community 73 - "apple-design-2-browser.mjs"
Cohesion: 0.13
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 74 - "extract-discraft-batch2.py"
Cohesion: 0.23
Nodes (5): digest(), measure(), digest(), run(), slug()

### Community 76 - "renderMarkers"
Cohesion: 0.29
Nodes (8): comparisonMarkup(), comparisonPalette(), fadeOut(), photoMarkup(), renderCluster(), renderMarkers(), selectedGroup(), selected()

### Community 77 - "slider-drag-browser.mjs"
Cohesion: 0.24
Nodes (10): assertRangeDrag(), checkRangeDefaults(), dragRange(), {chromium}, errors, probe(), results, server (+2 more)

### Community 78 - "mold"
Cohesion: 0.19
Nodes (22): rackStyle(), api(), chooseRackStyle(), endDrag(), focusFirst(), foundDisc(), gallery, loadBag() (+14 more)

### Community 79 - "ref_node_fs"
Cohesion: 0.16
Nodes (12): output, data, results, results, baseline, characterize, ref, results (+4 more)

### Community 80 - "photo-albedo.mjs"
Cohesion: 0.24
Nodes (11): SOFTEN_GLARE, ab(), enc(), lin(), luma(), lumAt(), photo(), enc() (+3 more)

### Community 81 - "bag-demo-browser.mjs"
Cohesion: 0.20
Nodes (7): bagCalls, checks, {chromium}, command(), errors, server, shots

### Community 82 - "disc-features.mjs"
Cohesion: 0.46
Nodes (6): DISC, attachDiscFeatures(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot()

### Community 83 - "halo-band-sampling.mjs"
Cohesion: 0.27
Nodes (10): dE(), disc(), enc(), isDye(), L(), lab(), lch(), lin() (+2 more)

### Community 84 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

### Community 85 - "buildClusters"
Cohesion: 0.31
Nodes (11): buildClusters(), cancelRegroup(), ensureGroupWorker(), hydrateGaps(), hydrateGroups(), measureChrome(), measureFullLabels(), organicAtlas() (+3 more)

### Community 86 - "palette.mjs"
Cohesion: 0.22
Nodes (6): {chromium}, contrast(), errors, luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.07
Nodes (22): offers(), render(), row(), tracking(), canvases, {chromium}, controls, mainFiles (+14 more)

### Community 88 - "mountGraveyard"
Cohesion: 0.15
Nodes (21): ABOVE_GROUND, engraving(), mountGraveyard(), dress(), hover(), idAt(), layout(), makePlot() (+13 more)

### Community 91 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.04
Nodes (36): {chromium}, command(), metrics, server, mold(), rated(), assignments, baseline (+28 more)

### Community 92 - "ref_node_path"
Cohesion: 0.04
Nodes (41): output, server, NpmCacheProgress, runNpmInstall(), projectRoot, checks, {chromium}, errors (+33 more)

### Community 93 - "directory-layout-browser.mjs"
Cohesion: 0.18
Nodes (9): checks, {chromium}, desktop, errors, metrics, phone, server, shots (+1 more)

### Community 94 - "atlas-intro-reveal-browser.mjs"
Cohesion: 0.20
Nodes (7): camera(), {chromium}, errors, pixelFailures, report, server, png()

### Community 95 - "draw"
Cohesion: 0.26
Nodes (12): artFrame(), draw(), drawSatelliteLeaders(), featuredDisc(), focusFeatured(), immersiveMap(), measureMap(), presentAtlas() (+4 more)

### Community 96 - "atlas-motion.js"
Cohesion: 0.32
Nodes (3): dismiss(), reveal(), slide()

### Community 97 - "coach.js"
Cohesion: 0.50
Nodes (7): allowance(), api(), append(), appendDraft(), open(), render(), reset()

### Community 98 - "bag-collections-browser.mjs"
Cohesion: 0.18
Nodes (9): {chromium}, COLORS, command(), errors, MOLDS, PLASTICS, report, server (+1 more)

### Community 99 - "install-pnpm.sh"
Cohesion: 0.39
Nodes (7): acquire_shared_lock(), can_write_directory(), release_shared_lock(), report_store(), install-pnpm.sh script, XDG_CACHE_HOME, XDG_DATA_HOME

### Community 103 - "schema.ts"
Cohesion: 0.33
Nodes (4): bagItems, coachUsage, profiles, drizzle-orm

### Community 104 - "account.js"
Cohesion: 0.52
Nodes (5): api(), refresh(), renderPage(), signOut(), sync()

### Community 105 - "render"
Cohesion: 0.15
Nodes (18): pocketLabel(), stabilityBiasLabel(), activateBag(), closeBagTips(), directory(), isDemo(), leaveBag(), lostItems() (+10 more)

### Community 106 - "prompt-4-leftovers-browser.mjs"
Cohesion: 0.18
Nodes (5): pause(), pw, report, selectDisc(), server

### Community 107 - "ref_node_vm"
Cohesion: 0.20
Nodes (4): ids, items, worker(), runtime

### Community 108 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 109 - "atlas-targets.js"
Cohesion: 0.53
Nodes (4): inBox(), pick(), reach(), reads()

### Community 110 - "atlas-3d-perf.mjs"
Cohesion: 0.43
Nodes (7): decide(), deviceReps(), DEVICES, FLIGHT(), main(), median(), parseReps()

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

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
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1152 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jose` connect `workers/auth.mjs` to `package.json`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.059876543209876544 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `workers/auth.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05189189189189189 - nodes in this community are weakly interconnected._
- **Why does `inCollection()` connect `app.js` to `bag-tweaks-browser.mjs`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10842844600526778 - nodes in this community are weakly interconnected._