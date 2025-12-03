-- Initial schema for Right Stay Africa
-- This migration sets up the basic tables needed for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create cached_properties table to store property data from external APIs
CREATE TABLE IF NOT EXISTS cached_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uplisting_id TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL, -- Store the full property data from API
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create property_photos table to store photos
CREATE TABLE IF NOT EXISTS property_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL REFERENCES cached_properties(uplisting_id) ON DELETE CASCADE,
  photo_id TEXT NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  position INTEGER,
  is_primary BOOLEAN DEFAULT false,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cached_properties_uplisting_id ON cached_properties(uplisting_id);
CREATE INDEX IF NOT EXISTS idx_cached_properties_last_synced ON cached_properties(last_synced);
CREATE INDEX IF NOT EXISTS idx_property_photos_property_id ON property_photos(property_id);
CREATE INDEX IF NOT EXISTS idx_property_photos_is_primary ON property_photos(is_primary);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at timestamps
CREATE TRIGGER trigger_update_cached_properties_updated_at
  BEFORE UPDATE ON cached_properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_property_photos_updated_at
  BEFORE UPDATE ON property_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE cached_properties IS 'Stores cached property data from external APIs';
COMMENT ON TABLE property_photos IS 'Stores property photos with metadata';
