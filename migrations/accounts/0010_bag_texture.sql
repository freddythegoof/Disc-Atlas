-- Only a private object key lives on the physical copy. Existing copies remain unchanged.
ALTER TABLE bag_discs ADD COLUMN texture_key TEXT
 CHECK(texture_key IS NULL OR (length(texture_key)=41 AND substr(texture_key,37)='.webp' AND substr(texture_key,1,36) NOT GLOB '*[^a-f0-9-]*'));
CREATE UNIQUE INDEX bag_texture_key ON bag_discs(texture_key) WHERE texture_key IS NOT NULL;
-- Upload intent is recorded before R2; failed requests and deletes are retried by the Worker cron.
CREATE TABLE texture_cleanup (key TEXT PRIMARY KEY, not_before INTEGER NOT NULL DEFAULT 0);
CREATE TRIGGER bag_texture_replace AFTER UPDATE OF texture_key ON bag_discs
 WHEN OLD.texture_key IS NOT NULL AND OLD.texture_key IS NOT NEW.texture_key
 BEGIN INSERT OR IGNORE INTO texture_cleanup(key) VALUES(OLD.texture_key); END;
CREATE TRIGGER bag_texture_delete AFTER DELETE ON bag_discs WHEN OLD.texture_key IS NOT NULL
 BEGIN INSERT OR IGNORE INTO texture_cleanup(key) VALUES(OLD.texture_key); END;
