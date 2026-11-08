# Graph Report - clear-opacity  (2026-11-08)

## Corpus Check
- 481 files · ~5,740,431 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 315 file(s) not represented in the graph (top: .log 239, .gz 23, .css 17)

## Summary
- 3316 nodes · 7198 edges · 178 communities (143 shown, 35 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 259 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `29c9d5e6`
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
- collection-layout.mjs
- public/disc-stamp-delight.mjs
- Account and bag SQL schema
- atlas-gesture-probe.mjs
- atlas-depth-browser.mjs
- clear-true-color-browser.mjs
- pnpm-install.mjs
- gallery-fixes-browser.mjs
- bag-layout.mjs
- disc-albedo.mjs
- atlas-persist-browser.mjs
- devDependencies
- photo-stamps.mjs
- mountRacks
- photo-editor-races.mjs
- compilerOptions
- atlas-groups.js
- ref_node_http
- public.mjs
- bag-interactions-browser.mjs
- components.json
- Detail and pop-out viewer bridge
- photo-true-color.mjs
- api.cjs
- public/disc-stamp-extract.mjs
- atlas-organic-browser.mjs
- Catalog generation and stamp validation
- apple-design-browser.mjs
- discraft-stamps-batch1-browser.mjs
- ref_node_https
- disc3d/viewer.mjs
- sites-env.sh
- atlas-depth.mjs
- accent-done-button-evidence.mjs
- ref_node_assert
- vite.config.ts
- ref_node_path
- halo-band-sampling.mjs
- atlas-layout.mjs
- disc-register.mjs
- ref_node_path
- workers/bag.mjs
- pathlib
- tests/disc-stamp-clear.mjs
- atlas-speed-band-browser.mjs
- Page
- atlas-speed-band.mjs
- photo-stamp-identity-browser.mjs
- display-palette.mjs
- stage.mjs
- bag-staging-browser.mjs
- slider-drag-browser.mjs
- stamps.mjs
- personal-lens.mjs
- photo-albedo.mjs
- rack-motion.mjs
- gallery-fixes-browser.mjs
- apple-design-3-browser.mjs
- public/disc-stamp-color.mjs
- buildClusters
- palette.mjs
- discraft-fraction-audit-browser.mjs
- sync
- bag-popup-browser.mjs
- StampManifestTests
- discraft-stamps-batch2-browser.mjs
- apple-design-2-browser.mjs
- render
- display-palette.js
- draw
- atlas-motion.js
- coach.js
- photo.mjs
- install-pnpm.sh
- discraft_batch2_test.py
- stamp_fraction_audit_test.py
- bag-collections-browser.mjs
- bag-spin-pocket-browser.mjs
- account.js
- bag-v13-browser.mjs
- prompt-4-leftovers-browser.mjs
- stamp.mjs
- next
- atlas-targets.js
- state
- bag-tweaks-browser.mjs
- install-ci.sh
- shape.mjs
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- ref_node_child_process
- cloudflare-env.d.ts
- overrides
- bag-v13-browser.mjs
- lens-corner-browser.mjs
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- disc-request.js
- disc-stamp-worker.mjs
- compose-discraft-fraction-proofs.py
- shopping.js
- discraft-stamps-browser.mjs
- my-map-browser.mjs
- disc-appearance-browser.mjs
- photo-level-measure.mjs
- atlas-organic.mjs
- photo-stamp-color-assets-evidence.mjs
- stamp-extraction-fidelity.mjs
- disc3d/viewer.mjs
- display-harness.mjs
- bag-demo-browser.mjs
- more-packs-evidence.mjs
- tests/disc-stamp-color.mjs
- 0017_disc_requests.sql
- apple-design-browser.mjs
- disc-webp.mjs
- drawGaps
- key
- HttpCache
- tests/disc-stamp-delight.mjs
- cameraLooksStill
- engines
- disc-stamp-worker.mjs
- tests/auth.mjs
- photo-glare-ab-browser.mjs
- workers/coach.mjs
- ref_node_module
- tests/disc-stamp-extract.mjs
- atlas-organic.mjs

## God Nodes (most connected - your core abstractions)
1. `scripts` - 66 edges
2. `createDiscViewer()` - 66 edges
3. `BagScene` - 63 edges
4. `mountRacks()` - 44 edges
5. `mountBag()` - 43 edges
6. `render()` - 37 edges
7. `createAtlasArt()` - 36 edges
8. `theme()` - 35 edges
9. `state()` - 34 edges
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

## Communities (178 total, 35 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (81): activeLens(), addDestinationControl(), applyTheme(), atlasPriority(), bagColors(), brandColor(), brandList(), brandPalette (+73 more)

### Community 1 - "workers/auth.mjs"
Cohesion: 0.22
Nodes (18): base64url(), body(), cookie(), createAuth(), account(), callback(), session(), start() (+10 more)

### Community 2 - "Bag scene"
Cohesion: 0.10
Nodes (10): accent(), BAG_SPRING, BagScene, div(), loadViewer(), POCKET, reduced(), stampStyle() (+2 more)

### Community 3 - "bag.js"
Cohesion: 0.08
Nodes (53): dynamic, GET(), GET(), DELETE(), photoBytes(), POST(), PUT(), save() (+45 more)

### Community 4 - "halo-band-v2.mjs"
Cohesion: 0.20
Nodes (12): frontAt(), FRONT_RING, dE(), delit(), disc(), enc(), L(), lab() (+4 more)

### Community 5 - "scripts"
Cohesion: 0.03
Nodes (66): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+58 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.09
Nodes (45): encodeHalo(), photoLook(), albedoCanvas(), canvasBitmap(), canvasBlob(), checkPhotoSize(), colorStampBlob(), createPhotoEditor() (+37 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.12
Nodes (16): a, args, brandCount, byId, cellPool(), cells, excludedIds, outPath (+8 more)

### Community 8 - "package.json"
Cohesion: 0.04
Nodes (44): engines, node, name, packageManager, private, type, version, @base-ui/react (+36 more)

### Community 9 - "disc3d-popout-browser.mjs"
Cohesion: 0.07
Nodes (19): byName(), {chromium}, errors, server, settle(), show(), types, view() (+11 more)

### Community 10 - "LostScene"
Cohesion: 0.17
Nodes (6): rackCount(), CollectionScene, esc(), LostScene, plural(), StorageScene

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.11
Nodes (29): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+21 more)

### Community 12 - "initAtlasMap"
Cohesion: 0.20
Nodes (20): animateZoom(), cameraMoving(), catchAtlasIntro(), changeZoom(), clearClusterTimers(), closeCluster(), initAtlasMap(), loadAtlasArt() (+12 more)

### Community 13 - "halo-plastic-browser.mjs"
Cohesion: 0.04
Nodes (45): {chromium}, command(), metrics, server, probe(), verifyPhotoDecode(), frameByHand(), keepPhotoLook() (+37 more)

### Community 14 - "my-bag.js"
Cohesion: 0.05
Nodes (59): seeThroughPlastic(), isHalo(), addMenu, addMenuOpen(), bagColorMap, bagFinishMap, bagHaloMap, bagHaloModelMap (+51 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.06
Nodes (40): atlasPositions, CAMERA_AXES, cameraSpring, clusterPicks, comparisonMarkup(), comparisonPalette(), discArt(), drawGaps() (+32 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.14
Nodes (39): lightTheme(), angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), applyTurn(), attach(), build() (+31 more)

### Community 18 - "SceneView"
Cohesion: 0.13
Nodes (3): clamp(), NameTag, SceneView

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.07
Nodes (42): attachDiscFeatures(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot(), advanceTime(), poseAt(), clamp() (+34 more)

### Community 20 - "accent-follows-appearance-evidence.mjs"
Cohesion: 0.15
Nodes (20): BEFORE, box(), CHOSEN, clip(), closeMenu(), compose(), LIME, load() (+12 more)

### Community 22 - "halo-swirl.mjs"
Cohesion: 0.15
Nodes (22): ASYM_FEATHER, asymFront(), drawnFront(), [dye,wash,plate,ink], dyeShare(), enc(), fbm(), glared() (+14 more)

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.20
Nodes (21): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagLayout(), bagClass(), bagComparator() (+13 more)

### Community 24 - "bag-values.js"
Cohesion: 0.13
Nodes (24): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagPalette(), bagSlots(), DEFAULT_BAG_COLOR, defaultDiscDetails() (+16 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "collection-layout.mjs"
Cohesion: 0.12
Nodes (24): RACK_STYLES, epitaph(), EPITAPHS, hash(), lifespan(), MAX_LEAN, MAX_TURN, PLOT_DEPTH (+16 more)

### Community 27 - "public/disc-stamp-delight.mjs"
Cohesion: 0.17
Nodes (21): GLARE_CEILING, box(), CLONE_STEPS, cloneCores(), delightStamp(), distanceTo(), encode(), f() (+13 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.10
Nodes (23): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+15 more)

### Community 29 - "atlas-gesture-probe.mjs"
Cohesion: 0.08
Nodes (24): checks, {chromium}, errors, SCENE(), server, settled(), show(), VIEWPORTS (+16 more)

### Community 30 - "atlas-depth-browser.mjs"
Cohesion: 0.12
Nodes (14): CAMERAS, checks, {chromium}, clean(), errors, gapArt(), SCENE(), server (+6 more)

### Community 31 - "clear-true-color-browser.mjs"
Cohesion: 0.12
Nodes (20): asset, dE(), flag, haveRaptor, hex(), hsv(), lab(), med() (+12 more)

### Community 32 - "pnpm-install.mjs"
Cohesion: 0.23
Nodes (10): CACHE_SEEDS, holdInstallLocks(), InstallProgress, main(), openLock(), openReport(), OPERATIONAL_FAILURE_CODES, showLine() (+2 more)

### Community 33 - "gallery-fixes-browser.mjs"
Cohesion: 0.12
Nodes (10): {chromium}, command(), errors, file(), report, server, make(), ready() (+2 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.07
Nodes (43): assignSides(), BAG_BOX, brickRows(), byKey(), clamp(), depthOrder(), DISC, fan() (+35 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.19
Nodes (26): bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress(), delightPixels() (+18 more)

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
Cohesion: 0.09
Nodes (50): ABOVE_GROUND, engraving(), graveColumns(), plots(), mountGraveyard(), dress(), hover(), idAt() (+42 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.10
Nodes (6): keepSnapshotAsset(), apiSource, bagSource, closeSource, saveSource, stampStubs

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.20
Nodes (17): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+9 more)

### Community 43 - "ref_node_http"
Cohesion: 0.12
Nodes (10): output, server, camera(), {chromium}, errors, pixelFailures, report, server (+2 more)

### Community 44 - "public.mjs"
Cohesion: 0.11
Nodes (18): STAMP_FINISHES, STAMP_INKS, fixture(), item, setup(), item, setup(), database() (+10 more)

### Community 45 - "bag-interactions-browser.mjs"
Cohesion: 0.11
Nodes (12): checks, {chromium}, command(), errors, GOTO, MAIN, metrics, PUTTERS (+4 more)

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
Cohesion: 0.15
Nodes (8): brandnorm(), norm(), main(), slug(), tile(), validate_stamp_fields(), validate_stamp_manifest(), merges()

### Community 53 - "apple-design-browser.mjs"
Cohesion: 0.12
Nodes (23): active(), canvas, desktop, eligible(), fallback(), frame(), hero, motion (+15 more)

### Community 54 - "discraft-stamps-batch1-browser.mjs"
Cohesion: 0.15
Nodes (10): assignments, baseline, batch, {chromium}, controls, molds, newMolds, requests (+2 more)

### Community 55 - "ref_node_https"
Cohesion: 0.06
Nodes (21): {chromium}, errors, server, {chromium}, errors, metrics, server, {chromium} (+13 more)

### Community 56 - "disc3d/viewer.mjs"
Cohesion: 0.07
Nodes (46): FINISH_OPACITY, rackStyle(), finishes, finishOf(), HIDDEN, loadTemplate(), ONE, paint() (+38 more)

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
Nodes (19): output, data, context, T, checkCatalogIdentity(), ids, items, worker() (+11 more)

### Community 61 - "vite.config.ts"
Cohesion: 0.18
Nodes (6): vinext, vite, readExecutionProfile(), cli, [command, ...args], localBindingConfig

### Community 62 - "ref_node_path"
Cohesion: 0.27
Nodes (3): NpmCacheProgress, runNpmInstall(), projectRoot

### Community 63 - "halo-band-sampling.mjs"
Cohesion: 0.22
Nodes (12): DYE, SEAM, dE(), disc(), enc(), isDye(), L(), lab() (+4 more)

### Community 64 - "atlas-layout.mjs"
Cohesion: 0.19
Nodes (9): catalogBase, context, filters(), fixtures, random(), rated, score(), sizes (+1 more)

### Community 65 - "disc-register.mjs"
Cohesion: 0.12
Nodes (35): along(), apply(), autoRegister(), CENTRE_CAP, cropThrough(), designCentre(), eigen(), ellipseFrom() (+27 more)

### Community 66 - "ref_node_path"
Cohesion: 0.10
Nodes (22): chroma(), {chromium}, command(), dE(), dist(), hex(), lab(), metrics (+14 more)

### Community 67 - "workers/bag.mjs"
Cohesion: 0.11
Nodes (20): validateUpload(), C, fixture(), form(), P, png(), put(), sharp (+12 more)

### Community 68 - "pathlib"
Cohesion: 0.13
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
Nodes (11): contrast(), distance(), lab(), linear(), luminance(), MATRICES, minDistance(), oklch() (+3 more)

### Community 75 - "stage.mjs"
Cohesion: 0.15
Nodes (22): coarse(), DISC_BUDGET, discColors(), discMaterial(), discModel(), parts, personalStampStyle(), softwareRenderer() (+14 more)

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
Cohesion: 0.17
Nodes (13): activateBag(), closeBagTips(), directory(), leaveBag(), positionBagTips(), setBagView(), syncMyMap(), undockDetail() (+5 more)

### Community 80 - "photo-albedo.mjs"
Cohesion: 0.24
Nodes (11): SOFTEN_GLARE, ab(), enc(), lin(), luma(), lumAt(), photo(), enc() (+3 more)

### Community 81 - "rack-motion.mjs"
Cohesion: 0.23
Nodes (11): clamp(), DEFAULT_RACK_COLOR, discPose(), easeInOut(), mix(), RESTAGE_MS, SLIDE_MS, stage() (+3 more)

### Community 83 - "apple-design-3-browser.mjs"
Cohesion: 0.17
Nodes (6): checks, {chromium}, errors, only, server, types

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

### Community 88 - "sync"
Cohesion: 0.25
Nodes (5): FLIGHT, headers, isHttpUrl(), LENGTHS, validateRequest()

### Community 89 - "bag-popup-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 91 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.12
Nodes (13): assignments, baseline, batch, {chromium}, controls, drops, molds, newMolds (+5 more)

### Community 92 - "apple-design-2-browser.mjs"
Cohesion: 0.13
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 93 - "render"
Cohesion: 0.27
Nodes (21): pocketLabel(), api(), chooseRackStyle(), focusFirst(), foundDisc(), loadBag(), lostItems(), memorialWall() (+13 more)

### Community 94 - "display-palette.js"
Cohesion: 0.42
Nodes (8): accentTokens(), classColor(), commit(), css(), get(), normalize(), paint(), toneOf()

### Community 95 - "draw"
Cohesion: 0.18
Nodes (18): artFrame(), boundedCamera(), draw(), drawSatelliteLeaders(), featuredDisc(), focusFeatured(), immersiveMap(), introCreep() (+10 more)

### Community 96 - "atlas-motion.js"
Cohesion: 0.19
Nodes (8): fadeOut(), photoMarkup(), renderMarkers(), selectedGroup(), dismiss(), reveal(), selected(), slide()

### Community 97 - "coach.js"
Cohesion: 0.50
Nodes (7): allowance(), api(), append(), appendDraft(), open(), render(), reset()

### Community 98 - "photo.mjs"
Cohesion: 0.33
Nodes (9): acquirePhoto(), cache, clearPhoto(), heightRows(), luminanceRows(), nextTask(), photoGeometry(), photoSurface() (+1 more)

### Community 99 - "install-pnpm.sh"
Cohesion: 0.39
Nodes (7): acquire_shared_lock(), can_write_directory(), release_shared_lock(), report_store(), install-pnpm.sh script, XDG_CACHE_HOME, XDG_DATA_HOME

### Community 102 - "bag-collections-browser.mjs"
Cohesion: 0.17
Nodes (5): {chromium}, errors, server, turn(), types

### Community 103 - "bag-spin-pocket-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, metrics, server, shots, THEMES

### Community 104 - "account.js"
Cohesion: 0.52
Nodes (5): api(), refresh(), renderPage(), signOut(), sync()

### Community 105 - "bag-v13-browser.mjs"
Cohesion: 0.17
Nodes (8): baseline, {chromium}, photos, profile, server, verifyLayout, verifyTextures, verifyTransitions

### Community 106 - "prompt-4-leftovers-browser.mjs"
Cohesion: 0.18
Nodes (5): pause(), pw, report, selectDisc(), server

### Community 107 - "stamp.mjs"
Cohesion: 0.11
Nodes (36): build(), paint(), preview(), createAtlasArt(), dispose(), geometryOf(), get(), has() (+28 more)

### Community 108 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 109 - "atlas-targets.js"
Cohesion: 0.53
Nodes (4): inBox(), pick(), reach(), reads()

### Community 110 - "state"
Cohesion: 0.04
Nodes (36): command(), state(), checks, {chromium}, command(), errors, perf, server (+28 more)

### Community 111 - "bag-tweaks-browser.mjs"
Cohesion: 0.15
Nodes (10): checks, {chromium}, command(), errors, GOTO, MAIN, metrics, PUTTERS (+2 more)

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 113 - "shape.mjs"
Cohesion: 0.07
Nodes (57): bagDiscGeometry(), discParts(), DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, isOvermold(), KEYS, LIST, OVERMOLD_DISCS (+49 more)

### Community 115 - "0000_powerful_pepper_potts.sql"
Cohesion: 0.50
Nodes (3): `bag_items`, `coach_usage`, `profiles`

### Community 116 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 117 - "ref_node_child_process"
Cohesion: 0.04
Nodes (40): theme(), {chromium}, server, {chromium}, errors, report, server, {chromium} (+32 more)

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 120 - "bag-v13-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, server, shots, themes, widths

### Community 121 - "lens-corner-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, server, shots, THEMES, WIDTHS (+1 more)

### Community 140 - "disc-request.js"
Cohesion: 0.36
Nodes (5): clearErrors(), fieldsFor(), fillBrands(), open(), showErrors()

### Community 141 - "disc-stamp-worker.mjs"
Cohesion: 0.24
Nodes (12): bestShift(), box(), CHROMA, encode(), field(), INK, labToRgb(), RIM (+4 more)

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 143 - "shopping.js"
Cohesion: 0.70
Nodes (4): offers(), render(), row(), tracking()

### Community 144 - "discraft-stamps-browser.mjs"
Cohesion: 0.18
Nodes (9): mold(), rated(), base, baseline, changed, {chromium}, requests, results (+1 more)

### Community 146 - "my-map-browser.mjs"
Cohesion: 0.18
Nodes (8): BAG, checks, {chromium}, command(), errors, metrics, server, shots

### Community 147 - "disc-appearance-browser.mjs"
Cohesion: 0.25
Nodes (7): by(), catalog, {chromium}, examples, items, server, settings

### Community 148 - "photo-level-measure.mjs"
Cohesion: 0.43
Nodes (4): angleOf(), luma(), renderedStampAngle(), stampAngle()

### Community 149 - "atlas-organic.mjs"
Cohesion: 0.18
Nodes (9): checks, {chromium}, desktop, errors, metrics, phone, server, shots (+1 more)

### Community 152 - "photo-stamp-color-assets-evidence.mjs"
Cohesion: 0.31
Nodes (8): bagShots(), cases, CHOSEN, finishOnly, frame(), results, viewerShots(), wait()

### Community 153 - "stamp-extraction-fidelity.mjs"
Cohesion: 0.38
Nodes (6): at(), extract(), LETTERS, peak(), sharp, SMALL

### Community 154 - "disc3d/viewer.mjs"
Cohesion: 0.36
Nodes (6): HOLD_LIMIT, LOD_MARGIN, lodFor(), LODS, ORDER, walk()

### Community 155 - "display-harness.mjs"
Cohesion: 0.04
Nodes (36): scene, photo, photo, log(), photo, results, directoryLink, form (+28 more)

### Community 156 - "bag-demo-browser.mjs"
Cohesion: 0.20
Nodes (7): bagCalls, checks, {chromium}, command(), errors, server, shots

### Community 157 - "more-packs-evidence.mjs"
Cohesion: 0.31
Nodes (5): openSheet(), packs(), region(), setTheme(), wait()

### Community 158 - "tests/disc-stamp-color.mjs"
Cohesion: 0.33
Nodes (7): f(), rgbToLab(), disc(), hexLab(), labAt(), region(), sharp

### Community 159 - "0017_disc_requests.sql"
Cohesion: 0.60
Nodes (4): disc_request_throttle, disc_request_throttle_hour, disc_requests, disc_requests_status

### Community 160 - "apple-design-browser.mjs"
Cohesion: 0.22
Nodes (4): checks, {chromium}, errors, server

### Community 162 - "drawGaps"
Cohesion: 0.31
Nodes (7): cases, frame(), framing, record(), results, shots(), wait()

### Community 163 - "key"
Cohesion: 0.29
Nodes (7): base(), excludedKeys, key(), pool, speedClass(), stabClass(), take()

### Community 165 - "tests/disc-stamp-delight.mjs"
Cohesion: 0.27
Nodes (7): disc(), enc(), flash(), labAt(), lin(), sharp, SPOT

### Community 166 - "cameraLooksStill"
Cohesion: 0.33
Nodes (6): artZooming(), cameraLooksStill(), layoutZoom(), measureChrome(), organicOptions(), remeasureLabels()

### Community 167 - "engines"
Cohesion: 0.43
Nodes (7): decide(), deviceReps(), DEVICES, FLIGHT(), main(), median(), parseReps()

### Community 168 - "disc-stamp-worker.mjs"
Cohesion: 0.60
Nodes (5): plateColor(), inkBounds(), shoulder, extract(), register()

### Community 169 - "tests/auth.mjs"
Cohesion: 0.18
Nodes (6): jose, delete(), googleFetch, reply, worker, googleFixture()

### Community 170 - "photo-glare-ab-browser.mjs"
Cohesion: 0.33
Nodes (5): {chromium}, photos, results, server, types

### Community 172 - "workers/coach.mjs"
Cohesion: 0.31
Nodes (8): askCoach(), coachContext(), groundedReply(), headers, instructions(), json(), schema, usageCost()

### Community 173 - "ref_node_module"
Cohesion: 0.06
Nodes (24): checks, {chromium}, errors, server, types, {chromium}, errors, originals (+16 more)

### Community 174 - "tests/disc-stamp-extract.mjs"
Cohesion: 0.53
Nodes (5): at(), disc(), extract(), mean(), sharp

### Community 186 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

## Knowledge Gaps
- **52 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1393 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jose` connect `tests/auth.mjs` to `package.json`, `workers/auth.mjs`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `createDiscViewer()` (e.g. with `applyPose()` and `attach()`) actually correct?**
  _`createDiscViewer()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05906553041434029 - nodes in this community are weakly interconnected._
- **Why does `inCollection()` connect `app.js` to `bag-tweaks-browser.mjs`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10261569416498995 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._