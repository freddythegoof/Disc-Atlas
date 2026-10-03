# Plan 11 — My Bag (spec draft, Oct 3, 2026)

**Status:** spec draft for Freddy's review. Queued after Plan 08 (accounts + coach), before personalization and the 3D viewer.
**Numbering note:** the roadmap already has 09 (3D viewer) and 10 (consensus) queued; this is the next build slot, so it takes Plan 11.

## 1. The idea

A personal bag: the user saves the actual discs they throw — mold, plastic, wear, weight — plus the bag they carry them in. The bag is the foundation of everything personal in Disc Atlas:

- It answers "which of **MY** discs holds a turnover with **MY** arm?"
- It feeds the personalization lens (Plan: personalization) — effective stability is disc × thrower × the specific piece of plastic.
- It gives the coach something true to reason about instead of generic advice.

Details matter. A Star Destroyer at 175g fresh off the shelf and a beat DX Destroyer at 150g are barely the same disc. The bag records that.

## 2. Data model (D1, per account)

**`bags`** — one row per user (a user has one active bag; no multi-bag in V1):
- `user_id` (FK → users)
- `bag_model` (text — curated list + custom, see §5)
- `capacity` (integer — disc slots; from the model or user-entered)
- `updated_at`

**`bag_discs`** — one row per **physical disc** (three Buzzzes with different wear = three rows; this keeps wear/weight honest):
- `id`, `user_id`
- `mold_id` (FK → catalog; the featured mold)
- `plastic` (text — per-brand list + custom, see §4)
- `wear` (integer 1–10, see §3)
- `weight_g` (integer, see §4)
- `notes` (optional free text — "forehand only", "water disc", etc.)
- `added_at`

One entry per physical disc is the standing rule. No "quantity" field — if you carry two, that's two rows with their own wear.

## 3. Wear scale (1–10)

10 = factory new. 1 = extremely beat (only good for rollers). Labels at each end plus a midpoint in the UI ("like new / seasoned / well-worn / beat").

Wear moves effective stability in one direction only: **more wear = less stable** (more turn, less fade). This is the most established fact in disc golf physics-as-lived-experience and the whole reason beat-in cycles exist.

**Initial calibration** (tunable in the personalization plan; direction is locked, magnitudes are starting points):
- Each wear step below 10 shifts effective turn by **−0.1** and effective fade by **−0.05**.
- So a wear-5 disc flies roughly 0.5 more turn / 0.25 less fade than its consensus numbers.
- Wear 1–2 discs are effectively a different stability class — the UI should say so, not just plot it.

## 4. Plastic & weight

**Plastic** — per-brand dropdown + "other" free text. Curated list lives in source-data (extendable, same pattern as the catalog):
- Innova: Star, Champion, GStar, Pro, DX, Blizzard
- Discraft: ESP, Z, Big Z, D, X
- Dynamic Discs: Lucid, Fuzion, BioFuzion, Prime
- Latitude 64: Opto, Gold, Retro
- MVP/Axiom: Neutron, Proton, Plasma, Electron
- Discmania: S-Line, C-Line, D-Line, P-Line
- Prodigy: 400, 350, 300
- Millennium: Quantum, Sirius, Standard
- (extend as needed)

Plastic matters twice:
1. **Inherent delta** — premium plastics typically fly a touch more stable than base in the same mold (the consensus pipeline already found this: Champion Tern −2 vs Star −3, Champion Boss 0/3 vs Star −1/2). The plasticVariance notes in the overrides file are the source of truth.
2. **Wear rate** — base plastics beat in faster. A DX disc at wear 7 got there in weeks; a Champion disc at wear 7 got there in years. V1 records the plastic; V2 can weight wear velocity by plastic tier.

**Weight** — integer grams, sane bounds (130–180). Heavier = slightly more stable (more momentum resists high-speed turn). Initial calibration: ±5g from the mold's typical max ≈ ∓0.1 effective turn. Direction locked, magnitude tunable.

## 5. The bag itself

The user picks their bag from a curated list (Innova Heritage/Adventure, Dynamic Discs Commander/Trooper/Paratrooper/Ranger, Latitude 64 E3/E4, Grip BX3/AX5, Pound Octothorpe, Upper Park Rebel/Shift, MVP Voyager/Voyager Lite, Infinite Sling…) **or** enters a custom bag with a manual capacity.

Capacity drives the **X/Y slot meter** in the bag view ("14 / 20"). Full bag = gentle warning, not a hard block (people overstuff putter pockets; we're not their dad).

## 6. Add from anywhere

Every surface where a disc is interactable gets an **"Add to bag"** action:
- **Detail panel** — primary button next to the disc name.
- **Map** — marker click opens the detail panel; add from there.
- **Directory** — row-level action (icon button).
- **Comparison tray** — add any of the compared discs.
- (V2: coach replies — "add this disc" inline in a recommendation.)

The add flow is a small sheet, not a page: plastic dropdown (defaults to the mold's reference plastic), wear slider (defaults to 10/new), weight input (defaults to the mold's typical max), optional note → Save. Two taps for the common case (defaults are right), full control one tap away.

## 7. Bag view

A dedicated view (header nav, next to Directory):
- Discs grouped by class: Distance drivers / Fairway drivers / Midranges / Putters — the thrower's mental model, not the catalog's.
- Each row: mold, plastic, wear badge, weight, effective stability (once personalization lands; consensus numbers until then).
- Slot meter up top: "14 / 20 — Upper Park Rebel".
- Per-disc: edit details, remove. Removing asks once (no accidental deletes), then it's gone.
- Empty state: not a dead page — "Your bag is empty. Add discs from the map, the Directory, or any detail panel." with a button that jumps to the Directory.

## 8. Personalization integration (the payoff)

The bag is Layer 2's primary input (per the Oct 3 personalization vision):

> **Effective stability = consensus baseline (Layer 1, never touched) + plastic delta + wear delta + weight delta + arm-speed transform.**

Concrete uses:
- **Your-bag overlay** — toggle that re-renders the map to *your* discs' effective flights. Your beat Star Wraith plots where it actually flies for you, not where a fresh one flies for a pro arm.
- **Gap analysis** — "your bag has no overstable fairway" / "three discs covering the same slot". This is the feature that makes people open the app in a parking lot.
- **Coach awareness** — "which of MY discs holds a turnover?" gets answered from the bag, with wear and plastic factored in.

V1 ships storage + bag view. The overlay and gap analysis ride with the personalization plan. The data model already carries everything they'll need — no migration later.

## 9. Auth & storage

- **Login-gated**, same as the coach. Bag rows live in D1 keyed to `user_id`. Consistent with Plan 08's account model.
- **Signed-out users** see the bag view as a teaser with a sign-in prompt — no localStorage guest bag in V1 (keeps one source of truth; revisit if signup friction hurts).

## 10. Phasing

- **V1** — bag CRUD: add-from-anywhere sheet (plastic/wear/weight/note), bag model + capacity, bag view with slot meter, edit/remove. D1 tables + endpoints. Tests + screenshots, all themes, 360px.
- **V2** (with personalization) — your-bag map overlay, gap analysis, wear/plastic/weight feeding effective stability, coach reading the bag.

## 11. Open questions (Freddy's call)

1. One row per physical disc — good, or do you want a quantity field for multiples?
2. Login-gated only for V1, or should signed-out users get a localStorage bag?
3. Should your bag's discs highlight on the map (your plastic, your wear, plotted where *you* throw them)? V1 or V2?
4. Wear scale: 1–10 with labels, or simpler (new / seasoned / beat)?

## 12. Acceptance

- Add a disc from the map, the Directory, and a detail panel — all three land in the bag with correct plastic/wear/weight.
- Slot meter reads correctly against the chosen bag's capacity; custom bag + manual capacity works.
- Bag view groups by class, edits and deletes work, empty state guides to the Directory.
- All three themes, 360px, keyboard accessible. Login-gated: signed-out users get the teaser, not the data.
- Nothing in the consensus baseline moves — the bag is pure Layer 2 input.
