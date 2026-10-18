# Graph Report - disc-atlas-halo-v2  (2026-10-18)

## Corpus Check
- 350 files · ~4,943,285 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 86 file(s) not represented in the graph (top: .log 50, .css 15, .ttf 8)

## Summary
- 2609 nodes · 5410 edges · 148 communities (118 shown, 30 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 197 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a227009d`
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
- photo-stamp-level-browser.mjs
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
- ref_node_test
- .zoom
- disc-features.mjs
- collection-scenes.js
- ref_node_assert
- bag-layout.mjs
- disc-albedo.mjs
- atlas-art.mjs
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
- ref_node_path
- halo-band-v2.mjs
- sites-env.sh
- atlas-depth.mjs
- bag-popup-browser.mjs
- bag-staging-browser.mjs
- vite.config.ts
- ref_node_module
- rack-motion.mjs
- atlas-layout.mjs
- bag-3d-browser.mjs
- bag-tweaks-browser.mjs
- atlas-layout.js
- pathlib
- atlas-speed-band.mjs
- atlas-speed-band-browser.mjs
- bag-animation-perf.mjs
- dropdown-indicator-browser.mjs
- apple-design-2-browser.mjs
- extract-discraft-batch2.py
- playwright
- atlas-groups.mjs
- bag-spin-pocket-browser.mjs
- mold
- photo-harness.mjs
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
- discraft-stamps-batch2-browser.mjs
- ref_node_http
- directory-layout-browser.mjs
- my-map-browser.mjs
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
- render
- prompt-4-leftovers-browser.mjs
- personal-map-worker.mjs
- next
- atlas-targets.js
- atlas-3d-perf.mjs
- shopping.js
- install-ci.sh
- bag-pulled-sizing.mjs
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- photo.mjs
- cloudflare-env.d.ts
- overrides
- drizzle-kit
- engines
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- add-menu-dismiss-browser.mjs
- grouping-zoom.mjs
- compose-discraft-fraction-proofs.py
- atlas-stamps-browser.mjs
- bag-memorial-browser.mjs
- photo-level-measure.mjs
- disc-webp.mjs

## God Nodes (most connected - your core abstractions)
1. `BagScene` - 63 edges
2. `scripts` - 56 edges
3. `createDiscViewer()` - 48 edges
4. `mountRacks()` - 36 edges
5. `mountBag()` - 35 edges
6. `render()` - 34 edges
7. `theme()` - 29 edges
8. `SceneView` - 29 edges
9. `AuditTests` - 29 edges
10. `createAtlasArt()` - 26 edges

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

## Communities (148 total, 30 thin omitted)

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

### Community 4 - "theme"
Cohesion: 0.06
Nodes (20): theme(), checks, {chromium}, errors, server, shots, {chromium}, server (+12 more)

### Community 5 - "scripts"
Cohesion: 0.04
Nodes (56): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+48 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.14
Nodes (27): encodeHalo(), albedoCanvas(), bandRatio(), canvasBitmap(), canvasBlob(), checkPhotoSize(), createPhotoEditor(), decodePhoto() (+19 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.05
Nodes (37): a, args, base(), brandCount, byId, cellPool(), cells, excludedIds (+29 more)

### Community 8 - "package.json"
Cohesion: 0.05
Nodes (40): name, packageManager, private, type, version, @base-ui/react, class-variance-authority, @cloudflare/vite-plugin (+32 more)

### Community 9 - "disc3d-popout-browser.mjs"
Cohesion: 0.07
Nodes (19): byName(), {chromium}, errors, server, settle(), show(), types, view() (+11 more)

### Community 10 - "photo-stamp-level-browser.mjs"
Cohesion: 0.25
Nodes (6): before, {chromium}, numbers, photos, server, types

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.07
Nodes (33): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+25 more)

### Community 12 - "initAtlasMap"
Cohesion: 0.18
Nodes (22): animateZoom(), boundedCamera(), cameraMoving(), changeZoom(), clearClusterTimers(), closeCluster(), initAtlasMap(), loadAtlasArt() (+14 more)

### Community 13 - "halo-plastic-browser.mjs"
Cohesion: 0.08
Nodes (23): HALO_FEATHER, chroma(), {chromium}, dE(), dist(), hex(), lab(), metrics (+15 more)

### Community 14 - "my-bag.js"
Cohesion: 0.07
Nodes (33): addMenu, addMenuOpen(), bagColorMap, bagHaloMap, bagHaloModelMap, bagPhotoMap, bagRimColorMap, catalogs (+25 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.07
Nodes (38): artZooming(), atlasPositions, CAMERA_AXES, cameraSpring, clusterPicks, comparisonMarkup(), comparisonPalette(), discArt() (+30 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.15
Nodes (34): camera(), bagRimColor(), angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), attach(), build() (+26 more)

### Community 18 - "SceneView"
Cohesion: 0.12
Nodes (6): clamp(), coarse(), NameTag, SceneView, softwareRenderer(), stage()

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.10
Nodes (34): stageMode(), advanceTime(), poseAt(), clamp(), desktopPulledLayout(), packing(), PHONE_PULLED_COUNT, PHONE_PULLED_MAX (+26 more)

### Community 20 - "mountRacks"
Cohesion: 0.22
Nodes (21): rackSlot(), rackX(), restHeight(), rowWidth(), mountRacks(), batchFor(), box(), drop() (+13 more)

### Community 22 - "overmold.mjs"
Cohesion: 0.22
Nodes (12): DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, isOvermold(), KEYS, LIST, OVERMOLD_DISCS, overmoldColors(), parseColor() (+4 more)

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.16
Nodes (19): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagLayout(), slotColor(), slotId() (+11 more)

### Community 24 - "bag-values.js"
Cohesion: 0.15
Nodes (21): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagPalette(), bagSlots(), DEFAULT_BAG_COLOR, defaultDiscDetails() (+13 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "LostScene"
Cohesion: 0.16
Nodes (7): rackCount(), CollectionScene, count(), esc(), LostScene, plural(), StorageScene

### Community 27 - "stage.mjs"
Cohesion: 0.13
Nodes (26): DISC_BUDGET, discColors(), discMaterial(), discModel(), parts, frontAt(), HALO_FORMAT, HALO_PLASTICS (+18 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.11
Nodes (19): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+11 more)

### Community 30 - ".zoom"
Cohesion: 0.16
Nodes (14): drawCompareHighlights(), fadeOut(), keepPinned(), mapMarkerScale(), markerLabel(), markerTarget(), photoMarkup(), renderMarkers() (+6 more)

### Community 31 - "disc-features.mjs"
Cohesion: 0.25
Nodes (11): DISC, attachDiscFeatures(), bagDiscGeometry(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot(), discGeometry() (+3 more)

### Community 32 - "collection-scenes.js"
Cohesion: 0.14
Nodes (21): ABOVE_GROUND, epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN, MAX_TURN (+13 more)

### Community 33 - "ref_node_assert"
Cohesion: 0.08
Nodes (14): output, server, checkContextHeader(), checkHeaderMenu(), checkThemePicker(), baseline, {chromium}, labelBaseline (+6 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.08
Nodes (39): assignSides(), BAG_BOX, brickRows(), byKey(), clamp(), depthOrder(), fan(), footprint() (+31 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.20
Nodes (25): bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress(), delightPixels() (+17 more)

### Community 36 - "atlas-art.mjs"
Cohesion: 0.14
Nodes (26): createAtlasArt(), dispose(), geometryOf(), get(), has(), render(), shapeOf(), touch() (+18 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "racks.mjs"
Cohesion: 0.10
Nodes (24): rackStyle(), BAYS_PER_TIER, CLASS_ORDER, pulledSpot(), RACK_DEPTH, RACK_GAP, RACK_HEIGHT, RACK_WIDTH (+16 more)

### Community 39 - "halo-swirl.mjs"
Cohesion: 0.17
Nodes (20): asymFront(), drawnFront(), [dye,wash,plate,ink], dyeShare(), enc(), fbm(), glared(), INK (+12 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.10
Nodes (7): isHalo(), apiSource, bagSource, closeSource, editorFixture(), saveSource, stampStubs

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.20
Nodes (18): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+10 more)

### Community 43 - "shape.mjs"
Cohesion: 0.14
Nodes (32): discParts(), clamp(), cubic(), DEFAULTS, discProfile(), domeCurve(), finite(), lerp() (+24 more)

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
Cohesion: 0.19
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
Cohesion: 0.18
Nodes (8): checks, {chromium}, errors, SCENE(), server, settled(), show(), VIEWPORTS

### Community 55 - "ref_node_path"
Cohesion: 0.08
Nodes (17): NpmCacheProgress, runNpmInstall(), projectRoot, {chromium}, server, by(), catalog, {chromium} (+9 more)

### Community 56 - "halo-band-v2.mjs"
Cohesion: 0.18
Nodes (13): FRONT_RING, ASYM_FEATHER, SEAM, dE(), delit(), disc(), enc(), L() (+5 more)

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
Cohesion: 0.18
Nodes (6): vinext, vite, readExecutionProfile(), cli, [command, ...args], localBindingConfig

### Community 62 - "ref_node_module"
Cohesion: 0.04
Nodes (38): {chromium}, server, {chromium}, errors, server, {chromium}, server, {chromium} (+30 more)

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
Cohesion: 0.10
Nodes (11): checks, {chromium}, errors, GOTO, MAIN, metrics, PUTTERS, server (+3 more)

### Community 67 - "atlas-layout.js"
Cohesion: 0.30
Nodes (9): adapt(), adaptStrength(), bandSlope(), bounds(), inBand(), positions(), scatter(), seed() (+1 more)

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

### Community 73 - "apple-design-2-browser.mjs"
Cohesion: 0.09
Nodes (16): checks, {chromium}, errors, only, server, types, assertRangeDrag(), checkRangeDefaults() (+8 more)

### Community 74 - "extract-discraft-batch2.py"
Cohesion: 0.23
Nodes (5): digest(), measure(), digest(), run(), slug()

### Community 76 - "atlas-groups.mjs"
Cohesion: 0.18
Nodes (8): area, build(), featured, footprints, items, label, worker, runtime

### Community 77 - "bag-spin-pocket-browser.mjs"
Cohesion: 0.18
Nodes (7): checks, {chromium}, errors, metrics, server, shots, THEMES

### Community 78 - "mold"
Cohesion: 0.22
Nodes (20): api(), chooseRackStyle(), endDrag(), focusFirst(), foundDisc(), gallery, loadBag(), lostScene (+12 more)

### Community 79 - "photo-harness.mjs"
Cohesion: 0.14
Nodes (12): output, data, results, results, baseline, characterize, ref, results (+4 more)

### Community 80 - "photo-albedo.mjs"
Cohesion: 0.24
Nodes (11): SOFTEN_GLARE, ab(), enc(), lin(), luma(), lumAt(), photo(), enc() (+3 more)

### Community 81 - "bag-demo-browser.mjs"
Cohesion: 0.20
Nodes (6): bagCalls, checks, {chromium}, errors, server, shots

### Community 82 - "bag-v13-browser.mjs"
Cohesion: 0.18
Nodes (7): checks, {chromium}, errors, server, shots, themes, widths

### Community 83 - "halo-band-sampling.mjs"
Cohesion: 0.24
Nodes (11): DYE, dE(), disc(), enc(), isDye(), L(), lab(), lch() (+3 more)

### Community 84 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

### Community 85 - "buildClusters"
Cohesion: 0.24
Nodes (13): buildClusters(), cancelRegroup(), ensureGroupWorker(), hydrateGaps(), hydrateGroups(), measureChrome(), measureFullLabels(), organicAtlas() (+5 more)

### Community 86 - "palette.mjs"
Cohesion: 0.22
Nodes (6): {chromium}, contrast(), errors, luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.08
Nodes (18): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+10 more)

### Community 88 - "mountGraveyard"
Cohesion: 0.24
Nodes (15): selected(), engraving(), mountGraveyard(), dress(), hover(), idAt(), layout(), makePlot() (+7 more)

### Community 89 - "profile.mjs"
Cohesion: 0.20
Nodes (11): CLAY_TONES, esc(), LABELS, n(), PROFILE_FRAME, profileDimensions(), profileSVG(), SPEC (+3 more)

### Community 91 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.05
Nodes (32): mold(), rated(), assignments, baseline, batch, {chromium}, controls, molds (+24 more)

### Community 92 - "ref_node_http"
Cohesion: 0.06
Nodes (18): checks, {chromium}, errors, only, server, types, checks, {chromium} (+10 more)

### Community 93 - "directory-layout-browser.mjs"
Cohesion: 0.18
Nodes (9): checks, {chromium}, desktop, errors, metrics, phone, server, shots (+1 more)

### Community 94 - "my-map-browser.mjs"
Cohesion: 0.18
Nodes (7): BAG, checks, {chromium}, errors, metrics, server, shots

### Community 95 - "draw"
Cohesion: 0.25
Nodes (9): artFrame(), draw(), drawPlanetLabels(), drawSatelliteLeaders(), focusFeatured(), measureMap(), setMapText(), shownPosition() (+1 more)

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

### Community 102 - "bag-pockets-browser.mjs"
Cohesion: 0.22
Nodes (6): {chromium}, errors, server, shots, themes, widths

### Community 103 - "schema.ts"
Cohesion: 0.33
Nodes (4): bagItems, coachUsage, profiles, drizzle-orm

### Community 104 - "account.js"
Cohesion: 0.52
Nodes (5): api(), refresh(), renderPage(), signOut(), sync()

### Community 105 - "render"
Cohesion: 0.16
Nodes (17): activateBag(), closeBagTips(), directory(), esc(), isDemo(), leaveBag(), lostItems(), memorialWall() (+9 more)

### Community 106 - "prompt-4-leftovers-browser.mjs"
Cohesion: 0.12
Nodes (11): baselines, {chromium}, command(), live, sql(), start(), pause(), pw (+3 more)

### Community 107 - "personal-map-worker.mjs"
Cohesion: 0.29
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

### Community 111 - "shopping.js"
Cohesion: 0.70
Nodes (4): offers(), render(), row(), tracking()

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 113 - "bag-pulled-sizing.mjs"
Cohesion: 0.25
Nodes (5): bag, blocks, entries, phone, viewport

### Community 115 - "0000_powerful_pepper_potts.sql"
Cohesion: 0.50
Nodes (3): `bag_items`, `coach_usage`, `profiles`

### Community 116 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 117 - "photo.mjs"
Cohesion: 0.43
Nodes (5): acquirePhoto(), cache, photoGeometry(), photoSurface(), reliefTexture()

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 140 - "add-menu-dismiss-browser.mjs"
Cohesion: 0.29
Nodes (5): checks, {chromium}, errors, server, types

### Community 141 - "grouping-zoom.mjs"
Cohesion: 0.58
Nodes (6): checkGroupingZoom(), checkLowZoomLabels(), checkZoomCandidates(), frameBand(), measureBand(), settleMap()

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 143 - "atlas-stamps-browser.mjs"
Cohesion: 0.29
Nodes (6): {chromium}, errors, originals, requests, result, server

### Community 144 - "bag-memorial-browser.mjs"
Cohesion: 0.25
Nodes (5): {chromium}, errors, server, shots, themes

### Community 148 - "photo-level-measure.mjs"
Cohesion: 0.43
Nodes (4): angleOf(), luma(), renderedStampAngle(), stampAngle()

### Community 149 - "disc-webp.mjs"
Cohesion: 0.33
Nodes (3): fallbackWebP(), encodeWebP(), loadEncoder()

## Knowledge Gaps
- **52 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1189 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jose` connect `workers/auth.mjs` to `package.json`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05759623861298854 - nodes in this community are weakly interconnected._
- **Why does `inCollection()` connect `app.js` to `bag-tweaks-browser.mjs`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `workers/auth.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05189189189189189 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10434782608695652 - nodes in this community are weakly interconnected._