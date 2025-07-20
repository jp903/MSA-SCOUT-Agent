import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

/**
 * Execute a list of raw SQL commands sequentially (⚠ one command per string!).
 */
async function runAll(stmts: string[]) {
  for (const s of stmts) {
    const text = s.trim()
    if (text.length === 0) continue
    await sql.unsafe(text)
  }
}

export async function POST(_req: NextRequest) {
  try {
    console.log("🚀 Starting database initialization...")

    /* ─────────────────────  ENV CHECK  ───────────────────── */
    const url = process.env.DATABASE_URL
    if (!url) {
      console.warn("DATABASE_URL missing – skipping DB init")
      return NextResponse.json({
        success: true,
        message: "Skipped (no DATABASE_URL)",
      })
    }

    /* ─────────────────────  DDL  ─────────────────────────── */
    // Enable UUID extension first
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
    console.log("✅ UUID extension enabled")

    // Enable pgcrypto for gen_random_uuid()
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`
    console.log("✅ pgcrypto extension enabled")

    // Properties table
    await sql`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT,
        property_type TEXT NOT NULL,
        purchase_price DECIMAL(12,2) NOT NULL,
        current_value DECIMAL(12,2),
        monthly_rent DECIMAL(10,2),
        monthly_expenses DECIMAL(10,2),
        down_payment DECIMAL(12,2),
        loan_amount DECIMAL(12,2),
        interest_rate DECIMAL(5,4),
        loan_term INTEGER,
        monthly_payment DECIMAL(10,2),
        cash_flow DECIMAL(10,2),
        cap_rate DECIMAL(5,4),
        cash_on_cash_return DECIMAL(5,4),
        total_return DECIMAL(5,4),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ Properties table created")

    // Property images
    await sql`
      CREATE TABLE IF NOT EXISTS property_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        image_name TEXT,
        image_size INTEGER,
        image_type TEXT,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ Property images table created")

    // Chat history
    await sql`
      CREATE TABLE IF NOT EXISTS chat_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL DEFAULT 'New Chat',
        messages JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ Chat history table created")

    // Market data (STATE ABBR as pk)
    await sql`
      CREATE TABLE IF NOT EXISTS market_data (
        id TEXT PRIMARY KEY,
        state_name TEXT NOT NULL,
        population_growth DECIMAL(5,2),
        job_growth DECIMAL(5,2),
        house_price_index_growth DECIMAL(5,2),
        net_migration INTEGER,
        vacancy_rate DECIMAL(5,2),
        international_inflows INTEGER,
        single_family_permits INTEGER,
        multi_family_permits INTEGER,
        median_home_price DECIMAL(12,2),
        median_rent DECIMAL(8,2),
        price_to_rent_ratio DECIMAL(8,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log("✅ Market data table created")

    // Trigger helper
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `

    /* ────────────────  (Re)create triggers  ──────────────── */
    // Ensure old triggers are removed so the CREATE below never fails
    await sql`DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;`
    await sql`DROP TRIGGER IF EXISTS update_chat_history_updated_at ON chat_history;`
    await sql`DROP TRIGGER IF EXISTS update_market_data_updated_at ON market_data;`

    await sql`
      CREATE TRIGGER update_properties_updated_at
      BEFORE UPDATE ON properties
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `

    await sql`
      CREATE TRIGGER update_chat_history_updated_at
      BEFORE UPDATE ON chat_history
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `

    await sql`
      CREATE TRIGGER update_market_data_updated_at
      BEFORE UPDATE ON market_data
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `
    console.log("✅ Update triggers created")

    // Indexes – one per statement
    await sql`CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state)`
    await sql`CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city)`
    await sql`CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_history_updated_at ON chat_history(updated_at)`
    await sql`CREATE INDEX IF NOT EXISTS idx_market_data_state ON market_data(state_name)`
    console.log("✅ Database indexes created")

    /* ─────────────────────  SAMPLE DATA  ─────────────────── */
    // Properties sample
    await sql`
      INSERT INTO properties
        (address, city, state, zip_code, property_type, purchase_price, 
         current_value, monthly_rent, monthly_expenses, down_payment, 
         loan_amount, interest_rate, loan_term, monthly_payment, 
         cash_flow, cap_rate, cash_on_cash_return, total_return, notes)
      VALUES
        ('123 Main St', 'Austin', 'TX', '78701', 'Single Family', 350000.00,
         380000.00, 2800.00, 1200.00, 70000.00, 280000.00, 0.0650, 30,
         1870.00, 1600.00, 0.0720, 0.0914, 0.1250, 'Great rental property in downtown Austin'),
        ('456 Oak Ave', 'Dallas', 'TX', '75201', 'Condo', 280000.00,
         295000.00, 2200.00, 800.00, 56000.00, 224000.00, 0.0625, 30,
         1380.00, 1400.00, 0.0750, 0.1000, 0.1180, 'Modern condo with city views'),
        ('789 Pine Rd', 'Houston', 'TX', '77001', 'Townhouse', 420000.00,
         445000.00, 3200.00, 1500.00, 84000.00, 336000.00, 0.0675, 30,
         2190.00, 1700.00, 0.0690, 0.0810, 0.1150, 'Family-friendly neighborhood')
      ON CONFLICT DO NOTHING
    `
    console.log("✅ Sample properties inserted")

    // Market data sample
    await sql`
      INSERT INTO market_data
        (id, state_name, population_growth, job_growth, house_price_index_growth,
         net_migration, vacancy_rate, international_inflows, single_family_permits,
         multi_family_permits, median_home_price, median_rent, price_to_rent_ratio)
      VALUES
        ('tx', 'Texas', 1.8, 3.2, 8.5, 45000, 3.8, 12000, 85000, 25000, 285000.00, 1850.00, 154.05),
        ('fl', 'Florida', 2.3, 3.5, 11.8, 85000, 3.2, 45000, 95000, 35000, 320000.00, 2100.00, 152.38),
        ('nv', 'Nevada', 2.1, 2.8, 12.3, 18000, 4.2, 3200, 15000, 8500, 410000.00, 2200.00, 186.36),
        ('ar', 'Arkansas', 0.8, 1.5, 6.8, 8500, 5.1, 1200, 12000, 2800, 165000.00, 1200.00, 137.50),
        ('al', 'Alabama', 0.6, 1.8, 7.2, 12000, 4.8, 1800, 18000, 4200, 180000.00, 1300.00, 138.46),
        ('ga', 'Georgia', 1.5, 2.9, 9.1, 35000, 4.1, 8500, 42000, 18000, 265000.00, 1750.00, 151.43),
        ('mt', 'Montana', 1.2, 2.1, 15.2, 8500, 2.9, 450, 5500, 1200, 485000.00, 1800.00, 269.44),
        ('oh', 'Ohio', 0.2, 1.2, 5.4, -5000, 5.8, 3200, 28000, 12000, 195000.00, 1400.00, 139.29),
        ('in', 'Indiana', 0.4, 1.8, 6.2, 8000, 5.2, 2100, 22000, 8500, 175000.00, 1250.00, 140.00),
        ('nc', 'North Carolina', 1.4, 2.6, 10.3, 28000, 3.6, 6800, 48000, 22000, 275000.00, 1650.00, 166.67),
        ('tn', 'Tennessee', 1.1, 2.4, 8.9, 22000, 4.3, 3500, 32000, 15000, 295000.00, 1700.00, 173.53),
        ('az', 'Arizona', 1.9, 3.1, 13.1, 42000, 3.8, 8200, 38000, 18500, 410000.00, 2000.00, 205.00),
        ('mo', 'Missouri', 0.3, 1.4, 6.8, 2500, 5.4, 2800, 18000, 7500, 185000.00, 1350.00, 137.04),
        ('mi', 'Michigan', 0.1, 1.6, 7.8, -2000, 6.1, 4200, 25000, 11000, 205000.00, 1450.00, 141.38),
        ('sc', 'South Carolina', 1.3, 2.2, 9.6, 18000, 4.5, 2800, 28000, 12500, 245000.00, 1550.00, 158.06),
        ('ky', 'Kentucky', 0.5, 1.3, 5.9, 3500, 5.7, 1500, 15000, 5500, 170000.00, 1200.00, 141.67)
      ON CONFLICT (id) DO UPDATE SET
        population_growth = EXCLUDED.population_growth,
        job_growth = EXCLUDED.job_growth,
        house_price_index_growth = EXCLUDED.house_price_index_growth,
        net_migration = EXCLUDED.net_migration,
        vacancy_rate = EXCLUDED.vacancy_rate,
        international_inflows = EXCLUDED.international_inflows,
        single_family_permits = EXCLUDED.single_family_permits,
        multi_family_permits = EXCLUDED.multi_family_permits,
        median_home_price = EXCLUDED.median_home_price,
        median_rent = EXCLUDED.median_rent,
        price_to_rent_ratio = EXCLUDED.price_to_rent_ratio,
        updated_at = CURRENT_TIMESTAMP
    `
    console.log("✅ Sample market data inserted")

    console.log("🎉 Database initialization completed successfully!")

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      tables: ["properties", "property_images", "chat_history", "market_data"],
      indexes: 6,
      triggers: 3,
      sampleData: {
        properties: 3,
        marketData: 16,
      },
    })
  } catch (error) {
    console.error("❌ DB init error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database initialization failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
