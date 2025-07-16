import { type NextRequest, NextResponse } from "next/server"
import { PortfolioManagerDB } from "@/lib/portfolio-manager-db"

export async function GET() {
  try {
    const portfolio = await PortfolioManagerDB.getPortfolio()
    const metrics = await PortfolioManagerDB.calculatePortfolioMetrics()

    return NextResponse.json({
      portfolio,
      metrics,
    })
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const propertyData = await request.json()
    const property = await PortfolioManagerDB.addProperty(propertyData)

    if (property) {
      return NextResponse.json(property)
    } else {
      return NextResponse.json({ error: "Failed to add property" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error adding property:", error)
    return NextResponse.json({ error: "Failed to add property" }, { status: 500 })
  }
}
