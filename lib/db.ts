import { neon } from "@neondatabase/serverless"
import type { NeonQueryFunction } from "@neondatabase/serverless"

function createDummySql(): NeonQueryFunction<any[]> {
  return (strings: TemplateStringsArray, ..._values: unknown[]) => Promise.resolve([]) as any
}

export const sql: NeonQueryFunction<any[]> = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : createDummySql()

export async function testConnection() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set – skipping database connectivity check.")
    return false
  }

  try {
    const result = await sql`SELECT NOW() AS current_time`
    console.log("Database connected successfully:", result[0].current_time)
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

export async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not set – skipping database initialization.")
    return false
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        state VARCHAR(100) NOT NULL,
        purchase_price DECIMAL(12,2) NOT NULL,
        purchase_date DATE,
        current_value DECIMAL(12,2) NOT NULL,
        monthly_rent DECIMAL(10,2) NOT NULL,
        monthly_expenses DECIMAL(10,2) NOT NULL,
        down_payment DECIMAL(12,2) NOT NULL,
        loan_amount DECIMAL(12,2) NOT NULL,
        interest_rate DECIMAL(5,3) NOT NULL,
        loan_term_years INTEGER NOT NULL,
        property_type VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'owned',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS property_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        filename VARCHAR(255) NOT NULL,
        size INTEGER NOT NULL,
        caption TEXT,
        is_primary BOOLEAN DEFAULT FALSE,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS chat_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        messages JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("Database tables initialized successfully")
    return true
  } catch (error) {
    console.error("Database initialization failed:", error)
    return false
  }
}
