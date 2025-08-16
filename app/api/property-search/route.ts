import { type NextRequest, NextResponse } from "next/server"
import { PropertySearchAgent, type PropertySearchFilters } from "@/lib/property-search-agent"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Property search API endpoint called")

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

    // Create search agent and search for properties
    const searchAgent = new PropertySearchAgent()
    const properties = await searchAgent.searchProperties(filters)

    console.log(`✅ Search completed successfully. Found ${properties.length} properties`)

    // Sort properties if needed
    const sortedProperties = properties.sort((a, b) => {
      const aValue = a[filters.sortBy as keyof typeof a] as number
      const bValue = b[filters.sortBy as keyof typeof b] as number

      if (filters.sortOrder === "desc") {
        return bValue - aValue
      }
      return aValue - bValue
    })

    return NextResponse.json({
      success: true,
      properties: sortedProperties,
      count: sortedProperties.length,
      filters: filters,
      timestamp: new Date().toISOString(),
      message: `Found ${sortedProperties.length} properties matching your criteria`,
    })
  } catch (error: any) {
    console.error("❌ Property search API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to search properties",
        details: error.message || "Unknown error occurred",
        properties: [],
        count: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Property Search API",
    version: "2.0.0",
    status: "active",
    endpoints: {
      "POST /api/property-search": "Search for investment properties with filters",
    },
    requiredFields: ["state", "msa"],
    optionalFields: ["propertyType", "minPrice", "maxPrice", "minBedrooms", "maxBedrooms", "sortBy", "sortOrder"],
  })
}
