# Stability review queue

Plan 10, Phase 1 pilot. Researched October 2, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched.

Molds covered: Buzzz, Aviar, Zone, Hex, Wraith, TeeBird, Envy, Berg, Firebird, Roc (the ten most-thrown after Destroyer).

## Pilot result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Buzzz | 5/4/-1/1 | none | Confirmed as-is | 0.75 |
| Zone | 4/3/0/3 | none | Confirmed as-is | 0.75 |
| Firebird | 9/3/0/4 | none | Confirmed as-is | 0.75 |
| Hex | 5/5/-1/1 | none | Confirmed as-is | 0.7 |
| Wraith | 11/5/-1/3 | none | Confirmed as-is | 0.7 |
| TeeBird | 7/5/0/2 | none | Confirmed as-is | 0.7 |
| Envy | 3/3/0/2 | none | Confirmed as-is | 0.65 |
| Roc | 4/4/0/3 | none | Too thin to call (fade 3 vs 2.5 hint) | 0.5 |
| Berg | 1/1/0/2 | none | Too thin to call (fade 2 vs 1.8 hint) | 0.5 |
| Aviar | 2/3/0/1 | none | Too thin to call (no contradiction, little evidence) | 0.5 |

**No changes proposed.** Where manufacturer numbers, retailer ratings, and reviewers could be compared, they agreed. Differences were plastic-driven, not mold-level, and the rules forbid averaging across plastics.

## Evidence limits — read this before trusting the confirmations

The community layer is weaker than the brief asked for. Treat the "confirmed" verdicts as "no contradicting evidence found," not "community independently verified."

- **Reddit** is blocked to the research tooling (crawler-level), so r/discgolf was not sampled at all.
- **DGCR** thread pages return 403 when fetched. DGCR threads are cited only from search-result summaries (titles plus a condensed summary); I did not read the posts or see who posted or at what arm speed. Weight kept low (0.2–0.3).
- **YouTube** reviewers were not reachable.
- The readable reviews were mostly small reviewer sites (Disc Golf Reviewer, Inside the Circle, Disc Golf Puttheads) and retailer blogs. Few state arm speed; the ones that do are noted per disc. Several others are SEO-style retailer blogs and were given minimal weight.
- Page contents came through a summarizing fetch step, so quoted phrases are as reported by that step. Spot-check any quote before it goes into an override's source note.
- **Infinite Discs "Reviewer Flight Numbers"** are crowd averages that very likely pool all plastics for a mold. They are a useful coarse sanity check on mold-level numbers but are not clean mold-level data. I used them as retailer-type evidence at modest weight and did not treat any deviation as a proposal.
- **Marshall Street** numbers are the catalog the Atlas already uses (`flights.json`), so they are the baseline, not independent confirmation. Their stability labels are recorded where useful.
- **Disc Golf Center** product pages hit a certificate error when fetched; one snippet-level citation is used for the Wraith only.

Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access spot-checks the three "too thin" molds below.

---

## Buzzz — Discraft (id 7446eb39abe5)

- **Atlas now:** 5/4/-1/1. **Proposed turn/fade:** none. Consensus matches the manufacturer.
- **Manufacturer:** Discraft 5/4/-1/1, stability 0 (premium blends listed at +0.5 on the Big Z page). Copy: "gold standard for straight to stable flights." Copy and numbers agree; the mild tension is that -1 turn is a little more turn-friendly than "stable" implies.
- **Retailer:** Infinite lists 5/4/-1/1, label "Stable"; reviewer numbers 5/4.2/-0.7/1 (594 reviews). Marshall Street "Stable".
- **Community:** Disc Golf Puttheads review (Chris Bawden, ~80% power, 325 ft+ flips): flips to straight, gentle turn after ~100 ft, soft fade ~250 ft — in line with -1/1. Disc Golf Reviewer: "stability rating of 0," no arm speed stated.
- sources:
  - {name: Discraft Buzzz description (via search summary), url: https://titandiscgolf.com/products/discraft-z-buzzz-5-4-1-1-lightweights, type: manufacturer, weight: 0.8}
  - {name: Discraft Big Z Buzzz page (stability 0.5), url: https://www.discraft.com/big-z-buzzz-bzbuzzz, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Buzzz, url: https://infinitediscs.com/discraft-buzzz, type: retailer, weight: 0.5}
  - {name: Disc Golf Puttheads Buzzz review, url: https://www.dgputtheads.com/discraft-buzzz-review, type: community, weight: 0.4}
  - {name: Disc Golf Reviewer Buzzz, url: https://discgolfreviewer.com/discraft-buzzz/, type: community, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Everyone describes a straight-to-stable midrange that flips flat and fades gently, which is what 5/4/-1/1 says. Nothing supports moving it.
- **plasticVariance:** Premium Discraft blends read slightly more overstable (+0.5 vs 0 on Discraft's own scale); the mold-level number should stay at the baseline plastic's flight.

## Aviar — Innova (id 3ea9734a60f7)

- **Atlas now:** 2/3/0/1 (source: Infinite, manufacturer numbers). **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 2/3/0/1; copy: "dependable in all conditions." Straight with a predictable finish. No contradiction.
- **Retailer:** Infinite 2/3/0/1, label "Stable"; reviewer numbers 2.1/3/-0.1/1 (240 reviews).
- **Community:** Only generic reviewer commentary (Disc Golf Puttheads, Inside the Circle; no arm speed read). DGCR threads exist but were not readable.
- sources:
  - {name: Innova Aviar page, url: https://www.innovadiscs.com/disc/aviar/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Aviar, url: https://infinitediscs.com/innova-aviar, type: retailer, weight: 0.5}
  - {name: Disc Golf Puttheads Aviar review (search snippet, not read), url: https://www.dgputtheads.com/innova-aviar-review, type: community, weight: 0.2}
  - {name: DGCR "champion aviar" thread (search snippet, not read), url: https://www.dgcoursereview.com/threads/champion-aviar.51096/, type: community, weight: 0.2}
- **confidence:** 0.5
- **consensusNote:** Every readable source agrees it is a straight putter with a soft finish, but I found little beyond the manufacturer number and the Infinite averages. Too thin to call a disagreement either way.
- **plasticVariance:** DX beats in fast and gets more understable; Champion holds flight longer (reviewer summaries, snippet-level).

## Zone — Discraft (id 850e9dc7104d)

- **Atlas now:** 4/3/0/3. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Discraft 4/3/0/3, stability 2.0; copy: "overstable putter excels in headwinds and provides a reliable fade." Copy and numbers agree.
- **Retailer:** Infinite 4/3/0/3, "Overstable"; reviewer numbers 3.9/3/0/3 (391 ratings, near-identical to manufacturer). Marshall Street "Very Overstable".
- **Community:** Reviewer summaries (Puttheads and retailer blogs) consistently call it the standard overstable approach disc, finishing left with authority; torque-resistant on flicks. No arm speed stated in what I could see.
- sources:
  - {name: Discraft Putter Line Zone page, url: https://www.discraft.com/putter-line-zone-zone, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Zone, url: https://infinitediscs.com/discraft-zone, type: retailer, weight: 0.5}
  - {name: Disc Golf Puttheads Zone review (search snippet, not read), url: https://www.dgputtheads.com/discraft-zone-review, type: community, weight: 0.3}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, retailers, and reviewers all land on a strongly overstable putter with fade 3 or a touch more; reviewer average equals the manufacturer number, so there is no case for a change.
- **plasticVariance:** null (no meaningful run-to-run disagreement found; Putter Line Hard is the reference plastic).

## Hex — Axiom (id 5f22688f2ee3)

- **Atlas now:** 5/5/-1/1. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Axiom 5/5/-1/1; "straight-stable"; "at the highest arm speeds, the Hex will produce slightly understable lines from flat, but the 1 fade keeps it from flipping over completely." Headline copy says stable while the detail says understable for fast arms — a skill-dependent description, not a numeric contradiction.
- **Retailer:** Infinite "Stable"; reviewer numbers 5/5/-0.9/1 (110 ratings). Disc Golf Puttheads "Stable".
- **Community:** Search summaries say many reviewers find it matches the published numbers; understable for hard throwers, stable for slower arms. No arm-speed-attributed thread read.
- sources:
  - {name: Axiom Hex page, url: https://axiomdiscs.com/discs/hex/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Hex, url: https://infinitediscs.com/axiom-hex, type: retailer, weight: 0.5}
  - {name: Disc Golf Puttheads Hex flight chart, url: https://www.dgputtheads.com/flight-charts/hex, type: retailer, weight: 0.3}
  - {name: DGCR Hex thread (search snippet, not read), url: https://www.dgcoursereview.com/threads/hex-midrange-you-can-hex-it-but-dont-nice-me.146110/, type: community, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Axiom's own copy and the retailer averages agree on a straight midrange that gets slightly understable for fast arms. The numbers already say that.
- **plasticVariance:** Fission reported to have slightly less fade than Neutron (search snippet, one source); not enough to record as meaningful.

## Wraith — Innova (id e70f48273d7f)

- **Atlas now:** 11/5/-1/3. **Proposed turn/fade:** none. Matches. This also keeps the Destroyer override's logic intact: Innova publishes 12/5/-1/3 vs Wraith 11/5/-1/3 and calls the Destroyer a faster Wraith with more stability, so the Wraith is the lower anchor and should not move without a deliberate re-look at the Destroyer.
- **Manufacturer:** Innova 11/5/-1/3; copy: "long stable Distance Driver … excellent downwind driver that also performs predictably into the wind." No contradiction.
- **Retailer:** Infinite label "Overstable" but reviewer numbers 11/5/-1.1/2.9 (455 reviews) — the label is looser than the numbers; the numbers match. Marshall Street "Overstable". Disc Golf Center (snippet): Champion and Star most overstable; DX and Pro beat in faster.
- **Community:** Inside the Circle (Broden, intermediate, 400 ft backhand in Champion): DX/Pro plastic turned over frequently; Champion hard to turn over even into a headwind. DGCR threads (snippet only): Wraith acts overstable for arms under roughly 325–350 ft; Star/Champion more overstable than DX/Pro/GStar. These are skill and plastic effects, not mold-level contradictions.
- sources:
  - {name: Innova Wraith page, url: https://www.innovadiscs.com/disc/wraith/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Wraith, url: https://infinitediscs.com/innova-wraith, type: retailer, weight: 0.5}
  - {name: Disc Golf Center Wraith (Star) (snippet only), url: https://www.discgolfcenter.com/main_displayProduct.php?p=7&PPQT1=18&PPQT2=38, type: retailer, weight: 0.3}
  - {name: Inside the Circle Wraith review, url: https://www.insidethecircledg.com/post/innova-wraith, type: community, weight: 0.4}
  - {name: DGCR "Innova Wraith Stability" thread (not read, 403), url: https://www.dgcoursereview.com/threads/innova-wraith-stability.26319/, type: community, weight: 0.2}
  - {name: DGCR "Best Wraith Plastic?" thread (search snippet, not read), url: https://www.dgcoursereview.com/threads/best-wraith-plastic.130201/, type: community, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, retailer averages, and reviewers all fit 11/5/-1/3. Perceived stability swings with arm speed and plastic far more than the mold number is off.
- **plasticVariance:** Large. Champion and Star are the most overstable and hold it; DX, Pro, and GStar beat in or run flippier. Keep the mold number at the representative flight and do not average plastics.

## TeeBird — Innova (id df3915bf7676)

- **Atlas now:** 7/5/0/2. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 7/5/0/2; copy: "most accurate and reliable driver"; straight flight, characterized by stability. No contradiction.
- **Retailer:** Retailers disagree on the label with identical numbers: Infinite "Overstable", Marshall Street "Stable". Infinite reviewer numbers 7/5/-0.1/2 (378 reviews) match 0/2.
- **Community:** Disc Golf Reviewer (Alan, no arm speed stated): stable, "won't often turn over." DGCR threads (snippet only): ordering of plastic stability roughly DX < GStar/EchoStar < Star < Champion; a 158g Star is noticeably less overstable than a 175g Champion.
- sources:
  - {name: Innova TeeBird page, url: https://www.innovadiscs.com/disc/teebird/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs TeeBird, url: https://infinitediscs.com/innova-teebird, type: retailer, weight: 0.5}
  - {name: Disc Golf Reviewer TeeBird, url: https://discgolfreviewer.com/innova-teebird/, type: community, weight: 0.3}
  - {name: DGCR "Best Plastic for TeeBird?" (search snippet, not read), url: https://www.dgcoursereview.com/threads/best-plastic-for-teebird.129785/, type: community, weight: 0.2}
  - {name: DGCR "Champion plastic more stable?" (search snippet, not read), url: https://www.dgcoursereview.com/threads/champion-plastic-more-stable.121161/, type: community, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** The numeric evidence (manufacturer plus reviewer average) agrees on 0/2. The "Overstable" label on Infinite is looser wording than its own numbers, so I would not read it as a stability signal.
- **plasticVariance:** Meaningful weight and plastic spread: DX least stable, Champion most, and a light Star can fly less overstable than a heavy Champion.

## Envy — Axiom (id 761c90d342f5)

- **Atlas now:** 3/3/0/2. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Axiom 3/3/0/2, classified Stable-Overstable; copy: "slightly overstable putt and approach disc … reliable high-speed stability and a minimal fade." Consistent with 0/2.
- **Retailer:** Infinite "Overstable", reviewer numbers 2.9/3.2/-0.1/1.9 (267 ratings); Marshall Street "Overstable". Retailer labels run one notch stronger than Axiom's "slightly overstable."
- **Community:** Reviewer summaries (snippet level) describe a putter that holds a line and finishes predictably; plastic ordering varies (Electron beats in toward turnover, Plasma most overstable by some accounts, others call Plasma the straightest — sources disagree).
- sources:
  - {name: Axiom Envy page, url: https://axiomdiscs.com/discs/envy/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Envy, url: https://infinitediscs.com/axiom-envy, type: retailer, weight: 0.5}
  - {name: Disc Golf Puttheads Envy review (search snippet, not read), url: https://www.dgputtheads.com/axiom-discs-envy, type: community, weight: 0.3}
  - {name: DGCR Envy thread (search snippet, not read), url: https://www.dgcoursereview.com/threads/axiom-envy.110619/page-143, type: community, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and the Infinite reviewer average both say about 0/2. Retailers just describe it a bit more overstable in words than the number implies.
- **plasticVariance:** Real spread between Electron (least stable, beats in to turnover), Neutron (moderate), and Plasma/Soft Neutron (most stable) per reviewer summaries, though the sources disagree on the exact order; record as variance, not a mold change.

## Berg — Kastaplast (id 683fcbcd529c)

- **Atlas now:** 1/1/0/2. **Proposed turn/fade:** none. Evidence too thin to call.
- **Manufacturer:** Kastaplast 1/1/0/2; copy: "good high-speed stability, yet without tons of fade … slow and straight." The copy supports 0/2.
- **Retailer:** Infinite "Overstable", reviewer numbers 1.1/1.2/0/1.8 (144 reviews) — fade 0.2 under the manufacturer, which is within noise for a speed-1 putter. Marshall Street "Overstable".
- **Community:** Snippet-level only: one DGCR commenter says it is more overstable than people credit at fade 2, maybe neutral if beat-in; K1 Soft reported as touchier than K1. No arm speed stated. Nothing readable to call a mold-level disagreement.
- sources:
  - {name: Kastaplast Berg description (via search summary), url: https://www.pinetreedisc.com/discs/kastaplast-berg, type: retailer, weight: 0.3}
  - {name: Infinite Discs Berg, url: https://infinitediscs.com/kastaplast-berg, type: retailer, weight: 0.5}
  - {name: DGCR Berg thread (search snippet, not read), url: https://www.dgcoursereview.com/threads/kastaplast-berg.121722/page-24, type: community, weight: 0.2}
- **confidence:** 0.5
- **consensusNote:** The only hint of a gap is Infinite's 1.8 fade vs the published 2, and one comment points the opposite way. A speed-1 disc can't carry a half-step change on this evidence. The manufacturer's own page (kastaplastdiscs.com) failed on a certificate error, so even that layer rests on a retailer summary.
- **plasticVariance:** K1 Soft reported touchier and less stable than K1; K1/K3 spread not verified.

## Firebird — Innova (id ba675aed468a)

- **Atlas now:** 9/3/0/4. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 9/3/0/4; copy: "overstable distance driver which works extremely well into a headwind." Agrees with numbers.
- **Retailer:** Infinite "Very Overstable", reviewer numbers 9/3.1/0/3.9 (336 ratings); Marshall Street "Very Overstable".
- **Community:** Reviewer summaries (retailer and review blogs; no arm speed read) uniformly call it the classic headwind and forehand overstable driver. DGCR thread on DX Firebirds exists but was not read.
- sources:
  - {name: Innova Firebird page, url: https://www.innovadiscs.com/disc/firebird/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Firebird, url: https://infinitediscs.com/innova-firebird, type: retailer, weight: 0.5}
  - {name: Discing Daily Firebird review (search snippet, not read), url: https://discingdaily.com/innova-firebird-review/, type: community, weight: 0.2}
  - {name: DGCR "What's the deal with DX Firebirds" (search snippet, not read), url: https://www.dgcoursereview.com/threads/whats-the-deal-with-dx-firebirds.124754/, type: community, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, both retailer ratings, and the reviewer average agree on a very overstable driver at 0/4 with no outliers.
- **plasticVariance:** DX versions reported to behave differently from premium plastics, but the DGCR thread was not read, so the size of the difference is unverified.

## Roc — Innova (id 9152771e1f7b)

- **Atlas now:** 4/4/0/3. **Proposed turn/fade:** none. Evidence too thin to call.
- **Manufacturer:** Innova 4/4/0/3; copy: "ages slowly, becoming an excellent slow turning disc as it wears" — a wear statement, not a new-disc contradiction.
- **Retailer:** Infinite "Overstable", reviewer numbers 4/4.1/-0.1/2.5 (173 ratings) — fade 0.5 under the manufacturer, the largest gap in the pilot. Marshall Street "Overstable".
- **Community:** Snippet-level only: KC Pro Rocs beat in slowly toward flat or hyzer-flip, which is wear/plastic, not mold-level. No arm speed attributed in readable sources.
- sources:
  - {name: Innova Roc page, url: https://www.innovadiscs.com/disc/roc/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Roc, url: https://infinitediscs.com/innova-roc, type: retailer, weight: 0.5}
  - {name: Disc Golf Reviewer Roc (search snippet, not read), url: https://discgolfreviewer.com/innova-roc/, type: community, weight: 0.2}
- **confidence:** 0.5
- **consensusNote:** One retailer average suggests fade closer to 2.5, but it likely pools plastics and wear levels, and nothing readable corroborates it. If a re-look is wanted, a Roc fade of 2.5 is the only candidate adjustment in the pilot, and it needs Reddit/DGCR/YouTube evidence with stated arm speeds first.
- **plasticVariance:** KC Pro and DX beat in faster than Star/Champion; the mold number should reflect premium-plastic new flight.

---

## Process notes for the next batch

- Brand mapping for these molds in Atlas: Envy and Hex are Axiom, Berg is Kastaplast, the rest as named.
- `infinite-manufacturer-ratings.json` only carries the Aviar among these ten; the others come from `flights.json` (Marshall Street / DiscIt).
- The Wraith link to the Destroyer override is worth remembering: any later Wraith change should trigger a re-check of the Destroyer's Atlas adjustment.
