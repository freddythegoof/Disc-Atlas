# Graph Report - stamp-look-extraction  (2026-10-27)

## Corpus Check
- 470 files · ~5,719,669 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 314 file(s) not represented in the graph (top: .log 239, .gz 23, .css 16)

## Summary
- 3224 nodes · 6992 edges · 176 communities (142 shown, 34 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 256 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `72dc73f3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- workers/auth.mjs
- Bag scene
- bag.js
- halo-band-v2.mjs
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
- atlas-depth-browser.mjs
- clear-true-color-browser.mjs
- pnpm-install.mjs
- bag-v12-browser.mjs
- bag-layout.mjs
- disc-albedo.mjs
- atlas-persist-browser.mjs
- devDependencies
- photo-stamps.mjs
- mountRacks
- photo-editor-races.mjs
- compilerOptions
- atlas-groups.js
- overmold.mjs
- stamp-look.mjs
- bag-interactions-browser.mjs
- components.json
- Detail and pop-out viewer bridge
- photo-true-color.mjs
- api.cjs
- public/disc-stamp-extract.mjs
- atlas-organic-browser.mjs
- Catalog generation and stamp validation
- apple-design-browser.mjs
- .zoom
- ref_node_module
- disc3d/viewer.mjs
- sites-env.sh
- atlas-depth.mjs
- accent-done-button-evidence.mjs
- ref_node_child_process
- vite.config.ts
- mountGraveyard
- halo-band-sampling.mjs
- atlas-layout.mjs
- disc-register.mjs
- my-map-browser.mjs
- workers/bag.mjs
- pathlib
- tests/disc-stamp-clear.mjs
- atlas-speed-band-browser.mjs
- Page
- atlas-speed-band.mjs
- photo-stamp-identity-browser.mjs
- display-palette.mjs
- gallery-fixes-browser.mjs
- bag-staging-browser.mjs
- slider-drag-browser.mjs
- stamps.mjs
- ref_node_test
- photo-albedo.mjs
- rack-motion.mjs
- bag-popup-browser.mjs
- atlas-lod.mjs
- public/disc-stamp-color.mjs
- buildClusters
- palette.mjs
- discraft-fraction-audit-browser.mjs
- appearance.js
- state
- StampManifestTests
- discraft-stamps-batch2-browser.mjs
- ref_node_path
- render
- display-palette.js
- tweenCamera
- atlas-motion.js
- coach.js
- lens-corner-browser.mjs
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
- bag-3d-browser.mjs
- bag-tweaks-browser.mjs
- install-ci.sh
- shape.mjs
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- dropdown-indicator-browser.mjs
- cloudflare-env.d.ts
- overrides
- NameTag
- theme
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- apple-design-browser.mjs
- disc-stamp-worker.mjs
- compose-discraft-fraction-proofs.py
- shopping.js
- sync
- tests/disc-stamp-color.mjs
- disc-appearance-browser.mjs
- photo-level-measure.mjs
- atlas-organic.mjs
- photo-stamp-color-assets-evidence.mjs
- stamp-extraction-fidelity.mjs
- stage.mjs
- display-harness.mjs
- photo-stamp-color-assets-browser.mjs
- more-packs-evidence.mjs
- drawGaps
- display-customization-evidence.mjs
- display-customization-browser.mjs
- disc-webp.mjs
- clear-plastic-partb-evidence.mjs
- photo-stamp-sync.mjs
- HttpCache
- tests/disc-stamp-delight.mjs
- DiscmaniaIdentity
- photo-stamp-assets-evidence.mjs
- photo-adder-rework-browser.mjs
- public.mjs
- workers/coach.mjs
- ref_node_path
- tests/disc-stamp-extract.mjs
- shapeFrame

## God Nodes (most connected - your core abstractions)
1. `createDiscViewer()` - 66 edges
2. `scripts` - 63 edges
3. `BagScene` - 63 edges
4. `mountRacks()` - 44 edges
5. `mountBag()` - 43 edges
6. `createAtlasArt()` - 36 edges
7. `render()` - 36 edges
8. `theme()` - 34 edges
9. `state()` - 32 edges
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
- `fixture()` --calls--> `createBag()`  [EXTRACTED]
  tests/photo-true-color.mjs → workers/bag.mjs

## Import Cycles
- None detected.

## Communities (176 total, 34 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (80): activeLens(), addDestinationControl(), applyTheme(), atlasPriority(), bagColors(), brandColor(), brandList(), brandPalette (+72 more)

### Community 1 - "workers/auth.mjs"
Cohesion: 0.21
Nodes (17): base64url(), body(), cookie(), account(), callback(), session(), start(), write() (+9 more)

### Community 2 - "Bag scene"
Cohesion: 0.10
Nodes (10): accent(), BAG_SPRING, BagScene, div(), loadViewer(), POCKET, reduced(), stampStyle() (+2 more)

### Community 3 - "bag.js"
Cohesion: 0.10
Nodes (49): dynamic, GET(), GET(), DELETE(), photoBytes(), POST(), PUT(), save() (+41 more)

### Community 4 - "halo-band-v2.mjs"
Cohesion: 0.18
Nodes (13): FRONT_RING, ASYM_FEATHER, SEAM, dE(), delit(), disc(), enc(), L() (+5 more)

### Community 5 - "scripts"
Cohesion: 0.03
Nodes (63): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+55 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.09
Nodes (42): encodeHalo(), photoLook(), albedoCanvas(), canvasBitmap(), canvasBlob(), checkPhotoSize(), colorStampBlob(), createPhotoEditor() (+34 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.06
Nodes (37): a, args, base(), brandCount, byId, cellPool(), cells, excludedIds (+29 more)

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
Cohesion: 0.18
Nodes (22): animateZoom(), cameraMoving(), catchAtlasIntro(), changeZoom(), clearClusterTimers(), closeCluster(), initAtlasMap(), levelHeld() (+14 more)

### Community 13 - "halo-plastic-browser.mjs"
Cohesion: 0.04
Nodes (54): {chromium}, command(), metrics, server, probe(), chroma(), {chromium}, command() (+46 more)

### Community 14 - "my-bag.js"
Cohesion: 0.05
Nodes (51): seeThroughPlastic(), addMenu, addMenuOpen(), bagColorMap, bagFinishMap, bagHaloMap, bagHaloModelMap, bagPhotoMap (+43 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.07
Nodes (33): atlasPositions, CAMERA_AXES, cameraSpring, clusterPicks, comparisonMarkup(), comparisonPalette(), discArt(), dropMarkerArt() (+25 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.14
Nodes (39): lightTheme(), angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), applyTurn(), attach(), build() (+31 more)

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.07
Nodes (44): DISC, stageMode(), attachDiscFeatures(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot(), advanceTime() (+36 more)

### Community 20 - "accent-follows-appearance-evidence.mjs"
Cohesion: 0.15
Nodes (20): BEFORE, box(), CHOSEN, clip(), closeMenu(), compose(), LIME, load() (+12 more)

### Community 21 - "json"
Cohesion: 0.13
Nodes (4): main(), slug(), tile(), Validator

### Community 22 - "halo-swirl.mjs"
Cohesion: 0.16
Nodes (21): asymFront(), drawnFront(), DYE, [dye,wash,plate,ink], dyeShare(), enc(), fbm(), glared() (+13 more)

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.19
Nodes (18): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagClass(), bagComparator(), stampChoiceOf() (+10 more)

### Community 24 - "bag-values.js"
Cohesion: 0.10
Nodes (28): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagPalette(), bagSlots(), DEFAULT_BAG_COLOR, defaultDiscDetails() (+20 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "collection-scenes.js"
Cohesion: 0.10
Nodes (28): RACK_STYLES, epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN, MAX_TURN (+20 more)

### Community 27 - "public/disc-stamp-delight.mjs"
Cohesion: 0.17
Nodes (21): GLARE_CEILING, box(), CLONE_STEPS, cloneCores(), delightStamp(), distanceTo(), encode(), f() (+13 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.10
Nodes (23): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+15 more)

### Community 29 - "atlas-gesture-probe.mjs"
Cohesion: 0.15
Nodes (13): args, at(), {chromium}, dpr, errors, GESTURES, intro(), report (+5 more)

### Community 30 - "atlas-depth-browser.mjs"
Cohesion: 0.12
Nodes (14): CAMERAS, checks, {chromium}, clean(), errors, gapArt(), SCENE(), server (+6 more)

### Community 31 - "clear-true-color-browser.mjs"
Cohesion: 0.12
Nodes (20): asset, dE(), flag, haveRaptor, hex(), hsv(), lab(), med() (+12 more)

### Community 32 - "pnpm-install.mjs"
Cohesion: 0.21
Nodes (10): CACHE_SEEDS, holdInstallLocks(), InstallProgress, main(), openLock(), openReport(), OPERATIONAL_FAILURE_CODES, showLine() (+2 more)

### Community 33 - "bag-v12-browser.mjs"
Cohesion: 0.22
Nodes (7): {chromium}, command(), errors, server, shots, themes, widths

### Community 34 - "bag-layout.mjs"
Cohesion: 0.07
Nodes (42): assignSides(), BAG_BOX, bagLayout(), brickRows(), byKey(), clamp(), depthOrder(), fan() (+34 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.17
Nodes (30): bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress(), delightPixels() (+22 more)

### Community 36 - "atlas-persist-browser.mjs"
Cohesion: 0.15
Nodes (13): checks, {chromium}, clickLands(), completeDot(), errors, mapOwned(), onMap(), READABLE() (+5 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "photo-stamps.mjs"
Cohesion: 0.14
Nodes (33): account(), adoptUp(), api(), assetOf(), blobOf(), broken, cached(), changed() (+25 more)

### Community 39 - "mountRacks"
Cohesion: 0.16
Nodes (25): rackStyle(), rackSlot(), rackX(), restHeight(), rowWidth(), finishOf(), lerp3(), mountRacks() (+17 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.09
Nodes (8): isHalo(), keepSnapshotAsset(), apiSource, bagSource, closeSource, editorFixture(), saveSource, stampStubs

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.20
Nodes (17): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+9 more)

### Community 43 - "overmold.mjs"
Cohesion: 0.20
Nodes (13): DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, isOvermold(), KEYS, LIST, OVERMOLD_DISCS, overmoldColors(), parseColor() (+5 more)

### Community 44 - "stamp-look.mjs"
Cohesion: 0.26
Nodes (9): fixture(), item, setup(), database(), setup(), createAuth(), createCoach(), createPublicWorker() (+1 more)

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
Cohesion: 0.15
Nodes (17): applyClearPhotoRows(), clearPhotoPixels(), EDGE, edgeRadius(), fitCircle(), hexBytes(), labOf(), planClearPhoto() (+9 more)

### Community 49 - "api.cjs"
Cohesion: 0.12
Nodes (11): assert, {createRequire}, fs, {Miniflare}, req, root, assert, ctx (+3 more)

### Community 50 - "public/disc-stamp-extract.mjs"
Cohesion: 0.26
Nodes (15): close(), components(), distanceTo(), extractPhotoStamp(), fillFromRing(), gaussian(), ghosts(), hexToLab() (+7 more)

### Community 51 - "atlas-organic-browser.mjs"
Cohesion: 0.15
Nodes (13): checks, {chromium}, errors, layout(), near(), SCENARIOS, server, settled() (+5 more)

### Community 52 - "Catalog generation and stamp validation"
Cohesion: 0.25
Nodes (4): brandnorm(), norm(), validate_stamp_fields(), validate_stamp_manifest()

### Community 53 - "apple-design-browser.mjs"
Cohesion: 0.12
Nodes (23): active(), canvas, desktop, eligible(), fallback(), frame(), hero, motion (+15 more)

### Community 54 - ".zoom"
Cohesion: 0.15
Nodes (11): checks, {chromium}, errors, SCENE(), server, settled(), show(), VIEWPORTS (+3 more)

### Community 55 - "ref_node_module"
Cohesion: 0.04
Nodes (41): {chromium}, server, {chromium}, command(), errors, server, {chromium}, server (+33 more)

### Community 56 - "disc3d/viewer.mjs"
Cohesion: 0.11
Nodes (22): clearPage(), frontAt(), HALO_FEATHER, HALO_FORMAT, HALO_RING, HALO_STREAKS, NAMES, parseHalo() (+14 more)

### Community 57 - "sites-env.sh"
Cohesion: 0.14
Nodes (13): HOME, MINIFLARE_REGISTRY_PATH, npm_config_audit, npm_config_cache, npm_config_fund, npm_config_update_notifier, sites-env.sh script, SITES_ENV_READY (+5 more)

### Community 58 - "atlas-depth.mjs"
Cohesion: 0.15
Nodes (9): boxes(), CHROME, discs, LEVELS, positions, prints, rooms(), runtime (+1 more)

### Community 59 - "accent-done-button-evidence.mjs"
Cohesion: 0.15
Nodes (15): ACCENTS, actions(), BEFORE, CHOSEN, closeSheet(), doneStates(), load(), openSheet() (+7 more)

### Community 60 - "ref_node_child_process"
Cohesion: 0.12
Nodes (14): output, data, results, results, baseline, characterize, ref, results (+6 more)

### Community 61 - "vite.config.ts"
Cohesion: 0.25
Nodes (3): vinext, vite, localBindingConfig

### Community 62 - "mountGraveyard"
Cohesion: 0.15
Nodes (24): ABOVE_GROUND, engraving(), mountGraveyard(), dress(), hover(), idAt(), layout(), makePlot() (+16 more)

### Community 63 - "halo-band-sampling.mjs"
Cohesion: 0.27
Nodes (10): dE(), disc(), enc(), isDye(), L(), lab(), lch(), lin() (+2 more)

### Community 64 - "atlas-layout.mjs"
Cohesion: 0.19
Nodes (9): catalogBase, context, filters(), fixtures, random(), rated, score(), sizes (+1 more)

### Community 65 - "disc-register.mjs"
Cohesion: 0.12
Nodes (35): along(), apply(), autoRegister(), CENTRE_CAP, cropThrough(), designCentre(), eigen(), ellipseFrom() (+27 more)

### Community 66 - "my-map-browser.mjs"
Cohesion: 0.18
Nodes (8): BAG, checks, {chromium}, command(), errors, metrics, server, shots

### Community 67 - "workers/bag.mjs"
Cohesion: 0.17
Nodes (11): validateUpload(), fixture(), chunk(), extended(), fixture(), byId, createBag(), imageBytes() (+3 more)

### Community 68 - "pathlib"
Cohesion: 0.12
Nodes (8): digest(), measure(), extract(), slug(), digest(), run(), slug(), extract()

### Community 69 - "tests/disc-stamp-clear.mjs"
Cohesion: 0.18
Nodes (14): clearPhoto(), disc(), GLARE, glareCase(), HAIR, inBox(), NAVY, NAVY_BOX (+6 more)

### Community 70 - "atlas-speed-band-browser.mjs"
Cohesion: 0.18
Nodes (10): CAMERAS, {chromium}, errors, failures, RENDERED(), server, settled(), show() (+2 more)

### Community 72 - "atlas-speed-band.mjs"
Cohesion: 0.18
Nodes (9): base, CHROME, off(), prints, rated, runtime, SIZES, STATES (+1 more)

### Community 73 - "photo-stamp-identity-browser.mjs"
Cohesion: 0.11
Nodes (13): {chromium}, ink(), server, at, baseline, compare(), noise, runs (+5 more)

### Community 74 - "display-palette.mjs"
Cohesion: 0.23
Nodes (12): contrast(), distance(), lab(), linear(), luminance(), MATRICES, minDistance(), oklch() (+4 more)

### Community 75 - "gallery-fixes-browser.mjs"
Cohesion: 0.11
Nodes (10): {chromium}, command(), errors, file(), report, server, make(), ready() (+2 more)

### Community 76 - "bag-staging-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 77 - "slider-drag-browser.mjs"
Cohesion: 0.24
Nodes (10): assertRangeDrag(), checkRangeDefaults(), dragRange(), {chromium}, errors, probe(), results, server (+2 more)

### Community 78 - "stamps.mjs"
Cohesion: 0.23
Nodes (14): body(), json(), LOOKS, owned(), part(), placed(), PNG_CHUNKS, shape() (+6 more)

### Community 79 - "ref_node_test"
Cohesion: 0.09
Nodes (12): syncMyMap(), COPY_BIAS_SHIFT, moldShifts(), personalPositions(), context, T, context, molds (+4 more)

### Community 80 - "photo-albedo.mjs"
Cohesion: 0.24
Nodes (11): SOFTEN_GLARE, ab(), enc(), lin(), luma(), lumAt(), photo(), enc() (+3 more)

### Community 81 - "rack-motion.mjs"
Cohesion: 0.23
Nodes (11): clamp(), DEFAULT_RACK_COLOR, discPose(), easeInOut(), mix(), RESTAGE_MS, SLIDE_MS, stage() (+3 more)

### Community 82 - "bag-popup-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 83 - "atlas-lod.mjs"
Cohesion: 0.36
Nodes (6): HOLD_LIMIT, LOD_MARGIN, lodFor(), LODS, ORDER, walk()

### Community 84 - "public/disc-stamp-color.mjs"
Cohesion: 0.28
Nodes (14): plastic(), box(), distanceTo(), encode(), extractStampColor(), finv(), gaussian(), kmeans() (+6 more)

### Community 85 - "buildClusters"
Cohesion: 0.18
Nodes (21): buildClusters(), cancelRegroup(), dotArtRadius(), drawCompareHighlights(), ensureGroupWorker(), flightLevel(), hydrateGaps(), hydrateGroups() (+13 more)

### Community 86 - "palette.mjs"
Cohesion: 0.22
Nodes (8): {chromium}, contrast(), errors, full(), linear(), luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.08
Nodes (18): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+10 more)

### Community 88 - "appearance.js"
Cohesion: 0.60
Nodes (3): build(), paint(), preview()

### Community 89 - "state"
Cohesion: 0.06
Nodes (25): state(), command(), bagCalls, checks, {chromium}, command(), errors, server (+17 more)

### Community 91 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.05
Nodes (34): mold(), rated(), assignments, baseline, batch, {chromium}, controls, molds (+26 more)

### Community 92 - "ref_node_path"
Cohesion: 0.06
Nodes (19): directory(), readExecutionProfile(), NpmCacheProgress, runNpmInstall(), cli, [command, ...args], projectRoot, checks (+11 more)

### Community 93 - "render"
Cohesion: 0.28
Nodes (20): pocketLabel(), api(), chooseRackStyle(), focusFirst(), foundDisc(), loadBag(), lostItems(), memorialWall() (+12 more)

### Community 94 - "display-palette.js"
Cohesion: 0.42
Nodes (8): accentTokens(), classColor(), commit(), css(), get(), normalize(), paint(), toneOf()

### Community 95 - "tweenCamera"
Cohesion: 0.18
Nodes (18): artFrame(), boundedCamera(), draw(), drawSatelliteLeaders(), featuredDisc(), focusFeatured(), immersiveMap(), introCreep() (+10 more)

### Community 96 - "atlas-motion.js"
Cohesion: 0.19
Nodes (8): fadeOut(), photoMarkup(), renderMarkers(), selectedGroup(), dismiss(), reveal(), selected(), slide()

### Community 97 - "coach.js"
Cohesion: 0.50
Nodes (7): allowance(), api(), append(), appendDraft(), open(), render(), reset()

### Community 98 - "lens-corner-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, server, shots, THEMES, WIDTHS (+1 more)

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
Cohesion: 0.23
Nodes (13): isColorStamp(), PHOTO_STAMP, inkFor(), layer(), luminance(), maskFor(), masks, patternMaps() (+5 more)

### Community 108 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 109 - "atlas-targets.js"
Cohesion: 0.53
Nodes (4): inBox(), pick(), reach(), reads()

### Community 110 - "bag-3d-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, perf, server, shots, themes (+1 more)

### Community 111 - "bag-tweaks-browser.mjs"
Cohesion: 0.15
Nodes (10): checks, {chromium}, command(), errors, GOTO, MAIN, metrics, PUTTERS (+2 more)

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 113 - "shape.mjs"
Cohesion: 0.11
Nodes (38): bagDiscGeometry(), discParts(), HALO_PLASTICS, haloCoord(), discGeometry(), groupRim(), lathePoints(), PLASTICS (+30 more)

### Community 115 - "0000_powerful_pepper_potts.sql"
Cohesion: 0.50
Nodes (3): `bag_items`, `coach_usage`, `profiles`

### Community 116 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 117 - "dropdown-indicator-browser.mjs"
Cohesion: 0.17
Nodes (9): checks, {chromium}, command(), controls, errors, server, shots, THEMES (+1 more)

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 121 - "theme"
Cohesion: 0.05
Nodes (34): theme(), checks, {chromium}, errors, server, types, {chromium}, command() (+26 more)

### Community 140 - "apple-design-browser.mjs"
Cohesion: 0.22
Nodes (4): checks, {chromium}, errors, server

### Community 141 - "disc-stamp-worker.mjs"
Cohesion: 0.20
Nodes (16): inkBounds(), bestShift(), box(), CHROMA, encode(), field(), INK, labToRgb() (+8 more)

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 143 - "shopping.js"
Cohesion: 0.70
Nodes (4): offers(), render(), row(), tracking()

### Community 144 - "sync"
Cohesion: 0.24
Nodes (9): activateBag(), closeBagTips(), isDemo(), leaveBag(), positionBagTips(), setBagView(), showDemo(), sync() (+1 more)

### Community 146 - "tests/disc-stamp-color.mjs"
Cohesion: 0.33
Nodes (7): f(), rgbToLab(), disc(), hexLab(), labAt(), region(), sharp

### Community 147 - "disc-appearance-browser.mjs"
Cohesion: 0.25
Nodes (7): by(), catalog, {chromium}, examples, items, server, settings

### Community 148 - "photo-level-measure.mjs"
Cohesion: 0.43
Nodes (4): angleOf(), luma(), renderedStampAngle(), stampAngle()

### Community 149 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

### Community 152 - "photo-stamp-color-assets-evidence.mjs"
Cohesion: 0.31
Nodes (8): bagShots(), cases, CHOSEN, finishOnly, frame(), results, viewerShots(), wait()

### Community 153 - "stamp-extraction-fidelity.mjs"
Cohesion: 0.38
Nodes (6): at(), extract(), LETTERS, peak(), sharp, SMALL

### Community 154 - "stage.mjs"
Cohesion: 0.10
Nodes (51): finishes, HIDDEN, loadTemplate(), ONE, RACK_FINISHES, roleOf(), SPIN, UPRIGHT (+43 more)

### Community 155 - "display-harness.mjs"
Cohesion: 0.19
Nodes (7): scene, photo, BAG, openDevice(), playwright, startHarness(), startServer()

### Community 156 - "photo-stamp-color-assets-browser.mjs"
Cohesion: 0.33
Nodes (6): dE(), hex(), inksIn(), lab(), photo(), sharp

### Community 157 - "more-packs-evidence.mjs"
Cohesion: 0.31
Nodes (5): openSheet(), packs(), region(), setTheme(), wait()

### Community 158 - "drawGaps"
Cohesion: 0.20
Nodes (11): artZooming(), cameraLooksStill(), drawGaps(), gapName(), gapSprite(), gapTarget(), keepPinnedGaps(), layoutZoom() (+3 more)

### Community 159 - "display-customization-evidence.mjs"
Cohesion: 0.46
Nodes (6): catalogDisc(), ready(), setTheme(), shot(), trio(), wait()

### Community 160 - "display-customization-browser.mjs"
Cohesion: 0.29
Nodes (3): agree(), CLASSIC, consumers()

### Community 161 - "disc-webp.mjs"
Cohesion: 0.33
Nodes (3): fallbackWebP(), encodeWebP(), loadEncoder()

### Community 162 - "clear-plastic-partb-evidence.mjs"
Cohesion: 0.33
Nodes (3): log(), photo, results

### Community 163 - "photo-stamp-sync.mjs"
Cohesion: 0.36
Nodes (7): C, form(), P, png(), put(), sharp, webp()

### Community 165 - "tests/disc-stamp-delight.mjs"
Cohesion: 0.27
Nodes (7): disc(), enc(), flash(), labAt(), lin(), sharp, SPOT

### Community 167 - "photo-stamp-assets-evidence.mjs"
Cohesion: 0.36
Nodes (7): bagShots(), cases, CHOSEN, frame(), results, viewerShots(), wait()

### Community 168 - "photo-adder-rework-browser.mjs"
Cohesion: 0.50
Nodes (4): log(), results, sharp, shoot()

### Community 169 - "public.mjs"
Cohesion: 0.18
Nodes (6): jose, delete(), googleFetch, reply, worker, googleFixture()

### Community 172 - "workers/coach.mjs"
Cohesion: 0.31
Nodes (8): askCoach(), coachContext(), groundedReply(), headers, instructions(), json(), schema, usageCost()

### Community 173 - "ref_node_path"
Cohesion: 0.03
Nodes (37): output, server, checks, {chromium}, errors, only, server, types (+29 more)

### Community 174 - "tests/disc-stamp-extract.mjs"
Cohesion: 0.53
Nodes (5): at(), disc(), extract(), mean(), sharp

### Community 178 - "shapeFrame"
Cohesion: 0.12
Nodes (24): acquirePhoto(), cache, clearPhoto(), heightRows(), luminanceRows(), nextTask(), photoGeometry(), photoSurface() (+16 more)

## Knowledge Gaps
- **52 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1359 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jose` connect `public.mjs` to `package.json`, `workers/auth.mjs`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `createDiscViewer()` (e.g. with `applyPose()` and `attach()`) actually correct?**
  _`createDiscViewer()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05962059620596206 - nodes in this community are weakly interconnected._
- **Why does `inCollection()` connect `app.js` to `bag-tweaks-browser.mjs`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10261569416498995 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._