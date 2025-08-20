import { NextResponse } from "next/server"
import { PropertySearchAgent } from "@/lib/property-search-agent"

export async function GET() {
  try {
    console.log("🔍 Checking AUTHENTIC API status...")

    const searchAgent = new PropertySearchAgent()
    const apiStatus = await searchAgent.checkAPIStatus()

    console.log("📊 AUTHENTIC API Status Results:", apiStatus)

    return NextResponse.json({
      success: true,
      apiStatus: apiStatus,
      timestamp: new Date().toISOString(),
      message: "AUTHENTIC API status check completed",
      details: {
        rentcast: {
          status: apiStatus.rentcast,
          configured: !!process.env.RENTCAST_API_KEY,
          endpoint: "https://api.rentcast.io/v1/listings/sale",
          authenticEndpoints: [
            "/v1/properties",
            "/v1/listings/sale",
            "/v1/listings/rental/long-term",
            "/v1/properties/random",
          ],
        },
        loopnet: {
          status: apiStatus.loopnet,
          configured: !!process.env.LOOPNET_API_KEY,
          endpoint: "https://api.loopnet.com/v1/properties",
        },
        zillow: {
          status: apiStatus.zillow,
          configured: !!process.env.ZILLOW_API_KEY,
          endpoint: "https://zillow-com1.p.rapidapi.com/propertyExtendedSearch",
        },
      },
      dataAuthenticity: "Only authentic property data from live API sources - no fake or generated data",
    })
  } catch (error: any) {
    console.error("❌ AUTHENTIC API status check failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to check AUTHENTIC API status",
        details: error.message,
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
