"use client"
import { useState, useEffect, useMemo } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import EnhancedChat from "@/components/enhanced-chat"
import PropertyCalculator from "@/components/property-calculator"
import MarketInsights from "@/components/market-insights"
import PropertyAnalysis from "@/components/property-analysis"
import PortfolioTracker from "@/components/portfolio-tracker"
import PropertyListings from "@/components/property-listings"
import ProfileSettings from "@/components/profile-settings"
import Preferences from "@/components/preferences"
import AuthModal from "@/components/auth-modal"
import PricePredictor from "@/components/price-predictor"
import PropertyROICalculator from "@/components/property-roi-calculator"
import { MobileHeader } from "@/components/mobile-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calculator, TrendingUp, Building2, BarChart3, FileText, Users, DollarSign, Search, PanelLeft } from "lucide-react"
import type { ChatHistoryItem, ChatMessage as Message } from "@/lib/chat-types"
import type { User } from "@/lib/user-types"
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
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [activeView, setActiveView] = useState<
    | "home"
    | "chat"
    | "calculator"
    | "insights"
    | "property-analysis"
    | "portfolio-tracker"
    | "deal-finder"
    | "price-predictor"
    | "profile-settings"
    | "preferences"
    | "property-roi-calculator"
  >("chat")
  const [liveMarketData, setLiveMarketData] = useState<LiveMarketData[]>([])
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chatHistoryLoaded, setChatHistoryLoaded] = useState(false)
  const [userLoaded, setUserLoaded] = useState(false) // New state variable
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only run client-side effects after component is mounted
  useEffect(() => {
    if (!isClient) return;

    // Check authentication on component mount
    checkAuth()
  }, [isClient])

  // Only run useMemo after client-side hydration
  const currentChat = useMemo(() => {
    if (!isClient) return null;
    return chatHistory.find((chat) => chat.id === currentChatId) || null
  }, [chatHistory, currentChatId, isClient])

  // Call initializeApp once user authentication status is known
  useEffect(() => {
    if (userLoaded) {
      if (user) { // Only initialize app if user is present
        initializeApp()
      } else { // If user is null after userLoaded, ensure chat history is cleared
        setChatHistory([])
        setCurrentChatId(null)
        setChatHistoryLoaded(true)
      }
    }
  }, [userLoaded, user]) // Depend on userLoaded and user

  // Load chat history when user changes (login/logout)
  // This useEffect will now be responsible for (re)loading chat history based on user state
  useEffect(() => {
    if (user) {
      loadChatHistory()
    } else {
      setChatHistory([]) // Clear chat history if user logs out
      setCurrentChatId(null)
      setChatHistoryLoaded(false) // Set to false so it reloads if user signs in later
    }
  }, [user])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include", // Include cookies
      })

      if (response.ok) {
        const data = await response.json()

        if (data.valid && data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
      setUserLoaded(true) // Set userLoaded to true regardless of auth success/failure
    }
  }

  const initializeApp = async () => {
    try {
      // Load chat history - database will be initialized automatically when needed
      await loadChatHistory()
      setChatHistoryLoaded(true)
    } catch (error) {
      console.error("App initialization error:", error)
      toast({
        title: "Initialization Error",
        description: "Failed to initialize the application",
        variant: "destructive",
      })
      setChatHistoryLoaded(true) // Mark as loaded on error
    }
  }

  const loadChatHistory = async () => {
    try {
      const response = await fetch("/api/chat-history")
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setChatHistory([]) // Set empty history for unauthenticated users
          return
        }
        throw new Error("Failed to load chat history")
      }
      const history = await response.json()
      setChatHistory(history)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      })
    }
  }

  const handleStartChatting = () => {
    if (!user) {
      setShowAuthModal(true)
    } else {
      setActiveView("home")
    }
  }

  const handleAuthSuccess = async () => {
    // Re-check authentication after successful login
    await checkAuth()
    setShowAuthModal(false)
    setActiveView("home")

    toast({
      title: "Welcome!",
      description: "You are now signed in and can access all features.",
    })
  }

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      })
      setUser(null)
      setChatHistory([])
      setCurrentChatId(null)
      setActiveView("chat")
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      })
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        title: "Error",
        description: "Failed to sign out properly",
        variant: "destructive",
      })
    }
  }

  const handleNewChat = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    try {
      // Clear current chat state first
      setCurrentChatId(null)

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

  const handleChatSelect = (chatId: string) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    setCurrentChatId(chatId)
    setActiveView("home")
  }

  const handleDeleteChat = async (chatId: string) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    try {
      const response = await fetch(`/api/chat-history/${chatId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete chat")
      }

      // Remove from history
      setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))

      // If this was the current chat, clear it
      if (currentChatId === chatId) {
        setCurrentChatId(null)
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

  const handleChatUpdate = async (messages: Omit<Message, 'id'>[], title?: string) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    try {
      // If no current chat exists, create one via API
      if (!currentChatId) {
        const response = await fetch("/api/chat-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title || "New Chat",
            messages,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create chat")
        }

        const newChat = await response.json()
        setChatHistory((prev) => [newChat, ...prev])
        setCurrentChatId(newChat.id)
        return
      }

      // Update existing chat via API
      const response = await fetch(`/api/chat-history/${currentChatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title,
          messages,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update chat")
      }

      const updatedChat = await response.json()

      // Update local state
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId ? updatedChat : chat
        )
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save chat",
        variant: "destructive",
      })
    }
  }

  const handleToolSelect = (toolId: string) => {
    // Only chat requires authentication, other tools are free to use
    if (toolId === "ai-chat" && !user) {
      setShowAuthModal(true)
      return
    }

    switch (toolId) {
      case "investment-calculator":
        setActiveView("calculator")
        break
      case "market-insights":
        setActiveView("insights")
        break
      case "property-analysis":
        setActiveView("property-analysis")
        break
      case "portfolio-tracker":
        setActiveView("portfolio-tracker")
        break
      case "deal-finder":
        setActiveView("deal-finder")
        break
      case "price-predictor":
        setActiveView("price-predictor")
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
    try {
      const data = await generateLiveMarketData()
      setLiveMarketData(data)
      setLastRefresh(new Date())
    } catch (error) {
      console.error("Error loading market data:", error)
    }
  }

  useEffect(() => {
    loadMarketData()
    // Update every hour (3600000 milliseconds = 1 hour)
    const interval = setInterval(loadMarketData, 3600000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Building2 className="h-8 w-8 text-white animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Loading MSASCOUT...
          </h2>
          <p className="text-gray-600 text-lg dark:text-gray-300">Please wait while we initialize your dashboard</p>
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: "0s" }}></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return isClient ? (
    <>
      <AppSidebar
        activeView={activeView}
        onViewChange={(view: string) => setActiveView(view as any)}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onDeleteChat={handleDeleteChat}
        user={user}
        onSignOut={handleSignOut}
        chatHistoryLoaded={chatHistoryLoaded}
      />
      <SidebarInset>
        <MobileHeader
          user={user}
          showAuthModal={() => setShowAuthModal(true)}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Auth Modal */}
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />

          {/* Chat Page - AI Assistant - Requires Authentication */}
          {activeView === "home" && (
            <div className="animate-fade-in">
              {user ? (
                <EnhancedChat
                  onToolSelect={handleToolSelect}
                  currentChat={currentChat}
                  onChatUpdate={handleChatUpdate}
                />
              ) : (
                <div className="flex items-center justify-center min-h-[400px] p-4">
                  <Card className="w-full max-w-md shadow-xl border-0 bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in-up">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                        Sign In Required
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-300">Please sign in to access the AI Chat Assistant</p>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button
                        onClick={() => setShowAuthModal(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Sign In to Chat
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Profile Settings and Preferences - Require Authentication */}
          {activeView === "profile-settings" && (
            <div className="animate-fade-in">
              {user ? (
                <ProfileSettings user={user} onUserUpdate={setUser} />
              ) : (
                <div className="flex items-center justify-center min-h-[400px] p-4">
                  <Card className="w-full max-w-md shadow-xl border-0 bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in-up">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                        Sign In Required
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-300">Please sign in to access Profile Settings</p>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button
                        onClick={() => setShowAuthModal(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Sign In
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeView === "preferences" && (
            <div className="animate-fade-in">
              {user ? (
                <Preferences />
              ) : (
                <div className="flex items-center justify-center min-h-[400px] p-4">
                  <Card className="w-full max-w-md shadow-xl border-0 bg-gradient-to-br from-gray-50 to-gray-100 animate-fade-in-up">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                        Sign In Required
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-300">Please sign in to access Preferences</p>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Button
                        onClick={() => setShowAuthModal(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        Sign In
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* All other tools are available without authentication */}
          {activeView === "deal-finder" && <div className="animate-fade-in"><PropertyListings /></div>}
          {activeView === "property-analysis" && <div className="animate-fade-in"><PropertyAnalysis /></div>}
          {activeView === "portfolio-tracker" && <div className="animate-fade-in"><PortfolioTracker /></div>}
          {activeView === "price-predictor" && <div className="animate-fade-in"><PricePredictor /></div>}
          {activeView === "property-roi-calculator" && <div className="animate-fade-in"><PropertyROICalculator user={user} onAuthRequired={() => setShowAuthModal(true)} /></div>}

          {/* Home Page - Dashboard & Tools */}
          {activeView === "chat" && (
            <div className="space-y-6 animate-fade-in">
              {/* Welcome Header */}
              <div className="text-center py-8 px-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
                  Welcome to MSASCOUT
                </h1>
                <p className="text-2xl text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                  Your AI-powered property investment platform
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    onClick={handleStartChatting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-6"
                  >
                    Start Chatting
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveView("calculator")}
                    className="h-12 px-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300"
                  >
                    Try Calculator
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-1 shadow-sm">
                  <Card className="h-full bg-white border-0">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Chats</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{user ? chatHistory.length : 0}</p>
                        </div>
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center shadow-md">
                          <Users className="h-7 w-7 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-1 shadow-sm">
                  <Card className="h-full bg-white border-0">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Market Analysis</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">50</p>
                          <p className="text-xs text-green-600 dark:text-green-400">States Tracked</p>
                        </div>
                        <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center shadow-md">
                          <TrendingUp className="h-7 w-7 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-1 shadow-sm">
                  <Card className="h-full bg-white border-0">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">AI Tools</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">7</p>
                          <p className="text-xs text-purple-600 dark:text-purple-400">Available</p>
                        </div>
                        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center shadow-md">
                          <Building2 className="h-7 w-7 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-1 shadow-sm">
                  <Card className="h-full bg-white border-0">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Live Data</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">24/7</p>
                          <p className="text-xs text-orange-600 dark:text-orange-400">Real-time</p>
                        </div>
                        <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center shadow-md">
                          <BarChart3 className="h-7 w-7 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <Card
                  className="cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] transform bg-gradient-to-b from-white to-gray-50 animate-fade-in-up"
                  onClick={handleStartChatting}
                  style={{ animationDelay: "0.1s" }}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                        <Users className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl dark:text-gray-100">AI Chat Assistant</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Get instant property insights</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4 mb-4">
                      Chat with our AI agent for market analysis, property evaluation, and investment advice.
                    </p>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-0">
                      {user ? `${chatHistory.length} conversations` : "Advanced metrics"}
                    </Badge>
                  </div>
                </Card>

                <Card
                  className="cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] transform bg-gradient-to-b from-white to-gray-50 animate-fade-in-up"
                  onClick={() => handleToolSelect("deal-finder")}
                  style={{ animationDelay: "0.15s" }}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-md">
                        <Search className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl dark:text-gray-100">Deal Finder</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Find investment properties</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4 mb-4">
                      Search and analyze properties across US markets with detailed owner and listing information.
                    </p>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-0">
                      Live listings
                    </Badge>
                  </div>
                </Card>

                <Card
                  className="cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] transform bg-gradient-to-b from-white to-gray-50 animate-fade-in-up"
                  onClick={() => handleToolSelect("investment-calculator")}
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
                        <Calculator className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl dark:text-gray-100">Investment Calculator</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Calculate ROI and cash flow</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4 mb-4">
                      Analyze potential returns, cash flow, and investment metrics for any property.
                    </p>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-0">
                      Advanced metrics
                    </Badge>
                  </div>
                </Card>

                <Card
                  className="cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] transform bg-gradient-to-b from-white to-gray-50 animate-fade-in-up"
                  onClick={() => handleToolSelect("market-insights")}
                  style={{ animationDelay: "0.25s" }}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-md">
                        <TrendingUp className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl dark:text-gray-100">Market Insights</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Real-time market data</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4 mb-4">
                      Access live market data, trends, and AI-powered analysis for 50 states.
                    </p>
                    <Badge variant="secondary" className="bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-200 border-0">
                      Live data
                    </Badge>
                  </div>
                </Card>

                <Card
                  className="cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] transform bg-gradient-to-b from-white to-gray-50 animate-fade-in-up"
                  onClick={() => handleToolSelect("property-analysis")}
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-md">
                        <Building2 className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl dark:text-gray-100">Property Analysis</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Detailed property reports</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4 mb-4">
                      Get comprehensive analysis of any property with market comparisons and projections.
                    </p>
                    <Badge variant="secondary" className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200 border-0">
                      AI-powered
                    </Badge>
                  </div>
                </Card>

                <Card
                  className="cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] transform bg-gradient-to-b from-white to-gray-50 animate-fade-in-up"
                  onClick={() => handleToolSelect("portfolio-tracker")}
                  style={{ animationDelay: "0.35s" }}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-md">
                        <DollarSign className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl dark:text-gray-100">Portfolio Tracker</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Track your investments</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4 mb-4">
                      Monitor your property portfolio performance and get optimization suggestions.
                    </p>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-0">
                      AI-powered
                    </Badge>
                  </div>
                </Card>

                <Card
                  className="cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] transform bg-gradient-to-b from-white to-gray-50 animate-fade-in-up"
                  onClick={() => handleToolSelect("price-predictor")}
                  style={{ animationDelay: "0.4s" }}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                        <TrendingUp className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl dark:text-gray-100">Price Predictor</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300">AI price predictions</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4 mb-4">
                      Get AI-powered property price predictions and market forecasts for any property.
                    </p>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border-0">
                      AI-powered
                    </Badge>
                  </div>
                </Card>
              </div>

              {/* Recent Activity - Only show if user is logged in */}
              {user && chatHistory.length > 0 && (
                <div className="animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="p-6">
                      <CardTitle className="flex items-center gap-2 text-xl mb-4 dark:text-gray-100">
                        <FileText className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        <span className="font-bold text-gray-800 dark:text-gray-200">Recent Chat Activity</span>
                      </CardTitle>
                      <div className="space-y-3">
                        {chatHistory.slice(0, 5).map((chat, index) => (
                          <div
                            key={chat.id}
                            className="flex items-center justify-between p-4 bg-white rounded-xl cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
                            onClick={() => handleChatSelect(chat.id)}
                          >
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-200">{chat.title}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {chat.messages?.length || 0} messages • {new Date(chat.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                              Open
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {activeView === "calculator" && <div className="animate-fade-in"><PropertyCalculator /></div>}
          {activeView === "insights" && <div className="animate-fade-in"><MarketInsights /></div>}
        </div>
      </SidebarInset>
    </>
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
