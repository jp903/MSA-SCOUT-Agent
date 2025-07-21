import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { state, marketData } = await request.json()

    const prompt = `
You are a real estate market analyst with expertise in property investment. Analyze the following market data for ${state} and provide insights:

Market Data:
- Population Growth: ${marketData.population_growth}%
- Job Growth: ${marketData.job_growth}%
- House Price Index Growth: ${marketData.house_price_index_growth}%
- Net Migration: ${marketData.net_migration} people
- Vacancy Rate: ${marketData.vacancy_rate}%
- International Inflows: ${marketData.international_inflows} people
- Single Family Permits: ${marketData.single_family_permits}
- Multi Family Permits: ${marketData.multi_family_permits}

Please provide a comprehensive analysis in the following JSON format:
{
"summary": "Brief 1-2 sentence overview of the market",
"keyDrivers": ["List of 3-4 key positive factors driving the market"],
"riskFactors": ["List of 2-3 potential risks or concerns"],
"investmentRecommendation": "Clear investment recommendation with reasoning",
"confidenceLevel": "Confidence level as a number between 0-100"
}

Focus on actionable insights for real estate investors. Consider factors like supply/demand dynamics, economic fundamentals, and demographic trends.
Return ONLY valid JSON with no markdown or back-ticks.
`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.3,
    })

    // --- NEW: sanitize model output ---------------------------------
    // GPT occasionally wraps JSON in \`\`\`json ... \`\`\` fences – strip them:
    const jsonText = text
      .trim()
      .replace(/^```(?:json)?/i, "") // remove opening fence
      .replace(/```$/, "") // remove closing fence
      .trim()

    const analysis = JSON.parse(jsonText)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error analyzing market:", error)

    // Return fallback analysis if OpenAI fails
    return NextResponse.json({
      summary: "Market analysis temporarily unavailable. Using fallback data.",
      keyDrivers: ["Stable market fundamentals", "Consistent economic indicators"],
      riskFactors: ["Standard market risks apply"],
      investmentRecommendation: "Proceed with standard due diligence",
      confidenceLevel: 60,
    })
  }
}
