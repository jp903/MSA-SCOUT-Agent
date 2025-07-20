import { NextResponse } from "next/server"
import { initializeDatabase, testConnection } from "@/lib/db"

export async function GET() {
  try {
    // Test connection first
    const connected = await testConnection()

    if (!connected) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed or DATABASE_URL not set",
        },
        { status: 500 },
      )
    }

    // Initialize database
    const initialized = await initializeDatabase()

    if (initialized) {
      return NextResponse.json({
        success: true,
        message: "Database initialized successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Database initialization failed",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Database initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Database initialization failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
