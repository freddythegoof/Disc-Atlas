# "Don't see a disc?"

When a search finds nothing, the empty state offers a quiet link to a sheet where someone can ask for a disc to be
added. Freddy's trigger case was the Prodigy Distortion, which sat unrated and effectively invisible (November 5, 2026).

Requests are tips. Nothing a visitor submits touches the catalog; additions still go through the reviewed data pipeline.
There is no public read route and no public listing.

## Where the link appears

There is one search box (`#search`), and it feeds two empty states:

| Surface | Empty state | Link |
| --- | --- | --- |
| Flight Atlas | `#empty` in `web/index.html`, toggled in `filter()` | `#emptyRequest` |
| Directory | `renderList()` in `public/app.js` | `.disc-request-link` |

The rule, in `canRequestDisc()`: text is in the search box, and the empty state is showing.

- **A search that finds something** shows no link, and its results, order and layout are unchanged.
- **Filters alone** (no search text) show no link. Clear filters is the answer there, and nobody looked for a disc.
- **A real mold the view can't show** does show the link: an unrated disc on the map, or one outside the Directory's
  current collection. That was the Distortion's situation, so this is deliberate. A search that is empty only because of
  a manufacturer or type filter shows it too, beside Clear filters.
- **My Map** ignores the search box, so it never shows the link.

The filter drawer's coverage line ("No matching approval in this registry snapshot") stays text only. It reports on the
same search, and the view behind it already has the link.

## The sheet and the endpoint

`public/disc-request.js` opens `#discRequestDialog`, a `.bag-sheet` in the accent's scope (`public/display-palette.js`),
and carries the search text over as the disc name. It posts to `POST /api/disc-requests` (`workers/disc-requests.mjs`).
The Worker is the only validator; its messages land beside each field, and nothing typed is cleared until a request
succeeds. No account is needed.

| Check | Rule |
| --- | --- |
| Disc name | Required, 120 characters (the catalog's longest is 102) |
| Manufacturer | Required, 80 characters. A tip, so not checked against the catalog's list |
| Flight numbers | All four or none. Speed above 0 to 15, glide 0 to 8, turn −6 to 3, fade 0 to 7 |
| Link | Optional, 500 characters, `http` or `https` only |
| Note | Optional, 500 characters |
| Email | Optional, 254 characters, must look like an email. Never shown anywhere public |
| Body | 8 KB, JSON, same origin |

`validate_data.py` bounds only speed, so that range is the pipeline's. Glide, turn and fade are the catalog's span (0–7,
−5–2, 0–6) one wider each way, so a real new mold isn't refused.

**Abuse basics.** A filled honeypot (`contact_time`) gets the same success answer and writes nothing. Five accepted
requests per IP per clock hour, then a 429. Invalid attempts don't count against that.

**The throttle needs its own table.** The spec's columns have no IP, and an IP or its hash shouldn't sit on a long-lived
row, so migration 0017 also adds `disc_request_throttle`, following `atlas_coach_usage`'s atomic upsert. Its key is a
SHA-256 of the hour and the IP, so no address is stored and hours can't be linked. The 15-minute cron deletes finished
hours. `public/privacy.html` has a new section saying all this.

## Reviewing requests

No admin pattern exists in this repo, so review is a D1 query, not a route. Pending requests, oldest first:

```bash
npx wrangler d1 execute disc-atlas-accounts --remote --config wrangler.public.jsonc --command "SELECT id, datetime(created_at,'unixepoch') AS received, disc_name, manufacturer, speed, glide, turn, fade, link, note, email FROM disc_requests WHERE status='pending' ORDER BY created_at"
```

Close one once it's handled. `status` is free text, so use whatever words suit:

```bash
npx wrangler d1 execute disc-atlas-accounts --remote --config wrangler.public.jsonc --command "UPDATE disc_requests SET status='added' WHERE id='PASTE-ID'"
```

## Tests

`npm run test:disc-request` runs `tests/disc-requests.mjs` (endpoint: insert, validation, caps, honeypot, throttle, no
read route) and `tests/disc-request-browser.mjs` (both surfaces, inline errors, one real row in a local D1, the burst,
Paper and Dusk, the accent, a phone).
