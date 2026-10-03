CREATE TABLE atlas_coach_usage (
 user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
 day TEXT NOT NULL,
 count INTEGER NOT NULL CHECK (count BETWEEN 0 AND 20),
 PRIMARY KEY (user_id, day)
);

-- Integer millionths of a US dollar. In-flight/uncertain requests remain reserved.
CREATE TABLE atlas_coach_budget (
 month TEXT PRIMARY KEY NOT NULL,
 used_microusd INTEGER NOT NULL DEFAULT 0 CHECK (used_microusd >= 0),
 disabled INTEGER NOT NULL DEFAULT 0 CHECK (disabled IN (0, 1))
);
