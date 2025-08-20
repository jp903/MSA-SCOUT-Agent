import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const propertyData = await request.json()

    console.log("📊 Price Prediction API received data:", propertyData)

    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OpenAI API key not found")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    console.log("🤖 Generating price prediction")

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are an expert real estate appraiser and market analyst with access to comprehensive market data. You specialize in providing accurate property price predictions based on multiple factors including location, property characteristics, market trends, and economic indicators.

# ANALYSIS FRAMEWORK:
1. Location Analysis - Neighborhood trends, school districts, amenities
2. Property Characteristics - Size, age, condition, features
3. Market Conditions - Supply/demand, recent sales, inventory levels
4. Economic Factors - Interest rates, employment, population growth
5. Comparable Sales - Recent transactions in the area
6. Future Projections - Development plans, infrastructure changes

# RESPONSE FORMAT:
Provide a comprehensive analysis in the following structure:

## Current Market Value Estimate
**Estimated Value Range: $XXX,XXX - $XXX,XXX**
**Most Likely Value: $XXX,XXX**

## Price Prediction Timeline
### 6 Months: $XXX,XXX (±X%)
### 1 Year: $XXX,XXX (±X%)
### 3 Years: $XXX,XXX (±X%)
### 5 Years: $XXX,XXX (±X%)

## Market Analysis
### Strengths:
- [Key positive factors]

### Risks:
- [Potential challenges]

### Market Trends:
- [Current market conditions]

## Comparable Properties
- [Recent sales data and comparisons]

## Investment Recommendation
- [Buy/Hold/Sell recommendation with reasoning]

## Confidence Level
- [High/Medium/Low with explanation]

Always provide specific dollar amounts, percentages, and detailed reasoning for all predictions. Base analysis on realistic market conditions and trends.`,
      prompt: `Analyze and predict the price for this property:

Property Details:
- Address: ${propertyData.address}
- Property Type: ${propertyData.propertyType}
- Square Footage: ${propertyData.squareFootage} sq ft
- Bedrooms: ${propertyData.bedrooms}
- Bathrooms: ${propertyData.bathrooms}
- Year Built: ${propertyData.yearBuilt}
- Lot Size: ${propertyData.lotSize} sq ft
- Current Condition: ${propertyData.condition}
- Recent Renovations: ${propertyData.renovations || "None specified"}
- Neighborhood: ${propertyData.neighborhood || "Not specified"}
- School District: ${propertyData.schoolDistrict || "Not specified"}
- Special Features: ${propertyData.specialFeatures || "None specified"}
- Current List Price: ${propertyData.currentPrice ? `$${propertyData.currentPrice.toLocaleString()}` : "Not provided"}

Market Context:
- Local Market Conditions: ${propertyData.marketConditions || "Standard market analysis requested"}
- Investment Timeline: ${propertyData.timeline || "1-5 years"}
- Investment Goals: ${propertyData.goals || "General investment analysis"}

Please provide a comprehensive price prediction analysis with specific dollar amounts and percentages for different time horizons.`,
    })

    console.log("✅ Price prediction generated successfully")

    return NextResponse.json({
      prediction: text,
      timestamp: new Date().toISOString(),
      propertyAddress: propertyData.address,
    })
  } catch (error) {
    console.error("❌ Error in price prediction API:", error)

    let errorMessage = "Failed to generate price prediction"
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
