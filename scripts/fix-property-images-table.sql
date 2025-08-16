-- Fix property_images table schema
-- Handle foreign key constraint issues

-- First, let's check and fix the properties table if needed
DO $$ 
BEGIN
    -- Ensure properties table exists with correct structure
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'properties') THEN
        CREATE TABLE properties (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            address TEXT NOT NULL,
            state VARCHAR(100) NOT NULL,
            purchase_price DECIMAL(12,2) NOT NULL,
            purchase_date DATE,
            current_value DECIMAL(12,2) NOT NULL,
            monthly_rent DECIMAL(10,2) DEFAULT 0,
            monthly_expenses DECIMAL(10,2) DEFAULT 0,
            down_payment DECIMAL(12,2) DEFAULT 0,
            loan_amount DECIMAL(12,2) DEFAULT 0,
            interest_rate DECIMAL(5,2) DEFAULT 0,
            loan_term_years INTEGER DEFAULT 30,
            property_type VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'analyzing',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Drop existing property_images table if it exists (to avoid constraint issues)
    DROP TABLE IF EXISTS property_images CASCADE;

    -- Create property_images table with proper foreign key
    CREATE TABLE property_images (
        id SERIAL PRIMARY KEY,
        property_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        size INTEGER DEFAULT 0,
        caption TEXT,
        is_primary BOOLEAN DEFAULT FALSE,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Add foreign key constraint only if properties table exists and has data
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'properties') THEN
        -- Add the foreign key constraint
        ALTER TABLE property_images 
        ADD CONSTRAINT property_images_property_id_fkey 
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;
    END IF;

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
    CREATE INDEX IF NOT EXISTS idx_property_images_is_primary ON property_images(is_primary);

END $$;
