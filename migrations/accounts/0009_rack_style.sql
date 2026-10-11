-- The Storage racks' finish: a key from RACK_STYLES in public/bag-values.js. NULL follows the site theme.
ALTER TABLE bags ADD COLUMN rack_style TEXT
 CHECK(rack_style IS NULL OR (length(rack_style) BETWEEN 1 AND 24 AND rack_style NOT GLOB '*[^a-z-]*'));
