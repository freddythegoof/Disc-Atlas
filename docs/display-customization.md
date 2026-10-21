# Display customization: curated mix-and-match

Branch `codex/display-customization`, based on `origin/main` at
`53d8d6eb182a9f495db62dbc5ac0b22df0d87c79` (the merge of PR #32, October 20, 2026).
Nothing is pushed, merged or deployed. Each part is its own commit and lands without the next.

Freddy's decision (October 15, 2026): personalization limited to curated palettes, so the colors
are never off. Mix-and-match from designed swatches, with preset packs as starting points. Stamp
appearance was added on October 16.

## What landed

| Commit | Part | Lands alone? |
| --- | --- | --- |
| `479bde3` | Characterization (this document's first section) and the shared test harness | Yes |
| `4fbed93` | Part 1: class colors and the bag accent, mix-and-match | Yes |
| `7741f3a` | Part 2: preset packs | Needs Part 1 |
| `7086eed`, `6105e8c` | Stamp appearance: ink and foil finishes on your own discs | Needs Part 1 |
| `f616c68`, `d29d4e5` | Part 3: two new themes, Paper and Dusk | Needs Part 1; droppable |

Freddy's feel check works as asked: open Appearance from the site menu, tap a pack, swap one class
color, and the atlas, the bag's class chips and the viewer agree at once, while the bag's glow,
buttons and 3D outline wear the accent. The bag's own discs keep their own colors; see below.

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

> **Superseded for the top bar (October 20, 2026).** Freddy's later ruling the same day brings the
> site header, its navigation and the site menu under the accent too. The logo, the atlas, the
> directory and the page backdrop are unchanged. See `docs/accent-follows-appearance.md`.

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

## Part 1: class colors and the bag accent

**One source of truth.** `public/display-palette.js` holds every curated swatch and runs before first
paint, right after `theme.js`. It writes one `<style id="display-palette">` with the four class tokens
per theme and the accent family scoped to the bag. The 2D surfaces read those tokens directly. The
WebGL surfaces read them back through `applyTheme()`, which runs again on every palette change, so
the atlas markers, the Plan 16 models, the viewer, the directory rows and the legend all take the
same values. There is no second hand-copied table. Untouched, the module writes nothing at all, so
signed-out visitors and untouched accounts see exactly the 06C set and today's lime.

**Swatch design.** Eight swatches per class row, nine accents. Each class row keeps to its own hue
sector (drivers warm, fairways blue, midranges green, putters purple and pink) at 06C's lightness and
chroma: light values at OKLCH L .44–.76 and C .05–.20, dark values lifted by up to .06 L at the same
chroma, deep blues by .03, exactly as today's set adapts. Classic leads each row and is today's value
to the digit. Because the sectors do not overlap, every one of the 4,096 combinations keeps its four
classes at least 0.076 apart in OKLab under normal vision, in light and dark. That is above the 06C
floor of 0.065, and a test checks every combination. Accent swatches carry a whole token family per
tone (ink, fill, tint, edge, glow, the dropdown's copies). Light-theme accent ink is at least 6.4:1 on
white, and button ink on its fill at least 10:1.

| Row | Swatches |
| --- | --- |
| Driver | Orange (Classic), Ember, Brick, Tangerine, Marigold, Coral, Sand, Rust |
| Fairway | Blue (Classic), Sky, Cobalt, Ocean, Glacier, Navy, Steel, Cornflower |
| Midrange | Bluish green (Classic), Leaf, Moss, Jade, Teal, Pine, Sage, Lime |
| Putter | Reddish purple (Classic), Plum, Violet, Lavender, Orchid, Raspberry, Mauve, Magenta |
| Bag accent | Lime (today), Mint, Aqua, Sky, Violet, Pink, Coral, Gold, Silver |

**Controls.** Appearance sits in the site menu directly under the theme radios. The sheet holds the
theme too, so it is the one Appearance home. It has a live preview (one disc per class, and a slice
of the bag wearing the accent: its glow, Add discs button, meter, a selected chip and the dashed go-to
outline), one swatch row per class, one for the accent, and Reset to defaults. Tapping a swatch
applies and saves it at once, like the theme radios. Rows are radio groups with arrow-key movement.
There is no text input, no picker and no hex anywhere.

**Persistence.** `localStorage` key `disc-atlas-display`, beside `disc-atlas-theme`, removed again
when everything is back at the defaults. No account storage and no migration. A choice is per
browser, as the theme is.

## Part 2: preset packs

| Pack | Driver | Fairway | Midrange | Putter | Accent | Colorblind-safe |
| --- | --- | --- | --- | --- | --- | --- |
| Classic | Orange | Blue | Bluish green | Reddish purple | Lime | Yes, 0.076 |
| Harbor | Coral | Navy | Teal | Lavender | Aqua | Yes, 0.077 |
| Sunset | Marigold | Cobalt | Jade | Raspberry | Coral | Yes, 0.100 |
| Field | Rust | Steel | Moss | Mauve | Gold | No, 0.012 |
| Floodlight | Ember | Glacier | Lime | Violet | Violet | Yes, 0.131 |

The number is the closest pair of class colors under full-severity protanopia or deuteranopia, OKLab,
across light and dark. A pack carries the label only if it clears 06C's 0.065 floor, and a test holds
the label to the floor in both directions. Field is a deliberately muted, earthy pack; it does not
clear the floor, so it is offered without the label. One tap sets all four classes and the accent.
Any swatch can be changed after, and the sheet then says "Your mix". Packs never touch stamps.

## Stamp appearance

**What it covers.** The player's own discs in personal contexts: the viewer for a disc in their bag
(on the personalized map or opened from My Bag), the bag's pulled stock discs, storage racks and the
graveyard, their discs' marker art on the personalized map, and the bag list's thumbnails. Official
stock stamps (recolor your own Buzzz's ink) and generated stamps both take it.

**What keeps the official stamp.** The Standard map, every catalog disc the player does not own, the
directory, and photo discs (the photo's stamp is in the photo). Neutral surfaces pass no style at
all, so they run exactly today's code path.

**Ink.** Eleven curated inks: Auto (today's near-black or white by the plastic), Black, White, Gold,
Silver, Copper, Red, Blue, Green, Violet, Pink. Official art still contributes only its alpha, so the
design never changes.

**Finishes, honestly.**

| Finish | What it is | Viewer, bag, storage | Atlas markers | Bag list thumbnails |
| --- | --- | --- | --- | --- |
| Flat ink | Today's material | Real | Real | Real |
| Foil | Full metal tinted by the ink, satin polish | Real: reflects the room, brightens and darkens as the disc turns | Frozen: one still from above, lit once | Ink color only |
| Rainbow foil | Foil plus thin-film iridescence with a smooth film-thickness sweep | Real: colors run in bands that slide with the view | Frozen | Ink color only |
| Shatter foil | Iridescent foil whose film thickness and sheen vary by shard (seeded cracked-ice map) | Real: each shard catches light on its own | Frozen | Ink color only |
| Spin foil | Iridescent foil in a pinwheel of film bands | Real | Frozen | Ink color only |

"Real" means three.js r180's `MeshPhysicalMaterial` (metalness, roughness and iridescence maps)
responding to the scene's own lights and environment. Each scene hands the stamp its environment so
one foil reads the same in the viewer, the bag and storage, whose rooms are lit at different
strengths. A flat thumbnail cannot reflect anything, so it shows the ink and does not imitate foil.
Finishes change only the stamp's light response, never the design or the plastic.

The Appearance sheet has a Stamps section with ink and finish rows and a live 3D preview: a Buzzz built
from the viewer's own pieces, rocking slowly so a foil can be seen catching the light. It holds still
under reduced motion and draws only while the sheet is open.

Per-disc stamp finishes would need account storage and are not built; the proposed shape is in the
characterization above.

## Part 3: Paper and Dusk

Both are built only from the existing tokens. Paper is a warm off-white light theme with ink-brown
text; Dusk is a warm umber dark theme. `theme.js` now owns the list of themes with each one's tone
and browser chrome color, and sets `data-tone` on the root before first paint. The light-or-dark
rules that used to list theme names now key off the tone, so Paper is never treated as dark: dark
menus and sheets in My Bag, the dropdown indicator, the logo accent, the page backdrop, the About
hero and the theme toggle's icon. The three JS light checks (map shadows, and the overmold rim
default in the atlas art and the viewer) ask the tone too. Storage racks have warm finishes for both,
and both have brand exports, which back the favicon swap. Every theme menu lists six themes.

Verified in both themes, desktop and phone: the atlas with 3D marker art, the directory, the viewer
and clay, My Bag with the 3D bag, My Map, Storage, the Gallery, Lost, the Appearance sheet, About,
Privacy, Terms and Account settings, and a mid-cross-fade frame. The 06C colorblind test now runs in
all six themes. Part 3 is droppable: reverting `d29d4e5` and `f616c68` removes it.

The JS checks ask `theme.js` for the tone of the current theme name at the moment they run, and a
MutationObserver keeps `data-tone` following `data-theme`. That matters because `app.js` and several
suites set `data-theme` directly; the first version read a stale `data-tone` there and failed the
pop-out, compare and appearance suites, which `d29d4e5` fixed.

## Proof

Suites ran in a separate worktree, so the code under test could not change mid-run: the Part 1 set
on `4fbed93`, a wider set on the stamp commit `7086eed`, a full run on `5dfc312`, and the
theme-sensitive set again on the final `d29d4e5`. On a Mac, Chromium is launched with `--enable-gpu`
(ANGLE on Metal), as the gallery gate is.

| Suite | Result |
| --- | --- |
| `tests/display-palette.mjs` (new: catalog, discipline, all combinations, packs, stamps, persistence, theme tones) | Pass, 16 tests |
| `tests/display-customization-browser.mjs` (new: the sheet, every consumer agreeing, accent scope, persistence before paint, keyboard, reset, packs, stamps in personal and neutral contexts) | Pass |
| `tests/palette.mjs`, extended: the default and each labeled pack, rendered tokens, six themes | Pass (minimum 0.076) |
| Bag and disc3d unit suites, `tests/brand-assets.mjs` | Pass |
| Viewer: `disc3d-browser`, `disc3d-popout-browser`, `compare-viewer-polish-browser`, `disc-appearance-browser` | Pass on `d29d4e5` |
| Bag: `bag-scene`, `bag-3d`, `bag-browser`, `bag-pulled-quality`, `bag-pulled-sizing`, `bag-popup`, `bag-collections`, `bag-overmold`, `bag-memorial`, `bag-demo`, `bag-spin-pocket`, `bag-staging`, `my-map` | Pass |
| Atlas and photos: `atlas-3d-browser`, `atlas-organic`, `atlas-stamp-cache` with `atlas-stamps-browser`, `photo-textures`, `all-discs` | Pass |
| Theme and chrome: `apple-design-browser`, `apple-design-3-browser`, `brand-browser`, `dropdown-indicator-browser` | Pass |
| `tests/discraft-stamps-browser.mjs` | **Fails on `origin/main` too.** Run alone, both main and the branch fail at the same later step: its baseline swap loads an old `stamp.mjs` that lacks `catalogStampAsset`. Run right after the atlas-stamps suite, both main and the branch fail sooner, at a 700 ms check that the official Buzzz art has replaced the generated stamp. |

Two one-off failures did not reproduce: `bag-staging` failed once on `5dfc312` (a disc measured just
outside the canvas) and then passed three times, and `tests/atlas-stamp-cache.mjs` failed on
`7086eed` because a helper sat outside the block the test runs, fixed in `6105e8c`.

`tests/palette.mjs` needed two repairs that are not about this work: Black's map background is the
short hex `#000`, which its parser could not read, and its last step waited for DOM dot markers that
the organic atlas (October 19) now draws on canvas. That step now checks DOM dots only where they
render, and main's copy times out at the same step against the same site.

Screenshots, all from `tests/display-customization-evidence.mjs`, signed in with a seeded bag. In
each row: the personalized atlas, My Bag, and the viewer on a Wraith that is not in the bag.

**(a) Defaults**

![Defaults, Light](images/display-customization/palette-defaults-light.jpg)
![Defaults, Midnight](images/display-customization/palette-defaults-midnight.jpg)

**(b) A hand-mixed combination: Tangerine, Navy, Leaf, Orchid, Pink accent**

![Mixed, Light](images/display-customization/palette-mixed-light.jpg)
![Mixed, Midnight](images/display-customization/palette-mixed-midnight.jpg)

**(c) Each pack** (Classic is the defaults above)

![Harbor, Light](images/display-customization/palette-harbor-light.jpg)
![Harbor, Midnight](images/display-customization/palette-harbor-midnight.jpg)
![Sunset, Light](images/display-customization/palette-sunset-light.jpg)
![Sunset, Midnight](images/display-customization/palette-sunset-midnight.jpg)
![Field, Light](images/display-customization/palette-field-light.jpg)
![Field, Midnight](images/display-customization/palette-field-midnight.jpg)
![Floodlight, Light](images/display-customization/palette-floodlight-light.jpg)
![Floodlight, Midnight](images/display-customization/palette-floodlight-midnight.jpg)

**The Appearance sheet**

![Sheet, Light](images/display-customization/sheet-light-1440.jpg)
![Sheet, Midnight](images/display-customization/sheet-midnight-1440.jpg)
![Sheet, phone](images/display-customization/sheet-midnight-390.jpg)

**Stamps**

![Neutral and personal](images/display-customization/stamps-neutral-personal.jpg)
![Viewer finishes 1](images/display-customization/stamps-viewer-1.jpg)
![Viewer finishes 2](images/display-customization/stamps-viewer-2.jpg)
![Viewer finishes 3](images/display-customization/stamps-viewer-3.jpg)
![In the bag](images/display-customization/stamps-bag.jpg)
![Map stills](images/display-customization/stamps-map-stills.jpg)

**Paper and Dusk**

![Paper app](images/display-customization/theme-paper-app.jpg)
![Paper detail](images/display-customization/theme-paper-detail.jpg)
![Paper pages](images/display-customization/theme-paper-pages.jpg)
![Dusk app](images/display-customization/theme-dusk-app.jpg)
![Dusk detail](images/display-customization/theme-dusk-detail.jpg)
![Dusk pages](images/display-customization/theme-dusk-pages.jpg)

## Summary for the record

- **Consumer map:** every class-color consumer reads the four tokens, through CSS or `applyTheme()`;
  see the characterization. Bag discs are not consumers: they wear their own stored colors.
- **What the accent covers:** My Bag (with its docked My Map), the bag's sheets and menus, and the 3D
  go-to outline. Not the header, atlas, directory, site menu, coach, logo or semantic colors.
- **Where the settings persist:** `localStorage` key `disc-atlas-display`, per browser, beside the
  theme's key. No account storage, no migration.

**Deliberately left undone**

- Repainting bag discs with class colors. Every bag disc stores a physical color, and the data cannot
  tell a plastic default from a hand pick without a migration.
- Per-disc stamp finishes, which would need account storage (proposed shape above; not applied).
- Foil on flat thumbnails. They show the ink color only rather than imitate a reflection.
- The accent beyond My Bag. Widening it is a one-line change to the scope list if Freddy wants it.
- The About hero's clay disc, which stays a brand illustration on an information page.
- Syncing choices across devices, sharing, importing or exporting palettes (out of scope).
- `public/data.json` and every flight number are untouched.
