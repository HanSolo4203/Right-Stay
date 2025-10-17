-- Create property_photos table to store photos from Uplisting API
CREATE TABLE IF NOT EXISTS property_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT NOT NULL REFERENCES cached_properties(uplisting_id) ON DELETE CASCADE,
  photo_id TEXT NOT NULL, -- The photo ID from Uplisting
  url TEXT NOT NULL, -- The photo URL
  caption TEXT,
  position INTEGER, -- Order of the photo
  is_primary BOOLEAN DEFAULT false, -- Mark the main/cover photo
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_property_photos_property_id ON property_photos(property_id);
CREATE INDEX IF NOT EXISTS idx_property_photos_is_primary ON property_photos(is_primary);
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_photos_photo_id ON property_photos(photo_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_property_photos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_property_photos_updated_at
  BEFORE UPDATE ON property_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_property_photos_updated_at();

-- Add comment
COMMENT ON TABLE property_photos IS 'Stores property photos fetched from Uplisting API';

