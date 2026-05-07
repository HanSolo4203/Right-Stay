-- Add per-property booking fees used in checkout pricing.
ALTER TABLE property_pricing
ADD COLUMN IF NOT EXISTS cleaning_fee DECIMAL(10,2) DEFAULT 450;

ALTER TABLE property_pricing
ADD COLUMN IF NOT EXISTS service_fee_percent DECIMAL(5,2) DEFAULT 5;

COMMENT ON COLUMN property_pricing.cleaning_fee IS 'Flat cleaning fee applied per booking for this property.';
COMMENT ON COLUMN property_pricing.service_fee_percent IS 'Service fee percentage applied to accommodation total for this property.';
