# Stability Consensus Pipeline + Display — Build Spec

Status: draft for Freddy's review. Not started.

## 1. What this is

A standing research pipeline that builds per-disc stability consensus from manufacturer, retailer, and community sources, feeds `source-data/verified-model-overrides.json`, and a user-visible "stability consensus" section in the disc detail panel — proving placements are data-backed, not flight-numbers-only.

## 2. Why

Every flight chart on the internet plots manufacturer flight numbers. Nobody shows the evidence behind the placement. This is Disc Atlas's differentiator, and it plugs directly into the existing accuracy workflow: per-disc overrides with sources, never hand-edit `data.json`, never rewrite the global formula to fix one mold.

## 3. Existing pieces (read before building)

- `source-data/verified-model-overrides.json` — per-disc override entries with provenance. The Destroyer entry (12/5/-1/3 → 12/5/-0.5/3.5, sourced from Innova's own "faster Wraith with a little more high and low speed stability" copy) is the reference example.
- `prepare_data.py` → `public/data.json` (generated; never hand-edit). On Windows, `set PYTHONUTF8=1` before running or it crashes on a cp1252 decode.
- `public/app.js` — already has a provenance display for `atlas_adjusted` entries; extend this pattern, don't invent a new one.
- Skills in `.claude/skills`: `disc-atlas-data-pipeline`, `disc-atlas-stability`.

## 4. The pipeline

### 4.1 Scope and cadence

- Start with the top ~100 most-thrown molds (rank by `public/featured.js` order + general popularity), then expand toward the full catalog.
- Cadence: weekly batch, ~10 discs per run (first pass ≈ 10 weeks).
- Pilot first: 10 discs researched manually before automating anything.

### 4.2 Sources per disc (priority order)

1. Manufacturer flight numbers + marketing copy (already in catalog; copy sometimes contradicts numbers — note it).
2. Retailer stability ratings: Infinite Discs (publishes its own flight numbers), Marshall Street, Disc Golf Center, etc.
3. Community: r/discgolf, DGCR forums, YouTube reviewer consensus — sampled (5–10 quality threads/reviews), not exhaustive.

### 4.3 Normalization rules

- Weight sources: manufacturer numbers + established reviewers outrank random forum comments.
- Skill-normalize community takes: beginners systematically rate discs more overstable, experienced arms the reverse. Discount accordingly; prefer reviewers who state arm speed or skill level.
- Plastic/run variance: DO NOT average across plastics. Record mold-level consensus plus a `plasticVariance` flag/note where data shows meaningful spread (e.g. "sub-170g Blizzard runs fly ~1 turn flippier than Star").
- Weak evidence = no correction. One mold's correction must not move unrelated molds.

### 4.4 Output format

Proposed entries extend the existing `verified-model-overrides.json` schema (read the file first; don't invent a new one):

- `turn`, `fade` — proposed adjustments
- `sources` — [{name, url, type: manufacturer | retailer | community, weight}]
- `confidence` — 0–1
- `consensusNote` — one or two sentences, plain language
- `plasticVariance` — note or null
- `lastUpdated` — ISO date of the last change
- `history` — [{date, turn, fade, reason}]; every change leaves a trail so drift is auditable. Nothing is set in stone, but nothing moves silently either.

### 4.6 Living data

Numbers are never final. The weekly batch covers new discs first, then re-surveys existing entries on a rotating basis (each disc re-checked roughly quarterly, sooner if notable new evidence surfaces — a new run, a wave of reviews, a manufacturer number change).

New evidence must clear the same bar as an initial correction before it moves a number: no jitter on thin evidence. A single forum thread doesn't shift a 0.85-confidence consensus; a pattern across sources does.

### 4.5 Review gate

- `confidence` < 0.7 OR |turn/fade adjustment| ≥ 1.0 → review queue, never auto-applied.
- Review queue: `docs/stability-review-queue.md` (append; Freddy clears it).
- High-confidence small adjustments may be staged to the working tree — but NEVER committed without his data review, and NEVER pushed without explicit approval. Push = deploy.

## 5. The display (site work)

- Location: disc detail panel ONLY. The map stays clean (CLEAN directive) — no map rendering, grouping, or label changes.
- Content: a "Stability consensus" section showing source count ("Backed by 7 sources"), a confidence indicator, an expandable source list, and a plain-language note wherever consensus differs from the manufacturer's numbers.
- Style: extend the existing `atlas_adjusted` provenance display in `app.js`; match the site's design language.
- Mobile: fits inside the existing detail panel; no new mobile map work.

## 6. Who builds what

- Pipeline design + pilot research runs: Claude, Sonnet 5.5, high effort (judgment-heavy research).
- Detail-panel display: Codex, GPT-6.1 Sol, high effort (implementation).
- Weekly runner: TBD — see §8. Default to manual pilot first.
- Escalation: two-strikes rule stands (two misses → swap agent/model → rethink the approach).

## 7. Guardrails

- Never hand-edit `public/data.json`; corrections go through overrides + `prepare_data.py` + `validate_data.py`.
- Never rewrite the global stability formula to fix one mold pair.
- No commit without his review; no push without explicit approval.
- Map rendering, grouping, and label logic are out of scope. Unrelated uncommitted work (e.g. stashed dense-direction edits) stays untouched.

## 8. Phases

- **Phase 0 (now):** Freddy reviews this spec.
- **Phase 1 (pilot):** 10 discs researched → proposals → review queue → he approves the format and at least 3 end-to-end applications (research → override → rebuilt `data.json` → detail panel shows it).
- **Phase 2:** standing runner decision (scheduled local Claude Code task with repo write access vs. off-machine research producing a proposals file for review) + scale to 100.
- **Phase 3:** full catalog; revisit plastic-level overrides if variance data justifies it. End state: the overrides file becomes a catalog-wide accuracy layer — the Destroyer treatment at scale. This is NOT a formula rewrite: positions still come from the same pipeline, just with better per-disc inputs. Uniqueness follows accuracy — discs that genuinely fly alike should still cluster; never spread discs artificially for the sake of looking differentiated, and never report more precision than the evidence supports (that's what the confidence gate is for).

## 9. Acceptance criteria

- [ ] 10-disc pilot proposals in the review queue, each with sources + confidence
- [ ] ≥3 pilot overrides applied end-to-end and visible in the detail panel
- [ ] Zero map visual changes; detail panel matches site design
- [ ] Review queue workflow confirmed by Freddy before Phase 2
