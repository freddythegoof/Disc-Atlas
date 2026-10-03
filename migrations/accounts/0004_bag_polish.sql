-- V1.1: physical disc colors/storage and independently counted bag pockets.
ALTER TABLE bag_discs ADD COLUMN color TEXT NOT NULL DEFAULT '#e6c668' CHECK(length(color)=7 AND substr(color,1,1)='#' AND substr(color,2) NOT GLOB '*[^0-9a-fA-F]*');
ALTER TABLE bag_discs ADD COLUMN in_bag INTEGER NOT NULL DEFAULT 1 CHECK(typeof(in_bag)='integer' AND in_bag IN (0,1));
ALTER TABLE bags ADD COLUMN bag_color TEXT NOT NULL DEFAULT '#343c49' CHECK(length(bag_color)=7 AND substr(bag_color,1,1)='#' AND substr(bag_color,2) NOT GLOB '*[^0-9a-fA-F]*');
ALTER TABLE bags ADD COLUMN main_capacity INTEGER NOT NULL DEFAULT 20 CHECK(typeof(main_capacity)='integer' AND main_capacity BETWEEN 0 AND 500);
ALTER TABLE bags ADD COLUMN putter_capacity INTEGER NOT NULL DEFAULT 0 CHECK(typeof(putter_capacity)='integer' AND putter_capacity BETWEEN 0 AND 500);
ALTER TABLE bags ADD COLUMN extra_capacity INTEGER NOT NULL DEFAULT 0 CHECK(typeof(extra_capacity)='integer' AND extra_capacity BETWEEN 0 AND 500);
-- Preserve custom/unverified capacities exactly; researched models gain true totals.
UPDATE bags SET main_capacity=capacity;
UPDATE bags SET capacity=24,main_capacity=20,putter_capacity=4,extra_capacity=0 WHERE bag_model='Dynamic Discs Commander';
UPDATE bags SET capacity=22,main_capacity=18,putter_capacity=4,extra_capacity=0 WHERE bag_model='Dynamic Discs Trooper';
UPDATE bags SET capacity=24,main_capacity=18,putter_capacity=2,extra_capacity=4 WHERE bag_model='Dynamic Discs Paratrooper';
UPDATE bags SET capacity=22,main_capacity=20,putter_capacity=2,extra_capacity=0 WHERE bag_model='Dynamic Discs Ranger';
UPDATE bags SET capacity=21,main_capacity=18,putter_capacity=3,extra_capacity=0 WHERE bag_model='Grip BX3';
UPDATE bags SET capacity=28,main_capacity=22,putter_capacity=4,extra_capacity=2 WHERE bag_model='Grip AX5';
UPDATE bags SET capacity=32,main_capacity=20,putter_capacity=6,extra_capacity=6 WHERE bag_model='Pound Octothorpe';
UPDATE bags SET capacity=20,main_capacity=18,putter_capacity=2,extra_capacity=0 WHERE bag_model='MVP Voyager';
UPDATE bags SET capacity=20,main_capacity=18,putter_capacity=2,extra_capacity=0 WHERE bag_model='MVP Voyager Lite';
UPDATE bags SET capacity=12,main_capacity=10,putter_capacity=2,extra_capacity=0 WHERE bag_model='Infinite Sling';
CREATE INDEX bag_discs_user_location ON bag_discs(user_id,in_bag,added_at,id);
