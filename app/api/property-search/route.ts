import { type NextRequest, NextResponse } from "next/server"
import { PropertySearchAgent, type PropertySearchFilters } from "@/lib/property-search-agent"
import { ALLOWED_MSAS } from "@/lib/deal-finder-constants"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 REAL API ONLY - Property search endpoint called")

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

    // Validate that the MSA is in our allowed list
    if (!ALLOWED_MSAS.includes(body.msa)) {
      console.log(`❌ MSA not allowed: ${body.msa}`)
      return NextResponse.json(
        {
          error: "MSA not allowed",
          details: `MSA "${body.msa}" is not in the allowed list of MSAs`,
          success: false,
          allowedMSAs: ALLOWED_MSAS,
        },
        { status: 400 },
      )
    }

    // Log environment variables (safely)
    console.log("🔧 Environment check:")
    console.log("  - RAPIDAPI_KEY configured:", !!process.env.RAPIDAPI_KEY)
    console.log("  - RENTCAST_API_KEY configured:", !!process.env.RENTCAST_API_KEY)

    // FAIL FAST if no API keys configured
    if (!process.env.RAPIDAPI_KEY && !process.env.RENTCAST_API_KEY) {
      console.error("❌ NO API KEYS CONFIGURED")
      return NextResponse.json(
        {
          error: "API Configuration Error",
          details:
            "No API keys configured. Please add RAPIDAPI_KEY and/or RENTCAST_API_KEY to your environment variables.",
          success: false,
          requiredKeys: ["RAPIDAPI_KEY", "RENTCAST_API_KEY"],
          configuredKeys: {
            rapidApi: !!process.env.RAPIDAPI_KEY,
            rentcast: !!process.env.RENTCAST_API_KEY,
          },
        },
        { status: 500 },
      )
    }

    if (process.env.RAPIDAPI_KEY) {
      console.log("  - RAPIDAPI_KEY length:", process.env.RAPIDAPI_KEY.length)
      console.log("  - RAPIDAPI_KEY preview:", process.env.RAPIDAPI_KEY.substring(0, 15) + "...")
    }

    if (process.env.RENTCAST_API_KEY) {
      console.log("  - RENTCAST_API_KEY length:", process.env.RENTCAST_API_KEY.length)
      console.log("  - RENTCAST_API_KEY preview:", process.env.RENTCAST_API_KEY.substring(0, 15) + "...")
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
      minCapRate: Number(body.minCapRate) || 0,
      maxCapRate: Number(body.maxCapRate) || 20,
      minRoi: Number(body.minRoi) || 0,
      maxRoi: Number(body.maxRoi) || 50,
      minSquareFootage: Number(body.minSquareFootage) || 0,
      sortBy: body.sortBy || "price",
      sortOrder: body.sortOrder || "asc",
      listingStatus: "for_sale",
    }

    console.log("🎯 Processed search filters:", filters)

    // Create search agent and search for REAL properties from APIs ONLY
    const searchAgent = new PropertySearchAgent()
    const searchStart = Date.now()

    try {
      const { properties, apiStatus } = await searchAgent.searchProperties(filters)
      const searchDuration = Date.now() - searchStart

      console.log(`🔍 API returned ${properties.length} properties after all processing`)

      // Calculate search metrics
      const sourceBreakdown: Record<string, number> = {}
      properties.forEach((property) => {
        const source = property.listingSource.website
        sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1
      })

      const searchMetrics = {
        totalProperties: properties.length,
        searchDuration: `${searchDuration}ms`,
        sourceBreakdown: sourceBreakdown,
        filters: {
          location: `${filters.msa}, ${filters.state}`,
          priceRange: `$${filters.minPrice.toLocaleString()} - $${filters.maxPrice.toLocaleString()}`,
          bedrooms: `${filters.minBedrooms} - ${filters.maxBedrooms}`,
          bathrooms: `${filters.minBathrooms} - ${filters.maxBathrooms}`,
          propertyTypes: filters.propertyType.join(", "),
        },
        apiStatus: apiStatus,
      }

      console.log(`✅ REAL API search completed successfully. Found ${properties.length} REAL properties`)
      console.log("📊 Search metrics:", searchMetrics)

      // Log sample properties for debugging
      if (properties.length > 0) {
        console.log("🔍 Sample properties being returned:")
        properties.slice(0, 3).forEach((prop, index) => {
          console.log(`  ${index + 1}. ${prop.title} - $${prop.price} - ${prop.address}`)
        })
      }

      return NextResponse.json({
        success: true,
        properties: properties,
        count: properties.length,
        searchMetrics: searchMetrics,
        filters: filters,
        apiStatus: apiStatus,
        timestamp: new Date().toISOString(),
        message: `Found ${properties.length} REAL properties from live APIs`,
        sources: Object.keys(sourceBreakdown),
        dataSource: "REAL_API_DATA",
        debug: {
          rapidApiConfigured: !!process.env.RAPIDAPI_KEY,
          rentcastConfigured: !!process.env.RENTCAST_API_KEY,
          rapidApiLength: process.env.RAPIDAPI_KEY?.length || 0,
          rentcastLength: process.env.RENTCAST_API_KEY?.length || 0,
          propertiesReturned: properties.length,
          sampleProperty: properties.length > 0 ? properties[0] : null,
        },
      })
    } catch (searchError: any) {
      console.error("❌ Property search failed:", searchError.message)

      return NextResponse.json(
        {
          success: false,
          error: "Property search failed",
          details: searchError.message,
          properties: [],
          count: 0,
          apiStatus: {
            rentcast: "error",
            mashvisor: "error",
          },
          timestamp: new Date().toISOString(),
          dataSource: "ERROR",
          troubleshooting: {
            possibleCauses: [
              "Invalid API keys or expired subscriptions",
              "API rate limits exceeded",
              "Network connectivity issues",
              "API endpoints temporarily unavailable",
              "Invalid search parameters",
            ],
            solutions: [
              "Verify your API keys are valid and active",
              "Check your RapidAPI subscription status",
              "Ensure you have credits/quota remaining",
              "Try searching in a different location",
              "Wait a few minutes and try again",
            ],
          },
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("❌ REAL API property search error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message || "Unknown error occurred",
        properties: [],
        count: 0,
        apiStatus: {
          rentcast: "error",
          mashvisor: "error",
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
    message: "REAL API Property Search Service - NO DEMO DATA",
    version: "8.1.0",
    status: "active",
    description: "Searches REAL properties from Mashvisor and RentCast APIs ONLY",
    endpoints: {
      "POST /api/property-search": "Search for REAL investment properties with filters",
      "GET /api/property-search/status": "Check REAL API connection status",
    },
    requiredFields: ["state", "msa"],
    optionalFields: ["propertyType", "minPrice", "maxPrice", "minBedrooms", "maxBedrooms", "sortBy", "sortOrder"],
    requiredEnvironmentVariables: ["RENTCAST_API_KEY", "RAPIDAPI_KEY", "MASHVISOR_API_KEY"],
    environmentStatus: {
      rapidApiConfigured: !!process.env.RAPIDAPI_KEY,
      rentcastConfigured: !!process.env.RENTCAST_API_KEY,
      mashvisorConfigured: !!(process.env.MASHVISOR_API_KEY || process.env.Mashvisor_API_KEY || process.env.RAPIDAPI_KEY),
      rapidApiLength: process.env.RAPIDAPI_KEY?.length || 0,
      rentcastLength: process.env.RENTCAST_API_KEY?.length || 0,
      mashvisorLength: (process.env.MASHVISOR_API_KEY || process.env.Mashvisor_API_KEY)?.length || 0,
    },
    allowedMSAs: ALLOWED_MSAS,
    totalAllowedMSAs: ALLOWED_MSAS.length,
    dataSources: [
      {
        name: "Mashvisor API",
        type: "Investment Property Analytics",
        status: "active",
        url: "https://api.mashvisor.com/v1.1/client/property",
        authentication: "X-API-Key header",
      },
      {
        name: "RentCast API",
        type: "Residential & Commercial Properties",
        status: "active",
        url: "https://api.rentcast.io",
        authentication: "X-Api-Key header",
      },
    ],
    note: "DEMO DATA REMOVED - Only real API data is returned. Ensure API keys are configured.",
  })
}
