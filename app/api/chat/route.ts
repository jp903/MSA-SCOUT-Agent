import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    console.log("📨 Chat API received messages:", messages?.length || 0)

    if (!messages || !Array.isArray(messages)) {
      console.error("❌ Invalid messages format:", messages)
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OpenAI API key not found")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    console.log("🤖 Generating response with OpenAI...")

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `You are MSASCOUT, an advanced property investment research agent with access to real-time Census Bureau and Bureau of Labor Statistics data. You specialize in:

🏠 CORE CAPABILITIES:
- Real estate market analysis using Census and BLS data
- Property investment ROI calculations and projections
- Demographic and economic trend analysis
- Risk assessment and market timing recommendations
- Data visualization and chart generation

📊 DATA SOURCES:
- U.S. Census Bureau: Population, housing, income, migration data
- Bureau of Labor Statistics: Employment, wages, job growth data
- Real-time market indicators and trends
- Historical performance data for predictive modeling

💡 RESPONSE GUIDELINES:
- Always provide specific, data-driven insights with actual numbers
- Include relevant market trends and supporting statistics
- Generate charts and visualizations when discussing data
- Offer actionable investment recommendations
- Highlight both opportunities and risk factors
- Use professional real estate investment terminology

🎯 EXAMPLE RESPONSES:
When asked about a state market: "Based on latest Census data, Texas shows 1.8% population growth with 45,000 net migration. BLS employment data indicates 3.2% job growth, particularly strong in tech and healthcare sectors. This translates to a market score of 78/100 for investment potential."

Always be specific, data-focused, and provide actionable insights for property investors.`,
    })

    console.log("✅ Chat API generated response successfully")

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error("❌ Error in chat API:", error)

    // Provide more specific error information
    let errorMessage = "Failed to process chat request"
    const errorDetails = error instanceof Error ? error.message : String(error)

    if (errorDetails.includes("API key")) {
      errorMessage = "OpenAI API configuration error"
    } else if (errorDetails.includes("rate limit")) {
      errorMessage = "Rate limit exceeded, please try again later"
    } else if (errorDetails.includes("network")) {
      errorMessage = "Network error, please check your connection"
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 },
    )
  }
}
