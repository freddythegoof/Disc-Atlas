# My Map

A personal flight map on the My Bag page: **my bag, my map**. It shows only the signed-in player's bagged discs, each at its consensus position shifted by the player's own stability bias. The shared Flight atlas is unchanged.

## What it does

- **Where:** My Bag has a Bag / My map switch (a radio group, like the atlas lens; arrow keys move between them). It appears only when signed in. My Bag reopens on whichever view was last used.
- **Which discs:** bagged copies only (Storage is excluded), one marker per mold. A bagged mold without flight ratings is not plotted, and a note under the map counts it.
- **Rendering:** this is the atlas's own map (`#mapWrap`), docked into `#myMapHost` while My Map is open, in the existing non-immersive `my-bag-mode` frame. Grouping, labels, zoom, pan, keyboard access and the details panel all work as on the atlas. Markers wear their bag colors. Picking a disc opens the details panel docked on My Bag, with the first bagged copy's facts and, for a moved disc, "On your map: Stability X · consensus Y".
- **Leaving** (Bag view, Flight atlas, Directory, Show on Atlas): the map goes back to the atlas with the shared positions and the camera it had. Filters on the atlas are never touched, and My Map ignores them.

## Personal lens

`public/personal-lens.js` holds the transform, and `AtlasLayout.positions(items, shift)` applies it (same seeded scatter and 0–100 clamp as the shared map; speed is never moved).

| Input | Source | Shift (stability-index points) |
| --- | --- | --- |
| Copy note `more_stable` | `bag_discs.stability_bias` (migration 0005) | +10 (one unit of turn + fade) |
| Copy note `less_stable` | same | −10 |
| No note | same | 0 |
| Player-wide bias | **none stored yet**; `moldShifts(copies, {playerBias})` is the extension point | defaults to 0 |

Copies of one mold average their notes. With no notes, every disc sits exactly at its consensus position. A disc that a note moved keeps a faint dashed ring at its consensus spot.

`COPY_BIAS_SHIFT` is the single place to tune the ±10.

## Follow-ups

- **Bias editor.** Today the only editor is the existing More stable / Less stable chips in the Edit disc sheet. A numeric per-copy bias and a player-wide bias (for example from arm speed, which would need its own column) are not built. Wire either into `moldShifts`.
- Wheel and pinch over the docked map zoom it (the atlas's capture behavior), so a page scroll that starts over the map zooms instead of scrolling.

## Verification

```powershell
node --test tests/personal-lens.mjs tests/atlas-layout.mjs
node tests/my-map-browser.mjs   # needs PLAYWRIGHT_MODULE; port 8805; D1 state in work/my-map/d1-qa
```

The browser suite covers signed out, an empty bag, a populated bag (Storage and unrated excluded, ±10 shifts, speed unchanged), docked details, a saved note moving a disc, Midnight at 1440 and 360, no horizontal scroll at 360, and repeated atlas ⇄ My Map hand-offs leaving the atlas's positions, catalog and frame intact. Screenshots: [outputs/my-map/screenshots.html](../outputs/my-map/screenshots.html).
