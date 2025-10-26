import { neon } from "@neondatabase/serverless"
import type { NeonQueryFunction } from "@neondatabase/serverless"

function createDummySql(): NeonQueryFunction<any[]> {
  return (strings: TemplateStringsArray, ..._values: unknown[]) => {
    console.warn("⚠️ No database URL, returning empty array")
    return Promise.resolve([]) as any
  }
}

// Use the database URL from environment variable
const databaseUrl = process.env.DATABASE_URL

export const sql: NeonQueryFunction<any[]> = databaseUrl ? neon(databaseUrl) : createDummySql()

// Flag to track initialization status
let isInitialized = false;

export async function ensureDatabaseInitialized() {
  if (isInitialized) {
    return true;
  }
  
  if (!databaseUrl) {
    console.warn("DATABASE_URL is not set – skipping database initialization.");
    return false;
  }
  
  try {
    console.log("🔧 Initializing database tables...");
    await initializeDatabase();
    isInitialized = true;
    console.log("✅ Database initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing database:", error);
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
    console.log("✅ Database connected successfully:", result[0].current_time)
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
        avatar_url TEXT
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
      
      // Check for all required columns that might be missing
      const columnsResult = await sql`
        SELECT column_name, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name IN ('first_name', 'last_name', 'phone', 'company')
      `
      
      const existingColumns = columnsResult.map((col: any) => col.column_name)
      
      if (!existingColumns.includes('first_name')) {
        // If first_name doesn't exist, add it with a default value
        await sql`ALTER TABLE users ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT 'User'`
        // Remove the default after adding some value
        await sql`ALTER TABLE users ALTER COLUMN first_name DROP DEFAULT`
      }
      
      if (!existingColumns.includes('last_name')) {
        // If last_name doesn't exist, add it with a default value  
        await sql`ALTER TABLE users ADD COLUMN last_name VARCHAR(100) NOT NULL DEFAULT 'Unknown'`
        // Remove the default after adding some value
        await sql`ALTER TABLE users ALTER COLUMN last_name DROP DEFAULT`
      }
      
      if (!existingColumns.includes('phone')) {
        // If phone doesn't exist, add it (it's nullable)
        await sql`ALTER TABLE users ADD COLUMN phone VARCHAR(20)`
      }
      
      if (!existingColumns.includes('company')) {
        // If company doesn't exist, add it (it's nullable)
        await sql`ALTER TABLE users ADD COLUMN company VARCHAR(255)`
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

    // Create chat_history table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS chat_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        messages JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    console.log("✅ Database tables initialized successfully")
    return true
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    return false
  }
}
