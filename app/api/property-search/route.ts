import { type NextRequest, NextResponse } from "next/server"
import { PropertySearchAgent, type PropertySearchFilters } from "@/lib/property-search-agent"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 AUTHENTIC API property search endpoint called")

    const body = await request.json()
    console.log("📋 Received search filters:", body)

    // Validate required fields
    if (!body.state || !body.msa) {
      console.log("❌ Missing required fields: state or msa")
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Both state and msa are required",
          success: false,
        },
        { status: 400 },
      )
    }

    // Check if API keys are configured
    const missingKeys = []
    if (!process.env.RENTCAST_API_KEY) missingKeys.push("RENTCAST_API_KEY")
    if (!process.env.LOOPNET_API_KEY) missingKeys.push("LOOPNET_API_KEY")
    if (!process.env.ZILLOW_API_KEY) missingKeys.push("ZILLOW_API_KEY")

    if (missingKeys.length > 0) {
      console.warn("⚠️ Missing API keys:", missingKeys)
      return NextResponse.json(
        {
          error: "API Configuration Error",
          details: `Missing API keys: ${missingKeys.join(", ")}. Please configure these environment variables to access authentic property data.`,
          success: false,
          missingKeys,
        },
        { status: 500 },
      )
    }

    // Build search filters with defaults
    const filters: PropertySearchFilters = {
      state: body.state,
      msa: body.msa,
      propertyType: Array.isArray(body.propertyType) ? body.propertyType : ["residential"],
      minPrice: Number(body.minPrice) || 100000,
      maxPrice: Number(body.maxPrice) || 1000000,
      minBedrooms: Number(body.minBedrooms) || 1,
      maxBedrooms: Number(body.maxBedrooms) || 10,
      minBathrooms: Number(body.minBathrooms) || 1,
      maxBathrooms: Number(body.maxBathrooms) || 10,
      sortBy: body.sortBy || "price",
      sortOrder: body.sortOrder || "asc",
      listingStatus: "for_sale",
    }

    console.log("🎯 Processed search filters:", filters)

    // Create search agent and search for AUTHENTIC properties from APIs
    const searchAgent = new PropertySearchAgent()
    const { properties, apiStatus } = await searchAgent.searchProperties(filters)

    console.log(`✅ AUTHENTIC API search completed successfully. Found ${properties.length} properties`)

    return NextResponse.json({
      success: true,
      properties: properties,
      count: properties.length,
      filters: filters,
      apiStatus: apiStatus,
      timestamp: new Date().toISOString(),
      message: `Found ${properties.length} AUTHENTIC properties from live APIs`,
      sources: ["RentCast API", "LoopNet API", "Zillow API"],
      dataSource: "AUTHENTIC_API_DATA",
      endpoints: {
        rentcast: ["/v1/listings/sale", "/v1/properties"],
        loopnet: ["/v1/properties"],
        zillow: ["/propertyExtendedSearch"],
      },
    })
  } catch (error: any) {
    console.error("❌ AUTHENTIC API property search error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to search AUTHENTIC properties from APIs",
        details: error.message || "Unknown error occurred",
        properties: [],
        count: 0,
        apiStatus: {
          rentcast: "error",
          loopnet: "error",
          zillow: "error",
        },
        timestamp: new Date().toISOString(),
        dataSource: "ERROR",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AUTHENTIC API Property Search Service",
    version: "6.0.0",
    status: "active",
    description: "Searches AUTHENTIC properties from RentCast, LoopNet, and Zillow APIs",
    endpoints: {
      "POST /api/property-search": "Search for AUTHENTIC investment properties with filters",
      "GET /api/property-search/status": "Check AUTHENTIC API connection status",
    },
    requiredFields: ["state", "msa"],
    optionalFields: ["propertyType", "minPrice", "maxPrice", "minBedrooms", "maxBedrooms", "sortBy", "sortOrder"],
    requiredEnvironmentVariables: ["RENTCAST_API_KEY", "LOOPNET_API_KEY", "ZILLOW_API_KEY"],
    authenticDataSources: [
      {
        name: "RentCast API",
        type: "Residential & Commercial Properties",
        status: "active",
        url: "https://api.rentcast.io",
        endpoints: ["/v1/properties", "/v1/listings/sale", "/v1/listings/rental/long-term", "/v1/properties/random"],
      },
      {
        name: "LoopNet API",
        type: "Commercial Properties",
        status: "active",
        url: "https://api.loopnet.com",
        endpoints: ["/v1/properties"],
      },
      {
        name: "Zillow API",
        type: "Residential Sales",
        status: "active",
        url: "https://zillow-com1.p.rapidapi.com",
        endpoints: ["/propertyExtendedSearch"],
      },
    ],
    dataAuthenticity:
      "All property listings are retrieved directly from authentic API sources without any fake or generated data",
  })
}
