# Graph Report - photo-stamp-one-click  (2026-10-21)

## Corpus Check
- 445 files · ~5,630,285 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 306 file(s) not represented in the graph (top: .log 231, .gz 23, .css 16)

## Summary
- 2953 nodes · 6237 edges · 171 communities (138 shown, 33 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 243 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6d99800a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- workers/auth.mjs
- Bag scene
- bag.js
- ref_node_child_process
- scripts
- disc-photo.mjs
- sampling-audit-draw.mjs
- package.json
- disc3d-popout-browser.mjs
- accent-follows-appearance-evidence.mjs
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
- test_manufacturer_diff.py
- disc3d/viewer.mjs
- all-discs-gallery.js
- bag-values.js
- dependencies
- LostScene
- atlas-art.mjs
- Account and bag SQL schema
- state
- atlas-depth-browser.mjs
- lens-corner-browser.mjs
- collection-scenes.js
- public/disc-stamp-color.mjs
- bag-layout.mjs
- disc-albedo.mjs
- atlas-persist-browser.mjs
- devDependencies
- racks.mjs
- halo-swirl.mjs
- photo-editor-races.mjs
- compilerOptions
- atlas-groups.js
- shape.mjs
- personal-lens.mjs
- bag-interactions-browser.mjs
- components.json
- Detail and pop-out viewer bridge
- pnpm-install.mjs
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
- theme
- vite.config.ts
- public/disc-stamp-delight.mjs
- stage.mjs
- atlas-layout.mjs
- public.mjs
- stamp.mjs
- workers/bag.mjs
- pathlib
- atlas-speed-band.mjs
- atlas-speed-band-browser.mjs
- bag-v13-browser.mjs
- tests/auth.mjs
- photo-stamp-identity-browser.mjs
- display-palette.mjs
- stamps.mjs
- bag-staging-browser.mjs
- slider-drag-browser.mjs
- render
- ref_node_assert
- photo-albedo.mjs
- bag-tweaks-browser.mjs
- ref_node_module
- halo-band-sampling.mjs
- haloBand
- buildClusters
- palette.mjs
- discraft-fraction-audit-browser.mjs
- mountGraveyard
- gallery-fixes-browser.mjs
- StampManifestTests
- discraft-stamps-batch2-browser.mjs
- apple-design-2-browser.mjs
- directory-layout-browser.mjs
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
- my-map-browser.mjs
- next
- atlas-targets.js
- ref_node_path
- bag-spin-pocket-browser.mjs
- install-ci.sh
- dropdown-indicator-browser.mjs
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- apple-design-3-browser.mjs
- cloudflare-env.d.ts
- overrides
- NameTag
- delightPixels
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- bag-demo-browser.mjs
- workers/coach.mjs
- compose-discraft-fraction-proofs.py
- shopping.js
- atlas-organic.mjs
- sync
- photo-stamp-color-assets-browser.mjs
- photo-level-measure.mjs
- photo.mjs
- photo-stamp-stall-browser.mjs
- photo-stamp-color-assets-evidence.mjs
- more-packs-evidence.mjs
- ref_node_test
- display-harness.mjs
- display-customization-browser.mjs
- photo-stamp-assets-evidence.mjs
- disc-appearance-browser.mjs
- drizzle-kit
- engines
- scheduleMapDraw
- playwright
- photo-stamp-sync.mjs
- photo-stamp-sync-browser.mjs
- tests/disc-stamp-delight.mjs
- photo-stamp-one-click-evidence.mjs
- atlas-3d-perf.mjs
- photo-stamp-one-click-browser.mjs
- proof-discraft-batch2.py
- runtime

## God Nodes (most connected - your core abstractions)
1. `BagScene` - 63 edges
2. `scripts` - 60 edges
3. `createDiscViewer()` - 51 edges
4. `mountBag()` - 38 edges
5. `mountRacks()` - 37 edges
6. `theme()` - 34 edges
7. `render()` - 34 edges
8. `state()` - 32 edges
9. `SceneView` - 29 edges
10. `createAtlasArt()` - 29 edges

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

## Communities (171 total, 33 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (80): activeLens(), addDestinationControl(), applyTheme(), atlasPriority(), bagColors(), brandColor(), brandList(), brandPalette (+72 more)

### Community 1 - "workers/auth.mjs"
Cohesion: 0.21
Nodes (17): base64url(), body(), cookie(), account(), callback(), session(), start(), write() (+9 more)

### Community 2 - "Bag scene"
Cohesion: 0.10
Nodes (11): accent(), BAG_SPRING, BagScene, div(), loadViewer(), POCKET, reduced(), stampStyle() (+3 more)

### Community 3 - "bag.js"
Cohesion: 0.10
Nodes (49): dynamic, GET(), GET(), DELETE(), photoBytes(), POST(), PUT(), save() (+41 more)

### Community 4 - "ref_node_child_process"
Cohesion: 0.04
Nodes (31): {chromium}, server, {chromium}, command(), errors, server, {chromium}, server (+23 more)

### Community 5 - "scripts"
Cohesion: 0.03
Nodes (60): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+52 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.06
Nodes (73): encodeHalo(), account(), adoptUp(), api(), assetOf(), blobOf(), broken, cached() (+65 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.10
Nodes (23): a, args, base(), brandCount, byId, cellPool(), cells, excludedIds (+15 more)

### Community 8 - "package.json"
Cohesion: 0.05
Nodes (40): name, packageManager, private, type, version, @base-ui/react, class-variance-authority, @cloudflare/vite-plugin (+32 more)

### Community 9 - "disc3d-popout-browser.mjs"
Cohesion: 0.07
Nodes (19): byName(), {chromium}, errors, server, settle(), show(), types, view() (+11 more)

### Community 10 - "accent-follows-appearance-evidence.mjs"
Cohesion: 0.15
Nodes (20): BEFORE, box(), CHOSEN, clip(), closeMenu(), compose(), LIME, load() (+12 more)

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.07
Nodes (33): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+25 more)

### Community 12 - "initAtlasMap"
Cohesion: 0.20
Nodes (19): animateZoom(), boundedCamera(), cameraMoving(), catchAtlasIntro(), changeZoom(), clearClusterTimers(), closeCluster(), immersiveMap() (+11 more)

### Community 13 - "halo-plastic-browser.mjs"
Cohesion: 0.07
Nodes (27): {chromium}, command(), server, chroma(), {chromium}, command(), dE(), dist() (+19 more)

### Community 14 - "my-bag.js"
Cohesion: 0.06
Nodes (34): addMenu, addMenuOpen(), bagColorMap, bagHaloMap, bagHaloModelMap, bagPhotoMap, bagRimColorMap, catalogs (+26 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.08
Nodes (33): atlasPositions, CAMERA_AXES, cameraSpring, clusterPicks, comparisonMarkup(), comparisonPalette(), discArt(), dropMarkerArt() (+25 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.15
Nodes (34): lightTheme(), colorStyle(), angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), attach(), build() (+26 more)

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.07
Nodes (42): DISC, GLB_ACCENT_POSE, stageMode(), attachDiscFeatures(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot() (+34 more)

### Community 20 - "mountRacks"
Cohesion: 0.21
Nodes (21): rackSlot(), rackX(), restHeight(), rowWidth(), mountRacks(), batchFor(), box(), drop() (+13 more)

### Community 22 - "disc3d/viewer.mjs"
Cohesion: 0.09
Nodes (25): DEFAULT_DISC_COLOR, DEFAULT_RIM_COLOR, KEYS, LIST, OVERMOLD_DISCS, overmoldColors(), parseColor(), toHex() (+17 more)

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.29
Nodes (8): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagClass(), rackOrder(), storedItems()

### Community 24 - "bag-values.js"
Cohesion: 0.18
Nodes (20): BAG_COLORS, bagPalette(), bagSlots(), DEFAULT_BAG_COLOR, defaultDiscDetails(), defaultPocket(), plasticColor(), plasticOptions() (+12 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "LostScene"
Cohesion: 0.17
Nodes (7): rackCount(), CollectionScene, count(), esc(), LostScene, plural(), StorageScene

### Community 27 - "atlas-art.mjs"
Cohesion: 0.16
Nodes (23): createAtlasArt(), dispose(), geometryOf(), get(), has(), render(), shapeOf(), touch() (+15 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.10
Nodes (23): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+15 more)

### Community 29 - "state"
Cohesion: 0.06
Nodes (30): state(), command(), command(), {chromium}, command(), errors, server, shots (+22 more)

### Community 30 - "atlas-depth-browser.mjs"
Cohesion: 0.12
Nodes (13): CAMERAS, checks, {chromium}, clean(), errors, gapArt(), server, settled() (+5 more)

### Community 31 - "lens-corner-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, server, shots, THEMES, WIDTHS (+1 more)

### Community 32 - "collection-scenes.js"
Cohesion: 0.11
Nodes (27): RACK_STYLES, epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN, MAX_TURN (+19 more)

### Community 33 - "public/disc-stamp-color.mjs"
Cohesion: 0.32
Nodes (12): box(), distanceTo(), encode(), extractStampColor(), finv(), gaussian(), kmeans(), labToRgb() (+4 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.08
Nodes (41): assignSides(), BAG_BOX, bagLayout(), brickRows(), byKey(), clamp(), depthOrder(), fan() (+33 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.18
Nodes (24): bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress(), dyeGroup() (+16 more)

### Community 36 - "atlas-persist-browser.mjs"
Cohesion: 0.16
Nodes (10): checks, {chromium}, clickLands(), errors, mapOwned(), onMap(), READABLE(), reset() (+2 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "racks.mjs"
Cohesion: 0.10
Nodes (24): rackStyle(), clamp(), DEFAULT_RACK_COLOR, discPose(), easeInOut(), mix(), RESTAGE_MS, SLIDE_MS (+16 more)

### Community 39 - "halo-swirl.mjs"
Cohesion: 0.17
Nodes (20): asymFront(), drawnFront(), [dye,wash,plate,ink], dyeShare(), enc(), fbm(), glared(), INK (+12 more)

### Community 40 - "photo-editor-races.mjs"
Cohesion: 0.10
Nodes (7): isHalo(), apiSource, bagSource, closeSource, editorFixture(), saveSource, stampStubs

### Community 41 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 42 - "atlas-groups.js"
Cohesion: 0.20
Nodes (17): artRoom(), build(), curate(), gapAlpha(), gapDepth(), gapDrop(), gapLabelAlpha(), gapSize() (+9 more)

### Community 43 - "shape.mjs"
Cohesion: 0.11
Nodes (42): bagDiscGeometry(), discParts(), haloCoord(), discGeometry(), groupRim(), lathePoints(), isOvermold(), clamp() (+34 more)

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

### Community 48 - "pnpm-install.mjs"
Cohesion: 0.21
Nodes (10): CACHE_SEEDS, holdInstallLocks(), InstallProgress, main(), openLock(), openReport(), OPERATIONAL_FAILURE_CODES, showLine() (+2 more)

### Community 49 - "api.cjs"
Cohesion: 0.12
Nodes (11): assert, {createRequire}, fs, {Miniflare}, req, root, assert, ctx (+3 more)

### Community 50 - "public/disc-stamp-extract.mjs"
Cohesion: 0.15
Nodes (21): close(), components(), distanceTo(), extractPhotoStamp(), f(), gaussian(), hexToLab(), hysteresis() (+13 more)

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
Cohesion: 0.12
Nodes (18): dotArtRadius(), drawCompareHighlights(), keepPinned(), mapMarkerScale(), markerLabel(), markerTarget(), checks, {chromium} (+10 more)

### Community 55 - "display-customization-evidence.mjs"
Cohesion: 0.46
Nodes (6): catalogDisc(), ready(), setTheme(), shot(), trio(), wait()

### Community 56 - "halo-band-v2.mjs"
Cohesion: 0.18
Nodes (13): frontAt(), FRONT_RING, ASYM_FEATHER, dE(), delit(), disc(), enc(), L() (+5 more)

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
Cohesion: 0.06
Nodes (24): theme(), checks, {chromium}, errors, server, types, checks, {chromium} (+16 more)

### Community 61 - "vite.config.ts"
Cohesion: 0.18
Nodes (6): vinext, vite, readExecutionProfile(), cli, [command, ...args], localBindingConfig

### Community 62 - "public/disc-stamp-delight.mjs"
Cohesion: 0.21
Nodes (16): box(), delightStamp(), encode(), f(), fillHoles(), fit(), fitted, kmeans() (+8 more)

### Community 63 - "stage.mjs"
Cohesion: 0.16
Nodes (22): coarse(), DISC_BUDGET, discColors(), discMaterial(), discModel(), parts, personalStampStyle(), softwareRenderer() (+14 more)

### Community 64 - "atlas-layout.mjs"
Cohesion: 0.19
Nodes (9): catalogBase, context, filters(), fixtures, random(), rated, score(), sizes (+1 more)

### Community 65 - "public.mjs"
Cohesion: 0.29
Nodes (9): fixture(), item, setup(), database(), setup(), createAuth(), createCoach(), createPublicWorker() (+1 more)

### Community 66 - "stamp.mjs"
Cohesion: 0.13
Nodes (22): build(), paint(), preview(), PLASTICS, isColorStamp(), PHOTO_STAMP, DETAIL, detailPixelRatio() (+14 more)

### Community 67 - "workers/bag.mjs"
Cohesion: 0.15
Nodes (11): validateUpload(), fixture(), chunk(), extended(), fixture(), byId, createBag(), imageBytes() (+3 more)

### Community 68 - "pathlib"
Cohesion: 0.12
Nodes (8): digest(), measure(), extract(), slug(), digest(), run(), slug(), extract()

### Community 69 - "atlas-speed-band.mjs"
Cohesion: 0.18
Nodes (9): base, CHROME, off(), prints, rated, runtime, SIZES, STATES (+1 more)

### Community 70 - "atlas-speed-band-browser.mjs"
Cohesion: 0.18
Nodes (10): CAMERAS, {chromium}, errors, failures, RENDERED(), server, settled(), show() (+2 more)

### Community 71 - "bag-v13-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, server, shots, themes, widths

### Community 72 - "tests/auth.mjs"
Cohesion: 0.18
Nodes (6): jose, delete(), googleFetch, reply, worker, googleFixture()

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

### Community 78 - "render"
Cohesion: 0.27
Nodes (20): api(), chooseRackStyle(), focusFirst(), foundDisc(), loadBag(), lostItems(), memorialWall(), mold() (+12 more)

### Community 79 - "ref_node_assert"
Cohesion: 0.05
Nodes (22): output, data, context, T, ids, items, results, results (+14 more)

### Community 80 - "photo-albedo.mjs"
Cohesion: 0.24
Nodes (11): SOFTEN_GLARE, ab(), enc(), lin(), luma(), lumAt(), photo(), enc() (+3 more)

### Community 81 - "bag-tweaks-browser.mjs"
Cohesion: 0.15
Nodes (10): checks, {chromium}, command(), errors, GOTO, MAIN, metrics, PUTTERS (+2 more)

### Community 82 - "ref_node_module"
Cohesion: 0.05
Nodes (36): {chromium}, errors, report, server, camera(), {chromium}, errors, pixelFailures (+28 more)

### Community 83 - "halo-band-sampling.mjs"
Cohesion: 0.22
Nodes (12): DYE, SEAM, dE(), disc(), enc(), isDye(), L(), lab() (+4 more)

### Community 84 - "haloBand"
Cohesion: 0.40
Nodes (9): bagComparator(), haloBand(), haloModel(), bagRimColor(), photoURL(), bagDetailMarkup(), bagged(), detailAppearance() (+1 more)

### Community 85 - "buildClusters"
Cohesion: 0.27
Nodes (12): buildClusters(), cancelRegroup(), ensureGroupWorker(), hydrateGaps(), hydrateGroups(), measureChrome(), measureFullLabels(), organicAtlas() (+4 more)

### Community 86 - "palette.mjs"
Cohesion: 0.22
Nodes (8): {chromium}, contrast(), errors, full(), linear(), luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.05
Nodes (27): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+19 more)

### Community 88 - "mountGraveyard"
Cohesion: 0.15
Nodes (21): ABOVE_GROUND, engraving(), mountGraveyard(), dress(), hover(), idAt(), layout(), makePlot() (+13 more)

### Community 89 - "gallery-fixes-browser.mjs"
Cohesion: 0.18
Nodes (6): read(), {chromium}, command(), errors, report, server

### Community 91 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.05
Nodes (29): {chromium}, command(), metrics, server, mold(), rated(), assignments, baseline (+21 more)

### Community 92 - "apple-design-2-browser.mjs"
Cohesion: 0.13
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 93 - "directory-layout-browser.mjs"
Cohesion: 0.18
Nodes (9): checks, {chromium}, desktop, errors, metrics, phone, server, shots (+1 more)

### Community 94 - "display-palette.js"
Cohesion: 0.42
Nodes (8): accentTokens(), classColor(), commit(), css(), get(), normalize(), paint(), toneOf()

### Community 95 - "draw"
Cohesion: 0.24
Nodes (12): artFrame(), draw(), drawSatelliteLeaders(), featuredDisc(), focusFeatured(), measureMap(), presentAtlas(), setMapText() (+4 more)

### Community 96 - "atlas-motion.js"
Cohesion: 0.21
Nodes (7): fadeOut(), renderMarkers(), selectedGroup(), dismiss(), reveal(), selected(), slide()

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
Cohesion: 0.18
Nodes (9): {chromium}, COLORS, command(), errors, MOLDS, PLASTICS, report, server (+1 more)

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

### Community 107 - "my-map-browser.mjs"
Cohesion: 0.18
Nodes (8): BAG, checks, {chromium}, command(), errors, metrics, server, shots

### Community 108 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 109 - "atlas-targets.js"
Cohesion: 0.53
Nodes (4): inBox(), pick(), reach(), reads()

### Community 110 - "ref_node_path"
Cohesion: 0.11
Nodes (9): output, server, NpmCacheProgress, runNpmInstall(), projectRoot, checks, {chromium}, errors (+1 more)

### Community 111 - "bag-spin-pocket-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, metrics, server, shots, THEMES

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 113 - "dropdown-indicator-browser.mjs"
Cohesion: 0.17
Nodes (9): checks, {chromium}, command(), controls, errors, server, shots, THEMES (+1 more)

### Community 115 - "0000_powerful_pepper_potts.sql"
Cohesion: 0.50
Nodes (3): `bag_items`, `coach_usage`, `profiles`

### Community 116 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 117 - "apple-design-3-browser.mjs"
Cohesion: 0.17
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 121 - "delightPixels"
Cohesion: 0.36
Nodes (7): delightPixels(), plateColor(), extract(), disc(), labAt(), region(), sharp

### Community 140 - "bag-demo-browser.mjs"
Cohesion: 0.20
Nodes (7): bagCalls, checks, {chromium}, command(), errors, server, shots

### Community 141 - "workers/coach.mjs"
Cohesion: 0.31
Nodes (8): askCoach(), coachContext(), groundedReply(), headers, instructions(), json(), schema, usageCost()

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 143 - "shopping.js"
Cohesion: 0.70
Nodes (4): offers(), render(), row(), tracking()

### Community 144 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

### Community 146 - "sync"
Cohesion: 0.22
Nodes (10): activateBag(), closeBagTips(), directory(), isDemo(), leaveBag(), positionBagTips(), setBagView(), showDemo() (+2 more)

### Community 147 - "photo-stamp-color-assets-browser.mjs"
Cohesion: 0.33
Nodes (6): dE(), hex(), inksIn(), lab(), photo(), sharp

### Community 148 - "photo-level-measure.mjs"
Cohesion: 0.43
Nodes (4): angleOf(), luma(), renderedStampAngle(), stampAngle()

### Community 149 - "photo.mjs"
Cohesion: 0.29
Nodes (8): acquirePhoto(), cache, heightRows(), luminanceRows(), nextTask(), photoGeometry(), photoSurface(), reliefTexture()

### Community 151 - "photo-stamp-stall-browser.mjs"
Cohesion: 0.22
Nodes (5): file(), make(), ready(), results, sharp

### Community 152 - "photo-stamp-color-assets-evidence.mjs"
Cohesion: 0.31
Nodes (8): bagShots(), cases, CHOSEN, finishOnly, frame(), results, viewerShots(), wait()

### Community 153 - "more-packs-evidence.mjs"
Cohesion: 0.31
Nodes (5): openSheet(), packs(), region(), setTheme(), wait()

### Community 154 - "ref_node_test"
Cohesion: 0.28
Nodes (6): DEMO_BAG, DEMO_DISCS, discs, byId, models, plastics

### Community 155 - "display-harness.mjs"
Cohesion: 0.39
Nodes (6): scene, BAG, openDevice(), playwright, startHarness(), startServer()

### Community 156 - "display-customization-browser.mjs"
Cohesion: 0.29
Nodes (3): agree(), CLASSIC, consumers()

### Community 157 - "photo-stamp-assets-evidence.mjs"
Cohesion: 0.36
Nodes (7): bagShots(), cases, CHOSEN, frame(), results, viewerShots(), wait()

### Community 158 - "disc-appearance-browser.mjs"
Cohesion: 0.25
Nodes (7): by(), catalog, {chromium}, examples, items, server, settings

### Community 161 - "scheduleMapDraw"
Cohesion: 0.24
Nodes (10): artZooming(), drawGaps(), gapName(), gapSprite(), gapTarget(), keepPinnedGaps(), levelHeld(), mapTargets() (+2 more)

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

### Community 169 - "proof-discraft-batch2.py"
Cohesion: 0.60
Nodes (3): main(), slug(), tile()

## Knowledge Gaps
- **52 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1262 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jose` connect `tests/auth.mjs` to `package.json`, `workers/auth.mjs`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05962059620596206 - nodes in this community are weakly interconnected._
- **Why does `inCollection()` connect `app.js` to `bag-tweaks-browser.mjs`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10093896713615023 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Should `bag.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._