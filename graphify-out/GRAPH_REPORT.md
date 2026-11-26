# Graph Report - thumbtrack-feature  (2026-11-25)

## Corpus Check
- 507 files · ~5,756,595 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 315 file(s) not represented in the graph (top: .log 239, .gz 23, .css 17)

## Summary
- 3480 nodes · 7597 edges · 186 communities (145 shown, 41 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 267 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c42a41c6`
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
- racks.mjs
- manufacturer-diff.py
- initAtlasMap
- clear-true-color-browser.mjs
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
- ref_node_module
- public/disc-stamp-delight.mjs
- Account and bag SQL schema
- atlas-gesture-probe.mjs
- atlas-depth-browser.mjs
- halo-plastic-browser.mjs
- pnpm-install.mjs
- ref_node_fs
- bag-layout.mjs
- disc-albedo.mjs
- .zoom
- devDependencies
- photo-stamps.mjs
- mountGraveyard
- photo-editor-races.mjs
- compilerOptions
- atlas-groups.js
- mountGraveyard
- tests/auth.mjs
- bag-interactions-browser.mjs
- components.json
- Detail and pop-out viewer bridge
- photo-true-color.mjs
- api.cjs
- public/disc-stamp-extract.mjs
- atlas-organic-browser.mjs
- Catalog generation and stamp validation
- about-hero.js
- overmold.mjs
- colourdiff.mjs
- mountRacks
- sites-env.sh
- atlas-depth.mjs
- disc3d/viewer.mjs
- personal-lens.mjs
- vite.config.ts
- atlas-3d-browser.mjs
- render
- state
- disc-register.mjs
- common.mjs
- lens-corner-browser.mjs
- pathlib
- tests/disc-stamp-clear.mjs
- atlas-speed-band-browser.mjs
- gallery-fixes-browser.mjs
- atlas-speed-band.mjs
- photo-stamp-identity-browser.mjs
- display-palette.mjs
- atlas-art.mjs
- NameTag
- slider-drag-browser.mjs
- stamps.mjs
- dropdown-indicator-browser.mjs
- photo-albedo.mjs
- rack-motion.mjs
- MergedRecords
- accent-done-button-evidence.mjs
- public/disc-stamp-color.mjs
- buildClusters
- palette.mjs
- discraft-fraction-audit-browser.mjs
- public.mjs
- bag-popup-browser.mjs
- StampManifestTests
- discraft-stamps-batch2-browser.mjs
- apple-design-2-browser.mjs
- disc-stamp-worker.mjs
- display-palette.js
- draw
- atlas-motion.js
- coach.js
- photo.mjs
- install-pnpm.sh
- discraft_batch2_test.py
- stamp_fraction_audit_test.py
- bag-collections-browser.mjs
- public/disc-stamp-clear.mjs
- account.js
- bag-animation-perf.mjs
- halo.mjs
- shapeForDisc
- next
- atlas-targets.js
- ref_node_https
- bag-tweaks-browser.mjs
- install-ci.sh
- shape.mjs
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- bag-3d-browser.mjs
- cloudflare-env.d.ts
- overrides
- halo-band-sampling.mjs
- drawGaps
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- disc-request.js
- stability.mjs
- compose-discraft-fraction-proofs.py
- shopping.js
- Page
- schema.ts
- qa.mjs
- photo-level-measure.mjs
- halo-band-v2.mjs
- atlas-layout.mjs
- drizzle-kit
- bag-spin-pocket-browser.mjs
- display-harness.mjs
- bag-demo-browser.mjs
- more-packs-evidence.mjs
- engines
- 0017_disc_requests.sql
- playwright
- tests/disc-stamp-delight.mjs
- clear-plastic-partb-evidence.mjs
- markerTarget
- tests/disc-stamp-extract.mjs
- disc-appearance-browser.mjs
- photo-stamp-sync.mjs
- my-map-browser.mjs
- LostScene
- atlas-lod.mjs
- HttpCache
- workers/coach.mjs
- ref_node_child_process
- bag-scene-browser.mjs
- photo-stamp-color-assets-evidence.mjs
- stamp-extraction-fidelity.mjs
- clear-opacity-browser.mjs
- display-customization-browser.mjs
- display-customization-evidence.mjs
- photo-stamp-assets-evidence.mjs
- disc-webp.mjs
- atlas-organic.mjs
- photo-adder-rework-browser.mjs

## God Nodes (most connected - your core abstractions)
1. `scripts` - 66 edges
2. `createDiscViewer()` - 66 edges
3. `BagScene` - 63 edges
4. `mountRacks()` - 44 edges
5. `mountBag()` - 43 edges
6. `render()` - 37 edges
7. `createAtlasArt()` - 36 edges
8. `theme()` - 35 edges
9. `delightPixels()` - 34 edges
10. `state()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `layout()` --indirect_call--> `columns()`  [INFERRED]
  public/collection3d/graveyard.mjs → tests/bag-3d-layout.mjs
- `sampled()` --calls--> `delightPixels()`  [EXTRACTED]
  tests/halo-band-sampling.mjs → public/disc-albedo.mjs
- `labAt()` --calls--> `rgbToLab()`  [EXTRACTED]
  tests/disc-stamp-delight.mjs → public/disc-stamp-extract.mjs
- `prod()` --calls--> `extract()`  [EXTRACTED]
  spikes/stamp-pipeline-v2/stability.mjs → public/disc-stamp-worker.mjs
- `editorFixture()` --indirect_call--> `isHalo()`  [INFERRED]
  tests/photo-editor-races.mjs → public/disc3d/halo.mjs

## Import Cycles
- None detected.

## Communities (186 total, 41 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (84): activeLens(), addDestinationControl(), applyTheme(), atlasPriority(), bagColors(), brandColor(), brandList(), brandPalette (+76 more)

### Community 1 - "workers/auth.mjs"
Cohesion: 0.21
Nodes (19): base64url(), body(), cookie(), createAuth(), account(), callback(), session(), start() (+11 more)

### Community 2 - "Bag scene"
Cohesion: 0.10
Nodes (11): accent(), BAG_SPRING, BagScene, div(), loadViewer(), POCKET, reduced(), stampStyle() (+3 more)

### Community 3 - "bag.js"
Cohesion: 0.10
Nodes (49): dynamic, GET(), GET(), DELETE(), photoBytes(), POST(), PUT(), save() (+41 more)

### Community 4 - "theme"
Cohesion: 0.04
Nodes (36): theme(), checks, {chromium}, errors, server, types, checks, {chromium} (+28 more)

### Community 5 - "scripts"
Cohesion: 0.03
Nodes (66): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+58 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.09
Nodes (43): encodeHalo(), photoLook(), albedoCanvas(), canvasBitmap(), canvasBlob(), checkPhotoSize(), colorStampBlob(), createPhotoEditor() (+35 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.06
Nodes (37): a, args, base(), brandCount, byId, cellPool(), cells, excludedIds (+29 more)

### Community 8 - "package.json"
Cohesion: 0.05
Nodes (40): name, packageManager, private, type, version, @base-ui/react, class-variance-authority, @cloudflare/vite-plugin (+32 more)

### Community 9 - "disc3d-popout-browser.mjs"
Cohesion: 0.07
Nodes (19): byName(), {chromium}, errors, server, settle(), show(), types, view() (+11 more)

### Community 10 - "racks.mjs"
Cohesion: 0.09
Nodes (24): rackStyle(), BAYS_PER_TIER, CLASS_ORDER, pulledSpot(), RACK_DEPTH, RACK_GAP, RACK_HEIGHT, RACK_WIDTH (+16 more)

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.11
Nodes (29): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+21 more)

### Community 12 - "initAtlasMap"
Cohesion: 0.21
Nodes (19): animateZoom(), cameraMoving(), catchAtlasIntro(), changeZoom(), clearClusterTimers(), closeCluster(), initAtlasMap(), levelHeld() (+11 more)

### Community 13 - "clear-true-color-browser.mjs"
Cohesion: 0.04
Nodes (57): {chromium}, command(), metrics, server, asset, dE(), flag, haveRaptor (+49 more)

### Community 14 - "my-bag.js"
Cohesion: 0.05
Nodes (60): seeThroughPlastic(), isHalo(), addMenu, addMenuOpen(), bagColorMap, bagFinishMap, bagHaloMap, bagHaloModelMap (+52 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.06
Nodes (40): atlasPositions, CAMERA_AXES, cameraSpring, clusterPicks, comparisonMarkup(), comparisonPalette(), discArt(), dropMarkerArt() (+32 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.14
Nodes (39): lightTheme(), angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), applyTurn(), attach(), build() (+31 more)

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.07
Nodes (42): attachDiscFeatures(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot(), advanceTime(), poseAt(), clamp() (+34 more)

### Community 20 - "accent-follows-appearance-evidence.mjs"
Cohesion: 0.15
Nodes (20): BEFORE, box(), CHOSEN, clip(), closeMenu(), compose(), LIME, load() (+12 more)

### Community 22 - "halo-swirl.mjs"
Cohesion: 0.17
Nodes (20): asymFront(), drawnFront(), [dye,wash,plate,ink], dyeShare(), enc(), fbm(), glared(), INK (+12 more)

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.21
Nodes (19): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagClass(), renderFinish(), stampChoiceOf() (+11 more)

### Community 24 - "bag-values.js"
Cohesion: 0.09
Nodes (31): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagComparator(), bagPalette(), bagSlots(), DEFAULT_BAG_COLOR (+23 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "ref_node_module"
Cohesion: 0.06
Nodes (21): camera(), {chromium}, errors, pixelFailures, report, server, {chromium}, errors (+13 more)

### Community 27 - "public/disc-stamp-delight.mjs"
Cohesion: 0.18
Nodes (20): box(), CLONE_STEPS, cloneCores(), delightStamp(), distanceTo(), encode(), f(), fillHoles() (+12 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.10
Nodes (23): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+15 more)

### Community 29 - "atlas-gesture-probe.mjs"
Cohesion: 0.15
Nodes (13): args, at(), {chromium}, dpr, errors, GESTURES, intro(), report (+5 more)

### Community 30 - "atlas-depth-browser.mjs"
Cohesion: 0.12
Nodes (13): CAMERAS, checks, {chromium}, clean(), errors, gapArt(), server, settled() (+5 more)

### Community 31 - "halo-plastic-browser.mjs"
Cohesion: 0.11
Nodes (21): chroma(), {chromium}, dE(), dist(), hex(), lab(), metrics, server (+13 more)

### Community 32 - "pnpm-install.mjs"
Cohesion: 0.14
Nodes (12): NpmCacheProgress, runNpmInstall(), CACHE_SEEDS, holdInstallLocks(), InstallProgress, main(), openLock(), openReport() (+4 more)

### Community 33 - "ref_node_fs"
Cohesion: 0.04
Nodes (25): output, server, output, data, checks, {chromium}, errors, server (+17 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.07
Nodes (44): assignSides(), BAG_BOX, bagLayout(), brickRows(), byKey(), clamp(), depthOrder(), DISC (+36 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.16
Nodes (29): bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress(), delightPixels() (+21 more)

### Community 36 - ".zoom"
Cohesion: 0.14
Nodes (14): SCENE(), checks, {chromium}, clickLands(), completeDot(), errors, mapOwned(), onMap() (+6 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "photo-stamps.mjs"
Cohesion: 0.14
Nodes (33): account(), adoptUp(), api(), assetOf(), blobOf(), broken, cached(), changed() (+25 more)

### Community 39 - "mountGraveyard"
Cohesion: 0.12
Nodes (24): RACK_STYLES, ABOVE_GROUND, epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN (+16 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.10
Nodes (6): keepSnapshotAsset(), apiSource, bagSource, closeSource, saveSource, stampStubs

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.20
Nodes (17): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+9 more)

### Community 43 - "mountGraveyard"
Cohesion: 0.24
Nodes (15): selected(), engraving(), mountGraveyard(), dress(), hover(), idAt(), makePlot(), placeRing() (+7 more)

### Community 44 - "tests/auth.mjs"
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
Cohesion: 0.16
Nodes (16): applyClearPhotoRows(), clearPhotoPixels(), EDGE, edgeRadius(), fitCircle(), hexBytes(), labOf(), planClearPhoto() (+8 more)

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
Cohesion: 0.12
Nodes (23): active(), canvas, desktop, eligible(), fallback(), frame(), hero, motion (+15 more)

### Community 54 - "overmold.mjs"
Cohesion: 0.20
Nodes (13): DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, isOvermold(), KEYS, LIST, OVERMOLD_DISCS, overmoldColors(), parseColor() (+5 more)

### Community 55 - "colourdiff.mjs"
Cohesion: 0.05
Nodes (28): a, b, [disc,box,out], H, heat, L, P, T (+20 more)

### Community 56 - "mountRacks"
Cohesion: 0.20
Nodes (23): rackX(), restHeight(), rowWidth(), mountRacks(), batchFor(), box(), drop(), dropBatch() (+15 more)

### Community 57 - "sites-env.sh"
Cohesion: 0.14
Nodes (13): HOME, MINIFLARE_REGISTRY_PATH, npm_config_audit, npm_config_cache, npm_config_fund, npm_config_update_notifier, sites-env.sh script, SITES_ENV_READY (+5 more)

### Community 58 - "atlas-depth.mjs"
Cohesion: 0.15
Nodes (9): boxes(), CHROME, discs, LEVELS, positions, prints, rooms(), runtime (+1 more)

### Community 59 - "disc3d/viewer.mjs"
Cohesion: 0.11
Nodes (24): clearPage(), isColorStamp(), PHOTO_STAMP, inkFor(), layer(), luminance(), maskFor(), masks (+16 more)

### Community 60 - "personal-lens.mjs"
Cohesion: 0.17
Nodes (13): activateBag(), closeBagTips(), directory(), leaveBag(), positionBagTips(), setBagView(), syncMyMap(), undockDetail() (+5 more)

### Community 61 - "vite.config.ts"
Cohesion: 0.25
Nodes (3): vinext, vite, localBindingConfig

### Community 62 - "atlas-3d-browser.mjs"
Cohesion: 0.15
Nodes (11): checks, {chromium}, errors, SCENE(), server, settled(), show(), VIEWPORTS (+3 more)

### Community 63 - "render"
Cohesion: 0.26
Nodes (21): api(), chooseRackStyle(), focusFirst(), foundDisc(), loadBag(), lostItems(), memorialWall(), mold() (+13 more)

### Community 64 - "state"
Cohesion: 0.05
Nodes (33): {chromium}, command(), errors, server, state(), {chromium}, command(), server (+25 more)

### Community 65 - "disc-register.mjs"
Cohesion: 0.12
Nodes (35): along(), apply(), autoRegister(), CENTRE_CAP, cropThrough(), designCentre(), eigen(), ellipseFrom() (+27 more)

### Community 66 - "common.mjs"
Cohesion: 0.08
Nodes (32): only, berg, exists, EXTRA, framing, IN, level(), load() (+24 more)

### Community 67 - "lens-corner-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, server, shots, THEMES, WIDTHS (+1 more)

### Community 68 - "pathlib"
Cohesion: 0.11
Nodes (11): digest(), measure(), extract(), slug(), digest(), run(), slug(), extract() (+3 more)

### Community 69 - "tests/disc-stamp-clear.mjs"
Cohesion: 0.18
Nodes (14): clearPhoto(), disc(), GLARE, glareCase(), HAIR, inBox(), NAVY, NAVY_BOX (+6 more)

### Community 70 - "atlas-speed-band-browser.mjs"
Cohesion: 0.18
Nodes (10): CAMERAS, {chromium}, errors, failures, RENDERED(), server, settled(), show() (+2 more)

### Community 71 - "gallery-fixes-browser.mjs"
Cohesion: 0.12
Nodes (10): {chromium}, command(), errors, file(), report, server, make(), ready() (+2 more)

### Community 72 - "atlas-speed-band.mjs"
Cohesion: 0.18
Nodes (9): base, CHROME, off(), prints, rated, runtime, SIZES, STATES (+1 more)

### Community 73 - "photo-stamp-identity-browser.mjs"
Cohesion: 0.11
Nodes (13): {chromium}, ink(), server, at, baseline, compare(), noise, runs (+5 more)

### Community 74 - "display-palette.mjs"
Cohesion: 0.23
Nodes (11): contrast(), distance(), lab(), linear(), luminance(), MATRICES, minDistance(), oklch() (+3 more)

### Community 75 - "atlas-art.mjs"
Cohesion: 0.12
Nodes (47): coarse(), DISC_BUDGET, discColors(), discMaterial(), discModel(), parts, personalStampStyle(), softwareRenderer() (+39 more)

### Community 77 - "slider-drag-browser.mjs"
Cohesion: 0.24
Nodes (10): assertRangeDrag(), checkRangeDefaults(), dragRange(), {chromium}, errors, probe(), results, server (+2 more)

### Community 78 - "stamps.mjs"
Cohesion: 0.12
Nodes (21): validateUpload(), byId, idAliases, body(), json(), LOOKS, owned(), part() (+13 more)

### Community 79 - "dropdown-indicator-browser.mjs"
Cohesion: 0.17
Nodes (9): checks, {chromium}, command(), controls, errors, server, shots, THEMES (+1 more)

### Community 80 - "photo-albedo.mjs"
Cohesion: 0.24
Nodes (11): SOFTEN_GLARE, ab(), enc(), lin(), luma(), lumAt(), photo(), enc() (+3 more)

### Community 81 - "rack-motion.mjs"
Cohesion: 0.23
Nodes (11): clamp(), DEFAULT_RACK_COLOR, discPose(), easeInOut(), mix(), RESTAGE_MS, SLIDE_MS, stage() (+3 more)

### Community 83 - "accent-done-button-evidence.mjs"
Cohesion: 0.15
Nodes (15): ACCENTS, actions(), BEFORE, CHOSEN, closeSheet(), doneStates(), load(), openSheet() (+7 more)

### Community 84 - "public/disc-stamp-color.mjs"
Cohesion: 0.28
Nodes (14): plastic(), box(), distanceTo(), encode(), extractStampColor(), finv(), gaussian(), kmeans() (+6 more)

### Community 85 - "buildClusters"
Cohesion: 0.21
Nodes (16): buildClusters(), cancelRegroup(), ensureGroupWorker(), flightLevel(), hydrateGaps(), hydrateGroups(), layoutZoom(), levelReaches() (+8 more)

### Community 86 - "palette.mjs"
Cohesion: 0.22
Nodes (8): {chromium}, contrast(), errors, full(), linear(), luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.06
Nodes (20): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+12 more)

### Community 88 - "public.mjs"
Cohesion: 0.10
Nodes (18): delete(), fixture(), item, setup(), database(), setup(), database(), setup() (+10 more)

### Community 89 - "bag-popup-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 91 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.06
Nodes (25): mold(), rated(), assignments, baseline, batch, {chromium}, controls, molds (+17 more)

### Community 92 - "apple-design-2-browser.mjs"
Cohesion: 0.13
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 93 - "disc-stamp-worker.mjs"
Cohesion: 0.22
Nodes (10): plateColor(), inkBounds(), shoulder, lin(), printSupport(), SEPARATE, extract(), register() (+2 more)

### Community 94 - "display-palette.js"
Cohesion: 0.42
Nodes (8): accentTokens(), classColor(), commit(), css(), get(), normalize(), paint(), toneOf()

### Community 95 - "draw"
Cohesion: 0.18
Nodes (18): artFrame(), boundedCamera(), draw(), drawSatelliteLeaders(), featuredDisc(), focusFeatured(), immersiveMap(), introCreep() (+10 more)

### Community 96 - "atlas-motion.js"
Cohesion: 0.32
Nodes (3): dismiss(), reveal(), slide()

### Community 97 - "coach.js"
Cohesion: 0.50
Nodes (7): allowance(), api(), append(), appendDraft(), open(), render(), reset()

### Community 98 - "photo.mjs"
Cohesion: 0.29
Nodes (10): CLEAR, acquirePhoto(), cache, clearPhoto(), heightRows(), luminanceRows(), nextTask(), photoGeometry() (+2 more)

### Community 99 - "install-pnpm.sh"
Cohesion: 0.39
Nodes (7): acquire_shared_lock(), can_write_directory(), release_shared_lock(), report_store(), install-pnpm.sh script, XDG_CACHE_HOME, XDG_DATA_HOME

### Community 102 - "bag-collections-browser.mjs"
Cohesion: 0.09
Nodes (14): {chromium}, COLORS, command(), errors, MOLDS, PLASTICS, report, server (+6 more)

### Community 103 - "public/disc-stamp-clear.mjs"
Cohesion: 0.13
Nodes (20): photoPoint(), bestShift(), box(), CHROMA, encode(), field(), INK, labToRgb() (+12 more)

### Community 104 - "account.js"
Cohesion: 0.52
Nodes (5): api(), refresh(), renderPage(), signOut(), sync()

### Community 105 - "bag-animation-perf.mjs"
Cohesion: 0.17
Nodes (8): baseline, {chromium}, photos, profile, server, verifyLayout, verifyTextures, verifyTransitions

### Community 106 - "halo.mjs"
Cohesion: 0.25
Nodes (9): frontAt(), HALO_FEATHER, HALO_FORMAT, HALO_RING, HALO_STREAKS, NAMES, linear(), smooth() (+1 more)

### Community 107 - "shapeForDisc"
Cohesion: 0.19
Nodes (16): build(), paint(), preview(), bagDiscGeometry(), discParts(), haloCoord(), discGeometry(), groupRim() (+8 more)

### Community 108 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 109 - "atlas-targets.js"
Cohesion: 0.53
Nodes (4): inBox(), pick(), reach(), reads()

### Community 110 - "ref_node_https"
Cohesion: 0.04
Nodes (31): {chromium}, server, checks, {chromium}, errors, server, shots, {chromium} (+23 more)

### Community 111 - "bag-tweaks-browser.mjs"
Cohesion: 0.15
Nodes (10): checks, {chromium}, command(), errors, GOTO, MAIN, metrics, PUTTERS (+2 more)

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 113 - "shape.mjs"
Cohesion: 0.07
Nodes (53): HALO_PLASTICS, CLAY_TONES, esc(), LABELS, n(), PROFILE_FRAME, profileDimensions(), profileSVG() (+45 more)

### Community 115 - "0000_powerful_pepper_potts.sql"
Cohesion: 0.50
Nodes (3): `bag_items`, `coach_usage`, `profiles`

### Community 116 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 117 - "bag-3d-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, perf, server, shots, themes (+1 more)

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 120 - "halo-band-sampling.mjs"
Cohesion: 0.22
Nodes (12): DYE, SEAM, dE(), disc(), enc(), isDye(), L(), lab() (+4 more)

### Community 121 - "drawGaps"
Cohesion: 0.29
Nodes (8): artZooming(), cameraLooksStill(), drawGaps(), gapName(), gapSprite(), gapTarget(), keepPinnedGaps(), remeasureLabels()

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

### Community 146 - "schema.ts"
Cohesion: 0.33
Nodes (4): bagItems, coachUsage, profiles, drizzle-orm

### Community 147 - "qa.mjs"
Cohesion: 0.62
Nodes (6): edgeSharpness(), exposure(), gate, glare(), luma(), sharpness()

### Community 148 - "photo-level-measure.mjs"
Cohesion: 0.43
Nodes (4): angleOf(), luma(), renderedStampAngle(), stampAngle()

### Community 149 - "halo-band-v2.mjs"
Cohesion: 0.20
Nodes (12): FRONT_RING, ASYM_FEATHER, dE(), delit(), disc(), enc(), L(), lab() (+4 more)

### Community 152 - "atlas-layout.mjs"
Cohesion: 0.19
Nodes (9): catalogBase, context, filters(), fixtures, random(), rated, score(), sizes (+1 more)

### Community 154 - "bag-spin-pocket-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, metrics, server, shots, THEMES

### Community 155 - "display-harness.mjs"
Cohesion: 0.10
Nodes (12): scene, photo, directoryLink, form, mapLink, rows(), sheet, BAG (+4 more)

### Community 156 - "bag-demo-browser.mjs"
Cohesion: 0.20
Nodes (7): bagCalls, checks, {chromium}, command(), errors, server, shots

### Community 157 - "more-packs-evidence.mjs"
Cohesion: 0.31
Nodes (5): openSheet(), packs(), region(), setTheme(), wait()

### Community 159 - "0017_disc_requests.sql"
Cohesion: 0.60
Nodes (4): disc_request_throttle, disc_request_throttle_hour, disc_requests, disc_requests_status

### Community 161 - "tests/disc-stamp-delight.mjs"
Cohesion: 0.27
Nodes (7): disc(), enc(), flash(), labAt(), lin(), sharp, SPOT

### Community 162 - "clear-plastic-partb-evidence.mjs"
Cohesion: 0.33
Nodes (3): log(), photo, results

### Community 163 - "markerTarget"
Cohesion: 0.39
Nodes (8): dotArtRadius(), drawCompareHighlights(), keepPinned(), mapMarkerScale(), markerLabel(), markerTarget(), nameGrid(), yieldNames()

### Community 164 - "tests/disc-stamp-extract.mjs"
Cohesion: 0.53
Nodes (5): at(), disc(), extract(), mean(), sharp

### Community 165 - "disc-appearance-browser.mjs"
Cohesion: 0.25
Nodes (7): by(), catalog, {chromium}, examples, items, server, settings

### Community 166 - "photo-stamp-sync.mjs"
Cohesion: 0.16
Nodes (13): C, fixture(), form(), P, png(), put(), sharp, webp() (+5 more)

### Community 167 - "my-map-browser.mjs"
Cohesion: 0.09
Nodes (15): {chromium}, command(), errors, server, shots, themes, widths, BAG (+7 more)

### Community 168 - "LostScene"
Cohesion: 0.18
Nodes (6): rackCount(), CollectionScene, esc(), LostScene, plural(), StorageScene

### Community 169 - "atlas-lod.mjs"
Cohesion: 0.36
Nodes (6): HOLD_LIMIT, LOD_MARGIN, lodFor(), LODS, ORDER, walk()

### Community 172 - "workers/coach.mjs"
Cohesion: 0.31
Nodes (8): askCoach(), coachContext(), groundedReply(), headers, instructions(), json(), schema, usageCost()

### Community 173 - "ref_node_child_process"
Cohesion: 0.06
Nodes (29): readExecutionProfile(), cli, [command, ...args], projectRoot, {chromium}, errors, originals, requests (+21 more)

### Community 174 - "bag-scene-browser.mjs"
Cohesion: 0.22
Nodes (7): {chromium}, command(), errors, metrics, server, themes, widths

### Community 175 - "photo-stamp-color-assets-evidence.mjs"
Cohesion: 0.31
Nodes (8): bagShots(), cases, CHOSEN, finishOnly, frame(), results, viewerShots(), wait()

### Community 177 - "stamp-extraction-fidelity.mjs"
Cohesion: 0.38
Nodes (6): at(), extract(), LETTERS, peak(), sharp, SMALL

### Community 182 - "display-customization-browser.mjs"
Cohesion: 0.29
Nodes (3): agree(), CLASSIC, consumers()

### Community 183 - "display-customization-evidence.mjs"
Cohesion: 0.46
Nodes (6): catalogDisc(), ready(), setTheme(), shot(), trio(), wait()

### Community 184 - "photo-stamp-assets-evidence.mjs"
Cohesion: 0.36
Nodes (7): bagShots(), cases, CHOSEN, frame(), results, viewerShots(), wait()

### Community 186 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

### Community 189 - "photo-adder-rework-browser.mjs"
Cohesion: 0.50
Nodes (4): log(), results, sharp, shoot()

## Knowledge Gaps
- **52 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1478 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jose` connect `tests/auth.mjs` to `package.json`, `workers/auth.mjs`, `public.mjs`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `createDiscViewer()` (e.g. with `applyPose()` and `attach()`) actually correct?**
  _`createDiscViewer()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05636114911080711 - nodes in this community are weakly interconnected._
- **Why does `inCollection()` connect `app.js` to `bag-tweaks-browser.mjs`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10093896713615023 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._