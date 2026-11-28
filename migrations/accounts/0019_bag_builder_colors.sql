-- Builder colors are per bag. NULL leaves existing bags on the neutral illustration.
ALTER TABLE bags ADD COLUMN bag_body_color TEXT
 CHECK(bag_body_color IS NULL OR bag_body_color GLOB '#[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]');
ALTER TABLE bags ADD COLUMN bag_secondary_color TEXT
 CHECK(bag_secondary_color IS NULL OR bag_secondary_color GLOB '#[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]');
ALTER TABLE bags ADD COLUMN bag_trim_color TEXT
 CHECK(bag_trim_color IS NULL OR bag_trim_color GLOB '#[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]');
