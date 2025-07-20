-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS property_images CASCADE;
DROP TABLE IF EXISTS chat_history CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS market_data CASCADE;

-- Create properties table
CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  purchase_price REAL,
  monthly_rent REAL,
  monthly_expenses REAL,
  down_payment REAL,
  interest_rate REAL,
  loan_term INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create property images table
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  size INTEGER NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat history table
CREATE TABLE chat_history (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    messages TEXT NOT NULL, -- JSON string of messages
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create market data table for storing market insights
CREATE TABLE market_data (
    id TEXT PRIMARY KEY,
    state TEXT NOT NULL,
    population_growth REAL,
    job_growth REAL,
    house_price_index_growth REAL,
    net_migration INTEGER,
    vacancy_rate REAL,
    international_inflows INTEGER,
    single_family_permits INTEGER,
    multi_family_permits INTEGER,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_is_primary ON property_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_data_state ON market_data(state);
CREATE INDEX IF NOT EXISTS idx_market_data_updated ON market_data(last_updated DESC);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_properties_updated_at
    AFTER UPDATE ON properties
    FOR EACH ROW
BEGIN
    UPDATE properties SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_chat_history_updated_at
    AFTER UPDATE ON chat_history
    FOR EACH ROW
BEGIN
    UPDATE chat_history SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Insert sample data
INSERT INTO properties (name, address, purchase_price, monthly_rent, monthly_expenses, down_payment, interest_rate, loan_term) VALUES
('Sunset Villa', '123 Main St, Austin, TX', 250000, 2200, 500, 50000, 0, 30),
('Downtown Condo', '456 Oak Ave, Miami, FL', 180000, 1800, 400, 36000, 0, 30),
('Riverside Duplex', '789 River Rd, Phoenix, AZ', 320000, 2800, 600, 64000, 0, 30)
ON CONFLICT DO NOTHING;

-- Insert sample market data
INSERT OR REPLACE INTO market_data (
    id, state, population_growth, job_growth, house_price_index_growth,
    net_migration, vacancy_rate, international_inflows, single_family_permits,
    multi_family_permits, last_updated
) VALUES 
    ('tx', 'Texas', 1.8, 3.2, 8.5, 45000, 3.8, 12000, 85000, 25000, CURRENT_TIMESTAMP),
    ('fl', 'Florida', 2.3, 3.5, 11.8, 85000, 3.2, 45000, 95000, 35000, CURRENT_TIMESTAMP),
    ('nv', 'Nevada', 2.1, 2.8, 12.3, 18000, 4.2, 3200, 15000, 8500, CURRENT_TIMESTAMP),
    ('ar', 'Arkansas', 0.8, 1.5, 6.8, 8500, 5.1, 1200, 12000, 2800, CURRENT_TIMESTAMP),
    ('al', 'Alabama', 0.6, 1.8, 7.2, 12000, 4.8, 1800, 18000, 4200, CURRENT_TIMESTAMP),
    ('ga', 'Georgia', 1.5, 2.9, 9.1, 35000, 4.1, 8500, 42000, 18000, CURRENT_TIMESTAMP);
