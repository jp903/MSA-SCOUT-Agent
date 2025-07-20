import { type NextRequest, NextResponse } from "next/server"
import { researchAgent } from "@/lib/research-agent"

export async function POST(request: NextRequest) {
  try {
    const { state } = await request.json()

    if (!state) {
      return NextResponse.json({ error: "State parameter is required" }, { status: 400 })
    }

    console.log("🔍 Research request for state:", state)

    const analysis = await researchAgent.analyzeMarketData(state)

    return NextResponse.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    console.error("❌ Error in research API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze market data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
