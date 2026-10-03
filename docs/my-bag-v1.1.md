# My Bag V1.1

The centerpiece is the finished `public/bag.svg`, inlined by `public/bag-scene.js`. The artwork and `docs/bag-svg-integration.md` are unchanged. Shared definitions/styles stay intact; the sole application layer sits between `bag-back` and `bag-front`, with `bag-lid` last. Main discs start inside x270–530 / y545–790, ordered by speed. Putter tops emerge above the fixed upper pocket. Empty slots are dark hollows. Surplus putters use spare main slots; over-capacity copies remain accessible in the list.

The first visit opens the bag automatically. The zipper pull cue takes 80ms, the large front flap shrinks around its documented y488 hinge over 220ms, then `data-state="open"` hands off to the tucked flap and clears the transient transform. Discs rise over 330ms, with roughly 50ms stagger for ordinary lineups; the stagger compresses for larger lineups to keep the entire sequence below one second. Closing reverses that handoff. Clicking the bag or the native toggle button changes state. All motion shares `cubic-bezier(.2,1.35,.35,1)`, including the rAF hinge fold.

Hover, focus or the first touch tap lifts a physical disc and turns its top toward the viewer, with a soft shadow and a reserved, absolute-positioned details label. Mouse click, Enter/Space, or a second touch tap opens the existing mold detail panel. Escape settles it. Tab/Shift+Tab retain physical slot order even when a lifted disc changes SVG paint order. Native dialogs retain focus containment and restoration. Reduced motion switches directly between final poses. Lift transforms do not change layout.

## Storage and input

`0004_bag_polish.sql` adds `bag_discs.color`, `bag_discs.in_bag`, `bags.bag_color`, and separate `main_capacity`, `putter_capacity`, `extra_capacity`. Existing discs stay bagged, receive a neutral editable color, and retain every old field. Custom capacities survive exactly; researched curated totals migrate together with their pocket counts. Google account deletion still cascades to all rows.

The existing CRUD routes include the new fields. Disc colors are strict six-digit hex strings, normalized to lowercase. API `in_bag` is a strict boolean, stored as constrained 0/1 in D1. `PATCH /api/bag/discs/:id` accepts only `{in_bag:boolean}` for one-tap moves; it has the same session ownership, exact-origin, CSRF, body limit and no-store protections as the other writes. Legacy PUT disc edits preserve existing color and location. Storage is part of the same collection and never counts toward the bag meter. Both sections have empty states.

Plastic families now cover 39 brands (including Kastaplast, Westside, Streamline, Infinite, Gateway, DGA, Legacy, Mint, Thought Space, RPM and others). Every curated plastic has an editable default hex color. These are illustration defaults, not manufacturer color or stability claims. Add sheets follow plastic changes until the user chooses a color; edit sheets preserve the saved color. Unknown brands/custom blends still use Other. Catalog/consensus ratings are never modified.

Bag settings has a native color picker. The default uses the SVG's original charcoal palette without overrides. A selected color drives `--bag-primary`, a 25% darker secondary, and a gently lightened accent. Zipper hardware remains fixed. The account header now reads `Hi {firstName}`, taken from the saved account display name.

## Researched capacity

Source URLs, ranges and pocket notes live in `source-data/bag-models.json`. The meter adds main + putter + explicitly quantified extra disc pockets and explains the breakdown. Sources publish estimates/ranges, so these guide capacity rather than blocking additions. Main artwork also represents extra disc pockets.

Verified examples: BX3 18+3=21; AX5 22+4+2 front=28; Ranger 20+2=22; Voyager 18+2=20; Voyager Lite 18+2=20 (official Pro Shop); Slinger 10+2=12. Paratrooper includes its two dedicated putters and four upper accessory disc slots. Octothorpe uses the upper ends of the manufacturer's pocket ranges, including haul pockets. Trooper's top compartment uses the manufacturer-blog four-putter estimate. Commander's two vertical pockets use a four-disc working estimate; the manufacturer's description does not give an exact per-pocket count.

Innova Adventure, Latitude E3/E4, Upper Park Rebel/Shift publish aggregate capacities without a reliable, consistent main/putter numeric split. Their advertised totals remain in source-data and prefill on selection, while the pocket fields stay editable and explain that the owner must enter the actual split. Heritage still has no verified specification. These are deliberately not presented as verified pocket measurements. E3/E4 descriptions also advertise over 30 when all accessory compartments are used; that maximum is not a quantified main/putter split.

## Local verification

Only local development/test D1 databases were migrated. No remote migration, deploy, push or commit.

```powershell
node node_modules/wrangler/wrangler-dist/cli.js d1 migrations apply disc-atlas-accounts --local --config wrangler.public.jsonc
node --test --test-isolation=none tests/bag.mjs tests/bag-values.mjs tests/auth.mjs tests/coach.mjs tests/atlas-layout.mjs tests/atlas-groups.mjs
node tests/bag-browser.mjs
node tests/bag-scene-browser.mjs
```

Browser tests use the existing local Google fixture and real local D1. `PLAYWRIGHT_MODULE` can point at an existing Playwright installation. The new scene suite uses `work/bag-v11/d1-qa` and emits 36 screenshots (six states, three themes, two widths), a real browser recording, and measured opening/frame timings in `outputs/bag-v11`. Gallery: `outputs/bag-v11/screenshots.html`.

Unit/integration coverage includes migration of existing rows, color validation/defaults, strict location flags, owner isolation, CSRF, independent physical copies, custom/curated totals, and slot order/overflow. Browser checks cover no layout shift, real mouse hover/settle, Tab order and focus retention, Enter toggling/detail inspection, touch lift/second-tap inspection, reduced motion, SVG handoff, color persistence, Storage moves and sign-out cleanup. Existing bag CRUD, all add surfaces and slow-response tests also pass. Catalog, map renderer, consensus overrides and the supplied artwork remain untouched.

Final local results: 44 Node unit/integration tests passed, along with catalog identity, worker/shopping checks and the bag, scene, accounts and coach browser suites. Typecheck passed. ESLint has zero errors; the 14 existing warnings are confined to `public/app.js` and `public/atlas-map.js`, with no warnings in the changed bag files. The six theme/width combinations measured opening at 884–895ms. The sampled animation frame interval averaged 15.95ms, peaked at 17ms, and had no intervals above 33ms. These are local browser measurements, not a guarantee for every device. The original artwork, integration document, catalog data, map renderer and consensus override hashes match the starting tree.
