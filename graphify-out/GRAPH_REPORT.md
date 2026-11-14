# Graph Report - stamp-pipeline-v2  (2026-11-14)

## Corpus Check
- 500 files · ~5,744,729 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 315 file(s) not represented in the graph (top: .log 239, .gz 23, .css 17)

## Summary
- 3440 nodes · 7485 edges · 186 communities (143 shown, 43 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 266 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ea067590`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- workers/auth.mjs
- Bag scene
- bag.js
- mountRacks
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
- DiscmaniaIdentity
- halo-swirl.mjs
- collection-scenes.js
- ref_node_test
- dependencies
- collection-scenes.js
- public/disc-stamp-delight.mjs
- Account and bag SQL schema
- atlas-gesture-probe.mjs
- atlas-depth-browser.mjs
- clear-true-color-browser.mjs
- pnpm-install.mjs
- halo-plastic-browser.mjs
- bag-layout.mjs
- disc-albedo.mjs
- atlas-persist-browser.mjs
- devDependencies
- photo-stamps.mjs
- mountGraveyard
- photo-editor-races.mjs
- compilerOptions
- atlas-groups.js
- stage.mjs
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
- NameTag
- colourdiff.mjs
- racks.mjs
- sites-env.sh
- atlas-depth.mjs
- zoom.mjs
- ref_node_fs
- vite.config.ts
- atlas-3d-browser.mjs
- render
- ref_node_module
- disc-register.mjs
- common.mjs
- photo-stamp-sync.mjs
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
- overmold.mjs
- display-palette.js
- tweenCamera
- atlas-motion.js
- coach.js
- photo.mjs
- install-pnpm.sh
- discraft_batch2_test.py
- stamp_fraction_audit_test.py
- bag-collections-browser.mjs
- display-customization-browser.mjs
- account.js
- bag-animation-perf.mjs
- prompt-4-leftovers-browser.mjs
- disc3d/viewer.mjs
- next
- atlas-targets.js
- state
- bag-tweaks-browser.mjs
- install-ci.sh
- shape.mjs
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- theme
- cloudflare-env.d.ts
- overrides
- halo-band-sampling.mjs
- apple-design-3-browser.mjs
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- disc-request.js
- disc-stamp-worker.mjs
- compose-discraft-fraction-proofs.py
- shopping.js
- all-discs-gallery.js
- schema.ts
- qa.mjs
- photo-level-measure.mjs
- halo-band-v2.mjs
- atlas-layout.mjs
- drizzle-kit
- atlas-lod.mjs
- display-harness.mjs
- bag-demo-browser.mjs
- more-packs-evidence.mjs
- engines
- 0017_disc_requests.sql
- playwright
- bag-3d-browser.mjs
- ref_node_test
- directory-layout-browser.mjs
- my-map-browser.mjs
- disc-appearance-browser.mjs
- drawGaps
- photo-stamp-color-assets-evidence.mjs
- coach-worker.mjs
- bag-pulled-sizing.mjs
- display-customization-evidence.mjs
- workers/coach.mjs
- ref_node_module
- photo-stamp-assets-evidence.mjs
- atlas-targets.mjs
- stamp-extraction-fidelity.mjs
- disc-webp.mjs
- clear-plastic-partb-evidence.mjs
- tests/disc-stamp-extract.mjs
- clear-opacity-browser.mjs
- photo-adder-rework-browser.mjs
- runtime
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
9. `delightPixels()` - 34 edges
10. `state()` - 34 edges

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

## Communities (186 total, 43 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (81): activeLens(), addDestinationControl(), applyTheme(), atlasPriority(), bagColors(), brandColor(), brandList(), brandPalette (+73 more)

### Community 1 - "workers/auth.mjs"
Cohesion: 0.22
Nodes (18): base64url(), body(), cookie(), createAuth(), account(), callback(), session(), start() (+10 more)

### Community 2 - "Bag scene"
Cohesion: 0.10
Nodes (12): accent(), BAG_SPRING, BagScene, div(), loadViewer(), POCKET, reduced(), stampStyle() (+4 more)

### Community 3 - "bag.js"
Cohesion: 0.10
Nodes (49): dynamic, GET(), GET(), DELETE(), photoBytes(), POST(), PUT(), save() (+41 more)

### Community 4 - "mountRacks"
Cohesion: 0.19
Nodes (24): rackSlot(), rackX(), restHeight(), rowWidth(), mountRacks(), batchFor(), box(), drop() (+16 more)

### Community 5 - "scripts"
Cohesion: 0.03
Nodes (66): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+58 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.09
Nodes (45): encodeHalo(), photoLook(), albedoCanvas(), bandRatio(), canvasBitmap(), canvasBlob(), checkPhotoSize(), colorStampBlob() (+37 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.06
Nodes (37): a, args, base(), brandCount, byId, cellPool(), cells, excludedIds (+29 more)

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
Cohesion: 0.09
Nodes (31): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+23 more)

### Community 12 - "initAtlasMap"
Cohesion: 0.18
Nodes (22): animateZoom(), cameraMoving(), catchAtlasIntro(), changeZoom(), clearClusterTimers(), closeCluster(), initAtlasMap(), levelHeld() (+14 more)

### Community 13 - "halo-plastic-browser.mjs"
Cohesion: 0.05
Nodes (41): {chromium}, command(), metrics, server, frameByHand(), keepPhotoLook(), {chromium}, command() (+33 more)

### Community 14 - "my-bag.js"
Cohesion: 0.05
Nodes (56): seeThroughPlastic(), isHalo(), addMenu, addMenuOpen(), bagColorMap, bagFinishMap, bagHaloMap, bagHaloModelMap (+48 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.07
Nodes (33): atlasPositions, CAMERA_AXES, cameraSpring, clusterPicks, comparisonMarkup(), comparisonPalette(), discArt(), dropMarkerArt() (+25 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.14
Nodes (39): angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), applyTurn(), attach(), build(), cancelRim() (+31 more)

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.09
Nodes (38): stageMode(), attachDiscFeatures(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot(), advanceTime(), poseAt() (+30 more)

### Community 20 - "accent-follows-appearance-evidence.mjs"
Cohesion: 0.15
Nodes (20): BEFORE, box(), CHOSEN, clip(), closeMenu(), compose(), LIME, load() (+12 more)

### Community 22 - "halo-swirl.mjs"
Cohesion: 0.16
Nodes (21): ASYM_FEATHER, asymFront(), drawnFront(), [dye,wash,plate,ink], dyeShare(), enc(), fbm(), glared() (+13 more)

### Community 23 - "collection-scenes.js"
Cohesion: 0.30
Nodes (16): bagLayout(), renderFinish(), stampChoiceOf(), BAYS, TIERS, haloBand(), haloModel(), bagRimColor() (+8 more)

### Community 24 - "ref_node_test"
Cohesion: 0.12
Nodes (26): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagComparator(), bagPalette(), bagSlots(), DEFAULT_BAG_COLOR (+18 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "collection-scenes.js"
Cohesion: 0.15
Nodes (19): ABOVE_GROUND, engraving(), epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN (+11 more)

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
Nodes (14): CAMERAS, checks, {chromium}, clean(), errors, gapArt(), SCENE(), server (+6 more)

### Community 31 - "clear-true-color-browser.mjs"
Cohesion: 0.12
Nodes (21): asset, dE(), flag, haveRaptor, hex(), hsv(), lab(), med() (+13 more)

### Community 32 - "pnpm-install.mjs"
Cohesion: 0.11
Nodes (16): CACHE_SEEDS, holdInstallLocks(), InstallProgress, main(), openLock(), openReport(), OPERATIONAL_FAILURE_CODES, showLine() (+8 more)

### Community 33 - "halo-plastic-browser.mjs"
Cohesion: 0.09
Nodes (24): chroma(), {chromium}, command(), dE(), dist(), hex(), lab(), metrics (+16 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.07
Nodes (41): assignSides(), BAG_BOX, brickRows(), byKey(), clamp(), depthOrder(), fan(), footprint() (+33 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.17
Nodes (28): bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress(), delightPixels() (+20 more)

### Community 36 - "atlas-persist-browser.mjs"
Cohesion: 0.15
Nodes (13): checks, {chromium}, clickLands(), completeDot(), errors, mapOwned(), onMap(), READABLE() (+5 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "photo-stamps.mjs"
Cohesion: 0.14
Nodes (33): account(), adoptUp(), api(), assetOf(), blobOf(), broken, cached(), changed() (+25 more)

### Community 39 - "mountGraveyard"
Cohesion: 0.27
Nodes (14): mountGraveyard(), dress(), hover(), idAt(), layout(), makePlot(), placeRing(), placeTags() (+6 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.10
Nodes (6): keepSnapshotAsset(), apiSource, bagSource, closeSource, saveSource, stampStubs

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.20
Nodes (17): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+9 more)

### Community 43 - "stage.mjs"
Cohesion: 0.16
Nodes (22): coarse(), DISC_BUDGET, discColors(), discMaterial(), discModel(), parts, personalStampStyle(), softwareRenderer() (+14 more)

### Community 44 - "tests/auth.mjs"
Cohesion: 0.20
Nodes (4): delete(), database(), setup(), valid

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
Cohesion: 0.09
Nodes (32): close(), components(), distanceTo(), extractPhotoStamp(), f(), fillFromRing(), gaussian(), ghosts() (+24 more)

### Community 51 - "atlas-organic-browser.mjs"
Cohesion: 0.15
Nodes (13): checks, {chromium}, errors, layout(), near(), SCENARIOS, server, settled() (+5 more)

### Community 52 - "Catalog generation and stamp validation"
Cohesion: 0.26
Nodes (4): brandnorm(), norm(), validate_stamp_fields(), validate_stamp_manifest()

### Community 53 - "about-hero.js"
Cohesion: 0.12
Nodes (23): active(), canvas, desktop, eligible(), fallback(), frame(), hero, motion (+15 more)

### Community 55 - "colourdiff.mjs"
Cohesion: 0.08
Nodes (15): a, b, [disc,box,out], H, heat, L, P, T (+7 more)

### Community 56 - "racks.mjs"
Cohesion: 0.09
Nodes (25): rackStyle(), BAYS_PER_TIER, CLASS_ORDER, pulledSpot(), RACK_CAPACITY, RACK_DEPTH, RACK_GAP, RACK_HEIGHT (+17 more)

### Community 57 - "sites-env.sh"
Cohesion: 0.14
Nodes (13): HOME, MINIFLARE_REGISTRY_PATH, npm_config_audit, npm_config_cache, npm_config_fund, npm_config_update_notifier, sites-env.sh script, SITES_ENV_READY (+5 more)

### Community 58 - "atlas-depth.mjs"
Cohesion: 0.15
Nodes (9): boxes(), CHROME, discs, LEVELS, positions, prints, rooms(), runtime (+1 more)

### Community 59 - "zoom.mjs"
Cohesion: 0.15
Nodes (10): review.sh script, comp, [disc,box,out,...variants], H, L, rows, scale, T (+2 more)

### Community 60 - "ref_node_fs"
Cohesion: 0.06
Nodes (23): output, data, {chromium}, errors, report, server, checkCatalogIdentity(), results (+15 more)

### Community 61 - "vite.config.ts"
Cohesion: 0.18
Nodes (6): vinext, vite, readExecutionProfile(), cli, [command, ...args], localBindingConfig

### Community 62 - "atlas-3d-browser.mjs"
Cohesion: 0.15
Nodes (11): checks, {chromium}, errors, SCENE(), server, settled(), show(), VIEWPORTS (+3 more)

### Community 63 - "render"
Cohesion: 0.26
Nodes (21): api(), chooseRackStyle(), focusFirst(), foundDisc(), loadBag(), lostItems(), memorialWall(), mold() (+13 more)

### Community 64 - "ref_node_module"
Cohesion: 0.03
Nodes (48): {chromium}, server, {chromium}, command(), errors, server, {chromium}, server (+40 more)

### Community 65 - "disc-register.mjs"
Cohesion: 0.12
Nodes (35): along(), apply(), autoRegister(), CENTRE_CAP, cropThrough(), designCentre(), eigen(), ellipseFrom() (+27 more)

### Community 66 - "common.mjs"
Cohesion: 0.07
Nodes (42): photoPoint(), only, berg, crop(), exists, EXTRA, framing, IN (+34 more)

### Community 67 - "photo-stamp-sync.mjs"
Cohesion: 0.18
Nodes (13): C, fixture(), form(), P, png(), put(), sharp, webp() (+5 more)

### Community 68 - "pathlib"
Cohesion: 0.07
Nodes (13): digest(), measure(), extract(), slug(), digest(), run(), slug(), extract() (+5 more)

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
Cohesion: 0.14
Nodes (33): createAtlasArt(), dispose(), geometryOf(), get(), has(), lookup(), render(), shapeOf() (+25 more)

### Community 76 - "bag-staging-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 77 - "slider-drag-browser.mjs"
Cohesion: 0.24
Nodes (10): assertRangeDrag(), checkRangeDefaults(), dragRange(), {chromium}, errors, probe(), results, server (+2 more)

### Community 78 - "stamps.mjs"
Cohesion: 0.12
Nodes (21): validateUpload(), byId, idAliases, body(), json(), LOOKS, owned(), part() (+13 more)

### Community 79 - "personal-lens.mjs"
Cohesion: 0.17
Nodes (13): activateBag(), closeBagTips(), directory(), leaveBag(), positionBagTips(), setBagView(), syncMyMap(), undockDetail() (+5 more)

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
Cohesion: 0.18
Nodes (21): buildClusters(), cancelRegroup(), dotArtRadius(), drawCompareHighlights(), ensureGroupWorker(), flightLevel(), hydrateGaps(), hydrateGroups() (+13 more)

### Community 86 - "palette.mjs"
Cohesion: 0.22
Nodes (8): {chromium}, contrast(), errors, full(), linear(), luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.06
Nodes (20): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+12 more)

### Community 88 - "public.mjs"
Cohesion: 0.09
Nodes (19): FINISH_OPACITY, STAMP_FINISHES, STAMP_INKS, fixture(), item, setup(), item, setup() (+11 more)

### Community 89 - "bag-popup-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 91 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.05
Nodes (32): mold(), rated(), assignments, baseline, batch, {chromium}, controls, molds (+24 more)

### Community 92 - "apple-design-2-browser.mjs"
Cohesion: 0.13
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 93 - "overmold.mjs"
Cohesion: 0.24
Nodes (9): DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, KEYS, lightTheme(), LIST, OVERMOLD_DISCS, overmoldColors(), parseColor() (+1 more)

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

### Community 98 - "photo.mjs"
Cohesion: 0.31
Nodes (9): CLEAR, acquirePhoto(), cache, clearPhoto(), heightRows(), luminanceRows(), nextTask(), photoSurface() (+1 more)

### Community 99 - "install-pnpm.sh"
Cohesion: 0.39
Nodes (7): acquire_shared_lock(), can_write_directory(), release_shared_lock(), report_store(), install-pnpm.sh script, XDG_CACHE_HOME, XDG_DATA_HOME

### Community 102 - "bag-collections-browser.mjs"
Cohesion: 0.09
Nodes (14): {chromium}, COLORS, command(), errors, MOLDS, PLASTICS, report, server (+6 more)

### Community 103 - "display-customization-browser.mjs"
Cohesion: 0.29
Nodes (3): agree(), CLASSIC, consumers()

### Community 104 - "account.js"
Cohesion: 0.52
Nodes (5): api(), refresh(), renderPage(), signOut(), sync()

### Community 105 - "bag-animation-perf.mjs"
Cohesion: 0.17
Nodes (8): baseline, {chromium}, photos, profile, server, verifyLayout, verifyTextures, verifyTransitions

### Community 106 - "prompt-4-leftovers-browser.mjs"
Cohesion: 0.18
Nodes (5): pause(), pw, report, selectDisc(), server

### Community 107 - "disc3d/viewer.mjs"
Cohesion: 0.09
Nodes (34): build(), paint(), preview(), haloCoord(), smooth(), discGeometry(), groupRim(), lathePoints() (+26 more)

### Community 108 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 109 - "atlas-targets.js"
Cohesion: 0.53
Nodes (4): inBox(), pick(), reach(), reads()

### Community 110 - "state"
Cohesion: 0.05
Nodes (29): state(), command(), command(), baselines, {chromium}, command(), live, sql() (+21 more)

### Community 111 - "bag-tweaks-browser.mjs"
Cohesion: 0.15
Nodes (10): checks, {chromium}, command(), errors, GOTO, MAIN, metrics, PUTTERS (+2 more)

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 113 - "shape.mjs"
Cohesion: 0.08
Nodes (52): DISC, bagDiscGeometry(), discParts(), HALO_PLASTICS, isOvermold(), photoGeometry(), CLAY_TONES, esc() (+44 more)

### Community 115 - "0000_powerful_pepper_potts.sql"
Cohesion: 0.50
Nodes (3): `bag_items`, `coach_usage`, `profiles`

### Community 116 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 117 - "theme"
Cohesion: 0.05
Nodes (28): theme(), {chromium}, command(), errors, server, shots, themes, widths (+20 more)

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 120 - "halo-band-sampling.mjs"
Cohesion: 0.22
Nodes (12): DYE, SEAM, dE(), disc(), enc(), isDye(), L(), lab() (+4 more)

### Community 121 - "apple-design-3-browser.mjs"
Cohesion: 0.17
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 140 - "disc-request.js"
Cohesion: 0.36
Nodes (5): clearErrors(), fieldsFor(), fillBrands(), open(), showErrors()

### Community 141 - "disc-stamp-worker.mjs"
Cohesion: 0.11
Nodes (27): plateColor(), inkBounds(), bestShift(), box(), CHROMA, encode(), field(), INK (+19 more)

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 143 - "shopping.js"
Cohesion: 0.70
Nodes (4): offers(), render(), row(), tracking()

### Community 144 - "all-discs-gallery.js"
Cohesion: 0.29
Nodes (8): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagClass(), rackOrder(), storedItems()

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
Cohesion: 0.22
Nodes (11): FRONT_RING, dE(), delit(), disc(), enc(), L(), lab(), lin() (+3 more)

### Community 152 - "atlas-layout.mjs"
Cohesion: 0.19
Nodes (9): catalogBase, context, filters(), fixtures, random(), rated, score(), sizes (+1 more)

### Community 154 - "atlas-lod.mjs"
Cohesion: 0.36
Nodes (6): HOLD_LIMIT, LOD_MARGIN, lodFor(), LODS, ORDER, walk()

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

### Community 161 - "bag-3d-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, perf, server, shots, themes (+1 more)

### Community 163 - "directory-layout-browser.mjs"
Cohesion: 0.18
Nodes (9): checks, {chromium}, desktop, errors, metrics, phone, server, shots (+1 more)

### Community 164 - "my-map-browser.mjs"
Cohesion: 0.18
Nodes (8): BAG, checks, {chromium}, command(), errors, metrics, server, shots

### Community 165 - "disc-appearance-browser.mjs"
Cohesion: 0.25
Nodes (7): by(), catalog, {chromium}, examples, items, server, settings

### Community 166 - "drawGaps"
Cohesion: 0.20
Nodes (11): artZooming(), cameraLooksStill(), drawGaps(), gapName(), gapSprite(), gapTarget(), keepPinnedGaps(), layoutZoom() (+3 more)

### Community 167 - "photo-stamp-color-assets-evidence.mjs"
Cohesion: 0.31
Nodes (8): bagShots(), cases, CHOSEN, finishOnly, frame(), results, viewerShots(), wait()

### Community 168 - "coach-worker.mjs"
Cohesion: 0.32
Nodes (5): jose, googleFetch, reply, worker, googleFixture()

### Community 169 - "bag-pulled-sizing.mjs"
Cohesion: 0.25
Nodes (5): bag, blocks, entries, phone, viewport

### Community 170 - "display-customization-evidence.mjs"
Cohesion: 0.46
Nodes (6): catalogDisc(), ready(), setTheme(), shot(), trio(), wait()

### Community 172 - "workers/coach.mjs"
Cohesion: 0.24
Nodes (10): database(), setup(), askCoach(), coachContext(), groundedReply(), headers, instructions(), json() (+2 more)

### Community 173 - "ref_node_module"
Cohesion: 0.04
Nodes (39): output, server, NpmCacheProgress, runNpmInstall(), projectRoot, checks, {chromium}, errors (+31 more)

### Community 174 - "photo-stamp-assets-evidence.mjs"
Cohesion: 0.36
Nodes (7): bagShots(), cases, CHOSEN, frame(), results, viewerShots(), wait()

### Community 177 - "stamp-extraction-fidelity.mjs"
Cohesion: 0.38
Nodes (6): at(), extract(), LETTERS, peak(), sharp, SMALL

### Community 179 - "clear-plastic-partb-evidence.mjs"
Cohesion: 0.33
Nodes (3): log(), photo, results

### Community 181 - "tests/disc-stamp-extract.mjs"
Cohesion: 0.53
Nodes (5): at(), disc(), extract(), mean(), sharp

### Community 183 - "photo-adder-rework-browser.mjs"
Cohesion: 0.50
Nodes (4): log(), results, sharp, shoot()

### Community 186 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

## Knowledge Gaps
- **52 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1466 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jose` connect `coach-worker.mjs` to `package.json`, `workers/auth.mjs`, `tests/auth.mjs`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `createDiscViewer()` (e.g. with `applyPose()` and `attach()`) actually correct?**
  _`createDiscViewer()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05906553041434029 - nodes in this community are weakly interconnected._
- **Why does `inCollection()` connect `app.js` to `bag-tweaks-browser.mjs`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.0989345509893455 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._