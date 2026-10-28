-- Per-disc stamp look (docs/stamp-look-extraction.md): the stamp ink and finish one copy wears, from the Appearance
-- sheet's curated sets (display-palette.js). NULL follows the Appearance setting, so every existing row looks as before.
ALTER TABLE bag_discs ADD COLUMN stamp_ink TEXT
 CHECK(stamp_ink IS NULL OR stamp_ink IN ('auto','black','white','gold','silver','copper','red','blue','green','violet','pink'));
ALTER TABLE bag_discs ADD COLUMN stamp_finish TEXT
 CHECK(stamp_finish IS NULL OR stamp_finish IN ('flat','foil','rainbow','shatter','spin'));
