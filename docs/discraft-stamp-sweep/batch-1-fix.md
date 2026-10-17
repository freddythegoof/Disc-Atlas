# Batch 1 review fix — October 16, 2026

Freddy confirmed the Zone GT design belongs to **Zone GT (Banger Top)** (`4a6dfb045c65`), but rejected this extraction on quality. The production PNG and source-manifest assignment are removed; prepare restores the generated fallback. The recon source URLs, dimensions, notes, placement history and confirmed identity evidence remain intact, with the rejected extraction recorded separately. This is an extraction rejection, not a mold rejection. **Force is approved.**

**Current shipment: 14 Batch 1 stamps, 1,272.709 KB; 17 stamps including the pilot.** The original Batch 1 proof captures remain historical evidence. No other extraction was changed or regenerated; Batch 2 and the risky entries are untouched.

Checks after the pull:

- `python -B -X utf8 prepare_data.py` followed by `validate_data.py`: clean, 2,434 approval records and 17 stamp assignments. Generated data was not edited by hand.
- Exact comparison with `b0686ac`: the only catalog change is removal of Banger Top's `stampAsset`. All 2,434 identities, metadata and other fields are unchanged. Banger Top's complete record matches `771e8da`, before Batch 1.
- All 17 remaining PNGs are byte-identical to `b0686ac`; every other source assignment and recon object is unchanged. Renderer files are unchanged.
- Stamp-manifest/brand/rights tests: **7 / 7 pass**.
- Production-browser spot check: Banger Top's rendered stamp texture and plate colour exactly match its pre-Batch-1 generated fallback. **Force, Avenger and Comet** retain their exact Batch 1 stamp textures, asset paths and plate colours. Non-Discraft brand assignment is rejected; zero requests for the removed asset; no page errors.
- The existing Batch 1 browser suite passes with **14 own-mold assignments and 6 controls**, including Banger Top as a fallback control. Captures were redirected to ignored output, preserving the historical proof images. One initial Zone screenshot exceeded the existing changed-pixel count tolerance (184 / 95,700 pixels, maximum channel delta 1); a single unchanged rerun passed. No tolerance or renderer change was made.

One local commit after `b0686ac`; no push.
