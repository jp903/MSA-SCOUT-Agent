import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    const systemPrompt = `You are MSASCOUT AI, an advanced property investment assistant. You help users with:

1. Real estate market analysis and trends
2. Investment property calculations (ROI, cash flow, cap rates)
3. Property investment strategies and recommendations
4. Market data interpretation and insights
5. Risk assessment for real estate investments

You have access to data from these states: Texas, Nevada, Arkansas, Alabama, Florida, Georgia, Montana, Ohio, Indiana, North Carolina, Tennessee, Arizona, Missouri, Michigan, South Carolina, Kentucky.

Provide helpful, accurate, and actionable advice for property investors. Be conversational but professional. Use data-driven insights when possible.`

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ]

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages as any,
      max_tokens: 500,
      temperature: 0.7,
    })

    const response =
      completion.choices[0]?.message?.content || "I apologize, but I couldn't process your request. Please try again."

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
