-- Photo stamps v3 (docs/photo-stamp-sync.md): a bag disc's generated stamp assets and its Look belong to the account,
-- not the browser. One row per disc, for the photo version (texture_key) the assets were read from; the bytes live in
-- the private textures bucket under stamp/<uuid>.png|webp. `ink` is the one-ink game asset (layered: an illustrated
-- stamp's fills, lines and solid elements), `color` the optional full-colour asset; look 'color' needs one.
CREATE TABLE bag_photo_stamps (
  disc_id TEXT PRIMARY KEY NOT NULL REFERENCES bag_discs(id) ON DELETE CASCADE,
  texture_key TEXT NOT NULL,
  look TEXT NOT NULL CHECK(look IN ('photo','asset','color')),
  rev TEXT NOT NULL CHECK(length(rev) BETWEEN 1 AND 16 AND rev NOT GLOB '*[^a-z0-9]*'),
  ink_key TEXT NOT NULL UNIQUE CHECK(ink_key GLOB 'stamp/*' AND (ink_key GLOB '*.png' OR ink_key GLOB '*.webp')),
  ink_diameter REAL NOT NULL CHECK(ink_diameter>0 AND ink_diameter<=1),
  ink_fraction REAL NOT NULL CHECK(ink_fraction>0 AND ink_fraction<=1 AND ink_diameter<=ink_fraction),
  layered INTEGER NOT NULL DEFAULT 0 CHECK(layered IN (0,1)),
  color_key TEXT UNIQUE CHECK(color_key IS NULL OR (color_key GLOB 'stamp/*' AND (color_key GLOB '*.png' OR color_key GLOB '*.webp'))),
  color_diameter REAL CHECK(color_diameter IS NULL OR (color_diameter>0 AND color_diameter<=1)),
  color_fraction REAL CHECK(color_fraction IS NULL OR (color_fraction>0 AND color_fraction<=1 AND color_diameter<=color_fraction)),
  updated_at TEXT NOT NULL,
  CHECK((color_key IS NULL)=(color_diameter IS NULL) AND (color_key IS NULL)=(color_fraction IS NULL)),
  CHECK(look<>'color' OR color_key IS NOT NULL)
);
-- The assets belong to one photo: a replaced or removed photo takes them with it.
CREATE TRIGGER bag_photo_stamp_photo AFTER UPDATE OF texture_key ON bag_discs
 WHEN OLD.texture_key IS NOT NEW.texture_key
 BEGIN DELETE FROM bag_photo_stamps WHERE disc_id=NEW.id; END;
-- Detached bytes join the textures' cleanup queue (0010), which the Worker cron drains.
CREATE TRIGGER bag_photo_stamp_replace AFTER UPDATE OF ink_key,color_key ON bag_photo_stamps
 BEGIN
  INSERT OR IGNORE INTO texture_cleanup(key) SELECT OLD.ink_key WHERE OLD.ink_key IS NOT NEW.ink_key;
  INSERT OR IGNORE INTO texture_cleanup(key) SELECT OLD.color_key WHERE OLD.color_key IS NOT NULL AND OLD.color_key IS NOT NEW.color_key;
 END;
CREATE TRIGGER bag_photo_stamp_delete AFTER DELETE ON bag_photo_stamps
 BEGIN
  INSERT OR IGNORE INTO texture_cleanup(key) VALUES(OLD.ink_key);
  INSERT OR IGNORE INTO texture_cleanup(key) SELECT OLD.color_key WHERE OLD.color_key IS NOT NULL;
 END;
