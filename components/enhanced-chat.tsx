"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import {
  Send,
  Mic,
  Calculator,
  TrendingUp,
  Building2,
  User,
  Bot,
  Loader2,
  Paperclip,
  X,
  FileText,
  ImageIcon,
} from "lucide-react"

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
}

export default function EnhancedChat({ onToolSelect }: EnhancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI property investment assistant. I can help you analyze properties, calculate investment returns, provide market insights, and generate charts. You can also attach files for analysis. What would you like to explore today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newAttachments: FileAttachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Create a URL for the file
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

  const generateSampleChartData = (type: string): ChartData | null => {
    if (type.includes("price") || type.includes("trend") || type.includes("growth")) {
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

    if (type.includes("roi") || type.includes("return") || type.includes("investment")) {
      return {
        type: "bar",
        title: "ROI by State",
        data: [
          { state: "TX", roi: 12.5 },
          { state: "FL", roi: 11.8 },
          { state: "NV", roi: 10.2 },
          { state: "AR", roi: 14.1 },
          { state: "AL", roi: 13.6 },
        ],
        xKey: "state",
        yKey: "roi",
      }
    }

    if (type.includes("market") || type.includes("comparison")) {
      return {
        type: "bar",
        title: "Market Comparison",
        data: [
          { metric: "Price Growth", value: 8.5 },
          { metric: "Rental Yield", value: 6.8 },
          { metric: "Vacancy Rate", value: 4.2 },
          { metric: "Population Growth", value: 2.1 },
        ],
        xKey: "metric",
        yKey: "value",
      }
    }

    return null
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

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

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Check if response should include a chart
      const chartData = generateSampleChartData(currentInput.toLowerCase())

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        chartData: chartData || undefined,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
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

  const quickActions = [
    {
      id: "investment-calculator",
      label: "Investment Calculator",
      icon: Calculator,
      description: "Calculate ROI and cash flow",
    },
    {
      id: "market-insights",
      label: "Market Insights",
      icon: TrendingUp,
      description: "Get real-time market data",
    },
    {
      id: "property-analysis",
      label: "Property Analysis",
      icon: Building2,
      description: "Analyze specific properties",
    },
  ]

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <div className="flex-shrink-0 p-4 bg-white border-b">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="tools">Quick Tools</TabsTrigger>
            <TabsTrigger value="insights">Live Market Data</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col m-0">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      : "bg-white border shadow-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                  {/* Render attachments */}
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

                  {/* Render chart if present */}
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
                <div className="bg-white border shadow-sm rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* File Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex-shrink-0 p-4 bg-gray-50 border-t">
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
          <div className="flex-shrink-0 p-4 bg-white border-t">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0"
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about investments, request charts, or attach files for analysis..."
                  className="pr-12 py-3 text-sm"
                  disabled={isLoading}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
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
              </div>

              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
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
        </TabsContent>

        <TabsContent value="tools" className="flex-1 m-0 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Card
                key={action.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm"
                onClick={() => onToolSelect?.(action.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{action.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="flex-1 m-0 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Live Market Data</h2>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">National Median Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">$425,000</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      +5.2%
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">vs last quarter</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Average ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-blue-600">12.8%</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Strong
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">annual return</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Hot Markets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-purple-600">TX, FL, NV</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      Top 3
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">growth states</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Market Sentiment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-orange-600">Bullish</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      85/100
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">investor confidence</p>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Market Chart */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Market Trends (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    price: {
                      label: "Median Price",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Aug", price: 410000, volume: 1250 },
                        { month: "Sep", price: 415000, volume: 1180 },
                        { month: "Oct", price: 418000, volume: 1320 },
                        { month: "Nov", price: 422000, volume: 1150 },
                        { month: "Dec", price: 425000, volume: 1280 },
                        { month: "Jan", price: 425000, volume: 1200 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="price" stroke="var(--color-price)" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
