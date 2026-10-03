# My Bag V1 (Plan 11)

Implements the approved V1 scope in `bag-feature-spec.md` on the public Google-account Worker. One row means one physical disc; identical molds are independent copies. The catalog and consensus overrides are read-only inputs.

## Storage and API

`migrations/accounts/0003_my_bag.sql` adds `bags` and `bag_discs`, both keyed to `auth_users` with account-deletion cascades. Catalog molds live in JSON rather than a D1 table, so `mold_id` is a logical foreign key validated against the bundled catalog by the API. Wear and weight also have database constraints.

| Route | Methods | Response |
| --- | --- | --- |
| `/api/bag` | GET | `{bag, discs}` |
| `/api/bag` | PUT | `{bag}`; update `bag_model` and `capacity` |
| `/api/bag/discs` | GET | `{discs}` |
| `/api/bag/discs` | POST | `{disc}`, status 201 |
| `/api/bag/discs/:id` | GET, PUT | `{disc}` |
| `/api/bag/discs/:id` | DELETE | `{removed}`; unknown/unowned ID returns 404 |

Disc writes accept `mold_id`, `plastic`, `wear`, `weight_g`, and optional `notes`. Owner IDs always come from the Google session. Mutations require an exact same-origin Origin header and `X-Atlas-CSRF`. Responses are `no-store`; no guest bag uses localStorage. Request bodies are limited to 4 KB. Wear is an integer 1–10, weight an integer 130–180 g, plastic up to 60 characters, notes up to 240. Capacity is an integer 1–500 and never blocks adding discs.

Before selecting a model, the bag has a 20-slot custom default. Curated models use their source-data capacity; a custom bag uses its entered name and capacity. `Innova Heritage` remains selectable with manual capacity because no reliable bag specification was found. Other models have sourced capacity defaults. The conservative main-compartment/default capacity is a guide, including where manufacturers advertise extra pockets.

## Curated input and defaults

`source-data/bag-plastics.json` and `source-data/bag-models.json` are the editable sources. `scripts/build-workers.mjs` copies them to public assets at build time; the API imports the same files directly. No catalog preparation or override changes are needed.

Plastic defaults prefer an explicit catalog `referencePlastic`, then a mold-specific reference in the bag plastic source, then the curated brand reference. The current catalog does not provide a structured reference plastic for every mold; brand references are defaults rather than a claim that every mold was produced in that plastic. Unknown brands require selecting Other and entering plastic. Mold-specific references include the Hard Luna and Star Gator consensus sources. Plastic choices always include the mold reference, even when it falls outside the short brand list.

Weight defaults use an explicit `typicalMaxWeight` when available, otherwise the whole-gram PDGA maximum in the existing mold specs, capped at 180 g. Missing/unusable weight specs default to 175 g. Wear defaults to 10. Neither these inputs nor their edits change the catalog or consensus ratings shown in the bag. Severe wear has a descriptive badge/warning without applying a personal flight transform.

## Local development and verification

Only local storage was migrated for this build:

```powershell
node node_modules/wrangler/bin/wrangler.js d1 migrations apply disc-atlas-accounts --local --config wrangler.public.jsonc
node scripts/build-workers.mjs
node node_modules/wrangler/bin/wrangler.js dev --config wrangler.public.jsonc --local --local-protocol https --port 8787
```

Run `npm run test:bag` for endpoint/value tests, and `npm run test:bag:browser` for real local Wrangler/D1 plus signed Google fixture browser QA. Use `PLAYWRIGHT_MODULE` to point to an existing Playwright install when it is not a repository dependency. The browser fixture owns `work/plan-11/d1-qa` and uses only local migrations. It never contacts Google or a live AI provider. Screenshots and QA output go to `outputs/plan-11`.

The live entry uses `public/my-bag.js` and `public/my-bag.css`. Earlier prototype `bag.js`, `bag-engine.js`, and the separate Sites API remain preserved; the public entry does not activate their profiles, photos, map overlay or gap analysis. Coach continues using catalog-only context. Deployment and remote migration are deferred to Freddy.

## Verification results

- 41 Node tests passed across bag endpoints/values, Google accounts, coach, map grouping and layout; three catalog-identity Python tests passed.
- Browser suites passed for bag CRUD, Google accounts, coach, Directory and map boundaries. Bag checks include duplicate physical copies, custom and curated capacity, overflow without blocking, confirmed removal, keyboard focus containment/restoration, and late responses during saves or after sign-out.
- Captured and visually reviewed the bag view, add sheet, edit sheet and signed-out teaser in light, midnight and charcoal, each at 1440px and 360px. Gallery: `outputs/plan-11/screenshots.html`.
- Typecheck passed. Repository lint passed with zero errors and 14 existing warnings in the shared `app.js`/`atlas-map.js` scripts; new bag files passed with zero warnings. Existing Sites type annotations were tightened and CommonJS test files explicitly identified to make repository lint pass. No coaching behavior was changed.
- Corrected two existing browser-test assumptions: Featured continues to put Zone third with all approvals included (the old Aviar expectation failed against committed HEAD too), and coach focus restoration is awaited after the native dialog close event.
- Catalog, consensus overrides, preparation pipeline, map renderer and existing prototype bag module match their pre-task hashes. The Directory-first selection path now skips marker rendering until the map is active, avoiding a null map cache on direct bag/Directory entry.
- Migration applied only to the normal local development D1 and isolated local test databases. All implementation changes remain uncommitted; no push or deployment occurred.
