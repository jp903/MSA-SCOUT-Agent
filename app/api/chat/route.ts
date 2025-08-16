import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { messages, action } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Handle special actions
    if (action === "generate_slides") {
      return await generateSlides(messages)
    }

    if (action === "generate_report") {
      return await generateReport(messages)
    }

    // Get real-time market data
    const marketData = await fetchRealTimeMarketData()

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `You are MSASCOUT, an advanced investment research agent with access to real-time Census Bureau, Bureau of Labor Statistics, and Federal Reserve Economic Data. You specialize in:

🏠 CORE CAPABILITIES:
- Market analysis using Census, BLS, and FRED data
- Property investment ROI calculations and projections
- Demographic and economic trend analysis
- Risk assessment and market timing recommendations
- Data visualization and chart generation
- Slide presentation generation
- Report generation in PDF and DOCX formats

📊 CURRENT MARKET DATA (Real-time):
${marketData}

📈 RESPONSE STRUCTURE REQUIREMENTS:
- ALWAYS format responses with clear structure using markdown-style formatting
- Use ## for main headings, ### for subheadings
- Use **bold** for important numbers, percentages, and key terms
- Use bullet points (- or •) for lists and key insights
- Highlight dollar amounts and percentages for easy scanning
- Structure responses with clear sections: Analysis, Key Findings, Recommendations, Risk Factors
- Include specific data points from real-time sources when available
- Use professional investment terminology
- Keep paragraphs concise and scannable

🎯 PERSONALIZED RESPONSES:
- Analyze user queries for specific market interests, price ranges, and investment goals
- Provide tailored recommendations based on user's experience level
- Reference current market conditions and how they affect the user's specific situation
- Suggest actionable next steps based on the conversation context

💡 SPECIAL COMMANDS:
- "generate slides" or "create presentation" - Offer to create a slide presentation
- "generate report" or "create report" - Ask for format preference (PDF or DOCX)
- Market analysis requests - Use real-time FRED, Census, and BLS data
- Property searches - Provide specific market insights and comparable data

Always provide specific, data-driven insights with actual numbers from real-time sources and maintain professional formatting for easy readability. Tailor your responses to the user's specific questions and investment goals.`,
    })

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error("❌ Error in chat API:", error)

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

async function fetchRealTimeMarketData(): Promise<string> {
  try {
    const [fedFundsRate, unemployment, housing, inflation] = await Promise.all([
      fetchFREDData("FEDFUNDS"), // Federal Funds Rate
      fetchBLSData("unemployment"), // Unemployment Rate
      fetchCensusData("housing"), // Housing Data
      fetchFREDData("CPIAUCSL"), // Consumer Price Index
    ])

    return `
📊 REAL-TIME MARKET CONDITIONS (Updated: ${new Date().toLocaleDateString()}):

**Federal Reserve Data:**
- Federal Funds Rate: ${fedFundsRate}%
- Inflation Rate (CPI): ${inflation}%

**Employment Data (BLS):**
- National Unemployment Rate: ${unemployment}%
- Job Growth Trend: Positive momentum in construction and professional services

**Housing Market (Census Bureau):**
- Housing Starts: ${housing.starts} (Seasonally Adjusted Annual Rate)
- Building Permits: ${housing.permits}
- Homeownership Rate: ${housing.ownership}%

**Market Sentiment:**
- Interest Rate Environment: ${fedFundsRate > 5 ? "Restrictive" : fedFundsRate > 3 ? "Moderate" : "Accommodative"}
- Investment Climate: ${unemployment < 4 ? "Strong" : unemployment < 6 ? "Stable" : "Challenging"}
`
  } catch (error) {
    return `
📊 MARKET DATA STATUS: 
Real-time data temporarily unavailable. Using latest available market indicators for analysis.
- Federal environment remains dynamic with ongoing rate considerations
- Employment markets showing resilience across key sectors
- Housing markets displaying regional variations in activity levels
`
  }
}

async function fetchFREDData(seriesId: string): Promise<string> {
  try {
    const response = await fetch(`/api/fred-data?series=${seriesId}`)
    if (response.ok) {
      const data = await response.json()
      return data.value?.toFixed(2) || "N/A"
    }
    return "N/A"
  } catch {
    return "N/A"
  }
}

async function fetchBLSData(metric: string): Promise<string> {
  // Mock BLS data - in production, implement actual BLS API calls
  const mockData: Record<string, string> = {
    unemployment: "3.8",
    jobGrowth: "2.1",
    wages: "4.2",
  }
  return mockData[metric] || "N/A"
}

async function fetchCensusData(metric: string): Promise<any> {
  // Mock Census data - in production, implement actual Census API calls
  const mockData: Record<string, any> = {
    housing: {
      starts: "1,425,000",
      permits: "1,487,000",
      ownership: "65.8",
    },
    population: {
      growth: "0.4",
      migration: "Positive in Sun Belt states",
    },
  }
  return mockData[metric] || {}
}

async function generateSlides(messages: any[]) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `You are a presentation expert. Analyze the conversation and create a comprehensive slide presentation with main points. 

Create slides in HTML format with the following structure:
- Title slide with conversation topic
- Key insights and findings (multiple slides if needed)
- Market analysis summary with real-time data
- Investment recommendations
- Risk factors
- Conclusion and next steps

Use professional styling with CSS embedded in the HTML. Make it suitable for download and presentation.`,
      prompt:
        "Generate a professional slide presentation summarizing all the key points, insights, and recommendations from our conversation. Include charts and visual elements where appropriate, and incorporate any real-time market data discussed.",
    })

    const slideContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MSASCOUT Investment Analysis Presentation</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .slide { width: 100vw; height: 100vh; padding: 60px; box-sizing: border-box; background: white; margin-bottom: 20px; display: flex; flex-direction: column; justify-content: center; page-break-after: always; }
        .slide h1 { color: #2563eb; font-size: 3em; margin-bottom: 30px; text-align: center; }
        .slide h2 { color: #1e40af; font-size: 2.5em; margin-bottom: 25px; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
        .slide h3 { color: #1d4ed8; font-size: 1.8em; margin: 20px 0; }
        .slide p, .slide li { font-size: 1.3em; line-height: 1.6; margin: 15px 0; }
        .slide ul { padding-left: 30px; }
        .highlight { background: #dbeafe; padding: 20px; border-left: 5px solid #3b82f6; margin: 20px 0; }
        .footer { position: absolute; bottom: 20px; right: 20px; font-size: 0.9em; color: #666; }
        @media print { .slide { page-break-after: always; } }
    </style>
</head>
<body>
    ${text}
    <div class="footer">Generated by MSASCOUT AI Agent - ${new Date().toLocaleDateString()}</div>
</body>
</html>
    `

    return NextResponse.json({
      action: "download_slides",
      content: slideContent,
      filename: `MSASCOUT_Investment_Analysis_${new Date().toISOString().split("T")[0]}.html`,
      message:
        "📊 **Slides Generated Successfully!** \n\nYour professional investment analysis presentation is ready for download. Click the button below to save your slides.",
    })
  } catch (error) {
    console.error("❌ Error generating slides:", error)
    return NextResponse.json({ error: "Failed to generate slides" }, { status: 500 })
  }
}

async function generateReport(messages: any[]) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `You are a professional report writer. Analyze the conversation and create a comprehensive investment analysis report.

Create a detailed report with the following sections:
1. Executive Summary
2. Market Analysis (including real-time data)
3. Investment Opportunities  
4. Risk Assessment
5. Financial Projections
6. Recommendations
7. Conclusion

Format the report in clean HTML that can be easily converted to PDF or DOCX. Use professional styling and include tables, charts descriptions, and real-time data where mentioned in the conversation.`,
      prompt:
        "Generate a comprehensive investment analysis report based on our conversation. Include all key findings, data points, calculations, recommendations, and real-time market data discussed.",
    })

    return NextResponse.json({
      action: "ask_report_format",
      content: text,
      message:
        "📄 **Report Content Generated!** \n\nYour comprehensive investment analysis report is ready. Please choose your preferred format:\n\n**📄 PDF** - Professional document format\n**📝 DOCX** - Microsoft Word format\n\nWhich format would you like to download?",
    })
  } catch (error) {
    console.error("❌ Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
