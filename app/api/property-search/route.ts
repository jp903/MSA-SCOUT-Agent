import { type NextRequest, NextResponse } from "next/server"
import { PropertySearchAgent, type PropertySearchFilters } from "@/lib/property-search-agent"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Property search endpoint called")

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
      listingStatus: "for_sale",
    }

    console.log("🎯 Processed search filters:", filters)

    // Create search agent and search for properties
    const searchAgent = new PropertySearchAgent()
    const { properties, apiStatus } = await searchAgent.searchProperties(filters)

    console.log(`✅ Search completed successfully. Found ${properties.length} properties`)

    return NextResponse.json({
      success: true,
      properties: properties,
      count: properties.length,
      filters: filters,
      apiStatus: apiStatus,
      timestamp: new Date().toISOString(),
      message: `Found ${properties.length} properties matching your criteria`,
      sources: ["Property Database"],
      dataSource: "GENERATED_DATA",
    })
  } catch (error: any) {
    console.error("❌ Property search error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to search properties",
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
    message: "Property Search Service",
    version: "5.0.0",
    status: "active",
    description: "Searches for investment properties with realistic data generation",
    endpoints: {
      "POST /api/property-search": "Search for investment properties with filters",
      "GET /api/property-search/status": "Check API connection status",
    },
    requiredFields: ["state", "msa"],
    optionalFields: ["propertyType", "minPrice", "maxPrice", "minBedrooms", "maxBedrooms", "sortBy", "sortOrder"],
    propertyTypes: {
      residential: "Single Family, Townhouse, Condo",
      commercial: "Office Building, Retail Space, Warehouse",
      "multi-family": "Duplex, Triplex, Apartment Building",
      industrial: "Manufacturing, Distribution Center, Industrial Park",
      land: "Vacant Land, Development Land, Agricultural Land",
    },
  })
}
