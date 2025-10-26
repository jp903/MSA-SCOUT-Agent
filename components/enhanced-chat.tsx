"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Send,
  Bot,
  User,
  Calculator,
  TrendingUp,
  Building2,
  Search,
  DollarSign,
  Loader2,
  Copy,
  Check,
  FileText,
  Presentation,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { ChatHistoryItem } from "@/lib/portfolio-types"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: string
  action?: string
  actionData?: any
}

interface EnhancedChatProps {
  onToolSelect: (toolId: string) => void
  currentChat: ChatHistoryItem | null
  onChatUpdate: (messages: Message[], title?: string) => void
}

const quickActions = [
  {
    id: "investment-calculator",
    title: "Investment Calculator",
    description: "Calculate ROI and cash flow",
    icon: Calculator,
    color: "bg-emerald-500",
  },
  {
    id: "market-insights",
    title: "Market Insights",
    description: "Real-time market data",
    icon: TrendingUp,
    color: "bg-violet-500",
  },
  {
    id: "property-analysis",
    title: "Property Analysis",
    description: "Detailed property reports",
    icon: Building2,
    color: "bg-rose-500",
  },
  {
    id: "portfolio-tracker",
    title: "Portfolio Tracker",
    description: "Track your investments",
    icon: DollarSign,
    color: "bg-amber-500",
  },
  {
    id: "deal-finder",
    title: "Deal Finder",
    description: "Find investment properties",
    icon: Search,
    color: "bg-green-500",
  },
]

const suggestedQuestions = [
  "What are the current market conditions for real estate investment?",
  "How do interest rates affect property investment returns?",
  "What markets are showing the best population growth right now?",
  "Can you analyze unemployment trends in major metros?",
  "Generate a market analysis report for Texas markets",
  "Create slides on current investment opportunities",
]

export default function EnhancedChat({ onToolSelect, currentChat, onChatUpdate }: EnhancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load current chat messages when currentChat changes
  useEffect(() => {
    if (currentChat && currentChat.messages) {
      setMessages(
        currentChat.messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp,
        })),
      )
    } else {
      setMessages([])
    }
  }, [currentChat])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      })
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy message to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async (message?: string, action?: string) => {
    const messageToSend = message || inputValue.trim()
    if (!messageToSend || isLoading) return

    const userMessage: Message = {
      id: generateMessageId(),
      content: messageToSend,
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputValue("")
    setIsLoading(true)

    try {
      console.log("🚀 Sending message to API...")

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content,
          })),
          action: action,
        }),
      })

      console.log("📡 Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ API Error:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Response received:", data)

      const aiResponse: Message = {
        id: generateMessageId(),
        content: data.message,
        sender: "ai",
        timestamp: new Date().toISOString(),
        action: data.action,
        actionData: data,
      }

      const finalMessages = [...newMessages, aiResponse]
      setMessages(finalMessages)

      // Generate title from first message if this is a new chat
      const title = messages.length === 0 ? generateChatTitle(messageToSend) : undefined

      // Update chat in parent component
      onChatUpdate(finalMessages, title)
    } catch (error) {
      console.error("❌ Chat error:", error)

      // Add error message to chat
      const errorMessage: Message = {
        id: generateMessageId(),
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        sender: "ai",
        timestamp: new Date().toISOString(),
      }

      const finalMessages = [...newMessages, errorMessage]
      setMessages(finalMessages)

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateChatTitle = (firstMessage: string): string => {
    const words = firstMessage.split(" ").slice(0, 6).join(" ")
    return words.length > 30 ? words.substring(0, 30) + "..." : words
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickAction = (actionId: string) => {
    onToolSelect(actionId)
  }

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question)
  }

  const handleDownload = (message: Message) => {
    if (message.actionData?.content && message.actionData?.filename) {
      try {
        const blob = new Blob([message.actionData.content], {
          type: message.actionData.filename.endsWith(".html") ? "text/html" : "text/plain",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = message.actionData.filename
        a.style.display = "none"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Download Started",
          description: `${message.actionData.filename} is downloading...`,
        })
      } catch (error) {
        console.error("Download error:", error)
        toast({
          title: "Download Failed",
          description: "Failed to download file. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleReportFormat = (format: "pdf" | "docx") => {
    const action = format === "pdf" ? "download_pdf" : "download_docx"
    handleSendMessage(`Generate ${format.toUpperCase()} report`, action)
  }

  const formatMessage = (content: string) => {
    // Convert markdown-style formatting to HTML
    const formatted = content
      // Headers
      .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold text-blue-600 border-b-2 border-blue-600 pb-2 mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold text-blue-700 mt-6 mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-md font-medium text-blue-800 mt-4 mb-2">$1</h3>')
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      // Code blocks
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
      // Line breaks
      .replace(/\n/g, "<br>")

    // Handle bullet points
    const lines = content.split("\n")
    let inList = false
    let result = ""

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line.startsWith("- ")) {
        if (!inList) {
          result += '<ul class="list-disc list-inside space-y-1 ml-4 my-2">'
          inList = true
        }
        result += `<li class="text-gray-700">${line.substring(2)}</li>`
      } else {
        if (inList) {
          result += "</ul>"
          inList = false
        }
        if (line) {
          result += `<p class="mb-3 text-gray-700">${line}</p>`
        }
      }
    }

    if (inList) {
      result += "</ul>"
    }

    return result
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-xl">MSASCOUT AI Assistant</h2>
          <p className="text-blue-100 text-sm">Real-time market data • Investment analysis • Report generation</p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-5 bg-gradient-to-b from-gray-50 to-gray-100">
        {messages.length === 0 ? (
          <div className="space-y-6 animate-fade-in">
            {/* Welcome Message */}
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
                <Bot className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Welcome to MSASCOUT AI
              </h3>
              <p className="text-gray-600 max-w-md mx-auto text-lg">
                I'm your AI property investment assistant with access to real-time Census, BLS, and FRED data. Ask me
                about market conditions, generate reports, or use our specialized tools.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 text-lg">Quick Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Card
                    key={action.id}
                    className={`cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 transform border-0 shadow-md bg-gradient-to-br from-white to-gray-50 animate-fade-in-up ${
                      index % 2 === 0 ? "hover:rotate-1" : "hover:-rotate-1"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleQuickAction(action.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`${action.color} rounded-xl p-3 shadow-md`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h5 className="font-bold text-base">{action.title}</h5>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 text-lg">Ask About Real-Time Market Data</h4>
              <div className="space-y-3">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-4 text-wrap bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 text-gray-700 rounded-xl"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    <span className="flex items-start">
                      <span className="mr-3 mt-1 text-blue-500">•</span>
                      {question}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-fade-in-up ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {message.sender === "ai" && (
                  <Avatar className="w-10 h-10 flex-shrink-0 shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                    message.sender === "user" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none" 
                      : "bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {message.sender === "ai" ? (
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                        />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}

                      {/* Action buttons for special responses */}
                      {message.action === "download_slides" && message.actionData && (
                        <Button
                          onClick={() => handleDownload(message)}
                          className="mt-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md"
                          size="sm"
                        >
                          <Presentation className="h-4 w-4 mr-2" />
                          Download Slides
                        </Button>
                      )}

                      {message.action === "download_pdf" && message.actionData && (
                        <Button
                          onClick={() => handleDownload(message)}
                          className="mt-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md"
                          size="sm"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download PDF Report
                        </Button>
                      )}

                      {message.action === "download_docx" && message.actionData && (
                        <Button
                          onClick={() => handleDownload(message)}
                          className="mt-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                          size="sm"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download DOCX Report
                        </Button>
                      )}

                      {message.action === "ask_report_format" && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReportFormat("pdf")}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReportFormat("docx")}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            DOCX
                          </Button>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="flex-shrink-0 h-8 w-8 p-0 ml-2 bg-gray-100 hover:bg-gray-200 text-gray-600"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <p className={`text-xs mt-2 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                {message.sender === "user" && (
                  <Avatar className="w-10 h-10 flex-shrink-0 shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700 text-white">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start animate-pulse">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-2xl rounded-bl-none p-4 shadow-md">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600">Analyzing market data...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-5 bg-gradient-to-r from-gray-100 to-gray-200 border-t border-gray-200">
        <div className="flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about market conditions, generate reports, or request analysis..."
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl border-0 shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 bg-white"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
