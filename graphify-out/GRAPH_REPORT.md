# Graph Report - atlas-smoothness  (2026-10-26)

## Corpus Check
- 462 files · ~5,581,657 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 314 file(s) not represented in the graph (top: .log 239, .gz 23, .css 16)

## Summary
- 3143 nodes · 6728 edges · 178 communities (144 shown, 34 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 255 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8bf0ec1f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- workers/auth.mjs
- Bag scene
- bag.js
- state
- scripts
- disc-photo.mjs
- sampling-audit-draw.mjs
- package.json
- disc3d-popout-browser.mjs
- LostScene
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
- json
- halo-swirl.mjs
- all-discs-gallery.js
- bag-values.js
- dependencies
- collection-scenes.js
- public/disc-stamp-delight.mjs
- Account and bag SQL schema
- atlas-gesture-probe.mjs
- racks.mjs
- clear-true-color-browser.mjs
- pnpm-install.mjs
- bag-3d-browser.mjs
- bag-layout.mjs
- disc-albedo.mjs
- .zoom
- devDependencies
- photo-stamps.mjs
- ref_node_module
- photo-editor-races.mjs
- compilerOptions
- atlas-groups.js
- mountRacks
- personal-lens.mjs
- bag-interactions-browser.mjs
- components.json
- Detail and pop-out viewer bridge
- photo-true-color.mjs
- api.cjs
- public/disc-stamp-extract.mjs
- atlas-organic-browser.mjs
- Catalog generation and stamp validation
- about-hero.js
- .zoom
- ref_node_child_process
- halo-band-v2.mjs
- sites-env.sh
- atlas-depth.mjs
- accent-done-button-evidence.mjs
- theme
- vite.config.ts
- mountGraveyard
- disc3d/viewer.mjs
- atlas-layout.mjs
- Page
- my-map-browser.mjs
- workers/bag.mjs
- pathlib
- tests/disc-stamp-clear.mjs
- atlas-speed-band-browser.mjs
- atlas-depth-browser.mjs
- atlas-speed-band.mjs
- photo-stamp-identity-browser.mjs
- display-palette.mjs
- stamps.mjs
- bag-staging-browser.mjs
- slider-drag-browser.mjs
- ref_node_vm
- ref_node_assert
- photo-albedo.mjs
- rack-motion.mjs
- renderMarkers
- halo-band-sampling.mjs
- public/disc-stamp-color.mjs
- buildClusters
- palette.mjs
- discraft-fraction-audit-browser.mjs
- lens-corner-browser.mjs
- bag-spin-pocket-browser.mjs
- StampManifestTests
- discraft-stamps-batch2-browser.mjs
- apple-design-2-browser.mjs
- render
- display-palette.js
- draw
- atlas-motion.js
- coach.js
- bag-popup-browser.mjs
- install-pnpm.sh
- discraft_batch2_test.py
- stamp_fraction_audit_test.py
- bag-collections-browser.mjs
- schema.ts
- account.js
- bag-animation-perf.mjs
- prompt-4-leftovers-browser.mjs
- stamp.mjs
- next
- atlas-targets.js
- bag-tweaks-browser.mjs
- apple-design-3-browser.mjs
- install-ci.sh
- ref_node_test
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- HttpCache
- cloudflare-env.d.ts
- overrides
- NameTag
- DiscmaniaIdentity
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- bag-v13-browser.mjs
- public/disc-stamp-clear.mjs
- compose-discraft-fraction-proofs.py
- shopping.js
- bag-demo-browser.mjs
- tests/disc-stamp-color.mjs
- photo-stamp-color-assets-browser.mjs
- photo-level-measure.mjs
- atlas-organic.mjs
- photo-stamp-stall-browser.mjs
- photo-stamp-color-assets-evidence.mjs
- organicAtlas
- atlas-lod.mjs
- display-harness.mjs
- disc-appearance-browser.mjs
- more-packs-evidence.mjs
- drawGaps
- atlas-3d-perf.mjs
- display-customization-browser.mjs
- bag-scene-browser.mjs
- display-customization-evidence.mjs
- photo-stamp-sync.mjs
- photo-stamp-sync-browser.mjs
- tests/disc-stamp-delight.mjs
- photo-stamp-one-click-evidence.mjs
- photo-stamp-assets-evidence.mjs
- overmold.mjs
- public.mjs
- atlas-targets.mjs
- photo-stamp-one-click-browser.mjs
- workers/coach.mjs
- ref_node_path
- tests/disc-stamp-extract.mjs
- photo.mjs

## God Nodes (most connected - your core abstractions)
1. `createDiscViewer()` - 66 edges
2. `scripts` - 63 edges
3. `BagScene` - 63 edges
4. `mountRacks()` - 44 edges
5. `mountBag()` - 43 edges
6. `createAtlasArt()` - 36 edges
7. `render()` - 35 edges
8. `theme()` - 34 edges
9. `state()` - 32 edges
10. `discModel()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `layout()` --indirect_call--> `columns()`  [INFERRED]
  public/collection3d/graveyard.mjs → tests/bag-3d-layout.mjs
- `sampled()` --calls--> `delightPixels()`  [EXTRACTED]
  tests/halo-band-sampling.mjs → public/disc-albedo.mjs
- `editorFixture()` --indirect_call--> `isHalo()`  [INFERRED]
  tests/photo-editor-races.mjs → public/disc3d/halo.mjs
- `createBag()` --calls--> `validateDiscDetails()`  [EXTRACTED]
  workers/bag.mjs → public/bag-values.js
- `createBag()` --calls--> `validateBagSettings()`  [EXTRACTED]
  workers/bag.mjs → public/bag-values.js

## Import Cycles
- None detected.

## Communities (178 total, 34 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (80): activeLens(), addDestinationControl(), applyTheme(), atlasPriority(), bagColors(), brandColor(), brandList(), brandPalette (+72 more)

### Community 1 - "workers/auth.mjs"
Cohesion: 0.21
Nodes (19): base64url(), body(), cookie(), createAuth(), account(), callback(), session(), start() (+11 more)

### Community 2 - "Bag scene"
Cohesion: 0.10
Nodes (11): accent(), BAG_SPRING, BagScene, div(), loadViewer(), POCKET, reduced(), stampStyle() (+3 more)

### Community 3 - "bag.js"
Cohesion: 0.10
Nodes (49): dynamic, GET(), GET(), DELETE(), photoBytes(), POST(), PUT(), save() (+41 more)

### Community 4 - "state"
Cohesion: 0.06
Nodes (26): {chromium}, command(), errors, server, state(), command(), {chromium}, command() (+18 more)

### Community 5 - "scripts"
Cohesion: 0.03
Nodes (63): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+55 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.08
Nodes (41): encodeHalo(), photoLook(), albedoCanvas(), canvasBitmap(), canvasBlob(), checkPhotoSize(), colorStampBlob(), createPhotoEditor() (+33 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.10
Nodes (23): a, args, base(), brandCount, byId, cellPool(), cells, excludedIds (+15 more)

### Community 8 - "package.json"
Cohesion: 0.04
Nodes (44): engines, node, name, packageManager, private, type, version, @base-ui/react (+36 more)

### Community 9 - "disc3d-popout-browser.mjs"
Cohesion: 0.07
Nodes (19): byName(), {chromium}, errors, server, settle(), show(), types, view() (+11 more)

### Community 10 - "LostScene"
Cohesion: 0.19
Nodes (5): rackCount(), CollectionScene, esc(), LostScene, StorageScene

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.10
Nodes (29): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+21 more)

### Community 12 - "initAtlasMap"
Cohesion: 0.22
Nodes (20): animateZoom(), boundedCamera(), cameraMoving(), catchAtlasIntro(), changeZoom(), immersiveMap(), initAtlasMap(), introCreep() (+12 more)

### Community 13 - "halo-plastic-browser.mjs"
Cohesion: 0.09
Nodes (24): chroma(), {chromium}, command(), dE(), dist(), hex(), lab(), metrics (+16 more)

### Community 14 - "my-bag.js"
Cohesion: 0.06
Nodes (43): isHalo(), addMenu, addMenuOpen(), bagColorMap, bagFinishMap, bagHaloMap, bagHaloModelMap, bagPhotoMap (+35 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.07
Nodes (33): atlasPositions, CAMERA_AXES, cameraSpring, clearClusterTimers(), closeCluster(), clusterPicks, comparisonMarkup(), comparisonPalette() (+25 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.14
Nodes (39): lightTheme(), angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), applyTurn(), attach(), build() (+31 more)

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.07
Nodes (40): stageMode(), attachDiscFeatures(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot(), advanceTime(), poseAt() (+32 more)

### Community 20 - "accent-follows-appearance-evidence.mjs"
Cohesion: 0.15
Nodes (20): BEFORE, box(), CHOSEN, clip(), closeMenu(), compose(), LIME, load() (+12 more)

### Community 21 - "json"
Cohesion: 0.13
Nodes (4): main(), slug(), tile(), Validator

### Community 22 - "halo-swirl.mjs"
Cohesion: 0.15
Nodes (22): ASYM_FEATHER, asymFront(), drawnFront(), [dye,wash,plate,ink], dyeShare(), enc(), fbm(), glared() (+14 more)

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.19
Nodes (17): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagClass(), bagComparator(), rackOrder() (+9 more)

### Community 24 - "bag-values.js"
Cohesion: 0.15
Nodes (21): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagPalette(), bagSlots(), DEFAULT_BAG_COLOR, defaultDiscDetails() (+13 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "collection-scenes.js"
Cohesion: 0.17
Nodes (17): RACK_STYLES, epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN, MAX_TURN (+9 more)

### Community 27 - "public/disc-stamp-delight.mjs"
Cohesion: 0.18
Nodes (20): box(), CLONE_STEPS, cloneCores(), delightStamp(), distanceTo(), encode(), f(), fillHoles() (+12 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.10
Nodes (23): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+15 more)

### Community 29 - "atlas-gesture-probe.mjs"
Cohesion: 0.14
Nodes (16): args, at(), {chromium}, dpr, errors, GESTURES, intro(), open() (+8 more)

### Community 30 - "racks.mjs"
Cohesion: 0.09
Nodes (25): rackStyle(), BAYS_PER_TIER, CLASS_ORDER, pulledSpot(), RACK_DEPTH, RACK_GAP, RACK_HEIGHT, RACK_WIDTH (+17 more)

### Community 31 - "clear-true-color-browser.mjs"
Cohesion: 0.12
Nodes (21): asset, dE(), flag, haveRaptor, hex(), hsv(), lab(), med() (+13 more)

### Community 32 - "pnpm-install.mjs"
Cohesion: 0.09
Nodes (17): NpmCacheProgress, runNpmInstall(), CACHE_SEEDS, holdInstallLocks(), InstallProgress, main(), openLock(), openReport() (+9 more)

### Community 33 - "bag-3d-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, perf, server, shots, themes (+1 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.07
Nodes (43): assignSides(), BAG_BOX, bagLayout(), brickRows(), byKey(), clamp(), depthOrder(), DISC (+35 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.16
Nodes (30): bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress(), delightPixels() (+22 more)

### Community 36 - ".zoom"
Cohesion: 0.14
Nodes (14): SCENE(), checks, {chromium}, clickLands(), completeDot(), errors, mapOwned(), onMap() (+6 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "photo-stamps.mjs"
Cohesion: 0.16
Nodes (30): account(), adoptUp(), api(), blobOf(), broken, cached(), changed(), coloured() (+22 more)

### Community 39 - "ref_node_module"
Cohesion: 0.10
Nodes (11): {chromium}, errors, report, server, {chromium}, errors, metrics, server (+3 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.11
Nodes (5): apiSource, bagSource, closeSource, saveSource, stampStubs

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.20
Nodes (17): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+9 more)

### Community 43 - "mountRacks"
Cohesion: 0.18
Nodes (25): dress(), rackX(), rowWidth(), mountRacks(), batchFor(), box(), drop(), dropBatch() (+17 more)

### Community 44 - "personal-lens.mjs"
Cohesion: 0.16
Nodes (14): activateBag(), closeBagTips(), directory(), leaveBag(), positionBagTips(), setBagView(), sync(), syncMyMap() (+6 more)

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
Cohesion: 0.16
Nodes (16): applyClearPhotoRows(), clearPhotoPixels(), EDGE, edgeRadius(), fitCircle(), hexBytes(), labOf(), planClearPhoto() (+8 more)

### Community 49 - "api.cjs"
Cohesion: 0.12
Nodes (11): assert, {createRequire}, fs, {Miniflare}, req, root, assert, ctx (+3 more)

### Community 50 - "public/disc-stamp-extract.mjs"
Cohesion: 0.27
Nodes (13): close(), components(), distanceTo(), extractPhotoStamp(), fillFromRing(), gaussian(), hexToLab(), hysteresis() (+5 more)

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
Cohesion: 0.04
Nodes (32): readExecutionProfile(), cli, [command, ...args], {chromium}, server, {chromium}, command(), server (+24 more)

### Community 56 - "halo-band-v2.mjs"
Cohesion: 0.13
Nodes (18): frontAt(), HALO_FEATHER, HALO_FORMAT, HALO_PLASTICS, HALO_RING, HALO_STREAKS, NAMES, FRONT_RING (+10 more)

### Community 57 - "sites-env.sh"
Cohesion: 0.14
Nodes (13): HOME, MINIFLARE_REGISTRY_PATH, npm_config_audit, npm_config_cache, npm_config_fund, npm_config_update_notifier, sites-env.sh script, SITES_ENV_READY (+5 more)

### Community 58 - "atlas-depth.mjs"
Cohesion: 0.15
Nodes (9): boxes(), CHROME, discs, LEVELS, positions, prints, rooms(), runtime (+1 more)

### Community 59 - "accent-done-button-evidence.mjs"
Cohesion: 0.15
Nodes (15): ACCENTS, actions(), BEFORE, CHOSEN, closeSheet(), doneStates(), load(), openSheet() (+7 more)

### Community 60 - "theme"
Cohesion: 0.07
Nodes (22): theme(), checks, {chromium}, errors, server, types, {chromium}, pages (+14 more)

### Community 61 - "vite.config.ts"
Cohesion: 0.25
Nodes (3): vinext, vite, localBindingConfig

### Community 62 - "mountGraveyard"
Cohesion: 0.17
Nodes (19): ABOVE_GROUND, engraving(), plots(), mountGraveyard(), hover(), idAt(), layout(), makePlot() (+11 more)

### Community 63 - "disc3d/viewer.mjs"
Cohesion: 0.09
Nodes (55): coarse(), DISC_BUDGET, discMaterial(), discModel(), parts, personalStampStyle(), softwareRenderer(), stage() (+47 more)

### Community 64 - "atlas-layout.mjs"
Cohesion: 0.19
Nodes (9): catalogBase, context, filters(), fixtures, random(), rated, score(), sizes (+1 more)

### Community 66 - "my-map-browser.mjs"
Cohesion: 0.18
Nodes (8): BAG, checks, {chromium}, command(), errors, metrics, server, shots

### Community 67 - "workers/bag.mjs"
Cohesion: 0.14
Nodes (12): validateUpload(), fixture(), chunk(), extended(), fixture(), fixture(), byId, createBag() (+4 more)

### Community 68 - "pathlib"
Cohesion: 0.12
Nodes (8): digest(), measure(), extract(), slug(), digest(), run(), slug(), extract()

### Community 69 - "tests/disc-stamp-clear.mjs"
Cohesion: 0.18
Nodes (14): clearPhoto(), disc(), GLARE, glareCase(), HAIR, inBox(), NAVY, NAVY_BOX (+6 more)

### Community 70 - "atlas-speed-band-browser.mjs"
Cohesion: 0.18
Nodes (10): CAMERAS, {chromium}, errors, failures, RENDERED(), server, settled(), show() (+2 more)

### Community 71 - "atlas-depth-browser.mjs"
Cohesion: 0.12
Nodes (13): CAMERAS, checks, {chromium}, clean(), errors, gapArt(), server, settled() (+5 more)

### Community 72 - "atlas-speed-band.mjs"
Cohesion: 0.18
Nodes (9): base, CHROME, off(), prints, rated, runtime, SIZES, STATES (+1 more)

### Community 73 - "photo-stamp-identity-browser.mjs"
Cohesion: 0.11
Nodes (13): {chromium}, ink(), server, at, baseline, compare(), noise, runs (+5 more)

### Community 74 - "display-palette.mjs"
Cohesion: 0.23
Nodes (12): contrast(), distance(), lab(), linear(), luminance(), MATRICES, minDistance(), oklch() (+4 more)

### Community 75 - "stamps.mjs"
Cohesion: 0.23
Nodes (14): body(), json(), LOOKS, owned(), part(), placed(), PNG_CHUNKS, shape() (+6 more)

### Community 76 - "bag-staging-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 77 - "slider-drag-browser.mjs"
Cohesion: 0.24
Nodes (10): assertRangeDrag(), checkRangeDefaults(), dragRange(), {chromium}, errors, probe(), results, server (+2 more)

### Community 78 - "ref_node_vm"
Cohesion: 0.20
Nodes (4): ids, items, worker(), runtime

### Community 79 - "ref_node_assert"
Cohesion: 0.08
Nodes (16): output, data, results, results, verifyPhotoDecode(), baseline, characterize, ref (+8 more)

### Community 80 - "photo-albedo.mjs"
Cohesion: 0.24
Nodes (11): SOFTEN_GLARE, ab(), enc(), lin(), luma(), lumAt(), photo(), enc() (+3 more)

### Community 81 - "rack-motion.mjs"
Cohesion: 0.23
Nodes (11): clamp(), DEFAULT_RACK_COLOR, discPose(), easeInOut(), mix(), RESTAGE_MS, SLIDE_MS, stage() (+3 more)

### Community 82 - "renderMarkers"
Cohesion: 0.18
Nodes (13): discArt(), dropMarkerArt(), fadeOut(), mapPage(), mapRimColor(), photoDisc(), renderMarkers(), selectedGroup() (+5 more)

### Community 83 - "halo-band-sampling.mjs"
Cohesion: 0.22
Nodes (12): DYE, SEAM, dE(), disc(), enc(), isDye(), L(), lab() (+4 more)

### Community 84 - "public/disc-stamp-color.mjs"
Cohesion: 0.28
Nodes (14): plastic(), box(), distanceTo(), encode(), extractStampColor(), finv(), gaussian(), kmeans() (+6 more)

### Community 85 - "buildClusters"
Cohesion: 0.18
Nodes (16): buildClusters(), cancelRegroup(), ensureGroupWorker(), flightLevel(), gapName(), hydrateGaps(), hydrateGroups(), layoutZoom() (+8 more)

### Community 86 - "palette.mjs"
Cohesion: 0.22
Nodes (8): {chromium}, contrast(), errors, full(), linear(), luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.08
Nodes (18): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+10 more)

### Community 88 - "lens-corner-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, server, shots, THEMES, WIDTHS (+1 more)

### Community 89 - "bag-spin-pocket-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, metrics, server, shots, THEMES

### Community 91 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.04
Nodes (38): {chromium}, command(), metrics, server, mold(), rated(), assignments, baseline (+30 more)

### Community 92 - "apple-design-2-browser.mjs"
Cohesion: 0.13
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 93 - "render"
Cohesion: 0.16
Nodes (28): api(), chooseRackStyle(), endDrag(), esc(), focusFirst(), foundDisc(), gallery, keepTrueColor() (+20 more)

### Community 94 - "display-palette.js"
Cohesion: 0.42
Nodes (8): accentTokens(), classColor(), commit(), css(), get(), normalize(), paint(), toneOf()

### Community 95 - "draw"
Cohesion: 0.24
Nodes (12): artFrame(), draw(), drawSatelliteLeaders(), featuredDisc(), focusFeatured(), measureMap(), presentAtlas(), setMapText() (+4 more)

### Community 96 - "atlas-motion.js"
Cohesion: 0.32
Nodes (3): dismiss(), reveal(), slide()

### Community 97 - "coach.js"
Cohesion: 0.50
Nodes (7): allowance(), api(), append(), appendDraft(), open(), render(), reset()

### Community 98 - "bag-popup-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 99 - "install-pnpm.sh"
Cohesion: 0.39
Nodes (7): acquire_shared_lock(), can_write_directory(), release_shared_lock(), report_store(), install-pnpm.sh script, XDG_CACHE_HOME, XDG_DATA_HOME

### Community 102 - "bag-collections-browser.mjs"
Cohesion: 0.09
Nodes (14): {chromium}, COLORS, command(), errors, MOLDS, PLASTICS, report, server (+6 more)

### Community 103 - "schema.ts"
Cohesion: 0.33
Nodes (4): bagItems, coachUsage, profiles, drizzle-orm

### Community 104 - "account.js"
Cohesion: 0.52
Nodes (5): api(), refresh(), renderPage(), signOut(), sync()

### Community 105 - "bag-animation-perf.mjs"
Cohesion: 0.17
Nodes (8): baseline, {chromium}, photos, profile, server, verifyLayout, verifyTextures, verifyTransitions

### Community 106 - "prompt-4-leftovers-browser.mjs"
Cohesion: 0.18
Nodes (5): pause(), pw, report, selectDisc(), server

### Community 107 - "stamp.mjs"
Cohesion: 0.11
Nodes (31): build(), paint(), preview(), observeDiscThumbnails(), getAtlasArt(), assetOf(), colorOf(), isColorStamp() (+23 more)

### Community 108 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 109 - "atlas-targets.js"
Cohesion: 0.53
Nodes (4): inBox(), pick(), reach(), reads()

### Community 110 - "bag-tweaks-browser.mjs"
Cohesion: 0.15
Nodes (10): checks, {chromium}, command(), errors, GOTO, MAIN, metrics, PUTTERS (+2 more)

### Community 111 - "apple-design-3-browser.mjs"
Cohesion: 0.17
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 113 - "ref_node_test"
Cohesion: 0.08
Nodes (53): bagDiscGeometry(), discParts(), lathePoints(), DEFAULT_RIM_COLOR, isOvermold(), OVERMOLD_DISCS, photoGeometry(), CLAY_TONES (+45 more)

### Community 115 - "0000_powerful_pepper_potts.sql"
Cohesion: 0.50
Nodes (3): `bag_items`, `coach_usage`, `profiles`

### Community 116 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 140 - "bag-v13-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, server, shots, themes, widths

### Community 141 - "public/disc-stamp-clear.mjs"
Cohesion: 0.22
Nodes (14): bestShift(), box(), CHROMA, encode(), field(), INK, labToRgb(), RIM (+6 more)

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 143 - "shopping.js"
Cohesion: 0.70
Nodes (4): offers(), render(), row(), tracking()

### Community 144 - "bag-demo-browser.mjs"
Cohesion: 0.20
Nodes (7): bagCalls, checks, {chromium}, command(), errors, server, shots

### Community 146 - "tests/disc-stamp-color.mjs"
Cohesion: 0.29
Nodes (8): f(), rgbToLab(), disc(), hexLab(), labAt(), region(), sharp, labAt()

### Community 147 - "photo-stamp-color-assets-browser.mjs"
Cohesion: 0.33
Nodes (6): dE(), hex(), inksIn(), lab(), photo(), sharp

### Community 148 - "photo-level-measure.mjs"
Cohesion: 0.43
Nodes (4): angleOf(), luma(), renderedStampAngle(), stampAngle()

### Community 149 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

### Community 151 - "photo-stamp-stall-browser.mjs"
Cohesion: 0.22
Nodes (5): file(), make(), ready(), results, sharp

### Community 152 - "photo-stamp-color-assets-evidence.mjs"
Cohesion: 0.31
Nodes (8): bagShots(), cases, CHOSEN, finishOnly, frame(), results, viewerShots(), wait()

### Community 153 - "organicAtlas"
Cohesion: 0.39
Nodes (9): dotArtRadius(), drawCompareHighlights(), keepPinned(), mapMarkerScale(), markerLabel(), markerTarget(), nameGrid(), organicAtlas() (+1 more)

### Community 154 - "atlas-lod.mjs"
Cohesion: 0.36
Nodes (6): HOLD_LIMIT, LOD_MARGIN, lodFor(), LODS, ORDER, walk()

### Community 155 - "display-harness.mjs"
Cohesion: 0.15
Nodes (10): scene, photo, log(), photo, results, BAG, openDevice(), playwright (+2 more)

### Community 156 - "disc-appearance-browser.mjs"
Cohesion: 0.25
Nodes (7): by(), catalog, {chromium}, examples, items, server, settings

### Community 157 - "more-packs-evidence.mjs"
Cohesion: 0.31
Nodes (5): openSheet(), packs(), region(), setTheme(), wait()

### Community 158 - "drawGaps"
Cohesion: 0.29
Nodes (8): artZooming(), cameraLooksStill(), drawGaps(), gapSprite(), gapTarget(), keepPinnedGaps(), levelHeld(), mapTargets()

### Community 159 - "atlas-3d-perf.mjs"
Cohesion: 0.43
Nodes (7): decide(), deviceReps(), DEVICES, FLIGHT(), main(), median(), parseReps()

### Community 160 - "display-customization-browser.mjs"
Cohesion: 0.29
Nodes (3): agree(), CLASSIC, consumers()

### Community 161 - "bag-scene-browser.mjs"
Cohesion: 0.22
Nodes (7): {chromium}, command(), errors, metrics, server, themes, widths

### Community 162 - "display-customization-evidence.mjs"
Cohesion: 0.46
Nodes (6): catalogDisc(), ready(), setTheme(), shot(), trio(), wait()

### Community 163 - "photo-stamp-sync.mjs"
Cohesion: 0.36
Nodes (7): C, form(), P, png(), put(), sharp, webp()

### Community 164 - "photo-stamp-sync-browser.mjs"
Cohesion: 0.24
Nodes (10): dE(), hex(), inksIn(), lab(), on(), photo(), sharp, since (+2 more)

### Community 165 - "tests/disc-stamp-delight.mjs"
Cohesion: 0.31
Nodes (6): disc(), enc(), flash(), lin(), sharp, SPOT

### Community 166 - "photo-stamp-one-click-evidence.mjs"
Cohesion: 0.31
Nodes (7): cases, frame(), framing, record(), results, shots(), wait()

### Community 167 - "photo-stamp-assets-evidence.mjs"
Cohesion: 0.36
Nodes (7): bagShots(), cases, CHOSEN, frame(), results, viewerShots(), wait()

### Community 168 - "overmold.mjs"
Cohesion: 0.38
Nodes (6): DEFAULT_DISC_COLOR, KEYS, LIST, overmoldColors(), parseColor(), toHex()

### Community 169 - "public.mjs"
Cohesion: 0.13
Nodes (13): jose, delete(), fixture(), item, setup(), database(), setup(), googleFetch (+5 more)

### Community 171 - "photo-stamp-one-click-browser.mjs"
Cohesion: 0.33
Nodes (4): log(), photo(), results, sharp

### Community 172 - "workers/coach.mjs"
Cohesion: 0.31
Nodes (8): askCoach(), coachContext(), groundedReply(), headers, instructions(), json(), schema, usageCost()

### Community 173 - "ref_node_path"
Cohesion: 0.03
Nodes (47): output, server, projectRoot, checks, {chromium}, errors, server, camera() (+39 more)

### Community 174 - "tests/disc-stamp-extract.mjs"
Cohesion: 0.53
Nodes (5): at(), disc(), extract(), mean(), sharp

### Community 178 - "photo.mjs"
Cohesion: 0.33
Nodes (8): CLEAR, acquirePhoto(), cache, clearPhoto(), heightRows(), luminanceRows(), nextTask(), reliefTexture()

## Knowledge Gaps
- **52 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1340 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jose` connect `public.mjs` to `package.json`, `workers/auth.mjs`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `createDiscViewer()` (e.g. with `applyPose()` and `attach()`) actually correct?**
  _`createDiscViewer()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05962059620596206 - nodes in this community are weakly interconnected._
- **Why does `inCollection()` connect `app.js` to `bag-tweaks-browser.mjs`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10093896713615023 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._