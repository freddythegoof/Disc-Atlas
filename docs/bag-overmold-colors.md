# Bag and Storage overmold colors

The shared disc editor uses `isOvermold()` with the catalog manufacturer and record name. Verified overmolds show Flight plate and Overmold rim color inputs in the existing field style. Other molds keep Disc color.

`bag_discs.color` remains the plate color. Migration `0008_bag_rim_color.sql` adds a nullable, validated `rim_color`; apply this migration before deploying the updated worker. NULL preserves the viewer's automatic rim shade. The rim follows plate or plastic color changes until the player chooses a rim color. Existing PUT clients that omit `rim_color` preserve the saved override; storage moves preserve both colors.

The bag detail panel passes the selected physical copy's plate and rim to the existing 3D viewer's `colors` option. The viewer, overmold list, color API and generic name stamps are unchanged.

Verify with `npm run test:bag` and `npm run test:bag:overmold`. The latter uses local Wrangler/D1 and the signed Google fixture, checks the real 3D materials, reload persistence, Storage editing, Destroyer and Streamline Pilot, and desktop/360px layouts in four themes. Set `PLAYWRIGHT_MODULE` to an available Playwright installation when needed. Review images are written to `outputs/bag-overmold`.
