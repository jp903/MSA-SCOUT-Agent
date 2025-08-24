import { NextResponse } from "next/server"
import { PropertySearchAgent } from "@/lib/property-search-agent"

export async function GET() {
  try {
    console.log("🔍 API Status check endpoint called")

    const searchAgent = new PropertySearchAgent()
    const apiStatus = await searchAgent.checkAPIStatus()

    const environmentStatus = {
      rapidApiConfigured: !!process.env.RAPIDAPI_KEY,
      rentcastConfigured: !!process.env.RENTCAST_API_KEY,
      rapidApiLength: process.env.RAPIDAPI_KEY?.length || 0,
      rentcastLength: process.env.RENTCAST_API_KEY?.length || 0,
    }

    console.log("✅ API Status check completed:", apiStatus)
    console.log("🔧 Environment status:", environmentStatus)

    return NextResponse.json({
      success: true,
      apiStatus: apiStatus,
      environment: environmentStatus,
      timestamp: new Date().toISOString(),
      message: "API status check completed",
      details: {
        rentcast: {
          status: apiStatus.rentcast,
          configured: environmentStatus.rentcastConfigured,
          endpoint: "https://api.rentcast.io/v1/properties",
        },
        loopnet: {
          status: apiStatus.loopnet,
          configured: environmentStatus.rapidApiConfigured,
          endpoint: "https://loopnet-com.p.rapidapi.com/search",
        },
        zillow: {
          status: apiStatus.zillow,
          configured: environmentStatus.rapidApiConfigured,
          endpoint: "https://zillow-com1.p.rapidapi.com/search",
        },
      },
    })
  } catch (error: any) {
    console.error("❌ API Status check failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "API status check failed",
        details: error.message,
        apiStatus: {
          rentcast: "error",
          loopnet: "error",
          zillow: "error",
        },
        environment: {
          rapidApiConfigured: !!process.env.RAPIDAPI_KEY,
          rentcastConfigured: !!process.env.RENTCAST_API_KEY,
          rapidApiLength: process.env.RAPIDAPI_KEY?.length || 0,
          rentcastLength: process.env.RENTCAST_API_KEY?.length || 0,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
