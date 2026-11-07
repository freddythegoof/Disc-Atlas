-- Clear finish opacity (docs/clear-opacity.md): how clear to opaque one clear copy is, 0 (the most transparent the renderer
-- draws) to 100 (opaque). NULL is today's clear look; every existing row reads NULL and draws as before. Read only when the
-- copy's finish is clear, and always NULL when it is opaque.
ALTER TABLE bag_discs ADD COLUMN finish_opacity INTEGER
 CHECK(finish_opacity IS NULL OR (typeof(finish_opacity)='integer' AND finish_opacity BETWEEN 0 AND 100));
