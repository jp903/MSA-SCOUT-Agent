-- Fix properties table schema
-- Add missing columns if they don't exist

-- Add purchase_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'purchase_date') THEN
        ALTER TABLE properties ADD COLUMN purchase_date DATE;
    END IF;
END $$;

-- Add monthly_rent column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'monthly_rent') THEN
        ALTER TABLE properties ADD COLUMN monthly_rent DECIMAL(12,2) DEFAULT 0;
    END IF;
END $$;

-- Add monthly_expenses column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'monthly_expenses') THEN
        ALTER TABLE properties ADD COLUMN monthly_expenses DECIMAL(12,2) DEFAULT 0;
    END IF;
END $$;

-- Add down_payment column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'down_payment') THEN
        ALTER TABLE properties ADD COLUMN down_payment DECIMAL(12,2) DEFAULT 0;
    END IF;
END $$;

-- Add loan_amount column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'loan_amount') THEN
        ALTER TABLE properties ADD COLUMN loan_amount DECIMAL(12,2) DEFAULT 0;
    END IF;
END $$;

-- Add interest_rate column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'interest_rate') THEN
        ALTER TABLE properties ADD COLUMN interest_rate DECIMAL(5,3) DEFAULT 0;
    END IF;
END $$;

-- Add loan_term_years column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'loan_term_years') THEN
        ALTER TABLE properties ADD COLUMN loan_term_years INTEGER DEFAULT 30;
    END IF;
END $$;

-- Add property_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'property_type') THEN
        ALTER TABLE properties ADD COLUMN property_type VARCHAR(50) DEFAULT 'single-family';
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'status') THEN
        ALTER TABLE properties ADD COLUMN status VARCHAR(20) DEFAULT 'analyzing';
    END IF;
END $$;

-- Add notes column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'notes') THEN
        ALTER TABLE properties ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Create property_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS property_images (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    size INTEGER NOT NULL,
    caption TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_is_primary ON property_images(is_primary);

-- Update existing properties with default values if needed
UPDATE properties 
SET 
    monthly_rent = COALESCE(monthly_rent, 0),
    monthly_expenses = COALESCE(monthly_expenses, 0),
    down_payment = COALESCE(down_payment, 0),
    loan_amount = COALESCE(loan_amount, 0),
    interest_rate = COALESCE(interest_rate, 0),
    loan_term_years = COALESCE(loan_term_years, 30),
    property_type = COALESCE(property_type, 'single-family'),
    status = COALESCE(status, 'analyzing')
WHERE 
    monthly_rent IS NULL OR 
    monthly_expenses IS NULL OR 
    down_payment IS NULL OR 
    loan_amount IS NULL OR 
    interest_rate IS NULL OR 
    loan_term_years IS NULL OR 
    property_type IS NULL OR 
    status IS NULL;
