# Gone But Not Forgotten

Lost discs remain physical copies in `bag_discs`. Migration `0007_lost_discs.sql` adds `status` (`active` or `lost`) and nullable `lostDate`, `lostCourse`, `lostHole`, `lostStory` fields. Existing active bag and Storage rows default to `active` without changing their details or location.

`PATCH /api/bag/discs/:id` accepts `{status:"lost", lostDate:"YYYY-MM-DD", lostCourse?, lostHole?, lostStory?}`. Date is required; course is at most 160 characters, hole is an integer from 1 to 999, and story is at most 1200 characters. Optional blank text becomes null. Lost copies have `in_bag=false`, enforced by the database, and remain separate from Storage in the UI. Counts, physical bag slots, bag colors, and My Map therefore exclude them through their existing bag filters.

`PATCH` with `{status:"active"}` restores a lost copy to the bag and clears its loss metadata. Its ID, plastic, weight, wear, notes, color, pocket, stability note, ordering, and creation time are preserved. Other edits cannot accidentally restore it. Confirmed removal uses the existing owner-scoped `DELETE` and removes the whole physical-disc row. Account deletion retains its cascade. There is no public listing or separate memorial table.

Run `npm run test:bag` for migration and endpoint checks, and `npm run test:bag:memorial` for the real local Wrangler/D1 browser flow. Set `PLAYWRIGHT_MODULE` to an existing Playwright installation if needed. The browser suite owns `work/bag-memorial/d1-qa` and saves populated and empty wall screenshots at 1440px and 360px for Light, Midnight, Charcoal, and Black to `outputs/bag-memorial/screenshots.html`.

The migration has been applied only to isolated local test databases. Apply it to the deployment database before deploying the new worker. This change does not deploy or push.

Verification: 49 bag unit tests and 20 related account, coach, and personal-map unit tests passed. The memorial, existing My Bag, and existing My Map browser suites passed. The memorial suite covers full and required-only forms, failed-save retry, keyboard focus, persistence after reload, Found/Remove serialization, complete restoration, permanent removal, and map/count exclusions. All 16 wall screenshots and the phone form were visually reviewed. Changed JavaScript files pass lint with zero warnings. Repository-wide lint reports 40 existing errors in the unmodified Three.js vendor files (`GLTFLoader.js`, `three.core.min.js`, `three.module.min.js`), plus existing warnings.
