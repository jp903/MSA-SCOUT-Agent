interface MarketData {
  population_growth: number
  job_growth: number
  vacancy_rate: number
  house_price_growth: number
  net_migration: number
  intl_inflows: number
  single_family_permits: number
  multi_family_permits: number
}

interface MarketAnalysis {
  location: string
  score: number
  rank: number
  strengths: string[]
  weaknesses: string[]
  recommendation: string
}

export async function analyzeMarketData(location: string, budget: number): Promise<MarketAnalysis> {
  // Simulate market data analysis
  const mockData: MarketData = {
    population_growth: Math.random() * 5,
    job_growth: Math.random() * 4,
    vacancy_rate: Math.random() * 10,
    house_price_growth: Math.random() * 8,
    net_migration: Math.random() * 3,
    intl_inflows: Math.random() * 2,
    single_family_permits: Math.random() * 1000,
    multi_family_permits: Math.random() * 500,
  }

  // Calculate weighted score
  const score = calculateMarketScore(mockData)

  return {
    location,
    score,
    rank: Math.floor(Math.random() * 100) + 1,
    strengths: generateStrengths(mockData),
    weaknesses: generateWeaknesses(mockData),
    recommendation: generateRecommendation(score, budget),
  }
}

function calculateMarketScore(data: MarketData): number {
  const weights = {
    population_growth: 0.2,
    job_growth: 0.25,
    vacancy_rate: -0.15, // Lower is better
    house_price_growth: 0.15,
    net_migration: 0.1,
    intl_inflows: 0.05,
    single_family_permits: 0.1,
    multi_family_permits: 0.1,
  }

  let score = 0
  score += data.population_growth * weights.population_growth
  score += data.job_growth * weights.job_growth
  score += (10 - data.vacancy_rate) * Math.abs(weights.vacancy_rate) // Invert vacancy rate
  score += data.house_price_growth * weights.house_price_growth
  score += data.net_migration * weights.net_migration
  score += data.intl_inflows * weights.intl_inflows
  score += (data.single_family_permits / 100) * weights.single_family_permits
  score += (data.multi_family_permits / 100) * weights.multi_family_permits

  return Math.min(Math.max(score * 10, 0), 100) // Scale to 0-100
}

function generateStrengths(data: MarketData): string[] {
  const strengths: string[] = []

  if (data.population_growth > 2) strengths.push("Strong population growth")
  if (data.job_growth > 2) strengths.push("Robust job market expansion")
  if (data.vacancy_rate < 5) strengths.push("Low vacancy rates")
  if (data.house_price_growth > 4) strengths.push("Appreciating property values")
  if (data.net_migration > 1.5) strengths.push("Positive net migration")

  return strengths.length > 0 ? strengths : ["Stable market conditions"]
}

function generateWeaknesses(data: MarketData): string[] {
  const weaknesses: string[] = []

  if (data.population_growth < 1) weaknesses.push("Slow population growth")
  if (data.job_growth < 1) weaknesses.push("Limited job growth")
  if (data.vacancy_rate > 8) weaknesses.push("High vacancy rates")
  if (data.house_price_growth < 2) weaknesses.push("Slow price appreciation")

  return weaknesses.length > 0 ? weaknesses : ["Minor market volatility"]
}

function generateRecommendation(score: number, budget: number): string {
  if (score > 80) {
    return `Excellent investment opportunity! With a score of ${score.toFixed(1)}, this market shows strong fundamentals across multiple indicators.`
  } else if (score > 60) {
    return `Good investment potential. Score of ${score.toFixed(1)} indicates solid market conditions with room for growth.`
  } else if (score > 40) {
    return `Moderate investment opportunity. Score of ${score.toFixed(1)} suggests careful analysis of specific neighborhoods is recommended.`
  } else {
    return `Proceed with caution. Score of ${score.toFixed(1)} indicates challenging market conditions that require thorough due diligence.`
  }
}

export async function fetchCensusData(location: string): Promise<any> {
  // Mock census data fetch
  return {
    population: Math.floor(Math.random() * 1000000) + 100000,
    households: Math.floor(Math.random() * 400000) + 40000,
    median_income: Math.floor(Math.random() * 50000) + 40000,
  }
}

export async function fetchBLSData(location: string): Promise<any> {
  // Mock BLS data fetch
  return {
    unemployment_rate: Math.random() * 8,
    employment_growth: Math.random() * 5,
    average_wage: Math.floor(Math.random() * 30000) + 35000,
  }
}
