-- Clear plastics (docs/clear-plastic-discs.md): the physical copy's finish. Every existing row is 'opaque', today's look.
ALTER TABLE bag_discs ADD COLUMN finish TEXT NOT NULL DEFAULT 'opaque' CHECK(finish IN ('opaque','clear'));
