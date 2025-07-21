import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

async function runStatements(statements: string[]) {
  for (const statement of statements) {
    if (statement.trim()) {
      console.log("🔧 Executing:", statement.substring(0, 100) + "...")
      await sql.unsafe(statement)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Starting database initialization...")

    // Enable UUID extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`

    console.log("✅ Extensions enabled")

    // Drop existing triggers first to avoid conflicts
    const dropTriggers = [
      "DROP TRIGGER IF EXISTS update_properties_updated_at ON properties",
      "DROP TRIGGER IF EXISTS update_property_images_updated_at ON property_images",
      "DROP TRIGGER IF EXISTS update_chat_history_updated_at ON chat_history",
      "DROP TRIGGER IF EXISTS update_market_data_updated_at ON market_data",
    ]

    await runStatements(dropTriggers)
    console.log("✅ Existing triggers dropped")

    // Create tables
    const createTables = [
      `CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT,
        price DECIMAL(12,2),
        bedrooms INTEGER,
        bathrooms DECIMAL(3,1),
        square_feet INTEGER,
        lot_size DECIMAL(10,2),
        year_built INTEGER,
        property_type TEXT,
        listing_status TEXT DEFAULT 'active',
        description TEXT,
        features JSONB DEFAULT '[]'::jsonb,
        analysis_data JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS property_images (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        image_type TEXT DEFAULT 'photo',
        caption TEXT,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS chat_history (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL DEFAULT 'New Chat',
        messages JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS market_data (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        state TEXT NOT NULL,
        city TEXT,
        population_growth DECIMAL(5,2),
        job_growth DECIMAL(5,2),
        house_price_index_growth DECIMAL(5,2),
        net_migration INTEGER,
        vacancy_rate DECIMAL(5,2),
        international_inflows INTEGER,
        single_family_permits INTEGER,
        multi_family_permits INTEGER,
        data_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
    ]

    await runStatements(createTables)
    console.log("✅ Tables created")

    // Add missing columns to existing tables
    const alterTables = [
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT ''",
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS city TEXT",
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS loan_amount DECIMAL",
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS loan_term INTEGER",
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS interest_rate DECIMAL",
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS monthly_payment DECIMAL",
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS down_payment DECIMAL",
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS closing_costs DECIMAL",
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS renovation_costs DECIMAL",
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS monthly_insurance DECIMAL",
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS monthly_taxes DECIMAL",
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS monthly_hoa DECIMAL",
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS vacancy_rate DECIMAL",
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS management_fee_percent DECIMAL",
      "ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'New Chat'",
      "ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS messages JSONB NOT NULL DEFAULT '[]'::jsonb",
      "ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS analysis_data JSONB DEFAULT '{}'::jsonb",
      "ALTER TABLE properties ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb",
      "ALTER TABLE market_data ADD COLUMN IF NOT EXISTS data_date DATE DEFAULT CURRENT_DATE",
    ]

    await runStatements(alterTables)
    console.log("✅ Table columns updated")

    // Create indexes
    const createIndexes = [
      "CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state)",
      "CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city)",
      "CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type)",
      "CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id)",
      "CREATE INDEX IF NOT EXISTS idx_property_images_is_primary ON property_images(is_primary)",
      "CREATE INDEX IF NOT EXISTS idx_chat_history_updated_at ON chat_history(updated_at DESC)",
      "CREATE INDEX IF NOT EXISTS idx_market_data_state ON market_data(state)",
      "CREATE INDEX IF NOT EXISTS idx_market_data_date ON market_data(data_date DESC)",
      "CREATE INDEX IF NOT EXISTS idx_properties_state_city ON properties(state, city)",
      "CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price)",
      "CREATE INDEX IF NOT EXISTS idx_market_data_date ON market_data(data_date DESC)",
    ]

    await runStatements(createIndexes)
    console.log("✅ Indexes created")

    // Create updated_at trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `

    // Create triggers
    const createTriggers = [
      `CREATE TRIGGER update_properties_updated_at
       BEFORE UPDATE ON properties
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

      `CREATE TRIGGER update_property_images_updated_at
       BEFORE UPDATE ON property_images
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

      `CREATE TRIGGER update_chat_history_updated_at
       BEFORE UPDATE ON chat_history
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

      `CREATE TRIGGER update_market_data_updated_at
       BEFORE UPDATE ON market_data
       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
    ]

    await runStatements(createTriggers)
    console.log("✅ Triggers created")

    // Insert sample data
    const sampleData = [
      `INSERT INTO properties (
        name, address, city, state, zip_code, property_type, bedrooms, bathrooms, 
        square_feet, purchase_price, current_value, monthly_rent
      ) VALUES (
        'Sunset Villa', '123 Main St', 'Austin', 'TX', '78701', 'Single Family', 
        3, 2.5, 1800, 350000, 380000, 2800
      ) ON CONFLICT DO NOTHING`,

      `INSERT INTO properties (
        name, address, city, state, zip_code, property_type, bedrooms, bathrooms, 
        square_feet, purchase_price, current_value, monthly_rent
      ) VALUES (
        'Downtown Condo', '456 Oak Ave', 'Miami', 'FL', '33101', 'Condo', 
        2, 2, 1200, 280000, 320000, 2400
      ) ON CONFLICT DO NOTHING`,
    ]

    await runStatements(sampleData)
    console.log("✅ Sample data inserted")

    console.log("🎉 Database initialization completed successfully!")

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ DB init error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
