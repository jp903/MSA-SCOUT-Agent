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

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory()
  }, [])

  const loadChatHistory = async () => {
    try {
      console.log("📚 Loading chat history...")
      setIsLoading(true)
      const history = await chatManagerDB.getAllChats()
      console.log("✅ Loaded", history.length, "chats")
      setChatHistory(history)

      // If we have chats but no current chat selected, select the most recent one
      if (history.length > 0 && !currentChatId) {
        const mostRecent = history[0]
        setCurrentChatId(mostRecent.id)
        setCurrentChat(mostRecent)
        console.log("📋 Auto-selected most recent chat:", mostRecent.id)
      }
    } catch (error) {
      console.error("❌ Error loading chat history:", error)
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = async () => {
    try {
      console.log("🆕 Creating new chat...")
      const newChat = await chatManagerDB.createChat("New Chat")
      console.log("✅ New chat created:", newChat.id)

      // Add to history and set as current
      setChatHistory((prev) => [newChat, ...prev])
      setCurrentChatId(newChat.id)
      setCurrentChat(newChat)

      // Switch to home view if not already there
      if (activeView !== "home") {
        setActiveView("home")
      }

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
        setActiveView("home") // Switch to chat view
        console.log("✅ Chat selected:", chatId)
      } else {
        console.warn("⚠️ Chat not found:", chatId)
        toast({
          title: "Error",
          description: "Chat not found",
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
    if (!currentChatId) {
      console.warn("⚠️ No current chat ID for update")
      return
    }

    try {
      console.log("💾 Updating chat:", currentChatId, "with", messages.length, "messages")
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

      console.log("✅ Chat updated successfully")
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
        return "AI Assistant Chat"
      case "calculator":
        return "Investment Calculator"
      case "insights":
        return "Market Insights"
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
        // For other tools, stay in chat and maybe send a message
        setActiveView("home")
        break
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-sm">MS</span>
          </div>
          <p className="text-gray-600">Loading MSASCOUT...</p>
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
