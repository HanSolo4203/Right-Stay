-- Create guide_items table for the Things To Do guide
-- Depends on: create_guide_categories.sql
CREATE TABLE IF NOT EXISTS guide_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES guide_categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT NOT NULL, -- for map popups/cards, keep it short
    description TEXT NOT NULL, -- full detail panel copy
    address TEXT,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    price_level TEXT CHECK (price_level IN ('free', '$', '$$', '$$$')) DEFAULT '$$',
    website_url TEXT,
    booking_url TEXT,
    phone TEXT,
    tags TEXT[] DEFAULT '{}',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on category_id for joining/filtering by category
CREATE INDEX IF NOT EXISTS idx_guide_items_category_id ON guide_items(category_id);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_guide_items_is_active ON guide_items(is_active);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_guide_items_updated_at
    BEFORE UPDATE ON guide_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE guide_items IS 'Places and activities in the Things To Do guide';
COMMENT ON COLUMN guide_items.short_description IS 'Short copy for map popups and cards';
COMMENT ON COLUMN guide_items.description IS 'Full detail panel copy';
COMMENT ON COLUMN guide_items.price_level IS 'Relative price: free, $, $$, or $$$';
