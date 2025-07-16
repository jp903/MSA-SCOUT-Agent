export interface RealTimeMarketData {
  location: string
  currentPrice: number
  priceChange24h: number
  priceChangePercent: number
  volume: number
  marketCap: number
  rentalYield: number
  vacancyRate: number
  populationGrowth: number
  employmentRate: number
  crimeIndex: number
  schoolRating: number
  walkScore: number
  lastUpdated: Date
  trends: {
    priceHistory: Array<{ date: string; price: number }>
    rentalHistory: Array<{ date: string; rent: number }>
    volumeHistory: Array<{ date: string; volume: number }>
  }
}

export interface MarketInsights {
  topPerformers: Array<{ state: string; growth: number; score: number }>
  marketSentiment: "bullish" | "bearish" | "neutral"
  sentimentScore: number
  keyTrends: string[]
  riskFactors: string[]
  opportunities: string[]
  forecast: {
    shortTerm: string
    longTerm: string
    confidence: number
  }
}

export interface PropertyAnalysis {
  location: string
  budget: number
  investmentGoals: string
  recommendations: string[]
  marketData: RealTimeMarketData
  projectedROI: number
  riskAssessment: string
  cashFlowProjection: Array<{ year: number; cashFlow: number; roi: number }>
}

// --- Compatibility types for legacy code -----------------
export interface MarketAnalysis {
  location: string
  score: number
  rank: number
  strengths: string[]
  weaknesses: string[]
  recommendation: string
}
// ---------------------------------------------------------

export class DataAnalysisAgent {
  private marketDataCache: Map<string, RealTimeMarketData> = new Map()
  private lastUpdate: Date = new Date()

  // Simulate real-time data with realistic fluctuations
  private generateRealTimeData(location: string): RealTimeMarketData {
    const baseData = this.getBaseMarketData(location)
    const now = new Date()

    // Simulate price fluctuations
    const priceVariation = (Math.random() - 0.5) * 0.02 // ±1% variation
    const currentPrice = Math.round(baseData.averagePrice * (1 + priceVariation))

    // Generate price history for the last 30 days
    const priceHistory = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const variation = (Math.random() - 0.5) * 0.01
      const price = Math.round(baseData.averagePrice * (1 + variation))
      priceHistory.push({
        date: date.toISOString().split("T")[0],
        price: price,
      })
    }

    // Generate rental history
    const rentalHistory = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const baseRent = Math.round((currentPrice * baseData.rentalYield) / 100 / 12)
      const variation = (Math.random() - 0.5) * 0.05
      const rent = Math.round(baseRent * (1 + variation))
      rentalHistory.push({
        date: date.toISOString().split("T")[0],
        rent: rent,
      })
    }

    // Generate volume history
    const volumeHistory = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const baseVolume = 1000 + Math.random() * 500
      volumeHistory.push({
        date: date.toISOString().split("T")[0],
        volume: Math.round(baseVolume),
      })
    }

    return {
      location,
      currentPrice,
      priceChange24h: Math.round((Math.random() - 0.5) * 10000),
      priceChangePercent: Number(((Math.random() - 0.5) * 2).toFixed(2)),
      volume: Math.round(1000 + Math.random() * 500),
      marketCap: Math.round(currentPrice * 10000 + Math.random() * 1000000),
      rentalYield: Number((baseData.rentalYield + (Math.random() - 0.5) * 0.5).toFixed(2)),
      vacancyRate: Number((baseData.vacancyRate + (Math.random() - 0.5) * 0.5).toFixed(2)),
      populationGrowth: Number((baseData.populationGrowth + (Math.random() - 0.5) * 0.2).toFixed(2)),
      employmentRate: Number((baseData.employmentRate + (Math.random() - 0.5) * 0.5).toFixed(2)),
      crimeIndex: Number((baseData.crimeIndex + (Math.random() - 0.5) * 0.3).toFixed(2)),
      schoolRating: Number((baseData.schoolRating + (Math.random() - 0.5) * 0.2).toFixed(1)),
      walkScore: Math.round(baseData.walkScore + (Math.random() - 0.5) * 5),
      lastUpdated: now,
      trends: {
        priceHistory,
        rentalHistory,
        volumeHistory,
      },
    }
  }

  private getBaseMarketData(location: string) {
    const marketData: Record<string, any> = {
      Texas: {
        averagePrice: 350000,
        rentalYield: 6.8,
        vacancyRate: 4.1,
        populationGrowth: 2.3,
        employmentRate: 96.2,
        crimeIndex: 3.8,
        schoolRating: 7.2,
        walkScore: 45,
      },
      Nevada: {
        averagePrice: 420000,
        rentalYield: 5.9,
        vacancyRate: 5.2,
        populationGrowth: 1.8,
        employmentRate: 95.8,
        crimeIndex: 4.2,
        schoolRating: 6.8,
        walkScore: 42,
      },
      Arkansas: {
        averagePrice: 180000,
        rentalYield: 8.2,
        vacancyRate: 6.1,
        populationGrowth: 0.8,
        employmentRate: 94.2,
        crimeIndex: 4.8,
        schoolRating: 6.2,
        walkScore: 35,
      },
      Alabama: {
        averagePrice: 195000,
        rentalYield: 7.8,
        vacancyRate: 5.8,
        populationGrowth: 0.6,
        employmentRate: 94.8,
        crimeIndex: 4.5,
        schoolRating: 6.5,
        walkScore: 38,
      },
      Florida: {
        averagePrice: 385000,
        rentalYield: 6.2,
        vacancyRate: 3.9,
        populationGrowth: 2.7,
        employmentRate: 96.5,
        crimeIndex: 3.5,
        schoolRating: 7.5,
        walkScore: 48,
      },
      Georgia: {
        averagePrice: 285000,
        rentalYield: 7.1,
        vacancyRate: 4.8,
        populationGrowth: 1.9,
        employmentRate: 95.8,
        crimeIndex: 4.1,
        schoolRating: 7.0,
        walkScore: 43,
      },
      Montana: {
        averagePrice: 465000,
        rentalYield: 4.8,
        vacancyRate: 7.2,
        populationGrowth: 1.2,
        employmentRate: 94.5,
        crimeIndex: 2.8,
        schoolRating: 6.9,
        walkScore: 35,
      },
      Ohio: {
        averagePrice: 165000,
        rentalYield: 9.1,
        vacancyRate: 6.8,
        populationGrowth: 0.3,
        employmentRate: 94.2,
        crimeIndex: 4.6,
        schoolRating: 6.8,
        walkScore: 41,
      },
      Indiana: {
        averagePrice: 155000,
        rentalYield: 8.8,
        vacancyRate: 6.5,
        populationGrowth: 0.5,
        employmentRate: 94.8,
        crimeIndex: 4.3,
        schoolRating: 6.6,
        walkScore: 39,
      },
      "North Carolina": {
        averagePrice: 295000,
        rentalYield: 6.8,
        vacancyRate: 4.5,
        populationGrowth: 1.6,
        employmentRate: 95.5,
        crimeIndex: 3.9,
        schoolRating: 7.3,
        walkScore: 44,
      },
      Tennessee: {
        averagePrice: 265000,
        rentalYield: 7.4,
        vacancyRate: 4.2,
        populationGrowth: 1.8,
        employmentRate: 95.2,
        crimeIndex: 4.0,
        schoolRating: 6.9,
        walkScore: 42,
      },
      Arizona: {
        averagePrice: 415000,
        rentalYield: 5.6,
        vacancyRate: 5.8,
        populationGrowth: 1.5,
        employmentRate: 95.1,
        crimeIndex: 4.1,
        schoolRating: 6.7,
        walkScore: 46,
      },
      Missouri: {
        averagePrice: 185000,
        rentalYield: 8.5,
        vacancyRate: 6.2,
        populationGrowth: 0.4,
        employmentRate: 94.5,
        crimeIndex: 4.7,
        schoolRating: 6.4,
        walkScore: 38,
      },
      Michigan: {
        averagePrice: 175000,
        rentalYield: 8.9,
        vacancyRate: 7.1,
        populationGrowth: 0.2,
        employmentRate: 93.8,
        crimeIndex: 4.9,
        schoolRating: 6.5,
        walkScore: 40,
      },
      "South Carolina": {
        averagePrice: 245000,
        rentalYield: 7.2,
        vacancyRate: 4.8,
        populationGrowth: 1.4,
        employmentRate: 95.0,
        crimeIndex: 4.2,
        schoolRating: 6.8,
        walkScore: 41,
      },
      Kentucky: {
        averagePrice: 165000,
        rentalYield: 8.6,
        vacancyRate: 6.0,
        populationGrowth: 0.3,
        employmentRate: 94.1,
        crimeIndex: 4.4,
        schoolRating: 6.3,
        walkScore: 37,
      },
    }

    return marketData[location] || marketData["Texas"]
  }

  async getRealTimeMarketData(location: string): Promise<RealTimeMarketData> {
    const cacheKey = location
    const now = new Date()

    // Update cache every 5 minutes
    if (this.marketDataCache.has(cacheKey)) {
      const cached = this.marketDataCache.get(cacheKey)!
      if (now.getTime() - cached.lastUpdated.getTime() < 5 * 60 * 1000) {
        return cached
      }
    }

    const realTimeData = this.generateRealTimeData(location)
    this.marketDataCache.set(cacheKey, realTimeData)
    return realTimeData
  }

  async getMarketInsights(): Promise<MarketInsights> {
    const states = [
      "Texas",
      "Nevada",
      "Arkansas",
      "Alabama",
      "Florida",
      "Georgia",
      "Montana",
      "Ohio",
      "Indiana",
      "North Carolina",
      "Tennessee",
      "Arizona",
      "Missouri",
      "Michigan",
      "South Carolina",
      "Kentucky",
    ]

    const topPerformers = []
    for (const state of states.slice(0, 5)) {
      const data = await this.getRealTimeMarketData(state)
      const score = this.calculateMarketScore(data)
      topPerformers.push({
        state,
        growth: data.priceChangePercent,
        score: Math.round(score),
      })
    }

    // Sort by score
    topPerformers.sort((a, b) => b.score - a.score)

    const avgGrowth = topPerformers.reduce((sum, p) => sum + p.growth, 0) / topPerformers.length
    const sentimentScore = Math.min(100, Math.max(0, 50 + avgGrowth * 10))

    let marketSentiment: "bullish" | "bearish" | "neutral" = "neutral"
    if (sentimentScore > 65) marketSentiment = "bullish"
    else if (sentimentScore < 35) marketSentiment = "bearish"

    return {
      topPerformers,
      marketSentiment,
      sentimentScore: Math.round(sentimentScore),
      keyTrends: [
        "Single-family rental demand remains strong across all markets",
        "Interest rate stabilization driving renewed investor confidence",
        "Population migration to Sun Belt states continues",
        "Build-to-rent developments gaining momentum",
        "Technology integration improving property management efficiency",
      ],
      riskFactors: [
        "Potential interest rate volatility",
        "Regional economic disparities",
        "Insurance cost increases in certain markets",
        "Regulatory changes in rental markets",
      ],
      opportunities: [
        "Emerging secondary markets showing strong fundamentals",
        "Value-add opportunities in transitioning neighborhoods",
        "Short-term rental market expansion",
        "Industrial-to-residential conversion projects",
      ],
      forecast: {
        shortTerm: "Moderate growth expected over next 6 months with regional variations",
        longTerm: "Sustained demand driven by demographic trends and housing shortage",
        confidence: 78,
      },
    }
  }

  private calculateMarketScore(data: RealTimeMarketData): number {
    let score = 50 // Base score

    // Price appreciation (weight: 20%)
    score += Math.min(data.priceChangePercent * 2, 10)

    // Rental yield (weight: 25%)
    score += Math.min(data.rentalYield * 2, 15)

    // Low vacancy rate (weight: 15%)
    score += Math.max(0, (8 - data.vacancyRate) * 2)

    // Population growth (weight: 15%)
    score += data.populationGrowth * 5

    // Employment rate (weight: 10%)
    score += (data.employmentRate - 90) * 2

    // Low crime index (weight: 10%)
    score += Math.max(0, (6 - data.crimeIndex) * 2)

    // School rating (weight: 5%)
    score += data.schoolRating

    return Math.max(0, Math.min(100, score))
  }

  async analyzeProperty(location: string, budget: number, investmentGoals: string): Promise<PropertyAnalysis> {
    const marketData = await this.getRealTimeMarketData(location)
    const recommendations = this.generateRecommendations(marketData, budget, investmentGoals)
    const projectedROI = this.calculateProjectedROI(marketData, budget)
    const riskAssessment = this.assessRisk(marketData, budget)
    const cashFlowProjection = this.generateCashFlowProjection(marketData, budget)

    return {
      location,
      budget,
      investmentGoals,
      recommendations,
      marketData,
      projectedROI,
      riskAssessment,
      cashFlowProjection,
    }
  }

  private generateRecommendations(market: RealTimeMarketData, budget: number, goals: string): string[] {
    const recommendations: string[] = []

    // Budget-based recommendations
    if (budget < market.currentPrice * 0.8) {
      recommendations.push(
        `Consider properties below $${(market.currentPrice * 0.8).toLocaleString()} or explore emerging neighborhoods`,
      )
      recommendations.push("Look for value-add opportunities or properties needing minor renovations")
    } else if (budget > market.currentPrice * 1.5) {
      recommendations.push("You have flexibility to target premium properties in prime locations")
      recommendations.push("Consider multi-unit properties or commercial real estate for better returns")
    }

    // Market-specific recommendations
    if (market.priceChangePercent > 2) {
      recommendations.push("Market is appreciating rapidly - consider acting quickly on good opportunities")
    } else if (market.priceChangePercent < -1) {
      recommendations.push("Market correction may present buying opportunities")
    }

    // Rental yield recommendations
    if (market.rentalYield > 7) {
      recommendations.push("Excellent cash flow market - prioritize rental income properties")
    } else if (market.rentalYield < 5) {
      recommendations.push("Focus on appreciation plays rather than cash flow")
    }

    // Vacancy rate considerations
    if (market.vacancyRate < 4) {
      recommendations.push("Low vacancy rates indicate strong rental demand")
    } else if (market.vacancyRate > 7) {
      recommendations.push("Higher vacancy rates - ensure strong property management")
    }

    return recommendations
  }

  private calculateProjectedROI(market: RealTimeMarketData, budget: number): number {
    const appreciationROI = Math.max(0, market.priceChangePercent)
    const cashFlowROI = market.rentalYield
    const totalROI = appreciationROI + cashFlowROI

    // Adjust based on market conditions
    const marketScore = this.calculateMarketScore(market)
    const adjustmentFactor = marketScore / 100
    const adjustedROI = totalROI * adjustmentFactor

    return Math.round(adjustedROI * 100) / 100
  }

  private assessRisk(market: RealTimeMarketData, budget: number): string {
    const riskFactors: string[] = []

    if (Math.abs(market.priceChangePercent) > 5) {
      riskFactors.push("High price volatility")
    }

    if (market.vacancyRate > 7) {
      riskFactors.push("Elevated vacancy rates")
    }

    if (market.crimeIndex > 4.5) {
      riskFactors.push("Above-average crime rates")
    }

    if (market.employmentRate < 94) {
      riskFactors.push("Lower employment rates")
    }

    if (budget > market.currentPrice * 2) {
      riskFactors.push("High-end market segment with lower liquidity")
    }

    if (riskFactors.length === 0) {
      return "Low to moderate risk with stable market fundamentals"
    } else if (riskFactors.length <= 2) {
      return `Moderate risk. Key concerns: ${riskFactors.join(", ")}`
    } else {
      return `Higher risk investment. Multiple concerns: ${riskFactors.join(", ")}`
    }
  }

  private generateCashFlowProjection(
    market: RealTimeMarketData,
    budget: number,
  ): Array<{ year: number; cashFlow: number; roi: number }> {
    const projection = []
    const initialRent = Math.round((budget * market.rentalYield) / 100 / 12)
    const expenses = Math.round(initialRent * 0.4) // 40% expense ratio

    for (let year = 1; year <= 5; year++) {
      const rentGrowth = Math.pow(1.03, year - 1) // 3% annual rent growth
      const monthlyRent = Math.round(initialRent * rentGrowth)
      const monthlyExpenses = Math.round(expenses * rentGrowth)
      const monthlyCashFlow = monthlyRent - monthlyExpenses
      const annualCashFlow = monthlyCashFlow * 12
      const roi = (annualCashFlow / budget) * 100

      projection.push({
        year,
        cashFlow: annualCashFlow,
        roi: Math.round(roi * 100) / 100,
      })
    }

    return projection
  }
}

export const dataAnalysisAgent = new DataAnalysisAgent()

// Export additional utility functions
export async function fetchRealTimeMarketData(location: string): Promise<RealTimeMarketData> {
  return await dataAnalysisAgent.getRealTimeMarketData(location)
}

export async function getMarketInsights(): Promise<MarketInsights> {
  return await dataAnalysisAgent.getMarketInsights()
}

// ---------------------------------------------------------------------------
//  ⚠️  Compatibility helper – legacy code expects `analyzeMarketData`
// ---------------------------------------------------------------------------
/**
 * Lightweight wrapper that converts the new real-time market data into the
 * legacy `MarketAnalysis` structure so existing code keeps working.
 *
 * NOTE: This uses a very simple scoring system and is meant only to satisfy
 * the previously-compiled modules until you migrate fully to the new
 * `PropertyAnalysis` flow.
 */
export async function analyzeMarketData(location: string): Promise<MarketAnalysis> {
  const data = await dataAnalysisAgent.getRealTimeMarketData(location)

  // Simple score (0-100) combining appreciation, yield and vacancy
  let score = Math.max(0, data.priceChangePercent) * 3 + data.rentalYield * 5 - data.vacancyRate * 2

  score = Math.min(Math.max(score, 0), 100)

  const strengths: string[] = []
  const weaknesses: string[] = []

  if (data.rentalYield > 7) strengths.push("High rental yield")
  if (data.vacancyRate < 4) strengths.push("Low vacancy rate")
  if (data.priceChangePercent > 2) strengths.push("Positive price momentum")

  if (data.rentalYield < 5) weaknesses.push("Below-average rental yield")
  if (data.vacancyRate > 7) weaknesses.push("High vacancy rate")
  if (data.priceChangePercent < -1) weaknesses.push("Negative short-term price movement")

  const recommendation =
    score >= 80
      ? "Excellent investment opportunity"
      : score >= 60
        ? "Good potential with manageable risks"
        : score >= 40
          ? "Proceed with caution – mixed signals"
          : "High risk – not recommended"

  return {
    location: data.location,
    score,
    rank: 0, // can be set when ranking multiple markets
    strengths: strengths.length ? strengths : ["Stable fundamentals"],
    weaknesses: weaknesses.length ? weaknesses : ["No major weaknesses"],
    recommendation,
  }
}
// ---------------------------------------------------------------------------
