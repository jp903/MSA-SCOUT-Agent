"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Home, Calculator, TrendingUp, Plus, MessageSquare, MoreHorizontal, Trash2 } from "lucide-react"
import type { ChatHistoryItem } from "@/lib/portfolio-types"

interface AppSidebarProps {
  activeView: "home" | "calculator" | "insights"
  onViewChange: (view: "home" | "calculator" | "insights") => void
  onNewChat: () => void
  chatHistory: ChatHistoryItem[]
  currentChatId: string | null
  onChatSelect: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
}

export function AppSidebar({
  activeView,
  onViewChange,
  onNewChat,
  chatHistory,
  currentChatId,
  onChatSelect,
  onDeleteChat,
}: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    {
      id: "home" as const,
      label: "Chat",
      icon: Home,
      description: "AI Assistant Chat",
    },
    {
      id: "calculator" as const,
      label: "Calculator",
      icon: Calculator,
      description: "Investment Calculator",
    },
    {
      id: "insights" as const,
      label: "Market Insights",
      icon: TrendingUp,
      description: "Market Analysis",
    },
  ]

  const formatChatTitle = (chat: ChatHistoryItem) => {
    if (chat.title && chat.title !== "New Chat") {
      return chat.title.length > 30 ? chat.title.slice(0, 30) + "..." : chat.title
    }

    // Try to get title from first user message
    const firstUserMessage = chat.messages?.find((m: any) => m.role === "user")
    if (firstUserMessage?.content) {
      const content = firstUserMessage.content.slice(0, 30)
      return content.length > 30 ? content + "..." : content
    }

    return "New Chat"
  }

  const formatChatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <Sidebar className="border-r bg-white">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">MS</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">MSASCOUT</h2>
            <p className="text-xs text-gray-500">Property AI Agent</p>
          </div>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent className="p-4">
        {/* Navigation Menu */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Navigation</h3>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => onViewChange(item.id)}
                  isActive={activeView === item.id}
                  className="w-full justify-start"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {/* Chat History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Recent Chats</h3>
            <Badge variant="secondary" className="text-xs">
              {chatHistory.length}
            </Badge>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {chatHistory.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No chats yet</p>
                  <p className="text-xs text-gray-400">Start a conversation!</p>
                </CardContent>
              </Card>
            ) : (
              chatHistory.map((chat) => (
                <Card
                  key={chat.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    currentChatId === chat.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0" onClick={() => onChatSelect(chat.id)}>
                        <h4 className="font-medium text-sm text-gray-900 truncate">{formatChatTitle(chat)}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">{chat.messages?.length || 0} messages</p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-400">{formatChatDate(new Date(chat.updatedAt))}</p>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-200">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onDeleteChat(chat.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
