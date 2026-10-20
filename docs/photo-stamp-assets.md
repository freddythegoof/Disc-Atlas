# Photo stamps: a game-asset look for your own discs

October 20, 2026. Branch `claude/photo-stamp-assets`, own worktree, from freshly fetched `origin/main`
**`8e91dc7`** (the display customization merge, PR #33). Local only: no push, no merge, no deploy, until
Freddy rules on the verdicts below.

**Photos are never committed.** Freddy's originals, their exports, the framing numbers read off them and every
render made from them live in the ignored `work/photo-stamp-assets/` folder of this checkout. The branch carries
code, tests on drawn synthetic discs, and this write-up. The evidence links below point into that ignored folder:
they open in this checkout and nowhere else.

## The ask, in one line

Freddy's two photo discs (the Premier DD3 and the Destroyer) should be able to look like the Discraft atlas stamps:
the design pulled out of his photo as a clean, tintable stamp asset, drawn crisp on the 3D disc in his chosen stamp
ink and finish. The photo stays the default, and the asset look is a per-disc choice. The DD3 is the hard case.

## Verdicts (Freddy rules keep or kill per disc)

| Disc | Verdict | In one line |
| --- | --- | --- |
| **Destroyer** | **Asset-ready** | Every element of the stamp comes out clean and complete. At viewer size it reads crisper than today's photo render. |
| **DD3** | **Closer, not exact** | A real line-art game asset of the dragon, crystals, wordmarks and shield, in one ink. The print's colours, its halftone shading, and some of the face's finest line work do not carry over. |

The details are in [the Destroyer](#destroyer-asset-ready) and [the DD3](#dd3-closer-not-exact) below.

## Step 0: the sources

Freddy's camera-roll **originals** were on this Mac, so neither disc used the site's stored texture:

| Disc | Original | Matches the chat photo by | Export used |
| --- | --- | --- | --- |
| Destroyer | `~/Downloads/IMG_0788.DNG`, iPhone 16 Pro Max ProRAW, 3024 × 4032 | Capture time 2026-10-13 20:23:50, the same scene | JPEG q95, rotation baked in, no metadata (no GPS) |
| DD3 | `~/Downloads/IMG_0800.DNG`, ProRAW, 3024 × 4032 | Capture time 2026-10-13 23:37, the same scene | Same |

The chat attachments were 768 × 1024 downscales and were not used. Browsers cannot decode DNG, so each original was
rendered once by macOS's RAW engine into a full-resolution JPEG, as an iPhone share or export would hand the site.
Each disc was framed in the aligner by eye, as a player would: centre on the rim, scale to the edge. The Destroyer
runs off the right edge of its photo, so it uses the aligner's largest framing (scale 1.0), about 1% inside its true
rim.

**Freddy's sharpness worry is real, and it does live in the downscale.** The site stores a 1024 px crop, cut from a
working copy capped at 2048 px on the long side. On these photos, the disc spans about 2,960 px in the original and
about 1,450 px in that working copy. The extractor therefore reads the original at **2048 px**, about 1.4 times the
detail of the stored texture's source. On the DD3's face, the stored path's line work is coarser and fuses where the
original's separates ([1024 vs 2048](../work/photo-stamp-assets/evidence/resolution-dd3-1024-vs-2048.jpg)).

## What was built

### 1. Extraction (`public/disc-stamp-extract.mjs`)

Pure JS with no DOM, so the editor's worker and Node tests both run it. Every constant is disc-independent: no
per-disc knobs and no hand masks.

- **Input: the pre-softening albedo, as the spike's law requires.** The crop is de-lit with `delightPixels(…,
  {softenGlare:false})`. On these two photos the glare pass changed nothing (the masks are identical with it on and
  off), but extraction never reads the softened pixels.
- **The spike's core is kept:** distance from a smooth local plate field, hysteresis, and the speck, scuff and band
  rules.
- **New: weak foil beside the stamp.** A hologram mirrors the room, so where it reflects a colour close to the
  plastic it sits only a few ΔE away. The spike lost "YER", an "E", the dash and half of "DISC GOLF" on the Destroyer
  this way ([spike method on the real Destroyer](../work/photo-stamp-assets/evidence/spike-method-destroyer.jpg)).
  A weaker mark is now kept only beside strong design: letters of one stamp sit together, a stray scratch or smudge
  does not.
- **New: edges at half the local contrast.** The edge goes where a printed edge is, not at the low threshold. The
  weak pass's halo is trimmed back to the ink, counters stay open, and leftover slivers are dropped.
- **New: reflections.** A component that is lighter than the plastic, soft (mostly in its own fade) and away from the
  stamp is room light, not ink. This removed the window reflection at the DD3's right shoulder.
- **New: the asset is drawn, not photographed.** The output is clean binary layers anti-aliased by a sub-pixel blur:
  ink is solid inside, and sheen, wear mottle and halftone grain stay behind.
- **New: layered illustrations.** When a dark ink draws lines round lighter fills (most of the fills' edge meets the
  dark ink), the design goes out as three layers: lines, fills, and solid elements (a name or a logo, full ink either
  way). The stamp path then inks it the way round that keeps the real disc's light and dark:
  - An ink **lighter** than the plastic fills the design and leaves the line work in the plastic's colour, which is
    how the disc is printed (light fills, dark lines).
  - A **darker** ink draws the lines and tints the fills.

  Without this, one ink turns the DD3 into a silhouette ([spike method on the real DD3](../work/photo-stamp-assets/evidence/spike-method-dd3.jpg)).
  With the lines at full ink and a tint on the fills, a light ink reads as pale mush. The two ways round
  ([simulated on the DD3](../work/photo-stamp-assets/evidence/dd3-ink-modes-sim.jpg)) fix both.
- **Only the design transfers.** The asset holds no plastic or foil colour: white with the design in alpha (the stock
  format), or, for a layered design, the three layers as an opaque greyscale-per-channel image. A unit test checks
  that one stamp on teal, red and yellow plastic gives the same asset (IoU above 0.95).

### 2. Making one (the disc sheet)

A saved photo now has a **Look** row in its sheet, with two choices: **Photo** (the default) and **Game asset**.

- The first time, Game asset asks for the **original photo**. The site never kept it (it stores only the processed
  1024 px texture), and the extractor needs the full-resolution, pre-softening pixels.
- The original opens in the same aligner ("Frame the original", button "Make game asset"). The crop is read at
  2048 px from a working copy up to 4096 px, and extraction runs in a module worker (main-thread fallback).
- Measured in the final evidence run: 1.9 s for the Destroyer, 2.5 s for the DD3.
- After that, the row switches between Photo and Game asset at once, without Save, like Appearance does. "Make again
  from original photo" redoes the asset.

### 3. Where it is kept

Browser-local, following display customization's pattern. **No account storage, no migration, no server change.**

- A small index in `localStorage` (`disc-atlas-photo-stamps`) holds each disc's look and placement, and is read
  synchronously by every renderer.
- The asset bytes live in IndexedDB (database `disc-atlas-photo-stamps`). The stored assets here are 350 KB
  (Destroyer) and 1.64 MB (DD3, layered).
- **An asset belongs to one photo version** (the disc's texture key). Replacing the photo brings the photo look back
  by itself.
- An asset this browser can no longer read (cleared site data) also hands the disc back to its photo, everywhere, at
  once.
- What this means for Freddy: the asset look exists on the browser and device where it was made. Syncing across
  devices would need account storage (a stored asset plus a per-disc column), which is a migration and was
  deliberately not built.

### 4. Rendering: the existing stamp path, nothing parallel

An asset-look disc drops its photo and hands its asset and placement to the same `stampTexture`, `stampGeometry` and
`stampMaterial` the Discraft stamps use, with the player's ink and finish:

| Surface | What changed |
| --- | --- |
| Detail viewer (atlas or My Bag) | Stamp mesh instead of the photo; a 2048 px canvas (stock art keeps 512) |
| Gallery | Same viewer. Waits for the stamp, not the photo; passes the player's stamp style for asset-look discs only |
| 3D bag | Like a pulled stock disc: stamped when out, a bare plate in its pocket (1024 px) |
| Storage racks, graveyard | The disc model's stamp mesh (1024 px); the cache key follows the look |
| Personalized map stills | Drawn as a stamped disc from medium size up, as stock stamps are |
| Bag list thumbnails | The 2D overlay stock stamps use, in the ink colour |

The Standard map, catalog discs, other players' surfaces and the directory never see a photo URL, so they run
today's code exactly. Photo mode is byte-for-byte today's: the browser test compares the photo route's bytes and the
viewer's decoded photo pixels before and after a round trip through the asset look.

## The evidence

Each disc sheet compares, at the evidence run's 2× density:
- **Rows:** viewer 3/4, viewer Top, the bag with the disc pulled (desktop), and the same on a phone.
- **Columns:** today's photo render; the game asset in Auto ink, flat; the game asset in a chosen finish; the Discraft
  stock standard (a Buzzz in the bag, recoloured to the same plate); and the standard in the chosen finish.

The Buzzz column holds the same plate colour, ink rule and pose as the disc it stands beside.

- [Destroyer sheet](../work/photo-stamp-assets/evidence/sheet-destroyer.jpg) (chosen: silver rainbow, a holo foil like
  the real stamp)
- [DD3 sheet](../work/photo-stamp-assets/evidence/sheet-dd3.jpg) (chosen: silver shatter, like its crystals)
- [Viewer Top, photo vs asset, close up](../work/photo-stamp-assets/evidence/viewer-top-closeup.jpg)
- The stored assets: [Destroyer](../work/photo-stamp-assets/evidence/destroyer-asset.png),
  [DD3](../work/photo-stamp-assets/evidence/dd3-asset.png) (the DD3's is the three-layer encoding, not a picture)
- Other surfaces: [gallery](../work/photo-stamp-assets/evidence/gallery-asset.png),
  [bag list](../work/photo-stamp-assets/evidence/list-asset.png), map stills
  ([Destroyer](../work/photo-stamp-assets/evidence/destroyer-asset-mapstill.png),
  [DD3](../work/photo-stamp-assets/evidence/dd3-asset-mapstill.png))
- Every single render is beside them as a PNG, plus `results.json` (source, framing, plate, timings, placement).

Regenerate with `node tests/photo-stamp-assets-evidence.mjs` (the photos must be in
`work/photo-stamp-assets/photos/` with their `framing.json`), then `node work/photo-stamp-assets/lab/sheets.mjs`.

### Destroyer: asset-ready

- **Recovered cleanly:** the STAR outline letters, DESTROYER, the star and its ring, DISTANCE DRIVER, all four flight
  number boxes with their digits, the McBeth signature, "PAUL MCBETH-4X WORLD CHAMPION", INNOVA, DISC GOLF and the
  swoosh. It is one solid ink, as the real stamp is one foil. At viewer size it is crisper and more legible than
  today's photo render, which reads washed out on the model (as the spike also found).
- **Approximated:** two hologram letters, visible only zoomed in. The **Y** of DESTROYER and the **O** of GOLF come
  out broken, because the foil there happens to mirror the plastic's own colour along a seam
  ([extractor stages on YER](../work/photo-stamp-assets/evidence/destroyer-yer-seam-stages.png),
  [on GOLF](../work/photo-stamp-assets/evidence/destroyer-golf-stages.png)). Closing the seams was tried at radii
  1–3: it barely helps the Y and starts filling the flight-number digits, so it was not kept.
- **Not recoverable from one photo:** the hologram's rainbow. By the standing stamp law it becomes one ink, and the
  chosen foil finish brings a rainbow back as a material. A second photo at a different angle would be the only way
  to repair the two letters.
- **Worth knowing:** on this light teal, the existing Auto ink rule picks white, which is low contrast (the Buzzz
  standard beside it shows the same). A darker chosen ink, such as Black, reads better on this disc.

### DD3: closer, not exact

- **Recovered:** the dragon's line work (eyes, teeth, brow, crystals), the DD3 wordmark with its outline and grain,
  Q-LINE, PREMIER SERIES, 2025 WORLD CHAMPION, GANNON BUHR, the Discmania shield with its lettering knocked out, and
  the GB badge. It is a real line-art game asset, not a blob. In a light ink (Auto white on this red, or any foil)
  it reads like the printed disc: light design, dark lines.
- **Approximated:**
  - The print has three looks: the periwinkle face print, the shatter-foil crystals and the rainbow-gradient
    lettering. In one ink they become one fill, so the face and the crystals are told apart only by line work.
  - The face's halftone shading (fine hatching where the red plastic shows through the blue) is flattened into
    solid fill.
  - At viewer size, the eyes and teeth read weaker than in the photo.
- **Not recoverable:** the print's colours (by law), and line work finer than about two pixels at 2048. Some of the
  face's interior strokes fuse even from the original. A sharper, more head-on photo would help a little; it would
  not bring the colours back.
- **Where the old verdict stood:** the spike's "DD3 partial" came from a Thunderbird fixture standing in. On the real
  photo, the same method gives a silhouette. This build's layered extraction is what makes the DD3 an asset at all.

## Fences, as observed

- **Photos never committed.** `work/` is ignored; the branch's images are none. The test fixtures are drawn SVGs,
  rasterized at run time.
- **Own discs, personal contexts only.** Photo routes are owner-checked, and only an owner's photo URL can resolve
  to an asset. The Standard map test shows the catalog Destroyer untouched.
- **Photo mode is byte-for-byte available** and remains the default.
- **Score ordering, tiers, palette law and `public/data.json` are untouched.** No data pipeline change, no worker or
  schema change.
- **The browser-local choice follows display customization.** No account storage was needed, so the migration rule
  was never reached.

## Suites

Run from a separate worktree at the commit under test, Chromium with `--enable-gpu` (ANGLE on Metal).

Commits: `704fd7a` (the build) and `047ae2a` (a halo-sliver fix in the extractor, plus a stand-in for the new
import in a sandboxed unit test). The full set ran on `704fd7a`. Everything the follow-up touched ran again on
`047ae2a`: the extractor and photo unit tests, `photo-stamp-assets-browser`, and the evidence run.

| Suite | Result |
| --- | --- |
| `tests/disc-stamp-extract.mjs` (new, drawn synthetic discs: solid single ink, plastic independence, faint foil beside the stamp vs a lone faint mark, soft reflection, band, layered illustration and its three layers) | Pass, 6 |
| `tests/photo-stamp-assets-browser.mjs` (new, a synthetic photo through the real app: Look row rules, making the asset, viewer at 2048 px, ink and finish, pulled bag disc, gallery, map still, the Standard map untouched, photo look byte-for-byte, lost bytes and replaced photo fall back to the photo) | Pass |
| Unit: bag, disc3d, photo (`photo-albedo`, `photo-math`, `photo-textures`, `photo-editor-races`), `atlas-stamp-cache`, `display-palette`, `all-discs-order` | Pass. `photo-editor-races` runs `thumbnails.mjs` without its imports and needed a stand-in for the new one (`047ae2a`). |
| Viewer: `disc3d-browser`, `disc3d-popout-browser`, `disc-appearance-browser`, `display-customization-browser` | Pass |
| Stamps: `atlas-stamps-browser`, `stamp-scale-browser` | Pass |
| Bag: `bag-scene`, `bag-3d`, `bag-browser`, `bag-pulled-quality`, `bag-collections`, `bag-overmold`, `bag-staging`, `all-discs-browser` (gallery), `my-map-browser` | Pass |
| `bag-pulled-sizing-browser` | Failed once in the full run ("every disc has a label", 3 of 6), then passed twice on `origin/main` and twice on the branch. A flake, not this change. |
| Photo: `photo-textures-browser`, `photo-stamp-level-browser`, `photo-gestures-browser`, `photo-rim-color-browser`, `non-overmold-photo-edge-browser` | Pass |
| `photo-editor-contract-browser`, `photo-source-chooser-browser` | **Not run here:** both need Playwright's WebKit, which is not installed on this Mac. The contract suite's Chromium half passed before it reached WebKit. Owed on the PC, or after `npx playwright install webkit`. |
| `discraft-stamps-browser` | **Fails on `origin/main` too, identically.** Alone, both stop at the baseline swap (`./stamp.mjs` lacks `catalogStampAsset`). After `atlas-stamps`, main stopped at the 700 ms Buzzz-art check and the branch at the baseline swap; both failures are recorded for main in `docs/display-customization.md`. |

Not run: `tests/gallery-fixes-browser.mjs` (the Gallery performance gate). The gallery's change is one listener (it
redraws only when the disc on show has a photo) and one lazily imported module, but the gate was not measured. It
is owed before landing.

## Known limits and follow-ups (not built)

- **Bright reflections away from the stamp stay in the asset.** The reflection rule catches broad, dim room light
  (as on the DD3); a bright reflection with a hard core does not read as soft.
- **Only the browser that made the asset has it.** Production across devices needs account storage: a stored asset
  object and a per-disc look column. That is a migration, for a separate prompt.
- **The original is asked for again** because the site never kept it. A production version could read the asset at
  upload time, while the original is in hand.
- **All of Freddy's photo discs** are a separate prompt if he green-lights this. Full-front prints (the stripe
  Wraith) still need photo mode, as the spike found.
- **An unrelated bag bug, found while testing:** switching My Bag's view while a disc is pulled with its details
  open throws `Cannot read properties of null (reading 'left')` in `stageDiscs`. It reproduces on `origin/main`
  `8e91dc7` with no photo stamps involved. The browser test steps around it.

## Graphify

Refreshed on this Mac with `graphify update .` (AST only, 0.9.91 under uv in the session scratchpad), on the final
code, and committed with this write-up: 2,713 nodes, 5,722 edges, 151 communities. No `.env*` or `.dev.vars*` files
exist in the checkout. The ignored `work/` folder is not in the graph. Two communities were renamed by their hub
(Graphify's own deterministic step); no LLM labeling ran. Nothing is owed to the PC.
