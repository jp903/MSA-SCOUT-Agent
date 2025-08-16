-- Complete database schema fix
-- This will drop and recreate all tables with proper structure

-- Drop existing tables in correct order (foreign keys first)
DROP TABLE IF EXISTS property_images CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- Create properties table with UUID primary key
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    state VARCHAR(50) NOT NULL,
    purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    purchase_date DATE,
    current_value DECIMAL(12,2) NOT NULL DEFAULT 0,
    monthly_rent DECIMAL(10,2) NOT NULL DEFAULT 0,
    monthly_expenses DECIMAL(10,2) NOT NULL DEFAULT 0,
    down_payment DECIMAL(12,2) NOT NULL DEFAULT 0,
    loan_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    interest_rate DECIMAL(5,3) NOT NULL DEFAULT 0,
    loan_term_years INTEGER NOT NULL DEFAULT 30,
    property_type VARCHAR(50) NOT NULL DEFAULT 'single-family',
    status VARCHAR(50) NOT NULL DEFAULT 'analyzing',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create property_images table with UUID foreign key
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    size INTEGER NOT NULL DEFAULT 0,
    caption TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_state ON properties(state);
CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_primary ON property_images(is_primary);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at 
    BEFORE UPDATE ON properties 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO properties (
    name, address, state, purchase_price, purchase_date, current_value,
    monthly_rent, monthly_expenses, down_payment, loan_amount, interest_rate,
    loan_term_years, property_type, status, notes
) VALUES 
(
    'Sunset Villa',
    '123 Main Street, Anytown',
    'CA',
    450000.00,
    '2023-01-15',
    475000.00,
    3200.00,
    1200.00,
    90000.00,
    360000.00,
    6.5,
    30,
    'single-family',
    'owned',
    'Great starter property in growing neighborhood'
),
(
    'Downtown Condo',
    '456 Oak Avenue, Metro City',
    'TX',
    280000.00,
    '2023-06-01',
    295000.00,
    2400.00,
    800.00,
    56000.00,
    224000.00,
    7.0,
    30,
    'condo',
    'owned',
    'Modern condo with city views'
);

-- Verify the data was inserted
SELECT 'Properties created:' as message, count(*) as count FROM properties;
SELECT 'Sample property IDs:' as message, id, name FROM properties LIMIT 2;
</merged_code>
