import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface CensusData {
  state: string
  population: number
  populationGrowth: number
  medianIncome: number
  unemploymentRate: number
  housingUnits: number
  medianHomeValue: number
  year: number
}

export interface BLSData {
  state: string
  employmentRate: number
  jobGrowth: number
  averageWage: number
  industryBreakdown: {
    [industry: string]: number
  }
  year: number
}

export interface MarketAnalysis {
  state: string
  overallScore: number
  factors: {
    demographic: number
    economic: number
    housing: number
    employment: number
  }
  trends: {
    population: "increasing" | "decreasing" | "stable"
    employment: "improving" | "declining" | "stable"
    housing: "appreciating" | "depreciating" | "stable"
    income: "rising" | "falling" | "stable"
  }
  insights: string[]
  recommendations: string[]
  riskFactors: string[]
  chartData: {
    populationTrend: Array<{ year: number; population: number }>
    employmentTrend: Array<{ year: number; rate: number }>
    housingTrend: Array<{ year: number; value: number }>
    incomeTrend: Array<{ year: number; income: number }>
  }
}

export interface MarketData {
  state: string
  demographics: {
    population: number
    populationGrowth: number
    medianAge: number
    medianIncome: number
  }
  economy: {
    unemploymentRate: number
    jobGrowth: number
    gdpGrowth: number
    majorIndustries: string[]
  }
  housing: {
    medianHomePrice: number
    priceGrowth: number
    homeOwnershipRate: number
    housingStarts: number
  }
  investment: {
    rentalYield: number
    vacancyRate: number
    priceToRentRatio: number
    capRate: number
  }
}

export interface ResearchResult {
  data: MarketData
  analysis: string
  score: number
  riskFactors: string[]
  opportunities: string[]
  chartData: {
    populationTrend: Array<{ year: number; population: number }>
    priceTrend: Array<{ year: number; price: number }>
    jobGrowth: Array<{ year: number; jobs: number }>
  }
}

export class ResearchAgent {
  private censusApiKey: string
  private blsApiKey: string

  constructor() {
    this.censusApiKey = process.env.CENSUS_API_KEY || "mock_census_key"
    this.blsApiKey = process.env.BLS_API_KEY || "mock_bls_key"
  }

  async fetchCensusData(state: string): Promise<any> {
    // Mock implementation - replace with actual Census API calls
    if (this.censusApiKey === "mock_census_key") {
      return this.getMockCensusData(state)
    }

    try {
      // Real Census API implementation would go here
      const response = await fetch(
        `https://api.census.gov/data/2022/acs/acs1?get=B01003_001E,B19013_001E&for=state:*&key=${this.censusApiKey}`,
      )
      return await response.json()
    } catch (error) {
      console.error("Census API error:", error)
      return this.getMockCensusData(state)
    }
  }

  async fetchBLSData(state: string): Promise<any> {
    // Mock implementation - replace with actual BLS API calls
    if (this.blsApiKey === "mock_bls_key") {
      return this.getMockBLSData(state)
    }

    try {
      // Real BLS API implementation would go here
      const response = await fetch("https://api.bls.gov/publicAPI/v2/timeseries/data/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seriesid: [`LAUST${this.getStateCode(state)}0000000000003`],
          startyear: "2020",
          endyear: "2024",
          registrationkey: this.blsApiKey,
        }),
      })
      return await response.json()
    } catch (error) {
      console.error("BLS API error:", error)
      return this.getMockBLSData(state)
    }
  }

  private getMockCensusData(state: string): any {
    const mockData: Record<string, any> = {
      Texas: {
        population: 30029572,
        populationGrowth: 1.8,
        medianAge: 34.8,
        medianIncome: 67321,
      },
      Florida: {
        population: 22610726,
        populationGrowth: 2.3,
        medianAge: 42.2,
        medianIncome: 59227,
      },
      Nevada: {
        population: 3177772,
        populationGrowth: 2.1,
        medianAge: 38.4,
        medianIncome: 63276,
      },
    }
    return mockData[state] || mockData.Texas
  }

  private getMockBLSData(state: string): any {
    const mockData: Record<string, any> = {
      Texas: {
        unemploymentRate: 3.8,
        jobGrowth: 3.2,
        gdpGrowth: 4.1,
        majorIndustries: ["Energy", "Technology", "Agriculture", "Aerospace"],
      },
      Florida: {
        unemploymentRate: 3.2,
        jobGrowth: 3.5,
        gdpGrowth: 3.8,
        majorIndustries: ["Tourism", "Agriculture", "Aerospace", "International Trade"],
      },
      Nevada: {
        unemploymentRate: 4.2,
        jobGrowth: 2.8,
        gdpGrowth: 3.4,
        majorIndustries: ["Gaming", "Mining", "Tourism", "Logistics"],
      },
    }
    return mockData[state] || mockData.Texas
  }

  private getStateCode(state: string): string {
    const stateCodes: Record<string, string> = {
      Texas: "48",
      Florida: "12",
      Nevada: "32",
      // Add more state codes as needed
    }
    return stateCodes[state] || "48"
  }

  async analyzeMarketData(state: string): Promise<MarketAnalysis> {
    try {
      console.log("🔍 Analyzing market data for", state)

      // Fetch data from both sources
      const [censusData, blsData] = await Promise.all([this.fetchCensusData(state), this.fetchBLSData(state)])

      // Generate historical trend data (mock for now)
      const currentYear = new Date().getFullYear()
      const chartData = {
        populationTrend: Array.from({ length: 5 }, (_, i) => ({
          year: currentYear - 4 + i,
          population: censusData.population * (0.95 + i * 0.025),
        })),
        employmentTrend: Array.from({ length: 5 }, (_, i) => ({
          year: currentYear - 4 + i,
          rate: blsData.employmentRate + (Math.random() - 0.5) * 2,
        })),
        housingTrend: Array.from({ length: 5 }, (_, i) => ({
          year: currentYear - 4 + i,
          value: censusData.medianHomeValue * (0.9 + i * 0.05),
        })),
        incomeTrend: Array.from({ length: 5 }, (_, i) => ({
          year: currentYear - 4 + i,
          income: censusData.medianIncome * (0.95 + i * 0.03),
        })),
      }

      // Use AI to analyze the data
      const analysisPrompt = `
        Analyze the following market data for ${state} and provide investment insights:

        Demographics:
        - Population: ${censusData.population.toLocaleString()}
        - Population Growth: ${censusData.populationGrowth.toFixed(2)}%
        - Median Income: $${censusData.medianIncome.toLocaleString()}
        - Housing Units: ${censusData.housingUnits.toLocaleString()}
        - Median Home Value: $${censusData.medianHomeValue.toLocaleString()}

        Employment:
        - Employment Rate: ${blsData.employmentRate.toFixed(2)}%
        - Job Growth: ${blsData.jobGrowth.toFixed(2)}%
        - Average Wage: $${blsData.averageWage.toLocaleString()}
        - Top Industries: ${Object.entries(blsData.industryBreakdown)
          .map(([k, v]) => `${k} (${v.toFixed(1)}%)`)
          .join(", ")}

        Provide:
        1. Overall investment score (0-100)
        2. Factor scores for demographic, economic, housing, employment (0-100 each)
        3. Market trends (increasing/decreasing/stable)
        4. 3-5 key insights
        5. 3-4 investment recommendations
        6. 2-3 risk factors

        Format as JSON with the structure matching MarketAnalysis interface.
      `

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: analysisPrompt,
        system: `You are a professional real estate market analyst with expertise in demographic and economic data analysis. 
        Provide data-driven insights based on Census and Bureau of Labor Statistics data. 
        Be specific with numbers and provide actionable investment recommendations.
        Always format your response as valid JSON matching the requested structure.`,
      })

      // Parse AI response
      let aiAnalysis
      try {
        aiAnalysis = JSON.parse(text)
      } catch (parseError) {
        console.warn("⚠️ Failed to parse AI response, using fallback analysis")
        aiAnalysis = this.generateFallbackAnalysis(state, censusData, blsData)
      }

      const analysis: MarketAnalysis = {
        state,
        overallScore: aiAnalysis.overallScore || this.calculateOverallScore(censusData, blsData),
        factors: aiAnalysis.factors || {
          demographic: this.calculateDemographicScore(censusData),
          economic: this.calculateEconomicScore(censusData, blsData),
          housing: this.calculateHousingScore(censusData),
          employment: this.calculateEmploymentScore(blsData),
        },
        trends: aiAnalysis.trends || {
          population:
            censusData.populationGrowth > 1
              ? "increasing"
              : censusData.populationGrowth < -0.5
                ? "decreasing"
                : "stable",
          employment: blsData.jobGrowth > 2 ? "improving" : blsData.jobGrowth < -1 ? "declining" : "stable",
          housing: censusData.medianHomeValue > 300000 ? "appreciating" : "stable",
          income: censusData.medianIncome > 60000 ? "rising" : "stable",
        },
        insights: aiAnalysis.insights || [
          `${state} shows ${censusData.populationGrowth > 0 ? "positive" : "negative"} population growth of ${censusData.populationGrowth.toFixed(2)}%`,
          `Employment rate of ${blsData.employmentRate.toFixed(1)}% indicates ${blsData.employmentRate > 95 ? "strong" : "moderate"} job market`,
          `Median home value of $${censusData.medianHomeValue.toLocaleString()} suggests ${censusData.medianHomeValue > 300000 ? "premium" : "affordable"} market`,
        ],
        recommendations: aiAnalysis.recommendations || [
          `Focus on ${censusData.populationGrowth > 1 ? "growth areas" : "value opportunities"} within ${state}`,
          `Consider ${censusData.medianHomeValue < 250000 ? "entry-level" : "mid-to-high-end"} properties`,
          `Target ${Object.entries(blsData.industryBreakdown)
            .sort(([, a], [, b]) => b - a)[0][0]
            .toLowerCase()} employment centers`,
        ],
        riskFactors: aiAnalysis.riskFactors || [
          censusData.populationGrowth < 0
            ? "Declining population may affect demand"
            : "Population growth may increase competition",
          blsData.employmentRate < 92 ? "Below-average employment rate" : "High employment may limit workforce",
          censusData.medianHomeValue > 400000
            ? "High property values may limit affordability"
            : "Market volatility risk",
        ],
        chartData,
      }

      console.log("✅ Market analysis completed for", state)
      return analysis
    } catch (error) {
      console.error("❌ Error analyzing market data:", error)
      throw error
    }
  }

  async analyzeMarket(state: string): Promise<ResearchResult> {
    try {
      // Fetch data from APIs
      const censusData = await this.fetchCensusData(state)
      const blsData = await this.fetchBLSData(state)

      // Compile market data
      const marketData: MarketData = {
        state,
        demographics: {
          population: censusData.population || 0,
          populationGrowth: censusData.populationGrowth || 0,
          medianAge: censusData.medianAge || 0,
          medianIncome: censusData.medianIncome || 0,
        },
        economy: {
          unemploymentRate: blsData.unemploymentRate || 0,
          jobGrowth: blsData.jobGrowth || 0,
          gdpGrowth: blsData.gdpGrowth || 0,
          majorIndustries: blsData.majorIndustries || [],
        },
        housing: {
          medianHomePrice: this.getHousingData(state).medianHomePrice,
          priceGrowth: this.getHousingData(state).priceGrowth,
          homeOwnershipRate: this.getHousingData(state).homeOwnershipRate,
          housingStarts: this.getHousingData(state).housingStarts,
        },
        investment: {
          rentalYield: this.getInvestmentData(state).rentalYield,
          vacancyRate: this.getInvestmentData(state).vacancyRate,
          priceToRentRatio: this.getInvestmentData(state).priceToRentRatio,
          capRate: this.getInvestmentData(state).capRate,
        },
      }

      // Generate AI analysis
      const analysis = await this.generateAIAnalysis(marketData)

      // Calculate investment score
      const score = this.calculateInvestmentScore(marketData)

      // Generate chart data
      const chartData = this.generateChartData(state)

      return {
        data: marketData,
        analysis: analysis.text,
        score,
        riskFactors: this.identifyRiskFactors(marketData),
        opportunities: this.identifyOpportunities(marketData),
        chartData,
      }
    } catch (error) {
      console.error("Market analysis error:", error)
      throw new Error("Failed to analyze market data")
    }
  }

  private async generateAIAnalysis(data: MarketData): Promise<{ text: string }> {
    try {
      const result = await generateText({
        model: openai("gpt-4o"),
        system: `You are a professional real estate investment analyst. Analyze the provided market data and provide a comprehensive investment analysis with specific numbers and actionable insights.`,
        prompt: `Analyze this market data for ${data.state}:

Demographics:
- Population: ${data.demographics.population.toLocaleString()}
- Population Growth: ${data.demographics.populationGrowth}%
- Median Age: ${data.demographics.medianAge}
- Median Income: $${data.demographics.medianIncome.toLocaleString()}

Economy:
- Unemployment Rate: ${data.economy.unemploymentRate}%
- Job Growth: ${data.economy.jobGrowth}%
- GDP Growth: ${data.economy.gdpGrowth}%
- Major Industries: ${data.economy.majorIndustries.join(", ")}

Housing:
- Median Home Price: $${data.housing.medianHomePrice.toLocaleString()}
- Price Growth: ${data.housing.priceGrowth}%
- Home Ownership Rate: ${data.housing.homeOwnershipRate}%
- Housing Starts: ${data.housing.housingStarts.toLocaleString()}

Investment Metrics:
- Rental Yield: ${data.investment.rentalYield}%
- Vacancy Rate: ${data.investment.vacancyRate}%
- Price-to-Rent Ratio: ${data.investment.priceToRentRatio}
- Cap Rate: ${data.investment.capRate}%

Provide a detailed analysis with specific investment recommendations, market trends, and risk assessment.`,
      })

      return { text: result.text }
    } catch (error) {
      console.error("AI analysis error:", error)
      return {
        text: `Market Analysis for ${data.state}:

Based on the current data, ${data.state} shows strong fundamentals with ${data.demographics.populationGrowth}% population growth and ${data.economy.jobGrowth}% job growth. 

Key Investment Highlights:
• Median home price: $${data.housing.medianHomePrice.toLocaleString()}
• Annual price appreciation: ${data.housing.priceGrowth}%
• Rental yield: ${data.investment.rentalYield}%
• Vacancy rate: ${data.investment.vacancyRate}%

The market demonstrates solid economic fundamentals with unemployment at ${data.economy.unemploymentRate}% and diverse industry base including ${data.economy.majorIndustries.slice(0, 2).join(" and ")}.

Investment Recommendation: This market offers balanced growth potential with moderate risk profile suitable for long-term investment strategies.`,
      }
    }
  }

  private calculateOverallScore(census: CensusData, bls: BLSData): number {
    const popScore = Math.max(0, Math.min(100, (census.populationGrowth + 2) * 25))
    const empScore = Math.max(0, Math.min(100, (bls.employmentRate - 85) * 6.67))
    const incomeScore = Math.max(0, Math.min(100, (census.medianIncome - 30000) / 500))
    const jobGrowthScore = Math.max(0, Math.min(100, (bls.jobGrowth + 2) * 20))

    return Math.round((popScore + empScore + incomeScore + jobGrowthScore) / 4)
  }

  private calculateDemographicScore(census: CensusData): number {
    return Math.max(0, Math.min(100, (census.populationGrowth + 2) * 25 + (census.medianIncome - 40000) / 800))
  }

  private calculateEconomicScore(census: CensusData, bls: BLSData): number {
    return Math.max(0, Math.min(100, (bls.averageWage - 35000) / 500 + (100 - census.unemploymentRate) * 10))
  }

  private calculateHousingScore(census: CensusData): number {
    const affordabilityRatio = census.medianIncome / (census.medianHomeValue / 1000)
    return Math.max(0, Math.min(100, affordabilityRatio * 20))
  }

  private calculateEmploymentScore(bls: BLSData): number {
    return Math.max(0, Math.min(100, (bls.employmentRate - 85) * 6.67 + (bls.jobGrowth + 2) * 10))
  }

  private generateFallbackAnalysis(state: string, census: CensusData, bls: BLSData) {
    return {
      overallScore: this.calculateOverallScore(census, bls),
      factors: {
        demographic: this.calculateDemographicScore(census),
        economic: this.calculateEconomicScore(census, bls),
        housing: this.calculateHousingScore(census),
        employment: this.calculateEmploymentScore(bls),
      },
      trends: {
        population:
          census.populationGrowth > 1 ? "increasing" : census.populationGrowth < -0.5 ? "decreasing" : "stable",
        employment: bls.jobGrowth > 2 ? "improving" : bls.jobGrowth < -1 ? "declining" : "stable",
        housing: census.medianHomeValue > 300000 ? "appreciating" : "stable",
        income: census.medianIncome > 60000 ? "rising" : "stable",
      },
      insights: [
        `${state} population growth: ${census.populationGrowth.toFixed(2)}%`,
        `Employment rate: ${bls.employmentRate.toFixed(1)}%`,
        `Median home value: $${census.medianHomeValue.toLocaleString()}`,
      ],
      recommendations: ["Focus on emerging growth areas", "Consider market entry points", "Monitor employment trends"],
      riskFactors: ["Market volatility", "Economic uncertainty"],
    }
  }

  private calculateInvestmentScore(data: MarketData): number {
    let score = 0

    // Population growth (25% weight)
    score += Math.min(data.demographics.populationGrowth * 10, 25)

    // Job growth (25% weight)
    score += Math.min(data.economy.jobGrowth * 8, 25)

    // Price growth (20% weight)
    score += Math.min(data.housing.priceGrowth * 2, 20)

    // Rental yield (15% weight)
    score += Math.min(data.investment.rentalYield * 2, 15)

    // Low vacancy rate (10% weight)
    score += Math.max(10 - data.investment.vacancyRate, 0)

    // Low unemployment (5% weight)
    score += Math.max(5 - data.economy.unemploymentRate, 0)

    return Math.round(score)
  }

  private identifyRiskFactors(data: MarketData): string[] {
    const risks: string[] = []

    if (data.economy.unemploymentRate > 5) {
      risks.push("High unemployment rate may impact rental demand")
    }

    if (data.investment.vacancyRate > 8) {
      risks.push("Elevated vacancy rates indicate oversupply")
    }

    if (data.housing.priceGrowth > 15) {
      risks.push("Rapid price appreciation may indicate bubble conditions")
    }

    if (data.demographics.populationGrowth < 0.5) {
      risks.push("Slow population growth may limit demand growth")
    }

    return risks.length > 0 ? risks : ["Market shows stable risk profile"]
  }

  private identifyOpportunities(data: MarketData): string[] {
    const opportunities: string[] = []

    if (data.demographics.populationGrowth > 1.5) {
      opportunities.push("Strong population growth driving housing demand")
    }

    if (data.economy.jobGrowth > 2.5) {
      opportunities.push("Robust job market supporting income growth")
    }

    if (data.investment.rentalYield > 6) {
      opportunities.push("Attractive rental yields for cash flow investors")
    }

    if (data.investment.vacancyRate < 5) {
      opportunities.push("Tight rental market supports rent growth")
    }

    return opportunities.length > 0 ? opportunities : ["Market offers steady investment potential"]
  }

  private getHousingData(state: string) {
    const housingData: Record<string, any> = {
      Texas: {
        medianHomePrice: 295000,
        priceGrowth: 8.5,
        homeOwnershipRate: 62.1,
        housingStarts: 85000,
      },
      Florida: {
        medianHomePrice: 385000,
        priceGrowth: 11.8,
        homeOwnershipRate: 68.4,
        housingStarts: 95000,
      },
      Nevada: {
        medianHomePrice: 425000,
        priceGrowth: 12.3,
        homeOwnershipRate: 56.3,
        housingStarts: 15000,
      },
    }
    return housingData[state] || housingData.Texas
  }

  private getInvestmentData(state: string) {
    const investmentData: Record<string, any> = {
      Texas: {
        rentalYield: 7.2,
        vacancyRate: 3.8,
        priceToRentRatio: 13.9,
        capRate: 6.8,
      },
      Florida: {
        rentalYield: 6.1,
        vacancyRate: 3.2,
        priceToRentRatio: 16.4,
        capRate: 5.7,
      },
      Nevada: {
        rentalYield: 5.8,
        vacancyRate: 4.2,
        priceToRentRatio: 17.2,
        capRate: 5.4,
      },
    }
    return investmentData[state] || investmentData.Texas
  }

  private generateChartData(state: string) {
    const currentYear = new Date().getFullYear()
    const basePopulation = this.getMockCensusData(state).population
    const basePrice = this.getHousingData(state).medianHomePrice
    const baseJobs = Math.floor(basePopulation * 0.6) // Rough employment estimate

    return {
      populationTrend: Array.from({ length: 5 }, (_, i) => ({
        year: currentYear - 4 + i,
        population: Math.floor(basePopulation * (1 + i * 0.018)), // 1.8% annual growth
      })),
      priceTrend: Array.from({ length: 5 }, (_, i) => ({
        year: currentYear - 4 + i,
        price: Math.floor(basePrice * (1 + i * 0.085)), // 8.5% annual growth
      })),
      jobGrowth: Array.from({ length: 5 }, (_, i) => ({
        year: currentYear - 4 + i,
        jobs: Math.floor(baseJobs * (1 + i * 0.032)), // 3.2% annual growth
      })),
    }
  }
}

export const researchAgent = new ResearchAgent()
