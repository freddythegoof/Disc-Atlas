# Graph Report - clear-plastic-true-color  (2026-10-24)

## Corpus Check
- 460 files · ~5,662,400 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 314 file(s) not represented in the graph (top: .log 239, .gz 23, .css 16)

## Summary
- 3105 nodes · 6635 edges · 189 communities (152 shown, 37 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 249 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `164a815a`
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
- LostScene
- manufacturer-diff.py
- initAtlasMap
- non-overmold-photo-edge-atlas-browser.mjs
- my-bag.js
- atlas-map.js
- Shared 3D disc viewer
- AuditTests
- SceneView
- bag3d/viewer.mjs
- accent-follows-appearance-evidence.mjs
- json
- bag-spin-pocket-browser.mjs
- all-discs-gallery.js
- bag-values.js
- dependencies
- collection-scenes.js
- public/disc-stamp-delight.mjs
- Account and bag SQL schema
- lens-corner-browser.mjs
- racks.mjs
- clear-true-color-browser.mjs
- pnpm-install.mjs
- bag-3d-browser.mjs
- bag-layout.mjs
- disc-albedo.mjs
- atlas-persist-browser.mjs
- devDependencies
- photo-stamps.mjs
- halo-swirl.mjs
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
- display-customization-evidence.mjs
- halo-band-v2.mjs
- sites-env.sh
- atlas-depth.mjs
- accent-done-button-evidence.mjs
- dropdown-indicator-browser.mjs
- vite.config.ts
- mountGraveyard
- disc3d/viewer.mjs
- atlas-layout.mjs
- Page
- theme
- workers/bag.mjs
- pathlib
- tests/disc-stamp-clear.mjs
- atlas-speed-band-browser.mjs
- apple-design-browser.mjs
- atlas-speed-band.mjs
- photo-stamp-identity-browser.mjs
- display-palette.mjs
- stamps.mjs
- bag-staging-browser.mjs
- slider-drag-browser.mjs
- disc3d-profile.mjs
- ref_node_assert
- photo-albedo.mjs
- rack-motion.mjs
- ref_node_child_process
- halo-band-sampling.mjs
- public/disc-stamp-color.mjs
- buildClusters
- palette.mjs
- discraft-fraction-audit-browser.mjs
- atlas-layout.js
- overmold.mjs
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
- shape.mjs
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
- ref_node_module
- ref_node_fs
- photo-stamp-color-assets-browser.mjs
- photo-level-measure.mjs
- atlas-organic.mjs
- photo-stamp-stall-browser.mjs
- photo-stamp-color-assets-evidence.mjs
- more-packs-evidence.mjs
- photo.mjs
- display-harness.mjs
- display-customization-browser.mjs
- photo-stamp-assets-evidence.mjs
- atlas-lod.mjs
- drizzle-kit
- engines
- bag-scene-browser.mjs
- playwright
- photo-stamp-sync.mjs
- photo-stamp-sync-browser.mjs
- tests/disc-stamp-delight.mjs
- photo-stamp-one-click-evidence.mjs
- atlas-3d-perf.mjs
- photo-stamp-one-click-browser.mjs
- public.mjs
- render
- render
- workers/coach.mjs
- ref_node_http
- tests/disc-stamp-extract.mjs
- shapeForDisc
- atlas-depth-browser.mjs
- stage.mjs
- discraft-stamps-batch2-browser.mjs
- directory-layout-browser.mjs
- tests/disc-stamp-color.mjs
- bag-demo.mjs
- disc-appearance-browser.mjs
- bag-map-controls-browser.mjs
- bag-pulled-sizing.mjs
- bag-pulled-sizing-browser.mjs
- disc-webp.mjs

## God Nodes (most connected - your core abstractions)
1. `createDiscViewer()` - 66 edges
2. `scripts` - 63 edges
3. `BagScene` - 63 edges
4. `mountRacks()` - 44 edges
5. `mountBag()` - 43 edges
6. `createAtlasArt()` - 35 edges
7. `render()` - 35 edges
8. `theme()` - 34 edges
9. `state()` - 32 edges
10. `discModel()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `editorFixture()` --indirect_call--> `isHalo()`  [INFERRED]
  tests/photo-editor-races.mjs → public/disc3d/halo.mjs
- `layout()` --indirect_call--> `columns()`  [INFERRED]
  public/collection3d/graveyard.mjs → tests/bag-3d-layout.mjs
- `sampled()` --calls--> `delightPixels()`  [EXTRACTED]
  tests/halo-band-sampling.mjs → public/disc-albedo.mjs
- `flagged()` --calls--> `isOvermold()`  [EXTRACTED]
  tests/disc3d-overmold.mjs → public/disc3d/overmold.mjs
- `createBag()` --calls--> `validateDiscDetails()`  [EXTRACTED]
  workers/bag.mjs → public/bag-values.js

## Import Cycles
- None detected.

## Communities (189 total, 37 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (80): activeLens(), addDestinationControl(), applyTheme(), atlasPriority(), bagColors(), brandColor(), brandList(), brandPalette (+72 more)

### Community 1 - "workers/auth.mjs"
Cohesion: 0.22
Nodes (18): base64url(), body(), cookie(), createAuth(), account(), callback(), session(), start() (+10 more)

### Community 2 - "Bag scene"
Cohesion: 0.10
Nodes (9): accent(), BAG_SPRING, BagScene, div(), loadViewer(), POCKET, reduced(), stampStyle() (+1 more)

### Community 3 - "bag.js"
Cohesion: 0.10
Nodes (49): dynamic, GET(), GET(), DELETE(), photoBytes(), POST(), PUT(), save() (+41 more)

### Community 4 - "ref_node_https"
Cohesion: 0.04
Nodes (38): {chromium}, command(), errors, server, state(), {chromium}, command(), server (+30 more)

### Community 5 - "scripts"
Cohesion: 0.03
Nodes (63): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+55 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.10
Nodes (42): encodeHalo(), photoLook(), albedoCanvas(), bandRatio(), canvasBitmap(), canvasBlob(), checkPhotoSize(), colorStampBlob() (+34 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.10
Nodes (23): a, args, base(), brandCount, byId, cellPool(), cells, excludedIds (+15 more)

### Community 8 - "package.json"
Cohesion: 0.05
Nodes (40): name, packageManager, private, type, version, @base-ui/react, class-variance-authority, @cloudflare/vite-plugin (+32 more)

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
Cohesion: 0.16
Nodes (25): animateZoom(), boundedCamera(), cameraMoving(), catchAtlasIntro(), changeZoom(), clearClusterTimers(), closeCluster(), immersiveMap() (+17 more)

### Community 13 - "non-overmold-photo-edge-atlas-browser.mjs"
Cohesion: 0.09
Nodes (23): chroma(), {chromium}, dE(), dist(), hex(), lab(), metrics, server (+15 more)

### Community 14 - "my-bag.js"
Cohesion: 0.07
Nodes (32): isHalo(), addMenu, addMenuOpen(), bagColorMap, bagFinishMap, bagHaloMap, bagHaloModelMap, bagPhotoMap (+24 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.07
Nodes (36): artZooming(), atlasPositions, CAMERA_AXES, cameraSpring, clusterPicks, comparisonMarkup(), comparisonPalette(), discArt() (+28 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.14
Nodes (40): camera(), angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), applyTurn(), attach(), build() (+32 more)

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.11
Nodes (29): stageMode(), advanceTime(), poseAt(), clamp(), desktopPulledLayout(), packing(), PHONE_PULLED_COUNT, PHONE_PULLED_MAX (+21 more)

### Community 20 - "accent-follows-appearance-evidence.mjs"
Cohesion: 0.15
Nodes (20): BEFORE, box(), CHOSEN, clip(), closeMenu(), compose(), LIME, load() (+12 more)

### Community 21 - "json"
Cohesion: 0.13
Nodes (4): main(), slug(), tile(), Validator

### Community 22 - "bag-spin-pocket-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, metrics, server, shots, THEMES

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.20
Nodes (17): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagClass(), bagComparator(), rackOrder() (+9 more)

### Community 24 - "bag-values.js"
Cohesion: 0.14
Nodes (24): BAG_COLORS, bagPalette(), DEFAULT_BAG_COLOR, defaultDiscDetails(), defaultPocket(), FINISHES, plasticColor(), plasticOptions() (+16 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "collection-scenes.js"
Cohesion: 0.18
Nodes (17): epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN, MAX_TURN, PLOT_DEPTH (+9 more)

### Community 27 - "public/disc-stamp-delight.mjs"
Cohesion: 0.17
Nodes (21): GLARE_CEILING, box(), CLONE_STEPS, cloneCores(), delightStamp(), distanceTo(), encode(), f() (+13 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.10
Nodes (23): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+15 more)

### Community 29 - "lens-corner-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, server, shots, THEMES, WIDTHS (+1 more)

### Community 30 - "racks.mjs"
Cohesion: 0.09
Nodes (24): rackStyle(), BAYS_PER_TIER, CLASS_ORDER, pulledSpot(), RACK_DEPTH, RACK_GAP, RACK_HEIGHT, RACK_WIDTH (+16 more)

### Community 31 - "clear-true-color-browser.mjs"
Cohesion: 0.12
Nodes (21): asset, dE(), flag, haveRaptor, hex(), hsv(), lab(), med() (+13 more)

### Community 32 - "pnpm-install.mjs"
Cohesion: 0.21
Nodes (10): CACHE_SEEDS, holdInstallLocks(), InstallProgress, main(), openLock(), openReport(), OPERATIONAL_FAILURE_CODES, showLine() (+2 more)

### Community 33 - "bag-3d-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, perf, server, shots, themes (+1 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.07
Nodes (42): assignSides(), BAG_BOX, bagLayout(), brickRows(), byKey(), clamp(), depthOrder(), fan() (+34 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.20
Nodes (25): bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress(), delightPixels() (+17 more)

### Community 36 - "atlas-persist-browser.mjs"
Cohesion: 0.15
Nodes (13): checks, {chromium}, clickLands(), completeDot(), errors, mapOwned(), onMap(), READABLE() (+5 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "photo-stamps.mjs"
Cohesion: 0.14
Nodes (33): account(), adoptUp(), api(), assetOf(), blobOf(), broken, cached(), changed() (+25 more)

### Community 39 - "halo-swirl.mjs"
Cohesion: 0.15
Nodes (22): ASYM_FEATHER, asymFront(), drawnFront(), [dye,wash,plate,ink], dyeShare(), enc(), fbm(), glared() (+14 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.10
Nodes (6): apiSource, bagSource, closeSource, editorFixture(), saveSource, stampStubs

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.20
Nodes (17): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+9 more)

### Community 43 - "mountRacks"
Cohesion: 0.19
Nodes (24): rackX(), restHeight(), rowWidth(), mountRacks(), batchFor(), box(), drop(), dropBatch() (+16 more)

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

### Community 48 - "photo-true-color.mjs"
Cohesion: 0.18
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
Cohesion: 0.23
Nodes (12): active(), canvas, desktop, eligible(), fallback(), frame(), hero, motion (+4 more)

### Community 54 - ".zoom"
Cohesion: 0.15
Nodes (14): dotArtRadius(), drawCompareHighlights(), keepPinned(), mapMarkerScale(), markerLabel(), markerTarget(), checks, {chromium} (+6 more)

### Community 55 - "display-customization-evidence.mjs"
Cohesion: 0.46
Nodes (6): catalogDisc(), ready(), setTheme(), shot(), trio(), wait()

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

### Community 60 - "dropdown-indicator-browser.mjs"
Cohesion: 0.17
Nodes (9): checks, {chromium}, command(), controls, errors, server, shots, THEMES (+1 more)

### Community 61 - "vite.config.ts"
Cohesion: 0.25
Nodes (3): vinext, vite, localBindingConfig

### Community 62 - "mountGraveyard"
Cohesion: 0.15
Nodes (21): ABOVE_GROUND, engraving(), mountGraveyard(), dress(), hover(), idAt(), layout(), makePlot() (+13 more)

### Community 63 - "disc3d/viewer.mjs"
Cohesion: 0.14
Nodes (26): getAtlasArt(), CLEAR_ORDER, clearBackdrop(), clearMeshes(), clearPage(), clearPart(), clearRig(), defines() (+18 more)

### Community 64 - "atlas-layout.mjs"
Cohesion: 0.19
Nodes (9): catalogBase, context, filters(), fixtures, random(), rated, score(), sizes (+1 more)

### Community 66 - "theme"
Cohesion: 0.06
Nodes (23): theme(), {chromium}, server, checks, {chromium}, errors, server, types (+15 more)

### Community 67 - "workers/bag.mjs"
Cohesion: 0.15
Nodes (13): validateUpload(), fixture(), chunk(), extended(), fixture(), fixture(), byId, createBag() (+5 more)

### Community 68 - "pathlib"
Cohesion: 0.12
Nodes (8): digest(), measure(), extract(), slug(), digest(), run(), slug(), extract()

### Community 69 - "tests/disc-stamp-clear.mjs"
Cohesion: 0.18
Nodes (14): clearPhoto(), disc(), GLARE, glareCase(), HAIR, inBox(), NAVY, NAVY_BOX (+6 more)

### Community 70 - "atlas-speed-band-browser.mjs"
Cohesion: 0.18
Nodes (10): CAMERAS, {chromium}, errors, failures, RENDERED(), server, settled(), show() (+2 more)

### Community 71 - "apple-design-browser.mjs"
Cohesion: 0.22
Nodes (4): checks, {chromium}, errors, server

### Community 72 - "atlas-speed-band.mjs"
Cohesion: 0.18
Nodes (9): base, CHROME, off(), prints, rated, runtime, SIZES, STATES (+1 more)

### Community 73 - "photo-stamp-identity-browser.mjs"
Cohesion: 0.11
Nodes (13): {chromium}, ink(), server, at, baseline, compare(), noise, runs (+5 more)

### Community 74 - "display-palette.mjs"
Cohesion: 0.26
Nodes (11): contrast(), distance(), lab(), linear(), luminance(), MATRICES, minDistance(), oklch() (+3 more)

### Community 75 - "stamps.mjs"
Cohesion: 0.23
Nodes (14): body(), json(), LOOKS, owned(), part(), placed(), PNG_CHUNKS, shape() (+6 more)

### Community 76 - "bag-staging-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 77 - "slider-drag-browser.mjs"
Cohesion: 0.24
Nodes (10): assertRangeDrag(), checkRangeDefaults(), dragRange(), {chromium}, errors, probe(), results, server (+2 more)

### Community 78 - "disc3d-profile.mjs"
Cohesion: 0.19
Nodes (12): CLAY_TONES, esc(), LABELS, n(), PROFILE_FRAME, profileDimensions(), profileSVG(), SPEC (+4 more)

### Community 79 - "ref_node_assert"
Cohesion: 0.07
Nodes (6): context, T, ids, items, worker(), runtime

### Community 80 - "photo-albedo.mjs"
Cohesion: 0.24
Nodes (11): SOFTEN_GLARE, ab(), enc(), lin(), luma(), lumAt(), photo(), enc() (+3 more)

### Community 81 - "rack-motion.mjs"
Cohesion: 0.23
Nodes (11): clamp(), DEFAULT_RACK_COLOR, discPose(), easeInOut(), mix(), RESTAGE_MS, SLIDE_MS, stage() (+3 more)

### Community 82 - "ref_node_child_process"
Cohesion: 0.06
Nodes (27): readExecutionProfile(), NpmCacheProgress, runNpmInstall(), cli, [command, ...args], projectRoot, {chromium}, errors (+19 more)

### Community 83 - "halo-band-sampling.mjs"
Cohesion: 0.22
Nodes (12): DYE, SEAM, dE(), disc(), enc(), isDye(), L(), lab() (+4 more)

### Community 84 - "public/disc-stamp-color.mjs"
Cohesion: 0.28
Nodes (14): plastic(), box(), distanceTo(), encode(), extractStampColor(), finv(), gaussian(), kmeans() (+6 more)

### Community 85 - "buildClusters"
Cohesion: 0.26
Nodes (13): buildClusters(), cancelRegroup(), ensureGroupWorker(), hydrateGaps(), hydrateGroups(), measureChrome(), measureFullLabels(), organicAtlas() (+5 more)

### Community 86 - "palette.mjs"
Cohesion: 0.22
Nodes (8): {chromium}, contrast(), errors, full(), linear(), luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.06
Nodes (21): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+13 more)

### Community 88 - "atlas-layout.js"
Cohesion: 0.28
Nodes (10): adapt(), adaptStrength(), bandSlope(), bounds(), fit(), inBand(), positions(), scatter() (+2 more)

### Community 89 - "overmold.mjs"
Cohesion: 0.24
Nodes (9): DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, KEYS, lightTheme(), LIST, OVERMOLD_DISCS, overmoldColors(), parseColor() (+1 more)

### Community 91 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.07
Nodes (23): {chromium}, command(), metrics, server, mold(), rated(), assignments, baseline (+15 more)

### Community 92 - "apple-design-2-browser.mjs"
Cohesion: 0.13
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 93 - "render"
Cohesion: 0.22
Nodes (20): api(), chooseRackStyle(), endDrag(), focusFirst(), foundDisc(), gallery, loadBag(), lostScene (+12 more)

### Community 94 - "display-palette.js"
Cohesion: 0.42
Nodes (8): accentTokens(), classColor(), commit(), css(), get(), normalize(), paint(), toneOf()

### Community 95 - "draw"
Cohesion: 0.24
Nodes (12): artFrame(), draw(), drawSatelliteLeaders(), featuredDisc(), focusFeatured(), measureMap(), presentAtlas(), setMapText() (+4 more)

### Community 96 - "atlas-motion.js"
Cohesion: 0.19
Nodes (8): fadeOut(), photoMarkup(), renderMarkers(), selectedGroup(), dismiss(), reveal(), selected(), slide()

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
Cohesion: 0.13
Nodes (22): build(), paint(), preview(), isColorStamp(), PHOTO_STAMP, DETAIL, detailPixelRatio(), detailSegments() (+14 more)

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

### Community 113 - "shape.mjs"
Cohesion: 0.12
Nodes (32): lathePoints(), photoGeometry(), clamp(), cubic(), DEFAULTS, discProfile(), domeCurve(), finite() (+24 more)

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
Cohesion: 0.21
Nodes (15): plateColor(), bestShift(), box(), CHROMA, encode(), field(), INK, labToRgb() (+7 more)

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 143 - "shopping.js"
Cohesion: 0.70
Nodes (4): offers(), render(), row(), tracking()

### Community 144 - "ref_node_module"
Cohesion: 0.07
Nodes (17): bagCalls, checks, {chromium}, command(), errors, server, shots, {chromium} (+9 more)

### Community 146 - "ref_node_fs"
Cohesion: 0.11
Nodes (16): output, data, results, results, verifyPhotoDecode(), baseline, characterize, ref (+8 more)

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

### Community 153 - "more-packs-evidence.mjs"
Cohesion: 0.31
Nodes (5): openSheet(), packs(), region(), setTheme(), wait()

### Community 154 - "photo.mjs"
Cohesion: 0.31
Nodes (9): CLEAR, acquirePhoto(), cache, clearPhoto(), heightRows(), luminanceRows(), nextTask(), photoSurface() (+1 more)

### Community 155 - "display-harness.mjs"
Cohesion: 0.15
Nodes (10): scene, photo, log(), photo, results, BAG, openDevice(), playwright (+2 more)

### Community 156 - "display-customization-browser.mjs"
Cohesion: 0.29
Nodes (3): agree(), CLASSIC, consumers()

### Community 157 - "photo-stamp-assets-evidence.mjs"
Cohesion: 0.36
Nodes (7): bagShots(), cases, CHOSEN, frame(), results, viewerShots(), wait()

### Community 158 - "atlas-lod.mjs"
Cohesion: 0.36
Nodes (6): HOLD_LIMIT, LOD_MARGIN, lodFor(), LODS, ORDER, walk()

### Community 161 - "bag-scene-browser.mjs"
Cohesion: 0.22
Nodes (7): {chromium}, command(), errors, metrics, server, themes, widths

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

### Community 167 - "atlas-3d-perf.mjs"
Cohesion: 0.43
Nodes (7): decide(), deviceReps(), DEVICES, FLIGHT(), main(), median(), parseReps()

### Community 168 - "photo-stamp-one-click-browser.mjs"
Cohesion: 0.33
Nodes (4): log(), photo(), results, sharp

### Community 169 - "public.mjs"
Cohesion: 0.13
Nodes (13): jose, delete(), fixture(), item, setup(), database(), setup(), googleFetch (+5 more)

### Community 170 - "render"
Cohesion: 0.15
Nodes (18): activateBag(), closeBagTips(), directory(), esc(), isDemo(), keepTrueColor(), leaveBag(), lostItems() (+10 more)

### Community 171 - "render"
Cohesion: 0.32
Nodes (13): createAtlasArt(), dispose(), geometryOf(), get(), has(), render(), shapeOf(), touch() (+5 more)

### Community 172 - "workers/coach.mjs"
Cohesion: 0.31
Nodes (8): askCoach(), coachContext(), groundedReply(), headers, instructions(), json(), schema, usageCost()

### Community 173 - "ref_node_http"
Cohesion: 0.06
Nodes (25): output, server, camera(), {chromium}, errors, pixelFailures, report, server (+17 more)

### Community 174 - "tests/disc-stamp-extract.mjs"
Cohesion: 0.53
Nodes (5): at(), disc(), extract(), mean(), sharp

### Community 175 - "shapeForDisc"
Cohesion: 0.19
Nodes (17): DISC, attachDiscFeatures(), bagDiscGeometry(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot(), discParts() (+9 more)

### Community 177 - "atlas-depth-browser.mjs"
Cohesion: 0.12
Nodes (14): CAMERAS, checks, {chromium}, clean(), errors, gapArt(), SCENE(), server (+6 more)

### Community 178 - "stage.mjs"
Cohesion: 0.25
Nodes (15): coarse(), DISC_BUDGET, discMaterial(), discModel(), parts, personalStampStyle(), softwareRenderer(), stage() (+7 more)

### Community 179 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.12
Nodes (13): assignments, baseline, batch, {chromium}, controls, drops, molds, newMolds (+5 more)

### Community 181 - "directory-layout-browser.mjs"
Cohesion: 0.18
Nodes (9): checks, {chromium}, desktop, errors, metrics, phone, server, shots (+1 more)

### Community 182 - "tests/disc-stamp-color.mjs"
Cohesion: 0.29
Nodes (8): f(), rgbToLab(), disc(), hexLab(), labAt(), region(), sharp, labAt()

### Community 183 - "bag-demo.mjs"
Cohesion: 0.28
Nodes (7): DEMO_BAG, DEMO_DISCS, discs, bagSlots(), byId, models, plastics

### Community 184 - "disc-appearance-browser.mjs"
Cohesion: 0.25
Nodes (7): by(), catalog, {chromium}, examples, items, server, settings

### Community 185 - "bag-map-controls-browser.mjs"
Cohesion: 0.25
Nodes (5): checks, {chromium}, errors, server, shots

### Community 186 - "bag-pulled-sizing.mjs"
Cohesion: 0.25
Nodes (5): bag, blocks, entries, phone, viewport

### Community 187 - "bag-pulled-sizing-browser.mjs"
Cohesion: 0.29
Nodes (4): {chromium}, errors, metrics, server

## Knowledge Gaps
- **52 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1323 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

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
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10476190476190476 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._