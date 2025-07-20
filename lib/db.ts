import { neon } from "@neondatabase/serverless"
import type { NeonQueryFunction } from "@neondatabase/serverless"

/**
 * Returns a dummy no-op SQL tagged-template function that satisfies the Neon
 * type signature.  It lets the app run in environments where DATABASE_URL is
 * not defined (e.g. v0 preview) without crashing.
 */
function createDummySql(): NeonQueryFunction<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (strings: TemplateStringsArray, ..._values: unknown[]) => Promise.resolve([]) as any
}

export const sql: NeonQueryFunction<any[]> = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : createDummySql()

/**
 * Attempts to connect to the database (only when DATABASE_URL is provided).
 * Logs a warning and exits early in environments that do not have a DB.
 */
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
