# Batch 1 fraction audit implementation plan

**Goal:** Backfill the 14 retained Batch 1 placements using origin/main's full-disc schema, without merging main or changing artwork, assignments, pilots or Batch 2.

**Architecture:** Measure unchanged, hash-verified per-mold originals and alpha bounds. Add optional placement validation/emission to this pre-merge pipeline; origin/main will make placement mandatory after its merge. Use an isolated browser route overlay of origin/main's unmodified renderer to preview the numbers. Keep live branch rendering unchanged until that merge.

**Spec:** Freddy's October 16 Batch 1 fraction-audit request in this chat.

## Tasks

- [x] Verify clean ba081fd and exactly 14 extracted Batch 1 entries; preserve hashes of every stamp and all out-of-scope manifest objects.
- [x] Re-measure full outer disc centre-axis silhouette and complete approved alpha in its own native source coordinates. Record source URL/hash, exact bounds, square/ink bounds and source fraction. Visually review silhouette overlays. Stop on incompatible padding or unavailable measurement.
- [x] Write failing tests for finite optional placement, emitted correspondence, immutable PNGs and 14-entry measurement receipts. Add minimal source-manifest/pipeline support and run prepare/validate. Retain absent pilot metadata unchanged pre-merge. Test origin/main's actual strict schema with its existing pilot metadata in memory and the branch's reviewed Infinite source gate.
- [x] Capture old branch versus main-renderer preview for all 14; compare textures and physical fractions; retain top-three, Force and Hades source/before/after proofs. Compare controls under both the branch-only and isolated future-renderer conditions.
- [x] Run relevant browser suites and default perf gate serially. Record all results, deltas and any rerun honestly. Re-check catalog identities, hashes, branch diff and scope. Write the 14-row audit, review, commit locally; no push/merge/landing.

## Review focus

Wrong silhouette/background edge; crop offsets mistaken for scaling; missing/near-invisible alpha; padded square exceeding full disc; pre-merge proofs misrepresented as live behavior. Assertions and source overlays cover these. No prior numeric fraction exists; record legacy effective physical fraction separately from metadata backfill.
