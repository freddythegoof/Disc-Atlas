-- One active bag per Google account; one row per physical disc.
CREATE TABLE bags (
  user_id TEXT PRIMARY KEY NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  bag_model TEXT NOT NULL CHECK(length(trim(bag_model)) BETWEEN 1 AND 80),
  capacity INTEGER NOT NULL CHECK(typeof(capacity) = 'integer' AND capacity BETWEEN 1 AND 500),
  updated_at TEXT NOT NULL
);

CREATE TABLE bag_discs (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  -- Catalog is a bundled JSON asset, not a D1 table. The API validates this reference.
  mold_id TEXT NOT NULL,
  plastic TEXT NOT NULL CHECK(length(trim(plastic)) BETWEEN 1 AND 60),
  wear INTEGER NOT NULL CHECK(typeof(wear) = 'integer' AND wear BETWEEN 1 AND 10),
  weight_g INTEGER NOT NULL CHECK(typeof(weight_g) = 'integer' AND weight_g BETWEEN 130 AND 180),
  notes TEXT CHECK(notes IS NULL OR length(notes) <= 240),
  added_at TEXT NOT NULL
);
CREATE INDEX bag_discs_user_added ON bag_discs(user_id, added_at, id);
