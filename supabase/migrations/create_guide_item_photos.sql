-- Create guide_item_photos table to store photos for Things To Do guide items
-- Depends on: create_guide_items.sql
CREATE TABLE IF NOT EXISTS guide_item_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guide_item_id UUID NOT NULL REFERENCES guide_items(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL, -- path within the guide-photos bucket
    url TEXT NOT NULL, -- public URL
    is_primary BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_guide_item_photos_guide_item_id ON guide_item_photos(guide_item_id);
CREATE INDEX IF NOT EXISTS idx_guide_item_photos_is_primary ON guide_item_photos(is_primary);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_guide_item_photos_updated_at
    BEFORE UPDATE ON guide_item_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE guide_item_photos IS 'Stores photos for Things To Do guide items in the guide-photos bucket';
COMMENT ON COLUMN guide_item_photos.storage_path IS 'Object path within the guide-photos storage bucket';
COMMENT ON COLUMN guide_item_photos.url IS 'Public URL for the photo';
COMMENT ON COLUMN guide_item_photos.is_primary IS 'Mark the main/cover photo for a guide item';
COMMENT ON COLUMN guide_item_photos.sort_order IS 'Display order of the photo';
