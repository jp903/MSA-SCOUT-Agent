import { type NextRequest, NextResponse } from "next/server"
import { analyzeMarketData } from "@/lib/data-analysis-agent"

export async function POST(request: NextRequest) {
  try {
    const { query, locations, includeVisuals } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const result = await analyzeMarketData(query, locations || [])

    return NextResponse.json({
      analysis: result.text,
      toolResults: result.toolResults,
      visualizations: includeVisuals
        ? {
            charts: [
              {
                type: "bar",
                title: "Market Comparison",
                data: {
                  labels: locations || ["Market A", "Market B", "Market C"],
                  datasets: [
                    {
                      label: "Investment Score",
                      data: [85, 72, 68],
                      backgroundColor: ["#3B82F6", "#10B981", "#F59E0B"],
                    },
                  ],
                },
              },
            ],
          }
        : null,
    })
  } catch (error) {
    console.error("Error in market analysis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
