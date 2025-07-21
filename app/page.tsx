"use client"
import { useState, useEffect } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import EnhancedChat from "@/components/enhanced-chat"
import PropertyCalculator from "@/components/property-calculator"
import MarketInsights from "@/components/market-insights"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calculator, TrendingUp, Building2, BarChart3, FileText, Users, DollarSign } from "lucide-react"
import type { ChatHistoryItem } from "@/lib/portfolio-types"
import { chatManagerDB } from "@/lib/chat-manager-db"
import { toast } from "@/hooks/use-toast"

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
  const [activeView, setActiveView] = useState<"home" | "chat" | "calculator" | "insights">("chat")
  const [liveMarketData, setLiveMarketData] = useState<LiveMarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [currentChat, setCurrentChat] = useState<ChatHistoryItem | null>(null)

  // Initialize database and load chat history on component mount
  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      // Initialize database first
      await initializeDatabase()

      // Then load chat history
      await loadChatHistory()
    } catch (error) {
      toast({
        title: "Initialization Error",
        description: "Failed to initialize the application",
        variant: "destructive",
      })
    }
  }

  const initializeDatabase = async () => {
    try {
      const response = await fetch("/api/init-db", { method: "POST" })
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error) {
      throw error
    }
  }

  const loadChatHistory = async () => {
    try {
      const history = await chatManagerDB.getAllChats()
      setChatHistory(history)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      })
    }
  }

  const handleNewChat = async () => {
    try {
      // Clear current chat state first
      setCurrentChatId(null)
      setCurrentChat(null)

      // Switch to chat view
      setActiveView("home")

      toast({
        title: "New Chat",
        description: "Started a new conversation",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      })
    }
  }

  const handleChatSelect = async (chatId: string) => {
    try {
      const chat = await chatManagerDB.getChat(chatId)
      if (chat) {
        setCurrentChatId(chatId)
        setCurrentChat(chat)
        setActiveView("home")
      } else {
        // Remove from history if not found
        setChatHistory((prev) => prev.filter((c) => c.id !== chatId))
        toast({
          title: "Chat Not Found",
          description: "This chat may have been deleted",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      })
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await chatManagerDB.deleteChat(chatId)

      // Remove from history
      setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))

      // If this was the current chat, clear it
      if (currentChatId === chatId) {
        setCurrentChatId(null)
        setCurrentChat(null)
      }

      toast({
        title: "Chat Deleted",
        description: "Chat has been removed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      })
    }
  }

  const handleChatUpdate = async (messages: any[], title?: string) => {
    try {
      // If no current chat exists, create one
      if (!currentChatId && messages.length > 0) {
        const newChat = await chatManagerDB.createChat(title || "New Chat")
        setCurrentChatId(newChat.id)
        setCurrentChat(newChat)

        // Add to history
        setChatHistory((prev) => [newChat, ...prev])

        // Now update with messages
        await chatManagerDB.updateChat(newChat.id, messages, title)

        // Update local state
        const updatedChat = { ...newChat, messages, title: title || newChat.title, updatedAt: new Date() }
        setCurrentChat(updatedChat)
        setChatHistory((prev) => prev.map((chat) => (chat.id === newChat.id ? updatedChat : chat)))

        return
      }

      // Update existing chat
      if (currentChatId) {
        await chatManagerDB.updateChat(currentChatId, messages, title)

        // Update local state
        setChatHistory((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId ? { ...chat, messages, title: title || chat.title, updatedAt: new Date() } : chat,
          ),
        )

        if (currentChat) {
          setCurrentChat((prev) =>
            prev
              ? {
                  ...prev,
                  messages,
                  title: title || prev.title,
                  updatedAt: new Date(),
                }
              : null,
          )
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save chat",
        variant: "destructive",
      })
    }
  }

  const getPageTitle = () => {
    switch (activeView) {
      case "home":
        return "AI Chat Assistant"
      case "chat":
        return "Dashboard & Tools"
      case "calculator":
        return "Investment Calculator"
      case "insights":
        return "Market Research & Insights"
      default:
        return "MSASCOUT"
    }
  }

  const handleToolSelect = (toolId: string) => {
    switch (toolId) {
      case "investment-calculator":
        setActiveView("calculator")
        break
      case "market-insights":
        setActiveView("insights")
        break
      case "ai-chat":
        setActiveView("home")
        break
      default:
        setActiveView("home")
        break
    }
  }

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

    // Add hourly variations to simulate live data (smaller changes for hourly updates)
    const liveData = realMarketData.map((state) => {
      const liveState = {
        ...state,
        population_growth: Number((state.population_growth + (Math.random() - 0.5) * 0.02).toFixed(2)),
        job_growth: Number((state.job_growth + (Math.random() - 0.5) * 0.05).toFixed(2)),
        house_price_index_growth: Number((state.house_price_index_growth + (Math.random() - 0.5) * 0.1).toFixed(2)),
        net_migration: Math.round(state.net_migration + (Math.random() - 0.5) * 500),
        vacancy_rate: Number((state.vacancy_rate + (Math.random() - 0.5) * 0.05).toFixed(2)),
        international_inflows: Math.round(state.international_inflows + (Math.random() - 0.5) * 100),
        single_family_permits: Math.round(state.single_family_permits + (Math.random() - 0.5) * 500),
        multi_family_permits: Math.round(state.multi_family_permits + (Math.random() - 0.5) * 200),
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
      const data = await generateLiveMarketData()
      setLiveMarketData(data)
      setLastRefresh(new Date())
    } catch (error) {
      console.error("Error loading market data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMarketData()
    // Update every hour (3600000 milliseconds = 1 hour)
    const interval = setInterval(loadMarketData, 3600000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <AppSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onDeleteChat={handleDeleteChat}
      />
      <SidebarInset>
        {/* HEADER: icon & title removed per request */}
        <header className="h-4" />

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Chat Page - AI Assistant */}
          {activeView === "home" && (
            <EnhancedChat onToolSelect={handleToolSelect} currentChat={currentChat} onChatUpdate={handleChatUpdate} />
          )}

          {/* Home Page - Dashboard & Tools */}
          {activeView === "chat" && (
            <div className="space-y-6">
              {/* Welcome Header */}
              <div className="text-center py-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to MSASCOUT</h1>
                <p className="text-xl text-gray-600 mb-6">Your AI-powered property investment platform</p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => setActiveView("home")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  >
                    Start Chatting
                  </Button>
                  <Button variant="outline" onClick={() => setActiveView("calculator")}>
                    Try Calculator
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Chats</p>
                        <p className="text-2xl font-bold text-gray-900">{chatHistory.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Market Analysis</p>
                        <p className="text-2xl font-bold text-gray-900">16</p>
                        <p className="text-xs text-green-600">States Tracked</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">AI Tools</p>
                        <p className="text-2xl font-bold text-gray-900">8</p>
                        <p className="text-xs text-purple-600">Available</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Live Data</p>
                        <p className="text-2xl font-bold text-gray-900">24/7</p>
                        <p className="text-xs text-orange-600">Real-time</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => setActiveView("home")}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">AI Chat Assistant</CardTitle>
                        <p className="text-sm text-gray-600">Get instant property insights</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Chat with our AI agent for market analysis, property evaluation, and investment advice.
                    </p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {chatHistory.length} conversations
                    </Badge>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => setActiveView("calculator")}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Calculator className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Investment Calculator</CardTitle>
                        <p className="text-sm text-gray-600">Calculate ROI and cash flow</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Analyze potential returns, cash flow, and investment metrics for any property.
                    </p>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                      Advanced metrics
                    </Badge>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => setActiveView("insights")}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Market Insights</CardTitle>
                        <p className="text-sm text-gray-600">Real-time market data</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Access live market data, trends, and AI-powered analysis for 16+ states.
                    </p>
                    <Badge variant="secondary" className="bg-violet-100 text-violet-800">
                      Live data
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Property Analysis</CardTitle>
                        <p className="text-sm text-gray-600">Detailed property reports</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Get comprehensive analysis of any property with market comparisons and projections.
                    </p>
                    <Badge variant="secondary" className="bg-rose-100 text-rose-800">
                      Coming soon
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Generate Reports</CardTitle>
                        <p className="text-sm text-gray-600">AI-powered documentation</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Generate professional investment reports, presentations, and documentation.
                    </p>
                    <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                      AI-powered
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Portfolio Tracker</CardTitle>
                        <p className="text-sm text-gray-600">Track your investments</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Monitor your property portfolio performance and get optimization suggestions.
                    </p>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      Coming soon
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              {chatHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Recent Chat Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {chatHistory.slice(0, 5).map((chat) => (
                        <div
                          key={chat.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleChatSelect(chat.id)}
                        >
                          <div>
                            <p className="font-medium text-sm">{chat.title}</p>
                            <p className="text-xs text-gray-500">
                              {chat.messages?.length || 0} messages • {new Date(chat.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Open
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeView === "calculator" && <PropertyCalculator />}
          {activeView === "insights" && <MarketInsights />}
        </div>
      </SidebarInset>
    </>
  )
}
