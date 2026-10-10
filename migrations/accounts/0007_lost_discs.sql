-- Lost copies remain in the owner's collection, with their physical details intact.
ALTER TABLE bag_discs ADD COLUMN lostDate TEXT CHECK(lostDate IS NULL OR (length(lostDate)=10 AND lostDate GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'));
ALTER TABLE bag_discs ADD COLUMN lostCourse TEXT CHECK(lostCourse IS NULL OR length(lostCourse)<=160);
ALTER TABLE bag_discs ADD COLUMN lostHole INTEGER CHECK(lostHole IS NULL OR (typeof(lostHole)='integer' AND lostHole BETWEEN 1 AND 999));
ALTER TABLE bag_discs ADD COLUMN lostStory TEXT CHECK(lostStory IS NULL OR length(lostStory)<=1200);
ALTER TABLE bag_discs ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
 CHECK(status IN ('active','lost') AND (status!='lost' OR (lostDate IS NOT NULL AND in_bag=0)));
