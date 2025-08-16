import type { NextRequest } from "next/server"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

// Real-time data fetching functions
async function getFREDData() {
  try {
    const response = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&api_key=${process.env.FRED_API_KEY}&file_type=json&limit=1&sort_order=desc`,
    )
    const data = await response.json()
    return data.observations?.[0]?.value || "N/A"
  } catch (error) {
    console.error("FRED API error:", error)
    return "N/A"
  }
}

async function getBLSData() {
  try {
    const response = await fetch("https://api.bls.gov/publicAPI/v2/timeseries/data/CUUR0000SA0L2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesid: ["CUUR0000SA0L2"],
        startyear: "2024",
        endyear: "2024",
      }),
    })
    const data = await response.json()
    return data.Results?.series?.[0]?.data?.[0]?.value || "N/A"
  } catch (error) {
    console.error("BLS API error:", error)
    return "N/A"
  }
}

async function getCensusData() {
  try {
    const response = await fetch("https://api.census.gov/data/2022/acs/acs1?get=B25077_001E&for=us:*")
    const data = await response.json()
    return data?.[1]?.[0] || "N/A"
  } catch (error) {
    console.error("Census API error:", error)
    return "N/A"
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]?.content || ""

    // Check if user is requesting slides or reports
    const isRequestingSlides =
      lastMessage.toLowerCase().includes("slide") || lastMessage.toLowerCase().includes("presentation")
    const isRequestingReport =
      lastMessage.toLowerCase().includes("report") || lastMessage.toLowerCase().includes("analysis")

    // Fetch real-time data
    const [mortgageRate, housingCPI, medianHomeValue] = await Promise.all([
      getFREDData(),
      getBLSData(),
      getCensusData(),
    ])

    const currentDate = new Date().toLocaleDateString()
    const realTimeContext = `
Current Market Data (${currentDate}):
- 30-Year Mortgage Rate: ${mortgageRate}%
- Housing CPI: ${housingCPI}
- Median Home Value: $${medianHomeValue}
`

    let systemPrompt = `You are an expert real estate investment advisor with access to real-time market data. 

${realTimeContext}

IMPORTANT FORMATTING RULES:
- Use proper markdown formatting with # for main titles, ## for major headings, ### for subheadings
- Use - for bullet points (NOT asterisks *)
- Use **bold** for emphasis
- Use numbered lists with 1. 2. 3. format
- Structure responses with clear headings and organized bullet points
- Always include real-time data when relevant

Provide comprehensive, data-driven advice on real estate investments, market analysis, property valuation, and financial calculations. Use the current market data to inform your recommendations.`

    if (isRequestingSlides) {
      systemPrompt += `

The user is requesting a presentation/slides. Format your response as a structured presentation with:
# Main Title
## Slide 1: [Topic]
### Key Points:
- Point 1
- Point 2
- Point 3

## Slide 2: [Topic]
### Analysis:
- Data point 1
- Data point 2

Include download options at the end with:
**Download Options:**
- [Download Slides (HTML)](download-slides)
- [Download PDF Report](download-pdf)
- [Download DOCX Report](download-docx)`
    }

    if (isRequestingReport) {
      systemPrompt += `

The user is requesting a detailed report. Structure your response as a comprehensive report with:
# Executive Summary
## Market Analysis
### Current Conditions:
- Market trend 1
- Market trend 2

## Investment Recommendations
### Key Strategies:
- Strategy 1
- Strategy 2

Include download options at the end with:
**Download Options:**
- [Download PDF Report](download-pdf)
- [Download DOCX Report](download-docx)
- [Download Slides (HTML)](download-slides)`
    }

    const result = await streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages,
      temperature: 0.7,
      maxTokens: 2000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Error processing request", { status: 500 })
  }
}
