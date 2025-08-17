import { NextResponse } from "next/server"
import { PropertySearchAgent } from "@/lib/property-search-agent"

export async function GET() {
  try {
    const searchAgent = new PropertySearchAgent()
    const apiStatus = await searchAgent.checkAPIStatus()

    return NextResponse.json({
      success: true,
      apiStatus,
      timestamp: new Date().toISOString(),
      message: "API status check completed",
    })
  } catch (error: any) {
    console.error("API status check failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to check API status",
        details: error.message || "Unknown error occurred",
        apiStatus: {
          rentspree: "error",
          loopnet: "error",
          zillow: "error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
