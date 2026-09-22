-- Create guide_categories table for the Things To Do guide
CREATE TABLE IF NOT EXISTS guide_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL, -- lucide-react icon name, e.g. "Utensils", "Mountain", "Waves", "Camera"
    color TEXT NOT NULL DEFAULT '#2f8f5b', -- hex, used for map pins + filter chips
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_guide_categories_is_active ON guide_categories(is_active);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_guide_categories_updated_at
    BEFORE UPDATE ON guide_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE guide_categories IS 'Categories for the Things To Do guide (food, sightseeing, adventure, etc.)';
COMMENT ON COLUMN guide_categories.icon IS 'lucide-react icon name used in filters and map markers';
COMMENT ON COLUMN guide_categories.color IS 'Hex color for map pins and filter chips; chosen to read well on a light basemap';

-- Starter categories. Colors are saturated mid-darks so pins stay readable on a light map.
INSERT INTO guide_categories (name, slug, icon, color, sort_order, is_active) VALUES
('Food & Drink', 'food-drink', 'Utensils', '#c2410c', 0, true),
('Sightseeing', 'sightseeing', 'Camera', '#1d4ed8', 1, true),
('Adventure', 'adventure', 'Mountain', '#3f6212', 2, true),
('Beaches', 'beaches', 'Waves', '#0e7490', 3, true),
('Nightlife', 'nightlife', 'Martini', '#6d28d9', 4, true),
('Family Friendly', 'family-friendly', 'Users', '#a16207', 5, true),
('Shopping', 'shopping', 'ShoppingBag', '#9f1239', 6, true)
ON CONFLICT (slug) DO NOTHING;
