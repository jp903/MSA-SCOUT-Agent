"use client"

import { useState, useEffect } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import EnhancedChat from "@/components/enhanced-chat"
import PropertyCalculator from "@/components/property-calculator"
import MarketInsights from "@/components/market-insights"

import { chatManagerDB } from "@/lib/chat-manager-db"
import type { ChatHistoryItem } from "@/lib/portfolio-types"

export default function HomePage() {
  const [activeView, setActiveView] = useState<"home" | "calculator" | "insights">("home")
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [currentChat, setCurrentChat] = useState<ChatHistoryItem | null>(null)

  /* ─────────────────────────  LOAD CHAT HISTORY  ────────────────────────── */
  useEffect(() => {
    loadChatHistory()
    initializeDatabase()
  }, [])

  async function initializeDatabase() {
    try {
      console.log("🔧 Initializing database...")
      const response = await fetch("/api/init-db", { method: "POST" })
      const result = await response.json()
      if (result.success) {
        console.log("✅ Database initialized successfully")
      } else {
        console.error("❌ Database initialization failed:", result.error)
      }
    } catch (error) {
      console.error("❌ Error initializing database:", error)
    }
  }

  async function loadChatHistory() {
    try {
      console.log("📚 Loading chat history...")
      const history = await chatManagerDB.getAllChats()
      setChatHistory(history)
      console.log(`✅ Loaded ${history.length} chats`)
    } catch (err) {
      console.error("❌ Error loading chat history:", err)
    }
  }

  /* ─────────────────────────────  CHAT CRUD  ────────────────────────────── */
  async function handleNewChat() {
    try {
      console.log("🆕 Creating new chat...")
      // Clear current chat state
      setCurrentChatId(null)
      setCurrentChat(null)
      setActiveView("home")
      console.log("✅ New chat initiated - ready for first message")
    } catch (err) {
      console.error("❌ Error creating new chat:", err)
    }
  }

  async function handleChatSelect(chatId: string) {
    try {
      console.log("📋 Selecting chat:", chatId)
      const chat = await chatManagerDB.getChat(chatId)
      if (chat) {
        setCurrentChatId(chatId)
        setCurrentChat(chat)
        setActiveView("home")
        console.log("✅ Chat selected and loaded")
      }
    } catch (err) {
      console.error("❌ Error loading chat:", err)
    }
  }

  async function handleChatUpdate(messages: any[], title?: string) {
    try {
      console.log("💾 Updating chat with", messages.length, "messages")

      // If no current chat exists, create one automatically
      if (!currentChatId && messages.length > 0) {
        console.log("🆕 Creating new chat automatically...")
        const newChat = await chatManagerDB.createChat(title || "New Chat")
        setCurrentChatId(newChat.id)

        // Update the new chat with messages
        await chatManagerDB.updateChat(newChat.id, messages, title)
        const updatedChat = await chatManagerDB.getChat(newChat.id)
        setCurrentChat(updatedChat)
        await loadChatHistory()
        console.log("✅ New chat created and saved:", newChat.id)
        return
      }

      // Update existing chat
      if (currentChatId) {
        await chatManagerDB.updateChat(currentChatId, messages, title)
        const updatedChat = await chatManagerDB.getChat(currentChatId)
        setCurrentChat(updatedChat)
        await loadChatHistory()
        console.log("✅ Chat updated:", currentChatId)
      }
    } catch (err) {
      console.error("❌ Error updating chat:", err)
    }
  }

  async function handleDeleteChat(chatId: string) {
    try {
      console.log("🗑️ Deleting chat:", chatId)
      await chatManagerDB.deleteChat(chatId)
      if (currentChatId === chatId) {
        setCurrentChatId(null)
        setCurrentChat(null)
      }
      await loadChatHistory()
      console.log("✅ Chat deleted")
    } catch (err) {
      console.error("❌ Error deleting chat:", err)
    }
  }

  /* ──────────────────────────  RENDER HELPERS  ──────────────────────────── */
  function renderContent() {
    switch (activeView) {
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
      default:
        return (
          <div className="flex-1 overflow-y-auto">
            <EnhancedChat
              currentChat={currentChat}
              onChatUpdate={handleChatUpdate}
              onToolSelect={(tool) => {
                if (tool === "investment-calculator") setActiveView("calculator")
                if (tool === "market-insights") setActiveView("insights")
              }}
            />
          </div>
        )
    }
  }

  /* ───────────────────────────────  UI  ─────────────────────────────────── */
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
