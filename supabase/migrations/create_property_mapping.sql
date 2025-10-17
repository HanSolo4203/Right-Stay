-- Create property mapping table to link Uplisting properties to apartments
CREATE TABLE IF NOT EXISTS property_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uplisting_property_id TEXT NOT NULL UNIQUE,
    apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_property_mapping_uplisting_id ON property_mapping(uplisting_property_id);
CREATE INDEX IF NOT EXISTS idx_property_mapping_apartment_id ON property_mapping(apartment_id);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_property_mapping_updated_at
    BEFORE UPDATE ON property_mapping
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert the specific mapping for property 135133 -> apartment 202
-- First, let's find the apartment with number 202
INSERT INTO property_mapping (uplisting_property_id, apartment_id)
SELECT '135133', id 
FROM apartments 
WHERE apartment_number = '202'
ON CONFLICT (uplisting_property_id) DO UPDATE SET
    apartment_id = EXCLUDED.apartment_id,
    updated_at = NOW();

-- Add comment
COMMENT ON TABLE property_mapping IS 'Maps Uplisting property IDs to internal apartment IDs';
COMMENT ON COLUMN property_mapping.uplisting_property_id IS 'Uplisting property ID (e.g., 135133)';
COMMENT ON COLUMN property_mapping.apartment_id IS 'Internal apartment UUID reference';
