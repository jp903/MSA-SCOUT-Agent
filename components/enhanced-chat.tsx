"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Mic, User, Bot, Loader2, Paperclip, X, FileText, ImageIcon, Edit3, ArrowDown, Send } from "lucide-react"
import type { ChatHistoryItem } from "@/lib/portfolio-types"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  attachments?: FileAttachment[]
  chartData?: ChartData
}

interface FileAttachment {
  id: string
  name: string
  size: number
  type: string
  url: string
}

interface ChartData {
  type: "line" | "bar"
  title: string
  data: Array<{ [key: string]: any }>
  xKey: string
  yKey: string
}

interface EnhancedChatProps {
  onToolSelect?: (tool: string) => void
  currentChat?: ChatHistoryItem | null
  onChatUpdate?: (messages: any[], title?: string) => void
}

export default function EnhancedChat({ onToolSelect, currentChat, onChatUpdate }: EnhancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [userScrolled, setUserScrolled] = useState(false)

  /* ---------------- CHAT HISTORY LOAD / SAVE ---------------- */

  useEffect(() => {
    if (currentChat?.messages) {
      console.log("📥 Loading messages from current chat:", currentChat.messages.length)
      const loaded: Message[] = currentChat.messages.map((m: any) => ({
        id: m.id || crypto.randomUUID(),
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp || Date.now()),
        attachments: m.attachments,
        chartData: m.chartData,
      }))
      setMessages(loaded)
      setUserScrolled(false)
      // Scroll to bottom after loading
      setTimeout(() => {
        scrollToBottom(true)
      }, 100)
    } else {
      console.log("🆕 No current chat, starting fresh")
      setMessages([])
      setUserScrolled(false)
    }
  }, [currentChat])

  useEffect(() => {
    if (messages.length === 0) return

    const serialised = messages.map((m) => ({
      ...m,
      timestamp: m.timestamp.toISOString(),
    }))

    let title = "New Chat"
    if (messages.length > 0) {
      const first = messages.find((m) => m.role === "user")
      if (first) title = first.content.slice(0, 50) + (first.content.length > 50 ? "…" : "")
    }

    // Debounce the chat update to avoid too many database calls
    const timeoutId = setTimeout(() => {
      console.log("💾 Saving chat to database...")
      onChatUpdate?.(serialised, title)
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [messages, onChatUpdate])

  const scrollToBottom = (force = false) => {
    if ((force || !userScrolled) && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    // Only auto-scroll if user hasn't manually scrolled and it's the first message
    if (!userScrolled && messages.length === 1) {
      setTimeout(() => scrollToBottom(), 100)
    }
  }, [messages, userScrolled])

  // Handle scroll events to detect if user is scrolling
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50
      setUserScrolled(!isAtBottom)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newAttachments: FileAttachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const url = URL.createObjectURL(file)

      const attachment: FileAttachment = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: url,
      }

      newAttachments.push(attachment)
    }

    setAttachments((prev) => [...prev, ...newAttachments])
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const generateChartData = async (userInput: string): Promise<ChartData | null> => {
    // Check if user is asking for market analysis
    const stateMatch = userInput.match(
      /\b(Texas|Florida|Nevada|Arkansas|Alabama|Georgia|Montana|Ohio|Indiana|North Carolina|Tennessee|Arizona|Missouri|Michigan|South Carolina|Kentucky)\b/i,
    )

    if (stateMatch && (userInput.includes("market") || userInput.includes("analysis") || userInput.includes("data"))) {
      const state = stateMatch[1]
      try {
        const response = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state }),
        })

        if (response.ok) {
          const { data } = await response.json()
          return {
            type: "line",
            title: `${state} Market Analysis - Population Trend`,
            data: data.chartData.populationTrend,
            xKey: "year",
            yKey: "population",
          }
        }
      } catch (error) {
        console.error("Error fetching research data:", error)
      }
    }

    // Default chart generation
    if (userInput.includes("price") || userInput.includes("trend") || userInput.includes("growth")) {
      return {
        type: "line",
        title: "Property Price Trends",
        data: [
          { month: "Jan", price: 350000, rent: 2800 },
          { month: "Feb", price: 355000, rent: 2850 },
          { month: "Mar", price: 362000, rent: 2900 },
          { month: "Apr", price: 368000, rent: 2950 },
          { month: "May", price: 375000, rent: 3000 },
          { month: "Jun", price: 382000, rent: 3050 },
        ],
        xKey: "month",
        yKey: "price",
      }
    }

    if (userInput.includes("roi") || userInput.includes("return") || userInput.includes("investment")) {
      return {
        type: "bar",
        title: "ROI by State",
        data: [
          { state: "Texas", roi: 8.5 },
          { state: "Florida", roi: 7.2 },
          { state: "Nevada", roi: 9.1 },
          { state: "Georgia", roi: 6.8 },
          { state: "Arizona", roi: 7.9 },
        ],
        xKey: "state",
        yKey: "roi",
      }
    }

    return null
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    console.log("📤 Sending message:", input.trim())

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setAttachments([])
    setIsLoading(true)

    try {
      console.log("🔄 Making API call to /api/chat")

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
            attachments: msg.attachments,
          })),
        }),
      })

      console.log("📡 API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ API error response:", errorText)
        throw new Error(`API request failed: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log("✅ API response received:", data)

      const chartData = await generateChartData(currentInput.toLowerCase())

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message || "I'm here to help with your property investment questions!",
        timestamp: new Date(),
        chartData: chartData || undefined,
      }

      setMessages((prev) => [...prev, assistantMessage])
      console.log("✅ Message added to chat")
    } catch (error) {
      console.error("❌ Error sending message:", error)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
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

  const renderChart = (chartData: ChartData) => {
    const config = {
      [chartData.yKey]: {
        label: chartData.yKey,
        color: "hsl(var(--chart-1))",
      },
    }

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-3">{chartData.title}</h4>
        <ChartContainer config={config} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartData.type === "line" ? (
              <LineChart data={chartData.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartData.xKey} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey={chartData.yKey} stroke="var(--color-price)" strokeWidth={2} />
              </LineChart>
            ) : (
              <BarChart data={chartData.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartData.xKey} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey={chartData.yKey} fill="var(--color-roi)" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    )
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-8 p-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MSASCOUT Property Investment Agent</h1>
          <p className="text-gray-600">Advanced market research and investment analysis powered by real-time data</p>
        </div>

        {/* Chat Messages (if any) */}
        {messages.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-6">
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="max-h-[600px] overflow-y-auto mb-6 space-y-4"
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                          : "bg-gray-100 border"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center gap-2 p-2 bg-black/10 rounded-lg">
                              {attachment.type.startsWith("image/") ? (
                                <ImageIcon className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                              <span className="text-xs">{attachment.name}</span>
                              <span className="text-xs opacity-70">({formatFileSize(attachment.size)})</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {message.chartData && renderChart(message.chartData)}

                      <p className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 border rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">Analyzing market data...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Scroll to bottom button */}
              {userScrolled && (
                <div className="flex justify-center mb-4">
                  <Button
                    onClick={() => {
                      setUserScrolled(false)
                      scrollToBottom(true)
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    <ArrowDown className="h-4 w-4 mr-2" />
                    Scroll to bottom
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Chat Input */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
          <div className="p-6">
            {/* File Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 rounded-2xl">
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
                      {attachment.type.startsWith("image/") ? (
                        <ImageIcon className="h-4 w-4 text-blue-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="text-sm">{attachment.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(attachment.size)})</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAttachment(attachment.id)}
                        className="h-6 w-6 p-0 hover:bg-red-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="relative">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border-2 border-gray-200 focus-within:border-blue-500 transition-colors">
                {/* Left side icons */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200 rounded-full">
                    <Edit3 className="h-4 w-4 text-gray-600" />
                  </Button>
                </div>

                {/* Input field */}
                <div className="flex-1">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about market trends, property analysis, or investment opportunities..."
                    className="border-0 bg-transparent text-lg placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                    disabled={isLoading}
                  />
                </div>

                {/* Right side icons */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 w-8 p-0 hover:bg-gray-200 rounded-full"
                  >
                    <Paperclip className="h-4 w-4 text-gray-600" />
                  </Button>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-200 rounded-full"
                          disabled
                        >
                          <Mic className="h-4 w-4 text-gray-400" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Voice input launching soon!</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 rounded-full"
                    variant="ghost"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <Send className="h-4 w-4 text-white" />
                    )}
                  </Button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.jpg,.jpeg,.png,.gif"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
