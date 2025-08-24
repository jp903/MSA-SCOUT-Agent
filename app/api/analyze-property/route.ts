import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { propertyData, images } = await request.json()

    if (!propertyData) {
      return NextResponse.json({ error: "Property data is required" }, { status: 400 })
    }

    const prompt = `
      Analyze this property for investment potential:
      
      Property Details:
      ${JSON.stringify(propertyData, null, 2)}
      
      ${images && images.length > 0 ? `Images provided: ${images.length} images` : "No images provided"}
      
      Please provide:
      1. Investment score (1-10)
      2. Key strengths and weaknesses
      3. Estimated rental yield
      4. Market comparison
      5. Risk assessment
      6. Recommendations
      
      Format as JSON with clear sections.
    `

    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt,
      maxTokens: 1000,
    })

    return NextResponse.json({
      analysis: text,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Property analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze property" }, { status: 500 })
  }
}
