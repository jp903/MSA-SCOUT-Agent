"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Share, ArrowLeft, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ChatInterface from "@/components/chat-interface"
import type { ChatHistoryItem } from "@/lib/portfolio-types"
import { chatManagerDB } from "@/lib/chat-manager-db"
import { toast } from "@/hooks/use-toast"

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const chatId = params.id as string
  const [currentChat, setCurrentChat] = useState<ChatHistoryItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadChat()
  }, [chatId])

  const loadChat = async () => {
    try {
      console.log("📋 Loading chat:", chatId)
      const chat = await chatManagerDB.getChat(chatId)
      if (chat) {
        setCurrentChat(chat)
        console.log("✅ Chat loaded:", chat.title)
      } else {
        console.warn("⚠️ Chat not found:", chatId)
        toast({
          title: "Chat Not Found",
          description: "This chat may have been deleted",
          variant: "destructive",
        })
        router.push("/")
      }
    } catch (error) {
      console.error("❌ Error loading chat:", error)
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChatUpdate = async (messages: any[], title?: string) => {
    try {
      console.log("💾 Updating chat with", messages.length, "messages")
      await chatManagerDB.updateChat(chatId, messages, title)

      // Update local state
      if (currentChat) {
        setCurrentChat({
          ...currentChat,
          messages,
          title: title || currentChat.title,
          updatedAt: new Date(),
        })
      }

      console.log("✅ Chat updated successfully:", chatId)
    } catch (error) {
      console.error("❌ Error updating chat:", error)
      toast({
        title: "Error",
        description: "Failed to save chat",
        variant: "destructive",
      })
    }
  }

  const handleShareChat = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      toast({
        title: "Link Copied",
        description: "Chat link has been copied to clipboard",
      })
    } catch (error) {
      console.error("❌ Error copying link:", error)
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const handleDeleteChat = async () => {
    try {
      console.log("🗑️ Deleting chat:", chatId)
      await chatManagerDB.deleteChat(chatId)
      console.log("✅ Chat deleted:", chatId)
      toast({
        title: "Chat Deleted",
        description: "Chat has been removed",
      })
      router.push("/")
    } catch (error) {
      console.error("❌ Error deleting chat:", error)
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-lg">MS</span>
          </div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mr-2 h-4" />

        <Breadcrumb className="flex-1">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">{currentChat?.title || "Chat"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShareChat}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDeleteChat} className="text-red-600">
                Delete Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface currentChat={currentChat} onChatUpdate={handleChatUpdate} isFullPage={true} />
      </div>
    </div>
  )
}
