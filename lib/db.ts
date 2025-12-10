import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import type { NeonQueryFunction } from "@neondatabase/serverless"

function createDummySql(): NeonQueryFunction<boolean, any> {
  const dummyFunction = (strings: TemplateStringsArray, ..._values: unknown[]) => {
    console.warn("⚠️ No database URL, returning empty array")
    return Promise.resolve([]) as any
  }
  
  return Object.assign(dummyFunction, {
    query: dummyFunction,
    unsafe: dummyFunction,
    transaction: () => Promise.resolve(dummyFunction as any)
  }) as unknown as NeonQueryFunction<boolean, any>
}

// Use the database URL from environment variable
const databaseUrl = process.env.DATABASE_URL

export const sql = databaseUrl ? neon(databaseUrl) : createDummySql()

// Initialize Drizzle ORM
export const db = databaseUrl ? drizzle(sql as any) : null;

// Function to get the DB instance, throwing an error if not available
export function getDb() {
  if (!db) {
    throw new Error('Database connection not available. Please check your DATABASE_URL environment variable.');
  }
  return db;
}

// Flag to track initialization status
let isInitialized = false;

export async function ensureDatabaseInitialized() {
  if (isInitialized) {
    return true;
  }
  
  if (!databaseUrl) {
    console.warn("DATABASE_URL is not set – skipping database initialization.");
    // Don't fail initialization if database URL is not set, just mark as initialized
    isInitialized = true; 
    return true;
  }
  
  try {
    console.log("🔧 Initializing database tables...");
    await initializeDatabase();
    isInitialized = true;
    console.log("✅ Database initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    // Even if initialization fails, we should still mark as initialized to avoid repeated failures
    isInitialized = true;
    return false;
  }
}

export async function testConnection() {
  if (!databaseUrl) {
    console.warn("DATABASE_URL is not set – skipping database connectivity check.")
    return false
  }

  try {
    const result = await sql`SELECT NOW() AS current_time`
    const rows = Array.isArray(result) ? result : (result as any)?.rows || []
    console.log("✅ Database connected successfully:", rows[0]?.current_time)
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

export async function initializeDatabase() {
  if (!databaseUrl) {
    console.warn("DATABASE_URL not set – skipping database initialization.")
    return false
  }

  try {
    // Test connection first
    await testConnection()

    // Enable required extensions
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`

    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255),
        company VARCHAR(255),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        google_id VARCHAR(255),
        avatar_url TEXT,
        role VARCHAR(20) DEFAULT 'user'
      )
    `

    // Add missing columns to users table if they don't exist
    try {
      // Add columns that might be missing from older schema versions
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255)`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'`

      // Check for all required columns that might be missing using separate queries for compatibility
      // Add missing columns to users table if they don't exist
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100)`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100)`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(255)`
      
      // Update any existing records that might have NULL required fields
      await sql`UPDATE users SET first_name = 'User' WHERE first_name IS NULL`
      await sql`UPDATE users SET last_name = 'Unknown' WHERE last_name IS NULL`
      
      // Now ensure NOT NULL constraints (this may fail if there are still NULL values)
      try {
        await sql`ALTER TABLE users ALTER COLUMN first_name SET NOT NULL`
      } catch (error) {
        console.warn("Could not set first_name as NOT NULL:", error)
      }
      
      try {
        await sql`ALTER TABLE users ALTER COLUMN last_name SET NOT NULL`
      } catch (error) {
        console.warn("Could not set last_name as NOT NULL:", error)
      }
    } catch (error) {
      console.warn("Warning adding columns to users table:", error)
    }

    // Create sessions table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT
      )
    `

    // Add missing columns to sessions table if they don't exist
    try {
      await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45)`
      await sql`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_agent TEXT`
    } catch (error) {
      console.warn("Warning adding columns to sessions table:", error)
    }

    // Create properties table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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
    // Add user_id to properties table if it doesn't exist (for older schemas)
    await sql`ALTER TABLE properties ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL`

    // Create property_images table if it doesn't exist
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

    // Drop and recreate chat_history table to ensure clean schema and prevent data corruption
    console.log("🗑️ Dropping existing chat_history table (if any)...")
    await sql`DROP TABLE IF EXISTS chat_history CASCADE`
    console.log("✨ Recreating chat_history table...")
    await sql`
      CREATE TABLE chat_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        messages JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create property_roe_analysis table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS property_roe_analysis (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        purchase_price NUMERIC,
        debt NUMERIC,
        down_payment NUMERIC,
        out_of_pocket_reno NUMERIC,
        total_initial_investment NUMERIC,
        current_fmv NUMERIC,
        current_debt NUMERIC,
        potential_equity NUMERIC,
        loan_terms INTEGER,
        amortization INTEGER,
        interest_rate NUMERIC,
        acquisition_date DATE,
        years_held INTEGER,
        current_payment NUMERIC,
        roe_percentage NUMERIC,
        analysis_results JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_roe_analysis_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_chat_history_updated_at ON chat_history(updated_at DESC)`
    await sql`CREATE INDEX IF NOT EXISTS idx_property_roe_analysis_user_id ON property_roe_analysis(user_id)`

    console.log("✅ Database tables initialized successfully")
    return true
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    return false
  }
}
