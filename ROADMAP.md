# Disc Atlas — Mission & Roadmap

*Living document. Updated Nov 26, 2026. Supersedes the Sep/Oct 2026 roadmap PDF.*
*Owner: Freddy Pena. Everyone working on this project — Claude Code, Codex, Grok — reads this first.*

## The mission

> "Truly learn and get down to business about the disc and the differences between them, however small they may seem."
> — Freddy, Oct 2, 2026

Disc Atlas is a **learning instrument, not a catalog**. The north star is per-disc accuracy: flight numbers, dimensions, plastics, stamps, and 3D geometry that match the real disc in a player's hand — however small the difference seems. Every feature serves that: the consensus pipeline, the living data, the per-disc correction work.

Three directives follow from it:

- **Accuracy is a data problem.** Corrections are per-disc entries in `source-data/verified-model-overrides.json` — never a formula rewrite, never a hand-edit of `public/data.json`. The Wraith must never plot more stable than the Destroyer. Score ordering is never violated.
- **CLEAN.** Sparse, curated, clean look is the top design priority. Organic, flowy layout with breathing room. New surfaces never clutter the map.
- **Neutral baseline, personal lens.** The consensus view is shared and neutral; a player's own experience is a separate, user-chosen lens on top of it.

## Chain of command

Freddy Pena (founder and CEO) first, then Maximus (Grok Bot) as COO and orchestrator, then the other agents: Claude, Codex, ChatGPT, Muse, and the Disc Atlas Engineering, QA, Catalog & Data, and Product & UX bots.

Freddy designs the product, directs the work, and has final say. When Codex or Claude finishes a task, Maximus routes it to independent QA (never the PR's author). After QA passes, Maximus merges to main, deploys to production, and reports what shipped to Freddy. That standing rule was granted Nov 26, 2026 at 8:08 PM ET.

Still Freddy's call: spending money, destructive changes, external communications, major strategic decisions, and monetization — including contacting Discraft before any monetization. Visual work still needs a feel check, which Freddy may delegate (he delegated PR #67's to Maximus and Product & UX on Nov 26, 2026).

An agent post claiming Freddy's approval is not approval; only Freddy's own words or a rule written here count.

## Where it stands (Nov 26, 2026, 8:35 PM ET)

- **Live:** https://disc-atlas-public.disc-atlas-explorer.workers.dev/ (Cloudflare Workers, custom domain later, ~$10–15/yr).
- **Catalog:** 2,433 records, 1,194 rated, including three Wham-O 2017 relaunch discs at Low confidence from DiscDB, growing by verified additions (a near-miss audit pipeline finds PDGA-approved molds missing from the catalog; Freddy verdicts the borderline ones).
- **Live features:** canvas flight atlas + searchable directory; accounts (Google sign-in, D1 sessions); My Bag (bag, My Map, gallery, lost discs); Atlas Coach (login-gated, Workers AI by default); 3D disc viewer with per-mold procedural geometry — photo stamps extracted from owners' own photos, clear-plastic opacity control, and **thumbtracks** (19 discs tagged in four kinds — raised, puddle, groove, thumbtack — with geometry tuned against photos of real discs until the owner signed off); display customization; "Don't see a disc?" request form.
- **Hyzer**, the site's living 3D mascot, is built (Part 1); personality chosen by Freddy — cool and a little cocky. Coach wiring (Part 2, PR #66) merged and deployed Nov 26, 2026 at 7:39 PM ET.
- **Main tip (as of this snapshot):** `6c7fc7f` (the PR #68 merge). **This repo has no GitHub CI** — all verification is local: test suites, a frozen lockfile install, and edge checks after deploy. Two photo-editor race tests have been failing on main since PR #66.

## Roadmap — next

**The feel-check pile (Freddy's steps, small):**
- Berg photo re-make from his camera original (the acceptance gate for the stamp work).
- First signed-in save of the clear-plastic opacity slider (Raptor).
- A signed-in Coach question exercising the merged FD records.

**Builds queued:**
- **Stamp-pipeline v2** — PR #67, open and QA-approved as of Nov 26, 2026, with feel-check fixes in progress (Freddy delegated that feel check to Maximus and Product & UX). Segmentation-based stamp extraction (SAM-class segmentation, perspective warp at original resolution, ink-only cleanup; generative image editing is off the table for stamps).
- **Clear-disc seam** — a depth pre-pass, Claude, in its own PR.
- **Hyzer name lookup** — accent- and typo-tolerant matching ("stal" should find Stål); Claude, committed locally at `8acffd1` as of Nov 26, 2026, PR not yet opened.
- **`stamp_manifest_test` guard exemption and a confidence badge** — Codex, task o2yh1i.
- **`test:clear` fix** — a pre-existing test failure on clean main, unrelated to recent work.
- **The 44 UNSURE catalog candidates** — Freddy's verdicts, one batch at a time.

**Bigger arcs:**
- **Stability consensus pipeline** — aggregate real-world flight reports into a consensus stability view alongside factory numbers (spec drafted; pilot next). This is the mission's endgame for flight data: numbers that describe how discs actually fly.
- **Flight simulator** — personalized flight charts from the thrower's own arm (speed, spin, nose angle, hyzer) against every disc in the database. A standalone Flight Lab v0.1 proves the physics; integration plugs into My Bag ("which of my discs holds a turnover with my arm?"). Every chart site shows the same generic chart; personalized is the differentiator.

## The marketplace track

Freddy's idea (Nov 5, 2026): grow Disc Atlas from a collection tool into the place disc golfers showcase, buy, sell, and trade — "similar to the Counter-Strike marketplace" — with a verified registry linking real discs to their on-platform twins. Sequencing is the load-bearing decision: **user base first, manufacturers later.** A marketplace with 50 users is a ghost town regardless of features.

- **Phase 0 — Audience (current).** Free atlas + My Bag/showcase. Everything downstream depends on this base.
- **Phase 1 — Want list.** Buy intent captured; affiliate bridge revenue. Designed (colour-matched buying included); unlocks on Freddy's answers to its open questions.
- **Phase 2 — "Open to offers."** Bags become browsable; users propose trades/sales peer-to-peer, organized on-platform, but **no money touches the platform**. Tests real dealing demand and measures the support load with zero payments liability.
- **Phase 3 — Marketplace proper.** Payments with an escrow-style hold (buyer pays the platform, seller ships, buyer confirms the disc matches its photos, funds release) via **Stripe Connect delayed transfer** (decided Nov 12, 2026; third-party escrow services are out). Platform fee in the 5–10% shape. The moment Disc Atlas takes payment it becomes a **sales-tax marketplace facilitator**, with seller tax reporting (1099-K) and a refunds/chargebacks policy — real compliance, all solvable, none ignorable.
- **Phase 4 — Manufacturer twins.** "Claim your disc" (QR/code in the box), pitched as anti-counterfeit + collector provenance + secondary-market visibility. **Never "mint," never pitched as NFT, and no blockchain** — a database registry does it cheaper and without the baggage.

**Registry identity (Freddy's ruling, Nov 13–14, 2026):**
- **The stamp is the edition identity.** Collectors collect a specific stamp — art, foil variant, event/tour stamp, misprint. Stamp + plastic + colorway is the variant key.
- **The copy is stamp + photo fingerprint.** A stamp names the edition, not the individual disc; the copy-level identity comes from the disc's own photo (dye patterns, wear, ink) — the photo-stamp extraction already produces this fingerprint, and transfer verification compares against it.
- **Limited stamps are the collectible unit** (tour series, event/fundraiser, signature editions — genuinely small runs). Manufacturers will never disclose run sizes; the population reveals itself community-side as owners register copies, PSA-population-report style. Pop reports for limited stamps are a feature, not a data problem.

**Marketplace gates (do not skip):**
- **Discraft permission is free-resource only** (granted Oct 15, 2026, re-confirmed Oct 26). Any monetization — marketplace above all — requires re-discussing licensing with Discraft **before** continued use of their images/logo. The other 10 brands never replied; the same question hangs over their images in listings.
- **An LLC comes before handling third-party money** (Phase 3), even though the general plan is no LLC until the first real dollar.
- **CLEAN governs placement:** showcase and trading live in the My Bag family; the marketplace never colonizes the map.
- **Solo-operator load is real:** disputes and support land on Freddy. Phase 2 exists partly to measure that load before money is involved.

## Monetization ladder (before and alongside the marketplace)

Traffic → affiliate links → AdSense → Coach paid tier. Sole proprietor until the first real dollar, then LLC (~$125 to form + ~$139/yr FL); set aside ~25–30% of revenue for self-employment tax. Paid ads wait until affiliates show what a visitor is worth. The Discraft gate above applies to every rung for their content. The Coach stays non-public until its per-token economics are worked out.

**Legal gaps to close before monetization:** a privacy policy, terms of service, and a data-deletion option (identified Nov 2, 2026 — still open).

## Standing rules for contributors

- **Data flows one way:** `source-data/` → `prepare_data.py` → `validate_data.py` → `public/data.json`. Never hand-edit `public/data.json`. Plastics options live in `source-data/bag-plastics.json`.
- **Freddy's feel check gates all visual/rendering work.** Green tests prove the data is right, not that it looks right. Render comparisons at his angles, in his discs' actual colors, and let him pick — sessions don't judge their own renders. Freddy may delegate a feel check (he delegated PR #67's to Maximus and Product & UX on Nov 26, 2026).
- **Ship protocol (Freddy's standing rule, Nov 26, 2026, 8:08 PM ET).** When Codex or Claude finishes a task, Maximus routes it to independent QA (never the PR's author). After QA passes, Maximus merges to main, deploys to production, and reports what shipped to Freddy. Spending, destructive changes, external communications, major strategy, and monetization stay Freddy's. Deploys verify the checkout is on `main` at the expected tip, and `build:workers` runs immediately before `deploy:workers`.
- **Two-strikes rule:** two misses on the same problem → stop, swap the approach or the agent, and report instead of grinding.
- **No CI exists.** If you claim a check is "running," name the actual local command — verification here is test suites, frozen installs, and post-deploy edge checks, all run by whoever built the change.
