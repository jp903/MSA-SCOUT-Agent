import { type NextRequest, NextResponse } from "next/server"
import { analyzePropertyInvestment } from "@/lib/property-agent"

export async function POST(request: NextRequest) {
  try {
    const { location, investmentGoals, budget } = await request.json()

    if (!location || !investmentGoals || !budget) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const result = await analyzePropertyInvestment(location, investmentGoals, budget)

    return NextResponse.json({
      analysis: result.text,
      toolResults: result.toolResults,
    })
  } catch (error) {
    console.error("Error in property analysis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
