# Graph Report - hyzer-name-lookup  (2026-11-26)

## Corpus Check
- 518 files · ~5,839,280 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 315 file(s) not represented in the graph (top: .log 239, .gz 23, .css 17)

## Summary
- 3571 nodes · 7776 edges · 195 communities (154 shown, 41 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 278 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0e6e85bf`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- workers/auth.mjs
- Bag scene
- bag.js
- bag-popup-browser.mjs
- scripts
- disc-photo.mjs
- sampling-audit-draw.mjs
- package.json
- disc3d-popout-browser.mjs
- racks.mjs
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
- mountRacks
- halo-swirl.mjs
- collection-scenes.js
- bag-values.js
- dependencies
- ref_node_child_process
- public/disc-stamp-delight.mjs
- Account and bag SQL schema
- atlas-gesture-probe.mjs
- workers/disc-names.mjs
- clear-true-color-browser.mjs
- pnpm-install.mjs
- ref_node_fs
- bag-layout.mjs
- disc-albedo.mjs
- atlas-persist-browser.mjs
- devDependencies
- photo-stamps.mjs
- collection-layout.mjs
- photo-editor-races.mjs
- compilerOptions
- atlas-groups.js
- mountGraveyard
- disc-appearance-browser.mjs
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
- mountGraveyard
- sites-env.sh
- v2.mjs
- appearance.js
- personal-lens.mjs
- vite.config.ts
- ref_node_child_process
- render
- halo.mjs
- disc-register.mjs
- common.mjs
- tests/auth.mjs
- pathlib
- tests/disc-stamp-clear.mjs
- atlas-speed-band-browser.mjs
- workers/bag.mjs
- atlas-speed-band.mjs
- photo-stamp-identity-browser.mjs
- display-palette.mjs
- disc3d/viewer.mjs
- NameTag
- slider-drag-browser.mjs
- bag-tweaks-browser.mjs
- bag-3d-browser.mjs
- photo-albedo.mjs
- bag-staging-browser.mjs
- MergedRecords
- accent-done-button-evidence.mjs
- public/disc-stamp-color.mjs
- .zoom
- palette.mjs
- discraft-fraction-audit-browser.mjs
- public.mjs
- hyzer-coach-browser.mjs
- StampManifestTests
- atlas-3d-browser.mjs
- disc-request-browser.mjs
- NameTag
- display-palette.js
- draw
- atlas-motion.js
- coach.js
- workers/coach.mjs
- install-pnpm.sh
- discraft_batch2_test.py
- stamp_fraction_audit_test.py
- bag-collections-browser.mjs
- halo-band-v2.mjs
- account.js
- bag-pockets-browser.mjs
- photo-stamp-one-click-evidence.mjs
- markerTarget
- next
- atlas-targets.js
- ref_node_module
- bag-tweaks-browser.mjs
- install-ci.sh
- ref_node_test
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- lens-corner-browser.mjs
- cloudflare-env.d.ts
- overrides
- disc-stamp-worker.mjs
- discraft-stamps-batch2-browser.mjs
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- disc-request.js
- stability.mjs
- compose-discraft-fraction-proofs.py
- shopping.js
- render_report
- schema.ts
- qa.mjs
- photo-level-measure.mjs
- atlas-3d-perf.mjs
- atlas-layout.mjs
- rack-motion.mjs
- apple-design-2-browser.mjs
- display-harness.mjs
- photo-stamp-assets-evidence.mjs
- more-packs-evidence.mjs
- photo-adder-rework-browser.mjs
- 0017_disc_requests.sql
- prompt-4-leftovers-browser.mjs
- halo-band-sampling.mjs
- atlas-layout.js
- bag-v13-browser.mjs
- lens-corner-browser.mjs
- photo.mjs
- photo-stamp-sync.mjs
- tests/disc-stamp-delight.mjs
- theme
- photo-stamp-sync-browser.mjs
- state
- bag-scene-browser.mjs
- ref_node_path
- gallery-fixes-browser.mjs
- photo-stamp-color-assets-evidence.mjs
- photo-stamp-color-assets-browser.mjs
- photo-stamp-one-click-browser.mjs
- stamp-extraction-fidelity.mjs
- tests/disc-stamp-extract.mjs
- hyzer.mjs
- photo-stamp-assets-evidence.mjs
- display-customization-browser.mjs
- atlas-organic.mjs
- FractionAuditTests
- drizzle-kit
- engines
- playwright
- HttpCache
- bag-animation-perf.mjs

## God Nodes (most connected - your core abstractions)
1. `scripts` - 66 edges
2. `createDiscViewer()` - 66 edges
3. `BagScene` - 63 edges
4. `mountRacks()` - 44 edges
5. `mountBag()` - 43 edges
6. `render()` - 37 edges
7. `theme()` - 36 edges
8. `createAtlasArt()` - 36 edges
9. `state()` - 35 edges
10. `delightPixels()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `page()` --indirect_call--> `theme()`  [INFERRED]
  tests/hyzer-coach-browser.mjs → public/collection-scenes.js
- `layout()` --indirect_call--> `columns()`  [INFERRED]
  public/collection3d/graveyard.mjs → tests/bag-3d-layout.mjs
- `sampled()` --calls--> `delightPixels()`  [EXTRACTED]
  tests/halo-band-sampling.mjs → public/disc-albedo.mjs
- `labAt()` --calls--> `rgbToLab()`  [EXTRACTED]
  tests/disc-stamp-delight.mjs → public/disc-stamp-extract.mjs
- `prod()` --calls--> `extract()`  [EXTRACTED]
  spikes/stamp-pipeline-v2/stability.mjs → public/disc-stamp-worker.mjs

## Import Cycles
- None detected.

## Communities (195 total, 41 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (85): activeLens(), addDestinationControl(), applyTheme(), atlasPriority(), bagColors(), brandColor(), brandList(), brandPalette (+77 more)

### Community 1 - "workers/auth.mjs"
Cohesion: 0.21
Nodes (17): base64url(), body(), cookie(), account(), callback(), session(), start(), write() (+9 more)

### Community 2 - "Bag scene"
Cohesion: 0.10
Nodes (12): accent(), BAG_SPRING, BagScene, div(), loadViewer(), POCKET, reduced(), stampStyle() (+4 more)

### Community 3 - "bag.js"
Cohesion: 0.09
Nodes (50): dynamic, GET(), GET(), DELETE(), photoBytes(), POST(), PUT(), save() (+42 more)

### Community 4 - "bag-popup-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 5 - "scripts"
Cohesion: 0.03
Nodes (66): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+58 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.08
Nodes (46): encodeHalo(), photoLook(), albedoCanvas(), bandRatio(), canvasBitmap(), canvasBlob(), checkPhotoSize(), colorStampBlob() (+38 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.05
Nodes (37): a, args, base(), brandCount, byId, cellPool(), cells, excludedIds (+29 more)

### Community 8 - "package.json"
Cohesion: 0.05
Nodes (40): name, packageManager, private, type, version, @base-ui/react, class-variance-authority, @cloudflare/vite-plugin (+32 more)

### Community 9 - "disc3d-popout-browser.mjs"
Cohesion: 0.07
Nodes (19): byName(), {chromium}, errors, server, settle(), show(), types, view() (+11 more)

### Community 10 - "racks.mjs"
Cohesion: 0.09
Nodes (25): rackStyle(), BAYS_PER_TIER, CLASS_ORDER, pulledSpot(), RACK_CAPACITY, RACK_DEPTH, RACK_GAP, RACK_HEIGHT (+17 more)

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.09
Nodes (24): base_name(), candidate_url(), clean(), compare(), config(), identify(), is_official(), main() (+16 more)

### Community 12 - "initAtlasMap"
Cohesion: 0.17
Nodes (24): animateZoom(), boundedCamera(), cameraMoving(), catchAtlasIntro(), changeZoom(), clearClusterTimers(), closeCluster(), immersiveMap() (+16 more)

### Community 13 - "halo-plastic-browser.mjs"
Cohesion: 0.08
Nodes (29): probe(), chroma(), {chromium}, dE(), dist(), hex(), lab(), metrics (+21 more)

### Community 14 - "my-bag.js"
Cohesion: 0.05
Nodes (61): seeThroughPlastic(), addMenu, addMenuOpen(), bagColorMap, bagFinishMap, bagHaloMap, bagHaloModelMap, bagOpacityMap (+53 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.07
Nodes (36): atlasPositions, CAMERA_AXES, cameraSpring, clusterPicks, comparisonMarkup(), comparisonPalette(), discArt(), dropMarkerArt() (+28 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.13
Nodes (42): camera(), parseHalo(), setHalo(), lightTheme(), angleDelta(), createDiscViewer(), applyMaterials(), applyPose() (+34 more)

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.10
Nodes (38): stageMode(), advanceTime(), poseAt(), clamp01(), easeInOut(), easeOut(), FABRIC, MAX_ZOOM (+30 more)

### Community 20 - "accent-follows-appearance-evidence.mjs"
Cohesion: 0.15
Nodes (20): BEFORE, box(), CHOSEN, clip(), closeMenu(), compose(), LIME, load() (+12 more)

### Community 21 - "mountRacks"
Cohesion: 0.19
Nodes (24): rackSlot(), rackX(), restHeight(), rowWidth(), mountRacks(), batchFor(), box(), drop() (+16 more)

### Community 22 - "halo-swirl.mjs"
Cohesion: 0.17
Nodes (20): asymFront(), drawnFront(), [dye,wash,plate,ink], dyeShare(), enc(), fbm(), glared(), INK (+12 more)

### Community 23 - "collection-scenes.js"
Cohesion: 0.20
Nodes (20): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagLayout(), renderFinish(), stampChoiceOf() (+12 more)

### Community 24 - "bag-values.js"
Cohesion: 0.09
Nodes (31): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagClass(), bagPalette(), DEFAULT_BAG_COLOR, defaultDiscDetails() (+23 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "ref_node_child_process"
Cohesion: 0.11
Nodes (16): bagCalls, checks, {chromium}, command(), errors, server, shots, results (+8 more)

### Community 27 - "public/disc-stamp-delight.mjs"
Cohesion: 0.17
Nodes (21): GLARE_CEILING, box(), CLONE_STEPS, cloneCores(), delightStamp(), distanceTo(), encode(), f() (+13 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.10
Nodes (23): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+15 more)

### Community 29 - "atlas-gesture-probe.mjs"
Cohesion: 0.09
Nodes (23): checks, {chromium}, errors, server, settled(), show(), VIEWPORTS, args (+15 more)

### Community 30 - "workers/disc-names.mjs"
Cohesion: 0.13
Nodes (23): dict, EXTRA, forms(), keys, near(), words, discs(), matcher (+15 more)

### Community 31 - "clear-true-color-browser.mjs"
Cohesion: 0.12
Nodes (20): asset, dE(), flag, haveRaptor, hex(), hsv(), lab(), med() (+12 more)

### Community 32 - "pnpm-install.mjs"
Cohesion: 0.09
Nodes (17): NpmCacheProgress, runNpmInstall(), CACHE_SEEDS, holdInstallLocks(), InstallProgress, main(), openLock(), openReport() (+9 more)

### Community 33 - "ref_node_fs"
Cohesion: 0.04
Nodes (28): output, server, output, data, {chromium}, boxes(), CHROME, discs (+20 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.11
Nodes (15): SIDE_BAG, STAGE, TOP, boxesOverlap(), CLEAR, DESKTOP, entry(), mixes() (+7 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.17
Nodes (29): bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress(), delightPixels() (+21 more)

### Community 36 - "atlas-persist-browser.mjs"
Cohesion: 0.15
Nodes (13): checks, {chromium}, clickLands(), completeDot(), errors, mapOwned(), onMap(), READABLE() (+5 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "photo-stamps.mjs"
Cohesion: 0.14
Nodes (33): account(), adoptUp(), api(), assetOf(), blobOf(), broken, cached(), changed() (+25 more)

### Community 39 - "collection-layout.mjs"
Cohesion: 0.15
Nodes (19): ABOVE_GROUND, engraving(), epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN (+11 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.09
Nodes (8): isHalo(), keepSnapshotAsset(), apiSource, bagSource, closeSource, editorFixture(), saveSource, stampStubs

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.20
Nodes (17): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+9 more)

### Community 43 - "mountGraveyard"
Cohesion: 0.12
Nodes (23): BAG_BOX, brickRows(), byKey(), clamp(), depthOrder(), fan(), footprint(), FRONT (+15 more)

### Community 44 - "disc-appearance-browser.mjs"
Cohesion: 0.25
Nodes (7): by(), catalog, {chromium}, examples, items, server, settings

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
Nodes (17): plateColor(), applyClearPhotoRows(), clearPhotoPixels(), EDGE, edgeRadius(), fitCircle(), hexBytes(), labOf() (+9 more)

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
Cohesion: 0.16
Nodes (9): brandnorm(), norm(), validate_stamp_fields(), validate_stamp_manifest(), merges(), candidates(), load_alias(), norm() (+1 more)

### Community 53 - "about-hero.js"
Cohesion: 0.23
Nodes (12): active(), canvas, desktop, eligible(), fallback(), frame(), hero, motion (+4 more)

### Community 54 - "overmold.mjs"
Cohesion: 0.15
Nodes (19): DISC, attachDiscFeatures(), bagDiscGeometry(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot(), DEFAULT_DISC_COLOR (+11 more)

### Community 55 - "colourdiff.mjs"
Cohesion: 0.05
Nodes (28): a, b, [disc,box,out], H, heat, L, P, T (+20 more)

### Community 56 - "mountGraveyard"
Cohesion: 0.27
Nodes (14): mountGraveyard(), dress(), hover(), idAt(), layout(), makePlot(), placeRing(), placeTags() (+6 more)

### Community 57 - "sites-env.sh"
Cohesion: 0.14
Nodes (13): HOME, MINIFLARE_REGISTRY_PATH, npm_config_audit, npm_config_cache, npm_config_fund, npm_config_update_notifier, sites-env.sh script, SITES_ENV_READY (+5 more)

### Community 58 - "v2.mjs"
Cohesion: 0.14
Nodes (19): bestShift(), box(), CHROMA, encode(), field(), INK, labToRgb(), RIM (+11 more)

### Community 59 - "appearance.js"
Cohesion: 0.60
Nodes (3): build(), paint(), preview()

### Community 60 - "personal-lens.mjs"
Cohesion: 0.19
Nodes (12): activateBag(), directory(), leaveBag(), setBagView(), sync(), syncMyMap(), undockDetail(), COPY_BIAS_SHIFT (+4 more)

### Community 61 - "vite.config.ts"
Cohesion: 0.18
Nodes (6): vinext, vite, readExecutionProfile(), cli, [command, ...args], localBindingConfig

### Community 62 - "ref_node_child_process"
Cohesion: 0.10
Nodes (22): PHOTO_STAMP, CLAY_TONES, esc(), LABELS, n(), PROFILE_FRAME, profileDimensions(), profileSVG() (+14 more)

### Community 63 - "render"
Cohesion: 0.27
Nodes (21): bagComparator(), api(), chooseRackStyle(), focusFirst(), foundDisc(), loadBag(), lostItems(), memorialWall() (+13 more)

### Community 64 - "halo.mjs"
Cohesion: 0.18
Nodes (16): frontAt(), HALO_FEATHER, HALO_FORMAT, HALO_PLASTICS, HALO_RING, HALO_STREAKS, NAMES, haloCoord() (+8 more)

### Community 65 - "disc-register.mjs"
Cohesion: 0.12
Nodes (35): along(), apply(), autoRegister(), CENTRE_CAP, cropThrough(), designCentre(), eigen(), ellipseFrom() (+27 more)

### Community 66 - "common.mjs"
Cohesion: 0.08
Nodes (32): only, berg, exists, EXTRA, framing, IN, level(), load() (+24 more)

### Community 67 - "tests/auth.mjs"
Cohesion: 0.20
Nodes (4): delete(), database(), setup(), valid

### Community 68 - "pathlib"
Cohesion: 0.11
Nodes (11): digest(), measure(), extract(), slug(), digest(), run(), slug(), extract() (+3 more)

### Community 69 - "tests/disc-stamp-clear.mjs"
Cohesion: 0.18
Nodes (14): clearPhoto(), disc(), GLARE, glareCase(), HAIR, inBox(), NAVY, NAVY_BOX (+6 more)

### Community 70 - "atlas-speed-band-browser.mjs"
Cohesion: 0.18
Nodes (10): CAMERAS, {chromium}, errors, failures, RENDERED(), server, settled(), show() (+2 more)

### Community 71 - "workers/bag.mjs"
Cohesion: 0.11
Nodes (22): results, validateUpload(), byId, idAliases, body(), json(), LOOKS, owned() (+14 more)

### Community 72 - "atlas-speed-band.mjs"
Cohesion: 0.18
Nodes (9): base, CHROME, off(), prints, rated, runtime, SIZES, STATES (+1 more)

### Community 73 - "photo-stamp-identity-browser.mjs"
Cohesion: 0.11
Nodes (13): {chromium}, ink(), server, at, baseline, compare(), noise, runs (+5 more)

### Community 74 - "display-palette.mjs"
Cohesion: 0.23
Nodes (11): contrast(), distance(), lab(), linear(), luminance(), MATRICES, minDistance(), oklch() (+3 more)

### Community 75 - "disc3d/viewer.mjs"
Cohesion: 0.09
Nodes (52): coarse(), DISC_BUDGET, discColors(), discMaterial(), discModel(), parts, personalStampStyle(), softwareRenderer() (+44 more)

### Community 76 - "NameTag"
Cohesion: 0.46
Nodes (6): catalogDisc(), ready(), setTheme(), shot(), trio(), wait()

### Community 77 - "slider-drag-browser.mjs"
Cohesion: 0.24
Nodes (10): assertRangeDrag(), checkRangeDefaults(), dragRange(), {chromium}, errors, probe(), results, server (+2 more)

### Community 78 - "bag-tweaks-browser.mjs"
Cohesion: 0.15
Nodes (10): checks, {chromium}, command(), errors, GOTO, MAIN, metrics, PUTTERS (+2 more)

### Community 79 - "bag-3d-browser.mjs"
Cohesion: 0.17
Nodes (9): checks, {chromium}, command(), controls, errors, server, shots, THEMES (+1 more)

### Community 80 - "photo-albedo.mjs"
Cohesion: 0.24
Nodes (11): SOFTEN_GLARE, ab(), enc(), lin(), luma(), lumAt(), photo(), enc() (+3 more)

### Community 81 - "bag-staging-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 83 - "accent-done-button-evidence.mjs"
Cohesion: 0.15
Nodes (15): ACCENTS, actions(), BEFORE, CHOSEN, closeSheet(), doneStates(), load(), openSheet() (+7 more)

### Community 84 - "public/disc-stamp-color.mjs"
Cohesion: 0.28
Nodes (14): plastic(), box(), distanceTo(), encode(), extractStampColor(), finv(), gaussian(), kmeans() (+6 more)

### Community 85 - ".zoom"
Cohesion: 0.21
Nodes (16): buildClusters(), cancelRegroup(), ensureGroupWorker(), flightLevel(), hydrateGaps(), hydrateGroups(), layoutZoom(), levelReaches() (+8 more)

### Community 86 - "palette.mjs"
Cohesion: 0.22
Nodes (8): {chromium}, contrast(), errors, full(), linear(), luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.05
Nodes (27): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+19 more)

### Community 88 - "public.mjs"
Cohesion: 0.11
Nodes (19): jose, fixture(), item, setup(), googleFetch, reply, worker, googleFixture() (+11 more)

### Community 89 - "hyzer-coach-browser.mjs"
Cohesion: 0.07
Nodes (21): bagItems, checks, {chromium}, discs, engineRequests, errors, json(), page() (+13 more)

### Community 91 - "atlas-3d-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, perf, server, shots, themes (+1 more)

### Community 92 - "disc-request-browser.mjs"
Cohesion: 0.17
Nodes (5): directoryLink, form, mapLink, rows(), sheet

### Community 94 - "display-palette.js"
Cohesion: 0.42
Nodes (8): accentTokens(), classColor(), commit(), css(), get(), normalize(), paint(), toneOf()

### Community 95 - "draw"
Cohesion: 0.14
Nodes (20): artFrame(), artZooming(), cameraLooksStill(), draw(), drawGaps(), drawSatelliteLeaders(), featuredDisc(), focusFeatured() (+12 more)

### Community 96 - "atlas-motion.js"
Cohesion: 0.19
Nodes (8): fadeOut(), photoMarkup(), renderMarkers(), selectedGroup(), dismiss(), reveal(), selected(), slide()

### Community 97 - "coach.js"
Cohesion: 0.28
Nodes (14): allowance(), api(), append(), appendDraft(), hyzerLabels(), mood(), open(), render() (+6 more)

### Community 98 - "workers/coach.mjs"
Cohesion: 0.20
Nodes (16): database(), setup(), askCoach(), coachContext(), coachLookup(), discsWithWord(), groundedReply(), headers (+8 more)

### Community 99 - "install-pnpm.sh"
Cohesion: 0.39
Nodes (7): acquire_shared_lock(), can_write_directory(), release_shared_lock(), report_store(), install-pnpm.sh script, XDG_CACHE_HOME, XDG_DATA_HOME

### Community 102 - "bag-collections-browser.mjs"
Cohesion: 0.09
Nodes (14): {chromium}, COLORS, command(), errors, MOLDS, PLASTICS, report, server (+6 more)

### Community 103 - "halo-band-v2.mjs"
Cohesion: 0.20
Nodes (12): FRONT_RING, ASYM_FEATHER, dE(), delit(), disc(), enc(), L(), lab() (+4 more)

### Community 104 - "account.js"
Cohesion: 0.52
Nodes (5): api(), refresh(), renderPage(), signOut(), sync()

### Community 105 - "bag-pockets-browser.mjs"
Cohesion: 0.22
Nodes (7): {chromium}, command(), errors, server, shots, themes, widths

### Community 106 - "photo-stamp-one-click-evidence.mjs"
Cohesion: 0.31
Nodes (7): cases, frame(), framing, record(), results, shots(), wait()

### Community 107 - "markerTarget"
Cohesion: 0.29
Nodes (10): dotArtRadius(), drawCompareHighlights(), keepPinned(), levelHeld(), mapMarkerScale(), mapTargets(), markerLabel(), markerTarget() (+2 more)

### Community 108 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 109 - "atlas-targets.js"
Cohesion: 0.53
Nodes (4): inBox(), pick(), reach(), reads()

### Community 110 - "ref_node_module"
Cohesion: 0.04
Nodes (32): {chromium}, {chromium}, server, {chromium}, command(), errors, server, {chromium} (+24 more)

### Community 111 - "bag-tweaks-browser.mjs"
Cohesion: 0.20
Nodes (14): assignSides(), stabilityOf(), clamp(), desktopPulledLayout(), packing(), PHONE_PULLED_COUNT, PHONE_PULLED_MAX, phonePulledFit() (+6 more)

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 113 - "ref_node_test"
Cohesion: 0.09
Nodes (47): discParts(), photoGeometry(), bell(), clamp(), cubic(), DEFAULTS, discProfile(), domeCurve() (+39 more)

### Community 115 - "0000_powerful_pepper_potts.sql"
Cohesion: 0.50
Nodes (3): `bag_items`, `coach_usage`, `profiles`

### Community 116 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 117 - "lens-corner-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, metrics, server, shots, THEMES

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 120 - "disc-stamp-worker.mjs"
Cohesion: 0.23
Nodes (9): inkBounds(), shoulder, lin(), printSupport(), SEPARATE, extract(), register(), disc() (+1 more)

### Community 121 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.05
Nodes (29): {chromium}, command(), metrics, server, mold(), rated(), assignments, baseline (+21 more)

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

### Community 144 - "render_report"
Cohesion: 0.29
Nodes (7): atomic_write(), escape(), flights(), fmt(), link(), save(), render_report()

### Community 146 - "schema.ts"
Cohesion: 0.33
Nodes (4): bagItems, coachUsage, profiles, drizzle-orm

### Community 147 - "qa.mjs"
Cohesion: 0.62
Nodes (6): edgeSharpness(), exposure(), gate, glare(), luma(), sharpness()

### Community 148 - "photo-level-measure.mjs"
Cohesion: 0.43
Nodes (4): angleOf(), luma(), renderedStampAngle(), stampAngle()

### Community 149 - "atlas-3d-perf.mjs"
Cohesion: 0.43
Nodes (7): decide(), deviceReps(), DEVICES, FLIGHT(), main(), median(), parseReps()

### Community 152 - "atlas-layout.mjs"
Cohesion: 0.19
Nodes (9): catalogBase, context, filters(), fixtures, random(), rated, score(), sizes (+1 more)

### Community 153 - "rack-motion.mjs"
Cohesion: 0.23
Nodes (11): clamp(), DEFAULT_RACK_COLOR, discPose(), easeInOut(), mix(), RESTAGE_MS, SLIDE_MS, stage() (+3 more)

### Community 154 - "apple-design-2-browser.mjs"
Cohesion: 0.13
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 155 - "display-harness.mjs"
Cohesion: 0.10
Nodes (11): scene, photo, photoSource, log(), photo, results, BAG, openDevice() (+3 more)

### Community 156 - "photo-stamp-assets-evidence.mjs"
Cohesion: 0.36
Nodes (7): bagShots(), cases, CHOSEN, frame(), results, viewerShots(), wait()

### Community 157 - "more-packs-evidence.mjs"
Cohesion: 0.31
Nodes (5): openSheet(), packs(), region(), setTheme(), wait()

### Community 158 - "photo-adder-rework-browser.mjs"
Cohesion: 0.50
Nodes (4): log(), results, sharp, shoot()

### Community 159 - "0017_disc_requests.sql"
Cohesion: 0.60
Nodes (4): disc_request_throttle, disc_request_throttle_hour, disc_requests, disc_requests_status

### Community 160 - "prompt-4-leftovers-browser.mjs"
Cohesion: 0.18
Nodes (5): pause(), pw, report, selectDisc(), server

### Community 161 - "halo-band-sampling.mjs"
Cohesion: 0.22
Nodes (12): DYE, SEAM, dE(), disc(), enc(), isDye(), L(), lab() (+4 more)

### Community 162 - "atlas-layout.js"
Cohesion: 0.28
Nodes (10): adapt(), adaptStrength(), bandSlope(), bounds(), fit(), inBand(), positions(), scatter() (+2 more)

### Community 163 - "bag-v13-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, server, shots, themes, widths

### Community 164 - "lens-corner-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, server, shots, THEMES, WIDTHS (+1 more)

### Community 165 - "photo.mjs"
Cohesion: 0.33
Nodes (8): CLEAR, acquirePhoto(), cache, clearPhoto(), heightRows(), luminanceRows(), nextTask(), reliefTexture()

### Community 166 - "photo-stamp-sync.mjs"
Cohesion: 0.16
Nodes (13): C, fixture(), form(), P, png(), put(), sharp, webp() (+5 more)

### Community 167 - "tests/disc-stamp-delight.mjs"
Cohesion: 0.27
Nodes (7): disc(), enc(), flash(), labAt(), lin(), sharp, SPOT

### Community 168 - "theme"
Cohesion: 0.18
Nodes (6): rackCount(), CollectionScene, esc(), LostScene, plural(), StorageScene

### Community 169 - "photo-stamp-sync-browser.mjs"
Cohesion: 0.29
Nodes (8): dE(), hex(), inksIn(), lab(), photo(), sharp, since, states

### Community 170 - "state"
Cohesion: 0.05
Nodes (34): {chromium}, state(), command(), {chromium}, command(), errors, server, shots (+26 more)

### Community 172 - "bag-scene-browser.mjs"
Cohesion: 0.22
Nodes (7): {chromium}, command(), errors, metrics, server, themes, widths

### Community 173 - "ref_node_path"
Cohesion: 0.03
Nodes (60): theme(), projectRoot, bag, delay, discs, items, port, types (+52 more)

### Community 174 - "gallery-fixes-browser.mjs"
Cohesion: 0.15
Nodes (6): {chromium}, file(), make(), ready(), results, sharp

### Community 175 - "photo-stamp-color-assets-evidence.mjs"
Cohesion: 0.31
Nodes (8): bagShots(), cases, CHOSEN, finishOnly, frame(), results, viewerShots(), wait()

### Community 177 - "photo-stamp-color-assets-browser.mjs"
Cohesion: 0.33
Nodes (6): dE(), hex(), inksIn(), lab(), photo(), sharp

### Community 178 - "photo-stamp-one-click-browser.mjs"
Cohesion: 0.29
Nodes (5): log(), photo(), results, sharp, step()

### Community 179 - "stamp-extraction-fidelity.mjs"
Cohesion: 0.38
Nodes (6): at(), extract(), LETTERS, peak(), sharp, SMALL

### Community 181 - "tests/disc-stamp-extract.mjs"
Cohesion: 0.53
Nodes (5): at(), disc(), extract(), mean(), sharp

### Community 182 - "hyzer.mjs"
Cohesion: 0.47
Nodes (5): brow(), c, hyzer, onPlate(), sunk()

### Community 184 - "photo-stamp-assets-evidence.mjs"
Cohesion: 0.25
Nodes (5): bag, blocks, entries, phone, viewport

### Community 185 - "display-customization-browser.mjs"
Cohesion: 0.29
Nodes (3): agree(), CLASSIC, consumers()

### Community 186 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

### Community 198 - "bag-animation-perf.mjs"
Cohesion: 0.17
Nodes (8): baseline, {chromium}, photos, profile, server, verifyLayout, verifyTextures, verifyTransitions

## Knowledge Gaps
- **52 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1515 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `inCollection()` connect `app.js` to `bag-tweaks-browser.mjs`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `createDiscViewer()` (e.g. with `applyPose()` and `attach()`) actually correct?**
  _`createDiscViewer()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05586741512964448 - nodes in this community are weakly interconnected._
- **Why does `jose` connect `public.mjs` to `package.json`, `workers/auth.mjs`, `tests/auth.mjs`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.0989345509893455 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._