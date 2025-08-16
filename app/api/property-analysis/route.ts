import { type NextRequest, NextResponse } from "next/server"
import { PortfolioManagerDB } from "@/lib/portfolio-manager-db"

export async function POST(request: NextRequest) {
  try {
    const propertyData = await request.json()

    // Add property to database
    const property = await PortfolioManagerDB.addProperty({
      ...propertyData,
      status: "analyzed",
    })

    if (property) {
      return NextResponse.json({
        success: true,
        property,
        message: "Property analysis completed and saved",
      })
    } else {
      return NextResponse.json({ error: "Failed to save property analysis" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in property analysis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const properties = await PortfolioManagerDB.getPortfolio()
    const analyzedProperties = properties.filter((p) => p.status === "analyzed")

    return NextResponse.json({
      properties: analyzedProperties,
      count: analyzedProperties.length,
    })
  } catch (error) {
    console.error("Error fetching analyzed properties:", error)
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}
