# Bag capacity research

Researched October 3, 2026. **Research only — nothing applied.** `source-data/bag-models.json` is untouched; Freddy reviews this, then Codex updates the JSON. Nothing committed or pushed.

## How to read this

- **Inventory** is `source-data/bag-models.json` in the main tree (`C:\Users\user\disc-atlas`), 16 models, `checkedAt` 2026-10-03.
- **Owner ground truth (not re-researched):** the **BX3 putter pocket fits 4 putters** and the **BX3 has a top disc pocket (fits at least 1)**.
- **Weighting:** owner "I fit X" reports outrank marketing copy. Owner evidence here comes from **Infinite Discs product-page reviews** (dated, with skill labels, read as raw page text) and **DGCR threads** (read as raw thread HTML with `curl`). **Reddit and YouTube were not reachable.** Search-engine summaries are used only as pointers and are marked *(summary, unverified)*.
- **Marketing-only-covers-main flag (⚑):** set where the advertised total or headline number is really the main compartment, so the true total is higher.
- **Confidence:** 0.8+ solid (manufacturer breakdown plus agreeing owner reports); 0.5–0.7 usable (manufacturer breakdown, thin or partly conflicting owner evidence); below 0.5 flagged "no reliable breakdown."
- **"Suggested preset"** is what I would put in `main / putter / extra` if the app must show a number. It follows the JSON note's existing rule (**use the upper end of published ranges**) but never goes above what an owner report supports. A dash means do not invent a split.

## Summary table

| Model | Advertised / current JSON total | Current JSON main / putter / extra | Researched main / putter / extra | Suggested preset (total) | Confidence |
|---|---|---|---|---|---|
| Innova Heritage | none | – / – / 0 | **No such Innova bag found** | – (identity unresolved) | none |
| Innova Adventure | 25 | – / – / 0 | 18–20 / 4–5 top (+1 front mesh) / 1 front | 18 / 5 / 1 (24) | 0.55 |
| Dynamic Discs Commander | 24 | 20 / 4 / 0 | 20 / 2–4 top slots / (side flaps 2–3 not designed for discs) | **no change** 20 / 4 / 0 (24) | 0.7 |
| Dynamic Discs Trooper | 22 | 18 / 4 / 0 | 18+ / – (upper compartment 3–4) / – | **no change** 18 / 4 / 0 (22) | 0.6 |
| Dynamic Discs Paratrooper | 24 | 18 / 2 / 4 | 18+ (owners up to 25) / 2 (owner up to 3) / 3–4 | **no change** 18 / 2 / 4 (24); URL is dead | 0.6 |
| Dynamic Discs Ranger | 22 | 20 / 2 / 0 | 19–20 / 2 / top pocket takes "a few" (unquantified) | **no change** 20 / 2 / 0 (22) | 0.75 |
| Latitude 64 E3 | 20 | – / – / 0 | **Two different bags share the name:** Luxury E3 vs Core Pro E3 | Core Pro E3: 18 / 2 / 2 (22); Luxury E3: unresolved | 0.4 |
| Latitude 64 E4 | 20 | – / – / 0 | ⚑ ~20 headline ("30 if all pockets"); putter pocket 2; lid holds 2 | – (putter 2 and lid 2 are firm; main unresolved) | 0.4 |
| Grip BX3 | 21 | 18 / 3 / 0 | 18 / **4** / **≥1** (owner ground truth) | **18 / 4 / 1 (23)** | 0.85 |
| Grip AX5 | 28 | 22 / 4 / 2 | 22 / 4 / 2 (manufacturer); one review site disputes the flap pocket | **no change** 22 / 4 / 2 (28) | 0.65 |
| Pound Octothorpe (now "Octo") | 32 | 20 / 6 / 6 | 16–20 / 5–6 / 4–6 (compare page) or 5–7 (product page) | **no change** 20 / 6 / 6 (32) is the upper end; owner-verified floor 16 / 4 / 5 | 0.55 |
| Upper Park Rebel | 30 | – / – / 0 | ⚑ 30+ is total incl. side/flap pockets; main 16–20, two top pockets 2–4 each | 20 / 6 / 0 (26) | 0.45 |
| Upper Park Shift | 18 | – / – / 0 | **No reliable breakdown** (3 vertical envelopes + 4 side sleeves; 16 comfortable, 20 packed) | – | 0.4 |
| MVP Voyager | 20 | 18 / 2 / 0 | 16–18 / 2 / **upper compartment ≥3** | 18 / 2 / 3 (23) | 0.55 |
| MVP Voyager Lite | 20 | 18 / 2 / 0 | 16–18 / 2 / **upper compartment ~5–7** | 18 / 2 / 5 (25) | 0.5 |
| Infinite Sling | 12 | 10 / 2 / 0 | 10 (incl. 2 slots) / 2 / 0 | **no change** 10 / 2 / 0 (12) | 0.75 |

**Models where the JSON should probably change:** BX3 (putter 3 → 4, extra 0 → 1: owner ground truth), Voyager and Voyager Lite (extra 0 → 3 and 5: both manufacturers say the upper compartment takes discs and owners filled it), Innova Adventure (add a split), Upper Park Rebel (add a split and fix the "30" claim), Latitude 64 E3 (decide which bag it is). **Models to leave alone:** Commander, Trooper, Paratrooper, Ranger, AX5, Octo, Infinite Sling.
**Models with no reliable breakdown:** Innova Heritage (bag not found), Upper Park Shift, Latitude 64 E3 (ambiguous product) and E4 (main unresolved).

---

## Per-model records

### Innova Heritage — no bag found
- **JSON:** capacity null, no source; note says "no verified bag specification."
- **Finding:** Innova's current bag list (innovadiscs.com/disc-golf-bags/) shows Discover Pack, Adventure Pack, Excursion Pack, Safari Pack, Standard, Starter, HeroPack and others — **no "Heritage."** `/disc-golf-bags/heritage/` returns 404; a web search for "Innova Heritage disc golf bag" returns no product. It may be discontinued, regional, or a misnomer.
- **Recommendation:** ask Freddy what bag this was meant to be before researching further. Candidates by name only, none verified as the intended one: HeroPack ("25+ discs with top and bottom putter pockets," Innova page via search summary), Excursion Pack, Safari Pack.
- **Sources:** https://www.innovadiscs.com/disc-golf-bags/ ; https://www.innovadiscs.com/disc-golf-bags/heritage/ (404).
- **Confidence:** none. **Flag: no reliable breakdown / unidentified.**

### Innova Adventure Pack
- **Advertised:** "Holds 25 Golf Discs"; features list "5 zippered pockets, Stealth Pocket, Front Putter Pocket" (Innova). Infinite's older copy says "holds up to 25 discs." No pocket-level numbers from Innova.
- **Researched breakdown (owner reports, Infinite reviews):**
  - **Main compartment:** 18 discs ("18 in the main pocket and 4 putters above," intermediate, Jul 2023); "holds 25 discs very easily" overall (advanced, Sep 2021). A retailer summary says up to 20 *(summary, unverified)*.
  - **Top putter pocket:** 4 putters (advanced, Sep 2021); "if I leave it unzipped I can fit 5 putters in the top pocket. They don't fall out" (intermediate, Apr 2021).
  - **Front mesh putter pocket:** 1 putter/approach disc (advanced, Sep 2021).
- **Suggested preset:** main 18, putter 5 (unzipped), extra 1 = **24** (Innova's 25 is reachable with 19–20 in the main compartment per the advanced owner). The advertised 25 is a whole-bag number, not a main-compartment number.
- **Conflicts:** none material; owners differ by one or two discs.
- **Sources:** https://www.innovadiscs.com/disc-golf-bags/adventure/ ; https://infinitediscs.com/product/economy-backpacks/innova-adventure-pack (5 reviews).
- **Confidence:** 0.55 (three owner reports, no manufacturer split).

### Dynamic Discs Commander
- **Advertised:** "a 20-disc main compartment … the 2 pockets on the vertical wall allow for several more discs" (Dynamic). Infinite: "main disc compartment has space for 20 discs. An additional 2-4 discs can also be stored in the easy access vertical storage compartments." ⚑ The 20 is the main compartment only.
- **Researched breakdown (owners):**
  - **Main:** 20 ("my typical round has 20 discs in the main compartment," Dynamic customer; "comfortably fit 20 mids and drivers in the main area," intermediate, Infinite 2019).
  - **Top vertical slots (putter pockets):** "two putters in the top slots" (2019); "main pocket holds about 20 discs with comfortable 4 more discs in the two slip pockets on top" (intermediate, Jun 2020); "the putter pocket fits two putters easily, plus another one or two" (intermediate, 2017); "3 putters in the putter pouches" (Dynamic customer).
  - **Long side zip pockets:** two discs to three extra discs when used (reports from 2019–2021), but they are accessory pockets (jacket, retriever).
  - **Total reports:** 20–25 (several owners).
- **Conflicts:** the existing JSON note says "two discs each" for the two vertical pockets (4 total); owners report 2–4. **4 is the upper end and consistent with Infinite's "2–4."**
- **Suggested preset:** unchanged, 20 / 4 / 0 = 24.
- **Sources:** https://www.dynamicdiscs.com/products/commander-bag ; https://infinitediscs.com/product/backpacks/dd-commander (13 reviews).
- **Confidence:** 0.7.

### Dynamic Discs Trooper
- **Advertised:** "holds 18+ discs in its main compartment. It also has an upper compartment that can hold anything from more discs to articles of clothing"; "Upper compartment for accessories, articles of clothing or three to four more discs" (Dynamic). ⚑ 18+ is main only.
- **Researched breakdown:** main 18 ("the main storage compartment can comfortably fit 18 discs," Disc Golf Around review); **upper compartment 3–4 extra discs, used as the putter quiver** ("the top of the bag is usually where I store up to 3 or 4 additional putters"). There is **no separate dedicated putter pocket**; the JSON's `putter_capacity: 4` is this upper compartment.
- **Suggested preset:** unchanged, 18 / 4 / 0 = 22 (or, equivalently, 18 / 0 / 4).
- **Sources:** https://www.dynamicdiscs.com/products/trooper-bag ; https://blog.dynamicdiscs.com/2020/06/5-reasons-you-should-buy-trooper-bag.html ; https://discgolfaround.com/dynamic-discs-trooper-backpack-complete-review/ (no Infinite Trooper listing found).
- **Confidence:** 0.6 (one independent owner/reviewer).

### Dynamic Discs Paratrooper
- **Advertised (via Infinite and Disc Nation; Dynamic's own page is gone, see below):** "18+ discs in the main compartment," "Separate top putter compartment for two putters," "Upper compartment for accessories, clothing, or 3-4 more discs," "Front flap pocket for a go-to disc," "three additional pockets that can be used as putter pouches." ⚑ 18+ is main only.
- **Researched breakdown (owners, Infinite):**
  - **Main:** an advanced owner lists 10 distance drivers + 9 fairway/control + 4 mids + 2 approach = **25 in the main compartment** (plus 3 putters, 28 total), "no issues during a round" (Mar 2021). A beginner who carries 10–15 says discs "jumble, get stuck and twisted," so full loading is tight.
  - **Top putter pocket:** "the top putter pocket will easily hold 2" (intermediate, Oct 2020); another owner keeps **3 putters in the main top pocket** plus **2 discs in the smaller zippered pocket above** (beginner, Feb 2021).
  - **Upper compartment:** 3–4 discs per Dynamic copy; no owner quantified it separately.
  - **Front flap disc pocket:** a beginner could not fit any disc in it.
- **Conflict:** manufacturer says main "18+"; one owner fits 25. The JSON's 18 is the safe reading, the 25 is a full-pack report. Top putter pocket is 2 per manufacturer, 3 per one owner.
- **Suggested preset:** unchanged, 18 / 2 / 4 = 24. **The JSON source URL (`dynamicdiscs.com/products/paratrooper-bag`) returns 404** — the bag may be discontinued; Infinite lists it "Out of Stock."
- **Sources:** https://infinitediscs.com/product/backpacks/dd-paratrooper-backpack (8 reviews); https://discnation.com/dynamic-discs-paratrooper-disc-golf-backpack/ ; https://www.dynamicdiscs.com/products/paratrooper-bag (404).
- **Confidence:** 0.6.

### Dynamic Discs Ranger
- **Advertised:** "Holding 20 discs in the main compartment and two putters in the signature side pocket … The top pocket is amazingly roomy, even holding several items of clothing" (Dynamic). Infinite's older copy: "Large main disc compartment that holds 18+ discs … 'On-Deck' putter pocket holds 2 putters." ⚑ 20 is main only.
- **Researched breakdown (owners):** "I fit **19 discs inside** … I have **2 putters** outside the bag in the putter pocket" (professional, Infinite 2019, 3-year-old bag); "the big top pocket you can put extra discs in" (intermediate, 2016); "a hoodie or light jacket fit comfortably in the top storage compartment."
- **Extra:** the top pocket can take discs, but no owner gave a count. Left at 0 rather than invented.
- **Suggested preset:** unchanged, 20 / 2 / 0 = 22.
- **Sources:** https://www.dynamicdiscs.com/products/ranger-bag ; https://infinitediscs.com/product/backpacks/ranger-bag (8 reviews).
- **Confidence:** 0.75.

### Latitude 64 E3 — which bag?
- **JSON source:** the Westside/Latitude 64 catalog PDF, "Luxury E3, approximately 20 discs." **Latitude 64 currently sells a different bag called the Core Pro E3** (and keeps the older Luxury line: E3, E4). The JSON name "Latitude 64 E3" does not say which. **Flag for Freddy: confirm which bag the app means.**
- **Luxury E3 (older):** "made to carry 20 discs but the bag can accommodate 30 if all compartments are used … the putter pocket on the side has room for two putters" (retailer listings *(summary, unverified)*; same wording appears on Latitude 64 listings for the E4). ⚑ 20 is a headline, not a main-compartment count.
- **Core Pro E3 (current; Latitude 64's own page, fetched):** "a spacious main compartment that holds **18–20 discs**, plus a dedicated top pocket for **2–3 putters**" (FAQ). Infinite's listing of the earlier Core Pro: "main disc compartment holds up to 18 discs depending on molds; top putter compartment holds **two** discs; top compartment for extra discs, extra clothing, towels; two multi-use side pockets, good for … discs." A retailer summary adds "an extra zippered disc pocket that fits 2 discs" *(summary, unverified)*.
- **Suggested preset (Core Pro E3 only):** main 18, putter 2, extra 2 = 22. For the Luxury E3 the breakdown is unresolved (putter pocket 2 is firm; main unresolved).
- **Sources:** https://latitude64.com/products/core-pro-e3-backpack ; https://infinitediscs.com/product/backpacks/core-pro ; https://assets.unilogcorp.com/187/ITEM/DOC/Westside_DISCS_103240484_Catalog.pdf (the JSON source, Luxury E3).
- **Confidence:** 0.4 (ambiguous product, no owner counts). **Flag: no reliable breakdown until the product is chosen.**

### Latitude 64 E4 (Luxury E4)
- **Advertised (Latitude 64 text as on Infinite and True North):** "made to carry approximately 20 discs, but it can carry up to 30 if all of the pockets are utilized for discs." Details: "putter pocket on the side with room for two putters"; "large side pocket inside of putter pocket, suitable for backup discs"; "the lid … also has room for two discs"; "main disc compartment has an adjustable divider"; "large top pocket for extra water, clothing, rain gear."
- **Owner evidence:** one Infinite reviewer carries "about 20 discs" plus accessories. No owner gave a main/putter split.
- ⚑ **The "approximately 20" is ambiguous**: it may mean the main compartment (30 only when every pocket is stuffed) or the whole bag.
- **Firm numbers:** putter pocket **2**, lid **2**, backup-disc side pocket (unquantified). Arithmetically, if 20 is the whole dedicated-disc total the main compartment would be 16; I am **not** recommending that without an owner count.
- **Sources:** https://infinitediscs.com/product/backpacks/luxury-e4 (3 reviews); https://truenorthdiscgolf.com/products/e4-luxury-backpack .
- **Confidence:** 0.4. **Flag: no reliable main/putter breakdown.**

### Grip BX3
- **Advertised (Grip, fetched):** "**18-Disc capacity main compartment**, **3-putter quick-pull adjustable zippered top pocket**, original GRIPeq large expandable side pockets." ⚑ 18 is main only. 21 (18 + 3) in the JSON is the advertised total.
- **Owner ground truth (given, not re-researched):** the putter pocket fits **4** putters; the bag has a **top disc pocket fitting at least 1**.
- **Corroboration found (not re-researching the truth, only noting it):** a DGCR owner of the earlier BX: "I carry **17 discs** in the lower compartment and **4 putters up top**. The BX will hold **22 comfortably**" (Nov 2018); another has "15 + 3"; a third notes "Grip bags tend to pretty much hold what they advertise when new. After a few months … the opening for the putter pouch get[s] softer so it will definitely fit … a couple of extra discs." Review sites repeat the marketing "18 + 3." Suggests Grip's printed putter-pocket counts run **conservative by one** (hypothesis from the BX3 ground truth and the BX owner; the AX5 should be checked by an owner before assuming the same).
- **Suggested preset:** main 18, putter **4**, extra **1** = **23** (JSON: 18 / 3 / 0 = 21).
- **Sources:** https://grip-eq.com/gear/bx3/ ; https://www.dgcoursereview.com/threads/grip-bags-capacity.139346/ ; https://www.johendersondiscgolf.com/gripeq-bag-reviews (marketing-level).
- **Confidence:** 0.85 (owner ground truth).

### Grip AX5
- **Advertised (Grip's AX5 page, a "Factory Second" listing of the same bag):** "**22-disc capacity main compartment plus 2-disc front flap pocket**; **4-putter quick-pull adjustable big-mouth zippered top pocket**; large expandable side pockets." ⚑ 22 is main only; total 22 + 4 + 2 = 28, which matches the JSON.
- **Owner evidence:** none specific to the AX5 found. A DGCR BX owner assumes "the AX would carry at least 26" (inference from the BX, not an AX5 count).
- **Conflict:** the Pine Tree Disc review site says the AX5 **lacked** the front flap pocket and that the AX6 added it ("brings the total to around 28"). **Grip's own AX5 page lists the flap pocket**, so I weight the manufacturer, but flag it. Grip's current AX6 page was not readable.
- **Suggested preset:** unchanged, 22 / 4 / 2 = 28.
- **Sources:** https://grip-eq.com/gear/ax5-series-f2/ ; https://www.pinetreedisc.com/blog/grip-disc-golf-bag-review ; https://www.dgcoursereview.com/threads/grip-bags-capacity.139346/ .
- **Confidence:** 0.65 (manufacturer breakdown only, one disputed element).

### Pound Octothorpe (now sold as "Octo")
- **Advertised:** Pound's compare page (fetched): "**Disc Capacity 16-20 Main Pocket, 5-6 Putter Pocket, 4-6 Haul Pockets**." Pound's Octo product page (fetched): "Main Compartment holds 16-20 discs … Storm Hood putter pocket that holds **5-6 putters** … Dual Haul Pockets, **holds 5-7 discs**." ⚑ 16–20 is main only; the headline "capacity" on the compare page is a three-part range, not one total.
- **Owner evidence:** DGCR "Octothorpe Bag Review" (an earlier version): "the putter pocket comfortably holds **4 putters**" with a sewn divider; a large side compartment holds 5 discs; the innermost side pockets "fit 3-4 discs" each. Another DGCR owner: "4 (now 5) putters up top."
- **Conflicts:** haul pockets **4–6** (compare page) vs **5–7** (product page); owner putters **4** (older bag) vs **5–6** (current manufacturer).
- **Suggested preset:** the JSON's 20 / 6 / 6 = 32 is the upper end of the published ranges and each part is within what the manufacturer prints. An owner-supported floor would be 16 / 4–5 / 5.
- **Sources:** https://pounddiscgolf.com/pages/compare-our-bags ; https://pounddiscgolf.com/products/octo ; https://www.dgcoursereview.com/threads/octothorpe-bag-review.123518/ ; https://www.dgcoursereview.com/threads/does-anyone-use-a-pound-octothorpe-bag-how-is-it.137067/ .
- **Confidence:** 0.55.

### Upper Park Rebel
- **Advertised:** "Holds 30+ discs" (Upper Park help page); product copy: "holds over 30 discs, as well as a large side storage area, front storage area, interior sidewall pockets, detachable Velcro compartments." ⚑ The 30+ counts every pocket; it is **not** a main-compartment number. Upper Park's own site did not load, so these are the help-page and retailer copies.
- **Researched breakdown (DGCR Upper Park megathread, owners over several versions):**
  - **Main compartment:** "main compartment (16-18 discs)" with two top pockets used (4 discs); "12-15 in the main compartment" with 2 putters/mids in each top slot; "I was able to fit 25 discs in the Rebel's main compartment" (packed).
  - **Top vertical pockets:** an older Rebel had **three**; from the 2020 version **two**, "slightly larger … maybe 3-4 discs each." Owners carry "2 putters/mids in each of the slots."
  - **Side pockets:** "3 drivers or mids in each side pocket"; "a mix of 12 discs in the main compartment, 3 drivers or mids in each side pocket, 3 drivers in the top pocket, and … up to 10 in the flap pocket" (one owner's stuffed load; bag version not stated).
  - A retailer summary says "main 20 comfortably; 2 putter pockets fitting 3 discs each; side pockets 4 discs" *(summary, unverified)*.
- **Suggested preset:** main 20, putter (two top pockets) 6, extra 0 = **26**. The "30" is reachable only by stuffing side and flap pockets (3 per side, up to 10 in the flap pocket per one owner), which I would not preset.
- **Sources:** https://help.upperparkdiscgolf.com/en-US/what-are-the-dimensions-disc-capacity-and-weight-of-the-bags-104413 ; https://infinitediscs.com/product/backpacks/upper-park-disc-golf-the-rebel ; https://www.dgcoursereview.com/threads/upper-park-designs-backpack-bags.94231/ (pages 25, 80, 102, 105).
- **Confidence:** 0.45 (owners mixed across versions).

### Upper Park Shift
- **Advertised:** "Holds 18+ discs" (Upper Park help page). Unlike the Rebel, there is no distinct main/putter split in the marketing.
- **Researched layout:** the Shift stores discs in **three vertical "envelopes" in the middle plus four stretch side sleeves**; the lower main compartment is for gear. Green Splatter (2022 Shift): "four sleeves and three envelopes comfortably hold **16** … the stretchy sleeves along the sides can hold **three each** … maxed out you could get **20**." DGCR owners (earlier Shift): "two drivers each in two [outside] pockets and two single putters"; "the top pocket could fit 3 drivers"; "I ended up putting 3–4 discs in the top slot"; "I use 3 discs on the outer side pockets and 2 on the inner side pockets, so 10 discs in the side pockets"; another says it does "not carry a ton of discs" and gets hard to load at ~20.
- **Putter pocket:** none dedicated; the **top vertical envelope** is used as one (about **3** putters per a retailer summary *(summary, unverified)* and DGCR "3 drivers / 3–4 discs").
- **Why no breakdown:** the 18+ is one pooled number; owners disagree on how many discs the envelopes versus the side sleeves take. I would not invent a main/putter split.
- **Suggested value:** total **16 comfortable / 18 advertised / 20 packed**; leave the split manual.
- **Sources:** https://help.upperparkdiscgolf.com/en-US/what-are-the-dimensions-disc-capacity-and-weight-of-the-bags-104413 ; https://www.greensplatter.com/review-upper-park-shift/ ; https://www.dgcoursereview.com/threads/upper-park-shift-review.96325/ ; https://www.dgcoursereview.com/threads/upper-park-designs-backpack-bags.94231/ (pp.80, 105).
- **Confidence:** 0.4. **Flag: no reliable breakdown.**

### MVP Voyager
- **Advertised (MVP, fetched):** "Average capacity 20+ discs; **Main compartment: up to 18 drivers/mids; Putter pocket: up to 2 putters; Large zippered upper storage compartment — can fit discs as well**." Infinite: "Holds about 20 discs on average … main compartment holds 18 … putter pocket holds 2 … large storage in upper compartment." ⚑ The "20" averages main + putter; the upper compartment's discs are on top of it.
- **Owner evidence (Infinite):** "comfortably hold **16/17** [mixed] discs, 2 putters in the top putter pouch … the pouch at the top would let you fit **at least 3 more** putters and mids" (intermediate, Feb 2017); "I fit **23** in there, heavy on drivers" (advanced, Feb 2017); "the top pouch is great for your most frequently used discs … I ended up having my main drivers in the same big slot" (intermediate, Feb 2017).
- **Suggested preset:** main 18, putter 2, extra **3** (the conservative owner number) = **23**. The JSON note "accessory storage is not assigned an invented count" is the cautious route; the owner report now supports a count.
- **Sources:** https://mvpdiscsports.com/products/bags/voyager-bag/ ; https://infinitediscs.com/product/backpacks/mvp-voyager (4 reviews).
- **Confidence:** 0.55.

### MVP Voyager Lite
- **Advertised (MVP, fetched):** "**20-22 Disc Capacity**; generously sized top putter pocket." MVP Pro Shop: "Main compartment holds **16-18** discs; Putter pocket holds **2** putters; **Upper compartment holds additional discs**." ⚑ The 20–22 includes the upper compartment; the 16–18 is the main.
- **Owner evidence (Infinite):** "the main disc compartment fits a lot … I had **17 discs** in it" and "**two putters** in the designated pouch"; in a discs-only configuration "I've got **5 putters, 1 midrange and 1 driver** up there" (advanced/intermediate reviewer, Oct 2020); "very lightweight even with 20+ discs" (advanced, 2021). The 2025 update added a fully zippered putter pocket; MVP's capacity line is unchanged.
- **Suggested preset:** main 18, putter 2, extra **5** (the upper compartment's 7-disc owner load minus the 2-putter pouch) = **25**; conservative option 17 / 2 / 3 = 22.
- **Sources:** https://mvpdiscsports.com/products/bags/voyager-lite-bag/ ; https://mvpproshop.com/products/mvp-voyager-lite-slate ; https://infinitediscs.com/product/backpacks/mvp-voyager-lite (2 reviews).
- **Confidence:** 0.5 (one detailed owner).

### Infinite Sling (Infinite Disc Slinger)
- **Advertised (Infinite):** "The inside pocket carries up to **10 discs**, including two inside slots for your go-to discs. The putter pouch on the front of the bag easily carries **two putters** and even fits oversized discs like the Condor."
- **Owner evidence (Infinite):** "I was able to squeeze **two putters** in the mesh pocket and I had 5 or 6 discs inside with plenty of room for more" (intermediate, 2021); "carries the 9 discs I usually bring easily" (beginner, 2021); the mesh holding putters and the water bottle wears through (advanced, 2022). No owner exceeded 10.
- **Suggested preset:** unchanged, 10 / 2 / 0 = 12.
- **Sources:** https://infinitediscs.com/product/economy-backpacks/infinite-disc-slinger .
- **Confidence:** 0.75.

---

## Cross-model notes for the JSON update

1. **Marketing headline vs total.** Most manufacturers state the **main compartment** (Commander 20, Ranger 20, Trooper/Paratrooper 18+, BX3 18, AX5 22, Voyager 18) and list pockets separately. The Rebel's "30+" and the E4's "20 (30 if all pockets)" are the exceptions that mix all pockets. The JSON's `capacity` field is built as main + putter + extra, which matches this reading; only the Rebel and E4 headline numbers do not fit it.
2. **Dead or changed sources.** `dynamicdiscs.com/products/paratrooper-bag` is 404; Innova has no Heritage bag; the Pound Octothorpe is now the "Octo"; Upper Park's site did not load from this tooling (its help-page numbers were readable); Grip's AX5 page is a Factory Second listing and the AX6 is the current flagship.
3. **Where owner reports should win over the JSON:** BX3 (4 putters, top disc pocket), Voyager and Voyager Lite (upper compartment holds discs), Innova Adventure (top pocket 4–5 putters, front pocket 1).
4. **Where owner reports were not enough to overturn marketing:** AX5 and Octo (no owner counts for the current versions).
5. **Reddit and YouTube** were not reachable; owner evidence is Infinite review pages and DGCR only, so the models with few reviews (Voyager Lite 2, Core Pro 2, Luxury E4 3, Voyager 4) rest on one or two detailed owners.
