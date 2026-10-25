-- The plastic's true colour, sampled from the photo's rim band on a one-piece mold (docs/clear-plastic-true-color.md).
-- NULL until a photo is matched for it; never inferred from `color`. Read only when the copy's finish is clear.
ALTER TABLE bag_discs ADD COLUMN photo_true_color TEXT
 CHECK(photo_true_color IS NULL OR (length(photo_true_color)=7 AND substr(photo_true_color,1,1)='#' AND substr(photo_true_color,2) NOT GLOB '*[^0-9a-fA-F]*'));
