"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Search, Trash2, Clock, TrendingUp, Calculator, Building2, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ChatHistoryItem {
  id: string
  title: string
  timestamp: string
}

interface ChatHistoryProps {
  chatHistory: ChatHistoryItem[]
  onChatSelect: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
}

export default function ChatHistory({ chatHistory, onChatSelect, onDeleteChat }: ChatHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const chatTime = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - chatTime.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return chatTime.toLocaleDateString()
  }

  const getChatIcon = (title: string) => {
    if (title.toLowerCase().includes("calculator") || title.toLowerCase().includes("roi")) {
      return <Calculator className="h-5 w-5 text-green-600" />
    }
    if (title.toLowerCase().includes("market") || title.toLowerCase().includes("insights")) {
      return <TrendingUp className="h-5 w-5 text-purple-600" />
    }
    if (title.toLowerCase().includes("property") || title.toLowerCase().includes("analysis")) {
      return <Building2 className="h-5 w-5 text-orange-600" />
    }
    return <MessageSquare className="h-5 w-5 text-blue-600" />
  }

  const getChatType = (title: string) => {
    if (title.toLowerCase().includes("calculator") || title.toLowerCase().includes("roi")) {
      return { label: "Calculator", color: "bg-green-100 text-green-700" }
    }
    if (title.toLowerCase().includes("market") || title.toLowerCase().includes("insights")) {
      return { label: "Market", color: "bg-purple-100 text-purple-700" }
    }
    if (title.toLowerCase().includes("property") || title.toLowerCase().includes("analysis")) {
      return { label: "Analysis", color: "bg-orange-100 text-orange-700" }
    }
    return { label: "Chat", color: "bg-blue-100 text-blue-700" }
  }

  const filteredChats = chatHistory.filter((chat) => chat.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const groupChatsByDate = (chats: ChatHistoryItem[]) => {
    const groups: { [key: string]: ChatHistoryItem[] } = {}

    chats.forEach((chat) => {
      const chatDate = new Date(chat.timestamp)
      const now = new Date()
      const diffInDays = Math.floor((now.getTime() - chatDate.getTime()) / (1000 * 60 * 60 * 24))

      let groupKey = ""
      if (diffInDays === 0) groupKey = "Today"
      else if (diffInDays === 1) groupKey = "Yesterday"
      else if (diffInDays < 7) groupKey = "This Week"
      else if (diffInDays < 30) groupKey = "This Month"
      else groupKey = "Older"

      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(chat)
    })

    return groups
  }

  const groupedChats = groupChatsByDate(filteredChats)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat History</h1>
        <p className="text-gray-600">Your conversations with MSASCOUT AI Agent</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{chatHistory.length}</div>
            <div className="text-sm text-gray-600">Total Chats</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calculator className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {chatHistory.filter((c) => c.title.toLowerCase().includes("calculator")).length}
            </div>
            <div className="text-sm text-gray-600">Calculations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {chatHistory.filter((c) => c.title.toLowerCase().includes("market")).length}
            </div>
            <div className="text-sm text-gray-600">Market Insights</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Building2 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {chatHistory.filter((c) => c.title.toLowerCase().includes("property")).length}
            </div>
            <div className="text-sm text-gray-600">Property Analysis</div>
          </CardContent>
        </Card>
      </div>

      {/* Chat History */}
      <div className="space-y-6">
        {Object.entries(groupedChats).map(([groupName, chats]) => (
          <div key={groupName}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              {groupName}
            </h3>
            <div className="space-y-3">
              {chats.map((chat) => {
                const chatType = getChatType(chat.title)
                return (
                  <Card
                    key={chat.id}
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => onChatSelect(chat.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">{getChatIcon(chat.title)}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {chat.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs ${chatType.color}`}>{chatType.label}</Badge>
                              <span className="text-sm text-gray-500">{getTimeAgo(chat.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onChatSelect(chat.id)}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Open Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteChat(chat.id)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredChats.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No chats found" : "No chat history yet"}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start a conversation with MSASCOUT AI Agent to see your chat history here"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
