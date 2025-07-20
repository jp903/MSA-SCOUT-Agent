import { type NextRequest, NextResponse } from "next/server"
import { researchAgent } from "@/lib/research-agent"

export async function POST(request: NextRequest) {
  try {
    const { state } = await request.json()

    if (!state) {
      return NextResponse.json({ error: "State parameter is required" }, { status: 400 })
    }

    console.log(`🔍 Analyzing market data for ${state}...`)

    const result = await researchAgent.analyzeMarket(state)

    console.log(`✅ Market analysis completed for ${state}`)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("❌ Research API error:", error)
    return NextResponse.json({ error: "Failed to analyze market data" }, { status: 500 })
  }
}
