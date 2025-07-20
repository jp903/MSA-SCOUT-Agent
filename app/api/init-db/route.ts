import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(_req: NextRequest) {
  try {
    console.log("🚀 Starting DB init")

    /* ─────────────────────  EXTENSIONS  ─────────────────── */
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`

    /* ─────────────────────  TABLES  ─────────────────────── */
    await sql`
      CREATE TABLE IF NOT EXISTS properties (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name             TEXT NOT NULL,
        address          TEXT NOT NULL,
        city             TEXT NOT NULL,
        state            TEXT NOT NULL,
        zip_code         TEXT,
        property_type    TEXT NOT NULL,
        purchase_price   NUMERIC(12,2) NOT NULL,
        current_value    NUMERIC(12,2),
        monthly_rent     NUMERIC(10,2),
        monthly_expenses NUMERIC(10,2),
        down_payment     NUMERIC(12,2),
        loan_amount      NUMERIC(12,2),
        interest_rate    NUMERIC(5,4),
        loan_term        INTEGER,
        monthly_payment  NUMERIC(10,2),
        cash_flow        NUMERIC(10,2),
        cap_rate         NUMERIC(5,4),
        cash_on_cash_return NUMERIC(5,4),
        total_return     NUMERIC(5,4),
        notes            TEXT,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    /* ── Back-fill columns that might be missing on old DBs ── */
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT ''`
    await sql`ALTER TABLE properties ALTER COLUMN name DROP DEFAULT`
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS loan_term INTEGER`
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS monthly_payment NUMERIC(10,2)`
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS cash_flow NUMERIC(10,2)`
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS cap_rate NUMERIC(5,4)`
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS cash_on_cash_return NUMERIC(5,4)`
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS total_return NUMERIC(5,4)`
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS notes TEXT`

    await sql`
      CREATE TABLE IF NOT EXISTS property_images (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        image_url   TEXT NOT NULL,
        image_name  TEXT,
        image_size  INTEGER,
        image_type  TEXT,
        is_primary  BOOLEAN DEFAULT FALSE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS chat_history (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title      TEXT  NOT NULL DEFAULT 'New chat',
        messages   JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS market_data (
        id                       TEXT PRIMARY KEY,   -- state abbr
        state_name               TEXT NOT NULL,
        population_growth        NUMERIC(5,2),
        job_growth               NUMERIC(5,2),
        house_price_index_growth NUMERIC(5,2),
        net_migration            INTEGER,
        vacancy_rate             NUMERIC(5,2),
        international_inflows    INTEGER,
        single_family_permits    INTEGER,
        multi_family_permits     INTEGER,
        median_home_price        NUMERIC(12,2),
        median_rent              NUMERIC(8,2),
        price_to_rent_ratio      NUMERIC(8,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    /* ────────────────────  TRIGGERS  ─────────────────────── */
    await sql`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `

    await sql`DROP TRIGGER IF EXISTS trg_prop_upd ON properties`
    await sql`DROP TRIGGER IF EXISTS trg_chat_upd ON chat_history`
    await sql`DROP TRIGGER IF EXISTS trg_market_upd ON market_data`

    await sql`CREATE TRIGGER trg_prop_upd   BEFORE UPDATE ON properties     FOR EACH ROW EXECUTE FUNCTION set_updated_at()`
    await sql`CREATE TRIGGER trg_chat_upd   BEFORE UPDATE ON chat_history    FOR EACH ROW EXECUTE FUNCTION set_updated_at()`
    await sql`CREATE TRIGGER trg_market_upd BEFORE UPDATE ON market_data     FOR EACH ROW EXECUTE FUNCTION set_updated_at()`

    /* ─────────────────────  INDEXES  ─────────────────────── */
    await sql`CREATE INDEX IF NOT EXISTS idx_prop_state  ON properties(state)`
    await sql`CREATE INDEX IF NOT EXISTS idx_prop_city   ON properties(city)`
    await sql`CREATE INDEX IF NOT EXISTS idx_prop_created ON properties(created_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_updated ON chat_history(updated_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_market_state ON market_data(state_name)`

    /* ────────────────────  SAMPLE DATA  ─────────────────── */
    await sql`
      INSERT INTO properties
        (name, address, city, state, zip_code, property_type, purchase_price,
         current_value, monthly_rent, monthly_expenses, down_payment,
         loan_amount, interest_rate, loan_term, monthly_payment,
         cash_flow, cap_rate, cash_on_cash_return, total_return, notes)
      VALUES
        ('Sunset Villa',  '123 Main St', 'Austin',  'TX', '78701', 'Single-family', 350000,
         380000, 2800, 1200, 70000, 280000, 0.065, 30, 1870,
         1600, 7.2, 9.14, 12.5, 'Downtown Austin property'),
        ('Oak Condo',     '456 Oak Ave', 'Dallas',  'TX', '75201', 'Condo',        280000,
         295000, 2200,  800, 56000, 224000, 0.0625,30, 1380,
         1400, 7.5, 10.0, 11.8, 'Modern condo with city views'),
        ('Pine Townhouse','789 Pine Rd', 'Houston', 'TX', '77001', 'Townhouse',    420000,
         445000, 3200, 1500, 84000, 336000, 0.0675,30, 2190,
         1700, 6.9, 8.1,  11.5, 'Family-friendly neighbourhood')
      ON CONFLICT DO NOTHING;
    `

    console.log("✅ DB init complete")
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("❌ DB init error:", err)
    return NextResponse.json({ success: false, message: "DB init failed", detail: String(err) }, { status: 500 })
  }
}
