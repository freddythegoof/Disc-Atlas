-- Automatic photo match is independent of the player's explicit rim_color.
-- Existing photos keep NULL until replaced/reapplied; never infer a user override.
ALTER TABLE bag_discs ADD COLUMN photo_rim_color TEXT
 CHECK(photo_rim_color IS NULL OR (length(photo_rim_color)=7 AND substr(photo_rim_color,1,1)='#' AND substr(photo_rim_color,2) NOT GLOB '*[^0-9a-fA-F]*'));
