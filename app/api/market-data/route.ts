import { type NextRequest, NextResponse } from "next/server"
import { dataAnalysisAgent, getMarketInsights } from "@/lib/data-analysis-agent"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get("location")

    if (location) {
      // Get specific location data
      const marketData = await dataAnalysisAgent.getRealTimeMarketData(location)
      return NextResponse.json({ data: marketData })
    } else {
      // Get general market insights
      const insights = await getMarketInsights()
      return NextResponse.json({ insights })
    }
  } catch (error) {
    console.error("Market data API error:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { location, budget, goals } = await request.json()

    const analysis = await dataAnalysisAgent.analyzeProperty(location, budget, goals)

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Property analysis API error:", error)
    return NextResponse.json({ error: "Failed to analyze property" }, { status: 500 })
  }
}
