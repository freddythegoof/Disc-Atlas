# Graph Report - merge-fd-records  (2026-11-07)

## Corpus Check
- 478 files · ~5,724,447 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 315 file(s) not represented in the graph (top: .log 239, .gz 23, .css 17)

## Summary
- 3294 nodes · 7131 edges · 187 communities (148 shown, 39 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 259 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a9be0b3f`
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
- photo-stamp-sync-browser.mjs
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
- stage.mjs
- bag-layout.mjs
- disc-albedo.mjs
- .zoom
- devDependencies
- photo-stamps.mjs
- mountRacks
- photo-editor-races.mjs
- compilerOptions
- atlas-groups.js
- overmold.mjs
- ref_node_test
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
- disc3d/viewer.mjs
- sites-env.sh
- atlas-depth.mjs
- accent-done-button-evidence.mjs
- ref_node_assert
- vite.config.ts
- mountGraveyard
- halo-band-sampling.mjs
- atlas-layout.mjs
- disc-register.mjs
- halo-plastic-browser.mjs
- workers/bag.mjs
- pathlib
- tests/disc-stamp-clear.mjs
- atlas-speed-band-browser.mjs
- Page
- atlas-speed-band.mjs
- photo-stamp-identity-browser.mjs
- display-palette.mjs
- halo.mjs
- bag-staging-browser.mjs
- slider-drag-browser.mjs
- stamps.mjs
- personal-lens.mjs
- photo-albedo.mjs
- rack-motion.mjs
- MergedRecords
- atlas-layout.js
- public/disc-stamp-color.mjs
- buildClusters
- palette.mjs
- discraft-fraction-audit-browser.mjs
- workers/disc-requests.mjs
- bag-popup-browser.mjs
- StampManifestTests
- discraft-stamps-batch2-browser.mjs
- ref_node_path
- render
- display-palette.js
- draw
- atlas-motion.js
- coach.js
- markerTarget
- install-pnpm.sh
- discraft_batch2_test.py
- stamp_fraction_audit_test.py
- bag-collections-browser.mjs
- schema.ts
- account.js
- bag-animation-perf.mjs
- prompt-4-leftovers-browser.mjs
- atlas-art.mjs
- next
- atlas-targets.js
- bag-3d-browser.mjs
- bag-tweaks-browser.mjs
- install-ci.sh
- shape.mjs
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- state
- cloudflare-env.d.ts
- overrides
- NameTag
- theme
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- disc-request.js
- disc-stamp-worker.mjs
- compose-discraft-fraction-proofs.py
- shopping.js
- disc-request-browser.mjs
- sync
- disc-appearance-browser.mjs
- photo-level-measure.mjs
- directory-layout-browser.mjs
- photo-stamp-color-assets-evidence.mjs
- stamp-extraction-fidelity.mjs
- atlas-lod.mjs
- display-harness.mjs
- photo-stamp-color-assets-browser.mjs
- more-packs-evidence.mjs
- bag-scene-browser.mjs
- 0017_disc_requests.sql
- display-customization-browser.mjs
- disc-webp.mjs
- photo-stamp-one-click-evidence.mjs
- photo-stamp-sync.mjs
- HttpCache
- tests/disc-stamp-delight.mjs
- DiscmaniaIdentity
- atlas-3d-perf.mjs
- bag-memorial-browser.mjs
- tests/auth.mjs
- display-customization-evidence.mjs
- photo-stamp-assets-evidence.mjs
- workers/coach.mjs
- ref_node_module
- tests/disc-stamp-extract.mjs
- clear-plastic-partb-evidence.mjs
- appearance.js
- bag-pulled-sizing.mjs
- photo-adder-rework-browser.mjs
- rackStyle
- runtime
- drizzle-kit
- engines
- playwright
- atlas-organic.mjs

## God Nodes (most connected - your core abstractions)
1. `createDiscViewer()` - 66 edges
2. `scripts` - 65 edges
3. `BagScene` - 63 edges
4. `mountRacks()` - 44 edges
5. `mountBag()` - 43 edges
6. `createAtlasArt()` - 36 edges
7. `render()` - 36 edges
8. `theme()` - 35 edges
9. `state()` - 34 edges
10. `delightPixels()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `layout()` --indirect_call--> `columns()`  [INFERRED]
  public/collection3d/graveyard.mjs → tests/bag-3d-layout.mjs
- `sampled()` --calls--> `delightPixels()`  [EXTRACTED]
  tests/halo-band-sampling.mjs → public/disc-albedo.mjs
- `editorFixture()` --indirect_call--> `isHalo()`  [INFERRED]
  tests/photo-editor-races.mjs → public/disc3d/halo.mjs
- `fixture()` --calls--> `createBag()`  [EXTRACTED]
  tests/photo-true-color.mjs → workers/bag.mjs
- `createBag()` --calls--> `validateDiscDetails()`  [EXTRACTED]
  workers/bag.mjs → public/bag-values.js

## Import Cycles
- None detected.

## Communities (187 total, 39 thin omitted)

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

### Community 4 - "halo-band-v2.mjs"
Cohesion: 0.18
Nodes (13): frontAt(), FRONT_RING, ASYM_FEATHER, dE(), delit(), disc(), enc(), L() (+5 more)

### Community 5 - "scripts"
Cohesion: 0.03
Nodes (65): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+57 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.09
Nodes (42): encodeHalo(), photoLook(), albedoCanvas(), canvasBitmap(), canvasBlob(), checkPhotoSize(), colorStampBlob(), createPhotoEditor() (+34 more)

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
Cohesion: 0.18
Nodes (6): rackCount(), CollectionScene, esc(), LostScene, plural(), StorageScene

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.11
Nodes (29): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+21 more)

### Community 12 - "initAtlasMap"
Cohesion: 0.16
Nodes (26): animateZoom(), boundedCamera(), cameraMoving(), catchAtlasIntro(), changeZoom(), clearClusterTimers(), closeCluster(), immersiveMap() (+18 more)

### Community 13 - "photo-stamp-sync-browser.mjs"
Cohesion: 0.04
Nodes (43): {chromium}, command(), metrics, server, probe(), file(), verifyPhotoDecode(), addDisc() (+35 more)

### Community 14 - "my-bag.js"
Cohesion: 0.05
Nodes (53): seeThroughPlastic(), addMenu, addMenuOpen(), bagColorMap, bagFinishMap, bagHaloMap, bagHaloModelMap, bagPhotoMap (+45 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.06
Nodes (43): artZooming(), atlasPositions, CAMERA_AXES, cameraLooksStill(), cameraSpring, clusterPicks, comparisonMarkup(), comparisonPalette() (+35 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.13
Nodes (41): camera(), bagRimColor(), lightTheme(), angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), applyTurn() (+33 more)

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.08
Nodes (36): attachDiscFeatures(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot(), advanceTime(), poseAt(), clamp() (+28 more)

### Community 20 - "accent-follows-appearance-evidence.mjs"
Cohesion: 0.15
Nodes (20): BEFORE, box(), CHOSEN, clip(), closeMenu(), compose(), LIME, load() (+12 more)

### Community 21 - "json"
Cohesion: 0.12
Nodes (5): main(), slug(), tile(), Validator, merges()

### Community 22 - "halo-swirl.mjs"
Cohesion: 0.16
Nodes (21): asymFront(), drawnFront(), DYE, [dye,wash,plate,ink], dyeShare(), enc(), fbm(), glared() (+13 more)

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.20
Nodes (17): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagClass(), bagComparator(), stampChoiceOf() (+9 more)

### Community 24 - "bag-values.js"
Cohesion: 0.15
Nodes (21): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagPalette(), bagSlots(), DEFAULT_BAG_COLOR, defaultDiscDetails() (+13 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "collection-scenes.js"
Cohesion: 0.11
Nodes (26): RACK_STYLES, epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN, MAX_TURN (+18 more)

### Community 27 - "public/disc-stamp-delight.mjs"
Cohesion: 0.17
Nodes (21): GLARE_CEILING, box(), CLONE_STEPS, cloneCores(), delightStamp(), distanceTo(), encode(), f() (+13 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.10
Nodes (23): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+15 more)

### Community 29 - "atlas-gesture-probe.mjs"
Cohesion: 0.14
Nodes (16): args, at(), {chromium}, dpr, errors, GESTURES, intro(), open() (+8 more)

### Community 30 - "atlas-depth-browser.mjs"
Cohesion: 0.12
Nodes (13): CAMERAS, checks, {chromium}, clean(), errors, gapArt(), server, settled() (+5 more)

### Community 31 - "clear-true-color-browser.mjs"
Cohesion: 0.12
Nodes (20): asset, dE(), flag, haveRaptor, hex(), hsv(), lab(), med() (+12 more)

### Community 32 - "pnpm-install.mjs"
Cohesion: 0.21
Nodes (10): CACHE_SEEDS, holdInstallLocks(), InstallProgress, main(), openLock(), openReport(), OPERATIONAL_FAILURE_CODES, showLine() (+2 more)

### Community 33 - "stage.mjs"
Cohesion: 0.13
Nodes (22): finishes, HIDDEN, loadTemplate(), ONE, RACK_FINISHES, roleOf(), SPIN, UPRIGHT (+14 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.07
Nodes (44): assignSides(), BAG_BOX, bagLayout(), brickRows(), byKey(), clamp(), depthOrder(), DISC (+36 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.17
Nodes (30): bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress(), delightPixels() (+22 more)

### Community 36 - ".zoom"
Cohesion: 0.14
Nodes (14): SCENE(), checks, {chromium}, clickLands(), completeDot(), errors, mapOwned(), onMap() (+6 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "photo-stamps.mjs"
Cohesion: 0.14
Nodes (33): account(), adoptUp(), api(), assetOf(), blobOf(), broken, cached(), changed() (+25 more)

### Community 39 - "mountRacks"
Cohesion: 0.20
Nodes (22): rackSlot(), rackX(), restHeight(), rowWidth(), lerp3(), mountRacks(), batchFor(), box() (+14 more)

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
Cohesion: 0.22
Nodes (11): discColors(), DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, KEYS, LIST, OVERMOLD_DISCS, overmoldColors(), parseColor() (+3 more)

### Community 44 - "ref_node_test"
Cohesion: 0.12
Nodes (16): STAMP_FINISHES, STAMP_INKS, fixture(), item, setup(), database(), setup(), database() (+8 more)

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
Cohesion: 0.15
Nodes (23): close(), components(), distanceTo(), extractPhotoStamp(), f(), fillFromRing(), gaussian(), ghosts() (+15 more)

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

### Community 55 - "ref_node_child_process"
Cohesion: 0.04
Nodes (34): {chromium}, server, {chromium}, command(), errors, server, {chromium}, server (+26 more)

### Community 56 - "disc3d/viewer.mjs"
Cohesion: 0.10
Nodes (27): CLEAR, clearBackdrop(), clearMeshes(), clearPage(), clearPart(), clearRig(), defines(), num() (+19 more)

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
Cohesion: 0.06
Nodes (19): output, server, output, data, context, T, checkCatalogIdentity(), ids (+11 more)

### Community 61 - "vite.config.ts"
Cohesion: 0.25
Nodes (3): vinext, vite, localBindingConfig

### Community 62 - "mountGraveyard"
Cohesion: 0.17
Nodes (20): ABOVE_GROUND, engraving(), plots(), mountGraveyard(), dress(), hover(), idAt(), layout() (+12 more)

### Community 63 - "halo-band-sampling.mjs"
Cohesion: 0.24
Nodes (11): SEAM, dE(), disc(), enc(), isDye(), L(), lab(), lch() (+3 more)

### Community 64 - "atlas-layout.mjs"
Cohesion: 0.19
Nodes (9): catalogBase, context, filters(), fixtures, random(), rated, score(), sizes (+1 more)

### Community 65 - "disc-register.mjs"
Cohesion: 0.12
Nodes (35): along(), apply(), autoRegister(), CENTRE_CAP, cropThrough(), designCentre(), eigen(), ellipseFrom() (+27 more)

### Community 66 - "halo-plastic-browser.mjs"
Cohesion: 0.09
Nodes (23): chroma(), {chromium}, command(), dE(), dist(), hex(), lab(), metrics (+15 more)

### Community 67 - "workers/bag.mjs"
Cohesion: 0.14
Nodes (12): validateUpload(), fixture(), chunk(), extended(), fixture(), byId, createBag(), idAliases (+4 more)

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

### Community 75 - "halo.mjs"
Cohesion: 0.20
Nodes (13): HALO_FEATHER, HALO_FORMAT, HALO_RING, HALO_STREAKS, NAMES, haloCoord(), linear(), smooth() (+5 more)

### Community 76 - "bag-staging-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 77 - "slider-drag-browser.mjs"
Cohesion: 0.24
Nodes (10): assertRangeDrag(), checkRangeDefaults(), dragRange(), {chromium}, errors, probe(), results, server (+2 more)

### Community 78 - "stamps.mjs"
Cohesion: 0.23
Nodes (14): body(), json(), LOOKS, owned(), part(), placed(), PNG_CHUNKS, shape() (+6 more)

### Community 79 - "personal-lens.mjs"
Cohesion: 0.39
Nodes (6): syncMyMap(), COPY_BIAS_SHIFT, moldShifts(), personalPositions(), context, molds

### Community 80 - "photo-albedo.mjs"
Cohesion: 0.24
Nodes (11): SOFTEN_GLARE, ab(), enc(), lin(), luma(), lumAt(), photo(), enc() (+3 more)

### Community 81 - "rack-motion.mjs"
Cohesion: 0.23
Nodes (11): clamp(), DEFAULT_RACK_COLOR, discPose(), easeInOut(), mix(), RESTAGE_MS, SLIDE_MS, stage() (+3 more)

### Community 83 - "atlas-layout.js"
Cohesion: 0.28
Nodes (10): adapt(), adaptStrength(), bandSlope(), bounds(), fit(), inBand(), positions(), scatter() (+2 more)

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
Cohesion: 0.08
Nodes (18): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+10 more)

### Community 88 - "workers/disc-requests.mjs"
Cohesion: 0.25
Nodes (5): FLIGHT, headers, isHttpUrl(), LENGTHS, validateRequest()

### Community 89 - "bag-popup-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 91 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.05
Nodes (34): mold(), rated(), assignments, baseline, batch, {chromium}, controls, molds (+26 more)

### Community 92 - "ref_node_path"
Cohesion: 0.06
Nodes (18): readExecutionProfile(), NpmCacheProgress, runNpmInstall(), cli, [command, ...args], projectRoot, checks, {chromium} (+10 more)

### Community 93 - "render"
Cohesion: 0.28
Nodes (20): pocketLabel(), api(), chooseRackStyle(), focusFirst(), foundDisc(), loadBag(), lostItems(), memorialWall() (+12 more)

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

### Community 98 - "markerTarget"
Cohesion: 0.39
Nodes (8): dotArtRadius(), drawCompareHighlights(), keepPinned(), mapMarkerScale(), markerLabel(), markerTarget(), nameGrid(), yieldNames()

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
Cohesion: 0.12
Nodes (11): baselines, {chromium}, command(), live, sql(), start(), pause(), pw (+3 more)

### Community 107 - "atlas-art.mjs"
Cohesion: 0.12
Nodes (45): mountBag(), restyle(), discModel(), createAtlasArt(), dispose(), geometryOf(), get(), has() (+37 more)

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
Cohesion: 0.08
Nodes (49): bagDiscGeometry(), discParts(), HALO_PLASTICS, isOvermold(), photoGeometry(), CLAY_TONES, esc(), LABELS (+41 more)

### Community 115 - "0000_powerful_pepper_potts.sql"
Cohesion: 0.50
Nodes (3): `bag_items`, `coach_usage`, `profiles`

### Community 116 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 117 - "state"
Cohesion: 0.04
Nodes (33): state(), command(), command(), {chromium}, command(), errors, server, shots (+25 more)

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 121 - "theme"
Cohesion: 0.04
Nodes (37): theme(), {chromium}, command(), errors, server, shots, themes, widths (+29 more)

### Community 140 - "disc-request.js"
Cohesion: 0.36
Nodes (5): clearErrors(), fieldsFor(), fillBrands(), open(), showErrors()

### Community 141 - "disc-stamp-worker.mjs"
Cohesion: 0.20
Nodes (16): inkBounds(), bestShift(), box(), CHROMA, encode(), field(), INK, labToRgb() (+8 more)

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 143 - "shopping.js"
Cohesion: 0.70
Nodes (4): offers(), render(), row(), tracking()

### Community 144 - "disc-request-browser.mjs"
Cohesion: 0.17
Nodes (5): directoryLink, form, mapLink, rows(), sheet

### Community 146 - "sync"
Cohesion: 0.22
Nodes (10): activateBag(), closeBagTips(), directory(), isDemo(), leaveBag(), positionBagTips(), setBagView(), showDemo() (+2 more)

### Community 147 - "disc-appearance-browser.mjs"
Cohesion: 0.25
Nodes (7): by(), catalog, {chromium}, examples, items, server, settings

### Community 148 - "photo-level-measure.mjs"
Cohesion: 0.43
Nodes (4): angleOf(), luma(), renderedStampAngle(), stampAngle()

### Community 149 - "directory-layout-browser.mjs"
Cohesion: 0.18
Nodes (9): checks, {chromium}, desktop, errors, metrics, phone, server, shots (+1 more)

### Community 152 - "photo-stamp-color-assets-evidence.mjs"
Cohesion: 0.31
Nodes (8): bagShots(), cases, CHOSEN, finishOnly, frame(), results, viewerShots(), wait()

### Community 153 - "stamp-extraction-fidelity.mjs"
Cohesion: 0.38
Nodes (6): at(), extract(), LETTERS, peak(), sharp, SMALL

### Community 154 - "atlas-lod.mjs"
Cohesion: 0.36
Nodes (6): HOLD_LIMIT, LOD_MARGIN, lodFor(), LODS, ORDER, walk()

### Community 155 - "display-harness.mjs"
Cohesion: 0.19
Nodes (7): scene, photo, BAG, openDevice(), playwright, startHarness(), startServer()

### Community 156 - "photo-stamp-color-assets-browser.mjs"
Cohesion: 0.33
Nodes (6): dE(), hex(), inksIn(), lab(), photo(), sharp

### Community 157 - "more-packs-evidence.mjs"
Cohesion: 0.31
Nodes (5): openSheet(), packs(), region(), setTheme(), wait()

### Community 158 - "bag-scene-browser.mjs"
Cohesion: 0.22
Nodes (7): {chromium}, command(), errors, metrics, server, themes, widths

### Community 159 - "0017_disc_requests.sql"
Cohesion: 0.60
Nodes (4): disc_request_throttle, disc_request_throttle_hour, disc_requests, disc_requests_status

### Community 160 - "display-customization-browser.mjs"
Cohesion: 0.29
Nodes (3): agree(), CLASSIC, consumers()

### Community 161 - "disc-webp.mjs"
Cohesion: 0.33
Nodes (3): fallbackWebP(), encodeWebP(), loadEncoder()

### Community 162 - "photo-stamp-one-click-evidence.mjs"
Cohesion: 0.31
Nodes (7): cases, frame(), framing, record(), results, shots(), wait()

### Community 163 - "photo-stamp-sync.mjs"
Cohesion: 0.36
Nodes (7): C, form(), P, png(), put(), sharp, webp()

### Community 165 - "tests/disc-stamp-delight.mjs"
Cohesion: 0.31
Nodes (6): disc(), enc(), flash(), lin(), sharp, SPOT

### Community 167 - "atlas-3d-perf.mjs"
Cohesion: 0.43
Nodes (7): decide(), deviceReps(), DEVICES, FLIGHT(), main(), median(), parseReps()

### Community 168 - "bag-memorial-browser.mjs"
Cohesion: 0.25
Nodes (6): {chromium}, command(), errors, server, shots, themes

### Community 169 - "tests/auth.mjs"
Cohesion: 0.18
Nodes (6): jose, delete(), googleFetch, reply, worker, googleFixture()

### Community 170 - "display-customization-evidence.mjs"
Cohesion: 0.46
Nodes (6): catalogDisc(), ready(), setTheme(), shot(), trio(), wait()

### Community 171 - "photo-stamp-assets-evidence.mjs"
Cohesion: 0.36
Nodes (7): bagShots(), cases, CHOSEN, frame(), results, viewerShots(), wait()

### Community 172 - "workers/coach.mjs"
Cohesion: 0.31
Nodes (8): askCoach(), coachContext(), groundedReply(), headers, instructions(), json(), schema, usageCost()

### Community 173 - "ref_node_module"
Cohesion: 0.04
Nodes (41): checks, {chromium}, errors, server, types, checks, {chromium}, errors (+33 more)

### Community 174 - "tests/disc-stamp-extract.mjs"
Cohesion: 0.53
Nodes (5): at(), disc(), extract(), mean(), sharp

### Community 175 - "clear-plastic-partb-evidence.mjs"
Cohesion: 0.33
Nodes (3): log(), photo, results

### Community 177 - "appearance.js"
Cohesion: 0.60
Nodes (3): build(), paint(), preview()

### Community 178 - "bag-pulled-sizing.mjs"
Cohesion: 0.25
Nodes (5): bag, blocks, entries, phone, viewport

### Community 179 - "photo-adder-rework-browser.mjs"
Cohesion: 0.50
Nodes (4): log(), results, sharp, shoot()

### Community 181 - "rackStyle"
Cohesion: 0.50
Nodes (3): rackStyle(), finishOf(), paint()

### Community 186 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

## Knowledge Gaps
- **52 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1382 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jose` connect `tests/auth.mjs` to `package.json`, `workers/auth.mjs`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `createDiscViewer()` (e.g. with `applyPose()` and `attach()`) actually correct?**
  _`createDiscViewer()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05906553041434029 - nodes in this community are weakly interconnected._
- **Why does `inCollection()` connect `app.js` to `bag-tweaks-browser.mjs`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10261569416498995 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._