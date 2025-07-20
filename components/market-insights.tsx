"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  BarChart3,
  MapPin,
  AlertTriangle,
  Zap,
  Building,
  Users,
} from "lucide-react"

interface MarketData {
  state: string
  population_growth: number
  job_growth: number
  house_price_index_growth: number
  net_migration: number
  vacancy_rate: number
  international_inflows: number
  single_family_permits: number
  multi_family_permits: number
  lastUpdated: Date
  trends: {
    population_growth: "up" | "down" | "stable"
    job_growth: "up" | "down" | "stable"
    house_price_index_growth: "up" | "down" | "stable"
    net_migration: "up" | "down" | "stable"
    vacancy_rate: "up" | "down" | "stable"
    international_inflows: "up" | "down" | "stable"
    single_family_permits: "up" | "down" | "stable"
    multi_family_permits: "up" | "down" | "stable"
  }
  score?: number
}

export default function MarketInsights() {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [topStates, setTopStates] = useState<MarketData[]>([])

  // Mock data for 16 states with the 8 variables
  const mockMarketData: Omit<MarketData, "trends" | "score">[] = [
    {
      state: "Texas",
      population_growth: 1.8,
      job_growth: 3.2,
      house_price_index_growth: 8.5,
      net_migration: 45000,
      vacancy_rate: 3.8,
      international_inflows: 12000,
      single_family_permits: 85000,
      multi_family_permits: 25000,
      lastUpdated: new Date(),
    },
    {
      state: "Florida",
      population_growth: 2.3,
      job_growth: 3.5,
      house_price_index_growth: 11.8,
      net_migration: 85000,
      vacancy_rate: 3.2,
      international_inflows: 45000,
      single_family_permits: 95000,
      multi_family_permits: 35000,
      lastUpdated: new Date(),
    },
    {
      state: "Nevada",
      population_growth: 2.1,
      job_growth: 2.8,
      house_price_index_growth: 12.3,
      net_migration: 18000,
      vacancy_rate: 4.2,
      international_inflows: 3200,
      single_family_permits: 15000,
      multi_family_permits: 8500,
      lastUpdated: new Date(),
    },
    {
      state: "Arkansas",
      population_growth: 0.8,
      job_growth: 1.5,
      house_price_index_growth: 6.8,
      net_migration: 8500,
      vacancy_rate: 5.1,
      international_inflows: 1200,
      single_family_permits: 12000,
      multi_family_permits: 2800,
      lastUpdated: new Date(),
    },
    {
      state: "Alabama",
      population_growth: 0.6,
      job_growth: 1.8,
      house_price_index_growth: 7.2,
      net_migration: 12000,
      vacancy_rate: 4.8,
      international_inflows: 1800,
      single_family_permits: 18000,
      multi_family_permits: 4200,
      lastUpdated: new Date(),
    },
    {
      state: "Georgia",
      population_growth: 1.5,
      job_growth: 2.9,
      house_price_index_growth: 9.1,
      net_migration: 35000,
      vacancy_rate: 4.1,
      international_inflows: 8500,
      single_family_permits: 42000,
      multi_family_permits: 18000,
      lastUpdated: new Date(),
    },
    {
      state: "Montana",
      population_growth: 1.2,
      job_growth: 2.1,
      house_price_index_growth: 15.2,
      net_migration: 8500,
      vacancy_rate: 2.9,
      international_inflows: 450,
      single_family_permits: 5500,
      multi_family_permits: 1200,
      lastUpdated: new Date(),
    },
    {
      state: "Ohio",
      population_growth: 0.2,
      job_growth: 1.2,
      house_price_index_growth: 5.4,
      net_migration: -5000,
      vacancy_rate: 5.8,
      international_inflows: 3200,
      single_family_permits: 28000,
      multi_family_permits: 12000,
      lastUpdated: new Date(),
    },
    {
      state: "Indiana",
      population_growth: 0.4,
      job_growth: 1.8,
      house_price_index_growth: 6.2,
      net_migration: 8000,
      vacancy_rate: 5.2,
      international_inflows: 2100,
      single_family_permits: 22000,
      multi_family_permits: 8500,
      lastUpdated: new Date(),
    },
    {
      state: "North Carolina",
      population_growth: 1.4,
      job_growth: 2.6,
      house_price_index_growth: 10.3,
      net_migration: 28000,
      vacancy_rate: 3.6,
      international_inflows: 6800,
      single_family_permits: 48000,
      multi_family_permits: 22000,
      lastUpdated: new Date(),
    },
    {
      state: "Tennessee",
      population_growth: 1.1,
      job_growth: 2.4,
      house_price_index_growth: 8.9,
      net_migration: 22000,
      vacancy_rate: 4.3,
      international_inflows: 3500,
      single_family_permits: 32000,
      multi_family_permits: 15000,
      lastUpdated: new Date(),
    },
    {
      state: "Arizona",
      population_growth: 1.9,
      job_growth: 3.1,
      house_price_index_growth: 13.1,
      net_migration: 42000,
      vacancy_rate: 3.8,
      international_inflows: 8200,
      single_family_permits: 38000,
      multi_family_permits: 18500,
      lastUpdated: new Date(),
    },
    {
      state: "Missouri",
      population_growth: 0.3,
      job_growth: 1.4,
      house_price_index_growth: 6.8,
      net_migration: 2500,
      vacancy_rate: 5.4,
      international_inflows: 2800,
      single_family_permits: 18000,
      multi_family_permits: 7500,
      lastUpdated: new Date(),
    },
    {
      state: "Michigan",
      population_growth: 0.1,
      job_growth: 1.6,
      house_price_index_growth: 7.8,
      net_migration: -2000,
      vacancy_rate: 6.1,
      international_inflows: 4200,
      single_family_permits: 25000,
      multi_family_permits: 11000,
      lastUpdated: new Date(),
    },
    {
      state: "South Carolina",
      population_growth: 1.3,
      job_growth: 2.2,
      house_price_index_growth: 9.6,
      net_migration: 18000,
      vacancy_rate: 4.5,
      international_inflows: 2800,
      single_family_permits: 28000,
      multi_family_permits: 12500,
      lastUpdated: new Date(),
    },
    {
      state: "Kentucky",
      population_growth: 0.5,
      job_growth: 1.3,
      house_price_index_growth: 5.9,
      net_migration: 3500,
      vacancy_rate: 5.7,
      international_inflows: 1500,
      single_family_permits: 15000,
      multi_family_permits: 5500,
      lastUpdated: new Date(),
    },
  ]

  const generateTrends = (current: number, base: number) => {
    const change = ((current - base) / base) * 100
    if (change > 2) return "up"
    if (change < -2) return "down"
    return "stable"
  }

  const calculateScore = (state: MarketData): number => {
    return (
      state.population_growth * 0.2 +
      state.job_growth * 0.25 +
      state.house_price_index_growth * 0.2 +
      (state.net_migration / 1000) * 0.15 +
      (10 - state.vacancy_rate) * 0.1 +
      (state.international_inflows / 1000) * 0.05 +
      (state.single_family_permits / 1000) * 0.03 +
      (state.multi_family_permits / 1000) * 0.02
    )
  }

  useEffect(() => {
    // Load market data and calculate top states
    const loadMarketData = () => {
      const data: MarketData[] = mockMarketData.map((state) => {
        const newData = {
          ...state,
          population_growth: Number((state.population_growth + (Math.random() - 0.5) * 0.1).toFixed(1)),
          job_growth: Number((state.job_growth + (Math.random() - 0.5) * 0.2).toFixed(1)),
          house_price_index_growth: Number((state.house_price_index_growth + (Math.random() - 0.5) * 0.5).toFixed(1)),
          net_migration: Math.round(state.net_migration + (Math.random() - 0.5) * 1000),
          vacancy_rate: Number((state.vacancy_rate + (Math.random() - 0.5) * 0.3).toFixed(1)),
          international_inflows: Math.round(state.international_inflows + (Math.random() - 0.5) * 200),
          single_family_permits: Math.round(state.single_family_permits + (Math.random() - 0.5) * 2000),
          multi_family_permits: Math.round(state.multi_family_permits + (Math.random() - 0.5) * 1000),
          lastUpdated: new Date(),
        }

        // Generate trends
        const trends: MarketData["trends"] = {
          population_growth: generateTrends(newData.population_growth, state.population_growth),
          job_growth: generateTrends(newData.job_growth, state.job_growth),
          house_price_index_growth: generateTrends(newData.house_price_index_growth, state.house_price_index_growth),
          net_migration: generateTrends(newData.net_migration, state.net_migration),
          vacancy_rate: generateTrends(state.vacancy_rate, newData.vacancy_rate), // Inverted for vacancy
          international_inflows: generateTrends(newData.international_inflows, state.international_inflows),
          single_family_permits: generateTrends(newData.single_family_permits, state.single_family_permits),
          multi_family_permits: generateTrends(newData.multi_family_permits, state.multi_family_permits),
        }

        const fullStateData = { ...newData, trends }
        const score = calculateScore(fullStateData)

        return {
          ...fullStateData,
          score,
        }
      })

      // Sort by score and get top 4
      const sortedStates = [...data].sort((a, b) => (b.score || 0) - (a.score || 0))
      const top4 = sortedStates.slice(0, 4)

      setMarketData(data)
      setTopStates(top4)
    }

    loadMarketData()
    // Update every 30 seconds
    const interval = setInterval(loadMarketData, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const insights = [
    {
      title: "Interest Rate Impact",
      description:
        "Current mortgage rates at 7.2% are significantly affecting buyer demand across major markets. Higher rates reduce purchasing power by approximately 20-25% compared to 2021 levels.",
      impact: "High",
      color: "red",
      icon: DollarSign,
      reason:
        "Federal Reserve's aggressive rate hikes to combat inflation have made borrowing more expensive, pricing out many first-time buyers and reducing overall market liquidity.",
    },
    {
      title: "Inventory Shortage",
      description:
        "Limited housing supply continues to drive price competition in most markets. National inventory sits at just 2.1 months supply, well below the balanced market level of 6 months.",
      impact: "High",
      color: "red",
      icon: Home,
      reason:
        "Years of underbuilding following the 2008 crisis, combined with supply chain disruptions and labor shortages, have created a structural housing deficit of 3-4 million units.",
    },
    {
      title: "Remote Work Migration",
      description:
        "Suburban and secondary markets continue seeing increased investment activity as remote work policies drive population shifts away from expensive urban centers.",
      impact: "Medium",
      color: "yellow",
      icon: Users,
      reason:
        "Permanent remote work arrangements allow people to relocate to areas with lower costs of living while maintaining urban salaries, creating new investment hotspots.",
    },
    {
      title: "Construction Cost Inflation",
      description:
        "Rising material and labor costs are affecting new development projects, with construction costs up 15-20% year-over-year in most markets.",
      impact: "Medium",
      color: "yellow",
      icon: Building,
      reason:
        "Supply chain disruptions, tariffs on building materials, and skilled labor shortages have driven up construction costs, making new projects less profitable and slowing supply additions.",
    },
    {
      title: "Institutional Investment",
      description:
        "Large institutional investors continue to compete with individual buyers, particularly in the single-family rental market, driving up prices in target markets.",
      impact: "Medium",
      color: "yellow",
      icon: BarChart3,
      reason:
        "Pension funds, REITs, and private equity firms view real estate as an inflation hedge and stable income source, bringing significant capital to residential markets.",
    },
    {
      title: "Climate Risk Pricing",
      description:
        "Insurance costs and climate risks are increasingly factored into property valuations, particularly in flood-prone and wildfire-risk areas.",
      impact: "Medium",
      color: "yellow",
      icon: AlertTriangle,
      reason:
        "Rising frequency of extreme weather events and updated FEMA flood maps are forcing insurers to raise premiums or exit markets entirely, affecting property affordability.",
    },
    {
      title: "Technology Integration",
      description:
        "PropTech adoption is improving property management efficiency and tenant experience, creating competitive advantages for tech-savvy investors.",
      impact: "Low",
      color: "green",
      icon: Zap,
      reason:
        "Smart home technology, digital rent collection, and AI-powered maintenance scheduling are reducing operational costs and improving tenant satisfaction and retention.",
    },
    {
      title: "Demographic Shifts",
      description:
        "Millennials entering peak homebuying years while Baby Boomers age in place, creating unique demand patterns across different property types.",
      impact: "Medium",
      color: "yellow",
      icon: TrendingUp,
      reason:
        "The largest generation in US history is reaching prime homebuying age (30-40), while older generations are staying in homes longer, constraining supply and driving demand.",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Insights</h1>
        <p className="text-gray-600">Real-time property market analysis and trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">National Median</p>
                <p className="text-2xl font-bold text-gray-900">$425,000</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.8% YoY
                </p>
              </div>
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Days on Market</p>
                <p className="text-2xl font-bold text-gray-900">28</p>
                <p className="text-sm text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -5 days
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mortgage Rate</p>
                <p className="text-2xl font-bold text-gray-900">7.2%</p>
                <p className="text-sm text-red-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.3%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Level</p>
                <p className="text-2xl font-bold text-gray-900">2.1</p>
                <p className="text-sm text-gray-600">months supply</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top State Markets */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing State Markets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topStates.map((market, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{market.state}</h3>
                    <p className="text-sm text-gray-600">Score: {market.score?.toFixed(1)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div
                      className={`flex items-center ${market.house_price_index_growth > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {market.house_price_index_growth > 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {market.house_price_index_growth > 0 ? "+" : ""}
                      {market.house_price_index_growth}%
                    </div>
                    <p className="text-sm text-gray-600">Price Growth</p>
                  </div>
                  <Badge
                    variant={
                      market.vacancy_rate < 4 ? "destructive" : market.vacancy_rate > 6 ? "default" : "secondary"
                    }
                  >
                    {market.vacancy_rate}% Vacancy
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Market Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        insight.color === "red"
                          ? "bg-red-100"
                          : insight.color === "yellow"
                            ? "bg-yellow-100"
                            : "bg-green-100"
                      }`}
                    >
                      <insight.icon
                        className={`h-4 w-4 ${
                          insight.color === "red"
                            ? "text-red-600"
                            : insight.color === "yellow"
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                  </div>
                  <Badge
                    variant={
                      insight.color === "red" ? "destructive" : insight.color === "yellow" ? "secondary" : "default"
                    }
                  >
                    {insight.impact} Impact
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-700">
                    <strong>Why this matters:</strong> {insight.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
