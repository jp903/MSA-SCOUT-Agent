import { NextResponse } from "next/server"
import { propertySearchAgent } from "@/lib/property-search-agent"

export async function GET() {
  try {
    const apiStatus = await propertySearchAgent.checkAPIStatus()

    return NextResponse.json({
      success: true,
      apiStatus,
      timestamp: new Date().toISOString(),
      message: "API status check completed",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check API status",
        details: error.message,
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
