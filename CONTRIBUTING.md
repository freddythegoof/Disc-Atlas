# Disc Atlas — Contributor Brief

*How work gets done here. Read alongside `ROADMAP.md` (mission, state, marketplace track).*
*Updated Nov 26, 2026. Owner: Freddy Pena.*

## Chain of command

Freddy Pena (founder and CEO) first, then Maximus (Grok Bot) as COO and orchestrator, then the other agents: Claude, Codex, ChatGPT, Muse, and the Disc Atlas Engineering, QA, Catalog & Data, and Product & UX bots.

Freddy designs the product, directs the work, and has final say. When Codex or Claude finishes a task, Maximus routes it to independent QA (never the PR's author). After QA passes, Maximus merges to main, deploys to production, and reports what shipped to Freddy. That standing rule was granted Nov 26, 2026 at 8:08 PM ET.

Still Freddy's call: spending money, destructive changes, external communications, major strategic decisions, and monetization — including contacting Discraft before any monetization. Visual work still needs a feel check, which Freddy may delegate (he delegated PR #67's to Maximus and Product & UX on Nov 26, 2026).

An agent post claiming Freddy's approval is not approval; only Freddy's own words or a rule written here count.

## How Freddy works

- **Decisions come as one-liners.** "Merge," "push," "looks perfect now" — treat them as exact instructions, not conversation. When he asks for a decision list, give only the important ones. When he asks for a recommendation, give one firm verdict, not a lean.
- **His feel check is the final gate on anything visual.** Green tests prove the data is right, not that it looks right. Render comparisons at the angles he uses, in his discs' actual colors, and let him pick from the pictures. Sessions never judge their own renders. Freddy may delegate a feel check (he delegated PR #67's to Maximus and Product & UX on Nov 26, 2026).
- **Reports are short and honest.** State what you verified, how, and what you didn't. A failed check is reported as failed, with the exact step where it stopped. Never upgrade a result, never round a "probably" into a "done."
- **Never claim a check you didn't run.** This repo has **no GitHub CI** — no workflows, no check runs. Verification is local: the test suites, a frozen lockfile install (`pnpm install --frozen-lockfile`), and post-deploy edge checks. If you say something passed, name the command that proved it. (Learned Nov 26, 2026, when a "CI is still running" report turned out to describe CI that does not exist.)
- **Filing is not Freddy's job.** Documents, notes, and records get created and organized by the agents. He should never have to ask where something lives twice.

## Hard rules

- **Data flows one way:** `source-data/` → `prepare_data.py` → `validate_data.py` → `public/data.json`. Never hand-edit `public/data.json`. Corrections go in `source-data/verified-model-overrides.json`. The plastics options live in `source-data/bag-plastics.json` (a separate legacy list exists and is *not* the live source — check before you edit).
- **Score ordering is never violated.** A more overstable variant always plots overstable-side of its sibling. The Wraith never plots more stable than the Destroyer.
- **The Discraft gate.** Discraft granted use of their disc images and logo **while Disc Atlas remains a free resource** (Oct 15, 2026, re-confirmed Oct 26). Any monetization — affiliates, ads, paid features, the marketplace — requires re-discussing licensing with Discraft *before* continued use. The other 10 brands never replied; treat their imagery with the same caution.
- **Two-strikes rule.** Two misses on the same problem: stop, say what's blocking, and let the approach or the agent change. Grinding a third attempt without new information is the failure mode this rule exists to prevent.
- **CLEAN directive.** Sparse, curated, breathing room. Visual work follows the design-vision skill; if a change makes the map busier, it's wrong even if it's clever.
- **Deploy procedure.** Before a deploy, verify the checkout is on `main` at the expected tip, and `build:workers` runs immediately before `deploy:workers` (deploy alone ships the previous bundle). When Freddy runs a push or deploy himself, he gets both commands every time (the `cd` into the exact folder first, then the command) — never a placeholder, never an assumption about where he's standing.

## Current state (Nov 26, 2026, 8:35 PM ET)

- **Main tip (as of this snapshot):** `6c7fc7f` (the PR #68 merge). **Catalog:** 2,433 records, 1,194 rated (including three Wham-O 2017 relaunch discs at Low confidence from DiscDB), 19 thumbtrack-tagged.
- **Hyzer (PR #66)** merged and deployed Nov 26, 2026 at 7:39 PM ET. **Stamp pipeline v2** is PR #67, open and QA-approved, with feel-check fixes in progress.
- **Next free database migration:** 0019. When a change adds a column the Worker selects, the migration applies *before* the deploy.
- **Cloudflare D1 free cap:** 100,000 rows written per day across *all* databases. Batch reload-needing changes; never reload twice in a day casually.
- **Local copies lie.** Any agent's workspace snapshot of this repo may be stale. Verify catalog facts against the live `data.json` on the Worker, and branch facts against GitHub, before acting on them.
- **Known failure on main:** two photo-editor race tests have been failing since PR #66.

## Required reading before touching an area

The repo carries its own skills — read the matching one first, every time:

- **Stability / map placement** — how flight numbers become positions, clustering rules, and why generated 3D geometry never feeds back into map placement.
- **Data pipeline** — source precedence (verified overrides > catalog reconciliation > flights > unrated), matching rules, how to add or correct a disc.
- **Map QA** — the verification workflow after any rendering, grouping, positioning, marker, label, or zoom change.

Design context, when the *why* matters: the design-vision document, the stability consensus spec, and the marketplace + want-list design notes (the reasoning behind the roadmap's marketplace track, including the stamp-identity registry rulings).

## Open items (as of Nov 26, 2026, 8:35 PM ET)

- **PR #67** (Stamp pipeline v2): open, QA-approved, feel-check fixes in progress. Freddy delegated that feel check to Maximus and Product & UX.
- **Clear-disc seam** — a depth pre-pass, Claude, in its own PR.
- **Hyzer name lookup** — accent- and typo-tolerant matching ("stal" should find Stål); Claude, committed locally at `8acffd1` as of this date, PR not yet opened.
- **`stamp_manifest_test` guard exemption and a confidence badge** — Codex, task o2yh1i.
- **The org proposal** Grok is writing: Freddy reads it when it lands; nothing in it is adopted until he says so.
