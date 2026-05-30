-- Property amenities are stored on each listing as a JSON string array at:
--   cached_properties.data -> 'attributes' -> 'amenities'
-- Example: ["WiFi", "Air Conditioning", "Parking"]
--
-- No separate column is required; existing rows without this key continue to work.
-- Optional GIN index for admin/reporting queries on amenity presence:

CREATE INDEX IF NOT EXISTS idx_cached_properties_attributes_amenities
  ON cached_properties
  USING GIN ((data -> 'attributes' -> 'amenities'));

COMMENT ON INDEX idx_cached_properties_attributes_amenities IS
  'Supports filtering listings by amenities JSON array in data.attributes';
