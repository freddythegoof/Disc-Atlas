# Graph Report - gallery-photo-continuation-fix  (2026-10-20)

## Corpus Check
- 424 files · ~5,602,291 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 269 file(s) not represented in the graph (top: .log 194, .gz 23, .css 16)

## Summary
- 2733 nodes · 5760 edges · 155 communities (119 shown, 36 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 233 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3565cf1c`
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
- verify-discraft-fraction-schema.py
- overmold.mjs
- all-discs-gallery.js
- bag-values.js
- dependencies
- LostScene
- disc3d/viewer.mjs
- Account and bag SQL schema
- scheduleMapDraw
- halo.mjs
- lens-corner-browser.mjs
- collection-scenes.js
- public.mjs
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
- apple-design-2-browser.mjs
- api.cjs
- atlas-layout.js
- atlas-organic-browser.mjs
- Catalog generation and stamp validation
- about-hero.js
- .zoom
- display-harness.mjs
- halo-band-v2.mjs
- sites-env.sh
- atlas-depth.mjs
- bag-popup-browser.mjs
- bag-v13-browser.mjs
- vite.config.ts
- ref_node_test
- stage.mjs
- atlas-layout.mjs
- theme
- state
- bag-animation-perf.mjs
- pathlib
- atlas-speed-band.mjs
- atlas-speed-band-browser.mjs
- my-map-browser.mjs
- atlas-layout.js
- ref_node_vm
- display-palette.mjs
- playwright
- bag-staging-browser.mjs
- slider-drag-browser.mjs
- mold
- ref_node_fs
- photo-albedo.mjs
- bag-memorial-browser.mjs
- NameTag
- halo-band-sampling.mjs
- atlas-organic.mjs
- buildClusters
- palette.mjs
- discraft-fraction-audit-browser.mjs
- mountGraveyard
- ref_node_assert
- StampManifestTests
- discraft-stamps-batch2-browser.mjs
- ref_node_http
- apple-design-3-browser.mjs
- display-palette.js
- draw
- atlas-motion.js
- coach.js
- bag-pockets-browser.mjs
- install-pnpm.sh
- discraft_batch2_test.py
- stamp_fraction_audit_test.py
- atlas-organic.mjs
- schema.ts
- account.js
- stage.mjs
- prompt-4-leftovers-browser.mjs
- personal-map-worker.mjs
- next
- atlas-targets.js
- atlas-3d-perf.mjs
- workers/coach.mjs
- install-ci.sh
- bag-v12-browser.mjs
- app/route.ts
- 0000_powerful_pepper_potts.sql
- eslint.config.mjs
- stamp-scale-browser.mjs
- cloudflare-env.d.ts
- overrides
- drizzle-kit
- engines
- postcss.config.mjs
- raw.d.ts
- build-verified.sh
- disc-appearance-browser.mjs
- photo.mjs
- compose-discraft-fraction-proofs.py
- shopping.js
- render
- more-packs-evidence.mjs
- photo.mjs
- photo-level-measure.mjs
- disc-webp.mjs
- display-customization-browser.mjs
- bag-map-controls-browser.mjs
- photo-stamp-assets-evidence.mjs
- personal-map-worker.mjs
- stamp-scale-proofs.mjs

## God Nodes (most connected - your core abstractions)
1. `BagScene` - 63 edges
2. `scripts` - 59 edges
3. `createDiscViewer()` - 50 edges
4. `mountBag()` - 37 edges
5. `mountRacks()` - 37 edges
6. `render()` - 34 edges
7. `theme()` - 32 edges
8. `state()` - 32 edges
9. `SceneView` - 29 edges
10. `AuditTests` - 29 edges

## Surprising Connections (you probably didn't know these)
- `layout()` --indirect_call--> `columns()`  [INFERRED]
  public/collection3d/graveyard.mjs → tests/bag-3d-layout.mjs
- `sampled()` --calls--> `delightPixels()`  [EXTRACTED]
  tests/halo-band-sampling.mjs → public/disc-albedo.mjs
- `editorFixture()` --indirect_call--> `isHalo()`  [INFERRED]
  tests/photo-editor-races.mjs → public/disc3d/halo.mjs
- `fitDistance()` --indirect_call--> `probe()`  [INFERRED]
  public/disc3d/viewer.mjs → tests/slider-drag-browser.mjs
- `createBag()` --calls--> `validateDiscDetails()`  [EXTRACTED]
  workers/bag.mjs → public/bag-values.js

## Import Cycles
- None detected.

## Communities (155 total, 36 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (80): activeLens(), addDestinationControl(), applyTheme(), atlasPriority(), bagColors(), brandColor(), brandList(), brandPalette (+72 more)

### Community 1 - "workers/auth.mjs"
Cohesion: 0.14
Nodes (23): jose, googleFetch, reply, worker, googleFixture(), base64url(), body(), cookie() (+15 more)

### Community 2 - "Bag scene"
Cohesion: 0.11
Nodes (8): accent(), BAG_SPRING, BagScene, div(), loadViewer(), POCKET, reduced(), stampStyle()

### Community 3 - "bag.js"
Cohesion: 0.10
Nodes (49): dynamic, GET(), GET(), DELETE(), photoBytes(), POST(), PUT(), save() (+41 more)

### Community 4 - "ref_node_child_process"
Cohesion: 0.04
Nodes (39): {chromium}, server, {chromium}, command(), errors, server, {chromium}, server (+31 more)

### Community 5 - "scripts"
Cohesion: 0.03
Nodes (59): scripts, build, build:workers, db:generate, deploy:workers, dev, install:ci, lint (+51 more)

### Community 6 - "disc-photo.mjs"
Cohesion: 0.11
Nodes (35): encodeHalo(), photoLook(), albedoCanvas(), bandRatio(), canvasBitmap(), canvasBlob(), checkPhotoSize(), createPhotoEditor() (+27 more)

### Community 7 - "sampling-audit-draw.mjs"
Cohesion: 0.05
Nodes (37): a, args, base(), brandCount, byId, cellPool(), cells, excludedIds (+29 more)

### Community 8 - "package.json"
Cohesion: 0.05
Nodes (40): name, packageManager, private, type, version, @base-ui/react, class-variance-authority, @cloudflare/vite-plugin (+32 more)

### Community 9 - "disc3d-popout-browser.mjs"
Cohesion: 0.07
Nodes (19): byName(), {chromium}, errors, server, settle(), show(), types, view() (+11 more)

### Community 10 - "dropdown-indicator-browser.mjs"
Cohesion: 0.17
Nodes (9): checks, {chromium}, command(), controls, errors, server, shots, THEMES (+1 more)

### Community 11 - "manufacturer-diff.py"
Cohesion: 0.10
Nodes (29): atomic_write(), base_name(), candidate_url(), clean(), compare(), config(), escape(), flights() (+21 more)

### Community 12 - "initAtlasMap"
Cohesion: 0.17
Nodes (21): animateZoom(), boundedCamera(), cameraMoving(), catchAtlasIntro(), changeZoom(), clearClusterTimers(), closeCluster(), initAtlasMap() (+13 more)

### Community 13 - "halo-plastic-browser.mjs"
Cohesion: 0.09
Nodes (24): chroma(), {chromium}, command(), dE(), dist(), hex(), lab(), metrics (+16 more)

### Community 14 - "my-bag.js"
Cohesion: 0.05
Nodes (43): addMenu, addMenuOpen(), bagColorMap, bagHaloMap, bagHaloModelMap, bagPhotoMap, bagRimColorMap, catalogs (+35 more)

### Community 15 - "atlas-map.js"
Cohesion: 0.09
Nodes (27): atlasPositions, CAMERA_AXES, cameraSpring, clusterPicks, discArt(), dropMarkerArt(), edgeFeedback, fullLabelFootprints (+19 more)

### Community 16 - "Shared 3D disc viewer"
Cohesion: 0.16
Nodes (31): angleDelta(), createDiscViewer(), applyMaterials(), applyPose(), attach(), build(), cancelRim(), dispose() (+23 more)

### Community 19 - "bag3d/viewer.mjs"
Cohesion: 0.07
Nodes (44): stageMode(), attachDiscFeatures(), createDiscState(), normalizeHex(), parseDiscParams(), validateSlot(), advanceTime(), poseAt() (+36 more)

### Community 20 - "mountRacks"
Cohesion: 0.22
Nodes (21): rackSlot(), rackX(), restHeight(), rowWidth(), mountRacks(), batchFor(), box(), drop() (+13 more)

### Community 21 - "verify-discraft-fraction-schema.py"
Cohesion: 0.13
Nodes (4): main(), slug(), tile(), Validator

### Community 22 - "overmold.mjs"
Cohesion: 0.38
Nodes (6): DEFAULT_DISC_COLOR, KEYS, LIST, overmoldColors(), parseColor(), toHex()

### Community 23 - "all-discs-gallery.js"
Cohesion: 0.18
Nodes (18): albumItems(), AllDiscsGallery, CLASSES, EMPTY, title(), bagClass(), bagComparator(), stabilityBiasLabel() (+10 more)

### Community 24 - "bag-values.js"
Cohesion: 0.10
Nodes (24): DEMO_BAG, DEMO_DISCS, discs, BAG_COLORS, bagPalette(), bagSlots(), DEFAULT_BAG_COLOR, defaultDiscDetails() (+16 more)

### Community 25 - "dependencies"
Cohesion: 0.08
Nodes (26): dependencies, @base-ui/react, class-variance-authority, clsx, cmdk, date-fns, drizzle-orm, embla-carousel-react (+18 more)

### Community 26 - "LostScene"
Cohesion: 0.19
Nodes (5): rackCount(), CollectionScene, esc(), LostScene, StorageScene

### Community 27 - "disc3d/viewer.mjs"
Cohesion: 0.11
Nodes (44): createAtlasArt(), dispose(), geometryOf(), get(), has(), render(), shapeOf(), touch() (+36 more)

### Community 28 - "Account and bag SQL schema"
Cohesion: 0.11
Nodes (19): auth_oauth_states, auth_oauth_states_expiry, auth_sessions, auth_sessions_expiry, auth_sessions_user, auth_users, atlas_coach_budget, atlas_coach_usage (+11 more)

### Community 29 - "scheduleMapDraw"
Cohesion: 0.22
Nodes (11): artZooming(), drawGaps(), gapName(), gapSprite(), gapTarget(), keepPinnedGaps(), levelHeld(), mapTargets() (+3 more)

### Community 30 - "halo.mjs"
Cohesion: 0.16
Nodes (13): build(), paint(), preview(), frontAt(), HALO_FEATHER, HALO_FORMAT, HALO_RING, HALO_STREAKS (+5 more)

### Community 31 - "lens-corner-browser.mjs"
Cohesion: 0.15
Nodes (9): checks, {chromium}, command(), errors, server, shots, THEMES, WIDTHS (+1 more)

### Community 32 - "collection-scenes.js"
Cohesion: 0.10
Nodes (28): RACK_STYLES, epitaph(), EPITAPHS, graveColumns(), hash(), lifespan(), MAX_LEAN, MAX_TURN (+20 more)

### Community 33 - "public.mjs"
Cohesion: 0.13
Nodes (15): delete(), database(), setup(), validateUpload(), chunk(), extended(), fixture(), createBag() (+7 more)

### Community 34 - "bag-layout.mjs"
Cohesion: 0.07
Nodes (43): assignSides(), BAG_BOX, bagLayout(), brickRows(), byKey(), clamp(), depthOrder(), DISC (+35 more)

### Community 35 - "disc-albedo.mjs"
Cohesion: 0.22
Nodes (23): bandColor(), bandDistance(), bandGroups(), bandModel(), bandRead(), basis(), compress(), delightPixels() (+15 more)

### Community 36 - "atlas-persist-browser.mjs"
Cohesion: 0.15
Nodes (13): checks, {chromium}, clickLands(), completeDot(), errors, mapOwned(), onMap(), READABLE() (+5 more)

### Community 37 - "devDependencies"
Cohesion: 0.10
Nodes (20): devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, drizzle-kit, eslint, eslint-config-next, playwright, react-server-dom-webpack (+12 more)

### Community 38 - "racks.mjs"
Cohesion: 0.10
Nodes (24): rackStyle(), clamp(), DEFAULT_RACK_COLOR, discPose(), easeInOut(), mix(), RESTAGE_MS, SLIDE_MS (+16 more)

### Community 39 - "halo-swirl.mjs"
Cohesion: 0.15
Nodes (22): ASYM_FEATHER, asymFront(), drawnFront(), [dye,wash,plate,ink], dyeShare(), enc(), fbm(), glared() (+14 more)

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
Cohesion: 0.08
Nodes (51): bagDiscGeometry(), HALO_PLASTICS, DEFAULT_RIM_COLOR, isOvermold(), OVERMOLD_DISCS, photoGeometry(), CLAY_TONES, esc() (+43 more)

### Community 44 - "personal-lens.mjs"
Cohesion: 0.17
Nodes (13): activateBag(), closeBagTips(), directory(), leaveBag(), positionBagTips(), setBagView(), syncMyMap(), undockDetail() (+5 more)

### Community 45 - "bag-interactions-browser.mjs"
Cohesion: 0.11
Nodes (11): checks, {chromium}, errors, GOTO, MAIN, metrics, PUTTERS, server (+3 more)

### Community 46 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, registries, rsc (+9 more)

### Community 47 - "Detail and pop-out viewer bridge"
Cohesion: 0.19
Nodes (12): clay(), closePopout(), load(), lockScroll(), openPopout(), popoutDialog(), requestClose(), resolveColor() (+4 more)

### Community 48 - "apple-design-2-browser.mjs"
Cohesion: 0.07
Nodes (18): NpmCacheProgress, runNpmInstall(), CACHE_SEEDS, holdInstallLocks(), InstallProgress, main(), openLock(), openReport() (+10 more)

### Community 49 - "api.cjs"
Cohesion: 0.12
Nodes (11): assert, {createRequire}, fs, {Miniflare}, req, root, assert, ctx (+3 more)

### Community 50 - "atlas-layout.js"
Cohesion: 0.16
Nodes (20): close(), components(), distanceTo(), extractPhotoStamp(), f(), gaussian(), hexToLab(), hysteresis() (+12 more)

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

### Community 55 - "display-harness.mjs"
Cohesion: 0.15
Nodes (14): scene, {chromium}, ink(), server, catalogDisc(), ready(), setTheme(), shot() (+6 more)

### Community 56 - "halo-band-v2.mjs"
Cohesion: 0.22
Nodes (11): FRONT_RING, dE(), delit(), disc(), enc(), L(), lab(), lin() (+3 more)

### Community 57 - "sites-env.sh"
Cohesion: 0.14
Nodes (13): HOME, MINIFLARE_REGISTRY_PATH, npm_config_audit, npm_config_cache, npm_config_fund, npm_config_update_notifier, sites-env.sh script, SITES_ENV_READY (+5 more)

### Community 58 - "atlas-depth.mjs"
Cohesion: 0.15
Nodes (9): boxes(), CHROME, discs, LEVELS, positions, prints, rooms(), runtime (+1 more)

### Community 59 - "bag-popup-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 60 - "bag-v13-browser.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, server, shots, themes, widths

### Community 61 - "vite.config.ts"
Cohesion: 0.18
Nodes (6): vinext, vite, readExecutionProfile(), cli, [command, ...args], localBindingConfig

### Community 62 - "ref_node_test"
Cohesion: 0.36
Nodes (6): HOLD_LIMIT, LOD_MARGIN, lodFor(), LODS, ORDER, walk()

### Community 63 - "stage.mjs"
Cohesion: 0.15
Nodes (20): ABOVE_GROUND, engraving(), stoneGeometries, STONES, stoneShape(), coarse(), contactShadow(), DISC_BUDGET (+12 more)

### Community 64 - "atlas-layout.mjs"
Cohesion: 0.19
Nodes (9): catalogBase, context, filters(), fixtures, random(), rated, score(), sizes (+1 more)

### Community 65 - "theme"
Cohesion: 0.05
Nodes (28): theme(), checks, {chromium}, command(), errors, perf, server, shots (+20 more)

### Community 66 - "state"
Cohesion: 0.05
Nodes (32): state(), command(), {chromium}, COLORS, command(), errors, MOLDS, PLASTICS (+24 more)

### Community 68 - "pathlib"
Cohesion: 0.12
Nodes (8): digest(), measure(), extract(), slug(), digest(), run(), slug(), extract()

### Community 69 - "atlas-speed-band.mjs"
Cohesion: 0.18
Nodes (9): base, CHROME, off(), prints, rated, runtime, SIZES, STATES (+1 more)

### Community 70 - "atlas-speed-band-browser.mjs"
Cohesion: 0.18
Nodes (10): CAMERAS, {chromium}, errors, failures, RENDERED(), server, settled(), show() (+2 more)

### Community 71 - "my-map-browser.mjs"
Cohesion: 0.18
Nodes (8): BAG, checks, {chromium}, command(), errors, metrics, server, shots

### Community 72 - "atlas-layout.js"
Cohesion: 0.26
Nodes (11): adapt(), adaptStrength(), bandSlope(), bounds(), camera(), fit(), inBand(), positions() (+3 more)

### Community 74 - "display-palette.mjs"
Cohesion: 0.23
Nodes (12): contrast(), distance(), lab(), linear(), luminance(), MATRICES, minDistance(), oklch() (+4 more)

### Community 76 - "bag-staging-browser.mjs"
Cohesion: 0.14
Nodes (10): bigDemo, checks, {chromium}, command(), demoSource, errors, EXTRA, metrics (+2 more)

### Community 77 - "slider-drag-browser.mjs"
Cohesion: 0.24
Nodes (10): assertRangeDrag(), checkRangeDefaults(), dragRange(), {chromium}, errors, probe(), results, server (+2 more)

### Community 78 - "mold"
Cohesion: 0.27
Nodes (21): pocketLabel(), api(), chooseRackStyle(), focusFirst(), foundDisc(), loadBag(), lostItems(), memorialWall() (+13 more)

### Community 79 - "ref_node_fs"
Cohesion: 0.08
Nodes (24): output, server, output, data, projectRoot, {chromium}, errors, report (+16 more)

### Community 80 - "photo-albedo.mjs"
Cohesion: 0.24
Nodes (11): SOFTEN_GLARE, ab(), enc(), lin(), luma(), lumAt(), photo(), enc() (+3 more)

### Community 81 - "bag-memorial-browser.mjs"
Cohesion: 0.15
Nodes (10): checks, {chromium}, command(), errors, GOTO, MAIN, metrics, PUTTERS (+2 more)

### Community 83 - "halo-band-sampling.mjs"
Cohesion: 0.22
Nodes (12): DYE, SEAM, dE(), disc(), enc(), isDye(), L(), lab() (+4 more)

### Community 84 - "atlas-organic.mjs"
Cohesion: 0.25
Nodes (12): assetOf(), broken, changed(), index, photoLooksKey(), photoStampBlob(), removePhotoStamp(), run() (+4 more)

### Community 85 - "buildClusters"
Cohesion: 0.31
Nodes (11): buildClusters(), cancelRegroup(), ensureGroupWorker(), hydrateGaps(), hydrateGroups(), measureChrome(), measureFullLabels(), organicAtlas() (+3 more)

### Community 86 - "palette.mjs"
Cohesion: 0.22
Nodes (8): {chromium}, contrast(), errors, full(), linear(), luminance(), matrices, report

### Community 87 - "discraft-fraction-audit-browser.mjs"
Cohesion: 0.06
Nodes (20): canvases, {chromium}, controls, mainFiles, oldData, overlay, pixelDifferences, results (+12 more)

### Community 88 - "mountGraveyard"
Cohesion: 0.27
Nodes (14): mountGraveyard(), dress(), hover(), idAt(), layout(), makePlot(), placeRing(), placeTags() (+6 more)

### Community 89 - "ref_node_assert"
Cohesion: 0.07
Nodes (10): read(), {chromium}, command(), errors, report, server, verifyPhotoDecode(), {chromium} (+2 more)

### Community 91 - "discraft-stamps-batch2-browser.mjs"
Cohesion: 0.05
Nodes (32): mold(), rated(), assignments, baseline, batch, {chromium}, controls, molds (+24 more)

### Community 92 - "ref_node_http"
Cohesion: 0.05
Nodes (29): checks, {chromium}, errors, server, types, checks, {chromium}, errors (+21 more)

### Community 93 - "apple-design-3-browser.mjs"
Cohesion: 0.17
Nodes (6): checks, {chromium}, errors, only, server, types

### Community 94 - "display-palette.js"
Cohesion: 0.42
Nodes (8): accentTokens(), classColor(), commit(), css(), get(), normalize(), paint(), toneOf()

### Community 95 - "draw"
Cohesion: 0.26
Nodes (12): artFrame(), draw(), drawSatelliteLeaders(), featuredDisc(), focusFeatured(), immersiveMap(), measureMap(), presentAtlas() (+4 more)

### Community 96 - "atlas-motion.js"
Cohesion: 0.32
Nodes (3): dismiss(), reveal(), slide()

### Community 97 - "coach.js"
Cohesion: 0.50
Nodes (7): allowance(), api(), append(), appendDraft(), open(), render(), reset()

### Community 98 - "bag-pockets-browser.mjs"
Cohesion: 0.22
Nodes (7): {chromium}, command(), errors, server, shots, themes, widths

### Community 99 - "install-pnpm.sh"
Cohesion: 0.39
Nodes (7): acquire_shared_lock(), can_write_directory(), release_shared_lock(), report_store(), install-pnpm.sh script, XDG_CACHE_HOME, XDG_DATA_HOME

### Community 102 - "atlas-organic.mjs"
Cohesion: 0.24
Nodes (6): curate(), field(), footprint, groups(), prints(), runtime

### Community 103 - "schema.ts"
Cohesion: 0.33
Nodes (4): bagItems, coachUsage, profiles, drizzle-orm

### Community 104 - "account.js"
Cohesion: 0.52
Nodes (5): api(), refresh(), renderPage(), signOut(), sync()

### Community 105 - "stage.mjs"
Cohesion: 0.17
Nodes (8): baseline, {chromium}, photos, profile, server, verifyLayout, verifyTextures, verifyTransitions

### Community 106 - "prompt-4-leftovers-browser.mjs"
Cohesion: 0.18
Nodes (5): pause(), pw, report, selectDisc(), server

### Community 107 - "personal-map-worker.mjs"
Cohesion: 0.18
Nodes (8): checks, {chromium}, command(), errors, metrics, server, shots, THEMES

### Community 108 - "next"
Cohesion: 0.33
Nodes (3): metadata, nextConfig, next

### Community 109 - "atlas-targets.js"
Cohesion: 0.53
Nodes (4): inBox(), pick(), reach(), reads()

### Community 110 - "atlas-3d-perf.mjs"
Cohesion: 0.43
Nodes (7): decide(), deviceReps(), DEVICES, FLIGHT(), main(), median(), parseReps()

### Community 111 - "workers/coach.mjs"
Cohesion: 0.31
Nodes (8): askCoach(), coachContext(), groundedReply(), headers, instructions(), json(), schema, usageCost()

### Community 112 - "install-ci.sh"
Cohesion: 0.40
Nodes (4): NPM_CONFIG_FETCH_RETRIES, NPM_CONFIG_FETCH_TIMEOUT, NPM_CONFIG_MAXSOCKETS, install-ci.sh script

### Community 113 - "bag-v12-browser.mjs"
Cohesion: 0.22
Nodes (7): {chromium}, command(), errors, server, shots, themes, widths

### Community 115 - "0000_powerful_pepper_potts.sql"
Cohesion: 0.50
Nodes (3): `bag_items`, `coach_usage`, `profiles`

### Community 116 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 119 - "overrides"
Cohesion: 0.67
Nodes (3): sharp, overrides, miniflare

### Community 140 - "disc-appearance-browser.mjs"
Cohesion: 0.25
Nodes (7): by(), catalog, {chromium}, examples, items, server, settings

### Community 142 - "compose-discraft-fraction-proofs.py"
Cohesion: 0.53
Nodes (4): compose(), disc_crop(), font(), percent()

### Community 143 - "shopping.js"
Cohesion: 0.70
Nodes (4): offers(), render(), row(), tracking()

### Community 144 - "render"
Cohesion: 0.20
Nodes (7): camera(), {chromium}, errors, pixelFailures, report, server, png()

### Community 146 - "more-packs-evidence.mjs"
Cohesion: 0.31
Nodes (5): openSheet(), packs(), region(), setTheme(), wait()

### Community 147 - "photo.mjs"
Cohesion: 0.39
Nodes (6): acquirePhoto(), cache, heightRows(), luminanceRows(), nextTask(), reliefTexture()

### Community 148 - "photo-level-measure.mjs"
Cohesion: 0.43
Nodes (4): angleOf(), luma(), renderedStampAngle(), stampAngle()

### Community 150 - "display-customization-browser.mjs"
Cohesion: 0.29
Nodes (3): agree(), CLASSIC, consumers()

### Community 151 - "bag-map-controls-browser.mjs"
Cohesion: 0.29
Nodes (8): comparisonMarkup(), comparisonPalette(), fadeOut(), photoMarkup(), renderCluster(), renderMarkers(), selectedGroup(), selected()

### Community 152 - "photo-stamp-assets-evidence.mjs"
Cohesion: 0.36
Nodes (7): bagShots(), cases, CHOSEN, frame(), results, viewerShots(), wait()

### Community 153 - "personal-map-worker.mjs"
Cohesion: 0.29
Nodes (4): ids, items, worker(), runtime

## Knowledge Gaps
- **52 isolated node(s):** `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react`, `class-variance-authority`, `clsx` (+47 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1191 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `jose` connect `workers/auth.mjs` to `package.json`, `public.mjs`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **What connects `@base-ui/react`, `@hookform/resolvers`, `@shadcn/react` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05962059620596206 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `workers/auth.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.13756613756613756 - nodes in this community are weakly interconnected._
- **Why does `inCollection()` connect `app.js` to `bag-memorial-browser.mjs`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `Bag scene` be split into smaller, more focused modules?**
  _Cohesion score 0.10699062233589088 - nodes in this community are weakly interconnected._