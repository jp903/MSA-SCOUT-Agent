import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    console.log("🤖 Processing chat request with", messages.length, "messages")

    const result = streamText({
      model: openai("gpt-4o"),
      system: `You are MSASCOUT, an advanced property investment agent powered by real-time market data from the Census Bureau and Bureau of Labor Statistics. 

Your expertise includes:
- Real estate market analysis with specific data points and numbers
- Investment property evaluation and ROI calculations  
- Market trend analysis with demographic and economic factors
- Risk assessment and opportunity identification
- Data-driven investment recommendations

Always provide:
- Specific numbers and data points when available
- Market trends with supporting evidence
- Clear investment recommendations with reasoning
- Risk factors and mitigation strategies
- Actionable insights for property investors

Use a professional, analytical tone while being accessible to both novice and experienced investors. When discussing markets, always reference specific metrics like population growth rates, job growth percentages, median home prices, rental yields, and vacancy rates.`,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("❌ Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
