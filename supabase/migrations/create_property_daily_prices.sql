-- Create property_daily_prices table for per-date custom pricing overrides

CREATE TABLE IF NOT EXISTS property_daily_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES cached_properties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_custom BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, date)
);

-- Index for calendar lookups
CREATE INDEX IF NOT EXISTS idx_property_daily_prices_property_date
  ON property_daily_prices(property_id, date);

-- Trigger to keep updated_at current on updates
CREATE TRIGGER trigger_update_property_daily_prices_updated_at
  BEFORE UPDATE ON property_daily_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE property_daily_prices IS 'Stores custom nightly price overrides per property per date';
COMMENT ON COLUMN property_daily_prices.property_id IS 'Foreign key to cached_properties.id';
COMMENT ON COLUMN property_daily_prices.date IS 'The date this price applies to';
COMMENT ON COLUMN property_daily_prices.price IS 'Custom nightly price for this date';
COMMENT ON COLUMN property_daily_prices.is_custom IS 'Whether this is a manual override vs algorithm-generated';
