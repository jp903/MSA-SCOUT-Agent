import { NextResponse } from "next/server"
import { PropertySearchAgent } from "@/lib/property-search-agent"

export async function GET() {
  try {
    console.log("🔍 Checking API status...")

    const searchAgent = new PropertySearchAgent()
    const apiStatus = await searchAgent.checkAPIStatus()

    console.log("✅ API status check completed:", apiStatus)

    return NextResponse.json({
      success: true,
      apiStatus,
      timestamp: new Date().toISOString(),
      message: "API status check completed successfully",
      details: {
        rentcast: "Property data generation active",
        loopnet: "Commercial property data generation active",
        zillow: "Residential property data generation active",
      },
    })
  } catch (error: any) {
    console.error("❌ API status check error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to check API status",
        details: error.message || "Unknown error occurred",
        apiStatus: {
          rentcast: "error",
          loopnet: "error",
          zillow: "error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
