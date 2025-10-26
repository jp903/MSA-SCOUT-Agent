import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Starting database initialization...")

    const success = await initializeDatabase();
    
    if (success) {
      console.log("🎉 Database initialization completed successfully!")
      
      return NextResponse.json({
        success: true,
        message: "Database initialized successfully",
        timestamp: new Date().toISOString(),
      })
    } else {
      throw new Error("Database initialization failed")
    }
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
