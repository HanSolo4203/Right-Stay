-- Create cached_availability table for storing blocked dates from iCal feeds
-- This table stores availability data synced from external calendars (Airbnb, Booking.com, etc.)

CREATE TABLE IF NOT EXISTS cached_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL REFERENCES cached_properties(uplisting_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available BOOLEAN DEFAULT true,
  blocked_reason TEXT,
  price NUMERIC(10, 2),
  min_stay INTEGER,
  day_rate NUMERIC(10, 2),
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cached_availability_property_id ON cached_availability(property_id);
CREATE INDEX IF NOT EXISTS idx_cached_availability_date ON cached_availability(date);
CREATE INDEX IF NOT EXISTS idx_cached_availability_available ON cached_availability(available);
CREATE INDEX IF NOT EXISTS idx_cached_availability_property_date ON cached_availability(property_id, date);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER trigger_update_cached_availability_updated_at
  BEFORE UPDATE ON cached_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE cached_availability IS 'Stores availability data synced from external calendars (iCal feeds)';
COMMENT ON COLUMN cached_availability.property_id IS 'References cached_properties.uplisting_id';
COMMENT ON COLUMN cached_availability.date IS 'The date for this availability record';
COMMENT ON COLUMN cached_availability.available IS 'Whether the property is available on this date';
COMMENT ON COLUMN cached_availability.blocked_reason IS 'Reason for unavailability (e.g., booking summary from iCal)';
COMMENT ON COLUMN cached_availability.last_synced IS 'When this record was last synced from the iCal feed';


