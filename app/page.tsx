"use client"

import { useState, useEffect } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import EnhancedChat from "@/components/enhanced-chat"
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
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [currentChat, setCurrentChat] = useState<ChatHistoryItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize database and load chat history on component mount
  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      console.log("🚀 Initializing MSASCOUT...")

      // Initialize database first
      await initializeDatabase()

      // Then load chat history
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

      // Clear current chat state first
      setCurrentChatId(null)
      setCurrentChat(null)

      // Switch to home view
      setActiveView("home")

      console.log("✅ New chat session started")

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
    try {
      console.log("📋 Selecting chat:", chatId)
      const chat = await chatManagerDB.getChat(chatId)
      if (chat) {
        setCurrentChatId(chatId)
        setCurrentChat(chat)
        setActiveView("home")
        console.log("✅ Chat selected:", chatId)
      } else {
        console.warn("⚠️ Chat not found:", chatId)
        // Remove from history if not found
        setChatHistory((prev) => prev.filter((c) => c.id !== chatId))
        toast({
          title: "Chat Not Found",
          description: "This chat may have been deleted",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ Error selecting chat:", error)
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      })
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      console.log("🗑️ Deleting chat:", chatId)
      await chatManagerDB.deleteChat(chatId)

      // Remove from history
      setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))

      // If this was the current chat, clear it
      if (currentChatId === chatId) {
        setCurrentChatId(null)
        setCurrentChat(null)
      }

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

  const handleChatUpdate = async (messages: any[], title?: string) => {
    try {
      console.log("💾 Updating chat with", messages.length, "messages")

      // If no current chat exists, create one
      if (!currentChatId && messages.length > 0) {
        console.log("🆕 Creating new chat for messages...")
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

        console.log("✅ New chat created and updated:", newChat.id)
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

        console.log("✅ Chat updated successfully:", currentChatId)
      }
    } catch (error) {
      console.error("❌ Error updating chat:", error)
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
          {activeView === "home" && (
            <EnhancedChat onToolSelect={handleToolSelect} currentChat={currentChat} onChatUpdate={handleChatUpdate} />
          )}
          {activeView === "calculator" && <PropertyCalculator />}
          {activeView === "insights" && <MarketInsights />}
        </div>
      </SidebarInset>
    </>
  )
}
