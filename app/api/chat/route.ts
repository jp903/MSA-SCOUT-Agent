import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    console.log("📨 Chat API received messages:", messages?.length || 0)

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `You are MSASCOUT AI, a specialized property investment assistant. You help users analyze real estate markets, calculate investment returns, and provide market insights. 

Key capabilities:
- Property market analysis across US states
- Investment ROI calculations
- Market trend analysis
- Risk assessment
- Cash flow projections
- Chart and data visualization recommendations

Always provide actionable, data-driven advice for property investment decisions. Be concise but thorough in your responses.`,
    })

    console.log("✅ Chat API generated response")

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error("❌ Error in chat API:", error)
    return NextResponse.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
