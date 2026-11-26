# Graph Report - stamp-pipeline-v2-build  (2026-11-26)

## Corpus Check
- 512 files · ~5,826,170 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 315 file(s) not represented in the graph (top: .log 239, .gz 23, .css 17)

## Summary
- 3515 nodes · 7693 edges · 182 communities (143 shown, 39 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 267 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `55978019`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- workers/auth.mjs
- Bag scene
- bag.js
- ref_node_module
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
- proof-discraft-batch2.py
- halo-band-v2.mjs
- all-discs-gallery.js
- bag-values.js
- dependencies
- state
- v2.mjs
- Account and bag SQL schema
- atlas-gesture-probe.mjs
- atlas-depth-browser.mjs
- clear-true-color-browser.mjs
- gallery-fixes-browser.mjs
- zoom.mjs
- bag-layout.mjs
- disc-albedo.mjs
- .zoom
- devDependencies
- photo-stamps.mjs
- graveyard.mjs
- photo-editor-races.mjs
- compilerOptions
- atlas-groups.js
- mountGraveyard
- disc3d-profile.mjs
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
- ref_node_test
- vite.config.ts
- atlas-3d-browser.mjs
- pnpm-install.mjs
- haloBand
- disc-register.mjs
- common.mjs
- theme
- pathlib
- tests/disc-stamp-clear.mjs
- atlas-speed-band-browser.mjs
- photo-stamp-sync.mjs
- atlas-speed-band.mjs
- photo-stamp-identity-browser.mjs
- display-palette.mjs
- stamp.mjs
- NameTag
- slider-drag-browser.mjs
- workers/bag.mjs
- dropdown-indicator-browser.mjs
- photo-albedo.mjs
- bag-staging-browser.mjs
- MergedRecords
- accent-done-button-evidence.mjs
- public/disc-stamp-color.mjs
- buildClusters
- tests/auth.mjs
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
- test_manufacturer_diff.py
- bag-collections-browser.mjs
- bag-spin-pocket-browser.mjs
- account.js
- ref_node_fs
- halo.mjs
- atlas-lod.mjs
- next
- atlas-targets.js
- photo-stamp-color-assets-evidence.mjs
- bag-tweaks-browser.mjs
- install-ci.sh
- ref_node_test
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- bag-3d-browser.mjs
- cloudflare-env.d.ts
- overrides
- bag-demo.mjs
- display-customization-browser.mjs
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- disc-request.js
- stability.mjs
- compose-discraft-fraction-proofs.py
- shopping.js
- Page
- schema.ts
- disc-photo-qa.mjs
- photo-level-measure.mjs
- display-customization-evidence.mjs
- atlas-layout.mjs
- rack-motion.mjs
- workers/bag.mjs
- display-harness.mjs
- photo-stamp-assets-evidence.mjs
- more-packs-evidence.mjs
- photo-retake-browser.mjs
- 0017_disc_requests.sql
- prompt-4-leftovers-browser.mjs
- tests/disc-stamp-delight.mjs
- sync
- qa.mjs
- clear-plastic-partb-evidence.mjs
- disc-appearance-browser.mjs
- clear-opacity-browser.mjs
- directory-layout-browser.mjs
- LostScene
- photo-adder-rework-browser.mjs
- drizzle-kit
- workers/coach.mjs
- ref_node_fs
- engines
- playwright
- photo-stamp-color-assets-browser.mjs
- atlas-organic.mjs
- disc-webp.mjs

## God Nodes (most connected - your core abstractions)
1. `scripts` - 67 edges
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

## Communities (182 total, 39 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (84): activeLens(), addDestinationControl(), applyTheme(), atlasPriority(), bagColors(), brandColor(), brandList(), brandPalette (+76 more)

### Community 1 - "workers/auth.mjs"
Cohesion: 0.22
Nodes (18): base64url(), body(), cookie(), createAuth(), account(), callback(), session(), start() (+10 more)

### Community 2 - "Bag scene"
Cohesion: 0.10
Nodes (10): accent(), BAG_SPRING, BagScene, div(), loadViewer(), POCKET, reduced(), stampStyle() (+2 more)

### Community 3 - "bag.js"
Cohesion: 0.10
Nodes (49): dynamic, GET(), GET(), DELETE(), photoBytes(), POST(), PUT(), save() (+41 more)

### Community 4 - "ref_node_module"
Cohesion: 0.04
Nodes (44): {chromium}, server, {chromium}, command(), errors, server, {chromium}, server (+36 more)

### Community 5 - "scripts"
Cohesion: 0.03
Nodes (67): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+59 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.09
Nodes (44): photoLook(), bandRatio(), canvasBitmap(), canvasBlob(), checkPhotoSize(), colorStampBlob(), createPhotoEditor(), decodePhoto() (+36 more)

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
Cohesion: 0.10
Nodes (23): BAYS_PER_TIER, CLASS_ORDER, pulledSpot(), RACK_DEPTH, RACK_GAP, RACK_HEIGHT, RACK_WIDTH, SHELF_CLEARANCE (+15 more)

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.09
Nodes (31): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+23 more)

### Community 12 - "initAtlasMap"
Cohesion: 0.18
Nodes (22): animateZoom(), cameraMoving(), catchAtlasIntro(), changeZoom(), clearClusterTimers(), closeCluster(), initAtlasMap(), levelHeld() (+14 more)

### Community 13 - "halo-plastic-browser.mjs"
Cohesion: 0.04
Nodes (56): {chromium}, command(), metrics, server, probe(), chroma(), {chromium}, command() (+48 more)

### Community 14 - "my-bag.js"
Cohesion: 0.06
Nodes (60): rackStyle(), addMenu, addMenuOpen(), api(), bagColorMap, bagFinishMap, bagHaloMap, bagHaloModelMap (+52 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.06
Nodes (44): artZooming(), atlasPositions, CAMERA_AXES, cameraLooksStill(), cameraSpring, clusterPicks, comparisonMarkup(), comparisonPalette() (+36 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.13
Nodes (38): angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), applyTurn(), attach(), build(), cancelRim() (+30 more)

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.07
Nodes (42): attachDiscFeatures(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot(), advanceTime(), poseAt(), clamp() (+34 more)

### Community 20 - "accent-follows-appearance-evidence.mjs"
Cohesion: 0.15
Nodes (20): BEFORE, box(), CHOSEN, clip(), closeMenu(), compose(), LIME, load() (+12 more)

### Community 21 - "proof-discraft-batch2.py"
Cohesion: 0.20
Nodes (4): main(), slug(), tile(), DiscmaniaIdentity

### Community 22 - "halo-band-v2.mjs"
Cohesion: 0.07
Nodes (44): FRONT_RING, ASYM_FEATHER, asymFront(), drawnFront(), DYE, [dye,wash,plate,ink], dyeShare(), enc() (+36 more)

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.29
Nodes (8): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagClass(), rackOrder(), storedItems()

### Community 24 - "bag-values.js"
Cohesion: 0.13
Nodes (22): BAG_COLORS, bagComparator(), bagPalette(), bagSlots(), DEFAULT_BAG_COLOR, defaultDiscDetails(), defaultPocket(), FINISH_OPACITY (+14 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "state"
Cohesion: 0.04
Nodes (34): state(), command(), bagCalls, checks, {chromium}, command(), errors, server (+26 more)

### Community 27 - "v2.mjs"
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

### Community 32 - "gallery-fixes-browser.mjs"
Cohesion: 0.20
Nodes (6): {chromium}, command(), errors, file(), report, server

### Community 33 - "zoom.mjs"
Cohesion: 0.12
Nodes (13): review.sh script, A, [a,b,out,size='2048',outSize='1024'], img, comp, [disc,box,out,...variants], H, L (+5 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.07
Nodes (44): assignSides(), BAG_BOX, bagLayout(), brickRows(), byKey(), clamp(), depthOrder(), DISC (+36 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.12
Nodes (37): encodeHalo(), bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress() (+29 more)

### Community 36 - ".zoom"
Cohesion: 0.15
Nodes (13): checks, {chromium}, clickLands(), completeDot(), errors, mapOwned(), onMap(), READABLE() (+5 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "photo-stamps.mjs"
Cohesion: 0.14
Nodes (33): account(), adoptUp(), api(), assetOf(), blobOf(), broken, cached(), changed() (+25 more)

### Community 39 - "graveyard.mjs"
Cohesion: 0.17
Nodes (18): RACK_STYLES, epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN, MAX_TURN (+10 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.07
Nodes (20): seeThroughPlastic(), isHalo(), keepSnapshotAsset(), colorHint(), finishChoice(), matchPhotoColor(), opacityChoice(), photoColorHint() (+12 more)

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.20
Nodes (17): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+9 more)

### Community 43 - "mountGraveyard"
Cohesion: 0.15
Nodes (21): ABOVE_GROUND, engraving(), mountGraveyard(), dress(), hover(), idAt(), layout(), makePlot() (+13 more)

### Community 44 - "disc3d-profile.mjs"
Cohesion: 0.19
Nodes (12): CLAY_TONES, esc(), LABELS, n(), PROFILE_FRAME, profileDimensions(), profileSVG(), SPEC (+4 more)

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
Cohesion: 0.10
Nodes (31): close(), components(), distanceTo(), extractPhotoStamp(), f(), fillFromRing(), gaussian(), ghosts() (+23 more)

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
Cohesion: 0.22
Nodes (11): DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, KEYS, LIST, OVERMOLD_DISCS, overmoldColors(), parseColor(), toHex() (+3 more)

### Community 55 - "colourdiff.mjs"
Cohesion: 0.08
Nodes (15): a, b, [disc,box,out], H, heat, L, P, T (+7 more)

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
Cohesion: 0.09
Nodes (56): coarse(), DISC_BUDGET, discColors(), discMaterial(), discModel(), parts, personalStampStyle(), softwareRenderer() (+48 more)

### Community 60 - "ref_node_test"
Cohesion: 0.13
Nodes (8): syncMyMap(), COPY_BIAS_SHIFT, moldShifts(), personalPositions(), context, T, context, molds

### Community 61 - "vite.config.ts"
Cohesion: 0.18
Nodes (6): vinext, vite, readExecutionProfile(), cli, [command, ...args], localBindingConfig

### Community 62 - "atlas-3d-browser.mjs"
Cohesion: 0.15
Nodes (11): checks, {chromium}, errors, SCENE(), server, settled(), show(), VIEWPORTS (+3 more)

### Community 63 - "pnpm-install.mjs"
Cohesion: 0.23
Nodes (10): CACHE_SEEDS, holdInstallLocks(), InstallProgress, main(), openLock(), openReport(), OPERATIONAL_FAILURE_CODES, showLine() (+2 more)

### Community 64 - "haloBand"
Cohesion: 0.27
Nodes (18): pocketLabel(), renderFinish(), stabilityBiasLabel(), stampChoiceOf(), haloBand(), haloModel(), bagRimColor(), photoURL() (+10 more)

### Community 65 - "disc-register.mjs"
Cohesion: 0.12
Nodes (35): along(), apply(), autoRegister(), CENTRE_CAP, cropThrough(), designCentre(), eigen(), ellipseFrom() (+27 more)

### Community 66 - "common.mjs"
Cohesion: 0.07
Nodes (41): only, only, berg, crop(), exists, EXTRA, framing, IN (+33 more)

### Community 67 - "theme"
Cohesion: 0.05
Nodes (27): theme(), checks, {chromium}, errors, only, server, types, {chromium} (+19 more)

### Community 68 - "pathlib"
Cohesion: 0.12
Nodes (8): digest(), measure(), extract(), slug(), digest(), run(), slug(), extract()

### Community 69 - "tests/disc-stamp-clear.mjs"
Cohesion: 0.18
Nodes (14): clearPhoto(), disc(), GLARE, glareCase(), HAIR, inBox(), NAVY, NAVY_BOX (+6 more)

### Community 70 - "atlas-speed-band-browser.mjs"
Cohesion: 0.18
Nodes (10): CAMERAS, {chromium}, errors, failures, RENDERED(), server, settled(), show() (+2 more)

### Community 71 - "photo-stamp-sync.mjs"
Cohesion: 0.31
Nodes (8): C, fixture(), form(), P, png(), put(), sharp, webp()

### Community 72 - "atlas-speed-band.mjs"
Cohesion: 0.18
Nodes (9): base, CHROME, off(), prints, rated, runtime, SIZES, STATES (+1 more)

### Community 73 - "photo-stamp-identity-browser.mjs"
Cohesion: 0.11
Nodes (13): {chromium}, ink(), server, at, baseline, compare(), noise, runs (+5 more)

### Community 74 - "display-palette.mjs"
Cohesion: 0.23
Nodes (11): contrast(), distance(), lab(), linear(), luminance(), MATRICES, minDistance(), oklch() (+3 more)

### Community 75 - "stamp.mjs"
Cohesion: 0.15
Nodes (23): build(), paint(), preview(), getAtlasArt(), isColorStamp(), PHOTO_STAMP, detailPixelRatio(), catalogStampAsset() (+15 more)

### Community 77 - "slider-drag-browser.mjs"
Cohesion: 0.11
Nodes (18): {chromium}, contrast(), errors, full(), linear(), luminance(), matrices, report (+10 more)

### Community 78 - "workers/bag.mjs"
Cohesion: 0.23
Nodes (14): body(), json(), LOOKS, owned(), part(), placed(), PNG_CHUNKS, shape() (+6 more)

### Community 79 - "dropdown-indicator-browser.mjs"
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

### Community 85 - "buildClusters"
Cohesion: 0.18
Nodes (21): buildClusters(), cancelRegroup(), dotArtRadius(), drawCompareHighlights(), ensureGroupWorker(), flightLevel(), hydrateGaps(), hydrateGroups() (+13 more)

### Community 86 - "tests/auth.mjs"
Cohesion: 0.20
Nodes (4): delete(), database(), setup(), valid

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.06
Nodes (20): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+12 more)

### Community 88 - "public.mjs"
Cohesion: 0.10
Nodes (19): jose, fixture(), item, setup(), setup(), googleFetch, reply, worker (+11 more)

### Community 89 - "bag-popup-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 91 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.05
Nodes (32): mold(), rated(), assignments, baseline, batch, {chromium}, controls, molds (+24 more)

### Community 92 - "apple-design-2-browser.mjs"
Cohesion: 0.13
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 93 - "disc-stamp-worker.mjs"
Cohesion: 0.18
Nodes (10): inkBounds(), shoulder, lin(), printSupport(), SEPARATE, extract(), register(), out (+2 more)

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
Cohesion: 0.29
Nodes (8): CLEAR, acquirePhoto(), cache, clearPhoto(), heightRows(), luminanceRows(), nextTask(), reliefTexture()

### Community 99 - "install-pnpm.sh"
Cohesion: 0.39
Nodes (7): acquire_shared_lock(), can_write_directory(), release_shared_lock(), report_store(), install-pnpm.sh script, XDG_CACHE_HOME, XDG_DATA_HOME

### Community 101 - "test_manufacturer_diff.py"
Cohesion: 0.11
Nodes (3): Validator, blob(), FractionAuditTests

### Community 102 - "bag-collections-browser.mjs"
Cohesion: 0.09
Nodes (14): {chromium}, COLORS, command(), errors, MOLDS, PLASTICS, report, server (+6 more)

### Community 103 - "bag-spin-pocket-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, metrics, server, shots, THEMES

### Community 104 - "account.js"
Cohesion: 0.52
Nodes (5): api(), refresh(), renderPage(), signOut(), sync()

### Community 105 - "ref_node_fs"
Cohesion: 0.05
Nodes (27): output, data, baseline, {chromium}, photos, profile, server, verifyLayout (+19 more)

### Community 106 - "halo.mjs"
Cohesion: 0.24
Nodes (10): frontAt(), HALO_FEATHER, HALO_FORMAT, HALO_RING, HALO_STREAKS, NAMES, haloCoord(), linear() (+2 more)

### Community 107 - "atlas-lod.mjs"
Cohesion: 0.36
Nodes (6): HOLD_LIMIT, LOD_MARGIN, lodFor(), LODS, ORDER, walk()

### Community 108 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 109 - "atlas-targets.js"
Cohesion: 0.53
Nodes (4): inBox(), pick(), reach(), reads()

### Community 110 - "photo-stamp-color-assets-evidence.mjs"
Cohesion: 0.31
Nodes (8): bagShots(), cases, CHOSEN, finishOnly, frame(), results, viewerShots(), wait()

### Community 111 - "bag-tweaks-browser.mjs"
Cohesion: 0.15
Nodes (10): checks, {chromium}, command(), errors, GOTO, MAIN, metrics, PUTTERS (+2 more)

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 113 - "ref_node_test"
Cohesion: 0.09
Nodes (54): bagDiscGeometry(), discParts(), HALO_PLASTICS, discGeometry(), groupRim(), lathePoints(), liftThumbtack(), topLayerGeometry() (+46 more)

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

### Community 120 - "bag-demo.mjs"
Cohesion: 0.32
Nodes (6): DEMO_BAG, DEMO_DISCS, discs, byId, models, plastics

### Community 121 - "display-customization-browser.mjs"
Cohesion: 0.29
Nodes (3): agree(), CLASSIC, consumers()

### Community 140 - "disc-request.js"
Cohesion: 0.36
Nodes (5): clearErrors(), fieldsFor(), fillBrands(), open(), showErrors()

### Community 141 - "stability.mjs"
Cohesion: 0.11
Nodes (23): bestShift(), box(), CHROMA, encode(), field(), INK, labToRgb(), RIM (+15 more)

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 143 - "shopping.js"
Cohesion: 0.70
Nodes (4): offers(), render(), row(), tracking()

### Community 146 - "schema.ts"
Cohesion: 0.33
Nodes (4): bagItems, coachUsage, profiles, drizzle-orm

### Community 147 - "disc-photo-qa.mjs"
Cohesion: 0.28
Nodes (11): exposure(), GATE, glare(), luma(), luma1024(), photoGate(), RETAKE, sharpness() (+3 more)

### Community 148 - "photo-level-measure.mjs"
Cohesion: 0.43
Nodes (4): angleOf(), luma(), renderedStampAngle(), stampAngle()

### Community 149 - "display-customization-evidence.mjs"
Cohesion: 0.46
Nodes (6): catalogDisc(), ready(), setTheme(), shot(), trio(), wait()

### Community 152 - "atlas-layout.mjs"
Cohesion: 0.19
Nodes (9): catalogBase, context, filters(), fixtures, random(), rated, score(), sizes (+1 more)

### Community 153 - "rack-motion.mjs"
Cohesion: 0.23
Nodes (11): clamp(), DEFAULT_RACK_COLOR, discPose(), easeInOut(), mix(), RESTAGE_MS, SLIDE_MS, stage() (+3 more)

### Community 154 - "workers/bag.mjs"
Cohesion: 0.16
Nodes (12): validateUpload(), chunk(), extended(), fixture(), byId, createBag(), idAliases, cleanupTextures() (+4 more)

### Community 155 - "display-harness.mjs"
Cohesion: 0.10
Nodes (12): scene, photoSource, directoryLink, form, mapLink, rows(), sheet, BAG (+4 more)

### Community 156 - "photo-stamp-assets-evidence.mjs"
Cohesion: 0.36
Nodes (7): bagShots(), cases, CHOSEN, frame(), results, viewerShots(), wait()

### Community 157 - "more-packs-evidence.mjs"
Cohesion: 0.31
Nodes (5): openSheet(), packs(), region(), setTheme(), wait()

### Community 158 - "photo-retake-browser.mjs"
Cohesion: 0.33
Nodes (3): log(), photo(), sharp

### Community 159 - "0017_disc_requests.sql"
Cohesion: 0.60
Nodes (4): disc_request_throttle, disc_request_throttle_hour, disc_requests, disc_requests_status

### Community 160 - "prompt-4-leftovers-browser.mjs"
Cohesion: 0.12
Nodes (11): baselines, {chromium}, command(), live, sql(), start(), pause(), pw (+3 more)

### Community 161 - "tests/disc-stamp-delight.mjs"
Cohesion: 0.27
Nodes (7): disc(), enc(), flash(), labAt(), lin(), sharp, SPOT

### Community 162 - "sync"
Cohesion: 0.22
Nodes (10): activateBag(), closeBagTips(), directory(), isDemo(), leaveBag(), positionBagTips(), setBagView(), showDemo() (+2 more)

### Community 163 - "qa.mjs"
Cohesion: 0.62
Nodes (6): edgeSharpness(), exposure(), gate, glare(), luma(), sharpness()

### Community 164 - "clear-plastic-partb-evidence.mjs"
Cohesion: 0.33
Nodes (3): log(), photo, results

### Community 165 - "disc-appearance-browser.mjs"
Cohesion: 0.25
Nodes (7): by(), catalog, {chromium}, examples, items, server, settings

### Community 167 - "directory-layout-browser.mjs"
Cohesion: 0.18
Nodes (9): checks, {chromium}, desktop, errors, metrics, phone, server, shots (+1 more)

### Community 168 - "LostScene"
Cohesion: 0.18
Nodes (5): rackCount(), CollectionScene, esc(), LostScene, StorageScene

### Community 169 - "photo-adder-rework-browser.mjs"
Cohesion: 0.50
Nodes (4): log(), results, sharp, shoot()

### Community 172 - "workers/coach.mjs"
Cohesion: 0.24
Nodes (10): database(), setup(), askCoach(), coachContext(), groundedReply(), headers, instructions(), json() (+2 more)

### Community 173 - "ref_node_fs"
Cohesion: 0.03
Nodes (49): output, server, NpmCacheProgress, runNpmInstall(), projectRoot, checks, {chromium}, errors (+41 more)

### Community 185 - "photo-stamp-color-assets-browser.mjs"
Cohesion: 0.33
Nodes (6): dE(), hex(), inksIn(), lab(), photo(), sharp

### Community 186 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

## Knowledge Gaps
- **52 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1490 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `inCollection()` connect `app.js` to `bag-tweaks-browser.mjs`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `createDiscViewer()` (e.g. with `applyPose()` and `attach()`) actually correct?**
  _`createDiscViewer()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05636114911080711 - nodes in this community are weakly interconnected._
- **Why does `jose` connect `public.mjs` to `package.json`, `workers/auth.mjs`, `tests/auth.mjs`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10261569416498995 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._