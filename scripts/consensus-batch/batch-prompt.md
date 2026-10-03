# Consensus batch — automated run (Plan 10, Phase 2)

You are running an automated consensus research batch for Disc Atlas. RESEARCH task only.

## Hard boundaries

- Do NOT touch map code, `public/data.json`, or `source-data/verified-model-overrides.json`.
- Do NOT commit. Do NOT push. Leave everything uncommitted in the working tree.
- Git is for inspection only (`git status`, `git log`). No merge, commit, or push.

## 1. Determine this batch's discs

1. Read `featured.js` at the repo root — the ranked list, first entry = rank 1. Read the actual file; never rely on memory of the order.
2. Read `docs/stability-review-queue.md` and collect every disc already covered.
3. This batch = the next 10 discs in `featured.js` order NOT already covered.
4. If fewer than 10 remain, research the remainder. If all are covered, print "QUEUE COMPLETE" and stop.

## 2. Standing rules (owner-decided — apply throughout)

- PLASTIC BASELINE POLICY: a mold's reference numbers are its most-thrown plastic (Star for Innova drivers). DX is the price-tier baseline but NOT the flight reference.
- Review gate: weak evidence = no correction. A |Δ| = 1.0 turn/fade change is NEVER proposed — record it as an open candidate for the owner. Smaller adjustments (|Δ| ≤ 0.5) may be proposed only on solid evidence.
- NEVER average across plastics — mold-level consensus + plasticVariance note.
- Weight manufacturer pages and established reviewers over random comments. Infinite Discs reviewer averages are a coarse signal only (they pool plastics and wear). Marshall Street is NOT independent confirmation.

## 3. Per-disc research

For each disc: (1) manufacturer numbers + marketing copy, noting contradictions; (2) retailer ratings; (3) community sample, skill-normalized (flag unstated arm speeds). First diff each disc's current manufacturer/retailer numbers against `flights.json` — it has lagged before; report any lag.

Known limits: Reddit blocked, DGCR 403s, YouTube unreachable — work with what's readable and say so. Thin confirmations read as "no contradicting evidence found." Infinite review text may not load — pooled averages only, capped weight. Quotes arriving via summarizing fetch must be flagged as needing spot-check before use in any override source note.

Linked molds re-check together — see the queue's running list of linked sets, and add newly discovered links.

## 4. Output

1. APPEND a new batch section to `docs/stability-review-queue.md` in the previous batches' entry format: per-disc entries (proposed change OR confirm-as-is OR too-thin-to-call), sources with weights, confidence 0–1, consensusNote, plasticVariance, lastUpdated (today's date), history.
2. Write `docs/consensus-batch-reports/batch-N.md` (N = existing batch sections + 1): discs covered, proposed changes with confidence + gate status, confirmed as-is, too-thin-to-call, open candidates for the owner, evidence limits, catalog-lag findings, and the next 10 discs in `featured.js` order after this batch.

## 5. Report

Print a concise summary to stdout: batch number, discs, proposed changes, open candidates, confirmations. You apply nothing — the owner reviews separately.
