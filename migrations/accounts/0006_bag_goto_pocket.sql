-- Extend the pocket constraint without reassigning existing copies. Local only.
CREATE TABLE bag_discs_next (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  mold_id TEXT NOT NULL,
  plastic TEXT NOT NULL CHECK(length(trim(plastic)) BETWEEN 1 AND 60),
  wear INTEGER NOT NULL CHECK(typeof(wear)='integer' AND wear BETWEEN 1 AND 10),
  weight_g INTEGER NOT NULL CHECK(typeof(weight_g)='integer' AND weight_g BETWEEN 130 AND 180),
  notes TEXT CHECK(notes IS NULL OR length(notes)<=240),
  added_at TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#e6c668' CHECK(length(color)=7 AND substr(color,1,1)='#' AND substr(color,2) NOT GLOB '*[^0-9a-fA-F]*'),
  in_bag INTEGER NOT NULL DEFAULT 1 CHECK(typeof(in_bag)='integer' AND in_bag IN (0,1)),
  pocket TEXT NOT NULL DEFAULT 'main' CHECK(pocket IN ('main','putter','goto')),
  stability_bias TEXT CHECK(stability_bias IS NULL OR stability_bias IN ('more_stable','less_stable')),
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK(typeof(sort_order)='integer' AND sort_order>=0)
);
INSERT INTO bag_discs_next(id,user_id,mold_id,plastic,wear,weight_g,notes,added_at,color,in_bag,pocket,stability_bias,sort_order)
SELECT id,user_id,mold_id,plastic,wear,weight_g,notes,added_at,color,in_bag,pocket,stability_bias,sort_order FROM bag_discs;
DROP TABLE bag_discs;
ALTER TABLE bag_discs_next RENAME TO bag_discs;
CREATE INDEX bag_discs_user_added ON bag_discs(user_id,added_at,id);
CREATE INDEX bag_discs_user_location ON bag_discs(user_id,in_bag,added_at,id);
