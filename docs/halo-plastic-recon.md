# Halo plastic: recon (Part 1)

Run date: October 17, 2026. Base: `main` at `15eeb9b` (PR #22, glare/levelling, merged). Read first: the photo-stamp spike's Halo section (`codex/photo-stamp-spike` at `47616cc`, `docs/photo-stamp-spike.md`, case 3).

**Verdict: STOP at the gate.** The geometry answer is clean, and so is the photo answer. The data story is not the one the prompt assumed. The catalog has no Halo editions at all, and no default band colour holds up against Freddy's reference grid. The build waited for Freddy's scope call. The options and a recommendation are at the end.

**Decision (Freddy, October 17, 2026): option A, photo discs only.** A Halo copy shows a band only when it has a photo, and the band colour is sampled into `photo_rim_color`. The build is written up in [`halo-plastic.md`](halo-plastic.md).

Halo means only one thing in this doc: a two-colour dye job in ordinary plastic. It is not a stamp, a foil, a finish or an overmold. Nothing below changes overmold logic or the PDGA overmold flags.

## 1. Data: how the site would know a disc is Halo

### The catalog: absent entirely

`public/data.json` has 2,434 records, one per PDGA-approved mold. A record carries no plastic and no edition. Halo is not a separate record, and it is not a plastic variant on the mold record.

- **Halo-edition catalog records: 0.** The only "Halo" in `data.json` is Latitude 64's Halo mold (`e4b6733b7189`), a distance driver named Halo. It is not a plastic.
- The same holds across `source-data/`. `pdga-approved-discs.csv`, `flights.json`, `catalog-reconciliation.json`, `photo-audit.json`, `photo-manifest.json` and `withdrawn-photo-register.json` each mention Halo only as that Latitude 64 mold.
- `photo-provenance.json` has 5 retailer product photos that happen to show Halo Star copies: Arachnid, Gorgon, Rollo, Corvette and Wombat3. These are 2D catalog images. They feed no 3D model, and they don't make the mold record a Halo edition. Out of scope.

So "a known Halo edition (Destroyer or Wraith)" in the catalog does not exist. A Halo Destroyer exists only as somebody's copy in a bag.

### The bag: Halo is already recorded, as the plastic name

Bag discs (D1 `bag_discs`) store the owner's plastic as required free text (`plastic TEXT NOT NULL`, migration 0003). The editor offers each brand's plastics from `source-data/bag-plastics.json`, which already lists Halo plastics:

| Brand in `bag-plastics.json` | Halo option | Catalog molds the option is offered for |
| --- | --- | ---: |
| Innova (PDGA "Innova Champion Discs") | `Halo Star` | 181 (141 rated) |
| Innova Factory Store | `Halo Star` | (store alias) |
| Infinite Discs | `Halo S-Blend` | 32 |

`public/plastics.json` (the dated manufacturer-families list) has `Halo Star` for Innova only.

So **the per-disc fact already exists, without a migration.** A bag disc is Halo when its `plastic` is one of these names. The illustration default colour for `Halo Star` (`#cf7d9e`) is a plate colour like every other plastic's. Nothing sets a band.

**The overmold precedent doesn't transfer.** Overmold is a property of the *mold*, so it lives in `public/disc3d/overmold.mjs` (a verified list keyed by PDGA manufacturer and record) and in an optional per-record boolean. Halo is a property of the *copy*: the same Destroyer mold ships in Star, Champion and Halo Star. The prompt's "`source-data/` → prepare/validate" wiring therefore has nothing to wire for the catalog. The only `source-data/` change worth making would be an explicit list of which plastic names are Halo, e.g. `"halo": ["Halo Star"]` per brand in `bag-plastics.json`. That beats matching on the word "Halo".

### Freddy's own Halo discs: count not taken

Production D1 was not queried: that needs Freddy's Cloudflare credentials, and this recon ran read-only. The one local D1 copy (`work/gallery-fixes`) has 4 bag discs (ESP ×2, Putter Line Hard, Star), none of them Halo. To count production:

```sql
SELECT plastic, COUNT(*), SUM(texture_key IS NOT NULL) AS with_photo
FROM bag_discs WHERE plastic IN ('Halo Star','Halo S-Blend') GROUP BY plastic;
```

## 2. Geometry: where the plate stops and the rim begins

From `public/disc3d/shape.mjs` (`shapeFrame`, `overmoldProfile`) and `public/disc3d/mesh.mjs`:

- **Rim seam, `Ri = R − rimWidth`.** This is the PDGA rim width per mold. `overmoldProfile` inserts one profile point at `Ri` on top. Profile edges from the inner wall's top (`wallTop`) round the foot, wing, nose and shoulder to the seam are "rim". `groupRim` reorders the lathe index into two material groups and leaves the vertices and normals alone, so lighting runs smoothly across the seam. **The profile is the same one every disc uses.** The overmold split is only an index regroup and a second material, not a different shape.
- **Shoulder, `Rs = Ri + w·lerp(.25,.12,sharpness)`.** This is where the dome begins. A non-overmold photo is drawn up to `Rs`; an overmold photo stops at `Ri` (`photoGeometry`, PR #12, settled).

Measured for Halo Star molds in Freddy's grid:

| Mold | Rim width (cm) | Ri/R (band starts) | Rs/R (photo stops) |
| --- | ---: | ---: | ---: |
| Tern | 2.3 | 0.782 | 0.808 |
| Destroyer | 2.2 | 0.791 | 0.816 |
| Wraith / Mamba | 2.1 | 0.801 | 0.827 |
| Valkyrie | 1.9 | 0.820 | 0.849 |
| Sidewinder | 1.8 | 0.829 | 0.858 |
| Rollo / Fox | 1.5 | 0.862 | 0.892 |
| Wombat3 | 1.4 | 0.872 | 0.900 |
| Aero | 1.0 | 0.908 | 0.931 |

**How this compares with real bands:** in the grid, the dyed band covers about the outer fifth of the top on the drivers and a thinner ring on putters. That matches `R − rimWidth`. The spike's band rule independently measured its drawn Halo's band edge at 0.788 R, against 0.801 for the Wraith seam. The rim seam is the right boundary.

**The smallest change:** a Halo copy uses the existing split, `discGeometry(shape,{overmold:true})`, which means the same profile, the same `groupRim`, and material 1 in the band colour. Materials stay as they are: `rimMaterial` is already a `MeshPhysicalMaterial` with the plate's plastic finish assigned (`Object.assign(rimMaterial,plastic)`), so the band shades exactly like the plate. The geometry is not forked. The one thing that must *not* follow overmold is the photo reach. A Halo photo still stops at `Rs` (`photoSurface(…,{overmold:false})`), so the shoulder cut is untouched. Outside `Rs` the generated band shows. Between `Ri` and `Rs` the photo covers the band material and shows the band as photographed.

**Known simplifications:**
- Real Halo dye bleeds: the colours swirl into each other. Here they meet at a clean edge at `Ri`. Feathering is not nearly free: the split is per-triangle material groups, so a gradient would need vertex colours or a shader hook on both materials. Left out by design.
- The band also covers the underside rim (inner wall, foot, wing), the same reach as an overmold rim piece. That matches how a dyed rim looks from below.

## 3. Colour sourcing

### Catalog discs: no defensible answer, and nothing to apply it to

There are no catalog Halo records (section 1), so a catalog band colour would have no disc to go on. Separately, the premise of a classic light or white band doesn't survive Freddy's grid. Read by eye from the 17 Halo Star discs shown, the bands are:

- blue on 7 (Fox, both Destroyers, the yellow Wraith, the red Sidewinder, Leopard3, IT);
- white or pale on 2–3 (Wombat3, Rollo, arguably Aero);
- purple on 2 (Mamba, the teal Sidewinder);
- teal on 2 (Mako3, Valkyrie);
- yellow on 1 (the second Fox), pink on 1 (the teal Wraith) and red on 1 (Tern).

No colour is the Halo colour, and none is canonical per mold either: there are two Destroyers with different plates, and two Wraiths with different plates and bands. **A default band colour would be invented data.** That breaks the same rule as rendering an overmold where PDGA doesn't say there is one.

### Freddy's photo discs: yes, with no migration

- **The sampler exists.** `rimColor(data,size,inner)` in `public/disc-albedo.mjs` takes equal angular votes on 4 rings × 128 angles between `inner` and the edge, skips transparent and seam pixels, and rejects specular outliers. `delightPixels` calls it when given `rimInner`. The aligner's crop puts the disc's edge on the crop circle, so on a Halo disc that outer ring *is* the band.
- **It is gated to overmolds today.** `public/disc-photo.mjs:425` sets `rimInner = isOvermold(mold) ? plate : null`. So `photo_rim_color` (migration 0011) is **always NULL for every non-overmold disc.** That column is a free, migration-free home for a Halo band colour, with exactly the contract the prompt asks for: the worker writes it with the texture on PUT, and nulls both on DELETE (`workers/textures.mjs:77–94`). Replacing the photo re-samples; removing it clears it.
- **Sample from where:** for a Halo copy, pass `rimInner = Ri/R`. Rim-only samples then start at `Ri + max(2px, 8%·(1−Ri))`, inside the band and clear of any bleed at the boundary. `plate` stays `Rs/R`, so the plate colour and the photo are unchanged.
- **No new column is needed.**
- **The spike agrees.** Its band rule found the Halo band as one plastic component at 100% of the circumference and reported its colour. Production doesn't need that extractor: the band's inner radius is known from the mold (`Ri`), so the existing sampler is enough.

### The owner's own pick: also possible with no migration

`bag_discs.rim_color` (0008) holds any `#rrggbb`. The gate is in code, not schema: `public/bag-values.js:24` (shared with `workers/bag.mjs`) keeps `rim_color` only for overmolds, and the editor's colour field is labelled "Overmold rim" (`web/index.html`). Allowing it for Halo copies under its own label, "Halo band", is a code change. The overmold path stays as it is. `bagRimColor` already resolves an explicit pick ahead of the photo sample.

## 4. Build plan (pending Freddy's call)

Everything below is the same for whichever option is chosen, except where marked.

1. **The Halo fact.** Add a `halo` list per brand to `source-data/bag-plastics.json` (`Halo Star`, `Halo S-Blend`). Add a pure `isHalo({plastic, brand})` beside `isOvermold`. Overmold wins on an overmold mold: there the rim piece already *is* the second colour, so no double treatment.
2. **Renderer, one flag.** `split = overmold || halo`. The viewer (`viewer.mjs` `build`/`applyMaterials`), the bag scene (`collection-scenes.js`), and atlas art and thumbnails (`atlas-art.mjs` `colorsOf`, `keyOf` and `geometryOf`) pass `overmold:split` to `discGeometry` only, and pass `overmold` (unchanged) to `photoSurface`. Without a band colour, `split` is false and the disc renders exactly as today. The aria label gets its own Halo wording, never "overmold".
3. **Photo sampling (options A and B).** `disc-photo.mjs`: `rimInner = overmold ? plate : halo ? Ri/R : null`. The editor must re-read the Halo state when the plastic select changes.
4. **The owner's band pick (option B only).** `bag-values.js` keeps `rim_color` for overmold *or* Halo, and clears it when the plastic stops being Halo. The editor shows the existing colour field as "Halo band" for Halo copies.
5. **Tests.**
   - A Node unit test for `isHalo` and for the colour resolution.
   - Browser tests: a Halo Destroyer bag disc before and after, in the viewer, the bag and a thumbnail.
   - A Star Destroyer, pixel-identical.
   - The Pixel, unchanged.
   - A photographed Halo copy: the band at the edge in its sampled colour, and the photo stopping at `Rs`.
   - The existing `non-overmold-photo-edge` halo case saves as the default plastic (Star), so its assertion that the outer rings are the plate's purple still holds. That proves non-Halo plastics keep PR #12's contract.
   - The full suites and the perf gate at their defaults.

**Out of scope in every option:** catalog mold rendering. A mold on the default atlas shows the mold, not a plastic. Halo shows only where a copy is: bag views and the "my map" lens.

## Freddy's call

| Option | What renders | Data source | Cost |
| --- | --- | --- | --- |
| **A. Photo discs only** | A band only on Halo copies with a photo | `photo_rim_color` sampled at save | Smallest. Non-photo Halo copies stay one colour. |
| **B. Photo + owner's pick** (recommended) | A band when there's a sample or a pick; otherwise one colour, as today | Photo sample, else `rim_color` picked in the editor | A + one editor field and a validation tweak. Still no migration. |
| C. Default band colour | Every Halo copy gets a band | A fixed colour | Not defensible: the grid has no dominant band colour. |

**Recommendation: B.** Halo is a fact about Freddy's copy, so the band colour should come from his copy: the photo when there is one, his pick when there isn't, and nothing when neither exists. That is how the plate colour already works. No new column, no theme colour, no invented default.
