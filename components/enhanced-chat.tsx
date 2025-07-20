"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import {
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
  PresentationIcon as PresentationChart,
  FileSpreadsheet,
  FileImage,
  Download,
  Edit3,
  ArrowUp,
  ArrowDown,
  Minus,
  Send,
} from "lucide-react"
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

interface MarketData {
  state: string
  population_growth: number
  job_growth: number
  house_price_index_growth: number
  net_migration: number
  vacancy_rate: number
  international_inflows: number
  single_family_permits: number
  multi_family_permits: number
  lastUpdated: Date
  trends: {
    population_growth: "up" | "down" | "stable"
    job_growth: "up" | "down" | "stable"
    house_price_index_growth: "up" | "down" | "stable"
    net_migration: "up" | "down" | "stable"
    vacancy_rate: "up" | "down" | "stable"
    international_inflows: "up" | "down" | "stable"
    single_family_permits: "up" | "down" | "stable"
    multi_family_permits: "up" | "down" | "stable"
  }
  reasons: string[]
  score?: number
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
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [topStates, setTopStates] = useState<MarketData[]>([])
  const previousDataRef = useRef<Map<string, MarketData>>(new Map())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    } else {
      console.log("🆕 No current chat, starting fresh")
      setMessages([])
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

  /* ---------------- MARKET DATA (LIVE) ---------------- */

  const baseStates: Omit<MarketData, "trends" | "reasons" | "score">[] = [
    {
      state: "Texas",
      population_growth: 1.8,
      job_growth: 3.2,
      house_price_index_growth: 8.5,
      net_migration: 45000,
      vacancy_rate: 3.8,
      international_inflows: 12000,
      single_family_permits: 85000,
      multi_family_permits: 25000,
      lastUpdated: new Date(),
    },
    {
      state: "Florida",
      population_growth: 2.3,
      job_growth: 3.5,
      house_price_index_growth: 11.8,
      net_migration: 85000,
      vacancy_rate: 3.2,
      international_inflows: 45000,
      single_family_permits: 95000,
      multi_family_permits: 35000,
      lastUpdated: new Date(),
    },
    {
      state: "Nevada",
      population_growth: 2.1,
      job_growth: 2.8,
      house_price_index_growth: 12.3,
      net_migration: 18000,
      vacancy_rate: 4.2,
      international_inflows: 3200,
      single_family_permits: 15000,
      multi_family_permits: 8500,
      lastUpdated: new Date(),
    },
    {
      state: "Arkansas",
      population_growth: 0.8,
      job_growth: 1.5,
      house_price_index_growth: 6.8,
      net_migration: 8500,
      vacancy_rate: 5.1,
      international_inflows: 1200,
      single_family_permits: 12000,
      multi_family_permits: 2800,
      lastUpdated: new Date(),
    },
    {
      state: "Alabama",
      population_growth: 0.6,
      job_growth: 1.8,
      house_price_index_growth: 7.2,
      net_migration: 12000,
      vacancy_rate: 4.8,
      international_inflows: 1800,
      single_family_permits: 18000,
      multi_family_permits: 4200,
      lastUpdated: new Date(),
    },
    {
      state: "Georgia",
      population_growth: 1.5,
      job_growth: 2.9,
      house_price_index_growth: 9.1,
      net_migration: 35000,
      vacancy_rate: 4.1,
      international_inflows: 8500,
      single_family_permits: 42000,
      multi_family_permits: 18000,
      lastUpdated: new Date(),
    },
    {
      state: "Montana",
      population_growth: 1.2,
      job_growth: 2.1,
      house_price_index_growth: 15.2,
      net_migration: 8500,
      vacancy_rate: 2.9,
      international_inflows: 450,
      single_family_permits: 5500,
      multi_family_permits: 1200,
      lastUpdated: new Date(),
    },
    {
      state: "Ohio",
      population_growth: 0.2,
      job_growth: 1.2,
      house_price_index_growth: 5.4,
      net_migration: -5000,
      vacancy_rate: 5.8,
      international_inflows: 3200,
      single_family_permits: 28000,
      multi_family_permits: 12000,
      lastUpdated: new Date(),
    },
    {
      state: "Indiana",
      population_growth: 0.4,
      job_growth: 1.8,
      house_price_index_growth: 6.2,
      net_migration: 8000,
      vacancy_rate: 5.2,
      international_inflows: 2100,
      single_family_permits: 22000,
      multi_family_permits: 8500,
      lastUpdated: new Date(),
    },
    {
      state: "North Carolina",
      population_growth: 1.4,
      job_growth: 2.6,
      house_price_index_growth: 10.3,
      net_migration: 28000,
      vacancy_rate: 3.6,
      international_inflows: 6800,
      single_family_permits: 48000,
      multi_family_permits: 22000,
      lastUpdated: new Date(),
    },
    {
      state: "Tennessee",
      population_growth: 1.1,
      job_growth: 2.4,
      house_price_index_growth: 8.9,
      net_migration: 22000,
      vacancy_rate: 4.3,
      international_inflows: 3500,
      single_family_permits: 32000,
      multi_family_permits: 15000,
      lastUpdated: new Date(),
    },
    {
      state: "Arizona",
      population_growth: 1.9,
      job_growth: 3.1,
      house_price_index_growth: 13.1,
      net_migration: 42000,
      vacancy_rate: 3.8,
      international_inflows: 8200,
      single_family_permits: 38000,
      multi_family_permits: 18500,
      lastUpdated: new Date(),
    },
    {
      state: "Missouri",
      population_growth: 0.3,
      job_growth: 1.4,
      house_price_index_growth: 6.8,
      net_migration: 2500,
      vacancy_rate: 5.4,
      international_inflows: 2800,
      single_family_permits: 18000,
      multi_family_permits: 7500,
      lastUpdated: new Date(),
    },
    {
      state: "Michigan",
      population_growth: 0.1,
      job_growth: 1.6,
      house_price_index_growth: 7.8,
      net_migration: -2000,
      vacancy_rate: 6.1,
      international_inflows: 4200,
      single_family_permits: 25000,
      multi_family_permits: 11000,
      lastUpdated: new Date(),
    },
    {
      state: "South Carolina",
      population_growth: 1.3,
      job_growth: 2.2,
      house_price_index_growth: 9.6,
      net_migration: 18000,
      vacancy_rate: 4.5,
      international_inflows: 2800,
      single_family_permits: 28000,
      multi_family_permits: 12500,
      lastUpdated: new Date(),
    },
    {
      state: "Kentucky",
      population_growth: 0.5,
      job_growth: 1.3,
      house_price_index_growth: 5.9,
      net_migration: 3500,
      vacancy_rate: 5.7,
      international_inflows: 1500,
      single_family_permits: 15000,
      multi_family_permits: 5500,
      lastUpdated: new Date(),
    },
  ]

  const trend = (current: number, previous: number, invert = false): "up" | "down" | "stable" => {
    if (!previous) return "stable"
    const pct = ((current - previous) / Math.abs(previous)) * 100
    if (invert) {
      if (pct < -1) return "up"
      if (pct > 1) return "down"
      return "stable"
    }
    if (pct > 1) return "up"
    if (pct < -1) return "down"
    return "stable"
  }

  const score = (s: MarketData) =>
    s.population_growth * 0.2 +
    s.job_growth * 0.25 +
    s.house_price_index_growth * 0.2 +
    (s.net_migration / 1000) * 0.15 +
    (10 - s.vacancy_rate) * 0.1 +
    (s.international_inflows / 1000) * 0.05 +
    (s.single_family_permits / 1000) * 0.03 +
    (s.multi_family_permits / 1000) * 0.02

  useEffect(() => {
    const update = () => {
      const next: MarketData[] = baseStates.map((b) => {
        const prev = previousDataRef.current.get(b.state) || b

        const generated = {
          ...b,
          population_growth: Number((b.population_growth + (Math.random() - 0.5) * 0.1).toFixed(1)),
          job_growth: Number((b.job_growth + (Math.random() - 0.5) * 0.2).toFixed(1)),
          house_price_index_growth: Number((b.house_price_index_growth + (Math.random() - 0.5) * 0.5).toFixed(1)),
          net_migration: Math.round(b.net_migration + (Math.random() - 0.5) * 1000),
          vacancy_rate: Number((b.vacancy_rate + (Math.random() - 0.5) * 0.3).toFixed(1)),
          international_inflows: Math.round(b.international_inflows + (Math.random() - 0.5) * 200),
          single_family_permits: Math.round(b.single_family_permits + (Math.random() - 0.5) * 2000),
          multi_family_permits: Math.round(b.multi_family_permits + (Math.random() - 0.5) * 1000),
          lastUpdated: new Date(),
        }

        const trends = {
          population_growth: trend(generated.population_growth, prev.population_growth),
          job_growth: trend(generated.job_growth, prev.job_growth),
          house_price_index_growth: trend(generated.house_price_index_growth, prev.house_price_index_growth),
          net_migration: trend(generated.net_migration, prev.net_migration),
          vacancy_rate: trend(generated.vacancy_rate, prev.vacancy_rate, true),
          international_inflows: trend(generated.international_inflows, prev.international_inflows),
          single_family_permits: trend(generated.single_family_permits, prev.single_family_permits),
          multi_family_permits: trend(generated.multi_family_permits, prev.multi_family_permits),
        } as MarketData["trends"]

        const reasons = [
          "Strong job market attracting new residents",
          "Tech and healthcare sectors expanding rapidly",
          "High demand and limited inventory driving prices",
          "Lower cost of living compared to coastal states",
          "Tight rental market with high occupancy rates",
          "Business-friendly policies attracting foreign investment",
          "Suburban development meeting housing demand",
          "Urban densification and rental demand growth",
          "Economic uncertainty affecting rental demand",
          "Competition from neighboring states",
        ].slice(0, 3)

        const full = { ...generated, trends, reasons, score: score(generated) }
        return full
      })

      previousDataRef.current = new Map(next.map((s) => [s.state, s]))
      setMarketData(next)
      setTopStates([...next].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 6))
    }

    update()
    const id = setInterval(update, 30_000)
    return () => clearInterval(id)
  }, [])

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
        data: marketData.slice(0, 5).map((state) => ({
          state: state.state,
          roi: state.job_growth,
        })),
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

      const chartData = generateSampleChartData(currentInput.toLowerCase())

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

  // Removed Generate Video and Deep Research tools
  const aiTools = [
    { id: "ai-slides", label: "Generate Slides", icon: PresentationChart, color: "from-orange-500 to-orange-600" },
    { id: "ai-sheets", label: "Generate Sheets", icon: FileSpreadsheet, color: "from-green-500 to-green-600" },
    { id: "ai-docs", label: "Generate Docs", icon: FileText, color: "from-blue-500 to-blue-600" },
    { id: "ai-image", label: "Generate Image", icon: FileImage, color: "from-pink-500 to-pink-600" },
    { id: "download-for-me", label: "Generate Reports", icon: Download, color: "from-cyan-500 to-cyan-600" },
    {
      id: "investment-calculator",
      label: "Investment Calculator",
      icon: Calculator,
      color: "from-emerald-500 to-emerald-600",
    },
    { id: "market-insights", label: "Market Insights", icon: TrendingUp, color: "from-violet-500 to-violet-600" },
    { id: "property-analysis", label: "Property Analysis", icon: Building2, color: "from-rose-500 to-rose-600" },
  ]

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-3 w-3 text-green-600" />
      case "down":
        return <ArrowDown className="h-3 w-3 text-red-600" />
      case "stable":
        return <Minus className="h-3 w-3 text-gray-600" />
    }
  }

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      case "stable":
        return "text-gray-600"
    }
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-8 p-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MSASCOUT Super Agent</h1>
          <p className="text-gray-600">Ask anything, create anything</p>
        </div>

        {/* Chat Messages (if any) */}
        {messages.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-6">
              <div className="max-h-[600px] overflow-y-auto mb-6 space-y-4">
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
                        <span className="text-sm text-gray-600">Analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </Card>
        )}

        {/* Chat Input - Matching the provided image exactly */}
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

            {/* Chat Input matching the image design */}
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
                    placeholder="Ask anything, create anything"
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

        {/* AI Tools - Removed Generate Video and Deep Research */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {aiTools.map((tool) => (
              <Card
                key={tool.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm hover:scale-105"
                onClick={() => onToolSelect?.(tool.id)}
              >
                <CardContent className="p-4 text-center">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mx-auto mb-3`}
                  >
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-xs text-gray-900">{tool.label}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* For You Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">For You</h2>
            <p className="text-gray-600">
              Top 6 performing states with live market trends and analysis across 8 key investment variables
            </p>
          </div>

          {/* Top 6 States with Detailed Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topStates.map((state, index) => (
              <Card key={state.state} className="border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`px-2 py-1 text-xs ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                            : index === 1
                              ? "bg-gray-100 text-gray-800 border-gray-300"
                              : index === 2
                                ? "bg-orange-100 text-orange-800 border-orange-300"
                                : "bg-blue-100 text-blue-800 border-blue-300"
                        }`}
                      >
                        #{index + 1}
                      </Badge>
                      <CardTitle className="text-lg font-bold">{state.state}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Variables with trends */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Population Growth</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(state.trends.population_growth)}
                        <span className={`font-semibold text-sm ${getTrendColor(state.trends.population_growth)}`}>
                          {state.population_growth}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Job Growth</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(state.trends.job_growth)}
                        <span className={`font-semibold text-sm ${getTrendColor(state.trends.job_growth)}`}>
                          {state.job_growth}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">House Price Growth</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(state.trends.house_price_index_growth)}
                        <span
                          className={`font-semibold text-sm ${getTrendColor(state.trends.house_price_index_growth)}`}
                        >
                          {state.house_price_index_growth}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Net Migration</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(state.trends.net_migration)}
                        <span className={`font-semibold text-sm ${getTrendColor(state.trends.net_migration)}`}>
                          {state.net_migration > 0 ? "+" : ""}
                          {formatNumber(state.net_migration)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Vacancy Rate</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(state.trends.vacancy_rate)}
                        <span className={`font-semibold text-sm ${getTrendColor(state.trends.vacancy_rate)}`}>
                          {state.vacancy_rate}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">International Inflows</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(state.trends.international_inflows)}
                        <span className={`font-semibold text-sm ${getTrendColor(state.trends.international_inflows)}`}>
                          {formatNumber(state.international_inflows)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Single Family Permits</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(state.trends.single_family_permits)}
                        <span className={`font-semibold text-sm ${getTrendColor(state.trends.single_family_permits)}`}>
                          {formatNumber(state.single_family_permits)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Multi Family Permits</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(state.trends.multi_family_permits)}
                        <span className={`font-semibold text-sm ${getTrendColor(state.trends.multi_family_permits)}`}>
                          {formatNumber(state.multi_family_permits)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reasons */}
                  <div className="pt-3 border-t">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Key Drivers:</h4>
                    <div className="space-y-1">
                      {state.reasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-1">
                          <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-xs text-gray-600 leading-relaxed">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 text-center pt-2 border-t">
                    Updated: {state.lastUpdated.toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* All States Market Data */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 text-center">All States Market Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketData.map((state) => (
                <Card key={state.state} className="border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">{state.state}</CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                        Live
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Population Growth</span>
                      <span className="font-semibold text-sm">{state.population_growth}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Job Growth</span>
                      <span
                        className={`font-semibold text-sm ${state.job_growth > 2.5 ? "text-green-600" : "text-gray-900"}`}
                      >
                        {state.job_growth}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">House Price Growth</span>
                      <span className="font-semibold text-sm">{state.house_price_index_growth}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Net Migration</span>
                      <span
                        className={`font-semibold text-sm ${state.net_migration > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {state.net_migration > 0 ? "+" : ""}
                        {formatNumber(state.net_migration)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Vacancy Rate</span>
                      <span
                        className={`font-semibold text-sm ${state.vacancy_rate < 4 ? "text-green-600" : "text-gray-900"}`}
                      >
                        {state.vacancy_rate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">International Inflows</span>
                      <span className="font-semibold text-sm">{formatNumber(state.international_inflows)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Single Family Permits</span>
                      <span className="font-semibold text-sm">{formatNumber(state.single_family_permits)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Multi Family Permits</span>
                      <span className="font-semibold text-sm">{formatNumber(state.multi_family_permits)}</span>
                    </div>
                    <div className="text-xs text-gray-500 text-center pt-2 border-t">
                      Updated: {state.lastUpdated.toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
