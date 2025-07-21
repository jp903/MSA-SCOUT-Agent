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
import { Home, MessageSquare, Calculator, TrendingUp, Plus, Trash2, MoreHorizontal } from "lucide-react"
import type { ChatHistoryItem } from "@/lib/portfolio-types"

interface AppSidebarProps {
  activeView: "home" | "chat" | "calculator" | "insights"
  onViewChange: (view: "home" | "chat" | "calculator" | "insights") => void
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

  /* ————————————————————— NAV ITEMS ————————————————————— */
  const menuItems = [
    {
      id: "home" as const, // points to the dashboard page
      label: "Chat",
      icon: Home,
      description: "AI Assistant Chat",
    },
    {
      id: "chat" as const, // points to the chat page
      label: "Home",
      icon: MessageSquare,
      description: "Dashboard & Tools",
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

  /* ————————————————————— HELPERS ————————————————————— */
  const formatChatTitle = (chat: ChatHistoryItem) => {
    if (chat.title && chat.title !== "New Chat") {
      return chat.title.length > 30 ? chat.title.slice(0, 30) + "…" : chat.title
    }
    const firstUserMsg = chat.messages?.find((m) => m.role === "user")
    if (firstUserMsg?.content) {
      const content = firstUserMsg.content.slice(0, 30)
      return content.length > 30 ? content + "…" : content
    }
    return "New Chat"
  }

  const formatChatDate = (date: Date) => {
    const now = Date.now()
    const diffHrs = (now - date.getTime()) / 3600000
    if (diffHrs < 1) return "Just now"
    if (diffHrs < 24) return `${Math.floor(diffHrs)}h ago`
    if (diffHrs < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  /* ————————————————————— RENDER ————————————————————— */
  return (
    <Sidebar className="border-r bg-white" collapsible="icon">
      {/* -------- Header -------- */}
      <SidebarHeader className="border-b p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <span className="text-sm font-bold text-white">MS</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">MSASCOUT</h2>
            <p className="text-xs text-gray-500">Property AI Agent</p>
          </div>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </SidebarHeader>

      {/* -------- Content -------- */}
      <SidebarContent className="p-4">
        {/* Navigation */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-gray-700">Navigation</h3>
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

        {/* Chat history */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Recent Chats</h3>
            <Badge variant="secondary" className="text-xs">
              {chatHistory.length}
            </Badge>
          </div>

          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {chatHistory.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">No chats yet</p>
                  <p className="text-xs text-gray-400">Start a conversation!</p>
                </CardContent>
              </Card>
            ) : (
              chatHistory.map((chat) => (
                <Card
                  key={chat.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    currentChatId === chat.id ? "bg-blue-50 ring-2 ring-blue-500" : "hover:bg-gray-50"
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1" onClick={() => onChatSelect(chat.id)}>
                        <h4 className="truncate text-sm font-medium text-gray-900">{formatChatTitle(chat)}</h4>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-xs text-gray-500">{chat.messages?.length ?? 0} messages</p>
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
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
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
