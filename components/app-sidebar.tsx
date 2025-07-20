"use client"

import { useState } from "react"
import {
  Building2,
  Calculator,
  Plus,
  Settings,
  TrendingUp,
  User,
  HelpCircle,
  LogIn,
  Home,
  MessageSquare,
  Trash2,
  Clock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ChatHistoryItem } from "@/lib/portfolio-types"

interface AppSidebarProps {
  activeView?: string
  onViewChange?: (view: string) => void
  onNewChat?: () => void
  chatHistory?: ChatHistoryItem[]
  currentChatId?: string | null
  onChatSelect?: (chatId: string) => void
  onDeleteChat?: (chatId: string) => void
}

export function AppSidebar({
  activeView = "home",
  onViewChange,
  onNewChat,
  chatHistory = [],
  currentChatId,
  onChatSelect,
  onDeleteChat,
}: AppSidebarProps) {
  const [showChatHistory, setShowChatHistory] = useState(false)

  const handleNewChat = () => {
    console.log("🆕 New chat button clicked")
    onViewChange?.("home")
    onNewChat?.()
    setShowChatHistory(false)
  }

  const handleChatSelect = (chatId: string) => {
    console.log("📋 Chat selected:", chatId)
    onViewChange?.("home")
    onChatSelect?.(chatId)
    setShowChatHistory(false)
  }

  const formatChatTitle = (chat: ChatHistoryItem) => {
    if (chat.title && chat.title !== "New Chat") {
      return chat.title.length > 20 ? chat.title.substring(0, 20) + "..." : chat.title
    }

    // Generate title from first message if available
    if (chat.messages && chat.messages.length > 0) {
      const firstUserMessage = chat.messages.find((msg: any) => msg.role === "user")
      if (firstUserMessage) {
        const content = firstUserMessage.content
        return content.length > 20 ? content.substring(0, 20) + "..." : content
      }
    }

    return "New Chat"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  if (showChatHistory) {
    return (
      <div className="h-full w-80 bg-white border-r flex flex-col shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Chat History</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowChatHistory(false)} className="h-8 w-8 p-0">
            ×
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b">
          <Button
            onClick={handleNewChat}
            className="w-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat History List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chat history yet</p>
                <p className="text-xs">Start a new conversation!</p>
              </div>
            ) : (
              chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                    currentChatId === chat.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleChatSelect(chat.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 truncate">{formatChatTitle(chat)}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{formatDate(chat.updatedAt)}</span>
                        {chat.messages && (
                          <Badge variant="secondary" className="text-xs">
                            {chat.messages.length} msgs
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteChat?.(chat.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="h-full w-20 bg-white border-r flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
          <Building2 className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-2 space-y-2">
        <Button
          onClick={handleNewChat}
          className="w-full h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white flex-col gap-1 p-2"
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs">New</span>
        </Button>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setShowChatHistory(true)}
                variant="ghost"
                className="w-full h-12 rounded-xl flex-col gap-1 p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 relative"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">History</span>
                {chatHistory.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-blue-600 text-white"
                  >
                    {chatHistory.length > 99 ? "99+" : chatHistory.length}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Chat History ({chatHistory.length})</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          onClick={() => onViewChange?.("home")}
          variant={activeView === "home" ? "default" : "ghost"}
          className={`w-full h-12 rounded-xl flex-col gap-1 p-2 ${
            activeView === "home"
              ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <Home className="h-4 w-4" />
          <span className="text-xs">Chat</span>
        </Button>

        <Button
          onClick={() => onViewChange?.("calculator")}
          variant={activeView === "calculator" ? "default" : "ghost"}
          className={`w-full h-12 rounded-xl flex-col gap-1 p-2 ${
            activeView === "calculator"
              ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span className="text-xs">Calc</span>
        </Button>

        <Button
          onClick={() => onViewChange?.("insights")}
          variant={activeView === "insights" ? "default" : "ghost"}
          className={`w-full h-12 rounded-xl flex-col gap-1 p-2 ${
            activeView === "insights"
              ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs">Market</span>
        </Button>
      </div>

      {/* Footer */}
      <div className="p-2 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full h-10 rounded-xl bg-gray-100 hover:bg-gray-200 p-0">
              <User className="h-4 w-4 text-gray-700" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-48">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              Support
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
