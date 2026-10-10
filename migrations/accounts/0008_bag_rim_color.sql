-- The existing color remains the flight plate. NULL keeps the viewer's automatic rim shade.
ALTER TABLE bag_discs ADD COLUMN rim_color TEXT
 CHECK(rim_color IS NULL OR (length(rim_color)=7 AND substr(rim_color,1,1)='#' AND substr(rim_color,2) NOT GLOB '*[^0-9a-fA-F]*'));
