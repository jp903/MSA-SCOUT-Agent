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
import ReactMarkdown from "react-markdown"

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

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

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

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white rounded-t-lg">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">MSASCOUT AI Assistant</h2>
          <p className="text-sm text-gray-600">Real-time market data • Investment analysis • Report generation</p>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to MSASCOUT AI</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                I'm your AI property investment assistant with access to real-time Census, BLS, and FRED data. Ask me
                about market conditions, generate reports, or use our specialized tools.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Quick Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {quickActions.map((action) => (
                  <Card
                    key={action.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                    onClick={() => handleQuickAction(action.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-medium text-sm">{action.title}</h5>
                          <p className="text-xs text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Ask About Real-Time Market Data</h4>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-3 text-wrap bg-transparent"
                    onClick={() => handleSuggestedQuestion(question)}
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
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "ai" && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user" ? "bg-blue-600 text-white" : "bg-white border shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {message.sender === "ai" ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => (
                                <h1 className="text-xl font-bold text-blue-900 mb-3 border-b-2 border-blue-200 pb-2">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-lg font-semibold text-blue-800 mb-2 mt-4">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-base font-medium text-blue-700 mb-2 mt-3">{children}</h3>
                              ),
                              ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>,
                              li: ({ children }) => <li className="text-sm">{children}</li>,
                              p: ({ children }) => <p className="text-sm mb-2 last:mb-0">{children}</p>,
                              strong: ({ children }) => (
                                <strong className="font-semibold text-blue-900">{children}</strong>
                              ),
                              code: ({ children }) => (
                                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-blue-200 pl-3 italic text-gray-700 my-2">
                                  {children}
                                </blockquote>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}

                      {/* Action buttons for special responses */}
                      {message.action === "download_slides" && message.actionData && (
                        <Button
                          onClick={() => handleDownload(message)}
                          className="mt-3 bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <Presentation className="h-4 w-4 mr-2" />
                          Download Slides
                        </Button>
                      )}

                      {message.action === "download_pdf" && message.actionData && (
                        <Button
                          onClick={() => handleDownload(message)}
                          className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                          size="sm"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download PDF Report
                        </Button>
                      )}

                      {message.action === "download_docx" && message.actionData && (
                        <Button
                          onClick={() => handleDownload(message)}
                          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Download DOCX Report
                        </Button>
                      )}

                      {message.action === "ask_report_format" && (
                        <div className="mt-3 space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleReportFormat("pdf")}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReportFormat("docx")}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
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
                      className="flex-shrink-0 h-6 w-6 p-0 ml-2"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  <p className={`text-xs mt-2 ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                {message.sender === "user" && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-gray-600 text-white">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border shadow-sm rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
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
      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about market conditions, generate reports, or request analysis..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
