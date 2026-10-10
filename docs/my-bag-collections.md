# My Bag: Storage racks and the Lost graveyard

My Bag has four views: **Bag**, **My Map**, **Storage** and **Lost**. Storage and Lost are new, and they show the discs the account already keeps. Storage discs are `in_bag=false` and `status='active'`. Lost discs are `status='lost'`, with the memorial fields from `0007_lost_discs.sql`. There is no migration and no new API: every action uses the existing `PATCH`/`DELETE /api/bag/discs/:id`.

Below each view there is **one list at a time**. The picker (`#bagListPicker`: Bag / Storage / Lost, each with its count) swaps which list shows, and the other two sections stay in the DOM, hidden. Switching the view sets the picker to match. Switching the picker leaves the scene alone, so you can look at the racks while working through the Bag list. My Map has no list. The demo (signed out) keeps only the Bag view and offers Bag and Storage in the picker.

## Storage: racks

- **Model.** `public/collection3d/wooden-disc-rack.glb` is Freddy's rack from Astra (copied unchanged from `Documents/Codex/2026-10-10/so-x20/outputs/disc-rack/`). Units are real-world metres: 96 × 108 × 33 cm, with 72 slots.
  - Its 72 placeholder discs are dropped at load. Their `DiscSlot` nodes supply the slot positions.
  - The boards merge into one mesh per material (wood, screws, feet), so each rack is 3 draw calls. The wood keeps its grain and the default `#d4bb86` tint.
  - The rack-colour API from the source viewer was not carried over.
- **Discs.** Each disc is its own mold's lathe from `disc3d/shape.mjs` (PDGA dimensions, centimetres, scaled to metres), with overmold rims in two colours (`disc3d/overmold.mjs` plus the copy's `rim_color`).
  - Every disc stands on its shelf by its own radius.
  - Discs are drawn as instances: one draw call per mold shape, plus one for each overmold rim.
- **Budget.** The detail viewer spends 56/80 radial segments and about 70 profile points on one disc. A rack disc spans a few dozen pixels, so it gets 28 radial segments × 0.4 detail on touch screens, 40 × 0.5 on desktop, and 20 × 0.3 on software WebGL. That is about 1.1k triangles per disc on a phone.
- **Shared limits.** Canvas pixels are capped at 2.4 MP, the bag's cap. The scene draws only when something moves. Shadows redraw only when a disc moves, not on a camera turn. Software WebGL drops antialiasing and shadows.
- **Growth.** The rack count is `ceil(stored / 72)` and never below 1 (`rack-layout.mjs`). Racks stand side by side. With more than one rack, rack chips frame a single rack or the whole row. There is no limit.
- **Order.** Drivers fill the top shelf and putters the bottom: by class first, then the bag's sort inside each class. The Storage list uses the same order.
- **Interaction.** Gestures match the bag: drag sideways to turn, a vertical swipe scrolls the page, pinch or Ctrl/⌘ + scroll zooms, and a zoomed view drags to pan. The keyboard turns the scene with the arrow keys and zooms with + and −.
  - Tapping a disc runs the source rack's motion (`rack-motion.mjs`, the bag's 945 ms timing): the disc lifts, clears the front rail and turns face out with its generic name stamp.
  - Its card offers Move to bag, Details, Remove and Put back.
  - A Storage list name pulls its disc out too.

## Lost: the graveyard

- **Scene.** A small lawn holds one headstone per lost disc, newest at the front. Each stone is engraved with HERE LIES, the name, the dates (added to the collection to the day it was lost), the hole and course, and an epitaph. The disc rests on the mound in front, in its colour and mold shape.
  - The selected plot gets an accent ring.
  - A new loss rises out of the lawn.
  - On Found it!, the disc floats away and the stone sinks.
- **Epitaphs.** These are in `graveyard-layout.mjs` and are funny but kind. They are seeded by the disc id, so each disc keeps its own. The story text alone picks water or tree lines, so a course called "Maple Hill" doesn't count. Otherwise the disc class picks the pool.
- **Card.** The card under the canvas carries the full memorial (story included) and **Found it!**, which is the existing restore: `status:'active'` puts the disc back in the bag. The Lost list's memorial cards keep Found it! and Remove.
- **Keyboard.** The headstones are one tab stop over the canvas, and the arrow keys move between them. Pointers go to the canvas, so a drag always turns the scene.
- **Empty.** With no lost discs, nothing 3D loads. The page shows a friendly ghost and "No ghosts here yet."

## Loading and code

- `collection-scenes.js` holds the DOM glue: the cards, the hover name, zoom and the keyboard.
- `collection3d/stage.mjs` holds one shared WebGL renderer for both scenes, the camera rig and the per-mold disc geometry cache.
- `racks.mjs` and `graveyard.mjs` are the two scenes. Each loads (three.js modules plus the 0.8 MB GLB) only when its tab first shows.
- The Bag view never loads them, and the bag itself no longer loads behind the Storage or Lost views.
- `disc3d/stamp.mjs` is the name stamp, moved out of `disc3d/viewer.mjs` so that the racks share it.

## Tests

- `npm run test:bag` now includes `tests/collection-layout.mjs`, which covers rack growth, slots, ordering, plots, epitaphs and dates.
- `npm run test:bag:collections` runs the browser suite on port 8824, with GPU flags and output to `outputs/bag-collections/`. It covers:
  - the picker
  - an empty rack
  - 80 stored discs making 2 racks, and removing back down to 72 making 1 rack, live through the UI
  - rack card actions
  - bag ↔ storage with every count checked
  - a loss producing a headstone with its story, then Found it! from the card and from the list
  - the empty graveyard
  - a phone pass: lazy loading, the touch budget, draw calls, triangles, frame times, overflow, and a 360 px layout
