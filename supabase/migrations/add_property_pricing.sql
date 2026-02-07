-- Add property_pricing table for dynamic pricing configuration

-- Ensure UUID extension is available (safe if already created)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create property_pricing table
CREATE TABLE IF NOT EXISTS property_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES cached_properties(id) ON DELETE CASCADE,
  min_price DECIMAL(10,2),
  base_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  pricing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure each property has at most one pricing configuration row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'property_pricing_property_id_key'
  ) THEN
    ALTER TABLE property_pricing
    ADD CONSTRAINT property_pricing_property_id_key UNIQUE (property_id);
  END IF;
END;
$$;

-- Index to quickly look up pricing by property_id
CREATE INDEX IF NOT EXISTS idx_property_pricing_property_id
  ON property_pricing(property_id);

-- Reuse the generic updated_at trigger function if present, otherwise create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to keep updated_at current on updates
CREATE TRIGGER trigger_update_property_pricing_updated_at
  BEFORE UPDATE ON property_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE property_pricing IS 'Stores dynamic pricing configuration (min/base/max prices, enabled flag) per property';
COMMENT ON COLUMN property_pricing.property_id IS 'Foreign key to cached_properties.id';
COMMENT ON COLUMN property_pricing.min_price IS 'Minimum allowed nightly price for this property';
COMMENT ON COLUMN property_pricing.base_price IS 'Base/target nightly price for this property';
COMMENT ON COLUMN property_pricing.max_price IS 'Maximum allowed nightly price for this property';
COMMENT ON COLUMN property_pricing.pricing_enabled IS 'Whether dynamic pricing rules are enabled for this property';
