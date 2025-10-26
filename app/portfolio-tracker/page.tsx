"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import PortfolioTracker from "@/components/portfolio-tracker"
import type { ChatHistoryItem } from "@/lib/portfolio-types"
import { chatManagerDB } from "@/lib/chat-manager-db"
import { toast } from "@/hooks/use-toast"

export default function PortfolioTrackerPage() {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  // Initialize database and load chat history on component mount
  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      // Load chat history - database will be initialized automatically when needed
      await loadChatHistory()
    } catch (error) {
      toast({
        title: "Initialization Error",
        description: "Failed to initialize the application",
        variant: "destructive",
      })
    }
  }

  const loadChatHistory = async () => {
    try {
      const response = await fetch("/api/chat-history")
      if (!response.ok) {
        // For portfolio tracker, we might not need authenticated chat history
        setChatHistory([]) // Set empty history
        return
      }
      const history = await response.json()
      setChatHistory(history)
    } catch (error) {
      // Silently fail for portfolio tracker as it may not need chat history
      setChatHistory([])
    }
  }

  const handleNewChat = async () => {
    try {
      // Navigate back to main page with new chat
      window.location.href = "/"
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
      const chat = await chatManagerDB.getChat(chatId, null) // No user context
      if (chat) {
        setCurrentChatId(chatId)
        // Navigate back to main page with selected chat
        window.location.href = `/?chat=${chatId}`
      } else {
        // Remove from history if not found
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
      await chatManagerDB.deleteChat(chatId, null) // No user context

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

  const handleViewChange = (view: string) => {
    // Navigate to main page with the selected view
    const viewMap: Record<string, string> = {
      home: "/?view=home",
      chat: "/?view=chat",
      calculator: "/?view=calculator",
      insights: "/?view=insights",
    }

    window.location.href = viewMap[view] || "/"
  }

  return (
    <SidebarProvider>
      <AppSidebar
        activeView="home" // Set as active since this is a portfolio tracker page
        onViewChange={handleViewChange}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onDeleteChat={handleDeleteChat}
        user={null}
        onSignOut={() => {}}
      />
      <SidebarInset>
        <header className="h-4" />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <PortfolioTracker />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
