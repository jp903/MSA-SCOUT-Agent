import { NextResponse } from "next/server"
import { PropertySearchAgent } from "@/lib/property-search-agent"

export async function GET() {
  try {
    console.log("🔍 Checking API status...")

    const searchAgent = new PropertySearchAgent()
    const apiStatus = await searchAgent.checkAPIStatus()

    console.log("📊 API Status Results:", apiStatus)

    return NextResponse.json({
      success: true,
      apiStatus: apiStatus,
      timestamp: new Date().toISOString(),
      message: "API status check completed",
      details: {
        rentcast: {
          status: apiStatus.rentcast,
          configured: !!process.env.RENTCAST_API_KEY,
          endpoint: "https://api.rentcast.io/v1/listings/sale",
        },
        mashvisor: {
          status: apiStatus.mashvisor,
          configured: !!(process.env.MASHVISOR_API_KEY || process.env.Mashvisor_API_KEY || process.env.RAPIDAPI_KEY),
          endpoint: "https://api.mashvisor.com/v1.1/client/property",
        },
      },
    })
  } catch (error: any) {
    console.error("❌ API status check failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to check API status",
        details: error.message,
        apiStatus: {
          rentcast: "error",
          mashvisor: "error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
