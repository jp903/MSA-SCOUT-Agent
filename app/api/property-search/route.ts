import { type NextRequest, NextResponse } from "next/server"
import { PropertySearchAgent, type PropertySearchFilters } from "@/lib/property-search-agent"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Real-time property search API endpoint called")

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
    }

    console.log("🎯 Processed search filters:", filters)

    // Create search agent and search for properties from real APIs
    const searchAgent = new PropertySearchAgent()
    const { properties, apiStatus } = await searchAgent.searchProperties(filters)

    console.log(`✅ Real-time search completed successfully. Found ${properties.length} properties`)

    return NextResponse.json({
      success: true,
      properties: properties,
      count: properties.length,
      filters: filters,
      apiStatus: apiStatus,
      timestamp: new Date().toISOString(),
      message: `Found ${properties.length} real-time properties from RentSpree, LoopNet, and Zillow APIs`,
      sources: ["RentSpree API", "LoopNet API", "Zillow API"],
    })
  } catch (error: any) {
    console.error("❌ Real-time property search API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to search real-time properties",
        details: error.message || "Unknown error occurred",
        properties: [],
        count: 0,
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

export async function GET() {
  return NextResponse.json({
    message: "Real-Time Property Search API",
    version: "3.0.0",
    status: "active",
    description: "Searches real-time properties from RentSpree, LoopNet, and Zillow APIs",
    endpoints: {
      "POST /api/property-search": "Search for real-time investment properties with filters",
      "GET /api/property-search/status": "Check API connection status",
    },
    requiredFields: ["state", "msa"],
    optionalFields: ["propertyType", "minPrice", "maxPrice", "minBedrooms", "maxBedrooms", "sortBy", "sortOrder"],
    dataSources: [
      {
        name: "RentSpree API",
        type: "Residential Rentals",
        status: "active",
      },
      {
        name: "LoopNet API",
        type: "Commercial Properties",
        status: "active",
      },
      {
        name: "Zillow API",
        type: "Residential Sales",
        status: "active",
      },
    ],
  })
}
