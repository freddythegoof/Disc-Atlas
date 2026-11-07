-- "Don't see a disc?" tips (docs/disc-request-form.md). Nothing reads these into the catalog: additions still go through
-- the reviewed data pipeline. Flight numbers are all-or-none; a row is not tied to an account.
CREATE TABLE disc_requests (
 id TEXT PRIMARY KEY,
 created_at INTEGER NOT NULL,
 disc_name TEXT NOT NULL CHECK(length(disc_name) BETWEEN 1 AND 120),
 manufacturer TEXT NOT NULL CHECK(length(manufacturer) BETWEEN 1 AND 80),
 speed REAL,
 glide REAL,
 turn REAL,
 fade REAL,
 link TEXT CHECK(link IS NULL OR length(link)<=500),
 note TEXT CHECK(note IS NULL OR length(note)<=500),
 email TEXT CHECK(email IS NULL OR length(email)<=254),
 status TEXT NOT NULL DEFAULT 'pending',
 CHECK((speed IS NULL)=(glide IS NULL) AND (speed IS NULL)=(turn IS NULL) AND (speed IS NULL)=(fade IS NULL))
);
CREATE INDEX disc_requests_status ON disc_requests(status,created_at);

-- The per-IP throttle. The key is a hash of the IP and the hour, so no address is stored and hours cannot be linked;
-- the Worker's cron deletes each hour's rows once it has passed.
CREATE TABLE disc_request_throttle (
 ip_hash TEXT PRIMARY KEY,
 hour INTEGER NOT NULL,
 count INTEGER NOT NULL
);
CREATE INDEX disc_request_throttle_hour ON disc_request_throttle(hour);
