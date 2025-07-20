"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import EnhancedChat from "@/components/enhanced-chat"
import PropertyCalculator from "@/components/property-calculator"
import MarketInsights from "@/components/market-insights"
import PortfolioDashboard from "@/components/portfolio-dashboard"
import { ChatManagerDB } from "@/lib/chat-manager-db"
import type { ChatHistoryItem } from "@/lib/portfolio-types"

export default function HomePage() {
  const [activeView, setActiveView] = useState("home")
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [currentChat, setCurrentChat] = useState<ChatHistoryItem | null>(null)

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory()
  }, [])

  const loadChatHistory = async () => {
    try {
      const history = await ChatManagerDB.getChatHistory()
      setChatHistory(history)
    } catch (error) {
      console.error("Error loading chat history:", error)
    }
  }

  const handleNewChat = async () => {
    try {
      const newChat = await ChatManagerDB.addChat("New Chat", [])
      if (newChat) {
        setCurrentChatId(newChat.id)
        setCurrentChat(newChat)
        await loadChatHistory()
      }
    } catch (error) {
      console.error("Error creating new chat:", error)
    }
  }

  const handleChatSelect = async (chatId: string) => {
    try {
      const chat = await ChatManagerDB.getChat(chatId)
      if (chat) {
        setCurrentChatId(chatId)
        setCurrentChat(chat)
      }
    } catch (error) {
      console.error("Error loading chat:", error)
    }
  }

  const handleChatUpdate = async (messages: any[], title?: string) => {
    if (currentChatId) {
      try {
        const updatedChat = await ChatManagerDB.updateChat(currentChatId, title || currentChat?.title, messages)
        if (updatedChat) {
          setCurrentChat(updatedChat)
          await loadChatHistory()
        }
      } catch (error) {
        console.error("Error updating chat:", error)
      }
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await ChatManagerDB.deleteChat(chatId)
      if (currentChatId === chatId) {
        setCurrentChatId(null)
        setCurrentChat(null)
      }
      await loadChatHistory()
    } catch (error) {
      console.error("Error deleting chat:", error)
    }
  }

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return (
          <div className="flex-1 overflow-y-auto">
            <EnhancedChat
              currentChat={currentChat}
              onChatUpdate={handleChatUpdate}
              onToolSelect={(tool) => {
                if (tool === "investment-calculator") setActiveView("calculator")
                if (tool === "market-insights") setActiveView("insights")
                if (tool === "property-analysis") setActiveView("portfolio")
              }}
            />
          </div>
        )
      case "calculator":
        return (
          <div className="flex-1 overflow-y-auto p-6">
            <PropertyCalculator />
          </div>
        )
      case "insights":
        return (
          <div className="flex-1 overflow-y-auto p-6">
            <MarketInsights />
          </div>
        )
      case "portfolio":
        return (
          <div className="flex-1 overflow-y-auto p-6">
            <PortfolioDashboard />
          </div>
        )
      default:
        return (
          <div className="flex-1 overflow-y-auto">
            <EnhancedChat
              currentChat={currentChat}
              onChatUpdate={handleChatUpdate}
              onToolSelect={(tool) => {
                if (tool === "investment-calculator") setActiveView("calculator")
                if (tool === "market-insights") setActiveView("insights")
                if (tool === "property-analysis") setActiveView("portfolio")
              }}
            />
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onDeleteChat={handleDeleteChat}
      />
      {renderContent()}
    </div>
  )
}
