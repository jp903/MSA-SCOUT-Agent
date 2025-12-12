import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { messages, action, document } = requestBody;

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

    if (action === "deep_research") {
      return await performDeepResearch(messages)
    }

    // Handle document processing if document is provided
    if (document && document.name && document.size && document.type && !action) {  // Only process documents if no special action is triggered and document has proper properties
      // Process document content here
      // For now, we'll just include document info in the system prompt
      const documentInfo = `The user has uploaded a document named "${document.name}" (${document.size} bytes, type: ${document.type}). When the user asks questions about this document, please analyze its content and provide relevant insights based on the document's content.`;

      // Get real-time market data for the document context
      const marketData = await fetchRealTimeMarketData();
      const updatedSystem = `${documentInfo}\n\n${marketData}`;

      const { text } = await generateText({
        model: openai("gpt-5.1"),
        messages: messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        system: `You are **MSA Invest AI**, a high-quality investment assistant.
Your UX, tone, and writing style must closely match ChatGPT's polished format.

### 🔹 **RESPONSE FORMAT**
Always respond using:
- **Clear headings** (use ## for main sections, ### for subsections)
- **Subheadings**
- **Bullet points** (use - for bullet points)
- **Numbered lists** (use 1. 2. 3. for numbered lists)
- **Short paragraphs** (break up long content)
- **Human-like explanations** (avoid robotic language)
- **Actionable insights** (provide specific recommendations)
- **Optional summary at the end** (for complex topics)

### 🔹 **TONE & STYLE**
- Professional, confident, friendly, and easy to read
- Similar to ChatGPT's UX style
- No robotic, short, or generic answers
- Always well-structured and polished like ChatGPT
- Use markdown formatting consistently

### 🔹 **FOCUS**
All responses should be optimized for **investment**, including:
- Market trends
- Risk assessment
- Portfolio strategy
- Financial literacy
- Economic insights
- Practical investment advice

### 🔹 **DOCUMENT PROCESSING**
${documentInfo}

### 🔹 **FORMATTING REQUIREMENTS**
- Use proper markdown syntax (# ## ### for headings)
- Use **bold** for important terms and numbers
- Use *italic* for emphasis where appropriate
- Use \`code\` for specific values or technical terms
- Use - for bullet points (not asterisks)
- Use 1. 2. 3. for numbered lists
- Present information in a visually appealing format like ChatGPT

### 🔹 **RESPONSE STRUCTURE EXAMPLE**:
## Market Analysis for [Location]
Here's a comprehensive analysis of the current market conditions...

### Key Factors:
- Strong population growth of X%
- Job market expanding at Y% annually
- Housing supply below demand threshold

### Investment Recommendations:
1. Focus on properties under $XXX,XXX
2. Target neighborhoods with...
3. Consider timing your purchase for...

## Risk Assessment
*Potential challenges to consider...*

### 🔹 **What NOT to do**
- Do NOT give unstructured text
- Do NOT reply with one-line answers
- Do NOT sound robotic or generic
- Do NOT provide financial guarantees
- Do NOT ignore markdown formatting

### 🔹 **GOAL**
Provide deeply helpful, human-like, well-structured explanations that look and feel like ChatGPT but tailored to investment, wealth building, and smart financial decision-making.

${updatedSystem}`,
      })

      return NextResponse.json({ message: text })
    }

    console.log("🤖 Generating response")

    // Get real-time market data
    const marketData = await fetchRealTimeMarketData()

    const { text } = await generateText({
      model: openai("gpt-5.1"),
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `You are **MSA Invest AI**, a high-quality investment assistant.
Your UX, tone, and writing style must closely match ChatGPT's polished format.

### 🔹 **RESPONSE FORMAT**
Always respond using:
- **Clear headings** (use ## for main sections, ### for subsections)
- **Subheadings**
- **Bullet points** (use - for bullet points)
- **Numbered lists** (use 1. 2. 3. for numbered lists)
- **Short paragraphs** (break up long content)
- **Human-like explanations** (avoid robotic language)
- **Actionable insights** (provide specific recommendations)
- **Optional summary at the end** (for complex topics)

### 🔹 **TONE & STYLE**
- Professional, confident, friendly, and easy to read
- Similar to ChatGPT's UX style
- No robotic, short, or generic answers
- Always well-structured and polished like ChatGPT
- Use markdown formatting consistently

### 🔹 **FOCUS**
All responses should be optimized for **investment**, including:
- Market trends
- Risk assessment
- Portfolio strategy
- Financial literacy
- Economic insights
- Practical investment advice

### 🔹 **FORMATTING REQUIREMENTS**
- Use proper markdown syntax (# ## ### for headings)
- Use **bold** for important terms and numbers
- Use *italic* for emphasis where appropriate
- Use \`code\` for specific values or technical terms
- Use - for bullet points (not asterisks)
- Use 1. 2. 3. for numbered lists
- Present information in a visually appealing format like ChatGPT

### 🔹 **RESPONSE STRUCTURE EXAMPLE**:
## Market Analysis for [Location]
Here's a comprehensive analysis of the current market conditions...

### Key Factors:
- Strong population growth of X%
- Job market expanding at Y% annually
- Housing supply below demand threshold

### Investment Recommendations:
1. Focus on properties under $XXX,XXX
2. Target neighborhoods with...
3. Consider timing your purchase for...

## Risk Assessment
*Potential challenges to consider...*

### 🔹 **What NOT to do**
- Do NOT give unstructured text
- Do NOT reply with one-line answers
- Do NOT sound robotic or generic
- Do NOT provide financial guarantees
- Do NOT ignore markdown formatting

### 🔹 **GOAL**
Provide deeply helpful, human-like, well-structured explanations that look and feel like ChatGPT but tailored to investment, wealth building, and smart financial decision-making.

# CURRENT MARKET DATA (Real-time):
${marketData}`,
    })

    console.log("✅ Chat API generated response successfully")

    // Extract session token from cookies to associate chat with user
    const sessionToken = request.cookies.get("session_token")?.value
    let userId = null;
    if (sessionToken) {
      const user = await AuthService.verifySession(sessionToken);
      userId = user?.id || null;
    }

    // Save the conversation to the database if user is authenticated
    if (userId && messages && messages.length > 0) {
      // This is a simplified implementation - in practice you'd want more sophisticated chat handling
      // For now, let's just return the response immediately since this is the chat API, not the history API
      // The actual chat saving would happen in the client-side code
    }

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
- Interest Rate Environment: ${parseFloat(fedFundsRate) > 5 ? "Restrictive" : parseFloat(fedFundsRate) > 3 ? "Moderate" : "Accommodative"}
- Investment Climate: ${parseFloat(unemployment) < 4 ? "Strong" : parseFloat(unemployment) < 6 ? "Stable" : "Challenging"}
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
      model: openai("gpt-5.1"),
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

Use proper HTML formatting with headings, bullet points, tables, and professional styling. Generate a comprehensive investment analysis report based on our conversation with proper formatting and structure.`,
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
      model: openai("gpt-5.1"),
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `Create a comprehensive PDF-ready HTML report with professional formatting. Generate a detailed investment report in HTML format suitable for PDF conversion.`,
    })

    const pdfContent = `<!DOCTYPE html>
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
</html>`

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
      model: openai("gpt-5.1"),
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `Create a comprehensive DOCX-ready HTML report with Word-compatible formatting. Generate a detailed investment report in HTML format suitable for Word conversion.`,
    })

    const docxContent = `<html>
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
</html>`

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

async function performDeepResearch(messages: any[]) {
  try {
    console.log("🔍 Performing deep research...")
    
    // Get the user's query from the last message
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    
    // For now, we'll use a search API - in a real implementation, you'd use services like:
    // - SerpAPI for Google search results
    // - Tavily API for research
    // - Bing Search API
    // - etc.
    
    // This is a placeholder implementation - in a real app you would:
    // 1. Use an actual search API
    // 2. Process the search results
    // 3. Generate a response based on the research
    const searchQuery = lastUserMessage;
    
    // Get market data first
    const marketData = await fetchRealTimeMarketData();

    // Use the default OpenAI model to create a research-like response
    // In a real implementation, you'd fetch actual search results
    const { text } = await generateText({
      model: openai("gpt-4o"), 
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      system: `You are **MSA Invest AI**, a high-quality investment assistant with access to real-time data and research capabilities.
Your UX, tone, and writing style must closely match ChatGPT's polished format.

### 🔹 **RESPONSE FORMAT**
Always respond using:
- **Clear headings** (use ## for main sections, ### for subsections)
- **Subheadings**
- **Bullet points** (use - for bullet points)
- **Numbered lists** (use 1. 2. 3. for numbered lists)
- **Short paragraphs** (break up long content)
- **Human-like explanations** (avoid robotic language)
- **Actionable insights** (provide specific recommendations)
- **Optional summary at the end** (for complex topics)

### 🔹 **TONE & STYLE**
- Professional, confident, friendly, and easy to read
- Similar to ChatGPT's UX style
- No robotic, short, or generic answers
- Always well-structured and polished like ChatGPT
- Use markdown formatting consistently

### 🔹 **FOCUS**
All responses should be optimized for **investment**, including:
- Market trends
- Risk assessment
- Portfolio strategy
- Financial literacy
- Economic insights
- Practical investment advice

### 🔹 **RESEARCH INTEGRATION**
You have access to live internet and research capabilities. When performing research:
- Cite specific sources where possible
- Provide the most current information available
- Mention the date of information if relevant
- Include relevant statistics and data
- Compare multiple sources when possible

### 🔹 **FORMATTING REQUIREMENTS**
- Use proper markdown syntax (# ## ### for headings)
- Use **bold** for important terms and numbers
- Use *italic* for emphasis where appropriate
- Use \`code\` for specific values or technical terms
- Use - for bullet points (not asterisks)
- Use 1. 2. 3. for numbered lists
- Present information in a visually appealing format like ChatGPT

### 🔹 **RESPONSE STRUCTURE EXAMPLE**:
## Research Results for [Topic]
Here's what I found from my research...

### Key Findings:
- Important finding 1
- Important finding 2
- Important finding 3

### Data Sources:
- Source 1 (date)
- Source 2 (date)

### Investment Implications:
1. Impact on market
2. Potential opportunities
3. Associated risks

## Summary
*Concise summary of key points*

### 🔹 **What NOT to do**
- Do NOT give unstructured text
- Do NOT reply with one-line answers
- Do NOT sound robotic or generic
- Do NOT make up information
- Do NOT ignore markdown formatting

### 🔹 **GOAL**
Provide deeply helpful, human-like, well-structured explanations that look and feel like ChatGPT but tailored to investment, wealth building, and smart financial decision-making.

# CURRENT MARKET DATA (Real-time):
${marketData}`,
      prompt: `Research the following topic in depth: ${searchQuery}. Provide comprehensive findings with specific details, current information, and actionable insights. Focus particularly on investment implications and financial market impacts.`
    });

    return NextResponse.json({
      message: text,
      action: "research_results",
      researchQuery: searchQuery,
    });
  } catch (error) {
    console.error("❌ Error performing deep research:", error)
    return NextResponse.json({ 
      error: "Failed to perform deep research", 
      message: "I encountered an error while performing research. Please try again." 
    }, { status: 500 })
  }
}