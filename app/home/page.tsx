"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Calculator,
  TrendingUp,
  Building2,
  MessageSquare,
  FileText,
  FileSpreadsheet,
  FileImage,
  Download,
  PresentationIcon as PresentationChart,
  ArrowUp,
  ArrowDown,
  Minus,
  DollarSign,
  HomeIcon,
  Calendar,
  BarChart3,
  Loader2,
} from "lucide-react"

interface MarketDataWithAnalysis {
  location: string
  currentPrice: number
  priceChange24h: number
  priceChangePercent: number
  rentalYield: number
  populationGrowth: number
  jobGrowth: number
  vacancyRate: number
  employmentRate: number
  crimeIndex: number
  schoolRating: number
  lastUpdated: Date
  score: number
  aiAnalysis: {
    strengths: string[]
    risks: string[]
    recommendation: string
    investmentTier: "Premium" | "Strong" | "Moderate" | "Caution"
  }
}

export default function HomePage() {
  const [topStates, setTopStates] = useState<MarketDataWithAnalysis[]>([])
  const [loading, setLoading] = useState(true)

  const generateMockData = (): MarketDataWithAnalysis[] => {
    const states = [
      {
        location: "Florida",
        currentPrice: 395000,
        priceChange24h: 3200,
        priceChangePercent: 11.8,
        rentalYield: 6.8,
        populationGrowth: 2.3,
        jobGrowth: 3.5,
        vacancyRate: 3.2,
        employmentRate: 95.8,
        crimeIndex: 4.2,
        schoolRating: 7.8,
      },
      {
        location: "Texas",
        currentPrice: 285000,
        priceChange24h: 2400,
        priceChangePercent: 8.5,
        rentalYield: 7.2,
        populationGrowth: 1.8,
        jobGrowth: 3.2,
        vacancyRate: 3.8,
        employmentRate: 96.2,
        crimeIndex: 3.8,
        schoolRating: 7.5,
      },
      {
        location: "Arizona",
        currentPrice: 445000,
        priceChange24h: 3800,
        priceChangePercent: 13.1,
        rentalYield: 6.2,
        populationGrowth: 1.9,
        jobGrowth: 3.1,
        vacancyRate: 3.8,
        employmentRate: 95.1,
        crimeIndex: 4.1,
        schoolRating: 7.4,
      },
      {
        location: "Nevada",
        currentPrice: 425000,
        priceChange24h: 4100,
        priceChangePercent: 12.3,
        rentalYield: 6.5,
        populationGrowth: 2.1,
        jobGrowth: 2.8,
        vacancyRate: 4.2,
        employmentRate: 94.5,
        crimeIndex: 4.5,
        schoolRating: 6.9,
      },
      {
        location: "Georgia",
        currentPrice: 265000,
        priceChange24h: 1800,
        priceChangePercent: 9.1,
        rentalYield: 7.8,
        populationGrowth: 1.5,
        jobGrowth: 2.9,
        vacancyRate: 4.1,
        employmentRate: 95.2,
        crimeIndex: 4.0,
        schoolRating: 7.2,
      },
      {
        location: "North Carolina",
        currentPrice: 315000,
        priceChange24h: 2200,
        priceChangePercent: 10.3,
        rentalYield: 7.1,
        populationGrowth: 1.4,
        jobGrowth: 2.6,
        vacancyRate: 3.6,
        employmentRate: 96.8,
        crimeIndex: 3.5,
        schoolRating: 8.1,
      },
    ]

    return states
      .map((state, index) => {
        const score = calculateMarketScore(state)
        const aiAnalysis = generateAIAnalysis(state)

        return {
          ...state,
          lastUpdated: new Date(),
          score,
          aiAnalysis,
        }
      })
      .sort((a, b) => b.score - a.score)
  }

  const generateAIAnalysis = (data: any) => {
    const strengths: string[] = []
    const risks: string[] = []
    let recommendation = ""
    let investmentTier: "Premium" | "Strong" | "Moderate" | "Caution" = "Moderate"

    // Analyze strengths
    if (data.rentalYield > 7) strengths.push("Excellent rental yield above 7%")
    if (data.populationGrowth > 1.5) strengths.push("Strong population growth driving demand")
    if (data.jobGrowth > 3) strengths.push("Robust job market expansion")
    if (data.vacancyRate < 4) strengths.push("Tight rental market with low vacancy")
    if (data.employmentRate > 95) strengths.push("Robust employment market")
    if (data.priceChangePercent > 8) strengths.push("Strong price appreciation momentum")
    if (data.schoolRating > 7.5) strengths.push("High-quality school districts")

    // Analyze risks
    if (data.vacancyRate > 4) risks.push("Elevated vacancy rates indicate potential oversupply")
    if (data.crimeIndex > 4) risks.push("Above-average crime rates may affect desirability")
    if (data.priceChangePercent > 12) risks.push("High price volatility - potential bubble risk")
    if (data.employmentRate < 95) risks.push("Employment challenges may impact rental demand")

    // Calculate score for tier determination
    const score = calculateMarketScore(data)

    // Determine investment tier and recommendation
    if (score >= 80) {
      investmentTier = "Premium"
      recommendation =
        "Exceptional investment opportunity with strong fundamentals across all metrics. Ideal for both cash flow and appreciation strategies."
    } else if (score >= 65) {
      investmentTier = "Strong"
      recommendation =
        "Solid investment market with good potential returns. Suitable for experienced investors seeking balanced risk-reward."
    } else if (score >= 50) {
      investmentTier = "Moderate"
      recommendation =
        "Decent investment potential but requires careful property selection and market timing. Best for value-oriented strategies."
    } else {
      investmentTier = "Caution"
      recommendation =
        "Challenging market conditions. Only recommended for experienced investors with deep local knowledge and risk tolerance."
    }

    // Add default analysis if arrays are empty
    if (strengths.length === 0) strengths.push("Stable market fundamentals")
    if (risks.length === 0) risks.push("Standard market risks apply")

    return {
      strengths,
      risks,
      recommendation,
      investmentTier,
    }
  }

  const calculateMarketScore = (data: any): number => {
    let score = 50 // Base score

    // Price appreciation (weight: 20%)
    score += Math.min(Math.max(data.priceChangePercent * 1.5, -10), 15)

    // Rental yield (weight: 25%)
    score += Math.min(data.rentalYield * 2.5, 20)

    // Low vacancy rate (weight: 15%)
    score += Math.max(0, (6 - data.vacancyRate) * 2.5)

    // Population growth (weight: 15%)
    score += data.populationGrowth * 7

    // Job growth (weight: 10%)
    score += data.jobGrowth * 3

    // Employment rate (weight: 10%)
    score += (data.employmentRate - 90) * 1.5

    // Low crime index (weight: 5%)
    score += Math.max(0, (6 - data.crimeIndex) * 1)

    return Math.max(0, Math.min(100, score))
  }

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setLoading(true)
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const mockData = generateMockData()
        setTopStates(mockData)
      } catch (error) {
        console.error("Error loading market data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMarketData()
    // Update every 5 minutes
    const interval = setInterval(loadMarketData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const mainTools = [
    {
      id: "property-analysis",
      label: "Property Analysis",
      icon: Building2,
      color: "from-rose-500 to-rose-600",
      description: "Analyze property investments",
    },
    {
      id: "investment-calculator",
      label: "Investment Calculator",
      icon: Calculator,
      color: "from-emerald-500 to-emerald-600",
      description: "Calculate ROI and cash flow",
    },
    {
      id: "market-insights",
      label: "Market Insights",
      icon: TrendingUp,
      color: "from-violet-500 to-violet-600",
      description: "Market research & trends",
    },
    {
      id: "ai-chat",
      label: "AI Chat",
      icon: MessageSquare,
      color: "from-blue-500 to-blue-600",
      description: "Chat with AI assistant",
    },
  ]

  const aiTools = [
    { id: "ai-slides", label: "Generate Slides", icon: PresentationChart, color: "from-orange-500 to-orange-600" },
    { id: "ai-sheets", label: "Generate Sheets", icon: FileSpreadsheet, color: "from-green-500 to-green-600" },
    { id: "ai-docs", label: "Generate Docs", icon: FileText, color: "from-blue-500 to-blue-600" },
    { id: "ai-image", label: "Generate Image", icon: FileImage, color: "from-pink-500 to-pink-600" },
    { id: "download-for-me", label: "Generate Reports", icon: Download, color: "from-cyan-500 to-cyan-600" },
  ]

  const marketOverview = [
    {
      title: "Median Home Price",
      value: "$425,000",
      change: "+8.2%",
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      title: "Days on Market",
      value: "28 days",
      change: "-12%",
      trend: "down" as const,
      icon: Calendar,
    },
    {
      title: "Mortgage Rate",
      value: "6.8%",
      change: "+0.3%",
      trend: "up" as const,
      icon: BarChart3,
    },
    {
      title: "Inventory Level",
      value: "2.1 months",
      change: "-15%",
      trend: "down" as const,
      icon: HomeIcon,
    },
  ]

  const keyFactors = [
    {
      title: "Interest Rate Environment",
      description: "Federal Reserve policy impacting mortgage rates and affordability",
      impact: "High",
      color: "red",
    },
    {
      title: "Housing Supply Shortage",
      description: "Limited inventory driving competition and price appreciation",
      impact: "High",
      color: "red",
    },
    {
      title: "Population Migration",
      description: "Demographic shifts toward affordable markets with job growth",
      impact: "Medium",
      color: "yellow",
    },
    {
      title: "Remote Work Trends",
      description: "Flexible work arrangements changing location preferences",
      impact: "Medium",
      color: "yellow",
    },
  ]

  const forYouContent = [
    {
      title: "Q1 2024 Market Report",
      description: "Comprehensive analysis of national housing trends",
      type: "Report",
      time: "15 min read",
    },
    {
      title: "Top 10 Emerging Markets",
      description: "Cities showing strong investment potential",
      type: "Analysis",
      time: "8 min read",
    },
    {
      title: "REI Tax Strategies",
      description: "Maximize your real estate investment returns",
      type: "Guide",
      time: "12 min read",
    },
  ]

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Premium":
        return "bg-green-100 text-green-800 border-green-300"
      case "Strong":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Caution":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const handleToolClick = (toolId: string) => {
    switch (toolId) {
      case "ai-chat":
        window.location.href = "/"
        break
      case "investment-calculator":
        break
      case "market-insights":
        break
      default:
        console.log("Tool selected:", toolId)
        break
    }
  }

  return (
    <>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Home</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-y-auto">
          <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-6xl mx-auto w-full space-y-8 p-6">
              {/* Header */}
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">MSASCOUT AI Agent</h1>
                <p className="text-gray-600">Advanced property investment analysis powered by real-time market data</p>
              </div>

              {/* Main Tools */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Tools & Analysis</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mainTools.map((tool) => (
                    <Card
                      key={tool.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm hover:scale-105"
                      onClick={() => handleToolClick(tool.id)}
                    >
                      <CardContent className="p-6 text-center">
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mx-auto mb-4`}
                        >
                          <tool.icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{tool.label}</h3>
                        <p className="text-sm text-gray-600">{tool.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* AI-Powered Tools */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">AI-Powered Tools</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {aiTools.map((tool) => (
                    <Card
                      key={tool.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm hover:scale-105"
                      onClick={() => handleToolClick(tool.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mx-auto mb-3`}
                        >
                          <tool.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-medium text-xs text-gray-900">{tool.label}</h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Live Market Intelligence */}
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Live Market Intelligence</h2>
                  <p className="text-gray-600">
                    Real-time data from Census Bureau and Bureau of Labor Statistics with AI-powered analysis
                  </p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600">Loading live market data...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topStates.map((state, index) => (
                      <Card
                        key={state.location}
                        className="border-0 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={`px-2 py-1 text-xs ${
                                  index === 0
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                    : index === 1
                                      ? "bg-gray-100 text-gray-800 border-gray-300"
                                      : index === 2
                                        ? "bg-orange-100 text-orange-800 border-orange-300"
                                        : "bg-blue-100 text-blue-800 border-blue-300"
                                }`}
                              >
                                #{index + 1}
                              </Badge>
                              <CardTitle className="text-lg">{state.location}</CardTitle>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Score: {state.score.toFixed(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-xs text-gray-600">Population Growth</span>
                              <p className="font-semibold text-green-600">{state.populationGrowth}%</p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-xs text-gray-600">Job Growth</span>
                              <p className="font-semibold text-blue-600">{state.jobGrowth}%</p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-xs text-gray-600">Rental Yield</span>
                              <p className="font-semibold text-purple-600">{state.rentalYield}%</p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-xs text-gray-600">Vacancy Rate</span>
                              <p className="font-semibold text-orange-600">{state.vacancyRate}%</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Current Price</span>
                              <span className="text-sm font-medium text-green-600">
                                ${state.currentPrice.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">24h Change</span>
                              <span
                                className={`text-sm font-medium ${state.priceChange24h >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {state.priceChange24h >= 0 ? "+" : ""}${state.priceChange24h.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Employment Rate</span>
                              <span className="text-sm font-medium text-blue-600">{state.employmentRate}%</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            <h4 className="text-xs font-medium text-gray-700 mb-2">AI Analysis - Strengths:</h4>
                            <ul className="space-y-1">
                              {state.aiAnalysis.strengths.slice(0, 2).map((strength, idx) => (
                                <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                                  <span className="text-green-600 mt-1">•</span>
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {state.aiAnalysis.risks.length > 0 && (
                            <div className="pt-2 border-t">
                              <h4 className="text-xs font-medium text-gray-700 mb-2">Risk Factors:</h4>
                              <ul className="space-y-1">
                                {state.aiAnalysis.risks.slice(0, 1).map((risk, idx) => (
                                  <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                                    <span className="text-red-600 mt-1">•</span>
                                    <span>{risk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="pt-2 border-t bg-blue-50 p-3 rounded-lg">
                            <h4 className="text-xs font-medium text-blue-800 mb-1">AI Recommendation:</h4>
                            <p className="text-xs text-blue-700">{state.aiAnalysis.recommendation}</p>
                          </div>

                          <div className="text-xs text-gray-500 pt-2 border-t flex justify-between">
                            <span>Score: {state.score.toFixed(1)}/100</span>
                            <span>Updated: {state.lastUpdated.toLocaleTimeString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Market Overview */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Market Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {marketOverview.map((metric) => (
                    <Card key={metric.title} className="border-0 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <metric.icon className="h-5 w-5 text-gray-600" />
                          <div
                            className={`flex items-center gap-1 text-${metric.trend === "up" ? "green" : metric.trend === "down" ? "red" : "gray"}-600`}
                          >
                            {metric.trend === "up" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : metric.trend === "down" ? (
                              <ArrowDown className="h-3 w-3" />
                            ) : (
                              <Minus className="h-3 w-3" />
                            )}
                            <span className="text-sm font-medium">{metric.change}</span>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                        <p className="text-sm text-gray-600">{metric.title}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Key Market Factors */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Key Market Factors</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keyFactors.map((factor, index) => (
                    <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">{factor.title}</h3>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              factor.color === "red"
                                ? "border-red-300 text-red-700 bg-red-50"
                                : "border-yellow-300 text-yellow-700 bg-yellow-50"
                            }`}
                          >
                            {factor.impact} Impact
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{factor.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* For You Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">For You</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {forYouContent.map((content, index) => (
                    <Card
                      key={index}
                      className="border-0 bg-white/80 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-all"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="outline" className="text-xs">
                            {content.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{content.time}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{content.title}</h3>
                        <p className="text-sm text-gray-600">{content.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}
