"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Calculator, TrendingUp, Building2, BarChart3, Users, Loader2, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { ChatHistoryItem } from "@/lib/portfolio-types"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface EnhancedChatProps {
  onToolSelect: (toolId: string) => void
  currentChat: ChatHistoryItem | null
  onChatUpdate: (messages: Message[], title?: string) => void
}

export default function EnhancedChat({ onToolSelect, currentChat, onChatUpdate }: EnhancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load messages from current chat
  useEffect(() => {
    if (currentChat?.messages) {
      console.log("📥 Loading messages from current chat:", currentChat.id)
      const formattedMessages = currentChat.messages.map((msg: any) => ({
        id: msg.id || crypto.randomUUID(),
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp || Date.now()),
      }))
      setMessages(formattedMessages)
    } else {
      console.log("🆕 Starting with empty messages")
      setMessages([])
    }
  }, [currentChat])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      console.log("📤 Sending message to chat API...")

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("📥 Received response from chat API")

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      }

      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)

      // Generate title from first user message if this is a new chat
      const chatTitle =
        messages.length === 0
          ? userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? "..." : "")
          : undefined

      // Update chat in database
      onChatUpdate(finalMessages, chatTitle)

      console.log("✅ Message sent and response received successfully")
    } catch (error) {
      console.error("❌ Error sending message:", error)
      setError(error instanceof Error ? error.message : "Failed to send message")

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActions = [
    {
      id: "investment-calculator",
      label: "Investment Calculator",
      icon: Calculator,
      description: "Calculate ROI and cash flow",
      color: "bg-emerald-500",
    },
    {
      id: "market-insights",
      label: "Market Insights",
      icon: TrendingUp,
      description: "Real-time market data",
      color: "bg-violet-500",
    },
    {
      id: "property-analysis",
      label: "Property Analysis",
      icon: Building2,
      description: "Analyze property details",
      color: "bg-rose-500",
    },
    {
      id: "market-research",
      label: "Market Research",
      icon: BarChart3,
      description: "Research market trends",
      color: "bg-blue-500",
    },
  ]

  const suggestedQuestions = [
    "What are the best states for real estate investment in 2024?",
    "How do I calculate cash flow for a rental property?",
    "What market indicators should I watch for property investment?",
    "Compare Texas vs Florida real estate markets",
    "What's the current mortgage rate trend?",
    "How to analyze a property's investment potential?",
  ]

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Chat Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                <span className="text-sm font-bold text-white">MS</span>
              </div>
              <div>
                <CardTitle className="text-lg">MSASCOUT AI Assistant</CardTitle>
                <p className="text-sm text-gray-600">Property Investment Research Agent</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Online
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to MSASCOUT</h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    I'm your AI property investment research agent. Ask me about market analysis, ROI calculations, or
                    any real estate investment questions.
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center gap-2 hover:shadow-md transition-all bg-transparent"
                      onClick={() => onToolSelect(action.id)}
                    >
                      <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center`}>
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium">{action.label}</p>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Suggested Questions */}
                <div className="w-full max-w-2xl">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Suggested Questions:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="h-auto p-3 text-left justify-start text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        onClick={() => setInput(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
                          MS
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>

                    {message.role === "user" && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gray-600 text-white text-xs">You</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
                        MS
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">MSASCOUT is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <Separator />

        {/* Input Area */}
        <div className="p-4">
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about real estate investments, market analysis, or property calculations..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-2">Press Enter to send • Shift+Enter for new line</p>
        </div>
      </Card>
    </div>
  )
}
