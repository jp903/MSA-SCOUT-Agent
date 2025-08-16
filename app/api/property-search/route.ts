import { type NextRequest, NextResponse } from "next/server"
import { PropertySearchAgent, type PropertySearchFilters } from "@/lib/property-search-agent"

export async function POST(request: NextRequest) {
  try {
    console.log("Property search API called")

    const body = await request.json()
    console.log("Search filters received:", body)

    // Validate required fields
    if (!body.location || !body.propertyType || !body.minPrice || !body.maxPrice) {
      return NextResponse.json(
        { error: "Missing required fields: location, propertyType, minPrice, maxPrice" },
        { status: 400 },
      )
    }

    // Create search filters
    const filters: PropertySearchFilters = {
      location: body.location,
      propertyType: body.propertyType,
      minPrice: Number.parseInt(body.minPrice),
      maxPrice: Number.parseInt(body.maxPrice),
      minBedrooms: body.minBedrooms ? Number.parseInt(body.minBedrooms) : undefined,
      maxBedrooms: body.maxBedrooms ? Number.parseInt(body.maxBedrooms) : undefined,
      minBathrooms: body.minBathrooms ? Number.parseInt(body.minBathrooms) : undefined,
      maxBathrooms: body.maxBathrooms ? Number.parseInt(body.maxBathrooms) : undefined,
      minSquareFeet: body.minSquareFeet ? Number.parseInt(body.minSquareFeet) : undefined,
      maxSquareFeet: body.maxSquareFeet ? Number.parseInt(body.maxSquareFeet) : undefined,
      yearBuilt: body.yearBuilt
        ? {
            min: body.yearBuilt.min ? Number.parseInt(body.yearBuilt.min) : undefined,
            max: body.yearBuilt.max ? Number.parseInt(body.yearBuilt.max) : undefined,
          }
        : undefined,
      lotSize: body.lotSize
        ? {
            min: body.lotSize.min ? Number.parseFloat(body.lotSize.min) : undefined,
            max: body.lotSize.max ? Number.parseFloat(body.lotSize.max) : undefined,
          }
        : undefined,
      features: body.features || [],
      investmentType: body.investmentType || "buy-and-hold",
    }

    console.log("Processed filters:", filters)

    // Search for properties
    const properties = await PropertySearchAgent.searchProperties(filters)

    console.log(`Found ${properties.length} properties`)

    return NextResponse.json({
      success: true,
      properties,
      count: properties.length,
      filters: filters,
    })
  } catch (error: any) {
    console.error("Property search API error:", error)

    return NextResponse.json(
      {
        error: "Failed to search properties",
        details: error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}
