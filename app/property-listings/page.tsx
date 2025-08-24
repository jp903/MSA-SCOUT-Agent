"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import PropertyListings from "@/components/property-listings"
import { toast } from "@/hooks/use-toast"
import type { ChatHistoryItem } from "@/lib/portfolio-types"

export default function PropertyListingsPage() {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeDatabase()
    loadChatHistory()
  }, [])

  const initializeDatabase = async () => {
    try {
      const response = await fetch("/api/init-db", { method: "POST" })
      if (!response.ok) {
        throw new Error("Failed to initialize database")
      }
      console.log("✅ Database initialized")
    } catch (error) {
      console.error("❌ Database initialization error:", error)
      toast({
        title: "Database Error",
        description: "Failed to initialize database",
        variant: "destructive",
      })
    }
  }

  const loadChatHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/chat-history")
      if (!response.ok) throw new Error("Failed to load chat history")

      const data = await response.json()
      setChatHistory(data.chats || [])
    } catch (error) {
      console.error("❌ Error loading chat history:", error)
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = async () => {
    try {
      const response = await fetch("/api/chat-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Chat",
          messages: [],
        }),
      })

      if (!response.ok) throw new Error("Failed to create new chat")

      const data = await response.json()
      const newChat = data.chat

      setChatHistory((prev) => [newChat, ...prev])
      setCurrentChatId(newChat.id)

      toast({
        title: "New Chat Created",
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

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat-history/${chatId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete chat")

      setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))

      if (currentChatId === chatId) {
        setCurrentChatId(null)
      }

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

  const handleViewChange = (view: "home" | "chat" | "calculator" | "insights") => {
    const routes = {
      home: "/",
      chat: "/",
      calculator: "/?view=calculator",
      insights: "/?view=insights",
    }

    window.location.href = routes[view]
  }

  return (
    <SidebarProvider>
      <AppSidebar
        activeView="home"
        onViewChange={handleViewChange}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onDeleteChat={handleDeleteChat}
      />
      <SidebarInset>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Deal Finder</h1>
            <p className="text-gray-600 mt-2">
              Search for investment properties using real estate APIs. Configure your RAPIDAPI_KEY and RENTCAST_API_KEY
              for live data.
            </p>
          </div>

          <PropertyListings />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
