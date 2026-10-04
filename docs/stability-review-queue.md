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

---

# Batch 2 (Plan 10, Phase 2)

Researched October 2, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed.

Molds covered: Leopard, Luna, Judge, Pure, River, Crave, Glitch, Reko, Boss, Crank (the next ten by `public/featured.js` order after Destroyer and the ten pilot discs).

## Batch 2 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Luna | 3/3/0/3 | **fade 3 → 2** (Discraft's current published number; glide 3 → 4 also changed, outside turn/fade scope) | **Proposed change, review-gated (\|Δ\| = 1.0)** | 0.8 |
| Leopard | 6/5/-2/1 | none | Confirmed as-is | 0.75 |
| Judge | 2/4/0/1 | none | Confirmed as-is | 0.75 |
| River | 7/7/-1/1 | none | Confirmed as-is | 0.75 |
| Crave | 6.5/5/-1/1 | none | Confirmed as-is | 0.75 |
| Pure | 3/3/-1/1 | none | Confirmed as-is | 0.65 |
| Crank | 13/5/-2/2 | none | Confirmed as-is | 0.65 |
| Glitch | 1/7/0/0 | none | Confirmed as-is (thin, nothing contradicts) | 0.65 |
| Reko | 3/3/0/1 | none | Confirmed as-is (thin, nothing contradicts) | 0.6 |
| Boss | 13/5/-1/3 | none | Too thin to call (turn -1 vs about -0.5 hint) | 0.5 |

**One proposed change (Luna), one open candidate (Boss turn), eight confirmed.** The Luna case differs in kind from the pilot's soft hints: the manufacturer itself changed the published numbers, so this is a stale-catalog correction backed by primary-source evidence, not a reviewer-sentiment adjustment.

## Evidence limits — batch 2

Same tooling limits as the pilot; see the pilot section above. Specific to this batch:

- **Reddit** blocked, **YouTube** unreachable, **DGCR** 403 (seen only as search-result titles, never read, so none is cited as real evidence).
- **Community layer is thin.** Readable reviews were Disc Golf Reviewer (Alan, Jace Smellie), Disc Golf Puttheads (Chris Bawden, Rodney Lane, "Maredith"), a Skyline Discs spotlight, and retailer blogs. Only Bawden (Pure) and Lane (Luna) said anything about their own throwing, and neither gave a number. No source gave a measured arm speed, so skill normalization was limited to what the text implied (e.g. "50+ mph" as the Boss's target, "I don't throw crazy far" for the Luna reviewer). I did not reach 5–10 quality reviews per disc.
- **Kastaplast and Discraft pages** were only partly reachable. Reko manufacturer numbers come via retailers (kastaplast.com not fetched). Discraft Crank numbers come via a search summary (the discraft.com Crank page 404'd when fetched directly).
- **Infinite reviewer averages pool plastics and wear.** Used as coarse retailer-type evidence only; no deviation under 1.0 was treated as a proposal.
- **Marshall Street is the Atlas's own source**, so it is not independent. The Atlas snapshot (`source-data/flights.json`, single initial commit) is older than Marshall Street's current Luna page, which now shows the new fade.
- Page contents came through a summarizing fetch step; spot-check any quote before it goes into an override's source note.

---

## Luna — Discraft (id ff4bf9e7743c)

- **Atlas now:** 3/3/0/3 (source: Marshall Street snapshot). **Proposed turn/fade:** turn unchanged (0), **fade 3 → 2**. |Δ| = 1.0, so this goes to the review gate regardless of confidence.
- **Manufacturer:** Discraft's current Putter Line Hard Luna page lists 3/4/0/2 (fetched). A search summary of the Z Luna page reads 3/4/0/2 with stability 0.5. Copy: "Known for its stable flight and dependable finish." Copy and numbers agree. **Contradiction with the Atlas:** the Atlas still carries the legacy 3/3/0/3. Per Marshall Street's product note and other retailer summaries, Discraft lowered the Luna's fade when it released the Kratos, which took over 3/3/0/3 ("the mold has not changed"; the 3 fade "was always not quite accurate"). The Atlas currently has Luna and Kratos at the same spot (both 3/3/0/3), which Discraft's change was meant to separate.
- **Retailer:** Infinite lists manufacturer 3/4/0/2, label "Stable"; reviewer numbers 3/3.2/-0.2/2 (139 ratings, 4.45 stars) — fade matches the new number exactly. Marshall Street's current page (not independent) shows fade 2 but glide 3, so it differs from Discraft on glide.
- **Community:** Rodney Lane (Puttheads, Jawbreaker blend, "I don't throw crazy far") argued the old 3/3/0/3 was too overstable: "3, 3, -.5, 1." Jace Smellie (Disc Golf Reviewer, tournament use): "the Luna is rated more overstable than it actually is." Both point the same way as a lower fade. Lane's text also says the prototype was 3/4/0/2 and production was changed to 3/3/0/3, the reverse of the order retailers now describe; Discraft's current pages are the primary source, so I weighted them over that older review.
- sources:
  - {name: Discraft Putter Line Hard Luna page (3/4/0/2), url: https://www.discraft.com/paul-mcbeth-putter-line-hard-luna-mcbethhdluna, type: manufacturer, weight: 1.0}
  - {name: Discraft Z Luna page (search summary, 3/4/0/2, stability 0.5), url: https://www.discraft.com/paul-mcbeth-z-luna-mcbethzluna, type: manufacturer, weight: 0.7}
  - {name: Infinite Discs Luna (mfr 3/4/0/2; reviewers 3/3.2/-0.2/2), url: https://infinitediscs.com/discraft-luna, type: retailer, weight: 0.5}
  - {name: Marshall Street Luna page (note on the change; not independent), url: https://www.marshallstreetdiscgolf.com/product/luna-paul-mcbeth-19, type: retailer, weight: 0.2}
  - {name: Disc Golf Puttheads Luna review (Rodney Lane), url: https://www.dgputtheads.com/discraft-luna-review, type: community, weight: 0.4}
  - {name: Disc Golf Reviewer Luna (Jace Smellie), url: https://discgolfreviewer.com/discraft-luna/, type: community, weight: 0.3}
- **confidence:** 0.8
- **consensusNote:** Discraft's current published numbers, Infinite's reviewer average, and two independent reviewers all put the Luna's fade at about 2, not 3. The Atlas value looks like a stale pre-Kratos number rather than a judgment call.
- **plasticVariance:** Premium blends like Big Z run more overstable; baseline plastics run true to slightly less stable (retailer summaries, snippet-level). Keep the mold number at the baseline-plastic flight; do not average.
- **Notes for Freddy:**
  - Glide: Discraft and Infinite say 4; Marshall Street says 3; Infinite reviewers average 3.2. Glide is outside the turn/fade proposal, so it is not proposed here. If the override carries all four numbers (as the Roc entry does), Freddy decides whether to include glide 4.
  - Source-data staleness: `flights.json` predates this change. Other Discraft molds renumbered around the same time may exist; a quick diff of Marshall Street's current pages against the snapshot would be cheap.
  - Linked molds checked: Kratos stays 3/3/0/3 (Infinite manufacturer 3/3/0/3, reviewers 3/3/0/2.7, only 2 ratings; nothing to propose). Zone, Buzzz and the other speed-3 putters are unaffected.

## Leopard — Innova (id e5c3cc29c5a7)

- **Atlas now:** 6/5/-2/1. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 6/5/-2/1 (fetched). Copy: "Everyone's first fairway driver. Useful for long straight shots, gentle hyzers and turnover shots. Extended life as a roller." The page also describes neutral flight and added turn as it ages. Copy and numbers agree; "-2" turn plus "neutral" is a skill-dependent description (understable for faster arms, straight for slower).
- **Retailer:** Infinite "Understable", reviewer numbers 6/5/-1.9/1 (260 reviews, 4.47 stars). Marshall Street and Infinite agree on the numbers.
- **Community:** Disc Golf Reviewer (Alan, no arm speed, plastic unspecified): "one of the straightest flying drivers I have tested"; long and straight with a slight fade on backhand; forehand turns sideways into a roller. Disc Golf Puttheads (Maredith): "understable, glidey fairway driver"; drifts right "without burning over" at moderate power. Search-summary retailer content: neutral for slow arms, understable for experienced; premium plastics reported moderately overstable, like a slower TeeBird.
- sources:
  - {name: Innova Leopard page, url: https://www.innovadiscs.com/disc/leopard/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Leopard, url: https://infinitediscs.com/innova-leopard, type: retailer, weight: 0.5}
  - {name: Disc Golf Reviewer Leopard (Alan), url: https://discgolfreviewer.com/innova-leopard/, type: community, weight: 0.4}
  - {name: Disc Golf Puttheads Leopard flight chart (Maredith), url: https://www.dgputtheads.com/flight-charts/leopard, type: community, weight: 0.3}
  - {name: Plastic notes via retailer blog search summary (DX true to numbers then flips; premium moderately overstable), url: https://reaperdiscs.com/blogs/reviews/best-innova-fairway-drivers, type: community, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, Infinite's reviewer average (-1.9/1), and reviewers agree on an understable, high-glide fairway driver. The Atlas numbers match.
- **plasticVariance:** Large. DX is true to the numbers, then beats in to considerably more understable; Star and Champion are reported moderately overstable. Keep the mold number at the new-DX/Star flight and do not average.

## Judge — Dynamic Discs (id cd8e49f1fa20)

- **Atlas now:** 2/4/0/1. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Dynamic Discs 2/4/0/1 (fetched, Classic Judge). Copy: "incredibly predictable in flying and hitting the chains"; straight-flying, neutral stability; 2013 Disc of the Year. Copy and numbers agree.
- **Retailer:** Infinite "Stable", reviewer numbers 2/4/0/0.9 (242 reviews, 4.68 stars). Marshall Street agrees on numbers.
- **Community:** Disc Golf Reviewer (Jace Smellie, Prime Burst, arm speed not stated): "a straight to overstable putting putter," begins its fade earlier than the Bleak; he dislikes the feel. Disc Golf Puttheads (Maredith): stable, 0/1; intermediates can push it on flat releases for "laser-straight" throws. Search-summary content: "only overstable slightly when brand new," beats in to straight/understable fairly quickly; Fuzion seasons faster than Fluid or Lucid.
- sources:
  - {name: Dynamic Discs Classic Judge page, url: https://www.dynamicdiscs.com/products/classic-judge, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Judge, url: https://infinitediscs.com/dynamic-discs-judge, type: retailer, weight: 0.5}
  - {name: Disc Golf Reviewer Judge (Jace Smellie), url: https://discgolfreviewer.com/dynamic-discs-judge/, type: community, weight: 0.3}
  - {name: Disc Golf Puttheads Judge flight chart (Maredith), url: https://www.dgputtheads.com/flight-charts/judge, type: community, weight: 0.3}
  - {name: All Things Disc Golf Judge review (search summary only; page timed out), url: https://allthingsdiscgolf.com/dynamic-discs-judge-review/, type: community, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer and Infinite's reviewer average (fade 0.9) agree on 0/1; reviewers describe neutral to slightly overstable when new, softening with use.
- **plasticVariance:** Fuzion beats in faster than Fluid and Lucid; new Classic runs slightly overstable, then straightens. Keep the mold number at the new-disc baseline.
- **Linked check — EMAC Judge (id 4c20b4f66a09, Atlas 2/4/0/1):** Dynamic's own copy says the EMAC Judge has "less of a bead and a bit less fade" than the Judge, yet both are listed 2/4/0/1, and Infinite reviewers also read 2/4/0/1 for the EMAC (33 ratings, thin). A copy-vs-number tension, not a proposal. No change to either mold; if Freddy wants the ordering reflected, EMAC fade 0.5 is the only candidate, and it would need more evidence than 33 ratings plus the manufacturer copy.

## Pure — Latitude 64 (id 3200f16f97df)

- **Atlas now:** 3/3/-1/1. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Latitude 64 3/3/-1/1, "Stable" (Zero Medium Pure page, fetched). Copy: "Straight beadless putter with gentle turn." Copy and numbers agree.
- **Retailer:** Infinite "Stable", reviewer numbers 3/3.1/-0.6/0.7 (175 reviews) — about 0.4 less turn and 0.3 less fade than the manufacturer, which nets to a similar overall stability and sits inside the noise of pooled plastics.
- **Community:** Disc Golf Puttheads (Chris Bawden, Zero Soft/Medium/Hard and Opto; no arm speed): estimates "a 1.5 stability rating mostly due to it's ability to pull nicely out of a strong anhyzer," "a gentle turn with a fan grip" at 150–200 ft, predictable fade on straight putts. Search-summary retailer blogs: stable to slightly understable, "arguably Latitude 64's straightest flying disc."
- sources:
  - {name: Latitude 64 Zero Medium Pure page, url: https://latitude64.com/products/zero-medium-pure, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Pure, url: https://infinitediscs.com/latitude-64-pure, type: retailer, weight: 0.5}
  - {name: Disc Golf Puttheads Pure review (Chris Bawden), url: https://www.dgputtheads.com/latitude-64-pure-review, type: community, weight: 0.4}
  - {name: Skyline Discs Pure (search summary), url: https://skylinediscs.com/products/latitude-64-pure, type: retailer, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Everyone calls it the straight, gentle-turn beadless putter. The reviewer average runs slightly flatter than 3/3/-1/1 and Bawden's anhyzer-hold comment pulls the other way; together they cancel, so no change.
- **plasticVariance:** Zero Soft is the gummiest and Zero Pro gains stability per Latitude 64's own descriptions; the spread was not quantified.

## River — Latitude 64 (id 2e3b6f6dd424)

- **Atlas now:** 7/7/-1/1. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Latitude 64 7/7/-1/1, "Understable" (River collection page, fetched). Copy: "tremendous GLIDE … a fairway driver for those accuracy shots that demands good control," easy to throw, strong on anhyzer. Opto Air River is listed 7/7/-2/1, a plastic-specific number from the manufacturer itself.
- **Retailer:** Infinite "Stable", reviewer numbers 7/6.9/-1.2/1 (217 reviews, 4.72 stars). The manufacturer's "Understable" label and Infinite's "Stable" disagree while the numbers agree.
- **Community:** Disc Golf Puttheads (Maredith, "moderate power"): "neutral-to-understable fairway driver" with "a hint of turn" and a soft finish. Search-summary retailer/blog content: glide-heavy, easy to shape, popular with beginners and slower arms; hyzerflips for faster arms.
- sources:
  - {name: Latitude 64 River collection page, url: https://latitude64.com/collections/river, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs River, url: https://infinitediscs.com/latitude-64-river, type: retailer, weight: 0.5}
  - {name: Disc Golf Puttheads River flight chart (Maredith), url: https://www.dgputtheads.com/flight-charts/river, type: community, weight: 0.3}
  - {name: Latitude 64 Opto Air River (7/7/-2/1), url: https://latitude64.com/products/opto-air-river, type: manufacturer, weight: 0.3}
- **confidence:** 0.75
- **consensusNote:** Manufacturer numbers and Infinite's reviewer average agree within 0.2; reviewers consistently describe a high-glide, mildly understable fairway driver. Nothing supports moving it.
- **plasticVariance:** Opto Air runs one step more understable (-2 turn, manufacturer-listed). The mold-level number stays at the standard plastic's -1; do not average the Opto Air in.

## Crave — Axiom (id 35dae588c670)

- **Atlas now:** 6.5/5/-1/1. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Axiom 6.5/5/-1/1, "Straight-Stable" (fetched). Copy: "controllable straight flights … like a seasoned Servo … 'worn workhorse-stable' vibe." Copy and numbers agree.
- **Retailer:** Infinite "Stable", reviewer numbers 6.6/5/-0.9/1.1 (132 reviews, 4.72 stars), within 0.1 of the manufacturer.
- **Community:** Skyline Discs spotlight (Jon Jones; mentions 240–350+ ft ranges, no arm speed, plastic unspecified): "neutral-to-straight," "flips up willingly for easy distance," "stays honest on flat releases," minimal fade. Search-summary sources: Neutron is "truest to the numbers"; Fission has "a hint of turn."
- sources:
  - {name: Axiom Crave page, url: https://axiomdiscs.com/discs/crave/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Crave, url: https://infinitediscs.com/axiom-crave, type: retailer, weight: 0.5}
  - {name: Skyline Discs Crave spotlight (Jon Jones), url: https://skylinediscs.com/blogs/disc-spotlights/disc-spotlight-axiom-crave, type: community, weight: 0.3}
  - {name: Infinite Discs Neutron Crave (search summary on plastics), url: https://infinitediscs.com/axiom-crave/neutron---axiom, type: retailer, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, Infinite's reviewer average and reviewers all describe a straight fairway driver that flips slightly for stronger arms and fades gently. The Atlas matches.
- **plasticVariance:** Neutron is the baseline; Fission reported a touch flatter or more turn-prone (single-source, snippet-level), not enough to record as meaningful. Linked check: Axiom's copy puts the Crave a notch under a Servo (Atlas Servo 6.5/5/-1/2) in stability, which the Atlas fade ordering (1 vs 2) already reflects.

## Glitch — MVP (id a4ee5d896b86)

- **Atlas now:** 1/7/0/0. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** MVP 1/7/0/0, "neutral" (fetched). Copy: "a hybrid catch disc designed to blur the lines between disc golf and a catch disc … the first MVP disc with 7 glide." Copy and numbers agree.
- **Retailer:** Infinite "Stable", reviewer numbers 1/7/0/0 (57 ratings, 4.79 stars), an exact match on a small sample.
- **Community:** Best Disc Golf Discs (Aaron, Neutron Soft, aimed at beginners and Ultimate-background players): neutral flight, "laser-straight even at lower arm speeds." Retailer summaries concur. A speed-1 catch/approach disc leaves little to disagree about.
- sources:
  - {name: MVP Glitch page, url: https://mvpdiscsports.com/discs/glitch/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Glitch, url: https://infinitediscs.com/mvp-glitch, type: retailer, weight: 0.4}
  - {name: Best Disc Golf Discs Glitch review (Aaron), url: https://bestdiscgolfdiscs.com/mvp-glitch-review/, type: community, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Every source agrees on neutral, 0/0. This is "no contradicting evidence found" more than strong confirmation; the evidence base is small, but a speed-1 neutral disc has little room for the numbers to be wrong.
- **plasticVariance:** Neutron Soft is the common plastic; others not compared. null.

## Reko — Kastaplast (id aa7d7102c2b3)

- **Atlas now:** 3/3/0/1. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Kastaplast 3/3/0/1 per retailer pages (kastaplast.com not fetched). Retailer copy: "straight, dependable, and made to feel perfect in the hand." Label difference on identical numbers: Pine Tree says "Overstable (+1)"; Infinite, Marshall Street and Puttheads say "Stable" (same pattern as the pilot's TeeBird).
- **Retailer:** Infinite "Stable", reviewer numbers 3/3.2/-0.1/1.1 (68 reviews, 4.79 stars), essentially identical to the manufacturer.
- **Community:** Disc Golf Puttheads flight chart (Maredith, no arm speed): "holds a straight line with minimal fade," "one of the most neutral discs in the Kastaplast lineup." Pine Tree: "dead-straight flight with predictable 1 fade"; K1 resists turning over under power; K1 Soft "runs more understable."
- sources:
  - {name: Pine Tree Disc Golf Reko (retailer carrying Kastaplast numbers), url: https://www.pinetreedisc.com/discs/kastaplast-reko, type: retailer, weight: 0.3}
  - {name: Infinite Discs Reko, url: https://infinitediscs.com/kastaplast-reko, type: retailer, weight: 0.5}
  - {name: Disc Golf Puttheads Reko flight chart (Maredith), url: https://www.dgputtheads.com/flight-charts/reko, type: community, weight: 0.3}
- **confidence:** 0.6
- **consensusNote:** Numbers and descriptions agree on a straight putter with a gentle 1 fade; the manufacturer layer rests on retailer copy because kastaplast.com was not read. Linked check: Berg (pilot, 1/1/0/2) is also Kastaplast but nothing here moves it.
- **plasticVariance:** K1 Soft is touchier and more understable than K1 (retailer summary, one source); K1 runs true to the numbers.

## Boss — Innova (id d2525e806436)

- **Atlas now:** 13/5/-1/3. **Proposed turn/fade:** none. Evidence too thin to call. Open candidate: turn -1 → -0.5.
- **Manufacturer:** Innova 13/5/-1/3 (fetched). Copy: "fast stable driver that can handle full power throws and moderate headwinds … a slight high speed turn to help maximize distance with a predictable fade." **Internal inconsistency:** Infinite notes many Champion Bosses are stamped 13/5/0/3, so the manufacturer's own plastic-level numbers differ from the website mold number by a full step of turn.
- **Retailer:** Infinite label "Overstable", reviewer numbers 13/5/-0.6/3 (278 reviews) — turn 0.4 flatter than the page's -1, fade identical. This pools plastics, including the Champion runs stamped 0 turn.
- **Community:** Disc Golf Puttheads (Maredith, states "50+ mph arm speed"): "extremely fast and stable," Champion and Halo runs give maximum stability, lighter weights and beat-in Pro add turn. Disc Golf Reviewer (Alan, no arm speed, plastic unspecified): "slightly overstable with a fade rating of 3," best with a slight anhyzer. Search-summary DGCR snippets (not read): designed as high-speed understable but needs roughly 400 ft of power to do that; a reviewer throwing just over 400 ft found it useful only in wind; beat-in Bosses "get real straight with a good bit of turn."
- sources:
  - {name: Innova Boss page, url: https://www.innovadiscs.com/disc/boss/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Boss (notes Champion 13/5/0/3 stamps), url: https://infinitediscs.com/innova-boss, type: retailer, weight: 0.5}
  - {name: Disc Golf Puttheads Boss flight chart (Maredith), url: https://www.dgputtheads.com/flight-charts/boss, type: community, weight: 0.3}
  - {name: Disc Golf Reviewer Boss (Alan), url: https://discgolfreviewer.com/innova-boss/, type: community, weight: 0.3}
  - {name: DGCR "New (overstable) champion Bosses" (search snippet, not read), url: https://www.dgcoursereview.com/threads/new-overstable-champion-bosses.143800/, type: community, weight: 0.2}
- **confidence:** 0.5
- **consensusNote:** Three weak signals lean the same way (Champion stamps at 0 turn, Infinite's -0.6, and the "overstable" label with sub-400 ft descriptions), but all are plastic- or arm-speed-driven rather than a clean mold-level number, and the rules forbid averaging across plastics. A -0.5 turn would be the only candidate adjustment; it needs reviewers with stated arm speeds and a plastic-split sample.
- **plasticVariance:** Large. Champion and Halo are the most overstable (Innova-stamped 0 turn); Star and DX run flatter; beat-in Pro/DX add real turn. Keep the mold number at the representative flight and do not average.
- **Linked re-check (Boss / Wraith / Destroyer / Firebird):** If the Boss turn ever moves, re-check Wraith (11/5/-1/3, pilot-confirmed) and the Destroyer's Atlas adjustment (12/5/-0.5/3.5) together. A Boss at -0.5 would match the Destroyer's turn while the Destroyer keeps the higher fade; that is plausibly consistent with Innova's ordering, but the effect on the cluster should be reviewed as a set.

## Crank — Discraft (id 282d6483a722)

- **Atlas now:** 13/5/-2/2. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Discraft 13/5/-2/2, stability 1.3 (search summary of discraft.com; the Crank page 404'd when fetched directly). Copy: "a cross between the Nuke and the Nuke SS … fast, stable driver suitable for big arm disc golfers." Ordering check passes: Nuke 13/5/-1/3, Crank 13/5/-2/2, Crank SS 13/5/-3/2, turn stepping one per mold.
- **Retailer:** Infinite "Stable", reviewer numbers 12.4/5/-1.4/2 (102 reviews), 0.6 flatter in turn than the manufacturer. For the linked molds the same pooling reads 13/5/-1/3 for Nuke (exact) and 12.6/4.7/-2.8/1.8 for Crank SS (0.2 flatter), so the Crank gap is slightly larger than its neighbours' but still under 1.0.
- **Community:** Disc Golf Puttheads Crank page (user quotes, no arm speeds): "go-to driver for straight 400+ foot shots," "slightly easier Nuke," "the people's Nuke — ideal for those without elite arm speed"; the page itself calls it stable to slightly understable at -2/2. Discraft's stability 1.3 was not compared against a second source.
- sources:
  - {name: Discraft ESP Crank (search summary: 13/5/-2/2, stability 1.3), url: https://www.discraft.com/discraft-esp-crank-ecrank, type: manufacturer, weight: 0.7}
  - {name: Infinite Discs Crank, url: https://infinitediscs.com/discraft-crank, type: retailer, weight: 0.5}
  - {name: Infinite Discs Nuke and Crank SS (linked molds), url: https://infinitediscs.com/Discraft-Crank-SS, type: retailer, weight: 0.4}
  - {name: Disc Golf Puttheads Crank flight chart (user quotes), url: https://www.dgputtheads.com/flight-charts/crank, type: community, weight: 0.3}
- **confidence:** 0.65
- **consensusNote:** Discraft's ordering within the Nuke family holds, and the reviewer average is within noise of the published numbers. A turn of -1.4 vs -2 on a speed-13 disc is the kind of gap pooled arm speeds and plastics produce, so no change.
- **plasticVariance:** Sold in ESP, Z, Big Z, Z Lite and Ti; no reliable stability spread by plastic found. null.

---

## Batch 2 report (for Freddy)

**Proposed change (1):** Luna, fade 3 → 2. Review-gated (|Δ| = 1.0). Backed by Discraft's current numbers, Infinite, and two independent reviews. Open question: include glide 3 → 4?

**Confirmed as-is (8):** Leopard, Judge, River, Crave (0.75); Pure, Crank, Glitch (0.65); Reko (0.6). Confirmations mean "no contradicting evidence found," not independent community verification.

**Too thin to call (1):** Boss (turn -1 vs about -0.5; plastic-split evidence).

**Process notes for the next batch**

- `flights.json` is a single-commit snapshot, and the Luna change shows it can lag the manufacturer. Worth diffing Marshall Street's and Discraft's current numbers against it before the next batch of Discraft molds.
- `infinite-manufacturer-ratings.json` carries only UltraLuna and River Pro among these molds, not the base Luna or River; the others come from `flights.json`.
- Linked sets to re-check together if anything changes: Boss/Wraith/Destroyer/Firebird; Judge/EMAC Judge; Crank/Nuke/Crank SS; Luna/Kratos; Reko/Berg.
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access spot-checks Boss first (stated arm speeds, plastic-split), then Reko and Glitch (thinnest community base).

---

# Batch 3 (Plan 10, Phase 2)

Researched October 2, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed.

Molds covered: Link, Predator, FX-2, Ahti, World (Maailma1), Mutant, Proxy, Gazelle, Rhyno, Halo (the next ten by `public/featured.js` order after batches 1–2).

## Batch 3 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Ahti | 9/3/0/4 | none | Confirmed as-is | 0.75 |
| Link | 2/3/0/1 | none | Confirmed as-is | 0.7 |
| Mutant | 5/3/0/4 | none | Confirmed as-is | 0.7 |
| Proxy | 3/3/-1/0.5 | none | Confirmed as-is | 0.7 |
| Rhyno | 2/1/0/3 | none | Confirmed as-is | 0.7 |
| FX-2 | 9/4/0/3 | none | Confirmed as-is (turn -0.5 hint from one retailer) | 0.65 |
| World | 14/4/-0.5/3 | none | Confirmed as-is | 0.65 |
| Gazelle | 6/4/0/2 | none | Confirmed as-is | 0.65 |
| Halo | 13/5/-0.5/3 | none | Confirmed as-is (thin; arm-speed dependent) | 0.55 |
| Predator | 9/4/1/4 | none | **Too thin to call (turn +1 vs about 0; \|Δ\| = 1.0, review-gated if pursued)** | 0.45 |

**No changes proposed. One open candidate (Predator turn +1 → 0), nine confirmed.** Unlike Luna in batch 2, the catalog-lag check came back clean: all ten Atlas numbers match what each manufacturer currently publishes. The Predator question is a published-number-vs-observed-flight tension, not a stale value.

## Evidence limits — batch 3

Same tooling limits as the pilot and batch 2; see above. Specific to this batch:

- **Reddit** blocked, **YouTube** unreachable, **DGCR** 403 (the one thread I tried, Halo, 403'd; others appear only as search-result titles, so none is cited as evidence).
- **Community layer is thin.** Readable named reviews: Aaron (Best Disc Golf Discs, Mutant), Steve Hill (Noodle Arm Disc Golf, Proxy, 2016), Lucas Miller (Green Splatter, Rhyno), and the Disc Golf Reviewer Link vs Penny match (EXO Hard). Only Green Splatter (Rhyno, "within 225 feet of the pin") says anything quantitative about how far the reviewer throws. No source gave a measured arm speed; skill normalization is limited to what the text implies (e.g. "noodle arm" for the Proxy, "intermediate arms" for the Halo). I did not reach 5–10 quality reviews per disc.
- **Disc Golf Puttheads flight-chart pages are templated.** Every one I read had the same structure (beginner / intermediate / advanced paragraphs) and the Halo page called it "between Latitude's Cutlass and Sword," which I could not verify and do not trust. They are cited at weight 0.2 and none is used to move a number. Spot-check before quoting.
- **Infinite individual review text** did not load (only counts and star distribution), so the retailer layer is the pooled reviewer averages again. Those pool plastics and wear; no deviation under 1.0 was treated as a proposal.
- **Marshall Street is the Atlas's own source**, so it is baseline, not independent. Marshall Street's Halo page 404'd on the URL I tried, so its current Halo number was not re-read.
- **Discraft Predator** numbers come from search summaries of discraft.com plus two fetched pages (Big Z Predator, team.discraft.com). The team page, via the summarizer, printed "9/4/1/2.5," which is the stability value landing in the fade slot; I read that as an extraction artifact, not a real fade of 2.5.
- Page contents came through a summarizing fetch step; spot-check any quote before it goes into an override's source note.

**Diff against `flights.json` / `data.json` (done first, per the brief):** Atlas numbers equal the manufacturer's current published numbers for all ten (Link 2/3/0/1, Predator 9/4/1/4, FX-2 9/4/0/3, Ahti 9/3/0/4, World 14/4/-0.5/3, Mutant 5/3/0/4, Proxy 3/3/-1/0.5, Gazelle 6/4/0/2, Rhyno 2/1/0/3, Halo 13/5/-0.5/3). No Luna-style lag found. The only manufacturer-vs-retailer number splits are Predator turn (Discraft +1, Infinite listing 0) and FX-2 turn (Prodigy 0, Infinite listing -0.5), covered below. World's Atlas flight source is Infinite's Westside page; the other nine come from Marshall Street / DiscIt.

---

## Link — Discmania (id b11e87f7e1e8)

- **Atlas now:** 2/3/0/1. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Discmania 2/3/0/1, "Stable" (fetched). Copy: "a reliable, stable flight pattern with low glide to make sure you don't sail past your target." Soft and Hard Exo carry the same numbers. Copy and numbers agree.
- **Retailer:** Infinite 2/3/0/1, "Stable"; reviewer numbers 2.1/3.1/0/1 (63 ratings, 4.71 stars) — essentially identical. Marshall Street 2/3/0/1 "Stable" (baseline).
- **Community:** Disc Golf Reviewer (Link vs Penny match, EXO Hard, no arm speed): "a floaty flight that is straight before having a reliable soft fade at the end." Search-summary retailer content: stable for a putter, takes spin without floating. No contradicting reading found.
- sources:
  - {name: Discmania Link collection page, url: https://www.discmania.net/collections/link, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Link (mfr 2/3/0/1; reviewers 2.1/3.1/0/1), url: https://infinitediscs.com/discmania-link, type: retailer, weight: 0.5}
  - {name: Disc Golf Reviewer Lone Star Penny vs Link, url: https://discgolfreviewer.com/lone-star-penny-putter-vs-discmania-link/, type: community, weight: 0.3}
  - {name: Disc Golf Puttheads Link flight chart (templated), url: https://www.dgputtheads.com/flight-charts/link, type: community, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, Infinite's reviewer average and the one readable reviewer agree on a neutral beaded putter with a soft 1 fade. Nothing supports moving it.
- **plasticVariance:** Evolution Soft/Hard Exo carry identical manufacturer numbers; Exo Hard described as a firm traditional putter blend. No spread found. null.

## Predator — Discraft (id dfe6b11cb13e)

- **Atlas now:** 9/4/1/4 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Evidence too thin to call. Open candidate: turn +1 → 0 (|Δ| = 1.0, so review-gated regardless of confidence).
- **Manufacturer:** Discraft publishes 9/4/**1**/4, stability 2.5 (Big Z Predator page fetched; team.discraft.com page fetched; ESP/Z/FLX pages via search summary). Copy: "our most predictable overstable driver. It holds a line in the wind, or turns a hyzer corner at medium speed. Very fast and consistent." So the Atlas matches the manufacturer. **Tension:** a +1 turn on a "most predictable overstable driver" is odd, and retail sources describe the Raptor as Discraft's zero-turn version of this disc.
- **Retailer:** Infinite lists manufacturer 9/4/**0**/4 (not Discraft's +1), label "Very Overstable," reviewer numbers 9/4/-0.1/4 (43 ratings, 4.63 stars). DiscMetrics also reads 9/4/0/4 ("Very Overstable"; 49 reviews, aggregator, weight low). Marshall Street 9/4/1/4 "Overstable" (baseline). Retailers and aggregators split on 0 vs +1 for the same mold.
- **Community:** Reaper Discs (Raptor vs Predator): "extremely overstable," "a hyzer flip machine," "a consistent harder fade" with minimal turn; the Predator is "beefier than the Raptor and fares better with oncoming headwinds," the Raptor "slightly more workable." The same blog notes the turn is 1 "although it's debatable." Puttheads (templated): "a touch of turn before fading hard" for advanced throwers; "between a Thunderbird and Firebird in overstability." Search-summary reviews: 300–375 ft arms get no turnover trouble; 275–325 ft arms get reliable overstable finishes. No arm speed measured anywhere.
- sources:
  - {name: Discraft Big Z Predator page (9/4/1/4, stability 2.5), url: https://www.discraft.com/big-z-predator-bzpredator, type: manufacturer, weight: 1.0}
  - {name: Discraft team page Predator (9/4/1 and stability 2.5; copy), url: https://www.team.discraft.com/discs/predator, type: manufacturer, weight: 0.8}
  - {name: Infinite Discs Predator (mfr listing 9/4/0/4; reviewers 9/4/-0.1/4), url: https://infinitediscs.com/discraft-predator, type: retailer, weight: 0.5}
  - {name: Marshall Street Big Z Predator (9/4/1/4; not independent), url: https://www.marshallstreetdiscgolf.com/product/big-z-predator-3, type: retailer, weight: 0.2}
  - {name: DiscMetrics Predator (9/4/0/4, aggregator), url: https://discmetrics.com/discs/discraft/predator, type: retailer, weight: 0.2}
  - {name: Reaper Discs Raptor vs Predator, url: https://reaperdiscs.com/blogs/reviews/discraft-raptor-vs-predator, type: community, weight: 0.3}
  - {name: Disc Golf Puttheads Predator flight chart (templated), url: https://www.dgputtheads.com/flight-charts/predator, type: community, weight: 0.2}
- **confidence:** 0.45
- **consensusNote:** Fade 4 and the overstable character are agreed everywhere. The only question is turn: Discraft says +1 on three of its own pages; Infinite's listing, DiscMetrics and Infinite's reviewer average (-0.1) say about 0; reviewers say "little turn" without anyone claiming it turns the wrong way. The manufacturer layer outweighs a retailer re-listing, and the reviewer average pools plastics, so I do not propose a change. If you want the map to show how it flies rather than what Discraft prints, turn 0 is the single candidate and it would be a full-point move needing your call. It would also fit the Raptor comparison, where retail sources call the Raptor the zero-turn, more workable of the pair.
- **plasticVariance:** Z/Big Z/ESP/Ti/FLX all carry 9/4/1/4 per Discraft; reviewers say Z and Big Z resist torque best, FLX preferred in the cold (retailer summaries). No reliable spread. null.
- **Notes for Freddy:** The most recent commit tweaked Predator annotations (lead selection); I did not re-read them. If the turn is changed, check that Predator still reads as the overstable-driver lead alongside Firebird (9/3/0/4) and Ahti (9/3/0/4).

## FX-2 — Prodigy (id e940d26d282d)

- **Atlas now:** 9/4/0/3. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Prodigy 9/4/0/3, "Overstable" (collection page and 500-plastic page fetched; Marshall Street's 400 page carries the same). Copy: "a fast, straight flight with a medium finish"; designed with Chris Dickerson as an overstable disc between the F and H series that "could handle power." **Split:** Infinite lists the manufacturer number as 9/4/-0.5/3, "Stable," and a search summary claimed Prodigy's own page shows -0.5; I could not reproduce that on any page I fetched, which all show 0.
- **Retailer:** Infinite reviewer numbers 9.1/4.1/-0.4/3.1 (30 ratings, 4.15 stars). Marshall Street 9/4/0/3 "Overstable" (baseline). The labels disagree ("Stable" at Infinite, "Overstable" at Prodigy and Marshall Street) while the numbers sit half a step apart.
- **Community:** Puttheads (templated): "a straight initial push with minimal high-speed turn before finishing with a strong and predictable fade"; "holds torque exceptionally well." Search-summary reviews: handles power without dumping early, "more overstable than expected" for some, flexes for 250–350 ft shots in any wind. No arm speed read.
- sources:
  - {name: Prodigy FX-2 fairway driver collection page, url: https://prodigydisc.com/collections/fx-2-fairway-drivers, type: manufacturer, weight: 1.0}
  - {name: Prodigy FX-2 500 plastic page, url: https://prodigydisc.com/products/prodigy-fx-2-500-plastic, type: manufacturer, weight: 0.8}
  - {name: Infinite Discs FX-2 (mfr listing 9/4/-0.5/3; reviewers 9.1/4.1/-0.4/3.1), url: https://infinitediscs.com/prodigy-fx-2, type: retailer, weight: 0.5}
  - {name: Marshall Street FX-2 400 (9/4/0/3; not independent), url: https://www.marshallstreetdiscgolf.com/product/prodigy-fx-2-400, type: retailer, weight: 0.2}
  - {name: Disc Golf Puttheads FX-2 flight chart (templated), url: https://www.dgputtheads.com/flight-charts/fx-2, type: community, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Prodigy's own pages, Marshall Street and retail copy say 0/3; Infinite's listing and its reviewer average lean -0.4 to -0.5 on turn. That is within the half-step noise of pooled plastics and below any threshold I'd act on, and the manufacturer pages I could read do not show -0.5. Worth a re-look only if Prodigy's page is later seen to say -0.5.
- **plasticVariance:** Sold in 300, 400, 500, 750, Air, ReBlend and others; Prodigy's page says numbers are shared across plastics, no stability spread documented. null.

## Ahti — Westside Discs (id f3bd16ab733c)

- **Atlas now:** 9/3/0/4. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Westside 9/3/0/4, "overstable fairway driver" (collection page fetched). Copy: "designed to be a really overstable fairway driver which will be useful for spike hyzers, flex shots, and windy days." Retailer copy describes it as Firebird-like.
- **Retailer:** Infinite "Very Overstable," reviewer numbers 9/3/0.1/4 (34 ratings, 4.53 stars), matching the manufacturer. Marshall Street 9/3/0/4 "Very Overstable."
- **Community:** Puttheads (templated): "Truly a Firebird-style disc—dependable overstability every time," zero turn, low glide, "similarly to a Firebird but with a slightly smoother forward push." Search-summary: one reviewer replaced a lost Firebird with it; another compares it to a Felon. No arm speed read.
- sources:
  - {name: Westside Ahti collection page, url: https://westsidediscs.com/collections/ahti, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Ahti (mfr 9/3/0/4; reviewers 9/3/0.1/4), url: https://infinitediscs.com/westside-ahti, type: retailer, weight: 0.5}
  - {name: Disc Golf Puttheads Ahti flight chart (templated), url: https://www.dgputtheads.com/flight-charts/ahti, type: community, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, the retailer reviewer average (exact), both retailers' labels and every reviewer land on a Firebird-class overstable driver at 0/4. Linked check: Firebird (pilot, 9/3/0/4, confirmed) is numerically identical, which matches Westside's own framing.
- **plasticVariance:** Origio, Tournament, Orbit, VIP: no stability spread documented. null.

## World (Maailma1) — Westside Discs (id ae3c283f1528)

- **Atlas now:** 14/4/-0.5/3 (source: Infinite Discs Westside World, "Manufacturer numbers via Infinite Discs"). **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Westside 14/4/-0.5/3 (collection page fetched). Copy: "our fastest high speed driver ... flies great close to the ground," positioned for pros and also "lower arm speed throwers who benefit from its overstable flight." **Mild tension:** the number (-0.5 turn) reads near-neutral, while retailers (Foundation, Infinite) call it "very overstable."
- **Retailer:** Infinite "Very Overstable," reviewer numbers 13.9/4/-0.4/3.2 (52 ratings, 4.19 stars) — matches. DiscMetrics 14/4/-0.5/3, "Very Overstable," 32 reviews (aggregator, low weight). Foundation Discs (retailer): 14/4/-0.5/3 "very overstable ... incredible glide."
- **Community:** Skyline Discs customer ("Logan M."): "Super stable, predictable disc." Search-summary tests: a white World "had a little less stability at high speeds but a stronger fade," another between the two (a plastic/run difference). Puttheads (templated): "resists turn on torque-heavy backhands and forehands." No arm speed attributed; the All Things Disc Golf review timed out.
- sources:
  - {name: Westside World collection page, url: https://westsidediscs.com/collections/world, type: manufacturer, weight: 1.0}
  - {name: Foundation Discs World (retailer page), url: https://foundationdiscs.com/products/world, type: manufacturer, weight: 0.5}
  - {name: Infinite Discs World (mfr 14/4/-0.5/3; reviewers 13.9/4/-0.4/3.2), url: https://infinitediscs.com/westside-world, type: retailer, weight: 0.5}
  - {name: DiscMetrics World (aggregator), url: https://discmetrics.com/discs/westside/world, type: retailer, weight: 0.2}
  - {name: Skyline Discs World (customer review), url: https://skylinediscs.com/products/westside-discs-world, type: community, weight: 0.2}
  - {name: Disc Golf Puttheads World flight chart (templated), url: https://www.dgputtheads.com/flight-charts/world, type: community, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer, Infinite's reviewer average (within 0.1) and retailer copy agree on 14/4/-0.5/3. The "very overstable" wording is looser than the numbers; the reviewer averages sit on the manufacturer's numbers, so I read it as wording, not a number problem. Linked check: the high-speed overstable cluster (Wraith/Destroyer/Boss from batches 1–2, Halo below) shows the same ordering of turn (-1 to -0.5), nothing here moves any of them.
- **plasticVariance:** Run-to-run stability difference reported (one white World less stable at high speed, stronger fade); BT/VIP/Tournament/Elasto/VIP Air spread not documented. Single-source, not enough to record as meaningful.

## Mutant — Discmania (id fd926a3ce647)

- **Atlas now:** 5/3/0/4. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Discmania 5/3/0/4, "extremely overstable" (collection page fetched). Copy: "an extremely overstable midrange with low glide that can handle even the toughest of headwinds." Copy and numbers agree.
- **Retailer:** Infinite "Very Overstable," reviewer numbers 4.9/2.8/0/3.9 (13 ratings, 4.04 stars; thin sample). Marshall Street 5/3/0/4 "Very Overstable." Reviewer glide 0.2 under, which matches reviewer text below.
- **Community:** Best Disc Golf Discs (Aaron, 13+ years competitive, no arm speed): "an extremely overstable midrange," zero turn gives "perfect line stability," fade "robust and predictable"; the disc "won't loft through the air" despite the glide-3 rating. Search-summary retailer content: "doesn't have as much glide as the flight numbers suggest," "meathook," not useful without arm speed. No turn or fade contradiction.
- sources:
  - {name: Discmania Mutant collection page, url: https://www.discmania.net/collections/mutant, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Mutant (mfr 5/3/0/4; reviewers 4.9/2.8/0/3.9), url: https://infinitediscs.com/discmania-mutant, type: retailer, weight: 0.4}
  - {name: Best Disc Golf Discs Mutant review (Aaron), url: https://bestdiscgolfdiscs.com/discmania-mutant/, type: community, weight: 0.3}
  - {name: Disc Golf Puttheads Mutant flight chart (templated), url: https://www.dgputtheads.com/flight-charts/mutant, type: community, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, reviewer average and the one readable reviewer all agree on 0/4. If anything the sources hint that glide is a bit lower than 3 (Infinite 2.8, "won't loft"), which is outside the turn/fade scope and well under a full point.
- **plasticVariance:** Neo, Lux Vapor, Vapor listed; firm plastics described as keeping clean releases. No spread quantified. null.

## Proxy — Axiom (id 04c864be793a)

- **Atlas now:** 3/3/-1/0.5. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Axiom 3/3/-1/0.5, "Straight-Stable" (fetched). Copy: shares the Envy core with a "short wing width and wide flight plate diameter for superior glide"; the summarizer also reported "understable characteristics during its fade phase," which I could not verify and which would be an odd phrase. Numbers and the "straight" label agree.
- **Retailer:** Infinite "Stable," reviewer numbers 3/3.3/-0.9/0.6 (104 ratings, 4.81 stars) — within 0.1 of the manufacturer on turn and fade. Marshall Street "Understable" (baseline; its label runs a notch below Axiom's).
- **Community:** Noodle Arm Disc Golf (Steve Hill, 2016, Plasma, a slow-arm site): "doesn't fade. It hovers," flies closer to -1/0 or 0/0 than the printed numbers. Puttheads (templated): "remarkably straight," minimal fade, the Envy mold's "slightly less stable, more neutral" sibling; Electron "will beat in" toward turnover. Search-summary: straight at nearly any power; "one of the easiest discs to throw straight, even at low arm speeds." Simon Lizotte named as a user (Infinite).
- sources:
  - {name: Axiom Proxy page, url: https://axiomdiscs.com/discs/proxy/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Proxy (mfr 3/3/-1/0.5; reviewers 3/3.3/-0.9/0.6), url: https://infinitediscs.com/axiom-proxy, type: retailer, weight: 0.5}
  - {name: Noodle Arm Disc Golf Proxy review (Steve Hill, Plasma), url: https://noodlearmdiscgolf.com/2016/02/19/axiom-discs-proxy-back-to-the-future/, type: community, weight: 0.3}
  - {name: Disc Golf Puttheads Proxy flight chart (templated), url: https://www.dgputtheads.com/flight-charts/proxy, type: community, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and the reviewer average agree to within 0.1; reviewers all say straight with almost no fade. The one slower-arm reviewer would put fade nearer 0 than 0.5, a half-step on a 0.5 value, which I would not act on. Linked check: Envy (pilot, 3/3/0/2, confirmed) shares the mold core, and the Proxy's lower stability versus Envy is what the sources describe, so the pair ordering holds.
- **plasticVariance:** Electron beats in toward turnover; Plasma has the most glide; Neutron/Neutron Soft are the stiffer/softer baselines (reviewer comparisons, one source). Keep the mold number at the baseline plastic's flight.

## Gazelle — Innova (id ade1dcf76c6f)

- **Atlas now:** 6/4/0/2. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 6/4/0/2 (fetched). Copy: "A long, straight flight with predictable fade at the end. Handles windy conditions well." Numbers and copy agree.
- **Retailer:** Infinite lists the Innova stability label as "Overstable" while its own description says "a classic stable fairway driver ... more stable than the Leopard, but slower than the TeeBird"; reviewer numbers 6/4/-0.2/1.9 (22 ratings, 4.41 stars). The label conflicts with Infinite's own text, not with the numbers. Marshall Street "Stable."
- **Community:** Puttheads (templated): "laser-straight before fading softly," "forgiving and easy to manage." Search-summary retailer content: "stable enough to handle moderate wind without becoming overly overstable." No named reviewer with an arm speed.
- sources:
  - {name: Innova Gazelle page, url: https://www.innovadiscs.com/disc/gazelle/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Gazelle (mfr 6/4/0/2; reviewers 6/4/-0.2/1.9), url: https://infinitediscs.com/innova-gazelle, type: retailer, weight: 0.5}
  - {name: Disc Golf Puttheads Gazelle flight chart (templated), url: https://www.dgputtheads.com/flight-charts/innova-gazelle, type: community, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and the reviewer average agree on 0/2. The "Overstable" label is loose wording that its own description contradicts. Linked check: Leopard (batch 2, 6/5/-2/1) and TeeBird (pilot, 7/5/0/2) bracket it exactly as Infinite describes ("more stable than the Leopard, slower than the TeeBird"), so the family ordering holds.
- **plasticVariance:** DX is the common plastic, with occasional Champion/Star; Innova's usual DX-beats-in and premium-holds pattern, not quantified for this mold. null.

## Rhyno — Innova (id 80c49cfad337)

- **Atlas now:** 2/1/0/3. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 2/1/0/3, "Overstable" (fetched). Copy: "essential in the wind for short to medium range shots," Thumtrac® grip. Numbers and copy agree.
- **Retailer:** Infinite "Very Overstable," reviewer numbers 2/1.2/0/2.7 (121 ratings, 4.53 stars) — fade 0.3 under, the largest gap in this batch but smaller than the 0.5 Roc gap behind the fade 3 → 2.5 override. Marshall Street "Very Overstable." Linked note: Infinite also tracks the separate **RhynoX** at 2/1/0/4 (Infinite's manufacturer-ratings file); it is a different mold and does not bear on the Rhyno.
- **Community:** Green Splatter (Lucas Miller, "within 225 feet of the pin" is his range; gummy R-Pro/Star runs): "flies straight and gently fades" when thrown flat, "a space between" overstable and understable. Puttheads (templated): "no high-speed turn," "strong, predictable fade," best for 150–225 ft approaches. Search-summary: flies straight for the first 80% of its flight, then fades.
- sources:
  - {name: Innova Rhyno page, url: https://www.innovadiscs.com/disc/rhyno/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Rhyno (mfr 2/1/0/3; reviewers 2/1.2/0/2.7), url: https://infinitediscs.com/innova-rhyno, type: retailer, weight: 0.5}
  - {name: Green Splatter Rhyno review (Lucas Miller), url: https://www.greensplatter.com/review-innova-rhyno/, type: community, weight: 0.3}
  - {name: Disc Golf Puttheads Rhyno flight chart (templated), url: https://www.dgputtheads.com/flight-charts/rhyno, type: community, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and the reviewer average agree within 0.3 on fade; the Green Splatter reviewer's "straight with a gentle fade" is a flat-release, short-range description (under 225 ft), not a contradiction of a 3 fade at full power. Not enough to move fade the way the Roc evidence did.
- **plasticVariance:** Gummy R-Pro/Star runs recommended for stick; hard Champion not. DX, R-Pro, Champion, Star, GStar all sold. Spread not quantified.

## Halo — Latitude 64 (id e4b6733b7189)

- **Atlas now:** 13/5/-0.5/3. **Proposed turn/fade:** none. Evidence is thin but nothing contradicts. Matches.
- **Manufacturer:** Latitude 64 13/5/-0.5/3, "Stable" (fetched). Copy: "a high speed long range driver with excellent speed and distance ... At a 330ft toss it will be stable and consistent." Copy and numbers agree; the 330 ft qualifier makes the stability claim explicitly arm-speed dependent.
- **Retailer:** Infinite "Overstable," reviewer numbers 12.9/5/-0.6/2.8 (54 ratings, 4.46 stars), within 0.1 of the manufacturer on turn and 0.2 on fade. Infinite lists the Halo as **out of production**, which is worth knowing for the map's catalog status but does not affect the numbers. Marshall Street's snapshot lists 13/5/-0.5/3 "Stable" (baseline; its current Halo page 404'd on the URL I tried, so I could not re-read it). Label split on identical numbers: Latitude and Marshall Street "Stable," Infinite "Overstable."
- **Community:** Search-summary of retailer-hosted reviews: "for intermediate arms it flies very consistently and over stable ... as arm speed progresses it can become much more touchy and flippy"; one thrower who normally gets 325–350 ft reports 400 ft with it. Puttheads (templated): "handles power without turning over," "sits between Latitude's Cutlass and Sword in stability" (unverifiable, treated as noise). The DGCR Halo thread 403'd. This is the clearest skill-dependence signal in the batch, and it points to flippier for fast arms, which -0.5 turn already allows for.
- sources:
  - {name: Latitude 64 Halo collection page, url: https://www.latitude64.com/collections/halo, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Halo (mfr 13/5/-0.5/3; reviewers 12.9/5/-0.6/2.8; out of production), url: https://infinitediscs.com/latitude-64-halo, type: retailer, weight: 0.5}
  - {name: Search summary of retailer-hosted reviews (Amazon/Infinite listing text), url: https://infinitediscs.com/Latitude-64-Halo/Opto, type: community, weight: 0.2}
  - {name: Disc Golf Puttheads Halo flight chart (templated), url: https://www.dgputtheads.com/flight-charts/halo, type: community, weight: 0.2}
- **confidence:** 0.55
- **consensusNote:** Manufacturer and Infinite's reviewer average agree on -0.5/3 within noise. The skill-dependence (stable at intermediate speed, flippier when faster) is already encoded in the manufacturer's own "330 ft toss" qualifier. The evidence base is the thinnest of the batch, so the confirmation reads as "no contradicting evidence found." Linked check: this is a different mold from Innova's "Halo Star" plastic (used on the Boss and Rhyno); nothing in the Innova linked set (Boss/Wraith/Destroyer/Firebird) is affected.
- **plasticVariance:** Gold Line, Opto, Opto Air, Opto Ice, Frost, Recycled sold; no documented spread beyond the usual (Opto Air presumably lighter and flippier, unverified). null.

---

## Batch 3 report (for Freddy)

**Proposed changes (0).** Nothing meets the bar (no mold-level correction with strong, independent evidence).

**Open candidate (1):** Predator turn +1 → 0. Discraft prints +1 on three pages; Infinite, DiscMetrics and Infinite's reviewer average (-0.1) say about 0 and reviewers describe little or no turn. Review-gated (|Δ| = 1.0). I did not propose it because the manufacturer layer says +1 and the opposing evidence is a retailer re-listing plus a pooled average. If you want the map to show observed flight over printed number, turn 0 is the move.

**Confirmed as-is (9):** Ahti (0.75); Link, Mutant, Proxy, Rhyno (0.7); FX-2, World, Gazelle (0.65); Halo (0.55). Confirmations mean "no contradicting evidence found," not independent community verification. Differences found were wording (Infinite's "Overstable" label on Gazelle, "Very Overstable" on World), a half-step retailer split (FX-2 turn -0.5 at Infinite vs 0 at Prodigy), or arm-speed/plastic effects.

**Too thin to call (1):** Predator (above). Halo is the thinnest confirmation.

**Process notes for the next batch**

- No catalog lag found this time: all ten Atlas numbers match current manufacturer pages. Luna remains the only stale-number case across three batches.
- Infinite's "manufacturer flight numbers" sometimes differ from the manufacturer's own page (Predator turn 0 vs +1, FX-2 turn -0.5 vs 0). Prefer the manufacturer page when both are readable; flag Infinite-only manufacturer numbers as a retailer reading.
- The Puttheads flight-chart pages are templated and not worth citing above weight 0.2; Best Disc Golf Discs, Noodle Arm, Green Splatter and Disc Golf Reviewer are more useful where they exist.
- Westside's own site is reachable at `westsidediscs.com/collections/<mold>` (the `/products/` path 404s). Prodigy's reachable path is the collection page or a plastic-specific product page.
- Linked sets re-checked this batch with nothing to propose: Ahti/Firebird, Proxy/Envy, Gazelle/Leopard/TeeBird, Rhyno/RhynoX, Predator/Raptor/Firebird. Unchanged from before: Boss/Wraith/Destroyer/Firebird, Judge/EMAC Judge, Crank/Nuke/Crank SS, Luna/Kratos, Reko/Berg.
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access spot-checks Predator first (turn, with arm speeds stated), then Halo and FX-2.

---

# Batch 4 (Plan 10, Phase 2)

Researched October 2, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (already up to date).

Molds covered: Mamba, Shryke, Roadrunner, Valkyrie, Beast, Tern, Katana, Vulcan, Archon, Daedalus (all Innova), researched as named in the brief.

**List note:** these ten are not the next ten in `public/featured.js` order. After Halo the file continues D2, Wombat3, EMAC Judge, Trident, MD3 (new), Magic, Entropy, Surge, Jade, Shryke. Only Shryke overlaps with the list I was given; Roadrunner, Archon and Daedalus are not in `featured.js` at all (they exist in `data.json`). I researched the named list. The featured-order ten (minus Shryke) are still unreviewed.

## Batch 4 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Roadrunner | 9/5/-4/1 | none | Confirmed as-is | 0.75 |
| Mamba | 11/6/-5/1 | none | Confirmed as-is | 0.75 |
| Shryke | 13/6/-2/2 | none | Confirmed as-is (Champion stamp reported -1; plastic effect) | 0.7 |
| Valkyrie | 9/4/-2/2 | none | Confirmed as-is | 0.7 |
| Katana | 13/5/-3/3 | none | Confirmed as-is | 0.7 |
| Beast | 10/5/-2/2 | none | Confirmed as-is (label split, reviewers say a bit more stable) | 0.65 |
| Archon | 11/5/-2/2 | none | Confirmed as-is | 0.65 |
| Vulcan | 13/5/-4/2 | none | Confirmed as-is (thin) | 0.6 |
| Daedalus | 13/6/-3/2 | none | Confirmed as-is (thin) | 0.6 |
| Tern | 12/6/-3/2 | none | **Too thin to call: Innova's mold page says turn -2 vs Atlas -3; plastic-split; \|Δ\| = 1.0, review-gated if pursued** | 0.5 |

**No changes proposed. One open candidate (Tern turn -3 → -2, gated), nine confirmed.** The catalog-lag check you asked for turned up exactly one mismatch, Tern, and it is a plastic-stamp question rather than a clean stale number like Luna (details in the entry).

## Evidence limits — batch 4

Same tooling limits as the earlier batches; see above. Specific to this batch:

- **Diff against `flights.json` / `data.json` (done first):** the Atlas numbers equal Marshall Street's snapshot for all ten. Compared with Innova's current mold pages (all ten fetched): nine match exactly; **Tern differs** (Innova 12/6/**-2**/2, Atlas 12/6/**-3**/2). Infinite's manufacturer numbers match Innova's page for all ten. None of the ten is in `infinite-manufacturer-ratings.json` or `verified-model-overrides.json`.
- **Reddit** blocked, **YouTube** unreachable, **DGCR** 403 (not fetched; titles from search results only, none cited as evidence). Several small review sites failed: Inside the Circle post URLs I guessed 404'd, Discing Daily and St. Jude failed on certificate/DNS errors, Disc Golf Reviewer's Mamba and Daedalus pages 404'd, Best Disc Golf Discs' Daedalus 404'd.
- **Community layer is thin.** Readable named reviews: Alan (Disc Golf Reviewer: Roadrunner, Valkyrie, Beast, Katana, Vulcan, Archon, Tern), Aaron (Best Disc Golf Discs, 13+ years: Mamba, Shryke, Katana, Roadrunner), Broden (Inside the Circle, intermediate, throws 9-10 speed best: Beast, Valkyrie), and Reaper Discs blog posts (Shryke vs Destroyer, Roadrunner vs Sidewinder, Valkyrie vs Beast). Nobody gives a measured arm speed. Skill normalization is limited to what text implies (e.g. Broden's "9-10 speed drivers best", "slower arm speeds" for Katana). I did not reach 5-10 quality reviews per disc. Daedalus and Vulcan are the thinnest.
- **Infinite plastic-level pages** carry their own reviewer averages and listed numbers, which let me see plastic splits (Tern, Shryke, Mamba, Katana, Daedalus). Mold-level averages still pool plastics and wear; the reviewer text quoted from those pages came through a summarizing fetch step and is single-source.
- **Marshall Street's** search-result page was used for Tern only (Star Tern listing 12/6/-3/2). Its numbers are the Atlas baseline, not independent.
- Page contents came through a summarizing fetch step; spot-check any quote before it goes into an override's source note.

---

## Roadrunner — Innova (id a6733dcdd34c)

- **Atlas now:** 9/5/-4/1. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 9/5/-4/1 (fetched), "Understable." Copy: "a long-range distance driver with lots of glide ... excellent finesse driver or long range roller." Copy and numbers agree.
- **Retailer:** Infinite 9/5/-4/1, "Understable"; reviewer numbers 9/5.1/-3.7/1.1 (141 reviews, 4.49 stars), turn 0.3 flatter, within pooled-plastic noise. Marshall Street "Very Understable" (baseline).
- **Community:** Reaper Discs (Roadrunner vs Sidewinder): "-4 turn rating is confirmed as accurate," "will continue turning anhyzer for its entire flight," and it breaks into "a pure roller disc" after months; Champion runs more stable (the same post puts a Champion Sidewinder nearer -2). Disc Golf Reviewer (Alan, Star and Champion, no arm speed; a commenter mentions 370+ ft): understable, soft predictable fade, "effortless glide." Best Disc Golf Discs (Aaron): "remarkable understability," flips up to flat, gentle left finish. Search summary: Star runs "true to the -4 turn," Champion "slightly more stable out of the box."
- sources:
  - {name: Innova Roadrunner page, url: https://www.innovadiscs.com/disc/roadrunner/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Roadrunner (mfr 9/5/-4/1; reviewers 9/5.1/-3.7/1.1), url: https://infinitediscs.com/innova-roadrunner, type: retailer, weight: 0.5}
  - {name: Reaper Discs Roadrunner vs Sidewinder, url: https://reaperdiscs.com/blogs/reviews/innova-roadrunner-vs-sidewinder, type: community, weight: 0.4}
  - {name: Disc Golf Reviewer Roadrunner (Alan), url: https://discgolfreviewer.com/innova-roadrunner/, type: community, weight: 0.3}
  - {name: Best Disc Golf Discs Roadrunner (Aaron), url: https://bestdiscgolfdiscs.com/innova-roadrunner/, type: community, weight: 0.3}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, Infinite's reviewer average and three independent reviewers all describe the most understable of the speed-9 drivers; Reaper explicitly checks the -4 against the Sidewinder's -3. Nothing supports moving it. Linked check: Sidewinder (Atlas 9/5/-3/1) sits one step more stable, which is the ordering Reaper describes.
- **plasticVariance:** Star flies true to -4 and seasons slowly; Champion/Halo Star start more stable and need power to activate the turn; wear turns it into a roller (retailer and review summaries). Keep the mold number at the Star/new-disc flight; do not average.

## Mamba — Innova (id 49058177e711)

- **Atlas now:** 11/6/-5/1. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 11/6/-5/1 (fetched), "Understable (high-speed turn)." Copy: "maximum distance for minimal effort. A great choice for anhyzer tailwind drives." Infinite quotes Innova as "the most understable high speed distance driver in the Innova line." Copy and numbers agree.
- **Retailer:** Infinite 11/6/-5/1, "Understable"; reviewer numbers 11/6/-4.7/1 (188 reviews, 4.33 stars). Champion Mamba page: 11/5.9/-4.8/1 (63 reviews). Marshall Street "Very Understable" (baseline).
- **Community:** Best Disc Golf Discs (Aaron, plastic not specified): "seriously understable," -5 "will turn hard to the right early in the flight" with a gentle finish, for players without "monstrous arm strength." Search summary only (not read): suited to roughly 300-350 ft arms; GStar flies the most understable, Star/Halo Star a touch more stable. Infinite's Champion page quotes reviewers: "Champion plastic makes it come out a bit more stable than the numbers."
- sources:
  - {name: Innova Mamba page, url: https://www.innovadiscs.com/disc/mamba/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Mamba (mfr 11/6/-5/1; reviewers 11/6/-4.7/1), url: https://infinitediscs.com/innova-mamba, type: retailer, weight: 0.5}
  - {name: Infinite Discs Champion Mamba (reviewers 11/5.9/-4.8/1, plastic notes), url: https://infinitediscs.com/innova-mamba/champion, type: retailer, weight: 0.3}
  - {name: Best Disc Golf Discs Mamba (Aaron), url: https://bestdiscgolfdiscs.com/innova-mamba/, type: community, weight: 0.3}
  - {name: Search summary of Mamba reviews (DGCR, St. Jude, Puttheads; not read), url: https://www.dgputtheads.com/flight-charts/mamba, type: community, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, both Infinite averages and the one readable reviewer agree on the most understable high-speed Innova at -5/1. The averages are within 0.3 of the stamp. The community layer is one reviewer plus snippets, so this reads as "no contradicting evidence found."
- **plasticVariance:** Champion runs more stable than the numbers; GStar the most understable; Star/Halo Star in between (Infinite reviewer text, search summary). Keep the mold number at the baseline premium flight; do not average.

## Shryke — Innova (id 4f7f3d501174)

- **Atlas now:** 13/6/-2/2. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 13/6/-2/2 (fetched). Copy: "easy to throw, very long range driver ... A mild high speed turn puts the Shryke in glide mode"; the page text describes "mild high-speed turn and mild low-speed fade, making it stable and controllable." Copy and numbers agree.
- **Retailer:** Infinite 13/6/-2/2, "Stable"; reviewer numbers 12.9/6/-2/1.9 (195 reviews, 4.54 stars). Plastic pages: Star 12.9/6/-2.1/1.9 (105 reviews), Champion 13/6/-1.9/2 (22 reviews). Infinite calls it a "faster, more stable alternative to Tern." Marshall Street "Stable" (baseline).
- **Community:** Reaper Discs (Shryke vs Destroyer): more understable than the Destroyer, "flip up to flat and turns a bit anhyzer," suits lower power, premium plastics fly more overstable when new and it gets more understable as it breaks in. Best Disc Golf Discs (Aaron): -2 gives "slight understability," fade 2 a "dependable hook to the left," needs "substantial power," extreme glide costs predictability in wind. Infinite plastic pages (reviewer text, single-source): one reviewer reports the Champion stamp as 13/6/-1/2; "Champion is a bit more stable than star"; GStar and light weights (150-160 g) more understable.
- sources:
  - {name: Innova Shryke page, url: https://www.innovadiscs.com/disc/shryke/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Shryke (mfr 13/6/-2/2; reviewers 12.9/6/-2/1.9), url: https://infinitediscs.com/innova-shryke, type: retailer, weight: 0.5}
  - {name: Infinite Discs Champion Shryke (plastic notes; stamp -1 reported by one reviewer), url: https://infinitediscs.com/innova-shryke/champion, type: retailer, weight: 0.3}
  - {name: Infinite Discs Star Shryke (reviewers 12.9/6/-2.1/1.9), url: https://infinitediscs.com/innova-shryke/star, type: retailer, weight: 0.3}
  - {name: Reaper Discs Shryke vs Destroyer, url: https://reaperdiscs.com/blogs/reviews/shryke-vs-destroyer, type: community, weight: 0.4}
  - {name: Best Disc Golf Discs Shryke (Aaron), url: https://bestdiscgolfdiscs.com/innova-shryke/, type: community, weight: 0.3}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, the mold-level and Star-level reviewer averages (-2/-2.1, fade 1.9) and two reviewers all land on -2/2. The Champion -1 stamp is one reviewer's report and a plastic effect, so it does not move the mold number.
- **plasticVariance:** Real spread. Champion/Halo Star start more stable (reported stamp -1) and loosen with wear; GStar and light weights run more understable. Keep the mold number at Star/baseline; do not average.
- **Linked check — Destroyer:** Reaper's comparison (Shryke 13/6/-2/2 vs Destroyer 12/5/-1/3, an aged Star Destroyer flying like a new Shryke) is consistent with the Atlas's Destroyer adjustment (12/5/-0.5/3.5) sitting more overstable than Shryke. Nothing to move. See Tern below for the Tern/Shryke/Daedalus set.

## Valkyrie — Innova (id e0a431f84b53)

- **Atlas now:** 9/4/-2/2. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 9/4/-2/2 (fetched), listed as a "turnover distance driver." Copy: "turnover distance driver with great glide. A great choice for tailwind or downhill drives"; max weights "excel for upwind distance." Copy and numbers agree. Infinite's own text calls it "a stable flying distance driver with a good degree of high speed turn and fade," a looser wording than Innova's.
- **Retailer:** Infinite 9/4/-2/2, "Understable"; reviewer numbers 9/4.1/-2/2 (261 reviews, 4.49 stars), an exact match. Marshall Street "Understable" (baseline).
- **Community:** Inside the Circle (Broden, intermediate, Champion): "stronger arms will find this disc to be flippy and more understable than rated," though for his arm it flies "a long, straight shot and just a little bit of fade." Disc Golf Reviewer (Alan, Pro/Star/Champion/DX, no arm speed): "just too understable for me to consistently throw forehand," good as a backhand S-curve. Reaper Discs (Valkyrie vs Beast): "the Valkyrie is a little more understable than the Beast" at identical turn/fade numbers; Beast starts its fade a little later.
- sources:
  - {name: Innova Valkyrie page, url: https://www.innovadiscs.com/disc/valkyrie/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Valkyrie (mfr 9/4/-2/2; reviewers 9/4.1/-2/2), url: https://infinitediscs.com/innova-valkyrie, type: retailer, weight: 0.5}
  - {name: Inside the Circle Valkyrie review (Broden), url: https://www.insidethecircledg.com/post/innova-valkyrie-review, type: community, weight: 0.4}
  - {name: Disc Golf Reviewer Valkyrie (Alan), url: https://discgolfreviewer.com/innova-valkyrie/, type: community, weight: 0.3}
  - {name: Reaper Discs Valkyrie vs Beast, url: https://reaperdiscs.com/blogs/reviews/innova-valkyrie-vs-beast, type: community, weight: 0.3}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and Infinite's 261-review average agree exactly. Reviewers say "understable, especially for stronger arms and forehand," which -2 allows for; the reviewer that read most closely (Reaper) puts it slightly more understable than the Beast on the same numbers, a speed effect, not a turn/fade difference.
- **plasticVariance:** Champion a bit more stable than DX/Star; Pro starts less stable than Star and beats in faster to a turnover driver; Halo variants more stable (review and retailer summaries). Keep the mold number at the baseline premium flight.
- **Linked check — Beast / Archon:** all three read -2/2 in the Atlas and at Innova. Reaper's Valkyrie-more-understable-than-Beast comment is the only ordering hint and it is speed-driven. No change.

## Beast — Innova (id bcf6b8c41051)

- **Atlas now:** 10/5/-2/2. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 10/5/-2/2 (fetched), "Understable (turnover distance driver)." Copy: "long distance driver with a gliding, predictable finish." **Wording split:** Infinite (labelled "Stable") quotes it as "a fast, stable driver that isn't too much for less experienced players"; Marshall Street labels it "Understable." Same numbers, different words.
- **Retailer:** Infinite 10/5/-2/2; reviewer numbers 10/5/-1.9/2 (259 reviews, 4.44 stars), within 0.1.
- **Community:** Inside the Circle (Broden, intermediate, GStar 176 g): "performed better than its -2 turn rating suggested," resists turnover and fights wind, still turns over in a headwind. Disc Golf Reviewer (Alan, Champion/DX, no arm speed): turns left and "levels at the end with a slight fade," "steady driver." Reaper Discs: Beast "starts its fade a little later," needs stronger arm speed than the Valkyrie. Search summary: Champion stable at first and slow to break in; Star longer and easier to flip when new.
- sources:
  - {name: Innova Beast page, url: https://www.innovadiscs.com/disc/beast/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Beast (mfr 10/5/-2/2; reviewers 10/5/-1.9/2), url: https://infinitediscs.com/innova-beast, type: retailer, weight: 0.5}
  - {name: Inside the Circle Beast review (Broden), url: https://www.insidethecircledg.com/post/innova-beast, type: community, weight: 0.4}
  - {name: Disc Golf Reviewer Beast (Alan), url: https://discgolfreviewer.com/innova-beast/, type: community, weight: 0.3}
  - {name: Reaper Discs Valkyrie vs Beast, url: https://reaperdiscs.com/blogs/reviews/innova-valkyrie-vs-beast, type: community, weight: 0.3}
- **confidence:** 0.65
- **consensusNote:** Numbers agree at every layer; the reviewers lean "a bit more stable than -2 implies" (Broden, Alan), but that is a GStar/Champion, intermediate-arm observation and a half-step at most. The label split ("Understable" vs "Stable") is wording on identical numbers.
- **plasticVariance:** DX/Pro/Star flip easier; Champion/Halo more stable and slow to beat in (retailer and review summaries, not quantified).

## Tern — Innova (id 9ea748f5bf64)

- **Atlas now:** 12/6/-3/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Evidence too thin to call. **Open candidate: turn -3 → -2 (|Δ| = 1.0, so review-gated regardless of confidence).**
- **Manufacturer:** Innova's current Tern mold page lists 12/6/**-2**/2, "slightly understable." Copy: "fast, slightly understable disc ... designed for long shot shaping throws with a flight path that maximizes glide." Copy and the page number agree with each other, **not with the Atlas.** **Plastic-level history:** per DGCR search summaries and Disc Golf Reviewer, Innova changed the numbers by plastic without changing the mold: Champion 12/6/-2/2, GStar and Star 12/6/-3/2 (Star originally -4, revised to -3 in early 2014). Marshall Street's Star Tern listing still reads 12/6/-3/2, which is where the Atlas -3 comes from. Disc Golf Reviewer (Alan) lists Star 12/6/-3/**1** and Champion 12/6/-2/2; I did not see a Star fade of 1 anywhere else.
- **Retailer:** Infinite lists the manufacturer number as 12/6/-2/2 on the mold page and on both plastic pages (Star and Champion), "Understable." Reviewer numbers: mold 12/5.9/-2/2 (219 reviews, 4.63 stars); Star 12/6/-2.1/2 (47 reviews); Champion 12/5.9/-1.9/2 (71 reviews). Retailers disagree on the Star number: Marshall Street -3, Infinite -2.
- **Community:** Disc Golf Reviewer (Alan, intermediate target, no arm speed): S-curve, "doesn't require extreme power," gentle fade of 1-2, understable for fast arms in wind. Infinite Star-page reviewers (single-source text): Star is weight- and run-dependent, light Star (137-167 g) more understable, 168-175 g more predictable; Champion "most stable," "more overstable than its numbers suggest" for some intermediates; one reviewer reports a 171 g Star Tern stamped -4. No arm speeds stated.
- sources:
  - {name: Innova Tern page (12/6/-2/2), url: https://www.innovadiscs.com/disc/tern/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Tern (mfr 12/6/-2/2; reviewers 12/5.9/-2/2), url: https://infinitediscs.com/innova-tern, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star Tern (mfr 12/6/-2/2; reviewers 12/6/-2.1/2; plastic notes), url: https://infinitediscs.com/innova-tern/star, type: retailer, weight: 0.3}
  - {name: Infinite Discs Champion Tern (reviewers 12/5.9/-1.9/2), url: https://infinitediscs.com/innova-tern/champion, type: retailer, weight: 0.3}
  - {name: Marshall Street Tern search page (Star Tern 12/6/-3/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=tern&post_type=product, type: retailer, weight: 0.2}
  - {name: Disc Golf Reviewer Tern (Alan; Star -3/1, Champion -2/2), url: https://discgolfreviewer.com/innova-tern/, type: community, weight: 0.3}
  - {name: DGCR "Star Tern Flight Numbers" (search summary: -4 → -3 history; not read), url: https://www.dgcoursereview.com/threads/star-tern-flight-numbers.124333/, type: community, weight: 0.2}
- **confidence:** 0.5
- **consensusNote:** This is the one place in the batch where the Atlas disagrees with a manufacturer page. Innova's mold page and every Infinite number (manufacturer and reviewer, including the Star-only page) say -2; the Atlas and Marshall Street carry the older Star/GStar stamp of -3. It is not a clean stale number like Luna because Innova itself stamps different turn by plastic, and I could not confirm what a new Star Tern prints today (Innova's page shows only the mold number). Infinite's reviewer averages are also anchored by the displayed -2. So: a candidate, not a proposal. **The decision for Freddy is which plastic the Atlas treats as the baseline for Innova molds.** If Star: keep -3. If the mold page: -2.
- **plasticVariance:** Meaningful. Champion most stable (-2 stamp), Star/GStar more understable (-3 stamp), light Star the most understable, run-to-run spread large. Do not average.
- **Linked check — Shryke / Daedalus / Mamba:** if Tern moved to -2, it would equal Shryke's turn (13/6/-2/2) at one speed lower, and Infinite's text already calls the Shryke "a faster, more stable alternative to Tern," so the ordering would still hold, while Daedalus (13/6/-3/2) would become clearly the more understable of the pair. Mamba (-5) and Roadrunner (-4) are unaffected. A change should be reviewed with Shryke and Daedalus as a set.

## Katana — Innova (id 2f995cf7e327)

- **Atlas now:** 13/5/-3/3. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 13/5/-3/3 (fetched), "Understable." Copy: "built with the finesse thrower in mind. Recommended downwind driver ... resembles a Boss with the flight characteristics of a Sidewinder on steroids." Copy and numbers agree.
- **Retailer:** Infinite 13/5/-3/3, "Understable"; reviewer numbers 13/5/-2.7/2.9 (159 reviews, 4.14 stars). Champion Katana page: 13/4.9/-2.7/3 (37 reviews). Marshall Street "Understable" (baseline).
- **Community:** Best Disc Golf Discs (Aaron, Champion Metal Flake): "sharp and tight S-curves when thrown with enough power," -3 "veers to the right during the initial part of its flight," fade 3 "pulls the disc back to the left," stable in wind, "somewhat unforgiving" to form errors. Disc Golf Reviewer (Alan, multiple plastics): flips up and glides on flat releases, "fade is moderate and reliable"; a commenter reports 30-50 ft gains with a 144 g Blizzard. Infinite Champion-page reviewers: "Champion Katanas are domier and tend to be a bit less stable"; Star flat with heavy fade; Pro the flippiest.
- sources:
  - {name: Innova Katana page, url: https://www.innovadiscs.com/disc/katana/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Katana (mfr 13/5/-3/3; reviewers 13/5/-2.7/2.9), url: https://infinitediscs.com/innova-katana, type: retailer, weight: 0.5}
  - {name: Infinite Discs Champion Katana (reviewers 13/4.9/-2.7/3; plastic notes), url: https://infinitediscs.com/innova-katana/champion, type: retailer, weight: 0.3}
  - {name: Best Disc Golf Discs Katana (Aaron), url: https://bestdiscgolfdiscs.com/innova-katana/, type: community, weight: 0.3}
  - {name: Disc Golf Reviewer Katana (Alan), url: https://discgolfreviewer.com/innova-katana/, type: community, weight: 0.3}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, both reviewer averages (turn 0.3 flatter, fade within 0.1) and two reviewers agree on a -3 turn with a real fade of 3. Nothing supports moving it.
- **plasticVariance:** Pro flippiest, Star flatter with heavy fade, Champion domier and least flippy (Infinite reviewer text, single-source). Keep the mold number at the baseline flight.
- **Linked check — Vulcan:** Innova's copy says Vulcan is "similar in flight to our Katana with less low speed fade," and the Atlas has Vulcan at -4/2 vs Katana -3/3, which matches. See Vulcan below.

## Vulcan — Innova (id 7aca50d93f5b)

- **Atlas now:** 13/5/-4/2. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 13/5/-4/2 (fetched), "Understable." Copy: "designed for less powerful players ... Similar in flight to our Katana with less low speed fade ... Makes a great long range roller as well." Copy and numbers agree.
- **Retailer:** Infinite 13/5/-4/2, "Understable"; reviewer numbers 13/5/-3.6/2 (71 reviews, 3.86 stars), turn 0.4 flatter, within pooled-plastic noise. Marshall Street "Very Understable" (baseline).
- **Community:** Thin. Disc Golf Reviewer (Alan, Star, not a power thrower; averaged 12 ft more per forehand than a Groove): understable, "best for less experienced players," mostly restating Innova's copy. Search summary only: "a more pronounced right turn and a slightly smaller fade" than the Katana, best for rollers and lower arm speeds. DGCR and Discing Daily were not readable.
- sources:
  - {name: Innova Vulcan page, url: https://www.innovadiscs.com/disc/vulcan/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Vulcan (mfr 13/5/-4/2; reviewers 13/5/-3.6/2), url: https://infinitediscs.com/innova-vulcan, type: retailer, weight: 0.5}
  - {name: Disc Golf Reviewer Vulcan (Alan), url: https://discgolfreviewer.com/innova-vulcan/, type: community, weight: 0.2}
  - {name: Search summary of Vulcan vs Katana reviews (Disc Golf Warrior, Discing Daily; not read), url: https://discingdaily.com/innova-vulcan-review/, type: community, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** Manufacturer, the Infinite average and the Katana comparison all agree on -4/2. The community evidence is the thinnest in the batch, so this is "no contradicting evidence found," not independent verification.
- **plasticVariance:** Star, GStar, Champion, Blizzard, Pro; no spread documented. Light weights (158 g and up) are part of the design. null.

## Archon — Innova (id 71d03664e9f1)

- **Atlas now:** 11/5/-2/2. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 11/5/-2/2 (fetched). Copy: "blends the graceful long turn of the Katana with the smooth fade of a Wraith ... described as a longer Valkyrie." Copy and numbers agree (turn between Valkyrie's -2 and Katana's -3, fade between Valkyrie's 2 and Wraith's 3).
- **Retailer:** Infinite 11/5/-2/2, label "Stable"; reviewer numbers 11/5/-1.9/2 (83 reviews, 4.23 stars). Infinite's description calls it "significant turn and strong fade ... an overall neutral flight path." Marshall Street "Stable" (baseline).
- **Community:** Disc Golf Reviewer (Alan, Champion and Star, no arm speed): "when thrown with power this disc turns slightly and then keeps on going by fading back." Search summary only (not read): more turn and less fade than a Wraith, "doesn't punish slower arm speeds," soft fade, easy hyzer flips.
- sources:
  - {name: Innova Archon page, url: https://www.innovadiscs.com/disc/archon/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Archon (mfr 11/5/-2/2; reviewers 11/5/-1.9/2), url: https://infinitediscs.com/innova-archon, type: retailer, weight: 0.5}
  - {name: Disc Golf Reviewer Archon (Alan), url: https://discgolfreviewer.com/innova-archon/, type: community, weight: 0.3}
  - {name: Search summary of Archon vs Wraith comparisons (Disc Golf United, Puttheads; not read), url: https://discgolfunited.com/discs/distance-driver/archon, type: community, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer, Infinite's average and the one readable reviewer agree on -2/2. The "stable"/"neutral" wording at Infinite is a description of the net flight, not a number mismatch. Linked check: Wraith (pilot, 11/5/-1/3, confirmed) differs by one step of turn and one of fade in exactly the direction Innova describes, so the Archon-Wraith pairing holds.
- **plasticVariance:** Champion, Star, GStar, EchoStar; no spread documented. null.

## Daedalus — Innova (id c51219e52342)

- **Atlas now:** 13/6/-3/2. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 13/6/-3/2 (fetched), "Understable." Copy: "a maximum downwind distance driver crafted for less powerful players and doubles as a long distance roller for more advanced players." Copy and numbers agree.
- **Retailer:** Infinite 13/6/-3/2, "Understable"; reviewer numbers 13/5.9/-3.4/1.9 (93 reviews, 4.34 stars), turn 0.4 more understable. Champion page: 13/6/-3/2 listed, reviewers mixed (13/5/-3/2 and 13/6/-4/2 reports; 28 ratings). Marshall Street "Very Understable" (baseline).
- **Community:** Very thin. Infinite Champion-page reviewer text: "Champion plastic negates some of the understability," Star keeps more of it. Search summary only (not read): Star the most understable and least consistent, GStar easy distance for slower arms, Champion "flies similar to a very beaten in Destroyer." Disc Golf Reviewer, Inside the Circle and Best Disc Golf Discs pages for the Daedalus were not available.
- sources:
  - {name: Innova Daedalus page, url: https://www.innovadiscs.com/disc/daedalus/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Daedalus (mfr 13/6/-3/2; reviewers 13/5.9/-3.4/1.9), url: https://infinitediscs.com/innova-daedalus, type: retailer, weight: 0.5}
  - {name: Infinite Discs Champion Daedalus (reviewer plastic notes), url: https://infinitediscs.com/innova-daedalus/champion, type: retailer, weight: 0.3}
  - {name: Search summary of Daedalus reviews (Skyline Discs, retailer blogs; not read), url: https://skylinediscs.com/products/innova-daedalus, type: community, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** Manufacturer and Infinite agree on -3/2; the reviewer average runs slightly more understable (-3.4), which is within pooled-plastic noise. The community base is mostly plastic notes, so this is "no contradicting evidence found." Linked check: see Tern (if Tern were set to -2, Daedalus at -3 would stay the more understable of the pair).
- **plasticVariance:** Champion more stable than Star; Star the most understable and least consistent; GStar for slow arms (Infinite reviewer text and search summary, not quantified). Keep the mold number at the baseline.

---

## Batch 4 report (for Freddy)

**Proposed changes (0).** Nothing meets the bar.

**Open candidate (1):** Tern turn -3 → -2. Innova's mold page and every Infinite number (manufacturer and reviewer, including Star-only) say -2; the Atlas and Marshall Street carry the Star/GStar stamp of -3, and Innova stamps Champion at -2. Review-gated (|Δ| = 1.0). I did not propose it because this is a baseline-plastic question rather than a clean stale number, and I could not confirm today's Star stamp from Innova directly. If you decide Innova molds should follow the mold page, Tern is the single change in this batch; review it with Shryke and Daedalus.

**Confirmed as-is (9):** Roadrunner, Mamba (0.75); Shryke, Valkyrie, Katana (0.7); Beast, Archon (0.65); Vulcan, Daedalus (0.6). Confirmations mean "no contradicting evidence found," not independent community verification. Differences found were wording (Beast "Stable" at Infinite vs "Understable" at Marshall Street, Archon "neutral"), plastic stamps (Shryke Champion reported -1), or arm-speed effects (Valkyrie and Beast read more stable or more understable depending on the thrower).

**Too thin to call (1):** Tern. Vulcan and Daedalus are the thinnest confirmations.

**Process notes for the next batch**

- The brief's ten were not the next ten by `featured.js`. If the intent was strictly featured order, the remaining ones are D2, Wombat3, EMAC Judge, Trident, MD3 (new), Magic, Entropy, Surge and Jade (Shryke is now done); Roadrunner, Archon and Daedalus are outside featured.js.
- Innova mold pages show one set of numbers, but Innova stamps vary by plastic (Tern, Shryke Champion, Boss from batch 2). Worth a standing rule on which plastic the Atlas treats as the baseline before more Innova numbers are touched; Tern and Boss are both waiting on it.
- Infinite plastic-specific pages (`/innova-<mold>/<plastic>`) expose per-plastic reviewer averages and reviewer text, which is the best available way to see plastic splits without DGCR.
- Inside the Circle post URLs are `/post/innova-<mold>` only for some molds (Beast and Valkyrie worked; the Katana, Vulcan, Daedalus, Archon, Shryke and Mamba guesses 404'd). Disc Golf Reviewer and Best Disc Golf Discs follow `/innova-<mold>/` but not every mold exists.
- Linked sets re-checked this batch with nothing to propose: Tern/Shryke/Daedalus/Mamba, Valkyrie/Beast/Archon, Katana/Vulcan, Roadrunner/Sidewinder, Archon/Wraith, Shryke/Destroyer. Unchanged from before: Boss/Wraith/Destroyer/Firebird, Judge/EMAC Judge, Crank/Nuke/Crank SS, Luna/Kratos, Reko/Berg.
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access spot-checks Tern first (what a new Star Tern prints, and arm-speed-stated flights), then Daedalus and Vulcan.

---

# Batch 5 (Plan 10, Phase 2)

Researched October 2, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (already up to date).

Molds covered: D2, Wombat3, EMAC Judge, Trident, MD3 (new), Magic, Entropy, Surge, Jade, Force (the next ten by `public/featured.js` order after Halo; Shryke was done in batch 4).

## Decided items (recorded before the research)

**1. Plastic baseline policy (owner-decided Oct 2, 2026).** A mold's reference numbers are its most-thrown plastic (Star for Innova drivers). DX is the price-tier baseline but **not** the flight reference: it beats in fast, is a moving target, and is not universal. Applies going forward. *Caveat on how I applied it:* I had no sales data, so each entry names the reference plastic I took to be the most-thrown (stated per entry, marked "assumed"). Earlier batches used "baseline/new-disc flight" wording and were not re-opened.

**2. Resolutions of two earlier open candidates under that policy.**

### Tern — resolved: confirmed as-is (batch 4 candidate closed)

- **Resolution:** keep **12/6/-3/2**. Under the policy the Star stamp is ground truth (Star Tern prints -3), so the Atlas -3 stays. Innova's website mold page showing -2 is unexplained drift, not a reason to move the Atlas. No override, no change. The batch 4 "open candidate -3 → -2" is withdrawn.
- **plasticVariance (for the record):** Champion Tern is -2 (Innova's page, plus Infinite's Champion page). Star/GStar -3. Light Star runs more understable. Do not average.
- **Linked:** Shryke (13/6/-2/2) and Daedalus (13/6/-3/2) are unaffected because Tern does not move. The batch 4 "review as a set" note is closed.

### Boss — resolved: confirmed as-is (batch 2 candidate closed)

- **Resolution:** keep **13/5/-1/3**. Under the policy the reference is the most-thrown plastic's number, and the website's -1 stays the Atlas value. The batch 2 "open candidate -1 → -0.5" is withdrawn.
- **plasticVariance (for the record):** Champion Boss is stamped **0/3** (Innova stamp, per Infinite); Champion/Halo most overstable, Star/DX flatter, beat-in Pro/DX add real turn. Recorded as variance, not a mold change.
- **Linked:** Wraith (11/5/-1/3) and the Destroyer's Atlas adjustment (12/5/-0.5/3.5) are unaffected because Boss does not move. The Boss/Wraith/Destroyer/Firebird re-check is closed unless one of them changes for another reason.

---

## Batch 5 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Wombat3 | 5/6/-1/0 | none | Confirmed as-is | 0.7 |
| Entropy | 4/3/0/3 | none | Confirmed as-is | 0.7 |
| Force | 12/5/0/3 | none | Confirmed as-is | 0.7 |
| Magic | 2/3/-1/0 | none | Confirmed as-is | 0.65 |
| Surge | 11/5/-1/3 | none | Confirmed as-is | 0.65 |
| Jade | 9/6/-2/1 | none | Confirmed as-is (reviewer glide runs low; out of scope) | 0.65 |
| EMAC Judge | 2/4/0/1 | none | Confirmed as-is (pair: manufacturer copy and one reviewer disagree on direction) | 0.6 |
| Trident | 6/4/-0.5/3 | none | **Too thin to call: fade 3 vs about 3.8–3.9 in retailer averages. Strongest open candidate in the batch (3 → 3.5, not gated)** | 0.55 |
| D2 | 12/5/0/3 | none | **Too thin to call: Prodigy product pages say 0/3, four retailers say -0.5 (turn 0 → -0.5, not gated)** | 0.5 |
| MD3 (new) | 5/5/0/1 | none | **Too thin to call: Discmania lowered fade 2 → 1 in 10/2021; reviewers still average about 2** | 0.5 |

**No changes proposed. Three open candidates (Trident fade, D2 turn, MD3 fade), seven confirmed.** No Luna-style catalog lag turned up. The three candidates are manufacturer-vs-retailer splits where the manufacturer layer, which outweighs pooled retailer averages, says the Atlas value.

## Evidence limits — batch 5

Same tooling limits as earlier batches; see the pilot section. Specific to this batch:

- **Diff against `flights.json` / `data.json` (done first):** the Atlas numbers equal Marshall Street's snapshot for nine of the ten. MD3 comes from the verified override (Discmania collection page, checked 2026-09-23). Compared with current manufacturer pages: **eight match exactly** (Wombat3, EMAC Judge, Trident, MD3, Magic, Entropy, Jade, Force; Surge matches via Discraft's team page). **D2 is split:** Prodigy's own 400 and 500 plastic pages print 12/5/0/3 (matches the Atlas), while Infinite, Foundation Discs, DiscMetrics and Skyline list 12/6/-0.5/3 and Disc Golf Puttheads 12/6/-1/3. I could not reach Prodigy's collection page (404), so I cannot say which Prodigy source is current. None of the ten is in `infinite-manufacturer-ratings.json`; only MD3 is in `verified-model-overrides.json`.
- **Reddit** blocked, **YouTube** unreachable, **DGCR** 403 (the D2 thread 403'd; others appear only as search-result titles, none cited as evidence). All Things Disc Golf returned 500/timeouts for the D2, Jade, Wombat and MD3 reviews, so none is cited as read.
- **Community layer is thin.** The only named independent review I could read was Broden (Inside the Circle, EMAC Judge, Prime). The rest came from Infinite plastic-page reviewer text (anonymous, single-source, summarized), Disc Golf Dojo, Skyline, retailer product copy, and Disc Golf Puttheads flight charts (templated, byline "Maredith", weight 0.2). No source gave a measured arm speed. Skill normalization is limited to what text implies (e.g. "arm speed suited for 8–9 speed discs" on the Jade, "throwing 225 feet max" on the Wombat3, "400+ feet" for the Force, "full power flat out to about 250 feet" on the Entropy). I did not reach 5–10 quality reviews per disc. Confirmations read as "no contradicting evidence found."
- **Infinite individual review text** loaded only as a summary of reviewer comments; pooled reviewer averages are used at capped weight and never alone for a proposal. They pool plastics and wear and are anchored by the numbers Infinite displays.
- **Marshall Street is the Atlas's own source** and was used only as baseline.
- **Discraft pages:** the discraft.com URLs I guessed 404'd, but `www.team.discraft.com/discs/<mold>` and the Z Line Force page were readable (Force 12/5/0/3, stability 2.0; Surge 11/5/-1/3, stability 1.7).
- Page contents came through a summarizing fetch step; spot-check any quote before it goes into an override's source note.

---

## D2 — Prodigy (id 18266ff0cae7)

- **Atlas now:** 12/5/0/3 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Evidence too thin to call. Open candidate: turn 0 → -0.5 (|Δ| = 0.5, below the review gate).
- **Manufacturer:** Prodigy's 400 and 500 plastic pages (fetched) both print 12/5/0/3, "Overstable." Copy: "a very fast, over stable driver that is designed for strong throwers," "the least amount of side-to-side movement of any driver on the market," "equally as long, twice as forgiving and has a much gentler finish" than the D1. **Contradiction in the retail layer:** Infinite's listing (labelled as manufacturer numbers), Foundation Discs, DiscMetrics and Skyline say 12/6/-0.5/3, and Infinite's description says the D2 has "a higher degree of high-speed turn, and slightly less low-speed fade" than the D1. A D2 at 0 turn would have the same turn as the D1 (Atlas D1 12/5/0/4), so that copy only fits if the D2 has some turn. Prodigy's own pages do not reconcile their numbers with that wording. Marshall Street 12/5/0/3 (baseline; not independent).
- **Retailer:** Infinite "Overstable"; reviewer numbers 12.1/5.9/-0.9/2.9 (77 ratings, 4.65 stars); the 400G page reads 12.2/5.9/-0.9/2.9 (34 reviews). The reviewers sit 0.4 more understable than Infinite's own -0.5 and 0.9 more than Prodigy's page. DiscMetrics: 499 reviews, "Overstable," manufacturer 12/6/-0.5/3. Glide reads 5.9 at Infinite, which backs the retailer glide of 6 over Prodigy's 5 (glide is outside the turn/fade scope).
- **Community:** Infinite 400G reviewer text (anonymous, single-source): "a bit of turn," "just a hint of high speed turn," "noticeable low speed fade"; when beaten in "won't be trustworthy into a headwind"; recommended for power throwers and "350–400 foot hyzer shots"; one reviewer averaging 310 ft found a 165 g disc "not very stable." Skyline customer (N.M.): more glide than their Destroyers. Disc Golf Puttheads (templated): "slight high-speed turn, tons of glide, and a strong but not dumpy finish" for power throwers; "fast and moderately overstable" for newer players. No arm speed measured anywhere.
- sources:
  - {name: Prodigy D2 400 plastic page (12/5/0/3), url: https://prodigydisc.com/products/prodigy-d2-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Prodigy D2 500 plastic page (12/5/0/3), url: https://prodigydisc.com/products/prodigy-d2-500-plastic, type: manufacturer, weight: 0.8}
  - {name: Infinite Discs D2 (listing 12/6/-0.5/3; reviewers 12.1/5.9/-0.9/2.9), url: https://infinitediscs.com/prodigy-d2, type: retailer, weight: 0.5}
  - {name: Infinite Discs 400G D2 (reviewers 12.2/5.9/-0.9/2.9; plastic notes), url: https://infinitediscs.com/Prodigy-D2/400G, type: retailer, weight: 0.3}
  - {name: Foundation Discs D2 (12/6/-0.5/3), url: https://foundationdiscs.com/products/d2, type: retailer, weight: 0.3}
  - {name: Marshall Street D2 300 (12/5/0/3; not independent), url: https://www.marshallstreetdiscgolf.com/product/prodigy-d2-300, type: retailer, weight: 0.2}
  - {name: DiscMetrics D2 (12/6/-0.5/3; aggregator), url: https://discmetrics.com/discs/prodigy/d2, type: retailer, weight: 0.2}
  - {name: Skyline Discs D2 (12/6/-0.5/3; one customer review), url: https://skylinediscs.com/products/prodigy-disc-d2, type: retailer, weight: 0.2}
  - {name: Disc Golf Puttheads D2 flight chart (templated; lists 12/6/-1/3), url: https://www.dgputtheads.com/flight-charts/d2, type: community, weight: 0.2}
- **confidence:** 0.5
- **consensusNote:** Fade 3 and the overstable character are agreed everywhere. The only open question is turn (0 vs -0.5) and, outside scope, glide (5 vs 6). Prodigy's own product pages say 0, but they carry long-standing copy and I could not read the collection page, so I cannot tell whether those pages or the retailers' 12/6/-0.5/3 track Prodigy's current catalog. Reviewer text (a hint of high-speed turn) and the Infinite averages lean toward some turn. If a re-look is wanted, a D2 turn of -0.5 is the single candidate and it needs Prodigy's current catalog number first. It would also give the D2 the extra turn that Infinite's D1-comparison copy describes.
- **plasticVariance:** Prodigy's pages carry identical numbers across 400 and 500. Reviewers say 400G seasons well and beats in to a flippy driver; lighter weights (165 g) fly less stable. Reference plastic (assumed most-thrown): 400. Do not average.
- **Linked check — D1 / D3:** Atlas D1 12/5/0/4 and D3 12/5/-1/3 bracket the D2 as Prodigy describes. A D2 at -0.5 would still sit between them, so a change would not break the ordering. Review D1/D3 as a set if the D2 moves.

## Wombat3 — Innova (id 636467c5ea5a)

- **Atlas now:** 5/6/-1/0. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Innova 5/6/-1/0 (fetched). Copy: "Great Feel, Straight Flight, Maximum Glide"; "Straight shots still go straight while turnovers stay turned with a gentle landing"; VTech rim for torque resistance. Copy and numbers agree.
- **Retailer:** Infinite "Understable"; reviewer numbers 5/5.9/-1.1/0.1 (47 ratings, 4.39 stars); the Star page reads 4.9/5.9/-1.2/0.1 (18 reviews). Marshall Street 5/6/-1/0 (baseline). Skyline copy: neutral, forgiving, "holds the exact line."
- **Community:** Infinite Star-page reviewers (single-source text): "will hold whatever line you put it on," "turns right and glides out" on anhyzer, "almost no low speed fade at all," a "finesse disc"; suits new players and "throwing 225 feet max." Search-summary retailer content: a high-arm-speed thrower may need to dial it down. No named independent reviewer read (All Things Disc Golf timed out).
- sources:
  - {name: Innova Wombat3 page, url: https://www.innovadiscs.com/disc/wombat3/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Wombat3 (mfr 5/6/-1/0; reviewers 5/5.9/-1.1/0.1), url: https://infinitediscs.com/innova-wombat3, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star Wombat3 (reviewers 4.9/5.9/-1.2/0.1; plastic notes), url: https://infinitediscs.com/Innova-Wombat3/Star, type: retailer, weight: 0.3}
  - {name: Skyline Discs Wombat3 (copy; plastic notes), url: https://skylinediscs.com/products/innova-wombat3, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, both reviewer averages (within 0.2 on turn, 0.1 on fade) and the reviewer text all say a high-glide understable midrange with almost no fade. Nothing supports moving it. Linked check: Atlas Latitude 64 Fuse has identical numbers (5/6/-1/0), unchanged.
- **plasticVariance:** DX beats in quickly to a more turnover-friendly disc; Champion is firmer; GStar gummier. Reference plastic (assumed most-thrown, per the Innova policy): Star. Do not average.

## EMAC Judge — Dynamic Discs (id 4c20b4f66a09)

- **Atlas now:** 2/4/0/1. **Proposed turn/fade:** none. Matches the numbers; see the pair comparison below.
- **Manufacturer:** Dynamic's Classic EMAC Judge page (fetched) lists 2/4/0/1, "neutral stability." Copy: "less of a bead and a bit less fade" than the Judge; designed with Eric McCabe to sit "in between the Judge and the Warden"; microbead for a smooth release; "reduced diving fade." **Contradiction in the retail layer:** Infinite's page copy says the EMAC Judge "has a very similar flight path to the Judge, but offers a very different in-hand feel with the microbead" and lists it 2/4/0/1.
- **Retailer:** Infinite "Stable"; reviewer numbers 2/4/0/1 (33 ratings, 4.64 stars). Marshall Street 2/4/0/1 (baseline).
- **Community:** Inside the Circle (Broden, Prime plastic, arm speed not stated): "extremely straight flying," "even when I rip this disc for distance, it fights hard to not turn," flies "a little faster than" a speed 2; and **"just a touch more fade than the Judge,"** which he says helps it keep a stable flight as it beats in. That is the opposite direction from Dynamic's copy. Search-summary retailer content: "more neutral flight path" than the Judge, "flies straight with minimal fade," "just like a regular Judge but with a cleaner release."
- sources:
  - {name: Dynamic Discs Classic EMAC Judge page, url: https://www.dynamicdiscs.com/products/classic-emac-judge, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs EMac Judge (mfr 2/4/0/1; reviewers 2/4/0/1), url: https://infinitediscs.com/dynamic-discs-emac-judge, type: retailer, weight: 0.5}
  - {name: Inside the Circle EMac Judge review (Broden, Prime), url: https://www.insidethecircledg.com/post/dynamic-discs-emac-judge, type: community, weight: 0.4}
  - {name: Infinite Discs Classic Blend EMAC Judge (search snippet), url: https://infinitediscs.com/dynamic-discs-emac-judge/classic-blend, type: retailer, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** Both discs are listed 2/4/0/1 by Dynamic, Infinite and Marshall Street, and Infinite's reviewer averages read 2/4/0/1 for the EMAC (33 ratings) and 2/4/0/0.9 for the Judge (242 ratings). The only evidence on their relative fade points three ways: Dynamic's copy says the EMAC has less, Infinite's copy says they are very similar, and the one readable independent reviewer says the EMAC has a touch more. No consistent direction, so no ordering is supported. Neither mold moves.
- **plasticVariance:** Judge and EMAC Judge are both sold in Classic, Classic Blend, Lucid, Fuzion, Prime and others; batch 2 found Fuzion beats in faster than Fluid and Lucid. No EMAC-specific spread found. Reference plastic (assumed, not verified): a premium blend such as Lucid or Classic Blend.
- **Pair comparison — Judge (cd8e49f1fa20) vs EMAC Judge (4c20b4f66a09):**

| Source | Judge | EMAC Judge | Says about the pair |
|---|---|---|---|
| Dynamic Discs numbers | 2/4/0/1 | 2/4/0/1 | identical |
| Dynamic Discs copy | "incredibly predictable… straight-flying" (batch 2) | "less of a bead and a bit less fade," sits between Judge and Warden | EMAC has less fade |
| Infinite listing / copy | 2/4/0/1 | 2/4/0/1; "very similar flight path to the Judge" | same flight |
| Infinite reviewer average | 2/4/0/0.9 (242) | 2/4/0/1 (33) | same; EMAC sample thin |
| Inside the Circle (Broden, EMAC, Prime) | n/a | "just a touch more fade than the Judge" | EMAC has more fade |
| Disc Golf Reviewer (Smellie, Judge, batch 2) | straight to overstable; fade starts earlier than the Bleak | n/a | not comparable |
| Atlas Warden (reference point) | n/a | n/a | Warden is 2/4/0/0.5 |

  Net: if the manufacturer copy were taken literally, the EMAC would sit between the Judge (fade 1) and the Warden (fade 0.5), about 0.75. One independent reviewer says the opposite, and the retailer averages cannot separate them. Candidate if you want Dynamic's ordering on the map: EMAC fade 1 → 0.75. I do not propose it, because the only independent evidence runs against it and another layer says "same." Judge confirmed 2/4/0/1 (batch 2 verdict stands).

## Trident — Latitude 64 (id 0336bb800aa0)

- **Atlas now:** 6/4/-0.5/3. **Proposed turn/fade:** none. Evidence too thin to call. **Open candidate: fade 3 → 3.5** (|Δ| = 0.5, below the review gate). This is the strongest candidate in the batch.
- **Manufacturer:** Latitude 64 6/4/-0.5/3, "Overstable" (collection page fetched). Copy: "an overstable control driver good for windy days and those safe hyzer shots," "a strong fade and reliable flightpath," "recommended for advanced players." Infinite quotes L64 as "perfect for specialty shots that require a monster hooking fade." **Mild copy-vs-number tension:** "monster hooking fade" reads stronger than fade 3.
- **Retailer:** Infinite "Very Overstable"; reviewer numbers 5.8/3.2/-0.2/3.9 (50 reviews, 4.64 stars); the Opto page reads 5.6/3.2/-0.3/3.8 (17 reviews). The fade gap is 0.8–0.9, larger than any retailer-vs-manufacturer fade gap in earlier batches (the Roc's 0.5 was the previous largest). Marshall Street 6/4/-0.5/3 (baseline). Disc Golf Dojo and Skyline carry the same numbers. DiscMetrics 404'd.
- **Community:** Infinite Opto-page reviewers (single-source text): "goes strait a little bit longer than other discs with similar stability ratings, but it does not lack in its fade," fade "dumping abrupt, and very accurate," "will go super straight, then suddenly take a 90 degree turn," "it will always flatten out and fades hard left," plays slower than its rating ("the wing feels like a speed 7"). Search-summary snippets (not read): at full power thrown flat it doesn't turn, but "as it slows it fades heavily"; one reviewer says another disc has "a straight flight with hard fade, whereas the Trident starts the fade action much sooner"; another needed "considerable over the top OAT" to make it fly straight on thumbers. Disc Golf Puttheads (templated): "a firm, fast fade," and newer throwers see "an early, strong fade and shorter distance." No readable arm speeds.
- sources:
  - {name: Latitude 64 Trident collection page (6/4/-0.5/3), url: https://latitude64.com/collections/trident, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Trident (mfr 6/4/-0.5/3; reviewers 5.8/3.2/-0.2/3.9), url: https://infinitediscs.com/latitude-64-trident, type: retailer, weight: 0.5}
  - {name: Infinite Discs Opto Trident (reviewers 5.6/3.2/-0.3/3.8; reviewer text), url: https://infinitediscs.com/latitude-64-trident/opto, type: retailer, weight: 0.3}
  - {name: Disc Golf Dojo Trident (copy), url: https://discgolfdojo.com/discs/latitude-64/fairway-drivers/trident/, type: retailer, weight: 0.2}
  - {name: DGCR Latitude 64 Trident thread (search snippet, not read), url: https://www.dgcoursereview.com/threads/latitude-64-trident.82213/, type: community, weight: 0.2}
  - {name: Disc Golf Puttheads Trident flight chart (templated), url: https://www.dgputtheads.com/flight-charts/trident, type: community, weight: 0.2}
- **confidence:** 0.55
- **consensusNote:** Every readable layer points the same way on fade: Infinite's mold-level and Opto averages (3.9 and 3.8, 67 reviews between them), L64's own "monster hooking fade" copy as quoted by Infinite, and every reviewer sentence I could read. Nothing points the other way. I still do not propose it, because the printed number is Latitude 64's own, the averages pool plastics and wear and are anchored by the displayed 3, and the reviewer text is anonymous with no arm speeds. If you want observed flight over the printed number, **fade 3.5 is the single candidate** (3.5 rather than 4 because the manufacturer layer says 3). It would need one named reviewer with a stated arm speed to move from "candidate" to "proposal." This is the same shape of evidence as the Roc fade 3 → 2.5 case, which the pilot left as "too thin" and which was later applied as a consensus override.
- **plasticVariance:** Opto is the only plastic on L64's collection page (assumed reference, most-thrown); Gold Line (grippier) and Opto-X ("extra overstable," stiffer, per Skyline's description) also exist. Spread not quantified. Do not average.
- **Linked check:** No Atlas mold shares a numeric anchor with the Trident. I found no cluster effect, but neighbouring speed-6 fairway drivers were not individually re-checked.

## MD3 (new) — Discmania (id 37de0f920924)

- **Atlas now:** 5/5/0/1 (verified override, Discmania collection page, checked 2026-09-23). **Proposed turn/fade:** none. Evidence too thin to call. Open candidate: fade 1 → 1.5 (|Δ| = 0.5) or → 2 (|Δ| = 1.0, review-gated).
- **Manufacturer:** Discmania 5/5/0/1, "stable" (collection page fetched). Copy: "For a decade this workhorse mid-range remains an icon in the Discmania lineup"; Kyle Klein: "Amazing for headwind straight shots and turnover flexes." **History:** Discmania published 5/5/0/2 until October 2021 and then issued "New Flight Numbers (As of 10/2021)" of 5/5/0/1 (Discs Unlimited's product description). Infinite's page notes that earlier Innova-made runs were stamped 5/5/0/3 or 5/5/0/2 and "don't fly significantly different" from the newer Swedish-made ones. The Atlas already carries the revised number, so this is not catalog lag. The same Discs Unlimited page still carries an older Simon Lizotte quote: "the MD3 is more overstable… great for headwind shots… reliable fade."
- **Retailer:** Infinite "Stable"; reviewer numbers 5/5/-0.1/2 (95 ratings, 4.55 stars); the C-Line page reads 5/5/-0.2/1.9 (49 ratings) with text "straight to slightly overstable," "more stable than what the numbers suggest." DiscMetrics: 422 reviews, listed 5/5/0/1, summary text "stays honest and finishes without much drama" (aggregator; no separate community number). Marshall Street not re-read (the Atlas number is from the override).
- **Community:** Search-summary reviewer (not read): the C-Line MD3 is "not overstable, but definitely not a 0/1, closer to a 0/2." Quincy C. (Lucky Disc Golf, arm speed not stated): "handles wind and torque," no comparison against the numbers. Disc Golf Puttheads (templated): neutral, "gentle, dependable fade," torque-resistant at higher power. Infinite C-Line text: develops understability with use; "200+ feet" needed for predictable flight.
- sources:
  - {name: Discmania MD3 collection page (5/5/0/1), url: https://www.discmania.net/collections/md3, type: manufacturer, weight: 1.0}
  - {name: Discs Unlimited C-Line MD3 (notes the 10/2021 change from 0/2 to 0/1), url: https://discsunlimited.net/discmania-originals-c-line-md3, type: retailer, weight: 0.4}
  - {name: Infinite Discs MD3 (mfr 5/5/0/1; reviewers 5/5/-0.1/2), url: https://infinitediscs.com/discmania-md3, type: retailer, weight: 0.5}
  - {name: Infinite Discs C-Line MD3 (reviewers 5/5/-0.2/1.9), url: https://infinitediscs.com/discmania-md3/c-line, type: retailer, weight: 0.3}
  - {name: DiscMetrics MD3 (aggregator), url: https://discmetrics.com/discs/discmania/md3, type: retailer, weight: 0.2}
  - {name: Lucky Disc Golf Source C-Line MD3 (Quincy C.), url: https://luckydiscgolf.com/products/discmania-md3-c-line, type: community, weight: 0.2}
  - {name: Disc Golf Puttheads MD3 flight chart (templated), url: https://www.dgputtheads.com/flight-charts/md3, type: community, weight: 0.2}
- **confidence:** 0.5
- **consensusNote:** Discmania deliberately lowered the published fade from 2 to 1 in 2021, and the Atlas holds that current number. The reviewer averages (2.0 on 95 ratings, 1.9 on 49) and the search-summary "closer to 0/2" still read the old figure. That could be real flight (the disc simply flies like a 0/2) or anchoring on the 0/2 that Infinite displayed for years and on pre-2021 Innova-made stamps; the evidence cannot separate the two. The manufacturer's own revision outweighs pooled averages, so no proposal. If you want observed flight over the printed number, **fade 1.5 is the conservative candidate** (a full 2 would be review-gated and would reverse Discmania's own change). The verified override stays as is.
- **plasticVariance:** Sold in C-Line, S-Line, G-Line, P-Line and others (21 stock configurations at Infinite). Discmania's page carries one set of numbers. Reference plastic (assumed most-thrown): C-Line. No plastic spread documented. null.
- **Linked check:** No Atlas mold is anchored on the MD3's fade. Buzzz (5/4/-1/1, pilot-confirmed) reads at fade 1 in the same reviewer averages, so the MD3's 1.9–2.0 is not a general pooling bias for speed-5 mids.

## Magic — Gateway (id 3f5da9f35c0f)

- **Atlas now:** 2/3/-1/0. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Gateway 2/3/-1/0 (collection page fetched). Copy: "easy for beginners to control because of its great glide and small amount of low speed fade"; "turn over and will hold just about any line it is thrown on without hyzering out." **Mild copy-vs-number tension:** "a small amount of low speed fade" against a fade rating of 0; wording at the half-step level, not a contradiction.
- **Retailer:** Infinite "Understable"; reviewer numbers 2.2/3.5/-1/0 (63 ratings, 4.52 stars); the Super Stupid Soft page reads 2.2/3.5/-1/0 (10 reviews). Reviewer glide runs 0.5 above the published 3 (out of scope). Marshall Street 2/3/-1/0 (baseline).
- **Community:** Infinite SSS-page reviewers (single-source text): "very straight out of the box and will show more turn beat in," "little wrist, and it will go dead straight 40 feet," "seems to melt into the chains." Disc Golf Dojo / Puttheads (templated): understable, gentle late turn, minimal fade, suits slower arms. Search-summary retailer content: intermediates use it for anhyzers and hyzer-flips. No arm speeds beyond "low."
- sources:
  - {name: Gateway Magic collection page, url: https://gatewaydiscsports.com/collections/magic, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Magic (mfr 2/3/-1/0; reviewers 2.2/3.5/-1/0), url: https://infinitediscs.com/gateway-magic, type: retailer, weight: 0.5}
  - {name: Infinite Discs Super Stupid Soft Magic (reviewer text), url: https://infinitediscs.com/Gateway-Magic/Super-Stupid-Soft, type: retailer, weight: 0.3}
  - {name: Disc Golf Dojo Magic (templated), url: https://discgolfdojo.com/discs/gateway/putt-approach/magic/, type: community, weight: 0.2}
  - {name: Disc Golf Puttheads Magic flight chart (templated), url: https://www.dgputtheads.com/flight-charts/magic, type: community, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer, Infinite's averages (turn and fade both exact) and the reviewer text all describe a straight, easy-turning putter with no real fade. The community base is small and mostly beginner-oriented, so this is "no contradicting evidence found." Linked check: Gateway Wizard (2/3/0/2) and Discraft Magnet (2/3/-1/1) differ from the Magic in the expected direction; nothing moves.
- **plasticVariance:** Gateway sells a softness ladder (SS, SSS and SSSS softer; Eraser and Diamond firmer); softer plastics grip and flex more and beat in toward more turn. Spread not quantified. Reference plastic (assumed most-thrown): Super Stupid Soft. Do not average.

## Entropy — MVP (id 15a4d4cad878)

- **Atlas now:** 4/3/0/3. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** MVP 4/3/0/3, "Overstable" (page fetched). Copy: "a durable overstable workhorse in the 10.5mm Putter class," "flights with reserved glide and a dependable finishing fade," "the overstable workhorse putter… an approach disc or high-wind putter." Copy and numbers agree.
- **Retailer:** Infinite "Very Overstable"; reviewer numbers 3.9/2.9/0/3 (48 ratings, 4.56 stars); the Neutron page reads 3.9/2.9/0/3 (29 reviews). Exact on turn and fade. Marshall Street 4/3/0/3 (baseline).
- **Community:** Infinite Neutron-page reviewers (single-source text): "strongly overstable," "goes straight then fades decently hard," "fight out of anhyzer," holds hyzer lines without flipping, "drops like a sack of potatoes" with less glide than the Zone; a stronger arm throws it "full power flat out to about 250 feet" with consistent results. Search-summary retailer content: "one of the most overstable throwing putters… much like a Zone or Harp," built for short chip shots. Disc Golf Puttheads (templated): "a reliable dump at the end of the flight path."
- sources:
  - {name: MVP Entropy page, url: https://mvpdiscsports.com/discs/entropy/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Entropy (mfr 4/3/0/3; reviewers 3.9/2.9/0/3), url: https://infinitediscs.com/mvp-entropy, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Entropy (reviewers 3.9/2.9/0/3; reviewer text), url: https://infinitediscs.com/MVP-Entropy/Neutron, type: retailer, weight: 0.3}
  - {name: Disc Golf Puttheads Entropy flight chart (templated), url: https://www.dgputtheads.com/flight-charts/entropy, type: community, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, the Infinite averages (exact on turn and fade) and the reviewer text agree on a very overstable small putter with a firm fade. Nothing supports moving it. Linked check: the Zone (pilot, 4/3/0/3, confirmed) has identical numbers, and reviewers' "like a Zone" comparisons match; the only difference they describe is less glide on the Entropy (outside scope).
- **plasticVariance:** Neutron is the baseline (assumed most-thrown); Electron beats in to "straight 80% of the flight, then dumping the other 20%" (search snippet, one source); Plasma preferred in cold. Spread not quantified. Record as variance only.

## Surge — Discraft (id e5fc6efe1b88)

- **Atlas now:** 11/5/-1/3. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Discraft 11/5/-1/3, stability 1.7 (team.discraft.com fetched). Copy (team page, plus Infinite and a search summary of discraft.com): "the Surge will deliver maximum distance with extra glide while still remaining highly controllable" downwind or into a moderate headwind; "a fast flying disc with a moderate sized rim… high speed turn, incredible glide, and a healthy amount of low speed fade." Copy and numbers agree. The 1.7 stability is milder than the Force's 2.0.
- **Retailer:** Infinite "Overstable"; reviewer numbers 11/5/-1/2.8 (50 reviews, 4.48 stars); the ESP page reads 11/5/-1/2.9 (27 reviews). Exact on turn, within 0.2 on fade. Marshall Street 11/5/-1/3 (baseline). The "Overstable" label is looser than the -1 turn.
- **Community:** Infinite ESP-page reviewers (single-source text): flies "slightly understable" when new and "seasoned into a disc that can really do it all," "a little high speed turn and a gentle fade," "a nice hyzer flip distance driver," "doesn't take a huge throwing arm to get it humming." Search-summary reviews: "more understable and had a noticeable amount of turn, but it's not too much." Disc Golf Puttheads (templated): "slightly overstable but manageable" for beginners, "laser-straight flights with late fades" for advanced.
- sources:
  - {name: Discraft team page Surge (11/5/-1/3, stability 1.7), url: https://www.team.discraft.com/discs/surge, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Surge (mfr 11/5/-1/3; reviewers 11/5/-1/2.8), url: https://infinitediscs.com/discraft-surge, type: retailer, weight: 0.5}
  - {name: Infinite Discs ESP Surge (reviewers 11/5/-1/2.9; reviewer text), url: https://infinitediscs.com/Discraft-Surge/ESP, type: retailer, weight: 0.3}
  - {name: Disc Golf Puttheads Surge flight chart (templated), url: https://www.dgputtheads.com/flight-charts/surge, type: community, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and both reviewer averages agree on -1/3, and the reviewer text describes the same shape: a little turn when new, a healthy fade, easy to get going. Nothing supports moving it. The "Overstable" label versus "slightly understable when new" is wording on identical numbers. Linked check: Force (12/5/0/3, below) sits one turn step more stable, as Discraft's own stability values (Force 2.0, Surge 1.7) say; Nuke (13/5/-1/3, batch 2 linked check) is unchanged.
- **plasticVariance:** Sold in ESP, Z, Big Z, Titanium, Pro-D and others; reviewers prefer ESP for grip and say it seasons from slightly understable when new. No quantified spread by plastic. Reference plastic (assumed most-thrown): ESP. Do not average.

## Jade — Latitude 64 (id 701fe620975e)

- **Atlas now:** 9/6/-2/1. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Latitude 64 9/6/-2/1, "Stable" (collection page fetched). Copy: "a very nice, reliable, and moderately stable disc" that "can be turned over with effort" and "naturally fades back at the end of flight"; Infinite quotes L64: "newest addition to the 'Easy to Use' line… beginner friendly driver… excellent step up from the popular Diamond." **Wording tension:** "Stable" and "moderately stable" against a -2 turn and an "Easy to Use" line. The numbers and descriptions are consistent on the shape.
- **Retailer:** Infinite "Stable"; reviewer numbers 9/5.4/-2/1.3 (37 reviews, 4.88 stars); the Gold Line page reads 9.1/5.7/-1.9/1.2 (9 reviews). Turn within 0.1, fade within 0.3. **Glide reads 0.3–0.6 below the published 6** (outside the turn/fade scope; noted, not proposed). Marshall Street 9/6/-2/1 (baseline).
- **Community:** Infinite Gold Line reviewers (single-source text): "dead straight" and "gentle," works for "hyzer flip straight shots" or "slow turnover shots," "didn't hold up well in the wind," "a little fade at the end"; one says their "arm speed is currently suited for 8-9 speed discs." Disc Golf Puttheads (templated): built for slower arms, "doesn't require maximum power." No named independent reviewer read (All Things Disc Golf returned 500).
- sources:
  - {name: Latitude 64 Jade collection page, url: https://latitude64.com/collections/jade, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Jade (mfr 9/6/-2/1; reviewers 9/5.4/-2/1.3), url: https://infinitediscs.com/latitude-64-jade, type: retailer, weight: 0.5}
  - {name: Infinite Discs Gold Line Jade (reviewers 9.1/5.7/-1.9/1.2; reviewer text), url: https://infinitediscs.com/latitude-64-jade/gold-line, type: retailer, weight: 0.3}
  - {name: Disc Golf Puttheads Jade flight chart (templated), url: https://www.dgputtheads.com/flight-charts/jade, type: community, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and the reviewer averages agree on -2/1 to within 0.3. The reviewers are lower-arm-speed throwers, which is the Jade's intended audience, so the "dead straight" reports are consistent with a -2 turn that needs power to express. The community base is small and arm-speed-skewed, so this is "no contradicting evidence found." Linked check: Diamond (8/6/-3/1) and Sapphire (10/6/-2/1.5) bracket it numerically, and Latitude 64 calls the Jade a step up from the Diamond; nothing moves.
- **plasticVariance:** Opto, Gold Line, Opto Air, Recycled, DyeMax and others; the Jade's max weight is 159 g, so light weights are part of the design. Gold Line is the grippier premium blend. Reference plastic (assumed most-thrown): Gold Line or Opto (both carry the same published numbers). No spread quantified. null.

## Force — Discraft (id 0fcd1f2937b1)

- **Atlas now:** 12/5/0/3. **Proposed turn/fade:** none. Matches.
- **Manufacturer:** Discraft 12/5/0/3, stability 2.0 (team.discraft.com and the Z Line Force page fetched). Copy: "Discraft's fastest overstable driver, with a wide rim and jaw-dropping glide… intended for experienced players who throw with power." Team Discraft (Courtney Pixie Cannon): "The ESP Force is an amazing stable driver that will withstand even the strongest headwinds." Copy and numbers agree.
- **Retailer:** Infinite "Very Overstable"; reviewer numbers 12/4.9/0/3.1 (128 ratings, 4.49 stars); the Z Line page reads 12/4.9/0/3.1 (46 reviews). Exact match. Marshall Street 12/5/0/3 (baseline).
- **Community:** Infinite Z Line reviewers (single-source text): "extremely overstable," "won't even think about turning over" with normal mechanics, "a predictable fade after a super straight flight path when given enough speed," "requires fast arm speed," with a "400+ feet" consensus and 300–350 ft intermediates seeing "modest results." Disc Golf Puttheads (templated): "extremely overstable" for beginners; power throwers can push it "on flat or slight anhyzer without fear"; best for headwinds, spike hyzers and skip shots. Search-summary: "a touch of high-speed turn with a strong forward-fading finish."
- sources:
  - {name: Discraft team page Force (12/5/0/3, stability 2), url: https://www.team.discraft.com/discs/force, type: manufacturer, weight: 1.0}
  - {name: Discraft Z Line Force page (12/5/0/3, stability 2.0), url: https://www.discraft.com/z-line-force-zforce, type: manufacturer, weight: 0.8}
  - {name: Infinite Discs Force (mfr 12/5/0/3; reviewers 12/4.9/0/3.1), url: https://infinitediscs.com/discraft-force, type: retailer, weight: 0.5}
  - {name: Infinite Discs Z Line Force (reviewers 12/4.9/0/3.1; reviewer text), url: https://infinitediscs.com/Discraft-Force/elite-z, type: retailer, weight: 0.3}
  - {name: Disc Golf Puttheads Force flight chart (templated), url: https://www.dgputtheads.com/flight-charts/force, type: community, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, the Infinite averages (exact on turn, fade within 0.1) and the reviewer text all agree on a very overstable power driver that needs a fast arm to show its glide. The only tension is wording ("stable" in the Team Discraft ESP quote versus "very overstable" at retailers), which is plastic and arm-speed dependent. Nothing supports moving it. Linked check: Surge (11/5/-1/3) and Nuke (13/5/-1/3) sit one turn step flatter, which Discraft's own stability values (Force 2.0, Surge 1.7) support.
- **plasticVariance:** Real spread per retailer summaries: Z Line most overstable, Big Z a little less stable than Z, ESP "stable" with extra glide, Pro-D lacks Z's high-speed stability. Discraft prints the same numbers for all. Reference plastic (assumed most-thrown): ESP, with Z Line a close second. Do not average.

---

## Batch 5 report (for Freddy)

**Proposed changes (0).** Nothing meets the bar.

**Decided items recorded:** the plastic baseline policy (reference = most-thrown plastic; DX is a price tier, not a flight reference), and the Tern (-3) and Boss (-1) resolutions, both confirmed as-is with the Champion variance noted. Caveat: I had no sales data, so "most-thrown plastic" per disc is my assumption and is labelled as such.

**Open candidates, none proposed (3):**
- **Trident fade 3 → 3.5** (not gated). Strongest of the three: Infinite averages of 3.9 (50 reviews) and 3.8 (Opto, 17), L64's own "monster hooking fade" copy, and every reviewer comment point the same way; nothing contradicts. Held back because the printed number is Latitude 64's own and the support is anonymous pooled reviews with no arm speeds.
- **D2 turn 0 → -0.5** (not gated). Prodigy's own product pages print 12/5/0/3; Infinite, Foundation, DiscMetrics and Skyline list 12/6/-0.5/3. I couldn't read Prodigy's collection page to see which is current. Glide 5 vs 6 is the same split, outside the turn/fade scope.
- **MD3 fade 1 → 1.5** (2 would be gated). Discmania lowered the fade from 2 to 1 in 10/2021 and the Atlas holds the new number, but reviewer averages still read about 2. Could be real flight or anchoring on the old number; the verified override stays.

**Confirmed as-is (7):** Wombat3, Entropy, Force (0.7); Magic, Surge, Jade (0.65); EMAC Judge (0.6). Confirmations mean "no contradicting evidence found," not independent community verification.

**Judge / EMAC Judge pair:** both stay 2/4/0/1. Dynamic's copy says the EMAC has "a bit less fade," Infinite's copy says "very similar flight path," and the one readable independent reviewer (Broden) says the EMAC has "just a touch more fade." No consistent direction, so no ordering is supported. Pair table is in the EMAC Judge entry.

**Too thin to call (3):** Trident, D2, MD3 (above).

**Process notes for the next batch**

- Next ten by `featured.js` order after Force: Gator, Fireball, JLS, Sabre, Tesla, Gorgon, Sapphire, Falk, Wave, F7.
- No Luna-style stale number found this time (eight of ten match manufacturer pages; MD3's mismatch is a deliberate 2021 manufacturer revision the Atlas already reflects). D2 is the only mold where two manufacturer-attributed sources disagree.
- Reachable manufacturer paths this batch: `prodigydisc.com/products/prodigy-<mold>-<plastic>-plastic` (400/500) works while the collection page 404s; `www.team.discraft.com/discs/<mold>` works for Discraft (the plain discraft.com guesses 404'd); `gatewaydiscsports.com/collections/magic`; `mvpdiscsports.com/discs/<mold>/`; `latitude64.com/collections/<mold>`; Inside the Circle `/post/dynamic-discs-emac-judge`. All Things Disc Golf was down (500/timeouts).
- Infinite plastic-specific pages (`/<brand>-<mold>/<plastic>`) again gave the best per-plastic view; they exposed the Trident and MD3 fade gaps and the Wombat3, Jade and Force plastic notes.
- Linked sets re-checked this batch with nothing to propose: Judge/EMAC Judge/Warden, D1/D2/D3, Entropy/Zone, Force/Surge/Nuke, Jade/Diamond/Sapphire, Wombat3/Fuse, Magic/Wizard/Magnet, MD3/Buzzz. Closed by decision: Boss/Wraith/Destroyer/Firebird (Boss stays) and Tern/Shryke/Daedalus (Tern stays). Unchanged from before: Crank/Nuke/Crank SS, Luna/Kratos, Reko/Berg.
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access spot-checks Trident first (fade, stated arm speeds, Opto vs Gold), then D2 (Prodigy's current catalog number) and MD3 (post-2021 stamps).

---

# Batch 6 (Plan 10, Phase 2)

Researched October 2, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (already up to date).

Molds covered: Gator, Fireball, JLS, Sabre, Tesla, Gorgon, Sapphire, Falk, Wave, F7 (the next ten by `public/featured.js` order after Force).

## Batch 6 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Gator | 5/2/0/3 | **fade 3 → 4** (Innova's current published number) | **Proposed change, review-gated (\|Δ\| = 1.0). Stale-catalog correction, Luna-style** | 0.7 |
| Fireball | 9/3.5/0/3.5 | none | Confirmed as-is | 0.7 |
| Gorgon | 10/6/-2/1 | none | Confirmed as-is | 0.65 |
| Sapphire | 10/6/-2/1.5 | none | Confirmed as-is | 0.65 |
| Falk | 9/6/-2/1 | none | Confirmed as-is (soft watch: reviewer text a little more understable) | 0.65 |
| Wave | 11/5/-2/2 | none | Confirmed as-is | 0.65 |
| F7 | 8/6/-3/1 | none | Confirmed as-is | 0.65 |
| JLS | 7/5/-1/1 | none | Confirmed as-is (thin, nothing contradicts) | 0.6 |
| Sabre | 7/5/-1/1 | none | Confirmed as-is (thin, nothing contradicts) | 0.6 |
| Tesla | 9/5/-1/2 | none | **Too thin to call: turn -1 vs about -0.6 to -0.7 in Infinite averages and text saying "more overstable than the numbers" (turn -1 → -0.5, not gated)** | 0.5 |

**One proposed change (Gator, gated), one open candidate (Tesla turn), eight confirmed.** The Gator case is the same kind as the Luna: the manufacturer's own page moved, the Atlas still carries the Marshall Street snapshot number, and Infinite's listing and several retailers have not caught up either.

## Evidence limits — batch 6

Same tooling limits as earlier batches; see the pilot section. Specific to this batch:

- **Diff against `flights.json` / `data.json` (done first):** the Atlas numbers equal Marshall Street's snapshot for all ten. None of the ten is in `verified-model-overrides.json` or `infinite-manufacturer-ratings.json`. Compared with current manufacturer pages: **nine match exactly** (Fireball, JLS, Sabre, Tesla, Gorgon, Sapphire, Falk, Wave, F7). **Gator does not:** Innova's page prints 5/2/0/4, Atlas has 5/2/0/3. JLS is the weakest manufacturer layer: Millennium's own site was not read; the numbers come from Millennium's shop (shop.golfdisc.com) and retailers, all 7/5/-1/1.
- **Gator sources split on the fade.** Innova's page (fetched twice, same result), Titan, Foundation Discs and Disc Golf Dojo say fade 4. Marshall Street, Infinite's own listing, Infinite's Gator3 page, DiscMetrics, Disc Golf Puttheads and an older GreenSplatter review say 3. I found no Innova announcement of the change and no date for it.
- **Reddit** blocked, **YouTube** unreachable, **DGCR** 403 (seen only as search-result titles, none cited as real evidence). All Things Disc Golf timed out on the Tesla review.
- **Community layer is thin.** The only named reviews I could read in full were GreenSplatter (Gator, older), flicdisc (Sabre, Test Fly series, older), Bestdiscgolfdiscs (Falk, generic), plus Innova's own Gorgon first-look and a retailer flight-review blog. The rest is Infinite plastic-page reviewer text (anonymous or first-name only, single-source, summarized). Arm speeds come as distances: Tesla 300–450+ ft, Wave 300–475 ft, Falk 300–350 ft consistent and 200–300 ft "significant turn," Sapphire 280–350 ft, Gorgon 300–425 ft, Sabre 300–350 ft, F7 275–375 ft. No source gave a measured arm speed. Confirmations read as "no contradicting evidence found."
- **DiscMetrics pages are templated** (the same "sits right in the middle of the lane and does not get weird on you" sentence appears on Tesla, Wave, Sabre, Sapphire and JLS), so I treated them as aggregators with no independent flight evidence. Its Tesla page lists turn -1.5 with no source, and its F7 page still lists the pre-2023 speed 7; neither is used.
- **Infinite reviewer averages pool plastics and wear** and are anchored by the numbers Infinite displays. Used as coarse retailer-type evidence at capped weight; never alone for a proposal.
- **Marshall Street is the Atlas's own source** and was used only as baseline.
- **Reachable manufacturer paths this batch:** `innovadiscs.com/disc/<mold>/` (Gator, Gorgon, Caiman; Gator3 404'd), `axiomdiscs.com/discs/fireball/`, `mvpdiscsports.com/discs/<mold>/`, `latitude64.com/collections/sapphire`, `gatewaydiscsports.com/collections/sabre`, `prodigydisc.com/products/prodigy-f7-400-plastic`, `www.kastaplast.com/en-us/products/k1-falk` (the older `kastaplast.com/discs/falk` guess 404'd). Infinite plastic pages need the exact slug (`/Axiom-Fireball/Neutron---Axiom`, `/gateway-sabre/evolution-diamond`); the plain guesses 302'd.
- Page contents came through a summarizing fetch step; spot-check any quote before it goes into an override's source note. **Spot-check the Gator fade 4 on innovadiscs.com before applying it.**

---

## Gator — Innova (id 2dea5f27c914)

- **Atlas now:** 5/2/0/3 (source: Marshall Street snapshot). **Proposed turn/fade:** turn unchanged (0), **fade 3 → 4**. |Δ| = 1.0, so this goes to the review gate regardless of confidence. Reference plastic (assumed most-thrown, per the Innova policy): Star.
- **Manufacturer:** Innova's current Gator page (fetched twice) prints **5/2/0/4**, "Overstable." Copy: "a very reliable overstable Mid-Range disc with a predictable finish … pin-point accuracy for shorter drives and approach shots, even in windy conditions"; best for spike hyzers and headwind approaches; Sarah Cunningham pro quote: "Best over stable Mid-Range disc." Copy and the new number agree. **Contradiction with the Atlas:** the Atlas, Marshall Street (all six Gator listings), and Infinite's "manufacturer numbers" still read 5/2/0/3. Retailers that have updated list fade 4 (Titan titles its Star and Metal Flake Gator pages "5/2/0/4"; Foundation Discs; Disc Golf Dojo). Innova's own Caiman page (5.5/2/0/4, "inspired by the design of the Gator") shows 4 for the sister mold.
- **Retailer:** Infinite "Very Overstable"; reviewer numbers 5/2.1/0/3.2 (91 reviews, 4.53 stars); Star page 5/2.1/0/3.1 (18 reviews, 4.3 stars). Reviewer fade sits between 3 and 4 and cannot separate them: it is pooled and anchored on the 3 Infinite displays. Marshall Street "Overstable" (baseline, not independent).
- **Community:** Infinite Star-page reviewers (single-source text): "doesn't know what turn is. It only knows fade" (professional), "will always fade hard at the end" (advanced), "least glide of any disc I've thrown," best at spike hyzers and forehand approaches "250 feet and under," "not recommended for beginners due to aggressive fade." GreenSplatter (older review, fade-3 era): "workably overstable … nothing comical," expects "a momentarily straight flight with a sudden hook and dump," 250 ft reference. Disc Golf Dojo (retailer text): at 400+ ft arms it goes "right at high speed" with significant fade as it slows. Innova's Caiman copy describes the Caiman as "an overstable midrange that flies similar to the Gator" per Infinite's page text, without the large bead.
- sources:
  - {name: Innova Gator page (5/2/0/4, fetched twice), url: https://www.innovadiscs.com/disc/gator/, type: manufacturer, weight: 1.0}
  - {name: Innova Caiman page (5.5/2/0/4; derived from the Gator design), url: https://www.innovadiscs.com/disc/caiman/, type: manufacturer, weight: 0.3}
  - {name: Titan Disc Golf Star Gator (5/2/0/4), url: https://titandiscgolf.com/products/innova-star-gator-5-2-0-4, type: retailer, weight: 0.3}
  - {name: Foundation Discs Gator (5/2/0/4), url: https://foundationdiscs.com/products/gator, type: retailer, weight: 0.2}
  - {name: Disc Golf Dojo Gator (5/2/0/4), url: https://discgolfdojo.com/discs/innova/mid-range-drivers/innova-gator/, type: retailer, weight: 0.2}
  - {name: Infinite Discs Gator (listing 5/2/0/3; reviewers 5/2.1/0/3.2), url: https://infinitediscs.com/innova-gator, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star Gator (reviewers 5/2.1/0/3.1; reviewer text), url: https://infinitediscs.com/Innova-Gator/Star, type: retailer, weight: 0.3}
  - {name: Marshall Street Gator listings (all 5/2/0/3; not independent), url: https://www.marshallstreetdiscgolf.com/?s=gator&post_type=product, type: retailer, weight: 0.2}
  - {name: GreenSplatter Gator review (older, fade-3 era), url: https://www.greensplatter.com/review-innova-gator/, type: community, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** The manufacturer's own page now says fade 4, and that is the only layer that can tell 3 from 4: every other source either still shows 3 or is anchored on it. What the evidence does say: reviewers describe a hard, early, reliable fade ("only knows fade," "hook and dump"), which fits 3 or 4 equally; nothing says it fades *less* than 3. No Innova announcement or date was found, so I cannot say whether this is a re-rate or a website number the Atlas snapshot missed. Under the Luna precedent (stale catalog, primary-source number), the proposal is fade 3 → 4. If you would rather hold for a second primary source, the Innova stamp on a current Star Gator is the one to check. **Linked check:** Gator3 (Atlas 5/2/0/3) still reads 3 at Infinite and Marshall Street, and its Innova page was unreachable (404), so it does not move on this evidence. Caiman (5.5/2/0/4, which Innova and Infinite say flies like the Gator without the bead) fits a fade-4 Gator better than the current 3. Rhyno (Atlas 2/1/0/3) is a different class (approach) and was not re-opened.
- **plasticVariance:** Sold in DX, Pro, KC Pro, Star, GStar, Champion, Metal Flake, Luster. Reviewers: flat-topped copies fly truer, domed tops differ; DX is the grippy economy option. Marshall Street prints the same numbers for DX, Star and Metal Flake. No quantified spread. Do not average.

## Fireball — Axiom (id b6799ecaf9b5)

- **Atlas now:** 9/3.5/0/3.5. **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Neutron.
- **Manufacturer:** Axiom 9/3.5/0/3.5, "Overstable." Copy: "wind and power resistance" with "a delayed and focused fade"; "overstable and wind-resistant like the MVP Motion but has an overall straighter and longer flight profile"; "a longer forward push during its early stage of fade" and "will drop later and more abruptly than the Motion"; for "long pan-outs, straight power shots, and sweeping hyzers." Copy and numbers agree.
- **Retailer:** Infinite "Very Overstable"; reviewer numbers 9.6/3.2/-0.1/3.7 (44 reviews, 4.45 stars); Neutron page 9.6/3.2/-0.1/3.7 (33 reviews). Exact on turn, fade within 0.2; speed reads 0.6 higher and glide 0.3 lower (outside scope). Infinite copy places it "between the MVP Motion and Tesla." DiscMetrics: "Very Overstable," "meat-hook," not for low-power throws.
- **Community:** Infinite Neutron-page reviewers (single-source text): "so overstable … it always fought out and finished with a hard fade" (advanced), "extremely reliable disc that does exactly what its flight numbers say," "will always fade out hard at the end," "almost no glide and a very quick fade" (225 ft thrower), "flies straight for a long way and then sort of runs out of steam" (about 400 ft forehand), one outlier "not as overstable as people made me think." Compared to Firebird, Zone OS, Flick and Raptor; "flatter" than a Firebird. Retailer summaries (search snippet): "somewhere between a Firebird and a Captain's Raptor in stability."
- sources:
  - {name: Axiom Fireball page, url: https://axiomdiscs.com/discs/fireball/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Fireball (mfr 9/3.5/0/3.5; reviewers 9.6/3.2/-0.1/3.7), url: https://infinitediscs.com/axiom-fireball, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Fireball (reviewer text), url: https://infinitediscs.com/Axiom-Fireball/Neutron---Axiom, type: retailer, weight: 0.3}
  - {name: DiscMetrics Fireball (aggregator), url: https://discmetrics.com/discs/axiom/fireball, type: retailer, weight: 0.2}
  - {name: DGCR "Fireball vs. Motion" thread (search title, not read), url: https://www.dgcoursereview.com/threads/fireball-vs-motion.126376/, type: community, weight: 0.1}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and the reviewer averages (turn exact, fade within 0.2) agree on a very overstable utility driver with a late, hard fade; reviewer text matches. The lone "not as overstable as I was told" comment is outweighed. Linked check: Atlas Motion (9/3.5/0/4), Fireball (9/3.5/0/3.5) and Tesla (9/5/-1/2) keep the ordering Axiom and Infinite both describe; Firebird (9/3/0/4) sits at a similar stability, which reviewers' comparisons support. Nothing moves. Motion's current manufacturer number was not re-read this batch.
- **plasticVariance:** Neutron, Plasma, Proton, Fission and Eclipse. Reviewer comparisons are mostly Neutron; no spread quantified. Do not average.

## JLS — Millennium (id 0959b213f7bb)

- **Atlas now:** 7/5/-1/1. **Proposed turn/fade:** none. Matches; evidence thin. Reference plastic (assumed, not verified): Sirius or Standard.
- **Manufacturer:** Millennium's shop page for the Sirius JLS (fetched; I did not reach millenniumgolfdiscs.com directly) lists 7/5/-1/1, "straight-stable distance driver," "very dependable and versatile," "sits between two other models in the stability spectrum," "a Do-It-All-Driver." **Contradiction in the retail layer:** Marshall Street labels it "Understable" and says "more turn and more fade than the Orion LS"; Infinite and the Millennium shop say "Stable"/"straight-stable." Same numbers, different labels.
- **Retailer:** Infinite "Stable"; reviewer numbers 7.4/5/-1.3/1.4 (36 reviews, 4.69 stars); the Sirius page reads 7.2/4.8/-1.1/1.3 (6 ratings). Turn within 0.3, fade 0.3–0.4 above the published 1. Marshall Street 7/5/-1/1 (baseline).
- **Community:** Infinite Sirius-page reviewers (single-source text, six ratings): "flies more like a longer-range Shark, with a 0 turn and 2 fade" (needs 8+ arm speed), "turns under power when thrown flat," "will hold a line all the way," "a great straight flying disc with a touch of fade," one at 350 ft; "goes exactly the same distance as the Leopard." The first two comments point opposite ways (stable at high power vs turning under power), which is an arm-speed and plastic split, not a mold-level reading.
- sources:
  - {name: Millennium shop Sirius JLS (7/5/-1/1, copy), url: https://shop.golfdisc.com/millennium-sirius-jls, type: manufacturer, weight: 0.7}
  - {name: Infinite Discs JLS (mfr 7/5/-1/1; reviewers 7.4/5/-1.3/1.4), url: https://infinitediscs.com/millennium-jls, type: retailer, weight: 0.5}
  - {name: Infinite Discs Sirius JLS (reviewers 7.2/4.8/-1.1/1.3; reviewer text), url: https://infinitediscs.com/Millennium-JLS/Sirius, type: retailer, weight: 0.3}
  - {name: Marshall Street JLS (7/5/-1/1, "Understable"; not independent), url: https://www.marshallstreetdiscgolf.com/product/jls, type: retailer, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** Numbers agree across every layer (manufacturer shop, Infinite, Marshall Street, reviewer averages within 0.4). The only tension is the label, and it is wording on identical numbers. Reviewer fade runs 0.3–0.4 over the published 1 on a small, pooled sample; that is below anything I would record as a candidate. Linked check: Sabre (Gateway) and Hawkeye (Innova) carry the identical 7/5/-1/1 in the Atlas; nothing in this batch separates the three, so no change.
- **plasticVariance:** Standard, Quantum, Sirius (Durable, Midgrade, Premium grades). No spread found. null.

## Sabre — Gateway (id ccf10e3e8710)

- **Atlas now:** 7/5/-1/1. **Proposed turn/fade:** none. Matches; evidence thin. Reference plastic (assumed, not verified): Diamond or Sure Grip.
- **Manufacturer:** Gateway 7/5/-1/1, "Stable" (collection page fetched). Copy: "Gateway's most predictable straight-flying disc," "maintaining stability at high velocities while minimizing excessive turn or drop during landing," "a fast disc with great accuracy and a predictable finish late in its flight." Infinite quotes Gateway: "a mild degree of high speed turn followed by a minimal end-of-flight fade." Copy and numbers agree.
- **Retailer:** Infinite "Stable"; reviewer numbers 7.2/5/-1.1/1 (17 ratings, 4.24 stars); the Diamond page reads 7.1/5/-1.1/1 (4 reviews). Exact on fade, 0.1 on turn. Marshall Street 7/5/-1/1 (baseline).
- **Community:** Infinite Diamond-page reviewers (four, single-source text): Delta V (advanced, 350 ft) "wicked flippy," "way less stable" than comparable discs, "a TON of hyzer to track straight"; Theo Hyatt (beginner, 300 ft) "loves to flip up and even turn slightly before finishing with great glide"; Walter Parker (intermediate) "so straight"; Pierce Guderski (advanced) "glides, and glides, and glides just straight." flicdisc (older Test Fly series review, listed 8/5/-1/1, one of the longest local throwers): "At lower speeds, it flies straight with minimal finish; at higher arm speeds or into wind, it tends to turn over and finish slightly anhyzer." The arm-speed pattern is consistent: more turn as power rises.
- sources:
  - {name: Gateway Sabre collection page (7/5/-1/1), url: https://gatewaydiscsports.com/collections/sabre, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Sabre (mfr 7/5/-1/1; reviewers 7.2/5/-1.1/1), url: https://infinitediscs.com/gateway-sabre, type: retailer, weight: 0.5}
  - {name: Infinite Discs Diamond Sabre (reviewers 7.1/5/-1.1/1; four reviews), url: https://infinitediscs.com/gateway-sabre/evolution-diamond, type: retailer, weight: 0.3}
  - {name: flicdisc Test Fly Sabre review (older), url: http://flicdisc.blogspot.com/2015/03/review-gateway-test-fly-series-sabre.html, type: community, weight: 0.2}
  - {name: DiscMetrics Sabre (aggregator, one review), url: https://discmetrics.com/discs/gateway/sabre, type: retailer, weight: 0.1}
- **confidence:** 0.6
- **consensusNote:** Manufacturer, both reviewer averages and the readable reviews agree on a straight-to-gently-turning fairway driver with a minimal finish; the high-power reports of turnover are what -1 predicts. Samples are tiny (17 and 4 ratings), so this reads "no contradicting evidence found." Linked: JLS and Hawkeye (same numbers); no evidence to separate them.
- **plasticVariance:** Diamond, Evolution, Platinum, Sure Grip, Lightweight; Gateway's S-series is rigid and seasons into more turn (flicdisc). Spread not quantified. Do not average.

## Tesla — MVP (id 2aee40bd3993)

- **Atlas now:** 9/5/-1/2. **Proposed turn/fade:** none. Evidence too thin to call. **Open candidate: turn -1 → -0.5** (|Δ| = 0.5, below the review gate). Reference plastic (assumed most-thrown): Neutron.
- **Manufacturer:** MVP 9/5/-1/2, "Stable-Overstable" (page fetched). Copy: "balances a subtle turn and reliable fade, while a pronounced glide and forward finish gain extra distance"; excels at extending long throws "in headwind conditions"; the companion to the Volt. Infinite quotes MVP: "plenty of bite to fade back reliably and reduce lateral drift." The "Stable-Overstable" label leans a notch more stable than a -1 turn alone says; copy and numbers otherwise agree.
- **Retailer:** Infinite "Stable"; reviewer numbers 9.7/4.7/-0.6/2.3 (95 ratings, 4.56 stars); Neutron page 9.7/4.7/-0.7/2.2 (39 ratings). Turn reads 0.3–0.4 more stable than published, fade 0.2–0.3 higher, glide 0.3 lower. Marshall Street 9/5/-1/2 (baseline). DiscMetrics lists turn -1.5 with no source (templated text, not used).
- **Community:** Infinite Neutron-page reviewers (single-source text): "considerably more overstable than the flight numbers suggest" (experienced), "a touch more overstable than what you might think," "strong penetrating fade," "lower glide" than competitors, "subtle turn in the beginning of the flight"; compared to Thunderbird, Wraith, Firebird and Star Wraith ("flies similar to a Innova Firebird"); distances 300–450+ ft, intermediates 300–350 ft. Search-summary retailer content: Neutron is "accurate to flight numbers," Plasma "generally the most overstable Tesla … more overstable than the flight numbers would suggest," and it "might be a little more stable when brand new, but once it's beaten in you should start to see the nice turn."
- sources:
  - {name: MVP Tesla page (9/5/-1/2, Stable-Overstable), url: https://mvpdiscsports.com/discs/tesla/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Tesla (mfr 9/5/-1/2; reviewers 9.7/4.7/-0.6/2.3), url: https://infinitediscs.com/mvp-tesla, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Tesla (reviewers 9.7/4.7/-0.7/2.2; reviewer text), url: https://infinitediscs.com/MVP-Tesla/Neutron, type: retailer, weight: 0.3}
  - {name: DiscMetrics Tesla (templated; lists -1.5, unsourced), url: https://discmetrics.com/discs/mvp/tesla, type: retailer, weight: 0.1}
  - {name: All Things Disc Golf Tesla review (timed out, not read), url: https://allthingsdiscgolf.com/mvp-disc-sports-tesla-review/, type: community, weight: 0.1}
  - {name: DGCR MVP Tesla thread (search title, not read), url: https://www.dgcoursereview.com/threads/mvp-tesla.112128/page-50, type: community, weight: 0.1}
- **confidence:** 0.5
- **consensusNote:** The reviewer average and the text point the same way: a Tesla that fades a bit harder and turns a bit less than -1/2 says, with a "Firebird-like" comparison from a few reviewers. Held back because the manufacturer layer says -1 and calls it "Stable-Overstable," the averages pool plastics (the Plasma Tesla is the one retailers call overstable; Neutron is called accurate to the numbers) and are anchored by the displayed -1, and the text is anonymous with no stated arm speeds beyond distance bands. If you want observed flight over the printed number, **turn -0.5 is the single candidate** (fade 2.2–2.3 is too close to 2 to name). It needs a named reviewer with an arm speed, or a Neutron-only reading, to become a proposal. **Linked check, review as a set if it moves:** Volt (Atlas 8/5/-0.5/2, which MVP calls the Tesla's fairway companion) would then share Tesla's turn; Fireball (9/3.5/0/3.5) and Motion (9/3.5/0/4) bracket it on the overstable side; Inertia (9/5/-2/2) on the understable side.
- **plasticVariance:** Real spread per retailer summaries: Plasma most overstable, Neutron closest to the numbers, Fission and Proton not described. A new disc may fly more stable and beat in to turn. Do not average.

## Gorgon — Innova (id 841c59058358)

- **Atlas now:** 10/6/-2/1. **Proposed turn/fade:** none. Matches. Reference plastic: Star (Innova prints 10/6/-2/1 for Star and Pro).
- **Manufacturer:** Innova 10/6/-2/1 (page fetched, June 2024 release). Copy: "merges the feel, precision, and ease of a fairway driver with the reach of a distance driver. Its flight exhibits arrow-straight glide with a steadfast fade." Innova's first-look blog: Star and Pro 10/6/-2/1, **GStar 10/6/-3/1**; Star "slightly more stable than the GStar version … can handle a bit more speed," GStar "designed for players with slower arm speeds." **Mild copy-vs-number tension:** "arrow-straight" and "steadfast fade" against a -2 turn; the first-look page describes it holding anhyzer turn "for most of its flight" and flipping up to ride flat. Copy and numbers fit if "straight" means a controlled line, not a flat finish.
- **Retailer:** Infinite "Understable"; reviewer numbers 10/6/-2.3/1 (20 reviews, 4.48 stars); Star page 9.9/5.9/-2/1.1 (7 reviews). Turn within 0.3, fade exact. Marshall Street 10/6/-2/1 (baseline). DiscMetrics: "Understable," 145 reviews listed (aggregator, templated).
- **Community:** Infinite Star-page reviewers (single-source text; 300–425 ft, mostly intermediate): "very gentle fade," "a nice slow long turn," "glides more than any disc I've ever thrown," "nice gradual turnover lines with very, very mild finish," "like an IT combined with Beast," "kind of like a faster river"; one says it "seems slow" and flies "like a midrange." Retailer summaries (search snippet): "very much worth a look for newer players or those with slow arm speed," "easy distance."
- sources:
  - {name: Innova Gorgon page (10/6/-2/1), url: https://www.innovadiscs.com/disc/gorgon/, type: manufacturer, weight: 1.0}
  - {name: Innova Gorgon first look (Star/Pro -2, GStar -3), url: https://www.innovadiscs.com/innova-news/innova-gorgon-first-look/, type: manufacturer, weight: 0.8}
  - {name: Infinite Discs Gorgon (mfr 10/6/-2/1; reviewers 10/6/-2.3/1), url: https://infinitediscs.com/innova-gorgon, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star Gorgon (reviewers 9.9/5.9/-2/1.1; reviewer text), url: https://infinitediscs.com/Innova-Gorgon/Star, type: retailer, weight: 0.3}
  - {name: Disc Golf Deals USA Gorgon flight review (retailer blog), url: https://discgolfdealsusa.com/blogs/news/innova-gorgon-flight-review, type: retailer, weight: 0.2}
  - {name: DiscMetrics Gorgon (aggregator), url: https://discmetrics.com/discs/innova/gorgon, type: retailer, weight: 0.1}
- **confidence:** 0.65
- **consensusNote:** Manufacturer, both reviewer averages (turn within 0.3, fade within 0.1) and the review text agree on a high-glide understable driver with a gentle fade that suits slower arms. The Atlas value matches the Star/Pro number, which is the reference plastic under the policy. No contradicting evidence found; the sample is seven to twenty reviews.
- **plasticVariance:** Real, and stamped by Innova: GStar -3/1 versus Star and Pro -2/1. Keep the mold number at the Star flight; do not average. Linked check: Beast (10/5/-2/2) and Valkyrie (9/4/-2/2) are comparison discs a retailer blog names; the Atlas shows the Gorgon with more glide and less fade than both; nothing moves.

## Sapphire — Latitude 64 (id 7ca72cc31f0b)

- **Atlas now:** 10/6/-2/1.5. **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Gold Line or Opto (same published numbers).
- **Manufacturer:** Latitude 64 10/6/-2/1.5, "Stable" (collection page fetched). Copy: "Are distance drivers only for the pros? Nope. Say hello to our first distance driver in the Easy-to-Use Line … the perfect partner to the Diamond"; "extra speed and stability" versus the Diamond; slim profile. **Wording tension:** "Stable" and "extra stability" against a -2 turn and an Easy-to-Use line, the same pattern batch 5 found on the Jade. Numbers and descriptions agree on the shape.
- **Retailer:** Infinite "Stable"; reviewer numbers 10/5.9/-1.8/1.7 (45 reviews, 4.49 stars); Gold Line page 10/5.9/-1.8/1.6 (9 reviews). Turn 0.2 more stable, fade 0.1–0.2 higher. Marshall Street 10/6/-2/1.5 (baseline). DiscMetrics: 44 reviews, "Stable" (aggregator).
- **Community:** Infinite Gold Line reviewers (first names, single-source): "Once it beats in you'll see some turn but it always fights back"; "for people with slower arm speeds it is a straight flyer and for people with higher arm speeds has a nice S curve"; "The Sapphire has more high and low speed stability than the Jade"; recommended for 280–320 ft throwers, "suited for 300–350 ft"; a beginner hit 332 ft. Search-summary retailer content: Gold Line glides slightly farther, Opto is "generally more stable and wind resistant."
- sources:
  - {name: Latitude 64 Sapphire collection page, url: https://latitude64.com/collections/sapphire, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Sapphire (mfr 10/6/-2/1.5; reviewers 10/5.9/-1.8/1.7), url: https://infinitediscs.com/latitude-64-sapphire, type: retailer, weight: 0.5}
  - {name: Infinite Discs Gold Line Sapphire (reviewers 10/5.9/-1.8/1.6; reviewer text), url: https://infinitediscs.com/Latitude-64-Sapphire/Gold-Line, type: retailer, weight: 0.3}
  - {name: DiscMetrics Sapphire (aggregator), url: https://discmetrics.com/discs/latitude-64/sapphire, type: retailer, weight: 0.1}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and the reviewer averages agree to within 0.2, and reviewers describe the intended arm-speed split: straight for slower arms, an S-curve for faster ones. The reviewer sample skews to 280–350 ft arms, the Sapphire's target audience. Linked check: Jade (9/6/-2/1) and Sapphire (10/6/-2/1.5) differ in the expected direction, and one reviewer says the Sapphire is more stable than the Jade at both ends; Diamond (8/6/-3/1) is the understable end of the line. Nothing moves.
- **plasticVariance:** Gold Line (grippier, beats in a touch faster, more glide) versus Opto (stiffer, more stable and wind resistant), plus Opto Air and DyeMax. Spread not quantified. Do not average.

## Falk — Kastaplast (id ebc9d6cbbdfb)

- **Atlas now:** 9/6/-2/1. **Proposed turn/fade:** none. Matches. Soft watch noted below. Reference plastic (assumed most-thrown): K1.
- **Manufacturer:** Kastaplast 9/6/-2/1 (K1 Falk page fetched), labelled "Stable fairway driver." Copy: "versatile fairway driver [that] fits the skills and power of a wide range of players … comfortable grip and a rim width at 19 mm"; suitable for "glidey tailwind shots, long anhyzer lines and hyzer-flip drives." **Wording tension:** the "stable" label sits against a -2 turn and copy that is all about turnover lines; Infinite and DiscMetrics call it "Understable."
- **Retailer:** Infinite listing 9/6/-2/1; reviewer numbers 8.9/5.9/-2.2/1.3 (49 reviews, 4.63 stars); K1 page 8.9/5.9/-2.3/1.2 (40 reviews). Turn 0.2–0.3 more understable, fade 0.2–0.3 higher. Marshall Street 9/6/-2/1 (baseline). DiscMetrics: 3,384 reviews listed, "understable" (aggregator, templated).
- **Community:** Infinite K1-page reviewers (single-source text): "more understable than advertised," "turns over too often" with more arm speed, "performs as 9/6/-3/1" for many throwers, "glides for days," "very easy to control and became the first disc I could controllably hyzer flip," "holds whatever line you put it on"; 300–350 ft throwers report controlled flights, 200–300 ft throwers "significant turn"; compared to River and beaten-in Valkyries. Bestdiscgolfdiscs (generic): "stable enough for straight shots yet offers enough turn and fade for skilled players," feels "slower than a typical 9-speed disc."
- sources:
  - {name: Kastaplast K1 Falk page (9/6/-2/1), url: https://www.kastaplast.com/en-us/products/k1-falk, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Falk (mfr 9/6/-2/1; reviewers 8.9/5.9/-2.2/1.3), url: https://infinitediscs.com/kastaplast-falk, type: retailer, weight: 0.5}
  - {name: Infinite Discs K1 Falk (reviewers 8.9/5.9/-2.3/1.2; reviewer text), url: https://infinitediscs.com/Kastaplast-Falk/K1, type: retailer, weight: 0.3}
  - {name: Bestdiscgolfdiscs Falk review (generic), url: https://bestdiscgolfdiscs.com/kastaplast-falk/, type: community, weight: 0.2}
  - {name: DiscMetrics Falk (aggregator), url: https://discmetrics.com/discs/kastaplast/falk, type: retailer, weight: 0.1}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and both reviewer averages agree on -2/1 (turn 0.2–0.3 more understable, within pooled-average noise). The reviewer text leans toward "more understable than advertised" for 300–350 ft arms and says the disc turns a lot for slower throwers, which is what -2 and an easy-to-turn mold predict. **Soft watch, not a candidate:** if the K1 text ("performs as -3 for many") shows up again with arm speeds, turn -2 → -2.5 would be the one to consider; the averages (-2.2/-2.3) do not support it yet, and the evidence is weaker than Tesla's. Linked check: Atlas Jade has identical numbers to the Falk (9/6/-2/1), and River (7/7/-1/1) is the other comparison disc reviewers name; nothing moves.
- **plasticVariance:** K1, K1 Soft, K1 Glow, K1 Grind and others; K1 Soft is the grippier, flippier option by retailer text. Spread not quantified. Do not average.

## Wave — MVP (id 2b23d1c34264)

- **Atlas now:** 11/5/-2/2. **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Neutron.
- **Manufacturer:** MVP 11/5/-2/2, "Stable-Understable" (page fetched). Copy: "a stable-understable high-speed distance driver" that is an extended version of the Inertia; powerful throwers "can execute turnovers and hyzerflips," average players "may achieve varied shot lines through anhyzer releases." Infinite quotes MVP: "the second wide-rimmed, high-speed distance driver … a longer Inertia" with "long gliding turnovers and hyzer flips" for skilled throwers and a challenge for lower-power players. Copy and numbers agree; Infinite's label is "Moderately stable."
- **Retailer:** Infinite reviewer numbers 11.2/5.1/-1.9/1.9 (103 reviews, 4.43 stars); Neutron page 11.3/5.1/-1.9/1.8 (41 ratings). Within 0.1–0.2 on turn and fade. Marshall Street 11/5/-2/2 (baseline). DiscMetrics: 862 reviews listed, "Stable" (aggregator, templated).
- **Community:** Infinite Neutron-page reviewers (single-source text) split by arm speed: "more overstable than advertised" (17-year veteran), "turned right and kept on going right" (SD86), "flies like it's on rails until the very end," "gentle penetrating fade," "S-curve flight" and "hyzer flip" capabilities, "neutral flying disc." Distances 300–350 ft (intermediate), 350–425 ft (advanced), 450–475 ft (experienced). Retailer text (Reaper Discs): needs extra snap to reach full speed in some blends; Fission 160–170 g suggested for newer throwers. Search summaries: "Wave is faster and more understable" than the Inertia.
- sources:
  - {name: MVP Wave page (11/5/-2/2, Stable-Understable), url: https://mvpdiscsports.com/discs/wave/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Wave (mfr 11/5/-2/2; reviewers 11.2/5.1/-1.9/1.9), url: https://infinitediscs.com/mvp-wave, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Wave (reviewers 11.3/5.1/-1.9/1.8; reviewer text), url: https://infinitediscs.com/MVP-Wave/Neutron, type: retailer, weight: 0.3}
  - {name: Reaper Discs understable-drivers guide (Wave section), url: https://reaperdiscs.com/blogs/reviews/axiom-mvp-understable-drivers, type: retailer, weight: 0.2}
  - {name: DiscMetrics Wave (aggregator, templated), url: https://discmetrics.com/discs/mvp/wave, type: retailer, weight: 0.1}
  - {name: DGCR "Inertia vs. Wave" thread (search title, not read), url: https://www.dgcoursereview.com/threads/inertia-vs-wave.127225/, type: community, weight: 0.1}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and both reviewer averages agree to within 0.2 on turn and fade. The reviewer text disagrees about direction ("overstable than advertised" versus "turned right and kept going"), which is the arm-speed and plastic split MVP's own copy describes, not a mold-level offset: the averages land on -1.9 and 1.8–1.9. Linked check: Inertia (9/5/-2/2) and Photon (11/5/-1/2.5) bracket it; MVP and reviewers call the Wave the longer Inertia, which the Atlas shows (same turn/fade, more speed). Nothing moves.
- **plasticVariance:** Neutron, Fission, Plasma, Proton, Eclipse, Cosmic Neutron; MVP sells 155–175 g. Reviewers say Fission is the easier, flippier entry plastic. No quantified spread. Do not average.

## F7 — Prodigy (id 656663520472)

- **Atlas now:** 8/6/-3/1. **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): 400.
- **Manufacturer:** Prodigy 8/6/-3/1, "Understable" (400 plastic page fetched). Copy: "a medium speed, understable fairway driver with substantial glide … a great choice for recreational and beginner players … excellent for turn-over shots and rollers." Infinite: "very understable." **History:** Infinite and a retailer summary note Prodigy updated the F7's numbers in 2023 (speed 7 → 8, "a more accurate flight," no physical change); I could not confirm whether turn or fade moved. The Atlas already carries the current 8/6/-3/1, so this is not catalog lag. DiscMetrics still lists 7/5/-3/1.
- **Retailer:** Infinite reviewer numbers 7.2/5.3/-3/0.9 (40 ratings, 4.19 stars); 400 page 7.4/5.4/-3/0.9 (21 ratings). **Turn and fade match.** Speed reads 0.6–0.8 under the new 8 and glide 0.6–0.7 under the published 6 (both outside the turn/fade scope; the speed gap is probably the 2023 change not yet reflected in older reviews). Marshall Street 8/6/-3/1 (baseline).
- **Community:** Infinite 400-page reviewers (single-source text): "very understable but also very controllable," "a lot of flip-up," "turns nicely, but gradually fades back for a nice straight throw," "effortless distance," one advanced thrower: "will right and fade a little at the end" thrown flat and hard; 275–375 ft intermediates find it versatile for hyzer flips, rollers and straight lines; one 400+ ft downhill throw. Compared to Leopard, River and Roadrunner, "slightly more understable than these." One reviewer said the flight changed once the factory flashing wore off.
- sources:
  - {name: Prodigy F7 400 plastic page (8/6/-3/1), url: https://prodigydisc.com/products/prodigy-f7-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs F7 (mfr 8/6/-3/1; reviewers 7.2/5.3/-3/0.9; 2023 update note), url: https://infinitediscs.com/prodigy-f7, type: retailer, weight: 0.5}
  - {name: Infinite Discs 400 F7 (reviewers 7.4/5.4/-3/0.9; reviewer text), url: https://infinitediscs.com/Prodigy-F7/400, type: retailer, weight: 0.3}
  - {name: DiscMetrics F7 (aggregator; still lists speed 7), url: https://discmetrics.com/discs/prodigy/f7, type: retailer, weight: 0.1}
  - {name: DGCR "F7 Review" thread (search title, not read), url: https://www.dgcoursereview.com/threads/f7-review.106640/, type: community, weight: 0.1}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and both reviewer averages agree on -3/1, and the reviewer text describes the same shape: a very understable fairway driver that flips up and fades gently. The advanced-thrower note ("will right and fade a little") is the expected high-power behavior of a -3 disc. Nothing supports moving it. Linked check: Atlas Diamond (Latitude 64) carries identical numbers (8/6/-3/1) from a different manufacturer; F5 (8/6/-2/1) and F3 (8/5/-2/2) are the neighbours. Reviewers rank the F7 slightly more understable than Leopard (Atlas 6/5/-2/1) and River (7/7/-1/1), which the Atlas shows; Roadrunner (9/5/-4/1) is more understable in the Atlas than reviewers' comparison implies, but that is the Roadrunner's question, not the F7's.
- **plasticVariance:** Prodigy sells the F7 in several plastics (300, 400, 500, 750, Air); Prodigy prints one set of numbers. The 400-page reviewer says the flight changes as plastic flashing wears off. No spread quantified. Do not average.

---

## Batch 6 report (for Freddy)

**Proposed changes (1, review-gated).**
- **Gator fade 3 → 4** (|Δ| = 1.0, needs your call). Innova's own page now prints 5/2/0/4 (read twice); Titan, Foundation Discs and Disc Golf Dojo match. The Atlas, Marshall Street, Infinite's listing and DiscMetrics still show 3. Reviewers all describe a hard, early fade that fits 3 or 4, so only the manufacturer can separate them. Same kind as the Luna (stale catalog, primary-source number). Innova's sister mold Caiman (5.5/2/0/4, derived from the Gator) reinforces the new number. I found no announcement or date; spot-check innovadiscs.com once before applying. **Linked, unchanged:** Gator3 (Atlas 5/2/0/3; its Innova page 404'd, so I could not confirm whether it moved), Caiman.

**Open candidates, none proposed (1):**
- **Tesla turn -1 → -0.5** (not gated). Infinite averages 9.7/4.7/-0.6/2.3 (95) and -0.7/2.2 (Neutron, 39), plus reviewers saying "considerably more overstable than the flight numbers suggest" and comparing it to the Firebird. Held back: MVP's own number and "Stable-Overstable" label say -1, the averages pool plastics and are anchored by the displayed -1, and retailer summaries say Neutron is accurate to the numbers while Plasma is the overstable one. If it moves, review Volt (8/5/-0.5/2) with it.

**Soft watch (not a candidate):** Falk turn -2 → -2.5. K1 reviewers say "more understable than advertised"; averages are -2.2/-2.3.

**Confirmed as-is (8):** Fireball (0.7); Gorgon, Sapphire, Falk, Wave, F7 (0.65); JLS, Sabre (0.6). Confirmations mean "no contradicting evidence found," not independent community verification. The Gorgon and F7 matches fall on their reference plastics (Star, 400) per the policy; Gorgon's GStar -3 and the F7's 2023 renumbering are recorded as variance and history.

**Too thin to call (1):** Tesla (above).

**Process notes for the next batch**

- Next ten by `featured.js` order after F7: A1, Truth, Svea, Nuke, Whale, Ape, A2, Reactor, Maiden, Sergeant (Tern, next in the list after Sergeant, was resolved in batch 5; Thrasher and Gatekeeper follow it).
- Batch 6 found **one catalog lag in ten (Gator)**, so keep diffing every mold against the current manufacturer page before reading any reviewers. Innova's `/disc/<mold>/` pages are the primary source for the Innova molds in the next batch (Whale, Ape).
- **Linked sets re-checked this batch with nothing to propose beyond the Gator:** Gator/Gator3/Caiman, Fireball/Motion/Tesla/Firebird, JLS/Sabre/Hawkeye, Tesla/Volt/Inertia, Sapphire/Jade/Diamond, Falk/Jade/River, Wave/Inertia/Photon, F7/Diamond/F5/F3. If Gator is approved at fade 4, also confirm Gator3's number from Innova before leaving it at 3. Nuke (next batch) is already linked to Force/Surge from batch 5.
- Infinite plastic pages need the exact slug (see the evidence limits); `/Brand-Mold/Plastic` guesses sometimes 302.
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access spot-checks Tesla first (Neutron turn, stated arm speeds, Neutron versus Plasma), then the Gator fade-4 date and Gator3's current Innova number.

---

# Batch 7 (Plan 10, Phase 2)

Researched October 3, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (already up to date).

Molds covered: A1, Truth, Svea, Nuke, Whale, Ape, A2, Reactor, Maiden, Sergeant (the next ten by `public/featured.js` order after F7).

## Batch 7 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Ape | 13/5/0/4 | none | Confirmed as-is | 0.75 |
| Nuke | 13/5/-1/3 | none | Confirmed as-is | 0.7 |
| Reactor | 5/5/-0.5/1.5 | none | Confirmed as-is | 0.7 |
| Maiden | 3/4/0/1 | none | Confirmed as-is | 0.7 |
| Truth | 5/5/-1/1 | none | Confirmed as-is | 0.65 |
| Svea | 5/6/-1/0 | none | Confirmed as-is (soft watch: a few reviewers say more understable than the number) | 0.65 |
| Whale | 2/3/0/1 | none | Confirmed as-is (thin, nothing contradicts) | 0.65 |
| A1 | 4/2/0/5 | none | Confirmed as-is (soft watch, pair with A2; the 2023 renumber explains the low reviewer averages) | 0.6 |
| A2 | 4/2/0/4 | none | Confirmed as-is (soft watch, pair with A1) | 0.6 |
| Sergeant | 11/4/0/2.5 | none | Confirmed as-is (thin, nothing contradicts) | 0.6 |

**No changes proposed, no open candidates, no too-thin verdicts.** No Luna/Gator-style catalog lag turned up: all ten Atlas numbers equal the current manufacturer numbers. The A1/A2 pair is the one that looked like a candidate at first (Infinite reviewer fade 3.9 and 3.3 against published 5 and 4) and then did not survive: Prodigy renumbered both in 2023 and the reviewer pool mixes old and new numbers (see A1).

## Evidence limits — batch 7

Same tooling limits as earlier batches; see the pilot section. Specific to this batch:

- **Diff against `flights.json` / `data.json` (done first):** the Atlas numbers equal Marshall Street's snapshot for all ten. None of the ten is in `verified-model-overrides.json` or `infinite-manufacturer-ratings.json`. Compared with current manufacturer pages, **all ten match exactly**: Prodigy (A1 4/2/0/5 and A2 4/2/0/4, 400-plastic pages), Kastaplast (Svea K1 page), Discraft (Nuke, team.discraft.com), Innova (Whale, Ape), MVP (Reactor), Dynamic Discs (Truth, Sergeant collection pages), Westside (Maiden collection page).
- **Retail layer is stale on the A series.** Marshall Street's A1 400 page, DiscMetrics, Gotta Go Gotta Throw (A1) and Skyline (A2) still print the pre-2023 numbers (A1 3/3/0/3, A2 4/4/0/3). Marshall Street's A1 750 and A2 300 pages already print 4/2/0/5 and 4/2/0/4. The Atlas carries the new numbers, so there is no lag in the Atlas, but anyone who checks a stale retailer page will see a "disagreement." The 2023 date and the old numbers for A1/A2/A3 come from one search summary of Prodigy's update; I did not read the announcement itself, though the stale retailer pages are consistent with it.
- **Reddit** blocked, **YouTube** unreachable, **DGCR** 403 (the A2/A3 and Reactor threads appear only as search titles; none is cited as evidence). Several `dgputtheads.com/<brand>-<mold>-review` URLs I guessed 404'd (Truth, Svea, Reactor, Sergeant, Ape); the Whale and Maiden reviews (Rodney Lane) were readable.
- **Community layer is thin.** Named reviews I could read: Rodney Lane (Whale, Maiden; Disc Golf Puttheads), Denis Flaschner (Whale vs Aviar and Reactor vs Hex; SimplyDiscGolf, a retail-blog-style site), and the Disc Golf Reviewer Nuke and Ape reviews (non-power throwers, so they read more overstable than the numbers). A generic bestdiscgolfdiscs Nuke page was given no weight. The rest is Infinite plastic-page reviewer text (anonymous or first-name, single-source, summarized, with a stated skill level or distance band for most). Distances rather than measured arm speeds: A1 150–225 ft, A2 200–225 ft, Truth 220–300 ft, Nuke 300–450 ft, Ape 250–450+ ft, Sergeant 250–400 ft, Maiden 100–330 ft. Confirmations read as "no contradicting evidence found," not independent community verification.
- **Infinite reviewer averages pool plastics and wear, and for A1/A2 they also pool pre- and post-2023 manufacturer numbers.** Used as coarse retailer-type evidence at capped weight; never alone for a proposal. The Infinite Nuke mold page did not show a rating count for its flight numbers; the other counts below are as the fetch step reported them.
- **Whale plastic pages:** Infinite's `/Innova-Whale/Star` 302'd, so there is no Whale plastic-level reviewer text. The Ape Star page loaded (11 reviews).
- **Marshall Street is the Atlas's own source** and was used only as baseline. Its stability labels differ from the manufacturers' on Reactor ("Overstable" vs MVP "Neutral-Stable") and Sergeant ("Overstable" vs Dynamic "Slightly overstable"); same numbers, looser words.
- Page contents came through a summarizing fetch step; spot-check any quote before it goes into an override's source note.

---

## A1 — Prodigy (id f6fa60033f91)

- **Atlas now:** 4/2/0/5 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic: 400 (Prodigy's A2 page calls 400 "the most popular Prodigy plastic across the entire lineup," so this is not an assumption).
- **Manufacturer:** Prodigy 4/2/0/5, "Overstable" (400 page fetched; the 750 page via Marshall Street reads the same). Copy: "an overstable utility disc that fills the gap between midranges and putters … perfect for power throwers who want to avoid the possibility of their shot turning over … consistent and reliable in all wind conditions." Prodigy's A-series blog: "Extremely Overstable Approach Disc," "the most overstable approach disc in the Prodigy lineup," and orders the series A1 > A2 > A3. Copy and numbers agree. **History:** Prodigy renumbered the A series in 2023 (reported: A1 3/3/0/3 → 4/2/0/5, A2 4/4/0/3 → 4/2/0/4, A3 4/4/0/3 → 4/3/0/3); stale retailers still print the old set.
- **Retailer:** Infinite listing 4/2/0/5, "Very Overstable"; reviewer numbers 3.5/2.4/0.1/3.9 (19 reviews, 4.68 stars); 400 page 3.6/2.5/0.1/4.2 (10 reviews). The reviewer speed (3.5) and glide (2.4) sit between the old and new published values, which is what a pool of pre- and post-renumbering reviews would produce; the fade (3.9–4.2) reads the same way, so this is **not** a clean mold-level disagreement with 5. Marshall Street 4/2/0/5 (A1 750; the 400 page still prints 3/3/0/3). DiscMetrics still lists 3/3/0/3 with "Very Overstable."
- **Community:** Infinite 400-page reviewers (ten, single-source; nine intermediate, one advanced, one professional; distances 150–200 ft where stated): "more stable than a zone, or a pig"; "far more overstable than any Zone, Harp, A2" (~200 ft); "most overstable putt/approach disc I have thrown"; "slower Firebird … will never turn over even on large anhyzer angles"; "doesn't really ever get to flat" in normal throws; "drops hard at the end like a Justice" (advanced); the professional calls it "very overstable" and capable of a "90 degree turn shot." One 200-ft reviewer saw slight turn before fade after 18–24 months of use. No reviewer says it fades less than the A2 or that it turns.
- sources:
  - {name: Prodigy A1 400 plastic page (4/2/0/5), url: https://prodigydisc.com/products/prodigy-a1-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Prodigy A-series comparison blog (A1 > A2 > A3), url: https://prodigydisc.com/blogs/news/finding-the-best-disc-golf-approach-disc-a-series-by-prodigy-disc, type: manufacturer, weight: 0.8}
  - {name: Infinite Discs A1 (listing 4/2/0/5; reviewers 3.5/2.4/0.1/3.9), url: https://infinitediscs.com/prodigy-a1, type: retailer, weight: 0.5}
  - {name: Infinite Discs 400 A1 (reviewers 3.6/2.5/0.1/4.2; reviewer text), url: https://infinitediscs.com/Prodigy-A1/400, type: retailer, weight: 0.3}
  - {name: Marshall Street A1 750 (4/2/0/5; the 400 page still shows 3/3/0/3; not independent), url: https://www.marshallstreetdiscgolf.com/product/prodigy-a1-750, type: retailer, weight: 0.2}
  - {name: DiscMetrics A1 (still 3/3/0/3; templated), url: https://discmetrics.com/discs/prodigy/a1, type: retailer, weight: 0.1}
- **confidence:** 0.6
- **consensusNote:** Manufacturer, its own series blog, and every reviewer comment describe the most overstable approach disc Prodigy makes. The one number that looked off, Infinite's reviewer fade of 3.9–4.2 against 5, is explained by the 2023 renumbering (speed and glide in the same pool land between the old and new values), so it is not evidence against 5. **Soft watch, not a candidate:** reviewers place the A1 only "slightly" above the A2 (and Prodigy's own copy says the A2 flies "just slightly less stable"), while the numbers put them a full fade point apart (5 vs 4). If post-2023 reviewers with stated arm speeds ever show the A1 at about 4.5, that would be the one to look at, and it would be a pair move with the A2 (|Δ| 0.5, not gated). The evidence today is ten reviewers at 150–225 ft and an unreadable DGCR thread.
- **plasticVariance:** Prodigy sells 300, 350, 400, 400G, 500 and 750; Prodigy prints one set of numbers. Marshall Street says the 400G tends more overstable than the 400. Long-use copies pick up slight turn before the fade (one reviewer). No spread quantified. Do not average.
- **Linked:** A2 (below), A3 (Atlas 4/3/0/3, matches Prodigy's blog) and A4 (4/3/-1/3). The ordering A1 > A2 > A3 is intact in the Atlas and in the reviewer averages (3.9 > 3.3; A3 not read). Zone (4/3/0/3) and Harp (4/3/0/3), the comparison discs reviewers name, sit below the A1 in the Atlas as the reviewers say. Nothing moves.

## Truth — Dynamic Discs (id 7b5b2704666c)

- **Atlas now:** 5/5/-1/1 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Lucid or Fuzion.
- **Manufacturer:** Dynamic Discs 5/5/-1/1 (collection page fetched), labelled "Slightly understable." Copy: "The best midrange disc in the game … Hyzer, straight, anhyzer, distance, approach, low ceiling power shots, high floating drop shots, all have been accomplished with the Truth." Intended uses: "straight to slightly understable midrange shots." **Label contradiction, same numbers:** Infinite and Marshall Street say "Stable"; Dynamic says "slightly understable." Infinite's description (quoting Dynamic) calls it "a 'true' straight flying midrange with moderate end-of-flight fade."
- **Retailer:** Infinite listing 5/5/-1/1, "Stable"; reviewer numbers 5/5.1/-0.7/1.3 (102 ratings, 4.53 stars); Lucid page 5/5/-0.8/1.2 (44 ratings). Turn reads 0.2–0.3 more stable than published, fade 0.2–0.3 higher; within pooled-average noise. Marshall Street 5/5/-1/1 (baseline).
- **Community:** Infinite Lucid-page reviewers (single-source): "The Lucid Truth flies very straight and has a moderate fade" (advanced); "nearly an exact copy of the Buzzz" (advanced); "goes dead straight for me" at 220 ft but "flippy if thrown hard" (intermediate); "holds any line I put it on" on forehands; "not a true straight flier but excellent, controllable"; "slightly more understable" than the EMAC Truth and "won't handle strong headwinds"; "in baseline plastic these get flippy (unusable) but in lucid these are a workhorse" (advanced). Split on direction: several say "more understable than advertised" (some as far as -1.5), one says "not as stable as advertised … inconsistent." The two groups cancel, which is why the average sits at -0.7/-0.8. Search-summary retailer text: "a longer, glidey Buzzz."
- sources:
  - {name: Dynamic Discs Truth collection page (5/5/-1/1, "slightly understable"), url: https://www.dynamicdiscs.com/collections/dynamic-discs-truth, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Truth (mfr 5/5/-1/1; reviewers 5/5.1/-0.7/1.3), url: https://infinitediscs.com/dynamic-discs-truth, type: retailer, weight: 0.5}
  - {name: Infinite Discs Lucid Truth (reviewers 5/5/-0.8/1.2; reviewer text), url: https://infinitediscs.com/dynamic-discs-truth/lucid, type: retailer, weight: 0.3}
  - {name: Marshall Street Truth (5/5/-1/1; not independent), url: https://www.marshallstreetdiscgolf.com/?s=truth&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and the reviewer averages agree on -1/1 within 0.3, and the text is split between "more understable than advertised" and "less stable than advertised" depending on arm speed and plastic, so there is no direction to correct toward. The Buzzz comparison is the most-repeated one, and the Atlas has them identical on turn/fade (5/4/-1/1 vs 5/5/-1/1, glide differs). No contradicting evidence found.
- **plasticVariance:** Real, per reviewers: baseline-plastic copies run flippy, Lucid steadier; the EMAC Truth is a separate mold that a reviewer calls less understable than this one. Spread not quantified. Do not average.
- **Linked:** Buzzz (5/4/-1/1), Hex (5/5/-1/1), Claymore (5/5/-1/1) and Reactor (5/5/-0.5/1.5) all sit within half a point on turn/fade; the Buzzz comparison and the manufacturer copy fit that cluster. The EMAC Truth is not in the Atlas flights file, so there is nothing to check there. Nothing moves.

## Svea — Kastaplast (id 18548c3cafc1)

- **Atlas now:** 5/6/-1/0 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Soft watch noted below. Reference plastic (assumed most-thrown): K1.
- **Manufacturer:** Kastaplast 5/6/-1/0, "Understable midrange" (K1 page fetched). Copy: "This easy-to-use disc might be your secret weapon to perform the lines you need. However, don't mistake it for a beginners only disc. Whenever you need massive glide, Svea will deliver." Infinite quotes Kastaplast as "a beaded, neutral-flying disc that will hold any line it is put on" — **wording tension** with the "understable" label and the -1 turn, the same pattern as the Falk in batch 6.
- **Retailer:** Infinite "Understable"; reviewer numbers 5/6/-1.1/0.1 (33 reviews, 4.76 stars); K1 page 5/6/-1.1/0.1 (25 reviews). Turn 0.1 more understable, fade 0.1 higher. Marshall Street 5/6/-1/0 (baseline, "Understable").
- **Community:** Infinite K1-page reviewers (single-source): "will flip up, and turn to the right and stay going right with no fade what-so-ever" (advanced); "-1 turn feels like a total understatement … flippy at higher arm speeds" (intermediate); "much more understable than initial impressions" (intermediate, updated review); "least fade of any of my discs" (beginner); "a GREAT hyzer flip disc"; "will show you what you're doing wrong" and "much less torque-resistant than many discs" (advanced, so form-sensitive); one professional compares the flight to the Latitude 64 Claymore. Retailer text (search summary): "great for players with slower arms," for bigger arms "hyzer flips that finish right and big long panning turnovers"; "requires speed control and finesse." The arm-speed pattern is consistent: more turn as power rises.
- sources:
  - {name: Kastaplast K1 Svea page (5/6/-1/0, understable), url: https://www.kastaplast.com/en-us/products/k1-svea, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Svea (mfr 5/6/-1/0; reviewers 5/6/-1.1/0.1), url: https://infinitediscs.com/kastaplast-svea, type: retailer, weight: 0.5}
  - {name: Infinite Discs K1 Svea (reviewers 5/6/-1.1/0.1; reviewer text), url: https://infinitediscs.com/kastaplast-svea/k1, type: retailer, weight: 0.3}
  - {name: Marshall Street Svea (5/6/-1/0; not independent), url: https://www.marshallstreetdiscgolf.com/?s=Svea&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and both reviewer averages agree on -1/0 (turn within 0.1), and reviewers describe the shape the numbers say: a very glidey understable mid that turns and holds right as power rises. **Soft watch, not a candidate:** three reviewers say -1 undersells it, but the averages (-1.1) do not, and the same "more understable than advertised" line showed up on the Falk. If it keeps appearing with arm speeds, turn -1 → -1.5 would be the one to consider (|Δ| 0.5, not gated).
- **plasticVariance:** K1, K1 Soft, K1 Glow, K3 Hard, K4; Infinite shows 21 variants. K1 Soft is the grippier, flippier option by retailer text (not read in detail). No spread quantified. Do not average.
- **Linked:** Falk (9/6/-2/1) carries the same "more understable than advertised" reviewer pattern; Gote (4/5/0/1) and Claymore (5/5/-1/1) are the comparison discs, and Svea sits between them in the Atlas as reviewers imply. Nothing moves.

## Nuke — Discraft (id e8898641fa07)

- **Atlas now:** 13/5/-1/3 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): ESP (Z and Big Z print the same numbers).
- **Manufacturer:** Discraft 13/5/-1/3, **stability 1.6** (team.discraft.com/discs/nuke and the Big Z page, both fetched). Copy: "Longer drives are now as easy as pushing a button: NUKE™ delivers virtually effortless maximum distance for moderate to expert players. The wide, heavy rim and refined aerodynamic engineering give NUKE unparalleled velocity, while a 1.6 stability rating makes it more useful to a wider range of players." Copy and numbers agree. For scale (Discraft's own ratings, batch 5): Surge 1.7, Force 2.0; the Nuke is the least stable of the three, which the Atlas turn/fade ordering (Force 0/3, Surge and Nuke -1/3) matches.
- **Retailer:** Infinite listing 13/5/-1/3, "Overstable" (161 ratings, 4.42 stars); reviewer numbers 13/5/-1/3 on the mold page (the count behind the flight numbers was not shown). ESP page 13/5/-1/2.9 (39 ratings); Z page 13/5/-1/3 (43 reviews). Exact on turn, fade within 0.1. Marshall Street 13/5/-1/3 (baseline, "Overstable"). Infinite's "Overstable" label is looser than Discraft's 1.6.
- **Community:** Infinite ESP-page reviewers (single-source): "stable with very little to no turn, more overstable than flight numbers suggest" (a high-rated advanced thrower); "slow panning drift to the right with subtle but reliable fade" (450 ft); "very reliable even in a head wind" (pro, 400 ft); "very overstable" on forehand (300 ft); and the opposite, "more turn than indicated, touchy in headwinds flat" (intermediate). Z-page reviewers: "rarely gives me any turn and flies very true in the wind," "flips to flat or turns slightly then dumps," and once beaten in "will hold a turn and go and go" (400+ ft). Most say it needs 400+ ft of power to fly as printed. Disc Golf Reviewer (Z plastic, a non-power thrower): "more overstable than" 1.6, which they attribute to too little power; a commenter on that review reports "-1/-2 high-speed turn, 2/3 low-speed fade" at proper power. bestdiscgolfdiscs (generic, no weight) repeats the numbers.
- sources:
  - {name: Discraft Nuke team page (13/5/-1/3, stability 1.6), url: https://www.team.discraft.com/discs/nuke, type: manufacturer, weight: 1.0}
  - {name: Discraft Big Z Nuke page (same numbers), url: https://www.discraft.com/big-z-nuke-bznuke, type: manufacturer, weight: 0.6}
  - {name: Infinite Discs Nuke (mfr 13/5/-1/3; reviewers 13/5/-1/3), url: https://infinitediscs.com/discraft-nuke, type: retailer, weight: 0.5}
  - {name: Infinite Discs ESP Nuke (reviewers 13/5/-1/2.9; reviewer text), url: https://infinitediscs.com/Discraft-Nuke/ESP, type: retailer, weight: 0.3}
  - {name: Infinite Discs Z Nuke (reviewers 13/5/-1/3; reviewer text), url: https://infinitediscs.com/Discraft-Nuke/Elite-Z, type: retailer, weight: 0.3}
  - {name: Disc Golf Reviewer Nuke (non-power thrower; comment thread), url: https://discgolfreviewer.com/discraft-nuke/, type: community, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and the reviewer averages land on -1/3 almost exactly, and the readable reviewers split by arm speed and plastic in both directions ("more overstable than the numbers" for lower power, "more turn than indicated" for others), which is what a 1.6 rating on a speed-13 disc predicts. Nothing supports moving it. No contradicting evidence found.
- **plasticVariance:** Sold in ESP, Z, Big Z, Titanium, Jawbreaker and specials; Discraft prints one set of numbers and a 1.6 stability on the pages read. Reviewers say ESP is the grippier plastic and one says beaten-in copies turn more. Not quantified. Do not average.
- **Linked:** Force (12/5/0/3, 2.0), Surge (11/5/-1/3, 1.7), Zeus (Atlas 12/5/-1/3, current Discraft number not re-read), Nuke OS (13/4/0/4) and Nuke SS (13/5/-3/3) are the family. Nuke, Surge and Zeus share turn/fade in the Atlas; Discraft's 1.6 vs 1.7 is the only stability difference I have and it is within what the shared numbers imply. No change to any of them.

## Whale — Innova (id 845a541cfad9)

- **Atlas now:** 2/3/0/1 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches; evidence thin. Reference plastic (assumed, not verified): Star or DX.
- **Manufacturer:** Innova 2/3/0/1, "Stable" (page fetched). Copy: "The Whale is the best combination short drive, accuracy, upshot and putting disc that Innova makes … a meaty feeling putter designed for consistent flights regardless of throwing power. It flies like a driver and lands like a putter, with superior torque resistance that makes sidearm throws easier." Infinite's description text (older Innova copy, as quoted there): "a beefy, ultra-straight flying putt-and-approach disc," "the stability of the big bead Aviar" with "almost no low-speed end-of-flight fade." Copy and numbers agree.
- **Retailer:** Infinite "Stable"; reviewer numbers 2/3.1/0/1 (40 ratings, 4.33 stars). Exact. Marshall Street 2/3/0/1 (baseline, "Stable"). A retailer search summary calls it "overstable" with the same numbers; wording, not a number.
- **Community:** Rodney Lane (Disc Golf Puttheads, XT plastic, about 80% power): "surprised that the disc doesn't turn too much with the low turn numbers"; "full power throws still require a little hyzer release"; "forehand shots with full power turn a little more." Denis Flaschner (SimplyDiscGolf, retail-blog-style, a pro): "very resistant to turning over, making it ideal for sidearm," "holds true for both low and high-powered throws"; same numbers as the Aviar. No Infinite plastic-page text was reachable (Star page 302'd).
- sources:
  - {name: Innova Whale page (2/3/0/1, "Stable"), url: https://www.innovadiscs.com/disc/whale/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Whale (mfr 2/3/0/1; reviewers 2/3.1/0/1; Innova description text), url: https://infinitediscs.com/innova-whale, type: retailer, weight: 0.5}
  - {name: Disc Golf Puttheads Whale review (Rodney Lane, XT), url: https://www.dgputtheads.com/innova-whale-review, type: community, weight: 0.3}
  - {name: SimplyDiscGolf Whale vs Aviar (Denis Flaschner), url: https://simplydiscgolf.com/innova-whale-vs-aviar/, type: community, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and the reviewer average agree exactly, and the two readable reviews describe a torque-resistant, straight putter that turns a little at full power, which a 0/1 says. The sample is one review at 80% power, one retail-blog comparison and 40 pooled ratings, so this reads "no contradicting evidence found."
- **plasticVariance:** Sold in DX, XT, KC Pro, GStar, Star and others; the Lane review is XT (flexible, chalky). One reviewer-level note that full-power forehands turn more. No spread quantified. Do not average.
- **Linked:** Aviar (Atlas 2/3/0/1) carries identical numbers; Innova's copy says the Whale matches the beaded Aviar's stability and Flaschner says both share numbers, so the Atlas pair is consistent. The pilot's Aviar "too thin to call" verdict is unchanged. Nothing moves.

## Ape — Innova (id a1ad96656f64)

- **Atlas now:** 13/5/0/4 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic: Star (Innova drivers, per the policy).
- **Manufacturer:** Innova 13/5/0/4, **labelled "Stable"** (page fetched). Copy: "A fast long-range distance driver with great stability … The Ape can handle the raw, primal power of disc golf's biggest arms. Extremely fast and stable, the Ape is a 'must have' distance driver for windy conditions and sharp doglegs." **Contradiction in wording only:** "stable" in Innova's copy reads as "won't turn over" (the Wraith is "long stable" too); the 0 turn and 4 fade are the actual numbers, and Infinite and Marshall Street both label it "Very Overstable." The numbers are not in dispute.
- **Retailer:** Infinite "Very Overstable"; reviewer numbers 13/4.8/0/4.1 (106 reviews, 4.08 stars); Champion page 13/4.8/0/4.1 (51 reviews); **Star page 13/4.8/0/4.2 (11 reviews)**, the reference plastic. Turn exact, fade within 0.1–0.2, glide 0.2 low. Marshall Street 13/5/0/4 (baseline).
- **Community:** Infinite Star-page reviewers (intermediate to professional, 250–450+ ft): "crazy overstable," "comically overstable … a reliable wind-buster that resists flipping," "incredibly overstable" with "crazy hyzer spike shots," "most overstable disc I've ever thrown" (two reviewers, one professional), "fades hard even at full power," "a good option for a utility distance driver," "flight consistent with expectations" for strong headwinds (professional). Champion-page reviewers: "an absolute meathook" (advanced, L13), "very very overstable even at lighter weights," "flies like a fresh Firebird except it goes a bit farther and skips a lot more" (intermediate forehand), "holds that glide for a bit before fading" once broken in. Disc Golf Reviewer (Champion, a non-power thrower): "fades so sharply it almost drops directly vertical," "not recommended for players who throw less than 300 ft." No reviewer says it fades less than 4.
- sources:
  - {name: Innova Ape page (13/5/0/4, "Stable"), url: https://www.innovadiscs.com/disc/ape/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Ape (mfr 13/5/0/4; reviewers 13/4.8/0/4.1), url: https://infinitediscs.com/innova-ape, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star Ape (reviewers 13/4.8/0/4.2; reviewer text), url: https://infinitediscs.com/Innova-Ape/Star, type: retailer, weight: 0.3}
  - {name: Infinite Discs Champion Ape (reviewers 13/4.8/0/4.1; reviewer text), url: https://infinitediscs.com/Innova-Ape/Champion, type: retailer, weight: 0.3}
  - {name: Disc Golf Reviewer Ape (non-power thrower), url: https://discgolfreviewer.com/innova-ape/, type: community, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer numbers, all three Infinite reviewer averages (including the Star page) and every reviewer comment agree on a very overstable utility distance driver at 0/4. The "Stable" label in Innova's copy is the only odd note and it is wording, not a number. Nothing supports moving it.
- **plasticVariance:** Sold in DX, Star, Champion, Metal Flake Champion, Blizzard. Reviewer averages by plastic (Star 4.2, Champion 4.1) are indistinguishable; one reviewer says lighter copies are still "very very overstable." Do not average.
- **Linked:** Firebird (9/3/0/4; a reviewer says the Ape "flies like a fresh Firebird … goes a bit farther"), Destroyer (Atlas 12/5/-0.5/3.5 after the override) and Wraith (11/5/-1/3). The Atlas puts the Ape (0/4) above the Destroyer's adjusted -0.5/3.5 and the Wraith's -1/3 in overstability, the order reviewers describe. No change; the Destroyer adjustment is unaffected.

## A2 — Prodigy (id 7514671b7276)

- **Atlas now:** 4/2/0/4 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Soft watch noted under A1. Reference plastic: 400.
- **Manufacturer:** Prodigy 4/2/0/4, "Overstable" (400 page fetched; Marshall Street's A2 300 page reads the same). Copy: "an overstable utility disc that fills the gap between midranges and putters"; "a beadless cousin to the A1 and will fly just slightly less stable than the A1," with "an extra 30 to 40 feet of glide than the A1"; "perfect for … high wind approach shots." Prodigy's blog calls it "Extremely Overstable." Copy and numbers agree. Pre-2023 numbers were 4/4/0/3 (see A1); Skyline's page still prints them.
- **Retailer:** Infinite listing 4/2/0/4, "Overstable"; reviewer numbers 4/3.3/0/3.3 (63 reviews, 4.56 stars); 400 page 4.1/3.1/0.1/3.5 (27 reviews). Reviewer fade runs 0.5–0.7 under the published 4, and reviewer glide 1.1–1.3 over the published 2. Both gaps point at the old 4/4/0/3 set sitting in the pool (old glide 4, old fade 3), so this is the same pooling effect as the A1 and not a mold-level reading. DiscMetrics 4/2/0/4 (319 reviews). Marshall Street 4/2/0/4 (baseline).
- **Community:** Infinite 400-page reviewers (single-source; distances 200–225 ft where stated): "very overstable approach disc" with "heavy fade" (advanced, 225 ft; rates it 4/2/0.5/4); "fade on it is nice and strong"; "very overstable and will always fade out" (professional); "doesn't power down well," excels at spike hyzers, compared to the A1 (advanced); "beefy approach disc … flies beefier than your average Zone" but less extreme than specialty overstable discs (intermediate, 200 ft); "fast," more than a Toro, Pig or Zone, "will fight out of whatever anhyzer angle"; "40 feet more max distance" than the A1 and "handles wind almost as well as the A1"; "pretty hard hook at the end" (beginner). One intermediate warns "it can still turn over" with a poor release. Not beginner-friendly per several.
- sources:
  - {name: Prodigy A2 400 plastic page (4/2/0/4), url: https://prodigydisc.com/products/prodigy-a2-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Prodigy A-series comparison blog (A1 > A2 > A3), url: https://prodigydisc.com/blogs/news/finding-the-best-disc-golf-approach-disc-a-series-by-prodigy-disc, type: manufacturer, weight: 0.8}
  - {name: Infinite Discs A2 (listing 4/2/0/4; reviewers 4/3.3/0/3.3), url: https://infinitediscs.com/prodigy-a2, type: retailer, weight: 0.5}
  - {name: Infinite Discs 400 A2 (reviewers 4.1/3.1/0.1/3.5; reviewer text), url: https://infinitediscs.com/Prodigy-A2/400, type: retailer, weight: 0.3}
  - {name: Marshall Street A2 300 (4/2/0/4; not independent), url: https://www.marshallstreetdiscgolf.com/product/prodigy-a2-300, type: retailer, weight: 0.2}
  - {name: DiscMetrics A2 (4/2/0/4; 319 reviews; aggregator), url: https://discmetrics.com/discs/prodigy/a2, type: retailer, weight: 0.1}
- **confidence:** 0.6
- **consensusNote:** Manufacturer, the series blog and the review text agree on a very overstable beadless approach disc, a notch below the A1 with more glide. Infinite's lower reviewer fade (3.3–3.5) and higher glide (3.1–3.3) are what a pool of pre- and post-2023 reviews would give, so it is not counted against 4. No contradicting evidence found; reviewers who state distance are all around 200 ft.
- **plasticVariance:** Sold in 200, 300, 400, 500, 750 and special runs; Prodigy prints one set of numbers. One reviewer calls the 400 "incredibly grippy." No spread quantified. Do not average.
- **Linked:** A1 (above), A3 (4/3/0/3), Zone (4/3/0/3), Harp (4/3/0/3). Reviewers call the A2 beefier than the Zone, which the Atlas shows (fade 4 vs 3). Nothing moves.

## Reactor — MVP (id 1d829c28787f)

- **Atlas now:** 5/5/-0.5/1.5 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Neutron.
- **Manufacturer:** MVP 5/5/-0.5/1.5, **"Neutral-Stable"** (page fetched). Copy: for high-powered players "a neutral-stable GYRO® push followed by a dependable fade" with "subtle turn that extends flight without overpowering natural fade"; for lower power "an extremely dependable flat-to-fade midrange" with workable hyzers and "longer s-turns on anhyzer releases"; "will handle big hyzers as well as big turnovers" (Infinite's quote of MVP). Copy and numbers agree. **Label differences, same numbers:** Infinite "Stable"; Marshall Street (and so the Atlas label) "Overstable"; Flaschner "stable … with a slightly overstable finish."
- **Retailer:** Infinite reviewer numbers 5.1/5/-0.4/1.5 (48 reviews, 4.83 stars); Neutron page 5/5/-0.5/1.5 (29 reviews). Exact on fade, turn within 0.1. Marshall Street 5/5/-0.5/1.5 (baseline).
- **Community:** Infinite Neutron-page reviewers (single-source): "very true to flight numbers. Goes very straight and finishes with just a little tiny baby fade" (intermediate); "starts straight, flies straight, ends straight" (advanced); "dead straight with a modest predictable fade"; "flip up ever so slightly then fly straight for so long"; "more like a glidey RocX3 with some overstability" (advanced); "will ABSOLUTELY hold any line you throw it on" (beginner forehand); one reviewer: "much more stable than advertised … lower glide … like a seasoned Roc3." Flaschner (SimplyDiscGolf, pro): stable with a slightly overstable finish, a stronger finish than the Hex (fade 1.5 vs 1).
- sources:
  - {name: MVP Reactor page (5/5/-0.5/1.5, "Neutral-Stable"), url: https://mvpdiscsports.com/discs/reactor/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Reactor (mfr 5/5/-0.5/1.5; reviewers 5.1/5/-0.4/1.5), url: https://infinitediscs.com/mvp-reactor, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Reactor (reviewers 5/5/-0.5/1.5; reviewer text), url: https://infinitediscs.com/mvp-reactor/neutron, type: retailer, weight: 0.3}
  - {name: SimplyDiscGolf Reactor vs Hex (Denis Flaschner), url: https://simplydiscgolf.com/mvp-reactor-vs-axiom-hex/, type: community, weight: 0.2}
  - {name: DGCR "MVP Reactor" thread (search title, not read), url: https://www.dgcoursereview.com/threads/mvp-reactor.145981/, type: community, weight: 0.1}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and both reviewer averages agree to within 0.1 on turn and fade, the Neutron page is exact, and the text describes the printed shape (straight, a touch of turn at power, a small reliable fade). The one "more stable than advertised" comment is outweighed. The Atlas label "Overstable" is looser than MVP's "Neutral-Stable"; it does not affect the numbers.
- **plasticVariance:** Neutron, Fission, Plasma, Proton and others. A Neutron reviewer says a 163 g Fission flies like a heavier Neutron; MVP says Fission lets it mold down to 155 g "while retaining desired flight characteristics." No spread quantified. Do not average.
- **Linked:** Hex (5/5/-1/1), Truth (5/5/-1/1), Buzzz (5/4/-1/1) and Claymore (5/5/-1/1) are within half a point on turn/fade; Flaschner puts the Reactor a little more stable than the Hex, which the Atlas shows (-0.5/1.5 vs -1/1). Nothing moves.

## Maiden — Westside Discs (id 07e8413a32d1)

- **Atlas now:** 3/4/0/1 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): BT (Medium or Hard); VIP prints the same numbers.
- **Manufacturer:** Westside 3/4/0/1 (collection page fetched). Copy: "If you're looking for a neutral putter with a thin profile, the Maiden fits the bill. The Maiden is surprisingly resistant to turn with little fade." Copy and numbers agree. Infinite and Marshall Street label it "Stable."
- **Retailer:** Infinite mold page reviewer numbers 3.1/3.9/-0.2/1 (74 reviews, 4.74 stars); VIP page 3/4.1/0/1 (10 reviews); BT Soft page 3.1/4/-0.1/0.9 (9 reviews). Turn within 0.2, fade exact to 0.1. Marshall Street 3/4/0/1 (baseline).
- **Community:** Infinite VIP-page reviewers (ten, single-source; 100–330 ft): "very straight, has plenty of glide" (advanced, 275 ft); "dead straight with the slightest bit of reliable fade, will not come back when turned over"; "frozen rope" with no fade flat, pushed to 330 ft; "very straight with a slight fade brand new" and "a flip up and drift right putter" with wear (advanced); "very STRAIGHT … incredibly torque resistant" (advanced); "glide for days and go straight for 90% of its flight before finishing very gently to the left." BT Soft page: "incredibly straight even when thrown slowly," "slight predictable fade," "frozen rope before it gently fades out"; one beginner's disc turned "too understable" with use. Rodney Lane (Disc Golf Puttheads, Origio): "much more stability than I would expect" for a low-profile putter; "less turn and less fade" than the Dynamic Judge; flies like the Latitude 64 Pure but "more torque resistant."
- sources:
  - {name: Westside Maiden collection page (3/4/0/1, neutral putter), url: https://westsidediscs.com/collections/maiden, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Maiden (mfr 3/4/0/1; reviewers 3.1/3.9/-0.2/1), url: https://infinitediscs.com/westside-maiden, type: retailer, weight: 0.5}
  - {name: Infinite Discs VIP Maiden (reviewers 3/4.1/0/1; reviewer text), url: https://infinitediscs.com/westside-maiden/vip, type: retailer, weight: 0.3}
  - {name: Infinite Discs BT Soft Maiden (reviewers 3.1/4/-0.1/0.9; reviewer text), url: https://infinitediscs.com/westside-maiden/bt-soft, type: retailer, weight: 0.3}
  - {name: Disc Golf Puttheads Maiden review (Rodney Lane), url: https://www.dgputtheads.com/westside-discs-maiden-review, type: community, weight: 0.3}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and all three reviewer averages (mold, VIP, BT Soft) agree on 0/1 to within 0.2, and the text is consistent: a very straight, torque-resistant putter that finishes with the slightest fade and flips up only with wear. Lane's "less turn and less fade than the Judge" is the only hint of anything below 0/1; the Atlas Judge is also 0/1, 0/1 cannot go much lower at this resolution, and no other source says it, so it is recorded, not a candidate.
- **plasticVariance:** Sold in BT Hard/Medium/Soft, VIP, VIP Air, Origio, Tournament. Reviewers: VIP slightly glidier, worn copies turn ("flip up and drift right"). Spread not quantified. Do not average.
- **Linked:** Judge (2/4/0/1) and EMAC Judge (2/4/0/1); Pure (3/3/-1/1), which Lane says the Maiden flies like with more torque resistance, though the Atlas gives the Pure one more point of turn. Nothing in this batch moves any of them.

## Sergeant — Dynamic Discs (id 44384b22412a)

- **Atlas now:** 11/4/0/2.5 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches; evidence thin. Reference plastic (assumed most-thrown, not verified): Fuzion or Lucid.
- **Manufacturer:** Dynamic Discs 11/4/0/2.5, "Slightly overstable" (collection page fetched). Copy: "an excellent hybrid-style distance driver - like a faster Getaway or a slower Raider … perfect for those shots that a fairway just won't reach but you don't want to power down on a distance driver"; "sufficient stability for controlled drives without excessive turn-over at the finish." Copy and numbers agree. Marshall Street and Infinite's search listing say "Overstable"; Dynamic says "slightly overstable." Same numbers.
- **Retailer:** Infinite listing 11/4/0/2.5; mold-level reviewer numbers 11/4/0/2.6 (16 reviews, 4.44 stars); Fuzion page 11/4.1/0/2.5 (3 reviews); Lucid page 10.9/4/0/2.6 (9 reviews); Hybrid page 11.5/4/0/3 (1 review, not used). Turn exact, fade within 0.1. Marshall Street 11/4/0/2.5 (baseline).
- **Community:** Infinite plastic-page reviewers (single-source; 250–400 ft): Fuzion: "doesn't turn over if I give it a lot of juice" (350+ ft), "an overstable Wraith" (professional, L13) that "glides well for how beefy it is," "dead straight control driver with a healthy late fade," "has to be laid out flat or even on a baby anhyzer." Lucid: "flight ratings are very accurate" and the fade "cuts hard but not overly aggressive"; "pretty darn overstable but will flip and turn a little" (about 250 ft sidearm); "very little turn and a nice bite at the end"; "a faster Firebird" with high overstability (300–400 ft); "not stable enough to really crank." Hybrid (one advanced reviewer): "very over stable out of the box," backhands "dive way quicker than I would have liked," a good forehand disc. The Wraith and Firebird comparisons read a little more overstable than 0/2.5 and are single comments; the reviewer averages and the "ratings are very accurate" comment say 2.5–2.6.
- sources:
  - {name: Dynamic Discs Sergeant collection page (11/4/0/2.5, "slightly overstable"), url: https://www.dynamicdiscs.com/collections/dynamic-discs-sergeant, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Sergeant (mfr 11/4/0/2.5; reviewers 11/4/0/2.6), url: https://infinitediscs.com/dynamic-discs-sergeant, type: retailer, weight: 0.5}
  - {name: Infinite Discs Lucid Sergeant (reviewers 10.9/4/0/2.6; reviewer text), url: https://infinitediscs.com/dynamic-discs-sergeant/lucid, type: retailer, weight: 0.3}
  - {name: Infinite Discs Fuzion Sergeant (reviewers 11/4.1/0/2.5; reviewer text), url: https://infinitediscs.com/dynamic-discs-sergeant/fuzion, type: retailer, weight: 0.2}
  - {name: Marshall Street Sergeant (11/4/0/2.5; not independent), url: https://www.marshallstreetdiscgolf.com/?s=sergeant&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** Manufacturer and the reviewer averages agree on 0/2.5 (turn exact, fade within 0.1), and the reviewers describe a straight, controllable, late-fading hybrid driver. The Wraith/Firebird comparisons hint at slightly more fade but come from two reviewers, are not backed by the averages, and a half-point on this evidence is not a call. The sample is 16 pooled ratings and about ten comments, so this reads "no contradicting evidence found."
- **plasticVariance:** Lucid, Fuzion, Prime, Hybrid, Moonshine, Chameleon and others (13 at Infinite). The one Hybrid reviewer finds it very overstable out of the box; the Hybrid average (1 review) is not used. Not quantified. Do not average.
- **Linked:** Getaway (Atlas 9/5/-0.5/3), Raider (13/5/-0.5/3) — Dynamic's own "faster Getaway / slower Raider" copy — and Wraith (11/5/-1/3) and Surge (11/5/-1/3) at the same speed. The Atlas has the Sergeant at 0/2.5 against the Getaway and Raider at -0.5/3, a bit less turn and a bit less fade; nothing here contradicts it. No change.

---

## Batch 7 report (for Freddy)

**Proposed changes (0).** No catalog lag: all ten Atlas numbers equal the current manufacturer pages.

**Open candidates, none proposed (0).** The A1/A2 pair briefly looked like one (Infinite reviewer fade 3.9 and 3.3 against 5 and 4) and was withdrawn: Prodigy renumbered A1 3/3/0/3 → 4/2/0/5 and A2 4/4/0/3 → 4/2/0/4 in 2023 (reported; announcement not read), the reviewer speed and glide land between old and new, and every A1/A2 comment reads strongly overstable.

**Soft watches (not candidates):**
- **A1/A2 as a pair:** reviewers and Prodigy's own copy ("just slightly less stable") put them closer than a full fade point apart. Revisit only with post-2023 reviewers who state arm speeds.
- **Svea turn -1 → -1.5 (|Δ| 0.5):** three reviewers say -1 undersells it, but the averages are -1.1. Same pattern as the Falk in batch 6.

**Confirmed as-is (10):** Ape (0.75); Nuke, Reactor, Maiden (0.7); Truth, Svea, Whale (0.65); A1, A2, Sergeant (0.6). Confirmations mean "no contradicting evidence found," not independent community verification. Whale and Sergeant are the thinnest (one reviewer at 80% power plus 40 pooled ratings; 16 pooled ratings plus single-source plastic-page comments).

**Too thin to call (0).** None of the ten had a disagreement to be unsure about; the thin ones simply have no contradicting evidence.

**Label notes (words, not numbers; the Atlas stability labels are Marshall Street's):** Reactor "Overstable" (Atlas) vs MVP "Neutral-Stable"; Sergeant "Overstable" vs Dynamic "Slightly overstable"; Truth "Stable" vs Dynamic "Slightly understable"; Ape "Stable" in Innova's own copy against a 0/4 number.

**Process notes for the next batch**

- Next ten by `featured.js` order after Sergeant: Thrasher, Gatekeeper, Escape, MD5 (new), Comet, PA3, Lots, Fury, Krait, Trespass (Tern was resolved in batch 5).
- **Prodigy's 2023 renumbering is a trap for retailer layers.** Several retailers and DiscMetrics still print old Prodigy numbers; PA3 is in the next batch and may have the same issue. Check Prodigy's own page before reading any retailer or reviewer average, and expect Infinite averages to blend old and new values for any disc renumbered in the last few years (speed and glide reading between the two sets is the tell).
- **Linked sets re-checked this batch with nothing to propose:** A1/A2/A3/A4/Zone/Harp, Truth/Buzzz/Hex/Reactor/Claymore, Svea/Gote/Falk, Nuke/Force/Surge/Zeus/Nuke OS/Nuke SS, Whale/Aviar, Ape/Firebird/Destroyer/Wraith, Maiden/Judge/EMAC Judge/Pure, Sergeant/Getaway/Raider/Wraith. Zeus's current Discraft number was not re-read; if Nuke ever moves, re-read it. The open Gator and Tesla items from batch 6 are unchanged by this batch.
- Reachable manufacturer paths this batch: `prodigydisc.com/products/prodigy-<mold>-400-plastic`, `kastaplast.com/en-us/products/k1-<mold>`, `www.team.discraft.com/discs/<mold>` and `discraft.com/big-z-<mold>-bz<mold>` (the `esp-` guess 404'd), `innovadiscs.com/disc/<mold>/`, `mvpdiscsports.com/discs/<mold>/`, `dynamicdiscs.com/collections/dynamic-discs-<mold>`, `westsidediscs.com/collections/<mold>`. Infinite plastic pages loaded for `/Prodigy-A1/400`, `/Prodigy-A2/400`, `/dynamic-discs-truth/lucid`, `/kastaplast-svea/k1`, `/Discraft-Nuke/ESP`, `/Discraft-Nuke/Elite-Z`, `/Innova-Ape/Star`, `/Innova-Ape/Champion`, `/mvp-reactor/neutron`, `/westside-maiden/vip`, `/westside-maiden/bt-soft` and `/dynamic-discs-sergeant/{lucid,fuzion,hybrid}`. `/Innova-Whale/Star` 302'd, and so did the plain `/westside-discs-maiden` slug (the working one is `/westside-maiden`).
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access spot-checks the A1/A2 spacing (post-2023, stated arm speeds) and the Svea "more understable than -1" comments first, then still the Tesla and Gator items from batch 6.

---

# Batch 8 (Plan 10, Phase 2)

Researched October 3, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (already up to date).

Molds covered: Thrasher, Gatekeeper, Escape, MD5 (new), Comet, PA3, Lots, Fury, Krait, Trespass (the next ten by `public/featured.js` order after Sergeant; Tern was resolved in batch 5).

## Batch 8 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Thrasher | 12/5/-3/2 | none | Confirmed as-is | 0.7 |
| Escape | 9/5/-1/2 | none | Confirmed as-is | 0.7 |
| Comet | 4/5/-2/1 | none | Confirmed as-is | 0.7 |
| Krait | 11/5/-1/2 | none | Confirmed as-is | 0.7 |
| Gatekeeper | 4/5/0/2 | none | Confirmed as-is | 0.65 |
| Lots | 9/5/-1/2 | none | Confirmed as-is (soft watch: same "-1 undersells it" pattern as the Svea) | 0.65 |
| PA3 | 3/3/0/1 | none | Confirmed as-is (soft watch: a few reviewers say more fade; no renumbering found) | 0.6 |
| MD5 (new) | 5/3/0/4 | none | Confirmed as-is (thin, nothing contradicts) | 0.6 |
| Trespass | 12/5/-0.5/3 | none | **Too thin to call: turn -0.5 vs -1.1 in all three Infinite averages and in most reviewer text (turn -0.5 → -1, not gated)** | 0.5 |
| Fury | 9/6/-2/2 | none | **Too thin to call: fade 2 vs 1.3–1.6 in all three Infinite averages (fade 2 → 1.5, not gated; out of production)** | 0.5 |

**No changes proposed. Two open candidates (Trespass turn, Fury fade), eight confirmed.** No Luna/Gator-style catalog lag turned up: all ten Atlas numbers equal the current manufacturer numbers. Both candidates are manufacturer-vs-retailer-average splits where the manufacturer layer, which outweighs pooled retailer averages, says the Atlas value. **Trespass is the stronger of the two**: its three plastic-level averages agree with each other (-1.1) and move *away* from the number Infinite displays, and the reviewer text points the same way, which is the reverse of the anchoring effect noted in earlier batches.

## Evidence limits — batch 8

Same tooling limits as earlier batches; see the pilot section. Specific to this batch:

- **Diff against `flights.json` / `data.json` (done first):** the Atlas numbers equal Marshall Street's snapshot for nine of the ten; **MD5 (new)** comes from the verified override (Discmania collection page, checked 2026-09-23). Compared with current manufacturer pages, **all ten match exactly**: Discraft (Thrasher and Comet via team.discraft.com), Westside (Gatekeeper), Dynamic Discs (Escape, Trespass), Discmania (MD5), Prodigy (PA3 400 page), Kastaplast (Lots K1 page), Latitude 64 (Fury), Innova (Krait). None of the ten is in `infinite-manufacturer-ratings.json` (the file's only Thrasher entry is the separate **Captain's Thrasher**, 12/5/0/2; do not match it to this mold).
- **PA3 watch (stale-retailer check from the batch 7 note): no renumbering found.** Prodigy's own PA-3 pages (400 plastic and the collection page) print 3/3/0/1 "Stable," the same as Marshall Street, Gotta Go Gotta Throw, Skyline's spotlight and Infinite. The rest of the series also matches the Atlas on Prodigy's pages (PA-1 3/3/0/2.5, PA-2 3/3/0/2, PA-4 3/3/-1/1). The only odd numbers are a templated Disc Golf Puttheads chart that prints glide 4 (3/4/0/1). Unlike the A series, the PA series shows no sign of a 2023-style update, so Infinite's reviewer averages for it are not blended across two number sets.
- **Reddit** blocked, **YouTube** unreachable, **DGCR** 403 (the Trespass stability and Trespass-vs-Destroyer threads and the Fury threads appear only as search-result titles; none is cited as evidence). All Things Disc Golf timed out on the Escape and Trespass reviews (500/timeout), so neither is cited as read. Several guessed `dgputtheads.com` review URLs 404'd; the Thrasher and PA3 reviews were readable.
- **Community layer is thin.** Named reviews I could read: Rodney Lane (Thrasher; Disc Golf Puttheads), Chris Bawden (PA3; Disc Golf Puttheads), Corey (Escape; Disc Golf Dash), Broden (Comet; Inside the Circle), Disc Golf Reviewer (PA-3 vs Claws match recap, which reads as a 200-plastic putting test). Several retailer-blog and aggregator pages (bestdiscgolfdiscs, discountdiscgolf, DiscMetrics, Disc Golf Puttheads flight charts) were templated or generic and were given minimal or no weight. The rest is Infinite plastic-page reviewer text (anonymous or first-name, single-source, summarized, with a stated skill level or distance band for most). Distances rather than measured arm speeds: Thrasher 275–500 ft, Escape 250–400+ ft, Comet 325–370 ft, Lots 250–400+ ft, Krait 350–400 ft, Trespass 250–400+ ft, PA3 up to 275 ft, MD5 200 ft. Confirmations read as "no contradicting evidence found," not independent community verification.
- **Infinite reviewer averages pool plastics and wear.** Used as coarse retailer-type evidence at capped weight; never alone for a proposal. Several mold pages did not show a clean mold-level count; counts below are as the fetch step reported them. **Plastic pages I could not load:** Krait Star (302; the Champion page loaded), Comet ESP (not attempted; the Big Z page loaded), Fury plastic pages loaded for Opto and Gold Line only.
- **Spot-check needed on the Comet stability rating.** The summarizing fetch of team.discraft.com printed "Stability Rating: -2 (Understable)" for the Comet, while Infinite's page says Discraft rates it 0. The -2 looks like the turn value mislabeled by the fetch step; I could not read the raw page. Not used for any conclusion.
- **Marshall Street is the Atlas's own source** and was used only as baseline.
- Page contents came through a summarizing fetch step; spot-check any quote before it goes into an override's source note.

---

## Thrasher — Discraft (id 7dfe3f9278d8)

- **Atlas now:** 12/5/-3/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): ESP (Z and Big Z are the other common ones).
- **Manufacturer:** Discraft 12/5/-3/2, **stability 0.4** (team.discraft.com page fetched). Copy: "Double down on your firepower with Thrasher! It's very fast and understable but not flippy, allowing huge distance from slower arms yet is completely big arm friendly. It will finish on a slow hyzer in most situations, so expect some gloriously clean anhyzers with a mild finish!" **Copy-vs-number tension:** "understable but not flippy" against a -3 turn, and reviewers use "very flippy" freely. The numbers are not in dispute.
- **Retailer:** Infinite "Understable"; reviewer numbers 11.7/5/-2.8/1.9 (100 reviews, 4.57 stars); ESP page 11.8/5/-3/1.9 (29 reviews). Turn within 0.2, fade 0.1; speed reads 0.2–0.3 under the published 12 (outside scope). Marshall Street 12/5/-3/2 (baseline, "Understable").
- **Community:** Infinite ESP-page reviewers (single-source): "very flippy" and "ultra straight" (275 ft); "very flippy, great for rollers or in the woods" (500 ft); "excellent for hyzer-flips that turn over" (425+ ft); "gets pretty flippy when worked in"; "angle control can be finicky … turn straight into the ground" (400+ ft); "feels like an 11 or even 10 speed"; "flies almost exactly like the Hades except better" (slow-arm, age 58); vulnerable in headwinds. Rodney Lane (Disc Golf Puttheads, Elite Z): "turn a little to the right before a nice forward fade carries it back to the center"; over 350 ft with minimal effort, "if you aren't throwing 400′ drives, you should probably give the Thrasher a try"; his co-reviewer reached about 450 ft with a tailwind and found it unsuitable in a headwind.
- sources:
  - {name: Discraft Thrasher team page (12/5/-3/2, stability 0.4), url: https://www.team.discraft.com/discs/thrasher, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Thrasher (mfr 12/5/-3/2; reviewers 11.7/5/-2.8/1.9), url: https://infinitediscs.com/discraft-thrasher, type: retailer, weight: 0.5}
  - {name: Infinite Discs ESP Thrasher (reviewers 11.8/5/-3/1.9; reviewer text), url: https://infinitediscs.com/Discraft-Thrasher/ESP, type: retailer, weight: 0.3}
  - {name: Disc Golf Puttheads Thrasher review (Rodney Lane, Elite Z), url: https://www.dgputtheads.com/discraft-thrasher-driver-review, type: community, weight: 0.3}
  - {name: Marshall Street Thrasher (12/5/-3/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=thrasher&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, both reviewer averages (turn within 0.2, fade within 0.1) and the review text agree on a very understable, easy-turning 12-speed with a mild finish. Reviewers say "flippy" where Discraft says "not flippy," but both describe a disc that turns over and finishes on a soft hyzer, which is what -3/2 says. Nothing supports moving it. No contradicting evidence found.
- **plasticVariance:** Sold in ESP, Z, Big Z, Z Glo, Jawbreaker and specials; Discraft prints one set of numbers. Reviewers say worked-in copies turn more. Not quantified. Do not average.
- **Linked:** Hades (12/6/-3/2) and Scorch (11/6/-2/2), which reviewers compare it to, and Flash (10/5/-2/3). The Atlas has Thrasher and Hades identical on turn/fade, as one reviewer's "flies almost exactly like the Hades" implies. Nothing moves.

## Gatekeeper — Westside Discs (id 152932074388)

- **Atlas now:** 4/5/0/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): VIP.
- **Manufacturer:** Westside 4/5/0/2 (collection page fetched; all plastics share the numbers; no stability label on the page). Copy: "The Gatekeeper wants to go right where you throw it, and it excels at holding angles. Even when thrown with power, the Gatekeeper stays true with a slight tendency to fade. With surprising high-speed stability and a comfortable rim, enlist the Gatekeeper to help you stay in the fairway." Copy and numbers agree. Infinite labels it "Overstable" and Marshall Street "Overstable"; Westside's own words are "straight," "slight tendency to fade." Same numbers, a notch looser label.
- **Retailer:** Infinite reviewer numbers 4.1/5/-0.1/1.9 (30 reviews, 4.7 stars); VIP page 4.1/5/0/1.9 (15 reviews). Exact on turn, fade within 0.1. Marshall Street 4/5/0/2 (baseline).
- **Community:** Infinite VIP-page reviewers (single-source; per-reviewer flight ratings range from fade 1 to 2): "point and shoot mid … excellent torque resistance … huge glide" (intermediate, rated 4/5/0/1.5); "a bit too much glide, or not enough fade. It is hard to get it to sit accurately" (advanced); "classic midrange" (professional, rated 4/5/0/1); "tons of glide with a small fade at the end" (professional); "will turn for you with anhyzer but fly in a straight line when flat"; "slices through the air, right on target" under power; compared to the Truth (beadless handling). Search-summary retailer text: VIP "has just a tad more stability and fade compared to other plastic types," and "stays so darn straight right until the end of flight" in premium plastics.
- sources:
  - {name: Westside Gatekeeper collection page (4/5/0/2), url: https://westsidediscs.com/collections/gatekeeper, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Gatekeeper (mfr 4/5/0/2; reviewers 4.1/5/-0.1/1.9), url: https://infinitediscs.com/westside-gatekeeper, type: retailer, weight: 0.5}
  - {name: Infinite Discs VIP Gatekeeper (reviewers 4.1/5/0/1.9; reviewer text), url: https://infinitediscs.com/Westside-Gatekeeper/VIP, type: retailer, weight: 0.3}
  - {name: Marshall Street Gatekeeper (4/5/0/2; not independent), url: https://www.marshallstreetdiscgolf.com/?cat_ids%5B%5D=975&post_type=product&s=gatekeeper&variation_toggle=1, type: retailer, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and both reviewer averages agree on 0/2 to within 0.1, and the text describes a straight, torque-resistant mid with a late, mild fade. Individual reviewers' fade ratings spread from 1 to 2 and average 1.9, so there is no direction to correct toward. The sample is 15–30 pooled ratings, so this reads "no contradicting evidence found."
- **plasticVariance:** Sold in VIP, VIP Hybrid, Tournament, VIP-Ice, BT Hybrid and others (15 at Infinite); Westside prints one set of numbers. Retailer text says VIP has "a tad more" stability and fade than other plastics. Not quantified. Do not average.
- **Linked:** Truth (5/5/-1/1), Warship (5/6/0/1) and Hex (5/5/-1/1), the mids reviewers or Westside's line sit near; the Atlas has the Gatekeeper at the overstable end of that group (fade 2). Nothing moves.

## Escape — Dynamic Discs (id 71af1b46dc9b)

- **Atlas now:** 9/5/-1/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Lucid.
- **Manufacturer:** Dynamic Discs 9/5/-1/2 (collection page fetched; no stability label on the page). Copy: "One word can summarize the Escape, glide … a fantastic disc for all levels of skill, power, and distance. It has such an easy release and the glide will keep this disc going even when less power is applied. It can fly on all angles and is even extremely useful as a roller." Recommended shots: "stable fairway shots, easy shot shaping, long turnovers at distance." **Label contradiction, same numbers:** Infinite "Overstable" (and describes it as "a stable/overstable driver"); Marshall Street "Stable"; Dynamic's own copy leans understable ("roller," "long turnovers").
- **Retailer:** Infinite reviewer numbers 9/5.2/-1/1.9 (199 reviews, 4.61 stars); Lucid page 9/5.2/-1/1.9 (84 reviews). Exact on turn and speed, fade within 0.1. Marshall Street 9/5/-1/2 (baseline, "Stable").
- **Community:** Infinite Lucid-page reviewers (single-source): beginners at 250–300 ft call it "slightly understable … always comes back nicely"; intermediates (300–400 ft) "pretty neutral … easy to control," "straight to overstable" out of the box and "more usable" once broken in, one "more understable than expected"; advanced throwers (400+ ft) say it becomes understable and "can do the prettiest S-curves" when beaten in, one "far more flippy than flight numbers suggest," a few "too flippy." Plastic note from the page: Lucid reportedly more stable than Fuzion or BioFuzion; "most reviewers confirm reliable 1.5–2 fade." Corey (Disc Golf Dash, moderate power, typically under 150 ft from the basket): "a slight amount of turn (-1) before a consistent but honest fade at the end (2)," flips up a little as it breaks in.
- sources:
  - {name: Dynamic Discs Escape collection page (9/5/-1/2), url: https://www.dynamicdiscs.com/collections/dynamic-discs-escape, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Escape (mfr 9/5/-1/2; reviewers 9/5.2/-1/1.9), url: https://infinitediscs.com/dynamic-discs-escape, type: retailer, weight: 0.5}
  - {name: Infinite Discs Lucid Escape (reviewers 9/5.2/-1/1.9; reviewer text), url: https://infinitediscs.com/dynamic-discs-escape/lucid, type: retailer, weight: 0.3}
  - {name: Disc Golf Dash Escape review (Corey), url: https://discgolfdash.com/disc-golf-dash-review-dynamic-discs-escape/, type: community, weight: 0.2}
  - {name: Marshall Street Escape (9/5/-1/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=escape&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and both reviewer averages (199 and 84 ratings) agree on -1/2 to within 0.1, and the readable text is split by arm speed and wear in both directions (neutral to overstable new, flippy when beaten in), which is the spread a -1/2 fairway driver is expected to show. Nothing supports moving it. No contradicting evidence found.
- **plasticVariance:** Real, per reviewers: Lucid reads more stable than Fuzion or BioFuzion; beat-in copies of any plastic turn more. Sold in 30+ variants; Dynamic prints one set of numbers. Not quantified. Do not average.
- **Linked:** Lots (9/5/-1/2, identical numbers), Krait (11/5/-1/2), Vandal (9/5/-1.5/2) and Maverick (7/4/-1.5/2), the Dynamic neighbours, and Trail (10/5/-1/1). Nothing in this batch separates Escape and Lots; no change.

## MD5 (new) — Discmania (id d84293d8328b)

- **Atlas now:** 5/3/0/4 (source: verified override, Discmania collection page, checked 2026-09-23). **Proposed turn/fade:** none. Matches; evidence thin. Reference plastic (assumed most-thrown, not verified): C-Line.
- **Manufacturer:** Discmania 5/3/0/4 (collection page fetched; also the S-Line MD5 page). Copy: "One of Gannon Buhr's absolute favorites, MD5 is the steadfast, trustworthy midrange from the Originals line that you can rely on to get the job done"; the S-Line page calls it "our most overstable Originals midrange," "famous for its overstable and accurate flight," suited to "overstable approach shots, flex shots, sidearm shots." Neither page discusses a number change between versions. Retailer text (search summary): Innova-made MD5s were beaded and chunky, the Discmania-made ones "feel much more like a modern midrange" with a rim "comparable to a 5 speed Zone," and "the fade is more forward-pushing than dumpy." The 2023 approval is a new Discmania-made mold, not a renumbering. Copy and numbers agree.
- **Retailer:** Infinite "Very Overstable"; reviewer numbers 5/3.1/0/3.9 (26 reviews, 4.52 stars); C-Line page 5/3/0/4 (17 reviews). Exact within 0.1. DiscMetrics: 5/3/0/4, "Very Overstable," 135 reviews (templated; not used). Marshall Street lists the MD5 at 5/3/0/4 (baseline).
- **Community:** Infinite C-Line reviewers (nine, single-source, mostly intermediate; one states 200 ft): "no high speed turn and a strong fade" (beginner); "overstable but workable"; "dumpy, but controllable and predictable … comparable to a Firebird"; "steep drop upon velocity loss rather than smooth fade"; "less stable than Justice but controllable" (200 ft); "more aggressive fade at the end … more overstable than the Mortar"; "slightly less stable than expected" (rated it 3.5 fade); "noticeably wider rim, giving it more distance." Two reviewers say it fades somewhat less than the number or less than a Justice; none says it turns. Generic pages (discountdiscgolf, bestdiscgolfdiscs) repeat "unwavering stability" and "true even in headwinds" and were given no weight.
- sources:
  - {name: Discmania MD5 collection page (5/3/0/4), url: https://www.discmania.net/collections/md5, type: manufacturer, weight: 1.0}
  - {name: Discmania S-Line MD5 page ("most overstable Originals midrange"), url: https://www.discmania.net/products/s-line-md5, type: manufacturer, weight: 0.6}
  - {name: Infinite Discs MD5 (mfr 5/3/0/4; reviewers 5/3.1/0/3.9), url: https://infinitediscs.com/discmania-md5, type: retailer, weight: 0.5}
  - {name: Infinite Discs C-Line MD5 (reviewers 5/3/0/4; reviewer text), url: https://infinitediscs.com/discmania-md5/c-line, type: retailer, weight: 0.3}
  - {name: DiscMetrics MD5 (aggregator, templated), url: https://discmetrics.com/discs/discmania/md5, type: retailer, weight: 0.1}
- **confidence:** 0.6
- **consensusNote:** Manufacturer, the override, and both reviewer averages agree on 0/4 (turn exact, fade within 0.1), and the readable text describes a dumpy-to-forward fade with no turn. Two "a bit less than the number" comments are single remarks and the averages do not back them. The sample is 26 pooled ratings and about nine comments, so this reads "no contradicting evidence found."
- **plasticVariance:** Sold in C-Line, S-Line, P-Line and others; Discmania prints one set of numbers. Innova-made (beaded) and Discmania-made copies differ in feel and flight per retailer text; the Atlas entry is the current Discmania-made mold. Not quantified. Do not average.
- **Linked:** MD3 (new) (Atlas 5/5/0/1; the batch 5 open candidate on its fade is unchanged by this batch) and MD4 (5/4/0/3). The Atlas keeps the Discmania ordering MD3 < MD4 < MD5 on fade (1 < 3 < 4). The Atlas also carries a separate legacy "MD5" at 5/3/0/4; no evidence here separates it from this entry. Nothing moves.

## Comet — Discraft (id 07e4d9e1c005)

- **Atlas now:** 4/5/-2/1 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): ESP (Z and Big Z are the other common ones).
- **Manufacturer:** Discraft 4/5/-2/1 (team.discraft.com page fetched). Copy: "If you own only one disc, this is it. The legendary Comet™ is a super accurate, straight flying approach disc." **Copy-vs-number tension:** "straight flying" against a -2 turn; Infinite's description (quoting Discraft) says "a very popular straight-flying, slightly understable midrange disc." Infinite also says Discraft rates it 0 on its stability scale. (See the spot-check note in the evidence limits about the -2 the fetch printed as a "stability rating.") Marshall Street and Infinite label it "Understable."
- **Retailer:** Infinite reviewer numbers 4/5.1/-1.8/1 (126 reviews, 4.59 stars); Big Z page 4/5.1/-1.9/1 (15 reviews). Turn within 0.2, fade exact. Marshall Street 4/5/-2/1 (baseline).
- **Community:** Infinite Big Z-page reviewers (single-source): "ultra straight … the most reliable, workable mid" (advanced, 325 ft, flies "almost as far as nine speeds"); "suuuper glidey and can hold anhyzer lines like no other" (advanced); 350–370 ft hyzer flips, "gets blown off course easily" in wind; "does not really turn much … flies straight with very light fade" (intermediate, 325 ft, rated it 4/6/-1/1); "very sensitive to the angles that it's released at … will turn over, crash, and cut roll" with a poor release; "straight, keeps its line … tiniest bit of fade" (under one year). Broden (Inside the Circle): turn -2, fade 1, "an extremely straight flying disc for players with slower arm speeds," faster arms can hyzer-flip it but "there are better understable options for turnover shots." Search-summary retailer text: "does not really turn much but flips up from a slight hyzer."
- sources:
  - {name: Discraft Comet team page (4/5/-2/1), url: https://www.team.discraft.com/discs/comet, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Comet (mfr 4/5/-2/1; reviewers 4/5.1/-1.8/1), url: https://infinitediscs.com/discraft-comet, type: retailer, weight: 0.5}
  - {name: Infinite Discs Big Z Comet (reviewers 4/5.1/-1.9/1; reviewer text), url: https://infinitediscs.com/Discraft-Comet/Big-Z, type: retailer, weight: 0.3}
  - {name: Inside the Circle, best Discraft mid-range (Broden), url: https://www.insidethecircledg.com/post/what-is-the-best-discraft-mid-range, type: community, weight: 0.3}
  - {name: Marshall Street Comet (4/5/-2/1; not independent), url: https://www.marshallstreetdiscgolf.com/?s=comet&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and both reviewer averages agree on -2/1 to within 0.2, and the text describes the shape the numbers say: a very straight disc for slow-to-moderate arms that flips up from hyzer and turns over with a poor release. The "straight flying" wording is Discraft's description of the result for typical arms; the -2 is the number. Nothing supports moving it.
- **plasticVariance:** ESP, Z, Big Z and others; Discraft prints one set of numbers. No spread found in what I read. Do not average.
- **Linked:** Svea (5/6/-1/0), Gote (4/5/0/1), Claymore (5/5/-1/1) and Cigarra (7/6/-1/2); the Atlas Comet is the most understable of that group, consistent with reviewers' "slower arms" framing. Nothing moves.

## PA3 — Prodigy (id 99fb23ea773e)

- **Atlas now:** 3/3/0/1 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Soft watch noted below. Reference plastic: 400 (Prodigy calls it its most popular plastic; see the A1 entry in batch 7).
- **Manufacturer:** Prodigy 3/3/0/1, "Stable" (400 plastic page and the collection page fetched). Copy: "Aim straight at the basket and nail your putts and approaches with a laser straight, stable flight path. The PA3 features a beaded rim, and is a favorite for disc golfers of all skill levels"; the Marshall Street 400 page adds "holds the line you give it, finishes with a gentle fade, and handles power without turning over." Copy and numbers agree. **Stale-retailer check (the batch 7 watch): not found.** Prodigy, Marshall Street, Infinite, Gotta Go Gotta Throw and Skyline all print 3/3/0/1; the series neighbours match the Atlas too (see the evidence limits). Gotta Go Gotta Throw labels it "overstable" and Disc Golf Puttheads' templated chart shows glide 4, both wording or templating rather than a different number set.
- **Retailer:** Infinite listing 3/3/0/1, "Stable"; reviewer numbers 3/3.7/0/1.1 (90 reviews, 4.73 stars); 400 page 3/4/0/1 (3 ratings, too few to use). Turn exact, fade within 0.1; glide reads 0.7 high (outside the turn/fade scope). Marshall Street 3/3/0/1 (baseline).
- **Community:** Infinite 400-page reviewers (three, single-source): "absolutely true to the numbers … very straight with just the slightest finish as it slows" (beginner); "very torque resistant … won't turn over"; "surprisingly overstable, like how a P2 is overstable" (intermediate, about 275 ft on flex lines). Chris Bawden (Disc Golf Puttheads, 200 plastic): "a straight putter with a strong fade," best under 225 ft and on a slight hyzer. Disc Golf Reviewer (200 plastic): "a straight flyer with a slightly overstable finish … faded harder than I expected." Skyline spotlight (arm-speed brackets): about 180–240 ft "straight with a small, predictable fade," 300+ ft "stays straight longer and finishes forward."
- sources:
  - {name: Prodigy PA-3 400 plastic page (3/3/0/1, "Stable"), url: https://prodigydisc.com/products/prodigy-pa3-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Prodigy PA-3 collection page (3/3/0/1), url: https://prodigydisc.com/collections/pa-3-putt-approach-disc, type: manufacturer, weight: 0.6}
  - {name: Infinite Discs PA-3 (mfr 3/3/0/1; reviewers 3/3.7/0/1.1), url: https://infinitediscs.com/prodigy-pa-3, type: retailer, weight: 0.5}
  - {name: Infinite Discs 400 PA-3 (three reviewers; reviewer text), url: https://infinitediscs.com/Prodigy-PA-3/400, type: retailer, weight: 0.2}
  - {name: Disc Golf Puttheads PA3 review (Chris Bawden, 200), url: https://www.dgputtheads.com/prodigy-pa3-review, type: community, weight: 0.3}
  - {name: Skyline PA-3 spotlight (arm-speed brackets), url: https://skylinediscs.com/blogs/disc-spotlights/disc-spotlight-prodigy-pa-3, type: retailer, weight: 0.2}
  - {name: Disc Golf Reviewer PA-3 vs Claws recap (200 plastic), url: https://discgolfreviewer.com/prodigy-pa-3-vs-yikun-claws/, type: community, weight: 0.2}
  - {name: Marshall Street PA3 400 (3/3/0/1; not independent), url: https://www.marshallstreetdiscgolf.com/product/prodigy-pa3-400, type: retailer, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** Manufacturer, Marshall Street and the Infinite average (fade 1.1 on 90 ratings) agree on 0/1. **Soft watch, not a candidate:** three readable reviewers (Bawden, Disc Golf Reviewer, one Infinite reviewer) say the fade is stronger than "gentle," while the Skyline brackets and one beginner say it matches. The sample is five readable comments, two of them on 200 plastic, and the Infinite average does not move, so this is recorded only. If a firmer read ever supports it, fade 1 → 1.5 would be the one to consider (|Δ| 0.5, not gated).
- **plasticVariance:** Sold in 200, 300, 400, 500, 750, Fractal, Glow and others (21 at Infinite); Prodigy prints one set of numbers. The two "stronger fade" comments are on 200 plastic, the one that beats in quickest. Not quantified. Do not average.
- **Linked:** PA1 (3/3/0/2.5), PA2 (3/3/0/2), PA4 (3/3/-1/1), each matched to Prodigy's pages; the Atlas keeps the series order PA1 > PA2 > PA3 on fade. P2 (a reviewer's comparison disc) was not re-read. Nothing moves.

## Lots — Kastaplast (id ab47944f466f)

- **Atlas now:** 9/5/-1/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Soft watch noted below. Reference plastic (assumed most-thrown): K1.
- **Manufacturer:** Kastaplast 9/5/-1/2, "Stable fairway driver" (K1 page fetched). Copy: "Lots in Swedish is a pilot that leads a ship through difficult waters and narrow passages … a Lots is a predictable line-holder"; suitable for "straight shots, hyzers and anhyzers. Multi-purpose." Infinite: "a straight-flying, highly workable, fairway driver" that will "hold any line you put it on." Copy and numbers agree.
- **Retailer:** Infinite reviewer numbers 9/5/-0.9/1.9 (29 reviews, 4.74 stars); the K1 page reads the same (29 reviews). Turn within 0.1, fade within 0.1. Marshall Street 9/5/-1/2 (baseline, "Stable").
- **Community:** Infinite K1-page reviewers (single-source; 250–400+ ft): "slightly overstable" with accurate numbers (advanced, 350 ft); "just slightly less stable than the Stål with a bit more glide" (advanced); "workhorse stable fairway … nice little turn to get mega distance"; "mini Destroyer flight pattern" (375 ft); "super straight with a dependable finish … very glidey" (300 ft); **"-1 turn is understated … will flip to flat and move right quite a bit" (325 ft, the same reviewer who said the Svea's -1 undersells it)**; "great distance driver that even slower arm speeds will get a lot out of." Page summary: fade 1.5–2.0 in most descriptions and "some variability between production runs regarding overstability." Search-summary retailer text: some reviewers say more understable than expected, others that the turn is understated.
- sources:
  - {name: Kastaplast K1 Lots page (9/5/-1/2, "Stable fairway driver"), url: https://www.kastaplast.com/en-us/products/k1-lots, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Lots (mfr 9/5/-1/2; reviewers 9/5/-0.9/1.9), url: https://infinitediscs.com/kastaplast-lots, type: retailer, weight: 0.5}
  - {name: Infinite Discs K1 Lots (reviewers 9/5/-0.9/1.9; reviewer text), url: https://infinitediscs.com/kastaplast-lots/k1, type: retailer, weight: 0.3}
  - {name: Marshall Street K1 Lots (9/5/-1/2; not independent), url: https://www.marshallstreetdiscgolf.com/product/k1-lots, type: retailer, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and the reviewer averages agree on -1/2 to within 0.1; the text spans "slightly overstable" to "flips to flat and moves right," which is a stability-by-arm-speed spread around -1/2, not an offset. **Soft watch, not a candidate:** one reviewer says -1 undersells it, but they said the same of the Svea, and the average (-0.9) points the other way. Recorded only.
- **plasticVariance:** K1, K1 Glow, K1 Grind, K1 Hard, K1 Line; reviewers mention production-run variability in overstability. No quantified spread. Do not average.
- **Linked:** Escape (9/5/-1/2, identical numbers), Krait, Trail (10/5/-1/1), Svea (5/6/-1/0, which carries the same single-reviewer comment) and Falk (9/6/-2/1). A reviewer places the Lots slightly below the Stål (not in the featured list; not re-read). Nothing moves.

## Fury — Latitude 64 (id c1402fecca5f)

- **Atlas now:** 9/6/-2/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Evidence too thin to call. **Open candidate: fade 2 → 1.5** (|Δ| = 0.5, below the review gate). Reference plastic (assumed most-thrown): Opto. **Status: out of production** (Infinite lists it as such, with 12 plastics previously sold), so any change is low priority.
- **Manufacturer:** Latitude 64 9/6/-2/2, "Understable" (collection page fetched; Opto product page via a retailer reads the same). Copy: "The Fury is a control driver in our beginner friendly segment. It is understable, glidey and a great step up for players that have used our Diamond, and is in need of a bit more stability. It is also a great roller choice for more experienced players." Infinite and the Opto page quote Latitude: "very similar to the popular and highly rated Saint, but slightly more understable," "a cross between the River and the Saint," "a touch more understable than the Saint but still carries the same glide." Copy and numbers agree. For scale, the Atlas Saint is 9/7/-1/2: the Fury shares its fade and has one more point of turn, which is what "slightly more understable" would mean on turn alone.
- **Retailer:** Infinite "Understable"; reviewer numbers 8.9/6.5/-2.1/1.3 (69 reviews, 4.36 stars); Opto page 8.9/6.5/-2/1.4 (43 reviews); Gold Line page 9/6.3/-2.1/1.6 (15 reviews). **Turn matches** (within 0.1). **Fade runs 0.4–0.7 under the published 2 on all three pages**, the same direction on both plastics I could read. Glide reads 0.3–0.5 high (outside scope). Marshall Street 9/6/-2/2 (baseline, "Very Understable").
- **Community:** Infinite Opto-page reviewers (single-source): "flies more understable than numbers indicate" (advanced, 450+ ft); "between River and Saint … consistent hyzer flips with gentle turn-back"; "fly and finish straight with good glide … slight fade at end" (intermediate); "turned over way too much" or "straight to stable" (inconsistent); "very understable … workable" and "touch disc"; "ridiculously understable … utility driver" (beginner); "slippery in humidity"; "too flippy initially." Gold Line page: per-reviewer ratings of fade mostly 0.5–1 (one 2), several say "hyzerflips like a dream," "flat throws drift right while hyzer flips produce dead-straight tunnel shots," "heavy power throws cause continued turning," one 400+ ft thrower rates it 9/7/-3/0.5, one beginner moved from 9/6/-1/2 out of the box to a very understable disc once broken in. Search-summary DGCR snippet (not read): "turned similar to a Gold Line Saint but with much less fade at the end." No reviewer rates the fade above 2.
- sources:
  - {name: Latitude 64 Fury collection page (9/6/-2/2, understable), url: https://latitude64.com/collections/fury, type: manufacturer, weight: 1.0}
  - {name: Rocket Discs Opto Fury (Latitude copy: "a cross between the River and the Saint"), url: https://rocketdiscs.com/latitude-64-fury/opto, type: retailer, weight: 0.3}
  - {name: Infinite Discs Fury (mfr 9/6/-2/2; reviewers 8.9/6.5/-2.1/1.3), url: https://infinitediscs.com/latitude-64-fury, type: retailer, weight: 0.5}
  - {name: Infinite Discs Opto Fury (reviewers 8.9/6.5/-2/1.4; reviewer text), url: https://infinitediscs.com/Latitude-64-Fury/Opto, type: retailer, weight: 0.3}
  - {name: Infinite Discs Gold Line Fury (reviewers 9/6.3/-2.1/1.6; reviewer text), url: https://infinitediscs.com/Latitude-64-Fury/Gold-Line, type: retailer, weight: 0.3}
  - {name: DGCR "Latitude 64 Fury" and "Saint vs. Fury vs. River" threads (search titles, not read), url: https://www.dgcoursereview.com/threads/saint-vs-fury-vs-river.105843/, type: community, weight: 0.1}
- **confidence:** 0.5
- **consensusNote:** Manufacturer says fade 2, but every reviewer average on every page I could read says 1.3–1.6, in two different plastics, and the text and per-reviewer ratings lean the same way (fade 0.5–1 for several, a few at 2, none above). The pooled averages are anchored by the displayed 2, which if anything pulls them up, so the gap is not an anchoring artifact. Held back because Latitude's own number and copy say 2, the sample is 15–69 pooled ratings with no named reviewer and no stated arm speed beyond distance bands, the single most comparable source (a DGCR snippet) was not read, and the disc is out of production. If you want observed flight over the printed number, **fade 1.5 is the single candidate** (the averages sit nearer 1.4). It needs a named reviewer with an arm speed, or an Opto-only reading at volume, to become a proposal. **Linked check, review as a set if it moves:** Saint (Atlas 9/7/-1/2, which the Fury's copy anchors on; the Fury's fade would then sit below the Saint's), River (7/7/-1/1), Diamond (8/6/-3/1), Jade (9/6/-2/1, which has the same turn and a lower fade) and Grace (11/6/-1/2). A Fury at -2/1.5 would sit between Jade and the Saint, which matches "a cross between the River and the Saint."
- **plasticVariance:** Sold in Opto, Opto Air, Opto Orbit, Gold Line, Gold Line Burst, Retro, Hybrid L64 and others. Reviewer text: Opto described as slippery and flippy initially; a Gold Line reviewer saw the flight change after break-in. Opto and Gold Line averages agree on fade (1.4 vs 1.6). Not quantified. Do not average.

## Krait — Innova (id 2f95f2b1920f)

- **Atlas now:** 11/5/-1/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic: Star (Innova drivers, per the policy); the Star page was not readable, so the Champion page stands in.
- **Manufacturer:** Innova 11/5/-1/2, "Stable" (Infinite lists the label; Innova's page prints no label). Copy: "The Krait's unique ability to achieve a mellow low speed fade, while simultaneously resisting high speed turn makes it a perfect choice for long range shot shaping off the tee." Infinite's description: "one of the straightest flying distance drivers made by Innova," released fall 2012. Copy and numbers agree.
- **Retailer:** Infinite reviewer numbers 11/5/-1/2 (57 ratings, 4.27 stars), exact; Champion page 10.9/5/-1/2 (28 ratings). Marshall Street 11/5/-1/2 (baseline, "Stable").
- **Community:** Infinite Champion-page reviewers (single-source): "I trust this disc more than any distance driver" for controlled 350-ft shots (advanced); "straighter flying distance driver … best suited for those in the 350–400 foot range" (professional); "very straight with minimal fade" and "high speed stability" (professional); "very much like a Wraith, but … more controlled" (professional); "a middle ground between Beast and Destroyer"; "long little bit of turn with a slight fade" (beginner); "very dependable S-curve" at lighter weights; one beginner's disc "immediately hyzers out … most overstable disc in my bag (NOT BY DESIGN)," another "never achieved desired turn." Search-summary retailer text: "a straighter Wraith."
- sources:
  - {name: Innova Krait page (11/5/-1/2), url: https://www.innovadiscs.com/disc/krait/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Krait (mfr 11/5/-1/2; reviewers 11/5/-1/2), url: https://infinitediscs.com/innova-krait, type: retailer, weight: 0.5}
  - {name: Infinite Discs Champion Krait (reviewers 10.9/5/-1/2; reviewer text), url: https://infinitediscs.com/Innova-Krait/Champion, type: retailer, weight: 0.3}
  - {name: Marshall Street Krait (11/5/-1/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=krait&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and both reviewer averages (57 and 28 ratings) agree exactly on -1/2, and the readable text describes a straight, controllable driver with a mild fade that resists high-speed turn, which is Innova's own copy. The two outliers (one over-stable disc, one that never turned) are the usual run-to-run and arm-speed spread. Nothing supports moving it. The reference-plastic page (Star) was not read, so this reads "no contradicting evidence found."
- **plasticVariance:** Sold in Star, GStar, Champion, Blizzard Champion and specials; Innova prints one set of numbers. One reviewer calls a Champion copy unusually overstable. Do not average.
- **Linked:** Wraith (11/5/-1/3), which professionals compare it to ("a straighter Wraith"), Beast and Destroyer (the reviewer's "middle ground"), and Sergeant/Surge at the same speed. The Atlas has the Krait with the Wraith's turn and one point less fade, as described. Nothing moves.

## Trespass — Dynamic Discs (id bcb60eb9587a)

- **Atlas now:** 12/5/-0.5/3 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Evidence too thin to call. **Open candidate: turn -0.5 → -1** (|Δ| = 0.5, below the review gate). Reference plastic (assumed most-thrown, not verified): Lucid or Fuzion.
- **Manufacturer:** Dynamic Discs 12/5/-0.5/3 (collection page fetched; no stability label printed on the page). Copy: "The Trespass is the high-speed driver for the masses. It is very neutral in its flight, not being too stable or flipping over. The wide rim is able to take all the power that you can throw at it and just keep gliding to new distances." Intended uses: "controlled distance shots, versatile stability for full flights, slower arms trying out distance driver shots." **Contradiction in the retail layer, same numbers:** Infinite labels it "Overstable" and quotes "a fast, overstable distance driver … a staple in any trilogy fan's bags as that Destroyer-esque disc"; Marshall Street "Stable"; Disc Golf Puttheads' templated chart "stable-to-slightly-understable depending on plastic." Dynamic's own word is "neutral." The numbers are the same in all of them.
- **Retailer:** Infinite reviewer numbers 11.9/5/-1.1/2.8 (177 reviews, 4.52 stars); **Lucid page 11.9/5.1/-1.1/2.8 (71 reviews); Fuzion page 11.9/5/-1.1/2.8 (38 reviews).** All three agree to the tenth: turn 0.6 more understable than published, fade 0.2 lower. Marshall Street 12/5/-0.5/3 (baseline, "Stable").
- **Community:** Infinite Lucid-page reviewers (single-source): intermediates (300–350 ft) "fairly neutral with reliable fade, though notably less stable than the flight numbers suggest," "more like a beat in Wraith or possibly similar to a very lightweight Destroyer," or "flies true to its numbers … beautiful S curve"; high-power throwers (400+ ft) "nowhere near as stable as the numbers suggest," "turns more and doesn't finish as hard as they suggest," "would rate this disc as an 11 or even 10 speed"; lower power (250–300 ft) "a good flip to flat kind of disc," "good choice to step up to distance drivers." Fuzion-page reviewers: "way more understable" than comparable discs like the Raider (advanced), "beats in quickly to increased turn … relatively understable after a month," "flippier than flight numbers suggest," "flies like a beat-in Star Destroyer," "easier to throw than a Destroyer," "seasoned Wraith" (multiple), usable as a first distance driver only with about 325+ ft arms. Search-summary retailer text, mixed: "a touch more stable than the Destroyer out of the box," "a good bit less overstable than the Destroyer," "a little less stability, almost like a beat-in Destroyer"; **DGCR "Trespass stability" and "Trespass vs. Destroyer" threads exist and were not readable.**
- sources:
  - {name: Dynamic Discs Trespass collection page (12/5/-0.5/3, "very neutral"), url: https://www.dynamicdiscs.com/collections/dynamic-discs-trespass, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Trespass (mfr 12/5/-0.5/3; reviewers 11.9/5/-1.1/2.8), url: https://infinitediscs.com/dynamic-discs-trespass, type: retailer, weight: 0.5}
  - {name: Infinite Discs Lucid Trespass (reviewers 11.9/5.1/-1.1/2.8; reviewer text), url: https://infinitediscs.com/dynamic-discs-trespass/lucid, type: retailer, weight: 0.3}
  - {name: Infinite Discs Fuzion Trespass (reviewers 11.9/5/-1.1/2.8; reviewer text), url: https://infinitediscs.com/dynamic-discs-trespass/fuzion, type: retailer, weight: 0.3}
  - {name: Disc Golf Puttheads Trespass flight chart (templated), url: https://www.dgputtheads.com/flight-charts/trespass, type: retailer, weight: 0.1}
  - {name: DGCR "Trespass stability" and "Trespass vs. Destroyer" threads (search titles, not read), url: https://www.dgcoursereview.com/threads/trespass-stability.101493/, type: community, weight: 0.1}
- **confidence:** 0.5
- **consensusNote:** The mold-level average and both plastic-level averages say -1.1 turn and 2.8 fade, and the text says the same from several arm-speed bands: more turn than printed, with "seasoned Wraith" or "beat-in Destroyer" as the recurring comparison (the Atlas Wraith is -1/3, so a Trespass at -1/2.8 would read as a Wraith). Reviewers who throw 400+ ft say "nowhere near as stable" and "an 11 or even 10 speed." Because Infinite displays -0.5, anchoring would pull the averages toward -0.5; they land at -1.1 instead. Held back because Dynamic's number and copy ("very neutral") say -0.5 on every plastic, the averages pool plastics (a reviewer notes that Lucid is steadier than the base blends, so the spread is real), retailer text is mixed on the Destroyer comparison, and the DGCR threads that probably settle it were not readable. If you want observed flight over the printed number, **turn -0.5 → -1 is the single candidate** (fade 2.8 is too close to 3 to name). It needs a named reviewer with a stated arm speed or a Fuzion-versus-Lucid split to become a proposal, and **it is the strongest open candidate in the batch**. **Linked check, review as a set if it moves:** Raider (Atlas 13/5/-0.5/3; a Fuzion reviewer calls the Trespass "way more understable" than it, so a Trespass at -1 would sit on the understable side of the Raider as that reviewer describes), Destroyer (Atlas 12/5/-0.5/3.5 after the override, unchanged: the Trespass would then be more understable and lower-fade than it, which matches the retailer text saying the Destroyer is "a good bit more overstable"), Wraith (11/5/-1/3), Sheriff (13/5/-1/2), Defender (13/5/0/3) and Sergeant (11/4/0/2.5).
- **plasticVariance:** Sold in 21 variants (Lucid, Fuzion, Prime, BioFuzion, Moonshine, Chameleon and others). Reviewers: base blends beat in fast and turn more; Fuzion "one of the fastest breaking in"; Lucid steadier; Dynamic prints one set of numbers. The Lucid and Fuzion averages are identical (-1.1/2.8), so the plastics I could read do not separate. Not quantified. Do not average.

---

## Batch 8 report (for Freddy)

**Proposed changes (0).** No catalog lag: all ten Atlas numbers equal the current manufacturer pages.

**Open candidates, none proposed (2), both not gated:**
- **Trespass turn -0.5 → -1** (|Δ| 0.5). The strongest case so far from reviewer data alone: Infinite's mold-level, Lucid and Fuzion averages all read -1.1/2.8 (177, 71 and 38 ratings), moving away from the displayed -0.5, and reviewers from 300 to 400+ ft say it flies "like a seasoned Wraith" or "beat-in Destroyer" and "nowhere near as stable as the numbers suggest." Held back: Dynamic's number and "very neutral" copy say -0.5, the averages pool plastics, retailer text on the Destroyer comparison is mixed, and the DGCR threads were unreadable. Review Raider, Destroyer, Wraith, Sheriff and Sergeant with it if it moves.
- **Fury fade 2 → 1.5** (|Δ| 0.5). Three Infinite averages read fade 1.3–1.6 (69, 43 and 15 ratings) on a disc Latitude prints at 2; turn matches. No named reviewer, no measured arm speed, DGCR unread, and the disc is out of production, so low priority. Review Saint, River, Jade and Diamond with it if it moves.

**Soft watches (not candidates):**
- **PA3 fade 1 → 1.5 (|Δ| 0.5):** three readable reviewers say a firmer fade than "gentle," two of them on 200 plastic; the 90-rating Infinite average is 1.1.
- **Lots turn:** the same reviewer who said the Svea's -1 undersells it (batch 7) says it of the Lots; the average is -0.9.

**Confirmed as-is (8):** Thrasher, Escape, Comet, Krait (0.7); Gatekeeper, Lots (0.65); PA3, MD5 (new) (0.6). Confirmations mean "no contradicting evidence found," not independent community verification. MD5 (new) and PA3 are the thinnest (26 pooled ratings plus nine comments; five readable PA3 comments).

**Too thin to call (2):** Trespass, Fury (above).

**PA3 stale-retailer watch:** checked and not found. Prodigy, Marshall Street, Infinite and others all print 3/3/0/1, and PA1, PA2 and PA4 match the Atlas on Prodigy's own pages. No sign of an A-series-style renumbering.

**Spot-checks needed before any override source note:** the Comet's Discraft stability rating (the fetch printed -2; Infinite says 0), and any quote taken via the summarizing fetch.

**Process notes for the next batch**

- Next ten by `featured.js` order after Trespass: Voodoo, Omen, Savant, Servo, PD2 (new), Challenger, Wedge, Ruby, Undertaker, PD (new). Several are Discmania "(new)" molds (PD2, PD) that may share the MD3/MD5 "new Discmania-made version" history; check Discmania's own page first, and check whether the Atlas value comes from a verified override rather than Marshall Street.
- **Open-candidate running list (nothing applied):** Boss and Tern were closed by policy in batch 5. Still open: **Trident fade 3 → 3.5, D2 turn 0 → -0.5, MD3 (new) fade (Atlas 1 vs reviewers about 2), Tesla turn -1 → -0.5, Trespass turn -0.5 → -1, Fury fade 2 → 1.5**; gated and awaiting your call: **Luna fade 3 → 2, Gator fade 3 → 4**. Soft watches: Falk turn, Svea turn, A1/A2 spacing, PA3 fade, Lots turn.
- **Linked sets re-checked this batch with nothing to propose beyond the two open candidates:** Thrasher/Hades/Scorch/Flash, Gatekeeper/Truth/Warship/Hex, Escape/Lots/Krait/Trail/Vandal/Maverick, MD5/MD4/MD3, Comet/Svea/Gote/Claymore/Cigarra, PA1/PA2/PA3/PA4, Fury/Saint/River/Diamond/Jade/Grace, Trespass/Raider/Destroyer/Wraith/Sheriff/Defender/Sergeant. The Destroyer's Atlas adjustment is unaffected unless the Trespass is moved on its own merits.
- Reachable manufacturer paths this batch: `www.team.discraft.com/discs/<mold>` (Thrasher, Comet), `westsidediscs.com/collections/<mold>`, `dynamicdiscs.com/collections/dynamic-discs-<mold>`, `discmania.net/collections/md5` and `/products/s-line-md5`, `prodigydisc.com/products/prodigy-pa<n>-400-plastic` and `/collections/pa-3-putt-approach-disc`, `kastaplast.com/en-us/products/k1-lots`, `latitude64.com/collections/fury`, `innovadiscs.com/disc/krait/`. Infinite slugs: PA3 is `/prodigy-pa-3` (with a dash; `/prodigy-pa3` 302s) and `/Prodigy-PA-3/400`; Fury uses a capitalized `/Latitude-64-Fury/Opto` and `/Gold-Line`; Trespass `/dynamic-discs-trespass/{lucid,fuzion}`; Escape `/dynamic-discs-escape/lucid`; Comet `/Discraft-Comet/Big-Z`; Thrasher `/Discraft-Thrasher/ESP`; Gatekeeper `/Westside-Gatekeeper/VIP`; Lots `/kastaplast-lots/k1`; MD5 `/discmania-md5/c-line`; Krait `/Innova-Krait/Champion` (the Star page 302'd).
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access reads the two Trespass threads first (stability, and Trespass vs. Destroyer), then the Fury threads, then still the Tesla and Gator items.

---

# Batch 9 (Plan 10, Phase 2)

Researched October 3, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (already up to date).

Molds covered: Voodoo, Omen, Savant, Servo, PD2 (new), Challenger, Wedge, Ruby, Undertaker, PD (new) (the next ten by `public/featured.js` order after Trespass).

## Batch 9 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Savant | 9/5/-1/2 | none | Confirmed as-is | 0.7 |
| Servo | 6.5/5/-1/2 | none | Confirmed as-is | 0.7 |
| Undertaker | 9/5/-1/2 | none | Confirmed as-is | 0.7 |
| Challenger | 2/3/0/2 | none | Confirmed as-is | 0.7 |
| Wedge | 3.5/3/-3/1 | none | Confirmed as-is | 0.7 |
| Omen | 9/4/0/4 | none | Confirmed as-is (manufacturer page not reachable; copy via retailers) | 0.65 |
| PD (new) | 10/4/0/3 | none | Confirmed as-is (retailer pools mix old and new) | 0.65 |
| PD2 (new) | 12/4/0/4 | none | Confirmed as-is (retailer pools mix old and new; soft watch on fade) | 0.6 |
| Voodoo | 2/3/0/0 | none | Confirmed as-is (soft watch on fade; see the floor effect below) | 0.6 |
| Ruby | 3/5/-3/1 | none | **Too thin to call (no contradiction, little evidence)** | 0.5 |

**No changes proposed. No open candidates added. Nine confirmed, one too thin (Ruby), three soft watches (Voodoo fade, PD2 fade, PD2 against Enforcer).** No Luna/Gator-style catalog lag: all ten Atlas numbers equal the current manufacturer numbers (see the diff note below). The two Discmania "(new)" molds are the structural story of the batch: Infinite's PD and PD2 pages are keyed to the *legacy* approvals (their URLs end in "-Freak" and "-Chaos", the names of the 2008 and 2010 approvals the Atlas also carries with no flight numbers), so their 98- and 64-rating pools cannot be assigned to the new molds. They were used as coarse evidence only.

## Evidence limits — batch 9

Same tooling limits as earlier batches; see the pilot section. Specific to this batch:

- **Diff against `flights.json` / `data.json` (done first):** the Atlas numbers equal the Marshall Street snapshot for eight of the ten; **PD2 (new)** and **PD (new)** come from verified overrides (Discmania collection pages, checked 2026-09-23) and also equal the snapshot's legacy-named PD 10/4/0/3 and PD2 12/4/0/4. Compared with current manufacturer pages, **all ten match exactly**: Discmania (PD, PD2), Discraft (Challenger and Undertaker via team.discraft.com; Undertaker also on the Big Z page), Innova (Savant, Wedge), MVP (Servo), Latitude 64 (Ruby), Gateway (Voodoo). **Omen is the exception in method:** the Thought Space page I guessed 404'd and the Infinite slug I guessed 404'd, so Thought Space's 9/4/0/4 and its copy come from Infinite's manufacturer line and retailer pages (Skyline, Reaper, 1010 Discs search summaries). None of the ten is in `infinite-manufacturer-ratings.json`.
- **PD / PD2 old-versus-new, what could and could not be separated.** Discmania's PD page says "PD (new)" approved 2021, and its PD2 page says "PD2 (new)" approved 2023 with S-Line as the plastic currently shown; the fetch step reported that the PD2 page represents the current production mold (spot-check that wording). Neither Discmania page prints a number change between versions; both print the same numbers the legacy-named entries carried. Retailer text and eBay listings show the earlier discs were made by Innova ("Innova mold," "Made by Innova"), and the 2021/2023 approvals are the Discmania-made molds (the same history as the MD3/MD5 entries in batches 5 and 8). **Infinite's pages carry no version split**: one PD page (keyed "Discmania-PD-Freak") and one PD2 page (keyed "Discmania-PD2-Chaos"), both listing current plastics, with reviews dated across years. The Infinite C-Line PD2 page prints a 1.9 cm height where the Atlas's 2023 PDGA entry has 1.8, a hint (not proof, and via the fetch step) that part of that pool is the earlier mold. One S-Line PD reviewer says older "penned" PDs flew differently from current ones. Treat every PD/PD2 retailer number below as old-and-new mixed.
- **Reddit** blocked, **YouTube** unreachable, **DGCR** 403 (the Undertaker plastic thread returned 403 when tried; the Servo, Savant, PD-versus-CD, "New PD2 Innova mold?" and Wedge threads appear only as search-result titles; none is cited as evidence). All Things Disc Golf's PD2 review timed out; not cited as read. Several guessed `dgputtheads.com` and `discgolfreviewer.com` URLs 404'd; the Voodoo and Challenger reviews (Disc Golf Puttheads) and the Voodoo match recap (Disc Golf Reviewer) were readable.
- **Community layer is thin outside the Infinite review text.** Named reviews I could read: Rodney Lane (Voodoo, Challenger, Challenger OS; Disc Golf Puttheads, none states arm speed), Aaron (Servo; Best Disc Golf Discs, a retailer-style blog, 13 years' experience, no arm speed), and the Infinite plastic-page reviewers (anonymous or first-name, single-source, mostly with a stated skill class and, for some, a distance). Distance bands rather than measured arm speeds: Savant 260–400 ft, Omen 200–300 ft, Undertaker 300–365 ft, PD 250–425 ft, PD2 320–450 ft, Servo about 300 ft, Ruby about 175 ft. Several aggregator pages (DiscMetrics, Disc Golf Puttheads flight charts, 1010 Discs) were templated and given minimal or no weight. Confirmations read as "no contradicting evidence found," not independent community verification.
- **Infinite reviewer averages pool plastics and wear.** Used as coarse retailer-type evidence at capped weight; never alone for a proposal. Plastic pages I could not load or that had no reviews: PD and PD2 plastic-specific pages other than C-Line and S-Line, Ruby Retro (0 ratings), Wedge only Star and DX, Challenger only ESP (2 ratings) and Pro-D, Savant Halo Star (3 ratings). **Plastic pages are individually thin** for Ruby (Opto 3 ratings with flight numbers) and Savant Star (10).
- **Spot-check needed on the Discraft stability ratings.** The summarizing fetch of team.discraft.com printed "Stability Rating: 1 (Overstable)" for the Challenger and "1.4" for the Undertaker; the Undertaker 1.4 also appears on the Big Z page. Not used for any conclusion beyond noting the tension in the Undertaker entry, but read the raw pages before citing.
- **Spot-check needed on the Gateway note.** Gateway's specs page says it "recently updated some of our flight numbers to more closely represent the numbers based on the latest improvements" and names no molds. Rodney Lane's Voodoo review prints 3/4/0/1, so the Voodoo may have been renumbered at some point; Gateway's current page, Marshall Street and Infinite all print 2/3/0/0. Not resolved from what I could read.
- **Marshall Street is the Atlas's own source** and was used only as baseline.
- Page contents came through a summarizing fetch step; spot-check any quote before it goes into an override's source note.

---

## Voodoo — Gateway (id 363af8ae7659)

- **Atlas now:** 2/3/0/0 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Soft watch noted below. Reference plastic (assumed most-thrown, not verified): Super Stupid Soft (SSS) or Super Soft; Gateway sells 30-plus variants.
- **Manufacturer:** Gateway 2/3/0/0 (collection page fetched; no stability label printed, "straight-line putter"). Copy: "a great lay-up disc or straight-line putter … a significantly smaller bead on the rim than the Wizard … feels very comfortable in your hand and flies like a broken-in Wizard." Copy and numbers agree. For scale, the Atlas Wizard is 2/3/0/2 and the Warlock 2/3/0/1. Retail labels: Infinite "straight flying stable putter," Disc Golf Puttheads chart "Stable," Marshall Street "Stable."
- **Retailer:** Infinite reviewer numbers 2.4/3.4/0/0.6 (72 reviews, 4.66 stars); SSS page 2.4/3.4/0/0.5 (27 reviews, 4.8 stars). Turn exact. **Fade runs 0.5–0.6 above the published 0 on both pages**; speed and glide read high (outside scope). Marshall Street 2/3/0/0 (baseline).
- **Community:** Infinite SSS-page reviewers (about 25, single-source, mostly beginner/intermediate, no distances): most rate it 3/4/0/1 and a handful 2/3/0/0; "flies very straight and true," "flips but doesn't crash and burn," "very straight flight with soft dependable fade" (advanced), "light predictable fade," "slight more fade than I would like" (advanced), "straight line, but stable enough to deal with the wind," "holds the anny-line real nice," "same mold as a wizard, except it's a micro bead … just the right amount of straight and stability" (advanced). Rodney Lane (Disc Golf Puttheads, Soft plastic, no arm speed stated): "Where the Wizard begins life on the Overstable side, the Gateway Voodoo is very stable – meaning straight/neutral," with a printed rating of 3/4/0/1. Search-summary DGCR titles (not read): "Wizard vs. Voodoo." Search-summary retailer text: "slightly more turn and less fade than the Wizard."
- sources:
  - {name: Gateway Voodoo collection page (2/3/0/0), url: https://gatewaydiscsports.com/collections/voodoo, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Voodoo (mfr 2/3/0/0; reviewers 2.4/3.4/0/0.6), url: https://infinitediscs.com/gateway-voodoo, type: retailer, weight: 0.5}
  - {name: Infinite Discs Super Stupid Soft Voodoo (reviewers 2.4/3.4/0/0.5; reviewer text), url: https://infinitediscs.com/gateway-voodoo/super-stupid-soft, type: retailer, weight: 0.3}
  - {name: Disc Golf Puttheads Voodoo review (Rodney Lane, Soft), url: https://www.dgputtheads.com/gateway-voodoo-review, type: community, weight: 0.3}
  - {name: Disc Golf Puttheads Voodoo flight chart (templated), url: https://www.dgputtheads.com/flight-charts/voodoo, type: retailer, weight: 0.1}
  - {name: Marshall Street Voodoo (2/3/0/0; not independent), url: https://www.marshallstreetdiscgolf.com/?s=voodoo&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** Manufacturer, Marshall Street and the Disc Golf Puttheads chart agree on 0/0, and the text describes a straight, stable, Wizard-like putter with a soft finish. **Soft watch, not a candidate:** Infinite's averages put fade 0.5–0.6 above the published 0 and most individual reviewers rate fade 1. Two things cut against reading that as a mold-level offset: fade 0 is the floor of the rating scale, so a pooled average of any real spread can only land above 0 (the same effect would push a fade-0 disc up in any pool), and several reviewers' 3/4/0/1 ratings match the numbers Lane's review prints, which looks like an earlier displayed number set (see the Gateway note above) that anchors later ratings. Held back because Gateway's own number says 0, the offset is 0.5, and the copy reads "straight-line." If a firmer read ever supports it, fade 0 → 0.5 would be the one to consider (|Δ| 0.5, not gated).
- **plasticVariance:** Sold in 30-plus variants (Suregrip SS/SSS/SSSS/Firm, Diamond, Lunar, Eraser, Organic, Hemp and others); Gateway prints one set of numbers. Reviewers say Super Stupid Soft is grippy in cold weather and the soft blends beat in well; Lane notes the "soft" blend is firmer than other makers' soft putters. Not quantified. Do not average.
- **Linked:** Wizard (2/3/0/2) and Warlock (2/3/0/1), Gateway's reference putters; the Atlas orders them Wizard > Warlock > Voodoo on fade, which matches Lane's and the retail text's "Voodoo is less stable than the Wizard." Nothing moves.

## Omen — Thought Space Athletics (id ca6f997a24c7)

- **Atlas now:** 9/4/0/4 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Aura or Ethos.
- **Manufacturer:** Thought Space Athletics 9/4/0/4 — **not read directly** (my guessed product URL 404'd). The numbers come from Infinite's manufacturer line and the retailer pages; the copy from retailer pages carrying Thought Space's text. Copy (via Skyline Discs, flagged as retailer-carried): "a true headwind fighter built for reliable overstability … a flat, powerful flight that always ends in a strong hyzer … stays true at high power, shows virtually no turn, and finishes with a hard, predictable fade … very overstable for new players." Reaper Discs (search summary): "fills the same bag slot as a Champion Firebird, … a little more domed in the hand while still fading just as hard." Copy and numbers agree. Infinite: "Very Overstable," Marshall Street "Very Overstable."
- **Retailer:** Infinite reviewer numbers 9/3.9/0/4 (31 reviews, 4.39 stars); Aura page 8.9/3.9/0/4.1 (9 reviews); Ethos page 9/4/0/3.9 (15 reviews). Turn exact on all three, fade within 0.1. Marshall Street 9/4/0/4 (baseline).
- **Community:** Infinite Ethos-page reviewers (15, single-source; per-reviewer fade 4 for most, with a few at 2, 3, 3.5, 4.5): "mostly just a utility disc" (intermediate, 275 ft), "very similar to my Felon, just a bit more stable" (intermediate), "flies more like a champion Thunderbird … the most workable one I have" (intermediate, rated 9/3.5/0/4), "pretty beefy — a true 9 speed OS beef. More beef than a Sexton," "workably overstable, and a great compliment to my Sexton Firebird" (advanced), "quite similar to a firebird, raptor or really any other firebird clone," "decently straight flying until the end," "super similar to my more moderate stability Raptors." Aura-page reviewers (nine): wind-fighter and spike-hyzer disc, "starts flying dead straight in a 20+ mph headwind" (intermediate, 275 ft), a Firebird replacement, "dump immediately" on forehand (intermediate, 200 ft), "monster beef" (intermediate). Search-summary retailer text: one reviewer "outdrove their Firebird by about 30 feet," another says it "makes the Firebird feel like a Teebird" and is "about as overstable as a Halo Firebird."
- sources:
  - {name: Infinite Discs Omen (mfr 9/4/0/4; reviewers 9/3.9/0/4), url: https://infinitediscs.com/thought-space-athletics-omen, type: retailer, weight: 0.5}
  - {name: Skyline Discs TSA Omen (manufacturer copy as carried by a retailer), url: https://skylinediscs.com/products/tsa-omen, type: manufacturer, weight: 0.5}
  - {name: Infinite Discs Ethos Omen (reviewers 9/4/0/3.9; reviewer text), url: https://infinitediscs.com/thought-space-athletics-omen/ethos, type: retailer, weight: 0.3}
  - {name: Infinite Discs Aura Omen (reviewers 8.9/3.9/0/4.1; reviewer text), url: https://infinitediscs.com/Thought-Space-Athletics-Omen/Aura, type: retailer, weight: 0.3}
  - {name: Reaper Discs Omen (search summary; Firebird comparison), url: https://reaperdiscs.com/collections/thought-space-athletics-omen, type: retailer, weight: 0.2}
  - {name: Marshall Street Omen (9/4/0/4; not independent), url: https://www.marshallstreetdiscgolf.com/?s=Omen&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Three Infinite averages (31, 15 and 9 ratings) agree with the published 0/4 to within 0.1, and the text, from beginners at 200 ft to advanced throwers, describes a Firebird-class overstable 9-speed with a flat flight and a hard finish. Not 0.7 because the manufacturer's own page was not read. No contradicting evidence found.
- **plasticVariance:** Sold in Aura, Ethos, Nebula variants and TSA Glow; Thought Space prints one set of numbers. One Aura reviewer says overstability is consistent across all plastic types; an Ethos reviewer calls Ethos "beefier than a Sexton." Not quantified. Do not average.
- **Linked:** Firebird (Atlas 9/3/0/4, the disc every reviewer compares it to; the Omen shares its fade and has a point more glide), Raptor (9/4/0/3, which one reviewer calls "more moderate"), Thunderbird (9/5/0/2) and the Sexton Firebird (not in the Atlas). Nothing moves.

## Savant — Innova (id 0a7cfd4691c4)

- **Atlas now:** 9/5/-1/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic: Star (Innova drivers, per the policy).
- **Manufacturer:** Innova 9/5/-1/2 (page fetched; no label printed on the number block, copy says "stable to slightly overstable"). Copy: "The Savant is a speed 9 driver with plenty of glide and a predictable, smooth fade. It flies like an Eagle, only faster!" Innova also positions it as "an option similar to the Thunderbird with extra glide and less fade." Copy and numbers agree. Infinite and Marshall Street label it "Stable."
- **Retailer:** Infinite reviewer numbers 9/5/-0.8/2.1 (29 reviews, 4.22 stars); Star page 9/5/-0.9/1.9 (10 reviews); Champion page 9/5/-1/2.2 (5 reviews); Halo Star page 9/5.2/-0.6/2.2 (3 reviews, too few). Turn within 0.2, fade within 0.2 on the pages I trust. Marshall Street 9/5/-1/2 (baseline).
- **Community:** Infinite Star-page reviewers (10, single-source): intermediate at 350 ft+, "fills up the exact same slot fresh out of the box" as a beaten-in Teebird (rated 9/5/-0.5/2); intermediate, "basically replaced every control driver in my bag minus my Firebird" at 300–330 ft; a 63-year-old at 260–270 ft, "always does what I tell it to do … nice reliable s curve"; one "hilariously overstable"; one "a further flying and more glidey Thunderbird." Champion page: advanced flick thrower at 400 ft, "just a slight bit too much turn for that stable 9 speed shot"; professional, "a tale of two discs": original-run Luster Savants "near the stability level of a thunderbird but with a little more glide," a later proto Star "less stable than the original run"; another reviewer "no turn and all fade." Halo Star: advanced at 375 ft, "a straight control driver until the last 75ish feet where it fades like a thunderbird"; intermediate at 375 ft, "more overstable than my champion Thunderbird."
- sources:
  - {name: Innova Savant page (9/5/-1/2), url: https://www.innovadiscs.com/disc/savant/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Savant (mfr 9/5/-1/2; reviewers 9/5/-0.8/2.1), url: https://infinitediscs.com/innova-savant, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star Savant (reviewers 9/5/-0.9/1.9; reviewer text), url: https://infinitediscs.com/Innova-Savant/Star, type: retailer, weight: 0.3}
  - {name: Infinite Discs Champion Savant (5 ratings; reviewer text), url: https://infinitediscs.com/innova-savant/champion, type: retailer, weight: 0.2}
  - {name: Infinite Discs Halo Star Savant (3 ratings; reviewer text), url: https://infinitediscs.com/Innova-Savant/Halo-Star, type: retailer, weight: 0.2}
  - {name: Marshall Street Savant (9/5/-1/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=savant&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and the two best-populated reviewer averages (29 and 10 ratings) agree with -1/2 to within 0.2, and the text describes a straight-to-gently-turning control driver with a Thunderbird-like finish, which is Innova's own copy. The spread (a flick thrower who finds it too turny, two who find it more overstable than a Thunderbird) is arm speed and run-to-run, and cuts in both directions. No contradicting evidence found.
- **plasticVariance:** Real, per reviewers: original-run Luster and Halo Star copies read more overstable; later Star and proto Star copies read less stable. Innova prints one set of numbers. Not quantified. Do not average.
- **Linked:** Teebird (Atlas 7/5/0/2), Thunderbird (9/5/0/2), which reviewers compare it to (the Atlas Savant has a point more turn than the Thunderbird, as "more glide, less fade" implies), Undertaker (9/5/-1/2, identical numbers) and Firebird. Nothing moves.

## Servo — MVP (id a732dd9c9ad9)

- **Atlas now:** 6.5/5/-1/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Neutron (Plasma is the other common one).
- **Manufacturer:** MVP 6.5/5/-1/2, "Stable-Overstable" label (page fetched). Copy: "The Servo is a straight-stable fairway driver … a new class with lower power requirements and more controllable speed … extended GYRO® Push yields a straighter lateral movement and immense glide with an effortless forward fade. Both high- and low-power throwers alike will achieve easy pinpoint accuracy." **Label-versus-copy note, same numbers:** "Stable-Overstable" on the label, "straight-stable" in the copy; Infinite "Stable," Marshall Street "Stable."
- **Retailer:** Infinite reviewer numbers 6.6/4.9/-0.9/1.9 (44 reviews, 4.48 stars); Neutron page 6.6/4.8/-0.9/1.9 (26 reviews); Plasma page about 6.65/5/-1.05/1.9 (13 reviews). Turn within 0.1, fade within 0.1 on all three. Speed reads 0–0.1 high (outside scope). Marshall Street 6.5/5/-1/2 (baseline).
- **Community:** Infinite Neutron-page reviewers (single-source): "absolute perfection," likened to an FD2, straight flight and a controllable fade; "highly workable for hyzer flips and tight woods courses"; used for 250–300 ft control shots; some find it close to an Axiom Crave; "can dump quickly at the end of flight"; advanced throwers note flight "closer to 7–8 speed." Plasma page: "will hold most angles you throw it on if you throw it with enough power" (intermediate); "fairway flick disc" at about 300 ft (intermediate, 165 g); "very good beginner disc … very easy to control" (beginner); "long flex shots … incredibly reliable fade." Aaron (Best Disc Golf Discs, 13 years' experience, no arm speed): "a gentle curve to the right … in the initial part with a bit of resistance to flipping."
- sources:
  - {name: MVP Servo page (6.5/5/-1/2, "Stable-Overstable"), url: https://mvpdiscsports.com/discs/servo/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Servo (mfr 6.5/5/-1/2; reviewers 6.6/4.9/-0.9/1.9), url: https://infinitediscs.com/mvp-servo, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Servo (reviewers 6.6/4.8/-0.9/1.9; reviewer text), url: https://infinitediscs.com/MVP-Servo/Neutron, type: retailer, weight: 0.3}
  - {name: Infinite Discs Plasma Servo (13 ratings; reviewer text), url: https://infinitediscs.com/mvp-servo/plasma, type: retailer, weight: 0.2}
  - {name: Best Disc Golf Discs Servo review (Aaron), url: https://bestdiscgolfdiscs.com/mvp-servo/, type: community, weight: 0.2}
  - {name: Marshall Street Servo (6.5/5/-1/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=servo&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and all three reviewer averages (44, 26 and 13 ratings) agree on -1/2 to within 0.1, and the text describes a controllable fairway driver with a gentle turn under power and a reliable forward fade, which is MVP's copy. No contradicting evidence found.
- **plasticVariance:** Sold in Neutron, Plasma, Fission, Proton, Eclipse 2.0 and Cosmic Neutron; MVP prints one set of numbers. Neutron and Plasma averages agree (fade 1.9 on both). Not quantified. Do not average.
- **Linked:** Crave (Atlas 6.5/5/-1/1, which reviewers compare it to; the Servo carries one more point of fade), FD2 (not re-read), Savant and Undertaker at a higher speed with the same turn/fade. Nothing moves.

## PD2 (new) — Discmania (id c655cf548ff6)

- **Atlas now:** 12/4/0/4 (source: verified override, Discmania collection page, checked 2026-09-23; PDGA approval 23-280, Dec 2023). **Proposed turn/fade:** none. Matches. Soft watch noted below. Reference plastic (assumed most-thrown, not verified): S-Line or C-Line.
- **Manufacturer:** Discmania 12/4/0/4, "Overstable" (collection page fetched). Copy: "The PD2 maxes out in two main categories: it is very fast, and very overstable. It's the type of disc you can rely on, no matter the conditions. With enough arm speed it can be thrown super far with high predictability. This disc is not suitable for everybody, but if you can muster up the power needed to launch one of these, you'll know this is a disc you can trust in all conditions." The page labels the version "PD2 (new), approved 2023" and (per the fetch step, spot-check) represents the current production mold; S-Line is the plastic shown. No number change between versions is stated. Copy and numbers agree. Infinite's description quotes the same "abnormally fast for the stability it offers."
- **Retailer (mixed old and new, see the evidence limits):** Infinite reviewer numbers 12/4.1/0/3.9 (64 reviews, 4.59 stars) on the mold page; S-Line page 12/4.2/0/4 (23 reviews); C-Line page 12/3.9/0/3.9 (18 reviews, 4.6 stars). Turn exact, fade within 0.1. The snapshot (`flights.json`) carries the legacy-named PD2 as 12/4/0/4, "Very Overstable"; the Marshall Street page itself was not fetched.
- **Community (mixed old and new):** Infinite C-Line reviewers (18, single-source): fourteen rate it exactly 12/4/0/4 and fifteen give fade 4; "too overstable for a beginner to backhand," "reliable in any wind," "more stable than expected; holds its flight over 6+ months" (professional), "total beef stick," "crazy overstable even in light weights"; distances 425 ft+ (professional), 450 ft (two), 320–330 ft (advanced, "flat C-line with good flex"); one 450 ft professional rates it 12/4/0/3.5, "less overstable than desired"; one "never thrown a driver that was more overstable … better for hyzers than max distance." S-Line page: "super overstable. Not as overstable as a Stiletto and Warhorse but more overstable than a Defender, Enforcer, Destroyer, D1, Force or World"; "if you cant bomb a disc 500+ feet … all you will get is some serious fade"; advanced ratings 12/5/0.5/4 and 12/6/0/4; **one reviewer: "New run blizzard rim S-PD2 in 168g or lower fly less stable, has a -.5 turn and a 3 fade."** Search-summary retailer text: "similar to Innova's Xcaliber with a little more speed and stability"; "168g version showed virtually no turn in headwinds."
- sources:
  - {name: Discmania PD2 collection page (12/4/0/4, "Overstable", PD2 (new) 2023), url: https://www.discmania.net/collections/pd2, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs PD2 (mold page keyed "-Chaos"; mfr 12/4/0/4; reviewers 12/4.1/0/3.9; old and new mixed), url: https://infinitediscs.com/discmania-pd2-chaos, type: retailer, weight: 0.4}
  - {name: Infinite Discs S-Line PD2 (reviewers 12/4.2/0/4; reviewer text), url: https://infinitediscs.com/discmania-pd2-chaos/s-line, type: retailer, weight: 0.3}
  - {name: Infinite Discs C-Line PD2 (reviewers 12/3.9/0/3.9; reviewer text), url: https://infinitediscs.com/Discmania-PD2-Chaos/C-Line, type: retailer, weight: 0.3}
- **confidence:** 0.6
- **consensusNote:** Manufacturer and every Infinite average agree on 0/4 to within 0.1, and the text, from 320 to 450+ ft throwers, describes a very overstable 12-speed that holds in wind and finishes hard. Held at 0.6 because the retailer pools cannot be split into old and new molds and the best-populated page is keyed to the legacy approval. **Soft watch, not a candidate:** two remarks say newer or lighter copies are less overstable (the "-.5 turn, 3 fade" S-Line comment, and a 450 ft professional's 3.5 fade), while the averages and fifteen of eighteen C-Line ratings say fade 4. If a firmer read ever supports it, fade 4 → 3.5 would be the one to consider (|Δ| 0.5, not gated); it would need version-labeled reviews. **Second soft watch:** one S-Line reviewer ranks it more overstable than the Enforcer; the Atlas has the Enforcer at 12/4/0.5/4 (same fade, a half-point more turn), which is consistent with that ranking on turn and silent on fade. Recorded only.
- **plasticVariance:** Sold in C-Line, S-Line, G-Line, Horizon, P-Line Flex 2, Metal Flake and signature variants; Discmania prints one set of numbers. Reviewers: flight varies with weight and dome (a Metal Flake copy was described as a utility wind fighter rather than a distance driver). Not quantified. Do not average.
- **Linked:** PD (new) (10/4/0/3), PD3 (11/3/0/5), PDx (11/4/0/3), Stiletto (13/3/0.5/5), Enforcer (12/4/0.5/4), D1 (12/5/0/4) and Force (12/5/0/3). The Atlas orders PD2 above the Force and D1 on fade or equal, as the reviewer's ranking does, and below Stiletto. Nothing moves.

## Challenger — Discraft (id a23eea57ccd3)

- **Atlas now:** 2/3/0/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): ESP, Pro-D or Putter Line.
- **Manufacturer:** Discraft 2/3/0/2 (team.discraft.com page fetched). Copy: "an amazing overstable putter, and very popular with advanced players. It can get around trouble for those long hyzer putts and is overstable enough to take a good amount of snap on approaches." The fetch step also printed "Stability Rating: 1 (Overstable)" (spot-check, see the evidence limits). Copy and numbers agree. Infinite: "an overstable putter" with "a deep rim and a tiny bead"; Marshall Street "Overstable."
- **Retailer:** Infinite reviewer numbers 2/3.1/0/1.9 (63 reviews, 4.54 stars); Pro-D page 2/3/0/1.9 (21 reviews); ESP page 3.1/3.55/0/1.75 (2 ratings, too few). Turn exact, fade within 0.1 on the two usable pages. Marshall Street 2/3/0/2 (baseline).
- **Community:** Infinite Pro-D reviewers (single-source): most rate 2/3/0/2, a few 1–1.5 and one 2.5; "very straight with a bit of fade at the end"; "the fade was not drastic enough to send it well off target, but enough that it was worth throwing it just to the side of the basket"; one reaches 225–250 ft drives with it; Pro-D beats in quickly. Infinite ESP page (two intermediate/advanced reviewers): "holds any line that you give it" with consistent fade. Rodney Lane (Disc Golf Puttheads, no arm speed stated): "an amazing overstable putter … the putter doesn't turn too hard to the right before gliding forward and finishing softly to the left"; low glide so misses fall short. In his Challenger OS review, "where the original Challenger may have turned and dived, the Challenger OS will hold an anhyzer line," which reads the standard disc as the less stable of the pair. Search-summary retailer text: "slight overstability," "glides straight with a fade at the end."
- sources:
  - {name: Discraft Challenger team page (2/3/0/2, stability 1), url: https://www.team.discraft.com/discs/challenger, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Challenger (mfr 2/3/0/2; reviewers 2/3.1/0/1.9), url: https://infinitediscs.com/discraft-challenger, type: retailer, weight: 0.5}
  - {name: Infinite Discs Pro-D Challenger (reviewers 2/3/0/1.9; reviewer text), url: https://infinitediscs.com/Discraft-Challenger/Pro-D, type: retailer, weight: 0.3}
  - {name: Infinite Discs ESP Challenger (2 ratings), url: https://infinitediscs.com/Discraft-Challenger/ESP, type: retailer, weight: 0.1}
  - {name: Disc Golf Puttheads Challenger review (Rodney Lane), url: https://www.dgputtheads.com/discraft-challenger-review, type: community, weight: 0.3}
  - {name: Disc Golf Puttheads Challenger OS review (Rodney Lane; comparison), url: https://www.dgputtheads.com/discraft-challenger-os-review, type: community, weight: 0.2}
  - {name: Marshall Street Challenger (2/3/0/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=challenger&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and both usable reviewer averages (63 and 21 ratings) agree on 0/2 to within 0.1, and the text describes a straight putter with a soft, reliable finish, which is what 0/2 says. Lane's "turns a little then fades" and the Challenger OS comparison hint at a touch of turn for full-power throws, but he does not rate it, and the averages show turn exact. No contradicting evidence found.
- **plasticVariance:** Sold in 20-plus variants (ESP, Pro-D, Putter Line, Jawbreaker, Titanium, X Line and others); Discraft prints one set of numbers. Pro-D is reported to beat in quickly; Lane recommends Jawbreaker for putting and ESP FLX for approach. Not quantified. Do not average.
- **Linked:** Challenger OS (Atlas 2/3/0/3, the overstable variant), Zone (4/3/0/3), Kratos (3/3/0/3), Magnet (2/3/-1/1), and Wizard (2/3/0/2, same numbers). The Atlas orders Challenger < Challenger OS on fade, matching Lane's comparison. Nothing moves.

## Wedge — Innova (id 51f04d0b1f7f)

- **Atlas now:** 3.5/3/-3/1 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic: Star (Innova, per the policy; DX is the other common one).
- **Manufacturer:** Innova 3.5/3/-3/1, "Understable" (page fetched). Copy: "easy to grip and release for smaller hands or for those who prefer a low profile straight flying Putter"; "all-around performer suitable for beginners due to its straight flight and minimal fade," used by advanced players "as a mid-range roller or turn-over mid-range flyer." **Copy-versus-number tension:** "straight flying" against a -3 turn, the same pattern as the Ruby and Comet: Innova's description is of the result for the low-power throwers it targets, the number is the disc. Infinite: "exceptional understability … a cross between a midrange and a putter."
- **Retailer:** Infinite reviewer numbers 3.8/3.1/-3/0.9 (38 reviews, 4.63 stars); Star page 3.7/3.1/-3.1/0.9 (19 reviews); DX page about 4/3.2/-2.8/1.1 (8 reviews). **Turn exact (within 0.2) and fade within 0.1 on all three.** Speed reads 0.2–0.5 high (outside scope). Marshall Street 3.5/3/-3/1 (baseline, "Very Understable").
- **Community:** Infinite Star-page reviewers (single-source): "flips very easy so when you need accuracy and a turning shot on low power this is phenomenal"; "taught me how to turn over my throws" (intermediate, 10-plus years), progressing to 400 ft anhyzer forehands; "too unreliable for consistent putting" (advanced); "lack of glide compared to equally understable discs like the Kite or Stingray." DX page: "flew dead straight" at first (beginner); "flies farther than my putter upshots and holds a straighter line" for approach; "Ching Sniper reborn" (advanced); DX "wears quickly." Search-summary retailer text: used for straddle putts because "the understability counteracts the natural hyzer from the awkward release angle."
- sources:
  - {name: Innova Wedge page (3.5/3/-3/1, "Understable"), url: https://www.innovadiscs.com/disc/wedge/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Wedge (mfr 3.5/3/-3/1; reviewers 3.8/3.1/-3/0.9), url: https://infinitediscs.com/innova-wedge, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star Wedge (reviewers 3.7/3.1/-3.1/0.9; reviewer text), url: https://infinitediscs.com/Innova-Wedge/Star, type: retailer, weight: 0.3}
  - {name: Infinite Discs DX Wedge (8 ratings; reviewer text), url: https://infinitediscs.com/Innova-Wedge/DX, type: retailer, weight: 0.2}
  - {name: Marshall Street Wedge (3.5/3/-3/1; not independent), url: https://www.marshallstreetdiscgolf.com/?s=Wedge&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and all three reviewer averages agree on -3/1 to within 0.2 (the DX page is eight ratings), and the text describes an easily turned-over putter for low power with a very small finish, which is what -3/1 says. No contradicting evidence found.
- **plasticVariance:** Sold in Star, DX and GStar; Innova prints one set of numbers. DX reportedly wears quickly (and so turns more); the Star and DX averages agree on turn (-3.1 and -2.8). Not quantified. Do not average.
- **Linked:** Ruby (3/5/-3/1, the same turn and fade at a higher glide), Mirage (3/4/-3/0), Stingray (4/5/-3/1), Kite (5/6/-3/1) and Magnet (2/3/-1/1). The Atlas Wedge matches Ruby and Stingray on turn and fade, as a reviewer's grouping of "equally understable discs" implies. Nothing moves.

## Ruby — Latitude 64 (id ccce17702606)

- **Atlas now:** 3/5/-3/1 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches; evidence thin. Reference plastic (assumed most-thrown, not verified): Opto (Retro is the budget baseline).
- **Manufacturer:** Latitude 64 3/5/-3/1, "Understable" (collection page fetched; Infinite and Disc Golf Puttheads print "Very Understable"). Copy: "Ruby is the putt & approach disc in our very popular Easy-to-use line. It features a small grip, low weight and a neutral flight path." **Copy-versus-number tension:** "neutral flight path" against a -3 turn, with a "very understable" label elsewhere; both describe the result for slow arms, and the numbers are not in dispute. Latitude: a Retro Ruby "seasons quickly, making the Ruby fly straighter with use."
- **Retailer:** Infinite reviewer numbers 3/4.8/-2.9/0.9 (10 reviews, 4.6 stars); Opto page 3/4.83/-2.27/1 (3 ratings with flight numbers: -1 and -3, one blank); Retro page 0 ratings. Marshall Street 3/5/-3/1 (baseline, "Very Understable").
- **Community:** Infinite Opto-page reviewers (three, single-source, all intermediate): "with my weak arm it seems to go dead straight" at about 175 ft; "once you get to know the Ruby's understability, you can make this thing turn at any point in flight from 0 to 200 ft depending on the hyzer angle of release"; "unsuitable for throws exceeding 50 feet" (for putting). Disc Golf Puttheads flight chart (templated): "one of the most beginner-friendly putters ever made," -3 for "touch anhyzers and short rollers." Search-summary retailer text: "too lightweight and floaty for putting."
- sources:
  - {name: Latitude 64 Ruby collection page (3/5/-3/1), url: https://latitude64.com/collections/ruby, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Ruby (mfr 3/5/-3/1; reviewers 3/4.8/-2.9/0.9), url: https://infinitediscs.com/latitude-64-ruby, type: retailer, weight: 0.5}
  - {name: Infinite Discs Opto Ruby (3 ratings; reviewer text), url: https://infinitediscs.com/Latitude-64-Ruby/Opto, type: retailer, weight: 0.2}
  - {name: Disc Golf Puttheads Ruby flight chart (templated), url: https://www.dgputtheads.com/flight-charts/ruby, type: retailer, weight: 0.1}
  - {name: Marshall Street Ruby (3/5/-3/1; not independent), url: https://www.marshallstreetdiscgolf.com/?s=Ruby&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.5
- **consensusNote:** Manufacturer, the mold-level Infinite average (10 ratings, -2.9/0.9) and the three Opto comments agree, and nothing contradicts. Too thin to call either way: ten pooled ratings, three comments from slow-arm throwers, no named reviewer, no Retro data. The "dead straight with a weak arm" remark is the expected result of -3 turn at low speed, not a contradiction.
- **plasticVariance:** Sold in Opto, Retro, Gold Line, Zero Soft/Medium and others (11 at Infinite); Latitude prints one set of numbers. Retro is the plastic that seasons fastest per Latitude's copy. Not quantified. Do not average.
- **Linked:** Wedge (3.5/3/-3/1, same turn and fade), Mirage (3/4/-3/0), Stingray (4/5/-3/1), Kite (5/6/-3/1). Nothing moves.

## Undertaker — Discraft (id 6be51219c6db)

- **Atlas now:** 9/5/-1/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): ESP (Z and Big Z are the other common ones).
- **Manufacturer:** Discraft 9/5/-1/2 (team.discraft.com page and the Big Z page, both fetched), stability 1.4 on both (spot-check, see the evidence limits). Copy, team page: "Most players have one versatile driver they reach for most often, and Undertaker is the new choice. This straight flier fills many needs for many different skill levels: it doesn't get flippy for power throwers, isn't hard to control for low-power players. Great glide, smooth finish." Copy, Big Z page: "a driver designed for moderately overstable flights and reliable control … manageable turn and consistent fade." **Contradiction inside Discraft's own copy, same numbers:** "straight flier" and "doesn't get flippy" on one page, "moderately overstable" on the other, and a 1.4 stability number that reads more overstable than a -1 turn suggests. Infinite labels it "Overstable" (and quotes "moderately overstable … offers some turn in flight, but will finish with a manageable fade"); Marshall Street "Stable."
- **Retailer:** Infinite reviewer numbers 8.9/4.9/-1/2.1 (159 reviews, 4.71 stars); ESP page 8.9/5/-1.1/1.9 (40 reviews); Z page 8.9/4.9/-0.9/2.2 (50 reviews); Big Z page 9/5/-1/2.2 (22 reviews). Turn within 0.1, fade within 0.2 on all four. Marshall Street 9/5/-1/2 (baseline).
- **Community:** Infinite ESP-page reviewers (single-source, 300–365 ft): "straight flight with a gentle fade," ESP "flippier" than Z, "after just a little break-in I get nice reliable turns that hold." Z page: 24 of 49 per-reviewer ratings read exactly 9/5/-1/2, the rest scatter on fade (1 to 3; thirteen rate it 3), one advanced reviewer "incredibly overstable for me." Big Z page: 10 of 22 read exactly 9/5/-1/2, seven rate fade 2.5–3, two rate it 1.5 or lower. Search-summary retailer text (DGCR thread, not read): "first run Elite Z is around 9/5/.5/2.5 for stability while the ESP is close to 9/5/-1.5/1"; "once beaten in, the ESP Undertaker turns into a dead straight fairway driver."
- sources:
  - {name: Discraft Undertaker team page (9/5/-1/2, stability 1.4), url: https://www.team.discraft.com/discs/undertaker, type: manufacturer, weight: 1.0}
  - {name: Discraft Big Z Undertaker page (9/5/-1/2, stability 1.4), url: https://www.discraft.com/big-z-undertaker-bzundertaker, type: manufacturer, weight: 0.8}
  - {name: Infinite Discs Undertaker (mfr 9/5/-1/2; reviewers 8.9/4.9/-1/2.1), url: https://infinitediscs.com/discraft-undertaker, type: retailer, weight: 0.5}
  - {name: Infinite Discs ESP Undertaker (reviewers 8.9/5/-1.1/1.9; reviewer text), url: https://infinitediscs.com/Discraft-Undertaker/ESP, type: retailer, weight: 0.3}
  - {name: Infinite Discs Z Line Undertaker (reviewers 8.9/4.9/-0.9/2.2; 49 per-reviewer ratings), url: https://infinitediscs.com/discraft-undertaker/elite-z, type: retailer, weight: 0.3}
  - {name: Infinite Discs Big Z Undertaker (reviewers 9/5/-1/2.2), url: https://infinitediscs.com/Discraft-Undertaker/Big-Z, type: retailer, weight: 0.2}
  - {name: Marshall Street Undertaker (9/5/-1/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=undertaker&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and all four reviewer averages (159, 40, 50 and 22 ratings) agree on -1/2 to within 0.2, and the text describes a straight-to-gently-turning control driver with a manageable fade. The reference plastic, ESP, reads at -1.1/1.9, exactly the published numbers. Discraft's "moderately overstable" and 1.4 language is looser than the numbers, but no reviewer or average supports moving the numbers toward it. No contradicting evidence found.
- **plasticVariance:** Real, per reviewers and a DGCR summary: Z (including first-run Elite Z) reads more overstable than ESP, ESP flippiest and fastest to turn when beaten in; the Z page averages fade 2.2 against ESP's 1.9. Discraft prints one set of numbers. Mold-level numbers stay at the ESP baseline. Do not average.
- **Linked:** Savant (9/5/-1/2, identical numbers), Teebird (7/5/0/2), Thunderbird (9/5/0/2), Raptor (9/4/0/3), Firebird (9/3/0/4) and Thrasher (12/5/-3/2, batch 8). Nothing moves.

## PD (new) — Discmania (id 90ca1c9ae3b3)

- **Atlas now:** 10/4/0/3 (source: verified override, Discmania collection page, checked 2026-09-23; PDGA approval 21-121, Nov 2021). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): C-Line or S-Line (the two Discmania lists).
- **Manufacturer:** Discmania 10/4/0/3, "Somewhat overstable" (collection page fetched). Copy: "The PD offers power and control in the same disc. Possibly the best all-around driver for advanced and Pro-level players … one of our all time best selling disc molds. The PD is somewhat overstable for most players to begin with, but becomes very versatile in various stages of wear." The page labels the version "PD (new), approved 2021." No number change is stated. Copy and numbers agree. **Label contradiction, same numbers:** Discmania says "somewhat overstable"; Infinite says "Overstable" (and quotes "wide rim, fast flight, and overstability … a straight flying, dependable go-to as it breaks in"); Marshall Street "Overstable"; reviewers say "very overstable."
- **Retailer (mixed old and new, see the evidence limits):** Infinite reviewer numbers 9.9/4.1/0/3 (98 reviews, 4.69 stars) on the mold page (keyed "-Freak"); C-Line page 9.9/4.1/0/3 (48 reviews); S-Line page 10/4.05/0/3 (27 reviews). Turn exact, fade exact. The snapshot carries the legacy-named PD as 10/4/0/3, "Overstable"; the Marshall Street page itself was not fetched.
- **Community (mixed old and new):** Infinite C-Line reviewers (about 11 named, single-source): most rate 10/4/0/3; "very overstable … reliable wind fighter" (intermediate, 250 ft); "a lovely fairway driver" with a possible flip on hard throws (professional, rated 10/4/-1/2); "very stiff disc" with a consistent tight flight (advanced); "more reliable in wind than S-Line" (intermediate, 375 ft, rated fade 2); **"this run is a Firebird … most stable run of PD's" (intermediate, rated 9/4/0/4);** "meat hooky out of the box" (beginner); a beginner at 275 ft rates it 10/5/0/2. Common reviewer text: "350+ ft needed to unlock full potential," slow to break in, compared to a Firebird or a faster Thunderbird with more glide. S-Line page: "will not turn which is very important"; "torque-resistant"; S-Line "slightly overstable" next to C-Line; distances 250–425 ft, most intermediate/advanced at 350–400 ft; fresh discs "beefy," becoming usable "with some flip" once worn; one reviewer says older "penned" PDs flew differently from current ones. Search-summary retailer text: "C-Line plastic flies flatter and more overstable out of the bag, while S-Line … picks up extra turn and glide as it wears in." DGCR "PD versus CD" and "New PD2 Innova mold?" appear only as titles.
- sources:
  - {name: Discmania PD collection page (10/4/0/3, "Somewhat overstable", PD (new) 2021), url: https://www.discmania.net/collections/pd, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs PD (mold page keyed "-Freak"; mfr 10/4/0/3; reviewers 9.9/4.1/0/3; old and new mixed), url: https://infinitediscs.com/Discmania-PD-Freak, type: retailer, weight: 0.4}
  - {name: Infinite Discs C-Line PD (reviewers 9.9/4.1/0/3; reviewer text), url: https://infinitediscs.com/discmania-pd-freak/c-line, type: retailer, weight: 0.3}
  - {name: Infinite Discs S-Line PD (reviewers 10/4.05/0/3; reviewer text), url: https://infinitediscs.com/discmania-pd-freak/s-line, type: retailer, weight: 0.3}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and all three Infinite averages (98, 48 and 27 ratings) agree exactly on 0/3, and the text describes an overstable, wind-resistant 10-speed that needs a strong arm and softens with wear. The reviewers' "very overstable" is the C-Line, new-disc, slow-arm read and is balanced by the S-Line, worn and faster-arm reads and by several fade-2 and one turn -1 ratings, so the mold-level 0/3 stands. The Firebird-like "most stable run" remark is a single run-to-run comment. Held at 0.65 because the retailer pools cannot be split into old and new molds. No contradicting evidence found.
- **plasticVariance:** Real, per reviewers and retailer text: C-Line flatter and more overstable new, S-Line less overstable and more glide, P-Line softer than C-Line; both beat in over time. Discmania prints one set of numbers. Not quantified. Do not average.
- **Linked:** PD2 (new) (12/4/0/4), PD3 (11/3/0/5), PDx (11/4/0/3), Starfire (10/4/0/3), Firebird (9/3/0/4, the disc reviewers compare it to), Thunderbird (9/5/0/2) and Raptor (9/4/0/3). The Atlas keeps the PD below the PD2 on speed and fade, as Discmania's own ordering says. Nothing moves.

---

## Batch 9 report (for Freddy)

**Proposed changes (0).** No catalog lag: all ten Atlas numbers equal the current manufacturer pages (Omen by retailer-carried copy and Infinite's manufacturer line, since Thought Space's own page was not reachable).

**Open candidates (0 new).** None of the ten reached even the batch-8 "single candidate" level.

**Soft watches (not candidates):**
- **Voodoo fade 0 → 0.5 (|Δ| 0.5):** Infinite's mold and SSS averages read 0.6 and 0.5 on 72 and 27 ratings and most reviewers rate fade 1. Discounted because fade 0 is the floor of the scale (a pooled average can only land above it) and because several 3/4/0/1 ratings match an earlier number set that Rodney Lane's review prints. Gateway's current page, Marshall Street and Infinite all show 2/3/0/0.
- **PD2 (new) fade 4 → 3.5 (|Δ| 0.5):** two remarks (a 450 ft professional's 3.5; an S-Line reviewer's "new run blizzard rim … 168g or lower … -.5 turn and a 3 fade") against 64/23/18-rating averages at 3.9–4.0 and fifteen of eighteen C-Line ratings at fade 4. Needs version-labeled reviews.
- **PD2 against Enforcer:** one reviewer ranks the PD2 more overstable than the Enforcer; the Atlas has the Enforcer at 12/4/0.5/4. Consistent on turn, silent on fade. Recorded only.

**Confirmed as-is (9):** Savant, Servo, Undertaker, Challenger, Wedge (0.7); Omen, PD (new) (0.65); PD2 (new), Voodoo (0.6). Confirmations mean "no contradicting evidence found," not independent community verification. PD2 (new) and PD (new) are the least firm because their retailer evidence is old-and-new mixed.

**Too thin to call (1):** Ruby (ten pooled ratings, three comments, no contradiction).

**Old-versus-new Discmania check (the batch brief's watch):** Discmania's own pages print the same numbers the legacy-named entries carried and label the molds "(new)" (PD 2021, PD2 2023); no renumbering was found. Infinite's PD and PD2 pages are keyed to the legacy approvals ("Freak", "Chaos") and pool reviews across versions, so the numbers confirm the *catalog* but not the new molds specifically. The Atlas keeps the legacy "PD (Freak)" and "PD2 (Chaos)" approvals as separate entries with no flight numbers; nothing here changes that.

**Spot-checks needed before any override source note:** the Discraft stability ratings (Challenger 1, Undertaker 1.4, via the fetch step), the "current production mold" statement on Discmania's PD2 page, Thought Space's own copy (read only through retailers), the Gateway "recently updated flight numbers" note (names no molds), and any quote taken via the summarizing fetch.

**Process notes for the next batch**

- Next ten by `featured.js` order after PD (new), skipping Katana (batch 4): Insanity, Ballista, Synapse, Octane, Stingray, Muse, Orion LF, Fuse, Rhythm, Stiletto. Stiletto and Stingray are linked to this batch (the PD2 reviewer ranking; Wedge/Ruby/Stingray turn grouping) and Synapse/Muse are Thought Space molds (check for a reachable Thought Space page first: the `/products/<mold>` guess for the Omen 404'd).
- **Open-candidate running list (nothing applied):** unchanged from batch 8. Still open: **Trident fade 3 → 3.5, D2 turn 0 → -0.5, MD3 (new) fade (Atlas 1 vs reviewers about 2), Tesla turn -1 → -0.5, Trespass turn -0.5 → -1, Fury fade 2 → 1.5**; gated and awaiting your call: **Luna fade 3 → 2, Gator fade 3 → 4**. Soft watches: Falk turn, Svea turn, A1/A2 spacing, PA3 fade, Lots turn, **plus this batch's Voodoo fade, PD2 fade, PD2/Enforcer**.
- **Linked sets re-checked this batch with nothing to propose:** PD/PD2/PD3/PDx/Starfire/D1/Force/Enforcer/Stiletto, Omen/Firebird/Raptor/Thunderbird, Savant/Undertaker/Teebird/Thunderbird/Servo/Crave, Challenger/Challenger OS/Zone/Kratos/Wizard/Voodoo/Warlock, Wedge/Ruby/Mirage/Stingray/Kite/Magnet. The Destroyer, Wraith and Trespass items are unaffected.
- Reachable manufacturer paths this batch: `discmania.net/collections/pd` and `/collections/pd2`, `team.discraft.com/discs/{challenger,undertaker}` and `discraft.com/big-z-undertaker-bzundertaker`, `innovadiscs.com/disc/{savant,wedge}/`, `mvpdiscsports.com/discs/servo/` (not `/disc/servo/`), `latitude64.com/collections/ruby`, `gatewaydiscsports.com/collections/voodoo`, `gatewayunderground.com/specs/` (no per-mold table). Infinite slugs: PD is `/Discmania-PD-Freak` (plastics `/discmania-pd-freak/{c-line,s-line}`) and PD2 is `/discmania-pd2-chaos` (plastics `/discmania-pd2-chaos/{c-line,s-line}`), while `/discmania-pd` and `/discmania-pd2` 302-loop; Omen `/thought-space-athletics-omen/ethos` and `/Thought-Space-Athletics-Omen/Aura`; Savant `/Innova-Savant/{Star,Halo-Star}` and `/innova-savant/champion`; Undertaker `/Discraft-Undertaker/{ESP,Big-Z}` and `/discraft-undertaker/elite-z`; Challenger `/Discraft-Challenger/{ESP,Pro-D}`; Wedge `/Innova-Wedge/{Star,DX}`; Ruby `/Latitude-64-Ruby/{Opto,Retro}`; Servo `/MVP-Servo/Neutron` and `/mvp-servo/plasma`; Voodoo `/gateway-voodoo/super-stupid-soft`.
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access reads the DGCR "New PD2 Innova mold?" and "PD versus CD" threads first (they bear on the old/new question), then Wizard vs. Voodoo (for the Voodoo fade watch), then still the Trespass threads and the Tesla and Gator items.

---

# Batch 10 (Plan 10, Phase 2)

Researched October 3, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (already up to date).

Molds covered: Insanity, Ballista, Synapse, Octane, Stingray, Muse, Orion LF, Fuse, Rhythm, Stiletto (the next ten by `public/featured.js` order after PD (new); Katana was done in batch 4).

## Batch 10 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Synapse | 12/5/-1.5/3 | **turn -1.5 → 0** (Thought Space's current published number; fade unchanged) | **Proposed change, review-gated (\|Δ\| = 1.5)** | 0.55 |
| Insanity | 9/5/-2/1.5 | none | Confirmed as-is | 0.7 |
| Octane | 13/5/-1/2 | none | Confirmed as-is | 0.7 |
| Fuse | 5/6/-1/0 | none | Confirmed as-is | 0.7 |
| Stiletto | 13/3/0.5/5 | none | Confirmed as-is | 0.7 |
| Ballista | 14/5/-1/3 | none | Confirmed as-is | 0.65 |
| Rhythm | 7/5/-2/1 | none | Confirmed as-is | 0.65 |
| Stingray | 4/5/-3/1 | none | Confirmed as-is (soft watch on Star turn) | 0.65 |
| Orion LF | 9/5/-1/2 | none | Confirmed as-is (manufacturer page not reachable; copy via retailers) | 0.6 |
| Muse | 3/3/0/2 | none | Confirmed as-is (manufacturer page not reachable; thin) | 0.6 |

**One proposed change (Synapse), no open candidates added, nine confirmed.** The Synapse is a Luna-type stale-catalog case: Thought Space's own product page now prints 12/5/0/3, while the Atlas carries Marshall Street's 12/5/-1.5/3. It is weaker than the Luna case in one respect: the 30-rating Infinite reviewer average (turn -0.7) lands between the two numbers, so the direction is well supported but the endpoint is a judgment call (see the entry).

## Evidence limits — batch 10

Same tooling limits as earlier batches; see the pilot section. Specific to this batch:

- **Diff against `flights.json` / `data.json` (done first):** the Atlas numbers equal the Marshall Street snapshot for all ten (none is a verified override; none is in `infinite-manufacturer-ratings.json`). Compared with current manufacturer pages, **eight match exactly**: Axiom (Insanity, Rhythm), Latitude 64 (Ballista, Fuse, Stiletto), MVP (Octane), Innova (Stingray), and Thought Space's Omen cross-check (below). **Synapse does not** (the one lag found). **Orion LF and Muse** could not be checked against the manufacturer: Millennium's own page was not found, and Thought Space's site lists no Muse product (its putter collection shows four other molds). Their numbers come from Infinite's manufacturer line, Marshall Street and retailer summaries, and all agree.
- **Synapse catalog split, what is known.** Pages printing **12/5/0/3**: Thought Space's own Ethereal Synapse product page (fetched; a dedicated "Flight numbers" block, via the fetch step, spot-check), Infinite's manufacturer line, Rocket Discs, LocalRoute, Titan Disc Golf (title and body; its URL slug still reads "12-5-1-5-3," which looks like a renumbering that the slug never caught up with). Pages printing **12/5/-1.5/3**: Marshall Street (all 15 Synapse listings), Disc Golf Dojo, Skyline Discs, and a Limber Disc Golf listing in a search summary. I could not find a date or announcement for the change, and Thought Space's collection pages print no numbers.
- **Omen cross-check for batch 9 (addendum).** Thought Space's own Ethereal Omen page (`/products/ethereal-omen-mandala`) was reachable this time: **9 | 4 | 0 | 4**, copy "the disc you reach for when the wind starts to pick up. Built with dependable overstability, it holds up to full power, fights through headwinds, and always finishes with a strong fade" (via the fetch step, spot-check). This confirms the batch 9 Omen entry's numbers from the manufacturer; its confidence could move 0.65 → 0.7. Nothing else changes.
- **Reddit** blocked, **YouTube** unreachable (the Rhythm video result was not opened), **DGCR** 403 (no thread was read or cited). The Millennium site, `crushdiscs.com` (SSL handshake error) and several guessed Infinite plastic-page slugs failed (302 or 404): Insanity and Rhythm plastic pages only load at the `.../neutron---axiom` form, and Orion LF at `/millennium-orion-lf/sirius` and `/standard`.
- **Community layer is the Infinite plastic-page reviewers** (anonymous or first-name, single-source, most with a stated skill class, some with a distance) plus a few retailer summaries. **No named reviewer-site review was readable for any of the ten.** Distance bands rather than measured arm speeds: Ballista 325–444+ ft, Octane 200–500+ ft, Synapse 280–350 ft, Rhythm 200–300 ft, Fuse 250–330 ft, Orion LF 350 ft (one stated). Confirmations read as "no contradicting evidence found," not independent community verification.
- **Fetch-step caution on per-reviewer prose.** For the Ballista page the summary's prose said individual turn ratings were "consistently more understable than -1 … -2 and -2.5 common," while the same page's printed averages are -1.0 (mold, 62 ratings) and -1.1 (Opto). I used the printed averages and treat the prose as a possible cherry-pick; spot-check the raw per-reviewer ratings before citing it. Two other summaries (Fuse Gold Line, Octane Neutron) contain approximate or partial per-reviewer tables.
- **Infinite reviewer averages pool plastics and wear.** Used as coarse retailer-type evidence at capped weight; never alone for a proposal.
- **Marshall Street is the Atlas's own source** and was used only as baseline (for the Synapse, one of the two number sets it is split against).
- Page contents came through a summarizing fetch step; spot-check any quote before it goes into an override's source note.

---

## Synapse — Thought Space Athletics (id 6567e159ebfd)

- **Atlas now:** 12/5/-1.5/3 (source: Marshall Street snapshot). **Proposed turn/fade:** turn **-1.5 → 0**, fade unchanged. |Δ| = 1.5, so this goes to the review gate regardless of confidence. Reference plastic (assumed most-thrown, not verified): Aura, Ethos or Ethereal.
- **Manufacturer:** Thought Space 12/5/0/3 (Ethereal Synapse product page fetched; other plastics' pages not read; no label printed). Copy: "12-speed distance driver … Stable enough to handle big arm speed or stiff headwind, with just a hint of high-speed turn"; retailer-carried older copy: "their first true distance driver for pro arms … a true bomb driver for players with fast armspeed" and "the reliably stable long-bomber in your bag." **Tension inside the copy:** a printed turn of 0 against "a hint of high-speed turn." **Contradiction with the Atlas:** Marshall Street still prints -1.5 on all 15 listings (labelled "Overstable"); see the evidence limits for who prints which. Infinite labels it "Overstable," Skyline's copy "stable enough to handle … a stiff headwind."
- **Retailer:** Infinite lists 12/5/0/3 and its reviewer numbers are 12/4.6/-0.7/3.1 (30 reviews, 4.07 stars); Aura page 12/4.9/-0.9/3 (8 ratings with flight numbers); Ethos page 12/4.9/-0.3/3 (4 ratings, too few). Rocket Discs' pooled reviewer numbers 12/5/-0.4/3. **Turn averages sit between the two catalog numbers on every page; fade matches 3 everywhere.** Marshall Street 12/5/-1.5/3 (baseline).
- **Community:** Infinite Aura-page reviewers (eight, single-source, mostly intermediate; six rate turn -1.5 to -1, one -0.5): "overstable, flat top flyer … max distance forehand driver"; "pretty flat … does not have much glide before its hard reliable finish" (intermediate, 280–300 ft forehand); "very flat and overstable … flies 30–50 feet shorter compared to other 12 speed drivers" (beginner); "replaced my Destroyer … excellent for dogleg holes"; "a pretty Destroyer clone with average glide and mild turn"; one new player's disc "will fly straight for a very short while and hyzer really quickly." Infinite Ethos-page reviewers (four): "workhorse driver for forehand drives" with a flat top (intermediate, 325 ft); "flies straight most of the way and fades at the end, went about 350" (rated -1.5); "easily went 340" (rated -1/2.5); "very overstable and not glidey at all" (rated 0/3.5). Rocket Discs reviewers (search summary): replaces Destroyers (advanced); "a good bit more overstable than expected" (intermediate); "flies with a little more turn" than a Destroyer (advanced); the Glow plastic is "notably more stable than other plastic options."
- sources:
  - {name: Thought Space Ethereal Synapse product page (12/5/0/3), url: https://thoughtspaceathletics.com/products/ethereal-synapse-2, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Synapse (mfr 12/5/0/3; reviewers 12/4.6/-0.7/3.1), url: https://infinitediscs.com/thought-space-athletics-synapse, type: retailer, weight: 0.5}
  - {name: Infinite Discs Aura Synapse (8 ratings; reviewer text), url: https://infinitediscs.com/Thought-Space-Athletics-Synapse/Aura, type: retailer, weight: 0.3}
  - {name: Infinite Discs Ethos Synapse (4 ratings; reviewer text), url: https://infinitediscs.com/thought-space-athletics-synapse/ethos, type: retailer, weight: 0.2}
  - {name: Rocket Discs Synapse (manufacturer 12/0 as displayed; reviewer summaries), url: https://rocketdiscs.com/thought-space-athletics-synapse, type: retailer, weight: 0.2}
  - {name: Titan Disc Golf Aura Synapse (12/5/0/3 in title and body; slug still -1.5), url: https://titandiscgolf.com/products/thought-space-athletics-aura-synapse-12-5-1-5-3, type: retailer, weight: 0.1}
  - {name: Marshall Street Synapse (12/5/-1.5/3 on all listings; not independent), url: https://www.marshallstreetdiscgolf.com/?s=synapse&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.55
- **consensusNote:** The manufacturer prints turn 0 and every reviewer average I could read (30, 8 and 4 ratings, plus Rocket's pool) prints between -0.3 and -0.9, so all the evidence says less turn than the Atlas's -1.5. The disagreement is only about how much less: Thought Space says 0, reviewers say about -0.7. The reviewers who compare it to the Destroyer say it has "mild turn" or "a little more turn," which at the Atlas's Destroyer (-0.5) points to about -1. Several per-reviewer ratings of -1.5 may simply echo the number Infinite displayed before it switched (the Titan slug suggests it once read -1.5). Held at 0.55 because of the split endpoint, the thin plastic-level samples and the unknown date of the manufacturer's change. **Options for you, in order of support:** (1) **turn → 0**, the manufacturer's current number (|Δ| 1.5, gated); (2) **turn → -1**, the reviewer-consistent value (|Δ| 0.5, would not itself be gated, but it departs from the manufacturer's number); (3) leave at -1.5 (the evidence does not support this). **Linked check, review as a set if it moves:** Force (Atlas 12/5/0/3, which a Synapse at 0/3 would match exactly), Destroyer (12/5/-0.5/3.5 after the override, which reviewers call the Synapse's clone; at turn 0 the Synapse would have less turn than the Destroyer, at -1 more, as the reviewers say), Defender (13/5/0/3), Wraith (11/5/-1/3), Trespass (12/5/-0.5/3, the open turn candidate in batch 8) and Sheriff (13/5/-1/2). The Destroyer's Atlas adjustment is unaffected by either option.
- **plasticVariance:** Sold in Aura, Ethos, Ethereal, Nebula variants and TSA Glow; Thought Space prints one set of numbers. One reviewer says the Glow plastic is more stable than the others; the Aura and Ethos averages (-0.9, -0.3) are on 8 and 4 ratings, too few to separate. Not quantified. Do not average.

## Insanity — Axiom (id 7cb365d71b0d)

- **Atlas now:** 9/5/-2/1.5 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Neutron (Plasma, Fission and Proton are the other common ones).
- **Manufacturer:** Axiom 9/5/-2/1.5, "Stable-Understable" (page fetched). Copy: "a stable-understable distance driver … a worn-in MVP Inertia, with a slightly more high-speed turn and a diminished fade … for average power throwers, the Insanity will be remarkably straight, while high power throwers can execute precise flip and turnover lines with ease." **Label-versus-number tension, same numbers:** "stable-understable" and "remarkably straight" against a -2 turn; the copy describes the result for average arms. Infinite: "slightly understable … a longer Crave"; Marshall Street "Understable."
- **Retailer:** Infinite reviewer numbers 9.3/5/-1.8/1.5 (110 reviews, 4.72 stars); Neutron page 9.5/5/-2.1/1.5 (34 reviews). Turn within 0.2, fade exact. Speed reads 0.3–0.5 high (outside scope). Marshall Street 9/5/-2/1.5 (baseline).
- **Community:** Infinite Neutron-page reviewers (single-source; per-reviewer speed ratings of 9 to 11 are pooled noise): "perhaps one of the best fairway drivers for intermediate players … reliable turn and fade"; "a fantastic control driver … smooth feel"; praised on forehand and as a roller; "angle sensitive … unpredictable flights" with a "fairly flat stock release"; "will flip quick into a headwind" (intermediate). Search-summary retailer text: "slightly less stable than the ultra popular MVP Inertia," "easy to either turn it over or get no turn if your release isn't clean."
- sources:
  - {name: Axiom Insanity page (9/5/-2/1.5, "Stable-Understable"), url: https://axiomdiscs.com/discs/insanity/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Insanity (mfr 9/5/-2/1.5; reviewers 9.3/5/-1.8/1.5), url: https://infinitediscs.com/axiom-insanity, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Insanity (reviewers 9.5/5/-2.1/1.5; reviewer text), url: https://infinitediscs.com/axiom-insanity/neutron---axiom, type: retailer, weight: 0.3}
  - {name: Marshall Street Insanity (9/5/-2/1.5; not independent), url: https://www.marshallstreetdiscgolf.com/?s=insanity&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and both reviewer averages (110 and 34 ratings) agree on -2/1.5 to within 0.2, and the text describes a disc that is straight for average arms and turns or flips for faster ones, which is Axiom's copy. The release-angle sensitivity is the usual spread around a -2 turn. No contradicting evidence found.
- **plasticVariance:** Sold in Neutron, Plasma, Fission, Proton, Eclipse 2.0 and Cosmic Neutron variants; Axiom prints one set of numbers. Not quantified. Do not average.
- **Linked:** Inertia (Atlas 9/5/-2/2, which Axiom's copy anchors on; the Atlas gives the two the same turn and the Insanity half a point less fade), Crave (6.5/5/-1/1), Rhythm (7/5/-2/1), Tesla (9/5/-1/2, the batch 6 open turn candidate) and Amp/Wave. Nothing moves.

## Ballista — Latitude 64 (id f76909208d26)

- **Atlas now:** 14/5/-1/3 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Opto.
- **Manufacturer:** Latitude 64 14/5/-1/3, "Stable" (collection page fetched). Copy: "the perfect balance of speed and accuracy … As one of the fastest distance drivers, it provides a reliable flight path for players of all skill levels … Perfect for maximum distance, stability, and control." **Label contradiction, same numbers:** Latitude says "Stable"; Infinite says "Overstable," "advanced" skill level, and quotes Latitude as "a more understable World … a slight degree of high-speed turn for the advanced disc golfer … shaped shots that require a good amount of fade"; Marshall Street "Stable." The "players of all skill levels" in the headline copy sits oddly with a 14 speed.
- **Retailer:** Infinite reviewer numbers 13.8/4.9/-1/2.9 (62 reviews, 4.35 stars); Opto page 13.9/4.9/-1.1/2.9. Turn within 0.1, fade within 0.1. Marshall Street 14/5/-1/3 (baseline).
- **Community:** Infinite Opto-page reviewers (single-source; the fetch summary's prose on individual ratings conflicts with the page average, see the evidence limits): distances of 325, 375–400, 400–420 and 444+ ft; per-reviewer ratings range from 13/5/-1/2 to 14/6/-2.5/3 (a beginner and a professional rate it more understable, an intermediate less).
- sources:
  - {name: Latitude 64 Ballista collection page (14/5/-1/3, "Stable"), url: https://latitude64.com/collections/ballista, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Ballista (mfr 14/5/-1/3; reviewers 13.8/4.9/-1/2.9), url: https://infinitediscs.com/latitude-64-ballista, type: retailer, weight: 0.5}
  - {name: Infinite Discs Opto Ballista (reviewers 13.9/4.9/-1.1/2.9; per-reviewer ratings), url: https://infinitediscs.com/Latitude-64-Ballista/Opto, type: retailer, weight: 0.3}
  - {name: Marshall Street Ballista (14/5/-1/3; not independent), url: https://www.marshallstreetdiscgolf.com/?s=ballista&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and both printed reviewer averages (62 ratings, plus the Opto page) agree on -1/3 to within 0.1. The text I could read is only distance and rating data, with no readable written review for this mold, so the community layer is thin. No contradicting evidence found.
- **plasticVariance:** Sold in Opto, Gold, Retro, Opto Air, Opto Moonshine and others (15 at Infinite); Latitude prints one set of numbers. Not quantified. Do not average.
- **Linked:** World (Westside; Atlas 14/4/-0.5/3, which Latitude's copy anchors on; the Atlas Ballista has half a point more turn and a point more glide, as "a more understable World" says), Halo (13/5/-0.5/3) and Nuke (13/5/-1/3). Nothing moves.

## Octane — MVP (id ba0b0b1419fa)

- **Atlas now:** 13/5/-1/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Neutron (Plasma and Fission are the others).
- **Manufacturer:** MVP 13/5/-1/2, "Stable-Understable" (page fetched). Copy: "a high-speed stable-understable distance driver … a slow-turning profile that holds long and straight until its fade finish … Average throwers should see straight flights with a bit of shallow turn, while power throwers will be able to hyzerflip for max distance and tailwind lines"; the Fission version has "a touch more turn than in other plastics." Copy and numbers agree. Marshall Street "Understable."
- **Retailer:** Infinite reviewer numbers 13/5/-1/2.1 (59 reviews, 4.65 stars); Neutron page 12.9/5/-1/2 (24 reviews); Plasma page 13/5/-1/2.1 (12 reviews). Turn exact, fade within 0.1 on all three. Marshall Street 13/5/-1/2 (baseline).
- **Community:** Infinite Neutron-page reviewers (single-source): most rate 13/5/-1/2; "weight matters significantly; 161 g flippier than 174 g" (intermediate, 375 ft); "much more stable than expected, windfighter stable" (beginner, 375 ft, rated 13/5/0/3); "beats in to understable, excellent S-curve" (advanced, 500+ ft); "flippy Destroyer" and "beat-in Nuke" comparisons; "doesn't turn and burn" (professional, 480+ ft). Plasma page: "great hyzer flip disc for 430–450 ft straight to understable lines" (advanced); "goes hard left" (beginner, 200 ft); "flies straight and then finishes left" (intermediate, 280–300 ft, rated -0.5/3); "wonderfully stable high speed driver … great for shot shaping."
- sources:
  - {name: MVP Octane page (13/5/-1/2, "Stable-Understable"), url: https://mvpdiscsports.com/discs/octane/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Octane (mfr 13/5/-1/2; reviewers 13/5/-1/2.1), url: https://infinitediscs.com/mvp-octane, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Octane (reviewers 12.9/5/-1/2; reviewer text), url: https://infinitediscs.com/MVP-Octane/Neutron, type: retailer, weight: 0.3}
  - {name: Infinite Discs Plasma Octane (reviewers 13/5/-1/2.1; reviewer text), url: https://infinitediscs.com/mvp-octane/plasma, type: retailer, weight: 0.3}
  - {name: Marshall Street Octane (13/5/-1/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=octane&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and all three reviewer averages (59, 24 and 12 ratings) agree on -1/2 to within 0.1, and the text, from 200 ft beginners to 500 ft advanced throwers, describes a disc that holds a straight line, turns for power throwers and finishes with a fade, which is MVP's copy. The "much more stable than expected" and "hard left" remarks sit on the beginner side of the arm-speed spread. No contradicting evidence found.
- **plasticVariance:** Real, per MVP and reviewers: Fission has a touch more turn than other plastics; disc weight matters (lighter copies flippier). Neutron and Plasma averages agree. Not quantified. Do not average.
- **Linked:** Nuke (Atlas 13/5/-1/3, the "beat-in Nuke" comparison; the Octane has a point less fade), Destroyer (12/5/-0.5/3.5), Wave (11/5/-2/2), Inertia (9/5/-2/2), Sheriff (13/5/-1/2, identical numbers). Nothing moves.

## Stingray — Innova (id 390ba45c55c2)

- **Atlas now:** 4/5/-3/1 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Soft watch noted below. Reference plastic: Star (per the policy; DX is the price-tier baseline and the larger Infinite sample, but not the flight reference).
- **Manufacturer:** Innova 4/5/-3/1 (page fetched; no stability label printed). Copy: "One of the best mid-range discs for right turning shots. Excellent glide and flight pattern help stretch out shots for newer players … performs well as a straight flyer when new and transitions into a dependable turnover/roller disc as it ages." **Copy-versus-number tension:** "straight flyer when new" against a -3 turn, the pattern seen on the Wedge, Ruby and Comet: Innova describes the disc for the low-power throwers it targets and as it wears. Infinite: "low-speed, understable nature." Marshall Street "Very Understable."
- **Retailer:** Infinite reviewer numbers 4/5/-2.8/1 (62 reviews, 4.44 stars); **Star page 4/4.9/-2.5/1 (11 per-reviewer ratings)**; DX page rated 4/5/-3/1 by reviewers per the summary (40 ratings; the average was not printed in a form I could read). Mold-level turn within 0.2; Star-level turn 0.5 above the published -3. Marshall Street 4/5/-3/1 (baseline).
- **Community:** Infinite Star-page reviewers (11, single-source, no stated arm speed except one 375 ft beginner): five rate turn -3 ("low profile and very versatile," "great for learning RHBH drive," "best hyzerflip midrange ever when beaten in," "great disc for starters"), four rate it -0.5 to -1 ("Ontario mold: no -3 turn at all, closer to 0 to -1," "doesn't quite live up to the flight numbers," "not a -3 turn disc … behaved more like -0.5," "has about a -1 turn out of the box"), two in between (-2, -2.5; "as stable as a worked-in champ Mako3"), one "too stable for my liking yet." DX page: "an amazing under stable mid range disc for all levels," "will fly very straight for your brand new, and will slowly break in to being an awesome flat to turnover disc," "DX plastic beats in quickly, becoming increasingly flippy."
- sources:
  - {name: Innova Stingray page (4/5/-3/1), url: https://www.innovadiscs.com/disc/stingray/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Stingray (mfr 4/5/-3/1; reviewers 4/5/-2.8/1), url: https://infinitediscs.com/innova-stingray, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star Stingray (reviewers 4/4.9/-2.5/1; reviewer text), url: https://infinitediscs.com/Innova-Stingray/Star, type: retailer, weight: 0.3}
  - {name: Infinite Discs DX Stingray (40 ratings; reviewer text), url: https://infinitediscs.com/Innova-Stingray/DX, type: retailer, weight: 0.2}
  - {name: Marshall Street Stingray (4/5/-3/1; not independent), url: https://www.marshallstreetdiscgolf.com/?s=stingray&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and the mold-level average (62 ratings) agree on -3/1 to within 0.2, and the DX text describes the disc that is straight new and turns as it wears, which is Innova's copy. **Soft watch, not a candidate:** on the Star page, the reference plastic, the turn average is -2.5 and four of eleven reviewers say it turns far less than -3 out of the box, one of them naming an "Ontario" mold. That is a 0.5 offset on eleven ratings, with the fade exact. If a firmer read ever supports it, Star turn -3 → -2.5 would be the one to consider (|Δ| 0.5, not gated); it would need a Star-only sample at volume, and the remarks may be a production-run effect rather than the mold.
- **plasticVariance:** Real, per reviewers: DX beats in quickly and gets flippier; Star holds shape longer and reads straighter and more stable new (the Star-versus-DX gap is the source of the watch). Innova prints one set of numbers. Not quantified. Do not average.
- **Linked:** Wedge (Atlas 3.5/3/-3/1) and Ruby (3/5/-3/1), which share its turn and fade; Kite (5/6/-3/1), Mirage (3/4/-3/0), Mako3 (not re-read; a reviewer's comparison) and Gazelle (6/4/0/2). Nothing moves.

## Muse — Thought Space Athletics (id 0b424bea52bd)

- **Atlas now:** 3/3/0/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches; evidence thin. Reference plastic (assumed most-thrown): Nerve (the only plastic line besides Nerve Firm).
- **Manufacturer:** Thought Space 3/3/0/2 — **not read directly.** Thought Space's site lists no Muse in its putter or all-products collections, and a guessed product URL 404'd, so the numbers and copy come from Infinite's manufacturer line, Disc Golf Dojo, Marshall Street and retailer summaries (Gotta Go Gotta Throw, Skyline and others). Retailer-carried copy: "a stable beadless putter that fills the hand comfortably, being not too shallow and not too deep … Spin putters will love its straight flight and push putters will love its dependable stability … a moderate fade and lower glide … to land close without overshooting." Copy and numbers agree. **Label contradiction, same numbers:** Infinite "Overstable"; Disc Golf Dojo and the retailer copy "stable"; Marshall Street "Overstable."
- **Retailer:** Infinite reviewer numbers 3/3/0/1.8 (18 reviews, 4.47 stars); Nerve page the same (18 reviews). Turn exact, fade within 0.2. Marshall Street 3/3/0/2 (baseline).
- **Community:** Infinite Nerve-page reviewers (18, single-source): per-reviewer ratings from 2.5/3/0/1 to 3.5/3/-0.5/1.5; "felt great … like a Luna or roach" with a flight "closer to 2.5/3/0/1" (professional); "became my go-to putting putter despite overstability concerns" (advanced); "comparable in feel and flight" to a Luna (several, per the summary, which names it an "Innova Luna": the Luna is a Discraft disc, so spot-check that wording); "potentially overstable for some putting distances (25+ ft)"; baseline Nerve plastic "took a chunk" from a basket.
- sources:
  - {name: Infinite Discs Muse (mfr 3/3/0/2; reviewers 3/3/0/1.8), url: https://infinitediscs.com/thought-space-athletics-muse, type: retailer, weight: 0.5}
  - {name: Infinite Discs Nerve Muse (reviewers 3/3/0/1.8; reviewer text), url: https://infinitediscs.com/Thought-Space-Athletics-Muse/Nerve, type: retailer, weight: 0.3}
  - {name: Disc Golf Dojo Thought Space chart (3/3/0/2, "Stable"), url: https://discgolfdojo.com/discs/thought-space/, type: retailer, weight: 0.1}
  - {name: Marshall Street Muse (3/3/0/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=muse&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** Every source I could read agrees on 0/2, and the Infinite average (fade 1.8 on 18 ratings, none contradicting) and the reviewers describe a straight, mildly overstable putter. Not 0.7 because Thought Space's own page was not read and the Atlas value rests on retailer-carried numbers. The two reviewers who put the fade nearer 1 are single remarks. No contradicting evidence found.
- **plasticVariance:** Sold in Nerve, Nerve Firm and UV Nerve; Thought Space prints one set of numbers. One reviewer flags the baseline plastic's durability. Not quantified. Do not average.
- **Linked:** Luna (Atlas 3/3/0/3, which reviewers compare it to; the open Luna item in batch 2 is untouched by this entry, and note the Atlas Luna fade 3 sits a point above the Muse while reviewers call them similar, consistent with the Luna's stale fade), Pathfinder (5/5/0/1), Envy (3/3/0/2, identical numbers), Aviar (2/3/0/1) and Berg. Nothing moves.

## Orion LF — Millennium (id afea841f8f21)

- **Atlas now:** 9/5/-1/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Sirius or Standard.
- **Manufacturer:** Millennium 9/5/-1/2 — **not read directly** (Millennium's own page was not found). Numbers and copy come from Marshall Street and retailer summaries. **[Amended Oct 3, 2026, batch 13: "no manufacturer page" should read "qualitative labels only, no digits." Millennium's own site (golfdisc.com) publishes a label for the Orion LF, "Slightly Overstable Long Range Driver," but no turn/fade digits, so the 9/5/-1/2 remains retailer-sourced. Read via the fetch step, spot-check.]** Retailer-carried Millennium copy: "delivers great control, incredible distance and accuracy to keep you in the fairway. Great for all skill levels, newer players will love it upwind, while experienced players will use it to make amazing shots in all conditions"; Marshall Street: "a terrific straight hybrid driver." **Label contradiction, same numbers:** Marshall Street and retailer copy "stable"; Infinite "a good overstable driver"; Disc Golf Puttheads' templated chart "Very Overstable."
- **Retailer:** Infinite reviewer numbers 9/5/-1/2.4 (20 reviews, 4.9 stars); Sirius page 9/5/-1/2.3 (9 reviews); Standard page 9/5/-1/2.3 (as the fetch step printed it). Turn exact, fade 0.3–0.4 above the published 2. Marshall Street 9/5/-1/2 (baseline, "Stable").
- **Community:** Infinite Sirius-page reviewers (nine, single-source; per-reviewer fade 2 to 3): "very stable to mildly overstable" (advanced, 350 ft, rated 0/2.5 new and -0.5/2 beaten in); "enough stability to fight the wind"; "pretty flat with not much dome … hard flex shots"; "straight to overstable flight patterns" (professional); "once beat in, holds a hyzer flip line perfectly"; "dependable fade, but can still go straight for a while." Standard page: "flight numbers provided by Millennium are 9/5/-1/2 (for all plastic blends), but the near max weight ones are more in the 9/4+/-1/3 off the shelf."
- sources:
  - {name: Infinite Discs Orion LF (mfr 9/5/-1/2; reviewers 9/5/-1/2.4), url: https://infinitediscs.com/millennium-orion-lf, type: retailer, weight: 0.5}
  - {name: Infinite Discs Sirius Orion LF (reviewers 9/5/-1/2.3; reviewer text), url: https://infinitediscs.com/Millennium-Orion-LF/Sirius, type: retailer, weight: 0.3}
  - {name: Infinite Discs Standard Orion LF (reviewer text), url: https://infinitediscs.com/millennium-orion-lf/standard, type: retailer, weight: 0.2}
  - {name: Marshall Street Orion LF (9/5/-1/2, "Stable"; carries Millennium's description), url: https://www.marshallstreetdiscgolf.com/product/orion-lf, type: retailer, weight: 0.3}
  - {name: Disc Golf Puttheads Orion LF chart (templated), url: https://www.dgputtheads.com/flight-charts/orion-lf, type: retailer, weight: 0.1}
- **confidence:** 0.6
- **consensusNote:** Every source agrees on turn -1 and fade 2 to 2.5, with the reviewer average sitting 0.3–0.4 above the published fade on 20 ratings and the text calling it "straight to overstable" and "mildly overstable." A near-max-weight copy reading 9/4+/-1/3 is a weight effect, not a mold offset. Not 0.7 because Millennium's own page was not read. No contradicting evidence found; fade 2 → 2.5 is the only drift (|Δ| 0.5, not gated) and is not strong enough to name as a candidate.
- **plasticVariance:** Sold in Standard, Sirius and Quantum; Millennium prints one set of numbers for all. Reviewers say heavier copies read more overstable and the disc turns a little more once beaten in. Not quantified. Do not average.
- **Linked:** Orion LS (Atlas 9/4/-1/1, the same-speed sibling with less fade), Tesla (9/5/-1/2, identical numbers; the open Tesla turn candidate is unchanged) and Savant (9/5/-1/2). Nothing moves.

## Fuse — Latitude 64 (id 9f8d17284088)

- **Atlas now:** 5/6/-1/0 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Opto (Gold Line is the other).
- **Manufacturer:** Latitude 64 5/6/-1/0, "Understable" (collection page fetched). Copy: "the most versatile midrange driver we have ever made. Period. Co-designed with our pro Jesper Lundmark, it has a stable and predictable flight path up to 300ft, and will hold long anhyzer curves with minimal fade at the end." **Label-versus-copy tension, same numbers:** "Understable" label against "stable and predictable flight path" in the copy; the "up to 300ft" qualifier makes it an arm-speed statement. Infinite: "understable/stable … can hold curves and lines with very minimal fade"; Marshall Street "Understable."
- **Retailer:** Infinite reviewer numbers 5/6/-1.3/0.2 (101 reviews, 4.67 stars); Opto page 5/6/-1.1/0.05 (43 reviews); Gold Line page about 5.1/6.1/-1.3/0.3 (18 reviews, per the summary). Turn 0.1–0.3 more understable, fade within 0.3. Marshall Street 5/6/-1/0 (baseline).
- **Community:** Infinite Opto-page reviewers (single-source, mostly 250–330 ft): "dead straight" flights dominate; "holds whatever line you throw it on"; "flip to flat" on hyzer releases; "slight understability"; "glides for days"; one 295 ft controlled throw, one 330 ft downwind. Gold Line page: "sensitive to release angle; poor form results in unpredictable flights," "can overshoot closer targets due to excessive glide," "touchy" (several); intermediates (300–350 ft) praise versatility, advanced throwers (400+ ft) the glide and line-holding. Search-summary retailer text: "not understable enough to usually turn into a roller but will hold the anhyzer line the entire way when thrown flat."
- sources:
  - {name: Latitude 64 Fuse collection page (5/6/-1/0, "Understable"), url: https://latitude64.com/collections/fuse, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Fuse (mfr 5/6/-1/0; reviewers 5/6/-1.3/0.2), url: https://infinitediscs.com/latitude-64-fuse, type: retailer, weight: 0.5}
  - {name: Infinite Discs Opto Fuse (reviewers 5/6/-1.1/0.05; reviewer text), url: https://infinitediscs.com/Latitude-64-Fuse/Opto, type: retailer, weight: 0.3}
  - {name: Infinite Discs Gold Line Fuse (18 ratings; reviewer text), url: https://infinitediscs.com/latitude-64-fuse/gold-line, type: retailer, weight: 0.2}
  - {name: Marshall Street Fuse (5/6/-1/0; not independent), url: https://www.marshallstreetdiscgolf.com/?s=fuse&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and all three reviewer averages (101, 43 and 18 ratings) agree on -1/0 to within 0.3, and the text describes a straight-to-gently-understable midrange that holds anhyzer lines and finishes with almost no fade, which is Latitude's copy. The pooled -1.3 is the same direction as the Opto page's -1.1 and inside the usual wear and arm-speed spread. No contradicting evidence found.
- **plasticVariance:** Sold in Opto, Gold Line, Retro, Zero Gravity, Frost Line and 20-plus others; Latitude prints one set of numbers. Opto and Gold Line averages agree within 0.2 on turn. Not quantified. Do not average.
- **Linked:** River (Atlas 7/7/-1/1), Pure (3/3/-1/1), Truth (5/5/-1/1), Hex (5/5/-1/1) and Cyclone-class mids. The Atlas has the Fuse at the understable, no-fade end of the 5-speed mids, as the copy says. Nothing moves.

## Rhythm — Axiom (id a0ef7d8f0059)

- **Atlas now:** 7/5/-2/1 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Neutron.
- **Manufacturer:** Axiom 7/5/-2/1, "Understable" (page fetched). Copy: "designed to be either a great first driver or a line-shaping fairway driver for power arms"; lower power "laser straight with a slight fade at the end, making it a great line-hitting disc"; higher power "carving up the woods with hyzer flips or natural turnovers from flat, even rollers aren't out of the question." Copy and numbers agree (the "laser straight" is the low-power result). Marshall Street "Understable."
- **Retailer:** Infinite reviewer numbers 7/4.9/-1.8/1.2 (18 reviews, 4.36 stars); Neutron page 7/5/-2/1 (11 reviews). Turn within 0.2, fade within 0.2. Marshall Street 7/5/-2/1 (baseline).
- **Community:** Infinite Neutron-page reviewers (11, single-source, 200–300 ft): seven rate it exactly 7/5/-2/1 ("very beginner friendly," "a Leopard replacement," "reliable 200–225 ft flyer with light, predictable fade," "excellent for hyzer-flip learning," compared favorably to a Leopard3); a beginner at 275 ft finds it "surprisingly understable" (-2.5); four intermediates and one professional (about 300 ft) say it flies straighter or firmer than the number: "flat and quite OS" (7/4/0/2), "super flat" (-1.5/2), "less turn than advertised … more OS than my Crave" (-1/1.5), "both his discs flew straighter with baby turn." Search-summary retailer text: "flips up smooth, glides long, and finishes mild."
- sources:
  - {name: Axiom Rhythm page (7/5/-2/1, "Understable"), url: https://axiomdiscs.com/discs/rhythm/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Rhythm (mfr 7/5/-2/1; reviewers 7/4.9/-1.8/1.2), url: https://infinitediscs.com/axiom-rhythm, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Rhythm (reviewers 7/5/-2/1; reviewer text), url: https://infinitediscs.com/axiom-rhythm/neutron---axiom, type: retailer, weight: 0.3}
  - {name: Marshall Street Rhythm (7/5/-2/1; not independent), url: https://www.marshallstreetdiscgolf.com/?s=rhythm&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and both reviewer averages (18 and 11 ratings) agree on -2/1 to within 0.2, and the text describes an easy, straight-to-understable 7-speed with a mild finish. Five of eleven Neutron reviewers say it runs straighter than -2 (with the faster-arm 300 ft group over-represented), which is the opposite of the usual "faster arms turn it more" pattern and is recorded as a single-sample oddity, not a watch: the averages do not move. No contradicting evidence found.
- **plasticVariance:** Sold in Neutron, Fission, Proton, Cosmic Neutron and Plasma; Axiom prints one set of numbers. Not quantified. Do not average.
- **Linked:** Crave (Atlas 6.5/5/-1/1, which one reviewer says the Rhythm out-stables), Leopard (6/5/-2/1, identical turn and fade, which reviewers cite as its replacement), Switch (6.5/5/-1.5/1), Amp (8/5/-1.5/1) and Insanity. The Atlas Rhythm and Leopard match, as reviewers' "Leopard replacement" says. Nothing moves.

## Stiletto — Latitude 64 (id 949acc7e16e0)

- **Atlas now:** 13/3/0.5/5 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Opto (Gold Line is the other; Latitude lists only those two on its collection page).
- **Manufacturer:** Latitude 64 13/3/0.5/5, "Overstable" (collection page fetched). Copy: "Overstable! That's the main word when describing the Stiletto … engineered for extreme stability and designed to hold up to anything … ideal for windy conditions … when the wind roars in your face." Copy and numbers agree. **Contradiction in retailer-carried copy:** Infinite's description says Latitude "features a turn rating of positive 1 and a fade of 5" and calls it "the most overstable Latitude 64 disc that will ever be made … greater speed than comparable overstable models like the Trident and XXX"; Latitude's own page prints 0.5. Marshall Street "Very Overstable."
- **Retailer:** Infinite reviewer numbers 13/2.7/0.7/5.2 (39 reviews, 4.36 stars); Opto page 13/2.8/0.7/5.2 (22 reviews); Gold Line page 13/2.9/0.6/5.3 (5 reviews, too few). Turn 0.1–0.2 above the published 0.5, fade 0.2–0.3 above 5, on the two usable pages. Glide reads about 0.2 low (outside scope). Marshall Street 13/3/0.5/5 (baseline).
- **Community:** Infinite Opto-page reviewers (single-source): "fights headwind like no other disc"; "the most overstable disc I have had the pleasure of throwing"; used for forehands, spike hyzers, skip shots and very windy holes (advanced); "unless you can throw 450+ feet it will just turn left out of your hand immediately" (intermediate); "just too much disc" for most; beat-in copies become "more versatile" with glide and straighter flights. Gold Line page (five): ratings of 13/2/1/6 (three), 13/3/0.5/5 and 13/4/1/6; "the definition of a utility disc for us mere mortals," "not great for beginners since it is so beefy," "tomahawk this disc and it will do the same thing every time," "handles the wind great. I just need to keep it low."
- sources:
  - {name: Latitude 64 Stiletto collection page (13/3/0.5/5, "Overstable"), url: https://latitude64.com/collections/stiletto, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Stiletto (mfr 13/3/0.5/5; reviewers 13/2.7/0.7/5.2), url: https://infinitediscs.com/latitude-64-stiletto, type: retailer, weight: 0.5}
  - {name: Infinite Discs Opto Stiletto (reviewers 13/2.8/0.7/5.2; reviewer text), url: https://infinitediscs.com/Latitude-64-Stiletto/Opto, type: retailer, weight: 0.3}
  - {name: Infinite Discs Gold Line Stiletto (5 ratings; reviewer text), url: https://infinitediscs.com/Latitude-64-Stiletto/Gold-Line, type: retailer, weight: 0.2}
  - {name: Marshall Street Stiletto (13/3/0.5/5; not independent), url: https://www.marshallstreetdiscgolf.com/?s=stiletto&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and both usable reviewer averages (39 and 22 ratings) agree on 0.5/5 to within 0.3, and the text describes the most overstable disc in the lineup that needs 450 ft arms to avoid an immediate left finish, which is Latitude's copy. The reviewers' turn 0.7 and fade 5.2 sit above the published numbers by amounts inside the pooled-wear spread, and a printed fade of 5 leaves little room above it on the rating scale, so a pooled average has more room to drift up than down. The "+1 turn" in Infinite's retailer copy is the one inconsistency and is not supported by Latitude's page. No contradicting evidence found.
- **plasticVariance:** Sold in Opto, Gold Line, Gold Line Burst and special runs; Latitude prints one set of numbers. Opto reviewers report beat-in copies gaining glide and going straighter. Not quantified. Do not average.
- **Linked:** PD2 (new) (Atlas 12/4/0/4; a batch 9 reviewer ranked the PD2 below the Stiletto, consistent here), Trident (6/4/-0.5/3, the batch 5 open fade candidate, unchanged), XXX (7/3/0/4), Pioneer (9/3/0/4), Predator (9/4/1/4) and PD3 (11/3/0/5). The Atlas keeps the Stiletto at the overstable extreme of Latitude's line. Nothing moves.

---

## Batch 10 report (for Freddy)

**Proposed change (1), review-gated:**
- **Synapse turn -1.5 → 0** (|Δ| 1.5; fade unchanged). Thought Space's own product page now prints 12/5/0/3; Infinite, Rocket, LocalRoute and Titan print the same; Marshall Street (the Atlas's source), Disc Golf Dojo and Skyline still print -1.5. Infinite's reviewer averages (30, 8 and 4 ratings) sit at -0.7, -0.9 and -0.3, so they support "less turn" but not "no turn." If you prefer observed flight over the printed number, **turn → -1** is the reviewer-consistent value (|Δ| 0.5, not gated), and the reviewers who compare it to the Destroyer ("a little more turn") fit it better than 0. Confidence 0.55. Review Force, Destroyer, Defender, Wraith, Trespass and Sheriff with it; the Destroyer override is unaffected either way.

**Open candidates (0 new).** None of the other nine reached candidate level.

**Soft watches (not candidates):**
- **Stingray Star turn -3 → -2.5 (|Δ| 0.5):** the Star page averages -2.5 on 11 ratings and four reviewers say it turns far less than -3 new, against a mold-level -2.8 on 62 ratings and Innova's copy. Needs a Star-only sample; possibly a production-run effect.
- **Orion LF fade 2 → 2.5 (|Δ| 0.5):** the 20-rating average is 2.4 and Sirius 2.3, but Millennium's own page was not read and one reviewer attributes the drift to near-max weights.

**Confirmed as-is (9):** Insanity, Octane, Fuse, Stiletto (0.7); Ballista, Rhythm, Stingray (0.65); Orion LF, Muse (0.6). Confirmations mean "no contradicting evidence found," not independent community verification. Orion LF and Muse are the thinnest because the manufacturer's own pages were not reachable.

**Too thin to call (0).**

**Batch 9 addendum:** Thought Space's own Omen page (reachable this session) prints 9/4/0/4 and "dependable overstability … always finishes with a strong fade," confirming the batch 9 Omen numbers from the manufacturer; its confidence could move 0.65 → 0.7. No change to the entry's conclusion.

**Spot-checks needed before any override source note:** Thought Space's Synapse page (the 12/5/0/3 block, read via the fetch step; also whether other Synapse plastics' pages agree and when it changed), the Ballista per-reviewer ratings (the fetch prose disagrees with the printed averages), the Muse "Innova Luna" wording (the Luna is Discraft's), and any quote taken via the summarizing fetch.

**Process notes for the next batch**

- Next ten by `featured.js` order after Stiletto, skipping Beast (batch 4): Astra, Hades, Paradox, Tantrum, Raptor, Monarch, Defender, FD1, P2 (new), FD3 (new). Astra is a Millennium mold (Millennium's own pages were not reachable for the Orion LF either), Hades is linked to the batch 8 Thrasher/Hades/Scorch set, Defender and Raptor are linked to this batch's Synapse and Omen sets, and P2 (new)/FD1/FD3 (new) are Discmania molds, so check Discmania's own page first and distinguish old from new as in batch 9.
- **Open-candidate running list (nothing applied):** unchanged from batch 8 plus this batch's Synapse. Still open: **Trident fade 3 → 3.5, D2 turn 0 → -0.5, MD3 (new) fade (Atlas 1 vs reviewers about 2), Tesla turn -1 → -0.5, Trespass turn -0.5 → -1, Fury fade 2 → 1.5**; gated and awaiting your call: **Luna fade 3 → 2, Gator fade 3 → 4, Synapse turn -1.5 → 0**. Soft watches: Falk turn, Svea turn, A1/A2 spacing, PA3 fade, Lots turn, Voodoo fade, PD2 fade, PD2/Enforcer, **plus this batch's Stingray Star turn and Orion LF fade**.
- **Stale-catalog pattern so far:** Luna (Discraft), Gator (Innova), Synapse (Thought Space). All three were found by comparing the manufacturer's page with Marshall Street's snapshot; the molds Marshall Street still prints at the old number are the ones to watch. Thought Space's other molds (Omen, Muse, Pathfinder) matched or could not be checked.
- **Linked sets re-checked this batch:** Synapse/Force/Destroyer/Defender/Wraith/Trespass/Sheriff (the one that produced the proposal), Insanity/Inertia/Crave/Rhythm/Tesla/Amp/Wave, Ballista/World/Halo/Nuke, Octane/Nuke/Destroyer/Wave/Inertia/Sheriff, Stingray/Wedge/Ruby/Kite/Mirage, Muse/Luna/Pathfinder/Envy, Orion LF/Orion LS/Tesla/Savant, Fuse/River/Pure/Truth/Hex, Rhythm/Crave/Leopard/Switch/Amp, Stiletto/PD2/Trident/XXX/Pioneer/Predator/PD3. Nothing else moves.
- Reachable manufacturer paths this batch: `axiomdiscs.com/discs/{insanity,rhythm}/`, `latitude64.com/collections/{ballista,fuse,stiletto}`, `mvpdiscsports.com/discs/octane/`, `innovadiscs.com/disc/stingray/`, and Thought Space product pages at `thoughtspaceathletics.com/products/<variant-slug>` (found through the collection pages `/collections/{distance-driver,fairway,putter,thought-space-athletics}`: `ethereal-synapse-2`, `ethereal-omen-mandala`; a mold-name slug like `/products/ethos-synapse` or `/products/omen` 404s). Infinite slugs: Insanity and Rhythm plastic pages are `/axiom-insanity/neutron---axiom` and `/axiom-rhythm/neutron---axiom`; Orion LF `/Millennium-Orion-LF/Sirius` and `/millennium-orion-lf/standard`; Stingray `/Innova-Stingray/{Star,DX}`; Octane `/MVP-Octane/Neutron` and `/mvp-octane/plasma`; Ballista `/Latitude-64-Ballista/Opto`; Fuse `/Latitude-64-Fuse/Opto` and `/latitude-64-fuse/gold-line`; Stiletto `/Latitude-64-Stiletto/{Opto,Gold-Line}`; Muse `/Thought-Space-Athletics-Muse/Nerve`; Synapse `/Thought-Space-Athletics-Synapse/Aura` and `/thought-space-athletics-synapse/ethos`.
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access checks when Thought Space renumbered the Synapse and what a fast-arm sample says (the turn question), then the DGCR Trespass threads, then still the Tesla and Gator items.

---

# Batch 11 (Plan 10, Phase 2)

Researched October 3, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (it pulled in unrelated changes; the queue doc is the only locally modified file).

Molds covered: Astra, Hades, Paradox, Tantrum, Raptor, Monarch, Defender, FD1, P2 (new), FD3 (new) (the next ten by `public/featured.js` order after Stiletto; Beast was done in batch 4).

## Batch 11 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Hades | 12/6/-3/2 | none | Confirmed as-is | 0.7 |
| Paradox | 5/4/-4/0 | none | Confirmed as-is | 0.7 |
| Raptor | 9/4/0/3 | none | Confirmed as-is | 0.7 |
| Defender | 13/5/0/3 | none | Confirmed as-is | 0.7 |
| P2 (new) | 2/3/0/1 | none | Confirmed as-is (retailer pools mix old and new) | 0.65 |
| FD3 (new) | 9/4/0/3 | none | Confirmed as-is (retailer pool mixes old and new) | 0.6 |
| Tantrum | 14.5/5/-1.5/3 | none | Confirmed as-is (thin; soft watch on fade) | 0.6 |
| FD1 | 7/4/0/2 | none | Confirmed as-is **on numbers**; **catalog-identity flag** (Discmania renamed the mold in mid-2025) | 0.6 |
| Monarch | 10/5/-4/1 | none | **Too thin to call: turn -4 vs about -3.5 in both Infinite averages and in several reviews (turn -4 → -3.5, not gated)** | 0.5 |
| Astra | 11/5/-1/2 | none | **Too thin to call: turn -1 vs about -1.5 in both Infinite averages, two retailers print -2 (turn -1 → -1.5, not gated; -1 → -2 would be gated)** | 0.5 |

**No changes proposed. Two open candidates (Monarch turn, Astra turn), eight confirmed.** No Luna/Gator/Synapse-style lag against a manufacturer page: the eight molds with a readable manufacturer page all equal their Atlas numbers. The two candidates are the sort the earlier batches recorded rather than proposed: Infinite's reviewer averages say the disc turns more (Astra) or less (Monarch) than printed, the manufacturer layer says the Atlas number, and the Astra's manufacturer layer is itself missing. **The FD1 is the structural story of the batch:** the Atlas "FD1" is the pre-mid-2025 mold, which Discmania now sells as the FD2; "FD1" today is the former Instinct mold (see the entry).

## Evidence limits — batch 11

Same tooling limits as earlier batches; see the pilot section. Specific to this batch:

- **Diff against `flights.json` / `data.json` (done first):** the Atlas numbers equal the Marshall Street snapshot for seven of the ten; **P2 (new)** and **FD3 (new)** come from verified overrides (Discmania collection pages, checked 2026-09-23); **FD1** is a Marshall Street value (its approval is 22-211, Nov 2022) and **has no override**. Compared with current manufacturer pages: **Discmania P2 and FD3 match exactly; Discraft (Hades via the Paul McBeth Z page, Raptor via team.discraft.com), Axiom (Paradox, Tantrum), Innova (Monarch) and Dynamic Discs (Defender) match exactly.** **FD1 does not match Discmania's current FD1 page** (7/5/0/2 there, versus the Atlas 7/4/0/2), for a reason that is a rename, not a renumbering (below). **Astra** could not be checked: Millennium prints no flight numbers on any page I found (a reviewer says so outright), so every Astra number is a retailer's. None of the ten is in `infinite-manufacturer-ratings.json`.
- **Millennium numbers are retailer-sourced, which touches batch 10's Orion LF too.** Marshall Street, Infinite and Rocket Discs print the Astra at 11/5/-1/2; Disc Connection (AU) and Disc Golf Puttheads print 11/5/-2/2 ("Understable"). There is no manufacturer layer to arbitrate, which is why the Astra is held as "too thin."
- **FD1 / FD2 rename, what is known (all via the fetch step, spot-check).** Discmania's FD2 page: "Discs produced before mid-2025 using the FD1 name actually use the same mold as the current FD2. Onwards from mid-2025, the previous FD1 mold has been replaced by the mold previously known as the Instinct." Discmania's Instinct page: the Instinct "was promoted from Discmania's Evolution line to their Originals line starting mid-2025, at which point it was renamed to FD1 … mold specifications remain identical." Discmania's FD1 page prints 7/5/0/2 and says the earlier FD1 iterations were "deemed … a bit too overstable for the slot," but its spec block (21.2 cm, 1.7 cm height, "PDGA approval 2022") is the old FD1's, not the Instinct's: the page mixes the two. The Atlas carries all three approvals: FD1 (22-211, 7/4/0/2, Marshall Street), **FD2 (new)** (25-150, 7/4/0/2, verified override, same numbers as the old FD1) and **Instinct (150-175g)** (19-19, 7/5/0/2, override). A search-summary snippet repeats the rename.
- **P2 and FD3 old-versus-new, what could and could not be separated.** Discmania's own pages label the molds "P2 (new)" (approved 2021) and "FD3" (approved 2022) and print the same numbers the legacy entries carried; no renumbering is stated. Retailer text and eBay listings show the earlier P2 and FD3 were Innova-made ("Innova made," "penned"); the current ones are Discmania-made (the same history as the PD/PD2 and MD3/MD5 entries in batches 5, 8 and 9). **Infinite's P2 and FD3 pages carry no version split** (the fetch step reports that the FD3 page "does not differentiate between the 2015 and 2022 versions"; the P2 pages list current plastics with reviews dated across years, and one FD3 review is dated 2016). Treat every P2 and FD3 retailer number below as old-and-new mixed. Two P2 reviewers say the newer P2s are less overstable than the older ones, which is the *new* mold reading lower than the pooled average, not higher.
- **Reddit** blocked, **YouTube** unreachable, **DGCR** 403 (the FD3, FD2-retooled, Firebird-vs-FD3 and PD threads appear only as search-result titles; none is cited as evidence). All Things Disc Golf's FD3 review was not opened. The Infinite plastic pages for Hades Z Line, Astra Sirius and Astra Standard (some slug forms) 302'd or were not tried.
- **Community layer is the Infinite plastic-page reviewers** (anonymous or first-name, single-source, most with a stated skill class, some with a distance) plus a few retailer summaries. **One named reviewer-site review was readable: Alan (Disc Golf Reviewer, Astra).** Distance bands rather than measured arm speeds: Hades 320–375 ft, Tantrum 400–450+ ft, Raptor 250–450+ ft, Defender 325–550 ft, Monarch 300–400+ ft, Astra 300–330 ft, FD1 275 ft. Confirmations read as "no contradicting evidence found," not independent community verification.
- **Spot-check needed on the Discraft stability ratings.** The summarizing fetches printed "Stability Rating: 2.1" for the Raptor (the same fetch printed the flight numbers as "9 / 4 / 0 / 2.1 / 3," so it is mangled) and "1.0" for the Hades (Z page). Not used for any conclusion.
- **Infinite reviewer averages pool plastics and wear.** Used as coarse retailer-type evidence at capped weight; never alone for a proposal.
- **Marshall Street is the Atlas's own source** and was used only as baseline (for the Astra, one of two number sets it is split against).
- Page contents came through a summarizing fetch step; spot-check any quote before it goes into an override's source note.

---

## Hades — Discraft (id 68bc409ff25f)

- **Atlas now:** 12/6/-3/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): ESP (Z and Big Z are the other common ones; all Paul McBeth Line).
- **Manufacturer:** Discraft 12/6/-3/2 (the Paul McBeth Z Hades page fetched; the team.discraft.com page 404'd), stability 1.0 (spot-check). Copy: "The Hades offers a straight-to-understable flight with massive glide, now enhanced with the Z plastic blend. Perfect for intermediate to advanced players … long, controlled drives." Search-summary background: "Paul rounds off his 5th disc release with the Hades. Think of this as a compliment to the iconic Zeus. Controllable power that's manageable by all skill levels." **Copy-versus-number tension:** "straight-to-understable" and "controllable" against a -3 turn and the reviewers' "touchy" and "far flippier than I was expecting." Infinite and Marshall Street "Understable."
- **Retailer:** Infinite reviewer numbers 12/5.9/-2.8/2 (88 reviews, 4.41 stars); ESP page 12/5.9/-3/2. Turn within 0.2, fade exact. Marshall Street 12/6/-3/2 (baseline).
- **Community:** Infinite ESP-page reviewers (five, single-source, intermediate): "extremely touchy and understable" (375 ft, max-weight ESP, "very flat"); "far flippier than I was expecting … stock runs more stable than prototypes"; "this thing just floats … perfect flex disc" and a max-distance pick for slower arms; "one of the better fast, understable drivers on the market" (avoids flat copies; domed ones perform better); a 320 ft thrower says prototype and stock runs "differ significantly." All five rate it 12/5–6/-3/2.
- sources:
  - {name: Discraft Paul McBeth Z Hades page (12/6/-3/2, stability 1.0), url: https://www.discraft.com/paul-mcbeth-z-hades-mcbethzhades, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Hades (mfr 12/6/-3/2; reviewers 12/5.9/-2.8/2), url: https://infinitediscs.com/discraft-hades, type: retailer, weight: 0.5}
  - {name: Infinite Discs ESP Hades (reviewers 12/5.9/-3/2; reviewer text), url: https://infinitediscs.com/Discraft-Hades/ESP, type: retailer, weight: 0.3}
  - {name: Marshall Street Hades (12/6/-3/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=hades&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and both reviewer averages (88 ratings, plus the ESP page) agree on -3/2 to within 0.2, and the text describes a very understable, glidey 12-speed that needs touch, which is what -3/2 says. The "stock versus prototype" and "domed versus flat" remarks are run and shape variation. No contradicting evidence found.
- **plasticVariance:** Sold in Z Line, Big Z, ESP and many signature and special runs (20 at Infinite); Discraft prints one set of numbers. Reviewers report production-run and dome differences. Not quantified. Do not average.
- **Linked:** Thrasher (Atlas 12/5/-3/2, identical turn and fade, which a batch 8 reviewer called "flies almost exactly like the Hades"), Scorch (11/6/-2/2), Flash (10/5/-2/3), Zeus (not re-read), Hades's understable neighbours Eclipse (7/5/-2/2) and Archon (11/5/-2/2). Nothing moves.

## Paradox — Axiom (id 18dfd3ab8675)

- **Atlas now:** 5/4/-4/0 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Neutron.
- **Manufacturer:** Axiom 5/4/-4/0, "Understable" (page fetched). Copy: "Among the most understable midranges ever produced, the Paradox is capable of some truly unique lines. High-power players will be using the Paradox for utility shots like rollers, low-speed-flip-ups, massive nose-up-anhyzers … Low-power players will find the Paradox is a great first midrange for straight or hyzer-flip flights." Copy and numbers agree. Infinite: "Very Understable," "wants to turn"; Marshall Street "Very Understable."
- **Retailer:** Infinite reviewer numbers 5/4.1/-3.9/0.1 (44 reviews, 4.55 stars); Neutron page 5/4.1/-3.9/0.1 (39 reviews). Turn within 0.1, fade within 0.1. Marshall Street 5/4/-4/0 (baseline).
- **Community:** Infinite Neutron-page reviewers (single-source): "about as understable as it gets" (advanced, 350 ft); "excellent beginner midrange," flat releases give a straight flight for about 75% of it before a gentle fade (beginner); "not truly beginner friendly" without knowing hyzer flips (beginner, 300 ft); "a must have utility disc" (intermediate); "turns over with very little effort and will never fade back … ever" (advanced); poor in wind; good for tight woods.
- sources:
  - {name: Axiom Paradox page (5/4/-4/0, "Understable"), url: https://axiomdiscs.com/discs/paradox/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Paradox (mfr 5/4/-4/0; reviewers 5/4.1/-3.9/0.1), url: https://infinitediscs.com/axiom-paradox, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Paradox (reviewers 5/4.1/-3.9/0.1; reviewer text), url: https://infinitediscs.com/axiom-paradox/neutron---axiom, type: retailer, weight: 0.3}
  - {name: Marshall Street Paradox (5/4/-4/0; not independent), url: https://www.marshallstreetdiscgolf.com/?s=paradox&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and both reviewer averages (44 and 39 ratings) agree on -4/0 to within 0.1, and the text describes an extremely understable midrange that flips and turns with little power and does not fade back, which is Axiom's copy. No contradicting evidence found.
- **plasticVariance:** Sold in Neutron, Proton, Proton Soft and Total Eclipse; Axiom prints one set of numbers. Not quantified. Do not average.
- **Linked:** Kite (Atlas 5/6/-3/1), Stingray (4/5/-3/1), Mirage (3/4/-3/0), Roadrunner (9/5/-4/1), Mamba (11/6/-5/1). The Atlas has the Paradox at the most understable end of the 4-to-5-speed group, as Axiom's "among the most understable midranges ever produced" says. Nothing moves.

## Tantrum — Axiom (id 98cf39058c00)

- **Atlas now:** 14.5/5/-1.5/3 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Soft watch noted below. Reference plastic: Neutron (the only plastic line at Infinite besides its misprints).
- **Manufacturer:** Axiom 14.5/5/-1.5/3, "Stable-Understable" (page fetched). Copy: "The Tantrum's sweeping lines and hyzerflip potential allow power throwers to shape all kinds of shots. The Tantrum is best described as a beat-in Teleport, with huge glide and distance potential." Arm-speed copy: expert power "a significant turn with a reliable fade," average throwers "straight-stable with a sharp fade," low power "a very overstable flight without max distance gains, fading early in flight." **Label contradiction, same numbers:** Axiom "Stable-Understable"; Infinite "Stable"; Marshall Street "Overstable." The copy itself spans understable to very overstable by arm speed.
- **Retailer:** Infinite reviewer numbers 14/5/-1.5/2.6 (14 reviews, 4.71 stars); Neutron page the same (14 ratings). Turn exact, fade 0.4 under the published 3; speed reads 0.5 low (outside scope). Marshall Street 14.5/5/-1.5/3 (baseline).
- **Community:** Infinite Neutron-page reviewers (14, single-source; per-reviewer fade 2 to 3.5): "matches/exceeds distance from Destroyers" (intermediate, 425 ft, rated 14/5/-1/2.5); "late turn and just a tiny bit more fade" (beginner, 400 ft); "flies like a well beat in Nuke with more distance"; "flies like a faster Star Wraith"; "like a Teleport but with a lot more fade" (rated 14/4/-1.5/3.5); "450' and past 415' very consistently" (advanced); "really nice high speed turn with good fade" (rated -1/2); a professional rates it -2/2.5. Distances 400–450+ ft.
- sources:
  - {name: Axiom Tantrum page (14.5/5/-1.5/3, "Stable-Understable"), url: https://axiomdiscs.com/discs/tantrum/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Tantrum (mfr 14/5/-1.5/3; reviewers 14/5/-1.5/2.6), url: https://infinitediscs.com/axiom-tantrum, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Tantrum (14 ratings; reviewer text), url: https://infinitediscs.com/axiom-tantrum/neutron---axiom, type: retailer, weight: 0.3}
  - {name: Marshall Street Tantrum (14.5/5/-1.5/3; not independent), url: https://www.marshallstreetdiscgolf.com/?s=tantrum&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** Manufacturer and the reviewer average agree on -1.5 turn exactly, and the text, all from 400 ft-plus throwers, describes a beat-in-Teleport-class driver with turn and a firm finish, which is Axiom's copy. **Soft watch, not a candidate:** the fade average is 2.6 against a printed 3, with per-reviewer ratings from 2 to 3.5. That is a 0.4 offset on 14 ratings from one plastic, and the copy itself says the finish is "sharp" for average arms. If a firmer read ever supports it, fade 3 → 2.5 would be the one to consider (|Δ| 0.5, not gated). Thin sample, so this reads "no contradicting evidence found."
- **plasticVariance:** Sold in Neutron (and misprints); Axiom prints one set of numbers. Not quantified. Do not average.
- **Linked:** Teleport (Atlas 14.5/5/-1.5/2.5, the disc Axiom's copy anchors on; the Atlas gives the Tantrum half a point more fade, as the copy and a reviewer's "Teleport with more fade" say), Nuke (13/5/-1/3, a reviewer's "beat-in Nuke" comparison), Destroyer (12/5/-0.5/3.5), Wraith (11/5/-1/3). The Destroyer's Atlas adjustment is unaffected. Nothing moves.

## Raptor — Discraft (id 35a861477cf9)

- **Atlas now:** 9/4/0/3 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): ESP (a 50-plus-variant disc at Infinite).
- **Manufacturer:** Discraft 9/4/0/3 (team.discraft.com page fetched; stability 2.1, spot-check, see the evidence limits). Copy: "Confidence is KING. This First Run Raptor driver has been a collaboration between our Team Discraft captain, Paul Ulibarri and our R&D guys. Driving into wind - check. Flex shots, Sidearm - check, check. The Raptor delivers the most confidence you've ever felt in a driver under 300ft." Copy and numbers agree. Infinite: "a flat top and overstable finish … extremely comfortable as a forehand and backhand driver"; Marshall Street "Very Overstable."
- **Retailer:** Infinite reviewer numbers 9/4/-0.1/3 (81 reviews, 4.7 stars); ESP page 9/4/0/3. Turn within 0.1, fade exact. Marshall Street 9/4/0/3 (baseline).
- **Community:** Infinite ESP-page reviewers (single-source): "starts out straight for 300+ feet and then a moderate fade out the end for people with 450+ feet of power" (advanced); "most reliable distance I currently have on the forehand side" (intermediate, 300 ft); "perfect for flex forehand shots … dead straight and fades hard" (advanced, about 250–275 ft); "couldn't throw it initially due to overstability; now loves it for forehands" (intermediate); spike hyzers and skip shots; "workable compared to the Firebird"; two outliers rate 9/3.5/0/2.5 and 9/4.5/-0.5/4.
- sources:
  - {name: Discraft Raptor team page (9/4/0/3, stability 2.1), url: https://www.team.discraft.com/discs/raptor, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Raptor (mfr 9/4/0/3; reviewers 9/4/-0.1/3), url: https://infinitediscs.com/discraft-raptor, type: retailer, weight: 0.5}
  - {name: Infinite Discs ESP Raptor (reviewers 9/4/0/3; reviewer text), url: https://infinitediscs.com/Discraft-Raptor/ESP, type: retailer, weight: 0.3}
  - {name: Marshall Street Raptor (9/4/0/3; not independent), url: https://www.marshallstreetdiscgolf.com/?s=raptor&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and both reviewer averages (81 ratings, plus the ESP page) agree on 0/3 to within 0.1, and the text, from 250 ft to 450+ ft throwers, describes a flat, overstable driver with a reliable fade that is a forehand favorite, which is Discraft's copy. The over-stable-for-a-beginner remark is the usual arm-speed spread. No contradicting evidence found.
- **plasticVariance:** Sold in 50-plus variants (ESP, Z, Big Z, Jawbreaker, CryZtal, Titanium and others); Discraft prints one set of numbers. Not quantified. Do not average.
- **Linked:** Firebird (Atlas 9/3/0/4, the disc reviewers compare it to), Omen (9/4/0/4, batches 9 and 10), Predator (9/4/1/4), Thunderbird (9/5/0/2), Teebird (7/5/0/2) and Defender at a higher speed. The Atlas keeps the Raptor between the Thunderbird and the Omen on fade, as the "more moderate" remark in the batch 9 Omen entry implies. Nothing moves.

## Monarch — Innova (id 808ebf0c71d5)

- **Atlas now:** 10/5/-4/1 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Evidence too thin to call. **Open candidate: turn -4 → -3.5** (|Δ| = 0.5, below the review gate). Reference plastic: Star (per the policy); **the Star page has zero ratings**, so the Champion page stands in.
- **Manufacturer:** Innova 10/5/-4/1 (page fetched; lists Champion only; no stability label printed beyond "high speed turn"). Copy: "a long-range Distance Driver with a significant high speed turn. This predictable high speed turn makes the Monarch a good choice for beginning players and those with slower arm speeds. The Monarch also makes a great roller disc. This disc is much like a faster Roadrunner with more glide." Copy and numbers agree. Infinite: "very understable yet suitable for forehand throws, with excellent glide"; Marshall Street "Very Understable."
- **Retailer:** Infinite reviewer numbers 10/5/-3.6/1.1 (51 reviews, **3.78 stars**, the lowest rating in this batch); Champion page 10/5/-3.5/1.1 (35 ratings). **Turn averages run 0.4–0.5 above (less understable than) the published -4 on both pages**, fade within 0.1. Marshall Street 10/5/-4/1 (baseline).
- **Community:** Infinite Champion-page reviewers (single-source, distances 300 to 400+ ft): "exactly what it's designed to do FLIP" (advanced, rated 10/5/-4/1); "nice consistent turnover" (-3); against it: "could never get it to turn anywhere near the -4 figure" (rated 10/5/-1.5/2); "a new disc will not turn as advertised … more of a -2 than a -4"; "acts more stable than the numbers" (-3/1.5); "closer to -1 than the -4 listed." Distances: "300+ on a hyzer flip" (advanced), "100 extra feet" over the previous driver (beginner), "400+" (beginner). The rating distribution is wide (23% five stars, 17% two stars or lower).
- sources:
  - {name: Innova Monarch page (10/5/-4/1), url: https://www.innovadiscs.com/disc/monarch/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Monarch (mfr 10/5/-4/1; reviewers 10/5/-3.6/1.1; 3.78 stars), url: https://infinitediscs.com/innova-monarch, type: retailer, weight: 0.5}
  - {name: Infinite Discs Champion Monarch (35 ratings; reviewers 10/5/-3.5/1.1; reviewer text), url: https://infinitediscs.com/Innova-Monarch/Champion, type: retailer, weight: 0.3}
  - {name: Infinite Discs Star Monarch (0 ratings), url: https://infinitediscs.com/Innova-Monarch/Star, type: retailer, weight: 0.0}
  - {name: Marshall Street Monarch (10/5/-4/1; not independent), url: https://www.marshallstreetdiscgolf.com/?s=monarch&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.5
- **consensusNote:** Manufacturer says -4 and so does Innova's "much like a faster Roadrunner" (the Atlas Roadrunner is -4), but both Infinite averages (51 and 35 ratings) sit at -3.5 to -3.6 and several reviewers say it turns far less than -4, at least one to about -1. Because Infinite displays -4, anchoring would pull the averages toward -4, not away, so the 0.4–0.5 offset is not an anchoring artifact. Held back because Innova's own number and copy say -4, the sample mixes wear and weights (the Champion page's reviewers spread from -1 to -4), no named reviewer and no stated arm speed beyond distance bands, and the Star plastic the policy names has no reviews at all. If you want observed flight over the printed number, **turn -4 → -3.5 is the single candidate.** It needs a Star-plastic sample or a named fast-arm reviewer to become a proposal. **Linked check, review as a set if it moves:** Roadrunner (Atlas 9/5/-4/1, which Innova's copy anchors on), Mamba (11/6/-5/1), Shryke (13/6/-2/2), Hades (12/6/-3/2) and Katana (13/5/-3/3). A Monarch at -3.5 would sit between the Roadrunner and the Hades.
- **plasticVariance:** Sold in Champion, Star, Halo Star and special runs; Innova prints one set of numbers. Reviewers: a new disc "will not turn as advertised" and turns more once worn. Not quantified; the Star page has no data. Do not average.

## Defender — Dynamic Discs (id b1e0347018d7)

- **Atlas now:** 13/5/0/3 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Lucid.
- **Manufacturer:** Dynamic Discs 13/5/0/3, "Overstable" (collection page fetched). Copy: "The problem with the highest-speed discs is that they are historically understable. This is no longer an issue. The Dynamic Discs Defender is here. Fast. Stable. Neither of these descriptions will be in dispute after you unleash this scorcher. You will no longer have to put away your high-speed discs when the wind begins to blow." **Label-versus-copy note, same numbers:** "Overstable" on the label and "Fast. Stable." in the copy; both describe the same disc. Infinite: "a super-fast overstable driver with a big rim and big fade," placed between two other Dynamic models; Marshall Street "Overstable."
- **Retailer:** Infinite reviewer numbers 13/4.9/0/3.1 (71 reviews, 4.54 stars); Lucid page about 13.1/4.95/-0.05/3.14 (22 ratings with flight numbers). Turn within 0.1, fade within 0.2. Marshall Street 13/5/0/3 (baseline).
- **Community:** Infinite Lucid-page reviewers (single-source, distances stated): a beginner at 450 ft forehand and 400 ft backhand; an advanced thrower at 350 ft-plus who prefers Lucid for consistency; an intermediate at 325–330 ft who "outperformed Star Destroyer by 20 feet"; an intermediate at 380 ft, "fades hard" despite a strong throw; "meathook, prefers World" (intermediate, 350 ft max); "dump right out of the hand" (intermediate, about 400 ft forehand); a professional at 550+ ft (at 6,600 ft altitude). Per-reviewer turns range from -0.5 to +1, fade from 3 to 4. Most experienced throwers report 350–450+ ft; not recommended for beginners.
- sources:
  - {name: Dynamic Discs Defender collection page (13/5/0/3, "Overstable"), url: https://www.dynamicdiscs.com/collections/dynamic-discs-defender, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Defender (mfr 13/5/0/3; reviewers 13/4.9/0/3.1), url: https://infinitediscs.com/dynamic-discs-defender, type: retailer, weight: 0.5}
  - {name: Infinite Discs Lucid Defender (22 ratings; reviewer text), url: https://infinitediscs.com/dynamic-discs-defender/lucid, type: retailer, weight: 0.3}
  - {name: Marshall Street Defender (13/5/0/3; not independent), url: https://www.marshallstreetdiscgolf.com/?s=defender&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and both reviewer averages (71 and 22 ratings) agree on 0/3 to within 0.2, and the text, from 325 to 550+ ft throwers, describes a fast, overstable driver with a hard finish, which is Dynamic's copy. No contradicting evidence found.
- **plasticVariance:** Sold in Lucid, Fuzion and many other blends (the Infinite page lists grades from Air Bubbles to Premium); Dynamic prints one set of numbers. A reviewer prefers Lucid for consistency. Not quantified. Do not average.
- **Linked:** Synapse (Atlas 12/5/-1.5/3, the batch 10 gated turn proposal: a Synapse at 0 would match the Defender's turn and fade), Force (12/5/0/3), Destroyer (12/5/-0.5/3.5), Enforcer (12/4/0.5/4), Sheriff (13/5/-1/2) and Trespass (12/5/-0.5/3, the open turn candidate). The Atlas Defender is unchanged by any of those; the Synapse proposal would put the two at the same turn and fade. Nothing moves.

## FD1 — Discmania (id 3bd98a3bc639)

- **Atlas now:** 7/4/0/2 (source: Marshall Street snapshot; PDGA approval 22-211, Nov 2022; no override). **Proposed turn/fade:** none on this entry's own numbers, which describe the mold they name. **Catalog-identity flag below.** Reference plastic (assumed most-thrown): C-Line.
- **Manufacturer:** Discmania's FD1 page prints **7/5/0/2** and the copy "a tick more fade, while still offering a good bit of glide" than its predecessor, with the note that earlier iterations were "deemed … a bit too overstable for the slot"; its spec block (21.2 cm, 1.7 cm height, PDGA 2022) is the old FD1's, so the page mixes old and new. Discmania's FD2 page prints **7/4/0/2** (PDGA 2025, 21.2 cm, 1.8 cm height) with "straight-to-stable … dependable fade … relatively mild glide." Discmania's Instinct page prints 7/5/0/2. **The rename (fetch-step wording, spot-check):** discs sold as FD1 before mid-2025 are the mold now sold as FD2 (the Atlas's FD1 and its FD2 (new)); from mid-2025 the Instinct mold is sold as FD1 (the Atlas's Instinct). Infinite's FD1 page still describes "a new mold made only from Discmania's factory in Sweden" with manufacturer numbers 7/4/0/2.
- **Retailer:** Infinite lists 7/4/0/2; its C-Line page reviewer numbers are 7/4.1/0/2 (5 ratings, all five stars; all five reviews appear to be of the old mold). Too few to use as an average. Marshall Street 7/4/0/2 (baseline, "Overstable").
- **Community:** Infinite C-Line reviewers (five, single-source): "a very nice OS/utility fairway for me. It's more OS than the numbers suggest" (intermediate, 275 ft, rated 7/3/0/3); "crazy straight for a fairway driver" (intermediate, 275 ft, rated 7/6/0/0.5); "fantastic stable fairway driver … one of the best stable fairways out there" (advanced, 7/4/0/2); "easily my favorite 7 speed" (advanced, 7/4/0/2); a beginner rates it 7/4/0/2. Search-summary retailer text: "a nice moderate profile similar to an Innova Eagle," "enough glide to manipulate a lot of lines but also enough fade to be plenty reliable."
- sources:
  - {name: Discmania FD1 collection page (7/5/0/2; mixes old and new), url: https://www.discmania.net/collections/fd1, type: manufacturer, weight: 0.6}
  - {name: Discmania FD2 collection page (7/4/0/2, rename note), url: https://www.discmania.net/collections/fd2, type: manufacturer, weight: 1.0}
  - {name: Discmania Instinct collection page (7/5/0/2, rename note), url: https://www.discmania.net/collections/instinct, type: manufacturer, weight: 0.6}
  - {name: Infinite Discs C-Line FD1 (reviewers 7/4.1/0/2; 5 ratings; reviewer text), url: https://infinitediscs.com/discmania-fd1/c-line, type: retailer, weight: 0.3}
  - {name: Marshall Street FD1 (7/4/0/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=FD1&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** For the mold the entry names (the pre-mid-2025 FD1, now the FD2), the numbers hold: Discmania's FD2 page prints 7/4/0/2 and the five C-Line reviewers agree within the usual spread (one "more OS than the numbers," one "crazy straight"). **The identity issue is separate from turn and fade.** A shopper who buys an "FD1" today gets the Instinct mold (7/5/0/2, glide 5, which is outside turn/fade scope but is a one-point glide difference), and Discmania's own FD1 page mixes the two molds' details. Neither mold changes the 0/2 turn and fade. **For your call (not a number correction):** whether the featured "FD1" should keep pointing at the 22-211 approval, be repointed to the Instinct approval (19-19) as the current FD1, or be relabeled; and whether the Atlas's FD1 and FD2 (new) (identical numbers, per Discmania the same mold) should be treated as duplicates for map placement. I did not resolve this: the Atlas keeps historical approvals separate by design.
- **plasticVariance:** Sold in C-Line, S-Line and First Run C-Line; Discmania prints one set of numbers. Not quantified. Do not average.
- **Linked:** FD2 (new) (Atlas 7/4/0/2, same mold per Discmania), Instinct (7/5/0/2), FD (new) (7/6/0/1), FD3 (new) (9/4/0/3), Eagle (not in the Atlas) and Teebird (7/5/0/2). Nothing moves.

## P2 (new) — Discmania (id 88a46cb35be1)

- **Atlas now:** 2/3/0/1 (source: verified override, Discmania collection page, checked 2026-09-23; PDGA approval 21-78, Jul 2021). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): D-Line (Flex 2).
- **Manufacturer:** Discmania 2/3/0/1, "Stable" (collection page fetched). Copy: "The P2 Pro Putter is our most popular disc of all time. It is the favourite putting putter for top pros and casual players alike. The P2 offers a stable and reliable flight in high and low speeds and its ergonomic rim makes it easy to grip on both putts and drives. It's a true Discmania classic." The page labels the version "P2 (new)," PDGA 2021. No number change between versions is stated. Copy and numbers agree. Infinite "Stable"; Marshall Street (snapshot) "Overstable."
- **Retailer (mixed old and new, see the evidence limits):** Infinite reviewer numbers 2/3/0/1.1 on the D-Line Flex 2 page (70 ratings, 4.6 stars) and 2/3/0/1.1 on the P-Line Flex 2 page (31 ratings, 4.7 stars). Turn exact, fade within 0.1. Search-summary Infinite pages give the Signature C-Line P2 4.6 on 5 ratings.
- **Community (mixed old and new):** Infinite D-Line reviewers (single-source): most rate 2/3/0/1; a few 2/3/0/1.5 or 2/3/0/2; "sticks to the chains very well" (advanced); "best disc for putting on the market" (advanced, fade 2); "right off the bat I noticed the new P2's are less stable than the old" (rated 2/3/-0.5/1); "the newer P2s are less over stable than the older P2s" (a second reviewer). P-Line page: "will literally immediately hyzer" when new, "beats in to dead straight"; P-Line "can feel too slippery." Search-summary retailer text: the new, Discmania-made P2 is "nearly identical to the original P2 in its shape," "great overstability as brand new, and becomes very stable and not understable when beaten in," and gets "chipped and worn much quicker than the old Innova made D-lines."
- sources:
  - {name: Discmania P2 collection page (2/3/0/1, "Stable", P2 (new) 2021), url: https://www.discmania.net/collections/p2, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs D-Line P2 (reviewers 2/3/0/1.1; 70 ratings; old and new mixed), url: https://infinitediscs.com/Discmania-P2/D-Line, type: retailer, weight: 0.4}
  - {name: Infinite Discs P-Line P2 (reviewers 2/3/0/1.1; 31 ratings), url: https://infinitediscs.com/Discmania-P2/P-Line, type: retailer, weight: 0.3}
  - {name: Rocket Discs P2 (new) listing (old/new split; search result, not read), url: https://rocketdiscs.com/discmania-p2-(new), type: retailer, weight: 0.1}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and both Infinite averages agree on 0/1 to within 0.1, and the text describes a stable, straight putter with a soft finish, which is Discmania's copy. The two reviewers who say the *new* P2 is less overstable than the old are consistent with the Atlas holding the new mold at fade 1 (the old Innova-made P2 would read higher), so they are not a contradiction. Held at 0.65 because the pools cannot be split into old and new. No contradicting evidence found.
- **plasticVariance:** Sold in D-Line (Flex 1, 2, 3), P-Line (Flex 2) and S-Line plus signature runs; Discmania prints one set of numbers. D-Line is reported to beat in fastest and to wear faster in the new mold; P-Line is grippier and slightly more understable than S and C. Not quantified. Do not average.
- **Linked:** P2x (Atlas 2/3/0/1, same numbers), Link (2/3/0/1), Judge (2/4/0/1), Aviar (2/3/0/1) and Reko (3/3/0/1). The Atlas has the P2 (new) with the Aviar and Link. Nothing moves.

## FD3 (new) — Discmania (id b2c132ff6485)

- **Atlas now:** 9/4/0/3 (source: verified override, Discmania collection page, checked 2026-09-23; PDGA approval 22-98, Jun 2022). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): C-Line.
- **Manufacturer:** Discmania 9/4/0/3 (collection page fetched), "most stable fairway driver in the Originals line." Copy: "For many players it will be an utility driver that only comes out in specific situations, like in strong headwinds or to cut tight corners. For players with more arm speed, it will hold a straight line for a longer time, before the inevitable fade." The page lists PDGA 2022 and C-Line and S-Line. No number change between versions is stated. Copy and numbers agree. Infinite's description: "a beefy fairway driver … long but powerful and forward-penetrating fade," "very close to the Power Driver (PD) in terms of flight ratings … noticeably more overstable." Marshall Street (snapshot) "Overstable."
- **Retailer (mixed old and new, see the evidence limits):** Infinite reviewer numbers 9/4/0/3 (70 reviews, 4.7 stars); C-Line page 9.1/4.1/0/3 (27 reviews, 4.6 stars); S-Line page one rating, 9/4/0/3 (dated 2016). Turn exact, fade exact. The page does not separate the 2015 and 2022 molds.
- **Community (mixed old and new):** Infinite C-Line reviewers (single-source): "you can always trust this disc in the wind to be nice and stable … go to hyzer disc from anywhere from 350 ft in" (advanced); a professional compares it to the Firebird with "slightly higher glide" and "slightly less harsh fade"; "I do not recommend this disc to start off with. If you don't have the power to throw this disc it will not perform the way you would expect" (intermediate); "if you've got a big power forehand, you need this disc" (advanced); replacement discs "fly the exact same" (advanced). The one S-Line review (2016, advanced): "a very over stable fairway driver … a lot of glide … beats in to be a very straight and reliable flier." Search-summary DGCR text (title and snippet only): the Innova-made C-Line was the most stable of three eras, the Metal Flake the least.
- sources:
  - {name: Discmania FD3 collection page (9/4/0/3, "most stable fairway driver in the Originals line"), url: https://www.discmania.net/collections/fd3, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs FD3 (mfr 9/4/0/3; reviewers 9/4/0/3; 70 ratings; old and new mixed), url: https://infinitediscs.com/Discmania-FD3, type: retailer, weight: 0.4}
  - {name: Infinite Discs C-Line FD3 (reviewers 9.1/4.1/0/3; 27 ratings; reviewer text), url: https://infinitediscs.com/discmania-fd3/c-line, type: retailer, weight: 0.3}
  - {name: Infinite Discs S-Line FD3 (1 rating, 2016), url: https://infinitediscs.com/discmania-fd3/s-line, type: retailer, weight: 0.1}
- **confidence:** 0.6
- **consensusNote:** Manufacturer and both Infinite averages agree on 0/3 exactly, and the text describes a beefy, overstable fairway driver that needs power, which is Discmania's copy. Held at 0.6 because the 70-rating pool mixes the 2015 (Innova-made) and 2022 (Discmania-made) molds, one retailer-quoted forum summary says the older Innova C-Line was the most stable of the eras, and no version-labeled review was readable. No contradicting evidence found.
- **plasticVariance:** Sold in C-Line, S-Line, Flex 1 C-Line, Horizon and Metal Flake variants; Discmania prints one set of numbers. A forum summary (not read) says the Metal Flake runs less stable and the older Innova C-Line more. Not quantified. Do not average.
- **Linked:** FD1 and FD2 (new) (7/4/0/2), FD (new) (7/6/0/1), PD (new) (10/4/0/3) and PD2 (new) (12/4/0/4) from batch 9, Firebird (9/3/0/4) and Raptor (9/4/0/3). The Atlas orders FD < FD2 < FD3 on fade, and puts the FD3 at the PD's turn and fade, as Infinite's description says. Nothing moves.

## Astra — Millennium (id 0f303e1b60f6)

- **Atlas now:** 11/5/-1/2 (source: Marshall Street snapshot). **Proposed turn/fade:** none. Evidence too thin to call. **Open candidate: turn -1 → -1.5** (|Δ| = 0.5, below the review gate; **-1 → -2 would be |Δ| 1.0 and gated**). Reference plastic (assumed most-thrown, not verified): Standard (Sirius and Quantum are the premium blends).
- **Manufacturer:** Millennium 11/5/-1/2 — **no manufacturer page found, and Millennium prints no flight numbers on the pages I could reach** (Disc Golf Reviewer's Alan says the numbers are estimated by players). **[Amended Oct 3, 2026, batch 13: Millennium's own site (golfdisc.com) does publish qualitative labels but no digits. The Astra reads "Slightly Understable," which supports the approved -1.5 move (not a numeric source; read via the fetch step, spot-check before any override source note).]** Retailer-carried Millennium copy: "one of the best high speed distance drivers for beginners and intermediate players"; "average players can release the Astra flat and watch it sail down the fairway and end with a predictable fade. More experienced player will find a great hyzerflip and roller disc"; Marshall Street: "an ultra long range driver that is considered straight to understable." **Retail split, no arbiter:** Marshall Street, Infinite and Rocket Discs print -1 (Rocket labels it "Understable"); Disc Connection (AU) and Disc Golf Puttheads print **-2**, the latter "Understable" and "Standard beats in to fly more understable, while Quantum holds stability longer."
- **Retailer:** Infinite reviewer numbers 10.9/5.1/-1.5/1.9 (15 reviews, 4.47 stars); Standard page 10.9/5/-1.4/1.9 (about six readable per-reviewer ratings). **Turn averages sit 0.4–0.5 more understable than the printed -1 on both pages**, fade within 0.1. Marshall Street 11/5/-1/2 (baseline, "Stable").
- **Community:** Infinite Standard-page reviewers (single-source, intermediate to professional, no distances): "step up in stability from the Aries … holds a nice straight line, with a little bit of turn when thrown hard" (rated 11/5/-2/2); a professional rates it 11/5/-2.5/2, "similar to Innova Archon"; "out of the box it flies like a more overstable disc, but as it breaks in it's getting more turn" (rated -2/2); "flies so understable that it crashes to the right" once broken in (rated 10/5/-3/0.5, 300-plus ft); "best an-hyzer disc out there … a solid 330 around a corner" (advanced); "significant turn-over after extended use with Standard plastic" (advanced). Alan (Disc Golf Reviewer, Millennium Standard, no stated arm speed, added about 30 ft): "incredibly fast, understable, and forgiving, especially for backhand throwers … tends to self-correct mid-flight," with numbers he estimates at 11/6/-3/1, and "I struggle throwing it forehand … it turns over, heads for the ground."
- sources:
  - {name: Infinite Discs Astra (mfr 11/5/-1/2; reviewers 10.9/5.1/-1.5/1.9), url: https://infinitediscs.com/millennium-astra, type: retailer, weight: 0.5}
  - {name: Infinite Discs Standard Astra (reviewers 10.9/5/-1.4/1.9; reviewer text), url: https://infinitediscs.com/millennium-astra/millennium-standard, type: retailer, weight: 0.3}
  - {name: Disc Golf Reviewer Astra review (Alan, Standard), url: https://discgolfreviewer.com/millenium-astra/, type: community, weight: 0.3}
  - {name: Rocket Discs Standard Astra (11/5/-1/2, "Understable"), url: https://rocketdiscs.com/millennium-astra/millennium-standard, type: retailer, weight: 0.2}
  - {name: Disc Connection Astra (11/5/-2/2), url: https://www.discconnection.com.au/products/millennium-astra, type: retailer, weight: 0.2}
  - {name: Disc Golf Puttheads Astra chart (11/5/-2/2, templated), url: https://www.dgputtheads.com/flight-charts/astra, type: retailer, weight: 0.1}
  - {name: Marshall Street Astra (11/5/-1/2 in the snapshot; not independent), url: https://www.marshallstreetdiscgolf.com/?s=astra&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.5
- **consensusNote:** There is no manufacturer layer to weigh, two retailers print -2 and three print -1, and every reviewer source I could read says the disc turns more than -1: the Infinite averages (-1.5 and -1.4), the per-reviewer ratings (-2 to -3 for the readable ones), the named reviewer (-3), and the text ("understable," "crashes to the right" when worn). Because Infinite displays -1, anchoring would pull the averages toward -1, not away, so the real reading is probably nearer -1.5 to -2. Held back because the retail catalog itself is split and unverifiable, the sample is 15 pooled ratings dominated by Standard plastic (which beats in fast), and no reviewer states an arm speed. If you want observed flight over the printed number, **turn -1 → -1.5 is the single non-gated candidate**, and **-2 is the value two retailers print** (gated, |Δ| 1.0). It needs a Millennium-sourced number or a Sirius/Quantum sample to become a proposal. **Linked check, review as a set if it moves:** Aries (Atlas 11/6/-4/2, which reviewers call less stable than the Astra), Orion LF (9/5/-1/2, batch 10), Archon (11/5/-2/2, a reviewer's comparison, which a -2 Astra would match), Quasar (not yet researched) and Wraith (11/5/-1/3).
- **plasticVariance:** Real, per Disc Golf Puttheads and reviewers: Standard beats in fast and gets more understable; Quantum holds stability longer; Sirius is the premium grip blend. Millennium prints no numbers by plastic. Not quantified. Do not average.

---

## Batch 11 report (for Freddy)

**Proposed changes (0).** All eight molds with a readable manufacturer page equal their Atlas numbers on turn and fade.

**Open candidates (2), both not gated:**
- **Monarch turn -4 → -3.5** (|Δ| 0.5). Infinite's mold-level (51 ratings) and Champion (35 ratings) averages read -3.6 and -3.5, and several reviewers say it turns far less than -4 (one at about -1), on a disc whose Infinite rating is the lowest in the batch (3.78). Held back: Innova's number and "much like a faster Roadrunner" copy say -4, the Star page the policy names has no ratings, and no named reviewer states an arm speed. Review Roadrunner, Mamba, Shryke, Hades and Katana with it if it moves.
- **Astra turn -1 → -1.5** (|Δ| 0.5; **-1 → -2 would be gated**). Millennium prints no numbers, so the retail catalog is split (-1 at Marshall Street, Infinite and Rocket; -2 at Disc Connection and Disc Golf Puttheads), and every reviewer source says the disc turns more than -1 (averages -1.5/-1.4, per-reviewer -2 to -3, one named reviewer at -3). Held back for the missing manufacturer layer and a Standard-plastic-heavy sample. Review Aries, Orion LF, Archon and Wraith with it if it moves.

**Catalog-identity flag (not a number change):** the Atlas "FD1" (22-211) is the pre-mid-2025 FD1 mold, which Discmania now sells as the **FD2**; Discmania's current **FD1** is the former **Instinct** mold (7/5/0/2). Per Discmania, the Atlas's FD1 and FD2 (new) are the same mold, and its Instinct entry is the current FD1. Your call whether to repoint or relabel the featured "FD1," and whether the FD1/FD2 pair should be treated as duplicates on the map. Turn and fade (0/2) are unaffected either way.

**Soft watches (not candidates):**
- **Tantrum fade 3 → 2.5 (|Δ| 0.5):** the 14-rating average is 2.6 with per-reviewer fades from 2 to 3.5, and Axiom's copy says the finish is "sharp" for average arms.

**Confirmed as-is (8):** Hades, Paradox, Raptor, Defender (0.7); P2 (new) (0.65); FD3 (new), Tantrum, FD1 (0.6). Confirmations mean "no contradicting evidence found," not independent community verification. P2 (new) and FD3 (new) are the least firm because their retailer evidence is old-and-new mixed (no version split on Infinite); FD1's confirmation is for the mold the entry names (see the flag).

**Too thin to call (2):** Monarch, Astra (above).

**Old-versus-new Discmania check (the batch brief's watch):** Discmania's own P2 and FD3 pages print the same numbers the legacy-named entries carried and label the molds "(new)" (P2 2021, FD3 2022); no renumbering was found. Infinite's P2 and FD3 pages do not split old and new (the pools include Innova-made discs), so they confirm the catalog numbers but not the new molds specifically. The one genuine renumbering-style change is the FD1/FD2/Instinct rename above, which is a naming change on identical molds.

**Spot-checks needed before any override source note:** the FD1/FD2/Instinct rename wording (read via the fetch step; Discmania's FD1 page itself mixes the old and new molds' details), the Discraft stability ratings (Raptor 2.1 and Hades 1.0, via the fetch step, the Raptor read mangled), whether the Millennium Astra and Orion LF numbers have any manufacturer source at all, and any quote taken via the summarizing fetch.

**Process notes for the next batch**

- Next ten by `featured.js` order after FD3 (new): Toro, M4, Quasar, Passion, Sidewinder, Diablo, Delirium, A3, Magnet, Warlock. Quasar is a Millennium mold (Millennium prints no numbers, as the Astra and Orion LF showed), Magnet and Warlock link to the Luna and Wizard/Voodoo sets, and A3 links to the open A1/A2 spacing watch.
- **Open-candidate running list (nothing applied):** Still open: **Trident fade 3 → 3.5, D2 turn 0 → -0.5, MD3 (new) fade (Atlas 1 vs reviewers about 2), Tesla turn -1 → -0.5, Trespass turn -0.5 → -1, Fury fade 2 → 1.5, plus this batch's Monarch turn -4 → -3.5 and Astra turn -1 → -1.5**; gated and awaiting your call: **Luna fade 3 → 2, Gator fade 3 → 4, Synapse turn -1.5 → 0**. Soft watches: Falk turn, Svea turn, A1/A2 spacing, PA3 fade, Lots turn, Voodoo fade, PD2 fade, PD2/Enforcer, Stingray Star turn, Orion LF fade, **plus this batch's Tantrum fade**. **Catalog-identity flag:** FD1/FD2/Instinct (above).
- **Stale-catalog pattern:** Luna, Gator, Synapse were found by comparing a manufacturer page with Marshall Street's snapshot. This batch found none of that kind among the eight readable manufacturers. The Millennium molds (Astra, Orion LF) cannot be tested that way because Millennium prints no numbers.
- **Linked sets re-checked this batch:** Hades/Thrasher/Scorch/Flash/Eclipse/Archon, Paradox/Kite/Stingray/Mirage/Roadrunner/Mamba, Tantrum/Teleport/Nuke/Destroyer/Wraith, Raptor/Firebird/Omen/Predator/Thunderbird/Teebird, Monarch/Roadrunner/Mamba/Shryke/Hades/Katana, Defender/Synapse/Force/Destroyer/Enforcer/Sheriff/Trespass, FD1/FD2/Instinct/FD/FD3/PD/PD2, P2/P2x/Link/Judge/Aviar/Reko, Astra/Aries/Orion LF/Archon/Wraith. Nothing moves beyond the two open candidates. The Synapse proposal (batch 10) would put the Synapse at the Defender's turn and fade; that is noted in the Defender entry.
- Reachable manufacturer paths this batch: `discmania.net/collections/{p2,fd3,fd1,fd2,instinct}`, `discraft.com/paul-mcbeth-z-hades-mcbethzhades` (`team.discraft.com/discs/hades` 404s; `/discs/raptor` works), `axiomdiscs.com/discs/{paradox,tantrum}/`, `innovadiscs.com/disc/monarch/`, `dynamicdiscs.com/collections/dynamic-discs-defender`. Infinite slugs: Paradox and Tantrum plastic pages are `/axiom-paradox/neutron---axiom` and `/axiom-tantrum/neutron---axiom`; Hades `/Discraft-Hades/ESP` (the `/Z-Line` form 302s); Raptor `/Discraft-Raptor/ESP`; Monarch `/Innova-Monarch/{Star,Champion}`; Defender `/dynamic-discs-defender/lucid`; FD1 `/discmania-fd1/c-line` (the bare mold page 302s); FD3 `/Discmania-FD3` and `/discmania-fd3/{c-line,s-line}`; P2 `/Discmania-P2/{D-Line,P-Line}`; Astra `/millennium-astra` and `/millennium-astra/millennium-standard` (the `/standard` form 302s).
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access reads the DGCR FD3 and FD2-retooled threads (they bear on the old/new question), then any Millennium or Discmania statement on the Astra's and FD1's numbers, then still the Trespass threads and the Tesla and Gator items.

---

# Batch 12 (Plan 10, Phase 2)

Researched October 3, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (already up to date; the queue doc is the only locally modified file).

Molds covered: Toro, M4, Quasar, Passion, Sidewinder, Diablo, Delirium, A3, Magnet, Warlock (the next ten by `public/featured.js` order after FD3 (new)).

## Decided items (recorded before the research)

**1. Monarch (batch 11 candidate) — resolved: confirmed as-is at turn -4 (owner decision Oct 3, 2026).**

- **Resolution:** keep **10/5/-4/1**. Under the plastic baseline policy the reference numbers are the most-thrown plastic's (Star for Innova drivers), and the -3.5 reviewer signal has no Star-plastic (reference plastic) data behind it: the Infinite Star Monarch page has zero ratings, and the -3.5/-3.6 averages come from Champion and pooled plastics. The batch 11 "open candidate -4 → -3.5" is withdrawn. No override, no change.
- **plasticVariance (for the record):** Champion Monarch reviewers read about -3.5 and several say it turns far less than printed; Star has no data. Do not average. Revisit only if a Star-plastic sample with stated arm speeds turns up.
- **Linked:** Roadrunner, Mamba, Shryke, Hades and Katana are unaffected because Monarch does not move. The batch 11 "review as a set if it moves" note is closed. (Sidewinder, in this batch, sits one step more stable than the Roadrunner and is unaffected.)

**2. Astra (batch 11 candidate) — APPROVED turn -1 → -1.5 by the owner, Oct 3, 2026.**

- **Resolution:** Atlas Astra becomes 11/5/-1.5/2, **applied as an override in the main tree separately** (not in this lane; this worktree's overrides file has no Astra entry yet, so expect it when main is next merged). The batch 11 open candidate is closed as approved.
- **Linked check (set out in batch 11, for whoever applies it):** Aries (Atlas 11/6/-4/2, which reviewers call less stable than the Astra), Orion LF (9/5/-1/2), Archon (11/5/-2/2) and Wraith (11/5/-1/3). Batch 12 adds one data point to this set (see the process notes): Millennium's own site does publish a qualitative label for the Astra, "Slightly Understable," and says it is "more understable and has less fade than the Quantum Astra." That is consistent with the approved move; it is not a numeric source.

**Standing rules applied throughout (owner-decided):**

- **Plastic baseline policy:** a mold's reference numbers are its most-thrown plastic (Star for Innova drivers). DX is the price-tier baseline but **not** the flight reference. As in batch 5, I had no sales data, so each entry names the reference plastic I took to be the most-thrown and marks it "assumed."
- **Review gate:** weak evidence = no correction; |Δ| = 1.0 changes need the owner's call; record open candidates instead of proposing them.
- **Never average across plastics:** mold-level consensus plus a `plasticVariance` note.

---

## Batch 12 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Sidewinder | 9/5/-3/1 | none | Confirmed as-is | 0.75 |
| M4 | 5/5/-1/1 | none | Confirmed as-is (label split: Prodigy "Slightly Understable" vs Infinite "Stable") | 0.7 |
| Delirium | 14.5/5/-0.5/3 | none | Confirmed as-is | 0.7 |
| A3 | 4/3/0/3 | none | Confirmed as-is (Infinite lists glide 4; out of scope) | 0.7 |
| Magnet | 2/3/-1/1 | none | Confirmed as-is (fade 1.4 pooled, but pros 1 / slower arms 2) | 0.7 |
| Warlock | 2/3/0/1 | none | Confirmed as-is | 0.65 |
| Passion | 8/5/-1/1 | none | Confirmed as-is (thin on named reviewers) | 0.65 |
| Diablo | 9/5/0/2 | none | Confirmed as-is (thin; label split) | 0.6 |
| Toro | 4/2/1/3 | none | **Too thin to call: turn +1 vs about +0.4 to +0.5 in Infinite pools (turn 1 → 0.5, not gated)** | 0.5 |
| Quasar | 13/5/0/3 | none | **Too thin to call: no printed digits from Millennium; Infinite reviewers about -0.5/3.4 (turn 0 → -0.5, not gated)** | 0.5 |

**No changes proposed. Two open candidates (Toro turn, Quasar turn), eight confirmed.** No Luna/Gator/Synapse-style catalog lag: all nine molds with a readable manufacturer page and printed digits equal their Atlas numbers on turn and fade. The two candidates are manufacturer-versus-pooled-reviewer splits of the Monarch/Astra kind: the manufacturer layer (Toro) or the retail catalog (Quasar, where Millennium prints no digits) says the Atlas value, pooled Infinite reviewers say half a point different, and the evidence is not strong enough to propose.

## Evidence limits — batch 12

Same tooling limits as earlier batches; see the pilot section. Specific to this batch:

- **Diff against `flights.json` / `data.json` (done first):** the Atlas numbers equal Marshall Street's snapshot for all ten. None has an override and none is in `infinite-manufacturer-ratings.json`. Compared with current manufacturer pages: **Innova (Toro, Sidewinder), Axiom (Delirium), Prodigy (M4 and A3, 400-plastic pages), Discraft (Passion via the ESP Paige Pierce page, Magnet via team.discraft.com) and Gateway (Diablo, Warlock, via the gatewaydiscsports.com collection pages) all match exactly.** **Quasar cannot be diffed:** Millennium's own site (golfdisc.com, "official website of Millennium Golf Discs") prints no turn/fade digits for it, only "about a speed 13 ultra long range driver with smooth glide, resistance to turn, and lots of fade," label "Overstable." Every retailer prints 13/5/0/3 (Marshall Street, Infinite, Disc Connection, Rocket Discs, DiscMetrics, Disc Golf Dojo, and the shop.golfdisc.com Standard listing), but they are not independent of each other. One retail split worth knowing: **Infinite's A3 page lists 4/4/0/3** against Prodigy's 4/3/0/3 (glide is outside turn/fade scope, and 17 of 22 reviewers on the 400 page rate glide 4, which looks like anchoring to Infinite's displayed 4).
- **Reddit** blocked, **YouTube** unreachable, **DGCR** 403 (the Diablo, Warlock-vs-Wizard and Delirium threads appear only as search-result titles; none is cited as evidence). The Disc Golf Reviewer URLs I guessed for Toro, Sidewinder, M4, Passion, A3, Diablo and Quasar all 404'd. gatewaydiscs.com failed on an SSL handshake error; gatewaydiscsports.com works. `discraft.com/z-line-passion-zpassion` and `team.discraft.com/discs/passion` 404'd; the `paige-pierce-passion-pppassion` page works.
- **Community layer is the Infinite plastic-page reviewers** (anonymous or first-name, single-source, most with a stated skill class, a few with a distance) plus retailer text. **Named reviewer-site reads: Chris Bawden (Disc Golf Puttheads: Magnet, Warlock; neither states a plastic or arm speed beyond distances like "225 feet and beyond") and Aaron (bestdiscgolfdiscs.com: Delirium; the fetch step found no measured field-test data in it, so weight 0.2).** Distance bands rather than measured arm speeds: Toro 200–250 ft, Sidewinder 250–375 ft, M4 325 ft, Passion 275–350 ft, Quasar 350–450+ ft, Delirium 400–425 ft, A3 100–475 ft (approach use), Magnet 325 ft (one pro). Confirmations read as "no contradicting evidence found," not independent community verification.
- **Shared text, do not count twice:** the Quasar line "very similar to the Boss in terms of feel and flight, but the slight turn will make this disc a little more user friendly" appears on an Inside the Circle post (credited to Broden) and in search summaries of retailer pages; it reads as one retailer text copied around. Counted once, at low weight.
- **Quasar's Infinite Quantum page does not reconcile with itself** in what the fetch step returned: the printed average is 12.8/4.9/-0.4/3.3 (10 ratings), but the nine per-reviewer ratings listed with text read -1 for eight of them (and 0 for one), which would average about -1.0. Ratings without visible text may account for the gap; I could not tell. Spot-check before relying on either number.
- **Infinite reviewer averages pool plastics and wear.** Used as coarse retailer-type evidence at capped weight; never alone for a proposal. Sidewinder, M4 and A3 counts are large enough to be useful; Toro, Quasar, Diablo and Passion pools are small.
- **Marshall Street is the Atlas's own source** and was used only as baseline (its stability labels are recorded where they differ).
- **Search-summary-only statements** (flagged inline): the Reaper Discs plastic-behaviour lines for the Sidewinder, the "Toro flies a bit more overstable than a Zone" line, the "more overstable finish out of the box" line for the Passion, and the DGCR Warlock-versus-Wizard snippets. None was read at source.
- **Spot-check needed on the Discraft stability ratings:** the Passion page printed "Stability Rating: 1.0" and the Magnet page "0 (Neutral)" through the summarizing fetch (batch 11 flagged the same fetch mangling a Raptor rating). Not used for any conclusion.
- Page contents came through a summarizing fetch step; spot-check any quote before it goes into an override's source note.

---

## Toro — Innova (id 764a63ae0e4b)

- **Atlas now:** 4/2/1/3 (source: Marshall Street snapshot, label "Very Overstable"; PDGA approval 21-43, Apr 2021; no override). **Proposed turn/fade:** none. Evidence too thin to call. **Open candidate: turn 1 → 0.5** (|Δ| = 0.5, below the review gate). Reference plastic: Star (per the policy; Star and Champion are the two plastics Innova lists).
- **Manufacturer:** Innova 4/2/1/3, "Overstable" (page fetched). Copy: "The Toro is a flat-top, overstable mid-range—co-designed by Calvin Heimburg—made for powerful sidearms and windy conditions." Copy and numbers agree. Infinite "Very Overstable": "a flat, overstable, beadless mid-range that can handle some heavy torque." A search summary of retail text adds "our most overstable, least gliding Mid-range at its speed" and "similar to a Rat, but even more overstable" (summary, spot-check).
- **Retailer:** Infinite reviewer numbers 4/2.1/0.5/3.4 (30 ratings, 4.68 stars). **Turn averages 0.5 below the published +1; fade 0.4 above the published 3.** The Star page (7 ratings) reads, from the per-reviewer ratings shown, turn about 0.4 and fade about 3.1; the Champion page (8 ratings) turn about 0.4 and fade about 3.25 (my arithmetic on the visible ratings, rounded). Marshall Street 4/2/1/3 (baseline).
- **Community:** Infinite Star-page reviewers (single-source, beginner to advanced, 200–250 ft): "best OS midrange/approach" (advanced, rated 4/2/1/3); "more OS than a Z Zone … doesn't want to stay in the air very long" (intermediate, 200 ft, rated 4/2/0/3); "isn't very overstable for my forehand … meathook on backhand" (intermediate, 225 ft, rated +1); "consistently overstable" (advanced, rated +0.5); "flies like a zone … nice and overstable but doesn't fade as hard" (beginner, rated 0). Champion page: "does not want to fly … looking to flex out" and "combination of Zone and Berg" (intermediate, 200–225 ft, +1); "positive turn when not thrown hard" (intermediate, +1); "less stable than numbers suggest" (beginner, 0); "best approach disc … not dumb overstable" (professional, 0); "similar to Zone but taller … slower" (advanced, 0/4). Across the 15 visible per-reviewer ratings, turn is 0 for nine, +0.5 for one, +1 for five; fade is 3 for 12, 4 for three. Search-summary retailer text: "it almost feels like a putter-speed Zone … flies a bit more overstable … a tad less glide and a more aggressive fade" (spot-check).
- sources:
  - {name: Innova Toro page (4/2/1/3, "Overstable"), url: https://www.innovadiscs.com/disc/toro/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Toro (mfr 4/2/1/3; reviewers 4/2.1/0.5/3.4; 30 ratings), url: https://infinitediscs.com/innova-toro, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star Toro (7 ratings; reviewer text), url: https://infinitediscs.com/Innova-Toro/Star, type: retailer, weight: 0.3}
  - {name: Infinite Discs Champion Toro (8 ratings; reviewer text), url: https://infinitediscs.com/Innova-Toro/Champion, type: retailer, weight: 0.3}
  - {name: Reaper Discs Toro collection page (description only; no author, no reviews), url: https://reaperdiscs.com/collections/innova-toro, type: retailer, weight: 0.1}
  - {name: Marshall Street Toro (4/2/1/3; not independent), url: https://www.marshallstreetdiscgolf.com/?s=Toro&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.5
- **consensusNote:** Innova's page and copy say +1/3 and so does the Atlas. Infinite's mold-level average (30 ratings) is +0.5 on turn and 3.4 on fade, and the two plastic pages (Star, Champion) both read about +0.4 on turn, with nine of fifteen visible ratings at 0. Because Infinite displays +1, anchoring would pull reviewers toward +1, not away, so the offset is not an anchoring artifact. **Held back because:** the sample is small and mixed (200–250 ft arms, mostly intermediate), Innova's number and copy ("most overstable, least gliding mid at its speed") say +1/3, the text is split (one reviewer calls it "more OS than a Z Zone," another "not very overstable for my forehand"), no named reviewer, no stated arm speed. **A turn of 0.5 would still keep the Toro at or above the Atlas Zone (4/3/0/3) on turn, which is the ordering the retail text describes, so the candidate does not break the Toro/Zone relationship.** If you want observed flight over the printed number, **turn 1 → 0.5 is the single candidate**; fade 3 reads 3.1–3.25 on the two plastic pages, so there is no fade candidate. It needs a named Star-plastic review with a stated arm speed to become a proposal. **Linked check, review as a set if it moves:** Zone (4/3/0/3), Rat (4/2/0/2), Pig (4/1/0/3), Gator (Atlas 5/2/0/4 after the applied override) and A1 (4/2/0/5) and A3 (4/3/0/3).
- **plasticVariance:** Sold in Star and Champion (plus Halo Star, glow and dyed variants); Innova prints one set of numbers. Reviewer summaries: Star "quite forgiving on forehand compared to champion … champion sticks to the ground when the star can skip away." Not quantified. Do not average.

## M4 — Prodigy (id e1371f80e1f7)

- **Atlas now:** 5/5/-1/1 (source: Marshall Street snapshot, label "Understable"; PDGA approval 13-14, Mar 2013; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): 400 (Infinite lists the 100 through 750 plastics; 400 is the best-reviewed).
- **Manufacturer:** Prodigy 5/5/-1/1, "Slightly Understable" (M4 400 page fetched). Copy: "an extremely reliable understable midrange disc … designed for all players and flies extremely far for a midrange. The M4 will turn up when thrown hard and will then have an extra long glide and a soft straight finish." **Label split, same numbers:** Prodigy "Slightly Understable"; Infinite "Stable" (description: "a slightly understable mid in the Prodigy line … a favorite of top pros for long controlled straight shots"); Marshall Street "Understable." The copy itself says understable but ends "soft straight."
- **Retailer:** Infinite reviewer numbers 5/4.9/-1.1/1 (73 reviews, 4.8 stars); the 400 page reads 5/5/-1/1 (13 ratings, 4.9 stars). Turn within 0.1, fade exact. Marshall Street 5/5/-1/1 (baseline).
- **Community:** Infinite 400-page reviewers (13, single-source; intermediate to professional): "dead straight for about 90% of its flight before slightly fading … straighter than a lot of the other competitors like the buzzz or truth" (intermediate); "great late flip without overflipping" (advanced); "floats wonderfully when thrown soft or will hold a turn when given height and power" (advanced); "works for fast or slow arm speeds" (professional); "tight tunnels and controlled turnovers" (advanced). Outliers: a beginner rates it 4/5/-3/1 ("doesn't fade back, it just ends straight") and an intermediate (325 ft) 5/5/0/0 ("the straightest disc I have ever thrown"). Visible 400-page ratings average about -1.1 on turn and 1.0 on fade (my arithmetic). Search-summary Disc Golf Puttheads chart text (templated): "one of the straightest-flying midranges on the market."
- sources:
  - {name: Prodigy M4 400 plastic page (5/5/-1/1, "Slightly Understable"), url: https://prodigydisc.com/products/prodigy-m4-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs M4 (mfr 5/5/-1/1; reviewers 5/4.9/-1.1/1; 73 reviews), url: https://infinitediscs.com/prodigy-m4, type: retailer, weight: 0.5}
  - {name: Infinite Discs 400 M4 (13 ratings; reviewer text), url: https://infinitediscs.com/Prodigy-M4/400, type: retailer, weight: 0.3}
  - {name: Disc Golf Puttheads M4 flight chart (search snippet, templated), url: https://www.dgputtheads.com/flight-charts/m4, type: retailer, weight: 0.1}
  - {name: Marshall Street M4 (5/5/-1/1; not independent), url: https://www.marshallstreetdiscgolf.com/?s=prodigy+m4&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, the 73-review mold average and the 13-rating 400 page agree on -1/1 to within 0.1, and the text describes a slightly understable, glidey midrange that holds a straight line and flips with power, which is Prodigy's copy. The "dead straight" and "doesn't fade back" remarks are the usual arm-speed spread. No contradicting evidence found. Prodigy's 2023 renumbering of the A series (batch 7) did not touch the M4: the current page and the reviewers agree.
- **plasticVariance:** Sold in at least 25 plastic variants at Infinite (100 through 750, Air, Spectrum, ReBlend, glow, X-Outs); Prodigy prints one set of numbers. Not quantified. Do not average.
- **Linked:** M3 and M5 (Atlas M5 5/5/-3/1, the more understable sibling), Buzzz (5/4/-1/1) and Truth (5/5/-1/1), the discs reviewers name. Nothing moves.

## Quasar — Millennium (id f4bed1d0d28e)

- **Atlas now:** 13/5/0/3 (source: Marshall Street snapshot, label "Overstable"; PDGA approval 11-31, Jul 2011; no override). **Proposed turn/fade:** none. Evidence too thin to call. **Open candidate: turn 0 → -0.5** (|Δ| = 0.5, below the review gate). **Soft watch, not a candidate: fade 3 → 3.5.** Reference plastic (assumed most-thrown, not verified): Quantum (the best-reviewed at Infinite, 10 of 17 mold ratings; Millennium calls Standard its "original premium plastic").
- **Manufacturer:** Millennium's own site (golfdisc.com) prints **no turn/fade digits** and states "about a speed 13 ultra long range driver with smooth glide, resistance to turn, and lots of fade," label "Overstable"; no primary plastic named. The shop.golfdisc.com Standard listing and every retailer print 13/5/0/3 ("fastest and most overstable driver Millennium makes"; "built for strong throwers"); retailer copy: "wide rim, ultra long-range, overstable distance driver," "Millennium's most overstable high-speed driver." **Copy-versus-number note:** the printed 0 turn reads as "resists turn," but several reviewers and retailer copy say it has "a smidge of turn" or "slight turn," and retailer copy says it is "molded on the same shape as Innova's Boss" (PDGA specs agree closely: Quasar 21.2 cm, 1.6 cm height, 2.5 cm rim width, 1.2 cm rim depth; Boss 21.2 / 1.5 / 2.5 / 1.2). Infinite and DiscMetrics: "Very Overstable"; Disc Connection and Marshall Street: "Overstable." The DiscMetrics, Disc Connection and Rocket Discs pages were read only via the fetch step.
- **Retailer:** Infinite reviewer numbers 12.8/5/-0.5/3.4 (17 ratings, 4.74 stars); **Quantum page 12.8/4.9/-0.4/3.3 (10 ratings), Sirius 13/5/0/3.3 (3 ratings; the visible ratings are 0/3, 0/3, 0/4), Standard 13/5/-0.3/3.1 (2 ratings).** Reviewer turn runs 0.4–0.5 more understable than the printed 0 and fade 0.1–0.4 above 3. DiscMetrics: 27 reviews, 4.4 stars, "very overstable" (its numbers are the retailer 13/5/0/3). Marshall Street 13/5/0/3 (baseline). Disc Golf Puttheads chart (Maredith, Oct 24, 2025, templated): "a very overstable distance driver … for power throwers … a heavy, forward-pushing fade."
- **Community:** Infinite Quantum-page reviewers (single-source, intermediate to professional, with distance bands when stated): "crazy overstable and completely disregards the wind … more stable than XCaliber, less than Ape" (intermediate, rated 13/5/0/3.5); "super overstable … excellent spike characteristics" (advanced, -1/4); a 150 g disc at 450+ ft "minimal fade despite rating … twitchy" (intermediate, -1.5/3); "compares to Innova Boss … bit easier on the fade than expected" (-1/3); "identical mold to Innova Boss … very efficient in the wind" (professional, -1/4); "fades drastically but only at the end of flight" (advanced, -1/4). Sirius page: "less overstable than the Conqueror or PD2" (intermediate, 400 ft, rated 0/3); "Boss feel … Max or Ape stability … will fight out of every angle" (intermediate, 0/3). Standard page: "very similar to a Boss … very wide rim … one of the longest drivers" (professional, 400 ft, rated -2/3); **"very overstable but by no means a meathook … more overstable Destroyer … turn -.5 then fade back hard 3.5"** (advanced, 350–400 ft, rated -1/4 — the one explicit measured-style read, and it lands on -0.5/3.5). Retailer text (Reaper product page, no author; and the shared Boss sentence, see the evidence limits): "thrown flat it stays dead straight through a headwind and shows only a smidge of turn in a tailwind before a strong, controlled fade closes it out."
- sources:
  - {name: Millennium Quasar page (golfdisc.com; no digits, "Overstable," "resistance to turn, and lots of fade"), url: https://www.golfdisc.com/discs/quasar/, type: manufacturer, weight: 0.6}
  - {name: Millennium Standard Quasar listing (shop.golfdisc.com; 13/5/0/3, "overstable"; ownership of the shop not verified), url: https://shop.golfdisc.com/millennium-standard-quasar, type: manufacturer, weight: 0.4}
  - {name: Infinite Discs Quasar (mfr 13/5/0/3; reviewers 12.8/5/-0.5/3.4; 17 ratings), url: https://infinitediscs.com/millennium-quasar, type: retailer, weight: 0.5}
  - {name: Infinite Discs Quantum Quasar (10 ratings; reviewer text; average and per-reviewer ratings do not reconcile), url: https://infinitediscs.com/millennium-quasar/quantum, type: retailer, weight: 0.3}
  - {name: Infinite Discs Sirius Quasar (3 ratings), url: https://infinitediscs.com/millennium-quasar/sirius, type: retailer, weight: 0.2}
  - {name: Infinite Discs Standard Quasar (2 ratings; Pierce Guderski's -0.5/3.5 read), url: https://infinitediscs.com/millennium-quasar/millennium-standard, type: retailer, weight: 0.2}
  - {name: Reaper Discs Quantum Quasar (description only, no author), url: https://reaperdiscs.com/products/millennium-quantum-quasar, type: retailer, weight: 0.1}
  - {name: Disc Golf Puttheads Quasar chart (Maredith, templated), url: https://www.dgputtheads.com/flight-charts/quasar, type: retailer, weight: 0.1}
  - {name: Marshall Street Quasar (13/5/0/3; not independent), url: https://www.marshallstreetdiscgolf.com/product/millennium-quasar, type: retailer, weight: 0.2}
- **confidence:** 0.5
- **consensusNote:** Same shape of evidence as the batch 11 Astra, one rung weaker. Millennium prints no digits, so there is no manufacturer number to weigh; every retail layer prints 0/3 but those are one upstream; and the Infinite pools (17 mold ratings: -0.5/3.4) plus the per-reviewer ratings (mostly -1) plus the one detailed read (-0.5/3.5, 350–400 ft) say a half point more turn and a touch more fade than printed. Because Infinite displays 0/3, anchoring would pull reviewers toward 0/3, not away, so the offset is not an anchoring artifact. Reviewers repeatedly say it flies like the Boss (Atlas 13/5/-1/3), which is also half a point to a full point more turn than the Atlas gives the Quasar, and "more stable than XCaliber (0/4), less than Ape (0/4)" puts it at about 3.5 on fade. **Held back because:** there is no manufacturer layer to move, the Quantum page's average and its per-reviewer ratings disagree with each other (about -0.4 against about -1.0), samples are tiny per plastic (10, 3, 2), reviewers at 350–450+ ft are the only ones who see turn at all and Millennium's own copy says "resistance to turn," and no reviewer states an arm speed. If you want observed flight over the printed number, **turn 0 → -0.5 is the single candidate**; fade 3.4 pooled is a soft watch only (3 → 3.5). It needs a Millennium-sourced number or a bigger Quantum/Standard sample with stated arm speeds to become a proposal. **Linked check, review as a set if it moves:** Boss (Atlas 13/5/-1/3, held by the policy; Champion Boss is stamped 0/3, the same as the Quasar's printed number), Ape (13/5/0/4), XCaliber (12/5/0/4), Dimension (14.5/5/0/3), Delirium (below), Destroyer (12/5/-0.5/3.5) and Millennium's Astra (approved -1.5) and Orion LF.
- **plasticVariance:** Sold in Quantum, Quantum Zero-G, Sirius, Delta-T, Standard and X-Out variants; Millennium prints no numbers by plastic. Reviewers: a 150 g Zero-G disc is "twitchy" and shows less fade; Sirius reads straighter and less overstable than Quantum (three ratings, one 400 ft thrower). Not quantified. Do not average.

## Passion — Discraft (id 4ed85d7c4666)

- **Atlas now:** 8/5/-1/1 (source: Marshall Street snapshot, label "Understable"; PDGA approval 21-82, Jul 2021; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): ESP (Paige Pierce's stock plastic; Big Z, Z, Z Lite and signature runs are the others).
- **Manufacturer:** Discraft 8/5/-1/1, stability 1.0 (ESP Paige Pierce Passion page fetched; spot-check the rating). Copy: "a high-performance driver designed for accuracy and control … a unique flat outer rim configuration and a straight flight path … similar to the classic Discraft Cyclone but with a more streamlined design, offering a straighter, more dependable flight … ideal for players of all skill levels." Copy and numbers agree. **Label split, same numbers:** Marshall Street "Understable"; Infinite and Discraft's stability 1.0 "Stable"; Discraft's Cyclone comparison (Atlas Cyclone 7/4/-1/2) fits either.
- **Retailer:** Infinite reviewer numbers 7.9/5/-0.9/0.9 (35 reviews, 4.74 stars); ESP page 8/5/-1/1 (3 ratings). Turn within 0.1, fade within 0.1. Marshall Street 8/5/-1/1 (baseline).
- **Community:** Infinite ESP-page reviewers (three, single-source, intermediate and beginner, 275–350 ft): "ultra straight … a workhorse and can hold really any line I put it on" (intermediate, 275 ft); "great disc … permanent spot in my bag … neutral flight for both forehand and backhand" (intermediate, 350 ft); "more understable" than similar discs (beginner). All three rate 8/5/-1/1 or -0.5/0.5. Search-summary retailer text (spot-check): "a more overstable finish out of the box than you might expect given the numbers, but beats in to be an incredibly shapeable disc"; "low power requirement, tons of glide." No named reviewer read.
- sources:
  - {name: Discraft ESP Paige Pierce Passion page (8/5/-1/1, stability 1.0), url: https://www.discraft.com/paige-pierce-passion-pppassion, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Passion (mfr 8/5/-1/1; reviewers 7.9/5/-0.9/0.9; 35 reviews), url: https://infinitediscs.com/discraft-passion, type: retailer, weight: 0.5}
  - {name: Infinite Discs ESP Passion (3 ratings; reviewer text), url: https://infinitediscs.com/Discraft-Passion/ESP, type: retailer, weight: 0.2}
  - {name: Marshall Street Passion (8/5/-1/1; not independent), url: https://www.marshallstreetdiscgolf.com/?s=Passion&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and the 35-rating mold average agree on -1/1 to within 0.1, and the three readable reviewers describe a neutral, workhorse fairway that holds lines. Held at 0.65 rather than 0.7 because the reference-plastic page has only three ratings and no named reviewer was readable. The "more overstable out of the box" remark is a search-summary line and is the usual new-disc effect. No contradicting evidence found.
- **plasticVariance:** Sold in ESP, Z, Big Z, CryZtal, Z Lite, Tour Series, signature and Jawbreaker Z FLX runs; Discraft prints one set of numbers. Not quantified. Do not average.
- **Linked:** Cyclone (Atlas 7/4/-1/2, Discraft's own comparison), Buzzz (5/4/-1/1) and Luna (the Putter Line Hard override is now 3/4/0/2). Nothing moves.

## Sidewinder — Innova (id 1ad033622dbe)

- **Atlas now:** 9/5/-3/1 (source: Marshall Street snapshot, label "Understable"; PDGA approval 04-13, Nov 2004; no override). **Proposed turn/fade:** none. Matches. Reference plastic: Star (per the policy; Champion, GStar and DX are also common).
- **Manufacturer:** Innova 9/5/-3/1 (page fetched; no stability label printed). Copy: "a fast distance driver with predictable high speed turn and plenty of glide. An out of the box roller." **Copy-versus-reviewer tension, not a numeric contradiction:** "out of the box roller" against many reviewers saying a *fresh* Star or Champion is "fairly stable" and only turns after break-in (below). Infinite: "turns over faster than you expect on release … useful for escape shots or intentional rollers"; Marshall Street "Understable."
- **Retailer:** Infinite reviewer numbers 9/5/-2.8/1.1 (143 ratings, 4.53 stars); **Star page 9/5/-2.7/1.1 (45 ratings, 4.5 stars); Champion page 9/5/-2.8/1.1 (50 ratings, 4.5 stars).** Turn within 0.3, fade within 0.1, on the largest samples in the batch. Marshall Street 9/5/-3/1 (baseline).
- **Community:** Infinite Star-page reviewers (44 with text, single-source, mostly intermediate): the modal rating is 9/5/-3/1. **Fresh versus worn is the recurring theme:** "fresh: fairly stable; beaten-in: amazing hyzer flip disc; flat throw drifts right with slight fade" (advanced, 375 ft); "fresh Star … comes back and finishes left slightly; beaten-in 'flips way over'" (intermediate); "very straight disc out of the box … beats into a great hyzer flip disc" (intermediate); "couldn't achieve turn initially; powered up reveals it turns into a roller pretty quick" (advanced). Lower ratings: -1/2 and "not the disc the numbers suggest … a little turn and consistent fade" (advanced), -1.5 "similar to a Destroyer … needs anhyzer release for true turn" (intermediate), -2 "more stable than numbers suggest … fade greater than expected" (intermediate). Champion page (50 reviewers): "champion plastic reduces turn versus DX/GStar" (intermediate); "GStar most understable when beat-in, Champion most overstable" (intermediate); "more stable than the numbers suggest, difficult for backhand rollers" (advanced, rated 9.5/4.5/-1.5/1); one anomaly rated 9/5/0/1 ("miss-branded Thunderbird"). Distance bands: 250 ft (beginner), 275 ft (intermediate), 300–375 ft (intermediate to advanced). Inside the Circle (Sam Kealhofer, no stated arm speed): "another popular option for an understable fairway driver"; small fade suits slower arms; between the Valkyrie and Roadrunner. Search-summary Reaper text (spot-check): turn "slightly less extreme than the Roadrunner"; "in premium plastics like Champion Glow and Halo Star the Sidewinder will start out neutral and beat in to understable, while the G Star and DX versions will be more true to the flight rating immediately." Batch 4's Reaper Roadrunner-versus-Sidewinder read (-4 confirmed on the Roadrunner, Champion Sidewinder nearer -2) is consistent.
- sources:
  - {name: Innova Sidewinder page (9/5/-3/1), url: https://www.innovadiscs.com/disc/sidewinder/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Sidewinder (mfr 9/5/-3/1; reviewers 9/5/-2.8/1.1; 143 ratings), url: https://infinitediscs.com/innova-sidewinder, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star Sidewinder (45 ratings; reviewer text), url: https://infinitediscs.com/Innova-Sidewinder/Star, type: retailer, weight: 0.3}
  - {name: Infinite Discs Champion Sidewinder (50 ratings; reviewer text), url: https://infinitediscs.com/Innova-Sidewinder/Champion, type: retailer, weight: 0.3}
  - {name: Inside the Circle, best Innova fairway/control driver (Sam Kealhofer), url: https://www.insidethecircledg.com/post/what-is-the-best-innova-fairway-control-driver, type: community, weight: 0.3}
  - {name: Reaper Discs Roadrunner vs Sidewinder (batch 4 read; plastic lines this batch via search summary only), url: https://reaperdiscs.com/blogs/reviews/innova-roadrunner-vs-sidewinder, type: community, weight: 0.3}
  - {name: Marshall Street Sidewinder (9/5/-3/1; not independent), url: https://www.marshallstreetdiscgolf.com/?s=sidewinder&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, the 143-rating mold average and both 45- and 50-rating plastic pages agree on -3/1 to within 0.3, and the reviewers describe an understable fairway that is stable-to-straight when new and flips and rolls as it wears, which is what -3 at the reference plastic says. The "more stable than the numbers" remarks are the fresh-disc and heavy-weight effect, not a mold-level disagreement; the same reviewers go on to confirm -3 after break-in. No contradicting evidence found. Checked against the Roadrunner (-4) and Monarch (-4): the Atlas keeps the Sidewinder one step more stable than both, as Reaper and Innova ("much like a faster Roadrunner," the Monarch's copy) describe.
- **plasticVariance:** Large and consistent across sources: Champion most overstable, Star/Halo/Champion Glow start near neutral and beat in, GStar and DX run flippier from new, light and used discs flip most. Keep the mold number at the reference plastic and do not average plastics.
- **Linked:** Roadrunner (Atlas 9/5/-4/1), Monarch (10/5/-4/1, confirmed at -4 this batch), Valkyrie (9/4/-2/2), Mamba (11/6/-5/1), Escape (9/5/-1/2). Nothing moves.

## Diablo — Gateway (id c33ff3022113)

- **Atlas now:** 9/5/0/2 (source: Marshall Street snapshot, label "Overstable"; PDGA approval 17-57, Apr 2017; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Diamond (the plastic Gateway lists first; Evolution is the budget line).
- **Manufacturer:** Gateway 9/5/0/2, "Overstable fairway driver" (collection page fetched on gatewaydiscsports.com). Copy: "an accurate overstable fairway driver that will turn over slightly when giving it enough speed and fades fast when speed decreases. A great choice for distance flex shots that require an accurate landing. The Diablo will quickly become a go to control driver for any who bag it." **Label split, same numbers:** Gateway and Marshall Street "Overstable"; Infinite "Stable" ("fast and stable control driver … fly straight down the fairway with a reliable fade"). Gateway's own copy also says "turn over slightly" at speed, against a printed 0 turn: a mild copy-versus-number tension, not a contradiction.
- **Retailer:** Infinite reviewer numbers 9.2/4.9/-0.3/2.1 (11 ratings, 4.09 stars, the lowest rating among this batch's confirmed discs); **Diamond page 9/4.9/0/2 (5 ratings, 4.6 stars); Evolution page 3 ratings (3.7 stars; per-reviewer 11/5/-1/2.5, 9/5/-2/2, 12/6/-1/2).** Marshall Street 9/5/0/2 (baseline).
- **Community:** Infinite Diamond-page reviewers (five, single-source, beginner to advanced, no distances): all rate 9/5/0/2 except one 9/4/0/2; "basically just a Thunderbird in better plastic" (beginner); "Gateway's Thunderbird but in a better plastic" (advanced); "flies like a good McBeth Thunderbird from back in the day" (advanced); "straight flight with predictable finish … workhorse mold" (advanced). Evolution-page reviewers (three, intermediate, one at about 250 ft): "similar to a Wraith … some turn when powered up, but a strong consistent fade at the end"; "slower than advertised … would flip a bit at the start and meander"; "more like an overstable fairway driver … flew low and straight." Search-summary retailer text: "feels kind of like an Eagle-X or Teebird in the hand with a smidge wider wing."
- sources:
  - {name: Gateway Diablo collection page (9/5/0/2, "Overstable fairway driver"), url: https://gatewaydiscsports.com/collections/diablo, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Diablo (mfr 9/5/0/2; reviewers 9.2/4.9/-0.3/2.1; 11 ratings), url: https://infinitediscs.com/gateway-diablo, type: retailer, weight: 0.5}
  - {name: Infinite Discs Diamond Diablo (5 ratings; reviewer text), url: https://infinitediscs.com/gateway-diablo/evolution-diamond, type: retailer, weight: 0.3}
  - {name: Infinite Discs Evolution Diablo (3 ratings; reviewer text), url: https://infinitediscs.com/gateway-diablo/evolution, type: retailer, weight: 0.2}
  - {name: Marshall Street Diablo (9/5/0/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=diablo&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** Manufacturer and the 11-rating mold average agree on 0/2 to within 0.3 (turn -0.3 is inside the usual spread for a pool that includes three Evolution reviewers who read it flippier), and the Diamond reviewers independently call it a Thunderbird-class straight-to-overstable fairway (Atlas Thunderbird 9/5/0/2, identical turn and fade). Held at 0.6 because the total sample is small (11), no named reviewer, no stated arm speed, and DGCR was unreadable. No contradicting evidence found.
- **plasticVariance:** Sold in Diamond, Evolution, Platinum, Cobalt, NXT and Lightweight; Gateway prints one set of numbers. Evolution-page reviewers (three) read more turn than Diamond-page reviewers (five), which fits the usual budget-versus-premium blend spread but is too small to record as meaningful. Do not average.
- **Linked:** Thunderbird (Atlas 9/5/0/2, which reviewers equate with the Diablo), Teebird (7/5/0/2), Escape (9/5/-1/2) and Gateway's own Magic/Wizard/Warlock putters. Nothing moves.

## Delirium — Axiom (id f91d207b1ad1)

- **Atlas now:** 14.5/5/-0.5/3 (source: Marshall Street snapshot, label "Overstable"; PDGA approval 19-47, May 2019; no override). **Proposed turn/fade:** none. Matches. Reference plastic: Neutron (the main plastic; Fission is the other).
- **Manufacturer:** Axiom 14.5/5/-0.5/3, "Overstable" (page fetched). Copy: "a high-speed overstable distance driver … maximum speed and very overstable flights … comparable to the MVP Dimension, offering capacity for high speed throws with minimal turn, even in high wind situations." **Label split, same numbers:** Axiom's label "Overstable" against its own copy "very overstable flights"; Infinite "Very Overstable"; Marshall Street "Overstable."
- **Retailer:** Infinite reviewer numbers 14.3/4.9/-0.5/3 (11 reviews, 4.27 stars); Neutron page the same (11 ratings; all Neutron). Turn and fade exact. Marshall Street 14.5/5/-0.5/3 (baseline). Disc Golf Puttheads chart (Maredith, Nov 28, 2025, templated): "built for players who can generate serious power … windy conditions and torque-heavy releases."
- **Community:** Infinite Neutron-page reviewers (ten with text, single-source, intermediate to professional, distances where stated 400–425 ft): "very fast and very overstable … wind-fighter and flex shot disc" (intermediate, 400 ft, rated -0.5/3); "very overstable disc for my arm … stays down but delivers distance quickly" (advanced, 425 ft, rated -0.5/3.5); "pushes straight, and then fades … less flex than Tantrum" (advanced, 415 ft, -0.5/3); "overstable flight as advertised … strong end-fade resists anhyzer" (intermediate, -0.5/3); "not as over stable as the flight numbers would make you think … gets initial turn, then fades left … compares favorably to Star Destroyer" (intermediate, rated -1/3); one at 0/3 who adjusted turn "due to lack of power access"; one advanced reviewer calls a copy "a dumpy mess" and suspects a quality-control issue. Visible per-reviewer turn averages about -0.45. Aaron (bestdiscgolfdiscs.com, 13+ years, advanced throwers 410+ ft, Neutron; fetch step found no field-test data): "slight turn of -0.5 … fade 3 … slightly more overstable than the flight numbers might suggest."
- sources:
  - {name: Axiom Delirium page (14.5/5/-0.5/3, "Overstable"), url: https://axiomdiscs.com/discs/delirium/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Delirium (mfr 14.5/5/-0.5/3; reviewers 14.3/4.9/-0.5/3; 11 reviews), url: https://infinitediscs.com/axiom-delirium, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Delirium (11 ratings; reviewer text), url: https://infinitediscs.com/axiom-delirium/neutron---axiom, type: retailer, weight: 0.3}
  - {name: bestdiscgolfdiscs.com Axiom Delirium review (Aaron; no field-test data found), url: https://bestdiscgolfdiscs.com/axiom-delirium/, type: community, weight: 0.2}
  - {name: Disc Golf Puttheads Delirium chart (Maredith, templated), url: https://www.dgputtheads.com/flight-charts/delirium, type: retailer, weight: 0.1}
  - {name: Marshall Street Delirium (14.5/5/-0.5/3; not independent), url: https://www.marshallstreetdiscgolf.com/?s=delirium&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and the 11-rating average (all one plastic) agree on -0.5/3 exactly, and the readable reviewers, all 400-plus-foot throwers, describe a very fast, overstable driver with a hard finish that holds hyzers and fights wind, which is Axiom's copy. The one -1 reviewer and the one 0 reviewer are the usual arm-speed spread. No contradicting evidence found.
- **plasticVariance:** Sold in Neutron and Fission (and misprints); Axiom prints one set of numbers. A reviewer notes color variation affects stability. Not quantified. Do not average.
- **Linked:** Dimension (Atlas 14.5/5/0/3; Axiom says the Delirium is comparable, and reviewers' "similar to Dimension" fits half a point more turn), Tantrum (14.5/5/-1.5/3; a reviewer says the Delirium has less flex), Nuke (13/5/-1/3), Destroyer (12/5/-0.5/3.5), Nitro (13/4/-0.5/3) and Quasar (an open candidate this batch). Nothing moves.

## A3 — Prodigy (id 74ae8a105690)

- **Atlas now:** 4/3/0/3 (source: Marshall Street snapshot, label "Overstable"; PDGA approval 15-70, Dec 2015; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): 400.
- **Manufacturer:** Prodigy 4/3/0/3, "Overstable" (A3 400 page fetched). Copy: "an overstable utility disc that fills the gap between midranges and putters. The A3 is perfect for strong to above average throwers who want to avoid the possibility of their shot turning over. The disc is consistent and reliable in all wind conditions and perfect for short, trick shots as well as high wind." Copy and numbers agree. Prodigy's A-series comparison blog (read in batch 7) puts the ordering A1 > A2 > A3. **Retail split on glide only:** Infinite lists 4/4/0/3 (glide 4), against Prodigy's 3; glide is outside the turn/fade scope.
- **Retailer:** Infinite reviewer numbers 4/3.8/0/3.1 (46 reviews, 4.55 stars); the 400 page (22 ratings, 4.7 stars) turns 0 for 20 of 22 (-0.5 for two) and fade averages about 3.1 (17 at 3, four at 3.5, one at 4; my arithmetic). Turn exact, fade within 0.1. Marshall Street 4/3/0/3 (baseline). Infinite's description: "a favorite of Prodigy's fans as an overstable approach disc … a bead and wide rim designed for clean, accurate forehand releases."
- **Community:** Infinite 400-page reviewers (22, single-source, intermediate to professional): "handles a lot of power and still fades back" (intermediate); "crazy overstable … too overstable" for a 280–300 ft backhand thrower (intermediate); "turn of an A1 but more glide" (advanced); "more OS than the flight chart indicates" (intermediate, -0.5/3.5); "comparable to champion Gator" (intermediate) and "Champion or Star Gator" (advanced); "you can trust that it will not turn over" (intermediate); "what a meat hook" (advanced); "low glide, slow to finish … imaginary wall around 300 feet" (advanced, -0.5/3); two 440–475 ft throwers rate it 4/4/0/3 and 4/4/0/3.5 ("can handle extreme amounts of power"). Search-summary retailer text: comparable discs "Innova Caiman, Discraft Zone and MVP Entropy."
- sources:
  - {name: Prodigy A3 400 plastic page (4/3/0/3, "Overstable"), url: https://prodigydisc.com/products/prodigy-a3-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Prodigy A-series comparison blog (A1 > A2 > A3; read in batch 7), url: https://prodigydisc.com/blogs/news/finding-the-best-disc-golf-approach-disc-a-series-by-prodigy-disc, type: manufacturer, weight: 0.5}
  - {name: Infinite Discs A3 (mfr 4/4/0/3; reviewers 4/3.8/0/3.1; 46 reviews), url: https://infinitediscs.com/prodigy-a3, type: retailer, weight: 0.5}
  - {name: Infinite Discs 400 A3 (22 ratings; reviewer text), url: https://infinitediscs.com/prodigy-a3/400, type: retailer, weight: 0.3}
  - {name: Marshall Street A3 (4/3/0/3; not independent), url: https://www.marshallstreetdiscgolf.com/?s=%22A3%22&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, the 46-rating mold average and the 22-rating 400 page agree on 0/3 to within 0.1, and the text, from 100 ft approach throwers to 475 ft arms, describes a torque-resistant, overstable utility approach disc that does not turn over, which is Prodigy's copy. The one "crazy overstable" report is a 280–300 ft backhand thrower, the usual arm-speed spread. The A series was renumbered in 2023 (batch 7); the A3's current Prodigy page equals the Atlas, so no renumbering hazard here. No contradicting evidence found.
- **plasticVariance:** Sold in 200 through 750, ReBlend, Prodigy Glow and X-Outs; Prodigy prints one set of numbers. Not quantified. Do not average.
- **Linked:** A1 (Atlas 4/2/0/5) and A2 (4/2/0/4), A4 (4/3/-1/3), Zone (4/3/0/3), Gator (5/2/0/4 after the applied override) and Entropy (4/3/0/3). The ordering A1 > A2 > A3 on fade is intact. The A1/A2 spacing soft watch is unaffected. Nothing moves.

## Magnet — Discraft (id 585ca3f88eeb)

- **Atlas now:** 2/3/-1/1 (source: Marshall Street snapshot, label "Stable"; PDGA approval 93-06, Jul 1993; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Pro-D (the best-reviewed at Infinite; Putter Line, Jawbreaker and Crazy Tuff are the others).
- **Manufacturer:** Discraft 2/3/-1/1, stability 0 (team.discraft.com page fetched; spot-check the rating). Copy: "our flagship putter, and is used by thousands of seasoned disc golfers. Not too hard, not too soft ... it goes in and stays in. This disc is excellent in the wind and makes a superb short range driver and approach disc." Copy and numbers agree. Infinite "Stable": "mostly stable flight path with a mild fade at the end."
- **Retailer:** Infinite reviewer numbers 2/3/-1/1.4 (37 ratings, 4.12 stars); **Pro-D page 2/3/-1/1.4 (20 ratings, 3.9 stars); Putter Line page zero ratings.** Turn exact; **fade runs 0.4 over the printed 1** in the pooled average. Marshall Street 2/3/-1/1 (baseline).
- **Community:** Infinite Pro-D-page reviewers (20, single-source, beginner to professional): **fade splits cleanly by skill.** The four professionals rate fade 1, 1, 0.5 and 1 (one at 325 ft: "very torque resistant and straight … hyzer-flip to turnovers from 120–300 feet"); nine of ten beginner/intermediate/advanced reviewers with a fade rating give 2 (the tenth gives 1), mostly using it as a putter or short approach ("stable flight prevents dumping left," "just outside the circle or inside the circle putts"). Every reviewer who rated turn gave -1 (one -1.5, one -0.5). The rim comments (deep, "snags," "too bulky") are feel, not flight. Chris Bawden (Disc Golf Puttheads; no plastic or arm speed stated beyond 150–225 ft-plus distances): "displays a gentle turn on long throws of 225 feet and beyond … almost no turn on the shorter throws … inside 50 feet stable and will hold a straight line just until the end of the flight where it fades hard."
- sources:
  - {name: Discraft team Magnet page (2/3/-1/1, stability 0), url: https://www.team.discraft.com/discs/magnet, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Magnet (mfr 2/3/-1/1; reviewers 2/3/-1/1.4; 37 ratings), url: https://infinitediscs.com/discraft-magnet, type: retailer, weight: 0.5}
  - {name: Infinite Discs Pro-D Magnet (20 ratings; reviewer text), url: https://infinitediscs.com/discraft-magnet/pro-d, type: retailer, weight: 0.3}
  - {name: Infinite Discs Putter Line Magnet (0 ratings), url: https://infinitediscs.com/discraft-magnet/putter-line, type: retailer, weight: 0.0}
  - {name: Disc Golf Puttheads Magnet review (Chris Bawden), url: https://www.dgputtheads.com/discraft-magnet-review, type: community, weight: 0.3}
  - {name: Marshall Street Magnet (2/3/-1/1; not independent), url: https://www.marshallstreetdiscgolf.com/?s=magnet&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, both Infinite pools and the named review agree on -1 turn, and fade is 1 for the fast arms and 2 for the slower arms who dominate the pool, which is the usual putter pattern (a putter fades more at low speed). Skill-normalized, the evidence supports 1, so the pooled 1.4 is not a mold-level correction. No contradicting evidence found. The one reservation: the plastic the policy would name (Putter Line or Pro-D) has either no ratings or a pool that is mostly slower arms.
- **plasticVariance:** Sold in Pro-D, Putter Line (and Soft), Jawbreaker, Crazy Tuff, ESP and signature runs; Discraft prints one set of numbers. A professional reviewer reports the soft-plastic version enables "very short turnovers that glide to the right." Not quantified. Do not average.
- **Linked:** Luna (the Putter Line Hard override is now 3/4/0/2, after the owner's fade 3 → 2), Zone (4/3/0/3), Challenger (2/3/0/2), Aviar (2/3/0/1), Wedge (3/5/-3/1) and Magic (Gateway 2/3/-1/0, which batch 5 checked against the Magnet). The Atlas orders Magnet between the Aviar and the Luna on fade, as the retail text implies. Nothing moves.

## Warlock — Gateway (id fa4a41f24148)

- **Atlas now:** 2/3/0/1 (source: Marshall Street snapshot, label "Stable"; PDGA approval 07-16, Mar 2007; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Super Stupid Soft (the best-reviewed at Infinite; Evolution has zero ratings).
- **Manufacturer:** Gateway 2/3/0/1, "Stable" (collection page fetched on gatewaydiscsports.com; gatewaydiscs.com failed on SSL). Copy: "The Warlock is very similar to the Wizard but without the signature bead. As a result, the Warlock is dead-straight and stable out of the box with a later low-speed fade when thrown hard. You'll find the Warlock to be a great putter to complement your Wizard." Copy and numbers agree. Infinite: "the beadless … version of the popular Wizard … a neutral-flying putter that is slightly more understable than the Wizard" (Infinite's wording, a mild contrast with Gateway's "very similar").
- **Retailer:** Infinite reviewer numbers 2.3/3.5/-0.2/1.2 (44 ratings, 4.64 stars); **Super Stupid Soft 2.3/3.6/-0.2/1.3 (10 ratings), Super Soft 2.1/3.1/-0.1/1.1 (5), Soft 2.2/3.3/-0.1/1.1 (6), Firm 2/3/0/2.5 (1).** Turn within 0.2, fade within 0.3 on every plastic with more than one rating. For comparison, Infinite's Wizard (printed 2/3/0/2) reads 2.3/3.6/0/1.9 on 294 ratings, so the Warlock reads about 0.7 less fade than the Wizard, close to the Atlas's one-point gap. **Printed-number split, one source:** Disc Golf Puttheads' review (Chris Bawden) cites a flight rating of -1/2 for the Warlock, which neither Gateway, Infinite nor Marshall Street prints; I treated it as a template error (weight 0.1, low). Marshall Street 2/3/0/1 (baseline).
- **Community:** Infinite SSS, SS and Soft-page reviewers (single-source, beginner to advanced, no distances beyond one 200 ft): most rate 2/3/0/1 or 2/3/0/1.5; "straight flight with some fade towards the end … beats in really well" (intermediate); "go to putter, Aviar-like feel … beats in beautifully despite initial stability" (advanced); "more understable than Wizard, more responsive to technique" (intermediate, rated 3/4/-1/1.5); "stable enough to never turn over" (intermediate, 200 ft); "flies truer and truer as you beat to a pulp"; a cluster of seven reviewers rate it 3/5/-1/2 or similar (beginner to advanced), a different flight shape that I could not attribute. Firm plastic (one rating, intermediate): "very overstable … extremely flat … fade early … loosens stability quite quick." Bawden: "dead-straight stable out of the box … holds its line and cuts through the air … a sharp drop at the end … somewhat similar to the newer Discraft Roach." Search-summary DGCR snippets (titles and summaries only, not read): disagreement on whether the beadless Warlock is meaningfully more understable than the Wizard ("almost identical" against "turns over easier").
- sources:
  - {name: Gateway Warlock collection page (2/3/0/1, "Stable"), url: https://gatewaydiscsports.com/collections/warlock, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Warlock (mfr 2/3/0/1; reviewers 2.3/3.5/-0.2/1.2; 44 ratings), url: https://infinitediscs.com/gateway-warlock, type: retailer, weight: 0.5}
  - {name: Infinite Discs Super Stupid Soft Warlock (10 ratings; reviewer text), url: https://infinitediscs.com/gateway-warlock/super-stupid-soft, type: retailer, weight: 0.3}
  - {name: Infinite Discs Super Soft Warlock (5 ratings), url: https://infinitediscs.com/gateway-warlock/super-soft, type: retailer, weight: 0.2}
  - {name: Infinite Discs Soft Warlock (6 ratings), url: https://infinitediscs.com/gateway-warlock/soft, type: retailer, weight: 0.2}
  - {name: Infinite Discs Wizard (294 ratings; linked comparison only), url: https://infinitediscs.com/gateway-wizard, type: retailer, weight: 0.2}
  - {name: Disc Golf Puttheads Warlock review (Chris Bawden; prints -1/2, treated as template error), url: https://www.dgputtheads.com/gateway-warlock-review, type: community, weight: 0.2}
  - {name: Marshall Street Warlock (2/3/0/1; not independent), url: https://www.marshallstreetdiscgolf.com/?s=warlock&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and the 44-rating mold average (plus three plastic pages) agree on 0/1 to within 0.2 on turn and 0.3 on fade, and the text describes a dead-straight, beadless putter with a late finish, which is Gateway's copy. The Atlas fade gap to the Wizard (1 vs 2) matches the reviewer-average gap (about 0.7). Held at 0.65 because most plastic pages have 1 to 10 ratings, the reference plastic is a guess, no reviewer states an arm speed, and the Warlock-versus-Wizard comparison is split between Gateway's "very similar" and Infinite's "slightly more understable." No contradicting evidence found.
- **plasticVariance:** Sold in Suregrip (SS, SSS, SSSS), Soft, Super Soft, Firm, Nylon, Evolution, Lunar, Hemp, Eraser, Diamond and many specialty runs; Gateway prints one set of numbers. The single Firm rating reads more overstable and loses stability quickly; the soft family reads straight to slightly understable. Not quantified. Do not average.
- **Linked:** Wizard (Atlas 2/3/0/2), Voodoo (2/3/0/0, which a batch 9 reviewer called less stable than the Wizard) and Magic (2/3/-1/0). The Atlas order Wizard > Warlock > Voodoo on fade is intact. Nothing moves.

---

## Batch 12 report (for Freddy)

**Decided items recorded first:** Monarch confirmed as-is at -4 (policy; the -3.5 signal has no Star data); Astra turn -1 → -1.5 approved and applied in the main tree separately.

**Proposed changes (0).** All nine molds with a readable manufacturer page and printed digits equal their Atlas numbers on turn and fade.

**Open candidates (2), both not gated:**
- **Toro turn 1 → 0.5** (|Δ| 0.5). Infinite's mold average (30 ratings) is +0.5, and the Star and Champion pages (7 and 8 ratings) both read about +0.4, with nine of fifteen visible ratings at 0. Held back: Innova's number and copy say +1, the sample is small and mostly 200–250 ft arms, the text is split on whether it is overstable for forehands, and no named reviewer. A 0.5 turn would still keep the Toro at or above the Atlas Zone on turn. Fade (3) reads 3.1–3.25 on the plastic pages, so no fade candidate. Review Zone, Rat, Pig, Gator and A1 with it if it moves.
- **Quasar turn 0 → -0.5** (|Δ| 0.5). Millennium prints no digits and says only "resistance to turn," so the retail 0/3 has no manufacturer anchor. Infinite's mold average (17 ratings) is -0.5/3.4, per-reviewer ratings are mostly -1, several reviewers call it "identical" to the Boss (Atlas 13/5/-1/3), and one detailed 350–400 ft read gives -0.5/3.5. Held back: the Quantum page's average and per-reviewer ratings disagree, samples are tiny per plastic, and no reviewer states an arm speed. Fade 3 → 3.5 is a soft watch only. Review Boss, Ape, XCaliber, Dimension, Delirium and Destroyer with it if it moves.

**Confirmed as-is (8):** Sidewinder (0.75); M4, Delirium, A3, Magnet (0.7); Warlock, Passion (0.65); Diablo (0.6). Confirmations mean "no contradicting evidence found," not independent community verification. Diablo and Passion are the least firm (small reference-plastic pools, no named reviewer). Magnet's pooled fade (1.4) is a slower-arm effect: pros read 1, slower arms read 2.

**Too thin to call (2):** Toro, Quasar (above).

**Label contradictions recorded (same numbers):** M4 (Prodigy "Slightly Understable," Infinite "Stable"), Passion (Marshall Street "Understable," Infinite and Discraft "Stable"), Diablo (Gateway and Marshall Street "Overstable," Infinite "Stable"), Delirium (Axiom "Overstable" against its own copy "very overstable"). None is a numeric disagreement.

**Spot-checks needed before any override source note:** the Quasar Infinite Quantum page's average-versus-per-reviewer mismatch; the Discraft stability ratings (Passion 1.0, Magnet 0); whether shop.golfdisc.com is Millennium's own retail and so counts as a manufacturer layer (golfdisc.com itself identifies as Millennium's official site); the search-summary lines (Sidewinder plastic behaviour, Toro-versus-Zone, Passion "more overstable out of the box"); the shared Boss sentence on the Quasar; and any quote taken via the summarizing fetch.

**Process notes for the next batch**

- Next ten by `featured.js` order after Warlock: D3 (Prodigy), Verdict (Dynamic Discs), Captain (Dynamic Discs), Machete (Discraft), Photon (MVP), Vulture (Discraft), F3 (Prodigy), D1 (Prodigy), Virus (Axiom), Stalker (Discraft). Valkyrie was done in batch 4; Defy, Anax, CD1, Culprit and Sonic follow. D3 and D1 link to the open D2 turn candidate (D1/D2/D3 as a set), and F3 sits with the Prodigy renumbering hazard noted in batch 7 (check Prodigy's own page before any retailer or reviewer average).
- **Millennium's own site has a qualitative layer, which refines batch 11.** `golfdisc.com/discs/<mold>/` prints labels and copy but no turn/fade digits: **Astra** "Slightly Understable Long Range Driver," copy "considered straight to understable … more understable and has less fade than the Quantum Astra," "made of our original premium plastic" (Standard); **Orion LF** "Slightly Overstable Long Range Driver," "cut through a headwind, and give you a predictable fade downwind"; **Quasar** "Overstable." Batch 11's "no manufacturer page found" for the Astra and Orion LF should read "Millennium publishes qualitative labels, not numbers." The Astra label supports the approved -1.5; the Orion LF label is consistent with the Atlas -1/2 only loosely (batch 10's Orion LF fade soft watch is unaffected). Millennium calls Standard its "original premium plastic," which is a candidate for the reference plastic under the policy for Millennium molds (not verified against sales). These three pages came through the fetch step: spot-check.
- **Overrides already in this worktree's `verified-model-overrides.json` (observed, not touched):** Roc fade 2.5, Luna 3/4/0/2, Trident fade 3.5, Gator fade 4 and Trespass turn -1, besides the Destroyer adjustment and the Cigarra and Discmania entries. So the batch 11 running list is out of date in this tree: the Luna, Gator and Trident items and the Trespass turn candidate appear to have been applied. **Please confirm and I will update the list.** I did not find Synapse in the file, so the Synapse gated proposal looks still pending; the Astra approval is not in this tree yet.
- **Open-candidate running list (nothing applied by this lane), updated for the above:** Still open: **D2 turn 0 → -0.5, MD3 (new) fade (Atlas 1 vs reviewers about 2), Tesla turn -1 → -0.5, Fury fade 2 → 1.5, plus this batch's Toro turn 1 → 0.5 and Quasar turn 0 → -0.5**; gated and, per the file, possibly still pending: **Synapse turn -1.5 → 0**. **Closed this batch:** Monarch (confirmed at -4, policy), Astra (approved -1.5). **Appear applied in this tree (confirm):** Luna, Gator, Trident, Trespass, Roc. Soft watches: Falk turn, Svea turn, A1/A2 spacing, PA3 fade, Lots turn, Voodoo fade, PD2 fade, PD2/Enforcer, Stingray Star turn, Orion LF fade, Tantrum fade, **plus this batch's Quasar fade 3 → 3.5**. **Catalog-identity flag still open:** FD1/FD2/Instinct (batch 11).
- **Linked sets re-checked this batch:** Toro/Zone/Rat/Pig/Gator/A1/A3, M4/M3/M5/Buzzz/Truth, Quasar/Boss/Ape/XCaliber/Dimension/Delirium/Destroyer/Astra, Passion/Cyclone/Buzzz/Luna, Sidewinder/Roadrunner/Monarch/Valkyrie/Mamba/Escape, Diablo/Thunderbird/Teebird/Escape, Delirium/Dimension/Tantrum/Nuke/Nitro/Quasar, A3/A1/A2/A4/Zone/Gator/Entropy, Magnet/Luna/Zone/Challenger/Aviar/Wedge/Magic, Warlock/Wizard/Voodoo/Magic. Nothing moves beyond the two open candidates. The Boss/Wraith/Destroyer/Firebird set is not reopened: the Quasar candidate, if it ever moves, would sit next to the Boss and is the only new link into that set.
- **Stale-catalog pattern:** none of the nine readable manufacturer pages differed from Marshall Street's snapshot. The one retail split on any number was Infinite's A3 glide (4 vs 3), the same shape as the stale-retailer pattern from batch 7 (I could not tell whether Infinite or Prodigy's page is the newer one).
- Reachable manufacturer paths this batch: `innovadiscs.com/disc/{toro,sidewinder}/`, `axiomdiscs.com/discs/delirium/`, `prodigydisc.com/products/prodigy-{m4,a3}-400-plastic`, `discraft.com/paige-pierce-passion-pppassion` and `team.discraft.com/discs/magnet`, `gatewaydiscsports.com/collections/{diablo,warlock}` (gatewaydiscs.com fails on SSL), `golfdisc.com/discs/{quasar,astra,orion-lf}/` (Millennium's own site; the `shop.golfdisc.com/millennium-standard-astra` slug 404'd). Infinite slugs: Toro `/Innova-Toro/{Star,Champion}`; Sidewinder `/Innova-Sidewinder/{Star,Champion}`; M4 `/Prodigy-M4/400`; Quasar `/millennium-quasar/{sirius,quantum,millennium-standard}`; Passion `/Discraft-Passion/ESP`; Diablo `/gateway-diablo/{evolution,evolution-diamond}`; Delirium `/axiom-delirium/neutron---axiom`; A3 `/prodigy-a3/400`; Magnet `/discraft-magnet/{pro-d,putter-line}`; Warlock `/gateway-warlock/{super-stupid-soft,super-soft,soft,firm}` (`/evolution` has no ratings).
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access reads a Star-plastic Toro sample with stated arm speeds, then a Quantum or Standard Quasar sample with stated arm speeds (the Boss comparison in particular), then still the D2, Tesla and MD3 items.

---

# Batch 13 (Plan 10, Phase 2)

Researched October 3, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (already up to date; the queue doc is the only locally modified file).

Molds covered: D3, Verdict, Captain, Machete, Photon, Vulture, F3, D1, Virus, Stalker (the next ten by `public/featured.js` order after Warlock; Valkyrie was done in batch 4).

## Decided items and bookkeeping (recorded before the research)

**1. Toro (batch 12 candidate) — resolved: confirmed as-is at turn +1 (owner decision Oct 3, 2026).**

- **Resolution:** keep **4/2/1/3**. Parked per the plastic baseline policy: no reference-plastic (Star/Champion) data behind the +0.5 signal. The batch 12 "open candidate turn 1 → 0.5" is withdrawn. No override, no change.
- **For the record (factual, does not reopen the decision):** the batch 12 entry did read 7 Star and 8 Champion ratings (turn about +0.4 on both, from the visible per-reviewer ratings), so the reference-plastic data was *thin* rather than absent. Either way there was no named reviewer and no stated arm speed. Revisit only if a named Star-plastic review with a stated arm speed turns up.
- **Linked:** Zone, Rat, Pig, Gator, A1 and A3 are unaffected because the Toro does not move; the batch 12 "review as a set if it moves" note is closed.

**2. Quasar (batch 12 candidate) — resolved: confirmed as-is at turn 0 (owner decision Oct 3, 2026).**

- **Resolution:** keep **13/5/0/3**. Parked: 17 pooled ratings, no manufacturer digits, and the Infinite Quantum page's printed average disagrees with its per-reviewer ratings (that spot-check is still open). The batch 12 "open candidate turn 0 → -0.5" is withdrawn; the fade 3 → 3.5 soft watch stands.
- **Linked:** Boss, Ape, XCaliber, Dimension, Delirium and Destroyer are unaffected; the batch 12 "review as a set if it moves" note is closed.

**3. Running open-candidate / applied list — refreshed (supersedes the batch 11 and batch 12 versions).**

- **Confirmed applied in the overrides file (checked against `source-data/verified-model-overrides.json` after `git merge main`):** Roc fade 2.5 (now 4/4/0/2.5), Luna 3/4/0/2, Trident fade 3.5 (6/4/-0.5/3.5), Gator fade 4 (5/2/0/4), Trespass turn -1 (12/5/-1/3). All five are present in this tree's file.
- **Still pending in the main tree (not in this tree's file):** Synapse turn -1, Astra turn -1.5. Note for whoever applies it: the batch 10 gated Synapse proposal was turn -1.5 → 0; the value now listed as pending is -1, so it differs from the batch 10 proposal. Taken as given; flagging only so the override matches the decision.
- **Open candidates still parked:** Predator turn +1 → 0 (|Δ| 1.0, gated), D2 turn 0 → -0.5 (re-checked in this batch, see below: stays parked). **Stay as-is:** Monarch -4 (no Star data), Toro +1 (item 1), Quasar 0 (item 2).
- **Not named in the refreshed list, so carried unchanged until you say otherwise:** MD3 (new) fade (Atlas 1 vs reviewers about 2), Tesla turn -1 → -0.5, Fury fade 2 → 1.5. I do not know whether these were closed outside this lane.
- **New this batch:** **D1 fade 4 → 3.5** (open candidate, not gated; see the D1 entry). No other new candidates.
- **Soft watches (unchanged unless noted):** Falk turn, Svea turn, A1/A2 spacing, PA3 fade, Lots turn, Voodoo fade, PD2 fade, PD2/Enforcer, Stingray Star turn, Orion LF fade, Tantrum fade, Quasar fade 3 → 3.5, **plus this batch's D3 reviewer-versus-printed gap and the F3 turn reading (both untestable until post-2023 reviews exist)**. **Catalog-identity flag still open:** FD1/FD2/Instinct (batch 11).

**4. Millennium qualitative labels — amendments made in place (Oct 3, 2026).**

- **Batch 11 Astra note:** Millennium's own site (golfdisc.com) publishes qualitative labels but no digits. The Astra reads "Slightly Understable," which supports the approved -1.5 move. It is not a numeric source.
- **Batch 10 Orion LF note:** "no manufacturer page" now reads "qualitative labels only, no digits" (golfdisc.com labels the Orion LF "Slightly Overstable Long Range Driver"). The 9/5/-1/2 remains retailer-sourced.
- Both amendments are marked `[Amended Oct 3, 2026, batch 13 ...]` inside the original entries. They came through the fetch step; spot-check before any override source note.

**Standing rules applied throughout (owner-decided):**

- **Plastic baseline policy:** a mold's reference numbers are its most-thrown plastic (Star for Innova drivers). DX is the price-tier baseline but **not** the flight reference. I had no sales data, so each entry names the reference plastic I took to be the most-thrown and marks it "assumed." For Prodigy it is 400 (Prodigy's own A2 page calls 400 "the most popular Prodigy plastic across the entire lineup," per batch 7).
- **Review gate:** weak evidence = no correction; |Δ| = 1.0 changes need the owner's call; record open candidates instead of proposing them.
- **Never average across plastics:** mold-level consensus plus a `plasticVariance` note.

---

## Batch 13 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Virus | 9/5/-3.5/1 | none | Confirmed as-is | 0.75 |
| Stalker | 7/5/-1/2 | none | Confirmed as-is | 0.75 |
| Verdict | 5/4/0/3.5 | none | Confirmed as-is (Infinite lists fade 3; lag) | 0.7 |
| Captain | 13/5/-2/2 | none | Confirmed as-is (label split; Infinite reviewer ratings anchored) | 0.7 |
| Vulture | 10/5/0/2 | none | Confirmed as-is | 0.7 |
| Machete | 11/4/0/4 | none | Confirmed as-is (thin plastic pools) | 0.65 |
| Photon | 11/5/-1/2.5 | none | Confirmed as-is | 0.65 |
| D3 | 12/5/-1/3 | none | Confirmed as-is **on Prodigy's current (July 2023) numbers; retail and reviewer layers still carry the pre-2023 12/6/-2/2** | 0.6 |
| F3 | 8/5/-2/2 | none | Confirmed as-is **on Prodigy's current numbers; retail and reviewer layers still carry the pre-2023 7/5/-1/2** | 0.55 |
| D1 | 12/5/0/4 | none | **Too thin to call: fade 4 vs about 3 in three Infinite pools, no post-2023 reviews, anchoring history unknown (fade 4 → 3.5, not gated)** | 0.5 |

**No changes proposed. One new open candidate (D1 fade), nine confirmed, D2 stays parked.** The batch's structural finding is on the Prodigy D-series: **Prodigy renumbered its whole lineup on July 21, 2023** (the same event batch 7 found on the A series), and the Atlas carries the *current* numbers for D1, D3 and F3 (and for D4, D6 and the Max discs). The retail layer and the reviewer pools have not caught up. That resolves the batch 5 D2 puzzle as retailer lag (see the D-series re-check).

## D1 / D2 / D3 re-check (the batch brief's watch, done as a set)

**Answer: the new evidence does not move D2. It stays parked, and one half of its original case (the retail numbers) is withdrawn.**

- **Manufacturer layer (current, consistent):** Prodigy's D1, D2 and D3 400-plastic pages, the D3 500 page, and the distance-driver collection page all print **D1 12/5/0/4, D2 12/5/0/3, D3 12/5/-1/3** (collection labels: D1 and D2 "Stable," D3 "Understable"; the D1 product page says "Overstable," the D3 product page "Stable"). The Atlas equals all three. Prodigy's blog post "Prodigy Disc at 10" (dated July 21, 2023, read via the fetch step: **spot-check the table**) lists the update: **D1 13/5/0/4 → 12/5/0/4; D2 13/6/-0.5/3 → 12/5/0/3; D3 13/6/-2/2 → 12/5/-1/3**; also D4 12/6/-3/2 → 12/5/-2/2, D6 → 12/6/-3/2, the Max discs, F3 7/5/-1/2 → 8/5/-2/2 and F7 7/5/-3/1 → 8/6/-3/1 (M4 unchanged). The Atlas's D4 (12/5/-2/2), D6 (12/6/-3/2), D1/D2/D3 Max (13/5/-1/3, 13/5/-1/2, 13/5/-2/2), F3 (8/5/-2/2) and F7 (8/6/-3/1) all match the post-update column, so the Atlas ladder is internally the new catalog. (One oddity in the blog table as read: its "old" column prints speed 13 for D2 and D3, while retailers print the old turn/fade/glide with speed 12. Speed is outside scope; it is one more reason to spot-check the table.)
- **Retail layer (stale, and it explains batch 5):** Infinite's D2 listing 12/6/-0.5/3 (Foundation, DiscMetrics and Skyline the same) and Infinite's D3 listing **12/6/-2/2** (Marshall Street's D3 400G product page, DiscMetrics, Disc Golf Puttheads and Discount Disc Golf the same) are the pre-2023 turn/fade/glide. Marshall Street is split against itself: its D3 *listing* (the Atlas's source) is -1/3, its D3 400G *product page* is -2/2. Infinite's D1 listing 12/5/0/4 matches the current number, because the D1's turn and fade did not change. **Batch 5's "retail contradiction" on the D2 (retail -0.5 vs Prodigy 0, and Infinite's copy that the D2 has "a higher degree of high-speed turn … than the D1") is therefore the old catalog still on the shelf, not a disagreement between Prodigy's page and the current catalog.** Under the current numbers the D1 and D2 share turn 0 and differ by a fade point, which is what Prodigy's own D2 copy ("a much gentler finish than the D1") says.
- **Reviewer layer (pre-update, anchored):** Infinite's mold-level reviewer averages are D1 12.2/5.1/-0.2/3.0 (81 ratings), D2 12.1/5.9/-0.9/2.9 (77), D3 12.4/5.9/-1.9/2.1 (67). **Review dates (readable on the 400 pages, via the fetch step):** D1 400 page, 22 reviews, Feb 2013 – Mar 2023, **none after July 2023**; D2 400 page, 15 reviews, Aug 2013 – Feb 2023, **none after July 2023**; D3 400 page, 20 reviews, Jun 2013 – Nov 2024, **two after July 2023** (Dec 2023, rated -2/2; Nov 2024, rated -2/2 with the text "this disc flies 12/6/-1/2 for me, that's on a hard nose down flat to slight anny release"); D3 400G page, 17 reviews, **all 2014–2020**. Infinite's per-reviewer sliders start from the displayed number, so D3 reviewers rating -2/2 on a page that displays -2/2 are mostly echoing it. The pools describe the pre-update catalog and cannot test Prodigy's new numbers.
- **What each disc looks like now:**
  - **D3:** current Prodigy -1/3 against a reviewer pool at -1.9/2.1 is a 1.0 gap on both turn and fade, which would revert Prodigy's 2023 change and be gated. The pool is pre-update and anchored to the stale display, and a few reviewers say the disc is more overstable than the numbers (see the entry), so **no candidate**. Soft watch only, untestable until Infinite updates its display and post-2023 reviews accumulate.
  - **D2:** Atlas 0 (= Prodigy now). The reviewer pool reads about -0.9 on mold level (visible 400-page ratings about -1.2/2.8 on 12 rated reviews) with no post-update review on the 400 page. The candidate "0 → -0.5" is **the number Prodigy withdrew in 2023**; the retail echoes of it are lag; what is left is pre-update reviewer text ("a hint of high-speed turn"). **Stays parked.** Your call whether to close it outright: I would, unless a post-July-2023 D2 sample with stated arm speeds appears, but it is below the gate either way (|Δ| 0.5).
  - **D1:** a different question, in its entry. Fade reads about 3 in three pools against Prodigy's 4, and this is **not** explained by the 2023 update (D1 fade was 4 before and after, per the blog table).
- **Ordering check:** the Atlas ladder D1 12/5/0/4 > D2 12/5/0/3 > D3 12/5/-1/3 > D4 12/5/-2/2 > D6 12/6/-3/2 matches Prodigy's catalog order and the descriptions I read ("the D3 is less overstable than the D1 and D2," "D4 is the most understable"). A D1 at fade 3.5 would stay above the D2 and D3; a D2 at -0.5 would still sit between the D1 and D3, as batch 5 noted.
- **Linked:** D1 Max (13/5/-1/3), D2 Max (13/5/-1/2), D3 Max (13/5/-2/2), D2 Pro (13/5/-1/3), D4, D6, Force (12/5/0/3), Defender (13/5/0/3), Destroyer (12/5/-0.5/3.5), Firebird (9/3/0/4). Nothing moves.

## Evidence limits — batch 13

Same tooling limits as earlier batches; see the pilot section. Specific to this batch:

- **Diff against `flights.json` / `data.json` (done first):** the Atlas numbers equal the Marshall Street snapshot for all ten. None has an override and none is in `infinite-manufacturer-ratings.json`. Compared with current manufacturer pages, **all ten match exactly**: Prodigy (D3 400 and 500 pages, D1 400 page, F3 400 page, and the distance-driver collection page), Dynamic Discs (Verdict and Captain collection pages), Discraft (Machete, Vulture and Stalker on team.discraft.com), MVP (Photon, `mvpdiscsports.com/discs/photon/`) and Axiom (Virus). **No Luna/Gator/Synapse-style Atlas lag.** The staleness pattern this batch is on the *retail* side (Prodigy: Infinite, Marshall Street product pages, DiscMetrics and Disc Golf Puttheads still print pre-2023 D3 numbers; Infinite and its reviewer pool still print the pre-2023 F3) plus one smaller one (Infinite prints Verdict fade 3 against Dynamic's 3.5).
- **Prodigy July 2023 renumbering, what is known (via the fetch step, spot-check the table).** Prodigy's blog post dated July 21, 2023 lists the old-to-new numbers (see the D-series re-check). A search summary independently repeats the Max-disc rows and says the update was spearheaded by Seppo Paju and meant to better align with other manufacturers. I did not read any statement that the molds themselves changed; the search summary says the old numbers "weren't adding up" given production and plastic changes. Whether the physical D3 or F3 moved is therefore unknown; the numbers moved.
- **Review dates:** the Infinite plastic pages show a date on each review. The counts of post-July-2023 reviews (D1 0 of 22, D2 0 of 15, D3 2 of 20, F3 1 of 14 on the 400 pages) come from the fetch step reading those dates. The Infinite 400G pages for D1 and D2 did not return dates.
- **Reddit** blocked, **YouTube** unreachable, **DGCR** 403 (the Machete, Vulture, D1, D2/D3, F3 and X-versus-D-series threads appear only as search-result titles; none is cited as evidence). All Things Disc Golf's Verdict, D1 and Virus reviews returned HTTP 500 and were not read. The Nomad Discs Vulture page returned nothing. Disc Golf Reviewer was not reached for any of the ten.
- **Community layer is the Infinite plastic-page reviewers** (anonymous or first-name, single-source, most with a stated skill class, few with a distance) plus a few named reviewer sites: **Chris Bawden (Disc Golf Puttheads, Machete, Elite Z, about 350 ft with full power)**, Mandy Lee (SimplyDiscGolf, D3 versus D4, "400-450 foot range if you have solid form," no plastic stated; a retail-blog-style site, weight 0.2), Cody Winget / Tim Sladisky / Brian Keegan (Disc Golf Examiner, Captain, Lucid; no arm speed, no comparisons, weight 0.2) and one unattributed USADGS Stalker review (weight 0.1). Distance bands rather than measured arm speeds: D3 250-475 ft, D1 275-500+ ft, Captain 280-450 ft, Photon 300-500 ft, Machete and Vulture not stated beyond Bawden, Virus 250-375 ft, Stalker 250-320 ft. Confirmations read as "no contradicting evidence found," not independent community verification.
- **Anchoring on Infinite.** In several pools almost every per-reviewer rating equals the displayed number (Captain Lucid: 22 of 27 at exactly -2/2; Virus Neutron: 15 of 26 at exactly -3.5/1; D3 400G: 12 of 16 rated reviews at exactly -2/2). Where the display is correct this is uninformative agreement; where the display is stale (D3, F3) it says nothing about the current number. Used as coarse retailer-type evidence at capped weight; never alone for a proposal.
- **Spot-check needed on the Discraft stability ratings:** the summarizing fetches printed "2.2" (Machete, inside a mangled "11 / 4 / 0 / 2.2 / 4" string), "1.7" (Vulture) and "1.1" (Stalker). Not used for any conclusion. The Puttheads Machete review fetch also printed "9/4/0/3 (manufacturer rating)" next to "11/4/0/4," which is mangled; not used.
- **Marshall Street is the Atlas's own source** and was used only as baseline (its stability labels are recorded where they differ).
- Page contents came through a summarizing fetch step; spot-check any quote before it goes into an override's source note.

---

## D3 — Prodigy (id 6f4803d37808)

- **Atlas now:** 12/5/-1/3 (source: Marshall Street snapshot listing, label "Overstable"; PDGA approval 13-03, Jan 2013; no override). **Proposed turn/fade:** none. Matches Prodigy's current numbers. Reference plastic (Prodigy's most popular, per batch 7): 400.
- **Manufacturer:** Prodigy 12/5/-1/3 on the 400 and 500 plastic pages and the distance-driver collection page (labels: product pages "Stable," collection "Understable"). Copy: "a very fast, moderately stable driver with a unique flight path. It is designed for all players and flies extremely far. What separates the D3 is its ability to flip up and then glide without the extreme drift to the right or the hard finish back to the left." Copy and numbers agree ("moderately stable" fits -1/3). **History (blog, via the fetch step, spot-check):** the pre-July-2023 number was 13/6/-2/2. **Retail still prints the old set:** Infinite 12/6/-2/2 (label "Overstable"; its description "stable flight with excellent glide … recommended for hyzer flip shots while remaining stable enough to resist turning"), Marshall Street's D3 400G product page 12/6/-2/2 ("stable to slightly understable"), DiscMetrics, Disc Golf Puttheads and Discount Disc Golf the same. Marshall Street's own listing (the Atlas's source) is -1/3.
- **Retailer:** Infinite reviewer numbers 12.4/5.9/-1.9/2.1 (67 reviews, 4.49 stars); 400 page 12.2/6/-1.9/2.2 (20 reviews, 4.3); 400G page 12.3/5.9/-2/2 (17 reviews, **all dated 2014–2020**). **Against the current Prodigy number the gap is 0.9 on turn and 0.9–1.0 on fade, but the pools are pre-update and sit on a stale display** (12 of 16 rated 400G reviews are exactly -2/2). DiscMetrics 12/6/-2/2 (610 reviews, 4.7, aggregator, stale display).
- **Community:** Infinite 400-page reviewers (single-source, dated; only two after July 2023): Paul (intermediate, 325 ft, Nov 2024, rated -2/2) "I'm not a big rim guy … this disc flies 12/6/-1/2 for me, that's on a hard nose down flat to slight anny release"; Kendall Cordova (advanced, Dec 2023, -2/2) favorite of the D1/D2/D3, "great combination of glide and stability." Older: "beat in pretty good to a hyzer flip disc" (intermediate); "perfect amount of understability," comparable to a Shryke with a straighter flight (intermediate); "reaches 475 ft when thrown well," "long beautiful S turns" (advanced); against the printed -2/2 and for the current -1/3: "ultra-overstable contrary to flight numbers; suspects production error" (intermediate), "VERY overstable even in headwind," behaves like a Fireball (intermediate, rated 13/5/0/3), "extremely domey disc … unusual overstability compared to advertised" (beginner); two same-day reviews at -3/3 "goes through the flight cycle faster." Mandy Lee (SimplyDiscGolf, no plastic stated): "400-450 foot range if you have solid form," compares the D3 to the Innova Shryke "but with slightly less of an S-curve," "its stability will keep it from turning over if you give it too much arm." Search-summary retailer text: the D3 is "less overstable than the D1 and D2" (spot-check).
- sources:
  - {name: Prodigy D3 400 plastic page (12/5/-1/3, "Stable"), url: https://prodigydisc.com/products/prodigy-d3-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Prodigy D3 500 plastic page (12/5/-1/3), url: https://prodigydisc.com/products/prodigy-d3-500-plastic, type: manufacturer, weight: 0.8}
  - {name: Prodigy distance-driver collection page (D1 12/5/0/4, D2 12/5/0/3, D3 12/5/-1/3), url: https://prodigydisc.com/collections/distance-drivers, type: manufacturer, weight: 0.8}
  - {name: Prodigy Disc at 10 (July 21, 2023 flight-number update table; via fetch step, spot-check), url: https://prodigydisc.com/blogs/news/prodigy-disc-at-10-a-decade-of-innovation-and-excellence, type: manufacturer, weight: 0.8}
  - {name: Infinite Discs D3 (listing 12/6/-2/2 = pre-2023; reviewers 12.4/5.9/-1.9/2.1; 67 reviews), url: https://infinitediscs.com/prodigy-d3, type: retailer, weight: 0.3}
  - {name: Infinite Discs 400 D3 (20 reviews, dated; reviewer text), url: https://infinitediscs.com/Prodigy-D3/400, type: retailer, weight: 0.3}
  - {name: Infinite Discs 400G D3 (17 reviews, all 2014-2020), url: https://infinitediscs.com/Prodigy-D3/400G, type: retailer, weight: 0.1}
  - {name: SimplyDiscGolf D3 vs D4 (Mandy Lee), url: https://simplydiscgolf.com/prodigy-d3-vs-d4/, type: community, weight: 0.2}
  - {name: Marshall Street D3 400G product page (12/6/-2/2, stale), url: https://www.marshallstreetdiscgolf.com/product/prodigy-d3-400g, type: retailer, weight: 0.1}
  - {name: Marshall Street D3 listing (-1/3; the Atlas's source; not independent), url: https://www.marshallstreetdiscgolf.com/?cat_ids%5B%5D=6&post_type=product&s=d3&variation_toggle=1, type: retailer, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** Prodigy's current pages and collection page, and the Atlas's own Max/D4/D6 ladder, agree on -1/3. Every retailer or reviewer number that disagrees (-2/2) is the pre-July-2023 catalog: the Infinite listing, three other retailers, a 2014–2020 400G pool, and per-reviewer sliders that echo the display. The two post-update reviewers do not discriminate (both on a page displaying -2/2; one says it flies about -1/2 for him with a hard nose-down release). A few reviewers independently say the disc is more overstable than the old numbers. **Soft watch, not a candidate:** if Infinite updates its display and post-2023 reviewers still read about -2/2, the gap to -1/3 would be 1.0 on both turn and fade (gated, and it would reverse Prodigy's own 2023 revision). Held at 0.6 because the review layer cannot test the current number at all. No contradicting evidence found for the current number.
- **plasticVariance:** Sold in 200, 400, 400G, 500, Air, 750 Spectrum (Luke Humphries signature) and X-outs; Prodigy prints one set of numbers. Reviewers: "fresh discs fly more overstable, beaten-in examples more understable," dome and plastic affect stability, 400 recommended as the "sweet spot." Not quantified. Do not average.
- **Linked:** D1/D2 (re-check above), D3 Max (13/5/-2/2), D4 (12/5/-2/2), Shryke (13/6/-2/2, the reviewers' comparison) and DD2 (2025) (override 12/5/-1/2, the SimplyDiscGolf comparison). Nothing moves.

## Verdict — Dynamic Discs (id f650958e3f61)

- **Atlas now:** 5/4/0/3.5 (source: Marshall Street snapshot, label "Overstable"; PDGA approval 13-34, May 2013; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Lucid (Infinite lists 21 plastics; Lucid is the page I could read).
- **Manufacturer:** Dynamic Discs 5/4/0/3.5, "Overstable" (collection page fetched). Copy: "Predictable. Overstable. Midrange. This is the Verdict. You can trust this disc to get the midrange distance you need even when the winds are threatening to flip everything that you throw. The Verdict is a great complement to the Truth in speed and feel in the hand." Copy and numbers agree. **Small retail split on fade:** Infinite prints **5/4/0/3** (its description: "a very overstable midrange designed to handle a lot of torque with accurate consistent flights"); Titan Disc Golf and Armory Disc Golf (search-summary titles and text, not read in full) print 5/4/0/3.5. Dynamic's own page says 3.5; I could not tell whether Infinite's 3 is a lag or a rounding.
- **Retailer:** Infinite reviewer numbers 5.1/4.1/-0.1/3.3 (125 reviews, 4.77 stars); Lucid page the same (52 ratings, 4.7 stars). Because Infinite displays fade 3, anchoring would pull the average *down* toward 3; the 3.3 sits between Infinite's display and Dynamic's 3.5, within 0.2 of the manufacturer. Marshall Street 5/4/0/3.5 (baseline).
- **Community:** Infinite Lucid-page reviewers (single-source, advanced or intermediate, no distances): "It is overstable, but it is still workable for wide variety of shots unlike the Justice" (advanced); "thrown at high power, it will flip up, fly straight, and then always fade" (advanced); "very glidy and controllable with a consistent fade to the left on a RHBH" (advanced); "perfect for flex shots and those in-between shots that are too long for a putter or mid" (intermediate); "I can throw this disc as hard as I want and it has yet to turn over on me" (advanced). Search-summary retailer text (spot-check): "a straight start followed by a strong, consistent fade," "more torque resistance and a firmer finish" than the Truth.
- sources:
  - {name: Dynamic Discs Verdict collection page (5/4/0/3.5, "Overstable"), url: https://www.dynamicdiscs.com/collections/dynamic-discs-verdict, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Verdict (listing 5/4/0/3; reviewers 5.1/4.1/-0.1/3.3; 125 reviews), url: https://infinitediscs.com/dynamic-discs-verdict, type: retailer, weight: 0.5}
  - {name: Infinite Discs Lucid Verdict (52 ratings; reviewer text), url: https://infinitediscs.com/Dynamic-Discs-Verdict/Lucid, type: retailer, weight: 0.3}
  - {name: Titan Disc Golf Lucid Verdict (5/4/0/3.5; search result), url: https://titandiscgolf.com/products/dynamic-discs-lucid-verdict-5-4-0-3-5, type: retailer, weight: 0.1}
  - {name: Marshall Street Verdict (5/4/0/3.5; not independent), url: https://www.marshallstreetdiscgolf.com/?s=verdict&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, the 125-rating and 52-rating Infinite averages (3.3 on a display of 3, so leaning toward 3.5) and the reviewer text agree on a very overstable midrange that flips up at power and always fades. Infinite's printed fade of 3 is the one outlier and the manufacturer and two other retailers say 3.5. No contradicting evidence found.
- **plasticVariance:** Sold in 21 plastics at Infinite; Dynamic prints one set of numbers. No spread quantified. Do not average.
- **Linked:** Truth (Atlas 5/5/-1/1, the complement Dynamic names), Justice (5/1/0.5/4, "unlike the Justice"), Zone (4/3/0/3), Roc (4/4/0/2.5 after the applied override) and Sergeant (11/4/0/2.5). The Atlas puts the Verdict between the Zone and the Justice on fade, which is what the reviewers say. Nothing moves.

## Captain — Dynamic Discs (id af8997c60abf)

- **Atlas now:** 13/5/-2/2 (source: Marshall Street snapshot, label **"Stable"**; PDGA approval 17-121, Dec 2017; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Lucid.
- **Manufacturer:** Dynamic Discs 13/5/-2/2, "Understable" (collection page fetched). Copy: "The Dynamic Discs Captain is a great introduction to distance drivers for newer players and a predictable understable disc for more experienced players. With surprising speed and controllable turn, the Captain can help players add distance over discs with similar rim sizes." Recommended for "distance shots, long turnovers, distance flex shots for slower arms." Infinite: "max distance for less experienced players and a predictable, understable flight for disc golfers with big arms." **Label contradiction, same numbers:** Dynamic and Infinite "Understable"; Marshall Street (the Atlas's catalog) "Stable." Copy and numbers agree.
- **Retailer:** Infinite reviewer numbers 12.7/4.9/-2/2 (36 reviews, 4.42 stars); Lucid page 12.7/4.9/-2/2 (27 ratings, 4.4 stars). Turn and fade exact, **but 22 of the 27 per-reviewer ratings on the Lucid page are exactly -2/2**, so this is largely the display echoed back. Marshall Street 13/5/-2/2 (baseline).
- **Community:** Infinite Lucid-page reviewers (single-source; skill and a few distances; the per-reviewer outliers are fade 1.5 to 3.5, turn -1.5 to -2.5): "excellent understable high speed driver" needing power (advanced, 450 ft); "similar to Thrasher but handles wind slightly better and less understable" (advanced); "flies straighter than comparable Trespass; bridges gap between Trespass and Hades" (advanced); "requires speed 13 arm speed" (advanced); "turns over in headwinds requiring heavy anhyzer lines" (intermediate, 325-350 ft); "beats in quickly" (intermediate); "stable when powered down, avoid strong headwinds" (intermediate); "strong fade and susceptible to headwinds" (advanced, rated fade 3.5, the one outlier on fade); "flexes out unlike Shryke"; "reminiscent of Katana, better than Sheriff." Disc Golf Examiner (Cody Winget, Tim Sladisky, Brian Keegan; Lucid; no arm speed stated): "an understable distance driver that is great for flex shots and long bomber shots." Search-summary text (spot-check): "throws very similar to the Trespass but with the same release goes further and straighter."
- sources:
  - {name: Dynamic Discs Captain collection page (13/5/-2/2, "Understable"), url: https://www.dynamicdiscs.com/collections/dynamic-discs-captain, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Captain (reviewers 12.7/4.9/-2/2; 36 reviews), url: https://infinitediscs.com/dynamic-discs-captain, type: retailer, weight: 0.4}
  - {name: Infinite Discs Lucid Captain (27 ratings, mostly -2/2; reviewer text), url: https://infinitediscs.com/Dynamic-Discs-Captain/Lucid, type: retailer, weight: 0.3}
  - {name: Disc Golf Examiner Captain review (Lucid; no arm speed), url: https://discgolfexaminer.com/disc-reviews/dynamic-discs-captain-review/, type: community, weight: 0.2}
  - {name: Marshall Street Captain (13/5/-2/2, "Stable"; not independent), url: https://www.marshallstreetdiscgolf.com/?s=captain&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, both Infinite averages and the text agree on an understable 13-speed that wants power, turns over in headwinds and finishes gently, which is Dynamic's copy. The Infinite per-reviewer ratings are mostly the display echoed back, so the agreement on -2/2 is weaker than the counts suggest; the text does the confirming. The reviewer comparisons place the Captain between the Trespass and the Hades/Thrasher on turn, which is where the Atlas puts it. The label split (Marshall "Stable") is wording only. No contradicting evidence found.
- **plasticVariance:** Sold in Lucid and other blends (one reviewer prefers Lucid over Fuzion); Dynamic prints one set of numbers. Not quantified. Do not average.
- **Linked:** Trespass (Atlas 12/5/-1/3 after the applied override), Hades (12/6/-3/2), Thrasher (12/5/-3/2), Sheriff (13/5/-1/2), Shryke (13/6/-2/2) and Katana (13/5/-3/3). The applied Trespass turn -1 keeps the Captain a full point more understable than the Trespass, as the "bridges the gap" remark describes. Nothing moves.

## Machete — Discraft (id 0651d9a5b1f8)

- **Atlas now:** 11/4/0/4 (source: Marshall Street snapshot, label "Overstable"; PDGA approval 17-30, Mar 2017; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): ESP (Infinite's ESP page has only 3 ratings; Z-family plastics also carry the mold).
- **Manufacturer:** Discraft 11/4/0/4 (team.discraft.com page fetched; stability 2.2, spot-check, the fetch printed a mangled "11 / 4 / 0 / 2.2 / 4"), "Overstable." Copy as quoted by Infinite: "The Machete will slice through the wind and carry you to victory. This is a low-profile disc with a medium thickness rim." The team page: built to slice through headwinds; team players use it for sidearm shots and spike hyzers, it "handles all the torque while maintaining a consistent hard fade." Copy and numbers agree. Infinite "Very Overstable"; Marshall Street "Overstable."
- **Retailer:** Infinite reviewer numbers 10.7/3.7/0.2/4 (30 ratings, 4.47 stars); ESP page 3 ratings, rated 11/4/0/4, 10/3/0/5 and 11/3/0/4. Turn within 0.2, fade exact; glide reads 0.3 under the printed 4 (outside scope). Marshall Street 11/4/0/4 (baseline).
- **Community:** Chris Bawden (Disc Golf Puttheads, Elite Z, about 350 ft with full power; via the fetch step, spot-check): "overstable," "the first few throws are more overstable than expected," fights anhyzer lines; compares it to the Predator ("a little more speed and less propensity to turn," and he threw the Predator 10-15 ft further) and suggests Firebird throwers "may want to consider testing the Machete." **The fetch step printed a wrong manufacturer line for this review ("9/4/0/3") and the subject of the Predator comparison is ambiguous; quote nothing from it before spot-checking.** Infinite ESP-page reviewers (three, single-source): "it's a BIG meat hook (to the left)" (beginner, 11/4/0/4); "not for anyone except people with big arms," Firebird-like with a more sweeping fade (intermediate, rated 10/3/0/5); "lack of glide and nice big fade at the end of the flight" (intermediate). Search-summary DGCR text (titles and snippets only, not read): "flies like a faster flat-top Firebird" and "throws 20 feet shorter than the Firebird."
- sources:
  - {name: Discraft Machete team page (11/4/0/4, stability 2.2), url: https://www.team.discraft.com/discs/machete, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Machete (mfr 11/4/0/4; reviewers 10.7/3.7/0.2/4; 30 ratings), url: https://infinitediscs.com/discraft-machete, type: retailer, weight: 0.5}
  - {name: Infinite Discs ESP Machete (3 ratings; reviewer text), url: https://infinitediscs.com/discraft-machete/esp, type: retailer, weight: 0.2}
  - {name: Disc Golf Puttheads Machete review (Chris Bawden, Elite Z; via fetch step), url: https://www.dgputtheads.com/discraft-machete-review, type: community, weight: 0.3}
  - {name: Marshall Street Machete (11/4/0/4; not independent), url: https://www.marshallstreetdiscgolf.com/?s=machete&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and the 30-rating Infinite average agree on 0/4 to within 0.2, and the named reviewer and the three ESP reviewers describe a very overstable, low-glide driver with a hard fade that needs a big arm, which is Discraft's copy. Held at 0.65 because the reference-plastic page has three ratings and the one named review is a single 350 ft thrower read through a mangled fetch. No contradicting evidence found. **Bearing on the open Predator candidate (+1 → 0, gated):** if Bawden's remark means the Machete turns *less* than the Predator, it sits against the Atlas's Predator +1 (which would turn less than the Machete's 0) and fits the Predator moving to 0. One reviewer, ambiguous wording, so it does not change the Predator's status; it is recorded for whenever that candidate is reviewed.
- **plasticVariance:** Sold in ESP, Z, Elite Z and other Discraft blends; Discraft prints one set of numbers. Bawden's Elite Z was "more overstable than expected" for the first throws. Not quantified. Do not average.
- **Linked:** Firebird (Atlas 9/3/0/4, the reviewers' comparison), Predator (9/4/1/4, open candidate +1 → 0), Pulse (11/4/0/3), Force (12/5/0/3), Defender (13/5/0/3) and Raptor (9/4/0/3). The Machete shares the Firebird's turn and fade in the Atlas, as the "faster Firebird" remarks say. Nothing moves.

## Photon — MVP (id 5141a3d33187)

- **Atlas now:** 11/5/-1/2.5 (source: Marshall Street snapshot, label "Overstable"; PDGA approval 15-03, Feb 2015; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Neutron (Infinite's best-populated page; Proton, Plasma and Fission also carry the mold).
- **Manufacturer:** MVP 11/5/-1/2.5, "Stable-Overstable" (`mvpdiscsports.com/discs/photon/` fetched). Copy: "a stable-overstable high-speed distance driver. The Photon is best described as a longer Tesla, with power throwers able to achieve some flight-extending turn, and all throwers getting a reliable fade," naturally headwind resistant. Copy and numbers agree. **Label split, same numbers:** MVP "Stable-Overstable"; Infinite and Marshall Street "Overstable." Infinite: "a longer Tesla."
- **Retailer:** Infinite reviewer numbers 11.3/4.9/-0.9/2.7 (94 reviews, 4.47 stars); the Neutron page has 26 ratings, and the visible per-reviewer ratings average about -0.6 turn and 2.7 fade (my arithmetic on 25 rated reviews). Turn 0.1–0.4 above the printed -1, fade 0.2 above 2.5. Marshall Street 11/5/-1/2.5 (baseline).
- **Community:** Infinite Neutron-page reviewers (single-source; distances 300-500 ft): "Very similar to a Destroyer, but less high speed turn" (advanced, 400 ft, rated -0.5/2.5); "Further flying slightly less overstable Tesla" (intermediate, 325-350 ft); "Takes small turn, holds level for quite a bit" (beginner, 375-425 ft); "Go to forehand distance disc" (intermediate); "Flies like it's rated … prefer Proton for forehands" (advanced, 350 ft, rated 0/3); "Nowhere near as overstable as Destroyer" (intermediate, -1/1.5-2); "Main driver … BOMB potential" (professional, 440-500 ft, -0.5/3); against: "Way over-stable, much more so than numbers suggest" (intermediate, rated 11/3/0/4), "If you want a disc that won't turn over this is your ticket" (intermediate, rated +1/3). Five of the 25 visible ratings are turn 0 or above. Plastic notes (reviewers and search summary): "different flight between Cosmic Neutron and Fission," Proton more overstable than Neutron.
- sources:
  - {name: MVP Photon page (11/5/-1/2.5, "Stable-Overstable"), url: https://mvpdiscsports.com/discs/photon/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Photon (mfr 11/5/-1/2.5; reviewers 11.3/4.9/-0.9/2.7; 94 reviews), url: https://infinitediscs.com/mvp-photon, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Photon (26 ratings; reviewer text), url: https://infinitediscs.com/MVP-Photon/Neutron, type: retailer, weight: 0.3}
  - {name: Disc Golf Puttheads Photon chart (templated), url: https://www.dgputtheads.com/flight-charts/photon, type: retailer, weight: 0.1}
  - {name: Marshall Street Photon (11/5/-1/2.5; not independent), url: https://www.marshallstreetdiscgolf.com/?s=photon&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Manufacturer and the 94-rating average agree on -1/2.5 to within 0.4 on turn and 0.2 on fade, and the text, from 300 to 500 ft throwers, describes a "longer Tesla" with a touch of turn for power and a dependable fade, which is MVP's copy. The reviewers who say it is more overstable than printed (turn 0 or +1) and those who say it turns small are the usual plastic and arm-speed spread. No contradicting evidence found.
- **plasticVariance:** Sold in Neutron, Proton, Plasma, Fission (plus Cosmic variants); MVP prints one set of numbers. Reviewers: Proton more overstable than Neutron, Fission for lower arm speeds. Not quantified. Do not average.
- **Linked:** Tesla (Atlas 9/5/-1/2; the open turn candidate -1 → -0.5 is unchanged, but note MVP calls the Photon a "longer Tesla," so review the Photon with the Tesla if the Tesla moves), Destroyer (12/5/-0.5/3.5, two reviewers' comparison), Wraith (11/5/-1/3), Surge (11/5/-1/3) and Teleport (14.5/5/-1.5/2.5). Nothing moves.

## Vulture — Discraft (id ba04ef87b683)

- **Atlas now:** 10/5/0/2 (source: Marshall Street snapshot, label "Overstable"; PDGA approval 18-97, Feb 2018; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): ESP (21 plastics at Infinite, including Big Z, Titanium and Tour Series).
- **Manufacturer:** Discraft 10/5/0/2 (team.discraft.com page fetched; stability 1.7, spot-check). Copy (fetch-step wording, partly quoted): a refined Predator with reduced overstability and improved glide, it "holds an almost perfect line on big throws" and gives "extra glide whether you're throwing backhand or sidearm, and a consistent fade into your target"; medium rim. Infinite: "a beat in Predator that is less overstable and offers more glide." Copy and numbers agree.
- **Retailer:** Infinite reviewer numbers 9.8/4.8/-0.1/2 (77 reviews, 4.62 stars); ESP page 9.8/4.9/0/2.1 (13 ratings, 4.7 stars). Turn within 0.1, fade within 0.1. Marshall Street 10/5/0/2 (baseline).
- **Community:** Infinite ESP-page reviewers (13; intermediate to advanced, no distances; 10 of 13 rate it 0/2): "Very reliable and controllable disc for faster arm speeds" (advanced); "I can always trust this disc to fly straight with just a slight fade" (intermediate); "holds a line … then really fades as the disc is overstable" (intermediate); "like a longer Teebird" and "flew a lot like a good Teebird" (intermediate); "comparable to a Thunderbird but with a little more glide" (intermediate); "a little more stable than what I was looking for" (intermediate); one advanced reviewer rates it 9/5/0/3.5, "even more overstable than the Anax"; "when worked in I think it will throw closer to the true flight numbers" (advanced). Search-summary text (spot-check): "well-seasoned Predator, less overstability and more glide."
- sources:
  - {name: Discraft Vulture team page (10/5/0/2, stability 1.7), url: https://www.team.discraft.com/discs/vulture, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Vulture (mfr 10/5/0/2; reviewers 9.8/4.8/-0.1/2; 77 reviews), url: https://infinitediscs.com/discraft-vulture, type: retailer, weight: 0.5}
  - {name: Infinite Discs ESP Vulture (13 ratings; reviewer text), url: https://infinitediscs.com/Discraft-Vulture/ESP, type: retailer, weight: 0.3}
  - {name: Marshall Street Vulture (10/5/0/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=VULTURE&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, the 77-rating mold average and the 13-rating ESP page agree on 0/2 to within 0.1, and the text describes a straight, glidey fairway-class driver with a short, reliable fade that sits near the Teebird and Thunderbird, which is Discraft's copy. The one 9/5/0/3.5 rating is a single outlier. No contradicting evidence found. No named reviewer and no stated distances, so held at 0.7.
- **plasticVariance:** Sold in ESP, Big Z, Titanium, Tour Series and others; Discraft prints one set of numbers. A reviewer expects it to read closer to the printed numbers once worked in. Not quantified. Do not average.
- **Linked:** Predator (Atlas 9/4/1/4, the open +1 → 0 candidate, gated; Discraft's "beat-in Predator, less overstable" copy is consistent with either turn value because the Vulture/Predator gap rests on fade, 2 vs 4), Anax (10/6/0/3, a reviewer's comparison), Raptor (9/4/0/3), Thunderbird (9/5/0/2), TeeBird (7/5/0/2) and Undertaker (9/5/-1/2). Nothing moves.

## F3 — Prodigy (id 609fb4e2670b)

- **Atlas now:** 8/5/-2/2 (source: Marshall Street snapshot listing, label "Stable"; PDGA approval 13-47, Jul 2013; no override). **Proposed turn/fade:** none. Matches Prodigy's current numbers. Reference plastic (Prodigy's most popular, per batch 7): 400.
- **Manufacturer:** Prodigy 8/5/-2/2, "Stable" (400 page fetched). Copy: "a stable fairway driver for long, controllable flights with a mild finish." **History (blog, via the fetch step, spot-check):** the pre-July-2023 number was **7/5/-1/2**. **Copy-versus-number tension, same numbers:** "Stable" next to a -2 turn; the label and the number were never reconciled on the page. **Retail still prints the old set:** Infinite 7/5/-1/2 ("Stable"; "long controllable flights for players of all skill levels"). Marshall Street's listing (the Atlas's source) is 8/5/-2/2.
- **Retailer:** Infinite reviewer numbers 7.1/5/-1/1.9 (39 reviews, 4.54 stars); 400 page 7.1/5/-1.1/1.9 (14 reviews, 4.1 stars), dated July 2013 – March 2025 with **one review after July 2023**. The speed reading (7.1) shows the pool is the old 7-speed catalog.
- **Community:** Infinite 400-page reviewers (single-source, dated; most rated -1/2 or -1/3 on a page displaying -1/2): "More under stable than anticipated" (intermediate, **Mar 2025**, rated -2.5/1, the only post-update review); "Super flippy" with gummy plastic (advanced, May 2018, rated -2/0); "Shocked on how stable" (beginner, 2018, -1/2); "straight flight with gentle fade, holds lines" (intermediate); "straight 170-200 feet then fades substantially" (advanced, 2013); "flies too similar to F2; expected Teebird-like flight" (intermediate); "understable fairway with varied applications" (advanced); a 350 ft throw with a thin-rim grip praise (advanced). Search-summary retailer text (spot-check, undated): "a touch more stable than an F5 and a touch less stable than an F2," "stays straight for around 70% of the shot."
- sources:
  - {name: Prodigy F3 400 plastic page (8/5/-2/2, "Stable"), url: https://prodigydisc.com/products/prodigy-f3-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Prodigy Disc at 10 (July 21, 2023 update table; via fetch step, spot-check), url: https://prodigydisc.com/blogs/news/prodigy-disc-at-10-a-decade-of-innovation-and-excellence, type: manufacturer, weight: 0.8}
  - {name: Infinite Discs F3 (listing 7/5/-1/2 = pre-2023; reviewers 7.1/5/-1/1.9; 39 reviews), url: https://infinitediscs.com/prodigy-f3, type: retailer, weight: 0.3}
  - {name: Infinite Discs 400 F3 (14 reviews, dated; reviewer text), url: https://infinitediscs.com/Prodigy-F3/400, type: retailer, weight: 0.3}
  - {name: Marshall Street F3 listing (8/5/-2/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=%22F3%22&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.55
- **consensusNote:** Prodigy's page and the Atlas's own F-series ladder (F2 8/4/-1/2, F5 8/6/-2/1, F7 8/6/-3/1) agree on 8/5/-2/2, and the one post-update review (-2.5/1, "more under stable than anticipated") leans the same way. **The Atlas F3 is the outlier against the whole retail and reviewer layer (-1 turn, 7 speed), purely because of the 2023 update.** That layer is pre-update and anchored to a stale display, so it neither confirms nor contradicts the current number. Held at 0.55: the confirmation rests on Prodigy's page, one 2025 review and the F2/F3/F5 ordering. **Soft watch, not a candidate:** if post-2023 reviewers on an updated Infinite display still say about -1, a -2 → -1 move would be |Δ| 1.0 (gated). No contradicting evidence found for the current number.
- **plasticVariance:** Sold in 300, 400, 500, Air and other plastics; Prodigy prints one set of numbers. The 400 is described as a stiff-rimmed premium blend; one reviewer found a gummy plastic disappointing. Not quantified. Do not average.
- **Linked:** F2 (Atlas 8/4/-1/2), F1 (8/4/-1/3), F5 (8/6/-2/1), F7 (8/6/-3/1), TeeBird (7/5/0/2, the reviewer's expectation) and Stalker (7/5/-1/2). The Atlas F3 sits between the F2 and the F5 on turn and fade, which matches the "touch more stable than an F5, touch less stable than an F2" remark. Nothing moves.

## D1 — Prodigy (id 86521271a4d2)

- **Atlas now:** 12/5/0/4 (source: Marshall Street snapshot listing, label "Very Overstable"; PDGA approval 13-01, Jan 2013; no override). **Proposed turn/fade:** none. Evidence too thin to call. **Open candidate: fade 4 → 3.5** (|Δ| = 0.5, below the review gate; **4 → 3 would be |Δ| 1.0 and gated**). Reference plastic (Prodigy's most popular, per batch 7): 400.
- **Manufacturer:** Prodigy 12/5/0/4 (400 page and collection page; labels "Overstable" on the product page, "Stable" on the collection page). Copy: "a very fast, over stable driver designed for power throwers. This driver is good for all conditions and flies as well into the wind as it does with the wind. The consistent flight path of this disc makes it a favorite of disc golfers looking not only for a long flight but pinpoint accuracy." Disc Golf Puttheads' templated chart: "holds torque, fights turn, and finishes with a strong, predictable fade." Copy and numbers agree. **History (blog, via the fetch step, spot-check):** 13/5/0/4 → 12/5/0/4 in July 2023, so the fade was 4 both before and after.
- **Retailer:** Infinite lists 12/5/0/4 ("Overstable"), the current number. Reviewer numbers 12.2/5.1/-0.2/3.0 (81 reviews, 4.5 stars); 400 page 12.2/5.1/-0.2/3.3 (22 reviews; 14 visible rated reviews average about -0.2/2.9 by my arithmetic); 400G page (23 reviews, 4.3 stars), most rated 12/5/0/3. **Fade reads 0.7–1.1 under the printed 4 on all three pools.** DiscMetrics 12/5/0/4 (218 reviews, 4.6, aggregator). Marshall Street 12/5/0/4 (baseline).
- **Community:** Infinite 400-page reviewers (single-source, dated Feb 2013 – Mar 2023, **none after July 2023**): "very workable stability" with "strong fade and bite at the end" (intermediate, 360 ft, rated 0/3); "stay flat and straight for 90% of the flight and only hyzer put" (advanced, rated 0/3); "very high speed and overstable, I threw it with a hyzer line" (intermediate); "didn't have quite enough stability for full power shots" (intermediate, about 400 ft, rated 0/2); "fly so differently that I thought one might be mismarked" (advanced, rated -0.5/3); "main problem for me is consistency" between runs (professional); "not that overstable … doesn't hyzer out as bad as I thought" (beginner, 2013). 400G page: "Great OS disc" (advanced); "Super over stable but still dependable"; "Much less stable than the numbers would suggest" (intermediate, rated -1.5/2); "Really a beefy destroyer" (beginner); "similar to a Force but better" (advanced); "Will flex slightly into the wind" (beginner, 275 ft). Distances 275-500+ ft.
- sources:
  - {name: Prodigy D1 400 plastic page (12/5/0/4, "Overstable"), url: https://prodigydisc.com/products/prodigy-d1-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Prodigy distance-driver collection page (D1 12/5/0/4), url: https://prodigydisc.com/collections/distance-drivers, type: manufacturer, weight: 0.8}
  - {name: Prodigy Disc at 10 (July 21, 2023 update table; via fetch step, spot-check), url: https://prodigydisc.com/blogs/news/prodigy-disc-at-10-a-decade-of-innovation-and-excellence, type: manufacturer, weight: 0.8}
  - {name: Infinite Discs D1 (listing 12/5/0/4; reviewers 12.2/5.1/-0.2/3.0; 81 reviews), url: https://infinitediscs.com/prodigy-d1, type: retailer, weight: 0.5}
  - {name: Infinite Discs 400 D1 (22 reviews, dated; reviewer text), url: https://infinitediscs.com/Prodigy-D1/400, type: retailer, weight: 0.3}
  - {name: Infinite Discs 400G D1 (23 reviews; reviewer text), url: https://infinitediscs.com/Prodigy-D1/400G, type: retailer, weight: 0.2}
  - {name: DiscMetrics D1 (12/5/0/4; 218 reviews; aggregator), url: https://discmetrics.com/discs/prodigy/d1, type: retailer, weight: 0.1}
  - {name: Disc Golf Puttheads D1 flight chart (templated), url: https://www.dgputtheads.com/flight-charts/d1, type: retailer, weight: 0.1}
  - {name: Marshall Street D1 listing (12/5/0/4; not independent), url: https://www.marshallstreetdiscgolf.com/?s=%22D1%22&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.5
- **consensusNote:** Prodigy's pages, its copy ("a strong, predictable fade"), Infinite's listing and DiscMetrics say fade 4. Every reviewer pool I could read says about 3 (3.0 on 81 ratings, 2.9–3.3 on the 400 page, mostly 0/3 on the 400G page) from 275 to 500+ ft throwers. If Infinite displayed 4 throughout, anchoring would pull *toward* 4 and the gap would be real. **I cannot tell what Infinite displayed:** per-reviewer ratings of 13/5/0/3 (2015-2016) and 12/5/0/3 (2019-2023) look like sliders sitting on a displayed 3, which would make the 3 an echo, while the blog table (as read) says the fade was 4 before 2023; the two do not agree. Also no reviewer in the pools is dated after March 2023, so none tests the current page, there is no named reviewer, and the text splits ("more OS than the numbers," "not that overstable," "much less stable than the numbers," and "stay flat and straight for 90% … only hyzer out"), with several reviewers flagging disc-to-disc inconsistency. Held back accordingly. If you want observed flight over the printed number, **fade 4 → 3.5 is the single candidate** (it would keep the D1 above the D2 and D3 at 3). It needs a post-July-2023 400-plastic sample with stated arm speeds, or evidence of what the Infinite and Marshall Street D1 pages displayed before 2023. Turn 0 reads -0.2, so there is no turn candidate.
- **plasticVariance:** Sold in 350, 400, 400G, 500, 750, ReBlend and special runs; Prodigy prints one set of numbers. Reviewers: 400 "gets super gummy in the heat"; two D1s in the same plastic "fly so differently"; dome variation matters. Not quantified. Do not average.
- **Linked:** **D2 and D3 (re-checked together, above: D2 stays parked, D3 confirmed on current numbers),** D1 Max (13/5/-1/3), Force (12/5/0/3, a reviewer's comparison), Defender (13/5/0/3), Destroyer (12/5/-0.5/3.5, "a beefy destroyer") and Firebird (9/3/0/4). If the D1 fade moved to 3.5 it would sit between the Force/D2/D3 at 3 and the Destroyer at 3.5. Review the set if it moves.

## Virus — Axiom (id cefd5f696809)

- **Atlas now:** 9/5/-3.5/1 (source: Marshall Street snapshot, label "Understable"; PDGA approval 14-96, Dec 2014; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Neutron.
- **Manufacturer:** Axiom 9/5/-3.5/1, "Understable" (page fetched). Copy (fetch-step wording, partly quoted): "Axiom's easiest-to-throw distance driver, with a glide and responsive understability that keeps it in the air"; power players can throw dramatic turnovers, recreational throwers get extended shaped flights; "compares favorably to a worn-in Impulse from MVP's lineup." Infinite: "the least stable of the 9 speed drivers in both the Axiom and MVP lines," good distance for low to average arm speeds, and for advanced players "tailwind throws, rollers, and long turnover shots." Copy and numbers agree. **Label split, same numbers:** Axiom and Marshall Street "Understable"; Infinite "Very Understable."
- **Retailer:** Infinite reviewer numbers 9.4/5/-3.4/1 (39 reviews, 4.44 stars); Neutron page 26 ratings (4.5 stars), with 15 of 26 per-reviewer ratings exactly -3.5/1 and the rest -2.5 to -4. Turn within 0.1, fade exact. Anchored to the display, so it is weaker than the counts suggest. Marshall Street 9/5/-3.5/1 (baseline).
- **Community:** Infinite Neutron-page reviewers (single-source; skill stated, a few distances 325-375 ft): "excellent for hyzer flips; predictable flight path" (intermediate, 325 ft); "reliable at altitude; comparable to Discraft Heat" (intermediate, 375 ft); "too flippy for high arm speed" (intermediate); "fantastic disc for weak-armed/older players at 250 ft" (intermediate, rated -1.5); "ideal for weaker arms"; "gets 350 ft regularly; perfect for slower arm speed" (intermediate); "turns significantly in wind"; "between Roadrunner and Sidewinder flight; lacks dome glide" (intermediate); "most understable MVP/Axiom driver" (advanced, 300+ ft, rated -3/1). Search-summary text (spot-check): "neutral to understable side … a little turn, but also a stronger than expected fade."
- sources:
  - {name: Axiom Virus page (9/5/-3.5/1, "Understable"), url: https://axiomdiscs.com/discs/virus/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Virus (mfr 9/5/-3.5/1; reviewers 9.4/5/-3.4/1; 39 reviews), url: https://infinitediscs.com/axiom-virus, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Virus (26 ratings; reviewer text), url: https://infinitediscs.com/axiom-virus/neutron---axiom, type: retailer, weight: 0.3}
  - {name: Marshall Street Virus (9/5/-3.5/1; not independent), url: https://www.marshallstreetdiscgolf.com/?s=virus&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer and both reviewer pools agree on -3.5/1, the text from 250 to 375 ft throwers describes an easy-flipping, glidey, very understable nine-speed for low and average arms, and the one reviewer who places it "between Roadrunner and Sidewinder" matches the Atlas's -3.5 between -4 and -3. The occasional "too flippy at high arm speed" and "-1.5" ratings are the usual arm-speed spread. No contradicting evidence found. The weight of the Infinite agreement is reduced because many ratings echo the display.
- **plasticVariance:** Sold in Neutron, Proton, Plasma and special runs; Axiom prints one set of numbers. A 151 g copy "requires more spin" and a reviewer reports more turn at altitude. Not quantified. Do not average.
- **Linked:** Impulse (Atlas 9/5/-3/1, Axiom's "worn-in Impulse" comparison), Sidewinder (9/5/-3/1), Roadrunner (9/5/-4/1), Insanity (9/5/-2/1.5) and Mamba (11/6/-5/1). The Atlas orders these from least to most understable as Insanity, Impulse/Sidewinder, Virus, Roadrunner, Mamba, as the descriptions do. Nothing moves.

## Stalker — Discraft (id 8cc6c4a94762)

- **Atlas now:** 7/5/-1/2 (source: Marshall Street snapshot, label **"Overstable"**; PDGA approval 09-17, Jun 2009; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): ESP (Z also carries the mold).
- **Manufacturer:** Discraft 7/5/-1/2 (team.discraft.com page fetched; stability 1.1, spot-check). Copy: "Stalker is a straight flier that won't turn over unless you want it to. Forgives small release errors and produces a gentle finish with soft landings that won't skip away from the target on impact. Like a Buzzz with driver distance." 2009 Driver of the Year. Infinite: "one of the straightest flying drivers on the market," 1.6 cm rim. Copy and numbers agree. **Label contradiction, same numbers:** Marshall Street (the Atlas's catalog) "Overstable"; Infinite "Stable"; Discraft's copy "straight flier," stability 1.1.
- **Retailer:** Infinite reviewer numbers 7.2/4.9/-1/1.7 (80 ratings, 4.54 stars); ESP page 9 ratings (4.6 stars), visible ratings average about -0.8 turn and 1.7 fade (my arithmetic). Turn exact, fade 0.3 under the printed 2. Marshall Street 7/5/-1/2 (baseline).
- **Community:** Infinite ESP-page reviewers (nine, single-source; skill stated, one distance): "Great flight. Stable. Straight. Smooth small fade." (professional, 250 ft); "works well for 270-foot straight shots," a Teebird comparison (intermediate); "one of the best straight fairways I've thrown" (advanced, rated 0/0.5); "primary go-to disc under 320 feet" (beginner); "reliable workhorse seven-speed; gentle, dependable fade" (intermediate); "surprising stability" (advanced, fade 2.5); "works like longer range Buzzz; excellent for cross-wind control" (intermediate). An unattributed USADGS review (weight 0.1): "holds the line you put it on, glides forward, then finishes with a dependable but gentle fade," placement to 280-350 ft.
- sources:
  - {name: Discraft Stalker team page (7/5/-1/2, stability 1.1), url: https://www.team.discraft.com/discs/stalker, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Stalker (mfr 7/5/-1/2; reviewers 7.2/4.9/-1/1.7; 80 ratings), url: https://infinitediscs.com/discraft-stalker, type: retailer, weight: 0.5}
  - {name: Infinite Discs ESP Stalker (9 ratings; reviewer text), url: https://infinitediscs.com/Discraft-Stalker/ESP, type: retailer, weight: 0.3}
  - {name: USADGS Stalker review (unattributed), url: https://usadgs.com/stalker-disc-review/, type: community, weight: 0.1}
  - {name: Marshall Street Stalker (7/5/-1/2, "Overstable"; not independent), url: https://www.marshallstreetdiscgolf.com/?s=stalker&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, the 80-rating average and the nine ESP reviewers agree on -1 turn and a gentle fade (1.7 against 2, a 0.3 offset that is inside the per-reviewer spread of 0.5 to 2.5), and the text, from 250 to 320 ft throwers, describes a straight, forgiving seven-speed with a soft finish, which is Discraft's copy and its Buzzz comparison. The Marshall Street "Overstable" label is wording only. No contradicting evidence found.
- **plasticVariance:** Sold in ESP, Z and others; Discraft prints one set of numbers. Not quantified. Do not average.
- **Linked:** Buzzz (Atlas 5/4/-1/1, the copy's comparison), TeeBird (7/5/0/2, the reviewers' comparison; the Atlas puts the Stalker one point more understable), Cyclone (7/4/-1/2), Undertaker (9/5/-1/2) and F3 (8/5/-2/2). Nothing moves.

---

## Batch 13 report (for Freddy)

**Decided items recorded first:** Toro confirmed as-is at +1 and Quasar confirmed as-is at 0 (both parked per owner decisions, Oct 3, 2026); running list refreshed (applied: Roc, Luna, Trident, Gator, Trespass; pending in main: Synapse -1, Astra -1.5); Millennium qualitative-label amendments made in the batch 11 Astra and batch 10 Orion LF entries.

**Proposed changes (0).** All ten Atlas numbers equal the current manufacturer pages on turn and fade.

**Open candidates (1 new), not gated:**
- **D1 fade 4 → 3.5** (|Δ| 0.5; 4 → 3 would be gated). Fade reads about 3 in all three Infinite pools (81, 22 and 23 ratings) against Prodigy's 4, from 275 to 500+ ft throwers, and the 2023 update did not touch the D1's fade. Held back: no reviewer in any pool is dated after March 2023, no named reviewer, per-reviewer sliders may be echoing an older displayed 3 (the blog table says the fade was 4 before 2023, which does not fit), and the text splits. Needs a post-July-2023 400-plastic sample with stated arm speeds, or the pre-2023 displayed value at Infinite and Marshall Street. Review D2, D3, D1 Max, Force, Defender, Destroyer and Firebird with it if it moves.

**D2 (the batch brief's watch): stays parked.** Re-checked with D1 and D3 as a set. Prodigy renumbered the lineup on July 21, 2023 (D2 13/6/-0.5/3 → 12/5/0/3; D3 13/6/-2/2 → 12/5/-1/3; D1 13/5/0/4 → 12/5/0/4; blog table via the fetch step, spot-check). The Atlas carries the current numbers. The batch 5 "retail contradiction" (retail -0.5 against Prodigy's 0) is the old catalog still on the shelf at Infinite, Foundation, DiscMetrics, Skyline and Marshall Street's product pages, so that half of the D2 case is withdrawn. What remains is a pre-update reviewer pool (-0.9, no 400-page review after July 2023) describing a catalog Prodigy deliberately revised in the other direction. The new evidence neither moves it nor strengthens it; I would close the candidate unless a post-2023 D2 sample appears, but it is your call (|Δ| 0.5, not gated).

**Confirmed as-is (9):** Virus, Stalker (0.75); Verdict, Captain, Vulture (0.7); Machete, Photon (0.65); D3 (0.6); F3 (0.55). Confirmations mean "no contradicting evidence found," not independent community verification. **D3 and F3 are the least firm and for one reason:** their retail and reviewer layers are pre-July-2023 and cannot test Prodigy's current numbers. The D3 pool reads -1.9/2.1 against the Atlas's -1/3 (about 0.9 more turn and 0.9 less fade), and the F3 pool reads -1.1 turn against the Atlas's -2 (about 0.9 less turn); they are soft watches, would be gated if they ever became candidates, and are not candidates now because they sit on stale displays.

**Too thin to call (1):** D1 (above).

**Label contradictions recorded (same numbers):** Captain (Dynamic and Infinite "Understable," Marshall "Stable"), Stalker (Marshall "Overstable," Infinite "Stable," Discraft copy "straight"), Photon (MVP "Stable-Overstable," Infinite and Marshall "Overstable"), D3 and D1 (Prodigy's product pages and collection page use different labels: D3 "Stable" vs "Understable," D1 "Overstable" vs "Stable"), F3 (Prodigy "Stable" next to a -2 turn). Verdict has a small retail number split (Infinite fade 3 vs 3.5 at Dynamic, Titan and Armory). None is a numeric disagreement with the manufacturer.

**Spot-checks needed before any override source note:** Prodigy's July 21, 2023 update table (read via the fetch step; its "old" column prints speed 13 for D2 and D3 where retailers print 12); the review dates counted from Infinite's pages (post-July-2023 counts: D1 0, D2 0, D3 2, F3 1); what Infinite and Marshall Street displayed for the D1 before 2023; the Discraft stability ratings (Machete 2.2, Vulture 1.7, Stalker 1.1, via the fetch step, the Machete one mangled); the Bawden Machete review (mangled manufacturer line, ambiguous Predator comparison); the Millennium label wording for the Astra and Orion LF (the batch 11 and 10 amendments); and any quote taken via the summarizing fetch.

**Process notes for the next batch**

- Next ten by `featured.js` order after Stalker: Defy (Axiom), Anax (Discraft), CD1 (Discmania), Culprit (Dynamic Discs), Sonic (Innova), Warden (Dynamic Discs), Volt (MVP), Explorer (Latitude 64), Pathfinder (Thought Space Athletics), Omega (Millennium). **Omega is a Millennium mold: expect labels but no digits on golfdisc.com, as with the Astra, Orion LF and Quasar.** Anax and Vulture are linked through the reviewers' comparisons; Culprit and Warden are in the Dynamic set I just re-read (Verdict, Captain); CD1 sits next to the FD/Instinct identity flag.
- **Prodigy renumbering is a standing hazard for any further Prodigy mold** (F1, F2, F5, F7, D4, D6, the Max discs, M-series, A-series, P-series, PA-series). Before any retailer or reviewer average is used, read Prodigy's own product page and check whether the Infinite listing and its reviewer pool still print the pre-July-2023 set. A speed reading of 7.x on an 8-speed F3 or 12/6 on a 12/5 D3 is the tell. The Infinite plastic pages show a date on each review, which is the fastest way to see how much of a pool post-dates the update.
- **Stale-catalog pattern:** none of the ten manufacturer pages differed from Marshall Street's listing snapshot. The lag this batch sat entirely on the retail side (Prodigy product pages at Marshall Street itself, Infinite, DiscMetrics, Disc Golf Puttheads; Infinite's Verdict fade). Marshall Street's per-product pages can disagree with its own search listings, so a Marshall Street product page is not always the same number the Atlas holds.
- **Open-candidate running list (nothing applied by this lane):** open: **Predator turn +1 → 0 (gated), D2 turn 0 → -0.5 (parked; I would close it), D1 fade 4 → 3.5 (new)**; carried unchanged and not named in the refreshed list: **MD3 (new) fade, Tesla turn -1 → -0.5, Fury fade 2 → 1.5**; stay as-is: Monarch -4, Toro +1, Quasar 0; pending in the main tree: **Synapse turn -1, Astra turn -1.5**. Soft watches: Falk turn, Svea turn, A1/A2 spacing, PA3 fade, Lots turn, Voodoo fade, PD2 fade, PD2/Enforcer, Stingray Star turn, Orion LF fade, Tantrum fade, Quasar fade 3 → 3.5, D3 and F3 reviewer-versus-printed gaps. **Catalog-identity flag still open:** FD1/FD2/Instinct.
- **Linked sets re-checked this batch:** D1/D2/D3/D4/D6/Max discs/D2 Pro/Force/Defender/Destroyer/Firebird, Verdict/Truth/Justice/Zone/Roc/Sergeant, Captain/Trespass/Hades/Thrasher/Sheriff/Shryke/Katana, Machete/Firebird/Predator/Pulse/Force/Defender/Raptor, Photon/Tesla/Destroyer/Wraith/Surge/Teleport, Vulture/Predator/Anax/Raptor/Thunderbird/TeeBird/Undertaker, F3/F2/F1/F5/F7/TeeBird/Stalker, Virus/Impulse/Sidewinder/Roadrunner/Insanity/Mamba, Stalker/Buzzz/TeeBird/Cyclone/Undertaker. Nothing moves beyond the one open candidate. Two notes carried into existing candidates: the Photon would be reviewed with the Tesla if the Tesla candidate moves; the Machete/Predator remark is recorded against the Predator candidate.
- Reachable manufacturer paths this batch: `prodigydisc.com/products/prodigy-{d1,d3,f3}-400-plastic`, `prodigydisc.com/products/prodigy-d3-500-plastic`, `prodigydisc.com/collections/distance-drivers`, `prodigydisc.com/blogs/news/prodigy-disc-at-10-a-decade-of-innovation-and-excellence`, `dynamicdiscs.com/collections/dynamic-discs-{verdict,captain}`, `team.discraft.com/discs/{machete,vulture,stalker}` (the `/` www form works), `mvpdiscsports.com/discs/photon/` (the `/disc/photon/` form 404s), `axiomdiscs.com/discs/virus/`. Infinite slugs: D3 `/prodigy-d3`, `/Prodigy-D3/{400,400G}`; D1 `/prodigy-d1`, `/Prodigy-D1/{400,400G}`; D2 `/Prodigy-D2/{400,400G}`; F3 `/prodigy-f3`, `/Prodigy-F3/400`; Verdict `/dynamic-discs-verdict`, `/Dynamic-Discs-Verdict/Lucid`; Captain `/dynamic-discs-captain`, `/Dynamic-Discs-Captain/Lucid`; Machete `/discraft-machete`, `/discraft-machete/esp`; Photon `/mvp-photon`, `/MVP-Photon/Neutron`; Vulture `/discraft-vulture`, `/Discraft-Vulture/ESP`; Stalker `/discraft-stalker`, `/Discraft-Stalker/ESP`; Virus `/axiom-virus`, `/axiom-virus/neutron---axiom`. The All Things Disc Golf URLs for the Verdict, D1 and Virus returned HTTP 500 (a retry later may work).
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access reads a post-July-2023 D1 or D3 400-plastic sample with stated arm speeds (the D1 fade question and the D3 watch both turn on it), the DGCR Machete and Vulture threads, and the Bawden Machete review (the Predator comparison), then still the D2, Tesla and MD3 items.

---

# Batch 14 (Plan 10, Phase 2)

Researched October 3, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (fast-forward to `e704d34`: Plan 11 My Bag and coach/auth commits, no stability data touched; the queue doc is still the only locally modified file).

Molds covered: Defy, Anax, CD1, Culprit, Sonic, Warden, Volt, Explorer, Pathfinder, Omega (the next ten by `public/featured.js` order after Stalker, checked against the live file; ids match).

## Decided items (recorded before the research)

**1. D2 turn 0 → -0.5 — stays PARKED as an open candidate (owner decision Oct 3, 2026).**

- **Resolution:** keep **12/5/0/3**. The candidate is *not* closed and *not* proposed: it stays on the open-candidate list as parked. (Batch 13 said it would close it; the owner's call is to leave it open.) No override, no change. Revisit only if a post-July-2023 D2 sample with stated arm speeds turns up.
- **Linked:** D1, D3, D4, D6, D1/D2/D3 Max, D2 Pro, Force, Defender (batch 13 re-check) are unaffected.

**2. D1 fade 4 → 3.5 — stays parked: thin evidence (owner decision Oct 3, 2026).**

- **Resolution:** keep **12/5/0/4**. No reviewer in any Infinite pool is dated after March 2023, and the pools' fade of about 3 may be an echo of an older displayed 3. Not proposed. It stays on the open-candidate list; revisit with a post-July-2023 400-plastic sample with stated arm speeds, or evidence of the pre-2023 displayed value at Infinite and Marshall Street.
- **Linked:** D2, D3, D1 Max, Force, Defender, Destroyer, Firebird are unaffected because the D1 does not move.

**Standing rules (owner-decided, applied throughout):**

- **Plastic baseline policy:** a mold's reference numbers are its most-thrown plastic (Star for Innova drivers). DX is the price-tier baseline but **not** the flight reference. I had no sales data, so each entry names the reference plastic I took to be the most-thrown and marks it "assumed."
- **Review gate:** weak evidence = no correction; |Δ| = 1.0 changes need the owner's call; record open candidates instead of proposing them.
- **Never average across plastics:** mold-level consensus plus a `plasticVariance` note.

---

## Batch 14 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Anax | 10/6/0/3 | none | Confirmed as-is | 0.75 |
| Warden | 2/4/0/0.5 | none | Confirmed as-is | 0.75 |
| Volt | 8/5/-0.5/2 | none | Confirmed as-is (Tesla re-checked with it: neither moves; a 2024-25 Neutron turn-0 cluster is a soft watch) | 0.7 |
| Explorer | 7/5/0/2 | none | Confirmed as-is | 0.7 |
| Sonic | 1/2/-4/0 | none | Confirmed as-is | 0.7 |
| Pathfinder | 5/5/0/1 | none | Confirmed as-is (TSA's own page unreachable; manufacturer layer is retailer-quoted) | 0.65 |
| Culprit | 4/2/0/3.5 | none | Confirmed as-is (thin pools) | 0.6 |
| CD1 | 9/5/-1/2 | none | Confirmed as-is (8 ratings, all 2023-24) | 0.55 |
| Defy | 11/5/-1/3 | none | **Too thin to call: turn -1 vs about 0 in 7 of 8 post-2019 Neutron ratings and in Axiom's own "straighter than the Photon" copy (turn -1 → -0.5, not gated)** | 0.5 |
| Omega | 2/3/0/0 | none | **Too thin to call: no manufacturer digits; retailers split 0/0 vs -1/1; 12 ratings, only 8 visible across four plastics** | 0.45 |

**No changes proposed. One new open candidate (Defy turn), eight confirmed, Omega too thin, D1 and D2 stay parked.** The Volt/Tesla re-check (the batch brief's watch) found nothing that moves either disc. The batch's structural finding is about the Infinite pages rather than any mold: **the "Reviewer Flight Numbers" printed on Infinite plastic pages appear to be shrunk toward the listed numbers** (see Evidence limits), which means the coarse retailer layer is even more anchored than earlier batches assumed.

## Volt / Tesla re-check (the batch brief's watch, done as a set)

**Answer: the Volt does not move, so the Tesla candidate is carried exactly as batch 6 left it. Nothing re-opens.**

- **Manufacturer layer:** MVP Volt **8/5/-0.5/2, "Stable-Overstable"** (`mvpdiscsports.com/discs/volt/`): "a slightly overstable fairway driver … geared for long, accurate placement shots; it can hold a long straight line with a solid, forward penetrating fade." MVP Tesla **9/5/-1/2, "Stable-Overstable"**: "balances a subtle turn and reliable fade … extends high power or headwind lines and has plenty of bite to fade back reliably and reduce lateral drift"; "The Tesla can be considered the big brother to our acclaimed Volt fairway driver." (Batch 6 called the Volt the Tesla's "companion"; the fetched wording is "big brother." Same meaning.) Both carry the same label with a 0.5 turn difference; only the Tesla copy mentions turn at all.
- **Volt retail and reviewers (three plastics, all agree):** Infinite listing 8/5/-0.5/2, label "Stable"; mold-level reviewer numbers **8.1/4.9/-0.6/2.1 (144 reviews, 4.61 stars)**; Neutron page 8.1/4.9/-0.6/2.1 (42 ratings); Plasma page 8.2/5.1/-0.6/2.1 (14); Fission page 8.1/5/-0.6/2 (17). Turn within 0.1 of the printed -0.5, fade within 0.1 of 2 on every plastic. Marshall Street 8/5/-0.5/2 (baseline).
- **Tesla (batch 6, unchanged):** reviewers 9.7/4.7/-0.6/2.3 (95 ratings); Neutron 9.7/4.7/-0.7/2.2. **The two pools read the same turn (-0.6) although the Atlas puts the discs 0.5 apart (-0.5 and -1).** Each pool is anchored to its own displayed number, so the reviewer layer cannot say whether the 0.5 spacing is right. It is also not evidence against it.
- **The one wrinkle, a recency cluster on the Volt Neutron page (my transcription of the fetch-step table; approximate, spot-check):** turn ratings by era average about **-0.8 for 2014-2019 (16 ratings, mostly -1), -0.5 for 2020-2023 (12, mostly -0.5), -0.1 for 2024-2025 (5 ratings from four reviewers, four of them at 0)**. The 2025 reviewers: Kendall Cordova (advanced, 350 ft, rated 9/5/0/2) "board flat … fast and overstable flight" despite the listed specs; tlindgren17 (professional, 375 ft, 0 turn) "super reliable with a stable finish"; JacksonS_51 (intermediate, 350 ft, two reviews at 0 turn) "8-speed flight/distance but a 9-speed rim." Reading it: the older -1s probably sit on an older displayed number (a 2016-2018 pool rating 8/5/-1/2 on a display I could not see), the 2020-2023 -0.5s are largely the current display echoed, and the 2025 zeros deviate *away* from the display, which is the informative direction. But it is four reviewers, one of whom appears twice, there is no comparison against the Plasma or Fission pages after 2023, and older reviewers already report run-to-run drift ("current runs more flat and overstable than first runs," Swayze, 2015; "the most inconsistent mold they make," Dr. Four-Putt, 2017; a search summary says "newer overstable runs from around 2022," spot-check).
- **Decision:** no Volt candidate (weak evidence; manufacturer and all three plastic pools say -0.5/-0.6). **Soft watch added: Volt Neutron turn 2024-25 reads about 0.** If a post-2025 Neutron sample with stated arm speeds keeps reading 0, the candidate would be **Volt turn -0.5 → 0 (|Δ| 0.5)** and would be reviewed with the Tesla, because a Volt at 0 would widen the Volt/Tesla gap to a full point.
- **Tesla:** carried unchanged (open candidate turn -1 → -0.5, not gated, held back per the plastic policy and thin evidence). One observation for whoever decides it: a Tesla at -0.5 would equal the Volt's turn and be separated from it by speed only (9 vs 8), which MVP's "big brother" wording permits. The Volt data above neither supports nor opposes that.
- **Linked:** Photon (11/5/-1/2.5, "a longer Tesla"), Teebird (7/5/0/2) and Thunderbird (9/5/0/2) (Volt reviewers place it "in between a Teebird and a Thunderbird" and "plays a little longer than Thunderbird"), Firebird (9/3/0/4, "flies similar" on some Neutron runs), Fireball and Motion (batch 6). Nothing moves.

## Evidence limits — batch 14

Same tooling limits as earlier batches; see the pilot section. Specific to this batch:

- **Diff against `flights.json` / `data.json` (done first):** the Atlas numbers equal the Marshall Street snapshot for all ten. None has an override and none is in `infinite-manufacturer-ratings.json`. Compared with current manufacturer pages, **all eight molds with a readable manufacturer page match exactly**: Defy (Axiom), Anax (Discraft), Culprit and Warden (Dynamic collection pages), Volt (MVP; the Tesla page too), CD1 (Discmania collection page), Sonic (Innova), Explorer (Latitude 64 collection page). **No Luna/Gator/Synapse-style Atlas lag, and no Prodigy-style renumbering hazard** (no Prodigy molds this batch). Thought Space renumbered the Synapse in an earlier batch; the Pathfinder's Infinite listing, reviewer pool and several retailers all print 5/5/0/1 with no sign of an older set, but TSA's own page was not reachable, so that is unverified.
- **Manufacturer pages not reached:** **Thought Space Athletics' own Pathfinder page** (`/products/pathfinder`, `/products/ethos-pathfinder`, `/products/pathfinder-1`, `/pages/pathfinder` all 404; the collection page shows no products). The Pathfinder's manufacturer layer is Infinite's quotation of TSA's description plus several retailers repeating 5/5/0/1. **Millennium prints no digits** (golfdisc.com labels only; Omega below).
- **Infinite "Reviewer Flight Numbers" appear to be shrunk toward the listed numbers (new, my arithmetic, spot-check).** On the pages where the fetch step printed both the page average and the visible per-reviewer ratings, the printed average equals the visible ratings plus about **eight phantom ratings at the listed number**. Worked example, Defy Neutron (13 ratings: turn sum -4.5, fade sum 36): raw means are -0.35 and 2.77; adding eight phantom ratings at the displayed -1/3 gives -0.60 and 2.86; Infinite prints -0.6 and 2.9. The same fit holds for CD1 C-Line (6 ratings), Warden Lucid (4), Culprit Hybrid (4) and the four Omega plastic pages (Sirius visible -1/1 and -1/1 prints as -0.2/0.2; ET, Quantum and Delta-T likewise). **Consequence: on small pages the printed average is dominated by the display, so deviation from the printed number is understated.** The raw visible ratings are the better signal, which is why this batch quotes them. Two caveats: the Culprit Lucid page's printed average looked like a plain average (the fetch step may have computed it itself), and the Volt Neutron page is too large to tell. **This may also explain the batch 12 item "Infinite Quantum page's printed average disagrees with its per-reviewer ratings"** (Quasar; hypothesis, not checked). It does not change any earlier verdict by itself, since earlier batches already treated the averages as anchored and coarse.
- **Anchoring and display history:** per-reviewer sliders start from the displayed number. Where a page's display changed over time, old and new ratings sit on different baselines (Defy 2016-2018 ratings at 12/5/-1/2 versus 2019+ at 11/x/x/x; Omega pre-2021 ratings at -1/1 versus the current 0/0 display; Volt -1 versus -0.5). Review dates on Infinite plastic pages are read by the fetch step; I tallied them by hand.
- **Community layer:** Infinite plastic-page reviewers (anonymous or first-name, single-source, skill stated, a few with distances) plus named reviewer sites: **Chris Bawden (Disc Golf Puttheads, Anax, ESP, about 335 ft flat and 350 ft anhyzer, October 1, 2019)**, "Aaron" (bestdiscgolfdiscs.com, Defy June 26, 2023 and Volt July 12, 2023; an SEO-style site, weight 0.1; his Defy review says "stays true to its flight numbers" but quotes turn 0 and fade 3.5, which is internally inconsistent with the printed -1/3), Rodney Lane (Puttheads, Omega, ET, August 9, 2016), Alan (discgolfreviewer.com, Sonic DX, September 2, 2022), Jake Matney (Skyline blog, Explorer, March 5, 2021, retailer blog, weight 0.2), and Disc Golf Weekly (Culprit, June 4, 2022, small blog, weight 0.2). **No arm speeds are stated anywhere**; distance bands only (Defy 325-500 ft, Anax 300-350 ft, CD1 340 ft, Volt 250-375 ft, Explorer 250-400 ft, Culprit 200-240 ft, Sonic about 100-200 ft).
- **Reddit** blocked, **YouTube** unreachable, **DGCR** 403 (the Defy versus Time Lapse, Omega versus Aviar and "Omega: The Alpha and the" threads appear only as search-result titles; none is cited as evidence). The Puttheads Defy and Volt review URLs and the Puttheads Pathfinder review 404'd. Infinite's Defy Proton, Defy Eclipse and Anax Z plastic URLs returned 302/404; the Defy Neutron page worked at `/axiom-defy/neutron---axiom`.
- **Spot-check needed on the Discraft stability rating:** Anax "1.9" (via the fetch step). Not used for any conclusion.
- **Marshall Street is the Atlas's own source** and was used only as baseline (its stability labels were not re-read for this batch, except the Sirius Omega product page).
- Page contents came through a summarizing fetch step; spot-check any quote before it goes into an override's source note.

---

## Defy — Axiom (id c89ce09cef94)

- **Atlas now:** 11/5/-1/3 (source: Marshall Street snapshot; PDGA approval 16-36, Apr 2016; no override). **Proposed turn/fade:** none. Evidence too thin to call. **Open candidate: turn -1 → -0.5** (|Δ| = 0.5, below the review gate). Reference plastic (assumed most-thrown, not verified): Neutron (Axiom's flagship; Infinite's best-populated Defy page).
- **Manufacturer:** Axiom 11/5/-1/3, "Stable-Overstable" (`axiomdiscs.com/discs/defy/` fetched). Copy: "The Defy is straight with a nice bite of overstability at the end, and is best described as a more stable MVP Photon or a longer Axiom Clash. Like the Clash, the Defy exhibits remarkable resistance to turnover even at high power"; "perfect for long, straight, high-power shots with a forward-pushing fade and reliable lower-powered overstability." Infinite (quoting Axiom): "a more overstable cousin to the Photon, with a **straighter initial flight** and a stronger fade." **Tension, same numbers:** the Atlas gives the Defy and the Photon the same turn (-1) and the Defy half a point more fade, while the copy says the Defy is straighter and more stable than the Photon and "remarkably resistant to turnover." That reads like turn nearer 0 than -1. **Copy wording split (spot-check):** retailer search summaries print "a heavily seasoned MVP Photon or a longer Axiom *Crave*" where Axiom's page says "a more stable MVP Photon or a longer Axiom *Clash*." Atlas: Clash 6.5/4/-1/2, Crave 6.5/5/-1/1. Retailer labels: Infinite and DiscMetrics "Overstable." Retailers print the Fission Defy at 11/5/-1.5/3 (search summary, spot-check), i.e. one plastic reads more understable by the manufacturer's own account.
- **Retailer:** Infinite listing 11/5/-1/3; mold-level reviewer numbers 11.2/4.5/-0.6/2.8 (21 reviews, **4.02 stars, the lowest of the ten**; 52% five-star, 33% three-star or lower); Neutron page 11.2/4.6/-0.6/2.9 (13 ratings, 3.8 stars). DiscMetrics 11/5/-1/3 (602 reviews, 4.7, aggregator). Marshall Street 11/5/-1/3 (baseline). **Printed averages are shrunk toward the display (see Evidence limits); the raw visible Neutron ratings are: turn sum -4.5 over 13 (mean -0.35), fade mean 2.77.**
- **Community (Infinite Neutron page, single-source, dated; my tally of the fetch-step table, spot-check):**
  - **Dec 2019 – Jul 2025 (8 ratings, display 11/5/-1/3): turn 0 in 7 of 8, -1 in one; fade mean 3.2 (range 2.5 to 4).** noahhood11 (intermediate, 325 ft, Jul 2025, 11/4/0/3) "more overstable than comparable discs"; Jesse Henderson (advanced, **500 ft**, Oct 2024, 11/3.5/0/3) "substantially more overstable than the numbers suggest"; Francois (advanced, 325 ft, Apr 2024, 11/5/-1/3) "one of my favorites; super reliable, handles torque" (the one -1); Troy M (intermediate, Dec 2022, 11/4/0/4) "much shorter and way more stable than expected"; Andrew Sellers (beginner, Nov 2020, 0/3.5); Scott B (advanced, **375-425 ft**, Mar 2020, 11/4/0/2.5) "carries straight for a very long time before a late fade"; bharing (intermediate, Mar 2020, 0/3) "no turn" without wind; Baysinger (intermediate, Dec 2019, 0/3.5) "too much disc for me; super overstable."
  - **2016-2018 (5 ratings, display about 12/5/-1/2, speed 12 in four of five ratings):** turn -1, -1, -0.5, -1, 0 (mean -0.7), fade 2 to 2.5. Emil Nilsson (intermediate, Feb 2018) "for moderate to good armspeed"; Alan Barker (advanced, Oct 2016) "way too overstable for backhand throws" (rated -1/2.5); Ryan Eagle Eye (professional, 174 g, Jun 2016, -0.5/2) "hold a line like a bullet then have that late fade"; Toddiovision (intermediate, 0/2) "a little more overstable than the numbers indicate." **The display seems to have changed from about 12/5/-1/2 to 11/5/-1/3 between early 2018 and December 2019; I found no announcement of it.**
  - In **both eras reviewers rate turn less negative than the display** (0.3 in 2016-18, 0.9 in 2019-25), and the post-2019 gap sits against a display that would pull ratings *toward* -1, which is the informative direction.
  - Search-summary retailer text (spot-check): "in 174g, way too overstable for backhand throws, but for forehand throws with the right touch some users can get good distance"; "doesn't turn over too much, and will sail nice and straight for a long time then dump out." Aaron (bestdiscgolfdiscs.com, Jun 26, 2023, SEO-style site, weight 0.1; Neutron photo, plastic not stated): "turn of 0 ensures a consistent straight trajectory," "fade at 3.5," "stays true to its flight numbers," "too overstable for beginners or slower arm speeds" (his turn 0 and fade 3.5 do not match the printed -1/3, so the "true to numbers" claim is internally inconsistent).
- sources:
  - {name: Axiom Defy page (11/5/-1/3, "Stable-Overstable"; copy: more stable Photon / longer Clash), url: https://axiomdiscs.com/discs/defy/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Defy (listing 11/5/-1/3; reviewers 11.2/4.5/-0.6/2.8; 21 reviews; quotes Axiom "straighter initial flight"), url: https://infinitediscs.com/axiom-defy, type: retailer, weight: 0.4}
  - {name: Infinite Discs Neutron Defy (13 ratings, dated; reviewer text), url: https://infinitediscs.com/axiom-defy/neutron---axiom, type: retailer, weight: 0.3}
  - {name: bestdiscgolfdiscs Defy review (Aaron, Jun 26, 2023; internally inconsistent), url: https://bestdiscgolfdiscs.com/axiom-defy/, type: community, weight: 0.1}
  - {name: DiscMetrics Defy (11/5/-1/3; 602 reviews; aggregator), url: https://discmetrics.com/discs/axiom/defy, type: retailer, weight: 0.1}
  - {name: Marshall Street Defy (11/5/-1/3; not independent), url: https://www.marshallstreetdiscgolf.com/?s=defy&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.5
- **consensusNote:** The manufacturer page, the Infinite listing and DiscMetrics all print -1/3, and fade agrees (reviewer fade 3.2 after 2019, printed 3). **Turn is the question.** Seven of the eight post-2019 Neutron ratings put turn at 0 against a display of -1, from 325 to 500 ft throwers, with text saying "more overstable than the numbers," "no turn," and "carries straight … before a late fade"; Axiom's own copy says the Defy is straighter than the Photon and resistant to turnover even at high power, while the Atlas has the two at the same turn; and the Photon's own Neutron pool (batch 13) reads -0.6, so a Defy pool reading about -0.1 separates the two in the direction the copy describes. Held back because it is 13 Neutron ratings (8 post-2019), anonymous, no stated arm speeds, one plastic, the named review is an SEO-style site whose numbers contradict its own conclusion, the pooled Infinite average (-0.6, 21 ratings) is nearer the printed number, and the Fission Defy is reported more understable (-1.5). If you want observed flight over the printed number, **turn -0.5 is the single candidate** (taking the reviewers fully, turn 0 would be |Δ| 1.0 and gated; I would not go there on this evidence). It needs a named reviewer with an arm speed, or a Neutron-only reading after 2024, to become a proposal. Fade 3 stands.
- **plasticVariance:** Sold in Neutron, Proton, Fission, Eclipse 2.0 and misprints; Axiom prints one set of numbers. Fission Defy reportedly 11/5/-1.5/3 (retailers; spot-check), "174 g way too overstable for backhand." Not quantified. Do not average.
- **Linked, review as a set if it moves:** Photon (Atlas 11/5/-1/2.5; confirmed batch 13; a Defy at -0.5 would sit more stable than the Photon, which is what the copy says; Photon would not move), Clash (6.5/4/-1/2) and Crave (6.5/5/-1/1) (the copy comparisons; wording split above), Tesla (9/5/-1/2, open candidate, unrelated by number), Destroyer (12/5/-0.5/3.5, batch 13 Photon reviewers' comparison; a Defy at -0.5 would equal it on turn and sit half a point lower on fade). Nothing else moves.

## Anax — Discraft (id 79bc1496e337)

- **Atlas now:** 10/6/0/3 (source: Marshall Street snapshot; PDGA approval 19-50, Jun 2019; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): ESP (Z-family plastics and 22 variants also carry the mold).
- **Manufacturer:** Discraft 10/6/0/3 (`team.discraft.com/discs/anax`; stability 1.9, spot-check). Copy: "A strong, overstable fairway driver with the sharp rim of a distance driver but the comfort, thinner rim, and precision of a fairway driver." Infinite (quoting Discraft): "Paul McBeth's new signature fairway/power driver. This 10-speed driver will fight the wind and stay straight down the fairway before a nice fade at the end." Copy and numbers agree. Infinite label "Overstable."
- **Retailer:** Infinite mold-level reviewer numbers **10/5.8/-0.1/2.8 (100 reviews, 4.62 stars)**; ESP page 10/5.8/-0.1/2.9 (58 ratings, 4.5 stars). Turn within 0.1, fade within 0.2 on the largest pool of the batch. Glide reads 0.2 under the printed 6 (outside scope). Marshall Street 10/6/0/3 (baseline).
- **Community:** Infinite ESP-page reviewers (the six visible, Jan 2023 – Apr 2025): ratings 10/6/0/3, 10/5/0/3, 10/4.5/0/3, 10/6/0/3, plus two outliers rated 10.5/6.5/0.5/3.5 and 10/5/0/2. "Very reliable overstable disc that fights the wind and always has reliable overstable finish" (intermediate); "reliable straight shooter. Stable to slightly overstable" (beginner); "Brand new this disc will glide like hell but finished very overstable. Once they break in they get a much more stable flight" (intermediate, 325 ft, Apr 2025); "Neither is as over stable or glidey as advertised … pretty straight with a subtle fade. Don't believe the 6 glide" (intermediate, 300 ft, Jan 2025); "neither is anything near 6 glide. Would say 4.5 at best" (beginner). **Chris Bawden (Disc Golf Puttheads, ESP, Oct 1, 2019; about 335 ft flat, 350 ft anhyzer):** no turn; "at this distance the Anax fades hard and likes to skip"; "is overstable and you can always count on it to come back"; compares it to the Vulture, Predator, Thunderbird, Orc, Thrill and Longbowman (his "Vulture (more glide)" is ambiguous about which disc has more glide; spot-check).
- sources:
  - {name: Discraft Anax team page (10/6/0/3, stability 1.9), url: https://www.team.discraft.com/discs/anax, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Anax (mfr 10/6/0/3; reviewers 10/5.8/-0.1/2.8; 100 reviews), url: https://infinitediscs.com/discraft-anax, type: retailer, weight: 0.5}
  - {name: Infinite Discs ESP Anax (58 ratings; dated reviewer text), url: https://infinitediscs.com/Discraft-Anax/ESP, type: retailer, weight: 0.3}
  - {name: Disc Golf Puttheads Anax review (Chris Bawden, Oct 1, 2019, ESP, about 335 ft), url: https://www.dgputtheads.com/discraft-anax-review, type: community, weight: 0.4}
  - {name: Marshall Street Anax (10/6/0/3; not independent), url: https://www.marshallstreetdiscgolf.com/?s=anax&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, the 100-rating average and the 58-rating ESP average agree on 0/3 within 0.1 to 0.2, and the named reviewer (Bawden, about 335 ft) and the Infinite reviewers describe an overstable, glidey ten-speed that fights wind and finishes hard, which is Discraft's copy. The reviewers who read it more stable or less glidy than the numbers are new-versus-broken-in spread and a glide complaint (outside scope). No contradicting evidence found.
- **plasticVariance:** Sold in ESP, Big Z, Z, Z Lite, Tour and Signature runs and many variants; Discraft prints one set of numbers. Reviewers: brand-new discs finish very overstable and break in "much more stable"; glide varies by run. Not quantified. Do not average.
- **Linked:** Vulture (Atlas 10/5/0/2, the batch 13 entry; a Vulture reviewer there calls it "even more overstable than the Anax," and the Atlas orders the Anax one fade point higher, so those two read differently), Predator, Thunderbird (9/5/0/2), Pulse (11/4/0/3) and Raptor (9/4/0/3). Nothing moves.

## CD1 — Discmania (id 5a88bc45cb01)

- **Atlas now:** 9/5/-1/2 (source: Marshall Street snapshot; PDGA approval 22-209, Nov 2022; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): C-Line (Infinite's only CD1 page with ratings; S-Line has none).
- **Manufacturer:** Discmania 9/5/-1/2 (`discmania.net/collections/cd1` fetched; no stability label printed). Copy: "The letters 'CD' in the name stand for Control Driver, putting the player in the driver's seat and allowing you full control to manipulate and style the disc exactly how you want it"; "handles just about any wind condition with ease … gives you the right amount of glide and shot shaping options, but will always maintain enough stability to end with a smooth low speed fade." Copy and numbers agree. Infinite label "Stable." Search-summary retailer text (spot-check): "flies similarly to a well-seasoned PD," "formerly known as CD2," "best suited for tailwinds and calmer weather." The Atlas has no CD2 entry; the 22-209 approval date fits a 2022 relaunch.
- **Retailer:** Infinite mold-level reviewer numbers 9.1/5/-1.1/2 (**8 reviews, 4.63 stars**); C-Line page 9.1/5/-1/2 (6 ratings). Raw visible C-Line ratings: turn -1 in five of six (-1.5 in one), fade 2 in four (1.5 and 3 in the others), mean -1.08 and 2.08. Marshall Street 9/5/-1/2 (baseline).
- **Community (Infinite C-Line page, six reviewers, Jul 2023 – Aug 2024, all intermediate):** Jack Mullane (905-rated, 340 ft) "will typically flip up to flat and drift a bit to the right before reliably finishing left"; AJDiscGolf (rated 10/5.5/-1.5/1.5) "great slightly understable 9 speed" with a "subtle fade" after holding turn for 75% of the flight; murray "flies a touch more stable than a Dynasty"; Andrew Kayne "will take a hyzer or anhyzer very well"; VBuss "consistently outperforming the Undertaker and Dynasty" by 15 to 35 ft, "more of a domey shape"; Taylor Boudreaux (rated 9/5/-1/3) "C-line plastic is stiff enough to feel like you have control but gummy enough to feel comfortable."
- sources:
  - {name: Discmania CD1 collection page (9/5/-1/2), url: https://www.discmania.net/collections/cd1, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs CD1 (mfr 9/5/-1/2; reviewers 9.1/5/-1.1/2; 8 reviews), url: https://infinitediscs.com/discmania-cd1, type: retailer, weight: 0.4}
  - {name: Infinite Discs C-Line CD1 (6 ratings, dated; reviewer text), url: https://infinitediscs.com/Discmania-CD1/C-Line, type: retailer, weight: 0.3}
  - {name: Marshall Street CD1 (9/5/-1/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=CD1&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.55
- **consensusNote:** Manufacturer, the retailer averages and the six dated C-Line reviewers agree on -1/2 with a text picture of a flip-to-flat, mildly drifting control driver that finishes gently, and its Dynasty and Undertaker comparisons match the Atlas's identical 9/5/-1/2 for those discs (one reviewer says the CD1 flies "a touch more stable than a Dynasty"). Held at 0.55 because it is eight ratings, all intermediate, all from after the 2022 relaunch, no stated arm speeds, and the printed average is shrunk toward the display. No contradicting evidence found.
- **plasticVariance:** Sold in C-Line, S-Line, special blends and X-outs; Discmania prints one set of numbers. C-Line is the stiffer, torque-resistant plastic ("better once you're throwing a bit harder or playing in summer heat," search summary, spot-check). Not quantified. Do not average.
- **Linked:** Dynasty (Infinite Discs house brand, 9/5/-1/2, the reviewers' comparison), Undertaker (9/5/-1/2), Savant (9/5/-1/2), Orion LF (9/5/-1/2, retailer-sourced), PD (override 10/4/0/3, the copy's comparison) and the FD1/FD2/Instinct identity flag (batch 11; unrelated to this mold). Nothing moves.

## Culprit — Dynamic Discs (id d3fc3bf71ddd)

- **Atlas now:** 4/2/0/3.5 (source: Marshall Street snapshot; PDGA approval 22-53, Apr 2022; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Lucid (Fuzion and Hybrid also carry it; the Hybrid and Lucid pages are the only ones with ratings).
- **Manufacturer:** Dynamic Discs 4/2/0/3.5, "Overstable" (collection page fetched). Copy: "The Culprit is a great upshot and approach disc. It can handle any arm speed and holds up well in a headwind. It has a very low profile and small diameter, making it perfect for players with smaller hands who want some beef on their approaches"; used for "overstable approaches, forehands, windy situations, perfect for shots in-between a midrange and a putter." Infinite (quoting Dynamic): "an overstable approach disc … a consistent flight, with a hard fade at the end"; label "Very Overstable." Copy and numbers agree. **Label split, same numbers:** Dynamic "Overstable," Infinite "Very Overstable."
- **Retailer:** Infinite reviewer numbers 4/2.1/0/3.5 (**10 ratings, 4.55 stars**). Lucid page 2 ratings (4/2/0/3.5 and 4/2.5/0/3); Hybrid page 4 ratings (raw fade mean 3.5, turn 0 in all four); Fuzion page none. Turn and fade exact. Marshall Street 4/2/0/3.5 (baseline).
- **Community:** Infinite Lucid and Hybrid reviewers (single-source, Sep 2022 – Feb 2024 except Randy's Dec 2022 Lucid review, no arm speeds): Randy (intermediate, 200-240 ft full power, Lucid) "holds a straight line when thrown flat with a very reliable overstable finish typical of Zones, Harps, Pigs" without extreme overstability; Michael Covrig (intermediate, Hybrid) "supposed to be Dynamic's Zone, but I have found the sharper edge and stronger torque resistance to fit my forehands better"; Darren Abbott (beginner, rated fade 4) "will stay flat and have a hard but reliable fade"; JoeyC13 (advanced) "easy to control … will stick close to where it lands with little skip." **Disc Golf Weekly (Jun 4, 2022, baseline plastic, small blog, weight 0.2):** thrown hard and flat it "will push fairly straight for a little bit before steadily fading," even on mild to moderate anhyzers "it always fought out to fade by the end of its flight"; "has yet to fail us even in a headwind"; "the closest in feel of all the approach discs" to the Zone, much shallower than the Harp. A search summary of the same article says "a hair more overstable compared to the Zone, but not by much" (spot-check; the fetched text did not say it).
- sources:
  - {name: Dynamic Discs Culprit collection page (4/2/0/3.5, "Overstable"), url: https://www.dynamicdiscs.com/collections/dynamic-discs-culprit, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Culprit (listing 4/2/0/3.5; reviewers 4/2.1/0/3.5; 10 ratings), url: https://infinitediscs.com/dynamic-discs-culprit, type: retailer, weight: 0.4}
  - {name: Infinite Discs Hybrid Culprit (4 ratings; reviewer text), url: https://infinitediscs.com/dynamic-discs-culprit/hybrid, type: retailer, weight: 0.2}
  - {name: Infinite Discs Lucid Culprit (2 ratings; reviewer text), url: https://infinitediscs.com/Dynamic-Discs-Culprit/Lucid, type: retailer, weight: 0.2}
  - {name: Disc Golf Weekly Culprit review (Jun 4, 2022), url: https://discgolfweekly.wixsite.com/home/post/dynamic-discs-culprit, type: community, weight: 0.2}
  - {name: Marshall Street Culprit (4/2/0/3.5; not independent), url: https://www.marshallstreetdiscgolf.com/?s=culprit&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** Manufacturer, Infinite's ten ratings and the reviewer text agree on turn 0 and a hard, reliable fade, and the Zone, Harp and Pig comparisons place it where the Atlas does (Zone 4/3/0/3 and Pig 4/1/0/3, with the Culprit's 3.5 half a point above the Zone). Held at 0.6 because it is a ten-rating, two-year-old mold with no stated arm speeds and a shrunk printed average. No contradicting evidence found.
- **plasticVariance:** Sold in Fuzion, Hybrid, Lucid and Prime variants; Dynamic prints one set of numbers. The reviewed Hybrid and Lucid copies read the same. Not quantified. Do not average.
- **Linked:** Zone (4/3/0/3), Pig (4/1/0/3), Gator (5/2/0/4 after the applied override), Rat (4/2/0/2), and the Dynamic set re-read in batch 13 (Verdict, Warden below). Nothing moves.

## Sonic — Innova (id 41212bce36a5)

- **Atlas now:** 1/2/-4/0 (source: Marshall Street snapshot; PDGA approval 07-43, Sep 2007; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed): DX, the only plastic on Innova's own page. Infinite also lists Star, Halo Star, XT and special stamps; the policy's Star default for Innova *drivers* is not applied because this is a putter sold primarily in DX.
- **Manufacturer:** Innova 1/2/-4/0 (`innovadiscs.com/disc/sonic/` fetched; DX only, 130-177 g). Copy: "The Sonic, based on the Hero 235, is a unique putt and approach disc. This disc has a comfortable low profile grip with great thumb traction"; "a nice straight flight and sticks well in the chains," "a versatile short range approach and escape disc" with "a slow predictable turn" that "likes to land flat for very few roll-aways," "very beginner friendly." Infinite (quoting Innova, older text): "THE most fade resistant of any disc on the market … a slow flyer that seems to float in the air"; label "Very Understable." **One tension, same numbers:** Innova's "slow predictable turn" and "very beginner friendly" sit next to -4; the reviewers explain why (it turns easily at touch power and is straight at low speed).
- **Retailer:** Infinite reviewer numbers 1.1/2.2/-3.8/0 (30 reviews, 4.25 stars); DX page 1/2.1/-4/0 (13 ratings, 3.8 stars). Raw DX ratings: 10 of 12 rated exactly 1/2/-4/0 (display echoed), the other two -3.5 and -4 with glide 2.5 and 3. Star page 3 ratings, raw turn -3, -3, -4 and fade 0.5, 1, 0. Marshall Street 1/2/-4/0 (baseline).
- **Community:** Infinite DX reviewers (dated 2012 to Dec 2025, single-source, mixed skill, distances 50-200 ft where stated): "excels at forehand flick shots and forehand turnovers inside 150 feet" (Lee's Frisbee Fixation, intermediate, Dec 2025, -3.5); "very straight in 160 gram and below" (beginner); "practice hyzer flips in limited space" (intermediate); "very touchy, especially in the wind; can really shape it around trees" (professional, Mar 2019); near-max-weight copies "fly perfectly straight" and lightweight copies "become squirrelly" or "turn over super easy" (intermediate 200 ft and beginner 96 g); "does not handle wind well" and "terrible glide" (advanced, 2016); "won't fade on slow throws; super susceptible to wind" (advanced, 2012). Alan (discgolfreviewer.com, DX, Sep 2, 2022): "an absolutely straight flyer … will fade less than just about any other golf disc"; best at touch and control. Star reviewers (3, 2019-20): "much more stable and does not have the intense glide that the DX has … very little fade"; "more stable than the DX version."
- sources:
  - {name: Innova Sonic page (1/2/-4/0; DX only), url: https://www.innovadiscs.com/disc/sonic/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Sonic (listing 1/2/-4/0 "Very Understable"; reviewers 1.1/2.2/-3.8/0; 30 reviews), url: https://infinitediscs.com/innova-sonic, type: retailer, weight: 0.5}
  - {name: Infinite Discs DX Sonic (13 ratings, dated; reviewer text), url: https://infinitediscs.com/Innova-Sonic/DX, type: retailer, weight: 0.3}
  - {name: Infinite Discs Star Sonic (3 ratings), url: https://infinitediscs.com/Innova-Sonic/Star, type: retailer, weight: 0.1}
  - {name: Disc Golf Reviewer Sonic DX review (Alan, Sep 2, 2022), url: https://discgolfreviewer.com/innova-sonic-putter/, type: community, weight: 0.2}
  - {name: Marshall Street Sonic (1/2/-4/0; not independent), url: https://www.marshallstreetdiscgolf.com/?s=sonic&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, Infinite's 30-review average (-3.8/0) and the DX reviewers agree on a very understable, near-zero-fade, slow putter that turns at touch power and holds its line without fading. The reviewers who disagree are weight effects (light copies turn more, near-max copies fly straight) and a 2016 advanced reviewer who dislikes the disc, not a different number. No contradicting evidence found.
- **plasticVariance:** DX on Innova's page; Star, Halo Star, XT and stamps elsewhere. **Star reads more stable than the DX** (three ratings with turn -3, -3, -4, "much more stable … very little fade"; spot-check, tiny sample). Disc weight matters a lot on this mold: 96 g copies "turn over super easy," 160 g and below "very straight." Not quantified. Do not average.
- **Linked:** Aviar (2/3/0/1; the Sonic is the opposite end of the Innova putter range), Magnet (2/3/-1/1), Deputy (3/4/-1.5/0). Nothing moves.

## Warden — Dynamic Discs (id 0c3e8ac6131a)

- **Atlas now:** 2/4/0/0.5 (source: Marshall Street snapshot; PDGA approval 13-64, Oct 2013; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Classic Blend (22 ratings; Lucid has 4; Dynamic prints one set of numbers across a dozen plastics).
- **Manufacturer:** Dynamic Discs 2/4/0/0.5 (collection page fetched; no stability label printed). Copy: "With an extremely smooth release and neutral flight, the Warden will come out of your hand easily and fly dead straight to the chains. With more glide than the Judge, it will stay in the air longer to help deflate those high scores"; uses "straight approaches, stable putts, learning to throw a putter." Infinite (quoting Dynamic): "the beadless version of the popular Dynamic Discs Judge … a straight flight path with the most minimal fade"; label "Stable." Copy and numbers agree. **Small contradiction in the Atlas, not the sources:** Dynamic says the Warden has more glide than the Judge; the Atlas gives both glide 4 (Judge 2/4/0/1). Glide is outside this review's scope; noting it only.
- **Retailer:** Infinite reviewer numbers **2.1/3.7/0/0.5 (137 reviews, 4.67 stars)**; Classic Blend page 2/3.7/0/0.5 (22 ratings, 4.8 stars); Lucid page 2/3.9/0/0.5 (4 ratings). Turn and fade exact. Marshall Street 2/4/0/0.5 (baseline).
- **Community:** Infinite Classic Blend reviewers (22, 2014-2022, mostly intermediate or advanced; 17 numeric ratings: turn 0 in 16, -0.5 in one; fade 0.5 in 14, 0 in 2, 1 in 1): "frozen rope straight with a little tiny fade at the end" (advanced and intermediate, repeated); "one of the most stable putters on the market, always holds the line" (advanced); "a Judge without the bead" (intermediate); "a fair amount of glide means this disc can be thrown off the tee" (advanced); "flies very straight and true" (intermediate). Lucid reviewers (4, 2018-2023): "furthest flying putter I have thrown," "holds up to power a lot better" than Prime, "when thrown flat will just hold it forever and get a ton of distance" (intermediate); "flies straight as an arrow with almost minimal fade" (intermediate, 250-300 ft); "I love Aviars, but I love Wardens more" (intermediate).
- sources:
  - {name: Dynamic Discs Warden collection page (2/4/0/0.5), url: https://www.dynamicdiscs.com/collections/dynamic-discs-warden, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Warden (listing 2/4/0/0.5 "Stable"; reviewers 2.1/3.7/0/0.5; 137 reviews), url: https://infinitediscs.com/dynamic-discs-warden, type: retailer, weight: 0.5}
  - {name: Infinite Discs Classic Blend Warden (22 ratings, dated; reviewer text), url: https://infinitediscs.com/Dynamic-Discs-Warden/Classic-Blend, type: retailer, weight: 0.3}
  - {name: Infinite Discs Lucid Warden (4 ratings, dated), url: https://infinitediscs.com/Dynamic-Discs-Warden/Lucid, type: retailer, weight: 0.2}
  - {name: Marshall Street Warden (2/4/0/0.5; not independent), url: https://www.marshallstreetdiscgolf.com/?s=warden&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, Infinite's 137-review average (0/0.5, a large enough pool that the shrinkage matters little) and 26 reviewers across two plastics agree on a dead-straight putter with a tiny fade, and the text (from putt-and-approach reviewers) matches Dynamic's copy and the "Judge without the bead" description. No contradicting evidence found.
- **plasticVariance:** Sold in Classic, Classic Blend, Classic Soft, Fuzion, Lucid, Lucid Ice, Prime and burst, Moonshine and X-out variants; Dynamic prints one set of numbers. Reviewers: Lucid "holds up to power a lot better" than Prime; Classic Blend resembles XT Aviar feel. No stability spread reported. Do not average.
- **Linked:** Judge (Atlas 2/4/0/1; batch 2, Dynamic's own comparison), Aviar (2/3/0/1, the reviewers' comparison; the Atlas puts the Warden half a point less fade, which matches "straighter than an Aviar"), Magnet (2/3/-1/1), Luna (3/4/0/2) and Truth (5/5/-1/1) in the Dynamic family. Nothing moves.

## Volt — MVP (id 9668fc736651)

- **Atlas now:** 8/5/-0.5/2 (source: Marshall Street snapshot; PDGA approval 12-33, Jul 2012; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Neutron (Infinite's best-populated page; a retailer search summary calls it the "go-to" feel for most players, spot-check). **Linked to the Tesla candidate: re-checked together in the section above; neither moves.**
- **Manufacturer:** MVP 8/5/-0.5/2, "Stable-Overstable" (`mvpdiscsports.com/discs/volt/` fetched). Copy: "The Volt is a slightly overstable fairway driver. The Volt is geared for long, accurate placement shots; it can hold a long straight line with a solid, forward penetrating fade. Reach for the Volt when accuracy is needed on long, tight fairways." Infinite (quoting MVP): "the first driver in the MVP line … holds a line very well, and the GYRO technology gives it a forward penetrating fade"; label "Stable." Copy and numbers agree. Label split, same numbers: MVP "Stable-Overstable," Infinite "Stable."
- **Retailer:** Infinite reviewer numbers **8.1/4.9/-0.6/2.1 (144 reviews, 4.61 stars)**; Neutron 8.1/4.9/-0.6/2.1 (42 ratings); Plasma 8.2/5.1/-0.6/2.1 (14 ratings, 4.9 stars); Fission 8.1/5/-0.6/2 (17 ratings, 4.5 stars). Turn within 0.1, fade within 0.1 on every plastic. Marshall Street 8/5/-0.5/2 (baseline).
- **Community:** Infinite Neutron reviewers (42, 2012-2025; see the era tally above): "board flat … fast and overstable flight" (advanced, 350 ft, Jun 2025, rated 0); "8-speed flight/distance but a 9-speed rim, very predictable" (intermediate, 350 ft, 2025); "meat hook," reliable for spike hyzers and headwind (intermediate, rated -0.5/3); "happy in-between zone of a Teebird and a Thunderbird" (intermediate); "plays a little longer than Thunderbird" (advanced, Plasma); "Teebird but better" (advanced); "more under stable than the numbers would suggest, good for hyzer flips" (intermediate, rated -1.5); "straight as straight can be for 90% of the flight" (professional); "quite understable, poor in wind" (advanced, 330-350 ft, Dec 2012). Plasma: "behaves nothing like ratings … fades hard and long" (advanced, rated 0/3). Fission: "more overstable than you might realize" (intermediate, 275-300 ft), "the most inconsistent mold they make, extremely stable" (intermediate, 2017, rated +0.5/3.5), "I still cannot find a way to get a -1 turn on this thing" (intermediate, 2016). Aaron (bestdiscgolfdiscs.com, Jul 12, 2023, standard plastic, weight 0.1): flight matches -0.5/2, "the slight turn on a power throw is beautiful," greater fade than a Teebird, the Tesla "faster, requires more power."
- sources:
  - {name: MVP Volt page (8/5/-0.5/2, Stable-Overstable), url: https://mvpdiscsports.com/discs/volt/, type: manufacturer, weight: 1.0}
  - {name: MVP Tesla page ("big brother to our acclaimed Volt"), url: https://mvpdiscsports.com/discs/tesla/, type: manufacturer, weight: 0.5}
  - {name: Infinite Discs Volt (listing 8/5/-0.5/2; reviewers 8.1/4.9/-0.6/2.1; 144 reviews), url: https://infinitediscs.com/mvp-volt, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Volt (42 ratings, dated; reviewer text), url: https://infinitediscs.com/MVP-Volt/Neutron, type: retailer, weight: 0.3}
  - {name: Infinite Discs Plasma Volt (14 ratings), url: https://infinitediscs.com/MVP-Volt/Plasma, type: retailer, weight: 0.2}
  - {name: Infinite Discs Fission Volt (17 ratings, dated 2015-2023), url: https://infinitediscs.com/MVP-Volt/Fission, type: retailer, weight: 0.2}
  - {name: bestdiscgolfdiscs Volt review (Aaron, Jul 12, 2023), url: https://bestdiscgolfdiscs.com/mvp-volt/, type: community, weight: 0.1}
  - {name: Marshall Street Volt (8/5/-0.5/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=volt&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, three plastic pools (73 ratings among them, plus the 144-review mold average) and the text agree on a slightly overstable, straight-flying eight-speed with a firm forward fade, and the comparisons to the Teebird and Thunderbird match the Atlas's neighbours. The Neutron 2024-25 turn-0 cluster and the older run-variation remarks are recorded as a soft watch above, not a proposal. No contradicting evidence found. Held at 0.7 (not higher) because the soft watch is unresolved and the Neutron page is the only one with 2024-25 reviews.
- **plasticVariance:** Sold in Neutron, Proton, Plasma, Fission, Electron, Eclipse and misprints; MVP prints one set of numbers. Reviewers: Plasma "behaves nothing like ratings, fades hard" (one advanced reviewer), Fission "the most understable" for one beginner (-2) and "extremely stable" for another intermediate (+0.5), Neutron runs vary. The three plastic pools nonetheless read identically (-0.6/2.1), so the spread is within each plastic, run to run. Not quantified. Do not average.
- **Linked:** **Tesla (9/5/-1/2; open candidate unchanged; re-checked above)**, Photon (11/5/-1/2.5), Teebird (7/5/0/2), Thunderbird (9/5/0/2), Reactor (5/5/-0.5/1.5) and Trail (10/5/-1/1) in the MVP family. Nothing moves.

## Explorer — Latitude 64 (id a24992d5196f)

- **Atlas now:** 7/5/0/2 (source: Marshall Street snapshot; PDGA approval 17-128, Dec 2017; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Opto (87 ratings at Infinite; Gold Line has 5, and the mold is sold in about 30 plastics).
- **Manufacturer:** Latitude 64 7/5/0/2, "Stable" (`latitude64.com/collections/explorer` fetched). Copy: "Straight flight path and controlled glide, that's what the Explorer brings. Designed to be the workhorse for all kinds of accurate fairway drives. This stable and versatile fairway driver is smooth out of the hand and has a clean stable flight." Copy and numbers agree.
- **Retailer:** Infinite reviewer numbers 7/5/-0.1/2 (**123 reviews, 4.81 stars**); Opto page 7/5/-0.1/2 (87 ratings, 4.7 stars); Gold Line 5 ratings all 7/5/0/2 (one fade 1.5). Turn within 0.1, fade exact. Infinite label "Stable." Marshall Street 7/5/0/2 (baseline).
- **Community:** Infinite Opto reviewers (the five visible, Dec 2024 – Jul 2025): ratings 7/5/0/2, 7/5/0/2, 7/5/0/1.5, 7/5/-0.5/2, 7/5/-0.5/2. "Very good OS fairway driver … basically a Teebird in Trilogy plastic" (intermediate, 275 ft); "doesn't get overpowered too easily and still gets decent glide" (beginner, 275 ft); "beats in dead straight" (beginner, 275 ft); "staple … clean releases" (intermediate, 325 ft); "**Not as over stable as a champion Teebird**" (advanced, 400 ft). Gold Line reviewers (2020-21): "probably a bit too stable for real beginners; similar to a Teebird but better"; "the straightest but still trustworthy into wind." Jake Matney (Skyline blog, Mar 5, 2021): "fresh discs fly slightly more stable, while seasoned versions gain a touch of turn," "a very straight flight with a late, predictable finish," most similar to the Teebird, "a bit straighter out of the box," glidier than a Teebird. Search summary of Infinite (spot-check): "the Opto plastic version is not as over stable as a champion Teebird; mixed in headwinds."
- sources:
  - {name: Latitude 64 Explorer collection page (7/5/0/2, "Stable"), url: https://latitude64.com/collections/explorer, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Explorer (listing 7/5/0/2; reviewers 7/5/-0.1/2; 123 reviews), url: https://infinitediscs.com/latitude-64-explorer, type: retailer, weight: 0.5}
  - {name: Infinite Discs Opto Explorer (87 ratings, dated; reviewer text), url: https://infinitediscs.com/Latitude-64-Explorer/Opto, type: retailer, weight: 0.3}
  - {name: Infinite Discs Gold Line Explorer (5 ratings, dated), url: https://infinitediscs.com/Latitude-64-Explorer/Gold-Line, type: retailer, weight: 0.2}
  - {name: Skyline Discs Explorer spotlight (Jake Matney, Mar 5, 2021; retailer blog), url: https://skylinediscs.com/blogs/disc-spotlights/latitude-64-explorer, type: community, weight: 0.2}
  - {name: Marshall Street Explorer (7/5/0/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=explorer&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer and the 123-review average (87 on the Opto page) agree on 0/2 to within 0.1, and the text, from 275 to 400 ft throwers, says "a Teebird in Trilogy plastic" that is slightly less overstable than a Champion Teebird, which fits the Atlas's identical 0/2 for the Teebird. The mild "fresh is more stable, beaten-in gains a touch of turn" is the usual wear effect. No contradicting evidence found.
- **plasticVariance:** Sold in about 30 plastics (Opto, Gold Line, Zero Gravity, Retro, Recycled and more); Latitude prints one set of numbers. Blog: Opto "durable, maintains stability longer," Gold Line "beats in faster for straighter flight sooner," Opto-X "stiffer, extra stability and wind resistance." Not quantified. Do not average.
- **Linked:** Teebird (7/5/0/2, identical), Stalker (7/5/-1/2), Cyclone (7/4/-1/2), Spark (7/4/-0.5/3). Nothing moves.

## Pathfinder — Thought Space Athletics (id 8ee9e682d40c)

- **Atlas now:** 5/5/0/1 (source: Marshall Street snapshot; PDGA approval 20-51, Jun 2020; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): Ethos (20 ratings; Infinite lists 13 plastics).
- **Manufacturer:** Thought Space's own page was not reachable (see Evidence limits). Retailers print 5/5/0/1 and quote TSA's description: "The Pathfinder is an excellent midrange that can be counted on for a consistent, straight flight down the fairway with only minimal end fade" (Infinite); other retailer copy (search summary, spot-check): "the company's flagship midrange designed for comfort in the hand," a bead-less mid that "glides forward, holds any angle you ask, and finishes with a feather-soft fade." Infinite label "Stable." Copy and numbers agree. Thought Space has renumbered a mold before (Synapse); no sign of an older Pathfinder set anywhere I read.
- **Retailer:** Infinite reviewer numbers **5/5.1/-0.1/1.1 (63 reviews, 4.77 stars)**; Ethos page 5/5.1/-0.1/1.1 (20 ratings, 4.9 stars). Raw Ethos ratings: turn 0 in 18 of 20 (-1 in two), fade 1 in 17 (2 in two, 0.5 in one), so this page is largely the display echoed back. Marshall Street 5/5/0/1 (baseline).
- **Community:** Infinite Ethos reviewers (20, Nov 2020 – Feb 2026; 4 beginners, 11 intermediate, 5 advanced; distances 250-325 ft where stated): "holds whatever line you put it on" with minimal fade (beginner 300 ft, intermediate 250 ft); "like a Buzzz with more glide" (advanced, Dec 2023; intermediate, Feb 2023); "a cross between a Buzzz and a Shark" (intermediate); "stability between Mako3 and Buzzz" (advanced); "can power this disc up a lot more without turning" (advanced, Mar 2022); "handles a surprising amount of power without turning" (intermediate); "beats in quickly, becomes straighter over time" (beginner, 275 ft, rated -1); "dead straight on flat with small fade." Search-summary retailer text: "relatively torque-resistant on a forehand," "flat-to-fade flights out past 300 ft" (spot-check).
- sources:
  - {name: Infinite Discs Pathfinder (listing 5/5/0/1 "Stable"; quotes TSA description; reviewers 5/5.1/-0.1/1.1; 63 reviews), url: https://infinitediscs.com/thought-space-athletics-pathfinder, type: retailer, weight: 0.5}
  - {name: Infinite Discs Ethos Pathfinder (20 ratings, dated; reviewer text), url: https://infinitediscs.com/Thought-Space-Athletics-Pathfinder/Ethos, type: retailer, weight: 0.3}
  - {name: Skyline Discs and Rocket Discs Pathfinder pages (5/5/0/1, TSA description repeated; search results), url: https://skylinediscs.com/products/thought-space-athletics-pathfinder, type: retailer, weight: 0.1}
  - {name: Marshall Street Pathfinder (5/5/0/1; not independent), url: https://www.marshallstreetdiscgolf.com/?s=pathfinder&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** The retailer layer and 20 dated Ethos reviewers agree on a straight midrange with a feather-soft fade that holds its line under power, and the Buzzz comparisons sit with the Atlas (Buzzz 5/4/-1/1: the reviewers say the Pathfinder is glidier and straighter, which is what 0 turn against the Buzzz's -1 says). Held at 0.65 because TSA's own page was not read, so the manufacturer layer is second-hand, and because the Ethos page is mostly the display echoed back. No contradicting evidence found.
- **plasticVariance:** Sold in Aura, Ethereal, Ethos, Nebula, TSA Glow and others; the printed numbers do not vary by plastic. Reviewer: beats in quickly and becomes straighter. Not quantified. Do not average.
- **Linked:** Buzzz (5/4/-1/1), Atlas (5/4/0/1), Mako (4/5/0/0), Shark (4/4/0/2), Reactor (5/5/-0.5/1.5), Hex (5/5/-1/1) and Truth (5/5/-1/1). The Atlas orders the Pathfinder at turn 0 beside the Atlas and Mako and a point above the Buzzz, Hex and Truth, as the reviewers' comparisons describe. Nothing moves.

## Omega — Millennium (id 83f45388b63a)

- **Atlas now:** 2/3/0/0 (source: Marshall Street snapshot, label "Stable"; PDGA approval 95-09, Jul 1995; no override). **Proposed turn/fade:** none. Evidence too thin to call; **no candidate**. Reference plastic (assumed): none clearly dominant; Millennium's own copy pitches ET, Quantum and Sirius as the firm plastics; Delta-T and SuperSoft are the soft ones.
- **Manufacturer (qualitative labels only, no digits):** Millennium's own site publishes **"Stable Putter"** and no flight numbers (`golfdisc.com/discs/omega/` fetched, as with the Astra, Orion LF and Quasar). Copy: "The Omega is a straight putt and approach disc that gives you total control of angle, direction, and speed. It is totally stable in virtually any wind." Infinite (quoting Millennium): "For those who like a firmer putter, the Omega in ET, Quantum, and Sirius plastics provide the same great flight pattern in a stiff plastic blend. You can't beat the stability and consistency of the Omega." Marshall Street's Sirius Omega page: "Approaches? Goes straight, no problem. Drives? Goes straight, no problem. Putts? I don't know, maybe if you're an oddball!" and "The Alpha and Omega of premium plastic." The qualitative label and copy fit 0/0 better than -1/1.
- **Retailer (split):** Infinite listing **2/3/0/0, label "Stable"**; Marshall Street's Sirius Omega product page (fetched) 2/3/0/0 "Stable" (the plain Omega page appeared only as a search result); Disc Golf Puttheads flight chart 2/3/0/0 ("neutral stability," "dependable minimal fade"). **OTB Discs prints the Delta-T Omega at 2/3/-1/1**, and Rodney Lane's 2016 Puttheads review (ET) prints "2 speed, 3 glide, -1 turn, 1 fade." Marshall Street also lists an **Omega4** (bead) at 2/3/0/1 and several SuperSoft variants without digits. A search summary says "PDGA official flight specification for the standard Omega is 2/3/0/0" (PDGA approvals do not list flight numbers; spot-check). **So there appear to be two catalogs in circulation: 2/3/0/0 (current main retailers) and 2/3/-1/1 (older and some smaller retailers), and Millennium itself prints neither.** Infinite mold-level reviewer numbers 2/3/-0.4/0.4 (12 ratings, 4.67 stars), shrunk toward the display.
- **Community (raw visible Infinite ratings, 8 across four plastics, 2015-2022):** Sirius: Discintime (professional, Jan 2020) 2/3/-1/1 "very close to an Aviar, just a slight variant"; Murphy (intermediate, May 2015) 2/3/-1/1 "first run Sirius Omega was my main putter for 4 years." Quantum: RicoWindstar (intermediate, Dec 2018) 2/3/-1/1 "Aviar style … a real straight flight," "strong headwinds are going to flip this disc pretty easily." ET: JMorin (intermediate, May 2020) -1/1; Nate Langer (advanced, Jun 2016) -0.5/1. Delta-T: Davismarkallan (intermediate, **Jun 2022**) **2/3/0/0.5** "flys very straight with just enough fade at the end … a true point and shoot putter"; revdisc (May 2020) -1/1 "stable with an even turn and fade so a pretty straight" flight; Uncle Hugeness (May 2020) -1/1 "pretty straight flying putter with some glide but not too much." **Raw mean of the eight: turn -0.8, fade 0.9.** Rodney Lane (Puttheads, ET, Aug 9, 2016): "the Millennium Omega doesn't turn over on a drive while the Innova Aviar tends to turn and jog right"; "Don't let the manufacturer's numbers scare you off, this doesn't have as much turn as you'd expect given the -1 rating"; stable in 10-20 mph wind. A DGCR "Aviar vs. Omega" thread returned 403 (title only).
- sources:
  - {name: Millennium golfdisc.com Omega page (label "Stable Putter"; no digits), url: https://www.golfdisc.com/discs/omega/, type: manufacturer, weight: 0.6}
  - {name: Infinite Discs Omega (listing 2/3/0/0 "Stable"; reviewers 2/3/-0.4/0.4; 12 ratings), url: https://infinitediscs.com/millennium-omega, type: retailer, weight: 0.4}
  - {name: Infinite Discs Sirius, ET, Quantum and Delta-T Omega pages (8 visible ratings, dated; reviewer text), url: https://infinitediscs.com/Millennium-Omega/Sirius, type: retailer, weight: 0.3}
  - {name: Marshall Street Sirius Omega (2/3/0/0 "Stable"; not independent), url: https://www.marshallstreetdiscgolf.com/product/sirius-omega, type: retailer, weight: 0.2}
  - {name: Disc Golf Puttheads Omega flight chart (2/3/0/0), url: https://www.dgputtheads.com/flight-charts/omega, type: retailer, weight: 0.1}
  - {name: OTB Discs Delta-T Omega (2/3/-1/1), url: https://otbdiscs.com/product/omega/, type: retailer, weight: 0.1}
  - {name: Disc Golf Puttheads Omega review (Rodney Lane, ET, Aug 9, 2016), url: https://www.dgputtheads.com/millennium-omega-review, type: community, weight: 0.3}
- **confidence:** 0.45
- **consensusNote:** No manufacturer digits. Millennium's label and copy ("Stable," "totally stable in virtually any wind") and the current main retailers say 0/0; the older catalog and the eight raw reviewer ratings (seven from 2015-2020, display probably -1/1) say about -1/1, but those reviewers rate against an older display, their text describes a straight, Aviar-like putter ("doesn't have as much turn as you'd expect given the -1"), and the one visible post-2021 rating reads 0/0.5. So the likely story is a number that has been quoted as -1/1 for years and now as 0/0, with observed flight at about 0 to -0.5 turn and 0.5 to 1 fade. **I cannot tell which catalog is right** and no manufacturer layer exists to arbitrate. If you want observed flight over a retailer number, the only candidate would be **fade 0 → 0.5** (|Δ| 0.5) and I would not make it on twelve ratings (only eight visible, across four plastics). Same treatment as the Astra, Orion LF and Quasar: qualitative label noted, retailer and reviewer layers carry the call, too thin.
- **plasticVariance:** Sold in Delta-T, ET, Lunar ET, Quantum, Sirius, SuperSoft and X-outs; Millennium says the firm plastics (ET, Quantum, Sirius) have "the same great flight pattern" as the soft ones. The visible reviewers' ratings do not differ by plastic. Sirius "slick in cold or wet." Not quantified. Do not average.
- **Linked:** Aviar (2/3/0/1, the reviewers' comparison; the Atlas gives the Omega half a point less fade than the Aviar, which matches "doesn't turn over where the Aviar jogs right"), Warden (2/4/0/0.5), Magnet (2/3/-1/1) and the Omega4 and SuperSoft variants (not separate Atlas entries that I could see). Nothing moves.

---

## Batch 14 report (for Freddy)

**Decided items recorded first:** D2 turn stays PARKED as an open candidate (not closed) and D1 fade 4 → 3.5 stays parked on thin evidence (both owner decisions, Oct 3, 2026).

**Proposed changes (0).** All ten Atlas numbers equal the current manufacturer pages for the eight molds whose manufacturer page I could read (Pathfinder's page was unreachable; Omega's manufacturer has no digits).

**Open candidates (1 new), not gated:**
- **Defy turn -1 → -0.5** (|Δ| 0.5; taking the reviewers fully, 0, would be gated and I would not go there). Seven of eight post-2019 Neutron ratings put turn at 0 against a display of -1, from 325 to 500 ft throwers, with text saying "more overstable than the numbers"; Axiom's own copy calls the Defy straighter than and more stable than the Photon and resistant to turnover, while the Atlas has the two at the same turn; the Photon's own Neutron pool reads -0.6 and the Defy's about -0.1. Held back: 13 Neutron ratings (8 post-2019), anonymous, no arm speeds, one plastic, the only named review is an SEO-style site whose numbers contradict its own conclusion, the pooled Infinite average (-0.6 on 21) sits closer to the printed number, and the Fission Defy is reported more understable. Needs a named reviewer with an arm speed or a Neutron-only reading after 2024. Review Photon (would not move), Clash and Crave (copy comparisons) and Destroyer with it if it moves.

**Volt / Tesla (the batch brief's watch): neither moves.** The Volt is confirmed at 8/5/-0.5/2 on the manufacturer page and three plastic pools (-0.6/2.1 on Neutron, Plasma and Fission, 144 reviews at mold level). The Tesla candidate (turn -1 → -0.5) is carried exactly as batch 6 left it, still held back per the plastic policy. One new thing to know: the Volt Neutron page shows a **2024-25 recency cluster** (four of five ratings from four reviewers at turn 0, at 350-375 ft), recorded as a soft watch, not a candidate. If it hardens, the Volt candidate would be -0.5 → 0 and would be reviewed with the Tesla, because a Volt at 0 would widen the pair to a full point. The Volt and Tesla pools read the same turn (-0.6) while the Atlas puts them 0.5 apart; the reviewer layer cannot test that spacing either way.

**Confirmed as-is (8):** Anax, Warden (0.75); Volt, Explorer, Sonic (0.7); Pathfinder (0.65); Culprit (0.6); CD1 (0.55). Confirmations mean "no contradicting evidence found," not independent community verification. **CD1 and Culprit are the least firm**: eight and ten ratings respectively, no stated arm speeds, post-2022 molds. **Pathfinder's manufacturer layer is second-hand** (TSA's own page 404'd in every form I tried).

**Too thin to call (2):** Defy (above) and **Omega**. Omega is a Millennium mold, handled as the brief expected: golfdisc.com labels it "Stable Putter" with "totally stable in virtually any wind" and prints no digits; the retailer layer splits between **2/3/0/0** (Infinite, Marshall Street, Puttheads chart: current) and **2/3/-1/1** (OTB Discs, the 2016 Puttheads review: older); eight visible ratings (seven from 2015-2020) read about -0.8/0.9 on a display that was probably -1/1 then; the one post-2021 rating reads 0/0.5; the text says Aviar-like and "doesn't have as much turn as you'd expect given the -1." I cannot tell which catalog is right and no manufacturer layer exists to arbitrate. No candidate (the only one would be fade 0 → 0.5, on twelve ratings, eight visible).

**New methodological finding (Infinite pages):** the "Reviewer Flight Numbers" printed on Infinite plastic pages appear to be **shrunk toward the displayed numbers, as if about eight phantom ratings sat at the listed value**. The Defy Neutron arithmetic is in Evidence limits (raw means -0.35 / 2.77, printed -0.6 / 2.9, which a prior of eight at -1/3 reproduces); the same fit holds for the CD1, Warden Lucid, Culprit Hybrid and all four Omega plastic pages. It means small-page averages understate deviation, and it **may explain the batch 12 "Quantum page average disagrees with per-reviewer ratings" item** for the Quasar (hypothesis, not checked). It changes no earlier verdict by itself. It is my arithmetic on fetch-step data; worth a 5-minute spot-check by someone who can see the pages.

**Label contradictions recorded (same numbers):** Defy (Axiom "Stable-Overstable," Infinite and DiscMetrics "Overstable"), Volt (MVP "Stable-Overstable," Infinite "Stable"), Culprit (Dynamic "Overstable," Infinite "Very Overstable"), Defy copy wording ("longer Clash" on Axiom's page versus "longer Crave" in retailer copy), Warden (Dynamic prints no label, Infinite "Stable"; Dynamic says more glide than the Judge while the Atlas gives both glide 4, outside scope). None is a numeric disagreement with a manufacturer.

**Spot-checks needed before any override source note:** the Defy Neutron per-reviewer ratings and my era split (13 ratings, 8 post-2019) and the claim that the Infinite display changed from about 12/5/-1/2 to 11/5/-1/3 around 2018-19; the Volt Neutron era tally (2014-2019 mean -0.8, 2020-2023 -0.5, 2024-2025 -0.1) and the four 2025 reviewers; the Axiom copy wording (Clash versus Crave); the Discraft Anax stability 1.9; the OTB Discs Omega 2/3/-1/1 listing and the Puttheads Omega 2016 printed numbers; the Infinite shrinkage arithmetic above; and any quote taken via the summarizing fetch.

**Process notes for the next batch**

- Next ten by `featured.js` order after Omega: Stål (Kastaplast), Giant Reborn (Westside Discs), Enforcer (Dynamic Discs), Sheriff (Dynamic Discs), Nitro (MVP), Saint (Latitude 64), Nuke OS (Discraft), XCaliber (Innova), Blade (Gateway), Havoc (Latitude 64). Vulcan sits between Enforcer and Sheriff in the file and was done in batch 4; Maverick (Dynamic Discs) follows Havoc. Links I know of from earlier entries: Enforcer is in the PD2/Enforcer soft watch; Sheriff is in the Synapse/Trespass/Destroyer set (batches 8-10); Saint is the anchor of the Fury fade 2 → 1.5 open candidate (review it with the Fury); Nuke OS is in the Nuke/Force/Zeus family (batch 7); XCaliber is in the Quasar/Boss set (batch 12, Quasar fade 3 → 3.5 soft watch). I have not checked links for Stål, Giant Reborn, Nitro, Blade or Havoc. Check the Infinite shrinkage hypothesis on the first page with fewer than ten ratings.
- **Retail-side hazard watch carried forward:** Prodigy renumbering (July 2023) for any Prodigy mold; Thought Space has renumbered once (Synapse) and the Pathfinder has no sign of it; Omega shows a second kind of staleness (a 2/3/-1/1 catalog still circulating alongside 2/3/0/0).
- **Open-candidate running list (nothing applied by this lane):** open: **Predator turn +1 → 0 (gated), D2 turn 0 → -0.5 (PARKED, owner decision Oct 3, 2026, not closed), D1 fade 4 → 3.5 (PARKED, thin evidence, owner decision Oct 3, 2026), Defy turn -1 → -0.5 (new)**; carried unchanged and not named in the refreshed list: **MD3 (new) fade, Tesla turn -1 → -0.5, Fury fade 2 → 1.5**; stay as-is: Monarch -4, Toro +1, Quasar 0; pending in the main tree (this tree's overrides file has neither, re-checked after `git merge main`): **Synapse turn -1, Astra turn -1.5**; applied and present in this tree: Roc 2.5, Luna 3/4/0/2, Trident 3.5, Gator 4, Trespass -1. Soft watches: Falk turn, Svea turn, A1/A2 spacing, PA3 fade, Lots turn, Voodoo fade, PD2 fade, PD2/Enforcer, Stingray Star turn, Orion LF fade, Tantrum fade, Quasar fade 3 → 3.5, D3 and F3 reviewer-versus-printed gaps, **plus this batch's Volt Neutron turn 2024-25 reading about 0**. **Catalog-identity flag still open:** FD1/FD2/Instinct (batch 11). **New catalog note (not an identity flag):** Omega 2/3/0/0 versus 2/3/-1/1 across retailers.
- **Linked sets re-checked this batch:** Volt/Tesla/Photon/Teebird/Thunderbird/Firebird/Reactor/Trail, Defy/Photon/Clash/Crave/Tesla/Destroyer, Anax/Vulture/Predator/Thunderbird/Pulse/Raptor, CD1/Dynasty/Undertaker/Savant/Orion LF/PD, Culprit/Zone/Pig/Rat/Gator, Sonic/Aviar/Magnet/Deputy, Warden/Judge/Aviar/Magnet/Luna/Truth, Explorer/Teebird/Stalker/Cyclone/Spark, Pathfinder/Buzzz/Atlas/Mako/Shark/Reactor/Hex/Truth, Omega/Aviar/Warden/Magnet. Nothing moves beyond the one open candidate.
- Reachable manufacturer paths this batch: `axiomdiscs.com/discs/defy/`, `team.discraft.com/discs/anax` (the `www.` form), `discmania.net/collections/cd1` (`/products/cd1` 404s; use `www.discmania.net`), `dynamicdiscs.com/collections/dynamic-discs-{culprit,warden}`, `mvpdiscsports.com/discs/{volt,tesla}/`, `innovadiscs.com/disc/sonic/`, `latitude64.com/collections/explorer` (`latitude64.se/disc/explorer/` redirects, then 404s), `golfdisc.com/discs/omega/` (the `www.` form; `golfdisc.com/disc/omega/` 404s). Thought Space Athletics has no reachable Pathfinder page. Infinite slugs: Defy `/axiom-defy`, `/axiom-defy/neutron---axiom`; Anax `/discraft-anax`, `/Discraft-Anax/ESP`; CD1 `/discmania-cd1`, `/Discmania-CD1/{C-Line,S-Line}`; Culprit `/dynamic-discs-culprit`, `/Dynamic-Discs-Culprit/{Lucid,Fuzion}`, `/dynamic-discs-culprit/hybrid`; Sonic `/innova-sonic`, `/Innova-Sonic/{DX,Star}`; Warden `/dynamic-discs-warden`, `/Dynamic-Discs-Warden/{Lucid,Classic-Blend}`; Volt `/mvp-volt`, `/MVP-Volt/{Neutron,Plasma,Fission}`; Explorer `/latitude-64-explorer`, `/Latitude-64-Explorer/{Opto,Gold-Line}`; Pathfinder `/thought-space-athletics-pathfinder`, `/Thought-Space-Athletics-Pathfinder/Ethos`; Omega `/millennium-omega`, `/Millennium-Omega/{Sirius,Quantum,ET,Delta-T}`. The Defy Proton, Defy Eclipse and Anax Z plastic pages returned 302 or 404. Named reviews: `dgputtheads.com/discraft-anax-review` and `dgputtheads.com/millennium-omega-review` worked; the Puttheads Defy, Volt and Pathfinder review URLs 404'd.
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access reads a Neutron Defy sample after 2024 with stated arm speeds (the Defy turn question) and a Neutron Volt sample after 2024 (the soft watch, and the Tesla's linked item), then the DGCR "Omega: The Alpha and the" and "Aviar vs. Omega" threads (which numbers the Omega was actually sold under), then still the D1, D2, Tesla and MD3 items.

---

# Batch 15 (Plan 10, Phase 2)

Researched October 3, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (already up to date at `e704d34`; the queue doc is still the only locally modified file).

Molds covered: Stål, Giant Reborn, Enforcer, Sheriff, Nitro, Saint, Nuke OS, XCaliber, Blade, Havoc (the next ten by `public/featured.js` order after Omega, verified against the live file; Vulcan, which sits between Enforcer and Sheriff, was skipped because batch 4 covered it; ids match the file).

**Brief correction, recorded so it does not propagate:** the batch brief groups Enforcer and Stiletto as sharing "the Lat64 overstable-driver space." The Enforcer is a **Dynamic Discs** mold (Atlas brand "Dynamic Discs", 12/4/0.5/4, Dynamic's own page); only the Stiletto is Latitude 64. I read the watch as "does anything here bear on the Enforcer/Stiletto pair and the PD2/Enforcer soft watch" and answer that in its own section below.

## Decided items and standing rules (recorded before the research)

- **Plastic baseline policy:** a mold's reference numbers are its most-thrown plastic (Star for Innova drivers). DX is the price-tier baseline but **not** the flight reference. I had no sales data, so each entry names the reference plastic I took to be the most-thrown and marks it "assumed."
- **Review gate:** weak evidence = no correction; |Δ| = 1.0 changes need the owner's call; record open candidates instead of proposing them.
- **Never average across plastics:** mold-level consensus plus a `plasticVariance` note.
- **Carried parked items (owner decisions, Oct 3, 2026):** D2 turn 0 → -0.5 and D1 fade 4 → 3.5 stay parked on the open-candidate list; nothing in this batch touches either.

---

## Batch 15 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Sheriff | 13/5/-1/2 | none | Confirmed as-is | 0.75 |
| Enforcer | 12/4/0.5/4 | none | Confirmed as-is | 0.75 |
| XCaliber | 12/5/0/4 | none | Confirmed as-is | 0.75 |
| Stål | 9/4/0/3 | none | Confirmed as-is | 0.7 |
| Nuke OS | 13/4/0/4 | none | Confirmed as-is (Nuke re-checked with it: neither moves) | 0.7 |
| Saint | 9/7/-1/2 | none | Confirmed as-is (soft watch: turn -1 → -1.5, skill-dependent) | 0.6 |
| Nitro | 13/4/-0.5/3 | none | Confirmed as-is (thin; display changed over the years) | 0.55 |
| Blade | 9/5/0/3 | none | Confirmed as-is (thin; mold-revision hazard, older HD copies read less overstable) | 0.55 |
| Havoc | 13/5/-1/3 | none | **Too thin to call: turn -1 vs about -1.7 in 22 raw Opto ratings (turn -1 → -1.5, not gated)** | 0.5 |
| Giant Reborn | 12/6/-0.5/2 | none | **Too thin to call: one review, a mold approved in 2026** | 0.4 |

**No changes proposed. One new open candidate (Havoc turn), seven confirmed (two with soft watches), two too thin.** All ten Atlas numbers equal the current manufacturer numbers: no Luna/Gator/Synapse-style Atlas lag and no Prodigy-style renumbering hazard (no Prodigy molds). The Nuke/Nuke OS re-check and the Enforcer/Stiletto watch found nothing that moves either disc. Two catalog hazards worth knowing about, neither a numeric disagreement with a manufacturer: **Gateway has retooled the Blade** (Blade section), and **Westside's own Giant Reborn page quotes the original Giant at 14/4/0/3.5 while its Giant page and the Atlas say 13/4/0/3.5** (Giant Reborn section; the Giant is not in this batch).

## Nuke / Nuke OS re-check (the batch brief's watch, done as a set)

**Answer: neither moves. The Nuke stays "confirmed as-is" as batch 7 left it, and the Nuke OS is confirmed beside it.**

- **Manufacturer, both re-read today:** Discraft Nuke **13/5/-1/3, stability 1.6** (`www.team.discraft.com/discs/nuke`; unchanged from batch 7) and Nuke OS **13/4/0/4, stability 2.2 "Over Stable"** (`www.team.discraft.com/discs/nuke-os`). The Atlas matches both exactly.
- **The family ordering holds in every layer.** Discraft's own stability ratings give Nuke 1.6 < Force 2.0 < Nuke OS 2.2 (Force from batch 5), and the Atlas numbers give Nuke -1/3, Force 0/3, Nuke OS 0/4: the same order on both scales. Infinite's reviewer pools agree: Nuke 13/5/-1/3 (161 reviews, unchanged from batch 7), Nuke OS 13/4/0/4.1 (64 reviews).
- **Copy:** the Nuke OS page says it "will finish on a hyzer even in strong winds"; the Nuke page says the 1.6 rating "makes it more useful to a wider range of players." Both fit the numbers.
- **Linked, unchanged:** Surge (11/5/-1/3, 1.7), Zeus (12/5/-1/3, current Discraft number still not re-read), Nuke SS (13/5/-3/3), Force (12/5/0/3). Nothing moves.

## Enforcer / Stiletto watch

**Nothing found that bears on a change to either disc.**

- **What the Enforcer evidence says relative to the Stiletto:** nothing direct. No Enforcer reviewer mentions the Stiletto, and no Stiletto text in batch 10 mentions the Enforcer. The Atlas orders them Stiletto 13/3/0.5/5 above Enforcer 12/4/0.5/4 on fade with equal turn; the Enforcer reviewers' own comparisons (Destroyer, Trespass, Defender, XCaliber, Boss) sit in the Dynamic and Innova set, not the Latitude one.
- **Enforcer-side comparisons that do bear on the soft watch:** reviewers rank it "slightly more over stable than the staple Destroyer" (Atlas Destroyer 12/5/-0.5/3.5), "feels very similar in the hand to a Trespass," and, from the XCaliber side, "similar to the Dynamic Discs Enforcer … mostly utility oriented" and "compares favorably to Innova's Xcaliber" (Atlas XCaliber 12/5/0/4, differing from the Enforcer by 0.5 turn and one glide). All consistent with the Atlas.
- **PD2/Enforcer soft watch (batches 9-10):** a batch 9 reviewer ranked the PD2 more overstable than the Enforcer. This batch adds one datum from the other side: a November 2025 Nitro reviewer (advanced, 400 ft) compares the Nitro to the Sky Stone PD2 "with similar flight and stability" (Atlas Nitro 13/4/-0.5/3, PD2 12/4/0/4). Recorded only; the soft watch is unchanged.
- **Latitude's own wording:** Latitude says the Havoc is "slightly more understable" than the Stiletto or Ballista Pro (search summary of the Opto product page); the Atlas has Havoc -1, Stiletto +0.5, Ballista Pro 0, so that holds with room to spare.

## Evidence limits — batch 15

Same tooling limits as earlier batches; see the pilot section. Specific to this batch:

- **Diff against `flights.json` / `data.json` (done first):** the Atlas numbers equal the Marshall Street snapshot for nine of the ten. **Giant Reborn comes from the DiscIt portion of the catalog and has no flight source link** (the Atlas `flightSource` is empty). None of the ten has an override and none is in `infinite-manufacturer-ratings.json`. Compared with current manufacturer pages, **all ten match exactly**: Kastaplast (Stål K1 page), Westside (Giant Reborn collection page), Dynamic Discs (Enforcer and Sheriff collection pages), MVP (Nitro), Latitude 64 (Saint and Havoc collection pages; the Opto Havoc product page reads the same), Discraft (Nuke OS and Nuke, team.discraft.com), Innova (XCaliber), Gateway (Blade collection page).
- **No renumbering hazard found for these ten.** The Nitro is the one with a display history: Infinite's older Neutron ratings sit on 13/5/0/2 and the 2021+ ratings on 13/4/-0.5/3 (see Nitro). One retailer (Heartland Discs) still prints the Nitro at **13/4/0/3**; two others print 13/4/-0.5/3. A search summary also showed "13 | 4 | 0 | 4" for the Neutron Nitro, which no fetched page reproduced (treated as a summarizer artifact; spot-check).
- **Infinite URLs that 302'd:** `/Kastaplast-Stal/K1-Line` (the K1 page is `/kastaplast-stal/k1`), `/Innova-XCaliber` and `/Innova-XCaliber/Star` (the working slug is hyphenated: `/Innova-X-Caliber` and `/Innova-X-Caliber/Star`). allthingsdiscgolf.com's Enforcer review returned HTTP 500 (title only).
- **Reddit** not attempted (blocked per the brief), **YouTube** unreachable, **DGCR** 403 (the Havoc, "Havoc and Flow," Biofuzion Enforcer, Enforcer discussion and "Saint. What is it for?" threads appear only as search titles; none is cited as evidence).
- **Infinite "Reviewer Flight Numbers" shrinkage hypothesis (batch 14), checked on four more pages.** Result: **consistent on all four, one of them nearly exactly.** Enforcer Lucid: 13 numeric ratings, raw turn 0.27 and fade 3.95; adding eight phantom ratings at the displayed 0.5/4 gives 0.36 and 3.95; Infinite prints 0.4/4 (a plain average would print 0.3). Enforcer Fuzion: 18 numeric ratings, raw 0.33/4.0; with eight phantoms 0.38/4.0; printed 0.4/4. Blade HD: 11 numeric ratings, raw -0.27/3.23; with eight phantoms at the display -0.16/3.13; printed -0.1/3.1. Havoc Opto: 22 numeric ratings, raw -1.66/2.2; with eight phantoms -1.48/2.41; printed -1.4/2.5 (approximate; four of the 26 reviewers have no visible numbers). **The first page with fewer than ten ratings** (Nuke OS ESP, five ratings, all identical to the display) cannot test it. It is still my arithmetic on fetch-step data, but every page I could test across batches 14 and 15 now fits, so **treat printed Infinite plastic-page averages as understating deviation from the display, most on pages with under about 25 ratings.**
- **Community layer:** Infinite plastic-page reviewers (anonymous or first-name, single-source, skill stated, a few with distances) plus the Disc Golf Puttheads flight-chart pages (templated "Puttheads Notes" by Maredith, October 2025; weight 0.1). **No arm speeds are stated anywhere**; distance bands only (Stål 180-350 ft, Havoc 350-500 ft claims, Saint 200-450 ft, Sheriff 325-470 ft, XCaliber 275-465 ft, Nitro 400 ft once). No readable named long-form review turned up for any of the ten, so every community layer here is Infinite reviewers.
- **Marshall Street is the Atlas's own source** and was used only as baseline; I did not re-read its stability labels this batch.
- **Quotes via the summarizing fetch step** (all of them) need a spot-check before any goes into an override source note. Search-summary claims are flagged where used.

---

## Stål — Kastaplast (id 464d3241aa7c)

- **Atlas now:** 9/4/0/3 (source: Marshall Street snapshot; PDGA approval 17-126, Dec 2017; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): K1 (Infinite lists K1, K1 Hard, K1 Glow and variants; the K1 page is the only one with reviews).
- **Manufacturer:** Kastaplast 9/4/0/3, "Overstable fairway driver" (K1 page fetched). Copy: "This reliable fairway driver is stable enough to handle headwinds, without turning over or glide away for you. Trust the Stål for those critical shots when you need accuracy rather than max distance." Copy and numbers agree. Infinite's description: "overstable fairway driver … fight whatever you put it up against." Label split, same numbers: Kastaplast "overstable," Infinite "Very Overstable."
- **Retailer:** Infinite reviewer numbers **9/4/0/3.1 (17 reviews, 4.82 stars)**; K1 page 9/4/0/3.1 (15 ratings). Exact on turn, fade within 0.1. Marshall Street 9/4/0/3 (baseline).
- **Community:** Infinite K1-page reviewers (fifteen, 2018-2024; 13 intermediate, one advanced, one professional; distances 180-350 ft where stated). Eleven of fifteen ratings are exactly 9/4/0/3 (so this page is mostly the display echoed back); the two advanced/pro ratings sit a little over (fade 4 and 3.5), one intermediate under (3.5/2.5). Text: "numbers seem spot on … a little less overstable than a Firebird, … smoother and more mellow fade … not board flat like some other OS 9 speed drivers"; "fills a similar spot in the bag as a Firebird, but is a touch more glidey" (upper-200s ft); "quite a bit more stable than" a Tesla; "didn't even think about flipping over" in a 15 mph headwind (advanced); "true to its flight ratings" and outdrove a Firebird (professional, Jake LaPutka, January 2018); "extremely beefy" at 175 g (advanced). Search-summary retailer text (spot-check): "a Firebird-like disc that nearly every manufacturer seems to have," "turn-resistant … a good 350 feet of distance."
- sources:
  - {name: Kastaplast K1 Stål page (9/4/0/3), url: https://www.kastaplast.com/en-us/products/k1-stal, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Stål (mfr 9/4/0/3; reviewers 9/4/0/3.1; 17 reviews), url: https://infinitediscs.com/kastaplast-stal, type: retailer, weight: 0.5}
  - {name: Infinite Discs K1 Stål (15 ratings, dated; reviewer text), url: https://infinitediscs.com/kastaplast-stal/k1, type: retailer, weight: 0.3}
  - {name: Marshall Street Stål (9/4/0/3; not independent), url: https://www.marshallstreetdiscgolf.com/?s=stal&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, the 17-review average and fifteen K1 reviewers agree on a beefy, turn-resistant nine-speed with a moderate fade, and the repeated comparison is "a Firebird, slightly less overstable, slightly glidier," which is exactly the Atlas relationship (Firebird 9/3/0/4, Stål 9/4/0/3). The page is mostly display echo (eleven of fifteen at exactly 9/4/0/3), so the agreement is weaker evidence than its size suggests; the readable text and the two higher-skill ratings lean a touch more overstable (fade 3.5-4), which is inside the 0.5 band and not a candidate. No contradicting evidence found.
- **plasticVariance:** Sold in K1, K1 Hard, K1 Glow and others; Kastaplast prints one set of numbers. One reviewer calls the K1 "very grippy but also very smooth"; no stability spread reported. Not quantified. Do not average.
- **Linked:** Firebird (9/3/0/4, the reviewers' comparison, and the Atlas gap matches), Lots (9/5/-1/2, "a stable complement to my K1 Lots," Atlas gap matches), Raptor (9/4/0/3, identical), Blade (9/5/0/3, below), Ahti (9/3/0/4) and Pioneer (9/3/0/4). Nothing moves.

## Giant Reborn — Westside Discs (id 718692d0f76a)

- **Atlas now:** 12/6/-0.5/2 (source: DiscIt portion of the catalog, DiscIt label "Stable"; **no flight source link**, empty `flightSource`; PDGA approval 26-37, Mar 2026; no override). **Proposed turn/fade:** none. Evidence too thin to call; **no candidate**. Reference plastic (assumed): VIP (the only plastic with a review; Westside also sells Tournament).
- **Manufacturer:** Westside 12/6/-0.5/2 (`westsidediscs.com/collections/giant-reborn` fetched; no stability label printed). Copy: "A new Giant rises. Reimagined with a larger diameter and built for exceptional glide, the Giant Reborn is designed to carve controlled lines with confidence … With a smooth release, subtle turn, and dependable fade, it delivers a balanced flight that feels controlled from start to finish." Infinite (quoting Westside): "a modern evolution of the original Giant … adapted to create a smoother, more controlled flight that emphasizes carry and shot shaping over pure overstability … beadless … intermediate to advanced." Copy and numbers agree. **Label contradiction, same numbers:** Infinite labels it "Overstable"; Westside's copy says it emphasizes shot shaping "over pure overstability," and the DiscIt catalog says "Stable."
- **The original Giant's numbers are inconsistent on Westside's own site (not in this batch, recorded for whoever reviews the Giant):** the Reborn page says the original Giant is **14/4/0/3.5**; Westside's own Giant page prints **13/4/0/3.5** (the fetch step also noted a menu listing "14"); the Atlas and Infinite print 13/4/0/3.5; one retailer search summary says 12/4/0/4 (unverified). Speed 13 vs 14 is outside this review's scope (turn and fade agree at 0/3.5), but the Giant is worth a look in its own batch.
- **Retailer:** Infinite lists 12/6/-0.5/2 with **one review** (4 stars); the VIP page's reviewer numbers are just the display. Marshall Street has Tournament and VIP product pages; no per-disc flight source is stored in the Atlas.
- **Community (one review):** Infinite VIP page, CalebBarker (intermediate, "Class 5," July 1, 2026, 375 ft average, 4 stars): "can bomb pretty well if you can get it to flip," "not beginner friendly," flight characterized as "slightly overstable," about 400 ft on one throw. Search-summary retailer text (spot-check): "an entirely new shape with a wider diameter, yielding massively more glide, less stability, and vastly improved workability."
- sources:
  - {name: Westside Giant Reborn collection page (12/6/-0.5/2; contrasts the original Giant), url: https://westsidediscs.com/collections/giant-reborn, type: manufacturer, weight: 1.0}
  - {name: Westside Giant collection page (13/4/0/3.5; for the original-Giant inconsistency), url: https://westsidediscs.com/collections/giant, type: manufacturer, weight: 0.2}
  - {name: Infinite Discs Giant Reborn (listing 12/6/-0.5/2 "Overstable"; one review), url: https://infinitediscs.com/westside-giant-reborn, type: retailer, weight: 0.4}
  - {name: Infinite Discs VIP Giant Reborn (one review, Jul 2026), url: https://infinitediscs.com/westside-giant-reborn/vip, type: retailer, weight: 0.1}
- **confidence:** 0.4
- **consensusNote:** Manufacturer copy and numbers agree, and the one review ("slightly overstable," flips with effort) fits a -0.5 turn, 2 fade disc at an intermediate arm speed. That is all there is: a mold approved in March 2026 with one review, no named reviewer, no Marshall Street flight page for the Atlas to cite, and a label split (Infinite "Overstable," Westside's own "over pure overstability"). No contradicting evidence found, but also nothing to confirm with. Revisit after a few months of reviews.
- **plasticVariance:** Sold in VIP and Tournament (first-run VIP also listed); Westside prints one set of numbers and a retailer says Tournament has the tackier grip. Not quantified. Do not average.
- **Linked:** Giant (Atlas 13/4/0/3.5; the speed inconsistency above), World (batch 3), Harp and Gatekeeper (batch 8). The Atlas places the Reborn as the slow, glidey sibling (12/6/-0.5/2 against the Giant's 13/4/0/3.5), which is what Westside's copy says. Nothing moves.

## Enforcer — Dynamic Discs (id e861052d7f39)

- **Atlas now:** 12/4/0.5/4 (source: Marshall Street snapshot; PDGA approval 14-34, Apr 2014; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Fuzion (20 ratings) or Lucid (16); Infinite lists about 25 plastics.
- **Manufacturer:** Dynamic Discs 12/4/0.5/4, "Overstable" (collection page fetched). Copy: "You no longer need to make a choice. You don't have to sacrifice distance in order to have stability. You don't have to fear flipping over when you need a big throw. The Enforcer mixes these two needs beautifully. It will fly great into a wind. It can be turned over for a very predictable S-flight. It is a wonderful disc for a spike shot." Uses: overstable distance drives, forehands, wind-fighting shots. Infinite (quoting Dynamic): "a wide rim, high speed driver that is an overstable complement to the Trespass." Copy and numbers agree; **mild tension in the copy itself:** "can be turned over for a very predictable S-flight" sits oddly beside +0.5 turn, but it is conditioned on a big arm and fits the Fuzion reviewers' "beat into a perfect flip up to flat." Infinite label "Very Overstable."
- **Retailer:** Infinite reviewer numbers **12/4.1/0.3/3.9 (61 reviews, 4.74 stars)**; Lucid page 12/4/0.4/4 (16 ratings); Fuzion page 12/4/0.4/4 (20 ratings). Within 0.2 on turn and 0.1 on fade on all three; the shrinkage check (Evidence limits) says the raw Lucid mean is 0.27 and the raw Fuzion mean 0.33, still within 0.25 of the printed 0.5. Marshall Street 12/4/0.5/4 (baseline). Puttheads flight chart: 12/4/0.5/4, "very overstable," "built for wind, torque, and power" (templated).
- **Community:** Infinite Lucid reviewers (16, 2014-2020; 13 numeric: turn 0.5 in 9, 0 in 2, -0.5 in 2; fade 4 in 10, 3-3.5 in 2, 4.5 in 1): "slightly more over stable than the staple Destroyer … great carry and reliable fade" (intermediate); "flies straight for 70% of its flight and then begins a reliable fade" (advanced, ~350 ft); "at sea level less overstable than expected" (professional, -0.5/3.5); "replaced my Boss" (advanced); "guaranteed to fade right back where you want it." Fuzion reviewers (20, 2014-2022; 18 numeric: turn 0.5 in 10, 0 in 5, -0.5 in 1, 1 in 1; fade 4 in 14): "quite overstable disc that resists beating in" (intermediate, 350-375 ft); "feels very similar in the hand to a Trespass" (advanced); "will give the slightest of turns with a hard fade" once broken in (professional); "positive 0.5 turn is a bit overstated" (intermediate, compares to XCaliber); "for monster arms, or hurricane winds"; "better utilized in the utility role than for distance" (professional); one 2019 intermediate saw it "beat into a perfect flip up to flat" after months. Only two reviewers (2014) found it "too overstable."
- sources:
  - {name: Dynamic Discs Enforcer collection page (12/4/0.5/4, "Overstable"), url: https://www.dynamicdiscs.com/collections/dynamic-discs-enforcer, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Enforcer (mfr 12/4/0.5/4; reviewers 12/4.1/0.3/3.9; 61 reviews), url: https://infinitediscs.com/dynamic-discs-enforcer, type: retailer, weight: 0.5}
  - {name: Infinite Discs Lucid Enforcer (16 ratings, dated; reviewer text), url: https://infinitediscs.com/Dynamic-Discs-Enforcer/Lucid, type: retailer, weight: 0.3}
  - {name: Infinite Discs Fuzion Enforcer (20 ratings, dated; reviewer text), url: https://infinitediscs.com/Dynamic-Discs-Enforcer/Fuzion, type: retailer, weight: 0.3}
  - {name: Disc Golf Puttheads Enforcer flight chart (12/4/0.5/4; templated), url: https://www.dgputtheads.com/flight-charts/enforcer, type: community, weight: 0.1}
  - {name: Marshall Street Enforcer (12/4/0.5/4; not independent), url: https://www.marshallstreetdiscgolf.com/?s=enforcer&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, the 61-review average and 31 numeric ratings across two plastics agree on turn 0 to 0.5 and fade 4, and the text from 350-375 ft and stronger throwers describes a firm wind-fighting overstable driver that fades hard and resists beating in, which is the page copy. The raw ratings run about 0.2 under the +0.5 turn (0.27 and 0.33) because a few reviewers rate 0 or -0.5 once copies are beaten in; that is a wear effect inside the 0.5 band, and a printed +0.5 leaves little room above it, so a pooled average has more room to drift down than up. No contradicting evidence found.
- **plasticVariance:** Sold in about 25 plastics (Lucid, Fuzion, BioFuzion, Fluid, Moonshine, Lucid Air and more); Dynamic prints one set of numbers. Reviewers: Fuzion "break in very nicely" and is favored over Lucid and Moonshine by one advanced reviewer; BioFuzion "performs exceptionally in headwinds" (one reviewer). Not quantified. Do not average.
- **Linked:** Stiletto (13/3/0.5/5, the batch brief's watch; see the section above), Trespass (12/5/-1/3, applied; "overstable complement to the Trespass" fits a full point of turn between them), Defender (13/5/0/3), Destroyer (12/5/-0.5/3.5), Force (12/5/0/3), XCaliber (12/5/0/4, reviewer comparisons in both directions), PD2 (12/4/0/4, the PD2/Enforcer soft watch) and Boss (13/5/-1/3). Nothing moves.

## Sheriff — Dynamic Discs (id 29297911848f)

- **Atlas now:** 13/5/-1/2 (source: Marshall Street snapshot; PDGA approval 16-84, Dec 2016; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Lucid (44 ratings) or Fuzion (21); Dynamic prints one set of numbers across about 20 plastics.
- **Manufacturer:** Dynamic Discs 13/5/-1/2 (collection page fetched; **no stability label printed**). Copy: "A versatile high-speed disc is hard to find. They are usually too far on one side of the spectrum to be a true multi-tool … Long anhyzers, flex shots, pure hyzers; the Sheriff will arrive just in time to protect you from the onslaught of bogeys." Intended uses: "Max distance shots, long anhyzers and flex shots." Infinite (quoting Dynamic): "a versatile, high-speed disc suitable for long anhyzers, flex shots, straight distance shots, and pure hyzers"; label "Stable." Copy and numbers agree.
- **Retailer:** Infinite reviewer numbers **12.9/5.1/-1.1/2 (85 reviews, 4.66 stars)**; Lucid page 13/5.1/-1.1/2 (44 ratings); Fuzion page 12.8/5.1/-1/2 (21 ratings). Turn within 0.1, fade exact on all three. Marshall Street 13/5/-1/2 (baseline).
- **Community:** Infinite Lucid reviewers (41 text reviews, 2017-2024; mostly intermediate or advanced): ratings overwhelmingly 13/5/-1/2, with a spread both ways (0/3 and 0/1.5 at one end; -2/2 and -1.5/2 at the other). "Slightly flippy … gets reliable max distance"; "holds a LONG straight line with reliable fade" (advanced); "very small amount of turn but goes pretty darn straight"; "flies like a broke in destroyer … more glide … great flick disc" and "like a souped up Innova Beast"; "most controllable distance driver I have ever thrown … don't expect huge sweeping fade" (advanced, ~400 ft); "fade fade fade … too much disc for me" (one intermediate, 0/3) against "flippiest disc … use for rollers" (one beginner, -2); "maddeningly inconsistent from disc to disc"; "gets very understable after beaten in" (professional, 400+ ft); "slower arm speeds … reliably overstable … higher arm speeds … hyzerflip" (advanced, an explicit arm-speed split). Fuzion reviewers (21, 2017-2022): raw mean turn -1.05, fade 2.0 (16 of 21 at -1, 17 of 21 at fade 2): "felt like a beat in Destroyer … flip up, push and finish forward"; "held straight longer than Shryke" (advanced, 375 ft); "a little more overstable than described"; "turns significantly mid flight" at 168 g (beginner); "528 feet" on a first throw (advanced).
- sources:
  - {name: Dynamic Discs Sheriff collection page (13/5/-1/2), url: https://www.dynamicdiscs.com/collections/dynamic-discs-sheriff, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Sheriff (mfr 13/5/-1/2; reviewers 12.9/5.1/-1.1/2; 85 reviews), url: https://infinitediscs.com/dynamic-discs-sheriff, type: retailer, weight: 0.5}
  - {name: Infinite Discs Lucid Sheriff (44 ratings, dated; reviewer text), url: https://infinitediscs.com/Dynamic-Discs-Sheriff/Lucid, type: retailer, weight: 0.3}
  - {name: Infinite Discs Fuzion Sheriff (21 ratings, dated; reviewer text), url: https://infinitediscs.com/Dynamic-Discs-Sheriff/Fuzion, type: retailer, weight: 0.3}
  - {name: Marshall Street Sheriff (13/5/-1/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=sheriff&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, three pooled averages (85 reviews overall, 65 ratings across two plastics) and the per-reviewer ratings agree on -1/2 to within 0.1, and the Fuzion page, with a raw mean of -1.05/2.0 from advanced and professional throwers as well as intermediates, is a real match rather than a display echo. The text splits in both directions by arm speed and plastic, and the advanced reviewer who states an explicit arm-speed split describes what a speed-13 -1 disc does. No contradicting evidence found.
- **plasticVariance:** Sold in about 20 plastics (Lucid, Fuzion, BioFuzion, Lucid-X and more); Dynamic prints one set of numbers. Reviewers: Lucid "inconsistent from disc to disc," beaten-in copies turn more, a stiff Lucid copy has "the most stability." The Lucid and Fuzion pages read the same (-1.1 and -1.0). Not quantified. Do not average.
- **Linked:** Trespass (12/5/-1/3; the same turn, one fade point apart; the batch 8-10 Trespass turn candidate has been applied), Defender (13/5/0/3, a full point of turn above), Destroyer (12/5/-0.5/3.5, the reviewers' comparison, "a broke-in Destroyer"), Raider (13/5/-0.5/3), Shryke (13/6/-2/2), Boss (13/5/-1/3) and Synapse (the batch 10 gated turn proposal: a Synapse at -1/3 would sit beside the Sheriff's turn). Nothing here moves.

## Nitro — MVP (id a45868cfd9c7)

- **Atlas now:** 13/4/-0.5/3 (source: Marshall Street snapshot; PDGA approval 16-47, May 2016; no override). **Proposed turn/fade:** none. Matches; evidence thin. Reference plastic: Neutron (the only plastic Infinite lists apart from a misprint listing).
- **Manufacturer:** MVP 13/4/-0.5/3, "Stable-Overstable" (`mvpdiscsports.com/discs/nitro/` fetched). Copy: "a high-speed stable-overstable distance driver … a turn-resistant profile that covers ground and guarantees a fade finish"; average players "may need lighter weights or headwinds to achieve minimal turn," skilled throwers "a workable and responsive shallow turn"; "if fully powered, its dome will provide excellent glide and cover massive distance." Retailer-quoted MVP copy (search summary, spot-check): "recommended for anyone who throws 500ft, and especially 550ft+." Copy and numbers agree. Label split, same numbers: MVP "Stable-Overstable," Infinite "Overstable," Disc Golf Dojo and Discs Unlimited "stable to overstable."
- **Retailer:** Infinite reviewer numbers **13/4.3/-0.3/2.7 (13 reviews, 4.38 stars)**; the Neutron page shows the same 13 ratings. Turn 0.2 more stable than printed and fade 0.3 under; the raw mean is -0.19/2.38 but see the era split. Marshall Street 13/4/-0.5/3 (baseline). **Retail display history:** Heartland Discs prints **13/4/0/3**; Power Grip, Disc Golf Dojo and MVP print 13/4/-0.5/3. MVP's page is the manufacturer layer and equals the Atlas.
- **Community (thirteen Neutron ratings, 2016-2025; no arm speeds, distance stated once):** two eras sit on two displays. **2016-2018 (ten ratings)**: mostly 13/5/0/2 to 13/5/0/2.5 (one -1/2, one +0.5/2, one 0/3), text "their first real stable bomber," "flies extremely similar to a brand new champion Boss" (professional), "just like a longer Photon" (intermediate, -1/2), "more turn than expected" (advanced, 0/2 at glide 3), "high-speed stability excessive even at lighter weights," "very over stable … useful for sharp turns or windy conditions." **2021-2025 (three ratings)**: 13/4/-0.5/3, 13/4/-0.5/3, and a **November 2025 advanced 400 ft reviewer at 13/4/0/3** who recommends it for 500 ft+ arms and compares it to the Sky Stone PD2 "with similar flight and stability." The older ratings sit on an older display (glide 5, fade 2) that this page no longer carries; they are not evidence against -0.5/3.
- sources:
  - {name: MVP Nitro page (13/4/-0.5/3, Stable-Overstable), url: https://mvpdiscsports.com/discs/nitro/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Nitro (mfr 13/4/-0.5/3; reviewers 13/4.3/-0.3/2.7; 13 reviews), url: https://infinitediscs.com/mvp-nitro, type: retailer, weight: 0.5}
  - {name: Infinite Discs Neutron Nitro (13 ratings, dated; reviewer text), url: https://infinitediscs.com/MVP-Nitro/Neutron, type: retailer, weight: 0.3}
  - {name: Power Grip Neutron Nitro (13/4/-0.5/3 and MVP copy), url: https://www.powergripusa.com/products/mvp-disc-sports-neutron-nitro?variant=50456967217489, type: retailer, weight: 0.1}
  - {name: Heartland Discs Neutron Nitro (prints 13/4/0/3; spot-check), url: https://heartlanddiscs.com/products/mvp-neutron-nitro, type: retailer, weight: 0.1}
  - {name: Marshall Street Nitro (13/4/-0.5/3; not independent), url: https://www.marshallstreetdiscgolf.com/?s=nitro&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.55
- **consensusNote:** Manufacturer copy and the three most recent ratings agree on a high-power, stable-to-overstable disc with a late fade, and reviewers split by arm speed in the way MVP's copy predicts. Thirteen ratings, of which only three sit on today's display and none states an arm speed, is too little to test -0.5 against 0, and the one deviation (the 2025 reviewer at 0 turn) is a single 400 ft thrower whose text is about stability, not turn. No contradicting evidence found; held at 0.55 because the pool is thin and spans two displays. **Not a candidate.** If a future sample of post-2021 ratings keeps reading 0, the question would be Nitro turn -0.5 → 0 (|Δ| 0.5), reviewed with the Tesla/Volt items.
- **plasticVariance:** Only Neutron (and misprints) listed; MVP prints one set of numbers. Reviewers: heavier weights read more overstable (MVP's own copy recommends lighter weights for average arms). Not quantified. Do not average.
- **Linked:** Photon (11/5/-1/2.5, "longer Photon"), Tesla (9/5/-1/2, open candidate unchanged), Volt (8/5/-0.5/2, soft watch unchanged), Boss (13/5/-1/3), PD2 (12/4/0/4, see the soft-watch note above), Nuke (13/5/-1/3) and Delirium/Dimension (batch 12 linked set). Nothing moves.

## Saint — Latitude 64 (id ab157f6f4187)

- **Atlas now:** 9/7/-1/2 (source: Marshall Street snapshot; PDGA approval 12-25, May 2012; no override). **Proposed turn/fade:** none. Matches. **Soft watch, not a candidate:** turn -1 → -1.5 (|Δ| 0.5). Reference plastic (assumed most-thrown): Opto (56 ratings; Gold Line has 42; about 20 plastics).
- **Manufacturer:** Latitude 64 9/7/-1/2, "Understable" (collection page fetched). Copy: "Saint is a highly praised control driver – both among amateurs and pros. When you need a disc with good distance and perfect accuracy the Saint will deliver. Saint will be a straight shooter for drives up to 350 ft and has excellent glide." Copy and numbers agree. **Label contradictions, same numbers:** Latitude "Understable"; Infinite "Stable"; Puttheads "stable to slightly understable"; **Infinite's description (quoting Latitude) calls it "a slight S curve with a slightly overstable net result … slightly longer River."** The "overstable net result" wording is the one that does not fit -1 turn with fade 2 on a glide-7 disc and is not on Latitude's collection page.
- **Retailer:** Infinite reviewer numbers **9/6.7/-1.4/1.9 (173 reviews, 4.57 stars)**; Opto page 9/6.7/-1.3/1.9 (56 ratings); Gold Line page 9/6.8/-1.3/1.9 (42 ratings). Turn 0.3-0.4 more understable than printed on all three, fade 0.1 under; glide 0.2-0.3 under 7 (outside scope). Marshall Street 9/7/-1/2 (baseline). **The offset is not an anchoring artifact:** per-reviewer sliders start from the displayed -1/2 and the pools still land away from it, and the shrinkage check says printed averages understate the raw deviation.
- **Community (raw tallies by hand from the fetch-step lists; approximate, spot-check):** Opto, 45 numeric ratings 2015-2026: mean **-1.42/1.88**; the 21 ratings since 2018 average **-1.74/1.81**, the earlier 24 **-1.15/1.94**. Gold Line, 29 numeric ratings 2015-2022: mean **-1.26/1.69**. By skill: Opto advanced/professional (7) about **-1.5**; Gold Line advanced/professional (about 8) about **-1.0 to -1.2**; the -2 to -2.5 ratings come mostly from beginners and intermediates. Text: "flippy is an understatement" and "doesn't really fly like the numbers would suggest" (Opto, beginners and intermediates, 2019-2022); "good flippy 9 speed, extremely glidey" (2024); "cheat code for distance" at 200 ft (beginner, April 2026, rated -2.5/1.5); "money hyzer-flip disc after breaking in" (Gold Line); "goes very straight, a little fade at the end" (beginner, -2/2); "the longest straight flying disc I've thrown" (advanced, 380-400 ft, Gold Line, -1/2); "criticized for false 'overstable' marketing; actually quite sensitive to angle" (professional, Gold Line, -2/2); "Opto more overstable than Gold Line" (intermediate, 2018, the only plastic-direct comparison); "comparable to Innova's Savant" and "less stable than Escape" (Atlas Savant 9/5/-1/2, Escape 9/5/-1/2); "dumps rather than sustains distance" (intermediate, 10/5/-2/2).
- sources:
  - {name: Latitude 64 Saint collection page (9/7/-1/2, understable), url: https://latitude64.com/collections/saint, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Saint (mfr 9/7/-1/2; reviewers 9/6.7/-1.4/1.9; 173 reviews), url: https://infinitediscs.com/latitude-64-saint, type: retailer, weight: 0.5}
  - {name: Infinite Discs Opto Saint (56 ratings, dated; reviewer text), url: https://infinitediscs.com/Latitude-64-Saint/Opto, type: retailer, weight: 0.3}
  - {name: Infinite Discs Gold Line Saint (42 ratings, dated; reviewer text), url: https://infinitediscs.com/Latitude-64-Saint/Gold-Line, type: retailer, weight: 0.3}
  - {name: Disc Golf Puttheads Saint flight chart ("stable to slightly understable"; templated), url: https://www.dgputtheads.com/flight-charts/saint, type: community, weight: 0.1}
  - {name: Marshall Street Saint (9/7/-1/2; not independent), url: https://www.marshallstreetdiscgolf.com/?s=saint&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** Manufacturer, pooled averages on both plastics and the text agree on a straight-to-understable, very glidey control driver, and on fade 2 (every pool 1.9, raw 1.7-1.9), so the fade holds. On turn, the pools sit 0.3-0.4 under the printed -1 on 271 ratings overall, but the gap is mostly beginners and intermediates (200-325 ft) rating -2 on the Opto, while advanced and professional throwers on both plastics read -1 to -1.5. For a glide-7 nine-speed that is the pattern a printed -1 produces, and Latitude's "straight shooter for drives up to 350 ft" copy is explicitly speed-qualified. **Held as a soft watch, not a candidate:** the skill-normalized read sits at about -1.0 to -1.5, so -1 is inside it, and the Gold Line (the second most-thrown plastic) reads closest to print. If a skill-stratified sample ever shows the Opto advanced group at -1.5 or more, the candidate would be **turn -1 → -1.5 (|Δ| 0.5, not gated)**.
- **plasticVariance:** Sold in about 20 plastics (Opto, Gold Line, Frost Line, Opto Air, Retro, Zero Gravity and more). One reviewer (2018) says Opto is more overstable than Gold Line; the reviewer data show no such gap on average (Opto -1.4, Gold Line -1.3, within noise), and a Gold Line reviewer says it "becomes ideal understable disc when beaten in." Not quantified. Do not average.
- **Linked:** **Fury (Atlas 9/6/-2/2; the batch 8 open candidate fade 2 → 1.5 is unaffected: every Saint pool puts the Saint's fade at 1.9 and the Fury pools put the Fury at 1.3-1.6, so the Fury sitting below the Saint on fade is what the data say)**, River (7/7/-1/1, "slightly longer River"), Falchion (8/5/-1/2), Savant (9/5/-1/2), Escape (9/5/-1/2), Flow (11/6/-0.5/2), Diamond (8/6/-3/1) and Jade (9/6/-2/1). A Saint at -1.5 would leave the Fury ("slightly more understable") at a half-point gap rather than a full one and would not change the River ordering. Nothing moves.

## Nuke OS — Discraft (id 60d1ded9d2cf)

- **Atlas now:** 13/4/0/4 (source: Marshall Street snapshot; PDGA approval 11-23, Jun 2011; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): ESP (Z and Titanium print the same numbers; Infinite lists about 20 plastic variants). **Linked to the Nuke: re-checked together in the section above; neither moves.**
- **Manufacturer:** Discraft 13/4/0/4, **stability 2.2, "Over Stable"** (`www.team.discraft.com/discs/nuke-os` fetched). Copy: "Big D for big arms! Created for expert players and windy conditions, NUKE OS (Over Stable) is a super fast driver that rewards power throwers with insane distance potential. Will finish on a hyzer even in strong winds, and offers the most dependable consistency of any high speed driver on the market." Copy and numbers agree. Infinite (quoting Discraft): "an extremely stable variant … maintains the original Nuke's thick 2.5 cm rim." Infinite label "Very Overstable."
- **Retailer:** Infinite reviewer numbers **13/4/0/4.1 (64 reviews, 4.45 stars)**; ESP page 13/4/0/4 (5 ratings, all exactly at the display). Exact on turn, fade within 0.1. Marshall Street 13/4/0/4 (baseline).
- **Community (five ESP ratings, 2020-2024; four advanced, one intermediate):** all five at 0/4, so the page is the display. Text: "extremely overstable Nuke … utility driving, skips, tomahawks; challenging grip for smaller hands" (advanced, 2024); "functions as control rather than distance driver" (advanced); "effective for spike and skip shots; limited versatility" (advanced); "about 350 feet … consistency and reliability in headwinds" (advanced); "extremely overstable; difficult application for intermediate-level throwers" (intermediate). No reviewer says it turns and none says it fades less than 4.
- sources:
  - {name: Discraft Nuke OS team page (13/4/0/4, stability 2.2), url: https://www.team.discraft.com/discs/nuke-os, type: manufacturer, weight: 1.0}
  - {name: Discraft Nuke team page (13/5/-1/3, stability 1.6; re-read), url: https://www.team.discraft.com/discs/nuke, type: manufacturer, weight: 0.5}
  - {name: Infinite Discs Nuke OS (mfr 13/4/0/4; reviewers 13/4/0/4.1; 64 reviews), url: https://infinitediscs.com/discraft-nuke-os, type: retailer, weight: 0.5}
  - {name: Infinite Discs ESP Nuke OS (5 ratings, dated; reviewer text), url: https://infinitediscs.com/Discraft-Nuke-OS/ESP, type: retailer, weight: 0.2}
  - {name: Marshall Street Nuke OS (13/4/0/4; not independent), url: https://www.marshallstreetdiscgolf.com/?s=nuke+os&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.7
- **consensusNote:** Manufacturer (2.2, "Over Stable," copy that says it finishes on a hyzer in strong winds), the 64-review average and five advanced-leaning throwers' text all describe an extremely overstable power driver. The ESP page cannot test the numbers (all five ratings are the display), so the weight rests on the manufacturer and the 64-review mold average. No contradicting evidence found.
- **plasticVariance:** Sold in ESP, Z, Titanium (plus FLX and Lite variants), Cryztal and specials; Discraft prints one set of numbers and 2.2. Not quantified. Do not average.
- **Linked:** **Nuke (13/5/-1/3; re-checked above)**, Force (12/5/0/3, 2.0), Surge (11/5/-1/3, 1.7), Zeus, Nuke SS (13/5/-3/3) and XCaliber (12/5/0/4, the Innova counterpart). The Nuke OS sits at the overstable end of the family on both scales. Nothing moves.

## XCaliber — Innova (id 4d56935c291d)

- **Atlas now:** 12/5/0/4 (source: Marshall Street snapshot; PDGA approval 08-09, Mar 2008; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Star (43 ratings; Champion also sold, plus Halo Star and Echo Star).
- **Manufacturer:** Innova 12/5/0/4 (`innovadiscs.com/disc/xcaliber/` fetched). **Innova's page prints no stability label** (the fetch step wrote "Stable (implied)"; that is the summarizer's inference, not Innova's wording). Copy: "The XCaliber is extremely fast with glide and stability. The XCaliber achieves maximum distance when thrown low, flat, and hard. This is the one for confident bombs in windy conditions." Copy and numbers agree. Infinite label "Very Overstable"; Puttheads (Maredith, October 2025, templated) "very overstable … built for spike hyzers and flex lines"; Infinite's description (older Innova copy): "a low-profile, wide-rimmed disc made for flying at high speed and keeping a nice glide … anhyzer shots and S-curves."
- **Retailer:** Infinite reviewer numbers **12/4.9/-0.1/3.8 (82 reviews, 4.43 stars)**; Star page 12/4.8/0/3.9 (43 ratings). Turn within 0.1, fade within 0.2 of 4. Marshall Street 12/5/0/4 (baseline).
- **Community:** Infinite Star-page reviewers (43, 2012-2025; mostly intermediate, with advanced, professional and beginner reviewers): "a longer firebird" (advanced, 2020; intermediate, 2019), "a faster firebird with more glide" (beginner), "a beefier destroyer" (advanced), "much faster Innova Eagle … beat in and it will still remain plenty stable" (advanced), "similar to the Dynamic Discs Enforcer … mostly utility oriented" (intermediate), "more reliably overstable than PD2s" (professional, 325-375 ft forehands), "ridiculously overstable fast driver," "total meathook," "almost impossible (for me) to turn over, it will always come back and fade hard," "throw it on anhyzer and it will always hyzer out" (professional), "It will do exactly what the numbers say" (intermediate, 275 ft, February 2025). Dissent, all few: "both of my 175 g Stars have not flown as advertised" (intermediate), "hooks a lot and not as predictable as I hoped" (beginner), "cannot seem to get a CONSISTENT FLIGHT … hard fade in exactly the same spot" (advanced), "does nothing but turn … finishes going 90 degrees" (advanced; a meathook description, not a turn one). No reviewer reports turn.
- sources:
  - {name: Innova XCaliber page (12/5/0/4; no stability label), url: https://www.innovadiscs.com/disc/xcaliber/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs X-Caliber (mfr 12/5/0/4; reviewers 12/4.9/-0.1/3.8; 82 reviews), url: https://infinitediscs.com/Innova-X-Caliber, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star X-Caliber (43 ratings, dated; reviewer text), url: https://infinitediscs.com/Innova-X-Caliber/Star, type: retailer, weight: 0.3}
  - {name: Disc Golf Puttheads X-Caliber flight chart (templated; Maredith, Oct 2025), url: https://www.dgputtheads.com/flight-charts/x-caliber, type: community, weight: 0.1}
  - {name: Marshall Street XCaliber (12/5/0/4; not independent), url: https://www.marshallstreetdiscgolf.com/?s=xcaliber&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, an 82-review mold average and 43 Star ratings spanning thirteen years agree on 0/4 (turn within 0.1, fade within 0.2), and the repeated comparisons, a faster, glidier Firebird and a beefier Destroyer, are what the Atlas has (Firebird 9/3/0/4, Destroyer 12/5/-0.5/3.5). The fade pooling just under 4 (3.8-3.9) is the usual drift below a printed 4. No contradicting evidence found. The batch 12 Quasar item, which names the XCaliber as a comparison disc, is unaffected: the XCaliber stays at 0/4 and the Quasar items (turn 0 → -0.5 candidate, fade 3 → 3.5 soft watch) are exactly as batch 12 left them.
- **plasticVariance:** Sold in Star, Champion, Halo Star, Echo Star, Moondust and many specials. Puttheads (templated): Echo Star offers slightly more glide with marginally less stability in some runs. Reviewers on other plastics were not read (Champion has its own page). Not quantified. Do not average.
- **Linked:** Firebird (9/3/0/4), Destroyer (12/5/-0.5/3.5), Enforcer (12/4/0.5/4; reviewers rank them close), Force (12/5/0/3), PD2 (12/4/0/4), Quasar (open candidate unchanged), Boss and Ape (13/5/0/4 for the Ape; Boss 13/5/-1/3). Nothing moves.

## Blade — Gateway (id 49395eb30208)

- **Atlas now:** 9/5/0/3 (source: Marshall Street snapshot; PDGA approval 19-11, Feb 2019; no override). **Proposed turn/fade:** none. Matches; evidence thin. Reference plastic (assumed most-thrown, not verified): Hyper Diamond ("HD"; the previous version) or NXT (current; no ratings yet); Diamond and HD X-Out also listed.
- **Manufacturer:** Gateway 9/5/0/3, "Overstable fairway driver" (collection page and the HD product page fetched). Copy: "The Blade is an overstable fairway driver that is the perfect option for players looking for a steady resistance to turn and a consistent finish. These are nice and flat, ideal for heavy forehand and power flex shots." **Version note, same numbers:** Gateway's collection lists **"Blade - HD" marked "NOT CURRENT VERSION"** and **"Blade - NXT" as the current version**, both at 9/5/0/3. Gotta Go Gotta Throw also sells a "Blade V2." Copy and numbers agree. Infinite label "Very Overstable."
- **Retailer:** Infinite reviewer numbers **9/4.8/-0.2/3 (14 reviews, 4.64 stars)**; Hyper Diamond page 9/4.8/-0.1/3.1 (11 ratings); NXT page 9/5/0/3 (zero ratings, display only). Marshall Street 9/5/0/3 (baseline).
- **Community (eleven HD ratings, 2019-2025; raw tallies by hand, approximate):** turn 0 in eight, -1 in three; fade 2-4 (raw mean -0.27/3.2). Overstable-side text: "the most overstable disc in the 'firebird' slot I've found" (intermediate, 0/4); "I can throw it harder into a headwind than I can my star Firebird" (advanced); "alternative to firebird, FD3, felon, raptor" (professional); "overtaken my Raptor" (intermediate); "reminded me almost exactly" of a flat-top star Firebird (beginner); a 2019 advanced reviewer: a prototype HD Blade is "basically a FAF Innova Firebird." **Understable-side text, all three -1 ratings from 2020, 2023 and 2024:** "Not as overstable as advertised … Think faster Eagle. Some noticeable turn then a solid finish" (intermediate, April 2023); "Definitely not overstable. Flies exactly like a faster Stalker" (intermediate, January 2024, -1/2); "if you have a bigger than average 400+ arm this is not going to be [an any-wind workhorse]" (professional, 2020). **The most recent review (June 2025, intermediate, 300 ft) states: "This disc has been retooled a few times … Gateway has worked its magic and tooled it to be that overstable 9 speed everyone knows and loves."** Search-summary retailer text (spot-check): compared to the Firebird and Raptor.
- sources:
  - {name: Gateway Blade collection page (9/5/0/3, Overstable; HD "not current version", NXT current), url: https://gatewaydiscsports.com/collections/blade, type: manufacturer, weight: 1.0}
  - {name: Gateway Blade HD product page (9/5/0/3, "NOT CURRENT VERSION"), url: https://gatewaydiscsports.com/products/blade-hyper-diamond, type: manufacturer, weight: 0.5}
  - {name: Infinite Discs Blade (mfr 9/5/0/3; reviewers 9/4.8/-0.2/3; 14 reviews), url: https://infinitediscs.com/gateway-blade, type: retailer, weight: 0.5}
  - {name: Infinite Discs Hyper Diamond Blade (11 ratings, dated; reviewer text), url: https://infinitediscs.com/Gateway-Blade/Hyper-Diamond, type: retailer, weight: 0.3}
  - {name: Infinite Discs NXT Blade (0 ratings), url: https://infinitediscs.com/Gateway-Blade/NXT, type: retailer, weight: 0.1}
  - {name: Marshall Street Blade (9/5/0/3; not independent), url: https://www.marshallstreetdiscgolf.com/?s=Blade&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.55
- **consensusNote:** Manufacturer (both versions at 9/5/0/3) and eight of eleven HD ratings agree on an overstable nine-speed with a firm fade, compared by reviewers with the Firebird, Raptor and FD3. The three understable-leaning ratings are the 2020-2024 ones, the latest reviewer says Gateway retooled the mold to make it the overstable disc it advertises, and Gateway now marks the HD as the superseded version, so the likeliest reading is a **mold-revision effect between production runs, not a numbers problem**. That is also why the thin sample cannot settle anything: the only current-version page (NXT) has no ratings. No contradicting evidence found for the current version; no candidate. **Hazard for anyone using older retail data:** pre-2025 HD reviews may describe a different disc from the NXT. Revisit when the NXT page has reviews.
- **plasticVariance:** Diamond, Hyper Diamond (HD, not current), NXT (current) and X-outs; Gateway prints one set of numbers across versions, and the mold revisions above are a bigger spread than plastic. Not quantified. Do not average.
- **Linked:** Firebird (9/3/0/4), Raptor (9/4/0/3), Felon (9/3/0.5/4), Lots (9/5/-1/2) and Stål (9/4/0/3), Hybrid (7/5/0/3) and Spear (9/6/-2/1, the same maker's understable nine). The Atlas places the Blade as the glidier, slightly less overstable cousin of the Firebird, which is what the overstable-side reviewers say. Nothing moves.

## Havoc — Latitude 64 (id d2bdb3029918)

- **Atlas now:** 13/5/-1/3 (source: Marshall Street snapshot; PDGA approval 11-02, Jan 2011; no override). **Proposed turn/fade:** none. Evidence too thin to call. **Open candidate: turn -1 → -1.5** (|Δ| = 0.5, below the review gate); fade 3 → 2.5 is a secondary candidate only if the turn moves. Reference plastic (assumed most-thrown): Opto (26 ratings; Gold Line has 12; 14+ plastics).
- **Manufacturer:** Latitude 64 13/5/-1/3, "Understable" (collection page and Opto product page both fetched). Copy: "Havoc is a high-speed driver that will give you the distance you need on the course as it never seems to slow down"; "easy to throw," for "advanced and pro players," a "bullet" shaped rim giving "remarkable speed and glide," and "initially meant to be a less stable Halo." The Opto product page: a "fast but friendly" driver, "a slightly more understable flight," the -1 turn "permits the disc to flip up to flat easily," fade 3 "provides a predictable finish, preventing the disc from turning over completely on power shots." Copy and numbers agree. **Label contradictions, same numbers:** Latitude "Understable"; Infinite "Overstable" (its description, quoting Latitude: "an overstable high-speed driver good for forehand throws for intermediate players, and backhand throws for advanced disc golfers … a slight degree of turn (-1) but strong fade (3)"); Puttheads "Overstable." Latitude's own words and its own label point toward understable; the retailer label is the outlier.
- **Retailer:** Infinite reviewer numbers **12.9/5.1/-1.3/2.6 (55 reviews, 4.62 stars)**; Opto page 12.9/5.1/-1.4/2.5 (26 reviews); Gold Line page 12.9/5.1/-1/2.9 (12 reviews). Turn 0.3-0.4 more understable than printed on the Opto and the mold average, fade 0.4-0.5 under on the same two; the Gold Line page reads the display. The shrinkage check puts the raw Opto mean at **-1.66/2.2** (Evidence limits), so the printed Opto number understates the deviation. Marshall Street 13/5/-1/3 (baseline).
- **Community (raw Opto ratings, 22 numeric, 2014-2022; hand tallies, approximate):** mean turn **-1.66** (median -1.5), fade **2.2** (median 2); advanced reviewers (9) **-1.89/2.17**; beginners and intermediates (13) **-1.5/2.23**; the seven 2020-2022 ratings **-1.5/2.1**. Twenty of 22 are at or beyond -1; fifteen at -1.5 or beyond. Text: "DRAMATICALLY more understable than flight numbers indicate … hyzerflipping is necessary" (intermediate, -3/1, 2017); "nothing like its numbers suggest … numbers deceive many buyers" (advanced, 2021); "flight numbers feel off … much more turn and less fade … a ton of glide" (advanced, 420 ft max, 2022); "flight numbers are not correct … much closer to a Shryke … can get it to turn" (intermediate, 2022); "little more turn than numbers indicate" (advanced, 2019); "would flip into roller at 70% power" (advanced, 2016); "F L I P P Y … seriously fast and far platform" (beginner, 2020); "reminds me of the Destiny" (intermediate); "easy to turn over … 400+ feet brand new" (advanced, -3/1); counter-voices: "Latitude is spot on" (beginner, -1/3, 2017); "great disc to throw hard and flow fairly straight, will reward you if thrown flat" (intermediate, -1/3, 2020); "pretty straight flyer … good for narrow fairways" (beginner, -0.5/1.5). **Gold Line (12 reviewers, 2012-2021; eight with ratings, raw -1.06/2.88):** seven of eight at -1/3 (the display) but the text says "my gold line flies more under stable than I originally thought it would … my roller disc" (advanced, 450 ft on a hyzer flip), "a little more flippy than the description states" (advanced), "discs eventually turn into rollers with use," "better suited for slower arm speeds." Search-summary retailer text (spot-check): "the optos are less stable and a little more squirrely than the goldline … they need a little more hyzer to ride flat but they make a very nice long turnover disc," and "some players have observed … flies flippier than the published flight numbers."
- sources:
  - {name: Latitude 64 Havoc collection page (13/5/-1/3, understable), url: https://latitude64.com/collections/havoc, type: manufacturer, weight: 1.0}
  - {name: Latitude 64 Opto Havoc product page (13/5/-1/3, understable; "flip up to flat easily"), url: https://latitude64.com/products/opto-havoc, type: manufacturer, weight: 0.5}
  - {name: Infinite Discs Havoc (mfr 13/5/-1/3; reviewers 12.9/5.1/-1.3/2.6; 55 reviews), url: https://infinitediscs.com/latitude-64-havoc, type: retailer, weight: 0.5}
  - {name: Infinite Discs Opto Havoc (26 ratings, dated; reviewer text), url: https://infinitediscs.com/Latitude-64-Havoc/Opto, type: retailer, weight: 0.3}
  - {name: Infinite Discs Gold Line Havoc (12 ratings, dated; reviewer text), url: https://infinitediscs.com/Latitude-64-Havoc/Gold-Line, type: retailer, weight: 0.2}
  - {name: Disc Golf Puttheads Havoc flight chart (13/5/-1/3, "overstable"; templated), url: https://www.dgputtheads.com/flight-charts/havoc, type: community, weight: 0.1}
  - {name: Marshall Street Havoc (13/5/-1/3; not independent), url: https://www.marshallstreetdiscgolf.com/?s=havoc&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.5
- **consensusNote:** Manufacturer says -1/3 and calls it understable and easy to flip, and every pooled layer (the Opto raw ratings, the mold-level 55-review average and the text from advanced throwers) says the disc turns more and fades less than the numbers: advanced reviewers on the Opto read -1.9 and fade 2.2, and several name the Shryke (Atlas 13/6/-2/2) as the closer flight. This is not an anchoring artifact: the sliders start at -1/3, the pools land away from it, and the shrinkage check says the raw deviation is larger than the printed one. **Held back because:** Latitude's own number and copy say -1 (and "flip up to flat easily" is not far from -1.5), the deviation is concentrated on one plastic (the Gold Line page sits on the display, though its text leans the same way), no reviewer states an arm speed (distances only: 350-500 ft claims), no named long-form review was readable, and **the newest Opto rating is November 2022** (no post-2022 sample exists). If you want observed flight over the printed number, **turn -1 → -1.5 is the single candidate** (the Opto advanced median is -2, but -2 would be |Δ| 1.0 and gated; I would not go there). Fade 3 → 2.5 (raw Opto 2.2, mold pooled 2.6, Gold Line 2.9) is a secondary candidate only if the turn moves, and I would not move the fade alone. It needs a named reviewer with an arm speed, or a post-2022 Opto sample, to become a proposal.
- **plasticVariance:** Sold in Opto, Gold Line, Frost Line, Opto Air, Opto-X, Opto Ice and many specials; Latitude prints one set of numbers. The evidence is that the Opto reads more understable than the Gold Line (-1.7 against about -1.1 raw), against the usual expectation that Opto is the firmer plastic, and one reviewer says beaten-in copies become rollers. Not quantified. Do not average.
- **Linked, review as a set if it moves:** **Halo (Atlas 13/5/-0.5/3; Latitude says the Havoc was "initially meant to be a less stable Halo," so a Havoc at -1.5 would widen the pair to a full point; the Halo's own batch 3 evidence does not move it)**, Shryke (13/6/-2/2, the reviewers' comparison), Sheriff (13/5/-1/2, above), Boss (13/5/-1/3), Wraith (11/5/-1/3), Nuke (13/5/-1/3), Ballista (14/5/-1/3), Ballista Pro (14/4/0/3, "slightly more understable than the Stiletto or Ballista Pro," which holds either way), Stiletto (13/3/0.5/5, far above), Destroyer (12/5/-0.5/3.5). A Havoc at -1.5/2.5 would sit between Sheriff and Shryke, which is where reviewers put it.

---

## Batch 15 report (for Freddy)

**Decided items recorded first:** the three standing rules, plus D2 turn and D1 fade carried parked (owner decisions, Oct 3, 2026). Nothing in this batch touches either.

**Proposed changes (0).** All ten Atlas numbers equal the current manufacturer pages (Giant Reborn from Westside's own collection page, Blade from Gateway's collection page).

**Open candidates (1 new), not gated:**
- **Havoc turn -1 → -1.5** (|Δ| 0.5; taking the Opto advanced median, -2, would be gated and I would not go there). Twenty-two raw Opto ratings average -1.66 turn / 2.2 fade (advanced reviewers -1.9), the Infinite mold average (55 reviews) is -1.3/2.6 even after shrinkage toward the display, and several advanced reviewers say it flies "nothing like its numbers suggest" and closer to a Shryke; Latitude's own label is "Understable" and its copy says the disc "flip[s] up to flat easily," which leans the same way. Held back: Latitude's printed -1/3 is the manufacturer number, the Gold Line page sits on the display (raw -1.06/2.88), no arm speeds, no named long-form review, and the newest Opto rating is November 2022. Fade 3 → 2.5 is secondary and only if the turn moves. Review Halo (would not move; the pair would widen to a full point), Shryke, Sheriff and Boss with it. **Confidence 0.5.**

**Soft watches (not candidates):**
- **Saint turn -1 → -1.5 (|Δ| 0.5):** pooled -1.3 to -1.4 on 271 ratings, but the gap is mostly beginners and intermediates on the Opto; advanced and professional reviewers read -1.0 to -1.5, and the Gold Line sits close to print. Fade 2 is solid (every pool 1.9). **The Fury fade 2 → 1.5 open candidate is unaffected** (Saint pools 1.9, Fury pools 1.3-1.6).
- **Nitro turn -0.5 → 0 (|Δ| 0.5):** only a November 2025 advanced reviewer reads 0; thirteen ratings span two displays and none states an arm speed. Not a candidate.
- **Blade mold-revision hazard (no number change):** Gateway's own page marks the HD "NOT CURRENT VERSION" and sells NXT, and a June 2025 reviewer says the mold was "retooled a few times." The 2020-2024 HD ratings that read less overstable may describe an older mold shape. Re-check when the NXT page has reviews.

**Confirmed as-is (7):** Sheriff, Enforcer, XCaliber (0.75); Stål, Nuke OS (0.7); Saint (0.6, with the soft watch above); Nitro, Blade (0.55, thin). Confirmations mean "no contradicting evidence found," not independent community verification. **Nitro and Blade are the least firm**: thirteen and eleven ratings, no stated arm speeds, and a display or mold-version change inside the pool. The Nuke/Nuke OS re-check (the batch brief's watch) found neither moves; the Nuke stays confirmed as-is.

**Too thin to call (2):** Havoc (above) and **Giant Reborn**. The Reborn is a mold approved in March 2026 with a single review (July 2026, intermediate, 375 ft, 4 stars, "slightly overstable"), manufacturer copy and numbers that agree, no Marshall Street flight page (the Atlas entry has no flight source link), and a label split (Infinite "Overstable," Westside's own "over pure overstability," DiscIt "Stable"). Nothing contradicts and nothing confirms.

**Enforcer/Stiletto (the batch brief's watch):** nothing in the Enforcer evidence bears on a change to either disc. No Enforcer reviewer mentions the Stiletto; the Enforcer's reviewer comparisons (Destroyer, Trespass, XCaliber, Boss) are all consistent with the Atlas, and the PD2/Enforcer soft watch gains one more recorded datum (a Nitro reviewer calling the Nitro and PD2 similar), nothing more. **The brief's "Lat64" attribution for the Enforcer is a mistake: it is a Dynamic Discs mold.**

**Catalog notes (not identity flags):** Westside's own Giant Reborn page quotes the original Giant at **14/4/0/3.5** while its Giant page and the Atlas say **13/4/0/3.5** (one retailer summary says 12/4/0/4; unverified). Heartland Discs prints the Nitro at 13/4/0/3 against MVP's 13/4/-0.5/3. Neither moves anything here; both are spot-check items.

**Methodological finding (Infinite pages, extends batch 14):** the shrinkage hypothesis fits all four further pages I could test (Enforcer Lucid and Fuzion nearly exactly, Blade HD and Havoc Opto approximately); the first page with fewer than ten ratings (Nuke OS ESP) could not test it because all five ratings equal the display. Printed Infinite plastic-page averages therefore understate deviation from the display, most on pages with under about 25 ratings. Still my arithmetic on fetch-step data.

**Spot-checks needed before any override source note:** the Havoc Opto per-reviewer ratings and my tallies (22 numeric, -1.66/2.2; advanced -1.89) and the Gold Line eight (-1.06/2.88); the Saint Opto and Gold Line tallies and the skill split (hand tallies, approximate); the Blade HD ratings and the "retooled a few times" quote (June 2025); Westside's Giant 14 versus 13 speed; the Heartland Nitro 13/4/0/3 listing and the "13 | 4 | 0 | 4" search-summary figure; the Sheriff Fuzion raw mean (-1.05/2.0); the shrinkage arithmetic above; the search-summary retailer quotes (Havoc "optos are less stable … than the goldline," Giant Reborn "massively more glide, less stability"); and any quote taken via the summarizing fetch.

**Process notes for the next batch**

- Next by `featured.js` order after Havoc: **Maverick (Dynamic Discs)** is the next entry I saw; I read the live file only through Maverick, so re-verify the following nine against `public/featured.js` before starting. Maverick (Atlas 7/4/-1.5/2) links to the Dynamic set (Truth, Escape, Judge, Sheriff, Enforcer), none of which moved this batch. The original Giant (Westside) is worth its own check for the 14 versus 13 speed.
- **Retail-side hazard watch carried forward:** Prodigy renumbering (July 2023) for any Prodigy mold; Thought Space renumbered the Synapse once; Omega's second catalog (2/3/0/0 against 2/3/-1/1); **Gateway mold revisions (Blade; check other Gateway molds listed with "HD" and "NXT" versions, such as the Hybrid and Spear, before trusting older reviews)**.
- **Open-candidate running list (nothing applied by this lane):** open: **Predator turn +1 → 0 (gated), D2 turn 0 → -0.5 (PARKED, owner decision Oct 3, 2026, not closed), D1 fade 4 → 3.5 (PARKED, thin evidence, owner decision Oct 3, 2026), Defy turn -1 → -0.5, Havoc turn -1 → -1.5 (new this batch)**; carried unchanged and not named in the refreshed list: **MD3 (new) fade, Tesla turn -1 → -0.5, Fury fade 2 → 1.5, Quasar turn 0 → -0.5 (batch 12, held at 0)**; stay as-is: Monarch -4, Toro +1; pending in the main tree (this tree's overrides file has neither): **Synapse turn -1, Astra turn -1.5**; applied and present in this tree: Roc 2.5, Luna 3/4/0/2, Trident 3.5, Gator 4, Trespass -1. Soft watches: Falk turn, Svea turn, A1/A2 spacing, PA3 fade, Lots turn, Voodoo fade, PD2 fade, PD2/Enforcer, Stingray Star turn, Orion LF fade, Tantrum fade, Quasar fade 3 → 3.5, D3 and F3 reviewer-versus-printed gaps, Volt Neutron turn 2024-25, **plus this batch's Saint turn, Nitro turn and Blade mold-revision hazard**. **Catalog-identity flag still open:** FD1/FD2/Instinct (batch 11). **Catalog notes:** Omega (batch 14) and Giant/Giant Reborn speed (this batch).
- **Linked sets re-checked this batch:** Nuke/Nuke OS/Force/Surge/Zeus/Nuke SS, Enforcer/Stiletto/Trespass/Defender/Destroyer/XCaliber/PD2/Boss, Sheriff/Trespass/Defender/Destroyer/Raider/Shryke/Boss/Synapse, Nitro/Photon/Tesla/Volt/Boss/PD2/Nuke, Saint/Fury/River/Falchion/Savant/Escape/Flow/Diamond/Jade, XCaliber/Firebird/Destroyer/Enforcer/Force/PD2/Quasar/Boss/Ape, Stål/Firebird/Lots/Raptor/Blade/Ahti/Pioneer, Blade/Firebird/Raptor/Felon/Hybrid/Spear, Havoc/Halo/Shryke/Sheriff/Boss/Wraith/Nuke/Ballista/Ballista Pro/Stiletto/Destroyer, Giant Reborn/Giant/World/Harp/Gatekeeper. Nothing moves beyond the one open candidate.
- Reachable manufacturer paths this batch: `kastaplast.com/en-us/products/k1-stal`, `dynamicdiscs.com/collections/dynamic-discs-{enforcer,sheriff}`, `mvpdiscsports.com/discs/nitro/`, `latitude64.com/collections/{saint,havoc}` and `latitude64.com/products/opto-havoc`, `www.team.discraft.com/discs/{nuke,nuke-os}`, `www.innovadiscs.com/disc/xcaliber/`, `gatewaydiscsports.com/collections/blade` and `/products/blade-hyper-diamond` (`/products/blade-nxt` 404s), `westsidediscs.com/collections/{giant,giant-reborn}`. Infinite slugs: Stål `/kastaplast-stal`, `/kastaplast-stal/k1` (`/Kastaplast-Stal/K1-Line` 302s); Enforcer `/dynamic-discs-enforcer`, `/Dynamic-Discs-Enforcer/{Lucid,Fuzion}`; Sheriff `/dynamic-discs-sheriff`, `/Dynamic-Discs-Sheriff/{Lucid,Fuzion}`; Nitro `/mvp-nitro`, `/MVP-Nitro/Neutron`; Saint `/latitude-64-saint`, `/Latitude-64-Saint/{Opto,Gold-Line}`; Havoc `/latitude-64-havoc`, `/Latitude-64-Havoc/{Opto,Gold-Line}`; Nuke OS `/discraft-nuke-os`, `/Discraft-Nuke-OS/ESP`; XCaliber `/Innova-X-Caliber`, `/Innova-X-Caliber/Star` (the unhyphenated forms 302); Blade `/gateway-blade`, `/Gateway-Blade/{Hyper-Diamond,NXT}`; Giant Reborn `/westside-giant-reborn`, `/westside-giant-reborn/vip`. Puttheads flight charts (`dgputtheads.com/flight-charts/{havoc,saint,enforcer,x-caliber}`) read but are templated.
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access checks the DGCR "Havoc" and "Havoc and Flow" threads and any 2023-2026 Opto Havoc sample with stated arm speeds (the Havoc turn question), then a post-2025 Nitro sample (does 0 turn hold), then the Blade NXT once it has ratings, then still the Defy, Volt, D1, D2, Tesla and MD3 items.

---

# Batch 16 (Plan 10, Phase 2)

Researched October 3, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (already up to date at `e704d34`; the queue doc is still the only locally modified file).

Molds covered, as named in the batch brief: Grym, Teebird3, Destroyer, Firebird, Thunderbird, Eagle, Leopard, Roc, Mako3, Buzzz. Atlas ids: Grym d589786b9467 (Kastaplast; Grym X a9c5133f6a9d is a separate record, not reviewed), Teebird 3 a4914f8ef694, Destroyer 3d60892b6812, Firebird ba675aed468a, Thunderbird e9a88cc4f3b1, Eagle (new) 2c73a090c48b and Eagle (old) f492945b1ff0, Leopard e5c3cc29c5a7, Roc 9152771e1f7b, Mako 3 7ba55c559b5b, Buzzz 7446eb39abe5.

**Brief corrections, recorded so they do not propagate:**
- **The batch list is not "next by `featured.js` order" in the live file.** `public/featured.js` (176 lines, read today) lists Destroyer, Buzzz, Firebird, Roc and Leopard near the top (all already covered in the pilot and batch 2; re-checked here as asked) and Thunderbird near the end (line 173). **It does not list Grym, Teebird 3, Eagle or Mako 3 at all** (they fall in the unlisted-alphabetical tail). The next unreviewed entry after Havoc is still **Maverick** (line 152), as batch 15 said. I researched the ten molds as named; if the intent was strict list order, the next ten are Maverick, Diamond, Evader, PA4, Raider, X3, Dart, Resistor, Fierce, Guld.
- **Eagle has no flight numbers in the Atlas.** Both Eagle approvals (new, 1999-03-12; old, 1983) carry none even though `flights.json` has an "Eagle" row at 7/4/-1/3 (Marshall Street). The row is evidently not attached to either approval because two approvals share the name. Innova's current Eagle page says "Approval date: 03/12/99," so the sold disc is the **Eagle (new)** record. See the Eagle section.

## Decided items and standing rules (recorded before the research)

- **Plastic baseline policy:** a mold's reference numbers are its most-thrown plastic (Star for Innova drivers). DX is the price-tier baseline but **not** the flight reference. No sales data; each entry names the reference plastic I took to be the most-thrown and marks it "assumed." **Roc is the exception worth knowing:** on Infinite, Star has five ratings and Champion zero, while DX has 80 and KC Pro 56, so DX/KC Pro are the assumed reference there.
- **Review gate:** weak evidence = no correction; |Δ| = 1.0 changes need the owner's call; record open candidates instead of proposing them.
- **Never average across plastics:** mold-level consensus plus a `plasticVariance` note.
- **Infinite anchoring (batches 14-15):** printed "Reviewer Flight Numbers" are shrunk toward the displayed numbers; I recomputed from raw per-reviewer ratings wherever they were visible and treat printed averages as understating deviation. Results for this batch in Evidence limits.
- **Carried parked items (owner decisions, Oct 3, 2026):** D2 turn 0 → -0.5 and D1 fade 4 → 3.5 stay parked. Nothing here touches either.

---

## Batch 16 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Roc | 4/4/0/2.5 (applied override) | none | **Applied fade 2.5 re-checked and supported** by fresh raw ratings (KC Pro 2.42, n=52) | 0.8 |
| Firebird | 9/3/0/4 | none | Confirmed as-is | 0.8 |
| Thunderbird | 9/5/0/2 | none | Confirmed as-is | 0.75 |
| Teebird 3 | 8/4/0/2 | none | Confirmed as-is | 0.75 |
| Leopard | 6/5/-2/1 | none | Confirmed as-is | 0.75 |
| Mako 3 | 5/5/0/0 | none | Confirmed as-is (glide hint outside scope) | 0.75 |
| Buzzz | 5/4/-1/1 | none | Confirmed as-is (soft watch: turn -1 → -0.5, pooled -0.7/-0.8) | 0.7 |
| Destroyer | 12/5/-0.5/3.5 (applied override) | none | **Applied override stands on Innova's copy; fresh ratings do not corroborate the half-steps** (they read -0.95/3.02, near Innova's -1/3) | 0.6 |
| Eagle | no numbers in the Atlas | none (catalog gap, see section) | Numbers 7/4/-1/3 confirmed by Innova and 131 reviews | 0.75 |
| Grym | 13/5/-1/2 (Infinite) | none; **open candidate turn -1 → -1.5 (ungated) or -1 → -2 (\|Δ\| = 1.0, gated)** | **Too thin to call: retailers split on the printed number and the manufacturer page could not be read** | 0.5 |

**No changes proposed. One new open candidate (Grym turn), one soft watch (Buzzz turn), one catalog gap (Eagle), one data-quality finding (Grym printed numbers split across retailers).** Both applied overrides were re-checked: **Roc fade 2.5 is supported; Destroyer -0.5/3.5 is not contradicted but its size is not corroborated either.**

## Innova fairway family re-check (Leopard / Eagle / TeeBird / Teebird 3 / Thunderbird / Firebird), done as a set

**Answer: the relative ordering holds in every layer and nothing moves.**

| Disc | Atlas (S/G/T/F) | Innova page | Infinite mold reviewer numbers | Infinite Star-page reviewer numbers |
|---|---|---|---|---|
| Leopard | 6/5/-2/1 | 6/5/-2/1 | 6/5/-1.9/1 (260) | 6/5/-1.8/1 (33) |
| Eagle | none (flights.json 7/4/-1/3) | 7/4/-1/3 | 7.1/4/-0.9/3 (131) | 7/4/-1/3 (28) |
| TeeBird | 7/5/0/2 | 7/5/0/2 (pilot) | 7/5/-0.1/2 (378, pilot) | 7/5/0/2 (105) |
| Teebird 3 | 8/4/0/2 | 8/4/0/2 | 8/4.1/-0.1/2.1 (121) | 8/4/0/2.1 (25) |
| Thunderbird | 9/5/0/2 | 9/5/0/2 | 9/4.9/-0.1/2.1 (269) | 9/5/0/2.1 (42) |
| Firebird | 9/3/0/4 | 9/3/0/4 | 9/3.1/0/3.9 (336) | 9/3.1/0/4 (63) |

- **Fade order (1 < 2 = 2 = 2 < 3 < 4) and turn order (-2 < -1 < 0, 0, 0, 0) match in all three columns.** The one place the Atlas has three discs on the same turn/fade (TeeBird, Teebird 3, Thunderbird at 0/2) is also where the pools put them (-0.1/2.0 to 2.1); their differences are speed and glide, which the map draws separately.
- **Manufacturer relationships, all consistent with the Atlas:** Teebird3, "faster with less glide, and has the same trusted turn and fade flight ratings as the original TeeBird"; Thunderbird, "the stability of a TeeBird with the speed of a Valkyrie … a seasoned Firebird with less fade"; Eagle, "the original, professional level fairway driver," best for "first headwind driver, flex shots, power turnover shots" (Infinite, quoting Innova: "slightly overstable driver with a degree of high speed turn").
- **Reviewer cross-comparisons (Infinite plastic-page text; skill given):** Eagle: "more overstable TeeBird" (intermediate), "beefy compliment to Teebird; less glide" (advanced), "TeeBird with a little flip" (advanced, 2016), "less fade than Firebird" and "fits between Firebird and Leopard3" (beginners), "a lot better consistent finish than leopard" (intermediate, DX). Thunderbird: "more stable Teebird" and "like a longer teebird" (advanced), "step down from Firebird" (advanced, 400 ft), "Firebird with slightly flattened curve" (intermediate), "better control than Destroyer" (intermediate), "mini star destroyer (a straighter one)" (advanced), "link between distance and control, between Destroyer and Teebird" (intermediate). Teebird 3: "more stable than original Teebird" and "typically flatter than Teebirds" (intermediate), "harder to turn than standard Teebird" (advanced), "nearly identical to Thunderbird; more comfortable rim" (intermediate), "slower glide than Thunderbird" (intermediate), "preferred over Eagle" (beginner, 2019). Retailer blogs (all via the summarizing fetch, spot-check): Reaper's Teebird-vs-Thunderbird piece (Silas Henson, no arm speed) calls both "slightly overstable" with identical turn/fade; Discount Disc Golf (Simon, no arm speed) says the Teebird3 has "milder high-speed turn and slightly less fade … more stable between the two," which points the opposite way from Innova's "same turn and fade" and from the Infinite pools (equal at -0.1/2.1); Sabattus (Andrew Streeter, PDGA #70397, ~300 ft) calls the Teebird "stable to overstable" and the Teebird3 "gets down to the ground a little quicker."
- **Soft observation, not a candidate:** Teebird 3 text leans slightly more stable than TeeBird (five reviewers, one blog) but the pooled ratings put them at the same turn and the same fade to within 0.1. No numeric support for moving either. Thunderbird "more overstable than expected" appears four times across the Star and Champion pages (fade 2.5-3 in about six of roughly 42 visible ratings); the pools print 2.1. Inside noise.
- **Linked, unchanged:** Savant and Undertaker (9/5/-1/2), Teebird L, Leopard 3 (7/5/-2/1), Valkyrie, Roadrunner and Gazelle (batches 3-4 sets), Boss/Wraith/Destroyer/Firebird (closed batch 5), XCaliber (batch 15, "a longer Firebird").

## Mako 3 / Buzzz re-check (the straight-mid pair), done as a set

**Answer: the ordering holds and nothing moves; one soft watch on the Buzzz turn and one out-of-scope glide hint on the Mako 3.**

- **Atlas:** Buzzz 5/4/-1/1, Mako 3 5/5/0/0. **Pooled reviewer numbers (Infinite):** Buzzz 5/4.2/-0.7/1 (594), ESP Buzzz 5/4.1/-0.8/1 (137); Mako3 5/4.3/-0.2/0.1 (362), Star 5/4.4/-0.1/0.1 (144), Champion 5/4.3/-0.1/0.1 (152). **Gaps:** the Atlas puts the Buzzz 1 turn and 1 fade from the Mako3; the pools put them 0.5-0.6 turn and 0.9 fade apart. The direction (Buzzz has the fade, the Mako3 has none) is the same in every layer.
- **Denis Flaschner (Pro, PDGA #49081; Reaper's "Mako3 vs Buzzz," via the summarizing fetch, spot-check; no arm speed):** Mako3 "little to no turn, and virtually no fade"; Buzzz "despite its -1 turn rating versus the Mako3's 0, the Buzzz can absorb a lot more speed and torque without turning over" and has "enough low speed stability to gently hyzer out of a flat shot." That is the one place a named reviewer says the Buzzz's printed -1 overstates its turn; the Infinite pools (-0.7, -0.8 on 731 ratings) lean the same way. Discraft prints -1 and its copy says "ultra-dependable, straight flying midrange."
- **Soft watch, not a candidate:** **Buzzz turn -1 → -0.5 (|Δ| 0.5, not gated).** The pooled -0.7/-0.8 comes from large pools that mix plastics (Buzzz is listed in 106 plastic variations, including Big Z and Jawbreaker), so the shrinkage effect is negligible and the 0.2-0.3 gap is real, but it is small, inside one plastic's spread, and no reviewer states an arm speed. A Buzzz at -0.5 would shrink the Buzzz/Mako3 turn gap from 1 to 0.5, about what the pooled numbers show. It would need a skill-stratified ESP/Z sample to become a candidate.
- **Out-of-scope hint, glide:** on the Mako 3 the pooled glide is **4.3-4.4 on all three pages (362 ratings)** against a displayed 5 (Innova and Atlas both 5), and in the visible Champion ratings roughly 70% of reviewers set glide 4, not 5 (hand count, approximate). That is movement away from the anchor, so it is the strongest glide signal I have seen in a batch. Innova's own copy says "lots of glide." Glide is outside turn/fade scope, so it is recorded only; the Buzzz glide (4.1-4.2 against 4) is fine.

## Evidence limits — batch 16

Same tooling limits as earlier batches; see the pilot section. Specific to this batch:

- **Diff against `flights.json` / `data.json` (done first):** the Atlas numbers equal the Marshall Street snapshot for Buzzz, Firebird, Leopard, Thunderbird, Teebird 3, Mako 3; **Grym** comes from Infinite ("Manufacturer numbers via Infinite Discs"); **Destroyer and Roc** carry the applied overrides; **Eagle** has none (above). Against current manufacturer pages: **all Innova molds match** (`innovadiscs.com/disc/{destroyer,roc,firebird,thunderbird,teebird3,eagle,leopard,mako3,wraith}/` all fetched; Destroyer and Roc against their base numbers). **Buzzz** matches Discraft's team page (5/4/-1/1, stability 0.5; a first fetch of the same page printed "5/4/-1/0.5," which a re-fetch asking for the labelled block showed was the summarizer folding the stability line into the fade, so ignore it). **Grym is the only mold with a live disagreement** (below). No Luna/Gator-style Atlas lag for the Innova molds.
- **Reddit** not attempted (blocked per the brief), **YouTube** unreachable, **DGCR** 403: the Teebird3-vs-Thunderbird, Eagle and Teebird, Eagle vs. Teebird, Wraith vs Destroyer, Boss vs Destroyer vs Wraith, Mako vs Buzzz, Buzzz vs. Mako3 and Kastaplast Grym threads appear only as search titles and are not cited as evidence. discingdaily.com failed on a certificate error. kastaplast.com has no readable Grym product page (below); `discraft.com/z-buzzz-buzzz` 404'd, `www.team.discraft.com/discs/buzzz` works.
- **Infinite URLs that 302'd:** `/Kastaplast-Grym/K1-Line` (the working slug is lowercase `/kastaplast-grym/k1`), `/Discraft-Buzzz/Z-Line` and `/Discraft-Buzzz/Z` (no Z-plastic page read, so Buzzz has only ESP plus the mold average). The Champion Roc page loads with zero ratings.
- **Infinite plastic pages truncate.** Complete lists: Destroyer Champion 50 of 50; Roc KC Pro 56 of 56; Firebird Star 63 of 63; Teebird 3 Star 25 of 25 and Champion 32 of 32; Eagle Star 28 of 28 and DX 11 of 11; Leopard Star 33 of 33; Grym K1 Line 23 of 23 (24 rows). Partial: Destroyer Star 103 visible of 291, Thunderbird Star (22 of 42) and Champion (20 of 116), Firebird Champion (text sample), Mako3 Star (7 of 144) and Champion (about 100 of 152), Leopard DX (6 of 105), Buzzz ESP (7 of 137), Wraith Star (5 of 190). The Roc DX page returned five highlighted reviews and no per-reviewer ratings. Where I had no raw list I used printed pools.
- **Infinite shrinkage hypothesis, checked on three more pages (my arithmetic on fetch-step data; hand tallies, approximate).** **Roc KC Pro:** 52 numeric ratings, raw turn -0.06 / fade 2.42; adding eight phantom ratings at the displayed 0/3 gives -0.05 / 2.50; printed 0/2.5. **Fits.** **Grym K1 Line:** 24 rows listed (the page says 23; one reviewer appears twice), raw -1.58 / 1.92; with eight phantoms at the displayed -1/2, -1.44 / 1.94; printed -1.4 / 1.9. **Fits.** **Grym K1 Glow:** four ratings, raw -3.4 / 1.1; with eight phantoms -1.8 / 1.7; printed -1.4 / 1.8. **Direction fits, but the printed number is closer to the display than eight phantoms predict** (about 20 would be needed on turn), so the phantom weight is probably not a constant eight on small pages. The Destroyer Star page could not be tested (103 of 291 ratings visible). Cumulatively (batches 14-16): printed Infinite averages sit between the display and the raw mean on every page I could test, by an amount that is large on small pages and negligible above about 500 ratings.
- **Raw per-reviewer ratings are mostly the display echoed back** (Destroyer Star: 91 of 101 turn ratings are exactly -1; Firebird Star: 54 of 60 at fade 4; Eagle Star: 19 of 23 at exactly -1/3). The informative signal is the minority who move, so I report movers explicitly.
- **Outliers excluded from tallies:** one Destroyer Star rating with turn +4 (probably a mis-slid input), one Destroyer Champion rating 15/4.5/1/4.5, one Roc KC Pro rating 1/1/0/0, one Eagle Star rating that printed turn "-2.5" with no fade. One Roc KC Pro rating at turn +2 / fade 1 is kept in (1 of 52).
- **Skill labels and distances** come from Infinite reviewers; **no arm speeds are stated anywhere.** Distance bands appear in the Grym ratings (325-430 ft, one "~500 ft hyzerflip") and a few others.
- **Quotes via the summarizing fetch step** (all of them) need a spot-check before any goes into an override source note. Search-summary claims are flagged where used.

---

## Grym — Kastaplast (id d589786b9467)

- **Atlas now:** 13/5/-1/2 (source: Infinite Discs, "Manufacturer numbers via Infinite Discs"; PDGA approval Jun 26, 2015; no override; production status unknown). **Proposed turn/fade:** none. **Evidence too thin to call; open candidate: turn -1 → -1.5 (|Δ| 0.5, ungated), the half-step the raw ratings support, or -1 → -2 (|Δ| = 1.0, review-gated, the owner's call).** Reference plastic (assumed most-thrown): K1 Line (23 ratings); K1 Glow (4) and X-outs are also listed.
- **Manufacturer:** **not readable.** kastaplast.com returned no Grym product page (`/en-us/products/k1-grym` 404; `/products/k1-grym` 404; `/en-us/products/grym` returns a generic product listing; the site's flight-chart page explains the numbers but lists no per-disc values; the Guld page, 13/5/-0.5/3, does not mention the Grym). A search of kastaplast.com surfaced no Grym page, and a search summary said the Grym and Grym X "appear to be discontinued" with the Guld positioned as the stable bomber (**search summary, unverified**). Retailer-side signs of the same: OTB Discs tags its K1 Grym "Out of Production," and Fade Gear lists a "Limited Edition Last Run K1 Grym." **Kastaplast copy as quoted by retailers (spot-check):** "the Kastaplast disc for long smooth s-curves and tailwind bombs … a distance driver with a clean shape and a comfortable 2.2 cm rim. It'll hold the line you put it on and get you far down the fairway"; "a workable big D driver for the common player, or a turnover hang glider for the bigger arms"; "thrown flat it turns moderately before settling into a long glide, and released on a hyzer it becomes a big, beautiful S-shaped flight" (Reaper). The "turnover hang glider" and "turns moderately" wording points toward more turn than -1.
- **The printed number is split across retailers (the pooling/lag hazard the brief asked about, and the finding of this entry):**
  - **13/5/-1/2, "Stable":** Infinite Discs (the Atlas source) and Rocket Discs.
  - **13/5/-2/2:** Reaper Discs, Titan Disc Golf (the product title says -2; **its URL slug still reads `13-5-1-2`**, which suggests the listing was once -1 and was edited), Gotta Go Gotta Throw ("Stable"), Fade Gear (also quotes Joe's Universal Flight Chart: high-speed stability -1, low-speed +3), Drop Zone Discs ("Stable Distance Driver"), and Denis Flaschner's Simply Disc Golf review (Pro, PDGA #49081: "requires significant snap to unlock the full -2 turn").
  - **13/6/-3/2:** OTB Discs (a one-off outlier; "Out of Production").
  - **Reading:** six or seven pages print -2 and two print -1, and the -1 pages are the ones the Atlas copied. That is the same shape as Luna (batch 2: stale catalog, manufacturer changed), but it could equally be retail pages carrying an edited number, so I cannot say which is Kastaplast's current figure without the manufacturer page. **Infinite and the Atlas hold the minority number.**
- **Retailer ratings (Infinite):** reviewer numbers **12.9/4.9/-1.5/1.9 (27 ratings, 4.22 stars)**; K1 Line page **12.9/4.9/-1.4/1.9 (23 ratings, 4.4 stars)**; K1 Glow page **12.8/5/-1.4/1.8 (4 ratings, 3 stars)**. Infinite's Grym page does **not** pool the Grym X (separate page: manufacturer 12.5/5/0/3, reviewers 12.3/5/-0.4/2.6 on 17 ratings), so the Infinite pool is clean of that hazard. Label: Infinite "Stable." Reaper's own page carries 48 reviews at 4.83 stars (customer text only; no flight ratings read).
- **Community (Infinite K1 Line, 24 rows, 2015-2024; raw ratings, hand tallies, approximate):** mean turn **-1.58**, fade **1.92** (printed -1.4/1.9). Distribution: turn -2 in 12, -3 in 2, -1.5 in 2, -1 in 5, 0 in 3; fade 2 in 18, 1 in 4 (all four are -2/-3 turn ratings from 2021-2024), 3 in 2. **By skill:** advanced/professional (10) **-1.35**; intermediate (12) **-1.71**; beginner (2) -2. **By era:** 2015-2018 (11 ratings) -1.41; 2019-2024 (13 ratings) -1.73. **The sliders start at the displayed -1/2 and half the pool still moved to -2.** Text, mixed in both directions: "became way too flippy after 1-2 months … started as a fast Wraith" (advanced, 13/5/-2/1, March 2024); "flippest disc in my bag" at 60% power (intermediate, -3); "crazy under-stable … works great on hyzer" (intermediate, -3); "glidey and smooth flying" (professional, -2, 375-400 ft); "full S flight when thrown hard" (intermediate, -1.5, 420-430 ft); "less overstable Destroyer feel … ~500 ft hyzerflip range" (advanced, -2); "beat in destroyer" (advanced, -2); "20-30 extra feet than Wraith/Katana" (advanced, -2, 380 ft average); "bit more understable than labeled" (intermediate, -1); "defiantly not under stable … straight then gradual fade" (intermediate, -1/2); "stable to slightly overstable" (advanced, 0/2, 2017); "super overstable as a forearm thrower" (intermediate, -2); "different runs vary" (advanced, 12/4/0/2, 2022). **K1 Glow (four ratings, 2022-2025):** -2, -2.5, -4, -5 turn and fade 0.5-2: "unusably flippy," "much more understable than stated," "incredibly flippy." Search-summary text (spot-check): "some owners report the mold seems inconsistent, from very flippy to overstable, though most on the flippier side"; "some find it flies more like 12/5/-3/2"; K1 Glow "flies more understably" (Simply Disc Golf).
- sources:
  - {name: Kastaplast Guld collection page (13/5/-0.5/3; no Grym mention; the only Kastaplast page read), url: https://www.kastaplast.com/en-us/collections/guld, type: manufacturer, weight: 0.2}
  - {name: Infinite Discs Grym (mfr 13/5/-1/2; reviewers 12.9/4.9/-1.5/1.9; 27 ratings), url: https://infinitediscs.com/kastaplast-grym, type: retailer, weight: 0.5}
  - {name: Infinite Discs K1 Line Grym (23 ratings, dated; reviewer text), url: https://infinitediscs.com/kastaplast-grym/k1, type: retailer, weight: 0.3}
  - {name: Infinite Discs K1 Glow Grym (4 ratings, dated), url: https://infinitediscs.com/Kastaplast-Grym/K1-Glow, type: retailer, weight: 0.1}
  - {name: Infinite Discs Grym X (12.5/5/0/3; the separate record, checked for pooling), url: https://infinitediscs.com/kastaplast-grym-x, type: retailer, weight: 0.1}
  - {name: Reaper Discs K1 Grym (13/5/-2/2 via summary; Kastaplast copy quoted), url: https://reaperdiscs.com/products/kastaplast-k1-grym, type: retailer, weight: 0.3}
  - {name: Titan Disc Golf K1 Line Grym (title 13/5/-2/2, slug 13-5-1-2), url: https://titandiscgolf.com/products/kastaplast-k1-line-grym-13-5-1-2, type: retailer, weight: 0.2}
  - {name: Gotta Go Gotta Throw K1 Grym (13/5/-2/2), url: https://gottagogottathrow.com/products/kastaplast-k1-grym-distance-driver-golf-disc, type: retailer, weight: 0.2}
  - {name: Fade Gear Limited Edition Last Run K1 Grym (13/5/-2/2; last-run listing), url: https://fadegear.com/products/kastaplast-limited-edition-last-run-k1-grym-distance-driver-golf-disc, type: retailer, weight: 0.2}
  - {name: Drop Zone Discs Grym collection (13/5/-2/2), url: https://www.dzdiscs.com/collections/kastaplast-grym-distance-driver, type: retailer, weight: 0.2}
  - {name: Rocket Discs Grym (13/5/-1/2, Stable), url: https://rocketdiscs.com/kastaplast-grym, type: retailer, weight: 0.2}
  - {name: OTB Discs K1 Grym (13/6/-3/2, "Out of Production"; outlier), url: https://otbdiscs.com/product/grym/, type: retailer, weight: 0.1}
  - {name: Simply Disc Golf Grym review (Denis Flaschner, Pro; -2 turn; K1, K1 Soft, K1 Glow), url: https://simplydiscgolf.com/kastaplast-grym-review/, type: community, weight: 0.3}
- **confidence:** 0.5
- **consensusNote:** Everything that can be read points away from -1: most retailers print -2, the one named pro reviewer says the full -2 needs "significant snap," Kastaplast's copy (as quoted) calls it a turnover hang glider that "turns moderately" thrown flat, and 24 raw K1 Line ratings read -1.58 even though the slider started at -1. The gap is bigger on the Glow plastic and on later ratings. **Held back because:** Kastaplast's own number could not be read (so the choice between -1 and -2 rests on retail copies of an unseen source, and a retail edit from -1 to -2 is as consistent with the Titan slug as a stale -1 is), the mold appears to be out of production, the advanced/professional raw mean is -1.35 (inside the half-step), there are no arm speeds, and the Infinite K1 Line pool prints -1.4. **If you want observed flight over the printed number: turn -1 → -1.5** (raw mean -1.58, adv/pro -1.35, printed pools -1.4 to -1.5; not gated). **-1 → -2** (what six retailers print; |Δ| 1.0) is **yours to call** and needs the manufacturer page or a dated Kastaplast statement. Fade 2 holds in every layer (printed 1.8-1.9, raw 1.92); fade untouched.
- **plasticVariance:** K1 Glow reads far more understable than K1 Line (raw -3.4 on four ratings against -1.58; reviewers say the same); K1 Soft is sold as a Grym X, not a Grym. Kastaplast prints one set of numbers. Run-to-run spread is called out by two reviewers. Not quantified. Do not average.
- **Linked, review as a set if it moves:** **Grym X** (Atlas 12.5/5/0/3, retailers agree; a Grym at -2 would double the Grym/Grym X turn gap from 1 to 2), **Guld** (13/5/-0.5/3, the stable bomber that reportedly replaced it), Vass (12/5/-1.5/2), Stål (9/4/0/3), and the Innova speed-12/13 set the reviewers compare it to: Destroyer (12/5/-0.5/3.5, "less overstable" and "beat in" comparisons), Wraith (11/5/-1/3, "fast Wraith"), Katana (13/5/-3/3, "20-30 extra feet than Wraith/Katana"). A Grym at -1.5 sits between Wraith and Katana on turn, where the reviewers put it. Nothing else moves.

## Destroyer — Innova (id 3d60892b6812)

- **Atlas now:** 12/5/-0.5/3.5 (**applied override**, "Innova catalog, Atlas-adjusted," Oct 2, 2026; manufacturer numbers 12/5/-1/3 kept in the record). **Proposed turn/fade:** none. **Re-check: the applied override stands; fresh evidence neither contradicts the ordering it encodes nor supports the size of the half-steps.** Reference plastic (assumed most-thrown): Star (291 ratings; Champion 50; Infinite lists about 25 plastics).
- **Manufacturer:** Innova 12/5/-1/3 (page fetched today). Copy: "The Destroyer is a fast, stable power driver with significant glide. A great disc for sidearm throwers and those with lots of power." **The override's basis is still on the page, verbatim: "much like a faster Wraith, but with a little more high and low speed stability."** The page also says it "can handle headwinds and throws with off axis torque" and is not recommended for beginners. The Wraith page prints 11/5/-1/3 with "A stable flyer that performs predictably into the wind." Innova's pages print no explicit stability label on these (the fetch step wrote "Stable"; that is its wording, not necessarily Innova's). Infinite label "Overstable." Copy and Innova numbers agree; the only "contradiction" is the one the override already resolved (identical turn/fade to the Wraith, with copy saying "a little more stability").
- **Retailer:** Infinite reviewer numbers **12/5/-1/3 (568 reviews, 4.65 stars): exactly Innova's numbers**; Star page 12/5/-0.9/3 (291); Champion 12.1/5/-0.9/3.1 (50). Wraith for comparison: 11/5/-1.1/2.9 on the Star page (190) and on the mold average (455, pilot).
- **Community (raw ratings, hand tallies, approximate):** **Star, 101 numeric turn ratings and 102 fade ratings (the 103 most recent of 291, October 2020-May 2026; one +4 turn input excluded): mean -0.95 / 3.02.** Movers: 91 of 101 at exactly -1; ten others at -0.5 (six), 0 (three), -1.5 (one). Fade: 97 of 102 at exactly 3; movers 3.5 (three), 4 (one), 2.5 (one). **Champion, 39 numeric ratings (2014-2026): -0.91 / 3.03**; turn movers -0.5 (three), 0 (two); fade movers 3.5 (three), 4, 2.5, 2 (one each). Across both plastics 14 of 15 turn movers move toward less turn and eight of eleven fade movers move up: the direction of the override, but **the whole pool sits within 0.1 of -1/3**, and the printed pools equal -1/3. **Text:** run-to-run variance is the dominant theme ("varies WIDELY by run," "pre-McBeth vs post-McBeth differ greatly," "older Ricky Wysocki and Champion more overstable; newer … less stable," "2 destroyers fly completely different"); plastic: "DX plastic flips; Star plastic for stability," "G-Star less harsh fade," "champ and halo overstable"; "flies true to numbers eventually" (intermediate); "flight matches ratings" (advanced); "not overstable … great flex lines" (intermediate); "harder to throw than Wraith" (beginner); "more accurate … more distance" than the Destroyer from a Wraith (advanced, 2022). Search summary (spot-check): "more overstable than the Wraith"; "the Wraith beats in faster."
- sources:
  - {name: Innova Destroyer page (12/5/-1/3; "much like a faster Wraith, but with a little more high and low speed stability"), url: https://www.innovadiscs.com/disc/destroyer/, type: manufacturer, weight: 1.0}
  - {name: Innova Wraith page (11/5/-1/3), url: https://www.innovadiscs.com/disc/wraith/, type: manufacturer, weight: 0.4}
  - {name: Infinite Discs Destroyer (mfr 12/5/-1/3; reviewers 12/5/-1/3; 568 reviews), url: https://infinitediscs.com/innova-destroyer, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star Destroyer (291 ratings; 103 visible, dated; reviewer text), url: https://infinitediscs.com/Innova-Destroyer/Star, type: retailer, weight: 0.3}
  - {name: Infinite Discs Champion Destroyer (50 ratings, dated; reviewer text), url: https://infinitediscs.com/Innova-Destroyer/Champion, type: retailer, weight: 0.3}
  - {name: Infinite Discs Star Wraith (190 ratings; 5 visible), url: https://infinitediscs.com/Innova-Wraith/Star, type: retailer, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** The override was built on Innova's own sentence, and that sentence is still on the page. On the reviewer side the Destroyer and Wraith pools differ by about 0.1 on turn and 0.1 on fade (Star -0.95/3.02 against Wraith -1.1/2.9; both heavily anchored on their displays), in the direction Innova describes and about a fifth of the size of the half-steps applied. **The evidence cannot resolve half a step on either side:** nine of ten reviewers just echo -1/3, and the ones who move lean toward the override. So nothing here contradicts the override, nothing corroborates its magnitude, and the stated ordering (Destroyer above Wraith, below the Ape and XCaliber at 0/4) is intact in every layer. **Not a candidate to revert** (a revert to -1/3 would put the Destroyer's turn and fade level with the Wraith's, against Innova's wording); recorded so the review knows the override rests on the manufacturer's copy, not on reviewer numbers.
- **plasticVariance:** Large and run-dependent. DX flips; Star, Halo and Champion are the more overstable plastics; reviewers describe big mold-to-mold spread within Star. Innova prints one set of numbers. Do not average.
- **Linked:** Wraith (11/5/-1/3, unchanged), Boss (13/5/-1/3; the batch 2 and 5 decisions stand), Shryke (13/6/-2/2), Sheriff (13/5/-1/2), Trespass (12/5/-1/3 applied), Enforcer (12/4/0.5/4, "slightly more over stable than the staple Destroyer," batch 15), XCaliber (12/5/0/4, "a beefier destroyer"), Grym (reviewers' "less overstable Destroyer"; open candidate above), Thunderbird ("better control than Destroyer"). Nothing moves.

## Roc — Innova (id 9152771e1f7b)

- **Atlas now:** 4/4/0/2.5 (**applied override**, Oct 2, 2026: fade 3 → 2.5 from Infinite's 173-rating average plus the owner's own throwing; manufacturer 4/4/0/3 kept). **Proposed turn/fade:** none. **Re-check: the applied fade 2.5 is supported by fresh raw per-reviewer ratings.** Reference plastic (assumed most-thrown): DX and KC Pro (80 and 56 ratings; Star 5, Champion 0, about 25 variants listed).
- **Manufacturer:** Innova 4/4/0/3, no label printed. Copy: "The number one professional mid-range disc. It is very reliable at the high speeds that pros throw. It ages slowly, becoming an excellent slow turning disc as it wears." "This disc can take and hold the angle of release, even into a headwind"; "ages gradually and predictably." Copy and numbers agree; the wear line is a wear statement.
- **Retailer:** Infinite reviewer numbers **4/4.1/-0.1/2.5 (173 ratings, 4.74 stars): unchanged from the override**; DX 4/4.1/-0.2/2.5 (80); KC Pro 4/4/0/2.5 (56); Star 4/4/0/2.9 (5); Champion no ratings. Label "Overstable."
- **Community (KC Pro page, 52 numeric ratings 2012-2025; hand tallies, approximate):** raw turn **-0.06**, fade **2.42** (median 3). **By skill (my tags are hand-keyed):** advanced/professional (17) -0.12 / **2.53**; intermediate (28) 0.02 / 2.38; beginner (7) -0.21 / 2.36: **the fade reads 2.4-2.5 in every skill group.** Distribution: fade 3 in 28, 2 in 13, 2.5 in 2, 1.5 or below in 9; turn 0 in 43. **Text:** "less fade than advertised" (intermediate, 2016; professional, 2016); "less overstable than described" (intermediate, 2021); "modern rating more accurate than published numbers" (intermediate, 4/5/0/2, 2020); "essentially a beaded Buzzz" and "behaves like a slow Buzzz" (beginners); "starts slightly overstable; beats in to flip and turnover" (advanced); "beats in slow, but will become a disc that flies straighter and straighter, and eventually turns over more" (advanced, 2022); "new version turns left; beats in quickly to a straight flyer with reliable fade" (advanced, 2020). **DX page** (summary only, no per-reviewer ratings read): DX Rocs "lose fade faster than gaining turn" during break-in (intermediate); "starts overstable, beats into straight flight, eventually becomes a reliable turnover disc" (intermediate). **Star page** (five ratings, three at 4/4/0/3, one at fade 2): "stubbornly overstable" after months (beginner); "premium plastic will stay in its sweet spot for a lot longer." The owner's own throwing (override record) agrees.
- sources:
  - {name: Innova Roc page (4/4/0/3), url: https://www.innovadiscs.com/disc/roc/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Roc (mfr 4/4/0/3; reviewers 4/4.1/-0.1/2.5; 173 ratings), url: https://infinitediscs.com/innova-roc, type: retailer, weight: 0.5}
  - {name: Infinite Discs KC Pro Roc (56 ratings, dated; reviewer text), url: https://infinitediscs.com/Innova-Roc/KC-Pro, type: retailer, weight: 0.3}
  - {name: Infinite Discs DX Roc (80 ratings; highlights only), url: https://infinitediscs.com/Innova-Roc/DX, type: retailer, weight: 0.2}
  - {name: Infinite Discs Star Roc (5 ratings, dated), url: https://infinitediscs.com/Innova-Roc/Star, type: retailer, weight: 0.1}
- **confidence:** 0.8
- **consensusNote:** The override's fade 2.5 now has support that does not depend on the printed average: **52 raw KC Pro ratings average 2.42 (2.53 for advanced and professional throwers), and the shrinkage arithmetic closes (raw 2.42 plus phantoms at 3 prints 2.50)**, so the printed 2.5 is not an anchoring artifact either. Turn 0 holds in every layer. The median is 3 (28 of 52 ratings at exactly 3), so this is a mean pulled by a soft tail, which is what a 0.5 reduction means; I would not go lower. The reference-plastic detail: the Star page has five ratings and sits at 2.9 (unusable sample, consistent with "premium plastic holds overstability longer"), so this is a DX/KC Pro baseline reading, by policy. No contradicting evidence found.
- **plasticVariance:** Real. DX and KC Pro start overstable and beat in toward flat, then turnover; Star and Champion hold overstability longer (reviewers, five Star ratings). Innova prints one set of numbers. The override keeps a mold-level number at the DX/KC Pro-era flight. Do not average.
- **Linked:** Buzzz (5/4/-1/1, "essentially a beaded Buzzz"), Mako 3 (5/5/0/0, a reviewer's "comparable to Roc"), Zone, Gator (4 applied, batch 6) and Aviar. Nothing moves.

## Firebird — Innova (id ba675aed468a)

- **Atlas now:** 9/3/0/4 (source: Marshall Street snapshot; no override). **Proposed turn/fade:** none. Matches. Reference plastic: Star (63 ratings; Champion 141; DX, GStar and about 25 other variants; DX not re-read this batch).
- **Manufacturer:** Innova 9/3/0/4, "Overstable" (page fetched). Copy: "an overstable distance driver which works extremely well into a headwind. It is our most popular upwind distance driver"; "combination of superior speed and stability make it possible to throw drives into the wind with confidence. An excellent disc for throwing long range flex shots." Copy and numbers agree.
- **Retailer:** Infinite reviewer numbers **9/3.1/0/3.9 (336 ratings)**; Star **9/3.1/0/4 (63)**; Champion **9/3/0/4 (141)**. Label "Very Overstable."
- **Community (Star, 60 numeric ratings 2015-2025):** raw turn about **0.0**, fade about **3.97**; about 53 of 60 at exactly 0/4; the movers are fade 3 (three), 3.5 (one pro), 4.5 and 5 (one each); turn -1, +0.5 and +2 (one each; the +2 is a "meat hook"). **Text:** "top 2-3 most overstable discs I have ever thrown" (intermediate); "most overstable firebird other than flat champ ones" (advanced); "flat 171g flies closer to FD3 off the shelf" (professional, fade 3.5); "doesn't even acknowledge that there is any wind" (professional); "flies more like slightly over stable FW driver" (beginner, -1/3, 2021); "underrated in Star plastic, flies similarly to Sexton" and "more over stable than the oh so popular SextonBird" (intermediates). Champion (text only, 141): "flies straight with no turn and finishes with a dumpy fade"; "predictably overstable, but can still be shaped"; "filled a gap in my bag between Zone and Destroyer" (intermediate, ~275 ft).
- sources:
  - {name: Innova Firebird page (9/3/0/4, Overstable), url: https://www.innovadiscs.com/disc/firebird/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Firebird (mfr 9/3/0/4; reviewers 9/3.1/0/3.9; 336 ratings), url: https://infinitediscs.com/innova-firebird, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star Firebird (63 ratings, dated; reviewer text), url: https://infinitediscs.com/Innova-Firebird/Star, type: retailer, weight: 0.3}
  - {name: Infinite Discs Champion Firebird (141 ratings; sample only), url: https://infinitediscs.com/Innova-Firebird/Champion, type: retailer, weight: 0.2}
- **confidence:** 0.8
- **consensusNote:** Manufacturer, the 336-rating average, 60 raw Star ratings (3.97) and a 141-rating Champion pool all land on 0/4, and the reviewers' comparisons (Firebird as the overstable reference for the Thunderbird, XCaliber, Stål, Ape, Omen and Raptor) are the Atlas ordering. The pool is mostly display echo, but the movers split in both directions. No contradicting evidence found.
- **plasticVariance:** Reviewers: Star beefier on some runs ("most overstable firebird other than flat champ ones"); DX behaves differently (not re-read; the pilot note stands). Not quantified. Do not average.
- **Linked:** Thunderbird, TeeBird, Teebird 3, Eagle, Leopard (the family check above), XCaliber, Stål, Blade, Raptor, Omen, Ape (all unchanged).

## Thunderbird — Innova (id e9a88cc4f3b1)

- **Atlas now:** 9/5/0/2 (source: Marshall Street snapshot; no override). **Proposed turn/fade:** none. Matches. Reference plastic: Star (42 ratings; Champion 116; about 30 variants).
- **Manufacturer:** Innova 9/5/0/2 (page fetched; no label printed). Copy: "The stability of a TeeBird with the speed of a Valkyrie; it can be described as a seasoned Firebird with less fade"; "predictable in wind and a great long range placement driver." Infinite label "Overstable." Copy and numbers agree.
- **Retailer:** Infinite reviewer numbers **9/4.9/-0.1/2.1 (269 ratings, 4.67 stars)**; Star 9/5/0/2.1 (42); Champion 9/4.9/0/2.1 (116).
- **Community (Star, 22 visible of 42; Champion, 20 visible of 116; both partial):** ratings are nearly all 9/5/0/2; fade 2.5-3 in about six (including one advanced 300 ft rating at 9/4/0/3). **Text:** "true to the numbers and very reliable in wind" (advanced); "bit more overstable than expected" (intermediates, twice; one at 450 ft, fade 2.5); "more overstable but not outrageous"; "much more stable than the flight numbers indicate" (advanced, 300 ft); "mini star destroyer (a straighter one)" and "beat in nicely to fly straight to flippy" (advanced); "too stable sometimes … too flippy" (advanced, 400 ft thrower, Champion); "incredibly hard to turn over, step down from Firebird" (advanced); "fallen into its flight numbers after 2 months" (intermediate); "meat hook initially, becomes trustworthy" (intermediate, 325 ft); "little to no fade" at 350-375 ft (advanced, Champion).
- sources:
  - {name: Innova Thunderbird page (9/5/0/2), url: https://www.innovadiscs.com/disc/thunderbird/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Thunderbird (mfr 9/5/0/2; reviewers 9/4.9/-0.1/2.1; 269 ratings), url: https://infinitediscs.com/innova-thunderbird, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star Thunderbird (42 ratings; 22 visible), url: https://infinitediscs.com/Innova-Thunderbird/Star, type: retailer, weight: 0.3}
  - {name: Infinite Discs Champion Thunderbird (116 ratings; 20 visible), url: https://infinitediscs.com/Innova-Thunderbird/Champion, type: retailer, weight: 0.2}
  - {name: Reaper Teebird vs Thunderbird (Silas Henson; via summary, spot-check), url: https://reaperdiscs.com/blogs/reviews/innova-teebird-vs-thunderbird, type: community, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, a 269-rating average and the visible Star and Champion ratings agree on 0/2. The "more overstable than expected" remark recurs but never as more than half a step of fade on any rating, and there is one flippy dissent. The pools print 2.1 on both plastics. Inside noise; the family check has the ordering. No contradicting evidence found.
- **plasticVariance:** Star and Champion read the same on the printed pools (2.1); one reviewer notes Star beat in nicely while Champion/Halo run more overstable. Not quantified. Do not average.
- **Linked:** TeeBird, Teebird 3, Firebird, Eagle, Savant and Undertaker (9/5/-1/2), Raptor and Omen. Nothing moves.

## Teebird 3 — Innova (id a4914f8ef694)

- **Atlas now:** 8/4/0/2 (source: Marshall Street snapshot; PDGA approval Aug 29, 2017; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Star (25 ratings) or Champion (32); about 18 variants.
- **Manufacturer:** Innova 8/4/0/2 (page fetched; no label printed). Copy: "The TeeBird3 is faster with less glide, and has the same trusted turn and fade flight ratings as the original TeeBird"; a flat flight plate that "promotes speed while reducing glide"; "point and shoot, target specific fairway driver." Infinite: "a sleeker, faster, version of its popular counterpart"; label "Stable." Copy and numbers agree.
- **Retailer:** Infinite reviewer numbers **8/4.1/-0.1/2.1 (121 ratings, 4.74 stars)**; Star 8/4/0/2.1 (25); Champion 7.9/4/-0.1/2.1 (32).
- **Community (all 57 ratings read):** Star: turn 0 in 23 of 25 (one -0.5, one +1); fade 2 in 18, 2.5 in four, 3 in two, 1.5 in one. Champion: turn 0 in 26 of 32, -1 in five, -0.5 in one; fade 2 in most (about 22), 2.5 in two or three, 3 in three, 1 in one. **Text:** "straight shooter," "point and shoot," "great stable workhorse fairway driver" (advanced, intermediate); "straight for about 175-200 ft then begins nice fade … less glide, more stable than Discmania FD" (intermediate); "more stable than original Teebird" and "typically flatter than Teebirds" (intermediates); "harder to turn than standard Teebird; strong dependable fade" (advanced, fade 3); "too stable for turnover shots" (intermediate, Champion); "nearly identical to Thunderbird; more comfortable rim" (intermediate); "too much for me, hard left fade" (intermediate, 350 ft max, 8/4/0/3); "one flies glidey/straight, other reliable hyzer flip" (advanced, two copies, fade 1.5); "inconsistent; less forgiving" (intermediate, Champion).
- sources:
  - {name: Innova TeeBird3 page (8/4/0/2), url: https://www.innovadiscs.com/disc/teebird3/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs TeeBird3 (mfr 8/4/0/2; reviewers 8/4.1/-0.1/2.1; 121 ratings), url: https://infinitediscs.com/innova-teebird3, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star TeeBird3 (25 ratings, dated; reviewer text), url: https://infinitediscs.com/Innova-TeeBird3/Star, type: retailer, weight: 0.3}
  - {name: Infinite Discs Champion TeeBird3 (32 ratings, dated; reviewer text), url: https://infinitediscs.com/Innova-TeeBird3/Champion, type: retailer, weight: 0.3}
  - {name: Discount Disc Golf Teebird vs Teebird3 (Simon; via summary, spot-check), url: https://discountdiscgolf.com/teebird-vs-teebird3/, type: community, weight: 0.1}
  - {name: Sabattus Disc Golf Teebird vs Teebird3 vs TL vs TL3 (Andrew Streeter; via summary, spot-check), url: https://sabattusdiscgolf.com/blogs/sdg-newsbites/teebird-vs-teebird3-vs-tl-vs-tl3, type: community, weight: 0.1}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, the 121-rating average and 57 raw ratings across two plastics agree on 0/2, and the pools match the original TeeBird's, which is what Innova's "same trusted turn and fade" says. The text leans a touch more stable than the TeeBird, which the pools do not show (0.1). No contradicting evidence found.
- **plasticVariance:** Star and Champion read the same (2.1). Reviewers: Metal Flake "beefy," a 171 g Star "easier to turn," two copies from one owner differ. Not quantified. Do not average.
- **Linked:** TeeBird (7/5/0/2), Thunderbird, Eagle, Teebird L and TL3, Leopard 3, Valkyrie, Gazelle. Nothing moves.

## Eagle — Innova (ids 2c73a090c48b "Eagle (new)", f492945b1ff0 "Eagle (old)")

- **Atlas now:** **no flight numbers on either approval.** `flights.json` carries an "Eagle" row at 7/4/-1/3 ("Overstable," Marshall Street) that is not attached to either approval. **Proposed turn/fade:** none. **Catalog gap, not a turn/fade correction; owner decision.** Reference plastic (assumed): Star (28 ratings; Champion, DX 11, GStar and others).
- **Manufacturer:** Innova 7/4/-1/3 (page fetched; approval date 03/12/99, which is the "Eagle (new)" record; rim 1.7 cm). Copy: "The original, professional level fairway driver," "superior speed and predictable flight characteristics" for "confident and accurate long range power shots"; best for "first headwind driver, flex shots, power turnover shots"; "excels at high speed turn." Infinite (quoting Innova): "slightly overstable driver with a degree of high speed turn." Copy and numbers agree.
- **Retailer:** Infinite reviewer numbers **7.1/4/-0.9/3 (131 ratings, 4.55 stars)**; Star 7/4/-1/3 (28); DX 7/4/-0.9/2.9 (11). Label "Overstable."
- **Community (39 ratings read):** Star: 19 of 23 numeric ratings at exactly 7/4/-1/3 (raw about -0.94/3.0); movers are -0.5 in three (one with fade 3.5), fade 2.5 once, plus one garbled "-2.5" entry excluded. DX: six of nine numeric at -1/3, two at -1/2, one at 0/3. **Text:** "more overstable TeeBird" (intermediate); "beefy compliment to Teebird … less glide" (advanced); "TeeBird with a little flip" (advanced, 2016); "mini Destroyer/Wraith, beats in well" (advanced, 2022); "no turn whatsoever" (intermediate, 2020); "30-year staple; won't turn over on anhyzer" (advanced); "less fade than Firebird" and "fits between Firebird and Leopard3" (beginners); "very beginner friendly … 300 ft wooded course go-to" (intermediate); DX "lot better consistent finish than leopard" (intermediate); "overstable fairway driver … fight immediately" (intermediate, DX, 0/3). Retail blogs (spot-check): "a close cousin to the TeeBird … gentle -1 turn and aggressive 3 fade … a great shot shaper," "excels in wooded shots."
- sources:
  - {name: Innova Eagle page (7/4/-1/3; approval 03/12/99), url: https://www.innovadiscs.com/disc/eagle/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Eagle (mfr 7/4/-1/3; reviewers 7.1/4/-0.9/3; 131 ratings), url: https://infinitediscs.com/innova-eagle, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star Eagle (28 ratings, dated; reviewer text), url: https://infinitediscs.com/Innova-Eagle/Star, type: retailer, weight: 0.3}
  - {name: Infinite Discs DX Eagle (11 ratings, dated), url: https://infinitediscs.com/Innova-Eagle/DX, type: retailer, weight: 0.2}
  - {name: Marshall Street Eagle row in flights.json (7/4/-1/3; unmatched; not independent), url: https://www.marshallstreetdiscgolf.com/?s=eagle&post_type=product, type: retailer, weight: 0.2}
- **confidence:** 0.75 (for the numbers 7/4/-1/3, not for any change)
- **consensusNote:** Manufacturer, the 131-rating average and 39 raw ratings agree on 7/4/-1/3, and the reviewers' relationships (a more overstable, glideless TeeBird; less fade than the Firebird; more flip than a Leopard3) are the family ordering in the check above. **The Atlas simply has no numbers for it.** If Freddy wants the Eagle on the map, it needs an explicit override for the "Eagle (new)" approval (the same pattern as the DD3 (new) and PD2 (new) overrides: `approvalName` "Eagle (new)", Innova's page as source), because the name matches two approvals and the pipeline evidently will not guess; "Eagle (old)" (1983) should stay unnumbered (never transfer a current status to an older approval). Whether the Eagle is wanted on the map is a product call, and the pipeline mechanics are in the data-pipeline notes, not checked here.
- **plasticVariance:** DX beats in very well; one 2016 reviewer says it "flips in Star," another "stable new, beats into workhorse"; Innova prints one set of numbers. Not quantified. Do not average.
- **Linked:** TeeBird (7/5/0/2), Leopard (6/5/-2/1), Teebird 3, Thunderbird, Firebird, Leopard 3 (7/5/-2/1), Beast (10/5/-2/2; a reviewer's "shorter but straighter than Beast"). Nothing moves.

## Leopard — Innova (id e5c3cc29c5a7)

- **Atlas now:** 6/5/-2/1 (source: Marshall Street snapshot; no override). **Proposed turn/fade:** none. Matches. Reference plastic: Star (33 ratings; DX has 105; about 16 variants). Batch 2 confirmed this at 0.75; re-checked as part of the family.
- **Manufacturer:** Innova 6/5/-2/1 (page fetched; no label printed). Copy: "Everyone's first fairway driver. Useful for long straight shots, gentle hyzers and turnover shots. Extended life as a roller." Unchanged.
- **Retailer:** Infinite reviewer numbers **6/5/-1.9/1 (260 ratings, 4.47 stars)**; Star **6/5/-1.8/1 (33)**; DX **6/5/-2.1/1 (105)**. Label "Understable."
- **Community:** Star (all 33 read, 2013-2024, mostly beginners and intermediates): of about 30 numeric ratings, turn -2 in 22, -1 to -1.5 in six, -2.5 in one, 0 in one (raw about -1.78); fade 1 in about 25. "Flies like a mako3" (intermediate, 315 ft); "stable even at 166 g, similar to TL3" (intermediate, 0/4.5/1.5); "more stable than expected" (advanced, -1/1, 280-300 ft); "very straight when new" (beginner, 330-350 ft); "flippy in DX plastic" (beginner); "flies super straight … woods/turnover staple" (professional); "beautiful flight, hyzer flip specialist" (advanced, -2.5); "flips easily in wind" (beginner). DX (6 of 105 visible): turn -2 to -2.5 in five of six; "very understable, but not really flippy" (beginner, 250 ft); "DX beats in quickly, becomes inconsistent." The pools put DX at -2.1 against Star -1.8.
- sources:
  - {name: Innova Leopard page (6/5/-2/1), url: https://www.innovadiscs.com/disc/leopard/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Leopard (mfr 6/5/-2/1; reviewers 6/5/-1.9/1; 260 ratings), url: https://infinitediscs.com/innova-leopard, type: retailer, weight: 0.5}
  - {name: Infinite Discs Star Leopard (33 ratings, dated; reviewer text), url: https://infinitediscs.com/Innova-Leopard/Star, type: retailer, weight: 0.3}
  - {name: Infinite Discs DX Leopard (105 ratings; 6 visible), url: https://infinitediscs.com/Innova-Leopard/DX, type: retailer, weight: 0.2}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, the 260-rating average and the full Star sample agree on a very understable, glidey fairway driver (-2/1 printed, -1.8/1 pooled). No contradicting evidence found. A Star-versus-DX gap of 0.3 is plastic, not mold.
- **plasticVariance:** DX reads flippier and beats in quickly; Star holds more stability (pools -2.1 against -1.8; batch 2's notes agree). Not quantified. Do not average.
- **Linked:** Eagle, TeeBird, Teebird 3, Leopard 3, Gazelle (6/4/0/2), Mako 3 (a reviewer's "flies like a mako3"). Nothing moves.

## Mako 3 — Innova (id 7ba55c559b5b)

- **Atlas now:** 5/5/0/0 (source: Marshall Street snapshot; PDGA approval Aug 29, 2017; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Champion (152 ratings) or Star (144); DX has two ratings.
- **Manufacturer:** Innova 5/5/0/0 (page fetched; no label printed). Copy: "The faster, low profile version of the remarkably straight flying Innova Mako"; "the perfect solution for anyone who wants a straight flyer with very limited fade"; "dead straight shots, smooth hyzer shots, one-disc rounds"; "lots of glide." Infinite label "Stable." Copy and numbers agree.
- **Retailer:** Infinite reviewer numbers **5/4.3/-0.2/0.1 (362 ratings, 4.72 stars)**; Star 5/4.4/-0.1/0.1 (144); Champion 5/4.3/-0.1/0.1 (152); DX 5/5/-0.3/0.1 (2).
- **Community (Champion, about 100 of 152 ratings visible, 2018-2026; Star seven visible):** turn 0 in about 80, -0.5 in about 13, -1 in about three, a handful at -2 to -2.5 and +0.5; fade 0 in about 60, 0.5 in about 14, 1 in about 10, 1.5-2 in three (hand tallies, approximate; raw fade about 0.2-0.3). **Glide: roughly 70% of the ratings set 4, not the displayed 5** (see the pair re-check). **Text:** "ultra straight," "dead straight," "definition of 0 turn 0 fade," "really true to flight numbers" (intermediate, ~350 ft max), "holds its line like a laser beam" (advanced); "changes with wear drastically … becomes unstable when beat in" (intermediate, 5/4/-1/1.5); "incredibly unpredictable once beaten" (beginner, 5/3/-1/1); "extremely understable … 325-350 ft vs Buzzz" (intermediate, 5/5/-2.5/0.5, a single outlier); "hyzer flip utility, comparable to Roc" (advanced, -2); "practically just a buzzz" (beginner); "prefers over Buzzz" (intermediate). Denis Flaschner (Pro): "perfectly neutral flight characteristics … little to no turn, virtually no fade."
- sources:
  - {name: Innova Mako3 page (5/5/0/0), url: https://www.innovadiscs.com/disc/mako3/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Mako3 (mfr 5/5/0/0; reviewers 5/4.3/-0.2/0.1; 362 ratings), url: https://infinitediscs.com/innova-mako3, type: retailer, weight: 0.5}
  - {name: Infinite Discs Champion Mako3 (152 ratings; about 100 visible, dated), url: https://infinitediscs.com/Innova-Mako3/Champion, type: retailer, weight: 0.3}
  - {name: Infinite Discs Star Mako3 (144 ratings; 7 visible), url: https://infinitediscs.com/Innova-Mako3/Star, type: retailer, weight: 0.2}
  - {name: Reaper Mako3 vs Buzzz (Denis Flaschner, Pro; via summary, spot-check), url: https://reaperdiscs.com/blogs/reviews/innova-mako3-vs-buzzz, type: community, weight: 0.3}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, three pooled averages (362 ratings) and about 100 raw Champion ratings agree on a straight 0/0 midrange to within 0.1-0.3, and a professional reviewer calls it perfectly neutral. The wear reports (less stable and turnier when beaten, two reviewers) are a wear effect and do not move a new-disc number. The one real mismatch is glide (4.3 pooled, ~70% of raw ratings at 4 against the displayed 5), which is outside this review's scope and is recorded above. No contradicting evidence found on turn/fade.
- **plasticVariance:** Champion, Star, GStar, XT and others read the same on the pools; wear is the larger spread. Not quantified. Do not average.
- **Linked:** Buzzz (below), Mako (4/5/0/0), Roc (4/4/0/2.5), Zone, Gazelle, Leopard. Nothing moves.

## Buzzz — Discraft (id 7446eb39abe5)

- **Atlas now:** 5/4/-1/1 (source: Marshall Street snapshot; no override). **Proposed turn/fade:** none. Matches. **Soft watch, not a candidate:** turn -1 → -0.5 (|Δ| 0.5). Reference plastic (assumed most-thrown): ESP and Z (Infinite lists 106 variants; only ESP was readable, 137 ratings). The pilot confirmed this at 0.75; re-checked as part of the pair.
- **Manufacturer:** Discraft 5/4/-1/1, stability 0.5 (`www.team.discraft.com/discs/buzzz` fetched; **the first fetch printed "5/4/-1/0.5," a summarizer error, resolved by a second fetch of the labelled block**). Copy: "Buzzz is the best golf disc you can buy, period. It's an ultra-dependable, straight flying midrange that you'll reach for again and again. Throw it hard and versatile Buzzz will hold any line you put it on." The pilot's note (stability 0 on the Z page, 0.5 on the Big Z page) stands; the team page does not name a plastic for its 0.5. Copy and numbers agree.
- **Retailer:** Infinite reviewer numbers **5/4.2/-0.7/1 (594 ratings, 4.8 stars)**; ESP **5/4.1/-0.8/1 (137)**. Infinite description: "neutral stability in base plastics and becomes slightly overstable in premium blends." Label "Stable." At these pool sizes the shrinkage effect is under 0.02, so **-0.7 and -0.8 are essentially raw means** (across plastics for the mold average).
- **Community:** ESP page (seven visible of 137): -1/1 in four, -1.5/1, 0/1, and "ultra straight" or "slightly overstable" labels at 200-350 ft. Denis Flaschner (Pro; via summary, spot-check; see the pair re-check): the Buzzz "can absorb a lot more speed and torque without turning over" despite its -1, and has "enough low speed stability to gently hyzer out of a flat shot." Disc Golf Puttheads and Disc Golf Reviewer (pilot, unchanged).
- sources:
  - {name: Discraft Buzzz team page (5/4/-1/1, stability 0.5), url: https://www.team.discraft.com/discs/buzzz, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Buzzz (mfr 5/4/-1/1; reviewers 5/4.2/-0.7/1; 594 ratings), url: https://infinitediscs.com/discraft-buzzz, type: retailer, weight: 0.5}
  - {name: Infinite Discs ESP Buzzz (137 ratings; 7 visible), url: https://infinitediscs.com/Discraft-Buzzz/ESP, type: retailer, weight: 0.3}
  - {name: Reaper Mako3 vs Buzzz (Denis Flaschner, Pro; via summary, spot-check), url: https://reaperdiscs.com/blogs/reviews/innova-mako3-vs-buzzz, type: community, weight: 0.3}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, 731 pooled ratings and the one named pro all describe a straight, hold-any-line midrange with a small fade, which 5/4/-1/1 says. The pooled turn runs 0.2-0.3 less negative than printed and a reviewer says the disc resists turn more than -1 suggests, but the pools mix plastics (premium blends are more stable on Discraft's own scale), the gap is below the half-step, and no arm speed is stated, so this is a soft watch only. **If a skill-stratified ESP/Z sample reads -0.5 or above, the candidate would be Buzzz turn -1 → -0.5 (|Δ| 0.5, not gated), reviewed with the Mako 3.**
- **plasticVariance:** Premium blends (Big Z, Jawbreaker) more overstable; base plastics true to slightly less stable; Discraft's stability numbers run 0 to 0.5. Keep the mold number at the baseline-plastic flight; do not average.
- **Linked:** Mako 3 (above), Zone, Luna, Roc, Hex, Truth, Reactor, Fuse, MD3. Nothing moves.

---

## Batch 16 report (for Freddy)

**Decided items recorded first:** the three standing rules and the Infinite anchoring rule, plus D2 turn and D1 fade carried parked (owner decisions, Oct 3, 2026). Nothing in this batch touches either.

**Proposed changes (0).** Atlas numbers equal current manufacturer numbers for every Innova disc (Destroyer and Roc against their base numbers plus the applied adjustments) and for the Buzzz.

**Both applied overrides re-checked:**
- **Roc fade 3 → 2.5: supported.** 52 raw KC Pro ratings average 2.42 (2.53 for advanced/professional; every skill group 2.4-2.5), the pooled 173 stay at 2.5, and the shrinkage arithmetic closes. The median is 3, so this is a soft-tail reading; I would not go lower. Confidence 0.8.
- **Destroyer 12/5/-1/3 → 12/5/-0.5/3.5: stands on Innova's copy, not on reviewer numbers.** The "much like a faster Wraith, but with a little more … stability" sentence is still on Innova's page. Fresh ratings: Star -0.95/3.02 (101 raw), Champion -0.91/3.03 (39 raw), and the 568-rating Infinite average prints exactly -1/3, against the Wraith's -1.1/2.9 (Star 190, mold 455). The Destroyer-over-Wraith direction is right but its size is about 0.1 per axis, a fifth of the half-steps applied; 14 of 15 reviewers who move on turn move toward less turn. Nothing contradicts the override and nothing corroborates its magnitude. Not a candidate to revert (that would put the Destroyer on the Wraith's turn and fade, against Innova's own wording). Your call whether to leave the source note as "Innova copy"; I would leave it. Confidence 0.6.

**Open candidates (1 new):**
- **Grym turn -1 → -1.5 (ungated, |Δ| 0.5) or -1 → -2 (gated, |Δ| 1.0, yours to call).** 24 raw K1 Line ratings average -1.58 (advanced/professional -1.35, intermediate -1.71, later ratings flippier), six or seven retailers print 13/5/-2/2 against the two (Infinite, Rocket) that print -1, and Kastaplast's copy (as quoted) calls it a "turnover hang glider." **Held back because Kastaplast's own page could not be read (and the mold looks discontinued)**, so which number is the manufacturer's is unverified; the Infinite K1 Line pool prints -1.4. Fade 2 holds everywhere. **Confidence 0.5.** Review Grym X (the turn gap would double), Guld, Wraith, Destroyer and Katana with it.

**Soft watches (not candidates):**
- **Buzzz turn -1 → -0.5 (|Δ| 0.5):** pooled -0.7 (594) and -0.8 (ESP, 137), with a named pro saying it resists turn more than -1 suggests. Pools mix plastics; no arm speeds. Review with the Mako 3.
- **Mako 3 glide 5 → 4 (out of scope):** pooled 4.3-4.4 on three pages (362 ratings) and roughly 70% of raw Champion ratings set 4 despite the 5 anchor. Not turn/fade; recorded.
- **Teebird 3 / Thunderbird slightly more stable than the TeeBird in text** while the pooled ratings are within 0.1: no numeric support.

**Confirmed as-is (6):** Firebird (0.8); Thunderbird, Teebird 3, Leopard, Mako 3 (0.75); Buzzz (0.7, with the soft watch). Plus Roc and Destroyer re-checked above (2) and the Eagle numbers (below). Confirmations mean "no contradicting evidence found," not independent community verification.

**Too thin to call (1):** Grym (above).

**Catalog gap (1):** **Eagle (new) has no flight numbers in the Atlas.** Innova, Infinite (131 ratings) and 39 raw ratings all say 7/4/-1/3, and `flights.json` already holds that row, unmatched. An explicit override for the "Eagle (new)" approval (the DD3 (new) pattern) would put it on the map; whether it is wanted is yours, and it should not touch "Eagle (old)."

**Linked-set results (the batch brief's watches):**
- **Innova fairway family (Leopard / Eagle / TeeBird / Teebird 3 / Thunderbird / Firebird):** Atlas, Innova pages and Infinite pools agree on the order on both axes; nothing moves (table above).
- **Mako 3 / Buzzz:** ordering holds; Buzzz turn soft watch and Mako 3 glide noted; nothing moves.
- **Destroyer / Roc overrides:** above.
- **Grym:** retailer pooling is clean on Infinite (Grym and Grym X are separate pages; K1 Line, K1 Glow and X-out only; 27 ratings), but the printed Grym number itself differs between retailers, and that is the hazard to know about. The brief's "usual retailer-pooling hazards" otherwise did not bite.

**Spot-checks needed before any override source note:** the Grym retailer numbers (Infinite -1 and Rocket -1 against Reaper, Titan, Gotta Go Gotta Throw, Fade Gear, Drop Zone and Simply Disc Golf -2, and OTB 13/6/-3), the Titan slug (`13-5-1-2`) against its title, any Kastaplast statement on the Grym's numbers or discontinuation (a Wayback copy of a Kastaplast Grym page would settle it), the Grym K1 Line tallies (24 rows against the page's 23; one duplicated reviewer) and the four K1 Glow ratings; the Destroyer Star and Champion tallies (-0.95/3.02, -0.91/3.03; the two excluded outliers); the Roc KC Pro tally (2.42; skill tags hand-keyed); the Mako3 glide share (~70% at 4); the Buzzz team page (5/4/-1/1, stability 0.5) and my note about the first fetch's "0.5 fade"; the Flaschner quotes and the Reaper, Discount Disc Golf and Sabattus blog quotes (all via the summarizing fetch); the "Grym/Grym X discontinued, Guld the replacement" search-summary claim; and the shrinkage arithmetic (K1 Glow does not fit an eight-phantom model).

**Methodological finding (Infinite pages, extends batches 14-15):** the shrinkage hypothesis fits the Roc KC Pro page and the Grym K1 Line page (printed within 0.1 of raw plus eight phantoms at the display) but not the Grym K1 Glow page (four ratings, printed -1.4 against -1.8 predicted), so the phantom weight is not a constant eight on very small pages. Treat printed Infinite averages as understating deviation, most on pages under about 25 ratings, and recompute from raw ratings whenever they are visible. Still my arithmetic on fetch-step data.

**Process notes for the next batch**

- **The brief's list was not `featured.js` order (see the corrections at the top).** The next entries in the live file after Havoc are **Maverick, Diamond, Evader, PA4, Raider, X3, Dart, Resistor, Fierce, Guld** (Maverick, Evader and Raider link to the Dynamic set; Guld links to this batch's Grym; Dart is Innova); re-verify against `public/featured.js` before starting, because the file may change. Grym, Teebird 3, Eagle and Mako 3 are now done regardless of their position in the list.
- **Retail-side hazard watch carried forward:** Prodigy renumbering (July 2023); Thought Space renumbered the Synapse once; Omega's second catalog; Gateway mold revisions (Blade and others); **new this batch: retail copies can disagree on a discontinued or revised Kastaplast number (Grym 13/5/-1/2 on Infinite and Rocket, 13/5/-2/2 on six others), so check a Kastaplast mold against several retailers before trusting one catalog, and Infinite's catalog is not automatically the newest.**
- **Open-candidate running list (nothing applied by this lane):** open: **Predator turn +1 → 0 (gated), D2 turn 0 → -0.5 (PARKED, owner decision Oct 3, 2026, not closed), D1 fade 4 → 3.5 (PARKED, owner decision Oct 3, 2026), Defy turn -1 → -0.5, Havoc turn -1 → -1.5, Grym turn -1 → -1.5 / -2 (new this batch)**; carried unchanged: MD3 (new) fade, Tesla turn -1 → -0.5, Fury fade 2 → 1.5, Quasar turn 0 → -0.5 (batch 12, held at 0); stay as-is: Monarch -4, Toro +1; pending in the main tree (this tree's overrides file has neither): Synapse turn -1, Astra turn -1.5; applied and present in this tree: **Roc 2.5 (re-checked and supported this batch)**, **Destroyer -0.5/3.5 (re-checked: stands on Innova copy)**, Luna 3/4/0/2, Trident 3.5, Gator 4, Trespass -1. Soft watches: Falk turn, Svea turn, A1/A2 spacing, PA3 fade, Lots turn, Voodoo fade, PD2 fade, PD2/Enforcer, Stingray Star turn, Orion LF fade, Tantrum fade, Quasar fade 3 → 3.5, D3 and F3 reviewer-versus-printed gaps, Volt Neutron turn 2024-25, Saint turn, Nitro turn, Blade mold-revision hazard, **plus this batch's Buzzz turn**. **Catalog-identity flag still open:** FD1/FD2/Instinct (batch 11). **Catalog notes:** Omega (batch 14), Giant/Giant Reborn speed (batch 15), **Eagle (new) unnumbered and Mako 3 glide (this batch)**.
- **Linked sets re-checked this batch:** Leopard/Eagle/TeeBird/Teebird 3/Thunderbird/Firebird, Buzzz/Mako 3/Roc/Zone, Destroyer/Wraith/Boss/Shryke/Sheriff/Trespass/Enforcer/XCaliber/Grym/Thunderbird, Grym/Grym X/Guld/Vass/Wraith/Katana/Destroyer. Nothing moves beyond the one open candidate.
- Reachable manufacturer paths this batch: `www.innovadiscs.com/disc/{destroyer,roc,firebird,thunderbird,teebird3,eagle,leopard,mako3,wraith}/`, `www.team.discraft.com/discs/buzzz`, `www.kastaplast.com/en-us/collections/guld` (no Grym page found on kastaplast.com). Infinite slugs: `/innova-{destroyer,roc,firebird,thunderbird,teebird3,eagle,leopard,mako3}`, `/discraft-buzzz`, `/kastaplast-grym`, `/kastaplast-grym/k1`, `/Kastaplast-Grym/K1-Glow`, `/kastaplast-grym-x`; plastic pages `/Innova-Destroyer/{Star,Champion}`, `/Innova-Roc/{DX,Star,KC-Pro,Champion}`, `/Innova-Firebird/{Star,Champion}`, `/Innova-Thunderbird/{Star,Champion}`, `/Innova-TeeBird3/{Star,Champion}`, `/Innova-TeeBird/Star`, `/Innova-Eagle/{Star,DX}`, `/Innova-Leopard/{Star,DX}`, `/Innova-Mako3/{Star,Champion,DX}`, `/Innova-Wraith/Star`, `/Discraft-Buzzz/ESP`; `/Kastaplast-Grym/K1-Line`, `/Discraft-Buzzz/Z-Line` and `/Discraft-Buzzz/Z` 302.
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access reads the DGCR "Kastaplast Grym" thread and any Kastaplast statement on the Grym's numbers or discontinuation, then the Wraith-vs-Destroyer and Boss/Destroyer/Wraith threads (does anyone state the Destroyer is measurably more stable), then a skill-stratified ESP/Z Buzzz sample and the Mako3 glide question, then still the Havoc, Defy, Volt, D1, D2, Tesla and MD3 items.

---

# Batch 17 (Plan 10, Phase 2)

Researched October 3, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (already up to date at `e704d34`; the queue doc is still the only locally modified file).

## Disc list and order basis

**Basis: strict `public/featured.js` file order, skipping every mold that already has an entry in batches 1-16.** I read `public/featured.js` after the merge (176 lines) and also fetched the live file (`https://disc-atlas-public.disc-atlas-explorer.workers.dev/featured.js`, HTTP 200, 10,867 bytes). **The two files are identical** (diff clean after line-ending normalization), so there is no repo-versus-live discrepancy to report. Havoc is line 151 and **Maverick is line 152, as batch 16 said (verified)**. Checked against the queue's entry headings: none of the next ten has an entry (Diamond, PA4, Raider, Maverick, Evader and Guld appear only inside earlier "linked" lists, and Gateway's "Diamond" is a plastic, not this mold).

The ten, in file order (Atlas ids): **Maverick** 9a18cbca26b0 (Dynamic Discs, line 152), **Diamond** 29701ec9ad87 (Latitude 64, 153), **Evader** f72bed9bdeea (Dynamic Discs, 154), **PA4** 8434bed1bf8a (Prodigy, 155), **Raider** db9e8fd17b4a (Dynamic Discs, 156), **X3** 76c8dfb06e64 (Prodigy, 157), **Dart** 3967be4cf6a6 (Innova, 158), **Resistor** 33da281c0a64 (MVP, 159), **Fierce** becf375dae3f (Discraft, 160), **Guld** 5e7334712fe0 (Kastaplast, 161). This is exactly the list batch 16 predicted.

## Decided items and standing rules (recorded before the research)

- **Plastic baseline policy:** a mold's reference numbers are its most-thrown plastic (Star for Innova drivers). DX is the price-tier baseline but **not** the flight reference. No sales data; each entry names the reference plastic I took to be the most-thrown and marks it "assumed." For the Dart (a putter) I took the most-rated Infinite plastics (R-Pro 26, DX 21, Star 13) and checked that Star reads the same.
- **Review gate:** weak evidence = no correction; |Δ| = 1.0 changes need the owner's call; record open candidates instead of proposing them.
- **Never average across plastics:** mold-level consensus plus a `plasticVariance` note. Where I quote a mold-level Infinite pool it is a coarse sanity check, with per-plastic figures beside it.
- **Infinite anchoring (batches 14-16):** printed "Reviewer Flight Numbers" are shrunk toward the displayed numbers; recomputed from raw ratings for all ten (see Evidence limits, which also adds one refinement).
- **Carried parked items (owner decisions, Oct 3, 2026):** D2 turn 0 → -0.5 and D1 fade 4 → 3.5 stay parked. Nothing here touches either.

---

## Batch 17 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Maverick | 7/4/-1.5/2 | none | Confirmed as-is (Atlas = Dynamic's page; **Infinite's printed -1 is the outlier**) | 0.8 |
| Diamond | 8/6/-3/1 | none | Confirmed as-is | 0.8 |
| Dart | 3/4/0/0 | none | Confirmed as-is | 0.8 |
| Evader | 7/4/0/2.5 | none | Confirmed as-is | 0.75 |
| PA4 | 3/3/-1/1 | none | Confirmed as-is | 0.75 |
| Fierce | 3/4/-2/0 | none | Confirmed as-is (soft watch: turn skews stable) | 0.75 |
| Raider | 13/5/-0.5/3 | none | Confirmed as-is (soft watch: 2023+ fade reads 2.5, then 2.1) | 0.7 |
| Resistor | 6.5/4/0/3.5 | none | Confirmed as-is (pooled fade 3.3 is an old-display blend; 2020+ ratings read 3.5) | 0.7 |
| X3 | 12/6/-1/2 | none | Confirmed as-is (turn/fade); glide 6 vs Infinite's stale 5 noted | 0.65 |
| Guld | 13/5/-0.5/3 | none | Confirmed as-is (thin: 9 ratings, nothing contradicts) | 0.6 |

**No changes proposed, no new open candidates, no too-thin-to-call verdicts** (Guld is the thinnest and nothing contradicts it). **Four soft watches** (Raider fade, Fierce turn, Resistor high-power fade, Maverick fade tail), **four flags on linked molds that are not among the ten** (Grym X, X2, X4/D3 stale Infinite lines, PA2), and **one retailer-lag finding** (Infinite's Maverick turn).

**Diff against `flights.json` / manufacturers (done first):** all ten Atlas numbers equal the Marshall Street snapshot (`data.json` `flightSource` is Marshall Street for all ten), none has an override (0 hits for the ten ids in `verified-model-overrides.json`), and **all ten match the manufacturer's own page on turn and fade** (details per disc). **No Luna/Gator-style Atlas lag.** The only catalog drift is retailer-side: Infinite prints Maverick turn -1 (Dynamic, Rocket and the Atlas print -1.5) and X3 glide 5 (Prodigy and the Atlas print 6).

## Dynamic Discs 13-speed set re-check (Raider / Trespass / Enforcer / Defender / Sheriff / Guld / Destroyer), done as a set

**Answer: the order holds and nothing moves.** Dynamic's own Raider copy places it "comfortably between the Trespass and Enforcer in stability."

| Disc | Atlas (S/G/T/F) | Infinite mfr line | Infinite raw pool (my recompute, all plastics) |
|---|---|---|---|
| Trespass | 12/5/-1/3 (applied override) | 12/5/-0.5/3 | -1.13/2.70 (157 rated) |
| Raider | 13/5/-0.5/3 | 13/5/-0.5/3 | -0.64/2.84 (77) |
| Sheriff | 13/5/-1/2 | 13/5/-1/2 | -1.06/2.02 (85) |
| Defender | 13/5/0/3 | 13/5/0/3 | -0.02/3.11 (71) |
| Enforcer | 12/4/0.5/4 | 12/4/0.5/4 | +0.25/3.85 (55) |
| Guld | 13/5/-0.5/3 | 13/5/-0.5/3 | -0.61/2.89 (9) |
| Destroyer (batch 16) | 12/5/-0.5/3.5 (applied) | 12/5/-1/3 | -0.95/3.02 (Star, 101 raw) |

- Infinite still prints the Trespass at 12/5/-0.5/3, the number the batch 8-10 override moved away from; the raw pool (-1.13/2.70) supports the applied -1. Not re-opened.
- **Turn order in the pools:** Trespass -1.13 < Raider -0.64 < Defender -0.02 < Enforcer +0.25. **Fade order:** Sheriff 2.02 < Trespass 2.70 < Raider 2.84 < Defender 3.11 < Enforcer 3.85. Both match Dynamic's "Raider between Trespass and Enforcer." The Atlas has Trespass and Raider on the same fade (3); the pools put them 0.14 apart, which is noise.
- **Reviewer cross-comparisons (Infinite Raider text, skill and plastic given):** "very similar to a Destroyer," "flies like a beat-in Destroyer" (several, intermediate/advanced); "lower-profile Destroyer/Wraith" (advanced, 12/4/-1.5/2); "more over-stable than a Wysocki Destroyer but not as stable as a 4x" (advanced, 2020); "between a Sheriff and a Defender, or a somewhat broken-in Star Destroyer" (intermediate, 2020); "I prefer the tad more stable Defender" (intermediate, 2020). From the Guld side: "a slightly more overstable complement to my Lucid Raider … almost like a RaiderX in Kastaplast terms" (intermediate, 2023). Raider ≈ Destroyer, a touch below Defender and Guld: the Atlas arrangement.
- **Raider vs Destroyer (batch 16 re-check):** the Atlas Destroyer sits at -0.5/3.5 and the Raider at -0.5/3. The Raider's raw pool reads less turn than the Destroyer's (-0.64 vs -0.95) and reviewers call the two near-identical in flight. No change.

## Dynamic Discs 7-speed set (Maverick / Evader / Escape / Vandal / Getaway), done as a set

Pools (Infinite raw, mold level): **Maverick -1.57/1.75 (85)**, Vandal -1.46/1.88 (38), Escape -0.97/1.91 (175), Getaway -0.52/2.69 (65), **Evader -0.14/2.38 (28)**. Atlas: -1.5/2, -1.5/2, -1/2, -0.5/3, 0/2.5. **Turn order and gaps agree layer by layer** (Maverick a half-step more turn than Escape in the pools as in the Atlas; Evader at the stable end). Dynamic's Evader copy says it fills "the distance gap between your 5-speed midranges and 9-speed fairway drivers, like the Escape or the Getaway," a speed statement, not a stability one. Reviewer cross-comparisons: Maverick "a lot like a little sister to the River or a more stable Diamond" (beginner), "acts a lot like an Escape … a touch shorter" (advanced), "the flight of a nice broken-in Escape fresh out of the box" (intermediate), "very Leopard-like" (several); Evader "between a Latitude 64 Explorer and a Legacy Rival" (beginner), "like the Felon and River had a baby" (intermediate), "a more domey TeeBird … or a touch more stable Explorer" (intermediate). Nothing moves.

## Prodigy PA and X sets (PA1-PA5, X2/X3/X4/D3), and the 2023 renumbering watch

- **Brief's renumbering watch (July 2023): checked per disc.** Prodigy's own pages print **PA-4 3/3/-1/1** (nav list and the 400-plastic page) and **X3 12/6/-1/2** (the only X3 listing left on prodigydisc.com is a 200-plastic Geometry Series Stamp page; the filter count for X3 is 1 and the X-series is absent from Prodigy's nav). PA-4 matches the Atlas and Infinite, with no sign of an A-series-style change (consistent with batch 7's PA3 finding). **The X3 shows the hazard on glide only:** Prodigy and the Atlas print glide 6, **Infinite prints 12/5/-1/2** (so does DiscMetrics' generated page), and 21 of the 26 Infinite ratings echo glide 5. Turn and fade (-1/2) are the same in both number sets, so the pollution does not reach the turn/fade question for these two.
- **PA series raw pools (Infinite, all plastics):** PA2 -0.04/1.25 (24 rated; printed fade 1.5), PA3 -0.02/1.15 (87), PA4 -0.92/0.86 (33), PA-5 -2.15/0.30 (23). Atlas: PA1 0/2.5, PA2 0/2, PA3 0/1, PA4 -1/1, PA-5 -2/0.5. **PA4 and PA-5 fit.** **Flag, not a candidate (PA2 is not among the ten and has no entry):** the pools put PA2 and PA3 about 0.1 apart on fade (1.25 vs 1.15) while the Atlas puts them a full point apart (2 vs 1); PA2's adv/pro subset (14) reads 1.36. Prodigy's own PA-2 line prints fade 2, and the PA2 pool may carry older numbers; worth one look when PA2 comes up.
- **X series raw pools:** X2 -0.19/3.69 (18), **X3 -0.98/2.08 (26)**, X4 -2.17/2.0 (12). **Turn order X2 > X3 > X4 holds**, and Prodigy's X3 copy ("slightly less stable than the X2 … exceeds [the X1 and X2] in turn and glide") agrees. **Flags on linked molds, not reviewed here:** Infinite's mfr lines for **X2 (13/4.5/0/4)** and **X4 (13/5/-2.5/2)** differ from the Atlas (X2 12/5/0/2, X4 12/6/-2/2), and the X2 raw fade (3.69) sits far from the Atlas's 2. Prodigy's site no longer lists the X-series in its nav, so I could not read current X2/X4 numbers; either Infinite carries pre-renumbering lines or the Atlas X2 fade is stale. **Worth a check when the X-series is reached** (X2 is the one that matters: fade 2 vs 3.7). Infinite's D3 mfr line (12/6/-2/2) also still reads old numbers against Prodigy's current D3 12/5/-1/3 (batch 13 territory, unchanged).

## MVP set (Resistor / Shock / Servo / Switch)

Pools: **Resistor -0.06/3.32 (60 rated)**, Shock -0.19/2.44 (16 rated of 35), Servo -0.89/1.89 (38), Switch -1.54/1.14 (14). Atlas: 0/3.5, 0/2.5, -1/2, -1.5/1. MVP's Resistor page lists it in the same class as Servo and Switch, and Infinite's description says it is "a more overstable driver than the Shock." **The order holds on both axes** (fade 3.3 > 2.4 > 1.9 > 1.1). Nothing moves.

## Latitude 64 control-driver set (Diamond / Jade / Sapphire / Fury)

Pools: **Diamond -3.12/0.98 (79 rated)**, Jade -1.96/1.40 (35), Sapphire -1.72/1.70 (45). Atlas: -3/1, -2/1, -2/1.5 (Fury -2/2). The Diamond is the most understable L64 driver in every layer, a full point of turn below Jade and Sapphire. Nothing moves.

## Kastaplast (Guld / Grym / Grym X / Vass), batch 16's link, with one new datum

- **Guld stands at -0.5/3 in every layer** (Kastaplast's product page, Infinite, Rocket, 9 reviewers); see the Guld entry. It does not bear on the open Grym turn candidate (Grym -1 → -1.5/-2), except that one Guld reviewer says it is the stable bomber people wanted "since the GrymX inconsistencies" (beginner, 2022), which names the Grym X, not the Grym.
- **New datum on a linked mold (Grym X, Atlas 12.5/5/0/3, not reviewed):** the 17 raw Infinite ratings (K1 Line 13, K1 Soft 2, K1 Glow 2) average **11.7/4.9/-0.91/2.21**; the printed pool is **12.3/5/-0.4/2.6**, shrunk toward the display far more than the 0.1 seen on large pages (closing the gap takes roughly 16-22 phantom ratings at the display; rounding makes that imprecise). Without the one +2 turn outlier the raw turn is -1.06. Retailers (batch 16) print 0/3. **Soft watch: Grym X turn 0 → -0.5 (|Δ| 0.5).** Mixed plastics (K1 Soft included), no arm speeds, 17 ratings. Review it with the Grym, as batch 16 asked.

## Evidence limits — batch 17

Same tooling limits as earlier batches (Reddit blocked and not attempted, YouTube unreachable, DGCR 403: the Raider and Diamond threads appear only as search titles and are not cited as evidence). Specific to this batch:

- **Method upgrade, for whoever runs the next batch.** Individual Infinite review text and ratings are readable after all: each mold page makes a plain POST to `https://infinitediscs.com/Disc/DiscComments` with a JSON body `{"ModelId": "<hf_model_no from the mold page>", "PlasticId": "", "SkillLevel": "", "DrivingDistance": "", "StarRating": "", "CommentDate": ""}`, and the JSON that comes back is the **complete** review list (every reviewer's four ratings, skill label, plastic, throwing distance where given, date and text). The returned counts equal the page counts for all ten molds (Maverick 85, Diamond 107, Evader 28, PA4 45, Raider 77, X3 26, Dart 106, Resistor 69, Fierce 41, Guld 9). Some reviews carry no flight ratings (Diamond 79 of 107 do, Dart 74 of 106, Resistor 60 of 69, PA4 33 of 45, the rest all). **All tallies below are computed over the rated reviews by script, not hand-counted**, and need only the usual spot-check. I fetched Infinite, Dynamic Discs, Kastaplast, Latitude 64, MVP, Prodigy, Innova, Discraft and the reviewer blogs directly (curl plus my own HTML-to-text), **so manufacturer numbers and Infinite review text in this batch are verbatim page text, not summarizer output.** Search-engine summaries remain summaries and are flagged where used. Nothing was saved into the repo.
- **Refinement of the anchoring rule: raw ratings echo whatever Infinite displayed when the reviewer rated, not today's display.** Two pages show it. **Maverick:** ratings through February 2023 cluster at exactly -1.5/2 (Dynamic's number); the four ratings from November 2023 to March 2024 all sit at exactly turn -1 (Infinite's current display), which reads as Infinite editing its Maverick turn from -1.5 to -1 in 2023 (inferred from the echoes, not verified). Counted against today's -1, 74 of the 85 ratings look like "moves toward more turn," which would be wildly misleading. **Resistor:** before 2020, 19 of 32 ratings sit at fade 3, 20 at speed 6 and 13 at exactly 6/4/0/3 (none at 6.5/4/0/3.5); from 2020, 16 of 28 sit at fade 3.5, 11 at speed 6.5 and 6 at exactly 6.5/4/0/3.5. The display evidently changed around 2020 (an Infinite or MVP edit; not verified which). **Practical rule: before reading any "mover" count, split the raw ratings by year and see where the echo cluster sits.** I report era splits wherever they changed a reading.
- **Printed versus raw on these ten pages:** the printed Infinite averages sit within 0.1 of my raw means on every large pool (Maverick printed 7/4.2/-1.5/1.8 against raw 7.05/4.27/-1.57/1.75; Raider 12.9/5/-0.6/2.9 against 12.84/4.98/-0.64/2.84; Diamond 7.9/6/-3.1/1 against 7.92/5.98/-3.12/0.98), with the usual pull toward the display on speed and glide (Guld speed raw 12.78, printed 12.9; Resistor glide raw 3.83, printed 3.9). None of the ten has a turn or fade that moved by more than 0.1 in printing, so the anchoring did not change any verdict here. **It did on the linked Grym X page** (raw -0.91/2.21, printed -0.4/2.6, 17 ratings), noted in its set above.
- **The slider is mostly the display echoed back**, as in batches 14-16: Diamond 61 of 79 at exactly -3, Fierce 34 of 41 at exactly -2, Dart 70 of 74 at turn 0 and 63 of 74 at fade 0, PA4 29 of 33 at exactly -1, Raider 49 of 77 at -0.5 and 59 of 77 at fade 3. The informative signal is the minority who move; I report movers and their direction.
- **Inside the Circle's "flight numbers" are Infinite's reviewer numbers** (its Maverick review prints 7/4.3/-1.6/1.8, close to Infinite's pool of 85 and sold through Infinite links), so it is not independent evidence for numbers. Its prose is still a named reviewer's description. **DiscMetrics** pages are templated from the catalog numbers (its X3 page still prints 12/5/-1/2) and carry no review data, so they get no weight. **Disc Golf Examiner's** Raider and Maverick pages are video embeds with no readable text. **Disc Golf Puttheads'** Raider "flight chart" is templated SEO copy (weight 0.1).
- **Arm speeds:** none stated anywhere. Infinite reviewers give skill labels (as typed by the reviewer) and, for a minority, throwing distances; both noted per disc. Skill splits are listed where the groups are large enough to read.
- **No outliers excluded.** The tails are in: Diamond has five -5 turn ratings, Dart one -2, X3 one +2 turn (a beginner, "9/3/2/2") and a few off-axis speed/glide inputs. None moves a mean by more than 0.1.
- **Retailers other than Infinite:** Rocket Discs agrees with the Atlas for Maverick (-1.5/2), Guld and Raider; Marshall Street is the Atlas baseline. Rocket's Resistor listing prints speed 7 in its first block and 6.5 elsewhere (speed is out of scope). I did not find a second independent retailer layer for the other molds beyond search-result listings.

---

## Maverick — Dynamic Discs (id 9a18cbca26b0)

- **Atlas now:** 7/4/-1.5/2 (source: Marshall Street snapshot; PDGA approval 17-123, Dec 4, 2017; no override). **Proposed turn/fade:** none. Matches Dynamic's page. Reference plastic (assumed most-thrown): Lucid (51 of 85 Infinite ratings; Dynamic also sells Prime, Fuzion, Drift and Lucid-X).
- **Manufacturer:** Dynamic's collection page (fetched): **7/4/-1.5/2**, no stability label. Copy: "The Maverick can fit in nearly every player's bag. The Maverick's smaller rim offers controllable fairway speed and straighter flights for slower arms with trustworthy anhyzers and slow turns for experienced players. The Maverick shines in the woods with low ceilings and tunnel shots." Shots: "Straight at medium speed, easy turnovers at higher speed, carving gaps in the woods." Copy and numbers agree; the description is skill-dependent (straight for slow arms, turning for fast ones), not a numeric contradiction.
- **Retailer:** Infinite label "Understable"; **its mfr line reads 7/4/-1/2, not Dynamic's -1.5**; reviewer numbers 7/4.2/-1.5/1.8 (85 reviews, 4.46 stars). Rocket Discs prints 7/4/-1.5/2. Marshall Street is the Atlas baseline. **This is the Luna/Gator lag pattern reversed: the retailer, not the Atlas, is off** (Infinite's -1 looks like a 2023 edit; see Evidence limits).
- **Community (Infinite raw, all 85 rated, 2018-2025; computed):** mean **7.05/4.27/-1.57/1.75**, median -1.5/2. Turn: -3 (2), -2.5 (2), -2 (15), **-1.5 (55)**, -1 (9), -0.5 (2). Fade: 0.5 (1), 1 (13), 1.5 (15), **2 (55)**, 3 (1). **By skill:** advanced 20 -1.48/1.77; professional 2 -1.5/2.0 (advanced and professional together, 22: -1.48/1.79); intermediate 52 -1.61/1.69; beginner 11 -1.59/1.95. **By era:** through 2022 (78) -1.58/1.76; 2023 onward (7) -1.43/1.64. Text points both ways, as a skill-dependent mold would: "this disc turns too much without having the glide necessary to keep it in the air" (intermediate, 175g Lucid, 2022), "very flippy, possibly a little more than the flight ratings suggest" (intermediate, 2018, rated -3/1); against "for me when RHBH this disc is very stable. It holds almost a direct straight line" (beginner, Lucid, 2020), "Straight, Straight, Straight" (beginner, 2021), "true to numbers in my experience" (intermediate, 2021), "for me it's pretty dead straight with some mild [turn]" (intermediate, 2019). Many intermediates call Lucid Mavericks "finicky" or "inconsistent." Comparisons: Escape (three reviewers), Leopard (several), "more stable than a Seer or Underworld" (intermediate), "what the Leopard3 wishes it was" (advanced), "little sister to the River or a more stable Diamond" (beginner). **Named reviewer:** Inside the Circle (Brandon, May 2021): "fly very straight for you with average power before fading out mildly in the last third," "can be ripped on harder for a finish to the right"; his printed numbers are Infinite's (not independent).
- **Soft observation, not a candidate:** fade reads 1.75 raw (29 of 85 below 2, one above; Fuzion Burst 1.28 on nine ratings, Lucid 1.78), a gap of 0.25 that sits inside one plastic's spread and inside a half-step. No arm speeds. Does not clear the review gate.
- sources:
  - {name: Dynamic Discs Maverick collection page (7/4/-1.5/2; copy), url: https://www.dynamicdiscs.com/collections/dynamic-discs-maverick, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Maverick (mfr line 7/4/-1/2; reviewers 7/4.2/-1.5/1.8; 85 ratings; raw list via DiscComments), url: https://infinitediscs.com/dynamic-discs-maverick, type: retailer, weight: 0.5}
  - {name: Infinite Discs Lucid Maverick (plastic page, 7.1/4.2/-1.5/1.8), url: https://infinitediscs.com/Dynamic-Discs-Maverick/Lucid, type: retailer, weight: 0.3}
  - {name: Rocket Discs Maverick (7/4/-1.5/2), url: https://rocketdiscs.com/dynamic-discs-maverick, type: retailer, weight: 0.2}
  - {name: Inside the Circle DG Maverick review (Brandon; numbers are Infinite's), url: https://www.insidethecircledg.com/post/dynamic-discs, type: community, weight: 0.3}
  - {name: Infinite reviewer text, 85 raw ratings (skill and plastic labelled; no arm speeds), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.4}
- **confidence:** 0.8
- **consensusNote:** Dynamic's page, Rocket, the Atlas and the 85 reviewers (-1.57 raw, -1.48 for advanced/professional, mode and median -1.5) all land on -1.5/2. The only dissent is Infinite's own mfr line (-1), which the reviewers themselves overrule and which looks like a retail edit. Nothing supports moving the Atlas.
- **plasticVariance:** Lucid is the touchy plastic (-1.62/1.78, 51 ratings); Prime Burst -1.5/1.89 (9); Fuzion Burst -1.67/1.28 (9); Fuzion X -0.5/1.75 (2), Lucid X -1.5/2 (2) and BioFuzion -1.75/1.5 (2) are too thin to rank, though two advanced reviewers say the X plastics are "far more stable." Dynamic prints one set of numbers. Do not average.
- **Linked:** Escape (9/5/-1/2; pool -0.97/1.91), Vandal (9/5/-1.5/2; -1.46/1.88), Evader, Leopard (6/5/-2/1), River (7/7/-1/1), Explorer (7/5/0/2). Set re-checked above; nothing moves.

## Diamond — Latitude 64 (id 29701ec9ad87)

- **Atlas now:** 8/6/-3/1 (source: Marshall Street snapshot; PDGA approval 11-14, Mar 21, 2011; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Opto (42 of 79 rated; Gold Line 9, Opto Air 8, others small).
- **Manufacturer:** Latitude 64's Diamond collection page (fetched): **8/6/-3/1, "Understable."** Copy: "Diamond is the choice of disc for beginners, children and players with moderate arm speed. It is mainly produced in lower weights which makes it easy to throw and control. It has an understable flight path with good glide and slight fade." Copy and numbers agree.
- **Retailer:** Infinite label "Very Understable"; mfr line 8/6/-3/1; reviewer numbers 7.9/6/-3.1/1 (107 reviews). Infinite's description: "the BEST disc golf driver for beginners … just the right speed, turn, and glide to maximize distance for weaker throwers." Marshall Street is the Atlas baseline.
- **Community (Infinite raw, 79 rated of 107, 2014-2025; computed):** mean **7.92/5.98/-3.12/0.98**, median -3/1. Turn: -5 (5), -4.5 (1), -4 (4), -3.5 (1), **-3 (61)**, -2.5 (4), -2 (2), -0.5 (1); fade 1 on 67 of 79. Movers: 11 to more turn, 7 to less. **By skill:** beginner 25 -2.96/1.0; intermediate 42 -3.26/0.98; advanced 10 -2.95/0.95; professional 2 -3.0/1.0 (advanced and professional together, 12: -2.96). The intermediates with more arm skew flippier; text: "way more understable than I expected … basically unusable" (intermediate, 250 ft, 159g Opto Air, 2025), "something like a -4 or -5 turn, brand new, first throws" at an "armspeed about 8" (intermediate, 2023), "I cannot fully communicate how understable this disc is … I have about 350ft distance worth of normal golf power (400ft is a crush)" on a 155 g Gold X-Out (intermediate, 2023, rated -5), "this 8 speed driver tends to feel like a 9 speed driver at times" (beginner, 2020); against "a nice -3 to -4 turn with a solid fade" on a seasoned 158g (intermediate, 2018), "fly just as straight and far as higher-speed discs" (intermediate, moderate arm, Gold Line, 2020), "stays straight the entire time if thrown well" (beginner, 2018). The mold is aimed at moderate arms, so the reviewers with the fastest arms (350 ft+ drives) read the most turn, which fits the manufacturer's own audience statement and is not a mold-level disagreement. Altitude: "because of the thin air here, it's not as understable as the numbers suggest" (intermediate, Opto Air, 300 ft, 2024).
- sources:
  - {name: Latitude 64 Diamond collection page (8/6/-3/1, Understable), url: https://www.latitude64.com/collections/diamond, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Diamond (mfr 8/6/-3/1; reviewers 7.9/6/-3.1/1; 107 reviews; raw list via DiscComments), url: https://infinitediscs.com/latitude-64-diamond, type: retailer, weight: 0.5}
  - {name: Infinite reviewer text, 79 raw rated reviews (skill, plastic, distance labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.4}
  - {name: DGCR "Lat 64 Diamond" thread (search title only, not read), url: https://www.dgcoursereview.com/threads/lat-64-diamond.85170/, type: community, weight: 0.1}
- **confidence:** 0.8
- **consensusNote:** Manufacturer, Infinite's printed numbers and 79 raw ratings (77% at exactly -3, mean -3.12, the movers split 11/7) all say -3/1, with the reviewers who throw hardest reading the most turn, as the "moderate arm speed" copy predicts. Nothing supports moving it.
- **plasticVariance:** Opto -3.23/0.95 (42), Gold Line -2.94/1.0 (9), Opto Air -2.75/1.19 (8), Frost Line -3.2/0.8 (5), Opto Moonshine -2.83/1.0 (3); spread inside 0.5 turn. Latitude 64 prints one set of numbers. Weight matters more than plastic here: Opto Air at 145-150 g is the flippiest. Do not average.
- **Linked:** Sapphire (10/6/-2/1.5), Jade (9/6/-2/1), Fury (9/6/-2/2) and Hades (12/6/-3/2). Set re-checked above; the Diamond is a full turn point below Jade and Sapphire in the pools and the Atlas. Nothing moves.

## Evader — Dynamic Discs (id f72bed9bdeea)

- **Atlas now:** 7/4/0/2.5 (source: Marshall Street snapshot; PDGA approval 21-2, Jan 5, 2021; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Lucid (26 of 28 Infinite ratings).
- **Manufacturer:** Dynamic's collection page (fetched): **7/4/0/2.5**, no stability label. Copy: "your new go-to fairway driver … controllable speed with excellent glide and enough stability to hold the line, even into the wind … its consistent fade means that you can work it on anhyzer and know that it will get back to flat." Shots: "Overstable fairway shots, forehands, overhands, windy situations." Copy and numbers agree.
- **Retailer:** Infinite label "Overstable"; mfr line 7/4/0/2.5; reviewer numbers 7/4.1/-0.1/2.4 (28 reviews). Infinite's own copy: "overstability and low speed make for a straight flying disc with a reliable fade." Marshall Street is the Atlas baseline.
- **Community (Infinite raw, 28 rated, 2021-2025; computed):** mean **7.04/4.14/-0.14/2.38**, median 0/2.5. Turn: -1 (2), -0.5 (4), **0 (22)**; fade 1.5 (1), 2 (6), **2.5 (20)**, 3 (1). **By skill:** intermediate 20 -0.17/2.40; advanced 4 0.0/2.38; beginner 3 0.0/2.17; professional 1 -0.5/2.5 (advanced and professional together, 5: -0.1/2.40). 25 of the 28 ratings are from 2021-2022 (the disc is a 2021 release). Text: "absolute workhorse … stable/overstable … a more domey TeeBird … or a touch more stable Explorer" (intermediate, 2022, 7/5/0/2), "falls between a Latitude 64 Explorer and a Legacy Rival … surprisingly flippy for an overstable disc" (beginner, 2021), "has a little more turn than listed" (intermediate, 2021, -1/2.5), "flies longer than the Explorer … flew like a seasoned Striker" (advanced, 2021), "surprisingly not very fadey … flips in the wind" (intermediate, Fuzion Burst, 2024, 1.5 fade). Run variance is the theme: a professional carries three Evaders, "a flat Lucid that flips to flat and turns nicely, a domey one that flips to flat and glides forever … and a Lucid-X that won't turn over at all" (390 ft domey, 2022), and an intermediate says Lucid "has been inconsistent in the past, and the Evader is no exception" (2022).
- **Soft observation, not a candidate:** seven of 28 ratings sit below fade 2.5 and one above (mean 2.38), and three reviewers say it turns more than the 0 implies, yet 22 of 28 keep turn 0. All inside half a step and inside the run-to-run spread reviewers describe.
- sources:
  - {name: Dynamic Discs Evader collection page (7/4/0/2.5; copy), url: https://www.dynamicdiscs.com/collections/dynamic-discs-evader, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Evader (mfr 7/4/0/2.5; reviewers 7/4.1/-0.1/2.4; 28 ratings; raw list via DiscComments), url: https://infinitediscs.com/dynamic-discs-evader, type: retailer, weight: 0.5}
  - {name: Infinite reviewer text, 28 raw ratings (skill, plastic, distance labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.4}
- **confidence:** 0.75
- **consensusNote:** Manufacturer, Infinite's printed numbers and the 28 raw ratings (turn -0.14, fade 2.38, 22 of 28 at turn 0) agree on 0/2.5, and the cross-comparisons (Explorer, Legacy Rival, a domey TeeBird) put it at the straight-to-stable end of the 7-speeds where the Atlas has it. The recurring caveat is run and dome variance, not a mold-level number.
- **plasticVariance:** Lucid -0.13/2.42 (26); Fuzion Burst and Lucid X-Out one rating each. Reviewers say Lucid runs differ by dome (flat runs turn, domey runs glide and finish, Lucid-X holds) and that Fuzion Burst reads less fade; one rating each is not data. Do not average.
- **Linked:** Maverick, Escape, Getaway (9/5/-0.5/3), Sergeant (11/4/0/2.5), Explorer (7/5/0/2), TeeBird (7/5/0/2). Set re-checked above; nothing moves.

## PA4 — Prodigy (id 8434bed1bf8a)

- **Atlas now:** 3/3/-1/1 (source: Marshall Street snapshot; PDGA approval 13-19, Mar 5, 2013; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): 400 (11 of 33 rated; 300 has 6, 400G 4). Prodigy's own PA-4 page is the 400 plastic.
- **Manufacturer:** Prodigy's nav list and 400-plastic page (fetched): **3/3/-1/1** (the 400 page has four reviews). Copy: "an understable Putt & Approach disc. It is designed for all players and skill levels. The PA-4 will turn up when thrown hard and will then have a long glide and gentle turning finish." **Renumbering watch (July 2023): no change found.** The Atlas, Infinite and Prodigy agree, as batch 7 found for the PA3.
- **Retailer:** Infinite label "Understable"; mfr line 3/3/-1/1; reviewer numbers 2.9/3.1/-0.9/0.9 (45 reviews). Infinite's description: "a stable to understable putt and approach disc … beginners will enjoy the straight flight path. For drives, experienced players will notice a long glide and a gentle turning finish." Marshall Street is the Atlas baseline.
- **Community (Infinite raw, 33 rated of 45, 2013-2025; computed):** mean **2.89/3.12/-0.92/0.86**, median -1/1. Turn: -1.5 (1), **-1 (29)**, 0 (3); fade 0 (5), 0.5 (1), **1 (26)**, 2 (1). **By skill:** advanced 10 -1.0/1.0; professional 7 -0.86/0.79; intermediate 11 -0.95/0.82; beginner 5 -0.8/0.8 (advanced and professional together, 17: -0.94/0.91). Text: "much straighter than most and can really handle a lot of throwing power" (professional, 275 ft, 400, 2024, 2.5/3/0/0), "I will not use it as a driving putter because of how understable it is" (beginner, 2023), "easy to hyzer flip and it will turn all the way to the ground on a flat throw" (intermediate, 300 X-Out, 2019), "a bit understable on longer, more powerful throws" (intermediate, 2015), "surprisingly pretty stable out of the box" (intermediate, 300, 2015, 3/3/-1/2). Skill reads the expected way: harder throwers see the turn, softer throwers the straighter flight.
- sources:
  - {name: Prodigy PA-4 400 Plastic page (3/3/-1/1; copy), url: https://prodigydisc.com/products/prodigy-pa4-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs PA-4 (mfr 3/3/-1/1; reviewers 2.9/3.1/-0.9/0.9; 45 reviews; raw list via DiscComments), url: https://infinitediscs.com/prodigy-pa-4, type: retailer, weight: 0.5}
  - {name: Infinite reviewer text, 33 raw rated reviews (skill, plastic labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.4}
- **confidence:** 0.75
- **consensusNote:** Prodigy's page, Infinite's printed numbers and the 33 raw ratings (29 at exactly -1; mean -0.92/0.86) agree on -1/1, and the comments describe the same shape (turns up with power, long glide, gentle finish). No renumbering shows in the PA-4 data.
- **plasticVariance:** 400 -0.91/0.91 (11), 300 -1.08/1.17 (6), 400G -0.75/0.88 (4), 350G -1.0/0.5 (2); spread inside 0.35. One 500 rating reads fade 0 and one 750 rating reads glide 2; one rating each is not data. Do not average.
- **Linked:** PA1 (0/2.5), PA2 (0/2), PA3 (0/1), PA-5 (-2/0.5). Set re-checked above; PA4 and PA-5 fit, and the **PA2/PA3 fade spacing is flagged** (pools 1.25 vs 1.15 against Atlas 2 vs 1; PA2 not reviewed, nothing proposed).

## Raider — Dynamic Discs (id db9e8fd17b4a)

- **Atlas now:** 13/5/-0.5/3 (source: Marshall Street snapshot; PDGA approval 19-18, Feb 27, 2019; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Fuzion (33 of 77 ratings) or Lucid (30); the two read the same (-0.67/2.85 and -0.68/2.87), so the choice does not matter.
- **Manufacturer:** Dynamic's collection page (fetched): **13/5/-0.5/3.0**, no stability label. Copy: "The Raider is sure to steal its spot in bags of all skill levels. **The Raider sits comfortably between the Trespass and Enforcer in stability, and it excels at finishing forward instead of diving at the end of its flight.** Players with slower arm speeds will find a dependable, overstable driver that will gain them distance over the Enforcer or Defender, while faster arms will love the Raider as a workhorse driver." Copy and numbers agree.
- **Retailer:** Infinite label "Overstable"; mfr line 13/5/-0.5/3; reviewer numbers 12.9/5/-0.6/2.9 (77 reviews). Infinite's description: "similar to the Destroyer by Innova." Rocket Discs 13/5/-0.5/3. Marshall Street is the Atlas baseline.
- **Community (Infinite raw, 77 rated, 2019-2025; computed):** mean **12.84/4.98/-0.64/2.84**, median -0.5/3. Turn: -2 (1), -1.5 (4), -1 (18), **-0.5 (49)**, 0 (3), +0.5 (2); fade 1 (1), 2 (8), 2.5 (7), **3 (59)**, 3.5 (2). Movers: 23 to more turn, 5 to less; 16 to less fade, 2 to more. **By skill:** intermediate 36 -0.69/2.86; advanced 26 -0.62/2.81; beginner 12 -0.5/2.83; professional 3 -0.83/2.83 (advanced and professional together, 29: -0.64/2.81). **By era:** 2019-2022 (63) -0.63/2.92; **2023 onward (14) -0.68/2.46; 2024 onward (6) -0.67/2.08.** Text: Destroyer comparisons in about ten reviews ("This is DD's Destroyer," "flew and felt like a destroyer," "throws like a destroyer to me"; intermediate and advanced); first-run Raiders "super flippy" (advanced, 2019); Orbit DyeMax "the only Raider that 'matches the numbers' (being destroyer-like)," with Lucid next and "arguably hybrid and biofuzion (new)" less stable (intermediate, 2024); "They'll hold a bit of turn before fading, or if your arm speed is faster … they'll pop up and provide a little turn for you" (advanced, 2019); "a lightly seasoned Raider goes dead straight forever and then dumps hard left with a small flare" (beginner with a 375-400 ft arm, 2021). **Recent-run text:** "As many reviewers have said before, I would say the flight numbers are a bit off all the way around … flies a lot more neutral to understable for me" (intermediate, Fuzion, 375 ft, Jan 2025, rated 12/4/-1/2); "nowhere near as overstable as a disc with 3 fade should be" (advanced, Lucid, 500 ft, Aug 2024, 12/5/-1/2); "has some turn out of the box, I actually flipped it over a few times" (intermediate, Lucid, 375 ft, Jun 2024, 12/5/-1/2); "flies like a new Wraith … I would give it 12/5/-1.5/2" (beginner, 350 ft forehand, 2023). Search summaries (flagged): Raider "Trilogy's answer to the Destroyer," "sits between the Trespass and the Enforcer."
- **Soft watch, not a candidate: Raider fade 3 → 2.5 (|Δ| 0.5, ungated) and, weaker, turn -0.5 → -1.** The whole-pool picture is firm (mode and median -0.5/3, 64% at turn -0.5, 77% at fade 3), but the **2023-onward ratings read fade 2.46 on 14 ratings, and 2.08 on the last six**, with three of those six re-rating the whole disc as 12/5/-1/2, the same direction reviewers describe as "a newer, less overstable run." Fourteen ratings across plastics with no arm speeds is not enough to move a mold the other 63 ratings put at 3, and Dynamic's page still says 3. **If the 2025-2026 ratings keep reading 2 to 2.5, it becomes a candidate;** it would link to Trespass (turn/fade -1/3), Sheriff (-1/2), Destroyer (-0.5/3.5) and Guld.
- sources:
  - {name: Dynamic Discs Raider collection page (13/5/-0.5/3; "between the Trespass and Enforcer"), url: https://www.dynamicdiscs.com/collections/dynamic-discs-raider, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Raider (mfr 13/5/-0.5/3; reviewers 12.9/5/-0.6/2.9; 77 ratings; raw list via DiscComments), url: https://infinitediscs.com/dynamic-discs-raider, type: retailer, weight: 0.5}
  - {name: Rocket Discs Raider (13/5/-0.5/3), url: https://rocketdiscs.com/dynamic-discs-raider, type: retailer, weight: 0.2}
  - {name: Infinite reviewer text, 77 raw ratings (skill, plastic, distance labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.4}
  - {name: Disc Golf Puttheads Raider flight chart (templated SEO copy), url: https://www.dgputtheads.com/flight-charts/raider, type: community, weight: 0.1}
  - {name: DGCR "Dynamic Discs Raider" thread (search title only, not read), url: https://www.dgcoursereview.com/threads/dynamic-discs-raider.140053/, type: community, weight: 0.1}
- **confidence:** 0.7
- **consensusNote:** Manufacturer, Infinite's printed numbers and 77 raw ratings agree on -0.5/3 (mean -0.64/2.84, mode and median -0.5/3), and every cross-comparison (Destroyer, between Sheriff and Defender, between Trespass and Enforcer) is the Atlas arrangement. **Held at 0.7, not higher, because of the 2023-onward drift (fade 2.46, then 2.08) and a plastic and run spread that reviewers describe in strong terms.**
- **plasticVariance:** Fuzion -0.67/2.85 (33), Lucid -0.68/2.87 (30), BioFuzion -0.5/2.5 (4), Fuzion X-Out -0.83/2.83 (3), Hybrid -0.25/2.5 (2), Fuzion DyeMax 0.0/3.0 (2). Reviewers rank Orbit DyeMax most stable, then Lucid, then Hybrid and BioFuzion (intermediate, 2024); first-run Raiders and 2019 BioFuzion read flippy; run-to-run variance is called out repeatedly. Dynamic prints one set of numbers. Do not average.
- **Linked:** Trespass, Enforcer, Defender, Sheriff, Destroyer, Guld, Wraith (11/5/-1/3, "flies like a new Wraith" once). Set re-checked above; nothing moves.

## X3 — Prodigy (id 76c8dfb06e64)

- **Atlas now:** 12/6/-1/2 (source: Marshall Street snapshot; PDGA approval 17-72, Jun 11, 2017; no override). **Proposed turn/fade:** none. Matches Prodigy's page. Reference plastic (assumed most-thrown): 400 (13 of 26 ratings; 400G 10). **Catalog status:** the only X3 listing on prodigydisc.com is a 200-plastic Geometry Series Stamp page, the X-series is absent from Prodigy's nav, and Infinite's newest rating is from 2023, so the disc looks like a legacy or clearance line (unverified).
- **Manufacturer:** Prodigy's X3 product page (fetched): **12/6/-1/2**. Copy: "a consistent, very long flying, slightly over stable distance driver designed for all skill levels … slightly less stable than the X2, giving it a longer glide period in the middle of the flight path, and a softer left to right finish. The X3 matches the X1 and X2 in consistency but exceeds in turn and glide." **Copy says "slightly overstable" while -1 turn is a turn-friendly number:** a mild wording tension, the same kind as the Buzzz's.
- **Retailer:** Infinite label "Stable"; **mfr line 12/5/-1/2 (glide 5, stale against Prodigy's 6)**; reviewer numbers 11.8/4.9/-1/2.1 (26 reviews). DiscMetrics' generated page also prints 12/5/-1/2. Marshall Street is the Atlas baseline. **Renumbering watch (July 2023):** hits glide only (above); turn and fade are -1/2 in both number sets.
- **Community (Infinite raw, 26 rated, 2017-2023; computed):** mean **11.71/4.88/-0.98/2.08**, median -1/2. Turn: -3 (1), -2 (1), -1.5 (3), **-1 (17)**, -0.5 (2), 0 (1), +2 (1); fade 1 (1), **2 (20)**, 2.5 (4), 3 (1). **By skill:** advanced 9 -1.28/1.94; professional 3 -1.17/2.0; intermediate 10 -0.95/2.25; beginner 4 -0.25/2.0 (advanced and professional together, 12: -1.25/1.96): the stronger arms read a little more turn, which is what the "all skill levels … exceeds the X1 and X2 in turn" copy implies. **By era:** 2017-2020 (17) -0.97/2.18; 2021 onward (9) -1.0/1.89. Text, plastic- and run-driven: "very understable … I thought I was getting a beat-in Destroyer, instead I got a beat-in Sidewinder" (advanced, 400G 168g, 2021, 12/5/-3/1); "perfect hyzer flip distance driver … nice relatively understable" (advanced, 500, 2023, -2/2); against "pretty OS out of the box, turned not at all" (intermediate, 400, 2018, -0.5/2.5), "the 500 X3 gains more stability and less turn than the 400 and 400G" (advanced, 2020, 0/2.5), "first run X3s are a thing of beauty, production runs may take trying a few" (intermediate, 2018), "NOT beginner friendly … pulls left" (beginner, 200 ft, 400G, 2022). **Named reviewer:** Disc Golf Reviewer's X-series overview (2017, author not captured, no arm speed; he describes himself as "not the most powerful thrower"): the X3 "is supposed to be the middle-of-the-road disc in terms of stability, and it fills that role nicely," his least favorite of the series because it did not stand out from other drivers. Search summary (flag): retailers call it "stable" and "slightly overstable."
- sources:
  - {name: Prodigy X3 200 Plastic Geometry Series Stamp page (12/6/-1/2; copy), url: https://prodigydisc.com/products/prodigy-x3-200-plastic-geometry-series-stamp, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs X3 (mfr line 12/5/-1/2; reviewers 11.8/4.9/-1/2.1; 26 ratings; raw list via DiscComments), url: https://infinitediscs.com/prodigy-x3, type: retailer, weight: 0.4}
  - {name: Infinite reviewer text, 26 raw ratings (skill, plastic labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.4}
  - {name: Disc Golf Reviewer Prodigy X-Series overview (2017), url: https://discgolfreviewer.com/prodigy-x-series-distance-drivers/, type: community, weight: 0.3}
- **confidence:** 0.65
- **consensusNote:** Prodigy's page, Infinite's printed numbers and 26 raw ratings (17 at exactly -1; 20 at exactly fade 2; mean -0.98/2.08) agree on -1/2 for turn and fade, and the one named reviewer calls it middle-of-the-road. **Held at 0.65 because the pool is old (2017-2023), small, split across 400, 400G and 500 plastics that reviewers say differ in stability, and because Prodigy's own "slightly overstable" wording sits beside a -1 turn.** The Infinite glide (5 vs 6) is stale-numbering, out of scope here.
- **plasticVariance:** 400 -0.96/2.12 (13), 400G -1.0/2.0 (10), 500 -1.0/2.25 (2). Reviewers say the 500 is clearly more stable than 400 and 400G (n=2 in the ratings, anecdotal in text). Run variance (first run vs production) is called out twice. Do not average.
- **Linked:** X2 (Atlas 12/5/0/2; Infinite 13/4.5/0/4, raw -0.19/3.69), X4 (12/6/-2/2; Infinite 13/5/-2.5/2, raw -2.17/2.0), D3 (12/5/-1/3), PA series; set and flags above. Nothing moves.

## Dart — Innova (id 3967be4cf6a6)

- **Atlas now:** 3/4/0/0 (source: Marshall Street snapshot; PDGA approval 09-05, Feb 18, 2009; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown, not verified): R-Pro (26 of 74 rated) and DX (21); Star has 13 ratings and Champion 5, and all four read the same.
- **Manufacturer:** Innova's Dart page (fetched): **3/4/0/0**. Copy: "a small diameter putter with a straight flight … especially good for long range putts and go-for shots … a flight similar to our Aviar Putt & Approach but has less low speed fade and a little more range … it holds the line for a long time." Pro review on Innova's page (Nate Sexton): "One of the straightest discs I have ever thrown." Best choice for: "Stable putter, Power approaches, Straight flights." Copy and numbers agree.
- **Retailer:** Infinite label "Stable"; mfr line 3/4/0/0; reviewer numbers 3/4.2/0/0.1 (106 reviews). Marshall Street is the Atlas baseline.
- **Community (Infinite raw, 74 rated of 106, 2015-2025; computed):** mean **3.05/4.18/-0.05/0.11**, median 0/0. Turn: 0 on 70 of 74, -0.5 (3), -2 (1); fade 0 on 63, 0.5 (6), 1.0 (5). **By skill:** advanced 12 0.0/0.17; beginner 17 -0.06/0.18; intermediate 41 -0.06/0.06; professional 4 0.0/0.12 (advanced and professional together, 16: 0.0/0.16). Text: "Contrary to the flight numbers, the dart will not turn over with power. This disc maxes out for me personally on a straight line at ~300 feet" (advanced, DX, 2018), "the straightest flying disc … I have ever used" (intermediate, XT, 2019), "a little more OS than the numbers" (beginner, 200 ft, Champion X-Out, 2024, fade 0.5), "noticeable fade at the end" (intermediate, DX, 2020, fade 1), "may get a bit flippy in a headwind" (intermediate, R-Pro, 2019, -0.5). **Named reviewer:** Disc Golf Reviewer (test round, no arm speed): "while most discs naturally exhibit slight fade at the end of a throw, the Dart remains impressively neutral when released on a flat angle."
- sources:
  - {name: Innova Dart page (3/4/0/0; copy), url: https://www.innovadiscs.com/disc/dart/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Dart (mfr 3/4/0/0; reviewers 3/4.2/0/0.1; 106 reviews; raw list via DiscComments), url: https://infinitediscs.com/innova-dart, type: retailer, weight: 0.5}
  - {name: Infinite reviewer text, 74 raw rated reviews (skill, plastic labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.4}
  - {name: Disc Golf Reviewer Innova Dart, url: https://discgolfreviewer.com/innova-dart/, type: community, weight: 0.3}
- **confidence:** 0.8
- **consensusNote:** Innova, Infinite's printed numbers and 74 raw ratings (95% at turn 0, 85% at fade 0; the fade movers all go up by 0.5 to 1) say 0/0, and Innova's own sentence ranks the Dart's fade below the Aviar's, which the pools reproduce (Dart 0.11, Aviar 0.94 on 193 ratings).
- **plasticVariance:** R-Pro -0.02/0.12 (26), DX -0.12/0.07 (21), Star 0.0/0.15 (13), Champion 0.0/0.1 (5), XT -0.12/0.12 (4), GStar 0/0 (3); spread inside 0.15. Reviewers say R-Pro is soft and gets flippy after impacts. Do not average.
- **Linked:** Aviar (2/3/0/1; pilot), Judge (2/4/0/1), Luna (3/4/0/2), Zone. The Dart sits at the straightest end of Innova's speed-3 putters in the Atlas and in every layer. Nothing moves.

## Resistor — MVP (id 33da281c0a64)

- **Atlas now:** 6.5/4/0/3.5 (source: Marshall Street snapshot; PDGA approval 13-59, Sep 23, 2013; no override). **Proposed turn/fade:** none. Matches MVP's page. Reference plastic (assumed most-thrown): Neutron (48 of 60 rated).
- **Manufacturer:** MVP's Resistor page (fetched): **6.5/4/0/3.5, "Overstable."** Copy: "an overstable Fairway driver … part of a slower family of fairway drivers with a more controllable speed. The combination of its flat overstable profile and GYRO® technology allows it to resist turn and experience a strong and reliable fade." Flight chart: "**It has an extended GYRO® push which delays the strong fade for high-power throwers. Average power throwers will observe an earlier prominent fade.**" Copy and numbers agree, and the copy itself says the observed fade depends on arm power.
- **Retailer:** Infinite label "Very Overstable"; mfr line 6.5/4/0/3.5; reviewer numbers **6.6/3.9/-0.1/3.3** (69 reviews). Marshall Street is the Atlas baseline. **The 3.3 against 3.5 is an old-display blend, not a mold-level gap (below).**
- **Community (Infinite raw, 60 rated of 69, 2013-2026; computed):** mean **6.61/3.83/-0.06/3.32**, median 0/3.5. Turn: -1 (1), -0.5 (8), **0 (49)**, +0.5 (1), +1 (1). Fade: 1.5 (1), 2.5 (3), **3 (22)**, **3.5 (25)**, 4 (8), 4.5 (1). **By era (the key split): ratings before 2020 (32) read fade 3.14; 2020 onward (28) read 3.52 (turn -0.09).** Before 2020, 19 of 32 sit at fade 3, 20 at speed 6 and 13 at exactly 6/4/0/3 (the old display); from 2020, 16 of 28 sit at fade 3.5, 11 at speed 6.5 and 6 at exactly 6.5/4/0/3.5. **By skill (confounded with era):** advanced 10 +0.05/3.05, professional 7 -0.07/3.0, intermediate 30 -0.07/3.48, beginner 13 -0.12/3.31. **Seventeen advanced/professional ratings read fade 3.0 (11 at exactly 3), but only three of them are from 2020 on**, so the skill signal cannot be separated from the era echo. Text: "It's gonna have a dead straight flight with a hard fade at the end" (intermediate, 2018), "Think of it as a baby firebird" (intermediate, 2017; another intermediate in 2019 disagrees: "It has too much turn at the beginning of flight. It's more like if a wraith and a firebird had a baby"), "I purchased this disc looking for something in between my Zone and my Firebird … this disc isn't fitting that intended role because it bombs" (intermediate, 2022, rated 8/4/-0.5/3.5), "not as stable as the numbers suggest … on a flat release …" (intermediate who maxes a 12-speed at 380-400 ft, Neutron, 2024, 6.5/4/0/3), "not as overstable as advertised … flies pretty straight with a pretty solid fade" (intermediate, 2023, 7/4/-0.5/3.5), "flies very similar to a TeeBird, a little straighter than my Star TeeBirds" (advanced, 2019, fade 1.5), "waaay overstable" (beginner, Eclipse 2.0, 300 ft, 2024, 4.5). Search summaries (flag): "no turn at all with a strong fade," "will turn over and then fade every time."
- **Soft watch, not a candidate:** the **high-power fade** (MVP's own copy says high-power throwers see a later, shorter fade): a few intermediates and advanced throwers with 380-400 ft arms read it as fade 3 or less ("not as stable as the numbers suggest," "TeeBird-like"). The skill-stratified evidence is too thin and too confounded with the old display to move anything, and the manufacturer already states the effect. Fade 3.5 holds for the 2020-onward ratings.
- sources:
  - {name: MVP Resistor page (6.5/4/0/3.5, Overstable; GYRO copy), url: https://www.mvpdiscsports.com/discs/resistor/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Resistor (mfr 6.5/4/0/3.5; reviewers 6.6/3.9/-0.1/3.3; 69 reviews; raw list via DiscComments), url: https://infinitediscs.com/mvp-resistor, type: retailer, weight: 0.5}
  - {name: Infinite reviewer text, 60 raw rated reviews (skill, plastic, distance labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.4}
- **confidence:** 0.7
- **consensusNote:** MVP's page, Infinite's mfr line and the 2020-onward ratings (turn -0.09, fade 3.52, 28 ratings) agree on 0/3.5. The pooled 3.3 is a blend of two display eras (before 2020 many reviewers echo an older 6/4/0/3), not evidence against 3.5, and MVP's own copy explains the arm-power spread that remains. Whether MVP itself changed the Resistor's numbers (6/4/0/3 to 6.5/4/0/3.5) is **unverified; I could not find an MVP announcement** (the older display is inferred from the echoes). **Held at 0.7** because even the 2020-onward set is only 28 ratings across plastics with no arm speeds.
- **plasticVariance:** Neutron -0.07/3.29 (48), Eclipse 2.0 -0.1/3.5 (5, one reviewer "waaay overstable"), Proton 0.0/4.0 (3), Neutron Misprint 0.33/3.0 (3), Eclipse 1.0 -0.5/2.5 (1). Proton and Eclipse read stiffer and more overstable; Neutron is the reference. Do not average.
- **Linked:** Shock (8/5/0/2.5), Servo (6.5/5/-1/2), Switch (6.5/5/-1.5/1), Zone (4/3/0/3), Firebird (9/3/0/4). Set re-checked above; nothing moves.

## Fierce — Discraft (id becf375dae3f)

- **Atlas now:** 3/4/-2/0 (source: Marshall Street, "Paige Pierce Fierce 5X" page; PDGA approval 20-08, Jan 30, 2020; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed, not verified): the Infinite pool is dominated by the 2020 "Discraft Prototype Putter Blend" (25 of 41 ratings), a special run; Discraft's current pages are Putter Line Hard, Putter Line Soft and Rubber Blend, which print the same numbers. I have no sales data for the current most-thrown blend.
- **Manufacturer:** Discraft's Fierce pages (Paige Pierce Fierce, Putter Line Hard Fierce, Putter Line Soft Fierce; fetched): **Speed 3, Glide 4, Turn -2, Fade 0, Stability 0.0** on all three. Copy: "The first disc in the Paige Pierce line … a straight flying, understable putter that was designed along with Paige Pierce to create a small diameter putter with a good hand feel for players of all sizes … demonstrates straight flights with effortless glide"; the Putter Line pages say "beadless, understable putter." Copy and numbers agree.
- **Retailer:** Infinite label "Understable"; mfr line 3/4/-2/0; reviewer numbers 3/4/-1.9/0 (41 reviews). Marshall Street is the Atlas baseline.
- **Community (Infinite raw, 41 rated, 2020-2026; computed):** mean **3.0/4.0/-1.84/0.02**, median -2/0. Turn: **-2 (34)**, -1.5 (2), -1 (4), -0.5 (1), and **none more negative than -2**; fade 0 on 40 of 41. **Seven movers, all toward less turn.** **By skill:** intermediate 26 -1.88/0.04; beginner 8 -1.88/0.0; advanced 6 -1.58/0.0; professional 1 -2.0/0.0. Text: "flies with plenty of turn and lots of glide before finishing with a very soft fade" and the Fierce "held straight more easily and for much longer than the Alter" on the putting green (Disc Golf Reviewer head-to-head, no arm speed); "the Z Metallic fierces are the most stable run I've found … if you throw it hard with a touch of hyzer it will flip up but not turn too much" (intermediate, 2024, -1/1); "laser straight up to 40+ feet" (intermediate, 2023); "It just flies so straight and has so much glide! … A birdie machine!" (advanced, 2020).
- **Soft watch, not a candidate: Fierce turn -2 → -1.5 (|Δ| 0.5).** Every one of the seven movers goes toward less turn, advanced players (six) read -1.58, and the most stable plastic (Z Metallic) is a named reviewer's choice. But 83% still sit at exactly the display, the pool is dominated by one special-run plastic, the pooled mean (-1.84) is within 0.16 of -2, and nobody states an arm speed. Does not clear the review gate.
- sources:
  - {name: Discraft Paige Pierce Fierce page (3/4/-2/0, stability 0.0), url: https://www.discraft.com/paige-pierce-fierce-piercefierce, type: manufacturer, weight: 1.0}
  - {name: Discraft Putter Line Hard Fierce page (same numbers), url: https://www.discraft.com/paige-pierce-putter-line-hard-fierce-piercehdfierce, type: manufacturer, weight: 0.5}
  - {name: Infinite Discs Fierce (mfr 3/4/-2/0; reviewers 3/4/-1.9/0; 41 reviews; raw list via DiscComments), url: https://infinitediscs.com/discraft-fierce, type: retailer, weight: 0.5}
  - {name: Infinite reviewer text, 41 raw ratings (skill, plastic labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.4}
  - {name: Disc Golf Reviewer Fierce head-to-head (World Series of Putters; no arm speed), url: https://discgolfreviewer.com/discraft-fierce/, type: community, weight: 0.3}
- **confidence:** 0.75
- **consensusNote:** Discraft's three pages, Infinite's printed numbers and 41 raw ratings (-1.84/0.02; fade 0 on 40 of 41) agree on -2/0, and the named reviewer describes the same shape (lots of turn and glide, very soft fade). The one asymmetry (seven movers, all toward less turn) is recorded as a soft watch.
- **plasticVariance:** Prototype Putter Blend -1.92/0.0 (25), Signature Tour Series ESP -1.88/0.0 (4), Tour Series Z Metallic -1.33/0.33 (3, a named reviewer calls it "the most stable run"), Jawbreaker Swirl -1.5/0.0 (3), Rubber Blend -2.0 (2). Discraft prints identical numbers for every blend. Do not average.
- **Linked:** PA-5 (3/4/-2/0.5; pool -2.15/0.3), Luna (3/4/0/2), Zone, Pixel. The Fierce and PA-5 are the two -2 putters in the Atlas and in the pools. Nothing moves.

## Guld — Kastaplast (id 5e7334712fe0)

- **Atlas now:** 13/5/-0.5/3 (source: Marshall Street snapshot; PDGA approval 22-89, May 16, 2022; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): K1 (K1 Line 7 of 9 ratings; Kastaplast also sells K1 Grind and K1 Glow).
- **Manufacturer:** Kastaplast's K1 Guld product page (fetched; unlike the Grym, the Guld has a live product page): **13/5/-0.5/3, "Overstable distance driver"** (the collection page prints the same for K1, K1 Grind and K1 Glow). Copy: "an overstable distance driver which will put you further down the fairway than ever before. The wider rim, 24 mm, and low profile design assure a speedy power shot with glide and predictable fade, even in the head wind." Suitable for "experienced players, consistent distance drives." Copy and numbers agree. The page has 14 customer reviews (93% five-star; no flight ratings).
- **Retailer:** **Infinite label "Stable"** (Kastaplast says "Overstable"; Infinite's own description says "overstable"); mfr line 13/5/-0.5/3; reviewer numbers 12.9/5/-0.6/2.9 (9 reviews). Rocket Discs 13/5/-0.5/3. Marshall Street is the Atlas baseline. The label looseness is wording, not numbers.
- **Community (Infinite raw, all 9 rated, 2022-2025; computed):** mean **12.78/5.06/-0.61/2.89**, median -0.5/3 (K1 Line 7: -0.71/2.86). Turn: -1 (3), -0.5 (5), 0 (1); fade 2.5 (2), 3 (7). Skill: beginner 5, intermediate 3, advanced 1 (too few to split). Text: "I feel it has more turn in it than -0.5 but has a nice, strong fade" (beginner, 400 ft, K1 Line, 2024, -1/3), "definitely more understable than the numbers suggest" (intermediate, 2023, 12/5/-1/2.5), "first throw is like a nicely broken-in Star Destroyer … I max out forehand around 450 ft" (beginner, 2022, -1/2.5); against "thrown flat it'll turn … the first run fits the numbers perfectly for my arm speed" (intermediate, 380-420 ft drives, 2023: "a slightly more overstable compliment to my Lucid Raider … almost like a RaiderX in Kastaplast terms"), "fills the space between my Nuke and Destroyer … more capable of fighting wind than my Nuke, more distance than the Destroyer" (advanced, 2022), "smash it as hard as you can and it'll never turn over" (beginner forehand, K1 Glow, 2023, 0/3), "at 171 g I've noticed a bit more turn" than at 175 g (beginner, ~375 ft, 2022, which is a weight effect, not a mold number). Search summary: none used.
- sources:
  - {name: Kastaplast K1 Guld product page (13/5/-0.5/3, Overstable; copy), url: https://www.kastaplast.com/en-us/products/k1-guld, type: manufacturer, weight: 1.0}
  - {name: Kastaplast Guld collection page (K1, K1 Grind, K1 Glow all 13/5/-0.5/3), url: https://www.kastaplast.com/en-us/collections/guld, type: manufacturer, weight: 0.5}
  - {name: Infinite Discs Guld (mfr 13/5/-0.5/3; reviewers 12.9/5/-0.6/2.9; 9 ratings; raw list via DiscComments), url: https://infinitediscs.com/kastaplast-guld, type: retailer, weight: 0.3}
  - {name: Rocket Discs Guld (13/5/-0.5/3), url: https://rocketdiscs.com/kastaplast-guld, type: retailer, weight: 0.2}
  - {name: Infinite reviewer text, 9 raw ratings (skill, plastic, distance labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** Kastaplast's page and every retailer print -0.5/3, and the nine raw ratings (-0.61/2.89) agree. The thin pool (nine ratings, two plastics, no arm speeds) cannot separate -0.5 from -1, three of the nine reviewers say it turns a little more than the number (all toward -1, none beyond), and two cross-comparisons (Raider, Destroyer/Nuke) put it where the Atlas has it. **Nothing contradicts the Atlas; the community layer is thin.**
- **plasticVariance:** K1 Line -0.71/2.86 (7), K1 Grind -0.5/3.0 (1), K1 Glow 0.0/3.0 (1). Reviewers note a weight effect (171 g turns more than 175 g). Kastaplast prints one set of numbers. Do not average.
- **Linked:** Grym (13/5/-1/2; **batch 16's open turn candidate, untouched by this batch**), Grym X (12.5/5/0/3; **new soft watch in the Kastaplast set above**), Vass (12/5/-1.5/2), Raider, Destroyer, Nuke. Nothing moves.

---

## Batch 17 report (for Freddy)

**Decided items recorded first:** the three standing rules and the Infinite anchoring rule, plus D2 turn and D1 fade carried parked (owner decisions, Oct 3, 2026). Nothing here touches either.

**Disc list and basis:** the ten are the next unreviewed entries in `public/featured.js` file order after Havoc: **Maverick, Diamond, Evader, PA4, Raider, X3, Dart, Resistor, Fierce, Guld.** The live site's `featured.js` is byte-for-byte the repo's (no discrepancy), and Maverick is line 152, as batch 16 said.

**Proposed changes (0).** All ten Atlas turn/fade numbers equal the manufacturer's own page, and the reviewers' raw ratings land on the Atlas numbers or within a half-step of them.

**Confirmed as-is (10):** Maverick, Diamond, Dart (0.8); Evader, PA4, Fierce (0.75); Raider, Resistor (0.7); X3 (0.65); Guld (0.6, thin). Confirmations mean "no contradicting evidence found," not independent community verification; this batch's community layer is unusually strong for the Infinite reviewers (complete raw rating lists) but still has no arm speeds and no Reddit/DGCR/YouTube.

**Too thin to call (0).** Guld is the thinnest (nine ratings) and nothing contradicts it.

**Open candidates: none new.** Running list unchanged (below).

**Soft watches (not candidates):**
- **Raider fade 3 → 2.5 (|Δ| 0.5):** the 2023-onward ratings read 2.46 (14 ratings) and the last six read 2.08, three of them re-rating the disc as 12/5/-1/2; the other 63 ratings read 2.92 and Dynamic still prints 3. Becomes a candidate if 2025-2026 ratings keep reading 2-2.5.
- **Fierce turn -2 → -1.5 (|Δ| 0.5):** seven movers, all toward less turn; advanced six at -1.58; 83% still at -2; pool dominated by one special-run plastic.
- **Resistor high-power fade (3.5 vs ~3):** MVP's own copy says high-power throwers see a later, shorter fade; the pooled 3.3 is an old-display blend (2020-onward ratings read 3.52). No change.
- **Maverick fade 2 → ~1.75:** raw 1.75 against 2, inside one plastic's spread; no arm speeds.
- **Linked (unreviewed): Grym X turn 0 → -0.5:** raw -0.91 on 17 mixed-plastic ratings against the displayed 0, printed -0.4 after shrinkage. Review with the Grym.

**Flags on molds outside the ten (nothing proposed):**
- **X2 (Atlas 12/5/0/2) versus Infinite's 13/4.5/0/4 and a raw fade of 3.69 on 18 ratings.** Prodigy's site no longer lists the X-series, so I could not read a current number. If the Atlas X2 fade is stale it is the largest gap in this batch; look when X2 comes up. X4 (Atlas 12/6/-2/2; Infinite 13/5/-2.5/2, raw -2.17/2.0) agrees on fade and is within 0.5 on turn.
- **PA2 (Atlas 0/2) versus pools of 1.25 (24 ratings) and PA3 (0/1) at 1.15:** the Atlas puts a full fade point between them and the reviewers do not.
- **Infinite's D3 mfr line (12/6/-2/2) is stale** against Prodigy's 12/5/-1/3 (batch 13).

**Retailer-lag findings (the brief's Prodigy watch and the usual hazards):**
- **Maverick: Infinite prints turn -1; Dynamic, Rocket and the Atlas print -1.5.** The 85 reviewers overrule Infinite (-1.57), and the echo pattern suggests Infinite edited the number in 2023. This is the Luna/Gator pattern reversed (the retailer, not the Atlas, is off).
- **X3: Infinite and DiscMetrics print glide 5, Prodigy and the Atlas print 6** (the 2023 renumbering; glide only, so no turn/fade effect). **PA-4: no renumbering effect.**
- **Guld:** Infinite labels it "Stable," Kastaplast "Overstable"; numbers agree.

**Linked-set results (the brief's watches):** Dynamic 13-speed set (Raider/Trespass/Enforcer/Defender/Sheriff/Guld/Destroyer), Dynamic 7-speed set (Maverick/Evader/Escape/Vandal/Getaway), Prodigy PA and X sets, MVP set (Resistor/Shock/Servo/Switch), Latitude 64 set (Diamond/Jade/Sapphire/Fury), Kastaplast (Guld/Grym/Grym X/Vass). **Order holds in every layer for every set; nothing moves.**

**Spot-checks needed before any override source note:**
- All Infinite review quotes and tallies (computed from the DiscComments JSON, snapshotted only in my scratch space; rerun to reproduce) and the skill and era splits, especially the Maverick echo reading (Infinite's -1.5 → -1 edit around 2023), the Resistor era split (3.14 before 2020, 3.52 from 2020), the Raider 2023-onward fade (2.46, last six 2.08), the Fierce mover direction (7 of 7 toward less turn) and the Grym X raw mean (-0.91/2.21).
- The Dynamic, Latitude 64, Prodigy, MVP, Innova, Discraft and Kastaplast page numbers (read as raw page text) and the Dynamic quote "sits comfortably between the Trespass and Enforcer in stability."
- Inside the Circle's Maverick quotes (its numbers are Infinite's), the Disc Golf Reviewer quotes (X-series, Dart, Fierce) and the search-engine summaries flagged in the entries (Raider "Trilogy's answer to the Destroyer," Maverick "-1 to -1.5 depending on plastic," Resistor "no turn at all," X3 "stable/slightly overstable").
- Whether MVP changed the Resistor's numbers around 2019-2020 (inferred only from slider echoes; no announcement found).

**Methodological findings (extend batches 14-16):**
- **Infinite review lists are fully readable** through the page's own `DiscComments` call (details in Evidence limits), so raw per-reviewer ratings are no longer limited to what a summarizing fetch surfaces.
- **Echo clusters are era-specific.** A raw rating echoes the number Infinite displayed when the reviewer rated, so counts of "movers" measured against today's display can be badly wrong (Maverick: 74 of 85 look like movers against -1 but are mostly echoes of -1.5; Resistor: the pre-2020 half echoes 6/4/0/3). **Split by year first.**
- **Skill splits are confounded with era on older pages** (Resistor: the advanced/professional fade 3.0 cluster is almost all pre-2020).
- **Printed shrinkage** stays within 0.1 on pools above about 40 ratings and reaches 0.3-0.5 on a 17-rating page (Grym X), where it needs roughly 16-22 phantom ratings at the display to close (rounding-limited), more than the "about eight" read from earlier pages.

**Process notes for the next batch**

- **Next ten in `public/featured.js` order after Guld (re-verify the live file first):** **Animus (Thought Space Athletics), Vanguard (Discmania), Wizard (Gateway), F5 (Prodigy), Pixel (Axiom), Deflector (MVP), Avenger (Discraft), Essence (Discmania), Dagger (Latitude 64), Compass (Latitude 64)** (lines 162-171, none has an entry). Two more remain after Compass: **Charger, Tempo**; Thunderbird (batch 16) and Mamba (batch 3) are already reviewed. The Prodigy renumbering hazard applies to the **F5** (2023 renumbering of the F-series is recorded in batch 6's F7 notes) and the **X-series flags above**; Wizard links to Magic/Magnet (batch 9 set), Compass/Dagger to Opto and Latitude's Easy-to-Use line.
- **Retail-side hazard watch carried forward:** Prodigy renumbering (July 2023) including the X-series; Thought Space's one Synapse renumbering; Omega's second catalog; Gateway mold revisions; retail copies disagreeing on a discontinued or revised Kastaplast number (Grym); **new this batch: Infinite can carry a different turn from the manufacturer for a current disc (Maverick -1 vs -1.5), so diff Infinite's mfr line against the manufacturer's page before using it as a baseline.**
- **Open-candidate running list (nothing applied by this lane):** open: **Predator turn +1 → 0 (gated), D2 turn 0 → -0.5 (PARKED, owner decision Oct 3, 2026, not closed), D1 fade 4 → 3.5 (PARKED, owner decision Oct 3, 2026), Defy turn -1 → -0.5, Havoc turn -1 → -1.5, Grym turn -1 → -1.5 / -2**; carried unchanged: MD3 (new) fade, Tesla turn -1 → -0.5, Fury fade 2 → 1.5, Quasar turn 0 → -0.5 (batch 12, held at 0); stay as-is: Monarch -4, Toro +1; pending in the main tree (this tree's overrides file has neither): Synapse turn -1, Astra turn -1.5; applied and present in this tree: Roc 2.5, Destroyer -0.5/3.5, Luna 3/4/0/2, Trident 3.5, Gator 4, Trespass -1. Soft watches: Falk turn, Svea turn, A1/A2 spacing, PA3 fade, Lots turn, Voodoo fade, PD2 fade, PD2/Enforcer, Stingray Star turn, Orion LF fade, Tantrum fade, Quasar fade 3 → 3.5, D3 and F3 reviewer-versus-printed gaps, Volt Neutron turn 2024-25, Saint turn, Nitro turn, Blade mold-revision hazard, Buzzz turn -1 → -0.5 (batch 16), **plus this batch's Raider fade, Fierce turn, Resistor high-power fade, Maverick fade, and (linked) Grym X turn**. **Catalog-identity flag still open:** FD1/FD2/Instinct (batch 11). **Catalog notes:** Omega (batch 14), Giant/Giant Reborn speed (batch 15), Eagle (new) unnumbered and Mako 3 glide (batch 16), **new: X2/X4 and PA2 spacing flags, X3 glide 6 (Infinite 5), and the X-series apparently leaving Prodigy's catalog (unverified).**
- **Linked sets re-checked this batch:** Raider/Trespass/Enforcer/Defender/Sheriff/Guld/Destroyer, Maverick/Evader/Escape/Vandal/Getaway, PA1-PA5, X2/X3/X4/D3, Resistor/Shock/Servo/Switch, Diamond/Jade/Sapphire/Fury, Guld/Grym/Grym X/Vass, Dart/Aviar, Fierce/PA-5. Nothing moves.
- **Reachable manufacturer paths this batch (all fetched as raw HTML):** `www.dynamicdiscs.com/collections/dynamic-discs-{maverick,evader,raider}`, `www.latitude64.com/collections/diamond`, `prodigydisc.com/products/prodigy-pa4-400-plastic`, `prodigydisc.com/products/prodigy-x3-200-plastic-geometry-series-stamp`, `prodigydisc.com/collections/distance-drivers` (X3 filter count 1), `www.innovadiscs.com/disc/dart/`, `www.mvpdiscsports.com/discs/resistor/`, `www.discraft.com/paige-pierce-{fierce-piercefierce,putter-line-hard-fierce-piercehdfierce,putter-line-soft-fierce-piercesffierce}` (Discraft's catalog is searchable at `www.discraft.com/search?q=<mold>`; `www.team.discraft.com/discs/fierce` 404s), `www.kastaplast.com/en-us/products/k1-guld` and `/collections/guld`. Infinite slugs: `/dynamic-discs-{maverick,evader,raider,...}`, `/latitude-64-diamond`, `/prodigy-pa-4` and `/prodigy-x3` (**the `prodigy-disc-*` and `prodigy-pa4` slugs 302**), `/innova-dart`, `/mvp-resistor`, `/discraft-fierce`, `/kastaplast-guld`, `/kastaplast-grym-x`; review lists via POST `/Disc/DiscComments`. Disc Golf Reviewer has pages for the Dart and Fierce at the guessed slugs (the guessed slugs for the other molds 404; the X-series overview has its own URL). `discmetrics.com/discs/<brand>/<mold>` loads but is templated.
- Suggested follow-up if you want a firmer community layer: someone with Reddit/DGCR/YouTube access reads the DGCR Raider thread (is the 2023+ run less overstable?), the Diamond thread, and any Dynamic Discs statement on a Raider run change; and someone checks Prodigy's current X2/X4 numbers and whether the X-series is being retired.

---

# Batch 18 (Plan 10, Phase 2)

Researched October 3, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (already up to date; `main` has nothing this branch lacks; the queue doc is still the only locally modified file).

## Disc list and order basis

**Basis: the ten named in the brief, which are exactly the next ten unreviewed entries in `public/featured.js` file order after Guld (lines 162-171).** I read `public/featured.js` after the merge (176 lines) and fetched the live file (`https://disc-atlas-public.disc-atlas-explorer.workers.dev/featured.js`, HTTP 200, 10,867 bytes): **identical to the repo's** (diff clean after line-ending normalization), so no repo-versus-live discrepancy. None of the ten has an entry in batches 1-17 (several appear only inside earlier "linked" lists).

The ten, in file order (Atlas ids): **Animus** ab99c93cbcae (Thought Space Athletics, line 162), **Vanguard** c5f734a0365b (Discmania, 163), **Wizard** 3e3ec8fe318c (Gateway, 164), **F5** 37cf45c39fd2 (Prodigy, 165), **Pixel** e125b84243c2 (Axiom, 166), **Deflector** ceccfa41e4e8 (MVP, 167), **Avenger** fa5bf2ffb814 (Discraft, 168), **Essence** 8dc8ae85af4c (Discmania, 169), **Dagger** 31f250847807 (Latitude 64, 170), **Compass** b0b50b6a4551 (Latitude 64, 171).

## Decided items and standing rules (recorded before the research)

- **Plastic baseline policy:** a mold's reference numbers are its most-thrown plastic. DX is the price-tier baseline but **not** the flight reference. No sales data; each entry names the reference plastic I took to be the most-thrown and marks it "assumed" (usually the most-rated Infinite plastic).
- **Review gate:** weak evidence = no correction; |Δ| = 1.0 changes need the owner's call; record open candidates instead of proposing them.
- **Never average across plastics:** mold-level consensus plus a `plasticVariance` note. Mold-level Infinite pools are quoted as coarse sanity checks beside per-plastic figures.
- **Raw-data method (batch 17):** every Infinite figure below is computed from the complete `POST /Disc/DiscComments` list, not the printed averages, and **split by year before any "mover" count** (the echo rule).
- **Carried parked items (owner decisions, Oct 3, 2026):** D2 turn 0 → -0.5 and D1 fade 4 → 3.5 stay parked. Nothing here touches either.

---

## Batch 18 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Wizard | 2/3/0/2 | none | Confirmed as-is (198 of 201 ratings at turn 0; fade 2 on 172; catalog note on "Wizard (revised)") | 0.85 |
| Essence | 8/6/-2/1 | none | Confirmed as-is | 0.85 |
| Deflector | 5/3.5/0/4 | none | Confirmed as-is | 0.85 |
| Compass | 5/5/0/1 | none | Confirmed as-is | 0.85 |
| F5 | 8/6/-2/1 | none | Confirmed as-is (turn/fade); Infinite's 7/5 is the stale 2023-renumbering speed/glide | 0.8 |
| Pixel | 2/4/0/0.5 | none | Confirmed as-is (15 ratings, unanimous; new mold) | 0.7 |
| Avenger | 10/5/0/3 | none | Confirmed as-is (semi-discontinued; no live manufacturer page; soft fade watch) | 0.7 |
| Vanguard | 9/5/0/2 | none | Confirmed as-is (thin Infinite sample, four independent sources agree) | 0.65 |
| Dagger | 2/5/0/1 | none | Confirmed as-is (ratings are mostly display echoes; no contradicting text) | 0.65 |
| Animus | 11/5/0/2 | none | Confirmed as-is **with a new open candidate: turn 0 → -0.5 (\|Δ\| 0.5), recorded, not proposed** | 0.55 |

**No changes proposed. One new open candidate (Animus turn), one new soft watch (Avenger fade), no too-thin-to-call verdicts.** The Animus is the one mold of the ten where the Atlas, the manufacturer's current page and the Infinite reviewers do not sit together: see its entry.

**Diff against `flights.json` / manufacturers (done first):** all ten Atlas numbers equal the Marshall Street snapshot (`data.json` `flightSource` is Marshall Street for all ten), none has an override (0 hits for the ten ids in `verified-model-overrides.json`), and **every Atlas turn/fade equals the manufacturer's own current page** where I could read one (Animus, Vanguard, F5, Pixel, Deflector, Essence, Dagger, Compass; **not** Wizard, whose maker's site was unreachable, and **not** Avenger, which Discraft no longer lists). **No Luna/Gator-style Atlas lag.** The only catalog drift is retailer-side and old: Infinite's F5 (7/5 vs the Atlas's 8/6, the July 2023 renumbering) and **three Infinite display changes that put old numbers into the raw ratings** (Animus, Dagger, Wizard; see Evidence limits).

## Linked-set re-checks (the brief's watches, done as sets)

**Raw Infinite pools used for every set below (all plastics, mold level, my recompute from DiscComments; n = rated reviews):**

| Mold | Atlas (S/G/T/F) | Infinite mfr line | Raw turn / fade | n |
|---|---|---|---|---|
| Wraith | 11/5/-1/3 | 11/5/-1/3 | -1.09 / 2.87 | 404 |
| **Animus** | 11/5/0/2 | 11/5/0/2 | **-0.80 / 2.26** | 37 |
| Thunderbird | 9/5/0/2 | 9/5/0/2 | -0.09 / 2.12 | 261 |
| Omen | 9/4/0/4 | 9/4/0/4 | +0.02 / 3.94 | 31 |
| Coalesce | 9/5/0/3 | 9/5/0/3 | -0.14 / 2.43 | 7 |
| Anax | 10/6/0/3 | 10/6/0/3 | -0.10 / 2.81 | 100 |
| **Avenger** | 10/5/0/3 | 10/5/0/3 | -0.02 / 2.80 | 25 |
| Vulture | 10/5/0/2 | 10/5/0/2 | -0.06 / 2.05 | 77 |
| Avenger SS | 10/5/-3/1 | 10/5/-3/1 | -2.89 / 1.03 | 123 |
| Undertaker | 9/5/-1/2 | 9/5/-1/2 | -0.97 / 2.10 | 159 |
| **Vanguard** | 9/5/0/2 | 9/5/0/2 | -0.12 / 2.00 | 4 |
| **Essence** | 8/6/-2/1 | 8/6/-2/1 | -1.93 / 1.08 | 53 |
| **F5** | 8/6/-2/1 | 7/5/-2/1 | -1.92 / 1.07 | 54 |
| Leopard | 6/5/-2/1 | 6/5/-2/1 | -1.93 / 1.01 | 203 |
| Falk | 9/6/-2/1 | 9/6/-2/1 | -2.30 / 1.31 | 49 |
| F3 | 8/5/-2/2 | 7/5/-1/2 | -1.06 / 1.89 | 32 |
| F7 | 8/6/-3/1 | 8/6/-3/1 | -3.19 / 0.82 | 37 |
| F9 | 8/6/-4/0.5 | 8/6/-4/0.5 | -4.12 / 0.62 | 12 |
| **Wizard** | 2/3/0/2 | 2/3/0/2 | -0.01 / 1.92 | 201 |
| Challenger | 2/3/0/2 | 2/3/0/2 | 0.00 / 1.86 | 52 |
| Envy | 3/3/0/2 | 3/3/0/2 | -0.13 / 1.88 | 250 |
| **Dagger** | 2/5/0/1 | 2/5/0/1 | 0.00 / 1.26 (2018+: 1.06) | 43 |
| Macana | 2/5/0/1 | 2/5/0/1 | -0.02 / 1.04 | 23 |
| Aviar | 2/3/0/1 | 2/3/0/1 | -0.10 / 0.94 | 193 |
| Judge | 2/4/0/1 | 2/4/0/1 | -0.03 / 0.87 | 217 |
| **Pixel** | 2/4/0/0.5 | 2/4/0/0.5 | -0.10 / 0.50 | 15 |
| **Deflector** | 5/3.5/0/4 | 5/3.5/0/4 | +0.16 / 4.06 | 63 |
| Justice | 5/1/0.5/4 | 5/1/0.5/4 | +0.50 / 4.09 | 136 |
| Gator | 5/2/0/4 (applied) | 5/2/0/3 | -0.01 / 3.18 | 80 |
| Resistor | 6.5/4/0/3.5 | 6.5/4/0/3.5 | -0.06 / 3.32 | 60 |
| Zone | 4/3/0/3 | 4/3/0/3 | -0.02 / 2.98 | 374 |
| **Compass** | 5/5/0/1 | 5/5/0/1 | -0.08 / 1.01 | 91 |
| Buzzz | 5/4/-1/1 | 5/4/-1/1 | -0.71 / 1.05 | 457 |
| Claymore | 5/5/-1/1 | 5/5/-1/1 | -0.78 / 0.98 | 56 |
| Hex | 5/5/-1/1 | 5/5/-1/1 | -0.90 / 1.00 | 110 |
| Mako3 | 5/5/0/0 | 5/5/0/0 | -0.16 / 0.14 | 340 |

- **Animus / Wraith / Thunderbird (the brief's TSA link):** the Animus pool (-0.80/2.26) sits **between the Thunderbird and the Wraith, nearer the Wraith on turn and nearer the Thunderbird on fade**, which is what its launch copy says ("a mix between wraith and thunderbird", a reviewer quoting the marketing; Infinite: "compared to a cross between an Innova Wraith and Thunderbird"). The Atlas puts the Animus's turn and fade **on the Thunderbird's** (0/2). That is the Animus candidate; see its entry. Omen (+0.02/3.94) and Coalesce stay where the Atlas has them.
- **Prodigy F-series and the July 2023 renumbering:** Prodigy's own nav list prints F5 8/6/-2/1, F3 8/5/-2/2, F7 8/6/-3/1, F9 8/6/-4/0.5, FX-3 9/5/-1/2, FX-2 9/4/0/3; the Atlas matches every one. **The F5's renumbering is speed and glide only (Infinite 7/5, Prodigy and Atlas 8/6; turn/fade -2/1 in both sets).** Turn order in the raw pools holds (F3 -1.06 > F5 -1.92 > F7 -3.19 > F9 -4.12) and the F5, Leopard and Essence pools coincide to within 0.01 turn (-1.92 / -1.93 / -1.93) and 0.07 fade. **Flags on linked molds, not reviewed here:** the **F3** is the one F-series mold where Prodigy's current sheet (-2/2) differs on turn from Infinite's line (7/5/-1/2), and the raw pool (-1.06; 2021+ -1.15 on 13; adv/pro -1.00 on 10) sides with the old number (batch 13's F3 reviewer-versus-printed watch, now with a renumbering explanation to check); the **FX-3** has Infinite 9/4/-1.5/2 against Prodigy and the Atlas 9/5/-1/2 (pool -1.32/1.86 on 11).
- **Putters (Wizard / Dagger / Pixel):** fade splits into three layers, and the Atlas has them in the right ones: **~1.9** (Wizard 1.92, Envy 1.88, Challenger 1.86; Atlas 2/2/2), **~1.0** (Aviar 0.94, Judge 0.87, Macana 1.04, Dagger 1.06 from 2018; Atlas 1/1/1/1) and **0.5** (Pixel; Atlas 0.5). Turn is 0 for all of them.
- **Discmania / Thunderbird slot (Vanguard):** Thunderbird -0.09/2.12 and the Vanguard's four ratings agree; CD1 (Atlas -1/2, pool -1.31/1.81 on only 8) is below and PD (Atlas 0/3) above, as Disc Golf Deals USA's "between the CD1 and the PD" says. Nothing moves.
- **Overstable midranges (Deflector):** Deflector 4.06 ≈ Justice 4.09 > Resistor 3.32 > Gator 3.18 > Zone 2.98. Atlas: 4 / 4 / 3.5 / **4 (applied override)** / 3. **Gator note (not re-opened):** the applied Gator override is 4 (owner-decided) but Infinite's pool is 3.18 against a printed 3; the Deflector's 4 does not depend on it.
- **Straight mids (Compass):** Compass turn sits 0.63-0.82 above Buzzz/Claymore/Hex (Atlas: a full point) and 0.9 fade above Mako3 (Atlas: 1). Holds in every layer; if the batch 16 soft watch (Buzzz turn -1 → -0.5) were ever applied the Atlas spacing would become 0.5, still within the pools.
- **Discraft overstable drivers (Avenger):** Avenger 2.80 ≈ Anax 2.81 > Vulture 2.05, and the Atlas has 3 / 3 / 2. Avenger SS (-2.89/1.03 on 123) fits its -3/1 and Discraft's own page.
- **Discmania understable fairways (Essence):** Essence ≈ Leopard ≈ F5 in the pools; Falk is 0.37 more turn and 0.23 more fade than the Essence (Atlas: Falk -2/1, Essence -2/1, with the Falk's own turn on the batch 6 soft watch). Nothing moves.

## Evidence limits — batch 18

Same tooling limits as earlier batches (Reddit blocked and not attempted, YouTube unreachable). **What changed this batch:**

- **DGCR was readable.** Every DGCR thread I requested (Vanguard, Avenger/Vulture/Anax, Deflector p.6, Essence p.1/3, F5 p.2, Compass, TSA p.5-7, "Though Space Athletics Discs?") returned HTTP 200 with the full thread HTML when fetched with `curl` and a browser user-agent, in contrast to the 403s from the summarizing fetch. **I read these directly (raw page text, not summaries).** Spot-check any quote anyway before it goes into an override source note; poster names are given where I captured them, and the Animus posters' names were not captured. Anyone running the next batch should try the same route.
- **Gateway's site was unreachable** (every host tried fails at the connection; `www.gatewaydiscs.com/Wizard.htm` over plain HTTP returns a 404 page). The Wizard's manufacturer layer is therefore Gateway's own product note **as quoted in a Disc Golf Puttheads review I fetched directly**, plus retailer listings.
- **Discraft's catalog no longer lists the plain Avenger** (a search for "avenger" returns only Avenger SS); the Avenger's manufacturer layer is Infinite's quotation of Discraft plus retailers.
- **Wayback/archive.org returned 429**; I could not retrieve historical manufacturer pages, so the Animus, Dagger and Wizard display changes below are **inferred from reviewer echoes, not verified against any manufacturer's past page.**
- **Infinite displays changed on three of the ten, and the changes put old numbers into the raw ratings** (the batch 17 echo rule, again). Counted against today's display these would mislead, so I split by date:
  - **Animus:** ratings through Mar 15, 2023 cluster at exactly **10.5/4.5/-0.5/2.5** (12 of 31 are that exact string; 16 of 31 sit at turn -0.5, 16 at fade 2.5; speed 10.5 on 25 of 31). From Apr 4, 2023 the echoes are **11/5/0/2** (3 exact; the page now prints this). The display changed between those dates (inferred). TSA's own mold page and the Atlas read 11/5/0/2.
  - **Dagger:** 2014-2017 ratings echo **2/4/0/2** (9 of 9 at fade 2, glide 4); from 2018, **2/5/0/1** (31 of 34 at fade 1, 2 at 1.5, 1 at 2). So all 43 turn ratings are 0 and the fade spread is mostly the display switching, not 12 reviewers reading overstable.
  - **Wizard:** before 2018 the display was **3/5/0/2** (39 of 39 at turn 0; 31 at fade 2); from 2018, **2/3/0/2** (159 of 162 at turn 0; 141 at fade 2). Turn and fade did not change; speed and glide did.
- **Printed versus raw:** printed Infinite figures are within 0.1 of my raw means on every pool above 40 ratings (Deflector printed 5/3.5/0.1/4.1 vs raw 5.02/3.51/0.16/4.06; Compass 4.9/4.9/-0.1/1 vs 4.93/4.90/-0.08/1.01), and shrink toward the display more on small pools (Animus printed 10.6/4.7/-0.6/2.2 vs raw 10.46/4.64/-0.80/2.26: the 37-rating page prints turn 0.2 closer to the old -0.5 display than the raw does).
- **The slider is mostly the display echoed back.** Counts at exactly the Atlas turn/fade: Wizard 198 of 201 at turn 0, Dagger 43 of 43, Essence 43 of 53 at -2, Deflector 51 of 63 at 0 and 58 of 63 at fade 4, F5 43 of 54 at -2 and 47 at fade 1, Compass 77 of 91 at 0 and 74 at fade 1, Pixel 13 of 15 on both. I report movers and their direction.
- **Other retailers:** Rocket Discs repeats the manufacturer numbers (and its "reviewer" line equals them on all but the Animus, 10.9/5/0/2), so it carries weight 0.1-0.2 and is not independent; Marshall Street is the Atlas baseline. **DiscGolfDojo** pages are templated from catalog numbers (its Avenger page prints speed 11 against Infinite's, Discraft's historical and the Atlas's 10), weight 0.05. **Disc Golf Puttheads'** Dagger and Wizard reviews are older and print the old flight ratings (Dagger 2/4/0/2, Wizard 3/5/0/2).
- **Arm speeds:** none stated except in occasional Infinite throwing-distance fields and reviewer text; skill labels (typed by the reviewer) are used for the splits and noted where the groups are large enough to read.
- **No outliers excluded.** The tails are in: Deflector has two fade-6 ratings (one at 4/2/2/6), F5 one -4 turn, Essence two -3, Animus one -3.

---

## Animus — Thought Space Athletics (id ab99c93cbcae)

- **Atlas now:** 11/5/0/2 (source: Marshall Street snapshot; PDGA approval 20-50, Jun 23, 2020; no override). **Proposed turn/fade:** none. **Open candidate recorded, not proposed: turn 0 → -0.5 (|Δ| 0.5).** Reference plastic (assumed most-thrown): Ethereal (13 of 37 Infinite ratings; Aura 12 and Ethos 9 are close, so no plastic dominates).
- **Manufacturer:** TSA's "Molds" page (fetched, current): **ANIMUS, Distance Driver, 11 | 5 | 0 | 2**, "blends distance and control into one dependable package. Stable flight and a consistent finish make it a trusted choice when accuracy matters." Matches the Atlas. **TSA's Distance Driver collection page lists no Animus product** at fetch (Construct, Expanse, Requiem and Synapse variants only), so production status is unverified. The 2020 launch copy is not retrievable.
- **Retailer:** Infinite mfr line 11/5/0/2, label "Overstable"; reviewer numbers 10.6/4.7/-0.6/2.2 (37 reviews, 4.39 stars). Infinite's description (verbatim): "moderately overstable flight pattern … handles torque well when thrown by experienced players … has been compared to a cross between an Innova Wraith and Thunderbird." Rocket prints 11/5/0/2 (its reviewer line 10.9/5/0/2). **TSA says "stable"; Infinite says "overstable"; the numbers (0/2) are the Thunderbird's, while the "Wraith-and-Thunderbird cross" description places the disc between 0/2 and the Wraith's -1/3.**
- **Community (Infinite raw, all 37 rated, 2020-2025; computed):** mean **10.46/4.64/-0.80/2.26**, median -0.5/2.5. Turn: -3 (1), -2.5 (2), -2 (2), -1.5 (3), -1 (5), **-0.5 (16)**, 0 (8). Fade: 1 (3), 1.5 (3), 2 (9), **2.5 (17)**, 3 (4), 3.5 (1). **Against the Atlas's 0: 29 of 37 read more turn, 0 read less; against fade 2: 22 read more, 6 less.** **Era split (the echo rule):** through Mar 15, 2023 (31 ratings, display 10.5/4.5/-0.5/2.5): **-0.79/2.32**; turn 11 more than the display, 16 on it, 4 less; fade 10 below the display, 16 on it, 5 above. From Apr 4, 2023 (6 ratings, display 11/5/0/2): four echo 0/2 exactly, one reads -2.5/2.5 (beginner, Apr 2023), one -2.5/1 (intermediate, Oct 2025). **By skill:** beginner 9 -1.33/2.17; intermediate 17 -0.65/2.32; advanced 9 -0.44/2.28; professional 2 -1.25/2.0 (advanced and professional together, 11: -0.59/2.23, nine of them from the old-display era and mostly sitting on its -0.5/2.5). Text: "touchier than the numbers suggest. Marketed as a mix between wraith and thunderbird … turns over more" (beginner, 2020); "more flippy than the numbers suggest. Into the wind this turns and burns when released flat" (intermediate, 2025, rated -2.5/1); "SUPER flippy … release on hyzer, almost turns into a roller" (beginner, Ethereal, 2023); "as floppy as they come … flies similar to a hatchet/heat" (advanced, Ethereal, 2023); "a Destroyer for the common man" (intermediate, Aura, 2020). Against: "definitely not understable at all … a lot like a C Line PD or a somewhat glidey FD3" (intermediate, Aura, 2023); "in Ethos it is more overstable … this fills the Grace/Wraith slot" (advanced, 2024); "straight-flying 11-speed with a consistent fade" (intermediate, Ethereal, 2023); "somewhere between a Thunderbird and a Wraith. In the Glow plastic, it is overstable" (advanced, Glow, 2022). DGCR (read directly): a Jan 2, 2021 poster with a 168 g Ethereal and a "noodle arm": "I do not get any turn out of it … maybe HSS 0 and LSS 2.5 for me" (arm speed matters: 11-speeds read more turn under power and less under finesse); a Jun 2022 poster: "feels more like a fast fairway, a faster flat PD … the Animus is faster and a bit less stable than the Omen" (Omen 9/4/0/4). TSA forum posters say it shares dimensions with the MINT Longhorn (Infinite prints Longhorn 11/4/-1/2.5, reviewers 11/4.1/-1/2.7); a reply notes the PDGA rim configurations differ, and the Atlas's PDGA specs agree (Animus 21.2 cm / 1.6 cm tall, Longhorn 21.3 / 1.5), so I do not treat the Longhorn as evidence.
- **Why this is an open candidate and not a proposal:** *For -0.5:* the display Infinite showed for its first ~2.5 years (and which 16 of 31 raters left at exactly -0.5) was -0.5/2.5, i.e. the Wraith-Thunderbird midpoint the launch copy describes; the raw pool (-0.80) sits nearer the Wraith than the Thunderbird; every one of the 29 non-zero turn ratings is toward more turn; the beginner/intermediate readers (who are not the audience Infinite and TSA name) read the most. *Against:* TSA's **current** page and the Atlas say 0/2; the nine advanced/professional ratings mostly echo the old -0.5 rather than 0, so they neither confirm nor contradict -0.5 vs 0; only six ratings post-date the display change; no arm speeds; plastic spread inside 0.6 turn (Glow n=2 is the one outlier). The |Δ| is 0.5 on a mold whose number has (apparently) already moved once. **If TSA has a statement on why it changed 10.5/4.5/-0.5/2.5 to 11/5/0/2, that settles it.**
- sources:
  - {name: Thought Space Athletics Molds page (Animus 11|5|0|2; copy), url: https://thoughtspaceathletics.com/pages/molds, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Animus (mfr 11/5/0/2; reviewers 10.6/4.7/-0.6/2.2; 37 ratings; raw list via DiscComments), url: https://infinitediscs.com/thought-space-athletics-animus, type: retailer, weight: 0.5}
  - {name: Infinite reviewer text, 37 raw ratings (skill, plastic, date labelled; no arm speeds), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.4}
  - {name: DGCR "Thought Space Athletics" thread p.5-7 and "Though Space Athletics Discs?" (read directly), url: https://www.dgcoursereview.com/threads/though-space-athletics-discs.147961/, type: community, weight: 0.3}
  - {name: Rocket Discs Animus (11/5/0/2), url: https://rocketdiscs.com/thought-space-athletics-animus, type: retailer, weight: 0.1}
- **confidence:** 0.55
- **consensusNote:** The manufacturer's current page, Infinite's current mfr line, Rocket and the Atlas all say 11/5/0/2. The reviewers (-0.80/2.26 raw, 29 of 37 reading more turn than 0, a disc "between a Thunderbird and a Wraith") and Infinite's own pre-April-2023 display (-0.5/2.5) sit half a step to a whole step more turn than the Atlas. The gate is not met (current manufacturer number, echo-anchored advanced raters, six post-change ratings), so nothing is proposed.
- **plasticVariance:** Ethereal -0.88/2.04 (13), Aura -0.83/2.21 (12), Ethos -0.83/2.39 (9), TSA Glow -0.25/3.25 (2), Nebula Aura one rating (0/2.5). Reviewers say Ethos and Glow run more overstable and the Aura/Ethereal runs "really bomb"; the spread is inside 0.6 turn and the Glow is two ratings. TSA prints one set of numbers. Do not average.
- **Linked:** Wraith (11/5/-1/3), Thunderbird (9/5/0/2), Omen (9/4/0/4), Coalesce (9/5/0/3), Grace (L64), Anax (10/6/0/3), PD (Discmania). Set re-checked above.

## Vanguard — Discmania (id c5f734a0365b)

- **Atlas now:** 9/5/0/2 (source: Marshall Street snapshot; PDGA approval 23-159, Jun 5, 2023; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): S-Line (Special Blend/Swirl; 3 of 4 Infinite ratings, plus C-Line and Horizon runs).
- **Manufacturer:** Discmania's US site (fetched, search and collection lists): **"Vanguard – Fairway Driver – 9 | 5 | 0 | 2"**, product cards 9 Speed / 5 Glide / 0 Turn / 2 Fade across the Kyle Klein Creator Series runs. Infinite quotes Discmania's copy: "a blunt nose reminiscent of the FD1 or FD3 … delivers with moderate fade and dependable control." Copy and numbers agree. The disc is Kyle Klein's signature (Creator Series, 2023).
- **Retailer:** Infinite label "Stable"; mfr line 9/5/0/2; reviewer numbers 9/5/0/2 (4 reviews, so the printed figure is the display plus four echoes). Rocket Discs prints 9/5/0/2.
- **Community (Infinite raw, all 4 rated, 2023-2024):** mean 9/5/-0.12/2.0; turn 0 on three, -0.5 on one; fade 2 on all four. Text: "plain and simple, this is a Thunderbird with slightly more glide … little to no turn, with a decent fade" (advanced, 2023); "not as stable as a Halo Thunderbird … very reliable fade to the left" (advanced, 2024); "truly Discmania's Thunderbird. Dumps a bit when thrown on hyzer and will fight out of all but a roller anhyzer" (intermediate, Glow C-Line, 275 ft, 2024). **DGCR (read directly; Mar 5, 2026, poster Twmccoy, C-Line 173 g):** "really nice, steady, neutral fairway driver … 9, 5, 0, 2 … pretty much dead on … a somewhat beat Thunderbird or Anax. Long, straight flight followed by a late, gradual fade … max distance probably 375'." **Disc Golf Deals USA** (retailer blog, Golden Horizon run; weight 0.2): "the same [numbers] as an Innova Thunderbird … similar to a seasoned PD or a brand new Star Thunderbird … always fades out at the end"; the PD (10/4/0/3) is "a touch more stable."
- sources:
  - {name: Discmania US site (Vanguard 9|5|0|2), url: https://www.discmania.net/search?q=vanguard, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Vanguard (mfr 9/5/0/2; 4 ratings; raw list via DiscComments; Discmania copy), url: https://infinitediscs.com/discmania-vanguard, type: retailer, weight: 0.4}
  - {name: DGCR "Discmania - Vanguard (fairway driver)" (Mar 2026; read directly), url: https://www.dgcoursereview.com/threads/vanguard-fairway-driver.182593/, type: community, weight: 0.3}
  - {name: Disc Golf Deals USA Golden Horizon Vanguard review (retailer blog), url: https://discgolfdealsusa.com/blogs/news/discmania-golden-horizon-vanguard-review, type: community, weight: 0.2}
  - {name: Infinite reviewer text, 4 raw ratings, url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** Discmania, Rocket, Infinite's four reviewers, a DGCR thrower and a retailer blog all describe the Thunderbird's flight and give it 9/5/0/2. Nothing contradicts; the sample is small and recent (the mold is a 2023 release), so confirmation is "no contradicting evidence" with four agreeing sources, not a large-sample check.
- **plasticVariance:** Not enough ratings to rank plastics (S-Line Special Blend three, Glow C-Line one). The DGCR thrower tested C-Line (domey); the retail blog tested Horizon (stiff). Do not average.
- **Linked:** Thunderbird (9/5/0/2; pool -0.09/2.12 on 261), Anax, Vulture, Undertaker (9/5/-1/2), CD1 (9/5/-1/2), PD, FD3. Set re-checked above; nothing moves.

## Wizard — Gateway (id 3e3ec8fe318c)

- **Atlas now:** 2/3/0/2 (source: Marshall Street snapshot; PDGA approval 02-01, Jan 9, 2002; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Super Stupid Soft (33 of 201 Infinite ratings; no Gateway plastic exceeds 17%, and turn is identical in every plastic with three or more ratings).
- **Manufacturer:** Gateway's site was unreachable (see Evidence limits). **Gateway's own note, as quoted in a Disc Golf Puttheads review fetched directly:** "Our most popular disc of any kind, the Gateway Wizard is a true, stable workhorse putter. The Wizard holds whatever line you throw it with very little fade during its drop, and is also a great putter in windy conditions." (That review prints the older flight rating 3/5/0/2.) Gateway's current numbers could not be read; the Atlas, Infinite (mfr line 2/3/0/2) and Rocket (2/3/0/2) agree, and **turn 0 / fade 2 have not changed in any layer I could date**. **Mild copy-versus-number tension, not a contradiction:** "very little fade during its drop" against fade 2.
- **Retailer:** Infinite label "Stable"; mfr line 2/3/0/2; reviewer numbers 2.3/3.6/0/1.9 (294 reviews, 4.71 stars). Rocket 2/3/0/2. Marshall Street is the Atlas baseline. (A search summary of Marshall Street's listing repeated Gateway's "stable workhorse putter" line; flagged as summary.)
- **Community (Infinite raw, 201 rated of 294, 2015-2026; computed):** mean **2.42/3.65/-0.01/1.92**, median 0/2. **Turn: 0 on 198 of 201** (-1, -0.5 ×2). Fade: 2 (172), 1.5 (18), 1 (4), 0.5 (3), 2.5 (4). **By skill:** intermediate 108 -0.01/1.91; beginner 44 -0.01/1.95; advanced 38 0.00/1.92; professional 11 0.00/1.95 (advanced and professional together, 49: turn 0 on all 49, fade 2 on 40, below on 8, above on 1). **By era:** through 2017 (display 3/5/0/2) 39 ratings, turn 0 on all, fade 1.83 (31 at 2, 8 below); 2018 onward (display 2/3/0/2) 162 ratings, -0.01/1.94 (159 at turn 0, 141 at fade 2). Text agrees on shape: "reliably stable without being a meathook" (intermediate, Super Soft, 2023), "beaded, relatively stable" (beginner, Pure White, 2020), "think a deeper Judge, very straight flying, stable finish" (intermediate, 2024), "quite an overstable flight … glides briefly then fades" (advanced, Pure White, 2022), "a great overstable putter for approach shots" (intermediate, Super Glow SS, 2020). Comparisons: Aviar ("basically a grippier, less glidey Aviar", beginner, 2021), Judge, Challenger, P2, Zone/Harp ("beat-in Zone/Harp style", intermediate, 2020).
- **Catalog note (not a stability item):** the Atlas carries a second Gateway row, **"Wizard (revised)" (id d14b7ade9552, PDGA 16-91, Dec 30, 2016; diameter 21.2 cm against the original's 21.0), with no flight numbers and production status unknown.** Infinite's 294 reviews are pooled at one Wizard page and do not distinguish the two. Turn 0 / fade 2 is stable across the whole 2015-2026 rating history, so the revision does not appear to have changed stability, but which approval is the current production mold cannot be settled from my tooling.
- sources:
  - {name: Disc Golf Puttheads Gateway Wizard review (quotes Gateway's own note; prints older 3/5/0/2), url: https://www.dgputtheads.com/gateway-wizard-review, type: community, weight: 0.4}
  - {name: Infinite Discs Wizard (mfr 2/3/0/2; reviewers 2.3/3.6/0/1.9; 294 reviews; raw list via DiscComments), url: https://infinitediscs.com/gateway-wizard, type: retailer, weight: 0.5}
  - {name: Infinite reviewer text, 201 raw rated reviews (skill, plastic, date labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.5}
  - {name: Rocket Discs Wizard (2/3/0/2), url: https://rocketdiscs.com/gateway-wizard, type: retailer, weight: 0.1}
- **confidence:** 0.85
- **consensusNote:** 198 of 201 raters put turn at 0 (all 49 advanced/professional), fade centres on 2 in both display eras, and Gateway's own copy calls it a "true, stable workhorse." Challenger and Envy pools land on the same 0/1.9. Nothing supports moving the Atlas.
- **plasticVariance:** Turn 0 in every plastic with ≥3 ratings. Fade: Super Stupid Soft 1.85 (33), Super Soft 1.96 (27), SSSS 1.81 (16), Eraser 2.0 (16), Pure White 1.97 (16), Soft 2.0 (12), Special Blend 1.95 (11), Firm 1.88 (8), Platinum 1.33 (3, thin). Gateway sells the Wizard in about a dozen blends and prints one set of numbers. Do not average.
- **Linked:** Challenger (2/3/0/2), Envy (3/3/0/2), Aviar, Judge, Dagger (batch 18), Magic (2/3/-1/0), Magnet (2/3/-1/1), Zone. Set re-checked above; nothing moves.

## F5 — Prodigy (id 37cf45c39fd2)

- **Atlas now:** 8/6/-2/1 (source: Marshall Street snapshot; PDGA approval 13-71, Nov 1, 2013; no override). **Proposed turn/fade:** none. Matches Prodigy's current page. Reference plastic (assumed most-thrown): 400 (24 of 54 rated; Prodigy calls 400 "the most popular Prodigy plastic across the entire lineup").
- **Manufacturer:** Prodigy's nav list and the F5 400 product page (both fetched): **8 | 6 | -2 | 1.** Copy: "a high speed, stable to under stable fairway driver … designed for all skill levels and flies extremely far and incredibly straight. The F5 will turn up slightly when thrown hard it will go into a long glide before finishing gently to the stable side." **Mild copy-versus-number tension:** "stable to understable" with a -2 turn (which reads as understable), not a numeric contradiction.
- **Retailer:** **Infinite prints 7/5/-2/1** (label "Understable"; reviewer numbers 7/5/-1.9/1.1 on 62 reviews). **The July 2023 renumbering hazard shows on this mold as speed and glide only (Infinite 7/5, Prodigy and the Atlas 8/6); turn and fade (-2/1) are identical in both.** 49 of 54 ratings echo speed 7 and 50 glide 5. Infinite's description (verbatim): "a straight-flying fairway driver that's not quite as understable as the current F7 … very domey."
- **Community (Infinite raw, 54 rated of 62, 2013-2025; computed):** mean 7.06/5.05/**-1.92/1.07**, median -2/1. Turn: -4 (1), -2.5 (3), **-2 (43)**, -1.5 (2), -1 (2), -0.5 (2), 0 (1). Fade: 0 (1), **1 (47)**, 1.5 (4), 2 (1), 3 (1). Movers: 4 toward more turn, 7 toward less (balanced); fade 1 below, 6 above. **By skill:** intermediate 31 -2.02/1.00; advanced 10 -1.55/1.35; beginner 9 -1.94/1.06; professional 4 -2.0/1.0 (advanced and professional together, 14: -1.68/1.25, 11 at -2, 3 less turn). **By era:** through 2019 (26) -1.69/1.13; 2020 onward (28) **-2.12/1.02**, so the older half reads slightly more stable, the newer half slightly more understable, both within half a step. Text in the older half is the "more stable than the numbers; a domey lightweight one fixes it" comments (2013-2016: "nearly zero turn and a fade of 2-3", "the F5 and F7 are reversed", "I would rate it 7/6/-2/1 or even .5 fade") and run-to-run variance; the later text is "the straightest, most workable fairway driver I've ever thrown", "hyzer-flip city", "a very neutral flying fairway driver", "borderline essential for slower arms … flip & dump at full power" (intermediate, 500, 2020). DGCR F5 threads (read directly; 2013-2015) repeat the variance and the "most are more stable than they suggest" theme; I did not weight older-run comments over the 2019-2025 ratings.
- sources:
  - {name: Prodigy F5 400 product page and nav list (8|6|-2|1; copy), url: https://prodigydisc.com/products/prodigy-f5-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs F5 (mfr 7/5/-2/1; reviewers 7/5/-1.9/1.1; 62 reviews; raw list via DiscComments), url: https://infinitediscs.com/prodigy-f5, type: retailer, weight: 0.4}
  - {name: Infinite reviewer text, 54 raw rated reviews (skill, plastic, date labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.5}
  - {name: DGCR "Prodigy f5" and "F5" threads (read directly; older runs), url: https://www.dgcoursereview.com/threads/prodigy-f5.110354/, type: community, weight: 0.15}
- **confidence:** 0.8
- **consensusNote:** Prodigy's current sheet, Infinite's line and the 54 reviewers (80% exactly at -2, fade 1 on 47, movers balanced, 2020+ half at -2.12) all give -2/1; the pool matches the Leopard and the Essence to the hundredth. The only differences are retailer-side speed/glide.
- **plasticVariance:** 400 -1.92/1.04 (24), 400G -2.11/1.28 (9), 750 -1.57/1.14 (7), 500 -2.10/0.90 (5), 400 Glimmer -1.67/1.0 (3). One reviewer says the 750 "flies dead straight with little to no turn" while 400/400G "show turn" (2018), consistent with the 750's less-turn reading; the premium plastics are the flippier ones. Prodigy prints one set. Do not average.
- **Linked:** F3 (8/5/-2/2), F7 (8/6/-3/1), F9 (8/6/-4/0.5), FX-3 (9/5/-1/2), Leopard, Essence. Set re-checked above; F3 and FX-3 flagged, nothing proposed.

## Pixel — Axiom (id e125b84243c2)

- **Atlas now:** 2/4/0/0.5 (source: Marshall Street snapshot; PDGA approval 23-218, Sep 5, 2023; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Electron / Electron Firm (11 of 15 Infinite ratings; Axiom introduced a new Electron blend with this disc).
- **Manufacturer:** Axiom's Pixel page (fetched): **2 | 4 | 0 | 0.5, "Neutral"**. Copy: "a deep profile with a small micro bead … someone who wants a laser-straight flight … a very neutral flying disc off the tee or for approaches." Matches.
- **Retailer:** Infinite label "Stable"; mfr line 2/4/0/0.5; reviewer numbers 2/4.1/-0.1/0.5 (15 reviews, 4.7 stars). Rocket repeats Axiom's copy and numbers.
- **Community (Infinite raw, all 15 rated, 2024-2025; computed):** mean 2/4.13/**-0.10/0.50**. Turn: 0 (13), -0.5 (1), -1 (1). Fade: 0.5 (13), 0 (1), 1 (1). Advanced and professional together (5): turn 0 on all five, fade 0.5 on four, 1 on one. **Echo rule:** the display has been 2/4/0/0.5 for the whole life of the disc, so 13 of 15 echoing it is an echo, not a measurement; the informative signal is the two who moved on turn (both toward more turn) and the two on fade (one each way). Text: "one of the straightest discs I've thrown. When ripping full power on it I get no more than a slight flip up and a dead straight flight with little to no finish" (intermediate, Electron Firm, 275 ft, 2024); "super straight flyer with just a touch of finish if thrown flat" (intermediate, 2024); "out of the box a very minimal amount of fade … once it is beat-in it basically becomes a laser beam" (intermediate, 300 ft, 2024, rated 2/5/-1/0.5); "a dead straight throw off the tee with a small, predictable fade" (advanced, Signature Electron, 225 ft, 2024). **Named reviewer:** Disc Golf Reviewer (Alan, Feb 2024, early look): "dependable flight that is dead straight … maintaining a straighter flight towards the end compared to the Alpacas that exhibit a little more fade."
- sources:
  - {name: Axiom Pixel product page (2|4|0|0.5, Neutral; copy), url: https://axiomdiscs.com/discs/pixel/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Pixel (mfr 2/4/0/0.5; reviewers 2/4.1/-0.1/0.5; 15 reviews; raw list via DiscComments), url: https://infinitediscs.com/axiom-pixel, type: retailer, weight: 0.4}
  - {name: Infinite reviewer text, 15 raw rated reviews (skill, plastic, distance labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.3}
  - {name: Disc Golf Reviewer Axiom Simon Line Pixel review (Alan), url: https://discgolfreviewer.com/axiom-simon-line-pixel-review/, type: community, weight: 0.3}
- **confidence:** 0.7
- **consensusNote:** Axiom's page, Infinite and every reviewer text describe a laser-straight putter with minimal finish; the raw ratings sit at 0/0.5 (13 of 15). Small, recent sample (2024 release), so "no contradicting evidence," with a unanimous direction.
- **plasticVariance:** Electron Firm -0.08/0.42 (6), Electron -0.20/0.50 (5), Signature Electron 0/0.75 (2), Soft one each; spread inside 0.2. Reviewers mention Soft/Medium/Firm feel differences, not flight. Axiom prints one set. Do not average.
- **Linked:** Nomad (2/4/0/1; pool -0.03/1.05), Judge (2/4/0/1), Envy (3/3/0/2), Aviar, Wizard. Set re-checked above; the Pixel is the lowest-fade putter in the set (0.5 vs 1) in the pools as in the Atlas.

## Deflector — MVP (id ceccfa41e4e8)

- **Atlas now:** 5/3.5/0/4 (source: Marshall Street snapshot; PDGA approval 18-28, Feb 26, 2018; no override). **Proposed turn/fade:** none. Matches MVP's page. Reference plastic (assumed most-thrown): Neutron (37 of 63 Infinite ratings; Proton 19, Eclipse 7).
- **Manufacturer:** MVP's Deflector page (fetched): **5 | 3.5 | 0 | 4, "Overstable"**. Copy: "the Deflector is here to combat headwinds … Among the most overstable midranges ever created … On an anhyzer release the Deflector will fight out of its turn and flatten out to fade." Copy and numbers agree.
- **Retailer:** Infinite label "Very Overstable"; mfr line 5/3.5/0/4; reviewer numbers 5/3.5/0.1/4.1 (63 reviews, 4.75 stars); Infinite's description: "a meat-hook with a hard fade … MVP gives the flight rating a 5 / 3.5 / 0 / 4." Rocket repeats MVP's numbers.
- **Community (Infinite raw, all 63 rated, 2018-2024; computed):** mean 5.02/3.51/**+0.16/4.06**, median 0/4. Turn: **0 (51)**, +0.5 (6), +1 (5), +2 (1); no rating reads less than 0. Fade: **4 (58)**, 4.5 (2), 6 (2), 3 (1). **By skill:** intermediate 38 +0.12/4.04; advanced 12 +0.38/4.17; beginner 9 +0.11/4.00; professional 4 0.00/4.12. The advanced raters are the ones who read a hint of right-turn at full power (5 of 16 advanced/professional above 0, mean +0.28), the expected overstable-disc pattern. **By era:** 2018 (16) +0.19/4.03; 2020 (13) +0.35/4.31 (two outliers, 4/2/2/6 and 5/2.5/1/6); 2021 onward (23) +0.07/3.98. The fade is stable across eras. Text: "the real deal … the beefy, overstable mid-range" (2018), "just as overstable as my beat in Biofuzion Justice" (2018), "the most overstable mid on the market. It fades so fast" (2019), "up there in the Justice or Anvil territory, little more stable than a Zone" (professional, 2020; glide read 3 not 4), "the MVP version of a flat top Gator, but without bead" (2019). DGCR Deflector thread (read directly, p.6; 2018): a moderator after testing, "Wow overstable"; a Deflector owner noting domey versus board-flat factory variation (Oct 2018). Glide is out of scope here (several raters say 3, MVP says 3.5).
- sources:
  - {name: MVP Disc Sports Deflector page (5|3.5|0|4, Overstable; copy), url: https://mvpdiscsports.com/discs/deflector/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Deflector (mfr 5/3.5/0/4; reviewers 5/3.5/0.1/4.1; 63 reviews; raw list via DiscComments), url: https://infinitediscs.com/mvp-deflector, type: retailer, weight: 0.5}
  - {name: Infinite reviewer text, 63 raw rated reviews (skill, plastic, date labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.5}
  - {name: DGCR "Deflector" thread p.6 (read directly), url: https://www.dgcoursereview.com/threads/deflector.136996/page-6, type: community, weight: 0.2}
- **confidence:** 0.85
- **consensusNote:** MVP's page, Infinite and 63 raw ratings (turn +0.16, fade 4.06, 58 of 63 exactly at 4, no era drift) agree on 0/4, and the cross-comparisons (Justice, Gator, Zone) put it at the very overstable end where the Atlas has it.
- **plasticVariance:** Neutron +0.19/4.05 (37), Proton +0.11/4.11 (19), Eclipse 1.0 +0.14/4.00 (7); spread inside 0.1. MVP prints one set. Do not average.
- **Linked:** Justice (5/1/0.5/4; pool 4.09), Gator (5/2/0/4, applied; pool 3.18), Resistor (6.5/4/0/3.5; pool 3.32), Zone (4/3/0/3; 2.98), MD5, Harp. Set re-checked above; nothing moves.

## Avenger — Discraft (id fa5bf2ffb814)

- **Atlas now:** 10/5/0/3 (source: Marshall Street snapshot; PDGA approval 05-08, May 3, 2005; no override). **Proposed turn/fade:** none. Matches Infinite's mfr line. Reference plastic (assumed most-thrown): Z Line (9 of 25 rated; ESP 5, X Line 4, ESP FLX 3).
- **Manufacturer:** **no live Discraft page for the plain Avenger** (discraft.com's search for "avenger" returns only Avenger SS, which prints 10 | 5 | -3 | 1, "Stability 0.5"). Infinite (verbatim): "an overstable distance driver good for intermediate and advanced players … Discraft gives the Avenger a stability rating of 1.8. The Avenger is semi-out-of-production, and is only available with special releases, like Ledgestone Special Edition … try the Anax. It's a very similar disc." DGCR (Apr 2025, read directly): "the Avenger has been relegated to OOP or Ledgestone LE status." Manufacturer numbers are therefore the historical 10/5/0/3 relayed by Infinite, Rocket and the DGCR thread, not a current Discraft page.
- **Retailer:** Infinite label "Very Overstable"; mfr line 10/5/0/3; reviewer numbers 9.9/4.8/0/2.9 (44 reviews, 4.23 stars). Rocket 10/5/0/3. DiscGolfDojo prints speed 11 (templated; speed is out of scope).
- **Community (Infinite raw, 25 rated of 44, 2014-2024; computed):** mean 9.88/4.72/**-0.02/2.80**, median 0/3. Turn 0 on 21, -0.5 (3), +1 (1). Fade: **3 (17)**, 2.5 (3), 2 (4), 3.5 (1). **By skill:** intermediate 15 -0.10/2.83; advanced 6 +0.17/2.67; beginner 3 0.0/2.83; professional 1 0/3 (advanced and professional together, 7: fade 2.71, five at 3). **By era:** through 2018 (17) -0.03/2.88; 2019 onward (8) 0.00/**2.62** (median 2.75). The 44 reviews include 19 without flight ratings; their text: "a straight flying disc … the S curve of this disc is a magical thing to watch" (professional, 2012), "this disc has a heavy hook on it" (Nate Doss Elite X, 2013), "arrow straight for about 270 feet then just a couple of feet of high speed turn … not at all like the flight chart" (Elite Z, intermediate, 2014), "I would definitely call this disc overstable, and not beginner-friendly" (Z Line, 2015), "similar to an Innova Thunderbird" (two reviewers, 2017 and 2019), "one of the first control drivers on the market" (intermediate, 2016), "flew shorter than a Vulture or Anax for me" (advanced, 2018), "close to a Predator but not quite … more in the speed 9 range based on my feeling on the rim size" (professional, ESP, 2020). DGCR "Avenger vs Vulture vs Anax" (Apr-May 2025, read directly): the opening post gives 10/5/0/3, 10/5/0/2, 10/6/0/3 and says the Anax's added glide is the only difference he found; a thrower of 350-380 ft ranks stability "1. Avenger 2. Vulture 3. Banzai"; another says "I have always felt Anax as more over stable than the Vulture."
- **Soft observation, not a candidate (new):** fade reads **2.80 raw** (7 of 25 below 3, one above) and **2.62 from 2019 on (8 ratings)**; the gap to the Atlas's 3 is 0.2-0.4, inside a half-step, with no arm speeds, a semi-discontinued mold and a small, aging sample. Becomes a candidate only if a firmer layer (a current Discraft statement, or a skill-stratified sample of 2020s Ledgestone runs) reads 2.5.
- sources:
  - {name: Infinite Discs Avenger (mfr 10/5/0/3; Discraft stability 1.8 quote; reviewers 9.9/4.8/0/2.9; 44 reviews; raw list via DiscComments), url: https://infinitediscs.com/discraft-avenger, type: retailer, weight: 0.5}
  - {name: Infinite reviewer text, 25 raw rated reviews (skill, plastic, date labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.4}
  - {name: DGCR "Discraft - Avenger vs Vulture vs Anax" (Apr-May 2025; read directly), url: https://www.dgcoursereview.com/threads/avenger-vs-vulture-vs-anax-is-there-really-a-difference.181189/, type: community, weight: 0.3}
  - {name: Discraft site (Avenger SS 10|5|-3|1; plain Avenger not listed), url: https://www.discraft.com/search?q=avenger, type: manufacturer, weight: 0.3}
  - {name: Rocket Discs Avenger (10/5/0/3), url: https://rocketdiscs.com/discraft-avenger, type: retailer, weight: 0.1}
- **confidence:** 0.7
- **consensusNote:** No contradicting evidence: Infinite's line, Rocket, the reviewer pool (turn ~0, fade 2.8) and a DGCR thrower who has handled all three of Avenger, Vulture and Anax agree on a 0-turn, ~3-fade disc whose pool lands on the Anax's. The thinness is the mold's age and scarcity, not a disagreement.
- **plasticVariance:** Z Line 0.06/2.61 (9), ESP -0.10/2.80 (5), X Line 0.0/2.88 (4), ESP FLX 0.0/3.0 (3); spread inside 0.4 on fade, the Z Line the lowest. Discraft prints one set. Do not average.
- **Linked:** Anax (10/6/0/3; pool 2.81), Vulture (10/5/0/2; 2.05), Avenger SS (10/5/-3/1; -2.89/1.03), Undertaker (9/5/-1/2), Predator (batch 3), Thunderbird. Set re-checked above; nothing moves.

## Essence — Discmania (id 8dc8ae85af4c)

- **Atlas now:** 8/6/-2/1 (source: Marshall Street snapshot; PDGA approval 20-22, Mar 5, 2020; no override). **Proposed turn/fade:** none. Matches. Reference plastic (assumed most-thrown): Neo (50 of 53 Infinite ratings).
- **Manufacturer:** Discmania's US site (fetched): **"Essence – Fairway Driver – 8 | 6 | -2 | 1"**, with product cards 8 Speed / 6 Glide / -2 Turn / 1 Fade (Neo, Neo Horizon, Neo Lumen, Soft Exo runs). Infinite quotes Discmania's copy: "a do-it-all fairway driver in the Evolution lineup, shines with its understable nature." A separate mold, **Premier Essence, is listed at 8 | 7 | -1 | 1** (the Atlas carries it separately as 8/7/-1/1). Copy and numbers agree. **Label tension, retailer side:** Infinite labels the Essence "Stable" while its own description says "understable."
- **Retailer:** Infinite mfr line 8/6/-2/1; reviewer numbers 8/6/-1.9/1.1 (53 reviews, 4.79 stars); Rocket 8/6/-2/1.
- **Community (Infinite raw, all 53 rated, 2020-2026; computed):** mean 8.02/5.99/**-1.93/1.08**, median -2/1. Turn: -3 (2), -2.5 (1), **-2 (43)**, -1.5 (3), -1 (3), -0.5 (1). Fade: 0.5 (3), **1 (41)**, 1.5 (6), 2 (3). Movers: turn 3 toward more, 7 toward less; fade 3 below, 9 above. **By skill:** intermediate 35 -1.91/1.07; beginner 9 -2.06/1.06; advanced 8 -1.75/1.25; professional 1 -3/0.5 (advanced and professional together, 9: -1.89/1.17). **By era:** through 2022 (44) -1.95/1.07; 2023 onward (9) -1.83/1.17. Text: "flies exactly to the numbers" (intermediate, 2020), "the numbers are spot on and you can notice that 6 glide" (intermediate, 2021), "pretty much what I expected, maybe a tick less stable" (2021), "similar to a Star Leopard3 but a touch faster and holds its turn a little longer" (intermediate, 2020), "a bit faster and a bit more stable than the numbers suggest. 9 6 -1 2" (advanced, 2021). Two intermediates report discs closer to "8/6/0/1.5" or -0.5/1.5 (2022). One adverse reviewer says a first-run ("Primal") disc was less stable than the production run (hearsay). DGCR "Essence" thread (2020, read directly): "slightly understable and the glide is for real. Extremely similar flight to my Elasto Hatchet … more overstable than Opto Hatchet, Fury, Maul … slightly less stable than S-FD, Vandal, Falcion."
- sources:
  - {name: Discmania US site (Essence 8|6|-2|1; Neo run cards), url: https://www.discmania.net/search?q=essence, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Essence (mfr 8/6/-2/1; reviewers 8/6/-1.9/1.1; 53 reviews; raw list via DiscComments; Discmania copy), url: https://infinitediscs.com/discmania-essence, type: retailer, weight: 0.5}
  - {name: Infinite reviewer text, 53 raw rated reviews (skill, plastic, date labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.5}
  - {name: DGCR "[Discmania] Essence" thread (2020; read directly), url: https://www.dgcoursereview.com/threads/essence.142624/, type: community, weight: 0.2}
- **confidence:** 0.85
- **consensusNote:** Discmania, Infinite, Rocket and 53 reviewers (-1.93/1.08, 81% exactly at -2, balanced movers, no era drift) agree on -2/1; the pool coincides with the Leopard's and the F5's. Nothing supports moving it.
- **plasticVariance:** Neo -1.96/1.06 (50); Meta -1.50/1.50 (3, too thin to rank). Discmania prints one set. Do not average.
- **Linked:** Premier Essence (8/7/-1/1), Leopard (6/5/-2/1; pool -1.93/1.01), F5, Falk (9/6/-2/1; -2.30/1.31), Instinct (7/5/0/2), Genius, Function (8/6/-4/1; pool -3.25 on 6), Stag. Set re-checked above; nothing moves.

## Dagger — Latitude 64 (id 31f250847807)

- **Atlas now:** 2/5/0/1 (source: Marshall Street snapshot; PDGA approval 14-36, Apr 13, 2014; no override). **Proposed turn/fade:** none. Matches Latitude 64's page. Reference plastic (assumed most-thrown): Zero Hard (14 of 43 rated; Zero Medium 12, the plastic Disc Golf Reviewer used).
- **Manufacturer:** Latitude 64's Dagger collection page (fetched): **Speed 2 | Glide 5 | Turn 0 | Fade 1, "Overstable"** (filter label; page title "Stable, Deep Dish Design"). Copy: "a deep dish putter with a bead, designed for enhanced stability and control in your short game. The deep dish design traps air underneath for longer, more stable flights." Matches. **Label tension (maker side):** L64 labels the 0/1 Dagger "Overstable" but the 0/1 Compass "Stable"; a speed-adjusted reading, not a numeric conflict.
- **Retailer:** Infinite label "Overstable"; mfr line 2/5/0/1; reviewer numbers 2/4.8/0/1.2 (47 reviews). Infinite's description (verbatim): "developed with the help of pro disc golfer Dave Feldberg to bring Latitude 64 a deep, beaded putter similar to the Discraft Challenger and Gateway Wizard. Compared with the Wizard, this disc is not quite as deep." Rocket quotes L64.
- **Community (Infinite raw, 43 rated of 47, 2014-2025; computed):** mean 1.98/4.74/**0.00/1.26**, median 0/1. **Turn is 0 on all 43.** Fade: 1 (31), 2 (10), 1.5 (2). **The fade spread is an era effect:** 2014-2017 (9 ratings) echo the then-display **2/4/0/2** (9 of 9 at fade 2, glide 4); 2018 onward (34) echo **2/5/0/1** (31 at fade 1, 2 at 1.5, 1 at 2): pool 1.97/4.94/0.00/**1.06**. The display switch from 0/2 to 0/1 in early 2018 is inferred from the echoes; the only older source I read (Disc Golf Puttheads, undated, prints 2/4/0/2) agrees with it. So the pool carries no independent turn or fade information beyond the three post-2018 ratings above 1 (one text: "more of a stable finish than I expected," advanced, Zero Hard X-out, 2019) and the text itself. By skill (turn 0 throughout): intermediate 17 fade 1.24, advanced 14 1.32, beginner 9 1.06, professional 3 1.67. Text: "plenty stable and not too overstable unless you play it to be" (professional, Zero Hard, 2015), "very similar to a Challenger, very stable" (beginner, 2014), "a poor man's Macana that can't handle as much speed" (advanced, 2019), "holds a line extremely well … a lot of glide, but also some stability" (advanced, Retro Burst, 2022). **Named reviewers:** Disc Golf Reviewer (Jace Smellie, 2022; prints 2/5/0/1, tests Zero Medium, no stability finding); Disc Golf Puttheads (older, printed 2/4/0/2): "a bit more float and a bit more fade than a Wizard" in its putting notes but "Wizard … slightly more overstable" in its comparables list, so it contradicts itself and gets weight 0.2.
- sources:
  - {name: Latitude 64 Dagger collection page (2|5|0|1, Overstable; copy), url: https://latitude64.com/collections/dagger, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Dagger (mfr 2/5/0/1; reviewers 2/4.8/0/1.2; 47 reviews; raw list via DiscComments), url: https://infinitediscs.com/latitude-64-dagger, type: retailer, weight: 0.4}
  - {name: Infinite reviewer text, 43 raw rated reviews (skill, plastic, date labelled; ratings mostly display echoes), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.3}
  - {name: Disc Golf Reviewer Dagger match reports (Jace Smellie, 2022), url: https://discgolfreviewer.com/innova-yeti-pro-aviar-vs-latitude-64-dagger/, type: community, weight: 0.2}
  - {name: Disc Golf Puttheads Dagger review (older; prints 2/4/0/2), url: https://www.dgputtheads.com/latitude-64-dagger-review, type: community, weight: 0.2}
- **confidence:** 0.65
- **consensusNote:** L64's page, Infinite's line and the post-2018 ratings (31 of 34 at fade 1, turn 0 on all 43) say 0/1, and the text (stable, straight, a reliable fade, a Wizard/Challenger/Aviar relative with more float) fits a 0/1 putter. Because those ratings are largely the display echoed back, the confirmation is "no contradicting evidence found," not an independent measurement.
- **plasticVariance:** Zero Hard 0.00/1.36 (14), Zero Medium 0.00/1.46 (12), Zero Soft 1.0 (3), Zero Hard Burst 1.0 (5), Retro Burst 1.0 (3) (the Hard and Medium figures are contaminated by the 2014-2017 fade-2 echoes). An advanced reviewer says Zero Medium "will flex slightly more" and give a straighter flight than the Zero Hard (2018). L64 prints one set. Do not average.
- **Linked:** Wizard, Challenger (2/3/0/2), Aviar (2/3/0/1), Judge (2/4/0/1), Macana (2/5/0/1; pool -0.02/1.04), Pilot (2/5/-1/1). Set re-checked above; the Dagger sits with the fade-1 group (Aviar, Judge, Macana) and a full point under the Wizard, in the Atlas as in the pools.

## Compass — Latitude 64 (id b0b50b6a4551)

- **Atlas now:** 5/5/0/1 (source: Marshall Street snapshot; PDGA approval 15-83, Dec 9, 2015; no override). **Proposed turn/fade:** none. Matches Latitude 64's page. Reference plastic (assumed most-thrown): Opto (64 of 91 Infinite ratings).
- **Manufacturer:** Latitude 64's Compass collection page (fetched): **Speed 5 | Glide 5 | Turn 0 | Fade 1, "Stable"**. Copy: "This straight flyer will go wherever you need it to go, and holds any line in a predictable way. Not shallow, not deep, this disc will fit in any hand. Hyzer, straight, anhyzer; the Compass is a disc you can trust on every angle." Copy and numbers agree. Infinite adds Ricky Wysocki's launch quote ("The Compass will make me more confident on the course. Hyzer, straight, anhyzer; I can trust it on every angle").
- **Retailer:** Infinite label "Stable"; mfr line 5/5/0/1; reviewer numbers 4.9/4.9/-0.1/1 (91 reviews, 4.65 stars). Rocket repeats L64.
- **Community (Infinite raw, all 91 rated, 2016-2026; computed):** mean 4.93/4.90/**-0.08/1.01**, median 0/1. Turn: **0 (77)**, -0.5 (7), -1 (5), +0.5 (1), +1 (1). Fade: **1 (74)**, 0.5 (7), 0 (2), 1.5 (4), 2 (4). **By skill:** intermediate 49 -0.11/1.05; advanced 20 0.00/1.00; beginner 14 -0.18/0.86; professional 8 +0.12/1.00 (advanced and professional together, 28: turn 0 on 27, fade 1 on 26). **By era:** through 2020 (67) -0.04/1.03; 2021 onward (24) -0.17/0.94. Movers: turn 12 toward more, 2 toward less; fade 9 below, 8 above (balanced). Text: "the Latitude 64 Buzzz" (intermediate, 2018), "very similar to the Buzzz, but slightly more overstable" (several, 2019-2020), "feels more like the Mako3, but the Compass is a bit more overstable" (intermediate, 2016), "I find the Compass just a TINY bit more stable [than a Buzzz]" (advanced, 2019), "a Roc3 that holds a longer line and stays straighter" (2021), "fills the same spot in my bag as a very well seasoned Westside Bard" (advanced, 2016), "a Claymore with more stability" (DGCR launch thread, Dec 2015). Against: "more stable than the flight numbers … more of a 5/4/0/2" (intermediate, 275 ft, 2025), "if you bought this to be your slightly overstable mid-range, I'm sorry but that's not what this disc is" (intermediate, Gold Line, 350 ft, 2025, rated 5/5/-1/0.5), "[in Opto] a little more gentle turn than I would like" (professional, 2019); and the DGCR launch thread notes Wysocki himself saying he was seasoning in Compasses to a straight/understable condition.
- sources:
  - {name: Latitude 64 Compass collection page (5|5|0|1, Stable; copy), url: https://latitude64.com/collections/compass, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Compass (mfr 5/5/0/1; reviewers 4.9/4.9/-0.1/1; 91 reviews; raw list via DiscComments), url: https://infinitediscs.com/latitude-64-compass, type: retailer, weight: 0.5}
  - {name: Infinite reviewer text, 91 raw rated reviews (skill, plastic, date, distance labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.5}
  - {name: DGCR "Compass midrange" launch thread (read directly), url: https://www.dgcoursereview.com/threads/compass-midrange.126622/, type: community, weight: 0.2}
- **confidence:** 0.85
- **consensusNote:** L64's page, Infinite and 91 reviewers (-0.08/1.01; 77 of 91 at turn 0, 74 at fade 1, balanced fade movers, era drift only -0.13) agree on 0/1, and the Buzzz/Mako3/Claymore comparisons place it just on the stable side of the Buzzz, which is where the Atlas has it.
- **plasticVariance:** Opto -0.04/1.02 (64); Gold Line -0.28/1.06 (9); Opto Sparkle 0/1 (3); Gold Line Burst 0/1 (3); the remaining plastics one or two ratings each. Reviewers say the Gold Line runs a bit more turn and the Opto beats in slowly ("I don't want this disc to break in too much and start flipping over"). L64 prints one set. Do not average.
- **Linked:** Buzzz (5/4/-1/1; pool -0.71/1.05), Claymore (5/5/-1/1; -0.78/0.98), Hex (-1/1; -0.90/1.00), Mako3 (5/5/0/0), Truth, Roc3. Set re-checked above; nothing moves.

## Batch 18 report (for Freddy)

**Decided items recorded first:** the three standing rules, the batch 17 raw-data/echo method, and D2 turn and D1 fade carried parked (owner decisions, Oct 3, 2026). Nothing here touches either.

**Disc list and basis:** the ten in your brief, which are also the next ten unreviewed entries in `public/featured.js` file order after Guld (lines 162-171). The live `featured.js` is byte-for-byte the repo's. `git merge main` was a no-op.

**Proposed changes (0).** Every Atlas turn/fade equals the manufacturer's own current page where one was readable (eight of ten), and the reviewers' raw ratings land on the Atlas numbers or inside a half-step of them for nine of ten.

**Confirmed as-is (10):** Wizard, Essence, Deflector, Compass (0.85); F5 (0.8); Pixel, Avenger (0.7); Vanguard, Dagger (0.65); Animus (0.55, with an open candidate). Confirmations mean "no contradicting evidence found," not independent community verification; the Pixel, Vanguard and (via echo) Dagger samples are the least informative.

**Too thin to call (0).** The Vanguard (four Infinite ratings) is the thinnest, but a DGCR thrower, a retail reviewer and three Infinite reviewers all describe the Thunderbird's flight and nothing contradicts it.

**New open candidate (1):**
- **Animus turn 0 → -0.5 (|Δ| 0.5).** Raw pool -0.80/2.26 (37; 29 of 37 read more turn than 0, none less); Infinite's own display before ~April 2023 was 10.5/4.5/-0.5/2.5 and then became TSA's current 11/5/0/2; launch copy and Infinite's description put it between the Wraith (-1/3) and the Thunderbird (0/2) while the Atlas puts it on the Thunderbird's. Against: TSA's current page says 0/2; advanced raters echo the old -0.5 rather than 0; six ratings post-date the change. Needs a TSA statement or a skill-stratified post-2023 sample to move; not applied.

**New soft watch (1):** **Avenger fade 3 → ~2.5-2.8** (raw 2.80; 2019+ 2.62 on 8): inside a half-step, a semi-discontinued mold with no live manufacturer page. No change.

**Flags on molds outside the ten (nothing proposed):**
- **F3:** Prodigy's sheet is -2/2, Infinite's line 7/5/-1/2 and the raw pool -1.06 (2021+ -1.15, adv/pro -1.00): the pool sides with the old number. Batch 13 had this as a reviewer-versus-printed gap; the renumbering may explain it. Look when the F3 comes up again.
- **FX-3:** Infinite 9/4/-1.5/2 against Prodigy and the Atlas 9/5/-1/2 (pool -1.32/1.86 on 11).
- **Gator:** pool 3.18 against the applied override 4 (owner decision, not re-opened); informational.
- **Wizard (revised):** Atlas row has no flight numbers and an unknown production status; turn/fade for the pooled Wizard have been 0/2 in every era, so this is a catalog item, not a stability item.

**Retailer-lag findings (the brief's Prodigy watch and the usual hazards):**
- **F5:** Infinite prints 7/5/-2/1, Prodigy and the Atlas 8/6/-2/1. Speed/glide only; turn/fade identical. **No pollution of the turn/fade question.**
- **Animus, Dagger, Wizard:** old displays echoed in the raw ratings (Animus until ~Apr 2023, Dagger until 2017, Wizard until 2017); in each case the current manufacturer or Atlas number is the post-change one. Only the Animus has a live candidate.
- **Avenger:** Discraft no longer lists it; Infinite relays the historical numbers.
- **Essence:** Infinite labels it "Stable" while the numbers and copy say understable (label only).

**Spot-checks needed before any override source note:**
- All Infinite review quotes and tallies (computed from the DiscComments JSON, snapshotted only in my scratch space; rerun to reproduce), the skill and era splits, and especially the **Animus display change (between Mar 15 and Apr 4, 2023, inferred from echoes)**, the Animus movers (29 of 37; 11 of 31 toward more turn against the old display vs 4 toward less), the Dagger and Wizard display-change inference, and the Avenger 2019+ fade (2.62 on 8).
- The manufacturer page numbers (Latitude 64, MVP, Axiom, Prodigy, TSA read as raw page text; Discmania from its search/collection listings) and the quoted copy.
- **DGCR quotes** (Animus Jan 2021 and Jun 2022, Vanguard Mar 2026, Avenger/Vulture/Anax 2025, Essence 2020, Deflector 2018, Compass 2015): read from raw thread HTML, not summarized, but poster names for the Animus posts were not captured.
- Gateway's own Wizard note, which I have only as quoted in Disc Golf Puttheads' review (the Gateway site did not load).
- Search-engine summaries used as pointers only: the Marshall Street Wizard line and the Disc Golf Dojo details.

**Methodological findings (extend batches 14-17):**
- **DGCR is readable by `curl` with a browser user-agent** (HTTP 200, full thread HTML) even where the summarizing fetch sees 403. Worth using for the Grym, Raider, Diamond and Wraith-vs-Destroyer threads batches 16/17 listed as unreadable.
- **Display-change echoes are common, not rare:** Maverick (2023, batch 17), Resistor (~2020, batch 17), Animus (Apr 2023), Dagger (2018), Wizard (2018). **Date the exact-echo cluster before counting movers.** A display the page later left behind (Animus) is the case where the pooled average and the current manufacturer number disagree for a reason that has nothing to do with the disc.
- **A pool at the old display can look like "reviewers say more turn" when it is only the old number.** The Animus is the test: I kept the candidate because the movers (11 toward more turn vs 4 toward less against the old display) and the Wraith/Thunderbird description point the same way, not because the pool average is -0.80.
- **Rocket Discs' "Reviewer Flight Numbers" line equals the manufacturer numbers on nine of ten**, so it adds nothing beyond the manufacturer listing.

**Process notes for the next batch**

- **Next in `public/featured.js` order after Compass (re-verify the live file first):** **Charger (Innova, d9916b244290, line 172), Tempo (Axiom, f109ad3d9e10, line 174).** Thunderbird (line 173, batch 16) and Mamba (line 175, batch 3) are already reviewed. That is the end of the file: after those two the featured list is fully covered. Charger links to the Innova driver families (Teebird/Firebird/Boss, batches 4 and 16); Tempo links to Axiom's Envy/Pixel/Proxy line.
- **Retail-side hazard watch carried forward:** Prodigy renumbering (July 2023) including the X-series and, new this batch, the F3 turn (-1 → -2) and FX-3; Thought Space's Synapse renumbering and (new) the Animus display change; Omega's second catalog; Gateway mold revisions (the unnumbered "Wizard (revised)"); retail copies disagreeing on a discontinued or revised Kastaplast number (Grym); Infinite carrying a different turn from the manufacturer for a current disc (Maverick, batch 17); discontinued molds with no live manufacturer page (Avenger).
- **Open-candidate running list (nothing applied by this lane):** open: **Predator turn +1 → 0 (gated), D2 turn 0 → -0.5 (PARKED, owner decision Oct 3, 2026, not closed), D1 fade 4 → 3.5 (PARKED, owner decision Oct 3, 2026), Defy turn -1 → -0.5, Havoc turn -1 → -1.5, Grym turn -1 → -1.5 / -2, and new: Animus turn 0 → -0.5**; carried unchanged: MD3 (new) fade, Tesla turn -1 → -0.5, Fury fade 2 → 1.5, Quasar turn 0 → -0.5 (batch 12, held at 0); stay as-is: Monarch -4, Toro +1; pending in the main tree (this tree's overrides file has neither): Synapse turn -1, Astra turn -1.5; applied and present in this tree: Roc 2.5, Destroyer -0.5/3.5, Luna 3/4/0/2, Trident 3.5, Gator 4, Trespass -1. Soft watches: Falk turn, Svea turn, A1/A2 spacing, PA3 fade, Lots turn, Voodoo fade, PD2 fade, PD2/Enforcer, Stingray Star turn, Orion LF fade, Tantrum fade, Quasar fade 3 → 3.5, D3 and F3 reviewer-versus-printed gaps (F3 now with the renumbering explanation to check), Volt Neutron turn 2024-25, Saint turn, Nitro turn, Blade mold-revision hazard, Buzzz turn -1 → -0.5 (batch 16), batch 17's Raider fade, Fierce turn, Resistor high-power fade, Maverick fade, Grym X turn (linked), **plus this batch's Avenger fade**. **Catalog-identity flag still open:** FD1/FD2/Instinct (batch 11). **Catalog notes:** Omega (batch 14), Giant/Giant Reborn speed (batch 15), Eagle (new) unnumbered and Mako 3 glide (batch 16), X2/X4 and PA2 spacing flags, X3 glide 6 (Infinite 5) and the X-series apparently leaving Prodigy's catalog (batch 17), **new: Wizard (revised) unnumbered, Avenger not on Discraft's site, F5 speed/glide 8/6 vs Infinite 7/5, FX-3 numbers differ at Infinite.**
- **Linked sets re-checked this batch:** Animus/Wraith/Thunderbird/Omen/Coalesce; F3/F5/F7/F9/FX-3 and Leopard/Essence/Falk; Wizard/Challenger/Envy/Aviar/Judge/Macana/Dagger/Pixel/Nomad; Vanguard/Thunderbird/CD1/PD/Undertaker; Deflector/Justice/Gator/Resistor/Zone; Compass/Buzzz/Claymore/Hex/Mako3; Avenger/Anax/Vulture/Avenger SS. Nothing moves.
- **Reachable manufacturer paths this batch (all fetched as raw HTML):** `thoughtspaceathletics.com/pages/molds`, `latitude64.com/collections/{dagger,compass}`, `mvpdiscsports.com/discs/deflector/`, `prodigydisc.com/products/prodigy-f5-400-plastic`, `axiomdiscs.com/discs/pixel/` (the `/products/pixel` path 404s), `discmania.net/search?q=<mold>` (the `/products/<mold>` paths 404), `discraft.com/search?q=avenger` and `discraft.com/z-line-avenger-ss-zavengerss`. Unreachable: `gatewaydiscs.com` (connection fails), `archive.org/wayback` (429). Infinite slugs: `/thought-space-athletics-animus`, `/discmania-vanguard`, `/gateway-wizard`, `/prodigy-f5`, `/axiom-pixel`, `/mvp-deflector`, `/discraft-avenger`, `/discmania-essence`, `/latitude-64-dagger`, `/latitude-64-compass`; review lists via POST `/Disc/DiscComments` (`discmania-premier-essence` and `discmania-pd` return 302 and were not pulled).
- Suggested follow-up if you want a firmer layer: someone with Reddit/YouTube access reads TSA's statement on the Animus number change (or the Animus on r/discgolf), a skill-stratified post-2023 Animus sample (Aura/Ethereal), and any Gateway statement on the revised Wizard; the DGCR Grym/Raider/Diamond threads can now be read directly with the route above.

---

# Batch 19 (Plan 10, Phase 2) — final batch of featured.js

Researched October 3, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (it fast-forwarded in new bag/scene files from `main`; none touches the queue doc, which is still the only locally modified file).

## Disc list and order basis

**Basis: the two molds you named, which are the last two unreviewed entries in `public/featured.js` file order** (Charger line 172, Tempo line 174; Thunderbird line 173 was batch 16 and Mamba line 175 was batch 3). I re-read `public/featured.js` after the merge and fetched the live file (`https://disc-atlas-public.disc-atlas-explorer.workers.dev/featured.js`): **identical to the repo's**. A script check of the queue's entry headings against all 170 ids in `featured.js` found exactly two uncovered ids before this batch, Charger **d9916b244290** (Innova) and Tempo **f109ad3d9e10** (Axiom); with this batch **all 170 are covered**.

## Decided items and standing rules (recorded before the research)

- **Plastic baseline policy:** a mold's reference numbers are its most-thrown plastic (Star for Innova drivers); DX is the price-tier baseline but **not** the flight reference. No sales data; each entry names the reference plastic as "assumed."
- **Review gate:** weak evidence = no correction; |Δ| = 1.0 changes need the owner's call; record open candidates instead of proposing them.
- **Never average across plastics:** mold-level consensus plus a `plasticVariance` note; Infinite pools are coarse sanity checks beside per-plastic figures.
- **Raw-data and echo method (batches 17-18):** all Infinite figures are computed from the full `POST /Disc/DiscComments` list and split by year before any "mover" count. **DGCR method (batch 18):** threads read via `curl` with a browser user-agent, quotes taken from the raw page text.
- **Carried parked items (owner decisions, Oct 3, 2026):** D2 turn 0 → -0.5 and D1 fade 4 → 3.5 stay parked. Nothing here touches either.

---

## Batch 19 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| Charger | 13/5/-1/2 | none | Confirmed as-is (16 ratings, unanimous; young mold) | 0.65 |
| Tempo | 4/4/0/2.5 | none | Confirmed as-is (12 ratings; soft fade watch) | 0.6 |

**No changes proposed, no new open candidates, no too-thin-to-call verdicts.** One new soft watch (Tempo fade 2.5 → ~2.25, inside a half-step). Both molds are 2023 releases with 12-16 Infinite ratings, so both confirmations mean "no contradicting evidence found," backed by a manufacturer page that agrees and, for the Charger, a five-page DGCR launch thread.

**Diff against `flights.json` / manufacturers (done first):** both Atlas numbers equal the Marshall Street snapshot (`data.json` `flightSource` is Marshall Street for both), neither has an override (0 hits for either id in `verified-model-overrides.json`), and **both match the manufacturer's own page** (Innova's Charger page prints 13/5/-1/2; Axiom's Tempo page prints 4|4|0|2.5). **No Atlas lag, no retailer lag** (Infinite and Rocket print the same numbers). Neither Infinite display shows an era change: the Charger's 16 ratings and the Tempo's 12 all post-date release (Jan 2023 and mid-2023) and no number changed after release that I can see.

## Linked-set re-checks (the brief's watches)

**Raw Infinite pools (all plastics, mold level; my recompute from DiscComments; n = rated reviews):**

| Mold | Atlas (S/G/T/F) | Infinite mfr line | Raw turn / fade | n |
|---|---|---|---|---|
| Shryke | 13/6/-2/2 | 13/6/-2/2 | -2.02 / 1.94 | 195 |
| **Charger** | 13/5/-1/2 | 13/5/-1/2 | **-1.00 / 2.00** | 16 |
| Destroyer | 12/5/-0.5/3.5 (applied) | 12/5/-1/3 | -0.95 / 2.97 | 473 |
| Corvette | 14/6/-1/2 | 14/6/-1/2 | -1.17 / 2.02 | 80 |
| Pharaoh | 13/6/-1/2 | 13/6/-1/2 | -1.30 / 1.95 | 273 |
| Dominator | 13/5/-1/2 | 13/5/-1/2 | -0.80 / 2.24 | 25 |
| TeeDevil | 12/5/-1/2 | 12/5/-1/2 | -1.19 / 2.10 | 26 |
| Emperor | 12/5/-1/2.5 | 12/5/-1/2.5 | -1.02 / 2.47 | 209 |
| Boss | 13/5/-1/3 | 13/5/-1/3 | -0.61 / 2.97 | 200 |
| Raider | 13/5/-0.5/3 | 13/5/-0.5/3 | -0.64 / 2.84 | 77 |
| Wraith | 11/5/-1/3 | 11/5/-1/3 | -1.09 / 2.87 | 404 |
| Katana | 13/5/-3/3 | 13/5/-3/3 | -2.55 / 2.87 | 106 |
| Envy | 3/3/0/2 | 3/3/0/2 | -0.13 / 1.88 | 250 |
| Luna | 3/4/0/2 | 3/4/0/2 | -0.21 / 2.00 | 139 |
| A5 | 4/3/0/2 | 4/3/0/2 | -0.25 / 2.11 | 14 |
| **Tempo** | 4/4/0/2.5 | 4/4/0/2.5 | **-0.12 / 2.21** | 12 |
| Roc | 4/4/0/2.5 (applied) | 4/4/0/3 | -0.15 / 2.45 | 139 |
| Harp (Westside) | not read | 4/3/0/3 | -0.01 / 2.56 (2021+: 2.83) | 195 |
| Pyro | 5/4/0/2.5 | 5/4/0/2.5 | +0.01 / 2.82 | 73 |
| Zone | 4/3/0/3 | 4/3/0/3 | -0.02 / 2.98 | 374 |
| Entropy | 4/3/0/3 | 4/3/0/3 | 0.00 / 3.03 | 48 |

- **Charger / Destroyer / Shryke (the brief's Innova watch):** Innova describes the Charger as filling the gap between the two ("the consistency of the Destroyer with less fade … the big distance of the Shryke, but … better [in] the wind"). The Atlas order is Shryke -2/2 < Charger -1/2 < Destroyer -0.5/3.5 (applied override). The raw pools agree with the ordering and place the Charger **at the Destroyer's raw turn (-1.00 vs -0.95) and the Shryke's raw fade (2.00 vs 1.94)**. That is a small-sample reading (16 ratings) and is exactly what Innova's own sheet prints against the Destroyer (12/5/-1/3: same turn, a point less fade). The 0.5 turn spacing between Charger and Destroyer in the Atlas comes from the applied Destroyer override (raw -0.95); DGCR throwers who have thrown both say the Charger "turns a bit easier, and stays flat much longer before wanting to fade" (see entry), which is the same direction. Nothing moves; the applied Destroyer decision is not re-opened.
- **Charger's 13-speed neighbours:** Pharaoh, Corvette, TeeDevil and Dominator all sit on the Atlas's -1/2 and have raw pools of -0.80 to -1.30 / 1.95-2.24, around the Charger's -1.00/2.00. Boss and Raider (fade ~3) sit above on fade. Consistent.
- **Tempo / approach slot:** by fade the pools run Envy 1.88 < Luna 2.00 < A5 2.11 < **Tempo 2.21** < Roc 2.45 < Harp 2.56 < Pyro 2.82 < Zone 2.98 < Entropy 3.03. The Atlas has Envy/Luna/A5 at 2, Tempo/Roc/Pyro at 2.5, Zone/Entropy at 3. **The Tempo's raw fade sits level with the A5 (Atlas: a half-step apart) and 0.3 under the Atlas's 2.5.** The DGCR ordering (Envy < Tempo < Entropy/Zone) matches both layers. Thin (12 and 14 ratings); recorded as the soft watch below.

## Evidence limits — batch 19

Same tooling limits as earlier batches (Reddit blocked and not attempted, YouTube unreachable, Gateway not applicable here, Wayback not tried). Specific to this batch:

- **Both molds are young and thin:** Charger 16 rated Infinite reviews (12 from 2023), Tempo 12 (5 from the 2023 MVP Circuit Challenge, 5 from 2024, 2 from 2025). Neither has any professional-labelled rater, and the Tempo has no advanced rater. Skill splits are shown but too small to read as groups.
- **Printed versus raw** are within 0.1 on turn and fade for both (Charger printed 12.9/5.1/-1/2 vs raw 12.88/5.22/-1.00/2.00; Tempo 4/3.9/-0.1/2.3 vs 4.00/3.83/-0.12/2.21). The small pools are mostly the display plus a few movers: Charger 8 of 16 at exactly 13/5/-1/2, Tempo 3 of 12 at exactly 4/4/0/2.5.
- **Tempo prototype caveat:** the 2023 Circuit Challenge discs were pre-release prototypes handed out at events; a DGCR poster notes that MVP "sometimes changes the flight numbers due to the feedback" (his example: the Rhythm, 7/5/-3/1 during the Challenge, 7/5/-2/1 at release). The Tempo's 2023 raters refer to a "suggested 2.5," the number it carries now, so I see no change between the Challenge and release; but the 2023 ratings are from prototype-stage plastic (Neutron), so era and plastic are confounded.
- **DGCR was read directly** (Charger thread, five pages, Dec 2022-Oct 2024; Axiom Tempo thread, Jun 2023-Sep 2024): raw HTML text. Poster names are given where captured. Two other Tempo threads and the Bodanza video comparison (mentioned by a DGCR poster) were not readable/viewed and are not cited. Spot-check any quote before it goes into an override source note.
- **Rocket Discs** repeats the manufacturer numbers (Charger reviewer line 13/5/-1/2, Tempo 4/3.9/-0.1/2.4) and is not independent; Marshall Street is the Atlas baseline.
- **No outliers excluded.** The tails are in: Charger has one -2 turn (beginner, 13/6/-2/1.5, 2025), Tempo one -1 turn and one fade 1.

---

## Charger — Innova (id d9916b244290)

- **Atlas now:** 13/5/-1/2 (source: Marshall Street snapshot; PDGA approval 22-148, Sep 5, 2022; no override). **Proposed turn/fade:** none. Matches Innova's page. Reference plastic (assumed most-thrown): Star (11 of 16 Infinite ratings; Innova sells only Star and GStar stock, plus Halo and Champion runs).
- **Manufacturer:** Innova's Charger page (fetched; the page's flight-rating spans read 13 / 5 / -1 / 2): "The Charger is a straight-finishing, 13-speed driver that can be thrown at full power without worrying about the disc flipping over. The Charger fills a gap between the Destroyer and the Shryke. For players looking for the consistency of the Destroyer with less fade, try the Charger. For those looking for the big distance of the Shryke, but in a disc that can better handle the wind, try the Charger." "Best choice for: Max Distance, Moderate Wind, Straight Finish." Infinite adds (verbatim): "a stable, torque-resistant 13-speed driver for players looking for the consistency of the Destroyer but with less fade," and Nate Sexton's "nice balance of gentle flip and fade." **Mild copy-versus-number tension:** "straight-finishing" and "without worrying about the disc flipping over" read stable, while -1/2 is the same turn/fade as a Corvette; a DGCR poster asked the same thing at launch ("Straight finishing? Why the 2 fade?"). Not a numeric contradiction.
- **Retailer:** Infinite label "Stable"; mfr line 13/5/-1/2; reviewer numbers 12.9/5.1/-1/2 (16 reviews, 4.72 stars). Rocket 13/5/-1/2. Marshall Street is the Atlas baseline.
- **Community (Infinite raw, all 16 rated, 2023-2025; computed):** mean 12.88/5.22/**-1.00/2.00**, median -1/2. Turn: -2 (1), **-1 (13)**, -0.5 (2). Fade: 1.5 (2), **2 (12)**, 2.5 (2). Eight of 16 are exactly 13/5/-1/2. The display has been 13/5/-1/2 since release, so the echo is the whole-life display; the movers are 1 toward more turn, 2 toward less, and 2 below / 2 above on fade (balanced). **By skill:** beginner 7 -1.07/1.93; intermediate 5 -1.00/2.10; advanced 4 -0.88/2.00 (no professional). **By year:** 2023 (12) -0.96/2.04; 2024 (2) -0.75/2.00; 2025 (2) -1.50/1.75. Text: "feels more like a Destroyer than a 13 speed … surprisingly [good] in a head wind … a slight Destroyer-like fade at the end" (intermediate, 2023); "the perfect mix between a Destroyer and a Shryke … if you cannot throw a Destroyer far, but a Shryke is too flippy" (beginner, 2023); "flights like a beat-in Destroyer … flip up, get a beautiful S-shape, and solidly finish to the right; thrown on an anhyzer it fights to flat" (advanced, four Chargers, 2023); "more stable than I was expecting" (advanced, a Destroyer-and-Shryke thrower, 2023); "more overstable than a Halo Shryke while still being throwable for people in the 350-400 range" (intermediate, 2023); "felt like a new Star Wraith but with less fade … rode straight but gently faded" (advanced, at 5,600-6,300 ft elevation, 2023); "behaves more like an 11 … even lower power throwers can use" (intermediate, ~300 ft, 2023); "very similar to the Infinite Discs Pharaoh" (advanced, 2023); "closer to a Destroyer than the Shryke" (intermediate, GStar, 2023, rated 13/5/-1/2.5); "between a Shryke and a Destroyer … more destroyer and less shryke for me" (intermediate, GStar, 350 ft, 2024); "most of the time it wants to flip when I try to go all out" (beginner, Star, 375 ft, 2025).
- **DGCR "Innova Charger 13/5/-1/2" (five pages, read directly):** @CD- (Dec 30, 2022): the mold was approved as the "Pterosaur," and the PDGA approval photo shows "12/6/-1/2." A poster ODRB (quoted on p.4, Feb 2023): "the rim feels a lot more Destroyer than Shryke, the high speed drift is more Shryke than Destroyer, the late fade is more Destroyer than Shryke. It's got similar out-of-the-box stability to my middle workhorse Destroyer. With about 25 extra feet." Twmccoy (Nov 13, 2023, after about 100 Destroyers): "It's a hair faster, turns a bit easier, and stays flat much longer before wanting to fade. The only time I'd reach for a Destroyer over the Charger is in windy situations"; (Dec 6, 2023, 168 g Star): "does really well flat or with a very slight hyzer release. It'll pop up and stay flat for a good long while before fading … I'd choose a Destroyer … when pure accuracy is necessary"; (Oct 26, 2024, 166 g Star): "fairly easy high speed turn, but it's resistant to flipping entirely over … a really late, subtle fade." kevdiv48 (Nov 2023): "a tick up in stability from the Shryke. You can rip it flat to anny and it won't burn into the ground." chevis (Dec 2023): his proto/first run "beat into a super straight flyer," the production Stars "less stable than that one," a Halo "more stable & so it doesn't fly as far." Read together: the Charger is a Destroyer-stability disc with less fade amount and easier turn, which is the Atlas's -1/2 against the Destroyer's -0.5/3.5.
- sources:
  - {name: Innova Charger page (13|5|-1|2; copy), url: https://www.innovadiscs.com/disc/charger/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Charger (mfr 13/5/-1/2; reviewers 12.9/5.1/-1/2; 16 reviews; raw list via DiscComments; Innova copy), url: https://infinitediscs.com/innova-charger, type: retailer, weight: 0.4}
  - {name: Infinite reviewer text, 16 raw rated reviews (skill, plastic, date, distance labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.3}
  - {name: DGCR "[Innova] Innova Charger 13/5/-1/2" (5 pages; read directly), url: https://www.dgcoursereview.com/threads/innova-charger-13-5-1-2.148822/, type: community, weight: 0.35}
  - {name: Rocket Discs Charger (13/5/-1/2), url: https://rocketdiscs.com/innova-charger, type: retailer, weight: 0.1}
- **confidence:** 0.65
- **consensusNote:** Innova's page, Infinite, Rocket, 16 raw ratings (-1.00/2.00, movers balanced) and the DGCR throwers who have handled Destroyers and Shrykes agree on a disc with the Destroyer's stability and a smaller, later fade, sitting a tick above the Shryke. Nothing contradicts it; the sample is small and young, so this is "no contradicting evidence" with a consistent direction.
- **plasticVariance:** Star -1.05/1.91 (11); GStar -1.00/2.25 (2); Signature Halo Star -1.00/2.25 (2); Halo Star one rating (-0.5/2.0). Reviewers and DGCR posters say lighter Stars (under 168 g) are domey and flip more and heavier ones are flatter and more stable, that Halo runs are stiffer and more stable, and that the earliest runs beat in flatter. Innova prints one set. Do not average.
- **Linked:** Destroyer (12/5/-0.5/3.5, applied; Innova 12/5/-1/3), Shryke (13/6/-2/2), Corvette (14/6/-1/2), Pharaoh (13/6/-1/2), Dominator (13/5/-1/2), TeeDevil, Emperor, Boss, Wraith, Katana. Set re-checked above; nothing moves.

## Tempo — Axiom (id f109ad3d9e10)

- **Atlas now:** 4/4/0/2.5 (source: Marshall Street snapshot; PDGA approval 23-23, Jan 30, 2023; no override). **Proposed turn/fade:** none. Matches Axiom's page. Reference plastic: **no clear most-thrown plastic** (assumed Neutron by count, 6 of 12 Infinite ratings, all from the 2023 Circuit Challenge; Proton Soft, 5 ratings, is the stock-run plastic).
- **Manufacturer:** Axiom's Tempo page (fetched): **4 | 4 | 0 | 2.5, labelled "Neutral"**. Copy: "Releasing with flight numbers of 4 | 4 | 0 | 2.5, the Tempo excels as an overstable putt and approach disc thanks to its low profile and flat flight plate. Power throwers may find a small amount of turn before the torque resistance and reliable fade kick in for its forward pushing finish, while lower power throwers will find a straight-to-overstable thrower good for windy days and consistent approach angles." **Label tension, maker side:** Axiom's own "Neutral" tag against its own copy "overstable" (the same "Neutral" tag sits on the 0/0.5 Pixel, so it appears to be a class-relative label). Numbers and copy agree.
- **Retailer:** Infinite label "Overstable"; mfr line 4/4/0/2.5; reviewer numbers 4/3.9/-0.1/2.3 (12 reviews, 4.63 stars). Infinite's description (verbatim): "one of the discs released for the 2023 MVP Circuit event … a low-profile approach putter that, while not overwhelmingly stable, can handle backhand and forehand drives without flipping over. It can handle torque well." Rocket 4/4/0/2.5 (reviewer line 4/3.9/-0.1/2.4).
- **Community (Infinite raw, all 12 rated, 2023-2025; computed):** mean 4.00/3.83/**-0.12/2.21**, median 0/2.5. Turn: **0 (10)**, -0.5 (1), -1 (1). Fade: 1 (1), 1.5 (1), 2 (3), **2.5 (6)**, 3 (1). Movers against fade 2.5: 5 below, 1 above. **By year:** 2023 Circuit Challenge (5) -0.20/**2.00**; 2024 (5) 0.00/**2.40**; 2025 (2) -0.25/2.25. **By skill:** intermediate 7 -0.07/2.07; beginner 5 -0.20/2.40; no advanced or professional rater. Text: "definitely feels like a Zone" (beginner, 2023); "the fade was not as much as I expected (given the suggested 2.5) and would rate it in the 1.5 to 2 range … no high-speed turn" (beginner, ~300 ft, 2023, rated 4/4.5/0/1.5); "much less overstable than the numbers suggest … I was expecting it to fly similarly to my Zone" (intermediate, 2023, rated 4/4/0/1); "not as stable as a brand new pig or zone but still stable enough to handle full powered shots" (beginner, 2023, rated -1/2.5); "not too over stable, maybe a 2 fade. The fade is late in the flight" (intermediate, 2023); 2024-2025: "it flies like a slower, beefier Envy" (intermediate, 225 ft), "while it is overstable, it's most certainly not exactly a zone type disc. For slower arm speeds it'll be like a zone, but for higher arm speeds it's a straighter flier" (intermediate, 250 ft), "I would say it's less overstable than a Pyro" (intermediate, 250 ft), "stable to OS but not beefy … not as OS as most premium plastic Zones … pronounced but still forward-penetrating fade" (intermediate, Proton Soft, 225 ft, 2025).
- **DGCR "Axiom Tempo" (Jun 2023-Sep 2024, read directly):** gwsmallwood (Jun 26, 2023, from videos): "somewhere between the Envy and the Entropy. Closer to a Zone in feel and flight, but maybe not quite as stable." Blackburn (Jul 3, 2023, thrown): "no where near [a Deflector's] overstable … more overstable than a premium Envy but less stable than an Entropy." Keith H (Sep 16, 2024, OTB Open Proton Tempo): "more fade than an Envy, but not nearly as much as the Harp or Anchor … Proxy / Envy distance." lee76007 (Sep 17, 2024): "from day 1 I've found it to be stable with a tad of fade, and reliable." Another poster: "similar [to a Kastaplast Jarn], but pushes more forward." A reply thread mentions a Bodanza video saying the Prodigy A5 "feels/flies very similar to the Tempo" (video not watched; hearsay).
- **Soft watch, not a candidate (new):** fade reads **2.21 raw** (5 of 12 below 2.5, one above; the 2023 prototype-stage ratings 2.00, the 2024+ ratings 2.4) against the Atlas's 2.5; the gap is 0.3 inside a half-step, with no advanced raters, no arm speeds and era/plastic confounded. DGCR throwers who have thrown it describe a disc between the Envy (Atlas 2) and the Entropy/Zone (Atlas 3), consistent with 2.5. Becomes a candidate only if a larger or skill-stratified sample reads 2.0-2.25.
- sources:
  - {name: Axiom Tempo product page (4|4|0|2.5, Neutral; copy), url: https://axiomdiscs.com/discs/tempo/, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs Tempo (mfr 4/4/0/2.5; reviewers 4/3.9/-0.1/2.3; 12 reviews; raw list via DiscComments), url: https://infinitediscs.com/axiom-tempo, type: retailer, weight: 0.4}
  - {name: Infinite reviewer text, 12 raw rated reviews (skill, plastic, date, distance labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.25}
  - {name: DGCR "[Axiom] Axiom Tempo" (3 pages; read directly), url: https://www.dgcoursereview.com/threads/axiom-tempo.149545/, type: community, weight: 0.25}
  - {name: Rocket Discs Tempo (4/4/0/2.5), url: https://rocketdiscs.com/axiom-tempo, type: retailer, weight: 0.1}
- **confidence:** 0.6
- **consensusNote:** Axiom's page, Infinite, Rocket and the Atlas all say 4/4/0/2.5; the reviewers put the disc between the Envy and the Zone/Entropy, which the Atlas has it; the raw fade (2.21) is a third of a point under the printed number, with the 2024+ ratings at 2.4. Nothing supports moving the Atlas.
- **plasticVariance:** Neutron -0.17/2.08 (6, all 2023 Circuit Challenge); Proton Soft 0.00/2.40 (5, 2024-2025); Particle Glow Proton one rating (-0.5/2.0). A DGCR poster found the Proton "board flat" and "shallow," and another the Proton Soft grippy in rain; no one reports a plastic-driven flight difference. Axiom prints one set. Do not average.
- **Linked:** Envy (3/3/0/2), Zone (4/3/0/3), Entropy (4/3/0/3), Roc (4/4/0/2.5, applied), Pyro (5/4/0/2.5), A5 (4/3/0/2), Luna, Harp, Pixel. Set re-checked above; nothing moves.

## Batch 19 report (for Freddy)

**Decided items recorded first:** the standing rules and the batch 17-18 echo and DGCR methods, with D2 turn and D1 fade carried parked (owner decisions, Oct 3, 2026). Nothing here touches either.

**Disc list and basis:** Charger and Tempo, the last two unreviewed entries in `public/featured.js` file order (verified against the live file). After this batch every one of the 170 ids in `featured.js` has a queue entry (script check).

**Proposed changes (0).** Both Atlas turn/fade numbers equal the manufacturer's page, the retailer layers, and the raw ratings within a half-step.

**Confirmed as-is (2):** Charger (0.65), Tempo (0.6). Confirmations mean "no contradicting evidence found," not independent community verification; both molds have 12-16 Infinite ratings and none from an advanced-labelled Tempo rater.

**Too thin to call (0).** The Tempo is the thinnest (12 ratings), but Axiom's page, the retailers and four DGCR throwers all place it between the Envy and the Zone/Entropy, and nothing contradicts the Atlas.

**New open candidates (0).** **New soft watch (1):** Tempo fade 2.5 → ~2.25 (raw 2.21; 2023 prototype-stage 2.0, 2024+ 2.4; inside a half-step).

**Flags on molds outside the two (nothing proposed):** none new. The Charger's pool again shows the Destroyer's raw turn (-0.95 on 473) one half-step more turn than the applied -0.5 (owner-decided in batch 16, not re-opened); the Roc's printed 3 versus applied 2.5 and the Gator's printed 3 versus applied 4 are the same kind of applied-override difference.

**Retailer-lag findings:** none. Infinite, Rocket, the manufacturers and the Atlas agree on both molds. Axiom's "Neutral" label against its own "overstable" copy is a label-only inconsistency (the Pixel carries the same tag).

**Spot-checks needed before any override source note:**
- All Infinite review quotes and tallies (computed from the DiscComments JSON, snapshotted only in my scratch space; rerun to reproduce), especially the Tempo year split (2023 Circuit Challenge 2.00 vs 2024 2.40).
- The Innova and Axiom page numbers (read as raw page text) and the quoted copy.
- DGCR quotes (the Charger launch thread, pp.2-5, and the Axiom Tempo thread): read from raw thread HTML; the ODRB comparison appears only as quoted by a replier on p.4. The Bodanza video claim about the A5 is hearsay.
- The "Pterosaur / 12-6-1-2" PDGA-photo remark (one DGCR poster, not verified against the PDGA record).

**Process notes:** nothing further to review in `featured.js`. Reachable manufacturer paths this batch (fetched as raw HTML): `www.innovadiscs.com/disc/charger/`, `axiomdiscs.com/discs/tempo/`. Infinite slugs `/innova-charger`, `/axiom-tempo`; review lists via POST `/Disc/DiscComments`. DGCR threads: `/threads/innova-charger-13-5-1-2.148822/` (pp.1-5), `/threads/axiom-tempo.149545/` (pp.1-2; two newer "Tempo Discussion" threads returned no readable post text).

## File complete — summary of the 19-batch run

- **Coverage:** the pilot (10 molds, "batch 1") plus batches 2-19. The queue now has 182 entry headings covering **178 distinct Atlas mold ids** (some molds appear twice as batch 16 re-checks; a few non-featured molds were reviewed as links), and **all 170 ids in `public/featured.js` are covered** (script check against the entry headings; the live file is identical to the repo's).
- **Outcome:** almost everything was confirmed as-is. Per the running list, **six corrections have been applied in this tree** (Roc fade 2.5, Destroyer -0.5/3.5, Luna 3/4/0/2, Trident 3.5, Gator 4, Trespass -1) and **two are pending in the main tree** (Synapse turn -1, Astra turn -1.5). The rest were "confirmed as-is" or "too thin to call" (roughly 23 too-thin verdicts by my count of the at-a-glance tables, most later reinforced by raw data). Nothing was ever applied by the research lane itself: every change was queued for Freddy.
- **Open candidates still on the list (none applied):** Predator turn +1 → 0 (gated), D2 turn 0 → -0.5 (PARKED), D1 fade 4 → 3.5 (PARKED), Defy turn -1 → -0.5, Havoc turn -1 → -1.5, Grym turn -1 → -1.5 / -2, Animus turn 0 → -0.5; carried unchanged: MD3 (new) fade, Tesla turn -1 → -0.5, Fury fade 2 → 1.5, Quasar turn 0 → -0.5 (held at 0); stay as-is: Monarch -4, Toro +1. The full soft-watch list and the catalog-identity/catalog-note flags are in the batch 18 report's running list, plus this batch's Tempo fade watch.
- **How the method changed over the run (the lessons worth keeping):** (1) Infinite's printed "reviewer numbers" are shrunk toward the displayed numbers, so compute from raw ratings; (2) raw ratings echo whatever Infinite displayed when the reviewer rated, so date the echo cluster before counting movers (Maverick, Resistor, Animus, Dagger, Wizard all changed display); (3) the full Infinite list is readable via the page's own `POST /Disc/DiscComments`; (4) DGCR threads are readable with `curl` and a browser user-agent; (5) retailers can lag or lead the manufacturer in either direction (Luna/Gator lagged; Infinite's Maverick turn, Prodigy's 2023 renumbering, Infinite's F5 speed/glide); (6) never average across plastics; weak evidence yields watches and candidates, not proposals.
- **What this file cannot settle:** Reddit and YouTube were never reachable, Gateway's site never connected, Wayback was rate-limited, and no source states arm speed for most raters. Every "confirmed" verdict is therefore "no contradicting evidence found" with the evidence level noted per entry; the open candidates above are where more independent evidence would change a number.

---

# Batch 20 (Plan 10, Phase 2) — mop-up of the outside flags

Researched October 3, 2026. **Every entry below is "needs Freddy's review." Nothing has been applied** — `source-data/verified-model-overrides.json` and all map code are untouched. Nothing committed or pushed. `git merge main` was run first (already up to date; the queue doc is still the only locally modified file).

## Disc list and order basis

**Basis: the six outside flags you named, in the order you gave them**, each carried from an earlier batch without a full entry: **Grym X** a9c5133f6a9d (Kastaplast; batch 16/17 link, raw turn -0.91 on 17 against 0 displayed), **X2** a84c59765970 (Prodigy; batch 17, Atlas fade 2 against Infinite reviewers 3.7), **PA2** 1c1867547647 and **PA3** 99fb23ea773e (Prodigy; batch 17 pools about 0.1 apart on fade against a full point in the Atlas; PA3 was batch 8), **F3** 609fb4e2670b (Prodigy; batch 18, raw pool -1.06 against Prodigy's -2) and **FX-3** 7c8e25d36c6a (Prodigy; batch 18, Infinite and Prodigy differ). The Atlas also holds an unrelated Discraft "X2" (98-03); it is not the mold reviewed here.

## Decided items and standing rules (recorded before the research)

- **Plastic baseline policy:** a mold's reference numbers are its most-thrown plastic; DX is the price-tier baseline but **not** the flight reference. No sales data; each entry names the reference plastic as "assumed" (for Prodigy, 400, which Prodigy's own pages call "the most popular Prodigy plastic across the entire lineup"; for the Grym X, K1 Line).
- **Review gate:** weak evidence = no correction; |Δ| = 1.0 changes need the owner's call; record open candidates instead of proposing them.
- **Never average across plastics:** mold-level consensus plus a `plasticVariance` note; Infinite pools are coarse sanity checks.
- **Raw-data and echo method:** all Infinite figures are computed from the full `POST /Disc/DiscComments` list and split by year; **DGCR** read via `curl` with a browser user-agent.
- **Grym:** the owner-approved Grym turn -1 → -2 override (Oct 3, 2026) is present in this tree (the Atlas Grym is 13/5/-2/2). Nothing here re-opens it.
- **Carried parked items (owner decisions, Oct 3, 2026):** D2 turn 0 → -0.5 and D1 fade 4 → 3.5 stay parked. The renumbering sweep below touches the D2's reviewer pattern only as an observation.

---

## Batch 20 result at a glance

| Mold | Atlas now (S/G/T/F) | Proposal | Verdict | Confidence |
|---|---|---|---|---|
| FX-3 | 9/5/-1/2 | none | Confirmed as-is (arbitrated for Prodigy: all four raters who left Infinite's -1.5 landed exactly on -1) | 0.7 |
| PA3 | 3/3/0/1 | none | Confirmed as-is (batch 17 flag resolved; batch 8 fade soft watch strengthened) | 0.6 |
| PA2 | 3/3/0/2 | none | Confirmed as-is (batch 17 flag resolved; Infinite's old display was fade 1, free raters average 2.0) | 0.55 |
| Grym X | 12.5/5/0/3 | none | Confirmed as-is **with an open candidate: turn 0 → -0.5 (\|Δ\| 0.5), recorded, not proposed** | 0.5 |
| F3 | 8/5/-2/2 | none | Too thin to call (Atlas follows Prodigy's retested -2; the reviewer layer is a stale echo of -1) | 0.45 |
| X2 | 12/5/0/2 | none | Too thin to call **with an open candidate: fade 2 → 3 (\|Δ\| 1.0, the owner's call), recorded, not proposed** | 0.4 |

**No changes proposed. Two new open candidates (Grym X turn, X2 fade), two too-thin verdicts (F3, X2), four flags closed (FX-3, PA2, PA3 explained as display artifacts; F3 explained as a stale echo).**

**Diff against `flights.json` / manufacturers (done first):** the five Prodigy Atlas numbers equal the Marshall Street snapshot (`data.json` `flightSource` is Marshall Street) and the Grym X's equals Infinite's manufacturer line (its `flightSource` is Infinite Discs); none has an override (0 hits in `verified-model-overrides.json`), and the five Prodigy molds **equal Prodigy's own current pages** (X2 12|5|0|2 on the 400 and 500 product pages; F3 8|5|-2|2; FX-3 9|5|-1|2; PA-2 3|3|0|2 and PA-3 3|3|0|1 in Prodigy's nav list). The Grym X's manufacturer page could not be read. **The "lag" in all five Prodigy cases is retailer-side, not Atlas-side** (Infinite, Rocket and the Infinite-derived pools carry Prodigy's pre-2023 numbers). One catalog oddity: `flights.json` has two rows with the same id for X2/X3 (one has `name_slug: "x3"`) both carrying 12/5/0/2; the Atlas's X3 (12/6/-1/2) and X2 (12/5/0/2) are each correct against Prodigy's pages, so it has no stability effect.

## The 2023 Prodigy renumbering, as a set (the brief's F3 / FX-3 / X2 / PA2 question)

**Primary source found:** Prodigy's own blog post "The Stock Stamp Reenvisioned" (**April 19, 2023**, fetched directly): "The new stock stamp will also feature updated Prodigy Disc flight numbers for many molds. With changes to production methods, plastic blends, and other factors, Seppo Paju spearheaded an in-depth review of the listed characteristics of the Prodigy Disc lineup and these new flight numbers will be featured on discs for the first time as production discs receive the new stock stamp." (First discs shipped with it: PA-3 in 300, PA-5 in 300 and 300 Soft, A3 in 750.) **This puts the renumbering at April 2023, not July as earlier batches wrote**, and says Prodigy re-tested rather than merely re-labelled. (A search summary of a second Prodigy page adds that Seppo "personally retested the full lineup" and moved the F-series from speed 7 to 8; that detail is a summary and needs a spot-check.)

**Test of whether the new numbers show up in what reviewers do:** for each renumbered mold I compared Infinite's current manufacturer line (the old Prodigy number, which is also what raters' sliders echo) with Prodigy's new number, and counted raters who left the old display: how many landed exactly on the new number, how many moved toward it, how many away (computed over all years of raw ratings):

| Mold, field | Old (Infinite) → new (Prodigy) | Raters on old / exactly on new | Moved toward new / away |
|---|---|---|---|
| FX-3 turn | -1.5 → -1 | 7 / 4 | 4 / 0 |
| X4 turn | -2.5 → -2 | 5 / 6 | 7 / 0 |
| PA-2 fade | 1 → 2 | 18 / 3 | 6 / 0 |
| F2 fade | 3 → 2 | 12 / 4 | 8 / 0 |
| MX-3 fade | 2 → 1 | 16 / 3 | 8 / 0 |
| M3 turn | -1 → 0 | 25 / 4 | 5 / 0 |
| M3 fade | 2 → 1 | 25 / 1 | 4 / 1 |
| D3 fade | 2 → 3 | 34 / 6 | 9 / 1 |
| D3 turn | -2 → -1 | 30 / 4 | 8 / 6 |
| X2 fade | 4 → 2 | 10 / **0** | 7 / 1 |
| F3 turn | -1 → -2 | 26 / **1** | 4 / 2 |
| PA-1 fade | 2 → 2.5 | 31 / 2 | 3 / 1 |
| FX-2 turn | -0.5 → 0 | 5 / 14 | 15 / 10 |
| D2 turn | -0.5 → 0 | 11 / 2 | 3 / **51** |

**Reading:** for most renumbered fields the raters who moved off the old display moved toward Prodigy's new number (often landing on it), so the retest mostly tracks what reviewers see. **The exceptions are the ones that matter here:** the X2's seven movers went to 3 and 3.5, **none to 2**; the F3's four movers went to -1.5, -1.5, -2 and -2.5, **one to exactly -2**; the D2 (parked, not touched) shows reviewers moving the other way. **The old display anchors every one of these, so the table says who moved and in which direction, not what the true number is.**

## Evidence limits — batch 20

Same tooling limits as earlier batches (Reddit blocked and not attempted, YouTube unreachable, Gateway not relevant, Wayback not tried). Specific to this batch:

- **Kastaplast's Grym X page was not readable** (`/en-us/products/k1-grym-x` and `/products/k1-grym-x` return 404; the site's per-disc pages for the Grym family are gone). The Grym X manufacturer layer is Kastaplast's 2016 launch copy as quoted on a DGCR thread and by retailers, plus retailer listings.
- **Prodigy's X-series is out of its nav list but its product pages still load** (X2 400 and 500, X3 200 stamp, X4 400), each with current numbers; the 400 pages show "Sold out." I could not tell whether the X-series is in production.
- **Old displays anchor the Infinite data on all six.** The latest X2 rating is from 2021; Prodigy's April 2023 numbers have not been "rated against" by any X2 reviewer. For the F3, FX-3, PA2 and PA3 the ratings after April 2023 still echo Infinite's old line (Infinite has not updated the F3 or FX-3 lines; its PA-2 line now prints fade 2 but raters from 2015 to Oct 2025 echo fade 1).
- **The Grym X page does not echo its own display** (speed from 5 to 13 and glide 4 to 5 across 17 ratings; a K1 Soft rating of 5/4/-1/2), so its turn/fade ratings are freer than most; they are also mixed across K1 Line, K1 Soft and K1 Glow.
- **Printed versus raw** are within 0.1 on large pools (PA3 printed 3/3.7/0/1.1 vs raw 3.02/3.83/-0.02/1.15) and shrink toward the display on small ones (Grym X printed -0.4 vs raw -0.91 on 17).
- **No outliers excluded.** Grym X has one +2 turn and one -3.5; X2 one fade 5.

---

## FX-3 — Prodigy (id 7c8e25d36c6a)

- **Atlas now:** 9/5/-1/2 (source: Marshall Street snapshot; PDGA approval 21-124, Nov 9, 2021; no override). **Proposed turn/fade:** none. Matches Prodigy's current page. Reference plastic (assumed most-thrown): 400 (10 of 11 Infinite ratings).
- **Manufacturer:** Prodigy's FX-3 400 page and nav list (fetched): **9 | 5 | -1 | 2, "Stable"**. Copy: "a fast, stable fairway driver. It has a slightly wider rim than traditional fairway discs, which couples with a noticeable glide … Its stable flight out of the hand gives players at different levels and arm speeds to execute different shot shapes. It will hold its angle for a long period before having a reliable finish on the end." Copy and numbers agree.
- **Retailer (the arbitration):** **Infinite prints 9/4/-1.5/2** (label "Stable"; reviewer numbers 9/4.2/-1.4/1.9; 11 reviews, 4.91 stars); **Rocket prints 9/4/-1.5/2**; Prodigy and Marshall Street (the Atlas) print 9/5/-1/2. Prodigy's April 2023 re-test (above) is the difference; the Infinite and Rocket lines are the pre-2023 numbers (the FX-3 is a 2021 release). The glide differs too (4 against 5); out of scope.
- **Community (Infinite raw, all 11 rated, 2022-2025; computed):** mean 9.00/4.45/**-1.32/1.86**, median -1.5/2. Turn: -1.5 (7), **-1 (4)**; no rating more understable than the old display and none less stable than -1. Fade: 2 (9), 1.5 (1), 1 (1). **The four raters who left the old -1.5 all landed exactly on -1** (Jul 2022, Aug 2023, Sep 2024, Oct 2025), i.e. Prodigy's new number, and every rating shares the old display's fade of 2. **By skill:** intermediate 8 -1.25/1.81; advanced 2 -1.50/2.00; professional 1 -1.50/2.00 (the three advanced/professional raters all echo -1.5). Text: "beat-in Thunderbird-type disc. It'll turn but it is still very controllable" (intermediate, 2022), "more glide and stability than the numbers give it credit for" (2022), "taken over my Teebird slot … stable, workable, do-it-all" (advanced, 2022), "one of the straightest discs I've ever thrown" (professional, 500, 2022), "a decent amount of [stability]" (2024). On Prodigy's own site (11 reviews, undated): "Flight numbers are pretty true. Hyzer flip to flat at about 120-150, starts to fade back at ~250" and "fairly understable when thrown with over 425 feet of power - will turn more than -1."
- sources:
  - {name: Prodigy FX-3 400 plastic page and nav list (9|5|-1|2, Stable; copy; own reviews), url: https://prodigydisc.com/products/prodigy-fx-3-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Prodigy blog, "The Stock Stamp Reenvisioned" (Apr 19, 2023; updated flight numbers after Seppo Paju's review), url: https://prodigydisc.com/blogs/news/prodigy-disc-releases-reenvisioned-stock-stamp, type: manufacturer, weight: 0.6}
  - {name: Infinite Discs FX-3 (mfr 9/4/-1.5/2; reviewers 9/4.2/-1.4/1.9; 11 reviews; raw list via DiscComments), url: https://infinitediscs.com/prodigy-fx-3, type: retailer, weight: 0.3}
  - {name: Infinite reviewer text, 11 raw rated reviews, url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.3}
  - {name: Rocket Discs FX-3 (9/4/-1.5/2; old numbers), url: https://rocketdiscs.com/prodigy-fx-3, type: retailer, weight: 0.05}
- **confidence:** 0.7
- **consensusNote:** Prodigy's current page is the post-re-test number, the Atlas equals it, and the only reviewer movement off Infinite's stale -1.5 is four ratings at exactly -1. Nothing contradicts it; the sample is 11 ratings with three advanced/professional raters, so this is "no contradicting evidence" with a consistent direction.
- **plasticVariance:** 400 -1.30/1.85 (10); 500 -1.5/2.0 (1). Prodigy prints one set. Do not average.
- **Linked:** F3, FX-2 (9/4/0/3; Infinite 9/4/-0.5/3, pool -0.40/3.13 on 30, movers split 15 toward 0 / 10 away), FX-4 (9/5/-2/2; Infinite 9/5/-2/1, 3 ratings), F5 (batch 18), F7. Set re-checked above; nothing moves.

## PA3 — Prodigy (id 99fb23ea773e)

- **Atlas now:** 3/3/0/1 (source: Marshall Street snapshot; PDGA approval 14-30, Mar 25, 2014; no override). **Proposed turn/fade:** none. Matches Prodigy's current page. Reference plastic (assumed most-thrown): 300 (35 of 87 Infinite ratings; 350G 19, 300 Soft 7); Prodigy's PA-3 was one of the first discs to ship with the April 2023 stamp.
- **Manufacturer:** Prodigy's nav list and (batch 8) the PA-3 product pages: **3 | 3 | 0 | 1, "Stable"**; copy "laser straight, stable flight path … a beaded rim." Unchanged by the renumbering (Prodigy's April 2023 first-ship list includes this disc, with the same 3/3/0/1 as before). Infinite (verbatim): "described as 'the straightest flying' Prodigy putter."
- **Retailer:** Infinite mfr line 3/3/0/1 (label "Stable"); reviewer numbers 3/3.7/0/1.1 (90 reviews, 4.73 stars). Rocket and Marshall Street print 3/3/0/1 (batch 8).
- **Community (Infinite raw, 87 rated of 90, 2016-2025; computed):** mean 3.02/3.83/-0.02/**1.15**, median 0/1. Turn 0 on 84, -0.5 (2), -1 (1). Fade: **1 (69)**, 1.5 (8), 2 (8), 2.5 (1), 0.5 (1). **Echo reading:** the display has been fade 1 throughout, so 69 of 87 echo it; of the **18 raters who left it, 17 moved up and 1 down**, averaging **1.72**. **By skill:** intermediate 44 1.16; advanced 25 1.08; beginner 10 1.10; professional 8 **1.38** (the advanced raters echo most). **By year:** 2018 (10) 1.45; every other year 1.04-1.50. Text (batch 8, unchanged): Chris Bawden (Disc Golf Puttheads) "a straight putter with a strong fade"; Disc Golf Reviewer "faded harder than I expected"; the Infinite 400 reviewers "very straight with just the slightest finish."
- **Soft watch (strengthened, not a candidate):** fade reads 1.15 raw but the free raters (18) go up in a 17:1 ratio and average 1.72; Prodigy's own re-test prints 1. A half-step candidate (fade 1 → 1.5, |Δ| 0.5, ungated) would be defensible if a firmer layer (a dated Prodigy statement or a post-2023 skill-stratified sample) agreed; the raw mean sits only 0.15 above the number, 79% echo it, and no arm speeds are stated.
- sources:
  - {name: Prodigy nav list (PA-3 3|3|0|1) and PA-3 pages (batch 8), url: https://prodigydisc.com/products/prodigy-pa3-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Infinite Discs PA-3 (mfr 3/3/0/1; reviewers 3/3.7/0/1.1; 90 reviews; raw list via DiscComments), url: https://infinitediscs.com/prodigy-pa-3, type: retailer, weight: 0.5}
  - {name: Infinite reviewer text, 87 raw rated reviews (skill, plastic, date labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.4}
  - {name: Disc Golf Puttheads PA3 review (Chris Bawden; batch 8), url: https://www.dgputtheads.com/prodigy-pa3-review, type: community, weight: 0.2}
- **confidence:** 0.6
- **consensusNote:** Manufacturer, retailers and the 87 raters agree on 0/1 within 0.15; the batch 17 flag ("PA2 and PA3 about 0.1 apart") is explained below under the PA2: both pools were anchored to the same displayed fade of 1, which erases the difference between them. Nothing supports moving the PA3 now.
- **plasticVariance:** 300 -0.04/1.13 (35), 350G 0.00/1.13 (19), 300 Soft 1.00 (7), 300 Firm 1.00 (4), Prodigy Glow 1.38 (4); spread inside 0.4 with small groups. Prodigy prints one set. Do not average.
- **Linked:** PA1 (3/3/0/2.5), PA2, PA4 (3/3/-1/1), PX-3 (3/3/0/2). Set re-checked below with the PA2.

## PA2 — Prodigy (id 1c1867547647)

- **Atlas now:** 3/3/0/2 (source: Marshall Street snapshot; PDGA approval 13-18, Mar 5, 2013; no override). **Proposed turn/fade:** none. Matches Prodigy's current page. Reference plastic (assumed most-thrown): 350G (5 of 24 rated; 300 five, 400 four): no plastic dominates.
- **Manufacturer:** Prodigy's nav list: **PA-2 3 | 3 | 0 | 2** (Prodigy's 2023 sheet). Infinite quotes older Prodigy copy: "'stable to overstable putt and approach disc' … very stable, but not quite as overstable as the PA-1 … a little bit straighter flight path." Prodigy does not state the previous PA-2 fade in anything I could read.
- **Retailer (the batch 17 flag explained):** **Infinite prints 3/3/0/2 today** (label "Overstable"; reviewer numbers 3/3/0/1.5; 27 reviews, 4.39 stars), **Rocket still prints 3/3/0/1** ("slightly overstable beadless putter … if you need more overstability consider the PA-1"), Marshall Street (the Atlas) 3/3/0/2. **The raw ratings tell the display history:** the first PA-2 rating (Jun 2013) is 3/3/0/2; from Jun 2015 through Oct 2025, **19 of 21 ratings are exactly 3/3/0/1**. Infinite therefore displayed fade 1 for roughly a decade (Rocket still does), and now prints 2, Prodigy's number.
- **Community (Infinite raw, 24 rated of 27, 2013-2025; computed):** mean 3.00/3.06/-0.04/**1.25**, median 0/1. Fade: **1 (18)**, 1.5 (2), 2 (3), 3 (1). **The ratings from 2015 on are echoes of a displayed 1; the five who moved off it all went up: 1.5, 2, 3, 2, 1.5, an average of 2.0, which is Prodigy's number.** By skill: advanced 12 1.38; intermediate 9 1.11; professional 2 1.25; beginner 1 (advanced and professional together, 14: 1.36). Text: "fade out a little more than the numbers [1] suggest" (advanced, 300 X-Out, 2015); "somewhat over stable, it will fight out of [hyzers]" (beginner, 2017); "stable to overstable approach disc … dog leg left holes, hyzer shots, forced flex shots" (advanced, 400, 2018, rated fade 3); "very high speed stable but doesn't have a ton of fade" (professional, 350G, 2019); "very consistent fade" (advanced, 400, 2023). **DGCR (Jun 2014, "PA1, 2, 3", read directly):** "PA2 is like a PA1 but fades a little less and later"; "my PA1 and PA2 are pretty close"; a poster "confused" about the PA3 being "more OS than the PA2" on a flight guide.
- sources:
  - {name: Prodigy nav list (PA-2 3|3|0|2; PA-3 3|3|0|1; PA-1 3|3|0|2.5), url: https://prodigydisc.com/products/prodigy-f5-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Prodigy blog, "The Stock Stamp Reenvisioned" (Apr 19, 2023), url: https://prodigydisc.com/blogs/news/prodigy-disc-releases-reenvisioned-stock-stamp, type: manufacturer, weight: 0.5}
  - {name: Infinite Discs PA-2 (mfr 3/3/0/2; reviewers 3/3/0/1.5; 27 reviews; raw list via DiscComments), url: https://infinitediscs.com/prodigy-pa-2, type: retailer, weight: 0.4}
  - {name: Infinite reviewer text, 24 raw rated reviews (skill, plastic, date labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.3}
  - {name: DGCR "[Prodigy] PA1, 2, 3" (2014; read directly), url: https://www.dgcoursereview.com/threads/pa1-2-3.115095/, type: community, weight: 0.15}
  - {name: Rocket Discs PA-2 (3/3/0/1; stale), url: https://rocketdiscs.com/prodigy-pa-2, type: retailer, weight: 0.05}
- **confidence:** 0.55
- **consensusNote:** Prodigy's current page, Infinite's current line and Marshall Street say fade 2; the pool's 1.25 is a ten-year echo of Infinite's old display of 1, and the free raters within it average 2.0. **Pair with the PA3:** both pools echo the same displayed fade of 1, which is why they look 0.1 apart; free raters average 2.0 (PA2, 5) and 1.72 (PA3, 18), a 0.3 gap against Prodigy's full point. The reviewer layer therefore cannot confirm the one-point spacing, but nothing contradicts it either (Prodigy re-tested; Rocket's lag shows the old Prodigy PA-2 was 1, which is why the spacing looked flat for so long).
- **plasticVariance:** 350G 1.10 (5), 300 1.20 (5), 400 **1.75** (4), 350 1.00 (3), 300 Soft 1.50 (2); only the 400 reads higher, on four ratings. Prodigy prints one set. Do not average.
- **Linked:** PA1 (3/3/0/2.5; Infinite 3/3/0/2, pool 2.04 on 35, movers 3 toward 2.5 / 1 away), PA3, PA4 (3/3/-1/1), PX-3. Set re-checked above; the order PA1 > PA2 > PA3 holds in every layer, only the PA2's size is unproven. Nothing moves.

## Grym X — Kastaplast (id a9c5133f6a9d)

- **Atlas now:** 12.5/5/0/3 (source: Infinite Discs, manufacturer numbers via Infinite; PDGA approval 16-26, Apr 6, 2016; no override; production status unknown). **Proposed turn/fade:** none. **Open candidate recorded, not proposed: turn 0 → -0.5 (|Δ| 0.5, ungated).** Reference plastic (assumed most-thrown): K1 Line (13 of 17 Infinite ratings; K1 Soft 2, K1 Glow 2).
- **Manufacturer:** **not readable** (see Evidence limits). Kastaplast's 2016 launch copy as quoted on DGCR: "Grym X is a stable distance driver that provides a well-balanced combination of accuracy and glide. It is designed to be that solid and dependable main driver that experienced players are asking for. As the name implies, Grym X is the beefy cousin to our popular Grym." The launch numbers were **12/5/0/3** (an April 2016 Instagram post, per a DGCR poster); a poster adds that Kastaplast clarified "the X wing will make it a bit more OS than the second run Gryms, which were themselves more OS than first runs." Infinite's description: "the GrymX is Kastaplast's high speed overstable driver. Big arms will get some really nice turn and a reliable, pushing hyzer finish." **Copy tension:** "stable/overstable" against "big arms will get some really nice turn."
- **Retailer:** Infinite 12.5/5/0/3 (label "Stable"; reviewer numbers 12.3/5/-0.4/2.6; 17 reviews, 3.94 stars); Rocket 12.5/5/0/3; Gotta Go Gotta Throw 13/5/0/3; Lucky Disc Golf 12.5/5/0/3 ("Overstable"); DG Puttheads' chart prints 12/5/0/3 (and, in one passage, -1; templated, weight 0.1). Kastaplast-side phrases in retailer copy: "much more reliably overstable [than the Grym]," "a slightly more stable Wraith."
- **Community (Infinite raw, all 17 rated, 2016-2025; computed):** mean 11.68/4.91/**-0.91/2.21**, median -1/2.5. Turn: -3.5 (1), -2.5 (1), -2 (1), -1.5 (3), -1 (4), **-0.5 (2), 0 (4)**, +2 (1). Fade: 3 (6), 2 (4), 2.5 (2), 3.5 (1), 1 (2), 0.5 (2). **The Grym X page does not echo its display** (speed ranges 5-13), so these are freer ratings than most. **By plastic:** **K1 Line (13): -1.04/2.31**; K1 Soft (2): -1.25/2.50; K1 Glow (2): +0.25/1.25 (a +2 and a -1.5; both are reports of the Glow being "noticeably more understable"). **K1 Line by era:** 2015-2020 (6): **-0.50/2.75**, all three advanced/professional raters at -0.5 turn / 3 fade; 2021 onward (7): **-1.50/1.93**, with reports of a flippier disc ("so flippy … astounded by the amount of turn for a 0, 3 finish," beginner, 2021; "very understable," intermediate, 2021; "much flipper than the flight ratings," 2023; "more understable than the numbers … compare it to a Wraith," 2022). By skill (K1 Line): intermediate 9 -0.94/2.28; advanced 2 -0.50/3.00; professional 1 -0.50/3.00; beginner 1 -3.50/0.50. Text for the earlier era: "definitely as overstable as the flight chart shows" (2016); "definitely overstable, as advertised. Even when I throw it with an anhyzer, it turns right back" (2016); "I'd say it probably has more of a 3 fade, and not much turn" (2016); "this disc is ridiculously overstable for me … a faster Firebird … more like a 13/5/0/3.5" (advanced, 350 ft, 2019); "flips up to a slight turn before fading with a forward finish" (professional, 2020); "very similar to a slightly seasoned Destroyer" (2021). DGCR launch thread (Apr 2016, read directly) is pre-release speculation.
- **Why this is an open candidate and not a proposal:** *For -0.5:* the batch 16 Grym is now -2 in the Atlas, which doubles the Atlas's Grym/Grym X turn gap from 1 to 2 while the raw K1 Line pools differ by 1.0 to 1.5 (Grym ≤2020 -1.50, Grym X ≤2020 -0.50); Infinite's own description says big arms get "really nice turn"; the later ratings (2021+, -1.50) and the Glow/Soft plastics are more understable still; and the Guld (13/5/-0.5/3), which a Grym X reviewer calls the stable bomber, has the same turn. *Against:* Kastaplast's launch numbers (0/3) were the maker's; every retailer prints 0; the three K1 Line advanced/professional ratings all read -0.5 turn, within a half-step of 0 (the one other advanced rating is the Glow's +2); the pool is 17 ratings across three plastics; there is no arm speed; the manufacturer page is unreadable.
- sources:
  - {name: Infinite Discs Grym X (mfr 12.5/5/0/3; reviewers 12.3/5/-0.4/2.6; 17 reviews; raw list via DiscComments; Kastaplast description), url: https://infinitediscs.com/kastaplast-grym-x, type: retailer, weight: 0.5}
  - {name: Infinite reviewer text, 17 raw rated reviews (skill, plastic, date, distance labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.4}
  - {name: DGCR "[Drivers] Kastaplast Grym X Distance Driver" (Apr 2016 launch; Kastaplast copy quoted; read directly), url: https://www.dgcoursereview.com/threads/kastaplast-grym-x-distance-driver.128721/, type: community, weight: 0.15}
  - {name: Rocket Discs Grym X (12.5/5/0/3), url: https://rocketdiscs.com/kastaplast-grym-x, type: retailer, weight: 0.1}
  - {name: Lucky Disc Golf Grym X (12.5/5/0/3, Overstable), url: https://luckydiscgolf.com/collections/kastaplast-grym-x, type: retailer, weight: 0.1}
  - {name: Gotta Go Gotta Throw K1 Grym X (13/5/0/3), url: https://gottagogottathrow.com/products/kastaplast-k1-grym-x-distance-driver-golf-disc, type: retailer, weight: 0.1}
- **confidence:** 0.5
- **consensusNote:** Every retailer and Kastaplast's launch numbers say 0/3; the K1 Line reviewers of the first five years say -0.5/3; the later K1 Line, Soft and Glow raters say 1 to 1.5 turn more. The mold is a K1-Line disc that reads half a step more turn than printed and flippier in newer runs. The gate is not met because the manufacturer's current number is unreadable and the advanced raters sit within a half-step of 0, so nothing is proposed; if you want observed flight rather than the printed number, **turn 0 → -0.5** (not gated) is the candidate, and the same lean in the Grym is now in the overrides.
- **plasticVariance:** K1 Line -1.04/2.31 (13; 2015-2020 -0.50/2.75, 2021+ -1.50/1.93); K1 Soft -1.25/2.50 (2); K1 Glow +0.25/1.25 (2, a +2 outlier and a -1.5). Reviewers say the Glow is "noticeably more understable" and that color affects stability in Kastaplast runs. Kastaplast prints one set. Do not average.
- **Linked:** Grym (13/5/-2/2 applied; Infinite 13/5/-1/2), Guld (13/5/-0.5/3; batch 17, pool -0.61/2.89), Vass (12/5/-1.5/2), Wraith (11/5/-1/3), Destroyer. Nothing else moves.

## F3 — Prodigy (id 609fb4e2670b)

- **Atlas now:** 8/5/-2/2 (source: Marshall Street snapshot; PDGA approval 13-47, Jul 6, 2013; no override). **Proposed turn/fade:** none. Matches Prodigy's current page. Reference plastic (assumed most-thrown): 400 (10 of 32 Infinite ratings; 750 seven).
- **Manufacturer:** Prodigy's F3 400 page and nav list (fetched): **8 | 5 | -2 | 2, "Stable"**. Copy: "a stable fairway driver for long, controllable flights with a mild finish. It is a great disc for all skill levels." **Copy-versus-number tension:** "stable" with a -2 turn, the same -2 as the "understable" F5; not a numeric contradiction.
- **Retailer:** **Infinite and Rocket both print the old 7/5/-1/2** (Infinite label "Stable"; reviewer numbers 7.1/5/-1/1.9; 39 reviews, 4.54 stars). **Prodigy's April 2023 re-test changed the F3's turn from -1 to -2 and its speed from 7 to 8 (fade stays 2)**; Prodigy's other F-series changes at the same time are in the set table.
- **Community (Infinite raw, 32 rated of 39, 2013-2025; computed):** mean 7.09/5.02/**-1.06/1.89**, median -1/2. Turn: **-1 (26)**, -1.5 (2), -2 (1), -2.5 (1), -0.5 (1), 0 (1). Fade: 2 (23), 3 (2), 1 (3), 1.5 (2), 2.5 (1), 0 (1). **The ratings echo the old line even after April 2023:** 26 of 32 sit at exactly -1, including ratings from Nov 2023, Jan 2024 and Oct 2025; one rater in Oct 2023 and one in Mar 2025 moved speed to Prodigy's new 8. **Of the six who left -1, four went further understable (-1.5, -1.5, -2, -2.5) and two toward stable (-0.5, 0); only one chose -2.** Free-rater mean -1.33. By skill: intermediate 18 -1.11; advanced 5 -1.00; professional 5 -1.00; beginner 4 -1.00 (all ten advanced/professional ratings are exactly -1: pure echo). Text: "stable/overstable … virtually no turn" (advanced, 2013), "Teebird flight" (professional, 2016), "super flippy" (advanced, 400, 2018, rated -2/0), "the F3 has the perfect amount of extra stability than the F5" (intermediate, 750, 2022; F5 -2/1), "flies pretty true to the numbers" (intermediate, Air, 2023), "very true to its numbers, giving a bit of high speed turn followed by [a finish]" (intermediate, 500, 2025). Prodigy's own F3 400 reviews (12, undated): "a slightly understable fairway … starts right and fades back at the perfect time," and "super straight for 80% of the flight or more then a soft finish."
- **Why this is too thin to call:** the Atlas follows the manufacturer's re-tested -2, the reviewers' sliders still echo -1 and 81% of ratings sit on it, the six who moved lean toward more turn (4:2, mean -1.33) but only one reached -2, and the 2013-2016 texts describe a stable disc. Nothing proves -2 and nothing proves -1; I would not move the Atlas off Prodigy's current number on this evidence.
- sources:
  - {name: Prodigy F3 400 plastic page and nav list (8|5|-2|2, Stable; copy), url: https://prodigydisc.com/products/prodigy-f3-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Prodigy blog, "The Stock Stamp Reenvisioned" (Apr 19, 2023), url: https://prodigydisc.com/blogs/news/prodigy-disc-releases-reenvisioned-stock-stamp, type: manufacturer, weight: 0.5}
  - {name: Infinite Discs F3 (mfr 7/5/-1/2; reviewers 7.1/5/-1/1.9; 39 reviews; raw list via DiscComments), url: https://infinitediscs.com/prodigy-f3, type: retailer, weight: 0.3}
  - {name: Infinite reviewer text, 32 raw rated reviews (skill, plastic, date labelled), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.3}
  - {name: Rocket Discs F3 (7/5/-1/2; stale), url: https://rocketdiscs.com/prodigy-f3, type: retailer, weight: 0.05}
- **confidence:** 0.45
- **consensusNote:** Prodigy's page and the Atlas say -2; Infinite, Rocket and the ratings (81% at -1) say -1, but the ratings are an echo of Infinite's un-updated line, and the free raters split 4 toward more turn to 2 toward less. The batch 18 flag ("the pool sides with the old number") is explained as that echo and is not independent evidence for -1.
- **plasticVariance:** 400 -1.15/1.80 (10); 750 -1.00/1.86 (7); 500 -1.12/1.88 (4); 400 X-Out -0.88/2.00 (4). Prodigy prints one set. Do not average.
- **Linked:** F5 (8/6/-2/1; pool -1.92/1.07), F7, FX-3, F2 (8/4/-1/2; Infinite 7/5/-1/3, movers 8 toward the new fade 2 / 0 away), Explorer/Leopard/TeeBird (other brands, batches 16-18). Set re-checked above; nothing moves.

## X2 — Prodigy (id a84c59765970)

- **Atlas now:** 12/5/0/2 (source: Marshall Street snapshot; PDGA approval 17-38, Apr 3, 2017; no override). **Proposed turn/fade:** none. Matches Prodigy's current pages. **Open candidate recorded, not proposed: fade 2 → 3 (|Δ| 1.0, so the owner's call; the reviewers' own lean is toward 3 to 3.5).** Reference plastic (assumed most-thrown): 400 (15 of 18 Infinite ratings; 400 X-Out 3).
- **Manufacturer:** Prodigy's X2 400 and 500 product pages (fetched): **12 | 5 | 0 | 2, "Overstable."** The copy is the original X2 copy, unchanged: "a consistent, long flying, overstable distance driver designed for any skill level. Players who are looking for a solid distance driver in windy conditions or long, right to left hyzer shots will feel that the X2 fits perfectly in their lineup … go-to for top professionals looking for a reliable finish on their long drives … For fans of the X1, the X2 matches in consistency but exceeds in speed and glide." **Number-versus-copy tension (the finding of this entry):** Prodigy's re-tested **0/2** sits beside copy and a label ("Overstable") written for a 13/4.5/0/4 disc, and the **X3 at 12/6/-1/2 is "Slightly Overstable," so the X2 and the X3 now differ only by a point of turn**, though Prodigy still says the X2 outperforms the X1 in consistency. Prodigy's nav list no longer shows the X-series; the 400 page says "Sold out."
- **Retailer:** **Infinite prints 13/4.5/0/4** (label "Overstable"; reviewer numbers 12.8/4.4/-0.1/3.8; 18 reviews, 4.67 stars); **Rocket prints 13/4/0/4**; Gotta Go Gotta Throw 13/4/0/4; DG Puttheads (Nov 2025) 13/4.5/0/4 (templated); **Prodigy, Marshall Street (the Atlas) and Skyline print 12/5/0/2**. Skyline's X2 page states it directly: "Some retailers still list older ratings like 13 | 4.5 | 0 | 4, but Prodigy's current official pages list 12 | 5 | 0 | 2, so that's what we use here" (a retailer's note, weight 0.1). Marshall Street's blurb: "More overstable then the X3. Less overstable than the X1."
- **Community (Infinite raw, all 18 rated, 2017-2021; computed):** mean 12.64/4.39/-0.19/**3.69**, median 0/4. Turn: 0 (13), -1 (4), +0.5 (1). Fade: **4 (10)**, 3 (6), 3.5 (1), 5 (1). **All 18 ratings pre-date Prodigy's April 2023 numbers; the latest is from 2021, so no X2 reviewer has rated against the new number.** Ten echo the old display's fade of 4; of the eight who left it, **seven moved down (3 ×6, 3.5), one up (5): average 3.31; none went near 2.** By skill: intermediate 10 3.85; advanced 4 3.50; beginner 3 3.33; professional 1 4.0 (advanced and professional together, 5: 3.60). Text: Disc Golf Reviewer (X-series overview, undated): "an overstable driver that can be thrown with as much power as you want. It isn't the overstable monster that the X1 is (was?), but it has plenty of fade … the X2 faded earlier than I would like on most distance drives"; "if I had to choose two of the X Series discs, I'd take the X2 as a beefy, overstable distance driver that will always fade hard." **Prodigy's own X2 customer reviews (undated, on the pages that print 12/5/0/2; 14 reviews across the 400 and 500 pages):** "Nice and overstable, gets an awesome left skip"; "Perfect for … consistently fading at the end of the flight"; "it is very overstable and if you throw it in a hyzer it will spike hyzer so perfectly!"; "I go to this when I know it needs a hard and early finish with a sure fire skip"; "my go-to driver in headwinds"; "reliable straight flying hard return disc." DG Puttheads' (templated, Nov 2025) text says intermediates see "0 / 3.5-4 fade."
- **Why this is a recorded candidate but not a proposal:** *For fade 3:* every reviewer layer, old and new, describes a hard early fade; the eight free raters average 3.3 and none picked less than 3; Prodigy's own unchanged copy and "Overstable" label; its customers' reviews on the new-number pages read like the old disc; the Atlas X2/X3/X4 would share fade 2. *Against:* **Prodigy re-tested the line in 2023 and prints 12/5/0/2 on the product pages**, Marshall Street and Skyline follow it, the X2 raters are all from 2017-2021 (none after the re-test), and Prodigy's own X-series copy has not been rewritten, so the copy cannot be read as evidence against the number. A Prodigy statement about the X2's re-test, or a post-2023 rated sample, would settle it.
- sources:
  - {name: Prodigy X2 400 and 500 plastic pages (12|5|0|2, Overstable; copy; own reviews), url: https://prodigydisc.com/products/prodigy-x2-400-plastic, type: manufacturer, weight: 1.0}
  - {name: Prodigy blog, "The Stock Stamp Reenvisioned" (Apr 19, 2023), url: https://prodigydisc.com/blogs/news/prodigy-disc-releases-reenvisioned-stock-stamp, type: manufacturer, weight: 0.5}
  - {name: Infinite Discs X2 (mfr 13/4.5/0/4; reviewers 12.8/4.4/-0.1/3.8; 18 reviews; raw list via DiscComments), url: https://infinitediscs.com/prodigy-x2, type: retailer, weight: 0.3}
  - {name: Infinite reviewer text, 18 raw rated reviews (2017-2021), url: https://infinitediscs.com/Disc/DiscComments, type: community, weight: 0.3}
  - {name: Disc Golf Reviewer "Prodigy X-Series Distance Drivers: An Overview", url: https://discgolfreviewer.com/prodigy-x-series-distance-drivers/, type: community, weight: 0.3}
  - {name: Skyline Discs X2 page (states 12/5/0/2 is current), url: https://skylinediscs.com/products/prodigydisc-x2, type: retailer, weight: 0.1}
  - {name: Marshall Street X2 (12/5/0/2; not independent), url: https://www.marshallstreetdiscgolf.com/product/prodigy-x2-400, type: retailer, weight: 0.1}
- **confidence:** 0.4
- **consensusNote:** Prodigy's current pages, Marshall Street and the Atlas say 12/5/0/2; Infinite, Rocket, Gotta Go Gotta Throw, the pre-2022 ratings (3.69 raw, 3.31 for the free raters) and the older reviewers' text say a 0/3.5-4 disc. The Atlas follows the manufacturer's re-test; no reviewer has rated against it. The fade is the largest unresolved gap in the file between a current manufacturer number and the reviewer layer.
- **plasticVariance:** 400 -0.23/3.63 (15); 400 X-Out 0.00/4.00 (3). Prodigy sells the X2 in 400, 500, 750 and 400G; reviewers say 500 and 750 hold the overstable flight longer. Prodigy prints one set. Do not average.
- **Linked:** X3 (12/6/-1/2; Infinite 12/5/-1/2, pool -0.98/2.08), X4 (12/6/-2/2; Infinite 13/5/-2.5/2, pool -2.17/2.00; six of twelve raters landed exactly on the new -2), X1 (not reviewed), D2 (12/5/0/3, parked turn candidate), D3 (12/5/-1/3), Force/Nuke OS (other brands). Set re-checked above.

## Batch 20 report (for Freddy)

**Decided items recorded first:** the standing rules, the batch 17-19 methods, the applied Grym -2 override (not re-opened), and D2 turn and D1 fade carried parked (owner decisions, Oct 3, 2026). Nothing here touches either.

**Proposed changes (0).** Every Atlas number equals Prodigy's own current page (five molds) or the unreadable maker's launch numbers (Grym X); where the reviewers disagree, the disagreement is explained below and queued as a candidate.

**Confirmed as-is (4):** FX-3 (0.7), PA3 (0.6), PA2 (0.55), Grym X (0.5, with an open candidate). Confirmations mean "no contradicting evidence found," not independent verification.

**Too thin to call (2):** **F3** (0.45: Prodigy's re-tested -2 against reviewer sliders that echo -1; no independent proof either way) and **X2** (0.4, with an open candidate: every reviewer layer reads a hard early fade, but Prodigy re-tested in 2023 and no one has rated against the new number).

**Open candidates (2 new, none applied):**
- **Grym X turn 0 → -0.5 (|Δ| 0.5, ungated).** Promoted from batch 17's soft watch because the Grym is now -2: the Atlas Grym/Grym X turn gap is 2, the raw K1 Line gap is 1.0-1.5; K1 Line 2015-2020 raters sit at -0.5/3 (all advanced/professional), 2021+ raters at -1.5; Glow and Soft are flippier. Manufacturer page unreadable; all retailers print 0.
- **X2 fade 2 → 3 (|Δ| 1.0, the owner's call).** All reviewer layers (pre-2022 ratings 3.69 raw, 3.31 for the eight free raters; Disc Golf Reviewer; Prodigy's own customer reviews) describe a hard early fade, and Prodigy's own copy and "Overstable" label are unchanged; against it, Prodigy re-tested the line in April 2023 and prints 12/5/0/2. Needs a Prodigy statement or a post-2023 sample.

**Soft watch strengthened (1):** **PA3 fade 1 → 1.5 (|Δ| 0.5)**: 17 of the 18 raters who left the displayed 1 went up (free-rater mean 1.72); the raw mean 1.15 and the manufacturer's re-tested 1 hold it as a watch.

**Flags closed (explained, nothing proposed):**
- **PA2 / PA3 spacing (batch 17):** Infinite displayed PA-2 at fade 1 from at least 2015 to 2025 (and Rocket still does), so both pools echo 1 and look 0.1 apart; Prodigy now prints 2 and Infinite has updated; free raters average 2.0 vs 1.72, so the one-point spacing is neither shown nor contradicted.
- **F3 (batch 18):** the pool is an echo of Infinite's un-updated -1 line; see above.
- **FX-3 (batch 18):** Prodigy's re-tested 9/5/-1/2 is what the raters who left Infinite's old -1.5 chose (4 of 4 exactly -1); Infinite and Rocket lag. Arbitrated for Prodigy.
- **X2 (batch 17):** the gap is a 2023 Prodigy re-test against pre-2022 reviewer data; see the candidate.

**Correction to earlier batches:** the Prodigy renumbering was announced on **April 19, 2023** (the new stock stamp and updated flight numbers, led by Seppo Paju's in-depth review), not July 2023. Earlier batches' "July 2023" wording should be read as April 2023.

**Spot-checks needed before any override source note:**
- All Infinite review quotes and tallies (computed from the DiscComments JSON, snapshotted only in my scratch space; rerun to reproduce), especially the PA-2 display history (fade 1 from 2015 to 2025, inferred from the 19-of-21 echo), the F3 movers (4:2), the X2 movers (7:1), the FX-3 movers (4 of 4 at -1) and the Grym X era split.
- The Prodigy page numbers (nav list, X2 400/500, X3, X4, F3, FX-3; read as raw page text) and the April 19, 2023 blog quotation; the "retested the full lineup / F-series 7 → 8" detail came from a search summary and is flagged.
- The Prodigy product-page customer reviews on the X2, F3 and FX-3 pages (undated).
- The DGCR quotes (PA1/2/3 2014; Grym X launch 2016), the Kastaplast launch copy as quoted there, and Skyline's X2 note.

**Process notes:** nothing further to review in `featured.js` (all 170 ids covered since batch 19). **Reachable this batch:** `prodigydisc.com/products/prodigy-{x2-400,x2-500,x3-200-plastic-geometry-series-stamp,x4-400,f3-400,fx-3-400}-plastic` (the X2 200 geometry-stamp path 404s), `prodigydisc.com/blogs/news/prodigy-disc-releases-reenvisioned-stock-stamp`; Infinite slugs `/prodigy-{x2,pa-1,pa-2,pa-3,f3,fx-3}` and `/kastaplast-grym-x` (the `/prodigy-pa1` slug 302s); DGCR `threads/pa1-2-3.115095/`, `threads/kastaplast-grym-x-distance-driver.128721/`. **Not reachable:** kastaplast.com Grym/Grym X product pages (404).

**Running open-candidate list after this batch (nothing applied by this lane):** open: **Predator turn +1 → 0 (gated), D2 turn 0 → -0.5 (PARKED), D1 fade 4 → 3.5 (PARKED), Defy turn -1 → -0.5, Havoc turn -1 → -1.5, Animus turn 0 → -0.5, and new: Grym X turn 0 → -0.5, X2 fade 2 → 3 (|Δ| 1.0)**; the Grym turn candidate is closed (applied: -2). Carried unchanged: MD3 (new) fade, Tesla turn -1 → -0.5, Fury fade 2 → 1.5, Quasar turn 0 → -0.5 (held at 0); stay as-is: Monarch -4, Toro +1; pending in the main tree: Synapse turn -1, Astra turn -1.5; applied and present in this tree: Roc 2.5, Destroyer -0.5/3.5, Luna 3/4/0/2, Trident 3.5, Gator 4, Trespass -1, **Grym -2**. Soft watches: as in batch 18's list, minus the Grym X turn (promoted), plus **PA3 fade (strengthened)**, Avenger fade, Tempo fade; F3 and FX-3 reviewer-versus-printed items are closed.
