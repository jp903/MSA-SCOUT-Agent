import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { MODEL } from "@/lib/ai-config"

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

export class ResearchAgent {
  private censusApiKey: string
  private blsApiKey: string

  constructor() {
    this.censusApiKey = process.env.CENSUS_API_KEY || ""
    this.blsApiKey = process.env.BLS_API_KEY || ""
  }

  async fetchCensusData(state: string): Promise<CensusData> {
    try {
      // Mock data for now - replace with actual API calls when keys are available
      const mockData: CensusData = {
        state,
        population: Math.floor(Math.random() * 10000000) + 1000000,
        populationGrowth: (Math.random() - 0.5) * 4, // -2% to +2%
        medianIncome: Math.floor(Math.random() * 30000) + 40000,
        unemploymentRate: Math.random() * 8 + 2, // 2% to 10%
        housingUnits: Math.floor(Math.random() * 5000000) + 500000,
        medianHomeValue: Math.floor(Math.random() * 200000) + 200000,
        year: 2024,
      }

      // If API key is available, make actual API call
      if (this.censusApiKey) {
        console.log("🏛️ Fetching Census data for", state)
        // Actual Census API implementation would go here
        // const response = await fetch(`https://api.census.gov/data/2023/acs/acs1?get=NAME,B01003_001E&for=state:*&key=${this.censusApiKey}`)
      }

      return mockData
    } catch (error) {
      console.error("❌ Error fetching Census data:", error)
      throw error
    }
  }

  async fetchBLSData(state: string): Promise<BLSData> {
    try {
      // Mock data for now - replace with actual API calls when keys are available
      const mockData: BLSData = {
        state,
        employmentRate: Math.random() * 10 + 90, // 90% to 100%
        jobGrowth: (Math.random() - 0.3) * 6, // -1.8% to +4.2%
        averageWage: Math.floor(Math.random() * 20000) + 45000,
        industryBreakdown: {
          Technology: Math.random() * 20 + 10,
          Healthcare: Math.random() * 15 + 12,
          Manufacturing: Math.random() * 18 + 8,
          Finance: Math.random() * 12 + 6,
          Construction: Math.random() * 10 + 5,
          Retail: Math.random() * 15 + 8,
        },
        year: 2024,
      }

      // If API key is available, make actual API call
      if (this.blsApiKey) {
        console.log("📊 Fetching BLS data for", state)
        // Actual BLS API implementation would go here
        // const response = await fetch(`https://api.bls.gov/publicAPI/v2/timeseries/data/`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ seriesid: [`LAUST${stateCode}0000000000003`], registrationkey: this.blsApiKey })
        // })
      }

      return mockData
    } catch (error) {
      console.error("❌ Error fetching BLS data:", error)
      throw error
    }
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
        model: MODEL,
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
}

export const researchAgent = new ResearchAgent()
