"use client"

import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import EnhancedChat from "@/components/enhanced-chat"
import PropertyCalculator from "@/components/property-calculator"
import MarketInsights from "@/components/market-insights"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calculator, TrendingUp, Building2, BarChart3, FileText, Users, DollarSign } from "lucide-react"
import type { ChatHistoryItem } from "@/lib/portfolio-types"
import { chatManagerDB } from "@/lib/chat-manager-db"
import { toast } from "@/hooks/use-toast"

export default function HomePage() {
  const [activeView, setActiveView] = useState<"home" | "chat" | "calculator" | "insights">("chat")
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
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

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
