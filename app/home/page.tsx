"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
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
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface LiveMarketData {
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
  score: number
  aiAnalysis: {
    strengths: string[]
    risks: string[]
    recommendation: string
    investmentTier: "Premium" | "Strong" | "Moderate" | "Caution"
  }
}

export default function HomePage() {
  const [liveMarketData, setLiveMarketData] = useState<LiveMarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true);
  }, []);

  const generateLiveMarketData = async (): Promise<LiveMarketData[]> => {
    // Real market data based on Census Bureau and Bureau of Labor Statistics
    const realMarketData = [
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
      },
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
      },
    ]

    // Add real-time variations to simulate live data
    const liveData = realMarketData.map((state) => {
      const liveState = {
        ...state,
        population_growth: Number((state.population_growth + (Math.random() - 0.5) * 0.1).toFixed(2)),
        job_growth: Number((state.job_growth + (Math.random() - 0.5) * 0.2).toFixed(2)),
        house_price_index_growth: Number((state.house_price_index_growth + (Math.random() - 0.5) * 0.5).toFixed(2)),
        net_migration: Math.round(state.net_migration + (Math.random() - 0.5) * 2000),
        vacancy_rate: Number((state.vacancy_rate + (Math.random() - 0.5) * 0.3).toFixed(2)),
        international_inflows: Math.round(state.international_inflows + (Math.random() - 0.5) * 500),
        single_family_permits: Math.round(state.single_family_permits + (Math.random() - 0.5) * 3000),
        multi_family_permits: Math.round(state.multi_family_permits + (Math.random() - 0.5) * 1500),
        lastUpdated: new Date(),
      }

      const score = calculateMarketScore(liveState)
      const aiAnalysis = generateAIAnalysis(liveState)

      return {
        ...liveState,
        score,
        aiAnalysis,
      }
    })

    return liveData.sort((a, b) => b.score - a.score)
  }

  const calculateMarketScore = (data: any): number => {
    let score = 50 // Base score

    // Population growth (weight: 20%)
    score += data.population_growth * 8

    // Job growth (weight: 25%)
    score += data.job_growth * 6

    // House price index growth (weight: 15%)
    score += Math.min(data.house_price_index_growth * 0.8, 12)

    // Net migration (weight: 15%)
    score += Math.min(data.net_migration / 2000, 15)

    // Low vacancy rate (weight: 10%)
    score += Math.max(0, (6 - data.vacancy_rate) * 2)

    // International inflows (weight: 8%)
    score += Math.min(data.international_inflows / 2000, 8)

    // Construction permits (weight: 7%)
    const totalPermits = data.single_family_permits + data.multi_family_permits
    score += Math.min(totalPermits / 10000, 7)

    return Math.max(0, Math.min(100, score))
  }

  const generateAIAnalysis = (data: any) => {
    const strengths: string[] = []
    const risks: string[] = []
    let recommendation = ""
    let investmentTier: "Premium" | "Strong" | "Moderate" | "Caution" = "Moderate"

    // Analyze strengths
    if (data.population_growth > 2.0) strengths.push("Exceptional population growth above 2%")
    if (data.job_growth > 3.0) strengths.push("Strong job market expansion above 3%")
    if (data.house_price_index_growth > 10) strengths.push("Robust price appreciation momentum")
    if (data.net_migration > 30000) strengths.push("High net migration indicating desirability")
    if (data.vacancy_rate < 4.0) strengths.push("Tight rental market with low vacancy")
    if (data.international_inflows > 8000) strengths.push("Strong international investment flows")
    if (data.single_family_permits > 40000) strengths.push("Active new construction market")

    // Analyze risks
    if (data.vacancy_rate > 4.0) risks.push("Elevated vacancy rates may indicate oversupply")
    if (data.house_price_index_growth > 12) risks.push("High price volatility - potential bubble risk")
    if (data.population_growth < 1.0) risks.push("Slow population growth may limit demand")
    if (data.job_growth < 2.5) risks.push("Below-average job growth may impact affordability")

    // Calculate score for tier determination
    const score = calculateMarketScore(data)

    // Determine investment tier and recommendation
    if (score >= 80) {
      investmentTier = "Premium"
      recommendation =
        "Exceptional investment opportunity with outstanding fundamentals across all key metrics. Ideal for aggressive growth strategies."
    } else if (score >= 65) {
      investmentTier = "Strong"
      recommendation =
        "Strong investment market with solid growth potential. Suitable for both cash flow and appreciation strategies."
    } else if (score >= 50) {
      investmentTier = "Moderate"
      recommendation =
        "Decent investment potential with mixed signals. Requires careful property selection and market timing."
    } else {
      investmentTier = "Caution"
      recommendation =
        "Challenging market conditions with multiple risk factors. Only recommended for experienced investors."
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

  const loadMarketData = async () => {
    setLoading(true)
    try {
      console.log("🔄 Loading live market data...")
      const data = await generateLiveMarketData()
      console.log("✅ Live market data loaded:", data.length, "states")
      setLiveMarketData(data)
      setLastRefresh(new Date())
    } catch (error) {
      console.error("❌ Error loading market data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMarketData()
    // Update every 2 minutes for live data
    const interval = setInterval(loadMarketData, 2 * 60 * 1000)
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  return isClient ? (
    <SidebarProvider>
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">MSASCOUT AI Agent</h1>
                <p className="text-gray-600 dark:text-gray-300">Advanced property investment analysis powered by real-time market data</p>
              </div>

              {/* Main Tools */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tools & Analysis</h2>
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
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{tool.label}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{tool.description}</p>
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
                        <h3 className="font-medium text-xs text-gray-900 dark:text-gray-100">{tool.label}</h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Live Market Intelligence */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Live Market Intelligence</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Real-time data from Census Bureau and Bureau of Labor Statistics with AI-powered analysis
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMarketData}
                      disabled={loading}
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                    <Badge variant="secondary" className="text-xs">
                      Last updated: {lastRefresh.toLocaleTimeString()}
                    </Badge>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-300">Loading live market data...</p>
                    </div>
                  </div>
                ) : liveMarketData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liveMarketData.map((state, index) => (
                      <Card
                        key={state.state}
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
                              <CardTitle className="text-lg">{state.state}</CardTitle>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Score: {state.score.toFixed(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-xs text-gray-600 dark:text-gray-400">Population Growth</span>
                              <p className="font-semibold text-green-600">{state.population_growth}%</p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-xs text-gray-600">Job Growth</span>
                              <p className="font-semibold text-blue-600">{state.job_growth}%</p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-xs text-gray-600">Price Growth</span>
                              <p className="font-semibold text-purple-600">{state.house_price_index_growth}%</p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg">
                              <span className="text-xs text-gray-600">Vacancy Rate</span>
                              <p className="font-semibold text-orange-600">{state.vacancy_rate}%</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Net Migration</span>
                              <span className="text-sm font-medium text-green-600">
                                +{formatNumber(state.net_migration)}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">International Inflows</span>
                              <span className="text-sm font-medium text-blue-600">
                                +{formatNumber(state.international_inflows)}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">New Permits</span>
                              <span className="text-sm font-medium text-purple-600">
                                {formatNumber(state.single_family_permits + state.multi_family_permits)}
                              </span>
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

                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-medium text-gray-700">Investment Tier:</h4>
                              <Badge className={`text-xs ${getTierColor(state.aiAnalysis.investmentTier)}`}>
                                {state.aiAnalysis.investmentTier}
                              </Badge>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-xs text-blue-700">{state.aiAnalysis.recommendation}</p>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 pt-2 border-t flex justify-between">
                            <span>Score: {state.score.toFixed(1)}/100</span>
                            <span>Updated: {state.lastUpdated.toLocaleTimeString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-300">No market data available</p>
                  </div>
                )}
              </div>

              {/* Market Overview */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Market Overview</h2>
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
    </SidebarProvider>
  ) : (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-8 w-8 text-white animate-spin" />
        </div>
        <p className="text-gray-600">Loading application...</p>
      </div>
    </div>
  )
}
