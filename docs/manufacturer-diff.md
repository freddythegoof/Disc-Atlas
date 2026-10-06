# Manufacturer flight-number diff

Generated 2026-10-04T15:34:06+00:00. **Research queue only; no overrides or catalog data changed.**

Run status: **complete**. Scope: rated catalog records minus covered molds; unrated records are included only with `--include-unrated`.

- Full catalog: **2434** records.
- Already covered / excluded: **276** records (IDs and brand/base-mold aliases).
- Remaining unrated records: **1238** (outside the default comparison scope).
- Eligible in selected scope: **920**.
- Total attempted: **920**.
- Total checked (successful comparisons): **493**.
- Flagged: **24** (absolute turn or fade delta ≥ 0.5).
- Unresolved: **427**.
- Speed/glide informational differences: **16** (may also be flagged for stability).
- Manufacturer numbers found without an Atlas baseline: **0**.

Exclusion inputs (read-only): `docs\stability-review-queue.md`; `..\disc-atlas-twin2\docs\sampling-audit.md`.

Reproduce from repository root:

```powershell
python scripts/manufacturer-diff.py --sampling-audit ../disc-atlas-twin2/docs/sampling-audit.md --offline
```

HTTP requests this run: 0; cache hits: 2247. Every uncached request, including redirects/searches, is spaced by at least 1 seconds. Cached pages and failures are reused; use a fresh `--cache` directory to refresh.

Deltas are **manufacturer minus Atlas**; order is speed/glide/turn/fade. Flagged rows sort by the largest absolute turn/fade delta, then the sum of those deltas. Manufacturer pages are evidence for owner review, including possible catalog lag, approval differences, and plastic/run differences. No ratings are averaged.

## Flagged discs

| Brand | Mold | Catalog ID | Atlas S/G/T/F | Manufacturer S/G/T/F | ΔS (info) | ΔG (info) | ΔT | ΔF | Source | Page identity / parser |
|---|---|---|---|---|---:|---:|---:|---:|---|---|
| Divergent Discs | Basilisk | abcec9d8352a | 12/6/-4/1 | 13/6/-5/2 | 1 | 0 | -1 | 1 | [page](https://divergentdiscs.com/product/basilisk-max-grip/) | Basilisk (Max Grip) / primary product/collection description |
| Divergent Discs | Wyrm | 56899afe23af | 8/1/1/4 | 9/2/0/5 | 1 | 1 | -1 | 1 | [page](https://divergentdiscs.com/product-tag/wyrm/) | Wyrm / visible labels / mold-local slash fallback |
| Gateway | Aura | 68af32f30a4a | 12/6/-2/1 | 12/6/-1.5/2 | 0 | 0 | 0.5 | 1 | [page](https://gatewaydiscsports.com/collections/aura) | Aura / primary product/collection description |
| Gateway | Hybrid | d94273fe89d2 | 7/5/0/3 | 7/4/-0.5/2 | 0 | -1 | -0.5 | -1 | [page](https://gatewaydiscsports.com/collections/hybrid) | Hybrid / primary product/collection description |
| Prodigy | M5 | e905af456041 | 5/5/-3/1 | 5/5/-2/0.5 | 0 | 0 | 1 | -0.5 | [page](https://prodigydisc.com/products/prodigy-m5-400-plastic) | Prodigy M5 400 Plastic / visible labels / mold-local slash fallback |
| Alfa Discs | Cosmic | 827871a0aac6 | 8/6/0/2 | 8/6/0/3 | 0 | 0 | 0 | 1 | [page](https://alfadiscs.com/item/cosmic/) | Cosmic / visible labels / mold-local slash fallback |
| Axiom | Time-Lapse | fbec7a7d6cd0 | 12/5/-1/3 | 12/5/-1/2 | 0 | 0 | 0 | -1 | [page](https://axiomdiscs.com/discs/time-lapse/) | Time-Lapse / MVP-family power meter |
| Discmania | DD4 | a92195c30ec2 | 13/5/0/3 | 13/5/-1/3 | 0 | 0 | -1 | 0 | [page](https://www.discmania.net/collections/dd4) | DD4 / Discmania collection numbers |
| Discraft | Archer | 46efed768b52 | 5/4/-4/1 | 7/4/-3/1 | 2 | 0 | 1 | 0 | [page](https://www.team.discraft.com/discs/archer) | Archer / Discraft model badges (separate stability excluded) |
| Divergent Discs | Kraken | eba3aaaf0db3 | 8/5/-2/2 | 8/5/-1/2 | 0 | 0 | 1 | 0 | [page](https://divergentdiscs.com/product-tag/kraken/) | Kraken / visible labels / mold-local slash fallback |
| Divergent Discs | Minotaur | daba930518da | 8/3/0/4 | 8/3/0/3 | 0 | 0 | 0 | -1 | [page](https://divergentdiscs.com/product/minotaur-max-grip/) | Minotaur (Max Grip) / primary product/collection description |
| Divergent Discs | Nuno | 2a64bb62f765 | 3/4/-1/1 | 3/4/0/1 | 0 | 0 | 1 | 0 | [page](https://divergentdiscs.com/product-tag/nuno/) | Nuno / visible labels / mold-local slash fallback |
| Dynamic Discs | Supreme Trespass | 81b9e181f205 | 12/5/-0.5/3 | 12/5/-0.5/2 | 0 | 0 | 0 | -1 | [page](https://www.dynamicdiscs.com/collections/supreme-trespass) | Supreme Trespass ▼ / manufacturer labeled flight badges |
| Innova | Lynx | 7bac98262a87 | 7/6/-2/1 | 7/6/-3/1 | 0 | 0 | -1 | 0 | [page](https://www.innovadiscs.com/disc/lynx/) | Lynx / Innova rating badges |
| Lone Star Discs | Artemis | 2cbdaa78c008 | 4/4/0/3 | 4/4/0/2 | 0 | 0 | 0 | -1 | [page](https://www.lonestardiscs.com/products/artemis) | Artemis 4/4/0/2 / manufacturer model title ratings |
| Lone Star Discs | Bearkat | b19135e88385 | 5/5/-2/1 | 5/5/-3/1 | 0 | 0 | -1 | 0 | [page](https://www.lonestardiscs.com/products/bearkat-midrange) | Bearkat 5/5/-3/1 / manufacturer model title ratings |
| Lone Star Discs | Lone Wolf | 78da2edc3101 | 5/5/-3/1 | 5/5/-4/1 | 0 | 0 | -1 | 0 | [page](https://www.lonestardiscs.com/products/lone-wolf-midrange) | Lone Wolf 5/5/-4/1 / manufacturer model title ratings |
| Lone Star Discs | Tumbleweed | fbf0979e6b99 | 10/6/-4/1 | 10/6/-3/1 | 0 | 0 | 1 | 0 | [page](https://www.lonestardiscs.com/products/tumbleweed) | Tumbleweed 10/6/-3/1 / manufacturer model title ratings |
| Streamline | Pilot | 71fcb40815bd | 2/5/-1/1 | 2/5/0/1 | 0 | 0 | 1 | 0 | [page](https://streamlinediscs.com/discs/pilot/) | Pilot / MVP-family power meter |
| Divergent Discs | Kapre | 9618b1c70a1e | 5/5/-1.5/1 | 5/5/-1/1 | 0 | 0 | 0.5 | 0 | [page](https://divergentdiscs.com/product-tag/kapre/) | Kapre / visible labels / mold-local slash fallback |
| Gateway | Apex | 62e6d7efa845 | 12/6/-1/2 | 11.5/6/-1/1.5 | -0.5 | 0 | 0 | -0.5 | [page](https://gatewaydiscsports.com/products/apex-diamond) | Apex - Diamond / visible labels / mold-local slash fallback |
| Infinite Discs | Centurion | 93498283f1d5 | 7/5/-1/1.5 | 7/5/-1/2 | 0 | 0 | 0 | 0.5 | [page](https://infinitediscs.com/infinite-discs-centurion) | Infinite Discs Centurion / Infinite own brand: Manufacturer Flight Numbers block |
| MVP | Nomad | 3b2d2e555496 | 2/4/0/1 | 2/4/0/1.5 | 0 | 0 | 0 | 0.5 | [page](https://mvpdiscsports.com/discs/nomad/) | Nomad / MVP-family power meter |
| Mint Discs | Idol | f79387f2ecff | 13/5/-1/3 | 13/5/-1/2.5 | 0 | 0 | 0 | -0.5 | [page](https://mintdiscs.com/products/idol-apex-firm-ap-id01-25) | Idol - Apex Firm (AP-ID02-25) / primary product/collection description |

## Speed/glide differences (info only)

| Brand | Mold | Atlas S/G/T/F | Manufacturer S/G/T/F | ΔS | ΔG | Source |
|---|---|---|---|---:|---:|---|
| Axiom | Inspire | 6.5/4/-1.5/1 | 6.5/5/-1.5/1 | 0 | 1 | [page](https://axiomdiscs.com/discs/inspire/) |
| Discraft | Archer | 5/4/-4/1 | 7/4/-3/1 | 2 | 0 | [page](https://www.team.discraft.com/discs/archer) |
| Divergent Discs | Basilisk | 12/6/-4/1 | 13/6/-5/2 | 1 | 0 | [page](https://divergentdiscs.com/product/basilisk-max-grip/) |
| Divergent Discs | Lawin | 12/5/-3/2 | 12/6/-3/2 | 0 | 1 | [page](https://divergentdiscs.com/product-tag/lawin/) |
| Divergent Discs | Wyrm | 8/1/1/4 | 9/2/0/5 | 1 | 1 | [page](https://divergentdiscs.com/product-tag/wyrm/) |
| Gateway | Apex | 12/6/-1/2 | 11.5/6/-1/1.5 | -0.5 | 0 | [page](https://gatewaydiscsports.com/products/apex-diamond) |
| Gateway | Hybrid | 7/5/0/3 | 7/4/-0.5/2 | 0 | -1 | [page](https://gatewaydiscsports.com/collections/hybrid) |
| Gateway | Spirit | 12/4/0/4 | 11/4/0/4 | -1 | 0 | [page](https://gatewaydiscsports.com/collections/spirit) |
| Infinite Discs | Slab | 12/3/0/4 | 11/3/0/4 | -1 | 0 | [page](https://infinitediscs.com/infinite-discs-slab) |
| Lone Star Discs | Crockett | 13/5/-1/3 | 13/4/-1/3 | 0 | -1 | [page](https://www.lonestardiscs.com/products/crockett-distance-driver) |
| Lone Star Discs | Walker | 5/3/0/4 | 5/5/0/4 | 0 | 2 | [page](https://www.lonestardiscs.com/products/walker-midrange) |
| MVP | Anode | 3/3/0/0.5 | 2.5/3/0/0.5 | -0.5 | 0 | [page](https://mvpdiscsports.com/discs/anode/) |
| Mint Discs | Mustang | 5/5/0/2 | 5/4/0/2 | 0 | -1 | [page](https://mintdiscs.com/products/mustang-apex-plastic-ap-mt04-26) |
| Prodigy | D2 Pro | 13/5/-1/3 | 12/5/-1/3 | -1 | 0 | [page](https://prodigydisc.com/products/prodigy-d2-pro-750-plastic) |
| RPM | Pekapeka (DGFD2) | 9/5/-3/1 | 9/6/-3/1 | 0 | 1 | [page](https://www.rpmdiscs.com/product/pekapeka/) |
| Sacred Discs | Gnome | 2/3/0/1 | 2/2/0/1 | 0 | -1 | [page](https://sacreddiscs.com/products/gnome-putt-and-approach) |

## HTTP / JavaScript limits

Only ordinary HTTP HTML was read. Search snippets, community ratings, and third-party retailer numbers were not used. Missing pages, unreadable flight graphics, blocked fetches/searches, conflicting plastics, identity mismatches, and JS-only content remain manual.

No unresolved pages were positively identified as JS-rendered shells. Other parse failures are not assumed to require JavaScript.

## Brand coverage

| Brand | Attempted | Checked | Flagged | Unresolved | No Atlas baseline |
|---|---:|---:|---:|---:|---:|
| Above Ground Level | 17 | 4 | 0 | 13 | 0 |
| Alfa Discs | 5 | 5 | 1 | 0 | 0 |
| AquaFlight | 4 | 0 | 0 | 4 | 0 |
| Axiom | 16 | 14 | 1 | 2 | 0 |
| Bernoulli Disc Golf | 5 | 0 | 0 | 5 | 0 |
| Birdie | 4 | 0 | 0 | 4 | 0 |
| Clash Discs | 19 | 17 | 0 | 2 | 0 |
| Climo Disc Golf | 8 | 6 | 0 | 2 | 0 |
| Crosslap | 5 | 0 | 0 | 5 | 0 |
| DGA | 21 | 8 | 0 | 13 | 0 |
| Daredevil Discs | 21 | 17 | 0 | 4 | 0 |
| Discmania | 48 | 45 | 1 | 3 | 0 |
| Discraft | 64 | 2 | 1 | 62 | 0 |
| Disctroyer OÜ | 5 | 0 | 0 | 5 | 0 |
| Divergent Discs | 12 | 11 | 6 | 1 | 0 |
| Doomsday Discs | 33 | 24 | 0 | 9 | 0 |
| Dynamic Discs | 34 | 32 | 1 | 2 | 0 |
| EV-7 | 10 | 0 | 0 | 10 | 0 |
| Elevation Disc Golf | 11 | 0 | 0 | 11 | 0 |
| Finish Line | 9 | 0 | 0 | 9 | 0 |
| Gateway | 34 | 23 | 3 | 11 | 0 |
| Hooligan Discs | 6 | 6 | 0 | 0 | 0 |
| Infinite Discs | 28 | 28 | 1 | 0 | 0 |
| Innova | 85 | 56 | 1 | 29 | 0 |
| Innova Factory Store | 5 | 0 | 0 | 5 | 0 |
| Jester Disc Golf | 6 | 0 | 0 | 6 | 0 |
| Kastaplast | 17 | 12 | 0 | 5 | 0 |
| Latitude 64 | 48 | 27 | 0 | 21 | 0 |
| Legacy | 23 | 0 | 0 | 23 | 0 |
| Lightning | 4 | 0 | 0 | 4 | 0 |
| Lone Star Discs | 40 | 34 | 4 | 6 | 0 |
| Løft Discs | 6 | 0 | 0 | 6 | 0 |
| MVP | 33 | 30 | 1 | 3 | 0 |
| Millennium | 16 | 4 | 0 | 12 | 0 |
| Mint Discs | 18 | 11 | 1 | 7 | 0 |
| Neptune Discs  | 4 | 0 | 0 | 4 | 0 |
| Prodigy | 36 | 19 | 1 | 17 | 0 |
| Prodiscus | 22 | 0 | 0 | 22 | 0 |
| RPM | 10 | 7 | 0 | 3 | 0 |
| Sacred Discs | 5 | 4 | 0 | 1 | 0 |
| Stokely Discs | 7 | 0 | 0 | 7 | 0 |
| Storm | 5 | 0 | 0 | 5 | 0 |
| Streamline | 16 | 16 | 1 | 0 | 0 |
| Thought Space Athletics | 15 | 0 | 0 | 15 | 0 |
| Trash Panda Disc Golf | 5 | 3 | 0 | 2 | 0 |
| Vibram Disc Golf | 18 | 0 | 0 | 18 | 0 |
| Westside Discs | 28 | 28 | 0 | 0 | 0 |
| Wild Discs | 8 | 0 | 0 | 8 | 0 |
| Yikun | 21 | 0 | 0 | 21 | 0 |

## Unresolved — manual research

The linked URL is the last candidate attempted, **not a verified source**. Full URL attempts/reasons and parsed results are in `outputs/manufacturer-diff/results.json`.

| Brand | Mold | Catalog ID | Atlas S/G/T/F | Reason | Last candidate |
|---|---|---|---|---|---|
| Above Ground Level | Acacia | 34348c6743b2 | 2/4/0/1 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/acacia) |
| Above Ground Level | Baobab | b5dec5476cff | 4/0/1/3 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/baobab) |
| Above Ground Level | Beech | 64d178ead767 | 5/2/0/3 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/beech) |
| Above Ground Level | Cedar | 59e5308b7e35 | 11/5/0/3 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/cedar) |
| Above Ground Level | Cypress | 9da98b89ac6d | 12/5/-2/2 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/cypress) |
| Above Ground Level | Locust | dad184b1890a | 9/4/-1/3 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/locust) |
| Above Ground Level | Madrone | a0e7c489854a | 3/3/0/1 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/madrone) |
| Above Ground Level | Magnolia | c4ae6d5f06cb | 5/5/0/2 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/magnolia) |
| Above Ground Level | Manzanita | 7aab1385f2bc | 3/3/0/2 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/manzanita) |
| Above Ground Level | Ponderosa | ebb53ff16c24 | 3/4/-2/0 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/ponderosa) |
| Above Ground Level | Redwood | 36873060f71b | 12/5/-1/2 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://www.agldiscs.com/collections/redwood) |
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
| Birdie | Weapon | 5ad20d5684b0 | 8/5/0/2.5 | web search blocked/challenged; web search found no matching official URL | — |
| Clash Discs | Sage | c7099ea8671d | 12/6/-1/3 | web search blocked/challenged; web search found no matching official URL | — |
| Clash Discs | Wild Honey | 35b21ae0bfe4 | 12/5/-2/2 | web search blocked/challenged; web search found no matching official URL | — |
| Climo Disc Golf | Apogee | 235f96413781 | 12/5/-2/1 | HTTP 404; page identity does not match mold; web search HTTP 403; web search found no matching official URL | [page](https://climodiscgolf.com/products/climo-prototype-apogee) |
| Climo Disc Golf | Cliff  (CDG-0326-P) | 9ba354e30586 | 2/3/-1/0 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search HTTP 403; web search found no matching official URL | [page](https://climodiscgolf.com/products/5x-glow-cliff-franken-champ-2-3-1-0) |
| Crosslap | Credo | 39a82d6f8592 | 3/2/0/3 | web search HTTP 403; web search found no matching official URL | — |
| Crosslap | Lucky | 4811592f7923 | 5/5/-2/1 | web search HTTP 403; web search found no matching official URL | — |
| Crosslap | Openwater | 13f6d8c83459 | 12/4/-1.5/2 | web search HTTP 403; web search found no matching official URL | — |
| Crosslap | Shadowplay | f7a99a150b2c | 3/3/-2/0.5 | web search HTTP 403; web search found no matching official URL | — |
| Crosslap | Vigil | 00f95d2e86d0 | 8/6/-2/2 | web search HTTP 403; web search found no matching official URL | — |
| DGA | Aftershock | ee08094dd751 | 5/4/0/2 | HTTP 404; page identity does not match mold; web search HTTP 403; web search found no matching official URL | [page](https://store.discgolf.com/products/2026-cole-redalen-tour-series-aftershock) |
| DGA | Blowfly II | d4af165dc663 | 2/2/0/2 | HTTP 404; web search HTTP 403; web search found no matching official URL | [page](https://discgolf.com/blowfly-ii/) |
| DGA | Gumbputt | 1c2e8f951769 | 2/2/0/2 | HTTP 404; web search HTTP 403; web search found no matching official URL | [page](https://discgolf.com/gumbputt/) |
| DGA | Hellfire | 76cf5f3d087d | 10/3/0/5 | HTTP 404; web search HTTP 403; web search found no matching official URL | [page](https://discgolf.com/hellfire/) |
| DGA | Hurricane X | 44573e5c0734 | 13/5/0/3 | HTTP 404; page identity does not match mold; web search HTTP 403; web search found no matching official URL | [page](https://store.discgolf.com/products/first-flight-le-hurricane-x-distance-driver) |
| DGA | Reef (Atlantis) | 0563b7aa01e5 | 2/2/-1/1 | HTTP 404; web search HTTP 403; web search found no matching official URL | [page](https://discgolf.com/reef/) |
| DGA | Rift | 7fe0ab3983ec | 5/4/-1/1.5 | HTTP 404; page identity does not match mold; web search HTTP 403; web search found no matching official URL | [page](https://store.discgolf.com/products/catrina-allen-sp-line-rift-midrange-cat-logo-2024-copy) |
| DGA | Shockwave | f2a63a7ee0fb | 4/2/0/3 | HTTP 404; web search HTTP 403; web search found no matching official URL | [page](https://discgolf.com/shockwave/) |
| DGA | Sonar | fd25b7a7ac22 | 3/4/0/2 | HTTP 404; page identity does not match mold; web search HTTP 403; web search found no matching official URL | [page](https://store.discgolf.com/products/atmos-sonar-putt-approach) |
| DGA | Tempest | 6a964282d2b4 | 13/5/-3/2 | HTTP 404; web search HTTP 403; web search found no matching official URL | [page](https://discgolf.com/tempest/) |
| DGA | Torrent | 32af7a254fb0 | 14/5/-1/2 | HTTP 404; web search HTTP 403; web search found no matching official URL | [page](https://discgolf.com/torrent/) |
| DGA | Typhoon (renamed from DGA202408) | 883bc9d046ba | 12/6/-2/2 | HTTP 404; page identity does not match mold; web search HTTP 403; web search found no matching official URL | [page](https://store.discgolf.com/products/catrina-allen-atmos-typhoon-distance-driver) |
| DGA | Vortex | 398b6100612c | 7/6/-2/1 | HTTP 404; page identity does not match mold; web search HTTP 403; web search found no matching official URL | [page](https://store.discgolf.com/products/cloud-spark-vortex-lightweight-fairway-driver) |
| Daredevil Discs | Beaver | 4f4144cb6f54 | 2/3/-1/1 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://daredevildiscs.com/product/beaver/) |
| Daredevil Discs | Great Horned Owl | 29c662d0ea34 | 2/3/0/1 | HTTP 404; web search blocked/challenged; web search found no matching official URL | [page](https://daredevildiscs.com/product/great-horned-owl/) |
| Daredevil Discs | Hellbender | 38eb400c9fbf | 4/4/0/2 | page identity does not match mold; web search Remote end closed connection without response; web search found no matching official URL | [page](https://daredevildiscs.com/product/hellbender-salamander/) |
| Daredevil Discs | Swift Fox | ece9a222f549 | 7/5/-3/1 | HTTP 404; web search &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://daredevildiscs.com/product/swift-fox/) |
| Discmania | Cloudbreaker | a68e603b86fb | 12/5/-1/3 | HTTP 404; web search &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.discmania.net/collections/cloudbreaker) |
| Discmania | New MD1 | 8b061e21ed26 | 5/6/0/0 | page identity does not match mold; HTTP 404; web search &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.discmania.net/collections/new-md1) |
| Discmania | Premier Cloudbreaker | 58e4e2b13ed4 | 12/5/0/3 | HTTP 404; web search &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.discmania.net/collections/premier-cloudbreaker) |
| Discraft | Ares (PM-0226-D) (renamed from Zeus 2.0) | 1b456425771e | 12/6/-1/2 | HTTP 429; host unreachable after three HTTP attempts: Remote end closed connection without response; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.discraft.com/disc-golf/paul-mcbeth-first-run-esp-ares-frmcbethares?returnurl=%2fdisc-golf%2f) |
| Discraft | Athena | 68d64ed1b6a3 | 7/5/0/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); host unreachable after three HTTP attempts: Remote end closed connection without response; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.discraft.com/disc-golf/paul-mcbeth-fly-dye-z-athena-mcbethfdzathena?returnurl=%2fdisc-golf%2f) |
| Discraft | Banger-GT | ff0b51fdb61e | 2/3/0/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/banger-gt) |
| Discraft | Buzzz OS | 482b2fd2724e | 5/4/0/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/buzzz-os) |
| Discraft | Buzzz-GT | 3dcc0b3ea2b6 | 5/5/0/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/buzzz-gt) |
| Discraft | Buzzz-SS | 8ee24bd0899f | 5/4/-2/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/buzzz-ss) |
| Discraft | Captain's Caliber (DIS-0426-P) | d52158a41efd | 4/4/0/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/captain-s-caliber) |
| Discraft | Captain's Raptor (modified overstable Raptor) | e766b23042b3 | 9/3/1/4 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/captain-s-raptor) |
| Discraft | Captain's Thrasher (modified overstable Thrasher) | 819f586f92d3 | 12/5/0/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/captain-s-thrasher) |
| Discraft | Challenger SS | cb6398daf646 | 2/3/-1/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/challenger-ss) |
| Discraft | Cicada | acea1b7d9cc6 | 7/6/-1/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/cicada) |
| Discraft | Cigarra (modified overstable Cicada) | 86cca3bb507c | 7/6/-1/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); host unreachable after three HTTP attempts: Remote end closed connection without response; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/cigarra) |
| Discraft | Crank SS | 8ea3cc0a7f94 | 13/5/-3/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/crank-ss) |
| Discraft | Crush | a503716cbffb | 11/5/0/4 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/crush) |
| Discraft | Drive | 535643d0c347 | 11/5/-1/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/drive) |
| Discraft | Drone | 8a784210746c | 5/3/1/4 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/drone) |
| Discraft | Flash | 36e871a923b2 | 10/5/-2/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/flash) |
| Discraft | Flick | 73f935d5fadb | 12/3/1/5 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/flick) |
| Discraft | Focus (Ace Race 2009) | 1b4636b6c905 | 2/2/-1/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/focus) |
| Discraft | Fossil (RW-1025-P) | b1c6c2018ccc | 3/1/0/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/fossil) |
| Discraft | Glide (Ace Race 2004) | af12d4978dc3 | 6/5/-3/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/glide) |
| Discraft | Hallux (RW-0925-D) | 5ee0af6eceaa | 10/5/0/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/hallux) |
| Discraft | Heat (Ace Race 2014) | 2fd68923dd2b | 9/6/-3/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/heat) |
| Discraft | Hornet (Ace Race 2010) | 0237447f54d7 | 5/5/0/4 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/hornet) |
| Discraft | Impact (Ace Race 2007) | f0757dd1a3f9 | 6/6/-3/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/impact) |
| Discraft | Joy  (PP-1025-M) | fd9301dc99ae | 4/5/-1/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/joy) |
| Discraft | Kratos | 73f18c517d47 | 3/3/0/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/kratos) |
| Discraft | Malita (PM-0725-M) | d28c376c3a93 | 5/5/-1/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/malita) |
| Discraft | Malta (Paul McBeth Proto Mid-Range) | 8fc70b7fac9a | 5/4/1/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/malta) |
| Discraft | Mantis (Ace Race 2013) | f4e02f8690a1 | 8/4/-2/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/mantis) |
| Discraft | Meteor (Ace Race 2006) | 6693f1eff37c | 5/5/-3/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/meteor) |
| Discraft | Nebula (Ace Race 2008) | 520800c74e2d | 5/4/-0.5/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/nebula) |
| Discraft | Nuke SS | e76b8f647d6d | 13/5/-3/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/nuke-ss) |
| Discraft | Pulse | 35007aee9bca | 11/4/0/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/pulse) |
| Discraft | Punisher | c2b452e9045d | 12/5/0/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/punisher) |
| Discraft | Reaper | c5849a139715 | 8/3/0/4 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/reaper) |
| Discraft | Ringer | e2eede045eed | 4/4/0/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/ringer) |
| Discraft | Ringer GT | 9b7d6228abf7 | 4/4/0/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/ringer-gt) |
| Discraft | Roach (Ace Race 2015) | 84e1e2fa5655 | 2/4/0/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/roach) |
| Discraft | Scorch   | 819b7c057af8 | 11/6/-2/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/scorch) |
| Discraft | Sled (DIS-0126-P) | caaec70f020f | 3/2/-1/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/sled) |
| Discraft | SoL (Ace Race 2018) | 0e63ffe29c12 | 4/5/-3/0 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/sol) |
| Discraft | Spectra | d6df6dda5fc9 | 12/5/-2/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/spectra) |
| Discraft | Sting (Ace Race 2017) | 3f9addcba071 | 7/5/-2/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/sting) |
| Discraft | Stratus | a434851c56c3 | 5/4/-4/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/stratus) |
| Discraft | Surge-SS | 55f31e3ac7bb | 11/5/-2/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/surge-ss) |
| Discraft | Swarm | 8769ec70b5ad | 5/3/0/4 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); host unreachable after three HTTP attempts: Remote end closed connection without response; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.discraft.com/disc-golf/full-foil-supercolor-buzzz-swarm-ffbuzzz.swarm?returnurl=%2fdisc-golf%2f) |
| Discraft | Terminator (DIS-0226-D) | 401181be74f0 | 12/5/-1/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/terminator) |
| Discraft | Tracker | b5902835de8f | 8/5/-1/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/tracker) |
| Discraft | UltraLuna (PM-1025-P) | 0ffa1d7af927 | 3/4/0/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/ultraluna) |
| Discraft | Venom (retooled) | f69a2d3bb610 | 13/5/0/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/venom) |
| Discraft | Wasp | 56f772ae3de5 | 5/3/0/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/wasp) |
| Discraft | Wildcat | 1b41ce3dae8a | 11/5/-2/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/wildcat) |
| Discraft | XL | e7246744eae5 | 7/4/-2/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/xl) |
| Discraft | XS | 241b4355c5e6 | 8/5/0/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/xs) |
| Discraft | Xpress | 55c4dedb8124 | 8/5/-3/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/xpress) |
| Discraft | Xtreme | a4fe09b047da | 6/3/1/4 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/xtreme) |
| Discraft | Zeppelin (Ace Race 2011) | 1e7bb91c200b | 2.5/6/-1/0 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/zeppelin) |
| Discraft | Zombee (Ace Race 2012) | 71fd543c562a | 6/4/-1/1 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/zombee) |
| Discraft | Zone GT (Banger Top) | 4a6dfb045c65 | 4/3/0/3 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/zone-gt) |
| Discraft | Zone OS | 365a8fed0594 | 4/2/1/5 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/zone-os) |
| Discraft | Zone SS (DIS-0725-P) | 49d84f3e0be5 | 4/4/-1/2 | HTTP 429: host rate-limited; skipped for remainder of run (Retry-After: unspecified); web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.team.discraft.com/discs/zone-ss) |
| Disctroyer OÜ | Nightjar (Öösorr) | 58651f4a7e3a | 10/5/-0.5/2.5 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Disctroyer OÜ | Skylark (Lõoke) | f5324ab5c3c9 | 5/4/0/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Disctroyer OÜ | Sparrow (Varblane) | 46d5eae2f276 | 3/3/0/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Disctroyer OÜ | Starling (Kuldnokk) | be7cc3f68c81 | 13/5/-2/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Disctroyer OÜ | Stork (Toonekurg) | a03bdc7f430d | 8/5/0/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Divergent Discs | Kataw | c14e1889fa39 | 5/4/0/3 | page identity does not match mold; parse failed: no complete flight-number set in model content; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://divergentdiscs.com/product-tag/kataw/) |
| Doomsday Discs | Abomination | 857d293853f4 | 9/5/-3/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://doomsdaydiscs.com/products/abomination-in-glow-isolation-plastic) |
| Doomsday Discs | Blight | cbbedb6bb7da | 3/3/0/2 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://doomsdaydiscs.com/products/blight-in-ration-plastic) |
| Doomsday Discs | Cyber Putter | 3bd3e67941ba | 3/3/0/2 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://doomsdaydiscs.com/products/cyber-putter-in-survival-plastic) |
| Doomsday Discs | Dread | 1ed6b9dbb11c | 2/4/0/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://doomsdaydiscs.com/products/dread-in-ration-plastic) |
| Doomsday Discs | Dystopia | e4f6d63c6713 | 10/5/-2/2 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://doomsdaydiscs.com/products/dystopia-in-glow-isolation-plastic) |
| Doomsday Discs | Famine | f5ef85ad382b | 12/5/-2/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://doomsdaydiscs.com/products/famine-in-radioactive-waste-plastic) |
| Doomsday Discs | Monstrosity | 77fccd2f8af5 | 7/5/-3/2 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://doomsdaydiscs.com/products/monstrosity-in-isolation-glow-plastic) |
| Doomsday Discs | Oblivion | ad0084c40b5e | 12/4/-1/3 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://doomsdaydiscs.com/products/fear-pack-2025-three-masked-drivers-oblivion-plague-famine) |
| Doomsday Discs | Psyop | cc937e956f50 | 9/4/-2/3 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://doomsdaydiscs.com/products/psyop-in-retina-glow-plastic) |
| Dynamic Discs | Sockibomb Felon | 1526636d1f7f | 9/4/0.5/4 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.dynamicdiscs.com/) |
| Dynamic Discs | Sockibomb Slammer | 0d67566bd210 | 3/1/0.5/4 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.dynamicdiscs.com/) |
| EV-7 | Ethos | 699cc598887f | 5/4/0/2 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.ev-7discgolf.com/products/og-premium-ethos) |
| EV-7 | Kairos  | 5c5b711de453 | 12/5/-1/3 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.ev-7discgolf.com/products/og-premium-kairos) |
| EV-7 | Mobius  | 787485b6654a | 2/4/-1/0 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.ev-7discgolf.com/products/og-premium-mobius) |
| EV-7 | Ouro Boros  | 269bfde889c6 | 4/3/0/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| EV-7 | Penrose  | 549b5f98da67 | 2/4/0/2 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.ev-7discgolf.com/products/og-premium-penrose) |
| EV-7 | Phi | 49dd8a02cae7 | 3/4/0/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.ev-7discgolf.com/products/og-premium-phi) |
| EV-7 | Protos  | cb8d9f060c21 | 8/6/-3/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.ev-7discgolf.com/products/og-premium-protos) |
| EV-7 | Telos  | 584540890613 | 2/4/0/1.5 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.ev-7discgolf.com/products/og-premium-telos) |
| EV-7 | Yang | 39833bae3a8d | 1/2/0/2 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.ev-7discgolf.com/products/og-premium-yang) |
| EV-7 | Yin | 4a24a417d379 | 1/4/0/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.ev-7discgolf.com/products/og-premium-yin) |
| Elevation Disc Golf | Arowana | ff121249e609 | 3/3/-1/2 | HTTP 404; web search &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://elevationdiscs.com/collections/arowana) |
| Elevation Disc Golf | Binx | 671bfd12f9c4 | 8/5/0/1 | HTTP 404; web search &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://elevationdiscs.com/collections/binx) |
| Elevation Disc Golf | Capybara | a4a1f88e3661 | 5/5/-2/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://elevationdiscs.com/collections/capybara) |
| Elevation Disc Golf | Gecko | 1dc74cf05258 | 9/4/0/3.5 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://elevationdiscs.com/collections/gecko) |
| Elevation Disc Golf | Groundhog | f5afd346c2b0 | 1/1/0/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://elevationdiscs.com/collections/groundhog) |
| Elevation Disc Golf | Interceptor | 044331ae1e0c | 5/3/0/3 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://elevationdiscs.com/collections/interceptor) |
| Elevation Disc Golf | Koi | 8e8bacd8ece3 | 3/4/-2/0 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://elevationdiscs.com/collections/koi) |
| Elevation Disc Golf | Nimbus | 8ca9bd3b1459 | 5/5/0/1.5 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://elevationdiscs.com/collections/nimbus) |
| Elevation Disc Golf | Psychic | c7903444dbda | 12/5/-1/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://elevationdiscs.com/collections/psychic) |
| Elevation Disc Golf | Screech | b28d5ad6a747 | 4/2/0/4 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://elevationdiscs.com/collections/screech) |
| Elevation Disc Golf | Uktena | 927964129623 | 11/5/-2/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://elevationdiscs.com/collections/uktena) |
| Finish Line | Chicane | ab7ace5241d4 | 4/3/0/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Finish Line | Daytona | a41b012783a2 | 12/4/0/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Finish Line | Era | 034170d68e3b | 10/5/-1/1.5 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Finish Line | Interval | 4e07ea1c17a0 | 12/5/-1/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Finish Line | Pace | 540544fa755d | 2/4/0/1.5 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Finish Line | Rally | f7df29e65550 | 8/5/-1/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Finish Line | Sector | 5740a80857f3 | 5/4/0/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Finish Line | Supra | c408d1d75f7e | 5/5/0/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Finish Line | Torque | 4f3034a614af | 8/4/0/2.5 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Gateway | Apache (retooled) | 3c80c062a03d | 10/6/0/2 | approval/version-specific mold; current-page identity needs manual review | [page](https://gatewaydiscsports.com/collections/apache) |
| Gateway | Demon | 967908980e2b | 6/3/0/4 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://gatewaydiscsports.com/collections/demon) |
| Gateway | G-ONE | 28f3f1fef58a | 12/6/-2/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://gatewaydiscsports.com/collections/g-one) |
| Gateway | Javelin | 316e31902fd6 | 13/5/0/3 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://gatewaydiscsports.com/products/elijah-bickel-javelin-nxt-g-2026) |
| Gateway | Karma | 216980c4c838 | 7/5/-1/2 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://gatewaydiscsports.com/products/jon-borzicks-nxt-karma) |
| Gateway | Ninja | f23a702ea19a | 10/6/-1/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://gatewaydiscsports.com/collections/ninja) |
| Gateway | Samurai | 2612c61c1609 | 12/5/-1.5/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://gatewaydiscsports.com/collections/samurai) |
| Gateway | Siren | 9453164bb302 | 13/5/-2/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://gatewaydiscsports.com/collections/siren) |
| Gateway | Slayer | 5a3bba3b7d14 | 13/5/-1/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://gatewaydiscsports.com/collections/slayer) |
| Gateway | Wand | c2576b43e41c | 1/7/0/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://gatewaydiscsports.com/collections/wand) |
| Gateway | Witch Doctor | e8b5faa77cb3 | 3/4/0/2.5 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://gatewaydiscsports.com/products/witch-doctor-suregrip-firm) |
| Innova | Ace | b4900a47f355 | 2/3/-2/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/ace/) |
| Innova | Aviar 3 | 88d348b10ccf | 3/2/0/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/aviar-3/) |
| Innova | Bulldog | 294af4dd19b5 | 4/3/0/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/bulldog/) |
| Innova | Classic Roc | aa882a7b105d | 3/3/0/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/classic-roc/) |
| Innova | Commander | 3f6abfdca3b3 | 5/3/0/4 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/commander/) |
| Innova | Condor | f72eef37841b | 3/4/0/2 | parse failed: no complete flight-number set in model content; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/condor/) |
| Innova | Coupe | fc1ba93d31a1 | 2/3/-1/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/coupe/) |
| Innova | Croc | 7c6ed270e51b | 5.5/2/0/5 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/croc/) |
| Innova | Gargoyle | c4db38347982 | 6/3/-1/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/gargoyle/) |
| Innova | Grenade | 7f9ca6a203fe | 7/5/-2/3 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/grenade/) |
| Innova | Griffin | 707f0503251f | 5/3/1/3 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/griffin/) |
| Innova | Hawg | 0d335d27193e | 2/1/0/3.5 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/hawg/) |
| Innova | Juggernaut | 9e05f277dbd3 | 12/4/1/4 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/juggernaut/) |
| Innova | Leopard 3 | f95c107f4dd7 | 7/5/-2/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/leopard-3/) |
| Innova | Lycan | 1a4145f49a66 | 4/5/0/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/lycan/) |
| Innova | Makani | 4696b5e837df | 2/7/-2/0 | parse failed: no complete flight-number set in model content; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/makani/) |
| Innova | Pegasus | d5074f342c62 | 7/4/-1/3 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/pegasus/) |
| Innova | Pole Cat | 71097e045067 | 1/3/0/0 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/pole-cat/) |
| Innova | Python | 6f549f0a6ff5 | 7/3/-1/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/python/) |
| Innova | Ram | fe3fc96b3aad | 6/4/1/4 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/ram/) |
| Innova | Raven | bd3f01843c32 | 6/4/-2/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/raven/) |
| Innova | Rhyno X | 3c3314edeb4f | 2/1/0/4 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/rhyno-x/) |
| Innova | Roc 3 | 5101421dd2dc | 5/4/0/3 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/roc-3/) |
| Innova | Shark 3 | 800f2784d0e0 | 5/4/0/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/shark-3/) |
| Innova | Starfire L (SL) | fa0d76ae4d9f | 10/5/-1/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/starfire-l/) |
| Innova | TL 3 | 829724f29664 | 8/4/-1/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/tl-3/) |
| Innova | Tee-Rex | b4084f416e33 | 11/4/0/4 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/tee-rex/) |
| Innova | Warhog | 346301eb9f76 | 3/3/0/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/warhog/) |
| Innova | Zephyr | 6a5aedb3f642 | 2/3/0/0 | parse failed: no complete flight-number set in model content; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/zephyr/) |
| Innova Factory Store | Fairway Disc | f3e8d6a34360 | 7/6/-1/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/fairway-disc/) |
| Innova Factory Store | Khan | 8a7c457d68eb | 2/3/0/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/khan/) |
| Innova Factory Store | MID-DISC3 | 494cfe8ba87a | 5/5/0/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/mid-disc3/) |
| Innova Factory Store | Power Disc | 4834b593c71e | 10/4/0/3 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/power-disc/) |
| Innova Factory Store | Power Disc2 | 6ef5f3119643 | 12/4/0/4 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.innovadiscs.com/disc/power-disc2/) |
| Jester Disc Golf | Crazy Hawk (Ukko) | f2eac84e7da4 | 9/4/0/3.5 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Jester Disc Golf | Cryptid | 043d9297a99c | 7/3/-3/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Jester Disc Golf | Dream Weaver | 295e42a7a18f | 7/5/-1/1.5 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Jester Disc Golf | Love | 908ad210808d | 2/3/0/1 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://jesterdiscgolf.com/product/touchplastic/) |
| Jester Disc Golf | Peace Train | 66346e744cdc | 5/4/-2/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Jester Disc Golf | Wild Thing | ee3a132c3421 | 3/3/0/2.5 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Kastaplast | Gadd | b8fc993c5a82 | 5/5/0/2 | page identity does not match mold; parse failed: no complete flight-number set in model content; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.kastaplast.com/en-us/collections/gadd) |
| Kastaplast | Idog | f0936d104a38 | 7/5/-0.5/2 | parse failed: no complete flight-number set in model content; &lt;urlopen error _ssl.c:993: The handshake operation timed out&gt;; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.kastaplast.com/en-us/products/k1-hard-idog-jesse-nieminen-tour-series-2026) |
| Kastaplast | Kaxe (retooled) | ff72472c347d | 6/5/0/2 | approval/version-specific mold; current-page identity needs manual review | [page](https://www.kastaplast.com/en-us/collections/kaxe) |
| Kastaplast | Kaxe Z | dd4abfc38f94 | 6/5/0/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://kastaplast.com/collections/kaxe-z) |
| Kastaplast | Sten | 343fc9886d23 | 1/1/0/2 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.kastaplast.com/en-us/collections/sten) |
| Latitude 64 | Blitz | 055dcc4c293e | 11/3/0/4 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/blitz) |
| Latitude 64 | Bryce | cf8234d58dcc | 9/6/-2/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/bryce) |
| Latitude 64 | Caltrop | 61eea6e6dd3e | 2/2/0/2 | page identity does not match mold; HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/products/zero-medium-caltrop-special-edition) |
| Latitude 64 | Cutlass | e5d1848cde90 | 13/5/0/3.5 | page identity does not match mold; HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/cutlass) |
| Latitude 64 | Falchion | ce7c360fe52b | 8/5/-1/2 | page identity does not match mold; HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/falchion) |
| Latitude 64 | Fuji | e33ae1bb9521 | 4/4/0/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/fuji) |
| Latitude 64 | Gobi | 47d22f6f40dc | 6/5/-0.5/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/gobi) |
| Latitude 64 | Knight | acdb5512e9d0 | 14/4/-1.5/3 | page identity does not match mold; HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/knight) |
| Latitude 64 | Mace | 3f1d8f914eb7 | 5/5/0/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/mace) |
| Latitude 64 | Medius | 9889cd43770d | 5/5/-1/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/medius) |
| Latitude 64 | Missilen | fdcee3b7ff81 | 15/3/-0.5/4.5 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/missilen) |
| Latitude 64 | Pain | f9740db53623 | 4/4/0/3 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/pain) |
| Latitude 64 | Raketen | 2046cb24bc34 | 15/4/-2/3 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/products/opto-hex-raketen-special-edition) |
| Latitude 64 | Recoil | 20ea8c680ecb | 12/4/0/3 | page identity does not match mold; HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/recoil) |
| Latitude 64 | Riot | c90299d40948 | 11/4/-1/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/riot) |
| Latitude 64 | River Pro | c0fc0e22b52b | 6/5/0/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/river-pro) |
| Latitude 64 | Sarek | 03a1323bf659 | 2/4/0/1.5 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/sarek) |
| Latitude 64 | Scythe | 7f1e85dd2cd4 | 12/3/0/4 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/scythe) |
| Latitude 64 | Spark | 0a1557be2144 | 7/4/-0.5/3 | page identity does not match mold; HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/spark) |
| Latitude 64 | Villain | 0cbc83532eaf | 12/4/0/4 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/villain) |
| Latitude 64 | Zion | f76f3789bc0f | 9/4/-0.5/3 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://latitude64.com/collections/zion) |
| Legacy | Aftermath | 61dc333ce3d6 | 13/5/-2/3 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/aftermath-5/) |
| Legacy | Badger | 2186a64f676d | 6/3/0/4 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/badger/) |
| Legacy | Bandit | d8f655e110f9 | 9/5/-2/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/bandit-2/) |
| Legacy | Cannon | 339026e71c12 | 14/5/-3/3 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/cannon-2/) |
| Legacy | Clozer | 65caf02ff85a | 2/3/0/2 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/clozer-2/) |
| Legacy | Clutch | 0626db376967 | 2/3/0/1 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/clutch-2/) |
| Legacy | Enemy | 40b1969411e6 | 9/3/0/4 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/enemy-2/) |
| Legacy | Fighter | 0d1f049e2cc1 | 10/3/0/5 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/fighter-2/) |
| Legacy | Ghost | 822c3797472e | 4/5/0/3 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/ghost/) |
| Legacy | Hunter | 95945d17e31c | 2/3.5/0/0 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/hunter/) |
| Legacy | Mongoose | 8b9a1e5f1923 | 9/5/-3/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/mongoose-2/) |
| Legacy | Nemesis | 7d2969994ebd | 10/6/-4/2 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/nemesis/) |
| Legacy | Outlaw | 3edb058dfa95 | 12/5/-1/3 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/outlaw-2/) |
| Legacy | Patriot | aa8c833e716d | 7/5/-2/1 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/patriot/) |
| Legacy | Phenom | f3cf3dbdf0d0 | 8/5/-1/2 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/blog-phenom_stachnick/) |
| Legacy | Pursuit | 93aaaeb4cc43 | 5/3/0/3 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/pursuit-2/) |
| Legacy | Rampage | 34cc1426d8d7 | 14/5/-1/4 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/rampage/) |
| Legacy | Rebel | aa8b915eecd6 | 2/3/0/3 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/rebel/) |
| Legacy | Recluse | edf5044c830b | 5/3/0/4 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/recluse-2/) |
| Legacy | Rival | 53deb8df1589 | 7/5/0/2 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/rival/) |
| Legacy | Sumo | f05e05275a56 | 4/2/0/4 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/discs/sumo/) |
| Legacy | Valor | 901284196160 | 5/5/0/2 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/valor/) |
| Legacy | Vengeance | 8440f5b038e2 | 10/6/0/2 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://legacydiscs.com/vengeance/) |
| Lightning | #1 Flyer | 9f02fa8bfae6 | 8/5/-2/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Lightning | #1 Helix | 12522c3aef2a | 8/4/-1/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Lightning | #1 Hookshot | 061e80ecd3a0 | 6/4/0/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Lightning | #1 Hyzer | c5a23f120fcd | 7/3/0/4 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Lone Star Discs | Horny Toad | c6c26f7cabad | 4/3/0/3 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.lonestardiscs.com/collections/horny-toad) |
| Lone Star Discs | Jack Rabbit | 04f85de80db9 | 3/3/0/3 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.lonestardiscs.com/collections/jack-rabbit) |
| Lone Star Discs | Mad Cat | 44a2873cdf08 | 9/5/0/2 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.lonestardiscs.com/products/el-gato-loco-mad-cat-fairway-driver-9005) |
| Lone Star Discs | Prickly Pear | d67cd97bad6a | 3/3/-1/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.lonestardiscs.com/collections/prickly-pear) |
| Lone Star Discs | The Dome | 66bf69cb28eb | 8/6/-3/1 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.lonestardiscs.com/products/the-dome-fairway-driver) |
| Lone Star Discs | Trinity | 315195552ecd | 7/5/0/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.lonestardiscs.com/collections/trinity) |
| Løft Discs | Bohrium | 9d3a2fb99e84 | 14/6/-1/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Løft Discs | Hydrogen | 5a6e6a63ddc2 | 1/2/0/0 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Løft Discs | Neon | 59dd9e9d2618 | 3/1/0/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Løft Discs | Silicon | 1fcc19718177 | 5/4/0/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Løft Discs | Titanium | 1fc158f8229a | 7/5/-2/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Løft Discs | Xenon | d491b94daa8d | 9/3/0/4 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| MVP | Atom | 2874ef188913 | 3/3/-0.5/0 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://mvpdiscsports.com/discs/feed/atom/) |
| MVP | Beam | 1548a809e633 | 1/1/0/0 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://mvpdiscsports.com/discs/beam/) |
| MVP | Cypher | 45f7be1edb59 | 7/5/-3/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://mvpdiscsports.com/discs/cypher/) |
| Millennium |  ES1 | e52df0457e51 | 11/5/-2/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.golfdisc.com/disc-golf-discs/es1/) |
| Millennium | Aquarius | a3fd8f842f00 | 8/5/-3/2 | parse failed: no complete flight-number set in model content; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.golfdisc.com/discs/aquarius/) |
| Millennium | Mars Rover (renamed from Rover) | 2124a6f66d83 | 5/6/-4/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.golfdisc.com/disc-golf-discs/mars-rover/) |
| Millennium | Moab | 46aca93e91e0 | 6/4/1/5 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.golfdisc.com/discs/moab/) |
| Millennium | Mortar | 26c56624a17e | 5/2/0/3 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.golfdisc.com/discs/mortar/) |
| Millennium | Omega4  | c12289dd0f64 | 2/3/0/1 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.golfdisc.com/disc-golf-discs/omega4/) |
| Millennium | Polaris LS | 18d5d9bd3a8c | 6/4/-1/1 | parse failed: no complete flight-number set in model content; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.golfdisc.com/discs/polaris-ls/) |
| Millennium | Sabot | 8918bd6c4e9c | 11/4/0/5 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.golfdisc.com/discs/sabot/) |
| Millennium | Scorpius | fbe04bb92fbc | 12/5/-1/3 | parse failed: no complete flight-number set in model content; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.golfdisc.com/discs/scorpius/) |
| Millennium | Sentinel MF | 2d3dc1c14cca | 5/4/0/4 | parse failed: no complete flight-number set in model content; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.golfdisc.com/discs/sentinel-mf/) |
| Millennium | Vela | 64bcf14aff40 | 7/4/-1.5/2 | conflicting flight numbers/plastics on manufacturer page | [page](https://www.golfdisc.com/discs/vela/) |
| Millennium | Zodiac (renamed from ES2) | 3db60b49a1e7 | 10/6/-1/2 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.golfdisc.com/news/millenniums-new-zodiac-power-driver-10-6-1-2-debuts-at-lvc-pre-orders-available-soon/) |
| Mint Discs | Alpha | 379511c22366 | 8/4/0/2 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://mintdiscs.com/products/phoenix-eternal-plastic-et-px01-23) |
| Mint Discs | Bullet | 971258da03e2 | 2/4/0/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://mintdiscs.com/products/phoenix-eternal-plastic-et-px01-23) |
| Mint Discs | Diamondback | 12a448b303a8 | 9/5/-2/2 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://mintdiscs.com/products/diamondback-unisex-polyester-t-shirt-by-zamdesign) |
| Mint Discs | Lobster | 77b1d561c58f | 5/5/-3/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search blocked/challenged; web search found no matching official URL | [page](https://mintdiscs.com/products/phoenix-eternal-plastic-et-px01-23) |
| Mint Discs | Longhorn | d1ff2573467f | 11/4/-1/2.5 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://mintdiscs.com/products/ian-hovey-memorial-shirt) |
| Mint Discs | Profit | 2c09a556cc68 | 2/3/0/2 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://mintdiscs.com/products/phoenix-eternal-plastic-et-px01-23) |
| Mint Discs | Salamander | 5326c260412a | 6/6/-2/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://mintdiscs.com/products/the-shredder-salamander-drop-ship-unisex-polyester-t-shirt) |
| Neptune Discs  | Marlin | 42da88440675 | 7/5/-4/1 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://neptunediscs.com/products/pearl-marlin-stock-stamp) |
| Neptune Discs  | Nautilus | c781861c22be | 5/5/0/2 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://neptunediscs.com/products/pearl-nautilus-stock-stamp) |
| Neptune Discs  | Splash | 36051e2cec4c | 3/3/0/1 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://neptunediscs.com/products/pearl-splash) |
| Neptune Discs  | Squid | 915d5c1f76dc | 11/5/-1/2 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://neptunediscs.com/products/triton-squid-stock-stamp-2nd-run) |
| Prodigy | D Model OS | af9144d9c70a | 13/5/0/4 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodigydisc.com/products/ace-line-d-model-os-duraflex-glow-plastic) |
| Prodigy | D Model US | de53d3ad259f | 13/6/-3/1 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodigydisc.com/products/ace-line-d-model-us-duraflex-glow-plastic) |
| Prodigy | D1 Max | b039996a8874 | 13/5/-1/3 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.prodigydisc.com/collections/d1-max) |
| Prodigy | D2 Max | 522293146949 | 13/5/-1/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.prodigydisc.com/collections/d2-max) |
| Prodigy | D2 Signature (Falcor) | e0ccc960a21a | 13/6/-1/2.5 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.prodigydisc.com/collections/d2-signature) |
| Prodigy | D3 Max | b267606b1617 | 13/5/-2/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.prodigydisc.com/collections/d3-max) |
| Prodigy | D4 Max | 67926f36f9cf | 13/5/-3/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.prodigydisc.com/collections/d4-max) |
| Prodigy | F Model OS | 782a488f54fa | 10/5/2/4 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodigydisc.com/products/ace-line-f-model-os-duraflex-glow-plastic) |
| Prodigy | F Model US | 5c3a4d6099ee | 10/5/-2/1 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodigydisc.com/products/ace-line-f-model-us-duraflex-glow-plastic) |
| Prodigy | M Model S | 0a147f859c11 | 6/4/0/3 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodigydisc.com/products/ace-line-m-model-s-basegrip-plastic-bird-uv) |
| Prodigy | M Model US | f35749b17848 | 4/5/-1/1 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodigydisc.com/products/ace-line-m-model-us-duraflex-glow-plastic) |
| Prodigy | PA1 | 6d7a343f6bb4 | 3/3/0/2.5 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodigydisc.com/products/prodigy-pa1-350g-plastic) |
| Prodigy | Pivot | bc24caddb827 | 3/4/0/0.5 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodigydisc.com/products/prodigy-pivot-400-glimmer-seraphim-stamp) |
| Prodigy | Shadowfax | 62a9a8df3299 | 9/5/-1/2.5 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.prodigydisc.com/collections/shadowfax) |
| Prodigy | Stryder | 9282aecb6d81 | 6/4/0/3 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.prodigydisc.com/collections/stryder) |
| Prodigy | Waco | f9301d67d0b7 | 5/5/0/1 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodigydisc.com/products/prodigy-fx-4-400g-plastic-waco-fundraiser) |
| Prodigy | X5 | 4296b91062c3 | 12/6/-3/2 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.prodigydisc.com/collections/x5) |
| Prodiscus | Amulet | a21a3cb21262 | 5/4/1/3 | &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/amulet/) |
| Prodiscus | Empire | 5c35c7ca78ee | 13/5/0/4 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/empire/) |
| Prodiscus | FASTi | 87ee66e20509 | 12/4/-3/4 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/fasti/) |
| Prodiscus | FLIPPERi | 8b20158b0863 | 9/3/-3/0 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/flipperi/) |
| Prodiscus | JokeriX (beaded) | 23597b37a03d | 3/3/1/2 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/jokerix/) |
| Prodiscus | Laseri | 0d4e184fcf5f | 10/4/-1/1 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/laseri/) |
| Prodiscus | Legenda | 3e5b5de87286 | 13/4/-1/4 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/legenda/) |
| Prodiscus | Legion | adceb697471d | 5/5/-1/1 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/legion/) |
| Prodiscus | Midari | 0a04c2b02c23 | 5/3/0/1 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/midari/) |
| Prodiscus | MidariX (beaded) | c47007da0e93 | 5/4/-1/2 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/midarix/) |
| Prodiscus | Origo | 3491539101b6 | 3/4/0/1 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/origo/) |
| Prodiscus | Pyramid | 26cfe9a350b3 | 5/3/0/3 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/pyramid/) |
| Prodiscus | Razeri | 0cc659223e80 | 12/4/0/4 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/razeri/) |
| Prodiscus | Respecti | 946767ebe6b8 | 7/2/1/2 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/respecti/) |
| Prodiscus | Rocket | 3c28393eabe9 | 9/4/0/3 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/rocket/) |
| Prodiscus | STARi | 556c26151121 | 4/4/-2/0 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/stari/) |
| Prodiscus | Slaidi | 5880bfff1a6c | 11/3/0/3 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/slaidi/) |
| Prodiscus | Sparta | fd26ed8e5740 | 3/3/0/0.5 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/sparta/) |
| Prodiscus | Talisman | f7e292ef4382 | 9/4/0/2 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/talisman/) |
| Prodiscus | Titan | 61fffb18af7a | 9/3/0/2 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/titan/) |
| Prodiscus | Totem | c4a3b89ff6a9 | 12/5/1/3 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/totem/) |
| Prodiscus | Unicorn | 0fd2a9b9c75a | 5/4/0/2 | host unreachable after three HTTP attempts: &lt;urlopen error [Errno 11002] getaddrinfo failed&gt;; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://prodiscus.fi/discs/unicorn/) |
| RPM | Kahu (DGD2) | 5bd528e17304 | 13/5/-1/2 | conflicting flight numbers/plastics on manufacturer page | [page](https://www.rpmdiscs.com/product/kahu/) |
| RPM | Taniwha | 01a44ce155df | 10/5/-2/2 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.rpmdiscs.com/product/kiwi/) |
| RPM | Te Moko (DGR2) | a1b28a033ee1 | 3/4/0/0 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://www.rpmdiscs.com/product/te-moko/) |
| Sacred Discs | Seed | eece5681e818 | 2/4/0/1 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://sacreddiscs.com/products/aroma-line-first-run-seed-putter) |
| Stokely Discs | Cardinal | ac6014de16cf | 5/4/0/2.5 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Stokely Discs | Finch | ee29e52cf3fc | 3/3/0/1.5 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Stokely Discs | Lark | 4a02566d6316 | 7/5/-1.5/1.5 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Stokely Discs | Owl | 1c53cb287fa6 | 4/3/0/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Stokely Discs | Peregrine | 924d8e14b1e5 | 12/6/-2/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Stokely Discs | Robin | 6063a0986b67 | 7/5/0/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Stokely Discs | Wren | a966b555df4e | 3/3.5/-0.5/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Storm | Abyss | 48c1bc0bf569 | 8/4/0/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Storm | Radar | c4ebcc9b6c05 | 2/5/0/0.5 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Storm | The Crater | 3e657df319d2 | 3/2/0/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Storm | The Eye | b0680fa07ca8 | 6/5/-1/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Storm | Wall Cloud | 3297955b15a9 | 5/5/0/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Thought Space Athletics | Alter | f58bc0e09624 | 3/3/0/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://thoughtspaceathletics.com/products/eyerachnid-3-foil-alter) |
| Thought Space Athletics | Construct | 897fbd070a7e | 10/6/-1/2 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://thoughtspaceathletics.com/products/aura-soft-construct) |
| Thought Space Athletics | Crux | f2a393b77e64 | 5/4/0/2 | parse failed: no complete flight-number set in model content; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://thoughtspaceathletics.com/collections/crux) |
| Thought Space Athletics | Expanse | 1e200df82587 | 11/5/-2/2 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://thoughtspaceathletics.com/products/lykke-lorentzen-signature-vex-expanse) |
| Thought Space Athletics | Mana | d00f5a073b4b | 5/5/-2/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://thoughtspaceathletics.com/products/swirly-aura-mana) |
| Thought Space Athletics | Mantra | 6261581b8ae9 | 9/6/-2/1 | parse failed: no complete flight-number set in model content; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://thoughtspaceathletics.com/collections/mantra) |
| Thought Space Athletics | Mellow | 2b8757f8d4e8 | 1/5/0/1 | HTTP 404; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://thoughtspaceathletics.com/products/premium-mellow) |
| Thought Space Athletics | Nuance | f40574f7d5d3 | 7/5/-2/1 | parse failed: no complete flight-number set in model content; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://thoughtspaceathletics.com/collections/nuance) |
| Thought Space Athletics | Persona | 21bb2d9f2bac | 8/5/-3/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://thoughtspaceathletics.com/products/parallel-persona) |
| Thought Space Athletics | Pneuma | b182fd64b8fa | 2/3/0/0 | HTTP 404; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://thoughtspaceathletics.com/collections/pneuma) |
| Thought Space Athletics | Praxis | 9b50d72b9fef | 3/3/0/1 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://thoughtspaceathletics.com/products/experimental-ethos-praxis-metal) |
| Thought Space Athletics | Requiem | b915c6bb9ec6 | 12/5/-1/2 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://thoughtspaceathletics.com/products/requiem-tee) |
| Thought Space Athletics | Temple | 116e6c04e504 | 4/3/0/3 | parse failed: no complete flight-number set in model content; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://thoughtspaceathletics.com/collections/temple) |
| Thought Space Athletics | Vessel | e75d50c9eb3e | 4/3/0/3 | parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://thoughtspaceathletics.com/products/vexbreaker-vessel) |
| Thought Space Athletics | Votum | d51a1141d522 | 7/5/0/3 | parse failed: no complete flight-number set in model content; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://thoughtspaceathletics.com/collections/votum) |
| Trash Panda Disc Golf | Inner Core | 63e84e302210 | 2/4/-0.5/0 | HTTP 404; parse failed: no complete flight-number set in model content; page identity does not match mold; web search &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://trashpandadiscgolf.com/products/bodanzas-candy-catch-inner-core) |
| Trash Panda Disc Golf | Outer Core | 99eafabe6624 | 2/4/0/1 | HTTP 404; parse failed: no complete flight-number set in model content; page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://trashpandadiscgolf.com/products/outer-core-putter-pack-1) |
| Vibram Disc Golf | Arch | 9d38adf23693 | 8/5/0/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | Ascent | 58ae1b2cc491 | 8/4/0/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | Crag | 3c2be7cf2929 | 4/3/0/3.5 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | Ibex | a58df4d4a0e3 | 5/4/-1/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | Lace | 06f603871639 | 14/6/-1/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | Launch | 6dfafd79f465 | 5/5/-1/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | Notch | 4db7e2625efb | 7/3/0/4.5 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | O-Lace | e25be9010c25 | 13/5/-1/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | Obex | 38ee65f5f8c7 | 5/4/0/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | Onyx | 606a93e0c0da | 8/6/-3/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | Ridge | f9c8532c2518 | 2/3/0/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | Solace | 9a9c9ee6ca5e | 13/4/0/4 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | Sole | 623b1dff7ed0 | 2/3/0/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | Summit | 4f98af8a8e68 | 2/3/-1/0 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | Trak | 4e81369294ba | 7/4/-1/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | V.P. | a996b96389f6 | 2/3/0/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | Valley | 5987250b235c | 7/5/-1/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Vibram Disc Golf | unLace | 4ef67cdd5ec7 | 14/6/-5/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Wild Discs | Addax | 9f4da67c4858 | 5/5/0/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Wild Discs | Angler | e2350cd8bbdf | 4/3/0/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Wild Discs | Great White | d5ee9620dd90 | 13/5/-1/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Wild Discs | Hummingbird | 9a4dc9503a8e | 2/4/0/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Wild Discs | Hyena | 468f1da451f4 | 9/5/-2/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Wild Discs | Orca | b420ec344678 | 12/5/-1.5/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Wild Discs | Tasmanian Devil | 140cf9abca8c | 7/4/-2/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Wild Discs | Tasmanian Devil V2 | dd4207c52b39 | 9/4/0/4 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Bi (毕方 Bi Fang) | 2b7b3c9dcd80 | 9/5/-1/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Bái Zé (白泽) | c264beadb7d6 | 7/6/-0.5/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Claws (爪) | b902120d059a | 1/3/0/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Crossbow (Nu, 连弩) | 0dc6e5ec058a | 4/1.5/0.5/4 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Erlang (杨戬, Yáng Jiǎn) | ad9a67d88c0b | 7/3/-3/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Freyja (弗蕾雅) | 8c8a4c0831da | 3/3/0/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Fu (夸父, Kua Fu) | 475f922736f5 | 7/5/0/2 | page identity does not match mold; web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | [page](https://yikunsports.com/FU-SANG) |
| Yikun | Hammer (Chui, 战锤) | cbd75be396f9 | 2/2.5/0/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Hu (九尾狐) | 14a1278d34ca | 9/5/-2/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Jun (鵕鸟) | b61f261ffc5d | 11/5/-1/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Kui (夔牛) | 12699151533f | 5/5/0/2.5 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Lu (Luan, 鸾鸟) | 87e914ff688b | 14/5/-1/3 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Meteor Hammer (流星锤) | 1541edf86d15 | 2/3/0/0 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Qi (穷奇, Qiong Qi) | e727c7192b01 | 13/6/-2/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Tomahawk (八卦钺) | 6c0276c5a32f | 5/6/0/0 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | View (视) | b5c8a25e6fb1 | 7/6/-3.5/1 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Wei (精卫) | 0d4f09285d8a | 10/5/-2.5/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Wings (翼) | c35859e59260 | 3/3/0/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Wù Kōng (悟空) | bda1311a154b | 10/5/0/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Yao (文鳐鱼) | 01e18ce29a9f | 4/4/0/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |
| Yikun | Zhu (夫诸 Fu Zhu) | e2c7cd288954 | 7/5/0/2 | web search host unreachable after three HTTP attempts: &lt;urlopen error timed out&gt;; web search found no matching official URL | — |

## Successfully compared records

Complete comparison ledger, including matches and differences below the flag threshold.

| Brand | Mold | ID | Atlas S/G/T/F | Manufacturer S/G/T/F | ΔT | ΔF | Source |
|---|---|---|---|---|---:|---:|---|
| Above Ground Level | Elm | 2dbf673408d3 | 9/4/0/3 | 9/4/0/3 | 0 | 0 | [page](https://www.agldiscs.com/products/agl-discs-sherbet-alpine-elm-stock-stamp) |
| Above Ground Level | Koa | 35af551bec11 | 2/3/0/1 | 2/3/0/1 | 0 | 0 | [page](https://www.agldiscs.com/products/agl-discs-woodland-koa-nccc-stamp) |
| Above Ground Level | Maple | f4976964ecb7 | 4/2/0/2 | 4/2/0/2 | 0 | 0 | [page](https://www.agldiscs.com/products/agl-discs-pink-woodland-maple-agl-stock-stamp) |
| Above Ground Level | Sequoia | 6293849d556c | 12/5/-1/3 | 12/5/-1/3 | 0 | 0 | [page](https://www.agldiscs.com/products/agl-discs-polar-sequoia-x-out-stamp) |
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
| Clash Discs | Berry | e646332cb48f | 5/5/-1/1 | 5/5/-1/1 | 0 | 0 | [page](https://www.clashdiscs.com/steady-berry) |
| Clash Discs | Butter | 28995d836dc9 | 2/3/0/1 | 2/3/0/1 | 0 | 0 | [page](https://www.clashdiscs.com/butter) |
| Clash Discs | Candy | 7a44daf44547 | 3/3/-1/1 | 3/3/-1/1 | 0 | 0 | [page](https://www.clashdiscs.com/candy) |
| Clash Discs | Cherry | c919d399e720 | 5/5/-2/1 | 5/5/-2/1 | 0 | 0 | [page](https://www.clashdiscs.com/cherry) |
| Clash Discs | Cinnamon | 7af26d2e6017 | 9/5/-1.5/2 | 9/5/-1.5/2 | 0 | 0 | [page](https://www.clashdiscs.com/cinnamon) |
| Clash Discs | Cookie | 990ee9d16985 | 7/5/0/2 | 7/5/0/2 | 0 | 0 | [page](https://www.clashdiscs.com/steady-cookie) |
| Clash Discs | Fudge | dae2701de928 | 2/3/0/2 | 2/3/0/2 | 0 | 0 | [page](https://www.clashdiscs.com/fudge) |
| Clash Discs | Guava | 60ab34502be9 | 5/5/0/2 | 5/5/0/2 | 0 | 0 | [page](https://www.clashdiscs.com/guava) |
| Clash Discs | Lotus | 70afe3c18ac0 | 8/5/-1/2 | 8/5/-1/2 | 0 | 0 | [page](https://www.clashdiscs.com/lotus) |
| Clash Discs | Mango | a06cf28d9ddc | 5/4/0/4 | 5/4/0/4 | 0 | 0 | [page](https://www.clashdiscs.com/steady-mango) |
| Clash Discs | Pepper | c9e02ce355e9 | 11/5/0/4 | 11/5/0/4 | 0 | 0 | [page](https://www.clashdiscs.com/steady-pepper) |
| Clash Discs | Peppermint | c8c7ecb105fc | 4/2/0/4 | 4/2/0/4 | 0 | 0 | [page](https://www.clashdiscs.com/peppermint) |
| Clash Discs | Popcorn | a00db15128e4 | 3/3/0/1 | 3/3/0/1 | 0 | 0 | [page](https://www.clashdiscs.com/steady-popcorn) |
| Clash Discs | Salt | ca1ea5b9edeb | 12/5/-1/3 | 12/5/-1/3 | 0 | 0 | [page](https://www.clashdiscs.com/steady-salt) |
| Clash Discs | Soda | 91ba3e12bfc1 | 7/5/-2/2 | 7/5/-2/2 | 0 | 0 | [page](https://www.clashdiscs.com/steady-soda) |
| Clash Discs | Spice | a6a985877d1c | 10/4/0/4 | 10/4/0/4 | 0 | 0 | [page](https://www.clashdiscs.com/steady-spice) |
| Clash Discs | Vanilla | 114be8ce68da | 11/6/-2/1 | 11/6/-2/1 | 0 | 0 | [page](https://www.clashdiscs.com/vanilla) |
| Climo Disc Golf | Belleair | 1f05938f21cf | 5/4/0/2 | 5/4/0/2 | 0 | 0 | [page](https://climodiscgolf.com/collections/belleair) |
| Climo Disc Golf | Champ | d039109ba4e6 | 2/3/0/0 | 2/3/0/0 | 0 | 0 | [page](https://climodiscgolf.com/collections/champ) |
| Climo Disc Golf | Coast  | 3fa9d25fb929 | 6/6/-1/1 | 6/6/-1/1 | 0 | 0 | [page](https://climodiscgolf.com/collections/coast) |
| Climo Disc Golf | Osprey | 3220137f37ce | 10/6/-3/1 | 10/6/-3/1 | 0 | 0 | [page](https://climodiscgolf.com/collections/osprey) |
| Climo Disc Golf | Skyway | 7c595f8654bb | 11/5/-1/3 | 11/5/-1/3 | 0 | 0 | [page](https://climodiscgolf.com/collections/skyway) |
| Climo Disc Golf | Streak | d533bf356e30 | 7/5/0/1 | 7/5/0/1 | 0 | 0 | [page](https://climodiscgolf.com/collections/streak) |
| DGA | Banzai | 5c94b90d3dcc | 8/4/0/3 | 8/4/0/3 | 0 | 0 | [page](https://store.discgolf.com/products/atmos-banzai-fairway-driver) |
| DGA | Blast | 03f5c79861ed | 4/2/0/4 | 4/2/0/4 | 0 | 0 | [page](https://store.discgolf.com/products/spark-blast-putt-approach) |
| DGA | Hypercane | 093f6ca00b87 | 13/4/0/4 | 13/4/0/4 | 0 | 0 | [page](https://store.discgolf.com/products/proline-hypercane-distance-driver) |
| DGA | Quake | fb715f7536a7 | 5/3/0/3 | 5/3/0/3 | 0 | 0 | [page](https://store.discgolf.com/products/atmos-quake-midrange) |
| DGA | Sail | a69fc87facea | 11/5/-5/1 | 11/5/-5/1 | 0 | 0 | [page](https://store.discgolf.com/products/atmos-sail-distance-driver) |
| DGA | Steady | 4f8db5cb8959 | 2/3/0/2 | 2/3/0/2 | 0 | 0 | [page](https://store.discgolf.com/products/stone-steady) |
| DGA | Surf | 20755e445b30 | 3/4/-1/1 | 3/4/-1/1 | 0 | 0 | [page](https://store.discgolf.com/products/atmos-surf-putt-approach) |
| DGA | Tremor | cc0e6e11f1e7 | 6/5/-4/1 | 6/5/-4/1 | 0 | 0 | [page](https://store.discgolf.com/products/spark-tremor-midrange) |
| Daredevil Discs | Albatross | bdbec013a47d | 14/6/-2/3 | 14/6/-2/3 | 0 | 0 | [page](https://daredevildiscs.com/product/albatross/) |
| Daredevil Discs | Bigfoot | 9a67d956536a | 13/6/-2/2 | 13/6/-2/2 | 0 | 0 | [page](https://daredevildiscs.com/product/bigfoot/) |
| Daredevil Discs | Bighorn | 26fc5cf91fb6 | 2/3/0/1 | 2/3/0/1 | 0 | 0 | [page](https://daredevildiscs.com/product/bighorn/) |
| Daredevil Discs | Buffalo | ed522e1d85e6 | 9/4/-1/5 | 9/4/-1/5 | 0 | 0 | [page](https://daredevildiscs.com/product/buffalo/) |
| Daredevil Discs | Caribou | e6f58e432127 | 4/5/-3/1 | 4/5/-3/1 | 0 | 0 | [page](https://daredevildiscs.com/product/caribou/) |
| Daredevil Discs | Grizzly | ab32e400a93b | 4/4/0/2 | 4/4/0/2 | 0 | 0 | [page](https://daredevildiscs.com/product/grizzly/) |
| Daredevil Discs | Mammoth | 69c27d581dbb | 9/4/-1/5 | 9/4/-1/5 | 0 | 0 | [page](https://daredevildiscs.com/product/mammoth/) |
| Daredevil Discs | Merlin | a59644eb879d | 14/5/-1/4 | 14/5/-1/4 | 0 | 0 | [page](https://daredevildiscs.com/product/merlin/) |
| Daredevil Discs | Moose | 2c6861d3f53b | 4/5/0/2 | 4/5/0/2 | 0 | 0 | [page](https://daredevildiscs.com/product/moose/) |
| Daredevil Discs | Ogopogo | 948f8f358149 | 9/4/-2/5 | 9/4/-2/5 | 0 | 0 | [page](https://daredevildiscs.com/product/ogopogo/) |
| Daredevil Discs | Polar Bear | 58f4047b1d5d | 2/3/0/1 | 2/3/0/1 | 0 | 0 | [page](https://daredevildiscs.com/product/polar-bear-putter-new-look/) |
| Daredevil Discs | Sabertooth | 0d7a776d3cd7 | 9/4/0/5 | 9/4/0/5 | 0 | 0 | [page](https://daredevildiscs.com/product/sabertooth/) |
| Daredevil Discs | Sasquatch | b7acb0267bb2 | 13/5/-5/1 | 13/5/-5/1 | 0 | 0 | [page](https://daredevildiscs.com/product/sasquatch/) |
| Daredevil Discs | Walrus | 145116096f76 | 4/5/0/3 | 4/5/0/3 | 0 | 0 | [page](https://daredevildiscs.com/product/walrus/) |
| Daredevil Discs | Wolverine | 06a1eab42f7d | 9/5/-2/2 | 9/5/-2/2 | 0 | 0 | [page](https://daredevildiscs.com/product/wolverine-driver-orange/) |
| Daredevil Discs | Woodchuck | 57dbb3fb0b60 | 2/2/-1/0 | 2/2/-1/0 | 0 | 0 | [page](https://daredevildiscs.com/product/woodchuck-putter-orange/) |
| Daredevil Discs | Yeti | d755c3903896 | 13/6/-3/1 | 13/6/-3/1 | 0 | 0 | [page](https://daredevildiscs.com/product/yeti/) |
| Discmania | DD (new) | e6a64f9c717b | 11/6/-3/2 | 11/6/-3/2 | 0 | 0 | [page](https://www.discmania.net/collections/dd) |
| Discmania | DD1 | 55f968d6da48 | 11/5/-1/2 | 11/5/-1/2 | 0 | 0 | [page](https://www.discmania.net/collections/dd1) |
| Discmania | DD2 (2025) | b2e2f2337782 | 12/5/-1/2 | 12/5/-1/2 | 0 | 0 | [page](https://www.discmania.net/collections/dd2) |
| Discmania | DD3 (new) | a5ca585ab070 | 12/5/-1/3 | 12/5/-1/3 | 0 | 0 | [page](https://www.discmania.net/collections/dd3) |
| Discmania | DD4 | a92195c30ec2 | 13/5/0/3 | 13/5/-1/3 | -1 | 0 | [page](https://www.discmania.net/collections/dd4) |
| Discmania | Drop | 0932a96a3658 | 4/3/0/3 | 4/3/0/3 | 0 | 0 | [page](https://www.discmania.net/collections/drop) |
| Discmania | Enigma | 29b38f7b5f0f | 12/5/-1/2 | 12/5/-1/2 | 0 | 0 | [page](https://www.discmania.net/collections/enigma) |
| Discmania | FD (new) | 9da761f79bd2 | 7/6/0/1 | 7/6/0/1 | 0 | 0 | [page](https://www.discmania.net/collections/fd) |
| Discmania | FD2 (new) | 3d70ef38ff0e | 7/4/0/2 | 7/4/0/2 | 0 | 0 | [page](https://www.discmania.net/collections/fd2) |
| Discmania | Founder | 72bac1ee1382 | 5/6/-4/1 | 5/6/-4/1 | 0 | 0 | [page](https://www.discmania.net/collections/founder) |
| Discmania | Function | 2cc143f071cd | 8/6/-4/1 | 8/6/-4/1 | 0 | 0 | [page](https://www.discmania.net/collections/function) |
| Discmania | Genius (originally Sun Crow) | a569104028fe | 7/5/-4/1 | 7/5/-4/1 | 0 | 0 | [page](https://www.discmania.net/collections/genius) |
| Discmania | Glacier | 1a3f9c78b8f0 | 5/5/0/2 | 5/5/0/2 | 0 | 0 | [page](https://www.discmania.net/collections/glacier) |
| Discmania | Instinct (150-175g) | 6d63e6972109 | 7/5/0/2 | 7/5/0/2 | 0 | 0 | [page](https://www.discmania.net/collections/instinct) |
| Discmania | Logic | f7f1b333b998 | 3/3/0/1 | 3/3/0/1 | 0 | 0 | [page](https://www.discmania.net/collections/logic) |
| Discmania | MD3x | 810ecf1b532a | 5/5/0/2 | 5/5/0/2 | 0 | 0 | [page](https://www.discmania.net/collections/md3x) |
| Discmania | MD4 (new) | 8938df2dcab1 | 5/4/0/3 | 5/4/0/3 | 0 | 0 | [page](https://www.discmania.net/collections/md4) |
| Discmania | Maestro (originally Spring Ox) | 76d780690bb6 | 4/3/0/2 | 4/3/0/2 | 0 | 0 | [page](https://www.discmania.net/collections/maestro) |
| Discmania | Magician (originally Fox Spirit) | 0fc906f52ad5 | 6/4/0/2 | 6/4/0/2 | 0 | 0 | [page](https://www.discmania.net/collections/magician) |
| Discmania | Majesty | 914288b22c3b | 13/5/-2/2 | 13/5/-2/2 | 0 | 0 | [page](https://www.discmania.net/collections/majesty) |
| Discmania | Mentor (originally Sea Serpent) | 4d2c9833e8ea | 11/5/-2/2 | 11/5/-2/2 | 0 | 0 | [page](https://www.discmania.net/collections/mentor) |
| Discmania | Mermaid | b24a2d7cbf9b | 7/4/-1/2 | 7/4/-1/2 | 0 | 0 | [page](https://www.discmania.net/collections/mermaid) |
| Discmania | Method | 13cbdeba2086 | 5/5/0/3 | 5/5/0/3 | 0 | 0 | [page](https://www.discmania.net/collections/method) |
| Discmania | Notion | dc9c8713f27c | 2/3/-1/0 | 2/3/-1/0 | 0 | 0 | [page](https://www.discmania.net/collections/notion) |
| Discmania | P1 (new) | 25df77601a40 | 2/3/0/0 | 2/3/0/0 | 0 | 0 | [page](https://www.discmania.net/collections/p1) |
| Discmania | P1x (new) | ea3ae9405e70 | 2/3/0/0 | 2/3/0/0 | 0 | 0 | [page](https://www.discmania.net/collections/p1x) |
| Discmania | P3x (new) | 7d0887d80cae | 3/2/0/3 | 3/2/0/3 | 0 | 0 | [page](https://www.discmania.net/collections/p3x) |
| Discmania | P4 | e540ec41038f | 4/2/0/3 | 4/2/0/3 | 0 | 0 | [page](https://www.discmania.net/collections/p4) |
| Discmania | PD3 | 80667f6b7d05 | 11/3/0/5 | 11/3/0/5 | 0 | 0 | [page](https://www.discmania.net/collections/pd3) |
| Discmania | PDx (Power Driver) | 16fb32710af1 | 11/4/0/3 | 11/4/0/3 | 0 | 0 | [page](https://www.discmania.net/collections/pdx) |
| Discmania | Paradigm | 5c09996a7015 | 12/6/-1.5/2 | 12/6/-1.5/2 | 0 | 0 | [page](https://www.discmania.net/collections/paradigm) |
| Discmania | Premier DD1 | 9554f962a394 | 11/6/-1/2 | 11/6/-1/2 | 0 | 0 | [page](https://www.discmania.net/collections/premier-dd1) |
| Discmania | Premier DD3 | b52c5cb1753a | 12/6/-1/2 | 12/6/-1/2 | 0 | 0 | [page](https://www.discmania.net/collections/premier-dd3) |
| Discmania | Premier Essence | 0dc8d1cbf7b6 | 8/7/-1/1 | 8/7/-1/1 | 0 | 0 | [page](https://www.discmania.net/collections/premier-essence) |
| Discmania | Premier FD | e5bd2b16e1f0 | 7/7/0/1 | 7/7/0/1 | 0 | 0 | [page](https://www.discmania.net/collections/premier-fd) |
| Discmania | Premier MD3 | f5fb00eb9fa5 | 5/6/0/2 | 5/6/0/2 | 0 | 0 | [page](https://www.discmania.net/collections/premier-md3) |
| Discmania | Rainmaker | 3654f9ec87fd | 2/3/0/0.5 | 2/3/0/0.5 | 0 | 0 | [page](https://www.discmania.net/collections/rainmaker) |
| Discmania | Sensei (Discmania Active, originally Guardian Lion) | 142786245500 | 3/3/0/1 | 3/3/0/1 | 0 | 0 | [page](https://www.discmania.net/collections/sensei) |
| Discmania | Shogun | 87d171579e5a | 2/4/0/2 | 2/4/0/2 | 0 | 0 | [page](https://www.discmania.net/collections/shogun) |
| Discmania | Splice | a9cfcdceb423 | 9/3/0/4 | 9/3/0/4 | 0 | 0 | [page](https://www.discmania.net/collections/splice) |
| Discmania | Spore | d01fe648818c | 1/7/0/1 | 1/7/0/1 | 0 | 0 | [page](https://www.discmania.net/collections/spore) |
| Discmania | TD (new) | e6f2e32bd1dd | 10/5/-2/1 | 10/5/-2/1 | 0 | 0 | [page](https://www.discmania.net/collections/td) |
| Discmania | Tactic | fc4ab0a66073 | 4/2/0/3 | 4/2/0/3 | 0 | 0 | [page](https://www.discmania.net/collections/tactic) |
| Discmania | Tailor | 960f1c00d72a | 4/4/0/1 | 4/4/0/1 | 0 | 0 | [page](https://www.discmania.net/collections/tailor) |
| Discmania | Tilt | 1f38178c40c2 | 9/1/1/6 | 9/1/1/6 | 0 | 0 | [page](https://www.discmania.net/collections/tilt) |
| Discraft | APX | 9917e34430e4 | 2/2/-1/1 | 2/2/-1/1 | 0 | 0 | [page](https://www.team.discraft.com/discs/apx) |
| Discraft | Archer | 46efed768b52 | 5/4/-4/1 | 7/4/-3/1 | 1 | 0 | [page](https://www.team.discraft.com/discs/archer) |
| Divergent Discs | Alpas | 3b3adbcd5021 | 4/4/-2/1 | 4/4/-2/1 | 0 | 0 | [page](https://divergentdiscs.com/product-tag/alpas/) |
| Divergent Discs | Basilisk | abcec9d8352a | 12/6/-4/1 | 13/6/-5/2 | -1 | 1 | [page](https://divergentdiscs.com/product/basilisk-max-grip/) |
| Divergent Discs | Golem | 3d87d5f7d028 | 4/2/0/4 | 4/2/0/4 | 0 | 0 | [page](https://divergentdiscs.com/product-tag/golem/) |
| Divergent Discs | Kapre | 9618b1c70a1e | 5/5/-1.5/1 | 5/5/-1/1 | 0.5 | 0 | [page](https://divergentdiscs.com/product-tag/kapre/) |
| Divergent Discs | Kraken | eba3aaaf0db3 | 8/5/-2/2 | 8/5/-1/2 | 1 | 0 | [page](https://divergentdiscs.com/product-tag/kraken/) |
| Divergent Discs | Lawin | de0f4ea45ddc | 12/5/-3/2 | 12/6/-3/2 | 0 | 0 | [page](https://divergentdiscs.com/product-tag/lawin/) |
| Divergent Discs | Leviathan | 6e9beb9133b2 | 5/4/-4/0 | 5/4/-4/0 | 0 | 0 | [page](https://divergentdiscs.com/product-tag/leviathan/) |
| Divergent Discs | Minotaur | daba930518da | 8/3/0/4 | 8/3/0/3 | 0 | -1 | [page](https://divergentdiscs.com/product/minotaur-max-grip/) |
| Divergent Discs | Nuno | 2a64bb62f765 | 3/4/-1/1 | 3/4/0/1 | 1 | 0 | [page](https://divergentdiscs.com/product-tag/nuno/) |
| Divergent Discs | Tiyanak | 6c667cbf31a3 | 8/5/-5/1 | 8/5/-5/1 | 0 | 0 | [page](https://divergentdiscs.com/product-tag/tiyanak/) |
| Divergent Discs | Wyrm | 56899afe23af | 8/1/1/4 | 9/2/0/5 | -1 | 1 | [page](https://divergentdiscs.com/product-tag/wyrm/) |
| Doomsday Discs | Apocalypse | 7a5177ebea2e | 13/1/1/6 | 13/1/1/6 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/apocalypse) |
| Doomsday Discs | Area 51 | a27332a537a6 | 4/3/0/2.5 | 4/3/0/2.5 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/area-51) |
| Doomsday Discs | Blackout | f2f8c507e8d1 | 8/5/-2/1 | 8/5/-2/1 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/blackout) |
| Doomsday Discs | Bleak | 3cfc20bb7d54 | 2/4/-1/1 | 2/4/-1/1 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/bleak) |
| Doomsday Discs | Bunker Buster | b8fb0f13fdc4 | 7/4/0/2 | 7/4/0/2 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/bunker-buster) |
| Doomsday Discs | Cataclysm | df6ca7508a7e | 11/5/-1/2 | 11/5/-1/2 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/cataclysm) |
| Doomsday Discs | Chemtrail | 9e363a32ec97 | 7/6/-2/1 | 7/6/-2/1 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/chemtrail) |
| Doomsday Discs | Crisis | 4a68a8d27b42 | 4/2/0/4 | 4/2/0/4 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/crisis) |
| Doomsday Discs | Depth Charge | f0d7721e0907 | 2/2/0/1 | 2/2/0/1 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/depth-charge) |
| Doomsday Discs | Desolation | e2d7a1c0cd23 | 5/5/0/2 | 5/5/0/2 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/desolation) |
| Doomsday Discs | Despair | ec7347e0faf6 | 5/4/-1/1 | 5/4/-1/1 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/despair) |
| Doomsday Discs | Flat Earth | d1b2f50658ba | 5/5/-1/1 | 5/5/-1/1 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/flat-earth) |
| Doomsday Discs | Frag | d0920e2caef5 | 5/2/0/5 | 5/2/0/5 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/frag) |
| Doomsday Discs | Gloom | a6edd1f8130b | 2/3/-1/1 | 2/3/-1/1 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/gloom) |
| Doomsday Discs | Ice Age | 81e8764f4c8d | 7/4/0/3 | 7/4/0/3 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/ice-age) |
| Doomsday Discs | Land Mine | 93998198b805 | 2/2/0/2 | 2/2/0/2 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/land-mine) |
| Doomsday Discs | Lockdown | 789013f5f014 | 10/5/-1/2 | 10/5/-1/2 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/lockdown) |
| Doomsday Discs | Pestilence | 5cd26264aa95 | 13/5/-4/1 | 13/5/-4/1 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/pestilence) |
| Doomsday Discs | Plague | 8aaef3e2e90e | 12/5/-1/2.5 | 12/5/-1/2.5 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/plague) |
| Doomsday Discs | Proximity Mine | 72bafa9f7f41 | 2/3/0/1.5 | 2/3/0/1.5 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/proximity-mine) |
| Doomsday Discs | Rot | afd9f9645145 | 2/4/0/1 | 2/4/0/1 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/rot) |
| Doomsday Discs | Scavenger | b2bc3fd881b0 | 5/5/-2/1 | 5/5/-2/1 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/scavenger) |
| Doomsday Discs | Scope | 1678582c15b5 | 4/4/0/2 | 4/4/0/2 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/scope) |
| Doomsday Discs | Wasteland | dd1da100dbfd | 5/4/0/1 | 5/4/0/1 | 0 | 0 | [page](https://doomsdaydiscs.com/collections/wasteland) |
| Dynamic Discs | Agent | 90b13a1ff698 | 2/3/0/1 | 2/3/0/1 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/agent) |
| Dynamic Discs | Bounty | 532e078dc0a3 | 4/5/-1.5/0.5 | 4/5/-1.5/0.5 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/bounty) |
| Dynamic Discs | Breakout | 0a5a233bd7d4 | 8/5/-1/1.5 | 8/5/-1/1.5 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/breakout) |
| Dynamic Discs | Cavalry | 8b4a3a413764 | 9/6/-2.5/1 | 9/6/-2.5/1 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/cavalry) |
| Dynamic Discs | Contender | 9f77c633d082 | 9/6/-1/1 | 9/6/-1/1 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/contender) |
| Dynamic Discs | Convict | 510d7e4c1764 | 9/4/-0.5/3 | 9/4/-0.5/3 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/convict) |
| Dynamic Discs | Criminal | 01e44c989dd5 | 10/3/1/4 | 10/3/1/4 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/criminal) |
| Dynamic Discs | Deputy | 9458ba6dbc3d | 3/4/-1.5/0 | 3/4/-1.5/-0 | 0 | -0 | [page](https://www.dynamicdiscs.com/collections/deputy) |
| Dynamic Discs | EMAC Truth | 66ccd6f574d1 | 5/5/0/2 | 5/5/0/2 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/emac-truth) |
| Dynamic Discs | Evidence | 771007e83b41 | 5/5/-1/0 | 5/5/-1/0 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/evidence) |
| Dynamic Discs | Felon | f6267498c9d2 | 9/3/0.5/4 | 9/3/0.5/4 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/felon) |
| Dynamic Discs | Fugitive | 5a4659ffee7c | 5/5/-0.5/1.5 | 5/5/-0.5/1.5 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/dynamic-discs-fugitive) |
| Dynamic Discs | Gavel | 397cd8a716b2 | 3/5/-2/0.5 | 3/5/-2/0.5 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/dynamic-discs-gavel) |
| Dynamic Discs | General | 291bc5054f21 | 12/4/0/4 | 12/4/0/4 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/general) |
| Dynamic Discs | Guard | 015969628500 | 2/5/0/0.5 | 2/5/0/0.5 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/guard) |
| Dynamic Discs | Heist | a26f4c55ba3a | 12/5/-1.5/2 | 12/5/-1.5/2 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/heist) |
| Dynamic Discs | Intent | d23a0d14b0f4 | 9/4/0.5/3 | 9/4/0.5/3 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/intent) |
| Dynamic Discs | Jury | f05bd63b86ae | 2/4/0/2 | 2/4/0/2 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/jury) |
| Dynamic Discs | Marshal | ad03f111457e | 3/4/0/1 | 3/4/0/1 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/marshal) |
| Dynamic Discs | Motive | d4ad6d6b1979 | 8/6/-3/2 | 8/6/-3/2 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/motive) |
| Dynamic Discs | Mutiny | f22b43e04f67 | 5/4/0/3 | 5/4/0/3 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/mutiny) |
| Dynamic Discs | Patrol | 14a01d6e8908 | 5/5/-3/1 | 5/5/-3/1 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/dynamic-discs-patrol) |
| Dynamic Discs | Proof | 276b0fb74c56 | 5/6/-3/1 | 5/6/-3/1 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/dynamic-discs-proof) |
| Dynamic Discs | Slammer | 2c335a75e0b6 | 3/2/0/3 | 3/2/0/3 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/slammer) |
| Dynamic Discs | Supreme EMAC Truth | 94af37c22f41 | 5/5/0/3 | 5/5/0/3 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/dynamic-discs-supreme-emac-truth) |
| Dynamic Discs | Supreme Trespass | 81b9e181f205 | 12/5/-0.5/3 | 12/5/-0.5/2 | 0 | -1 | [page](https://www.dynamicdiscs.com/collections/supreme-trespass) |
| Dynamic Discs | Suspect | 2f2f8024b156 | 4/3/0/3 | 4/3/0/3 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/suspect) |
| Dynamic Discs | Thief | 787bbba1adb6 | 8/5/-1.5/2 | 8/5/-1.5/2 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/dynamic-discs-thief) |
| Dynamic Discs | Treason | 2927db107c64 | 10/5/-3/1 | 10/5/-3/1 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/treason) |
| Dynamic Discs | Vandal | 76d3a4e2f7c4 | 9/5/-1.5/2 | 9/5/-1.5/2 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/vandal) |
| Dynamic Discs | Warrant | 696bb35d4006 | 5/5/-2/0 | 5/5/-2/0 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/warrant) |
| Dynamic Discs | Witness | 46f25143fb6b | 8/6/-3/1 | 8/6/-3/1 | 0 | 0 | [page](https://www.dynamicdiscs.com/collections/witness) |
| Gateway | Amphibian | 8155a87e549a | 10/6/-4/2 | 10/6/-4/2 | 0 | 0 | [page](https://gatewaydiscsports.com/products/amphibian-suregrip%E2%84%A2) |
| Gateway | Apex | 62e6d7efa845 | 12/6/-1/2 | 11.5/6/-1/1.5 | 0 | -0.5 | [page](https://gatewaydiscsports.com/products/apex-diamond) |
| Gateway | Assassin | b0caceaf47fd | 9/6/-1.5/1 | 9/6/-1.5/1 | 0 | 0 | [page](https://gatewaydiscsports.com/collections/assassin) |
| Gateway | Aura | 68af32f30a4a | 12/6/-2/1 | 12/6/-1.5/2 | 0.5 | 1 | [page](https://gatewaydiscsports.com/collections/aura) |
| Gateway | Blaze | 50ecde5647e4 | 7/4/0/3 | 7/4/0/3 | 0 | 0 | [page](https://gatewaydiscsports.com/products/blaze-hyper-diamond) |
| Gateway | Chief | 0e254ed8d707 | 3/3/0/1 | 3/3/0/1 | 0 | 0 | [page](https://gatewaydiscsports.com/products/chief-lunar) |
| Gateway | Chief OS | 8de59c326fb6 | 3/3/0/2 | 3/3/0/2 | 0 | 0 | [page](https://gatewaydiscsports.com/products/chief-os-diamond-1) |
| Gateway | Devilhawk | 5341864ac64c | 3/3/0/4 | 3/3/0/4 | 0 | 0 | [page](https://gatewaydiscsports.com/products/devil-hawk-nxt) |
| Gateway | Element | 5bab5ae7a8cd | 5/5/-1/1 | 5/5/-1/1 | 0 | 0 | [page](https://gatewaydiscsports.com/products/element-nxt) |
| Gateway | Ether | 3f520dd393a8 | 12/6/-1/2 | 12/6/-1/2 | 0 | 0 | [page](https://gatewaydiscsports.com/collections/ether) |
| Gateway | Ghoul | 98725b3db282 | 3/3/0/3 | 3/3/0/3 | 0 | 0 | [page](https://gatewaydiscsports.com/products/chan-ghoul-suregrip) |
| Gateway | Houdini | d4a3bb736f09 | 3/3/0/3 | 3/3/0/3 | 0 | 0 | [page](https://gatewaydiscsports.com/collections/houdini) |
| Gateway | Hybrid | d94273fe89d2 | 7/5/0/3 | 7/4/-0.5/2 | -0.5 | -1 | [page](https://gatewaydiscsports.com/collections/hybrid) |
| Gateway | Illusion | 37d60c859865 | 12/5/-0.5/2.5 | 12/5/-0.5/2.5 | 0 | 0 | [page](https://gatewaydiscsports.com/collections/illusion) |
| Gateway | Mystic | 9900490103f6 | 5/5/-3/0 | 5/5/-3/0 | 0 | 0 | [page](https://gatewaydiscsports.com/products/mystic-nxt) |
| Gateway | Prophecy | 22d8f835d584 | 5/5/0/2 | 5/5/0/2 | 0 | 0 | [page](https://gatewaydiscsports.com/products/prophecy-nxt) |
| Gateway | Realm | b6e9c8b7e370 | 12/5/-1/3 | 12/5/-1/3 | 0 | 0 | [page](https://gatewaydiscsports.com/collections/realm) |
| Gateway | Shaman | db1d1ef23de2 | 3/3/-1/1 | 3/3/-1/1 | 0 | 0 | [page](https://gatewaydiscsports.com/products/shaman-nxt) |
| Gateway | Spear | 6951e654a7b2 | 9/6/-2/1 | 9/6/-2/1 | 0 | 0 | [page](https://gatewaydiscsports.com/collections/spear) |
| Gateway | Speed Demon | 086009922284 | 12/5/-0.5/3 | 12/5/-0.5/3 | 0 | 0 | [page](https://gatewaydiscsports.com/products/speed-demon-platinum) |
| Gateway | Spell | 2433a9c55a06 | 12/5/0/3 | 12/5/0/3 | 0 | 0 | [page](https://gatewaydiscsports.com/collections/spell) |
| Gateway | Spirit | 918463a4eb8d | 12/4/0/4 | 11/4/0/4 | 0 | 0 | [page](https://gatewaydiscsports.com/collections/spirit) |
| Gateway | Warspear | 48dcdb656484 | 3/3/0/2 | 3/3/0/2 | 0 | 0 | [page](https://gatewaydiscsports.com/collections/warspear) |
| Hooligan Discs | Cash | c77b516988bf | 3/3/0/2 | 3/3/0/2 | 0 | 0 | [page](https://hooligandiscs.com/collections/cash-3-3-0-2) |
| Hooligan Discs | Dime | e22fb1f85483 | 2/4/0/1 | 2/4/0/1 | 0 | 0 | [page](https://hooligandiscs.com/collections/dime-2-4-0-1) |
| Hooligan Discs | Flip | 0ad008b89088 | 5/6/-4/1 | 5/6/-4/1 | 0 | 0 | [page](https://hooligandiscs.com/collections/flip-5-6-4-1) |
| Hooligan Discs | Thread | b9cdd04acf31 | 9/5/-1/1 | 9/5/-1/1 | 0 | 0 | [page](https://hooligandiscs.com/collections/thread-9-5-1-1) |
| Hooligan Discs | Vibe | f17dd8541fb0 | 11/5/-2/2 | 11/5/-2/2 | 0 | 0 | [page](https://hooligandiscs.com/collections/vibe-12-5-2-2) |
| Hooligan Discs | Yeet | 95a765405abd | 12/5/-1/3 | 12/5/-1/3 | 0 | 0 | [page](https://hooligandiscs.com/collections/yeet-12-5-1-3) |
| Infinite Discs | Alpaca | 128019b91e89 | 3/3/0/1 | 3/3/0/1 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-alpaca) |
| Infinite Discs | Anubis | 4fe840834d2a | 5/5/0/0 | 5/5/0/0 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-anubis) |
| Infinite Discs | Aztec | 0fef741a0014 | 10/5/-1/2 | 10/5/-1/2 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-aztec) |
| Infinite Discs | Cavalier | 9b0208313a13 | 5/5/0/2 | 5/5/0/2 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-cavalier) |
| Infinite Discs | Centurion | 93498283f1d5 | 7/5/-1/1.5 | 7/5/-1/2 | 0 | 0.5 | [page](https://infinitediscs.com/infinite-discs-centurion) |
| Infinite Discs | Chariot | 5ce0376e7aa9 | 5/5/0/1 | 5/5/0/1 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-chariot) |
| Infinite Discs | Conqueror | 83a791e13e32 | 12/4/0/4 | 12/4/0/4 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-conqueror) |
| Infinite Discs | Czar | 95fdfcb5725d | 11/5/-1/3 | 11/5/-1/3 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-czar) |
| Infinite Discs | Dynasty | ccdaeaed5b0a | 9/5/-1/2 | 9/5/-1/2 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-dynasty) |
| Infinite Discs | Exodus | b5f1e7d00add | 7/5/-0.5/2 | 7/5/-0.5/2 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-exodus) |
| Infinite Discs | Galleon | 1cd27abfe255 | 6/3/0/5 | 6/3/0/5 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-galleon) |
| Infinite Discs | Glyph | 33c0f897b88c | 1/5/0/1 | 1/5/0/1 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-glyph) |
| Infinite Discs | Inca | 83b5e682aece | 5/5/0/3 | 5/5/0/3 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-inca) |
| Infinite Discs | Khonsu | 292a0e4634c6 | 5/5/-3/0 | 5/5/-3/0 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-khonsu) |
| Infinite Discs | Kon Tiki | be1edef3b0f9 | 4/5/-3/0 | 4/5/-3/0 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-kon-tiki) |
| Infinite Discs | Maya | f3cbde469681 | 11/5/-3/1 | 11/5/-3/1 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-maya) |
| Infinite Discs | Myth | dae6c2a830cc | 2/3/0/2 | 2/3/0/2 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-myth) |
| Infinite Discs | Ra | 30e34279f859 | 5/4/0/2.5 | 5/4/0/2.5 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-ra) |
| Infinite Discs | Raze | 3ab497a8567e | 3/2/0/3 | 3/2/0/3 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-raze) |
| Infinite Discs | Roman | 22e837ec98b4 | 10/4/0/3 | 10/4/0/3 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-roman) |
| Infinite Discs | Ruin | ec20462876e6 | 3/3/0/3 | 3/3/0/3 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-ruin) |
| Infinite Discs | Scarab | 28543c47fb7f | 2/4/0/1 | 2/4/0/1 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-scarab) |
| Infinite Discs | Scepter | 5a24826b1a8e | 9/4/0/4 | 9/4/0/4 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-scepter) |
| Infinite Discs | Slab | 79278cd60129 | 12/3/0/4 | 11/3/0/4 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-slab) |
| Infinite Discs | Sphinx | e748e266da63 | 9/6/-3/1 | 9/6/-3/1 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-sphinx) |
| Infinite Discs | Squire | 288991278acd | 8/6/0/1 | 8/6/0/1 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-squire) |
| Infinite Discs | Sultan | 3ac6db46e507 | 12/5/-2/2 | 12/5/-2/2 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-sultan) |
| Infinite Discs | Tomb | c4ce17504acf | 3/4/0/1 | 3/4/0/1 | 0 | 0 | [page](https://infinitediscs.com/infinite-discs-tomb) |
| Innova | Aero | ab6dabd8eee3 | 3/6/0/0 | 3/6/0/0 | 0 | 0 | [page](https://www.innovadiscs.com/disc/aero/) |
| Innova | Alien | 160157f25794 | 4/2/0/1 | 4/2/0/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/alien/) |
| Innova | Animal | 6c65e5f50643 | 2/1/0/1 | 2/1/0/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/animal/) |
| Innova | Arachnid | 5f2b61a527a9 | 5/6/-1/1 | 5/6/-1/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/arachnid/) |
| Innova | Archangel | a02af13b125d | 8/6/-4/1 | 8/6/-4/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/archangel/) |
| Innova | Atlas | 582b538be71e | 5/4/0/1 | 5/4/0/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/atlas/) |
| Innova | Avatar | a5debc75910e | 5/4/0/2 | 5/4/0/2 | 0 | 0 | [page](https://www.innovadiscs.com/disc/avatar/) |
| Innova | AviarX3 | 9dc1a8f78155 | 3/2/0/3 | 3/2/0/3 | 0 | 0 | [page](https://www.innovadiscs.com/disc/aviarx3/) |
| Innova | Banshee | 9f145b6dd405 | 7/3/0/3 | 7/3/0/3 | 0 | 0 | [page](https://www.innovadiscs.com/disc/banshee/) |
| Innova | Birdie | 6147bc0b2970 | 1/2/0/0 | 1/2/0/0 | 0 | 0 | [page](https://www.innovadiscs.com/disc/birdie/) |
| Innova | Bullfrog | 4a9aea9ba269 | 3/1/0/1 | 3/1/0/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/bullfrog/) |
| Innova | CRO | 378f325ed5df | 5/3/0/2 | 5/3/0/2 | 0 | 0 | [page](https://www.innovadiscs.com/disc/cro/) |
| Innova | Caiman | 7a72f1a90dba | 5.5/2/0/4 | 5.5/2/0/4 | 0 | 0 | [page](https://www.innovadiscs.com/disc/caiman/) |
| Innova | Cheetah | 90bdbd3a045f | 6/4/-2/2 | 6/4/-2/2 | 0 | 0 | [page](https://www.innovadiscs.com/disc/cheetah/) |
| Innova | Cobra | 4af4deeb07df | 4/5/-2/2 | 4/5/-2/2 | 0 | 0 | [page](https://www.innovadiscs.com/disc/cobra/) |
| Innova | Colossus | df2e79d1b9a3 | 14/5/-1/3 | 14/5/-1/3 | 0 | 0 | [page](https://www.innovadiscs.com/disc/colossus/) |
| Innova | Colt | 1de08b2bb476 | 3/4/-1/1 | 3/4/-1/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/colt/) |
| Innova | Coyote | 5abdc7767d91 | 4/5/0/1 | 4/5/0/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/coyote/) |
| Innova | Dragon | a4b3efefd6e4 | 8/5/-2/2 | 8/5/-2/2 | 0 | 0 | [page](https://www.innovadiscs.com/disc/dragon/) |
| Innova | Firefly | 1c210a7fc511 | 2/3/0/1 | 2/3/0/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/firefly/) |
| Innova | Firestorm | 722ba05390e9 | 14/4/-1/3 | 14/4/-1/3 | 0 | 0 | [page](https://www.innovadiscs.com/disc/firestorm/) |
| Innova | Fox | a60bca494228 | 5/6/-2/1 | 5/6/-2/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/fox/) |
| Innova | Foxbat | 69aa5e0ec5ef | 5/6/-1/0 | 5/6/-1/0 | 0 | 0 | [page](https://www.innovadiscs.com/disc/foxbat/) |
| Innova | Hawkeye | 06636ced8b58 | 7/5/-1/1 | 7/5/-1/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/hawkeye/) |
| Innova | Invader | 3a0eb7576d2e | 3/2/0/1 | 3/2/0/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/invader/) |
| Innova | Invictus | 5c947eb8e9b5 | 10/4/0/3 | 10/4/0/3 | 0 | 0 | [page](https://www.innovadiscs.com/disc/invictus/) |
| Innova | Jay | 9dadd059444b | 5/4/0/1 | 5/4/0/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/jay/) |
| Innova | Lion | ba28dc14b9aa | 5/4/0/2 | 5/4/0/2 | 0 | 0 | [page](https://www.innovadiscs.com/disc/lion/) |
| Innova | Lynx | 7bac98262a87 | 7/6/-2/1 | 7/6/-3/1 | -1 | 0 | [page](https://www.innovadiscs.com/disc/lynx/) |
| Innova | Mako | e078cd54dc34 | 4/5/0/0 | 4/5/0/0 | 0 | 0 | [page](https://www.innovadiscs.com/disc/mako/) |
| Innova | Manta | 656b972df7c9 | 5/5/-2/1 | 5/5/-2/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/manta/) |
| Innova | Max | 4c8b64068bcd | 11/3/0/5 | 11/3/0/5 | 0 | 0 | [page](https://www.innovadiscs.com/disc/max/) |
| Innova | Monster | 445070650a98 | 10/3/0/5 | 10/3/0/5 | 0 | 0 | [page](https://www.innovadiscs.com/disc/monster/) |
| Innova | Mystere | ea92fc29b543 | 11/6/-2/2 | 11/6/-2/2 | 0 | 0 | [page](https://www.innovadiscs.com/disc/mystere/) |
| Innova | Nova | 3016f4297a6e | 2/3/0/0 | 2/3/0/0 | 0 | 0 | [page](https://www.innovadiscs.com/disc/nova/) |
| Innova | ORC | 3b401819a7bd | 10/4/-1/3 | 10/4/-1/3 | 0 | 0 | [page](https://www.innovadiscs.com/disc/orc/) |
| Innova | Panther | 108a7db5aa39 | 5/4/-2/1 | 5/4/-2/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/panther/) |
| Innova | Pig | 5e60dd1ba225 | 4/1/0/3 | 4/1/0/3 | 0 | 0 | [page](https://www.innovadiscs.com/disc/pig/) |
| Innova | Racer | 9bf5251e8643 | 12/6/-1/2 | 12/6/-1/2 | 0 | 0 | [page](https://www.innovadiscs.com/disc/racer/) |
| Innova | Rat | 0fdf9faac669 | 4/2/0/2 | 4/2/0/2 | 0 | 0 | [page](https://www.innovadiscs.com/disc/rat/) |
| Innova | RocX3 | b3f013430c90 | 5/4/0/3.5 | 5/4/0/3.5 | 0 | 0 | [page](https://www.innovadiscs.com/disc/rocx3/) |
| Innova | Rollo | 9ff7a79182c5 | 5/6/-4/1 | 5/6/-4/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/rollo/) |
| Innova | Shark | f4a9f4ad8728 | 4/4/0/2 | 4/4/0/2 | 0 | 0 | [page](https://www.innovadiscs.com/disc/shark/) |
| Innova | Skeeter | 247e3acfed50 | 5/5/-1/1 | 5/5/-1/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/skeeter/) |
| Innova | Spider | 335c3c7ebaf6 | 5/3/0/1 | 5/3/0/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/spider/) |
| Innova | Starfire | de5fae9bdfd1 | 10/4/0/3 | 10/4/0/3 | 0 | 0 | [page](https://www.innovadiscs.com/disc/starfire/) |
| Innova | Stud | 4b15bab04db5 | 3/3/0/2 | 3/3/0/2 | 0 | 0 | [page](https://www.innovadiscs.com/disc/stud/) |
| Innova | Sync | 6755c6d37dee | 3/3/0/1 | 3/3/0/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/sync/) |
| Innova | VRoc | 06e580e31cd6 | 4/4/0/1 | 4/4/0/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/vroc/) |
| Innova | Viking | 8e6e984072ce | 9/4/-1/2 | 9/4/-1/2 | 0 | 0 | [page](https://www.innovadiscs.com/disc/viking/) |
| Innova | Viper | dd0b0609326a | 6/4/1/5 | 6/4/1/5 | 0 | 0 | [page](https://www.innovadiscs.com/disc/viper/) |
| Innova | Wahoo | c4a96f45f107 | 12/6/-2/2 | 12/6/-2/2 | 0 | 0 | [page](https://www.innovadiscs.com/disc/wahoo/) |
| Innova | Whippet | cb7f8820cdd9 | 6/3/1/5 | 6/3/1/5 | 0 | 0 | [page](https://www.innovadiscs.com/disc/whippet/) |
| Innova | Wolf | 79b4d8f24084 | 4/3/-4/1 | 4/3/-4/1 | 0 | 0 | [page](https://www.innovadiscs.com/disc/wolf/) |
| Innova | Wombat | 8ff1d42734f9 | 5/6/-1/0 | 5/6/-1/0 | 0 | 0 | [page](https://www.innovadiscs.com/disc/wombat/) |
| Innova | Xero | 49ed4d42ebc7 | 2/3/0/0 | 2/3/0/0 | 0 | 0 | [page](https://www.innovadiscs.com/disc/xero/) |
| Kastaplast | Berg X | ca1bd8961748 | 1/1/1/2 | 1/1/1/2 | 0 | 0 | [page](https://www.kastaplast.com/en-us/collections/berg-x) |
| Kastaplast | Göte | 259dd85f116e | 4/5/0/1 | 4/5/0/1 | 0 | 0 | [page](https://www.kastaplast.com/en-us/collections/gote) |
| Kastaplast | Impa | fc287a89dcea | 11/6/-4/1 | 11/6/-4/1 | 0 | 0 | [page](https://www.kastaplast.com/en-us/collections/impa) |
| Kastaplast | Järn | ad2bfd8d9d50 | 4.5/3/0/3 | 4.5/3/0/3 | 0 | 0 | [page](https://www.kastaplast.com/en-us/collections/jarn) |
| Kastaplast | Krut | 3eae002e87cb | 12/4/0/4 | 12/4/0/4 | 0 | 0 | [page](https://www.kastaplast.com/en-us/collections/krut) |
| Kastaplast | Malm | c1046cd70a48 | 10/4/0/2.5 | 10/4/0/2.5 | 0 | 0 | [page](https://www.kastaplast.com/en-us/collections/malm) |
| Kastaplast | Nord | abf5252105ff | 5/4/0/3 | 5/4/0/3 | 0 | 0 | [page](https://www.kastaplast.com/en-us/collections/nord) |
| Kastaplast | Reko X | 1e145a7bfe22 | 3/3/0/2 | 3/3/0/2 | 0 | 0 | [page](https://www.kastaplast.com/en-us/collections/reko-x) |
| Kastaplast | Stig | ca2209482786 | 6/5/-2/1 | 6/5/-2/1 | 0 | 0 | [page](https://www.kastaplast.com/en-us/collections/stig) |
| Kastaplast | Tuff | 56bff5a7c9f7 | 3/4/0/2 | 3/4/0/2 | 0 | 0 | [page](https://www.kastaplast.com/en-us/collections/tuff) |
| Kastaplast | Vass | 64462f38c5dd | 12/5/-1.5/2 | 12/5/-1.5/2 | 0 | 0 | [page](https://www.kastaplast.com/en-us/collections/vass) |
| Kastaplast | Älva | cb6962874c90 | 11/6/-2/2 | 11/6/-2/2 | 0 | 0 | [page](https://www.kastaplast.com/en-us/collections/alva) |
| Latitude 64 | Amber | cbb390068b86 | 11/6/-3/2 | 11/6/-3/2 | 0 | 0 | [page](https://latitude64.com/collections/amber) |
| Latitude 64 | Anchor | 47eb5df98be6 | 5/4/0/3 | 5/4/0/3 | 0 | 0 | [page](https://latitude64.com/collections/anchor) |
| Latitude 64 | Ballista Pro | b6fb2e87ef6e | 14/4/0/3 | 14/4/0/3 | 0 | 0 | [page](https://latitude64.com/collections/ballista-pro) |
| Latitude 64 | Beetle | 4fc6d2bbfb9f | 1/7/-1/0 | 1/7/-1/0 | 0 | 0 | [page](https://latitude64.com/products/opto-beetle) |
| Latitude 64 | Bolt | 741eb4a2be42 | 13/6/-2/3 | 13/6/-2/3 | 0 | 0 | [page](https://latitude64.com/collections/bolt) |
| Latitude 64 | Brave | f24bc1fb358a | 7/6/-1/2 | 7/6/-1/2 | 0 | 0 | [page](https://latitude64.com/collections/brave) |
| Latitude 64 | Core | 1d7ab0468e87 | 6/5/-0.5/1 | 6/5/-0.5/1 | 0 | 0 | [page](https://latitude64.com/collections/core) |
| Latitude 64 | Culverin | ebaf142f8b2f | 9/5/-0.5/3 | 9/5/-0.5/3 | 0 | 0 | [page](https://latitude64.com/collections/culverin) |
| Latitude 64 | Fire | 6c9cc7cf9425 | 5/3/0/3 | 5/3/0/3 | 0 | 0 | [page](https://latitude64.com/collections/fire) |
| Latitude 64 | Flow | bf0ece891df4 | 11/6/-0.5/2 | 11/6/-0.5/2 | 0 | 0 | [page](https://latitude64.com/collections/flow) |
| Latitude 64 | Gauntlet | 4bd5afb95920 | 2/4/0/1 | 2/4/0/1 | 0 | 0 | [page](https://latitude64.com/collections/gauntlet) |
| Latitude 64 | Gladiator | 1e5821292ba5 | 13/5/0/3.5 | 13/5/0/3.5 | 0 | 0 | [page](https://latitude64.com/products/opto-gladiator-special-edition) |
| Latitude 64 | Honor | c46f9790f2ec | 9/5/0/2.5 | 9/5/0/2.5 | 0 | 0 | [page](https://latitude64.com/collections/honor) |
| Latitude 64 | Keystone | d1496b3e27af | 2/5/-1/1 | 2/5/-1/1 | 0 | 0 | [page](https://latitude64.com/collections/keystone) |
| Latitude 64 | Maul | c2d50abcc160 | 7/7/-2/1 | 7/7/-2/1 | 0 | 0 | [page](https://latitude64.com/collections/maul) |
| Latitude 64 | Mercy | 9853c5c8c52c | 2/4/0/1 | 2/4/0/1 | 0 | 0 | [page](https://latitude64.com/collections/mercy) |
| Latitude 64 | Mighty | b880e2ae803c | 7/5/-1/2 | 7/5/-1/2 | 0 | 0 | [page](https://latitude64.com/collections/mighty) |
| Latitude 64 | Musket | 7fab95163152 | 10/5/-0.5/2 | 10/5/-0.5/2 | 0 | 0 | [page](https://latitude64.com/collections/musket) |
| Latitude 64 | Peak | 6b8da0bca39f | 3/3/0/1 | 3/3/0/1 | 0 | 0 | [page](https://latitude64.com/collections/peak) |
| Latitude 64 | Pearl | 96ca0721e754 | 4/6/-4/0 | 4/6/-4/0 | 0 | 0 | [page](https://latitude64.com/collections/pearl) |
| Latitude 64 | Pioneer | 82548ea8fbf0 | 9/3/0/4 | 9/3/0/4 | 0 | 0 | [page](https://latitude64.com/collections/pioneer) |
| Latitude 64 | Saint Pro | a1bd4250dbd9 | 8/5/-0.5/2 | 8/5/-0.5/2 | 0 | 0 | [page](https://latitude64.com/collections/saint-pro) |
| Latitude 64 | Savior | d5a494e48e66 | 4/4/0/3 | 4/4/0/3 | 0 | 0 | [page](https://latitude64.com/collections/savior) |
| Latitude 64 | Spike | f33be2172987 | 4/3/-1/1 | 4/3/-1/1 | 0 | 0 | [page](https://latitude64.com/collections/spike) |
| Latitude 64 | Striker | b1480170805f | 8/5/0/2 | 8/5/0/2 | 0 | 0 | [page](https://latitude64.com/collections/striker) |
| Latitude 64 | Strive | 85dde1aa5b70 | 13/5/-1/3 | 13/5/-1/3 | 0 | 0 | [page](https://latitude64.com/collections/strive) |
| Latitude 64 | Sweep | 3b06d170c4e6 | 9/6/-0.05/2 | 9/6/-0.5/2 | -0.45 | 0 | [page](https://latitude64.com/collections/sweep) |
| Lone Star Discs | Armadillo | ac040fa527dc | 1/2/0/1 | 1/2/0/1 | 0 | 0 | [page](https://www.lonestardiscs.com/products/armadillo-putter) |
| Lone Star Discs | Artemis | 2cbdaa78c008 | 4/4/0/3 | 4/4/0/2 | 0 | -1 | [page](https://www.lonestardiscs.com/products/artemis) |
| Lone Star Discs | BB6 | 337ee40e145f | 4/5/-2/1 | 4/5/-2/1 | 0 | 0 | [page](https://www.lonestardiscs.com/products/bb6-mid-range) |
| Lone Star Discs | Bash | 2b147a2bef54 | 2/3/0/2 | 2/3/0/2 | 0 | 0 | [page](https://www.lonestardiscs.com/products/bash) |
| Lone Star Discs | Bayonet | b033a90176ed | 13/5/-2/2 | 13/5/-2/2 | 0 | 0 | [page](https://www.lonestardiscs.com/products/bayonet-distance-driver) |
| Lone Star Discs | Bearkat | b19135e88385 | 5/5/-2/1 | 5/5/-3/1 | -1 | 0 | [page](https://www.lonestardiscs.com/products/bearkat-midrange) |
| Lone Star Discs | Benny | ab2082279499 | 3/4/0/2 | 3/4/0/2 | 0 | 0 | [page](https://www.lonestardiscs.com/products/benny-putter) |
| Lone Star Discs | Bluebonnet | 80b8150c5ac1 | 2/3/0/1 | 2/3/0/1 | 0 | 0 | [page](https://www.lonestardiscs.com/products/bluebonnet-putter) |
| Lone Star Discs | Bowie  | 8ac082c646e6 | 13/5/-1/3 | 13/5/-1/3 | 0 | 0 | [page](https://www.lonestardiscs.com/products/bowie) |
| Lone Star Discs | Brazos | e1e445740df8 | 7/5/0/3 | 7/5/0/3 | 0 | 0 | [page](https://www.lonestardiscs.com/products/brazos-fairway-driver) |
| Lone Star Discs | Bull Snake | fb574df2edf6 | 3/2/0/4 | 3/2/0/4 | 0 | 0 | [page](https://www.lonestardiscs.com/products/bull-snake-putter) |
| Lone Star Discs | Cactus | ea3ac774d5fa | 10/5/-2/2 | 10/5/-2/2 | 0 | 0 | [page](https://www.lonestardiscs.com/products/cactus) |
| Lone Star Discs | Chuck | 15999f8fc3b8 | 5/5/-2/1 | 5/5/-2/1 | 0 | 0 | [page](https://www.lonestardiscs.com/products/chuck-5-5-2-1) |
| Lone Star Discs | Chupacabra | f5ab07595ce1 | 9/3/0/4 | 9/3/0/4 | 0 | 0 | [page](https://www.lonestardiscs.com/products/chupacabra-fairway-driver) |
| Lone Star Discs | Copperhead | 4ff6c4065cfd | 3/4/0/2 | 3/4/0/2 | 0 | 0 | [page](https://www.lonestardiscs.com/products/copperhead-putter) |
| Lone Star Discs | Crockett | d88ad879dad8 | 13/5/-1/3 | 13/4/-1/3 | 0 | 0 | [page](https://www.lonestardiscs.com/products/crockett-distance-driver) |
| Lone Star Discs | Curl | fe07d198be92 | 11/5/-1/2 | 11/5/-1/2 | 0 | 0 | [page](https://www.lonestardiscs.com/products/curl-distance-driver) |
| Lone Star Discs | Desperado | 9a7ba20bf55b | 9/5/-2/1 | 9/5/-2/1 | 0 | 0 | [page](https://www.lonestardiscs.com/products/desperado-9-5-2-1-copy) |
| Lone Star Discs | Dos X | 3e85af4e2704 | 8/4/-1/2 | 8/4/-1/2 | 0 | 0 | [page](https://www.lonestardiscs.com/products/dos-x) |
| Lone Star Discs | Frio | 86147cd23dc6 | 7/5/-1/1 | 7/5/-1/1 | 0 | 0 | [page](https://www.lonestardiscs.com/products/frio-fairway-driver) |
| Lone Star Discs | Growler | 37043487ef65 | 12/6/-3/2 | 12/6/-3/2 | 0 | 0 | [page](https://www.lonestardiscs.com/products/growler-distance-driver) |
| Lone Star Discs | Houston | 52acd129c81f | 5/5/0/2 | 5/5/0/2 | 0 | 0 | [page](https://www.lonestardiscs.com/products/coming-soon-houston-5-5-0-2-copy) |
| Lone Star Discs | Lariat | 14dbfe1e1be9 | 9/5/-1/1 | 9/5/-1/1 | 0 | 0 | [page](https://www.lonestardiscs.com/products/lariat-fairway-driver) |
| Lone Star Discs | Lone Wolf | 78da2edc3101 | 5/5/-3/1 | 5/5/-4/1 | -1 | 0 | [page](https://www.lonestardiscs.com/products/lone-wolf-midrange) |
| Lone Star Discs | Nimitz | 849d8add9fb2 | 11/5/-1/3 | 11/5/-1/3 | 0 | 0 | [page](https://www.lonestardiscs.com/products/nimitz-distance-driver) |
| Lone Star Discs | Rio Grande | 5bf6b88bf8bf | 7/5/-2/1 | 7/5/-2/1 | 0 | 0 | [page](https://www.lonestardiscs.com/products/rio-grande-7-5-2-1) |
| Lone Star Discs | Seguin | c603780885f5 | 13/5/0/3 | 13/5/0/3 | 0 | 0 | [page](https://www.lonestardiscs.com/products/seguin-distance-driver) |
| Lone Star Discs | Spur | 5928e2030c0c | 9/4/0/3 | 9/4/0/3 | 0 | 0 | [page](https://www.lonestardiscs.com/products/spur-fairway-driver) |
| Lone Star Discs | Tombstone | 515eb4c8c278 | 13/4/0/4 | 13/4/0/4 | 0 | 0 | [page](https://www.lonestardiscs.com/products/tombstone-distance-driver) |
| Lone Star Discs | Tumbleweed | fbf0979e6b99 | 10/6/-4/1 | 10/6/-3/1 | 1 | 0 | [page](https://www.lonestardiscs.com/products/tumbleweed) |
| Lone Star Discs | Walker | dfd84d889d8e | 5/3/0/4 | 5/5/0/4 | 0 | 0 | [page](https://www.lonestardiscs.com/products/walker-midrange) |
| Lone Star Discs | Warbird | fb0149cc2475 | 12/6/-1/3 | 12/6/-1/3 | 0 | 0 | [page](https://www.lonestardiscs.com/products/warbird-distance-driver) |
| Lone Star Discs | Wrangler | 10936a66e929 | 9/5/-1/2 | 9/5/-1/2 | 0 | 0 | [page](https://www.lonestardiscs.com/products/wrangler-fairway-driver-9048) |
| Lone Star Discs | Yellow Rose | 5aeb9a1e3006 | 2/4/0/1 | 2/4/0/1 | 0 | 0 | [page](https://www.lonestardiscs.com/products/yellow-rose-putter-9063) |
| MVP | Amp | 0b67cb94c19c | 8/5/-1.5/1 | 8/5/-1.5/1 | 0 | 0 | [page](https://mvpdiscsports.com/discs/amp/) |
| MVP | Anode | f4d8043218cf | 3/3/0/0.5 | 2.5/3/0/0.5 | 0 | 0 | [page](https://mvpdiscsports.com/discs/anode/) |
| MVP | Axis | 1377a0ace46f | 5/5/-1/1 | 5/5/-1/1 | 0 | 0 | [page](https://mvpdiscsports.com/discs/axis/) |
| MVP | Catalyst | 60871e273e6c | 13/5.5/-2/2 | 13/5.5/-2/2 | 0 | 0 | [page](https://mvpdiscsports.com/discs/catalyst/) |
| MVP | Control | 2cae5224a067 | 10/5/-0.5/2 | 10/5/-0.5/2 | 0 | 0 | [page](https://mvpdiscsports.com/discs/control/) |
| MVP | Detour | 999654ad76d9 | 5/5/-2/1 | 5/5/-2/1 | 0 | 0 | [page](https://mvpdiscsports.com/discs/detour/) |
| MVP | Energy | 45546ba2fc4d | 13/4/0/4 | 13/4/0/4 | 0 | 0 | [page](https://mvpdiscsports.com/discs/energy/) |
| MVP | Ion | 16cf27567840 | 2.5/3/0/1.5 | 2.5/3/0/1.5 | 0 | 0 | [page](https://mvpdiscsports.com/discs/ion/) |
| MVP | Limit | 15bfc46103c6 | 14.5/3.5/0/4 | 14.5/3.5/0/4 | 0 | 0 | [page](https://mvpdiscsports.com/discs/limit/) |
| MVP | Matrix | 614396bf6719 | 5/4/-1/2 | 5/4/-1/2 | 0 | 0 | [page](https://mvpdiscsports.com/discs/matrix/) |
| MVP | Motion | 3c8852a77e48 | 9/3.5/0/4 | 9/3.5/0/4 | 0 | 0 | [page](https://mvpdiscsports.com/discs/motion/) |
| MVP | Nomad | 3b2d2e555496 | 2/4/0/1 | 2/4/0/1.5 | 0 | 0.5 | [page](https://mvpdiscsports.com/discs/nomad/) |
| MVP | Ohm | 8bb7ec2aad8b | 2/5/0/1 | 2/5/0/1 | 0 | 0 | [page](https://mvpdiscsports.com/discs/ohm/) |
| MVP | Orbital | 7123593187b4 | 11/5/-4.5/1 | 11/5/-4.5/1 | 0 | 0 | [page](https://mvpdiscsports.com/discs/orbital/) |
| MVP | Particle | d318f15ef1aa | 3/3/0/2.5 | 3/3/0/2.5 | 0 | 0 | [page](https://mvpdiscsports.com/discs/particle/) |
| MVP | Phase | f2b9354edb42 | 11/3.5/0/4 | 11/3.5/0/4 | 0 | 0 | [page](https://mvpdiscsports.com/discs/phase/) |
| MVP | Relativity | ea64637b006d | 14.5/5.5/-3/1.5 | 14.5/5.5/-3/1.5 | 0 | 0 | [page](https://mvpdiscsports.com/discs/relativity/) |
| MVP | Relay | 545b0bfb6766 | 6/5/-2/1 | 6/5/-2/1 | 0 | 0 | [page](https://mvpdiscsports.com/discs/relay/) |
| MVP | Shock | bd52206e5d49 | 8/5/0/2.5 | 8/5/0/2.5 | 0 | 0 | [page](https://mvpdiscsports.com/discs/shock/) |
| MVP | Signal | 71210e350f70 | 6/5/-3/1 | 6/5/-3/1 | 0 | 0 | [page](https://mvpdiscsports.com/discs/signal/) |
| MVP | Spin | 234547a0a9d2 | 2.5/4/-2/0 | 2.5/4/-2/0 | 0 | 0 | [page](https://mvpdiscsports.com/discs/spin/) |
| MVP | Stasis | e9974b90612a | 2/1/0/2.5 | 2/1/0/2.5 | 0 | 0 | [page](https://mvpdiscsports.com/discs/stasis/) |
| MVP | Switch | a91450732e20 | 6.5/5/-1.5/1 | 6.5/5/-1.5/1 | 0 | 0 | [page](https://mvpdiscsports.com/discs/switch/) |
| MVP | Tangent | e961f238e2cf | 4/4/-0.5/0.5 | 4/4/-0.5/0.5 | 0 | 0 | [page](https://mvpdiscsports.com/discs/tangent/) |
| MVP | Terra | 213a3133ccee | 8/5/0/3 | 8/5/0/3 | 0 | 0 | [page](https://mvpdiscsports.com/discs/terra/) |
| MVP | Trail | 4051d328301c | 10/5/-1/1 | 10/5/-1/1 | 0 | 0 | [page](https://mvpdiscsports.com/discs/trail/) |
| MVP | Uplink | 4e2c0a6fd334 | 5/5/-3/0.5 | 5/5/-3/0.5 | 0 | 0 | [page](https://mvpdiscsports.com/discs/uplink/) |
| MVP | Vector | f374c49d04da | 5/4/0/2 | 5/4/0/2 | 0 | 0 | [page](https://mvpdiscsports.com/discs/vector/) |
| MVP | Watt | ce1b0eb592a0 | 2/5/-0.5/0.5 | 2/5/-0.5/0.5 | 0 | 0 | [page](https://mvpdiscsports.com/discs/watt/) |
| MVP | Zenith | 00d950e101d6 | 11/5/-0.5/2 | 11/5/-0.5/2 | 0 | 0 | [page](https://mvpdiscsports.com/discs/zenith/) |
| Millennium | Draco | 308d1731ff3c | 9/3/0/4 | 9/3/0/4 | 0 | 0 | [page](https://www.golfdisc.com/discs/draco/) |
| Millennium | Falcon | a3bb67298333 | 13/5/-2/2 | 13/5/-2/2 | 0 | 0 | [page](https://www.golfdisc.com/discs/standard-falcon/) |
| Millennium | Solstice | 257c607c36c1 | 5/4/0/3 | 5/4/0/3 | 0 | 0 | [page](https://www.golfdisc.com/discs/solstice/) |
| Millennium | Taurus | ed4c8caa05b5 | 4/4/0/4 | 4/4/0/4 | 0 | 0 | [page](https://www.golfdisc.com/discs/taurus/) |
| Mint Discs | Bobcat | 10c2e3829ca2 | 5/4/0/2.5 | 5/4/0/2.5 | 0 | 0 | [page](https://mintdiscs.com/products/bobcat-apex-plastic-tacocat) |
| Mint Discs | Goat (aka G.O.A.T, aka The GOAT, aka The Greatest of All Time) | f7fe6bed7cd0 | 12/4/-1/3 | 12/4/-1/3 | 0 | 0 | [page](https://mintdiscs.com/products/goat-vault-collection) |
| Mint Discs | Grackle | 4a43160bbb67 | 7/5/-1/2 | 7/5/-1/2 | 0 | 0 | [page](https://mintdiscs.com/products/grackle-vault-collection) |
| Mint Discs | Idol | f79387f2ecff | 13/5/-1/3 | 13/5/-1/2.5 | 0 | -0.5 | [page](https://mintdiscs.com/products/idol-apex-firm-ap-id01-25) |
| Mint Discs | Jackalope | 671fd49ee65e | 8/5/-2/1 | 8/5/-2/1 | 0 | 0 | [page](https://mintdiscs.com/products/jackalope-nocturnal-glow-plastic-tacolope) |
| Mint Discs | Lasso | bceba4e8740d | 3/3/0/2 | 3/3/0/2 | 0 | 0 | [page](https://mintdiscs.com/products/lasso-apex-plastic-dust-up-by-brad-bond) |
| Mint Discs | Mustang | 7cab0cc4ebb0 | 5/5/0/2 | 5/4/0/2 | 0 | 0 | [page](https://mintdiscs.com/products/mustang-apex-plastic-ap-mt04-26) |
| Mint Discs | Phoenix | e25d935fbdd5 | 9/3/0/4 | 9/3/0/4 | 0 | 0 | [page](https://mintdiscs.com/products/phoenix-vault-collection) |
| Mint Discs | Pizza (renamed from Mystery Box (2025)) | c25ced66a19a | 8/5/-1/2 | 8/5/-1/2 | 0 | 0 | [page](https://mintdiscs.com/products/pizza-name-this-new-plastic) |
| Mint Discs | Rodeo | 83ff3c29232f | 5/5/-1/3 | 5/5/-1/3 | 0 | 0 | [page](https://mintdiscs.com/products/rodeo-royal-plastic-ro-rd01-26) |
| Mint Discs | UFO | ae06c4e2e676 | 2/3/0/1 | 2/3/0/1 | 0 | 0 | [page](https://mintdiscs.com/products/ufo-vault-collection) |
| Prodigy | A4 | 6535d0ea9c2e | 4/3/-1/3 | 4/3/-1/3 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-a4-300-plastic) |
| Prodigy | Archive | d3e045b2aa49 | 5/5/0/2 | 5/5/0/2 | 0 | 0 | [page](https://prodigydisc.com/products/archive-400-plastic-test-run-stamp) |
| Prodigy | D2 Pro | 732b67fe05bd | 13/5/-1/3 | 12/5/-1/3 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-d2-pro-750-plastic) |
| Prodigy | D4 | a85de7c64d5b | 12/5/-2/2 | 12/5/-2/2 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-d4-400-plastic) |
| Prodigy | D6 | 9c5d47df33a7 | 12/6/-3/2 | 12/6/-3/2 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-d6-400-plastic) |
| Prodigy | FX-4 | c73c0fcdb4b8 | 9/5/-2/2 | 9/5/-2/2 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-fx-4-400-plastic) |
| Prodigy | Feedback | 974b9557d6a4 | 9/5/-1/3 | 9/5/-1/3 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-feedback-750-plastic) |
| Prodigy | Good Boy (renamed from P Model S) | f62919664dad | 3/5/0/2 | 3/5/0/2 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-good-boy-300-plastic) |
| Prodigy | H4 V2 | 10e64029ec84 | 10/5/-2/1 | 10/5/-2/1 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-h4-v2-400-plastic) |
| Prodigy | H5 | 9cabc38157a7 | 10/5/-3/1 | 10/5/-3/1 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-h5-300-kaleidoscope-stamp) |
| Prodigy | H6 | 36a715c24f36 | 11/5/-3/1 | 11/5/-3/1 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-h6-400-plastic) |
| Prodigy | H7 | 9a7ff80ce89a | 10/5/-4/1 | 10/5/-4/1 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-h7-400-plastic) |
| Prodigy | M1 | a71e7b24a226 | 5/4/0/3 | 5/4/0/3 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-m1-300-plastic) |
| Prodigy | M2 (originally M3) | c45630643a19 | 5/4/0/2 | 5/4/0/2 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-m2-400-plastic) |
| Prodigy | M5 | e905af456041 | 5/5/-3/1 | 5/5/-2/0.5 | 1 | -0.5 | [page](https://prodigydisc.com/products/prodigy-m5-400-plastic) |
| Prodigy | MX-1 | fa0549a34d1a | 5/3/0/4 | 5/3/0/4 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-mx-1-500-plastic) |
| Prodigy | MX-3 | 3205dcedf6c3 | 5/4/0/1 | 5/4/0/1 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-mx-3-750-plastic) |
| Prodigy | PA-5 | a7b3ff57c5ae | 3/4/-2/0.5 | 3/4/-2/0.5 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-pa-5-300-plastic) |
| Prodigy | PX-3 | ef746b9a966a | 3/3/0/2 | 3/3/0/2 | 0 | 0 | [page](https://prodigydisc.com/products/prodigy-px-3-500-plastic) |
| RPM | Huia (DGFD1) | 5fb8291a41d2 | 7/5/0/2 | 7/5/0/2 | 0 | 0 | [page](https://www.rpmdiscs.com/product/huia/) |
| RPM | Kotuku (MR3) | 69f67126aa30 | 5/5/0/2 | 5/5/0/2 | 0 | 0 | [page](https://www.rpmdiscs.com/product/kotuku/) |
| RPM | Pekapeka (DGFD2) | 946d315cf098 | 9/5/-3/1 | 9/6/-3/1 | 0 | 0 | [page](https://www.rpmdiscs.com/product/pekapeka/) |
| RPM | Piwakawaka (MR1, originally Arcturus) | 23439096c25d | 6/6/-3/0 | 6/6/-3/0 | 0 | 0 | [page](https://www.rpmdiscs.com/product/piwakawaka/) |
| RPM | Ruru (PA2) | a78c0a2cd01a | 2/3/0/1 | 2/3/0/1 | 0 | 0 | [page](https://www.rpmdiscs.com/product/ruru/) |
| RPM | Takapu (PA3) | d9a027776f1e | 2/3/0/2 | 2/3/0/2 | 0 | 0 | [page](https://www.rpmdiscs.com/product/takapu/) |
| RPM | Tara Iti (Fairy Tern, DGFD3) | 3415e87bf14b | 10/5/0/2 | 10/5/0/2 | 0 | 0 | [page](https://www.rpmdiscs.com/product/tara-iti/) |
| Sacred Discs | Arrowhead | 9a585b59c36a | 4/3/0/1 | 4/3/0/1 | 0 | 0 | [page](https://sacreddiscs.com/products/arrowhead-midrange) |
| Sacred Discs | Gnome | 5f1f9600e758 | 2/3/0/1 | 2/2/0/1 | 0 | 0 | [page](https://sacreddiscs.com/products/gnome-putt-and-approach) |
| Sacred Discs | Oracle | e9a73b452f48 | 7/5/-2/2 | 7/5/-2/2 | 0 | 0 | [page](https://sacreddiscs.com/products/oracle-fairway-driver) |
| Sacred Discs | Starship | d4118ad32ca0 | 13/6/-1/2 | 13/6/-1/2 | 0 | 0 | [page](https://sacreddiscs.com/products/starship-distance-driver) |
| Streamline | Ascend | 4822c2f398f0 | 6/5/-3/0.5 | 6/5/-3/0.5 | 0 | 0 | [page](https://streamlinediscs.com/discs/ascend/) |
| Streamline | Boost | b71584bda7ab | 9.5/4/0/2.5 | 9.5/4/0/2.5 | 0 | 0 | [page](https://streamlinediscs.com/discs/boost/) |
| Streamline | Drift | 228da5fb5d15 | 7/5/-2/1 | 7/5/-2/1 | 0 | 0 | [page](https://streamlinediscs.com/discs/drift/) |
| Streamline | Echo | c25c9d1a9d02 | 5/5/-1.5/1 | 5/5/-1.5/1 | 0 | 0 | [page](https://streamlinediscs.com/discs/echo/) |
| Streamline | Engine | 6a9d87229e9b | 13/5/-0.5/2 | 13/5/-0.5/2 | 0 | 0 | [page](https://streamlinediscs.com/discs/engine/) |
| Streamline | Flare | df4c47626f73 | 9/4/0/3.5 | 9/4/0/3.5 | 0 | 0 | [page](https://streamlinediscs.com/discs/flare/) |
| Streamline | Jet | c7a63698a165 | 11/5/-3/2 | 11/5/-3/2 | 0 | 0 | [page](https://streamlinediscs.com/discs/jet/) |
| Streamline | Lift | ef1e45bd3bee | 9/5/-2/1.5 | 9/5/-2/1.5 | 0 | 0 | [page](https://streamlinediscs.com/discs/lift/) |
| Streamline | Parachute | 9fe65c24eadf | 1/7/0/0.5 | 1/7/0/0.5 | 0 | 0 | [page](https://streamlinediscs.com/discs/parachute/) |
| Streamline | Pilot | 71fcb40815bd | 2/5/-1/1 | 2/5/0/1 | 1 | 0 | [page](https://streamlinediscs.com/discs/pilot/) |
| Streamline | Range | 9bf86a5ac536 | 2/1/-0.5/0.5 | 2/1/-0.5/0.5 | 0 | 0 | [page](https://streamlinediscs.com/discs/range/) |
| Streamline | Runway | bbb2a6df791a | 5/4/0/3.5 | 5/4/0/3.5 | 0 | 0 | [page](https://streamlinediscs.com/discs/runway/) |
| Streamline | Shift | 986da5e91ec7 | 9/5/-3/1 | 9/5/-3/1 | 0 | 0 | [page](https://streamlinediscs.com/discs/shift/) |
| Streamline | Stabilizer | 91d7bcf5e5d6 | 3/3.5/0/3 | 3/3.5/0/3 | 0 | 0 | [page](https://streamlinediscs.com/discs/stabilizer/) |
| Streamline | Trace | 518d7ced84e6 | 11/5/-1/2 | 11/5/-1/2 | 0 | 0 | [page](https://streamlinediscs.com/discs/trace/) |
| Streamline | Turbulence | 8cf244c600e8 | 7/2/0/3.5 | 7/2/0/3.5 | 0 | 0 | [page](https://streamlinediscs.com/discs/turbulence/) |
| Trash Panda Disc Golf | Dune | 2530fb6f044a | 5/5/-1/0 | 5/5/-1/0 | 0 | 0 | [page](https://trashpandadiscgolf.com/products/dune-premium-recycled-disc-golf-midrange) |
| Trash Panda Disc Golf | Ozone | cee94badffd2 | 8/6/-3/1 | 8/6/-3/1 | 0 | 0 | [page](https://trashpandadiscgolf.com/products/ozone-premium-recycled-disc-golf-fairway-driver) |
| Trash Panda Disc Golf | Procyon | 3340cc70378d | 11.5/4/-1/2 | 11.5/4/-1/2 | 0 | 0 | [page](https://trashpandadiscgolf.com/products/procyon) |
| Westside Discs | Anvil | 5d7a14edf8b2 | 4/2/0/4 | 4/2/0/4 | 0 | 0 | [page](https://westsidediscs.com/collections/anvil) |
| Westside Discs | Bard (Laulaja1) | 4edf91d03b3e | 5/4/0/3 | 5/4/0/3 | 0 | 0 | [page](https://westsidediscs.com/collections/bard) |
| Westside Discs | Bear | 33e0b9f754ff | 8/6/-0.5/2.5 | 8/6/-0.5/2.5 | 0 | 0 | [page](https://westsidediscs.com/collections/bear) |
| Westside Discs | Boatman (Tuonelan Lautturi1) | 3783caf73348 | 11/5/0/2 | 11/5/0/2 | 0 | 0 | [page](https://westsidediscs.com/collections/boatman) |
| Westside Discs | Catapult (Katapultt1) | be101e170a04 | 14/4/-0.5/3 | 14/4/-0.5/3 | 0 | 0 | [page](https://westsidediscs.com/collections/catapult) |
| Westside Discs | Crown (Kruunu1) | 3857680e6a88 | 3/4/0/1 | 3/4/0/1 | 0 | 0 | [page](https://westsidediscs.com/collections/crown) |
| Westside Discs | Destiny (Kohtalo1) | ce9d67c78299 | 14/6/-2/3 | 14/6/-2/3 | 0 | 0 | [page](https://westsidediscs.com/collections/destiny) |
| Westside Discs | Fortress (Linnoitus1) | fbf5c150f835 | 10/4/0/3 | 10/4/0/3 | 0 | 0 | [page](https://westsidediscs.com/collections/fortress) |
| Westside Discs | Hatchet (Sotakipves1) | 4b35eda75a85 | 9/6/-2/1 | 9/6/-2/1 | 0 | 0 | [page](https://westsidediscs.com/collections/hatchet) |
| Westside Discs | King (Pohjolan Isäntä1) | 1ff054d551cd | 14/5/-1.5/3 | 14/5/-1.5/3 | 0 | 0 | [page](https://westsidediscs.com/collections/king) |
| Westside Discs | Longbowman (Jousimies1) | 91de6a0c5a3a | 9/4/0/3 | 9/4/0/3 | 0 | 0 | [page](https://westsidediscs.com/collections/longbowman) |
| Westside Discs | Northman (Pohjan Poika1) | fc817a019b63 | 10/5/-1/2 | 10/5/-1/2 | 0 | 0 | [page](https://westsidediscs.com/collections/northman) |
| Westside Discs | Pine (Hornan Honka1) | 6b80eadc05dc | 5/4/0/2 | 5/4/0/2 | 0 | 0 | [page](https://westsidediscs.com/collections/pine) |
| Westside Discs | Prince | b8107b36085a | 13/5/0/3 | 13/5/0/3 | 0 | 0 | [page](https://westsidediscs.com/collections/prince) |
| Westside Discs | Queen (Pohjolan Emäntä1) | 0197e9781f90 | 14/5/-3/2 | 14/5/-3/2 | 0 | 0 | [page](https://westsidediscs.com/collections/queen) |
| Westside Discs | Sampo | 6a88e115c5ef | 10/4/-1/2 | 10/4/-1/2 | 0 | 0 | [page](https://westsidediscs.com/collections/sampo) |
| Westside Discs | Seer (Ennustaja1) | b77be8aa4630 | 7/5/-2/1 | 7/5/-2/1 | 0 | 0 | [page](https://westsidediscs.com/collections/seer) |
| Westside Discs | Shield (Kilpi1) | 655327d2339f | 3/3/0/1 | 3/3/0/1 | 0 | 0 | [page](https://westsidediscs.com/collections/shield) |
| Westside Discs | Sling (Linko1) | 617006feb51e | 5/5/0/1 | 5/5/0/1 | 0 | 0 | [page](https://westsidediscs.com/collections/sling) |
| Westside Discs | Sorcerer (Tietäjä1) | 83a6d64ff7ab | 13/5/-0.5/3 | 13/5/-0.5/3 | 0 | 0 | [page](https://westsidediscs.com/collections/sorcerer) |
| Westside Discs | Stag (Hiiden Hirvi1) | 63b0a8f399f6 | 8/6/-1/2 | 8/6/-1/2 | 0 | 0 | [page](https://westsidediscs.com/collections/stag) |
| Westside Discs | Sword (Kalevan Miekka1) | 39ae398a3e43 | 12/5/-0.5/2 | 12/5/-0.5/2 | 0 | 0 | [page](https://westsidediscs.com/collections/sword) |
| Westside Discs | Tide | a2b1070dc4c4 | 12/6/-0.5/3 | 12/6/-0.5/3 | 0 | 0 | [page](https://westsidediscs.com/collections/tide) |
| Westside Discs | Tursas (Tursas1) | 65269132e9ef | 5/5/-2/1 | 5/5/-2/1 | 0 | 0 | [page](https://westsidediscs.com/collections/tursas) |
| Westside Discs | Underworld (Manala1) | d3b86b33d170 | 7/6/-3/1 | 7/6/-3/1 | 0 | 0 | [page](https://westsidediscs.com/collections/underworld) |
| Westside Discs | Vellamo | c34fdbba0a49 | 5/5.5/0/1.5 | 5/5.5/0/1.5 | 0 | 0 | [page](https://westsidediscs.com/collections/vellamo) |
| Westside Discs | War Horse | e19ac2f13698 | 13/4/0/4 | 13/4/0/4 | 0 | 0 | [page](https://westsidediscs.com/collections/war-horse) |
| Westside Discs | Warship (Pursi1) | e367cccfe875 | 5/6/0/1 | 5/6/0/1 | 0 | 0 | [page](https://westsidediscs.com/collections/warship) |
