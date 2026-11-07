# Graph Report - Disc-Atlas  (2026-11-06)

## Corpus Check
- 475 files · ~5,723,181 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 314 file(s) not represented in the graph (top: .log 239, .gz 23, .css 17)

## Summary
- 3267 nodes · 7059 edges · 174 communities (140 shown, 34 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 258 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1d981fe5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- workers/auth.mjs
- Bag scene
- bag.js
- bag-collections-browser.mjs
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
- json
- overmold.mjs
- collection-scenes.js
- bag-values.js
- dependencies
- collection-layout.mjs
- stamp.mjs
- Account and bag SQL schema
- scheduleMapDraw
- stage.mjs
- lens-corner-browser.mjs
- collection-layout.mjs
- racks.mjs
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
- public.mjs
- bag-interactions-browser.mjs
- components.json
- Detail and pop-out viewer bridge
- pnpm-install.mjs
- api.cjs
- render
- atlas-organic-browser.mjs
- Catalog generation and stamp validation
- about-hero.js
- .zoom
- display-customization-evidence.mjs
- disc3d/viewer.mjs
- sites-env.sh
- atlas-depth.mjs
- accent-done-button-evidence.mjs
- ref_node_assert
- vite.config.ts
- bag-spin-pocket-browser.mjs
- halo-band-sampling.mjs
- atlas-layout.mjs
- disc-register.mjs
- my-map-browser.mjs
- Page
- pathlib
- tests/disc-stamp-clear.mjs
- atlas-speed-band-browser.mjs
- my-map-browser.mjs
- ref_node_module
- apple-design-2-browser.mjs
- display-palette.mjs
- halo.mjs
- bag-staging-browser.mjs
- slider-drag-browser.mjs
- render
- personal-lens.mjs
- photo-albedo.mjs
- state
- apple-design-3-browser.mjs
- bag-spin-pocket-browser.mjs
- public/disc-stamp-color.mjs
- buildClusters
- palette.mjs
- discraft-fraction-audit-browser.mjs
- workers/disc-requests.mjs
- ref_node_vm
- StampManifestTests
- discraft-stamps-batch2-browser.mjs
- apple-design-2-browser.mjs
- theme
- display-palette.js
- draw
- atlas-motion.js
- coach.js
- markerTarget
- install-pnpm.sh
- discraft_batch2_test.py
- stamp_fraction_audit_test.py
- bag-scene-browser.mjs
- schema.ts
- account.js
- renderMarkers
- prompt-4-leftovers-browser.mjs
- stamp.mjs
- next
- atlas-targets.js
- atlas-3d-perf.mjs
- bag-map-controls-browser.mjs
- install-ci.sh
- appearance.js
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- HttpCache
- cloudflare-env.d.ts
- overrides
- NameTag
- theme
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- disc-request.js
- DiscmaniaIdentity
- compose-discraft-fraction-proofs.py
- shopping.js
- textures.mjs
- tests/disc-stamp-color.mjs
- disc-appearance-browser.mjs
- photo-level-measure.mjs
- disc-webp.mjs
- photo-stamp-color-assets-evidence.mjs
- stamp-extraction-fidelity.mjs
- stage.mjs
- display-harness.mjs
- photo-stamp-color-assets-browser.mjs
- more-packs-evidence.mjs
- renderMarkers
- 0017_disc_requests.sql
- display-customization-browser.mjs
- disc-webp.mjs
- mapTargets
- photo-stamp-sync.mjs
- HttpCache
- tests/disc-stamp-delight.mjs
- DiscmaniaIdentity
- coach-worker.mjs
- workers/coach.mjs
- ref_node_path
- tests/disc-stamp-extract.mjs
- ref_node_test

## God Nodes (most connected - your core abstractions)
1. `createDiscViewer()` - 66 edges
2. `scripts` - 64 edges
3. `BagScene` - 63 edges
4. `mountRacks()` - 44 edges
5. `mountBag()` - 43 edges
6. `createAtlasArt()` - 36 edges
7. `render()` - 36 edges
8. `theme()` - 35 edges
9. `state()` - 33 edges
10. `delightPixels()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `layout()` --indirect_call--> `columns()`  [INFERRED]
  public/collection3d/graveyard.mjs → tests/bag-3d-layout.mjs
- `sampled()` --calls--> `delightPixels()`  [EXTRACTED]
  tests/halo-band-sampling.mjs → public/disc-albedo.mjs
- `labAt()` --calls--> `rgbToLab()`  [EXTRACTED]
  tests/disc-stamp-delight.mjs → public/disc-stamp-extract.mjs
- `editorFixture()` --indirect_call--> `isHalo()`  [INFERRED]
  tests/photo-editor-races.mjs → public/disc3d/halo.mjs
- `flagged()` --calls--> `isOvermold()`  [EXTRACTED]
  tests/disc3d-overmold.mjs → public/disc3d/overmold.mjs

## Import Cycles
- None detected.

## Communities (174 total, 34 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (81): activeLens(), addDestinationControl(), applyTheme(), atlasPriority(), bagColors(), brandColor(), brandList(), brandPalette (+73 more)

### Community 1 - "workers/auth.mjs"
Cohesion: 0.21
Nodes (19): base64url(), body(), cookie(), createAuth(), account(), callback(), session(), start() (+11 more)

### Community 2 - "Bag scene"
Cohesion: 0.10
Nodes (10): accent(), BAG_SPRING, BagScene, div(), loadViewer(), POCKET, reduced(), stampStyle() (+2 more)

### Community 3 - "bag.js"
Cohesion: 0.10
Nodes (49): dynamic, GET(), GET(), DELETE(), photoBytes(), POST(), PUT(), save() (+41 more)

### Community 4 - "bag-collections-browser.mjs"
Cohesion: 0.20
Nodes (12): frontAt(), FRONT_RING, dE(), delit(), disc(), enc(), L(), lab() (+4 more)

### Community 5 - "scripts"
Cohesion: 0.03
Nodes (64): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+56 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.09
Nodes (44): encodeHalo(), photoLook(), albedoCanvas(), bandRatio(), canvasBitmap(), canvasBlob(), checkPhotoSize(), colorStampBlob() (+36 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.06
Nodes (37): a, args, base(), brandCount, byId, cellPool(), cells, excludedIds (+29 more)

### Community 8 - "package.json"
Cohesion: 0.04
Nodes (44): engines, node, name, packageManager, private, type, version, @base-ui/react (+36 more)

### Community 9 - "disc3d-popout-browser.mjs"
Cohesion: 0.07
Nodes (19): byName(), {chromium}, errors, server, settle(), show(), types, view() (+11 more)

### Community 10 - "dropdown-indicator-browser.mjs"
Cohesion: 0.14
Nodes (10): RACK_STYLES, RACK_CAPACITY, rackCount(), BAYS, CollectionScene, esc(), LostScene, plural() (+2 more)

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.10
Nodes (29): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+21 more)

### Community 12 - "initAtlasMap"
Cohesion: 0.20
Nodes (20): animateZoom(), cameraMoving(), catchAtlasIntro(), changeZoom(), clearClusterTimers(), closeCluster(), initAtlasMap(), loadAtlasArt() (+12 more)

### Community 13 - "halo-plastic-browser.mjs"
Cohesion: 0.04
Nodes (60): {chromium}, command(), metrics, server, probe(), file(), chroma(), {chromium} (+52 more)

### Community 14 - "my-bag.js"
Cohesion: 0.06
Nodes (49): activateBag(), addMenu, addMenuOpen(), bagColorMap, bagFinishMap, bagHaloMap, bagHaloModelMap, bagPhotoMap (+41 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.07
Nodes (32): atlasPositions, CAMERA_AXES, cameraSpring, clusterPicks, comparisonMarkup(), comparisonPalette(), discArt(), dropMarkerArt() (+24 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.14
Nodes (39): lightTheme(), angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), applyTurn(), attach(), build() (+31 more)

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.09
Nodes (35): GLB_ACCENT_POSE, stageMode(), attachDiscFeatures(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot(), advanceTime() (+27 more)

### Community 20 - "mountRacks"
Cohesion: 0.15
Nodes (20): BEFORE, box(), CHOSEN, clip(), closeMenu(), compose(), LIME, load() (+12 more)

### Community 21 - "json"
Cohesion: 0.13
Nodes (4): main(), slug(), tile(), Validator

### Community 22 - "overmold.mjs"
Cohesion: 0.16
Nodes (21): ASYM_FEATHER, asymFront(), drawnFront(), [dye,wash,plate,ink], dyeShare(), enc(), fbm(), glared() (+13 more)

### Community 23 - "collection-scenes.js"
Cohesion: 0.19
Nodes (19): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagLayout(), bagClass(), bagComparator() (+11 more)

### Community 24 - "bag-values.js"
Cohesion: 0.11
Nodes (26): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagPalette(), bagSlots(), DEFAULT_BAG_COLOR, defaultDiscDetails() (+18 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "collection-layout.mjs"
Cohesion: 0.24
Nodes (13): epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN, MAX_TURN, PLOT_DEPTH (+5 more)

### Community 27 - "stamp.mjs"
Cohesion: 0.17
Nodes (21): GLARE_CEILING, box(), CLONE_STEPS, cloneCores(), delightStamp(), distanceTo(), encode(), f() (+13 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.10
Nodes (23): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+15 more)

### Community 29 - "scheduleMapDraw"
Cohesion: 0.15
Nodes (13): args, at(), {chromium}, dpr, errors, GESTURES, intro(), report (+5 more)

### Community 30 - "stage.mjs"
Cohesion: 0.12
Nodes (14): CAMERAS, checks, {chromium}, clean(), errors, gapArt(), SCENE(), server (+6 more)

### Community 31 - "lens-corner-browser.mjs"
Cohesion: 0.12
Nodes (20): asset, dE(), flag, haveRaptor, hex(), hsv(), lab(), med() (+12 more)

### Community 32 - "collection-layout.mjs"
Cohesion: 0.14
Nodes (12): NpmCacheProgress, runNpmInstall(), CACHE_SEEDS, holdInstallLocks(), InstallProgress, main(), openLock(), openReport() (+4 more)

### Community 33 - "racks.mjs"
Cohesion: 0.10
Nodes (23): BAYS_PER_TIER, CLASS_ORDER, pulledSpot(), RACK_DEPTH, RACK_GAP, RACK_HEIGHT, RACK_WIDTH, SHELF_CLEARANCE (+15 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.07
Nodes (41): assignSides(), BAG_BOX, brickRows(), byKey(), clamp(), depthOrder(), DISC, fan() (+33 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.18
Nodes (28): bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress(), delightPixels() (+20 more)

### Community 36 - "atlas-art.mjs"
Cohesion: 0.15
Nodes (13): checks, {chromium}, clickLands(), completeDot(), errors, mapOwned(), onMap(), READABLE() (+5 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "racks.mjs"
Cohesion: 0.16
Nodes (30): account(), adoptUp(), api(), blobOf(), broken, cached(), changed(), coloured() (+22 more)

### Community 39 - "halo-swirl.mjs"
Cohesion: 0.21
Nodes (22): rackSlot(), rackX(), restHeight(), rowWidth(), mountRacks(), batchFor(), box(), drop() (+14 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.08
Nodes (14): seeThroughPlastic(), isHalo(), keepSnapshotAsset(), photoColorHint(), photoEditor, plasticChoice(), sheetStampStyle(), stampChoice() (+6 more)

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.20
Nodes (17): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+9 more)

### Community 43 - "shape.mjs"
Cohesion: 0.22
Nodes (11): DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, KEYS, LIST, OVERMOLD_DISCS, overmoldColors(), parseColor(), toHex() (+3 more)

### Community 44 - "public.mjs"
Cohesion: 0.14
Nodes (13): delete(), fixture(), item, setup(), database(), setup(), database(), setup() (+5 more)

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
Cohesion: 0.16
Nodes (17): plateColor(), applyClearPhotoRows(), clearPhotoPixels(), EDGE, edgeRadius(), fitCircle(), hexBytes(), labOf() (+9 more)

### Community 49 - "api.cjs"
Cohesion: 0.12
Nodes (11): assert, {createRequire}, fs, {Miniflare}, req, root, assert, ctx (+3 more)

### Community 50 - "render"
Cohesion: 0.26
Nodes (15): close(), components(), distanceTo(), extractPhotoStamp(), fillFromRing(), gaussian(), ghosts(), hexToLab() (+7 more)

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
Nodes (11): checks, {chromium}, errors, SCENE(), server, settled(), show(), VIEWPORTS (+3 more)

### Community 55 - "display-customization-evidence.mjs"
Cohesion: 0.03
Nodes (54): plastic(), {chromium}, server, {chromium}, command(), errors, server, {chromium} (+46 more)

### Community 56 - "disc3d/viewer.mjs"
Cohesion: 0.10
Nodes (29): CLEAR, CLEAR_ORDER, clearBackdrop(), clearMeshes(), clearPage(), clearRig(), defines(), num() (+21 more)

### Community 57 - "sites-env.sh"
Cohesion: 0.14
Nodes (13): HOME, MINIFLARE_REGISTRY_PATH, npm_config_audit, npm_config_cache, npm_config_fund, npm_config_update_notifier, sites-env.sh script, SITES_ENV_READY (+5 more)

### Community 58 - "atlas-depth.mjs"
Cohesion: 0.15
Nodes (9): boxes(), CHROME, discs, LEVELS, positions, prints, rooms(), runtime (+1 more)

### Community 59 - "accent-done-button-evidence.mjs"
Cohesion: 0.15
Nodes (15): ACCENTS, actions(), BEFORE, CHOSEN, closeSheet(), doneStates(), load(), openSheet() (+7 more)

### Community 60 - "ref_node_assert"
Cohesion: 0.04
Nodes (25): output, data, context, T, ids, items, worker(), runtime (+17 more)

### Community 61 - "vite.config.ts"
Cohesion: 0.18
Nodes (6): vinext, vite, readExecutionProfile(), cli, [command, ...args], localBindingConfig

### Community 62 - "bag-spin-pocket-browser.mjs"
Cohesion: 0.15
Nodes (25): selected(), ABOVE_GROUND, engraving(), mountGraveyard(), dress(), hover(), idAt(), makePlot() (+17 more)

### Community 63 - "halo-band-sampling.mjs"
Cohesion: 0.22
Nodes (12): DYE, SEAM, dE(), disc(), enc(), isDye(), L(), lab() (+4 more)

### Community 64 - "atlas-layout.mjs"
Cohesion: 0.19
Nodes (9): catalogBase, context, filters(), fixtures, random(), rated, score(), sizes (+1 more)

### Community 65 - "disc-register.mjs"
Cohesion: 0.12
Nodes (35): along(), apply(), autoRegister(), CENTRE_CAP, cropThrough(), designCentre(), eigen(), ellipseFrom() (+27 more)

### Community 66 - "my-map-browser.mjs"
Cohesion: 0.18
Nodes (8): BAG, checks, {chromium}, command(), errors, metrics, server, shots

### Community 67 - "Page"
Cohesion: 0.16
Nodes (7): fixture(), chunk(), extended(), fixture(), fixture(), byId, createBag()

### Community 68 - "pathlib"
Cohesion: 0.12
Nodes (8): digest(), measure(), extract(), slug(), digest(), run(), slug(), extract()

### Community 69 - "tests/disc-stamp-clear.mjs"
Cohesion: 0.18
Nodes (14): clearPhoto(), disc(), GLARE, glareCase(), HAIR, inBox(), NAVY, NAVY_BOX (+6 more)

### Community 70 - "atlas-speed-band-browser.mjs"
Cohesion: 0.18
Nodes (10): CAMERAS, {chromium}, errors, failures, RENDERED(), server, settled(), show() (+2 more)

### Community 72 - "ref_node_module"
Cohesion: 0.18
Nodes (9): base, CHROME, off(), prints, rated, runtime, SIZES, STATES (+1 more)

### Community 73 - "apple-design-2-browser.mjs"
Cohesion: 0.11
Nodes (13): {chromium}, ink(), server, at, baseline, compare(), noise, runs (+5 more)

### Community 74 - "display-palette.mjs"
Cohesion: 0.23
Nodes (12): contrast(), distance(), lab(), linear(), luminance(), MATRICES, minDistance(), oklch() (+4 more)

### Community 75 - "halo.mjs"
Cohesion: 0.19
Nodes (12): HALO_FEATHER, HALO_FORMAT, HALO_PLASTICS, HALO_RING, HALO_STREAKS, NAMES, haloCoord(), linear() (+4 more)

### Community 76 - "bag-staging-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 77 - "slider-drag-browser.mjs"
Cohesion: 0.24
Nodes (10): assertRangeDrag(), checkRangeDefaults(), dragRange(), {chromium}, errors, probe(), results, server (+2 more)

### Community 78 - "render"
Cohesion: 0.23
Nodes (14): body(), json(), LOOKS, owned(), part(), placed(), PNG_CHUNKS, shape() (+6 more)

### Community 79 - "personal-lens.mjs"
Cohesion: 0.39
Nodes (6): syncMyMap(), COPY_BIAS_SHIFT, moldShifts(), personalPositions(), context, molds

### Community 80 - "photo-albedo.mjs"
Cohesion: 0.24
Nodes (11): SOFTEN_GLARE, ab(), enc(), lin(), luma(), lumAt(), photo(), enc() (+3 more)

### Community 81 - "state"
Cohesion: 0.23
Nodes (11): clamp(), DEFAULT_RACK_COLOR, discPose(), easeInOut(), mix(), RESTAGE_MS, SLIDE_MS, stage() (+3 more)

### Community 82 - "apple-design-3-browser.mjs"
Cohesion: 0.17
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 83 - "bag-spin-pocket-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, metrics, server, shots, THEMES

### Community 84 - "public/disc-stamp-color.mjs"
Cohesion: 0.30
Nodes (13): box(), distanceTo(), encode(), extractStampColor(), finv(), gaussian(), kmeans(), labToRgb() (+5 more)

### Community 85 - "buildClusters"
Cohesion: 0.21
Nodes (16): buildClusters(), cancelRegroup(), drawGaps(), ensureGroupWorker(), flightLevel(), gapName(), gapSprite(), hydrateGaps() (+8 more)

### Community 86 - "palette.mjs"
Cohesion: 0.22
Nodes (8): {chromium}, contrast(), errors, full(), linear(), luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.08
Nodes (18): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+10 more)

### Community 88 - "workers/disc-requests.mjs"
Cohesion: 0.25
Nodes (5): FLIGHT, headers, isHttpUrl(), LENGTHS, validateRequest()

### Community 89 - "ref_node_vm"
Cohesion: 0.06
Nodes (26): state(), command(), bagCalls, checks, {chromium}, command(), errors, server (+18 more)

### Community 91 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.05
Nodes (34): mold(), rated(), assignments, baseline, batch, {chromium}, controls, molds (+26 more)

### Community 92 - "apple-design-2-browser.mjs"
Cohesion: 0.13
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 93 - "theme"
Cohesion: 0.15
Nodes (29): pocketLabel(), stabilityBiasLabel(), api(), chooseRackStyle(), endDrag(), focusFirst(), foundDisc(), gallery (+21 more)

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

### Community 98 - "markerTarget"
Cohesion: 0.39
Nodes (8): dotArtRadius(), drawCompareHighlights(), keepPinned(), mapMarkerScale(), markerLabel(), markerTarget(), nameGrid(), yieldNames()

### Community 99 - "install-pnpm.sh"
Cohesion: 0.39
Nodes (7): acquire_shared_lock(), can_write_directory(), release_shared_lock(), report_store(), install-pnpm.sh script, XDG_CACHE_HOME, XDG_DATA_HOME

### Community 102 - "bag-scene-browser.mjs"
Cohesion: 0.09
Nodes (14): {chromium}, COLORS, command(), errors, MOLDS, PLASTICS, report, server (+6 more)

### Community 103 - "schema.ts"
Cohesion: 0.33
Nodes (4): bagItems, coachUsage, profiles, drizzle-orm

### Community 104 - "account.js"
Cohesion: 0.52
Nodes (5): api(), refresh(), renderPage(), signOut(), sync()

### Community 105 - "renderMarkers"
Cohesion: 0.17
Nodes (8): baseline, {chromium}, photos, profile, server, verifyLayout, verifyTextures, verifyTransitions

### Community 106 - "prompt-4-leftovers-browser.mjs"
Cohesion: 0.18
Nodes (5): pause(), pw, report, selectDisc(), server

### Community 107 - "stamp.mjs"
Cohesion: 0.12
Nodes (27): build(), paint(), preview(), observeDiscThumbnails(), getAtlasArt(), isColorStamp(), PHOTO_STAMP, DETAIL (+19 more)

### Community 108 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 109 - "atlas-targets.js"
Cohesion: 0.53
Nodes (4): inBox(), pick(), reach(), reads()

### Community 110 - "atlas-3d-perf.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, perf, server, shots, themes (+1 more)

### Community 111 - "bag-map-controls-browser.mjs"
Cohesion: 0.15
Nodes (10): checks, {chromium}, command(), errors, GOTO, MAIN, metrics, PUTTERS (+2 more)

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 113 - "appearance.js"
Cohesion: 0.13
Nodes (36): bagDiscGeometry(), discParts(), discGeometry(), groupRim(), lathePoints(), PLASTICS, isOvermold(), clamp() (+28 more)

### Community 115 - "0000_powerful_pepper_potts.sql"
Cohesion: 0.50
Nodes (3): `bag_items`, `coach_usage`, `profiles`

### Community 116 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 117 - "HttpCache"
Cohesion: 0.17
Nodes (9): checks, {chromium}, command(), controls, errors, server, shots, THEMES (+1 more)

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 121 - "theme"
Cohesion: 0.05
Nodes (29): theme(), {chromium}, command(), errors, server, shots, themes, widths (+21 more)

### Community 140 - "disc-request.js"
Cohesion: 0.36
Nodes (5): clearErrors(), fieldsFor(), fillBrands(), open(), showErrors()

### Community 141 - "DiscmaniaIdentity"
Cohesion: 0.20
Nodes (16): inkBounds(), bestShift(), box(), CHROMA, encode(), field(), INK, labToRgb() (+8 more)

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 143 - "shopping.js"
Cohesion: 0.70
Nodes (4): offers(), render(), row(), tracking()

### Community 144 - "textures.mjs"
Cohesion: 0.43
Nodes (6): results, validateUpload(), imageBytes(), json(), photoRoute(), validateProcessedWebP()

### Community 146 - "tests/disc-stamp-color.mjs"
Cohesion: 0.33
Nodes (7): f(), rgbToLab(), disc(), hexLab(), labAt(), region(), sharp

### Community 147 - "disc-appearance-browser.mjs"
Cohesion: 0.25
Nodes (7): by(), catalog, {chromium}, examples, items, server, settings

### Community 148 - "photo-level-measure.mjs"
Cohesion: 0.43
Nodes (4): angleOf(), luma(), renderedStampAngle(), stampAngle()

### Community 149 - "disc-webp.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

### Community 152 - "photo-stamp-color-assets-evidence.mjs"
Cohesion: 0.31
Nodes (8): bagShots(), cases, CHOSEN, finishOnly, frame(), results, viewerShots(), wait()

### Community 153 - "stamp-extraction-fidelity.mjs"
Cohesion: 0.38
Nodes (6): at(), extract(), LETTERS, peak(), sharp, SMALL

### Community 154 - "stage.mjs"
Cohesion: 0.12
Nodes (38): coarse(), DISC_BUDGET, discMaterial(), discModel(), parts, personalStampStyle(), softwareRenderer(), stage() (+30 more)

### Community 155 - "display-harness.mjs"
Cohesion: 0.05
Nodes (32): scene, photo, log(), photo, results, directoryLink, form, mapLink (+24 more)

### Community 156 - "photo-stamp-color-assets-browser.mjs"
Cohesion: 0.33
Nodes (6): dE(), hex(), inksIn(), lab(), photo(), sharp

### Community 157 - "more-packs-evidence.mjs"
Cohesion: 0.31
Nodes (5): openSheet(), packs(), region(), setTheme(), wait()

### Community 158 - "renderMarkers"
Cohesion: 0.20
Nodes (10): artZooming(), cameraLooksStill(), fadeOut(), layoutZoom(), measureChrome(), organicOptions(), photoMarkup(), remeasureLabels() (+2 more)

### Community 159 - "0017_disc_requests.sql"
Cohesion: 0.60
Nodes (4): disc_request_throttle, disc_request_throttle_hour, disc_requests, disc_requests_status

### Community 160 - "display-customization-browser.mjs"
Cohesion: 0.29
Nodes (3): agree(), CLASSIC, consumers()

### Community 161 - "disc-webp.mjs"
Cohesion: 0.33
Nodes (3): fallbackWebP(), encodeWebP(), loadEncoder()

### Community 162 - "mapTargets"
Cohesion: 0.50
Nodes (4): gapTarget(), keepPinnedGaps(), levelHeld(), mapTargets()

### Community 163 - "photo-stamp-sync.mjs"
Cohesion: 0.36
Nodes (7): C, form(), P, png(), put(), sharp, webp()

### Community 165 - "tests/disc-stamp-delight.mjs"
Cohesion: 0.27
Nodes (7): disc(), enc(), flash(), labAt(), lin(), sharp, SPOT

### Community 169 - "coach-worker.mjs"
Cohesion: 0.32
Nodes (5): jose, googleFetch, reply, worker, googleFixture()

### Community 172 - "workers/coach.mjs"
Cohesion: 0.31
Nodes (8): askCoach(), coachContext(), groundedReply(), headers, instructions(), json(), schema, usageCost()

### Community 173 - "ref_node_path"
Cohesion: 0.03
Nodes (50): output, server, projectRoot, checks, {chromium}, errors, server, types (+42 more)

### Community 174 - "tests/disc-stamp-extract.mjs"
Cohesion: 0.53
Nodes (5): at(), disc(), extract(), mean(), sharp

### Community 178 - "ref_node_test"
Cohesion: 0.10
Nodes (17): CLAY_TONES, esc(), LABELS, n(), PROFILE_FRAME, profileDimensions(), profileSVG(), SPEC (+9 more)

## Knowledge Gaps
- **52 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1380 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jose` connect `coach-worker.mjs` to `package.json`, `workers/auth.mjs`, `public.mjs`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `createDiscViewer()` (e.g. with `applyPose()` and `attach()`) actually correct?**
  _`createDiscViewer()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05906553041434029 - nodes in this community are weakly interconnected._
- **Why does `inCollection()` connect `app.js` to `bag-map-controls-browser.mjs`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10261569416498995 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._