# My Bag v1.3

Built on the committed v1.2 (`5935507 Pocket fixes`). All changes are left uncommitted. No migration was added; nothing was pushed, deployed or migrated remotely.

## Putter pocket persistence

The `pocket` column (`main`, `putter`, `goto`) defaults from the mold type only at insert, in `defaultDiscDetails` merged by `validateDiscDetails(..., defaults=true)` on POST. Every later path stores or reads the column: PUT merges the existing row, PATCH accepts `{pocket}`, and `bagSlots`, the list, the edit sheet and the lift label render `item.pocket`. Nothing on any read path calls `bagClass`/`defaultPocket`.

The reported regression did not reproduce against the v1.2 code. The v1.1 `bagSlots` did place discs by `bagClass(mold)`, so any copy of that build (an older deploy or cached modules) shows the symptom. At investigation time the live `bag-values.js` was byte-identical to HEAD and served `must-revalidate`, so stale caching is unlikely. The remote D1 migration state could not be read from this machine (Cloudflare 7403). If the live bag misbehaves, first confirm that remote `0005_bag_preferences.sql` and `0006_bag_goto_pocket.sql` were applied: without `0006`, the CHECK constraint rejects `goto` and the API answers 503.

Regression coverage now spans insert default, inline move, edit sheet save, Store → Bag, sort change, reorder, bag settings save and reloads.

## Go-to slot

The upper pocket now has a dedicated go-to slot centered at x=400. It is taller than the putters (cy 214, ry 108, up to rx 50) and has an accent (`--lime`) rim. Putters split to its left and right. Before assignment, the slot shows as a dashed-accent hollow. Go-to no longer borrows putter capacity, so a full putter pocket keeps every putter. Several go-to copies share the slot, which widens up to x304–496. Keyboard order follows the slots left to right.

## Inline pocket switching

Each list row (Bag and Storage) has a labelled `Main / Putter / Go-to` select ("Pocket for {mold}"). A change sends `PATCH /api/bag/discs/:id {pocket}` immediately; it uses the same session, origin, CSRF and no-store checks. While saving, the row stays disabled and shows the pending value, then re-renders and returns focus to the select. A failed save restores the stored pocket and reports the error.

## Bag size

The default bag width rose from 360px to 560px. A `Bag size` S / M / L control (native radios, 44px targets, arrow keys) sets 360 / 560 / 880px. The bag always fits the viewport height (`(100dvh − 190px) × 0.8`), so Large reaches 880px on a 2560×1440 display and about 648px at 1440×1000. On phones, Small is 290px and Medium/Large fill the width. The choice persists per browser in `localStorage` (`atlas-bag-size`), with every access guarded.

The artwork is vector, so discs, hollows and hit areas scale together. The lift label's type and padding scale by `--bag-type` (1 / 1.12 / 1.3; 1 on phones). Two rendering fixes keep lifted discs sharp at every size:

- The lift stretches an edge-on disc about 10× horizontally. Disc strokes are now `non-scaling-stroke`, so the rim and highlight stay hairlines instead of smearing.
- The CSS `drop-shadow` on the lifted group made Chromium rasterize the disc before the stretch, which softened its edges (visible since v1.1). A separate blurred shadow ellipse, placed at the lifted pose in unstretched space, replaces it. The shadow is the disc's sibling, not its child, so its geometry never widens the disc's bounding box.

`tests/bag-scene-browser.mjs` now counts main/putter hollows (17) separately from the new empty go-to hollow (1).

## Verification

```powershell
node --test --test-isolation=none tests/bag.mjs tests/bag-values.mjs tests/auth.mjs tests/coach.mjs tests/atlas-layout.mjs tests/atlas-groups.mjs
node tests/bag-v13-browser.mjs
node tests/bag-pockets-browser.mjs
node tests/bag-scene-browser.mjs
node tests/bag-v12-browser.mjs
node tests/bag-browser.mjs
```

`tests/bag-v13-browser.mjs` runs against real local Wrangler/D1 in `work/bag-v13/d1-qa` (port 8801) with the signed local Google fixture. It writes 27 screenshots: putter in main after reload, go-to in the top pocket, the inline dropdown and the Large bag, in Light, Midnight and Charcoal at 1440px and 360px, plus Large at 2560×1440. Gallery: [outputs/bag-v13/screenshots.html](../outputs/bag-v13/screenshots.html) · [qa.json](../outputs/bag-v13/qa.json).
