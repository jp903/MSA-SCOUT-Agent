import { type NextRequest, NextResponse } from "next/server"
import { PropertySearchAgent, type PropertySearchFilters } from "@/lib/property-search-agent"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 REAL API property search endpoint called")

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
          details: `Missing API keys: ${missingKeys.join(", ")}. Please configure these environment variables.`,
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

    // Create search agent and search for REAL properties from APIs
    const searchAgent = new PropertySearchAgent()
    const { properties, apiStatus } = await searchAgent.searchProperties(filters)

    console.log(`✅ REAL API search completed successfully. Found ${properties.length} properties`)

    return NextResponse.json({
      success: true,
      properties: properties,
      count: properties.length,
      filters: filters,
      apiStatus: apiStatus,
      timestamp: new Date().toISOString(),
      message: `Found ${properties.length} REAL properties from RentCast, LoopNet, and Zillow APIs`,
      sources: ["RentCast API", "LoopNet API", "Zillow API"],
      dataSource: "REAL_API_DATA",
    })
  } catch (error: any) {
    console.error("❌ REAL API property search error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to search REAL properties from APIs",
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
    message: "REAL API Property Search Service",
    version: "4.0.0",
    status: "active",
    description: "Searches REAL properties from RentCast, LoopNet, and Zillow APIs",
    endpoints: {
      "POST /api/property-search": "Search for REAL investment properties with filters",
      "GET /api/property-search/status": "Check REAL API connection status",
    },
    requiredFields: ["state", "msa"],
    optionalFields: ["propertyType", "minPrice", "maxPrice", "minBedrooms", "maxBedrooms", "sortBy", "sortOrder"],
    requiredEnvironmentVariables: ["RENTCAST_API_KEY", "LOOPNET_API_KEY", "ZILLOW_API_KEY"],
    dataSources: [
      {
        name: "RentCast API",
        type: "Residential & Commercial Properties",
        status: "active",
        url: "https://api.rentcast.io",
      },
      {
        name: "LoopNet API",
        type: "Commercial Properties",
        status: "active",
        url: "https://api.loopnet.com",
      },
      {
        name: "Zillow API",
        type: "Residential Sales",
        status: "active",
        url: "https://api.zillow.com",
      },
    ],
    propertyTypes: {
      rentcast: {
        single_family: "Single Family - A detached, single-family property",
        condo:
          "Condo - A single unit in a condominium development or building, which is part of a homeowner's association (HOA)",
        townhouse:
          "Townhouse - A single-family property that shares walls with other adjacent homes, and is typically part of a homeowner's association (HOA)",
        manufactured: "Manufactured - A pre-fabricated or mobile home, typically constructed at a factory",
        multi_family: "Multi-Family - A residential multi-family building (2-4 units)",
        apartment: "Apartment - A commercial multi-family building or apartment complex (5+ units)",
        land: "Land - A single parcel of vacant, undeveloped land",
      },
    },
  })
}
