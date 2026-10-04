# Manufacturer flight-number diff

Generated 2026-10-04T14:13:38+00:00. **Research queue only; no overrides or catalog data changed.**

Run status: **partial / checkpoint**. Scope: rated catalog records minus covered molds; unrated records are included only with `--include-unrated`.

- Full catalog: **2434** records.
- Already covered / excluded: **260** records (IDs and brand/base-mold aliases).
- Remaining unrated records: **1238** (outside the default comparison scope).
- Eligible in selected scope: **936**.
- Total attempted: **50**.
- Total checked (successful comparisons): **19**.
- Flagged: **2** (absolute turn or fade delta ≥ 0.5).
- Unresolved: **31**.
- Speed/glide informational differences: **1** (may also be flagged for stability).
- Manufacturer numbers found without an Atlas baseline: **0**.

Exclusion inputs (read-only): `docs\stability-review-queue.md`; `..\disc-atlas-twin2\docs\sampling-audit.md`.

Reproduce from repository root:

```powershell
python scripts/manufacturer-diff.py --sampling-audit ../disc-atlas-twin2/docs/sampling-audit.md
```

HTTP requests this run: 16; cache hits: 111. Every uncached request, including redirects/searches, is spaced by at least 1 seconds. Cached pages and failures are reused; use a fresh `--cache` directory to refresh.

Deltas are **manufacturer minus Atlas**; order is speed/glide/turn/fade. Flagged rows sort by the largest absolute turn/fade delta, then the sum of those deltas. Manufacturer pages are evidence for owner review, including possible catalog lag, approval differences, and plastic/run differences. No ratings are averaged.

## Flagged discs

| Brand | Mold | Catalog ID | Atlas S/G/T/F | Manufacturer S/G/T/F | ΔS (info) | ΔG (info) | ΔT | ΔF | Source | Page identity / parser |
|---|---|---|---|---|---:|---:|---:|---:|---|---|
| Alfa Discs | Cosmic | 827871a0aac6 | 8/6/0/2 | 8/6/0/3 | 0 | 0 | 0 | 1 | [page](https://alfadiscs.com/item/cosmic/) | Cosmic / visible labels / mold-local slash fallback |
| Axiom | Time-Lapse | fbec7a7d6cd0 | 12/5/-1/3 | 12/5/-1/2 | 0 | 0 | 0 | -1 | [page](https://axiomdiscs.com/discs/time-lapse/) | Time-Lapse / MVP-family power meter |

## Speed/glide differences (info only)

| Brand | Mold | Atlas S/G/T/F | Manufacturer S/G/T/F | ΔS | ΔG | Source |
|---|---|---|---|---:|---:|---|
| Axiom | Inspire | 6.5/4/-1.5/1 | 6.5/5/-1.5/1 | 0 | 1 | [page](https://axiomdiscs.com/discs/inspire/) |

## HTTP / JavaScript limits

Only ordinary HTTP HTML was read. Search snippets, community ratings, and third-party retailer numbers were not used. Missing pages, unreadable flight graphics, blocked fetches/searches, conflicting plastics, identity mismatches, and JS-only content remain manual.

No unresolved pages were positively identified as JS-rendered shells. Other parse failures are not assumed to require JavaScript.

## Brand coverage

| Brand | Attempted | Checked | Flagged | Unresolved | No Atlas baseline |
|---|---:|---:|---:|---:|---:|
| Above Ground Level | 17 | 0 | 0 | 17 | 0 |
| Alfa Discs | 5 | 5 | 1 | 0 | 0 |
| AquaFlight | 4 | 0 | 0 | 4 | 0 |
| Axiom | 16 | 14 | 1 | 2 | 0 |
| Bernoulli Disc Golf | 5 | 0 | 0 | 5 | 0 |
| Birdie | 3 | 0 | 0 | 3 | 0 |

## Unresolved — manual research

The linked URL is the last candidate attempted, **not a verified source**. Full URL attempts/reasons and parsed results are in `outputs/manufacturer-diff/results.json`.

| Brand | Mold | Catalog ID | Atlas S/G/T/F | Reason | Last candidate |
|---|---|---|---|---|---|
| Above Ground Level | Acacia | 34348c6743b2 | 2/4/0/1 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/acacia) |
| Above Ground Level | Baobab | b5dec5476cff | 4/0/1/3 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/baobab) |
| Above Ground Level | Beech | 64d178ead767 | 5/2/0/3 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/beech) |
| Above Ground Level | Cedar | 59e5308b7e35 | 11/5/0/3 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/cedar) |
| Above Ground Level | Cypress | 9da98b89ac6d | 12/5/-2/2 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/cypress) |
| Above Ground Level | Elm | 2dbf673408d3 | 9/4/0/3 | parse failed: no complete flight-number set in model content; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/products/agl-discs-sherbet-alpine-elm-emily-weatherman-stamp) |
| Above Ground Level | Koa | 35af551bec11 | 2/3/0/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/products/agl-discs-pink-woodland-koa-stock-stamp) |
| Above Ground Level | Locust | dad184b1890a | 9/4/-1/3 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/locust) |
| Above Ground Level | Madrone | a0e7c489854a | 3/3/0/1 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/madrone) |
| Above Ground Level | Magnolia | c4ae6d5f06cb | 5/5/0/2 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/magnolia) |
| Above Ground Level | Manzanita | 7aab1385f2bc | 3/3/0/2 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/manzanita) |
| Above Ground Level | Maple | f4976964ecb7 | 4/2/0/2 | HTTP 404; parse failed: no complete flight-number set in model content; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/products/agl-discs-teal-woodland-maple-jef-wind-series) |
| Above Ground Level | Ponderosa | ebb53ff16c24 | 3/4/-2/0 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/ponderosa) |
| Above Ground Level | Redwood | 36873060f71b | 12/5/-1/2 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/redwood) |
| Above Ground Level | Sequoia | 6293849d556c | 12/5/-1/3 | parse failed: no complete flight-number set in model content; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/products/agl-discs-day-glow-polar-sequoia-jef-wind-series-stamp) |
| Above Ground Level | Spruce | 59f91687de15 | 5/4/-1/2 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/spruce) |
| Above Ground Level | Sycamore | 237d92945a5e | 7/5/0/1 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/sycamore) |
| AquaFlight | Dragonfly | 9a38bef317a0 | 5/4/-3/1 | web search blocked/challenged; web search found no matching official URL | — |
| AquaFlight | Peace Frog | 59a595a475a0 | 3/3/0/1 | web search blocked/challenged; web search found no matching official URL | — |
| AquaFlight | Pelican | 9bb31d50763e | 6/5/-3/1 | web search blocked/challenged; web search found no matching official URL | — |
| AquaFlight | Swift | 5be9be037c6a | 7/5/-2/1 | web search blocked/challenged; web search found no matching official URL | — |
| Axiom | Alias | 9643111e6cd3 | 4/4/-1/1 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://axiomdiscs.com/discs/alias/) |
| Axiom | Time-Lapse (retooled) | 2495294f6b9f | 12/5/-1/2 | approval/version-specific mold; current-page identity needs manual review | [page](https://axiomdiscs.com/discs/time-lapse/) |
| Bernoulli Disc Golf | Bernoulli | 1da47c6c5698 | 2/5/0/1 | web search blocked/challenged; web search found no matching official URL | — |
| Bernoulli Disc Golf | Einstein | 67e4e92c8f64 | 5/4/-1/1 | web search blocked/challenged; web search found no matching official URL | — |
| Bernoulli Disc Golf | Hubble | e62d340bd134 | 13/6/-3/2 | web search blocked/challenged; web search found no matching official URL | — |
| Bernoulli Disc Golf | Johnson | 773f36d49058 | 9/6/-3/1 | web search blocked/challenged; web search found no matching official URL | — |
| Bernoulli Disc Golf | Webb | f2f6ec04911c | 7/5/0/2 | web search blocked/challenged; web search found no matching official URL | — |
| Birdie | Marvel  | c695ecb487d0 | 2/3/0/1 | web search blocked/challenged; web search found no matching official URL | — |
| Birdie | Reach  | f2f9abb8e39c | 12/5/-1/3 | web search blocked/challenged; web search found no matching official URL | — |
| Birdie | Rise | bce27121ad09 | 5/4/0/2 | web search blocked/challenged; web search found no matching official URL | — |

## Successfully compared records

Complete comparison ledger, including matches and differences below the flag threshold.

| Brand | Mold | ID | Atlas S/G/T/F | Manufacturer S/G/T/F | ΔT | ΔF | Source |
|---|---|---|---|---|---:|---:|---|
| Alfa Discs | Apollo | 2f3b754ccad7 | 5/5/-1/2 | 5/5/-1/2 | 0 | 0 | [page](https://alfadiscs.com/item/apollo/) |
| Alfa Discs | Atlantis | e273fef32fa0 | 9/6/-4/1 | 9/6/-4/1 | 0 | 0 | [page](https://alfadiscs.com/item/atlantis/) |
| Alfa Discs | Cosmic | 827871a0aac6 | 8/6/0/2 | 8/6/0/3 | 0 | 1 | [page](https://alfadiscs.com/item/cosmic/) |
| Alfa Discs | Fjord (renamed from Galileo) | 82237eb5404d | 4/4/0/3 | 4/4/0/3 | 0 | 0 | [page](https://alfadiscs.com/item/fjord/) |
| Alfa Discs | Theios (renamed from Snoopy & Rover) | 98721df23cd1 | 2/4/0/2 | 2/4/0/2 | 0 | 0 | [page](https://alfadiscs.com/item/theios/) |
| Axiom | Aspect | b2b6af40855a | 9/5/0/2 | 9/5/0/2 | 0 | 0 | [page](https://axiomdiscs.com/discs/aspect/) |
| Axiom | Bokeh | c844ec49801f | 7/6/0/1 | 7/6/0/1 | 0 | 0 | [page](https://axiomdiscs.com/discs/bokeh/) |
| Axiom | Clash | ee810eae3408 | 6.5/4/-1/2 | 6.5/4/-1/2 | 0 | 0 | [page](https://axiomdiscs.com/discs/clash/) |
| Axiom | Excite | bcea515e54db | 14.5/5.5/-2/2 | 14.5/5.5/-2/2 | 0 | 0 | [page](https://axiomdiscs.com/discs/excite/) |
| Axiom | Inspire | 60111ed8bb59 | 6.5/4/-1.5/1 | 6.5/5/-1.5/1 | 0 | 0 | [page](https://axiomdiscs.com/discs/inspire/) |
| Axiom | Mayhem | 61cc9bda9af9 | 13/5/-1.5/2 | 13/5/-1.5/2 | 0 | 0 | [page](https://axiomdiscs.com/discs/mayhem/) |
| Axiom | Panic | b8166b712aea | 13/4/-0.5/3 | 13/4/-0.5/3 | 0 | 0 | [page](https://axiomdiscs.com/discs/panic/) |
| Axiom | Pitch | 9b39af0fc533 | 1/7/-0.5/0 | 1/7/-0.5/0 | 0 | 0 | [page](https://axiomdiscs.com/discs/pitch/) |
| Axiom | Tenacity | 2fb39b2acd83 | 13/5/-2.5/2 | 13/5/-2.5/2 | 0 | 0 | [page](https://axiomdiscs.com/discs/tenacity/) |
| Axiom | Theory | 4b701443f83e | 4/4/-1.5/1 | 4/4/-1.5/1 | 0 | 0 | [page](https://axiomdiscs.com/discs/theory/) |
| Axiom | Thrill | 29dbb803fdab | 11/4/0/3.5 | 11/4/0/3.5 | 0 | 0 | [page](https://axiomdiscs.com/discs/thrill/) |
| Axiom | Time-Lapse | fbec7a7d6cd0 | 12/5/-1/3 | 12/5/-1/2 | 0 | -1 | [page](https://axiomdiscs.com/discs/time-lapse/) |
| Axiom | Trance | 3b3a01d0742c | 8/5/-2/1 | 8/5/-2/1 | 0 | 0 | [page](https://axiomdiscs.com/discs/trance/) |
| Axiom | Wrath | b43b59827977 | 9/4.5/-0.5/2 | 9/4.5/-0.5/2 | 0 | 0 | [page](https://axiomdiscs.com/discs/wrath/) |
