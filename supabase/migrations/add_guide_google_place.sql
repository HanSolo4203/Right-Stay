-- Link guide places to a Google Place and remember which photos came from Google.
ALTER TABLE guide_items
    ADD COLUMN IF NOT EXISTS google_place_id TEXT,
    ADD COLUMN IF NOT EXISTS google_synced_at TIMESTAMP WITH TIME ZONE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_guide_items_google_place_id
    ON guide_items (google_place_id)
    WHERE google_place_id IS NOT NULL;

ALTER TABLE guide_item_photos
    ADD COLUMN IF NOT EXISTS google_photo_name TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_guide_item_photos_google_name
    ON guide_item_photos (guide_item_id, google_photo_name)
    WHERE google_photo_name IS NOT NULL;

COMMENT ON COLUMN guide_items.google_place_id IS 'Google Places ID used to import description and profile photos';
COMMENT ON COLUMN guide_items.google_synced_at IS 'When Google place copy and photos were last imported';
COMMENT ON COLUMN guide_item_photos.google_photo_name IS 'Stable Google photo id so re-imports skip duplicates';
