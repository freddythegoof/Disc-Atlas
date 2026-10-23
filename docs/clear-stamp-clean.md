# Clear stamp cleanliness: print only, nothing of the plastic

Branch `claude/clear-stamp-clean`, off `origin/main` 9990681 (clear plastics, PR #44). Pushed Oct 23, 2026 as PR #45; not merged or deployed.

**Freddy's report** (Oct 23, 2026, the live blue Raptor on Clear with its game asset): the clear disc looks right, the
stamp does not. Around and behind the stamp the plate shows *a different shade, a whiter, greyer blue* that is not
print. His bar: **where there's no stamp, there must be nothing.**

The test case is the one pinned for clear plastics: the Raptor's stored photo (`0cef6b2f-….webp`, sha256 `0625424b…`),
read from the ignored `work/` folder of this checkout and never committed. Every render here goes through the real
product: the local signed-in harness, the photo uploaded as stored, Game asset made with one click on a Clear copy.

## What was proven

Two mechanisms, one per way a Raptor on Clear can come to wear its asset. Production was not read (it isn't reachable
from here), so **which one Freddy's live asset shows is not known**.

### 1. An asset made in clean mode still paints the plastic: mask residue (fixed here)

The clean pass (`unshadow`) takes the shadow out: its edges are as clean on the side facing the shadow as on the side
facing away (8.9% vs 8.7% of edge pixels plate-blue), so no shadow rides along. **What does ride along is the plastic
itself.** The extraction keeps, as design, pixels that are only the plate seen in the photo's light, and the colour
asset paints each one opaque over the clear plate:

| What | Where on the Raptor | Colour in the asset |
|---|---|---|
| The glare band's scratches, catching the light | the streak beside PAIGE PIERCE | a pale blue ink of its own, L 64 (plate 51): 2.2% of the design |
| Glare between the double rings | top right | the same pale blue |
| Glare patches filled from the plastic around them | inside the streak | pale blue, or the nearest foil's red once the blue goes |
| Scuffs and stroke tails half there | specks | plate blue a little darker than the plate |

22,439 of the asset's pixels are the plate's own blue (at 2048 px), 20,871 of them at partial alpha. On an opaque disc
they are the plate's colour and vanish; on clear plastic they are the photo's plate laid over the real one, lighter
than the filtered plate on Midnight, a shade off on Paper: **the whiter, greyer patches**. The same counts come out of
the extraction in Node, in Chromium and in WebKit (23,195 / 23,194 in the two browsers), so it is not one engine.

### 2. An asset made while the copy was Opaque carries the shadow: shading residue (not changed here)

Game asset made on Opaque (no clean pass) and the copy then set to Clear, which is the order a player who had the asset
before clear plastics landed would take: **52,283 plate-blue pixels at L 30–40, the shadow copies**, and plate-blue
edges skewed to the shadow's side (16.5% vs 13.2%). In the viewer that is a pale grey-blue band under RAPTOR and a
ghost X under 5X, "where the photo's shadow fell", which matches Freddy's words more closely than mechanism 1.
The sheet already tells a clear disc with a photo to make the asset again after changing the finish, and nothing remakes
it behind the player's back (clear plastics, Part B). **Freddy's re-make through the one-click flow replaces it with a
clean-mode asset**, which this branch makes clean.

### 3. Not the material

The clear passes add nothing of their own around the stamp. With the asset swapped for one with alpha 0 everywhere
(served in its place, the browser's asset cache emptied), the difference against the real render is the print and the
patches above, and after the fix the print alone
([fix-vs-empty-dark.png](../work/clear-stamp-clean/evidence/fix-vs-empty-dark.png)).

## The fix: the clean finish (clear extraction only)

`disc-stamp-color.mjs` takes `clear`, and on a clear disc the colour pass decides what is print
(`disc-stamp-clear.mjs` `plastic()` holds the rule):

- **An ink that is the plastic's own colour is no ink**: in the plate's hue (off its axis by under 14), keeping at least
  half its saturation, and no more than 28 L darker than the plate. An ink in the plate's hue is opaque and blocks the
  surface's light, so it stands far darker (the Raptor's navy and black: 41 and 46 below the plate); a white ink has
  lost the plate's saturation and stays. Its pixels go.
- **Every other pixel is kept by how much of its ink it holds** (from the plate to the ink, as the edge un-blend reads
  it): at least half of the most its stroke holds nearby, so a hairline the photo blurred keeps its width, cut at half
  its depth; and only as part of a mark that is somewhere nearer its ink than the plate, which a soft plate-dark patch
  never is.
- **Glare is print pixel by pixel, and only where print encloses it**: walking out of the glare along four lines, both
  ways, every walk lands on kept print. What lies under glare cannot be seen, so on a clear disc it is not guessed
  (Freddy's ruling, Oct 23): a glare core inside a fill is print; a band over bare plastic, down the gap between two
  marks, or across a stroke is not, and **a stroke shows a gap where a glare band crosses it**, as worn foil would. A
  patch with no print in its own ring, or filled with the plastic's colour, is not print either.
- **Full alpha or none.** No soft alpha edge: the texture's own filtering smooths it on screen. Only pixels that are
  mostly ink (90%) lend colour, so an edge or hairline pixel takes its ink's full colour, not a blend with the photo's
  plate.
- **The one-ink asset holds exactly the same pixels**, at full alpha (`disc-stamp-worker.mjs`). A layered (illustrated)
  asset is drawn from its fill, line and solid layers, not its alpha, so each layer is cut at half: full or none.
- **A speck of under 4 pixels (at 1024) is no print**: the photo's grain or glare's edge, standing alone.

On the Raptor: plate-blue pixels **22,439 → 300** (the outer ring's genuine dark tails at 3 and 9 o'clock, and foil
edges), partial alpha **251,846 → 0**, design 276,959 → 264,104 pixels at 2048 (the glare streak, specks, and a glare blob hanging off the inner ring where
the band crosses it; the signature, 5X, WORLD CHAMPION, the flight numbers and both rings all stay). The asset the product makes and stores (a 1514 px WebP) keeps the edge
binary: 324 plate-blue pixels, 0 at partial alpha. Making it took 9.5 s on this Mac, against 8.6 s on main.

## Before and after

[sheet-before-after.jpg](../work/clear-stamp-clean/evidence/sheet-before-after.jpg): the Raptor's photo, the pop-out
viewer from the top, Paper above and Midnight below, all made through the one-click flow:

| Column | What it shows |
|---|---|
| Made on Opaque, then set to Clear | A pale grey-blue band under RAPTOR and a ghost X under 5X: the shadow copies. |
| Made on Clear by main (clean mode) | No shadow, but the glare streak beside PAIGE PIERCE in pale blue, and a pale streak in the double ring at top right. |
| **Made on Clear by this branch** | **The stamp alone**: red foil and navy ink on the clear plastic, nothing beside them. |

## Proof

| Check | Result |
|---|---|
| **Opaque extraction byte-identical to main**: this branch's worker against origin/main's, the Raptor's photo and two fixtures, stored and camera paths, colour and one ink (`work/clear-stamp-clean/lab/extract-identity.mjs`) | **12 / 12 identical** (sha256 of every output) |
| `tests/disc-stamp-clear.mjs`: four new cases. A synthetic clear disc with a glare band, a scuff and a blurred hairline (full alpha or none in both assets; no glare, no scuff; both words and the hairline kept; clear off stays soft-edged); glare enclosed by a fill (kept), a band across strokes and a band down the gap between two marks (nothing painted); the layered fixture (every layer full or none, on every kept pixel and only there) | 9/9 pass; each new case fails on the code before it |
| `photo-editor-races`, `disc-stamp-extract`, `-color`, `-delight` (unit) | 36/36 pass with `disc-stamp-clear` |
| **Photo stamp identity** (`tests/photo-stamp-identity-browser.mjs`: the photo look and the one-ink asset, every surface, against a detached origin/main) | **pass**: no differences, noise floor none |
| Clear plastics (`tests/clear-plastic-browser.mjs`), one-click, colour assets, stall (WebKit and Chromium) | all pass |
| `tests/photo-stamp-assets-browser.mjs` | **flaky on both trees, at the same line** (90: the bag's pulled disc never shows the foil stamp layer within 20 s): this branch has passed 2 of 5 runs, main 1 of 3. The suite's disc is opaque, whose extraction is byte-identical |
| Peak memory of a clear extraction (Raptor at 2048, Node, `/usr/bin/time -l`) | main 857 / 868 MiB, branch 873 / 880 MiB: the clean finish's maps, about 15 MiB |

The clear suite needs the Raptor's photo at `work/clear-plastic-discs/input/` (ignored): without it, it falls back to a
fixture the photo route refuses ("Use a square processed photo up to 1024 pixels"), on main too.

## Codex review on PR #45 (fixed)

Codex reviewed 4fbcc5e and left two P2 findings. Both were checked in the source and were real; Freddy ruled to fix
them:
1. **Glare kept as a whole patch.** `fillFromRing` gives one connected glare patch its ring's ink, so a band crossing a
   stroke and running on over bare plastic was kept whole, in the stroke's ink, and the plastic-colour check then saw
   the ink. Glare is now decided per pixel (above). Any of four lines was tried first and let the gap between two
   letters under a band bridge diagonally (196 of 384 band pixels over plastic kept in the new case); the thinnest
   crossing keeps none. On the Raptor this drops 623 pixels, a pink blob off the inner ring where the glare band
   crosses it, and adds none. The ring itself is unbroken.
2. **Layered stamps kept soft layers.** The worker forced the one-ink alpha to full, but a layered asset is encoded from
   its layers at opaque alpha, and they kept their blurred edges. On a clear disc each layer is now cut at half. The
   Raptor is not layered; the stamped-disc fixture is, and the new case covers it.

Codex's re-review (73d8216) found one more, also real and fixed:
3. **A kept pixel could fall out of every layer.** Cutting each layer at half on its own left 716 of the fixture's 22,770
   kept pixels with all three under half, and the encoder writes only the layers, so those edge and thin-print pixels
   vanished from the one-ink asset. A kept pixel with every layer under half now takes its strongest, so the layers
   together hold exactly the kept pixels. The layered case checks it, and fails on 73d8216.

Codex's next review (af1da37) found the per-pixel glare rule still guessed, both ways, and both were real:
4. **P1, a gap bridged**: a glare band down the bare gap between two marks has print at both ends of its thinnest
   crossing, so the gap was kept and painted (1,800 of 1,800 pixels in Codex's case).
5. **P2, a slanted stroke cut**: under a band, the shortest crossing lands on bare plastic while the crossing along the
   stroke lands on ink (0 of 84 stroke pixels kept).

No rule from print at a crossing's ends gets both right: the photo does not show what is under glare. **Freddy ruled
for the conservative rule**: glare is print only where print encloses it in all four directions, so nothing of the
plastic is ever painted, and a stroke crossing a glare band shows a gap there. That settles P1 and takes P2 as the
trade. On the Raptor it drops 40 more pixels (slivers where the glare band meets the rings, which stay whole) and adds
none; the case on af1da37 painted 1,650 of the band's 2,520 pixels across the strokes.

Opaque extraction is still byte-identical to main (12/12).

## Left for Freddy

- **Re-make the Raptor's asset** through the one-click flow (Game asset on the Clear copy), after this lands. Whichever
  mechanism the live asset shows, the re-make replaces it.
- **The ordering trap stays as it was**: an asset made before a copy is set to Clear keeps the shadow until it is made
  again. The sheet says so, and nothing remakes it unasked (clear plastics, Part B). Whether a clear copy should refuse,
  or flag, an asset made on Opaque is Freddy's call; it would need a stored mark of the mode an asset was made in.
- **Rules that would cut real print on some disc** (none on the Raptor): a stroke crossing a glare band shows a gap
  there (the ruling above); a light ink in a clear plate's own hue and
  saturation (a pale blue on blue) reads as the plastic and goes; a hairline the photo blurred until it is nowhere more
  ink than plastic goes. On a colourless clear plate, glare lighter than the plate by more than 28 is not caught.
- Not measured on a phone; WebKit on this Mac makes the same asset as Chromium.
