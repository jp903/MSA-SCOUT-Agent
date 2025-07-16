"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Search, MessageSquare, Calendar, Clock, Trash2, Eye, Plus, BarChart3 } from "lucide-react"
import type { ChatHistoryItem } from "@/lib/portfolio-types"

// Accept (and ignore) legacy props so old callers keep compiling
export function ChatHistory(_legacyProps: any = {}) {
  const [chats, setChats] = useState<ChatHistoryItem[]>([])
  const [filteredChats, setFilteredChats] = useState<ChatHistoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChat, setSelectedChat] = useState<ChatHistoryItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChatHistory()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredChats(chats)
    } else {
      const filtered = chats.filter(
        (chat) =>
          chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.messages.some((msg: any) => msg.content?.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredChats(filtered)
    }
  }, [searchQuery, chats])

  const loadChatHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/chat-history")
      if (response.ok) {
        const data = await response.json()
        setChats(data)
        setFilteredChats(data)
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    if (confirm("Are you sure you want to delete this chat?")) {
      try {
        const response = await fetch(`/api/chat-history/${chatId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          await loadChatHistory()
          if (selectedChat?.id === chatId) {
            setSelectedChat(null)
          }
        }
      } catch (error) {
        console.error("Error deleting chat:", error)
      }
    }
  }

  const createNewChat = async () => {
    try {
      const response = await fetch("/api/chat-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `New Chat - ${new Date().toLocaleDateString()}`,
          messages: [],
        }),
      })

      if (response.ok) {
        await loadChatHistory()
      }
    } catch (error) {
      console.error("Error creating new chat:", error)
    }
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

  const getTimeCategory = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 1) return "Today"
    if (diffDays <= 7) return "This Week"
    if (diffDays <= 30) return "This Month"
    return "Older"
  }

  const groupChatsByTime = (chats: ChatHistoryItem[]) => {
    const groups: { [key: string]: ChatHistoryItem[] } = {}

    chats.forEach((chat) => {
      const category = getTimeCategory(chat.createdAt)
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(chat)
    })

    return groups
  }

  const getChatStats = () => {
    const totalChats = chats.length
    const totalMessages = chats.reduce((sum, chat) => sum + chat.messages.length, 0)
    const avgMessagesPerChat = totalChats > 0 ? Math.round(totalMessages / totalChats) : 0

    return { totalChats, totalMessages, avgMessagesPerChat }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading chat history...</div>
      </div>
    )
  }

  if (selectedChat) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{selectedChat.title}</h2>
            <p className="text-muted-foreground">
              {formatDate(selectedChat.createdAt)} • {selectedChat.messages.length} messages
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleDeleteChat(selectedChat.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => setSelectedChat(null)}>
              Back to History
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chat Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {selectedChat.messages.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No messages in this chat yet.</p>
                ) : (
                  selectedChat.messages.map((message: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={message.role === "user" ? "default" : "secondary"}>
                          {message.role === "user" ? "You" : "AI"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : ""}
                        </span>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">{message.content}</p>
                      </div>
                      {index < selectedChat.messages.length - 1 && <Separator />}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = getChatStats()
  const groupedChats = groupChatsByTime(filteredChats)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chat History</h1>
        <Button onClick={createNewChat}>
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChats}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Messages/Chat</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgMessagesPerChat}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Chat History */}
      <div className="space-y-6">
        {Object.keys(groupedChats).length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No chat history</h3>
              <p className="text-muted-foreground mb-4">Start a conversation to see your chat history here</p>
              <Button onClick={createNewChat}>
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedChats).map(([category, categoryChats]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryChats.map((chat) => (
                  <Card key={chat.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base line-clamp-2">{chat.title}</CardTitle>
                          <CardDescription className="mt-1">{formatDate(chat.createdAt)}</CardDescription>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {chat.messages.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => setSelectedChat(chat)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteChat(chat.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Provide both default and named exports
export default ChatHistory
