# Stability sampling audit — does the long tail hold?

Plan 10 follow-up. Researched October 4, 2026. **Proposals only. Nothing has been applied** — `source-data/verified-model-overrides.json`, `public/data.json` and all map code are untouched. Nothing committed or pushed. The only files added are this document and the draw script `scripts/sampling-audit-draw.mjs`.

## Bottom line

- **The propose-change rate holds: 3/50 (6%) here (95% interval 2%–16%) against about 5% (~10 of 198) in the researched set.** At n = 50 these cannot be told apart.
- **That is weaker reassurance than it looks.** 12/50 (24%) of the sample is "too thin to call" — 24 of the 50 discs have under 10 Infinite ratings, so a confirmation rests on the maker's number plus retailer agreement and little else. A confirmation there means "nothing contradicts it," not "verified."
- **Where evidence exists, deviations appear more often.** Of the 11 sampled discs with 30+ Infinite ratings, 6 carry a candidate or proposal; of the 15 with 10–29, 4; of the 24 with under 10, 1. Most of those are half-point reviewer-sentiment candidates of the kind the 198 batches recorded as "watches," not changes.
- **The one real error mode found is catalog lag against the manufacturer's own page, and it clusters in small brands.** All three proposals (Harrier, Timberwolf, Narwhal) are small-brand discs whose Atlas row came from a retailer snapshot that differs from the maker's current page. 0 of the 19 sampled discs from the big six brands needed a proposal; 3 of the other 31 did. That is suggestive, not significant (Fisher exact, two-sided p ≈ 0.28).
- **No class shows directional bias.** Distance drivers are flagged most (4 of 12) and turn is the number in dispute in 9 of the 11 flagged discs, but the candidates split five to four between "more understable than printed" and "more stable than printed."

Per-disc verdicts are in the table below. The three proposals and the eight candidates (plus Recon) have full entries.

## Results at a glance

| Verdict | Count | Share |
|---|---|---|
| Confirm (nothing contradicts; sources agree) | 27 | 54% |
| Too thin to call (nothing contradicts; too little evidence to test) | 12 | 24% |
| Confirm + open candidate (Atlas matches the maker; reviewers or community point elsewhere; recorded, not proposed) | 8 | 16% |
| **Propose change (review-gated)** | **3** | **6%** |

**Against the researched 198.** The queue's "File complete" summary counts six applied corrections, two pending in the main tree, an owner-approved Grym override, and about a dozen open candidates across 178 molds. Reading it as roughly 10 proposals (5%) and roughly 22 flagged in all (about 12%), the sample gives:

| | Researched 198 (from the queue's own tally) | This sample (n = 50) |
|---|---|---|
| Proposed / applied change | ~5% | 3/50 (6%), interval 2%–16% |
| Proposal or open candidate | ~12% (by my count of its summary lists) | 11/50 (22%), interval 13%–35% |
| Too thin to call | ~13% (about 23 of 178) | 12/50 (24%) |

The candidate and thin rates are higher here. Two reasons not to read that as the catalog getting worse: the 198 were the most-thrown molds with large Infinite review pools, and my bar for recording a candidate (a reviewer shift of 0.4 or more that DGCR posts corroborate) may be looser than the earlier batches' bar. The comparison on the proposal rate is the cleanest one.

## The sample

Drawn by [scripts/sampling-audit-draw.mjs](../scripts/sampling-audit-draw.mjs), a seeded PRNG whose seed comes from `crypto.randomBytes`. **Seed `6acbc44a1b96a215`**; rerun with `--seed 6acbc44a1b96a215` to reproduce the identical list.

- **Pool:** the 1182 discs in `public/data.json` with complete flight numbers, minus 207 excluded ids, leaves **977 eligible** (close to the ~984 expected). Excluded: every catalog id that appears anywhere in `docs/stability-review-queue.md`, every brand + base-name matching one of its headings (so "MD3 (old)" is excluded alongside "MD3 (new)"), and every id in `verified-model-overrides.json`.
- **Strata:** four speed classes by speed (putter ≤ 3, mid 4–5, fairway 6–8, distance ≥ 9) crossed with three stability classes by turn + fade (understable ≤ -1, stable 0–1, overstable ≥ 2). That gives 12 cells at 4 each (48), plus 2 extra from randomly chosen cells. The cuts use the Atlas numbers, not the catalog's category labels, which disagree in places (Jaguar at 5.5 lands in "fairway" here though Innova calls it a midrange; AGL sells the speed-4 Douglas Fir as a putter).
- **Brand cap:** no more than 8 per brand. The draw never came near it (Innova is the largest at 6). No mold appears twice.

| Speed class | understable | stable | overstable | total |
|---|---|---|---|---|
| putter | 4 | 4 | 5 | 13 |
| mid | 4 | 4 | 5 | 13 |
| fairway | 4 | 4 | 4 | 12 |
| distance | 4 | 4 | 4 | 12 |

Brands: Innova 6, Discraft 4, Clash Discs 4, Mint Discs 3, Discmania 3, Legacy 3, Latitude 64 2, DGA 2, Prodigy 2, Above Ground Level 2, Yikun 2, Dynamic Discs 2, Infinite Discs 2, Prodiscus 2, RPM 1, Vibram Disc Golf 1, Wild Discs 1, Crosslap 1, Doomsday Discs 1, Daredevil Discs 1, Jester Disc Golf 1, Divergent Discs 1, Axiom 1, Lone Star Discs 1, Disctroyer OÜ 1.

### The 50 discs, before any research

| # | Disc | Brand | Atlas S/G/T/F | Stratum | Atlas row source |
|---|---|---|---|---|---|
| 1 | Artifact | Infinite Discs | 2/3/-1/0 | putter / understable | Marshall Street |
| 2 | Hammer | Innova | 2/2/-1/2 | putter / stable | Infinite mfr line |
| 3 | Pickle | Mint Discs | 2/3.5/0/1.5 | putter / stable | Marshall Street |
| 4 | Prowler | Legacy | 2/2/0/2 | putter / overstable | Marshall Street |
| 5 | Putt'r | Discraft | 2/2/-1/1 | putter / stable | Marshall Street |
| 6 | Roost (renamed from RW-0325-P (Ricky Wysocki Proto Putter)) | Discraft | 2/5/0/2 | putter / overstable | Infinite mfr line |
| 7 | Sea Otter | Wild Discs | 2/3/0/2 | putter / overstable | Marshall Street |
| 8 | Hydra | Innova | 3/3/0/2 | putter / overstable | Marshall Street |
| 9 | Iris | Jester Disc Golf | 3/4/-2/0 | putter / understable | Marshall Street |
| 10 | Jokeri | Prodiscus | 3/3/1/2 | putter / overstable | Marshall Street |
| 11 | Mirage | Innova | 3/4/-3/0 | putter / understable | Marshall Street |
| 12 | Narwhal | Divergent Discs | 3/3/-2/0.5 | putter / understable | Infinite mfr line |
| 13 | Tui (PA1) | RPM | 3/4/-1/0.5 | putter / stable | Infinite mfr line |
| 14 | Cohort | Infinite Discs | 3.5/4/0/1 | mid / stable | Marshall Street |
| 15 | Douglas Fir | Above Ground Level | 4/3/-2/1 | mid / understable | Marshall Street |
| 16 | Mint | Clash Discs | 4/3/0/3 | mid / overstable | Marshall Street |
| 17 | Peach | Clash Discs | 4/5/-2/1 | mid / understable | Marshall Street |
| 18 | Shu (耳鼠, Er Shu) | Yikun | 4/5/-2/1 | mid / understable | Infinite mfr line |
| 19 | Woodpecker (Rähn) | Disctroyer OÜ | 4/3/0/3 | mid / overstable | Infinite mfr line |
| 20 | Barracuda | Innova | 5/4/-2/3 | mid / stable | Infinite mfr line |
| 21 | Gauge | Legacy | 5/5/0/1 | mid / stable | Marshall Street |
| 22 | Juniper | Above Ground Level | 5/6/-2/1 | mid / understable | Marshall Street |
| 23 | MX-2 (renamed from Prodigy Club Midrange) | Prodigy | 5/4/0/3 | mid / overstable | Infinite mfr line |
| 24 | Origin | Discmania | 5/5/-1/1 | mid / stable | Marshall Street |
| 25 | Taco | Mint Discs | 5/5/0/2 | mid / overstable | Marshall Street |
| 26 | Troija | Prodiscus | 5/3/1/4 | mid / overstable | Infinite mfr line |
| 27 | Jaguar | Innova | 5.5/6/-3/2 | fairway / understable | Infinite mfr line |
| 28 | Eclipse | Discraft | 7/5/-2/2 | fairway / stable | Infinite mfr line |
| 29 | Millet | Clash Discs | 7/6/-3/1 | fairway / understable | Marshall Street |
| 30 | Vamp | Vibram Disc Golf | 7/5/-2/1 | fairway / understable | Infinite mfr line |
| 31 | XXX | Latitude 64 | 7/3/0/4 | fairway / overstable | Marshall Street |
| 32 | F1 | Prodigy | 8/4/-1/3 | fairway / overstable | Marshall Street |
| 33 | Pipeline | DGA | 8/5/0/2 | fairway / overstable | Marshall Street |
| 34 | Rockstar | Discmania | 8/5/-2/1 | fairway / understable | Marshall Street |
| 35 | Solar Death Ray | Doomsday Discs | 8/5/-1/1 | fairway / stable | Marshall Street |
| 36 | Talon | Discraft | 8/3/1/3 | fairway / overstable | Marshall Street |
| 37 | Timberwolf | Daredevil Discs | 8/5/-1/1 | fairway / stable | Marshall Street |
| 38 | Vision | Latitude 64 | 8/6/-1/2 | fairway / stable | Infinite mfr line |
| 39 | Avalanche | DGA | 9/3/0/4 | distance / overstable | Marshall Street |
| 40 | Ginger | Clash Discs | 9/4/0/2 | distance / overstable | Marshall Street |
| 41 | Freetail | Mint Discs | 10/5/-4/1 | distance / understable | Marshall Street |
| 42 | Renegade | Dynamic Discs | 11/5/-1.5/2.5 | distance / stable | Marshall Street |
| 43 | Vanish | Axiom | 11/5/-3/2 | distance / understable | Marshall Street |
| 44 | Astronaut | Discmania | 12/6/-4/1 | distance / understable | Marshall Street |
| 45 | Harrier | Lone Star Discs | 12/6/-3/2 | distance / understable | Marshall Street |
| 46 | Twin Swords (双刃剑) | Yikun | 12/5/-1/2 | distance / stable | Marshall Street |
| 47 | Company | Crosslap | 13/4/0/3 | distance / overstable | Infinite mfr line |
| 48 | Groove | Innova | 13/6/-2/2 | distance / stable | Marshall Street |
| 49 | Recon | Legacy | 13/5/0/3 | distance / overstable | Marshall Street |
| 50 | Freedom | Dynamic Discs | 14/5/-3/3 | distance / stable | Infinite mfr line |

## Method, and what it could not reach

Same method and gates as the 20 batches: manufacturer numbers and copy, retailer stability ratings (Infinite, Marshall Street), then community. Mold-level numbers throughout; **plastics were never averaged**, and where plastic or mold-to-mold variance is large it is noted in the entry. Most-thrown plastic is not knowable without sales data, so reference plastics are named as assumed in the eleven full entries only.

**Limits — read these before trusting any "Confirm."**

- **Reddit** returns 403 to the research tooling, so r/discgolf was not sampled. **YouTube** was not usable beyond search-result titles. Same as the 198.
- **DGCR** was readable with a plain `curl` and a browser user-agent. I read one thread each for Twin Swords, Origin, Rockstar, Timberwolf, Pipeline, Jokeri and Groove (plus Astronaut for context), first page only and filtered to posts that mention turn, fade, stability or flight numbers. For other discs DGCR appears only as search-result summaries and is labelled that way. Thread dates were not reliably extractable, so no posts are dated.
- **Infinite Discs' per-review endpoint was blocked.** The raw-ratings request the queue's lessons describe (`POST /Disc/DiscComments`) returned a Sucuri firewall "Access Denied" when I tried it. I did not try to work around it. So every Infinite figure here is the page's displayed "Reviewer Flight Numbers," which the queue found is **shrunk toward the displayed manufacturer numbers**. A pool of -1.6 against a display of -1 therefore understates the real shift. Review counts below are the page's rating counts.
- **No arm-speed normalization.** Almost no source states arm speed.
- **Hidden errors stay hidden.** My method finds a mismatch when a retailer disagrees with the Atlas or with the maker. If every retailer shares the same stale number, nothing here would catch it. The same is true of the 198.
- **Primary-page reads are selective.** I read the maker's own page for 14 of the 50 discs (Harrier, Timberwolf, Narwhal, Woodpecker, Prowler, Recon, F1, MX-2, Freedom, Renegade, Vision, Avalanche, Vanish, plus Twin Swords via Yikun's North American dealer). I went to those pages mostly because retailers disagreed, so the 4 mismatches among them overstate the base rate. The 6 pages read where retailers already agreed with the Atlas (Vision, Avalanche, Vanish, Freedom, Renegade, MX-2) all matched. Where retailers disagreed with the Atlas and I could read the maker, the maker sided with the Atlas in four cases (Prowler, Recon, F1, and Twin Swords via Yikun's dealer), so Infinite's manufacturer line was the stale one there, and with the retailers in three (Harrier, Timberwolf, Narwhal).
- **Marshall Street is the Atlas's own source** for 35 of the 50 rows, so it is the baseline, not independent confirmation. The other 15 rows come from Infinite's "manufacturer" line, which is retailer-reported and lagged the maker in the Narwhal case.

Abbreviations in the table: Inf = Infinite Discs; "N ratings a/b/c/d" = Infinite's displayed reviewer flight numbers over N ratings.

## Proposed changes (all review-gated)

Every proposal has |Δ| = 1.0 on at least one axis and confidence under 0.7, so all three go to the queue under both gates. **None is applied.**

### Harrier — Lone Star Discs (id 373677a0990b)

- **Atlas now:** 12/6/-3/2 (Marshall Street's "Lima Harrier" row, labelled very-understable). **Proposed:** turn -3 → -4 and fade 2 → 1 (|Δ| 1.0 each). Speed and glide unchanged.
- **Manufacturer:** Lone Star's own product page is titled "Harrier 12/6/-4/1": "a max-distance under stable driver … tailwind crushes, long hyzer-flips, and huge rollers."
- **Retailer:** Infinite manufacturer line 12/6/-4/1; reviewer line 12/6/-3.9/1 on 5 ratings (too few to be independent of the display). Marshall Street 12/6/-3/2.
- **Community:** DGCR "Lone Star Discs" thread, search summary only (not read): one poster found "the turn was severe as one would expect with -3" and had trouble flipping it up downwind; another said Lima plastic "lost some serious stability" after tree hits. That fits the older -3 number and says nothing about the current one.
- **Reference plastic (assumed):** Alpha, with Bravo more stable per a retailer summary. The Marshall row is Lima, a lightweight plastic, so **check whether -3/2 is a Lima-specific figure before treating this as a stale number.**
- **confidence:** 0.65
- **consensusNote:** The maker's current page and Infinite agree on -4/1; the only source on -3/2 is the Marshall row the Atlas inherited. Reasonably clean catalog lag, with the Lima caveat.
- **plasticVariance:** Bravo more stable than Alpha (retailer summary, one source). Not enough to record a spread.
- sources:
  - {name: Lone Star Harrier page, url: https://www.lonestardiscs.com/products/harrier-distance-driver, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Harrier (Alpha), url: https://infinitediscs.com/lone-star-disc-harrier/alpha-(lonestar), type: retailer, weight: 0.5}
  - {name: Marshall Street Lima Harrier, url: https://www.marshallstreetdiscgolf.com/product/lima-harrier, type: retailer, weight: 0.3}
  - {name: DGCR Lone Star Discs thread (search snippet, not read), url: https://www.dgcoursereview.com/threads/lone-star-discs.145425/, type: community, weight: 0.2}

### Timberwolf — Daredevil Discs (id bce1e4b41692)

- **Atlas now:** 8/5/-1/1 (Marshall Street, "Control Driver," stable). **Proposed:** fade 1 → 0 (|Δ| 1.0). Turn unchanged. Daredevil also lists speed 9 and glide 6; those are outside the turn/fade scope and are flagged for the owner.
- **Manufacturer:** Daredevil's own page: "Timberwolf (159-175 grams) 9,6,-1,0," Flex Performance plastic, "designed for the intermediate to advanced player."
- **Retailer:** Infinite manufacturer line 9/6/-1/0; reviewer line 8.7/5.6/-1.1/0.5 on 10 ratings (Stable). That supports the maker on glide and partly on fade (0.5, shrunk toward the display). Marshall Street 8/5/-1/1.
- **Community:** DGCR's Timberwolf thread (read): an early reviewer quotes a high-speed stability of -0.5 and calls it straight; another says it is "easily overpowered and flippy" but "dead straight" within its speed range. The mold's published numbers evidently changed over time, which is the likeliest source of the Marshall figure.
- **Reference plastic (assumed):** Flex Performance (the only plastic named on the maker's page).
- **confidence:** 0.65
- **consensusNote:** Maker and Infinite agree on 9/6/-1/0, reviewers sit between it and the Atlas on fade, and no one supports fade 1 besides the Marshall row.
- **plasticVariance:** null (single plastic family).
- sources:
  - {name: Daredevil Timberwolf page, url: https://daredevildiscs.com/product/timberwolf/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Timberwolf, url: https://infinitediscs.com/daredevil-timberwolf, type: retailer, weight: 0.5}
  - {name: Marshall Street Timberwolf, url: https://www.marshallstreetdiscgolf.com/product/timberwolf, type: retailer, weight: 0.3}
  - {name: DGCR Timberwolf thread, url: https://www.dgcoursereview.com/threads/timberwolf-daredevil-discs.49800/, type: community, weight: 0.3}

### Narwhal — Divergent Discs (id 01402fde9216)

- **Atlas now:** 3/3/-2/0.5 (Infinite's manufacturer line). **Proposed:** turn -2 → -1 (|Δ| 1.0) and fade 0.5 → 0 (|Δ| 0.5). Glide 3 → 5 is outside scope and flagged.
- **Manufacturer:** Divergent's own "Our discs" page: "Speed: 3 | Glide: 5 | Turn: -1 | Fade: 0." Copy: "a straight shooter with excellent glide … stays straight when thrown flat."
- **Retailer:** Infinite manufacturer line 3/3/-2/0.5 and reviewer line 3/3.3/-2/0.5 on 18 ratings; Marshall Street (Max Grip) 3/3/-2/0. The reviewer line is almost certainly an echo of the display.
- **Community:** DGCR (search summary, not read): "a 3/3/0/0 putter … shaped like a Dart with more turn than expected." So one forum voice says some turn, none says -2.
- **Reference plastic (assumed):** Max Grip (the row Marshall Street lists); unclear.
- **confidence:** 0.5
- **consensusNote:** The maker's own page disagrees with both retailers on three axes, and the reviewer evidence is too thin to arbitrate. Lowest-confidence proposal of the three; the owner should look at Divergent's current product page, which lists per-plastic detail this review did not reach.
- **plasticVariance:** unknown.
- sources:
  - {name: Divergent Discs "Our discs" page, url: https://divergentdiscs.com/ourdiscs/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Narwhal, url: https://infinitediscs.com/divergent-discs-narwhal, type: retailer, weight: 0.5}
  - {name: Marshall Street Max Grip Narwhal, url: https://www.marshallstreetdiscgolf.com/product/max-grip-narwhal, type: retailer, weight: 0.3}
  - {name: DGCR Divergent Discs thread (search snippet, not read), url: https://www.dgcoursereview.com/threads/divergent-discs.144498/, type: community, weight: 0.2}

## Open candidates (recorded, not proposed)

The maker's number matches the Atlas; secondary evidence points elsewhere. Under the same rule the 198 used, weak or reviewer-only evidence gets a watch, not a change. Reviewer figures are Infinite's displayed pools, which understate the shift.

| Disc (id) | Atlas now | Candidate | |Δ| | Evidence | Conf. |
|---|---|---|---|---|---|
| Rockstar — Discmania (c272497d8a76) | 8/5/-2/1 | turn -2 → -1, maybe fade 1 → 1.5 | 1.0 | 14 ratings 8.1/5/-1.3/1.6 against a -2/1 display. DGCR (read): "My Rockstar was like a slightly more stable Essence with a touch less glide. Like -1 turn really"; retailer summary says some find it more stable than -2 implies. Other posters report flippy specimens, though several posts were about the Hu, a related mold. Strongest of the candidates; Active Premium is the assumed reference plastic. | 0.5 |
| Troija — Prodiscus (4525a73ac180) | 5/3/1/4 | fade 4 → 5 | 1.0 | 12 ratings 5/2.4/1.1/5. A pool of 5 against a display of 4 means the raw mean is likely above 5. Retailer copy: "fade almost immediately." Infinite is the only source. | 0.45 |
| Origin — Discmania (dd7f79f18902) | 5/5/-1/1 | turn -1 → -1.5 | 0.5 | 54 ratings 5/5.2/-1.6/0.9. DGCR thread (read): "fairly neutral," then "1.75 turn and 1.25 fade," then "-2.5 turn, .25 fade" after trimming flash. Posters are split rather than shifted. Discmania's own "gently understable at higher speeds" fits the Atlas. | 0.55 |
| Pipeline — DGA (7f26a9b173c3) | 8/5/0/2 | turn 0 → -0.5 (or -1) | 0.5–1.0 | 46 ratings 8/5.1/-0.6/1.7, shrunk toward 0/2. DGCR (read): "workable turn but far from flippy," beats in to an S-flight; a search summary quotes "more like 8/5/-1/1." DGA's own stability rating of 1.5 (per a retailer summary) sits on the Atlas side. | 0.55 |
| Renegade — Dynamic (6eaec738fb95) | 11/5/-1.5/2.5 | turn -1.5 → -2 | 0.5 | 78 ratings 11/5/-2/2.5, shrunk toward -1.5. DGCR (search summaries, not read): extremely flippy; one poster says it flew like a seasoned Wraith new, then got too flippy within weeks. Matches Dynamic's own page. Lucid is the assumed reference. | 0.55 |
| Vanish — Axiom (f4997dfd1d1e) | 11/5/-3/2 | turn -3 → -2.5 | 0.5 | 31 ratings 11.4/5/-2.4/1.9. Retailer summary: "many find it more stable than the numbers suggest," beaten-in discs flip. Matches Axiom's own page. Neutron assumed. | 0.55 |
| Groove — Innova (3f2346c8192f) | 13/6/-2/2 | turn -2 → -1.5, fade 2 → 2.5 | 0.5 | 105 ratings 12.8/5.6/-1.5/2.4 (label Stable). DGCR (read): "Some are super flippy, and others fly like Firebirds." Mold-to-mold inconsistency swamps any mold-level number. Star assumed per the Innova driver rule. | 0.5 |
| Jokeri — Prodiscus (c7dc5b8029fb) | 3/3/1/2 | turn +1 → +0.5 | 0.5 | 57 ratings 3.6/3.1/0.3/2. DGCR (read): premium "massively OS," basic "straight with fade" and beats in. This is plastic spread, not a mold-level miss; premium assumed. | 0.55 |
| Recon — Legacy (48342b920a2e) | 13/5/0/3 | turn 0 → -1 | 1.0 | Filed under "too thin": Legacy's older Distance Drivers page reads 13-5-0-3 (the Atlas value), but Infinite and launch-era retailer copy read 13/5/-1/3. A conflict inside the maker/retailer record; needs a current Legacy page. | 0.45 |

Smaller watches that stayed inside the per-disc table: Twin Swords turn -1 → -0.5 (reviewer pool, mold variance), Woodpecker fade 3 → 3.5 (Disctroyer's *expected* prototype number), Ginger fade 2 → 2.5, Prowler fade/glide (Infinite 2/3/0/1.5), Jaguar turn (heavy-disc reports), Vamp turn.

## Per-disc verdicts

Sorted by speed class, then speed. "Too thin" = no contradiction found but too little evidence to test the number. All Atlas figures are mold-level; no plastic averaging.

| # | Disc (brand) | Atlas S/G/T/F | Verdict | Conf. | Evidence |
|---|---|---|---|---|---|
| 1 | Artifact (Infinite Discs) | 2/3/-1/0 | Confirm | 0.65 | Atlas = Infinite's own 2/3/-1/0 (not independent of the retailer). 6 ratings 2/3.1/-1.1/0. Reviewer (search summary): turn and fade "close to correct" if not overpowered, a bit more glide. |
| 2 | Hammer (Innova) | 2/2/-1/2 | Too thin | 0.5 | Atlas = Inf mfr line; Innova's page 404s (mold not on current site). 2 Inf ratings 2.2/2/-1/1.8. DGCR review (search summary): flies like a Deputy with a bead, a bit more stable. Nothing contradicts, little to test. |
| 3 | Pickle (Mint Discs) | 2/3.5/0/1.5 | Too thin | 0.5 | Atlas = retailer listings 2/3.5/0/1.5; Inf 3 ratings 2.1/3.5/0/1.5 (label Stable). Retailer copy: straighter than most overstable putters, soft forward fade. Mint's own page not readable; no independent review. |
| 4 | Prowler (Legacy) | 2/2/0/2 | Confirm | 0.55 | Atlas 2/2/0/2 = Legacy's own putter page (2-2-0-2) and Marshall Street ("overstable"). Inf lists 2/3/0/1.5 (label Stable, 11 ratings 2/3.1/-0.1/1.5, echoing its display). Legacy's page looks dated; watch glide/fade (both within 0.5). |
| 5 | Putt'r (Discraft) | 2/2/-1/1 | Confirm | 0.7 | Discraft 2/2/-1/1 (stability 0) via retailer copy of Discraft's numbers; Inf mfr line 2/3/-1/1, 7 ratings 2/3.1/-1.2/0.9, label Stable. Turn/fade agree; glide differs by 1 (outside scope). |
| 6 | Roost (renamed from RW-0325-P (Ricky Wysocki Proto Putter)) (Discraft) | 2/5/0/2 | Too thin | 0.5 | Atlas = Inf mfr line 2/5/0/2; 5 Inf ratings 2.1/4.9/0/1.9. Retailers split "neutral" vs "slightly overstable". 2025 release, no independent review found. |
| 7 | Sea Otter (Wild Discs) | 2/3/0/2 | Confirm | 0.6 | Atlas 2/3/0/2 = Marshall Street; Inf 6 ratings 2.1/3/0/2 (Overstable). Retailer review summary: slightly overstable, matches the spec. |
| 8 | Hydra (Innova) | 3/3/0/2 | Confirm | 0.7 | Atlas 3/3/0/2 = Innova's stated rating (retailer copy; Innova page lists R-Pro only). Inf 24 ratings 3/3/0/2 (Overstable). Reviewers: very stable, won't flip. |
| 9 | Iris (Jester Disc Golf) | 3/4/-2/0 | Too thin | 0.45 | Atlas = Marshall Street 3/4/-2/0; Inf has 0 ratings (just echoes the listing). Retailer copy only (understable, high glide). Nothing independent. |
| 10 | Jokeri (Prodiscus) | 3/3/1/2 | Confirm + open candidate | 0.55 | Atlas 3/3/1/2 = Inf/Marshall. 57 ratings 3.6/3.1/0.3/2 (turn +1 vs +0.3; speed 3.6). DGCR: premium "massively OS", basic "straight with fade" and beats in. Plastic-driven spread; candidate below. |
| 11 | Mirage (Innova) | 3/4/-3/0 | Confirm | 0.75 | Atlas 3/4/-3/0 = Inf mfr line and retailers (Innova's page text doesn't expose the numbers to my fetch). 38 ratings 3.1/4.1/-3/0.1 (Understable). Reviewers describe a roller/turnover putter; consistent. |
| 12 | Narwhal (Divergent Discs) | 3/3/-2/0.5 | Propose change | 0.5 | Divergent's own page says 3/5/-1/0; Atlas (Inf mfr line and Marshall Street) says 3/3/-2/0.5 or -2/0. Proposal below; the 18 Inf ratings (3/3.3/-2/0.5) look like an echo of the display. |
| 13 | Tui (PA1) (RPM) | 3/4/-1/0.5 | Confirm | 0.65 | Atlas = Inf mfr line 3/4/-1/0.5; 40 ratings 3.1/4.2/-1.1/0.2 (Understable). Retailer copy: holds a turnover with a strong throw; Atomic reads most stable, Cosmic glidier. |
| 14 | Cohort (Infinite Discs) | 3.5/4/0/1 | Confirm | 0.7 | Atlas = Infinite's own 3.5/4/0/1. 44 ratings 3.5/4/-0.1/1 (Stable). Reviewer: spec accurate out of the box, broke in to about -1 turn. That is wear, not mold-level. |
| 15 | Douglas Fir (Above Ground Level) | 4/3/-2/1 | Confirm | 0.55 | Atlas 4/3/-2/1 = Marshall; 6 ratings 4/3.1/-2.1/1. AGL sells it as a putter, "slightly understable to neutral depending on arm speed"; speed 4 puts it in the mid stratum. |
| 16 | Mint (Clash Discs) | 4/3/0/3 | Confirm | 0.65 | Atlas 4/3/0/3 = Marshall; 16 ratings 4/3.3/-0.1/2.8 (Very Overstable). Retailer copy: overstable approach disc, Zone/Harp class. |
| 17 | Peach (Clash Discs) | 4/5/-2/1 | Confirm | 0.6 | Atlas 4/5/-2/1 = Marshall; 8 ratings 4/5/-1.9/1 (Understable). Retailer copy: flips up from hyzer, rides straight, sits down gently. |
| 18 | Shu (耳鼠, Er Shu) (Yikun) | 4/5/-2/1 | Confirm | 0.6 | Atlas 4/5/-2/1 = Inf; 10 ratings 4/5/-2.3/0.9 (Understable). Retailer copy agrees; reviewers see a drivery understable mid. |
| 19 | Woodpecker (Rähn) (Disctroyer OÜ) | 4/3/0/3 | Too thin | 0.5 | Atlas 4/3/0/3 = Inf. Disctroyer's own e-shop gives *expected* numbers for the prototype: 4/2(2.5)/0/3.5 (fade +0.5, below the gate). 2 Inf ratings 4/3/0/3; one reviewer: overstable, "less stable on the fade". |
| 20 | Barracuda (Innova) | 5/4/-2/3 | Too thin | 0.45 | Atlas = Inf mfr line 5/4/-2/3; Innova page 404s (legacy mold). 1 Inf rating, same numbers. Retailer summary: "S flight with some decent turn and heavy fade". Little to test. |
| 21 | Gauge (Legacy) | 5/5/0/1 | Confirm | 0.65 | Atlas 5/5/0/1 = Legacy numbers via retailers; 11 ratings 5/5.1/-0.1/1 (Stable). Reviewers: straight, more glide than 5. |
| 22 | Juniper (Above Ground Level) | 5/6/-2/1 | Too thin | 0.45 | Atlas = Marshall 5/6/-2/1; Inf 0 ratings. Retailer copy only (understable glidey mid). Nothing independent. |
| 23 | MX-2 (renamed from Prodigy Club Midrange) (Prodigy) | 5/4/0/3 | Confirm | 0.7 | Atlas 5/4/0/3 = Prodigy's own nav list (MX-2 5 4 0 3) and Inf; 3 ratings 5/4/0/3. Prodigy blog: overstable, torque-resistant, more glide than M1. |
| 24 | Origin (Discmania) | 5/5/-1/1 | Confirm + open candidate | 0.55 | Atlas 5/5/-1/1 = Discmania. 54 ratings 5/5.2/-1.6/0.9 (Understable); the display pulls this toward -1, so the raw mean is probably lower. DGCR thread posts split: "fairly neutral" vs -1.75 vs -2.5. Candidate below. |
| 25 | Taco (Mint Discs) | 5/5/0/2 | Confirm | 0.55 | Atlas 5/5/0/2 = Marshall; 4 ratings 5/4.9/0/2.1. Retailer copy: reads more overstable than straight, "faster Cash"; fits fade 2. |
| 26 | Troija (Prodiscus) | 5/3/1/4 | Confirm + open candidate | 0.45 | Atlas 5/3/1/4 = Inf mfr line. 12 ratings 5/2.4/1.1/5 (Very Overstable): fade 5 vs 4 and the display shrinks the pool toward 4, so the raw mean is likely higher. Retailer copy: fades almost from release. Candidate below. |
| 27 | Jaguar (Innova) | 5.5/6/-3/2 | Too thin | 0.45 | Atlas = Inf mfr line 5.5/6/-3/2; Innova page 404s. 2 Inf ratings 5.5/6/-2.8/2. A reviewer-site summary (not read) says -3 suits light discs and heavier ones fly closer to -1/0. Watch only. Speed 5.5 lands in the fairway stratum by my cut. |
| 28 | Eclipse (Discraft) | 7/5/-2/2 | Confirm | 0.65 | Atlas 7/5/-2/2 = Inf mfr line; 5 ratings 6.8/5/-2/1.9 (Understable). Retailer copy: understable, gentle finish; one note it gets less overstable as it seasons. |
| 29 | Millet (Clash Discs) | 7/6/-3/1 | Confirm | 0.55 | Atlas 7/6/-3/1 = Marshall; 3 ratings 7/6.1/-3/1. Retailer copy: Leopard-like, big glide, hyzer-flip machine. |
| 30 | Vamp (Vibram Disc Golf) | 7/5/-2/1 | Too thin | 0.5 | Atlas = Inf mfr line 7/5/-2/1; 6 ratings 7/5/-1.9/1. One reviewer (search summary) found it "far less understable than the numbers suggest". Too few reads to call. |
| 31 | XXX (Latitude 64) | 7/3/0/4 | Confirm | 0.75 | Atlas 7/3/0/4 = Marshall; 54 ratings 7.2/2.8/0/4.3 (Very Overstable). Retailer copy: very overstable, hard finish. Out of production. |
| 32 | F1 (Prodigy) | 8/4/-1/3 | Confirm | 0.7 | Atlas 8/4/-1/3 = Prodigy's current nav list (F1 8 4 -1 3). Inf still shows pre-2023 7/4/0/3 (26 ratings 7/4.1/-0.2/2.8 are that older echo). Same renumbering pattern as batch 20's F3/FX-3. |
| 33 | Pipeline (DGA) | 8/5/0/2 | Confirm + open candidate | 0.55 | Atlas 8/5/0/2 = DGA's published number (DGA stability 1.5). 46 ratings 8/5.1/-0.6/1.7 (Stable), shrunk toward 0/2. DGCR: "workable turn but far from flippy", beats in to an S-flight; summary quotes "more like 8/5/-1/1". Candidate below. |
| 34 | Rockstar (Discmania) | 8/5/-2/1 | Confirm + open candidate | 0.5 | Atlas 8/5/-2/1 = Discmania. 14 ratings 8.1/5/-1.3/1.6 (Understable), shrunk toward -2/1. DGCR: "slightly more stable Essence ... like -1 turn really"; retailer summary: some find it more stable than -2 implies. Strongest candidate (turn -2 → -1, |Δ| 1.0). |
| 35 | Solar Death Ray (Doomsday Discs) | 8/5/-1/1 | Confirm | 0.55 | Atlas 8/5/-1/1 = Marshall; 7 ratings 8/4.8/-1.1/1.2. Retailer copy: neutral, workable turn then smooth fade. |
| 36 | Talon (Discraft) | 8/3/1/3 | Confirm | 0.6 | Atlas 8/3/1/3 = Inf and Marshall; 5 ratings 8/3/0.8/3 (Very Overstable). Retailer text: out of production since 2007; reviewers 4.6/5, controlled hard fade. |
| 37 | Timberwolf (Daredevil Discs) | 8/5/-1/1 | Propose change | 0.65 | Daredevil's own page: 9,6,-1,0. Atlas (Marshall Street) 8/5/-1/1. Inf mfr 9/6/-1/0; 10 ratings 8.7/5.6/-1.1/0.5. Proposal below. |
| 38 | Vision (Latitude 64) | 8/6/-1/2 | Confirm | 0.65 | Atlas 8/6/-1/2 = Latitude 64's own page (fetched) and Inf; 21 ratings 8/6.1/-1.4/1.9 (Understable). Retailer copy: easy-distance understable fairway; turn within 0.4. |
| 39 | Avalanche (DGA) | 9/3/0/4 | Confirm | 0.65 | Atlas 9/3/0/4 = DGA store page (fetched) and Inf; 4 ratings 9/3/0/4.1. Retailer copy: very overstable; one reviewer "HEAVILY overstable". |
| 40 | Ginger (Clash Discs) | 9/4/0/2 | Confirm | 0.6 | Atlas 9/4/0/2 = Marshall/retailers; 11 ratings 8.9/4.1/0/2.5. Fade 2 vs 2.5 is a soft hint (0.5). Retailer copy: Thunderbird-like, torque-resistant. |
| 41 | Freetail (Mint Discs) | 10/5/-4/1 | Confirm | 0.65 | Atlas 10/5/-4/1 = Marshall/retailers; 15 ratings 10/5/-3.7/1 (Understable). Retailer copy: flippier than an Alpha, hyzer-flips past 325 ft. |
| 42 | Renegade (Dynamic Discs) | 11/5/-1.5/2.5 | Confirm + open candidate | 0.55 | Atlas 11/5/-1.5/2.5 = Dynamic's own nav list. 78 ratings 11/5/-2/2.5 (Stable label), shrunk toward -1.5. DGCR (search summaries, threads not read): described as extremely flippy; one poster says it flew like a seasoned Wraith new, then got too flippy within weeks. Candidate below. |
| 43 | Vanish (Axiom) | 11/5/-3/2 | Confirm + open candidate | 0.55 | Atlas 11/5/-3/2 = Axiom's page (11 5 -3 2, fetched). 31 ratings 11.4/5/-2.4/1.9 (Understable). Retailer summary: "many find it more stable than the numbers suggest". Candidate below. |
| 44 | Astronaut (Discmania) | 12/6/-4/1 | Confirm | 0.7 | Atlas 12/6/-4/1 = Discmania via retailers; 16 ratings 12/5.9/-3.8/1.1. DGCR thread: very low power threshold, flips easily, accidental 500 ft roller. |
| 45 | Harrier (Lone Star Discs) | 12/6/-3/2 | Propose change | 0.65 | Lone Star's own page: 12/6/-4/1. Atlas (Marshall Street Lima Harrier) 12/6/-3/2. Inf mfr 12/6/-4/1. Proposal below. |
| 46 | Twin Swords (双刃剑) (Yikun) | 12/5/-1/2 | Too thin | 0.5 | Atlas 12/5/-1/2 = Marshall, Yikun's NA dealer page, and Foundation Discs. Inf mfr line says 0 (24 ratings 11.9/5/-0.4/1.9). DGCR thread: huge mold-to-mold spread ("VERY flippy" and a -4 flier, "flies like a Fireball or Raptor", "turns a bit and has a late fade"). No mold-level number can be validated. |
| 47 | Company (Crosslap) | 13/4/0/3 | Too thin | 0.45 | Atlas = Inf mfr line 13/4/0/3; 0 Inf ratings. Retailer copy: overstable distance driver for advanced arms. No independent evidence. |
| 48 | Groove (Innova) | 13/6/-2/2 | Confirm + open candidate | 0.5 | Atlas 13/6/-2/2 = Innova. 105 ratings 12.8/5.6/-1.5/2.4 (Stable label), shrunk toward the display. DGCR: "some are super flippy, and others fly like Firebirds"; mold inconsistency dominates. Candidate below. |
| 49 | Recon (Legacy) | 13/5/0/3 | Too thin | 0.45 | Atlas (Marshall Street) 13/5/0/3 = Legacy's own Distance Drivers page ("Recon 13-5-0-3", an older page). Inf and retailer launch copy say 13/5/-1/3 (5 Inf ratings 13/5/-1/3). Conflict inside the Legacy/retailer record; open candidate turn 0 → -1 (|Δ| 1.0, owner's call), not proposed. |
| 50 | Freedom (Dynamic Discs) | 14/5/-3/3 | Confirm | 0.7 | Atlas 14/5/-3/3 = Dynamic's own page (fetched); 47 ratings 13.8/5/-2.8/2.7 (Understable). One detailed review rates it 13/5/-2.5/2.5, close. |

## Does the long tail hold up at the same rate?

**On the headline measure, yes, within what 50 discs can show.** 3 proposals in 50 (2%–16%) sits on top of the researched set's ~5%. The researched set's own interval is roughly 3%–9%, so the two overlap almost entirely.

**On evidence, no — and this is the part to act on.**

1. **A quarter of the sample cannot be tested.** 12 discs are "too thin," and 24 have under 10 Infinite ratings. For those, "confirm" is an absence of contradiction. The sample cannot say they would hold if tested.
2. **Deviation tracks evidence.** The share carrying a candidate or proposal climbs from 4% (under 10 ratings) to 27% (10–29) to 55% (30+). Part of that is mechanical, since a number cannot be questioned without evidence. But it means the long tail's thin confirmations are not the same quality as the 198's, and the untested quarter might not hold at 95% if it could be tested.
3. **The high-yield error is scriptable; the low-yield one is not.** Every proposal here is a diff between the Atlas row and the maker's current page, which batch 20's "diff against `flights.json`/manufacturers first" step already targets. Community research on the same discs produced only half-point reviewer-sentiment candidates. For the remaining ~984, a manufacturer-page diff is likely to catch more per hour than per-disc community reading.

### Where the sample suggests bias

Read these as flags to look at, not findings. Every cell below is small.

**By speed class**

| | n | Confirm | Too thin | Confirm + candidate | Propose | Flagged (candidate + propose) |
|---|---|---|---|---|---|---|
| putter | 13 | 7 | 4 | 1 | 1 | 2 (15%) |
| mid | 13 | 8 | 3 | 2 | 0 | 2 (15%) |
| fairway | 12 | 7 | 2 | 2 | 1 | 3 (25%) |
| distance | 12 | 5 | 3 | 3 | 1 | 4 (33%) |

**By stability class**

| | n | Confirm | Too thin | Confirm + candidate | Propose | Flagged (candidate + propose) |
|---|---|---|---|---|---|---|
| understable | 16 | 8 | 4 | 2 | 2 | 4 (25%) |
| stable | 16 | 8 | 4 | 3 | 1 | 4 (25%) |
| overstable | 18 | 11 | 4 | 3 | 0 | 3 (17%) |

**By Infinite rating count**

| | n | Confirm | Too thin | Confirm + candidate | Propose | Flagged (candidate + propose) |
|---|---|---|---|---|---|---|
| under 10 Infinite ratings | 24 | 12 | 11 | 0 | 1 | 1 (4%) |
| 10–29 | 15 | 10 | 1 | 2 | 2 | 4 (27%) |
| 30 or more | 11 | 5 | 0 | 6 | 0 | 6 (55%) |

**By brand size and by source of the Atlas row**

| | n | Confirm | Too thin | Confirm + candidate | Propose | Flagged (candidate + propose) |
|---|---|---|---|---|---|---|
| All other brands | 31 | 16 | 8 | 4 | 3 | 7 (23%) |
| Big six (Innova, Discraft, Latitude 64, Discmania, Prodigy, Dynamic) | 19 | 11 | 4 | 4 | 0 | 4 (21%) |
| Atlas row from Infinite manufacturer line | 15 | 6 | 7 | 1 | 1 | 2 (13%) |
| Atlas row from Marshall Street (flights.json) | 35 | 21 | 5 | 7 | 2 | 9 (26%) |

**Brands with 3 or more discs**

| Brand | n | Confirm | Too thin | Candidate | Propose | Flagged |
|---|---|---|---|---|---|---|
| Innova | 6 | 2 | 3 | 1 | 0 | 1 |
| Discraft | 4 | 3 | 1 | 0 | 0 | 0 |
| Clash Discs | 4 | 4 | 0 | 0 | 0 | 0 |
| Mint Discs | 3 | 2 | 1 | 0 | 0 | 0 |
| Discmania | 3 | 1 | 0 | 2 | 0 | 2 |
| Legacy | 3 | 2 | 1 | 0 | 0 | 0 |

What the cells say:

- **Small brands, catalog lag.** The three proposals are Lone Star, Daredevil and Divergent. Two came from Marshall Street rows, one from Infinite's manufacturer line, so neither source is cleaner. If the long tail's error rate differs from the 198's, small-brand rows are the likeliest reason, because the 198 were nearly all big-brand molds. 0 of 19 big-six discs got a proposal against 3 of 31 others. That is not significant (two-sided p ≈ 0.28), but it is the pattern to watch while the long tail is researched.
- **Turn is the contested number, with no net direction.** Turn is the main dispute in 9 of the 11 flagged discs, fade in the other 2. The candidates split five to four: Origin, Pipeline, Renegade, Jokeri and Harrier read *more understable* than printed, while Rockstar, Vanish, Groove and Narwhal read *more stable*. No evidence of a systematic skew toward either.
- **Distance drivers** are flagged most (4 of 12) and putters and mids least (2 of 13 and 2 of 13), but the gap is two or three discs. Not a class-level finding.
- **Discmania** has 2 of its 3 sampled discs flagged and **Prodiscus** 2 of 2, both on reviewer-driven numbers. With n of 3 and 2 this is a thing to re-check when more of those brands are sampled, nothing more.
- **Innova's legacy molds.** Hammer, Barracuda and Jaguar returned 404 at the Innova URL pattern that works for current molds and their Atlas numbers rest on Infinite's manufacturer line alone. They are "too thin" because they cannot be primary-verified, not because anything looks wrong. Worth knowing before the remaining ~984 are classified: discontinued molds will often have no maker page to diff against.

## What I'd do next (for Freddy)

1. **Decide the three proposals.** Harrier and Timberwolf are the cleaner two; check the Lima plastic caveat on the Harrier first. Narwhal needs a look at Divergent's current page.
2. **Before researching the remaining ~984 by hand, run a manufacturer-page diff** for the brands with readable pages (Lone Star, Daredevil, Divergent, Legacy, Prodigy, Dynamic, Axiom, DGA, Latitude 64 all were readable here). That is where the proposals came from.
3. **Skip per-disc community research on molds with under 10 Infinite ratings.** It cannot resolve anything with the sources available, and the prior batches already learned the same lesson on thin molds.
4. **Infinite's review endpoint now returns a firewall block** to my request. If the 198's raw-ratings method still works from your side, the candidates above are where it would add the most.
5. **Recon** needs a current Legacy page: the maker's older page and the launch-era copy disagree on turn by a full point.
