"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import EnhancedChat from "@/components/enhanced-chat"
import PropertyCalculator from "@/components/property-calculator"
import MarketInsights from "@/components/market-insights"
import PropertyForm from "@/components/property-form"
import PortfolioDashboard from "@/components/portfolio-dashboard"
import type { ChatHistoryItem } from "@/lib/portfolio-types"
import { chatManagerDB } from "@/lib/chat-manager-db"

export default function HomePage() {
  const [activeView, setActiveView] = useState("chat")
  const [currentChat, setCurrentChat] = useState<ChatHistoryItem | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory()
  }, [])

  const loadChatHistory = async () => {
    try {
      setIsLoading(true)
      console.log("📚 Loading chat history...")
      const history = await chatManagerDB.getAllChats()
      console.log("✅ Chat history loaded:", history.length, "chats")
      setChatHistory(history)
    } catch (error) {
      console.error("❌ Error loading chat history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = async () => {
    try {
      console.log("🆕 Creating new chat...")

      const newChat = await chatManagerDB.createChat("New Chat")

      setCurrentChat(newChat)
      setChatHistory((prev) => [newChat, ...prev])
      setActiveView("chat")

      console.log("✅ New chat created:", newChat.id)
    } catch (error) {
      console.error("❌ Error creating new chat:", error)
    }
  }

  const handleChatSelect = async (chatId: string) => {
    try {
      console.log("🔍 Selecting chat:", chatId)

      const chat = await chatManagerDB.getChat(chatId)

      if (!chat) {
        console.warn("⚠️ Chat not found:", chatId)
        setChatHistory((prev) => prev.filter((c) => c.id !== chatId))
        return
      }

      setCurrentChat(chat)
      setActiveView("chat")
      console.log("✅ Chat selected:", chat.title)
    } catch (error) {
      console.error("❌ Error selecting chat:", error)
    }
  }

  const handleChatUpdate = async (messages: any[], title?: string) => {
    if (!currentChat) return

    try {
      console.log("💾 Updating chat:", currentChat.id, "with", messages.length, "messages")

      await chatManagerDB.updateChat(currentChat.id, messages, title)

      const updatedChat = {
        ...currentChat,
        title: title || currentChat.title,
        messages,
        updatedAt: new Date(),
      }

      setCurrentChat(updatedChat)
      setChatHistory((prev) => prev.map((c) => (c.id === updatedChat.id ? updatedChat : c)))

      console.log("✅ Chat updated successfully")
    } catch (error) {
      console.error("❌ Error updating chat:", error)
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      console.log("🗑️ Deleting chat:", chatId)

      await chatManagerDB.deleteChat(chatId)

      // Remove from history
      setChatHistory((prev) => prev.filter((c) => c.id !== chatId))

      // If this was the current chat, clear it
      if (currentChat?.id === chatId) {
        setCurrentChat(null)
      }

      console.log("✅ Chat deleted successfully")
    } catch (error) {
      console.error("❌ Error deleting chat:", error)
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
      case "property-analysis":
        setActiveView("property-form")
        break
      case "portfolio":
        setActiveView("portfolio")
        break
      default:
        console.log("🤖 AI tool selected:", toolId)
        // Handle AI tools here
        break
    }
  }

  const renderActiveView = () => {
    switch (activeView) {
      case "calculator":
        return <PropertyCalculator />
      case "insights":
        return <MarketInsights />
      case "property-form":
        return <PropertyForm />
      case "portfolio":
        return <PortfolioDashboard />
      case "chat":
      default:
        return (
          <EnhancedChat onToolSelect={handleToolSelect} currentChat={currentChat} onChatUpdate={handleChatUpdate} />
        )
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        onChatSelect={handleChatSelect}
        onDeleteChat={handleDeleteChat}
        currentChatId={currentChat?.id}
        isLoading={isLoading}
      />
      <SidebarInset>
        <div className="flex-1 h-screen overflow-hidden">{renderActiveView()}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
