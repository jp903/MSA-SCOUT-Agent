"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import EnhancedChat from "@/components/enhanced-chat"
import PropertyCalculator from "@/components/property-calculator"
import MarketInsights from "@/components/market-insights"
import type { ChatHistoryItem } from "@/lib/portfolio-types"
import { chatManagerDB } from "@/lib/chat-manager-db"
import { Toaster } from "@/components/ui/toaster"
import { PortfolioDashboard } from "@/components/portfolio-dashboard"
import { PropertyForm } from "@/components/property-form"
import { ImageGallery } from "@/components/image-gallery"

export default function HomePage() {
  const [activeView, setActiveView] = useState<
    "home" | "chat" | "calculator" | "insights" | "portfolio" | "add-property" | "images"
  >("chat")
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [currentChat, setCurrentChat] = useState<ChatHistoryItem | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)

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
      console.error("Initialization Error:", error)
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
      console.error("Error loading chat history:", error)
    }
  }

  const handleNewChat = async () => {
    try {
      // Clear current chat state first
      setCurrentChatId(null)
      setCurrentChat(null)
      // Switch to chat view
      setActiveView("home")
      console.log("Started a new conversation")
    } catch (error) {
      console.error("Error creating new chat:", error)
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
        console.log("This chat may have been deleted")
      }
    } catch (error) {
      console.error("Error loading chat:", error)
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
      console.log("Chat has been removed")
    } catch (error) {
      console.error("Error deleting chat:", error)
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
      console.error("Error saving chat:", error)
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
      case "portfolio":
        return "Portfolio Dashboard"
      case "add-property":
        return "Add Property"
      case "images":
        return "Image Gallery"
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
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          selectedPropertyId={selectedPropertyId}
          onPropertySelect={setSelectedPropertyId}
          chatHistory={chatHistory}
          currentChatId={currentChatId}
          onChatSelect={handleChatSelect}
          onDeleteChat={handleDeleteChat}
        />

        <main className="flex-1 overflow-hidden">
          {activeView === "home" && <MarketInsights />}
          {activeView === "chat" && <EnhancedChat />}
          {activeView === "portfolio" && <PortfolioDashboard />}
          {activeView === "add-property" && <PropertyForm />}
          {activeView === "images" && <ImageGallery />}
          {activeView === "calculator" && <PropertyCalculator />}
        </main>

        <Toaster />
      </div>
    </SidebarProvider>
  )
}
