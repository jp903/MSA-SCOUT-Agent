import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    // Enhanced system prompt with chart generation capabilities
    const systemPrompt = `You are MSASCOUT AI, a professional property investment assistant with advanced analytics capabilities. You help users with:

1. Property investment analysis and recommendations
2. Real-time market insights and trends
3. ROI calculations and financial projections
4. Investment strategy guidance
5. Risk assessment for real estate investments
6. Chart and graph generation for data visualization
7. File analysis (documents, spreadsheets, images)

Key capabilities:
- Generate charts when users ask for graphs, trends, comparisons, or visual data
- Analyze uploaded files (PDFs, spreadsheets, images) and provide insights
- Provide real-time market data and analysis
- Calculate investment metrics and projections
- Offer location-specific advice for US markets

When users request charts or graphs, acknowledge that you'll generate them and describe what the chart will show.
When users upload files, analyze the content and provide relevant insights.
Always provide actionable, data-driven advice for property investors.

Keep responses professional, informative, and focused on real estate investment topics.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content:
          msg.attachments && msg.attachments.length > 0
            ? `${msg.content}\n\n[User attached ${msg.attachments.length} file(s): ${msg.attachments.map((att: any) => att.name).join(", ")}]`
            : msg.content,
      })),
    })

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}
