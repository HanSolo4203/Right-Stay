-- Create tour_packages table
CREATE TABLE IF NOT EXISTS tour_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    duration TEXT NOT NULL,
    max_participants INTEGER NOT NULL DEFAULT 1,
    location TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster searches
CREATE INDEX IF NOT EXISTS idx_tour_packages_name ON tour_packages(name);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_tour_packages_is_active ON tour_packages(is_active);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_tour_packages_updated_at
    BEFORE UPDATE ON tour_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample tour packages
INSERT INTO tour_packages (name, description, price, duration, max_participants, location, is_active) VALUES
('Table Mountain Hike', 'Experience breathtaking views of Cape Town from the iconic Table Mountain. Perfect for adventure seekers and nature lovers.', 850.00, '4 hours', 12, 'Cape Town, South Africa', true),
('Cape Peninsula Tour', 'Discover the stunning Cape Peninsula including Chapman''s Peak, Boulders Beach penguins, and Cape Point. A full day of unforgettable sights.', 1200.00, 'Full day (8 hours)', 15, 'Cape Peninsula, South Africa', true),
('Wine Tasting Tour', 'Explore the world-renowned Stellenbosch and Franschhoek wine routes. Sample premium wines and enjoy gourmet cuisine.', 950.00, '6 hours', 10, 'Stellenbosch, South Africa', true);

