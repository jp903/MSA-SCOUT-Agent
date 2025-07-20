"use client"

import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import ChatInterface from "@/components/chat-interface"
import PropertyCalculator from "@/components/property-calculator"
import MarketInsights from "@/components/market-insights"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import type { ChatHistoryItem } from "@/lib/portfolio-types"
import { chatManagerDB } from "@/lib/chat-manager-db"
import { toast } from "@/hooks/use-toast"

export default function HomePage() {
  const [activeView, setActiveView] = useState<"home" | "calculator" | "insights">("home")
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      console.log("🚀 Initializing MSASCOUT...")
      await initializeDatabase()
      await loadChatHistory()
    } catch (error) {
      console.error("❌ Error initializing app:", error)
      toast({
        title: "Initialization Error",
        description: "Failed to initialize the application",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const initializeDatabase = async () => {
    try {
      console.log("🔧 Initializing database...")
      const response = await fetch("/api/init-db", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        console.log("✅ Database initialized successfully")
      } else {
        console.error("❌ Database initialization failed:", result.error)
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("❌ Error initializing database:", error)
      throw error
    }
  }

  const loadChatHistory = async () => {
    try {
      console.log("📚 Loading chat history...")
      const history = await chatManagerDB.getAllChats()
      console.log("✅ Loaded", history.length, "chats")
      setChatHistory(history)
    } catch (error) {
      console.error("❌ Error loading chat history:", error)
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      })
    }
  }

  const handleNewChat = async () => {
    try {
      console.log("🆕 Creating new chat...")
      setActiveView("home")
      toast({
        title: "New Chat",
        description: "Started a new conversation",
      })
    } catch (error) {
      console.error("❌ Error creating new chat:", error)
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      })
    }
  }

  const handleChatSelect = async (chatId: string) => {
    // Navigate to the chat page
    window.location.href = `/chat/${chatId}`
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      console.log("🗑️ Deleting chat:", chatId)
      await chatManagerDB.deleteChat(chatId)
      setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))
      console.log("✅ Chat deleted:", chatId)
      toast({
        title: "Chat Deleted",
        description: "Chat has been removed",
      })
    } catch (error) {
      console.error("❌ Error deleting chat:", error)
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      })
    }
  }

  const getPageTitle = () => {
    switch (activeView) {
      case "home":
        return "Property Investment Agent"
      case "calculator":
        return "Investment Calculator"
      case "insights":
        return "Market Research & Insights"
      default:
        return "MSASCOUT"
    }
  }

  const handleToolSelect = (toolId: string) => {
    console.log("🔧 Tool selected:", toolId)

    switch (toolId) {
      case "investment-calculator":
        setActiveView("calculator")
        break
      case "market-insights":
        setActiveView("insights")
        break
      default:
        setActiveView("home")
        break
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-lg">MS</span>
          </div>
          <p className="text-gray-600">Initializing MSASCOUT Agent...</p>
          <p className="text-sm text-gray-500 mt-2">Setting up database and loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AppSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        currentChatId={null}
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
          {activeView === "home" && (
            <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden">
              <ChatInterface onToolSelect={handleToolSelect} />
            </div>
          )}
          {activeView === "calculator" && <PropertyCalculator />}
          {activeView === "insights" && <MarketInsights />}
        </div>
      </SidebarInset>
    </>
  )
}
