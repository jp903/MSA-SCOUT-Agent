import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

/**
 * Execute a list of raw SQL commands sequentially (⚠ one command per string!).
 */
async function runAll(sql: ReturnType<typeof neon>, stmts: string[]) {
  for (const s of stmts) {
    const text = s.trim()
    if (text.length === 0) continue
    await sql.unsafe(text)
  }
}

export async function POST(_req: NextRequest) {
  try {
    /* ─────────────────────  ENV CHECK  ───────────────────── */
    const url = process.env.DATABASE_URL
    if (!url) {
      console.warn("DATABASE_URL missing – skipping DB init")
      return NextResponse.json({
        success: true,
        message: "Skipped (no DATABASE_URL)",
      })
    }

    const sql = neon(url)

    /* ─────────────────────  DDL  ─────────────────────────── */
    const ddl: string[] = [
      // Needed for gen_random_uuid()
      `CREATE EXTENSION IF NOT EXISTS pgcrypto`,

      // Properties table
      `
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name             VARCHAR(255) NOT NULL,
        address          TEXT         NOT NULL,
        state            VARCHAR(100) NOT NULL,
        purchase_price   NUMERIC(12,2) NOT NULL,
        purchase_date    DATE,
        current_value    NUMERIC(12,2) NOT NULL,
        monthly_rent     NUMERIC(10,2) NOT NULL,
        monthly_expenses NUMERIC(10,2) NOT NULL,
        down_payment     NUMERIC(12,2) NOT NULL,
        loan_amount      NUMERIC(12,2) NOT NULL,
        interest_rate    NUMERIC(5,3)  NOT NULL,
        loan_term_years  INT           NOT NULL,
        property_type    VARCHAR(100)  NOT NULL,
        status           VARCHAR(50)   NOT NULL DEFAULT 'owned',
        notes            TEXT,
        created_at       TIMESTAMP DEFAULT NOW(),
        updated_at       TIMESTAMP DEFAULT NOW()
      )`,

      // Property images
      `
      CREATE TABLE IF NOT EXISTS property_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        url       TEXT NOT NULL,
        filename  VARCHAR(255) NOT NULL,
        size      INT NOT NULL,
        caption   TEXT,
        is_primary BOOLEAN DEFAULT FALSE,
        uploaded_at TIMESTAMP DEFAULT NOW()
      )`,

      // Chat history
      `
      CREATE TABLE IF NOT EXISTS chat_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title      VARCHAR(255) NOT NULL,
        messages   JSONB        NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,

      // Market data (STATE ABBR as pk)
      `
      CREATE TABLE IF NOT EXISTS market_data (
        id TEXT PRIMARY KEY,  -- e.g. 'tx'
        state TEXT NOT NULL,
        population_growth        NUMERIC(5,2),
        job_growth               NUMERIC(5,2),
        house_price_index_growth NUMERIC(5,2),
        net_migration            INT,
        vacancy_rate             NUMERIC(5,2),
        international_inflows    INT,
        single_family_permits    INT,
        multi_family_permits     INT,
        last_updated TIMESTAMP DEFAULT NOW()
      )`,

      // Trigger helper
      `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql`,

      // Triggers (each separate)
      `DROP TRIGGER IF EXISTS trg_properties_updated ON properties`,
      `
      CREATE TRIGGER trg_properties_updated
      BEFORE UPDATE ON properties
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

      `DROP TRIGGER IF EXISTS trg_chat_history_updated ON chat_history`,
      `
      CREATE TRIGGER trg_chat_history_updated
      BEFORE UPDATE ON chat_history
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,

      // Indexes – one per statement
      `CREATE INDEX IF NOT EXISTS idx_properties_status      ON properties(status)`,
      `CREATE INDEX IF NOT EXISTS idx_properties_state       ON properties(state)`,
      `CREATE INDEX IF NOT EXISTS idx_properties_created_at  ON properties(created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_property_images_pid    ON property_images(property_id)`,
      `CREATE INDEX IF NOT EXISTS idx_property_images_primary ON property_images(is_primary)`,
      `CREATE INDEX IF NOT EXISTS idx_chat_created           ON chat_history(created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_chat_updated           ON chat_history(updated_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_market_state           ON market_data(state)`,
      `CREATE INDEX IF NOT EXISTS idx_market_updated         ON market_data(last_updated DESC)`,
    ]

    await runAll(sql, ddl)

    /* ─────────────────────  SAMPLE DATA  ─────────────────── */
    // Properties sample
    await sql`
      INSERT INTO properties
        (name,address,state,purchase_price,current_value,monthly_rent,
         monthly_expenses,down_payment,loan_amount,interest_rate,loan_term_years,
         property_type,status)
      VALUES
        ('Sunset Villa','123 Main St, Austin, TX','Texas',250000,275000,2200,500,50000,200000,4.5,30,'single-family','owned'),
        ('Downtown Condo','456 Oak Ave, Miami, FL','Florida',180000,195000,1800,400,36000,144000,4.2,30,'condo','owned'),
        ('Riverside Duplex','789 River Rd, Phoenix, AZ','Arizona',320000,340000,2800,600,64000,256000,4.8,30,'multi-family','owned')
      ON CONFLICT DO NOTHING
    `

    // Market data sample
    await sql`
      INSERT INTO market_data
        (id,state,population_growth,job_growth,house_price_index_growth,
         net_migration,vacancy_rate,international_inflows,
         single_family_permits,multi_family_permits)
      VALUES
        ('tx','Texas',1.8,3.2,8.5,45000,3.8,12000,85000,25000),
        ('fl','Florida',2.3,3.5,11.8,85000,3.2,45000,95000,35000),
        ('nv','Nevada',2.1,2.8,12.3,18000,4.2,3200,15000,8500),
        ('ar','Arkansas',0.8,1.5,6.8,8500,5.1,1200,12000,2800),
        ('al','Alabama',0.6,1.8,7.2,12000,4.8,1800,18000,4200),
        ('ga','Georgia',1.5,2.9,9.1,35000,4.1,8500,42000,18000)
      ON CONFLICT (id) DO UPDATE
        SET last_updated = NOW()
    `

    console.log("✅ Database initialized")
    return NextResponse.json({ success: true, message: "Database initialized" })
  } catch (err) {
    console.error("❌ DB init error:", err)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize database",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    )
  }
}
