-- Update existing tables to link with users
-- Add user_id to chat_history if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chat_history' AND column_name = 'user_id') THEN
        ALTER TABLE chat_history ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add user_id to portfolio_properties if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_properties' AND column_name = 'user_id') THEN
        ALTER TABLE portfolio_properties ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add user_id to property_images if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'property_images' AND column_name = 'user_id') THEN
        ALTER TABLE property_images ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for user relationships
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_properties_user_id ON portfolio_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_property_images_user_id ON property_images(user_id);
