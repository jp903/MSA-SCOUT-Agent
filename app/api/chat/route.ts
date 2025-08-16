import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { messages, action } = await request.json()

    console.log("📨 Chat API received messages:", messages?.length || 0)

    if (!messages || !Array.isArray(messages)) {
      console.error("❌ Invalid messages format:", messages)
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OpenAI API key not found")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Handle special actions
    if (action === "generate_slides") {
      return await generateSlides(messages)
    }

    if (action === "generate_report") {
      return await generateReport(messages)
    }

    console.log("🤖 Generating response")

    const { text } = await generateText({
      model: openai("gpt-5"),
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `You are MSASCOUT, an advanced investment research agent with access to real-time Census Bureau and Bureau of Labor Statistics data. You specialize in:

🏠 CORE CAPABILITIES:
- Market analysis using Census and BLS data
- Property investment ROI calculations and projections
- Demographic and economic trend analysis
- Risk assessment and market timing recommendations
- Data visualization and chart generation
- Slide presentation generation
- Report generation in PDF and DOCX formats

📊 DATA SOURCES:
- U.S. Census Bureau: Population, housing, income, migration data
- Bureau of Labor Statistics: Employment, wages, job growth data
- Real-time market indicators and trends
- Historical performance data for predictive modeling

💡 RESPONSE FORMATTING GUIDELINES:
- ALWAYS format responses with clear structure using markdown-style formatting
- Use ## for main headings, ### for subheadings
- Use **bold** for important numbers, percentages, and key terms
- Use bullet points (- or •) for lists and key insights
- Highlight dollar amounts and percentages for easy scanning
- Structure responses with clear sections: Analysis, Key Findings, Recommendations, Risk Factors
- Include specific data points with sources when available
- Use professional investment terminology
- Keep paragraphs concise and scannable

📈 RESPONSE STRUCTURE EXAMPLE:
## Market Analysis: [Location]

### Key Demographics
- Population: **2.1M** (growth: **+2.3%** annually)
- Median Income: **$65,400** 
- Employment Rate: **94.2%**

### Investment Outlook
**Market Score: 85/100**

**Strengths:**
- Strong job growth in tech sector
- Population influx from major metros
- Below-average home prices vs. income

**Recommendations:**
- Focus on emerging neighborhoods
- Target $200K-$350K price range
- Consider multi-family properties

### Risk Factors
- Potential interest rate sensitivity
- Supply chain constraints in construction

🎯 SPECIAL COMMANDS:
- "generate slides" or "create presentation" - Offer to create a slide presentation
- "generate report" or "create report" - Ask for format preference (PDF or DOCX)

Always provide specific, data-driven insights with actual numbers and maintain professional formatting for easy readability.`,
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

async function generateSlides(messages: any[]) {
  try {
    console.log("🎯 Generating slides from conversation...")

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
- Market analysis summary
- Investment recommendations
- Risk factors
- Conclusion and next steps

Use professional styling with CSS embedded in the HTML. Make it suitable for download and presentation.`,
      prompt:
        "Generate a professional slide presentation summarizing all the key points, insights, and recommendations from our conversation. Include charts and visual elements where appropriate.",
    })

    // Create HTML content for slides
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
    <div class="footer">Generated by MSASCOUT AI Agent</div>
</body>
</html>
    `

    return NextResponse.json({
      action: "download_slides",
      content: slideContent,
      filename: `MSASCOUT_Investment_Analysis_${new Date().toISOString().split("T")[0]}.html`,
      message: "Slides generated successfully! Click to download your presentation.",
    })
  } catch (error) {
    console.error("❌ Error generating slides:", error)
    return NextResponse.json({ error: "Failed to generate slides" }, { status: 500 })
  }
}

async function generateReport(messages: any[]) {
  try {
    console.log("📄 Generating report from conversation...")

    const { text } = await generateText({
      model: openai("gpt-5"),
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `You are a professional report writer. Analyze the conversation and create a comprehensive investment analysis report.

Create a detailed report with the following sections:
1. Executive Summary
2. Market Analysis
3. Investment Opportunities
4. Risk Assessment
5. Financial Projections
6. Recommendations
7. Conclusion

Format the report in clean HTML that can be easily converted to PDF or DOCX. Use professional styling and include tables, charts descriptions, and data where mentioned in the conversation.`,
      prompt:
        "Generate a comprehensive investment analysis report based on our conversation. Include all key findings, data points, calculations, and recommendations discussed.",
    })

    return NextResponse.json({
      action: "ask_report_format",
      content: text,
      message:
        "Report content generated! In which format would you like to download the report?\n\n📄 **PDF** - Professional document format\n📝 **DOCX** - Microsoft Word format\n\nPlease specify your preference.",
    })
  } catch (error) {
    console.error("❌ Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
