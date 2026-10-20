# Display customization: curated mix-and-match

Branch `codex/display-customization`, based on `origin/main` at
`53d8d6eb182a9f495db62dbc5ac0b22df0d87c79` (the merge of PR #32, October 20, 2026).
Nothing is pushed, merged or deployed. Each part is its own commit and lands without the next.

Freddy's decision (October 15, 2026): personalization limited to curated palettes, so the colors
are never off. Mix-and-match from designed swatches, with preset packs as starting points. Stamp
appearance was added on October 16.

## Characterization (written before building)

### Where class color lives today

One set of tokens owns the four class colors: `public/cosmic.css` defines `--putter`, `--mid`,
`--fairway` and `--distance` on `:root` as references to the Okabe-Ito `--palette-*` hues. Each
theme block redefines the `--palette-*` hues, so the class colors adapt per theme without the class
tokens themselves changing. There is no second hand-copied table in JavaScript: the only class hex
literals outside `cosmic.css` are in test fixtures. (`style.css` still carries a dead, older class
set; `cosmic.css` loads after it and wins.)

How today's class colors adapt across themes (OKLCH):

| Class | Light | Midnight, Charcoal, Black |
| --- | --- | --- |
| Putter, reddish purple | `#bc719b` L .64 C .11 | `#cc79a7` L .68 C .12 |
| Midrange, bluish green | `#008c67` L .57 C .12 | `#009e73` L .62 C .13 |
| Fairway, blue | `#0072b2` L .53 C .13 | `#0072b2` unchanged |
| Distance, orange | `#ce8a00` L .69 C .15 | `#e6a139` L .76 C .14 |

The rule underneath: dark themes lift the warm, pink and green hues by about .04 to .07 L at
the same chroma, while the deep blue stays put. Every new swatch follows that rule (below).

### Every consumer of class color

All of them read the same four tokens, by one of two routes.

**CSS, directly**

- Atlas type chips (`stitch.css`) and the legend and type-list dots (`style.css`, `.putter` etc.).
- My Bag's class filter chips (`my-bag.css`, `.bag-type-out`).
- The atlas backdrop's faint fairway-tinted gradient (`cosmic.css`, `#map`, 3–4% `--fairway`).

**JavaScript, via `applyTheme()` in `public/app.js`**

`applyTheme()` reads the four tokens into the `colors` table on every theme change. `discColor(d)`
then picks, in order: the player's bag color for an owned disc on the personalized map, a brand
color when several brands are selected, else the class color. Everything below takes that value.

- Atlas markers: DOM curated markers (`--disc-color`), canvas smalls and minis (`atlas-map.js`).
- The Plan 16 top-down models: `disc3d/atlas-art.mjs` renders each marker's disc in its color.
- The 3D detail viewer for catalog discs: `Disc3D.sync(..., {color: discColor(d)})`.
- Flight route and flight sketch strokes in the detail panel.
- Directory row thumbnails: `DiscThumbnails.markup(d, colors[typeOf(d)])`, rendered through the
  same atlas-art cache. These bake the color into the row at render time.

**Not a class-color consumer, though it looks like one**

- **The bag's discs (plates, pulled discs, the 2D list, storage racks, the graveyard, the gallery).**
  They wear each disc's own stored color. `bag_discs.color` is `NOT NULL`: every bag disc has a
  physical color, set from its plastic's reference color when added or picked by hand, so there is
  no case today where class color sits beneath a bag disc. The guardrail "per-disc explicit colors
  still win" therefore covers the whole bag: class colors change the bag's class chips, its My Map
  for non-bag context, and the atlas around it, never a disc in it. The database does not record
  whether a color was the plastic default or picked by hand, so treating plastic defaults as
  "uncolored" would need a migration and would repaint discs players already see. Not done.
- My Map shows only bagged discs, all in their bag colors.
- The About hero's clay disc reads `--distance` on the About page. It is a brand illustration on an
  information page, the information pages do not load the palette, and it stays as it is.

### Everywhere the bag's green accent appears

The accent is the Stitch lime family, defined per theme in `stitch.css`: `--lime` (accent ink and
focus), `--accent-soft` (tints), `--accent-fill` and `--accent-ink` (filled buttons),
`--accent-edge` (selected borders), `--accent-glow` (the soft glow under filled buttons) and, in
Light, a lime-tinted `--selected`. `dropdown-indicator.css` keeps its own copy (`--dd-accent`,
`--dd-glow`, `--dd-tint`). `brand/site.css` has the logo's `--da-accent`, which is brand, not accent.

Inside My Bag it shows as: the Add discs button and its glow, the slot meter's progress bar, the
selected list picker and class chips, the sort dropdown's open state, focus rings, the floor glow
under the 3D bag (`.bag-scene-glow`, `--accent-soft`), drop-target highlights, the rack and
collection controls, and in the 3D scene the dashed go-to outline (the GLB's "GoTo highlight"
material, colored from `--lime` by `bag-scene.js`). The 3D hover glow is not the accent: a hovered
disc lights up in its own color.

**What the accent setting covers:** every accent token above, scoped to My Bag (`#myBagView`,
including the docked My Map) and the bag's own sheets and menus (add or edit disc, bag settings,
lost disc, remove disc, rack style), plus the 3D go-to outline.

**What it does not cover:** the site header and navigation, the atlas, the directory, the site
menu, the coach, the logo's brand lime and the Stitch page backdrop. Those carry the Disc Atlas
identity. Semantic colors are not the accent either: success and error states, wear warnings, the
compare vermillion and the stability colors stay as they are.

### How the theme persists, and where its controls live

The theme is a per-browser setting: `public/theme.js` stores it in `localStorage` under
`disc-atlas-theme`, applies it before first paint, and leaves it unsaved while following the system.
No account storage is involved. The "Default map" choice follows the same local pattern
(`atlas-default-map`). The controls are the Theme radios in the site menu on the atlas, and a
select on the information pages.

So customization follows the same pattern: one `localStorage` key (`disc-atlas-display`), applied
before first paint by a script that runs right after `theme.js`. **No server migration is needed**,
and none is proposed. Its home is an Appearance sheet opened from the site menu, directly under the
Theme radios; the sheet carries the theme choice too, so Appearance is one place.

A per-disc stamp finish (one Buzzz in gold foil, the rest flat) would need account storage, so it
is deliberately not built. If wanted later, the proposed shape is two nullable columns on
`bag_discs`, `stamp_ink TEXT` and `stamp_finish TEXT`, each checked against the curated ids, with
NULL meaning "use the display setting". Not applied anywhere.

### What the stamp layer can express today

`disc3d/stamp.mjs` draws every stamp as a 512 px canvas texture on a thin dome-following ring mesh
with a `MeshStandardMaterial` (roughness .5, metalness .15, transparent). The ink is one color,
chosen automatically: near-black at 72% on a light plate, white at 78% on a dark one. Official stock
art (the reviewed Discraft set) contributes only its alpha, recolored with the same ink, so the
design can never change. Generated stamps are the ring-and-name design.

Who draws stamps:

| Surface | Stamps drawn | Lighting |
| --- | --- | --- |
| 3D detail viewer (atlas and bag) | Stock and generated | Key, fill, hemisphere, RoomEnvironment reflections |
| 3D bag | Stock stamps on a pulled disc only | RoomEnvironment, key lights |
| Storage racks and graveyard | Stock and generated | RoomEnvironment at .75 |
| Atlas markers and list thumbnails | Stock stamps only, from medium size up | One still, top-down render, environment at .12 |

The vendored three.js is r180, which has `MeshPhysicalMaterial` with real thin-film iridescence,
clearcoat and per-pixel roughness and metalness maps. With the environment maps already in the
viewer, bag and storage scenes, that is enough for:

- **Real:** metallic foil (full metalness, low roughness, the swatch as the metal's tint), so it
  reflects the room and brightens and darkens as the disc turns; rainbow holographic foil
  (iridescence over a bright metal), whose hue shifts with viewing angle; patterned foils, where a
  procedural map varies roughness and iridescence thickness inside the ink, so facets catch the
  light differently. All of these respond to light in the viewer, the bag and storage.
- **Fake, or rather frozen:** on atlas markers and list thumbnails the stamp is a single still
  render from straight above with little environment. A foil there reads as a tinted, slightly
  bright ink with one baked highlight. It is not light-reactive, and the write-up says so.
- **Not possible:** a stamp on a photo disc. The photo is the truth and its stamp is baked in.

## Part 3 theme proposal (before building)

- **Paper** — a warm off-white light theme with ink-brown text, for daylight reading without the
  cool glare of Light.
- **Dusk** — a warm dark theme, umber and soft charcoal rather than Midnight's blue, for the last
  light after a round.

Both are built only from the existing tokens. Paper takes the light swatch values and Dusk the dark
ones.
