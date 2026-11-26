# Disc Atlas

## Public Cloudflare Workers deployment

Public URL: https://disc-atlas-public.disc-atlas-explorer.workers.dev

The live site is the public Worker (`workers/public.mjs`, `wrangler.public.jsonc`).
Run `pnpm build:workers` to package the public atlas, or `pnpm deploy:workers`
to build and deploy that config after `wrangler login`. The public entry is
plain `web/index.html` plus `public/`, copied to `dist/workers-public` with
`source-data/bag-plastics.json` and `source-data/bag-models.json`. This
deployment needs no framework adapter. The Vinext app in `app/` is a separate
Sites build; it is not what that URL serves.

The public Worker uses Google sign-in and D1 sessions (`workers/auth.mjs`),
My Bag (`workers/bag.mjs`, `/api/bag`), and a login-gated Atlas Coach
(`workers/coach.mjs`, `/api/coach`). The coach defaults to Workers AI, with an
optional gpt-5-nano path capped at $5/month in D1. Each user gets 20 messages/day.
Coach prompts do not include the saved bag or throwing profile. A disc-request
tip (`workers/disc-requests.mjs`, `/api/disc-requests`) does not require an
account. Incoming Sites identity headers grant no access. `/signin-with-chatgpt`,
`/signout-with-chatgpt`, and `/callback` stay unconnected. See
[account setup](docs/accounts-google.md) and [coach setup](docs/atlas-coach.md).
Validate with `node tests/workers.mjs` and
`pnpm exec wrangler deploy --config wrangler.public.jsonc --dry-run`.

A canvas flight atlas and a fully searchable directory, served from that Worker.

## Source coverage
- Full PDGA CSV export retrieved September 23, 2026: 2,434 approval records.
- DiscIt / Marshall Street catalog: conservative normalized brand/model joins only.
- Manufacturer and verified retailer images are bundled locally with per-record source links.
- Missing ratings and images remain explicitly missing. The app makes no complete-photo claim.
- The 0–100 index is clamp(50 + 10 × (turn + fade), 0, 100). It is a provisional common transform, **not** an empirically calibrated cross-brand measure.
- Flight paths are illustrations, not aerodynamic simulations or distance forecasts.

## Files
`dist/workers-public/` is the public Worker's static atlas. `source-data/` retains the retrieved source snapshots. `prepare_data.py` rebuilds data.json and preserves bundled photo mappings on data-only refreshes. Newly collected photos can be incorporated through its optional scratch mapping inputs.

No runtime API dependency is needed for the catalog snapshot. The snapshot does not auto-update. To refresh, retrieve new authorized source exports, rerun `python prepare_data.py`, validate record counts and matches, then rebuild the public Worker.

## Interaction
Search; type, manufacturer, speed and stability filters; map pan/zoom; hover preview; details with ratings and dimensions; hand/style and power flight sketches; sorting; three-disc comparison; accessible list alternative. My Bag adds a signed-in bag, My Map, storage, gallery, and lost discs. Atlas Coach is the login-gated assistant. "Don't see a disc?" submits a tip without an account. Theme preference remains saved in the browser.

## Validation
JavaScript syntax; approval-record uniqueness/count; rating bounds; local image paths. A headless DOM-stub smoke check passed catalog startup, default selection, search, unrated/manufacturer filters, directory rendering, comparison, throw mirroring, and reset. Browser visual QA was unavailable for this buildless static execution profile.

## Collection and manufacturer filters
The default is `Current + recent`, a catalog-based availability approximation: records matched to the retrieved flight catalog plus documented retirement announcements within 24 months of the status snapshot (2026-09-23). Explicit old retirement notices and undated out-of-production records override catalog matches. Unknown status stays available in `Show everything`. This is **not a complete verified active-production registry**; retailer flight catalogs can contain old inventory and production-status coverage remains partial. Approval dates are never treated as production dates.

`source-data/production-status.json` stores dated, cited status overrides. Original and retooled molds are not merged. The one exception is a reviewed ruling that two approvals are the same physical mold: `source-data/merged-records.json` folds one record into the other, `validate_data.py` accounts for every folded record, and saved bags keep working through `meta.idAliases`. The collection retains 892 records by default; the complete archive retains 2,433. The date window is anchored to the data snapshot, so an old offline snapshot cannot silently assert current status.

Manufacturers use native multiple checkboxes with OR within brands and AND with all other filters. Clicking a detail-panel manufacturer adds/removes its filter. Selecting multiple brands changes map and flight colors with a matching legend. Reset returns to the default collection and clears brand selections; theme preference remains saved.

Validated collection boundaries, exclusion of unknown status from the default, exact two-year retirement cutoff, full archive restoration, brand unions, intersections with search/speed, legend colors, selected-disc consistency, empty-result recovery, and reset.

## Install, build, run, and test

Node.js 22.13 or newer. The package manager is pnpm 11.25.0.

```bash
pnpm install --frozen-lockfile
pnpm build:workers
pnpm build
```

`pnpm build:workers` (`node scripts/build-workers.mjs`) only packages the public atlas. `pnpm build` checks catalog artwork rights, then builds the Vinext app through `scripts/run-framework.mjs`. `pnpm dev` runs that app. `pnpm start` serves the built Vinext Worker locally from `dist/server`. `pnpm exec wrangler dev --config wrangler.public.jsonc` runs the public Worker; local Google sign-in uses the HTTPS dev setup in the account doc.

`pnpm test:accounts`, `pnpm test:bag`, and `pnpm test:coach` cover the public account, bag, and coach handlers. Browser scripts load `playwright` from devDependencies, or `PLAYWRIGHT_MODULE` when pointed at another install. `node tests/api.cjs` covers the built Vinext Worker and needs `pnpm build` first.

## Vinext app (`app/`): Sites accounts, bags, and coach

`app/` is the Sites application, separate from the public Worker. `vite.config.ts` loads Vinext and the Sites plugin. `app/route.ts` serves the same atlas entry in `web/index.html`, with assets in `public/`. `app/api/**` and `app/chatgpt-auth.ts` authorize with Sites' dispatch-owned ChatGPT sign-in headers, not the public Worker's Google session. Hosting uses D1 (`DB`) for saved player profiles, per-user bag items, and daily coach usage counts. Those migrations are in `drizzle/`. They are not the public Worker's `migrations/accounts/` database.

- Profile and bag endpoints authorize every request server-side and scope queries to the signed-in user's stable Site ID. Mutations require a matching Origin and JSON. Unknown measurements are saved as null.
- The personal map uses saved catalog mold IDs; plastic/weight/wear/notes do not invent adjusted flight numbers. Repeated copies remain separate bag entries.
- `public/bag-engine.js` supplies transparent slot coverage and catalog candidates. Its speed thresholds are explicitly labeled fitting heuristics, not measured physics. RPM never modifies ratings.
- Live chat on this path requires `OPENAI_API_KEY` in Sites production secrets. Optional `OPENAI_MODEL` defaults to `gpt-4.1-mini`. Never put keys in source, client JavaScript, or the hosting manifest. Configure through the OpenAI Developers workflow with user approval, then republish. Without a key the UI honestly reports that the coach is awaiting connection; no simulated AI answers are supplied.
- Coach requests include the user's profile, saved bag and relevant catalog records, use Responses API `store:false`, and are limited to 30 requests per signed-in user per UTC day. Chat history is held only in the current page session. A failed AI request can count toward this cap.
- Never modify migrations after deployment. `node tests/api.cjs` tests the built Worker with an isolated disposable D1 database, including authentication, user isolation, CSRF rejection, validation and persistence. Build before running this test.
