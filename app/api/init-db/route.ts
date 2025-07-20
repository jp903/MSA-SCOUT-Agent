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
        name TEXT NOT NULL DEFAULT '',
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        property_type TEXT,
        bedrooms INTEGER,
        bathrooms DECIMAL,
        square_feet INTEGER,
        lot_size DECIMAL,
        year_built INTEGER,
        purchase_price DECIMAL,
        current_value DECIMAL,
        monthly_rent DECIMAL,
        expenses JSONB DEFAULT '{}',
        notes TEXT,
        loan_amount DECIMAL,
        loan_term INTEGER,
        interest_rate DECIMAL,
        monthly_payment DECIMAL,
        down_payment DECIMAL,
        closing_costs DECIMAL,
        renovation_costs DECIMAL,
        monthly_insurance DECIMAL,
        monthly_taxes DECIMAL,
        monthly_hoa DECIMAL,
        vacancy_rate DECIMAL,
        management_fee_percent DECIMAL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS property_images (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        original_name TEXT,
        mime_type TEXT,
        size_bytes INTEGER,
        width INTEGER,
        height INTEGER,
        url TEXT,
        thumbnail_url TEXT,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS chat_history (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL DEFAULT 'New Chat',
        messages JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS market_data (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        state TEXT NOT NULL,
        population_growth DECIMAL,
        job_growth DECIMAL,
        house_price_index_growth DECIMAL,
        net_migration INTEGER,
        vacancy_rate DECIMAL,
        international_inflows INTEGER,
        single_family_permits INTEGER,
        multi_family_permits INTEGER,
        data_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(state, data_date)
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
    })
  } catch (error) {
    console.error("❌ DB init error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
