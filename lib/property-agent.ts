import { generateText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

// Investment calculation tool
const calculateROI = tool({
  description: "Calculate return on investment for a property",
  parameters: z.object({
    purchasePrice: z.number().describe("Property purchase price"),
    monthlyRent: z.number().describe("Expected monthly rental income"),
    monthlyExpenses: z.number().describe("Monthly expenses (taxes, insurance, maintenance)"),
    downPayment: z.number().describe("Down payment amount"),
    loanInterestRate: z.number().describe("Loan interest rate as decimal (e.g., 0.06 for 6%)"),
    loanTermYears: z.number().describe("Loan term in years"),
  }),
  execute: async ({ purchasePrice, monthlyRent, monthlyExpenses, downPayment, loanInterestRate, loanTermYears }) => {
    const loanAmount = purchasePrice - downPayment
    const monthlyInterestRate = loanInterestRate / 12
    const numberOfPayments = loanTermYears * 12

    // Calculate monthly mortgage payment
    const monthlyMortgage =
      (loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)

    const monthlyCashFlow = monthlyRent - monthlyExpenses - monthlyMortgage
    const annualCashFlow = monthlyCashFlow * 12
    const cashOnCashReturn = (annualCashFlow / downPayment) * 100
    const capRate = ((monthlyRent * 12 - monthlyExpenses * 12) / purchasePrice) * 100

    return {
      monthlyMortgage: Math.round(monthlyMortgage),
      monthlyCashFlow: Math.round(monthlyCashFlow),
      annualCashFlow: Math.round(annualCashFlow),
      cashOnCashReturn: Math.round(cashOnCashReturn * 100) / 100,
      capRate: Math.round(capRate * 100) / 100,
      totalCashNeeded: downPayment,
    }
  },
})

// Market comparison tool
const compareMarkets = tool({
  description: "Compare real estate markets between different states or cities",
  parameters: z.object({
    locations: z.array(z.string()).describe("Array of locations to compare (states or cities)"),
    propertyType: z.string().describe("Type of property (single-family, multi-family, etc.)"),
  }),
  execute: async ({ locations, propertyType }) => {
    // This would integrate with real estate APIs in production
    // For now, we'll return structured comparison data
    return {
      comparison: locations.map((location) => ({
        location,
        averagePrice: Math.floor(Math.random() * 400000) + 200000,
        averageRent: Math.floor(Math.random() * 2000) + 1000,
        marketTrend: ["Rising", "Stable", "Declining"][Math.floor(Math.random() * 3)],
        investmentGrade: ["A", "B", "C"][Math.floor(Math.random() * 3)],
      })),
    }
  },
})

// Web search tool for current market data
const searchPropertyData = tool({
  description: "Search for current property market data and trends",
  parameters: z.object({
    query: z.string().describe("Search query for property data"),
    location: z.string().describe("Specific location or state"),
  }),
  execute: async ({ query, location }) => {
    // In production, this would use a real web search API
    return {
      searchResults: [
        {
          title: `${location} Real Estate Market Report 2024`,
          summary: `Current market trends and property values in ${location}`,
          url: `https://example.com/market-report-${location.toLowerCase()}`,
          keyPoints: [
            "Median home price trends",
            "Rental market analysis",
            "Investment opportunities",
            "Market forecasts",
          ],
        },
      ],
    }
  },
})

export async function analyzePropertyInvestment(location: string, investmentGoals: string, budget: number) {
  const result = await generateText({
    model: openai("gpt-4o"),
    system: `You are a professional real estate investment advisor with expertise in all US markets. 
    You help investors find profitable property investment opportunities by analyzing market data, 
    calculating returns, and providing strategic recommendations.
    
    Always provide specific, actionable advice and use the available tools to perform calculations 
    and gather current market data.`,
    prompt: `Analyze property investment opportunities in ${location} for an investor with:
    - Budget: $${budget.toLocaleString()}
    - Investment Goals: ${investmentGoals}
    
    Please provide a comprehensive analysis including:
    1. Current market conditions
    2. Investment calculations for typical properties
    3. Specific recommendations
    4. Risk assessment
    5. Comparison with other markets if relevant`,
    tools: {
      calculateROI,
      compareMarkets,
      searchPropertyData,
    },
    maxSteps: 5,
  })

  return result
}
