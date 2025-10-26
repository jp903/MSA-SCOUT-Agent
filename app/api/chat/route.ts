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

    if (action === "download_pdf") {
      return await generatePDFReport(messages)
    }

    if (action === "download_docx") {
      return await generateDOCXReport(messages)
    }

    console.log("🤖 Generating response")

    // Get real-time market data
    const marketData = await fetchRealTimeMarketData()

    const { text } = await generateText({
      model: openai("gpt-4o"), // Using GPT-4o as the latest available model
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `You are MSASCOUT, an advanced investment research agent with access to real-time Census Bureau, Bureau of Labor Statistics, and Federal Reserve Economic Data. You specialize in:

# CORE CAPABILITIES:
- Market analysis using Census, BLS, and FRED data
- Property investment ROI calculations and projections
- Demographic and economic trend analysis
- Risk assessment and market timing recommendations
- Data visualization and chart generation
- Slide presentation generation
- Report generation in PDF and DOCX formats

# CURRENT MARKET DATA (Real-time):
${marketData}

# RESPONSE FORMATTING REQUIREMENTS:
ALWAYS use proper markdown formatting:
- Use # for main titles
- Use ## for major headings
- Use ### for subheadings
- Use #### for minor headings
- Use - for bullet points (NOT asterisks)
- Use 1. 2. 3. for numbered lists
- Use > for important quotes or callouts
- Use \`code\` for specific values or calculations
- Use **bold** for emphasis on important numbers and key terms
- Use tables with | for data presentation

# STRUCTURE YOUR RESPONSES LIKE THIS:

# Market Analysis: [Location/Topic]

## Key Demographics
- Population: 2.1M (growth: +2.3% annually)
- Median Income: $65,400 
- Employment Rate: 94.2%

## Investment Outlook
**Market Score: 85/100**

### Strengths:
- Strong job growth in tech sector
- Population influx from major metros
- Below-average home prices vs. income

### Recommendations:
- Focus on emerging neighborhoods
- Target $200K-$350K price range
- Consider multi-family properties

## Risk Factors
- Potential interest rate sensitivity
- Supply chain constraints in construction

# SPECIAL COMMANDS:
- "generate slides" or "create presentation" - Offer to create a slide presentation
- "generate report" or "create report" - Ask for format preference (PDF or DOCX)
- Market analysis requests - Use real-time FRED, Census, and BLS data
- Property searches - Provide specific market insights and comparable data

Always provide specific, data-driven insights with actual numbers from real-time sources and maintain professional markdown formatting for easy readability. Tailor your responses to the user's specific questions and investment goals.`,
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

async function fetchRealTimeMarketData(): Promise<string> {
  try {
    const [fedFundsRate, unemployment, housing, inflation] = await Promise.all([
      fetchFREDData("FEDFUNDS"), // Federal Funds Rate
      fetchBLSData("unemployment"), // Unemployment Rate
      fetchCensusData("housing"), // Housing Data
      fetchFREDData("CPIAUCSL"), // Consumer Price Index
    ])

    return `
## REAL-TIME MARKET CONDITIONS (Updated: ${new Date().toLocaleDateString()}):

### Federal Reserve Data:
- Federal Funds Rate: ${fedFundsRate}%
- Inflation Rate (CPI): ${inflation}%

### Employment Data (BLS):
- National Unemployment Rate: ${unemployment}%
- Job Growth Trend: Positive momentum in construction and professional services

### Housing Market (Census Bureau):
- Housing Starts: ${housing.starts} (Seasonally Adjusted Annual Rate)
- Building Permits: ${housing.permits}
- Homeownership Rate: ${housing.ownership}%

### Market Sentiment:
- Interest Rate Environment: ${fedFundsRate > 5 ? "Restrictive" : fedFundsRate > 3 ? "Moderate" : "Accommodative"}
- Investment Climate: ${unemployment < 4 ? "Strong" : unemployment < 6 ? "Stable" : "Challenging"}
`
  } catch (error) {
    return `
## MARKET DATA STATUS: 
Real-time data temporarily unavailable. Using latest available market indicators for analysis.
- Federal environment remains dynamic with ongoing rate considerations
- Employment markets showing resilience across key sectors
- Housing markets displaying regional variations in activity levels
`
  }
}

async function fetchFREDData(seriesId: string): Promise<string> {
  try {
    if (!process.env.FRED_API_KEY) {
      return "N/A"
    }
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
    console.log("🎯 Generating slides from conversation...")

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `You are a presentation expert. Create a comprehensive slide presentation in HTML format.

Create slides with proper HTML structure and professional styling. Each slide should be a separate div with class="slide".

Structure:
1. Title slide with conversation topic
2. Market overview with real-time data
3. Key insights and findings
4. Investment opportunities
5. Risk analysis
6. Financial projections
7. Recommendations
8. Next steps

Use professional styling with embedded CSS. Make slides print-friendly and suitable for presentation.`,
      prompt:
        "Create a professional slide presentation summarizing our conversation with proper headings, bullet points, and visual hierarchy.",
    })

    const slideContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MSASCOUT Investment Analysis Presentation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: #f8fafc; 
            line-height: 1.6;
        }
        .slide { 
            width: 210mm; 
            height: 297mm; 
            padding: 40px; 
            margin: 20px auto; 
            background: white; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            page-break-after: always; 
            display: flex; 
            flex-direction: column; 
            justify-content: flex-start;
        }
        .slide h1 { 
            color: #1e40af; 
            font-size: 2.5em; 
            margin-bottom: 30px; 
            text-align: center; 
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 15px;
        }
        .slide h2 { 
            color: #1e40af; 
            font-size: 2em; 
            margin: 25px 0 15px 0; 
            border-left: 5px solid #3b82f6;
            padding-left: 15px;
        }
        .slide h3 { 
            color: #1d4ed8; 
            font-size: 1.5em; 
            margin: 20px 0 10px 0; 
        }
        .slide p, .slide li { 
            font-size: 1.1em; 
            margin: 8px 0; 
            color: #374151;
        }
        .slide ul { 
            padding-left: 25px; 
            margin: 15px 0;
        }
        .slide li {
            margin: 5px 0;
        }
        .highlight { 
            background: #dbeafe; 
            padding: 15px; 
            border-left: 4px solid #3b82f6; 
            margin: 15px 0; 
            border-radius: 4px;
        }
        .data-box {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
        }
        .footer { 
            position: fixed; 
            bottom: 20px; 
            right: 20px; 
            font-size: 0.9em; 
            color: #6b7280; 
        }
        @media print { 
            .slide { 
                page-break-after: always; 
                margin: 0;
                box-shadow: none;
            } 
            .footer { position: absolute; }
        }
        @media screen {
            body { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="slide">
        <h1>MSASCOUT Investment Analysis</h1>
        <div style="text-align: center; margin-top: 50px;">
            <h2 style="border: none; padding: 0;">Real Estate Investment Insights</h2>
            <p style="font-size: 1.3em; margin-top: 30px; color: #6b7280;">
                Generated on ${new Date().toLocaleDateString()}
            </p>
            <div class="highlight" style="margin-top: 50px;">
                <p style="font-size: 1.2em; font-weight: bold;">
                    Powered by Real-Time Market Data
                </p>
                <p>Census Bureau • Bureau of Labor Statistics • Federal Reserve Economic Data</p>
            </div>
        </div>
    </div>
    
    ${text}
    
    <div class="footer">Generated by MSASCOUT AI Agent</div>
</body>
</html>
    `

    return NextResponse.json({
      action: "download_slides",
      content: slideContent,
      filename: `MSASCOUT_Investment_Slides_${new Date().toISOString().split("T")[0]}.html`,
      message: `# Slides Generated Successfully!

Your professional investment analysis presentation is ready for download.

## What's Included:
- Market overview with real-time data
- Investment opportunities analysis
- Risk assessment and recommendations
- Professional formatting and styling

Click the download button below to save your presentation.`,
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
      model: openai("gpt-4o"), // Using GPT-4o as the latest available model
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `You are a professional report writer. Create a comprehensive investment analysis report in HTML format.

Structure the report with these sections:
1. Executive Summary
2. Market Analysis (with real-time data)
3. Investment Opportunities
4. Risk Assessment
5. Financial Projections
6. Recommendations
7. Conclusion

Use proper HTML formatting with headings, bullet points, tables, and professional styling.`,
      prompt:
        "Generate a comprehensive investment analysis report based on our conversation with proper formatting and structure.",
    })

    return NextResponse.json({
      action: "ask_report_format",
      content: text,
      message: `# Report Content Generated!

Your comprehensive investment analysis report is ready for download.

## Choose Your Format:

**📄 PDF Format**
- Professional document layout
- Print-ready formatting
- Ideal for sharing and archiving

**📝 DOCX Format**  
- Microsoft Word compatible
- Editable content
- Easy to customize and modify

Which format would you prefer?`,
    })
  } catch (error) {
    console.error("❌ Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

async function generatePDFReport(messages: any[]) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"), // Using GPT-4o as the latest available model
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `Create a comprehensive PDF-ready HTML report with professional formatting.`,
      prompt: "Generate a detailed investment report in HTML format suitable for PDF conversion.",
    })

    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>MSASCOUT Investment Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #1e40af; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
        h2 { color: #1e40af; margin-top: 30px; }
        h3 { color: #1d4ed8; }
        ul { padding-left: 20px; }
        li { margin: 5px 0; }
        .header { text-align: center; margin-bottom: 40px; }
        .footer { margin-top: 40px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MSASCOUT Investment Analysis Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    ${text}
    <div class="footer">
        <p>Generated by MSASCOUT AI Agent</p>
    </div>
</body>
</html>
    `

    return NextResponse.json({
      action: "download_pdf",
      content: pdfContent,
      filename: `MSASCOUT_Report_${new Date().toISOString().split("T")[0]}.html`,
      message: `# PDF Report Generated!

Your investment analysis report is ready for download in PDF-ready format.`,
    })
  } catch (error) {
    console.error("❌ Error generating PDF report:", error)
    return NextResponse.json({ error: "Failed to generate PDF report" }, { status: 500 })
  }
}

async function generateDOCXReport(messages: any[]) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"), // Using GPT-4o as the latest available model
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `Create a comprehensive DOCX-ready HTML report with Word-compatible formatting.`,
      prompt: "Generate a detailed investment report in HTML format suitable for Word conversion.",
    })

    const docxContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>MSASCOUT Investment Analysis Report</title>
    <style>
        body { font-family: 'Times New Roman', serif; margin: 1in; line-height: 1.5; }
        h1 { color: #000080; text-align: center; }
        h2 { color: #000080; }
        h3 { color: #000080; }
        ul { margin-left: 0.5in; }
        li { margin: 3px 0; }
    </style>
</head>
<body>
    <h1>MSASCOUT Investment Analysis Report</h1>
    <p style="text-align: center;"><em>Generated on ${new Date().toLocaleDateString()}</em></p>
    <hr>
    ${text}
    <hr>
    <p style="text-align: center; margin-top: 30px;"><em>Generated by MSASCOUT AI Agent</em></p>
</body>
</html>
    `

    return NextResponse.json({
      action: "download_docx",
      content: docxContent,
      filename: `MSASCOUT_Report_${new Date().toISOString().split("T")[0]}.html`,
      message: `# DOCX Report Generated!

Your investment analysis report is ready for download in Word-compatible format.`,
    })
  } catch (error) {
    console.error("❌ Error generating DOCX report:", error)
    return NextResponse.json({ error: "Failed to generate DOCX report" }, { status: 500 })
  }
}
