-- Halo v2 (docs/halo-band-v2.md): a Halo copy's band in two colours, sampled from its photo at save beside
-- photo_rim_color (the dye). '#rrggbb' (the wash) + 32 hex digits (16 dye-front radii). NULL keeps the v1
-- one-colour band: every existing row, until its photo is replaced or re-levelled. Cleared with the photo.
ALTER TABLE bag_discs ADD COLUMN photo_halo TEXT
 CHECK(photo_halo IS NULL OR (length(photo_halo)=39 AND substr(photo_halo,1,1)='#' AND substr(photo_halo,2) NOT GLOB '*[^0-9a-fA-F]*'));
