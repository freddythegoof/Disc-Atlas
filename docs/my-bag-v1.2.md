# My Bag v1.2

Built on the committed v1.1 in the main tree. All changes are left uncommitted. Only local D1 databases were migrated; no push or deployment was performed.

## Behavior

- **Sort:** Speed is the account default: fastest first, then highest shared atlas stability index within a speed. Stability puts the highest shared index first, then speed. Unrated molds follow rated molds. Custom uses the saved physical-copy order; switching sorts retains that order. The bag list and illustrated slots use the same comparator. Storage retains its class groups.
- **Custom order:** Drag a row's grip with a mouse or touch, or use the keyboard-accessible Move earlier / later buttons. The illustrated compartments retain their own slots and capacities. Reorder saves through one D1 batch, excludes Storage, and rejects duplicate, foreign or incomplete bag IDs.
- **Pockets:** Every copy has an explicit Main compartment or Putter pocket assignment in its edit sheet, independent of mold type and Bag/Storage location. Existing and newly added putters default to the putter pocket. As in v1.1, illustrated pocket overflow uses spare main slots, and additional copies remain in the list.
- **Copies:** The lifted card shows the freeform note and optional More stable / Less stable label. The edit sheet's chips are mutually exclusive and can be toggled off. `stability_bias` is stored independently of prose, plastic and wear; it does not change catalog ratings or map positions.
- **Add:** Map details, Directory rows and comparison items each have one Add to dropdown offering Bag and Storage. The sheet displays the selected destination and permits changing it before saving. Native popover dismissal, arrow keys, Home/End, Tab and Escape work; Escape retains the underlying detail panel. The menu follows its anchor through scrolling and returns focus before opening the sheet.
- **Atlas:** Fine pixel, coarse wheel, line/page wheel and pinch-wheel input zoom around the pointer and capture the default event, including over map controls. Pointer drag pans; touch drag and two-finger pinch remain available. Early font/worker frames wait for the app's globals to initialize.

## Local migration and API

`migrations/accounts/0005_bag_preferences.sql` adds constrained fields:

| Table | Field | Default / allowed values |
| --- | --- | --- |
| `bags` | `sort_mode` | `speed`; `speed`, `stability`, `custom` |
| `bag_discs` | `pocket` | `main`; `main`, `putter` |
| `bag_discs` | `stability_bias` | `null`; `more_stable`, `less_stable`, `null` |
| `bag_discs` | `sort_order` | Nonnegative integer; migrated in prior added-at/ID order per account |

The migration snapshots catalog putter IDs for existing copies and preserves notes, color, location and capacity. New copies receive their pocket default through the shared validator. Every copy receives the next order position on insertion.

`PATCH /api/bag` saves `{sort_mode}` without resetting other settings. Existing settings PUTs preserve an omitted sort choice. Disc GET/POST/PUT includes the new metadata; legacy edits preserve saved metadata. Disc PATCH supports location, pocket and stability bias. `PUT /api/bag/order` accepts the complete ordered IDs of the user's currently bagged copies, with a bounded 32 KB body for up to 500 IDs. All writes retain session ownership, exact-origin and CSRF checks; responses retain no-store behavior.

## Verification and screenshots

Main local migration:

```powershell
node node_modules/wrangler/wrangler-dist/cli.js d1 migrations apply disc-atlas-accounts --local --config wrangler.public.jsonc
```

Regression commands (browser suites can use an existing `PLAYWRIGHT_MODULE` and `PLAYWRIGHT_EXECUTABLE_PATH`):

```powershell
node --test --test-isolation=none tests/bag.mjs tests/bag-values.mjs tests/auth.mjs tests/coach.mjs tests/atlas-layout.mjs tests/atlas-groups.mjs
node tests/bag-v12-browser.mjs
node tests/bag-browser.mjs
node tests/bag-scene-browser.mjs
node tests/motion.mjs --boundaries
node tests/motion.mjs --directory
node tests/motion.mjs --context-header
node node_modules/typescript/bin/tsc --noEmit --incremental false
node node_modules/eslint/bin/eslint.js . --ignore-pattern dist --ignore-pattern .next
```

The new suite uses the existing signed local Google fixture and real local Wrangler/D1 in `work/bag-v12/d1-qa`. It checks persisted sorts, speed/stability ties, keyboard/mouse/touch reordering, pocket overrides, independent duplicate notes, all add destinations, keyboard/focus handling, wheel capture, touch pan/pinch, and slow app initialization. Screenshot coverage includes eight states in Light, Midnight and Charcoal at 1440px and 360px: sort, pocket, lifted note, stability edit, duplicate copies, and the three add dropdown surfaces.

[48-screenshot gallery](../outputs/bag-v12/screenshots.html) · [QA manifest](../outputs/bag-v12/qa.json).

The Node regression suite passes 49 tests; adding worker/shopping checks brings the run to 51 passing tests. The three catalog identity tests also pass. All three bag browser suites and the atlas boundaries, Directory and header browser regressions pass. Typecheck passes. ESLint reports zero errors and the same 14 existing warnings in `public/app.js` and `public/atlas-map.js`. Catalog data, positioning/grouping modules, original bag artwork and its integration document have no diff.

The existing scene suite measured opening at 877–886 ms across the six theme/width combinations. Its 60-frame lift sample averaged 15.92 ms, peaked at 17 ms and had no intervals above 33 ms. These are local Chromium measurements; mobile gestures were checked with touch emulation, not physical devices.
